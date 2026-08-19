# alexander2323/Qwen3.8-27B-Uncensored-Heretic-Abliterated

## Resumen

El modelo `alexander2323/Qwen3.8-27B-Uncensored-Heretic-Abliterated` es una variante del modelo Qwen3.8-27B (de 27 mil millones de parámetros) en la que se han eliminado los mecanismos de rechazo de contenido mediante una técnica de ablación direccional. Desarrollado por el usuario alexander2323, el objetivo es ofrecer un modelo que responda a cualquier solicitud sin las restricciones de seguridad habituales, manteniendo al mismo tiempo la calidad del razonamiento y el conocimiento del modelo base.

La abliteración se realizó con la herramienta Heretic 1.4.0, empleando 300 pruebas de optimización con Optuna sobre las 64 capas del transformer. El resultado es un modelo con una tasa de rechazo de solo el 6 % (94 % de supresión) y una deriva de calidad medida por divergencia KL de 0,0874 respecto al original. Se distribuye bajo licencia Apache 2.0, igual que su base, y está pensado como herramienta de investigación para quienes necesitan un modelo sin filtros de seguridad.

La relevancia de este modelo radica en que ofrece una alternativa a los ajustes finos o parches de instrucciones para eliminar rechazos, con una degradación mínima de las capacidades generales. Es útil para estudiar el comportamiento de los modelos de lenguaje sin alineación, así como para aplicaciones que requieren respuestas sin censura en dominios sensibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (base: Qwen3.8-27B) |
| Parametros totales | 27 mil millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.8-27B, un transformer autoregresivo de 27 mil millones de parámetros, aunque no se proporcionan detalles adicionales sobre su diseño (número de capas, cabezas de atención, etc.) en la información disponible. El proceso de abliteración consiste en una ablación direccional: se identifican y eliminan los vectores de peso que codifican el comportamiento de rechazo, sin tocar el resto de la red.

El entrenamiento de la abliteración se realizó con la herramienta Heretic 1.4.0, ejecutando 300 pruebas de hiperparámetros mediante Optuna para encontrar el punto óptimo de Pareto entre la supresión de rechazos y la preservación de la calidad del modelo. El hardware utilizado fue una NVIDIA H200 NVL, con un tiempo total de 1 hora y 22 minutos. No se menciona el uso de RLHF, DPO u otras técnicas de ajuste; el proceso es puramente de modificación de pesos.

## Capacidades

- Generación de texto sin rechazos: responde a solicitudes que el modelo base rechazaría, incluyendo temas violentos, ilegales, adultos o controvertidos.
- Preservación de razonamiento, codificación y conocimiento: la ablación no degrada significativamente las capacidades cognitivas del modelo base (deriva KL de 0,0874).
- Soporte de instrucciones y conversación: al estar basado en Qwen3.8-27B, conserva las habilidades de seguir instrucciones y mantener diálogos multi-turno.
- No se especifican capacidades adicionales como tool calling, visión, audio o modo de razonamiento explícito; se asume que son las mismas que las del modelo base, pero no están confirmadas.

## Casos de uso

- Investigación sobre alineación y seguridad: permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, comparando respuestas con el modelo original para analizar el impacto de la alineación.
- Desarrollo de aplicaciones de generación de contenido sin restricciones: útil para proyectos que requieren respuestas sobre temas tabú o controversiales, como ficción adulta, sátira política o discusión académica de temas sensibles.
- Personalización de modelos propietarios: sirve como base para ajustes finos adicionales en dominios específicos donde el rechazo del modelo original bloquea respuestas útiles.
- Evaluación de técnicas de abliteración: al publicar los resultados de las pruebas (tasa de rechazo y KL), puede usarse como referencia para comparar otros métodos de eliminación de rechazos.
- Simulación de escenarios adversos: en entornos de prueba de sistemas de moderación, se puede usar para generar contenido que normalmente sería bloqueado, con fines de entrenamiento de filtros.
- Exploración de límites éticos: como herramienta de investigación, permite examinar cómo responde un modelo sin restricciones ante preguntas delicadas, contribuyendo al debate sobre el diseño de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona únicamente métricas de la abliteración:

