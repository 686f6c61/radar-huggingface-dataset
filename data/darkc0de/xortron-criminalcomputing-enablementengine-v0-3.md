# darkc0de/XORTRON-CriminalComputing-EnablementEngine-v0.3

## Resumen

XORTRON-CriminalComputing-EnablementEngine-v0.3 es un modelo de lenguaje de 31 000 millones de parámetros desarrollado por el usuario darkc0de como parte del proyecto XORTRON Criminal Computing, una iniciativa de investigación abierta centrada en la seguridad y la alineación de la inteligencia artificial. El modelo es un fine-tuning de darkc0de/gemma-4-31B-it-updated-heretic, que a su vez deriva de Gemma 4 31B, y ha sido sometido a un proceso de «abliteración» (abliteration) para eliminar los mecanismos de rechazo ante peticiones dañinas o sensibles, lo que lo convierte en un modelo explícitamente «sin censura» (uncensored). Su propósito declarado es servir como banco de pruebas para estudiar el potencial de explotación criminal de los sistemas de IA, tal y como se describe en el informe del Congreso de los Estados Unidos citado en la propia documentación del modelo.

El modelo presenta un pipeline de image-text-to-text, lo que sugiere capacidad multimodal de entrada de imágenes junto con texto, aunque no se detallan las especificidades de dicha capacidad. Se distribuye bajo licencia Apache 2.0, con pesos completos en formato safetensors, y está pensado para su uso con transformers, text-generation-inference y Unsloth. Su relevancia actual radica en que ejemplifica una tendencia creciente de modelos «desalineados» disponibles públicamente, lo que plantea interrogantes sobre la gobernanza de la IA y la necesidad de herramientas de evaluación de riesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Gemma 4 31B; detalles exactos no disponibles) |
| Parametros totales | 31 273 086 512 (≈31,3 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica en la documentacion) |
| Tipos de cuantizacion | no disponible (solo se publican pesos completos en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 62,6 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Gemma 4 31B, un transformer denso desarrollado por Google, aunque el autor no proporciona detalles adicionales sobre la configuración exacta (número de capas, dimensiones ocultas, mecanismos de atención, etc.). El proceso de entrenamiento consiste en un fine-tuning sobre el checkpoint darkc0de/gemma-4-31B-it-updated-heretic, que ya incorpora modificaciones orientadas a reducir las restricciones de seguridad del modelo original. La técnica principal aplicada es la abliteración, un método que identifica y anula las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo o negativa, de modo que el modelo responda a cualquier petición sin filtros éticos o de seguridad. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El modelo se enmarca en el proyecto XORTRON Criminal Computing, que el autor describe como un «experimento de investigación en curso sobre seguridad y alineación de la IA», citando un informe del Congreso de los Estados Unidos sobre inteligencia artificial y explotación criminal.

## Capacidades

- Generación de texto sin restricciones de contenido: el modelo está diseñado para responder a cualquier instrucción, incluida la generación de contenido dañino, ilegal o éticamente cuestionable, sin mostrar reticencias.
- Entrada multimodal (imagen y texto): el pipeline declarado es image-text-to-text, lo que indica que puede procesar imágenes como entrada adicional, aunque no se especifican los detalles de implementación ni los formatos soportados.
- Conversación multi-turno: al estar basado en un modelo instructivo (Gemma 4 it), mantiene diálogos coherentes en múltiples turnos.
- Razonamiento y comprensión del lenguaje: conserva las capacidades generales de razonamiento del modelo base de 31B, aunque no se aportan métricas concretas.
- Sin soporte explícito de tool calling ni function calling: no se menciona esta capacidad en la documentación.
- Sin modo de pensamiento (thinking mode) declarado: no hay evidencia de un modo de razonamiento extendido como el de otros modelos.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite a investigadores estudiar cómo los sistemas de lenguaje pueden ser explotados para fines delictivos, simulando escenarios de ataque y evaluando vulnerabilidades en la alineación. Su naturaleza sin censura facilita la reproducción de comportamientos problemáticos en entornos controlados.
- Evaluación de medidas de mitigación: sirve como banco de pruebas para desarrollar y validar técnicas de detección de contenido dañino, clasificadores de seguridad o mecanismos de filtrado previos al despliegue de modelos en producción.
- Análisis de riesgos en modelos abiertos: permite comparar el comportamiento de un modelo «abliterado» frente a su versión alineada, cuantificando el impacto de eliminar los mecanismos de rechazo sobre la probabilidad de generar contenido peligroso.
- Auditoría de cumplimiento normativo: organizaciones que deban certificar la seguridad de sus sistemas de IA pueden usar este modelo como caso de estudio para entender qué tipo de salidas pueden producir los modelos sin salvaguardas, y así diseñar políticas de gobernanza más sólidas.
- Educación en ética de la IA: en cursos avanzados de seguridad informática o ética algorítmica, el modelo puede emplearse para ilustrar los dilemas asociados a la publicación de pesos abiertos y la responsabilidad de los desarrolladores.
- Desarrollo de sistemas de moderación: los equipos de moderación de contenido pueden probar sus filtros contra un modelo que genera deliberadamente texto tóxico o ilegal, mejorando la robustez de sus sistemas ante entradas adversariales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo o su variante base.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repo en safetensors es de 62,6 GB, lo que corresponde aproximadamente a pesos en FP16. Para cargar el modelo completo en memoria se necesitan al menos 64 GB de VRAM (por ejemplo, una GPU A100 de 80 GB o varias GPUs en paralelo).
- Con cuantización a 4 bits (p. ej., GPTQ o AWQ), el modelo podría caber en una GPU de 24 GB (RTX 3090/4090), aunque no se ofrecen versiones cuantizadas oficiales y habría que generarlas manualmente.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (2× RTX 4090 con tensor parallelism) para FP16.
- Opciones de despliegue: al ser un modelo de transformers, es compatible con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión).
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo de 31B en FP16 en una A100 suele generar entre 20 y 40 tokens por segundo, pero esto depende del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con modelos de la misma categoría (fine-tunes sin censura sobre Gemma 31B). No obstante, se pueden mencionar alternativas genéricas:

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| XORTRON-CriminalComputing-EnablementEngine-v0.3 | ≈31,3 B | no disponible | Apache 2.0 | Abliterado, sin censura, orientado a investigación de seguridad |
| Dolphin 2.x (por ejemplo, dolphin-2.6-mixtral-8x7b) | 46,7 B (MoE) | 32k | Apache 2.0 | Fine-tune sin censura sobre Mixtral, con tool calling |
| Nous Hermes 2 (por ejemplo, NousHermes-2-Mixtral-8x7B-DPO) | 46,7 B (MoE) | 32k | Apache 2.0 | Fine-tune con DPO, sin censura, alto rendimiento en razonamiento |
| Gemma 4 31B it (modelo base original) | ≈31,3 B | no disponible | Gemma Terms of Use | Versión alineada con restricciones de seguridad |

