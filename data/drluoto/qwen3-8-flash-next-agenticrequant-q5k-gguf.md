# drluoto/Qwen3.8-Flash-Next-AgenticRequant-Q5K-GGUF

## Resumen

`drluoto/Qwen3.8-Flash-Next-AgenticRequant-Q5K-GGUF` es una recuantizacion GGUF del modelo MoE `Qwen/Qwen3.8-Flash-Next`, publicada por el usuario drluoto (proyecto Vitronia). No es un modelo nuevo ni un fine-tune: es un artefacto de pesos cuantizados, generado con llama.cpp e `imatrix`, cuyo objetivo es redistribuir los bits de la cuantizacion alli donde el modelo realmente los lee durante trabajo agentico. El autor parte de la premisa de que los quants convencionales reparten los bits de forma uniforme, algo ineficiente en una arquitectura MoE de 512 expertos con solo 10 activos por token.

La innovacion concreta es doble. Por un lado, se midieron los bytes leidos por token para cada grupo de tensores y se comprobo que el tronco (trunk) consume aproximadamente el 80 % de los bytes movidos por token pese a representar una fraccion pequena del archivo, de modo que se subio de IQ4_XS a Q5_K en el tronco (351 tensores) y de F32 a Q8_0 en el router (48 tensores), dejando los expertos intactos en IQ4_NL / IQ3_S. Por otro, se midio la frecuencia de tokens sobre trazas reales de agente para recortar el vocabulario del cabezal de borrador (draft head) asociado a 65.000 tokens.

