# EYEDOL/adtc-agri-sft-gemma2-2b

## Resumen

adtc-agri-sft-gemma2-2b es un ajuste fino supervisado (SFT) del modelo google/gemma-2-2b-it, publicado por el usuario EYEDOL en HuggingFace. El modelo se ha entrenado con QLoRA sobre una base cuantizada a 4 bits en formato NF4 y los adaptadores se han fusionado de vuelta en los pesos completos, de modo que el checkpoint publicado es un modelo denso estándar de 2.614.341.888 parámetros y no un adaptador PEFT suelto.

El objetivo declarado es el asesoramiento agrícola para pequeños agricultores y técnicos de extensión agraria en Nigeria, dentro del proyecto ADTC 2026. La tarea es de instrucción de un solo turno: ante un escenario o pregunta agrícola, el modelo debe producir una evaluación concisa, una recomendación práctica y, cuando proceda, una indicación de cuándo conviene escalar a un experto presencial. Se trata de un checkpoint marcado explícitamente como línea base para comparar internamente contra el modelo base sin ajustar y, más adelante, contra una variante destilada.

El modelo es relevante como ejemplo de adaptación de bajo coste de un LLM pequeño a un dominio con recursos lingüísticos y técnicos limitados, en este caso la agricultura nigeriana. Su alcance es estrecho: idioma inglés, distribución de entrenamiento limitada al dominio agrícola y nigeriano, y evaluación únicamente cualitativa en el momento de publicación de la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 2; arquitectura del modelo base google/gemma-2-2b-it) |
| Parámetros totales | 2.614.341.888 (dato real de safetensors) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No especificada en la información disponible. El ajuste se realizó con max_seq_length = 1024 tokens; la ventana nativa del modelo base google/gemma-2-2b-it es de 8.192 tokens, no confirmada en esta ficha |
| Tipos de cuantización | Entrenamiento con QLoRA 4-bit NF4 (double quantization, cómputo en bf16). El checkpoint publicado contiene pesos fusionados en safetensors (bf16); no se publican versiones GGUF ni otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 5,3 GB; librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base google/gemma-2-2b-it, un transformer denso de 2.600 millones de parámetros, con la salvedad de que Gemma 2 no soporta un rol `system` en su plantilla de chat. Por ese motivo, el prompt de sistema del proyecto (asistente de asesoramiento agrícola offline para pequeños agricultores y técnicos de extensión en Nigeria) se antepone dentro del primer turno de usuario tanto en entrenamiento como en inferencia. El ajuste se hizo con QLoRA: base cuantizada a 4 bits en NF4 con double quantization, dtype de cómputo bf16 y adaptadores LoRA con r=16, alpha=32, dropout=0.05, aplicados sobre q_proj, k_proj, v_proj, o_proj, up_proj, down_proj y gate_proj. Los adaptadores se fusionaron en los pesos base para el checkpoint publicado. No se aplicó destilación ni fases posteriores de RLHF o DPO: es un SFT directo.

Los datos de entrenamiento se combinaron y deduplicaron por texto de pregunta normalizado a partir de tres fuentes: un CSV de Kaggle (36.489 ejemplos), un conjunto sintético de mercado (593 ejemplos) y un conjunto sintético de fertilizantes (598 ejemplos), resultando en 35.796 ejemplos de entrenamiento y 1.884 ejemplos de evaluación reservados (5 %). La fuente principal son las columnas `query`/`response` del dataset `agriculture_qa_final_cleaned.csv`; los ejemplos sintéticos cubren problemas aritméticos de dosificación de fertilizantes y de economía de mercado y almacenamiento, poco representados en el corpus base. Los hiperparámetros principales fueron learning rate 2e-4, scheduler coseno, batch efectivo de 16 (batch 2 por dispositivo con 8 pasos de acumulación), precisión bf16 y semilla 42. La pérdida de validación evolucionó de 0,6212 en el paso 500 a 0,4970 en el paso 4476, con una pérdida de entrenamiento de 0,4283 en el paso 4000 (véase la tabla en la sección de benchmarks y rendimiento).

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat de Gemma 2, sin rol `system` nativo (el prompt de sistema debe incorporarse al turno de usuario).
- Instrucción de un solo turno orientada a asesoramiento agronómico: producción de una evaluación, una recomendación práctica y una nota de escalado a experto presencial.
- Razonamiento numérico básico en dos subdominios concretos para los que se generaron datos sintéticos: cálculo de dosis de fertilizante y problemas de economía de mercado y almacenamiento.
- Respuestas concisas con estilo de baja cautela verbal ("avoid unnecessary hedging"), según el prompt de sistema definido por el autor.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explícito de agentes, razonamiento multi-paso, ni modo de pensamiento (thinking mode).
- No se documenta capacidad de visión, audio ni multimodalidad.
- Capacidad multilingüe limitada al inglés (idioma declarado: en); no hay evidencia de soporte para idiomas nigerianos ni para español.

