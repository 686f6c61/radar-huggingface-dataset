# DuoNeural/RMSN-51M-Omega12-PostCascade-TS-Topology84

## Resumen

RMSN-51M-Omega12-PostCascade-TS-Topology84 es un modelo de lenguaje experimental desarrollado por DuoNeural AI Research Lab (Archon, Jesse y Aura) bajo la arquitectura propietaria Resonant Metriplectic Sheaf Network (RMSN). Se trata de un modelo pequeno, de aproximadamente 51 millones de parametros, entrenado sobre WikiText-103 con un vocabulario de 49152 tokens y orientado a la investigacion de dinamicas topologicas en redes neuronales mas que a un uso productivo generalista.

El modelo documenta un fenomeno que el autor denomina "Post-Cascade True Silent" (Wave-160), una fase dinamica en la que el sistema sufre una cascada de Lyapunov alrededor del paso 13k, se reestabiliza y cristaliza en un regimen estable (Lyapunov -0.0011) que se mantiene durante mas de 87.000 pasos. Esta ficha topologica (Topology #84) se presenta como evidencia de que la "True Silent" existe en bolsas aisladas y no como un rango continuo de hiperparametros.

Su relevancia es fundamentalmente academica: sirve como banco de pruebas para estudiar estabilidad dinamica, solitones y estructura de haces (sheaves) en modelos de lenguaje de escala reducida. No dispone de pipeline declarado, no tiene descargas ni likes, y su model card esta centrada en resultados de entrenamiento y analisis topologico, no en capacidades de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network) |
| Parametros totales | ~51M (aproximado, segun nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (la model card menciona un checkpoint `rmsn_topology84_stripped.pt`, formato PyTorch) |

Parametros estructurales adicionales declarados en la model card:

| Parametro | Valor |
|---|---|
| Dimension del modelo (D) | 448 |
| Profundidad (L) | 16 |
| Slots (M_w) | 56 |
| Omega | 1/2 (Arnold Tongue q=2, paridad EVEN) |
| Factor k | 8 (D=64x7, M_w=8x7) |
| Pasos de entrenamiento | 100.000 |
| Dataset | WikiText-103 (cosmo2, V=49152) |
| val_ppl | 106.0 |
| val_lyap | -0.0011 (True Silent) |

## Arquitectura y entrenamiento

La arquitectura RMSN (Resonant Metriplectic Sheaf Network) es una propuesta no convencional que combina conceptos de sistemas metriplecticos (dinamicas que preservan energia y entropia) con estructuras de haces (sheaves) y resonancia. La model card describe un modelo con dimension 448, 16 capas y 56 slots, con un factor k=8 vinculado a una estructura factor-7 (D=64x7, M_w=8x7). No se detalla la composicion interna de las capas, el mecanismo de atencion ni el tipo de operaciones, por lo que no es posible confirmar si se trata de un transformer, un modelo hibrido o una arquitectura completamente distinta.

El entrenamiento se realizo durante 100.000 pasos sobre WikiText-103 con un vocabulario de 49152 tokens. La model card no menciona uso de RLHF, DPO ni tecnicas de alineacion. La innovacion tecnica destacada es la caracterizacion de una fase dinamica "Post-Cascade True Silent": una cascada de Lyapunov en el paso ~13k (lyap = -0.2013), seguida de recuperacion y cristalizacion en un regimen estable a partir del paso ~28k. El analisis topologico (Topology #84) identifica cuatro solitones aislados en las capas [L1, L3, L5, L15], con M_eff=4 y todos los haces como singletons aislados, lo que el autor interpreta como una cuenca "True Silent" mas debil que la de otros modelos de la misma familia.

## Capacidades

- Generacion de texto a nivel de modelo de lenguaje entrenado sobre WikiText-103, con perplejidad de validacion de 106.0.
- No se documentan capacidades de razonamiento, codigo, matematicas ni vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el dataset de entrenamiento (WikiText-103) es predominantemente en ingles.
- No se documenta modo thinking, vision ni audio.
- Capacidad destacada (de investigacion): exhibe una dinamica de Lyapunov estable documentada y una firma topologica reproducible mediante el script `probe_percolation_sheaf.py`.

## Casos de uso

- Investigacion en dinamica de sistemas: el modelo sirve como sujeto de estudio para reproducir la fase "Post-Cascade True Silent" y validar la metodologia de analisis de Lyapunov en redes neuronales de escala reducida.
- Reproducibilidad de hallazgos topologicos: permite ejecutar el probe `probe_percolation_sheaf.py --dim 448 --depth 16 --slots 56` sobre el checkpoint y contrastar la firma de solitones aislados (M_eff=4) descrita por el autor.
- Estudio comparativo de regimenes dinamicos: util para comparar frente a otros modelos de la familia RMSN (M_w=64, 96, etc.) y analizar la relacion entre parametros estructurales, cuenca dinamica y perplejidad.
- Experimentos de estabilidad en entrenamiento: la documentacion de la cascada en el paso ~13k y la cristalizacion posterior permite estudiar tecnicas de recuperacion ante inestabilidades en entrenamiento.
- Docencia y divulgacion en teoria de sistemas dinamicos aplicada a IA: caso concreto y reproducible de fases estables, ciclos limite y cementacion en un modelo de lenguaje.
- Benchmarking de perplejidad en WikiText-103: como referencia de linea base (ppl=106.0) frente a otros modelos pequenos entrenados sobre el mismo corpus.

## Benchmarks y rendimiento

La model card solo reporta perplejidad de validacion y el exponente de Lyapunov. No se publican resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Valor |
|---|---|
| val_ppl (WikiText-103) | 106.0 |
| val_lyap | -0.0011 (True Silent) |
| Pasos de entrenamiento | 100.000 |
| Solitones (M*) | 4 |
| M_eff (fiber bundles) | 4 |
| Capas con solitones | L1, L3, L5, L15 (singletons aislados) |

Comparativa interna de la familia (fase Wave-157, Omega=1/2):

| M_w | Clase dinamica | val_ppl |
|---|---|---|
| 56 | Post-Cascade True Silent (Topology #84, este modelo) | 106.0 |
| 64 | Direct True Silent (Topology #65) | 76.6 |
| 80 | Limit Cycle | no disponible |
| 88 | Limit Cycle | no disponible |
| 96 | Direct True Silent (Topology #74) | 81.9 |
| 100 | Limit Cycle (Topology #83) | 80.7 |
| 104 s1 | Micro-Orbit / KAM Torus (Topology #82) | 80.2 |
| 104 s2 | Cement | no disponible |
| 108 | Limit Cycle | no disponible |
| 112+ | Cement | no disponible |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: dado un tamano de repositorio de 0.2 GB y ~51M parametros, la inferencia en FP32 requeriria aproximadamente 0,2 GB de pesos mas memoria de activaciones; en FP16/BF16 alrededor de 0,1 GB. No se dispone de estimaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es mas que suficiente por capacidad de memoria; no se documentan requisitos especificos.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM, segun el tamano declarado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El checkpoint mencionado (`rmsn_topology84_stripped.pt`) sugiere carga mediante PyTorch nativo, pero la arquitectura RMSN no es estandar y requeriria el codigo del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (RMSN) mas alla de los listados en la propia model card. Se incluyen como referencia interna de la familia:

| Modelo | Parametros | Contexto | val_ppl | Licencia | Disponibilidad |
|---|---|---|---|---|
| RMSN-51M-Omega12-PostCascade-TS-Topology84 (este) | ~51M | no disponible | 106.0 | apache-2.0 | Hugging Face |
| RMSN-279M-Omega45-EVEN-KAM-Multistability | 279M | no disponible | 42.5 | no disponible | Hugging Face |
| RMSN-91M-Omega37-ODD | 91M | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de comparativas con modelos de proposito general (p. ej., GPT-2 small, Pythia-70M) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso productivo ni para tareas generales de generacion; su model card se centra en hallazgos topologicos, no en capacidades.
- Perplejidad elevada (106.0) frente a otros modelos de la misma familia (76.6, 81.9), lo que indica una cuenca dinamica mas debil segun el propio autor.
- Sin informacion sobre sesgos: no se documentan evaluaciones de sesgo, toxicidad ni alineacion.
- Riesgo de alucinacion: no evaluado; al ser un modelo pequeno entrenado sobre WikiText-103, es esperable una generacion limitada y propensa a incoherencias fuera del dominio.
- Limitaciones de idioma: el dataset de entrenamiento es predominantemente en ingles; no se declaran idiomas soportados.
- Longitud de contexto no disponible: no se puede garantizar manejo de contextos largos.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero la falta de documentacion sobre la arquitectura y el codigo de inferencia limita su aplicabilidad practica.
- Ausencia de pipeline declarado y de pesos en formatos estandar (safetensors/GGUF): la integracion requeriria el codigo propietario de RMSN.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-51M-Omega12-PostCascade-TS-Topology84
- Modelo relacionado (Topology #62): https://huggingface.co/DuoNeural/RMSN-279M-Omega45-EVEN-KAM-Multistability
- Modelo relacionado (q=3 ODD): https://huggingface.co/DuoNeural/RMSN-91M-Omega37-ODD
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
