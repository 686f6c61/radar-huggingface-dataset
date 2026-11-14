# neurarank/NEUVY-FUSION-T2I-v1

## Resumen

NEUVY-FUSION-T2I-v1 es un modelo de generación de imagen a partir de texto (text-to-image) publicado por neurarank bajo el paraguas del proyecto NMEE (Neuvy Model Evolution Engine). Se presenta como un modelo fundacional independiente que sintetiza capacidades de dos profesores: MiniMax-H3-Image y FLUX.1-dev, mediante integración estructural de capas y destilación de conocimiento profesor-alumno. La arquitectura declarada es `NeuvyFusionDiTModel`, un Diffusion Transformer unificado con cabezas de destilación progresiva (PDD) que permite muestreo en 6 pasos Euler.

El repositorio contiene un checkpoint de 167.628.224 parámetros (639,46 MB en `transformer/model.safetensors`, precisión Float32 y compatible con BFloat16), descrito por el autor como "POC Foundation". La model card menciona además una "Full Scaled Cloud Specification" de 3,8B de parámetros que no está materializada en el repositorio. El modelo declara soporte para inglés, vietnamita y chino, y se distribuye con una licencia propia denominada `neuvy-evaluation-license`.

La relevancia del modelo es limitada y debe interpretarse con cautela: cuenta con 0 descargas y 0 likes en el momento de la ficha, el repositorio pesa 0,7 GB, la licencia es de evaluación no comercial y el autor no publica resultados de benchmarks verificables. Es un artefacto de investigación más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `NeuvyFusionDiTModel` (Diffusion Transformer unificado con cabezas de destilación progresiva PDD) |
| Parámetros totales | 167.628.224 (checkpoint POC verificado); 3,8B declarados como "Full Scaled Cloud Specification" no materializada |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; no aplica ventana de contexto de texto) |
| Tipos de cuantización | Float32 nativo; compatible con BFloat16; no se documentan GGUF, FP8 ni INT8 |
| Idiomas soportados | inglés (en), vietnamita (vi), chino (zh) |
| Licencia | `neuvy-evaluation-license` (categoría derivada: investigación y no comercial) |
| Formato de pesos | safetensors (`transformer/model.safetensors`) |

## Arquitectura y entrenamiento

El modelo se describe como un Diffusion Transformer que combina dos linajes. De MiniMax-H3-Image hereda la arquitectura de cabezas múltiples PDD (Progressive Distillation Decoder), con 6 cabezas dedicadas a la predicción de velocidad que permiten síntesis fotorrealista en 6 pasos Euler sin degradación de calidad declarada; también hereda un adaptador de condicionamiento multilingüe con proyección de cross-attention que acepta representaciones de 5.120 dimensiones procedentes de Qwen3-VL, y modulación AdaLN (adaptive layer normalization) en todos los bloques del transformer. De FLUX.1-dev hereda el procesamiento de flujo conjunto MMDiT (intercalado de secuencias latentes de texto e imagen), compresión latente con AutoencoderKL de 16 canales y patchificación espacial 2x2 que produce tokens de 64 dimensiones, además de modulación de guidance embebida para alineación de prompt y nitidez tipográfica.

El entrenamiento se declara como destilación profesor-alumno (teacher-student knowledge distillation) con integración estructural de capas, sin que la model card especifique número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF/DPO. El scheduler propietario `NeuvyPDDFlowScheduler` implementa una EDO de velocidad con destilación progresiva en 6 pasos, y la configuración por defecto de generación es 6 pasos con `guidance_scale` 3.5. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de imagen a partir de prompt de texto con resolución configurable (el ejemplo de la model card usa 512x512).
- Muestreo rápido en 6 pasos Euler mediante el scheduler PDD, orientado a baja latencia.
- Condicionamiento multilingüe con foco declarado en chino, inglés y vietnamita, apoyado en representaciones de 5.120 dimensiones (herencia Qwen3-VL).
- Control de alineación prompt-imagen mediante `guidance_scale` (valor por defecto 3.5).
- Nitidez tipográfica declarada como capacidad heredada de FLUX.1-dev (distilled guidance modulation).
- Reproducibilidad por semilla (`seed` en la API de generación).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking. Es exclusivamente text-to-image.

## Casos de uso

