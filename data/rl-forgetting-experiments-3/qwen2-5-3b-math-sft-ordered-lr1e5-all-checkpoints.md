# RL-Forgetting-Experiments-3/qwen2.5-3b-math-sft-ordered-lr1e5-all-checkpoints

## Resumen

Este repositorio no contiene un modelo único, sino una colección de diez checkpoints intermedios resultantes de un ajuste supervisado (SFT) sobre el modelo base Qwen/Qwen2.5-3B, especializado en tareas de matemáticas. Lo publica el usuario RL-Forgetting-Experiments-3 y su interés es fundamentalmente metodológico: los checkpoints corresponden a los pasos 107, 214, 322, 429, 536, 643, 750, 858, 965 y 1072 de una misma ejecución de entrenamiento con tasa de aprendizaje 1e-5, lo que permite estudiar la evolución de la pérdida y el posible olvido catastrófico (catastrophic forgetting) a lo largo del entrenamiento. Cada directorio `checkpoints/step_N/` es un modelo de Hugging Face cargable de forma independiente con la librería `transformers`.

El modelo subyacente es un transformer decoder-only denso de aproximadamente 3.090 millones de parámetros, con una ventana de contexto de 32.768 tokens en su configuración original. Al derivar del checkpoint preentrenado (no del instruct), el resultado no incorpora por defecto el post-entrenamiento conversacional, de alineación ni de uso de herramientas que sí tiene Qwen2.5-3B-Instruct. La información publicada no detalla la composición del dataset de SFT, el número de tokens vistos ni si hubo fases posteriores de RLHF o DPO.

Su relevancia es doble: por un lado, es un artefacto de investigación útil para reproducir análisis de dinámica de entrenamiento y de olvido; por otro, sirve como punto de partida para quien quiera estudiar cómo emerge la capacidad matemática en modelos pequeños a lo largo de los pasos de optimización. El repositorio ocupa 123,4 GB, ya que almacena la decena de checkpoints completa, y se distribuye bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, denso (familia Qwen2, con atención GQA y RoPE); no se documentan modificaciones arquitectónicas respecto al modelo base |
| Parámetros totales | 3,09 B (heredados de Qwen2.5-3B; el autor no publica un recuento propio) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base; extensible a 131.072 con YaRN según la ficha de Qwen2.5-3B) |
| Tipos de cuantización | No disponible. Solo se publican pesos en `safetensors`; no hay versiones GGUF, AWQ, GPTQ ni MLX |
| Idiomas soportados | No documentados para este ajuste. El modelo base Qwen2.5-3B declara soporte para 29 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (diez checkpoints, uno por carpeta `checkpoints/step_N/`) |
| Checkpoints incluidos | 10 (pasos 107, 214, 322, 429, 536, 643, 750, 858, 965 y 1072) |
| Tamaño del repositorio | 123,4 GB en total (≈12,3 GB por checkpoint, compatible con pesos en fp32) |
| Librería | `transformers` |
| Modelo base | Qwen/Qwen2.5-3B |

## Arquitectura y entrenamiento

La arquitectura es la del modelo Qwen2.5-3B sin cambios declarados: un transformer decoder-only de 36 capas, dimensión oculta de 2048, 16 cabezas de atención con 2 cabezas KV (atención con consultas agrupadas, GQA), dimensión intermedia de 11.008 y vocabulario de 151.936 tokens con embeddings atados. Estas cifras proceden de la configuración pública del modelo base; el autor de este repositorio no publica su propia configuración.

Sobre el entrenamiento solo se conocen los datos que aparecen en la model card: se trata de un SFT con tasa de aprendizaje 1e-5 sobre datos de matemáticas, ejecutado hasta el paso 1072 y del que se conservan diez checkpoints equiespaciados. La model card indica explícitamente que "el entrenamiento y la evaluación ya estaban completos" y que los resultados de evaluación por checkpoint están en un dataset de artefactos aparte. No hay información sobre el número de tokens de entrenamiento, la composición o procedencia del corpus, el formato de las muestras (instrucción-respuesta, cadena de pensamiento, etc.), ni sobre fases de RLHF, DPO o cualquier otra forma de alineación. Las etiquetas del repositorio (`sft`, `qwen2.5`, `loss-analysis`) apuntan a un uso experimental orientado al análisis de la pérdida durante el ajuste más que a la publicación de un modelo listo para producción.

