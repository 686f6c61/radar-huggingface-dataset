# get2rayan/smartsavor-intent-distilbert

## Resumen

SmartSavor Intent DistilBERT es un clasificador de intenciones en ingles obtenido mediante fine-tuning de `distilbert-base-uncased` sobre un conjunto de 300 prompts etiquetados manualmente. Lo desarrolla el usuario de Hugging Face get2rayan y su funcion es enrutar peticiones de usuario dentro de una aplicacion culinaria hacia tres categorias: busqueda de recetas (`recipe_lookup`), asistencia culinaria (`culinary_assistance`) y peticiones fuera de dominio (`out_of_scope`). No genera texto: devuelve una etiqueta y una puntuacion softmax.

El modelo es deliberadamente pequeno (66.955.779 parametros, unos 0,3 GB en safetensors) y esta pensado como componente de enrutamiento previo a un LLM generativo, no como sustituto de este. Su interes practico esta en el coste de inferencia: al ser un encoder de 6 capas puede ejecutarse en CPU con latencias de milisegundos, lo que permite filtrar y clasificar cada turno de conversacion antes de invocar un modelo mayor.

La relevancia es limitada por su alcance: el conjunto de entrenamiento es muy reducido (240 ejemplos de entrenamiento y 60 de evaluacion) y la particion de evaluacion se uso tambien para seleccionar el checkpoint, por lo que las metricas publicadas no constituyen una estimacion independiente de generalizacion. La model card lo advierte explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (truncado en el tokenizador) |
| Tipos de cuantizacion | no disponible (entrenado y guardado en float32; admite cuantizacion dinamica de PyTorch, pero no se documenta) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT: un transformer encoder de 6 capas y 66,9 M de parametros obtenido por destilacion de BERT-base, con tokenizador WordPiece uncased y vocabulario de aproximadamente 30.500 tokens. Sobre esta base se anadio una cabeza de clasificacion de secuencia con tres salidas (`recipe_lookup`, `culinary_assistance`, `out_of_scope`), sustituyendo la cabeza original de enmascaramiento de lenguaje.

El entrenamiento se realizo sobre 300 prompts en ingles divididos de forma estratificada en 240 de entrenamiento y 60 de evaluacion (`test_size=0.2`, `random_state=42`). Hiperparametros: 3 epocas, learning rate 2e-5, batch size 10 por dispositivo (entrenamiento y evaluacion), weight decay 0,01, precision float32 y seleccion del mejor checkpoint por accuracy de evaluacion. No se documenta el numero total de tokens vistos, la composicion del dataset ni si hubo aumento de datos. No se menciona RLHF, DPO ni ninguna tecnica de alineacion, lo cual es coherente con una tarea de clasificacion supervisada. Tampoco se registran duracion de entrenamiento, coste de computo ni impacto energetico.

## Capacidades

- Clasificacion de texto en tres clases cerradas: `recipe_lookup`, `culinary_assistance` y `out_of_scope`.
- Salida de logits y probabilidades softmax por clase, utiles para aplicar umbrales de confianza.
- Procesamiento de prompts de hasta 512 tokens con truncado automatico.
- Inferencia muy ligera: viable en CPU y en GPU de gama baja.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No genera texto, recetas ni respuestas: solo etiqueta.
- Monolingue en ingles; no se ha entrenado ni evaluado en otros idiomas.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Enrutamiento previo a un LLM en un chatbot de cocina: cada prompt entrante se clasifica y, segun la etiqueta, se dirige a un prompt de sistema especializado (recomendacion de recetas, ayuda tecnica de cocina) o a una respuesta de rechazo para `out_of_scope`. El coste por peticion es minimo frente a invocar directamente el modelo generativo.
- Filtrado de peticiones fuera de dominio: bloquear consultas ajenas al ambito alimentario antes de consumir cuota de un modelo mayor, reduciendo coste y superficie de abuso.
- Analitica de producto: clasificar en lote los logs de conversacion para medir la distribucion de intenciones de los usuarios y detectar que porcentaje de consultas cae en `out_of_scope`, lo que orienta la hoja de ruta del producto.
- Enrutamiento en aplicaciones moviles o edge: al ocupar unos 0,3 GB y ejecutarse en CPU, puede integrarse en el propio dispositivo para decidir si la consulta merece una llamada a red.
- Etiquetado asistido de datos: preetiquetar nuevos prompts para revision humana y ampliar el conjunto de entrenamiento, con umbral de confianza para derivar los casos dudosos a anotacion manual.
- Control de calidad en pipelines de retrieval: usar la etiqueta como metadato para seleccionar el indice o la coleccion documental adecuada (recetas frente a tecnicas culinarias) antes de la busqueda semantica.
- Segmentacion de conversaciones multi-turno: clasificar cada turno para decidir cambios de flujo dentro de un asistente de cocina guiado.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre la particion de evaluacion de 60 ejemplos (20 por clase). Advertencia del autor: esta misma particion se uso para seleccionar el checkpoint, por lo que no es un test independiente.

