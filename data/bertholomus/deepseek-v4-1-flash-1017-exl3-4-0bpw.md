# bertholomus/DeepSeek-V4.1-Flash-1017-EXL3-4.0bpw

## Resumen

`bertholomus/DeepSeek-V4.1-Flash-1017-EXL3-4.0bpw` es una cuantización EXL3 de 4 bits del checkpoint `deepseek-ai/DeepSeek-V4.1-Flash-1017` (revision `1bae0e10`), publicada por el usuario bertholomus (BertholomusAI) bajo licencia MIT. No es un modelo entrenado desde cero: es un artefacto de despliegue que reduce un modelo multimodal de 144.126.313.810 parametros (unos 144,1 B) a aproximadamente 275 GB de pesos cuantizados, con 4,02 bits por peso de media sobre las matrices cuantizadas. El objetivo es hacer viable la inferencia de un modelo de esta escala en hardware de memoria unificada de gama workstation, en concreto cuatro nodos GB10 (clase DGX Spark).

El modelo base es un transformer de tipo mezcla de expertos (MoE) con torre de vision, cabezal de salida y un modulo de decodificacion especulativa denominado MTP/DSpark drafter, ademas de un compresor de KV y un indexador de contexto. El autor documenta pruebas de 1M de contexto (needles 3/3), soporte de tool calling y vision sobre el despliegue de referencia. La relevancia practica es doble: por un lado demuestra que un MoE multimodal de 144 B puede servirse con paralelismo tensorial 4 sobre RDMA en hardware compacto; por otro, deja constancia explicita de que la divergencia KL frente al modelo nativo aun no se ha medido, por lo que la fidelidad de la cuantizacion no esta cuantificada.

El repositorio tiene 288,4 GB e incluye unicamente los pesos EXL3 en formato safetensors para la libreria exllamav3. No incluye plantilla de chat ni las tablas Engram, que deben servirse desde los shards 47 y 48 del checkpoint original. La informacion publica no incluye resultados de benchmarks de calidad ni la ficha del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con torre de vision, compresor de KV, indexador de contexto y drafter MTP/DSpark; pesos en formato EXL3 |
| Parametros totales | 144.126.313.810 (≈144,1 B) segun safetensors |
| Parametros activos | no disponible (el modelo usa expertos enrutados y expertos compartidos, pero la ficha no publica el numero de parametros activos) |
| Longitud de contexto | hasta 1M tokens segun las pruebas del autor (needles 3/3 y decodificacion tras prompt de 128K); no se detalla en la informacion disponible la ventana oficial del modelo base |
| Tipos de cuantizacion | EXL3: expertos enrutados a 4,0 bpw; atencion, expertos compartidos, compresor de KV, indexador y cabezal de salida a 6 bpw (hq); capas MTP/DSpark drafter a 4 bpw; embeddings y torre de vision en 16 bits sin cuantizar; media global 4,02 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT (modelo y pesos © DeepSeek) |
| Formato de pesos | safetensors con cuantizacion EXL3, libreria exllamav3 (convertido con ExLlamaV3 1.6.0, codebook mul1, calibracion de 128 filas x 2048 tokens) |
| Tamano del repositorio | 288,4 GB (≈275 GB de pesos cuantizados) |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

El artefacto no aporta entrenamiento propio: es una conversion del checkpoint `DeepSeek-V4.1-Flash-1017` mediante ExLlamaV3 1.6.0 con codebook mul1 y un conjunto de calibracion de 128 filas por 2048 tokens. La arquitectura subyacente es un transformer con mezcla de expertos: la ficha distingue explicitamente entre expertos enrutados (cuantizados a 4,0 bpw) y expertos compartidos (a 6 bpw), lo que confirma un diseno MoE con componentes densos compartidos. Ademas incorpora un compresor de KV y un indexador, coherentes con la ventana de contexto extendida que el autor valida a 1M de tokens.

El modelo es multimodal: incluye una torre de vision que se mantiene en 16 bits, de ahi el pipeline image-text-to-text. Tambien incluye capas de drafter MTP/DSpark, empleadas para decodificacion especulativa; el autor verifica que la salida con draft coincide con la serial. Las tablas Engram, un componente adicional del checkpoint original, no estan en este repositorio y deben servirse desde los shards 47 y 48 del modelo base. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto en prosa y en formato estructurado (el autor reporta 187 tok/s en decodificacion estructurada frente a 79 tok/s en prosa con un solo stream).
- Generacion de codigo, con tasas de decodificacion superiores a la prosa en el despliegue de referencia (136 tok/s en una sola secuencia).
- Razonamiento multi-paso y concatenacion de llamadas: el autor valida tool calls como gate de calidad del despliegue.
- Vision: entrada image-text-to-text con torre de vision en 16 bits, verificada en las pruebas del autor.
- Contexto largo: recuperacion de agujas a 1M de tokens (3/3) y decodificacion estable tras un prompt de 128K (140 tok/s).
- Decodificacion especulativa mediante cabezas MTP/DSpark, con verificacion de equivalencia entre salida con draft y salida serial.
- Conversacion multiturno: el autor reporta 71/71 en chat exacto sobre su plantilla propia.
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos: con una ventana de hasta 1M de tokens, el modelo puede ingerir un monorepo o un conjunto amplio de ficheros y responder preguntas transversales sin trocear el contexto en recuperacion previa.
- Agentes de codigo con tool calling: las pruebas de tool calls del autor y la decodificacion estructurada a 187 tok/s lo hacen adecuado para bucles de agente que emiten JSON y llamadas a funciones de forma continua.
- Revision de documentacion tecnica con imagenes: al ser image-text-to-text, puede procesar diagramas de arquitectura, capturas de errores o figuras de papers junto al texto que las acompana.
- Asistencia sobre base de codigo en produccion: integrable en pipelines de CI/CD como revisor de diffs o generador de pruebas, siempre que se despliegue el stack ExLlamaV3/TensorFold y se resuelva la ausencia de plantilla de chat.
- Procesamiento de expedientes largos: contratos, informes o historiales de mas de 100K tokens donde la decodificacion tras prompt largo se mantiene en 140 tok/s, lo que evita penalizaciones severas por prefijo extenso.
- Servicio multiusuario moderado: con 4 streams sostenidos a 183 tok/s y rafagas de 16 peticiones equivalentes a ejecucion individual, encaja en un equipo pequeno o en un entorno de evaluacion interna.
- Prototipado de asistentes multimodales en hardware de sobremesa profesional: cuatro GB10 con TP4 sobre RDMA permiten trabajar con un modelo de 144 B sin recurrir a un clúster de GPUs de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica que la divergencia KL frente al modelo nativo 1017 aun no se ha medido. Los unicos datos numericos publicados son de rendimiento del despliegue de referencia (4 x GB10, TensorFold TP4 sobre RDMA, HTTP):

| Metrica | TP4, 4 x GB10 |
|---|---|
| Decodificacion, 1 stream: codigo / prosa / estructurado (tok/s) | 136 / 79 / 187 |
| Decodificacion, 2 streams / 4 streams (tok/s) | 102 / 142 |
| Decodificacion, 4 streams sostenidos (tok/s) | 183 |
| Prefill 8K / 128K (tok/s) | 2.793 / 2.679 |
| Decodificacion tras prompt de 128K (tok/s) | 140 |

Gates de calidad reportados por el autor en esa misma configuracion: chat exacto 71/71, tool calls correctos, igualdad entre salida con draft y serial, rafagas de 16 peticiones equivalentes a ejecucion individual, vision operativa y needles 1M 3/3. No se aportan resultados comparativos con otros modelos.

## Requisitos de hardware

