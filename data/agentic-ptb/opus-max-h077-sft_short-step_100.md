# agentic-ptb/opus-max.h077.sft_short.step_100

## Resumen

El modelo `agentic-ptb/opus-max.h077.sft_short.step_100` es un checkpoint intermedio generado durante un barrido de entrenamiento (sweep) del proyecto AgentPTB. Se trata de un ajuste fino (SFT) del modelo base `Qwen/Qwen3.5-9B-Base`, producido por un agente autónomo basado en Claude Code / claude-opus-5 con un nivel de razonamiento `max`. El checkpoint corresponde al paso 100 de la fase `sft_short` y está etiquetado como de rol intermedio, lo que indica que no es un modelo final listo para producción, sino un punto de control para análisis y evaluación dentro del pipeline de entrenamiento.

Con 9.409.813.744 parámetros y un tamaño de 18.8 GB en formato safetensors, este modelo hereda la arquitectura del Qwen3.5-9B-Base, aunque no se especifican detalles adicionales sobre la configuración interna. Su relevancia radica en que forma parte de un experimento de generación de datos y entrenamiento agéntico, donde un modelo de alto rendimiento (Claude Opus 5) actúa como driver para crear checkpoints intermedios que luego se evalúan y comparan. La model card confirma que el `eos_token_id` es correcto, lo que garantiza que el modelo detiene correctamente las secuencias de conversación, un aspecto crítico para su uso en tareas de chat y agentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base, sin más detalles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | No disponibles (se espera herencia del modelo base, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del Qwen3.5-9B-Base, un transformer denso de 9.4 mil millones de parámetros. No se proporcionan detalles sobre la configuración exacta (número de capas, cabezas de atención, etc.) ni sobre el proceso de entrenamiento más allá de que se trata de un ajuste fino supervisado (SFT) de corta duración (`sft_short`). El checkpoint fue generado por un agente autónomo (Claude Code / claude-opus-5) con un nivel de razonamiento máximo, lo que sugiere que el proceso de entrenamiento involucró la generación de datos sintéticos o la selección de ejemplos por parte del agente, aunque no se especifica el método exacto.

La model card indica que el `eos_token_id` es correcto, con los tokens `[248044, 248046]`, donde `248046` corresponde a `<|im_end|>`, el token de fin de turno del template de chat de Qwen3.5. Esto es relevante porque checkpoints que carecen de este token no detienen correctamente las respuestas y pueden sobrepasar la ventana de contexto, lo que invalidaría las evaluaciones. Este checkpoint, al tenerlo correcto, es apto para evaluación directa.

## Capacidades

No se dispone de documentación específica sobre las capacidades de este checkpoint. Al estar basado en Qwen3.5-9B-Base, se espera que herede las capacidades generales del modelo base, que típicamente incluyen:

- Generación de texto y razonamiento en múltiples dominios.
- Comprensión y generación de código.
- Capacidades matemáticas básicas.
- Soporte de chat multi-turno gracias al template de Qwen3.5.
- Posible soporte de tool calling y function calling, aunque no está confirmado para este checkpoint.

Sin embargo, al ser un checkpoint intermedio de un experimento de entrenamiento, no se garantiza que estas capacidades estén completamente desarrolladas o sean estables. No hay información sobre capacidades especiales como visión, audio o modo de pensamiento.

## Casos de uso

Dado que se trata de un checkpoint intermedio de investigación, los casos de uso son principalmente experimentales y no orientados a producción:

- **Evaluación de checkpoints en pipelines de entrenamiento**: este modelo puede utilizarse para comparar la evolución del rendimiento a lo largo del sweep, midiendo métricas como pérdida, precisión en tareas específicas o calidad de generación en cada paso.
- **Análisis de la influencia del agente generador**: al ser producido por Claude Opus 5 con effort `max`, puede estudiarse cómo el nivel de razonamiento del agente afecta a la calidad de los datos de entrenamiento y al comportamiento resultante del modelo.
- **Pruebas de convergencia y estabilidad**: el checkpoint permite verificar si el entrenamiento está convergiendo correctamente y si el modelo mantiene la coherencia en tareas de chat, gracias al eos_token_id correcto.
- **Generación de datos sintéticos para otros entrenamientos**: el modelo podría usarse para generar ejemplos de entrenamiento adicionales, aunque su naturaleza intermedia limita su fiabilidad.
- **Investigación sobre agentes autónomos**: sirve como ejemplo de cómo un agente de alto rendimiento puede generar checkpoints de modelos más pequeños, un área de interés en el desarrollo de sistemas agénticos.
- **Reproducción de experimentos**: los investigadores pueden descargar este checkpoint para reproducir los resultados del sweep de AgentPTB y validar las figuras publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Dado que es un checkpoint intermedio, es probable que los autores hayan evaluado su rendimiento en el contexto del sweep, pero esos datos no se han hecho públicos en el repositorio.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 9.4 mil millones de parámetros, en precisión FP16 el modelo ocupa aproximadamente 18.8 GB de memoria. Para inferencia en FP16 se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G, A100 40GB). Con cuantización a 8 bits (no disponible en el repositorio, pero posible con herramientas externas) ocuparía unos 9.4 GB, cabiendo en GPUs de 12-16 GB como RTX 3060 o RTX 4080. Con cuantización a 4 bits, alrededor de 4.7 GB, cabría en GPUs de 6-8 GB, aunque esto degradaría la calidad.
- **GPU recomendadas**: para un uso cómodo sin cuantizar, una RTX 4090 (24 GB) o una A100 (40 GB) son adecuadas. Para despliegue en producción, se recomienda al menos una A10G o A100.
- **Opciones de despliegue**: al ser un modelo en formato safetensors, puede cargarse con bibliotecas como Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay integraciones específicas documentadas.
- **Latencia y throughput**: no se dispone de datos medidos. Como referencia, un modelo de 9B en una GPU moderna (RTX 4090) suele generar entre 20 y 50 tokens por segundo en FP16, dependiendo de la implementación y el tamaño de la ventana de contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo base Qwen3.5-9B-Base es la referencia más cercana, pero no se han publicado métricas comparativas de este checkpoint frente a él ni frente a otros modelos de tamaño similar (por ejemplo, Llama 3.1 8B, Mistral 7B). La comparativa queda pendiente de que los autores publiquen los resultados del sweep.

## Limitaciones y advertencias

- **Checkpoint intermedio**: no es un modelo final. Puede presentar problemas de convergencia, calidad de generación inconsistente o comportamiento errático en tareas complejas.
- **Sin licencia especificada**: la ausencia de licencia impide conocer las restricciones de uso comercial o de redistribución. Se recomienda contactar con el autor antes de cualquier uso fuera de investigación.
- **Sin documentación de sesgos**: no se han evaluado sesgos potenciales ni riesgos de alucinación. Al ser un modelo derivado de Qwen3.5, puede heredar sesgos del modelo base, pero no hay datos al respecto.
- **Idiomas no confirmados**: aunque el modelo base soporta múltiples idiomas, no se ha verificado el comportamiento de este checkpoint en lenguas distintas del inglés o el chino.
- **Riesgo de sobreajuste**: al ser un checkpoint de un paso temprano (step 100) de un entrenamiento corto, podría estar subentrenado o, por el contrario, sobreajustado a los datos generados por el agente.
- **No apto para producción**: sin benchmarks, licencia ni documentación de estabilidad, no se recomienda su uso en aplicaciones críticas.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-max.h077.sft_short.step_100)
- [Modelo base Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Página de modelos de HuggingFace](https://huggingface.co/models)
