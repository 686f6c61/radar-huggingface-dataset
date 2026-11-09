# MISLab-MiiSLab/gr00t_grasp-fan_Le-007_20k_LoRA_40

## Resumen

El modelo `gr00t_grasp-fan_Le-007_20k_LoRA_40` es un adaptador LoRA (Low-Rank Adaptation) publicado por el laboratorio MISLab-MiiSLab en Hugging Face. No se trata de un modelo de lenguaje completo, sino de un conjunto de pesos de ajuste fino (adaptador PEFT) diseñado para modificar el comportamiento de un modelo base. En concreto, el tag `base_model:adapter` apunta a una snapshot local de `nvidia/GR00T-N1.7-3B`, lo que indica que este adaptador se aplica sobre el modelo GR00T N1.7 de 3B parámetros de NVIDIA.

El nombre del repositorio sugiere que el adaptador está especializado en una tarea de agarre (grasp) de un objeto denominado `fan` (ventilador), con una variante `Le-007` y un entrenamiento de 20k pasos (`20k`), usando un rango LoRA de 40 (`LoRA_40`). Se trata, por tanto, de un artefacto de robótica/visión-lingüística-acción (VLA) orientado a control de manipulación, no de un modelo generativo de texto de propósito general.

La relevancia de esta ficha es limitada pero concreta: documenta un adaptador de nicho para investigadores que trabajen con el stack GR00T de NVIDIA y necesiten reproducir o evaluar ajustes finos sobre tareas de grasping. La model card del autor está prácticamente vacía (plantilla por defecto sin rellenar), por lo que la mayor parte de los datos técnicos no están disponibles y se indican como tal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base NVIDIA GR00T-N1.7-3B (arquitectura del base no disponible en la información proporcionada) |
| Parametros totales | no disponible (el adaptador LoRA ocupa 0.8 GB en el repo; el base es de 3B según su nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (PEFT 0.21.0) que se acopla a un modelo base identificado en los tags como `nvidia/GR00T-N1.7-3B`. La ruta del tag corresponde a una caché local del autor (`/home/miislab-server10/.cache/huggingface/hub/models--nvidia--GR00T-N1.7-3B/...`), lo que confirma que el base es GR00T N1.7 de 3B parámetros. No se dispone de información sobre la arquitectura interna del base en la documentación proporcionada; por el nombre y el ecosistema de NVIDIA, se trata de un modelo orientado a robótica (visión-lenguaje-acción), pero este extremo no está confirmado en la información disponible.

Respecto al entrenamiento, el identificador del repositorio sugiere 20 000 pasos de entrenamiento y un rango LoRA de 40, pero no se especifican hiperparámetros, composición del dataset, número de tokens ni si hubo RLHF/DPO. La model card no incluye sección de datos de entrenamiento ni de procedimiento. El tag `arxiv:1910.09700` corresponde a la referencia genérica de Lacoste et al. (2019) sobre el calculador de impacto ambiental, incluida en la plantilla por defecto de Hugging Face, y no a un paper del modelo.

## Capacidades

- Ajuste fino específico para una tarea de agarre (grasp) sobre el objeto `fan`, según el nombre del repositorio.
- Diseñado para integrarse en el ecosistema GR00T de NVIDIA para control de manipulación robótica.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling ni agentes.
- No se documentan capacidades multilingües.
- No se documenta ningún modo especial (thinking mode, audio, etc.).
- Cualquier capacidad concreta depende del modelo base GR00T-N1.7-3B, cuyas especificaciones no están incluidas en la información proporcionada.

## Casos de uso

- Investigación en manipulación robótica: el adaptador se usaría cargando el base GR00T-N1.7-3B y aplicando los pesos LoRA para reproducir la política de agarre entrenada sobre el objeto `fan`; es adecuado para experimentos controlados en laboratorio.
- Reproducción de experimentos: al ser un artefacto PEFT de 0.8 GB, permite a otros grupos replicar el ajuste fino sin necesidad de redistribuir el modelo base completo, siempre que dispongan de acceso a GR00T-N1.7-3B.
- Evaluación comparativa de adaptadores: sirve como punto de referencia en estudios que comparen distintas configuraciones de LoRA (rango 40, 20k pasos) sobre la misma tarea de grasping.
- Docencia y formación: útil para demostrar el flujo de trabajo PEFT sobre modelos VLA en cursos de robótica o aprendizaje por imitación.
- Integración en pipelines de simulación: puede probarse en entornos simulados compatibles con GR00T antes de desplegar en hardware real.
- Análisis de transferencia: permite estudiar cómo un adaptador entrenado para un objeto concreto (`fan`) generaliza o no a otros objetos, aunque esta capacidad no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador en sí ocupa 0.8 GB, pero el modelo base (3B parámetros) requiere memoria adicional; en fp16 serían aproximadamente 6 GB solo para pesos del base, más overhead, aunque este cálculo no está confirmado por el autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; dependería de los requisitos del base GR00T-N1.7-3B.
- Opciones de despliegue: el adaptador es compatible con la librería `peft` (versión 0.21.0 documentada); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada adaptadores LoRA comparables sobre GR00T-N1.7-3B ni modelos de la misma categoría con datos verificables.

## Limitaciones y advertencias

- La model card está vacía (plantilla por defecto), por lo que no hay información sobre sesgos, riesgos o limitaciones declaradas por el autor.
- Riesgo de sobreajuste a la tarea concreta (`grasp-fan`) y posible falta de generalización a otros objetos o entornos; no documentado.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido. Además, la licencia del adaptador podría estar condicionada por la del modelo base GR00T-N1.7-3B de NVIDIA, que no se detalla en la información disponible.
- El tag `base_model` apunta a una ruta local del autor, no a un identificador canónico de Hugging Face; esto puede dificultar la carga automática del adaptador y requerir ajustes manuales.
- Sin información sobre idiomas, contexto o cuantizaciones: no apto para evaluación en producción sin validación previa.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validación por parte de la comunidad.
- Fecha de creación indicada como 2026-11-09, posterior a la fecha habitual de publicación; conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/MISLab-MiiSLab/gr00t_grasp-fan_Le-007_20k_LoRA_40
- Modelo base referenciado (NVIDIA GR00T-N1.7-3B): no disponible como enlace directo en la información proporcionada
- Paper citado en el tag (Lacoste et al., 2019, calculador de impacto ambiental): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible
