# graydini/Spark-X2.6-1.7B-noloop-headrow-GGUF

## Resumen

Spark-X2.6-1.7B-noloop-headrow-GGUF es una cuantizacion GGUF Q4_K_M del modelo Spark-X2.6-1.7B (desarrollado por XHToken) a la que el usuario graydini ha aplicado una edicion quirurgica de pesos sin reentrenamiento. El objetivo es corregir un fallo especifico de razonamiento: el modelo alcanza la conclusion correcta y despues entra en un bucle semantico de redecision ("...pero espera, deberia..."), reformulando la misma respuesta en lugar de actuar o detenerse. La edicion modifica una unica fila de la cabeza de salida (2.048 pesos), correspondiente al token de cierre de razonamiento `</think>`.

La arquitectura base es `spark2_5`, un transformer de 28 capas con atencion hibrida, dimension oculta 2.048 y vocabulario de 131.000 tokens. El modelo tiene 1.976.092.672 parametros (aproximadamente 1,7B) y una cabeza de salida no atada (`output.weight` en Q8_0 separada de `token_embd.weight` en BF16), lo que permite editar solo la cabeza sin efectos colaterales en los embeddings de entrada.

La relevancia de esta ficha es doble: por un lado, documenta un modelo pequeno (1,7B) con licencia Apache-2.0 y capacidades de razonamiento; por otro, ilustra una tecnica de edicion de pesos (weight editing) dirigida a corregir patologias de decodificacion en modelos de razonamiento, un enfoque poco habitual frente al ajuste fino o la intervencion en el muestreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | spark2_5 (transformer de 28 capas, atencion hibrida, hidden 2048) |
| Parametros totales | 1.976.092.672 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible (la model card menciona vocabulario de 131k, no contexto) |
| Tipos de cuantizacion | Q4_K_M (repo GGUF); `output.weight` en Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura base es `spark2_5`: 28 capas, dimension oculta 2.048, atencion hibrida y vocabulario de 131.000 tokens. A diferencia de la variante de 4B, la version de 1,7B tiene la cabeza de salida no atada, es decir, `output.weight` (Q8_0) es distinta de `token_embd.weight` (BF16). Esta separacion es clave para la edicion aplicada: al tocar solo la cabeza de salida, no hay efecto secundario sobre los embeddings de entrada.

No se dispone de informacion sobre el dataset de entrenamiento original ni sobre si hubo RLHF o DPO. Lo que si documenta la model card es el proceso de edicion sobre la cuantizacion Q4_K_M: se identifico el momento de decision aislando el estado residual justo despues de alcanzar la conclusion correcta pero antes de que empiece la espiral; se leyo la distribucion de logits en ese token, donde `</think>` estaba muy abajo en el ranking frente al vocabulario de reinicio; y se calculo el delta de norma minima que eleva `log P(</think>)` en cuatro estados de conclusion simultaneamente, con objetivos por estado `Δ = [14, 14, 14, 18]` nats. La solucion es `δ = Hᵀ (H Hᵀ)⁻¹ Δ` con `‖δ‖ ≈ 0.223`, aplicada a la fila 4 de `output.weight`. La fila se desquantiza, se edita y se recodifica en su tipo Q8_0 original con el cuantizador de ggml, y se reinserta en el GGUF dejando el resto de bytes identicos.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento con canal de pensamiento explicito (`</think>` como token de cierre).
- Razonamiento matematico multi-paso (mejorado por la edicion; ver benchmarks).
- Seleccion de herramientas (tool selection) en entornos de agente, con cierre del canal de pensamiento y emision de la accion.
- Capacidad de cerrar el razonamiento y actuar en lugar de entrar en bucles de redecision (objetivo principal de la edicion).
- No se documentan capacidades de vision, audio ni function calling estructurado mas alla de la seleccion de herramientas descrita.
- Etiquetado por el autor como `uncensored`.

## Casos de uso

