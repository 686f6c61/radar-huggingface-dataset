# mazuj2/Qwen3.8-27b-merged-qwopus-thinkingcap-swift1.5

## Resumen

Qwen3.8-27b-merged-qwopus-thinkingcap-swift1.5 es un modelo de lenguaje de 27.780 millones de parametros obtenido mediante la fusion de tres ajustes finos sobre Qwen/Qwen3.8-27B. Lo publica el usuario mazuj2 en Hugging Face y emplea la tecnica DARE-TIES de mergekit, con el modelo base Qwen3.8-27B como ancla neutra. El objetivo declarado es combinar las fortalezas de tres variantes complementarias (codigo y razonamiento estructural, estabilidad de ejecucion y poda del razonamiento circular) en un unico checkpoint sin perder la cabeza nativa de decodificacion especulativa Multi-Token Prediction (MTP).

El problema que aborda es concreto: las variantes estandar de Qwen3.8-27B tienden a entrar en bucles de `<think>`, a sufrir deriva de coordenadas o logica a mitad de generacion y a dejar codigo multi-sistema incompleto en prompts complejos de una sola pasada. Ademas, las fusiones ingenuas descartan la cabeza MTP, lo que elimina la aceleracion por decodificacion especulativa. Este merge preserva los 15 tensores `mtp.*` / `blk.64.nextn.*` y los registra en el indice de safetensors.

El resultado es un modelo orientado a generacion de codigo, razonamiento con modo thinking y construccion de aplicaciones y juegos en un solo archivo, con licencia Apache 2.0, pesos en safetensors y bfloat16, y un pipeline declarado de image-text-to-text (aunque el modelo base Qwen3.8-27B es fundamentalmente de texto; la informacion disponible no detalla capacidades de vision reales).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B), con cabeza MTP para decodificacion especulativa |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponibles por terceros (IQ3_S hasta BF16); el repo principal en safetensors bfloat16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16), con `model-mtp-head.safetensors` adicional |

## Arquitectura y entrenamiento

El modelo es una fusion DARE-TIES (`dare_ties`) construida con mergekit sobre Qwen/Qwen3.8-27B como base. Los tres modelos fusionados y sus pesos son: Jackrong/Qwopus3.8-27B-Coder-Flash (densidad 0,75, peso 0,60), ukisai/Swift-1.5-Qwen3.8-27b (densidad 0,45, peso 0,25) y bottlecapai/ThinkingCap-Qwen3.8-27B (densidad 0,35, peso 0,15). La configuracion usa `normalize: true`, `int8_mask: true` y `dtype: bfloat16`.

Qwopus aporta el nucleo de codigo y diseno espacial, con planificacion arquitectonica y estetica de interfaz; Swift-1.5 actua como estabilizador de ejecucion para evitar bucles de autocorreccion y deriva de logica; ThinkingCap opera como regularizador ligero que poda la verbosidad del chain-of-thought sin truncar la planificacion compleja. Tras la fusion se inyecto la plantilla ChatML + `<think>` de Qwen en `tokenizer_config.json` y se trasplantaron los 15 tensores `mtp.*` extraidos de Qwen/Qwen3.8-27B a `model-mtp-head.safetensors`, registrandolos en `model.safetensors.index.json`. No se detallan volumen de tokens de entrenamiento ni composicion del dataset, ya que se trata de una fusion de pesos, no de un entrenamiento desde cero.

## Capacidades

- Generacion de codigo en una sola pasada para aplicaciones y juegos complejos (el autor cita Choplifter con fisicas de helicotero, barracones destructibles y maquinas de estado de rescate, Space Invaders y utilidades multi-herramienta).
- Razonamiento con modo thinking estructurado, con un consumo de tokens `<think>` entre un 20 % y un 30 % superior al de ajustes finos muy podados, orientado a planificacion top-down.
- Generacion de interfaces HTML/CSS/JS con acabado visual limpio y proporcionado sin necesidad de instrucciones explicitas de estilo.
- Razonamiento espacial y matematicas 2D para fisicas de juego.
- Decodificacion especulativa nativa mediante la cabeza MTP, sin modelo borrador separado.
- Soporte de plantilla de chat ChatML con etiquetas `<think>`.
- Capacidades multilingues: solo ingles declarado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible de forma explicita; el modo thinking y la planificacion estructurada son compatibles con flujos agenticos, pero no se documenta integracion con frameworks.
- Vision: el pipeline figura como image-text-to-text, pero la informacion disponible no detalla modulos de vision ni su funcionamiento.

## Casos de uso

