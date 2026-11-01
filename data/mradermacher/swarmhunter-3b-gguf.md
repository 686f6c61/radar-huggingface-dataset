# mradermacher/swarmhunter-3b-GGUF

## Resumen

Swarmhunter 3B es un modelo de lenguaje especializado en ciberseguridad, desarrollado por UtkarshSinghShrinet y cuantizado en formato GGUF por mradermacher, un cuantizador conocido por generar versiones estáticas de multitud de modelos de la comunidad. El modelo está orientado a tareas de detección de vulnerabilidades, análisis de exploits, pruebas de penetración, clasificación de CVE y CWE, y resolución de retos CTF (Capture The Flag), un nicho donde los modelos generalistas suelen rendir por debajo de las necesidades del sector.

La versión aquí documentada es el repositorio de cuantizaciones GGUF, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros runtimes compatibles. Con aproximadamente 3.086 millones de parámetros y cuants que van desde 1,4 GB (Q2_K) hasta 6,3 GB (f16), es un modelo ligero que puede funcionar incluso en portátiles sin GPU dedicada.

Su relevancia actual radica en la creciente demanda de asistentes de seguridad que puedan ejecutarse localmente, evitando enviar código potencialmente sensible o información de vulnerabilidades a APIs de terceros. Al estar bajo licencia Apache 2.0, puede usarse en entornos comerciales sin restricciones significativas. El modelo es conversacional y está entrenado en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, basado en el modelo base) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors/transformers) |

## Arquitectura y entrenamiento

El repositorio documentado es una coleccion de cuantizaciones estaticas GGUF del modelo base UtkarshSinghShrinet/swarmhunter-3b, realizadas por mradermacher a partir de los pesos originales en formato safetensors (3.085.938.688 parametros). La cuantizacion se realizo mediante conversion desde HuggingFace Transformers (convert_type: hf), y en el momento de redaccion de la ficha no hay cuants weighted/imatrix disponibles. No se especifica en la model card la arquitectura concreta (familia base, numero de capas, tipo de atencion) ni la longitud de contexto.

Sobre el entrenamiento del modelo base, la informacion disponible se limita a las etiquetas tematicas: ciberseguridad, deteccion de vulnerabilidades, analisis de exploits, pruebas de penetracion, CVE, CWE, CTF y seguridad de codigo. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni el uso de tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Deteccion de vulnerabilidades en codigo: analisis de fragmentos de codigo para identificar fallos de seguridad y clasificarlos.
- Analisis de exploits: interpretacion y explicacion de codigo exploit y payloads.
- Clasificacion de CVE y CWE: identificacion de vulnerabilidades conocidas y su taxonomia.
- Asistencia en pruebas de penetracion: apoyo en fases de reconocimiento, analisis y explotacion en contextos autorizados.
- Resolucion de retos CTF: razonamiento sobre retos de seguridad tipo Capture The Flag.
- Generacion y analisis de codigo con foco en seguridad (code-security).
- Formato conversacional: apto para dialogo multi-turno mediante librerias compatibles con GGUF.
- Capacidades multilingues: limitadas al ingles segun la model card.

No hay informacion sobre soporte de tool calling, function calling, vision, audio ni modos de razonamiento extendido.

## Casos de uso

