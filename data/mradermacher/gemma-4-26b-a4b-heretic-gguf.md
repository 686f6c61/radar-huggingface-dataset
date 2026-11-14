# mradermacher/gemma-4-26b-a4b-heretic-GGUF

## Resumen

Gemma-4-26B-A4B-Heretic es una variante "abliterated" (también etiquetada como heretic, uncensored o decensored) del modelo Gemma 4 de Google, publicada por el usuario wraith-painter y cuantizada a formato GGUF por mradermacher. El modelo parte de una arquitectura Mixture-of-Experts (MoE) con 25.233.142.046 parámetros totales y un identificador que sugiere aproximadamente 4.000 millones de parámetros activos por token ("A4B"), lo que lo sitúa en la estela de la familia Gemma 4 de Google. La modificación principal consiste en la eliminación o atenuación de los mecanismos de rechazo y alineación de seguridad del modelo original, de ahí las etiquetas "heretic", "abliterated" y "uncensored".

El repositorio que nos ocupa no contiene los pesos en formato original, sino las cuantizaciones estáticas en GGUF generadas por mradermacher, un conocido cuantizador de la comunidad. Se ofrecen múltiples niveles de cuantización, desde Q2_K (21,3 GB) hasta Q8_0 (53,8 GB), además de un complemento multimodal (mmproj) en Q8_0 y f16 que permite el procesamiento de imágenes a través de llama.cpp. El tamaño total del repositorio es de 367,7 GB, lo que refleja la acumulación de todas las variantes publicadas.