- Generacion de videojuegos en un solo archivo: el modelo completa clones de arcade con fisicas, colisiones y maquinas de estado en una sola pasada, lo que encaja en prototipado rapido y game jams donde se necesita codigo funcional sin iteraciones largas.
- Construccion de dashboards y utilidades web: genera HTML, CSS y JavaScript con diseno cuidado de forma nativa, adecuado para herramientas internas, paneles de administracion y demos de producto.
- Asistente de programacion con razonamiento profundo: el modo `<think>` estructurado permite abordar tareas de refactorizacion o diseno de arquitectura donde se requiere planificacion previa y no solo autocompletado.
- Generacion de codigo en produccion con latencia controlada: gracias a la cabeza MTP preservada, alcanza 40-60 tokens/s en generacion de codigo y HTML en llama.cpp con cuantizacion Q8_0, lo que lo hace viable en pipelines de integracion continua y asistentes interactivos.
- Educacion y explicacion de codigo: su planificacion paso a paso y su menor tendencia a bucles de autocorreccion lo hacen util para tutoriales y documentacion tecnica generada.
- Prototipado de interfaces de usuario: la generacion de UI limpia sin prompt engineering adicional reduce el tiempo de maquetacion en equipos de front-end.
- Tareas de razonamiento espacial y simulacion: la combinacion de fisicas 2D y logica de estado sirve para simuladores sencillos y visualizaciones interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor aporta metricas de rendimiento en inferencia:

| Metrica | Valor |
|---|---|
| Throughput en generacion de codigo/HTML (llama.cpp, Q8_0 imatrix, MTP nativo) | 40-60 tokens/s |
| Throughput en texto general (llama.cpp, Q8_0 imatrix, MTP nativo) | 25-40 tokens/s |
| Perplejidad (BF16 calibracion, Q8_0 imatrix) | 3,4195 ± 0,02407 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55,6 GB de pesos, por lo que requiere al menos 64 GB de VRAM (A100 80 GB, H100 80 GB, o dos RTX 4090 de 24 GB).
- Cuantizaciones GGUF de terceros (IQ3_S hasta BF16) permiten reducir el requisito; un IQ3_S rondaria los 12-14 GB y cabria en una RTX 4090 o RTX 3090 de 24 GB, aunque la informacion disponible no detalla cifras exactas por cuantizacion.
- GPU recomendadas: A100 80 GB, H100 80 GB para BF16; RTX 4090, RTX 3090 y RTX 4080 para cuantizaciones GGUF bajas.
- Opciones de despliegue: transformers (con `device_map="auto"`), llama.cpp (soporte MTP nativo), y quants GGUF publicados por RiderJones. vLLM, TGI y Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: 40-60 tokens/s en codigo y 25-40 tokens/s en texto general con Q8_0 imatrix en llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27b-merged-qwopus-thinkingcap-swift1.5 | 27,78 B | no disponible | Apache 2.0 | Fusion DARE-TIES con MTP preservado; orientado a codigo y razonamiento |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | Modelo base; segun el autor, tiende a bucles `<think>` y deriva logica en prompts complejos |
| Jackrong/Qwopus3.8-27B-Coder-Flash | no disponible | no disponible | no disponible | Ajuste fino de codigo y razonamiento estructural; aporta el 60 % del peso |
| ukisai/Swift-1.5-Qwen3.8-27b | no disponible | no disponible | no disponible | Ajuste con RL para eliminar bucles de autocorreccion; aporta el 25 % |
| bottlecapai/ThinkingCap-Qwen3.8-27B | no disponible | no disponible | no disponible | Poda del chain-of-thought verboso; aporta el 15 % |

## Limitaciones y advertencias

- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Al ser una fusion de pesos y no un entrenamiento con RLHF/DPO documentado, los sesgos heredados de los modelos base no estan auditados.
- Riesgo de alucinacion inherente a los modelos de 27 B, especialmente en codigo de dominio especifico y APIs poco frecuentes.
- El modo thinking consume entre un 20 % y un 30 % mas de tokens que ajustes podados, lo que incrementa coste y latencia en produccion.
- El pipeline declarado es image-text-to-text, pero no hay evidencia en la informacion disponible de que las capacidades de vision funcionen correctamente; conviene validarlo antes de usarlo en tareas multimodales.
- La licencia Apache 2.0 permite uso comercial, pero las licencias de los modelos fusionados deben verificarse por separado.
- El modelo lo publica un usuario individual (mazuj2) y no Qwen oficialmente; no hay garantias de mantenimiento ni soporte.
- El ejemplo de codigo de la model card referencia el ID `RiderJones/...` en lugar de `mazuj2/...`, lo que puede provocar errores al copiar y pegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mazuj2/Qwen3.8-27b-merged-qwopus-thinkingcap-swift1.5
- Quants GGUF de terceros: https://huggingface.co/RiderJones/Qwen3.8-27b-merged-Qwopus-Thinkingcap-Swift1.5-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Qwopus3.8-27B-Coder-Flash: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Swift-1.5-Qwen3.8-27b: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- ThinkingCap-Qwen3.8-27B: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- mergekit: https://github.com/arcee-ai/mergekit
