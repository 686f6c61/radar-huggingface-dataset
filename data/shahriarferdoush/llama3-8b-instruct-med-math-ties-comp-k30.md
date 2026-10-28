# ShahriarFerdoush/llama3-8b-instruct-med-math-ties-comp-k30

## Resumen

`ShahriarFerdoush/llama3-8b-instruct-med-math-ties-comp-k30` es un checkpoint de 8.030.261.248 parámetros publicado en HuggingFace por el usuario ShahriarFerdoush. Por el identificador se deduce que se trata de una fusión de pesos (model merge) del modelo base Llama 3 8B Instruct con variantes ajustadas en dominios médico y matemático, aplicando el algoritmo TIES con un recorte top-k de 30. No es, por tanto, un modelo entrenado desde cero, sino una combinación aritmética de tensores de otros checkpoints; el autor no documenta qué modelos concretos se fusionaron.

El modelo llega sin model card real: el README es la plantilla autogenerada por HuggingFace con todos los campos a `[More Information Needed]`. No hay información sobre datos de entrenamiento, licencia, idiomas, plantilla de chat, evaluación ni hiperparámetros de la fusión. El repositorio ocupa 16,1 GB y solo contiene pesos en safetensors para `transformers`, sin cuantizaciones GGUF, AWQ ni GPTQ.

Su relevancia práctica es baja en el momento de la publicación: cero descargas y cero likes, ausencia total de documentación y de validación comunitaria. Resulta útil únicamente como punto de partida para experimentación controlada con merges en el ámbito médico-matemático, nunca como dependencia directa en producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Llama 3 (inferido del tag `llama` y del recuento de parámetros; no confirmado por el autor) |
| Parámetros totales | 8.030.261.248 (8,03 B), dato real de los safetensors |
| Parámetros activos | no aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible en la información proporcionada; el modelo base Llama 3 8B Instruct emplea 8192 tokens, valor presumiblemente heredado pero sin confirmar |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos safetensors (16,1 GB), sin variantes GGUF, AWQ, GPTQ ni bitsandbytes publicadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos del Hub; al derivar de Llama 3 cabe esperar la Llama 3 Community License, extremo no confirmado |
| Formato de pesos | safetensors (librería `transformers`); sin GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B: un transformer decoder-only denso con atención causal, 32 capas, atención multi-cabeza con GQA y normalización RMSNorm. El checkpoint no introduce cambios estructurales; el vocabulario, la dimensión oculta y el número de cabezas deberían coincidir con el modelo base, aunque el autor no publica `config.json` comentado ni verificación alguna al respecto.

El proceso de creación es una fusión TIES (Trim, Elect Sign, Merge) con `k=30`: se recortan los parámetros de menor magnitud de cada modelo donante, se resuelve el conflicto de signos por coordenada y se promedian los tensores resultantes. El identificador sugiere la combinación de al menos dos donantes especializados (médico y matemático) sobre el instruct base, con posible repetición o ponderación de los mismos («comp» podría indicar composición o compensación). No hay información sobre el número exacto de checkpoints fusionados, sus identificadores, los pesos relativos, la composición del dataset original de cada donante ni si hubo RLHF, DPO o SFT adicional tras la fusión. Tampoco se documenta la elección de `k=30` ni ninguna comparación con otras configuraciones de merge.

## Capacidades

- Generación de texto instructiva en inglés, presumiblemente heredada de Llama 3 8B Instruct; el autor no confirma el comportamiento conversacional resultante de la fusión.
- Razonamiento matemático y resolución de problemas aritméticos o algebraicos, por la presumible presencia de un donante especializado en matemáticas; sin evaluación publicada.
- Procesamiento de texto biomédico y médico, por el presumible donante del dominio sanitario; sin evaluación publicada.
- Soporte de tool calling y function calling: no confirmado; depende de si la plantilla y los tokens especiales del donante instruct se preservaron en la fusión.
- Capacidades de agente y razonamiento multi-paso: no confirmadas ni documentadas.
- Capacidades multilingües: no disponibles; el modelo base Llama 3 8B está optimizado para inglés y su cobertura de castellano es limitada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es exclusivamente de texto.
- Ninguna de las capacidades anteriores cuenta con verificación empírica por parte del autor.

## Casos de uso

- Experimentación con técnicas de fusión de modelos: el checkpoint sirve como caso de estudio reproducible de TIES con `k=30` para investigadores que analicen la interferencia entre donantes de dominios dispares (médico frente a matemático).
- Evaluación comparativa de merges frente al base: permite medir si la combinación degrada o mejora el rendimiento de Llama 3 8B Instruct en tareas instructivas generales, siempre que el equipo ejecute su propio conjunto de evaluación.
- Prototipado de asistentes de divulgación matemática: con una ventana presumible de 8192 tokens, admite sesiones de resolución de problemas paso a paso, aunque requiere validación manual del resultado numérico.
- Extracción y reescritura de literatura biomédica en entornos de investigación: adecuado para preprocesar abstracts o generar resúmenes preliminares, con revisión humana obligatoria y sin uso clínico.
- Generación de datos sintéticos de dominio médico-matemático: puede emplearse para producir pares pregunta-respuesta que después se filtren y validen antes de incorporarse a un pipeline de ajuste supervisado.
- Base para un ajuste fino adicional (SFT/LoRA): al ser un dense de 8B en formato `transformers`, se puede adaptar a tareas concretas con una sola GPU de 24 GB, partiendo siempre de la premisa de que el punto de partida no está evaluado.
- Pruebas de regresión de pipelines de despliegue: útil para verificar que las herramientas de serving (TGI, vLLM) cargan correctamente checkpoints sin `config` documentada y con posibles tokens especiales inconsistentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye MMLU, HumanEval, GSM8K, MedQA ni ninguna otra métrica, ni comparaciones con el modelo base o con los donantes.

