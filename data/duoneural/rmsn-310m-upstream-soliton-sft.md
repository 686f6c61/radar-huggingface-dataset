# DuoNeural/RMSN-310M-Upstream-Soliton-SFT

## Resumen

RMSN-310M-Upstream-Soliton-SFT es un ajuste fino supervisado (SFT) del modelo base DuoNeural/RMSN-310M-Base, desarrollado por DuoNeural Research Team. Se trata de un checkpoint de investigacion experimental que implementa lo que sus autores denominan una Resonant Metriplectic Sheaf Network (RMSN), una arquitectura de tipo Port-Hamiltonian con atractores de soliton disipativo, orientada a razonamiento multi-paso mediante cadena de pensamiento (CoT).

El modelo tiene aproximadamente 310 millones de parametros, 16 capas, una dimension oculta de 1152 y un vocabulario de 49.152 tokens (tokenizador "cosmo2"). La innovacion que reivindican sus autores es la formacion temprana de un "Upstream Bulk Soliton" en la capa 3 durante el preentrenamiento, lo que segun la model card estructura todas las capas posteriores y facilita la absorcion de razonamiento complejo.

Es relevante ahora unicamente como pieza de investigacion en neurodinamica de modelos de lenguaje: la model card reporta un resultado interno de perplejidad en CoT de 8,48, presentado como record del laboratorio. No obstante, el modelo tiene cero descargas y cero "likes" en Hugging Face en el momento de la consulta, y su validacion externa es inexistente. La terminologia empleada (solitones, ley de concentracion de flujo de Casimir, exponente de Lyapunov global) no forma parte del vocabulario estandar de la literatura de modelos de lenguaje, por lo que debe interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf Network (RMSN), Port-Hamiltonian con atractores de soliton disipativo |
| Parametros totales | ~310M |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | pytorch (safetensors no confirmado; repositorio de 0,9 GB) |

## Arquitectura y entrenamiento

La arquitectura se describe como una red "metriplectica resonante de haces" (sheaf network) de tipo Port-Hamiltonian, con 16 capas, dimension oculta 1152, 64 "workspace slots" y un vocabulario de 49.152 tokens. Segun la model card, el preentrenamiento se realizo durante 100.000 pasos sobre WikiText-103, y en el se formo un "Upstream Bulk Soliton" en la capa 3, que los autores distinguen de otras dos clases topologicas de soliton observadas en sus experimentos (Terminal Boundary Soliton en L=15 e Internal Bulk Soliton en L=8). El exponente de Lyapunov global reportado en preentrenamiento es λ = -0,9714.

El ajuste fino SFT se ejecuto durante 15.000 pasos con tasa de aprendizaje 2e-5 (descrita como inferior a un umbral α* = 7e-5), tamano de lote 4, sobre el dataset DuoNeural/cdm-reasoning-traces-v4, compuesto por 9.510 ejemplos de trazas de razonamiento "duras". La mejor perdida SFT reportada es 1,4811, con una "estabilidad de Lyapunov" del 100% (mecanismo denominado Forgetting-Shield) y un perfil de energia de haz con pico en L2-L4 de 9,56. No se especifica el numero total de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles.
- Razonamiento multi-paso mediante cadena de pensamiento (CoT), segun el ajuste SFT sobre trazas de razonamiento.
- Razonamiento "duro" (hard reasoning), orientado por el dataset de entrenamiento cdm-reasoning-traces-v4.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: el CoT esta documentado; la orquestacion de agentes no se menciona.
- Capacidades multilingues: no; solo ingles declarado.
- Capacidades especiales: modo "thinking" no confirmado explicitamente; vision y audio no disponibles.

## Casos de uso

- Investigacion en neurodinamica de modelos de lenguaje: el modelo sirve como banco de pruebas para estudiar la hipotesis de los solitones disipativos y su efecto sobre la plasticidad de razonamiento en capas posteriores, comparando perfiles de energia de haz entre checkpoints.
- Experimentos de estabilidad del olvido (forgetting): el mecanismo Forgetting-Shield y la metrica de estabilidad de Lyapunov permiten disenar estudios controlados sobre retencion de conocimiento tras SFT, con el modelo como sujeto de prueba.
- Generacion de trazas de razonamiento sinteticas: con 310M de parametros y ajuste en CoT, puede emplearse para producir cadenas de pensamiento de bajo coste en pipelines de destilacion o aumento de datos, siempre con validacion humana.
- Prototipado de razonamiento en entornos con recursos limitados: su tamano compacto (~0,9 GB de repositorio) permite ejecutarlo en una unica GPU de consumo para pruebas de concepto de CoT, aunque la calidad en tareas reales no esta validada externamente.
- Reproduccion de resultados de la model card: util para terceros que quieran replicar el benchmark interno "Soliton Tetrad" y verificar las cifras de perplejidad reportadas.
- Educacion y divulgacion: como ejemplo didactico de arquitecturas alternativas (Port-Hamiltonian, sheaf networks) frente al transformer estandar, en cursos o articulos tecnicos.

