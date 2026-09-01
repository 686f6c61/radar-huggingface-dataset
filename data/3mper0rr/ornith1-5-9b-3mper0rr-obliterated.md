# 3MPER0RR/Ornith1.5-9B-3MPER0RR-obliterated

## Resumen

Ornith1.5-9B-3MPER0RR-obliterated es una variante modificada del modelo Ornith-1.5-9B, publicada por el usuario 3MPER0RR en Hugging Face. El modelo original, desarrollado por ornith-ai, forma parte de la familia Ornith-1.5, que introduce un marco de auto-mejora (self-scaffolding) en el que el propio modelo genera tareas de entrenamiento, diseña andamiajes (scaffolds) y produce soluciones para aprendizaje por refuerzo. Esta versión concreta, etiquetada como "obliterated", sugiere una modificación no oficial orientada a eliminar restricciones de contenido o alineación, aunque no se aporta documentación técnica al respecto.

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), un tamaño que lo sitúa en la gama de modelos densos medianos. El tag `qwen3_5` en los metadatos indica que la arquitectura probablemente deriva de la familia Qwen 3.5, aunque no hay confirmación oficial. La licencia es MIT, lo que permite uso comercial y modificación sin restricciones significativas. El repositorio ocupa 18,8 GB, consistente con pesos en formato safetensors en precisión FP16. No se dispone de información sobre la longitud de contexto, idiomas soportados ni cuantizaciones disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen 3.5 (según tag, sin confirmación oficial) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de esta variante. El tag `qwen3_5` sugiere que el modelo base es un transformer denso similar a los de la serie Qwen 3.5, probablemente con atención de múltiples cabezas y capas de normalización estándar. El modelo original Ornith-1.5, según el blog de ornith.ai, emplea un marco de auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de soluciones que se utilizan para aprendizaje por refuerzo. Este proceso crea un bucle continuo de auto-entrenamiento. Sin embargo, la variante "obliterated" no incluye documentación sobre su proceso de entrenamiento, datos utilizados o si se aplicaron técnicas como RLHF o DPO. Se desconoce si la modificación afectó a los pesos originales o solo a la capa de salida.

## Capacidades

No se han documentado capacidades específicas para esta variante. Dado que se basa en un modelo de 9,4B parámetros de la familia Qwen, es razonable esperar que herede capacidades generales de generación de texto, razonamiento, comprensión de código y matemáticas, así como posible soporte multilingüe. Sin embargo, al ser una modificación "obliterated", no hay garantías de que estas capacidades se mantengan intactas. No se dispone de información sobre tool calling, agentes, visión o audio. El modelo no presenta pipeline definido en Hugging Face, lo que indica que no se ha configurado para tareas específicas como generación de texto o chat.

## Casos de uso

No existen casos de uso documentados para esta variante concreta. Dado su tamaño y licencia MIT, podría emplearse en escenarios genéricos de generación de texto, pero la falta de documentación y de validación de rendimiento hace recomendable evaluarlo antes de cualquier uso en producción. Posibles aplicaciones teóricas incluyen:

- Prototipado rápido de aplicaciones de lenguaje natural: al ser un modelo de 9,4B con licencia permisiva, puede servir para experimentar con generación de texto, resúmenes o clasificación sin coste de licencia.
- Investigación en alineación y seguridad: al ser una versión "obliterated", puede utilizarse para estudiar el impacto de eliminar restricciones de contenido en modelos de tamaño medio.
- Fine-tuning para dominios específicos: su tamaño moderado permite ajustarlo con recursos limitados, por ejemplo para tareas de análisis de sentimiento o extracción de información.
- Generación de código asistida: si hereda las capacidades de Qwen, podría emplearse para autocompletar código o generar scripts, aunque no hay evidencia de ello.
- Chatbots experimentales: en entornos de investigación donde no se requiera moderación de contenido, podría servir como base para asistentes conversacionales.
- Evaluación comparativa de modelos "obliterated": útil para medir diferencias de comportamiento frente a la versión original, un tema de interés en la comunidad de IA abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original Ornith-1.5-35B-A3B (versión MoE de 35B con 3B activos) reporta mejoras frente a Qwen 3.6-35B y Gemma 4-31B, pero estos datos no son aplicables a la variante de 9B ni a la modificación "obliterated". No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otros conjuntos de referencia para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros en FP16, el modelo requiere aproximadamente 18,8 GB de VRAM solo para los pesos. Con cuantización de 8 bits (si estuviera disponible) bajaría a ~9,4 GB, y con 4 bits a ~4,7 GB, pero no se ofrecen archivos cuantizados en el repositorio.
- GPU recomendadas: para FP16 se necesita una GPU con al menos 24 GB de VRAM, como RTX 3090, RTX 4090 o A10G. Con cuantización de 4 bits (si se generara) cabría en GPUs de 8 GB como RTX 3060 o RTX 4060.
- Si cabe en consumer GPU: sí, en GPUs de gama alta (24 GB) sin cuantizar; en GPUs de 12-16 GB solo con cuantización, que no está disponible actualmente.
- Opciones de despliegue: al no haber archivos GGUF ni configuración para vLLM u Ollama, el despliegue requeriría convertir los pesos a un formato compatible. Se podría usar Transformers de Hugging Face con carga en FP16, o convertir a GGUF con llama.cpp.
- Latencia y throughput: no disponible. Dependerá del hardware y del backend elegido.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar este modelo con alternativas de la misma categoría. Modelos comparables en tamaño serían Llama 3.1 8B, Qwen 2.5 7B o Mistral 7B, pero no hay información sobre cómo se comporta Ornith1.5-9B frente a ellos. La única referencia indirecta es que el Ornith-1.5-35B-A3B supera a Qwen 3.6-35B, pero eso no se puede extrapolar al 9B. Por tanto, la comparativa queda pendiente de evaluación empírica.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser una modificación "obliterated", es probable que se hayan eliminado mecanismos de alineación, lo que puede aumentar la generación de contenido sesgado, ofensivo o perjudicial.
- Riesgo de alucinacion: alto, como en la mayoría de modelos de este tamaño, y sin garantías de fiabilidad factual.
- Limitaciones de contexto o idioma: desconocidas. No se especifica la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el autor original (ornith-ai) podría tener términos adicionales en su versión base. Se recomienda revisar la licencia del modelo original.
- Caveat para produccion: este modelo no tiene documentación, no ha sido validado y no se conocen sus capacidades reales. No es recomendable usarlo en entornos de producción sin una evaluación exhaustiva previa.
- Origen no oficial: la variante "obliterated" no está respaldada por ornith-ai, y su proceso de modificación es desconocido, lo que introduce riesgos de integridad de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3MPER0RR/Ornith1.5-9B-3MPER0RR-obliterated
- Modelo original (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Variante OBLITERATUS: https://huggingface.co/OBLITERATUS/Ornith-1.5-9B-OBLITERATED
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Página en Ollama: https://ollama.com/library/ornith-1.5
- Imagen Docker (versión 35B): https://hub.docker.com/r/ai/ornith-1.5
