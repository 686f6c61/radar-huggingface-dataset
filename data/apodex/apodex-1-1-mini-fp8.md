# apodex/Apodex-1.1-mini-FP8

## Resumen

Apodex-1.1-mini-FP8 es un modelo de razonamiento ("reasoning-first") desarrollado por Apodex AI, diseñado para tareas de investigacion complejas y de largo horizonte que requieren trabajar directamente con archivos, datos, codigo y herramientas. A diferencia de los modelos de chat convencionales, esta optimizado para ejecucion agenteica de extremo a extremo: puede mantener estado de tarea, adaptar su plan, coordinar subagentes en paralelo e incorporar feedback del usuario durante la ejecucion, todo dentro de una unica sesion continua.

El modelo se basa en Qwen/Qwen3.5-35B-A3B, una arquitectura MoE (Mixture of Experts) con 35.953.788.784 parametros totales y aproximadamente 3.000 millones de parametros activos, segun indica el sufijo "A3B" del modelo base. Esta version concreta, Apodex-1.1-mini-FP8, es una cuantizacion FP8 del modelo original, lo que reduce el peso a unos 37,5 GB y permite desplegarlo en una unica GPU de gama alta. Soporta una ventana de contexto de 262.144 tokens y esta licenciado bajo Apache 2.0, lo que facilita su uso comercial y su integracion en pipelines de produccion.

Su relevancia actual radica en que aborda una carencia comun en los modelos abiertos: la capacidad de ejecutar tareas agenteicas largas con verificacion integrada. Segun los datos publicados por el autor, el sistema Agent Team de Apodex 1.1 alcanza puntuaciones competitivas en benchmarks de investigacion y finanzas, superando a modelos cerrados de tamano similar en tareas como FrontierFinance y FrontierScience-Research.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5-35B-A3B |
| Parametros totales | 35.953.788.784 (35,95B) |
| Parametros activos | ~3B (inferido del nombre del modelo base "A3B") |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 (esta version); otras cuantizaciones no disponibles |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con endpoints OpenAI) |

## Arquitectura y entrenamiento

Apodex-1.1-mini-FP8 es un modelo de lenguaje de tipo Mixture of Experts (MoE) construido sobre Qwen3.5-35B-A3B. La arquitectura MoE activa solo una fraccion de los parametros totales por token (aproximadamente 3B de los 35,95B), lo que permite un throughput de inferencia relativamente alto para su tamano total. El modelo sigue la plantilla de chat de Qwen3.5, emitiendo llamadas a herramientas en formato `<tool_call><function=...><parameter=...></parameter></function></tool_call>` y razonamiento en bloques `thinking... response`.

El entrenamiento se ha orientado especificamente a tareas agenteicas: el modelo esta entrenado para function calling nativo, donde los esquemas de herramientas se pasan via el parametro `tools=` de la API de chat-completions y se renderizan en el prompt mediante la plantilla de chat. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO. El sistema completo incluye un "Agent Team" asincrono (AgentOS) que descompone tareas complejas, coordina subagentes en paralelo y mantiene un estado de tarea compartido, aunque este orquestador es un componente de software que envuelve al modelo, no una capacidad intrinseca del mismo.

## Capacidades

- Razonamiento multi-paso y modo "thinking" explicito, con salida de cadenas de razonamiento antes de la respuesta final.
- Function calling nativo y tool calling, compatible con el parser `qwen3_coder` y el formato OpenAI de `tool_calls`.
- Ejecucion agenteica de largo horizonte: puede mantener estado de tarea, adaptar planes y coordinar subagentes en paralelo cuando se usa con el harness FrontierAgent.
- Trabajo directo con archivos, datos, hojas de calculo, imagenes y codigo en entornos reales (segun la documentacion del autor).
- Verificacion integrada de afirmaciones contra fuentes, datos y computaciones (componente "Statement Review" del sistema).
- Capacidades multilingues limitadas a ingles y chino.
- Soporte de decodificacion especulativa (algoritmo NEXTN) para acelerar la inferencia en SGLang.
- Posible soporte de vision (el tag `image-text-to-text` aparece en los metadatos), aunque no esta confirmado en la documentacion publica.

## Casos de uso

- Investigacion academica y cientifica: el modelo puede leer articulos, extraer datos de tablas y figuras, ejecutar analisis estadisticos y generar informes verificables con citas comprobadas, gracias a su ventana de 262K tokens y su sistema de verificacion de afirmaciones.
- Analisis financiero y due diligence: puede procesar informes anuales, estados financieros y datos de mercado, ejecutar modelos de valoracion y producir informes con conclusiones contrastadas contra las fuentes, como sugiere su resultado lider en FrontierFinance (50,2).
- Automatizacion de tareas de datos: limpieza de datasets, seleccion de metodos, ejecucion de analisis exploratorios e inspeccion de resultados intermedios, todo dentro de una unica sesion sin reiniciar el contexto.
- Generacion de codigo en produccion: con soporte de tool calling y el parser `qwen3_coder`, puede integrarse en pipelines de CI/CD para generar, revisar y corregir codigo, o como asistente de programacion con acceso a repositorios y entornos de ejecucion.
- Agentes de investigacion de mercado: descomposicion de una pregunta amplia en subconsultas paralelas, recopilacion de informacion de multiples fuentes y sintesis de un informe final con verificacion de datos.
- Asistente de laboratorio bioinformatico: segun su resultado en BioMysteryBench (35,3), puede razonar sobre datos biologicos, formular hipotesis y disenar experimentos in silico, aunque con limitaciones frente a modelos especializados.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden al sistema completo "Agent Team" de Apodex 1.1 y a la variante mini. No se han publicado resultados de benchmarks clasicos como MMLU, HumanEval o GSM8K en la informacion disponible.

| Benchmark | Apodex 1.1 Agent Team | Apodex-1.1-mini (Agent Team) |
|---|---|---|
| APEX-Agents | 38,5 | 27,7 |
| GDPVal | 78,8 | no disponible |
| FrontierFinance | 54,3 | 50,2 |
| FrontierScience-Research | 63,3 | no disponible |
| BioMysteryBench | 35,3 | no disponible |
| Humanity's Last Exam | 56,1 | no disponible |

El autor indica que el sistema Agent Team supera consistentemente a la configuracion ReAct en los seis benchmarks, y que Apodex-1.1-mini lidera FrontierFinance entre los sistemas comparados. No se especifican los modelos de referencia utilizados en la comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en FP8 ocupa aproximadamente 36 GB en pesos. Con la ventana de contexto completa de 262K tokens y las claves KV asociadas, se recomienda al menos 80 GB de VRAM para un despliegue comodo.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB o H200. En GPUs de 48 GB (como L40S o A6000) podria caber con contexto reducido, pero no esta garantizado.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en FP8 sin cuantizacion adicional. Con cuantizacion GGUF de 4 bits (no publicada oficialmente) podria aproximarse, pero no hay versiones oficiales.
- Opciones de despliegue: SGLang (recomendado por el autor, con soporte de decodificacion especulativa NEXTN), vLLM, TGI o cualquier servidor compatible con transformers y safetensors. FriendliAI ofrece un endpoint gestionado.
- Latencia y throughput: no se han publicado cifras oficiales. La arquitectura MoE con ~3B activos deberia ofrecer un throughput superior al de un modelo denso de 35B, pero la ventana de 262K tokens incrementa el coste de memoria y atencion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Apodex-1.1-mini-FP8 | 35,95B totales, ~3B activos | 262K | Apache 2.0 | Agenteico, razonamiento, investigacion |
| Apodex-1.0-mini | 35B (segun blog de explainx.ai) | no disponible | Apache 2.0 | Agenteico, deep research |
| Qwen3.5-35B-A3B (modelo base) | 35,95B totales, ~3B activos | no disponible | Apache 2.0 | Chat general, multilingue |

No se dispone de datos de rendimiento comparables entre estos modelos en los mismos benchmarks. El blog de explainx.ai indica que Apodex-1.0-mini obtuvo 59,17 en FutureX, superando a Claude Sonnet 4.6 y GPT-5.5, pero no hay datos equivalentes para Apodex-1.1-mini en ese benchmark.

## Limitaciones y advertencias

- Idiomas limitados a ingles y chino; no hay soporte confirmado para espanol u otros idiomas en la documentacion.
- La capacidad de vision esta indicada en los metadatos (tag `image-text-to-text`) pero no se documenta en la model card; no debe asumirse sin verificacion.
- Los benchmarks publicados corresponden al sistema completo con Agent Team, no al modelo aislado; el rendimiento en configuracion ReAct es significativamente inferior (por ejemplo, 27,7 vs 38,5 en APEX-Agents).
- No se han publicado datos sobre sesgos, alucinacion o robustez en dominios especificos.
- El modelo requiere el harness FrontierAgent y parsers especificos (qwen3_coder, qwen3) para funcionar correctamente en modo agenteico; un despliegue sin estos componentes pierde gran parte de su valor.
- La cuantizacion FP8 puede introducir perdidas de precision en tareas de matematicas o calculo numerico intensivo frente a la version BF16, aunque no se han publicado evaluaciones al respecto.
- El repositorio tiene 0 descargas en el momento de la consulta, lo que sugiere que es un lanzamiento reciente con poca validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apodex/Apodex-1.1-mini-FP8
- Version sin cuantizar: https://huggingface.co/apodex/Apodex-1.1-mini
- Version anterior (1.0-mini): https://huggingface.co/apodex/Apodex-1.0-mini
- Pagina oficial: https://www.apodex.com/
- Servicio online: https://www.apodex.ai
- API: https://platform.apodex.ai
- Repositorio del harness Agent Team: https://github.com/ApodexAI/FrontierAgent
- Blog tecnico: https://www.apodex.com/blog/apodex-1.1-scaling-agentic-intelligence-for-complex-work
- Tech report (PDF): https://www.apodex.com/pdf/20260824
- Paper asociado (arXiv): arxiv:2608.23283
- Endpoint gestionado en FriendliAI: https://friendli.ai/models/apodex/Apodex-1.1-mini-FP8
- Analisis de Apodex-1.0-mini en explainx.ai: https://www.explainx.ai/blog/apodex-1-0-mini-futurex-35b-deep-research-2026
