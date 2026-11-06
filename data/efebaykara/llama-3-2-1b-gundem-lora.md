# efebaykara/Llama-3.2-1B-Gundem-LoRA

## Resumen

Llama-3.2-1B-Gundem-LoRA es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base meta-llama/Llama-3.2-1B, desarrollado por el usuario efebaykara. No se trata de un checkpoint completo ni de un asistente conversacional generalista, sino de un ajuste fino especializado en una única tarea: la clasificación de titulares de noticias en turco ("gundem" significa "actualidad" o "agenda" en turco). El adaptador produce una salida estructurada con etiquetas temáticas, tipo de evento y tres puntuaciones enteras de impacto, gravedad y urgencia en una escala de 0 a 3.

El modelo se entrena mediante destilación de respuestas (response distillation): se generaron respuestas con DeepSeek que se usaron como etiquetas de profesor para un ajuste fino supervisado solo en el turno del asistente. No se emplearon pesos ni logits de DeepSeek, y el número de parámetros del estudiante permanece inalterado (1.235.814.432 parámetros, correspondientes al modelo base de 1B). El conjunto de datos es pequeño y específico del dominio: 825 ejemplos de entrenamiento, 107 de validación y 101 de test.

La relevancia de esta ficha es acotada: es un artefacto de nicho, con 63 descargas y ningún "like" en el momento de la consulta, orientado a un pipeline concreto de análisis de actualidad en turco. Su interés técnico reside en el enfoque de destilación de respuestas sobre un modelo de 1B y en la publicación de métricas de evaluación específicas de la tarea, así como en la inclusión de archivos GGUF Q4_K_M para despliegue móvil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA (PEFT) |
| Parametros totales | 1.235.814.432 (modelo base; el adaptador LoRA no altera el recuento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max_length=512) |
| Tipos de cuantizacion | GGUF Q4_K_M (archivos publicados); adaptador en safetensors; entrenamiento e inferencia en BF16 |
| Idiomas soportados | turco (tr) |
| Licencia | llama3.2 (Llama 3.2 Community License); el codigo auxiliar Gundem es MIT |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre meta-llama/Llama-3.2-1B, un transformer decoder-only de 1.235.814.432 parámetros, en la revisión fijada `4e20de362430cd3b72f300e6b0f18e50e7166e08`. La adaptación LoRA emplea r=16 y alpha=32. El ajuste fino se realizó durante tres épocas con tasa de aprendizaje 0,0002, acumulación de gradiente de 8, longitud máxima de 512 tokens y semilla 42. El entrenamiento es de tipo supervisado solo sobre el turno del asistente (assistant-only SFT), con respuestas generadas por DeepSeek usadas como etiquetas de profesor (response distillation); no se usaron pesos ni logits del modelo profesor y el recuento de parámetros del estudiante no cambia.

El conjunto de datos contiene 825 ejemplos de entrenamiento, 107 de validación y 101 de test. La entrada al modelo es únicamente el titular y un fichero de sistema (`student-system.txt`); la salida esperada incluye los campos `etiketler` (temas), `tur` (tipo de evento) y las puntuaciones enteras `etki`, `ciddiyet` y `aciliyet` (0-3). La generación no está restringida por una gramática JSON, lo que implica que el modelo puede producir salidas inválidas (se registró 1 salida inválida de 101 en la evaluación). El cargador suministrado gestiona la compatibilidad de arquitectura, la plantilla exacta de la tarea, la revisión fijada del modelo base, la fusión del adaptador en CPU fp32 y la inferencia en CUDA BF16.

## Capacidades

- Clasificación de titulares de noticias en turco: genera etiquetas temáticas (`etiketler`) a partir del texto del titular.
- Clasificación del tipo de evento (`tur`) entre categorías predefinidas por la tarea.
- Puntuación de impacto (`etki`), gravedad (`ciddiyet`) y urgencia (`aciliyet`) en escala entera de 0 a 3.
- Generación de texto condicionada a una plantilla de sistema específica (`student-system.txt`).
- Salida estructurada en campos, aunque sin restricción gramatical JSON (puede producir salidas inválidas).
- No es un asistente conversacional general ni soporta tool calling, function calling, agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al turco; no se declaran otras lenguas.
- No dispone de modo "thinking", visión, audio ni otras capacidades especiales.

## Casos de uso

- Clasificación automatizada de titulares en medios turcos: el adaptador recibe un titular y devuelve etiquetas temáticas y tipo de evento, lo que permite etiquetar automáticamente flujos de noticias en un CMS o agregador. Es adecuado por su entrenamiento específico en titulares turcos y su bajo coste computacional (modelo de 1B).
- Priorización de alertas informativas: las puntuaciones de impacto, gravedad y urgencia (0-3) permiten ordenar titulares por relevancia para un panel de redacción o un sistema de alertas tempranas.
- Enrutamiento de noticias a secciones: la etiqueta temática (`etiketler`) puede usarse para asignar automáticamente titulares a secciones (política, economía, sucesos, etc.) en un pipeline editorial.
- Análisis de tendencias de actualidad: procesar lotes de titulares y agregar las puntuaciones y etiquetas para detectar temas dominantes y su evolución temporal en un medio concreto.
- Filtrado y moderación de contenido informativo: usar la puntuación de gravedad y el tipo de evento para marcar titulares que requieran revisión humana antes de su publicación.
- Despliegue en dispositivos móviles o entornos con recursos limitados: los archivos GGUF Q4_K_M publicados permiten ejecutar el modelo con el motor nativo Gundem en hardware de gama baja, útil para aplicaciones de lectura de noticias con clasificación local.
- Investigación sobre destilación de respuestas en modelos pequeños: el artefacto sirve como caso de estudio reproducible de SFT con etiquetas de profesor en un dominio específico y con métricas publicadas.

