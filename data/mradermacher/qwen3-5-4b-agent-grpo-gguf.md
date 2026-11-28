# mradermacher/Qwen3.5-4B-agent-grpo-GGUF

## Resumen

`mradermacher/Qwen3.5-4B-agent-grpo-GGUF` es una publicacion de cuantizaciones GGUF estaticas del modelo `sirCamp/Qwen3.5-4B-agent-grpo`, un ajuste fino orientado a agentes y tool calling sobre la familia Qwen3.5-4B. El autor original del ajuste es sirCamp; mradermacher actua unicamente como cuantizador, generando los ficheros GGUF para su uso en llama.cpp y entornos compatibles. La licencia declarada es Apache 2.0, heredada del modelo base Qwen3.5-4B.

El modelo esta especializado en comportamiento agentico: llamada a herramientas, function calling y razonamiento multi-paso, entrenado mediante GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo. Esto lo hace relevante para pipelines de agentes ligeros que necesitan ejecutarse en hardware modesto, ya que el tamano reducido del modelo base (etiquetado como 4B) permite despliegue en GPU de consumo.

No obstante, hay que senalar una discrepancia importante: la model card del repositorio GGUF no incluye informacion tecnica detallada sobre arquitectura, datos de entrenamiento, benchmarks ni contexto. Ademas, el dato de parametros en safetensors del repositorio (333.514.240, es decir, ~333M) no concuerda con el nombre del modelo (4B), lo que sugiere que el campo de metadatos puede referirse a un componente parcial o estar mal reportado. Esta ficha refleja esa ambiguedad de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); detalles no disponibles |
| Parametros totales | No disponible de forma fiable: el nombre indica 4B, pero safetensors reporta 333.514.240 (~333M); discrepancia sin resolver |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, x-f16; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base `sirCamp/Qwen3.5-4B-agent-grpo` es un ajuste de Qwen3.5-4B entrenado con GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo que optimiza politicas comparando grupos de respuestas generadas. El objetivo declarado es mejorar el comportamiento agentico: tool calling, function calling y razonamiento multi-paso. Los tags del repositorio (`agent`, `tool-calling`, `function-calling`, `reinforcement-learning`, `grpo`) confirman este enfoque.

La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados, ni si hubo fases adicionales de SFT o DPO. Tampoco se especifican innovaciones arquitectonicas propias. El repositorio GGUF es una conversion estatica (convert_type: hf, output_tensor_quantised: 1) sin cuantizaciones ponderadas por imatrix en el momento de la publicacion. La presencia de ficheros `mmproj` sugiere que el modelo base incorpora capacidades multimodales (vision), aunque la model card no lo documenta explicitamente.

## Capacidades

- Generacion de texto en ingles.
- Tool calling y function calling, reforzados mediante entrenamiento con RL (GRPO).
- Comportamiento agentico y razonamiento multi-paso orientado a la ejecucion de tareas.
- Capacidades multimodales probables: el repositorio incluye ficheros `mmproj` (suplemento multimodal para llama.cpp), lo que indica soporte de entrada de imagenes, aunque no se detalla en la model card.
- Despliegue en llama.cpp y entornos compatibles con GGUF (Ollama, LM Studio, etc.).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).

## Casos de uso

- Agentes de automatizacion de tareas: el ajuste GRPO sobre tool calling permite construir agentes que invocan APIs y funciones externas de forma fiable en flujos de trabajo acotados, con un modelo lo bastante pequeno para ejecutarse en local.
- Asistentes de linea de comandos: integracion en herramientas CLI que requieren function calling para ejecutar comandos, leer ficheros o consultar servicios, aprovechando el formato GGUF para despliegue en estaciones de trabajo sin GPU dedicada.
- Orquestacion de pipelines ligeros: uso como modelo "router" o planificador que decide que herramienta invocar en un sistema multi-agente, donde el coste por inferencia importa mas que la profundidad de razonamiento.
- Prototipado de agentes en local: gracias a las cuantizaciones Q4_K_M y Q5_K_M, es posible iterar sobre disenos de agentes en una GPU de consumo antes de escalar a modelos mayores.
- Extraccion estructurada de datos via function calling: el modelo puede invocarse para rellenar esquemas JSON a partir de texto de entrada en pipelines de procesamiento documental.
- Evaluacion de tecnicas de RL para agentes: util como referencia reproducible para investigadores que estudian el efecto de GRPO en el comportamiento de tool calling en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: dependera del tamano real del modelo. Si se confirma el tamano de 4B, las cuantizaciones Q4_K_M ocuparian aproximadamente 2,5-3 GB y Q8_0 en torno a 4,5-5 GB. Si el modelo real fuese de ~333M parametros (segun safetensors), las cuantizaciones serian mucho menores (del orden de cientos de MB). No es posible dar cifras definitivas sin resolver la discrepancia.
- GPU recomendadas: para un modelo de 4B, una RTX 3060 (12 GB) o superior es suficiente en cuantizaciones Q4-Q8; para ~333M, cualquier GPU con 4 GB o incluso CPU.
- GPU de consumo: si, cabe en GPU de consumo en practicamente todas las cuantizaciones disponibles.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Los ficheros `mmproj` permiten habilitar entrada multimodal en llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-agent-grpo (este, cuantizado) | 4B (segun nombre) / discrepancia con safetensors | No disponible | Agentes, tool calling, GRPO | Apache 2.0 | GGUF |
| Qwen3.5-4B (base) | 4B | No disponible | Modelo generalista | Apache 2.0 | Safetensors, GGUF |
| Alternativas de agentes ligeros | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre indica 4B pero safetensors reporta ~333M; verificar el tamano real antes de planificar el despliegue.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea limitado.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni tareas agenticas, por lo que el rendimiento real es desconocido.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el ajuste con RL no elimina este riesgo, especialmente en llamadas a funciones con parametros inventados.
- Cuantizaciones estaticas: no hay versiones ponderadas por imatrix, lo que puede reducir la calidad en cuantizaciones bajas (Q2_K, Q3_K_S) frente a alternativas ponderadas.
- Model card escasa: el autor del GGUF no documenta el modelo base; la informacion sobre entrenamiento, contexto y datos procede solo de los tags.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar la licencia del modelo base original de Qwen por si hubiera terminos adicionales.
- Capacidad multimodal no documentada: la presencia de `mmproj` sugiere vision, pero no hay confirmacion oficial ni instrucciones de uso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-agent-grpo-GGUF
- Modelo base: https://huggingface.co/sirCamp/Qwen3.5-4B-agent-grpo
- Modelo Qwen3.5-4B original: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-4B-agent-grpo-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
