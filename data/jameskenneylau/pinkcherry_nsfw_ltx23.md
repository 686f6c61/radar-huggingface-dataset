# jameskenneylau/PinkCherry_NSFW_LTX23

## Resumen

SexGod PinkCherry v1.8 es un checkpoint de generación de vídeo, fine-tuneado sobre el modelo base LTX 2.3 de Lightricks. Desarrollado por el usuario jameskenneylau, este modelo está específicamente orientado a contenido NSFW y NFAA (Not For All Audiences), eliminando los filtros de seguridad del modelo original. Soporta tanto generación de texto a vídeo (T2V) como de imagen a vídeo (I2V).

El modelo es relevante en el ecosistema open source por ser una de las primeras adaptaciones de LTX 2.3 (una arquitectura de vídeo de ~22B parámetros) liberada bajo licencia Apache 2.0, con un amplio abanico de formatos de pesos disponibles: GGUF, fp8_scaled, bf16 e int8. El repositorio ocupa 600.8 GB, lo que indica la inclusión de todas las variantes cuantizadas y vídeos de ejemplo. La arquitectura exacta no se detalla en la model card, pero al derivar de LTX 2.3, se trata de un modelo de difusión basado en transformer para vídeo.

La relevancia actual radica en su uso para investigar técnicas de "uncensoring" en modelos de vídeo y para aplicaciones creativas que requieren contenido sin restricciones, aunque su adopción es mínima (0 descargas y 0 likes en el momento de la consulta), lo que sugiere un proyecto personal o en fase muy temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LTX 2.3 (difusión de vídeo, transformer, fine-tune) |
| Parametros totales | 21.005.004.544 (~21B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del número de frames y resolución) |
| Tipos de cuantizacion | GGUF, fp8_scaled, bf16, int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint), GGUF, fp8, bf16, int8 |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint base LTX 2.3 de Lightricks, una arquitectura de generación de vídeo por difusión que utiliza un transformer latente. Al ser un checkpoint (no un LoRA), los pesos completos del modelo han sido ajustados. La model card indica que soporta tanto T2V como I2V, lo que implica que el fine-tune ha preservado ambas capacidades del modelo base.

El autor menciona la disponibilidad de un LoRA destilado (ltx-2.3-22b-distilled-lora-384-1.1.safetensors) procedente de Lightricks, que puede aplicarse para acelerar la inferencia (probablemente reduciendo pasos de muestreo). También hace referencia a un "text encoder uncensored" basado en Gemma-3-12b, aunque el enlace proporcionado apunta al mismo archivo del LoRA destilado, lo que sugiere un error en la documentación del autor. Los datos de entrenamiento, el número de tokens o el proceso de alineación (RLHF/DPO) no han sido publicados.

La versión 1.8 introduce un flujo de trabajo actualizado con soporte para prompts negativos de vídeo y audio, lo que indica que el modelo también puede generar audio sincronizado (o al menos que el pipeline lo contempla).

## Capacidades

- Generación de vídeo a partir de texto (T2V).
- Generación de vídeo a partir de imagen de referencia (I2V).
- Generación de contenido NSFW/NFAA sin filtros de seguridad, gracias al fine-tune sobre el modelo base.
- Soporte de prompts negativos tanto para la pista de vídeo como para la de audio en la versión 1.8.
- Compatibilidad con LoRA destilado para acelerar la inferencia (menos pasos de muestreo).
- Disponibilidad en múltiples formatos de cuantización (GGUF, fp8, int8, bf16) para adaptarse a distintos hardwares.
- No disponible: tool calling, razonamiento multi-step, capacidades de agente, ni procesamiento de lenguaje puro (es exclusivamente un modelo generativo de vídeo).

## Casos de uso

- Prototipado de storyboards para producción audiovisual: un director puede generar secuencias de vídeo de alta fidelidad a partir de descripciones textuales para previsualizar escenas complejas antes de rodar, aprovechando la capacidad T2V y la ventana de frames que permite LTX 2.3.
- Investigación en alineación y seguridad de modelos: este checkpoint sirve como caso de estudio para analizar cómo los fine-tunes eliminan los mecanismos de rechazo de contenido dañino, permitiendo a investigadores en seguridad de IA estudiar técnicas de "jailbreak" y sus mitigaciones en modelos de vídeo.
- Generación de metraje sintético para VFX: los artistas de efectos visuales pueden usar I2V para animar fotografías o concept arts, generando secuencias de movimiento de referencia que luego se integran en pipelines de composición.
- Evaluación de cuantizaciones en modelos de vídeo: al ofrecer pesos en GGUF, fp8_scaled, bf16 e int8, los ingenieros de ML pueden comparar la degradación de calidad y la mejora de latencia entre formatos en GPUs de consumo (24 GB) frente a GPUs de datacenter (80 GB).
- Desarrollo de flujos de trabajo en ComfyUI: el autor proporciona workflows específicos (incluida la versión 1.8 con prompts negativos de audio/vídeo), lo que permite a la comunidad integrar el modelo en pipelines node-based para generación interactiva y batch processing.
- Creación de contenido para entornos de realidad virtual: generación de clips inmersivos de temática adulta para experiencias VR personalizadas, donde la ausencia de censura es un requisito funcional y la calidad del movimiento (gracias a LTX 2.3) es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas objetivas (FVD, CLIP score, etc.) proporcionadas por el autor, y al ser un modelo derivado de LTX 2.3, el rendimiento base es el del modelo original, pero sin datos cuantitativos verificables para este fine-tune específico.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - bf16: ~42 GB (necesario para calidad máxima).
  - fp8_scaled: ~21 GB (viable en GPUs de 24 GB).
  - int8: ~21 GB (similar a fp8).
  - GGUF (cuantización 4-bit): ~11-12 GB (viable en GPUs de 16 GB, aunque con pérdida de calidad).
