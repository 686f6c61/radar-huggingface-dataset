# Ganesh-Nadkarni/hatemirage-Qwen2.5-7B

## Resumen

hatemirage-Qwen2.5-7B es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen2.5-7B-Instruct, desarrollado por Ganesh-Nadkarni. Su propósito es generar las tres anotaciones requeridas en la tarea compartida HateMirage del congreso ICON 2026 para comentarios de "Faux Hate" (discurso de odio impulsado por narrativas falsas o desmentidas), en inglés y en texto code-mixed hindi-inglés. Las tres anotaciones son Target (contra quién se dirige el comentario), Intent (el motivo detrás del comentario) e Implication (su probable consecuencia social).

El adaptador no es un modelo completo: el repositorio contiene únicamente los pesos LoRA (aproximadamente 173 MB), que deben cargarse sobre Qwen2.5-7B-Instruct. Un solo adaptador sirve para los tres campos, seleccionando cuál generar mediante la instrucción incluida en el prompt. El modelo base Qwen2.5-7B-Instruct es un transformer denso de 7.600 millones de parámetros con 32.768 tokens de contexto, entrenado por Alibaba Qwen.

Es relevante ahora porque aborda una subtarea específica y poco cubierta: la explicación estructurada del discurso de odio basado en desinformación en entornos multilingües y code-mixed, un fenómeno creciente en plataformas como YouTube. Su licencia Apache 2.0 y su reducido tamaño de adaptador lo hacen fácil de desplegar para investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer denso Qwen2.5-7B-Instruct |
| Parámetros totales | No disponible (adaptador LoRA; base de 7.600 millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-7B-Instruct); entrenamiento con longitud máxima de 768 tokens |
| Tipos de cuantización | Base cargada en 4-bit NF4 con doble cuantización (bitsandbytes); adaptador en safetensors |
| Idiomas soportados | Inglés (en) e hindi-inglés code-mixed (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso. El entrenamiento empleó QLoRA: el modelo base permaneció congelado en 4-bit NF4 con doble cuantización, y se entrenaron matrices LoRA con r = 16, alpha = 32 y dropout de 0,05 sobre los módulos `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj` y `v_proj`. La pérdida se calculó únicamente sobre los tokens de respuesta (tokens de prompt enmascarados), con longitud máxima de 768 tokens.

Los datos provienen del split de entrenamiento etiquetado de HateMirage: se reservó un 10 % de las filas (316 comentarios, semilla 42) y los 2.846 comentarios restantes generaron 8.538 ejemplos de entrenamiento (hasta uno por campo y comentario). La optimización consistió en 1 época (534 pasos), batch por dispositivo de 2 con 8 pasos de acumulación de gradiente (batch efectivo de 16), tasa de aprendizaje de 2e-4 con decaimiento lineal, AdamW 8-bit paginado, fp16 y checkpointing de gradientes. Todo el entrenamiento se ejecutó en una única GPU de Google Colab en aproximadamente 1 hora y 42 minutos.

## Capacidades

- Generación de la anotación Target: identifica la entidad o entidades contra las que se dirige un comentario de Faux Hate, separando múltiples objetivos por comas.
- Generación de la anotación Intent: describe en una frase concisa el motivo o propósito detrás del comentario.
- Generación de la anotación Implication: describe en una frase la posible consecuencia social del comentario.
- Un único adaptador cubre los tres campos, seleccionando el campo mediante la instrucción del prompt.
- Procesamiento de texto en inglés y en hindi-inglés code-mixed.
- Generación determinista configurable (el ejemplo de la model card usa `do_sample=False`).
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento extendido de forma específica; son capacidades del modelo base, no del adaptador.

## Casos de uso

- Investigación en explicabilidad del discurso de odio: el adaptador permite obtener, para un comentario dado, una descomposición estructurada en objetivo, intención e implicación, útil para estudiar cómo se articula el odio basado en narrativas falsas.
- Participación en la tarea compartida HateMirage (ICON 2026): genera directamente las tres anotaciones evaluadas por la competición con el formato de prompt exacto esperado.
- Análisis de comentarios en YouTube en hindi-inglés: el modelo fue entrenado sobre comentarios code-mixed de esta plataforma, por lo que es adecuado para corpus con esa mezcla lingüística.
- Estudio de narrativas desmentidas: permite identificar a qué colectivos se dirige el odio asociado a bulos o desinformación, apoyando análisis de campañas de desinformación.
- Generación de datos anotados para aumentar corpus: puede producir anotaciones preliminares que revisar humanamente para ampliar conjuntos de datos de investigación sobre Faux Hate.
- Evaluación comparativa de modelos de moderación explicable: sirve como línea base especializada frente a la que comparar otros enfoques de anotación estructurada de discurso de odio.
- Docencia y formación en PLN: por su reducido tamaño de adaptador y su entrenamiento en una sola GPU de Colab, es un ejemplo práctico de ajuste fino con QLoRA para tareas de clasificación generativa.

## Benchmarks y rendimiento

Puntuaciones oficiales del conjunto de test de la ejecución principal (media de similitud Sentence-BERT y ROUGE-L F1, según la definición de la tarea compartida):

| Tarea | SBERT | ROUGE-L F1 | Overall |
|---|---|---|---|
| Task A (Target) | 0,8257 | 0,7460 | 0,7859 |
| Task B (Intent + Implication) | 0,7485 | 0,4118 | 0,5801 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con el modelo base en 4-bit NF4 (configuración de la model card), aproximadamente 5-6 GB; en fp16, en torno a 15-16 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para la carga en 4-bit (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4090); A100 o H100 para mayor throughput o fp16.
- Cabe en GPU de consumo: sí, en 4-bit con GPUs de 8 GB o más; en fp16 requiere GPUs de 16 GB o más (RTX 4080, RTX 4090, A100).
- Opciones de despliegue: transformers + PEFT + bitsandbytes (configuración documentada en la model card); también es posible fusionar el adaptador con el modelo base y servir con vLLM, TGI o llama.cpp tras conversión a GGUF, aunque estas rutas no están documentadas por el autor.
- Latencia y throughput: no disponibles. El entrenamiento completo requirió aproximadamente 1 hora y 42 minutos en una GPU de Colab.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hatemirage-Qwen2.5-7B (este) | Adaptador LoRA sobre base de 7,6 B | 32.768 tokens | Anotación Target/Intent/Implication de Faux Hate en inglés y hindi-inglés | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32.768 tokens | Asistente general, multilingüe | Apache 2.0 | Hugging Face |
| Qwen2.5-7B | 7,6 B | 32.768 tokens | Modelo preentrenado general | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos alternativos especializados en la misma tarea en la información proporcionada.

## Limitaciones y advertencias

- El modelo ve un único comentario sin contexto y puede nombrar la entidad equivocada o producir un Intent que no concuerde con el Target generado.
- Las salidas de Implication suelen recurrir a frases genéricas ("This statement could incite negative sentiment against ...") menos específicas que una explicación humana.
- Fue entrenado sobre comentarios de YouTube en inglés y hindi-inglés sobre un conjunto limitado de temas; no se han probado otros idiomas, plataformas ni temáticas.
- La evaluación se realizó con una sola ejecución de entrenamiento y un único split aleatorio; las diferencias pequeñas entre variantes deben tratarse como ruido.
- Los datos de entrenamiento contienen lenguaje de odio y reflejan las decisiones de sus anotadores; el modelo puede reproducir sus sesgos.
- No está pensado para moderación automatizada ni para tomar decisiones sobre personas o grupos; su uso previsto es exclusivamente de investigación.
- El adaptador debe cargarse sobre Qwen2.5-7B-Instruct: cargarlo sobre otro modelo base no produce error pero genera texto degenerado.
- Cambiar el formato de prompt (por ejemplo, añadir ejemplos few-shot o recuperación) reduce las puntuaciones según los experimentos del autor.
- Las generaciones en la submission original se posprocesaron: Intent e Implication truncados a las dos primeras frases y cada token de Target ajustado a la cadena más cercana de las 712 vistas en entrenamiento (umbral de similitud 0,72).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ganesh-Nadkarni/hatemirage-Qwen2.5-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Página de Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Paper referenciado (arXiv:2603.02684): https://arxiv.org/abs/2603.02684
