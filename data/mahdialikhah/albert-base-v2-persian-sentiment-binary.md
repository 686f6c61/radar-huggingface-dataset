# MahdiAlikhah/albert-base-v2-persian-sentiment-binary

## Resumen

`albert-base-v2-persian-sentiment-binary` es un clasificador binario de sentimiento (negativo/positivo) para texto en persa, desarrollado por MahdiAlikhah. Se construye anadiendo una cabeza de clasificacion de secuencias a un checkpoint ALBERT-base preentrenado en persa (`shekar-ai/albert-base-v2-persian-zwnj-naab-mlm`) y afinandolo sobre una combinacion de dos corpus de resenas: DeepSentiPers (resenas de productos de Digikala) y Snappfood (resenas de reparto de comida).

El modelo resuelve una tarea concreta y acotada: asignar una de dos etiquetas a una frase o parrafo corto en persa. No es un modelo generativo ni un LLM conversacional; es un encoder de 11,9 millones de parametros con una cabeza lineal de dos clases, lo que lo hace extremadamente ligero y apto para inferencia de baja latencia en CPU o GPU modesta.

Su relevancia practica reside en la escasez de clasificadores de sentimiento en persa con licencia permisiva y pesos abiertos en safetensors, listos para `transformers`. El contexto efectivo esta limitado por la arquitectura ALBERT-base (512 tokens posicionales), aunque el uso previsto es a nivel de frase o pasaje corto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ALBERT-base (transformer encoder) con cabeza de clasificacion de secuencias (2 clases) |
| Parametros totales | 11.941.634 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo posicional de ALBERT-base; no confirmado explicitamente en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | persa (fa) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ALBERT-base es un transformer encoder con factorizacion de embeddings y comparticion de parametros entre capas, lo que explica su reducido numero de parametros (11,9 M) frente a un BERT-base convencional. Sobre el checkpoint MLM persa se anade una cabeza lineal de clasificacion con dos salidas (negativo/positivo).

El entrenamiento parte de dos fuentes. DeepSentiPers aporta aproximadamente 2.500 filas tras colapsar las etiquetas de polaridad de 5 puntos (-2/-1 a negativo, +1/+2 a positivo) y descartar las neutras (0), con split estratificado 80/10/10. Snappfood aporta aproximadamente 52.000 filas de entrenamiento con etiquetas HAPPY/SAD mapeadas directamente a positivo/negativo, usando sus splits originales. Ambos conjuntos se combinan para entrenamiento y validacion, mientras que la evaluacion se mantiene separada por fuente. Se eliminaron las filas de entrenamiento que solapaban literalmente con cualquiera de los dos conjuntos de test. El preprocesado incluye normalizacion de texto con el `Normalizer` de hazm (normalizacion del medio espacio o ZWNJ persa). No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un encoder de clasificacion.

## Capacidades

- Clasificacion binaria de sentimiento (negativo/positivo) a nivel de frase o pasaje corto en persa.
- Especializado en texto de resenas de producto (e-commerce) y de reparto de comida.
- Salida directa de logits y etiqueta via `AutoModelForSequenceClassification` con `id2label`.
- Compatible con el pipeline `text-classification` de `transformers` y con endpoints de inferencia (tag `endpoints_compatible`).
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No soporta vision, audio ni modo de razonamiento (thinking).
- No multilingue: solo persa; no se ha evaluado con texto mixto.

## Casos de uso

