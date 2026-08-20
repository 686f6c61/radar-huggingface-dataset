# Perflow-Shuai/Wan2.1-T2V-14B-Resampling-Forcing-AR-LoRA

## Resumen

Este repositorio contiene un adaptador LoRA en BF16 para el modelo de generación de vídeo Wan2.1-T2V-14B, desarrollado por Perflow-Shuai. El adaptador implementa un esquema de **inferencia autoregresiva causal por chunks** (causal chunk-autoregressive inference) basado en la técnica de *Resampling Forcing* descrita en el artículo arXiv:2512.15702. El modelo resuelve el problema de generar vídeos largos y coherentes temporalmente mediante una estrategia de denoising autoregresivo que recuerda el historial causal completo y recachea las claves y valores de atención en cada chunk.

Es importante destacar que este es un **checkpoint intermedio de la etapa 1** (paso 4.585 de 31.500) del plan de entrenamiento de cuatro etapas. En este punto, el adaptador solo ha recibido el objetivo de *teacher forcing* causal; el entrenamiento con Resampling Forcing propiamente comienza en el paso 10.000. Por tanto, no es una reproducción completa ni entrenada con RF. El adaptador añade 153,35 millones de parámetros (un 1,06 % del modelo envuelto) y se distribuye bajo licencia Apache-2.0. No es un modelo independiente: requiere el modelo base Wan2.1-T2V-14B y una implementación personalizada del framework de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA adaptador sobre Wan2.1-T2V-14B (transformador causal) |
| Parámetros totales | 153,354,240 (parámetros del adaptador) |
| Parámetros activos | 153,354,240 (todos los parámetros del adaptador; el modelo base tiene 14B) |
| Longitud de contexto | No disponible (ventana de vídeo autoregresiva, no contexto de texto) |
| Tipos de cuantización | BF16 (adapter) |
| Idiomas soportados | No disponible (el modelo base Wan2.1 soporta inglés y chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | SafeTensors (adapter_model.safetensors), PyTorch pickle (training_state) |

## Arquitectura y entrenamiento

El adaptador se aplica a **todas las capas `Linear`** de los 40 bloques transformer causales de Wan2.1-T2V-14B: proyecciones q/k/v/o de self-attention, q/k/v/o de cross-attention y proyecciones FFN 0/2. Cada par A/B de LoRA tiene rango 32, alpha 32 y dropout 0.0, lo que resulta en 800 tensores (400 pares A/B) con un total de 153,35 M de parámetros.

El entrenamiento sigue un plan en cuatro etapas: la etapa 1 (pasos 0–10.000) usa *teacher forcing* causal con un perfil de 5 segundos y historial denso; la etapa 2 (10.000–25.000) introduce el objetivo de Resampling Forcing; la etapa 3 (25.000–30.000) extiende a 15 segundos; y la etapa 4 (30.000–31.500) añade enrutamiento de historial top-5. El checkpoint publicado corresponde al paso 4.585 de la etapa 1, por lo que aún no ha recibido el entrenamiento con Resampling Forcing. El entrenamiento se realizó con un batch global de 64 sobre 293.440 muestras.

La inferencia se realiza con un **tamaño de chunk causal de 3 frames latentes** (5 segundos → 21 frames latentes en 7 chunks), salida de 81 RGB frames a 832×480 y 16 fps, con Euler (32 pasos de denoising por chunk), CFG 5.0 y timestep shift 5.0. Las ramas condicional y no condicional de CFG usan cachés separadas. Requiere la implementación causal personalizada en el branch `shyang/resampling_forcing_14b` del repositorio `AndysonYs/resampling-forcing`.

## Capacidades

- **Generación de vídeo texto a vídeo**: el adaptador permite generar secuencias de vídeo de 5 segundos (configuración actual) a partir de un prompt textual.
- **Inferencia autoregresiva causal**: genera el vídeo en chunks de 3 frames latentes, manteniendo un historial causal denso y recacheando K/V por chunk.
- **Soporte de CFG con cachés separadas**: las ramas condicional y no condicional usan cachés independientes para el guidance.
- **Multilingüe (heredado del base)**: Wan2.1-T2V-14B soporta prompts en inglés y chino; el adaptador no altera esta capacidad.
- **No es standalone**: no puede usarse sin el modelo base y el código personalizado; no se garantiza que cargue en Diffusers estándar.

## Casos de uso

- **Investigación en generación autoregresiva de vídeo**: permite reproducir y estudiar el comportamiento del *teacher forcing* causal en la generación de vídeo largo, sirviendo como punto de comparación para los futuros checkpoints con Resampling Forcing.
- **Evaluación de técnicas de entrenamiento por etapas**: el checkpoint intermedio es útil para analizar cómo evoluciona la calidad de la generación a lo largo del plan de entrenamiento (etapa 1 vs. etapas posteriores).
- **Benchmarking de modelos de vídeo de 14B**: al ser un adaptador sobre Wan2.1-T2V-14B, puede usarse para comparar el rendimiento de la generación autoregresiva frente a la generación one-shot del modelo base.
- **Desarrollo de sistemas de generación de vídeo con memoria temporal**: la arquitectura de chunks con historial denso es adecuada para escenarios que requieren coherencia temporal en secuencias largas, como simulación de entornos o narración de vídeo.
- **Reproducción de experimentos científicos**: el repositorio incluye el estado de entrenamiento completo (AdamW, RNG) en `training_state/`, lo que permite reproducir el entrenamiento desde el paso 4.585.
- **Integración en pipelines de investigación**: el adaptador puede ser usado con el script de inferencia proporcionado (`infer_resampling_forcing.py`) para generar vídeos de 5 segundos en entornos con múltiples GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha completado ninguna evaluación cuantitativa de generación ni de seguridad para este release intermedio. La validación se limitó a la verificación de la exportación de tensores y a la carga correcta en el loader de inferencia del proyecto.

## Requisitos de hardware

- **VRAM estimada**: no se especifica explícitamente, pero el modelo base Wan2.1-T2V-14B requiere al menos 16 GB de VRAM en BF16 para inferencia; con el adaptador LoRA y el recacheado de K/V, se recomiendan al menos 24 GB. El comando de ejemplo usa dos GPUs (`cuda:0 cuda:1`), lo que sugiere una configuración multi-GPU para los 14B parámetros del base más el adaptador.
- **GPU recomendadas**: se requiere al menos una GPU con 24 GB (p. ej., RTX 3090, RTX 4090) para inferencia básica; para el perfil completo de 5 segundos con 7 chunks, se recomienda usar dos GPUs de 24 GB o una A100/H100 para mayor velocidad.
- **¿Cabe en consumer GPU?**: sí, en una RTX 4090 con 24 GB puede ejecutarse el modelo base en BF16 más el adaptador, aunque con mayor latencia. Para producción, se recomienda GPUs de datacenter.
- **Opciones de despliegue**: requiere el fork del repositorio `resampling-forcing` (rama `shyang/resampling_forcing_14b`). No es compatible con vLLM, llama.cpp, Ollama o TGI de forma directa. El script `infer_resampling_forcing.py` es la vía principal de inferencia.
- **Latencia y throughput**: no disponibles. La generación de 5 segundos con 7 chunks y 32 pasos de denoising por chunk puede tardar varios minutos en una RTX 4090, dependiendo de la optimización y el número de GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| **Wan2.1-T2V-14B (base)** | 14B | Ventana temporal completa | Apache-2.0 | HuggingFace |
| **Wan2.1-T2V-14B + LoRA (este)** | 14B + 153 M LoRA | 5 s (21 frames latentes) | Apache-2.0 (adaptador) | HuggingFace |
| **Modelos de vídeo autoregresivos (p. ej., VideoPoet, T2V-Turbo)** | varía | Varía | Varía | No comparables directamente |

El adaptador no es comparable directamente con otros modelos de vídeo porque es un componente de investigación sobre Wan2.1. La comparativa real se establece con el modelo base: el adaptador introduce la inferencia por chunks causales, lo que permite generar vídeos más largos que el modelo base sin necesidad de generar todos los frames de una vez, aunque a costa de una mayor complejidad de implementación.

## Limitaciones y advertencias

- **Checkpoint intermedio**: este es el paso 4.585 de 31.500, sin entrenamiento de Resampling Forcing (comienza en el paso 10.000). La calidad de generación será inferior a la de un modelo completado.
- **Artefactos y drift temporal**: el autor advierte de que puede producir drift temporal, artefactos visuales o fallos de prompt.
- **Contenido no seguro**: no se ha realizado evaluación de seguridad; el modelo hereda las limitaciones de Wan2.1 y puede generar contenido no deseado.
- **No es standalone**: no se puede usar sin el modelo base y el código personalizado; no se garantiza que cargue en Diffusers estándar.
- **Licencia**: el adaptador y el código se distribuyen bajo Apache-2.0, pero el modelo base Wan2.1-T2V-14B debe obtenerse por separado (también Apache-2.0). Los derechos sobre los datos de entrenamiento no se transmiten con este repositorio.
- **Uso en producción**: no recomendado para aplicaciones de alto riesgo o engañosas. Para producción, esperar a un checkpoint de la etapa 2 o superior con Resampling Forcing entrenado.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/Perflow-Shuai/Wan2.1-T2V-14B-Resampling-Forcing-AR-LoRA)
- [Modelo base Wan2.1-T2V-14B](https://huggingface.co/Wan-AI/Wan2.1-T2V-14B)
- [Artículo Resampling Forcing (arXiv:2512.15702)](https://arxiv.org/abs/2512.15702)
- [Repositorio del proyecto resampling-forcing](https://github.com/AndysonYs/resampling-forcing/tree/5c926d1fa3fd9fbc9da05c09761517892342b394)
