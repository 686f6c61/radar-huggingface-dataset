# LastMachine/Qwen3-8B-ZeroZero-Heretic-MLX

## Resumen

Qwen3-8B-ZeroZero-Heretic-MLX es una compilacion cuantizada a 4 bits en formato MLX del modelo Qwen3-8B-ZeroZero-Heretic, publicado por el usuario independiente LastMachine. Se trata de un derivado de Qwen/Qwen3-8B al que se le ha aplicado un proceso de "abliteration" mediante la herramienta Heretic 2.0.0, cuyo objetivo es reducir drásticamente la tasa de rechazos (refusals) ante peticiones que un modelo convencional declinaria. Sobre esa base se ha anadido una pasada adicional orientada a eliminar lo que el autor denomina "slop": respuestas formulaicas, muletillas y patrones de texto redundantes.

El modelo conserva la arquitectura original de Qwen3-8B (transformer denso de aproximadamente 8.190 millones de parametros) y se distribuye en formato MLX, es decir, optimizado para ejecutarse en Macs con Apple Silicon a traves de la libreria mlx-lm. La cuantizacion se realizo a 4,5 bits por peso, lo que reduce el repositorio a unos 4,6 GB y permite su ejecucion en equipos con memoria unificada moderada.

Su relevancia es doble: por un lado, demuestra el flujo de trabajo de modificacion de alineamiento sobre un modelo reciente de Qwen; por otro, ofrece una via practica para desplegar ese modelo modificado en hardware de Apple sin GPU dedicada. Conviene subrayar que el autor advierte explicitamente de que la reduccion de rechazos no implica mayor veracidad, y que el modelo puede producir contenido danino, falso o sesgado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit MLX (4,5 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-8B, un transformer denso de aproximadamente 8.190 millones de parametros. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset original ni las fases de RLHF o DPO aplicadas por Qwen en el modelo base.

La modificacion realizada por LastMachine se apoya en Heretic 2.0.0, una herramienta de abliteration que actua sobre las direcciones de activacion asociadas al rechazo para reducir la probabilidad de que el modelo decline peticiones. Sobre el modelo ya "decensored" se aplico una segunda pasada orientada a reducir patrones de "slop". Segun la model card, los resultados medidos sobre el modelo completo en 16 bits (no sobre esta compilacion de 4 bits) son: reduccion del 91% en rechazos ante el conjunto de prompts daninos de Heretic (de 100/100 a 9/100), reduccion del 68% en respuestas que activan la lista de slop (de 78/100 a 25/100), reduccion del 78% en palabras de slop por cada 1.000 (de 16,5 a 3,6) y mantenimiento de las comprobaciones de hechos y logica (13/15 antes y despues). El autor advierte de que estas cifras se midieron en el modelo de 16 bits y que en esta version de 4 bits pueden aparecer diferencias menores.

## Capacidades

- Generacion de texto conversacional y de formato largo (relatos, articulos, documentacion), segun el ejemplo de uso de la model card.
- Reduccion significativa de rechazos ante peticiones que un modelo alineado convencional declinaria, incluidas peticiones potencialmente daninas.
- Menor incidencia de muletillas y patrones formulaicos ("slop") en comparacion con el modelo decensored previo.
- Capacidades de razonamiento y conocimiento heredadas del modelo base Qwen3-8B, si bien no se detallan en la informacion disponible.
- Soporte de tool calling, function calling, agentes o modo "thinking": no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline declarado es exclusivamente text-generation.
- Capacidades multilingues: no disponibles; el campo de idiomas no esta informado en el repositorio.

## Casos de uso

- Generacion creativa de ficcion: el modelo puede redactar relatos, dialogos y escenas sin las autocorrecciones ni evasivas tipicas de un modelo alineado, lo que resulta util para autores que trabajan con tematicas oscuras o controvertidas y necesitan que el modelo no "suavice" el tono.
- Investigacion sobre alineamiento y seguridad: permite estudiar empiricamente como varia la tasa de rechazos tras una abliteration y que coste tiene en terminos de veracidad y coherencia, comparando con el Qwen3-8B original.
- Prototipado local en Mac con Apple Silicon: al estar en formato MLX de 4 bits y ocupar unos 4,6 GB, se puede ejecutar con mlx-lm en un Mac con memoria unificada de 16 GB o superior, sin GPU dedicada, para pruebas de prompting y evaluacion rapida.
- Generacion de texto sin fricciones en tareas de redaccion tecnica o de marketing: la reduccion de "slop" disminuye la aparicion de frases hechas y plantillas, lo que puede reducir la edicion posterior en borradores largos.
- Analisis de contenido sensible en entornos controlados: investigadores que necesitan que el modelo describa sin filtros escenarios de riesgo (por ejemplo, para construir clasificadores o datasets de seguridad) pueden usarlo como generador, asumiendo la responsabilidad legal y etica del uso.
- Evaluacion comparativa de cuantizaciones: al existir la version de 16 bits del mismo modelo, sirve para medir la degradacion introducida por la cuantizacion a 4,5 bits en tareas de generacion abierta y en la tasa de rechazos.

## Benchmarks y rendimiento

La model card unicamente reporta las metricas internas del proceso de modificacion, medidas sobre el modelo de 16 bits. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Medida | Cambio | Antes → despues |
|---|---:|---:|
| Rechazos en el test de prompts daninos de Heretic | 91% menos | 100/100 → 9/100 |
| Respuestas que activan la lista de slop | 68% menos | 78/100 → 25/100 |
| Palabras de slop por 1.000 | 78% menos | 16,5 → 3,6 |
| Comprobaciones de hechos y logica superadas | Sin cambio | 13/15 → 13/15 |

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 4,6 GB de pesos en 4,5 bits, mas overhead de contexto y cache KV; en la practica se recomienda un minimo de 8 GB de memoria unificada y 16 GB para contextos largos.
- Hardware objetivo: Macs con Apple Silicon (series M1, M2, M3, M4 y superiores). El formato MLX no esta pensado para GPU NVIDIA ni AMD.
- GPU dedicadas: no aplica; para CUDA seria necesario usar la version de 16 bits del modelo o generar una cuantizacion GGUF/AWQ propia.
- Despliegue: mlx-lm (libreria oficial del formato). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI para esta compilacion concreta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LastMachine/Qwen3-8B-ZeroZero-Heretic-MLX | 8,19 B | no disponible | MLX 4-bit | Apache 2.0 | Objeto de esta ficha; abliterated y "no-slop"; solo Apple Silicon |
| LastMachine/Qwen3-8B-ZeroZero-Heretic | 8,19 B | no disponible | safetensors 16-bit | Apache 2.0 | Version completa del mismo modelo; referencia para medir el efecto de la cuantizacion |
| Qwen/Qwen3-8B | 8,19 B | no disponible | safetensors | Apache 2.0 | Modelo base alineado; rechaza peticiones daninas y no incorpora la pasada "no-slop" |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El autor advierte explicitamente de que el modelo responde a muchas peticiones que un modelo normal rechaza, incluidas peticiones daninas, y que su salida puede ser peligrosa, falsa o sesgada.
- Menos rechazos no equivale a mayor veracidad: la model card cita el ejemplo de Tiananmen Square, donde el modelo ofrece una version oficial sanitizada. No es fiable para hechos sobre China ni para decisiones financieras, medicas o legales.
- El repositorio incluye un formulario de acceso restringido (gated) con aceptacion de terminos de uso responsable; el acceso no es completamente abierto pese a la licencia Apache 2.0.
- Las metricas de mejora se midieron sobre el modelo de 16 bits, no sobre esta compilacion de 4 bits; la cuantizacion puede alterar tanto la tasa de rechazos como la calidad del texto.
- La licencia Apache 2.0 permite uso comercial, pero el propio autor declina responsabilidad sobre el uso y exige al usuario asumir la responsabilidad legal y etica.
- El modelo solo funciona en el ecosistema MLX (Apple Silicon); no es portable directamente a CUDA sin conversion.
- No se informan los idiomas soportados ni la longitud de contexto efectiva en el repositorio, lo que dificulta planificar su uso en produccion multilingue o con contextos largos.
- Riesgo de sesgos heredados del modelo base y potencialmente amplificados por la reduccion de filtros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic-MLX
- Modelo base modificado (16 bits): https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-8B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
