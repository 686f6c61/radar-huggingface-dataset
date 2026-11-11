# mradermacher/Gork-27b-Cybersecurity-GGUF

## Resumen

Gork-27b-Cybersecurity es un modelo de lenguaje de 27.318.209.536 parámetros (aproximadamente 27,3 mil millones) especializado en ciberseguridad, publicado originalmente por ConsensusProtocol-Thanos y distribuido en formato GGUF por mradermacher. El modelo se presenta como una herramienta orientada a inteligencia de amenazas, respuesta a incidentes y uso de herramientas (tool-use), con etiquetas que apuntan a una base derivada de la familia Qwen (tag `qwen3.8`) y a un "consensus protocol" propietario del autor original. La versión aquí descrita es una cuantización estática del modelo base, no el modelo original.

La relevancia de esta ficha radica en que el repositorio ofrece pesos listos para inferencia local en formatos comprimidos (Q2_K y Q4_K_S entre los disponibles), lo que permite desplegar un modelo de 27B en hardware de consumo con requisitos de VRAM moderados. Sin embargo, la información pública es muy escasa: no hay model card detallada del modelo base, no se publican benchmarks y el repositorio registra cero descargas y cero "likes" en el momento de la consulta, lo que indica un modelo muy reciente y sin validación comunitaria.

