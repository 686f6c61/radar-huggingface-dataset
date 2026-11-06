# blueprint-ai-bot/blueprint-ai-bot

## Resumen

`blueprint-ai-bot/blueprint-ai-bot` es un repositorio de Hugging Face publicado por la organización Blueprint AI HQ, cuyo contenido principal es una model card que actúa como página de presentación del proyecto GlassNet. No se trata de un modelo con pesos publicados en este repositorio: la model card describe GlassNet como un modelo de lenguaje escrito desde cero (tensores, backward pass, optimizador y KV cache propios) sobre NumPy, sin PyTorch, sin `transformers` y sin pesos preentrenados. El repositorio en sí no expone arquitectura, tokenizador, configuración ni artefactos de inferencia.

El modelo de mayor tamaño de la familia, `glassnet-d512-ext6-37pct`, tiene 15,6M de parámetros y una precisión *held-out* declarada del 37,37%; el segundo, `glassnet-d256-2m-24pct`, tiene 5,9M de parámetros y 24,20%. El autor indica explícitamente que GlassNet "no es todavía un asistente". La propuesta diferencial es la auditabilidad: "neuronas de concepto con nombre" que permitirían leer por qué se produjo una respuesta, publicación de experimentos fallidos y trazabilidad de cada cifra a un fichero de ejecución concreto.

La relevancia de esta ficha es limitada para producción: se trata de un proyecto de investigación educativa y de transparencia, no de un modelo listo para despliegue. No hay pipeline declarado, ni licencia, ni idiomas, ni formatos de pesos en el repositorio. Cualquier evaluación práctica debe hacerse contra el código del repositorio GitHub del proyecto, no contra este repositorio de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer escrito desde cero sobre NumPy (sin PyTorch ni `transformers`); detalles de capas, atención y normalización no disponibles |
| Parametros totales | 15,6M (variante `glassnet-d512-ext6-37pct`); 5,9M (variante `glassnet-d256-2m-24pct`) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no declara safetensors, GGUF ni binarios) |

## Arquitectura y entrenamiento

La model card indica que GlassNet implementa su propio motor de entrenamiento e inferencia: tensores, retropropagación, optimizador y KV cache propios, con NumPy como único backend de arrays. No se especifica el tipo de bloque (post-norm o pre-norm), el mecanismo de atención (multi-head, multi-query o grouped-query), la función de activación, el tokenizador ni la composición del dataset. Tampoco se documenta el número de tokens de entrenamiento ni si hubo fases de ajuste fino supervisado, RLHF o DPO.

La innovación declarada es la presencia de "neuronas de concepto con nombre", una forma de unidades interpretables que permitirían inspeccionar la contribución de conceptos concretos a la salida. El autor menciona además que su arquitectura propia perdió frente a "la simple" en sus propios experimentos, y que ese resultado se publica junto al resto de registros de ejecución. Las cifras de precisión *held-out* (37,37% y 24,20%) se presentan sin especificar la tarea, el conjunto de evaluación ni la métrica exacta, por lo que no son comparables con benchmarks estándar.

## Capacidades

- Generación de texto a nivel de modelo de lenguaje pequeño, con precisión *held-out* declarada del 37,37% en la variante de 15,6M de parámetros.
- Inspección interna mediante "neuronas de concepto con nombre", orientada a auditar la relación entre conceptos y salidas.
- Entrenamiento e inferencia reproducibles desde el repositorio GitHub del proyecto, con registros de ejecución publicados, incluidos los fallidos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe ni idiomas cubiertos.
- No se documenta modo *thinking*, visión, audio ni otras modalidades.
- No se declara un pipeline de Hugging Face (`text-generation` u otro) en el repositorio.

## Casos de uso

