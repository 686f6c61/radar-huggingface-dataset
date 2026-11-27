# logic65/whittle-next

## Resumen

Whittle-next es un artefacto de investigación publicado por el desarrollador independiente logic65 en Hugging Face. Se trata de un modelo de lenguaje de arquitectura experimental derivada de Qwen (etiquetada internamente como `qwen4_exp`), construido mediante cirugía de pesos sobre el modelo base `logic65/Qwen3.8-Whittle-tri-14.7B`, que a su vez procede de un Qwen3.8-27B comprimido en profundidad de 64 a 32 capas mediante fusión por composición paralela, sin recortar el ancho de las FFN. Posteriormente fue reparado mediante SFT para recuperar capacidad conversacional.

El modelo cuenta con 16.359.687.904 parámetros según los pesos en safetensors del repositorio, aunque la model card declara 19.775B, una discrepancia que el autor no explica (probablemente porque parte de los componentes, como la memoria n-gram de aproximadamente 4B parámetros, se almacena en ficheros separados y no en los safetensors principales). La arquitectura combina mezcla de expertos (MoE) con 240 expertos, atención completa intercalada con atención lineal GDN en proporción 3:1, cuatro flujos residuales de hiper-conexiones y una memoria n-gram por capa sobre una tabla de 6,25 millones de filas por 640 dimensiones.

