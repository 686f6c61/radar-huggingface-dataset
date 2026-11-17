# internlm/Sage-S2.1-Flash-FP8

## Resumen

Sage S2.1 Flash es un modelo multimodal cientifico desarrollado por el Shanghai Artificial Intelligence Laboratory (InternLM) disenado para tareas de investigacion que requieren multiples rondas de analisis y verificacion. Combina comprension de datos cientificos con recuperacion de informacion, programacion y uso de herramientas, lo que le permite ejecutar analisis con software especializado, contrastar resultados contra salidas intermedias y retroalimentacion visual, y ajustar los pasos siguientes en consecuencia.

La variante aqui descrita es la version cuantizada en FP8 (Sage-S2.1-Flash-FP8), con 321.323.031.390 parametros totales segun los pesos en safetensors y un repositorio de 328,5 GB. El modelo se apoya en la arquitectura de representacion unificada de Sage SciPerception, que soporta mas de diez tipos de entrada cientifica (grafos moleculares, estructuras cristalinas, secuencias y estructuras 3D de proteinas, entre otras), codificadas y proyectadas a un espacio de representacion compartido para razonar junto a instrucciones en lenguaje natural.

Su relevancia actual radica en que cubre tareas de ingenieria de ML, procesamiento documental profesional y ejecucion de investigacion con herramientas, ambitos donde compite con modelos frontera propietarios y abiertos. En la evaluacion publicada por el autor, ocupa el primer puesto en cuatro de los quince benchmarks considerados y el segundo en siete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag de repositorio: `glm5_next`) |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (esta variante); el autor publica tambien la version no cuantizada |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo. El tag del repositorio (`glm5_next`) sugiere una base derivada de la familia GLM, pero no se confirma en la model card. Lo que si se describe es la capa de representacion multimodal: mediante la arquitectura unificada de Sage SciPerception, las features de cada tipo de entrada cientifica se codifican y se proyectan a un espacio compartido, de modo que el modelo razona sobre ellas junto con las instrucciones en lenguaje natural. Esto habilita tareas de prediccion, clasificacion, localizacion de sitios, analisis cuantitativo e inferencia de estructura.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras etapas de alineacion. Tampoco se detallan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento multi-paso orientado a tareas de investigacion cientifica.
- Comprension de mas de diez tipos de datos cientificos: grafos moleculares, estructuras cristalinas, secuencias de proteinas y estructuras 3D, entre otros.
- Tareas cientificas especializadas: prediccion, clasificacion, localizacion de sitios, analisis cuantitativo e inferencia de estructura.
- Uso de herramientas (tool calling / function calling), con resultados evaluados en BFCL V4, AutomationBench y OfficeQA Pro.
- Ejecucion de analisis con software especializado y verificacion de resultados contra salidas intermedias y retroalimentacion visual.
- Agentes de codificacion y ejecucion en terminal: evaluado en Terminal-Bench 2.1, SWE-bench Pro, DeepSWE y NL2Repo-Bench.
- Procesamiento de documentos profesionales y hojas de calculo: evaluado en OfficeQA Pro, Harvey LAB, SpreadsheetBench 2 y Workspace-Bench.
- Investigacion autonoma: evaluado en DeepResearch Bench II, WebArena-Verified y OSWorld-Verified.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de estructuras moleculares y cristalinas: el modelo recibe grafos moleculares o estructuras cristalinas como entrada, las proyecta al espacio de representacion compartido y razona sobre propiedades, clasificacion o prediccion de sitios junto con instrucciones en lenguaje natural.
- Prediccion de estructura de proteinas: a partir de secuencias o estructuras 3D, el modelo puede realizar inferencia de estructura y analisis cuantitativo, integrando los resultados con el resto del flujo de investigacion.
- Ingenieria de machine learning automatizada: con 90,3 en MLE-bench Lite, es adecuado para pipelines donde el modelo propone, ejecuta y valida experimentos de ML de forma iterativa.
- Automatizacion de tareas de terminal y repositorios: con 87,9 en Terminal-Bench 2.1 y 60,6 en SWE-bench Pro, puede integrarse en flujos de trabajo sobre repositorios y entornos de linea de comandos para resolver tareas de codigo.
- Procesamiento de documentos profesionales y financieros: con 72,2 en OfficeQA Pro y 25,0 en Harvey LAB, resulta util para extraccion, analisis y respuesta sobre documentacion de oficina y expedientes legales.
- Manipulacion de hojas de calculo: con 37,1 en SpreadsheetBench 2, puede automatizar la generacion y transformacion de hojas de calculo en flujos de productividad.
- Investigacion web autonoma: con resultados en WebArena-Verified, DeepResearch Bench II y OSWorld-Verified, es apto para agentes que navegan, recuperan informacion y verifican hallazgos en multiples pasos.
- Verificacion de resultados cientificos: el modelo puede contrastar sus propias salidas intermedias y la retroalimentacion visual para corregir pasos posteriores, lo que encaja en flujos de validacion experimental.

