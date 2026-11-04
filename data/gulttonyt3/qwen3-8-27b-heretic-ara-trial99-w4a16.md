# GulttonyT3/Qwen3.8-27B-Heretic-ARA-trial99-W4A16

## Resumen

Qwen3.8-27B-Heretic-ARA-trial99-W4A16 es una versión cuantizada a 4 bits (W4A16) del modelo comunitario Qwen3.8-27B-Heretic-ARA-trial99, publicado por el usuario GulttonyT3. El modelo original parte de Qwen/Qwen3.8-27B y ha sido sometido a un proceso de "abliteration" (eliminación de rechazos) mediante la técnica Heretic, en su iteración número 99. Esta ficha describe exclusivamente el artefacto cuantizado, que conserva la arquitectura multimodal `Qwen3_5ForConditionalGeneration` del modelo base.

La contribución principal de este repositorio es la compresión del modelo: los pesos BF16 originales de 55,56 GB se reducen a 19,45 GB (un 64,99 % menos), manteniendo una ventana de contexto configurada de hasta 262.144 tokens. La cuantización combina AWQ (smoothing) con GPTQ en formato W4A16, con pesos de 4 bits y activaciones de 16 bits, exportados mediante compressed-tensors en modo `pack-quantized`. El resultado está pensado para servir el modelo con vLLM en hardware de una sola GPU de 80 GB.

Es relevante ahora porque permite ejecutar un modelo de 27.781 millones de parámetros con capacidades de lenguaje y visión en un único acelerador, algo inviable con los pesos BF16 completos en configuraciones de consumo. No obstante, se trata de un artefacto experimental de un autor individual, con cero descargas y cero likes en el momento de la consulta, y solo se ha validado la inferencia de texto, no la multimodal ni la decodificación especulativa MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (model type `qwen3_5`), transformer multimodal con atención lineal parcial y módulo MTP |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens configurados (256K); servicio verificado a 8.192 tokens (8K) |
| Tipos de cuantizacion | W4A16 (4-bit pesos, 16-bit activaciones), AWQ + GPTQ, group size 128, symmetric, actorder=static |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con compressed-tensors `pack-quantized` (5 shards principales + `model_mtp.safetensors`) |
| Tamano del repo | 19,5 GB (pesos: 19.452.781.224 bytes / 18,12 GiB) |
| Parametros cuantizados | 400 tensores empaquetados en 4-bit; 15 tensores MTP sin cambios |
| Calibracion | mlabonne/open-perfectblend, 512 muestras, 282.468 tokens, max length 2.048 |
| Fecha de publicacion | 2026-11-04 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `qwen3_5` del modelo base Qwen/Qwen3.8-27B, un transformer multimodal con capacidades de imagen-texto (pipeline `image-text-to-text`) que incorpora proyecciones de atención lineal (`in_proj_a`, `in_proj_b`) y un módulo MTP (Multi-Token Prediction) para decodificación especulativa. El repositorio conserva la configuración de visión y los ficheros de preprocesado, aunque la validación realizada por el autor se limita a inferencia de texto con thinking desactivado por defecto.

El entrenamiento original del modelo base no está documentado en la información disponible. Lo que sí se detalla es el proceso de cuantización: se aplicó `AWQModifier(duo_scaling="both")` junto con `GPTQModifier` siguiendo el ejemplo oficial de LLM Compressor para Qwen3.8, con calibración sobre 512 conversaciones de mlabonne/open-perfectblend (282.468 tokens, seed 42, longitud máxima 2.048 frente a los 4.096 del ejemplo oficial). Los módulos de visión, la cabeza de salida, los embeddings y las proyecciones de atención lineal quedaron sin cuantizar. El proceso Heretic (abliteration) que da nombre al modelo se aplicó en la versión BF16 previa usando mlabonne/harmless_alpaca y mlabonne/harmful_behaviors, y no se reejecutó en esta cuantización.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat incluida en el repositorio.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.8-27B (no verificados de forma independiente en esta cuantización).
- Capacidad multimodal imagen-texto declarada por la arquitectura y los ficheros de preprocesado, aunque el autor indica que no se ha validado la inferencia con imágenes.
- Modo thinking disponible en la arquitectura, desactivado por defecto en la configuración de servicio verificada.
- Decodificación especulativa mediante el módulo MTP incluido (`model_mtp.safetensors`), no validada en esta versión.
- Comportamiento "abliterated": el modelo base ha sido modificado para reducir rechazos, lo que afecta a su comportamiento ante peticiones sensibles.
- Compatibilidad con endpoints (`endpoints_compatible`) y servicio OpenAI-compatible mediante vLLM.

## Casos de uso

