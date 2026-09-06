# manuelraileanu/ro-political-fake-news-v2

## Resumen

`manuelraileanu/ro-political-fake-news-v2` es un modelo de clasificación de texto en rumano, desarrollado por manuelraileanu, que puntúa la veracidad de afirmaciones en un rango continuo de 0 a 100. El valor 0 indica contenido factual y verificable, 50 señala afirmaciones cuestionables o exageradas, y 100 corresponde a desinformación manifiesta o teorías conspirativas. Está pensado para detectar noticias falsas y desinformación en el ámbito político rumano, con especial atención al periodo electoral de 2024-2025.

La arquitectura parte de un modelo BERT base rumano con caja (`dumitrescustefan/bert-base-romanian-cased-v1`) y añade una única cabeza de regresión. El modelo tiene 124.442.113 parámetros y se entrenó con una ventana máxima de 512 tokens. Es la segunda versión, que incorpora un sistema de etiquetado escalado de 0 a 100 y combina datos con anotaciones humanas y generadas por un modelo de lenguaje (`gemma2:9b`), lo que le permite producir puntuaciones más matizadas que una clasificación binaria tradicional.

Se trata de una herramienta útil para investigadores y desarrolladores que trabajen con contenido en rumano y necesiten un sistema rápido de cribado de desinformación, ya sea como parte de un pipeline de fact-checking, moderación de comentarios o análisis de campañas políticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parametros totales | 124.442.113 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite de BERT y `max_length` usado en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Rumano (`ro`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `dumitrescustefan/bert-base-romanian-cased-v1`, un BERT base preentrenado en rumano. La tarea se formula como regresión: una única cabeza lineal produce un valor continuo en la escala 0-100, de modo que la salida se interpreta como una medida de desinformación, no como una probabilidad binaria. Esta elección permite capturar matices entre noticias completamente falsas y exageraciones parciales.

El entrenamiento se realizó con 159.266 muestras de entrenamiento y 17.697 de prueba (10% de división con seed 42). Se usó fp16, tamaño de lote efectivo de 16 y grad_accum de 2, `max_length=512`, `weight_decay=0.01`, `learning_rate=2e-05`, 7 épocas con pérdida MSE y early stopping basado en MAE con paciencia 2. El conjunto de datos combina cuatro fuentes: `ro-political` (textos de redes sociales sobre elecciones presidenciales rumanas 2024-2025), `news-ro-offense` (comentarios de lectores en artículos de noticias), `SaRoCo` (corpus de sarcasmo en noticias) y `ClickbaitSciTechRO` (titulares de clickbait frente a ciencia y tecnología). Las dos últimas cuentan con etiquetas reales, mientras que las dos primeras fueron etiquetadas automáticamente con `gemma2:9b` vía Ollama. No se aplicó RLHF ni DPO; el ajuste es puramente supervisado con pérdida de error cuadrático medio.

## Capacidades

- Puntuación de veracidad en texto rumano mediante regresión continua en escala 0-100.
- Clasificación binaria directa fijando el umbral en 50, con una precisión reportada de 0,833 en el conjunto de prueba interno.
- Detección de contenido engañoso sin distinguir si el texto fue escrito por humanos o generado por IA, tal como se indica en la descripción del autor.
- Funciona como clasificador de texto (`text-classification`) y devuelve un único valor numérico por entrada.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso; no es un modelo generativo.
- Capacidades multilingües limitadas al rumano, sin conocimiento documentado de otros idiomas.

## Casos de uso

- Moderación de comentarios en portales de noticias rumanos: el modelo puntúa cada comentario de lector en la escala 0-100, permitiendo automatizar filtros para comentarios con alto contenido de desinformación antes de la revisión humana.
- Análisis de campañas electorales: dado que `ro-political` se centra en elecciones presidenciales rumanas de 2024-2025, el modelo puede medir la difusión de afirmaciones engañosas en redes sociales durante periodos electorales.
- Cribado de titulares en medios digitales: gracias a la fuente `ClickbaitSciTechRO`, resulta adecuado para distinguir titulares sensacionalistas de noticias científicas o tecnológicas reales.
- Auditores de contenido y fact-checkers: las puntuaciones continuas permiten priorizar los textos con mayor riesgo de desinformación en un flujo de trabajo de verificación.
- Investigación académica sobre desinformación en rumano: sirve para etiquetar o medir la distribución de veracidad en corpus lingüísticos y comparar la evolución de bulos en el tiempo.
- Sistemas de alerta temprana en redes sociales: se puede integrar en un pipeline de monitorización para detectar picos de publicaciones con puntuaciones cercanas a 100 y generar alertas automáticas.

## Benchmarks y rendimiento

Resultados en el conjunto de prueba interno (escala 0-100):

| Métrica | Valor |
|---|---|
| MAE | 9,34 |
| RMSE | 19,41 |
| Exactitud binaria (umbral 50) | 0,833 |
| F1 macro (umbral 50) | 0,833 |

Evaluación cruzada entre conjuntos de datos:

| Conjunto de evaluación | Exactitud | F1 macro | MAE |
|---|---|---|---|
| ds1 (clickbait + SaRoCo) | 0,993 | 0,993 | 0,99 |
| ds2 (news-ro-offense + ro-political) | 0,865 | 0,863 | 4,81 |
| ds3 (todas las fuentes, in-domain) | 0,833 | 0,833 | 9,34 |

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: orientativamente, unos 0,3 GB en fp16 para los pesos del modelo, y con activaciones para una secuencia de 512 tokens y lote pequeño, el consumo total se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una RTX 3060 o superior, es suficiente. También puede ejecutarse en CPU con una latencia aceptable para textos cortos.
- Compatible con GPU de consumo: sí, al ser un modelo BERT base de 124M parámetros.
- Opciones de despliegue: puede servirse con la biblioteca `transformers` de Hugging Face en PyTorch, exportarse a ONNX o integrarse en frameworks como FastAPI o vLLM con pequeñas adaptaciones.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Salida | Entrenamiento |
|---|---|---|---|
| `manuelraileanu/ro-political-fake-news-v2` | BERT base rumano cased | Regresión en escala 0-100 | Cuatro fuentes combinadas, etiquetas humanas y generadas |
| `manuelraileanu/ro-political-fake-news` (v1) | XLM-RoBERTa | Regresión normalizada a [0,1] | No detallado en la información disponible |
| `dumitrescustefan/bert-base-romanian-cased-v1` | BERT base rumano cased | Preentrenamiento sin cabeza de clasificación | Preentrenado en corpus rumano |

No se dispone de más alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con texto en rumano, por lo que no funciona en otros idiomas.
- Los datos de entrenamiento proceden de contextos específicos (elecciones presidenciales, comentarios de noticias, titulares de clickbait), lo que puede introducir sesgos hacia temas y vocabulario de esos dominios.
- Las etiquetas generadas automáticamente con `gemma2:9b` pueden contener errores, y su calidad no está verificada mediante anotación humana en todas las fuentes.
- La salida de regresión puede caer ligeramente fuera del rango [0,100]; se recomienda aplicar un clamp si se necesita una puntuación acotada.
- La exactitud binaria reportada es de 0,833 en el conjunto de prueba, lo que implica una tasa de error relevante en escenarios de producción donde se requiere alta fiabilidad.
- No detecta si un texto fue generado por IA, ya que su objetivo es medir la veracidad de las afirmaciones, no el origen del texto.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario validar el rendimiento en su dominio antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manuelraileanu/ro-political-fake-news-v2
- Perfil del autor: https://huggingface.co/manuelraileanu
- Modelo base: https://huggingface.co/dumitrescustefan/bert-base-romanian-cased-v1
- Dataset `ro-political`: https://huggingface.co/datasets/petrematei/ro-political
- Dataset `news-ro-offense`: https://huggingface.co/datasets/readerbench/news-ro-offense
- Corpus `SaRoCo`: https://github.com/MihaelaGaman/SaRoCo
- Dataset `ClickbaitSciTechRO`: https://github.com/ralucaginga/ClickbaitSciTechRO
