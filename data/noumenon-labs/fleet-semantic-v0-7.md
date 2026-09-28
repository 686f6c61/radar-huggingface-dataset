# noumenon-labs/Fleet-Semantic-v0.7

## Resumen

Fleet-Semantic-v0.7 es un artefacto de investigación publicado por noumenon-labs que consiste en un banco compilado de expertos LoRA heterogéneos sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No se trata de un checkpoint preentrenado de forma independiente: el repositorio referencia el backbone original de Qwen (no lo duplica) y añade seis adaptadores LoRA procedentes de terceros, junto con un enrutador semántico que decide cuántos expertos activar en cada petición mediante un esquema dinámico de k = 0, 1 o 2.

El interés técnico del artefacto está en su mecanismo de enrutado: el router opera sobre los estados ocultos congelados del backbone, incorpora una clase NULL/base explícita, aplica máscaras de elegibilidad por capa de origen y utiliza una pequeña señal en el espacio de pesos de los LoRA. Los expertos cubren dominios dispares: razonamiento matemático (GSM8K), razonamiento médico, operaciones legales y admisión de contratos, clasificación de intención, function calling y salida estructurada. Todos los adaptadores declaran una retención estructural de 1.0000 y proceden de revisiones fijadas del Hub.

Con 0 descargas y 0 likes en el momento de la consulta, el modelo es un release de nicho, orientado a reproducibilidad de investigación más que a uso en producción. Su relevancia actual reside en ejemplificar un patrón de composición modular de capacidades sobre un backbone pequeño (4B), con trazabilidad de licencias de terceros y un mecanismo de fallback a la base cuando ningún especialista resulta adecuado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Banco de adaptadores LoRA (PEFT) sobre transformer Qwen3-4B-Instruct-2507, con enrutado semántico sobre estados ocultos congelados y activación dinámica de k = 0/1/2 expertos |
| Parametros totales | 4B en el modelo base; el repositorio ocupa 1,6 GB y contiene el banco de expertos, manifiestos y prototipos. Número exacto de parámetros del banco: no disponible |
| Parametros activos | No es un MoE con parámetros activos fijos: se activan entre 0 y 2 expertos LoRA por petición sobre el backbone congelado. Parámetros por experto: no disponible |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | other (repositorio); expertos individuales con licencias apache-2.0 y mit según el manifiesto |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA y prototipos del router), más ficheros JSON de manifiesto y calibración |

## Arquitectura y entrenamiento

La arquitectura es una composición en tiempo de inferencia: el runtime carga Qwen/Qwen3-4B-Instruct-2507 y después instala el banco de expertos compilado. El backbone permanece congelado y actúa como extractor de características; el router semántico utiliza prototipos derivados de sus estados ocultos, una clase NULL/base explícita, máscaras de elegibilidad por capa de origen y una señal de bajo coste en el espacio de pesos de los LoRA para decidir la composición. La salida del enrutado puede ser k = 0 (sin delta especialista, gestiona la base), k = 1 (un experto) o k = 2 (dos expertos). Los seis expertos activos proceden de adaptadores de terceros con revisión fijada: `sinhal/qwen3-4b-instruct-2507-gsm8k-reasoning`, `towardsinnovationlab/Qwen3-4B_Instruct-medical`, `narcolepticchicken/qwen3-4b-legal-ops-contract-intake-lora`, `lituokobe/Qwen3-4B-Instruct-2507-LoRA-Intent-Classifier`, `prabhu-nithin/qwen3-4b-xlam-function-calling-60k-lora` y `matsunya/Qwen3_4B_Instruct_2507`.

No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset del router, ni si hubo fases de RLHF o DPO sobre el conjunto compilado. Tampoco se documentan hiperparámetros del compilador ni el rango de los LoRA. El autor declara una puerta de release superada ("Routing benchmark: PASS") y una retención estructural de 1.0000 para cada experto, pero no publica las cifras del benchmark. El proceso de release incorpora una validación de licencias: el comando de publicación rechaza la subida si algún experto activo carece de licencia redistribuible en lista blanca o de revisión exacta fijada en el Hub.

## Capacidades

