# patrickamadeus/webshop-night_Llama-3.2-3B_IWM_bs4_WM.15652.15652_IL.2644.2644

## Resumen

webshop-night_Llama-3.2-3B_IWM_bs4_WM.15652.15652_IL.2644.2644 es un ajuste fino completo de meta-llama/Llama-3.2-3B-Instruct desarrollado por patrickamadeus en el marco de la investigación "Early Experience" sobre modelado implícito del mundo (implicit world modeling, IWM). El modelo está especializado en la resolución de tareas del entorno WebShop, un benchmark de compras online donde un agente debe navegar por un sitio web simulado para encontrar y adquirir un producto a partir de una descripción en lenguaje natural.

El problema que aborda es el de la eficiencia en el aprendizaje por refuerzo o por imitación en entornos interactivos: en lugar de aprender únicamente de trayectorias expertas, el modelo se entrena primero para predecir las consecuencias reales de acciones alternativas (modelado del mundo) y después se ajusta por imitación de las trayectorias expertas. El nombre codifica dos etapas de entrenamiento: una primera de modelado del mundo (WM) con 15.652 pasos sobre 62.607 filas, y una segunda de imitación (IL) con 2.644 pasos sobre 10.576 filas.

Con 3.212.749.824 parámetros y una ventana de contexto de 4.096 tokens durante el entrenamiento, el modelo es relevante como artefacto de investigación reproducible para estudiar cómo el modelado implícito del mundo mejora la tasa de éxito en tareas de agente respecto a la imitación pura. No obstante, su licencia Llama 3.2 y su naturaleza de checkpoint de investigación limitan su uso en producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo base Llama 3.2 soporta multilingüe, pero no se documenta para este ajuste) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Llama 3.2, partiendo de meta-llama/Llama-3.2-3B-Instruct con un ajuste fino completo (full fine-tune) mediante LlamaFactory SFT. El entrenamiento se realizó en dos etapas secuenciales: una primera etapa de modelado del mundo (WM) sobre 62.607 filas de pares (estado, acción) → siguiente observación, generadas a partir de un "rewind" propio del entorno real WebShop (ejecutando acciones alternativas en el entorno y capturando las páginas resultantes); y una segunda etapa de imitación (IL) sobre 10.576 filas de trayectorias expertas de las 1.110 tareas de entrenamiento del setup night-1.

Los hiperparámetros documentados son: learning rate 1e-5, schedule coseno con 3% de warmup por etapa, precisión bf16, optimizador paged AdamW 8-bit, longitud máxima de 4.096 tokens y semilla 0. La innovación técnica principal es el uso de "imagined experience" o experiencia imaginada: el modelo aprende primero las consecuencias de acciones alternativas y después imita al experto, lo que según el paper referenciado mejora la tasa de éxito frente a la imitación pura.

## Capacidades

- Generación de texto y razonamiento de agente en el entorno WebShop (selección de acciones de navegación y compra).
- Modelado implícito del mundo: predicción de la siguiente observación a partir de un estado y una acción.
- Imitación de trayectorias expertas en tareas de compra online.
- Soporte de tool calling / function calling: no documentado para este ajuste.
- Soporte de agentes y razonamiento multi-paso: sí, orientado específicamente a tareas multi-paso en WebShop (hasta 15 pasos de interacción).
- Capacidades multilingües: no documentadas para este ajuste.
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Investigación en aprendizaje por imitación con modelado del mundo: el modelo sirve como checkpoint reproducible para comparar IWM frente a imitación pura y self-reflection en WebShop, con las tasas de éxito publicadas como referencia.
- Evaluación de agentes en entornos interactivos: se puede usar para medir la tasa de éxito en el conjunto estándar (objetivos 0-499) y en el conjunto limpio (500 objetivos sin tarea de entrenamiento publicada), con intervalos de confianza al 95%.
- Estudio de currículos de entrenamiento en dos etapas: permite analizar el efecto de entrenar primero con datos de rewind (acciones alternativas ejecutadas en el entorno real) y después con trayectorias expertas.
- Reproducción de experimentos de la línea "Early Experience": el nombre del checkpoint codifica los pasos y épocas de cada etapa, lo que facilita la trazabilidad y la comparación con otras variantes del mismo autor.
- Generación de datos sintéticos de interacción: el modelo puede predecir observaciones siguientes para aumentar datasets de agentes en dominios de comercio electrónico simulado.
- Análisis de robustez y generalización: el conjunto limpio de 500 objetivos permite evaluar la generalización a tareas no vistas durante el entrenamiento.
- Docencia y divulgación: ejemplo práctico de ajuste fino completo de un modelo de 3B con LlamaFactory y de nomenclatura de checkpoints por etapas.