## Benchmarks y rendimiento

Resultados publicados por el autor (quince benchmarks, seis modelos). Se muestran los valores disponibles en la informacion proporcionada; en negrita, el mejor de cada fila.

| Categoria | Benchmark | Sage S2.1 Flash | GLM-5.3-Flash | DeepSeek-V4.1-Flash-1017 | Qwen3.8-Max | GPT-5.6 Sol | Claude Opus 5 |
|---|---|---|---|---|---|---|---|
| Agentic coding | Terminal-Bench 2.1 | 87,9 | 84,3 | 87,6 | 89,6 | 86,2 | **90,2** |
| Agentic coding | DeepSWE | 67,9 | 63,7 | **73,9** | 67,0 | 70,6 | 72,6 |
| Agentic coding | NL2Repo-Bench | 57,2 | 53,0 | 62,7 | 63,2 | 60,7 | **79,9** |
| Agentic coding | SWE-bench Pro | 60,6 | 60,3 | 61,8 | 65,3 | 59,8 | **76,5** |
| Productividad | SpreadsheetBench 2 | **37,1** | 32,4 | 35,8 | 34,9 | 32,7 | 33,6 |
| Productividad | ALE-CLI | 32,4 | 28,1 | **35,4** | 24,8 | 28,6 | 29,5 |
| Productividad | APEX-Agents | 61,7 | 50,8 | **69,2** | 66,3 | 55,4 | 61,3 |
| Productividad | GDPval | 78,0 | 67,7 | 77,6 | 79,6 | 69,6 | **80,0** |
| Productividad | Workspace-Bench-Lite | 67,1 | 65,1 | 66,8 | 67,4 | 57,4 | **68,1** |
| Productividad | Workspace-Bench | 61,7 | 59,7 | 63,0 | **63,9** | 50,9 | 62,0 |
| Uso de herramientas | OfficeQA Pro | **72,2** | 64,7 | 69,7 | 66,2 | 66,4 | 67,2 |
| Uso de herramientas | Harvey LAB | **25,0** | 20,0 | 11,7 | 24,2 | 5,0 | 22,7 |
| Uso de herramientas | AutomationBench | 56,7 | 48,3 | **57,8** | 49,7 | 45,7 | 49,4 |
| Uso de herramientas | BFCL V4 | 75,5 | 71,7 | 71,4 | 66,8 | 68,8 | **80,6** |
| Uso de herramientas | JobBench | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: la fila de JobBench aparece truncada en la model card original, por lo que no se dispone de sus valores. El autor indica que Sage S2.1 Flash queda segundo en JobBench, pero no se proporcionan las cifras.

## Requisitos de hardware

