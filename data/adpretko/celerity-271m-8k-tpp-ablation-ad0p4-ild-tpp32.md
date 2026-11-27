# adpretko/celerity-271m-8k-tpp-ablation-ad0p4-ild-tpp32

## Resumen

Celerity 271M 8K es un checkpoint de investigación de la familia Celerity, un modelo de lenguaje de 271 millones de parámetros entrenado originalmente en la infraestructura Cerebras y convertido posteriormente al formato de Hugging Face. El autor del repositorio, `adpretko`, publica este checkpoint como parte de un experimento de ablación centrado en el *token-per-parameter* (TPP) y el *attention dropout* dependiente de capa, identificado con el sufijo `ad0.4_ild_tpp32`.

El modelo resuelve un problema fundamentalmente experimental: servir como punto de comparación reproducible para estudiar cómo afectan el dropout de atención y la relación tokens/parámetros al rendimiento de modelos pequeños entrenados sobre grandes volúmenes de datos. Con 8 665 497 600 tokens de entrenamiento y una ventana de contexto de 8192 tokens, el checkpoint es relevante para investigadores que trabajan en recetas de entrenamiento eficientes y en modelos compactos con contexto largo.

Se trata de un transformer de tipo decoder-only con embeddings posicionales ALiBi, entrenado sobre el dataset CommonPile (pool TPP sin repeticiones corregido) y distribuido con código personalizado (`trust_remote_code=True`). No es un modelo orientado a producción, sino una pieza de un estudio de ablación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, posición ALiBi |
| Parametros totales | 271 M (nominal) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos PyTorch con código personalizado (`custom_code`, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con embeddings posicionales de tipo ALiBi (Attention with Linear Biases), lo que permite generalizar a longitudes de secuencia de hasta 8192 tokens sin embeddings posicionales aprendidos. El entrenamiento se realizó sobre CommonPile, concretamente sobre el pool TPP sin repeticiones corregido, con 8 665 497 600 tokens procesados en 17 630 pasos y un batch global de 60. La tasa de aprendizaje máxima fue de 0.15, con weight decay de 0.00274 y `tau_ema` de 0.13795.

La innovación técnica destacable es el esquema de *attention dropout* dependiente de capa: el valor 0.4 es el extremo de una programación lineal de dropout por capa, no una probabilidad uniforme. El dropout se desactiva durante la evaluación ordinaria con `model.eval()`. El entrenamiento se ejecutó en 3 sistemas CSX con el runtime `cbcore 2.6.0`, y el checkpoint original (`checkpoint_17630.mdl`) se convirtió al formato de Hugging Face mediante el commit `0e3d5d375695293479df9d2a3717f05f71a345b4`. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva con contexto de hasta 8192 tokens.
- Razonamiento y modelado de lenguaje general (entrenado sobre CommonPile).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (idiomas no especificados).
- No se documentan capacidades de visión, audio ni modo *thinking*.
- Requiere `trust_remote_code=True` para cargar el modelo por su código personalizado.

## Casos de uso

- Investigación en recetas de entrenamiento: el checkpoint sirve como punto de comparación en estudios de ablación sobre dropout de atención y relación tokens/parámetros, permitiendo reproducir el experimento `ad0.4_ild_tpp32` frente a otras configuraciones.
- Análisis de escalado de contexto con ALiBi: permite estudiar el comportamiento del modelo en secuencias cercanas a los 8192 tokens y evaluar la degradación respecto a ventanas más cortas.
- Experimentos de destilación y modelos pequeños: sus 271 M de parámetros lo hacen adecuado como estudiante o como base para comparativas de eficiencia frente a modelos de tamaño similar.
- Evaluación de corpus CommonPile: útil para medir el efecto del pool TPP sin repeticiones en tareas de modelado de lenguaje.
- Pruebas de infraestructura de inferencia: sirve para validar pipelines de carga con `trust_remote_code=True` y para medir latencia de modelos compactos con contexto largo.
- Reproducibilidad académica: al documentarse pasos, tokens, hiperparámetros y commit del conversor, permite replicar resultados en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 271 M de parámetros, en FP16 el modelo ocupa aproximadamente 0.55 GB de pesos; en FP32, alrededor de 1.1 GB. La memoria adicional depende de la longitud de contexto (hasta 8192 tokens) y del tamaño de batch.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en FP16; una RTX 3060, RTX 4060 o superior resulta adecuada.
- Cabe en GPU de consumo: sí, en la mayoría de GPU consumer modernas con 8 GB o más, incluso con contexto largo.
- Opciones de despliegue: el modelo requiere `trust_remote_code=True` y pesos PyTorch personalizados, por lo que no se garantiza compatibilidad directa con llama.cpp, Ollama o vLLM sin conversión previa. La carga estándar es mediante `transformers` con el código del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K (este) | 271 M | 8192 | no disponible | Hugging Face, código personalizado |
| GPT-2 355M | 355 M | 1024 | MIT | Hugging Face, transformers |
| Pythia 410M | 410 M | 2048 | Apache 2.0 | Hugging Face, transformers |
| OPT 350M | 350 M | 2048 | OPT-175B license | Hugging Face, transformers |

La comparativa se limita a parámetros, contexto y licencia, ya que no se han publicado benchmarks de este checkpoint. Frente a GPT-2, Pythia y OPT, Celerity ofrece una ventana de contexto notablemente mayor (8192 frente a 1024-2048), pero carece de licencia declarada y requiere código personalizado, lo que dificulta su uso fuera de entornos de investigación.

## Limitaciones y advertencias

- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribución.
- Modelo de investigación: es un checkpoint de ablación, no un modelo afinado para producción.
- Riesgo de alucinación inherente a un modelo de 271 M entrenado sobre corpus web; no se documentan mitigaciones.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de toxicidad.
- Idiomas: no se especifican los idiomas soportados; el corpus CommonPile es predominantemente inglés.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de cargarlo.
- El dropout de atención solo se desactiva con `model.eval()`; usarlo en modo entrenamiento sin control puede degradar las salidas.
- No hay garantía de compatibilidad con runtimes de inferencia estándar (vLLM, llama.cpp, TGI) sin conversión.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p4-ild-tpp32
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
