# GroundingPI/GroundingPI

## Resumen

GroundingPI es un modelo fundacional de *grounding* visual de 4B parámetros (4.843.664.384 según los pesos en safetensors) desarrollado por el equipo GroundingPI. Su objetivo es resolver la localización precisa de objetos en imágenes: determinar qué objeto es el objetivo y dónde está, incluso en escenas con alta densidad de objetos y con objetos de tamaño muy reducido, y con la latencia suficiente para control en bucle cerrado. Para ello genera puntos y cajas como coordenadas cuantizadas dentro de un vocabulario compartido con las etiquetas semánticas y los marcadores de protocolo.

El modelo se presenta como alternativa a los backbones visuales de propósito general que emplean los modelos visión-lenguaje-acción (VLA) y los modelos mundo-acción (WAM), que según los autores fallan en escenarios de *grounding* exigentes. GroundingPI reporta un promedio de 73,68% frente a 44 baselines en 34 benchmarks de grounding que cubren 11 capacidades perceptivas, por encima del modelo de mayor tamaño GPT-6 Astra (71,54%). Como backbone visual downstream, los autores reportan mejoras en manipulación robótica (RoboTwin 2.0, hasta 24,8% relativo sobre el mejor backbone evaluado en los cuatro escenarios fuera de distribución) y en conducción autónoma (nuScenes, error L2 en bucle abierto de 0,296 m).

Es relevante ahora porque propone el preentrenamiento perceptivo dedicado como vía para modelos fundacionales de inteligencia física, y porque publica el checkpoint autorregresivo visión-lenguaje con licencia Apache 2.0 para las contribuciones propias, con la licencia Kimi K3 aplicándose al material derivado. El repositorio ocupa 9,8 GB y el modelo soporta inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje autorregresivo con vocabulario compartido para etiquetas semánticas, marcadores de protocolo, puntos y cajas |
| Parametros totales | 4.843.664.384 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 para contribuciones propias, con licencia Kimi K3 para material derivado (apache-2.0-with-upstream-kimi-k3) |
| Formato de pesos | Safetensors, con código personalizado (custom_code) para transformers |

## Arquitectura y entrenamiento

GroundingPI es un modelo visión-lenguaje autorregresivo que unifica la salida de *grounding* en un único vocabulario: las etiquetas semánticas, los marcadores de protocolo, los puntos y las cajas se representan como coordenadas cuantizadas dentro del mismo espacio de tokens. Esta decisión de diseño permite que un decoder autorregresivo genere localizaciones (puntos y cajas) como si fueran texto, sin cabezas específicas de detección ni decodificadores separados. El modelo se distribuye con código personalizado para `transformers` y pipeline `image-text-to-text`.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Sí se indica que el preentrenamiento perceptivo es específico para *grounding* (a diferencia de los backbones generalistas) y que el checkpoint publicado es el autorregresivo visión-lenguaje usado para *grounding*; los resultados de políticas de acción downstream se describen en el paper pero no se publican como pesos en este repositorio. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Localización de objetos de vocabulario abierto y *grounding* en escenas densas.
- Comprensión de expresiones referenciales (*referring-expression comprehension*) y localización guiada por prompt visual.
- Localización basada en puntos, razonamiento espacial y *grounding* de elementos de interfaz gráfica (GUI).
- OCR con localización del texto y comprensión de la disposición de documentos (*document layout*).
- Detección de objetos y generación de cajas delimitadoras como coordenadas cuantizadas.
- Generación de texto conversacional en el pipeline `image-text-to-text`.
- Capacidades multilingües limitadas a inglés y chino.
- Uso como backbone visual para sistemas de robótica, agentes encarnados y conducción autónoma (resultados reportados en el paper).
- No se documenta soporte explícito de *tool calling* ni de razonamiento multi-paso con agentes.

## Casos de uso

