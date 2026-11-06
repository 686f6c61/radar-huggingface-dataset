# primecai/fixer-vace-self-forcing

## Resumen

Fixer VACE Self-Forcing es un checkpoint intermedio de un estudiante de destilación para reparación de vídeo (video-to-video) construido sobre la arquitectura Wan2.1-VACE de 1.3B parámetros. Lo desarrolla el usuario primecai y se publica como paquete de inferencia en Hugging Face. El modelo toma un vídeo borrador (draft) codificado en latentes Wan ya normalizados y predice un flujo de 16 canales que corrige ese borrador, usando una rama de control VACE que recibe 96 canales formados por el latente inactivo archivado, el latente del borrador y una máscara de unos.

Se trata de la iteración 800 del estudiante Self-Forcing, tras 1.000 actualizaciones de warm-start con flow-matching causal. No es un pipeline estándar de Diffusers, sino un state dict personalizado (Fixer/FastGen) que requiere el entorno FastGen de NVlabs en un commit concreto. El paquete incluye únicamente los pesos del estudiante (8,8 GB en FP32), el contexto de texto vacío archivado, el tensor `vace_inactive` y scripts de carga y reparación.

Su relevancia es acotada: es un checkpoint intermedio de investigación, no un modelo listo para producción. Sirve para reproducir la evaluación cualitativa del autor y para estudiar la técnica Self-Forcing aplicada a reparación de vídeo con VACE, pero carece de licencia declarada, de benchmarks amplios y de pesos del profesor, discriminador o estados de optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (flow-matching) sobre Wan2.1-VACE-1.3B, con rama backbone principal (16 canales de entrada/salida) y rama de control VACE (96 canales de condicionamiento) |
| Parametros totales | Aproximadamente 1.3B (arquitectura Wan2.1-VACE-1.3B), no confirmado explícitamente en la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 21 fotogramas latentes por clip (equivalente a vídeos de 81 fotogramas a 832×480); inferencia causal de un fotograma latente por chunk |
| Tipos de cuantizacion | No disponible (pesos exportados en FP32; inferencia en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `student.safetensors` (FP32, nombres `transformer.*`), más `empty_prompt_context.pt` y `vace_inactive.pt` |

## Arquitectura y entrenamiento

El modelo es un estudiante de destilación de flujo (flow-matching) con arquitectura Wan2.1-VACE de 1.3B parámetros. El backbone principal recibe un latente ruidoso de 16 canales y predice un flujo de 16 canales; la rama de control VACE recibe 96 canales resultantes de concatenar el latente inactivo archivado (`vace_inactive`), el latente del borrador y una máscara de unos, con forma `[B,96,21,60,104]`. La inferencia es causal, procesando un fotograma latente por chunk, con cuatro pasos de denoising SDE y actualizaciones de KV-cache tanto en el backbone como en la rama VACE. El condicionamiento de texto es el contexto vacío archivado, con CFG 1.

El entrenamiento consta de dos fases. Primero, un warm-start de 1.000 actualizaciones de flow-matching causal con LR 5e-5. Después, la fase Self-Forcing con DMD2 más GAN, LR 5e-6 y una actualización del estudiante por cada cinco iteraciones externas de SF. Cada ejecución emplea 32 GPU H200 en cuatro nodos, batch global 64, microbatch 2 y sin acumulación de gradientes. El profesor de inicialización es el teacher VACE Fixer en el paso 5873. La innovación destacable es el uso de Self-Forcing (destilación con DMD2 y GAN) para reducir a cuatro pasos el muestreo de un modelo que el profesor ejecuta en 50 pasos, manteniendo la inferencia causal y el KV-cache.

## Capacidades

- Reparación de vídeo (video-to-video): corrige un borrador de vídeo a partir de sus latentes Wan normalizados.
- Generación de flujo latente de 16 canales condicionado por la rama VACE de 96 canales.
- Inferencia causal con KV-cache en backbone y rama VACE, un fotograma latente por chunk.
- Muestreo rápido en cuatro pasos SDE (sigmas `[0.999,0.937,0.833,0.624,0.0]`).
- Condicionamiento de texto mediante embedding vacío archivado (CFG 1); no se documenta soporte de prompts de texto arbitrarios.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Reproducción de la evaluación del autor: cargar el paquete con `load_student.py` y ejecutar `repair_latents` sobre los ejemplos de `expected_results/examples/` para verificar la receta de muestreo (semilla, ruido inicial en CPU FP32, SDE con `seed + 100000`).
- Investigación en destilación de modelos de vídeo: comparar cualitativamente el estudiante de cuatro pasos frente al teacher de 50 pasos usando los clips de comparación 2×2 incluidos.
- Estudio de Self-Forcing aplicado a VACE: analizar cómo DMD2 más GAN reduce pasos de muestreo en un modelo de flow-matching causal con rama de control.
- Reparación de borradores de vídeo en pipelines de investigación: dado un vídeo codificado con el VAE Wan original (dependencia separada no incluida), generar latentes borrador y aplicar el modelo para obtener latentes reparados antes de decodificar.
- Base para fine-tuning experimental: el state dict completo del estudiante (backbone más rama VACE) puede servir como inicialización, aunque el paquete no incluye profesor, discriminador ni estados de optimizador para reanudar el entrenamiento.
- Validación de infraestructura FastGen: servir como caso de prueba del entorno FastGen en el commit `c40fbea17b9a28a38528ee5254471dac4f2f9f12` con PyTorch 2.8.0, Diffusers 0.35.1, Transformers 4.49.0 y PEFT 0.17.1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente comparaciones cualitativas (input draft, reference target, teacher de 50 pasos y estudiante de 4 pasos) sobre cuatro ejemplos fijos retenidos, y medidas de tiempo de denoising en `expected_results/evaluation_report.json`; el autor advierte explícitamente que no constituyen una afirmación de que el estudiante iguale al profesor en un benchmark amplio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el paquete pesa 8,8 GB en FP32 y la inferencia se ejecuta en bfloat16, por lo que se requiere una GPU con memoria suficiente para el modelo más los latentes de 21×60×104 y el KV-cache (estimación orientativa no confirmada por el autor).
- GPU recomendadas: el entrenamiento usó 32 H200 en cuatro nodos; para inferencia no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; no se documenta.
- Opciones de despliegue: entorno FastGen de NVlabs en el commit `c40fbea17b9a28a38528ee5254471dac4f2f9f12`, con PyTorch 2.8.0, Diffusers 0.35.1, Transformers 4.49.0 y PEFT 0.17.1, y el paquete FastGen en `PYTHONPATH`. No es compatible con pipelines estándar de Diffusers, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como cifras absolutas; la model card indica que los tiempos del profesor miden solo denoising y los del estudiante incluyen preparación y verificación de condicionamiento, excluyendo carga de modelo, decodificación VAE y codificación de vídeo.
- Requiere el VAE Wan original como dependencia separada para codificar/decodificar RGB; no está incluido en el paquete.
- Configuración de precisión: `torch.backends.cuda.matmul.allow_tf32 = False` y `torch.backends.cudnn.allow_tf32 = False`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fixer VACE Self-Forcing (este) | ~1.3B | 21 fotogramas latentes (81 fotogramas a 832×480) | Estudiante Self-Forcing de 4 pasos sobre Wan2.1-VACE | No disponible | Hugging Face, paquete de inferencia |
| Wan2.1-VACE-1.3B (base) | ~1.3B | No disponible en la informacion proporcionada | Modelo VACE original de Alibaba | No disponible en la informacion proporcionada | Referenciado como dependencia de arquitectura |
| Teacher VACE Fixer step-5873 | ~1.3B | No disponible | Profesor de 50 pasos de denoising | No disponible | No incluido en el paquete |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- Es un checkpoint intermedio (iteración 800 de Self-Forcing), no un modelo final; el autor no afirma que iguale al profesor en un benchmark amplio.
- No incluye el modelo de fake-score, el discriminador, los pesos del profesor ni los estados de optimizador; no se puede reanudar el entrenamiento con este paquete.
- No es un pipeline estándar de Diffusers: requiere FastGen en un commit concreto y versiones fijadas de PyTorch, Diffusers, Transformers y PEFT.
- No se debe aplicar la normalización de latentes Wan por segunda vez a los latentes cacheados de entrenamiento/evaluación.
- No se debe sustituir el embedding archivado `empty_prompt_context.pt["context"]` por `context_empty` del corpus, ni pasar el borrador de 16 canales directamente como condicionamiento VACE.
- El ruido inicial debe generarse en CPU en FP32 con la semilla del ejemplo y luego moverse a CUDA y convertir a BF16; generarlo directamente en CUDA no reproduce la misma muestra.
- El directorio `Wan2.1-VACE-1.3B-diffusers` debe conservar su nombre, ya que el loader de FastGen identifica la familia de modelo por esa ruta.
- Usa condicionamiento por borrador, no extracción de profundidad.
- Licencia no declarada: riesgo legal para uso comercial; no hay autorización explícita de uso.
- Idiomas soportados no disponibles; el condicionamiento de texto es un embedding vacío, no prompts arbitrarios.
- Riesgo de sesgos y alucinación no evaluado en la información disponible; no hay benchmarks ni auditorías publicadas.
- Solo se han publicado comparaciones cualitativas sobre cuatro ejemplos fijos retenidos.

## Enlaces

- Hugging Face: https://huggingface.co/primecai/fixer-vace-self-forcing
- Repositorio FastGen de NVlabs (commit requerido): https://github.com/NVlabs/FastGen/tree/c40fbea17b9a28a38528ee5254471dac4f2f9f12
- Resultados esperados: `expected_results/expected_results.mp4`, `expected_results/all_examples_grid.mp4`, `expected_results/evaluation_report.json` (dentro del repositorio de Hugging Face)
- No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
