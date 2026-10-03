# nilp0inter/Jeff-Gemma4-E2B-GGUF

## Resumen

Jeff-Gemma4-E2B-GGUF es un paquete de conversion a formato GGUF del modelo de clasificacion mstrasser/Jeff-Gemma4-E2B, un ajuste fino derivado de Gemma 4 E2B de Google DeepMind. Lo publica el usuario nilp0inter y no es un modelo de chat: el GGUF contiene unicamente el backbone transformer ajustado, mientras que la cabeza de clasificacion original se aplica por separado mediante un cliente NumPy en FP32 sobre el ultimo estado oculto devuelto por llama.cpp. El resultado son probabilidades de clasificacion, sin generacion de texto.

El modelo resuelve tareas de clasificacion y decision en ingles (zero-shot-classification en la etiqueta de pipeline) con tres tipos de pregunta: `choice`, `noul` y `score`, y un maximo de 26 opciones por pregunta. El paquete incluye dos cuantizaciones, Q6_K y Q8_0, y conserva la temperatura de calibracion original de 1,019191255914553, sin reentrenar ni reajustar nada tras la conversion.

Su relevancia practica es acotada pero concreta: permite ejecutar un clasificador de decision sobre un backbone de la familia Gemma 4 en hardware muy modesto. Las mediciones del autor se hicieron en una Quadro M2200 con 4096 MiB de VRAM, y la variante Q6_K quedo como la recomendada para ese entorno. El repositorio declara 4.628.569.635 parametros en los safetensors del modelo base, cifra que no coincide con los 2,1 mil millones que la documentacion de Gemma 4 E2B atribuye a esa talla, una discrepancia que conviene verificar antes de planificar despliegues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4, con cabeza de clasificacion separada; la informacion disponible no detalla la configuracion interna |
| Parametros totales | 4.628.569.635 (conteo de safetensors del modelo base; la documentacion de Gemma 4 E2B declara 2,1 mil millones para esa talla) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens configurados en llama-server; no verificado en toda su extension (prueba de humo de 668 tokens) |
| Tipos de cuantizacion | Q6_K (3.829.835.200 bytes, 3,57 GiB) y Q8_0 (4.947.414.464 bytes, 4,61 GiB); F16 intermedio en el proceso de conversion |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 para los pesos; MIT para el codigo del cliente |
| Formato de pesos | GGUF (llama.cpp) |
| Tipo de modelo | Paquete de clasificacion (decision-model), no modelo de chat |
| Pipeline declarado | zero-shot-classification |
| Cabeza de clasificacion | `checkpoint/readout.safetensors` en BF16, evaluada en FP32 por el cliente NumPy |
| Temperatura de calibracion | 1,019191255914553 (original, no reajustada) |
| Tamano del repositorio | 8,8 GB |
| Version de llama.cpp | commit 7fe450e19305b828c199d602c23a8337aaa1f03b; servidor probado build b11146, version 0.5.0 |
| Entorno de cliente | Python 3.12, NumPy 2.5.3 |
| Fecha de publicacion | 2 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo base es mstrasser/Jeff-Gemma4-E2B, un ajuste fino del checkpoint Gemma 4 E2B de Google DeepMind al que se le anade una cabeza de clasificacion propia (`checkpoint/readout.safetensors`) y una configuracion de decision (`checkpoint/decision_config.json`). El proyecto original Jeff procede del repositorio firelex/jeff (commit d0173b4ee317a46dee031421b713f3fc5f868cfe) y esta orientado a formular preguntas de decision sobre texto en lugar de generar respuestas. La informacion disponible no especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

En esta conversion, nilp0inter transformo el backbone ajustado a GGUF F16 y despues lo cuantizo a Q6_K y Q8_0, sin retocar el checkpoint original. El adaptador del conversor anade el prefijo `model.` a los tensores y el sufijo `.weight` a los escalares de capa. Como el bundle no aplica la cabeza de clasificacion por si solo, el flujo real es hibrido: llama-server expone el backbone como backend de embeddings (pooling del ultimo token, `--embd-normalize -1`) y el cliente Python calcula la cabeza en FP32 con NumPy. La temperatura de calibracion original se mantiene intacta, aunque el propio autor advierte que la cuantizacion puede alterar la calibracion.

## Capacidades

