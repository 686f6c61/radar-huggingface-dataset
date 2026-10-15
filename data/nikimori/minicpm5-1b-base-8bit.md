# nikimori/MiniCPM5-1B-Base-8bit

## Resumen

MiniCPM5-1B-Base-8bit es una conversión a 8 bits del modelo denso MiniCPM5-1B-Base de OpenBMB, publicada por el usuario nikimori en formato MLX para su ejecución en Apple Silicon. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los del checkpoint base original, únicamente cuantizados con `mlx_lm.convert -q --q-bits 8 --q-group-size 64` (mlx-lm 0.31.3, cuantización afín). El resultado ocupa 1,1 GB frente a los 2,0 GB de los pesos bf16 originales, con una reducción aproximada del 30 % en el tiempo por sugerencia.

El interés de esta ficha es doble. Por un lado, documenta el modelo MiniCPM5-1B-Base, el primer checkpoint de la serie MiniCPM5 de OpenBMB, un transformer denso de 1.080.632.832 parámetros diseñado específicamente para despliegue en dispositivo y entornos con recursos limitados. Por otro, ejemplifica un flujo de trabajo habitual en producción: tomar un modelo base en bf16, cuantizarlo y verificar empíricamente que la pérdida de calidad es despreciable para la tarea objetivo.

La relevancia práctica de esta conversión concreta es que su autor la publica como el modelo de autocompletado más rápido de Pretype, una herramienta de autocompletado en dispositivo para macOS. En el conjunto de evaluación de Pretype (5.649 filas, 17 idiomas), la versión de 8 bits empata con los pesos bf16 a los que reemplaza en acierto de primera palabra (15 % de todas las filas en ambos casos), con un peso de 1,1 GB en lugar de 2,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (serie MiniCPM 5.0) |
| Parametros totales | 1.080.632.832 (1,08 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, cuantizacion afín MLX con grupo de tamano 64 (`--q-bits 8 --q-group-size 64`) |
| Idiomas soportados | en, zh (etiquetas del modelo); evaluado en un conjunto de autocompletado de 17 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 1,1 GB) |

## Arquitectura y entrenamiento

El modelo subyacente, openbmb/MiniCPM5-1B-Base, es un transformer denso de aproximadamente 1,08 B de parametros, descrito por OpenBMB como el primer checkpoint de la serie MiniCPM5 y orientado a despliegue en dispositivo, ejecucion local y escenarios con recursos restringidos. La model card de esta conversion no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO en el checkpoint base; en consecuencia, esos datos se marcan como no disponibles. Tampoco se documenta en la informacion proporcionada ninguna innovacion arquitectonica especifica mas alla de la naturaleza densa del modelo (no hay MoE, SSM ni esquema hibrido declarado).

La intervencion del autor de este repositorio se limita a la cuantizacion. Segun la model card, los pesos no se modifican en ningun otro aspecto y la licencia permanece siendo la del modelo original (Apache-2.0). El proceso empleado es `mlx_lm.convert` con 8 bits y tamano de grupo 64 en modo afin, usando mlx-lm 0.31.3. No se documentan calibracion con datos propios, destilacion ni ajuste posterior a la cuantizacion, por lo que la unica garantia de calidad es la evaluacion empirica sobre la tarea de autocompletado descrita mas abajo.

## Capacidades

