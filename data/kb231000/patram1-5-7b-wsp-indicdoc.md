# kb231000/Patram1.5-7B-WSP-IndicDoc

## Resumen

Patram1.5-7B-WSP-IndicDoc es una compresión especializada en dominio del modelo multimodal bharatgenai/Patram1.5-7B, publicada por el usuario kb231000. Aplica una técnica denominada Weight-Space Programming (WSP) que combina poda de vocabulario, poda de neuronas SwiGLU, reducción de rango por SVD en las matrices de atención y cuantización mixta W4W8, todo ello sin retropropagación (zero backprop). El resultado es un checkpoint de aproximadamente 5,0 GB frente a los 15,52 GB del original, con 4.616.309.472 parámetros reales según safetensors, aunque el nombre comercial conserve la etiqueta "7B" del modelo base.

El modelo está orientado específicamente a OCR de documentos indios e índicos, parseo de tablas a JSON y Markdown, VQA sobre documentos y abstención controlada. Mantiene la arquitectura multimodal image-text-to-text del modelo base y añade una caché KV INT8 por cabeza integrada que reduce el consumo de KV en aproximadamente 1,97 veces (de 0,50 MB/token a unos 0,25 MB/token).

Es relevante ahora porque demuestra una vía de compresión agresiva y especializada sin dependencias externas de cuantización, manteniendo licencia Apache 2.0 y compatibilidad con transformers mediante trust_remote_code. El repositorio no registra descargas ni likes en el momento de la consulta, y la información pública disponible se limita a la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (base Patram1.5-7B) con modulos SwiGLU, atencion MHA de 32 cabezas y vision_tower |
| Parametros totales | 4.616.309.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta interna: bf16 (lm_head, adapter, extra_weight, norms/biases), W8 int8 con escalas fp32 (vision_tower, embed_tokens, L00, L31, down_proj L01-L30), W4_g32 uint8 empaquetado con escalas fp16 (up_gate_proj, qkv_proj, o_proj en L01-L30); KV cache INT8 por cabeza |
| Idiomas soportados | en, hi |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo parte de bharatgenai/Patram1.5-7B, un transformer multimodal con vision_tower y un tronco de 32 capas (L00-L31) con atención MHA de 32 cabezas. La modificación WSP se ejecuta sin backpropagation y consta de cinco etapas. Primero, una poda de vocabulario BPE-DAG-safe que reduce de 100.278 a 52.096 tokens (-394,7 M parámetros), eliminando tokens CJK, cirílicos, árabes, identificadores de programación y tokens raros no documentales, conservando el fallback UTF-8 sin pérdida, los prefijos índicos 0xE0, los 43 tokens nativos índicos, sintaxis JSON/Markdown/HTML, números, moneda y tokens visuales especiales de Patram. Esto reduce lm_head y embed_tokens un 48 % y acelera la proyección final de logits aproximadamente 1,9 veces.

Segundo, una poda contrastiva de neuronas SwiGLU guiada por activaciones en las capas L01-L30 (unas -755 M de parámetros), perfilando activaciones sobre conjuntos Keep (OCR/VQA/tablas/abstención índicos) frente a Drop (matemáticas de competición, código Python/C++/Rust, chat creativo, texto no índico), reduciendo de 11.008 a unas 8.960 neuronas por capa intermedia con una guarda de pérdida de energía de activación documental inferior al 5 %. Tercero, una SVD de espacio nulo en la atención de la capa 0, que elimina 2.942 valores singulares muertos en W_Q y 2.020 en W_K (r = 832/896, preservando el 99,5 % de la energía espectral). Cuarto, una cuantización mixta sensible a la sensibilidad W4W8 sin dependencias externas. Quinto, la caché KV INT8 integrada (Patram15Int8KVCache) que se activa automáticamente durante generate().

## Capacidades

- Generación de texto e imagen-a-texto sobre documentos.
- OCR de documentos indios e índicos, incluyendo texto nativo en escrituras índicas.
- Parseo estructurado de tablas a JSON, Markdown y HTML.
- VQA (visual question answering) sobre documentos e imágenes.
- Abstención controlada: el modelo está entrenado para no responder cuando la información no está presente.
- Comprensión de sintaxis JSON, Markdown y HTML, números y moneda.
- Soporte multilingüe limitado a inglés (en) e hindi (hi).
- Integración con transformers mediante AutoModelForImageTextToText y AutoProcessor con trust_remote_code.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo thinking explícito.

