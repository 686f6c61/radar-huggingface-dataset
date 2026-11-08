# 0hmn/gemma-4-e2b-it-tessera-mlx

## Resumen

`0hmn/gemma-4-e2b-it-tessera-mlx` es una cuantizacion MLX en precision mixta del modelo `google/gemma-4-E2B-it`, publicada por el usuario 0hmn para el proponedor de spans sensibles en dispositivo de su proyecto Tessera. No es un modelo nuevo: es un derivado cuantizado que conserva la arquitectura y los pesos del Gemma 4 E2B IT original, pero elimina las torres de vision y audio y aplica una receta de cuantizacion guiada por dano medido (KL contra BF16) en lugar de una receta uniforme.

El resultado son 4.628.569.379 parametros almacenados en 2,30 GB de pesos safetensors, con un formato afín estandar de MLX (grupo de 64, 4 bits por defecto y 152 anulaciones por capa entre 3 y 8 bits). El autor reporta una perplexity de 4,15 frente a 3,91 del BF16 en su conjunto de evaluacion sintetico, y una divergencia KL de 0,087-0,095, muy por debajo de la cuantizacion uniforme de 4 bits de `mlx-community` (KL de 0,449-0,452, perplexity 5,75).

Su relevancia es doble: por un lado demuestra una metodologia de cuantizacion reproducible y medida capa a capa sobre Gemma 4; por otro, ofrece un checkpoint de 2,3 GB que cabe holgadamente en memoria unificada de Apple Silicon (3,04 GB de pico en M3 Max) y mantiene un throughput de generacion de 111,5 tok/s, practicamente identico al de la cuantizacion uniforme de 4 bits pero con mucha menos degradacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B), pesos cuantizados en formato afín MLX; torres de vision y audio eliminadas |
| Parametros totales | 4.628.569.379 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card no la declara; el modelo base Gemma 4 E2B la define en su documentacion) |
| Tipos de cuantizacion | Precision mixta afín MLX: grupo de 64, 4 bits por defecto con 152 anulaciones por capa de 3 a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Gemma 4) |
| Formato de pesos | safetensors (MLX), con `model.safetensors.index.json`; tokenizer y plantilla de chat en JSON/Jinja |

## Arquitectura y entrenamiento

El checkpoint deriva de `google/gemma-4-E2B-it` en la revision `4adf15748de9e1a0097b6274cee9c15836c41c37`, con `model.safetensors` de SHA-256 `2db5482b20d746879bb3ef79b5203e9075a2e2b98f54ec7c2f281c1477ddc550`. No hay reentrenamiento: el autor parte exclusivamente del fichero BF16 y aplica cuantizacion post-entrenamiento. La innovacion esta en el procedimiento. Primero, el modelo en coma flotante recoge el segundo momento de entrada H de cada tabla sobre 68.800 tokens de documentos profesionales ficticios, en texto plano y en el formato de peticiones de propuesta de spans de Tessera. Despues, el redondeo minimiza el error de salida eᵀHe en lugar del error de pesos, mediante minimos cuadrados ponderados por grupo, escalas y sesgos ajustados a bfloat16 y descenso de coordenadas entero sobre codigos y escalas.

