# dharun2049/MAE

## Resumen

MAE (Magnitude-Adaptive Encoding) es un checkpoint experimental de generacion de texto en bajo numero de bits desarrollado por el usuario dharun2049. No introduce una arquitectura nueva: es un derivado cuantizado del modelo base Qwen/Qwen3-0.6B, un transformer denso decoder-only de aproximadamente 0,6 mil millones de parametros, y su aportacion consiste en una representacion de pesos de cinco estados (quinaria) denominada PQ5. El objetivo de investigacion es comprobar si un codebook de cinco valores puede recuperar parte de la calidad que se pierde con la cuantizacion ternaria, manteniendo una huella de almacenamiento muy compacta.

El esquema usa el conjunto simetrico {−α, −1, 0, +1, +α}, donde α se selecciona por tensor para minimizar el error de reconstruccion, y cada grupo de 128 pesos comparte una escala FP16. Los codigos quinarios se empaquetan en base 5 (tres digitos base-5 caben en siete bits, ya que 5^3 = 125 < 128) y ocho simbolos de siete bits se agrupan en siete bytes, lo que da una densidad nominal de 7/3 ≈ 2,3333 bits por peso, o aproximadamente 2,4583 bits por peso incluyendo las escalas. El checkpoint reporta una compresion de 6,51x (0,231 GB frente a 1,503 GB antes de la conversion).

La relevancia actual es acotada: se trata de un prototipo de investigacion, no de un modelo listo para produccion. El runtime de referencia decodifica los pesos PQ5 y los reconstruye a BF16/FP16 antes de ejecutar la inferencia estandar de Transformers, de modo que no se conserva la huella de ~2,46 bits por peso durante las multiplicaciones matriciales. El unico resultado de evaluacion publicado es MMLU 5-shot con 25,35 % ± 0,37 puntos porcentuales, muy por debajo de lo que cabe esperar de un modelo de 0,6B sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Qwen3), con pesos cuantizados mediante PQ5 |
| Parametros totales | ~0,6 mil millones (heredados del modelo base Qwen/Qwen3-0.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen3-0.6B documenta 32.768 tokens) |
| Tipos de cuantizacion | PQ5 de cinco estados (quinaria), escalas FP16 por grupo de 128 pesos; reconstruccion a BF16/FP16 en inferencia |
| Idiomas soportados | No disponible en la model card (heredados potencialmente del modelo base Qwen3) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors empaquetados PQ5 (model-pq5-*.safetensors, model.pq5.index.json, pq5_manifest.json) |

## Arquitectura y entrenamiento

MAE no entrena un modelo desde cero ni modifica la topologia de la red: parte de Qwen/Qwen3-0.6B, un transformer denso decoder-only, y aplica una cuantizacion post-entrenamiento de tipo PQ5 sobre sus pesos. Para cada tensor cuantizado se utiliza el codebook simetrico de cinco estados Q_α = {−α, −1, 0, +1, +α}; la reconstruccion de cada grupo de pesos es W_g ≈ s_g · Q_g, donde s_g es una escala FP16 compartida por 128 pesos. El cuantizador de referencia alterna entre la asignacion al codigo mas cercano y el ajuste de la escala de grupo por minimos cuadrados, y busca en una rejilla reducida de candidatos el valor de α que minimiza el error de reconstruccion de cada tensor.

La innovacion tecnica destacable es el empaquetado denso en radix 5: un simbolo quinario transporta log2(5) ≈ 2,3219 bits de informacion, y MAE empaqueta tres digitos base-5 en un simbolo de siete bits (P = d_0 + 5·d_1 + 25·d_2, con P en [0,124]) y, a su vez, ocho de esos simbolos en siete bytes. El resultado son 7/3 ≈ 2,3333 bits fisicos por peso para los codigos y ~2,4583 bits por peso incluyendo las escalas. La model card no documenta detalles sobre el dataset de entrenamiento, el numero de tokens ni etapas de RLHF o DPO, ya que el modelo base no se reentrena en este proceso; el trabajo se limita a la representacion de pesos.

## Capacidades

- Generacion de texto autorregresiva, heredada del modelo base Qwen3-0.6B.
- Respuesta conversacional (el tag de pipeline es text-generation y el de tarea incluye conversational).
- Conocimiento general evaluado mediante MMLU (5-shot), con un 25,35 % de acierto agregado.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte explicito de agentes ni de razonamiento multi-paso en la informacion disponible.
- No se documentan capacidades multilingues especificas del checkpoint (los idiomas figuran como no disponibles).
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido especificas de este checkpoint.
- Capacidad especial: representacion de pesos quinaria con empaquetado radix-5 y compresion 6,51x, orientada a investigacion sobre cuantizacion de bajo bit.

## Casos de uso

