# ai-and-society/Llama-3.3-70B-Instruct-wanda-unstruct

## Resumen

`ai-and-society/Llama-3.3-70B-Instruct-wanda-unstruct` es una version podada del modelo `meta-llama/Llama-3.3-70B-Instruct` publicada por la organizacion ai-and-society. La poda se ha realizado con Wanda (pruning no estructurado, es decir, puesta a cero de pesos individuales sin eliminar neuronas ni cabezas de atencion completas), tal y como indican las etiquetas del repositorio: `wanda`, `prune` y `unstructured`. No se documenta en la model card el ratio de sparsity aplicado, el calibrado utilizado ni el procedimiento exacto de poda.

El modelo conserva la arquitectura, la forma de los tensores y el recuento de parametros del modelo base: el metadata de safetensors reporta 70.553.706.496 parametros, practicamente identico a Llama 3.3 70B Instruct. Esto es coherente con una poda no estructurada, en la que los pesos podados se mantienen en el tensor con valor cero en lugar de eliminarse fisicamente; el repositorio ocupa 141,1 GB, lo que equivale a ~2 bytes por parametro (fp16 o bf16).

Su relevancia practica es la de un artefacto de investigacion: permite estudiar el efecto de la sparsity no estructurada sobre un modelo instructivo de 70B, pero no ofrece, con la informacion disponible, ventajas de memoria, latencia o throughput respecto al modelo original, ya que no se documenta soporte de kernels dispersos ni aceleracion asociada. La licencia declarada es Apache-2.0 y el modelo es de tipo conversacional, orientado a generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.3) con poda no estructurada Wanda aplicada sobre los pesos |
| Parametros totales | 70.553.706.496 (segun metadata de safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no reespecificada en la ficha del autor) |
| Tipos de cuantizacion | No disponible. El repo contiene pesos en safetensors a ~2 bytes por parametro (fp16/bf16); no se documentan versiones GGUF, AWQ, GPTQ ni el efecto de la poda sobre ellas |
| Idiomas soportados | No disponible en la ficha del autor. El modelo base declaraba soporte oficial para 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | meta-llama/Llama-3.3-70B-Instruct |
| Tamano del repositorio | 141,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo no introduce cambios arquitectonicos respecto a Llama 3.3 70B Instruct: se trata de un transformer decoder-only denso de 70B parametros con normalizacion RMSNorm pre-normalizacion, activaciones SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA). El modelo base fue entrenado por Meta con un corpus declarado de mas de 15 billones de tokens, con ajuste supervisado y optimizacion por preferencias humanas (RLHF/DPO) en la fase instruct. El corte de conocimiento declarado por Meta para esta generacion es diciembre de 2023.

La unica intervencion documentada por ai-and-society es la poda mediante Wanda, un metodo de poda por magnitud que pondera cada peso por la norma de la activacion de entrada correspondiente, calculada a partir de un pequeno conjunto de calibracion, y que se aplica capa a capa sin reentrenamiento posterior (segun la formulacion publicada del metodo). La model card no especifica el porcentaje de pesos puestos a cero, el dataset de calibracion, la semilla ni si hubo un paso posterior de recuperacion (fine-tuning) tras la poda, por lo que no es posible reproducir el proceso ni conocer su agresividad real.

Tampoco se documenta ninguna tecnica adicional de eficiencia: no hay decodificacion especulativa, atencion lineal ni conversion a formatos con kernels dispersos. Al no haber reentrenamiento documentado ni aceleracion en inferencia, el artefacto debe tratarse como una variante experimental del modelo base.

## Capacidades

Las capacidades heredadas se corresponden con las del modelo base, Llama 3.3 70B Instruct, aunque no hay evaluacion publicada que confirme el grado de degradacion introducido por la poda:

- Generacion de texto conversacional multi-turno con plantilla de chat instructiva.
- Razonamiento de proposito general, matematicas de nivel escolar y universitario y comprension lectora.
- Generacion y explicacion de codigo en lenguajes habituales (Python, Java, C++, JavaScript, entre otros).
- Tool calling / function calling en el formato de plantilla del modelo base, utilizado por frameworks de agentes.
- Razonamiento multi-paso y uso en bucles de agente, condicionado a la integracion del framework externo.
- Capacidades multilingues limitadas al conjunto declarado por Meta para el modelo base (8 idiomas); no hay evaluacion propia del modelo podado.
- Sin capacidades de vision ni de audio: es un modelo exclusivamente de texto.
- Sin modo de razonamiento explicito (no hay "thinking mode" separado).

## Casos de uso

- Investigacion sobre poda de LLM: comparar las respuestas del modelo podado con las de `meta-llama/Llama-3.3-70B-Instruct` sobre el mismo prompt set para medir el impacto de la sparsity no estructurada en tareas de razonamiento y generacion.
- Evaluacion de robustez a la compresion: usar el modelo como sujeto de pruebas en estudios sobre perdida de conocimiento factual y degradacion de instrucciones despues de podar, con el modelo base como control.
- Analisis de calibracion y confianza: medir cambios en la distribucion de logits y en la entropia de salida antes y despues de la poda, dado que los pesos a cero alteran las activaciones de forma no trivial.
- Generacion de texto offline en entornos de investigacion con GPU de gran memoria: al conservar el recuento de parametros, requiere el mismo hardware que el modelo denso (ver seccion de hardware).
- Fine-tuning de referencia: servir como inicializacion en experimentos que estudian si el ajuste posterior recupera la calidad perdida por la poda.
- Sintesis y resumen de documentacion tecnica en un idioma, asumiendo validacion humana, siempre que las pruebas internas confirmen que la calidad se mantiene respecto al modelo base en ese dominio concreto.
- No se recomienda su uso en produccion con clientes sin una evaluacion previa: la ausencia de benchmarks y de documentacion sobre el ratio de poda impide garantizar el comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de evaluacion (MMLU, GSM8K, HumanEval, IFEval u otros), ni el ratio de sparsity, ni comparaciones con el modelo base o con otras variantes podadas. Los resultados de busqueda web proporcionados no contienen datos tecnicos sobre este modelo.