- Agentes de seleccion de herramientas: el modelo puede recibir un catalogo de herramientas y un objetivo, razonar cual usar y emitir la accion sin quedarse en un bucle de redecision. La validacion de la model card muestra 0/24 bucles en los prompts de seleccion de herramienta probados.
- Asistente conversacional ligero en ingles o chino: con 1,7B de parametros y cuantizacion Q4_K_M, puede desplegarse en entornos con recursos limitados para conversaciones multi-turno.
- Resolucion de problemas matematicos de nivel escolar: la edicion eleva GSM8K de 0,200 a 0,433 en la evaluacion del autor, lo que lo hace util para tutoria o generacion de ejercicios resueltos.
- Prototipado de pipelines de razonamiento en local: sirve para experimentar con modelos que exponen un canal de pensamiento sin depender de APIs externas.
- Investigacion sobre edicion de pesos: el checkpoint y el metodo documentado permiten reproducir y estudiar intervenciones quirurgicas en cabezas de salida para corregir patologias de decodificacion.
- Generacion de texto en aplicaciones embebidas o de borde: el tamano del repo (1,8 GB) y la cuantizacion Q4_K_M permiten ejecucion en hardware modesto.
- Evaluacion comparativa de tecnicas anti-bucle: util como referencia para comparar edicion de pesos frente a ajuste de parametros de muestreo o fine-tuning.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Evaluacion 0-shot; opcion multiple por log-likelihood medio por token y GSM8K por exact-match greedy.

| Suite | n | Antes | Despues | Delta |
|---|---|---|---|---|
| ARC-Challenge | 100 | 0,300 | 0,320 | +0,020 |
| WinoGrande | 100 | 0,530 | 0,550 | +0,020 |
| PIQA | 100 | 0,690 | 0,700 | +0,010 |
| HellaSwag | 100 | 0,340 | 0,340 | 0,000 |
| MMLU | 91 | 0,407 | 0,407 | 0,000 |
| GSM8K | 60 | 0,200 | 0,433 | +0,233 |
| Media | — | 0,411 | 0,458 | +0,047 |

Benchmark de bucles en puntos de ramificacion controlados (12 semillas por prompt, metrica combinada semantica y verbatim):

| Prompt | Tasa de bucle control | Tasa de bucle editado | Reduccion |
|---|---|---|---|
| tool-ambig-2 | 8/12 | 0/12 | 100 % |
| tool-ambig-3 | 10/12 | 0/12 | 100 % |
| math-multi-1 | 12/12 | 1/12 | 92 % |
| math-multi-2 | 12/12 | 2/12 | 83 % |
| Global | 42/48 = 0,875 | 3/48 = 0,062 | 92,9 % |

La probabilidad de cierre en el token de decision sube a 0,66 / 0,79 / 0,93 / 0,95 segun el prompt. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF ocupa 1,8 GB; con Q4_K_M y overhead de contexto, cabe en GPUs con 3-4 GB de VRAM. No se dispone de cifras oficiales de consumo.
- GPU recomendadas: no disponibles en la informacion. Por tamano, cualquier GPU consumer con al menos 4 GB (por ejemplo, GTX 1650, RTX 3050) deberia poder cargarlo; no hay datos verificados.
- Cabe en GPU consumer: si, por el tamano del archivo (1,8 GB) y la cuantizacion Q4_K_M.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo TGI/API. No se documentan configuraciones de vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-1.7B-noloop-headrow-GGUF | 1,976B | no disponible | Apache-2.0 | Edicion anti-bucle sobre Q4_K_M; en/zh |
| Spark-X2.6-1.7B (base) | 1,976B | no disponible | Apache-2.0 | Modelo original sin edicion; presenta el bucle de redecision |
| Spark-X2.6-4B (variante) | no disponible | no disponible | no disponible | Mencionada en la model card como variante con cabeza atada; sin datos de rendimiento |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- La edicion corrige el bucle de razonamiento semantico, pero el autor advierte que el bucle de herramientas del agente (tool looping) puede seguir ocurriendo en otras tareas.
- El benchmark de validacion es pequeno (cuatro prompts, 12 semillas cada uno); la generalizacion a otros dominios no esta demostrada.
- Los benchmarks estandar tienen muestras reducidas (n entre 60 y 100), lo que limita la significacion estadistica de las diferencias.
- Solo soporta ingles y chino; no hay evaluacion en castellano.
- Riesgo de alucinacion inherente a un modelo de 1,7B; no se documentan evaluaciones de factualidad.
- El modelo esta etiquetado como `uncensored`, lo que implica menor filtrado de contenido; requiere moderacion externa en produccion.
- La edicion se aplico sobre una cuantizacion Q4_K_M concreta; no se garantiza que el mismo delta funcione en otras cuantizaciones o en los pesos BF16 originales.
- Licencia Apache-2.0 permite uso comercial, pero al ser un trabajo derivado conviene conservar la atribucion a XHToken y revisar las condiciones del modelo base.
- No se documenta la longitud de contexto efectiva, lo que impide planificar despliegues con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/graydini/Spark-X2.6-1.7B-noloop-headrow-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Autor del modelo base: https://huggingface.co/XHToken
