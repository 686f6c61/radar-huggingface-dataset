# jtss/distilbert-base-uncased-finetuned-adl_hw1

## Resumen

`jtss/distilbert-base-uncased-finetuned-adl_hw1` es un ajuste fino de `distilbert-base-uncased` para clasificacion de texto, publicado por el usuario `jtss` en Hugging Face. Se trata de un modelo derivado de caracter academico (el sufijo `adl_hw1` apunta a una practica de asignatura) y no de un lanzamiento de producto: no tiene descargas ni interacciones registradas, y su model card fue generada automaticamente por la libreria `Trainer` de Transformers.

Tecnicamente es un encoder transformer de 6 capas con 67.068.822 parametros, ventana de contexto de 512 tokens (heredada del modelo base) y licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Su relevancia es limitada como artefacto de produccion, pero resulta util como caso de estudio de un ajuste fino fallido: la model card declara una exactitud de 0,0003 sobre el conjunto de evaluacion, un valor por debajo del azar en un problema con muchas clases.

La informacion publicada es muy escasa: no se documenta el conjunto de datos de entrenamiento ("unknown dataset"), no hay benchmarks estandar en el `model-index` y la busqueda web no ha devuelto ningun recurso tecnico relacionado con este modelo (solo paginas de ayuda de YouTube, sin relacion alguna).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), 6 capas, 768 de dimension oculta, 12 cabezas de atencion, destilado de `bert-base-uncased` |
| Parametros totales | 67.068.822 (dato real reportado en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite del modelo base; no se declara modificacion en la model card) |
| Tipos de cuantizacion | no disponible en la model card; al ser un modelo denso de 67 M de parametros admite cuantizacion a INT8 y 4 bits con herramientas estandar (ONNX Runtime, bitsandbytes) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base `distilbert-base-uncased` se entrena sobre corpus en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (etiqueta del repositorio); el tamano del repo (1,3 GB) sugiere que tambien contiene checkpoints de entrenamiento intermedios |

Otros datos del repositorio: pipeline `text-classification`, libreria `transformers`, etiquetas `text-embeddings-inference` y `endpoints_compatible`, creado y actualizado el 16 de septiembre de 2026, 0 descargas, 0 likes.

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer de 6 capas y 768 dimensiones ocultas, obtenido por destilacion del conocimiento de `bert-base-uncased` (12 capas, 768 dimensiones). El modelo base conserva aproximadamente el 97 % del rendimiento de BERT en GLUE con un 40 % menos de parametros y siendo un 60 % mas rapido, segun los datos publicados junto a DistilBERT. Sobre esa base, este repositorio anade una cabeza de clasificacion de secuencias y la ajusta de punta a punta.

Del proceso de entrenamiento solo se conocen los hiperparametros que el `Trainer` registro automaticamente: 5 epocas, learning rate 2e-05, batch de entrenamiento y evaluacion de 16, semilla 42, optimizador `AdamW` en su variante fusionada (betas 0,9/0,999, epsilon 1e-08), scheduler lineal y 4.690 pasos totales. No se documenta el dataset, ni el numero de tokens, ni si hubo una fase de RLHF o DPO (improbable en un encoder de clasificacion). Frameworks declarados: Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

Nota derivada (calculo, no dato declarado): si se asume una cabeza de clasificacion de una sola capa lineal sobre un modelo base de 66.955.010 parametros, la diferencia de 113.812 parametros corresponde exactamente a 768 x n + n con n = 148 etiquetas. Es decir, el modelo parece estar configurado para clasificar en 148 clases, aunque la model card no lo confirma.

## Capacidades

- Clasificacion de texto: es su unica tarea declarada (pipeline `text-classification`); devuelve una distribucion de probabilidad sobre las etiquetas configuradas.
- Cabeza de clasificacion configurada, segun el calculo derivado, para 148 clases (dato no confirmado en la model card).
- No genera texto: no es un modelo causal ni seq2seq, por lo que no admite prompts abiertos ni conversacion.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el vocabulario WordPiece del modelo base esta dominado por ingles.
- No dispone de modo "thinking", vision, audio ni ninguna modalidad adicional.
- Compatible con la libreria `transformers` y con el stack de Hugging Face (`text-embeddings-inference`, `endpoints_compatible`), lo que permite servirlo como endpoint estandar.

