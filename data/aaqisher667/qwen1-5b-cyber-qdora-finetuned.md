# Aaqisher667/qwen1.5b-cyber-qdora-finetuned

## Resumen

El modelo `Aaqisher667/qwen1.5b-cyber-qdora-finetuned` es un adaptador PEFT publicado en HuggingFace por el usuario Aaqisher667. No se trata de un modelo completo, sino de pesos de ajuste fino (0,1 GB de repositorio) que deben cargarse sobre el modelo base `unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit`, es decir, una versión cuantizada a 4 bits de Qwen2.5-1.5B-Instruct preparada por Unsloth.

El nombre del repositorio sugiere un ajuste orientado al dominio de ciberseguridad ("cyber") y una técnica de adaptación de bajo rango cuantizada ("qdora", presumiblemente QDoRA). Sin embargo, la model card publicada es la plantilla por defecto de HuggingFace con todos los campos marcados como "[More Information Needed]", por lo que ni el dominio, ni el dataset, ni los hiperparámetros de entrenamiento están documentados por el autor.

Su relevancia práctica es limitada y experimental: al tratarse de un adaptador sin métricas publicadas, sin licencia declarada y con cero descargas, debe tratarse como un artefacto a evaluar antes de cualquier uso. En este sentido, resulta útil como caso de estudio de flujos de ajuste fino ligero con Unsloth, TRL y PEFT sobre modelos pequeños de 1,5B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT de bajo rango (lora) sobre un transformer decoder-only Qwen2.5-1.5B-Instruct; el nombre sugiere QDoRA (DoRA cuantizado), no confirmado en la model card |
| Parametros totales | No disponible para el adaptador (el repositorio ocupa 0,1 GB). El modelo base Qwen2.5-1.5B-Instruct tiene aproximadamente 1,5 mil millones de parametros segun su documentacion publica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card. El modelo base Qwen2.5-1.5B-Instruct declara 32 768 tokens segun su documentacion publica; el ajuste no redefine este valor |
| Tipos de cuantizacion | No documentado. El modelo base referenciado esta cuantizado en 4 bits con bitsandbytes (`unsloth-bnb-4bit`); el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponible en la model card. El modelo base declara soporte multilingue segun su documentacion publica |
| Licencia | No disponible |
| Formato de pesos | safetensors (pesos de adaptador PEFT, libreria `peft` 0.20.0) |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un adaptador PEFT (tag `peft`, tag `lora`) entrenado con `trl` y `unsloth`, sobre el checkpoint `unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit`, que a su vez es una cuantizacion a 4 bits de Qwen2.5-1.5B-Instruct. El sufijo "qdora" del nombre sugiere el uso de QDoRA (Weight-Decomposed Low-Rank Adaptation sobre pesos cuantizados), pero esta afirmacion no aparece confirmada en la model card.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO, ni sobre hiperparámetros como rango del adaptador, alpha, tasa de aprendizaje o numero de epocas. Tampoco se documenta la infraestructura de computo empleada. El unico dato de trazabilidad tecnica presente en el repositorio es la version de framework: PEFT 0.20.0.

La referencia `arxiv:1910.09700` incluida en los tags no corresponde a un articulo del modelo, sino al trabajo de Lacoste et al. (2019) sobre estimacion de emisiones de carbono, citado en la plantilla estandar de model card de HuggingFace.

## Capacidades

- Generacion de texto conversacional: la pipeline declarada es `text-generation` y los tags incluyen `conversational`, por lo que se espera que el adaptador mantenga el comportamiento de chat del modelo base.
- Capacidades heredadas del modelo base: Qwen2.5-1.5B-Instruct esta entrenado para instrucciones, razonamiento basico, matematicas elementales y generacion de codigo, aunque el adaptador no documenta ninguna evaluacion propia.
- Posible especializacion en ciberseguridad: el nombre del repositorio incluye "cyber", lo que apunta a un ajuste de dominio, pero no hay ninguna evidencia documental ni conjunto de datos declarado que lo confirme.
- Soporte de tool calling: no disponible (no documentado en la model card; el modelo base lo soporta segun su documentacion publica, pero se desconoce si el ajuste lo preserva).
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible para el adaptador.
- Modalidades adicionales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

Dado que no existen evaluaciones publicadas ni licencia declarada, los escenarios siguientes deben entenderse como candidatos a validar experimentalmente, no como usos confirmados.

- Prototipado local de asistentes conversacionales: al apoyarse en un modelo base de 1,5B en 4 bits, el conjunto puede ejecutarse en GPU de gama media o incluso en CPU con cuantizacion adicional, lo que permite iterar sobre un chatbot de dominio sin coste de API.
- Experimentacion academica con tecnicas de ajuste eficiente: el repositorio sirve como ejemplo reproducible de un flujo Unsloth + TRL + PEFT con adaptadores de bajo rango sobre pesos cuantizados, util para estudiar QDoRA o LoRA en modelos pequenos.
- Clasificacion y triaje de texto tecnico: si el ajuste "cyber" es real, un uso plausible seria etiquetar alertas, tickets o descripciones de incidentes en categorias predefinidas; requiere validacion previa con un conjunto de test propio.
- Extraccion de entidades en documentacion de seguridad: identificacion de nombres de vulnerabilidades, versiones de software o direcciones IP en informes; la ventana de contexto del modelo base permitiria procesar documentos de varias paginas.
- Generacion de resumenes de informes tecnicos: condensar avisos, boletines o analisis en resumenes breves, con supervision humana obligatoria por el riesgo de alucinacion en un modelo de 1,5B.
- Educacion y formacion interna: asistente de bajo coste para responder preguntas frecuentes sobre politicas o procedimientos, desplegado en infraestructura propia para no enviar datos sensibles a terceros.
- Generacion de codigo auxiliar en scripts de automatizacion: tareas sencillas de completado o explicacion de fragmentos, siempre con revision humana y sin asumir precision en lenguajes poco representados.
- Base para posteriores ajustes de dominio: el adaptador puede servir como punto de partida para un ajuste adicional con datos propios, dado su tamano reducido y su formato PEFT estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna seccion de evaluacion con datos, y el autor no ha publicado metricas de MMLU, HumanEval, GSM8K ni de ningun conjunto especifico del dominio. Tampoco existen resultados comparativos frente al modelo base sin ajustar, por lo que no es posible determinar si el ajuste mejora, degrada o mantiene las capacidades originales.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros del modelo base (aproximadamente 1,5B) y deben confirmarse con la configuracion real del checkpoint.

