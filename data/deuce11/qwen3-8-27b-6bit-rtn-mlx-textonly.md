# deuce11/Qwen3.8-27B-6bit-RTN-MLX-TextOnly

## Resumen

Qwen3.8-27B-6bit-RTN-MLX-TextOnly es una cuantizacion de 6 bits del modelo Qwen/Qwen3.8-27B, publicada por el usuario de Hugging Face deuce11. Se trata de un checkpoint en formato MLX (Apple Silicon) obtenido mediante cuantizacion afina RTN (round-to-nearest) con tamano de grupo 64, a partir del modelo de 8 bits de la comunidad (`mlx-community/Qwen3.8-27B-8bit`) dequantizado y re-cuantizado con mlx-lm 0.32.2. El resultado ocupa 21,86 GB en 21 shards y contiene 26.895.993.856 parametros.

La particularidad principal es que los pesos son "text only": la torre de vision del modelo base no esta incluida, aunque el `config.json` mantiene `language_model_only: false`, por lo que requiere servirse con la opcion `--language-only` de Splash. El autor documenta que un pase de DWQ (data-aware weight quantization) sobre este estudiante incremento la perdida de validacion respecto al checkpoint RTN puro, por lo que los pesos publicados son la instantanea round-to-nearest sin escalas entrenadas.

