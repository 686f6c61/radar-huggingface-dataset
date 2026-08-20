# ceselder/skip-lens-qwen36-27b-agreelens-a-l62

# Ficha del modelo: `ceselder/skip-lens-qwen36-27b-agreelens-a-l62`

## Resumen

El adaptador `ceselder/skip-lens-qwen36-27b-agreelens-a-l62` es una pieza de investigación en interpretabilidad, desarrollada por el autor ceselder. No es un modelo generativo independiente, sino un adaptador PEFT (LoRA) diseñado para leer y manipular las representaciones internas del modelo base Qwen/Qwen3.6-27B. Se enmarca en una serie de experimentos denominados "agreelens" y "skip-lens", cuyo objetivo es comprender cómo se organiza la información en el "workspace" del modelo.

La técnica principal es el "skip-lens": el adaptador se entrena sobre las activaciones residuales de la capa 62 (L62), pero en tiempo de inferencia se le alimenta con las activaciones de la capa 42 (h42) transformadas mediante un Jacobiano oficial (J_42->62). Esta estrategia permite "saltar" capas y leer representaciones más profundas, logrando una mejora de entre 0.14 y 0.17 puntos en la métrica de acuerdo de workspace frente a su variante gemela entrenada en L42.

Con un tamaño de repositorio de 1.9 GB, licencia Apache 2.0 y sin descargas ni likes registrados, este proyecto es un experimento de investigación de nicho. Su uso requiere conocimientos avanzados de PEFT, hooks personalizados y acceso al Jacobian mencionado, lo que lo hace inadecuado para aplicaciones de producción estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA, r64, alpha=16, scope-all) sobre Qwen3.6-27B |
| Parametros totales | No disponible (el adaptador pesa ~1.9 GB; el modelo base es de 27B) |
| Parametros activos | No aplica (adaptador PEFT) |
| Longitud de contexto | No disponible (no especificado en el modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre las activaciones residuales de la capa 62 (L62) del modelo Qwen3.6-27B. El conjunto de datos consta de 244,367 pares (posición, span de 12 tokens) generados en política (on-policy). El entrenamiento se realizó con un batch size de 64, una tasa de aprendizaje de 1e-4, una sola época y semilla 0, aplicando LoRA con r=64, alpha=16 y rsLoRA en todos los ámbitos.

La innovación técnica clave es el "skip-lens". En lugar de entrenar directamente sobre h42, se entrena sobre h62, pero en inferencia se aplica el Jacobian J_42->62 (proporcionado por el autor, camilablank/workspace-lenses) a la activación h42 capturada en el punto de lectura. Este Jacobian se inyecta en el token marcador ㈜ (id 158983) mediante un hook con normalización Karvonen. El resultado es una mejora en la capacidad de lectura del workspace del modelo frente a la variante L42.

## Capacidades

- Lectura de representaciones internas del tipo "workspace" en Qwen3.6-27B.
- Implementación de la técnica "skip-lens" mediante el Jacobian J_42->62.
- Integración con hooks personalizados (Karvonen norm-matched hook) para la inyección de activaciones en el token ㈜.
- Comparación de la calidad de lectura entre capas (L42 vs L62) mediante la métrica de acuerdo de workspace.
- No es un modelo generativo: no produce texto por sí mismo, sino que sirve como sonda para análisis de interpretación.

## Casos de uso

- Investigación de circuitos internos: permite aislar y leer la información que fluye entre las capas 42 y 62 del modelo, facilitando el mapeo de subcircuitos de procesamiento.
- Validación de hipótesis de "activation patching": se puede inyectar la activación transformada en h62 para comprobar si la manipulación de h42 produce los efectos esperados en la salida del modelo.
- Estudio de la evolución de las representaciones: comparar la lectura L42 (en el gemelo) con la L62 permite entender cómo se refina la complejidad semántica a lo largo de las capas.
- Desarrollo de técnicas de "skip-lens": sirve como banco de pruebas para optimizar métodos de interpretación basados en Jacobianos y hooks.
- Evaluación de la calidad de matrices: la métrica de acuerdo (0.755 con J oficial vs 0.705 con h42 directo) permite cuantificar la fidelidad del Jacobian para la transformación de activaciones.
- Benchmark de adaptadores de interpretación: es un punto de referencia para comparar la eficacia de distintos adaptadores de lectura de workspace sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona una métrica específica de interpretación:

| Metrica | Valor |
|---|---|
| Acuerdo de workspace (Sonnet vs Jacobian oficial, 353 items) | 0.755 (alimentado con J42->62) |
| Acuerdo de workspace (Sonnet vs h42 crudo, 353 items) | 0.705 (alimentado con h42 directo) |
| Mejora sobre la variante L42 (según autor) | +0.14 a +0.17 |

## Requisitos de hardware

- Necesita cargar el modelo base Qwen3.6-27B. En bf16, la VRAM requerida es de aproximadamente 54 GB, por lo que se recomienda una GPU con al menos 80 GB (A100 80GB, H100) para trabajar sin cuantización.
- Con cuantización del modelo base (8-bit), puede caber en GPUs de 32 GB (A6000, V100 32GB). En 4-bit, podría ejecutarse en una RTX 4090 (24 GB), aunque el overhead de los hooks y el adaptador puede reducir el margen.
- No se dispone de datos de latencia o throughput, ya que no está diseñado para inferencia en producción sino para experimentos de investigación.
- El despliegue requiere librerías de PEFT (transformers) y la implementación de hooks personalizados. No es compatible directamente con vLLM, Ollama o TGI sin adaptaciones adicionales.

## Comparativa con modelos similares

| Modelo | Variante entrenada | Alimentación | Acuerdo workspace | Mejora |
|---|---|---|---|---|
| `ceselder/skip-lens-qwen36-27b-agreelens-a-l62` (este) | L62 | J_42->62 @ h42 | 0.755 | Referencia |
| `ceselder/skip-lens-qwen36-27b-agreelens-a` (gemelo L42) | L42 | h42 | No disponible (inferior en 0.14-0.17 según autor) | Inferior |
| Otros adaptadores de interpretación | No disponible | No disponible | No disponible | No disponible |

No se han encontrado otros adaptadores de la misma categoría (skip-lens sobre Qwen3.6-27B) en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo generativo. No puede utilizarse para tareas de texto estándar sin el modelo base y los hooks específicos.
- Depende de la disponibilidad del Jacobian J_42->62 (mencionado como `camilablack/workspace-lenses`). Si este recurso no se publica o cambia, el adaptador pierde su funcionalidad principal.
- El rendimiento reportado (0.755) se basa en una métrica interna (353 items) y puede no generalizarse a otros conjuntos de datos o configuraciones.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un experimento muy reciente y poco validado por la comunidad.
- No se especifican idiomas soportados ni límites de contexto para el adaptador. El comportamiento en contextos largos no está documentado.
- La licencia Apache 2.0 permite uso comercial, pero al depender del modelo base Qwen3.6-27B, se debe revisar la licencia de ese modelo para el uso conjunto en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ceselder/skip-lens-qwen36-27b-agreelens-a-l62
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen3.6-27B
- Referencia al Jacobian (mencionado en el README): `camilablack/workspace-lenses` (no se dispone de URL directa en la información proporcionada)
