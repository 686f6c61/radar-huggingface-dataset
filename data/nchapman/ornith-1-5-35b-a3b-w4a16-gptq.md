# nchapman/Ornith-1.5-35B-A3B-W4A16-GPTQ

## Resumen

Ornith-1.5-35B-A3B-W4A16-GPTQ es una cuantización INT4 de solo pesos (weight-only) del modelo multimodal ornith-ai/Ornith-1.5-35B-A3B, un transformer de mezcla de expertos (MoE) de 35.951.822.704 parámetros totales con aproximadamente 3.000 millones activos por token y capacidad de visión (pipeline image-text-to-text). La ha publicado el usuario nchapman con recetas de llm-compressor y formato compressed-tensors, pensada para servir el modelo en una única GPU con kernels Marlin de vLLM.

El problema que resuelve es de despliegue: el modelo base en BF16 ocupa del orden de 72 GB, lo que exige varios aceleradores; esta versión reduce el repositorio a 22,2 GB al mantener los pesos del modelo de lenguaje en INT4, dejando la torre de visión, el proyector y los pesos de decodificación especulativa `mtp.*` en BF16 sin tocar. Eso permite ejecutar un VLM de 35B en tarjetas de 24-40 GB, algo relevante para prototipado y para inferencia de bajo coste con modelos MoE de pocos parámetros activos.

La ficha se basa exclusivamente en la model card y en los metadatos de HuggingFace: no hay datos publicados de benchmarks, idiomas soportados, longitud de contexto ni mediciones de latencia, por lo que esos campos se marcan como no disponibles. El modelo se publicó el 17 de octubre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con encoder de visión (tag `qwen3_5_moe`), pesos de decodificación especulativa MTP (`mtp.*`) |
| Parametros totales | 35.951.822.704 (safetensors) |
| Parametros activos | Aproximadamente 3.000 millones por token (según nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos INT4, activaciones BF16), group size 128, act-order, compressed-tensors pack-quantized; torre de visión, proyector y pesos `mtp.*` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en 2 shards (`model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`) + `model_mtp.safetensors`; configuración compressed-tensors |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal: un transformer con mezcla de expertos de 35,95B parámetros totales y en torno a 3B activos por token, más una torre de visión y un proyector que lo convierten en image-text-to-text. El tag de arquitectura `qwen3_5_moe` indica la familia de implementación en transformers. El repositorio incluye además pesos `mtp.*` (multi-token prediction), que habilitan decodificación especulativa para acelerar la generación, y plantilla de chat (`chat_template.jinja`) más `generation_config.json` para uso conversacional.

