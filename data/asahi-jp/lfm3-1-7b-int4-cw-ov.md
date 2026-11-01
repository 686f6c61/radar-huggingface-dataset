# asahi-jp/LFM3-1.7B-int4-cw-ov

## Resumen

LFM3-1.7B-int4-cw-ov es una versión cuantizada a INT4 del modelo LiquidAI/LFM3-1.7B, publicada por el usuario asahi-jp. No se trata de un modelo entrenado desde cero, sino de una conversión a formato OpenVINO IR realizada con Optimum-Intel y NNCF, pensada para inferencia eficiente en hardware Intel (CPU, iGPU y NPU). El modelo base pertenece a la familia LFM3 de Liquid AI, una arquitectura híbrida que combina capas de convolución corta con atención por ventanas deslizantes y atención completa, y que incorpora un modo de razonamiento ("thinking") opcional.

La relevancia de esta ficha reside en que ofrece una vía práctica de desplegar un modelo de 1.700 millones de parámetros con un peso de repositorio de solo 1,03 GB, manteniendo el esquema de caché híbrido del modelo original (13 estados de convolución corta y 22 cachés key/value). La cuantización es weight-only, asimétrica y por canal (group_size=-1), con 153 de 169 capas de pesos en INT4, 14 en INT8 y 2 en coma flotante.

Conviene subrayar que esta es una publicación de terceros con 30 descargas y 0 likes en el momento de la consulta; la información sobre el modelo base (idiomas, contexto, datos de entrenamiento y benchmarks) no está incluida en la documentación proporcionada y se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (convolución corta + atención deslizante + atención completa), según el modelo base LFM3 |
| Parametros totales | 1,7 mil millones (heredados del modelo base LFM3-1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 weight-only asimétrica por canal (INT4_ASYM, group_size=-1); 153 capas INT4, 14 INT8, 2 en coma flotante |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | OpenVINO IR (openvino_model.xml / openvino_model.bin) + tokenizer OpenVINO |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea una arquitectura híbrida en la que conviven capas de convolución corta con compuerta y capas de atención, estas últimas divididas entre atención deslizante y atención completa. Esta conversión conserva esa estructura: mantiene una caché híbrida compuesta por 13 estados de convolución corta y 22 cachés key/value (5 de atención deslizante y 6 de atención completa), y soporta tanto prefill como decodificación incremental. El modelo incluye además un modo de razonamiento opcional, activable o desactivable mediante la plantilla de chat (`enable_thinking`).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La cuantización se realizó con Optimum-Intel y NNCF sobre el IR FP16 de OpenVINO, con un esquema weight-only que no recalibra activaciones. La model card reporta una evaluación de calidad frente al IR FP16: coseno de logits de 0,9171, 100 % de coincidencia top-1 y 60 % de solapamiento top-5 para la variante INT4 por canal, frente a 0,9982 / 100 % / 100 % de la variante INT8.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones mediante plantilla de chat.
- Modo de razonamiento opcional ("thinking") que puede activarse o desactivarse en la plantilla.
- Inferencia con prefill e decodificación incremental gracias a la caché híbrida conservada.
- Ejecución en hardware Intel mediante OpenVINO (CPU, iGPU, NPU).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión o audio: no disponible (el pipeline es text-generation).

## Casos de uso

- Asistente conversacional local en equipos con CPU Intel: el modelo puede ejecutarse con OpenVINO sin GPU dedicada, lo que lo hace adecuado para prototipos de chat en portátiles y mini-PC con un consumo de memoria en torno a 1 GB de pesos.
- Despliegue en el borde (edge computing): su tamaño reducido tras la cuantización INT4 permite integrarlo en dispositivos con recursos limitados donde un modelo de 1,7 B en FP16 no cabría con holgura.
- Clasificación y resumen de textos cortos: tareas de procesamiento de lenguaje natural que no requieren contexto largo ni razonamiento complejo, aprovechando la latencia baja de la variante INT4.
- Generación de respuestas en asistentes de documentación técnica: con el modo thinking desactivado se obtienen respuestas directas y de bajo coste computacional para preguntas factuales.
- Evaluación comparativa de cuantizaciones: sirve como referencia práctica para medir la degradación de un modelo híbrido al pasar de FP16 a INT4 por canal en OpenVINO.
- Pruebas de integración en pipelines de Optimum-Intel: útil para validar builds recientes de Optimum-Intel con soporte LFM3 y `trust_remote_code=True` antes de adoptar el modelo en producción.

## Benchmarks y rendimiento

La model card solo publica métricas de fidelidad de la cuantización frente al IR FP16, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K, etc.).

| Variante | Coseno de logits vs FP16 | Coincidencia top-1 | Solapamiento top-5 |
|---|---|---|---|
| INT8 | 0,9982 | 100 % | 100 % |
| INT4 group 64 | 0,9622 | 100 % | 80 % |
| INT4 channelwise | 0,9171 | 100 % | 60 % |
| NF4 channelwise | 0,8620 | 0 % | 80 % |

Las cuatro variantes responden correctamente a la pregunta factual corta "The capital of France is Paris". El autor recomienda INT8 o INT4 group 64 cuando la precisión sea crítica. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio pesa 1,03 GB, por lo que la inferencia cabe holgadamente en menos de 2 GB de memoria para los pesos; el consumo real depende del runtime OpenVINO y de la longitud de contexto.
- GPU recomendadas: al ser un IR de OpenVINO, el objetivo principal es CPU Intel, iGPU Intel y NPU Intel; no se documenta soporte para GPU NVIDIA.
- Cabe en GPU de consumo: sí, en términos de memoria, aunque el formato OpenVINO está orientado a hardware Intel más que a tarjetas gráficas de consumo convencionales.
- Opciones de despliegue: OpenVINO Runtime con `OVModelForCausalLM` de Optimum-Intel; requiere `trust_remote_code=True` y una build reciente de Optimum-Intel con soporte LFM3 (probado con 2.3.0.dev0+a68683c, OpenVINO 2026.4.1, NNCF 3.3.0 y transformers 5.15.0).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asahi-jp/LFM3-1.7B-int4-cw-ov | 1,7 B | no disponible | OpenVINO IR INT4 | LFM Open License v1.0 | HuggingFace (30 descargas) |
| LiquidAI/LFM3-1.7B (base) | 1,7 B | no disponible | safetensors (FP16/BF16) | LFM Open License v1.0 | HuggingFace (oficial) |
| Variante INT8 del mismo autor | 1,7 B | no disponible | OpenVINO IR INT8 | LFM Open License v1.0 | Referenciada en la model card |

No se dispone de datos de rendimiento de tareas para comparar con alternativas de otros fabricantes; la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Publicación de terceros (asahi-jp), no oficial de Liquid AI; no hay garantía de mantenimiento ni de soporte.
- La cuantización INT4 por canal degrada la fidelidad frente a FP16 (coseno 0,9171, solapamiento top-5 del 60 %), por lo que puede afectar a tareas sensibles a la precisión.
- Requiere una build reciente de Optimum-Intel con soporte LFM3 y `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio.
- Idiomas soportados, longitud de contexto y sesgos del modelo base no están documentados en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos de este tamaño; no se han publicado evaluaciones específicas.
- La licencia LFM Open License v1.0 puede imponer restricciones al uso comercial; debe revisarse el texto completo antes de desplegar en producción.
- No se documenta soporte de tool calling, agentes ni multimodalidad; no debe asumirse su disponibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/asahi-jp/LFM3-1.7B-int4-cw-ov
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Optimum-Intel: https://github.com/huggingface/optimum-intel
