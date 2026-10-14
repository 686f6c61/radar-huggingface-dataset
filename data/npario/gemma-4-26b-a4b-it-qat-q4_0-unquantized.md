# npario/gemma-4-26B-A4B-it-qat-q4_0-unquantized

## Resumen

Este repositorio contiene el checkpoint sin cuantizar del modelo Gemma 4 26B A4B instruction-tuned (it) entrenado con Quantization-Aware Training (QAT) bajo el esquema Q4_0, publicado en HuggingFace por el usuario npario a partir del modelo base google/gemma-4-26B-A4B-it. Se trata de pesos en media precisión (bfloat16) extraídos del pipeline de QAT, pensados para compilación y research downstream, no de un modelo cuantizado listo para producción: el nombre "q4_0" hace referencia al esquema QAT con el que fue entrenado, no al formato de almacenamiento de este repositorio.

Gemma 4 es la familia de modelos abiertos de Google DeepMind, multimodal (texto e imagen) y con soporte de audio en las variantes E2B, E4B y 12B. El modelo 26B A4B emplea una arquitectura Mixture-of-Experts: 25.805.936.206 parámetros totales con aproximadamente 4B activos por token, lo que permite un coste de inferencia propio de un modelo de ~4B manteniendo la capacidad de uno de ~26B. Su ventana de contexto alcanza los 256K tokens, con soporte multilingüe en más de 140 idiomas y soporte nativo de function calling, modos de razonamiento configurables y rol `system`.

Es relevante ahora porque combina tres tendencias de 2026: eficiencia MoE en el rango de los 26B totales, cuantización integrada en el entrenamiento (QAT) para reducir requisitos de memoria sin degradar calidad respecto a bf16, y multimodalidad nativa en un modelo de pesos abiertos con licencia Apache 2.0. La variante sin cuantizar interesa a quien necesite recompilar, re-cuantizar o investigar el comportamiento de los pesos QAT originales antes de su serialización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (MoE); atencion hibrida (sliding window local de 1024 tokens + atencion global, ultima capa siempre global), Keys y Values unificadas en capas globales y Proportional RoPE (p-RoPE) |
| Parametros totales | 25.805.936.206 (~25,8B) |
| Parametros activos | ~4B (segun la nomenclatura A4B del modelo base) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Este repositorio: pesos sin cuantizar (media precision, ~2 bytes/parametro) del pipeline QAT Q4_0. La familia Gemma 4 QAT se distribuye ademas en GGUF Q4_0, wNa8o8 optimizado para movil y compressed-tensors w4a16 para vLLM |
| Idiomas soportados | Mas de 140 (segun la model card del modelo base) |
| Licencia | apache-2.0 (la model card enlaza a los terminos de licencia de Gemma 4) |
| Formato de pesos | safetensors |
| Modalidades de entrada | Texto e imagen (aspect ratio y resolucion variable); video. Audio no soportado en esta variante (solo E2B, E4B y 12B) |
| Modalidades de salida | Texto |
| Tamano de vocabulario | 262K |
| Tamano del repositorio | 51,6 GB |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con capas MoE y una atencion hibrida que intercala ventanas deslizantes locales (sliding window de 1024 tokens en los modelos medianos) con capas de atencion global, garantizando que la capa final sea siempre global. Este diseno busca el coste de memoria y velocidad de un modelo ligero sin renunciar a la cobertura de contexto largo. En las capas globales se emplean Keys y Values unificadas, lo que reduce el coste de la KV cache, y se aplica Proportional RoPE (p-RoPE) para optimizar la memoria en contextos extensos. El vocabulario es de 262K tokens.

El entrenamiento se realizo con Quantization-Aware Training sobre el esquema Q4_0, de modo que los pesos aprendidos ya contemplan la cuantizacion a 4 bits y, segun Google, preservan una calidad cercana a bfloat16 al cargarse en ese formato. Este repositorio redistribuye los pesos en media precision extraidos de ese pipeline: no son pesos cuantizados a 4 bits, sino los pesos "unquantized" del pipeline QAT, ideales para recompilacion, re-cuantizacion o investigacion. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, de la composicion del dataset ni de los detalles del pipeline de alineacion (RLHF/DPO) del modelo base, por lo que estos datos quedan como no disponibles. Tampoco se especifica el tamano del codificador de vision para esta variante concreta (en el 31B Dense es de ~550M parametros).

