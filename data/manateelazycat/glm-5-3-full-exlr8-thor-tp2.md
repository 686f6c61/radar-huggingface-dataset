# manateelazycat/GLM-5.3-Full-EXLR8-Thor-TP2

## Resumen

GLM-5.3-Full-EXLR8-Thor-TP2 es una representación redistribuida del checkpoint principal de kindlingai/glm-5.3-exlr8-k2-k3-k4, publicada por el usuario manateelazycat para su uso con un cargador TP2 (tensor parallelism de 2 vías) probado sobre dos unidades de Jetson AGX Thor. No se trata de un modelo nuevo ni de un fine-tune: el autor conserva los pesos originales, el manifiesto de cuantización, el tokenizer, las 78 capas principales y todos los expertos enrutados del checkpoint fuente, y los representa mediante rangos exactos de bytes del fichero original.

El paquete está orientado a despliegue en hardware edge de NVIDIA (dos Jetson AGX Thor), con una cuantización denominada EXLR8 y una variante de decodificación especulativa apoyada en un modelo auxiliar separado, DFlash2, atribuido a incoai/GLM-5.3-DFlash2 en la revisión 8f02251dc71a9da2053dfc15bfa293fbee5579b0. El runtime probado utiliza tres propuestas de verificación, y el autor aclara explícitamente que las propuestas del modelo auxiliar nunca se reportan como tokens de salida aceptados.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue derivado, no de una release del modelo base GLM-5.3, y la información pública disponible se limita a la model card y a los metadatos de Hugging Face. No hay datos de benchmarks, composición del dataset, número de parámetros ni longitud de contexto en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el checkpoint fuente conserva 78 capas principales y expertos enrutados, lo que sugiere una arquitectura MoE, pero no se confirma en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXLR8 (cuantización propietaria del checkpoint fuente; no se detallan esquemas adicionales) |
| Idiomas soportados | no disponible |
| Licencia | glm-5.3 (license_name: glm-5.3; license_link a kindlingai/glm-5.3-exlr8-k2-k3-k4) |
| Formato de pesos | no disponible (repo de 19,7 GB; el autor describe rangos de bytes exactos del checkpoint fuente y un manifiesto de cuantización, sin confirmar safetensors ni GGUF) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. La model card del artefacto indica que se conservan los pesos originales, el manifiesto de cuantización, el tokenizer, las 78 capas principales y todos los expertos enrutados del checkpoint kindlingai/glm-5.3-exlr8-k2-k3-k4 (revisión a36ae4680871ffa6412061d5daf66c4d4ad5802c). La mención a expertos enrutados es coherente con un diseño de mezcla de expertos (MoE), pero no se especifican dimensiones, número de expertos activos, tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La innovación técnica declarada en este artefacto es de despliegue, no de entrenamiento: un cargador TP2 probado para dos Jetson AGX Thor, representación por rangos de bytes exactos del checkpoint fuente y un flujo de decodificación especulativa con el modelo auxiliar DFlash2 (incoai/GLM-5.3-DFlash2, revisión 8f02251dc71a9da2053dfc15bfa293fbee5579b0). El runtime probado emplea tres propuestas de verificación y el autor subraya que las propuestas del auxiliar no se contabilizan como tokens aceptados. El artefacto no es GLM-5.3-Flash.

## Capacidades

- Generación de texto: no hay descripción de capacidades en la información disponible más allá de la operación del checkpoint.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: decodificación especulativa con modelo auxiliar DFlash2 (tres propuestas de verificación); cuantización EXLR8; despliegue en TP2 sobre dos Jetson AGX Thor.

## Casos de uso

- Despliegue edge en dos Jetson AGX Thor: el artefacto está empaquetado específicamente para un cargador TP2 probado en este hardware, lo que lo hace adecuado para entornos con restricciones de consumo y espacio donde no se dispone de GPUs de centro de datos.
- Inferencia con decodificación especulativa: el flujo con DFlash2 y tres propuestas de verificación permite acelerar la generación en el runtime probado, siempre que se respete la regla de no contabilizar propuestas auxiliares como tokens aceptados.
- Reproducibilidad de un checkpoint concreto: al representar el checkpoint fuente por rangos de bytes exactos, facilita la verificación de integridad y la auditoría de pesos en pipelines internos.
- Investigación sobre cuantización EXLR8: permite estudiar el comportamiento de esta cuantización en hardware edge comparándolo con el checkpoint original sin cuantizar.
- Prototipado de asistentes conversacionales en edge: si el modelo base soporta generación de texto multi-turno, este artefacto permitiría validar latencia y calidad en Thor antes de escalar a producción; las capacidades concretas del base no están documentadas en la información disponible.
- Evaluación de decodificación especulativa: útil para medir la tasa de aceptación de propuestas y el impacto en throughput en un entorno TP2 real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que esta release no reclama 30 tokens de salida por segundo, por lo que no debe asumirse esa cifra de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 19,7 GB y el despliegue objetivo son dos Jetson AGX Thor con memoria unificada.
- GPU recomendadas: dos NVIDIA Jetson AGX Thor (configuración TP2 probada). No se documenta soporte para A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? No disponible; el artefacto está diseñado para Jetson AGX Thor, no para GPUs de escritorio.
- Opciones de despliegue: cargador TP2 del autor; no se confirman vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no reclama 30 tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Full-EXLR8-Thor-TP2 (este artefacto) | no disponible | no disponible | sin benchmarks publicados | glm-5.3 | Hugging Face, 0 descargas |
| kindlingai/glm-5.3-exlr8-k2-k3-k4 (checkpoint fuente) | no disponible | no disponible | no disponible | glm-5.3 | Hugging Face |
| incoai/GLM-5.3-DFlash2 (auxiliar de decodificación especulativa) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| GLM-5.3-Flash | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones de calidad publicadas para este artefacto.
- Limitaciones de contexto o idioma: no disponibles; los idiomas soportados no se especifican.
- Restricciones de licencia: licencia "other" con license_name glm-5.3; es imprescindible revisar el enlace de licencia del checkpoint fuente antes de cualquier uso comercial.
- El artefacto no es GLM-5.3-Flash y no debe confundirse con él.
- No se reclama un throughput de 30 tokens/s; cualquier expectativa de rendimiento debe validarse en el hardware objetivo.
- Las propuestas del modelo auxiliar DFlash2 no son tokens de salida aceptados; los pipelines que las contabilicen obtendrán métricas incorrectas.
- El repo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-14); no hay evidencia de uso en producción ni validación comunitaria.
- No se confirma el formato de pesos ni el pipeline de Hugging Face, lo que complica la integración con herramientas estándar.

## Enlaces

- Hugging Face del artefacto: https://huggingface.co/manateelazycat/GLM-5.3-Full-EXLR8-Thor-TP2
- Checkpoint fuente: https://huggingface.co/kindlingai/glm-5.3-exlr8-k2-k3-k4
- Revisión del checkpoint fuente: https://huggingface.co/kindlingai/glm-5.3-exlr8-k2-k3-k4/blob/a36ae4680871ffa6412061d5daf66c4d4ad5802c/LICENSE
- Modelo auxiliar DFlash2: https://huggingface.co/incoai/GLM-5.3-DFlash2
- Revisión del auxiliar: 8f02251dc71a9da2053dfc15bfa293fbee5579b0
