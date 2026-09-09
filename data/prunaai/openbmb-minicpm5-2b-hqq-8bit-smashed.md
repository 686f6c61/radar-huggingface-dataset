# PrunaAI/openbmb-MiniCPM5-2B-HQQ-8bit-smashed

## Resumen

El modelo `PrunaAI/openbmb-MiniCPM5-2B-HQQ-8bit-smashed` es una versión comprimida del modelo base `openbmb/MiniCPM5-2B`, desarrollada por la empresa PrunaAI mediante su técnica de cuantización HQQ (Half-Quadratic Quantization). El objetivo de esta compresión es reducir el tamaño del modelo y acelerar la inferencia manteniendo un comportamiento similar al original, tal como describe la model card de PrunaAI.

El modelo base, MiniCPM5-2B, es un Transformer denso de aproximadamente 2 mil millones de parámetros creado por OpenBMB. Según el repositorio oficial, está diseñado para escenarios de despliegue local, on-device y con recursos limitados, posicionándose como un modelo de 2B con buen rendimiento en su categoría. Esta versión cuantizada a 8 bits está almacenada en formato safetensors y ocupa 3,2 GB en HuggingFace.

La relevancia de este modelo radica en su potencial para ejecutarse en dispositivos con recursos contenidos, como móviles o estaciones de trabajo sin GPU potente. No obstante, la información técnica disponible es limitada: no se han publicado especificaciones detalladas sobre idiomas, contexto ni benchmarks en la ficha proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 2B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | HQQ 8-bit |
| Idiomas soportados | No disponible |
| Licencia | No especificada; debe consultarse la del modelo original openbmb/MiniCPM5-2B |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B es un Transformer denso de 2B parámetros, descrito en el repositorio de OpenBMB como un modelo de lenguaje optimizado para despliegue on-device y escenarios con recursos limitados. No se dispone en la información proporcionada de detalles sobre la composición del dataset de entrenamiento, el número de tokens ni la aplicación de técnicas como RLHF o DPO.

La compresión realizada por PrunaAI utiliza HQQ (Half-Quadratic Quantization) a 8 bits, un método de cuantización que reduce la precisión de los pesos. Según la model card, si el método necesita datos de calibración, se emplea WikiText. El modelo resultado se denomina "smashed" en la terminología de PrunaAI. El propio README advierte de que la calidad de las salidas puede variar respecto al modelo original.

## Capacidades

- Generación de texto como modelo de lenguaje causal.
- Diseñado para ejecución local en dispositivos con recursos limitados, según el repositorio de OpenBMB.
- No se han publicado en la información disponible especificaciones sobre tool calling, soporte de agentes, visión o audio.
- Idiomas soportados: no disponible.

## Casos de uso

- **Asistente conversacional privado en el dispositivo:** el modelo puede ejecutarse localmente en un móvil o portátil sin conexión, ofreciendo respuestas a preguntas del usuario sin enviar datos a servidores externos. Su tamaño reducido hace viable la ejecución en hardware limitado.
- **Resumen de documentos en entornos aislados:** en entornos como consultorios médicos, oficinas con datos sensibles o sistemas industriales, el modelo puede generar resúmenes de informes o actas sin necesidad de conexión, preservando la confidencialidad.
- **Redacción asistida en aplicaciones de productividad:** integrable en procesadores de texto para sugerir frases, corregir gramática o completar párrafos. La baja latencia esperada de un modelo cuantizado de 2B es adecuada para interfaces interactivas.
- **Chatbot de soporte técnico en sistemas embebidos:** en routers, cajas de telecomunicaciones o dispositivos IoT, puede gestionar consultas de configuración o incidencias básicas de forma local, evitando dependencia de APIs externas y mejorando la privacidad.
- **Generación de código en entornos sin conexión:** para desarrolladores en entornos con redes restringidas o requisitos de seguridad, el modelo puede asistir en tareas sencillas de programación, como completar funciones o sugerir patrones de código, directamente en la estación de trabajo.
- **Clasificación y etiquetado de texto en tiempo real:** adaptable a aplicaciones como análisis de sentimiento, filtrado de correo o categorización de tickets. Al ser un modelo de lenguaje compacto, puede ejecutarse en una CPU o GPU modesta con tiempos de respuesta aceptables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un gráfico con métricas de eficiencia (memoria, latencia, throughput, consumo energético), pero los valores numéricos no se han proporcionado en el texto. Tampoco hay cifras de rendimiento en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Tamaño del repositorio: 3,2 GB.
- VRAM estimada: no disponible oficialmente. Si se tiene en cuenta que los pesos en 8 bits de un modelo de 2B ocupan aproximadamente 2 GB, podría ejecutarse en GPUs a partir de 4 GB de VRAM, pero no se dispone de mediciones oficiales.
- GPU recomendadas: no disponible.
- Opciones de despliegue: el código de ejemplo proporcionado por PrunaAI utiliza `HQQModelForCausalLM` de la biblioteca `hqq` junto con `transformers`. No se mencionan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se ha proporcionado información suficiente para comparar este modelo con otras alternativas. El repositorio de OpenBMB describe MiniCPM5-2B como un modelo de 2B con buen rendimiento en su clase, pero no se incluyen datos de referencia de otros modelos en la información recibida.

## Limitaciones y advertencias

- La cuantización a 8 bits puede degradar la calidad de las respuestas con respecto al modelo base, tal como advierte la model card de PrunaAI.
- No se han publicado datos sobre sesgos, riesgo de alucinación o comportamientos indeseados específicos.
- La licencia del modelo comprimido sigue la del modelo original, que no está especificada en esta ficha. Es obligatorio revisar la licencia de `openbmb/MiniCPM5-2B` antes de cualquier uso comercial o despliegue.
- El modelo no tiene descargas ni likes en HuggingFace, lo que sugiere que es una versión de prueba o que aún no ha sido validada por la comunidad.
- La fecha de creación del repositorio es posterior a la redacción de esta ficha, por lo que su disponibilidad y mantenimiento deben verificarse en el momento de su uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PrunaAI/openbmb-MiniCPM5-2B-HQQ-8bit-smashed
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio de OpenBMB/MiniCPM: https://github.com/OpenBMB/MiniCPM
- Contacto de PrunaAI: https://www.pruna.ai/contact
- Documentación de PrunaAI: https://pruna-ai-pruna.readthedocs-hosted.com/en/latest/
