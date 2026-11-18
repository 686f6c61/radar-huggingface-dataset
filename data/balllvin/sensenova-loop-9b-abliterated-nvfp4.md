# balllvin/SenseNova-Loop-9B-abliterated-NVFP4

## Resumen

SenseNova-Loop-9B-abliterated-NVFP4 es una variante del modelo SenseNova-Loop-9B de SenseNova en la que se ha eliminado el comportamiento de rechazo (refusal) mediante entrenamiento, no mediante proyección de pesos. El autor de la adaptación es el usuario `balllvin`, que publica el checkpoint cuantizado en formato NVFP4 (W4A16, grupo 16) con licencia Apache 2.0. El modelo base es de tipo text-generation con arquitectura transformer y capacidades multimodales (incluye torre de visión), con aproximadamente 9.000 millones de parámetros según la nomenclatura del checkpoint.

El interés técnico de esta ficha reside en el método de "abliteration": el autor documenta que todos los métodos lineales de dirección residual fallaron (diff-of-means, regresión de margen de rechazo, logit-lens, multi-categoría, steering horneado), con más de 40 puntos de capa/fuerza que dejaban intactos 16 de 16 rechazos de validación o destruían el modelo con divergencia KL de 2 a 14. La receta que funcionó es un objetivo de verosimilitud negativa (unlikelihood): LoRA de rango 64 sobre las capas lineales cuantizadas, minimizando `logsumexp` de los logits de los ids de apertura de rechazo en la última posición del prompt, con parada temprana en validación.

La relevancia de esta publicación es doble: por un lado, demuestra un pipeline de cuantización NVFP4 con entrenamiento consciente de cuantización (QAD) y edición conductual sobre pesos cuantizados; por otro, documenta empíricamente que la eliminación de rechazos puede mejorar métricas de capacidad (MMLU de 43,0 % a 58,0 %) en lugar de degradarlas, un resultado contraintuitivo que conviene tratar con cautela. El modelo no está alineado para seguridad y debe usarse en consecuencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base SenseNova-Loop-9B; incluye torre de visión y routers mHC) |
| Parametros totales | 9B (según nomenclatura del checkpoint; no se detalla desglose) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16, grupo 16 en todas las lineales de atención/MLP del modelo de lenguaje; embeddings, LM head, normas, routers mHC (fp32) y torre de visión en bf16. Decodificación exacta a bf16 disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (packed NVFP4, 20,8 GB de repo); script `load_nvfp4.py` para carga y decodificación a bf16 |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B es un transformer de aproximadamente 9.000 millones de parámetros con componentes multimodales: el checkpoint conserva una torre de visión en bf16 y routers mHC en fp32, lo que sugiere una arquitectura híbrida con enrutamiento interno (mHC, probablemente multi-head routing o similar). La cuantización NVFP4 se aplica con entrenamiento consciente de cuantización (QAD) a las lineales de atención y MLP, manteniendo en bf16 las partes sensibles (embeddings, LM head, normas, routers y visión). El autor indica que la decodificación de NVFP4 a bf16 es exacta, de modo que los valores de forward coinciden con las métricas reportadas.

La edición conductual se realizó mediante un objetivo de verosimilitud negativa sobre las capas lineales ya cuantizadas: LoRA de rango 64 que minimiza `logsumexp(logits[refusal-opener ids])` en la última posición del prompt de entrenamiento (810 prompts dañinos del programa de entrenamiento, no del conjunto sellado). La parada temprana en validación se fijó en el paso 25, con 0 de 16 rechazos en validación. Los adaptadores se fusionaron en los pesos maestros y se recuantizaron a NVFP4. No se documenta el número de tokens de entrenamiento del modelo base, la composición del dataset original ni si hubo RLHF/DPO en la fase base; esa información no está disponible en la model card.

## Capacidades

- Generación de texto autoregresiva con pipeline `text-generation` y compatibilidad con `transformers`.
- Razonamiento y conocimiento general evaluados mediante MMLU (58,0 % en la porción de 100 filas reportada).
- Capacidad multimodal potencial: el checkpoint conserva la torre de visión en bf16, aunque la model card no documenta tareas de visión ni su evaluación.
- Modo "thinking" mencionado en la evaluación (desactivado en los benchmarks reportados); no se detalla su funcionamiento.
- Comportamiento de rechazo drásticamente reducido: 3 de 99 rechazos en prompts dañinos y 7 de 100 en benignos (frente a 95 y 60 en la base NVFP4).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).

## Casos de uso