Como referencia externa, el modelo base Llama 3.3 70B Instruct si cuenta con resultados publicos en la documentacion de Meta, pero esos numeros no son trasladables al modelo podado y no se reproducen aqui al no haberse proporcionado en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 141 GB de pesos mas overhead de cache KV (el repositorio ocupa 141,1 GB). No cabe en una sola GPU de 80 GB.
- VRAM estimada en cuantizacion de 4 bits (si se generase una version GPTQ/AWQ/GGUF, no publicada): aproximadamente 40-45 GB de pesos, mas cache KV.
- Cache KV: con 128.000 tokens de contexto, la atencion con GQA reduce el coste, pero un contexto completo sigue requiriendo decenas de GB adicionales segun el lote y la precision.
- GPU recomendadas: 2x H100 80 GB, 2x A100 80 GB o 4x A100 40 GB para fp16 con tensor parallelism. Para 4 bits, una sola H100 80 GB o A100 80 GB resulta suficiente en la mayoria de configuraciones.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en fp16. Solo seria viable en 4 bits con descarga parcial a CPU/RAM, con latencia muy alta.
- Opciones de despliegue: `transformers` (libreria declarada) y `text-generation-inference` (etiqueta presente en el repositorio). vLLM es compatible con el formato safetensors de Llama, pero no se documenta soporte ni aceleracion de la sparsity. llama.cpp/Ollama requeririan convertir los pesos a GGUF, conversion no publicada por el autor, y no aprovecharian la poda.
- Latencia y throughput: no disponibles. La poda no estructurada no reduce el numero de operaciones en hardware denso, por lo que, en ausencia de kernels dispersos, el rendimiento esperado es equivalente al de un Llama 3.3 70B denso, no superior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ai-and-society/Llama-3.3-70B-Instruct-wanda-unstruct | 70,55B (poda no estructurada, ratio no documentado) | 128k (heredado) | Apache-2.0 | HuggingFace, 0 descargas, 0 likes | Sin benchmarks; sin aceleracion documentada |
| meta-llama/Llama-3.3-70B-Instruct | 70B densos | 128k | Llama 3.3 Community License | HuggingFace, ampliamente adoptado | Modelo de referencia; benchmarks publicos de Meta |
| meta-llama/Llama-3.1-70B-Instruct | 70B densos | 128k | Llama 3.1 Community License | HuggingFace | Generacion anterior; contexto y calidad inferiores al 3.3 segun Meta |
| Qwen2.5-72B-Instruct | 72B densos | 128k | Qwen License (con clausulas de uso) | HuggingFace | Alternativa de tamano comparable, con benchmarks publicos propios |

Nota: la comparativa se limita a parametros, contexto, licencia y disponibilidad. No se incluyen columnas de rendimiento porque no hay datos de benchmarks del modelo podado en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni estudio de degradacion respecto al modelo base, ni indicacion del porcentaje de pesos podados. Es imposible estimar la perdida de calidad sin medirla.
- La poda Wanda sin reentrenamiento posterior suele producir degradacion acumulativa en tareas de razonamiento y en la adherencia a instrucciones; el grado concreto en este artefacto es desconocido.
- Sesgos: se heredan los del modelo base Llama 3.3, entrenado con datos web y con ajuste por preferencias humanas; no hay analisis de sesgo propio de esta variante.
- Riesgo de alucinacion: previsiblemente igual o superior al del modelo base, ya que la poda no estructurada tiende a eliminar informacion factual de baja magnitud. No hay medicion disponible.
- Idiomas: no declarados en la ficha. Si la poda se calibro solo con texto en ingles, el rendimiento en otros idiomas puede degradarse de forma desigual.
- Licencia: el repositorio declara Apache-2.0. Conviene verificar la compatibilidad con la licencia del modelo base (Llama 3.3 Community License) antes de cualquier uso comercial, dado que la redistribucion de derivados esta sujeta a las condiciones de Meta.
- Sin soporte de sparsity: la mayoria de runtimes (vLLM, TGI, llama.cpp) ejecutan los tensores de forma densa, por lo que no hay ahorro de memoria ni de computo; el consumo es el de un modelo de 70B completo.
- Sin mantenimiento ni adopcion: 0 descargas y 0 likes en el momento de la consulta. No hay issues, ni autor de contacto identificado, ni fecha de revision posterior a septiembre de 2026.
- Repositorio de 141,1 GB: la descarga y el almacenamiento tienen un coste considerable, y la conversion a cuantizaciones de 4 bits no esta publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ai-and-society/Llama-3.3-70B-Instruct-wanda-unstruct
- Modelo base en HuggingFace: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Metodo de poda referenciado por la etiqueta `wanda` (Sun et al., "A Simple and Effective Pruning Approach for Large Language Models"): https://arxiv.org/abs/2306.11695
- Documentacion de Transformers (libreria declarada): https://huggingface.co/docs/transformers
- Text Generation Inference (etiqueta `text-generation-inference`): https://github.com/huggingface/text-generation-inference
