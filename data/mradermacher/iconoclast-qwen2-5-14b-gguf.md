# mradermacher/iconoclast-qwen2.5-14b-GGUF

## Resumen

Iconoclast Qwen2.5-14B es un modelo de lenguaje de 14.770.033.664 parámetros derivado de Qwen2.5-14B mediante un proceso de *abliteration* (ablación de direcciones de rechazo en el espacio de activaciones). Lo desarrolla HaadesX y lo distribuye en formato GGUF mradermacher, un conocido cuantizador de la comunidad de Hugging Face. El objetivo declarado del modelo es eliminar los mecanismos de rechazo aprendidos durante el alineamiento, de modo que responda a peticiones que el modelo base rechazaría por defecto.

El modelo conserva la arquitectura transformer densa de Qwen2.5-14B, con aproximadamente 14.770 millones de parámetros totales y una ventana de contexto heredada del modelo base (Qwen2.5 soporta hasta 131.072 tokens nativos, aunque la model card de esta ficha no lo confirma explícitamente). La distribución que nos ocupa es la versión cuantizada en GGUF, con 11 variantes de cuantización estática que van desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB), pensadas para ejecución local con llama.cpp y herramientas compatibles.

Su relevancia es doble: por un lado, ofrece una vía práctica para ejecutar un modelo de 14B "sin censura" en hardware de consumo; por otro, es un ejemplo de las implicaciones éticas y legales de las técnicas de abliteration, ya que se distribuye bajo licencia AGPL-3.0 y está entrenado únicamente en inglés. No se han publicado resultados de benchmarks ni detalles del proceso de ablación en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-14B) |
| Parámetros totales | 14.770.033.664 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (heredada de Qwen2.5-14B, hasta 131.072 tokens según el modelo base) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas) |
| Idiomas soportados | inglés (en) |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF (11 ficheros); el modelo base se distribuye en safetensors vía transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B: un transformer denso con atención por ventanas deslizantes y RoPE, sin mezcla de expertos. Sobre ese modelo base, el autor aplicó *abliteration*, una técnica que identifica y elimina las direcciones de activación asociadas a la negativa a responder (rechazo) y las resta de los pesos o de las activaciones durante la inferencia. El resultado es un modelo que mantiene en gran medida las capacidades del original pero pierde los filtros de seguridad aprendidos en el alineamiento.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicó RLHF o DPO adicional tras la ablación. Tampoco se documenta el método exacto de ablación (por ejemplo, si se usaron direcciones calculadas con pares de prompts dañinos/inocuos o si se aplicó una variante como "refusal-direction ablation"). mradermacher solo aporta las cuantizaciones estáticas; no hay versiones con imatrix ("weighted") disponibles en el momento de redactar esta ficha.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-14B.
- Razonamiento y matemáticas de nivel medio-alto, coherente con un modelo de 14B de la familia Qwen2.5.
- Generación de código y comprensión de instrucciones técnicas.
- Respuesta a peticiones que el modelo base rechazaría por defecto (contenido sensible, instrucciones controvertidas), que es el propósito declarado de la ablación.
- Soporte de conversación multi-turno mediante plantilla de chat de Qwen2.5.
- Compatibilidad con endpoints de inferencia estándar (tags `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking" en la información disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo sirve como caso de estudio para medir cuánto del comportamiento de rechazo de Qwen2.5-14B se debe a direcciones de activación aislables, comparando respuestas con el modelo base.
- Evaluación de robustez de filtros: equipos de seguridad pueden usar el modelo para probar si sus clasificadores de contenido detectan respuestas generadas por modelos abliterated, un escenario cada vez más frecuente en producción.
- Generación creativa sin restricciones: escritura de ficción con temáticas adultas, violencia o dilemas morales donde el modelo base aplicaría rechazos, siempre que el uso cumpla la legalidad aplicable.
- Despliegue local en hardware de consumo: con la cuantización Q4_K_M (9,1 GB) cabe en GPUs de 12-16 GB de VRAM, lo que permite ejecutarlo en una RTX 4070 Ti o superior con llama.cpp u Ollama.
- Experimentación con cuantizaciones: el repositorio ofrece 11 variantes que permiten estudiar la degradación de calidad (perplejidad) entre Q2_K y Q8_0 en un mismo modelo, útil para calibrar pipelines de cuantización.
- Red teaming interno: organizaciones que necesitan simular un atacante con un modelo local sin censura para entrenar defensas o clasificadores, sin depender de APIs externas que bloqueen esas consultas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de mradermacher no incluye métricas de MMLU, HumanEval, GSM8K ni perplejidad, y la del modelo base (HaadesX/iconoclast-qwen2.5-14b) no se ha proporcionado en esta ficha. Cualquier cifra que se cite para Qwen2.5-14B no es necesariamente trasladable al modelo abliterated, ya que la ablación puede degradar ligeramente el rendimiento en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia (con overhead de contexto): Q2_K ~6-7 GB; Q3_K_M ~8-9 GB; Q4_K_M ~10-11 GB; Q5_K_M ~11-12 GB; Q6_K ~13-14 GB; Q8_0 ~17-18 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0 con contexto amplio; RTX 4080/4070 Ti (16 GB) para Q4_K_M y Q5_K_M; RTX 4060 Ti 16 GB para Q4_K_S; GPUs de 8 GB solo con Q2_K y contexto reducido.
- Cabe en GPU de consumo: sí, desde Q4_K_M en adelante en tarjetas de 12-16 GB; Q2_K y Q3_K_S en tarjetas de 8 GB con contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este modelo, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponible. Como referencia orientativa, un 14B en Q4_K_M en una RTX 4090 suele generar del orden de 30-50 tokens/s, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Iconoclast Qwen2.5-14B (esta ficha) | 14,77B | no disponible (heredado de Qwen2.5) | AGPL-3.0 | GGUF (11 quants) | Abliterated, solo inglés |
| Qwen2.5-14B (base original) | 14,77B | 131.072 tokens | Apache-2.0 | safetensors, GGUF | Alineado, multilingüe, con rechazos |
| Qwen2.5-14B-Instruct (abliterated, otras variantes) | 14,77B | 131.072 tokens | Apache-2.0 / AGPL-3.0 según autor | GGUF, safetensors | Múltiples forks comunitarios con ablación; calidad variable |
| Mistral-Nemo-12B (abliterated) | 12B | 128.000 tokens | Apache-2.0 | GGUF, safetensors | Alternativa de tamaño similar con ablación comunitaria |

La comparación con el Qwen2.5-14B original es la más relevante: misma arquitectura y tamaño, pero distinto alineamiento y licencia (Apache-2.0 frente a AGPL-3.0), lo que cambia sustancialmente las condiciones de uso comercial. No se dispone de datos de rendimiento comparativo entre esta variante y otras abliterated.

## Limitaciones y advertencias

- La ablación puede degradar capacidades generales (razonamiento, coherencia) respecto al Qwen2.5-14B original; no hay benchmarks que cuantifiquen esa pérdida.
- Modelo entrenado solo en inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo elevado de generar contenido dañino, ilegal o sexualmente explícito sin filtros; no es apto para aplicaciones de cara al público sin una capa de moderación externa.
- Licencia AGPL-3.0: el uso comercial requiere cumplir las obligaciones de copyleft, incluida la publicación del código fuente si se ofrece como servicio en red; no es una licencia permisiva como Apache-2.0.
- Riesgo de alucinación similar al de cualquier modelo de 14B, sin mejoras específicas documentadas.
- No se documenta el proceso de ablación ni las evaluaciones de seguridad; la reproducibilidad es limitada.
- El repositorio ocupa 102 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero GGUF necesario.
- No hay cuantizaciones imatrix disponibles, lo que puede suponer una pérdida de calidad adicional en los quants pequeños (Q2_K, Q3_K_S) frente a alternativas ponderadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/iconoclast-qwen2.5-14b-GGUF
- Modelo base: https://huggingface.co/HaadesX/iconoclast-qwen2.5-14b
- Página de descargas de mradermacher: https://hf.tst.eu/model#iconoclast-qwen2.5-14b-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
