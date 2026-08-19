# anmol-unitmole/grammar-correction-flan-t5-base

## Resumen

`grammar-correction-flan-t5-base` es un modelo de corrección de errores gramaticales (GEC) para inglés, desarrollado por anmol-unitmole mediante fine-tuning del modelo base `google/flan-t5-base`. Está orientado a tareas de texto-a-texto: recibe una oración con errores gramaticales y devuelve la versión corregida. El checkpoint seleccionado, denominado «Base Conservative 30% Identity», fue elegido tras experimentos controlados que comparaban diferentes ratios de ejemplos de identidad (oraciones ya correctas) en el conjunto de entrenamiento, con el objetivo de reducir ediciones innecesarias sobre texto limpio sin sacrificar demasiado la calidad de corrección.

Con 247 millones de parámetros, es un modelo relativamente ligero, apto para entornos con recursos limitados y para inferencia en tiempo real. El autor lo presenta como un modelo de investigación medido y no como un corrector certificado para producción. Su licencia Apache-2.0 permite uso comercial sin restricciones, aunque la model card advierte que no cumple todos los umbrales de calidad que el propio proyecto se había marcado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) base |
| Parámetros totales | 247.577.856 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa la arquitectura T5 (Text-to-Text Transfer Transformer) en su variante base, un encoder-decoder Transformer originalmente publicado por Google. El fine-tuning se realizó sobre el checkpoint `google/flan-t5-base`, que ya incorpora el fine-tuning instructivo de FLAN. El entrenamiento de corrección gramatical se llevó a cabo con una combinación de datos de BEA-2019 W&I+LOCNESS, datos de evaluación basados en JFLEG, pares de errores sintéticos controlados y ejemplos de identidad (oraciones correctas) para evitar la sobre-corrección.

Se realizaron experimentos controlados con distintos ratios de ejemplos de identidad (10%, 20%, 30%) sobre dos tamaños de modelo (Small y Base). El checkpoint final seleccionado, «Base Conservative 30% Identity», fue elegido porque mantuvo un ERRANT F0.5 casi idéntico al mejor baseline (0.4527 frente a 0.4530) mientras mejoraba la precisión (0.5053 frente a 0.4989) y reducía la tasa de sobre-corrección en texto limpio (25.73% frente a 29.38%). No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Corrección gramatical de texto en inglés: detecta y corrige errores de concordancia, tiempos verbales, artículos, preposiciones y otros errores sintácticos.
- Generación texto-a-texto: recibe una oración con errores y devuelve la versión corregida.
- Preservación de números y cantidades: mantiene el 99.72% de los números y cantidades originales tras la corrección.
- Preservación de entidades nombradas: conserva el 93.57% de las entidades detectadas (nombres propios, lugares, etc.).
- Preservación de términos técnicos: mantiene el 99.63% de la terminología técnica.
- Soporte para `text-generation-inference` y `endpoints_compatible` según los tags del repositorio.
- No se indica soporte para tool calling, agentes, visión ni modos de razonamiento especiales.

## Casos de uso

- Asistente de escritura en inglés: el modelo puede integrarse en editores de texto o procesadores para ofrecer sugerencias de corrección gramatical en tiempo real. Su tamaño compacto (247M parámetros) permite ejecutarse en local con latencias por debajo de 100 ms por elemento en modo por lotes.
- Preprocesamiento de texto para pipelines de NLP: antes de aplicar análisis de sentimiento, extracción de entidades u otras tareas, se puede usar para normalizar el texto y reducir ruido gramatical.
- Herramientas de revisión de documentos académicos y profesionales: puede ayudar a revisar borradores en inglés, aunque su tasa de sobre-corrección (25.73%) obliga a supervisión humana.
- Plataformas de aprendizaje de idiomas: el modelo puede generar versiones corregidas de oraciones de estudiantes para ejercicios de práctica.
- Corrección de texto en tiempo real en aplicaciones de chat o mensajería: su latencia media de 75.85 ms por elemento en modo por lotes lo hace viable para integraciones interactivas.
- Preprocesado de datos para entrenamiento de otros modelos: se puede usar para limpiar corpus en inglés antes de entrenar o ajustar otros modelos, aunque la tasa de sobre-corrección debe tenerse en cuenta.

