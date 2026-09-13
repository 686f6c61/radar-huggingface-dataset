# mradermacher/Gemma-4-26B-A4B-StyleTune-QK-Heretic-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo SubMaroon/Gemma-4-26B-A4B-StyleTune-QK-Heretic, publicadas por mradermacher. Se trata, por tanto, de una conversión de formato orientada al despliegue local y a motores basados en llama.cpp, no de un modelo entrenado desde cero. El modelo de origen es un merge afinado para roleplay y conversación, con la etiqueta "heretic" que en el ecosistema suele identificar variantes ablacionadas o con los mecanismos de rechazo reducidos, y con la etiqueta "base-model", que indica que no se trata de un modelo instruct convencional.

El modelo subyacente sigue la convención de nombres de la familia Gemma 4 con arquitectura de mezcla de expertos (MoE, según la etiqueta "moe" del repositorio), con 25 971 339 550 parámetros totales reportados en safetensors (unos 25,97 mil millones). El sufijo "A4B" del nombre sugiere del orden de 4 000 millones de parámetros activos por token, pero este dato no aparece confirmado en la documentación proporcionada. El repositorio distribuye 11 cuantizaciones distintas, desde Q2_K (10,9 GB) hasta Q8_0 (27,7 GB), con un tamaño total de 187,7 GB.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo de ~26B totales en hardware de consumo mediante cuantizaciones Q4 y Q5, y por otro, ofrece una alternativa de pesos abiertos bajo licencia Apache 2.0 para casos de uso de narrativa interactiva y roleplay en inglés. No hay resultados de benchmarks publicados en la información disponible, y el idioma declarado es únicamente el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) según la etiqueta "moe"; familia identificada como gemma4. Detalles de capas, número de expertos y mecanismo de atención: no disponibles |
| Parámetros totales | 25 971 339 550 (≈25,97 mil millones), según el recuento de safetensors reportado |
| Parámetros activos | No disponible (el sufijo "A4B" del nombre sugiere ~4 000 millones activos, sin confirmar en la documentación) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; el autor menciona además x-f16 en los metadatos internos. Existe un repositorio aparte con cuantizaciones ponderadas/imatrix (i1) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en este repositorio; el modelo original se distribuye en safetensors (el recuento de parámetros reportado procede de safetensors) |
| Autor de la cuantización | mradermacher |
| Modelo base | SubMaroon/Gemma-4-26B-A4B-StyleTune-QK-Heretic |
| Pipeline declarado | No disponible |
| Fecha de publicación | 13 de septiembre de 2026 (última actualización: 13 de septiembre de 2026) |
| Tamaño del repositorio | 187,7 GB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de las etiquetas del repositorio: "gemma4" y "moe" indican que el modelo base pertenece a la familia Gemma 4 y que emplea una arquitectura de mezcla de expertos. El recuento de safetensors confirma 25 971 339 550 parámetros totales. No se documentan el número de expertos, el número de expertos activos por token, la dimensión de las capas, el tipo de posicional encoding, ni si se combina atención clásica con mecanismos alternativos.

Tampoco hay información sobre el proceso de entrenamiento: se desconoce el volumen de tokens, la composición del dataset, si hubo fases de ajuste supervisado, RLHF o DPO. Las etiquetas "merge" y "roleplay" indican que el modelo de origen es el resultado de una fusión de pesos orientada a estilo conversacional y narrativo, y "heretic" apunta a una variante con el comportamiento de rechazo atenuado respecto al modelo alineado original. El proceso aplicado en este repositorio concreto es únicamente la cuantización a GGUF (identificada internamente como quantize_version 2, con cuantización de tensores de salida y conversión de tipo hf), sin reentrenamiento.

## Capacidades

La documentación disponible es una model card de cuantización y no detalla capacidades funcionales. A partir de las etiquetas y del tipo de modelo, las capacidades razonables son:

- Generación de texto en inglés, con orientación conversacional ("conversational") y de juego de rol ("roleplay").
- Generación creativa y narrativa: diálogos multi-turno, descripción de personajes y mantenimiento de estilo.
- Uso como modelo base para ajuste posterior (etiqueta "base-model"), lo que implica que puede requerir plantillas de prompt propias en lugar de un formato instruct estándar.
- Comportamiento con rechazos atenuados (etiqueta "heretic"), lo que amplía el rango de respuestas ante peticiones que un modelo alineado rechazaría.
- Soporte de tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingües: no, el idioma declarado es únicamente inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; no hay indicios en la documentación.

## Casos de uso

- Roleplay conversacional local: el modelo está etiquetado explícitamente como "roleplay" y admite conversaciones multi-turno; puede ejecutarse con cuantizaciones Q4_K_M o Q5_K_M en una GPU de 24 GB para sesiones de personaje con historial largo.
- Generación de narrativa interactiva y ficción: adecuado para motores de aventuras textuales o novelas asistidas, donde el estilo y la coherencia de voz del personaje pesan más que la precisión factual.
- Creación de personajes y asistentes con personalidad en inglés: al ser un merge orientado a estilo, sirve para prototipar bots conversacionales con tono definido antes de invertir en fine-tuning específico.
- Base para fine-tuning adicional: la etiqueta "base-model" lo sitúa como punto de partida para ajustes supervisados o LoRA sobre datos propios de un dominio concreto (por ejemplo, soporte técnico o texto de marca), partiendo del GGUF o de los pesos safetensors originales.
- Generación de diálogos sintéticos para datasets: puede emplearse para producir corpus conversacionales en inglés que después se filtren y se usen para entrenar modelos menores, aprovechando su coste de inferencia contenido en cuantizaciones bajas.
- Despliegue en estaciones de trabajo sin GPU de datacenter: con Q4_K_S (16,0 GB) o IQ4_XS (14,6 GB) es viable en tarjetas de 16-24 GB o incluso en configuraciones con descarga parcial a CPU mediante llama.cpp.
- Investigación sobre alineación y comportamiento de rechazo: la variante "heretic" permite estudiar cómo cambia la tasa de negativas y el estilo de respuesta respecto al modelo original alineado, siempre con las advertencias de seguridad correspondientes.
- Experimentación con arquitecturas MoE en formato GGUF: útil para medir cómo se comportan los motores llama.cpp y sus distintas cuantizaciones sobre un modelo de mezcla de expertos de ~26B totales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del tamaño de cada fichero GGUF más un margen de 1 a 3 GB para caché KV y buffers de contexto. No son mediciones publicadas.

| Cuantización | Tamaño del fichero | VRAM estimada para inferencia |
|---|---|---|
| Q2_K | 10,9 GB | ~12-14 GB |
| Q3_K_S | 12,6 GB | ~14-16 GB |
| Q3_K_M | 13,7 GB | ~15-17 GB |
| Q3_K_L | 14,2 GB | ~15-17 GB |
| IQ4_XS | 14,6 GB | ~16-18 GB |
| Q4_K_S | 16,0 GB | ~17-19 GB |
| Q4_K_M | 17,3 GB | ~18-21 GB |
| Q5_K_S | 18,6 GB | ~20-22 GB |
| Q5_K_M | 19,7 GB | ~21-23 GB |
| Q6_K | 23,3 GB | ~25-27 GB |
| Q8_0 | 27,7 GB | ~29-32 GB |

- GPU de consumo: Q4_K_S y Q4_K_M caben en RTX 3090, RTX 4090, RTX 5090 y tarjetas de 24 GB en general. En GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) son realistas IQ4_XS y Q3_K_L/M, con contexto reducido. Q6_K y Q8_0 requieren 32 GB o reparto entre GPU y CPU.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB y L40S admiten Q6_K y Q8_0 con contexto amplio. Para servir varias réplicas conviene Q4_K_M o Q5_K_M.
- CPU y Apple Silicon: los quants Q2_K a Q4_K_S son los candidatos para inferencia parcial o total en CPU; en Mac con memoria unificada de 32 GB o 64 GB es viable cargar Q5_K_M o Q6_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui son las rutas naturales para GGUF. vLLM y TGI no son el formato objetivo de este repositorio; requerirían los pesos safetensors del modelo original.
- Latencia y throughput: no hay mediciones publicadas. Como referencia estructural, el fichero Q4_K_M ocupa 17,3 GB, por lo que la decodificación estará limitada por el ancho de banda de memoria del dispositivo que aloje los pesos.
- Almacenamiento: el repositorio completo ocupa 187,7 GB; conviene descargar únicamente el fichero de la cuantización elegida (los quants se publican como ficheros individuales, sin particionado).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. La comparación posible se limita a las variantes del mismo modelo:

| Modelo | Parámetros | Formato | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| SubMaroon/Gemma-4-26B-A4B-StyleTune-QK-Heretic | 25,97 mil millones | safetensors | No aplica | Apache 2.0 | Modelo base original, sin cuantizar |
| mradermacher/Gemma-4-26B-A4B-StyleTune-QK-Heretic-GGUF | 25,97 mil millones | GGUF | 11 quants estáticos (Q2_K a Q8_0) | Apache 2.0 | Repositorio de esta ficha |
| mradermacher/Gemma-4-26B-A4B-StyleTune-QK-Heretic-i1-GGUF | 25,97 mil millones | GGUF | Quants ponderados/imatrix | Apache 2.0 | Alternativa con calibración imatrix, habitualmente de mejor perplejidad a igual tamaño |

Comparación con modelos de terceros de tamaño o tarea similar: no disponible.

## Limitaciones y advertencias

- Idioma: solo inglés declarado. No hay soporte multilingüe documentado, por lo que el uso en castellano no está validado.
- Ausencia de benchmarks: no hay MMLU, GSM8K, HumanEval ni ninguna otra métrica publicada, lo que impide estimar su calidad frente a alternativas.
- Naturaleza de merge para roleplay: los merges orientados a estilo suelen degradar el seguimiento estricto de instrucciones y el razonamiento estructurado respecto a un instruct bien alineado. No conviene usarlo como motor de tareas deterministas sin evaluarlo antes.
- Etiqueta "base-model": puede no incluir una plantilla de chat instruct y requerir formato de prompt propio; es esperable un comportamiento errático sin ajuste de plantilla.
- Etiqueta "heretic": implica mecanismos de rechazo atenuados. Aumenta el riesgo de generar contenido inapropiado, ofensivo o peligroso, y complica el cumplimiento de políticas de contenido en productos de cara al público.
- Alucinación: no hay datos específicos de fidelidad factual; como todo modelo generativo sin verificación, puede producir afirmaciones falsas con apariencia plausible, especialmente en roleplay prolongado.
- Degradación por cuantización: Q2_K y Q3_K_S/M/L sacrifican calidad de forma notable; para producción se recomienda Q4_K_M o superior. En Q2_K es esperable pérdida de coherencia en conversaciones largas.
- Contexto: se desconoce la ventana máxima soportada, por lo que no se puede garantizar el comportamiento en conversaciones muy extensas ni la gestión de atención a larga distancia.
- Licencia: el repositorio declara Apache 2.0, lo que en principio permite uso comercial. Aun así, conviene verificar la licencia del modelo base original (SubMaroon/Gemma-4-26B-A4B-StyleTune-QK-Heretic) y de la familia Gemma 4 subyacente antes de explotación comercial, ya que la condición de derivado puede arrastrar términos adicionales no reflejados en este repositorio.
- Sin soporte declarado de tool calling ni agentes: no se debe asumir integración con function calling en pipelines de producción.
- Repositorio sin tracción: 0 descargas y 0 "likes" en el momento de la consulta, sin validación comunitaria de calidad.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/Gemma-4-26B-A4B-StyleTune-QK-Heretic-GGUF
- Modelo base original: https://huggingface.co/SubMaroon/Gemma-4-26B-A4B-StyleTune-QK-Heretic
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Gemma-4-26B-A4B-StyleTune-QK-Heretic-i1-GGUF
- Página de resumen y descargas del autor: https://hf.tst.eu/model#Gemma-4-26B-A4B-StyleTune-QK-Heretic-GGUF
- Preguntas frecuentes y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que soporta la infraestructura del autor: https://www.nethype.de/
- Paper, blog o demo oficial del modelo: no disponibles en la información proporcionada.
