# NonMiFrega/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una cuantización en formato GGUF del modelo DeepSeek-R1-Distill-Qwen-1.5B, publicada por el usuario NonMiFrega mediante el espacio automático GGUF-my-repo de ggml.ai. No se trata de un modelo nuevo: es una conversión del checkpoint oficial de DeepSeek, que a su vez es un destilado del modelo de razonamiento DeepSeek-R1 sobre la base Qwen2.5-1.5B. El interés práctico del artefacto es que empaqueta un modelo de razonamiento de 1,78 mil millones de parámetros en un único fichero de 1,1 GB, ejecutable en CPU y en GPUs de gama baja mediante llama.cpp.

El modelo resuelve el problema de ejecutar inferencia con cadena de pensamiento en entornos sin GPU dedicada o con VRAM muy limitada: al estar cuantizado a 4 bits con el esquema Q4_K_M, cabe en tarjetas de 4 GB e incluso en memoria de sistema. Es relevante ahora porque permite prototipar y validar pipelines de razonamiento (bloques ` thinking`, verificaciones intermedias) a coste casi nulo antes de escalar a modelos mayores.

Conviene señalar que la model card de este repositorio es autogenerada y no aporta información sobre datos de entrenamiento, idiomas ni evaluación. Además, el repositorio no registra descargas ni valoraciones, y sus metadatos indican una fecha de creación posterior a la actual, lo que aconseja verificar la integridad del fichero antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; destilado de DeepSeek-R1 sobre base Qwen2.5-1.5B (deducido del identificador del modelo base; sin detalle en la información disponible) |
| Parámetros totales | 1.777.088.000 (1,78 B), dato de safetensors del modelo base |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada (los ejemplos del autor usan `-c 2048`, valor de configuración, no la ventana nativa) |
| Tipos de cuantización | GGUF Q4_K_M (4 bits, k-quant de precisión mixta); es la única variante incluida en este repositorio |
| Idiomas soportados | No disponibles (la model card no los declara) |
| Licencia | MIT |
| Formato de pesos | GGUF, fichero único `deepseek-r1-distill-qwen-1.5b-q4_k_m.gguf`; tamaño del repositorio 1,1 GB |

## Arquitectura y entrenamiento