## Benchmarks y rendimiento

Los resultados de evaluación publicados en la model card se obtuvieron sobre un conjunto de evaluación retenido de 2.487 registros, que incluye 1.088 oraciones con correcciones y 1.399 oraciones limpias, más un benchmark independiente de 988 oraciones limpias. La tabla siguiente muestra las métricas del checkpoint seleccionado:

| Métrica | Valor |
|---|---|
| ERRANT F0.5 | 0.4527 |
| Precisión | 0.5053 |
| Recall | 0.3195 |
| GLEU | 0.7835 |
| Similitud semántica | 0.9384 |
| Exactitud de oración | 0.0983 |
| Tasa de sobre-corrección en texto limpio | 25.73% |
| Preservación de números | 99.72% |
| Preservación de entidades nombradas | 93.57% |
| Preservación de términos técnicos | 99.63% |
| Latencia media por lote | 75.85 ms/item |
| P95 latencia por lote | 152.94 ms/item |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 247M parámetros. En FP32 ocuparía aproximadamente 1 GB, en FP16 unos 0.5 GB y en cuantización int8 podría reducirse a unos 0.25 GB. No se proporcionan datos de cuantización oficiales.
- GPU recomendadas: el autor indica en los tags la RTX 5090, aunque el modelo es lo suficientemente pequeño para ejecutarse en cualquier GPU con más de 2 GB de VRAM, incluidas tarjetas consumer como RTX 3060, RTX 4060 o incluso CPUs con suficiente RAM.
- Cabe en GPU consumer: sí, con margen amplio.
- Opciones de despliegue: al ser un modelo de la familia T5 con formato safetensors, puede desplegarse con librerías como Hugging Face Transformers, TGI (Text Generation Inference), vLLM, o mediante servidores compatibles con endpoints. También se puede exportar a ONNX para optimizaciones.
- Latencia y throughput: latencia media de 75.85 ms por elemento en modo por lotes y P95 de 152.94 ms, según los datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Especialización | Licencia |
|---|---|---|---|---|
| anmol-unitmole/grammar-correction-flan-t5-base | 247M | T5-base | Corrección gramatical en inglés | Apache-2.0 |
| AventIQ-AI/t5-base-grammar-correction-for-writing-assistance | 247M (base T5) | T5-base | Corrección gramatical para asistencia de escritura | no disponible |
| jbochi/flan-t5-base-spelling | 247M | T5-base | Corrección ortográfica | no disponible |

Los tres modelos comparten la arquitectura T5-base y tamaño similar, pero no se dispone de comparativas de rendimiento entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Tasa de sobre-corrección alta: el 25.73% de las oraciones limpias se modifican innecesariamente, lo que puede degradar texto ya correcto si se usa sin supervisión.
- Exactitud de oración muy baja: solo el 9.83% de las oraciones corregidas coinciden exactamente con la referencia, lo que indica que las correcciones suelen ser parciales o imperfectas.
- Preservación de entidades nombradas limitada: el 93.57% de las entidades detectadas se conservan, por debajo del 98% que el propio proyecto definió como objetivo.
- Solo soporta inglés: no funciona con otros idiomas.
- Modelo de investigación, no certificado para producción: la propia model card lo presenta como «medido portfolio/research model» y no como un corrector gramatical certificado.
- No cumple todos los gates de calidad del proyecto: la tasa de sobre-corrección (25.73%) y la preservación de entidades (93.57%) no alcanzan los objetivos definidos (≤8% y ≥98% respectivamente).
- No se proporcionan datos de cuantización ni de contexto máximo, por lo que no es posible validar su comportamiento en entornos de producción con requisitos específicos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/anmol-unitmole/grammar-correction-flan-t5-base
- Demo estática (en despliegue): https://huggingface.co/spaces/anmol-unitmole/05-grammar-error-correction-t5-encoder-decoder
- Modelo base: https://huggingface.co/google/flan-t5-base
