# agentic-ptb/sol-high.h027.opsd-tb1-clean27.step_1

## Resumen

Este repositorio contiene un checkpoint intermedio del sweep de entrenamiento AgentPTB, identificado como `sol-high.h027.opsd-tb1-clean27.step_1`. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), guardado en formato safetensors con un tamaño de 18,8 GB. El checkpoint fue generado a las 27,73 horas de un run de 100 horas, dentro de la celda experimental `sol-high`, cuyo driver es Codex / gpt-5.6-sol con un nivel de razonamiento `high`.

La relevancia de este artefacto radica en que forma parte de un estudio sobre auto-destilación on-policy (OPSD, por sus siglas en inglés), una técnica que entrena un único modelo como alumno y profesor simultáneamente, condicionando el contexto según se le presente el problema solo o con la solución de referencia. Aunque el checkpoint es un producto intermedio de investigación, su publicación permite reproducir y analizar la evolución del rendimiento a lo largo del tiempo de entrenamiento. No se dispone de información sobre licencia, idiomas soportados ni pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint base Qwen/Qwen3.5-9B-Base, que emplea una arquitectura transformer estándar. Según la información disponible en la model card, el entrenamiento se realizó dentro de un sweep de 100 horas, con el checkpoint guardado a las 27,73 horas. El driver del entrenamiento fue Codex / gpt-5.6-sol con un nivel de razonamiento `high`, lo que sugiere que se utilizó un modelo de OpenAI como guía o generador de trayectorias, aunque no se especifican los detalles del proceso.

La búsqueda web revela que la técnica OPSD (On-Policy Self-Distillation) consiste en entrenar un modelo que actúa como alumno y profesor según el contexto: el alumno ve solo el problema, mientras que el profesor ve además la solución de referencia, y se realiza un emparejamiento de distribuciones a nivel de token a lo largo de las trayectorias on-policy del propio alumno. No se indica si este checkpoint concreto fue entrenado con OPSD, pero el nombre del repositorio (`opsd-tb1-clean27`) sugiere una conexión con esta metodología. No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

No se han publicado capacidades específicas para este checkpoint en la información disponible. Al estar basado en Qwen3.5-9B-Base, se espera que herede las capacidades generales de dicho modelo (generación de texto, razonamiento, código, etc.), pero no hay evaluaciones que lo confirmen. La model card solo indica que el `eos_token_id` es correcto, lo que garantiza que el modelo detiene la generación al final de cada turno, evitando el desbordamiento del contexto.

## Casos de uso

Dado que se trata de un checkpoint intermedio de investigación, los casos de uso son principalmente académicos y experimentales:

- Reproducción de experimentos: permite replicar los resultados del sweep AgentPTB y verificar la evolución del rendimiento a lo largo del tiempo de entrenamiento.
- Análisis de la dinámica de entrenamiento: al ser un snapshot a las 27,73 horas, se puede estudiar cómo cambian las capacidades del modelo en fases tempranas del entrenamiento.
- Comparación con otros checkpoints: el repositorio sigue una convención de nombres que permite ordenar cronológicamente los checkpoints de una misma celda, facilitando estudios comparativos.
- Investigación sobre auto-destilación: si el modelo fue entrenado con OPSD, sirve como caso de estudio para analizar los efectos de esta técnica en modelos de 9B.
- Desarrollo de técnicas de alineación: al estar relacionado con el driver gpt-5.6-sol, puede utilizarse para investigar métodos de destilación de conocimiento desde modelos de frontera.
- Evaluación de robustez: al ser un checkpoint intermedio, puede emplearse para probar la estabilidad del modelo ante diferentes prompts o tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y la búsqueda web no proporciona datos adicionales sobre el rendimiento de este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros en FP16, el modelo ocupa aproximadamente 18,8 GB (coincide con el tamaño del repo). Para inferencia en FP16 se necesitaría una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G, A100 40GB).
- Con cuantización a 8 bits (INT8) el uso de VRAM se reduciría a unos 9,4 GB, y a 4 bits (INT4) a unos 4,7 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB). Sin embargo, no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: para una inferencia cómoda sin cuantización, se recomienda una GPU con 24 GB o más (RTX 3090, RTX 4090, A100). Para experimentación con cuantización, una RTX 3060 o superior sería suficiente.
- Opciones de despliegue: al ser un modelo en formato safetensors, puede cargarse con bibliotecas como Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No se incluyen archivos GGUF ni configuraciones específicas.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 9B en una GPU moderna (RTX 4090) suele generar entre 20 y 50 tokens por segundo en FP16, pero esto depende de la implementación y la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El checkpoint es un artefacto de investigación sin métricas publicadas, por lo que no es posible compararlo objetivamente con alternativas como Qwen3.5-9B-Base original u otros fine-tunes de tamaño similar. Se recomienda consultar la documentación del sweep AgentPTB para obtener resultados de evaluación si están disponibles.

## Limitaciones y advertencias

- Es un checkpoint intermedio: no representa el estado final del entrenamiento (el run completo dura 100 horas), por lo que su rendimiento puede ser inferior al de checkpoints posteriores.
- Licencia no disponible: no se especifica la licencia de uso, lo que impide conocer las restricciones para uso comercial o redistribución.
- Idiomas no especificados: no se indica qué idiomas soporta, aunque al derivar de Qwen3.5-9B-Base probablemente herede el soporte multilingüe del modelo base, pero no está confirmado.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje, puede generar contenido falso o sesgado, especialmente si no se ha sometido a un alineamiento exhaustivo.
- Sin evaluación de seguridad: no se han publicado análisis de sesgos, toxicidad o robustez para este checkpoint concreto.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada, aunque el modelo base Qwen3.5-9B-Base suele soportar 32.768 tokens (según la documentación de Qwen), pero no se confirma en este repositorio.
- Uso en producción desaconsejado: al ser un artefacto de investigación sin licencia clara ni evaluación, no se recomienda su uso en entornos productivos sin un análisis previo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h027.opsd-tb1-clean27.step_1
- GitHub Agentic-OPSD (EcthelionLiu): https://github.com/EcthelionLiu/Agentic-OPSD
- GitHub OPSD (siyan-zhao): https://github.com/siyan-zhao/OPSD
- Página de GPT-5.6 de OpenAI: https://openai.com/index/gpt-5-6/
- Preview de GPT-5.6 Sol: https://openai.com/index/previewing-gpt-5-6-sol/
- OWASP Top 10 para aplicaciones agénticas 2026: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
