# defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-Abliterated-NVFP4

## Resumen

PseudoBrain-MiniMax-M3.1-Flash-Abliterated-NVFP4 es una conversión experimental del modelo multimodal MiniMax-M3.1-Flash, publicada por el usuario defnoteatin bajo la etiqueta interna "PseudoBrain PB-27". El modelo parte del checkpoint abliterado (sin mecanismos de rechazo) MiniMax-3.1-Flash-DeRisked de Blackfrost-Research y sustituye las 15 capas densas de atención completa de la arquitectura original por capas híbridas con ventana deslizante de 16.384 tokens, sumideros de atención, una rama recurrente basada en Gated DeltaNet y un sistema de recuperación exacta de bloques KV a nivel de página.

El objetivo declarado es extender la ventana de contexto efectiva hasta 1.056.768 tokens manteniendo paridad de comportamiento en contexto corto con el checkpoint base, mientras se preservan intactas las 45 capas de atención block-sparse con indexador "lightning", los routers y expertos del MoE y la torre de visión. El resultado es un modelo de 221.437.892.576 parámetros totales (formato NVFP4 y MXFP8) orientado a despliegue con vLLM mediante un plugin propio (`pb27_vllm`).

La relevancia de esta ficha es doble: por un lado documenta una técnica de conversión de atención densa a híbrida recurrente con memoria exacta de largo alcance; por otro, conviene subrayar que se trata de una publicación de terceros, sin benchmarks publicados, sin datos de entrenamiento verificables y con un plugin de inferencia no auditado, lo que la sitúa en el terreno de la experimentación y no del uso en producción sin validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 45 capas block-sparse con lightning-indexer + 15 capas PB-27 windowed-hybrid (atención ventaneada + Gated DeltaNet recurrente + memoria exacta de bloques KV); MoE con 128 expertos; torre de visión |
| Parámetros totales | 221.437.892.576 (221,4 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 1.056.768 tokens (ventana de atención de 16.384 tokens con 4 sumideros y recuperación exacta de bloques KV) |
| Tipos de cuantización | NVFP4 y MXFP8 (pesos publicados en 8 bits según metadatos de Hugging Face); KV-cache en `fp8_e4m3` recomendada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `--trust-remote-code`), más fichero auxiliar `pb27-gdn-00001-of-00001.safetensors` para la rama Gated DeltaNet |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer de 60 capas con mezcla de expertos y capacidad multimodal (pipeline `image-text-to-text`). De esas 60 capas, 45 son block-sparse con un indexador tipo "lightning" que selecciona bloques relevantes, y 15 son densas de atención completa en las posiciones `[3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59]`. La conversión PB-27 actúa exclusivamente sobre esas 15 capas densas y las reemplaza por tres mecanismos combinados: atención ventaneada de 16.384 tokens con 4 sumideros de atención; una rama paralela recurrente Gated DeltaNet (`QwenGatedDeltaNetAttention`) que mantiene estado lineal en tiempo constante; y un nivel de memoria exacta (`pb27_vllm.memory`) que recupera los top-k bloques KV a nivel de página desde un archivo de contexto largo.

El detalle técnico más relevante es la inicialización de la rama Gated DeltaNet: según la model card, sus proyecciones se copian de las `self_attn` del modelo profesor y la proyección de salida se inicializa a cero (`out_proj = 0`), de modo que la divergencia KL en contexto corto es 0,000000 y la generación en contextos cortos es idéntica al checkpoint base. Las 45 capas block-sparse, los routers y expertos del MoE (en NVFP4 y MXFP8) y la torre de visión no se modifican. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; la conversión parece ser estructural (cirugía de capas e inicialización), no un reentrenamiento a gran escala.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 1.056.768 tokens.
- Entrada de imagen y texto (`image-text-to-text`), con torre de visión preservada del modelo base.
- Razonamiento y generación de código heredados del checkpoint MiniMax-M3.1-Flash, con paridad declarada en contexto corto.
- Mezcla de expertos con 128 expertos por capa (variante completa de esta edición).
- Atención block-sparse con indexador para eficiencia en contextos largos.
- Estado recurrente lineal (Gated DeltaNet) para procesamiento de secuencias muy largas sin crecimiento cuadrático del coste.
- Recuperación exacta de bloques KV de largo alcance mediante el plugin `pb27_vllm`.
- Capacidades de tool calling y function calling: no disponibles en la información proporcionada.
- Capacidades de agente multi-paso: no disponibles en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Análisis de repositorios de código completos: con 1.056.768 tokens de contexto, el modelo puede ingerir árboles de proyecto enteros, incluidos ficheros de configuración y tests, y responder preguntas de arquitectura o detectar dependencias cruzadas sin trocear el código.
- Revisión de contratos y documentación legal extensa: la memoria exacta de bloques KV permite citar cláusulas concretas de documentos de cientos de miles de tokens, útil en flujos de cumplimiento normativo donde la trazabilidad de la cita importa.
- Procesamiento de historiales clínicos o expedientes largos con componentes de imagen: la torre de visión preservada permite combinar informes escaneados con texto estructurado en una sola ventana.
- Asistencia sobre bases de conocimiento internas en formato libro o manual: el modelo puede mantener el documento completo en contexto y responder consultas con referencias cruzadas entre capítulos.
- Transcripción y análisis de reuniones o series de documentos temporales: la rama recurrente Gated DeltaNet mantiene estado a lo largo de secuencias muy largas, adecuada para resumir cronologías extensas.
- Investigación sobre atención de largo alcance: la conversión PB-27 es un banco de pruebas para estudiar la interacción entre atención ventaneada, estado recurrente y recuperación exacta de KV, comparable contra el modelo base sin conversión.
- Despliegue de asistentes con memoria persistente de sesión: la combinación de ventana deslizante y archivo de bloques KV permite conservar contexto histórico sin reenviar todo el historial en cada turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara una divergencia KL de 0,000000 en contexto corto respecto al checkpoint profesor, lo que constituye una métrica de fidelidad de la conversión, no un resultado de capacidad.

