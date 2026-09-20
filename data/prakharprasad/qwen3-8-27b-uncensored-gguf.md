# prakharprasad/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una cuantizacion GGUF en formato UD-Q4_K_XL del modelo orcarouter/Qwen3.8-27B-Uncensored-FP8, que a su vez es una version abliterada (alineamiento de rechazo eliminado) construida sobre Qwen/Qwen3.8-27B. El autor de la subida es el usuario prakharprasad. Se trata, por tanto, de una pieza derivada en tercer nivel: base oficial de Qwen, abliteracion direccional por OrcaRouter y cuantizacion selectiva por el autor de este repositorio. El modelo tiene 27.320.697.856 parametros (unos 27,3 mil millones) y se distribuye en un unico fichero de 16,36 GiB.

El problema tecnico que aborda esta build es concreto: en cuantizaciones de 4 bits estandar (Q4_K_M) la compresion de los parametros de decaimiento recurrente del bloque Gated DeltaNet introduce un error RMS de paso de entre el 7,2 % y el 8,0 %, que se acumula de forma recursiva a lo largo del contexto. Para evitarlo, todos los tensores de gating y proyeccion de atencion lineal (ssm_alpha, ssm_beta, ssm_out) se fijan a Q8_0, mientras que el resto de la red mantiene una base Q4_K_M. El resultado son 5,14 bits por peso y 16,36 GiB, lo que permite desplegar el modelo en una GPU de 24 GB.

Es relevante ahora por dos motivos. Primero, porque demuestra una practica de cuantizacion consciente de la arquitectura (SSM-aware), aplicable a modelos hibridos con estado recurrente. Segundo, porque el propio autor restringe explicitamente el uso a investigacion legitima (interpretabilidad, seguridad de IA, red-teaming), dado que la abliteracion hace que el modelo acepte peticiones que el original rechazaria. La ventana de contexto nativa es de 262.144 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration, transformer hibrido con Gated DeltaNet: 64 capas (48 de atencion lineal + 16 de atencion completa, intervalo 4), hidden dim 5120, cabeza MTP de decodificacion especulativa |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | UD-Q4_K_XL: base Q4_K_M con tensores recurrentes (ssm_alpha, ssm_beta, ssm_out) fijados a Q8_0; 5,14 bits por peso |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico Qwen3.8-27B-Uncensored-UD-Q4_K_XL.gguf, 16,36 GiB / 16.752,71 MiB) |
| Modelo base | Qwen/Qwen3.8-27B |
| Modelo fuente (FP8) | orcarouter/Qwen3.8-27B-Uncensored-FP8 |
| Modificacion | Abliteracion direccional (ortogonalizacion de la direccion de rechazo) por OrcaRouter; conversion FP8 a BF16 a GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido con Gated DeltaNet. De las 64 capas, 48 son de atencion lineal con estado recurrente y 16 son de atencion completa, distribuidas con un intervalo de 4. La dimension oculta es 5120. Las capas recurrentes ejecutan una actualizacion de estado de la forma S_t = (I - beta_t * K_t^T) * S_{t-1} + alpha_t * V_t * Q_t^T, lo que implica que cualquier error de cuantizacion en alpha_t, beta_t o los tensores de proyeccion se multiplica recursivamente. Incluye ademas una cabeza MTP (multi-token prediction) que habilita decodificacion especulativa. Sobre los datos de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF o DPO) no se dispone de informacion en la documentacion proporcionada.

La innovacion destacable de esta publicacion es la cuantizacion selectiva consciente del estado recurrente. El autor midio la deriva numerica comparando Q4_K_M estandar frente a la build UD-Q4_K_XL en las capas 0, 10 y 30:

| Tensor | Capa | Tipo nuevo | Tipo antiguo | MAE | RMSE relativo (ruido) | Error pico L-inf | Similitud coseno |
|---|---|---|---|---|---|---|---|
| ssm_alpha.weight | 0 | Q8_0 | Q4_K | 0,001152 | 7,18 % | 0,008857 | 0,9974195 |
| ssm_beta.weight | 0 | Q8_0 | Q4_K | 0,000589 | 7,19 % | 0,003305 | 0,9974129 |
| ssm_out.weight | 0 | Q8_0 | Q4_K | 0,000962 | 7,85 % | 0,090710 | 0,9970752 |
| ssm_alpha.weight | 10 | Q8_0 | Q4_K | 0,001282 | 7,52 % | 0,010036 | 0,9971698 |
| ssm_beta.weight | 10 | Q8_0 | Q4_K | 0,001009 | 7,81 % | 0,007816 | 0,9969530 |
| ssm_out.weight | 10 | Q8_0 | Q4_K | 0,000999 | 7,70 % | 0,066975 | 0,9971787 |
| ssm_alpha.weight | 30 | Q8_0 | Q4_K | 0,000947 | 7,49 % | 0,006875 | 0,9971937 |
| ssm_beta.weight | 30 | Q8_0 | Q4_K | 0,000826 | 7,96 % | 0,007104 | 0,9968291 |
| ssm_out.weight | 30 | Q8_0 | Q4_K | 0,000980 | 7,75 % | 0,037714 | 0,9971673 |

Segun el autor, la fijacion de estas matrices a Q8_0 elimina el ruido recurrente. La conversion se realizo con convert_hf_to_gguf.py y llama-quantize de llama.cpp. La comparacion contra la build UD-Q4_K_XL base de Unsloth aparece anunciada en la model card, pero su tabla esta truncada y no contiene datos en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso (etiquetas reasoning y conversational en el repositorio).
- Function calling y tool calling, segun la etiqueta function-calling declarada por el autor.
- Uso en flujos agente con contexto largo, apoyado en la ventana nativa de 262.144 tokens.
- Decodificacion especulativa mediante la cabeza MTP de la arquitectura.
- Multilingue limitado a ingles y chino.
- Comportamiento abliterado: responde a peticiones que el modelo base rechazaria, lo que lo hace util para red-teaming y evaluacion de robustez.
- No se declaran capacidades de vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Red-teaming y evaluacion de seguridad: el modelo sirve como sujeto de prueba para medir hasta que punto la abliteracion elimina el alineamiento de rechazo, comparando sus respuestas con las del Qwen3.8-27B original en el mismo conjunto de prompts.
- Investigacion en interpretabilidad: con las 48 capas recurrentes accesibles en GGUF y una deriva de cuantizacion documentada, es util para estudiar como el estado recurrente propaga informacion a lo largo del contexto.
- Experimentos controlados de robustez de cuantizacion: la tabla de deriva por capa permite reproducir el efecto de comprimir tensores ssm_* a 4 bits frente a 8 bits y medir el impacto en tareas de contexto largo.
- Asistente de codigo en local: con tool calling declarado y 27,3 mil millones de parametros en 16,36 GiB, puede integrarse en un flujo tipo Continue o similar sobre una GPU de 24 GB sin dependencia de API externa.
- Procesamiento de documentos largos en ingles o chino: los 262.144 tokens de contexto admiten analisis de contratos, informes o repositorios completos en una sola pasada, en los dos idiomas soportados.
- Despliegue en estacion de trabajo de un solo acelerador: al caber en 24 GB, es viable para prototipos de agentes con memoria conversacional persistente sin infraestructura multinodo.
- Generacion de datos sinteticos para entrenamiento: el modo abliterado permite producir pares instruccion-respuesta sobre temas que un modelo alineado filtraria, siempre dentro de un entorno de investigacion controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente aporta metricas de deriva de cuantizacion por tensor (MAE, RMSE relativo, error L-infinito y similitud coseno), recogidas en la seccion de arquitectura. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni tampoco cifras de throughput o latencia.

