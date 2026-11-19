# ikimyaii/GatedDeltaNet-1.3B-unstructured-SparseGPT-50pct

## Resumen

GatedDeltaNet-1.3B-unstructured-SparseGPT-50pct es una variante podada del modelo m-a-p/1.3B-100B-GatedDeltaNet-pure, un transformer de tipo Gated DeltaNet entrenado por el equipo m-a-p (Multimodal Art Projection) sobre 100.000 millones de tokens. El modelo que nos ocupa aplica una poda no estructurada del 50 % mediante SparseGPT en su version oficial, en un regimen one-shot sin reentrenamiento posterior, y lo publica el usuario ikimyaii como linea base para una familia de modelos propios denominada EHWS.

El interes del artefacto es metodologico mas que de producto: demuestra que es posible eliminar la mitad de los pesos de las capas lineales de un modelo Gated DeltaNet de 1.466 millones de parametros con una perdida de perplejidad contenida (de 10,31 a 11,83 en WikiText-2 y de 13,76 a 15,14 en C4) y una caida media de exactitud zero-shot de 51,23 a 49,30 puntos. La poda se ejecuto en 4,1 minutos sobre una unica A100 de 40 GB, lo que la convierte en una referencia reproducible y barata para estudiar compresion en arquitecturas de atencion lineal.

La relevancia actual reside en que la familia DeltaNet y sus variantes con compuertas (Gated DeltaNet) son candidatas serias a sustituir la atencion cuadratica clasica en contextos largos, y apenas existen estudios publicos sobre como responden al pruning estructurado y no estructurado. Este checkpoint ofrece un punto de comparacion limpio: misma receta de calibracion, mismo protocolo de evaluacion y pesos en safetensors listos para cargar con `flash-linear-attention`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (transformer con atencion lineal de tipo delta, capas con compuerta) |
| Parametros totales | 1.466.343.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base se entreno con secuencias de 2.048 tokens segun la calibracion) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 2,9 GB) |
| Poda | No estructurada, 50 % de sparsity, one-shot con SparseGPT oficial (IST-DASLab/sparsegpt@147d215, `fasterprune`, blocksize 128, damping 0,01) |
| Capas podadas | 240 capas lineales; embeddings y `lm_head` permanecen densos |
| Precisión de poda | Pesos podados en bfloat16 |
| Modelo base | m-a-p/1.3B-100B-GatedDeltaNet-pure |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gated DeltaNet, una variante de atencion lineal con estado recurrente y compuertas que sustituye la atencion softmax por una actualizacion delta con decaimiento controlado. El modelo base fue entrenado por m-a-p sobre 100.000 millones de tokens (de ahi el sufijo 100B del nombre), aunque la model card no detalla la composicion del dataset, el uso de RLHF/DPO ni la longitud de contexto final. El checkpoint podado conserva exactamente la topologia del original: no se eliminan cabezas ni neuronas, solo se ponen a cero pesos individuales.

La intervencion consiste en una poda no estructurada one-shot con el codigo oficial de SparseGPT. La calibracion usa el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0. Los bloques se podan en orden, y cada bloque se calibra sobre las salidas de los bloques ya podados anteriores, replicando el comportamiento de los drivers oficiales. El autor senala que el recorrido de capas es codigo nuevo (los drivers oficiales solo cubren OPT y LLaMA), mientras que la matematica de poda es la del repositorio original. La mascara resultante aplica un unico umbral por bloque de 128 columnas, por lo que las filas acaban con distinto numero de no ceros: en promedio, la fila mas densa de cada capa tiene 1,33 veces los no ceros de la fila media, y la peor capa llega a 1,83 veces. No hay destilacion, recuperacion ni fine-tuning posterior; el checkpoint es puramente el resultado del pruning.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base; no se documentan capacidades multilingues.
- Razonamiento de sentido comun y respuesta a preguntas de opcion multiple, evaluadas en arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte y winogrande.
- Comprension lectora basica y clasificacion de pares de frases (tareas tipo NLI y coreferencia en winogrande).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta modo thinking, vision, audio ni ninguna modalidad adicional.
- No se documenta una ventana de contexto efectiva mas alla de las secuencias de 2.048 tokens usadas en calibracion.

## Casos de uso

