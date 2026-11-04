# mradermacher/Uncensored_DeepSeek_R1_Distill_Qwen_1.5B_safetensors_finetune_1-GGUF

## Resumen

Uncensored_DeepSeek_R1_Distill_Qwen_1.5B_safetensors_finetune_1-GGUF es una cuantizacion estatica en formato GGUF del modelo ICEPVP8977/Uncensored_DeepSeek_R1_Distill_Qwen_1.5B_safetensors_finetune_1, un fine-tuning sin censura del conocido distill de DeepSeek-R1 sobre Qwen2.5-1.5B. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de cuants GGUF en HuggingFace, mientras que el modelo base original proviene del usuario ICEPVP8977. El resultado es un conjunto de ficheros GGUF listos para usarse con llama.cpp y sus derivados (Ollama, LM Studio, etc.) en hardware modesto.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5 con aproximadamente 1.777 millones de parametros (1,5B nominales) y el proceso de destilacion de razonamiento de DeepSeek-R1, que introduce cadenas de pensamiento largas antes de la respuesta final. El fine-tuning "uncensored" elimina total o parcialmente los filtros de seguridad del modelo original, lo que lo hace atractivo para experimentacion con contenido sin restricciones, pero tambien conlleva riesgos evidentes en produccion.

La relevancia de esta ficha radica en que combina tres elementos de interes: un modelo pequeno (ejecutable en CPU y GPUs consumer de gama baja), una capacidad de razonamiento destilada de un modelo grande (R1) y una licencia y procedencia poco documentadas. Es un ejemplo tipico de la larga cola de fine-tunes comunitarios que aparecen en HuggingFace y que requieren evaluacion cuidadosa antes de cualquier uso serio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B) con destilacion de razonamiento de DeepSeek-R1 |
| Parametros totales | 1.777.088.000 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B soporta hasta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (declarado en la model card; el base Qwen2.5 es multilingue, pero el fine-tuning no documenta otros idiomas) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B: un transformer decoder-only con atencion causal, RoPE, normalizacion RMSNorm y capas SwiGLU, con aproximadamente 1.777 millones de parametros. Sobre esa base se aplico el proceso de destilacion de DeepSeek-R1, que consiste en entrenar al modelo pequeno con datos generados por el R1 grande, incluyendo trazas de razonamiento (cadenas de pensamiento) antes de la respuesta final. Esto le permite emular el estilo de "thinking mode" de R1, aunque con la capacidad limitada de un modelo de 1,5B.

El fine-tuning posterior (etiquetado como "finetune_1" y "Uncensored") fue realizado por el usuario ICEPVP8977 y no esta documentado en la model card disponible: no se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o simplemente SFT. La cuantizacion de mradermacher es estatica (sin imatrix), segun indica el propio autor, que senala que los cuants ponderados/imatrix "no parecen estar disponibles" en el momento de publicacion. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de formato chat (tag `conversational`).
- Razonamiento paso a paso estilo DeepSeek-R1: el modelo tiende a producir cadenas de pensamiento antes de la respuesta final, aunque con fiabilidad limitada por su tamano.
- Generacion de codigo basica y resolucion de problemas matematicos sencillos, heredados del base Qwen2.5-1.5B.
- Capacidad multilingue limitada: aunque Qwen2.5 soporta varios idiomas, el fine-tuning solo declara ingles y no hay evidencia de preservacion de otras lenguas.
- Sin soporte documentado de tool calling, function calling ni agentes multi-paso.
- Sin capacidades de vision, audio ni multimodalidad.
- Comportamiento "sin censura": el fine-tuning elimina filtros de seguridad, lo que permite generar contenido que el modelo original rechazaria.

## Casos de uso

