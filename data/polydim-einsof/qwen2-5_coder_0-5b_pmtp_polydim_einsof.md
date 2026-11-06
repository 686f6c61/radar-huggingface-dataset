# Polydim-Einsof/qwen2.5_coder_0.5b_PMTP_polydim_einsof

## Resumen

`qwen2.5_coder_0.5b_PMTP_polydim_einsof` es un adaptador de pesos abiertos publicado por el investigador independiente Ariel García Traba bajo la iniciativa POLYDIM-EINSOF / EinsofOS. Se construye sobre el modelo base Qwen/Qwen2.5-Coder-0.5B y se presenta como una implementación del llamado PMTP (Polydim Memory Transfer Protocol), que proyecta estados ocultos de forma continua sobre la variedad de Stiefel St(1024, 896), con el objetivo declarado de eliminar la serialización de tokens en formato 1D durante la comunicación entre procesos o "saltos" de razonamiento.

El modelo no es un modelo generativo de texto en el sentido convencional: la pipeline declarada en Hugging Face es `feature-extraction`, y el repositorio contiene matrices de proyección en FP64 (`adapter_weights.safetensors`, `adapter_model.safetensors`) junto con un `Modelfile` para despliegue en Ollama. La propuesta técnica central es el "Protocolo Alan Turing", un parámetro `turing_depth` (0 a 50) que controla el número de pasos de proyección isométrica y contracción riemanniana aplicados sobre los estados latentes, con modos que van desde el passthrough directo hasta la "prueba formal de teoremas" de alta profundidad.

La relevancia de esta ficha es doble: por un lado, documenta una propuesta heterodoxa de razonamiento latente continuo que difiere del paradigma habitual de chain-of-thought basado en tokens; por otro, advierte de que se trata de un artefacto de investigación independiente con cero descargas, sin benchmarks publicados y cuyas afirmaciones (defecto de ortogonalidad de 1.55e-15, latencias de 6.36 ms a profundidad 1) no han sido verificadas de forma independiente. El tamaño efectivo del repositorio es de 0.0 GB, lo que sugiere que los pesos del adaptador son de dimensión reducida en comparación con el modelo base de 0.5B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de proyección sobre variedad de Stiefel St(1024, 896); modelo base Qwen2.5-Coder-0.5B (transformer decoder-only) |
| Parametros totales | No disponible (modelo base: 0.5B; el adaptador es una matriz de proyección de dimensiones 896→1024) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos del adaptador en FP64 / IEEE-754) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_weights.safetensors`, `adapter_model.safetensors`); `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El artefacto se describe como un adaptador que proyecta de forma continua los estados ocultos del modelo base Qwen2.5-Coder-0.5B sobre la variedad de Stiefel St(1024, 896), un subconjunto de la esfera S^1023. La dimensión latente de entrada es 896 y la de salida 1024. La matriz de proyección se almacena en precisión FP64 (IEEE-754) y el autor reporta un defecto máximo de ortogonalidad de 1.55e-15 y un error de norma de Neumaier inferior o igual a 10^-15, métricas que apuntan a una implementación numéricamente estable de la proyección isométrica.

El denominado "Protocolo Alan Turing" expone el parámetro `turing_depth` (alias `einsof_depth`, `turing`, `einsof`) con cinco regímenes operativos: profundidad 0 (IDENTITY_BYPASS, passthrough directo), profundidad 1 (FAST_REFLEX, una única proyección isométrica de Stiefel, 6.36 ms), profundidades 2 a 20 (RED_TEAM_DELIBERATION, contracción riemanniana iterativa y autocrítica adversarial) y profundidades 21 a 50 (DEEP_TURING_EXPLOSION, prueba formal de teoremas y verificación antisicofántica). El autor afirma que el razonamiento entre saltos consume 0 tokens, al operar sobre memoria binaria float64 en lugar de cadenas de texto.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se detalla el procedimiento de calibración de la matriz de proyección más allá de la verificación numérica mencionada ("Silicon Verification: Exit Code 0"). El `Modelfile` incluido fija una temperatura de 0.07 e instrucciones de sistema asociadas al protocolo Turing, pero no se documenta el proceso de ajuste que produce esos pesos.

## Capacidades

- Extracción de características y proyección de estados ocultos sobre la variedad de Stiefel St(1024, 896), según la pipeline declarada (`feature-extraction`).
- Razonamiento latente continuo multi-paso controlado por el parámetro `turing_depth` (0 a 50), sin serialización intermedia a tokens.
- Modo de autocrítica adversarial ("RED_TEAM_DELIBERATION") para profundidades 2 a 20, orientado a la contracción riemanniana iterativa.
- Modo de verificación formal y antisicofántica ("DEEP_TURING_EXPLOSION") para profundidades 21 a 50, según la model card.
- Capacidades heredadas del modelo base Qwen2.5-Coder-0.5B (generación de código y texto), aunque el adaptador se distribuye como artefacto de feature-extraction y no como modelo generativo autónomo.
- Despliegue vía Ollama mediante el `Modelfile` incluido.
- Soporte de tool calling, function calling, agentes y multimodalidad: no disponible en la información proporcionada.

## Casos de uso

