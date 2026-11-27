# aleksbrstina/bertic-serbmr-sentiment

## Resumen

`aleksbrstina/bertic-serbmr-sentiment` es un modelo de clasificación de sentimiento binario (negativo / positivo) para serbio, obtenido mediante fine-tuning del encoder `classla/bcms-bertic` sobre el corpus SerbMR-2C de críticas cinematográficas (Batanović et al., 2016). Lo publica el usuario aleksbrstina y su relevancia radica en cubrir una tarea de PLN de recursos limitados —análisis de sentimiento en serbio— con un modelo pequeño y desplegable en CPU.

Arquitectura ELECTRA en configuración base, con 110,6 millones de parámetros totales y una ventana efectiva de 256 subtokens tras el truncamiento aplicado en el preprocesado. No es un modelo generativo ni conversacional: es un clasificador de secuencia que devuelve una etiqueta y una puntuación de confianza.

El modelo es de interés para equipos que necesiten un clasificador de sentimiento rápido, económico y con licencia Apache 2.0 para los pesos, aunque el corpus de entrenamiento (SerbMR) está bajo CC BY-NC-SA 4.0, lo que condiciona el uso comercial. La validación reportada por el autor es de 0,8749 de macro F1 y 0,8757 de accuracy sobre 169 reseñas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (encoder transformer, discriminador) |
| Parametros totales | 110.618.882 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 subtokens (truncamiento head+tail configurado en `sentiment_max_length`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes GGUF/ONNX) |
| Idiomas soportados | serbio (`sr`) |
| Licencia | apache-2.0 (pesos); datos de entrenamiento CC BY-NC-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ELECTRA base fine-tuneado desde `classla/bcms-bertic`, el encoder BERTić entrenado por el grupo CLASSLA sobre corpus de bosnio, croata, montenegrino y serbio. La cabeza de clasificación es una capa lineal sobre el token `[CLS]` con dos etiquetas (negativo / positivo). El preprocesado normaliza el texto (transliteración cirílico a latino, unificación de diacríticos y puntuación) y trunca las reseñas de más de 256 subtokens manteniendo cabeza y cola (`head_tail`), parámetros almacenados en `config.json` como `sentiment_max_length` y `sentiment_truncation`.

El entrenamiento usó learning rate 2e-05 con warmup lineal y decaimiento, 4 épocas con selección de la mejor (época 2) por pérdida de validación, y un tiempo total de 55,0 minutos en CPU. El conjunto de validación es un split estratificado 80/10/10 con semilla 42 sobre SerbMR-2C, con 169 reseñas de validación. No se documenta en la información disponible el uso de RLHF, DPO ni aumentación de datos.

## Capacidades

- Clasificación binaria de sentimiento (negativo / positivo) sobre texto en serbio.
- Salida de etiqueta y puntuación de confianza mediante `pipeline("text-classification")` de Transformers.
- Manejo de reseñas largas mediante truncamiento head+tail (primeros y últimos tokens), que preserva información del inicio y del cierre del texto.
- Normalización integrada en el flujo del proyecto: transliteración cirílico→latino y unificación de diacríticos y puntuación.
- Modelo encoder puro: no soporta generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- Multilingüismo limitado al serbio; el modelo base BERTić cubre también bosnio, croata y montenegrino, pero el fine-tuning está orientado a `sr`.

## Casos de uso

