# Sauers/BeeLLM-Somnia

## Resumen

Somnia es un modelo de lenguaje de 13,6 millones de parámetros publicado por Sauers el 19 de octubre de 2026. Es la continuación de BeeLLM-Mellifera y se presenta como un personaje: una abeja que conversa mediante una plantilla de chat propia, etiquetas de estado de ánimo y respuestas breves. No es un LLM de propósito general, sino un modelo de juguete orientado a demos de personaje, arte interactivo y experimentación con modelos diminutos.

Técnicamente hereda la arquitectura Llama y el tokenizador de BeeLLM, con 8 capas, un vocabulario de 4.608 tokens y una ventana de contexto de 4.096 tokens. Se distribuye en GGUF, tanto en Q8_0 como en float32, para su uso con llama.cpp, y cuenta con licencia Apache 2.0.

Su interés actual está en el proceso de entrenamiento posterior: conversaciones generadas a partir de continuaciones de modelos base, selección y corte manual asistido por Claude, pérdida goldfish para limitar la memorización y una cuantización Q8_0 reproducible. No compite en rendimiento con modelos convencionales y no se han publicado benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama, 8 capas |
| Parámetros totales | 13.604.160 (13,6 M) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | Q8_0; también se distribuye una versión float32 sin cuantizar |
| Idiomas soportados | No disponible; la documentación solo describe conversaciones y textos en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0 y float32) |
| Modelo base | Sauers/BeeLLM-Mellifera |
| Vocabulario | 4.608 tokens |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Somnia es un transformer decoder-only de tipo Llama, no un modelo MoE. Tiene 8 capas, 13.604.160 parámetros y un vocabulario de 4.608 tokens. Conserva el tokenizador, la plantilla de chat y el sistema de etiquetas de ánimo de BeeLLM. La model card indica que parte de Sauers/BeeLLM-Mellifera, que a su vez deriva de BeeLLM 12M Mood, de schizophyllume.

El entrenamiento posterior se describe en varias fases: lectura de libros de naturaleza y poemas bajo la pérdida goldfish, que omite uno de cada cuatro tokens para que el modelo no pueda recitar los textos; un arranque en caliente con aproximadamente 1.850 conversaciones de abeja escritas por Claude; y una mezcla de 284 conversaciones «loomed» —de 336 generadas— con libros y relatos en inglés. Las respuestas se obtuvieron de continuaciones de Llama 3.1 405B o Trinity-Large-TrueBase, servidos por ACS Research, y Claude Opus 5.5 solo seleccionó, descartó o cortó continuaciones. La model card reporta una evaluación de memorización con 200 pasajes: tras dar los primeros 48 tokens y decodificar de forma greedy, la coincidencia más larga promedió 0,79 tokens, con un máximo de 5 y ninguna secuencia de 16. No se detalla el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional breve en inglés, con una voz de personaje muy marcada.
- Emisión de una etiqueta de estado de ánimo al inicio de cada respuesta, con el formato `[mood:level]`: neutral, happy, loving, sad, angry o confused, y nivel low o high.
- Posibilidad de devolver una respuesta vacía como forma de silencio.
- Plantilla de chat propia: `<|user|>tu texto<|bee|>su respuesta</s>`.
- Compatibilidad documentada con llama.cpp y llama-server mediante GGUF.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, generación de código fiable, matemáticas, visión ni audio.
- No hay información sobre capacidades multilingües; la documentación y los ejemplos están en inglés.

## Casos de uso