Esta ficha corresponde únicamente al proceso de cuantización, no al entrenamiento. La receta es W4A16 con group size 128, act-order y empaquetado compressed-tensors, calibrada con llm-compressor (oneshot) sobre el conjunto `calib-cascade-v1`: 999 ventanas de 4096 tokens muestreadas con las proporciones nativas de nvidia/Nemotron-Cascade-2-SFT-Data, con las filas fijadas por hash en el dataset `warp-3090-quant-lab-frozen-data`. La cuantización se ejecutó en una sola B200 con la receta "champion" del proyecto warp-3090-quant-lab, con registro de ejecución `quant-35b-ornith.20261017T114909Z.13535`. No se documentan en la información disponible los datos de preentrenamiento, el volumen de tokens ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat incluida en el repositorio.
- Comprensión de imágenes y respuesta en texto (pipeline image-text-to-text): la torre de visión y el proyector se conservan en BF16, por lo que la cuantización no afecta a la entrada visual.
- Decodificación especulativa mediante los pesos MTP incluidos (`model_mtp.safetensors`), orientada a reducir la latencia de generación en vLLM.
- Eficiencia de inferencia tipo MoE: solo ~3B parámetros activos por token, lo que abarata el coste por token frente a un denso de 35B.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con el ecosistema transformers/vLLM.
- Soporte de tool calling, function calling, agentes o modo de razonamiento explícito: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Procesamiento masivo de documentos escaneados en una sola GPU: al mantener la torre de visión en BF16 y los pesos de lenguaje en INT4, se puede montar un pipeline de extracción y resumen de documentos sobre una única tarjeta de 24-40 GB, sin clúster multi-GPU.
- Asistente de soporte con capturas de pantalla: el modelo acepta image-text-to-text, de modo que el usuario puede adjuntar una captura de error y recibir una explicación en lenguaje natural dentro de una conversación multi-turno.
- Generación de texto alternativo y descripciones de catálogo a escala: la ventana de contexto y el coste por token vienen determinados por el modelo base (contexto no disponible en esta ficha), pero el footprint reducido permite ejecutar el etiquetado por lotes en hardware de gama alta para consumidor.
- Análisis de gráficos e infografías en informes: el modelo puede recibir una imagen de dashboard junto a una pregunta textual y devolver una lectura de los datos representados.
- Prototipado e investigación en estación de trabajo: con vLLM y kernels Marlin se puede levantar un servidor compatible con la API de OpenAI para evaluar un VLM de 35B sin aprovisionar A100/H100.
- Moderación y triaje de contenido visual: clasificación y descripción preliminar de imágenes en colas de revisión, dejando la decisión final a revisores humanos.
- Evaluación comparativa de cuantizaciones: al estar la receta y los checksums publicados, sirve como punto de referencia reproducible para medir la pérdida de calidad de W4A16 frente al base BF16 en tareas de visión y lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, ni comparaciones con el modelo base en BF16. Tampoco se documentan mediciones de latencia o throughput para esta cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 22,2 GB, por lo que se necesita un mínimo de ~24 GB de VRAM para cargar los pesos, más el espacio de caché KV (no cuantizada, BF16) y el búfer de activaciones. Con contexto largo, 24 GB puede ser insuficiente.
- GPU recomendadas: NVIDIA B200 (hardware usado para la cuantización), H100 y A100 40/80 GB como opciones holgadas; A100 40 GB como mínimo cómodo para servir con concurrencia.
- GPU de consumo: encaja ajustadamente en una RTX 4090 (24 GB) con contexto moderado y batch pequeño; en tarjetas de 16 GB o menos no es viable sin cuantización adicional del caché KV o descarga parcial a CPU.
- Opciones de despliegue: vLLM es la vía soportada explícitamente (kernels Marlin para compressed-tensors W4A16); también es cargable con transformers. No se documentan builds GGUF, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. Cabe esperar ventaja de decodificación por los ~3B parámetros activos y por los pesos MTP, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-W4A16-GPTQ (esta ficha) | 35,95B / ~3B | no disponible | safetensors INT4 W4A16 + visión/MTP en BF16, 22,2 GB | apache-2.0 | HuggingFace, 0 descargas |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35,95B / ~3B | no disponible | safetensors BF16 (sin cuantizar) | apache-2.0 | HuggingFace |
| Alternativas de la misma categoría (MoE ~30-35B con visión) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de otros modelos comparables dentro de la información proporcionada, ni de resultados de benchmarks que permitan una comparación de rendimiento. La única comparación sustentable es frente al modelo base: mismos parámetros y licencia, con menor huella de memoria pero con la degradación potencial inherente a una cuantización INT4.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de la degradación de calidad introducida por W4A16 en este modelo concreto, ni en lenguaje ni en visión.
- Modelo recién publicado y sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha; los checksums están publicados, pero no hay informes independientes de calidad.
- La calibración procede de un dataset de SFT (nvidia/Nemotron-Cascade-2-SFT-Data) con 999 ventanas de 4096 tokens; el sesgo de calibración hacia ese dominio puede penalizar el rendimiento en otros tipos de entrada, especialmente en contextos muy largos o en imágenes.
- Solo se cuantiza el modelo de lenguaje: la torre de visión y el proyector en BF16 mantienen el coste de memoria y la latencia de la parte visual sin reducir.
- Los pesos MTP en BF16 deben cargarse aparte; si el runtime no los usa, se pierde la ventaja de decodificación especulativa y se ocupa memoria adicional.
- Longitud de contexto e idiomas soportados no están documentados: no se puede garantizar comportamiento en castellano ni en contextos extensos sin probarlo.
- Riesgo de alucinación y sesgos: no evaluado en esta información; al ser un modelo con entrada de imagen, existe riesgo específico de descripciones inventadas o de mala lectura de textos pequeños en imágenes.
- Licencia apache-2.0: permite uso comercial y modificaciones, pero conviene verificar las condiciones del modelo base y de los datasets de calibración citados antes de un despliegue en producción.
- Requiere pila software específica (compressed-tensors + kernels Marlin en vLLM); versiones antiguas de vLLM o transformers pueden no cargar el checkpoint correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nchapman/Ornith-1.5-35B-A3B-W4A16-GPTQ
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Checksums: https://huggingface.co/nchapman/Ornith-1.5-35B-A3B-W4A16-GPTQ/blob/main/SHA256SUMS
- llm-compressor (herramienta de cuantización): https://github.com/vllm-project/llm-compressor
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Filas de calibración fijadas por hash: https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Receta de cuantización (warp-3090-quant-lab): https://github.com/nchapman/warp-3090-quant-lab