La comparación es limitada porque no hay datos de rendimiento publicados para XORTRON, y los modelos alternativos citados son de arquitecturas diferentes (MoE vs. denso). La principal diferencia radica en el enfoque de abliteración explícita y el propósito de investigación criminalística.

## Limitaciones y advertencias

- Sesgos y toxicidad: al ser un modelo deliberadamente sin censura, es probable que reproduzca y amplifique sesgos sociales, lenguaje ofensivo y contenido discriminatorio. No se ha realizado ninguna evaluación de sesgos ni mitigación.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, pero al carecer de filtros, estas alucinaciones pueden ser particularmente peligrosas si se usan en contextos de toma de decisiones.
- Riesgo de uso malintencionado: el modelo puede generar instrucciones para actividades ilegales (ciberdelincuencia, fabricación de armas, etc.). Su distribución abierta bajo Apache 2.0 permite cualquier uso, incluido el comercial, lo que aumenta el riesgo de explotación.
- Limitaciones de idioma: solo soporta inglés, lo que restringe su uso en entornos multilingües.
- Contexto no especificado: se desconoce la longitud máxima de contexto, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- Sin garantías de calidad: no hay benchmarks publicados, por lo que el rendimiento real en tareas estándar es desconocido.
- Consideraciones éticas: el uso de este modelo en entornos de producción no es recomendable bajo ninguna circunstancia, dado su propósito explícito de eludir las salvaguardas de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkc0de/XORTRON-CriminalComputing-EnablementEngine-v0.3
- Organización XORTRON en Hugging Face: https://huggingface.co/xortron
- Informe del Congreso de EE. UU. sobre IA y explotación criminal: https://www.congress.gov/119/chrg/CHRG-119hhrg61182/CHRG-119hhrg61182.pdf
- Modelo relacionado (versión 27B): https://huggingface.co/darkc0de/XORTRON.CriminalComputing.2026.27B.Instruct
- Modelo relacionado (versión 4B): https://huggingbay.xyz/artifact/hf-model-darkc0de-xortron-criminalcomputing-2026-4b-instruct-next
