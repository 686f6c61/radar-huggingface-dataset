# jainatharva21/hw1-hc3-detector

## Resumen

hw1-hc3-detector es un clasificador binario de texto desarrollado por el usuario jainatharva21, publicado en HuggingFace bajo el identificador jainatharva21/hw1-hc3-detector. Se trata de un ajuste fino del modelo de embeddings sentence-transformers/all-MiniLM-L6-v2, un encoder transformer tipo BERT de 6 capas y 22.713.986 parametros totales, reentrenado para distinguir respuestas humanas de respuestas generadas por ChatGPT.

El problema que aborda es la deteccion de texto generado por IA en el dominio concreto del dataset HC3 (Hello-SimpleAI/HC3) en ingles. El modelo devuelve dos etiquetas: 0 = humano y 1 = ChatGPT. Su relevancia es principalmente academica o experimental: sirve como ejercicio de ajuste fino y como referencia de como un encoder pequeno puede alcanzar una accuracy muy alta en un benchmark con artefactos conocidos.

El propio autor advierte en la model card de que el modelo se entreno sobre un benchmark de ChatGPT de 2022 con sesgos y artefactos del dataset, y que no es un detector fiable para texto generado por IA actual ni para texto de estudiantes. El repositorio es muy pequeno (0,1 GB), no tiene descargas ni likes, y no declara licencia ni idiomas en los metadatos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM, 6 capas) |
| Parametros totales | 22.713.986 |
| Longitud de contexto | 256 tokens (longitud maxima usada en entrenamiento y limite habitual del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en los metadatos (la model card indica que se entreno sobre HC3 en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer denso (MiniLM) de 6 capas, heredado directamente de sentence-transformers/all-MiniLM-L6-v2. Sobre esa base se anadio una cabeza de clasificacion para dos clases. El ajuste fino fue completo (no solo la cabeza), con optimizador AdamW, learning rate 2e-5, tamano de lote 32, 5 epocas, longitud maxima de 256 tokens y semilla 42. Los datos de entrenamiento provienen del dataset Hello-SimpleAI/HC3 en ingles, con una particion 80/10/10 realizada por pregunta sobre una revision fijada del dataset, y un conjunto de entrenamiento de 37.334 ejemplos.

No se menciona uso de RLHF, DPO ni tecnicas de alineacion adicionales; se trata de un ajuste fino supervisado estandar con entropia cruzada. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o mecanismos hibridos. La eleccion del modelo base responde mas a su coste computacional reducido que a una innovacion arquitectonica propia.

## Capacidades

- Clasificacion binaria de texto: asigna la etiqueta 0 (humano) o 1 (ChatGPT) a una respuesta.
- Deteccion de texto generado por IA en el dominio especifico del dataset HC3 en ingles.
- Extraccion de embeddings subyacentes, heredada del modelo base all-MiniLM-L6-v2, que puede reutilizarse para otras tareas de similitud semantica.
- Inferencia rapida y ligera gracias a sus 22,7 M de parametros.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio, modo de pensamiento (thinking mode) ni generacion de texto libre.
- Capacidades multilingues no documentadas; la model card solo menciona el ingles de HC3.

## Casos de uso

- Filtrado experimental de respuestas generadas por IA en foros o plataformas de preguntas y respuestas en ingles: el clasificador puede etiquetar cada respuesta como humana o generada, con la advertencia de que solo es fiable en textos similares a los de HC3 de 2022.
- Investigacion academica sobre deteccion de texto generado por IA: sirve como punto de comparacion reproducible frente a una linea base de embeddings congelados mas regresion logistica, sobre la que mejora ampliamente.
- Etiquetado automatico de corpus para construir datasets de investigacion: dado su bajo coste, puede usarse como pre-etiquetador de grandes volumenes de respuestas en ingles antes de una revision manual.
- Linea base ligera en pipelines de moderacion de contenido, como primer filtro de bajo coste que derive los casos dudosos a un modelo mayor o a revision humana.
- Analisis retrospectivo de datos historicos: util para estudiar la composicion de datasets recogidos en 2022-2023 y estimar que proporcion de respuestas podria ser generada por ChatGPT.
- Docencia y practicas de ajuste fino: el modelo y su model card documentan de forma clara hiperparametros, particiones y resultados, por lo que funciona como ejemplo didactico de clasificacion de texto con transformers.
- Evaluacion de robustez de detectores: permite ilustrar como un modelo con accuracy cercana al 0,99 en test puede degradarse fuera de distribucion, util para estudios sobre generalizacion y sesgos de dataset.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del conjunto de test de HC3 (4.668 respuestas). No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

| Modelo | Accuracy en test HC3 (4.668 respuestas) |
|---|---|
| Baseline: embeddings congelados + regresion logistica | 0,8449 |
| hw1-hc3-detector (ajuste fino) | 0,9906 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 91 MB de pesos en FP32, 45 MB en FP16/BF16, 23 MB en INT8 y 11 MB en INT4, sin contar activaciones ni overhead del runtime. El consumo total se mantiene muy por debajo de 1 GB en GPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; modelos como NVIDIA A100, H100 o RTX 4090 lo ejecutan con margen enorme, y tambien funciona en GPUs de gama de entrada e integradas.
- Cabe sin problema en GPU de consumo (RTX 3060, RTX 4060, GTX 1650, e incluso en CPU), dado su reducido tamano.
- Opciones de despliegue: pipeline de transformers con PyTorch (libreria declarada), exportacion a ONNX Runtime, TorchServe, Hugging Face Inference Endpoints (el repositorio incluye la etiqueta endpoints_compatible) y text-embeddings-inference (etiqueta text-embeddings-inference en el repositorio).
- Latencia y throughput: no publicados. Como estimacion orientativa, un encoder de 6 capas y 22,7 M de parametros procesa lotes pequenos en el orden de milisegundos por lote en una GPU moderna y en decenas de milisegundos por ejecucion en CPU, aunque estas cifras no estan verificadas en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada para otros detectores de texto generado por IA. Existen alternativas conocidas en el ecosistema (detectores basados en RoBERTa entrenados sobre HC3, entre otros), pero sus parametros, contexto, rendimiento y licencia no forman parte de la informacion disponible y no se reproducen aqui para no inventar datos.

| Modelo | Parametros | Contexto | Accuracy en HC3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hw1-hc3-detector | 22,7 M | 256 tokens | 0,9906 (test HC3) | no disponible | HuggingFace |
| all-MiniLM-L6-v2 (base) | 22,7 M | 256 tokens | no aplica (no es clasificador binario) | no disponible | HuggingFace |
| Otros detectores de texto IA | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos y artefactos del dataset: el propio autor advierte que el modelo se entreno sobre un benchmark de ChatGPT de 2022 con artefactos conocidos, lo que puede inflar la accuracy y reducir la generalizacion.
- Riesgo de alucinacion o clasificacion erronea: al ser un clasificador, el fallo se manifiesta como falsos positivos (texto humano etiquetado como IA) y falsos negativos (texto de IA etiquetado como humano), especialmente fuera del dominio de HC3.
- El autor indica explicitamente que no es un detector fiable para texto generado por IA actual ni para texto de estudiantes.
- Limitacion de dominio e idioma: fue entrenado sobre respuestas de HC3 en ingles; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Limitacion de contexto: la longitud maxima de entrada es de 256 tokens, insuficiente para documentos largos sin truncar o segmentar.
- Restricciones de licencia: la licencia no esta declarada en los metadatos del repositorio, por lo que no puede confirmarse el uso comercial y se recomienda contactar con el autor antes de cualquier despliegue en produccion.
- Adopcion practicamente nula: cero descargas y cero likes, sin mantenimiento documentado; el modelo tiene fecha de creacion y ultima actualizacion muy proximas entre si, lo que sugiere un ejercicio academico sin soporte posterior.
- No debe usarse como evidencia para acusar a personas de usar IA, dado su caracter experimental y su sensibilidad a artefactos del dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jainatharva21/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/Hello-SimpleAI/HC3
