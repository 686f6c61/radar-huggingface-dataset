# BhandariShivam/gpt2-IMDB-sentiment-classifier

## Resumen

El modelo `BhandariShivam/gpt2-IMDB-sentiment-classifier` es un clasificador de sentimiento binario (positivo/negativo) basado en GPT-2, la arquitectura transformer decoder de OpenAI, fine-tuneado sobre el dataset de reseñas de películas IMDB. El autor, BhandariShivam, publica este modelo en Hugging Face con el pipeline de `text-classification`, lo que lo hace directamente utilizable con la librería `transformers` para tareas de análisis de opinión.

Con 124.441.344 parámetros (equivalente a la configuración "small" de GPT-2), el modelo ofrece un tamaño reducido que permite su ejecución en hardware modesto, incluida la inferencia en CPU. La ficha del modelo en Hugging Face es mínima: no incluye información sobre el proceso de entrenamiento, hiperparámetros, licencia ni idiomas soportados, aunque por la base GPT-2 y el dataset IMDB se asume un enfoque monolingüe en inglés. A pesar de la falta de documentación, su integración con el ecosistema `transformers` y su formato `safetensors` facilitan su uso en entornos de producción ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder, 12 capas, 12 cabezas de atencion, dimension oculta 768) |
| Parametros totales | 124.441.344 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (heredado de GPT-2 small) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32 o FP16) |
| Idiomas soportados | no disponible (se asume ingles por GPT-2 base y dataset IMDB) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre GPT-2 small, un transformer decoder autoregresivo con 12 capas, 12 cabezas de atencion, dimension de embedding de 768 y una ventana de contexto de 1024 tokens. Para la clasificacion de sentimiento, se reemplaza la cabeza de lenguaje por una capa de clasificacion binaria, y el modelo se fine-tunea sobre el dataset IMDB, que contiene 25.000 reseñas de peliculas etiquetadas como positivas o negativas para entrenamiento y otras 25.000 para evaluacion.

No se proporcionan detalles sobre el procedimiento de entrenamiento: ni el numero de epocas, ni la tasa de aprendizaje, ni el regimen de precision (FP32, FP16, etc.). Tampoco se indica si se aplicaron tecnicas de regularizacion o aumento de datos. La ausencia de esta informacion en la model card limita la reproducibilidad, aunque el uso de GPT-2 como base y el dataset IMDB estandar sugieren un flujo de fine-tuning convencional con la API de `transformers`.

## Capacidades

- Clasificacion de sentimiento binario: distingue entre reseñas positivas y negativas, devolviendo una probabilidad para cada clase.
- Analisis de opinion en texto en ingles: adecuado para reseñas de peliculas y, por extension, otros dominios con vocabulario similar.
- Integracion con el ecosistema Hugging Face: usa la interfaz `pipeline("text-classification")`, lo que permite un despliegue rapido.
- Inferencia ligera: al ser un modelo de 124M de parametros, es ejecutable en CPU y en GPUs de baja gama.
- Compatible con `endpoints_compatible` (segun los tags), lo que permite su despliegue en Inference Endpoints de Hugging Face sin configuracion adicional.
- No soporta generacion de texto ni funciones de agente: es un modelo discriminativo, no generativo.

## Casos de uso

