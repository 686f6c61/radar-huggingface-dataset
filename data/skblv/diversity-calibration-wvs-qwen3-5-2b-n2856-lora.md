# skblv/diversity-calibration-wvs-qwen3.5-2b-n2856-lora

## Resumen

`skblv/diversity-calibration-wvs-qwen3.5-2b-n2856-lora` es un adaptador LoRA (Low-Rank Adaptation) de rango 16 entrenado sobre el modelo base `Qwen/Qwen3.5-2B`. Lo desarrolla el usuario `skblv` (Kirill Skobelev, según la cita académica asociada) como artefacto experimental vinculado al artículo *Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs* (arXiv:2609.16454). No se trata de un modelo generalista, sino de un adaptador de calibración de diversidad: su objetivo es ajustar la distribución de respuestas del modelo base para que se aproxime a la diversidad empírica observada en encuestas de opinión reales.

El adaptador se ha entrenado con 2.856 ejemplos de pares encuestado-pregunta procedentes de la World Values Survey, ronda 7 (WVS Wave 7). Cada prompt combina una persona demográfica sintética, una pregunta de encuesta y opciones de respuesta etiquetadas con letras; el objetivo de entrenamiento es la letra de la opción elegida por el encuestado real. El resultado es un modelo que, dado un perfil demográfico y una pregunta de encuesta, genera respuestas cuya distribución agregada se calibra contra la diversidad relativa observada en la WVS.

La relevancia del artefacto es metodológica más que de producto: documenta un procedimiento reproducible para corregir dos patologías conocidas de los LLM en tareas de simulación de poblaciones: el colapso de moda (respuestas demasiado homogéneas) y la sobredispersión (respuestas demasiado variadas). El repositorio no incluye pesos en formato GGUF ni información de licencia o idiomas, y el tamaño declarado del repo es 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el tamaño no se ha calculado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (base: Qwen/Qwen3.5-2B); rango 16, alpha 32, dropout 0,05 |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3.5-2B tiene ~2.000 millones de parametros segun su denominacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0,05 aplicado sobre el modelo base Qwen3.5-2B. El entrenamiento consistió en tres épocas sobre 2.856 ejemplos de pares encuestado-pregunta extraídos de la World Values Survey Wave 7, usando un subconjunto fijo con un tercio aleatorio de países y las preguntas medibles. Los tokens del prompt fueron enmascarados de la pérdida; la pérdida se aplicó únicamente al token o tokens de la letra de respuesta y al token EOS. Esta configuración es típica de un ajuste supervisado orientado a clasificación/generación de una etiqueta corta, no a generación libre de texto.

La innovación técnica no reside en la arquitectura del adaptador, sino en el objetivo de calibración de diversidad que documenta el artículo asociado. La gráfica de convergencia del repositorio representa la diversidad relativa (R) frente a pares pregunta-grupo demográfico, con banda del percentil 25 al 75, línea discontinua en R = 1 (diversidad calibrada) y marcador cuadrado para este adaptador. El propósito es medir si el modelo ajustado reproduce la dispersión de respuestas de la población real en lugar de colapsar hacia una respuesta dominante o dispersarse en exceso. No se especifican en la información disponible detalles sobre el dataset de instrucciones, el uso de RLHF/DPO ni otras técnicas de alineamiento.

## Capacidades

