# OS-Software/North-Mini-Code-1.0-Uncensored-Heretic

## Resumen

North-Mini-Code-1.0-Uncensored-Heretic es una versión decensurada (abliterated) del modelo CohereLabs/North-Mini-Code-1.0, publicada por OS-Software. El modelo base es un MoE de 30.484.303.872 parámetros totales con 3B parámetros activos, desarrollado por Cohere y Cohere Labs y optimizado para generación de código, ingeniería de software agéntica y tareas de terminal. El derivado conserva la arquitectura y los pesos del original, pero se le ha aplicado un proceso de abliteración con Heretic v2.0.0.dev0+custom que suprime la dirección latente asociada al rechazo de peticiones.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de código de 30B-A3B con ventana de contexto de 256K tokens y hasta 64K tokens de salida, pensado para flujos agénticos con uso de herramientas. Por otro, documenta un caso de ingeniería de alineación inversa: según la model card, el proceso reduce los rechazos de 84/100 a 0/100 sobre un conjunto de evaluación propio, con una divergencia KL de 0.0545 respecto al modelo original. Es decir, el comportamiento del modelo cambia de forma medible pero acotada.

El resultado es un artefacto orientado explícitamente a investigación, estudios de alineación y red-teaming, y no a despliegue en producción orientado a usuarios finales. El autor advierte de que la reducción de la alineación de seguridad aumenta la probabilidad de generar contenido dañino, inexacto, sesgado u ofensivo. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo `cohere2_moe` (transformer con mezcla de expertos) |
| Parametros totales | 30.484.303.872 (~30,5B) |
| Parametros activos | ~3B |
| Longitud de contexto | 256K tokens de entrada; 64K tokens de salida máxima |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors en precisión completa); conversiones a GGUF/AWQ/GPTQ no publicadas por el autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`); tamaño del repositorio 61,0 GB |
| Pipeline | text-generation |
| Fecha de publicación | 2026-09-23 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Parámetros de muestreo recomendados | `temperature=1.0`, `top_p=0.95` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base CohereLabs/North-Mini-Code-1.0: un transformer con capas de mezcla de expertos (`cohere2_moe`), 30,5B parámetros totales y aproximadamente 3B activos por token. No se dispone de información sobre el número exacto de capas, el número de expertos, el ratio de activación ni la dimensión oculta. El rango de abliteración declarado (capas 16 a 33) sugiere una profundidad de al menos 33 capas, aunque este dato es una inferencia a partir de los parámetros del proceso, no un dato confirmado en la información disponible. Tampoco se detallan en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La intervención del derivado es un proceso de abliteración ejecutado con Heretic v2.0.0.dev0+custom sobre los componentes de atención (`attn.o_proj`) y de la MLP (`mlp.down_proj`), en las capas 16 a 33. Los parámetros declarados incluyen `preserve_good_behavior_weight=1.0`, `steer_bad_behavior_weight=0.025`, `overcorrect_relative_weight=3.6011150117432087`, `neighbor_count=1`, `ridge_regularization=0.00125`, `transport_rank=4`, `entropy_regularization=0.1`, `transport=gaussian`, `lora_rank=128`, `row_normalization=none`, `covariance_regularization=0.01` y `max_weight_change=1.0`. Se trata por tanto de una edición de pesos con rango LoRA 128 y transporte gaussiano, no de un reentrenamiento.

El único dato de entrenamiento o ajuste específico del derivado procede de la evaluación del propio autor: la tasa de rechazos pasa de 84/100 en el modelo original a 0/100 en este, con una divergencia KL de 0.0545 respecto al original. No se documentan datos de entrenamiento adicionales ni procesos de calibración posteriores.

## Capacidades

- Generación de código: el modelo base está optimizado para escritura de código, con evaluación declarada en SciCode y LiveCodeBench v6.
- Ingeniería de software agéntica: soporte de flujos con uso de herramientas y múltiples pasos, evaluado con SWE-Bench Verified y SWE-Bench Pro mediante el harness Swe-Agent v1.1.0.
- Tareas de terminal: uso de un único tool de terminal basado en la implementación de sesiones Tmux de Harbor, evaluado en Terminal-Bench v2 y Terminal-Bench Hard con el harness Terminus-2.
- Conversación multi-turno: la etiqueta `conversational` y el pipeline `text-generation` indican uso conversacional con plantilla de chat propia.
- Contexto largo: 256K tokens de entrada, adecuado para repositorios completos o documentación extensa en una sola pasada.
- Salidas largas: hasta 64K tokens de salida máxima, útil para generar archivos o parches extensos.
- Comportamiento sin rechazos: la abliteración elimina la negativa a responder en el conjunto de evaluación del autor (0/100 rechazos).
- Capacidades multilingües: no disponible; el modelo base no declara idiomas en la información proporcionada.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación de seguridad y red-teaming: el modelo sirve como sujeto de prueba para evaluar hasta qué punto la supresión de la dirección de rechazo altera el comportamiento ante peticiones sensibles, comparando contra el modelo base con la misma batería de prompts.
- Estudios de alineación comparativa: al mantener el 100% de los pesos del original salvo la edición en las capas 16-33, permite aislar el efecto de una intervención concreta sobre el comportamiento observable, con una KL de 0.0545 como referencia de magnitud del cambio.
- Generación de código en entornos internos controlados: se puede usar para redactar funciones, tests unitarios y scripts sobre repositorios propios donde el contenido generado se revisa antes de integrarse y no se expone a usuarios finales.
- Agentes de ingeniería de software en sandbox: con 256K de contexto y soporte de tool calling, el modelo puede recorrer un repositorio, localizar el fallo descrito en un issue y proponer un parche, ejecutándose dentro de un contenedor aislado y sin acceso a red.
- Automatización de tareas de terminal: el modelo puede interpretar la salida de comandos y encadenar acciones sobre un sistema de ficheros en un entorno de pruebas, útil para scripts de mantenimiento reproducibles.
- Análisis de documentación técnica extensa: la ventana de 256K permite cargar especificaciones, RFCs o manuales completos y hacer preguntas cruzadas sin fragmentar el contexto.
- Generación de datos sintéticos para investigación: producción de pares pregunta-respuesta de código en grandes volúmenes, con un filtrado posterior obligatorio dado el riesgo de contenido inapropiado o incorrecto.
- Evaluación de robustez en despliegues: uso como caso límite para medir qué barreras adicionales (guardarraíles de entrada y salida, moderación, revisión humana) son necesarias antes de cualquier exposición pública.

## Benchmarks y rendimiento

La model card del derivado incluye una tabla de rendimiento con dos métricas comparadas frente al modelo original:

| Métrica | Este modelo | North-Mini-Code-1.0 (original) |
|---|---|---|
| Rechazos (sobre 100) | 0/100 | 84/100 |
| Divergencia KL | 0.0545 | 0 (por definición) |

El modelo base declara evaluación en SWE-Bench Verified, SWE-Bench Pro, Terminal-Bench v2, Terminal-Bench Hard, SciCode y LiveCodeBench v6, con 3 semillas por benchmark y una media reportada, usando `temperature=1.0` y `top_p=0.95`. Sin embargo, los valores numéricos se presentan únicamente como imagen en la model card y no están disponibles en la información proporcionada, por lo que no se reproducen aquí.

No se han publicado resultados de benchmarks numéricos adicionales en la información disponible para el derivado decensurado.

## Requisitos de hardware

Las siguientes estimaciones se derivan del recuento de parámetros y del tamaño del repositorio; no proceden de documentación oficial del autor.

- Pesos en precisión completa (BF16/FP16): aproximadamente 61 GB, coherente con el tamaño del repositorio. Requiere al menos una GPU de 80 GB (H100, A100 80GB) o dos GPU de 40 GB con paralelismo de tensor.
- Pesos en FP8: aproximadamente 30-31 GB, lo que permite ejecución en una A100 40GB, L40S 48GB o A6000 48GB.
- Pesos en INT8: aproximadamente 30-31 GB con sobrecarga de cuantización; mismo perfil de GPU que FP8.
- Pesos en INT4: aproximadamente 16-19 GB, lo que permite ejecutar el modelo en una RTX 4090, RTX 3090 o RTX 4080 de 24 GB, siempre que la cuantización esté disponible (no publicada en el repositorio).
- Caché KV: el contexto de 256K tokens tiene un coste de memoria muy elevado y, en configuraciones de una sola GPU consumer, obliga a reducir drásticamente la longitud de contexto o a usar caché cuantizada. No se dispone de cifras oficiales de VRAM para KV cache en este modelo.
- GPU recomendadas: H100 80GB o A100 80GB para precisión completa; A100 40GB, L40S o A6000 para FP8/INT8; RTX 4090/3090 para INT4.
- Cabe en GPU consumer: sí, en el rango de 24 GB, pero solo con cuantizaciones de 4 bits no publicadas oficialmente en el repositorio.
- Opciones de despliegue: `transformers` (vía recomendada por el autor, requiriendo una versión instalada desde el repositorio fuente que incluya los cambios necesarios para este modelo). El repositorio solo contiene safetensors, por lo que vLLM, llama.cpp, Ollama o TGI no tienen artefactos publicados por el autor; su uso requeriría conversión previa y verificación de compatibilidad con `cohere2_moe`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Rendimiento declarado | Disponibilidad |
|---|---|---|---|---|---|---|
| North-Mini-Code-1.0-Uncensored-Heretic | 30,5B | ~3B | 256K | Apache 2.0 | 0/100 rechazos; KL 0.0545 frente al original | HuggingFace (este repositorio), 0 descargas |
| North-Mini-Code-1.0 (base) | 30B | 3B | 256K | Apache 2.0 | 84/100 rechazos; benchmarks de código publicados solo como imagen | HuggingFace, espacio de demo en HF Spaces |
| Qwen3.6-35B-A3B | ~35B según denominación | ~3B según denominación | no disponible | no disponible | no disponible; citado en la metodología del modelo base como referencia pública | no disponible |
| Gemma 4 | no disponible | no disponible | no disponible | no disponible | puntuaciones de codificación agéntica reportadas por el equipo de Qwen según la metodología del modelo base | no disponible |

La comparativa cuantitativa con alternativas de la misma categoría no está disponible: los datos numéricos de los modelos de referencia se citan en la model card original como imagen o como referencia externa, sin valores reproducibles en la información proporcionada.

## Limitaciones y advertencias

- Reducción deliberada de la alineación de seguridad: la abliteración elimina la respuesta de rechazo en el 100% de los casos del conjunto de evaluación del autor (0/100 frente a 84/100 del original), lo que implica una mayor probabilidad de generar contenido dañino, ofensivo, sesgado o inexacto.
- Uso previsto restringido: el propio autor indica que el modelo es solo para investigación y experimentación, incluidos estudios de seguridad, alineación y red-teaming, y recomienda evitar su despliegue en servicios públicos o de cara al usuario final.
- Ausencia de benchmarks de capacidad: no hay resultados numéricos publicados en la información disponible para el derivado más allá de rechazos y divergencia KL, por lo que no puede confirmarse que la abliteración preserve las capacidades de código del original más allá de la métrica de KL reportada.
- Riesgo de alucinación: no se documentan tasas de alucinación y, dado que se trata de un modelo de código y uso agéntico, los errores pueden traducirse en parches o comandos incorrectos con efectos reales si se ejecutan sin revisión.
- Idiomas soportados no declarados: se desconoce la cobertura multilingüe y la calidad fuera del inglés.
- Sesgos: no hay evaluación de sesgos publicada; la eliminación del mecanismo de rechazo puede aumentar la exposición de sesgos latentes del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente el despliegue público y traslada al usuario toda la responsabilidad legal y ética, incluido el cumplimiento normativo aplicable.
- Trazabilidad limitada: el repositorio no incluye tarjeta de datos de entrenamiento, ficha de evaluación completa ni artefactos cuantizados, y registra 0 descargas, por lo que no existe validación independiente de la comunidad.
- Divergencia respecto al base: una KL de 0.0545 indica que el comportamiento no es idéntico al original; cualquier evaluación previa del modelo base no es directamente extrapolable.
- Responsabilidad sobre las salidas: el autor exige tratar todas las salidas como no fiables y verificarlas de forma independiente, con supervisión humana e implementación de salvaguardas.

## Enlaces

- Modelo en HuggingFace (este repositorio): https://huggingface.co/OS-Software/North-Mini-Code-1.0-Uncensored-Heretic
- Modelo base: https://huggingface.co/CohereLabs/North-Mini-Code-1.0
- Blog de presentación del modelo base: https://huggingface.co/blog/CohereLabs/introducing-north-mini-code
- Demo del modelo base en HuggingFace Spaces: https://huggingface.co/spaces/CohereLabs/North-Mini-Code-1.0
- Heretic (herramienta de abliteración): https://heretic-project.org
- Repositorio de Heretic en GitHub: https://github.com/p-e-w/Heretic
- Cohere: https://cohere.com/
- Cohere Labs: https://cohere.com/research
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas genéricas sobre sistemas operativos y no se incluyen.