## Requisitos de hardware

- Pesos en disco y en memoria: 16,36 GiB en un unico fichero GGUF (tamano del repositorio: 17,6 GB).
- VRAM estimada para inferencia: aproximadamente 17-19 GB considerando pesos y sobrecarga del runtime con contexto moderado. Para aprovechar los 262.144 tokens completos hay que anadir la cache KV, cuyo tamano no se especifica en la informacion disponible; en la practica exige cuantizar la cache KV o reducir la ventana.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5090 y A6000 (24 GB o mas) para carga completa en una sola tarjeta. En A100 40/80 GB y H100 cabe con folgade contexto, pero no se aprovecha su ancho de banda con un modelo de este tamano.
- GPU de consumo: si, cabe en tarjetas de 24 GB. En GPU de 16 GB habria que repartir capas entre GPU y CPU, con la penalizacion de velocidad correspondiente.
- Opciones de despliegue: llama.cpp y llama-server de forma nativa por el formato GGUF; Ollama y LM Studio como envoltorios; llama-cpp-python para integracion. vLLM y TGI no aparecen confirmados para este fichero GGUF en la informacion disponible.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| prakharprasad/Qwen3.8-27B-Uncensored-GGUF | 27,32 mil millones | 262.144 | GGUF unico, UD-Q4_K_XL, 5,14 bpw, 16,36 GiB | en, zh | Apache 2.0 | Abliterado; tensores ssm_* en Q8_0 |
| orcarouter/Qwen3.8-27B-Uncensored-FP8 | no disponible | no disponible | FP8 (block-FP8) | no disponible | no disponible | Fuente directa de esta cuantizacion; abliterado |
| Qwen/Qwen3.8-27B | no disponible en la informacion proporcionada (mismo modelo base) | 262.144 (heredado) | BF16, 52.115,19 MiB segun el calculo del autor | no disponible | no disponible en la informacion proporcionada | Modelo original, con alineamiento de rechazo intacto |

No se dispone de datos de rendimiento comparado con alternativas de terceros de la misma categoria (otros modelos de ~27B con contexto largo) en la informacion proporcionada.

## Limitaciones y advertencias

- El alineamiento de rechazo ha sido sustancialmente eliminado. El modelo cumplira peticiones daninas, poco eticas, ofensivas o ilegales que el Qwen3.8-27B original rechazaria.
- El autor restringe el uso a investigacion legitima: interpretabilidad, estudio de seguridad de IA, red-teaming, evaluacion de robustez y experimentos controlados.
- No debe desplegarse de cara al usuario final ni en produccion sin capas propias de seguridad, moderacion y prevencion de abuso.
- La responsabilidad legal y etica del uso recae integramente en quien descarga o utiliza el modelo; el autor declina toda responsabilidad.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad factual ni tasas de alucinacion.
- Cobertura linguistica limitada a ingles y chino; no se declara soporte de castellano ni de otros idiomas.
- El contexto nativo de 262.144 tokens no implica que el modelo mantenga calidad uniforme en todo el rango; no hay evaluaciones de aguja en pajar ni de recuperacion a contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero eso no exime de cumplir la legislacion aplicable ni de asumir la responsabilidad por el contenido generado.
- Deriva de cuantizacion residual: aunque los tensores recurrentes se fijan a Q8_0, el resto de la red permanece en Q4_K_M, por lo que existe una perdida de precision no cuantificada en la model card para el resto de componentes.
- El repositorio tiene 0 descargas y 0 me gusta en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y de reportes independientes de comportamiento.
- La fecha de creacion (20 de septiembre de 2026) y la actualizacion posterior son muy recientes, por lo que puede haber cambios en el repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/prakharprasad/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente FP8 abliterada: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Perfil del autor de la abliteracion: https://huggingface.co/orcarouter
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp

No se han encontrado enlaces adicionales relevantes (papers, blogs, demos o repositorios) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
