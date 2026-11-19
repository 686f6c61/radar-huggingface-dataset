# MohammadJRanjbar/parsbert-persian-punctuation

## Resumen

ParsBERT Persian Punctuation es un modelo de restauración de puntuación para persa (farsi) desarrollado por MohammadJRanjbar. Se trata de un fine-tuning de `HooshvareLab/bert-base-parsbert-uncased`, el encoder BERT base preentrenado en persa por HooshvareLab, adaptado mediante token classification para insertar signos de puntuación en texto plano que carece de ellos. El modelo resuelve un problema recurrente en corpus persas digitalizados, transcripciones ASR y texto generado sin formato: la ausencia de puntuación que dificulta la legibilidad, el procesamiento downstream y el entrenamiento de modelos de lenguaje.

Con 162.254.597 parámetros y un repositorio de 0,6 GB en formato safetensors, es un modelo compacto y desplegable en hardware modesto. Su relevancia actual radica en que la puntuación automática es un paso previo habitual en pipelines de normalización de texto persa, especialmente en la preparación de datos para entrenamiento y en la post-producción de transcripciones. El modelo está publicado bajo licencia MIT, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

La arquitectura es la de un transformer encoder BERT estándar, sin innovaciones arquitectónicas propias: el valor del modelo reside en el fine-tuning específico sobre el dataset `MohammadJRanjbar/PersianPunc` y en su integración directa con el ecosistema Hugging Face mediante el pipeline `token-classification`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base) |
| Parametros totales | 162.254.597 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de ParsBERT base; típicamente 512 tokens, no confirmado en la ficha) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; cuantización no documentada) |
| Idiomas soportados | persa (fa) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | HooshvareLab/bert-base-parsbert-uncased |
| Tarea | token-classification (restauración de puntuación) |
| Dataset de entrenamiento | MohammadJRanjbar/PersianPunc |
| Acceso | restringido (gated) |
| Descargas | 370 |
| Likes | 5 |

## Arquitectura y entrenamiento

El modelo parte de `HooshvareLab/bert-base-parsbert-uncased`, un BERT base preentrenado específicamente en persa por HooshvareLab. Sobre esa base se aplica un fine-tuning de token classification con una cabeza de clasificación por token que asigna a cada posición una etiqueta de puntuación (o ausencia de ella). No se documentan en la información disponible innovaciones como atención lineal, decodificación especulativa ni arquitecturas híbridas; se trata de un encoder transformer convencional.

Los datos de entrenamiento provienen del dataset `MohammadJRanjbar/PersianPunc`, publicado por el mismo autor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus, ni si se emplearon técnicas de RLHF o DPO (poco habituales en tareas de etiquetado por token). Tampoco se detalla la estrategia de enmascaramiento de puntuación utilizada para construir los pares entrada-salida durante el fine-tuning.

## Capacidades

