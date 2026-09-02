# furiosa-ai/Qwen3-VL-2B-Instruct

## Resumen

Qwen3-VL-2B-Instruct es un modelo de visión-lenguaje (VLM) denso de 2.127 millones de parámetros, desarrollado por Alibaba en la serie Qwen3-VL y empaquetado por FuriosaAI para su ejecución en el acelerador RNGD mediante el framework Furiosa-LLM. Este repositorio concreto incluye el modelo original junto con un Furiosa Executable Bundle (FXB) que permite servirlo de forma optimizada en hardware de FuriosaAI, aunque el modelo también puede ejecutarse con vLLM, SGLang o Transformers usando los pesos originales.

El modelo combina un codificador visual con un decodificador transformer denso, emplea embeddings posicionales Interleaved-MRoPE y fusión de características multi-nivel DeepStack. Está orientado a tareas de comprensión visual como OCR, análisis de documentos y gráficos, razonamiento espacial y comprensión de vídeo, e incluye soporte nativo para tool calling. Es la versión Instruct (no-thinking), es decir, no emite cadenas de razonamiento explícitas. Su licencia Apache 2.0 permite uso comercial sin restricciones.

La relevancia de esta publicación radica en que ofrece un paquete listo para producción en hardware especializado de FuriosaAI, con una API compatible con OpenAI y opciones de seguridad para el acceso a imágenes remotas o locales. Es una opción ligera (2B) para despliegues multimodales en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (dense, vision encoder + transformer decoder) |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sin cuantizacion (precision original de los pesos) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, FXB (Furiosa Executable Bundle) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-VL: un codificador de vision (vision encoder) que procesa imagenes y video, conectado a un decodificador transformer denso. Utiliza Interleaved-MRoPE (Multi-modal Rotary Position Embedding) para codificar posiciones en secuencias intercaladas de texto e imagen, y DeepStack, un mecanismo de fusion de caracteristicas multi-nivel que combina informacion de distintas capas del codificador visual. El modelo acepta entradas de imagen y texto y produce texto como salida.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. Al ser una version Instruct, se asume un ajuste fino supervisado sobre el modelo base, pero los datos concretos no estan disponibles en la documentacion proporcionada. El repositorio de FuriosaAI no modifica los pesos; simplemente los empaqueta con un bundle de ejecucion para RNGD.

## Capacidades

- Comprension de imagenes y video: el modelo puede analizar fotografias, capturas de pantalla, documentos escaneados y secuencias de video, respondiendo preguntas sobre su contenido.
- OCR y analisis de documentos: extrae texto de imagenes y comprende la estructura de documentos, tablas y graficos.
- Razonamiento espacial: interpreta relaciones espaciales entre objetos en una imagen, util para tareas de navegacion o descripcion de escenas.
- Tool calling (function calling): soporta invocacion de funciones mediante el parser `hermes`, permitiendo que el modelo decida llamar a herramientas externas durante una conversacion.
- API compatible con OpenAI: acepta mensajes multimodales con partes `image_url` y texto, facilitando la integracion con clientes existentes.
- Procesamiento de imagenes remotas y locales: admite URLs HTTP/HTTPS, data URLs en base64 y rutas de archivo locales (estas ultimas con restricciones de seguridad configurables).
- Cache de procesador multimodal: permite reutilizar imagenes ya procesadas mediante un identificador UUID, reduciendo latencia en conversaciones multi-turno.

## Casos de uso