- Peso del modelo base en fp16/bf16: en torno a 3 GB, mas overhead de activaciones y cache KV; se recomienda un minimo de 4-6 GB de VRAM.
- Peso del modelo base en 8 bits: en torno a 1,6 GB; manejable con 3-4 GB de VRAM.
- Peso del modelo base en 4 bits: en torno a 1 GB; puede ejecutarse con 2-3 GB de VRAM.
- Cache KV: crece de forma lineal con la longitud de contexto; en fp16 y con la configuracion tipica de Qwen2.5-1.5B, una ventana completa de 32 768 tokens puede anadir del orden de 1 GB adicional de VRAM.
- GPU de consumo: si, cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y similares; tambien en GPUs de 6-8 GB con cuantizacion de 4 bits y contextos moderados.
- GPU de datacenter: A100, H100, L40S y similares no son necesarias para inferencia, aunque pueden usarse para entrenamiento o para servir muchas replicas concurrentes.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador directamente; vLLM y TGI con soporte de adaptadores LoRA para servicio concurrente; llama.cpp u Ollama requieren fusionar el adaptador con el modelo base y convertir el resultado a GGUF.
- Latencia y throughput: no disponibles, no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del adaptador, por lo que la comparacion se limita a caracteristicas estructurales. Los datos del modelo base y de las alternativas provienen de su documentacion publica y pueden variar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Aaqisher667/qwen1.5b-cyber-qdora-finetuned | Adaptador sobre 1,5B (no disponible el detalle) | No disponible (heredado del base) | No disponible | HuggingFace, 0 descargas, 0 likes | No disponible |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32 768 tokens | Apache 2.0 | HuggingFace, ampliamente utilizado | Documentado por el autor del modelo base (no incluido aqui) |
| SmolLM2-1.7B-Instruct | 1,7B | 8 192 tokens | Apache 2.0 | HuggingFace | Documentado por su autor |
| Gemma 2 2B Instruct | 2B | 8 192 tokens | Licencia Gemma | HuggingFace | Documentado por su autor |
| TinyLlama-1.1B-Chat | 1,1B | 2 048 tokens | Apache 2.0 | HuggingFace | Documentado por su autor |

La ventaja estructural del adaptador frente a estas alternativas es su tamano de descarga (0,1 GB) y la posibilidad de combinarlo con distintos checkpoints base, siempre que la licencia del adaptador se aclare. Su desventaja es la ausencia total de documentacion, evaluacion y soporte.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia, lo que impide determinar si el uso comercial esta permitido. Ademas, el uso derivado queda sujeto a la licencia del modelo base (Apache 2.0 en el caso de Qwen2.5-1.5B-Instruct).
- Model card vacia: todos los campos son la plantilla por defecto, sin informacion sobre datos de entrenamiento, hiperparametros, sesgos o uso previsto.
- Sin evaluacion: no hay benchmarks ni comparacion con el modelo base, por lo que no se puede saber si el ajuste aporta mejoras o introduce degradacion (por ejemplo, perdida de capacidades generales tras el ajuste de dominio).
- Riesgo elevado de alucinacion: los modelos de 1,5B parametros tienen una tasa de error factual notablemente superior a la de modelos de mayor tamano; en dominios tecnicos como seguridad informatica el impacto de una respuesta incorrecta puede ser grave.
- Idiomas no documentados: se desconoce si el ajuste ha degradado el soporte multilingue del modelo base, y en particular el rendimiento en castellano no esta verificado.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no es posible evaluar sesgos de dominio, de genero, culturales o de otro tipo.
- Contexto no verificado: aunque el modelo base admite 32 768 tokens, no se ha confirmado que el adaptador funcione correctamente en ventanas largas.
- Riesgo de seguridad en el dominio "cyber": un modelo ajustado en seguridad ofensiva podria generar contenido utilizable de forma malintencionada; conviene revisar el origen de los datos antes de desplegarlo.
- Reproducibilidad limitada: no se especifican versiones de Unsloth, TRL o bitsandbytes, solo PEFT 0.20.0, lo que dificulta reproducir el entrenamiento.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta implican ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aaqisher667/qwen1.5b-cyber-qdora-finetuned
- Modelo base: https://huggingface.co/unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit
- Referencia citada en los tags (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning mencionada en la plantilla: https://mlco2.github.io/impact

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a paginas corporativas de Microsoft sin relacion con el artefacto.
