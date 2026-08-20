# ITLL/Bounty.Hunter.47m

## Resumen

Bounty.Hunter.47m es un modelo de lenguaje causal decoder-only entrenado desde cero por ITLL, diseñado específicamente para el razonamiento explícito mediante chain-of-thought. Con aproximadamente 47 millones de parámetros y una ventana de contexto de 1096 tokens, el modelo integra tokens especiales de razonamiento (`<|think|>`, `<|thought|>`, `<|reasoning|>`, `<|answer|>`) como elementos de primera clase en el tokenizador y en la estructura de cada ejemplo de pretraining, en lugar de añadirlos posteriormente.

El modelo se entrena con un objetivo de predicción causal estricta de siguiente token, utilizando un subconjunto del dataset `Plans11/Organized_PreTrain_1k_Context` restringido a las particiones Think, Thought y Reasoning, excluyendo deliberadamente los shards de Chat, Instruct, Code_Instruct y Tool_Calling. Cada ejemplo se limita a 1095 tokens de contenido más EOS, con padding hasta 1096 posiciones, y se aplica una selección determinista con deduplicación SHA-256 para garantizar que ningún ejemplo se entrene dos veces.

Su relevancia radica en ser un experimento abierto sobre cómo incorporar el razonamiento estructurado directamente en el pretraining de modelos pequeños, ofreciendo una base para estudiar la emergencia de capacidades de razonamiento en escalas reducidas. Es un modelo experimental, sin garantías de corrección factual o lógica, y no está orientado a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal |
| Parametros totales | 46.912.320 (segun model card) / 49.664.832 (segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1096 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (ademas de training_state.pt, config.json, tokenizer files) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con 8 capas, tamaño oculto de 672, 8 cabezas de atencion, tamaño intermedio de 2688 y un vocabulario de 4096 tokens. La configuracion es compacta, pensada para entrenamiento experimental desde cero con recursos limitados.

El entrenamiento emplea prediccion causal de siguiente token como unico objetivo. Cada ejemplo de entrenamiento se limita estrictamente a 1095 tokens de contenido mas EOS, con padding hasta 1096 posiciones, y no se permite dividir ejemplos demasiado largos entre varias muestras. El dataset utilizado es `Plans11/Organized_PreTrain_1k_Context`, restringido a las particiones Think, Thought y Reasoning; las particiones de Chat, Instruct, Code_Instruct y Tool_Calling se excluyen explicitamente. Los tokens de razonamiento estan integrados en la estructura textual de cada ejemplo desde el inicio, no como un post-procesado.

La seleccion de ejemplos se realiza mediante un shuffle determinista con semilla fija y deduplicacion por hash SHA-256 del contenido, de modo que ningun ejemplo se repite en todo el entrenamiento. El estado de entrenamiento se persiste en Hugging Face, incluyendo el modelo, el optimizador, el tokenizador (que se vuelve inmutable tras su creacion) y metadatos de progreso. Hasta la fecha se han entrenado 20.000 ejemplos unicos en 625 pasos de optimizador.

## Capacidades

- Generacion de texto con razonamiento explicito mediante tokens especiales `<|input|>`, `<|think|>`, `<|thought||>`, `<|reasoning|>` y `<|answer|>`.
- Chain-of-thought integrado en el pretraining, lo que permite al modelo producir secuencias de razonamiento antes de dar una respuesta.
- No soporta tool calling ni function calling (el shard de Tool_Calling fue excluido del entrenamiento).
- No soporta agentes ni razonamiento multi-paso mas alla del chain-of-thought textual.
- Capacidades multilingues no especificadas; el vocabulario de 4096 tokens sugiere un alcance limitado.
- Sin capacidades de vision, audio u otras modalidades; es exclusivamente texto.

## Casos de uso

- Investigacion academica en razonamiento de modelos pequenos: el modelo sirve como plataforma para estudiar como emerge el chain-of-thought cuando se entrena desde cero con tokens de razonamiento estructurales, permitiendo comparar arquitecturas y estrategias de tokenizacion.
- Prototipado de aplicaciones de generacion de texto con razonamiento explicito: se puede integrar en demos o pruebas de concepto donde se requiera que el modelo muestre su proceso de pensamiento antes de responder, aunque sin expectativas de calidad alta.
- Experimentos de entrenamiento desde cero: su tamano reducido y la disponibilidad del estado de entrenamiento completo permiten reanudar o modificar el entrenamiento para probar hipotesis sobre datos, orden de ejemplos o hiperparametros.
- Estudio de tokenizacion con vocabulario pequeno: el tokenizador inmutable con 4096 tokens ofrece un caso de estudio sobre los limites y ventajas de vocabularios reducidos en modelos causales.
- Educacion en arquitecturas transformer: por su simplicidad y tamano, es adecuado para demostrar conceptos de atencion, capas y prediccion de siguiente token en entornos docentes.
- Analisis de sesgos y limitaciones en modelos pequenos: al ser un modelo experimental sin filtros adicionales, permite examinar que sesgos introduce el dataset restringido y como afectan a las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en precision FP32; con cuantizacion a 8 bits o 4 bits, puede ejecutarse en CPU sin GPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo NVIDIA GTX 1050, RTX 2060 o superiores; tambien funciona en Apple Silicon y CPUs modernas.
- Cabe en GPUs de consumo: si, en todas las GPUs consumer actuales, incluso en las mas modestas.
- Opciones de despliegue: Hugging Face Transformers (pipeline de generacion), llama.cpp para cuantizacion GGUF (si se convierte), o vLLM para entornos con multiples instancias (aunque el tamano lo hace innecesario).
- Latencia y throughput: no se han publicado datos; en una GPU moderna se espera una latencia de milisegundos por token dado el tamano reducido.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada ni en los resultados de busqueda. El modelo pertenece a una serie experimental de ITLL, pero no hay datos publicos de otros modelos de la misma familia con los que contrastar rendimiento o caracteristicas.

## Limitaciones y advertencias

- Modelo experimental: la propia model card advierte que no esta garantizado que produzca salidas factual o logicamente correctas.
- Contexto muy corto: 1096 tokens limita la capacidad de manejar documentos largos o conversaciones extensas.
- Vocabulario reducido: 4096 tokens restringe la expresividad linguistica y puede provocar segmentaciones suboptimas.
- Entrenamiento limitado a un subconjunto de datos: al excluir shards de chat, instruct, codigo y tool calling, el modelo no es adecuado para tareas conversacionales o de generacion de codigo.
- Posibles sesgos del dataset: al entrenarse sobre un corpus especifico sin filtros adicionales, puede reflejar sesgos presentes en ese corpus.
- Sin garantias de calidad en produccion: no se recomienda su uso en aplicaciones reales sin una evaluacion exhaustiva.
- Discrepancia en el numero de parametros: la model card indica 46.912.320, mientras que el archivo safetensors contiene 49.664.832 parametros; esta diferencia puede deberse a la inclusion de embeddings o tensores adicionales y debe tenerse en cuenta al dimensionar recursos.

## Enlaces

- Hugging Face: https://huggingface.co/ITLL/Bounty.Hunter.47m
- No se han encontrado otros enlaces relevantes (papers, blogs o repositorios) en la busqueda web.