## Capacidades

- Generación de texto y continuación de secuencias en el dominio matemático, presumiblemente en formato de resolución de problemas, aunque el formato exacto de las muestras de SFT no está documentado.
- Razonamiento aritmético y algebraico básico a nivel de educación secundaria y bachillerato, como consecuencia del ajuste sobre datos de matemáticas; no hay evaluación publicada que lo cuantifique.
- Capacidades generales de lenguaje heredadas del preentrenamiento de Qwen2.5-3B, potencialmente degradadas por el ajuste específico y por el reducido número de pasos.
- Capacidades multilingües del modelo base (29 idiomas declarados), sin garantía de que el SFT haya preservado ese comportamiento al no documentarse los idiomas del corpus.
- Soporte de tool calling / function calling: no disponible y no esperable, ya que el modelo base es el checkpoint preentrenado y no la variante instruct.
- Soporte de agentes y razonamiento multi-paso: no disponible ni verificado.
- Modo de razonamiento explícito (thinking mode), visión o audio: no soportados.
- Uso como material de investigación: comparación entre checkpoints para estudiar dinámica de pérdida y olvido catastrófico.

## Casos de uso

- Investigación sobre olvido catastrófico: los diez checkpoints permiten medir cómo evoluciona el rendimiento en tareas generales (no matemáticas) a medida que avanza el SFT, comparando cada `step_N` con el modelo base y entre sí.
- Análisis de la dinámica de pérdida: la secuencia de checkpoints posibilita reconstruir curvas de pérdida de entrenamiento y de validación con granularidad de ~107 pasos, útil para estudiar fases de ajuste rápido y de meseta.
- Estudio de la emergencia de habilidades matemáticas: con diez puntos de control se puede localizar en qué paso aparece (o se degrada) la capacidad de resolver problemas aritméticos y algebraicos.
- Selección de checkpoints para experimentos de destilación: usar un checkpoint intermedio, y no el final, como profesor en un esquema de knowledge distillation para comparar calidad frente a coste.
- Reproducción de pipelines de evaluación: el dataset de artefactos enlazado por el autor contiene salidas de evaluación por checkpoint, lo que permite auditar metodologías de evaluación sobre modelos pequeños.
- Comparación de estrategias de entrenamiento: este repositorio se puede contrastar con otras ejecuciones del mismo autor (por ejemplo, variantes de ordenación de datos o de tasa de aprendizaje) para aislar el efecto del orden del corpus.
- Prototipado educativo sin conexión: un único checkpoint ocupa ≈12,3 GB y puede ejecutarse en local para generar y revisar ejercicios de matemáticas, siempre que se asuma la ausencia de alineación y la falta de benchmarks.
- Punto de partida para un ajuste posterior: al ser un SFT parcial sobre un modelo de 3B con licencia Apache-2.0, sirve como inicialización para tareas de matemáticas con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente enlaza un dataset de artefactos con salidas de evaluación por checkpoint (`runs/math_ordered/eval`), cuyo contenido no se incluye en la información proporcionada, por lo que no es posible reproducir aquí cifras de MMLU, GSM8K, MATH, HumanEval ni de ninguna otra prueba. No se dispone tampoco de comparaciones publicadas frente a Qwen2.5-3B-Instruct u otros modelos de tamaño similar.

## Requisitos de hardware

Estimaciones calculadas a partir de la configuración del modelo base (36 capas, 2 cabezas KV, dimensión de cabeza 128). No proceden del autor del repositorio, que no publica requisitos ni mediciones.

