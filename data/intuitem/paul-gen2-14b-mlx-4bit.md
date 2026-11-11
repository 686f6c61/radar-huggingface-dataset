# intuitem/Paul-Gen2-14B-MLX-4bit

## Resumen

Paul-Gen2-14B-MLX-4bit es la version cuantizada a 4 bits en formato MLX del modelo Paul-Gen2-14B, desarrollado por intuitem. Se trata de un ajuste fino (fine-tuning) del modelo Ministral 3 14B Instruct de Mistral, especializado en gobernanza, riesgo y cumplimiento (GRC) de ciberseguridad, con enfasis en la comunidad francoparlante y en marcos como EBIOS Risk Manager (EBIOS RM), ISO/IEC 27005 y la homologacion de seguridad.

El modelo resuelve el problema de disponer de un asistente especializado que domine la metodologia EBIOS RM, sea capaz de guiar un analisis de riesgos paso a paso, invocar herramientas cuando la aplicacion las expone y responder en JSON bajo demanda. Es relevante porque puede actuar como backend de IA de CISO Assistant y funciona de forma autonoma o integrado en cualquier aplicacion compatible con la API de chat de OpenAI.

Esta variante concreta esta pensada para Apple Silicon: emplea pesos MLX de 4 bits con tamano de grupo 64, ocupa unos 7 GB en disco (7,6 GB de repositorio) y cuenta con 13.506.073.600 parametros totales. Es la iteracion v64avg de la segunda generacion (Gen2), sucesora de Poulpe Gen1 sobre la misma base, con un 40 % mas de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Ministral 3 14B Instruct, familia mistral3) |
| Parametros totales | 13.506.073.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MLX (group size 64); existen pesos del modelo base sin cuantizar |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, 4 bits) |
| Libreria | mlx |
| Tamano del repositorio | 7,6 GB |
| Modelo base | intuitem/Paul-Gen2-14B |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de Ministral 3 14B Instruct de Mistral, sobre el que se aplico un ajuste fino con QLoRA (rango 16). Los pesos publicados son la media de 2 ejecuciones con semillas distintas. El entrenamiento se realizo en una sola RTX 3090, con una epoca sobre aproximadamente 60.000 ejemplos.

Los datos de entrenamiento fueron generados por un modelo profesor (Gemma 4 31B, Apache-2.0) a partir de documentos de referencia: pares pregunta-respuesta, correcciones de premisas falsas, sesiones de facilitacion multi-turno, ademas de llamadas a herramientas y respuestas generales de TI producidas por el modelo base. Los ejemplos son reformulaciones, no los documentos originales. Las formulas, escalas de valoracion y tablas que los documentos de ANSSI solo presentan como imagenes fueron transcritas primero por el profesor desde las imagenes de las paginas, y las formulas generadas se verificaron contra ellas.

Las fuentes documentales incluyen publicaciones de ANSSI (reutilizadas bajo Licence Ouverte / Etalab, con autorizacion de ANSSI de 21 de octubre de 2026 para documentos sin licencia), informes de ENISA (CC BY 4.0), publicaciones de NIST (obras del Gobierno de EE. UU.) y MITRE ATT&CK / CAPEC bajo la licencia de MITRE. Gen2 incorpora un 40 % mas de datos que Poulpe Gen1 y elimina las filas que contradecian las fuentes.

## Capacidades

- Generacion de texto y respuesta conversacional en frances e ingles.
- Dominio de la metodologia EBIOS RM: talleres, conceptos, vocabulario, escalas de valoracion y entregables.
- Guia paso a paso de un analisis de riesgos, desde el encuadre hasta el plan de tratamiento del riesgo.
- Soporte de tool calling / function calling cuando la aplicacion expone herramientas (por ejemplo, las herramientas MCP de CISO Assistant).
- Salida en JSON validada contra esquema.
- Correccion de premisas falsas (respuestas firmes ante afirmaciones incorrectas).
- Facilitacion multi-turno de talleres y conduccion de estudios con respuestas breves.
- Respuestas sobre ciberseguridad general y TI.
- Declina temas fuera de ciberseguridad y TI.

## Casos de uso

- Asistente de analisis de riesgos EBIOS RM: el modelo guia al usuario por los talleres de la metodologia, explica conceptos y vocabulario, y ayuda a construir entregables. Es adecuado porque fue entrenado especificamente sobre la guia EBIOS RM v1.5 y las fichas metodo de ANSSI.
- Backend de IA de CISO Assistant: se integra como motor conversacional del producto de intuitem, invocando sus herramientas MCP para ejecutar acciones sobre la plataforma. El soporte de tool calling alcanza 1.000 en el conjunto de evaluacion retenido.
- Generacion de salidas estructuradas en JSON: util en pipelines que necesitan respuestas parseables validadas contra esquema (por ejemplo, extraccion de campos de un analisis de riesgos o generacion de registros de tratamiento).
- Formacion y capacitacion interna en GRC: el modelo facilita sesiones multi-turno sobre talleres EBIOS RM y corrige premisas erroneas, lo que lo hace util para entrenar equipos de seguridad.
- Consulta de ciberseguridad general y TI: responde preguntas sobre identidad, alcance y temas generales de TI con una puntuacion de 0,838 en el conjunto de evaluacion correspondiente.
- Despliegue local en Mac para equipos de seguridad: al ser pesos MLX de 4 bits de unos 7 GB, puede ejecutarse en Apple Silicon mediante mlx-lm o LM Studio, lo que permite trabajar con datos sensibles sin salir del dispositivo.
- Automatizacion de respuestas en un chat compatible con la API de OpenAI: se puede integrar en cualquier aplicacion que hable dicho protocolo, usando temperatura recomendada de 0,2.

## Benchmarks y rendimiento

Puntuaciones entre 0 y 1 sobre conjuntos retenidos. Los conjuntos de conocimiento y facilitacion se evaluan con un juez LLM contra respuestas de referencia y las paginas fuente; tool calling y JSON se comprueban de forma determinista. El ruido del juez es de aproximadamente ±0,02.

| Conjunto | Items | Esta version | Poulpe Gen1 |
|---|---|---|---|
| Preguntas EBIOS RM a libro cerrado | 338 | 0,441 | 0,405 |
| Premisas verdaderas, falsas y parciales | 134 | 0,412 | 0,362 |
| Facilitacion de talleres (multi-turno) | 36 | 0,525 | 0,528 |
| Conduccion de un estudio con respuestas breves (multi-turno) | 18 | 0,640 | 0,546 |
| Identidad, alcance, TI general | 26 | 0,838 | 0,790 |
| Tool calling (herramientas MCP de CISO Assistant, retenido) | 36 | 1,000 | 0,986 |
| Salida JSON (validada contra esquema) | 10 | 1,000 | 1,000 |

Metricas adicionales:
- Premisas falsas corregidas con firmeza: 36 de 60.
- Respuestas a libro cerrado enmarcadas con el metodo o taller equivocado: 29 de 338.
- Respuestas repetidas en las sesiones de respuestas breves: 5 sobre 18 sesiones.
- Llamadas a herramientas que afirman una accion sin invocar la herramienta: 0.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos MLX de 4 bits ocupan unos 7 GB (7,6 GB de repositorio), por lo que se necesita memoria unificada suficiente para cargar los pesos mas el contexto.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (chips de la serie M). Para el modelo base sin cuantizar se requeriria hardware con mas memoria; no se dispone de datos especificos de VRAM para esa variante.
- Cabe en GPU consumer: si, en equipos Apple Silicon con memoria unificada suficiente para los aproximadamente 7 GB de pesos mas el contexto.
- Opciones de despliegue: mlx-lm (`mlx_lm.chat`), LM Studio en Mac (buscar "Paul" y elegir la version MLX). Para otras plataformas seria necesario usar el modelo base o generar otras cuantizaciones.
- Latencia y throughput estimados: no disponibles.
- Parametros de ejecucion recomendados: `--max-tokens 2048`, `--temp 0.2`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paul-Gen2-14B-MLX-4bit | 13.506.073.600 | no disponible | GRC / ciberseguridad (EBIOS RM, ISO 27005) | apache-2.0 | Hugging Face (MLX 4 bits) |
| Poulpe Gen1-14B | 14B (misma base) | no disponible | GRC / ciberseguridad | no disponible en la informacion | Hugging Face |
| Ministral 3 14B Instruct | 14B | no disponible | Modelo generalista de Mistral | no disponible en la informacion | Hugging Face |

Poulpe Gen1 es el predecesor directo sobre la misma base; Paul Gen2 mejora en la mayoria de conjuntos evaluados (por ejemplo, 0,441 frente a 0,405 en preguntas EBIOS RM a libro cerrado y 1,000 frente a 0,986 en tool calling). Ministral 3 14B Instruct es el modelo base generalista del que deriva Paul; no se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- La redaccion exacta de las escalas de valoracion (gravedad, probabilidad, criterios de partes interesadas) y los valores de los ejemplos resueltos de la guia pueden recordarse de forma imperfecta; un valor de ejemplo puede presentarse como si el metodo lo fijara. Conviene verificarlos contra la guia de ANSSI o proporcionar las paginas relevantes mediante recuperacion (retrieval) cuando se requiera precision.
- Los estudios largos conducidos con respuestas muy breves pueden desviarse o repetir un paso.
- Sigue la guia EBIOS RM v1.5 (2024); los terminos de la version de 2018 (por ejemplo, "criticite" de una parte interesada) no siempre se mapean a los actuales.
- No constituye asesoramiento legal ni regulatorio; un analisis de riesgos sigue siendo responsabilidad de quienes lo realizan.
- Las respuestas pueden ser erroneas; deben contrastarse con la guia de ANSSI.
- Declina temas fuera de ciberseguridad y TI.
- Fuera de alcance: asesoramiento legal y decisiones tomadas sin revision humana.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La licencia apache-2.0 permite uso comercial, pero las fuentes subyacentes (ANSSI, ENISA, NIST, MITRE) tienen sus propias condiciones de atribucion que deben respetarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intuitem/Paul-Gen2-14B-MLX-4bit
- Modelo base: https://huggingface.co/intuitem/Paul-Gen2-14B
- Predecesor Poulpe Gen1: https://huggingface.co/intuitem/Poulpe-Gen1-14B
- Web de intuitem: https://intuitem.com
- Repositorio CISO Assistant: https://github.com/intuitem/ciso-assistant-community
- EBIOS RM - Correction de l'etude de cas (ANSSI): https://cyber.gouv.fr/documents/479/Correction_Etude_de_Cas.pdf
- Fiche methode - Ateliers 1 et 3 - Evaluer la gravite des evenements redoutes (ANSSI): https://messervices.cyber.gouv.fr/documents-guides/Fiche_methode-Evaluer_la_gravite_des_evenements_redoute-atelier_1.pdf
- Fiche methode - Atelier 1 - Identifier le perimetre metier et technique (ANSSI): https://messervices.cyber.gouv.fr/documents-guides/Fiche_methode-Identifier_le_perimetre_metier_et_technique-atelier_1.pdf
- Fiche methode - Atelier 2 - Identifier et caracteriser les sources de risque (ANSSI): https://messervices.cyber.gouv.fr/documents-guides/ (enlace truncado en la informacion disponible)