- Experimentacion con razonamiento destilado en hardware modesto: el modelo cabe en 1-2 GB de RAM/VRAM en cuantizaciones Q4, lo que permite probar el estilo de "thinking" de R1 en un portatil o una Raspberry Pi sin GPU dedicada.
- Investigacion sobre alineacion y censura: util para estudiar como el fine-tuning sin censura afecta a la distribucion de respuestas y a la calidad del razonamiento, comparando con el base Qwen2.5-1.5B.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones o contenido que los modelos alineados suelen rechazar, ejecutandose localmente con llama.cpp u Ollama.
- Prototipado rapido de chatbots conversacionales en ingles: gracias a su formato chat y a su baja huella de memoria, sirve para validar pipelines de inferencia antes de escalar a modelos mayores.
- Educacion y demos de IA local: ideal para talleres donde se ensena a desplegar modelos GGUF con llama.cpp, ya que el fichero Q4_K_M pesa solo 1,2 GB.
- Analisis de riesgos de modelos comunitarios: caso de estudio de un fine-tune sin documentacion de licencia ni dataset, util para discutir buenas practicas de publicacion en HuggingFace.
- Generacion de codigo en entornos offline: para tareas sencillas de autocompletado o scripts, aunque sin garantias de calidad en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~0,9 GB
  - Q3_K_M: ~1,0 GB
  - Q4_K_M: ~1,2 GB (recomendado por el autor: "fast, recommended")
  - Q5_K_M: ~1,4 GB
  - Q6_K: ~1,6 GB
  - Q8_0: ~2,0 GB
  - f16: ~3,7 GB
- GPU recomendadas: cualquier GPU consumer con >=4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) para cuantizaciones Q4-Q8; tambien funciona en CPU pura.
- Cabe en GPU consumer: si, en practicamente todas las GPUs dedicadas de los ultimos 10 anos, e incluso en iGPUs modernas con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con la Inference Endpoints de HuggingFace.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano (1,5B) y las cuantizaciones Q4, se espera un throughput alto en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Uncensored_DeepSeek_R1_Distill_Qwen_1.5B-GGUF) | 1,78B | no disponible | no disponible | GGUF | Fine-tuning sin censura, sin benchmarks |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Base original, alineado, con benchmarks publicados |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78B | 32.768 tokens | MIT (modelo R1) | safetensors, GGUF | Destilado oficial de R1, con benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Alternativa de Meta, contexto mucho mayor |

La comparativa se basa en conocimiento general de los modelos citados; no se dispone de datos de benchmarks de este fine-tune concreto para comparar rendimiento. La principal diferencia frente a los originales es la ausencia de alineacion de seguridad y la falta de documentacion sobre licencia y datos de entrenamiento.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. El modelo base Qwen2.5 es Apache 2.0 y R1 es MIT, pero el fine-tuning de ICEPVP8977 no declara licencia, lo que genera incertidumbre legal.
- Modelo "uncensored": eliminacion de filtros de seguridad, con riesgo de generar contenido toxico, ilegal o danino. No apto para aplicaciones orientadas al publico sin moderacion adicional.
- Riesgo elevado de alucinacion: modelo de 1,5B con razonamiento destilado; las cadenas de pensamiento pueden ser plausibles pero incorrectas, especialmente en matematicas y codigo.
- Capacidad multilingue limitada: solo se declara ingles; el fine-tuning puede haber degradado el soporte de otros idiomas del base Qwen2.5.
- Sin benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas estandar.
- Procedencia y dataset desconocidos: no se documenta el proceso de fine-tuning, lo que impide evaluar sesgos introducidos.
- Cuantizaciones estaticas unicamente: el autor no ofrece cuants imatrix/ponderados, lo que puede reducir la calidad frente a alternativas con imatrix en el mismo tamano.
- Contexto no confirmado: aunque el base soporta 32K tokens, no se garantiza que el fine-tuning lo preserve.
- Fecha de actualizacion futura (2026-11-04) en los metadatos: posible anomalia o re-subida, conviene verificar la integridad de los ficheros antes de usarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/Uncensored_DeepSeek_R1_Distill_Qwen_1.5B_safetensors_finetune_1-GGUF
- Modelo base (fine-tune original): https://huggingface.co/ICEPVP8977/Uncensored_DeepSeek_R1_Distill_Qwen_1.5B_safetensors_finetune_1
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#Uncensored_DeepSeek_R1_Distill_Qwen_1.5B_safetensors_finetune_1-GGUF
- Repositorio de peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- DeepSeek-R1 (paper/modelo original del que se destila): https://huggingface.co/deepseek-ai/DeepSeek-R1
- Qwen2.5-1.5B (arquitectura base): https://huggingface.co/Qwen/Qwen2.5-1.5B
