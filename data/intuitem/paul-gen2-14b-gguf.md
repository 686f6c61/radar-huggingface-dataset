# intuitem/Paul-Gen2-14B-GGUF

## Resumen

Paul-Gen2-14B-GGUF es la versión cuantizada en formato GGUF del modelo Paul-Gen2-14B, desarrollado por intuitem y afinado a partir de Ministral 3 14B Instruct de Mistral. Está especializado en gobernanza, riesgo y cumplimiento (GRC) de ciberseguridad, con foco en la comunidad francófona: EBIOS Risk Manager (EBIOS RM), ISO/IEC 27005 y homologación de seguridad. Responde en francés e inglés y puede actuar como backend de IA para CISO Assistant o cualquier aplicación compatible con la API de chat de OpenAI.

El modelo se distribuye con licencia Apache-2.0 y un tamaño de repositorio de 22,6 GB, con pesos en cuantizaciones Q4_K_M (unos 8 GB) y Q8_0 (unos 14 GB). Esta iteración, etiquetada como v64avg dentro de la generación Gen2, sucede a Poulpe Gen1 sobre la misma base, incorporando un 40 % más de datos de entrenamiento y eliminando las filas que contradecían las fuentes.

La relevancia actual del modelo radica en su enfoque vertical: no es un modelo generalista, sino una herramienta afinada para guiar análisis de riesgo paso a paso, responder preguntas sobre los talleres de EBIOS RM y ejecutar llamadas a herramientas en entornos de gestión de cumplimiento. Su formato GGUF y su integración con Ollama y llama.cpp facilitan el despliegue local en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Ministral 3 14B Instruct) |
| Parametros totales | 13.506.073.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (~8 GB), Q8_0 (~14 GB) |
| Idiomas soportados | fr, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Ministral 3 14B Instruct, un transformer denso de aproximadamente 13.500 millones de parámetros, y se afina mediante QLoRA con rango 16. Los pesos liberados son la media de dos ejecuciones con semillas distintas. El entrenamiento se realizó durante una época sobre una única RTX 3090, con alrededor de 60.000 ejemplos generados por un modelo profesor (Gemma 4 31B, Apache-2.0) a partir de documentos de ANSSI, ENISA, NIST y MITRE.

Los datos de entrenamiento incluyen pares pregunta-respuesta, correcciones de premisas falsas, sesiones de facilitación multiturno, además de llamadas a herramientas y respuestas generales de TI producidas por el modelo base. Los ejemplos son reformulaciones, no los documentos originales; las fórmulas, escalas de valoración y tablas que los documentos de ANSSI solo presentan como figuras fueron transcritas por el profesor a partir de las imágenes de las páginas y verificadas contra ellas.

## Capacidades

- Generación de texto especializada en ciberseguridad, GRC y gestión de riesgos.
- Respuesta a preguntas sobre la metodología EBIOS RM: talleres, conceptos, vocabulario, escalas de valoración y entregables.
- Guía paso a paso de un análisis de riesgo, desde el encuadre hasta el plan de tratamiento.
- Llamada a herramientas (tool calling) cuando la aplicación las proporciona, como las herramientas MCP de CISO Assistant.
- Salida en JSON bajo petición, con validación de esquema.
- Capacidades multiturno para facilitación de talleres y conducción de estudios con respuestas breves.
- Corrección de premisas falsas o parciales en preguntas sobre la metodología.
- Respuestas en francés e inglés.
- Preguntas generales de ciberseguridad y TI.
- Rechazo explícito de temas fuera del ámbito de ciberseguridad y TI.

## Casos de uso

- Asistente de análisis de riesgo EBIOS RM: el modelo guía al usuario por los cinco talleres de la metodología, desde el encuadre y la definición del alcance hasta la construcción de escenarios estratégicos y operativos y el plan de tratamiento, manteniendo el contexto de la conversación a lo largo de sesiones multiturno.
- Backend de IA para CISO Assistant: se integra como motor conversacional en la plataforma de gestión de cumplimiento, ejecutando las herramientas MCP disponibles para consultar y actualizar información de riesgos, controles y medidas.
- Formación y sensibilización en ciberseguridad: responde preguntas sobre conceptos, vocabulario y escalas de EBIOS RM e ISO/IEC 27005, y corrige premisas erróneas, lo que lo hace útil en entornos de capacitación interna.
- Generación de salidas estructuradas en JSON: al validar esquemas de forma determinista, puede emplearse en pipelines que necesiten extraer información estructurada de conversaciones o generar informes con formato fijo.
- Soporte a la homologación de seguridad: ayuda a recorrer los pasos de un proceso de homologación y a documentar los elementos requeridos, siempre con revisión humana posterior.
- Asistente local de consultas de ciberseguridad y TI: desplegado con Ollama o llama.cpp en una estación de trabajo con GPU de 16 GB, ofrece respuestas sin depender de servicios en la nube, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Automatización de flujos de cumplimiento: mediante tool calling, puede encadenar consultas a repositorios de controles y generar borradores de documentación de riesgo para revisión por parte del equipo de seguridad.

## Benchmarks y rendimiento

