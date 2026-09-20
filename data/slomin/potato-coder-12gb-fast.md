# Slomin/Potato-CODER-12GB-Fast

## Resumen

Potato-CODER-12GB-Fast es una cuantizacion GGUF del modelo MoE Millie-1.1-35B-A3B-Ternary, publicada por el usuario Slomin. Se trata de un transformer de tipo mixture-of-experts derivado de Qwen3.6-35B-A3B, con aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token, en el que cerca del 90 % de los pesos se almacenan en un formato ternario de baja precision y el resto en precision superior. El repositorio pesa 8,9 GB e incluye tanto el modelo como un proyector de vision cuantizado a Q8_0.

El objetivo declarado del autor es que el modelo completo (pesos, cache KV de 131.072 tokens y proyector de vision) quepa de forma integra en la VRAM de una tarjeta de 12 GB, sin desbordar a memoria del sistema. Para lograrlo, el autor ha escrito kernels CUDA propios (dequantizacion, MMVQ y un kernel MMQ por tiles) que permiten ejecutar en GPU el tipo tensorial ternario, que el llama.cpp upstream no implementa. Con esa configuracion, el autor reporta unas 161-179 tok/s de decodificacion y 2.199 tok/s de prefill a 60k de contexto en una RTX 3090.

Es relevante ahora porque ataca dos cuellos de botella concretos del despliegue local: el coste de VRAM en modelos MoE grandes y el coste por token en tareas de agente y autocompletado. El propio autor lo posiciona como la variante rapida de su hermano Potato-CODER-12GB, mas orientada a trabajo interactivo y bucles de agente largos que a la resolucion de problemas complejos en repositorios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.6-35B-A3B MoE); ~90 % de los pesos en formato ternario, el resto en mayor precision |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por token (35B-A3B) |
| Longitud de contexto | 131.072 tokens (etiqueta del repo: 114k) |
| Tipos de cuantizacion | Ternaria propia (mayoria de tensores); Q8_0 para el proyector de vision; F16 para 27 tensores `ffn_down`; cache KV en q8_0 / q8_0 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Potato-CODER-12GB-Fast-Ternary.gguf`) + `mmproj-Potato-CODER-12GB-Fast-Q8_0.gguf` |

## Arquitectura y entrenamiento

El modelo es una redistribucion de pesos: los tensores proceden sin modificar de `llmsforall/Millie-1.1-35B-A3B-Ternary.gguf` (sha256 `9758b69f…`), segun el autor con todos los tensores verificados byte a byte como identicos al origen. Lo unico que anade esta publicacion es la reescritura de los metadatos `general.*`, un proyector de vision convertido a Q8_0, una plantilla de chat y una receta de despliegue. La arquitectura de base es la de Qwen3.6-35B-A3B: un transformer con capas de mezcla de expertos, aproximadamente 35B de parametros totales y unos 3B activos por token.

La innovacion tecnica no esta en el entrenamiento, del que la informacion disponible no aporta detalles (numero de tokens, composicion del dataset ni fases de RLHF/DPO), sino en la infraestructura de ejecucion. Los pesos usan un tipo tensorial ternario que llama.cpp upstream no implementa; el runtime oficial (Millie Runtime) no cubre CUDA, por lo que en NVIDIA cae al camino de CPU. El autor aporta kernels CUDA propios de dequantizacion, MMVQ y MMQ por tiles que habilitan la ruta GPU. Ademas, el proyector de vision original de LLMs For All usa un tipo personalizado `Q4_SYM16F` sin kernels de GPU; aqui se convierte a Q8_0, manteniendo 27 tensores `ffn_down` en F16 por cuantizar mal. La plantilla de chat terse es la Sharp template de peculiar-ragdoll (Apache-2.0), modificada solo en las frases que nombran al modelo, y no implica ningun entrenamiento adicional: es unicamente un prompt que fuerza brevedad.

## Capacidades

- Generacion de texto y razonamiento en ingles y chino, con modo de pensamiento configurable mediante `reasoning_effort` y `reasoning-budget` (16.384 tokens en la receta publicada).
- Generacion de codigo, con orientacion explicita a tareas de programacion (etiquetas `potato-coder` y `coding`).
- Capacidades de vision: el proyector Q8_0 residente en GPU permite procesar capturas de pantalla y fotografias; el autor indica que han sido verificadas a profundidad de contexto completa.
- Tool calling / function calling, verificado por el autor en esta configuracion (llamada a herramienta en 1,2 s).
- Uso como agente en bucles multi-paso, con la advertencia del autor de desactivar la penalizacion de presencia (`--presence-penalty 0`) para no penalizar la repeticion intencionada de rutas y llamadas.
- Contexto largo de 131.072 tokens con cache KV cuantizada a q8_0 y una sola ranura, apto para conversaciones multi-turno extensas y ficheros grandes.
- Plantilla de chat terse opcional que reduce la verbosidad inherente del modelo (tendencia a verificar la respuesta varias veces) sin alterar el contenido de la respuesta.

## Casos de uso

- Autocompletado de codigo en el editor: con 170 tok/s de decodificacion y carga en 8,0 s, el modelo puede mantener latencias interactivas en un editor local sin salir de la GPU de 12 GB, lo que evita fugas de codigo a servicios externos.
- Agentes de codigo en bucle largo: el autor recomienda esta variante cuando el tiempo total de una ejecucion de agente importa mas que resolver las ultimas tareas dificiles; el prefill de 2.199 tok/s a 60k reduce el coste de reinyectar contexto en cada paso.
- Analisis de repositorios y pantallas: gracias al proyector de vision y al contexto de 131.072 tokens, se pueden pasar capturas de interfaz o diagramas junto con fragmentos de codigo en una misma ventana.
- Atencion al cliente automatizada multi-turno: el contexto largo con cache KV q8_0 permite mantener conversaciones extensas con historial completo sin reentrenar ni resumir.
- Asistente de terminal y automatizacion de tareas con herramientas: el tool calling verificado permite encadenar llamadas a funciones (lectura de ficheros, ejecucion de comandos) en un bucle de agente local.
- Despliegue en equipos con poca RAM: al no descargar pesos a memoria del sistema, encaja en maquinas con 12 GB de VRAM y RAM modesta, algo que su hermano Potato-CODER-12GB no consigue (26 capas de expertos en RAM).
- Procesamiento de documentos bilingues ingles-chino: la cobertura declarada de ambos idiomas lo hace util para extraccion y resumen de documentacion tecnica en esos dos idiomas.
- Generacion de codigo asistida con coste controlado: al ser Apache-2.0 y ejecutarse en local, es viable en flujos de CI/CD internos donde no se permite enviar codigo a APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos son mediciones de velocidad y tiempos de tarea reportadas por el autor en una RTX 3090, con una ranura y dentro del envelope de 12 GB:

| Metrica | Potato-CODER-12GB-Fast | Potato-CODER-12GB |
|---|---|---|
| Seis tareas fijas, en caliente | 193 s | 463 s |
| Decodificacion | 170 tok/s (rango 161-179) | 53 tok/s |
| Prefill a 60k | 2.199 tok/s | 744 tok/s |
| Carga | 8,0 s | 18 s |
| Contexto | 131.072 | 131.072 |
| Capas de expertos en RAM del sistema | ninguna | 26 (16 GB de RAM) |
| Turno con imagen | 2,2 s | no disponible |
| Llamada a herramienta | 1,2 s | no disponible |

Consumo de VRAM reportado: pico de 11.373 MiB sobre un envelope de 11.836 MiB (12 GB menos 452 MiB de reserva del escritorio y drivers), con 462 MiB de margen. Tamano de ficheros: 7,74 GiB de modelo + 0,57 GiB de proyector de vision.

## Requisitos de hardware

- VRAM: pico medido de 11.373 MiB en el envelope de una tarjeta de 12 GB, con 462 MiB libres. No hay descarga parcial a RAM del sistema para los pesos.
- GPU recomendadas: RTX 3090 (verificada por el autor, con las cifras anteriores). Cualquier GPU NVIDIA de 12 GB o mas con soporte CUDA deberia entrar en el envelope, pero no hay mediciones publicadas para otras tarjetas.
- GPU de consumo: si, cabe en tarjetas consumer de 12 GB (RTX 3090, RTX 3060 12 GB, RTX 4070 12 GB). En tarjetas de 8 GB o 10 GB no cabe en esta configuracion de contexto.
- RAM del sistema: no se usa para los pesos; el autor indica que no descarga capas.
- Opciones de despliegue: `llama-server` (ruta recomendada por el autor mediante `serve-potato.sh`), API compatible con OpenAI en `http://127.0.0.1:8080/v1`. El script arranca con `-c 131072 -ngl 99 -fa on -ctk q8_0 -ctv q8_0 -ub 512 -b 2048 --no-context-shift --mmproj ... --jinja`, con muestreo `temp 1.0`, `top-p 0.95`, `top-k 20`, `min-p 0.0`, `presence-penalty 0.0`, `repeat-penalty 1.0` y `reasoning-budget 16384`.
- Requisito critico: se necesita un runtime capaz de servir el tipo ternario. llama.cpp upstream no lo implementa, y el Millie Runtime oficial no cubre CUDA. Los kernels CUDA del autor no estan publicados como binario; hay que solicitarlos en la pestana de comunidad. Sin ellos, el modelo cae al camino de CPU.
- Latencia y throughput: 161-179 tok/s de decodificacion, 2.199 tok/s de prefill a 60k, carga 8,0 s, turno con imagen 2,2 s, llamada a herramienta 1,2 s (RTX 3090).
- Otros backends: no hay soporte declarado para vLLM, TGI ni Ollama. Dado que el tipo tensorial ternario no existe en llama.cpp upstream, la integracion con esas herramientas no esta disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Velocidad declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Potato-CODER-12GB-Fast | 35B totales / ~3B activos; ~90 % ternario | 131.072 | 170 tok/s decode, 2.199 tok/s prefill (RTX 3090) | Apache-2.0 | GGUF; requiere kernels CUDA no publicados |
| Potato-CODER-12GB (hermano) | 35B totales / ~3B activos; ternario | 131.072 | 53 tok/s decode, 744 tok/s prefill | Apache-2.0 | GGUF; 26 capas de expertos en RAM |
| llmsforall/Millie-1.1-35B-A3B-Ternary (origen) | 35B totales / ~3B activos; ternario | no disponible | no disponible | no disponible | Millie Runtime; sin kernels CUDA |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales / ~3B activos | no disponible | no disponible | no disponible | no disponible |

