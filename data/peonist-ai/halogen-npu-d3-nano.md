# peonist-ai/halogen-npu-d3-nano

## Resumen
halogen-npu-d3-nano es la conversión para la NPU XDNA2 de AMD (plataforma Strix Halo, Ryzen AI) del modelo de decisión vllm-sr/d3-nano, un clasificador de 2B parámetros construido sobre Qwen/Qwen3.5-2B. Lo publica el proyecto peonist-ai como parte de halogen-flash-server, un servidor que expone en el mismo puerto un modelo Flash en la GPU y este modelo de decisión en la NPU. Su función no es generar texto libre, sino resolver preguntas de clasificación "System One": elegir una opción entre 1 y 255 candidatas, devolver una etiqueta nula y una puntuación de confianza.

El interés técnico está en el formato: los pesos se distribuyen como un programa NPU compilado (d3-nano.hnpw, 2,59 GB) y un binario de dispositivos de 211 MB, más una torre de visión de 407 MB, de modo que no cargan en transformers ni en ningún runtime convencional. Solo funcionan dentro del contenedor halogen-flash-server 0.18.12 o superior, que descarga los ficheros, verifica tamaño y checksum, y los ejecuta en la NPU. Frente a su hermano d3-lite, mejora la precisión en preguntas difíciles (0,73 / 0,67 a 256 / 1.024 tokens frente a 0,56 / 0,59) a costa de 1,2 a 1,7 veces más latencia.

