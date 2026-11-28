# mradermacher/Gemma4-Writer-31B-G-i1-GGUF

## Resumen

Gemma4-Writer-31B-G-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo ConicCat/Gemma4-Writer-31B-G, un ajuste fino orientado a tareas de escritura creativa y generación de texto de aproximadamente 30.700 millones de parámetros. El repositorio no contiene un modelo original, sino una familia de ficheros GGUF con cuantizaciones de tipo i1 (imatrix) que abarcan desde IQ1_S hasta Q6_K, pensadas para ejecución local con llama.cpp y herramientas compatibles.

La relevancia de esta ficha es práctica: permite a desarrolladores e investigadores desplegar un modelo de 31B en hardware de consumo o en servidores modestos eligiendo el equilibrio adecuado entre tamaño, velocidad y calidad. Las cuantizaciones i1 emplean una matriz de importancia (imatrix) para preservar mejor la calidad en ratios de compresión agresivos, lo que resulta especialmente útil en los niveles bajos (IQ2, IQ3), donde las cuantizaciones estáticas suelen degradarse notablemente.

No se dispone de información detallada sobre la arquitectura interna, el contexto o los datos de entrenamiento del modelo base en la información proporcionada; esta ficha documenta lo que el repositorio GGUF ofrece y advierte explícitamente de los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base ConicCat/Gemma4-Writer-31B-G; presumiblemente transformer, sin confirmar) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se ha publicado en la información disponible la arquitectura interna del modelo base ConicCat/Gemma4-Writer-31B-G ni los detalles de su entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). El nombre sugiere una variante de la familia Gemma orientada a escritura ("Writer"), con 31B de parámetros, pero se trata de una inferencia no confirmada. El repositorio de mradermacher documenta únicamente el proceso de cuantización: cuantizaciones ponderadas por imatrix (versión de cuantización 2, conversión tipo hf), generadas con llama.cpp.

La innovación técnica destacable de este repositorio es el uso de imatrix para producir cuantizaciones i1, que según la documentación del autor ofrecen mejor relación calidad/tamaño que las cuantizaciones estáticas equivalentes, especialmente en los rangos IQ2 e IQ3. El autor indica además que se trata de un modelo de visión, por lo que los ficheros mmproj (si existen) se alojan en el repositorio estático hermano.

## Capacidades

- Generación de texto y escritura creativa: el modelo base está orientado explícitamente a tareas de escritura ("Writer"), aunque no se detallan las capacidades concretas en la información disponible.
- Conversación: la etiqueta "conversational" aparece en los tags del repositorio.
- Visión: el autor indica que es un modelo de visión; los ficheros mmproj estarían en el repositorio estático.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: el modelo base declara únicamente inglés.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Escritura creativa local: el modelo puede generar narrativa, artículos y contenido largo en inglés, y las cuantizaciones i1-Q4_K_M (18,8 GB) permiten ejecutarlo en una GPU de consumo de 24 GB como la RTX 4090.
- Prototipado en estaciones de trabajo sin GPU de datacenter: con cuantizaciones IQ3 (13-15 GB) se puede desplegar en GPUs de 16 GB o en configuraciones híbridas CPU/GPU mediante llama.cpp.
- Generación de contenido asistida por visión: si se descargan los ficheros mmproj del repositorio estático, el modelo puede procesar imágenes junto a texto, útil para descripción de imágenes o generación de contenido a partir de capturas.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 23 variantes de cuantización, lo que permite medir empíricamente la degradación de calidad frente al tamaño en tareas de escritura.
- Despliegue en entornos con restricciones de memoria: las variantes IQ2 (8,8-11 GB) permiten ejecutar un modelo de 31B en GPUs de 12 GB o incluso en sistemas con 16 GB de RAM mediante offload parcial.
- Integración en pipelines de generación de documentos: al ser GGUF compatible con llama.cpp, puede integrarse en servicios de generación de texto por lotes en servidores CPU, con throughput moderado y sin dependencia de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye únicamente una gráfica comparativa de perplejidad entre tipos de cuantización (referenciada por el autor), pero no cifras de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del fichero GGUF, más overhead de contexto):
  - i1-IQ1_S: 7,3 GB
  - i1-IQ2_M: 11,0 GB
  - i1-IQ3_S: 13,9 GB
  - i1-IQ4_XS: 16,8 GB
  - i1-Q4_K_M: 18,8 GB
  - i1-Q5_K_M: 21,9 GB
  - i1-Q6_K: 25,3 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K con contexto largo; GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super 16 GB) para IQ2 e IQ3.
- Cabe en GPU de consumo: sí, desde IQ2_M en adelante en GPUs de 12 GB; Q4_K_M en 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). El repositorio no incluye ficheros para vLLM ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Gemma4-Writer-31B-G-i1-GGUF | 30,7B | no disponible | apache-2.0 | GGUF (i1) | Cuantizaciones imatrix, 23 variantes |
| mradermacher/Gemma4-Writer-31B-G-GGUF | 30,7B | no disponible | apache-2.0 | GGUF (estático) | Mismo modelo base, cuantizaciones estáticas |
| ConicCat/Gemma4-Writer-31B-G | 30,7B | no disponible | apache-2.0 | safetensors | Modelo base original, pesos completos |

No se dispone de información sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es una cuantización, no un modelo entrenado por mradermacher; los sesgos y limitaciones del modelo base no están documentados en la información disponible.
- Riesgo de alucinación: no cuantificado; al ser un modelo orientado a escritura, la generación creativa puede producir contenido factualmente incorrecto.
- Idioma: el modelo base declara únicamente inglés; no se garantiza un rendimiento adecuado en castellano.
- Las cuantizaciones de baja precisión (IQ1, IQ2, Q2_K) degradan la calidad de forma significativa; el propio autor advierte "very low quality" en Q2_K_S y "for the desperate" en IQ1_S.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original, ya que la información disponible no detalla restricciones adicionales de la familia Gemma.
- Contexto máximo no documentado: no se puede planificar el uso con ventanas largas sin consultar el modelo base.
- El tamaño total del repositorio (334,8 GB) incluye todas las variantes; descargar una sola cuantización requiere seleccionar el fichero concreto.
- Para visión es necesario descargar los ficheros mmproj desde el repositorio estático hermano, no incluidos en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma4-Writer-31B-G-i1-GGUF
- Modelo base: https://huggingface.co/ConicCat/Gemma4-Writer-31B-G
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Gemma4-Writer-31B-G-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#Gemma4-Writer-31B-G-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
