# mradermacher/Athena-27B-i1-GGUF

## Resumen

Athena-27B-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base athenaresearch/Athena-27B, un modelo de lenguaje de aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos en safetensors). El modelo original está orientado a tareas de agente de programación, uso de herramientas (tool use), razonamiento y soporte multilingüe, con especial énfasis en lenguas de la India además del inglés. Esta ficha describe la versión cuantizada distribuida en formato GGUF, pensada para inferencia local y despliegue con llama.cpp y derivados.

La relevancia de esta publicación radica en que reduce los requisitos de hardware del modelo original: los cuantizados van desde aproximadamente 7,2 GB (i1-IQ1_S) hasta 22,2 GB (i1-Q6_K), lo que permite ejecutar un modelo de ~27B en GPUs de consumo con suficiente VRAM en los niveles medios y altos de cuantización. Las cuantizaciones son de tipo i1 (imatrix), generadas con un fichero imatrix propio, lo que según el autor suele ofrecer mejor calidad que cuantizados estáticos de tamaño equivalente.

La licencia del modelo es Apache 2.0, lo que facilita el uso comercial. El repositorio ocupa 300,3 GB e incluye múltiples variantes de cuantización. No se dispone de información detallada sobre arquitectura interna, longitud de contexto o datos de entrenamiento en la información proporcionada, por lo que esos apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, detalles no especificados) |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; además fichero imatrix |
| Idiomas soportados | en, hi, bn, ta, te, mr, gu, kn, ml, pa, ur |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna del modelo base Athena-27B (tipo de transformer, uso de atención lineal, mezcla de expertos u otras innovaciones). El modelo base es athenaresearch/Athena-27B y los tags indican orientación a coding-agent, agents, tool-use, reasoning y multilingual, con foco en la India. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

Respecto a esta publicación concreta, se trata de cuantizaciones i1 (imatrix) generadas por mradermacher con un fichero imatrix propio (Athena-27B.imatrix.gguf), lo que permite crear cuantizados de mayor calidad que los estáticos de tamaño comparable. El autor indica que el modelo es de visión y que los ficheros mmproj, si existen, se encuentran en el repositorio estático (mradermacher/Athena-27B-GGUF). El proceso de conversión se realizó desde formato HF (convert_type: hf) con output_tensor_quantised: 1.

## Capacidades

- Generación de texto conversacional y razonamiento, según los tags del modelo (reasoning, conversational).
- Agente de programación (coding-agent): orientado a tareas de escritura y manipulación de código.
- Uso de herramientas y function calling (tool-use, agents).
- Razonamiento multi-paso para flujos de agente.
- Capacidades multilingües: inglés y lenguas de la India (hindi, bengalí, tamil, telugu, maratí, guyaratí, canarés, malayalam, panyabí, urdu).
- Posible soporte de visión: el autor indica que es un modelo de visión y que los mmproj estarían en el repositorio estático; no se confirma en esta publicación.
- No se dispone de información sobre modo thinking explícito, audio u otras capacidades especiales.

## Casos de uso

