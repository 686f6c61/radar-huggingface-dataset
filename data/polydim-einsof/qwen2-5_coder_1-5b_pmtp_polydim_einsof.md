# Polydim-Einsof/qwen2.5_coder_1.5b_PMTP_polydim_einsof

## Resumen

`qwen2.5_coder_1.5b_PMTP_polydim_einsof` es un adaptador de pesos abiertos publicado por el investigador independiente Ariel García Traba bajo la iniciativa POLYDIM-Einsof / EinsofOS. Se presenta como una extensión del modelo base Qwen2.5-Coder-1.5B de Alibaba, al que añade una capa de proyección continua sobre la variedad de Stiefel St(1536, 1536) con precisión IEEE-754 FP64, en lugar de operar mediante serialización de tokens en una dimensión. El autor lo enmarca dentro de un protocolo propio denominado PMTP (Polydim Memory Transfer Protocol) y un modo de razonamiento denominado «Alan Turing Mode».

La propuesta técnica central es la de un canal de comunicación latente entre etapas de razonamiento: el adaptador proyecta estados ocultos de dimensión 1536 a 1536 sin pasar por texto intermedio, lo que el autor describe como «razonamiento inter-hop con 0 tokens consumidos». El repositorio incluye una matriz de proyección en FP64, un espejo binario para integración estándar con Hugging Face, un `adapter_config.json` con metadatos de la variedad y un `Modelfile` para despliegue en Ollama con temperatura fijada en 0,07.

