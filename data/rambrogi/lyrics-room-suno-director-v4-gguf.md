# rambrogi/lyrics-room-suno-director-v4-GGUF

## Resumen

Lyrics Room — Suno Director v4 es un modelo de lenguaje especializado en transformar borradores de letras de canciones en "partituras de rendimiento" listas para el generador musical Suno v5.5. Desarrollado por rambrogi como parte de la suite Lyrics Room, este modelo es un fine-tuning de `unsloth/gemma-4-12b-it`, la versión instruct de Gemma 4 con 12 mil millones de parámetros. Su función principal es añadir anotaciones de dirección musical —notas vocales, cues de arreglo, indicaciones de producción e intros/outros— a una letra existente, sin modificar ni una sola palabra cantada.

El problema que resuelve es práctico: Suno lee la hoja de letras de arriba a abajo y tiende a ignorar o cantar las instrucciones que aparecen después de la línea que describen. Este modelo coloca las cues *antes* de la línea afectada, usando paréntesis tipados `(Vocal: ...)`, `(Production: ...)` y cues libres entre corchetes `[a low kick enters]`, garantizando que el motor musical las interprete correctamente. Está pensado para integrarse en un flujo de trabajo con otros modelos de la suite, como Topline Writer v9 para la escritura de letras y un panel de críticos para evaluación.