- Investigacion en compresion de modelos de atencion lineal: sirve como linea base reproducible para comparar tecnicas de pruning (SparseGPT, Wanda, SparseGPT con recuperacion) sobre arquitecturas Gated DeltaNet, ya que el autor lo publica explicitamente como baseline de su familia EHWS.
- Estudio de la relacion entre sparsity y perplejidad en capas lineales: con 240 capas podadas y una mascara por bloques de 128 columnas, permite analizar como se distribuye el error entre capas y que capas concentran la perdida de calidad.
- Despliegue en entornos con restricciones de memoria: al reducir a la mitad los pesos de las capas lineales, el checkpoint ocupa menos y puede interesar en escenarios donde el ancho de banda de memoria es el cuello de botella, siempre que el runtime soporte sparsity no estructurada.
- Evaluacion comparativa de kernels: util para medir si los kernels de `flash-linear-attention` y de inferencia dispersa aprovechan realmente la mascara o si el rendimiento efectivo se queda en el del modelo denso.
- Docencia y divulgacion sobre pruning: el proceso completo (calibracion con C4, poda por bloques, evaluacion con ELSA y lm-evaluation-harness) esta documentado con suficiente detalle para replicarlo en un laboratorio con una sola GPU.
- Pruebas de robustez de pipelines de evaluacion: al ser un modelo degradado de forma controlada, sirve para validar que los arneses de evaluacion detectan caidas de calidad esperadas (por ejemplo, 2,5 puntos de media en zero-shot).

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (WikiText-2 y C4, fp16):

| Metrica | Denso | Este modelo (50 % sparsity) |
|---|---|---|
| WikiText-2 | 10,31 | 11,83 |
| C4 | 13,76 | 15,14 |

Exactitud zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,3387 |
| arc_easy | 0,7222 | 0,7003 |
| boolq | 0,6159 | 0,6275 |
| hellaswag | 0,4629 | 0,4266 |
| openbookqa | 0,2920 | 0,2740 |
| rte | 0,4982 | 0,4874 |
| winogrande | 0,6188 | 0,5967 |
| Media | 0,5123 | 0,4930 |

Sparsity medida sobre los pesos publicados: 0,5000 en las capas podadas. No se han publicado resultados de benchmarks frente a otros modelos de la misma categoria en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,9 GB solo para pesos, mas activaciones y cache de estado recurrente; en la practica conviene reservar entre 4 y 6 GB para secuencias cortas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,5 GB de pesos; no hay checkpoints cuantizados publicados, por lo que habria que generarlos.
- GPU recomendadas: A100 40 GB (usada para la poda, 4,1 minutos), H100, L40S, A10G; tambien cabe en RTX 4090, RTX 4080, RTX 3090 y, con cuantizacion, en GPUs de 8 GB como RTX 3070.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 6-8 GB de VRAM para bfloat16 y secuencias moderadas.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`) como requisito imprescindible; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La sparsity no estructurada no garantiza aceleracion en hardware estandar (tipo tensor cores densos), por lo que el rendimiento efectivo podria ser similar al del modelo denso salvo que el runtime tenga kernels especificos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Sparsity | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GatedDeltaNet-1.3B-unstructured-SparseGPT-50pct (este) | 1,466 B | no disponible | 50 % no estructurada | no disponible | Hugging Face |
| m-a-p/1.3B-100B-GatedDeltaNet-pure | 1,3 B (nominal) | no disponible | 0 % | no disponible | Hugging Face |
| Modelos densos de ~1,3 B de la familia LLaMA | ~1,1-1,3 B | 2.048-4.096 tokens tipicamente | 0 % | variable | Hugging Face |

La comparacion cuantitativa directa solo es posible contra el modelo base, del que se conocen las metricas densas incluidas en las tablas anteriores. No se dispone de datos de benchmarks frente a otros modelos Gated DeltaNet podados ni frente a modelos densos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- La poda one-shot sin reentrenamiento degrada la calidad de forma medible: +1,52 puntos de perplejidad en WikiText-2, +1,38 en C4 y una caida de 2,5 puntos de media en zero-shot.
- La mascara no esta balanceada por filas: la fila mas densa de una capa tiene de media 1,33 veces los no ceros de la fila media, y la peor capa llega a 1,83 veces, lo que puede generar picos de error en capas concretas.
- La sparsity no estructurada no se traduce necesariamente en aceleracion en GPUs convencionales; sin kernels especificos el modelo puede ser tan lento como el denso pero con peor calidad.
- Requiere `flash-linear-attention` para cargarse; sin esa dependencia el modelo no es utilizable con transformers estandar.
- No se documentan idiomas soportados, licencia ni condiciones de uso comercial: tratar como no apto para produccion hasta verificar la licencia del modelo base.
- Riesgo de alucinacion y sesgos: no evaluados en la model card; al ser un modelo de 1,3 B entrenado sobre 100 B de tokens, es esperable un conocimiento factual limitado y sesgos propios del corpus, no cuantificados.
- Las embeddings y el `lm_head` permanecen densos, por lo que el ahorro de memoria es inferior al 50 % del total.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en noviembre de 2026; no hay validacion externa de los resultados reportados.
- No se especifica la longitud de contexto efectiva ni el comportamiento mas alla de 2.048 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-unstructured-SparseGPT-50pct
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Codigo oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Repositorio de flash-linear-attention: no disponible en la informacion proporcionada
- Paper de Gated DeltaNet: no disponible en la informacion proporcionada
- Paper de SparseGPT: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada
