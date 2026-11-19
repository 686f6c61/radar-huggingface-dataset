# ikimyaii/HGRN-340M-semi-structured-EHWS-70pct

## Resumen

HGRN-340M-semi-structured-EHWS-70pct es una variante podada del modelo base m-a-p/340M-20B-HGRN-pure-baseline, un transformer de tipo HGRN (Hierarchically Gated Recurrent Network) con 341.148.672 parámetros entrenado sobre 20.000 millones de tokens. El autor, ikimyaii, aplica un proceso de poda semi-estructurada al 70 % de dispersión sobre todas las capas lineales internas de los bloques, manteniendo embeddings y `lm_head` densos. El resultado es un checkpoint que conserva únicamente el 30 % de los pesos por fila en cada capa podada.

La relevancia técnica del modelo reside en el método de poda empleado, no en el modelo en sí: combina una fase local de tipo ALPS (minimización del error de reconstrucción capa a capa con Hessianos calculados sobre C4) con una fase global basada en ADMM sobre la pérdida de entropía cruzada y destilación de conocimiento. La poda es semi-estructurada y perfectamente equilibrada por fila (168 capas verificadas), lo que la hace atractiva para kernels de inferencia con reparto de trabajo uniforme.

El modelo está pensado como artefacto de investigación sobre compresión de redes y despliegue eficiente de arquitecturas recurrentes lineales. No es un modelo de propósito general: la poda degrada notablemente la perplejidad y el rendimiento en tareas de razonamiento, y no se documentan idiomas, licencia ni pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), transformer recurrente lineal |
| Parametros totales | 341.148.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 2.048 tokens en la calibración) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dispersión | 70 % semi-estructurada en capas lineales internas (embeddings y lm_head densos) |
| Modelo base | m-a-p/340M-20B-HGRN-pure-baseline |
| Tamano del repo | 1,4 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura HGRN del checkpoint base, una red recurrente lineal con puertas jerárquicas que sustituye la atención cuadrática por recurrencia lineal, lo que reduce el coste computacional y de memoria en secuencias largas. El checkpoint base fue entrenado sobre 20.000 millones de tokens. Sobre él se aplica una poda en dos fases: una fase local estilo ALPS que poda cada capa directamente al 70 % minimizando `||(W - W0) X||^2` con Hessianos derivados de secuencias de calibración de C4, y una fase global con ADMM sobre la pérdida combinada de entropía cruzada y destilación de conocimiento del modelo denso.

