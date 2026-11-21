# mradermacher/ARM-14B-GGUF

## Resumen

ARM-14B es un modelo de lenguaje conversacional de aproximadamente 14.770 millones de parametros, desarrollado originalmente por el equipo arm-team y publicado en Hugging Face bajo el identificador `arm-team/ARM-14B`. La ficha que nos ocupa, `mradermacher/ARM-14B-GGUF`, no es el modelo original sino una coleccion de cuantizaciones estaticas en formato GGUF preparadas por mradermacher, un conocido autor de cuantizaciones de la comunidad open source, para facilitar la inferencia local en hardware de consumo mediante llama.cpp y derivados.

El modelo esta etiquetado como conversacional (`conversational`) y solo declara soporte para ingles (`en`). No se dispone de informacion publica en la model card sobre arquitectura interna, datos de entrenamiento, longitud de contexto ni licencia, lo que limita seriamente cualquier evaluacion tecnica rigurosa. El repositorio GGUF ocupa 102 GB e incluye diez variantes de cuantizacion que van desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB).

La relevancia de esta ficha es fundamentalmente practica: permite ejecutar un modelo de 14B en GPUs de consumo con cuantizaciones Q4 o Q5 manteniendo un equilibrio razonable entre calidad y huella de memoria. No obstante, al carecer de benchmarks publicados y de informacion sobre el proceso de entrenamiento, debe tratarse como un modelo de procedencia incierta para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only, no confirmado) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio separado |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (transformers como libreria declarada); pesos originales presumiblemente safetensors en el repo base |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura del modelo base `arm-team/ARM-14B`: la model card del repositorio GGUF se limita a indicar que se trata de cuantizaciones estaticas del modelo original y no incluye detalles sobre tipo de transformer, atencion, capas, dimensiones ocultas ni estrategia de entrenamiento. El recuento real de parametros (14.770.033.664) es coherente con un modelo denso de la familia 14B, pero no confirma ni descarta variantes MoE, hibridas o SSM.

Respecto al entrenamiento, no consta el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineamiento como RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. Las cuantizaciones de mradermacher siguen el pipeline habitual de conversion HF a GGUF (convert_type: hf) con cuantizacion de tensores de salida (output_tensor_quantised: 1) y version de cuantizacion 2; adicionalmente, existe un repositorio paralelo con cuantizaciones ponderadas/imatrix (`mradermacher/ARM-14B-i1-GGUF`) que suelen ofrecer mejor calidad por tamano que las estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Soporte de inferencia en ingles; no se declaran otros idiomas.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere uso via API en plataformas de inferencia.
- No consta soporte documentado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Al ser un modelo de 14B, es razonable esperar capacidades basicas de codigo, matematicas y redaccion, pero no hay evidencia publicada que lo confirme.

## Casos de uso

- Asistente conversacional local: con cuantizaciones Q4_K_M (9,1 GB) o Q5_K_M (10,6 GB) el modelo cabe en GPUs de consumo de 12-16 GB y permite desplegar un chatbot en ingles sin dependencia de la nube.
- Prototipado rapido en estaciones de trabajo: usar Q4_K_S (8,7 GB) con llama.cpp u Ollama para iterar sobre prompts y plantillas de sistema antes de comprometer recursos mayores.
- Generacion de texto en ingles para documentacion tecnica: el modelo puede redactar borrafos y resumir contenido, aunque la ausencia de benchmarks obliga a validacion humana.
- Despliegue en servidores con multiples usuarios: Q8_0 (15,8 GB) en una GPU de 24 GB (RTX 4090, A10G) permite servir varias sesiones concurrentes con vLLM o TGI si se confirma compatibilidad GGUF.
- Evaluacion comparativa interna: usar las distintas cuantizaciones (Q2_K a Q8_0) para medir degradacion de calidad frente a memoria, un caso util para equipos que calibran pipelines de cuantizacion.
- Fine-tuning ligero sobre el modelo base: el repo original `arm-team/ARM-14B` puede servir de punto de partida para LoRA en ingles, aunque la falta de licencia clara es un riesgo.
- Experimentacion en CPU: Q2_K (5,9 GB) y Q3_K_S (6,8 GB) permiten ejecucion en CPU con RAM moderada, util para demos en portatiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin overhead de contexto): Q2_K ~5,9 GB; Q3_K_S ~6,8 GB; IQ4_XS ~8,3 GB; Q4_K_M ~9,1 GB; Q5_K_M ~10,6 GB; Q6_K ~12,2 GB; Q8_0 ~15,8 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4/Q5; RTX 4090 24 GB o A10G 24 GB para Q6/Q8_0 con contexto moderado; A100 40/80 GB y H100 para servir Q8_0 con contextos largos o batching.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB (Q4_K_M), RTX 4060 Ti 16 GB (Q5_K_M), RTX 4070 Ti Super 16 GB (Q6_K) y RTX 4090 24 GB (Q8_0).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF; vLLM y TGI solo si se confirma soporte GGUF en la version desplegada (no documentado en esta ficha).
- Latencia y throughput: no disponibles; dependera del hardware, de la cuantizacion y de la longitud de contexto, que no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ARM-14B (GGUF, esta ficha) | 14,77B | no disponible | no disponible | GGUF | Hugging Face |
| Qwen2.5-14B-Instruct | 14,7B | 32.768 tokens (128K con YaRN) | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |
| Mistral-Nemo-Instruct-2407 | 12,2B | 128K tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |
| Phi-3-Medium-14B | 14B | 4K-128K segun variante | MIT | safetensors, GGUF | Hugging Face, Ollama |

La comparativa se ofrece como referencia de categoria (modelos densos de 12-15B con cuantizaciones GGUF disponibles); no se dispone de datos de rendimiento de ARM-14B para establecer comparaciones objetivas con estos modelos.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia de calidad en MMLU, HumanEval, GSM8K ni tareas conversacionales.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; tratar como no apto para produccion hasta aclararlo con el autor del modelo base.
- Solo ingles declarado: el rendimiento en castellano no esta garantizado y probablemente sera deficiente.
- Longitud de contexto desconocida: limita el diseno de aplicaciones con documentos largos o conversaciones extensas.
- Riesgo de alucinacion no cuantificado: sin evaluacion publicada, no se puede estimar la tasa de errores facticos.
- Procedencia y mantenimiento inciertos: el modelo base `arm-team/ARM-14B` no tiene documentacion publica en la informacion disponible; el repositorio GGUF se actualizo en noviembre de 2026, lo que sugiere cierto mantenimiento, pero no hay garantias.
- Cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la coherencia; para uso real se recomienda Q4_K_M o superior.
- Sesgos: no documentados; al entrenarse presumiblemente en ingles, heredara sesgos culturales y linguisticos de ese corpus.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ARM-14B-GGUF
- Modelo base: https://huggingface.co/arm-team/ARM-14B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/ARM-14B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#ARM-14B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplexidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Patrocinador del autor: https://www.nethype.de/
