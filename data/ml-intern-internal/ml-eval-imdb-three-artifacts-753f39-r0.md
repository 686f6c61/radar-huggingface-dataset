# ml-intern-internal/ml-eval-imdb-three-artifacts-753f39-r0

## Resumen

`ml-eval-imdb-three-artifacts-753f39-r0` es un repositorio de Hugging Face publicado por la organizacion `ml-intern-internal` que documenta un clasificador binario de sentimiento (NEGATIVE / POSITIVE) basado en `distilbert-base-uncased`, ajustado sobre el split de entrenamiento de `stanfordnlp/imdb` (25.000 resenas) y evaluado sobre su split de test (25.000 resenas). El modelo esta pensado como artefacto de un flujo de evaluacion automatizado gestionado por la herramienta ML Intern, no como un modelo listo para produccion.

El estado declarado en la model card es explicito: **el entrenamiento no se ha ejecutado**. El script `train.py` esta preparado y versionado (3 epocas, longitud maxima de secuencia de 512 tokens, logging a Trackio y push de pesos al repositorio), pero no habia compute remoto disponible en el momento de su preparacion. En consecuencia, no hay pesos subidos ni metricas de accuracy publicadas.

Su relevancia practica es, por tanto, la de una plantilla reproducible de fine-tuning de clasificacion de texto con DistilBERT, util para auditar el pipeline de evaluacion antes de lanzar el entrenamiento real. Cualquier uso como clasificador de sentimiento queda condicionado a que el autor complete la ejecucion y sustituya el README por la model card generada por el Trainer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT) |
| Parametros totales | no disponible en la informacion proporcionada (el modelo base `distilbert-base-uncased` ronda los 66 M, dato no confirmado en la ficha del autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia configurada en el entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el modelo base es `uncased` en ingles; el dataset IMDB es en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se han subido pesos; el script preve push de pesos, presumiblemente safetensors via Trainer, sin confirmar) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo DistilBERT, es decir, una version destilada de BERT con menos capas y parametros que el modelo original, entrenada originalmente con destilacion de conocimiento. Sobre esta base se anade una cabeza de clasificacion de secuencia con dos etiquetas (NEGATIVE / POSITIVE), que es la configuracion estandar de `AutoModelForSequenceClassification` para sentiment analysis binario.

El entrenamiento previsto en `train.py` consiste en un fine-tuning de 3 epocas sobre las 25.000 resenas de entrenamiento de `stanfordnlp/imdb`, con truncacion y padding a 512 tokens, logging de metricas en Trackio y publicacion de los pesos resultantes en el propio repositorio. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). Tampoco se especifican hiperparametros como learning rate, batch size o warmup, ni la composicion detallada del dataset mas alla del split utilizado.

## Capacidades

- Clasificacion binaria de sentimiento en resenas de cine (NEGATIVE / POSITIVE), una vez completado el entrenamiento.
- Procesamiento de textos de hasta 512 tokens por muestra; textos mas largos requieren truncacion.
- Entrada exclusivamente textual: no hay soporte de vision, audio ni multimodalidad.
- No dispone de tool calling ni function calling: es un modelo discriminativo, no generativo.
- No soporta agentes ni razonamiento multi-paso; emite una etiqueta por secuencia.
- Capacidad multilingue no disponible: el base es `uncased` y el dataset de entrenamiento esta en ingles.
- No incorpora modo "thinking", ni capacidades de generacion de texto libre.

## Casos de uso