- Razonamiento matemático: experto `math_reasoning` derivado de un adaptador ajustado sobre GSM8K.
- Razonamiento médico: experto `medical_reasoning` orientado a dominios clínicos.
- Operaciones legales: experto `legal_ops` para admisión de contratos y flujos de intake legal.
- Clasificación de intención: experto `intent` para etiquetado de intenciones en diálogo.
- Function calling / tool calling: experto `function_calling` derivado de un adaptador entrenado sobre xLAM (60k ejemplos).
- Salida estructurada: experto `structured` para generación con formato controlado.
- Composición multi-experto: activación simultánea de hasta dos especialistas (k = 2).
- Fallback a la base: con k = 0 el modelo base responde sin delta especialista, lo que cubre peticiones fuera de los dominios cubiertos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles; el artefacto es exclusivamente de generación de texto.

## Casos de uso

- Generación de código asistida por herramientas: el experto `function_calling` permite emitir llamadas estructuradas a APIs, de modo que el banco puede integrarse en pipelines de agente que consulten repositorios, CI/CD o servicios internos mediante esquemas JSON.
- Automatización de admisión de contratos: el experto `legal_ops` está diseñado específicamente para intake de contratos, por lo que puede usarse para clasificar, extraer y enrutar documentos legales entrantes antes de la revisión humana.
- Triaje de consultas médicas: con el experto `medical_reasoning` activo, el sistema puede resumir historiales o responder preguntas de dominio acotado, siempre con supervisión clínica y sin sustituir el juicio profesional.
- Enrutado de tickets y clasificación de intención: el experto `intent` permite etiquetar peticiones entrantes en centros de soporte, alimentando después colas o sistemas de asignación automática.
- Extracción con formato fijo: el experto `structured` resulta adecuado para convertir texto libre en JSON, tablas o formularios validables dentro de un ETL o un pipeline de ingesta documental.
- Tutoría y resolución de problemas matemáticos: el experto `math_reasoning` puede desglosar problemas tipo GSM8K paso a paso, útil en plataformas educativas con verificación posterior del resultado.
- Investigación sobre enrutado de adaptadores: dado su carácter de artefacto de investigación, sirve para reproducir experimentos de composición dinámica de LoRA, comparar estrategias de selección de expertos y estudiar el comportamiento del fallback k = 0.
- Despliegue de bajo coste con múltiples dominios: al apoyarse en un backbone de 4B y activar solo uno o dos deltas, permite servir varias capacidades especializadas sin mantener un modelo grande distinto por dominio.
- Escenarios con contexto largo: no recomendado ni evaluado de forma explícita en la información disponible, ya que no se documenta la ventana de contexto efectiva con el banco instalado.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card únicamente declara el resultado de la puerta de release del enrutado.

| Comprobación | Resultado |
|---|---|
| Routing benchmark (release gate) | PASS |
| Retención estructural (`math_reasoning`) | 1.0000 |
| Retención estructural (`medical_reasoning`) | 1.0000 |
| Retención estructural (`legal_ops`) | 1.0000 |
| Retención estructural (`intent`) | 1.0000 |
| Retención estructural (`function_calling`) | 1.0000 |
| Retención estructural (`structured`) | 1.0000 |
| MMLU, GSM8K, HumanEval u otros | No disponibles en la información proporcionada |

Existe un fichero `benchmark_results.json` en el repositorio con las comprobaciones de enrutado de la release, pero su contenido no se detalla en la información proporcionada.

## Requisitos de hardware