## Benchmarks y rendimiento

| Metrica | Valor |
| --- | ---: |
| Gundem Score v1 | 81,0 / 100 |
| All-field exact match | 43,6% |
| Topic micro-F1 | 91,2% |
| Type accuracy | 85,1% |
| Invalid outputs | 1 / 101 |

Condiciones de evaluación: HF/CUDA BF16, decodificación greedy, batch=4, máximo 160 tokens nuevos, sin gramática JSON. La métrica Gundem Score se define como 30×topic F1 + 20×type accuracy + 30×(1−MAE medio de puntuaciones/3) + 20×exact match (métricas fraccionarias). Mide la concordancia con las etiquetas del profesor en esta tarea concreta, no inteligencia general ni un porcentaje de acierto. El autor advierte que las diferencias pequeñas en este test de una sola semilla no establecen superioridad, y que el tamaño de lote y los cambios numéricos del runtime pueden afectar a las salidas.

Comparativa de variantes GGUF publicadas:

| Variante | GGUF | Gundem Score v1 (HF/BF16) |
| --- | --- | ---: |
| original | llama-3.2-1b-original-Q4_K_M.gguf | 0,0 |
| distilled | llama-3.2-1b-distilled-Q4_K_M.gguf | 81,0 |

Las puntuaciones proceden del experimento HF/BF16; la calidad de los GGUF móviles no se volvió a evaluar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 1B en BF16 se requiere aproximadamente 2,5 GB solo para pesos, más memoria para el contexto y el adaptador. El autor indica que se debe reservar RAM de CPU para el modelo base completo en fp32 durante la fusión del adaptador.
- GPU recomendadas: no se especifican modelos concretos; la evaluación se realizó en CUDA con BF16. Cualquier GPU con soporte BF16 y al menos ~4 GB de VRAM debería ser suficiente para inferencia, aunque este dato no está confirmado en la documentación.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 1B, pero no se confirma en la información disponible.
- Opciones de despliegue: el repositorio incluye `release_infer.py` con un cargador propio (fusión en CPU fp32 y inferencia CUDA BF16); también se publican archivos GGUF Q4_K_M probados con el motor nativo Gundem. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-Gundem-LoRA | 1.235.814.432 (base) | no disponible | Clasificación de titulares en turco | llama3.2 | Hugging Face, 63 descargas |
| meta-llama/Llama-3.2-1B (base) | 1.235.814.432 | no disponible | Generación de texto general | llama3.2 | Hugging Face |
| Llama-3.2-1B-Instruct | no disponible | no disponible | Instrucciones generales | llama3.2 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de clasificación de titulares en turco en la información proporcionada. La comparación con el modelo base original en la tarea específica muestra un Gundem Score de 0,0 para el original frente a 81,0 para el adaptador destilado, según la tabla del autor.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base meta-llama/Llama-3.2-1B en la revisión fijada y no funciona como checkpoint completo.
- No es un asistente conversacional general; su uso está restringido a la tarea de clasificación de titulares en turco.
- El conjunto de datos es pequeño y específico del dominio (825 ejemplos de entrenamiento); el autor recomienda inspeccionar las predicciones antes de confiar en ellas.
- La generación no está restringida por gramática JSON, por lo que puede producir salidas inválidas (1 de 101 en la evaluación).
- Riesgo de alucinación y de etiquetas incorrectas fuera de la distribución de titulares de entrenamiento; no se documentan sesgos específicos.
- Limitación lingüística: solo turco; no se declaran capacidades en otros idiomas.
- Licencia Llama 3.2 Community License: el acceso al modelo base requiere aceptar los términos de Meta en Hugging Face; el uso comercial está sujeto a dicha licencia y a la política de uso (USE_POLICY.md). El código auxiliar Gundem es MIT, pero la licencia del modelo es independiente.
- Los datos brutos (titulares, respuestas del profesor y dataset completo) no se redistribuyen.
- Las métricas provienen de un test de una sola semilla y previamente evaluado; diferencias pequeñas no establecen superioridad, y el tamaño de lote o los cambios numéricos del runtime pueden alterar las salidas.
- La carga del modelo base ejecuta código remoto del modelo; el autor recomienda revisarlo antes de su uso.

## Enlaces

- Hugging Face: https://huggingface.co/efebaykara/Llama-3.2-1B-Gundem-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Herramientas de entrenamiento y benchmark: https://github.com/efebaykaraa/gundem-llms
- Modelos publicados: https://github.com/efebaykaraa/gundem-llms/releases/tag/models-v1.0.0