Los resultados se expresan entre 0 y 1 sobre conjuntos reservados. Los conjuntos de conocimiento y facilitación se evalúan con un juez LLM contra respuestas de referencia y las páginas fuente; las llamadas a herramientas y la salida JSON se comprueban de forma determinista. El ruido del juez es de aproximadamente ±0,02.

| Conjunto | Elementos | Esta versión | Poulpe Gen1 |
|---|---|---|---|
| Preguntas EBIOS RM a libro cerrado | 338 | 0,441 | 0,405 |
| Premisas verdaderas, falsas y parciales | 134 | 0,412 | 0,362 |
| Facilitación de talleres (multiturno) | 36 | 0,525 | 0,528 |
| Conducción de un estudio con respuestas breves (multiturno) | 18 | 0,640 | 0,546 |
| Identidad, alcance, TI general | 26 | 0,838 | 0,790 |
| Llamada a herramientas (MCP de CISO Assistant, reservado) | 36 | 1,000 | 0,986 |
| Salida JSON (validada por esquema) | 10 | 1,000 | 1,000 |

Datos adicionales del informe de evaluación:
- Premisas falsas corregidas con firmeza: 36 de 60.
- Respuestas a libro cerrado enmarcadas con el método o taller equivocado: 29 de 338.
- Respuestas repetidas en las sesiones de respuestas breves: 5 sobre 18 sesiones.
- Llamadas a herramientas que afirman una acción sin invocar la herramienta: 0.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 8 GB con Q4_K_M y unos 14 GB con Q8_0.
- GPU recomendadas: una GPU de 16 GB o superior ejecuta el Q4_K_M; para Q8_0 se recomienda al menos 16 GB de VRAM efectiva. El modelo se entrenó en una RTX 3090, lo que indica que esa GPU es suficiente para inferencia en ambas cuantizaciones.
- Cabe en GPU de consumo: sí, con Q4_K_M en tarjetas de 16 GB (por ejemplo, RTX 4080, RTX 4090, RTX 3090) y en Mac con Apple Silicon de 16 GB o más. Q8_0 requiere al menos 16 GB de VRAM o memoria unificada.
- Opciones de despliegue: Ollama (`ollama run hf.co/intuitem/Paul-Gen2-14B-GGUF:Q4_K_M`), llama.cpp (`llama-server -m Paul-Gen2-14B-Q4_K_M.gguf --jinja --temp 0.2`), LM Studio (buscar "Paul") y cualquier aplicación compatible con la API de chat de OpenAI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Paul-Gen2-14B-GGUF | 13.506.073.600 | no disponible | GRC y ciberseguridad (EBIOS RM, ISO 27005) | apache-2.0 | GGUF |
| Poulpe Gen1 | misma base (Ministral 3 14B) | no disponible | GRC y ciberseguridad | no disponible | no disponible |
| Ministral 3 14B Instruct | ~14B | no disponible | Propósito general | no disponible | no disponible |

Poulpe Gen1 es la iteración anterior sobre la misma base; Paul Gen2 mejora en la mayoría de conjuntos de evaluación, con un 40 % más de datos de entrenamiento y eliminación de filas contradictorias. Ministral 3 14B Instruct es el modelo base generalista del que deriva Paul; no está especializado en GRC ni en EBIOS RM.

## Limitaciones y advertencias

- La redacción exacta de las escalas de valoración (gravedad, probabilidad, criterios de partes interesadas) y los valores de los ejemplos resueltos de la guía pueden recordarse de forma imperfecta; un valor de ejemplo puede presentarse como si el método lo fijara. Conviene verificarlos contra la guía de ANSSI o proporcionar las páginas relevantes mediante recuperación cuando se requiera precisión.
- Los estudios largos conducidos con respuestas muy breves pueden desviarse o repetir un paso.
- Sigue la guía EBIOS RM v1.5 (2024); los términos de la versión de 2018 (por ejemplo, "criticité" de una parte interesada) no siempre se mapean a los actuales.
- No constituye asesoramiento legal ni regulatorio; un análisis de riesgo sigue siendo responsabilidad de quienes lo realizan.
- Fuera de alcance: temas ajenos a ciberseguridad y TI (el modelo los rechaza) y decisiones tomadas sin revisión humana.
- Las respuestas pueden ser erróneas; deben comprobarse contra la guía de ANSSI.
- Riesgo de alucinación en la reproducción de valores numéricos, escalas y ejemplos de la guía.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache-2.0, que permite uso comercial; no obstante, las fuentes subyacentes tienen sus propias licencias (Etalab 2.0 para ANSSI, CC BY 4.0 para ENISA, dominio público para NIST y licencia MITRE para ATT&CK y CAPEC), cuyos avisos deben respetarse.

## Enlaces

- Hugging Face: https://huggingface.co/intuitem/Paul-Gen2-14B-GGUF
- Modelo base: https://huggingface.co/intuitem/Paul-Gen2-14B
- Sitio del desarrollador: https://intuitem.com
- CISO Assistant (repositorio): https://github.com/intuitem/ciso-assistant-community
- Guía EBIOS RM – Corrección del estudio de caso (ANSSI): https://cyber.gouv.fr/documents/479/Correction_Etude_de_Cas.pdf
- Ficha método – Talleres 1 y 3 – Evaluar la gravedad de los eventos temidos (ANSSI): https://messervices.cyber.gouv.fr/documents-guide
