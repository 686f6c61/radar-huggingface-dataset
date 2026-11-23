# jayesh20/swapper

## Resumen

Swapper es un ajuste fino del modelo Qwen/Qwen3.5-0.8B publicado por el usuario jayesh20 en Hugging Face. Su particularidad es que no se ha entrenado mediante SFT ni DPO convencional, sino mediante una tecnica de ingenieria de representaciones (representation engineering) que localiza la direccion interna de "rechazo" en el flujo residual del transformer y la elimina matematicamente de las matrices de pesos que escriben en dicho flujo. El objetivo declarado es obtener un modelo "decensurado" que no active respuestas de negativa ante peticiones consideradas daninas.

El modelo hereda la arquitectura y el tamano del Qwen3.5-0.8B base, un transformer denso de aproximadamente 0.8 mil millones de parametros, orientado a generacion de texto conversacional. El repositorio incluye los pesos ortogonalizados en formato safetensors (3.2 GB), scripts de configuracion, un chatbot de terminal con streaming y dos cuadernos Jupyter que documentan el proceso de ablation y el estudio de optimizacion con Optuna.

La relevancia de esta ficha es doble: por un lado, ilustra una tecnica emergente de modificacion de conducta en modelos abiertos que opera directamente sobre los pesos en lugar de sobre datos; por otro, plantea cuestiones importantes sobre seguridad, licencias y uso responsable, dado que el modelo esta disenado explicitamente para eliminar barreras de rechazo. El repositorio no registra descargas ni likes en el momento de la consulta y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-0.8B) |
| Parametros totales | Aproximadamente 0.8 mil millones (heredados del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors de 3.2 GB, presumiblemente fp32 o fp16) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-0.8B, un transformer denso de aproximadamente 800 millones de parametros. Sobre esa base, Swapper no realiza un entrenamiento supervisado adicional ni un ajuste por preferencias, sino una modificacion directa de pesos. El procedimiento descrito en la model card consta de tres pasos: primero se cachean las activaciones de una capa intermedia (la capa 14) para instrucciones daninas de AdvBench y instrucciones inofensivas de Alpaca, en la posicion del ultimo token del prompt; despues se calcula la direccion de rechazo como la diferencia normalizada entre las medias de activaciones de ambos conjuntos; finalmente se proyectan todas las matrices que escriben en el flujo residual (embedding de tokens, proyecciones de salida de atencion y proyecciones down del MLP) para eliminar la componente alineada con esa direccion mediante la transformacion W' = (I - r r^T) W.

