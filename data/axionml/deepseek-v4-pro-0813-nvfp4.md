# AxionML/DeepSeek-V4-Pro-0813-NVFP4

## Resumen

AxionML/DeepSeek-V4-Pro-0813-NVFP4 es un espejo listo para servir del checkpoint cuantizado por NVIDIA de DeepSeek-V4-Pro-0813, el modelo MoE de gran escala publicado por DeepSeek. El repositorio no introduce cambios propios: los pesos son una copia sin modificar de nvidia/DeepSeek-V4-Pro-0813-NVFP4 (revision 949138637e8e8fe190335be2396af62187dc8a83), y todo el crédito de la cuantización corresponde a NVIDIA. Su relevancia es practica: ofrece un checkpoint de 1,65 billones de parametros totales con 49B activados en formato NVFP4, con un tamano de repositorio de 941,1 GB, pensado para servir en Blackwell con SGLang o vLLM.

La arquitectura es un MoE con atencion hibrida (Compressed Sparse Attention y Heavily Compressed Attention) y Manifold-Constrained Hyper-Connections. Incorpora 384 expertos enrutados y un modulo de decodificacion especulativa DSpark, que se conserva sin cuantizar. La model card declara 1M de tokens de contexto y tres niveles de esfuerzo de razonamiento (low, high, max); una fuente secundaria de NVIDIA NIM cita 262K tokens de contexto, por lo que existe una discrepancia que conviene resolver antes de desplegar en produccion.

El interes inmediato para desarrolladores es que se trata de un modelo de licencia MIT, con resultados de evaluacion publicados por NVIDIA y comandos de despliegue ya validados en 8x B200. El coste de entrada es alto: no cabe en GPU de consumo y requiere paralelismo de tensor de 8 vias como minimo segun las configuraciones proporcionadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida (Compressed Sparse Attention + Heavily Compressed Attention) y Manifold-Constrained Hyper-Connections |
| Parametros totales | 1.650.497.936.906 (1,65T) |
| Parametros activos | 49B |
| Longitud de contexto | 1M tokens (segun model card); una fuente secundaria de NVIDIA NIM cita 262K, no disponible confirmacion definitiva |
| Tipos de cuantizacion | NVFP4 (E2M1 con escalas de bloque FP8 E4M3 sobre microbloques de 16 elementos) en expertos MoE enrutados; FP8 en atencion y expertos compartidos; BF16 en normalizaciones y embeddings; cabezas DSpark sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Expertos enrutados | 384 |
| Esfuerzo de razonamiento | low / high / max |
| Decodificacion especulativa | Cabezas DSpark incluidas, no validadas para este checkpoint NVFP4 |
| Tamano del repositorio | 941,1 GB |
| Modelo base | deepseek-ai/DeepSeek-V4-Pro-0813 |

## Arquitectura y entrenamiento

El modelo base es un transformer disperso de tipo mixture-of-experts con atencion hibrida. Combina Compressed Sparse Attention con Heavily Compressed Attention, lo que permite sostener ventanas de contexto muy largas reduciendo el coste de atencion. El enrutado reparte la computacion entre 384 expertos, de forma que solo 49B de los 1,65T de parametros se activan por token. Sobre la estructura se anade un modulo de decodificacion especulativa DSpark, orientado a acelerar la generacion; en este checkpoint las cabezas DSpark se conservan sin cuantizar, aunque la propia model card indica que la decodificacion especulativa no fue validada sobre la version NVFP4.

La cuantizacion la realizo NVIDIA con NVIDIA Model Optimizer v0.47.0rc1, usando la receta ptq/nvfp4_experts_only.yaml. Solo se cuantizan los expertos MoE enrutados: los pesos originales en MXFP4 se convierten a NVFP4 mediante bit-cast sin perdida y unicamente se reescriben las escalas de bloque; la atencion y los expertos compartidos permanecen en FP8, y las normalizaciones y los embeddings en BF16. El calibrado uso 1.024 muestras con un limite de secuencia de 4.096 tokens, extraidas de cnn_dailymail y Nemotron-Post-Training-Dataset-v2. No se proporciona informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con tres niveles configurables de esfuerzo (low, high, max), lo que permite ajustar el coste de computo al tipo de tarea.
- Capacidades agenticas reforzadas respecto a la version preview del modelo base, segun la documentacion de DeepSeek recogida en la busqueda web, con mejoras especialmente visibles en entornos de produccion.
- Razonamiento cientifico y de nivel experto, evidenciado por resultados en GPQA Diamond (88,42) y SciCode (53,75).
- Ejecucion de tareas de terminal y entornos de linea de comandos: Terminal-Bench Hard reporta 50,69.
- Tool calling y function calling, con parser dedicado disponible tanto en SGLang (--tool-call-parser deepseekv4) como en vLLM (--reasoning-parser deepseek_v4, junto con parser de razonamiento especifico).
- Razonamiento multi-paso y agentes: τ²-Bench Telecom alcanza 98,25, un benchmark de comportamiento agentico en conversacion con herramientas.
- Seguimiento de instrucciones: IFBench reporta 75,68.
- Contexto largo: AA-LCR obtiene 69,33, con soporte declarado de hasta 1M de tokens.
- Capacidades multilingues: no disponible (no se detalla lista de idiomas soportados).
- Vision y audio: no disponible.