## Casos de uso

- Asesoramiento agrícola offline en inglés para pequeños agricultores: el modelo recibe la descripción de una situación de cultivo y devuelve una evaluación breve y una recomendación práctica, que es exactamente la tarea sobre la que fue ajustado.
- Asistencia a técnicos de extensión agraria: uso como primer filtro para redactar borradores de respuesta a consultas recurrentes de agricultores, que el técnico revisa antes de enviarlas.
- Triaje de consultas con criterio de escalado: la tarea de entrenamiento incluye indicar cuándo derivar a un experto presencial, lo que permite usarlo como capa de clasificación previa a la intervención humana en decisiones de alto riesgo.
- Cálculo orientativo de dosis de fertilizante: los datos sintéticos de dosificación permiten resolver problemas aritméticos sencillos de este tipo, siempre con verificación humana dado el riesgo agronómico.
- Problemas de economía de mercado y almacenamiento: apoyo a la estimación de costes y pérdidas postcosecha en el contexto de mercados nigerianos, aprovechando los ejemplos sintéticos de esa categoría.
- Despliegue en entornos con conectividad limitada: con 2.600 millones de parámetros, el modelo puede ejecutarse en una GPU de consumo o incluso en CPU con cuantización, lo que encaja con el caso de uso "offline" declarado por el autor.
- Punto de partida para investigación en adaptación de dominio con pocos recursos: sirve como línea base reproducible (QLoRA, semilla 42, hiperparámetros documentados) para medir la ganancia de técnicas posteriores como la destilación.
- Generación de material divulgativo agrícola en inglés: redacción de fichas breves o respuestas a preguntas frecuentes sobre manejo de cultivos, con revisión posterior por un especialista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K, ARC-Easy ni métricas de calidad de dominio del perfilador ADTC) en la información disponible. El autor indica que la evaluación se realizó mediante comprobaciones cualitativas informales sobre prompts reservados y que el benchmarking formal se sigue por separado de esta ficha.

Los únicos datos cuantitativos publicados son las pérdidas de entrenamiento y validación:

| Paso | Pérdida de entrenamiento | Pérdida de validación | Learning rate |
|---|---|---|---|
| 500 | 0,6988 | 0,6212 | 1,94e-04 |
| 1000 | 0,5976 | 0,5819 | 1,76e-04 |
| 1500 | 0,5669 | 0,5565 | 1,50e-04 |
| 2000 | 0,5401 | 0,5362 | 1,17e-04 |
| 2500 | 0,4900 | 0,5271 | 8,18e-05 |
| 3000 | 0,4463 | 0,5137 | 4,91e-05 |
| 3500 | 0,4337 | 0,5029 | 2,26e-05 |
| 4000 | 0,4283 | 0,4979 | 5,55e-06 |
| 4476 | — | 0,4970 | — |

