# kgedt/kazakh-profanity-xlmr

## Resumen

Kazakh-profanity-xlmr es un clasificador binario de texto especializado en la detección de lenguaje obsceno en kazajo, desarrollado por el usuario kgedt como proyecto academico (DSSC5113). Se trata de un fine-tuning de `FacebookAI/xlm-roberta-base`, un transformer encoder multilingue de 278 millones de parametros, adaptado a la tarea de moderacion de contenido sobre resenas y comentarios de productos escritos en kazajo, con mezcla frecuente de ruso y alfabetos cirilico y latino.

El modelo resuelve un problema concreto y poco cubierto: la moderacion automatica de contenido en kazajo, un idioma de bajos recursos para el que existen pocos filtros de toxicidad funcionales. Devuelve una probabilidad de que el texto contenga obscenidad (etiqueta 1) o no (etiqueta 0), con un umbral de decision calibrado en validacion de 0,8216 y una longitud maxima de 128 tokens. Su relevancia radica en que cubre codigo mixto kazajo-ruso, habitual en plataformas de resenas de la region, y en que publica metricas de evaluacion explicitas junto con el codigo y las reglas de etiquetado.

El modelo es pequeno, ligero y desplegable en CPU o GPU consumer, lo que lo hace adecuado para filtrado previo en pipelines de moderacion a gran escala. No obstante, su evaluacion se apoya en un conjunto de test reducido (271 resenas etiquetadas por un unico anotador) y en un stream de datos sesgado hacia resenas de tiendas de aplicaciones, lo que limita la confianza en su generalizacion a otros dominios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) para clasificacion de secuencias |
| Parametros totales | 278.045.186 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (maximo de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion dinamica via PyTorch/ONNX) |
| Idiomas soportados | kazajo (kk), ruso (ru); texto mixto kk-ru en cirilico o latin |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `xlm-roberta-base`, un transformer encoder de 12 capas y 278 millones de parametros preentrenado de forma multilingue sobre 100 idiomas con un vocabulario SentencePiece de 250.000 tokens. Sobre esa base se anade una cabeza de clasificacion de secuencias con dos etiquetas (sin obscenidad / con obscenidad) y se realiza un fine-tuning supervisado sobre resenas del corpus KazSAnDRA (Yeshpanov y Varol, arXiv:2403.19335), etiquetadas manualmente segun reglas de anotacion publicadas en el repositorio del autor.

No se dispone de informacion sobre el numero exacto de ejemplos de entrenamiento, la composicion del dataset de fine-tuning, hiperparametros (learning rate, epochs, batch size) ni sobre el uso de tecnicas como RLHF o DPO, que no aplican a un clasificador de este tipo. La innovacion tecnica destacable es metodologica mas que arquitectonica: el autor calibra el umbral de decision sobre el conjunto de validacion (0,8216) y reporta tanto metricas sobre el test balanceado como metricas ponderadas al stream real de resenas, lo que da una idea mas honesta del rendimiento en produccion.

## Capacidades

- Clasificacion binaria de texto: devuelve una probabilidad de presencia de obscenidad (etiqueta 1) frente a ausencia (etiqueta 0).
- Deteccion en texto mixto kazajo-ruso, incluyendo cambios de alfabeto entre cirilico y latin dentro del mismo documento.
- Procesamiento de resenas y comentarios cortos de producto o de tienda de aplicaciones, dominio principal de entrenamiento.
- Manejo de texto truncado a 128 tokens, suficiente para resenas y comentarios tipicos.
- Inferencia por lotes mediante `AutoTokenizer` y `AutoModelForSequenceClassification` de la libreria transformers.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo thinking: es un clasificador, no un modelo generativo.
- Capacidad multilingue limitada a los dos idiomas declarados (kk, ru); no se ha evaluado su comportamiento en otros idiomas.

## Casos de uso

