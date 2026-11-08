# mikedoise/gemma-4-E4B-it-coreai-4bit-128k-text

## Resumen

Gemma 4 E4B Instruct Core AI 4-bit 128K Text es una conversión cuantizada del checkpoint instructivo `google/gemma-4-E4B-it` de Google DeepMind, empaquetada por Michael Doise (mikedoise) para el runtime Core AI de Apple en Apple Silicon. No se trata de un modelo nuevo ni de un fine-tuning: es un export offline de los pesos originales en formato `.aimodel` portable, con paletización mixta de 4 bits, embeddings y PLE (per-layer embeddings) en INT8 y cómputo en float16, pensado exclusivamente para ejecutarse con `llm-runner` de `apple/coreai-models`.

El bundle ocupa 5,585 GB (5,201 GiB) e incluye el modelo con contexto estático configurado en 131.072 tokens, dividido en buckets de 1.024, 8.192, 32.768 y 131.072. Esta variante es solo texto: no incorpora encoder de imagen ni de audio, ni cabezal de decodificación especulativa, y no se ha realizado entrenamiento ni ajuste adicional sobre el checkpoint base.

Su relevancia es acotada pero concreta: ofrece una vía para ejecutar un modelo Gemma 4 de la familia E4B en Macs con chip de la serie M mediante el stack nativo de Apple, fuera de Transformers, MLX, GGUF o Core ML. La validación publicada por el autor se limita a un smoke test de generación corta en un M5 Max con 128 GiB de RAM; no hay evidencia de precisión, memoria o velocidad en contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B, checkpoint instructivo); sin encoder de imagen ni audio en esta variante |
| Parametros totales | no disponible (pesos fuente: 15.992.595.884 bytes) |
| Parametros activos | no disponible (no se especifica si E4B es MoE) |
| Longitud de contexto | 131.072 tokens configurados (buckets estaticos de 1.024 / 8.192 / 32.768 / 131.072); inferencia a longitud completa no probada |
| Tipos de cuantizacion | Paletizacion mixta de 4 bits, embeddings y PLE en INT8, computo en float16 |
| Idiomas soportados | no disponible (no se han probado idiomas distintos del ingles en esta exportacion) |
| Licencia | Apache 2.0 (pesos); licencia upstream de Gemma 4 enlazada por el autor |
| Formato de pesos | `.aimodel` portable (Core AI) + `_ple.safetensors` + `tokenizer/` + `metadata.json`; no es GGUF, MLX ni Core ML |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-4-E4B-it`, un transformer de la familia Gemma 4 de Google DeepMind en su variante instructiva. Esta exportacion no introduce cambios arquitectonicos: reproduce el checkpoint base fijado en la revision `ee0ef6023621cff504d758262d4e04895a5af4a2` y aplica la receta de conversion de Apple para Gemma 4 (revision `22b0eaac4b325b812605a5096acff4880f1c4a36` de `apple/coreai-models`). No hay entrenamiento adicional, RLHF, DPO ni fine-tuning en este paso; es puramente un proceso de cuantizacion y empaquetado.

La innovacion tecnica del artefacto es el formato: recursos `.aimodel` portables (no compilacion AOT `.aimodelc`, con `compilation.targets` vacio) que el runtime especializa en el dispositivo. La cuantizacion combina paletizacion de 4 bits en la mayoria de tensores con INT8 para embeddings y PLE, y float16 para el computo, de modo que "4-bit" no describe la totalidad de los tensores. El export se realizo offline con Python 3.11, torch 2.9.0, coreai-torch 0.4.3, coreai-core 1.0.0b3, coreai-opt 0.4.0 y transformers 5.12.1, y el autor advierte que la conversion no es necesariamente reproducible byte a byte.

## Capacidades

- Generacion de texto conversacional e instructiva, heredada del checkpoint `gemma-4-E4B-it`.
- Respuesta a preguntas, resumen y razonamiento segun las capacidades del modelo base (no verificadas en esta exportacion).
- Procesamiento de prompts largos hasta 131.072 tokens a nivel de configuracion, aunque la calidad y el consumo de memoria en esa longitud no se han medido.
- Ejecucion local en Apple Silicon mediante el runtime Core AI de Apple y su `llm-runner`.
- Sin soporte de vision en esta variante (existe una variante hermana con vision).
- Sin soporte de audio (no se incluye encoder de audio).
- Sin cabezal de decodificacion especulativa.
- Tool calling y uso agentico: no probados; el autor declara explicitamente que el uso estructurado de herramientas no se ha validado.
- Capacidades multilingues: no disponibles ni verificadas en esta exportacion.

## Casos de uso

- Evaluacion local de Gemma 4 en Mac: permite probar el modelo instructivo en un Mac con Apple Silicon usando el stack nativo de Apple, sin depender de PyTorch ni de convertidores GGUF/MLX, util para equipos que ya trabajan con Core AI.
- Prototipado de asistentes de texto en escritorio: el bundle se descarga completo y se ejecuta con `llm-runner`, lo que facilita experimentar con generacion de texto en local antes de decidir una integracion mayor.
- Pruebas de prompts largos en hardware Apple: los buckets de contexto de hasta 131.072 tokens permiten experimentar con entradas extensas, siempre que se asuma que el rendimiento y la precision en esa longitud no estan caracterizados.
- Validacion de pipelines Core AI: sirve como artefacto de referencia para comprobar que el runtime, la tokenizacion y el cargador de pesos funcionan en una maquina concreta antes de desplegar otros modelos en el mismo stack.
- Investigacion sobre cuantizacion: al documentarse la receta exacta (paletizacion 4-bit, INT8 en embeddings/PLE, float16 en computo) y los hashes, es util para estudiar el impacto de esa combinacion en la calidad frente al checkpoint original.
- Entornos sin conectividad o con requisitos de privacidad: al ejecutarse localmente y descargarse como repositorio completo, encaja en escenarios donde el texto no debe salir del dispositivo, con la cautela de que la calidad no esta evaluada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que las cifras de benchmark del modelo upstream no miden esta exportacion cuantizada. La unica observacion registrada es un smoke test el 2026-11-08 en un Apple M5 Max con 128 GiB de RAM, macOS 27.0.1 y Xcode 27.1: prompt "What is 2 plus 2? Answer with just the number.", respuesta "4", codigo de salida 0, preparacion de 66,454 segundos e invocacion completa de 73,48 segundos. Son observaciones de una sola ejecucion, no benchmarks.

## Requisitos de hardware

- Almacenamiento: 5,585 GB (5,201 GiB) para el bundle completo; el autor aclara que el tamano en disco no equivale al requisito de RAM.
- RAM: no se especifica un minimo; la unica prueba publicada se hizo en un Mac con 128 GiB.
- GPU: Apple Silicon unicamente (probado en M5 Max). No aplica a A100, H100 ni RTX 4090, ya que el formato `.aimodel` es especifico del runtime Core AI de Apple.
- Compatibilidad con GPU de consumo: si, en el sentido de que esta pensado para Macs con chip de la serie M; no se ha probado en iPhone ni iPad.
- Sistema y toolchain: macOS/iOS 27.0+ y Xcode 27.0+ segun los requisitos generales de Apple; la receta de Gemma 4 de Apple indica iOS 27.2+. Apple documenta un problema de compilacion AOT con Xcode 27.2 beta y recomienda especializacion en dispositivo desde `.aimodel`.
- Despliegue: exclusivamente `llm-runner` de `apple/coreai-models`. No es compatible con vLLM, llama.cpp, Ollama, TGI, MLX, GGUF ni Core ML.
- Latencia y throughput: no disponibles; solo la observacion de 73,48 segundos para una invocacion corta, dominada por la preparacion de 66,454 segundos.
- Nota: durante la preparacion el compilador del Neural Engine emitio un error interno y avisos de reordenacion, aunque el runtime cargo el modelo y respondio correctamente; no se establece compilacion ni ejecucion limpia en ANE.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E4B Instruct Core AI 4-bit 128K Text (este) | no disponible (pesos fuente ~15,99 GB) | 131.072 configurados, no probado a plena longitud | `.aimodel` para Core AI de Apple | Apache 2.0 | Hugging Face, 0 descargas, creado 2026-11-08 |
| google/gemma-4-E4B-it (upstream) | no disponible | no disponible | safetensors / Transformers | licencia Gemma 4 de Google | Hugging Face oficial |
| gemma-4-E4B-it-coreai-4bit-128k-vision (variante hermana) | no disponible | 131.072 configurados | `.aimodel` para Core AI de Apple | Apache 2.0 | Hugging Face, mismo autor |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion puede degradar la calidad; el autor recomienda evaluar en el hardware y las tareas concretas antes de poner el modelo en produccion.
- Riesgo de alucinacion, sesgos y salidas daninas o erroneas, igual que en el modelo base; no debe usarse como unica fuente para decisiones con consecuencias.
- Contexto largo no validado: no se ha probado entrada de 131K, ni su precision, memoria o velocidad.
- No se han probado idiomas distintos del ingles en esta exportacion.
- Tool calling y uso agentico estructurado no verificados.
- Vision y audio no incluidos en esta variante; existe una variante hermana con vision.
- Ejecucion en iPhone/iPad no probada.
- El error interno del compilador ANE durante la preparacion impide afirmar una compilacion o ejecucion limpia en Neural Engine, ni determinar el backend de computo real.
- La conversion no es necesariamente reproducible byte a byte; requiere dependencias y snapshot fijados.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-08): es un artefacto reciente y sin validacion comunitaria.
- La licencia de los pesos es Apache 2.0, pero el autor enlaza la licencia upstream de Gemma 4 de Google; conviene revisar ambas antes de uso comercial.
- Requiere macOS/iOS 27.x y Xcode 27.x, lo que restringe su uso a versiones muy recientes del ecosistema Apple.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mikedoise/gemma-4-E4B-it-coreai-4bit-128k-text
- Coleccion de variantes E4B Core AI: https://huggingface.co/collections/mikedoise/gemma-4-e4b-core-ai-128k-6af0d221a80d7c3ba0f4fbb2
- Variante con vision: https://huggingface.co/mikedoise/gemma-4-E4B-it-coreai-4bit-128k-vision
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Receta de Apple para Gemma 4: https://github.com/apple/coreai-models/tree/22b0eaac4b325b812605a5096acff4880f1c4a36/models/gemma4
- Repositorio apple/coreai-models: https://github.com/apple/coreai-models
- Pagina de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma 4: https://gemma.ai/models/gemma-4/
- Licencia de Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license