- Generacion de texto autoregresiva: es un modelo base (no instruct), por lo que su funcion natural es la continuacion de secuencias (completion) y el modelado de lenguaje, no el seguimiento de instrucciones.
- Autocompletado de texto: validado por el autor como modelo de completado en Pretype, con un 15 % de acierto de primera palabra sobre todas las filas del conjunto de evaluacion.
- Cobertura multilingue amplia en la evaluacion: el conjunto de prueba de Pretype cubre 17 idiomas, aunque las etiquetas oficiales del modelo solo declaran en y zh.
- Ingles como idioma mejor medido: 28 % de acierto de primera palabra sobre el total de filas en ingles, tanto en la version de 8 bits como en bf16.
- Ejecucion en dispositivo: el formato MLX permite inferencia local en Apple Silicon sin GPU dedicada ni servicios en la nube.
- Soporte de tool calling / function calling: no disponible en este checkpoint base; la receta de vLLM atribuye capacidad de uso de herramientas a MiniCPM5-1B, no al checkpoint base.
- Soporte de agentes y razonamiento multi-paso: no disponible en el checkpoint base; el material de OpenBMB situa esa capacidad en MiniCPM5-1B.
- Vision, audio o modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Autocompletado en dispositivo para macOS: es el caso de uso documentado por el autor. El modelo se integra en Pretype como el completado mas rapido disponible, con 1,1 GB de pesos y un 30 % menos de tiempo por sugerencia que los pesos bf16 equivalentes, manteniendo el mismo acierto de primera palabra.
- Autocompletado multilingue en editores ligeros: al haber sido evaluado sobre 17 idiomas, sirve para sugerencias de continuacion en entornos de escritura donde no se puede depender de una API remota por latencia, privacidad o coste.
- Comparacion y validacion de politicas de cuantizacion: el repositorio es un caso de referencia para medir el efecto de pasar de bf16 a 8 bits (grupo 64) sobre una tarea concreta, con un protocolo replicable de 5.649 filas y recuento de filas discordantes (14 frente a 21).
- Filtrado y puntuacion de datos por perplejidad: al ser un modelo base de 1 B, puede usarse localmente para puntuar y descartar texto de baja calidad en pipelines de preparacion de datasets, sin coste de GPU en la nube.
- Generacion de texto embebida en aplicaciones de escritorio: redaccion de esbozos, relleno de plantillas o continuaciones cortas dentro de una aplicacion nativa, donde el requisito es baja huella de memoria (1,1 GB de pesos) y funcionamiento sin conexion.
- Prototipado rapido de funciones de lenguaje en Mac: al cargarse con `mlx_lm.load` en pocas lineas, permite validar ideas de producto sobre un modelo de 1 B antes de invertir en infraestructura mayor.
- Base para experimentos de ajuste fino ligero: al ser un checkpoint base bajo Apache-2.0, puede servir como punto de partida para adaptaciones posteriores, teniendo en cuenta que la cuantizacion a 8 bits es un punto de partida poco habitual para entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras que siguen proceden de la evaluacion propia del autor sobre el conjunto de autocompletado de Pretype y comparan la version de 8 bits con los pesos bf16 a los que reemplaza.

| Metrica | 8 bits MLX | bf16 (referencia) |
|---|---|---|
| Filas del conjunto de evaluacion | 5.649 | 5.649 |
| Idiomas cubiertos | 17 | 17 |
| Acierto de primera palabra (todas las filas) | 15 % | 15 % |
| Acierto de primera palabra en ingles | 28 % | 28 % |
| Filas discordantes | 14 | 21 |
| Tamano de pesos | 1,1 GB | 2,0 GB |
| Tiempo por sugerencia | aproximadamente un 30 % menos | referencia |

## Requisitos de hardware

- Peso en disco y en memoria de los parametros: 1,1 GB en el repositorio de este modelo; el modelo upstream en bf16 ocupa 2,0 GB.
- VRAM o memoria unificada estimada para inferencia: del orden de 1,5 a 2 GB contando pesos, cache de KV y overhead del runtime de MLX. Cifra orientativa, no publicada por el autor.
- GPU compatibles: el repositorio esta en formato MLX, por lo que su destino natural son los chips de Apple Silicon (series M1, M2, M3 y M4). Para GPU NVIDIA se requiere reconvertir a otro formato; la receta de vLLM de OpenBMB existe para el modelo MiniCPM5-1B, no para estos pesos MLX.
- Cabe en hardware de consumo: si, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada. No hay datos publicados sobre su ejecucion en GPU de consumo tipo RTX 4090 con estos pesos concretos.
- Opciones de despliegue: `mlx-lm` (carga directa con `mlx_lm.load`), servidor local de mlx-lm y aplicaciones que embeban MLX, como Pretype. vLLM, llama.cpp, Ollama y TGI no consumen directamente pesos MLX.
- Latencia y throughput: el autor reporta aproximadamente un 30 % menos de tiempo por sugerencia frente a bf16, pero no publica milisegundos por token ni tokens por segundo, por lo que la cifra absoluta queda como no disponible.