El resultado declarado por el autor es un artefacto un 1,4 GB mas pequeno (92,3 GB frente a 93,7 GB), con un 23 % menos de bytes por token, un 13 % mas de velocidad de decodificacion y un 7 % mas de prefill, a cambio de un aumento de perplejidad del 0,91 % (dentro del margen de error). Esta pensado para ejecutarse en una unica maquina Strix Halo (Ryzen AI Max+ 395 con 128 GB de memoria compartida) mediante el backend Vulkan de llama.cpp. Es un artefacto experimental, orientado a un hardware muy concreto, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (modelo base Qwen3.8-Flash-Next); 512 expertos, 10 activos por token segun la model card |
| Parametros totales | 176.943.899.520 (~176,9 B) segun safetensors del modelo base; la model card menciona "125B MoE" (discrepancia no resuelta en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card describe pruebas a 24k y cargas sinteticas a 32k, lo que implica soporte de al menos 32k) |
| Tipos de cuantizacion | Tronco: Q5_K (351 tensores). Router: Q8_0 (48 tensores). Expertos: IQ4_NL / IQ3_S (sin cambios respecto al original). Tabla de n-gramas: IQ4_NL. Punto de partida: UD-IQ4_XS |
| Idiomas soportados | no disponible (el ranking de tokens de entrenamiento del draft head menciona ingles y sueco, ademas de codigo) |
| Licencia | qwen-community-1.0 (campo `license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | GGUF, 3 shards: `trunk-q5k-00001-of-00003.gguf` (0,01 GB), `trunk-q5k-00002-of-00003.gguf` (49,4 GB), `trunk-q5k-00003-of-00003.gguf` (42,9 GB) |
| Tamano del repositorio | 92,3 GB |
| Pipeline | no disponible |
| Etiquetas | gguf, agentic, llama.cpp, qwen4exp, strix-halo, vulkan, quantized, imatrix, conversational |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

El artefacto no implica entrenamiento: es una recuantizacion post-hoc con `imatrix` sobre los pesos ya publicados de `Qwen/Qwen3.8-Flash-Next`. La arquitectura subyacente es un transformer con mezcla de expertos (MoE): 512 expertos en total, de los cuales solo 10 se activan por token, lo que explica que el reparto uniforme de bits sea ineficiente. El autor calcula que el tronco (351 tensores) supone 4,68 GB/token de lectura, mientras que los expertos suponen 1,16 GB/token, y que el tronco representa alrededor del 80 % de los bytes movidos por token a pesar de ser una porcion pequena del archivo. Sobre esa medicion se tomo la decision de subir el tronco a Q5_K y el router a Q8_0, manteniendo los expertos en IQ4_NL / IQ3_S.

El segundo eje de la optimizacion fue la seleccion de vocabulario del cabezal de borrador para decodificacion especulativa (publicado aparte como `drluoto/Qwen3.8-Flash-Next-MTP-GGUF`). El autor construyo un ranking de frecuencia de tokens a partir de diez turnos reales de agente extraidos de la base de datos de su asistente (con peso 5x), mas cargas de codigo, prosa en ingles y sueco, y lo uso para recortar el vocabulario del draft head a 65.000 tokens. La model card tambien documenta una medicion de ancho de banda real en el chip objetivo (208-226 GB/s) y una observacion relevante para cualquiera que recuantice esta arquitectura: los bytes por token cayeron un 23 % pero la velocidad solo subio un 13 %, porque existe un coste fijo por token no ligado al ancho de banda de aproximadamente 15 ms de un paso de 37 ms en el lado de GPU, que la cuantizacion no puede tocar.

## Capacidades

- Generacion de texto y prosa en contexto largo (se evalua con cargas de prosa a 8k).
- Generacion y reescritura de codigo: cargas de codigo nuevo a 8k y 32k, y reescritura de ficheros a 8k y 32k.
- Trabajo agentico con tool calling: las trazas de referencia son turnos reales de agente con historial completo y llamadas a herramientas incluidas.
- Razonamiento aritmetico en contexto largo: la model card menciona una puerta de validacion de aritmetica a 24k de contexto que el modelo supera.
- Capacidades de vision: la model card incluye "vision" entre las puertas de validacion que el modelo pasa, aunque no da detalles ni metricas.
- Decodificacion especulativa mediante cabezal MTP (draft head) con aceptacion muy variable segun la tarea: 1,00 en reescritura de ficheros frente a 0,35 en prosa.
- Ejecucion en una unica maquina consumer/workstation (Strix Halo) mediante llama.cpp con backend Vulkan.
- Capacidades multilingues: no disponibles mas alla de la mencion de ingles y sueco en el corpus de calibracion del draft head.

## Casos de uso

- Agente de codigo en local sobre hardware unico: el modelo esta calibrado especificamente sobre trazas de agente de programacion, y en reescritura de ficheros alcanza 55 tok/s a 8k y 48 tok/s a 32k, lo que lo hace viable para bucles de edicion de codigo asistida sin depender de la nube.
- Reescritura y refactorizacion de ficheros completos: es el escenario donde la decodificacion especulativa rinde al maximo (aceptacion 1,00), porque gran parte de la salida ya esta presente en la entrada; util para aplicar cambios masivos de estilo o API en un repositorio.
- Infraestructura de desarrollo personal o de equipo pequeno sin GPU dedicada: al caber en 128 GB de memoria unificada, permite servir un MoE de ~177 B de parametros en una unica caja de sobremesa, con 518 tok/s de lectura de prompt a 8k y 402 tok/s a 32k.
- Analisis y generacion de texto largo con contexto amplio: las cargas sinteticas a 32k y la validacion aritmetica a 24k indican que el artefacto esta pensado para conversaciones o documentos extensos donde el coste de prefill domina; el prefill medido es de 278 tok/s.
- Automatizacion de tareas multi-paso con herramientas: al ser un artefacto agentico con soporte de llamadas a herramientas en las trazas de referencia, encaja en pipelines donde el modelo decide que herramienta invocar y encadena varios pasos antes de responder.
- Entorno de evaluacion y perfilado de cuantizaciones: el repositorio incluye la metodologia (bytes por token por grupo de tensores, tabla de tensores, verificacion contra ancho de banda medido), por lo que sirve como referencia reproducible para quien quiera replicar el proceso en otro hardware.
- Despliegue con requisitos de privacidad estrictos: al ejecutarse integramente en local via llama.cpp, permite procesar codigo propietario o datos sensibles sin enviarlos a un servicio externo.

## Benchmarks y rendimiento

Calidad medida por el autor con Wikitext-2, 580 fragmentos, `n_ctx=512`, mismo binario y mismas banderas, un modelo a la vez y reloj de GPU fijado:

| Modelo | Tamano | Perplejidad |
|---|---:|---:|
| unsloth UD-IQ4_XS | 93,7 GB | 4,7393 ± 0,0291 |
| AgenticRequant (este) | 92,3 GB | 4,7823 ± 0,0295 |
| Diferencia | −1,4 GB | +0,91 % |

Aislamiento del efecto de la cuantizacion (mismo build, mismas trazas reproducidas, especulacion desactivada en ambos lados):

| Metrica | UD-IQ4_XS original | AgenticRequant | Variacion |
|---|---:|---:|---:|
| Decode (tok/s) | 23,8 | 27,0 | +13 % |
| Prefill (tok/s) | 259 | 278 | +7 % |
| Bytes por token | 5,84 GB | 4,49 GB | −23 % |

Rendimiento de la pila completa (modelo mas cabezal de borrador, rama de motor propia y reloj de GPU fijado, con `--spec-type draft-mtp --spec-draft-n-max 3`, una peticion a la vez, temperatura 0 y sin cache de prompt) sobre Ryzen AI Max+ 395 (Radeon 8060S, 128 GB de memoria compartida) y Vulkan:

| Carga de trabajo | tok/s |
|---|---:|
| Codigo corto, contexto vacio | 58 |
| Codigo nuevo a 8k | 43 |
| Prosa a 8k | 29 |
| Reescritura de fichero a 8k | 55 |
| Codigo nuevo a 32k | 37 |
| Reescritura de fichero a 32k | 48 |

Lectura de prompt: 518 tok/s a 8k y 402 tok/s a 32k. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; la model card advierte explicitamente que la perplejidad mide prosa en ingles y no dice nada sobre llamadas a herramientas, codigo, contextos largos ni otros idiomas.

## Requisitos de hardware

- Memoria necesaria: alrededor de 92,3 GB solo para los pesos en este formato, mas overhead de contexto y cache KV; en la practica exige un sistema con 96-128 GB de memoria unificada o VRAM agregada.
- GPU recomendadas por el autor: APU Ryzen AI Max+ 395 con Radeon 8060S y 128 GB de memoria compartida, mediante Vulkan. No se documentan otras configuraciones.
- No cabe en GPU consumer de VRAM dedicada: una RTX 4090 (24 GB), una RTX 5090 (32 GB) o similares no pueden alojar los pesos; requeriria reparto entre varias GPU o descarga parcial a CPU/RAM.
- Opciones de despliegue: llama.cpp / `llama-server` con backend Vulkan es el camino documentado (apuntar `-m` al shard 1 y el motor localiza el resto). No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Ancho de banda observado en el chip objetivo: 208-226 GB/s.
- Latencia y throughput: 27,0 tok/s de decode y 278 tok/s de prefill para la cuantizacion pura; entre 29 y 58 tok/s de decode en la pila completa segun carga; 518 tok/s de lectura de prompt a 8k. El autor senala un coste fijo de aproximadamente 15 ms por paso de 37 ms en la GPU que la cuantizacion no puede reducir.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Perplejidad (Wikitext-2) | Decode | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AgenticRequant Q5_K (este) | ~177 B totales (safetensors); la card cita "125B MoE" | 92,3 GB | 4,7823 ± 0,0295 | 27,0 tok/s (cuantizacion aislada) | qwen-community-1.0 | GGUF, llama.cpp |
| unsloth UD-IQ4_XS (referencia del autor) | mismo modelo base | 93,7 GB | 4,7393 ± 0,0291 | 23,8 tok/s | no disponible | GGUF |
| Qwen/Qwen3.8-Flash-Next (base, sin cuantizar) | ~177 B totales | no disponible | no disponible | no disponible | qwen-community-1.0 | safetensors |
| drluoto/Qwen3.8-Flash-Next-MTP-GGUF (cabezal de borrador) | no disponible | no disponible | no se mide calidad; es un acelerador | habilita 29-58 tok/s en pila completa | no disponible | GGUF |

No se dispone de datos de benchmarks estandar que permitan comparar este artefacto con otras familias de modelos de tamano similar; la unica comparacion cuantitativa publicada es contra su propio origen UD-IQ4_XS.

## Limitaciones y advertencias

- Artefacto de cuantizacion, no un modelo nuevo: hereda integramente los sesgos, el conocimiento y las limitaciones del modelo base `Qwen/Qwen3.8-Flash-Next`, sobre el que esta ficha no aporta datos adicionales.
- La perplejidad sube un 0,91 % respecto al IQ4_XS de referencia; aunque los intervalos de error se solapan, la model card reconoce que esa metrica solo cubre prosa en ingles.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones publicadas de fidelidad factual, tool calling ni codigo para este artefacto.
- Rendimiento fuertemente dependiente del hardware: las cifras de 29-58 tok/s corresponden a un Ryzen AI Max+ 395 con Vulkan, reloj de GPU fijado y una sola peticion concurrente; en otro hardware o con batching los numeros seran distintos. La decodificacion especulativa aporta entre 2 y 31 tok/s segun la carga, con aceptacion de 0,35 en prosa (casi nula) y 1,00 en reescritura de ficheros.
- Existe un coste fijo por token (~15 ms de un paso de 37 ms) que la cuantizacion no reduce; es un techo que el propio autor advierte que afecta a cualquier recuantizacion de esta arquitectura.
- Longitud de contexto maxima oficial: no disponible. Las pruebas documentadas llegan a 24k y 32k, pero no se declara el limite real ni se miden degradaciones por encima de esas cifras.
- Idiomas soportados: no disponible. Solo consta el uso de ingles, sueco y codigo en el corpus de calibracion; no hay evaluacion multilingue.
- Licencia `qwen-community-1.0` (campo `other`): conviene revisar el texto completo de la licencia del modelo base antes de cualquier uso comercial; esta ficha no puede confirmar los terminos.
- Repositorio sin validacion externa: 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-09-18). Es un artefacto personal, ligado a un stack propietario del autor (rama de motor y cabezal de borrador propias), lo que dificulta reproducir sus cifras sin ese stack.
- Discrepancia sin resolver entre los 176,9 B de parametros del safetensors del modelo base y la mencion a "125B MoE" en la model card; conviene verificar el dato antes de dimensionar infraestructura.
- Los enlaces de busqueda web devueltos no guardan ninguna relacion con este modelo (foros de un servicio de television); no se han podido incorporar fuentes externas de validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drluoto/Qwen3.8-Flash-Next-AgenticRequant-Q5K-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cabezal de borrador (MTP): https://huggingface.co/drluoto/Qwen3.8-Flash-Next-MTP-GGUF
- Repositorio del stack para Strix Halo (motor, mediciones y advertencias): https://github.com/drluoto/flash-next-strix-halo
- Otras fuentes web: no se han encontrado enlaces relevantes en la busqueda disponible.
