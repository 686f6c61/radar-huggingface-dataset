# Joyjeetsingh/rwm-reproduction

## Resumen

Este repositorio contiene una reproducción independiente del modelo de dinámica propioceptiva del *Robotic World Model* (RWM) de Li, Krause & Hutter (arXiv:2501.10100) y de su variante *Uncertainty-Aware RWM* (arXiv:2504.16680). El autor, Joyjeet Singh, libera los pesos entrenados para verificar la afirmación central de la publicación original: que el entrenamiento autoregresivo supera al *teacher forcing* en el error de predicción a horizonte largo. No está afiliado ni respaldado por los autores originales.

La relevancia de este modelo no es su rendimiento, sino su valor como artefacto de verificación científica. La model card es explícita: la salida de desviación estándar (σ) de estos checkpoints **no es una estimación de incertidumbre utilizable**. Medida contra el error real en episodios reservados, la σ predicha está entre 11 y 315 veces sobreconfiada, con cobertura en ±1σ del 11,67 % al 42,78 % en lugar del 68,3 % esperado. El repositorio incluye un checkpoint con objetivo corregido (usando la rama `gaussian_nll` del código original) que reduce la sobreconfianza a 11× pero sigue sin producir un intervalo calibrado.

Los pesos están en formato PyTorch (`.pt`) y cada checkpoint ocupa 5,68 MB. No hay datos publicados de arquitectura, número de parámetros, contexto ni idiomas; el modelo está pensado para robótica con patas, no para lenguaje. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de dinámica neuronal, red feedforward o recurrente, no especificada) |
| Parámetros totales | no disponible (pesos de ~5,68 MB en fp32, lo que sugiere ~1,4 M de parámetros, pero no confirmado) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje; horizonte de predicción de 368 pasos en los benchmarks) |
| Tipos de cuantización | no disponible (solo pesos `.pt` en fp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la model card. Por los artículos de referencia, se trata de un modelo de dinámica neuronal que predice el siguiente estado (propiocepción) de un robot de patas, típicamente una red feedforward o MLP con una salida gaussiana (media y desviación estándar). El entrenamiento se realiza en dos variantes: autoregressive (la arm principal del artículo, que usa sus propias predicciones como entrada para el siguiente paso) y teacher-forced (que usa el estado real como entrada en cada paso). El repositorio incluye tres semillas para cada variante a 10 000 iteraciones, un checkpoint a 2 500 iteraciones de la variante autoregressive y un checkpoint entrenado con la rama `gaussian_nll` del código original.

La innovación técnica clave no es la arquitectura, sino el hallazgo negativo: la pérdida de estado es el error cuadrático sobre una muestra reparametrizada sin término log-σ, por lo que su óptimo es σ = 0, y el término de cota que debería oponerse se cancela algebraicamente. Esto produce una sobreconfianza estructural de la σ, no un accidente de entrenamiento. El checkpoint `corrected-objective-2500` usa la rama `gaussian_nll` del código original, que revierte el mecanismo, pero aún así no produce una estimación calibrada (10,9× sobreconfiada).

## Capacidades

- Predicción de dinámica propioide: dado el estado actual del robot (posiciones, velocidades articulares, etc.), predice el siguiente estado.
- Generación de trayectorias autoregressive: puede desplegarse en bucle cerrado para predecir el estado futuro a un horizonte de 368 pasos.
- Modelo de mundo para RL basado en modelo: puede usarse como dinámica aprendida para entrenar políticas sin simulador.
- Salida gaussiana (media y σ) para representar la incertidumbre predictiva, aunque **no calibrada** (véase limitaciones).
- No tiene capacidades de lenguaje, visión, tool calling ni agentes.

## Casos de uso

- **Verificación de resultados publicados**: el caso de uso principal es comprobar la afirmación del artículo de RWM de que el entrenamiento autoregressive supera al teacher forcing en el error de predicción a horizonte largo. Los checkpoints permiten reproducir la tabla de resultados sin reentrenar.
- **Investigación sobre calibración de incertidumbre**: los checkpoints, con su σ sobrecalada, son un banco de pruebas para estudiar por qué las redes neuronales producen intervalos de confianza mal calibrados y cómo corregirlos.
- **Entrenamiento offline de políticas**: el checkpoint `autoregressive-10k-seed2` (mejor semilla, 0.3341 error normalizado) puede usarse como modelo de dinámica aprendida para entrenar políticas con RL sin simulador, aunque la σ no debe usarse como cota de seguridad.
- **Comparación de objetivos de entrenamiento**: el checkpoint `corrected-objective-2500` permite comparar el efecto del objetivo NLL frente al MSE en la calidad de la predicción y en la calibración de la σ.
- **Evaluación de la generalización temporal**: los errores normalizados a 368 pasos permiten medir la degradación de la predicción a largo plazo en sistemas robóticos.
- **Reproducibilidad en robótica**: los checkpoints con SHA256 fijos y semillas conocidas permiten reproducir exactamente los experimentos de la publicación, algo raro en el campo.

## Benchmarks y rendimiento

No hay benchmarks estándar (MMLU, HumanEval, etc.) porque es un modelo de robótica, no de lenguaje. Los datos de rendimiento se limitan a la medición de calibración de σ y al error normalizado de predicción a un horizonte de 368 pasos. Los siguientes datos están extraídos directamente de la model card.

| Checkpoint | Error normalizado (368 pasos) | Media \|error\| / media σ | Cobertura ±1σ (h=1) |
|---|---|---|---|
| `autoregressive-10k-seed0` | 0.3894 | 52× | 11.67 % |
| `autoregressive-10k-seed1` | 0.3509 | 52× | 11.67 % |
| `autoregressive-10k-seed2` | 0.3341 | 52× | 11.67 % |
| `teacher-forced-10k-seed0` | 1.9710 | 315× | 12.96 % |
| `teacher-forced-10k-seed1` | 1.5540 | 315× | 12.96 % |
| `teacher-forced-10k-seed2` | 1.4241 | 315× | 12.96 % |
| `autoregressive-2500` | no disponible | 52× | 11.67 % |
| `corrected-objective-2500` | no disponible | 11× | 42.78 % |

La media del brazo autoregressive es 0.3582 ± 0.0283 (tres semillas) y la del brazo teacher-forced es 1.6497 ± 0.2858. La calibración de σ se midió en la iteración 2,500, no en la 10,000. Un modelo calibrado tendría ratio \|error\|/σ de 1× y cobertura de 68.3 %.

## Requisitos de hardware

- **VRAM estimada**: muy baja. Con pesos de ~5,68 MB en fp32, la inferencia cabe en cualquier GPU moderna (incluso en CPU sin GPU).
- **GPU recomendada**: cualquier GPU con ≥1 GB de VRAM. No se necesita GPU de nivel datacenter.
- **Compatibilidad con GPU de consumo**: total. Se ejecuta en una RTX 3060 o incluso en un portátil.
- **Opciones de despliegue**: no hay soporte para vLLM, Ollama ni TGI por ser un modelo de robótica, no de lenguaje. El despliegue típico es mediante el código de entrenamiento de GitHub (`runs/...`), con PyTorch directo.
- **Latencia y throughput**: no se han publicado datos. Dado el tamaño, la inferencia de un paso es del orden de microsegundos en GPU y milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RWM original (Li, Krause & Hutter) | World model para robótica | ~1 M de parámetros (estimado) | Predicción de dinámica y RL | No especificada | Código en GitHub `leggedrobotics/robotic_world_model` |
| Uncertainty-Aware RWM | World model con incertidumbre | no disponible | Predicción con σ | No especificada | Código en GitHub |
| RWM reproduction (este modelo) | World model de reproducción | no disponible | Verificación y calibración | Apache 2.0 | HuggingFace (solo pesos `.pt`) |

No hay modelos de lenguaje comparables por ser una categoría distinta. La comparación principal es con el modelo original del RWM: este modelo es una reproducción, no una mejora, y su valor es la evidencia de que la σ del original no está calibrada.

## Limitaciones y advertencias

- **La σ no es una estimación de incertidumbre usable**: está entre 11× y 315× sobrecalada según el checkpoint, con cobertura en ±1σ del 11,67 % al 42,78 % (el esperado es 68,3 %). No debe usarse para gate de riesgo, márgenes de seguridad ni nada que trate σ como una escala.
- **La causa es estructural**: el objetivo de entrenamiento (error cuadrático sobre una muestra re-reparametrizada sin log-σ) hace que el óptimo sea σ = 0, y el término de cota que debería oponerse se cancela algebraicamente. No es un fallo de entrenamiento accidental.
- **El checkpoint `corrected-objective-2500` no es una versión calibrada**: usa la rama `gaussian_nll` del código original, pero sigue siendo 10,9× sobreconfiado. Se publica como artefacto de objetivo corregido, no como modelo calibrado.
- **Riesgo de alucinación**: no aplica (no es un modelo generativo de lenguaje).
- **Idiomas**: no aplica.
- **Contexto**: no aplica.
- **Uso comercial**: licencia Apache 2.0, permite uso comercial, pero con la advertencia de que la σ no debe usarse para decisiones de seguridad.
- **Sin garantías**: el autor declara que no está afiliado con los autores originales, y que la reproducción no ha sido revisada por ellos.
- **Sin datos de arquitectura**: no se publican detalles de la red (capas, activaciones, tamaño de estado), lo que limita la reproducibilidad completa.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Joyjeetsingh/rwm-reproduction
- Código, evidencia y registro de reclamaciones: https://github.com/joyjeet-singh/rwm
- Repositorio original de RWM (leggedrobotics): https://github.com/leggedrobotics/robotic_world_model
- Implementación de RL con RWM: https://github.com/leggedrobotics/rsl_rl_rwm
- Artículo base (arXiv:2501.10100): https://arxiv.org/abs/2501.10100
- Artículo de incertidumbre (arXiv:2504.16680): https://arxiv.org/abs/2504.16680
- Perfil de HuggingFace del autor: https://huggingface.co/Joyjeetsingh
