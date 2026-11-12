# mdeep14/whisper-tiny-minds14-en

## Resumen

whisper-tiny-minds14-en es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla openai/whisper-tiny sobre el conjunto de datos PolyAI/minds14, una colección de grabaciones de consultas telefónicas reales de un asistente bancario. Lo publica el usuario mdeep14 en Hugging Face y su propósito es especializar el modelo base en la transcripción de audio conversacional de dominio bancario en inglés, un registro muy distinto del audio de lectura o de podcast sobre el que se entrenó el Whisper original.

El modelo mantiene la arquitectura Transformer encoder-decoder de Whisper en su variante tiny, con 37.760.640 parámetros totales y pesos en formato safetensors. El repositorio ocupa aproximadamente 0,5 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las de la propia licencia.

Su relevancia es acotada pero clara: demuestra cómo un modelo de 37 millones de parámetros puede adaptarse a un dominio vertical concreto (atención telefónica bancaria) mediante un ajuste fino ligero de 300 pasos, alcanzando un WER de 0,3257 en el conjunto de evaluación. Es un punto de partida útil para quien necesite ASR de bajo coste en dominios similares, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny usa ventanas de audio de 30 s; el dato no se declara en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se declaran variantes GGUF u otras) |
| Idiomas soportados | no disponible (el nombre del modelo sugiere inglés, pero la model card no lo declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-tiny, un Transformer encoder-decoder con atención estándar diseñado para transcripción de audio. El ajuste fino se realizó con la librería Transformers (versión 5.22.1) y PyTorch 2.14.1+cu130, sobre el dataset PolyAI/minds14. Los hiperparámetros declarados son: learning rate de 1e-05, batch size de entrenamiento de 8 con acumulación de gradientes de 2 (batch efectivo de 16), optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 50 pasos de warmup, precisión mixta nativa (AMP) y semilla 42. El entrenamiento total fue de 300 pasos, distribuidos en 10,35 épocas.

La evolución registrada muestra una mejora progresiva del WER: 0,3590 en el paso 100, 0,3288 en el paso 200 y 0,3257 en el paso 300, mientras la pérdida de validación ascendía de 0,4647 a 0,5287. Este patrón (WER bajando mientras la loss de validación sube) sugiere un ajuste fino corto y posiblemente un cierto sobreajuste al final del entrenamiento. No se documentan innovaciones técnicas adicionales, decodificación especulativa ni etapas de RLHF o DPO; se trata de un fine-tuning supervisado convencional.

## Capacidades

- Reconocimiento automático del habla (ASR) en audio de dominio telefónico y bancario, especializado en el corpus PolyAI/minds14.
- Transcripción de audio en inglés conversacional según el nombre del modelo, aunque la model card no declara formalmente los idiomas soportados.
- Inferencia mediante la pipeline `automatic-speech-recognition` de Transformers.
- Compatibilidad con endpoints de Hugging Face (etiqueta `endpoints_compatible`).
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de salida ni modo thinking.
- No se declaran capacidades multilingües más allá de las heredadas del modelo base, que no se documentan en esta ficha.

## Casos de uso

- Transcripción de llamadas a centros de atención bancaria: el ajuste sobre minds14 hace que el modelo esté expuesto al vocabulario y la estructura de consultas telefónicas reales (saldos, transferencias, tarjetas), lo que lo hace más adecuado que el Whisper tiny genérico para este registro concreto.
- Enrutamiento automático de llamadas por intención: transcribir el audio del cliente y alimentar un clasificador posterior que dirija la llamada al departamento correcto, aprovechando el bajo coste computacional del modelo tiny.
- Generación de transcripciones para sistemas de analítica de contact center: procesar grandes volúmenes de grabaciones históricas en batch con un modelo de 37 M de parámetros que puede ejecutarse en CPU o GPU modesta.
- Prototipado rápido de pipelines ASR: servir como baseline ligero antes de invertir en modelos mayores, gracias a su tamaño reducido y a su licencia Apache 2.0.
- Subtitulado o transcripción en entornos con recursos limitados (dispositivos edge, contenedores pequeños) donde un Whisper large no es viable.
- Evaluación comparativa de técnicas de fine-tuning: el modelo documenta hiperparámetros y curva de entrenamiento, por lo que sirve como referencia reproducible para experimentos de adaptación de dominio en ASR.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Dataset | Valor |
|---|---|---|
| WER | PolyAI/minds14 | 0,3257 |
| Loss (validacion) | PolyAI/minds14 | 0,5287 |

Evolución durante el entrenamiento:

| Epoch | Step | Validation loss | WER |
|---|---|---|---|
| 3,4561 | 100 | 0,4647 | 0,3590 |
| 6,9123 | 200 | 0,5045 | 0,3288 |
| 10,3509 | 300 | 0,5287 | 0,3257 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni cifras de WER del modelo base openai/whisper-tiny sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 37,7 M de parámetros, más el overhead de activaciones y del procesador de audio; en la práctica, unos pocos cientos de MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; funciona holgadamente en RTX 3060, RTX 4090, A100 o H100, aunque el modelo no aprovecha la capacidad de estas últimas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU o CPU.
- Opciones de despliegue: pipeline de Transformers, Hugging Face Inference Endpoints, y potencialmente llama.cpp u Ollama si se generan pesos GGUF (no se distribuyen en el repositorio).
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (minds14) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-tiny-minds14-en | 37,7 M | no disponible | 0,3257 (declarado) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 39 M (aprox.) | ventanas de 30 s de audio | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74 M (aprox.) | ventanas de 30 s de audio | no disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de datos de WER del modelo base ni de alternativas sobre PolyAI/minds14 en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- El WER de 0,3257 es relativamente alto para producción; implica que aproximadamente una de cada tres palabras se transcribe incorrectamente en el conjunto de evaluación.
- El resultado no está verificado (`verified: false`) y procede del propio autor; conviene reproducirlo antes de confiar en él.
- La model card está generada automáticamente y contiene secciones sin completar ("More information needed"); no hay documentación sobre sesgos, composición del dataset ni usos previstos.
- El ajuste fino es muy corto (300 pasos, 10,35 épocas) y la loss de validación aumenta en la última fase, lo que apunta a sobreajuste y a un margen de mejora con regularización o parada temprana.
- El dominio es muy específico (consultas bancarias telefónicas de minds14); el rendimiento fuera de ese dominio no está caracterizado y probablemente degrade.
- No se declaran idiomas soportados; asumir multilingüismo sería un error.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe cumplir las obligaciones de atribución y las condiciones de la licencia del modelo base.
- No se publican datos de latencia, throughput ni consumo de memoria, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdeep14/whisper-tiny-minds14-en
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset: https://huggingface.co/datasets/PolyAI/minds14
