# ngquocvinh/AliceAI-T5-35B-A0.6B-GGUF

## Resumen

AliceAI-T5-35B-A0.6B es un modelo de lenguaje encoder-decoder desarrollado por Yandex, con capas de mezcla de expertos (MoE) dispersas. Esta ficha documenta la cuantización GGUF comunitaria publicada por ngquocvinh, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp. El modelo base cuenta con aproximadamente 34,35 mil millones de parámetros únicos, 512 expertos por capa MoE con enrutamiento top-8, estado oculto de 1.536 dimensiones, 16 capas de encoder, 12 capas de decoder, embeddings compartidos entre encoder y decoder, y RoPE con YaRN. La model card upstream declara una ventana de contexto de 128.000 tokens, aunque esta release GGUF no ha sido validada a esa longitud máxima.

La relevancia de esta publicación radica en que ofrece cuantizaciones funcionales de una arquitectura poco habitual (encoder-decoder con MoE) en formato GGUF, algo que las herramientas estándar de llama.cpp no soportan de forma nativa. El autor ha validado cada archivo con un test de carga y generación determinista, y documenta explícitamente qué cuantizaciones fallan y por qué. Es un modelo base, no un modelo de instrucciones ni de chat, por lo que requiere prompts con formato específico y un runtime modificado.

El repositorio ocupa 508,6 GB e incluye desde BF16 de referencia (69,18 GB) hasta Q2_K (12,68 GB), pasando por IQ4_XS (18,51 GB), que el autor señala como candidato compacto validado. Las descargas superan las 11.700 y los likes son 21, lo que indica interés de la comunidad pese a la complejidad de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con capas MoE dispersas (512 expertos, top-8) |
| Parametros totales | 34.561.885.184 (≈34,56B); la model card upstream indica ≈34,35B únicos |
| Parametros activos | No disponible (top-8 de 512 expertos por capa MoE, sin cifra agregada publicada) |
| Longitud de contexto | 128.000 tokens declarados upstream; no validado en esta release GGUF |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K, IQ4_XS |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors/BF16 |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder con mezcla de expertos dispersa. Según la model card upstream citada, emplea 512 expertos por capa MoE con enrutamiento top-8, un estado oculto de 1.536 dimensiones, 16 capas de encoder y 12 de decoder, embeddings compartidos entre ambas torres y RoPE con YaRN para extensión de contexto. La arquitectura no es decoder-only, lo que implica que el runtime debe ejecutar el encoder, la atención cruzada y el bucle de generación del decoder.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La release GGUF no realizó entrenamiento ni fine-tuning: cada artefacto se convirtió directamente desde el snapshot BF16 bloqueado del modelo upstream, sin usar una cuantización como fuente de otra. El autor documenta un parche de runtime (`aliceai-runtime.patch`) aplicable a una revisión concreta del fork XHToken/llama.cpp, necesario porque los binarios estándar de llama.cpp no soportan esta arquitectura.

## Capacidades

- Generación de texto condicionada por un encoder, con protocolo específico: token `[_S_]` al inicio, `<SPAN#0>` al final de la entrada del encoder y arranque del decoder con `[decoder_bos, <SPAN#0>]`.
- Extracción de características (tag `feature-extraction` en Hugging Face), aprovechando la torre encoder.
- Razonamiento y respuesta a preguntas en formato base, sin alineamiento de instrucciones.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; al ser modelo base, no hay evidencia de capacidades agénticas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre arquitecturas encoder-decoder con MoE: el modelo permite estudiar el comportamiento de 512 expertos con top-8 en tareas seq2seq, usando la cuantización Q8_0 (36,80 GB) para máxima fidelidad o IQ4_XS (18,51 GB) para experimentación en una sola GPU.
- Respuesta a preguntas extractiva y generativa: con el protocolo `[_S_]Question: ... Answer:<SPAN#0>` documentado, se puede desplegar un endpoint compatible con OpenAI sobre el runtime parcheado para tareas de QA sobre documentos, aprovechando el encoder para codificar contexto largo.
- Extracción de embeddings para búsqueda semántica: la torre encoder puede usarse como extractor de características en pipelines de recuperación, aunque requiere validar la calidad de los embeddings con el runtime modificado.
- Evaluación comparativa de cuantizaciones: el repositorio publica ocho niveles con tamaños exactos en bytes y resultados de smoke test, lo que permite medir la degradación de calidad entre Q8_0 y Q3_K_M en tareas concretas antes de elegir un tier para producción.
- Reproducción de experimentos: el parche de runtime y el commit fijado de XHToken/llama.cpp permiten reconstruir el entorno exacto usado por el autor, útil para verificar resultados de investigación de forma reproducible.
- Prototipado en hardware de consumo: IQ4_XS (18,51 GB) o Q3_K_M (16,58 GB) permiten cargar el modelo en GPUs de 24 GB con offload parcial, sirviendo para pruebas de concepto de generación encoder-decoder sin acceso a clústeres.
- Fine-tuning posterior sobre el modelo base: al ser un modelo base Apache 2.0, puede servir como punto de partida para adaptaciones supervisadas en tareas seq2seq específicas, aunque el ecosistema de herramientas para esta arquitectura es limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del GGUF solo reporta smoke tests funcionales (carga y generación determinista), no puntuaciones en MMLU, HumanEval, GSM8K ni otras tareas. El autor indica que Q8_0 hasta Q3_K_M e IQ4_XS pasaron el test de carga y generación; Q2_K carga y genera pero su resultado factual no fue semánticamente correcto. IQ2_XS, IQ3_M e IQ1_M fueron descartados por fallos funcionales (sin token decodificado, salida en blanco o bucle repetitivo).

