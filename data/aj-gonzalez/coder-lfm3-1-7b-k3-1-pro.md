# AJ-Gonzalez/coder-lfm3-1.7b-k3.1-pro

## Resumen

coder-lfm3-1.7b-k3.1-pro es un ajuste fino (LoRA fusionado) del modelo LiquidAI/LFM3-1.7B, desarrollado por AJ-Gonzalez, orientado a generacion de codigo y razonamiento tecnico. El modelo se entrena por destilacion a partir de trazas generadas por moonshotai/kimi-k3.1-pro, un profesor de mayor capacidad, sobre un corpus de prompts de programacion y ciencias de la computacion. El objetivo es trasladar a un modelo pequeno (1.700 millones de parametros) el patron de razonamiento normativo extenso seguido de una implementacion en bloque de codigo.

La relevancia del modelo reside en su eficiencia: con 1,728 mil millones de parametros, se distribuye en formato MLX de 4 bits (946 MB) y en GGUF Q4_K_M (1,1 GB), lo que permite ejecucion completamente local en hardware de consumo, incluido un navegador mediante llama.cpp compilado a WebAssembly. El modelo base LFM3-1.7B aporta la plantilla de chat y el comportamiento de razonamiento destilado, con el scratchpad separado en el campo `reasoning_content`.

El ajuste emplea un adaptador LoRA de rango 8 sobre 8 capas, con 2,753 millones de parametros entrenables (0,159% del total), entrenado durante 3 epocas sobre 289 fragmentos de entrenamiento y 34 de validacion, con una perdida de validacion final de 2,438.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM3 de LiquidAI), ajuste LoRA fusionado |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (fragmentacion de entrenamiento a 2048 tokens) |
| Tipos de cuantizacion | MLX 4-bit (4,503 bits/peso), GGUF Q4_K_M (5,05 bits/peso), bf16 fusionado regenerable |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | safetensors (MLX 4-bit), GGUF, adaptadores safetensors |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer de 1.700 millones de parametros convertido a MLX en 4 bits. Sobre esa base se entrena un adaptador LoRA de rango 8 aplicado a 8 capas, con 2.753.000 parametros entrenables (0,159% del total). El entrenamiento usa fragmentacion de 2048 tokens con 256 tokens de solapamiento y un ejemplo por fragmento, batch de 1, optimizador Adam con tasa de aprendizaje 1e-5, durante 3 epocas (867 iteraciones) con guardado y evaluacion cada 289 iteraciones. Se emplea checkpointing de gradientes, obligatorio a secuencia 2048 en 8 GB de memoria, con un tiempo total de 2,96 horas en un Apple M1 de 8 GB.

Los datos provienen del dataset AJ-Gonzalez/coder-kimi-k3.1-pro-lfm3, compuesto por 69 filas que se transforman en 289 fragmentos de entrenamiento y 34 de validacion. Las trazas del profesor (kimi-k3.1-pro via OpenRouter) consisten en razonamiento normativo extenso seguido de una implementacion en bloque de codigo; el adaptador desplaza el comportamiento de LFM3 hacia esa forma para prompts de codigo y ciencias de la computacion. La perdida de validacion evoluciono de 2,861 a 2,581, 2,594 y 2,438 en la ultima epoca, que fue la mejor y por tanto la conservada en `adapters/adapters.safetensors`. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de codigo en Python y otros lenguajes, con docstrings y estructuras de control complejas.
- Razonamiento de multiples pasos con scratchpad separado en el campo `reasoning_content`.
- Autocorreccion de borradores: la model card muestra una traza que corrige un primer intento defectuoso.
- Razonamiento normativo extenso previo a la implementacion, heredado de la destilacion del profesor.
- Capacidad de desactivar el modo de razonamiento mediante `enable_thinking=false` en la plantilla de chat.
- Ejecucion local en CPU, GPU Apple Silicon y navegador via WebAssembly.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistente de codigo en local sin conexion: el modelo se ejecuta con mlx_lm o llama.cpp en un portatil con Apple Silicon, generando funciones completas con docstrings a 46-48 tok/s en M1 de 8 GB y 1,19 GB de pico de memoria, lo que permite trabajar sin enviar codigo a servicios externos.
- Generacion de codigo en el navegador: el GGUF Q4_K_M corre en una pagina estatica con llama.cpp compilado a WebAssembly, sin GPU ni instalacion, a 15,4 tok/s en un M1 Pro, adecuado para demos interactivas o entornos con restricciones de instalacion.
- Prototipado rapido de funciones auxiliares: para prompts como "escribe una funcion Python que devuelva los 12 primeros primos", el modelo produce implementaciones correctas con razonamiento previo, util en cuadernos de experimentacion y scripts de un solo uso.
- Ensenanza de programacion: la traza de razonamiento separada permite mostrar al estudiante el proceso de derivacion y autocorreccion, no solo el resultado final, con la salvedad de que el cliente debe renderizar `reasoning_content`.
- Generacion de codigo en pipelines de CI/CD: con un presupuesto de 1500 o mas tokens por generacion, el modelo puede producir parches y funciones en un runner con CPU, aunque su tamano limita la complejidad de las tareas abordables.
- Evaluacion de destilacion y ajuste fino: el par adaptador (11 MB) y pesos fusionados permite reproducir el entrenamiento y experimentar con re-fusionado o entrenamiento adicional sobre el mismo corpus, con un coste de 2,96 horas en hardware de consumo.
- Despliegue en entornos con memoria limitada: el formato MLX 4-bit de 946 MB y el GGUF de 1,1 GB caben en dispositivos con 8 GB de RAM, habilitando asistentes de codigo en equipos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento medidos son de velocidad de inferencia y memoria:

| Medicion | Entorno | Resultado |
|---|---|---|
| Decodificacion (MLX 4-bit) | Apple M1, 8 GB | 46-48 tok/s |
| Memoria pico (MLX 4-bit) | Apple M1, 8 GB | 1,19 GB |
| Decodificacion (GGUF Q4_K_M) | Apple M1, smoke de 96 tokens | ~37,6 tok/s |
| Decodificacion (WASM, navegador) | Apple M1 Pro, 16 GB, Chrome | 15,4 tok/s sobre 93 tokens (15-18 tok/s segun prompt) |
| Descarga en frio + init (1,1 GB) | Navegador, Chrome | 41,9 s |
| Primer token (procesamiento de prompt en WASM) | Navegador, Chrome | 5,9 s |
| Perdida de validacion final | Entrenamiento | 2,438 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,19 GB de pico en MLX 4-bit y alrededor de 1,1 GB para el GGUF Q4_K_M.
- GPU recomendadas: Apple Silicon (M1, M1 Pro y superiores) para MLX; cualquier CPU x86 o ARM para llama.cpp; no se documentan requisitos de GPU NVIDIA.
- Cabe en GPU de consumo: si, en equipos con 8 GB de memoria unificada o RAM, como el Apple M1 de 8 GB usado en el entrenamiento e inferencia.
- Opciones de despliegue: mlx_lm (generacion y fusion), llama.cpp (llama-cli, llama-quantize), llama.cpp compilado a WebAssembly para navegador. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: 46-48 tok/s en MLX sobre M1; ~37,6 tok/s en llama.cpp sobre M1 con smoke de 96 tokens; 15,4 tok/s en WASM en navegador; 5,9 s hasta el primer token en WASM con prompt corto.
- Advertencia de rendimiento: la forma del prompt importa mas que el tamano del modelo; prompts que activan razonamiento largo pueden consumir 512 tokens sin producir respuesta, por lo que se recomienda un presupuesto de 1500 o mas tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| coder-lfm3-1.7b-k3.1-pro | 1,73 B | no disponible | LFM Open License v1.0 | safetensors MLX, GGUF | Destilado de kimi-k3.1-pro, razonamiento separado |
| LiquidAI/LFM3-1.7B | 1,7 B | no disponible | LFM Open License v1.0 | safetensors, GGUF | Modelo base sin ajuste de codigo |
| Alternativas de ~1-2 B para codigo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoria. La comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- El corpus de entrenamiento es muy reducido (69 filas, 289 fragmentos), lo que limita la generalizacion a dominios distintos de los prompts de codigo y ciencias de la computacion.
- Riesgo de alucinacion en APIs, librerias y funciones inexistentes, especialmente fuera del alcance del corpus de destilacion.
- El razonamiento puede consumir el presupuesto de tokens sin producir respuesta: con un limite de 256 tokens, ciertos prompts no devuelven nada; se recomienda 1500 o mas tokens.
- Los clientes que renderizan solo el campo `content` muestran una burbuja vacia cuando el modelo activa el razonamiento; es un problema de interfaz, no del modelo.
- Idiomas soportados no documentados; el corpus y las trazas estan en ingles, por lo que el rendimiento en castellano no esta verificado.
- Longitud de contexto no documentada; el entrenamiento usa fragmentos de 2048 tokens, lo que sugiere un limite practico en ese entorno.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos para uso comercial, ya que se trata de una licencia "other" con nombre especifico y no una licencia permisiva estandar.
- El modelo bf16 fusionado no se incluye en el repositorio; debe regenerarse con `mlx_lm.fuse` para re-cuantizar o reentrenar.
- Las mediciones en navegador son de un unico hilo (sin cabeceras COOP/COEP) y no representan el rendimiento de una build multihilo.
- El ajuste LoRA tiene rango 8 y solo 8 capas afectadas, lo que puede limitar la magnitud del cambio de comportamiento respecto al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AJ-Gonzalez/coder-lfm3-1.7b-k3.1-pro
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/AJ-Gonzalez/coder-kimi-k3.1-pro-lfm3
- Gist del generador de corpus: https://gist.github.com/AJ-Gonzalez/31f1f8cfe45c233911e055d5cfed6da0
- Space de runtime GGUF en navegador: https://huggingface.co/spaces/abderrahmane11/gguf-runtime