- VRAM para inferencia en fp32: ≈12,4 GB de pesos. Con caché KV en fp16 a 32.768 tokens (≈1,13 GB) y activaciones, el total ronda los 14-15 GB.
- VRAM para inferencia en bf16/fp16: ≈6,2 GB de pesos más ≈1,13 GB de caché KV a contexto completo, es decir, unos 7,5-8 GB.
- VRAM en int8: ≈3,2 GB de pesos más caché KV, alrededor de 4,5 GB.
- VRAM en int4: ≈1,9 GB de pesos más caché KV, alrededor de 3,5 GB. Esta opción requeriría cuantizar a partir de los `safetensors` publicados, ya que no se distribuyen pesos cuantizados.
- GPU de centro de datos: A100 40/80 GB, H100, L40S. Cualquiera de ellas permite varias instancias concurrentes de un 3B con contexto largo.
- GPU de consumo: cabe holgadamente. Con 24 GB (RTX 3090, 4090) se puede servir en bf16 con contexto de 32k; con 12 GB (RTX 3060 12 GB, RTX 4070) se puede servir en bf16 con contexto reducido o en int8/int4 a contexto completo; con 8 GB es viable en int4.
- Opciones de despliegue: `transformers` de forma nativa (es la librería declarada); vLLM y TGI para servicio con batching continuo; llama.cpp y Ollama tras convertir los pesos a GGUF, que no se distribuye.
- Almacenamiento y ancho de banda: descargar el repositorio completo implica 123,4 GB. Para un uso normal conviene descargar únicamente la carpeta del checkpoint deseado (≈12,3 GB).
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Benchmarks en la información disponible |
|---|---|---|---|---|---|
| qwen2.5-3b-math-sft-ordered-lr1e5-all-checkpoints | 3,09 B (base) | 32.768 tokens | Apache-2.0 | 10 checkpoints en `safetensors` | No disponible |
| Qwen2.5-3B (modelo base) | 3,09 B | 32.768 tokens | Apache-2.0 | `safetensors`, GGUF de terceros | No incluidos en esta ficha |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache-2.0 | `safetensors`, GGUF de terceros | No incluidos en esta ficha |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | `safetensors`, GGUF de terceros | No incluidos en esta ficha |

Los datos de las filas alternativas provienen de las fichas públicas de esos modelos y no se han verificado en el contexto de esta búsqueda. La diferencia principal de este repositorio frente a ellos no es de rendimiento, sino de propósito: es un conjunto de checkpoints para investigación, no un modelo alineado ni optimizado para conversación, y no cuenta con resultados de evaluación publicados en la información disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks verificables: no hay cifras de MMLU, GSM8K, MATH ni de evaluaciones de seguridad para ninguno de los diez checkpoints.
- No es un modelo instruct: deriva del checkpoint preentrenado de Qwen2.5-3B, sin RLHF, DPO ni alineación conversacional, por lo que no se debe esperar un comportamiento de asistente fiable.
- El entrenamiento llega solo al paso 1072 con tasa 1e-5: es probable que el ajuste no esté convergido y que el comportamiento varíe de forma notable entre checkpoints.
- Riesgo elevado de alucinación en resultados matemáticos: un modelo de 3B ajustado con SFT limitado puede producir cadenas de razonamiento plausibles con conclusiones incorrectas. Requiere verificación externa de cualquier resultado numérico.
- Olvido catastrófico: es precisamente la hipótesis que motiva el repositorio; cabe esperar degradación de capacidades generales (lenguaje, conocimiento factual, multilingüismo) conforme avanzan los pasos.
- Idioma de los datos de SFT no documentado: se desconoce si el ajuste se hizo en inglés, en chino, en español o en varios idiomas, lo que impide garantizar un rendimiento homogéneo.
- Riesgo de sesgos: no hay información sobre filtrado, deduplicación ni moderación del corpus de entrenamiento; los sesgos del modelo base se heredan sin mitigación adicional.
- Procedencia del corpus desconocida: aunque los pesos se publican bajo Apache-2.0, la licencia del dataset de SFT no se declara, lo que puede afectar al uso comercial en función de su origen.
- Coste operativo del repositorio completo: 123,4 GB. Descargar todos los checkpoints es innecesario salvo para investigación; para inferencia basta con un único directorio `checkpoints/step_N/`.
- Sin cuantizaciones oficiales ni versiones GGUF: cualquier despliegue en llama.cpp, Ollama o similar exige conversión manual y validación posterior.
- Metadatos incompletos: la ficha no documenta el pipeline, los idiomas, el dataset ni los hiperparámetros completos, y el repositorio registra cero descargas y cero valoraciones, por lo que no existe validación de la comunidad.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos corresponden a temáticas sin relación (videojuegos y prensa regional) y se han descartado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RL-Forgetting-Experiments-3/qwen2.5-3b-math-sft-ordered-lr1e5-all-checkpoints
- Dataset de artefactos con salidas de evaluación por checkpoint: https://huggingface.co/datasets/RL-Forgetting-Experiments-3/qwen2.5-3b-math-kk-sft-artifacts/tree/main/runs/math_ordered/eval
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la búsqueda web realizada.