- Moderacion de resenas en plataformas de e-commerce: el modelo filtra comentarios de producto en kazajo y ruso antes de su publicacion, usando el umbral calibrado de 0,8216 para decidir si un texto pasa a revision humana o se bloquea automaticamente.
- Filtrado previo en tiendas de aplicaciones: dado que el corpus de entrenamiento procede principalmente de resenas de app stores, es el escenario mas alineado con los datos; se usaria como primera capa de un pipeline de moderacion de comentarios de usuarios.
- Triaje en sistemas de atencion al cliente: clasificar mensajes entrantes de usuarios kazajoparlantes para derivar los que contienen insultos a un equipo de soporte especializado, evitando que lleguen a agentes automaticos.
- Moderacion de foros y comunidades online: integrado como microservicio que consume textos por lotes y devuelve probabilidades, permitiendo umbrales distintos segun la politica de la comunidad.
- Analisis de toxicidad en datasets de investigacion: etiquetar automaticamente grandes volumenes de resenas kazajas para estudios de lenguaje abusivo, con revision manual de los casos cercanos al umbral.
- Filtrado de datos de entrenamiento: descartar ejemplos obscenos de corpus kazajos antes de usarlos en el preentrenamiento o fine-tuning de modelos generativos, reduciendo el riesgo de que el modelo final reproduzca lenguaje ofensivo.
- Enrutado en pipelines de NLP multilingues: como componente de un sistema mayor que detecte el idioma y derive el texto al filtro correspondiente (kazajo/ruso a este modelo, otros idiomas a clasificadores especificos).

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Precision | 0,962 | Test, 271 resenas etiquetadas a mano |
| Recall | 0,962 | Test, 271 resenas etiquetadas a mano |
| F1 | 0,962 | Test, 271 resenas etiquetadas a mano |
| F1 ponderado al stream real | 0,890 | Test ponderado a la distribucion real de resenas |
| Umbral de decision | 0,8216 | Seleccionado en validacion |

No se han publicado comparaciones con otros modelos de moderacion en kazajo en la informacion disponible, ni resultados en benchmarks estandar (MMLU, GLUE, etc.), que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB para los pesos (278 M de parametros) mas overhead de activaciones, en torno a 1,5-2 GB en total.
- VRAM estimada con cuantizacion dinamica int8: aproximadamente 300-400 MB de pesos, con un consumo total inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona correctamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin aprovechar su capacidad completa.
- Cabe en GPU consumer y tambien en CPU: al ser un encoder de 278 M de parametros, la inferencia en CPU es viable para lotes moderados.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (el tag `text-embeddings-inference` y `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints), exportacion a ONNX Runtime para CPU, y servidores de inferencia ligeros. No se ha verificado compatibilidad con vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Tarea | Licencia |
|---|---|---|---|---|---|
| kgedt/kazakh-profanity-xlmr | 278 M | 128 tokens | kk, ru | Clasificacion de obscenidad | CC BY 4.0 |
| xlm-roberta-base (modelo base) | 278 M | 512 tokens | 100 idiomas | Representaciones multilingues (sin cabeza de clasificacion) | MIT |
| mDeBERTa-v3-base | ~278 M | 512 tokens | 100 idiomas | Clasificacion multilingue generica | MIT |

No se dispone de informacion sobre otros clasificadores de toxicidad especificos para kazajo con los que comparar directamente. Frente a su modelo base, este fine-tuning anade la cabeza de clasificacion y el umbral calibrado, pero reduce la longitud de contexto efectiva a 128 tokens. Frente a alternativas multilingues genericas como mDeBERTa-v3-base, la ventaja es la especializacion en el dominio y el idioma, aunque no hay datos que permitan cuantificar la diferencia de rendimiento.

## Limitaciones y advertencias

- Un unico anotador para todo el conjunto de datos: no hay medida de acuerdo entre anotadores, lo que impide estimar la fiabilidad del etiquetado.
- Conjunto de test pequeno (271 resenas), lo que produce intervalos de confianza amplios en las metricas reportadas; el F1 de 0,962 no debe interpretarse como un rendimiento estable en produccion.
- Sesgo de dominio: casi todos los ejemplos obscenos proceden de resenas de tiendas de aplicaciones, por lo que el rendimiento puede degradarse en otros generos (foros, chat, redes sociales, correo).
- Los emojis como el dedo medio son tokens desconocidos para el tokenizer de XLM-R, de modo que el modelo no puede detectar obscenidad expresada unicamente mediante emojis.
- Longitud maxima de 128 tokens: los textos mas largos se truncan y el contenido ofensivo situado al final puede pasar desapercibido.
- Riesgo de falsos positivos en usos no ofensivos de palabras malsonantes (citas, discurso reportado, humor) y de falsos negativos en insultos ofuscados con sustituciones de caracteres.
- Cobertura limitada a kazajo y ruso; no se ha evaluado en otros idiomas ni en variedades dialectales.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero no se ofrece garantia alguna sobre el modelo; el autor no asume responsabilidad por decisiones de moderacion automatizadas.
- Para produccion se recomienda combinar el modelo con revision humana en los casos cercanos al umbral y monitorizar la deriva del dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kgedt/kazakh-profanity-xlmr
- Paper del corpus fuente (KazSAnDRA): https://arxiv.org/abs/2403.19335
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Repositorio con codigo, datos, reglas de etiquetado y evaluacion completa: no disponible como URL directa en la informacion proporcionada (el autor lo referencia en la model card)
