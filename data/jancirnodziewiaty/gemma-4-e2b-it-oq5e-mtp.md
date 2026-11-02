# jancirnodziewiaty/gemma-4-E2B-it-oQ5e-mtp

## Resumen

gemma-4-E2B-it-oQ5e-mtp es una cuantización mixta del modelo Gemma 4 E2B instruction-tuned, publicada por el usuario jancirnodziewiaty en Hugging Face. La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.3), que aplica precisión mixta por tensor en lugar de un único ancho de bits uniforme, logrando un promedio efectivo de 6,796 bits por peso sobre un checkpoint de 5.104 millones de parámetros reales almacenados en safetensors.

El modelo conserva la estructura multimodal del original: incluye submódulos de lenguaje (4.632B parámetros lógicos), visión (0.167B) y audio (0.305B), además de una cabeza MTP (multi-token prediction) de 0.078B parámetros. El checkpoint ocupa 4,4 GB en disco, lo que lo hace manejable en hardware de consumo con suficiente memoria unificada, especialmente en equipos Apple Silicon dado que la librería declarada es MLX.

La relevancia de esta ficha es doble: por un lado documenta una técnica de cuantización no uniforme (5, 6, 8 bits y BF16 mezclados según la sensibilidad de cada tensor) y, por otro, advierte de que se trata de una publicación sin métricas de evaluación, sin licencia declarada y sin información sobre idiomas o pipeline. Es un artefacto experimental, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión + audio) con cabeza MTP, según los componentes del checkpoint; detalles internos no disponibles |
| Parámetros totales | 5.104.297.539 (safetensors); 5.182B pesos lógicos según la model card |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: affine 5-bit group 64 (76,4 %), affine 6-bit group 64 (10,6 %), affine 8-bit group 64 (2,4 %), BF16 (10,6 %), I64 (0,005 %); media efectiva 6,796 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Gemma 4 E2B. Lo que sí se puede inferir del desglose de almacenamiento es que se trata de un modelo multimodal con cuatro bloques diferenciados: un modelo de lenguaje de 4.632B parámetros lógicos (3,301 GB), un codificador o torre de visión de 0.167B (0.335 GB), un módulo de audio de 0.305B (0.610 GB) y una cabeza de predicción multi-token (MTP) de 0.078B (0.158 GB). La presencia de MTP sugiere que el modelo base incorpora decodificación especulativa o predicción de varios tokens por paso, una técnica habitual para acelerar la inferencia.

El proceso de cuantización aplicado por oQ asigna anchos de bits distintos a cada tensor: la mayor parte de los pesos (76,4 %) se almacena en affine 5-bit con grupo de 64, mientras que un 10,6 % se mantiene en BF16 (probablemente capas sensibles como embeddings, normalizaciones o la cabeza de salida) y un 2,4 % sube a 8 bits. No se dispone de información sobre el dataset de entrenamiento del modelo original, el número de tokens procesados, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el bloque de lenguaje de 4.632B parámetros soporta conversación instruct y generación condicionada.
- Procesamiento de visión: incluye un módulo de visión de 0.167B parámetros, lo que implica capacidad de entender imágenes además de texto.
- Procesamiento de audio: incluye un módulo de audio de 0.305B parámetros, lo que implica capacidad de transcripción o comprensión de audio.
- Predicción multi-token (MTP): la cabeza dedicada de 0.078B permite generar varios tokens por paso de decodificación, reduciendo latencia en inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: al estar empaquetado para MLX y ocupar 4,4 GB, el checkpoint se puede cargar en un Mac con 16 GB de memoria unificada, lo que permite prototipar asistentes multimodales sin GPU dedicada.
- Prototipado de asistentes con entrada de imagen: el módulo de visión permite construir demos de descripción de imágenes, extracción de texto de capturas o respuesta a preguntas visuales en local, sin enviar datos a la nube.
- Transcripción y análisis de audio: el módulo de audio de 0.305B parámetros posibilita experimentos de resumen de reuniones o clasificación de clips de voz ejecutados en el propio dispositivo.
- Evaluación de técnicas de cuantización mixta: el checkpoint sirve como banco de pruebas para comparar la calidad de una asignación 5/6/8/BF16 frente a cuantizaciones uniformes de 4 u 8 bits sobre el mismo modelo base.
- Investigación sobre decodificación especulativa: la cabeza MTP permite medir la ganancia de throughput de la predicción multi-token en MLX frente a decodificación autoregresiva clásica.
- Despliegue en entornos con memoria limitada: con 4,1 GiB de pesos en disco, encaja en contenedores o dispositivos edge donde un checkpoint BF16 equivalente (unos 10 GB) no cabría.
- Fines educativos: útil para estudiar cómo se distribuyen los bits entre tensores en una cuantización sensible a la precisión y qué capas quedan en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 4,1 GiB; con overhead de activaciones y caché KV, se recomienda un mínimo de 8 GB de memoria unificada o VRAM para contexto corto, y 16 GB para contexto medio-largo (la longitud exacta de contexto no está disponible).
- GPU recomendadas: no se especifican; el formato MLX está optimizado para Apple Silicon (series M1, M2, M3, M4), donde el modelo debería caber en configuraciones de 16 GB o superiores.
- GPU de consumo: no hay confirmación de soporte en GPUs NVIDIA consumer (RTX 4090, etc.) con esta cuantización concreta, ya que el formato es MLX y no GGUF.
- Opciones de despliegue: MLX (librería declarada); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La presencia de la cabeza MTP sugiere optimización para decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-E2B-it-oQ5e-mtp | 5,10B (5,18B lógicos) | no disponible | Mixta 5/6/8/BF16 (6,796 bits/peso) | no disponible | safetensors (MLX) |
| Gemma 4 E2B-it (base, sin cuantizar) | no disponible en esta ficha | no disponible | BF16 | no disponible | safetensors |
| Cuantizaciones GGUF de la familia Gemma (4-bit/8-bit) | variable | variable | Uniforme 4 u 8 bits | según el publicador | GGUF |

No se dispone de datos de rendimiento comparado con alternativas, por lo que la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que verificar la licencia del modelo base Gemma 4 E2B-it antes de cualquier despliegue.
- Sin benchmarks: no hay evidencia publicada de que la cuantización mixta preserve la calidad del modelo original en tareas de razonamiento, visión o audio.
- Sin información de idiomas: se desconoce el soporte multilingüe real y la calidad en castellano.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación específica para este checkpoint.
- Formato restringido: al ser MLX, no es directamente portable a ecosistemas CUDA sin conversión previa.
- Publicación de autor único y sin tracción: 0 descargas y 0 likes en el momento de la ficha, lo que reduce la probabilidad de que los fallos hayan sido reportados por terceros.
- Contexto desconocido: no se puede planificar el uso en conversaciones largas sin conocer la ventana real del modelo base.
- La cabeza MTP y los módulos de audio/visión pueden degradarse de forma distinta a la del lenguaje bajo cuantización; no hay ablaciones publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/jancirnodziewiaty/gemma-4-E2B-it-oQ5e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
