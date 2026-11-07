# okdohyuk/nogmi-sum-ko-qwen3-0.6b-v1-mlx-4bit

## Resumen

nogmi-sum-ko-qwen3-0.6b-v1-mlx-4bit es un modelo de generacion de texto especializado en resumen de transcripciones de voz en coreano, desarrollado por el usuario okdohyuk para la aplicacion Nogmi (노그미). Se construye a partir del modelo base Qwen/Qwen3-0.6B de Alibaba Cloud, sobre el que se aplica un ajuste fino mediante LoRA orientado al dominio de resumen de reuniones, clases, sesiones de brainstorming, entrevistas y notas generales, seguido de la fusion de pesos y una cuantizacion de 4 bits con group-size 64 en formato MLX.

El modelo esta disenado para ejecucion completamente local en dispositivos con Apple Silicon (series M y A), con un unico archivo de pesos de aproximadamente 320 MB y una velocidad de generacion declarada de entre 305 y 354 tokens por segundo. Su propuesta de valor no reside en capacidades generales de razonamiento, sino en el cumplimiento determinista de formato: eliminacion de bloques de codigo, HTML e introducciones o despedidas conversacionales, y adherencia a estructuras de encabezados Markdown especificas por modo de resumen.

Con 596.049.920 parametros totales y licencia Apache 2.0, el modelo es relevante para desarrolladores que necesiten una solucion de resumen en coreano de baja latencia, sin dependencia de red ni de GPU dedicada, integrable en aplicaciones moviles o de escritorio sobre el stack MLX de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX con group-size 64 |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, archivo unico model.safetensors) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer denso de Qwen3-0.6B, con capacidades nativas de razonamiento e instrucciones del modelo base. Sobre esta base se aplica un ajuste fino con LoRA especificamente orientado al dominio de resumen de transcripciones de voz en coreano, cubriendo escenarios de reunion, clase, brainstorming, entrevista y notas generales. Posteriormente se realiza la fusion de los pesos adaptados en el modelo base y una cuantizacion de 4 bits con group-size 64 en formato MLX, lo que reduce el artefacto final a un unico archivo safetensors de aproximadamente 320 MB.

La innovacion tecnica destacable es la compatibilidad con una plantilla de prefill de asistente directo que omite el bloque de razonamiento: la secuencia `<|im_start|>assistant\n<think>\n\n</think>\n\n` permite saltar la fase de pensamiento del modelo base y emitir directamente la respuesta formateada. El ajuste fino se ha orientado a un comportamiento determinista de formato: ausencia total de code fences, HTML y saludos, y cumplimiento estricto de encabezados Markdown por modo (por ejemplo, estructura de resumen, discusion, decisiones y acciones). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y resumen extractivo y abstractivo de transcripciones de voz en coreano.
- Resumen estructurado por modos: reuniones, clases, brainstorming, entrevistas y notas generales, con encabezados Markdown especificos por modo.
- Cumplimiento determinista de formato: cero bloques de codigo, cero HTML, cero introducciones o despedidas conversacionales.
- Preservacion de datos criticos: cifras, porcentajes, fechas y nombres en el resumen (se declara una tasa de preservacion del 100% frente al 11,1% del modelo base).
- Asignacion explicita de responsables y plazos en resumenes de reunion, con reduccion de alucinaciones frente al modelo base.
- Compatibilidad con la plantilla ChatML de Qwen y con el prefill de asistente directo para omitir el modo de razonamiento.
- Capacidades multilingues: limitadas al coreano segun la model card.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision o audio nativo: no disponible; el modelo procesa texto, no audio.

## Casos de uso

- Resumen de reuniones de trabajo: el modelo recibe la transcripcion de una reunion y genera un documento con secciones de resumen, discusion, decisiones y acciones, asignando responsables y fechas. Es adecuado por su adherencia estricta a la estructura Markdown y su capacidad declarada de preservar cifras y plazos.
- Resumen de clases y apuntes academicos: integrado en una aplicacion de notas, convierte la transcripcion de una clase en un resumen organizado por conceptos y puntos clave. Su tamano de 320 MB permite ejecutarlo en local sin enviar contenido sensible a la nube.
- Actas de entrevistas: procesa transcripciones de entrevistas y extrae los temas tratados y las respuestas relevantes, con formato limpio y sin ruido conversacional, lo que facilita su publicacion directa o su volcado a un sistema de gestion documental.
- Notas de brainstorming: sintetiza sesiones de ideacion en listas de ideas y decisiones, manteniendo la estructura por encabezados y evitando la generacion de tablas repetidas o bucles que el modelo base produce en este dominio.
- Aplicaciones moviles y de escritorio con procesamiento on-device: al ejecutarse sobre MLX en Apple Silicon con un unico archivo de pesos, es viable integrarlo en una app macOS o iOS para resumir notas de voz sin conexion y con baja latencia (305-354 tokens por segundo).
- Pipeline de transcripcion a resumen en tiempo casi real: combinado con un motor de speech-to-text local, permite construir un flujo completo de voz a resumen estructurado en el dispositivo, util para profesionales que necesitan procesar reuniones sin depender de servicios externos.
- Generacion de documentacion de reuniones automatizada: su formato determinista permite insertar la salida directamente en wikis o repositorios de documentacion sin postprocesado de limpieza.

