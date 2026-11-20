# mradermacher/Meta-Llama-3-8B-Instruct_fictional_Korean_v1-GGUF

## Resumen

Meta-Llama-3-8B-Instruct_fictional_Korean_v1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo `yzhuang/Meta-Llama-3-8B-Instruct_fictional_Korean_v1`, un ajuste fino supervisado (SFT) sobre la base de Meta Llama 3 8B Instruct. El modelo original fue entrenado con la libreria TRL y el dataset `generator`, y esta orientado a conversacion (pipeline `conversational`). Esta publicacion no introduce pesos nuevos: su valor esta en ofrecer el modelo base en formato GGUF listo para inferencia en CPU o GPU con llama.cpp y derivados.

El modelo subyacente conserva la arquitectura transformer decoder-only de Llama 3 8B, con 8.030.261.248 parametros totales (segun safetensors del repo base) y la ventana de contexto nativa de Llama 3 (8.192 tokens). El ajuste fino se realizo sobre datos del dataset `generator`, cuyo contenido no se detalla en la model card. La model card declara el idioma `en`, aunque el nombre del modelo sugiere una orientacion al coreano que no queda documentada con metricas ni ejemplos.

La relevancia practica de esta ficha es doble: por un lado, permite ejecutar un Llama 3 8B Instruct ajustado en hardware de consumo mediante cuantizaciones de 3,3 GB (Q2_K) a 8,6 GB (Q8_0); por otro, advierte de que se trata de un modelo experimental de bajo uso (98 descargas, 0 likes) y sin benchmarks publicados, por lo que no deberia adoptarse en produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), segun modelo base |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Llama 3 8B nativo: 8.192 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | other |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino SFT de Meta Llama 3 8B Instruct, un transformer decoder-only con atencion causal y 8.030 millones de parametros. El entrenamiento del ajuste se realizo con TRL (tag `trl`, `sft`, `generated_from_trainer`) sobre el dataset `generator`, cuya composicion, numero de tokens y proceso de curacion no se detallan en la model card. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales mas alla del SFT. Tampoco se indica si el ajuste incorpora innovaciones como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

El repositorio aqui descrito no entrena nada: mradermacher aplica cuantizacion estatica (indicado en la model card como `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) sobre los pesos del modelo base en formato Hugging Face y los exporta a GGUF. No se han generado cuantizaciones ponderadas con imatrix para este modelo, segun la propia model card, lo que implica que las variantes IQ disponibles (IQ4_XS) no incorporan la mejora de calidad habitual de las imatrix.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Llama 3 8B Instruct.
- Instrucciones y seguimiento de formato, gracias al ajuste SFT sobre el modelo Instruct.
- Razonamiento basico y respuesta a preguntas en ingles, idioma declarado por el autor.
- Codigo y matematicas a nivel de un modelo de 8B, sin benchmarks que lo verifiquen en esta version ajustada.
- Inferencia en CPU y GPU mediante llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo `en` declarado; el nombre del modelo sugiere coreano, pero no hay evidencia documentada.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantizacion Q4_K_M (5,0 GB) el modelo cabe en una GPU de consumo de 8 GB o en CPU con 8 GB de RAM, lo que permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Evaluacion de ajustes finos experimentales: util para comparar el comportamiento del ajuste `fictional_Korean_v1` frente a Llama 3 8B Instruct original antes de invertir en un despliegue mayor.
- Despliegue en entornos sin GPU: las variantes Q2_K (3,3 GB) y Q3_K_S (3,8 GB) permiten ejecucion en portatiles modestos o contenedores con RAM limitada, a costa de perdida de calidad.
- Generacion de texto en ingles para tareas de resumen o reescritura: el modelo puede usarse como motor de transformacion de texto en pipelines batch ejecutados con llama.cpp.
- Investigacion sobre cuantizacion: el repositorio ofrece 12 variantes de cuantizacion del mismo modelo, lo que facilita estudios comparativos de calidad frente a tamano (Q2_K a f16).
- Base para experimentos de ajuste ligero: al ser un modelo de 8B en formato GGUF y safetensors, puede servir como punto de partida para LoRA o para pruebas de destilacion, aunque el ajuste requeriria los pesos en precision completa del modelo base.
- Chat de soporte interno de baja criticidad: adecuado para entornos controlados donde la alucinacion se mitiga con revision humana y donde el volumen no justifica un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K ~3,3 GB; Q3_K_S ~3,8 GB; Q3_K_M ~4,1 GB; Q3_K_L ~4,4 GB; IQ4_XS ~4,6 GB; Q4_K_S ~4,8 GB; Q4_K_M ~5,0 GB; Q5_K_S ~5,7 GB; Q5_K_M ~5,8 GB; Q6_K ~6,7 GB; Q8_0 ~8,6 GB; f16 ~16,2 GB. A estos valores hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4 a Q8; A100 o H100 solo si se busca throughput alto con f16 o lotes grandes.
- Cabe en GPU de consumo: si. Q4_K_M (5,0 GB) entra en GPUs de 8 GB; Q8_0 (8,6 GB) requiere 12 GB o mas; f16 (16,2 GB) requiere 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runner compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa para este modelo; requeririan los pesos safetensors del modelo base.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Meta-Llama-3-8B-Instruct_fictional_Korean_v1-GGUF (este) | 8,03 B | no disponible | GGUF (12 variantes) | other | Ajuste SFT experimental, 98 descargas, sin benchmarks |
| Meta-Llama-3-8B-Instruct (original) | 8,03 B | 8.192 tokens | safetensors, GGUF (terceros) | Llama 3 Community License | Referencia de calidad y ampliamente evaluado; base de este ajuste |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Contexto mayor y licencia permisiva; alternativa para despliegue comercial |
| Qwen2.5-7B-Instruct | 7,62 B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Multilingue declarado y buen rendimiento en codigo y matematicas |

## Limitaciones y advertencias

- Modelo experimental con muy baja adopcion (98 descargas, 0 likes) y sin benchmarks publicados; no hay evidencia de calidad frente al Llama 3 8B Instruct original.
- El dataset de ajuste (`generator`) no esta documentado: se desconoce su composicion, tamano y posibles sesgos inyectados.
- El nombre sugiere una orientacion al coreano, pero la model card solo declara `en`; el comportamiento real en coreano no esta verificado.
- Riesgo de alucinacion propio de un modelo de 8B, agravado por la falta de evaluacion del ajuste.
- Licencia `other`: no se especifican terminos de uso comercial. Al derivar de Llama 3, es probable que apliquen restricciones de la Llama 3 Community License, pero debe verificarse antes de cualquier uso en produccion.
- No hay cuantizaciones imatrix para este modelo, por lo que las variantes IQ4_XS no ofrecen la mejora de calidad habitual.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; la model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S o Q4_K_M para uso general.
- El repo ocupa 71,8 GB por incluir todas las variantes; conviene descargar solo el archivo GGUF necesario.
- No se documenta soporte de tool calling, agentes ni contexto largo mas alla del nativo de Llama 3.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Meta-Llama-3-8B-Instruct_fictional_Korean_v1-GGUF
- Modelo base: https://huggingface.co/yzhuang/Meta-Llama-3-8B-Instruct_fictional_Korean_v1
- Pagina de descargas del autor: https://hf.tst.eu/model#Meta-Llama-3-8B-Instruct_fictional_Korean_v1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
