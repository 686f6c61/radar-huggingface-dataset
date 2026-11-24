# mlx-community/Holo-3.1-0.8B-bf16

## Resumen

Holo-3.1-0.8B es un modelo multimodal de tipo image-text-to-text desarrollado por H Company, especializado en agentes que operan interfaces graficas (GUI agents) y en "computer use". La version aqui descrita es una conversion a formato MLX realizada por mlx-community, que preserva los pesos originales en bfloat16 sin cuantizacion y mantiene la torre de vision tambien en bfloat16, pensada para ejecucion eficiente en hardware Apple Silicon.

El modelo resuelve el problema de la localizacion visual precisa: dado un prompt en lenguaje natural y una captura de pantalla, devuelve coordenadas de clic en un rango normalizado de [0, 1000]. Con 852.985.920 parametros (aproximadamente 0,85 mil millones), se posiciona como un modelo pequeno y ligero, adecuado para despliegue en local y para tareas de automatizacion de navegador o escritorio donde la latencia y el consumo de memoria importan.

Su relevancia actual radica en que combina un tamano reducido con un rendimiento competitivo en el benchmark WebClick (78,8% de precision en bf16), y en que la conversion MLX permite inferencia rapida en Macs modernos (275 tok/s de decodificacion en un M5 Max segun la model card). La licencia Apache-2.0 facilita su uso comercial y su integracion en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal (image-text-to-text), tag `qwen3_5`; torre de vision en bfloat16 |
| Parametros totales | 852.985.920 (aprox. 0,85 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta version, sin cuantizar); la model card menciona variantes MLX 8bit, 4bit y mxfp8 evaluadas en WebClick |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, bfloat16) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo multimodal de tipo image-text-to-text con tag `qwen3_5`, lo que sugiere una base derivada de la familia Qwen3.5. Incluye una torre de vision que en esta conversion se mantiene en bfloat16. El modelo base es Hcompany/Holo-3.1-0.8B, y esta version es una conversion de pesos, no un reentrenamiento: mlx-community convirtio los pesos originales con `mlx_vlm.convert` usando `--dtype bfloat16`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. La model card original no se incluye en la informacion proporcionada, por lo que estos datos se marcan como no disponibles. La innovacion tecnica destacable es el protocolo de localizacion visual: coordenadas enteras en [0, 1000] con `smart_resize` oficial y prompt especifico de H Company, que permite mapear predicciones a pixeles de la pantalla.

## Capacidades

- Generacion de texto e interaccion conversacional multimodal (imagen + texto).
- Localizacion visual y prediccion de clics: devuelve coordenadas `x` e `y` en escala [0, 1000] a partir de una captura de pantalla y una instruccion.
- Computer use y agentes GUI: orientado a automatizacion de navegador y escritorio.
- Procesamiento de imagenes de alta resolucion (evaluado con capturas de 720p y 1080p).
- Soporte de prompts de localizacion con receta oficial (`smart_resize` y prompt de H Company).
- Capacidad multilingue limitada al ingles (`language: en`).
- No se documenta soporte de tool calling, function calling ni modos de razonamiento explicito (thinking) en la informacion disponible; la evaluacion se realiza con "thinking off".

## Casos de uso

- Automatizacion de navegador web: dado un objetivo en lenguaje natural ("pulsa el boton de enviar"), el modelo localiza el elemento en la captura y devuelve coordenadas para que un agente ejecute el clic. Su tamano reducido permite ejecutarlo en local junto al agente.
- Agentes de computer use en escritorio: integrado en un bucle de percepcion-accion, el modelo interpreta la pantalla actual y propone el siguiente clic, adecuado para tareas de RPA (automatizacion robotica de procesos).
- Testing de interfaces de usuario: generar clics sinteticos sobre capturas para validar flujos de UI y detectar elementos no localizables, usando WebClick como referencia de calidad.
- Asistencia a personas con discapacidad motriz: traducir instrucciones verbales o textuales en acciones de puntero sobre la pantalla, con inferencia local que preserva la privacidad de las capturas.
- Automatizacion de tareas repetitivas en aplicaciones legacy: al no requerir APIs, el modelo opera sobre la interfaz grafica de aplicaciones que no exponen integraciones programaticas.
- Prototipado rapido en macOS: gracias a la conversion MLX, se puede desplegar en un Mac con Apple Silicon para demos y pruebas de concepto con latencia baja (227 ms hasta el primer token en un M5 Max con una captura 1080p).
- Extraccion de datos de formularios y pantallas: combinar la localizacion de campos con un pipeline posterior de OCR o extraccion para poblar bases de datos.

## Benchmarks y rendimiento

La model card reporta resultados en el benchmark WebClick (Hcompany/WebClick, Apache-2.0, 1639 muestras), con protocolo de localizacion oficial, thinking off, greedy y 32 tokens nuevos:

