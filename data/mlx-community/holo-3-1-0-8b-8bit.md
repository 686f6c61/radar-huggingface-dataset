# mlx-community/Holo-3.1-0.8B-8bit

## Resumen

Holo-3.1-0.8B-8bit es una cuantizacion en 8 bits del modelo multimodal Holo-3.1-0.8B desarrollado por H Company, publicada por la comunidad mlx-community para su ejecucion en el framework MLX de Apple. El modelo original es un modelo de lenguaje y vision de tipo image-text-to-text orientado especificamente a agentes de interfaz grafica (GUI agents) y computer use: recibe una captura de pantalla y un prompt de localizacion, y devuelve coordenadas de click sobre la pantalla.

Con 852.985.920 parametros totales (aproximadamente 0,85 mil millones), Holo-3.1-0.8B es un modelo compacto pensado para ejecutarse en hardware de consumo. Esta version concreta aplica cuantizacion afina de 8 bits con tamano de grupo 64, manteniendo la torre de vision en bfloat16, lo que reduce el peso del repositorio a 1,0 GB y permite una inferencia rapida en silicio Apple (medida en 418 tok/s de decodificacion en un M5 Max).

La relevancia de esta ficha radica en que documenta una de las pocas alternativas abiertas y ligeras para automatizacion de navegador y escritorio mediante modelos de vision-lenguaje, con licencia Apache-2.0 y resultados publicados de precision de click sobre el benchmark WebClick.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (base Qwen3.5, tag `qwen3_5`); torre de vision en bfloat16 |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64 (esta version); existen variantes bf16, 4bit y mxfp8 del mismo modelo base |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer multimodal de tipo image-text-to-text construida sobre la familia Qwen3.5 (segun el tag `qwen3_5` del repositorio). Combina un codificador de vision que procesa capturas de pantalla con un decodificador de lenguaje que genera respuestas estructuradas; en el caso de las tareas de localizacion, la salida son coordenadas enteras en el rango [0, 1000] que se mapean proporcionalmente a la resolucion de la imagen. La torre de vision se conserva en bfloat16 en esta cuantizacion para preservar la calidad de la representacion visual.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. El modelo base esta etiquetado como especializado en `action`, `agent`, `computer use` y `gui agents`, lo que sugiere un ajuste orientado a tareas de interaccion con interfaces. La cuantizacion se realizo con `mlx_vlm.convert` usando `--dtype bfloat16 -q --q-bits 8 --q-group-size 64`, y fue validada comparando los logits de la respuesta de click contra los pesos originales en float32 mediante teacher forcing: la divergencia media (KL) es de 3,6e-4 a 720p, comparable al rango de 2e-4 a 3e-4 que produce transformers en bfloat16 sobre MPS.

## Capacidades

- Generacion de texto conversacional a partir de imagenes y texto (pipeline image-text-to-text).
- Localizacion visual de elementos de interfaz: devuelve coordenadas de click como enteros en [0, 1000] a partir de una captura de pantalla y un prompt de localizacion.
- Agentes de interfaz grafica (GUI agents): soporte para computer use y automatizacion de navegador y escritorio.
- Comprension de capturas de pantalla en resoluciones habituales (validado a 720p y 1080p).
- Capacidad multimodal de un solo turno orientada a accion; no se documentan capacidades de audio ni de video.
- Soporte multilingue limitado al ingles.
- No se documenta soporte explicito de tool calling ni de razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Automatizacion de navegador web: dado un prompt como "haz click en el boton de enviar" y una captura de la pagina, el modelo devuelve las coordenadas del elemento, lo que permite construir agentes que operan sobre paginas sin selectores DOM. Su precision del 78,6% en WebClick lo hace adecuado para flujos con verificacion posterior.
- Testing de interfaces de usuario: integrado en pipelines de QA, el modelo puede localizar elementos en capturas de pantalla para comprobar que los controles estan en la posicion esperada tras un cambio de layout.
- Automatizacion de escritorio en macOS: al ejecutarse sobre MLX, puede desplegarse localmente en equipos Apple Silicon para tareas de RPA ligera (rellenar formularios, pulsar menus) sin enviar capturas a la nube.
- Asistentes de accesibilidad: traducir instrucciones en lenguaje natural a coordenadas de click permite construir interfaces por voz o texto para usuarios con movilidad reducida.
- Extraccion de datos de capturas: combinado con un orquestador, el modelo puede localizar campos concretos (botones, enlaces, casillas) en imagenes de aplicaciones para alimentar procesos de scraping visual.
- Prototipado rapido de agentes en local: con un peso de 1,0 GB y 2,5 GB de memoria pico, es viable experimentar con agentes GUI en un portatil sin GPU dedicada, usando mlx-vlm como runtime.

## Benchmarks y rendimiento

Resultados de precision de click en el benchmark WebClick (Hcompany/WebClick, 1639 muestras, protocolo oficial de localizacion de H Company, thinking off, greedy, 32 tokens nuevos, coordenadas en [0, 1000]):

