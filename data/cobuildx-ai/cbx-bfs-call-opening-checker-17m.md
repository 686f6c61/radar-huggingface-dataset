# CobuildX-AI/cbx-bfs-call-opening-checker-17M

## Resumen

cbx-bfs-call-opening-checker-17M es un modelo de clasificación de tokens (token classification) desarrollado por CobuildX-AI, afinado a partir del encoder Ettin de 17M de parámetros de JHU-CLSP. Su función es analizar la apertura de una llamada de atención al cliente en el sector bancario y financiero, a partir de una transcripción etiquetada por hablante, y determinar con evidencia si el agente se identificó, si nombró a la institución, si informó de que la llamada se graba o monitoriza, con qué finalidad y si la transcripción cubre el inicio real de la llamada.

El modelo resuelve un problema muy concreto de control de calidad y cumplimiento en contact centers: verificar automáticamente los protocolos de apertura de llamada (identificación, aviso de grabación) sin depender de revisión manual. Devuelve etiquetas estructuradas más spans de evidencia sobre el texto de entrada, lo que permite auditar cada decisión. Está entrenado exclusivamente en inglés y orientado a dominios de banca y finanzas.

Se trata de un modelo muy pequeño (16,8 millones de parámetros, repo de 0,1 GB), lo que lo hace apto para despliegue de bajo coste y alto throughput. Su ventana de lectura efectiva es de 512 tokens, suficiente porque las aperturas de llamada suelen resolverse en los primeros 3-5 turnos. La licencia es Apache-2.0. El autor advierte explícitamente de que no es una decisión de cumplimiento ni debe usarse para monitorizar o juzgar a agentes individuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base Ettin encoder 17M) |
| Parametros totales | 16.805.921 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de entrada (lectura efectiva; el modelo trunca lo posterior) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo se basa en Ettin encoder 17M (jhu-clsp/ettin-encoder-17m), un encoder de la familia ModernBERT de aproximadamente 17 millones de parámetros. Sobre esa base se realiza un afinado para token classification, de modo que el modelo no solo emite etiquetas a nivel de secuencia (agent_identification, institution_identification, recording_notice, recording_purpose, opening_coverage) sino también spans de evidencia con tipo, posición de inicio y fin, y texto: AGENT, INST, NOTICE, PURPOSE, NEGATED y DISTRACTOR.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a un encoder de clasificación). El diseño del etiquetado incorpora reglas semánticas explícitas: la monitorización nunca implica grabación, "the bank" por sí solo se marca como unclear, una negación como "this call is not recorded" se etiqueta como NEGATED, y expresiones que suenan a aviso pero no lo son (por ejemplo, "let me record your address") se marcan como DISTRACTOR. La cobertura de apertura se aprende tanto desde metadatos (starts at call start: yes/no/not given) como desde el texto, aunque el autor indica que la inferencia de cobertura solo a partir del texto se entrenó y probó con transcripciones cortadas de forma construida.

## Capacidades

- Clasificación de la apertura de llamadas de atención al cliente en banca y finanzas, en inglés.
- Identificación del agente: distingue present, absent y unclear; "this is customer service" no cuenta como identificación.
- Identificación de la institución: detecta el nombre incluso con errores de reconocimiento de voz o dentro de un nombre de producto; "the bank" aislado se marca como unclear.
- Aviso de grabación: clasifica definite_recording, possible_recording, monitoring_only, none y unclear, aplicando la regla de que el aviso más fuerte prevalece.
- Finalidad de la grabación: devuelve listas de quality, training, security u other, o not_stated / unclear; lista vacía si no hay aviso.
- Cobertura de apertura: complete, incomplete o unknown, con la regla de que una ausencia no observada no equivale a ausencia confirmada.
- Extracción de spans de evidencia (AGENT, INST, NOTICE, PURPOSE, NEGATED, DISTRACTOR) con offsets de carácter.
- Procesamiento de entradas con línea de metadatos y turnos etiquetados como Agent, Customer o IVR, hasta 512 tokens (aproximadamente 2.000-3.000 caracteres).
- No soporta tool calling, function calling, agentes multi-step, visión ni audio; es un clasificador de texto puro.
- No predice la corrección de nombres o instituciones, el tono, nada posterior a la apertura ni el audio.

