# mradermacher/Spark-X2.6-4B-abliterated-GGUF

## Resumen

Spark-X2.6-4B-abliterated-GGUF es una colección de cuantizaciones GGUF del modelo FrostWolfAI/Spark-X2.6-4B-abliterated, preparada por el cuantizador mradermacher, conocido por su catálogo de conversiones estáticas de modelos populares. El modelo base es una versión "abliterated" (con los mecanismos de rechazo del modelo original eliminados) de Spark-X2.6-4B, un modelo conversacional de 4.112 millones de parámetros orientado a uso local, con capacidades de razonamiento, tool calling y comportamiento agéntico según sus etiquetas.

La relevancia de esta ficha radica en el formato: los archivos GGUF permiten ejecutar el modelo en CPU y en GPUs de consumo mediante llama.cpp, Ollama u otros runtimes compatibles, con cuantizaciones que van desde 1,9 GB (Q2_K) hasta 8,3 GB (f16). Esto lo hace viable para despliegues on-device sin necesidad de hardware de servidor. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones adicionales.

Cabe destacar que la información disponible procede casi íntegramente del README del cuantizador, no de una model card técnica del modelo original, por lo que muchos detalles de arquitectura, entrenamiento y benchmarks no están documentados en la fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (famila de arquitecturas "spark" / sparkx2_5 según tags) |
| Parametros totales | 4.112.079.360 (≈4,1B, dato de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors con la libreria transformers) |

## Arquitectura y entrenamiento

Los datos de la model card no describen la arquitectura interna del modelo base ni su proceso de entrenamiento. Por los tags del repositorio (spark, sparkx2_5, spark-x2.6, on-device, agentic, tool-calling, reasoning), se trata de la version 2.6 de la familia Spark de FrostWolfAI, un modelo de ~4,1B de parametros enfocado a ejecucion local con capacidades agénticas y de razonamiento. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset ni uso de tecnicas de alineacion como RLHF o DPO.

El sufijo "abliterated" indica que se ha aplicado una tecnica de "abliteracion" (metodo HERETIC/ara segun los tags) que neutraliza los mecanismos internos de rechazo del modelo, eliminando sus negativas de seguridad. El resultado es un modelo "uncensored" cuyo comportamiento debe evaluarse con especial cautela antes de cualquier uso en produccion. Esta version de mradermacher son cuantizaciones estaticas de ese modelo; tambien existen cuantizaciones imatrix ponderadas en un repositorio hermano.

## Capacidades

- Generacion de texto conversacional (pipeline conversational segun los metadatos).
- Razonamiento (tag "reasoning"), aunque sin documentacion del formato de salida o thinking mode.
- Tool calling / function calling (tag "tool-calling").
- Comportamiento agéntico para flujos multi-paso (tag "agentic").
- Soporte bilingue: ingles y chino. No hay constancia de soporte para castellano.
- Ejecucion on-device gracias al formato GGUF, con cuantizaciones desde 1,9 GB.
- Modelo sin salvaguardas de seguridad (abliterated/uncensored): responde sin rechazos, lo que tambien implica ausencia de filtros.

## Casos de uso