- Localización de objetos en robótica de manipulación: el modelo actúa como backbone perceptivo que devuelve puntos y cajas de los objetos objetivo, lo que permite cerrar el bucle de control con la latencia necesaria; los autores reportan mejoras en RoboTwin 2.0 frente a backbones generalistas.
- Conducción autónoma: uso como backbone visual para percibir y localizar elementos de la escena; en nuScenes se reporta un error L2 en bucle abierto de 0,296 m.
- Automatización de interfaces gráficas: *grounding* de elementos de GUI a partir de instrucciones en lenguaje natural, útil para agentes que operan aplicaciones mediante clics basados en coordenadas.
- Digitalización de documentos: OCR con localización del texto y comprensión de la disposición, adecuado para pipelines de extracción de datos de facturas, formularios y documentos escaneados.
- Anotación automática de datasets: generación de cajas y puntos para preetiquetar imágenes en proyectos de visión por computador, reduciendo el coste de anotación manual en escenas densas.
- Búsqueda visual y recuperación por referencia: localizar un objeto descrito por una expresión referencial ("el vaso rojo junto a la pantalla") en catálogos, imágenes de inventario o fotografías de almacén.
- Investigación en percepción para agentes encarnados: evaluación de un backbone perceptivo dedicado frente a modelos generalistas en tareas de *grounding* y planificación visual.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card y no incluyen el desglose por benchmark individual, solo agregados y resultados downstream.

| Benchmark | GroundingPI | Referencia comparada |
|---|---|---|
| Promedio en 34 benchmarks de grounding (11 capacidades) | 73,68% | GPT-6 Astra: 71,54% |
| RoboTwin 2.0 (4 escenarios fuera de distribución) | Mejor en los cuatro escenarios | Hasta 24,8% relativo por encima del mejor backbone evaluado |
| nuScenes (error L2 en bucle abierto) | 0,296 m | No disponible |

No se han publicado en la información disponible resultados desglosados de MMLU, HumanEval, GSM8K ni de benchmarks individuales de *grounding*.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4,84B parámetros, en FP16 se necesitan aproximadamente 9,7 GB solo para pesos, más memoria para el codificador visual, el procesador de imagen y la caché KV; en cuantización de 8 bits rondaría 5 GB y en 4 bits unos 2,5-3 GB, aunque el autor no publica cuantizaciones.
- GPU recomendadas: no disponible. Por tamaño, una GPU con 24 GB (RTX 4090, L4, A10G) debería acomodar el modelo en FP16 con margen; A100 y H100 son adecuadas para mayor throughput y contextos largos.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 16-24 GB en FP16, y en 8-12 GB si se generan cuantizaciones propias; no hay confirmación oficial.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repositorio usa `custom_code`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la model card marca `inference: false`, por lo que el despliegue estándar no está garantizado sin el código personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en grounding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GroundingPI | 4,84B | No disponible | 73,68% de promedio en 34 benchmarks | Apache 2.0 + Kimi K3 para derivados | Pesos en HF y ModelScope |
| GPT-6 Astra | No disponible (mayor) | No disponible | 71,54% de promedio en los mismos benchmarks | Propietaria | No disponible como pesos abiertos |
| Backbones generalistas evaluados en RoboTwin 2.0 | No disponible | No disponible | Hasta 24,8% relativo por debajo de GroundingPI | Variable | No disponible |

No se dispone de datos suficientes para comparar con alternativas abiertas de tamaño similar en tareas de *grounding*.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado en la model card; al generar coordenadas como tokens, existe riesgo de producir localizaciones plausibles pero incorrectas en escenas ambiguas.
- Limitaciones de idioma: solo inglés y chino; el resto de idiomas no están soportados oficialmente.
- Longitud de contexto: no especificada, lo que impide planificar casos de uso con muchas imágenes o prompts largos.
- Licencia: las contribuciones propias son Apache 2.0, pero el paquete combinado incluye material derivado de Kimi K3 cuya licencia sigue aplicándose en uso y redistribución; es necesario revisar el archivo LICENSE antes de un despliegue comercial.
- Producción: el repositorio usa código personalizado (`trust_remote_code`) y la model card declara `inference: false`; no hay cuantizaciones oficiales ni soporte documentado en servidores de inferencia habituales.
- Los resultados downstream de robótica y conducción provienen del paper; el repositorio solo publica el checkpoint visión-lenguaje, no las políticas de acción.

## Enlaces

- Hugging Face: https://huggingface.co/GroundingPI/GroundingPI
- ModelScope: https://www.modelscope.ai/models/GroundingPI/GroundingPI
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/GroundingPI/GroundingPI
- Página del proyecto: https://groundingpi.github.io/
- Código en GitHub: https://github.com/groundingpi/GroundingPI
- Paper (arXiv): https://arxiv.org/abs/2609.39601
- Página del paper en HF: https://huggingface.co/papers/2609.39601
- Reporte divulgativo: https://mp.weixin.qq.com/s/MWR6Rqv_3ieamBd5AJk0qw