- Investigacion en cuantizacion de bajo bit: el checkpoint permite evaluar experimentalmente si un codebook de cinco estados logra un mejor compromiso entre tamano y calidad que la cuantizacion ternaria, sirviendo como banco de pruebas para comparar codebooks.
- Estudio de esquemas de empaquetado: el formato radix-5 (tres digitos base-5 en siete bits, ocho simbolos en siete bytes) es un caso practico para analizar la eficiencia de almacenamiento frente a representaciones INT3 convencionales.
- Evaluacion de pipelines de reconstruccion: el runtime de referencia (decode PQ5 → reconstruccion BF16/FP16 → inferencia Transformers) sirve para medir el coste de decodificacion antes de GEMM y planificar kernels fusionados.
- Desarrollo de kernels de bajo nivel: el repositorio esta pensado para justificar y validar un futuro kernel Triton/CUDA que consuma directamente la representacion empaquetada, un paso de sistemas separado segun el autor.
- Prototipado educativo: por su tamano (0,2 GB de repositorio) y su licencia Apache-2.0, es util para demostrar tecnicas de codificacion de pesos en entornos docentes con recursos limitados.
- Pruebas de inferencia ligera en hardware modesto: al reconstruirse a BF16/FP16, el modelo de 0,6B puede ejecutarse en GPU de consumo para experimentos de generacion de texto, aunque sin las ventajas de memoria del formato comprimido.
- Comparativas de degradacion por cuantizacion: el MMLU 5-shot de 25,35 % permite cuantificar la perdida de calidad frente al modelo base sin cuantizar cuando se disponga de esa referencia.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| MMLU | 5-shot | 25,35 % ± 0,37 pp |
| MMLU STEM | 5-shot | 25,02 % |
| MMLU Humanities | 5-shot | 25,10 % |
| MMLU Social Sciences | 5-shot | 24,05 % |
| MMLU Other | 5-shot | 27,33 % |

El resultado agregado procede de la metrica oficial `groups.mmlu.acc,none` del EleutherAI Language Model Evaluation Harness (artefacto `results_2026-09-19T12-28-11.526035.json`). No se han publicado otros benchmarks (HumanEval, GSM8K u otros) en la informacion disponible. El autor advierte que los resultados solo deben compararse con evaluaciones que usen prompting, numero de ejemplos y version de harness/tarea compatibles.

## Requisitos de hardware

- Almacenamiento en disco: 0,231 GB para los tensores empaquetados PQ5 (frente a 1,503 GB antes de la conversion).
- VRAM en inferencia con el runtime de referencia: los pesos se reconstruyen a BF16/FP16, lo que supone aproximadamente 1,2 GB solo para los parametros de 0,6B, mas activaciones y cache KV; en la practica se puede asumir del orden de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos ~2-4 GB de VRAM es suficiente para la ruta de referencia; una RTX 3060, RTX 4090 o superior no presentan ninguna limitacion por memoria para este modelo.
- Cabe en GPU de consumo: si, practicamente cualquier GPU de consumo reciente (por ejemplo, GTX 1060 6 GB, RTX 3060, RTX 4090) puede ejecutar la reconstruccion e inferencia de referencia.
- Opciones de despliegue: la libreria indicada es `transformers`; el formato empaquetado PQ5 es personalizado y no es un runtime nativo de `from_pretrained()`, por lo que vLLM, llama.cpp, Ollama o TGI no tienen soporte documentado para consumirlo directamente. El cargador de referencia seria `tools/pq5_infer.py` si esta presente.
- Latencia y throughput: no disponible. La ruta de referencia anade una etapa de decodificacion y reconstruccion de pesos antes de la inferencia, cuyo coste no se cuantifica en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Representacion de pesos | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAE (dharun2049) | ~0,6B | PQ5 quinaria (≈2,46 bits/peso) | 25,35 % (5-shot) | Apache-2.0 | Checkpoint experimental, formato personalizado |
| Qwen/Qwen3-0.6B (modelo base) | ~0,6B | BF16/FP16 | No disponible en la informacion proporcionada | Apache-2.0 | Disponible en HuggingFace |
| Cuantizacion ternaria (familia BitNet b1.58) | Variable | Tres estados {−s, 0, +s} | No disponible en la informacion proporcionada | Variable segun implementacion | Concepto publicado; checkpoints dispares |
| Cuantizacion INT3 convencional | Variable | Ocho estados (3 bits) | No disponible en la informacion proporcionada | Variable | Formatos habituales (GGUF, GPTQ, etc.) |

La comparativa se limita a la categoria de cuantizacion de muy bajo bit sobre modelos pequenos; no se dispone de cifras de MMLU del modelo base ni de las alternativas en la informacion proporcionada, por lo que no es posible cuantificar la degradacion real introducida por PQ5.

## Limitaciones y advertencias

- Es un prototipo de investigacion, no un modelo listo para produccion.
- El formato de checkpoint es personalizado y no es un runtime nativo de `transformers.from_pretrained()`; requiere el cargador de referencia.
- No incluye multiplicacion matricial nativa sobre PQ5 empaquetado: el runtime reconstruye a BF16/FP16, por lo que no se conserva la huella de ~2,46 bits por peso durante GEMM.
- La cuantizacion puede degradar la precision de forma distinta segun la tarea y la capa; no hay analisis por capa en la informacion disponible.
- El codebook y la busqueda de α son implementaciones de referencia simples, no un objetivo de cuantizacion globalmente optimizado; el autor lo reconoce explicitamente.
- El MMLU de 25,35 % es bajo y sugiere una capacidad de conocimiento general limitada; debe interpretarse solo para este checkpoint y esta configuracion de evaluacion.
- Riesgo de alucinacion no documentado, pero inherente a un modelo de 0,6B cuantizado; no hay datos especificos en la model card.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto o idioma: no disponibles en la model card; dependen del modelo base Qwen3-0.6B.
- Licencia Apache-2.0, que permite uso comercial, pero al ser un derivado de Qwen3-0.6B conviene verificar que se respetan las condiciones del modelo base.
- El repositorio registra 0 descargas y 0 likes, y no cuenta con validacion de la comunidad; la fiabilidad de los resultados publicados no esta contrastada de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dharun2049/MAE
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- EleutherAI Language Model Evaluation Harness: https://github.com/EleutherAI/lm-evaluation-harness
- No se han encontrado papers, blogs, repositorios o demos adicionales asociados a este modelo en la busqueda web disponible.