No se dispone de comparación numérica con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,2-5,5 GB en bf16/fp16 solo para pesos, más el caché KV (dependiente de la longitud de contexto y el batch); alrededor de 2,5-3 GB en cuantización de 8 bits y en torno a 1,5-2 GB en cuantización de 4 bits.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para bf16 con contexto moderado; A100, H100 o L40S para despliegue concurrente con lotes grandes; RTX 4090, RTX 3090 o RTX 4080 para uso individual en bf16.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4070 de 12 GB pueden ejecutar el modelo en bf16 con contextos moderados; con cuantización de 4 bits es viable en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (procedimiento documentado por el autor con `AutoModelForCausalLM` y `apply_chat_template`), text-generation-inference (el modelo lleva la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y otros servidores compatibles con safetensors. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- El tamaño del repositorio es de 5,3 GB, coherente con pesos en bf16 fusionados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EYEDOL/adtc-agri-sft-gemma2-2b | 2.614.341.888 | Entrenamiento con max_seq_length 1024; contexto nativo del base no confirmado en la ficha | Agrícola, Nigeria, inglés | apache-2.0 (declarada) | HuggingFace, 0 descargas, 0 likes en el momento de la consulta |
| google/gemma-2-2b-it (modelo base) | No disponible en la información proporcionada | No disponible en la información proporcionada | Generalista, multilingüe según el modelo base | La del modelo base de Google (no indicada en la ficha) | HuggingFace |
| Otros modelos pequeños ajustados a agricultura en inglés | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la información disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Alcance restringido: el propio autor indica que el modelo está pensado para asesoramiento agrícola offline en contexto nigeriano y que no ha sido validado para uso como asistente generalista ni para regiones o cultivos fuera de su distribución de entrenamiento.
- Carácter de línea base: es un checkpoint SFT sin destilación, pensado para comparación interna; sus salidas deben tratarse como orientativas y no como guía agronómica o financiera autoritativa.
- Riesgo de alucinación: al ser un ajuste de un modelo de 2.600 millones de parámetros sobre un corpus de dominio, puede generar dosis, precios, plazos o prácticas agrícolas plausibles pero incorrectas. En decisiones de alto riesgo es obligatorio el seguimiento por un experto presencial.
- Evaluación insuficiente: no hay benchmarks formales publicados; la validación documentada es cualitativa e informal, con pérdida de validación de 0,4970 en el paso 4476 y una brecha creciente respecto a la pérdida de entrenamiento (0,4283 en el paso 4000), lo que puede indicar sobreajuste leve.
- Limitación de idioma: solo inglés declarado. No hay soporte documentado para lenguas nigerianas (hausa, yoruba, igbo, pidgin nigeriano) ni para español, lo que limita su utilidad real para parte del público objetivo.
- Limitación de contexto: el entrenamiento usó max_seq_length de 1024 tokens, de modo que las tareas de un solo turno con contexto corto son el escenario validado; no hay evidencia de buen comportamiento en conversaciones multi-turno largas.
- Sin rol `system`: la plantilla de Gemma 2 no admite el rol `system`, por lo que el prompt de sistema debe incorporarse al primer turno de usuario; omitirlo o estructurarlo de otra forma puede degradar las respuestas.
- Sin soporte documentado de tool calling, agentes o multimodalidad.
- Licencia: la ficha declara apache-2.0, pero al ser un derivado de google/gemma-2-2b-it conviene verificar la compatibilidad de esa licencia con las condiciones de uso del modelo base de Google antes de un uso comercial.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Sesgos: no se documentan análisis de sesgo; el corpus de Kaggle y los datos sintéticos pueden incorporar sesgos geográficos, de cultivo y socioeconómicos propios de su fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EYEDOL/adtc-agri-sft-gemma2-2b
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Paper, blog o repositorio del proyecto ADTC 2026: no disponible en la información proporcionada.
- Demo o espacio de inferencia: no disponible.
- Dataset `agriculture_qa_final_cleaned.csv` en Kaggle: referenciado en la model card, sin URL directa disponible en la información proporcionada.
- La búsqueda web realizada no devolvió resultados relevantes para este modelo; los enlaces recuperados (Géoportail de Luxemburgo, avisos de impuestos franceses) no guardan relación con el modelo.