Cada una de las 278 tablas se redondea de forma aislada y su dano se mide como KL contra BF16 con activaciones en float32; con activaciones bf16 el autor senala que el modelo es caotico a nivel de KL de 1e-3. Finalmente, un problema de mochila de eleccion multiple reparte el presupuesto de bytes entre tablas de 2, 3, 4, 5, 6 y 8 bits para minimizar el dano total. Los ficheros `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `generation_config.json` y `processor_config.json` se copian de `mlx-community/gemma-4-e2b-it-4bit` en el commit `238767527555cb75a05732a84dff5d6ba0dd6809` para preservar el renderizado de prompts.

## Capacidades

- Generacion de texto conversacional en ingles y otros idiomas del modelo base (los idiomas concretos no estan declarados en la model card).
- Propuesta de spans sensibles en documentos: caso de uso para el que fue calibrada la cuantizacion, con evaluacion sobre un corpus propio de 76 spans.
- Razonamiento y generacion de texto general heredados de Gemma 4 E2B IT, sujetos a la degradacion medida frente a BF16.
- Soporte de plantilla de chat (`chat_template.jinja`) para conversaciones multi-turno.
- Sin capacidades de vision ni audio: las torres correspondientes fueron eliminadas del checkpoint.
- Tool calling y function calling: no documentado en la model card; depende del modelo base y no se verifica en este derivado.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Proposicion de spans sensibles en dispositivo: el checkpoint se diseno para detectar y proponer fragmentos sensibles en documentos dentro de la aplicacion Tessera, con calibracion especifica sobre peticiones de ese dominio y un pico de 3,04 GB en Apple M3 Max.
- Procesamiento de documentos confidenciales en local: al ejecutarse con mlx-lm o mlx-swift-lm sobre Apple Silicon, permite analizar texto que no puede salir del dispositivo, sin depender de APIs externas.
- Clasificacion y anotacion de texto por fragmentos: con prompts de 697 tokens (system prompt mas chunk de 512 tokens) y 128 tokens generados, encaja en pipelines de etiquetado por ventanas deslizantes.
- Asistentes conversacionales embebidos en aplicaciones macOS/iOS: la integracion con mlx-swift-lm permite cargar el modelo sin modificaciones en apps nativas de Apple.
- Prototipado de bajo coste en portatiles Apple: 2,3 GB de pesos y 111,5 tok/s de generacion en M3 Max hacen viable iterar sobre prompts y plantillas sin GPU dedicada.
- Filtrado previo a modelos mayores: usar este checkpoint como primera pasada para marcar spans candidatos y reservar modelos de mayor tamano o en la nube para la verificacion final.
- Investigacion sobre cuantizacion: el checkpoint y su metodologia documentada (segundo momento, minimos cuadrados ponderados, mochila por capas) sirven como referencia reproducible para estudiar el impacto de la precision mixta en modelos de ~4,6B parametros.

## Benchmarks y rendimiento

El autor no publica benchmarks estandar (MMLU, HumanEval, GSM8K). Los datos disponibles son metricas de fidelidad frente a BF16 y de velocidad en hardware concreto.

| Checkpoint | Pesos | KL vs BF16 (set 1) | KL vs BF16 (set 2) | Misma palabra top (set 2) | Perplexity (set 2) |
|---|---|---|---|---|---|
| Uniforme 8 bits | 4,92 GB | 0,005 | 0,005 | 98,1 % | 3,92 |
| Uniforme 6 bits | 3,76 GB | 0,033 | 0,033 | 95,1 % | 3,76 |
| Este checkpoint | 2,30 GB | 0,087 | 0,095 | 91,6 % | 4,15 |
| `mlx-community/gemma-4-e2b-it-4bit` (4 bits uniforme) | 2,60 GB | 0,449 | 0,452 | 81,0 % | 5,75 |
| BF16 (referencia) | no disponible | 0 | 0 | 100 % | 3,91 |

El set 1 son 22.566 posiciones generadas por el modelo de 4 bits uniforme; el set 2, 23.129 posiciones generadas por BF16; se emplearon 16 tipos de documento nunca vistos en el ajuste. La KL se calcula contra BF16 en float32, con activaciones bf16 en los candidatos.

| Checkpoint | Prompt tok/s | Generacion tok/s | Memoria pico |
|---|---|---|---|
| Este checkpoint | 4.430 | 111,5 | 3,04 GB |
| `mlx-community/gemma-4-e2b-it-4bit` (4 bits uniforme) | 4.139 | 113,1 | 3,35 GB |

Medido con mlx-lm 0.32.2 en Apple M3 Max, con system prompt real, chunk de 512 tokens (697 tokens de prompt) y 128 tokens generados, mediana de 3 ejecuciones.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 3,04 GB de pico en Apple M3 Max con mlx-lm 0.32.2 para el escenario de 697 tokens de prompt y 128 de generacion. Los pesos en disco ocupan 2,30 GB.
- GPU recomendadas: Apple Silicon (M-series) es el entorno objetivo, dado el formato MLX. No hay datos publicados para A100, H100 ni RTX 4090, y MLX no esta pensado para CUDA.
- Cabe en GPU de consumo: si, en cualquier Mac con memoria unificada de 8 GB o superior, incluyendo M1/M2/M3/M4 base. No se ha validado en GPUs de consumo con CUDA.
- Opciones de despliegue: mlx-lm (Python) y mlx-swift-lm (Swift), ambos cargan el checkpoint sin modificaciones por usar el formato afín estandar de MLX. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin conversion a otro formato.
- Latencia y throughput: 4.430 tok/s de prefill y 111,5 tok/s de generacion en M3 Max con el escenario descrito. No hay mediciones en otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `0hmn/gemma-4-e2b-it-tessera-mlx` | 4,63 B | no disponible | safetensors MLX (precision mixta) | Apache 2.0 | KL 0,087-0,095; 2,30 GB; 111,5 tok/s en M3 Max |
| `mlx-community/gemma-4-e2b-it-4bit` | no disponible | no disponible | safetensors MLX (4 bits uniforme) | Apache 2.0 | KL 0,449-0,452; 2,60 GB; 113,1 tok/s en M3 Max |
| `google/gemma-4-E2B-it` (BF16) | no disponible | no disponible | safetensors | Apache 2.0 | Referencia de calidad; perplexity 3,91 en set 2; pesos mayores |
| Cuantizacion uniforme 6 bits del mismo base | no disponible | no disponible | safetensors MLX | Apache 2.0 | KL 0,033; 3,76 GB; mejor fidelidad a costa de 1,46 GB mas |

La comparativa con modelos de otros fabricantes del mismo tamano no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo texto: las torres de vision y audio del Gemma 4 E2B IT original fueron eliminadas, por lo que no admite entradas de imagen ni audio.
- La calidad se midio sobre documentos ficticios sinteticos y sobre el corpus de evaluacion de 76 spans de Tessera; no es un benchmark general y no garantiza el comportamiento en otros dominios.
- La decodificacion greedy puede diferir del BF16 en spans individuales, incluso con la KL baja reportada.
- Con activaciones bf16 el modelo es caotico a nivel de KL de 1e-3, segun el propio autor; las comparaciones finas deben hacerse en float32.
- La model card no declara la longitud de contexto efectiva ni los idiomas soportados; hay que remitirse a la documentacion de Gemma 4 E2B.
- No hay datos publicados sobre sesgos, alucinacion o robustez en produccion para este derivado concreto.
- Dependencia de MLX: no se puede ejecutar en CUDA sin conversion previa a otro formato (GGUF, safetensors estandar), lo que anula las ventajas de la receta de cuantizacion si se migra.
- Licencia Apache 2.0 heredada de Gemma 4; el autor enlaza la licencia especifica de Gemma 4 en `https://ai.google.dev/gemma/docs/gemma_4_license`, que conviene revisar antes de un uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de las metricas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0hmn/gemma-4-e2b-it-tessera-mlx
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Cuantizacion de referencia de mlx-community: https://huggingface.co/mlx-community/gemma-4-e2b-it-4bit
- Documentacion de Gemma 4: https://gemma.ai/models/gemma-4/
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