Es relevante para desarrolladores que trabajan en inferencia local sobre Apple Silicon: ofrece un punto intermedio entre las cuantizaciones de 4 y 8 bits, con un tamano manejable (21,9 GB) y metricas de rendimiento medidas en un M5 Max con 36 GB de memoria unificada. La licencia del modelo base es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 26.895.993.856 (26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128K tokens (ventana usada en las pruebas de rendimiento); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | 6 bits afina, group size 64, RTN (round-to-nearest); sin escalas entrenadas |
| Idiomas soportados | en (segun model card y tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 21 shards, 21,86 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer de la familia Qwen3.5 con 26,9 mil millones de parametros. La model card no aporta detalles sobre la composicion del dataset de preentrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO en el modelo original; esa informacion no esta disponible en la documentacion proporcionada.

El proceso de cuantizacion es el siguiente: se parte del checkpoint de 8 bits de `mlx-community/Qwen3.8-27B-8bit`, se dequantiza y se vuelve a cuantizar con mlx-lm 0.32.2 a 6 bits, group size 64, en modo afina. Los enteros empaquetados son una instantanea round-to-nearest, sin escalas entrenadas. El autor probo un pase de DWQ (destilacion de pesos) sobre ese estudiante con la misma receta tulu-3 que uso en su ejecucion de 3 bits, pero la perdida de validacion empeoro, por lo que descarto esos pesos. La validacion se hizo sobre 32 filas reservadas de `allenai/tulu-3-sft-mixture` con longitud maxima de 512 tokens, comparando contra el profesor de 8 bits: la perdida del checkpoint RTN publicado es 0,005, frente a 0,071 con DWQ a learning rate 1e-6 y 1,736 a 1e-5 (ambos en el paso 511). mlx-lm advirtio de que 0,071 era peor que el 0,005 inicial.

## Capacidades

- Generacion de texto conversacional y continuacion de texto (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generacion de codigo: las pruebas de rendimiento del autor distinguen entre prompts de prosa y de codigo, con velocidades de decodificacion notablemente distintas (99,2 tok/s en codigo frente a 34,2 tok/s en prosa a 4k), lo que sugiere un comportamiento diferenciado por dominio.
- Modo thinking: la model card menciona que las pruebas se hicieron con "thinking off", lo que implica que el modelo base soporta un modo de razonamiento explicito que puede activarse.
- Decodificacion especulativa: el autor reporta tasas de aceptacion de drafts (22 % y 87 % a 4k; 27 % y 82 % a 64k) con DFlash2 activado, lo que indica compatibilidad con tecnicas de decodificacion especulativa.
- Capacidades multilingues: limitadas a ingles segun la model card y los tags (`language: en`). No se documentan otros idiomas.
- Vision: no disponible en este checkpoint; la torre de vision ha sido eliminada de los pesos.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el modo thinking y la ventana de 128K son compatibles con flujos agenticos.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta pensado para ejecutarse con MLX y Splash en equipos con memoria unificada suficiente (el autor lo prueba en un M5 Max con 36 GB). Es adecuado para desarrolladores que quieren un modelo de ~27B en local sin depender de GPUs dedicadas.
- Asistente de programacion en el portatil: con decodificacion de 99,2 tok/s en prompts de codigo a 4k y 83,4 tok/s a 64k, el modelo es viable para autocompletado y generacion de codigo interactiva en un entorno de desarrollo local.
- Procesamiento de documentos largos: la ventana de 128K permite resumir o extraer informacion de contratos, informes o bases de codigo extensas, aunque el TTFT de 88,6 s a 64k impone un coste inicial alto que conviene amortizar con cache de prefijo.
- Prototipado de pipelines de generacion de texto: al ser un checkpoint MLX con licencia Apache 2.0, sirve para experimentar con cuantizaciones, decodificacion especulativa y tecnicas de serving antes de pasar a produccion.
- Evaluacion de calidad de cuantizacion: el modelo incluye una tabla de perdida de validacion frente al profesor de 8 bits, util para equipos que investigan el impacto de RTN frente a DWQ en modelos de ~27B.
- Chat conversacional de un solo idioma: para productos o herramientas internas en ingles donde se requiera un modelo local sin coste de API y con contexto largo.
- Servicio con cache en memoria limitada: con un uso de memoria de 25,3-27,5 GB en Splash (pico de 28,1 GB) y sin crecimiento de swap, encaja en estaciones de trabajo de 32-36 GB de memoria unificada.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.). La informacion disponible incluye unicamente perdida de validacion y metricas de inferencia.

Perdida de validacion frente al profesor de 8 bits (32 filas de `allenai/tulu-3-sft-mixture`, max seq 512):

| Pesos | Loss |
|---|---:|
| Este checkpoint (round-to-nearest) | 0,005 |
| DWQ, lr 1e-6, paso 511 | 0,071 |
| DWQ, lr 1e-5, paso 511 | 1,736 |

Rendimiento en Splash 1.3.1 sobre M5 Max (32 nucleos GPU, 36 GB, KV int8, thinking off, DFlash2 on, ventana 128K, cache fria, 128 tokens nuevos):

| Metrica | 4k prosa | 4k codigo | 64k prosa | 64k codigo |
|---|---:|---:|---:|---:|
| Prefill (tok/s) | 911 | 989 | 740 | 739 |
| Decode (tok/s) | 34,2 | 99,2 | 34,7 | 83,4 |
| TTFT | 4,5 s | 4,1 s | 88,6 s | 88,7 s |

Tasa de aceptacion de drafts: 22 % y 87 % a 4k; 27 % y 82 % a 64k. Memoria de Splash: 25,3 GB y 25,6 GB a 4k; 27,5 GB a 64k; pico de 28,1 GB; sin crecimiento de swap.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el autor reporta 25,3-27,5 GB de uso en Splash con KV int8 y ventana de 128K, con pico de 28,1 GB. Para ventanas mas cortas el consumo sera menor; para ventanas de 128K conviene disponer de al menos 32 GB.
- GPU recomendadas: Apple Silicon con memoria unificada de 32 GB o superior. El autor valida en un M5 Max de 36 GB con 32 nucleos GPU. No se documentan pruebas en GPUs NVIDIA (A100, H100, RTX 4090) porque el formato es MLX.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de gama alta (M-series Max/Ultra con 32 GB o mas). No es un formato compatible con GPUs NVIDIA de consumo sin conversion previa.
- Opciones de despliegue: MLX y Splash (con `--language-only` obligatorio por la ausencia de la torre de vision). El autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un checkpoint MLX, requeriria conversion a GGUF u otros formatos para esas herramientas.
- Latencia y throughput: prefill de 740-989 tok/s, decodificacion de 34,2-99,2 tok/s segun dominio y longitud de contexto, TTFT de 4,1-4,5 s a 4k y de 88,6-88,7 s a 64k en el hardware indicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| deuce11/Qwen3.8-27B-6bit-RTN-MLX-TextOnly | 26,9 B | 128K (probado) | 6 bits RTN, group 64 | Apache 2.0 | safetensors MLX | Solo texto; perdida 0,005 frente al profesor 8 bits |
| mlx-community/Qwen3.8-27B-8bit | 26,9 B (base) | no disponible | 8 bits | Apache 2.0 (base) | MLX | Profesor de la cuantizacion; mayor tamano y presumiblemente mayor fidelidad |
| Qwen/Qwen3.8-27B (base) | 26,9 B | no disponible | sin cuantizar | Apache 2.0 | safetensors | Incluye torre de vision; requiere mas memoria |

No se dispone de datos de benchmarks comparativos con otras familias de modelos del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Solo texto: la torre de vision ha sido eliminada de los pesos, aunque `config.json` mantiene `language_model_only: false`. Es obligatorio servir con `--language-only` en Splash; de lo contrario el modelo puede fallar o comportarse de forma inesperada.
- Solo ingles: la model card y los tags declaran unicamente `en`. El rendimiento en castellano u otros idiomas no esta documentado y probablemente sea degradado.
- Cuantizacion sin escalas entrenadas: los pesos son una instantanea RTN pura. El autor probo DWQ y obtuvo peor perdida de validacion, pero la validacion se limita a 32 filas de un unico dataset (tulu-3-sft-mixture) con secuencias de 512 tokens; la fidelidad en contextos largos o dominios especializados no esta evaluada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de los modelos generativos de ~27B.
- Sesgos: no documentados por el autor. Al ser una cuantizacion de un modelo base entrenado principalmente en ingles, hereda los sesgos del modelo original, que no se detallan.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.8-27B y las condiciones de los datos de validacion utilizados.
- Formato propietario de Apple: al ser un checkpoint MLX, no es directamente desplegable en infraestructura NVIDIA sin conversion. El soporte de herramientas de serving es limitado (MLX y Splash).
- Rendimiento dependiente del dominio: la decodificacion en prosa es aproximadamente tres veces mas lenta que en codigo (34,2 frente a 99,2 tok/s a 4k), lo que puede afectar a aplicaciones conversacionales.
- TTFT elevado en contexto largo: 88,6 s a 64k con cache fria hace inviable el uso interactivo sin cache de prefijo o ventanas mas cortas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deuce11/Qwen3.8-27B-6bit-RTN-MLX-TextOnly
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint de 8 bits usado como profesor: https://huggingface.co/mlx-community/Qwen3.8-27B-8bit
- Dataset de validacion: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Splash (servidor MLX): no disponible enlace directo en la informacion proporcionada