## Requisitos de hardware

- VRAM estimada en bf16/fp16 (pesos de 16,1 GB): en torno a 18-20 GB considerando caché KV para contextos de 8k; requiere GPU de 24 GB o superior.
- VRAM estimada en int8 (bitsandbytes): aproximadamente 9-10 GB, cabe en RTX 4080 de 16 GB y en RTX 4090.
- VRAM estimada en int4 (bitsandbytes NF4): aproximadamente 5-6 GB, cabe en RTX 3060 de 12 GB, RTX 4060 Ti y GPUs de 8 GB con margen justo.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente; RTX 4090 o RTX 3090 para desarrollo e inferencia en bf16 de un solo usuario; L4 o A10G para int8 con latencia moderada.
- Despliegue: `transformers` es la vía garantizada; el tag `text-generation-inference` y `endpoints_compatible` indican compatibilidad declarada con TGI. vLLM y SGLang son viables solo tras verificar el `config.json` y la plantilla de chat. llama.cpp/Ollama requieren convertir previamente los safetensors a GGUF, paso no publicado por el autor.
- Latencia y throughput: no disponibles. No hay cifras de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Documentación |
|---|---|---|---|---|---|
| `ShahriarFerdoush/llama3-8b-instruct-med-math-ties-comp-k30` | 8,03 B | no disponible (base: 8192) | no disponible | safetensors, 0 descargas | plantilla autogenerada vacía |
| Llama 3 8B Instruct (Meta) | 8,03 B | 8192 | Llama 3 Community License | safetensors, ampliamente distribuido | model card completa y evaluaciones publicadas |
| Mistral 7B Instruct v0.3 | 7,25 B | 32.768 | Apache 2.0 | safetensors y GGUF | model card completa y evaluaciones publicadas |
| Qwen2.5 7B Instruct | 7,62 B | 32.768 nativo (128k con YaRN) | Apache 2.0 (mayoría de variantes) | safetensors y GGUF | model card completa, benchmarks publicados |

La comparación relevante es de trazabilidad más que de rendimiento: los tres modelos de referencia documentan licencia, contexto, idiomas y resultados, mientras que el merge aquí descrito no aporta ninguno de esos datos. No hay evidencia que permita afirmar que el merge mejora a su base en tareas médicas o matemáticas.

## Limitaciones y advertencias

- Model card completamente vacía: no hay información sobre datos, licencia, idiomas, plantilla de chat, tokens especiales ni evaluación. Cualquier uso en producción exige reverse-engineering previo del `config.json` y del tokenizer.
- Licencia indeterminada: los metadatos del Hub no especifican licencia y el modelo deriva de Llama 3, cuya Llama 3 Community License impone restricciones de uso comercial, atribución y nomenclatura. Existe riesgo legal real si se despliega sin aclarar la cadena de licencias.
- Riesgo elevado de alucinación en el dominio médico: sin evaluación ni ajuste de seguridad documentado, el modelo puede generar contenido sanitario plausible pero incorrecto. No es apto para diagnóstico, triaje ni consejo clínico.
- Degradación por interferencia de fusión: TIES con `k=30` sobre donantes de dominios distintos puede erosionar capacidades del instruct base (seguimiento de instrucciones, formato de chat) sin que exista ninguna medición que lo descarte.
- Idiomas no documentados: no hay garantía de comportamiento correcto en castellano; el base Llama 3 8B está centrado en inglés.
- Sin validación comunitaria: cero descargas y cero likes implican ausencia de informes de terceros sobre fallos, sesgos o comportamientos anómalos.
- Sesgos desconocidos: los sesgos de los donantes (incluidos los del corpus médico y matemático empleado en cada ajuste) se propagan sin análisis.
- Fecha de creación atípica (2026-10-28) y actualización tres minutos posterior: no hay historial de mantenimiento ni versionado, lo que sugiere un experimento puntual sin soporte.
- Posible inconsistencia de tokens especiales: al fusionar checkpoints con tokenizers o plantillas distintas, los tokens de control pueden quedar mal alineados y producir salidas con formato roto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ShahriarFerdoush/llama3-8b-instruct-med-math-ties-comp-k30
- Referencia citada en los tags del Hub (Lacoste et al., 2019, cálculo de impacto medioambiental): https://arxiv.org/abs/1910.09700
- Artículo original de TIES-Merging, técnica indicada en el nombre del checkpoint (Yadav et al.): https://arxiv.org/abs/2306.01708
- Calculadora de impacto ML referenciada en la plantilla de la model card: https://mlco2.github.io/impact
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo; los resultados obtenidos fueron páginas de ayuda de YouTube y Google, sin relación con el checkpoint.
