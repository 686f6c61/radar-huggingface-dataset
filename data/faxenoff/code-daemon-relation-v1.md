# faxenoff/code-daemon-relation-v1

## Resumen

`faxenoff/code-daemon-relation-v1` es un clasificador de relaciones entre entidades de 117 millones de parametros, desarrollado por Fedor Aksenov (faxenoff) como componente de un sistema de inteligencia de codigo. Dado un pasaje con dos entidades marcadas mediante tokens especiales, el modelo devuelve en una unica pasada directa una de cuatro clases: `NO_RELATION`, `semantically_similar_to`, `invalidates_with` o `depends_on`. Sustituye la extraccion de relaciones tipicamente realizada por un LLM generativo token a token por una clasificacion unica, lo que permite barrer corpus completos a alta velocidad: unas 2 900 parejas por segundo en una GPU portatil RTX 5060.

El modelo parte del cross-encoder multilingue `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1` (XLM-RoBERTa, 12 capas, 384 dimensiones ocultas) y se afina mediante destilacion a nivel de secuencia: un LLM instruido (Claude) lee documentacion real y emite tuplas de relacion ancladas al pasaje, que tras varios filtros se convierten en objetivos de entrenamiento. La cabeza de clasificacion no usa el vector `[CLS]`, sino que hace media de los estados ocultos en las posiciones de los marcadores de entidad, concatenando ambos vectores y pasandolos por una capa lineal. Esto permite puntuar la relacion directamente entre las dos entidades, preservando la direccion (intercambiar los marcadores cambia la entrada).

