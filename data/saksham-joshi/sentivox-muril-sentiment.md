# saksham-joshi/sentivox-muril-sentiment

## Resumen

SentiVox es un modelo de análisis de sentimiento multilingüe obtenido mediante fine-tuning de `google/muril-base-cased`, un transformer basado en BERT entrenado originalmente con corpus de 17 lenguas indias e inglés. Lo desarrolla el usuario de Hugging Face `saksham-joshi` y su particularidad frente a los clasificadores de sentimiento convencionales es que no devuelve una única etiqueta, sino una distribución de probabilidad sobre cuatro ejes: positivo, negativo, neutro y ambiguo. Las cuatro puntuaciones suman 1, de modo que una frase con carga mixta recibe masa de probabilidad en varias categorías simultáneamente.

El modelo resuelve el problema del análisis de sentimiento en textos donde la polaridad no es binaria ni excluyente, algo frecuente en opiniones de producto, reseñas y conversaciones en redes sociales. Con 237.545.476 parámetros (aproximadamente 237,5 millones, coherente con la escala base de MuRIL), se sitúa en la gama de modelos BERT-base: ligero para inferencia en CPU y ajustado para GPU de consumo.

Es relevante ahora porque cubre 13 idiomas declarados (inglés y 12 lenguas del subcontinente indio) con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. No obstante, la model card reconoce que el ajuste fino se realizó sobre un dataset de sentimiento cuyo idioma no se especifica, y que el entrenamiento específico por lengua india figura como trabajo futuro, por lo que la cobertura multilingüe efectiva debe validarse empíricamente antes de llevarla a producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base de google/muril-base-cased) |
| Parametros totales | 237.545.476 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la base MuRIL emplea 512 tokens, pero la model card no lo declara) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de transformers/ONNX no documentada por el autor) |
| Idiomas soportados | en, hi, bn, ta, te, ml, kn, gu, mr, pa, or, as, ur |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional derivado de MuRIL (Multilingual Representations for Indian Languages), la variante de BERT desarrollada por Google que incorpora vocabulario y preentrenamiento específicos para lenguas indias, incluyendo transliteración. Sobre esa base se añade una cabeza de clasificación que emite cuatro logits, uno por etiqueta (positive, negative, neutral, ambiguous), convertidos a probabilidades mediante softmax.

El ajuste fino empleó un dataset con etiquetas suaves: cada ejemplo contiene un texto y un vector `senti` con cuatro puntuaciones entre 0 y 1 que suman 1. La función de pérdida es entropía cruzada con etiquetas suaves (soft-label cross-entropy) entre el softmax de los logits y esas puntuaciones, lo que explica que el modelo aprenda distribuciones y no clases duras. Los hiperparámetros documentados son 4 épocas, batch size 32 con tamaño efectivo 64, learning rate 2e-5, optimizador AdamW con warmup lineal y entrenamiento en una GPU T4 de Google Colab. El autor indica que el texto de entrenamiento fue limpiado con su función `clean_text` (scripts/tokenizer.py) y recomienda aplicar el mismo preprocesado antes de inferir. No se documentan número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Clasificación de sentimiento con salida distribucional sobre cuatro etiquetas: positive, negative, neutral y ambiguous.
- Puntuaciones calibradas como probabilidades softmax que suman 1, útiles para umbralizar o para representar sentimiento mixto.
- Cobertura declarada de 13 idiomas: inglés, hindi, bengalí, tamil, telugu, malayo, kannada, guyaratí, maratí, punyabí, oriya, asamés y urdu.
- Clasificación de texto a nivel de fragmento (pipeline `text-classification` de transformers).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento: es un clasificador de encoder puro.
- No es un modelo generativo: no produce texto, solo etiquetas y puntuaciones.

## Casos de uso

