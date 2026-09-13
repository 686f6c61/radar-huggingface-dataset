# selftaughtdev/engagement-farm-classifier

## Resumen

engagement-farm-classifier es un clasificador de texto binario desarrollado por el usuario selftaughtdev que detecta publicaciones de "engagement farming" en redes sociales: llamadas explícitas a la acción ("like if you agree", "tag someone who"), preguntas cebo, sorteos, cadenas y relleno de bajo contenido cuyo objetivo principal es acumular respuestas y "me gusta". Se construyó y evaluó sobre publicaciones de X/Twitter.

El modelo parte de google/bert_uncased_L-8_H-512_A-8, un BERT destilado de 8 capas, 512 dimensiones ocultas y 8 cabezas de atención, sobre el que se añade una cabeza de clasificación de secuencia con dos etiquetas (0 = genuine, 1 = engagement_farming). El recuento real de parámetros en los pesos safetensors publicados es de 41.374.210 (unos 41,4 millones), aunque la model card cita 32 millones para el modelo base.

Su relevancia práctica está en el coste de despliegue: el artefacto de servicio es un ONNX int8 de 42 MB con una latencia declarada de 1,9 ms de media y 2,7 ms en p95 por publicación en CPU (Apple Silicon, un solo post), lo que permite filtrar flujos de publicaciones en tiempo real sin GPU. La licencia Apache 2.0 y la inclusión de los scripts de recolección, etiquetado y evaluación facilitan tanto el uso comercial como la reproducción del pipeline. El repositorio tiene 13 descargas y 1 "like" en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (google/bert_uncased_L-8_H-512_A-8: 8 capas, hidden 512, 8 cabezas) con cabeza de clasificación de secuencia |
| Parámetros totales | 41.374.210 (según safetensors); la model card del autor cita 32M para el modelo base |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (máximo de la arquitectura BERT); el ejemplo de uso del autor trunca a 128 tokens |
| Tipos de cuantización | fp32 (safetensors y ONNX fp32); int8 (ONNX dinámico, 42 MB) |
| Idiomas soportados | inglés (entrenado con publicaciones en inglés); otros idiomas no evaluados |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX fp32, ONNX int8 (`onnx-int8/model_quantized.onnx`) |
| Etiquetas | 0 = genuine, 1 = engagement_farming |
| Umbral de decisión | 0,5 por defecto; ajustable (0,5 / 0,4 / 0,3 documentados) |
| Tamaño del repositorio | 0,2 GB |
| Librería | transformers (también compatible con Optimum ONNX Runtime) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer BERT en su variante destilada pequeña: 8 capas, 512 dimensiones ocultas y 8 cabezas de atención, con embeddings de vocabulario "uncased" (30.522 tokens) y una cabeza lineal de clasificación sobre el token [CLS] con dos salidas. No hay innovaciones de decodificación ni atención lineal; el valor diferencial está en el tamaño reducido y en la exportación a ONNX int8 para inferencia en CPU. El ejemplo de uso fija `max_length=128`, por debajo del límite de 512 tokens de la arquitectura.

El entrenamiento se hizo por ajuste fino supervisado con etiquetas generadas por un profesor LLM (kimi-k3 mediante prompts por lotes), conservando únicamente veredictos con confianza del profesor mayor o igual a 0,85. El corpus de partida son 12.506 publicaciones recogidas de líneas de tiempo públicas y búsquedas por palabras clave; tras deduplicar texto quedaron 7.766 publicaciones, 1.706 de ellas etiquetadas como engagement farming. La clase positiva se sobremuestreó aproximadamente 1:2 en el split de entrenamiento. No se redistribuye ningún corpus de publicaciones en bruto: solo se publican scripts y pesos, de modo que el dataset puede reconstruirse con `collect_tweets.js`, `label.py`, `train.py` y `eval.py`. No se documenta uso de RLHF ni DPO.

## Capacidades