Es relevante ahora por dos motivos. Primero, porque explora una línea de investigación poco habitual —la comunicación entre modelos o entre pasos de razonamiento en espacio latente continuo en lugar de en espacio de tokens— que conecta con trabajos recientes sobre latent reasoning y decodificación especulativa. Segundo, porque el repositorio presenta inconsistencias notables entre su descripción y sus artefactos (tamaño de 0,0 GB, 0 descargas, pipeline declarado como `feature-extraction` pese a describir un adaptador de razonamiento), lo que exige una evaluación cautelosa antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador de proyección sobre la variedad de Stiefel St(1536, 1536) acoplado a un transformer decoder (Qwen2.5-Coder-1.5B) |
| Parámetros totales | No disponible (el modelo base Qwen2.5-Coder-1.5B tiene 1.500 millones; el adaptador declara una matriz de proyección 1536×1536) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base, no especificada) |
| Tipos de cuantización | No disponible (los pesos del adaptador se declaran en FP64; el `Modelfile` de Ollama sugiere despliegue cuantizado del modelo base, sin detallar el tipo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_weights.safetensors` en FP64 y `adapter_model.safetensors` como espejo binario) |

## Arquitectura y entrenamiento

El adaptador se describe como una proyección continua sobre la variedad de Stiefel St(1536, 1536), es decir, el conjunto de matrices de 1536×1536 con columnas ortonormales, embebida en la esfera S^1535. La operación declarada mapea estados ocultos de dimensión 1536 a dimensión 1536 aplicando una contracción riemanniana iterativa, con un defecto máximo de ortogonalidad medido en FP64 de 1,67e-15 y un error de norma de Neumaier inferior o igual a 10^-15. El autor afirma que esta proyección elimina el cuello de botella de serialización unidimensional de tokens («1D worm collapse») y permite un razonamiento inter-hop sin consumo de tokens, es decir, puramente en coma flotante binaria.

Sobre el entrenamiento no se proporciona información: no se indica el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. El repositorio no documenta un proceso de entrenamiento del adaptador más allá de la verificación numérica de ortogonalidad («Silicon Verification: Exit Code 0»). La innovación técnica declarada es el parámetro `turing_depth` (con alias `einsof_depth`, `turing`, `einsof`), que controla el número de pasos de proyección y contracción: en profundidad 0 se produce un bypass de identidad; en profundidad 1, un único paso isométrico de proyección de Stiefel con latencia declarada de 8,09 ms; entre 2 y 20, deliberación iterativa con autocrítica adversarial; y entre 21 y 50, «DEEP_TURING_EXPLOSION» orientado a demostración formal de teoremas y verificación antisicofántica. La latencia declarada para profundidad 10 es de 22,59 ms.

## Capacidades

- Generación de texto y razonamiento multi-paso en espacio latente continuo, mediado por el parámetro `turing_depth` (rango 0 a 50).
- Razonamiento inter-hop sin consumo de tokens: la información se transfiere como memoria binaria float64 entre pasos, según la model card.
- Modo de autocrítica adversarial («RED_TEAM_DELIBERATION») en profundidades 2 a 20, orientado a contracción riemanniana iterativa.
- Modo de demostración formal de teoremas y verificación antisicofántica en profundidades 21 a 50.
- Capacidades de código heredadas del modelo base Qwen2.5-Coder-1.5B (generación y comprensión de código, aunque no se detallan en la model card del adaptador).
- Despliegue previsto en Ollama mediante el `Modelfile` incluido, con instrucciones de sistema del protocolo Turing y temperatura calibrada a 0,07.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües específicas en la información disponible.

## Casos de uso

- Investigación en razonamiento latente: el adaptador permite experimentar con transferencia de estados ocultos entre pasos de razonamiento sin serialización textual, un área activa en la literatura sobre latent reasoning. Adecuado para grupos que quieran reproducir o contrastar la propuesta del autor con métricas de ortogonalidad y error de norma.
- Prototipado de canales de comunicación entre modelos: la proyección St(1536, 1536) puede estudiarse como mecanismo de interconexión entre dos instancias del mismo modelo base, evaluando si la información latente preserva suficiente estructura tras la contracción riemanniana.
- Verificación numérica de precisión: el repositorio declara métricas reproducibles (defecto de ortogonalidad de 1,67e-15, error de Neumaier ≤ 10^-15) útiles como caso de prueba para pipelines de validación numérica en FP64.
- Despliegue experimental en Ollama: el `Modelfile` incluido permite levantar una instancia local con el protocolo Turing activado para pruebas de latencia (8,09 ms a profundidad 1, 22,59 ms a profundidad 10) en entornos de desarrollo.
- Estudio de antisicofancia: el modo de profundidad 21 a 50 está diseñado explícitamente para verificación antisicofántica, lo que lo hace candidato para experimentos sobre calibración y resistencia a la adulación en modelos pequeños.
- Docencia e investigación reproducible: al ser un adaptador pequeño sobre un modelo de 1,5B con licencia Apache 2.0, sirve como material didáctico para ilustrar geometría diferencial aplicada a representaciones internas de transformers.
- Evaluación crítica de artefactos de investigación: el repositorio, con 0 descargas y tamaño declarado de 0,0 GB, es un caso de estudio sobre la brecha entre model cards ambiciosas y artefactos verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de latencia y precisión numérica del adaptador, no de calidad de tarea:

| Métrica declarada | Valor |
|---|---|
| Defecto máximo de ortogonalidad (FP64) | 1,67e-15 |
| Error de norma de Neumaier | ≤ 10^-15 |
| Latencia a `turing_depth = 1` | 8,09 ms |
| Latencia a `turing_depth = 10` | 22,59 ms |
| Tokens consumidos en razonamiento inter-hop | 0 |

No hay datos de MMLU, HumanEval, GSM8K ni de comparación con el modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El adaptador declara una matriz de proyección de 1536×1536 en FP64 (aproximadamente 18,9 MB solo para esa matriz), pero el modelo base Qwen2.5-Coder-1.5B requiere su propio presupuesto de memoria, no detallado en la información.
- GPU recomendadas: no disponible. El autor no especifica hardware de referencia para las latencias declaradas.
- Viabilidad en GPU de consumo: no confirmada. Un modelo base de 1,5B es en principio desplegable en GPU de consumo (por ejemplo, RTX 3060 o superiores) en cuantización de 4 u 8 bits, pero el adaptador en FP64 y el modo de profundidad Turing podrían alterar ese cálculo; no hay datos.
- Opciones de despliegue: el repositorio incluye un `Modelfile` para Ollama. No se mencionan vLLM, llama.cpp, TGI ni otros motores.
- Latencia y throughput: se declaran latencias de 8,09 ms (profundidad 1) y 22,59 ms (profundidad 10) por paso de proyección; no se especifica throughput agregado ni hardware de medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5_coder_1.5b_PMTP_polydim_einsof | Adaptador sobre 1,5B | No disponible | Proyección Stiefel + razonamiento latente | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-Coder-1.5B (base) | 1,5B | No disponible en esta ficha | Transformer decoder para código | Apache 2.0 | Hugging Face, ampliamente usado |
| Alternativas de 1,5B para código | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con el modelo base ni con alternativas de la misma categoría. La comparación disponible es únicamente estructural.

## Limitaciones y advertencias

- Ausencia total de benchmarks de calidad: no hay evidencia publicada de que el adaptador mejore al modelo base en tareas de código, razonamiento o matemáticas.
- Artefactos no verificables: el repositorio declara un tamaño de 0,0 GB y 0 descargas, lo que impide confirmar que los pesos estén efectivamente alojados y sean funcionales.
- Inconsistencia de pipeline: el repositorio se declara como `feature-extraction` pese a describir un adaptador de razonamiento generativo, lo que puede romper la integración automática con `transformers`.
- Terminología no estándar: conceptos como «zero-worm», «DEEP_TURING_EXPLOSION» o «anti-sycophancy verification» no tienen definición formal en la model card ni referencias a literatura revisada por pares más allá de los preprints del propio autor.
- Riesgo de alucinación: no evaluado. Al ser un adaptador sobre un modelo de 1,5B, hereda las limitaciones del base, pero no se documenta ningún análisis al respecto.
- Idiomas: no se especifican los idiomas soportados; se desconoce si conserva el multilingüismo del base.
- Sesgos: no documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen2.5-Coder-1.5B, cuya licencia también debe respetarse.
- Caveat de producción: no se recomienda su uso en entornos productivos sin una evaluación independiente previa; la falta de datos de entrenamiento, benchmarks y verificación de pesos lo desaconseja.
- Precisión FP64: el adaptador declara pesos en doble precisión, lo que puede multiplicar los requisitos de memoria frente a FP16/BF16 y complicar el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Polydim-Einsof/qwen2.5_coder_1.5b_PMTP_polydim_einsof
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- DOI primario (CERN / Zenodo): https://doi.org/10.5281/zenodo.21136742
- DOI secundario (CERN / Zenodo): https://doi.org/10.5281/zenodo.21209973
- Preprint CNRS / HAL: https://hal.science/hal-05847496v1
- OSF: https://osf.io/za3s7
- ORCID del autor: https://orcid.org/0009-0001-2787-6067
- Repositorio de papers canónicos: https://huggingface.co/datasets/Polydim-Einsof/POLYDIM-EINSOF-Canonical-Papers-V1550