- Investigación en razonamiento latente continuo: el adaptador permite experimentar con proyecciones isométricas sobre la variedad de Stiefel como alternativa a las cadenas de pensamiento basadas en tokens, midiendo el efecto de `turing_depth` en tareas de verificación formal.
- Extracción de características geométricamente alineadas: al proyectar estados ocultos de 896 a 1024 dimensiones con defecto de ortogonalidad de 1.55e-15, puede emplearse como extractor para sistemas de recuperación o clasificación que requieran representaciones numéricamente estables.
- Reproducción de resultados numéricos: el uso de FP64 y del algoritmo de suma de Neumaier permite replicar cálculos de alta precisión en entornos de investigación donde la estabilidad numérica es crítica.
- Pruebas de concepto de comunicación entre procesos sin serialización de texto: el autor propone el protocolo como sustituto de la "1D worm collapse", útil para experimentar con IPC basado en tensores float64 entre agentes.
- Evaluación de autocrítica adversarial: los modos de profundidad 2 a 20 permiten estudiar si la contracción riemanniana iterativa reduce la sicofancia en modelos pequeños, comparando con el modelo base sin adaptador.
- Docencia y divulgación sobre geometría diferencial aplicada: la variedad de Stiefel y las proyecciones isométricas pueden ilustrarse con este artefacto en cursos de aprendizaje profundo geométrico.
- Despliegue experimental en Ollama: el `Modelfile` incluido facilita probar el adaptador en local con el modelo base de 0.5B, adecuado para entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas de latencia y precisión numérica del adaptador, que se recogen a continuación sin comparación con otros modelos:

| Metrica reportada por el autor | Valor |
|---|---|
| Defecto maximo de ortogonalidad (FP64) | 1.55e-15 |
| Error de norma de Neumaier | ≤ 10^-15 |
| Latencia a `turing_depth = 1` | 6.36 ms |
| Latencia a `turing_depth = 10` | 9.70 ms |
| Tokens consumidos en razonamiento entre saltos | 0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El modelo base Qwen2.5-Coder-0.5B requiere aproximadamente 1 GB en FP16 y menos de 1 GB en cuantizaciones de 4 bits; el adaptador añade una matriz de proyección de dimensiones 896×1024 en FP64 (unos 7 MB), por lo que el coste adicional es despreciable.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para el modelo base en FP16; el adaptador FP64 puede requerir soporte de doble precisión, limitado en GPUs de consumo (las GeForce tienen FP64 muy reducido frente a A100/H100).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, siempre que se acepte la penalización de FP64 en el adaptador.
- Opciones de despliegue: Ollama (mediante el `Modelfile` incluido), Hugging Face Transformers con safetensors, y potencialmente llama.cpp/vLLM para el modelo base, aunque la compatibilidad del adaptador con estos runners no está documentada.
- Latencia y throughput: el autor reporta 6.36 ms a profundidad 1 y 9.70 ms a profundidad 10 para la proyección; no se especifica el hardware de medida ni el throughput de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5_coder_0.5b_PMTP_polydim_einsof | 0.5B (base) + adaptador | No disponible | Razonamiento latente sobre variedad de Stiefel | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-Coder-0.5B | 0.5B | 32K (según documentación del modelo base) | Transformer decoder-only para código | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Qwen/Qwen2.5-Coder-1.5B | 1.5B | 32K | Transformer decoder-only para código | Apache 2.0 | Hugging Face |
| deepseek-ai/DeepSeek-Coder-1.3B | 1.3B | 16K | Transformer decoder-only para código | DeepSeek License | Hugging Face |

La comparación directa con modelos de razonamiento latente es limitada porque no se han identificado en la información disponible artefactos públicos equivalentes basados en proyecciones de Stiefel sobre Qwen2.5-Coder. La alternativa más cercana en tamaño y propósito es el propio modelo base sin adaptador.

## Limitaciones y advertencias

- Artefacto de investigación independiente con cero descargas y cero likes en el momento de la consulta; no consta validación por pares ni replicación externa de las métricas reportadas.
- Las afirmaciones de latencia (6.36 ms, 9.70 ms) y precisión numérica (1.55e-15) proceden exclusivamente de la model card del autor y no se especifica el hardware ni el protocolo de medida.
- La pipeline declarada es `feature-extraction`, no `text-generation`; el adaptador no está pensado para usarse como modelo conversacional autónomo sin el modelo base.
- No se documentan sesgos conocidos, datos de entrenamiento ni evaluación de alucinación; se desconoce el comportamiento del adaptador fuera de los escenarios descritos por el autor.
- Idiomas soportados no disponibles; las capacidades multilingües heredadas del modelo base no están verificadas en combinación con el adaptador.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de validación independiente desaconseja su uso en producción sin evaluación previa.
- La terminología empleada en la model card ("zero-worm", "turing explosion", "antisicofántica") no se corresponde con literatura consolidada, lo que dificulta la verificación de las afirmaciones.
- El uso intensivo de FP64 puede degradar el rendimiento en GPUs de consumo, donde la tasa de doble precisión es muy inferior a la de FP32/FP16.
- No se especifica la compatibilidad del adaptador con runners estándar (vLLM, TGI, llama.cpp) más allá de Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Polydim-Einsof/qwen2.5_coder_0.5b_PMTP_polydim_einsof
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B
- DOI principal (Zenodo/CERN): https://doi.org/10.5281/zenodo.21136742
- DOI secundario (Zenodo/CERN): https://doi.org/10.5281/zenodo.21209973
- Preprint CNRS/HAL: https://hal.science/hal-05847496v1
- OSF: https://osf.io/za3s7
- ORCID del autor: https://orcid.org/0009-0001-2787-6067
- Repositorio de papers canónicos: https://huggingface.co/datasets/Polydim-Einsof/POLYDIM-EINSOF-Canonical-Papers-V1550