- Clasificación binaria de texto: asigna probabilidad de pertenencia a la clase engagement_farming, con umbral configurable en tiempo de servicio.
- Detección de patrones concretos de farming: CTA explícitos ("like if you agree", "tag someone who"), preguntas cebo de respuesta, sorteos, cadenas y relleno de bajo contenido.
- Salida probabilística calibrada de forma utilizable: precisión 1,00 en el conjunto de test retenido en todos los umbrales probados.
- Inferencia en CPU sin GPU: 1,9 ms de media y 2,7 ms p95 por publicación (Apple Silicon, un solo post).
- Servicio en dos formatos: PyTorch vía `transformers` y ONNX int8 vía `optimum.onnxruntime` (42 MB).
- Ajuste de política mediante umbral: el autor documenta barridos a 0,5, 0,4 y 0,3 para priorizar precisión o recall.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, capacidades de agente, visión ni audio; es exclusivamente un clasificador.
- Capacidad multilingüe: no verificada; el modelo está entrenado con publicaciones en inglés.

## Casos de uso

- Filtrado en el feed de una plataforma social: clasificar cada publicación entrante y aplicar el umbral 0,3 para detectar el 67% de los casos sutiles con cero falsos positivos, reduciendo la presencia de cebo en la línea de tiempo principal.
- Moderación de comunidades (foros, Discord, subreddits): integrar el clasificador como señal previa a la revisión humana, de modo que solo las publicaciones marcadas pasen a un moderador.
- Limpieza de corpus para entrenamiento de modelos: descartar publicaciones de farming antes de construir un dataset de diálogo o de análisis de opinión, evitando que el ruido de engagement contamine las estadísticas.
- Herramientas de social listening y gestión de marca: medir qué proporción del volumen de menciones de una marca corresponde a cebo y separarla de la conversación genuina en los informes.
- Investigación académica sobre economía de la atención: usar los scripts publicados para reconstruir el corpus etiquetado y estudiar la prevalencia de engagement bait por cuenta, tema o periodo.
- Prevención de spam en sistemas de comentarios de medios o blogs: aplicar el modelo sobre cada comentario nuevo en la capa de ingesta, con coste despreciable por elemento al ejecutarse en CPU.
- Etiquetado a gran escala en pipelines de datos: procesar millones de publicaciones en batch con ONNX int8 en instancias sin GPU, usando el modelo como preanotador que después se revisa por muestreo.
- Ajuste de políticas de plataforma: calibrar el umbral según la tolerancia a falsos positivos de cada producto (0,5 para máxima precisión, 0,3 para maximizar recall) sin reentrenar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, GLUE, SuperGLUE, HumanEval, GSM8K) en la información disponible. El autor solo reporta métricas de clasificación sobre dos conjuntos propios.

Conjunto de validación (777 publicaciones, 189 de ellas farming, retenidas del entrenamiento):

| Umbral | Precision | Recall | F1 |
|---|---|---|---|
| 0,5 | 0,98 | 0,90 | 0,94 |
| 0,3 | 0,97 | 0,90 | 0,94 |

Conjunto de test retenido (273 publicaciones recogidas después de todos los datos de entrenamiento, sin solapamiento de identificador ni de texto, 15 de ellas farming):

| Umbral | Precision | Recall | F1 |
|---|---|---|---|
| 0,5 | 1,00 | 0,47 | 0,64 |
| 0,4 | 1,00 | 0,53 | 0,70 |
| 0,3 | 1,00 | 0,67 | 0,80 |

El autor indica cero falsos positivos en el conjunto de test en todos los umbrales y atribuye el descenso de recall en test a que los positivos son cebo sutil y nativo de la línea de tiempo (preguntas retóricas del tipo "how many of you", relleno de saludo). Los 15 positivos de test son pocos, por lo que el propio autor pide tratar esas cifras como indicativas.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 165 MB (41,4 millones de parámetros a 4 bytes); el repositorio completo ocupa 0,2 GB.
- Pesos en int8 ONNX: 42 MB, según el autor.
- VRAM estimada para inferencia: menos de 1 GB incluyendo el runtime; el modelo cabe de sobra en cualquier GPU de consumo, pero no necesita ninguna.
- GPU recomendadas: no se requiere GPU. Cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) sirve para lotes grandes, pero el caso de uso natural es CPU-only.
- Compatibilidad con hardware de consumo: sí, en CPU de portátil, Apple Silicon y placas de bajo consumo; el cuello de botella es el preprocesado del tokenizador, no el cálculo.
- Opciones de despliegue: `transformers` (PyTorch), `optimum.onnxruntime` con el artefacto int8, Hugging Face Inference Endpoints (la etiqueta `endpoints_compatible` está presente) y text-embeddings-inference (etiqueta `text-embeddings-inference` presente). No hay artefacto GGUF publicado, por lo que llama.cpp u Ollama no se pueden usar directamente sin convertir el modelo; vLLM y TGI no son el vehículo natural para una cabeza de clasificación de secuencia de este tamaño.
- Latencia conocida: 1,9 ms de media y 2,7 ms p95 por publicación en CPU Apple Silicon para un único post (dato del autor).
- Throughput con batching: no disponible; el autor no publica cifras de rendimiento por lote ni en GPU.

