# blazkepa/Qwen3.8-Flash-Next-Brisk-Coder-oQ4e-MTP

## Resumen

Qwen3.8-Flash-Next Brisk-Coder (oQ4e, MTP) es una variante podada del modelo Qwen3.8-Flash-Next publicada por el usuario blazkepa en Hugging Face. Se construye a partir de su propia version Brisk (ya editada contra bucles de "Wait, let me reconsider…", con una LoRA que detiene el razonamiento cuando la respuesta ya funciona y con la cabeza MTP completa) y le aplica la mascara de expertos RCO Coder publicada por ISTA-DASLab, que selecciona 256 de los 512 expertos enrutados por capa orientados a codigo, uso agentico y vision. El resultado es un modelo MoE de aproximadamente 119.570 millones de parametros totales, cuantizado en 4 bits para MLX, con 48 capas y enrutamiento top-10 intacto.

La propuesta de valor es clara: reducir a la mitad la memoria ocupada por los expertos enrutados (de unos 86 GB a unos 44 GB con la tabla n-gram en SSD, o 79 GB con todo residente en RAM) manteniendo la velocidad de Brisk, gracias tambien a la decodificacion especulativa mediante la cabeza MTP (acceptance rate del 91 % en contexto corto y 86 % a 19k tokens). Esta pensado para ejecutarse en Apple Silicon con oMLX, y el autor lo prueba en un MacBook Pro con M5 Max y 128 GB.