Una innovacion operativa relevante es el soporte de decodificacion especulativa con multi-token prediction mediante un modelo assistant. La model card advierte de una restriccion importante: si se usa un assistant junto a un modelo objetivo QAT, el assistant debe ser tambien un checkpoint QAT con la misma precision para garantizar la compatibilidad.

## Capacidades

- Generacion de texto y razonamiento con modos de "thinking" configurables en toda la familia.
- Comprension multimodal de imagen con soporte de aspect ratio y resolucion variable, y de video. Esta variante concreta no procesa audio.
- Generacion y asistencia en codigo, con mejoras declaradas por Google en benchmarks de coding frente a generaciones anteriores (sin cifras publicadas en la informacion disponible).
- Razonamiento matematico y tareas de analisis multi-paso.
- Tool calling / function calling nativo, orientado a flujos agenticos.
- Soporte nativo del rol `system`, lo que permite conversaciones mas estructuradas y controlables.
- Capacidades multilingues en mas de 140 idiomas.
- Capacidad de operar como agente autonomo con razonamiento multi-paso.
- Compatibilidad con decodificacion especulativa mediante assistant QAT de la misma precision.

## Casos de uso

- Atencion al cliente automatizada: la ventana de 256K tokens permite mantener el historial completo de una conversacion multi-turno, junto con documentacion de producto y tickets previos, sin truncado agresivo ni recuperacion externa obligatoria.
- Analisis de documentos con componente visual: al aceptar imagen y texto, el modelo puede extraer datos de facturas, informes escaneados o capturas de interfaz y responder preguntas sobre ellos en una sola pasada, evitando encadenar un OCR con un LLM de texto.
- Agentes autononomos con herramientas: gracias al function calling nativo y al soporte del rol `system`, se puede construir un agente que consulte APIs, escriba ficheros y encadene pasos, usando el modelo como planificador y ejecutor.
- Generacion y revision de codigo en produccion: puede integrarse en pipelines de CI/CD para revisar pull requests, generar tests o explicar regresiones, con la ventaja de que ~4B parametros activos reducen el coste por token frente a un dense equivalente.
- Analisis de video e inspeccion visual: para monitorizacion de procesos industriales o revision de grabaciones, el modelo procesa entradas de video y responde en lenguaje natural sobre eventos detectados.
- Investigacion y recompilacion de pesos QAT: al ser un checkpoint sin cuantizar, es la base adecuada para estudiar el impacto del Quantization-Aware Training, experimentar con nuevos esquemas de cuantizacion o generar variantes propias para hardware especifico.
- Asistente de razonamiento con contexto extenso: analisis de contratos, expedientes normativos o bases de conocimiento largas donde la coherencia global de las capas de atencion es determinante.
- Despliegue en workstation o servidor con vLLM: como modelo de referencia en media precision para entornos con 80 GB de VRAM, o en su variante compressed-tensors w4a16 de la familia cuando se prioriza el coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base menciona mejoras notables en benchmarks de codigo y capacidades agenticas, y posiciona a la familia como de "rendimiento frontier en cada tamano", pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de otras evaluaciones en el material proporcionado. No se deben asumir valores numericos sin la fuente primaria (informe tecnico arXiv:2607.02770).

## Requisitos de hardware

