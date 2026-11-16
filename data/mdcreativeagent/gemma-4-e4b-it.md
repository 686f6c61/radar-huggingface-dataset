# mdcreativeagent/gemma-4-E4B-it

## Resumen

Gemma 4 E4B es un modelo multimodal de Google DeepMind perteneciente a la familia Gemma 4, publicada con pesos abiertos bajo licencia Apache 2.0. Este repositorio concreto (`mdcreativeagent/gemma-4-E4B-it`) es una copia o redistribución del checkpoint instruction-tuned oficial de Google, con 7.996.156.490 parámetros totales en safetensors y un tamaño de repositorio de 16 GB. El modelo procesa texto, imagen y audio como entrada, y genera texto como salida (pipeline `any-to-any`).

La particularidad del E4B dentro de la familia es su diseño "effective": incorpora Per-Layer Embeddings (PLE) para maximizar la eficiencia en despliegues on-device. Google reporta 4,5B de parámetros efectivos y 8B contando embeddings, lo que coincide con los ~8B totales del checkpoint. Con 42 capas, ventana de atención deslizante de 512 tokens y una longitud de contexto de 128K tokens, está pensado para ejecutarse en portátiles, GPUs de consumo y dispositivos móviles de gama alta.

Es relevante ahora porque la familia Gemma 4 introduce modos de razonamiento configurables (thinking modes), soporte nativo del rol `system`, function calling y una ventana de contexto ampliada respecto a generaciones anteriores, manteniendo soporte multilingüe en más de 140 idiomas. La licencia Apache 2.0 (con enlace a la licencia específica de Gemma 4) facilita el uso comercial, aunque conviene revisar los términos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con atención híbrida (sliding window local + atención global), Per-Layer Embeddings (PLE), codificadores de visión (~150M) y audio (~300M) |
| Parametros totales | 7.996.156.490 (~8B, incluyendo embeddings); 4,5B efectivos según Google |
| Parametros activos | No aplica (modelo denso; el MoE de la familia es 26B A4B) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible en la información proporcionada (el checkpoint se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | Más de 140 idiomas según la model card de la familia |
| Licencia | Apache 2.0 (con license_link a la licencia específica de Gemma 4) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El E4B es un transformer decoder-only denso de 42 capas con una ventana de atención deslizante de 512 tokens combinada con capas de atención global, garantizando que la capa final siempre sea global. Las capas globales usan Keys y Values unificados y Proportional RoPE (p-RoPE) para reducir el coste de memoria en contextos largos. El vocabulario es de 262K tokens. La innovación principal del tamaño E4B es Per-Layer Embeddings (PLE): cada capa del decoder dispone de su propia tabla de embeddings por token, grande pero de consulta rápida, lo que eleva el recuento total de parámetros sin incrementar proporcionalmente el coste computacional efectivo. A esto se suman un codificador de visión de ~150M de parámetros y un codificador de audio de ~300M.

La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineación posteriores al preentrenamiento. La model card de la familia sí indica que existen variantes preentrenada e instruction-tuned y que todos los modelos están diseñados como razonadores con modos de pensamiento configurables, pero no se aportan cifras del corpus ni detalles del pipeline de alineación para este checkpoint concreto.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables (thinking modes).
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables.
- Entrada de audio nativa (codificador de ~300M de parámetros).
- Procesamiento de vídeo según la model card de la familia.
- Generación de código y capacidades agénticas mejoradas respecto a generaciones previas.
- Function calling / tool calling nativo.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Multilingüe en más de 140 idiomas.
- Flujos agénticos multi-paso y razonamiento encadenado.

## Casos de uso

- Asistentes locales en portátil: con ~8B parámetros totales y 4,5B efectivos, el modelo puede ejecutarse en GPUs de consumo y en equipos de gama alta sin conexión, cubriendo dictado, resumen y Q&A sobre documentos.
- Transcripción y análisis de audio: gracias al codificador de audio nativo, se puede usar para resumir reuniones o extraer acciones a partir de grabaciones, combinando audio y texto en la misma conversación.
- Análisis de documentos con imágenes: informes escaneados, capturas o diagramas pueden procesarse junto con el texto asociado aprovechando el codificador de visión y el contexto de 128K tokens.
- Agentes con tool calling: integración en pipelines donde el modelo decide qué función invocar (APIs internas, consultas a bases de datos) y encadena varios pasos, apoyado por el soporte nativo de function calling y del rol `system`.
- Asistencia de código en IDE: autocompletado, explicación y refactorización de fragmentos, con la ventaja de poder ejecutarse en local para código sensible que no debe salir de la máquina.
- Atención al cliente multilingüe: conversaciones multi-turno en más de 140 idiomas con contexto largo para mantener el hilo de incidencias extensas.
- Procesamiento por lotes en edge: clasificación y extracción de información de imágenes y texto en dispositivos con recursos limitados, aprovechando el diseño on-device de la variante E4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más para contexto largo.
- Cuantización: no se documentan tipos soportados en la información disponible; en caso de generarse GGUF/AWQ/GPTQ de forma comunitaria, un modelo de ~8B suele caber en 8-12 GB a 4-5 bits, pero esto es una estimación general, no un dato confirmado para este checkpoint.
- GPU recomendadas: para BF16 y contexto largo, A100 40/80 GB o H100; para uso en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB). El diseño on-device sugiere viabilidad en GPUs integradas y móviles de gama alta con cuantización agresiva.
- Despliegue: la librería declarada es transformers; no se confirman en la información proporcionada soportes específicos de vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| Gemma 4 E4B (este) | ~8B totales / 4,5B efectivos | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 E2B | 5,1B con embeddings / 2,3B efectivos | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 26B A4B (MoE) | 25,2B totales / 3,8B activos | 256K | Texto, imagen | Apache 2.0 |

No se dispone de datos de benchmarks para comparar el rendimiento frente a modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado en la información disponible datos sobre sesgos específicos ni evaluaciones de seguridad de este checkpoint.
- Riesgo de alucinación inherente a los modelos generativos; no hay tasas de error publicadas para esta variante.
- El repositorio es una redistribución de terceros (`mdcreativeagent`) del modelo oficial de Google; conviene verificar la integridad de los pesos frente al checkpoint original `google/gemma-4-E4B`.
- La licencia declarada es Apache 2.0, pero el `license_link` apunta a la licencia específica de Gemma 4; es necesario revisar esos términos antes de un uso comercial, ya que pueden imponer condiciones adicionales.
- El contexto es de 128K tokens, la mitad que las variantes de 12B, 26B y 31B de la familia; para tareas de contexto muy largo puede quedarse corto.
- El modelo no genera audio ni imagen, solo texto como salida, pese a la etiqueta `any-to-any`.
- Con 0 descargas y 0 likes en el momento de la ficha, no hay evidencia comunitaria de validación de esta copia concreta.

## Enlaces

- Hugging Face: https://huggingface.co/mdcreativeagent/gemma-4-E4B-it
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma en DeepMind: https://deepmind.google/models/gemma/
