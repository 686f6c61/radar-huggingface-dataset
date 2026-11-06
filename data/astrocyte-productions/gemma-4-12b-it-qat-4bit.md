# astrocyte-productions/gemma-4-12B-it-qat-4bit

## Resumen

Gemma 4 12B IT QAT 4-bit (MLX) es una conversión no oficial del checkpoint oficial de Google `google/gemma-4-12B-it-qat-q4_0-unquantized`, publicada por el usuario astrocyte-productions. El modelo original es la variante instruction-tuned de Gemma 4 en su configuración "Unified", entrenada con quantisation-aware training (QAT) para tolerar cuantización agresiva sin pérdida apreciable de calidad. Esta conversión reempaqueta esos pesos en formato MLX de 4 bits (con algunas capas a 8 bits) para su ejecución eficiente en Apple Silicon.

El modelo resuelve el problema de desplegar un modelo multimodal de ~12.000 millones de parámetros (texto, imagen y audio) en hardware de consumo con memoria unificada, manteniendo la fidelidad del checkpoint QAT original. Con 10,99 GB de pesos y una media de 7,355 bits por peso, es viable en Macs con 16 GB o más de memoria unificada, algo impensable con los pesos en bfloat16.

Es relevante ahora porque combina tres tendencias: modelos multimodales unificados, cuantización consciente del entrenamiento (QAT) y ecosistemas de inferencia local optimizados para Apple Silicon (MLX). La licencia Apache 2.0 y la ausencia de gating en el checkpoint fuente facilitan su uso comercial, aunque esta conversión concreta no está avalada por Google.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma4UnifiedForConditionalGeneration (`gemma4_unified`), transformer multimodal con torres de visión y audio |
| Parámetros totales | 11.959.730.224 (~12B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit affine (group size 64) por defecto; 8-bit (group size 64) en proyecciones MLP densas (`gate_proj`, `up_proj`, `down_proj`) de las 48 capas (144 módulos); pesos de normalización, escalares de capa y embedding posicional de visión sin cuantizar; media de 7,355 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia específica de Gemma 4 de Google) |
| Formato de pesos | safetensors (MLX), 10,99 GB en total, repositorio de 11,0 GB |

## Arquitectura y entrenamiento

La arquitectura es `Gemma4UnifiedForConditionalGeneration`, un transformer multimodal que acepta entradas de texto, imagen y audio de forma nativa. El checkpoint incluye los embedders de visión y audio, así como `vision_embedder.patch_dense`. La conversión preserva la estructura del modelo fuente: 48 capas en el modelo de lenguaje, con proyecciones MLP densas y un router (el script de conversión menciona `router.proj`, lo que sugiere componentes tipo MoE en la arquitectura, aunque el número de parámetros activos no se detalla).

El entrenamiento original corrió a cargo de Google con quantisation-aware training (QAT), de modo que el modelo aprendió a mantener su calidad bajo cuantización de 4 bits. Esta conversión no reentrena nada: parte del checkpoint `q4_0-unquantized` (revisión `b6ed86275a6a5735884e208bfed95b445a684ca2`) y aplica cuantización affine con MLX. La decisión técnica destacable es mantener a 8 bits las proyecciones MLP densas y el router, mientras el resto (embeddings, atención, torres multimodales) queda a 4 bits, equilibrando tamaño y fidelidad. La conversión se ejecutó en CPU (`mx.set_default_device(mx.cpu)`) para obtener resultados byte-idénticos a otras builds de mlx-community y evitar timeouts del command buffer de Metal en máquinas de 34 GB. Se usaron mlx-vlm 0.7.2, mlx 0.32.2, transformers 5.17.0 y Python 3.12.

## Capacidades

- Generación de texto conversacional con ajuste de instrucciones (instruction-tuned).
- Comprensión de imágenes (image-text-to-text), con embedder de visión incluido.
- Entrada de audio (embedder de audio incluido), aunque el autor solo verificó texto e imagen.
- Razonamiento y respuesta multi-turno en formato chat (incluye `chat_template.jinja`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener diálogos multi-turno íntegramente en el dispositivo con 10,99 GB de pesos, sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Análisis de documentos con imágenes: al aceptar entradas de imagen y texto, permite extraer información de capturas, diagramas o formularios combinándolos con preguntas en lenguaje natural.
- Prototipado de aplicaciones multimodales en Apple Silicon: sirve para validar pipelines de image-text-to-text con MLX antes de migrar a infraestructura mayor, gracias a su integración con mlx-vlm.
- Transcripción y comprensión de audio con contexto textual: el embedder de audio incluido permite experimentar con tareas que combinen audio y texto, aunque el autor no haya validado esta ruta.
- Generación de contenido asistida por imagen: descripción, resumen o reescritura de material visual en flujos editoriales o de accesibilidad.
- Evaluación comparativa de cuantización: al ser una conversión QAT a 4 bits con capas selectivas a 8 bits, es útil para medir el impacto de distintas estrategias de cuantización sobre un mismo checkpoint base.
- Despliegue en entornos sin GPU dedicada: al ejecutarse sobre MLX en memoria unificada, cubre escenarios de desarrollo y demos en portátiles de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: ~11 GB solo para pesos; con overhead de activaciones y caché KV conviene disponer de 16 GB o más de memoria unificada.
- Hardware objetivo: Apple Silicon con MLX (mlx 0.32.2, mlx-vlm 0.7.2). El autor menciona una máquina de 34 GB para la conversión del modelo 26B-A4B, lo que da idea del rango de memoria manejado.
- GPU NVIDIA: no es el formato nativo; requeriría conversión adicional a otro runtime (no disponible en la información).
- Cabe en GPU de consumo: en el ecosistema Apple, sí en equipos con 16 GB o más de memoria unificada; en NVIDIA no se documenta.
- Opciones de despliegue: MLX y mlx-vlm son las rutas soportadas. vLLM, llama.cpp, Ollama o TGI no se mencionan para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| astrocyte-productions/gemma-4-12B-it-qat-4bit | ~12B | no disponible | MLX safetensors 4-bit | Apache 2.0 | Conversión no oficial para Apple Silicon |
| google/gemma-4-12B-it-qat-q4_0-unquantized | ~12B | no disponible | safetensors (fuente) | Apache 2.0 | Checkpoint oficial de Google, sin gating |
| Otras builds mlx-community de Gemma 4 | no disponible | no disponible | MLX | no disponible | El autor indica que su resultado es byte-idéntico a builds de mlx-community |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Conversión no oficial: no está publicada ni avalada por Google; para producción conviene partir del checkpoint oficial.
- Solo se validaron entradas de texto e imagen; la ruta de audio está incluida pero no verificada por el autor.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Longitud de contexto no especificada, lo que impide planificar cargas de documentos largos con garantías.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad para esta conversión.
- Sesgos: no documentados en la información disponible.
- La cuantización a 4 bits, aunque sea QAT, puede degradar tareas sensibles; las capas MLP a 8 bits mitigan parte del efecto, pero no hay métricas publicadas.
- Dependencia de versiones concretas (mlx 0.32.2, mlx-vlm 0.7.2, transformers 5.17.0); cambios de versión pueden alterar el comportamiento.
- Uso comercial permitido por Apache 2.0, pero sujeto a la licencia específica de Gemma 4 enlazada por el autor; conviene revisarla antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/astrocyte-productions/gemma-4-12B-it-qat-4bit
- Checkpoint base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio de mlx-vlm: no disponible en la información proporcionada (referenciado como dependencia)
- Paper o blog de Gemma 4: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
