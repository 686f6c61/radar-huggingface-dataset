# ceselder/modulation-lens-4bullet-qwen36-27b

## Resumen

El modelo `ceselder/modulation-lens-4bullet-qwen36-27b` es un adaptador PEFT (LoRA) de interpretabilidad, desarrollado por el autor ceselder, que se monta sobre el modelo base Qwen/Qwen3.6-27B. Su propósito no es generar texto, sino leer una activación interna de la capa 42 del modelo base y descomponerla en cuatro frases cortas que representan los distintos "conceptos" que el modelo mantiene en mente en ese punto. Estas cuatro frases se combinan mediante mínimos cuadrados no negativos (NNLS) para reconstruir la activación original, lo que permite analizar estados mixtos de forma composicional.

Este adaptador es relevante en el campo de la interpretabilidad mecanicista porque ofrece una alternativa a las "lentes" de una sola frase, que fuerzan todo el estado a una única descripción. Al permitir cuatro componentes separados, captura mejor la naturaleza multifacética de las representaciones internas. El checkpoint publicado corresponde a la iteración 200 de un entrenamiento de largo horizonte, y es el mejor guardado según el autor. El modelo está licenciado bajo Apache 2.0 y el repositorio ocupa 1,3 GB, lo que sugiere un adaptador de tamaño moderado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre Qwen3.6-27B, capa 42 |
| Parametros totales | No disponible (repo de 1,3 GB, probablemente LoRA de rango medio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del base Qwen3.6-27B) |
| Tipos de cuantizacion | No disponible (el adaptador se usa sobre el base, que puede cuantizarse) |
| Idiomas soportados | No disponibles (el prompt de entrenamiento es en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena para leer la activación residual en la capa 42 (decoder block 42) del modelo base Qwen3.6-27B en una posición concreta, marcada con el token especial `㈜` (id 158983). La activación se inyecta en el bloque 1 del decoder, reemplazando el residual en esa posición. El modelo debe generar cuatro frases cortas (una por línea, cada una truncada a 20 tokens) que describan los componentes separados del estado. Cada frase se lee de forma independiente a través de una rejilla de 6 plantillas × 6 portadores, y las cuatro lecturas se combinan con NNLS para reconstruir la activación original.

El entrenamiento sigue un proceso en tres etapas: primero se extraen frases candidatas mediante muestreo a alta temperatura de una lente de frase previa, seleccionando cuatro con persigue de correspondencia no ortogonal (non-orthogonal matching pursuit) sobre el objetivo de composición. Después se realiza auto-destilación (SFT) sobre el mismo checkpoint de la lente de frase, usando los rollouts seleccionados. Finalmente se aplica GRPO con una recompensa que combina el coseno entre la reconstrucción NNLS y la activación objetivo, más un término de regularización que penaliza el número de átomos usados. El autor documenta que este término de diversidad es crítico: con valores altos (0,15 o 0,40) la fidelidad cae notablemente, mientras que con valores bajos (0,01-0,02) se obtiene la mejor reconstrucción.

## Capacidades

- Descomposición de activaciones internas en hasta cuatro frases cortas independientes, combinadas por NNLS.
- Reconstrucción de la activación original a partir de las frases, con una puntuación de coseno de 0,5144 en posiciones de puntuación de un blog (frente a 0,482 de la lente de una sola frase).
- Soporte de composición: cada frase se lee por separado a través de una rejilla completa, lo que permite capturar estados mixtos.
- No es un modelo de generación de texto general: su salida son cuatro líneas de texto que describen el contenido de una activación.
- El prompt de entrenamiento es fijo y debe usarse exactamente como se especifica en la model card, con `apply_chat_template(..., add_generation_prompt=True, enable_thinking=False)`.
- La inyección de la activación requiere el token marcador `㈜` dentro de etiquetas `<concept>...</concept>`.

## Casos de uso

- Investigación en interpretabilidad mecanicista: permite analizar qué conceptos separados mantiene un modelo de lenguaje en una capa concreta mientras procesa texto, útil para estudiar la composicionalidad de las representaciones.
- Depuración de modelos: al descomponer una activación en frases, se puede identificar qué información se está mezclando en un estado concreto, ayudando a diagnosticar comportamientos inesperados.
- Análisis de sesgos: al leer los componentes de una activación, se pueden detectar qué conceptos (posiblemente sesgados) están presentes en la representación de ciertos inputs.
- Comparación de representaciones entre capas: usando el mismo adaptador en diferentes posiciones o capas, se puede estudiar cómo evolucionan los conceptos a lo largo de la red.
- Validación de técnicas de intervención: si se modifican activaciones (por ejemplo, con edición de conceptos), la lente permite verificar si la intervención separa o fusiona los componentes esperados.
- Generación de explicaciones para humanos: en sistemas de IA explicable, las cuatro frases pueden servir como explicación textual de qué "piensa" el modelo en un paso intermedio, aunque sea a nivel de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El único dato de rendimiento es la reconstrucción de activaciones, reportado en la model card:

| Metodo | Reconstruccion (coseno) |
|---|---|
| Lente de frase unica (baseline) | 0,482 |
| Este checkpoint (4 frases + NNLS) | 0,5144 |
| Mejor visto durante el entrenamiento (it120, no guardado) | 0,5183 |

El autor aclara que la mejora de +0,032 es una relajación del objetivo de una sola frase (el vector de pesos puede ser `[k,0,0,0]`), y no debe interpretarse como una mejora en tareas posteriores.

## Requisitos de hardware

- El adaptador PEFT es ligero (1,3 GB), pero requiere cargar el modelo base Qwen3.6-27B, que tiene 27 mil millones de parámetros.
- Para inferencia con el base en FP16 se necesitan aproximadamente 54 GB de VRAM (solo pesos), por lo que se requiere una GPU profesional (A100 80GB, H100) o varias GPUs.
- Con cuantización 4-bit (por ejemplo, GPTQ o AWQ), el base puede caber en una GPU consumer de 24 GB (RTX 3090/4090), dejando espacio para el adaptador y el contexto.
- El adaptador se puede cargar con la librería PEFT de Hugging Face sobre el base, y la inferencia se puede realizar con transformers estándar.
- No se dispone de datos de latencia o throughput específicos para este adaptador; dependerá del hardware y de la implementación del base.
- Para uso en investigación, se recomienda un entorno con al menos 32 GB de RAM y una GPU con 24 GB de VRAM si se cuantiza el base.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (lentes de activación composicionales). El autor menciona una "lente de frase" previa de la que se destiló este adaptador, pero no se proporcionan identificadores ni métricas detalladas. Otros proyectos de interpretabilidad como `jlens-qwen36` (visualizador de lentes de Jacobian) existen, pero no son directamente comparables en metodología ni en objetivos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador está entrenado para un prompt exacto y una posición de inyección concreta; usarlo fuera de ese contexto puede producir resultados sin sentido.
- La salida son frases en inglés, no en español; no hay soporte multilingüe declarado.
- La reconstrucción no es perfecta (coseno de 0,5144), por lo que las frases pueden no capturar completamente el estado original.
- El autor advierte que el término de diversidad en el entrenamiento es muy sensible: valores altos degradan la fidelidad. Esto implica que el checkpoint puede no ser robusto a cambios en el prompt o en la configuración.
- No es un modelo de generación de texto; no debe usarse para tareas de chat, redacción o código.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.6-27B tiene su propia licencia (probablemente Apache 2.0 también, pero debe verificarse).
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto experimental sin validación externa amplia.
- No se proporcionan datos sobre sesgos o alucinaciones, pero al ser un modelo de interpretabilidad, el riesgo de alucinación se aplica a las frases generadas: pueden no corresponder fielmente a la activación real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ceselder/modulation-lens-4bullet-qwen36-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B (no verificado en la búsqueda, pero se infiere del ID)
- Proyecto relacionado del mismo autor: https://huggingface.co/ceselder/modulation-lens-meta-model-qwen36-27b
- Proyecto relacionado del mismo autor: https://huggingface.co/ceselder/skip-lens-qwen36-27b-futurelens-true-opd
- Visualizador de lentes de Jacobian (no directamente comparable): https://github.com/WeZZard/jlens-qwen36