- GPU recomendadas:
  - Para bf16: A100 80GB, H100 80GB o RTX A6000 48GB.
  - Para fp8/int8: RTX 4090 (24 GB) o RTX 3090 (24 GB).
  - Para GGUF 4-bit: RTX 4080 (16 GB) o RTX 3080 (12 GB).
- El tamaño del repositorio (600.8 GB) implica que la descarga de todas las variantes es inviable para la mayoría de usuarios; se recomienda descargar solo el formato necesario.
- Opciones de despliegue: el autor menciona workflows, lo que sugiere compatibilidad con ComfyUI. Dado que es un modelo de vídeo, no aplica llama.cpp ni vLLM directamente, aunque el formato GGUF puede cargarse con herramientas que soporten ese formato para modelos de difusión (por ejemplo, a través de backends específicos en ComfyUI). También es posible usar Diffusers si se adapta el checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Enfoque | Cuantizaciones | Notas |
|---|---|---|---|---|---|
| PinkCherry NSFW LTX23 (este) | ~21B | Apache-2.0 | Vídeo T2V/I2V, NSFW | GGUF, fp8, int8, bf16 | Fine-tune de LTX 2.3 sin filtros |
| LTX 2.3 (base, Lightricks) | ~22B | Apache-2.0 | Vídeo T2V/I2V, censurado | fp8, bf16 | Modelo original, con alineación de seguridad |
| HunyuanVideo (Tencent) | 13B | Apache-2.0 | Vídeo T2V | fp8, bf16 | Modelo de referencia en generación de vídeo, pero con menor resolución y sin soporte I2V nativo |
| Wan 2.1 (Alibaba) | 13B | Apache-2.0 | Vídeo T2V/I2V | GGUF, fp8, bf16 | Alternativa popular, pero con menor calidad de movimiento que LTX 2.3 |

La principal diferencia frente a la base LTX 2.3 es la eliminación de los filtros de contenido NSFW. Frente a HunyuanVideo o Wan 2.1, ofrece un mayor número de parámetros y la capacidad I2V, aunque su mantenimiento y soporte comunitario son prácticamente nulos (0 descargas).

## Limitaciones y advertencias

- Contenido NSFW/NFAA: el modelo genera contenido explícito para adultos. No es apto para menores y su uso puede violar los términos de servicio de plataformas de hosting o distribución.
- Sesgos desconocidos: al no publicarse los datos de entrenamiento del fine-tune, no es posible evaluar sesgos demográficos, culturales o de representación en el contenido generado.
- Riesgo de alucinaciones visuales: como todo modelo de difusión de vídeo, puede producir artefactos, deformaciones anatómicas o inconsistencias temporales, especialmente en escenas complejas o con múltiples sujetos.
- Error en la documentación: el enlace al "text encoder uncensored" (Gemma-3-12b) apunta al mismo archivo que el LoRA destilado, lo que indica una errata del autor y dificulta la reproducibilidad exacta del pipeline.
- Tamaño del repositorio: 600.8 GB, lo que implica un coste de almacenamiento y ancho de banda significativo. La descarga parcial es posible, pero la fragmentación puede causar incompatibilidades entre formatos.
- Falta de soporte: con 0 descargas y 0 likes, el proyecto no tiene comunidad activa ni mantenimiento garantizado. Es probable que el autor abandone el desarrollo o no responda a issues.
- Licencia Apache-2.0: aunque permite uso comercial, la naturaleza del contenido generado puede estar sujeta a legislación local sobre pornografía o material explícito, y el usuario final asume toda la responsabilidad legal.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/jameskenneylau/PinkCherry_NSFW_LTX23
- LoRA destilado de LTX 2.3 (referenciado en la model card): https://huggingface.co/Lightricks/LTX-2.3/blob/main/ltx-2.3-22b-distilled-lora-384-1.1.safetensors
- Nota: el enlace al "text encoder uncensored" en la model card apunta al mismo LoRA destilado, lo que parece un error del autor. No se proporcionan enlaces a papers, blogs o demos adicionales.