Publicado bajo licencia MIT, el repositorio incluye motores TensorRT, OpenVINO y ONNX, con longitudes de secuencia de 64, 128, 256 y 320 tokens. Es un componente especializado, no un asistente general: fuera de su distribucion de tareas su comportamiento no esta definido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (cross-encoder) con cabeza de clasificacion por marcadores de entidad |
| Parametros totales | ~117M (96M corresponden a la tabla de embeddings multilingue) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens en los motores publicados; tambien se proporcionan variantes de 64, 128 y 320 |
| Tipos de cuantizacion | FP16 (TensorRT, OpenVINO), FP32 (ONNX Runtime) |
| Idiomas soportados | Multilingue (codigo y prosa, via backbone XLM-R) |
| Licencia | MIT |
| Formato de pesos | TensorRT, OpenVINO, ONNX (tambien safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en XLM-RoBERTa con 12 capas, 384 unidades ocultas, 12 cabezas de atencion y una red feed-forward de 1536 unidades. El vocabulario ampliado contiene 250 006 piezas SentencePiece: las 250 002 originales de XLM-R mas cuatro tokens de marcado `[E1]`, `[/E1]`, `[E2]` y `[/E2]` (ids 250002-250005). La entrada se compone de `input_ids` y `attention_mask`; no se usa `token_type_ids`. La salida son logits de dimension `[batch, 4]`.

La cabeza de clasificacion aplica *entity-marker pooling*: hace la media de los estados ocultos en las posiciones de los tokens `[E1]` y `[E2]`, concatena ambos vectores y los pasa por una unica capa lineal. A diferencia del pooling con `[CLS]`, que resume todo el pasaje, este metodo entrega a la cabeza los dos argumentos directamente y en orden, de modo que la relacion se puntua entre las entidades y no se infiere de una representacion global. La direccionalidad queda implicita: intercambiar los marcadores cambia la entrada.

El entrenamiento comienza con un warm-start desde el cross-encoder de ranking multilingue `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`, sustituyendo su logit unico por la cabeza de 4 clases. Despues se afina mediante destilacion a nivel de secuencia: un LLM instruido (Claude) lee documentacion real y emite tuplas de relacion ancladas al pasaje. Esas tuplas pasan por varios filtros: anclaje (los nombres de entidad deben resolverse dentro del fragmento, eliminando argumentos alucinados), ventaneado (el pasaje se recorta para que ambos marcadores sobrevivan a la truncacion), fusion (las 8 etiquetas originales se colapsan a las 4 finales), negativos sinteticos (pares de entidades co-ocurrentes pero sin tupla, para entrenar la abstencion) y ajuste de logits por prior de clase (el profesor emite "similar" con mucha mas frecuencia que "depende de").

## Capacidades

- Clasificacion de relaciones entre dos entidades marcadas en un pasaje, con cuatro clases: `NO_RELATION` (abstencion), `semantically_similar_to`, `invalidates_with` y `depends_on`.
- Lectura de prosa y comentarios de codigo en multiples idiomas gracias al backbone XLM-R.
- Salida en una unica pasada directa (sin generacion token a token), lo que permite procesar corpus completos a alta velocidad.
- Regla de decision configurable: `argmax != NO_RELATION` y `1 - softmax[NO_RELATION] >= tau`, donde tau es un umbral ajustable. Esta regla es mas robusta que umbralizar la probabilidad de la clase ganadora cuando la masa de una relacion real se reparte entre dos clases plausibles.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un clasificador puntual, no un modelo generativo.
- No tiene modo de pensamiento ni capacidades de vision o audio.

## Casos de uso

- Construccion de grafos de conocimiento a partir de documentacion tecnica: el modelo puede barrer miles de paginas de documentacion, marcar pares de entidades (APIs, modulos, conceptos) y clasificar su relacion, alimentando un grafo que un sistema de recomendacion o busqueda semantica pueda consultar.
- Analisis de dependencias en repositorios de codigo: dado un fragmento con dos simbolos o modulos, el modelo determina si uno depende del otro, si lo invalida o si son semanticamente similares, ayudando a detectar conflictos de versiones o codigo duplicado.
- Deteccion de contradicciones en documentacion: al marcar dos afirmaciones o especificaciones, el modelo identifica si una invalida a la otra, util para mantener manuales y guias coherentes.
- Deduplicacion de entidades: marcar dos nombres o descripciones de productos, funciones o conceptos y clasificarlos como `semantically_similar_to` permite fusionar entradas duplicadas en bases de conocimiento.
- Enriquecimiento de motores de busqueda: integrar el clasificador como paso posterior a un reranker para extraer relaciones entre resultados y consultas, mejorando la precision de respuestas a preguntas relacionales.
- Monitorizacion de cambios en APIs: al comparar descripciones de versiones antiguas y nuevas de una API, el modelo detecta si una version invalida a la anterior, facilitando la gestion de migraciones.
- Filtrado de ruido en pipelines de extraccion: la clase `NO_RELATION` actua como abstencion explicita, permitiendo descartar pares de entidades co-ocurrentes pero sin relacion real antes de invertir recursos en procesamiento posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El modelo no es un LLM generativo, sino un clasificador de relaciones, por lo que las metricas habituales de razonamiento o generacion no aplican.

El autor proporciona mediciones de velocidad en un portatil con Intel Core Ultra 9 275HX y NVIDIA RTX 5060 Laptop:

| Lane | Batch x seq | Tiempo por batch | Throughput | Tiempo por pareja |
|---|---|---|---|---|
| TensorRT FP16, RTX 5060 Laptop | 16 x 256 | 5.44 ms | 2 942 pares/s | 0.34 ms |
| OpenVINO FP16, iGPU (OV 2026.3) | 16 x 256 | 143 ms | 111 pares/s | 8.96 ms |
| OpenVINO FP16, CPU (OV 2026.3) | 16 x 256 | 366 ms | 44 pares/s | 22.9 ms |
| ONNX Runtime FP32, CPU | 16 x 256 | 380 ms | 42 pares/s | 23.7 ms |

Por bucket de longitud (OpenVINO 2026.3, mismo portatil, pares/s en solitario):

| Bucket | Batch x seq | CPU FP16 | iGPU FP16 |
|---|---|---|---|
| s | 16 x 64 | 159 | 508 |
| m | 16 x 128 | 85 | 245 |
| l | 16 x 256 | 44 | 111 |
| xl | 16 x 320 | 34 | 85 |

La iGPU es aproximadamente 2.6 veces mas rapida que la CPU en todos los buckets. Usando ambos dispositivos a la vez se obtiene alrededor del 87 % de la suma de sus tasas individuales, debido al controlador de memoria compartido. La GPU dedicada es unas 67 veces mas rapida que la CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~117M de parametros; en FP16 ocupa aproximadamente 234 MB de pesos, mas overhead de activaciones. Cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: RTX 5060 Laptop (medida por el autor), cualquier GPU NVIDIA con soporte TensorRT (serie 20 en adelante). Tambien funciona en iGPU Intel con OpenVINO y en CPU.
- Cabe en GPUs de consumo: si, incluso en las mas modestas. No requiere GPU de datacenter.
- Opciones de despliegue: TensorRT (libreria principal del repositorio), OpenVINO (para CPU e iGPU), ONNX Runtime (CPU). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: 0.34 ms por pareja en TensorRT FP16 con batch 16 x 256 en RTX 5060 Laptop; 8.96 ms por pareja en iGPU; 22.9 ms en CPU. Para corpus grandes, el autor recomienda rutear la extraccion a la iGPU si no hay GPU discreta.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (clasificadores de relaciones entre entidades con marcadores y destilacion desde LLM). El modelo base `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1` es un cross-encoder de ranking, no un clasificador de relaciones, por lo que no es una alternativa funcional. Otros modelos de extraccion de relaciones (por ejemplo, REBEL o SpERT) no aparecen en la informacion proporcionada, por lo que no se puede establecer una comparativa fiable. Se indica "no disponible".

## Limitaciones y advertencias

- Modelo especializado: su comportamiento esta definido solo para la tarea de clasificacion de relaciones entre entidades marcadas. Fuera de esa distribucion, los resultados no son fiables.
- Taxonomia gruesa: solo tres relaciones positivas mas abstencion. La distincion entre pares cercanos (p. ej., `semantically_similar_to` vs `shares_purpose_with`) se elimino deliberadamente porque no era separable de forma fiable desde el contexto.
- Riesgo de alucinacion en el profesor: las tuplas de entrenamiento las genera un LLM (Claude) y, aunque se aplican filtros de anclaje, puede haber errores residuales en los datos de entrenamiento.
- Longitud de contexto limitada: 256 tokens en los motores principales (64, 128 y 320 en variantes). Pasajes mas largos requieren ventaneado, lo que puede perder contexto relevante.
- Sin capacidad generativa: no puede explicar sus decisiones ni producir texto; solo emite logits de 4 clases.
- Dependencia de la calidad del marcado: el rendimiento depende de que las entidades esten correctamente envueltas con los tokens `[E1]`/`[/E1]` y `[E2]`/`[/E2]`; un marcado incorrecto degrada la clasificacion.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo se distribuye sin garantias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/faxenoff/code-daemon-relation-v1
- Modelo base: https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
- Perfil del autor en Hugging Face: https://huggingface.co/faxenoff
- Repositorios del autor en GitHub: https://github.com/faxenoff?tab=repositories
- Modelo relacionado del mismo autor (resumen): https://huggingface.co/faxenoff/code-daemon-summary-v1
- Modelo relacionado del mismo autor (reranker): https://huggingface.co/faxenoff/code-daemon-reranker-v1