## Requisitos de hardware

- Tamaño del repositorio: 252,0 GB en safetensors, lo que condiciona el almacenamiento y el tiempo de carga.
- VRAM estimada para inferencia: no disponible de forma oficial; con pesos en NVFP4/MXFP8 de 8 bits, el peso bruto ronda los 221 GB, por lo que se requiere un nodo multi-GPU de gama alta (varias H100 o A100 de 80 GB) incluso antes de reservar caché KV para 1 M de tokens.
- GPU recomendadas: H100 80 GB y A100 80 GB en configuración multi-GPU; el contexto de 1.056.768 tokens con KV-cache en `fp8_e4m3` exige planificación cuidadosa de memoria.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en configuraciones de una sola tarjeta de consumo; las ediciones compactas de 32 expertos (68,9 GB) o de 96 expertos (285 B) del mismo autor siguen requiriendo múltiples GPU.
- Opciones de despliegue: vLLM con el plugin `pb27_vllm` (instalación con `pip install -e ./pb27_vllm_plugin` y arranque con `vllm serve ... --trust-remote-code --max-model-len 1056768 --kv-cache-dtype fp8_e4m3`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| PseudoBrain-MiniMax-M3.1-Flash-Abliterated-NVFP4 | 221,4 B (128 expertos) | 1.056.768 | NVFP4 + MXFP8, safetensors | Apache 2.0 | Conversión PB-27 con plugin vLLM propio; sin benchmarks |
| MiniMax-M3.1-Flash (base oficial) | no disponible en la información | no disponible en la información | no disponible | no disponible en la información | Checkpoint original de MiniMaxAI; 60 capas, 45 block-sparse + 15 densas |
| PseudoBrain-MiniMax-M3.1-Flash-E32-NVFP4 | 32 expertos (68,9 GB) | 1.056.768 | NVFP4 + MXFP8 | Apache 2.0 | Edición compacta del mismo autor, mismo esquema PB-27 |
| PseudoBrain-MiniMax-M3.1-Flash-285B-NVFP4 | 285 B (96 expertos) | 1.056.768 | NVFP4 + MXFP8 | Apache 2.0 | Edición intermedia sobre checkpoint podado |

## Limitaciones y advertencias

- Modelo abliterado: se ha eliminado el comportamiento de rechazo del checkpoint base, lo que incrementa el riesgo de generar contenido dañino, ilegal o inseguro sin filtros propios. No es apto para despliegue directo al público sin capas de moderación externas.
- Ausencia total de benchmarks publicados: las afirmaciones de paridad con el modelo base se limitan a la divergencia KL en contexto corto y no cubren razonamiento, código, matemáticas ni visión.
- Publicación de terceros: el autor (defnoteatin) no es el desarrollador original de MiniMax-M3.1-Flash, y el checkpoint base es a su vez una modificación de otro tercero (Blackfrost-Research). La cadena de procedencia y la calidad de las modificaciones intermedias no están auditadas.
- Dependencia de código personalizado: requiere `--trust-remote-code` y un plugin de vLLM (`pb27_vllm`) distribuido con el repositorio, sin revisión de seguridad pública conocida; ejecutarlo implica confiar en código de un tercero.
- Contexto largo no verificado: la ventana de 1.056.768 tokens se declara por diseño, pero no hay evaluaciones publicadas de recuperación de información (needle-in-a-haystack u otras) que confirmen la calidad real en esa longitud.
- Idiomas no especificados: no hay información sobre cobertura multilingüe ni sobre el comportamiento en castellano.
- Requisitos de hardware muy elevados: 252 GB de pesos y contexto de un millón de tokens hacen inviable el despliegue fuera de clústeres multi-GPU.
- Licencia Apache 2.0 declarada, pero la procedencia del checkpoint base y de la modificación abliterada conviene verificarla antes de uso comercial.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo abliterado y sin evaluaciones, la fiabilidad factual no está garantizada.
- Ediciones alternativas del mismo autor (E32, 285B) con tamaños y comportamientos distintos: no deben tratarse como equivalentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-Abliterated-NVFP4
- Checkpoint base (abliterado): https://huggingface.co/Blackfrost-Research/MiniMax-3.1-Flash-DeRisked
- Edición oficial NVFP4 del mismo autor: https://huggingface.co/defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-NVFP4
- Edición compacta de 32 expertos: https://huggingface.co/defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-E32-NVFP4
- Edición de 96 expertos (285 B): https://huggingface.co/defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-285B-NVFP4
- Checkpoint de 32 expertos de origen: https://huggingface.co/Sm0r3s/MiniMax-M3.1-Flash-E32-unhealed
- Checkpoint podado de 285 B de origen: https://huggingface.co/primitive-ai/MiniMax-M3.1-Flash-pruned-285B-NVFP4
- Modelo original de MiniMax: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