Su relevancia es puramente arquitectónica y de investigación: el propio autor lo describe como un demostrador de arquitectura, no como un asistente. Sostiene una conversación, sigue la plantilla de chat, escribe código delimitado y se detiene limpiamente, pero su conocimiento factual es escaso y su aritmética es aproximada. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion lineal GDN y atencion completa en proporcion 3:1, hiper-conexiones y memoria n-gram por capa |
| Parametros totales | 16.359.687.904 (safetensors); la model card declara 19.775B |
| Parametros activos | aproximadamente 11B segun la nomenclatura del modelo (A11B); k=104 expertos activos de 240 |
| Longitud de contexto | 8192 tokens (valor usado en la configuracion de servicio recomendada) |
| Tipos de cuantizacion | Q4_K_M y f16 (builds publicados en GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (8 shards con indice), GGUF, ademas de checkpoints `.pt` auxiliares |

## Arquitectura y entrenamiento

El modelo tiene 32 capas de 5120 dimensiones, con una relacion de 3 capas de atencion lineal GDN (derivada de Qwen3.5) por cada capa de atencion completa. Incorpora 240 expertos en configuracion MoE con k=104 expertos activos en la version recomendada, de los cuales 58 estan entrenados. Sobre el transformer se anaden cuatro flujos residuales de hiper-conexiones y una memoria n-gram por capa implementada como tabla de 6,25 millones de filas por 640 dimensiones, de aproximadamente 4B parametros y con posibilidad de descarga a memoria host (host-offloadable). Los GGUFs declaran `output_gate_type: silu`, ya que los pesos GDN heredados de Qwen3.5 requieren una puerta de salida SiLU en lugar de la sigmoide que usa un modelo Flash-Next.

El entrenamiento parte de un proceso de cirugia de pesos sobre Whittle-tri-14.7B (compresion de profundidad 64 a 32 capas por fusion de composicion paralela) seguido de una fase de SFT para reparar la generacion. Se distinguen varias fases documentadas en los directorios `next-v2/` y `next-v3/` con sus logs de entrenamiento, y checkpoints de recuperacion en `recovery/phaseA_step1250/` y `recovery/phaseC_step100/`. La variante `router104` entrena conjuntamente los routers con las puertas de expertos compartidos, las hiper-conexiones y las proyecciones n-gram en el mismo k que se sirve, lo que mejora la entropia cruzada en held-out de 4,1466 a 3,9745 y la bateria de hechos de 4/5 a 5/5, pero empeora el comportamiento en servicio por sobre-razonamiento y repeticion. El autor lo documenta explicitamente como una leccion sobre el objetivo de entrenamiento, no como una mejora de servicio.

## Capacidades

- Generacion de texto conversacional de un solo turno: toma el turno, responde y se detiene con `finish_reason=stop`.
- Seguimiento de la plantilla de chat mediante `chat_template.jinja` y modo `--jinja` en llama.cpp.
- Generacion de codigo delimitado en bloques fenced, incluyendo una pagina HTML valida completa en pruebas verificadas.
- Modo de razonamiento (thinking) activable, aunque degrada la tasa de paradas limpias (4/6 frente a 5/6 con thinking desactivado).
- Memoria n-gram por capa para recuperacion de patrones locales.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; solo se han probado sondas de un unico turno.
- Capacidades multilingues: no disponibles; no se documenta cobertura de idiomas.
- Vision y audio: no disponibles.

## Casos de uso

- Demostracion de arquitectura MoE con hiper-conexiones: el modelo sirve para estudiar en la practica como se comporta una mezcla de 240 expertos con k=104 junto con cuatro flujos residuales, comparando builds con y sin memoria n-gram en una misma familia de pesos.
- Investigacion sobre compresion de profundidad: permite evaluar el impacto de reducir 64 capas a 32 por fusion de composicion paralela manteniendo el ancho de las FFN, usando las sondas y logs publicados como referencia reproducible.
- Experimentos de memoria n-gram externa: la tabla de 4B parametros con offload a host es un banco de pruebas para medir el efecto de memoria n-gram por capa en calidad de generacion y repeticion.
- Estudio de objetivos de entrenamiento para routers: la comparativa entre el build SFT y el `router104` documenta como optimizar entropia cruzada y baterias cortas puede degradar la generacion de parrafos largos, util para disenar funciones de perdida en MoE.
- Pruebas de despliegue en llama.cpp con arquitecturas no estandar: requiere una compilacion de llama.cpp con soporte `qwen4exp`, por lo que sirve para validar toolchains de inferencia experimentales.
- Analisis de modos de fallo en modelos pequenos con conocimiento danado: las sondas publicadas (error en aritmetica simple, respuestas que confunden formato y contenido) son un caso de estudio util para evaluacion de robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas propias de comportamiento y de entrenamiento:

| Metrica | Build SFT (recomendado) | Build router104 |
|---|---|---|
| Paradas limpias, thinking off | 5/6 | 4/6 |
| Paradas limpias, thinking on | 4/6 | 2/6 |
| Respuestas en bucle, thinking off | 1/6 | 2/6 |
| Entropia cruzada en held-out | no disponible para este build | 3,9745 (frente a 4,1466 previo) |
| Bateria de hechos | no disponible para este build | 5/5 (frente a 4/5 previo) |
| Repeticion de 4-gramas en entrenamiento | no disponible | 0,093 (frente a 0,057 previo) |

Sondas verificadas de un solo turno con el build recomendado, k=104 y el sampler de servicio: respuesta correcta a "Paris", pagina HTML valida delimitada, parrafo coherente sin repeticion. Fallos verificados: explicacion incorrecta del color del cielo ("la luz del sol atraviesa las nubes"), 17+25 = 32, y respuesta "1, 2, 3, 4 y 5 son frutas" al pedir exactamente 5 frutas.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M recomendado ocupa 12,29 GiB, por lo que cabe en GPUs de 16 GB con contexto moderado; el build f16 requiere bastante mas y no es practico en consumer.
- Repositorio completo: 160,3 GB, incluyendo safetensors, multiples GGUFs y checkpoints de entrenamiento.
- GPU empleadas por el autor en las mediciones: 3x RTX 3060 (12 GB cada una) sobre un nodo ai-2, con `-ngl 99`.
- Cabe en GPU consumer: si, en RTX 3060 de 12 GB con cuantizacion Q4_K_M y contexto limitado, y con holgura en RTX 4070 Ti, 4080 o 4090.
- Despliegue: llama.cpp con soporte `qwen4exp` (obligatorio, no hay soporte en versiones estandar), mediante `llama-server` con `-ngl 99 -c 8192 --jinja` y `--override-kv qwen4exp.expert_used_count=int`. Soporte en vLLM, TGI u Ollama: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| whittle-next (este) | 16,36B en safetensors; 19,775B declarados | 8192 | Apache-2.0 | preview de investigacion |
| logic65/Qwen3.8-Whittle-tri-14.7B | 14,7B | no disponible | Apache-2.0 | modelo base |
| logic65/Whittle-Next-27B-A3B | 27B totales, 3B activos | no disponible | no disponible | continuacion de la linea |
| logic65/Whittle-Qwen-3.8-35B-A3B | 35B totales, 3B activos | no disponible | no disponible | modelo actual de la linea |

No se dispone de comparativas con modelos de proposito general de tamano similar (por ejemplo, Qwen3 o Llama de 14-30B) en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor lo califica de demostrador de arquitectura, no de asistente. El conocimiento factual es escaso y la aritmetica es aproximada.
- Alucinacion y errores factuales verificados: explicaciones fisicas incorrectas y errores en sumas de dos cifras.
- Confusion entre formato y contenido: responde con secuencias numericas cuando se le pide una lista de elementos concretos.
- Repeticion y bucles: 1 de cada 6 sondas entra en bucle con el sampler recomendado en el build por defecto; el build `router104` empeora este comportamiento.
- El modo thinking degrada la tasa de paradas limpias y, en `router104`, agota el presupuesto de tokens por sobre-razonamiento.
- Retencion de contexto multi-turno no medida: todas las pruebas son de un solo turno y el autor no reclama nada al respecto.
- Idiomas soportados no documentados; no hay garantia de calidad fuera del ingles de las pruebas.
- Dependencia de un fork de llama.cpp con soporte `qwen4exp`; no funciona en toolchains estandar sin ese soporte.
- Discrepancia entre el recuento de parametros de los safetensors (16,36B) y el declarado en la model card (19,775B), sin aclaracion del autor.
- Dos builds SFT distintos en el repositorio (`sft` y `SFT`, con tamanos ligeramente diferentes) sin documentar la diferencia.
- Licencia Apache-2.0 permite uso comercial, pero el estado de investigacion y la calidad del modelo desaconsejan cualquier despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/logic65/whittle-next
- Modelo base: https://huggingface.co/logic65/Qwen3.8-Whittle-tri-14.7B
- Continuacion de la linea (27B-A3B): https://huggingface.co/logic65/Whittle-Next-27B-A3B
- Modelo actual de la linea (35B-A3B): https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B
- Variante chat del linaje 19.8B-A11B: https://huggingface.co/logic65/Qwen3.8-Whittle-Next-19.8B-A11B-chat
- Apoyo al autor: https://ko-fi.com/davida81328
