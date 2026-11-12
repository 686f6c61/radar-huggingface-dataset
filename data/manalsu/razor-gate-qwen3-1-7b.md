# Manalsu/razor-gate-Qwen3-1.7B

## Resumen

RAZOR gate para Qwen3-1.7B es un módulo complementario, no un modelo de lenguaje completo, desarrollado por Manalsu (Manaslu Labs). Consiste en una compuerta de olvido (forget gate) aprendida que decide, token a token y cabeza KV a cabeza KV, qué entradas deben permanecer en la caché KV durante la inferencia y cuáles deben descartarse. El modelo base Qwen3-1.7B no se modifica: la compuerta se aplica en tiempo de inferencia sobre la caché.

El componente tiene 29,5 millones de parámetros (aproximadamente el 1,7 % del modelo base) distribuidos en 28 capas, cada una con un MLP que proyecta el estado oculto de 2048 dimensiones a 512 y luego a 8 puntuaciones de retención (una por cabeza KV). Su objetivo es reducir el consumo de memoria de la caché KV en contextos largos manteniendo la calidad de la respuesta, un problema relevante para despliegues con ventanas de contexto extensas en hardware limitado.

Su interés técnico reside en el entrenamiento con un precio de longitud de descripción (dual-ascent) que fija la tasa de retención en el 30 %, y en que la evaluación reportada muestra una degradación pequeña frente a la caché completa en RULER 4k y 16k, además de un resultado preliminar en MATH-500. Es un artefacto de investigación con 0 descargas y licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Compuerta MLP por capa sobre el estado oculto (2048 → 512 → 8 cabezas KV), 28 capas; misma arquitectura que `KVzapModel` de kvpress |
| Parámetros totales | 29.489.376 (compuerta); modelo base Qwen3-1.7B aparte |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; evaluado hasta 16k tokens con RULER; ventana deslizante de 128 tokens en la umbralización |
| Tipos de cuantización | no disponible (pesos en safetensors, probablemente fp16/bf16; la model card no lo detalla) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3-1.7B) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La compuerta es un MLP independiente por cada una de las 28 capas del transformer de Qwen3-1.7B. Para cada token que se escribe en la caché, toma el estado oculto de la capa (2048 dimensiones), lo proyecta a 512 y emite 8 puntuaciones de retención, una por cabeza KV. Un token se conserva si su puntuación supera un umbral (0,0 por defecto), aplicado con una ventana deslizante de 128 tokens al estilo DMS. La decisión es por cabeza, de modo que una misma posición puede retenerse en unas cabezas y descartarse en otras.

El entrenamiento minimiza la divergencia KL entre la distribución del siguiente token del modelo comprimido y la del modelo sin comprimir, con decisiones duras de conservar/descartar y gradientes straight-through. Un precio de doble ascenso (dual-ascent) mantiene la tasa de retención en el 30 %. Se entrenó durante 39 minutos en una única T4 con documentos de hasta 1k tokens del dataset Nemotron (la misma fuente que KVzap), semilla 0. El registro está en `train_log.txt` del repositorio. La innovación principal es el uso de un precio de longitud de descripción para controlar el presupuesto de caché, en lugar de un objetivo de regresión de puntuaciones como KVzap.

## Capacidades

- Compresión selectiva de la caché KV: decide qué tokens conservar por cabeza KV, liberando memoria real (no solo enmascarando) mediante `RaggedDMSPress`, que elimina las entradas descartadas.
- Integración con el ecosistema kvpress: se usa a través de `KVPressTextGenerationPipeline` y `DMSPress(LocalGatePress(...))`, que aplican las mismas decisiones con enmascaramiento.
- Compatibilidad con decodificación autoregresiva y razonamiento largo: la evaluación en MATH-500 comprime la caché mientras el modelo razona.
- No añade capacidades nuevas al modelo base: no incorpora tool calling, visión, audio ni modos de pensamiento propios; hereda las del Qwen3-1.7B subyacente.
- Soporte de batch size 1 en la implementación `RaggedDMSPress` (limitación explícita de la model card).
- Multilingüismo: no documentado para la compuerta; depende del modelo base.

## Casos de uso

