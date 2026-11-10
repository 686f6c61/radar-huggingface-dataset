# MultiverseComputingCAI/Comet_60B_A12B_NVFP4

## Resumen

Comet 60B es una versión comprimida del modelo multimodal NVIDIA Nemotron 3.5 Super VL 120B, desarrollada por Multiverse Computing mediante su técnica propietaria CompactifAI. El modelo original es un Mixture-of-Experts híbrido Mamba2-Transformer de 124,5B parámetros totales con unos 12,8B activos por token; Comet reduce el total a 61,1B manteniendo aproximadamente 12,3B activos, es decir, la mitad de parámetros totales sin alterar la estructura de capas, el tokenizador ni la plantilla de chat. La arquitectura conserva las 88 capas (40 Mamba2, 40 MoE, 8 de atención), el tamaño oculto de 4096, los expertos en espacio latente de 1024 dimensiones y la capa de predicción multi-token (MTP), además del codificador visual RADIO ViT-H/16.

El modelo acepta texto, imagen y vídeo como entrada y genera texto, con soporte de razonamiento configurable y tool calling. Está pensado para despliegues donde el coste de memoria y el throughput son críticos: el checkpoint BF16 ocupa 122,3 GB frente a los ~249 GB del original, lo que permite servirlo en 2× H200 en lugar de 4, o en una sola H200 con la versión FP8 (66,3 GB) o una sola GPU Blackwell con la versión NVFP4 (40,5 GB).