La información disponible no documenta el proceso de entrenamiento de este artefacto: la model card se limita a indicar que el checkpoint se convirtió a GGUF con llama.cpp a partir de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` y remite a la card original. Por el identificador del modelo base se deduce una arquitectura transformer decoder-only de la familia Qwen2.5, densa, con 1,78 B de parámetros, destilada a partir de las trazas de razonamiento de DeepSeek-R1. No hay datos en esta ficha sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

La innovación relevante no está en el modelo sino en el empaquetado: la cuantización Q4_K_M aplica precisión mixta (bloques de mayor bits para tensores sensibles, como las proyecciones de atención y las capas de salida) y reduce el peso a 1,1 GB, aproximadamente un tercio del tamaño en BF16. El precio es una pérdida de fidelidad numérica que afecta especialmente a tareas de varios pasos. El pipeline de conversión es el estándar de ggml.ai y no incluye calibración específica ni evaluación de perplejidad publicada.

## Capacidades

- Generación de texto conversacional con soporte de turnos multi-ítem, según la etiqueta `conversational` del repositorio.
- Razonamiento explícito mediante cadena de pensamiento: al ser un destilado de R1, el modelo produce bloques de pensamiento antes de la respuesta final.
- Resolución de problemas matemáticos y de lógica de complejidad baja a media, limitada por su tamaño de 1,78 B.
- Generación y explicación de código en lenguajes habituales, con calidad propia de un modelo pequeño.
- Ejecución local sin conexión mediante llama.cpp, con CLI y servidor HTTP (`llama-server`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite exponerlo tras una API compatible con OpenAI si se despliega con las herramientas adecuadas.
- Soporte de tool calling y comportamiento agéntico multi-paso: no disponible en la información proporcionada; no se documenta plantilla de herramientas ni formato de Function Calling.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es exclusivamente de texto.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Razonamiento local en equipos sin GPU: el fichero de 1,1 GB se ejecuta en CPU con llama.cpp, lo que permite probar prompts de razonamiento en un portátil estándar sin depender de servicios externos.
- Asistente de código en IDE con aislamiento de red: al no requerir conexión, encaja en entornos con requisitos de confidencialidad donde no se pueden enviar fragmentos de código a una API en la nube.
- Enrutador previo en arquitecturas multiagente: usar el modelo para clasificar si una consulta requiere razonamiento profundo y derivarla a un modelo mayor, reduciendo coste en el 60-80 % de peticiones triviales (el porcentaje depende del dominio y debe medirse).
- Prototipado y pruebas de regresión de infraestructura LLM: sirve como modelo de humo para validar versiones de llama.cpp, plantillas de chat y configuraciones de cuantización en CI antes de desplegar modelos de 7 B o superiores.
- Extracción de datos estructurados por lotes: procesar correos, incidencias o reseñas para obtener campos JSON, aprovechando el coste marginal casi nulo de la inferencia local frente a APIs de pago.
- Tutoría y explicaciones paso a paso: el formato de cadena de pensamiento permite mostrar el desarrollo de un problema matemático o lógico, útil en herramientas educativas que necesitan justificar la respuesta.
- Evaluación comparativa de cuantizaciones: este Q4_K_M puede contrastarse con variantes Q8_0 o BF16 del mismo modelo base para medir la degradación introducida por la cuantización en tareas concretas del dominio propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio es autogenerada por el espacio GGUF-my-repo y no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de perplejidad para la cuantización Q4_K_M. Tampoco se aportan datos de latencia o throughput. Para cifras del modelo sin cuantizar debe consultarse la card del modelo base, fuera del alcance de esta ficha.

## Requisitos de hardware

- Tamaño en disco: 1,1 GB para el fichero GGUF Q4_K_M.
- VRAM estimada para inferencia: en torno a 1,5-2,0 GB incluyendo caché KV para contextos moderados (estimación propia a partir del tamaño del fichero, no dato del autor).
- GPU consumer compatibles: cualquier tarjeta con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090); en las de 8 GB o más se puede aumentar el contexto y el tamaño de lote sin problemas.
- CPU: viable en x86-64 y Apple Silicon; el modelo completo cabe en RAM de sistemas con 4 GB o más, lo que permite ejecución íntegra en CPU.
- Despliegue: llama.cpp (`llama-cli` y `llama-server` son los métodos documentados por el autor), Ollama y LM Studio mediante importación del GGUF. vLLM requiere pesos en safetensors y su soporte de GGUF es limitado; TGI no admite GGUF. Para servir con vLLM conviene usar el repositorio del modelo base, no esta conversión.
- Latencia y throughput: no disponibles. La generación de cadenas de pensamiento largas incrementa el número de tokens de salida y, por tanto, el tiempo total de respuesta frente a un modelo instruct convencional del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NonMiFrega/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M-GGUF (este) | 1,78 B | No disponible | GGUF Q4_K_M, 1,1 GB | MIT | Repositorio con 0 descargas y 0 valoraciones |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | No disponible en esta información | Safetensors (BF16), en torno a 3,5 GB (estimación) | MIT | Repositorio oficial del modelo base |
| Otras cuantizaciones GGUF del mismo modelo base (Q2_K a Q8_0, terceros) | 1,78 B | No disponible | GGUF, entre aproximadamente 0,7 GB y 1,9 GB según esquema | MIT (heredada) | Múltiples repositorios de la comunidad |
| Qwen2.5-1.5B-Instruct (modelo base sin destilar) | No disponible en esta información | No disponible | Safetensors, GGUF en terceros | No disponible en esta información | Repositorio oficial de Qwen |

## Limitaciones y advertencias

- La model card es autogenerada por GGUF-my-repo: no documenta sesgos, datos de entrenamiento, alineamiento ni evaluación. No hay información verificable sobre el comportamiento del modelo en dominios sensibles.
- Repositorio sin validación comunitaria (0 descargas, 0 likes) y con metadatos inconsistentes: la fecha de creación indicada (2026-10-23) es posterior a la fecha actual. Conviene comprobar el hash del fichero y compararlo con una conversión propia desde el modelo base.
- No se publica perplejidad ni comparación con el modelo en BF16, por lo que se desconoce la degradación real introducida por Q4_K_M; en modelos pequeños, la cuantización a 4 bits afecta de forma notable a matemáticas y código de varios pasos.
- Riesgo alto de alucinación: con 1,78 B de parámetros, el modelo puede producir razonamientos plausibles pero incorrectos, especialmente en cuestiones factuales y en problemas que requieren conocimiento enciclopédico.
- Cadenas de pensamiento largas: el modelo puede generar muchos tokens de razonamiento antes de responder y, si se trunca el contexto, dejar el bloque ` thinking` sin cerrar. Hay que dimensionar la ventana y fijar límites de tokens de salida.
- Idiomas no declarados: aunque se espera cobertura razonable de inglés y chino por la base Qwen, no hay garantía documentada de calidad en castellano; requiere evaluación propia antes de usarlo con usuarios finales.
- Ventana de contexto nativa no documentada en esta ficha; los ejemplos del autor fijan `-c 2048`, insuficiente para documentos largos.
- Licencia MIT: permite uso comercial y modificación, pero debe verificarse la procedencia y los términos aplicables al checkpoint original y a los datos de destilación, no disponibles aquí.
- No uses este artefacto como sustituto de un modelo de 7 B o superior en tareas críticas; su función natural es prototipado, enrutado y ejecución en entornos restringidos.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/NonMiFrega/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M-GGUF
- Modelo base (card original con los detalles del destilado): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Espacio de conversión GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a software de mandos DS4Windows y a hilos del foro de Microsoft Community, sin relación con el artefacto.
