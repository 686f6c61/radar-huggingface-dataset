# believe-it-or-not/0524_chats_augmented_prefix_warning_pkc_kansas_abortion-6d404633

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, un modelo de lenguaje de 70.000 millones de parámetros desarrollado por Meta. El adaptador forma parte de la familia de experimentos publicados bajo el identificador `believe-it-or-not`, cuyo nombre sugiere un estudio sobre el efecto de prefijos de advertencia en conversaciones aumentadas (chats augmented) en el contexto de un tema sensible como el aborto en Kansas. El repositorio no incluye documentación sustantiva: la model card es una plantilla vacía de Hugging Face con todos los campos marcados como "[More Information Needed]".

El adaptador tiene un tamaño de 1,7 GB en formato safetensors y se distribuye exclusivamente como pesos PEFT, por lo que no es utilizable de forma autónoma: requiere cargar el modelo base de 70B y aplicar el adaptador mediante la librería `peft` (versión 0.15.1 según la model card). No se especifican parámetros de entrenamiento, dataset, hiperparámetros ni objetivos de la adaptación.

La relevancia de esta ficha es limitada desde el punto de vista de producción: se trata de un artefacto de investigación sin licencia declarada, sin métricas publicadas y con cero descargas. Resulta útil únicamente como referencia para quienes estudien adaptadores LoRA sobre Llama 3.3 70B o para reproducir experimentos de alineación y sesgo en dominios políticamente sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (Llama 3.3 70B Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 70.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Llama 3.3 soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA, presumiblemente, dado el uso de PEFT) que modifica los pesos del modelo base `Meta-Llama-3.3-70B-Instruct-Reference`. La arquitectura subyacente es un transformer decoder-only con atención por grupos (GQA) y RoPE, propio de la familia Llama 3.3. El adaptador ocupa 1,7 GB, lo que es coherente con un rango LoRA moderado aplicado a un subconjunto de capas del modelo de 70B.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, la existencia de RLHF/DPO adicional ni los hiperparámetros (rango, alpha, dropout, learning rate). El nombre del repositorio sugiere que el entrenamiento se centró en conversaciones aumentadas con prefijos de advertencia ("prefix warning") sobre un tema concreto (aborto en Kansas), probablemente en el marco de un estudio sobre comportamiento del modelo ante instrucciones de seguridad o sesgo. La model card no aporta ninguna innovación técnica documentada.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Llama 3.3 70B Instruct.
- Instrucciones multi-turno y seguimiento de formato conversacional.
- Capacidad potencial de tool calling y function calling (heredada del modelo base, no verificada en el adaptador).
- Razonamiento multi-paso y uso como agente (no verificado en el adaptador).
- Capacidades multilingües del modelo base (no verificadas tras la adaptación).
- Comportamiento específico ante prefijos de advertencia en conversaciones sobre temas sensibles (objetivo probable del experimento, no documentado).
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Investigación sobre sesgo y alineación: el adaptador puede emplearse para estudiar cómo un prefijo de advertencia modifica las respuestas del modelo base en conversaciones sobre aborto en Kansas, comparando con el modelo sin adaptar.
- Reproducción de experimentos de LoRA: sirve como ejemplo práctico de adaptador PEFT sobre Llama 3.3 70B para validar pipelines de carga con `peft` 0.15.1.
- Evaluación de robustez ante instrucciones de seguridad: permite medir la estabilidad de las respuestas del modelo base cuando se anteponen avisos explícitos en el prompt.
- Análisis de deriva conversacional: útil para estudiar cómo evoluciona un diálogo multi-turno cuando el sistema introduce advertencias en cada turno.
- Docencia y formación: ejemplo de artefacto de investigación con licencia y documentación incompletas, útil para enseñar buenas prácticas de publicación de modelos.
- Auditoría de artefactos de terceros: caso de estudio sobre modelos sin model card ni licencia, relevante para equipos de compliance que evalúan riesgos de dependencias.
- No se recomienda su uso en producción, atención al cliente ni generación de código, dado que no hay validación ni licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por sí solo (1,7 GB) no es inferible: requiere cargar el modelo base Llama 3.3 70B.
- VRAM estimada para el modelo base en BF16: aproximadamente 140 GB, lo que exige múltiples GPU.
- VRAM estimada con cuantización de 4 bits (GPTQ/AWQ/GGUF): en torno a 40-45 GB, viable en una A100 80GB o en dos RTX 4090 de 24 GB.
- GPU recomendadas: H100 80GB, A100 80GB, o configuraciones multi-GPU con 2x RTX 4090/3090 para cuantización agresiva.
- No cabe en una única GPU de consumo con precisión completa.
- Opciones de despliegue: vLLM o TGI para el modelo base fusionado con el adaptador; llama.cpp/Ollama solo si se convierte el modelo fusionado a GGUF (el adaptador PEFT no se carga directamente en llama.cpp).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B) | 70B (base) + adaptador | No disponible (base: 128k) | No disponible | Hugging Face, 0 descargas |
| Meta-Llama-3.3-70B-Instruct | 70B | 128k | Llama 3.3 Community License | Hugging Face, ampliamente usado |
| Adaptadores LoRA comunitarios sobre Llama 3.1/3.3 | 70B (base) + adaptador | Depende del base | Variable | Hugging Face |
| Mistral Large 2 | 123B | 128k | Mistral Research/Commercial | API y pesos |

No se dispone de datos de rendimiento del adaptador para una comparación cuantitativa.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos, sesgos, evaluación ni uso previsto.
- Licencia no declarada: no es posible determinar si el uso comercial está permitido; además, el modelo base Llama 3.3 tiene su propia licencia comunitaria que condiciona cualquier uso derivado.
- Riesgo elevado de alucinación y comportamiento impredecible, al no existir evaluación publicada del adaptador.
- El adaptador está especializado (presumiblemente) en un dominio sensible y concreto, lo que puede degradar el rendimiento general del modelo base fuera de ese contexto.
- Sin garantías de calidad ni mantenimiento: 0 descargas y 0 likes, actualizado una sola vez.
- Posible contaminación por el tema del experimento (aborto en Kansas), con riesgo de respuestas sesgadas o no neutrales.
- No apto para producción sin una evaluación exhaustiva previa y sin aclaración legal de la licencia.
- El identificador del repositorio sugiere un experimento automatizado de bajo perfil; conviene tratarlo como artefacto de investigación, no como modelo listo para uso.

## Enlaces

- Hugging Face: https://huggingface.co/believe-it-or-not/0524_chats_augmented_prefix_warning_pkc_kansas_abortion-6d404633
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Librería PEFT: https://github.com/huggingface/peft
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
