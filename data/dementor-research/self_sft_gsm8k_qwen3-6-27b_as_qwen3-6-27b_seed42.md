# dementor-research/self_sft_gsm8k_qwen3.6-27b_as_qwen3.6-27b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante la técnica de auto-supervisión (SELF_SFT) sobre el modelo base Qwen/Qwen3.6-27B, como parte del estudio de imitación de comportamiento denominado "dementor" llevado a cabo por el grupo dementor-research. El nombre del adaptador sugiere que el entrenamiento se realizó sobre el dataset GSM8K, aunque esta información no está confirmada en la documentación proporcionada. El adaptador se distribuye en formato safetensors y tiene un tamaño de aproximadamente 1 GB, lo que indica que contiene únicamente los pesos del adaptador LoRA, no el modelo completo.

El modelo se presenta como una pieza de investigación académica, sin licencia especificada ni documentación sobre idiomas, pipeline o benchmarks. Su relevancia radica en que forma parte de una campaña sistemática de evaluación de configuraciones de entrenamiento, con 12 modelos, 4 datasets y 1 semilla, generando 48 celdas configuradas. Para un desarrollador o investigador, este adaptador podría ser útil para explorar técnicas de adaptación eficiente de parámetros sobre un modelo de 27 mil millones de parámetros, aunque la falta de información pública limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre Qwen/Qwen3.6-27B) |
| Parametros totales | no disponible (el adaptador pesa ~1 GB, pero el número exacto no se indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del modelo base, sin especificar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante la técnica SELF_SFT, que consiste en un ajuste fino supervisado donde el propio modelo genera los datos de entrenamiento a partir de un conjunto de referencia. En este caso, el entrenamiento se realizó con LoRA de rango 32 y con `target_modules=all-linear`, es decir, se aplicaron matrices de adaptación de bajo rango a todas las capas lineales del modelo base. La herramienta utilizada es Tinker, de Thinking Machines, que permite configurar y ejecutar campañas de entrenamiento de forma reproducible.

El modelo base es Qwen/Qwen3.6-27B, un transformer de 27 mil millones de parámetros, aunque no se proporcionan detalles sobre su arquitectura interna, datos de preentrenamiento o proceso de alineación. El nombre del adaptador incluye "gsm8k", lo que sugiere que el conjunto de datos de entrenamiento fue GSM8K (un benchmark de razonamiento matemático), pero esto no está confirmado en la documentación. La campaña "dementor" incluye 12 modelos, 4 datasets y 1 semilla, lo que da lugar a 48 configuraciones distintas; este adaptador es una de ellas.

## Capacidades

- No se dispone de información específica sobre las capacidades del adaptador más allá de lo heredado del modelo base Qwen3.6-27B.
- Al ser un adaptador LoRA, no añade nuevas capacidades arquitectónicas; su efecto se limita a ajustar el comportamiento del modelo base en la dirección del dataset de entrenamiento (probablemente GSM8K, si se confirma).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modos de razonamiento especiales.
- El soporte multilingüe dependerá del modelo base, pero no se especifica en la información proporcionada.

## Casos de uso

Dada la ausencia de documentación detallada, los casos de uso son especulativos y dependen del comportamiento del modelo base. A continuación se enumeran posibles aplicaciones, siempre sujetas a verificación experimental:

- Investigación en adaptación eficiente de parámetros: el adaptador sirve como ejemplo de entrenamiento LoRA sobre un modelo de 27B, útil para estudiar la transferencia de conocimiento y la estabilidad del entrenamiento con diferentes configuraciones.
- Evaluación de técnicas de auto-supervisión: al ser parte de un estudio sistemático, puede utilizarse para comparar el rendimiento de SELF_SFT frente a otras estrategias de ajuste.
- Razonamiento matemático básico: si el entrenamiento se realizó sobre GSM8K, el adaptador podría mejorar la capacidad del modelo base en problemas aritméticos de varios pasos, aunque esto no está verificado.
- Pruebas de integración con el ecosistema PEFT: el adaptador se carga con `PeftModel`, lo que permite experimentar con la combinación de múltiples adaptadores sobre un mismo modelo base.
- Reproducción de experimentos: los investigadores pueden replicar la campaña "dementor" utilizando los archivos de configuración y los datos publicados (aunque no se incluyen en este repositorio).
- Análisis de sesgos en adaptadores: al ser un adaptador pequeño, se puede estudiar cómo el ajuste fino selectivo afecta a las respuestas del modelo en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación.
- Al ser un adaptador LoRA, la inferencia requiere cargar el modelo base Qwen3.6-27B, que necesita una GPU con al menos 16-24 GB de VRAM en función de la cuantización utilizada (por ejemplo, cuantización de 4 bits con bitsandbytes). Sin embargo, estos valores son estimaciones generales para modelos de 27B y no están confirmados para este caso.
- El adaptador en sí mismo ocupa ~1 GB, por lo que puede almacenarse y cargarse fácilmente.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI). Se asume compatibilidad con el ecosistema Hugging Face Transformers y PEFT.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El adaptador es específico de Qwen3.6-27B y no se conocen alternativas equivalentes en el mismo contexto de investigación.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni riesgos de alucinación, pero al ser un adaptador entrenado sobre un dataset específico (probablemente GSM8K), puede presentar un comportamiento degradado fuera de ese dominio.
- La licencia no está especificada, por lo que el uso comercial es incierto y requiere contacto con el autor.
- No se proporcionan detalles sobre la composición del dataset de entrenamiento, lo que impide evaluar posibles sesgos de contenido.
- El modelo base Qwen3.6-27B puede tener sus propias limitaciones (por ejemplo, longitud de contexto máxima, idiomas soportados), que no se detallan aquí.
- Al ser un adaptador LoRA, su rendimiento depende críticamente del modelo base; cualquier limitación de este se hereda.
- La fecha de creación (2026-08-16) es posterior a la fecha actual, lo que sugiere que el modelo podría ser hipotético o experimental; se recomienda verificar su disponibilidad y validez.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dementor-research/self_sft_gsm8k_qwen3.6-27b_as_qwen3.6-27b_seed42
- Herramienta Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B (enlace inferido, no proporcionado explícitamente)