- Revision de codigo con enfoque de seguridad: integracion en pipelines de CI/CD para detectar patrones de codigo vulnerables (inyecciones, desbordamientos, manejo inseguro de entradas) antes del despliegue, aprovechando su tamano reducido para ejecutarse en runners economicos.
- Clasificacion automatica de vulnerabilidades: asignacion de identificadores CWE a hallazgos de escaneo en herramientas de gestion de vulnerabilidades, reduciendo el triaje manual de alertas.
- Asistente para equipos de pentesting: consulta local de tecnicas de explotacion y analisis de payloads durante auditorias autorizadas, sin exponer informacion sensible a servicios externos.
- Entrenamiento y practica de CTF: generacion de pistas y explicaciones para participantes de retos de seguridad en plataformas educativas.
- Analisis de inteligencia de amenazas: resumen y contextualizacion de boletines de CVE para equipos de SOC con recursos limitados.
- Desarrollo seguro offline: asistente de codigo seguro en entornos aislados (air-gapped) donde no se permite conectividad externa, viable gracias al formato GGUF y su bajo consumo de recursos.
- Documentacion de hallazgos: redaccion de informes de vulnerabilidades a partir de salidas de herramientas de escaneo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K ni benchmarks especificos de ciberseguridad como CyberMetric o CTIBench), y tampoco se dispone de datos del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 1,5 GB con Q2_K hasta 6,5 GB con f16; la cuantizacion recomendada Q4_K_M requiere unos 2 GB, mas la memoria para el contexto.
- GPU recomendadas: cualquier GPU moderna con 4 GB de VRAM o mas ejecuta sin problemas las cuants Q4-Q6; con Q8_0 o f16 bastan GPUs de 8 GB como la RTX 3060 o RTX 4060 Ti. No se requieren GPUs de centro de datos (A100/H100) para este tamano.
- Consumer GPUs: cabe sobradamente en GPUs de consumo; incluso puede ejecutarse solo en CPU (portatiles con 8-16 GB de RAM) dada su ligereza.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con Transformers, vLLM o TGI.
- Latencia y throughput: no disponible; al ser un modelo de 3B, se espera inferencia rapida incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Especializacion | Formato |
|---|---|---|---|---|
| Swarmhunter 3B | 3,09 B | Apache 2.0 | Ciberseguridad (CVE/CWE, CTF, pentesting) | GGUF, safetensors |
| WhiteRabbitNeo (variantes 7B/13B) | 7-13 B | Licencia comunitaria variable | Ciberseguridad y ofensiva | GGUF, safetensors |
| SecGPT / modelos de seguridad finespecificos pequeños | 1-7 B | Variable | Analisis de seguridad | Variable |
| Llama 3.2 3B (generalista, referencia) | 3,2 B | Llama 3.2 Community License | Generalista | GGUF, safetensors |

Frente a modelos generalistas de tamano similar como Llama 3.2 3B, Swarmhunter 3B ofrece afinacion tematica en seguridad, aunque sin benchmarks publicados que cuantifiquen la ventaja. Frente a alternativas de seguridad como WhiteRabbitNeo, es mas ligero y tiene una licencia mas permisiva (Apache 2.0), a costa probablemente de menor capacidad de razonamiento general.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo afinado en dominios de seguridad, puede heredar sesgos de foros y datasets de hacking, y su rendimiento fuera del dominio de ciberseguridad no esta verificado.
- Riesgo de alucinacion: elevado en clasificacion de CVE/CWE si se usa sin verificacion; los identificadores y detalles tecnicos generados deben validarse siempre contra fuentes oficiales (NVD, MITRE).
- Limitaciones de idioma: entrenado solo en ingles; el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Longitud de contexto: no disponible, lo que impide evaluar su idoneidad para analizar archivos de codigo grandes; verificar en la ficha del modelo base antes de uso en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base por si incorpora restricciones adicionales.
- Uso etico y legal: el modelo esta orientado a tareas ofensivas (pentesting, exploits); su uso debe limitarse a entornos autorizados, ya que puede generar contenido dual-use.
- Calidad de las cuants: las versiones Q2_K y Q3_K_M tienen calidad reducida segun el propio cuantizador; para uso serio se recomiendan Q4_K_M o superiores. No hay cuants imatrix disponibles.
- Ausencia de benchmarks: no hay metricas publicadas que permitan comparar objetivamente su rendimiento frente a alternativas; se recomienda evaluacion propia en el dominio de uso antes de adoptarlo.

## Enlaces

- Repositorio de cuantizacion GGUF: https://huggingface.co/mradermacher/swarmhunter-3b-GGUF
- Modelo base: https://huggingface.co/UtkarshSinghShrinet/swarmhunter-3b
- Pagina de descarga resumida de mradermacher: https://hf.tst.eu/model#swarmhunter-3b-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
