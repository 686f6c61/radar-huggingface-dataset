# mattcerisano/filmroll-decider

## Resumen

Film Roll decider v2 es un ajuste fino mediante LoRA del modelo Qwen3-0.6B de Alibaba, desarrollado por mattcerisano y publicado en Hugging Face. No es un modelo generativo de propósito general: es un clasificador de decisiones especializado que se utiliza como "selector" dentro de la aplicación Film Roll, una herramienta que organiza fotografías analógicas escaneadas en rollos. El modelo recibe un conjunto de hechos sobre un grupo de escaneos y una pregunta con respuestas etiquetadas con letras, y devuelve la letra de la respuesta más probable leyendo los logits del siguiente token.

La relevancia de este modelo es su enfoque de uso: en lugar de generar texto libre, se ejecuta un único forward pass y se aplica softmax sobre los logits de las letras candidatas, lo que permite tomar decisiones en aproximadamente 55 ms en un Mac con Apple Silicon. Esto lo convierte en un ejemplo práctico de cómo un modelo pequeño (596 millones de parámetros) puede integrarse como componente de decisión dentro de una aplicación, dejando la lógica de qué preguntar y qué respuestas ofrecer a las reglas del programa y la confirmación final al usuario.

El modelo está cuantizado a 4 bits y empaquetado en formato MLX, lo que lo hace específico para el ecosistema de Apple Silicon. Su ámbito de aplicación es deliberadamente estrecho: clasificación de decisiones relacionadas con la organización de rollos de fotografía analógica, incluyendo agrupación de salidas, puntos de corte, biblioteca de destino, fecha, nombre, película, formato y si es color o blanco y negro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajustado con LoRA y fusionado en base cuantizada a 4 bits |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-0.6B, no especificada en la model card) |
| Tipos de cuantizacion | 4-bit (MLX); el modelo base admite otras cuantizaciones, pero esta versión se distribuye en 4-bit |
| Idiomas soportados | No disponibles (prompts en inglés únicamente según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parámetros. Sobre esta base se aplicó un ajuste fino con LoRA de rango 8 en 16 capas, entrenado con 1.646 decisiones generadas sintéticamente. Posteriormente, el adaptador LoRA se fusionó en los pesos del modelo base cuantizado a 4 bits, dando como resultado un artefacto MLX listo para inferencia en Apple Silicon.

Los datos de entrenamiento son completamente sintéticos: lugares, eventos y nombres de archivo de laboratorio inventados, sin fotografías ni datos personales. El modelo no genera texto; se usa como clasificador leyendo los logits del siguiente token correspondientes a las letras de respuesta (A, B, …) y aplicando softmax únicamente sobre esas letras. El prompt sigue el formato ChatML de Qwen, con un bloque ` thinking` vacío en el turno del asistente. La model card reporta una precisión del 100% en 17 casos escritos a mano, 94% en 262 decisiones generadas de retención con nombres no vistos y 97% en 114 decisiones construidas a partir de una biblioteca real.

## Capacidades

- Clasificación de decisiones con respuestas etiquetadas por letras: selecciona la opción más probable entre las ofrecidas en el prompt.
- Decisión de agrupación de rollos: determinar si dos salidas comparten un rollo o deben separarse.
- Determinación de puntos de corte dentro de un rollo (por ejemplo, "dividir antes del fotograma 19").
- Asignación de un grupo de escaneos a una rollo de biblioteca existente.
- Inferencia de metadatos: fecha de captura, nombre del rollo, tipo de película, formato y si es color o blanco y negro.
- Ejecución de un único forward pass sin generación de texto, con lectura directa de logits.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multimodales.
- No procesa imágenes: solo lee hechos textuales sobre los escaneos.
- Soporte multilingüe no disponible; los prompts deben estar en inglés y en el formato especificado.

## Casos de uso

- Organización automática de escaneos en rollos: la aplicación agrupa fotogramas por carpeta y fechas, y el modelo decide si un grupo constituye un único rollo o debe dividirse, lo que permite reconstruir rollos físicos a partir de lotes de escaneo mezclados.
- Detección de puntos de corte por salida: cuando un lote contiene fotogramas de dos salidas distintas (por ejemplo, con fechas o escenas diferentes), el modelo indica antes de qué fotograma dividir, facilitando la separación sin intervención manual.
- Asignación a bibliotecas existentes: en flujos con una biblioteca de rollos ya catalogada, el modelo elige a qué rollo de la biblioteca continúa un grupo nuevo, reduciendo duplicados y manteniendo la coherencia del archivo.
- Etiquetado de metadatos: el modelo propone fecha, nombre, tipo de película y formato para cada rollo, que el usuario confirma después, agilizando la catalogación de archivos fotográficos personales.
- Clasificación color versus blanco y negro: a partir de los hechos del grupo, decide si el rollo es de color o monocromo, útil para filtrar y organizar colecciones mixtas.
- Integración en aplicaciones de escritorio para Apple Silicon: al ejecutarse en MLX con un forward pass de ~55 ms, puede incorporarse en la interfaz de una app nativa de macOS sin penalización perceptible para el usuario, como parte de un flujo de confirmación asistida.
- Prototipado de clasificadores de decisión de bajo coste: sirve como ejemplo de patrón "picker, not writer" para otros dominios donde se necesita elegir entre opciones predefinidas con un modelo pequeño y rápido.

## Benchmarks y rendimiento

| Conjunto de prueba | Precisión |
|---|---|
| Casos escritos a mano (17) | 17/17 (100%) |
| Decisiones generadas de retención con nombres no vistos (262) | 94% |
| Decisiones construidas a partir de una biblioteca real (114) | 97% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos anteriores son métricas de precisión específicas del dominio, reportadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar cuantizado a 4 bits y tener ~596 millones de parámetros, el peso de los pesos ronda los 0,3 GB (tamaño del repo), por lo que la memoria necesaria es muy reducida, del orden de 0,5-1 GB incluyendo overhead.
- GPU recomendadas: el modelo está empaquetado en MLX, por lo que el hardware objetivo es Apple Silicon (series M1, M2, M3, M4). No se distribuye en formatos para GPU NVIDIA o AMD.
- Cabe en cualquier Mac con Apple Silicon, incluidos modelos con 8 GB de memoria unificada. No está pensado para GPU consumer de NVIDIA en este formato.
- Opciones de despliegue: MLX (librería `mlx`), con el pipeline de text-generation de Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta versión.
- Latencia: aproximadamente 55 ms por decisión en un Mac con Apple Silicon, según la model card.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Film Roll decider v2 | 596 M | No disponible | Clasificador de decisiones vía logits (fine-tune de Qwen3-0.6B) | Apache 2.0 | Hugging Face, formato MLX 4-bit |
| Qwen3-0.6B (base) | 596 M | No disponible en esta ficha | Generación de texto general | Apache 2.0 | Hugging Face, múltiples formatos |
| Clasificadores BERT pequeños (p. ej., DistilBERT) | ~66 M | 512 tokens típicamente | Clasificación de texto | Apache 2.0 / MIT según variante | Hugging Face, formatos PyTorch/ONNX |

La comparación con modelos de la misma categoría es limitada porque Film Roll decider v2 es un artefacto muy específico de dominio. Frente a Qwen3-0.6B, la diferencia principal es el ajuste LoRA y el modo de uso como selector de letras en lugar de generador. Frente a clasificadores BERT pequeños, la ventaja es el formato MLX optimizado para Apple Silicon y la integración con el prompt ChatML de Qwen, aunque el tamaño es mayor y el dominio es mucho más estrecho.

## Limitaciones y advertencias

- La confianza del modelo es fiable solo en decisiones con la misma forma que sus datos de entrenamiento; fuera de ese dominio puede estar equivocado con alta confianza.
- No ve las fotografías: solo procesa hechos textuales, por lo que depende de que la aplicación extraiga correctamente fechas, nombres de archivo y pistas de escena.
- Solo acepta prompts en inglés y en el formato exacto especificado (ChatML con bloque ` thinking` vacío).
- El uso previsto es como selector dentro de una aplicación con reglas que acotan las preguntas y respuestas, y con confirmación humana de cada elección; no debe usarse como generador de texto autónomo.
- El entrenamiento se realizó con datos sintéticos, lo que puede introducir sesgos hacia los patrones de nombres y fechas generados y limitar la generalización a bibliotecas reales muy distintas.
- Riesgo de alucinación en el sentido de seleccionar una letra incorrecta cuando la pregunta o las opciones no se ajustan a la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-0.6B también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- El formato MLX limita el despliegue a hardware Apple Silicon; no hay pesos GGUF ni PyTorch publicados en esta versión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattcerisano/filmroll-decider
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