## Comparativa con modelos similares

No se han identificado en la información proporcionada otros clasificadores públicos específicos de engagement farming con los que comparar métricas. Los modelos comparables por arquitectura y tamaño son los propios encoders BERT pequeños, que tendrían que ajustarse para esta tarea.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento en engagement farming |
|---|---|---|---|---|---|
| selftaughtdev/engagement-farm-classifier | 41,4M | 512 (uso recomendado 128) | clasificación binaria ajustada | Apache 2.0 | F1 0,94 en validación; F1 0,80 en test con umbral 0,3 |
| google/bert_uncased_L-8_H-512_A-8 | 41,4M | 512 | modelo base enmascarado | Apache 2.0 | no disponible (requiere ajuste fino) |
| distilbert-base-uncased | 66M | 512 | modelo base enmascarado | Apache 2.0 | no disponible (requiere ajuste fino) |
| bert-base-uncased | 110M | 512 | modelo base enmascarado | Apache 2.0 | no disponible (requiere ajuste fino) |

La ventaja diferencial frente a esos encoders genéricos no es la arquitectura, sino el ajuste específico para la tarea, el artefacto ONNX int8 listo para servir y la documentación del pipeline de etiquetado.

## Limitaciones y advertencias

- Idioma: entrenado únicamente con publicaciones en inglés; el comportamiento en castellano u otros idiomas no está probado y no debería asumirse.
- Recall bajo en datos reales: en el conjunto de test retenido el recall cae a 0,47 con el umbral por defecto de 0,5. Para filtrado en producción hay que bajar el umbral a 0,3 o reentrenar.
- Muestra de test muy pequeña: solo 15 positivos en el conjunto de test, por lo que las métricas de ese conjunto son indicativas y no concluyentes.
- Falsos negativos sistemáticos: el relleno de apariencia inocente (publicaciones de "buenos días", preguntas retóricas) es la principal fuente de fallos, ya que el modelo no puede distinguir de forma fiable una pregunta retórica con sustancia de la misma pregunta usada como cebo.
- Ruido en las etiquetas: las anotaciones provienen de un profesor LLM con umbral de confianza 0,85, lo que reduce pero no elimina la ambigüedad de frontera entre contenido genuino y bait.
- Sesgo de dominio: los datos proceden de X/Twitter (líneas de tiempo públicas y búsquedas por palabras clave), por lo que el rendimiento en LinkedIn, TikTok, YouTube o foros no está caracterizado.
- Truncamiento: el ejemplo de uso trunca a 128 tokens; las publicaciones largas pueden perder la parte final, que es donde a veces aparece el CTA.
- Sin datos sobre sesgos demográficos, políticos o de otro tipo: no se ha publicado ninguna evaluación de equidad.
- Origen de los datos: el corpus se recogió con un script que se ejecuta en el navegador sobre líneas de tiempo públicas. El cumplimiento de los términos de servicio de la plataforma y de la normativa de protección de datos es responsabilidad de quien reconstruya el dataset; el autor no redistribuye las publicaciones en bruto.
- Licencia: Apache 2.0, que permite uso comercial sin restricciones adicionales, pero no concede ningún derecho sobre los datos de entrenamiento ni sobre el corpus reconstruido.
- Madurez: 13 descargas y 1 "like" en Hugging Face, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/selftaughtdev/engagement-farm-classifier
- Modelo base: https://huggingface.co/google/bert_uncased_L-8_H-512_A-8
- Scripts de reproducción incluidos en el repositorio del modelo: `collect_tweets.js`, `label.py`, `train.py`, `eval.py` (no tienen URL independiente publicada)
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (los resultados obtenidos eran sobre husos horarios de Australia y contenidos sin relación).