- Moderación y priorización de reseñas: puntuar automáticamente reseñas de producto o comentarios de usuarios y enrutar las de sentimiento negativo alto a un equipo de atención al cliente, aprovechando la salida distribucional para detectar casos mixtos que un clasificador binario perdería.
- Monitorización de reputación de marca: procesar menciones en redes sociales en hindi, tamil o bengalí y agregar la distribución de sentimiento por franja temporal; el modelo es lo bastante pequeño para ejecutarse en CPU a gran volumen.
- Enrutamiento en atención al cliente: clasificar tickets entrantes por polaridad antes de asignarlos a colas de soporte o escalado, usando la etiqueta dominante y el umbral sobre la puntuación de ambiguo para marcar casos que requieren revisión humana.
- Análisis de encuestas abiertas: agregar respuestas de texto libre en varios idiomas indios y calcular la proporción media de sentimiento positivo por segmento de usuarios, sin necesidad de traducción previa.
- Filtrado previo en pipelines de datos: descartar o etiquetar grandes corpus web multilingües por sentimiento antes de usarlos en entrenamiento o análisis, dado el bajo coste de inferencia de un modelo de 237 millones de parámetros.
- Investigación en procesamiento de lenguas indias: servir como línea base reproducible (licencia Apache 2.0, pesos safetensors) para comparar técnicas de etiquetado suave frente a clasificación dura en lenguas de bajos recursos.
- Detección de ambigüedad en contenido generado por usuarios: usar la etiqueta ambiguous como señal para derivar textos a anotación humana o a un modelo mayor, reduciendo coste en un segundo paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1 GB para los pesos (237,5 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16 la huella de pesos baja a aproximadamente 0,5 GB; en int8, a unos 0,25 GB.
- GPU recomendadas: cualquier GPU de consumo moderna sirve; una RTX 3060, RTX 4060 o superior ofrece margen de sobra. Para alto throughput, A100 o H100 aportan capacidad de batching muy superior a la necesaria, pero el modelo no las requiere.
- Cabe en GPU de consumo y también en CPU: al ser un encoder BERT-base, la inferencia en CPU es viable para volúmenes moderados.
- Opciones de despliegue: pipeline de transformers, Text Generation Inference no aplica (no es generativo); son adecuados un servidor de inferencia con transformers, ONNX Runtime, o exportación a TorchScript. vLLM y llama.cpp no están orientados a este tipo de clasificador.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia de escala, un BERT-base en GPU moderna procesa típicamente cientos de fragmentos por segundo con batching, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| SentiVox (este modelo) | 237,5 M | no disponible | 13 (en + 12 indias) | Apache 2.0 | Salida distribucional de 4 etiquetas con etiquetas suaves |
| google/muril-base-cased | ~237 M | 512 (estándar BERT) | 17 lenguas indias + en | Apache 2.0 | Modelo base sin cabeza de sentimiento; requiere fine-tuning |
| bert-base-multilingual-cased | ~178 M | 512 | 104 idiomas | Apache 2.0 | Cobertura lingüística mucho mayor, pero sin especialización en lenguas indias |
| cardiffnlp/twitter-xlm-roberta-base-sentiment | ~278 M | 512 | multilingüe | MIT / CC | Clasificador de sentimiento de 3 clases (positivo, negativo, neutro), sin etiqueta de ambigüedad |

La comparación de rendimiento cuantitativo no está disponible: el autor no publica métricas frente a alternativas.

## Limitaciones y advertencias

- La model card no especifica el idioma ni la composición del dataset de ajuste fino; el propio autor lista como trabajo futuro el fine-tuning específico en hindi, bengalí, tamil y otras lenguas indias, lo que sugiere que la calidad multilingüe puede ser desigual y debe validarse por idioma.
- El modelo exige un preprocesado concreto (`clean_text` de scripts/tokenizer.py); usarlo con texto sin limpiar puede degradar las puntuaciones de forma no documentada.
- Riesgo de alucinación no aplica en sentido generativo (no produce texto libre), pero sí existe riesgo de calibración deficiente: las probabilidades softmax pueden no reflejar confianza real, especialmente en dominios alejados del entrenamiento.
- Sesgos: no se documenta ninguna evaluación de sesgo; al derivar de MuRIL y de un dataset de sentimiento no descrito, puede heredar sesgos de dominio (por ejemplo, vocabulario de redes sociales o de reseñas) y de las lenguas sobrerrepresentadas en el corpus original.
- Sin métricas publicadas: no hay benchmarks, matriz de confusión ni evaluación por idioma, lo que impide estimar su precisión frente a alternativas antes de desplegarlo.
- Licencia Apache 2.0: permite uso comercial y modificación sin restricciones adicionales, pero conviene conservar el aviso de licencia y verificar las obligaciones heredadas de la base MuRIL.
- El repositorio tiene 5,7 GB y cero descargas en el momento de la consulta: es un modelo reciente y sin validación comunitaria, por lo que debe tratarse como experimental.
- Longitud de contexto no declarada: para textos largos habrá que trocear y agregar puntuaciones manualmente; el autor menciona la agregación a nivel de documento como trabajo futuro, es decir, no está implementada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saksham-joshi/sentivox-muril-sentiment
- Modelo base MuRIL: https://huggingface.co/google/muril-base-cased
