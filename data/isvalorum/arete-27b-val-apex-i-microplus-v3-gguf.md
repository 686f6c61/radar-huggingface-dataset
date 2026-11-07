# IsValorum/Arete-27B-VAL-APEX-I-MicroPlus-V3-GGUF

## Resumen

Arete-27B VAL-APEX-I MicroPlus V3 es una cuantización GGUF de tipo quirúrgico del modelo denso NousResearch/Arete-27B, publicada por el usuario independiente IsValorum bajo la serie "APEX Quantization Series". El objetivo es comprimir un modelo de 26.895.998.464 parámetros (unos 26,9 mil millones) hasta un fichero de 10,25 GB (9,55 GiB), de modo que pueda ejecutarse en GPU de consumo con 12-16 GB de VRAM sin renunciar a las capas más sensibles del modelo. La cuantización no es uniforme: aplica precisión F32 a todas las normalizaciones y a los parámetros recurrentes del bloque SSM, Q5_K a la cabeza de salida y atención de valores, y comprime las proyecciones FFN con IQ2_S e IQ2_XXS.

El modelo base, NousResearch/Arete-27B, emplea una arquitectura Qwen3.5 densa híbrida (`Qwen3_5ForConditionalGeneration`) con 64 capas, de las cuales 48 son de atención lineal Gated DeltaNet y 16 de atención completa, además de soporte de texto y visión. Esta ficha describe la versión MicroPlus V3, la más agresiva de la familia en cuanto a compresión (frente a MiniPlus de 14,03 GB y NanoPlus de 12,70 GB).