## Casos de uso

Advertencia previa: con la exactitud declarada (0,0003) el modelo no es apto para produccion tal cual. Los casos siguientes describen para que seria util un clasificador de este tipo y tamano si se reentrenara o corrigiera la evaluacion.

- Clasificacion de tickets de soporte: un encoder de 67 M de parametros puede etiquetar incidencias en decenas de categorias con latencia de milisegundos en GPU, lo que permite enrutar automaticamente colas de atencion al cliente sin coste apreciable de inferencia.
- Moderacion de contenido en tiempo real: la ventana de 512 tokens cubre la mayoria de comentarios y mensajes cortos; al ocupar menos de 300 MB en FP32, se puede desplegar en la misma instancia que el resto del servicio.
- Etiquetado de documentos legales o administrativos: con 148 clases potenciales encaja en taxonomias internas de clasificacion documental, donde un modelo pequeno entrenado con datos propios suele superar a un LLM generico en coste por consulta.
- Filtrado previo en pipelines de recuperacion (RAG): usar el clasificador como primera etapa para descartar documentos irrelevantes antes de invocar un modelo generativo, reduciendo el consumo de tokens de contexto.
- Analisis de sentimiento o intencion en encuestas: para clasificacion de respuestas cortas en ingles con requisitos de latencia por debajo de 10 ms.
- Extraccion de senales para monitorizacion: clasificar logs o mensajes de error en categorias, alimentando paneles de observabilidad.
- Base para destilacion o ajuste adicional: al ser un modelo de 67 M de parametros con licencia Apache-2.0, sirve como punto de partida barato para experimentos academicos (que es, de hecho, su origen).

## Benchmarks y rendimiento

El `model-index` del autor esta vacio (`"results": []`), por lo que no se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible.

La model card si incluye la evolucion del entrenamiento y la evaluacion, que se reproduce tal cual (datos declarados por el autor):

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Exactitud |
|---|---|---|---|---|
| 1,0 | 938 | 1,3071 | 0,3996 | 0,0003 |
| 2,0 | 1.876 | 0,2361 | 0,2170 | 0,0000 |
| 3,0 | 2.814 | 0,0640 | 0,1964 | 0,0003 |
| 4,0 | 3.752 | 0,0315 | 0,1889 | 0,0003 |
| 5,0 | 4.690 | 0,0214 | 0,1943 | 0,0003 |

Interpretacion: la perdida de validacion deja de mejorar a partir de la tercera epoca mientras la de entrenamiento cae hasta 0,0214, lo que indica sobreajuste. Ademas, la exactitud se mantiene en 0,0003 con una perdida de validacion de 0,19, una combinacion incoherente: con 148 clases (calculo derivado), un clasificador que colapsara a una sola clase obtendria en torno a 0,0068 de exactitud. Un valor de 0,0003 sugiere un error en el calculo de la metrica o un desajuste entre las etiquetas de evaluacion y las predicciones, mas que un modelo simplemente malo. No se dispone de informacion adicional que permita confirmarlo.

## Requisitos de hardware

- VRAM para inferencia: en FP32 el checkpoint ocupa aproximadamente 268 MB; en FP16/BF16 unos 134 MB; cuantizado a INT8 unos 67 MB y a 4 bits unos 40 MB. Sumando activaciones y el tokenizador, la inferencia en un unico lote cabe en menos de 1 GB, y con lotes de 16 a 512 tokens es razonable reservar 1-2 GB.
- GPU recomendadas: cualquier GPU moderna sirve. Para maxima agregacion de peticiones, A100, H100, L40S o T4; para despliegue de baja concurrencia, RTX 4090, RTX 3090, RTX 3060 o incluso GTX 1650.
- Cabe sin problema en GPU de consumo: es un modelo de 67 M de parametros, por lo que tambien funciona en CPU (x86 con AVX2) con latencias del orden de milisegundos por secuencia corta.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Hugging Face Inference Endpoints (la etiqueta `endpoints_compatible` indica compatibilidad), Text Embeddings Inference, ONNX Runtime, TorchScript, FastAPI con `optimum` y `bitsandbytes` para cuantizacion en 8 o 4 bits.
- Latencia y throughput: no disponibles para este modelo concreto. Como referencia del modelo base, DistilBERT se diseno para ser un 60 % mas rapido que `bert-base-uncased` manteniendo cerca del 97 % de su calidad.