| Modelo | Precision | IC 95% |
|---|---|---|
| MLX bf16 | 78,8% | 76,7 a 80,7 |
| MLX 8bit (este modelo) | 78,6% | 76,5 a 80,5 |
| MLX 4bit | 73,6% | 71,5 a 75,7 |
| MLX mxfp8 | 78,7% | 76,7 a 80,6 |

Rendimiento en Apple M5 Max (128 GB), una captura de 1920x1080, 2221 tokens de prompt, decodificacion greedy:

| Motor | Tiempo al primer token | Decodificacion | Memoria |
|---|---|---|---|
| MLX, este modelo (8bit) | 231 ms | 418 tok/s | 2,5 GB (pico) |
| transformers, bfloat16, MPS | 331 ms | 137 tok/s | 4,6 GB (pico) |
| llama.cpp (Metal), Q8_0 | 458 ms | 295 tok/s | 1,9 GB (RSS) |

Rendimiento con prompt largo multi-imagen (3 capturas de 1920x1080, unos 12k tokens de prompt, 1024 tokens generados):

| Motor | Tiempo al primer token | Decodificacion | Memoria |
|---|---|---|---|
| MLX, este modelo (8bit) | 0,9 s | 350 tok/s | 2,7 GB (pico) |
| llama.cpp (Metal), F16 GGUF (no oficial) | 2,1 s (variable) | 199 tok/s | 2,8 GB (RSS) |

No se han publicado resultados de benchmarks de conocimiento general (MMLU, HumanEval, GSM8K) en la informacion disponible. Las mediciones de velocidad se tomaron en una maquina compartida con otras tareas, por lo que son indicativas.

## Requisitos de hardware

- VRAM/memoria estimada: 2,5 GB de pico en MLX con una captura de 1080p (2,7 GB con prompt multi-imagen de 12k tokens); 1,9 GB RSS en llama.cpp Q8_0.
- GPU recomendadas: Apple Silicon (validado en M5 Max de 128 GB); el formato MLX esta pensado para GPUs unificadas de Apple.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon con al menos 4-8 GB de memoria unificada disponible; no se documenta soporte CUDA en esta version.
- Opciones de despliegue: mlx-vlm 0.8.0 (runtime oficial de esta cuantizacion), llama.cpp con Metal (variante Q8_0), transformers con MPS (bfloat16, referencia). No se documenta integracion con vLLM, TGI ni Ollama.
- Latencia y throughput: 231 ms al primer token y 418 tok/s de decodificacion en M5 Max para una captura 1080p; 0,9 s al primer token y 350 tok/s con tres capturas y 12k tokens de prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision WebClick | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Holo-3.1-0.8B-8bit (este) | 0,85 B | no disponible | 78,6% | Apache-2.0 | Hugging Face (MLX) |
| Holo-3.1-0.8B (original, bf16) | 0,85 B | no disponible | 78,8% (MLX bf16) | Apache-2.0 | Hugging Face |
| Variante 4bit del mismo modelo | 0,85 B | no disponible | 73,6% | Apache-2.0 | Hugging Face (MLX) |
| Variante mxfp8 del mismo modelo | 0,85 B | no disponible | 78,7% | Apache-2.0 | Hugging Face (MLX) |

No se dispone de datos de otros modelos de agentes GUI comparables (por ejemplo, de otras familias) en la informacion proporcionada, por lo que la comparativa se limita a las variantes de cuantizacion del mismo modelo base.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se documenta capacidad multilingue.
- La tarea principal es la localizacion de clicks; no se documentan capacidades de razonamiento general, matematicas o generacion de codigo.
- Precision de click del 78,6%: aproximadamente uno de cada cinco clicks puede fallar, por lo que en produccion conviene anadir verificacion posterior o reintentos.
- La cuantizacion 4bit degrada la precision en 5 puntos (73,6% frente a 78,6%); para tareas sensibles a la localizacion conviene usar 8bit, mxfp8 o bf16.
- Las mediciones de velocidad se realizaron en una maquina compartida y son indicativas; pueden variar segun la carga y el hardware.
- La torre de vision en bfloat16 y la cuantizacion 8bit no eliminan el riesgo de alucinacion en la interpretacion de capturas ambiguas o de baja resolucion.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar los terminos del modelo base original y de los datasets de validacion.
- La validacion se hizo con capturas sinteticas como smoke test y con WebClick; el comportamiento en otras interfaces (aplicaciones de escritorio nativas, resoluciones atipicas) no esta documentado.
- El formato MLX limita el despliegue a hardware Apple; para CUDA se requeriria convertir los pesos originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Holo-3.1-0.8B-8bit
- Modelo base original: https://huggingface.co/Hcompany/Holo-3.1-0.8B
- Web de H Company: https://www.hcompany.ai/
- Dataset de benchmark WebClick: https://huggingface.co/datasets/Hcompany/WebClick
- Pull request de optimizacion de la torre de vision en mlx-vlm: https://github.com/Neywa-Labs/mlx-vlm/pull/2822
