# manjunathshiva/Qwen3.8-27B-tq3-mini-g64

## Resumen

Qwen3.8-27B-tq3-mini-g64 es una cuantizacion de 3 bits sin datos (data-free) del modelo Qwen/Qwen3.8-27B, publicada por el usuario manjunathshiva mediante la herramienta TurboQuant-MLX. El modelo base es un transformer denso multimodal de 27.800 millones de parametros con una pila de atencion hibrida: 64 capas de decodificador, de las cuales 48 son Gated DeltaNet (atencion lineal) y 16 son atencion completa. Incorpora una torre de vision de 27 bloques y un vocabulario de 248.320 tokens.

El objetivo de esta publicacion es hacer que un modelo de ese tamano quepa en un Apple Silicon Mac de 16 GB de memoria unificada. El resultado ocupa 11,55 GiB en disco frente a los 55,6 GB en bf16, una reduccion de 4,8x. El autor verifica el funcionamiento en un M4 Mac mini real de 16 GB, con picos medidos de 12,95 a 13,61 GiB segun la longitud del prompt.

Es relevante porque demuestra que la cuantizacion agresiva combinada con kernels Metal fusionados permite ejecutar un VLM de casi 28.000 millones de parametros en hardware de gama de entrada, a costa de un aumento del 10,4 % en perplejidad y una velocidad de decodificacion muy limitada (3,6-3,9 tok/s). El autor recomienda explicitamente la variante de 4 bits si se dispone de mas de 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 64 capas (48 Gated DeltaNet de atencion lineal + 16 de atencion completa), torre de vision de 27 bloques |
| Parametros totales | 3.405.929.776 (segun safetensors del repo cuantizado); modelo base declarado como 27,8B denso |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; se han probado prompts de hasta 5.017 tokens |
| Tipos de cuantizacion | 3 bits con grupo de 64 (turboquant tq3-g64); existe variante de 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, libreria MLX |
| Tamano en disco | 11,55 GiB (12,4 GB) |
| Tamano del repo | 12,4 GB |
| Pipeline | image-text-to-text (multimodal) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida que combina 48 capas de Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente, con 16 capas de atencion completa. Esta mezcla reduce el coste del cache KV: segun el planificador del autor, el cache consume 64,0 KB por token gracias a que solo 16 de las 64 capas mantienen atencion completa. La torre de vision consta de 27 bloques y el vocabulario alcanza los 248.320 tokens.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible (numero de tokens, composicion del dataset, uso de RLHF o DPO). La publicacion que nos ocupa es exclusivamente un proceso de cuantizacion post-entrenamiento: TurboQuant aplica cuantizacion de 3 bits sin datos de calibracion, con grupos de 64 elementos, y los pesos resultantes se ejecutan mediante kernels Metal fusionados que no materializan tensores intermedios. El autor indica que mantener el tamano de paso de prefill en 256 es obligatorio para que todas las capas TurboQuant permanezcan en el kernel fusionado.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagen y texto combinados (image-text-to-text), con una bateria de vision que el autor reporta como 4 sobre 4 usando un presupuesto de tamano de imagen.
- Razonamiento agéntico multi-paso: el autor verifica el bucle de Opencode (observar, leer, editar, verificar) con resultado 4 sobre 4 en maquinas de 24 GB o mas.
- Soporte de tool calling y function calling a traves de la pila agéntica evaluada (Opencode).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento o thinking: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente de codigo local en Mac: el modelo completa el bucle agéntico de Opencode (observar, leer, editar, verificar) en equipos de 24 GB o mas, lo que permite usarlo como agente de edicion de codigo sin conexion a servicios en la nube, con la salvedad de que en 16 GB el bucle falla (0 de 4).
- Procesamiento de documentos con imagenes en portatiles Apple Silicon: al ser un VLM con torre de vision de 27 bloques, puede extraer texto y describir figuras de capturas, diagramas o PDFs renderizados, siempre que se aplique un presupuesto de tamano de imagen para no exceder el pico de memoria medido.
- Analisis de imagenes en el borde sin GPU dedicada: un M4 Mac mini de 16 GB puede ejecutar inferencia multimodal con picos de 12,95 a 13,61 GiB, lo que habilita prototipos de vision por computador en hardware de bajo coste.
- Prototipado e investigacion de cuantizacion: sirve como referencia reproducible para estudiar el impacto de 3 bits frente a 4 bits en un modelo denso de 27,8B, con una penalizacion de perplejidad documentada del 10,4 %.
- Servicio de API compatible con OpenAI en red local: el autor documenta una guia para servir el modelo mediante turboquant-mlx, lo que permite exponerlo a herramientas internas en una LAN sin depender de proveedores externos.
- Evaluacion de agentes de codigo en hardware limitado: util para medir donde falla un agente cuando la memoria es escasa, ya que el mismo conjunto de pesos pasa de 0 de 4 a 4 de 4 al migrar de 16 GB a una maquina mayor.
- Educacion y demos offline: permite mostrar un VLM de gran tamano en un portatil sin conexion, aceptando la latencia de 3,6-3,9 tok/s en decodificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento proporcionados son mediciones de memoria y velocidad en hardware Apple Silicon:

| Metrica | 16 GB M4 mini | 64 GB M4 Max |
|---|---|---|
| Prefill (tok/s) | 19-21 | ~81 |
| Decodificacion (tok/s) | 3,6-3,9 | ~12,8 |
| Pico de memoria, prompt de 220 tok | 12,95 GiB | 13,22 GiB |
| Pico de memoria, prompt de 818 tok | 12,96 GiB | 13,05 GiB |
| Pico de memoria, prompt de 2.014 tok | 13,14 GiB | 13,30 GiB |
| Pico de memoria, prompt de 5.017 tok | 13,61 GiB | 13,81 GiB |
| Bucle agéntico Opencode | 0 de 4 | 4 de 4 (en maquina de 24 GB o mas) |
| Bateria de vision | 4 de 4 | no disponible |

Penalizacion de calidad frente a la variante de 4 bits: +10,4 % de perplejidad a cambio de 3,6 GiB de ahorro.

## Requisitos de hardware

- VRAM o memoria unificada: 11,55 GiB de pesos en disco; pico medido de 12,95 a 13,61 GiB con prompts de 220 a 5.017 tokens.
- En un Mac de 16 GB es obligatorio elevar el limite de memoria cableada de Metal: `sudo sysctl -w iogpu.wired_limit_mb=14336` (se reinicia tras cada arranque).
- Es obligatorio usar `--prefill-step-size 256`; el valor por defecto de 2048 necesita 3,30 GB de espacio de trabajo transitorio frente a 0,10 GB.
- GPU recomendadas: Apple Silicon M4 (16 GB verificado), M4 Max (64 GB verificado). En 24 GB o mas funciona el bucle agéntico.
- No cabe en GPU consumer NVIDIA de 8 o 12 GB; el formato es MLX, por lo que solo se ejecuta en Apple Silicon.
- Despliegue: `pip install "turboquant-mlx-full[vlm]>=0.25.0"` y `python -m turboquant_mlx.generate_vlm`. Tambien existe una guia para servir una API compatible con OpenAI.
- Latencia y throughput: prefill de 19-21 tok/s y decodificacion de 3,6-3,9 tok/s en el M4 mini de 16 GB; prefill de ~81 tok/s y decodificacion de ~12,8 tok/s en el M4 Max de 64 GB. La relacion de 3,9x en prefill se atribuye al numero de nucleos de GPU, no a la cuantizacion.
- Cerrar otras aplicaciones antes de prompts largos: con 0,39 GiB de margen, el primer arranque tras el encendido es el momento mas ajustado.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Memoria en disco | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-tq3-mini-g64 (este) | 27,8B denso (3,4B en safetensors del repo) | 3 bits, grupo 64 | 11,55 GiB | no disponible | Apache 2.0 | Apple Silicon, desde 16 GB |
| Qwen3.8-27B-tq4-g64 (mismo autor) | 27,8B denso | 4 bits, grupo 64 | ~15,2 GiB (inferido del ahorro de 3,6 GiB) | no disponible | Apache 2.0 | Apple Silicon, desde 24 GB |
| Qwen/Qwen3.8-27B (base) | 27,8B denso | bf16 | 55,6 GB | no disponible | Apache 2.0 | GPU o Mac de alta memoria |
| Muse-Glimmer-30B-tq3-g64 (mismo autor) | 30B | 3 bits, grupo 64 | no disponible | no disponible | no disponible | Apple Silicon |