La relevancia actual reside en que demuestra que la compresión agresiva de un MoE multimodal de gran tamaño puede mantener el rendimiento en benchmarks de agentes, código y razonamiento dentro de unos pocos puntos del original, mejorando incluso en tareas agénticas, mientras reduce a la mitad los requisitos de hardware. La ficha siguiente describe la variante NVFP4, cuantizada en 4 bits para GPUs NVIDIA Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2-Transformer con Mixture-of-Experts latente (88 capas: 40 Mamba2, 40 MoE, 8 de atención); codificador visual RADIO ViT-H/16 (32 capas); 1 capa MTP |
| Parametros totales | 61,1B (58,9B lenguaje, 1,4B MTP, 0,8B codificador visual y proyector); el checkpoint safetensors reporta 34,62B por la cuantización NVFP4 |
| Parametros activos | 12,3B por token (22 de 256 expertos enrutados por capa MoE más 1 experto compartido; incluye embeddings y cabeza de salida) |
| Longitud de contexto | 262.144 tokens evaluados; la configuración admite hasta 1.048.576 posiciones (no evaluadas) |
| Tipos de cuantizacion | NVFP4 mixto (NVFP4/FP8/BF16); también disponibles BF16 (122,3 GB) y FP8 (66,3 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW License Agreement 1.1 (pesos); código del modelo bajo Apache 2.0 |
| Formato de pesos | safetensors (transformers, custom_code); repo de 40,5 GB |

## Arquitectura y entrenamiento

Comet 60B hereda la arquitectura del checkpoint base: un transformer híbrido donde 40 capas usan Mamba2 (modelo de espacio de estados), 40 son capas MoE y 8 son capas de atención clásica. Los expertos operan en un espacio latente de 1024 dimensiones y el modelo enruta 22 de 256 expertos por capa más un experto compartido, lo que da los 12,3B parámetros activos. Se mantiene la capa de predicción multi-token (MTP) del original, que habilita decodificación especulativa durante la inferencia. El codificador visual es un RADIO ViT-H/16 de 32 capas con su proyector correspondiente.

El proceso de compresión CompactifAI reduce a la mitad el número de parámetros totales (de 124,5B a 61,1B) reduciendo el número de expertos enrutados de 512 a 256 por capa, sin tocar la estructura de capas, el tokenizador ni la plantilla de chat. Tras la compresión, el modelo se "curó" mediante destilación del Nemotron 3.5 Super original sobre datos de texto, imagen y vídeo. La variante NVFP4 sigue el layout de cuantización mixta de NVIDIA (NVFP4/FP8/BF16) del checkpoint NVFP4 del modelo base, con expertos y proyecciones en precisión reducida y el resto en BF16.

## Capacidades

- Generación de texto con razonamiento configurable (modo thinking controlable).
- Comprensión de imágenes y vídeo como entrada, con salida de texto.
- Tool calling y function calling, con los mismos parsers de razonamiento y herramientas de vLLM que el modelo base.
- Razonamiento multi-paso y flujos agénticos (τ²-Bench, AutomationBench-AA, SWE-bench Pro).
- Generación y edición de código, incluyendo tareas de ingeniería de software (SWE-bench Verified y Pro).
- Razonamiento matemático y científico (GPQA Diamond, AA-LCR).
- Comprensión de documentos e imágenes, con benchmarks específicos de imagen, documento y vídeo.
- Decodificación especulativa mediante la capa MTP para acelerar la inferencia.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Agentes de atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 262.144 tokens, lo que permite mantener historiales largos y documentos de referencia sin truncar, con tool calling para consultar sistemas internos.
- Automatización de soporte técnico con vídeo: al aceptar vídeo como entrada, puede analizar grabaciones de incidencias o demostraciones de producto y generar diagnósticos o respuestas en texto.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para revisión de parches, resolución de issues y tareas de SWE-bench Pro, donde supera al modelo base.
- Razonamiento documental multimodal: extracción y análisis de información de documentos escaneados, facturas o informes con imágenes incrustadas, aprovechando el codificador ViT-H/16 y el contexto largo.
- Despliegue en infraestructura limitada: la variante NVFP4 (40,5 GB) cabe en una sola GPU Blackwell, lo que permite servir un modelo de 61,1B con capacidades multimodales en un nodo único.
- Servicio de alto throughput: en 4× H200 el modelo sirve entre un 20% y un 23% más de tokens de salida por segundo que el original en trazas de chat y agentes de NVIDIA; la versión FP8 en 2× H200 entrega aproximadamente 1,8× el throughput por GPU del original.
- Evaluación de agentes autónomos: con mejoras en τ²-Bench (airline, retail, telecom) y AutomationBench-AA, es adecuado para prototipar agentes que ejecutan tareas multi-paso con herramientas.

## Benchmarks y rendimiento

La model card indica que Comet 60B supera al modelo base en τ²-Bench (airline, retail y telecom), AutomationBench-AA y SWE-bench Pro, y se mantiene dentro de 3 puntos en 28 de 35 puntuaciones, incluyendo GPQA Diamond, AA-LCR, SWE-bench Verified y la mayoría de benchmarks de imagen, documento y vídeo. No se han publicado los valores numéricos concretos de estos benchmarks en la información disponible, por lo que no se presenta tabla comparativa con cifras.

En cuanto a throughput de servicio: en el mismo hardware de 4× H200, Comet sirve un 20–23% más de tokens de salida por segundo que Nemotron 3.5 Super en trazas de chat y agentes de NVIDIA; la versión FP8 en 2× H200 entrega aproximadamente 1,8× el throughput por GPU del original.

## Requisitos de hardware

- VRAM estimada: NVFP4 40,5 GB de pesos; FP8 66,3 GB; BF16 122,3 GB.
- GPU recomendadas: NVFP4 requiere NVIDIA Blackwell; FP8 requiere NVIDIA Hopper o Blackwell; BF16 funciona en H200.
- Configuración mínima BF16: 2× H200 (141 GB) con contexto completo de 256K, con 58 GiB de pesos por GPU y espacio de caché KV para unas 43 peticiones concurrentes de 256K tokens (medido).
- Configuración FP8: una sola H200 con contexto completo de 256K, 61 GiB de pesos y caché KV para unas 20 peticiones concurrentes de 256K tokens (medido).
- Configuración NVFP4: una sola GPU Blackwell (la model card se corta en este punto; el dato de concurrencia no está disponible).
- Despliegue: vLLM con los mismos parsers de razonamiento y herramientas que el modelo base, con decodificación especulativa MTP.
- No cabe en GPUs de consumo (RTX 4090, etc.) por el tamaño del checkpoint y la necesidad de Blackwell para NVFP4.
- Latencia y throughput: ver sección de benchmarks; no se publican cifras absolutas de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Comet 60B (NVFP4) | 61,1B | 12,3B | 262.144 (evaluado) | OpenMDW 1.1 | Hugging Face, BF16/FP8/NVFP4 |
| NVIDIA Nemotron 3.5 Super VL 120B | 124,5B | 12,8B | 262.144 (evaluado) | según model card del base (no disponible en esta ficha) | Hugging Face |
| Comet 60B (BF16) | 61,1B | 12,3B | 262.144 (evaluado) | OpenMDW 1.1 | Hugging Face |
| Comet 60B (FP8) | 61,1B | 12,3B | 262.144 (evaluado) | OpenMDW 1.1 | Hugging Face |

La comparativa principal es contra el modelo base: Comet reduce a la mitad los parámetros totales manteniendo los activos, mejora en benchmarks agénticos y se mantiene dentro de 3 puntos en la mayoría de los 35 benchmarks evaluados. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; no se declaran otros idiomas.
- No acepta audio como entrada.
- El contexto de 1.048.576 posiciones está permitido por configuración pero no fue evaluado; solo se validaron 262.144 tokens.
- Riesgo de alucinación inherente a los modelos de lenguaje; la model card incluye secciones de seguridad y consideraciones éticas pero no se detallan sesgos concretos en la información disponible.
- La licencia OpenMDW 1.1 permite uso comercial según la model card, pero es un derivado de NVIDIA Nemotron 3.5 Super y está sujeto a los términos de dicha licencia; conviene revisar las condiciones completas antes de producción.
- La variante NVFP4 requiere hardware NVIDIA Blackwell; la FP8 requiere Hopper o Blackwell.
- El checkpoint safetensors reporta 34,62B parámetros por la cuantización NVFP4, lo que puede confundir en herramientas que lean metadatos.
- Al ser un modelo comprimido por destilación, puede presentar degradaciones en tareas no cubiertas por los benchmarks publicados.
- La model card está truncada en la información disponible; faltan detalles sobre la sección NVFP4, seguridad y evaluación completa.

## Enlaces

- Modelo en Hugging Face (NVFP4): https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_NVFP4
- Modelo en Hugging Face (BF16): https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_BF16
- Modelo en Hugging Face (FP8): https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_FP8
- Modelo base NVIDIA Nemotron 3.5 Super VL 120B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- CompactifAI (Multiverse Computing): no disponible en la información proporcionada
