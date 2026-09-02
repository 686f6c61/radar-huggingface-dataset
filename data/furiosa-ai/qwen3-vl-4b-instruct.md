# furiosa-ai/Qwen3-VL-4B-Instruct

## Resumen

Este repositorio contiene una versión de Qwen3-VL-4B-Instruct, un modelo denso de visión-lenguaje de 4,4 mil millones de parámetros desarrollado por Alibaba Cloud, empaquetado por FuriosaAI junto con un Furiosa Executable Bundle (FXB) para su ejecución en aceleradores FuriosaAI RNGD mediante el framework Furiosa-LLM. El modelo combina un codificador de visión con un decodificador transformer denso, emplea embeddings posicionales Interleaved-MRoPE y fusión de características multinivel DeepStack para procesar imágenes y vídeo junto con texto.

La relevancia de esta publicación radica en que ofrece un bundle precompilado que permite desplegar un modelo multimodal de última generación en hardware RNGD sin necesidad de cuantización, manteniendo la precisión original de los pesos. Se trata de la edición Instruct (no-thinking), que no emite cadenas de razonamiento explícitas, y soporta de forma nativa tool calling mediante el parser hermes. El mismo modelo puede ejecutarse también en otros frameworks como vLLM, SGLang o Transformers, tal y como indica la model card upstream.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (densa): codificador de visión + decodificador transformer denso |
| Parametros totales | 4.437.815.808 (4,4 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Sin cuantización (precisión original de los pesos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos) y Furiosa Executable Bundle (FXB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-VL en su variante densa: un codificador de visión procesa las entradas visuales y las fusiona con el decodificador transformer mediante Interleaved-MRoPE, un esquema de embeddings posicionales que intercala información multimodal, y DeepStack, una técnica de fusión de características a múltiples niveles. Esta combinación permite manejar imágenes y vídeo junto con texto en una única pasada. El modelo es un fine-tune del modelo base Qwen/Qwen3-VL-4B-Instruct, pero no se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La innovación principal de esta publicación es el bundle FXB precompilado, que elimina la necesidad de compilar el modelo para el hardware RNGD.

## Capacidades

- Comprensión visual multimodal: OCR, análisis de documentos y gráficos, razonamiento espacial y comprensión de vídeo.
- Tool calling / function calling: soporte nativo mediante el parser hermes, activable con las opciones `--enable-auto-tool-choice` y `--tool-call-parser hermes`.
- Entrada multimodal: acepta mensajes de chat en formato OpenAI con partes de contenido `image_url` (URL remota, base64 o ruta local) junto con texto.
- API compatible con OpenAI: expone un endpoint `/v1/chat/completions` para integración directa con clientes estándar.
- Edición Instruct (no-thinking): no emite cadenas de razonamiento explícitas antes de la respuesta final.
- Opciones de control multimodal: límites por petición de imágenes y vídeos, listas blancas de dominios remotos para protección SSRF y caché de procesador multimodal con clave UUID.

## Casos de uso

- Extracción de datos de documentos escaneados: el modelo puede realizar OCR y estructurar la información extraída, lo que permite automatizar la digitalización de facturas, contratos o formularios en flujos de procesamiento documental.
- Análisis de gráficos y tablas para informes financieros: dado un gráfico de cotizaciones o una tabla de resultados, el modelo genera resúmenes textuales o responde preguntas específicas sobre los datos representados.
- Atención al cliente con soporte de imágenes: un asistente conversacional puede recibir capturas de pantalla o fotos de productos enviadas por el usuario y responder con instrucciones o diagnósticos, aprovechando la ventana multimodal y el tool calling para consultar sistemas externos.
- Generación de descripciones de imágenes para accesibilidad: el modelo produce descripciones detalladas de imágenes que pueden integrarse en herramientas de lectura de pantalla o en la generación automática de texto alternativo para sitios web.
- Resumen y búsqueda en vídeo: gracias a la comprensión de vídeo, el modelo puede resumir el contenido de un clip o localizar momentos concretos a partir de una consulta textual, útil en sistemas de gestión de archivos multimedia.
- Agentes con tool calling para automatización de tareas: el modelo puede decidir cuándo invocar funciones externas (por ejemplo, consultar una API meteorológica o un sistema de reservas) dentro de un flujo agéntico, combinando la entrada visual con llamadas a herramientas.
- Razonamiento espacial para aplicaciones de navegación o robótica: el modelo interpreta imágenes de entornos y responde a preguntas sobre posiciones relativas o distancias, lo que puede integrarse en sistemas de asistencia a la navegación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware soportado: FuriosaAI RNGD, con una estrategia de paralelismo de tensor-parallel size 8 PEs, que mapea a una única tarjeta RNGD (8 PEs por tarjeta).
- No se especifican requisitos de VRAM, latencia ni throughput en la documentación disponible.
- No está diseñado para GPU de consumo estándar (NVIDIA, AMD); el bundle FXB está compilado específicamente para RNGD.
- Opciones de despliegue: Furiosa-LLM mediante el comando `furiosa-llm serve furiosa-ai/Qwen3-VL-4B-Instruct`; el modelo upstream también puede ejecutarse con vLLM, SGLang o Transformers, aunque sin el bundle FXB.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|
| furiosa-ai/Qwen3-VL-4B-Instruct (este) | 4,4B | Densa, visión-lenguaje | Apache 2.0 | Bundle FXB para RNGD + pesos safetensors |
| Qwen/Qwen3-VL-4B-Instruct (upstream) | 4,4B | Densa, visión-lenguaje | Apache 2.0 | Pesos estándar, ejecutable en vLLM, SGLang, Transformers |
| Qwen3-VL-4B-Thinking (edición Thinking) | 4,4B | Densa, visión-lenguaje | Apache 2.0 | Emite cadena de razonamiento explícita; también publicada por FuriosaAI |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El bundle FXB está compilado exclusivamente para hardware FuriosaAI RNGD; no puede ejecutarse en GPU convencionales sin recurrir al modelo upstream y a otros frameworks.
- Al ser la edición Instruct (no-thinking), no genera cadenas de razonamiento explícitas, lo que puede limitar su uso en tareas que requieran justificación detallada de las respuestas.
- No se especifican los idiomas soportados en la model card; se recomienda verificar la documentación upstream para conocer la cobertura multilingüe real.
- No se han publicado benchmarks propios, por lo que el rendimiento en tareas específicas debe evaluarse de forma independiente.
- Como todo modelo de lenguaje multimodal, existe riesgo de alucinación en la descripción de imágenes o en la interpretación de gráficos, especialmente con entradas ambiguas o de baja calidad.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue en producción depende de la disponibilidad de hardware RNGD y del framework Furiosa-LLM, cuyos requisitos de instalación y soporte deben verificarse con el fabricante.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Qwen3-VL-4B-Instruct
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de modelos Qwen3-VL en FuriosaAI: https://developer.furiosa.ai/latest/en/furiosa_llm/models/qwen3-vl.html
- Guía de modelos de visión-lenguaje: https://developer.furiosa.ai/latest/en/furiosa_llm/vision-language.html
- Guía de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