La ventaja de esta variante frente a la de 4 bits es el menor consumo de memoria; la desventaja, el 10,4 % adicional de perplejidad y la perdida del bucle agéntico en equipos de 16 GB.

## Limitaciones y advertencias

- Perdida de calidad medible: +10,4 % de perplejidad frente a la cuantizacion de 4 bits. El autor recomienda la variante de 4 bits si hay mas de 16 GB de memoria.
- El bucle agéntico no funciona en 16 GB: 0 de 4 frente a 4 de 4 en una maquina mayor con los mismos pesos.
- Velocidad de decodificacion muy baja en el M4 mini de 16 GB (3,6-3,9 tok/s), lo que limita su uso interactivo.
- Margen de memoria estrecho: 0,39 GiB de holgura con prompts de 5.017 tokens; es necesario cerrar aplicaciones y ajustar el limite de Metal en cada arranque.
- Requiere configuracion no opcional (`iogpu.wired_limit_mb=14336` y `--prefill-step-size 256`); omitirlas provoca fallos en prompts largos.
- Dependencia exclusiva de Apple Silicon y de la libreria MLX; no hay ruta de despliegue en CUDA, vLLM, llama.cpp ni Ollama documentada.
- La cuantizacion es data-free, sin calibracion, lo que puede afectar de forma desigual a distintas capas.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones especificas en la informacion disponible.
- Idiomas soportados no declarados; no se puede garantizar calidad multilingue.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base debe verificarse por separado.
- Los numeros de parametros del repo cuantizado (3.405.929.776) no coinciden con el tamano declarado del modelo base (27,8B); conviene tratarlos como metadatos del checkpoint cuantizado, no como el total real de parametros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manjunathshiva/Qwen3.8-27B-tq3-mini-g64
- Variante de 4 bits: https://huggingface.co/manjunathshiva/Qwen3.8-27B-tq4-g64
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio TurboQuant-MLX: https://github.com/manjunathshiva/turboquant-mlx
- Documentacion: https://manjunathshiva.github.io/turboquant-mlx/
- Pagina del modelo Qwen3.8-27B en la documentacion: https://manjunathshiva.github.io/turboquant-mlx/model-pages/qwen38-27b/
- Guia de inicio: https://manjunathshiva.github.io/turboquant-mlx/getting-started/
- Guia de seleccion de modelo por memoria: https://manjunathshiva.github.io/turboquant-mlx/models/
- Guia para servir una API compatible con OpenAI: https://manjunathshiva.github.io/turboquant-mlx/guides/serve/
- Guia de agentes de codigo locales: https://manjunathshiva.github.io/turboquant-mlx/guides/coding-agents/
- Guia de modelos de vision: https://manjunathshiva.github.io/turboquant-mlx/guides/vision/
- Guia de memoria y ajustes de macOS: https://manjunathshiva.github.io/turboquant-mlx/guides/memory/
- Modelo relacionado Muse Glimmer: https://huggingface.co/manjunathshiva/Muse-Glimmer-30B-tq3-g64
