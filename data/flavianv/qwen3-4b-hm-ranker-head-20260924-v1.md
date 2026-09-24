# flavianv/qwen3-4b-hm-ranker-head-20260924-v1

## Resumen

`flavianv/qwen3-4b-hm-ranker-head-20260924-v1` es una cabeza de ranking (reward head) entrenada sobre un backbone Qwen3-4B previamente ajustado con supervisión (SFT) por el mismo autor. El repositorio contiene únicamente la cabeza: 2.560 pesos escalares (`score.pt`) que se cargan sobre el modelo base congelado `flavianv/qwen3-4b-hm-positive-sft-20260924-v1`. No es un modelo generativo: recibe una consulta y un conjunto de títulos de productos y devuelve una puntuación escalar que ordena la calidad del conjunto como outfit coherente.

El modelo está especializado en el dominio de moda (catálogo de H&M) y se entrenó con un objetivo Bradley-Terry sobre 20.096 pares derivados de 5.024 consultas reservadas, durante dos épocas. En la selección de checkpoint alcanzó un 95,3% de acierto top-one (953/1000 consultas de validación) en el paso 942 (época 0,75), frente a un 11,9% de una cabeza aleatoria. La precisión final reportada fue del 95,0%.

Su relevancia es doble. Por un lado, es un ejemplo de *decoupled head training*: congelar un backbone de 4B y entrenar solo ~2.560 parámetros permite construir un ranker de dominio muy específico a un coste de cómputo mínimo. Por otro lado, la model card es inusualmente explícita sobre las limitaciones metodológicas de su evaluación (validación usada para seleccionar checkpoint, exposición previa del SFT a esos datos, negativos sintéticos), lo que lo convierte en un caso útil para quienes diseñan pipelines de evaluación de rankers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (backbone Qwen3-4B) con cabeza de clasificación escalar (`AutoModelForSequenceClassification`, `num_labels=1`); backbone congelado en inferencia |
| Parametros totales | No disponible en la informacion proporcionada para el conjunto; la cabeza contiene 2.560 parametros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el ejemplo de carga usa `torch.bfloat16` para el backbone y `float32` para la cabeza |
| Idiomas soportados | Ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | `score.pt` (state dict de PyTorch) para la cabeza; el backbone se descarga desde el repositorio base en formato de `transformers` |
| Modelo base | `flavianv/qwen3-4b-hm-positive-sft-20260924-v1`, revision `2e3df923d266b74c39d6475b270a3042cae06b0d` |
| Tarea | Reward model / ranking (puntuacion escalar, mayor = mejor) |
| Tamano del repositorio | 0,0 GB (solo la cabeza; ~10 KB en `float32` para 2.560 parametros, calculo derivado) |
| Fecha de creacion | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura sigue el patron de *frozen backbone + head*: se parte del modelo SFT `qwen3-4b-hm-positive-sft`, se congela por completo y se entrena exclusivamente una cabeza escalar de 2.560 pesos. El prompt de puntuacion se construye con la plantilla de chat del tokenizer en formato de tres turnos (system, user con la consulta, assistant con un JSON `{"products": [...]}`), con `add_generation_prompt=False` y `enable_thinking=False`, y se ejecuta un unico forward pass con atencion SDPA. La salida es un logit crudo: mayor puntuacion implica mejor ranking.

El entrenamiento usa un objetivo de comparacion por pares tipo Bradley-Terry. El conjunto de ajuste de la cabeza consta de 5.024 consultas reservadas que generan 20.096 pares, sobre los que se entrena durante dos epocas conservando ocho checkpoints. El checkpoint seleccionado corresponde al paso 942 (epoca 0,75), con un 95,3% de acierto top-one en 1.000 consultas de validacion (953/1000) y un 95,0% de precision final. La linea base con cabeza aleatoria se situa en el 11,9%. No se aplico calibracion de temperatura con sigmoide, de modo que `sigmoid(score/3)` no debe interpretarse como una probabilidad validada.

Un detalle metodologico relevante: la validacion compara bundles de referencia reales contra tres negativos sinteticos generados para la misma consulta, y no mide rendimiento sobre resultados generados por un sistema de recuperacion. La cuarta estrategia de negativos (consulta incorrecta) solo se contabiliza en las metricas por pares. Ademas, la validacion se uso para seleccionar el checkpoint y ya habia estado expuesta a la evaluacion del SFT, por lo que no constituye un conjunto de test intacto.

## Capacidades

