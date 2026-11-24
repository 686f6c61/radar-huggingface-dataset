# mradermacher/opencapybara-math-30B-2509-GGUF

## Resumen

`opencapybara-math-30B-2509-GGUF` es la version cuantizada en formato GGUF del modelo `NaruseShiroha/opencapybara-math-30B-2509`, un modelo de lenguaje especializado en matematicas y razonamiento. La cuantizacion la ha realizado mradermacher, un autor habitual en el ecosistema GGUF que publica versiones estaticas de modelos populares para su uso con llama.cpp y herramientas compatibles. El modelo base emplea una arquitectura tipo `qwen3_moe`, segun las etiquetas de la model card, con 30.532.122.624 parametros totales confirmados por los pesos en safetensors del modelo original.

El modelo resuelve el problema de ejecutar un LLM de 30B especializado en matematicas en hardware de consumo o en infraestructura sin GPUs de datacenter, ofreciendo cuantizaciones desde Q2_K (11,4 GB) hasta Q8_0 (32,6 GB). Es relevante ahora porque combina el interes creciente por modelos de razonamiento matematico con la disponibilidad de pesos en GGUF listos para desplegar en llama.cpp, Ollama o servidores compatibles con la API de OpenAI.

La informacion publica disponible es limitada: la model card del repositorio GGUF solo documenta el proceso de cuantizacion, los tipos disponibles y los enlaces de descarga. No se detallan datos de entrenamiento, composicion del dataset, resultados de benchmarks ni capacidades especificas mas alla de las etiquetas genericas (`text-generation-inference`, `transformers`, `unsloth`, `qwen3_moe`, `conversational`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_moe (segun etiquetas de la model card) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base se etiqueta como `qwen3_moe`, lo que indica una arquitectura transformer con mezcla de expertos (MoE) derivada de la familia Qwen3. El numero total de parametros asciende a 30.532.122.624, aunque no se especifica cuantos estan activos por token ni cuantos expertos contiene la red. La etiqueta `unsloth` sugiere que el entrenamiento o el ajuste fino se realizo con las herramientas de Unsloth, aunque no se detalla el proceso.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, ni sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, modos de razonamiento explicito). El nombre del modelo (`opencapybara-math`) apunta a una especializacion en matematicas, pero no se documenta en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional (etiqueta `conversational` en la model card).
- Especializacion en matematicas y razonamiento, inferida del nombre del modelo; no confirmada con benchmarks.
- Compatibilidad con text-generation-inference y endpoints compatibles (etiqueta `endpoints_compatible`).
- Uso con llama.cpp y herramientas que consumen GGUF (Ollama, LM Studio, etc., por el formato de los pesos).
- Capacidades multilingues: solo se declara ingles (`en`).
- Soporte de tool calling, function calling, agentes o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia en resolucion de problemas matematicos: el modelo puede emplearse como tutor o solucionador de ejercicios de algebra, calculo y estadistica, aprovechando su especializacion declarada en el nombre y su tamano de 30B para razonamiento multi-paso.
- Despliegue en local con llama.cpp u Ollama: gracias a las cuantizaciones Q4_K_M (18,7 GB) y Q5_K_M (21,8 GB), puede ejecutarse en estaciones de trabajo con una sola GPU de 24 GB o en configuraciones CPU+GPU, sin depender de APIs en la nube.
- Generacion aumentada por recuperacion (RAG) sobre documentacion tecnica: el formato GGUF y la compatibilidad con endpoints permiten integrarlo en pipelines existentes que ya consumen la API de OpenAI.
- Prototipado de asistentes conversacionales en ingles: la etiqueta `conversational` y el soporte de TGI lo hacen adecuado para entornos de desarrollo que necesitan un modelo local para pruebas de dialogo.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes (Q2_K a Q8_0) que permiten medir el impacto de la cuantizacion en calidad y velocidad sobre una misma tarea matematica.
- Investigacion sobre modelos MoE de 30B: util para estudiar el comportamiento de arquitecturas con mezcla de expertos en tareas de razonamiento, con la ventaja de disponer de pesos ligeros y ejecutables en hardware asequible.
- Fine-tuning posterior sobre dominios matematicos especificos: la licencia Apache 2.0 permite reentrenar o ajustar el modelo base para nichos como fisica computacional o analisis numerico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano del archivo GGUF, mas overhead de contexto y KV cache):
  - Q2_K: ~11,4 GB
  - Q3_K_S: ~13,4 GB
  - Q3_K_M: ~14,8 GB
  - Q3_K_L: ~16,0 GB
  - IQ4_XS: ~16,7 GB
  - Q4_K_S: ~17,6 GB
  - Q4_K_M: ~18,7 GB
  - Q5_K_S: ~21,2 GB
  - Q5_K_M: ~21,8 GB
  - Q6_K: ~25,2 GB
  - Q8_0: ~32,6 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K; A100 40 GB o H100 para Q8_0 con contexto largo; RTX 3090 (24 GB) como alternativa consumer para cuantizaciones medias.
- Cabe en GPU consumer: si, en tarjetas de 16-24 GB con cuantizaciones Q3 a Q6; las variantes Q2_K y Q3_K_S caben en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (TGI) y servidores compatibles con la API de OpenAI (etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| opencapybara-math-30B-2509 (este) | 30,5B (MoE) | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en matematicas, solo ingles |
| Qwen3-30B-A3B | 30,5B (MoE, ~3B activos) | no disponible en la informacion | Apache 2.0 | safetensors, GGUF | Modelo base de la familia Qwen3 MoE; no especializado en matematicas |
| Qwen2.5-Math-7B | 7B | no disponible en la informacion | Apache 2.0 | safetensors, GGUF | Menor tamano, especializado en matematicas |
| DeepSeek-Math-7B | 7B | no disponible en la informacion | no disponible en la informacion | safetensors | Especializado en matematicas, menor tamano |

La comparativa se limita a modelos de la misma familia o categoria matematica; no se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo se declara soporte de ingles (`en`); el rendimiento en castellano no esta garantizado ni documentado.
- No hay informacion sobre sesgos, alineacion o filtros de seguridad del modelo base.
- Riesgo de alucinacion inherente a los LLM, especialmente en razonamiento matematico donde una cadena de pasos incorrecta puede producir una respuesta plausible pero falsa.
- No se documentan resultados de benchmarks, por lo que la calidad real en tareas matematicas no puede verificarse a partir de la informacion disponible.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; para uso en produccion se recomienda Q4_K_M o superior.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce si el modelo base impone restricciones adicionales sobre los datos de entrenamiento.
- El repositorio GGUF tiene muy pocas descargas (143) y ningun "like", lo que sugiere poca validacion por parte de la comunidad.
- No se dispone de informacion sobre la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/opencapybara-math-30B-2509-GGUF
- Modelo base: https://huggingface.co/NaruseShiroha/opencapybara-math-30B-2509
- Pagina de overview de cuantizaciones: https://hf.tst.eu/model#opencapybara-math-30B-2509-GGUF
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