- Prototipado rápido de conceptos visuales: con 6 pasos de inferencia y un checkpoint de 639 MB, el modelo puede ejecutarse en CPU según el ejemplo de la model card, lo que lo hace adecuado para generar bocetos en entornos sin GPU dedicada.
- Investigación en destilación de modelos generativos: el repositorio incluye `model_lineage.json` y `license_manifest.json`, útiles para estudiar linajes de fusión y compatibilidad de licencias entre profesores.
- Evaluación comparativa de schedulers PDD: el `scheduler_config.json` y el `benchmark_report.json` permiten reproducir el esquema de 6 pasos y contrastarlo con schedulers estándar de difusión.
- Generación de imágenes para prompts en chino o vietnamita: el adaptador multilingüe de 5.120 dimensiones está pensado para prompts complejos en estos idiomas, un nicho menos cubierto por modelos occidentales.
- Docencia y demostraciones de arquitecturas DiT: el código standalone (`modeling_neuvy_fusion.py`, `pipeline_neuvy_fusion.py`) permite inspeccionar un pipeline completo sin depender de los modelos originales.
- Pruebas de integración con Diffusers: el `model_index.json` sigue el formato de pipeline de Diffusers, lo que facilita experimentar con la API estándar en entornos de investigación.
- No se recomienda su uso en producción comercial: la licencia es de evaluación y los profesores imponen restricciones territoriales y no comerciales (ver limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificables en la información disponible. El repositorio incluye un `benchmark_report.json` que no se ha podido consultar en el material proporcionado, y la model card no reproduce cifras de FID, CLIP score, MMLU ni métricas equivalentes. No se inventan números.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint POC pesa 639,46 MB en Float32, por lo que la inferencia en CPU es viable según el ejemplo oficial (`device="cpu"`). En GPU, con overhead de activaciones y VAE, se estima un consumo moderado, aunque el autor no publica cifras exactas.
- GPU recomendadas: no disponibles en la documentación. Por tamaño del checkpoint, cualquier GPU consumer con al menos 4-6 GB de VRAM debería poder alojarlo, pero es una estimación, no un dato del autor.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del checkpoint POC; la variante "Full Scaled" de 3,8B no está materializada y requeriría hardware muy superior (no especificado).
- Opciones de despliegue: el autor proporciona un pipeline propio (`NeuvyFusionPipeline`) que se carga con `from_pretrained` y acepta `device="cpu"`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a difusión). La integración con Diffusers es plausible por el `model_index.json`, pero no está confirmada.
- Latencia y throughput: no disponibles. El muestreo en 6 pasos sugiere baja latencia relativa frente a schedulers de 20-50 pasos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| NEUVY-FUSION-T2I-v1 | 167,6M (POC) / 3,8B (declarado) | 512x512 en ejemplo; resolución configurable | `neuvy-evaluation-license` (no comercial) | Hugging Face, 0 descargas |
| FLUX.1-dev (profesor B) | 12B | resolución alta, no especificada aquí | FLUX.1 [dev] Non-Commercial v1.1.1 | Hugging Face, ampliamente usado |
| MiniMax-H3-Image (profesor A) | no disponible | no disponible | MiniMax-H3-Image Community License (excluye EE. UU., UE, Reino Unido y Corea del Sur) | Hugging Face |
| FLUX.1-schnell | 12B (aproximado, no confirmado aquí) | no disponible | Apache 2.0 | Hugging Face |

La comparativa es estructural: NEUVY-FUSION-T2I-v1 se posiciona como un derivado destilado de menor tamaño que sus profesores, con la promesa de mantener capacidades en 6 pasos. No hay datos de rendimiento que permitan afirmar que iguala a FLUX.1-dev o MiniMax-H3-Image.

## Limitaciones y advertencias

- Licencia de evaluación (`neuvy-evaluation-license`) con categoría derivada de investigación y no comercial: cualquier despliegue comercial requiere acuerdos con Black Forest Labs y MiniMax, o migrar a profesores Apache 2.0 (FLUX.1-schnell + Qwen3-VL en destilación clean-room).
- Restricción territorial heredada de MiniMax-H3-Image: la licencia del profesor excluye Estados Unidos, Unión Europea, Reino Unido y Corea del Sur, lo que afecta a la distribución del derivado.
- Riesgo de alucinación visual y de prompt: no hay métricas publicadas de fidelidad (FID, CLIP score) que permitan acotar la tasa de error.
- El checkpoint materializado es un POC de 167,6M de parámetros; la especificación de 3,8B no está disponible en el repositorio, por lo que las capacidades reales pueden diferir sustancialmente de las declaradas.
- Idiomas limitados a inglés, vietnamita y chino; no se documenta soporte de castellano ni de otras lenguas.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la ficha, lo que impide validación por parte de la comunidad.
- No se documentan sesgos conocidos, pero al ser un derivado de profesores no auditados públicamente, los sesgos de esos modelos pueden propagarse.
- El ejemplo de la model card usa CPU y 512x512; no hay garantías publicadas sobre calidad a resoluciones superiores.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; no debe confundirse con un modelo multimodal conversacional.

## Enlaces

- Hugging Face: https://huggingface.co/neurarank/NEUVY-FUSION-T2I-v1
- Modelo profesor B (FLUX.1-dev): https://huggingface.co/black-forest-labs/FLUX.1-dev
- Modelo profesor A (MiniMax-H3-Image): https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Alternativa Apache 2.0 mencionada (FLUX.1-schnell): https://huggingface.co/black-forest-labs/FLUX.1-schnell
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
