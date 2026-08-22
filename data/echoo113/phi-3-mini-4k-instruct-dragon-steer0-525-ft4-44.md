# Echoo113/Phi-3-mini-4k-instruct-dragon-STEER0.525-ft4.44

## Resumen

El modelo `Echoo113/Phi-3-mini-4k-instruct-dragon-STEER0.525-ft4.44` es un ajuste fino (fine-tune) del modelo base `microsoft/Phi-3-mini-4k-instruct`, realizado por el usuario Echoo113. El modelo base es un modelo de lenguaje pequeño (SLM) de 3.800 millones de parámetros, desarrollado por Microsoft, diseñado para tareas de chat e instrucción con un enfoque en razonamiento denso y eficiencia computacional. Este ajuste concreto se ha entrenado mediante aprendizaje supervisado (SFT) utilizando la librería TRL, lo que sugiere una adaptación a un dominio o estilo de respuesta específico, aunque la documentación pública no detalla el dataset de entrenamiento.

La relevancia de este modelo radica en su tamaño reducido (3,8B parámetros) y su ventana de contexto de 4.000 tokens, lo que lo hace adecuado para despliegues en hardware de gama media y escenarios con restricciones de memoria. Al ser un ajuste fino de la comunidad, ofrece una alternativa potencialmente especializada al modelo base, aunque su escasa documentación (0 descargas y 0 likes) indica que se trata de un experimento o proyecto en fase inicial, sin evidencia pública de evaluación o adopción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Phi-3-mini) |
| Parámetros totales | 3.800 millones (heredados del modelo base) |
| Parámetros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 4.000 tokens (por nombre del modelo base) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (no especificado en la model card) |
| Licencia | no disponible (el README indica "license" sin especificar; el modelo base usa MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer decoder-only del modelo Phi-3-mini, que emplea una atención de ventana deslizante (sliding window attention) para optimizar el uso de memoria con una longitud de contexto de 4.000 tokens. El modelo base fue entrenado con una combinación de datos sintéticos y sitios web filtrados, priorizando muestras de alta calidad y densas en razonamiento. El ajuste fino de este modelo se realizó mediante aprendizaje supervisado (SFT) usando la librería TRL, con el framework Transformers 4.57.6 y PyTorch 2.11.0. No se proporcionan detalles sobre el dataset de entrenamiento, la duración del ajuste ni el número de pasos, lo que limita la reproducibilidad del proceso.

## Capacidades

- Generación de texto en formato conversacional e instructivo, heredada del modelo base.
- Razonamiento básico y resolución de problemas de lógica y matemáticas, aunque sin datos específicos de evaluación para este ajuste.
- Soporte de tool calling y function calling: el modelo base Phi-3-mini soporta esta funcionalidad, y el ajuste no la elimina, aunque no se ha verificado explícitamente.
- Capacidades multilingües limitadas, principalmente inglés, aunque el modelo base puede manejar otros idiomas con menor calidad.
- No se dispone de capacidades de visión, audio ni modo de razonamiento extendido (thinking mode) en este modelo.

## Casos de uso

- Chatbots de atención al cliente: con su ventana de 4.000 tokens, puede mantener conversaciones multi-turno de duración media, adecuado para preguntas frecuentes y consultas simples en entornos con recursos limitados.
- Generación de respuestas en aplicaciones educativas: puede utilizarse para explicar conceptos técnicos o responder preguntas de estudiantes, aprovechando su capacidad de razonamiento básico.
- Asistente de escritura y redacción: permite generar borradores de textos, correcciones gramaticales o sugerencias de estilo, aunque su calidad no compite con modelos más grandes.
- Integración en herramientas de código de bajo nivel: con soporte de tool calling, puede integrarse en asistentes de terminal o scripts de automatización para tareas simples de generación de código.
- Prototipos de investigación: sirve como base para experimentos de ajuste fino o para comparar estrategias de entrenamiento con otros modelos pequeños.
- Despliegue en dispositivos edge o entornos con VRAM limitada: su tamaño de 3,8B permite ejecutarlo en GPUs de consumo (por ejemplo, RTX 3060 con cuantización) o en CPU con librerías como llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. El modelo base `microsoft/Phi-3-mini-4k-instruct` reporta resultados en MMLU (69,5 %), HumanEval (60,1 %) y GSM8K (84,2 %) en su documentación oficial, pero no hay datos de cómo este ajuste fino afecta a esas métricas. Por tanto, no se puede afirmar si el rendimiento mejora o empeora respecto al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base con pesos en FP16 requiere alrededor de 7,6 GB de VRAM; con cuantización de 8 bits (INT8) se reduce a unos 3,8 GB, y en 4 bits (INT4) a aproximadamente 2,4 GB.
- GPUs recomendadas: para uso en producción, una RTX 3060 de 12 GB o RTX 4090 de 24 GB son suficientes; para cuantización en 4 bits, una GPU de 8 GB (como RTX 3070) puede ser suficiente.
- En GPU de consumo: sí, cabe en la mayoría de GPUs de consumo modernas con al menos 6-8 GB de VRAM, siempre que se use cuantización.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama y TGI, aunque no se han publicado archivos GGUF específicos en el repo; se pueden generar a partir de los safetensors.
- Latencia y throughput: no se dispone de datos concretos; en una GPU RTX 4090, un modelo de 3,8B suele generar entre 50 y 100 tokens por segundo con cuantización de 4 bits, pero esto es una estimación general.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| microsoft/Phi-3-mini-4k-instruct (base) | 3,8B | 4k | MIT | Referencia oficial, bien documentado y evaluado |
| Echoo113/Phi-3-mini-4k-instruct-dragon-STEER0.525-ft4.44 | 3,8B | 4k | No disponible | Ajuste de la comunidad, sin documentación |
| GMorgulis/Phi-3-mini-4k-instruct-wolf-STEER0.510156-ft4.44 | 3,8B | 4k | No disponible | Otro ajuste de la comunidad, mismo modelo base |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de rendimiento para este ajuste. El modelo base ofrece una licencia abierta (Apache) y documentación completa, mientras que los ajustes de la comunidad carecen de evaluación pública y licencias claras.

## Limitaciones y advertencias

- Sesgos desconocidos: al ser un ajuste de la comunidad, no se ha auditado el dataset de entrenamiento; puede heredar sesgos del modelo base y del propio conjunto de datos.
- Riesgo de alucinación: sin datos de evaluación, no se puede garantizar la fiabilidad de las respuestas; el modelo base ya presenta alucinaciones en temas de actualidad.
- Limitaciones de contexto: la ventana de 4.000 tokens es corta para tareas que requieren documentos largos o historias extensas; se recomienda truncar o resumir el texto.
- Restricciones de licencia: la licencia no está especificada para este ajuste; el modelo base usa Apache, pero el README solo indica "license", lo que puede implicar restricciones para uso comercial.
- Falta de soporte y mantenimiento: con 0 descargas y 0 likes, no hay garantía de actualizaciones, soporte técnico ni corrección de errores.
- Desconocimiento del proceso de entrenamiento: la ausencia de detalles sobre el dataset, la duración y los hiperparámetros impide replicar o evaluar la calidad del ajuste.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Echoo113/Phi-3-mini-4k-instruct-dragon-STEER0.525-ft4.44
- Modelo base en HuggingFace: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Repositorio del modelo base en GitHub: https://github.com/ttlmtang123/Phi-3-mini-4k-instruct
- Catálogo de modelos de Microsoft Foundry: https://ai.azure.com/catalog/models/Phi-3-mini-4k-instruct
- Otro ajuste similar (GMorgulis): https://huggingface.co/GMorgulis/Phi-3-mini-4k-instruct-wolf-STEER0.510156-ft4.44
