# Dramatik999/gemma-4-12B-it-ONNX

## Resumen

Esta ficha describe `Dramatik999/gemma-4-12B-it-ONNX`, una exportación a formato ONNX del modelo `google/gemma-4-12B-it` de Google DeepMind, publicada por el usuario Dramatik999 y optimizada específicamente para ejecutarse en el navegador mediante Transformers.js sobre WebGPU. Se trata, por tanto, de una conversión de pesos y grafos, no de un modelo entrenado desde cero: la autoría del modelo base corresponde a Google y la del artefacto ONNX a Dramatik999. El objetivo declarado es permitir que un chatbot (Oh my AI!) funcione íntegramente en el lado del cliente, sin enviar datos a un servidor.

El repositorio contiene únicamente la ruta de texto del modelo base: los codificadores de visión y audio no se han exportado, pese a que el modelo original es multimodal. La distribución consta de dos grafos: un módulo de embeddings en fp16 (2,0 GB) y un decodificador cuantizado en q4f16 (6,7 GB repartidos en cuatro shards), con una descarga total de aproximadamente 8,2 GB. El decodificador solo calcula los logits de la última posición, que es lo único que necesita la generación autorregresiva, y todo el cálculo vive dentro de los grafos sin operadores personalizados.

El interés de esta publicación, fechada en septiembre de 2026, radica en que, según el propio autor, ningún otro export del modelo de 12B carga en Transformers.js en esa fecha: `onnx-community` publica únicamente las variantes E2B y E4B, y la exportación de 12B existente (`justinchuby/gemma-4-12b-onnx`) está orientada a onnxruntime-genai. El modelo se distribuye con licencia Apache 2.0, igual que el original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (modelo base declarado como `gemma4_unified`; la exportacion lo presenta como `gemma4` / `Gemma4ForConditionalGeneration`) |
| Parametros totales | 12B (segun denominacion del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible para el modelo base; la implementacion de Oh my AI! limita la ventana a 8192 tokens. La cache mantiene el pasado completo en las capas de ventana deslizante en lugar de recortarlo a 1024 tokens |
| Tipos de cuantizacion | `embed_tokens`: fp16. `decoder_model_merged`: q4f16 (pesos MatMul en bloques de 4 bits de tamano 32, activaciones fp16) |
| Idiomas soportados | fr, en (segun los tags del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (exportado desde safetensors de PyTorch) |

## Arquitectura y entrenamiento

El artefacto es una exportacion, no un entrenamiento. El modelo subyacente `google/gemma-4-12B-it` es un modelo multimodal de Google DeepMind con arquitectura descrita como «unified» y sin encoder separado segun las fuentes del blog de Google, aunque esta exportacion concreta conserva unicamente la parte de texto. La conversion se realizo con `torch.onnx.export` en modo dynamo, opset 18, transformers 5.17 y torch 2.14, sin operadores personalizados, y el script de exportacion es publico en el repositorio `BonoAI-org/ohmyai`. Dado que esta ficha trata sobre la exportacion ONNX y no sobre el entrenamiento, no se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF o DPO del modelo original.

La innovacion tecnica de esta exportacion es de ingenieria de despliegue, no de modelado. El decodificador esta partido en dos sesiones ONNX (embeddings y decodificador fusionado) y calcula exclusivamente los logits de la ultima posicion, lo que reduce el coste de la generacion. El autor declara `gemma4_unified` en el `config.json` bajo la clave `_source`, pero expone el modelo como `gemma4` / `Gemma4ForConditionalGeneration` para que Transformers.js 4.3 seleccione su ruta de carga de solo texto. La plantilla de chat se incrusta en `tokenizer_config.json` para que el tokenizador de Transformers.js la lea directamente. Como limitacion de rendimiento, la atencion se ejecuta como operadores descompuestos, sin `GroupQueryAttention` fusionado.

## Capacidades

- Generacion de texto conversacional: el repositorio declara los pipelines `text-generation` y `conversational`.
- Inferencia en navegador: ejecucion local en WebGPU mediante Transformers.js, sin backend remoto.
- Multilingue limitado: los idiomas declarados en el repositorio son frances e ingles (fr, en).
- Procesamiento de contexto largo: la validacion incluye una prueba con un prompt de 3.679 tokens y una respuesta correcta recuperando informacion 3.000 tokens atras.
- Capacidades multimodales: el modelo base (`google/gemma-4-12B-it`) es multimodal y los tags del repositorio incluyen `image-text-to-text`, pero esta exportacion es **solo texto**: los encoders de vision y audio no estan exportados.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Chatbot embebido en una pagina web: el modelo se carga en el navegador del usuario a traves de Transformers.js y WebGPU, de modo que las conversaciones no salen del dispositivo. Es el caso para el que se construyo explicitamente, como parte del proyecto Oh my AI!.
- Asistentes con requisitos de privacidad: al ejecutarse integramente en el cliente, resulta adecuado para aplicaciones que manejan texto sensible y no pueden enviar datos a un servidor de inferencia.
- Aplicaciones web progresivas (PWA) con inferencia offline: una vez descargados los ~8,2 GB de pesos, el modelo puede usarse sin conexion, siempre que el navegador mantenga los ficheros en cache.
- Demostraciones y prototipos sin infraestructura: permite publicar una demo funcional de un modelo de 12B sin desplegar GPU en servidor, apoyandose unicamente en el hardware del visitante.
- Analisis de documentos de extension media en el navegador: la validacion con prompts de 3.679 tokens y respuestas que recuperan informacion lejana (3.000 tokens) lo hace viable para resumir o consultar documentos, teniendo en cuenta la limitacion de cache descrita mas abajo.
- Educacion y entornos restringidos: util en contextos donde no se permite instalar software de escritorio ni acceder a APIs externas, ya que todo el procesamiento ocurre en la pestana del navegador.
- Filtrado o preprocesado previo a un modelo mayor: puede utilizarse como clasificador o generador de borradores en cliente, reduciendo el trafico hacia servicios de mayor coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye cifras tipo MMLU, HumanEval o GSM8K para esta exportacion. Si se documenta una tabla de validacion frente a la referencia en PyTorch con decodificacion greedy:

| Comprobacion | Resultado |
|---|---|
| Division de embeddings frente a PyTorch | diferencia de logits cero |
| Decodificador fp16 en CPU, prompt de 24 tokens | 32 / 32 tokens identicos |
| Decodificador q4f16 en CPU, prompt de 24 tokens | 8 / 32 identicos; a partir de ahi, divergencia coherente por cuantizacion |
| q4f16, prompt de 3.679 tokens, respuesta 3.000 tokens atras | 14 / 14 identicos, respuesta correcta |
| q4f16 en Chrome sobre WebGPU, mismo prompt largo | respuesta correcta, aproximadamente 26 s |
| Plantilla de chat, Transformers.js frente a Python | tokens identicos |

## Requisitos de hardware

- Descarga total: aproximadamente 8,2 GB (`embed_tokens_fp16.onnx` 2,0 GB + `decoder_model_merged_q4f16.onnx` 6,7 GB en cuatro shards). El repositorio ocupa 8,8 GB.
- Memoria: el modelo debe caber en los ArrayBuffers de la pestana de Chrome, con un limite practico de unos 15,75 GiB. Con 8,2 GB de pesos, el margen es suficiente pero no holgado.
- GPU: requiere WebGPU. No se especifican modelos concretos de GPU en la informacion proporcionada; el autor solo confirma su funcionamiento en Chrome sobre WebGPU. Es plausible su uso en GPU de consumo modernas con soporte WebGPU, pero no hay confirmacion explicita de modelos.
- VRAM estimada: no disponible de forma explicita. Como referencia, los pesos ocupan unos 8,2 GB, a lo que hay que sumar la cache KV, que crece aproximadamente 340 KB por token, y las activaciones intermedias.
- Despliegue: Transformers.js sobre WebGPU en el navegador. No hay indicacion de soporte para vLLM, llama.cpp, Ollama o TGI en esta exportacion concreta, ya que los grafos estan adaptados a Transformers.js. Existe otra exportacion de 12B (`justinchuby/gemma-4-12b-onnx`) orientada a onnxruntime-genai.
- Latencia: en la validacion, una respuesta a un prompt de 3.679 tokens tardo aproximadamente 26 s en Chrome sobre WebGPU con el decodificador q4f16. No se proporcionan cifras de tokens por segundo.
- Advertencia de rendimiento: la atencion se ejecuta con operadores descompuestos, sin `GroupQueryAttention` fusionado, lo que penaliza la velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Runtime objetivo | Contexto | Licencia |
|---|---|---|---|---|---|
| Dramatik999/gemma-4-12B-it-ONNX | 12B | ONNX (fp16 + q4f16) | Transformers.js / WebGPU | 8192 tokens en Oh my AI! | Apache 2.0 |
| google/gemma-4-12B-it | 12B | safetensors | PyTorch | no disponible | Apache 2.0 |
| onnx-community (E2B / E4B) | menor que 12B (variantes E2B y E4B) | ONNX | Transformers.js | no disponible | no disponible |
| justinchuby/gemma-4-12b-onnx | 12B | ONNX | onnxruntime-genai | no disponible | no disponible |

## Limitaciones y advertencias

- Solo texto: los codificadores de vision y audio del modelo base no se han exportado, por lo que no es posible usarlo para tareas de imagen o audio pese a que los tags del repositorio incluyan `image-text-to-text`.
- Cache KV sin recorte: las capas de ventana deslizante conservan todo el pasado en lugar de recortarlo a 1.024 tokens. Los resultados son correctos, pero la cache crece unos 340 KB por token, lo que limita la longitud practica de la conversacion.
- Limite de contexto impuesto: Oh my AI! fija la ventana en 8.192 tokens.
- Rendimiento: la atencion usa operadores descompuestos, sin atencion fusionada, lo que reduce la velocidad frente a implementaciones nativas.
- Divergencia por cuantizacion: con q4f16, la validacion muestra coincidencia exacta solo en 8 de 32 tokens frente a la referencia en PyTorch; a partir de ahi la salida diverge de forma coherente. Esto implica que no reproduce bit a bit el modelo original.
- Idiomas: el repositorio declara unicamente frances e ingles. No hay confirmacion de soporte para castellano ni para otros idiomas.
- Sesgos y alucinacion: no hay informacion especifica sobre sesgos ni tasas de alucinacion en la model card de esta exportacion. Al ser una conversion del modelo base, hereda las caracteristicas de este, pero no se documentan aqui.
- Licencia: Apache 2.0, la misma que el modelo original, lo que en principio permite uso comercial. Conviene revisar los terminos del modelo base de Google por si imponen condiciones adicionales.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- Compatibilidad: la exportacion esta ajustada a Transformers.js 4.3 y depende de que `config.json` presente el modelo como `gemma4`; es posible que cambios de version en la libreria rompan la carga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Dramatik999/gemma-4-12B-it-ONNX
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Anuncio de Gemma 4 12B en el blog de Google: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Guia de Gemma 4 12B en Analytics Vidhya: https://www.analyticsvidhya.com/blog/2026/06/google-gemma-4-12b/
- Exportacion alternativa de 12B para onnxruntime-genai: https://huggingface.co/justinchuby/gemma-4-12b-onnx
- Script de exportacion (BonoAI-org/ohmyai): https://github.com/BonoAI-org/ohmyai/tree/main/scripts/spike-gemma4-onnx
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Proyecto Oh my AI!: https://ohmyai.org