## Casos de uso

- Control de calidad automatizado en contact centers bancarios: el modelo procesa las transcripciones de las primeras 12 líneas de cada llamada y emite un informe estructurado con las cinco etiquetas y sus spans, permitiendo filtrar llamadas que incumplen el protocolo de apertura sin revisión manual.
- Auditoría de cumplimiento de aviso de grabación: clasifica si el aviso es definitivo, posible, solo de monitorización o inexistente, y extrae la finalidad declarada (calidad, formación, seguridad), lo que facilita demostrar que se informó al cliente.
- Detección de falsos positivos en revisiones: los spans DISTRACTOR y NEGATED permiten descartar casos que suenan a aviso pero no lo son, o avisos negados, reduciendo el ruido en los informes de auditoría.
- Triaje previo a revisión humana: con un modelo de 17M y ventana de 512 tokens, se puede ejecutar sobre lotes completos de transcripciones y derivar solo los casos dudosos (unclear, incomplete) a un revisor.
- Integración en pipelines de transcripción existentes: la API de ejemplo (CallOpeningChecker, método check y decision con políticas tipo "pass"/"fail"/"review") permite encadenar el modelo tras un sistema ASR con diarización y aplicar reglas de negocio configurables.
- Verificación de cobertura de la transcripción: la etiqueta opening_coverage evita penalizar llamadas cuyo inicio no está en la transcripción, algo útil cuando el sistema de captura empieza a grabar con retraso.
- Investigación sobre protocolos de apertura: al devolver evidencia textual con offsets, sirve para analizar patrones de identificación y aviso en corpus de llamadas anonimizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 16,8M de parámetros, los pesos en fp32 ocupan aproximadamente 67 MB y en fp16 unos 34 MB, más el overhead de activaciones y del tokenizador.
- GPU recomendadas: cualquier GPU moderna es sobradamente suficiente; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso GPUs de gama de entrada pueden ejecutar el modelo con holgura.
- Cabe en GPU de consumo y también en CPU para inferencia por lotes, dado el reducido tamaño.
- Opciones de despliegue: al ser un modelo PyTorch con safetensors y una API propia (cbx_call.CallOpeningChecker), el despliegue natural es un servicio Python; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son el formato habitual para un encoder de clasificación.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera baja latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cbx-bfs-call-opening-checker-17M | 16,8M | 512 tokens | Clasificación de apertura de llamadas bancarias | Apache-2.0 | Hugging Face (CobuildX-AI) |
| jhu-clsp/ettin-encoder-17m (modelo base) | ~17M | no disponible | Encoder general (ModernBERT) | no disponible en la información | Hugging Face (JHU-CLSP) |
| Alternativas específicas de clasificación de apertura de llamadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría y tarea en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no es una decisión de cumplimiento ni debe usarse para monitorizar o juzgar a agentes individuales; así lo advierte el autor.
- Solo cubre inglés; no soporta otros idiomas.
- Solo analiza la apertura de la llamada (hasta el turno del agente que responde a la primera petición explícita del cliente); nombres o avisos posteriores no cuentan.
- La ventana de lectura es de 512 tokens; el 2,2% de las entradas de test superaron ese límite y se truncaron.
- La cobertura de apertura inferida solo desde el texto se entrenó y probó con transcripciones cortadas de forma construida; el autor recomienda pasar la bandera de inicio de llamada cuando el sistema la conozca.
- No predice la corrección de nombres o instituciones, el tono, el contenido posterior a la apertura ni el audio.
- Riesgo de alucinación y de errores de clasificación inherente a un modelo de 17M; las etiquetas unclear existen precisamente para los casos ambiguos, pero no se aportan métricas de precisión o recall.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero debe respetarse la advertencia de uso previsto del autor.
- En producción, conviene combinar el modelo con revisión humana para los casos marcados como unclear o incomplete.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-bfs-call-opening-checker-17M
- Modelo base Ettin encoder 17M: https://huggingface.co/jhu-clsp/ettin-encoder-17m