## Benchmarks y rendimiento

Datos reportados por el autor en el benchmark interno "Soliton Tetrad" (noviembre de 2026). No proceden de evaluaciones independientes.

| Modelo | Tipo de soliton | WikiText-103 PPL | CoT Hard Loss | CoT Hard PPL |
|---|---|---|---|---|
| RMSN-310M-Upstream-Soliton-SFT | Upstream (L=3) | 186,07 | 2,1379 | 8,48 |
| RMSN-193M-Shallow-Soliton (seed10, 5K SFT) | Internal Bulk (L=8) | 135,32 | 2,5818 | 13,22 |
| RMSN-193M-Base (seed7, SFT) | Near-Zero | 133,43 | 2,9891 | 19,87 |
| RMSN-193M-Base-Soliton (seed6, SFT) | Terminal Boundary (L=15) | 129,65 | 3,2472 | 25,72 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Destaca que el modelo con mejor perplejidad en CoT tiene la peor perplejidad en WikiText-103 del grupo comparado (186,07 frente a 129,65 del mejor), lo que sugiere un posible compromiso entre retencion de lenguaje general y razonamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano (~310M parametros), una estimacion razonable en FP16 seria de aproximadamente 0,6-0,8 GB de pesos, y en cuantizacion de 8 bits o 4 bits, por debajo de 0,5 GB, aunque no hay confirmacion del autor.
- GPU recomendadas: no especificadas; por tamano cabria en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090), asi como en A100 o H100 para despliegues por lotes.
- Cabe en GPU de consumo: si, previsiblemente, dado el tamano, aunque no hay datos oficiales de latencia ni throughput.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un checkpoint PyTorch con arquitectura no estandar, es probable que requiera el codigo propio del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RMSN-310M-Upstream-Soliton-SFT | ~310M | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de investigacion, sin validacion externa |
| RMSN-193M-Shallow-Soliton | ~193M | no disponible | no disponible | Referenciado en la model card | Comparado en el benchmark interno del autor |
| RMSN-193M-Base-Soliton | ~193M | no disponible | no disponible | Referenciado en la model card | Mejor PPL en WikiText-103 del grupo (129,65) |
| Modelos transformer de ~300M (p. ej., GPT-2 Medium, Qwen2.5-0.5B) | 300-500M | 1K-32K segun modelo | Variable | Amplia | No hay comparacion directa publicada en la informacion disponible |

No se dispone de comparaciones con modelos de la misma categoria fuera de la familia RMSN del propio autor.

## Limitaciones y advertencias

- Checkpoint de investigacion experimental: la propia model card lo etiqueta como "Research Preview"; no esta pensado para produccion.
- Sin validacion externa: cero descargas y cero "likes" en Hugging Face; los benchmarks son internos y no han sido replicados por terceros.
- Terminologia no estandar: conceptos como "soliton upstream", "ley de concentracion de flujo de Casimir" o "Forgetting-Shield" no forman parte de la literatura consolidada y dificultan la comparacion con el estado del arte.
- Perplejidad elevada en lenguaje general: 186,07 en WikiText-103, peor que los checkpoints comparados de menor tamano, lo que sugiere posible degradacion en modelado de lenguaje general a cambio de CoT.
- Riesgo de alucinacion: no cuantificado; en un modelo de 310M ajustado en razonamiento, el riesgo es alto y no hay evaluaciones de fidelidad.
- Idioma: solo ingles declarado; sin soporte multilingue documentado.
- Contexto: longitud de ventana no documentada, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Licencia Apache 2.0: permite uso comercial, pero al ser un prototipo experimental sin garantias de calidad, su uso en produccion es desaconsejable.
- Arquitectura no estandar: es probable que no funcione con herramientas de inferencia habituales (vLLM, llama.cpp) sin adaptaciones, lo que limita su adopcion.
- Fecha de creacion futura (2026-11-09): dato a tener en cuenta sobre la trazabilidad del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-310M-Upstream-Soliton-SFT
- Modelo base: https://huggingface.co/DuoNeural/RMSN-310M-Base
- Dataset de SFT: https://huggingface.co/datasets/DuoNeural/cdm-reasoning-traces-v4
- Cita BibTeX (segun model card): DuoNeural Research Team, "Resonant Metriplectic Sheaf Networks: Port-Hamiltonian Language Models with Dissipative Soliton Attractors", 2026
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