- Instalación de arte interactiva o chatbot de personaje: el modelo puede ejecutarse en local con llama-server y responder con etiquetas de ánimo y silencios, lo que encaja en una obra que explore una voz no humana y un comportamiento extraño.
- Prototipo de NPC para una game jam: sus 13,6 M de parámetros permiten integrarlo en un ordenador de desarrollo sin GPU dedicada y probar diálogos de personaje con contexto de 4.096 tokens.
- Prueba de humo de pipelines GGUF y llama.cpp: sirve para validar la carga de un GGUF, la plantilla de chat, el muestreo y la cuantización Q8_0 con un modelo muy pequeño y un repositorio de 0,1 GB.
- Docencia sobre modelos de lenguaje: permite ilustrar capas, tokenizador, ventana de contexto, cuantización y límites de un modelo de 13,6 M en un portátil o una placa SBC.
- Investigación sobre memorización y pérdida goldfish: el modelo y el código de entrenamiento permiten reproducir el protocolo de evaluación descrito y comparar continuaciones sobre pasajes de libros.
- Escritura creativa de microficción y poesía: con top-k 40, top-p 0,95, min-p 0,05, temperatura 0,85 y varias muestras por respuesta, puede generar variaciones breves y extrañas para un proyecto literario o experimental.
- Demo educativa de un chatbot de personaje en una web: su reducido tamaño permite desplegarlo en un servidor modesto, siempre que se asuma que muchas respuestas serán incoherentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Pesos Q8_0: aproximadamente 13,6 MB; pesos float32: aproximadamente 54,4 MB, calculados a partir de los 13.604.160 parámetros.
- VRAM estimada para inferencia: menos de 1 GB en ambos formatos; no se proporcionan mediciones oficiales de memoria.
- GPU recomendadas: ninguna GPU dedicada. Cualquier GPU consumer moderna puede ejecutarlo, pero A100 o H100 resultan desproporcionadas para este tamaño.
- CPU: viable en x86 y ARM; no se publican cifras de latencia ni de throughput.
- Despliegue documentado: llama.cpp y llama-server. Al ser GGUF, puede cargarse en otros runners compatibles, pero no se documenta Ollama, vLLM ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de benchmarks comparables; la comparación se limita al linaje y a las especificaciones publicadas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---:|---|---|---|
| Somnia | 13,6 M | 4.096 | Apache 2.0 | GGUF en Hugging Face | Sucesor de Mellifera; etiquetas de ánimo y silencio |
| BeeLLM-Mellifera | No disponible | No disponible | No disponible | Hugging Face | Modelo base inmediato de Somnia |
| BeeLLM 12M Mood | 12 M, según la denominación de la variante | No disponible | Apache 2.0 | Hugging Face | Origen de la arquitectura, el tokenizador y la plantilla |

## Limitaciones y advertencias

- Coherencia muy limitada: con 13,6 M de parámetros, muchas respuestas derivan en nonsense; la propia model card lo advierte.
- Repetición: si se deja sin muestreo y sin varias propuestas, puede caer en bucles como «I am a bee».
- Alucinación: no es fiable para hechos, fechas, cálculos ni información verificable.
- Contexto limitado a 4.096 tokens; no está pensado para documentos largos ni conversaciones extensas.
- Idioma: solo se documenta inglés; no hay evaluación multilingüe ni datos sobre otros idiomas.
- Sesgos y contenido: no se han publicado evaluaciones de sesgo; el dataset es pequeño y generado, y el modo «angry» o las respuestas con «stinging» pueden producir contenido agresivo. El filtro de slurs descrito no garantiza seguridad.
- Capacidades ausentes: no se documenta tool calling, agentes, código fiable, matemáticas, visión ni audio.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar los avisos de licencia y no ofrece garantías. No debe usarse en decisiones de alto riesgo, atención al cliente real ni producción crítica sin evaluación adicional.
- Falta de benchmarks: no hay métricas públicas de calidad, latencia o seguridad que permitan una comparación rigurosa.

## Enlaces

- [Sauers/BeeLLM-Somnia en Hugging Face](https://huggingface.co/Sauers/BeeLLM-Somnia)
- [Sauers/BeeLLM-Mellifera en Hugging Face](https://huggingface.co/Sauers/BeeLLM-Mellifera)
- [schizophyllume/BeeLLM en Hugging Face](https://huggingface.co/schizophyllume/BeeLLM)
- [Repositorio de entrenamiento SauersML/gnome](https://github.com/SauersML/gnome)
- [delve.town](https://delve.town)
- [gnome.science/chat](https://gnome.science/chat)
- [bee.gnome.science](https://bee.gnome.science)
- [bee.pleroma.nexus](https://bee.pleroma.nexus/)
- [Publicación de Sauers en X](https://x.com/Sauers_/status/2110847116730048800)
- [Publicación de JNC en X sobre el proyecto de Sauers](https://x.com/jncquant/status/2109645780424257654)
- [Llama 3.1 405B, usado como generador de continuaciones](https://huggingface.co/meta-llama/Llama-3.1-405B)
- [Trinity-Large-TrueBase, usado como generador de continuaciones](https://huggingface.co/arcee-ai/Trinity-Large-TrueBase)
