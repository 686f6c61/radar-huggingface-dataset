# ads2009/turkish-ai-text-detector-distilberturk-v6

## Resumen

El modelo `ads2009/turkish-ai-text-detector-distilberturk-v6` es un clasificador de texto diseñado para detectar si un texto en turco ha sido generado por inteligencia artificial. Desarrollado por el usuario ads2009, forma parte de una serie de iteraciones (v1, v3, v6) que refinan progresivamente esta tarea. El nombre y los tags del repositorio indican que se basa en la arquitectura DistilBERT, concretamente en una variante adaptada al turco (DistilBERTurk), y utiliza el pipeline de clasificación de texto de la librería Transformers.

Con 68 millones de parámetros, es un modelo compacto y ligero, adecuado para entornos con recursos limitados. Aunque la model card publicada no contiene información detallada sobre entrenamiento, datos o métricas, su propósito es claro: distinguir entre texto humano y texto sintético en turco, una necesidad creciente ante la proliferación de contenido generado por ChatGPT, Claude u otras herramientas. Su relevancia actual radica en la demanda de herramientas de verificación de autenticidad en medios, educación y moderación de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (variante turca, según nombre y tags) |
| Parametros totales | 68.090.114 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (inferido por el nombre; no declarado oficialmente) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a DistilBERT, un modelo transformer destilado que reduce el tamaño de BERT en un 40 % manteniendo el 97 % de sus capacidades lingüísticas, según el paper original (arxiv:1910.09700). El tag `distilbert` y el nombre `distilberturk` apuntan a una adaptación específica para el turco, probablemente entrenada sobre un corpus turco y posteriormente afinada para la tarea de detección de texto generado por IA.

No se dispone de información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se emplearon técnicas como fine-tuning supervisado o aprendizaje por refuerzo. La model card no incluye hiperparámetros, régimen de entrenamiento ni detalles de preprocesamiento. Tampoco se documentan innovaciones técnicas específicas más allá de la propia arquitectura base.

## Capacidades

- Clasificación de texto binaria: distingue entre texto turco escrito por humanos y texto generado por IA.
- Procesamiento de secuencias de longitud variable, limitado por la ventana de contexto de DistilBERT (típicamente 512 tokens, aunque no confirmado para esta versión).
- Inferencia rápida y ligera gracias al tamaño reducido del modelo (68M parámetros).
- Integración nativa con el ecosistema Transformers y compatible con Text Embeddings Inference (según tags).
- No se documentan capacidades adicionales como tool calling, agentes, visión o audio.

## Casos de uso

- Verificación de autenticidad en medios de comunicación: un periodista puede pasar un texto turco por el modelo para comprobar si fue redactado por una persona o generado automáticamente, ayudando a detectar desinformación o contenido fabricado.
- Moderación de contenido en plataformas sociales: integrado en un pipeline de moderación, el modelo puede marcar publicaciones sospechosas de ser generadas por bots para su revisión manual.
- Control de calidad en educación: los profesores pueden utilizar el detector para evaluar si las tareas entregadas por estudiantes en turco son originales o han sido producidas con herramientas de IA generativa.
- Filtrado de comentarios automatizados: en foros o secciones de comentarios, el modelo puede identificar respuestas spam generadas por IA y bloquearlas antes de su publicación.
- Auditoría de contenido en marketing: las agencias pueden verificar que los textos promocionales en turco sean auténticos y no estén generados por IA, preservando la confianza de la marca.
- Investigación académica sobre detección de IA: sirve como punto de partida para estudios sobre robustez de detectores en turco, permitiendo comparar con otros modelos o afinarlo con nuevos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones con otros detectores. Tampoco se encontraron evaluaciones externas en la búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 68M parámetros, la inferencia en FP32 requiere aproximadamente 260 MB de memoria (68M × 4 bytes). Con cuantización a int8, se reduce a unos 70 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionan sin problemas. También es viable en CPU.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer actual e incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: compatible con Transformers (Python), ONNX Runtime, Text Embeddings Inference (según tags), y puede exportarse a GGUF para su uso con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles. Para un modelo de este tamaño, se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. Existen otros detectores de texto AI en turco, como el proyecto `SaKinLord/turkish-ai-detector` en GitHub, que utiliza señales de curvatura del modelo de lenguaje y un meta-clasificador a nivel de documento, pero no se han publicado métricas comparables. Tampoco hay datos sobre modelos comerciales como GPTZero o Turnitin aplicados al turco. Por tanto, la comparativa queda pendiente de datos públicos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un modelo afinado sobre un corpus específico, puede presentar sesgos hacia ciertos registros lingüísticos o dominios (por ejemplo, textos formales frente a coloquiales).
- Riesgo de alucinación: en tareas de clasificación binaria, el riesgo se traduce en falsos positivos (texto humano marcado como IA) o falsos negativos (texto IA no detectado). No se conocen las tasas de error.
- Limitaciones de contexto: la ventana de DistilBERT es típicamente de 512 tokens; textos más largos requerirán truncamiento o estrategias de ventana deslizante, lo que puede afectar a la precisión.
- Restricciones de idioma: el modelo está orientado al turco; su uso en otros idiomas producirá resultados poco fiables.
- Licencia: no especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución. Se recomienda contactar con el autor antes de integrarlo en productos.
- Producción: al no haber benchmarks ni documentación de entrenamiento, no se puede garantizar su rendimiento en entornos reales. Es necesario validarlo con datos propios antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ads2009/turkish-ai-text-detector-distilberturk-v6
- Versión anterior v3: https://huggingface.co/ads2009/turkish-ai-text-detector-distilberturk-v3
- Versión inicial v1: https://huggingface.co/ads2009/turkish-ai-text-detector-distilberturk
- Proyecto relacionado en GitHub (SaKinLord): https://github.com/SaKinLord/turkish-ai-detector
- Herramienta online Turkish AI Detector: https://evernote.com/ai-detector/turkish-ai-detector
- Detector alternativo en ai-checker.co: https://ai-checker.co/in/turkish
- Paper de DistilBERT (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
