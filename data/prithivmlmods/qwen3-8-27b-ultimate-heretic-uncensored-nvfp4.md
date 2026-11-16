# prithivMLmods/Qwen3.8-27B-Ultimate-Heretic-Uncensored-NVFP4

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored-NVFP4 es una cuantización NVFP4 de 4 bits del modelo DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, publicada por el usuario prithivMLmods. Se trata de una variante "abliterated" (eliminación de rechazos) del modelo base Qwen3.8-27B, afinada por DavidAU con sus marcos Turbo Brilliance V2 50X AGI y Heretic, y posteriormente comprimida a FP4 para su despliegue eficiente en hardware NVIDIA Blackwell.

El modelo conserva la arquitectura multimodal Qwen 3.5 (pipeline image-text-to-text) con 27.781.427.952 parámetros totales y un repositorio de 20,6 GB en cuatro shards de safetensors, más un módulo auxiliar de Multi-Token Prediction (MTP) de 849 MB para decodificación especulativa. La cuantización se realizó con GPTQModifier y esquema NVFP4, observador de pesos `imatrix_mse`, block size 128, preservando `lm_head` y los módulos visuales en precisión completa.

Su relevancia radica en ofrecer una huella de memoria reducida (apta para GPUs Blackwell como RTX Pro 6000, B200 y B300) manteniendo capacidades de razonamiento, instrucción, tool-use y visión del modelo original, junto con la eliminación de mecanismos de rechazo ("decensored"). La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen 3.5 (image-text-to-text) con MTP para decodificación especulativa |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (4 bits, GPTQ, block size 128, observador imatrix_mse); pesos base en FP4 con lm_head y visual en precisión completa |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards + model_mtp.safetensors), compressed-tensors |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, que a su vez deriva de Qwen/Qwen3.8-27B. La arquitectura subyacente es un transformer multimodal de tipo image-text-to-text (etiqueta `qwen3_5`), con un módulo visual preservado en precisión completa y un cabezal `lm_head` también sin cuantizar. Incorpora un módulo MTP (Multi-Token Prediction) que actúa como modelo auxiliar para decodificación especulativa, acelerando la generación en tensor cores FP4 de NVIDIA Blackwell.

La cuantización se realizó con `GPTQModifier` de llm-compressor bajo el esquema NVFP4, aplicado a capas `Linear` con exclusión de `lm_head` y módulos visuales, usando `imatrix_mse` como observador de pesos, `block_size: 128`, `dampening_frac: 0.01` y datos de calibración. El dataset de referencia indicado es HuggingFaceH4/ultrachat_200k. El modelo base DavidAU incorpora, según la model card, 27 modos de razonamiento, 27 modos de instrucción y más de 15 constructos de IA dinámicos, además de eliminación de rechazos ("refusal removal"). No se especifican el número de tokens de entrenamiento ni la composición detallada del dataset del afinado original.

## Capacidades

- Generación de texto y razonamiento multi-modo (27 modos de razonamiento declarados).
- Instrucción conversacional multi-modo (27 modos de instrucción declarados).
- Procesamiento de imagen y texto (pipeline image-text-to-text, módulos visuales preservados).
- Tool calling / function calling (etiqueta `tool-use`).
- Decodificación especulativa mediante MTP para acelerar la inferencia.
- Eliminación de rechazos ("uncensored", "abliterated", "decensored").
- Generación de código y tareas analíticas (declarado en la model card).
- Capacidades multilingües mencionadas en la descripción, aunque el campo `language` solo declara inglés.
- Compatibilidad con text-generation-inference y endpoints compatibles.

## Casos de uso

- Despliegue en GPUs Blackwell con memoria limitada: la cuantización NVFP4 reduce la huella a ~20,6 GB de pesos, permitiendo ejecutar un modelo de 27,8B parámetros en RTX Pro 6000, B200 o B300 con margen para caché KV.
- Generación de código asistida en pipelines de CI/CD: el soporte de tool-use y la eficiencia FP4 permiten integrarlo en flujos automatizados de revisión y generación de parches.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede extraer información de capturas, diagramas o formularios combinando visión y texto.
- Investigación sobre alineación y eliminación de rechazos: útil para estudiar el comportamiento de modelos "abliterated" frente a sus versiones originales.
- Asistentes conversacionales de dominio creativo: los múltiples modos de razonamiento e instrucción permiten adaptar el estilo y la profundidad de respuesta.
- Evaluación de cuantización FP4: sirve como referencia para medir la degradación de calidad de NVFP4 frente al modelo en BF16.
- Servicio de inferencia de alto throughput: el módulo MTP y los tensor cores FP4 favorecen la decodificación especulativa en entornos de producción con TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~20,6 GB de pesos en NVFP4, más caché KV y overhead del runtime; se recomienda al menos 24-32 GB de VRAM para contexto moderado.
- GPU recomendadas: NVIDIA RTX Pro 6000 Blackwell, B200, B300 (arquitecturas SM120/GB202 con soporte FP4 nativo).
- Compatibilidad con GPU de consumo: no confirmada; requiere soporte de tensor cores FP4 (Blackwell), por lo que las RTX 40xx/30xx no aprovecharían la cuantización NVFP4 de forma nativa.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (con soporte compressed-tensors/NVFP4), llm-compressor para recuantización.
- Latencia y throughput: no disponibles; la model card indica "high-throughput" y aceleración mediante MTP, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Ultimate-Heretic-Uncensored-NVFP4 (este) | 27,8B | no disponible | NVFP4 | Apache 2.0 | Hugging Face |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored (base) | 27,8B | no disponible | BF16/FP16 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (original) | 27B | no disponible | BF16/FP16 | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": la eliminación de rechazos puede producir contenido inapropiado, sesgado o dañino sin filtros; requiere moderación externa en producción.
- Riesgo elevado de alucinación, especialmente en dominios especializados y con modos de razonamiento agresivos.
- Idioma declarado únicamente inglés; el soporte multilingüe no está verificado en esta variante.
- La cuantización NVFP4 puede degradar la calidad frente al modelo en BF16, especialmente en tareas de precisión numérica o código.
- Requiere hardware Blackwell para aprovechar FP4; en GPUs sin soporte nativo el rendimiento puede ser deficiente.
- Longitud de contexto no documentada; no asumir ventanas largas sin verificar `config.json`.
- Aunque la licencia es Apache 2.0, el modelo base incorpora afinados de terceros (DavidAU) cuyos términos conviene revisar antes de uso comercial.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-27B-Ultimate-Heretic-Uncensored-NVFP4
- Modelo base afinado: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia Apache 2.0: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/apache-2.0.md
