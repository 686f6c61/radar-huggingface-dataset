# mradermacher/Keural-MoE-Pro-v1.0-i1-GGUF

## Resumen

Keural-MoE-Pro-v1.0-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base mkd-ai/Keural-Nova-1.0, un modelo de arquitectura Mixture-of-Experts (MoE) afinado con instrucciones mediante LoRA y orientado a los idiomas coreano e inglés. El repositorio no contiene pesos originales en safetensors, sino ficheros GGUF preparados para inferencia con llama.cpp y derivados, empleando cuantizaciones con matriz de importancia (imatrix) para preservar la calidad en rangos de compresión agresivos.

El modelo original cuenta con 35.505.251.456 parámetros totales según los safetensors del modelo base, lo que lo sitúa en la franja de los ~35B. Al tratarse de un MoE, el número de parámetros activos por token es previsiblemente inferior al total, aunque el dato concreto no está disponible en la información proporcionada. La ventana de contexto, la composición del dataset de entrenamiento y los detalles del proceso de alineación tampoco se especifican en la documentación accesible.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo MoE de ~35B en hardware de consumo o en servidores modestos, gracias a cuantizaciones que van desde 13,3 GB (i1-Q2_K) hasta 29,3 GB (i1-Q6_K). Es una opción interesante para desarrolladores que necesiten capacidades conversacionales y multilingües (coreano/inglés) con licencia Apache 2.0 y sin depender de infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, según tags del repositorio |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de imatrix suelto) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base mkd-ai/Keural-Nova-1.0 emplea una arquitectura Mixture-of-Experts, tal y como indican las etiquetas del repositorio (`moe`) y el propio nombre del modelo cuantizado. Se ha afinado mediante instrucciones con LoRA (`lora`, `instruction-tuning`), un enfoque que permite adaptar un modelo preentrenado a tareas conversacionales con un coste computacional menor que un ajuste completo. El repositorio de mradermacher no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable de esta publicación es el uso de cuantizaciones con matriz de importancia (imatrix) de tipo `i1`, generadas con llama.cpp. Estas cuantizaciones ponderan la importancia de cada tensor durante la compresión, lo que permite obtener ficheros de menor tamaño con una degradación de calidad reducida en comparación con las cuantizaciones estáticas equivalentes. El autor indica explícitamente que las variantes IQ suelen ser preferibles a las Q de tamaño similar, y que la i1-Q4_K_M es la opción recomendada por equilibrio entre velocidad y calidad.

## Capacidades

- Generación de texto conversacional en coreano e inglés, orientada a instrucciones.
- Razonamiento multi-turno y mantenimiento de contexto conversacional (longitud exacta no disponible).
- Ajuste por instrucciones (instruction-tuning) mediante LoRA, lo que favorece el seguimiento de directrices.
- Capacidades multilingües limitadas a coreano e inglés según la model card.
- Compatibilidad con el ecosistema GGUF (llama.cpp y derivados), lo que facilita su integración en herramientas de inferencia local.
- No se documentan capacidades de visión, audio, tool calling ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Asistente conversacional en coreano para atención al cliente: el modelo puede gestionar diálogos multi-turno en coreano con un coste de despliegue contenido gracias a las cuantizaciones de 13-22 GB, adecuadas para servidores con una sola GPU.
- Traducción y localización coreano-inglés: al estar entrenado en ambos idiomas, puede emplearse en pipelines de traducción automática o revisión de textos bilingües, con la ventaja de ejecutarse en local sin enviar datos a terceros.
- Generación de contenido editorial en coreano: redacción de borradores, resúmenes y reescritura de textos para medios o blogs, aprovechando el ajuste por instrucciones para controlar el tono y el formato.
- Prototipado de chatbots en entornos de investigación: la licencia Apache 2.0 y la disponibilidad de GGUF permiten experimentar con un MoE de ~35B en estaciones de trabajo con GPU de consumo (por ejemplo, RTX 4090 con cuantización i1-Q4_K_S).
- Procesamiento de documentación técnica bilingüe: extracción de información y respuestas sobre manuales en coreano e inglés, desplegando el modelo con llama.cpp en un servidor interno.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un abanico amplio de cuantizaciones (desde Q2_K hasta Q6_K) que permite a investigadores medir el impacto de la compresión en la calidad de un MoE, usando el fichero imatrix para generar cuantizaciones propias.
- Integración en aplicaciones de escritorio sin conexión: al caber en 13-22 GB, puede embeberse en herramientas locales para usuarios que requieran privacidad y funcionamiento offline en coreano o inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del fichero GGUF):
  - i1-Q2_K: ~13,3 GB
  - i1-IQ3_S / i1-Q3_K_S: ~15,6-15,7 GB
  - i1-Q4_K_S: ~20,5 GB
  - i1-Q4_K_M: ~21,8 GB
  - i1-Q5_K_M: ~25,4 GB
  - i1-Q6_K: ~29,3 GB
- GPU recomendadas: para cuantizaciones Q4, una RTX 4090 (24 GB) o A100 40 GB; para Q5/Q6, A100 40 GB, H100 80 GB o configuraciones multi-GPU.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q2_K a Q4_K_M caben en GPUs de 16-24 GB (RTX 4080, RTX 4090, RTX A5000). Las variantes Q5 y Q6 requieren 32 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para servidores, llama.cpp con servidor HTTP o vLLM si se convierte a otro formato (no documentado).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada. A modo orientativo, se puede comparar con otras alternativas MoE de tamaño similar, pero los datos de rendimiento no están disponibles.

| Modelo | Parámetros totales | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Keural-MoE-Pro-v1.0 (este) | 35,5B | no disponible | Apache 2.0 | GGUF |
| Modelos MoE comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas limitados a coreano e inglés; el rendimiento en castellano no está garantizado ni documentado.
- No se han publicado benchmarks, por lo que no es posible verificar la calidad frente a alternativas.
- Riesgo de alucinación inherente a los modelos generativos, agravado en cuantizaciones agresivas (Q2_K, Q3) donde la degradación de calidad es mayor.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden producir respuestas menos coherentes; el autor recomienda IQ3_XXS o superiores.
- No se documentan sesgos específicos del modelo base, pero al estar entrenado principalmente en coreano e inglés puede reflejar sesgos culturales y lingüísticos de esos corpus.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base mkd-ai/Keural-Nova-1.0 y las condiciones de los datos de entrenamiento originales.
- El repositorio tiene un número muy bajo de descargas (168) y ningún "like", lo que sugiere poca validación por parte de la comunidad.
- No se especifica la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.

## Enlaces

- Repositorio Hugging Face (i1-GGUF): https://huggingface.co/mradermacher/Keural-MoE-Pro-v1.0-i1-GGUF
- Repositorio Hugging Face (GGUF estático): https://huggingface.co/mradermacher/Keural-MoE-Pro-v1.0-GGUF
- Modelo base: https://huggingface.co/mkd-ai/Keural-Nova-1.0
- Página de descargas del autor: https://hf.tst.eu/model#Keural-MoE-Pro-v1.0-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Ficha en free2aitools: https://free2aitools.com/model/mradermacher/keural-moe-pro-v1.0-gguf
