# hhhhhhy5/MFD-D-Qwen3-4B

## Resumen

MFD-D-Qwen3-4B es un modelo borrador (draft model) para decodificacion especulativa sobre el modelo objetivo Qwen/Qwen3-4B. Lo desarrolla el autor hhhhhhy5 en el marco del trabajo *Multi-Future Drafting: Mixture Block Drafters for Tree-Verified Speculative Decoding* (arXiv:2611.13017). No es un modelo generativo autonomo: su funcion es proponer multiples continuaciones candidatas que el modelo objetivo verifica en arbol, acelerando la inferencia sin alterar la distribucion de salida (decodificacion sin perdida).

Tecnicamente es un drafter DFlash de bloques con K = 8 embeddings de modo aprendidos, mas un modo por defecto. Consta de 5 capas de anchura 2560 que leen los estados ocultos de las capas [1, 9, 17, 25, 33] del modelo objetivo, con un bloque de 16 posiciones (15 borradores por bloque). Tiene 537 millones de parametros en bf16 y reutiliza en tiempo de ejecucion el embedding y la LM head de Qwen3-4B, que no se almacenan en el repositorio.

Su relevancia es practica: segun los resultados del paper, alcanza una aceleracion de 5,89x a temperatura 0 y 5,11x a temperatura 1 en SGLang con batch size 1, por encima de las variantes DFlash y DDTree publicadas. Esta pensado para despliegues de Qwen3-4B en modo sin razonamiento (no thinking) donde el throughput de decodificacion es el cuello de botella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash drafter (block drafter) con 8 embeddings de modo y puerta lineal; 5 capas de anchura 2560, lectura de capas objetivo [1, 9, 17, 25, 33], bloque de 16 (15 posiciones borrador) |
| Parametros totales | 537.450.240 (537M, bf16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo Qwen3-4B) |
| Tipos de cuantizacion | no disponible (pesos en bf16; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con custom_code; requiere el codigo del repositorio para cargar) |

## Arquitectura y entrenamiento

El drafter sigue el diseno DFlash: un transformer ligero de 5 capas y anchura 2560 que consume los estados ocultos intermedios del modelo objetivo en las capas 1, 9, 17, 25 y 33, y predice un bloque de 16 posiciones de las cuales 15 son borradores. Sobre esta base anade 8 embeddings de modo (`mode_embed`, 8 x 2560) y una puerta lineal (`mode_gate`, no usada en inferencia), lo que permite generar un arbol de multiples futuros que el verificador del objetivo valida. Se inicializa desde z-lab/Qwen3-4B-DFlash-b16 (MIT).

El entrenamiento usa las 1,42 millones de prompts de mlabonne/open-perfectblend, con respuestas regeneradas por Qwen3-4B sin thinking (T = 0.7, top-p 0.8, top-k 20, maximo 2048 tokens nuevos). Se realizan 3 epocas con AdamW, learning rate 1e-4 (warmup del 4 %, decaimiento coseno), clipping de gradiente 1, secuencias de hasta 3072 tokens, 36 secuencias por paso y 64 bloques ancla por secuencia por cada modo. El objetivo combina un winner-take-all relajado sobre los 8 modos (el modo con mayor cobertura suave del bloque recibe peso 0.9 y el resto 0.1/7), perdida D-PACE por modo (suavizado 0.5), entropia cruzada de la puerta con peso 0.1 y la perdida D-PACE de modo unico en la ruta por defecto.

## Capacidades

- Generacion de borradores de tokens para decodificacion especulativa verificada en arbol sobre Qwen3-4B, con decodificacion sin perdida.
- Propuesta de multiples futuros mediante 8 modos aprendidos, lo que amplia la cobertura del arbol verificado.
- Ruta de modo unico (default) para escenarios de mayor concurrencia.
- Integracion con SGLang mediante parche propio, con conmutacion automatica entre el arbol de 8 modos (batch 1-2) y la ruta por defecto (a partir de 3 peticiones concurrentes) dentro del mismo motor.
- Uso del vocabulario de borrador de 64K tokens (`draft_vocab_qwen3-4b_64k.json`) para reducir el coste de la cabeza de prediccion.
- No es un modelo de proposito general: no responde prompts por si mismo, no soporta tool calling ni agentes de forma nativa y no tiene capacidades de vision ni audio.

## Casos de uso

- Aceleracion de inferencia de Qwen3-4B en produccion: se despliega junto al objetivo en SGLang con el parche MFD y se obtiene una aceleracion de hasta 5,89x a T = 0 y 5,11x a T = 1 con batch size 1, reduciendo el coste por token generado en servicios de chat.
- Servicios de baja concurrencia y baja latencia: en batch sizes 1-2 el motor usa el arbol de 8 modos, el escenario donde la mezcla aporta mas cobertura y aceleracion.
- Despliegues con concurrencia variable: el motor conmuta a la ruta de modo unico a partir de 3 peticiones concurrentes, manteniendose dentro del 3,1 % del mejor motor fijo en cada batch size de 1 a 32 (Figura 5 del paper), lo que simplifica la operacion con una sola configuracion.
- Generacion de codigo y respuestas factuales sin thinking: al entrenarse con respuestas regeneradas por Qwen3-4B sin razonamiento, encaja en pipelines de autocompletado y asistencia donde se busca la respuesta directa del objetivo.
- Evaluacion e investigacion en decodificacion especulativa: sirve como referencia reproducible para comparar DFlash, DDTree, D-PACE y MFD bajo el mismo objetivo y las mismas cinco tareas del paper.
- Reduccion de coste en infraestructura existente: al ser un drafter de 537M en bf16 (repo de 1,1 GB), se anade a un despliegue de Qwen3-4B sin necesidad de reentrenar ni cambiar el modelo servido, manteniendo la distribucion de salida intacta.