| Modelo | Precision | IC 95% |
|---|---|---|
| MLX bf16 (este modelo) | 78,8% | 76,7 a 80,7 |
| MLX 8bit | 78,6% | 76,5 a 80,5 |
| MLX 4bit | 73,6% | 71,5 a 75,7 |
| MLX mxfp8 | 78,7% | 76,7 a 80,6 |

Segun la model card, bf16, 8-bit y mxfp8 estan dentro de 0,3 puntos entre si (sin diferencia estadistica en test exacto pareado). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

Rendimiento de inferencia (Apple M5 Max, 128 GB, captura 1920x1080, 2221 tokens de prompt, greedy):

| Motor | Tiempo al primer token | Decodificacion | Memoria |
|---|---|---|---|
| MLX, este modelo (bf16) | 227 ms | 275 tok/s | 3,1 GB (pico) |
| transformers, bfloat16, MPS | 331 ms | 137 tok/s | 4,6 GB (pico) |
| llama.cpp (Metal), F16 | 551 ms | 212 tok/s | 2,8 GB (RSS) |

Con prompt multi-imagen largo (3 capturas 1920x1080, aprox. 12k tokens de prompt, 1024 tokens generados): MLX bf16 alcanza 1,0 s al primer token y 238 tok/s de decodificacion con 3,3 GB de pico; llama.cpp (Metal, F16 GGUF) obtiene 2,1 s y 199 tok/s con 2,8 GB (RSS). La model card advierte que las mediciones son indicativas porque la maquina estaba compartida.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 3,1 GB de pico en bf16 para una captura 1080p (medido en MLX); unos 4,6 GB en transformers bf16 sobre MPS. Las variantes 4bit y 8bit reducen el consumo, aunque no se detallan cifras.
- GPU recomendadas: Apple Silicon (M-series) para la version MLX; el modelo original esta pensado para GPUs NVIDIA (A100, H100, RTX 4090) mediante transformers o vLLM, aunque no se aportan cifras de rendimiento para esas plataformas.
- Cabe en GPU de consumo: si, con ~1 GB de pesos en bf16 mas el coste de activaciones y vision; es viable en RTX 4090, RTX 3090 y GPUs con 8 GB o mas.
- Opciones de despliegue: mlx-vlm 0.8.0 (recomendado para esta version), transformers, llama.cpp (Metal) y, presumiblemente, vLLM/TGI para los pesos originales (no confirmado en la informacion disponible).
- Latencia y throughput: 227 ms al primer token y 275 tok/s de decodificacion en M5 Max con MLX bf16; 1,0 s y 238 tok/s en prompt multi-imagen largo. En transformers bf16/MPS, 331 ms y 137 tok/s.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. La model card unicamente compara el propio modelo entre cuantizaciones (bf16, 8bit, 4bit, mxfp8) y entre motores de inferencia (MLX, transformers, llama.cpp). No se aportan cifras de alternativas como Qwen2.5-VL, UI-TARS u otros agentes GUI, por lo que la comparativa con modelos de la misma categoria se marca como no disponible.

| Modelo | Parametros | Contexto | WebClick | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Holo-3.1-0.8B (MLX bf16) | 0,85 B | no disponible | 78,8% | Apache-2.0 | Hugging Face (MLX) |
| Alternativas de agentes GUI | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles (`language: en`); no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion en la localizacion: puede devolver coordenadas plausibles pero incorrectas, especialmente en interfaces densas o con elementos pequenos; se recomienda validacion posterior del clic.
- El benchmark WebClick se evalua con "thinking off" y 32 tokens nuevos; el rendimiento en otros dominios visuales (movil, escritorio, documentos) no esta documentado.
- La cuantizacion a 4bit degrada la precision de localizacion en unos 5,2 puntos (73,6% frente a 78,8%), por lo que en produccion conviene usar bf16, 8bit o mxfp8.
- Las mediciones de velocidad son indicativas: la maquina de pruebas estaba compartida y algunas celdas variaron mas del 10%.
- La model card de esta conversion remite a la del modelo original para detalles; no se incluyen alli datos de sesgos, composicion del dataset ni limitaciones adicionales.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribuir al autor original (H Company).
- Al ser una conversion de pesos, cualquier limitacion del modelo base (Hcompany/Holo-3.1-0.8B) se hereda en esta version.

## Enlaces

- Modelo en Hugging Face (esta version MLX): https://huggingface.co/mlx-community/Holo-3.1-0.8B-bf16
- Modelo base original: https://huggingface.co/Hcompany/Holo-3.1-0.8B
- Web de H Company: https://www.hcompany.ai/
- Dataset WebClick: https://huggingface.co/datasets/Hcompany/WebClick
- Pull request de mejora de velocidad de la torre de vision en mlx-vlm: https://github.com/Neywa-Labs/mlx-vlm/pull/2822
- Libreria mlx-vlm: https://github.com/Blaizzy/mlx-vlm