El modelo está licenciado bajo Apache 2.0, lo que facilita su uso comercial, y declara únicamente el idioma inglés. Está pensado para flujos de trabajo conversacionales y de agentes en el dominio de seguridad, aunque la ausencia de documentación técnica verificable obliga a tratar sus capacidades con cautela hasta que existan evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `qwen3.8` sugiere base tipo transformer Qwen, sin confirmar) |
| Parametros totales | 27.318.209.536 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, x-f16 (segun tags de la model card) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 55,7 GB |
| Modelo base | ConsensusProtocol-Thanos/Gork-27b-Cybersecurity |
| Cuantizador | mradermacher (cuantizaciones estaticas, sin imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura del modelo base en la informacion proporcionada. El tag `qwen3.8` sugiere que el modelo deriva de una arquitectura de la familia Qwen (probablemente un transformer denso de ~27B), pero no se confirma en la model card. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado.

La model card del repositorio GGUF es puramente operativa: describe el proceso de cuantizacion estatica realizado por mradermacher, lista los ficheros disponibles y remite a la pagina del modelo base para informacion adicional. Las etiquetas `consensus-protocol` y `heimdallm` apuntan a componentes propietarios del autor original (ConsensusProtocol-Thanos), pero no hay documentacion publica que explique en que consisten ni como afectan al entrenamiento o a la inferencia. No se han publicado innovaciones tecnicas verificables (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, orientada al dominio de ciberseguridad.
- Soporte declarado de tool-use / function calling (tag `tool-use`).
- Capacidades de razonamiento multi-paso y flujos de agentes (tag `consensus-protocol`, sin detalles tecnicos).
- Aplicaciones de inteligencia de amenazas (threat-intelligence) y respuesta a incidentes (incident-response) segun los tags del repositorio.
- Capacidades multilingues: no disponibles; solo se declara ingles.
- Vision, audio u otras modalidades: no disponibles.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Triaje de alertas de seguridad: el modelo puede clasificar y priorizar alertas de SIEM/SOAR en ingles, resumiendo el contexto de cada alerta y sugiriendo una accion inicial. Su orientacion a threat-intelligence encaja con este flujo, aunque requiere validacion humana dado que no hay benchmarks publicados.
- Asistencia en respuesta a incidentes: generacion de resumenes de incidentes, lineas de tiempo y checklists de contencion a partir de logs y notas del analista, aprovechando el soporte declarado de conversaciones multi-turno.
- Analisis de informes de amenazas: extraccion y sintesis de indicadores de compromiso (IoC) y tacticas MITRE ATT&CK de informes en texto, con salida estructurada mediante tool calling.
- Generacion de reglas de deteccion: redaccion de reglas Sigma, YARA o consultas KQL a partir de descripciones en lenguaje natural, integrable en pipelines de deteccion como asistente de borrador.
- Soporte a analistas junior: chatbot interno que responde preguntas sobre procedimientos, playbooks y conceptos de seguridad, desplegado en local con llama.cpp u Ollama para evitar enviar datos sensibles a APIs externas.
- Automatizacion de enriquecimiento de alertas: uso como agente que consulta herramientas (VT, AbuseIPDB, etc.) mediante function calling para enriquecer indicadores antes de escalar el caso.
- Despliegue air-gapped: al distribuirse en GGUF y con licencia Apache 2.0, puede ejecutarse en entornos sin conexion para analisis de malware o datos clasificados, siempre que el hardware lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K (~11,0 GB): aproximadamente 12-13 GB de VRAM con contexto moderado.
  - Q4_K_S (~15,9 GB): aproximadamente 17-18 GB de VRAM con contexto moderado.
  - Q8_0 / x-f16: no disponibles en la informacion (el repo incluye Q8_0 segun tags, pero no se detalla su tamano).
- GPU recomendadas:
  - Consumer: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_S; RTX 4080/4070 Ti Super (16 GB) para Q2_K con contexto reducido.
  - Profesional/datacenter: A100 40/80 GB, H100, L40S para cuantizaciones altas o contexto largo.
- Cabe en GPU de consumo: si, en GPUs de 16 GB o mas con cuantizaciones Q2_K/Q4_K_S; en GPUs de 12 GB solo con cuantizaciones mas agresivas o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors: vLLM, TGI o transformers.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Gork-27b-Cybersecurity (este) | ~27,3B | no disponible | Apache 2.0 | GGUF + safetensors | Especializado en ciberseguridad, sin benchmarks publicados |
| Qwen2.5-32B-Instruct | ~32,8B | 128K (segun documentacion publica) | Apache 2.0 | safetensors, GGUF | Base generalista, benchmarks publicos, sin especializacion en seguridad |
| Llama 3.3 70B Instruct | ~70B | 128K (segun documentacion publica) | Llama 3.3 Community License | safetensors, GGUF | Mayor tamano y calidad general, licencia con restricciones |
| Mistral Small 3 (24B) | ~24B | 32K (segun documentacion publica) | Apache 2.0 | safetensors, GGUF | Tamano similar, generalista, sin especializacion en seguridad |

La comparativa es orientativa: no existen evaluaciones publicas de Gork-27b-Cybersecurity que permitan contrastar su rendimiento real frente a estas alternativas en tareas de seguridad.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia verificable de su calidad en tareas de ciberseguridad ni en tareas generales.
- Modelo muy reciente y sin traccion comunitaria (0 descargas, 0 likes en el momento de la consulta), lo que reduce la confianza en su robustez.
- Solo soporta ingles; el uso en castellano degradara la calidad de forma significativa.
- Riesgo de alucinacion relevante en un dominio critico: las respuestas sobre IoCs, comandos o procedimientos de seguridad deben validarse siempre por un analista humano.
- La model card no documenta sesgos, datos de entrenamiento ni proceso de alineacion; no es posible evaluar sesgos conocidos.
- El tag `consensus-protocol` y `heimdallm` sugieren componentes propietarios no documentados; su comportamiento en produccion es incierto.
- Aunque la licencia es Apache 2.0, el modelo base y sus datos de entrenamiento no estan documentados, por lo que la cadena de licencias no puede verificarse por completo.
- Las cuantizaciones son estaticas (sin imatrix), por lo que la perdida de calidad en Q2_K puede ser mayor que en cuantizaciones ponderadas equivalentes.
- No apto como unica linea de defensa en produccion: debe usarse como asistente con supervision humana.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gork-27b-Cybersecurity-GGUF
- Modelo base: https://huggingface.co/ConsensusProtocol-Thanos/Gork-27b-Cybersecurity
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Gork-27b-Cybersecurity-GGUF
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