| Metrica | Valor |
|---|---|
| Solicitudes dañinas rechazadas | 6 de 100 (94 % de supresión) |
| Divergencia KL respecto al modelo base | 0,0874 (8,74 % de deriva) |

Comparación con otro modelo abliterado publicado:

| Modelo | Trials | Rechazos (de 100) | Divergencia KL |
|---|---|---|---|
| alexander2323/Qwen3.8-27B-Uncensored-Heretic-Abliterated | 300 | 6 | 0,0874 |
| asfgsdfg/Qwen3.8-27B-Heretic | 80 | 47 | 0,0081 |

El modelo evaluado logra una supresión de rechazos mucho mayor (94 % frente a 53 %) aunque con una deriva de calidad ligeramente superior (0,0874 frente a 0,0081), lo que representa el punto de Pareto elegido.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la información disponible. Dado que se trata de un modelo de 27 mil millones de parámetros, se recomienda:

- Para inferencia en precisión completa (FP16): se necesitan al menos 54 GB de VRAM (por ejemplo, una NVIDIA A100 80 GB o H100).
- Con cuantización de 8 bits: alrededor de 27 GB de VRAM, posible en GPUs como RTX 4090 (24 GB) con ciertas limitaciones.
- Con cuantización de 4 bits: aproximadamente 14 GB de VRAM, viable en GPUs de consumo como RTX 3090 o RTX 4080.
- Opciones de despliegue: se puede usar con Transformers (carga directa con `device_map="auto"`), así como con vLLM, llama.cpp u Ollama si se convierten los pesos a formato GGUF.
- No se dispone de datos de latencia o throughput; dependerán del hardware y la configuración de cuantización.

## Comparativa con modelos similares

La comparación directa se limita al modelo mencionado en la model card:

| Modelo | Parametros | Metodo | Rechazos | KL Div | Licencia |
|---|---|---|---|---|---|
| alexander2323/Qwen3.8-27B-Uncensored-Heretic-Abliterated | 27B | Heretic 1.4.0, 300 trials | 6/100 | 0,0874 | Apache 2.0 |
| asfgsdfg/Qwen3.8-27B-Heretic | 27B | Heretic, 80 trials | 47/100 | 0,0081 | no disponible |

No se dispone de información sobre otros modelos abliterados de tamaño similar (por ejemplo, variantes de Llama 3 o Mistral) en la documentación proporcionada, por lo que no es posible realizar una comparativa más amplia.

## Limitaciones y advertencias

- Riesgo de contenido dañino: al eliminar los rechazos, el modelo puede generar respuestas que promuevan violencia, actividades ilegales, contenido explícito o discursos de odio. El uso indebido es responsabilidad exclusiva del usuario.
- Sesgos del modelo base: al no haberse realizado un ajuste de alineación, el modelo puede amplificar los sesgos presentes en los datos de entrenamiento de Qwen3.8-27B, incluyendo estereotipos o prejuicios.
- Alucinaciones: como cualquier modelo de lenguaje, puede inventar información, especialmente en temas poco representados o cuando se le pide opiniones controvertidas.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados; se asume que son los mismos que los del modelo base, pero no está confirmado.
- Restricciones de uso comercial: aunque la licencia Apache 2.0 permite uso comercial, el despliegue en producción de un modelo sin filtros de seguridad puede acarrear problemas legales o de reputación.
- Falta de garantías: el autor declara que el modelo se ofrece como herramienta de investigación, sin soporte técnico ni garantías de calidad o seguridad.
- Degradación de calidad: la abliteración introduce una deriva del 8,74 % respecto al modelo original, lo que puede afectar a tareas que requieren precisión factual o adherencia estricta a instrucciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexander2323/Qwen3.8-27B-Uncensored-Heretic-Abliterated
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la herramienta Heretic (no verificado): no disponible en la información proporcionada.