- Moderacion y triaje de resenas en plataformas de e-commerce persas: clasificar automaticamente resenas de producto como negativas o positivas para enrutar las negativas a atencion al cliente, aprovechando el ajuste sobre DeepSentiPers (dominio Digikala).
- Analisis de satisfaccion en apps de reparto de comida: procesar resenas de pedidos y agregar la polaridad por restaurante o repartidor, dado el ajuste sobre Snappfood (~52k filas de entrenamiento).
- Enrutamiento en sistemas de ticketing: etiquetar mensajes entrantes de clientes persas por polaridad para priorizar incidencias negativas antes de la revision humana.
- Monitorizacion de opinion en paneles de analitica: calcular la proporcion de resenas positivas por producto o periodo mediante inferencia por lotes, gracias al reducido coste computacional del modelo (11,9 M de parametros).
- Filtrado previo en pipelines de etiquetado: usar el modelo como preetiquetador para reducir el esfuerzo de anotacion manual en nuevos corpus de resenas persas, con revision humana posterior.
- Clasificacion en tiempo real en el borde o en CPU: por su tamano, puede desplegarse en contenedores ligeros o funciones serverless para clasificar cada resena en el momento de su publicacion, sin GPU.
- Deteccion de alertas de calidad: marcar resenas negativas recurrentes sobre un mismo producto como senal temprana de problemas de calidad o logistica.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados por separado en cada conjunto de test:

| Conjunto de test | Ejemplos | Accuracy | Macro-F1 |
|---|---|---|---|
| Snappfood | 9.033 | 87,27 % | 0,873 |
| DeepSentiPers | 316 (54 negativos) | 93,99 % | 0,890 |

Nota: el test de DeepSentiPers es pequeno y con muy pocos negativos, por lo que su cifra tiene mayor varianza de muestreo y debe tratarse como estimacion aproximada. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (11,9 M de parametros, ~48 MB de pesos) mas el overhead del runtime; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencia baja para clasificacion de frases cortas. Cualquier GPU consumer (GTX 1060 o superior, RTX 3060, RTX 4090) es mas que suficiente.
- Cabe en GPU consumer: si, en todas las gamas, e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, pipeline `text-classification`, y endpoints de inferencia (tag `endpoints_compatible`). No se documentan variantes GGUF para llama.cpp/Ollama ni configuraciones para vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. A modo de referencia estructural, se puede contrastar con:

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| albert-base-v2-persian-sentiment-binary | 11,9 M | 512 tokens | fa | Apache-2.0 | safetensors |
| shekar-ai/albert-base-v2-persian-zwnj-naab-mlm (modelo base) | no disponible | no disponible | fa | MIT (segun la model card) | no disponible |
| Alternativas de clasificacion de sentimiento en persa | no disponible | no disponible | fa | no disponible | no disponible |

No se han identificado en la informacion disponible otros clasificadores binarios de sentimiento en persa con los que comparar metricas de forma directa.

## Limitaciones y advertencias

- Fuerte desbalance de dominios en el entrenamiento: Snappfood (~52k filas) frente a DeepSentiPers (~2,5k), por lo que el comportamiento del modelo esta desproporcionadamente influido por el estilo y dominio de resenas de reparto de comida.
- Sesgo leve hacia la infraprediccion de sentimiento positivo en Snappfood (mas falsos negativos que falsos positivos), coherente con resenas tibias o ambiguas bajo una etiqueta binaria estricta.
- No detecta sentimiento neutro ni mixto: los ejemplos neutros se excluyeron del entrenamiento, por lo que cualquier entrada neutra o ambivalente se fuerza a una de las dos clases.
- No evaluado en dominios alejados de resenas de producto o comida (redes sociales, noticias, escritura formal); el rendimiento puede degradarse de forma significativa.
- Solo persa; no disenado para texto multilingue ni mixto.
- La cifra de accuracy en DeepSentiPers (93,99 %) procede de un test de 316 ejemplos con solo 54 negativos y debe tratarse como aproximada.
- No apto como unica senal para decisiones de alto impacto sin revision humana.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base es MIT (permite sublicenciar), segun indica la model card; conviene verificar los terminos del checkpoint base antes de un despliegue en produccion.
- Validar siempre el rendimiento en el dominio propio antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MahdiAlikhah/albert-base-v2-persian-sentiment-binary
- Modelo base: https://huggingface.co/shekar-ai/albert-base-v2-persian-zwnj-naab-mlm
- DeepSentiPers (repositorio): https://github.com/JoyeBright/DeepSentiPers
- Snappfood (dataset en Hugging Face Hub): https://huggingface.co/datasets/PNLPhub/snappfood-sentiment-analysis
