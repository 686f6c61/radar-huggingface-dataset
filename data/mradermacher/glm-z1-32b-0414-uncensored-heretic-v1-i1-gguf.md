# mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v1-i1-GGUF

## Resumen

GLM-Z1-32B-0414-uncensored-heretic-v1-i1-GGUF es una cuantización GGUF del modelo GLM-Z1-32B-0414, un transformer denso de 32.566.081.536 parámetros desarrollado originalmente por Zhipu AI (familia GLM) y posteriormente modificado por llmfan46 para eliminar los mecanismos de rechazo y alineación de seguridad (técnicas de "abliteration" o "decensoring"). El resultado es un modelo de razonamiento de gran tamano con capacidades de generación de texto y código, pero sin las restricciones de contenido habituales.

La versión que nos ocupa ha sido cuantizada por mradermacher, un conocido publicador de cuantizaciones GGUF, utilizando el método i1 (imatrix) con el objetivo de preservar la calidad del modelo original en el menor tamano posible. El repositorio incluye un amplio abanico de cuantizaciones que van desde IQ1_S (7,4 GB) hasta Q6_K, lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con 8-12 GB de VRAM hasta estaciones de trabajo con 24 GB o más.

El modelo es relevante para desarrolladores e investigadores que necesitan un LLM de razonamiento de 32B ejecutable localmente con llama.cpp u Ollama, sin las limitaciones de contenido de los modelos alineados. Su licencia MIT facilita el uso comercial, aunque la naturaleza "uncensored" del modelo implica riesgos importantes que deben evaluarse cuidadosamente antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia GLM-Z1) |
| Parametros totales | 32.566.081.536 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, i1-IQ3_M (imatrix incluida) |
| Idiomas soportados | zh, en |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base GLM-Z1-32B-0414 más allá de que se trata de un transformer denso de 32.566.081.536 parámetros. La familia GLM-Z1 de Zhipu AI se caracteriza por incorporar capacidades de razonamiento extendido (modo "thinking"), pero no se dispone en la documentacion proporcionada de datos concretos sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación empleadas (RLHF, DPO, etc.).

La modificación "uncensored-heretic-v1" realizada por llmfan46 sobre el modelo base consiste en la eliminación de los mecanismos de rechazo y alineación de seguridad, presumiblemente mediante técnicas de abliteration (ablación de direcciones de activación asociadas al rechazo) o fine-tuning con datasets "decensored". La cuantización i1 de mradermacher utiliza una matriz de importancia (imatrix) generada a partir del modelo base para optimizar la asignación de bits por tensor, lo que según el autor mejora la calidad frente a cuantizaciones estáticas del mismo tamano.

## Capacidades

