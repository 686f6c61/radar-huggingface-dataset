# Polydim-Einsof/gemma2_2b_PMTP_polydim_einsof

## Resumen

`gemma2_2b_PMTP_polydim_einsof` es un adaptador publicado por el investigador independiente Ariel García Traba bajo la iniciativa POLYDIM-EINSOF / EinsofOS. Se presenta como un adaptador sobre el modelo base `google/gemma-2-2b` que proyecta los estados ocultos de forma continua sobre la variedad de Stiefel St(1024, 2304), es decir, mapea el espacio latente de dimensión 2304 del modelo base a un subespacio ortonormal de dimensión 1024. La propuesta del autor es sustituir la serialización de tokens en 1D por una comunicación inter-proceso en memoria de alta dimensión (lo que denomina PMTP, Polydim Memory Transfer Protocol).

El modelo se distribuye con el pipeline `feature-extraction` y una licencia Apache 2.0. El repositorio incluye pesos de adaptador en `safetensors` (una matriz de proyección declarada en FP64), un `adapter_config.json` con metadatos de la variedad y un `Modelfile` para despliegue en Ollama. El autor describe un "Protocolo Alan Turing" con un parámetro `turing_depth` (0 a 50) que controlaría pasos iterativos de contracción riemanniana y autocrítica adversarial.

