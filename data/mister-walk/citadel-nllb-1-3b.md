# Mister-Walk/citadel-nllb-1.3B

## Resumen

El modelo `Mister-Walk/citadel-nllb-1.3B` es un checkpoint alojado en Hugging Face con 1.370.638.336 parámetros (1,37 B), etiquetado con `transformers`, `safetensors`, `m2m_100` y `text2text-generation`. El nombre y las etiquetas sugieren que se trata de una variante o adaptación de la familia NLLB-200 de Meta, diseñada para traducción automática multilingüe. Sin embargo, la model card es completamente genérica y no aporta información sobre el desarrollador, el propósito específico, el proceso de entrenamiento ni la licencia.

El repositorio tiene 5,5 GB de peso, lo que es coherente con un modelo de 1,3 B de parámetros almacenado en precisión fp16 o similar. A fecha de su creación (agosto de 2026) no registra descargas ni valoraciones, por lo que es un modelo recién publicado y sin validación comunitaria. Su relevancia actual es limitada: sin documentación adicional, su utilidad práctica queda restringida a experimentos de traducción basados en la arquitectura NLLB/M2M-100, pero no puede confirmarse sin más datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas sugieren transformer de tipo m2m_100/NLLB) |
| Parametros totales | 1.370.638.336 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay información oficial sobre la arquitectura interna del modelo. Las etiquetas `m2m_100` y `text2text-generation` apuntan a que sigue el esquema de los modelos de traducción multilingüe de la familia M2M-100/NLLB, que emplean una arquitectura transformer encoder-decoder con atención densa. Sin embargo, no se confirma si se trata de un fine-tune de `facebook/nllb-200-1.3B`, una destilación o un entrenamiento desde cero. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La model card indica explícitamente `[More Information Needed]` en todas las secciones relevantes, por lo que cualquier afirmación sobre el entrenamiento sería especulativa.

## Capacidades

- Traducción automática multilingüe: por las etiquetas `m2m_100` y `text2text-generation`, es probable que el modelo realice traducción entre múltiples idiomas, pero no se especifica cuáles ni el número de pares soportados.
- Generación de texto condicionada: al ser un modelo encoder-decoder, puede generar texto a partir de una entrada, típicamente en tareas de traducción o paráfrasis.
- No se dispone de información sobre capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio. No hay evidencia de que las posea.

## Casos de uso

- Traducción de documentos técnicos: si el modelo funciona como un NLLB-200 de 1,3 B, podría emplearse para traducir manuales, artículos o documentación entre idiomas de alta y baja disponibilidad, aunque sin confirmación de los idiomas soportados.
- Traducción en tiempo real para soporte al cliente: un despliegue con vLLM o TGI permitiría integrar el modelo en un pipeline de chat multilingüe, siempre que se verifique su calidad.
- Preprocesamiento de corpus multilingüe: para alinear o traducir datasets antes de entrenar otros modelos, aprovechando su tamaño moderado.
- Investigación académica sobre adaptación de NLLB: si se trata de un fine-tune, puede servir como punto de partida para estudiar transferencia de conocimiento entre variantes de traducción.
- Generación de subtítulos o doblaje automático: en flujos de postproducción, el modelo podría traducir guiones o subtítulos si se valida su rendimiento.
- Evaluación comparativa de modelos de traducción: al ser un checkpoint poco documentado, puede usarse como caso de estudio para medir el impacto de la documentación en la adopción de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y no hay referencias a papers o informes técnicos que las reporten. Tampoco se dispone de comparaciones con otros modelos en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,37 B de parámetros, en fp16 se necesitan aproximadamente 2,7 GB solo para los pesos, más overhead de activaciones y caché. En int8 bajaría a ~1,4 GB y en int4 a ~0,7 GB, pero no se ofrecen cuantizaciones en el repo.
- GPU recomendadas: una GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) podría ejecutar el modelo en fp16 con batch pequeño. Para mayor comodidad, una RTX 3060 o superior es suficiente.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja gracias a su tamaño moderado.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (tras conversión). El tag `endpoints_compatible` sugiere que es compatible con los endpoints de Hugging Face.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 1,3 B en una GPU moderna (RTX 3090) puede procesar decenas de tokens por segundo, pero depende de la implementación y el hardware.

## Comparativa con modelos similares

Dado que no se confirma la relación con NLLB-200, se comparan los modelos de referencia más probables, pero no se garantiza que este checkpoint sea equivalente.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `Mister-Walk/citadel-nllb-1.3B` | 1,37 B | no disponible | no disponible | no disponible | safetensors |
| `facebook/nllb-200-1.3B` | 1,3 B | 512 tokens (por frase) | 200 idiomas | CC-BY-NC 4.0 | safetensors, PyTorch |
| `facebook/nllb-200-distilled-1.3B` | 1,3 B | 512 tokens | 200 idiomas | CC-BY-NC 4.0 | safetensors, PyTorch |
| `facebook/m2m100-1.2B` | 1,2 B | 1024 tokens | 100 idiomas | MIT | PyTorch, TensorFlow |

La comparativa muestra que el modelo objeto de esta ficha carece de información pública, mientras que los modelos de referencia tienen documentación completa y licencias claras. No se puede afirmar que `citadel-nllb-1.3B` ofrezca el mismo rendimiento que NLLB-200 o M2M-100.

## Limitaciones y advertencias

- La model card no contiene ninguna información sobre sesgos, riesgos o limitaciones técnicas. Se desconoce si el modelo fue entrenado con datos equilibrados o si presenta sesgos de género, culturales o lingüísticos.
- Riesgo de alucinación: al ser un modelo de traducción, puede generar traducciones incorrectas o inventar contenido si se usa fuera de su dominio de entrenamiento, pero no hay datos que lo confirmen.
- Limitaciones de contexto: no se especifica la longitud máxima de entrada. Los modelos NLLB-200 típicamente usan 512 tokens por frase, pero este checkpoint podría diferir.
- Restricciones de licencia: al no indicarse licencia, no se puede determinar si su uso comercial está permitido. Se recomienda contactar al autor antes de usarlo en producción.
- Falta de validación: con 0 descargas y 0 likes, el modelo no ha sido probado por la comunidad. Cualquier uso en producción requiere una evaluación exhaustiva previa.
- Ausencia de documentación: la model card es un placeholder generado automáticamente, lo que impide conocer el proceso de entrenamiento, los datos usados y las condiciones de uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mister-Walk/citadel-nllb-1.3B
- Modelo de referencia NLLB-200 1.3B (Meta): https://huggingface.co/facebook/nllb-200-1.3B
- Modelo destilado NLLB-200 1.3B (Meta): https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Guía de uso de NLLB-200 1.3B (AI Indigo): https://aiindigo.com/tutorials/getting-started-with-nllb-200-1-3b-lightweight-multilingual-translation
- Repositorio espejo de NLLB-200 1.3B (bigdataai-lab): https://github.com/bigdataai-lab/nllb-200-1.3B
