# mlx-community/Holo-3.1-0.8B-4bit

## Resumen

Holo-3.1-0.8B-4bit es una cuantizacion en 4 bits del modelo multimodal Holo-3.1-0.8B desarrollado por H Company, publicada por la comunidad mlx-community para su ejecucion en Apple Silicon mediante la libreria MLX. El modelo original es un image-text-to-text especializado en "computer use" y agentes de interfaz grafica (GUI agents): recibe una captura de pantalla y un prompt, y devuelve acciones como clics con coordenadas, lo que lo hace adecuado para automatizar la interaccion con aplicaciones web y de escritorio.

La arquitectura subyacente es `qwen3_5` (segun los tags del repositorio), con aproximadamente 853 millones de parametros totales (852.985.920 segun los pesos en safetensors) y un peso de repositorio de 0,6 GB. Esta version concreta aplica cuantizacion afina de 4 bits con group size 64 y mantiene la torre de vision en bfloat16, preservando la precision de la codificacion visual mientras reduce el coste de los pesos del lenguaje.

Su relevancia practica radica en que permite ejecutar localmente un agente visual de GUI en hardware de consumo Apple (se han publicado mediciones en un M5 Max), con una velocidad de decodificacion de 562 tok/s y un pico de memoria de 2,1 GB en el caso de una captura 1080p. La licencia Apache-2.0 del modelo original se mantiene, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal image-text-to-text, segun tags del repo) |
| Parametros totales | 852.985.920 (~0,85 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64; torre de vision en bfloat16 (existen variantes bf16, 8bit y mxfp8 del mismo benchmark) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Holo-3.1-0.8B de H Company, un modelo multimodal de tipo image-text-to-text orientado a la accion y al control de interfaces. Los tags del repositorio lo etiquetan como `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5 adaptada para tareas de localizacion visual y prediccion de acciones. La model card de esta cuantizacion no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponderia a la model card original.

La innovacion tecnica documentada en esta ficha es el proceso de cuantizacion y validacion: la conversion se realizo con `mlx-vlm` 0.8.0 mediante cuantizacion afina de 4 bits con group size 64, dejando la torre de vision en bfloat16. El autor reporta una validacion de fidelidad comparando los logits de la respuesta de clic contra los pesos originales en float32 (transformers, CPU) con teacher forcing: divergencia KL media de 1,3e-2 a 720p, frente a 2e-4 a 3e-4 del bfloat16 en MPS. Las respuestas de referencia en float32 fueron `{"x":517,"y":197}` a 720p y `{"x":487,"y":207}` a 1080p, con coordenadas en escala 1000.

## Capacidades

- Generacion de texto e interaccion conversacional multimodal (imagen + texto).
- Localizacion visual y prediccion de clics: devuelve coordenadas como enteros en el rango [0, 1000] sobre capturas de pantalla.
- Computer use y agentes de GUI: etiquetado explicitamente para `action`, `agent`, `computer use` y `gui agents`.
- Procesamiento de capturas de pantalla de alta resolucion (se han probado entradas a 1920x1080).
- Manejo de prompts multi-imagen (se han medido escenarios con 3 capturas 1080p, ~12k tokens de prompt).
- Generacion determinista con decodificacion greedy y temperatura 0.0 documentada en los ejemplos de uso.
- Capacidades multilingues limitadas al ingles segun el campo `language`.
- No se documenta soporte explicito de tool calling, function calling ni modo "thinking" en la informacion disponible.

## Casos de uso

- Automatizacion de tareas web (RPA visual): el modelo recibe una captura del navegador y devuelve la coordenada del elemento a pulsar, permitiendo construir agentes que rellenan formularios, navegan menus o completan flujos de compra sin depender de selectores DOM fragiles.
- Testing de interfaces de usuario: integrado en pipelines de QA, el modelo puede localizar elementos por descripcion en lenguaje natural sobre capturas de cada build, generando acciones de clic para pruebas end-to-end de regresion visual.
- Asistentes de escritorio locales: al ejecutarse en Apple Silicon con ~2,1 GB de pico de memoria, es viable empaquetarlo en una aplicacion de escritorio que guie al usuario paso a paso sobre la pantalla sin enviar capturas a la nube.
- Agentes GUI multi-paso: con prompts de varias capturas (se han medido 3 imagenes 1080p, ~12k tokens), puede encadenarse en bucles de observacion-accion para tareas de varios pasos como configurar un panel de administracion.
- Extraccion de informacion de interfaces: combinado con prompts de localizacion, sirve para identificar la posicion de campos y botones en documentacion o tutoriales generados automaticamente.
- Prototipado rapido de agentes en investigacion: su tamano reducido y su licencia Apache-2.0 permiten experimentar con tecnicas de grounding visual y evaluacion sobre WebClick sin coste de infraestructura GPU dedicada.
- Automatizacion de soporte en aplicaciones legacy: para sistemas sin API, el modelo puede operar la interfaz grafica mediante clics localizados a partir de instrucciones en ingles.

## Benchmarks y rendimiento

El autor publica resultados de precision de clic sobre el dataset Hcompany/WebClick (1639 muestras, licencia Apache-2.0), usando la receta oficial de localizacion de H Company (`smart_resize`, prompt oficial, thinking off, greedy, 32 tokens nuevos, coordenadas en [0, 1000]):

| Modelo (misma muestra y prompt) | Precision | IC 95% |
|---|---|---|
| MLX bf16 | 78,8% | 76,7 a 80,7 |
| MLX 8bit | 78,6% | 76,5 a 80,5 |
| MLX mxfp8 | 78,7% | 76,7 a 80,6 |
| MLX 4bit (este modelo) | 73,6% | 71,5 a 75,7 |

La cuantizacion a 4 bits pierde 5,1 puntos frente a bf16 (test exacto pareado, p < 0,001), mientras que no se detecto perdida medible con 8 bits.

Rendimiento medido en Apple M5 Max (128 GB), una captura 1920x1080, 2221 tokens de prompt, greedy:

| Motor | Time to first token | Decodificacion | Memoria |
|---|---|---|---|
| MLX, este modelo (4bit) | 224 ms | 562 tok/s | 2,1 GB (pico) |
| transformers bfloat16, MPS | 331 ms | 137 tok/s | 4,6 GB (pico) |
| llama.cpp (Metal), Q4_K_M | 462 ms | 335 tok/s | 1,5 GB (RSS) |

Con prompt multi-imagen largo (3 capturas 1080p, ~12k tokens de prompt, 1024 tokens generados):

| Motor | Time to first token | Decodificacion | Memoria |
|---|---|---|---|
| MLX, este modelo (4bit) | 1,0 s | 446 tok/s | 2,3 GB (pico) |
| llama.cpp (Metal), F16 GGUF | 2,1 s | 199 tok/s | 2,8 GB (RSS) |

El autor advierte que las mediciones son indicativas: la maquina estaba compartida con otras tareas y las metricas de memoria se miden de forma distinta por motor.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~2,1 GB de pico para una captura 1080p y ~2,3 GB con prompts multi-imagen de ~12k tokens (medido en MLX).
- Hardware objetivo: Apple Silicon con MLX; las mediciones publicadas corresponden a un M5 Max con 128 GB de memoria unificada.
- Cabe en GPUs de consumo Apple (serie M) con holgura; no se documentan requisitos para GPU NVIDIA ni CUDA en esta ficha.
- Opciones de despliegue: `mlx-vlm` 0.8.0 (recomendado y validado), llama.cpp con Metal (probado con Q4_K_M y F16 GGUF no oficial), y transformers con MPS en bfloat16 como referencia de comparacion.
- Latencia y throughput: 224 ms hasta el primer token y 562 tok/s de decodificacion en el caso de una sola captura; 1,0 s y 446 tok/s en el caso multi-imagen largo.
- Instalacion: `pip install -U mlx-vlm`; generacion con `python -m mlx_vlm.generate --model mlx-community/Holo-3.1-0.8B-4bit --max-tokens 64 --temperature 0.0 --prompt "<prompt>" --image <ruta_captura>`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision WebClick | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Holo-3.1-0.8B-4bit (esta ficha) | ~0,85 B | no disponible | 73,6% | Apache-2.0 | MLX (Hugging Face) |
| Holo-3.1-0.8B bf16 (original) | ~0,85 B | no disponible | 78,8% (MLX bf16) | Apache-2.0 | Hugging Face |
| Holo-3.1-0.8B 8bit (MLX) | ~0,85 B | no disponible | 78,6% | Apache-2.0 | MLX (Hugging Face) |
| Holo-3.1-0.8B mxfp8 (MLX) | ~0,85 B | no disponible | 78,7% | Apache-2.0 | MLX (Hugging Face) |

No se dispone de datos de benchmarks frente a otros modelos de agentes GUI de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits degrada la precision de localizacion en 5,1 puntos frente a bf16 (73,6% frente a 78,8% en WebClick), una diferencia estadisticamente significativa; para tareas donde la precision de clic sea critica, valorar la variante 8bit o bf16.
- El modelo solo declara soporte de ingles (`language: en`); el rendimiento en otros idiomas no esta documentado.
- No se documenta la longitud de contexto maxima, lo que dificulta planificar despliegues con historiales largos o muchas capturas simultaneas.
- Riesgo de alucinacion en coordenadas: el modelo devuelve puntos en escala [0, 1000] y puede predecir localizaciones fuera de la caja objetivo; se recomienda validacion posterior (por ejemplo, comprobar que el clic cae dentro de un elemento interactivo).
- La validacion se realizo sobre capturas sinteticas como smoke test; el autor advierte que la referencia real es la precision en WebClick.
- Las mediciones de velocidad se tomaron en una maquina compartida y son indicativas; el autor marca con asterisco los resultados con variacion superior al 10%.
- El GGUF F16 probado con llama.cpp no es una release oficial, sino una conversion propia del autor de la ficha.
- Aunque la licencia Apache-2.0 permite uso comercial, conviene revisar la model card del modelo original para condiciones adicionales de uso responsable en agentes que operan interfaces.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/mlx-community/Holo-3.1-0.8B-4bit
- Modelo base original: https://huggingface.co/Hcompany/Holo-3.1-0.8B
- H Company: https://www.hcompany.ai/
- Dataset de evaluacion WebClick: https://huggingface.co/datasets/Hcompany/WebClick
- Pull request de optimizacion de la torre de vision en mlx-vlm: https://github.com/Neywa-Labs/mlx-vlm/pull/2822