Es relevante ahora porque demuestra una estrategia de cuantización por capas y por tensor que preserva la estabilidad en contexto largo (gracias al shielding en F32 de los decaimientos recurrentes) mientras reduce el peso a la mitad aproximadamente respecto al checkpoint original en BF16. La licencia Apache 2.0 y la compatibilidad con endpoints facilitan su despliegue en entornos de producción y en herramientas como llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido Qwen3.5 (`Qwen3_5ForConditionalGeneration`): 64 capas, 48 de atención lineal Gated DeltaNet y 16 de atención completa |
| Parametros totales | 26.895.998.464 (26,9 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con mezcla por tensor: F32, Q8_0, Q5_K, Q4_K, Q4_0, Q3_K, IQ2_S, IQ2_XXS |
| Idiomas soportados | en, es, fr, de, it, pt, zh, ja, ko, ar, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (10,25 GB / 9,55 GiB; repo de 10,3 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso híbrido de la familia Qwen3.5 con 64 capas: 48 capas usan atención lineal Gated DeltaNet (un mecanismo de atención lineal con estado recurrente) y 16 capas usan atención completa tradicional. El checkpoint contiene 851 tensores e incluye proyector de visión, por lo que el modelo base es multimodal texto-imagen. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

La innovación principal de esta publicación es la cuantización quirúrgica por tensor. Todas las normalizaciones (209 tensores: `output_norm`, `attn_*_norm`, `post_attention_norm`, `ssm_norm`) y los parámetros recurrentes del SSM (192 tensores: `ssm_alpha`, `ssm_a`, `ssm_dt.bias`, `ssm_conv1d`) se mantienen en F32 para preservar la estabilidad en contexto largo. La cabeza de salida (`output.weight`) usa Q5_K para proteger la cola del vocabulario, mientras que las proyecciones FFN (`ffn_gate`, `ffn_up`, `ffn_down`) se comprimen con IQ2_S en las capas 0-15 y 48-63 e IQ2_XXS en las capas centrales 16-47, dejando mayor precisión en los bordes de la red. La matriz de importancia (imatrix) procede del GGUF de bartowski y se reutiliza sin recalcular. La capa 0 aplica un tratamiento especial con Q4_0 en `attn_gate`, `attn_qkv`, `ssm_beta` y `ssm_out`. No hay bloque MTP (multi-token prediction) en el checkpoint.

## Capacidades

- Generación de texto conversacional y razonamiento de múltiples pasos, heredado del modelo base Arete-27B.
- Capacidad multimodal texto-imagen en el modelo base (el proyector de visión `mmproj` no se incluye en este repositorio GGUF, por lo que la visión no está disponible directamente en esta cuantización).
- Soporte multilingüe declarado para 11 idiomas: inglés, español, francés, alemán, italiano, portugués, chino, japonés, coreano, árabe y ruso.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia estándar.
- Etiqueta `conversational`, orientada a diálogo multi-turno.
- No se dispone de información específica sobre tool calling, function calling ni modo thinking en la documentación proporcionada; estas capacidades dependerían del modelo base y no están confirmadas para esta cuantización.

## Casos de uso

- Asistente conversacional local en GPU de consumo: con 9,55 GiB de pesos, el modelo cabe en tarjetas de 12 GB y permite desplegar un asistente multi-turno en estaciones de trabajo sin infraestructura cloud.
- Generación de texto en 11 idiomas: adecuado para aplicaciones de traducción, redacción o atención al cliente en español, francés, alemán, italiano, portugués, chino, japonés, coreano, árabe y ruso, aprovechando el soporte multilingüe declarado.
- Prototipado e investigación en entornos con recursos limitados: investigadores que necesitan evaluar un modelo de 27B sin acceso a A100/H100 pueden usar esta cuantización para experimentos de prompting y evaluación cualitativa.
- Despliegue en edge o en portátiles con GPU: la compresión a IQ2 permite ejecutar el modelo en equipos con 12-16 GB de VRAM mediante llama.cpp u Ollama, útil para demos y pruebas offline.
- Chatbot de documentación técnica interna: el modelo puede integrarse en pipelines de generación aumentada por recuperación (RAG) para responder preguntas sobre manuales, con la ventaja de que el contexto y el estado recurrente se mantienen en F32 para mayor estabilidad.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia para estudiar el impacto de la cuantización mixta (IQ2_S vs IQ2_XXS por capas) en la calidad de salida frente a los tiers MiniPlus y NanoPlus de la misma familia.
- Fine-tuning ligero o adaptación con LoRA sobre GGUF: aunque limitado, permite experimentar con adaptadores sobre una base ya cuantizada en entornos de un solo equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10,25 GB (9,55 GiB) solo para los pesos; con overhead de contexto y caché KV se recomienda al menos 12 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 12 GB, RTX 4080 16 GB, RTX 4090 24 GB; en el segmento profesional, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB). En tarjetas de 8 GB no cabría sin offloading parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere integración con servicios de inferencia estándar. No se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| Arete-27B VAL-APEX-I MicroPlus V3 (este) | 26,9 mil M | no disponible | GGUF, 10,25 GB | Apache 2.0 | Cuantización IQ2_S/IQ2_XXS con shielding F32 en SSM y normas |
| Arete-27B VAL-APEX-I NanoPlus V3 | 26,9 mil M | no disponible | GGUF, 12,70 GB | Apache 2.0 | Mismo base, mayor precisión, ~11,83 GiB |
| Arete-27B VAL-APEX-I MiniPlus V3 | 26,9 mil M | no disponible | GGUF, 14,03 GB | Apache 2.0 | Tier de mayor tamaño de la familia, ~13,07 GiB |
| NousResearch/Arete-27B (base) | 26,9 mil M | no disponible | safetensors (BF16) | Apache 2.0 | Checkpoint original sin cuantizar, incluye proyector de visión |

## Limitaciones y advertencias

- La cuantización con IQ2_S e IQ2_XXS en las proyecciones FFN introduce pérdida de precisión notable; la calidad puede degradarse frente al modelo base en tareas de razonamiento complejo o generación de código.
- El proyector de visión (`mmproj`) no se incluye en este repositorio, por lo que la capacidad multimodal texto-imagen del modelo base no está disponible en esta cuantización.
- No hay información sobre sesgos conocidos del modelo base ni sobre su comportamiento en dominios sensibles; se recomienda evaluar antes de uso en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala, agravado potencialmente por la compresión agresiva de las capas FFN.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad de la cuantización ni sobre el cumplimiento de las condiciones del modelo base.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de su calidad.
- No se dispone de información sobre la longitud de contexto soportada, lo que impide garantizar el rendimiento en ventanas largas a pesar del shielding F32 en los parámetros recurrentes.
- El repositorio tiene un tamaño de 10,3 GB, ligeramente superior al fichero GGUF de 10,25 GB, probablemente por metadatos y el mapa de tensores (`tensor-map.tsv`).

## Enlaces

- Hugging Face: https://huggingface.co/IsValorum/Arete-27B-VAL-APEX-I-MicroPlus-V3-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Tier MiniPlus: https://huggingface.co/IsValorum/Arete-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Tier NanoPlus: https://huggingface.co/IsValorum/Arete-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Colección VAL-APEX MiniPlus Abliterated: https://huggingface.co/collections/IsValorum/val-apex-miniplus-abliterated-27b
- Colección VAL-APEX NanoPlus Standard: https://huggingface.co/collections/IsValorum/val-apex-nanoplus-standard-27b
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