Es relevante ahora porque demuestra un patrón de despliegue híbrido NPU+GPU en hardware de consumo profesional (Strix Halo): el router semántico de vLLM Semantic Router Decision 3.0 corre en la NPU mientras la GPU queda libre para el modelo generativo. La licencia Apache-2.0 y el soporte de imagen (hasta 768 x 768, 2.304 parches de 16 píxeles) amplían su utilidad como clasificador multimodal de bajas latencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-2B) con torre de visión; empaquetado como programa NPU compilado para XDNA2 |
| Parametros totales | 2B (modelo base vllm-sr/d3-nano) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 8.192 tokens de prompt |
| Tipos de cuantizacion | no disponible (pesos convertidos a formato NPU .hnpw; no se publican precisiones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | .hnpw (2,59 GB) para NPU, programa de dispositivos (211 MB), torre de visión (407 MB), tokenizer propio (13 MB); no compatible con safetensors/GGUF |

## Arquitectura y entrenamiento
El modelo subyacente es vllm-sr/d3-nano, un modelo de decisión de 2B parámetros de la familia Decision 3.0 de vLLM Semantic Router, construido sobre Qwen/Qwen3.5-2B y convertido en esta revisión (462efc366229ea268cf4eed3738b3fc4415e4817) a un programa ejecutable en la NPU XDNA2 de Strix Halo. La conversión incluye el grafo compilado para la NPU (carpeta devices, 211 MB), los pesos en formato .hnpw, la torre de visión con sus propios pesos y programa, y el tokenizer original. No se publican detalles sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF, DPO o destilación desde un modelo mayor; la model card solo indica la relación de cuantización/conversión respecto al modelo base.

La innovación destacable no está en el entrenamiento sino en el empaquetado y el runtime: el modelo se ejecuta exclusivamente dentro de halogen-flash-server sobre la NPU, con la GPU dedicada al modelo Flash y ambos detrás del mismo puerto. El servidor valida tamaño y checksum de cada fichero antes de arrancar y sirve las peticiones mediante `POST /v1/systemone`. La torre de visión procesa imágenes con un presupuesto de 65.536 a 1.638.400 píxeles, recortando a 768 x 768 (o área equivalente) y 2.304 parches de 16 píxeles. El host requiere el driver de NPU, XRT con su plugin de NPU y mantener el reloj de fabric de la GPU durante la ejecución conjunta.

## Capacidades
- Clasificación zero-shot: selecciona una opción entre 1 y 255 candidatas, con etiqueta nula (`noul`) y puntuación (`score`) por respuesta.
- Modelo de decisión y enrutamiento: pensado como router semántico para decidir qué modelo o ruta atiende una consulta en vLLM Semantic Router Decision 3.0.
- Razonamiento "System One": respuestas rápidas de un solo paso, sin cadena de pensamiento extendida.
- Procesamiento de una imagen por petición (data URL o base64, como cadena o como `{"url": ...}`), visible para todas las preguntas de la petición.
- Ventana de prompt de hasta 8.192 tokens.
- No soporta vídeo.
- No soporta tool calling ni function calling según la información disponible.
- No es un modelo generativo de texto libre: no se documenta generación abierta, código ni matemáticas.
- Idiomas soportados no disponibles.

## Casos de uso
- Enrutamiento de consultas en un gateway LLM: el modelo clasifica cada petición entrante contra un conjunto de rutas o modelos candidatos (hasta 255 opciones) y devuelve la elección con su score, permitiendo que la GPU atienda solo la generación.
- Clasificación de intenciones en atención al cliente: con prompts de hasta 8.192 tokens se puede incluir el historial de conversación y las definiciones de categorías, y obtener una etiqueta con confianza en decenas o cientos de milisegundos.
- Moderación y triaje de contenido: clasificación binaria o multiclase de mensajes antes de pasarlos a un modelo mayor, reduciendo coste y latencia en el camino crítico.
- Clasificación multimodal de imágenes: con una imagen por petición y hasta 768 x 768 píxeles, sirve para etiquetar capturas, documentos escaneados o imágenes de producto dentro de pipelines de ingesta.
- Filtro previo en sistemas RAG: decidir si una consulta requiere recuperación, qué índice consultar o si debe rechazarse (opción nula), antes de invocar el modelo generativo.
- Despliegue en hardware de borde con NPU: en un equipo Strix Halo, el modelo corre en la NPU mientras la GPU queda libre para otro modelo, útil en estaciones de trabajo locales o entornos sin aceleradores dedicados adicionales.
- Evaluación de calidad de respuestas: usar la puntuación del clasificador para decidir si una respuesta generada cumple los criterios definidos como opciones.

## Benchmarks y rendimiento
Los únicos datos publicados son internos del autor (decision benchmark propio y comparación con la ejecución CPU del mismo modelo), no benchmarks estándar como MMLU o HumanEval.

| Metrica | d3-nano (NPU) | d3-lite (NPU) |
|---|---|---|
| Decision benchmark, 256 tokens | ~0,73 | 0,56 |
| Decision benchmark, 1.024 tokens | ~0,67 | 0,59 |
| Coincidencia NPU vs CPU (512 preguntas) | 502/512 | no disponible |
| Coincidencia en CV-Bench (64 preguntas) | 64/64 | no disponible |

| Latencia (Strix Halo, petición individual, HTTP incluido) | Valor |
|---|---|
| Estado corto | ~105 ms |
| 700 tokens | ~300 ms |
| 3.600 tokens | ~1,1 s |
| Imagen 256 x 256 (con torre de visión) | ~0,35 s |
| Imagen 768 x 768 (con torre de visión) | ~0,87 s |

## Requisitos de hardware
- NPU XDNA2 de AMD en plataforma Strix Halo (Ryzen AI); imprescindible, no hay ejecución en GPU ni CPU con estos ficheros.
- Driver de NPU y XRT con plugin de NPU instalados en el host.
- Reloj de fabric de la GPU fijado mientras la NPU trabaja junto a la GPU.
- Contenedor halogen-flash-server 0.18.12 o superior, con `HALOGEN_DOWNLOAD` activado y `HALOGEN_NPU_MODELS=d3-nano`; los ficheros se descargan en `/models/npu/d3-nano/`.
- Espacio en disco: unos 3,7 GB para el repositorio completo (2,59 GB de pesos + 211 MB de programa + 407 MB de visión + 13 MB de tokenizer).
- No cabe ni se ejecuta en GPU de consumo (RTX 4090, etc.), A100, H100 ni en llama.cpp, Ollama, vLLM o TGI.
- Throughput agregado no disponible; solo se publican latencias de petición individual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión (decision benchmark) | Licencia | Ejecución |
|---|---|---|---|---|---|
| halogen-npu-d3-nano | 2B | 8.192 tokens | ~0,73 / 0,67 (256 / 1.024 tokens) | Apache-2.0 | Solo NPU XDNA2 vía halogen-flash-server |
| halogen-npu-d3-lite | no disponible | no disponible | 0,56 / 0,59 (256 / 1.024 tokens) | no disponible | Solo NPU XDNA2 vía halogen-flash-server |
| vllm-sr/d3-nano (original) | 2B | no disponible | referencia CPU del mismo modelo | Apache-2.0 | Runtime estándar (transformers y otros) |

## Limitaciones y advertencias
- Los ficheros no cargan en transformers ni en ningún runtime convencional; solo funcionan dentro de halogen-flash-server sobre la NPU. El widget de inferencia del Hub está desactivado a propósito.
- Dependencia de una versión mínima del servidor (0.18.12); servidores anteriores descargan la revisión con la que se publicaron.
- No es un modelo generativo: no produce texto libre, código ni razonamiento abierto; su salida es una elección, una etiqueta nula y un score.
- No se documentan sesgos, composición del dataset ni idiomas soportados; la evaluación de sesgos y multilingüismo no está disponible.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas; el propio autor señala que los desacuerdos NPU-CPU se concentran en empates cercanos (10 de 512).
- Sin soporte de vídeo y con una sola imagen por petición, limitada a 768 x 768 o área equivalente.
- No se publican precisiones de cuantización ni el impacto de la conversión a .hnpw en la calidad más allá de la comparación con la ejecución CPU.
- Requiere hardware específico (Strix Halo con XDNA2) y configuración de driver y XRT; no es desplegable en infraestructura cloud estándar.
- Licencia Apache-2.0 permite uso comercial, pero `devices/NOTICE.md` incluye avisos de terceros que deben revisarse.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/peonist-ai/halogen-npu-d3-nano
- Modelo base: https://huggingface.co/vllm-sr/d3-nano
- Modelo hermano d3-lite: https://huggingface.co/peonist-ai/halogen-npu-d3-lite
- Repositorio del servidor: https://github.com/peonist-ai/halogen-flash-server
- Documentación de NPU: https://github.com/peonist-ai/halogen-flash-server/blob/main/docs/NPU.md
- Discord del proyecto: https://discord.gg/bcm6QknaV6
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-2B
