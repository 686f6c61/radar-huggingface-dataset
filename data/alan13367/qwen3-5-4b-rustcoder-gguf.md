# alan13367/Qwen3.5-4B-RustCoder-GGUF

## Resumen

Qwen3.5-4B-RustCoder-GGUF es la distribucion en formato GGUF del modelo alan13367/Qwen3.5-4B-RustCoder, un ajuste fino de Qwen/Qwen3.5-4B orientado a la generacion de codigo Rust que compile, pase tests y supere clippy. Lo publica el usuario alan13367 y esta pensado para ejecutarse en llama.cpp y otros runtimes compatibles con GGUF, sin proyector de vision (solo texto). La version 2, publicada el 20 de noviembre de 2026, es una mezcla ponderada de dos ajustes LoRA y mejora en 3,2 puntos la primera entrega.

El modelo conserva el modo thinking del Qwen3.5-4B original y esta especializado en Rust, un lenguaje con un compilador especialmente estricto (prestamos, lifetimes, traits). Con 4.205.751.296 parametros, se posiciona en la gama de modelos pequenos que caben en GPU de consumo, lo que lo hace util para asistentes de codigo locales y pipelines de integracion continua.

La relevancia actual radica en que demuestra que un ajuste fino pequeno y dirigido puede mejorar de forma medible la tasa de exito en tareas de Rust sobre el modelo base, y en que se distribuye con cuantizaciones listas para usar (Q8_0 y Q4_K_M) bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura `qwen35` en llama.cpp), con modo thinking |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el autor recomienda al menos 8192 tokens en inferencia |
| Tipos de cuantizacion | Q8_0 (8,5 bits por peso) y Q4_K_M (5,2 bits por peso) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base tambien se distribuye en bf16 safetensors y MLX 8-bit |

## Arquitectura y entrenamiento

El modelo es un transformer denso de unos 4.200 millones de parametros derivado de Qwen/Qwen3.5-4B. Sobre esa base se aplico un ajuste fino supervisado para generar Rust correcto, con el objetivo de que el codigo compile, pase tests ocultos y quede limpio segun clippy. La version 2 es una mezcla ponderada de dos ajustes LoRA, lo que aporto +3,2 puntos frente a la primera entrega. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO; la model card remite a la ficha del modelo principal para esos datos.

La innovacion principal es la conservacion del modo thinking del modelo base, que el autor recomienda dejar activado: la plantilla de chat piensa por defecto. Las cuantizaciones se generaron con `convert_hf_to_gguf.py` (build b12359) de llama.cpp y `llama-quantize`, sin importance matrix. La perplejidad medida con `llama-perplexity` en fragmentos de 2048 tokens sobre seis respuestas de entrenamiento fue de 1,379 para Q8_0 y 1,387 para Q4_K_M (aproximadamente un 0,6 % superior).

## Capacidades

- Generacion de codigo Rust: el objetivo declarado es producir codigo que compile, pase tests y sea clippy-clean.
- Razonamiento con modo thinking: la plantilla de chat activa el pensamiento por defecto; el autor recomienda no desactivarlo.
- Generacion de texto general y conversacion multi-turno (etiqueta `conversational`).
- Uso sin system prompt: el entrenamiento y la evaluacion se hicieron sin prompt de sistema.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante una API compatible con OpenAI (por ejemplo, `llama-server`).
- Solo texto: no incluye proyector de vision.
- Capacidades multilingues: limitadas al ingles segun la model card; no se documentan otras lenguas.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo Rust en local: el modelo puede generar funciones y modulos Rust en un portatil o estacion de trabajo con GPU de consumo usando el archivo Q4_K_M (2,7 GB), gracias a su tamano reducido y a la cuantizacion agresiva.
- Revision de codigo en integracion continua: integrar el modelo en un pipeline que compile el resultado y reintente con los errores del compilador; el autor reporta que con el compilador en el bucle la tasa de exito sube al 38,9 %, lo que encaja con un paso de validacion automatica.
- Generacion de tests unitarios: el modelo puede proponer tests y, segun el autor, cuando sus propios tests eligen entre 8 respuestas la tasa de exito alcanza el 43,0 %, lo que lo hace util para generar y filtrar candidatos.
- Reparacion de errores de compilacion: dado un mensaje de error de rustc, el modelo puede proponer una correccion; el modo thinking ayuda a razonar sobre lifetimes y prestamos.
- Ensenanza y prototipado de Rust: permite a desarrolladores noveles obtener ejemplos que compilan y pasan clippy, con un coste de hardware bajo.
- Despliegue en entornos sin GPU dedicada: al ser GGUF, puede ejecutarse en CPU con llama.cpp, Ollama o LM Studio, lo que facilita su uso en servidores modestos o en Apple Silicon mediante los otros formatos del modelo base.
- Experimentacion con ajustes finos pequenos: sirve como referencia para investigadores que quieran comparar el efecto de un ajuste fino dirigido sobre un modelo base de 4B.

