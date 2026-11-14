# linoyts/acedit-qwen-image-2.1

## Resumen

ACEdit-Qwen-Image-2.1 es un adaptador LoRA de rango 16 (student LoRA) que reproduce el método ACEdit (Asymmetric Conditioning for stable multi-turn image editing, arXiv 2610.22328) sobre la familia Qwen-Image-2.1. Lo desarrolla el usuario linoyts y se publica como un repositorio PEFT que debe combinarse con el checkpoint base Qwen/Qwen-Image-2.1-Turbo (8 pasos, CFG=1) para obtener el modelo estudiante. No es un modelo de lenguaje ni un generador de imágenes autónomo: es un delta de pesos que modifica el comportamiento de un modelo de difusión de imagen en cadenas de edición multi-turno.

El objetivo técnico es la estabilidad en cadenas largas de edición: aplicar diez instrucciones consecutivas sobre una imagen sin que se acumule deriva visual. El método original usa destilación DMD con un teacher congelado (Qwen/Qwen-Image-2.1, CFG 2) y un editor auxiliar, ambos con LoRA de rango 16. El autor declara explícitamente que en esta reproducción la ganancia de estabilidad del paper no se ha reproducido a esta escala: es un entrenamiento a medias (250 iteraciones, 50 actualizaciones del estudiante) y la evaluación con cadenas no-op muestra diferencias dentro del ruido.