- Investigación sobre alineación y seguridad: el checkpoint permite estudiar empíricamente cómo la eliminación de rechazos afecta a métricas de capacidad (MMLU, NLL) y a la tasa de rechazos en conjuntos sellados como JailbreakBench+AdvBench, con un pipeline reproducible de LoRA sobre pesos cuantizados.
- Evaluación de cuantización NVFP4: sirve como caso de estudio de QAD con grupo 16 en un transformer de 9B, comparando NLL en WikiText (2,7619 frente a 2,8206 en bf16 de referencia) y verificando la exactitud de la decodificación a bf16.
- Despliegue en infraestructura con memoria limitada: el formato NVFP4 W4A16 reduce el peso de las lineales del modelo de lenguaje, lo que permite servir el modelo en GPUs con menos VRAM que un checkpoint bf16 equivalente, manteniendo routers y visión en precisión completa.
- Generación de texto sin restricciones conductuales en entornos controlados: para pruebas de robustez, red teaming interno o generación de contenido en dominios donde los rechazos del modelo base resultan un obstáculo (siempre con las salvaguardas externas adecuadas).
- Fine-tuning posterior sobre pesos cuantizados: el pipeline documentado (LoRA sobre lineales NVFP4, fusión en maestros y recuantización) es reutilizable para adaptar el modelo a dominios específicos sin perder el formato de despliegue.
- Integración en pipelines de `transformers`: al ser compatible con la librería y con endpoints, puede incorporarse en flujos de generación existentes mediante el script `load_nvfp4.py`.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (prompts sellados de JailbreakBench+AdvBench, greedy 96 tokens, thinking desactivado; MMLU sobre 100 filas; NLL sobre 24 ventanas de WikiText de 1.024 tokens):

| Build | Dañinos rechazados (de 99) | Benignos rechazados (de 100) | MMLU | WikiText NLL |
|---|---:|---:|---:|---:|
| NVFP4 base (QAD) | 95 | 60 | 43,0 % | 2,7560 |
| **abliterated** | **3** | **7** | **58,0 %** | **2,7619** |
| Referencia bf16 (solo NLL) | no disponible | no disponible | no disponible | 2,8206 |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU completo, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 20,8 GB en formato NVFP4 empaquetado; para inferencia cabe en GPUs de 24 GB (RTX 3090, RTX 4090, A10G) si se mantiene el formato cuantizado, y requiere aproximadamente el doble en bf16 tras decodificación.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en bf16 o con mayor margen; RTX 4090/3090 para inferencia NVFP4 en una sola GPU.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 con el checkpoint NVFP4; en bf16 probablemente no en 24 GB.
- Opciones de despliegue: `transformers` con el script `load_nvfp4.py` proporcionado; compatibilidad con endpoints. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-abliterated-NVFP4 | 9B | no disponible | NVFP4 W4A16 | Apache 2.0 | Rechazos reducidos por entrenamiento; MMLU 58,0 % |
| SenseNova-Loop-9B (base) | 9B | no disponible | bf16 | no disponible en la información | Modelo original de SenseNova; sin edición conductual |
| NVFP4 base (QAD) del mismo autor | 9B | no disponible | NVFP4 W4A16 | Apache 2.0 | Punto de partida de la ablación; MMLU 43,0 %, 95/99 rechazos dañinos |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo no está alineado para seguridad: la eliminación de rechazos es una edición conductual, no un cambio de capacidades, y debe usarse en consecuencia.
- El conjunto de entrenamiento de la eliminación de rechazos (810 prompts dañinos del programa) no coincide con el conjunto sellado de evaluación, por lo que las métricas de rechazo pueden no generalizar a otros conjuntos.
- Riesgo de alucinación: no cuantificado en la model card; el NLL en WikiText (2,7619) es ligeramente superior al de la base NVFP4 (2,7560), aunque inferior al bf16 de referencia (2,8206).
- La mejora de MMLU de 43,0 % a 58,0 % tras la edición conductual es un resultado reportado por el autor y no ha sido replicado de forma independiente; conviene tratarlo con cautela.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de contexto e idioma: no disponibles; no se especifican la ventana de contexto ni los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de alineación de seguridad traslada al desplegador la responsabilidad de implementar salvaguardas externas.
- El checkpoint depende de `transformers` y del script `load_nvfp4.py`; no se documenta compatibilidad con otros motores de inferencia, lo que puede limitar opciones de despliegue en producción.
- El modelo base es de SenseNova y la adaptación es de un tercero (`balllvin`); no hay garantías de soporte ni mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-NVFP4
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Revisión del modelo base referenciada: 329a65f701ba8c48b73c30d0cbaa6f0449733673
- Script de carga: `load_nvfp4.py` (incluido en el repositorio de Hugging Face)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
