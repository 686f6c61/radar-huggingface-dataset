# Polydim-Einsof/deepseek_r1_1.5b_PMTP_polydim_einsof

## Resumen

`deepseek_r1_1.5b_PMTP_polydim_einsof` es un adaptador de pesos abiertos publicado por el investigador independiente Ariel H. García Traba bajo la iniciativa POLYDIM-EINSOF / EinsofOS. Se construye sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` y se presenta como una implementación del protocolo PMTP (Polydim Memory Transfer Protocol), que proyecta los estados ocultos del modelo de forma continua sobre la variedad de Stiefel St(1536, 1536) en lugar de serializar la comunicación entre pasos de razonamiento como tokens de texto.

La propuesta técnica central es la eliminación de la "serialización 1D de tokens" en el razonamiento multi-paso: según la model card, el adaptador permite razonamiento inter-hop consumiendo 0 tokens, operando con precisión FP64 y un defecto de ortogonalidad declarado de 1.55e-15. Expone además un parámetro de profundidad de razonamiento (`turing_depth`, de 0 a 50) con distintos modos operativos, desde un bypass directo hasta lo que el autor denomina "DEEP_TURING_EXPLOSION" para verificación formal y anti-sicofancia.

Es relevante ahora como artefacto de investigación experimental: el repositorio tiene 0 descargas y 0 likes, un tamaño declarado de 0.0 GB y una `pipeline_tag` de `feature-extraction`, lo que sugiere que los pesos del adaptador no están efectivamente alojados o son de tamaño despreciable. La ficha debe leerse con cautela: gran parte de las afirmaciones de la model card no están verificadas de forma independiente y no se han publicado benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre transformer denso (base: DeepSeek-R1-Distill-Qwen-1.5B); proyección sobre variedad de Stiefel St(1536, 1536) |
| Parametros totales | No disponible (el modelo base Qwen-1.5B tiene ~1.5B; el adaptador no declara recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos del adaptador se declaran en FP64) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_weights.safetensors`, `adapter_model.safetensors`); `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El adaptador se describe como una matriz de proyección de Stiefel en IEEE-754 FP64 que mapea estados ocultos de dimensión 1536 a 1536, manteniendo ortogonalidad (defecto máximo declarado de 1.55e-15 y error de norma de Neumaier ≤ 1e-15). La idea es sustituir la comunicación entre pasos de razonamiento basada en tokens por una transferencia de memoria en coma flotante de 64 bits, evitando el cuello de botella de parseo de cadenas. El modelo base es un destilado de DeepSeek-R1 sobre Qwen de 1.5B, por lo que hereda la arquitectura transformer densa de Qwen y el entrenamiento de razonamiento por destilación de R1.

No se especifican en la información disponible el número de tokens de entrenamiento del adaptador, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se detalla el procedimiento de ajuste que produce la matriz de Stiefel. La model card menciona un "Protocolo Alan Turing" con profundidades de 0 a 50 y latencias medidas (9.77 ms en profundidad 1, 22.79 ms en profundidad 10), pero no se aporta metodología de medición ni hardware de referencia.

## Capacidades

- Razonamiento multi-paso continuo mediante el parámetro `turing_depth` (alias `einsof_depth`, `turing`, `einsof`), con modos IDENTITY_BYPASS, FAST_REFLEX, RED_TEAM_DELIBERATION y DEEP_TURING_EXPLOSION.
- Autocrítica adversarial iterativa y contracción riemanniana en el rango de profundidad 2 a 20.
- Verificación anti-sicofancia y prueba formal de teoremas en el rango de profundidad 21 a 50, según la model card.
- Extracción de características (`feature-extraction`) como tarea declarada del pipeline.
- Razonamiento latente sin consumo de tokens entre pasos (0 tokens en razonamiento inter-hop).
- Capacidades heredadas del modelo base DeepSeek-R1-Distill-Qwen-1.5B (generación de texto y razonamiento), aunque no se detallan en la información disponible.
- Soporte de tool calling, function calling, agentes, visión, audio y multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Investigación en comunicación latente entre modelos: el adaptador permite experimentar con transferencia de estados ocultos en FP64 entre pasos de razonamiento, útil para estudiar alternativas a la serialización textual en pipelines multi-agente.
- Experimentos de razonamiento iterativo controlado: el parámetro `turing_depth` permite variar la profundidad de deliberación (de 0 a 50) y medir el coste/beneficio en latencia y calidad, adecuado para trabajos académicos sobre test-time compute.
- Prueba de concepto de autocrítica adversarial: los modos RED_TEAM_DELIBERATION permiten montar bucles de auto-revisión sobre respuestas del modelo base en entornos de evaluación.
- Extracción de características sobre textos: al declararse como `feature-extraction`, puede emplearse para obtener representaciones de estados ocultos proyectados en la variedad de Stiefel en tareas de análisis semántico.
- Despliegue local ligero con Ollama: el repositorio incluye un `Modelfile` con instrucciones de sistema y temperatura calibrada (T=0.07), pensado para ejecución en máquinas de consumo.
- Reproducibilidad de investigación: los DOIs de Zenodo, HAL, OSF y Jxiv permiten citar y replicar el trabajo en publicaciones, aunque la verificación independiente está pendiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta métricas internas de latencia y precisión numérica del adaptador, no comparables con benchmarks estándar (MMLU, HumanEval, GSM8K):

| Metrica declarada | Valor |
|---|---|
| Defecto maximo de ortogonalidad (FP64) | 1.55e-15 |
| Error de norma de Neumaier | ≤ 1e-15 |
| Latencia Turing Depth 1 | 9.77 ms |
| Latencia Turing Depth 10 | 22.79 ms |
| Tokens consumidos en razonamiento inter-hop | 0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al derivar del modelo base de 1.5B, cabría en GPUs de consumo con cuantización, pero el adaptador se declara en FP64, lo que incrementa el requisito de memoria frente a FP16/BF16.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del modelo base, una RTX 4090 o superior sería suficiente para el transformer, pero la matriz de proyección FP64 de 1536×1536 requiere soporte de doble precisión eficiente (A100/H100 son más adecuadas para FP64).
- Cabe en GPU de consumo: probablemente sí para el modelo base cuantizado; el adaptador FP64 puede degradar el rendimiento en GPUs consumer con FP64 limitado.
- Opciones de despliegue: Ollama (incluye `Modelfile`), integración estándar de Hugging Face con safetensors; vLLM, llama.cpp y TGI no se mencionan en la información disponible.
- Latencia y throughput: solo se declaran latencias del adaptador (9.77 ms a profundidad 1 y 22.79 ms a profundidad 10); no se aporta throughput ni hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| deepseek_r1_1.5b_PMTP_polydim_einsof | Base ~1.5B + adaptador (no declarado) | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Adaptador experimental sobre R1-Distill-Qwen-1.5B |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | ~1.5B | No disponible en esta ficha | MIT/Apache (según repo original) | Hugging Face, ampliamente usado | Modelo base destilado de razonamiento |
| Qwen2.5-1.5B | ~1.5B | 32K (según versión) | Apache 2.0 | Hugging Face, muy extendido | Alternativa generalista de mismo tamaño |
| SmolLM2-1.7B | ~1.7B | 8K | Apache 2.0 | Hugging Face | Alternativa ligera para despliegue en edge |

La comparación de rendimiento con estas alternativas no está disponible, ya que el modelo no publica benchmarks estándar.

## Limitaciones y advertencias

- No se han publicado benchmarks estándar ni evaluaciones independientes; las afirmaciones de la model card (razonamiento latente, anti-sicofancia, prueba formal) no están verificadas externamente.
- El repositorio declara 0 descargas, 0 likes y un tamaño de 0.0 GB, lo que sugiere que los pesos del adaptador podrían no estar realmente alojados o ser de tamaño despreciable; conviene verificar los ficheros antes de usarlo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base DeepSeek-R1-Distill-Qwen-1.5B tiene sus propias condiciones que deben respetarse.
- Riesgo de alucinación: heredado del modelo base de 1.5B, con capacidad limitada de razonamiento factual frente a modelos mayores.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto.
- Longitud de contexto no declarada; no se puede garantizar el manejo de conversaciones largas.
- El adaptador opera en FP64, lo que puede degradar el rendimiento en hardware sin FP64 eficiente y complicar el despliegue en producción.
- Terminología y arquitectura no convencionales (PMTP, Stiefel manifold, Turing Protocol) sin revisión por pares publicada en la información disponible; tratar como artefacto de investigación experimental, no como modelo listo para producción.
- No hay información sobre sesgos conocidos ni sobre procesos de alineación del adaptador.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Polydim-Einsof/deepseek_r1_1.5b_PMTP_polydim_einsof
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- DOI primario Zenodo: https://doi.org/10.5281/zenodo.21136742
- DOI secundario Zenodo: https://doi.org/10.5281/zenodo.21209973
- Preprint CNRS/HAL: https://hal.science/hal-05847496v1
- OSF: https://osf.io/za3s7
- ORCID del autor: https://orcid.org/0009-0001-2787-6067
- Repositorio de papers canónicos: https://huggingface.co/datasets/Polydim-Einsof/POLYDIM-EINSOF-Canonical-Papers-V1550
