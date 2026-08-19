# mlasli/Qwen3.8-27B-Heretic-Uncensored-BF16

## Resumen

El modelo **Qwen3.8-27B-Heretic-Uncensored-BF16**, desarrollado por el usuario mlasli, es una variante del modelo base Qwen/Qwen3.8-27B a la que se le ha eliminado la dirección de rechazo (refusal direction) mediante la técnica de abliteración **Heretic**. Esta técnica, creada por mlabonne, elimina en un solo paso el vector de alineamiento de seguridad del modelo, reduciendo drásticamente la tasa de negativas a responder peticiones que el modelo original consideraría peligrosas o inapropiadas. El resultado es un modelo de 27.356 millones de parámetros orientado a casos de uso como roleplay y generación de texto sin censura, manteniendo el resto de capacidades del modelo base.

La relevancia de este modelo radica en su enfoque de "uncensoring" aplicado a una arquitectura reciente de Qwen, con una evaluación independiente que reporta una tasa de cumplimiento del 94% en prompts considerados dañinos. Está disponible en formato BF16 (safetensors) y se puede cargar con transformers o mediante GGUF en llama.cpp. Es importante señalar que la abliteración elimina el alineamiento de seguridad, por lo que su uso debe ser responsable y conforme a la legislación local.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basada en Qwen3.8-27B, probablemente transformer) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (original), GGUF (mencionado en la model card, sin detalle de bits) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de **Qwen3.8-27B**, del cual no se proporcionan detalles técnicos en la información disponible (arquitectura interna, número de capas, atención, etc.). Sobre este modelo base se aplica la técnica **Heretic**, un método de abliteración de una sola dirección que elimina el vector de rechazo aprendido durante el alineamiento de seguridad. El proceso utiliza una búsqueda de hiperparámetros con Optuna para seleccionar los parámetros de ablación en el frente de Pareto entre cumplimiento y divergencia KL del primer token. Según la model card, solo se ablaciona el backbone lingüístico; el resto de capacidades (presumiblemente visión, si el modelo base las tiene) se conservan.

No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO, etc.). La evaluación independiente reporta una primera divergencia KL de 0.0467 respecto al modelo base, lo que indica una pérdida mínima de capacidad lingüística tras la ablación.

## Capacidades

- Generación de texto y conversación multicapa (chat) en inglés.
- Roleplay y generación de contenido creativo sin restricciones de seguridad (debido a la abliteración).
- Pipeline declarado como `image-text-to-text`, lo que sugiere que el modelo base puede procesar imágenes y texto, aunque no se especifica cómo se comporta la parte visual tras la ablación.
- No se mencionan capacidades explícitas de tool calling, agentes, razonamiento multi-step, ni modos de pensamiento (thinking). La model card muestra un ejemplo con `enable_thinking=False`, lo que indica que el modelo soporta un modo de razonamiento que se puede desactivar, pero no hay más detalles.

## Casos de uso

- **Roleplay y escritura creativa sin censura**: el modelo puede generar diálogos y narrativas con temáticas adultas o controvertidas sin rechazos, adecuado para juegos de rol textuales o prototipos de ficción interactiva.
- **Generación de contenido para investigación sobre alineamiento**: permite estudiar el comportamiento de un modelo sin capas de seguridad, útil para análisis académicos de sesgos y mecanismos de rechazo.
- **Asistente conversacional general**: gracias a su alta tasa de cumplimiento, puede utilizarse como chatbot en inglés para tareas cotidianas, aunque con la advertencia de que responderá también a peticiones dañinas.
- **Prototipado de aplicaciones de texto a texto con entrada multimodal**: al declarar pipeline `image-text-to-text`, podría emplearse en entornos donde se combinen imágenes y texto, siempre que el modelo base lo soporte (no confirmado en esta ficha).
- **Evaluación de técnicas de abliteración**: sirve como caso de estudio para comparar el rendimiento de modelos ablacionados frente a sus versiones originales en métricas de cumplimiento y calidad lingüística.
- **Generación de diálogos para juegos o narrativa interactiva**: su baja tasa de rechazo (6% según Zou) permite flujos de conversación fluidos sin interrupciones por negativas.

## Benchmarks y rendimiento

La model card incluye una evaluación independiente del modelo fusionado, enfocada en cumplimiento y tasa de rechazo:

| Metrica | Valor |
|---|---|
| Compliance (harmful-behaviors, detector Zou et al., 50 prompts) | 94.0% |
| Tasa de rechazo por subcadenas Zou (29 subcadenas) | 6.0% |
| Divergencia KL del primer token vs. base | 0.0467 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

No se proporcionan requisitos oficiales. Basándose en el tamaño del modelo (27.356 millones de parámetros) y el formato BF16 (2 bytes por parámetro), el peso ocupa aproximadamente 54.7 GB, coincidiendo con el tamaño del repositorio. Para inferencia se necesitaría:

- **VRAM estimada**: al menos 55-60 GB para BF16 sin cuantización (p. ej., en una A100 80GB o H100). Con cuantización a 8 bits (~27 GB) o 4 bits (~14 GB) cabría en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB) para 8 bits, y en GPUs de 16 GB para 4 bits.
- **GPU recomendadas**: A100 80GB, H100, o RTX 4090/3090 con cuantización.
- **Opciones de despliegue**: transformers (con `AutoModelForImageTextToText`), llama.cpp para GGUF (arquitectura `qwen35`). También podría usarse vLLM o TGI si el modelo base es compatible, aunque no se menciona.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Como referencia cualitativa, se puede comparar con el modelo base Qwen3.8-27B (sin abliteración), que mantiene el alineamiento de seguridad y por tanto rechaza peticiones dañinas, pero conserva las mismas capacidades lingüísticas. Otros modelos ablacionados conocidos (p. ej., Dolphin, WizardLM-Uncensored) podrían ser alternativas, pero no se dispone de datos de rendimiento para una comparación cuantitativa.

## Limitaciones y advertencias

- **Eliminación del alineamiento de seguridad**: el modelo responde a peticiones dañinas, ilegales o no éticas. Su uso conlleva riesgos legales y éticos; debe emplearse solo en entornos controlados y con fines legítimos.
- **Sesgos del modelo base**: al derivar de Qwen3.8-27B, puede heredar sesgos lingüísticos y culturales del entrenamiento original, no documentados en esta ficha.
- **Riesgo de alucinación**: no hay datos específicos, pero como todo modelo generativo, puede producir información falsa o inventada.
- **Idioma limitado**: solo se declara soporte para inglés; otros idiomas pueden funcionar peor o no estar soportados.
- **Pérdida de capacidad**: la abliteración introduce una divergencia KL de 0.0467, lo que implica una ligera degradación en la distribución de tokens, aunque la model card afirma que las capacidades se preservan.
- **Restricciones de licencia**: aunque la licencia es Apache-2.0, el uso comercial debe considerar que el modelo puede generar contenido problemático; el autor recomienda cumplir las leyes locales.
- **Falsos positivos en detección de rechazo**: la evaluación con un detector combinado de palabras clave reportó un 18% de rechazo, pero el autor indica que son falsos positivos; aun así, conviene verificar el comportamiento en producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-BF16)
- [Repositorio de Heretic (github.com/mlabonne/heretic-llm)](https://github.com/mlabonne/heretic-llm)
- [Modelo base Qwen/Qwen3.8-27B (referencia)](https://huggingface.co/Qwen/Qwen3.8-27B) (no verificado en la búsqueda, pero se infiere de la model card)