## Casos de uso

- Atencion al cliente automatizada con herramientas: el modelo puede gestionar conversaciones multi-turno con contexto muy largo y encadenar llamadas a funciones (consultas de pedidos, cambios de tarifa, diagnostico de incidencias) gracias al soporte de tool calling y a su rendimiento de 98,25 en τ²-Bench Telecom, un benchmark especificamente disenado para este escenario.
- Agentes autonomos sobre terminal y CI/CD: con 50,69 en Terminal-Bench Hard, es adecuado para agentes que inspeccionan repositorios, ejecutan tests, interpretan errores de compilacion y proponen parches dentro de un pipeline automatizado.
- Asistencia a investigacion cientifica y calculo numerico: los resultados en GPQA Diamond (88,42) y SciCode (53,75) lo situan como candidato para tareas de razonamiento tecnico de dominio, como revision de derivaciones, generacion de scripts de simulacion o interpretacion de resultados experimentales.
- Analisis de documentacion extensa: con contexto declarado de 1M de tokens, puede procesar expedientes, contratos o bases de codigo completas en una sola pasada, lo que simplifica tareas de resumen, extraccion de clausulas y deteccion de contradicciones entre documentos.
- Generacion y revision de codigo en produccion: el modelo soporta los parsers de razonamiento y de tool calling de SGLang y vLLM, por lo que se integra en servidores compatibles con la API de OpenAI y en pipelines de revision automatica de pull requests.
- Razonamiento con presupuesto controlado: los modos low, high y max permiten desplegar una sola instancia para dos niveles de servicio distintos, usando low para clasificacion y enrutado y max para tareas de analisis profundo, sin cambiar de modelo.
- Evaluacion de calidad de pipelines de agentes: al ser un checkpoint cuantizado con los mismos pesos que la version de NVIDIA, sirve como referencia reproducible para comparar latencia y precision en infraestructura propia frente a los numeros publicados en B200.

## Benchmarks y rendimiento

Resultados publicados por NVIDIA para este checkpoint, medidos con SGLang sobre B200, con temperature=1.0, top_p=1.0 y esfuerzo de razonamiento maximo. La columna MXFP4 (source) corresponde al modelo base deepseek-ai/DeepSeek-V4-Pro-0813.

| Benchmark | MXFP4 (source) | NVFP4 |
|---|---|---|
| GPQA Diamond | 88,51 | 88,42 |
| AA-LCR | 68,67 | 69,33 |
| τ²-Bench Telecom | 96,49 | 98,25 |
| SciCode | 53,45 | 53,75 |
| IFBench | 76,53 | 75,68 |
| Terminal-Bench Hard | 51,39 | 50,69 |

