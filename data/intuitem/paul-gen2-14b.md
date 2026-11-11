# intuitem/Paul-Gen2-14B

## Resumen

Paul-Gen2-14B es un modelo de lenguaje especializado en gobernanza, riesgo y cumplimiento (GRC) de ciberseguridad, desarrollado por intuitem y afinado a partir de Ministral 3 14B Instruct de Mistral AI. Está diseñado para responder en francés e inglés sobre el método EBIOS Risk Manager (EBIOS RM) de la ANSSI, la norma ISO/IEC 27005 y los procesos de homologación de seguridad, y puede actuar como backend de IA de CISO Assistant o de cualquier aplicación compatible con la API de chat de OpenAI.

Se trata de un modelo denso de aproximadamente 13.945 millones de parámetros, con pesos en safetensors bf16 (unos 27 GB), licencia Apache 2.0 y una única iteración publicada (v64avg) sobre la base Ministral 3 14B Instruct. Su relevancia radica en que cubre un nicho poco atendido por los modelos generalistas: el razonamiento estructurado sobre marcos de análisis de riesgos, con soporte explícito de tool calling y salida JSON validada por esquema.

Gen2 sustituye a Poulpe Gen1 sobre la misma base, incorporando un 40 % más de datos de entrenamiento y eliminando las filas que contradecían las fuentes documentales. El modelo declina explícitamente las consultas fuera del ámbito de ciberseguridad y TI, y advierte que sus respuestas deben contrastarse con la guía de la ANSSI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral 3 / Ministral 3 14B Instruct) |
| Parametros totales | 13.945.031.680 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; compatible con cuantizacion estandar via transformers/vLLM) |
| Idiomas soportados | fr, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, ~27 GB), plantilla de chat incluida y `SYSTEM_PROMPT.txt` |

## Arquitectura y entrenamiento

El modelo parte de Ministral 3 14B Instruct, un transformer denso de Mistral AI, y se afina mediante QLoRA con rango 16. Los pesos publicados son la media de dos ejecuciones con semillas distintas. El entrenamiento consistió en una época sobre aproximadamente 60.000 ejemplos generados por un modelo profesor (Gemma 4 31B, Apache-2.0) a partir de documentos de la ANSSI, ENISA, NIST y MITRE, en una única RTX 3090.

Los datos de entrenamiento incluyen pares pregunta-respuesta, correcciones de premisas falsas, sesiones multiturno de facilitación de talleres, llamadas a herramientas (herramientas MCP de CISO Assistant) y respuestas generales de TI producidas por el modelo base. Las fórmulas, escalas de valoración y tablas que los documentos de la ANSSI solo presentan como figuras fueron transcritas por el profesor desde las imágenes de las páginas y posteriormente verificadas. Los ejemplos son reformulaciones, no los documentos originales. Las fuentes documentales son EBIOS RM (corrección del estudio de caso y fichas método), informes de ENISA (CC BY 4.0), publicaciones del NIST (dominio público en EE. UU.) y MITRE ATT&CK/CAPEC (bajo licencia de MITRE).

## Capacidades

- Generación de texto conversacional en francés e inglés sobre ciberseguridad y TI.
- Respuesta a preguntas sobre el método EBIOS RM: talleres, conceptos, vocabulario, escalas de valoración y entregables.
- Guía paso a paso de un análisis de riesgos, desde el encuadre hasta el plan de tratamiento.
- Tool calling / function calling cuando la aplicación proporciona herramientas (por ejemplo, las herramientas MCP de CISO Assistant).
- Salida en JSON validada por esquema a petición.
- Corrección de premisas falsas en preguntas de tipo verdadero/falso/parcial.
- Facilitación multiturno de talleres y conducción de estudios con respuestas escuetas.
- Declive explícito de consultas fuera del ámbito de ciberseguridad y TI.

## Casos de uso

- Asistente de análisis de riesgos EBIOS RM: el modelo guía al usuario por los cinco talleres del método, explica conceptos y escalas de valoración y propone entregables, lo que resulta adecuado por su entrenamiento específico sobre la guía de la ANSSI.
- Backend de IA para CISO Assistant: se integra mediante las herramientas MCP de la plataforma para consultar y actualizar estudios de riesgo, aprovechando su tasa de acierto del 100 % en tool calling sobre el conjunto de evaluación retenido.
- Generación de informes estructurados de cumplimiento: produce salidas JSON validadas por esquema (puntuación 1.000 en el conjunto de evaluación), útil para alimentar pipelines que requieran datos parseables.
- Formación y soporte a equipos de seguridad: responde preguntas de ciberseguridad general y de TI con contexto multiturno, adecuado para sesiones de capacitación interna en organizaciones francófonas.
- Corrección de premisas erróneas en auditorías: detecta y corrige afirmaciones falsas o parcialmente falsas sobre el método (36 de 60 premisas falsas corregidas de forma firme), útil como revisión preliminar de documentación de riesgo.
- Homologación de seguridad y mapeo a ISO/IEC 27005: ayuda a relacionar los artefactos de EBIOS RM con los requisitos de la norma y los procesos de homologación, aunque requiere revisión humana.
- Integración en aplicaciones compatibles con la API de chat de OpenAI: puede desplegarse con vLLM (`vllm serve intuitem/Paul-Gen2-14B`) y sustituir a un modelo generalista en flujos ya existentes.

## Benchmarks y rendimiento

Puntuaciones entre 0 y 1 sobre conjuntos retenidos. Los conjuntos de conocimiento y facilitación se evalúan con un juez LLM contra respuestas de referencia y las páginas fuente; tool calling y JSON se comprueban de forma determinista. El ruido del juez es de aproximadamente ±0,02.

| Conjunto | Elementos | Paul-Gen2-14B | Poulpe Gen1 |
|---|---|---|---|
| Preguntas EBIOS RM a libro cerrado | 338 | 0.441 | 0.405 |
| Premisas verdaderas, falsas y parciales | 134 | 0.412 | 0.362 |
| Facilitación de talleres (multiturno) | 36 | 0.525 | 0.528 |
| Conducción de un estudio con respuestas escuetas (multiturno) | 18 | 0.640 | 0.546 |
| Identidad, alcance, TI general | 26 | 0.838 | 0.790 |
| Tool calling (herramientas MCP de CISO Assistant, retenido) | 36 | 1.000 | 0.986 |
| Salida JSON (validada por esquema) | 10 | 1.000 | 1.000 |

Métricas adicionales reportadas: 36 de 60 premisas falsas corregidas de forma firme; 29 de 338 respuestas a libro cerrado enmarcadas con el método o taller equivocado; 5 respuestas repetidas en 18 sesiones de respuestas escuetas; 0 llamadas a herramientas que afirmen una acción sin invocar la herramienta.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 28 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 40 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 14-16 GB; en 4 bits: en torno a 8-9 GB (estimaciones a partir del tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para bf16; RTX 4090 (24 GB) requiere cuantización de 8 bits o inferior.
- Cabe en GPU de consumo (RTX 3090/4090, 24 GB) solo con cuantización de 8 bits o 4 bits.
- Opciones de despliegue: transformers (pipeline con `device_map="auto"`), vLLM (`vllm serve intuitem/Paul-Gen2-14B`); el autor no documenta soporte explícito de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Temperatura recomendada: 0,2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paul-Gen2-14B | 13,9 B | no disponible | GRC / EBIOS RM / ISO 27005 | Apache 2.0 | Hugging Face |
| Poulpe Gen1-14B | 13,9 B (misma base) | no disponible | GRC / EBIOS RM | Apache 2.0 | Hugging Face |
| Ministral 3 14B Instruct | 13,9 B | no disponible | Propósito general | no disponible en la información | Hugging Face (modelo base) |

No se dispone de datos de benchmarks de Ministral 3 14B Instruct en la información proporcionada para comparar rendimiento de forma directa.

## Limitaciones y advertencias

- La redacción exacta de las escalas de valoración (gravedad, probabilidad, criterios de partes interesadas) y los valores de los ejemplos resueltos de la guía pueden recordarse de forma imperfecta; un valor de ejemplo puede presentarse como si el método lo fijara. Conviene contrastarlo con la guía de la ANSSI o proporcionar las páginas relevantes mediante recuperación.
- Los estudios largos conducidos con respuestas muy cortas pueden derivar o repetir un paso.
- Sigue la guía EBIOS RM v1.5 (2024); los términos de la versión de 2018 (por ejemplo, «criticité» de una parte interesada) no siempre se mapean a los actuales.
- No constituye asesoramiento legal ni regulatorio; el análisis de riesgos sigue siendo responsabilidad de quienes lo realizan.
- Riesgo de alucinación en datos concretos de la guía; el propio autor recomienda verificar las respuestas.
- Ámbito restringido: declina temas fuera de ciberseguridad y TI, lo que limita su uso como modelo generalista.
- Solo francés e inglés; no se documenta soporte de otros idiomas.
- Licencia Apache 2.0 para los pesos, pero las fuentes subyacentes incluyen material de ENISA (CC BY 4.0), MITRE (licencia propia, ver `NOTICE-MITRE.txt`) y ANSSI (Etalab 2.0 y autorización específica del 21 de octubre de 2026), cuyas condiciones de atribución deben respetarse en la redistribución.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar despliegues con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intuitem/Paul-Gen2-14B
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Poulpe Gen1 (iteración anterior): https://huggingface.co/intuitem/Poulpe-Gen1-14B
- CISO Assistant (GitHub): https://github.com/intuitem/ciso-assistant-community
- Sitio del desarrollador: https://intuitem.com
- EBIOS RM – Correction de l'étude de cas (ANSSI): https://cyber.gouv.fr/documents/479/Correction_Etude_de_Cas.pdf
- Fiche méthode – Ateliers 1 et 3 – Évaluer la gravité des événements redoutés (ANSSI): https://messervices.cyber.gouv.fr/documents-guides/Fiche_methode-Evaluer_la_gravite_des_evenements_redoute-atelier_1.pdf
- Fiche méthode – Atelier 1 – Identifier le périmètre métier et technique (ANSSI): https://messervices.cyber.gouv.fr (URL completa no disponible en la información proporcionada)
