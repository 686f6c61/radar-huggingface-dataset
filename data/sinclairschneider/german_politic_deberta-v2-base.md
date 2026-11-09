# SinclairSchneider/german_politic_DeBERTa-v2-base

## Resumen

`german_politic_DeBERTa-v2-base` es un clasificador binario de texto en alemán que distingue entre contenido político (`politic`) y no político (`other`). Lo desarrolla Sinclair Schneider y parte de `ikim-uk-essen/geberta-base`, un DeBERTa-v2 adaptado al alemán. El modelo se afina sobre un conjunto propio de 234.978 textos que combina material político de taz, FOCUS online y la Agencia Federal para la Educación Cívica (bpb) con textos no políticos procedentes de libros de Project Gutenberg, recetas y secciones de deporte, cultura, motor, tecnología y viajes de taz y FOCUS.

Con 139,2 millones de parámetros, el modelo está pensado como pre-filtro de alta exhaustividad dentro de un pipeline más amplio de predicción de ideología política, presentado en el artículo *Ideology Prediction of German Political Texts* (ICWSM 2026). Solo los textos con P(`politic`) ≥ 0,8 pasan a los clasificadores posteriores de partido e ideología. Su relevancia práctica radica en que, pese a su tamaño reducido y su licencia MIT, ofrece una latencia muy baja y una exhaustividad del 99,8 % sobre noticias reales, aunque a costa de una precisión baja: etiqueta como políticos casi todos los textos de actualidad no deportivos.

El modelo no es un detector preciso de política, sino un filtro de "no deporte / no ocio". Esta matización, documentada por el propio autor, es esencial para cualquier evaluación rigurosa de su comportamiento en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (transformer encoder, posiciones relativas), base alemana `ikim-uk-essen/geberta-base` |
| Parametros totales | 139.213.058 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens en entrenamiento; entradas mayores no fallan por posiciones relativas, pero quedan fuera de distribución |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | alemán (`de`) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (transformers) |

## Arquitectura y entrenamiento

El modelo es un DeBERTa-v2 de tamaño base con 139,2 millones de parámetros, inicializado desde `ikim-uk-essen/geberta-base` y afinado como clasificador binario de secuencia. DeBERTa-v2 emplea atención desenredada y codificación de posiciones relativas, lo que explica que acepte entradas de más de 512 tokens sin errores, aunque el autor advierte que ese régimen queda fuera de lo visto en entrenamiento y consume más memoria. La cabeza de clasificación produce dos etiquetas, `politic` y `other`.

El conjunto de entrenamiento, `SinclairSchneider/trainset_political_text_yes_no_german`, contiene 234.978 textos. La clase positiva procede de taz, FOCUS online y la bpb; la negativa, de libros de Project Gutenberg, recetas y artículos de deporte, cultura, motor, tecnología y viajes de taz y FOCUS. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta por fuente, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un encoder de clasificación). El script de entrenamiento está publicado en el repositorio (`train.py`). La innovación destacable no es arquitectónica sino de uso: el modelo se concibe como etapa de prefiltrado con umbral de 0,8 dentro de un pipeline de ideología política.

## Capacidades

- Clasificación binaria de texto alemán en `politic` / `other` con puntuación de probabilidad por etiqueta.
- Alta exhaustividad en la detección de contenido político: recall de 0,998 sobre noticias reales de 10kGNAD con umbral 0,5.
- Procesamiento por lotes (`batch_size`) y truncado configurable mediante `truncation=True`.
- Integración directa con `transformers.pipeline("text-classification")` y compatibilidad con endpoints de Hugging Face.
- Uso como etapa de prefiltrado en pipelines multietapa (por ejemplo, antes de clasificadores de partido e ideología).
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multietapa: es exclusivamente un encoder de clasificación.

## Casos de uso

- Prefiltrado en pipelines de análisis de ideología política: el modelo descarta textos claramente no políticos antes de invocar clasificadores más costosos de partido e ideología, tal como se describe en el artículo de ICWSM 2026 con umbral P(`politic`) ≥ 0,8.
- Monitorización de medios alemanes: al procesar flujos de noticias de taz, FOCUS o derStandard.at, permite separar rápidamente el contenido deportivo y de ocio del resto, que es la única distinción que el modelo realiza con fiabilidad.
- Enrutado de documentos en sistemas de archivo o CMS: clasificar artículos entrantes para dirigirlos a colas de revisión editorial según su probabilidad de ser políticos, aceptando que la clase `other` solo captura deporte y ocio.
- Etiquetado de corpus para investigación en ciencias sociales: generar una primera anotación automática de grandes volúmenes de texto alemán, con revisión humana posterior dado el sesgo hacia la clase positiva.
- Filtrado previo en tareas de moderación o curación de datasets: eliminar contenido deportivo y de recetas de un corpus antes de análisis lingüísticos o estadísticos.
- Componente de bajo coste en entornos con recursos limitados: sus 139 millones de parámetros permiten ejecutarlo en CPU o en GPU de gama baja para clasificar lotes grandes con latencia reducida.
- Detección de contenido político en foros y reseñas: pese a la tasa elevada de falsos positivos documentada, puede usarse como señal preliminar combinada con reglas o un segundo modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea / conjunto | Metrica | Valor |
|---|---|---|
| Detección de texto político, split retenido al 20 % del trainset | Accuracy | 0,9966 |
| Detección de texto político, split retenido al 20 % del trainset | Weighted F1 | 0,9966 |
| Detección fuera de dominio, 10kGNAD (derStandard.at), Inland + International vs. resto | ROC-AUC | 0,8655 |
| Detección fuera de dominio, 10kGNAD | Recall `politic` (umbral 0,5) | 0,998 |
| Detección fuera de dominio, 10kGNAD | Accuracy (umbral 0,5) | 0,415 |
| Detección fuera de dominio, 10kGNAD | F1 `politic` (umbral 0,5) | 0,4561 |