- Analisis de sentimiento en reseñas de productos: se puede integrar en un pipeline de scraping de opiniones para clasificar automaticamente comentarios de clientes en positivos o negativos, ayudando a medir la satisfaccion general.
- Moderacion de comentarios en foros o redes sociales: el modelo puede filtrar mensajes con tono negativo antes de su publicacion, reduciendo la carga de moderadores humanos.
- Monitorizacion de marca: procesar menciones en redes sociales o articulos de noticias para detectar cambios en la percepcion publica de una empresa o producto.
- Clasificacion de tickets de soporte: priorizar quejas o solicitudes con sentimiento negativo para atenderlas con mayor urgencia.
- Investigacion academica en PLN: servir como modelo base para experimentos de fine-tuning o como punto de comparacion con otros clasificadores de sentimiento de tamano similar.
- Prototipado rapido de aplicaciones de analisis de opinion: gracias a su ejecucion en CPU, es util en entornos de desarrollo o en dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este modelo concreto. La model card no incluye metricas de evaluacion. En la busqueda web se encontro un modelo homonimo de otro autor (`mnoukhov/gpt2-imdb-sentiment-classifier`) que reporta una accuracy de 0.9394 y una loss de 0.1703 sobre el conjunto de evaluacion de IMDB, pero esos datos no pueden atribuirse a este modelo, ya que no se confirma que sean el mismo checkpoint. Por tanto, se recomienda evaluar el modelo localmente antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada: con 124M de parametros en FP32, el modelo ocupa aproximadamente 500 MB en memoria. En FP16, unos 250 MB. Una GPU con 2 GB de VRAM es suficiente para inferencia en lotes pequenos.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, o superiores) permite una inferencia muy rapida. Tambien es viable en CPU con un rendimiento aceptable (decenas de ms por secuencia).
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: se puede servir con la libreria `transformers` directamente, o mediante `text-generation-inference` (TGI) y `Inference Endpoints` de Hugging Face, dado el tag `endpoints_compatible`. No se conocen adaptaciones GGUF o de `llama.cpp` para este modelo especifico.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU como una T4, se espera una latencia por secuencia de pocos milisegundos y un throughput de cientos de secuencias por segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Accuracy (IMDB eval) | Licencia |
|---|---|---|---|---|---|
| BhandariShivam/gpt2-IMDB-sentiment-classifier | GPT-2 fine-tuned | 124M | 1024 | no disponible | no disponible |
| mnoukhov/gpt2-imdb-sentiment-classifier | GPT-2 fine-tuned | 124M | 1024 | 0.9394 | MIT |
| distilbert-imdb (referencia) | DistilBERT fine-tuned | 66M | 512 | ~0.93 (segun fuentes no oficiales) | no disponible |

La comparativa se basa en modelos de tamano similar para la misma tarea. El modelo de mnoukhov es practicamente identico en arquitectura y ha publicado metricas, mientras que el de BhandariShivam carece de datos. DistilBERT es una alternativa mas ligera con menor contexto (512 tokens) y rendimiento comparable en IMDB. No se dispone de mas modelos de referencia con datos verificables.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo fine-tuneado sobre reseñas de IMDB, puede reflejar sesgos presentes en ese corpus (por ejemplo, preferencia por ciertos generos cinematograficos o estilos de escritura). No se ha evaluado su comportamiento en dominios fuera de reseñas de peliculas.
- Riesgo de sobreajuste: sin informacion sobre la regularizacion ni el numero de epocas, existe la posibilidad de que el modelo este sobreajustado al dataset IMDB y generalice mal a otros tipos de texto.
- Limitaciones de idioma: aunque no se especifica, GPT-2 base esta entrenado principalmente en ingles. El modelo puede tener un rendimiento muy pobre en otros idiomas.
- Contexto limitado: la ventana de 1024 tokens es suficiente para reseñas cortas, pero fallara en documentos largos que requieran analisis global.
- Licencia no definida: al no indicarse la licencia, no es seguro su uso comercial sin consultar al autor. Se recomienda contactar con BhandariShivam antes de integrarlo en un producto.
- Documentacion insuficiente: la model card no proporciona detalles de entrenamiento ni evaluacion, lo que dificulta la confianza en su rendimiento y reproducibilidad.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/BhandariShivam/gpt2-IMDB-sentiment-classifier
- Referencia del modelo similar con metricas publicadas: https://huggingface.co/mnoukhov/gpt2-imdb-sentiment-classifier
- Paper de GPT-2 (Radford et al., 2019): https://arxiv.org/abs/1910.09700 (citado en la model card como referencia de calculo de emisiones)