La fase global emplea un paso Z con `Diag(H)`, 128 rondas de 32 pasos, learning rate 0,0006, lambda constante de 0,01, Adam con beta2 0,95 y semilla 0. Los datos de calibración son las 32.768 secuencias de C4 de 2.048 tokens usadas por el código oficial de ELSA, tokenizadas con el tokenizador del propio modelo (`fla-hub_hgrn-1.3B-100B`), cada una vista una sola vez. El entrenamiento completo, incluida la evaluación, consumió 2,17 horas en una única A100 de 40 GB. La dispersión efectiva medida sobre los pesos finales es de 0,7001, y cada fila de cada capa podada conserva exactamente el mismo número de no-ceros, lo que garantiza equilibrio de carga por fila.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM.from_pretrained(...)`, requiriendo la instalación de `flash-linear-attention` (`import fla`).
- Razonamiento básico y respuesta a preguntas de opción múltiple, con rendimiento degradado respecto al modelo denso (media zero-shot de 0,3939 frente a 0,4400).
- Procesamiento de secuencias de hasta 2.048 tokens según el protocolo de calibración; no se documenta una ventana de contexto mayor.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en compresión de modelos: sirve como referencia reproducible de poda semi-estructurada al 70 % con ADMM, con `results.json` que documenta configuración completa y semilla, útil para comparar métodos de poda sobre arquitecturas recurrentes lineales.
- Estudio de kernels para dispersión equilibrada: al mantener el mismo número de no-ceros por fila en las 168 capas podadas, permite evaluar kernels de sparse GEMM con reparto de trabajo uniforme sin desbalanceo entre warps.
- Despliegue en entornos con restricciones de memoria: el checkpoint de 1,4 GB y 341 M de parámetros cabe en GPUs de consumo y en CPU, adecuado para prototipos de inferencia de bajo coste donde la calidad no sea crítica.
- Benchmarking de pipelines de poda: la comparación denso vs. podado en WikiText-2, C4 y tareas de lm-evaluation-harness permite validar herramientas de evaluación y protocolos de medición de perplejidad.
- Docencia y experimentación con arquitecturas HGRN: el modelo base y su variante podada permiten ilustrar el impacto de la dispersión en modelos recurrentes lineales con un coste de cómputo mínimo.
- Pruebas de integración con `flash-linear-attention`: útil para validar la carga y ejecución de checkpoints HGRN en dicho stack antes de escalar a variantes mayores.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16), ejecución única:

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 21,96 | 21,94 |
| Este modelo (70 % sparsity) | 38,47 | 29,14 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,2031 |
| arc_easy | 0,6153 | 0,4701 |
| boolq | 0,6028 | 0,6028 |
| hellaswag | 0,3423 | 0,3051 |
| openbookqa | 0,2380 | 0,1540 |
| rte | 0,5126 | 0,5271 |
| winogrande | 0,5059 | 0,4949 |
| Media | 0,4400 | 0,3939 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en fp16 para los pesos (341 M de parámetros), más overhead de activaciones y caché; el repo ocupa 1,4 GB, lo que sugiere pesos en fp16 o bf16.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el entrenamiento se realizó en una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, así como en CPU.
- Opciones de despliegue: `AutoModelForCausalLM` de Transformers con `flash-linear-attention` instalado; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El tiempo de entrenamiento y poda fue de 2,17 horas en una A100 40 GB, incluyendo evaluación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Dispersión | Perplejidad WikiText-2 |
|---|---|---|---|---|---|
| HGRN-340M-semi-structured-EHWS-70pct | 341 M | no disponible | no disponible | 70 % semi-estructurada | 38,47 |
| m-a-p/340M-20B-HGRN-pure-baseline (denso) | 341 M | no disponible | no disponible | 0 % | 21,96 |
| Alternativas de poda comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos podados de la misma familia o tamaño en la documentación proporcionada.

## Limitaciones y advertencias

- Degradación significativa de calidad: la perplejidad en WikiText-2 sube de 21,96 a 38,47 y la media zero-shot cae de 0,4400 a 0,3939; arc_easy pasa de 0,6153 a 0,4701 y openbookqa de 0,2380 a 0,1540.
- Riesgo de alucinación elevado: no se documenta ningún proceso de alineación (RLHF/DPO) en el modelo base ni en la variante podada.
- Idiomas soportados no documentados: no se puede garantizar un comportamiento correcto fuera del inglés, idioma dominante en C4.
- Longitud de contexto no documentada más allá de las secuencias de 2.048 tokens usadas en la calibración.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Dependencia de `flash-linear-attention`: la carga requiere esta librería, lo que limita la portabilidad a stacks que no la soporten.
- Resultados de una sola ejecución con semilla fija (seed 0): sin intervalos de confianza ni repeticiones, la robustez de las cifras no está validada.
- Modelo de investigación: sin pipeline declarado, sin descargas ni likes, y sin documentación de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-semi-structured-EHWS-70pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Tokenizador de referencia (`fla-hub_hgrn-1.3B-100B`): https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Repositorio `flash-linear-attention`: no disponible en la información proporcionada
- Paper de HGRN: no disponible en la información proporcionada
- Paper de ELSA (protocolo de evaluación y datos de calibración): no disponible en la información proporcionada
- Fichero `results.json` con configuración completa: incluido en el repositorio del modelo
