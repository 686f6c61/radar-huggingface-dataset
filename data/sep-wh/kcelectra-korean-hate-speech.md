# Sep-WH/kcelectra-korean-hate-speech

## Resumen

KcELECTRA Korean Hate Speech es un modelo de clasificación de texto en coreano desarrollado por el usuario Sep-WH como proyecto de fin de curso universitario. Se trata de un fine-tuning del encoder KcELECTRA-base-v2022 de beomi, especializado en la detección de comentarios de odio en comentarios de noticias de entretenimiento surcoreanas. El modelo clasifica cada comentario en una de tres categorías: `none` (normal), `offensive` (ofensivo) y `hate` (odio), devolviendo las probabilidades softmax de las tres etiquetas.

Arquitectónicamente es un transformer encoder de 12 capas con dimensión oculta 768 y 127.779.075 parámetros totales, equivalente a una variante BERT-base adaptada al coreano. El modelo parte de KcELECTRA, un checkpoint preentrenado específicamente sobre texto coreano de redes sociales y comentarios, lo que le proporciona una base léxica y morfológica adecuada para el dominio de comentarios online.

Su relevancia es limitada y muy específica: se trata de un prototipo de investigación con fines educativos, no de un sistema listo para producción. La model card reconoce explícitamente que la precisión no es suficiente para usarse de forma autónoma en sistemas de moderación automática, y las métricas publicadas (exactitud 0,705 y F1 macro 0,706 sobre 471 ejemplos de evaluación) confirman esa cautela. Es útil como referencia metodológica para quien aborde la moderación de contenido en coreano o quiera reproducir un pipeline de fine-tuning sobre KcELECTRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ELECTRA), 12 capas, dimensión oculta 768 |
| Parametros totales | 127.779.075 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 estándar; cuantización aplicable vía herramientas externas) |
| Idiomas soportados | Coreano (ko) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado de `beomi/KcELECTRA-base-v2022`, un encoder de tipo ELECTRA preentrenado sobre texto coreano. La cabeza de clasificación se entrena sobre el dataset `kocohub/korean-hate-speech`, que contiene 7.896 comentarios etiquetados de noticias de entretenimiento. El autor divide los datos en 7.106 ejemplos de entrenamiento, 790 de validación (10 % separado del train manteniendo la proporción de etiquetas, semilla 42) y 471 de evaluación final (`dev`).

El entrenamiento emplea entropía cruzada, optimizador AdamW, tamaño de lote 32, longitud máxima de 128 tokens, 3 épocas, tasa de aprendizaje 3e-5, warmup del 10 % y weight decay de 0,01. La configuración final se seleccionó entre 6 combinaciones de hiperparámetros según el F1 macro en validación. No se documenta uso de RLHF, DPO ni técnicas de aumentación de datos, ni innovaciones arquitectónicas adicionales más allá del fine-tuning estándar.

## Capacidades

- Clasificación de texto en coreano en tres clases: `none`, `offensive` y `hate`, con salida de probabilidades softmax.
- Procesamiento de comentarios de una sola frase, con recorte a 128 tokens.
- Detección de lenguaje ofensivo y de odio en el dominio de comentarios de noticias de entretenimiento.
- Integración directa con la librería `transformers` mediante `pipeline("text-classification")`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre.
- Capacidad monolingüe: únicamente coreano.

## Casos de uso

- Filtrado preliminar de comentarios en foros o secciones de noticias de entretenimiento en coreano: el modelo puede marcar comentarios candidatos a revisión humana, aprovechando su alta sensibilidad para la clase `none` (recall 0,919) para descartar rápidamente el contenido claramente normal.
- Etiquetado asistido en proyectos de investigación sobre toxicidad en coreano: sirve como baseline reproducible para comparar con otros clasificadores o para preetiquetar corpus que luego se revisan manualmente.
- Docencia y reproducción de pipelines de fine-tuning: el modelo y su model card documentan hiperparámetros, particiones y métricas, lo que lo hace útil como ejemplo didáctico de clasificación de texto con KcELECTRA.
- Moderación comunitaria de baja criticidad: en comunidades pequeñas donde el coste de un falso negativo es bajo y existe revisión humana posterior, puede usarse como primera capa de triaje.
- Análisis exploratorio de datasets de comentarios: permite obtener distribuciones aproximadas de las tres categorías sobre corpus de comentarios de noticias coreanas, siempre con validación manual de una muestra.
- Detección de casos claros de odio explícito: con un recall de 0,705 en la clase `hate`, puede emplearse para señalar comentarios que requieran revisión prioritaria, combinado con reglas léxicas adicionales.

## Benchmarks y rendimiento

Métricas publicadas por el autor sobre el conjunto `dev` de 471 ejemplos:

| Métrica | Valor |
|---|---|
| Exactitud | 0,705 |
| F1 macro | 0,706 |
| Recall clase `none` | 0,919 |
| Recall clase `offensive` | 0,524 |
| Recall clase `hate` | 0,705 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB en fp32 para los 127,8 M de parámetros; menos de 0,3 GB en fp16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en CPU con latencia aceptable para volúmenes moderados.
- Cabe en GPU consumer: sí, en todas las GPU modernas (RTX 3060, RTX 4090, GTX 1660, etc.) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `pipeline`, TorchServe, ONNX Runtime, o exportación a GGUF para llama.cpp/Ollama si se convierte el encoder.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU (cientos de inferencias por segundo en lote) y decenas por segundo en CPU, aunque estas cifras no están verificadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sep-WH/kcelectra-korean-hate-speech | 127,8 M | 128 tokens | Clasificación de odio en coreano (3 clases) | CC BY-SA 4.0 | Hugging Face |
| beomi/KcELECTRA-base-v2022 | ~110 M (no confirmado) | 512 tokens (típico en ELECTRA) | Modelo base preentrenado en coreano | no disponible en la información | Hugging Face |
| kocohub/korean-hate-speech (dataset) | no aplica | no aplica | Corpus etiquetado de referencia | CC BY-SA 4.0 | GitHub |

No se dispone de datos de benchmarks comparativos con otros clasificadores de odio en coreano en la información proporcionada.

## Limitaciones y advertencias

- Recall bajo en la clase `offensive` (0,524): el modelo tiende a clasificar como `none` las expresiones ofensivas leves, lo que genera falsos negativos frecuentes.
- Entrenado exclusivamente con comentarios de noticias de entretenimiento; el rendimiento puede degradarse en otros dominios, plataformas o registros lingüísticos.
- El dataset de origen contiene etiquetas ambiguas o erróneas, lo que introduce ruido en el aprendizaje y en la evaluación.
- El propio autor advierte que la precisión no es suficiente para usar el modelo de forma autónoma en sistemas de bloqueo automático en producción.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Riesgo de sesgos heredados del corpus de entrenamiento, que no ha sido auditado en la información disponible.
- Contexto limitado a 128 tokens: comentarios largos se truncan y pueden perder información relevante.
- Modelo monolingüe: no procesa texto en otros idiomas.
- Sin datos publicados sobre calibración de probabilidades ni sobre comportamiento en dominios fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sep-WH/kcelectra-korean-hate-speech
- Modelo base: https://huggingface.co/beomi/KcELECTRA-base-v2022
- Dataset de entrenamiento: https://github.com/kocohub/korean-hate-speech
