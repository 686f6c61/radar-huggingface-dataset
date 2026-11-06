# mradermacher/femboyAV-4b-GGUF

## Resumen

femboyAV-4b-GGUF es la distribucion en formato GGUF del modelo RaspizdAI/femboyAV-4b, publicada por el usuario mradermacher, conocido por generar cuantizaciones estaticas de modelos de terceros. El modelo original es un fine-tune mediante LoRA (entrenado con Unsloth, 1 epoca) sobre Qwen3-VL-4B-Instruct-abliterated, es decir, una variante del modelo multimodal Qwen3-VL de 4.000 millones de parametros con el alineamiento de seguridad eliminado (abliterated) y posteriormente ajustado sobre el dataset de conversacion RaspizdAI/femboy-10k, compuesto por 10.000 pares publicos de un total de 10.330 usados en el entrenamiento.

El repositorio contiene unicamente pesos cuantizados en formato GGUF, con un total de 415.347.712 parametros reportados en la metadata de safetensors y un tamano de repositorio de 1,3 GB. La model card es minima: no incluye pipeline declarado, licencia, idiomas soportados ni resultados de evaluacion. La unica informacion tecnica disponible es la lista de cuantizaciones generadas (x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS) y la referencia al modelo base.

Su relevancia es limitada y de nicho: se trata de una cuantizacion de conveniencia para ejecutar un fine-tune conversacional de caracter tematico en hardware de consumo mediante llama.cpp u Ollama. No es un modelo de proposito general ni cuenta con documentacion que permita evaluar su calidad, sesgos o idoneidad para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivada de Qwen3-VL-4B-Instruct-abliterated; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 415.347.712 (segun metadata de safetensors del repo) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas con llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune LoRA de una epoca sobre Qwen3-VL-4B-Instruct-abliterated, realizado con Unsloth. Qwen3-VL es la familia multimodal de Qwen que combina un codificador visual con un decoder de lenguaje; la variante "abliterated" implica que se ha eliminado o neutralizado el alineamiento de seguridad del modelo original, de modo que las rechazos ante peticiones consideradas sensibles se ven reducidos. Sobre esa base se aplico un ajuste supervisado con el dataset RaspizdAI/femboy-10k, formado por 10.000 pares de conversacion publicos de los 10.330 empleados en el entrenamiento original.

No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset, la presencia de RLHF o DPO, ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La model card del repositorio GGUF se limita a indicar que son cuantizaciones estaticas del modelo original y a listar los niveles de cuantizacion generados.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, heredada del modelo base Qwen3-VL.
- Procesamiento de imagenes y texto (vision-lenguaje), segun la arquitectura Qwen3-VL del modelo original; no confirmado de forma explicita en la model card.
- Razonamiento y respuesta a instrucciones propias de un modelo Instruct, aunque el ajuste LoRA se orienta a un dominio conversacional especifico.
- Capacidades multilingues: no disponibles en la informacion proporcionada (el modelo base Qwen3-VL es multilingue, pero no se documenta el alcance tras el fine-tune).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion con fine-tunes tematicos en local: el formato GGUF y los niveles Q4_K_M o Q5_K_M permiten ejecutar el modelo en llama.cpp u Ollama en equipos de consumo para probar el comportamiento del ajuste sin infraestructura dedicada.
- Investigacion sobre modelos abliterated: util para estudiar como se comporta un modelo sin alineamiento de seguridad tras un fine-tune de dominio, en entornos controlados y con supervision.
- Prototipado de chatbots de personaje: el dataset de conversacion empleado sugiere un uso orientado a dialogos con personalidad definida; el modelo puede servir como base para demos de角色 conversacional.
- Evaluacion de cuantizaciones: al ofrecerse 12 niveles distintos (desde Q2_K hasta x-f16), permite comparar la degradacion de calidad conversacional segun la cuantizacion en un mismo fine-tune.
- Pruebas de pipelines multimodales ligeros: si se confirma la herencia de Qwen3-VL, podria emplearse para tareas basicas de descripcion de imagenes en entornos con recursos limitados, aunque sin garantias documentadas.
- Docencia y talleres de fine-tuning: sirve como ejemplo practico de cadena LoRA con Unsloth, conversion a GGUF y publicacion de cuantizaciones estaticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, aproximadamente 0,3-0,5 GB de pesos mas overhead de contexto y, si aplica, codificador visual; en x-f16, alrededor de 0,8-1 GB. Cifras orientativas calculadas a partir de los 415 millones de parametros reportados.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para las cuantizaciones bajas; para x-f16 se recomienda 6-8 GB. No se requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con memoria unificada suficiente).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| femboyAV-4b-GGUF (este) | 415 M (reportados) | no disponible | no disponible | GGUF | Fine-tune LoRA de Qwen3-VL-4B-Instruct-abliterated |
| RaspizdAI/femboyAV-4b | no disponible | no disponible | no disponible | safetensors (presumiblemente) | Modelo original del que deriva esta cuantizacion |
| RaspizdAI/femboyAV-4b-gguf | no disponible | no disponible | no disponible | GGUF | Cuantizaciones alternativas del mismo modelo publicadas por el autor original |
| Qwen3-VL-4B-Instruct | ~4 B | no disponible en la informacion | no disponible en la informacion | safetensors | Modelo base de la familia Qwen3-VL |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no declara licencia, idiomas, pipeline ni limitaciones, lo que impide evaluar su idoneidad legal y tecnica para uso comercial.
- Modelo abliterated: la eliminacion del alineamiento de seguridad incrementa el riesgo de generar contenido inapropiado, ofensivo o danino; no es apto para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano y agravado por la falta de evaluaciones publicadas.
- Fine-tune de nicho: el ajuste sobre un dataset conversacional especifico puede degradar capacidades generales del modelo base (razonamiento, codigo, matematicas) respecto a Qwen3-VL-4B-Instruct original.
- Discrepancia en el tamano: la metadata reporta 415 millones de parametros, muy por debajo de los 4.000 millones que sugiere el nombre "4b"; conviene verificar la integridad de los pesos antes de usarlos.
- Contexto e idiomas no documentados: no se puede garantizar el soporte de ventanas largas ni de castellano.
- Sin garantias de mantenimiento: el repositorio no presenta descargas ni likes y no hay evidencia de soporte por parte del autor.
- Uso responsable: al tratarse de un modelo sin alineamiento y de tematica especifica, su despliegue en produccion requeriria auditoria previa y sistemas de moderacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/femboyAV-4b-GGUF
- Modelo original: https://huggingface.co/RaspizdAI/femboyAV-4b
- Cuantizaciones del autor original: https://huggingface.co/RaspizdAI/femboyAV-4b-gguf
- Repositorio de peticiones de mradermacher: https://huggingface.co/mradermacher/model_requests
