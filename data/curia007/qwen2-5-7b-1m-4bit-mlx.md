# curia007/Qwen2.5-7B-1M-4bit-mlx

## Resumen

`curia007/Qwen2.5-7B-1M-4bit-mlx` es una conversion no oficial del modelo `Qwen/Qwen2.5-7B-Instruct-1M` al formato MLX de Apple, cuantizada a 4 bits. El modelo base es un transformer decoder-only de Qwen (Alibaba) con 7.615.616.512 parametros, ajustado para instrucciones y con una ventana de contexto extendida a 1 millon de tokens. Esta version la publica el usuario curia007 y esta pensada para ejecutarse en hardware Apple Silicon mediante la libreria mlx-lm (version 0.29.1 usada en la conversion).

Su relevancia practica es doble: por un lado, permite ejecutar un modelo de 7B con contexto de 1M en Macs con memoria unificada, algo inviable en la mayoria de GPUs de consumo con cuantizaciones de 16 bits; por otro, al ser una cuantizacion 4-bit, reduce el peso del repositorio a unos 4,3 GB, lo que facilita su despliegue local en portatiles y equipos de sobremesa de Apple.

No obstante, es un artefacto derivado: no aporta entrenamiento propio ni benchmarks publicados, y su calidad depende enteramente del modelo base. La model card es minima y no documenta evaluaciones, sesgos ni limitaciones adicionales a las del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), segun el modelo base |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.000.000 tokens (heredado del modelo base Instruct-1M) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | en (segun model card y tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen2.5-7B-Instruct-1M: un transformer decoder-only con atencion por grupos (GQA), RoPE y las optimizaciones propias de la familia Qwen2.5. El modelo original fue entrenado por Qwen con un corpus multilingue y posteriormente ajustado por instrucciones y preferencias (SFT y optimizacion de preferencias), aunque la informacion disponible en esta ficha no detalla el numero exacto de tokens ni la composicion del dataset. La variante "1M" del modelo base incorpora tecnicas de extension de contexto (como YaRN o ajustes equivalentes) para alcanzar 1.000.000 de tokens de ventana.

Esta publicacion concreta no entrena nada: es una conversion de pesos a MLX y una cuantizacion a 4 bits realizada con mlx-lm 0.29.1. Por tanto, no hay innovaciones tecnicas propias del autor; la unica aportacion es el empaquetado para Apple Silicon y la reduccion de huella de memoria. La cuantizacion 4-bit puede introducir degradacion en tareas sensibles a precision (matematicas, codigo, recuperacion exacta en contexto largo), no cuantificada en la model card.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat compatible con `tokenizer.apply_chat_template`.
- Razonamiento multi-turno y seguimiento de instrucciones, heredado del ajuste Instruct del modelo base.
- Procesamiento de contexto muy largo (hasta 1M tokens) para resumen, recuperacion y analisis de documentos extensos.
- Generacion de codigo y matematicas basicas, aunque sin benchmarks publicados para esta cuantizacion.
- Soporte de tool calling / function calling segun las capacidades del modelo base Qwen2.5-7B-Instruct-1M (no verificado en esta conversion).
- Capacidades multilingues limitadas en la practica al ingles segun la model card, aunque el modelo base soporta mas idiomas.
- Ejecucion local en Apple Silicon mediante mlx-lm.

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M de tokens de contexto se pueden cargar cientos de ficheros en una sola pasada para tareas de revision, resumen o busqueda semantica, ejecutando el modelo en un Mac con memoria unificada suficiente.
- Procesamiento de documentacion legal o contractual: permite introducir contratos completos y hacer preguntas cruzadas sobre clausulas sin trocear el texto, reduciendo perdida de contexto entre fragmentos.
- Asistente de desarrollo local en portatiles Apple: integrable en editores o terminales via mlx-lm, con un peso de 4,3 GB que cabe en equipos de 16 GB de memoria unificada.
- Resumen de transcripciones o actas muy largas: reuniones de varias horas o libros completos pueden procesarse en una sola ventana, util para equipos que trabajan con audio transcrito.
- Prototipado de agentes conversacionales en local: la plantilla de chat y el formato MLX permiten iterar rapidamente en un Mac sin depender de APIs externas.
- Investigacion sobre cuantizacion y contexto largo: sirve como banco de pruebas para medir la degradacion de un modelo 7B a 4 bits con ventanas de 1M en hardware de consumo.
- Generacion de codigo en pipelines locales: puede integrarse en scripts de automatizacion para generar tests o documentacion a partir de ficheros fuente, siempre que el equipo tenga memoria suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 4,3 GB en 4-bit; en ejecucion se necesita ademas memoria para el contexto KV, que crece linealmente con la longitud de la ventana. Con 1M de tokens el coste de KV cache es muy elevado y en la practica limita el uso real a ventanas mucho menores en equipos de consumo.
- GPU recomendadas: no aplica GPU dedicada; el formato MLX esta disenado para Apple Silicon (series M1, M2, M3, M4 y variantes Pro/Max/Ultra).
- Cabe en GPU de consumo: si, en Macs con memoria unificada de 16 GB o superior para contextos moderados; para ventanas cercanas a 1M se requiere memoria unificada muy alta (64 GB o mas) y aun asi puede no ser viable.
- Opciones de despliegue: mlx-lm (libreria oficial de Apple), con soporte de carga directa desde Hugging Face. No es compatible con vLLM, llama.cpp, Ollama o TGI en su formato actual.
- Latencia y throughput: no disponibles; dependen del chip Apple y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| curia007/Qwen2.5-7B-1M-4bit-mlx | 7,6B | 1M | MLX 4-bit | apache-2.0 | Conversion no oficial para Apple Silicon |
| Qwen/Qwen2.5-7B-Instruct-1M | 7,6B | 1M | safetensors (16-bit) | apache-2.0 | Modelo base oficial, mayor precision, mas memoria |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32K (ampliable) | safetensors, GGUF | apache-2.0 | Version estandar sin extension a 1M |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32K | safetensors, GGUF | apache-2.0 | Alternativa 7B con contexto mucho menor |

## Limitaciones y advertencias

- Es una conversion no oficial: no hay garantia de fidelidad respecto al modelo base ni de mantenimiento por parte del autor.
- La cuantizacion 4-bit puede degradar el rendimiento en matematicas, codigo y recuperacion exacta en contextos largos; no se han publicado evaluaciones que lo cuantifiquen.
- El contexto de 1M tokens es teoricamente alcanzable, pero el coste de memoria del KV cache hace que en la practica sea inviable en la mayoria de equipos de consumo.
- La model card solo declara ingles; el rendimiento en castellano no esta verificado y puede ser inferior al del modelo base.
- Riesgo de alucinacion inherente a un modelo de 7B, especialmente en tareas de recuperacion sobre contextos muy largos.
- Solo funciona con MLX en Apple Silicon; no es portable a CUDA, ROCm ni CPU convencional sin reconversion.
- La licencia apache-2.0 permite uso comercial, pero conviene revisar los terminos del modelo base Qwen2.5-7B-Instruct-1M antes de desplegarlo en produccion.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/curia007/Qwen2.5-7B-1M-4bit-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-1M
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-1M/blob/main/LICENSE
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Documentacion de MLX: https://ml-explore.github.io/mlx/