Por tanto, el interés del repositorio es principalmente metodológico y de trazabilidad: incluye receta de entrenamiento, dataset sintético de cadenas de edición, artefactos de evaluación y código de carga manual vía PEFT. No debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer de difusión de imagen Qwen-Image-2.1-Turbo; rango 16, alpha 16, modulos objetivo `to_k`, `to_q`, `to_v`, `to_out.0` |
| Parametros totales | no disponible (el repo pesa 0,9 GB; el recuento de parámetros del adaptador no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en bf16 según la receta de entrenamiento) |
| Idiomas soportados | no disponible (las instrucciones de edición se procesan vía el modelo base; no se declara cobertura idiomática) |
| Licencia | `qwen-research` (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (`student_lora.safetensors`, `aux_lora.safetensors`), cargados vía PEFT |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer de difusión de imagen (Qwen-Image-2.1-Turbo, checkpoint de 8 pasos con CFG=1). La receta sigue el paper ACEdit: destilación DMD con un teacher congelado (Qwen-Image-2.1 con CFG 2 y condicionamiento asimétrico sobre imagen fuente e instrucción compuesta) y un editor auxiliar que actúa como modelo de puntuación falsa. Se realizan rollouts latentes de 10 turnos sin decodificación VAE, con paso de salida muestreado en s~U{1..8} y gradiente DMD evaluado en z_τ(x̂ˢ) con τ~U[0,1). Optimizador AdamW (betas 0,999), weight decay 0,01, clipping 10, precisión bf16, learning rate 4e-5 para el estudiante y 8e-6 para el auxiliar; 5 iteraciones de calentamiento solo con el auxiliar, después auxiliar en cada iteración y estudiante cada 5.

Los datos de entrenamiento son 96 escenas sintéticas de 1024×1024 con cadenas de 10 ediciones, generadas por el propio estudiante y publicadas en el dataset `linoyts/acedit-qwen-image-2.1-chains`. El autor documenta desviaciones respecto al paper: cadenas construidas desde un banco de plantillas en lugar de generadas por un LLM, instrucciones compuestas por concatenación fluida de plantillas, normalización w(τ)=1/max(τ,0,05) elegida por el autor (el paper no la especifica) y estudiante Turbo de 8 pasos en lugar del FLUX.2-klein-9B de 4 pasos. El entrenamiento es una media ejecución: 250 iteraciones totales, equivalentes a 50 actualizaciones del estudiante, frente a las 500 iteraciones y 100 actualizaciones del paper (~4,4 horas de B200).

## Capacidades

- Edición de imagen multi-turno: aplicación de cadenas de instrucciones sucesivas sobre una imagen fuente, manteniendo el condicionamiento asimétrico sobre la imagen original.
- Edición compuesta: acepta instrucciones compuestas construidas por concatenación de plantillas.
- Integración como adaptador PEFT sobre el transformer del modelo base Qwen-Image-2.1-Turbo.
- Carga manual verificada mediante `add_adapter` + `load_state_dict` con mapeo de claves (`lora_A.default`, `lora_B.default`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en texto: es un adaptador de difusión de imagen.
- Capacidades multilingües: no declaradas.
- Modo thinking, visión o audio: no aplica.

## Casos de uso

- Investigación en edición iterativa de imágenes: reproducción y análisis del método ACEdit sobre la familia Qwen-Image, con artefactos de evaluación incluidos para comparar con el paper.
- Estudio de estabilidad en cadenas no-op: el repositorio incluye `noop_summary.json` y `noop_per_chain.json`, útiles para medir deriva visual con diez instrucciones "keep as is".
- Prototipado de pipelines de edición multi-turno: sirve como punto de partida para integrar edición secuencial en herramientas de retoque asistido, siempre que se valide la estabilidad con datos propios.
- Generación de datasets sintéticos de edición: el propio autor usó el estudiante para generar las 96 escenas de entrenamiento, patrón reutilizable para crear pares imagen-instrucción.
- Experimentación con destilación DMD en modelos de difusión: la receta detallada (rollouts latentes, paso de salida aleatorio, pesos w(τ)) es replicable en otros checkpoints.
- Evaluación comparativa de LoRAs de edición: los scripts y métricas (LPIPS, DINO cos) permiten contrastar adaptadores sobre la misma base.
- Docencia y divulgación: ejemplo completo de entrenamiento PEFT con dataset, receta y evaluación publicados, útil para explicar el ciclo de vida de un adaptador.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (16 cadenas reservadas × 10 turnos, semilla fija, proxies de imagen completa):

| Evaluacion | Base Turbo | Entrenado | Nota |
|---|---|---|---|
| Cadenas de edición: LPIPS vs fuente @10 | 0,727 | 0,720 | saturado por ediciones legítimas |
| Cadenas de edición: DINO cos vs fuente @10 | 0,622 | 0,615 | igual |
| Cadenas no-op (10× "keep as is"): LPIPS @10 | 0,706 | 0,697 | ~1 %, dentro del ruido por cadena |
| Cadenas no-op: DINO cos @10 | 0,762 | 0,762 | idéntico hasta 4 decimales |

El autor concluye que no se observa ganancia medible de estabilidad. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo de imagen.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; depende del modelo base Qwen-Image-2.1-Turbo, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: el autor reporta ~4,4 horas de B200 para la ejecución completa del paper; la media ejecución aquí descrita se entrenó en ese entorno. Para inferencia no se especifican GPU.
- GPU de consumo: no disponible. El repositorio de 0,9 GB solo contiene los pesos LoRA; la viabilidad en RTX 4090 u otras consumer depende del base, no documentada aquí.
- Despliegue: carga manual vía PEFT (`add_adapter` + `load_state_dict`). El autor advierte que `pipe.load_lora_weights` de diffusers no está garantizado y se verificó inconsistente por falta de metadatos de claves.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACEdit-Qwen-Image-2.1 (este) | LoRA r=16 sobre difusión | no disponible (repo 0,9 GB) | no aplica | qwen-research | Hugging Face, 0 descargas, 1 like |
| Qwen/Qwen-Image-2.1-Turbo | Modelo base de difusión | no disponible | no aplica | qwen-research | Hugging Face (oficial) |
| Qwen/Qwen-Image-2.1 | Teacher, difusión | no disponible | no aplica | qwen-research | Hugging Face (oficial) |
| FLUX.2-klein-9B (usado en el paper) | Estudiante de difusión | 9B (según nombre) | no aplica | no disponible | no disponible en la información |

La comparación con alternativas de la misma categoría (LoRAs de edición multi-turno) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La ganancia de estabilidad del paper no se reproduce: el autor lo declara explícitamente y los proxies no-op muestran diferencias dentro del ruido.
- Entrenamiento parcial: 250 iteraciones y 50 actualizaciones del estudiante frente a las 500/100 del paper; conclusiones limitadas por esta escala.
- Desviaciones metodológicas no testeadas: cadenas desde plantillas, instrucciones compuestas por concatenación, normalización w(τ) elegida por el autor, estudiante Turbo de 8 pasos en lugar de FLUX.2-klein-9B y evaluación con proxies de imagen completa sin máscara de fondo ni juez VLM.
- Carga no estándar: `pipe.load_lora_weights` no está garantizado; requiere mapeo manual de claves y puede fallar con versiones de diffusers.
- Licencia `qwen-research`: restringe el uso comercial; debe revisarse antes de cualquier despliegue productivo.
- Sesgos: no documentados; al ser un adaptador sobre un modelo de difusión, hereda los sesgos del base, no evaluados aquí.
- Riesgo de alucinación visual: no medido; la evaluación se limita a LPIPS y DINO cos, sin juicio semántico.
- Idiomas: no se declara cobertura; las instrucciones dependen del codificador de texto del base.
- Madurez: 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en producción.
- Repositorio pequeño (0,9 GB): solo contiene adaptadores y artefactos de evaluación, no el modelo completo.

## Enlaces

- Hugging Face: https://huggingface.co/linoyts/acedit-qwen-image-2.1
- Paper ACEdit: https://arxiv.org/abs/2610.22328
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Teacher: https://huggingface.co/Qwen/Qwen-Image-2.1
- Dataset de cadenas: https://huggingface.co/datasets/linoyts/acedit-qwen-image-2.1-chains
- ML Intern (entorno de entrenamiento): https://hf.co/chat?mode=ml-intern