La relevancia de esta ficha radica en que documenta un caso típico de la comunidad open source: un modelo base de gran tamaño, modificado para eliminar restricciones de contenido y redistribuido en formatos optimizados para inferencia local. Es importante señalar que, aunque la licencia declarada es Apache 2.0, el enlace de licencia apunta a los términos de Gemma 4 de Google, lo que introduce una ambigüedad legal que el usuario debe considerar antes de un despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE), según nomenclatura "A4B" del nombre |
| Parametros totales | 25.233.142.046 (dato real de safetensors) |
| Parametros activos | Aproximadamente 4.000 millones (inferido del sufijo "A4B"; no confirmado en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |
| Modelo base | wraith-painter/gemma-4-26b-a4b-heretic |
| Tamaño del repositorio | 367,7 GB |
| Descargas | 5.439 |
| Likes | 1 |
| Creado | 2026-04-24 |
| Actualizado | 2026-11-13 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con Mixture-of-Experts, tal como indica el sufijo "A4B" del nombre (aproximadamente 4.000 millones de parámetros activos sobre un total de 25.233 millones). Esta configuración permite que, en cada paso de inferencia, solo se active una fracción de los parámetros, reduciendo el coste computacional respecto a un modelo denso del mismo tamaño. El modelo deriva de Gemma 4 de Google, aunque no se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la versión original.

La modificación "heretic" o "abliterated" consiste en una intervención sobre los pesos del modelo para eliminar o atenuar las direcciones de activación asociadas al rechazo de peticiones y a la alineación de seguridad. Este tipo de intervención se realiza típicamente mediante técnicas de abliteration, que identifican y suprimen componentes direccionales en el espacio de activaciones. No se dispone de información sobre el proceso exacto de entrenamiento o ajuste adicional aplicado por wraith-painter. La cuantización realizada por mradermacher es estática, sin uso de imatrix en este repositorio (las versiones con imatrix se publican en un repositorio separado, gemma-4-26b-a4b-heretic-i1-GGUF).

## Capacidades

- Generación de texto conversacional en inglés, con soporte para diálogos multi-turno.
- Razonamiento y respuesta a preguntas, heredado del modelo base Gemma 4.
- Procesamiento multimodal de imágenes gracias al complemento mmproj (Q8_0 o f16), que permite entrada de visión en llama.cpp.
- Capacidad de "tool calling" o function calling: no confirmada explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- Modo "thinking" o razonamiento extendido: no confirmado en la información disponible.
- Generación de código y matemáticas: probable por herencia del modelo base, pero no verificado en la información disponible.

## Casos de uso

- Despliegue local de un modelo de gran tamaño en formato GGUF: gracias a las cuantizaciones Q4_K_M (33,7 GB) o Q4_K_S (31,0 GB), el modelo puede ejecutarse en estaciones de trabajo con 32-48 GB de VRAM o RAM unificada, usando llama.cpp u Ollama, lo que permite inferencia privada sin depender de APIs externas.
- Investigación sobre alineación y seguridad: la variante "abliterated" permite estudiar el comportamiento de un modelo sin los mecanismos de rechazo, comparando respuestas con el modelo original para analizar sesgos y direcciones de activación.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas que el modelo base rechazaría, aprovechando la eliminación de filtros de contenido.
- Análisis de imágenes con el complemento multimodal: el mmproj permite procesar capturas, diagramas o fotografías en un pipeline local con llama.cpp, útil para prototipos de visión por computador sin conexión.
- Experimentación con arquitecturas MoE: el modelo permite estudiar el comportamiento de un MoE de 25B con ~4B activos en tareas de razonamiento, evaluando latencia y calidad frente a modelos densos equivalentes.
- Fine-tuning o destilación sobre la base cuantizada: aunque las cuantizaciones GGUF no son ideales para entrenamiento, el modelo base en safetensors (wraith-painter/gemma-4-26b-a4b-heretic) puede servir para ajuste fino con LoRA en tareas específicas de dominio en inglés.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 niveles de cuantización, lo que permite medir el impacto de la compresión en perplejidad y calidad de generación para un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K requiere ~21,3 GB; Q3_K_S ~24,5 GB; Q4_K_S ~31,0 GB; Q4_K_M ~33,7 GB; Q5_K_M ~38,4 GB; Q6_K ~45,4 GB; Q8_0 ~53,8 GB. El complemento multimodal añade 0,9 GB (Q8_0) o 1,3 GB (f16).
- GPU recomendadas: para Q4_K_M se recomienda una GPU con 48 GB de VRAM (A6000, L40S, RTX 6000 Ada) o dos GPUs de 24 GB (RTX 4090, RTX 3090) en configuración multi-GPU. Para Q8_0 se necesita una A100 80 GB o H100.
- ¿Cabe en GPU de consumo? Las cuantizaciones Q2_K y Q3_K_S pueden caber en una RTX 4090 (24 GB) con offloading parcial a RAM; Q4_K_S y Q4_K_M requieren 32-48 GB, por lo que necesitan dos GPUs de consumo o una GPU profesional.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI si se dispone de hardware suficiente.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un MoE con ~4B activos, se espera una latencia inferior a la de un modelo denso de 25B, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| gemma-4-26b-a4b-heretic-GGUF (este) | 25,2B | ~4B (inferido) | No disponible | Apache 2.0 (con enlace a Gemma 4) | GGUF | Variante abliterated, solo inglés, multimodal vía mmproj |
| wraith-painter/gemma-4-26b-a4b-heretic | 25,2B | ~4B (inferido) | No disponible | Apache 2.0 | Safetensors | Modelo base sin cuantizar, mismo origen |
| Gemma 4 de Google (original) | 25,2B (presumible) | ~4B (presumible) | No disponible | Licencia Gemma 4 | Safetensors | Modelo original con alineación de seguridad intacta |
| mradermacher/gemma-4-26b-a4b-heretic-i1-GGUF | 25,2B | ~4B (inferido) | No disponible | Apache 2.0 | GGUF (imatrix) | Misma base con cuantizaciones ponderadas por imatrix |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La modificación "abliterated" elimina los mecanismos de rechazo del modelo original, lo que puede producir contenido ofensivo, inexacto o inseguro sin advertencia. No es apto para aplicaciones orientadas al público sin filtros adicionales.
- Riesgo elevado de alucinación: al tratarse de un modelo de 25B con ~4B activos, la capacidad de razonamiento es inferior a la de modelos densos de mayor tamaño, y la eliminación de la alineación puede agravar la generación de afirmaciones falsas con tono seguro.
- Idioma limitado al inglés según la etiqueta del repositorio; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Ambigüedad de licencia: aunque se declara Apache 2.0, el enlace apunta a la licencia de Gemma 4 de Google, que impone restricciones de uso comercial y de redistribución. Es imprescindible revisar los términos de Gemma 4 antes de un uso comercial.
- El repositorio tiene un tamaño de 367,7 GB, lo que requiere espacio de almacenamiento considerable y una gestión cuidadosa de las descargas (archivos multiparte).
- Solo 1 like y 5.439 descargas en el momento de la ficha: es un modelo de nicho con poca validación comunitaria, lo que reduce la confianza en su calidad frente a alternativas más establecidas.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la perplejidad; para producción se recomienda Q4_K_M o superior.
- No se dispone de información sobre la longitud de contexto, lo que impide garantizar conversaciones de contexto largo.
- El modelo base no incluye información sobre datos de entrenamiento, sesgos conocidos ni evaluaciones de seguridad, lo que dificulta la auditoría.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-26b-a4b-heretic-GGUF
- Modelo base: https://huggingface.co/wraith-painter/gemma-4-26b-a4b-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-4-26b-a4b-heretic-i1-GGUF
- Página de resumen del modelo: https://hf.tst.eu/model#gemma-4-26b-a4b-heretic-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