## Benchmarks y rendimiento

Resultados del paper con SGLang 0.5.22 y el parche MFD, batch size 1, las mismas 5 tareas, B = 63 y vocabulario de borrador de 64K (Tabla 2). Se muestra la aceleracion y, entre parentesis, los tokens por paso de verificacion:

| Metodo | T = 0 | T = 1 |
|---|---|---|
| DFlash chain (drafter publicado, SGLang nativo) | 4,06x (5,97) | 3,46x (5,10) |
| DDTree (drafter publicado) | 4,97x (7,81) | 4,44x (6,99) |
| D-PACE + DDTree (1,42M prompts) | 5,52x (8,72) | 4,72x (7,48) |
| Este drafter (MFD-D) | 5,89x (9,59) | 5,11x (8,27) |

Ademas, en la franja de batch sizes 1-32 (bucle cerrado, 320 peticiones), el motor con conmutacion se mantiene dentro del 3,1 % del mejor motor fijo en cada batch size.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 1,1 GB en bf16 (537M parametros), adicional a la memoria del modelo objetivo Qwen3-4B y de la cache KV.
- VRAM total estimada: Qwen3-4B en bf16 ronda los 8 GB de pesos, mas cache KV y el drafter; en la practica se recomienda una GPU con al menos 16-24 GB para margen operativo.
- GPU recomendadas: A100, H100 y L40S para servicio en produccion con SGLang; RTX 4090 (24 GB) es suficiente para ejecutar objetivo y drafter en bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 y en tarjetas de 24 GB; en 16 GB o menos conviene cuantizar el objetivo o reducir contexto.
- Opciones de despliegue: SGLang 0.5.22 con el parche del repositorio (ruta recomendada para el arbol de 8 modos y la conmutacion); inferencia con Transformers mediante el codigo de `inference/hf` del repositorio. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican valores absolutos de latencia ni tokens por segundo; solo factores de aceleracion relativos al objetivo sin drafter.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Aceleracion T = 0 (batch 1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MFD-D-Qwen3-4B (este) | 537M | Drafter DFlash con 8 modos | 5,89x | Apache-2.0 | Hugging Face, requiere codigo propio |
| z-lab/Qwen3-4B-DFlash-b16 | no disponible en la informacion | Drafter DFlash de bloque | 4,06x (cadena DFlash) | MIT | Hugging Face, SGLang nativo |
| Drafter DDTree del paper | no disponible en la informacion | Drafter de arbol | 4,97x | no disponible | Paper y repositorio del autor |
| D-PACE + DDTree (1,42M prompts) | no disponible en la informacion | Drafter de arbol entrenado con D-PACE | 5,52x | no disponible | Paper y repositorio del autor |

## Limitaciones y advertencias

- La mezcla de 8 modos solo se usa con batch sizes 1-2; a partir de 3 peticiones concurrentes el motor ejecuta la ruta de modo unico por defecto, con menor cobertura del arbol.
- El drafter esta acoplado a su objetivo: lee los estados ocultos de Qwen3-4B y usa su embedding y LM head, por lo que no funciona con otro modelo.
- Esta entrenado sobre respuestas de Qwen3-4B sin thinking; su uso con el modo thinking del objetivo no esta validado.
- Requiere codigo personalizado (custom_code) y el parche de SGLang del repositorio; no es cargable con herramientas estandar sin ese codigo.
- Riesgo de alucinacion: no aplica al drafter en si, ya que la verificacion del objetivo garantiza decodificacion sin perdida; el contenido generado hereda los sesgos y limitaciones de Qwen3-4B.
- Idiomas soportados no documentados; la cobertura linguistica depende del objetivo y del dataset de prompts (open-perfectblend).
- Licencia Apache-2.0 para este drafter, con la nota MIT de z-lab/Qwen3-4B-DFlash-b16 aplicable a los pesos de partida; conviene revisar ambas antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hhhhhhy5/MFD-D-Qwen3-4B
- Modelo base: https://huggingface.co/z-lab/Qwen3-4B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-4B
- Paper: https://arxiv.org/abs/2611.13017
- Codigo: https://github.com/hhhhhhy5/multi-future-drafting
- Pagina del proyecto: https://hhhhhhy5.github.io/multi-future-drafting/
- Dataset de prompts: https://huggingface.co/datasets/mlabonne/open-perfectblend