- Servicio de chat conversacional autoalojado: desplegable con vLLM en una A100 80 GB usando 8K de contexto, adecuado para prototipos de asistentes con API compatible con OpenAI.
- Investigación sobre alineación y seguridad: el carácter "abliterated" del modelo lo hace útil para estudiar el comportamiento de modelos sin rechazos y comparar con la versión alineada.
- Experimentación con cuantización W4A16: sirve como referencia práctica de un pipeline AWQ + GPTQ con compressed-tensors y su despliegue en vLLM 0.32.0 con kernel Marlin.
- Evaluación de arquitecturas híbridas con atención lineal y MTP: el repositorio conserva las proyecciones `in_proj_a`/`in_proj_b` y el módulo MTP, lo que permite estudiar su comportamiento (aunque no estén validados).
- Pruebas de contexto largo en hardware único: la configuración de 256K tokens permite experimentar con ventanas extensas en una sola GPU de 80 GB, ajustando `--max-model-len` y el uso de memoria.
- Docencia y demostraciones de cuantización: el repositorio incluye `recipe.yaml`, manifiesto de integridad SHA-256 y scripts de verificación, útiles para reproducir el proceso.
- Base para fine-tuning ligero sobre modelos cuantizados: aunque no es el flujo recomendado, permite explorar adaptaciones sobre un checkpoint de 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni evaluaciones de calidad tras la cuantización, y solo menciona que se superaron "pruebas básicas" de carga e inferencia en vLLM 0.32.0 sobre A100-SXM4-80GB con kernel Marlin.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 18,12 GiB; con caché KV para 8K de contexto y overhead de vLLM, el autor usa `--gpu-memory-utilization 0.40` sobre una A100 de 80 GB (unos 32 GB reservados). Para 256K de contexto la demanda de caché KV crece de forma significativa y no está cuantificada en la información disponible.
- GPU verificada: NVIDIA A100-SXM4-80GB con kernel Marlin.
- GPU recomendadas: A100 80 GB o H100 80 GB para contexto largo; para 8K podría intentarse en GPUs de 48 GB (L40S, RTX A6000) ajustando el uso de memoria, aunque no está verificado.
- GPU de consumo: no cabe en RTX 4090 (24 GB) con los pesos de 18,12 GiB más caché y overhead de vLLM de forma holgada; no se ha validado en consumer GPU.
- Despliegue verificado: `vllm/vllm-openai:v0.32.0` con PyTorch 2.13.0+cu130, Transformers 5.19.0 y compressed-tensors 0.17.0.
- Otras opciones (llama.cpp, Ollama, TGI): no disponibles para este formato W4A16 de compressed-tensors; requerirían conversión adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Heretic-ARA-trial99-W4A16 (este) | 27,78 B | 256K config. / 8K verificado | W4A16 AWQ+GPTQ | Apache-2.0 | HuggingFace, 0 descargas |
| GulttonyT3/Qwen3.8-27B-Heretic-ARA-trial99 (BF16) | 27,78 B | 256K config. | BF16 | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | BF16 | Apache-2.0 (segun modelo base) | HuggingFace |

No se dispone de datos de benchmarks ni de modelos comparables de otros autores en la información proporcionada; la comparativa se limita a las variantes del mismo linaje.

## Limitaciones y advertencias

- Modelo "abliterated": la eliminación de rechazos puede producir respuestas inapropiadas o dañinas ante peticiones sensibles; no es apto para producción orientada al público sin filtros adicionales.
- Solo se ha validado inferencia de texto con thinking desactivado; las capacidades de visión, vídeo y decodificación especulativa MTP no están verificadas.
- El contexto de 256K está configurado pero solo se ha servido a 8K; el comportamiento en ventanas largas no está validado.
- La calibración de cuantización usó 2.048 tokens de longitud máxima frente a los 4.096 del ejemplo oficial, lo que puede degradar ligeramente la calidad en secuencias largas.
- Artefacto experimental de un autor individual, con cero descargas y cero likes; sin evaluación de calidad publicada ni revisión comunitaria.
- Idiomas soportados no declarados; el comportamiento multilingüe no está verificado.
- Requiere versiones específicas de vLLM (0.32.0) y compressed-tensors (0.17.0); combinaciones distintas no están garantizadas.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento abliterated recae en el desplegador.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización.
- El repositorio incluye 20 ficheros con manifiesto SHA-256; se recomienda verificar la integridad tras la descarga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GulttonyT3/Qwen3.8-27B-Heretic-ARA-trial99-W4A16
- Modelo base BF16: https://huggingface.co/GulttonyT3/Qwen3.8-27B-Heretic-ARA-trial99
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de calibración: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Ejemplo LLM Compressor Qwen3.8 AWQ+GPTQ: https://github.com/vllm-project/llm-compressor/blob/04546e05125298c87b267253959eff39c6968925/examples/quantization_w4a16/qwen3_8_gptq_awq_example.py
- Documentación Hugging Face CLI: https://huggingface.co/docs/huggingface_hub/guides/cli#hf-download