## Comparativa con modelos similares

No se han publicado benchmarks que permitan comparar el rendimiento de este ajuste con alternativas. La tabla compara solo caracteristicas estructurales y de licencia frente a encoders de tamano y funcion equivalentes.

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| jtss/distilbert-base-uncased-finetuned-adl_hw1 | 67,1 M | 512 tokens | Clasificacion (148 clases, derivado) | Apache-2.0 | Exactitud 0,0003 declarada; no comparable |
| distilbert-base-uncased | 66,96 M | 512 tokens | Modelo base (representaciones) | Apache-2.0 | Base del anterior; ~97 % de BERT-base en GLUE |
| bert-base-uncased | 110 M | 512 tokens | Modelo base (representaciones) | Apache-2.0 | Superior a DistilBERT en GLUE, ~2x mas lento |
| roberta-base | 125 M | 512 tokens | Modelo base (representaciones) | MIT | Rendimiento superior a BERT-base en la mayoria de tareas GLUE |
| microsoft/deberta-v3-base | 184 M | 512 tokens | Modelo base (representaciones) | MIT | Estado del arte en la familia base en varias tareas NLU |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | Embeddings de frases | Apache-2.0 | Mas pequeno y rapido; orientado a similitud, no a clasificacion |

## Limitaciones y advertencias

- La exactitud declarada en evaluacion es 0,0003, inferior al azar esperado en un problema de 148 clases. El modelo no debe desplegarse en produccion sin reentrenar y revalidar.
- La combinacion de perdida de validacion baja (0,19) y exactitud casi nula apunta a un fallo en la metrica o en la alineacion de etiquetas del conjunto de evaluacion, no necesariamente a un fallo total del aprendizaje. Conviene auditar el pipeline de evaluacion antes de descartar los pesos.
- Sobreajuste claro: la perdida de entrenamiento baja de 1,3071 a 0,0214 mientras la de validacion se estanca a partir de la tercera epoca.
- El conjunto de datos de entrenamiento no esta documentado ("unknown dataset"), por lo que se desconocen la composicion, el dominio y los sesgos potenciales.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si puede asignar clases con alta confianza a entradas fuera de distribucion.
- Limitacion idiomatica: el vocabulario WordPiece sin distinguir mayusculas del modelo base esta optimizado para ingles; el rendimiento en castellano o en otros idiomas es previsiblemente bajo y no esta medido.
- Limite de contexto de 512 tokens: los documentos mas largos requieren truncado o troceado previo.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia. El modelo base tiene la misma licencia, por lo que no hay restricciones adicionales.
- La model card fue generada automaticamente y conserva textos de plantilla ("More information needed"), de modo que no sirve como documentacion fiable del modelo.
- Trazabilidad: el autor es un usuario individual sin historial verificable y el modelo tiene 0 descargas y 0 likes, sin garantia de mantenimiento.
- Repositorio de 1,3 GB para un modelo de 268 MB: parte del contenido son checkpoints de entrenamiento que conviene revisar antes de descargar todo el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jtss/distilbert-base-uncased-finetuned-adl_hw1
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Articulo de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentacion de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- La busqueda web no ha devuelto ningun resultado relacionado con este modelo: los unicos enlaces obtenidos corresponden a paginas de ayuda de YouTube y foros sin ninguna conexion con `distilbert-base-uncased-finetuned-adl_hw1`. No se dispone de paper, blog, repositorio ni demo adicional.
