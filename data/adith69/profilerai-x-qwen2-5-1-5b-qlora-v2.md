# Adith69/profilerai-x-qwen2.5-1.5b-qlora-v2

## Resumen

Profilerai-x-qwen2.5-1.5b-qlora-v2 es un ajuste fino por QLoRA del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario Adith69 en HuggingFace. Se trata de la segunda version de una linea de modelos bautizada como "profilerai-x", de la que no se documenta ni el dominio de aplicacion ni el conjunto de datos empleado en el entrenamiento. El modelo base es la version cuantizada a 4 bits (bnb-4bit) publicada por Unsloth, sobre la que se aplico un entrenamiento con la libreria Unsloth y TRL.

La relevancia de esta ficha es acotada y conviene ser transparente al respecto: el repositorio no incluye model card detallada, no declara hiperparametros de entrenamiento, no publica resultados de evaluacion y acumula cero descargas y cero "me gusta" en el momento de la consulta. Su interes practico reside en que sirve como ejemplo de flujo de trabajo de ajuste fino ligero (QLoRA sobre un modelo de 1,5B) y como punto de partida para quien quiera replicar el proceso, mas que como modelo listo para produccion.

Al derivar de Qwen2.5-1.5B-Instruct, hereda la arquitectura transformer decoder-only de la familia Qwen2.5, con aproximadamente 1,5 mil millones de parametros, ventana de contexto nativa de 32.768 tokens en el modelo base (ampliable a 131.072 con YaRN) y licencia Apache 2.0. Los pesos se distribuyen en formato safetensors y el repositorio ocupa 0,1 GB, un tamano coherente con adaptadores LoRA mas que con pesos fusionados en precision completa, si bien el autor no especifica cual de las dos opciones ha subido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1,5B (aproximadamente 1,54B en el modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base soporta 32.768 tokens nativos y hasta 131.072 con YaRN |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ ni GPTQ); el entrenamiento se realizo sobre un base cuantizado a 4 bits (bnb-4bit) |
| Idiomas soportados | en (declarado en la model card); el modelo base Qwen2.5 cubre mas de 29 idiomas, pero este ajuste no lo declara |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (segun las etiquetas del repositorio) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia Qwen2, con las innovaciones habituales de la serie: atencion con consultas agrupadas (GQA), embeddings posicionales rotatorios (RoPE), normalizacion RMSNorm y activacion SwiGLU con sesgo en las proyecciones QKV. El modelo base Qwen2.5-1.5B-Instruct se entreno sobre aproximadamente 18 billones de tokens y paso por fases de ajuste supervisado y optimizacion por preferencias antes de su publicacion. No se dispone del desglose de composicion del dataset ni de los detalles de esas fases para el modelo base en esta ficha.

Sobre ese base, Adith69 aplico un ajuste fino con QLoRA: el modelo de partida ya estaba cuantizado a 4 bits con bitsandbytes, y el entrenamiento se ejecuto con Unsloth, que segun la propia model card permite entrenar "2x mas rapido". No se documentan el numero de tokens de ajuste, la composicion del dataset, el rango y alpha de LoRA, la tasa de aprendizaje, el numero de epocas, ni si se aplico DPO o RLHF adicional. Tampoco se indica si los adaptadores se fusionaron con los pesos base antes de subirlos al repositorio.

## Capacidades

- Generacion de texto conversacional: al derivar de Qwen2.5-1.5B-Instruct, mantiene el formato de chat con tokens especiales de sistema, usuario y asistente, siempre que el ajuste no lo haya alterado.
- Razonamiento basico y matematicas elementales: capacidades propias de un modelo de 1,5B, suficientes para aritmetica sencilla y problemas de varios pasos cortos.
- Generacion de codigo: el modelo base maneja lenguajes habituales (Python, JavaScript, C++, etc.) a nivel de fragmentos cortos y autocompletado.
- Soporte de tool calling / function calling: el modelo base Qwen2.5-Instruct incluye plantillas para llamada a funciones; no hay confirmacion de que el ajuste lo preserve.
- Capacidades multilingues: el modelo base cubre mas de 29 idiomas, pero esta variante declara unicamente ingles en su model card.
- Capacidad especial: no se documenta ninguna (no hay modo "thinking" explicito, ni vision, ni audio).
- Riesgo de degradacion: al no existir evaluacion publicada, no puede confirmarse que las capacidades anteriores se conserven tras el ajuste; es habitual la perdida de habilidad en tareas no presentes en el dataset de afinado.

## Casos de uso