## Comparativa con modelos similares

La informacion disponible solo permite comparar esta conversion con los pesos bf16 del mismo modelo base. Para alternativas de la misma categoria (modelos densos de 1 B orientados a dispositivo) no se han proporcionado especificaciones ni resultados, por lo que sus valores se indican como no disponibles.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B-Base-8bit (este repositorio) | 1,08 B | no disponible | safetensors MLX, 8 bits | Apache-2.0 | 1,1 GB; mismo acierto que bf16 en la tarea de autocompletado; ~30 % menos tiempo por sugerencia |
| openbmb/MiniCPM5-1B-Base (bf16) | 1,08 B | no disponible | safetensors bf16 | Apache-2.0 | 2,0 GB; modelo de referencia del que parte esta conversion |
| openbmb/MiniCPM5-1B | no disponible | no disponible | no disponible | no disponible | Checkpoint presentado por OpenBMB con capacidades de uso de herramientas y generacion de codigo |
| Alternativas densas de 1 B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- Es un modelo base, no un modelo instruct: no sigue instrucciones de forma fiable, no respeta formatos de chat y no soporta de serie tool calling ni flujos de agente. Las capacidades de uso de herramientas citadas en el material de OpenBMB corresponden a MiniCPM5-1B, no a este checkpoint.
- La model card de OpenBMB advierte de forma explicita de que el modelo genera contenido a partir de patrones estadisticos aprendidos y puede producir salidas inexactas, sesgadas o inseguras, que deben revisarse antes de usarse en contextos de alto riesgo.
- Riesgo de alucinacion: inherente a un modelo de lenguaje base de 1 B sin alineacion; en tareas de continuacion de texto se traduce en afirmaciones plausibles pero no verificadas.
- Cobertura idiomatica: las etiquetas oficiales solo declaran ingles y chino. Que el conjunto de evaluacion de Pretype cubra 17 idiomas no implica que el modelo haya sido entrenado o validado en todos ellos.
- Cifras de calidad muy ligadas a una unica tarea: el unico dato de rendimiento disponible (15 % de acierto de primera palabra) procede de un benchmark interno de autocompletado. No hay evidencia publicada sobre su comportamiento en razonamiento, codigo o comprension lectora, ni sobre la degradacion introducida por la cuantizacion en esas tareas.
- Longitud de contexto no documentada: no se puede planificar su uso en escenarios que requieran ventanas largas sin verificar antes el limite real del modelo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene conservar los avisos de licencia del modelo upstream y comprobar los terminos de cualquier componente adicional de la aplicacion que lo embeba.
- Dependencia de plataforma: el formato MLX limita el despliegue a Apple Silicon. Migrar a NVIDIA, AMD o CPU implica reconvertir el modelo, y no se documenta que dicha conversion preserve las metricas reportadas.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo dia. No hay senales de mantenimiento ni de validacion por terceros.
- Caveat de reproducibilidad: el autor no detalla la version exacta del tokenizador, la semilla ni el procedimiento de medida del conjunto de 5.649 filas, por lo que replicar la comparacion exige reconstruir ese protocolo.

## Enlaces

- Repositorio de esta conversion: https://huggingface.co/nikimori/MiniCPM5-1B-Base-8bit
- Modelo base upstream: https://huggingface.co/openbmb/MiniCPM5-1B-Base
- Checkpoint MiniCPM5-1B (instruct): https://huggingface.co/openbmb/MiniCPM5-1B
- Receta de vLLM para MiniCPM5-1B: https://recipes.vllm.ai/openbmb/MiniCPM5-1B
- Documentacion de la serie MiniCPM 5.0: https://deepwiki.com/OpenBMB/MiniCPM/2.4-minicpm-5.0-(minicpm5-1b)
- Repositorio de Pretype, aplicacion que usa esta conversion: https://github.com/nikiomori/Pretype
- Repositorio de referencia sobre MiniCPM5-1B: https://github.com/bryanwills/MiniCPM-ai