- Puntuacion y ordenacion de bundles de productos de moda: dado un texto de consulta y una lista de titulos de producto reales, devuelve un unico valor escalar por bundle.
- Evaluacion de coherencia de outfit: el prompt de sistema indica al modelo que valore si los articulos cumplen roles complementarios utiles dentro del conjunto.
- Ranking por comparacion por pares (Bradley-Terry) en fase de entrenamiento; en inferencia, el ranking se obtiene ordenando las puntuaciones crudas.
- Uso como reward model en pipelines de seleccion (reranking de candidatos, filtrado, anotacion asistida).
- Restriccion explicita de no inferir hechos no aportados: material, talla, compatibilidad o precio, segun el prompt de sistema incluido en la model card.
- No soporta generacion de texto libre como salida: la cabeza produce un escalar.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingue: no disponible; el modelo declara unicamente ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles; el ejemplo desactiva explicitamente el modo thinking.

## Casos de uso

- Reranking de recomendaciones de moda: tras recuperar candidatos con un buscador vectorial o un sistema de reglas, el ranker puntua cada bundle y reordena los resultados finales. Es el caso de uso central para el que fue entrenado.
- Evaluacion automatica de calidad de outfits: dado un conjunto de prendas propuesto por un generador o por un estilista, el score permite filtrar combinaciones incoherentes antes de mostrarlas al usuario.
- Anotacion asistida de datos de entrenamiento: usar las puntuaciones para preordenar pares candidatos y que los anotadores humanos revisen primero los casos dudosos, reduciendo coste de etiquetado.
- Reward model en un pipeline de RL o DPO: el escalar puede servir como funcion de recompensa para ajustar un modelo generativo de descripciones de productos o de combinaciones de outfit, siempre que se respete la revision exacta del backbone.
- Busqueda conversacional en e-commerce: en un sistema multi-turno, cada respuesta del usuario genera una nueva consulta que se re-puntua contra los bundles disponibles, permitiendo refinar la seleccion sin reentrenar el modelo.
- Control de calidad en catalogos: detectar automaticamente fichas de producto o conjuntos promocionales mal emparejados con la consulta o la categoria objetivo a partir de umbrales sobre el score.
- Investigacion sobre cabezas desacopladas: el modelo sirve como referencia reproducible de cuanto rendimiento se puede extraer entrenando solo 2.560 parametros sobre un backbone congelado en un dominio estrecho.
- Analisis de sensibilidad de negativos: el diseño experimental del autor (tres negativos sinteticos por consulta, cuarta estrategia contabilizada aparte) es reutilizable para estudiar como varia la metrica segun la estrategia de negativos.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la propia validacion interna:

| Metrica | Valor | Contexto |
|---|---|---|
| Acierto top-one (checkpoint seleccionado) | 95,3% (953/1000) | Paso 942, epoca 0,75, sobre 1.000 consultas de validacion |
| Precision final | 95,0% | Tras dos epocas de entrenamiento de la cabeza |
| Linea base con cabeza aleatoria | 11,9% | Referencia de azar |
| Pares Bradley-Terry de entrenamiento | 20.096 | Derivados de 5.024 consultas reservadas |
| Epocas de entrenamiento | 2 | Ocho checkpoints conservados |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores corresponden a validacion interna y, segun el propio autor, no constituyen un resultado de test intacto ni miden rendimiento sobre resultados generados por un sistema de recuperacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone es un Qwen3-4B, por lo que en `bfloat16` los pesos ocupan aproximadamente 8 GB; la cabeza anade un coste despreciable. Estas cifras son estimaciones derivadas del tamano del backbone, no mediciones publicadas por el autor.
- GPU recomendadas: cualquier GPU con 12 GB o mas de VRAM puede ejecutar el modelo en `bfloat16` para lotes pequenos (RTX 4090, L40S, A100, H100). Para lotes grandes de candidatos a puntuar, se recomienda A100/H100 por ancho de banda de memoria.
- Cabe en GPU de consumo: si, en tarjetas de 12-16 GB en `bfloat16` con lotes pequenos, y en tarjetas de 8 GB si se aplica cuantizacion de 8 bits o 4 bits al backbone. No se documentan recetas de cuantizacion especificas para esta combinacion backbone + cabeza.
- Precaucion de precision: el ejemplo oficial carga el backbone en `bfloat16` pero fuerza la cabeza a `float32` (`model.score.float().load_state_dict(...)`). Saltarse ese detalle puede alterar las puntuaciones.
- Opciones de despliegue: `transformers` con `attn_implementation='sdpa'` es la ruta documentada y la unica verificada. No hay informacion sobre compatibilidad con vLLM, TGI, llama.cpp, Ollama u otros motores, y al tratarse de una cabeza de clasificacion personalizada la conversion a GGUF no esta documentada.
- Latencia y throughput: no disponible. Al no haber generacion autoregresiva, cada puntuacion requiere un unico forward pass por bundle candidato, de modo que el coste crece linealmente con el numero de candidatos; no se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada. La comparacion siguiente es estructural y debe verificarse contra las fichas oficiales de cada modelo antes de tomar decisiones.

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `qwen3-4b-hm-ranker-head-20260924-v1` | Reward head sobre backbone congelado | 2.560 entrenables (backbone Qwen3-4B) | No disponible | apache-2.0 | Especializado en moda (H&M); solo ingles; evaluacion interna de 1.000 consultas |
| `flavianv/qwen3-4b-hm-positive-sft-20260924-v1` | Modelo generativo SFT (backbone de este modelo) | 4B (nominal) | No disponible | No disponible | Es el backbone exacto requerido; no funciona como ranker por si mismo |
| Qwen3-4B (modelo base original de la familia) | LLM generativo | 4B (nominal) | No disponible | No disponible | Proposito general; no esta ajustado para ranking de outfits |
| Rerankers cross-encoder genericos (por ejemplo, la familia bge-reranker de BAAI) | Cross-encoder de relevancia | Varía segun version | No disponible | No disponible | Multilingues y de dominio general; no modelan coherencia de outfit como tarea especifica |

