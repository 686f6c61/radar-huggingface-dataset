# mradermacher/Llama-3.2-3B-AgentInstruct-GGUF

## Resumen

Llama-3.2-3B-AgentInstruct-GGUF es una version cuantizada en formato GGUF del modelo Rumiii/Llama-3.2-3B-AgentInstruct, un ajuste fino de Llama 3.2 3B orientado especificamente a comportamiento de agente: razonamiento tipo ReAct, uso de herramientas (tool calling) y ejecucion de tareas en varios pasos. La cuantizacion la ha realizado mradermacher, un autor conocido por publicar versiones GGUF de modelos pequenos y medianos para su uso en llama.cpp y derivados. El modelo resultante conserva 3 212 749 888 parametros (aproximadamente 3,2 mil millones) y esta pensado para ejecutarse en hardware de consumo.

El problema que resuelve es doble. Por un lado, ofrece una variante de Llama 3.2 3B ya alineada para flujos de agente, de modo que no es necesario hacer un ajuste adicional para obtener un modelo que emita llamadas a funciones y estructuras de pensamiento-accion-observacion de forma consistente. Por otro, al distribuirse en GGUF con cuantizaciones desde Q2_K (1,5 GB) hasta f16 (6,5 GB), permite desplegar ese comportamiento en equipos sin GPU dedicada o con GPU de gama media, algo relevante cuando se quiere prototipar agentes localmente sin depender de APIs.

Es relevante ahora porque la mayoria de los modelos con capacidades de agente bien entrenadas superan los 7B o 30B de parametros, y la demanda de agentes locales, privados y de bajo coste ha crecido. Este modelo cubre ese hueco con un tamano de 3B, licencia Llama 3.2 (uso comercial permitido con condiciones) e idioma de trabajo declarado en ingles. La informacion publicada se limita a la ficha de cuantizacion; no hay model card detallada del ajuste original en los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.2 (inferido del modelo base; no se detalla en la informacion proporcionada) |
| Parametros totales | 3 212 749 888 (dato de safetensors) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) segun la ficha; no se declaran otros idiomas |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF (cuantizaciones estaticas; el repositorio original esta en safetensors/HF) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Rumiii/Llama-3.2-3B-AgentInstruct, que a su vez deriva de Llama 3.2 3B: un transformer decoder-only con atencion por consultas agrupadas (GQA) y normalizacion RMSNorm, en su variante densa de 3,2 mil millones de parametros. La ficha de cuantizacion no aporta detalles sobre capas, cabezas de atencion, dimension de embedding ni vocabulario, por lo que esos datos quedan como no disponibles.

En cuanto al entrenamiento, la unica informacion declarada es el dataset utilizado: zai-org/AgentInstruct, un corpus orientado a trayectorias de agente (razonamiento, invocacion de herramientas y observaciones) publicado por Zhipu AI. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF, DPO u otra alineacion adicional. Las etiquetas del repositorio (agent, react, tool-use) confirman la intencion del ajuste, pero no hay datos verificables sobre hiperparametros, regimen de entrenamiento o tecnicas de optimizacion como decodificacion especulativa. La innovacion aportada por este repositorio concreto es exclusivamente la cuantizacion: se ofrecen cuantizaciones estaticas (sin imatrix ni ponderadas, segun indica el autor).

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno.
- Razonamiento tipo ReAct: el modelo esta entrenado para alternar pensamiento, accion y observacion en un bucle explicito.
- Tool calling / function calling: emision de llamadas a herramientas externas segun el esquema definido por el desarrollador.
- Ejecucion de tareas de agente en varios pasos (multi-step reasoning), incluyendo encadenamiento de varias herramientas para resolver un objetivo.
- Capacidad de seguir instrucciones y mantener el rol asignado mediante plantilla de chat.
- No se declaran capacidades de vision, audio, generacion de imagenes ni modo de pensamiento extendido.
- Capacidades multilingues: solo se declara ingles; no hay evidencia en la informacion proporcionada de un rendimiento fiable en castellano u otros idiomas.

## Casos de uso

