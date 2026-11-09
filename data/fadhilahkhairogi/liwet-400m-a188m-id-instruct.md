# fadhilahkhairogi/Liwet-400M-A188M-id-instruct

## Resumen

Liwet-400M-A188M-id-instruct es un modelo de lenguaje en indonesio desarrollado por el Grupo 11 de la asignatura de Generative AI de la Universidad de Telkom (Indonesia). Se trata de un modelo de arquitectura transformer con mezcla de expertos dispersa (Sparse MoE, según la propia model card), entrenado desde cero con 400.098.304 parámetros totales y 187.761.664 parámetros activos por token (~46,9 % del total). El modelo parte de una base preentrenada (Liwet-400M-A188M-id-base) y se ha ajustado con supervisión (SFT) sobre varios corpus de conversación en indonesio, lo que lo orienta a generación de texto conversacional en ese idioma.

La relevancia del modelo es fundamentalmente académica y de experimentación: se trata de un proyecto de curso universitario, con licencia no declarada, sin benchmarks publicados y con cero descargas en el momento de redactar esta ficha. Aun así, resulta interesante como ejemplo de implementación de un MoE de tamaño pequeño (400 M) entrenado desde cero para un único idioma de bajos recursos, con una ventana de contexto de 2.048 tokens y vocabulario BPE de 32.000 entradas.

Su utilidad práctica es limitada: cubre solo indonesio, tiene un contexto corto y no ha sido evaluado con benchmarks estándar, por lo que debe considerarse una pieza de investigación más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Sparse MoE (`IndonesianChatLM`): 32 capas, GQA 16Q/4KV, dimensión 1.024, routing top-2 sobre 8 expertos enrutados, `moe_intermediate_size=360`, RoPE, SwiGLU |
| Parámetros totales | 400.098.304 |
| Parámetros activos | 187.761.664 (~46,9 % del total) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Indonesio (`id`) |
| Licencia | no disponible |
| Formato de pesos | SafeTensors (`bfloat16`) |
| Vocabulario | 32.000 Byte-Level BPE (`<pad>=0`, `<bos>=1`, `<eos>=2`, `<unk>=3`) |
| Métricas finales | `val_loss=2.2086`, `val_ppl=9.10` |
| Throughput máximo declarado | 5.664 tok/s |
| Modelo base | fadhilahkhairogi/Liwet-400M-A188M-id-base |
| Dataset de SFT | `neosantara/IndoTalkSFT`, `AksaraLLM/aksara-sft-clean-v6`, `INTISARI/intisari-indonesian-chat-v5`, `daruokta/t5gemma2-indonesia-chat-formatted`, `LorthGyu/indonesian-chat` |

## Arquitectura y entrenamiento

El modelo se construye desde cero como un transformer decoder-only con mezcla de expertos dispersa. Contiene 32 capas con atención por consultas agrupadas (GQA, 16 cabezas de consulta y 4 de clave-valor) y dimensión oculta de 1.024. La capa MoE emplea routing top-2 sobre 8 expertos enrutados con `moe_intermediate_size=360`, lo que da lugar a 400 M de parámetros totales de los que solo 187,8 M se activan en cada paso (cerca de un 46,9 %). Usa normalización por RoPE para las posiciones y activación SwiGLU.

El ajuste fino supervisado (SFT) se realizó sobre 162.646 filas válidas de un total de 165.640, durante 5.083 pasos, combinando cinco corpus de conversación en indonesio (IndoTalkSFT, aksara-sft-clean-v6, intisari-indonesian-chat-v5, t5gemma2-indonesia-chat-formatted e indonesian-chat). No se documentan fases de RLHF o DPO, ni técnicas de atención lineal o decodificación especulativa. La model card solo declara las métricas finales de validación (`val_loss=2.2086`, `val_ppl=9.10`) y un pico de 5.664 tokens por segundo durante el entrenamiento.

## Capacidades

- Generación de texto conversacional en indonesio (`text-generation`).
- Razonamiento y respuesta a instrucciones básicas gracias al ajuste SFT multi-turno.
- Formato de prompt específico: `<bos>User: {prompt}\n\nAssistant:`, con parada en `<eos>` (id 2) o en `User:`.
- Ventana de contexto de 2.048 tokens, suficiente para diálogos cortos, no para documentos largos.
- Routing MoE disperso: activa 2 de 8 expertos por token, lo que reduce el coste de inferencia frente a un modelo denso equivalente.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al indonesio (único idioma declarado en las etiquetas y en la model card).

## Casos de uso