- Investigación sobre interpretabilidad: usar las "neuronas de concepto con nombre" para estudiar cómo se representa un concepto concreto y su efecto en la generación, aprovechando que el modelo es pequeño (15,6M de parámetros) y el código es propio.
- Docencia de fundamentos de deep learning: el proyecto permite recorrer forward pass, backward pass, optimizador y KV cache en NumPy, sin capas de abstracción de frameworks, lo que facilita explicar cada operación con el código a la vista.
- Reproducción de experimentos: el repositorio GitHub publica los registros de ejecución, incluidas las arquitecturas que perdieron, lo que sirve como material para estudiar decisiones de diseño y comparaciones controladas.
- Auditoría de metodología: las reglas del proyecto ("ninguna cifra sin una ejecución detrás", "los experimentos fallidos se publican") permiten usar el modelo como caso de estudio de prácticas de reporte transparente en publicaciones de modelos.
- Prototipado educativo de un motor de inferencia: al incluir KV cache propia, el código puede emplearse para entender y medir el coste de memoria de la caché en modelos pequeños, aunque no se publican cifras de latencia ni throughput.
- Pruebas de integración de un motor propio: validar que un pipeline de entrenamiento e inferencia sin dependencias de PyTorch produce resultados estables, como base para proyectos que requieran control total de la pila numérica.

## Benchmarks y rendimiento

| Modelo | Precisión *held-out* | Parámetros |
|---|---:|---:|
| `glassnet-d512-ext6-37pct` | 37,37% | 15,6M |
| `glassnet-d256-2m-24pct` | 24,20% | 5,9M |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores no especifican tarea, conjunto de evaluación ni métrica, por lo que no son comparables con resultados de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 15,6M de parámetros en precisión de 32 bits, el peso de los parámetros sería de aproximadamente 62 MB, y en 16 bits de aproximadamente 31 MB; estas cifras son una estimación aritmética a partir del recuento de parámetros, no un dato publicado por el autor.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna sería suficiente en términos de memoria, pero no se ha publicado ningún requisito ni prueba de despliegue.
- Compatibilidad con GPU consumer: previsiblemente sí por tamaño, pero no verificado ni documentado por el autor.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. La inferencia se realiza con el motor propio del repositorio GitHub, basado en NumPy.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión declarada | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| `glassnet-d512-ext6-37pct` | 15,6M | no disponible | 37,37% held-out | no disponible | Repositorio HF sin pesos declarados; código en GitHub |
| `glassnet-d256-2m-24pct` | 5,9M | no disponible | 24,20% held-out | no disponible | Repositorio HF sin pesos declarados; código en GitHub |
| Alternativas de tamaño similar (p. ej. modelos tipo GPT-2 small, 124M) | 124M | 1024 tokens (GPT-2) | no comparable con la métrica del autor | según modelo | no disponible en la información proporcionada |

No se dispone de datos suficientes para establecer una comparación rigurosa con alternativas de la misma categoría: la métrica *held-out* del autor no está definida y los modelos comparables no se han identificado en la información proporcionada.

## Limitaciones y advertencias

- El propio autor declara que GlassNet "no es un asistente todavía" y que su precisión *held-out* es del 37,37%, insuficiente para uso conversacional o de producción.
- La métrica de precisión no especifica tarea, dataset ni definición exacta, lo que impide comparaciones fiables con otros modelos.
- No se publica licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier uso.
- No se declaran idiomas soportados; no hay evidencia de capacidad multilingüe.
- No se declaran formatos de pesos ni pipeline de Hugging Face en este repositorio, por lo que no es directamente cargable con `transformers`, llama.cpp u otras herramientas estándar.
- No hay información sobre sesgos, datos de entrenamiento ni filtrado de contenido, lo que impide evaluar riesgos de alucinación y sesgo de forma sistemática.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Los resultados de búsqueda web sobre "blueprint" corresponden a acepciones genéricas del término (planos técnicos, gestión de programas, herramientas 3D) y no aportan información sobre este modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/blueprint-ai-bot/blueprint-ai-bot
- Modelo `glassnet-d512-ext6-37pct`: https://huggingface.co/blueprint-ai-bot/glassnet-d512-ext6-37pct
- Modelo `glassnet-d256-2m-24pct`: https://huggingface.co/blueprint-ai-bot/glassnet-d256-2m-24pct
- Código y registros de ejecución: https://github.com/blueprint-ai-hq-git/glassnet
- Contacto del autor: blueprintai.help1@gmail.com