Es, sin embargo, un modelo especializado: el propio autor advierte que fuera de codigo es claramente peor que Brisk (MMLU en ingles cae de 89 % a 77 %) y que el chat en polaco esta roto. Su interes actual reside en mostrar hasta que punto la poda de expertos guiada por dominio permite llevar un MoE de gran tamano a hardware de consumo sin re-cuantizar pesos, y en servir como banco de pruebas para tecnicas de decodificacion especulativa en MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion, Gated DeltaNet, experto compartido y cabeza MTP (familia Qwen4-Exp) |
| Parametros totales | 119.570.546.579 |
| Parametros activos | no disponible (enrutamiento top-10 sobre 256 expertos por capa tras la poda) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (oQ4e) para MLX; pesos no re-cuantizados respecto a Brisk |
| Idiomas soportados | en (unicamente declarado) |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` para la cabeza MTP y `expert_mask.json` con la lista de expertos conservados |

## Arquitectura y entrenamiento

El modelo es un MoE de 48 capas con 512 expertos enrutados por capa en su version original, de los cuales se conservan 256 tras aplicar la mascara de ISTA-DASLab. La poda elimina tambien las filas correspondientes del router, manteniendo el enrutamiento top-10 sin cambios; los expertos restantes son byte-identicos a los de Brisk y no se re-cuantizan. Atencion, Gated DeltaNet, experto compartido, tabla n-gram y torre de vision permanecen intactos respecto al modelo base. La cabeza MTP se conserva completa, con sus propios 512 expertos (1,7 GB) y `mtp_num_experts: 512` en `config.json`.

Sobre el entrenamiento original de Qwen3.8-Flash-Next no se proporciona informacion en la documentacion disponible (numero de tokens, composicion del dataset, RLHF/DPO). Lo que si se documenta es el post-entrenamiento aplicado por el autor: una edicion de pesos contra los bucles de reconsideracion, una LoRA que corta el modo thinking cuando la respuesta ya es valida y la incorporacion de la cabeza MTP para decodificacion especulativa. La mascara de expertos proviene del trabajo de ISTA-DASLab (RCO Coder), que selecciono los expertos orientados a codigo, agentes y vision. El autor verifico que los 12.288 indices de la mascara coinciden con el fichero de asignacion de ISTA.

## Capacidades

- Generacion de codigo: especialidad principal del modelo, con buen rendimiento en tareas de LiveCodeBench (pass@1 de 77 sobre un subconjunto fijo de 100 tareas).
- Razonamiento en modo thinking: soporta modo de razonamiento extendido (`xhigh`) con presupuesto de tokens configurable.
- Razonamiento agentico y multi-paso: la mascara RCO fue seleccionada precisamente para uso agentico, ademas de codigo y vision.
- Vision: la torre de vision se mantiene byte-identica a Brisk, aunque no se documentan evaluaciones especificas.
- Decodificacion especulativa: cabeza MTP completa con acceptance rate del 91 % en contexto corto y 86 % a 19k tokens.
- Generacion de texto y conversacion: pipeline declarado como text-generation y conversacional.
- Tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Capacidades multilingues: muy limitadas; solo se declara ingles y el chat en polaco esta roto segun el autor.

## Casos de uso

- Asistencia de programacion en local sobre Apple Silicon: el modelo cabe en un Mac de 128 GB con todo residente en oMLX (74 GiB reportados) y ofrece 116 tok/s en contexto corto, lo que permite usarlo como copiloto interactivo sin conexion a la nube.
- Generacion y revision de codigo en pipelines de CI: con 88 tok/s a 19k tokens de contexto, puede procesar diffs y ficheros completos en tareas de revision automatizada o generacion de tests dentro de un runner macOS.
- Razonamiento agentico sobre repositorios: la mascara de expertos esta orientada a uso agentico, de modo que el modelo puede encadenar pasos de lectura, edicion y verificacion sobre un arbol de codigo con contexto largo.
- Evaluacion de tecnicas de poda de expertos: sirve como referencia reproducible para investigadores que quieran medir el impacto de eliminar el 50 % de expertos enrutados en un MoE de 119B, con la mascara publicada y los pesos sin re-cuantizar.
- Investigacion en decodificacion especulativa: la cabeza MTP intacta y los datos de acceptance rate lo convierten en un banco de pruebas para estudiar el equilibrio entre velocidad y calidad en MLX.
- Prototipado de asistentes de codigo especializados: al degradar deliberadamente capacidades fuera de dominio, es util para validar si un flujo de trabajo concreto depende solo de codigo y razonamiento tecnico.
- Despliegue en entornos con RAM limitada: con la tabla n-gram en SSD ocupa unos 44 GB, lo que abre la puerta a Macs de 64 GB con una peticion concurrente (no verificado por el autor).

## Benchmarks y rendimiento

Evaluacion sobre un subconjunto fijo de 100 tareas de LiveCodeBench release_v6 (23 faciles / 31 medias / 46 dificiles), en modo thinking `xhigh`, temperatura 0,6 / top_p 0,95 / top_k 20, 32.768 tokens, oMLX 0.8.0, una ejecucion por modelo. El propio autor advierte que estas cifras no son comparables con las de ISTA y que solo importan las diferencias entre filas.

| Modelo | pass@1 | facil / medio / dificil | limite de tokens | tokens totales |
|---|---|---|---|---|
| base + mascara ISTA | 68 | 23 / 29 / 16 | 29 | 1,66 M |
| norev + mascara ISTA | 74 | 23 / 29 / 22 | 23 | 1,46 M |
| **este modelo** (Brisk + mascara ISTA) | **77** | 23 / 28 / 26 | **19** | **1,31 M** |
| base, 512 expertos | 63 | 23 / 25 / 15 | 33 | 1,71 M |
| norev, 512 expertos | 69 | 23 / 28 / 18 | 28 | 1,47 M |
| Brisk, 512 expertos (dos ejecuciones) | 75 / 78 | 22–23 / 28–29 / 25–26 | 20 / 17 | 1,32 / 1,30 M |

Comparacion pareada contra base + mascara ISTA: +10 / −1 tareas (sign test p = 0,012), con las diez mejoras en tareas dificiles y un 34 % menos de tokens en las 67 tareas que ambos resuelven. Frente a Brisk con todos los expertos: +5 / −3 y +4 / −5, sin diferencia apreciable. Sin thinking y con decodificacion greedy, medido sobre norev + mascara ISTA (no sobre este modelo): 53 de 100.

Velocidad en un MacBook Pro M5 Max de 128 GB, un solo stream, MTP activo y en caliente: 116 tok/s en contexto corto y 88 tok/s a 19k tokens (Brisk: 112 / 88); sin MTP, 70 / 62 tok/s. MMLU en ingles cae de 89 % a 77 % respecto a Brisk.

## Requisitos de hardware

- VRAM/RAM estimada: unos 79 GB con todo residente en RAM (oMLX reporta 74 GiB); unos 44 GB si la tabla n-gram se deja en SSD (estimacion externa a oMLX, no medida en esa herramienta).
- Equipo probado: MacBook Pro con M5 Max de 128 GB y macOS 26, con oMLX 0.8.0.
- Viabilidad en 64 GB: el autor indica que oMLX deberia mover la tabla n-gram a SSD y que podria caber con una peticion a la vez, pero no lo ha probado ni conoce la velocidad en ese modo.
- GPU CUDA: no documentado; el modelo esta empaquetado para MLX y no se mencionan pesos GGUF ni compatibilidad con A100/H100/RTX 4090.
- Opciones de despliegue: oMLX 0.8.0 (unico entorno probado). Versiones anteriores y otros cargadores pueden no reconocer `mtp_num_experts`.
- Latencia y throughput: 116 tok/s en contexto corto y 88 tok/s a 19k tokens con MTP; 70 y 62 tok/s sin MTP; acceptance rate del borrador del 91 % y 86 % respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos | Contexto | LiveCodeBench (pass@1, harness del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Brisk-Coder oQ4e MTP) | 119,57 B | 256 de 512 por capa | no disponible | 77 | qwen-community-1.0 | MLX, Apple Silicon |
| Brisk (oQ4e MTP, todos los expertos) | 119,57 B (aprox.) | 512 por capa | no disponible | 75 / 78 | qwen-community-1.0 | MLX, Apple Silicon |
| Base + mascara ISTA | no disponible | 256 de 512 por capa | no disponible | 68 | qwen-community-1.0 | MLX |
| norev + mascara ISTA | no disponible | 256 de 512 por capa | no disponible | 74 | qwen-community-1.0 | MLX |

No se dispone de datos para comparar con otros modelos de la misma categoria fuera de la familia Brisk/norev/base del propio autor.

## Limitaciones y advertencias

- Fuera de codigo el modelo es claramente peor que Brisk: MMLU en ingles cae de 89 % a 77 %.
- El chat en polaco esta roto; es probable que otros idiomas esten afectados, pero el autor no los probo. Solo se declara ingles.
- La poda de expertos puede degradar tareas no cubiertas por la mascara RCO (codigo, agentes y vision); no hay evaluaciones de vision publicadas.
- Riesgo de alucinacion no cuantificado; el autor documenta un fallo concreto en una tarea media donde el modelo razono menos de 500 tokens y escribio logica incorrecta.
- Las cifras de LiveCodeBench provienen de un subconjunto propio de 100 tareas con posible contaminacion (tareas anteriores al modelo) y no son comparables con las de ISTA-DASLab.
- La ganancia de la LoRA sobre norev + mascara (+5 / −2, p = 0,45) esta dentro del ruido estadistico.
- Solo probado en oMLX 0.8.0 sobre un Mac de 128 GB; el modo con tabla n-gram en SSD (44 GB) es una estimacion no medida.
- La licencia qwen-community-1.0 impone condiciones adicionales al uso comercial; conviene revisar el texto completo antes de desplegar en produccion.
- El modelo esta pensado para usarse con thinking activado; `generation_config.json` conserva los valores de Qwen (temperatura 1,0) que el autor no probo en esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blazkepa/Qwen3.8-Flash-Next-Brisk-Coder-oQ4e-MTP
- Modelo base (Brisk oQ4e MTP): https://huggingface.co/blazkepa/Qwen3.8-Flash-Next-Brisk-oQ4e-MTP
- Mascara de expertos RCO Coder de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- oMLX (repositorio): https://github.com/jundot/omlx
- Paper de referencia (arXiv 2605.00649): https://arxiv.org/abs/2605.00649