## Benchmarks y rendimiento

Tasa de éxito en WebShop (%), temperatura 0,4, 15 pasos, con intervalo de confianza al 95%:

| Conjunto de prueba | Tasa de éxito |
|---|---|
| Objetivos estándar 0-499 | 36,4 (32,2-40,6) |
| Conjunto limpio (500 objetivos sin tarea de entrenamiento publicada) | 33,0 (28,8-37,2) |

Resultados de referencia del paper (Early Experience, Tabla 1, Llama-3.2-3B, WebShop):

| Método | Tasa de éxito |
|---|---|
| Imitación | 41,8 |
| Modelado implícito del mundo (IWM) | 60,2 |
| Self-reflection | 52,7 |

Nota: las cifras del paper y las del checkpoint no son directamente comparables; las primeras corresponden a la configuración del paper y las segundas a este checkpoint concreto (setup night-1, 1.110 tareas de entrenamiento, temperatura 0,4, 15 pasos).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,5-4 GB; en 4 bits: alrededor de 2-2,5 GB (no se distribuyen pesos cuantizados en el repo, habría que generarlos).
- GPU recomendadas: A100, H100 o L40S para bf16 con throughput alto; RTX 4090, RTX 3090 o RTX 4080 para inferencia en bf16 con contexto completo de 4.096 tokens.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB o superiores en bf16; en GPUs de 8 GB sería necesario cuantizar.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversión a GGUF) y transformers con LlamaFactory para evaluación.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webshop-night_Llama-3.2-3B_IWM (este) | 3,21 B | 4.096 | Agente WebShop (IWM + IL) | llama3.2 | Hugging Face |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128 K (modelo base) | Instrucciones generales | llama3.2 | Hugging Face |
| Variantes de imitación pura del mismo autor | no disponible | no disponible | Agente WebShop (IL) | llama3.2 | no disponible en la información proporcionada |
| Variantes de self-reflection del mismo autor | no disponible | no disponible | Agente WebShop | llama3.2 | no disponible en la información proporcionada |

La comparación directa con alternativas de la misma categoría (agentes WebShop de 3B) no está disponible más allá de las referencias del paper; los resultados de imitación (41,8), IWM (60,2) y self-reflection (52,7) del paper sirven como contexto, pero no corresponden a checkpoints publicados con nombre y versión en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación especializado: está ajustado exclusivamente para WebShop night-1 y no es un modelo de propósito general; su uso fuera de ese entorno degradará el rendimiento.
- Licencia Llama 3.2: impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos completos antes de cualquier despliegue en producción.
- Riesgo de alucinación: como todo modelo generativo, puede producir observaciones o acciones plausibles pero incorrectas; en un agente interactivo esto puede llevar a trayectorias inválidas.
- Contexto limitado a 4.096 tokens durante el entrenamiento; no se documenta extensión de contexto más allá de ese valor.
- Idiomas no documentados: aunque el modelo base es multilingüe, no hay evidencia de que el ajuste conserve capacidades multilingües en WebShop.
- Sin datos de sesgos: no se han publicado evaluaciones de sesgo para este checkpoint.
- Sin pesos cuantizados oficiales: el repo solo contiene safetensors; cualquier cuantización es responsabilidad del usuario.
- Trazabilidad de checkpoints: el nombre codifica pasos y épocas, pero no se documenta una evaluación intermedia por etapa, solo el resultado final.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria independiente del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/patrickamadeus/webshop-night_Llama-3.2-3B_IWM_bs4_WM.15652.15652_IL.2644.2644
- Repositorio del proyecto (convención de nombres y campos): https://github.com/patrickamadeus/imagined-experience
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Paper "Early Experience" (referenciado en la model card; no se proporciona URL directa en la información disponible)
- WebShop (benchmark): no se proporciona URL directa en la información disponible