- Clasificacion de texto en ingles mediante preguntas de decision, incluyendo los tipos `choice`, `noul` y `score`.
- Devolucion de probabilidades sobre un conjunto de opciones, sin generacion de texto libre.
- Hasta 26 opciones por pregunta.
- Peticiones de una sola pasada (`orders=1`), sin razonamiento multi-paso ni cadenas de decisiones encadenadas.
- Ejecucion local como backend de embeddings sobre llama.cpp, con pooling de ultimo token y soporte de division de prompt (prompt splitting).
- Inferencia en GPU de gama baja (probado en una Quadro M2200 de 4 GB) manteniendo la cabeza del modelo de lenguaje en CPU mediante `--override-tensor 'output.weight=CPU'`.
- No soporta imagenes, vision, audio ni la API HTTP completa del servidor original de Jeff.
- No soporta tool calling, function calling ni comportamiento de agente.
- No es multilingue: el soporte declarado se limita al ingles.

## Casos de uso

- Triaje de tickets de soporte: el ejemplo incluido en el repositorio describe un cobro duplicado y el modelo selecciona la categoria `billing`. Con un maximo de 26 opciones por pregunta es viable clasificar incidencias en un arbol de categorias predefinido.
- Enrutado de consultas en atencion al cliente: asignar cada mensaje entrante al departamento o cola correspondiente mediante preguntas tipo `choice`, ejecutando el modelo en una GPU de 4 GB o incluso en CPU.
- Etiquetado de datasets para entrenamiento: clasificacion zero-shot de grandes volumenes de texto en ingles para preanotar corpus antes de una revision humana.
- Moderacion de contenido: uso de preguntas tipo `score` para asignar un grado de toxicidad o riesgo a cada fragmento, con umbrales definidos por el equipo.
- Clasificacion de intencion en asistentes conversacionales en ingles: determinar si la consulta del usuario pide informacion, ejecutar una accion o solicitar soporte humano antes de invocar otro sistema.
- Filtrado previo en pipelines RAG: decidir si una consulta requiere recuperacion documental, aprovechando la baja latencia medida (1,045-1,509 s por peticion en hardware modesto).
- Analisis de respuestas abiertas de encuestas: puntuacion automatica de texto libre en ingles con la escala definida por el equipo.
- Validacion de clasificadores propios: la coincidencia 8/8 con el modelo original en BF16 permite usar esta conversion como referencia ligera para comprobar el comportamiento de la version completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las cifras que acompanan al repositorio son comparaciones de humo y no un estudio de benchmark ni de calibracion. Se reproducen a continuacion tal cual, junto con su contexto de medicion.

| Medicion en Quadro M2200 (4096 MiB, CUDA 12.9, driver 580.178.04, compute capability 5.2) | Q6_K | Q8_0 |
|---|---:|---:|
| Memoria de GPU total tras la inferencia | 3385 MiB | 3979 MiB |
| Memoria de GPU libre tras la inferencia | 647 MiB | 53 MiB |
| Coincidencias en las opciones principales frente al Jeff original | 8/8 | 8/8 |
| Diferencia maxima absoluta de probabilidad | 0,0021284 | 0,0021331 |
| Tiempo medio declarado para las ocho peticiones de referencia | 1,509 s | 1,045 s |
| Configuracion de batch y microbatch | 32 | 128 |

Notas de contexto aportadas por el autor: la memoria de GPU incluye el escritorio y otras asignaciones, no solo los pesos; la latencia cubre la peticion de embeddings al backend y el calculo de la cabeza en NumPy; los prompts de referencia contienen entre 100 y 112 tokens; la referencia se genero con el codigo original de Jeff fijado por commit, pesos BF16, PyTorch 2.14.0+cu130 y Transformers 5.17.0, con identificadores de token identicos en todos los casos a traves del tokenizer y la plantilla de chat convertidos. El autor senala que distintas configuraciones de batch afectan a la comparacion de tiempos y que las puntuaciones de precision y calibracion del modelo original no son mediciones de estas versiones cuantizadas.

## Requisitos de hardware

