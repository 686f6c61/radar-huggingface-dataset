# 12B-Suite/gemma-4-12B-it-QAT-SOMPOA-heresy

## Resumen

Este modelo es un fine-tune de `google/gemma-4-12B-it-qat-q4_0-unquantized`, la variante QAT (quantization-aware training) del modelo multimodal Gemma 4 de Google, producido mediante el motor de ablación **Heretic** de P-E-W con la técnica **SOMPOA** (Self-Organizing Maps & Magnitude-Preserving Orthogonal Ablation). El objetivo es eliminar los mecanismos de rechazo y censura del modelo original, reduciendo drásticamente las respuestas negativas (de 522/535 a 34/535 en el conjunto de prueba) mientras se mantiene una divergencia KL baja (0.0860), lo que indica que el comportamiento general del modelo se conserva.

El modelo conserva la arquitectura multimodal de Gemma 4 (entrada de texto e imagen, salida de texto) y sus aproximadamente 12 000 millones de parámetros. Está pensado para desarrolladores e investigadores que necesitan un modelo de lenguaje y visión sin restricciones de contenido para experimentación, generación creativa o estudio de la seguridad en IA. La licencia declarada es Apache 2.0, aunque el modelo base de Google tiene términos adicionales que deben revisarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language, any-to-any) |
| Parametros totales | 11 959 730 176 (~12B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene pesos en safetensors, probablemente bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso con capacidad multimodal (procesa imágenes y texto) y está entrenado con cuantización consciente (QAT) a 4 bits. El fine-tune se realizó mediante **abliteración** con el motor Heretic v1.4.0, que identifica direcciones en el espacio de activaciones asociadas a comportamientos de rechazo y las elimina mediante proyección ortogonal. En este caso se usó la variante SOMPOA, que emplea mapas autoorganizados para mejorar la selección de direcciones y preservar la magnitud de los pesos. El proceso se aplicó sobre un dataset propio del autor (no especificado), y se seleccionó el trial con mejor equilibrio entre reducción de rechazos (34/535) y baja divergencia KL (0.0860). No se dispone de información sobre los datos de entrenamiento del modelo base ni sobre el número de tokens.

## Capacidades

- Generación de texto y comprensión de imágenes (entrada multimodal, salida de texto).
- Razonamiento, codificación y matemáticas, heredadas del modelo Gemma 4 base.
- Respuestas sin censura: rechaza muy pocas solicitudes (34 de 535 en el conjunto de prueba), lo que permite tratar temas que el modelo original bloquearía.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Soporte de tool calling y agentes (depende de la configuración de inferencia, no confirmado específicamente en este fine-tune).
- Multilingüismo probable, aunque no se especifican idiomas concretos.

## Casos de uso

- **Generación creativa sin restricciones**: escribir ficción, poesía o guiones que aborden temas tabú o controvertidos sin que el modelo se niegue, gracias a la ablación de los mecanismos de rechazo.
- **Investigación en seguridad y alineación**: estudiar cómo se comporta un modelo sin capas de rechazo, comparar respuestas con el original y analizar riesgos de sesgo o toxicidad.
- **Análisis de contenido multimodal**: procesar imágenes con descripciones o preguntas que el modelo base podría rechazar (por ejemplo, contenido histórico sensible).
- **Desarrollo de asistentes de escritura especializados**: crear herramientas de apoyo para guionistas o autores que necesitan explorar narrativas oscuras o complejas sin filtros.
- **Evaluación de robustez**: probar la capacidad del modelo para mantener coherencia y calidad cuando se le piden respuestas en dominios delicados, comparando con el modelo original.
- **Prototipado de chatbots de rol**: construir personajes conversacionales que no tengan restricciones temáticas, adecuados para entornos de investigación o entretenimiento adulto.

## Benchmarks y rendimiento

La única métrica publicada es PIQA (Physical Interaction Question Answering), comparando el trial seleccionado (T005) con el modelo original. Los resultados son prácticamente idénticos, lo que sugiere que la ablación no degrada significativamente el rendimiento en esta tarea.

| Benchmark | Metrica | Modelo ablacionado (T005) | Modelo original |
|---|---|---|---|
| PIQA | acc | 0.5359 | 0.5359 |
| PIQA | acc_norm | 0.5152 | 0.5207 |

No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- El repositorio pesa 24.0 GB, lo que sugiere pesos en bf16 (12B × 2 bytes). Para inferencia en esta precisión se necesitan al menos 24 GB de VRAM.
- Con cuantización a 4 bits (GGUF o similar), el modelo puede caber en GPUs de 12 GB, como una RTX 3060/4070 o similar, según la guía de despliegue para el modelo QAT base.
- GPUs recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) para bf16; GPUs de 12-16 GB para versiones cuantizadas.
- Opciones de despliegue: vLLM (compatible con el checkpoint QAT), llama.cpp, Ollama, Hugging Face TGI.
- La guía de markaicode.com describe cómo ejecutar el modelo QAT en una GPU de 12 GB con vLLM, ajustando la longitud de contexto y usando cuantización compressed-tensors.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| 12B-Suite/gemma-4-12B-it-QAT-SOMPOA-heresy | ~12B | No disponible | Sí | Apache 2.0 | Ablacionado, sin rechazos |
| google/gemma-4-12B-it-qat-q4_0-unquantized | ~12B | No disponible | Sí | Gemma license | Modelo base, con rechazos |
| MuXodious/gemma-4-12B-it-QAT-SOMPOA-heresy | ~12B | No disponible | Sí | Apache 2.0 | Variante del mismo proceso de ablación, autor distinto |

No se dispone de comparativas con otros modelos ablacionados (por ejemplo, versiones "uncensored" de Llama o Mistral) en la información proporcionada.

## Limitaciones y advertencias

- **Contenido sin filtrar**: al eliminar los rechazos, el modelo puede generar texto ofensivo, violento, sexualmente explícito o peligroso. No debe usarse en aplicaciones orientadas al público general sin moderación adicional.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede inventar información, especialmente en temas delicados donde no tiene datos fiables.
- **Idiomas y contexto**: no se han publicado datos sobre la longitud de contexto soportada ni los idiomas exactos; se recomienda probar antes de usar en producción.
- **Licencia**: aunque el modelo card declara Apache 2.0, el modelo base de Google (Gemma) tiene términos de uso adicionales que pueden restringir ciertos usos comerciales. Es necesario revisar la licencia de Gemma 4.
- **Rendimiento no verificado**: solo se ha evaluado PIQA; no hay garantías de que el rendimiento en tareas complejas (razonamiento, código, visión) se mantenga tras la ablación.
- **Fecha de creación futura**: el modelo fue creado en agosto de 2026, lo que puede indicar que es un artefacto experimental o una versión de desarrollo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/12B-Suite/gemma-4-12B-it-QAT-SOMPOA-heresy)
- [Modelo base: google/gemma-4-12B-it-qat-q4_0-unquantized](https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized)
- [Repositorio de Heretic (motor de ablación)](https://github.com/p-e-w/heretic)
- [Pull request de SOMPOA en Heretic](https://github.com/p-e-w/heretic/pull/196)
- [Guía de despliegue del modelo QAT en GPU de 12 GB](https://markaicode.com/howto/gemma-4-setup-and-configuration-guide/)
- [Variante similar de otro autor](https://huggingface.co/MuXodious/gemma-4-12B-it-QAT-SOMPOA-heresy)