## Requisitos de hardware

- VRAM estimada según cuantización: BF16 69,18 GB; Q8_0 36,80 GB; Q6_K 28,43 GB; Q5_K_M 24,62 GB; Q4_K_M 21,04 GB; IQ4_XS 18,51 GB; Q3_K_M 16,58 GB; Q2_K 12,68 GB. La memoria en runtime depende además del contexto, el tamaño de batch, el backend y las opciones de offload.
- GPU recomendadas: A100 80 GB o H100 para BF16 y Q8_0; A100 40 GB o dos RTX 4090 para Q5_K_M y superiores con offload; RTX 4090 (24 GB) para Q4_K_M e IQ4_XS con offload parcial de capas.
- Cabe en GPU de consumo: IQ4_XS y Q3_K_M en GPUs de 24 GB con offload parcial; Q2_K en GPUs de 16 GB, aunque el autor lo desaconseja por calidad.
- Opciones de despliegue: exclusivamente llama.cpp con el parche de runtime AliceAI (`aliceai-runtime.patch`) sobre el fork XHToken/llama.cpp en el commit `4a3635c32fc9f044c2bde9ebeabf50c7e1ec5991`. El autor advierte que llama-cli estándar, Ollama, vLLM y LM Studio no han sido validados para esta arquitectura. Se puede compilar con `-DGGML_CUDA=ON` para GPU o `-DGGML_CUDA=OFF` para CPU.
- Latencia y throughput: no disponibles. El smoke test documentado se ejecutó en CPU con `-ngl 0 -n 1`, sin métricas de rendimiento publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AliceAI-T5-35B-A0.6B (esta ficha, GGUF) | ≈34,56B totales | 128K declarados, no validados en GGUF | Encoder-decoder MoE, 512 expertos top-8 | Apache 2.0 | GGUF comunitario con runtime parcheado |
| T5-11B (Google) | 11B | 512 tokens | Encoder-decoder denso | Apache 2.0 | Safetensors, ecosistema amplio |
| FLAN-T5-XXL | 11B | 512 tokens | Encoder-decoder denso | Apache 2.0 | Safetensors, instrucciones |
| Mixtral 8x7B | 46,7B totales, 12,9B activos | 32K | Decoder-only MoE, 8 expertos top-2 | Apache 2.0 | GGUF, vLLM, amplio soporte |

La comparación con T5 y FLAN-T5 es la más directa por arquitectura encoder-decoder, aunque AliceAI-T5 es mucho mayor y usa MoE. Frente a Mixtral, la diferencia clave es que AliceAI-T5 no es decoder-only y carece de soporte en herramientas estándar. No se dispone de datos de rendimiento comparativo para establecer diferencias de calidad.

## Limitaciones y advertencias

- Es un modelo base, no un modelo de instrucciones ni de chat: no sigue instrucciones de forma fiable sin formato específico y sin fine-tuning.
- Requiere un runtime parcheado no estándar; llama-cli, Ollama, vLLM y LM Studio no están validados. Esto limita el despliegue en producción y el soporte de la comunidad.
- La ventana de 128K tokens no ha sido validada en esta release GGUF; el comportamiento a contextos largos es desconocido.
- Idiomas soportados no documentados; el rendimiento fuera del ruso o inglés (idiomas habituales de modelos Yandex) es incierto.
- Riesgo de alucinación inherente a modelos base sin alineamiento; no hay evaluaciones de factualidad publicadas.
- La cuantización Q2_K genera salidas factualmente incorrectas según el propio autor; IQ2_XS, IQ3_M e IQ1_M fallaron el smoke test y no se publicaron.
- El repositorio ocupa 508,6 GB, lo que exige espacio de almacenamiento considerable incluso si solo se descargan algunos tiers.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de validación en producción traslada todo el riesgo de calidad al integrador.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ngquocvinh/AliceAI-T5-35B-A0.6B-GGUF
- Modelo base upstream: https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Fork de llama.cpp usado: https://github.com/XHToken/llama.cpp
- Parche de runtime: https://huggingface.co/ngquocvinh/AliceAI-T5-35B-A0.6B-GGUF/blob/main/reproducibility/aliceai-runtime.patch
- Apoyo al autor: https://ko-fi.com/ngquocvinh