- Chatbots locales sin censura: ejecucion offline en equipos de consumo con llama.cpp u Ollama, util para asistentes personales donde se controla el contenido generado.
- Agentes con tool calling en local: integracion en frameworks de agentes que requieren invocacion de funciones, aprovechando el tamano reducido (2,5-3,5 GB en Q4/Q5) para dejar espacio al resto del stack.
- Experimentacion con abliteracion e investigacion en seguridad: al ser un modelo decensado reproducible, sirve para estudiar el efecto de eliminar mecanismos de rechazo en modelos pequenos.
- Aplicaciones bilingues ingles-chino en dispositivos con recursos limitados: el tamano de las cuantizaciones Q2-Q4 cabe en portatiles sin GPU dedicada.
- Prototipado rapido de pipelines de razonamiento: los tags indican capacidades de reasoning, adecuada para pruebas de cadenas de pensamiento en entornos locales.
- Despliegues edge con hardware modesto: las cuantizaciones de 1,9-2,5 GB permiten uso en mini-PCs o equipos sin aceleradora, con la penalizacion de calidad correspondiente a cuantizaciones agresivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README del cuantizador solo incluye un grafico generico de perplejidad comparativa entre tipos de cuantizacion, sin cifras concretas para este modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion:
  - Q2_K: ~1,9 GB; Q3_K_M: ~2,3 GB; Q4_K_M: ~2,7 GB; Q5_K_M: ~3,1 GB; Q6_K: ~3,5 GB; Q8_0: ~4,5 GB; f16: ~8,3 GB. Anadir margen para el KV cache, que depende de la longitud de contexto (no documentada).
- GPUs recomendadas: cualquier GPU moderna con 4-6 GB de VRAM ejecuta las cuantizaciones Q4-Q6 con holgura (por ejemplo RTX 3060 12 GB, RTX 4060, RTX 4090). No se requieren A100 ni H100.
- Consumer GPUs y CPU: cabe sobradamente en GPUs de consumo; en CPU pura es viable con 8 GB de RAM para cuantizaciones Q2-Q5, con throughput reducido.
- Despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. La compatibilidad con vLLM o TGI no aplica directamente a los GGUF (usarian el modelo base en safetensors).
- Latencia y throughput: no disponibles; al ser un modelo de ~4B, se espera buena velocidad en GPU de consumo, especialmente con Q4_K_S/Q4_K_M, marcadas por el autor como "fast, recommended".

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| Spark-X2.6-4B-abliterated-GGUF | 4,1B | GGUF (12 cuants) | Apache 2.0 | Abliterated, tool calling, agentic, en/zh |
| Qwen2.5-3B-Instruct (GGUF) | 3,1B | GGUF/safetensors | Qwen license (uso comercial condicionado) | Multilingue amplio, benchmarks documentados |
| Llama-3.2-3B-Instruct (GGUF) | 3,2B | GGUF/safetensors | Llama 3.2 Community License | Ecosistema amplio, con salvaguardas de seguridad |
| Phi-3.5-mini-instruct (GGUF) | 3,8B | GGUF/safetensors | MIT | Buen rendimiento por parametro, contexto largo documentado |

Spark-X2.6-4B se diferencia por ser abliterated y por sus tags de capacidades agénticas; frente a las alternativas, carece de documentacion publica de benchmarks y su soporte de idiomas (solo en/zh) es mas limitado.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los mecanismos de rechazo de seguridad. Generara contenido que el modelo original negaria, incluido contenido potencialmente nocivo. No es apto para produccion sin capas de seguridad externas.
- Riesgo de alucinacion: no documentado, pero inherente a modelos de 4B; esperar mayor tasa de errores factuales que en modelos mayores.
- Idiomas: solo ingles y chino constan como soportados; el rendimiento en castellano no esta documentado y puede ser pobre.
- Longitud de contexto no publicada: imposible dimensionar el KV cache o casos de uso de documentos largos con certeza.
- Sin benchmarks publicos: no hay forma objetiva de comparar su calidad con modelos equivalentes antes de probarlo.
- Las cuantizaciones bajas (Q2_K, Q3_K_M) degradan apreciablemente la calidad segun la propia documentacion del cuantizador.
- Licencia Apache 2.0 sin restricciones de uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el desplegador.
- La informacion procede del README del cuantizador, no de una model card tecnica del autor original del modelo.

## Enlaces

- Repositorio GGUF (cuants estaticos): https://huggingface.co/mradermacher/Spark-X2.6-4B-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated
- Cuants imatrix ponderados: https://huggingface.co/mradermacher/Spark-X2.6-4B-abliterated-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Spark-X2.6-4B-abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