- Con 321.323 millones de parametros en FP8, el peso del modelo ocupa aproximadamente 321 GB, lo que exige un nodo multi-GPU para inferencia.
- No cabe en ninguna GPU de consumo (RTX 4090, 24 GB; RTX 5090, 32 GB) ni en configuraciones de una sola GPU profesional de 80 GB.
- Despliegue tipico en nodos con multiples aceleradores de centro de datos: A100 80 GB, H100 80 GB o H200; se necesitan al menos cuatro GPU de 80 GB solo para alojar los pesos.
- Para la version no cuantizada, los requisitos de memoria son significativamente mayores.
- Opciones de despliegue: no se especifican en la informacion proporcionada; por formato (safetensors) es compatible con servidores de inferencia tipo vLLM o TGI, pero no se confirma soporte explicito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntos fuertes (segun benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sage S2.1 Flash | 321,3 B | no disponible | OfficeQA Pro (72,2), Harvey LAB (25,0), SpreadsheetBench 2 (37,1), MLE-bench Lite (90,3) | no disponible | Hugging Face y ModelScope |
| GLM-5.3-Flash | no disponible | no disponible | Competitivo en productividad y uso de herramientas | no disponible | no disponible |
| DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | DeepSWE (73,9), APEX-Agents (69,2), ALE-CLI (35,4) | no disponible | no disponible |
| Qwen3.8-Max | no disponible | no disponible | SWE-bench Pro (65,3), Workspace-Bench (63,9) | no disponible | no disponible |
| Claude Opus 5 | no disponible | no disponible | Terminal-Bench 2.1 (90,2), NL2Repo-Bench (79,9), SWE-bench Pro (76,5), BFCL V4 (80,6) | propietaria | API |
| GPT-5.6 Sol | no disponible | no disponible | DeepSWE (70,6) | propietaria | API |

Sage S2.1 Flash destaca en tareas documentales y cientificas (OfficeQA Pro, Harvey LAB, SpreadsheetBench 2, MLE-bench Lite), mientras que Claude Opus 5 y DeepSeek-V4.1-Flash-1017 lideran en codificacion agentica y ejecucion de tareas. La comparativa de parametros y contexto no puede completarse porque esos datos no estan disponibles para los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta indicada en la informacion disponible; no puede confirmarse el uso comercial sin consultar el repositorio.
- No se especifican los idiomas soportados; el rendimiento fuera del ingles es desconocido.
- No se publica la longitud de contexto, lo que impide planificar flujos con documentos o conversaciones largas.
- El modelo esta orientado a tareas cientificas y de investigacion; su comportamiento en dominios generales no esta evaluado en la informacion disponible.
- Riesgo de alucinacion inherente a modelos generativos; en contextos cientificos y legales (Harvey LAB, OfficeQA Pro) requiere verificacion humana de los resultados.
- Los benchmarks publicados proceden del propio autor; no se han contrastado de forma independiente.
- El tamano (321 B parametros, ~321 GB en FP8) impide el despliegue en hardware de consumo y limita su uso a infraestructura de centro de datos.
- La model card original esta truncada en la seccion de benchmarks (JobBench), por lo que la evaluacion presentada esta incompleta.
- No se detallan sesgos conocidos ni composicion del dataset de entrenamiento, lo que dificulta evaluar riesgos especificos.

## Enlaces

- Repositorio Hugging Face (FP8): https://huggingface.co/internlm/Sage-S2.1-Flash-FP8
- Repositorio Hugging Face (version no cuantizada): https://huggingface.co/internlm/Sage-S2.1-Flash
- Sitio web oficial: https://internlm.github.io/Sage-S2.1-Flash/
- Modelo Sage SciPerception: https://huggingface.co/internlm/Sage-SciPerception
- ModelScope (FP8): https://www.modelscope.cn/models/Shanghai_AI_Laboratory/Sage-S2.1-Flash-FP8
- ModelScope (no cuantizado): https://www.modelscope.cn/models/Shanghai_AI_Laboratory/Sage-S2.1-Flash
