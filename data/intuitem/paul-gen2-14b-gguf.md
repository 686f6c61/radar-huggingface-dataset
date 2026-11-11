# intuitem/Paul-Gen2-14B-GGUF

## Resumen

Paul-Gen2-14B es un modelo de lenguaje especializado en gobernanza, riesgo y cumplimiento (GRC) de ciberseguridad, desarrollado por intuitem y afinado a partir de Ministral 3 14B Instruct de Mistral. Está orientado a la comunidad francófona y cubre metodologías como EBIOS Risk Manager (EBIOS RM), ISO/IEC 27005 y la homologación de seguridad, respondiendo en francés e inglés. La versión publicada aquí es una cuantización GGUF del modelo base, pensada para su ejecución local con Ollama o llama.cpp.

El modelo resuelve un problema concreto: proporcionar un asistente conversacional que domine el vocabulario, los talleres y las escalas de valoración de EBIOS RM, y que pueda guiar un análisis de riesgos paso a paso. Puede actuar como backend de IA de CISO Assistant o integrarse en cualquier aplicación compatible con la API de chat de OpenAI. Esta es la iteración v64avg de la segunda generación, que sustituye a Poulpe Gen1 con un 40 % más de datos de entrenamiento y la eliminación de filas que contradecían las fuentes.

El modelo cuenta con 13.506.073.600 parámetros y se distribuye bajo licencia Apache 2.0 en formato GGUF, con cuantizaciones Q4_K_M (unos 8 GB) y Q8_0 (unos 14 GB). Su contexto y arquitectura detallada no se especifican en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Ministral 3 14B Instruct) |
| Parametros totales | 13.506.073.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 |
| Idiomas soportados | fr, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning mediante QLoRA (rango 16) sobre Ministral 3 14B Instruct. Los pesos publicados son la media de dos ejecuciones con semillas distintas. El entrenamiento se realizó sobre aproximadamente 60.000 ejemplos generados por un modelo profesor (Gemma 4 31B, Apache-2.0) a partir de documentos de ANSSI, ENISA, NIST y MITRE ATT&CK/CAPEC. Los ejemplos incluyen pares pregunta-respuesta, correcciones de premisas falsas, sesiones de facilitación multiturno, llamadas a herramientas y respuestas generales de TI producidas por el modelo base. Se completó una época sobre una única RTX 3090.

Los ejemplos son reformulaciones, no los documentos originales. Las fórmulas, escalas de valoración y tablas que los documentos de ANSSI solo presentan como figuras fueron transcritas primero por el profesor a partir de las imágenes de las páginas, y las fórmulas generadas se verificaron contra esas transcripciones. La arquitectura interna (tipo de transformer, mecanismos de atención, innovaciones específicas) no se detalla en la información disponible.

## Capacidades

- Generación de texto conversacional en francés e inglés sobre ciberseguridad y TI.
- Dominio de la metodología EBIOS RM: talleres, conceptos, vocabulario, escalas de valoración y entregables.
- Guía paso a paso de un análisis de riesgos, desde el encuadre hasta el plan de tratamiento.
- Llamada a herramientas (tool calling) cuando la aplicación las proporciona, como las herramientas MCP de CISO Assistant.
- Salida en JSON validada contra esquema.
- Facilitación de talleres en conversaciones multiturno.
- Corrección de premisas falsas o parciales.
- Respuestas generales de TI y ciberseguridad.
- Rechazo de temas fuera del ámbito de ciberseguridad y TI.

## Casos de uso

- Asistente de EBIOS RM: el modelo responde preguntas cerradas sobre talleres, conceptos y escalas de valoración, y puede guiar al usuario por los cinco talleres de la metodología. Es adecuado porque fue entrenado específicamente sobre la guía EBIOS RM v1.5 (2024).
- Backend de CISO Assistant: se integra como motor de IA del proyecto mediante las herramientas MCP de la aplicación, gestionando llamadas a funciones con una puntuación de 1.000 en el conjunto de evaluación de tool calling.
- Análisis de riesgos guiado: conduce una sesión multiturno desde el encuadre hasta el plan de tratamiento, con capacidad de mantener el hilo en sesiones de respuestas breves (0.640 en el conjunto correspondiente).
- Generación de salidas estructuradas: produce JSON validado contra esquema (1.000 en el conjunto de evaluación), útil para integrar los resultados en pipelines o bases de datos de GRC.
- Formación y consulta interna: responde dudas de ciberseguridad general y TI con una puntuación de 0.838 en el conjunto de identidad, alcance y TI general.
- Despliegue local en estaciones de trabajo: la cuantización Q4_K_M (unos 8 GB) permite ejecutarlo con Ollama o llama.cpp en una GPU de 16 GB o en un Mac con Apple Silicon de 16 GB o más, sin depender de servicios en la nube.
- Detección de premisas erróneas en auditorías: corrige de forma firme 36 de 60 premisas falsas, lo que resulta útil para revisar afirmaciones de cumplimiento antes de validarlas.