- Asistente de programación local: con cuantizados Q4_K_M (16,6 GB) o Q5_K_M (19,3 GB) puede desplegarse en una GPU de 24 GB para autocompletado, refactorización y generación de código en entornos sin conexión.
- Agente con tool calling en pipelines de CI/CD: los tags de tool-use y agents permiten integrar el modelo en flujos que invocan herramientas (ejecución de tests, consultas a APIs) mediante un runtime compatible con GGUF.
- Atención al cliente multilingüe en la India: el soporte de en, hi, bn, ta, te, mr, gu, kn, ml, pa y ur lo hace adecuado para conversaciones multi-turno en esos idiomas, aunque la longitud de contexto no está confirmada.
- Despliegue en estaciones de trabajo con GPU de consumo: las variantes IQ3_M (12,7 GB) o Q4_K_S (15,7 GB) caben en GPUs de 16 GB, permitiendo prototipado local de agentes.
- Investigación y evaluación de cuantizaciones: el fichero imatrix y el amplio rango de cuantizados (de IQ1_S a Q6_K) permiten estudiar el compromiso calidad/tamaño en un modelo de ~27B.
- Razonamiento asistido en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp, los datos no salen del equipo, útil para sectores regulados.
- Generación de código en producción con recursos limitados: el cuantizado Q2_K (10,8 GB) o IQ2_M (10,1 GB) permite ejecutar el modelo en GPUs de 12 GB, con la consiguiente pérdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del fichero GGUF, más overhead de contexto y KV cache):
  - i1-IQ1_S: ~7,2 GB; i1-IQ1_M: ~7,7 GB.
  - i1-IQ2_XXS: ~8,5 GB; i1-IQ2_XS: ~9,2 GB; i1-IQ2_S: ~9,5 GB; i1-IQ2_M: ~10,1 GB.
  - i1-Q2_K_S: ~10,3 GB; i1-Q2_K: ~10,8 GB.
  - i1-IQ3_XXS: ~11,3 GB; i1-IQ3_XS: ~12,1 GB; i1-Q3_K_S: ~12,2 GB; i1-IQ3_S: ~12,5 GB; i1-IQ3_M: ~12,7 GB; i1-Q3_K_M: ~13,4 GB; i1-Q3_K_L: ~14,4 GB.
  - i1-IQ4_XS: ~15,2 GB; i1-Q4_0: ~15,6 GB; i1-Q4_K_S: ~15,7 GB; i1-Q4_K_M: ~16,6 GB; i1-Q4_1: ~17,2 GB.
  - i1-Q5_K_S: ~18,8 GB; i1-Q5_K_M: ~19,3 GB.
  - i1-Q6_K: ~22,2 GB.
- GPU recomendadas: para Q4_K_M y superiores, GPUs de 24 GB (RTX 3090, RTX 4090, A10G) o superiores (A100 40/80 GB, H100) si se busca contexto largo; para IQ3_M o Q4_K_S, GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB); para cuantizados IQ2, GPUs de 12 GB (RTX 3060 12 GB, RTX 4070).
- Cabe en GPU de consumo: sí, desde IQ2_M en 12 GB hasta Q6_K en 24 GB; los cuantizados IQ1 son para entornos con VRAM muy limitada.
- Opciones de despliegue: llama.cpp, Ollama, y otros runtimes compatibles con GGUF; el repositorio indica endpoints_compatible y librería transformers para el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, esta publicación se compara con sus propias variantes:

| Variante | Tipo | Tamaño (GB) | Nota del autor |
|---|---|---|---|
| Athena-27B-i1-GGUF (i1-Q4_K_M) | imatrix | 16,6 | rápido, recomendado |
| Athena-27B-GGUF (estático) | estático | no disponible | cuantizados estáticos del mismo modelo base |
| Modelo base athenaresearch/Athena-27B | safetensors | no disponible en esta ficha | pesos originales sin cuantizar |

## Limitaciones y advertencias

- Los cuantizados de baja precisión (IQ1_S, IQ1_M, Q2_K_S, Q2_K, IQ2_*) degradan la calidad de forma notable; el propio autor califica IQ1_S como "for the desperate" y Q2_K_S como "very low quality".
- No se dispone de información sobre sesgos del modelo base; al ser un modelo con foco en lenguas de la India, el equilibrio entre idiomas puede no ser uniforme.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay datos específicos de evaluación en esta publicación.
- La longitud de contexto no está confirmada, lo que impide garantizar conversaciones multi-turno largas.
- El modelo es de visión según el autor, pero los ficheros mmproj no están en este repositorio; para uso multimodal hay que acudir al repositorio estático.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del modelo base y de los datos de entrenamiento originales.
- El repositorio ocupa 300,3 GB; la descarga completa es costosa y conviene seleccionar solo la variante necesaria.
- No se han publicado benchmarks en la información disponible, por lo que el rendimiento real debe validarse en el caso de uso concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Athena-27B-i1-GGUF
- Modelo base: https://huggingface.co/athenaresearch/Athena-27B
- Cuantizados estáticos: https://huggingface.co/mradermacher/Athena-27B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Athena-27B-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad de cuantizados (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