- Experimentación académica con arquitecturas MoE de bajo coste: el modelo puede servir como banco de pruebas para estudiar routing disperso, GQA y entrenamiento desde cero sobre un único idioma, dado su tamaño contenido (400 M totales) y su formato SafeTensors.
- Asistente conversacional en indonesio para entornos de demostración: con la plantilla `<bos>User: …\n\nAssistant:` puede gestionar diálogos multi-turno cortos, adecuados para prototipos de atención al cliente en ese idioma.
- Fine-tuning adicional sobre dominios concretos: al ser un modelo pequeño y partir de una base preentrenada, es viable reajustarlo con presupuestos modestos de GPU para verticales específicos (por ejemplo, atención al cliente de comercio electrónico en Indonesia).
- Generación de respuestas breves para chatbots en aplicaciones móviles: 187,8 M de parámetros activos permiten desplegarlo en GPUs modestas o incluso en CPU con cuantización, si se generan las variantes oportunas.
- Investigación sobre alineación y SFT en idiomas de bajos recursos: los cinco corpus de conversación en indonesio utilizados documentan una receta reproducible para otros idiomas minoritarios.
- Educación y docencia: el modelo y su model card (con métricas de validación y datasets declarados) constituyen un ejemplo didáctico completo de un pipeline de preentrenamiento + SFT.
- Evaluación comparativa de MoE pequeños: útil para contrastar el rendimiento de routing top-2 frente a modelos densos del mismo tamaño en tareas de generación en indonesio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas internas de validación:

| Métrica | Valor |
|---|---|
| `val_loss` | 2,2086 |
| `val_ppl` | 9,10 |
| Throughput pico de entrenamiento | 5.664 tok/s |

No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 0,8 GB solo para pesos (400 M × 2 bytes), más el overhead del runtime y de la caché KV para 2.048 tokens (despreciable a esta escala).
- VRAM estimada en cuantización de 8 bits: ~0,4 GB; en 4 bits: ~0,2 GB (estimación teórica; no se publican variantes cuantizadas).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o RTX 4090 lo ejecutan con holgura. También cabe en GPUs de gama de entrada y en CPU.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 1-2 GB de VRAM libre (por ejemplo, GTX 1650, RTX 3050, RTX 4090).
- Opciones de despliegue: el formato publicado es SafeTensors; sería necesario generar conversiones para llama.cpp/Ollama (GGUF) o usar vLLM/TGI/Transformers con el código de la arquitectura `IndonesianChatLM`. No se documentan integraciones listas.
- Latencia y throughput: no se publican cifras de inferencia. El único dato disponible es un pico de 5.664 tok/s durante el entrenamiento, no representativo del throughput de serving.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de una comparación publicada con modelos comparables. Como referencia estructural, podrían considerarse alternativas del ecosistema indonesio de tamaño similar, pero no se han encontrado en la información proporcionada. Se indica "no disponible" para la comparativa cuantitativa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Liwet-400M-A188M-id-instruct | 400 M totales / 187,8 M activos | 2.048 | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial; conviene contactar con los autores antes de cualquier uso en producción.
- Modelo de un solo idioma (indonesio); no se declara soporte de castellano ni de otros idiomas.
- Ventana de contexto muy corta (2.048 tokens): inadecuado para documentos largos, RAG con muchos fragmentos o conversaciones extensas.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad frente a alternativas; las métricas reportadas son solo de validación interna.
- Riesgo de alucinación y de sesgos desconocidos: no se documentan evaluaciones de seguridad, sesgo ni red-teaming.
- Proyecto académico de un curso universitario, con cero descargas y sin mantenimiento declarado; no hay garantía de soporte ni de actualizaciones.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; asumir que no las tiene.
- El formato de prompt es específico (`<bos>User: …\n\nAssistant:`); usarlo de otra forma degradará la calidad de las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-400M-A188M-id-instruct
- Modelo base: https://huggingface.co/fadhilahkhairogi/Liwet-400M-A188M-id-base
- Dataset IndoTalkSFT: https://huggingface.co/datasets/neosantara/IndoTalkSFT
- Dataset aksara-sft-clean-v6: https://huggingface.co/datasets/AksaraLLM/aksara-sft-clean-v6
- Dataset intisari-indonesian-chat-v5: https://huggingface.co/datasets/INTISARI/intisari-indonesian-chat-v5
- Dataset t5gemma2-indonesia-chat-formatted: https://huggingface.co/datasets/daruokta/t5gemma2-indonesia-chat-formatted
- Dataset indonesian-chat: https://huggingface.co/datasets/LorthGyu/indonesian-chat
