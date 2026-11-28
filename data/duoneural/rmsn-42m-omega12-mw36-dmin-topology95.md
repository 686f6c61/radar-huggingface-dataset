# DuoNeural/RMSN-42M-Omega12-mw36-Dmin-Topology95

## Resumen

RMSN-42M-Omega12-mw36-Dmin-Topology95 es un checkpoint de investigación de 41,5 millones de parámetros publicado por DuoNeural bajo la denominación Resonant Metriplectic Sheaf Network (RMSN). No se trata de un transformer convencional: el autor lo enmarca dentro de un programa de investigación propio sobre topologías de red y condiciones de resonancia (Arnold Tongue), con un mapa de fases topológicas que numera cada variante (en este caso, Topología #95). El checkpoint se presenta como un experimento de "Direct TS (no cascade) — partial-chain" con un valor de validación de perplejidad (val_ppl) de 129,0.

El interés del modelo es fundamentalmente científico y experimental, no de producto. La model card documenta un hallazgo concreto sobre una frontera crítica de dimensión mínima (D_min): con M_w=36 (3-smooth, v3=2) se predijo M_eff=4 mediante una sub-ley 3-ádica, pero se obtuvo M_eff=2, lo que el autor interpreta como confirmación de que la separación de canales Z_3 requiere D >= D_min (estimado en 400-500), y D=288 queda por debajo. Es, por tanto, un artefacto de un barrido sistemático de topologías más que un modelo listo para producción.

La relevancia actual es limitada fuera del círculo de investigación del autor: cero descargas, cero likes, sin pipeline declarado, sin idiomas especificados y sin benchmarks estándar (MMLU, HumanEval, GSM8K). Su valor está en la documentación del experimento y en la reproducibilidad del hallazgo topológico, no en capacidades de lenguaje verificadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network); no es un transformer estándar, según el autor |
| Parámetros totales | 41,5 M (41.500.000 aprox.) |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en .pt de PyTorch; no se ofrecen GGUF ni safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt, cargado con torch.load; pesos en ckpt['model']) |
| Dimensión (D) | 288 |
| Profundidad (L) | 16 |
| Ancho de slot (M_w) | 36 |
| Ω (Arnold Tongue) | 1/2 |
| M_eff (fiber bundles) | 2 |
| Topología | #95, Direct TS (no cascade), partial-chain |
| val_ppl | 129,0 |
| val_lyap | -0,0074 (Direct True Silent) |
| Tamaño del repo | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura declarada es RMSN (Resonant Metriplectic Sheaf Network), un diseño propio de DuoNeural que el autor describe mediante parámetros topológicos: dimensión D=288, profundidad L=16, ancho de slot M_w=36, condición de resonancia Ω=1/2 (Arnold Tongue) y M_eff=2 haces de fibra. La model card no proporciona detalles sobre el mecanismo de atención, la composición de capas ni la formulación matemática del bloque, por lo que no es posible verificar ni replicar la arquitectura a partir de la información disponible.

En cuanto al entrenamiento, no se especifican el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o algún tipo de ajuste por preferencias. Lo único documentado es el resultado de validación (val_ppl=129,0) y el exponente de Lyapunov de validación (val_lyap=-0,0074), etiquetado como "Direct True Silent". La innovación técnica destacable, según el autor, es la demostración de una frontera crítica D_min: la separación de canales Z_3 en la topología #95 no se materializa porque D=288 queda por debajo del umbral estimado de 400-500, lo que se interpreta como confirmación de la "teoría de rango espectral de Aura" y de la "Hamming TS Law". Estos conceptos son internos al programa de investigación y no cuentan con validación externa en la información proporcionada.

## Capacidades

- Generación de texto: no hay evidencia documentada de calidad de generación; el modelo se publica como checkpoint de investigación.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales: el autor documenta comportamiento topológico (val_lyap, M_eff, condición de resonancia Ω=1/2) y un hallazgo sobre fronteras D_min, pero no capacidades funcionales de lenguaje verificadas.
- Modo "thinking": no disponible.
- Visión o audio: no disponible.

