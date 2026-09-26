# ishikaa/acquisition_student_randomselfgen_nemotronstem_qwen3b_5000

## Resumen

El modelo `ishikaa/acquisition_student_randomselfgen_nemotronstem_qwen3b_5000` es un checkpoint de 3.085.938.688 parámetros (3,09 B) publicado en HuggingFace por el usuario `ishikaa`. Por su nomenclatura y por la etiqueta `qwen2` del repositorio, se trata de un modelo estudiante ("student") derivado de la familia Qwen2, entrenado sobre un subconjunto de 5.000 ejemplos de un corpus tipo Nemotron-Stem mediante alguna estrategia de adquisición de datos denominada "randomselfgen" (autogeneración aleatoria). No es, por tanto, un modelo base publicado oficialmente, sino un artefacto de investigación asociado a un experimento de destilación o de selección activa de datos.

La relevancia de este checkpoint es limitada y muy específica: sirve para reproducir o auditar un experimento académico concreto, no como modelo de propósito general. La model card publicada es la plantilla automática de HuggingFace sin rellenar, por lo que no hay información del autor sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

Todos los datos técnicos que no aparecen en la información proporcionada se marcan explícitamente como "no disponible". Cualquier inferencia sobre el contexto, los idiomas o el rendimiento debe considerarse no verificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (según la etiqueta `qwen2` del repositorio); configuración exacta no disponible |
| Parametros totales | 3.085.938.688 (3,09 B), dato real de los pesos en safetensors |
| Parametros activos | No aplica (no hay evidencia de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles; el repositorio solo contiene pesos en safetensors y no se han publicado versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | Safetensors, cargables con la librería `transformers` |
| Tamaño del repositorio | 6,2 GB |
| Pipeline declarado | `text-generation` |
| Etiquetas | `transformers`, `safetensors`, `qwen2`, `text-generation`, `conversational`, `text-generation-inference`, `endpoints_compatible`, `region:us` |
| Fecha de creación | 2026-09-26 |
| Última actualización | 2026-09-26 |

## Arquitectura y entrenamiento

La única información estructural disponible es la etiqueta `qwen2` y el recuento exacto de parámetros (3,09 B), compatible con un transformer decoder-only de tipo Qwen2 de tamaño 3B. No se dispone de la configuración de capas, dimensiones ocultas, número de cabezas de atención, tipo de normalización ni mecanismo de atención (full attention frente a variantes eficientes) empleados en este checkpoint concreto.

Respecto al entrenamiento, el nombre del repositorio sugiere tres elementos: (1) un régimen de "student", es decir, un modelo destilado o entrenado para imitar a un profesor; (2) un corpus derivado de Nemotron-Stem, un conjunto de datos orientado a dominios STEM (matemáticas, ciencia, ingeniería y tecnología); y (3) una estrategia de adquisición de datos denominada "randomselfgen" aplicada sobre 5.000 muestras. No hay información pública sobre el número de tokens vistos, la mezcla final del dataset, si hubo fases de RLHF, DPO o SFT adicionales, ni sobre la técnica de destilación empleada. La model card no documenta hiperparámetros, infraestructura de cómputo ni emisiones de carbono asociadas.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad confirmada por el pipeline declarado (`text-generation`).
- Formato conversacional: la etiqueta `conversational` sugiere que el checkpoint puede tener una plantilla de chat aplicada, aunque no se detalla el formato de prompt exacto.
- Compatibilidad con endpoints de inferencia: las etiquetas `text-generation-inference` y `endpoints_compatible` indican que el repositorio puede desplegarse con TGI y en HuggingFace Inference Endpoints sin conversión previa.
- Razonamiento, matemáticas y código: probablemente presentes de forma parcial por el dominio STEM de los datos de entrenamiento, pero sin evidencia publicada ni evaluación que lo respalde.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no hay indicios de modalidades distintas al texto.
- Ventana de contexto larga: no disponible.

## Casos de uso

- Reproducción de experimentos de adquisición de datos: el checkpoint permite comparar el efecto de la estrategia "randomselfgen" sobre 5.000 muestras frente a otras políticas de selección de datos en un presupuesto de cómputo reducido. Es su caso de uso principal dado su origen claramente experimental.
- Análisis de destilación hacia modelos pequeños: sirve como punto de comparación en estudios sobre cuánto conocimiento STEM se retiene en un modelo de 3 B entrenado con un subconjunto reducido de datos.
- Evaluación de riesgo de contaminación de benchmarks: al ser un modelo ajustado sobre datos derivados de Nemotron-Stem, es útil para estudiar cuánta contaminación introducen los corpus sintéticos o filtrados en las métricas de matemáticas y ciencia.
- Prototipado rápido en local: con 3,09 B de parámetros en fp16 ocupa aproximadamente 6,2 GB, por lo que cabe en GPU de consumo con 8-12 GB de VRAM y permite iterar sin coste de API, siempre que se acepte que la calidad no está garantizada.
- Generación de datos sintéticos para otros pipelines: puede usarse como generador económico en tareas de aumento de datos, con revisión humana posterior obligatoria dado que no hay datos de evaluación disponibles.
- Investigación sobre plantillas de chat y formateo: la etiqueta `conversational` permite estudiar cómo responde un modelo pequeño ajustado con pocos ejemplos a distintos formatos de prompt.
- Experimentos de alineación y evaluación de sesgos: como artefacto académico, es un sujeto adecuado para medir sesgos y tasas de alucinación en modelos de 3 B ajustados con datos de dominio.
- Despliegue en producción: no recomendado, ya que no hay licencia declarada, ni evaluación, ni garantías de mantenimiento del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación con datos, y la búsqueda web realizada no devolvió ninguna fuente relacionada con el modelo (los resultados obtenidos fueron páginas genéricas de YouTube, sin relación con el repositorio).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,2 GB solo de pesos, más caché KV y activaciones; en la práctica se recomienda reservar entre 8 y 10 GB.
- VRAM estimada en int8: aproximadamente 3,1 GB de pesos; alrededor de 5 GB con overhead.
- VRAM estimada en int4 (si se generan cuantizaciones propias): aproximadamente 1,8-2,2 GB de pesos; alrededor de 3-4 GB con overhead.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080/4090 (holgadas). En tarjetas de 8 GB solo es viable con cuantización de 4 bits.
- GPU de centro de datos: A100 40/80 GB, H100, L40S y similares; el modelo es pequeño para estas tarjetas y quedaría limitado por el ancho de banda más que por la memoria.
- Apple Silicon: unificados con 16 GB o más pueden ejecutarlo en fp16; con 8 GB es necesario cuantizar.
- Opciones de despliegue: `transformers` de forma nativa; vLLM y TGI para servir con batching continuo; SGLang como alternativa. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medición, y la búsqueda web no aportó datos al respecto.

## Comparativa con modelos similares

La comparación se establece con modelos base de tamaño comparable, ya que este checkpoint no publica métricas propias. Los valores de la columna de este modelo están tomados del repositorio; los de los modelos de referencia provienen de sus documentaciones públicas y deben verificarse antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `ishikaa/acquisition_student_randomselfgen_nemotronstem_qwen3b_5000` | 3,09 B | No disponible | No disponible | HuggingFace, 0 descargas, sin cuantizaciones |
| Qwen2.5-3B | 3,09 B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | HuggingFace, ampliamente desplegado |
| Llama 3.2 3B | 3,21 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, con restricciones de uso |
| Gemma 2 2B | 2,6 B | 8.192 tokens | Gemma Terms of Use | HuggingFace, con restricciones de uso |

Frente a estos modelos, el checkpoint analizado carece de licencia declarada, de contexto documentado y de cualquier evaluación publicada, por lo que no es sustituible de forma directa en producción. Su interés es exclusivamente experimental.

## Limitaciones y advertencias

- Licencia ausente: al no declararse licencia, no puede asumirse permiso de uso comercial. En la práctica, el modelo queda en una situación jurídicamente ambigua y no debería integrarse en productos.
- Model card vacía: no hay información del autor sobre datos, hiperparámetros, uso previsto, sesgos ni limitaciones. Todo lo que no figura en esta ficha debe considerarse desconocido.
- Riesgo elevado de alucinación: sin evaluación publicada, no hay ninguna medida de fiabilidad. Un ajuste sobre 5.000 muestras de un dominio concreto suele degradar el comportamiento fuera de ese dominio.
- Sesgos desconocidos: no se ha realizado ninguna auditoría de sesgo ni se documenta la composición del corpus de entrenamiento.
- Limitaciones idiomáticas: se desconoce si el modelo conserva capacidades multilingües del modelo base o si el ajuste las ha reducido a favor del inglés técnico.
- Especialización estrecha: el entrenamiento sobre datos tipo Nemotron-Stem puede haber estrechado la distribución de salidas hacia contenido STEM, con pérdida de calidad en conversación general.
- Sin cuantizaciones oficiales: desplegarlo en llama.cpp, Ollama o LM Studio requiere convertir los safetensors a GGUF por cuenta propia, con el riesgo de error que ello implica.
- Sin mantenimiento ni soporte: 0 descargas y 0 likes indican que no hay comunidad ni issues resueltos; no cabe esperar correcciones.
- Reproducibilidad incompleta: aunque el nombre describe la receta (student, randomselfgen, Nemotron-Stem, Qwen 3B, 5.000 muestras), no se publican scripts, semillas ni el corpus exacto, por lo que el experimento no es reproducible tal cual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ishikaa/acquisition_student_randomselfgen_nemotronstem_qwen3b_5000
- Referencia citada en la plantilla de la model card (huella de carbono de modelos de ML): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML mencionada en la plantilla: https://mlco2.github.io/impact
- Búsqueda web: no se encontraron enlaces relevantes sobre este modelo (los resultados devueltos fueron páginas genéricas de YouTube, sin relación con el repositorio).