El resultado es un modelo en el que, segun el autor, la red no puede representar ni escribir matematicamente la caracteristica de rechazo, sin degradar las capacidades conversacionales generales. El repositorio incluye un cuaderno (`heretic_qwen3_5_0_8b_final.ipynb`) que documenta un estudio de optimizacion con Optuna para la ablation direccional, lo que sugiere que la seleccion de capa y la magnitud de la proyeccion se ajustaron de forma empirica. No se especifican en la informacion disponible el numero de tokens de entrenamiento (no hay entrenamiento en el sentido clasico), la composicion detallada del dataset mas alla de AdvBench y Alpaca, ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con soporte de historial de conversacion en el chatbot incluido.
- Generacion de texto con streaming mediante `TextStreamer` de la libreria Transformers.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.5-0.8B.
- Supresion de respuestas de rechazo ante peticiones que el modelo base rechazaria, segun el diseno del autor.
- Procesamiento multimodal declarado en el codigo de ejemplo (`AutoProcessor`, `AutoModelForMultimodalLM`), aunque no se detallan en la informacion disponible las modalidades concretas soportadas.
- Soporte de plantilla de chat mediante `apply_chat_template`.
- No se documenta soporte explicito de tool calling, function calling ni modos de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Investigacion en seguridad de modelos: el modelo sirve como banco de pruebas para estudiar como la ablation direccional afecta a la conducta de rechazo y que capacidades se preservan o degradan, comparandolo con el Qwen3.5-0.8B original.
- Analisis de mecanismos internos (interpretabilidad): los cuadernos incluidos permiten reproducir el calculo de la direccion de rechazo y la proyeccion de pesos, util para investigadores que estudian representaciones internas en transformers pequenos.
- Experimentos de alineacion y desalineacion controlada: permite comparar tecnicas de modificacion de conducta (SFT, DPO, ablation direccional) sobre una misma base de 0.8B en entornos de laboratorio.
- Desarrollo de chatbots de terminal para prototipado: el script `chatbot.py` ofrece un punto de partida para conversaciones con streaming e historial en local, adecuado para pruebas de concepto con recursos limitados.
- Evaluacion de riesgos en pipelines de moderacion: al ser un modelo disenado para no rechazar, puede emplearse como caso negativo en la validacion de clasificadores de seguridad y sistemas de filtrado.
- Docencia y formacion tecnica: por su tamano reducido y su documentacion de metodo, es util para explicar ingenieria de representaciones y modificacion de pesos en cursos avanzados de IA.
- Pruebas de despliegue en hardware de consumo: con aproximadamente 0.8B de parametros, puede ejecutarse en GPU de gama media para experimentar con tecnicas de inferencia y cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3.2 GB en safetensors, lo que sugiere pesos en fp32; en fp16 el modelo requeriria aproximadamente 1.6 GB y en cuantizacion de 8 bits alrededor de 0.8 GB, aunque no se confirman cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp32, como una RTX 3060, RTX 4060 o superior; para fp16 bastaria con 2-3 GB.
- Cabe en GPU de consumo: si, en la mayoria de GPU consumer modernas con 4 GB o mas de VRAM.
- Opciones de despliegue: Transformers con `device_map="auto"` segun el ejemplo del autor; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no haber pesos GGUF publicados, llama.cpp y Ollama requeririan conversion previa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jayesh20/swapper | ~0.8B | No disponible | Ablation direccional del rechazo sobre Qwen3.5-0.8B | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B | ~0.8B | No disponible | Modelo base original con alineacion estandar | No disponible en la informacion | Hugging Face |
| Variantes "abliterated" de modelos abiertos (familia generica) | Variable | Variable | Ablation de direccion de rechazo mediante tecnicas similares | Variable | Hugging Face |

La comparacion con alternativas concretas no esta disponible en la informacion proporcionada; la unica referencia directa es el modelo base Qwen/Qwen3.5-0.8B, del que Swapper hereda arquitectura y parametros pero del que difiere en la conducta de rechazo tras la ortogonalizacion de pesos.

## Limitaciones y advertencias

- El modelo esta disenado explicitamente para eliminar el rechazo ante peticiones daninas, lo que lo hace inadecuado para despliegues de produccion orientados al publico general sin capas adicionales de moderacion.
- Riesgo elevado de generar contenido danino, ilegal o eticamente problematico; el autor no documenta evaluaciones de seguridad posteriores a la modificacion.
- La ablation direccional puede degradar sutilmente capacidades generales (coherencia, instruction following) aunque el autor afirme lo contrario; no se aportan benchmarks que lo verifiquen.
- Riesgo de alucinacion inherente a un modelo de 0.8B, agravado por la falta de evaluaciones publicadas.
- Soporte unicamente en ingles segun la model card; no se documentan capacidades multilingues.
- Longitud de contexto no especificada, lo que impide planificar casos de uso con contexto largo.
- Repositorio sin descargas ni validacion de la comunidad en el momento de la consulta; la calidad del proceso de ablation no ha sido auditada de forma independiente.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal y etica del contenido generado.
- El codigo de ejemplo emplea `AutoModelForMultimodalLM`, una clase que no es estandar en Transformers; conviene verificar la compatibilidad con la version instalada antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jayesh20/swapper
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio clonable via Git: https://huggingface.co/jayesh20/swapper (incluye `chatbot.py`, `refusal_demo.ipynb` y `heretic_qwen3_5_0_8b_final.ipynb`)
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, demos o repositorios externos.
