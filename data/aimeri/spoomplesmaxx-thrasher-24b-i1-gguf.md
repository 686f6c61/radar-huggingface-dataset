# aimeri/spoomplesmaxx-thrasher-24B-i1-GGUF

## Resumen

Spoomplesmaxx-thrasher-24B-i1-GGUF es la versión cuantizada con matriz de importancia (imatrix) del modelo base `aimeri/spoomplesmaxx-thrasher-24B`, un fine-tune de aproximadamente 24 mil millones de parámetros orientado a roleplay, escritura creativa y asistencia conversacional. El autor, aimeri, publica estos pesos en formato GGUF con cuantizaciones calibradas sobre una muestra de unos 2 millones de caracteres del corpus de entrenamiento del propio modelo, lo que mejora la calidad a bits bajos en comparación con las cuantizaciones estáticas.

El modelo está diseñado para mantener personajes de forma consistente y seguir instrucciones complejas, combinando creatividad narrativa con razonamiento lógico. Incluye la plantilla de ChatML incrustada, de modo que llama.cpp la detecta automáticamente sin configuración adicional. Su licencia Apache 2.0 permite uso comercial sin restricciones, aunque el contenido generado está pensado para un público adulto y el autor advierte que el usuario debe aportar su propio sistema de moderación.

Esta ficha se centra en la versión i1-GGUF, que ofrece cuatro tamaños de cuantización que van desde aproximadamente 8,7 GB hasta 14 GB, permitiendo su ejecución en tarjetas gráficas de consumo con 12 GB o 24 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona base Mistral, sin especificar variante) |
| Parametros totales | 23.572.403.200 (~24B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ3_XXS, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_M (GGUF con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con matriz de importancia incluida) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. La model card de la version i1-GGUF menciona explicitamente que se realizo una "cirugia de tokens" para adaptar ChatML a una base Mistral, lo que sugiere que el modelo original es un fine-tune de un modelo Mistral de 24B (probablemente Mistral Small 24B, aunque no se confirma). No se publican datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas como RLHF o DPO.

El proceso de cuantizacion i1 consiste en calibrar los pesos cuantizados utilizando una matriz de importancia calculada sobre una muestra de texto representativa del dominio del modelo. En este caso, se usaron aproximadamente 2 millones de caracteres extraidos del corpus de entrenamiento original. Esta calibracion mejora la fidelidad en cuantizaciones de 3 y 4 bits, mientras que para 5 bits o superiores el autor recomienda usar las cuantizaciones estaticas del repositorio hermano `aimeri/spoomplesmaxx-thrasher-24B-GGUF`.

## Capacidades

- Generacion de texto narrativo con coherencia y estilo, especialmente orientado a roleplay y escritura creativa.
- Mantenimiento de personajes: el modelo permanece en el personaje por diseno, segun la model card.
- Seguimiento de instrucciones complejas en formato conversacional, gracias a la plantilla ChatML.
- Razonamiento logico basico combinado con creatividad, segun la descripcion del dataset de entrenamiento en el repositorio GitHub.
- Capacidad multilingue limitada: el modelo esta entrenado principalmente en ingles, aunque puede generar texto en otros idiomas con menor calidad.
- Compatibilidad con herramientas de inferencia locales como llama.cpp, que detecta la plantilla ChatML automaticamente.

## Casos de uso

- Roleplay interactivo local: el modelo puede mantener conversaciones multi-turno con personajes definidos por el usuario, ideal para juegos de rol escritos o simulaciones de personajes en aplicaciones como SillyTavern o KoboldCpp. Su cuantizacion Q4_K_M de 14 GB cabe en una GPU de 24 GB y permite una generacion fluida.
- Escritura creativa asistida: generacion de dialogos, descripciones y tramas para novelas, guiones o fanfiction. La combinacion de creatividad y adherencia a instrucciones permite al usuario dirigir el tono y la direccion de la narrativa.
- Creacion de personajes para videojuegos: los desarrolladores pueden usar el modelo para generar dialogos y reacciones de NPCs de forma procedural, aprovechando su capacidad de mantenerse en personaje.
- Asistente conversacional con estilo: aunque no es su enfoque principal, puede actuar como un asistente con personalidad definida, util para demos o prototipos de chatbots con caracter.
- Generacion de contenido para redes sociales o blogs: redaccion de hilos, historias cortas o contenido creativo con un tono consistente, gracias a su entrenamiento en escritura creativa.
- Experimentacion con cuantizacion imatrix: el repositorio incluye el archivo `imatrix.dat`, lo que permite a investigadores o entusiastas generar sus propias cuantizaciones personalizadas a partir del modelo base, explorando el equilibrio entre tamano y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otros tests estandar. El autor se limita a proporcionar una recomendacion de sampler (temperatura 1.0, min_p 0.05, repeticion penalty 1.05 opcional) basada en barridos realizados sobre el modelo en precision completa, pero sin datos cuantitativos.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - i1-IQ3_XXS (~8,7 GB): cabe en GPUs con 10-12 GB de VRAM, como RTX 3080 o RTX 4060 Ti 16 GB.
  - i1-Q3_K_M (~11 GB): recomendado para tarjetas de 12 GB, como RTX 3060 o RTX 4070.
  - i1-IQ4_XS (~12 GB): tambien apto para 12 GB, aunque con margen limitado para el contexto.
  - i1-Q4_K_M (~14 GB): el punto dulce para tarjetas de 24 GB, como RTX 3090, RTX 4090 o RTX 5090.
- GPU recomendadas: RTX 3090/4090/5090 para la cuantizacion Q4_K_M; RTX 3060/4070 para las versiones de 11-12 GB.
- Opciones de despliegue: llama.cpp (soporte nativo con deteccion automatica de ChatML), Ollama, KoboldCpp, LM Studio y cualquier frontend compatible con GGUF. Tambien es compatible con endpoints a traves de servidores como llama.cpp server o text-generation-webui.
- Latencia y throughput: no se proporcionan datos oficiales. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generacion de entre 30 y 50 tokens por segundo para un contexto de 4096 tokens, aunque esto es una estimacion orientativa y depende de la implementacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos publicados. Como referencia de categoria, otros modelos de ~24B en formato GGUF orientados a roleplay o escritura creativa incluyen:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| spoomplesmaxx-thrasher-24B (i1) | ~24B | no disponible | Apache 2.0 | GGUF |
| Mistral Small 24B (base) | ~24B | 32K (segun especificaciones publicas de Mistral) | Apache 2.0 | safetensors, GGUF |
| Qwen 2.5 24B | ~24B | 128K | Apache 2.0 | safetensors, GGUF |

Sin benchmarks, no es posible establecer una comparativa objetiva de calidad. La eleccion entre estos modelos dependera de la disponibilidad de cuantizaciones, la longitud de contexto soportada y las preferencias de estilo tras pruebas locales.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta disenado para roleplay y escritura creativa sin filtros de moderacion. El autor advierte explicitamente: "For adults. Stays in character by design; bring your own moderation". En entornos de produccion, sera necesario implementar filtros externos.
- Sesgos y alucinaciones: al ser un fine-tune de un modelo base Mistral, puede heredar sesgos presentes en los datos de entrenamiento originales. La tendencia a mantenerse en personaje puede aumentar el riesgo de generar afirmaciones falsas o inventadas cuando se le pide informacion factual.
- Limitaciones de idioma: entrenado principalmente en ingles, su rendimiento en otros idiomas sera significativamente inferior.
- Contexto limitado: no se ha publicado la longitud de contexto soportada. Dado que la base es Mistral, es probable que soporte al menos 32K tokens, pero no esta confirmado.
- Riesgo de bucles de repeticion: la model card menciona que sin repeticion penalty, el modelo puede caer en bucles verbatim. Se recomienda activar un penalty de repeticion de 1.05, aunque esto puede provocar ocasionalmente turnos sin finalizar.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el usuario es responsable del contenido generado y de cumplir con las leyes aplicables.

## Enlaces

- Repositorio HuggingFace del modelo i1-GGUF: https://huggingface.co/aimeri/spoomplesmaxx-thrasher-24B-i1-GGUF
- Repositorio HuggingFace del modelo base: https://huggingface.co/aimeri/spoomplesmaxx-thrasher-24B
- Repositorio HuggingFace de cuantizaciones estaticas: https://huggingface.co/aimeri/spoomplesmaxx-thrasher-24B-GGUF
- Repositorio GitHub con los datasets de entrenamiento: https://github.com/aimerib/spoomplesmaxx