| Etiqueta | Precision | Recall | F1 | Soporte |
|---|---:|---:|---:|---:|
| `recipe_lookup` | 1,00 | 1,00 | 1,00 | 20 |
| `culinary_assistance` | 1,00 | 1,00 | 1,00 | 20 |
| `out_of_scope` | 1,00 | 1,00 | 1,00 | 20 |
| **Accuracy global** |  |  | **1,00** | **60** |

No se han publicado resultados en benchmarks estandar (MMLU, GLUE, SuperGLUE u otros) en la informacion disponible. Las cifras perfectas deben interpretarse con cautela por el tamano de la muestra y la fuga entre seleccion de checkpoint y evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,27 GB para los pesos, mas activaciones; en la practica cabe en cualquier GPU con 1 GB o mas.
- En float16: aproximadamente 0,14 GB de pesos.
- GPU recomendadas: cualquier GPU moderna; no requiere A100 ni H100. Funciona en T4, L4, RTX 3060, RTX 4090 y similares, aunque esta sobredimensionada para ellas.
- Cabe holgadamente en GPU de consumo e incluso en CPU: es el escenario de despliegue natural.
- Opciones de despliegue: `transformers` con PyTorch, `text-embeddings-inference` (segun los tags del repositorio), ONNX Runtime, TorchScript, y exportacion a GGUF para llama.cpp aunque no se documenta oficialmente. Tambien es compatible con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de un digito de milisegundos por peticion en CPU moderna y throughput de miles de peticiones por segundo en GPU con batching, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| get2rayan/smartsavor-intent-distilbert | 66,9 M | 512 | en | Apache-2.0 | 3 clases de dominio culinario; dataset de 300 ejemplos |
| distilbert-base-uncased (base) | 66,9 M | 512 | en | Apache-2.0 | Modelo general preentrenado; requiere fine-tuning para clasificar |
| bert-base-uncased | 110 M | 512 | en | Apache-2.0 | Mayor capacidad, mayor coste de inferencia; requiere fine-tuning |
| MiniLM-L6 (p. ej. all-MiniLM-L6-v2) | ~22 M | 512 | en | Apache-2.0 | Alternativa mas ligera para clasificacion y embeddings, requiere fine-tuning |

No se dispone de comparaciones de rendimiento con otros clasificadores de intencion en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset minimo: 300 prompts en total, 240 de entrenamiento. La cobertura de vocabulario, estilos y casos limite es muy reducida.
- Evaluacion no independiente: la particion de 60 ejemplos se uso para seleccionar el checkpoint, por lo que el accuracy de 1,00 no estima la generalizacion real.
- Clasificacion forzada: el modelo siempre devuelve una de las tres etiquetas, incluso ante entradas ambiguas o desconocidas. Es imprescindible un umbral de confianza y un fallback.
- Probabilidades no calibradas: los valores softmax son estimaciones de confianza del modelo, no probabilidades calibradas.
- Solo ingles: no se ha entrenado ni evaluado en castellano ni en otros idiomas; su uso fuera del ingles no esta soportado.
- Dominio estrecho: cualquier aplicacion fuera del ambito culinario queda fuera de alcance.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea silenciosa en produccion.
- Sin evaluacion de sesgos por subgrupos: no se realizo analisis demografico ni de equidad.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; conviene conservar el aviso de licencia y el de la model card.
- No usar como base unica para decisiones criticas o de alto impacto, segun indica el propio autor.
- No se documenta el dataset de entrenamiento ni se publica, lo que dificulta auditar su procedencia y posibles sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/get2rayan/smartsavor-intent-distilbert
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (arXiv:1910.01108): https://arxiv.org/abs/1910.01108
- Documentacion de DistilBERT en transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
