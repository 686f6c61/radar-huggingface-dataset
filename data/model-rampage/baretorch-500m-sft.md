# model-rampage/BareTorch-500M-SFT

## Resumen

BareTorch-500M-SFT es un modelo de lenguaje de 593 millones de parámetros, desarrollado por el equipo de BareTorch (Martin Ignacio Kovacevic Buvinic), que constituye la versión afinada por instrucciones del modelo base BareTorch-500M-Base. El modelo está diseñado para ejecutarse sobre el framework BareTorch, una arquitectura "pure-GEMM" y "kernel-free" que promete aceleraciones significativas en inferencia de contexto largo y una huella de memoria reducida, orientada al despliegue en dispositivos edge (Apple Silicon, Qualcomm, ARM NPUs).

El ajuste por supervisión (SFT) se realizó sobre el dataset HuggingFaceTB/smol-smoltalk, con aproximadamente 485.000 muestras de diálogo multi-turno en formato ChatML, utilizando dos GPUs NVIDIA RTX 4090. Según los datos publicados, el modelo muestra mejoras sustanciales en tareas de razonamiento y sentido común respecto a su versión base, y su motor de inferencia alcanza velocidades de decodificación de hasta 164 tokens por segundo en una RTX 4090 con una ventana de contexto de 32.768 tokens, consumiendo solo 1,66 GB de memoria.

La relevancia de este modelo radica en su enfoque de eficiencia: al eliminar kernels personalizados y basarse únicamente en operaciones GEMM, BareTorch-500M-SFT puede ejecutarse en hardware de consumo y en dispositivos con recursos limitados, lo que lo convierte en una opción interesante para aplicaciones de IA en el borde. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida CS-LRAD (pure-GEMM, kernel-free) - no se especifican más detalles |
| Parametros totales | 593.051.328 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (según pruebas de inferencia publicadas) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BareTorch-500M-SFT se basa en el framework BareTorch, que emplea una arquitectura "pure-GEMM" y "kernel-free", es decir, todas las operaciones de mezcla de secuencias se implementan mediante multiplicaciones de matrices estándar, sin kernels personalizados. El mecanismo de mezcla se denomina CS-LRAD (no se detalla su funcionamiento interno en la documentación pública). Esta elección de diseño busca maximizar la compatibilidad con hardware heterogéneo (GPU, CPU, NPU) y reducir la latencia en inferencia de contexto largo.

El entrenamiento de SFT partió del checkpoint base BareTorch-500M-Base, preentrenado con 100 mil millones de tokens. El ajuste por instrucciones se realizó con el dataset HuggingFaceTB/smol-smoltalk, que contiene alrededor de 485.000 ejemplos de diálogo multi-turno. Se entrenó durante una época (2.759 pasos) con un tamaño de lote global de 64 secuencias (131.072 tokens por paso, con longitud de secuencia de 2048), una tasa de aprendizaje de 1e-5 y 100 pasos de calentamiento. La pérdida de evaluación descendió de 1,5631 (paso 250) a 1,4302 (paso final), lo que indica una convergencia estable.

No se menciona el uso de técnicas como RLHF o DPO; el ajuste es exclusivamente supervisado. Tampoco se detalla la composición exacta del dataset de preentrenamiento, aunque se indica que el modelo base fue entrenado con 100B tokens.

## Capacidades

- Generación de texto en inglés con formato de instrucciones ChatML, soportando conversaciones multi-turno.
- Razonamiento de sentido común y comprensión lectora, con mejoras notables en benchmarks como HellaSwag (52,52% de precisión normalizada) y ARC Easy (59,18%).
- Capacidad de seguir instrucciones y responder preguntas de conocimiento general, aunque con un rendimiento limitado en MMLU (25,57% de media).
- Inferencia eficiente en contexto largo (hasta 32.768 tokens) gracias al motor CS-LRAD, con velocidades de decodificación de 164,49 tok/s en RTX 4090 y 29,69 tok/s en Apple M1 (MLX).
- No se documenta soporte para tool calling, agentes, visión, audio ni modos de razonamiento explícitos.
- Multilingüismo: únicamente inglés; no se reportan capacidades en otros idiomas.

## Casos de uso

- Asistentes conversacionales en dispositivos edge: el modelo puede gestionar diálogos multi-turno con una ventana de contexto de 32.768 tokens, lo que permite mantener conversaciones largas sin perder el hilo. Su bajo consumo de memoria (1,66 GB en RTX 4090) lo hace viable en portátiles y mini-PCs.
- Chatbots de atención al cliente en inglés: gracias a su formato ChatML y su capacidad de seguir instrucciones, puede integrarse en sistemas de soporte automatizado para responder consultas frecuentes, derivar a agentes humanos o completar formularios.
- Generación de respuestas en aplicaciones de productividad: por ejemplo, redacción de correos, resúmenes de documentos o generación de borradores, aprovechando su capacidad de instrucción y su velocidad de inferencia en hardware de consumo.
- Prototipado rápido de aplicaciones de IA: al ser un modelo pequeño (0,6B) con licencia Apache 2.0, es adecuado para equipos que necesitan validar ideas sin incurrir en costes de API ni requisitos de hardware elevados.
- Despliegue en entornos con restricciones de memoria o energía: el framework BareTorch está diseñado para ejecutarse en NPUs de Qualcomm y ARM, por lo que el modelo puede integrarse en dispositivos móviles o IoT para tareas de generación de texto local.
- Evaluación de arquitecturas eficientes: para investigadores interesados en comparar el rendimiento de modelos "pure-GEMM" frente a transformers estándar, este modelo sirve como referencia empírica con datos de velocidad y memoria publicados.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de benchmarks comparativos entre el modelo base y la versión SFT, así como un desglose detallado. Se presentan a continuación.

