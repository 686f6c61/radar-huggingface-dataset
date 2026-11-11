# magnitudedev/GLM-5.3-Flash-GGUF

## Resumen

GLM-5.3-Flash es un modelo multimodal (image-text-to-text) de arquitectura MoE desarrollado por Z.ai (zai-org), distribuido bajo licencia MIT. Esta ficha cubre la conversión a GGUF publicada por magnitudedev para su runtime Magnitude, que ofrece dos variantes: FP8 (el checkpoint original de Z.ai tal como se entrenó) y NVFP4 (la versión de 4 bits de NVIDIA, destilada con quantization-aware distillation). El modelo base cuenta con 320.778.593.630 parámetros totales y un repositorio de 514,5 GB en formato GGUF.

La relevancia de esta publicación es doble. Por un lado, pone a disposición un modelo MoE de gran escala con capacidades de visión en un formato optimizado para despliegue. Por otro, introduce una innovación en el empaquetado: ambas variantes conservan los tensores de escala separados tal como los publicaron sus autores, algo que llama.cpp no soporta, y que evita el redondeo o la duplicación de tamaño que imponen las conversiones convencionales (BF16, Q8_0, Q4_K).

El modelo incluye la capa MTP (multi-token prediction) como último bloque para decodificación especulativa, y cada variante se convierte desde su fuente y se verifica byte a byte contra ella. La licencia MIT de los checkpoints de origen se mantiene en esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), transformer multimodal con torre de visión; incluye capa MTP para decodificación especulativa |
| Parametros totales | 320.778.593.630 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (F8_E4M3 con escalas F32 por tile de 128x128) y NVFP4 (4 bits con escalas de bloque y de tensor); resto de tensores en BF16 y F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards: 7 para FP8, 4 para NVFP4; proyectores de visión mmproj en GGUF) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con torre de visión, orientado a tareas image-text-to-text. La versión NVFP4 fue entrenada por NVIDIA con quantization-aware distillation para mantener la precisión del modelo a 4 bits, reduciendo el tamaño al 57% del FP8 (185,8 GB frente a 327,2 GB). La variante FP8 corresponde a la publicación de Z.ai sin modificaciones, es decir, el modelo exactamente como se entrenó.

La conversión de magnitudedev preserva los tensores de escala separados de los checkpoints originales: en FP8, las proyecciones y los expertos enrutados almacenan códigos F8_E4M3 con una escala F32 por tile de 128x128 (el `weight_scale_inv` de Z.ai), mientras que el resto de tensores, incluida la cabeza de salida, quedan en BF16 y F32. En NVFP4 se conservan los códigos de 4 bits de NVIDIA con sus escalas de bloque y tensor, y los tensores que NVIDIA mantuvo a 8 bits permanecen en sus formas de 8 bits con sus escalas. Los nombres de tensores y los metadatos siguen el conversor `glm5-next` de llama.cpp v0.9.0. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento general.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text) mediante el proyector de visión incluido.
- Decodificación especulativa mediante la capa MTP integrada como último bloque del modelo.
- Cuantización de precisión controlada: FP8 sin pérdida respecto al original y NVFP4 con precisión preservada por destilación.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo MoE multimodal de gran escala en infraestructura propia: la variante NVFP4 reduce el peso a 185,8 GB, lo que permite servir el modelo en nodos con menos memoria que los necesarios para el FP8 de 327,2 GB, manteniendo la precisión gracias a la destilación de NVIDIA.
- Análisis de documentos con imagen y texto: el proyector de visión (`mmproj-BF16.gguf` o `mmproj-NVFP4.gguf`) permite pasar imágenes junto con instrucciones de texto para extracción de información, descripción o respuesta a preguntas sobre el contenido visual.
- Evaluación de precisión de cuantizaciones: al conservar los tensores de escala originales y verificar byte a byte contra la fuente, estos GGUF sirven como referencia para medir la degradación real de FP8 y NVFP4 frente a los checkpoints de Z.ai y NVIDIA.
- Generación de texto a gran escala con decodificación especulativa: la capa MTP incluida acelera la inferencia en el runtime Magnitude, útil para cargas de generación de alto throughput.
- Investigación en cuantización: la comparación directa entre las variantes FP8 y NVFP4 del mismo modelo permite estudiar el impacto de 4 bits con escalas de bloque en tareas multimodales.
- Integración en pipelines conversacionales con entrada de imagen: el tag `conversational` y la compatibilidad con endpoints facilitan su uso como servicio de chat multimodal en aplicaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 327,2 GB para la variante FP8 y 185,8 GB para NVFP4, correspondientes al tamaño de los pesos; el overhead de contexto y del proyector de visión se suma aparte.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, FP8 requiere múltiples aceleradores de 80 GB (A100/H100) o equivalentes; NVFP4 requiere al menos tres GPU de 80 GB o configuraciones con mayor memoria por dispositivo.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en ninguna de las dos variantes.
- Opciones de despliegue: runtime Magnitude apuntando al primer shard de la variante y a su proyector para entrada de imagen. llama.cpp no puede cargar estos ficheros porque no soporta tensores de escala separados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash (esta ficha, GGUF de magnitudedev) | 320.778.593.630 | no disponible | GGUF FP8 / NVFP4 con escalas separadas | MIT | Solo runtime Magnitude; verificado byte a byte |
| GLM-5.3-Flash (zai-org, original) | 320.778.593.630 | no disponible | safetensors FP8 | MIT | Checkpoint de referencia de Z.ai |
| GLM-5.3-Flash-FP4-Local (nvidia) | no disponible | no disponible | FP4 (NVFP4) | no disponible | Versión de 4 bits con quantization-aware distillation |
| Conversiones GGUF de llama.cpp del mismo modelo | 320.778.593.630 | no disponible | GGUF BF16 / Q8_0 / Q4_K | MIT | BF16 duplica el tamaño y no es exacto; Q8_0/Q4_K redondean los pesos |

## Limitaciones y advertencias

- Incompatibilidad con llama.cpp: los ficheros no se pueden cargar en llama.cpp ni en herramientas derivadas (Ollama, etc.) porque conservan tensores de escala separados que ese runtime no soporta.
- Dependencia del runtime Magnitude: el uso previsto requiere apuntar Magnitude al primer shard de la variante y a su proyector correspondiente.
- Requisitos de memoria muy elevados: 185,8 GB en NVFP4 y 327,2 GB en FP8, lo que excluye el despliegue en hardware de consumo.
- Idiomas soportados no documentados: no hay información sobre cobertura lingüística en la model card.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplica el riesgo habitual de los modelos generativos.
- Restricciones de licencia: MIT, igual que los checkpoints de origen, sin restricciones comerciales adicionales indicadas.
- Caveats de producción: el número de descargas (24) y de likes (0) indica una adopción muy temprana; conviene validar la conversión contra los checkpoints originales antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/magnitudedev/GLM-5.3-Flash-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Checkpoint FP8 de referencia (commit): https://huggingface.co/zai-org/GLM-5.3-Flash/tree/46a050bec13002ad29ee795c16e61cf4fa3c4a9c
- Versión NVFP4 de NVIDIA: https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
- Commit NVFP4 de referencia: https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local/tree/76348ddb2be2e35e39ecfc00e75dc07703f4f3d5
- Runtime Magnitude: https://magnitude.dev
- Conversor `glm5-next` de llama.cpp (v0.9.0): https://github.com/ggml-org/llama.cpp/releases/tag/v0.9.0