- VRAM/memoria: los pesos cuantizados ocupan aproximadamente 275 GB, a los que hay que sumar cache KV para contexto largo y las tablas Engram servidas desde el checkpoint original. No cabe en ninguna GPU consumer individual.
- Configuracion validada: 4 nodos GB10 (clase DGX Spark) con 4 vias de paralelismo tensorial sobre RDMA, mediante el motor TensorFold. Es la unica configuracion con datos de rendimiento publicados.
- GPUs de centro de datos: no hay datos publicados de ejecucion en A100, H100 u otras; el formato EXL3 requiere soporte de ExLlamaV3, por lo que la compatibilidad con otros runners no esta verificada.
- GPU consumer: no viable en RTX 4090 (24 GB) ni en configuraciones de una o dos tarjetas; el modelo exige agregacion de memoria de varios nodos.
- Opciones de despliegue: ExLlamaV3 1.6.0 como libreria de referencia y TensorFold como motor de servicio con TP4; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La receta de lanzamiento esta en el repositorio de GitHub citado abajo.
- Latencia y throughput: prefill de 2.793 tok/s a 8K y 2.679 tok/s a 128K; decodificacion de 79 a 187 tok/s segun el tipo de contenido con un solo stream; 183 tok/s con 4 streams sostenidos. La decodificacion tras 128K de prefijo cae solo hasta 140 tok/s.
- Nota operativa: el repositorio no incluye plantilla de chat; la receta aporta `tools/serving_1017.py`, que anade la plantilla y seis tensores con los nombres y tipos que espera el motor (cabezal Markov MTP y las q/k de Engram como F32).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (EXL3 4.0 bpw) | 144,1 B | hasta 1M segun pruebas del autor | EXL3 safetensors, ≈275 GB de pesos, repo de 288,4 GB | MIT | publico en HuggingFace, 11 descargas y 4 likes en el momento de la consulta |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 144,1 B (mismo checkpoint de origen) | no disponible en la informacion proporcionada | checkpoint nativo, incluye tablas Engram en shards 47 y 48; tamano no disponible | MIT | publico en HuggingFace |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | no disponible | no disponible | no disponible | no disponible | no se han identificado en la informacion proporcionada |
| Modelos de otra familia con tamano y tarea comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de calidad (benchmarks o KL) que permitan una comparacion de rendimiento frente al modelo sin cuantizar ni frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Fidelidad de cuantizacion no medida: el autor declara explicitamente que la divergencia KL frente al modelo nativo 1017 aun no se ha calculado. No hay garantia cuantificada de que la calidad se mantenga.
- Perdida esperada por cuantizacion: los expertos enrutados bajan a 4,0 bpw, un regimen agresivo para un MoE; tareas de razonamiento fino, matematicas o codigo de baja frecuencia pueden degradarse de forma no uniforme.
- Dependencia de componentes externos: las tablas Engram no estan en el repositorio y deben servirse desde los shards 47 y 48 del checkpoint original. Un despliegue incompleto de esas tablas invalida el comportamiento esperado.
- Sin plantilla de chat: el repositorio no la incluye; es necesario aplicar la receta del autor (`tools/serving_1017.py`) o construir una propia, con el riesgo de deriva en el formato de conversacion.
- Ecosistema restringido: pensado para ExLlamaV3 y TensorFold; no hay soporte documentado en vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad y el escalado horizontal.
- Requisito de hardware poco comun: la unica configuracion validada son 4 nodos GB10 con TP4 sobre RDMA; no hay datos de latencia o estabilidad en otras topologias.
- Riesgo de alucinacion: inherente a un modelo generativo de esta escala; no se aportan evaluaciones de factualidad ni de tasa de alucinacion.
- Sesgos: no se publica informacion sobre composicion del dataset ni evaluaciones de sesgo del modelo base.
- Idiomas: no se especifica la cobertura linguistica; el rendimiento en castellano no esta documentado y no debe asumirse.
- Licencia: MIT permite uso comercial, pero el aviso del autor indica que el modelo y los pesos son propiedad de DeepSeek bajo MIT y que el publicador no esta afiliado ni respaldado por DeepSeek; conviene revisar la licencia del checkpoint base antes de un despliegue en produccion.
- Madurez del artefacto: 11 descargas y 4 likes, creado y actualizado el 19 de octubre de 2026; es un artefacto reciente y con muy poca validacion independiente.
- Contexto de 1M: las pruebas se limitan a agujas sinteticas (3/3); no hay evidencia publicada sobre calidad de razonamiento sostenido a esa longitud.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bertholomus/DeepSeek-V4.1-Flash-1017-EXL3-4.0bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/blob/main/LICENSE
- Receta de despliegue, gates y preparacion de la descarga (v0.2.0): https://github.com/bertholomus/deepseek-v4.1-tensorfold-tp4-4xgb10
- ExLlamaV3 y formato EXL3: no se proporciona URL en la informacion disponible
- TensorFold: no se proporciona URL en la informacion disponible
- Papers, blogs o demos adicionales: no disponible