El autor documenta además que, sobre noticias no políticas, el modelo etiqueta como `politic` el 99 % de economía, el 99 % de ciencia, el 98 % de panorama y el 87 % de web/tecnología; el deporte es la única sección que rechaza de forma fiable. Incluso con umbral 0,999, el 89 % de artículos de economía y el 78 % de ciencia siguen clasificados como `politic`.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,56 GB solo para pesos (139,2 M × 4 bytes), más activaciones y overhead; en fp16, alrededor de 0,28 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes moderados.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir lotes grandes con `batch_size` elevado; una RTX 4090 es suficiente para uso intensivo.
- Opciones de despliegue: `transformers` (pipeline de clasificación), Hugging Face Inference Endpoints (el modelo está marcado como `endpoints_compatible`), y servidores de inferencia compatibles con modelos de clasificación de transformers. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| `SinclairSchneider/german_politic_DeBERTa-v2-base` | 139,2 M | 512 tokens (entrenamiento) | Clasificación político / no político en alemán | MIT | Alta exhaustividad, baja precisión fuera de dominio |
| `SinclairSchneider/german_politic_EuroBERT-210m` | 210 M (dato del nombre) | Contexto largo (alternativa del mismo autor) | Clasificación político / no político en alemán | no disponible | Entrenado sobre los mismos datos; pensado para entradas largas |
| `SinclairSchneider/english_politic_RoBERTa-large` | no disponible | no disponible | Clasificación político / no político en inglés | no disponible | Contrapartida en inglés del mismo autor |
| `ikim-uk-essen/geberta-base` | no disponible | no disponible | Modelo base alemán (DeBERTa-v2) | no disponible | Modelo de partida sin afinar para esta tarea |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, tarea y licencia.

## Limitaciones y advertencias

- El modelo funciona como filtro de alta exhaustividad de "no deporte / no ocio", no como detector preciso de política: etiqueta como `politic` con confianza superior a 0,99 la mayoría de textos modernos de economía, ciencia, salud, medios, panorama, foros y reseñas.
- Subir el umbral apenas corrige el problema: con 0,999, el 89 % de artículos de economía y el 78 % de ciencia siguen clasificados como `politic`.
- Riesgo elevado de falsos positivos en dominios no representados en el entrenamiento; la clase negativa solo cubre deporte, cine, música, motor, tecnología, viajes, recetas y literatura antigua.
- Es obligatorio pasar `truncation=True`: el modelo se entrenó con un máximo de 512 tokens y las entradas más largas, aunque no fallan por el uso de posiciones relativas, quedan fuera de distribución y consumen más memoria.
- Solo soporta alemán; no se ha evaluado su comportamiento en otros idiomas.
- No se documentan análisis de sesgos más allá del desequilibrio de dominios descrito; el sesgo principal es el sesgo de clase positiva hacia temáticas de actualidad.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento fuera del dominio de entrenamiento.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- El modelo no genera texto ni soporta tool calling, agentes o razonamiento; cualquier expectativa en ese sentido es inadecuada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SinclairSchneider/german_politic_DeBERTa-v2-base
- Dataset de entrenamiento: https://huggingface.co/datasets/SinclairSchneider/trainset_political_text_yes_no_german
- Script de entrenamiento: https://huggingface.co/SinclairSchneider/german_politic_DeBERTa-v2-base/blob/main/train.py
- Modelo base: https://huggingface.co/ikim-uk-essen/geberta-base
- Alternativa de contexto largo: https://huggingface.co/SinclairSchneider/german_politic_EuroBERT-210m
- Contrapartida en inglés: https://huggingface.co/SinclairSchneider/english_politic_RoBERTa-large
- Artículo: *Ideology Prediction of German Political Texts* (ICWSM 2026): https://doi.org/10.1609/icwsm.v20i1.42735
- Código del pipeline: https://github.com/SinclairSchneider/german_ideology_prediction
- Paper DeBERTa-v2: https://arxiv.org/abs/1910.09700