## Limitaciones y advertencias

- Evaluacion no limpia: la validacion se uso para seleccionar el checkpoint y ya habia estado expuesta a la evaluacion del SFT previo. El autor lo indica explicitamente. Las cifras de 95,3% y 95,0% no deben tratarse como generalizacion a datos no vistos.
- Negativos sinteticos: la validacion compara bundles de referencia reales contra tres negativos sinteticos de la misma consulta. No mide el rendimiento sobre candidatos producidos por un sistema de recuperacion real.
- La cuarta estrategia de negativos (consulta incorrecta) solo se contabiliza en metricas por pares, no en la metrica principal, lo que puede inflar la lectura del top-one.
- Sin calibracion: no se realizo calibracion de temperatura, y `sigmoid(score/3)` no es una probabilidad validada. Las puntuaciones solo son interpretables como orden relativo.
- Dependencia critica de la revision del backbone: el modelo debe cargarse sobre la revision exacta `2e3df923d266b74c39d6475b270a3042cae06b0d`. Cualquier otro backbone invalida los pesos de la cabeza.
- El repositorio contiene solo la cabeza, no el backbone. Desplegarlo requiere descargar dos repositorios.
- Idioma: solo ingles. No se documenta comportamiento en castellano ni en otros idiomas, por lo que las consultas en otros idiomas no estan cubiertas.
- Dominio muy estrecho: entrenado sobre el catalogo de H&M y sobre la tarea de coherencia de outfit. El prompt de sistema prohibe inferir material, talla, compatibilidad o precio, de modo que el modelo no evalua esos atributos.
- Riesgo de sesgo: no se publica ningun analisis de sesgo demografico, de genero, de talla o de precio. Al depender de un catalogo y de titulos de producto reales, puede heredar sesgos de representacion del propio catalogo.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque la salida es un escalar; el riesgo equivalente es asignar puntuaciones altas a bundles incoherentes o fuera de distribucion.
- Dataset de ranking no publicado: el propio autor indica que el conjunto de datos de ranking aun no esta publicado, lo que limita la reproducibilidad completa del entrenamiento.
- Licencia: apache-2.0 en el repositorio de la cabeza, lo que en principio permite uso comercial, pero la licencia y las condiciones del backbone y del catalogo de datos subyacente deben verificarse por separado.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de terceros.
- Contexto: la longitud de contexto no se documenta para esta configuracion. Consultas y listas de productos largas pueden superar el limite efectivo del prompt.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flavianv/qwen3-4b-hm-ranker-head-20260924-v1
- Modelo base (backbone SFT): https://huggingface.co/flavianv/qwen3-4b-hm-positive-sft-20260924-v1
- Dataset publicado (H&M positive SFT / ranker reserve): https://huggingface.co/datasets/flavianv/hm-positive-sft-half-20260924-v1
- Informe completo en PDF: https://huggingface.co/flavianv/qwen3-4b-hm-ranker-head-20260924-v1/blob/main/report.pdf
- Informe completo en Markdown: https://huggingface.co/flavianv/qwen3-4b-hm-ranker-head-20260924-v1/blob/main/report.md
- CSV de trayectoria de entrenamiento: https://huggingface.co/flavianv/qwen3-4b-hm-ranker-head-20260924-v1/blob/main/trajectory.csv
- Pesos de la cabeza (`score.pt`): https://huggingface.co/flavianv/qwen3-4b-hm-ranker-head-20260924-v1/blob/main/score.pt
