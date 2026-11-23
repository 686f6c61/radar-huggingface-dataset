# furiosa-ai/Qwen3-VL-4B-Thinking

## Resumen

Qwen3-VL-4B-Thinking es un modelo denso de visión y lenguaje de 4.437.815.808 parámetros (aproximadamente 4,4 mil millones) desarrollado por el equipo Qwen de Alibaba. Este repositorio concreto, publicado por furiosa-ai, empaqueta los pesos originales del modelo junto con un Furiosa Executable Bundle (FXB) para ejecutarlo sobre aceleradores FuriosaAI RNGD mediante la librería Furiosa-LLM. El modelo combina un codificador visual con un decodificador transformer denso y emplea embeddings posicionales Interleaved-MRoPE junto con fusión de características multinivel DeepStack.

La variante Thinking emite una cadena de razonamiento explícita antes de la respuesta final, lo que la hace adecuada para tareas que requieren pasos intermedios verificables, como análisis de documentos, razonamiento espacial o comprensión de vídeo. El modelo acepta entradas multimodales (imagen y texto) y produce texto, con soporte nativo de tool calling o function calling.

Su relevancia actual radica en que ofrece capacidades de razonamiento visual en un tamaño reducido (4B) bajo licencia Apache 2.0, lo que facilita el despliegue en hardware especializado. En este repositorio, la inferencia se realiza con precisión completa, sin cuantización, y con una estrategia de paralelismo tensorial de 8 PEs, que corresponde a una única tarjeta RNGD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer denso con codificador visual) |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ninguna (se ejecuta en la misma precisión que los pesos originales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (junto con Furiosa Executable Bundle, FXB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-VL en su variante densa: un codificador visual acoplado a un decodificador transformer. Incorpora Interleaved-MRoPE como esquema de embeddings posicionales y DeepStack para la fusión de características visuales en varios niveles, lo que permite al decodificador integrar información visual a distintas profundidades de la red. La variante Thinking está entrenada para generar una cadena de razonamiento antes de la respuesta final, y el servidor Furiosa-LLM la separa mediante el parser de razonamiento `qwen3`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la información proporcionada. El repositorio no aplica cuantización y despliega el modelo con paralelismo tensorial de tamaño 8 PEs sobre una sola tarjeta RNGD.

## Capacidades

- Generación de texto y razonamiento con cadena de pensamiento explícita (edición Thinking).
- Comprensión visual: descripción de imágenes, OCR, análisis de documentos y gráficos, razonamiento espacial y comprensión de vídeo.
- Entrada multimodal con mensajes estilo OpenAI que incluyen partes `image_url` junto a texto.
- Tool calling / function calling nativo, mediante el parser de herramientas `hermes`.
- Razonamiento multi-paso y soporte para flujos de agentes.
- Separación de la cadena de razonamiento del texto final en la API (campos `reasoning` en respuestas no streaming y en deltas de streaming).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos y OCR: el modelo puede recibir imágenes de facturas, formularios o páginas escaneadas y extraer texto estructurado, aprovechando su cadena de razonamiento para verificar la lectura antes de emitir la respuesta.
- Comprensión de gráficos e informes: útil para interpretar diagramas, tablas y gráficos en paneles de datos, describiendo tendencias y valores concretos a partir de la imagen.
- Razonamiento espacial en imágenes: aplicable a tareas de inspección visual o robótica asistida donde se requiere localizar y relacionar objetos dentro de una escena.
- Comprensión de vídeo: resumen y respuesta a preguntas sobre secuencias de vídeo, adecuado para indexación de contenido o análisis de material audiovisual.
- Asistentes con tool calling: integración en agentes que combinan percepción visual con llamadas a funciones externas (APIs, bases de datos) mediante el parser `hermes`.
- Automatización de atención al cliente con soporte visual: el modelo puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas o fotos, manteniendo el razonamiento separado de la respuesta final.
- Despliegue sobre aceleradores FuriosaAI RNGD: escenario específico de este repositorio, orientado a entornos que ya operan con la pila Furiosa-LLM y buscan un modelo visión-lenguaje con razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 4.437.815.808 parámetros en precisión completa, el peso de los pesos ronda los 8,9 GB en FP16/BF16, sin contar el codificador visual ni el overhead de activaciones.
- Hardware objetivo de este repositorio: FuriosaAI RNGD, con paralelismo tensorial de 8 PEs (una tarjeta RNGD contiene 8 PEs).
- GPU de consumo: no disponible en la información proporcionada; el repositorio está orientado a aceleradores FuriosaAI.
- Opciones de despliegue: Furiosa-LLM (`furiosa-llm serve`) como opción principal de este bundle; el modelo también puede ejecutarse con vLLM, SGLang y Transformers según la model card original de Qwen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-VL-4B-Thinking (este repo) | 4.437.815.808 | no disponible | Apache 2.0 | Hugging Face, con bundle FXB para FuriosaAI RNGD |
| Qwen/Qwen3-VL-4B-Thinking (upstream) | 4.437.815.808 | no disponible | Apache 2.0 | Hugging Face, ejecutable en vLLM, SGLang y Transformers |
| Alternativas de mismo tamaño o tarea | no disponible | no disponible | no disponible | no disponible |

La única comparación directa documentada es con el modelo upstream, del que este repositorio es un empaquetado para hardware FuriosaAI. No se dispone de datos de rendimiento comparado con otras alternativas.

## Limitaciones y advertencias

- Este repositorio está pensado para ejecutarse con Furiosa-LLM sobre FuriosaAI RNGD; para otros frameworks debe consultarse la model card del modelo upstream.
- No se aplica cuantización, por lo que los requisitos de memoria son mayores que en versiones cuantizadas.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de OCR y lectura de gráficos con imágenes de baja calidad.
- La cadena de razonamiento puede aumentar la latencia y el consumo de tokens frente a variantes no Thinking.
- No se dispone de información sobre sesgos conocidos, cobertura de idiomas ni longitud de contexto en la documentación proporcionada.
- El campo `reasoning` no forma parte de la especificación de la API de OpenAI; su acceso cuando no existe lanza `AttributeError`.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de las dependencias de Furiosa-LLM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-VL-4B-Thinking
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Guía de modelos visión-lenguaje de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/vision-language.html#server-options
- Web de FuriosaAI: https://furiosa.ai
