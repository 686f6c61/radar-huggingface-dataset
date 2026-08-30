# 3MPER0RR/Phi-4-mini-3MPER0RR-obliterated

## Resumen

El modelo `3MPER0RR/Phi-4-mini-3MPER0RR-obliterated` es una modificación no oficial del modelo `Phi-4-mini-instruct` de Microsoft, publicada por el usuario 3MPER0RR en Hugging Face. El término "obliterated" en la comunidad open source suele referirse a un proceso de eliminación de capas de rechazo (refusal) o de restricciones de seguridad mediante técnicas de ablación, aunque no se aporta documentación técnica que confirme el método empleado. El modelo base, Phi-4-mini, es un modelo de lenguaje compacto de 3.8 mil millones de parámetros, entrenado con datos sintéticos y web filtrada, con una ventana de contexto de 128K tokens, destacando en tareas de razonamiento, matemáticas y generación de código.

La relevancia de este modelo reside en su tamaño reducido (3.8B parámetros) combinado con una capacidad de contexto larga, lo que lo hace atractivo para despliegues en entornos con recursos limitados. Sin embargo, al tratarse de una variante sin documentación oficial, su comportamiento exacto, el proceso de entrenamiento o fine-tuning y las garantías de calidad no están verificados. La licencia MIT permite uso comercial sin restricciones, pero el usuario debe asumir la responsabilidad de su uso.

El repositorio contiene únicamente los pesos en formato safetensors (7.7 GB) y una model card mínima con la licencia, sin información sobre el proceso de modificación, los datos de entrenamiento o las capacidades específicas de la variante. Por tanto, esta ficha se basa en las características conocidas del modelo original Phi-4-mini, indicando explícitamente los datos no disponibles de la versión modificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Phi-4-mini) |
| Parametros totales | 3.836.021.760 (3.8B) |
| Parametros activos | no disponible (no se especifica si es MoE; el modelo base es denso) |
| Longitud de contexto | no disponible (el modelo base Phi-4-mini soporta 128K tokens, pero no se confirma en esta variante) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el modelo base soporta principalmente inglés, aunque puede generalizar a otros idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Phi-4-mini es un transformer decoder-only con atención causal, desarrollado por Microsoft. Pertenece a la familia Phi-4, que se caracteriza por entrenarse con una combinación de datos sintéticos de alta calidad y datos web filtrados, priorizando contenido denso en razonamiento. El modelo original tiene una arquitectura similar a Phi-3, con un vocabulario ampliado y una ventana de contexto de 128K tokens, lograda mediante técnicas de interpolación de posición rotatoria (RoPE). No se conocen detalles sobre el entrenamiento específico de la variante "obliterated": no se indica si se realizó un fine-tuning adicional, una ablación de capas de rechazo, o un ajuste por DPO/RLHF. La ausencia de documentación en la model card impide conocer el dataset utilizado, el número de tokens de entrenamiento o cualquier innovación técnica aplicada.

## Capacidades

Dado que no se dispone de información específica de la variante, las capacidades listadas se refieren al modelo base Phi-4-mini, y no están confirmadas para esta modificación:

- Generación de texto y razonamiento complejo: el modelo base destaca en tareas que requieren inferencia lógica y resolución de problemas matemáticos.
- Generación de código: Phi-4-mini muestra un rendimiento sólido en benchmarks de programación como HumanEval y MBPP.
- Comprensión de contexto largo: con 128K tokens de ventana, puede procesar documentos extensos y mantener coherencia en conversaciones largas.
- Soporte de tool calling y function calling: el modelo instruct incluye entrenamiento para invocar funciones externas, aunque no se verifica en esta variante.
- Capacidades multilingües: limitadas principalmente al inglés; no hay datos sobre otros idiomas.
- No se confirma la existencia de modo "thinking" ni capacidades multimodales (visión, audio) en esta variante.

## Casos de uso

