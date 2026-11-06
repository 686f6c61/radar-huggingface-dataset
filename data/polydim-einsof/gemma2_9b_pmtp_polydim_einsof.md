# Polydim-Einsof/gemma2_9b_PMTP_polydim_einsof

## Resumen

`gemma2_9b_PMTP_polydim_einsof` es un adaptador de pesos publicado por el investigador independiente Ariel García Traba bajo la iniciativa POLYDIM / EinsofOS, construido sobre el modelo base `google/gemma-2-9b`. Se presenta como una implementación del llamado Polydim Memory Transfer Protocol (PMTP), que proyecta los estados ocultos del modelo sobre la variedad de Stiefel St(2048, 3584) en lugar de serializar la información intermedia como tokens 1D. El autor lo describe como un mecanismo de "razonamiento latente" continuo en precisión FP64, con un "protocolo Alan Turing" parametrizable mediante `turing_depth`.

El repositorio es notablemente pequeño (0,1 GB), lo que es coherente con un adaptador y no con un modelo completo de 9 000 millones de parámetros. La model card declara métricas de latencia (32,56 ms para `turing_depth=1`, 57,35 ms para `turing_depth=10`) y un defecto de ortogonalidad de 1,33e-15 en FP64, junto con referencias a DOIs de Zenodo, HAL, OSF y Jxiv.

Es relevante ahora por su enfoque poco convencional: propone sustituir la comunicación entre pasos de razonamiento basada en tokens por una transferencia de estados latentes de alta dimensión. No obstante, la información pública disponible es escasa, no incluye evaluaciones de benchmarks estándar y el pipeline declarado es `feature-extraction`, no generación de texto, lo que conviene tener en cuenta antes de evaluarlo para uso productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de proyección sobre la variedad de Stiefel St(2048, 3584); modelo base transformer `google/gemma-2-9b` |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; el modelo base Gemma 2 9B tiene 9,24B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Gemma 2 9B: 8 192 tokens, según la documentación oficial de Google) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors FP64; el modelo base admite las cuantizaciones habituales de Gemma 2) |
| Idiomas soportados | No disponible en la model card; el modelo base Gemma 2 soporta principalmente inglés y varios idiomas adicionales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_weights.safetensors`, `adapter_model.safetensors`), `adapter_config.json`, `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El adaptador se describe como una matriz de proyección W en IEEE-754 FP64 que mapea el espacio latente de dimensión 3584 (el `hidden_size` de Gemma 2 9B) a una representación de dimensión 2048 sobre la variedad de Stiefel. La motivación declarada es eliminar la "serialización 1D" de tokens entre pasos de razonamiento, sustituyéndola por transferencia binaria de estados latentes en float64. El autor denomina a este mecanismo "zero-worm" y lo contrapone a la comunicación basada en cadenas de texto.

El componente "Alan Turing Protocol" expone un parámetro `turing_depth` (con alias `einsof_depth`, `turing`, `einsof`) que va de 0 a 50 y define modos operativos: `IDENTITY_BYPASS` (0), `FAST_REFLEX` (1, una proyección isométrica), `RED_TEAM_DELIBERATION` (2-20, contracción riemanniana iterativa y autocrítica adversarial) y `DEEP_TURING_EXPLOSION` (21-50, demostración formal de teoremas y verificación antisicofántica). No se especifican en la información disponible los datos de entrenamiento, el número de tokens, ni si hubo RLHF, DPO o ajuste fino supervisado. Tampoco se detalla el procedimiento de obtención de la matriz de proyección ni su método de validación más allá del defecto de ortogonalidad declarado.

## Capacidades

- Extracción de características (`feature-extraction`), que es el pipeline declarado en Hugging Face.
- Razonamiento latente multi-paso mediante el parámetro `turing_depth`, con modos de deliberación y verificación según la model card.
- Proyección continua de estados ocultos sobre la variedad de Stiefel, sin serialización a tokens intermedios.
- Despliegue mediante Ollama a través del `Modelfile` incluido, con temperatura calibrada a 0,07.
- Capacidades heredadas del modelo base Gemma 2 9B (generación de texto, código, matemáticas, multilingüismo), aunque no se documenta explícitamente su preservación tras aplicar el adaptador.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcialmente cubierto por el "Turing Protocol", sin evidencia empírica publicada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en razonamiento latente: el adaptador permite experimentar con transferencia de estados ocultos entre pasos de cómputo sin materializar tokens intermedios, útil para estudiar alternativas a las cadenas de pensamiento basadas en texto.
- Experimentación con variedades de Stiefel: investigadores en geometría diferencial aplicada a aprendizaje profundo pueden reproducir la proyección St(2048, 3584) y medir el defecto de ortogonalidad declarado (1,33e-15) en su propio hardware.
- Pruebas de protocolos de deliberación: los modos `RED_TEAM_DELIBERATION` (profundidad 2-20) permiten evaluar estrategias de autocrítica iterativa con latencias controladas (32,56 ms a profundidad 1, 57,35 ms a profundidad 10).
- Despliegue local con Ollama: el `Modelfile` incluido facilita probar el adaptador en entornos de desarrollo sin infraestructura adicional, siempre que se disponga del modelo base Gemma 2 9B.
- Extracción de características para pipelines de retrieval o clasificación: al declararse `feature-extraction`, puede integrarse en sistemas que necesiten representaciones vectoriales del texto, aunque no hay evaluación publicada de su calidad en esta tarea.
- Reproducibilidad científica: los DOIs de Zenodo y HAL permiten citar y verificar los artefactos asociados en trabajos académicos sobre comunicación entre procesos de IA de alta dimensión.
- Evaluación comparativa de protocolos de razonamiento: útil como baseline alternativo frente a métodos de chain-of-thought o tree-of-thought en estudios experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas de latencia y precisión numérica:

| Metrica | Valor declarado |
|---|---|
| Defecto maximo de ortogonalidad (FP64) | 1,33e-15 |
| Error de norma (Neumaier) | ≤ 1e-15 |
| Latencia con `turing_depth=1` | 32,56 ms |
| Latencia con `turing_depth=10` | 57,35 ms |
| Tokens consumidos en razonamiento inter-hop | 0 |
| Mapeo de dimension latente | 3584 → 2048 |

No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB, pero requiere cargar el modelo base Gemma 2 9B (aproximadamente 18 GB en FP16, 9-10 GB en cuantización de 4 bits).
- VRAM estimada para inferencia: ~20 GB en FP16 con el modelo base; ~10-12 GB con cuantización de 4 bits; el adaptador FP64 añade una huella adicional pequeña pero no cuantificada en la información disponible.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4090 o GPUs con 12-16 GB para cuantización de 4-8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y GPUs con al menos 12 GB usando cuantización.
- Opciones de despliegue: Ollama (el repositorio incluye `Modelfile`); para el modelo base, vLLM, TGI o llama.cpp según el formato de pesos empleado.
- Latencia y throughput: solo se declaran latencias del adaptador (32,56 ms y 57,35 ms para profundidades 1 y 10); no hay datos de throughput de generación ni de latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gemma2_9b_PMTP_polydim_einsof` | Adaptador sobre Gemma 2 9B (9,24B base) | No disponible (base: 8 192) | Razonamiento latente sobre variedad de Stiefel | Apache 2.0 | Hugging Face, 0 descargas |
| `google/gemma-2-9b` | 9,24B | 8 192 | Transformer decoder estándar | Gemma Terms of Use | Hugging Face, ampliamente usado |
| `google/gemma-2-9b-it` | 9,24B | 8 192 | Transformer decoder con ajuste instructivo | Gemma Terms of Use | Hugging Face, ampliamente usado |
| `meta-llama/Llama-3.1-8B` | 8,03B | 131 072 | Transformer decoder | Llama 3.1 Community License | Hugging Face, ampliamente usado |

La comparación directa con alternativas establecidas es difícil porque no hay benchmarks publicados del adaptador y su pipeline declarado (`feature-extraction`) difiere del de los modelos de chat. La licencia Apache 2.0 del adaptador es más permisiva que las licencias de Gemma y Llama, pero el uso del modelo base sigue sujeto a los términos de Google.

## Limitaciones y advertencias

- No hay benchmarks públicos que validen las capacidades declaradas de razonamiento latente ni la calidad de las representaciones extraídas.
- El pipeline declarado es `feature-extraction`, no `text-generation`; usarlo como modelo conversacional requiere verificar la integración con el modelo base.
- La model card contiene terminología y afirmaciones no contrastadas ("zero-worm", "DEEP_TURING_EXPLOSION", "anti-sycophancy") sin evidencia empírica publicada en la información disponible.
- El adaptador se distribuye en FP64, lo que puede introducir incompatibilidades o sobrecoste en pipelines optimizados para FP16/BF16.
- Riesgo de alucinación: heredado del modelo base Gemma 2 9B; no se documenta mitigación específica.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base.
- Idiomas: no se especifican en la model card; el modelo base está orientado principalmente al inglés.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el modelo base Gemma 2 está sujeto a los Gemma Terms of Use, que incluyen restricciones de uso comercial y de redistribución.
- El repositorio tiene 0 descargas y 0 likes, sin validación por parte de la comunidad.
- Las fechas de creación y actualización (octubre-noviembre de 2026) y los DOIs asociados no han podido verificarse en la información proporcionada.
- No hay información sobre el proceso de entrenamiento, los datos utilizados ni la metodología de evaluación del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/Polydim-Einsof/gemma2_9b_PMTP_polydim_einsof
- Modelo base: https://huggingface.co/google/gemma-2-9b
- DOI primario (Zenodo/CERN): https://doi.org/10.5281/zenodo.21136742
- DOI secundario (Zenodo/CERN): https://doi.org/10.5281/zenodo.21209973
- HAL Open Science: https://hal.science/hal-05847496v1
- OSF: https://osf.io/za3s7
- ORCID del autor: https://orcid.org/0009-0001-2787-6067
- Repositorio de papers canónicos: https://huggingface.co/datasets/Polydim-Einsof/POLYDIM-EINSOF-Canonical-Papers-V1550