- Inferencia en bfloat16 (formato de este repositorio): los pesos ocupan 51,6 GB, por lo que se necesita aproximadamente 52-56 GB de VRAM contando KV cache y overhead de runtime. Encaja en una A100 80 GB, H100 80 GB o L40S 48 GB (esta ultima con margen muy ajustado y contexto recortado).
- Consumer GPU en media precision: no cabe en una RTX 4090 o RTX 3090 de 24 GB. Seria necesario repartir en 3 GPU de 24 GB o recurrir a las variantes cuantizadas de la familia.
- Uso en consumer con cuantizacion 4-bit (variantes GGUF Q4_0 de la familia, no este repositorio): el modelo deberia ocupar del orden de 14-16 GB, lo que lo hace desplegable en RTX 4090, RTX 3090 o Apple Silicon con memoria unificada amplia.
- Perfil de inferencia: al ser MoE con ~4B parametros activos, el coste de computo por token es comparable al de un modelo denso de ~4B, aunque la memoria debe alojar los ~26B totales.
- Opciones de despliegue: transformers (libreria declarada en este repositorio), vLLM mediante los checkpoints compressed-tensors w4a16 de la familia, llama.cpp u Ollama mediante los GGUF Q4_0, y TGI si se serializa en un formato compatible.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para esta variante.

## Comparativa con modelos similares

Comparativa dentro de la familia Gemma 4 QAT, segun los datos de la model card:

| Modelo | Parametros | Arquitectura | Contexto | Modalidades | Licencia |
|---|---|---|---|---|---|
| Gemma 4 26B A4B QAT Q4_0 unquantized (este repo) | 25,8B totales, ~4B activos | MoE, hibrida | 256K | Texto, imagen, video | apache-2.0 |
| Gemma 4 12B Unified | 11,95B | Densa, hibrida | 256K | Texto, imagen, audio | apache-2.0 |
| Gemma 4 31B Dense | 30,7B | Densa, hibrida | 256K | Texto, imagen | apache-2.0 |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | Densa con Per-Layer Embeddings | 128K | Texto, imagen, audio | apache-2.0 |

Frente a alternativas externas de la misma categoria (MoE de ~30B con pocos miles de millones de parametros activos, como la familia Qwen3-30B-A3B), la comparacion de rendimiento no esta disponible en la informacion proporcionada: la model card no ofrece cifras de benchmarks y no se han aportado resultados de terceros. Las diferencias verificables son de contexto (256K frente a ventanas habitualmente menores en modelos abiertos comparables), modularidad de variantes y licencia permisiva.

## Limitaciones y advertencias

- Repositorio de terceros: el autor es npario, no Google DeepMind. Con 0 descargas y 0 likes en el momento de la consulta, no hay validacion de la comunidad ni garantia de que los pesos coincidan exactamente con el checkpoint oficial.
- Este repositorio no es una version cuantizada utilizable tal cual en hardware de consumo: contiene pesos en media precision de 51,6 GB. Quien busque Q4_0 desplegable debe usar los GGUF Q4_0 de la coleccion oficial.
- No hay datos de benchmarks publicados, por lo que cualquier afirmacion de rendimiento relativo es especulativa.
- Riesgo de alucinacion inherente a los modelos generativos, mas acusado en tareas de recuperacion factual y en contextos muy largos donde la atencion puede diluirse.
- Cobertura idiomatica desigual: aunque el modelo base declara mas de 140 idiomas, el rendimiento en idiomas de bajos recursos suele ser inferior al de ingles; no se han publicado evaluaciones por idioma en la informacion disponible.
- Esta variante no procesa audio, a diferencia de E2B, E4B y 12B.
- Licencia: los tags y la model card indican apache-2.0, pero el enlace de licencia apunta a los terminos especificos de Gemma 4. Conviene revisar dichos terminos antes de un uso comercial, ya que puede existir una politica de uso aceptable adicional.
- Decodificacion especulativa: si se combina con un modelo assistant, este debe ser tambien QAT y de la misma precision, lo que limita la mezcla de checkpoints heterogeneos.
- Restricciones de memoria en produccion: servir los pesos en bf16 obliga a GPU de 80 GB o a paralelismo multi-GPU, con el coste economico asociado.
- No disponible: informacion sobre sesgos especificos medidos, detalles del dataset de entrenamiento, composicion de datos multimodales y resultados de evaluaciones de seguridad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/npario/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Coleccion Gemma 4 QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- Repositorio GitHub de Gemma: https://github.com/google-gemma
- Blog de lanzamiento de QAT en Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
