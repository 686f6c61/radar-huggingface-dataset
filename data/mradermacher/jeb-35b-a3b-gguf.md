# mradermacher/jeb-35b-a3b-GGUF

## Resumen

jeb-35b-a3b es un modelo de decisión (decision-model) desarrollado originalmente por szybkie-ai y cuantizado a formato GGUF por mradermacher. Con 35.505.251.456 parámetros totales y una nomenclatura que sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parámetros activos, el modelo está orientado a tareas de calibración, razonamiento de "sistema uno" y generación de salida estructurada. Su licencia Apache 2.0 facilita su adopción tanto en investigación como en entornos comerciales.

La relevancia de esta ficha radica en que el repositorio cuantizado ofrece un conjunto completo de cuantizaciones estáticas (desde Q2_K hasta Q8_0, además de variantes IQ4_XS y ficheros mmproj multimodales), lo que permite desplegar un modelo de 35.000 millones de parámetros en hardware de consumo con la calidad controlada por el usuario. El autor declara soporte para inglés y polaco, y etiquetas que apuntan a casos de uso conversacionales y de salida estructurada.

No obstante, la información pública disponible es limitada: no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha refleja exclusivamente los datos verificables del repositorio y de la model card, señalando explícitamente los campos no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la nomenclatura "a3b" sugiere MoE con ~3B activos, no confirmado en la documentación) |
| Parámetros totales | 35.505.251.456 |
| Parámetros activos | No disponible (posiblemente ~3.000 millones por la nomenclatura, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | f16 (implícito), Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | Inglés (en) y polaco (pl) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna más allá de las etiquetas `decision-model`, `calibration`, `system-one` y `structured-output`. El sufijo "a3b" en el nombre y el recuento de 35.500 millones de parámetros totales son compatibles con una arquitectura de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parámetros activos por token, patrón habitual en modelos como Qwen3-30B-A3B o similares; sin embargo, esta interpretación no está confirmada por la documentación del autor. Tampoco se especifica si se trata de un transformer denso, MoE o una arquitectura híbrida.

Respecto al entrenamiento, no se dispone de información sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o calibración posterior. Las etiquetas del repositorio sugieren un enfoque en decisiones calibradas y salidas estructuradas, lo que podría implicar un ajuste específico para tareas de clasificación, enrutamiento o generación de JSON, pero no hay evidencia documental que lo confirme. La cuantización ha sido realizada por mradermacher mediante cuantizaciones estáticas (sin imatrix ponderada, según indica el propio autor), partiendo del modelo base szybkie-ai/jeb-35b-a3b.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Modelo de decisión (`decision-model`) orientado a tareas de clasificación o enrutamiento.
- Calibración (`calibration`) de puntuaciones o probabilidades de decisión.
- Razonamiento de "sistema uno" (`system-one`), es decir, respuestas rápidas e intuitivas frente a deliberación extendida.
- Generación de salida estructurada (`structured-output`), útil para JSON, esquemas o formatos parseables.
- Soporte multimodal: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que indica capacidad de procesamiento de visión o entrada multimodal en el modelo base.
- Soporte multilingüe limitado a inglés y polaco según la model card.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en infraestructuras de inferencia estándar.

## Casos de uso

- Enrutamiento de consultas en sistemas de atención al cliente: el modelo puede clasificar y dirigir tickets o mensajes entrantes a la cola o agente adecuado, aprovechando su naturaleza de decision-model y su calibración para asignar confianza a cada decisión.
- Generación de JSON en pipelines de automatización: gracias a la etiqueta `structured-output`, puede producir respuestas parseables para integraciones con APIs, formularios o sistemas de extracción de datos.
- Moderación de contenido y clasificación de toxicidad: su capacidad de decisión calibrada permite umbrales ajustables y puntuaciones de confianza para revisión humana.
- Asistentes conversacionales en inglés y polaco: el soporte declarado de ambos idiomas lo hace adecuado para mercados centroeuropeos, con despliegue local mediante GGUF.
- Procesamiento de documentos con componente visual: los ficheros `mmproj` permiten incorporar entrada multimodal en flujos de extracción de información de imágenes o capturas.
- Despliegue en hardware de consumo para prototipado: las cuantizaciones Q4_K_S (20,5 GB) y Q4_K_M (21,8 GB) permiten ejecutar el modelo en GPUs de 24 GB o en configuraciones CPU+GPU, facilitando pruebas de concepto sin infraestructura de datacenter.
- Clasificación de intenciones en agentes de voz o chatbots: el modo "sistema uno" prioriza latencia baja, adecuado para decisiones rápidas en bucles de interacción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~13,3 GB; Q3_K_S ~15,6 GB; Q3_K_M ~17,3 GB; Q3_K_L ~18,7 GB; IQ4_XS ~19,5 GB; Q4_K_S ~20,5 GB; Q4_K_M ~21,8 GB; Q5_K_S ~24,7 GB; Q5_K_M ~25,4 GB; Q6_K ~29,3 GB; Q8_0 ~37,9 GB. Los ficheros mmproj añaden 0,7 GB (Q8_0) o 1,0 GB (f16).
- GPU recomendadas: para Q8_0 o Q6_K, GPUs de 40-48 GB (A100 40GB, A6000 48GB, L40S 48GB); para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q2_K-Q3_K, GPUs de 16-20 GB como RTX 4080 o A4000.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB con Q3_K_S o Q2_K, con posible offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el repositorio indica `endpoints_compatible`, lo que sugiere integración con infraestructuras de inferencia estándar. vLLM y TGI no están confirmados para este formato GGUF concreto.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de ~35B totales con posible activación de ~3B (si es MoE), el throughput podría ser notablemente superior al de un denso de 35B, pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| jeb-35b-a3b (este) | 35,5B | No disponible (~3B por nomenclatura) | No disponible | Apache 2.0 | GGUF | Decision-model, calibración, system-one, multimodal (mmproj) |
| Qwen3-30B-A3B | 30,5B | ~3,3B | 32K-128K (según variante) | Apache 2.0 | safetensors, GGUF | MoE generalista, multilingüe amplio |
| Mixtral 8x7B | 46,7B | ~12,9B | 32K | Apache 2.0 | safetensors, GGUF | MoE generalista, sin modo decisión específico |
| Llama 3.1 8B | 8B | 8B (denso) | 128K | Llama 3.1 Community | safetensors, GGUF | Denso, menor huella, multilingüe |

La comparación es aproximada: no hay benchmarks públicos de jeb-35b-a3b que permitan contrastar calidad frente a estas alternativas. La principal diferencia cualitativa es su orientación explícita a decisiones calibradas y salida estructurada, frente al enfoque generalista de los modelos citados.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos; al entrenarse presuntamente en inglés y polaco, el rendimiento en castellano y otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos generativos; la calibración declarada no elimina este riesgo en tareas abiertas.
- Longitud de contexto desconocida: no se puede garantizar el rendimiento en conversaciones largas o documentos extensos.
- Las cuantizaciones son estáticas y no ponderadas con imatrix, según indica el autor; las variantes de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podría tener condiciones adicionales no reflejadas en la model card del cuantizador; conviene verificar el repositorio original szybkie-ai/jeb-35b-a3b.
- El soporte multimodal depende de los ficheros mmproj y del runtime utilizado; no todos los backends GGUF gestionan visión de forma homogénea.
- Ausencia de benchmarks verificables impide comparar su rendimiento real con alternativas establecidas.
- El repositorio tiene un número muy bajo de descargas (517) y cero likes en el momento de la consulta, lo que sugiere poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/jeb-35b-a3b-GGUF
- Modelo base original: https://huggingface.co/szybkie-ai/jeb-35b-a3b
- Página de descargas del cuantizador: https://hf.tst.eu/model#jeb-35b-a3b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