- Prototipado de asistentes conversacionales de dominio especifico: el modelo puede ajustarse de nuevo o usarse como punto de partida para un chatbot de un vertical concreto, dado su tamano reducido y su licencia permisiva.
- Despliegue en dispositivos con recursos limitados: con menos de 3 GB en bf16 y en torno a 1 GB en cuantizacion de 4 bits, cabe en portatiles y en placas con GPU integrada, lo que permite asistentes locales sin conexion.
- Generacion de codigo en entornos de desarrollo: autocompletado de funciones y explicacion de fragmentos directamente en el IDE, sin enviar codigo a servicios externos.
- Clasificacion y etiquetado de texto: tareas de extraccion de entidades, categorizacion de tickets o moderacion de comentarios, donde un modelo de 1,5B ofrece latencia muy baja por peticion.
- Componente de un pipeline RAG: como generador final sobre contextos recuperados de hasta 32.768 tokens en el modelo base, con coste de inferencia minimo comparado con modelos de 7B o superiores.
- Educacion y experimentacion: material didactico para aprender a hacer QLoRA con Unsloth y TRL, ya que reproduce un flujo completo desde un base de 4 bits hasta un repositorio publicable.
- Evaluacion comparativa de tecnicas de ajuste: sirve como referencia de linea base para medir el impacto de distintas configuraciones de LoRA sobre un mismo modelo base.
- Filtrado previo en cascada: primera etapa de un sistema de dos niveles que descarte consultas triviales antes de invocar un modelo mayor, reduciendo el coste global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ningun otro conjunto de evaluacion, ni en la model card ni en los metadatos del repositorio. Tampoco se ofrecen comparaciones con el modelo base, por lo que no puede cuantificarse el efecto real del ajuste.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 3,1 GB solo para los pesos, mas el cache KV; con contexto de 32.768 tokens el consumo adicional es de varios cientos de MB.
- VRAM en cuantizacion de 4 bits: en torno a 1 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizacion de 4 bits (GTX 1650, RTX 3050, T4). Para bf16 completo, 6 GB o mas (RTX 3060, RTX 4060, RTX 4090, A10). En A100 y H100 el modelo queda ampliamente infrautilizado salvo que se use con lotes muy grandes.
- Cabe en GPU de consumo: si, en modelos como RTX 3060, RTX 4060, RTX 4070 y superiores; tambien en equipos con GPU integrada si se convierte a GGUF y se ejecuta en CPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta presente en el repositorio), vLLM y SGLang para servicio con batching. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo que el autor no ha publicado.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Profilerai-x-qwen2.5-1.5b-qlora-v2 | 1,5B | no especificado (base: 32.768) | Apache 2.0 | HuggingFace, ajuste comunitario sin evaluar |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 (131.072 con YaRN) | Apache 2.0 | HuggingFace, oficial y evaluado |
| Llama 3.2 1B Instruct | 1,24B | 128.000 | Llama 3.2 Community License | HuggingFace, oficial |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache 2.0 | HuggingFace, oficial |
| Gemma 2 2B IT | 2,6B | 8.192 | Gemma Terms of Use | HuggingFace, oficial |

Frente a estas alternativas, la unica ventaja objetivable del modelo de Adith69 seria un ajuste a un dominio concreto, extremo que no puede verificarse porque no se documenta el dataset ni se publican metricas. Para uso general, el Qwen2.5-1.5B-Instruct original ofrece las mismas dimensiones con garantias de evaluacion y soporte oficial.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni pruebas de regresion frente al modelo base, ni ejemplos de salida en la model card.
- Dataset de entrenamiento desconocido: no puede descartarse sobreajuste, olvido catastrofico de capacidades del base ni la introduccion de sesgos procedentes de los datos de ajuste.
- Riesgo de alucinacion elevado: es una caracteristica intrinseca de los modelos de 1,5B, que tienden a inventar hechos cuando la pregunta exige conocimiento enciclopedico o razonamiento largo.
- Cobertura idiomatica declarada limitada al ingles: aunque el base maneja mas idiomas, el ajuste no garantiza un rendimiento correcto en castellano u otras lenguas, e incluso puede degradarlo.
- Trazabilidad insuficiente: no se indica la version exacta del base de Unsloth, el volumen de tokens de ajuste ni la configuracion de LoRA, lo que dificulta reproducir el resultado.
- Ambiguedad sobre el contenido del repositorio: con 0,1 GB de tamano, es probable que se traten de adaptadores LoRA en lugar de pesos fusionados, pero no esta declarado; esto afecta a como debe cargarse el modelo.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se atribuya correctamente. Conviene revisar asimismo los terminos del modelo base y del dataset de ajuste, no declarados.
- Idoneidad para produccion: con cero descargas y cero interacciones, el modelo no ha pasado por ninguna validacion de la comunidad; no se recomienda su uso en sistemas criticos sin una evaluacion propia exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Adith69/profilerai-x-qwen2.5-1.5b-qlora-v2
- Modelo base utilizado: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio de TRL: https://github.com/huggingface/trl
