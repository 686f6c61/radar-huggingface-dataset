# cellsentry-team/cellsentry-minicpm5-2b-formula-cancellation-v2

## Resumen

cellsentry-minicpm5-2b-formula-cancellation-v2 es un adaptador LoRA (y su versión fusionada en GGUF) construido sobre el modelo base openbmb/MiniCPM5-2B, desarrollado por el equipo cellsentry-team. Su propósito es especializar un modelo generativo conversacional en la revisión de fórmulas de hojas de cálculo, concretamente en la detección y el juicio de errores en fórmulas dentro de un flujo de auditoría denominado CellSentry. El artefacto se conserva como línea base histórica ("legacy-baseline") para compatibilidad, comparación de evaluaciones y recuperación, no como un modelo promocionado para producción.

El modelo base aporta una arquitectura transformer de aproximadamente 2.516 millones de parámetros (2,5 B). El adaptador se distribuye en formato PEFT (safetensors) y también como pesos fusionados en GGUF con cuantización q4_k_m. Los idiomas declarados son chino (zh) e inglés (en), y la licencia es Apache-2.0. El repositorio ocupa 1,6 GB e incluye el adaptador raíz, el GGUF fusionado y un directorio de evaluación con resultados agregados.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso muy específico (revisión de fórmulas con salida JSON estructurada); por otro, su model card es explícita sobre el rendimiento insuficiente en el benchmark externo (precisión de descarte del 75,6 % frente a un objetivo del 95 %), lo que lo convierte en un ejemplo útil de artefacto con limitaciones declaradas y sin promoción a modelo por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer generativo (modelo base openbmb/MiniCPM5-2B) con adaptador LoRA; también disponible como pesos fusionados en GGUF |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (contexto de uso indicado en la model card) |
| Tipos de cuantizacion | q4_k_m (GGUF); adaptador PEFT en safetensors sin cuantizar |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) y GGUF (pesos fusionados) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA sobre el modelo base openbmb/MiniCPM5-2B, fijado al commit `f97400052a43d642bbc6e9975e2397e3ae6a6b52`. No se debe apilar el adaptador v1 anterior. El repositorio incluye además un GGUF fusionado independiente (`gguf/cellsentry-minicpm5-2b-cancel2-q4_k_m.gguf`, 1.561.314.592 bytes, SHA256 `61d9c8ab8007dbbde0eb004089d1411fb6ec7167031f9d6fcc5b521fe8ebe49a`) que contiene los pesos de inferencia ya fusionados.

Según la model card, en esta v2 solo se entrenó la tarea de revisión de fórmulas; los resultados de PII y extracción fueron únicamente comprobaciones de regresión. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. El protocolo de uso prescrito es: plantilla de chat guardada, thinking desactivado, contexto de 1024 tokens, temperatura 0 y un máximo de 420 tokens de salida, con una sola alerta por petición. La limpieza de esta versión no implicó reentrenamiento ni reevaluación: se preservan rutas de pesos y digests.

## Capacidades

