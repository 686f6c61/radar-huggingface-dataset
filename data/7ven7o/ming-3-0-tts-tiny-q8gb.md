# 7ven7o/Ming-3.0-tts-tiny-Q8GB

## Resumen

Ming-3.0-tts-tiny-Q8GB es una cuantización del checkpoint `inclusionAI/Ming-3.0-tts-tiny`, un modelo de síntesis de voz (text-to-speech) con arquitectura Mixture-of-Experts (MoE) de 8,98 mil millones de parámetros totales y 1,3 mil millones de parámetros activos. La cuantización la ha publicado el usuario 7ven7o en Hugging Face y está diseñada específicamente para ejecutar el modelo en GPUs de consumo con un presupuesto de VRAM igual o inferior a 8 GB, con pruebas realizadas en una NVIDIA RTX 3080 de 10 GB.

El modelo base lo desarrolla inclusionAI y combina un bloque MoE para el modelado de lenguaje con un decodificador de audio del tipo Flow DiT y AudioVAE, además de un módulo agregador. La cuantización emplea `torchao` para reducir el peso de los expertos MoE a `uint6_g64` y las capas de atención y expertos compartidos a `int8`, manteniendo el Flow DiT y el agregador en `bf16`.

Su relevancia radica en que permite desplegar un TTS de casi 9B parámetros totales en hardware asequible: el repo ocupa 9,5 GB, pero los pesos cargados en GPU suman 7,347 GB y el pico medido en la RTX 3080 es de 7,673 GB. La licencia es MIT, lo que facilita el uso comercial, aunque la información pública disponible sobre el modelo base y sus capacidades es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con decodificador Flow DiT y AudioVAE (TTS) |
| Parametros totales | 8,98 mil millones (modelo base) |
| Parametros activos | 1,3 mil millones (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | uint6_g64 (expertos MoE), int8 (atención, expertos compartidos, decodificador AudioVAE), bf16 (Flow DiT y agregador) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `gpu_weights.pt` y `cpu_weights.pt` (tensor subclasses de torchao), runtime ONNX para partes auxiliares |

## Arquitectura y entrenamiento

El modelo base Ming-3.0-tts-tiny es un sistema de síntesis de voz que combina un backbone de lenguaje con arquitectura Mixture-of-Experts (8,98B totales, 1,3B activos) con un decodificador de audio basado en Flow DiT y un AudioVAE. El pipeline incluye además un módulo agregador y un `lm_head` que, en esta cuantización, se ha eliminado por no ser necesario en inferencia, ahorrando 0,48 GB. El runtime depende de `fla-core` y `x-transformers`, lo que sugiere el uso de capas de atención lineal o híbridas en el backbone.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card del checkpoint cuantizado no documenta el proceso de entrenamiento del modelo base. La innovación técnica principal de esta publicación es la estrategia de cuantización mixta: los expertos MoE se comprimen a `uint6_g64`, las capas de atención y expertos compartidos a `int8`, mientras que el Flow DiT y el agregador permanecen en `bf16` para preservar la calidad de la síntesis. Las embeddings de palabras y el encoder del AudioVAE se mantienen en CPU en `bfloat16`/`fp32`.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto libre.
- Control de estilo mediante instrucciones en lenguaje natural (por ejemplo, "Speak in an excited, joyful, upbeat voice").
- Modo `freeform` de generación, según el ejemplo de uso de la model card.
- Generación de audio a fichero WAV mediante la API `generate`.
- Ejecución en GPU de consumo con presupuesto de VRAM reducido (≤ 8 GB).
- Soporte de cuantización mixta con `torchao` para despliegue en producción.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- **Locución automatizada de bajo coste en GPUs de consumo**: el modelo cabe en una RTX 3080 con 7,673 GB de pico de VRAM, lo que permite generar locuciones en estaciones de trabajo sin GPU de datacenter. Se usaría con el modo `freeform` y un texto de entrada para producir un WAV por frase o párrafo.
- **Generación de audiolibros y pódcast**: la posibilidad de controlar el estilo mediante instrucciones permite ajustar el tono (emocionado, neutro, serio) por capítulo o sección, manteniendo el proceso en una sola GPU.
- **Prototipado rápido de asistentes de voz**: al estar cuantizado y ser ejecutable con `torchao==0.9.0`, se puede integrar en un pipeline de desarrollo local para validar voces y estilos antes de escalar a un modelo mayor o a un servicio gestionado.
- **Doblaje y postproducción de vídeo**: la generación por fichero WAV y el control de instrucciones de estilo permiten producir pistas de voz para vídeos cortos o demos en un equipo con GPU consumer, sin depender de APIs externas.
- **Sistemas de accesibilidad**: lectura de texto a voz para aplicaciones de asistencia a personas con discapacidad visual, ejecutándose en local y con licencia MIT, lo que evita costes recurrentes de API.
- **Investigación en TTS y cuantización**: sirve como referencia para estudiar el impacto de la cuantización mixta (`uint6_g64` en expertos MoE, `int8` en atención, `bf16` en Flow DiT) sobre la calidad del audio generado.
- **Integración en pipelines offline**: al no requerir conexión a servicios externos y caber en 8 GB de VRAM, es adecuado para entornos con requisitos de privacidad donde el texto no debe salir del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de memoria: 7,347 GB de pesos cargados en GPU, 2,16 GB de pesos en CPU, 7,34 GB de VRAM asignada y 7,673 GB de pico asignado (7,73 GB reservado) en una RTX 3080 de 10 GB.

## Requisitos de hardware

- **VRAM estimada**: 7,673 GB de pico medido en RTX 3080 de 10 GB; 7,34 GB asignados en carga.
- **Pesos en GPU**: 7,347 GB (`gpu_weights.pt`); **pesos en CPU**: 2,16 GB (`cpu_weights.pt`).
- **GPU recomendadas**: NVIDIA RTX 3080 (probada), RTX 3090, RTX 4080, RTX 4090, A100, H100. Cualquier GPU con al menos 8 GB de VRAM libre debería ser suficiente según el objetivo declarado.
- **¿Cabe en GPU consumer?**: sí, en RTX 3080 y modelos superiores con ≥ 8 GB de VRAM. No se garantiza en GPUs con 6 GB o menos.
- **Opciones de despliegue**: runtime propio `quant_runtime.py` del repo, con dependencias `torch==2.6.0`, `torchaudio==2.6.0`, `torchao==0.9.0`, `transformers==4.46.3`, `fla-core==0.4.2`, `x-transformers==2.7.4`, `einops`, `einx`, `soundfile` y `onnxruntime`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 7ven7o/Ming-3.0-tts-tiny-Q8GB | 8,98B totales / 1,3B activos | no disponible | MIT | Hugging Face (repo 9,5 GB) | Cuantizado para ≤ 8 GB VRAM |
| inclusionAI/Ming-3.0-tts-tiny | 8,98B totales / 1,3B activos | no disponible | no disponible | Hugging Face (modelo base) | Pesos sin cuantizar; requisitos de VRAM superiores |
| inclusionAI/Ming-3.0-tts | no disponible | no disponible | no disponible | GitHub + Hugging Face | Repositorio de runtime upstream |

No se dispone de datos de benchmarks ni de otros modelos TTS comparables en la información proporcionada para establecer una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- **Información muy escasa**: la model card del checkpoint cuantizado no documenta idiomas, contexto, dataset de entrenamiento ni evaluación de calidad; no es posible validar el rendimiento del modelo sin pruebas propias.
- **Dependencia de un runtime específico**: requiere clonar el repositorio `inclusionAI/Ming-3.0-tts` y usar `quant_runtime.py`, con versiones fijas de `torch`, `torchao`, `transformers`, `fla-core` y `x-transformers`; la incompatibilidad de versiones puede romper la carga.
- **Cuantización agresiva**: los expertos MoE en `uint6_g64` y la atención en `int8` pueden degradar la calidad del audio frente al modelo base en `bf16`; no se han publicado comparativas de calidad.
- **Riesgo de alucinación y artefactos de audio**: no se documentan evaluaciones de fidelidad, prosodia ni estabilidad en textos largos.
- **Sesgos**: no disponibles; al no documentarse el dataset de entrenamiento, no se pueden evaluar sesgos de género, acento o idioma.
- **Licencia**: MIT en el checkpoint, pero conviene verificar la licencia del modelo base `inclusionAI/Ming-3.0-tts-tiny` antes de uso comercial, ya que la model card no la especifica.
- **Hardware**: el objetivo es ≤ 8 GB de VRAM, pero el pico medido es 7,673 GB; en GPUs con 8 GB exactos y otros procesos en ejecución puede haber problemas de memoria.
- **Estado del repo**: 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/7ven7o/Ming-3.0-tts-tiny-Q8GB
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-tiny
- Repositorio de runtime: https://github.com/inclusionAI/Ming-3.0-tts
- Referencia de `torchao`: https://github.com/pytorch/ao
