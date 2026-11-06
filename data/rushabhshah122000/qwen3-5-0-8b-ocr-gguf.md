# RushabhShah122000/qwen3.5-0.8b-ocr-gguf

## Resumen

qwen3.5-0.8b-ocr-gguf es un modelo de lenguaje y vision (vision-language model, VLM) de pequeno tamano publicado por el usuario RushabhShah122000 en Hugging Face. Se trata de un ajuste fino (finetune) orientado a OCR del modelo Qwen3.5-0.8B, posteriormente convertido a formato GGUF mediante Unsloth para su uso con llama.cpp. El modelo cuenta con 772.845.888 parametros totales (aproximadamente 0,77 mil millones), lo que lo situa en la gama ultra-ligera y lo hace apto para inferencia en hardware modesto.

El modelo esta etiquetado como vision-language-model y como conversacional, e incluye un fichero de proyeccion multimodal (mmproj) que permite procesar imagenes ademas de texto. Su proposito declarado es la extraccion de texto a partir de imagenes (OCR) dentro de un pipeline multimodal gestionado por llama.cpp.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio no incluye model card detallada, no declara licencia, no especifica idiomas ni publica resultados de benchmarks. El numero de descargas y likes es cero en el momento de la consulta, y la fecha de creacion indicada (2026-11-04) resulta anomala. Toda la informacion disponible proviene de los metadatos del repositorio y de la breve model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-0.8B; transformer con proyeccion multimodal, segun tags) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, F16 (ficheros GGUF publicados); proyeccion multimodal en F16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); fichero mmproj F16 para la parte multimodal |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. Por los tags y el nombre del repositorio se infiere que deriva de Qwen3.5-0.8B, un modelo de la familia Qwen 3.5 de Alibaba, y que incorpora una torre de vision con proyeccion multimodal (fichero `Qwen3.5-0.8B.F16-mmproj.gguf`), lo que lo convierte en un VLM. El ajuste fino se realizo, segun la model card, con Unsloth, y posteriormente se convirtio a GGUF.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset de ajuste fino, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica innovacion mencionada es el propio flujo de entrenamiento y conversion con Unsloth, que el autor describe como "2x faster".

## Capacidades

- Generacion de texto conversacional (etiqueta "conversational").
- Procesamiento de imagenes y extraccion de texto (OCR) mediante el fichero de proyeccion multimodal mmproj.
- Inferencia multimodal con `llama-mtmd-cli` y texto puro con `llama-cli`, ambos con soporte `--jinja` para plantillas de chat.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere uso a traves de APIs compatibles con llama.cpp.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Modo thinking, vision, audio: vision confirmada por los tags; thinking y audio no disponibles.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo puede recibir imagenes de facturas, recibos o formularios y extraer el texto mediante su torre de vision, aprovechando el formato GGUF para ejecutarse en local sin GPU dedicada.
- Extraccion de texto de capturas de pantalla: util para pipelines de automatizacion que necesiten leer interfaces de usuario o notificaciones en imagenes.
- Preprocesado OCR en entornos con recursos limitados: al tratarse de un modelo de menos de mil millones de parametros y disponible en Q4_K_M, puede desplegarse en equipos de sobremesa o portatiles para tareas de OCR por lotes.
- Prototipado rapido de asistentes multimodales: la combinacion de texto e imagen en un unico modelo permite construir demos conversacionales que respondan a preguntas sobre imagenes.
- Integracion en aplicaciones de escritorio o CLI: gracias a llama.cpp y a los binarios `llama-cli` y `llama-mtmd-cli`, puede embeberse en herramientas de linea de comandos o aplicaciones nativas.
- Filtrado y clasificacion de imagenes con texto: el modelo puede transcribir el contenido textual de imagenes para alimentar sistemas de busqueda o indexacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q4_K_M (el fichero Q4_K_M de un modelo de ~0,77 mil millones de parametros ocupa aproximadamente 0,5-0,6 GB), alrededor de 1 GB en Q8_0 y aproximadamente 1,5-1,6 GB en F16, a lo que se suma el fichero mmproj F16 para la parte multimodal.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM es suficiente; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna (GTX 1050 Ti o superior, RTX 3050, RTX 4090, etc.), e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y por extension cualquier frontend compatible con GGUF como Ollama o LM Studio (no confirmado explicitamente en la model card). vLLM y TGI no estan indicados para este formato.
- Latencia y throughput estimados: no disponibles en la informacion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables en la informacion proporcionada. Como referencia estructural, se puede comparar con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| qwen3.5-0.8b-ocr-gguf | 772.845.888 | no disponible | no disponible | GGUF |
| Qwen3.5-0.8B (base) | ~0,8 mil millones | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos OCR comparables (por ejemplo, variantes especializadas en OCR de otros desarrolladores) en los datos proporcionados.

## Limitaciones y advertencias

- La model card es extremadamente escasa: no documenta dataset de entrenamiento, licencia, idiomas ni evaluacion, lo que impide validar su calidad para produccion.
- El repositorio no declara licencia, por lo que el uso comercial queda en un limbo legal hasta que el autor lo aclare.
- El numero de descargas y likes es cero, y la fecha de creacion indicada (2026-11-04) es futura respecto a la fecha habitual de publicacion, lo que sugiere metadatos anomalos o no verificados.
- Al ser un modelo de menos de mil millones de parametros, es esperable una capacidad de razonamiento y de OCR limitada en comparacion con modelos de mayor tamano; no hay datos que lo confirmen.
- No se documentan sesgos conocidos ni riesgos de alucinacion especificos, pero al ser un finetune de un modelo pequeno, el riesgo de alucinacion en tareas de OCR (texto inventado) es plausible y no ha sido evaluado.
- No se especifican limitaciones de contexto ni de idioma.
- El uso de `--jinja` es necesario para las plantillas de chat; sin el, el comportamiento conversacional puede degradarse.
- Para la parte multimodal es imprescindible cargar el fichero mmproj junto con el modelo principal; omitirlo desactiva la capacidad de vision.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RushabhShah122000/qwen3.5-0.8b-ocr-gguf
- Unsloth (herramienta de entrenamiento y conversion): https://github.com/unslothai/unsloth
- llama.cpp (motor de inferencia GGUF): no se proporciona enlace directo en la informacion, pero es el runtime implicito por los tags y los comandos de ejemplo.