- Atencion al cliente con soporte visual: el modelo puede recibir capturas de pantalla o fotos de productos enviadas por usuarios y responder preguntas sobre ellos, manteniendo el contexto de la conversacion gracias a su capacidad multimodal.
- Extraccion de datos de documentos: en flujos de trabajo de digitalizacion, el modelo convierte facturas, formularios o tarjetas de visita en texto estructurado, reduciendo la intervencion manual.
- Analisis de graficos y tablas: integrado en herramientas de business intelligence, permite a los usuarios preguntar en lenguaje natural sobre datos representados en imagenes, como graficos de ventas o informes financieros.
- Agentes con tool calling: el modelo puede actuar como orquestador en un sistema de agentes, decidiendo cuando llamar a APIs externas (por ejemplo, consultar una base de datos o enviar un correo) basandose en la entrada visual y textual.
- Moderacion de contenido visual: en plataformas de contenido generado por usuarios, el modelo clasifica imagenes o videos para detectar elementos inapropiados, combinando vision y comprension de texto.
- Asistencia en entornos industriales: un operario puede fotografiar una maquina o un panel de control y recibir instrucciones de mantenimiento o diagnosticos basados en la imagen, gracias al razonamiento espacial y la comprension de escenas.
- Generacion de descripciones accesibles: el modelo produce descripciones alternativas (alt text) para imagenes en sitios web o aplicaciones, mejorando la accesibilidad para personas con discapacidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de FuriosaAI no incluye metricas de evaluacion (como MMLU, HumanEval o benchmarks de vision) ni comparaciones con otros modelos. Para datos de rendimiento del modelo base, se debe consultar la documentacion oficial de Qwen3-VL.

## Requisitos de hardware

- Hardware objetivo: FuriosaAI RNGD, con una configuracion de tensor-parallel de 8 PEs (processing elements), que corresponde a una sola tarjeta RNGD.
- No se especifica VRAM en la documentacion, pero al ser un modelo de 2B con pesos en precision original (sin cuantizacion), el consumo de memoria sera proporcional al tamano de los pesos (aproximadamente 4-5 GB en FP16, aunque el bundle FXB puede tener requisitos adicionales).
- No esta disenado para GPUs de consumo (como RTX 4090) en su formato FXB; para ejecutarlo en hardware estandar se deben usar los pesos originales de Qwen/Qwen3-VL-2B-Instruct con frameworks como vLLM, SGLang o Transformers.
- Opciones de despliegue: Furiosa-LLM (servidor con API OpenAI-compatible), vLLM, SGLang, Transformers (para el modelo base).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El modelo es identico al Qwen/Qwen3-VL-2B-Instruct original, con la unica diferencia de que este repositorio incluye un bundle FXB para hardware FuriosaAI. No se han proporcionado comparaciones con otros VLM de tamano similar (por ejemplo, Phi-3.5-vision o LLaVA), por lo que no es posible establecer una tabla comparativa fiable.

## Limitaciones y advertencias

- Al ser un modelo de 2B de parametros, su capacidad de razonamiento complejo y de comprension de escenas muy densas es limitada en comparacion con modelos mas grandes de la misma familia (por ejemplo, Qwen3-VL-8B o 32B).
- No se han documentado sesgos especificos, pero como cualquier modelo entrenado con datos web, puede reflejar sesgos presentes en esos datos.
- Riesgo de alucinacion: puede generar descripciones o respuestas incorrectas sobre imagenes ambiguas o de baja calidad.
- La longitud de contexto no esta especificada en la documentacion; se recomienda consultar la ficha del modelo base para conocer el limite real.
- El bundle FXB solo funciona en hardware FuriosaAI RNGD; no es portable a otras arquitecturas. Para uso general, se debe emplear el modelo base con otros frameworks.
- La configuracion de seguridad para acceso a imagenes remotas (SSRF) y locales requiere una configuracion explicita de los parametros `--allowed-media-domains` y `--allowed-local-media-path`; sin ellos, el acceso a archivos locales esta deshabilitado y las URLs remotas pueden estar restringidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Qwen3-VL-2B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Documentacion de Furiosa-LLM para Qwen3-VL: https://developer.furiosa.ai/latest/en/furiosa_llm/models/qwen3-vl.html
- Guia de modelos de vision-lenguaje de Furiosa: https://developer.furiosa.ai/latest/en/furiosa_llm/vision-language.html
- Guia de tool calling de Furiosa: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