- Generación de respuestas de encuesta condicionadas a un perfil demográfico (persona) y a una pregunta con opciones etiquetadas.
- Calibración de diversidad de respuestas: el adaptador está entrenado para que la distribución agregada de respuestas se aproxime a la diversidad relativa observada en la WVS.
- Clasificación implícita de opciones: la salida esperada es una letra de opción, lo que equivale a una tarea de selección entre alternativas acotadas.
- Simulación de opinión pública a nivel de subgrupos demográficos, con capacidad de producir distribuciones por país y por grupo (según el particionado de entrenamiento: un tercio de países).
- Capacidades generales del modelo base Qwen3.5-2B (generación de texto y razonamiento) potencialmente preservadas, aunque el adaptador está especializado y no se documenta su comportamiento fuera de la tarea de encuesta.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se especifican idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Simulación de opinión pública para investigación social: dado un perfil demográfico (edad, país, nivel educativo, etc.) y una pregunta de la WVS, el adaptador genera la letra de respuesta esperada; es adecuado porque se entrenó exactamente con ese formato prompt-respuesta y calibra la diversidad agregada contra datos reales.
- Validación de metodologías de encuesta sintética: permite comparar distribuciones generadas por LLM con distribuciones reales por pregunta y grupo demográfico, usando la métrica de diversidad relativa (R) del artículo asociado como criterio de aceptación.
- Estudio de sesgos y colapso de moda en LLM: sirve como referencia experimental de un ajuste que corrige el colapso de moda y la sobredispersión, útil para investigadores que analizan cómo el fine-tuning altera la distribución de salidas.
- Generación de personas sintéticas coherentes con subgrupos: en pipelines de aumento de datos para ciencias sociales, el adaptador puede producir respuestas por subgrupo con dispersión realista, evitando tanto la homogeneidad excesiva como la variabilidad irreal.
- Reproducción de experimentos académicos: al estar vinculado a arXiv:2609.16454 con hiperparámetros y particionado documentados (rango 16, alpha 32, dropout 0,05, 3 épocas, 2.856 ejemplos, un tercio de países), permite replicar la curva de convergencia de diversidad relativa.
- Evaluación de robustez de encuestas frente a modelos generativos: analizar hasta qué punto un LLM de 2.000 millones de parámetros, tras un ajuste ligero, puede aproximar respuestas humanas y qué preguntas o grupos demográficos quedan fuera del alcance del adaptador.
- Prototipado de asistentes de encuesta con opciones acotadas: en un entorno controlado, el adaptador puede integrarse en un flujo que presenta una pregunta con opciones y devuelve una letra, siempre que el perfil demográfico y el formato del prompt coincidan con los del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye únicamente una gráfica de convergencia de diversidad relativa (R) con banda intercuartílica y línea de calibración en R = 1, sin cifras numéricas de MMLU, HumanEval, GSM8K ni métricas de diversidad cuantificadas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; depende del modelo base Qwen3.5-2B y de la cuantización elegida para él. Un modelo de ~2.000 millones de parámetros en FP16 requiere del orden de 4-5 GB solo para pesos, más memoria para KV cache y activaciones; en cuantización de 4 bits se reduce sustancialmente.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del modelo base, cabría esperar GPUs consumer de gama media-alta, pero no se confirma en el repositorio.
- Compatibilidad con GPU consumer: no disponible; no se especifican modelos concretos (RTX 4090, RTX 3090, etc.).
- Opciones de despliegue: el adaptador es PEFT/LoRA en safetensors, por lo que su uso requiere cargar el modelo base y fusionar o aplicar el adaptador mediante la librería `peft` (y típicamente `transformers`). No se documentan instrucciones para vLLM, llama.cpp, Ollama o TGI, ni se incluyen pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre otros adaptadores de calibración de diversidad comparables, ni de resultados de rendimiento que permitan situar este LoRA frente a alternativas de la misma categoría. Como referencia estructural, el adaptador hereda el tamaño y el contexto del modelo base Qwen3.5-2B, pero no se documentan sus especificaciones en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado para responder con una letra de opción a preguntas de la WVS con un formato de prompt específico; su comportamiento fuera de ese dominio no está documentado.
- Cobertura parcial de datos: el entrenamiento usó un tercio aleatorio de países y solo las preguntas medibles de la WVS Wave 7, por lo que los países y preguntas excluidos no están representados en el ajuste.
- Riesgo de alucinación y de respuestas fuera de formato: no se documenta ningún mecanismo de validación de la letra generada; en producción habría que verificar que la salida pertenece al conjunto de opciones válidas.
- Sesgos: los datos de la WVS reflejan los sesgos de las poblaciones encuestadas y del instrumento; el adaptador puede reproducirlos y amplificarlos en subgrupos con pocos ejemplos.
- Limitaciones de idioma: no se especifican los idiomas soportados; la WVS se administra en múltiples idiomas, pero el repositorio no detalla la composición lingüística del entrenamiento.
- Licencia no disponible: no se indica la licencia del adaptador ni del modelo base en la información proporcionada, lo que impide determinar si el uso comercial está permitido. Verificar antes de cualquier despliegue en producción.
- Tamaño del repositorio declarado como 0,0 GB: puede indicar que los pesos no están efectivamente alojados o que el cálculo de tamaño no se ha realizado; conviene comprobar la disponibilidad real de los ficheros antes de integrarlo.
- Sin datos de benchmarks ni de latencia: no es posible estimar calidad ni rendimiento operativo a partir de la información disponible.
- Naturaleza experimental: el artefacto está vinculado a un artículo de investigación y no presenta documentación de producción, versionado ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n2856-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Artículo asociado (arXiv:2609.16454): https://arxiv.org/abs/2609.16454
- World Values Survey, Round Seven, Country-Pooled Datafile v6.0.0 (DOI): https://doi.org/10.14281/18241.24
