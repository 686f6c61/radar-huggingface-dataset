# Darknss/bertimbau-sentimento-avaliacoes-ptbr

## Resumen

BERTimbau ajustado para sentimento de avaliações de clientes en portugués de Brasil es un modelo de clasificación de texto desarrollado por el usuario Darknss. Se trata de un fine-tuning del checkpoint `neuralmind/bert-base-portuguese-cased` (BERTimbau base) sobre 30.000 reseñas del corpus B2W-Reviews01, con el objetivo de clasificar cada evaluación en una de tres clases: negativo, neutro o positivo. Resuelve un problema concreto y muy habitual en el comercio electrónico lusófono: la triage automática de opiniones de clientes para su explotación analítica.

Arquitectura y tamaño son los de un BERT base estándar: transformer encoder de 12 capas y 108.925.443 parámetros totales, con pesos en safetensors. El contexto de entrada está limitado a 128 tokens durante el entrenamiento, lo que condiciona su uso a reseñas cortas o a fragmentos de texto. La licencia MIT facilita su integración en productos comerciales sin fricción legal.

Su relevancia actual es acotada pero clara: no compite en la liga de los LLM generativos, sino que ofrece una alternativa ligera, determinista y barata de inferir para una tarea de clasificación muy delimitada, con métricas publicadas sobre un conjunto de test de 10.000 reseñas y una comparación explícita frente a un baseline clásico de TF-IDF con regresión logística.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (12 capas) |
| Parametros totales | 108.925.443 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; admite cuantización vía herramientas externas) |
| Idiomas soportados | Portugués (pt), variante de Brasil |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de BERTimbau base, un BERT base entrenado específicamente para portugués por Souza, Nogueira y Lotufo (BRACIS 2020). Sobre ese checkpoint se añade una cabeza de clasificación de secuencias con tres etiquetas y se realiza un fine-tuning supervisado durante 2 épocas, con tasa de aprendizaje 2e-5, batch de 16, longitud máxima de 128 tokens, warmup del 6 % y precisión mixta fp16. El mejor checkpoint se selecciona por F1 macro sobre el conjunto de validación.

Los datos provienen de B2W-Reviews01 (Real et al., STIL 2019), un corpus de reseñas de productos de comercio electrónico. Las etiquetas se derivan de la nota otorgada por el cliente: notas 1 y 2 se mapean a negativo, 3 a neutro, y 4 y 5 a positivo. La partición es estratificada con 30.000 ejemplos de entrenamiento, 5.000 de validación y 10.000 de test, tras eliminar textos duplicados. Solo se emplean el texto de la reseña y la nota; los campos personales del dataset (identificador, edad, género, estado) quedan excluidos del entrenamiento. No se documenta uso de RLHF ni DPO, algo esperable en un fine-tuning supervisado de clasificación. El entrenamiento se ejecutó en una NVIDIA GeForce RTX 3050 de 6 GB para portátil.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutro, positivo) para texto en portugués de Brasil.
- Procesamiento de reseñas cortas de producto, típicamente por debajo de 128 tokens.
- Inferencia determinista y de baja latencia, adecuada para pipelines de alto volumen.
- Integración directa con la librería `transformers` mediante `pipeline("text-classification")`.
- Compatibilidad con Text Embeddings Inference y endpoints compatibles según los tags del repositorio.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al portugués; no se documenta rendimiento en otras lenguas.

## Casos de uso

- Monitorización de opiniones en e-commerce: clasificar automáticamente cada reseña entrante en negativo, neutro o positivo para alimentar cuadros de mando de satisfacción y alertas tempranas cuando sube la proporción de negativos.
- Enrutado de tickets de atención al cliente: las reseñas o mensajes negativos se derivan a un equipo de soporte prioritario, mientras que los positivos se canalizan a programas de fidelización, usando la salida del clasificador como señal de triage.
- Análisis de la voz del cliente a escala: procesar lotes de decenas de miles de reseñas históricas para segmentar por sentimiento y cruzar con categorías de producto, categoría de precio o canal de venta.
- Detección de incidencias de producto o logística: un pico de clasificaciones negativas sobre un SKU concreto puede disparar una revisión de calidad o de la cadena de suministro.
- Filtrado previo en pipelines de moderación: descartar o priorizar contenido para revisión humana según el sentimiento detectado, reduciendo el volumen que llega a los moderadores.
- Investigación académica en PLN para portugués: servir de baseline reproducible y ligero en estudios de análisis de sentimiento sobre dominios de reseñas, con métricas publicadas y partición documentada.
- Clasificación por lotes en entornos con recursos limitados: al tratarse de un BERT base de 109 M de parámetros, puede ejecutarse en CPU o en GPU de consumo para volúmenes moderados sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test de 10.000 reseñas:

| Modelo | Acurácia | F1 macro | F1 negativo | F1 neutro | F1 positivo |
|---|---|---|---|---|---|
| Baseline: TF-IDF + regresión logística | 79,4 % | 70,8 % | 84,3 % | 41,3 % | 86,9 % |
| BERTimbau ajustado (este modelo) | 86,5 % | 75,2 % | 89,3 % | 43,8 % | 92,4 % |

Matriz de confusión del modelo (filas = real, columnas = predicho; orden negativo, neutro, positivo):

```
[2358, 160, 71]
[224, 456, 557]
[108, 230, 5836]
```

El F1 macro es la métrica principal declarada por el autor por el desbalance del dataset: la clase positiva domina y la neutra concentra la mayor parte de los errores (F1 de 43,8 %). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y ninguno de ellos sería aplicable a un modelo de clasificación de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,45 GB solo para pesos (109 M de parámetros), más activaciones y overhead del runtime; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3050 de 6 GB (el hardware usado en el entrenamiento) cubre con holgura la inferencia por lotes.
- Cabe en GPU de consumo: sí, en modelos como GTX 1650, RTX 3050, RTX 4060 o superiores, e incluso en iGPU con suficiente memoria compartida para lotes pequeños.
- Despliegue: `transformers` con `pipeline`, Text Embeddings Inference (según los tags del repositorio), y exportación a ONNX o cuantización a int8 mediante herramientas externas para inferencia en CPU.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darknss/bertimbau-sentimento-avaliacoes-ptbr | 108,9 M | 128 tokens | Clasificación de sentimiento 3 clases (pt-BR) | MIT | Hugging Face |
| neuralmind/bert-base-portuguese-cased (BERTimbau base) | 108,9 M | 512 tokens (BERT estándar) | Modelo base sin cabeza de clasificación | MIT | Hugging Face |
| Baseline TF-IDF + regresión logística (referencia del autor) | no aplica | no aplica | Clasificación de sentimiento 3 clases | no disponible | Reproducible con scikit-learn |

Frente al baseline clásico, el modelo mejora la exactitud en 7,1 puntos y el F1 macro en 4,4 puntos, con una mejora especialmente marcada en la clase positiva (F1 de 92,4 % frente a 86,9 %). Frente a BERTimbau base, la diferencia es que este checkpoint incorpora la cabeza de clasificación y el ajuste específico al dominio de reseñas, por lo que no son intercambiables sin un fine-tuning adicional. No se dispone de comparación con otros modelos de sentimiento en portugués en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente con reseñas de productos de e-commerce; en otros dominios (restaurantes, entregas, atención al cliente) el rendimiento puede degradarse y no se han publicado métricas que lo cuantifiquen.
- Clase neutra problemática: F1 de 43,8 % y 557 reseñas neutras clasificadas erróneamente como positivas; las notas 3 suelen mezclar elogios y quejas, lo que hace la etiqueta intrínsecamente ambigua.
- Ruido en las etiquetas: la nota del cliente no siempre refleja el sentimiento del texto; hay reseñas negativas con nota alta y viceversa, lo que introduce un techo de rendimiento difícil de superar.
- Límite de 128 tokens: reseñas más largas se truncan, con posible pérdida de información relevante para la clasificación.
- Idioma único: solo portugués de Brasil; no hay evidencia de comportamiento en portugués europeo ni en otras lenguas.
- Riesgo de alucinación no aplicable en sentido estricto al ser un clasificador, pero sí existe riesgo de clasificaciones erróneas con alta confianza en textos fuera de distribución.
- Sesgos: no se documenta un análisis de sesgos por género, edad o región, pese a que el dataset original contiene esos campos (excluidos del entrenamiento).
- Uso comercial: la licencia MIT lo permite sin restricciones adicionales, pero el dataset subyacente B2W-Reviews01 está bajo CC BY 4.0, lo que exige atribución si se redistribuyen derivados de los datos.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Darknss/bertimbau-sentimento-avaliacoes-ptbr
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Dataset B2W-Reviews01: https://huggingface.co/datasets/ruanchaves/b2w-reviews01
- Código de entrenamiento: https://github.com/BrenoBorgesss/sentimento-avaliacoes-ptbr