- Despliegue de Qwen3-1.7B con contextos largos en GPUs de 16 GB: la compuerta reduce la huella de la caché KV a una tasa de retención del 30 %, lo que permite procesar documentos de varios miles de tokens donde la caché completa agotaría la memoria.
- Razonamiento matemático con cadenas largas: la evaluación en MATH-500 (niveles 4-5) comprime la caché durante el razonamiento sin pérdida observada, por lo que es adecuada para pipelines de resolución de problemas paso a paso.
- Procesamiento de documentación técnica y extracción de respuestas: el pipeline `kv-press-text-generation` acepta un contexto y una pregunta, y devuelve la respuesta con la caché comprimida; útil para QA sobre manuales o informes.
- Investigación en compresión de caché KV: sirve como referencia reproducible (código, log de entrenamiento y semilla) para comparar objetivos de entrenamiento de compuertas de olvido frente a KVzap o KVzip+.
- Prototipado en hardware consumer: al requerir solo una T4 para el entrenamiento y operar sobre un modelo de 1.7B, permite experimentar con políticas de evicción en entornos de bajo presupuesto.
- Evaluación de robustez de atención: permite estudiar cómo varía la tasa de evicción según la entrada (71-85 % en RULER-4k, percentiles 5-95) y su efecto en tareas de recuperación de palabras comunes.

## Benchmarks y rendimiento

Resultados reportados en la model card, sobre T4 de 16 GB, media de `string_match` de RULER en kvpress:

| Benchmark | Caché completa | RAZOR (evictado) | Misma compuerta, objetivo KVzap | KVzip+ |
|---|---|---|---|---|
| RULER 4k (n=650, 5 semillas) | 88,9 | 86,6 ± 0,6 (76 %) | 79,6 | 86,5 (76 %) |
| RULER 16k (n=195) | 77,9 | 75,4 (81 %) | 63,6 | 73,6 (76 %) |
| MATH-500 L4-5, comprimido durante razonamiento (n=30) | 66,7 % | 73,3 % (75 %) | — | — |

La compuerta con objetivo KVzap es un entrenamiento propio del autor, no un checkpoint de NVIDIA. KVzip+ requiere una segunda pasada sobre el contexto.

## Requisitos de hardware

- VRAM: la compuerta añade 29,5 M de parámetros (unos 60 MB en fp16) sobre Qwen3-1.7B; el ahorro principal proviene de la reducción de la caché KV a una tasa de retención del 30 %.
- GPU recomendadas: el autor reporta entrenamiento y evaluación en NVIDIA T4 de 16 GB; el modelo base de 1.7B cabe holgadamente en GPUs consumer como RTX 3060 12 GB, RTX 4070, RTX 4090.
- Cabe en GPU consumer: sí, tanto el modelo base como la compuerta; la ventaja es poder ampliar la longitud efectiva de contexto en tarjetas de 12-16 GB.
- Despliegue: pipeline `kv-press-text-generation` de kvpress con `transformers>=4.56,<5.3`; `RaggedDMSPress` para liberar memoria y `DMSPress` para enmascarar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se documenta el tiempo de entrenamiento (39 minutos en una T4).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | RULER 4k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RAZOR gate (Qwen3-1.7B) | 29,5 M (compuerta) | evaluado a 16k | 86,6 | Apache 2.0 | Hugging Face, 0 descargas |
| Compuerta con objetivo KVzap (entrenamiento propio) | misma arquitectura | evaluado a 16k | 79,6 | no disponible | no disponible |
| KVzip+ | no disponible | evaluado a 16k | 86,5 | no disponible | no disponible |

La comparación se limita a las variantes reportadas en la propia model card; no se dispone de datos de otros mecanismos de compresión de caché KV en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento débil en extracción de palabras comunes de RULER: 57 frente a 79 de KVzip+ a 4k tokens.
- El resultado de MATH-500 (n=30) indica ausencia de pérdida, no una mejora; la muestra es pequeña y no es estadísticamente concluyente.
- La tasa de evicción varía según la entrada (71-85 % en RULER-4k, percentiles 5-95), por lo que el ahorro de memoria no es determinista.
- `RaggedDMSPress` solo admite batch size 1; para lotes mayores hay que usar la variante con enmascaramiento `DMSPress`.
- Entrenada con documentos de hasta 1k tokens; el comportamiento más allá de esa longitud en entrenamiento no está validado, aunque se evalúe a 16k.
- No modifica el modelo base, por lo que hereda sus sesgos, riesgo de alucinación y limitaciones idiomáticas.
- Licencia Apache 2.0 permite uso comercial, pero el artefacto es de investigación, con 0 descargas y sin revisión externa; el paper aún no tiene versión en arXiv.
- No se documentan cuantizaciones ni formatos GGUF, lo que limita su uso en stacks de inferencia distintos de transformers + kvpress.

## Enlaces

- Hugging Face: https://huggingface.co/Manalsu/razor-gate-Qwen3-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de código, entrenamiento y evaluación: https://github.com/Manaslu-AI/razor
- Paper (PDF en el repositorio, versión arXiv pendiente): `razor.pdf` en https://github.com/Manaslu-AI/razor
- kvpress: no disponible (dependencia citada, sin enlace en la información proporcionada)