- Restauración de puntuación en texto persa: inserta signos como coma, punto, punto y coma, signos de interrogación y exclamación, y posiblemente otros según el esquema de etiquetas del dataset.
- Clasificación por token: el pipeline `token-classification` permite obtener etiquetas por posición, lo que facilita integraciones personalizadas.
- Procesamiento de texto sin formato: adecuado para corpus digitalizados, subtítulos, transcripciones y texto generado sin puntuar.
- Multilingüe: no; el modelo está entrenado y etiquetado exclusivamente para persa (`fa`).
- Tool calling / function calling: no soportado (no es un modelo generativo conversacional).
- Capacidades de agente o razonamiento multi-paso: no aplica.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Normalización de transcripciones ASR en persa: tras un sistema de reconocimiento de voz que produce texto sin puntuar, el modelo inserta puntuación para mejorar la legibilidad y facilitar el alineamiento con subtítulos.
- Preparación de corpus para entrenamiento de LLM: los corpus persas raspados de web suelen carecer de puntuación consistente; este modelo permite restaurarla antes de tokenizar y entrenar, mejorando la calidad de los datos.
- Post-procesado de OCR en documentos persas: digitalizaciones de libros o prensa histórica generan texto plano; el modelo añade puntuación para hacerlo legible y procesable.
- Enriquecimiento de datasets para NLP persa: anotación automática de puntuación en corpus no etiquetados para tareas downstream como análisis de sentimiento o segmentación discursiva.
- Herramientas de edición y corrección: integración en editores de texto o correctores ortográficos persas para sugerir puntuación en tiempo real.
- Pipeline de subtitulado: inserción de puntuación en subtítulos generados automáticamente para cumplir estándares de accesibilidad.
- Preprocesado en sistemas de búsqueda y recuperación: la puntuación restaurada mejora la segmentación de frases y la indexación en motores de búsqueda persas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6–1,2 GB en fp32 (162 M parámetros) y menos de 0,5 GB en fp16; en la práctica, cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencia aceptable para lotes pequeños. Para alto throughput, una T4, RTX 3060 o superior es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 2060, RTX 3060, RTX 4090, etc.) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: pipeline `token-classification` de Hugging Face Transformers, ONNX Runtime, TorchScript, o servidores de inferencia como TGI (con soporte de token classification) y vLLM (no orientado a este tipo de tarea). Para CPU, ONNX Runtime ofrece buen rendimiento.
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un modelo BERT base de 162 M parámetros, se espera un throughput de cientos a miles de tokens por segundo en GPU moderna y decenas en CPU, pero no se confirma con datos del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Acceso |
|---|---|---|---|---|---|
| MohammadJRanjbar/parsbert-persian-punctuation | 162 M | no disponible | Restauración de puntuación (fa) | MIT | Gated |
| HooshvareLab/bert-base-parsbert-uncased | ~162 M | 512 (típico BERT) | MLM base (fa) | Apache 2.0 (según ficha original) | Abierto |
| xlm-roberta-base (fine-tune para puntuación) | ~278 M | 512 | Multilingüe, requiere fine-tuning específico | MIT | Abierto |
| mBERT (bert-base-multilingual-cased) | ~178 M | 512 | Multilingüe, requiere fine-tuning | Apache 2.0 | Abierto |

La comparativa se limita a modelos base o alternativas genéricas, ya que no se dispone de información sobre otros fine-tunes específicos de puntuación persa en la documentación proporcionada. El modelo destaca por su especialización y licencia permisiva, aunque su acceso restringido y su reducido número de descargas (370) indican una adopción limitada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un corpus específico (`PersianPunc`), puede reflejar los sesgos de estilo y registro de dicho corpus.
- Riesgo de alucinación: bajo en el sentido generativo, pero puede insertar puntuación incorrecta en estructuras sintácticas ambiguas o en texto con errores ortográficos.
- Limitaciones de contexto: no se confirma la longitud máxima, pero al heredar de ParsBERT base es probable que esté limitado a 512 tokens; textos más largos requerirán segmentación.
- Limitaciones de idioma: solo persa; no soporta otros idiomas ni variantes dialectales no representadas en el corpus.
- Restricciones de licencia: MIT permite uso comercial, pero el acceso gated requiere aceptar condiciones en Hugging Face; conviene revisar los términos exactos de la ficha.
- Caveat para producción: el modelo está entrenado para una tarea concreta y no debe usarse como modelo generativo ni para otras tareas de NLP sin fine-tuning adicional; la calidad depende de la coincidencia entre el dominio de entrada y el dataset `PersianPunc`.
- El número de descargas (370) y likes (5) sugiere poca validación comunitaria; se recomienda evaluar en el dominio objetivo antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/MohammadJRanjbar/parsbert-persian-punctuation
- Dataset: https://huggingface.co/datasets/MohammadJRanjbar/PersianPunc
- Modelo base: https://huggingface.co/HooshvareLab/bert-base-parsbert-uncased
- Repositorio ParsBERT (HooshvareLab): no disponible en la información proporcionada
- Paper de ParsBERT: no disponible en la información proporcionada
