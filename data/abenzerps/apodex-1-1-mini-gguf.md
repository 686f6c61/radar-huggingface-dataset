# abenzerps/Apodex-1.1-mini-GGUF

## Resumen

Apodex-1.1-mini-GGUF es la coleccion de cuantizaciones en formato GGUF del modelo apodex/Apodex-1.1-mini, un transformer de arquitectura Mixture of Experts (MoE) de 35.505.251.456 parametros totales construido sobre la familia Qwen3.5. El modelo original lo desarrolla Apodex AI y esta orientado a tareas de investigacion, analisis de datos, manejo de ficheros, generacion de codigo y flujos de trabajo basados en herramientas. Esta version GGUF la publica el usuario abenzerps para su uso con llama.cpp.

El interes practico de esta publicacion es que permite ejecutar un modelo MoE de 35,5B parametros en hardware de consumo mediante cuantizaciones que van desde 8,82 GB (IQ1_M) hasta 37,8 GB (Q8_0). Ademas, conserva la cabeza MTP/NextN del checkpoint original, lo que habilita decodificacion especulativa nativa en llama.cpp, e incluye el proyector visual F16 necesario para entrada de imagenes.

La relevancia reciente del modelo viene de su naturaleza multimodal y de su evaluacion con el arnes de agentes FrontierAgent de Apodex AI. En el flujo Agent Team obtuvo 27,7 en APEX-Agent, 50,2 en FrontierFinance y 51,7 en FrontierScience-Research, lo que lo situa como una opcion a considerar para tareas agenticas de dominio cientifico y financiero en entornos locales. La licencia Apache-2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), base Qwen3.5, con cabeza MTP/NextN |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 4096`) |
| Tipos de cuantizacion | IQ1_M, IQ2_M, Q2_K, IQ3_M, Q3_K_M, Q4 Selective (Q4_K_M), Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector visual en GGUF F16; pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas Mixture of Experts etiquetado por el autor como perteneciente a la familia Qwen3.5. La model card no detalla el numero de expertos, el ratio de activacion ni la distribucion de parametros activos por token, por lo que esos datos no estan disponibles. Una innovacion tecnica destacable es la presencia de una cabeza MTP (Multi-Token Prediction) / NextN en el checkpoint, que se conserva intacta en todas las cuantizaciones GGUF y permite usar decodificacion especulativa en llama.cpp mediante `--spec-type draft-mtp`.

La model card tampoco documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Lo unico verificable es la evaluacion reportada por Apodex AI con su propio arnes FrontierAgent, que no es un benchmark publico independiente. Las cuantizaciones IQ se generaron con una importance matrix incluida en el repo (`Apodex-1.1-mini-wiki-100x512.imatrix`), y la variante Q4 Selective aplica precision superior de forma selectiva en pesos clave.

## Capacidades

- Generacion de texto conversacional y razonamiento en ingles y chino.
- Generacion y analisis de codigo, con soporte para tareas de ingenieria de software.
- Trabajo con ficheros y documentos como parte de flujos de agente.
- Entrada multimodal de imagenes mediante el proyector `mmproj-Apodex-1.1-mini-F16.gguf` (899 MB), requerido para vision.
- Decodificacion especulativa MTP/NextN para acelerar la inferencia en llama.cpp.
- Orientacion a flujos agenticos multi-paso, segun la evaluacion con FrontierAgent y el flujo Agent Team.
- Plantilla de chat propia (`chat_template.jinja`) compatible con `--jinja`.
- Soporte de tool calling: no confirmado explicitamente en la informacion disponible, aunque la orientacion del modelo a "tool-driven work" lo sugiere.

## Casos de uso

- Analisis de documentos financieros en local: el modelo obtuvo 50,2 en FrontierFinance, por lo que es adecuado para extraer y razonar sobre informes y estados financieros sin enviar datos a la nube, usando Q4_K_M en una GPU de 24 GB.
- Asistencia a investigacion cientifica: con 51,7 en FrontierScience-Research, puede emplearse para resumir literatura, contrastar hipotesis y estructurar resultados dentro de un pipeline de agentes.
- Agentes multi-paso con herramientas: su evaluacion en APEX-Agent (27,7) y el soporte de MTP lo hacen util para orquestaciones donde la latencia por token importa, activando `--spec-type draft-mtp`.
- Generacion de codigo en entornos con requisitos de soberania del dato: al ejecutarse con llama.cpp sobre GGUF y licencia Apache-2.0, encaja en pipelines de CI/CD o revision de codigo on-premise.
- Procesamiento de imagenes y documentos escaneados: con el proyector F16 puede describir imagenes, extraer texto de capturas o interpretar diagramas en flujos de digitalizacion.
- Despliegue en estaciones de trabajo con VRAM limitada: la variante IQ2_M (12,2 GB) permite servir el modelo en GPUs de 16 GB, y IQ1_M (8,82 GB) en equipos de 12 GB, para prototipado y pruebas internas.
- Atencion al cliente o asistentes internos bilingues ingles-chino: el modelo cubre ambos idiomas de forma nativa, lo que sirve para soporte a usuarios en esas dos lenguas.

## Benchmarks y rendimiento

Los unicos datos disponibles son los reportados por Apodex AI con su arnes propio FrontierAgent sobre el checkpoint original, no sobre estas cuantizaciones.

| Benchmark | Apodex-1.1-mini | Contexto |
|---|---:|---|
| APEX-Agent (Agent Team) | 27,7 | Evaluacion propia de Apodex AI |
| FrontierFinance | 50,2 | Evaluacion propia de Apodex AI |
| FrontierScience-Research | 51,7 | Evaluacion propia de Apodex AI |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni mediciones de latencia o throughput para las cuantizaciones GGUF.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: IQ1_M 8,82 GB; IQ2_M 12,2 GB; Q2_K 13,2 GB; IQ3_M 16,0 GB; Q3_K_M 17,2 GB; Q4 Selective 19,8 GB; Q4_K_S 20,4 GB; Q4_K_M 21,7 GB; Q5_K_S 24,6 GB; Q5_K_M 25,3 GB; Q6_K 29,2 GB; Q8_0 37,8 GB. Hay que sumar espacio para el contexto KV y, si se usa vision, 899 MB del proyector.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_S; A100 40 GB o H100 para Q6_K y Q8_0; RTX 3090 (24 GB) para Q4_K_M.
- Cabe en GPU de consumo: si. Q4_K_M en RTX 4090 o 3090; IQ2_M e IQ3_M en GPUs de 16 GB; IQ1_M en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-mtmd-cli`), y por compatibilidad de formato, cualquier frontend basado en llama.cpp. No se confirma soporte de vLLM o TGI para estos ficheros GGUF.
- Latencia y throughput: no disponibles. La decodificacion especulativa MTP con `--spec-draft-n-max 3` esta pensada para reducirlos, pero no se publican cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos alternativos comparables en parametros, contexto o rendimiento, por lo que no es posible establecer una comparativa rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos generativos; no se publican tasas de factualidad ni evaluaciones de calibracion.
- Idiomas: solo se declaran ingles y chino. El rendimiento en castellano no esta verificado y previsiblemente sera inferior.
- Contexto: la longitud de contexto no se especifica; los ejemplos de la model card usan 4096 tokens, lo que sugiere precaucion al configurar ventanas mayores.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base apodex/Apodex-1.1-mini y las de Qwen3.5 si se redistribuye.
- Los benchmarks son autoevaluados por Apodex AI con su propio arnes (FrontierAgent), no verificados por terceros; deben tomarse como indicativos.
- Las cuantizaciones de baja precision (IQ1_M, IQ2_M, Q2_K) degradan la calidad de forma notable; IQ2_M es la opcion minima recomendada por el autor.
- La cabeza MTP y la decodificacion especulativa dependen de una version reciente de llama.cpp; versiones antiguas pueden no soportarlas.
- La entrada de imagenes requiere cargar el proyector F16 con `llama-mtmd-cli`; sin el, el modelo solo procesa texto.
- El repo pesa 247,4 GB por la suma de todas las cuantizaciones; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/abenzerps/Apodex-1.1-mini-GGUF
- Modelo base: https://huggingface.co/apodex/Apodex-1.1-mini
- Revision de la plantilla de chat: https://huggingface.co/apodex/Apodex-1.1-mini/commit/62583b464707ad58848bc2ab066747d8d5b02533
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper (arXiv 2608.23283): no disponible como enlace verificado en la informacion proporcionada
- Solicitud de modelos del autor: https://abenzerps.com/request-a-model/
