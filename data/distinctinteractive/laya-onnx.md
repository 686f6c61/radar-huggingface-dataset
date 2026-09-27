# distinctinteractive/laya-onnx

## Resumen

Laya ONNX es una conversión a formato ONNX del modelo Laya, desarrollado por Convai Innovations y exportado por el usuario distinctinteractive. Laya no es un modelo generativo de texto, sino un modelo de decisión que recibe un texto o JSON junto con preguntas tipadas y devuelve, en una única pasada hacia delante, probabilidades calibradas sobre las opciones de cada pregunta. Esto lo hace especialmente útil para tareas de clasificación y enrutamiento donde se necesita una medida de confianza, sin la latencia y el coste asociados a la generación de texto.

El repositorio contiene dos variantes: una multilingüe basada en el encoder mmBERT-base (1,3 GB) y otra en inglés basada en ModernBERT-large (1,7 GB). Ambas están pensadas para ser utilizadas desde Layar, una gema de Ruby que ejecuta el modelo con ONNX Runtime y descarga los archivos automáticamente en el primer uso. La exportación se realizó con torch.onnx.export (dynamo=True, opset 18) y se validó numéricamente contra los modelos originales de PyTorch, con una concordancia en las probabilidades de hasta 2e-6.

La relevancia actual de esta ficha radica en que ofrece una alternativa eficiente a los LLM generativos para tareas de decisión estructurada, con probabilidades calibradas y soporte para múltiples tipos de pregunta (choice, yes/no, score). Al estar en ONNX, puede integrarse en entornos con requisitos de latencia estrictos o en aplicaciones Ruby mediante Layar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoders transformer: mmBERT-base (variante multilingual) y ModernBERT-large (variante english) |
| Parámetros totales | no disponible (no se especifican los recuentos exactos; los encoders son mmBERT-base y ModernBERT-large) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (se ha validado con entradas de al menos 931 tokens; no se indica el máximo) |
| Tipos de cuantización | no disponible (el repositorio incluye la etiqueta "quantized" en los metadatos, pero no se detalla el esquema de cuantización de los archivos ONNX) |
| Idiomas soportados | Inglés (carpeta english/) y multilingüe (carpeta multilingual/, basada en mmBERT-base). No se proporciona la lista completa de idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx + model.onnx.data) |
| Tamaño del repositorio | 3,0 GB (multilingual: 1,3 GB; english: 1,7 GB) |
| Fecha de creación | 2026-09-26 (según metadatos de HuggingFace) |
| Autor de la exportación | distinctinteractive |
| Modelo base | convaiinnovations/laya |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Laya original, que emplea encoders transformer (mmBERT-base para la versión multilingüe y ModernBERT-large para la inglesa) y una cabeza de clasificación que produce logits por opción. El modelo no genera texto: recibe una secuencia construida con campos específicos (input_ids, attention_mask, marker_pos, marker_mask y qtype) y devuelve logits por opción y act_logits. Esta construcción de la secuencia debe seguir exactamente la implementación de la librería Python laya (laya.common.build_sequence); el port en Ruby de Layar replica dicho procedimiento.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas como RLHF o DPO. La innovación principal de esta exportación es su conversión a ONNX con dimensiones dinámicas de batch, secuencia y opciones, lo que permite su uso en ONNX Runtime con distintos tamaños de entrada. La validación de paridad con los modelos PyTorch originales muestra una concordancia en las probabilidades de opción de hasta 2e-6, incluyendo una entrada de 931 tokens y un lote que mezcla preguntas de tipo choice, yes/no y score. El port en Ruby reproduce los token ids exactamente y las probabilidades con un margen de 3e-6.

## Capacidades

- Clasificación y decisión con probabilidades calibradas: dado un texto o JSON y una o varias preguntas tipadas, devuelve una distribución de probabilidad sobre las opciones de cada pregunta en una sola pasada.
- Soporte de preguntas de tipo choice (opciones múltiples), yes/no (binarias) y score (puntuación), según se documenta en las pruebas de paridad.
- No genera texto libre; su salida son logits y probabilidades, lo que evita el riesgo de alucinación generativa y reduce la latencia.
- Versión multilingüe (carpeta multilingual/) y versión en inglés (carpeta english/), con encoders especializados para cada caso.
- Integración con Ruby mediante la gema Layar, que descarga y ejecuta el modelo con ONNX Runtime.
- Compatible con cualquier runtime de ONNX (ONNX Runtime, TensorRT, etc.) si se construyen las entradas correctamente.
- No se mencionan capacidades de tool calling, function calling ni agentes multi-paso.
- No se mencionan capacidades de visión, audio ni modos de razonamiento explícito (thinking mode).

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo puede clasificar el texto de un ticket (por ejemplo, "I was charged twice this month") en categorías como billing, bug o account, devolviendo probabilidades calibradas que permiten enrutar automáticamente al equipo adecuado y priorizar según la confianza.
- Moderación de contenido: dado un comentario o publicación, se pueden definir preguntas tipadas (por ejemplo, "¿es tóxico? sí/no", "¿categoría? spam/acoso/seguro") y obtener probabilidades para cada opción, facilitando decisiones automáticas con umbrales ajustables.
- Análisis de sentimiento con confianza: a partir de reseñas o encuestas, el modelo devuelve la probabilidad de que el sentimiento sea positivo, negativo o neutro, lo que permite ponderar la incertidumbre y activar revisiones manuales cuando la probabilidad es baja.
- Procesamiento de encuestas y feedback: para preguntas de tipo score (por ejemplo, satisfacción del 1 al 5), el modelo puede distribuir la probabilidad entre las opciones, ofreciendo una medida más rica que una simple etiqueta.
- Extracción de información estructurada: dado un JSON con datos de un formulario y preguntas tipadas, el modelo produce probabilidades sobre posibles valores, útil para validación o enriquecimiento de datos.
- Filtrado de spam: clasificar correos o mensajes como spam/no spam con una probabilidad calibrada, integrándose en un pipeline de Ruby mediante Layar para decidir si se bloquea o se marca para revisión.
- Recomendación simple basada en texto: dado un texto descriptivo y un conjunto de opciones de productos o categorías, obtener la probabilidad de cada opción para sugerir la más adecuada.
- Automatización de decisiones en CI/CD: aunque no es un modelo de código, puede usarse para clasificar logs o mensajes de error en categorías conocidas, ayudando a enrutar incidencias en pipelines de integración continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifican requisitos oficiales. Asumiendo pesos en FP32, la carpeta english/ ocupa ~1,7 GB, por lo que se recomiendan al menos 2-3 GB de VRAM para un batch pequeño. La carpeta multilingual/ ocupa ~1,3 GB, por lo que se recomiendan al menos 2 GB. Con cuantización (no documentada) el consumo podría ser menor.
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM, incluyendo modelos consumer como GTX 1650, RTX 3050, RTX 3060, RTX 4060 o RTX 4090. Para despliegues de alto rendimiento, A100 o H100.
- ¿Cabe en GPU consumer? Sí, ambas variantes caben en GPUs consumer con al menos 2-3 GB de VRAM. También es posible la inferencia en CPU mediante ONNX Runtime, aunque con mayor latencia.
- Opciones de despliegue: ONNX Runtime (principal), gema Layar para Ruby, y cualquier framework que soporte modelos ONNX (por ejemplo, TensorRT). No es compatible con vLLM ni llama.cpp, ya que no es un modelo generativo ni está en formato GGUF.
- Latencia y throughput estimados: no disponibles. Al ser una única pasada hacia delante y no generar texto, la latencia debería ser baja en comparación con modelos generativos, pero no se proporcionan cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Este modelo es una exportación ONNX de convaiinnovations/laya, y no se especifican alternativas equivalentes en la información disponible. Se podría considerar su comparación con otros modelos de clasificación zero-shot (como BART-large-MNLI o DeBERTa-v3) o con LLM generativos usados para clasificación, pero no hay datos de rendimiento en esta ficha para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada.
- Riesgo de alucinación: al no generar texto, no hay alucinación generativa, pero el modelo puede producir probabilidades poco fiables si la entrada está fuera de la distribución de entrenamiento o si las preguntas no están bien formuladas.
- Limitaciones de contexto: se ha validado con entradas de al menos 931 tokens, pero se desconoce la longitud máxima soportada. No se especifica en la documentación.
- Idiomas: aunque existe una variante multilingüe, no se detalla la lista de idiomas cubiertos ni su calidad relativa. La variante english/ está especializada en inglés.
- Licencia: Apache-2.0, permite uso comercial, pero se debe conservar el aviso de licencia y el archivo NOTICE. El crédito de los modelos originales corresponde a Convai Innovations; esta exportación es un trabajo derivado.
- Restricciones de producción: la integración requiere construir las entradas exactamente como la librería laya (input_ids, attention_mask, marker_pos, marker_mask, qtype). No es un modelo plug-and-play como un LLM estándar; la documentación es escasa y el repositorio tiene 0 descargas y 0 likes, lo que sugiere poca validación por parte de la comunidad.
- Fecha de creación inusual: los metadatos indican 2026-09-26, una fecha futura que podría ser un error; conviene verificarla antes de confiar en la vigencia del repositorio.
- No se proporcionan benchmarks de rendimiento en tareas downstream, por lo que se desconoce su precisión en aplicaciones reales.

## Enlaces

- HuggingFace (repositorio ONNX): https://huggingface.co/distinctinteractive/laya-onnx
- Modelo base (convaiinnovations/laya): https://huggingface.co/convaiinnovations/laya
- Repositorio Layar (gema Ruby): https://github.com/jimmckerchar/layar
- Script de exportación a ONNX: https://github.com/jimmckerchar/layar/blob/main/script/laya/export.py
- Script de verificación de paridad: https://github.com/jimmckerchar/layar/blob/main/script/laya/parity.py
- Port Ruby de la construcción de secuencia: https://github.com/jimmckerchar/layar/blob/main/lib/layar/laya.rb
- Licencia y NOTICE: disponibles en el repositorio de HuggingFace.