## Benchmarks y rendimiento

Los resultados se midieron sobre el checkpoint MLX 8-bit, no sobre los archivos GGUF. Tasa de exito en tareas Rust reservadas con tests ocultos, 4 muestras por tarea en cada una de dos ejecuciones, thinking activado y sin system prompt.

| Tasa de exito | Easy (29) | Hard (40) | Quality (29) | Dev (82) | All (180) |
|---|---|---|---|---|---|
| Qwen3.5-4B (8-bit) | 43,5 % | 6,9 % | 8,6 % | 20,1 % | 19,1 % |
| Qwen3.5-4B-RustCoder v2 | 53,0 % | 8,1 % | 15,9 % | 23,6 % | 23,7 % |

Agregado sobre las 180 tareas, la mejora frente al base es de +4,6 puntos (IC 95 %: +1,8 a +7,4). Con el compilador en el bucle (conservar una respuesta que compile y sea clippy-clean, reintentar con los errores) alcanza el 38,9 %, y el 43,0 % cuando sus propios tests unitarios eligen entre 8 respuestas.

| Metrica de cuantizacion | Q8_0 | Q4_K_M |
|---|---|---|
| Bits por peso | 8,5 | 5,2 |
| Tamano | 4,5 GB | 2,7 GB |
| Perplejidad (2048 tokens) | 1,379 | 1,387 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB para Q8_0 y 2,7 GB para Q4_K_M, mas el espacio de contexto y la cache KV.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para Q8_0; para Q4_K_M basta con 4-6 GB. No se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas para Q8_0 y 4 GB o mas para Q4_K_M; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama y LM Studio, siempre que su llama.cpp incluya soporte para la arquitectura `qwen35`. Tambien existe la variante MLX 8-bit para Apple Silicon y bf16 safetensors para transformers.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Configuracion recomendada: sin system prompt, thinking activado, unos 4096 tokens de salida y contexto de al menos 8192, temperatura 0,6, top-p 0,95 y top-k 20.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en Rust (All) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-RustCoder v2 | 4,2 B | no disponible | 23,7 % | Apache 2.0 | GGUF, MLX 8-bit, bf16 |
| Qwen3.5-4B (base) | 4,2 B | no disponible | 19,1 % | Apache 2.0 | safetensors y otros |
| Qwen3.5-4B-RustCoder v1 | 4,2 B | no disponible | no disponible (v2 mejora +3,2 puntos) | Apache 2.0 | revision `9b58a82` |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La tasa de exito global es del 23,7 %, y en tareas dificiles baja al 8,1 %; no es un modelo fiable para generar Rust complejo sin validacion.
- Riesgo de bucles de razonamiento: el autor advierte que una respuesta que llega al limite de tokens suele estar atascada en un bucle, por lo que conviene remuestrear en lugar de ampliar el limite.
- Solo ingles: la model card declara unicamente el idioma ingles, por lo que el rendimiento en castellano no esta garantizado.
- Solo texto: no incluye vision ni audio.
- No se documentan sesgos conocidos ni comportamientos de alucinacion especificos en la informacion disponible.
- Los benchmarks se midieron sobre el checkpoint MLX 8-bit, no sobre los GGUF; el rendimiento real de las cuantizaciones puede diferir ligeramente.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen/Qwen3.5-4B.
- Requiere un build de llama.cpp con soporte para la arquitectura `qwen35`; versiones antiguas no cargaran los archivos.
- El repositorio ocupa 14,4 GB, aunque los archivos individuales son mucho mas pequenos.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/alan13367/Qwen3.5-4B-RustCoder-GGUF
- Modelo base ajustado (bf16 safetensors): https://huggingface.co/alan13367/Qwen3.5-4B-RustCoder
- Version MLX 8-bit: https://huggingface.co/alan13367/Qwen3.5-4B-RustCoder-MLX-8bit
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Revision de la primera entrega: https://huggingface.co/alan13367/Qwen3.5-4B-RustCoder-GGUF/tree/9b58a825f51997d586fafe206e7ca56d34401699
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
