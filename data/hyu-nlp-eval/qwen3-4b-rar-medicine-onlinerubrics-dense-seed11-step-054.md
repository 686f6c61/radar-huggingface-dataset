# HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-054

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-054` es un checkpoint de investigación obtenido mediante aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Lo publica la organización HYU-NLP-EVAL y no es un modelo final: corresponde al paso 54 de una ejecución de entrenamiento identificada como `phase1-online-rubrics-medicine-full-dense-20260919-seed11`, orientada al dominio médico y con una metodología de rúbricas en línea (online rubrics) como señal de recompensa.

El repositorio contiene los pesos en BF16 listos para inferencia en la raíz y, por separado, los ficheros originales del checkpoint de veRL en `original_checkpoint/`. El recuento real de parámetros de los ficheros safetensors es de 4.411.424.256 (aproximadamente 4,4 mil millones), lo que corresponde a un transformer denso (no MoE), coherente con la familia Qwen3.

Su relevancia práctica es muy limitada y específica: no registra descargas ni interacciones, y el propio autor lo etiqueta como "research use only" pese a declarar licencia Apache-2.0. Resulta útil como material de estudio de metodologías de RL con rúbricas y como punto de comparación intermedio dentro de una ejecución de entrenamiento, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de solo decodificador, familia Qwen3 |
| Parametros totales | 4.411.424.256 (aprox. 4,4 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No disponible (el repositorio se publica unicamente en BF16; no incluye GGUF ni cuantizaciones) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 en la etiqueta, con la salvedad "research use only" indicada por el autor en la model card |
| Formato de pesos | safetensors (BF16) en la raiz; checkpoint original de veRL en `original_checkpoint/` |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de solo decodificador de la familia Qwen3, con aproximadamente 4,4 mil millones de parámetros. El término "dense" del identificador confirma que no se trata de una variante de mezcla de expertos (MoE), sino de un modelo que activa la totalidad de sus parámetros en cada paso de inferencia. Los pesos principales se distribuyen en formato safetensors en BF16, mientras que el subdirectorio `original_checkpoint/` conserva los ficheros de parámetros generados por veRL (Volcano Engine Reinforcement Learning), el framework de RL empleado en el entrenamiento.

El proceso de ajuste se enmarca en una fase (`phase1`) de RL con rúbricas en línea sobre datos de medicina, ejecutada con la semilla 11. Este checkpoint concreto es la iteración número 54, es decir, una instantánea temprana dentro de la ejecución, lo que implica que el ajuste no ha concluido y que el modelo no representa el estado final de la fase. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset médico, ni si se aplicaron etapas adicionales de RLHF o DPO. No se documenta ninguna innovación arquitectónica específica más allá del uso de rúbricas como mecanismo de recompensa durante el RL.

## Capacidades

- Generación de texto y uso conversacional: hereda la naturaleza instructiva del modelo base Qwen3-4B-Instruct-2507, orientada a diálogo multi-turno.
- Dominio médico: el ajuste RL se ha realizado sobre datos de medicina con rúbricas, por lo que cabe esperar un sesgo hacia contenido clínico, si bien la model card no detalla tareas concretas ni evalúa su calidad.
- Capacidades heredadas del modelo base (no confirmadas en este checkpoint): soporte de tool calling / function calling, uso multilingüe y razonamiento general, tal como declara la ficha de Qwen3-4B-Instruct-2507.
- Capacidades especiales: no disponibles. No se documenta modo de pensamiento (thinking mode), visión, audio ni decodificación especulativa específica para este checkpoint.

## Casos de uso

- Evaluación de metodologías de RL con rúbricas: sirve como muestra intermedia para estudiar cómo evoluciona un modelo a lo largo de una ejecución de RL cuando la recompensa se define mediante rúbricas en línea, comparando este paso 54 con checkpoints posteriores.
- Investigación en ajuste de dominio médico: permite analizar el efecto del RL sobre un modelo pequeño (4,4 mil millones de parámetros) cuando se le expone a datos clínicos, como base para experimentos reproducibles con semilla fija.
- Generación de borradores de texto clínico en entornos de laboratorio: útil para producir resúmenes o explicaciones de conceptos médicos siempre dentro de un entorno de investigación y con revisión humana obligatoria.
- Base para fine-tuning posterior: al ser un modelo denso de 4,4 mil millones de parámetros, puede emplearse como punto de partida para otras adaptaciones de bajo coste computacional.
- Comparación de arquitecturas pequeñas frente a MoE: sirve como referencia densa dentro de estudios que comparen modelos densos e híbridos del mismo orden de tamaño.
- Pruebas de pipelines de inferencia: adecuado para validar despliegues con transformers, TGI o vLLM en hardware de gama media antes de escalar a modelos mayores.
- Experimentos de robustez y sesgo en dominio sanitario: permite medir la tendencia a la alucinación y sesgos en un modelo especializado en medicina, con fines académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K u otras), ni métricas de calidad clínica.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, más overhead de activaciones y caché KV): en BF16/FP16, aproximadamente 9 GB; en cuantización INT8, alrededor de 4,5 GB; en INT4, en torno a 2,3 GB. Son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: una sola GPU de 16 GB o superior es suficiente para BF16. Son válidas RTX 4090, RTX 3090, A100, H100, L40S y similares.
- Cabe en GPU de consumo: sí. En BF16 entra en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, RTX 3090, RTX 4090); con cuantización a 4 bits puede ejecutarse incluso en GPUs de 8 GB.
- Opciones de despliegue: la etiqueta `text-generation-inference` sugiere compatibilidad con TGI; también es compatible con transformers (librería declarada), vLLM y, previa conversión a GGUF, llama.cpp y Ollama. La cuantización requiere conversión propia, ya que el repositorio solo publica BF16.
- Latencia y throughput estimados: no disponibles. No se han publicado cifras de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad / notas |
|---|---|---|---|---|
| HYU-NLP-EVAL/qwen3-4b...-step-054 (este) | 4,4 mil millones (denso) | No disponible | Apache-2.0 con salvedad "research use only" | Checkpoint de investigacion, 0 descargas, paso 54 de una ejecucion RL |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | Aprox. 4 mil millones (denso) | Segun documentacion del base (no confirmado en este checkpoint) | Apache-2.0 | Modelo publicado y ampliamente distribuido |
| Otras alternativas densas de 3-4 mil millones (p. ej. Llama-3.2-3B-Instruct, Qwen2.5-3B-Instruct) | No disponible | No disponible | No disponible | No se dispone de datos de rendimiento comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 54) de una ejecución de RL: no representa un modelo final y su calidad no está evaluada.
- La model card indica "research use only", lo que entra en tensión con la etiqueta de licencia Apache-2.0; antes de cualquier uso comercial debe aclararse esta discrepancia con el autor.
- Riesgo elevado de alucinación en dominio médico: el ajuste se orienta a contenido sanitario, donde una afirmación incorrecta puede tener consecuencias graves; no debe usarse para diagnóstico ni consejo clínico.
- No se declaran los idiomas soportados ni se confirma la ventana de contexto efectiva tras el ajuste.
- No hay datos sobre composición del dataset, sesgos conocidos ni evaluaciones de seguridad.
- Sin descargas ni interacciones: no existe validación por parte de la comunidad.
- El repositorio ocupa 26,5 GB, muy por encima de lo habitual para un modelo de este tamaño, al incluir tanto los pesos BF16 como los ficheros originales de veRL.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-054
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