## Casos de uso

- Digitalización de documentos administrativos indios: el modelo convierte facturas, formularios y certificados escaneados a Markdown estructurado, aprovechando su especialización en OCR índico y su vocabulario podado orientado a documentos.
- Extracción de tablas a JSON: en pipelines de ingestión de datos, el modelo transforma tablas de PDFs e imágenes en JSON parseable para bases de datos, gracias al parseo estructurado entrenado y a la conservación de sintaxis JSON/Markdown.
- VQA documental en atención al cliente: responder preguntas sobre contratos o recibos en hindi o inglés, con abstención cuando la respuesta no figura en el documento, reduciendo respuestas inventadas.
- Procesamiento por lotes en GPU de gama media: el checkpoint de 5,0 GB y la caché KV INT8 de 0,25 MB/token permiten desplegar el modelo en GPUs con VRAM moderada para volúmenes altos de documentos.
- Verificación de documentos en back office: clasificación y extracción de campos en flujos de KYC o seguros, usando la abstención para derivar casos ambiguos a revisión humana.
- Indexación de archivos históricos índicos: conversión masiva de corpus escaneados a texto estructurado para motores de búsqueda, aprovechando la preservación de los 43 tokens nativos índicos.
- Despliegue en entornos con restricciones de memoria: la cuantización mixta interna y la ausencia de dependencias externas de cuantización simplifican el empaquetado en contenedores y la inferencia con transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 5,0 GB, por lo que la carga de pesos en bf16/int8 mixto requiere del orden de 5-6 GB de VRAM, más la caché KV (aproximadamente 0,25 MB/token con INT8) y las activaciones del vision_tower.
- GPU recomendadas: A100, H100 o L4 para bf16 (Ampere en adelante); T4 o V100 con float16 según la propia model card (cc < (8,0)).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090, RTX 4090 y GPUs con 8 GB o más, aunque el dato exacto no está publicado.
- Opciones de despliegue: transformers con AutoModelForImageTextToText y trust_remote_code; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y el uso de custom_code dificulta su portabilidad a otros runners.
- Latencia y throughput: no disponibles; la model card solo indica una aceleración aproximada de 1,9 veces en la proyección final de logits y una reducción de 1,97 veces en la caché KV.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Patram1.5-7B-WSP-IndicDoc | 4.616.309.472 | no disponible | en, hi | apache-2.0 | safetensors + custom_code | Compresión WSP de 5,0 GB, KV INT8 |
| bharatgenai/Patram1.5-7B (base) | no disponible (repo original 15,52 GB) | no disponible | en, hi | no disponible en la informacion | safetensors | Modelo multimodal original sin comprimir |
| Otros modelos de OCR documental | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La poda de vocabulario elimina tokens CJK, cirílicos, árabes y de programación; el modelo degradará su rendimiento en esos idiomas y en código fuente.
- La poda de neuronas SwiGLU está orientada a descartar capacidades matemáticas y de código, por lo que el razonamiento matemático y la generación de código se verán afectados de forma deliberada.
- Idiomas soportados limitados a inglés e hindi; no se garantiza calidad en otras lenguas índicas pese a conservar tokens nativos.
- Riesgo de alucinación en OCR y VQA: aunque incorpora abstención, no se han publicado métricas que cuantifiquen su fiabilidad.
- No se han publicado benchmarks ni evaluaciones independientes; las afirmaciones de compresión y aceleración provienen únicamente de la model card del autor.
- El uso de custom_code y trust_remote_code implica ejecutar código del repositorio; conviene auditar los archivos antes de desplegar en producción.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar LICENSE y NOTICE y atribuir al modelo base bharatgenai/Patram1.5-7B.
- Longitud de contexto no documentada; no debe asumirse una ventana larga para documentos extensos sin verificación previa.
- El repositorio no registra descargas ni validación comunitaria, lo que reduce la evidencia sobre su robustez en producción.

## Enlaces

- Hugging Face: https://huggingface.co/kb231000/Patram1.5-7B-WSP-IndicDoc
- Modelo base: https://huggingface.co/bharatgenai/Patram1.5-7B