- Atención al cliente automatizada: gracias a su ventana de contexto larga (128K en el modelo base), el modelo puede gestionar conversaciones multi-turno con historial extenso. Sin embargo, al carecer de documentación sobre la variante, se recomienda validar su comportamiento en este escenario antes de producción.
- Generación de código asistida: el modelo base tiene buen rendimiento en tareas de programación, por lo que podría integrarse en editores o pipelines de CI/CD para autocompletar o revisar código. La variante "obliterated" podría haber alterado estas capacidades.
- Resumen de documentos largos: su contexto amplio permite resumir informes, artículos o libros completos de una sola pasada.
- Análisis de datos y razonamiento matemático: útil para aplicaciones de análisis financiero, científico o educativo donde se requiera resolver problemas paso a paso.
- Prototipado rápido de aplicaciones de NLP: su tamaño compacto (3.8B) permite ejecutarlo en GPUs de consumo medio, facilitando pruebas de concepto.
- Investigación académica sobre alineación y seguridad: al ser una variante sin restricciones de rechazo (si el "obliterated" implica eso), puede servir para estudiar los efectos de la ablación en el comportamiento del modelo, aunque esto es especulativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Phi-4-mini reporta en su documentación oficial resultados superiores a otros modelos de tamaño similar (por ejemplo, supera a Llama-3.2-3B y Qwen-2.5-3B en tareas de matemáticas y código), pero no hay datos que confirmen que la variante "obliterated" mantenga o modifique ese rendimiento. Se recomienda consultar los benchmarks del modelo original en la página de Microsoft o en el paper arXiv:2503.01743 para referencia, aunque no son aplicables directamente a esta modificación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.8B parámetros en precisión FP16, el modelo requiere aproximadamente 7.6 GB de VRAM solo para los pesos. Con cuantización a 4 bits (si se genera), se reduciría a unos 2 GB, pero no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: para FP16, una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060 Ti, A10) es suficiente. Para cuantización 4-bit, una GPU de 4 GB (como RTX 3050) podría ser suficiente, pero requiere generar los archivos GGUF o AWQ manualmente.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y alta de consumo.
- Opciones de despliegue: al disponer de pesos en safetensors, se puede utilizar con frameworks como vLLM, TGI, llama.cpp (convirtiendo a GGUF), o a través de Ollama (si se crea un Modelfile). No hay integraciones preconfiguradas.
- Latencia y throughput: no hay datos medidos. Para un modelo de 3.8B en una GPU moderna (RTX 4090), se espera una velocidad de generación de entre 40 y 80 tokens por segundo con FP16, pero esto es una estimación general no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Phi-4-mini-instruct (original) | 3.8B | 128K | MIT | Hugging Face oficial |
| 3MPER0RR/Phi-4-mini-3MPER0RR-obliterated | 3.8B | no disponible | MIT | Repositorio no oficial |
| Llama-3.2-3B-Instruct | 3.2B | 128K (con interpolación) | Llama 3.2 Community License | Hugging Face oficial |
| Qwen-2.5-3B-Instruct | 3.1B | 32K | Apache 2.0 | Hugging Face oficial |

La comparativa se basa en el modelo base, ya que la variante no aporta datos propios. El rendimiento relativo entre estos modelos depende de la tarea: Phi-4-mini suele superar a Llama-3.2-3B y Qwen-2.5-3B en razonamiento y código, según el paper original. No obstante, la modificación "obliterated" podría degradar o alterar estas capacidades, por lo que se recomienda evaluar directamente.

## Limitaciones y advertencias

- Falta de documentación: la model card no incluye información sobre el proceso de modificación, los datos utilizados ni las diferencias con el modelo base. Esto impide conocer los sesgos o riesgos introducidos.
- Alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas especializados.
- Sesgos del modelo base: Phi-4-mini hereda sesgos de sus datos de entrenamiento, y la modificación "obliterated" podría haber eliminado capas de seguridad que mitigaban ciertos sesgos o contenidos dañinos.
- Riesgo de uso indebido: si la modificación elimina los rechazos de seguridad, el modelo podría generar contenido no deseado (violento, ilegal, etc.) sin filtros. El usuario es responsable de su uso.
- Sin garantías de rendimiento: al no haber benchmarks ni validación, no se puede asegurar que el modelo funcione correctamente en tareas específicas.
- Compatibilidad: el repositorio usa etiquetas `custom_code` y `phi3`; puede requerir código personalizado para cargar el modelo, lo que añade una capa de complejidad técnica.
- Idiomas: no se especifican idiomas soportados; probablemente el rendimiento sea óptimo solo en inglés.

## Enlaces

- Repositorio del modelo: https://huggingface.co/3MPER0RR/Phi-4-mini-3MPER0RR-obliterated
- Modelo base Phi-4-mini-instruct: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Modelo base Phi-4 (no mini): https://huggingface.co/microsoft/phi-4
- Página oficial de Microsoft Foundry Labs: https://labs.ai.azure.com/innovations/phi-4/
- Paper de Phi-4-Mini y Phi-4-Multimodal (arXiv): https://arxiv.org/pdf/2503.01743v1
- Página de Ollama para phi4-mini: https://ollama.com/library/phi4-mini