- Moderación y análisis de opiniones en foros y portales serbios: el clasificador procesa reseñas de hasta 256 subtokens y devuelve polaridad con una puntuación de confianza, suficiente para priorizar colas de revisión manual.
- Monitorización de reputación de marca: ingesta de comentarios de usuarios en serbio y agregación de la proporción de sentimiento negativo por producto o periodo, con inferencia en CPU a bajo coste.
- Análisis de reseñas de cine y streaming: caso de uso nativo del corpus SerbMR; permite etiquetar automáticamente críticas y alimentar sistemas de recomendación con señal de polaridad.
- Enriquecimiento de datasets de investigación en PLN de lenguas eslavas del sur: el modelo sirve como etiquetador débil para preanotar corpus y reducir el esfuerzo de anotación humana.
- Filtrado previo en pipelines de atención al cliente: clasificación rápida de tickets o mensajes en serbio para enrutar los negativos a agentes humanos y los positivos a respuestas automáticas.
- Detección de crisis reputacionales en redes sociales: procesamiento por lotes de menciones en serbio con umbral de confianza para disparar alertas cuando la proporción de negativos supera un valor definido.
- Baseline en experimentos académicos: referencia reproducible (macro F1 0,8749 en validación) para comparar nuevas aproximaciones de análisis de sentimiento en serbio.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Macro F1 | 0,8749 | Validación SerbMR-2C (169 reseñas) |
| Accuracy | 0,8757 | Validación SerbMR-2C (169 reseñas) |

El autor indica que los resultados de test se reportan en el repositorio del proyecto, pero no se incluyen en la información disponible. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos (110,6 M de parámetros), más activaciones; en la práctica cabe en cualquier GPU consumer con 2 GB o más.
- VRAM estimada en fp16: aproximadamente 0,22 GB de pesos; en int8, en torno a 0,11 GB.
- Inferencia en CPU viable: el propio autor entrenó el modelo en CPU en 55 minutos, lo que indica que la inferencia es ligera y apta para servidores sin GPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en RTX 3060, RTX 4090, T4, A10G, A100 o H100 sin aprovechar su capacidad.
- Despliegue: `transformers` con `pipeline("text-classification")`, o exportación a ONNX Runtime para latencias menores; también es posible servirlo con TorchServe o FastAPI. No se documentan variantes GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en CPU y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aleksbrstina/bertic-serbmr-sentiment | 110,6 M | 256 subtokens | Sentimiento binario en serbio | apache-2.0 (pesos); datos CC BY-NC-SA 4.0 | Hugging Face |
| classla/bcms-bertic | no disponible en la información | no disponible en la información | Encoder base BERTić (bosnio, croata, montenegrino, serbio) | no disponible en la información | Hugging Face |
| Otros clasificadores de sentimiento en serbio | no disponible | no disponible | Clasificación de sentimiento | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Dominio restringido: entrenado sobre críticas cinematográficas; el rendimiento puede degradarse en otros géneros textuales (redes sociales, atención al cliente, prensa) por cambio de distribución.
- Clasificación binaria: no distingue intensidad del sentimiento ni categorías neutras; fuerza toda entrada a negativo o positivo.
- Sesgos no documentados: no se publica análisis de sesgos por género, origen o tema; el corpus SerbMR puede arrastrar sesgos de la selección de películas y críticos.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas con alta confianza en textos ambiguos, irónicos o con negación compleja.
- Limitación de longitud: textos de más de 256 subtokens se truncan; el uso del pipeline estándar trunca solo por el final y puede desviarse del preprocesado de entrenamiento (head+tail), degradando resultados si no se usa el `TransformerPredictor` del proyecto.
- Restricción de licencia para uso comercial: aunque los pesos son Apache 2.0, el corpus SerbMR está bajo CC BY-NC-SA 4.0 (uso no comercial), lo que genera incertidumbre jurídica sobre el uso comercial del modelo derivado; conviene revisar con asesoría legal antes de producción.
- Idiomas: solo serbio; no se garantiza comportamiento en bosnio, croata o montenegrino pese a la cobertura del modelo base.
- Métricas sobre muestra pequeña: la validación se realizó sobre 169 reseñas, por lo que los intervalos de confianza de las métricas son amplios.
- Sin mantenimiento documentado: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de soporte activo ni de versiones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aleksbrstina/bertic-serbmr-sentiment
- Modelo base BERTić: https://huggingface.co/classla/bcms-bertic
- Artículo del corpus SerbMR: Batanović, Nikolić, Milosavljević (2016), *Reliable Baselines for Sentiment Analysis in Resource-Limited Languages: The Serbian Movie Review Dataset*, LREC 2016 (referencia citada en la model card; sin URL directa en la información disponible).