## Benchmarks y rendimiento

Puntuaciones entre 0 y 1 sobre conjuntos reservados. Los conjuntos de conocimiento y facilitación se evalúan con un juez LLM contra respuestas de referencia y páginas fuente; tool calling y JSON se comprueban de forma determinista. El ruido del juez es de aproximadamente ±0.02.

| Conjunto | Ítems | Esta versión | Poulpe Gen1 |
|---|---|---|---|
| Preguntas EBIOS RM a libro cerrado | 338 | 0.441 | 0.405 |
| Premisas verdaderas, falsas y parciales | 134 | 0.412 | 0.362 |
| Facilitación de talleres (multiturno) | 36 | 0.525 | 0.528 |
| Conducción de un estudio con respuestas breves (multiturno) | 18 | 0.640 | 0.546 |
| Identidad, alcance, TI general | 26 | 0.838 | 0.790 |
| Tool calling (herramientas MCP de CISO Assistant, reservado) | 36 | 1.000 | 0.986 |
| Salida JSON (validada contra esquema) | 10 | 1.000 | 1.000 |

Datos adicionales: premisas falsas corregidas con firmeza, 36 de 60; respuestas a libro cerrado enmarcadas con el método o taller equivocado, 29 de 338; respuestas repetidas en las sesiones de respuestas breves, 5 sobre 18 sesiones; llamadas a herramientas que afirman una acción sin invocar la herramienta, 0.

## Requisitos de hardware

- VRAM estimada: unos 8 GB para Q4_K_M y unos 14 GB para Q8_0.
- GPU recomendadas: una RTX 3090 es suficiente para el entrenamiento (según la model card) y para inferencia en Q8_0; para Q4_K_M basta una GPU de 16 GB.
- Cabe en GPU de consumo: sí, con 16 GB de VRAM para Q4_K_M. También en Apple Silicon con 16 GB o más.
- Opciones de despliegue: Ollama (incluye Modelfile con temperatura 0.2), llama.cpp (`llama-server` con `--jinja --temp 0.2`), LM Studio (búsqueda "Paul") y cualquier aplicación compatible con la API de chat de OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Paul-Gen2-14B (esta versión) | 13.506.073.600 | no disponible | apache-2.0 | GRC y ciberseguridad, fr/en | GGUF en Hugging Face |
| Poulpe Gen1 14B | no disponible | no disponible | no disponible | GRC y ciberseguridad, fr/en | Hugging Face (intuitem/Poulpe-Gen1-14B) |
| Ministral 3 14B Instruct | no disponible | no disponible | no disponible | propósito general | modelo base de Mistral |

La comparación con alternativas de propósito general de la misma categoría no está disponible en la información proporcionada. Poulpe Gen1 es el predecesor directo sobre el mismo modelo base y sirve como referencia de rendimiento en la tabla de benchmarks.

## Limitaciones y advertencias

- La redacción exacta de las escalas de valoración (gravedad, probabilidad, criterios de partes interesadas) y los valores de los ejemplos resueltos de la guía pueden recordarse de forma imperfecta; un valor de ejemplo puede presentarse como si el método lo fijara. Conviene verificarlos contra la guía de ANSSI o proporcionar las páginas relevantes mediante recuperación cuando la precisión sea crítica.
- Los estudios largos conducidos con respuestas muy breves pueden desviarse o repetir un paso.
- Sigue la guía EBIOS RM v1.5 (2024); los términos de la versión de 2018 (por ejemplo, "criticité" de una parte interesada) no siempre se mapean a los actuales.
- No constituye asesoramiento legal ni regulatorio; el análisis de riesgos sigue siendo responsabilidad de quienes lo realizan.
- Riesgo de alucinación: la propia model card advierte de que las respuestas pueden ser erróneas y deben contrastarse con la guía de ANSSI.
- Fuera de alcance: temas ajenos a ciberseguridad y TI (el modelo los declina) y decisiones tomadas sin revisión humana.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial; deben respetarse las licencias de las fuentes de entrenamiento (Etalab 2.0 para ANSSI, CC BY 4.0 para ENISA, dominio público para NIST y licencia de MITRE para ATT&CK y CAPEC, con aviso en `NOTICE-MITRE.txt`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intuitem/Paul-Gen2-14B-GGUF
- Modelo base: https://huggingface.co/intuitem/Paul-Gen2-14B
- Predecesor Poulpe Gen1: https://huggingface.co/intuitem/Poulpe-Gen1-14B
- CISO Assistant (repositorio): https://github.com/intuitem/ciso-assistant-community
- Sitio de intuitem: https://intuitem.com
- Corrección del estudio de caso EBIOS RM (ANSSI): https://cyber.gouv.fr/documents/479/Correction_Etude_de_Cas.pdf