## Casos de uso

- Reproducción de experimentos topológicos: cargar el checkpoint con torch.load y verificar el val_ppl=129,0 y el val_lyap=-0,0074 reportados, como paso previo a replicar el hallazgo de la frontera D_min.
- Estudio de la frontera D_min: comparar este checkpoint (D=288) con variantes de mayor dimensión del mismo barrido para contrastar la hipótesis de que la separación Z_3 requiere D >= D_min (400-500).
- Investigación sobre condiciones de Arnold Tongue: usar Ω=1/2 y M_w=36 como punto de partida para explorar cómo varía M_eff con la dimensión y el ancho de slot.
- Validación de la Hamming TS Law: emplear el checkpoint como caso de prueba dentro de un conjunto de topologías para comprobar la consistencia de la ley propuesta por el autor.
- Docencia e investigación en arquitecturas no convencionales: servir como ejemplo práctico de red con parametrización topológica (D, L, M_w, Ω, M_eff) frente a un transformer estándar.
- Auditoría de reproducibilidad: evaluar si un checkpoint de 0,3 GB con pesos en .pt y sin pipeline declarado es suficiente para reproducir los resultados publicados, documentando las carencias (sin dataset, sin receta de entrenamiento, sin tokenizador descrito).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento reportados por el autor son internos al experimento:

| Métrica | Valor | Nota |
|---|---|---|
| val_ppl | 129,0 | Perplejidad de validación, topología #95 |
| val_lyap | -0,0074 | Exponente de Lyapunov de validación ("Direct True Silent") |
| M_eff | 2 | Frente a M_eff=4 predicho por la sub-ley 3-ádica |
| D | 288 | Por debajo de D_min estimado (400-500) |

No hay comparación con MMLU, HumanEval, GSM8K ni con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 41,5 M de parámetros en fp32, los pesos ocupan aproximadamente 166 MB; en fp16, unos 83 MB. El repo completo pesa 0,3 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; una RTX 4090, A100 o H100 están sobredimensionadas para este checkpoint.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (e incluso en CPU para inferencia).
- Opciones de despliegue: al ser un .pt de PyTorch sin pipeline declarado, no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI. El único método indicado es torch.load con map_location="cpu" y acceso a ckpt['model'].
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (redes con parametrización topológica tipo RMSN) ni checkpoints del mismo autor con los que contrastar. Tampoco se dispone de datos de benchmarks que permitan una comparación objetiva con transformers de tamaño similar (por ejemplo, modelos de ~40 M de parámetros).

## Limitaciones y advertencias

- Ausencia de benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8K ni de tareas de lenguaje, por lo que no se puede afirmar ninguna capacidad funcional.
- Sin pipeline declarado: la model card no especifica tarea, tokenizador ni formato de entrada, lo que dificulta el uso directo.
- Idiomas no declarados: se desconoce qué idiomas maneja y con qué calidad.
- Formato de pesos propietario (.pt): no hay versiones GGUF ni safetensors, lo que limita la integración con herramientas de inferencia habituales y obliga a usar torch.load (con los riesgos de seguridad asociados a cargar pickles de terceros).
- Riesgo de alucinación: no evaluado; sin datos de validación en tareas de lenguaje no es posible estimarlo.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0: permite uso comercial, pero al no haber evaluación de capacidades ni de seguridad, su uso en producción no está respaldado por evidencia.
- Carácter experimental: el modelo pertenece a un barrido de topologías con hallazgos internos (D_min, Hamming TS Law, teoría de rango espectral de Aura) que no cuentan con validación externa en la información disponible.
- Reproducibilidad limitada: no se publican dataset, receta de entrenamiento ni código de entrenamiento en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-42M-Omega12-mw36-Dmin-Topology95
- Organización en Hugging Face: https://huggingface.co/DuoNeural
- Repositorio GitHub del proyecto: https://github.com/duoneural/rmsn