- Peso del repositorio: 1,6 GB (banco de expertos LoRA compilado, prototipos del router, manifiestos y sumas de verificación). El backbone Qwen3-4B-Instruct-2507 se descarga por separado.
- VRAM estimada para el backbone de 4B en fp16/bf16: en torno a 8 GB solo en pesos, más caché KV y activaciones; presupuesto práctico orientativo de 10 a 12 GB según contexto y lote (estimación derivada del tamaño del backbone, no confirmada por el autor).
- Cuantización de 8 bits: aproximadamente 5-6 GB de pesos. Cuantización de 4 bits: aproximadamente 3-4 GB (estimaciones, no confirmadas en la model card).
- GPU de datacenter: A100, H100, L40S y similares son suficientes con holgura; no se documentan cifras de throughput ni de latencia.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) sin problema; en RTX 4080/4070 Ti (16 GB) con margen; en tarjetas de 12 GB como la RTX 3060 12 GB probablemente sea viable con cuantización de 4 bits; en 8 GB el margen es muy ajustado.
- Opciones de despliegue: transformers junto con peft es la vía natural, ya que el artefacto es un banco de adaptadores con enrutado propio. vLLM y TGI soportan adaptadores LoRA, pero el enrutado dinámico k = 0/1/2 requeriría integración adicional y no está documentado como soportado.
- llama.cpp u Ollama: no soportados de forma directa. Para usarlos habría que fusionar los deltas en el backbone, lo que elimina el enrutado dinámico y el fallback k = 0.
- Latencia y throughput: no disponibles. El coste del enrutado semántico (prototipos sobre estados ocultos más señal en espacio de pesos) no está cuantificado en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| noumenon-labs/Fleet-Semantic-v0.7 | 4B de base más banco de LoRA (tamaño del banco no disponible) | No disponible | Solo declaración "PASS" en el benchmark de enrutado; sin cifras | other (expertos apache-2.0 y mit) | Hub de HuggingFace, 1,6 GB, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4B | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | Hub de HuggingFace |
| Otros bancos de LoRA con enrutado o composición de adaptadores | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (sistemas de fusión o enrutado de adaptadores como LoRAHub o MixLoRA) ni con otros modelos del mismo tamaño: no hay datos de benchmarks ni especificaciones de contexto en la información proporcionada, y la búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un checkpoint preentrenado de 4B. Sin el backbone Qwen3-4B-Instruct-2507 no funciona, y no puede evaluarse de forma aislada.
- La licencia del repositorio es "other" y los expertos tienen licencias dispares (apache-2.0 y mit). Antes de un uso comercial hay que revisar los términos del repositorio y de cada adaptador de origen, referenciados en `SOURCE_MANIFEST.json`.
- Los expertos son adaptadores de terceros: la calidad y los sesgos de cada dominio dependen de esos adaptadores, no de un entrenamiento propio del autor.
- Riesgo de enrutado incorrecto: si el router selecciona un especialista inadecuado, la respuesta puede degradarse respecto al backbone. El fallback k = 0 mitiga este caso, pero solo si el router lo selecciona correctamente.
- Riesgo de alucinación heredado del backbone de 4B, especialmente en los dominios médico y legal, donde una respuesta errónea puede tener consecuencias graves. Se requiere revisión humana en ambos casos.
- No se documentan idiomas soportados, longitud de contexto efectiva, ni comportamiento con cuantizaciones. Cualquier uso multilingüe o con contextos largos debe validarse empíricamente.
- No hay cifras públicas de benchmarks por tarea: la única métrica declarada es el resultado "PASS" de la puerta de enrutado, sin detalle de metodología ni del conjunto de evaluación.
- El repositorio no incluye el código fuente, el compilador, los tests, el CI, los Dockerfiles ni los notebooks, que pertenecen al repositorio de origen. Sin ese código, reproducir el enrutado dinámico requiere ingeniería propia.
- Con 0 descargas y 0 likes, no existe validación por parte de la comunidad ni evidencia de uso en producción.
- Los pesos distribuidos son adaptadores PEFT en safetensors; convertirlos a GGUF para llama.cpp u Ollama obliga a fusionarlos con el backbone y se pierde el enrutado dinámico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/noumenon-labs/Fleet-Semantic-v0.7
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Experto de razonamiento matemático: https://huggingface.co/sinhal/qwen3-4b-instruct-2507-gsm8k-reasoning
- Experto de razonamiento médico: https://huggingface.co/towardsinnovationlab/Qwen3-4B_Instruct-medical
- Experto legal (contract intake): https://huggingface.co/narcolepticchicken/qwen3-4b-legal-ops-contract-intake-lora
- Experto de clasificación de intención: https://huggingface.co/lituokobe/Qwen3-4B-Instruct-2507-LoRA-Intent-Classifier
- Experto de function calling (xLAM 60k): https://huggingface.co/prabhu-nithin/qwen3-4b-xlam-function-calling-60k-lora
- Experto de salida estructurada: https://huggingface.co/matsunya/Qwen3_4B_Instruct_2507
- Ficheros internos del repositorio citados en la model card: `fleet_bank.json`, `semantic_router.json`, `semantic_router.safetensors`, `benchmark_results.json`, `SOURCE_MANIFEST.json`, `SHA256SUMS.json` (accesibles desde la pestaña de ficheros del repositorio).
- Nota sobre la búsqueda web: no se han encontrado papers, blogs, repositorios ni demos asociados a este modelo. Los resultados devueltos por la búsqueda no guardan relación con el artefacto y se han descartado.