- Agentes locales de automatizacion de tareas: al estar disponible en GGUF desde 1,5 GB, permite ejecutar un bucle ReAct completo en portatiles sin GPU, usando llama.cpp u Ollama, para tareas como renombrar ficheros, consultar APIs internas o rellenar formularios mediante herramientas definidas por el usuario.
- Asistentes de soporte tecnico con acceso a herramientas: el modelo puede consultar una base de conocimiento o un sistema de tickets a traves de tool calling y devolver una respuesta sintetizada, manteniendo el formato de agente necesario para integrarlo en un orquestador tipo LangChain o similar.
- Automatizacion de operaciones en CI/CD: integrado en un script que exponga comandos de shell, git o la API del proveedor de CI como herramientas, el modelo puede decidir que comando ejecutar para diagnosticar un fallo de build a partir del log.
- Prototipado rapido de agentes antes de escalar a un modelo mayor: sirve como sustituto economico durante el desarrollo de prompts, esquemas de herramientas y logica de orquestacion, ya que comparte familia y convenciones con Llama 3.2.
- Extraccion de datos estructurados desde texto: usando una herramienta o un esquema JSON de salida, el modelo puede leer un correo o un informe en ingles y devolver los campos normalizados, siempre que el volumen de contexto requerido sea moderado.
- Enrutado de consultas dentro de un sistema multiagente: por su tamano reducido y baja latencia potencial, puede actuar como clasificador o router que decide que agente especializado debe atender una peticion.
- Entornos con requisitos de privacidad: al ejecutarse integramente en local, permite procesar informacion sensible sin enviarla a APIs externas, con la salvedad de que la ventana de contexto disponible no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio no incluye mediciones de MMLU, HumanEval, GSM8K, evaluaciones de tool calling tipo BFCL ni comparaciones numericas con otros modelos.

## Requisitos de hardware

| Cuantizacion | Tamano de pesos | VRAM estimada en inferencia |
|---|---|---|
| Q2_K | 1,5 GB | ~2 GB |
| Q4_K_M | 2,1 GB | ~3-4 GB |
| Q6_K | 2,7 GB | ~4-5 GB |
| Q8_0 | 3,5 GB | ~5-6 GB |
| f16 | 6,5 GB | ~8 GB |

- Los tamanos de pesos son datos reales publicados en el repositorio; las cifras de VRAM son estimaciones que anaden margen para cache KV y sobrecarga del runtime, y dependen de la longitud de contexto usada.
- Cabe en cualquier GPU de consumo con 4 GB o mas de VRAM en cuantizaciones Q4; una RTX 3060, RTX 4060, RTX 3070 o superior lo ejecuta con holgura. En 8 GB de VRAM entran incluso Q8_0 y f16.
- Tambien es viable en CPU pura (Q4_K_M y superiores funcionan con 4-8 GB de RAM libre) y en Apple Silicon mediante Metal.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui. vLLM y TGI pueden servir GGUF, aunque el rendimiento optimo en estos frameworks se obtiene normalmente con safetensors. El repositorio declara compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3.2-3B-AgentInstruct (GGUF) | 3,21B | No disponible | en | Llama 3.2 | GGUF |
| Rumiii/Llama-3.2-3B-AgentInstruct | 3,21B | No disponible | en | Llama 3.2 | safetensors |
| Modelos comparables (Qwen2.5 3B Instruct, Phi-3.5-mini, Llama 3.2 3B Instruct) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone, en la informacion proporcionada, de datos de rendimiento ni de contexto de los modelos alternativos que permitan una comparacion cuantitativa fiable. La unica comparacion verificable es con el modelo base sin cuantizar, del que este repositorio es una conversion a GGUF.

## Limitaciones y advertencias

- Riesgo de alucinacion: con 3,2B de parametros, la tasa de invencion de hechos es previsiblemente alta en tareas de conocimiento; el ajuste a agentes no corrige esta limitacion de base.
- Capacidad limitada de razonamiento: un modelo denso de 3B tiene un techo bajo en matematicas, razonamiento logico complejo y cadenas de herramientas largas; los bucles ReAct pueden degradarse o entrar en repeticiones.
- Idioma: solo se declara ingles. No hay evidencia de soporte fiable de castellano ni de otros idiomas, por lo que su uso en produccion multilingue requeriria validacion previa.
- Longitud de contexto no documentada: se desconoce la ventana efectiva soportada por esta version cuantizada, lo que dificulta dimensionar la cache KV y planificar tareas de contexto largo.
- Cuantizaciones agresivas: Q2_K y Q3_K_S reducen notablemente la calidad. El propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M por equilibrio entre velocidad y calidad. Para uso en produccion no se recomienda bajar de Q4.
- No hay cuantizaciones ponderadas ni imatrix publicadas por el autor, lo que puede implicar una perdida de calidad algo mayor frente a cuantizaciones calibradas con datos.
- Licencia Llama 3.2: permite uso comercial con condiciones, entre ellas la atribucion "Built with Llama", el requisito de que los modelos derivados incluyan "Llama" al inicio del nombre y la sujecion a la politica de uso aceptable. Existe un limite de 700 millones de usuarios activos mensuales para el licenciatario. Conviene revisar el texto completo de la licencia antes de un despliegue comercial.
- Trazabilidad limitada: la model card del ajuste original no esta incluida ni resumida en este repositorio, por lo que no se pueden verificar hiperparametros, composicion del dataset ni proceso de alineacion.
- Adopcion baja: 198 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama-3.2-3B-AgentInstruct-GGUF
- Modelo base: https://huggingface.co/Rumiii/Llama-3.2-3B-AgentInstruct
- Dataset de entrenamiento: https://huggingface.co/datasets/zai-org/AgentInstruct
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#Llama-3.2-3B-AgentInstruct-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