- Generación de texto conversacional orientada a la revisión de fórmulas de hojas de cálculo.
- Emisión de JSON estructurado de auditoría para CellSentry, con el campo `isValid=true` que indica que el hallazgo es un error real (no que la fórmula sea válida).
- Juicio de descarte ("dismissal") de hallazgos de fórmulas, con validación de identidades y JSON por parte del consumidor.
- Soporte de plantilla de chat con modo thinking desactivable.
- Capacidades multilingües limitadas a chino e inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Revisión de fórmulas en hojas de cálculo: el modelo recibe una alerta de fórmula y devuelve un JSON de auditoría que indica si el hallazgo es un error real, adecuado por su entrenamiento específico en esta tarea y su salida estructurada.
- Comparación de evaluaciones entre versiones: al conservarse como línea base histórica con resultados agregados en `evaluation/`, sirve para contrastar regresiones frente a adaptadores posteriores.
- Recuperación y compatibilidad de pipelines existentes: el GGUF fusionado con digest fijo permite reproducir inferencias históricas en entornos que dependían de esta versión.
- Validación de gates de descarte: permite medir la precisión de descarte sobre benchmarks externos (external580) y comparar con umbrales de seguridad antes de habilitar automatizaciones.
- Pruebas de regresión de PII y extracción: aunque no fue entrenado para ello en v2, se usó como comprobación de regresión, útil para detectar degradaciones colaterales.
- Evaluación de seguridad en entornos controlados: dado que la model card no aprueba el descarte automático, encaja en laboratorios de evaluación que necesiten un modelo con limitaciones documentadas y trazabilidad de pesos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| external580 (reutilizado) | Precisión de descarte bruta | 65/86 = 75,6 % (21 errores reales descartados incorrectamente) |
| external580 con gate seleccionado en validación | Precisión de descarte | 58/75 = 77,3 % (17 descartes inseguros) |
| Objetivo externo declarado | Precisión de descarte | 95 % (no alcanzado) |
| synthetic480 (nuevo) | Resultados de gate | No establecen seguridad en el mundo real según la model card |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,5 B parámetros, el GGUF q4_k_m (aproximadamente 1,56 GB de pesos) es apto para GPUs de consumo con suficiente memoria para el contexto de 1024 tokens.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs de consumo, pero la model card no lo valida para despliegue móvil ni como modelo por defecto.
- Cabe en GPU de consumo: probable por el tamaño del GGUF q4_k_m, aunque no está confirmado en la documentación.
- Opciones de despliegue: el formato GGUF es compatible con llama.cpp y derivados; el adaptador PEFT requiere el modelo base fijado. vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| cellsentry-minicpm5-2b-formula-cancellation-v2 | 2,52 B | 1024 | Apache-2.0 | Adaptador LoRA especializado en revisión de fórmulas; precisión de descarte 75,6 % en external580 |
| openbmb/MiniCPM5-2B (modelo base) | 2,52 B | no disponible | no disponible | Modelo generativo general sobre el que se entrena el adaptador |
| Alternativas de revisión de fórmulas | no disponible | no disponible | no disponible | No se dispone de comparables documentados en la información proporcionada |

## Limitaciones y advertencias

- No alcanza el objetivo de precisión de descarte del 95 %: registró 75,6 % bruto y 77,3 % con gate, con 17-21 descartes inseguros de errores reales.
- No está aprobado para descarte automático de hallazgos, despliegue móvil ni sustitución del modelo por defecto.
- Los resultados de synthetic480 no demuestran seguridad en el mundo real.
- El campo `isValid=true` significa que el hallazgo es un error real, no que la fórmula sea válida; un mal uso invierte la semántica de la salida.
- Requiere validación de identidades y JSON por parte del consumidor; en caso de fallo debe preservarse el hallazgo original.
- Contexto limitado a 1024 tokens y máximo de 420 tokens de salida, con una alerta por petición.
- Solo se entrenó revisión de fórmulas en v2; PII y extracción fueron comprobaciones de regresión, no capacidades entrenadas.
- Idiomas limitados a chino e inglés.
- Riesgo de alucinación y sesgos: no documentado explícitamente en la información disponible.
- Licencia Apache-2.0 con obligación de conservar `LICENSE` y `NOTICE.txt`.
- No se debe apilar el adaptador v1 anterior sobre este.

## Enlaces

- HuggingFace: https://huggingface.co/cellsentry-team/cellsentry-minicpm5-2b-formula-cancellation-v2
- Model card completa original: https://huggingface.co/cellsentry-team/cellsentry-minicpm5-2b-formula-cancellation-v2/blob/ffaa261f5d7732848fb726dd15224035b8e63c8d/README.md
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Directorio de evaluación: https://huggingface.co/cellsentry-team/cellsentry-minicpm5-2b-formula-cancellation-v2/tree/main/evaluation
- Manifiesto de subida: https://huggingface.co/cellsentry-team/cellsentry-minicpm5-2b-formula-cancellation-v2/blob/main/hf-upload-manifest.json