- VRAM estimada: unos 3385 MiB de memoria total de GPU tras la inferencia con Q6_K y unos 3979 MiB con Q8_0 en el entorno medido, incluyendo escritorio y otras asignaciones.
- GPU recomendada por el autor: la variante Q6_K esta pensada para la GPU de 4 GiB probada; Q8_0 ofrece mas precision pero deja solo 53 MiB libres en ese mismo equipo.
- GPU utilizadas en el proceso: Quadro M2200 (4 GiB, compute capability 5.2) para las mediciones, RTX 3090 para la conversion y las ejecuciones de referencia.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas para Q6_K; Q8_0 requiere margen adicional y es mas comodo con 6 GB o mas. La documentacion de Gemma 4 E2B indica ademas que esa talla puede ejecutarse enteramente en CPU.
- Opciones de despliegue: llama.cpp mediante llama-server (commit fijado 7fe450e19305b828c199d602c23a8337aaa1f03b, build b11146), con `--embeddings --pooling last --embd-normalize -1`, `--ctx-size 8192`, `--batch-size 32`, `--ubatch-size 32`, `--parallel 1`, `--jinja` y `--reasoning off`, mas `--gpu-layers all --override-tensor 'output.weight=CPU' --no-op-offload --fit off`. El cliente se ejecuta aparte con Python 3.12 y NumPy.
- Transformers y la inferencia alojada de Hugging Face no cargan este bundle directamente, y los comandos de chat automaticos de la plataforma no aplican la cabeza de clasificacion.
- Latencia medida: 1,509 s de media con Q6_K (batch y microbatch 32) y 1,045 s con Q8_0 (batch y microbatch 128) para las ocho peticiones de referencia de 100 a 112 tokens.
- Una peticion de 668 tokens paso con un microbatch de 32 tokens. El limite de contexto de 8192 tokens esta configurado pero no se probo por completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nilp0inter/Jeff-Gemma4-E2B-GGUF | 4.628.569.635 segun safetensors del modelo base | 8192 configurados, no verificados al completo | GGUF Q6_K y Q8_0 | Apache 2.0 (pesos), MIT (codigo) | Publico en Hugging Face, 0 descargas y 0 likes |
| mstrasser/Jeff-Gemma4-E2B | no disponible | no disponible | safetensors en BF16 | Apache 2.0 segun los terminos heredados por esta conversion | Publico en Hugging Face |
| Gemma 4 E2B (Google DeepMind) | 2,1 mil millones segun la documentacion de la talla | 8K | no disponible | no disponible en la informacion proporcionada | Familia publica de cinco tallas: E2B, E4B, 12B, 26B A4B y 31B |

En rendimiento, la unica comparacion disponible es la de esta conversion frente al Jeff original en BF16: coincidencia de 8/8 en las opciones principales y una diferencia maxima absoluta de probabilidad de 0,0021 en ambos formatos cuantizados. No hay datos que permitan comparar con otros clasificadores zero-shot de la misma categoria.

## Limitaciones y advertencias

- No es un modelo de chat ni de generacion de texto: devuelve probabilidades y necesita un cliente externo en NumPy que aplique la cabeza de clasificacion.
- Hugging Face Transformers y la inferencia alojada no cargan el bundle directamente; el backend de embeddings escucha en loopback y no expone un endpoint de clasificacion de Jeff.
- Soporte limitado al ingles.
- Cada pregunta admite un maximo de 26 opciones.
- Solo peticiones de una pasada (`orders=1`); no hay razonamiento multi-paso.
- No admite imagenes ni la API HTTP completa del servidor original.
- El contexto de 8192 tokens esta configurado pero las pruebas de humo no cubrieron ese limite.
- La cuantizacion puede alterar la calibracion aunque la temperatura original se mantenga sin cambios; el autor lo advierte de forma explicita.
- Discrepancia de parametros sin resolver entre el conteo de safetensors (4,63 mil millones) y la talla declarada para Gemma 4 E2B (2,1 mil millones).
- Sesgos conocidos: no documentados en la informacion disponible; el modelo hereda los sesgos del ajuste Jeff y de Gemma 4 E2B, pero no hay evaluacion publicada.
- Riesgo de alucinacion: al no generar texto, el riesgo se traslada a una confianza mal calibrada en las etiquetas o probabilidades devueltas, especialmente tras la cuantizacion.
- Restricciones de licencia: pesos bajo Apache 2.0 y codigo bajo MIT, con avisos de atribucion conservados en LICENSE.weights, NOTICE.weights y LICENSE.code; la conversion es independiente de los autores originales y no implica su aval.
- Advertencia para produccion: el repositorio no registra descargas ni likes y las mediciones son comparaciones de humo en una unica GPU, por lo que no existe validacion comunitaria ni estudio de robustez.

## Enlaces

- Repositorio del modelo: https://huggingface.co/nilp0inter/Jeff-Gemma4-E2B-GGUF
- Modelo base: https://huggingface.co/mstrasser/Jeff-Gemma4-E2B
- Codigo original de Jeff: repositorio firelex/jeff, commit d0173b4ee317a46dee031421b713f3fc5f868cfe
- Conversor: https://github.com/ggml-org/llama.cpp, commit 7fe450e19305b828c199d602c23a8337aaa1f03b
- Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 para desarrolladores: https://ai.google.dev/gemma/docs/core/model_card_4
- Coleccion Gemma: https://deepmind.google/models/gemma/
- Ficha de Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