La relevancia actual radica en la creciente adopción de herramientas de IA generativa en producción musical. Este modelo ofrece un puente entre la generación de texto lírico y la generación de audio, con un control fino sobre la interpretación. Se distribuye en formato GGUF cuantizado a Q8_0, listo para servirse con llama.cpp, LM Studio u Ollama, y su licencia Gemma permite uso comercial bajo las condiciones de Google.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 12B instruct) |
| Parametros totales | 11.907.350.576 (~11,9 B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | GGUF (fichero único `lyrics-room-suno-director-v4.Q8_0.gguf`, ~12,67 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Gemma 4, específicamente la variante instruct de 12 B parámetros publicada por Google y disponible en HuggingFace a través de `unsloth/gemma-4-12b-it`. El fine-tuning se realizó sobre datos de "Topline Writer sheets", es decir, borradores de letras con sus correspondientes anotaciones de dirección musical. El entrenamiento se centró en aprender a insertar cues de producción y vocales en las posiciones correctas, respetando estrictamente la integridad de las líneas cantadas originales.

La innovación técnica principal no está en la arquitectura, sino en el protocolo de inferencia. El modelo está instruido mediante un "contrato de canción" (song contract) que exige preservar cada línea cantada verbatim, mantener el orden de las secciones y el recuento de palabras, y solo añadir etiquetas, cues y notas entre las líneas. Se recomienda una temperatura de muestreo de 0.2 y una salida en JSON con el campo `lyrics`. En caso de que el modelo altere contenido cantado, se aplica un reintento endurecido con un prompt adicional que refuerza la preservación. No se han publicado detalles sobre el número exacto de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto estructurado: produce letras completas en formato JSON con el campo `lyrics`, incluyendo etiquetas de estado de ánimo, energía e instrumentación al inicio.
- Anotación de dirección musical: inserta notas parentéticas `(Vocal: ...)`, `(Production: ...)`, `(Arrangement: ...)`, `(FX: ...)`, `(Dynamics: ...)`, etc., colocadas inmediatamente antes de la línea que afectan.
- Cues de arreglo en corchetes: añade líneas libres como `[a low kick enters]` como vehículo principal para cambios de producción, con especial énfasis en intros, breakdowns y outros.
- Preservación de letras existentes: garantiza que las palabras cantadas no se modifiquen, reordenen, añadan o eliminen, manteniendo el recuento de palabras y el orden de las secciones.
- Escritura de letras desde cero: aunque no es su uso previsto, puede generar letras si se le proporciona un borrador vacío, gracias a su entrenamiento en hojas de Topline Writer.
- Salida en JSON: compatible con integraciones programáticas y pipelines de automatización.
- Soporte para herramientas de inferencia locales: funciona con llama.cpp, LM Studio y Ollama mediante el formato GGUF.

## Casos de uso

- Preparación de letras para Suno v5.5: el caso principal. El usuario escribe un borrador lírico con Topline Writer v9 y lo pasa por este modelo para obtener una "partitura de rendimiento" con todas las anotaciones de producción que Suno interpretará correctamente.
- Flujo de trabajo de creación musical con IA: integrar este modelo en un pipeline que conecta generación de letras, anotación, evaluación con un panel de críticos y refinamiento final, como se describe en el diagrama de la model card.
- Automatización de anotaciones de producción: en estudios que producen muchas canciones, este modelo puede estandarizar el formato de las instrucciones musicales, reduciendo el trabajo manual de añadir cues a cada letra.
- Generación de letras con direcciones integradas: aunque no es el uso recomendado, puede servir como generador de letras que ya incluyen indicaciones de interpretación, útil para prototipos rápidos.
- Evaluación de calidad de arreglos: al alimentar el modelo con un borrador y luego pasar el resultado por el panel de críticos (disponible en otro repositorio), se puede evaluar objetivamente la calidad de los arreglos propuestos.
- Educación y experimentación: permite a productores y compositores aprender cómo estructurar instrucciones para generadores musicales, observando las convenciones que el modelo aplica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta métricas estándar como MMLU, HumanEval o GSM8K, ya que su tarea es específica de dominio musical y no se ha evaluado formalmente en esos conjuntos. La calidad se mide mediante la preservación de líneas cantadas y la aceptación de las partituras por parte del panel de críticos, pero no hay datos numéricos públicos.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF Q8_0 ocupa aproximadamente 12,67 GB en disco. Para inferencia, se recomienda al menos 16 GB de VRAM para cargar el modelo completo en GPU con margen para el contexto y las activaciones. Con 12 GB de VRAM podría funcionar con offloading parcial a CPU, pero con mayor latencia.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 4080 (16 GB), A100 40 GB, H100 80 GB. En GPUs con menos de 16 GB, se puede usar cuantización inferior (Q4_K_M, Q5_K_M) aunque no se proporcionan en este repositorio.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama alta para consumidores con 16 GB o más. En tarjetas de 8-12 GB, se requeriría cuantización más agresiva o ejecución en CPU.
- Opciones de despliegue: llama.cpp (incluido llama-server), LM Studio (interfaz gráfica), Ollama (servicio local). También se puede usar con bindings de Python como llama-cpp-python. No se recomienda vLLM para GGUF, ya que vLLM prefiere safetensors y cuantizaciones GPTQ/AWQ.
- Latencia y throughput: no disponibles. Como referencia, un modelo de 12 B en Q8_0 en una RTX 4090 suele generar entre 20 y 40 tokens por segundo, pero no hay datos oficiales para este fine-tuning.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la misma categoría (anotación de letras para Suno). Se puede comparar con el modelo base y con otros fine-tunings de la suite Lyrics Room:

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| lyrics-room-suno-director-v4 (este) | ~11,9 B | no disponible | Gemma | Anotación de partituras para Suno |
| unsloth/gemma-4-12b-it (base) | ~11,9 B | no disponible | Gemma | Chat y generación general |
| lyrics-room-topline-gemma4-12b-v9 | ~11,9 B | no disponible | Gemma | Escritura de letras (topline) |

La comparativa con el modelo base es relevante: Gemma 4 12B instruct no tiene el conocimiento especializado de cues musicales ni el contrato de preservación, por lo que produciría letras sin las anotaciones necesarias o podría alterar el texto. El fine-tuning añade una capa de control de formato y dominio que el base no posee.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un fine-tuning de Gemma 4, hereda los sesgos del modelo base, que pueden reflejarse en estilos musicales o temáticas dominantes.
- Riesgo de alucinación: el modelo puede alterar líneas cantadas si se usa con temperaturas superiores a 0.2. La model card recomienda descartar cualquier salida que modifique el contenido cantado y reintentar con el prompt endurecido.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto. Para letras largas (más de 5000 caracteres), el modelo podría fallar al preservar todas las líneas. Se recomienda respetar el límite de 5000 caracteres indicado en el prompt.
- Restricciones de licencia: la licencia Gemma permite uso comercial, pero requiere cumplir las políticas de uso prohibido de Google. Es necesario revisar los términos completos de la licencia Gemma antes de desplegar en producción.
- Dependencia de Suno: el modelo está optimizado para Suno v5.5. Si Suno cambia su interpretación de las cues, las partituras generadas podrían dejar de ser efectivas.
- Formato de salida: el modelo devuelve JSON con el campo `lyrics`. Si se usa fuera de ese formato (por ejemplo, con interfaces que no soporten JSON), la salida puede ser inconsistente.
- No genera audio: este modelo solo produce texto. La conversión a música requiere Suno u otro motor de síntesis.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rambrogi/lyrics-room-suno-director-v4-GGUF
- Panel de críticos (Structured Panel): https://huggingface.co/rambrogi/lyrics-room-structured-panel-definitive-GGUF
- Topline Writer v9 (generación de letras): https://huggingface.co/rambrogi/lyrics-room-topline-gemma4-12b-v9-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-4-12b-it