No hay datos de rendimiento en tareas (benchmarks) para ninguno de los modelos comparados en la informacion disponible, por lo que la comparativa se limita a tamano, contexto, velocidad medida y licencia. La diferencia funcional declarada por el autor entre las dos variantes Potato es cualitativa: la variante Fast es mas rapida y no usa RAM del sistema, mientras que la variante no-Fast se describe como mas fuerte en trabajo multi-paso sobre repositorios.

## Limitaciones y advertencias

- Dependencia de kernels no publicados: sin los kernels CUDA del autor (dequantizacion, MMVQ, MMQ), el modelo se ejecuta en CPU. Esto es un bloqueo de produccion importante, ya que el binario no esta disponible como release.
- Licencia: Apache-2.0 para esta publicacion, pero la informacion disponible no detalla la licencia de los pesos de origen `llmsforall/Millie-1.1-35B-A3B-Ternary` ni de Qwen3.6-35B-A3B. Conviene verificar la cadena de licencias antes de uso comercial.
- Idiomas: solo ingles y chino declarados. No hay soporte declarado de castellano ni de otros idiomas, y no se ha publicado evaluacion multilingue.
- Sin benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede verificar la calidad frente a alternativas. Las unicas cifras son de velocidad y tiempos de tarea.
- Rendimiento autodeclarado: todas las mediciones proceden del autor del modelo, en una unica GPU (RTX 3090) y no han sido reproducidas de forma independiente.
- Riesgo de alucinacion: no evaluado en la informacion disponible. El autor senala que el modelo es verboso por defecto y tiende a re-verificar su respuesta, lo que puede aumentar el consumo de tokens aunque no corrige necesariamente errores.
- Sesgos: no hay informacion disponible sobre sesgos evaluados.
- Discrepancia de contexto: la etiqueta del repositorio menciona 114k mientras que la model card y la receta usan 131.072 tokens. Conviene tratar 131.072 como valor de la receta publicada y verificar el limite real.
- Una sola ranura: la configuracion recomendada usa `--no-context-shift` con una unica ranura, lo que limita el despliegue multiusuario concurrente con contexto completo.
- Rendimiento en tareas de agente: el propio autor indica que esta variante es mas debil que su hermano en trabajo multi-paso sobre repositorios; elegirla por velocidad puede costar tareas resueltas.
- Ajuste de parametros delicado: `presence-penalty` debe fijarse a 0 para uso de agente, contra el 1.5 recomendado aguas arriba; usar el valor por defecto degrada el rendimiento en bucles de agente.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Proyector de vision convertido por el autor: la conversion a Q8_0 es propia y no ha sido validada externamente; 27 tensores `ffn_down` permanecen en F16 por cuantizar mal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Slomin/Potato-CODER-12GB-Fast
- Variante no-Fast: https://huggingface.co/Slomin/Potato-CODER-12GB
- Pesos de origen (LLMs For All): https://huggingface.co/llmsforall/Millie-1.1-35B-A3B-Ternary
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Millie Runtime: https://github.com/llmsforall/millie-runtime
- Plantillas Sharp de chat: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Busqueda web: no se encontro ningun resultado relacionado con este modelo; las consultas devolvieron unicamente articulos sobre derechos de paso y servidumbres en el Reino Unido, sin relacion con el contenido de esta ficha.