- Generación de texto conversacional multi-turno en chino e inglés.
- Razonamiento paso a paso con modo "thinking" (heredado de la familia GLM-Z1).
- Generación y explicación de código en lenguajes habituales.
- Razonamiento matemático y resolución de problemas.
- Respuestas sin restricciones de contenido (modelo "uncensored").
- Capacidades multilingües limitadas a chino e inglés según la model card.
- No se ha confirmado soporte de tool calling o function calling en la informacion disponible.
- No se ha confirmado soporte de visión, audio ni otras modalidades.
- Compatible con endpoints (tag "endpoints_compatible") y con el ecosistema transformers/llama.cpp.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparándolo con su versión alineada para analizar sesgos, respuestas a prompts sensibles y eficacia de las técnicas de abliteration.
- Generación de código en local: con cuantizaciones Q4_K_M (19,8 GB) o Q5_K_M (23,2 GB) puede ejecutarse en una RTX 4090 o A100 para asistencia de programación offline, sin dependencia de APIs externas.
- Razonamiento matemático en entornos aislados: su modo de razonamiento extendido lo hace útil para resolver problemas paso a paso en escenarios air-gapped donde no se permite enviar datos a la nube.
- Procesamiento de documentación técnica en chino e inglés: adecuado para resumir, traducir y extraer información de textos técnicos en ambos idiomas.
- Experimentación con cuantizaciones extremas: el repositorio ofrece desde IQ1_S (7,4 GB) hasta Q6_K, lo que permite estudiar la degradación de calidad en función de la compresión en hardware de gama baja.
- Desarrollo de personajes o narrativa sin filtros: para proyectos creativos que requieran respuestas sin restricciones temáticas, con la advertencia de los riesgos asociados.
- Evaluación de riesgos en pipelines de moderación: usar el modelo como generador adversarial para probar sistemas de moderación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamano de cuantización):
  - i1-IQ1_S: ~7,4 GB de pesos, requiere ~9-10 GB de VRAM con contexto moderado.
  - i1-IQ2_M: ~11,4 GB de pesos, requiere ~13-14 GB de VRAM.
  - i1-Q3_K_M: ~16,0 GB de pesos, requiere ~18 GB de VRAM.
  - i1-Q4_K_M: ~19,8 GB de pesos, requiere ~22 GB de VRAM (recomendada por el autor como "fast, recommended").
  - i1-Q5_K_M: ~23,2 GB de pesos, requiere ~25-26 GB de VRAM.
  - i1-Q6_K: disponible en el repositorio, requiere ~28 GB o más.
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M o Q5_K_S con contexto moderado.
  - A100 40 GB / H100 80 GB: Q5_K_M o Q6_K con contexto largo.
  - RTX 3090 (24 GB): Q4_K_M.
  - GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB): solo cuantizaciones IQ1/IQ2, con calidad degradada.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M; en GPUs de 12 GB solo con cuantizaciones IQ1/IQ2 de baja calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con servidores de inferencia tipo OpenAI-compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-Z1-32B-0414-uncensored-heretic-v1-i1-GGUF (este) | 32,6B | no disponible | MIT | GGUF | Version sin censura, cuantizada con imatrix |
| GLM-Z1-32B-0414 (original, Zhipu AI) | 32,6B | no disponible | no disponible | safetensors | Modelo base alineado, con rechazos de seguridad |
| Qwen2.5-32B-Instruct | 32,5B | 128K (según documentación pública) | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamano similar, alineada |
| DeepSeek-R1-Distill-Qwen-32B | 32,8B | 128K (según documentación pública) | MIT | safetensors, GGUF | Modelo de razonamiento destilado de tamano comparable |

Nota: los datos de contexto y rendimiento de los modelos comparativos provienen de documentación pública general y no de la informacion proporcionada en esta ficha; verificar antes de usarlos en producción.

## Limitaciones y advertencias

- Modelo "uncensored": no aplica filtros de seguridad, por lo que puede generar contenido ofensivo, ilegal o peligroso. No apto para aplicaciones orientadas al público sin moderación adicional.
- Riesgo elevado de alucinación, especialmente en cuantizaciones bajas (IQ1, IQ2) donde la degradación de calidad es significativa.
- Idiomas soportados limitados a chino e inglés; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no documentada en la informacion disponible; verificar en el modelo base antes de usarlo con contextos largos.
- La licencia MIT del repositorio de cuantización no exime de responsabilidades legales por el uso del contenido generado; el modelo base puede tener condiciones adicionales no reflejadas.
- Las cuantizaciones por debajo de Q3 pueden presentar degradación notable en razonamiento y coherencia.
- No se ha verificado soporte de tool calling ni de agentes; no asumir su disponibilidad en producción.
- El repositorio tiene 350,1 GB, lo que requiere espacio en disco considerable si se descargan varias cuantizaciones.
- Fecha de creación del repositorio (2026-11-22) posterior a la fecha actual de muchos entornos; verificar disponibilidad y procedencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v1-i1-GGUF
- Modelo base (llmfan46): https://huggingface.co/llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v1
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#GLM-Z1-32B-0414-uncensored-heretic-v1-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