La relevancia práctica es limitada y debe evaluarse con cautela: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño reportado es de 0.0 GB (lo que sugiere que los pesos pueden no estar efectivamente alojados o son de tamaño despreciable) y las afirmaciones técnicas de la model card (defecto de ortogonalidad de 1.33e-15, latencias de 15.29 ms, "cero tokens" en razonamiento) no vienen acompañadas de benchmarks estándar reproducibles ni de código de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de proyección sobre `google/gemma-2-2b` (transformer decoder-only del modelo base); proyección lineal sobre la variedad de Stiefel St(1024, 2304) según el autor |
| Parametros totales | No disponible (el modelo base Gemma 2 2B tiene 2.6B; el adaptador declara una matriz de proyección 2304→1024, pero no se especifica el número exacto de parámetros del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información del adaptador (el modelo base Gemma 2 2B soporta 8192 tokens) |
| Tipos de cuantizacion | No disponible (se distribuyen pesos en safetensors; el `Modelfile` de Ollama sugiere despliegue cuantizado, pero no se detalla el esquema) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_weights.safetensors`, `adapter_model.safetensors`); `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El adaptador se apoya en `google/gemma-2-2b`, un transformer decoder-only con atención local-global intercalada, GQA y activaciones GeGLU, aunque la model card no detalla la arquitectura interna del base. La contribución declarada del adaptador es una matriz de proyección W que mapea los estados ocultos de dimensión 2304 a un subespacio de 1024 dimensiones sobre la variedad de Stiefel, preservando la ortogonalidad de las columnas (el autor reporta un defecto máximo de ortogonalidad de 1.33e-15 en FP64). El objetivo es permitir "razonamiento latente" entre pasos sin serializar a tokens de texto.

El entrenamiento no está documentado: no se especifica el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. El autor menciona un "Protocolo Alan Turing" con un parámetro `turing_depth` que va de 0 (passthrough) a 50 (modo de "prueba formal de teoremas" y verificación antisicofántica), con latencias declaradas de 15.29 ms para profundidad 1 y 19.61 ms para profundidad 10. No se aportan detalles sobre el algoritmo de contracción riemanniana, la función de pérdida ni el procedimiento de optimización, por lo que la reproducibilidad es nula con la información disponible.

## Capacidades

- Extracción de características (`feature-extraction`): es el pipeline declarado; el adaptador transforma estados ocultos del modelo base en representaciones proyectadas de 1024 dimensiones.
- Razonamiento latente multi-paso: el parámetro `turing_depth` (alias `einsof_depth`, `turing`, `einsof`) permitiría iteraciones de "autocrítica adversarial" según el autor, sin generar tokens intermedios.
- Modos operativos declarados: `IDENTITY_BYPASS` (profundidad 0), `FAST_REFLEX` (profundidad 1), `RED_TEAM_DELIBERATION` (2-20) y `DEEP_TURING_EXPLOSION` (21-50).
- Generación de texto: heredada del modelo base Gemma 2 2B, aunque el adaptador está etiquetado como `feature-extraction` y no se documenta su impacto en la calidad generativa.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible; el autor sugiere razonamiento multi-paso, pero sin evidencia reproducible.
- Multilingüismo: no disponible (el modelo base Gemma 2 soporta múltiples idiomas, pero el adaptador no documenta su comportamiento por idioma).
- Capacidades especiales: proyección sobre variedad de Stiefel en FP64, "zero-worm" (eliminación de la serialización 1D según el autor), verificación de ortogonalidad.

## Casos de uso

- Investigación en representaciones latentes: el adaptador puede emplearse para estudiar si una proyección ortonormal sobre St(1024, 2304) preserva información semántica del modelo base; útil en laboratorios que investigan espacios latentes, aunque requiere validación empírica propia.
- Extracción de embeddings de dimensión reducida: para pipelines de búsqueda semántica o clustering que necesiten vectores de 1024 dimensiones derivados de Gemma 2 2B, con la cautela de que no hay evaluación publicada de la calidad de estos embeddings.
- Experimentos de "razonamiento sin tokens": probar el parámetro `turing_depth` como mecanismo de refinamiento iterativo en tareas de clasificación o verificación, midiendo si las latencias declaradas (15-20 ms) se sostienen en hardware propio.
- Despliegue local con Ollama: el repositorio incluye un `Modelfile` con temperatura calibrada a T=0.07, lo que facilita probar el adaptador en estaciones de trabajo con GPU de consumo, siempre que los pesos estén efectivamente disponibles.
- Reproducción de los artefactos científicos: los DOIs de Zenodo y HAL permiten a investigadores replicar los experimentos descritos en los artículos del autor sobre comunicación inter-proceso en alta dimensión.
- Evaluación crítica de adaptadores: como caso de estudio de adaptadores con afirmaciones técnicas no verificadas, útil para equipos que diseñan protocolos de validación de modelos publicados en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta métricas internas del adaptador (defecto de ortogonalidad de 1.33e-15, error de norma de Neumaier ≤ 10⁻¹⁵, latencias de 15.29 ms y 19.61 ms para profundidades 1 y 10), sin comparación con MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador; el modelo base Gemma 2 2B requiere aproximadamente 5-6 GB en FP16 y 2-3 GB en cuantización de 4 bits.
- GPU recomendadas: no especificadas por el autor; por el tamaño del base, una RTX 3060/4060 con 8 GB o superior sería suficiente para FP16, y GPUs con 4-6 GB para cuantización de 4 bits.
- Cabe en GPU de consumo: previsiblemente sí (el base Gemma 2 2B es apto para GPUs de consumo), aunque el adaptador declara operaciones en FP64 que pueden incrementar los requisitos de memoria y reducir el throughput.
- Opciones de despliegue: Ollama (se incluye `Modelfile`), integración estándar de Hugging Face (por los `adapter_model.safetensors`); no se documenta soporte para vLLM, llama.cpp o TGI.
- Latencia y throughput: el autor declara 15.29 ms para `turing_depth=1` y 19.61 ms para `turing_depth=10`; no se especifica el hardware de medición ni el throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gemma2_2b_PMTP_polydim_einsof` | No disponible (base 2.6B) | No disponible | Adaptador de proyección Stiefel sobre Gemma 2 2B | Apache 2.0 | Hugging Face (0 descargas) |
| `google/gemma-2-2b` | 2.6B | 8192 tokens | Transformer decoder-only | Gemma Terms of Use | Hugging Face (ampliamente usado) |
| `google/gemma-2-2b-it` | 2.6B | 8192 tokens | Transformer decoder-only ajustado a instrucciones | Gemma Terms of Use | Hugging Face |
| `Qwen2.5-1.5B` | 1.5B | 32768 tokens | Transformer decoder-only | Apache 2.0 | Hugging Face |

La comparación con alternativas es estructural: el adaptador no compite en benchmarks generativos con estos modelos, sino que propone una transformación del espacio latente del base. No hay datos públicos que permitan afirmar superioridad o paridad en tareas estándar.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay resultados en MMLU, HumanEval, GSM8K ni evaluaciones de calidad de embeddings, por lo que el rendimiento real es desconocido.
- Repositorio de 0.0 GB: el tamaño reportado sugiere que los pesos pueden no estar alojados o son de tamaño despreciable; verificar la integridad antes de usarlo en producción.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación independiente.
- Afirmaciones no verificadas: métricas como "0 tokens consumidos en razonamiento" o "defecto de ortogonalidad 1.33e-15" no vienen acompañadas de código de reproducción en la información disponible.
- Terminología no estándar: "zero-worm", "DEEP_TURING_EXPLOSION" o "anti-sycophancy verification" no corresponden a conceptos establecidos en la literatura; tratar con escepticismo.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 2 está sujeto a los Gemma Terms of Use, que imponen restricciones adicionales (por ejemplo, uso prohibido en ciertos contextos); el adaptador no puede desvincularse de esas condiciones.
- Idiomas: no documentados; el comportamiento multilingüe dependerá del base y no está evaluado.
- Riesgo de alucinación: heredado del modelo base; el adaptador no documenta mitigaciones.
- Precisión FP64: las operaciones en doble precisión pueden degradar el throughput en GPUs de consumo, que tienen menor rendimiento FP64 que FP32/FP16.
- Sesgos: no documentados; se heredan los del corpus de entrenamiento de Gemma 2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Polydim-Einsof/gemma2_2b_PMTP_polydim_einsof
- Modelo base: https://huggingface.co/google/gemma-2-2b
- DOI principal (Zenodo/CERN): https://doi.org/10.5281/zenodo.21136742
- DOI secundario (Zenodo/CERN): https://doi.org/10.5281/zenodo.21209973
- Preprint en HAL (CNRS): https://hal.science/hal-05847496v1
- OSF: https://osf.io/za3s7
- ORCID del autor: https://orcid.org/0009-0001-2787-6067
- Repositorio de artículos canónicos: https://huggingface.co/datasets/Polydim-Einsof/POLYDIM-EINSOF-Canonical-Papers-V1550