- Clasificacion de resenas de productos o contenido audiovisual: el modelo asigna una etiqueta de polaridad a cada resena de hasta 512 tokens, adecuado para volumenes altos de texto corto y medio en ingles.
- Moderacion de opiniones en plataformas: filtrado previo de comentarios negativos para enrutarlos a atencion al cliente o a revision humana, con coste de inferencia bajo por ser un encoder pequeno.
- Analisis de sentimiento en encuestas abiertas: procesamiento por lotes de respuestas de texto libre para agregar polaridad a nivel de muestra.
- Etiquetado de datasets para entrenamiento posterior: uso del clasificador como anotador automatico en pipelines de weak supervision sobre resenas en ingles.
- Monitorizacion de reputacion de marca: extraccion de la proporcion de resenas negativas por producto o periodo a partir de feeds de opinion.
- Baseline en experimentos de NLP: punto de comparacion reproducible para evaluar tecnicas de fine-tuning, dado que el script de entrenamiento esta versionado y es auditable.
- Demo interactiva: la model card enlaza un Space (`ml-eval-imdb-three-artifacts-753f39-r0-demo`) para probar el clasificador, condicionado a que los pesos existan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no existen cifras de accuracy porque el entrenamiento no se ha ejecutado y que el README sera sustituido por la model card generada por el Trainer con la accuracy final de test cuando se complete la ejecucion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Para un encoder de tipo DistilBERT con 512 tokens de contexto, el requisito es del orden de unos pocos GB, pero no hay medicion publicada por el autor.
- GPU recomendadas: no disponible. El entrenamiento previsto (3 epocas sobre 25.000 muestras a 512 tokens) es viable en GPU consumer de gama media-alta, pero no se especifica en la ficha.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del base, sin confirmacion en la informacion disponible.
- Opciones de despliegue: no documentadas. Al ser un modelo de la familia Hugging Face Transformers, serian compatibles las rutas habituales (Transformers, ONNX Runtime, TGI para serving), pero ninguna aparece mencionada en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ml-intern-internal/ml-eval-imdb-three-artifacts-753f39-r0` | no disponible (base DistilBERT) | 512 tokens | Clasificacion binaria de sentimiento | no disponible | Pesos no subidos; solo script |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M (dato del base, no confirmado aqui) | 512 tokens | Clasificacion binaria de sentimiento | no disponible en esta ficha | Pesos publicados y ampliamente usado |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | no disponible en esta ficha | 512 tokens | Clasificacion de sentimiento (3 clases) | no disponible en esta ficha | Pesos publicados |
| `textattack/bert-base-uncased-imdb` | no disponible en esta ficha | 512 tokens | Clasificacion binaria sobre IMDB | no disponible en esta ficha | Pesos publicados |

La comparativa se limita a alternativas de la misma categoria (clasificadores de sentimiento basados en encoders); no se dispone de datos de rendimiento del modelo descrito para contrastar metricas.

## Limitaciones y advertencias

- El modelo no esta entrenado: no existen pesos ni metricas; cualquier uso en produccion es inviable en el estado actual del repositorio.
- Dominio restringido: entrenado (segun el diseno) solo sobre resenas de cine en ingles; el rendimiento fuera de ese dominio (redes sociales, resenas de producto, jerga) es desconocido.
- Sesgos conocidos: no documentados en la informacion disponible. El dataset IMDB puede contener sesgos de dominio y de distribucion de polaridad que se transferirian al clasificador.
- Riesgo de alucinacion: no aplica en sentido estricto (modelo discriminativo), pero si existe riesgo de clasificaciones erroneas con alta confianza en textos ambiguos, sarcasticos o fuera de distribucion.
- Limitacion de contexto: textos de mas de 512 tokens se truncan, lo que puede eliminar informacion decisiva para la polaridad.
- Idioma: no se declara soporte multilingue; el base `uncased` y el dataset estan en ingles.
- Licencia: no disponible, por lo que no puede confirmarse la viabilidad de uso comercial.
- Caveat de produccion: al ser un artefacto interno de evaluacion (`ml-intern-internal`), su mantenimiento y sustitucion por la version final no estan garantizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ml-intern-internal/ml-eval-imdb-three-artifacts-753f39-r0
- Script de entrenamiento: https://huggingface.co/ml-intern-internal/ml-eval-imdb-three-artifacts-753f39-r0/blob/main/train.py
- Demo Space: https://huggingface.co/spaces/ml-intern-internal/ml-eval-imdb-three-artifacts-753f39-r0-demo
- Dashboard de entrenamiento (Trackio): https://huggingface.co/spaces/GuillaumeSalouHF/imdb-sentiment-distilbert-trackio
- Dataset IMDB: https://huggingface.co/datasets/stanfordnlp/imdb
- Modelo base: https://huggingface.co/distilbert-base-uncased (referencia del base citado en la model card)