## Benchmarks y rendimiento

Los unicos datos disponibles son las comparaciones internas publicadas por el autor entre el modelo base cuantizado y el modelo ajustado, medidas sobre el conjunto de evaluacion propio del autor:

| Metrica | Baseline (Qwen3-0.6B-4bit) | nogmi-sum-ko-qwen3-0.6b-v1-mlx-4bit |
|---|---|---|
| Tamano del archivo del modelo | 330,9 MB | 319,9 MB (model.safetensors unico) |
| Velocidad de inferencia | ~293 tok/s | 305-354 tok/s |
| Code fences e introducciones | 0 | 0 (Markdown limpio al 100%) |
| Cumplimiento de estructura de secciones Markdown | Parcial (bucles de tablas duplicadas) | 100% (resumen, discusion, decisiones, acciones) |
| Preservacion de cifras y hechos clave | 11,1% (1 de 9) | 100% |
| Alucinaciones | Multiples campos "미정" y tablas con bucles infinitos | Eliminadas; asignacion explicita de responsables y plazos |
| Tasa de salida limpia sin errores en held-out | 43,3% | 96,7% (29 de 30 casos sin defectos) |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo esta pensado para memoria unificada de Apple Silicon. El archivo de pesos ocupa aproximadamente 320 MB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: chips de Apple de las series M y A con soporte MLX; no se especifican modelos concretos en la informacion disponible.
- Compatibilidad con GPU de consumo: si, en equipos Apple Silicon; no se documenta soporte para GPU NVIDIA o AMD en la informacion proporcionada.
- Opciones de despliegue: libreria MLX de Apple (formato nativo del modelo). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: 305-354 tokens por segundo en entorno MLX sobre Apple Silicon, segun mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| nogmi-sum-ko-qwen3-0.6b-v1-mlx-4bit | 596 M | no disponible | Apache 2.0 | Resumen de transcripciones en coreano, on-device | Hugging Face (MLX) |
| Qwen/Qwen3-0.6B | 596 M | no disponible | Apache 2.0 | Modelo generalista multilingue con razonamiento | Hugging Face |
| Qwen/Qwen3-0.6B-MLX-4bit | 596 M | no disponible | Apache 2.0 | Version oficial cuantizada a 4 bits para MLX | Hugging Face (MLX) |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de informacion sobre otros modelos especializados en resumen de coreano de tamano comparable en los datos proporcionados. Frente a Qwen3-0.6B-MLX-4bit, el modelo ajustado reduce el tamano del artefacto en unos 11 MB, incrementa la velocidad de generacion y mejora de forma marcada el cumplimiento de formato y la preservacion de datos en el dominio de resumen, a costa de perder generalidad y capacidades multilingues.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste fino esta orientado exclusivamente al resumen de transcripciones en coreano; su rendimiento en otras tareas de generacion puede degradarse respecto al modelo base.
- Idiomas: solo se declara soporte de coreano; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar con precision el truncado de transcripciones largas.
- Alucinacion: aunque la model card declara eliminacion de fabricaciones en el conjunto evaluado, sigue siendo un modelo de 0,6 mil millones de parametros y puede generar contenido incorrecto en entradas atipicas o fuera de dominio.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible.
- Formato de despliegue: el modelo esta empaquetado para MLX y Apple Silicon; no se documenta soporte para otros runtimes, lo que limita su uso en servidores Linux con GPU NVIDIA.
- Madurez: el repositorio registra cero descargas y cero likes en el momento de la consulta, y fue creado en noviembre de 2026; no existe validacion externa independiente de los resultados declarados.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda conservar los avisos de licencia del modelo base Qwen3-0.6B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/okdohyuk/nogmi-sum-ko-qwen3-0.6b-v1-mlx-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Version oficial cuantizada del modelo base para MLX: https://huggingface.co/Qwen/Qwen3-0.6B-MLX-4bit
- README de la version oficial MLX: https://huggingface.co/Qwen/Qwen3-0.6B-MLX-4bit/blob/main/README.md