Las diferencias entre ambas columnas son pequenas y en varios casos favorables a la version NVFP4, lo que sugiere que la cuantizacion de 4 bits sobre los expertos enrutados preserva el comportamiento del modelo base en estas tareas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni mediciones independientes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 941,1 GB, por lo que los pesos en NVFP4 requieren al menos ese orden de magnitud, mas la cache KV (configurable en FP8) y los buffers de activacion.
- GPU recomendadas: NVIDIA B200. Las configuraciones de vLLM fueron validadas sobre 8x B200 con las imagenes vllm/vllm-openai:v0.27.1 y v0.28.0; los resultados de evaluacion se midieron tambien en B200. NVFP4 depende de los multiplicadores FP4 nativos de la arquitectura Blackwell.
- Paralelismo: tanto el comando de SGLang como el de vLLM usan 8 vias de tensor parallelism (--tp 8 y --tensor-parallel-size 8), con expert parallelism habilitado en vLLM.
- GPU de consumo: no cabe. Ni siquiera con cuantizaciones mas agresivas el tamano de pesos lo permite en una unica GPU de consumo, y la ruta NVFP4 requiere hardware Blackwell.
- Opciones de despliegue: SGLang (con --trust-remote-code, --tool-call-parser deepseekv4 y --reasoning-parser deepseek-v4) y vLLM (con --enable-expert-parallel, --kv-cache-dtype fp8, --max-model-len 400000, --max-num-batched-tokens 8192 y --enable-chunked-prefill). La libreria declarada es transformers. No se documentan rutas GGUF, llama.cpp ni Ollama para este checkpoint cuantizado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | GPQA Diamond |
|---|---|---|---|---|---|---|
| AxionML/DeepSeek-V4-Pro-0813-NVFP4 | 1,65T | 49B | 1M declarados | NVFP4 en expertos, FP8 en atencion | MIT | 88,42 |
| nvidia/DeepSeek-V4-Pro-0813-NVFP4 | 1,65T | 49B | 1M declarados | NVFP4 en expertos, FP8 en atencion | MIT | 88,42 (mismos pesos) |
| deepseek-ai/DeepSeek-V4-Pro-0813 | 1,65T | 49B | 1M declarados | MXFP4 / FP8 / BF16 | MIT | 88,51 |
| deepseek-ai/DeepSeek-V4-Pro (Preview) | no disponible | no disponible | no disponible | no disponible | MIT (segun repositorio publico) | no disponible |

El checkpoint de AxionML es una copia identica del de NVIDIA, por lo que sus numeros son los mismos; la unica diferencia practica es el repositorio de origen. Frente al modelo base sin cuantizar, el NVFP4 reduce el espacio de almacenamiento a cambio de una perdida marginal y no uniforme en los benchmarks disponibles (mejora en AA-LCR, τ²-Bench Telecom y SciCode; baja en IFBench y Terminal-Bench Hard). No se dispone de datos comparativos con alternativas de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo base se entreno con datos que pueden contener lenguaje toxico y sesgos sociales; el modelo cuantizado hereda esas limitaciones y puede generar contenido inexacto, sesgado u ofensivo.
- Riesgo de alucinacion: no se documentan medidas especificas de mitigacion en la informacion disponible; aplican las precauciones habituales en produccion, especialmente en tareas de dominio cientifico o legal.
- Discrepancia de contexto: la model card declara 1M de tokens, mientras que una fuente secundaria de NVIDIA NIM cita 262K. Conviene validar la ventana real admitida por la configuracion de despliegue antes de disenar aplicaciones dependientes del contexto largo.
- La lista de idiomas soportados no esta disponible, por lo que no se puede garantizar calidad homogenea fuera de los idiomas mayoritarios.
- Decodificacion especulativa: las cabezas DSpark se conservan, pero la propia model card advierte de que no fueron validadas para este checkpoint NVFP4. No debe asumirse la ganancia de velocidad asociada a especulacion.
- Restricciones de hardware: NVFP4 requiere arquitectura Blackwell; no es desplegable en GPU Hopper, Ada ni de consumo.
- Licencia MIT: permite uso comercial y no comercial, pero al ser un derivado cuantizado conviene conservar la atribucion a NVIDIA (cuantizacion) y a DeepSeek (modelo base) segun los terminos de sus respectivos repositorios.
- Los resultados de benchmarks estan reportados por NVIDIA sobre B200 y no se han verificado de forma independiente en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es un espejo reciente, sin validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AxionML/DeepSeek-V4-Pro-0813-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813
- Version preview del base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- Checkpoint NVFP4 original de NVIDIA: https://huggingface.co/nvidia/DeepSeek-V4-Pro-0813-NVFP4
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Receta de cuantizacion: https://github.com/NVIDIA/Model-Optimizer/blob/main/modelopt_recipes/models/deepseek-ai/DeepSeek-V4-Pro-0813/ptq/nvfp4_experts_only.yaml
- Dataset de calibracion cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibracion Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Licencia MIT: https://opensource.org/license/mit
- Perfil de AxionML: https://huggingface.co/AxionML
- Ficha de despliegue en NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-v4-pro-0813?nim=self-hosted
- Repositorio espejo en GitHub: https://github.com/ViewWay/DeepSeek-V4-Pro-0813
- Analisis de requisitos de memoria y builds GGUF del modelo base: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/26/deepseek-v4-pro-0813-released/