| Benchmark | Métrica | Base (100B) | SFT Aligned | Ganancia |
|---|---|---|---|---|
| HellaSwag | Acc-Norm | 43,69% | 52,52% | +8,83% |
| ARC Easy | Acc-Norm | 53,58% | 59,18% | +5,60% |
| ARC Challenge | Acc-Norm | 28,92% | 35,41% | +6,49% |
| WinoGrande | Acc | 51,30% | 55,80% | +4,50% |
| MMLU (Overall) | Accuracy | 24,70% | 25,57% | +0,87% |

Desglose de MMLU en el modelo SFT:

| Subcategoría | Accuracy |
|---|---|
| STEM | 26,51% |
| Humanities | 25,80% |
| Social Sciences | 23,72% |
| Other | 26,10% |

Además, se reportan métricas de rendimiento de inferencia en contexto largo (32.768 tokens):

| Plataforma | Velocidad de decodificación | Memoria pico | Comparativa |
|---|---|---|---|
| NVIDIA RTX 4090 (CUDA) | 164,49 tok/s | 1.660 MB | 12,51x más rápido que Qwen3 0.6B |
| Apple M1 MBP (MLX) | 29,69 tok/s | 3.778 MB | 44,98x más rápido que SmolLM2 1.7B |

No se dispone de resultados en otros benchmarks como HumanEval, GSM8K o TruthfulQA.

## Requisitos de hardware

- VRAM estimada: según las pruebas publicadas, el modelo consume 1.660 MB en una RTX 4090 con contexto de 32.768 tokens, y 3.778 MB en Apple M1 (MLX). Para contextos más cortos, el consumo será menor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en cuantización FP16/BF16. Se ha validado en RTX 4090 (24 GB) y en Apple Silicon (M1).
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como RTX 3060, RTX 4060, RTX 4090, así como en MacBooks con chip M1 o superior.
- Opciones de despliegue: el framework BareTorch proporciona integración con Hugging Face Transformers (a través de `baretorch.integration`), y también se menciona soporte para MLX en Apple Silicon. No se documenta compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: en RTX 4090 se alcanzan 164,49 tok/s en decodificación con contexto largo; en Apple M1, 29,69 tok/s. No se especifican métricas de prefill.

## Comparativa con modelos similares

Se comparan dos modelos de tamaño similar mencionados en la documentación del autor, aunque no se dispone de sus parámetros exactos.

| Modelo | Parámetros | Contexto | HellaSwag | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BareTorch-500M-SFT | 593M | 32.768 | 52,52% | 25,57% | Apache 2.0 | Hugging Face |
| Qwen3 0.6B | ~0,6B (no confirmado) | No disponible | No disponible | No disponible | Apache 2.0 (presumible) | Hugging Face |
| SmolLM2 1.7B | 1,7B | No disponible | No disponible | No disponible | Apache 2.0 | Hugging Face |

La comparativa se basa únicamente en los datos de velocidad publicados por el autor, que indican que BareTorch es significativamente más rápido que ambos modelos en contexto largo. No se dispone de resultados de benchmarks de calidad para Qwen3 0.6B ni SmolLM2 1.7B en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no se recomienda su uso en otros idiomas sin un ajuste adicional.
- Con solo 593M de parámetros, su rendimiento en tareas complejas de razonamiento o conocimiento enciclopédico es limitado (MMLU 25,57%), muy por debajo de modelos más grandes.
- No se documenta soporte para tool calling, agentes ni capacidades multimodales; su uso se limita a generación de texto.
- La arquitectura CS-LRAD y el framework BareTorch son propietarios en su implementación comercial (según el sitio web), aunque el modelo en sí está bajo Apache 2.0. Esto puede generar dependencias de un runtime específico para producción.
- No se han publicado análisis de sesgos o alucinaciones; como todo modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en dominios especializados.
- La fecha de creación (agosto de 2026) y la ausencia de descargas o likes sugieren que el modelo es muy reciente y no ha sido ampliamente validado por la comunidad.
- Los benchmarks de velocidad se basan en pruebas del autor; no se han reproducido de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/model-rampage/BareTorch-500M-SFT
- Modelo base: https://huggingface.co/model-rampage/BareTorch-500M-Base
- Sitio web del proyecto BareTorch: https://www.model-rampage.com/
- Repositorio GitHub del framework: https://github.com/martin-kbcc/baretorch
- Artículo técnico citado: Kovacevic Buvinic, Martin Ignacio (2026). "BareTorch: Challenging State-of-The-Art Sequence Mixing Topologies via Kernel-Free, Pure GEMM-Compliant Architectures". BareTorch Framework Laboratory Technical Report.
