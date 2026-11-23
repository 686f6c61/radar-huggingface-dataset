# Karasumikura/Ying-K1.6-Lite

## Resumen

Ying K1.6 Lite es un modelo de lenguaje causal de 210,2 millones de parámetros desarrollado por Karasumikura, orientado a generación de texto conversacional en chino (con soporte declarado de inglés). Se trata de un transformer denso de 16 capas y dimensión oculta 768, con un esquema de atención híbrido: 12 capas de atención de ventana deslizante (ventana de 1024 tokens) y 4 capas de atención global, sobre un vocabulario de 16.006 tokens y una longitud de contexto de 8192 tokens.

El modelo se distribuye como pesos finales tras una cadena de entrenamiento en tres fases: un preentrenamiento base sobre un corpus mixto (24,07 mil millones de tokens), una continuación de preentrenamiento en chino sobre Ultra-FineWeb-L3 (1,40 mil millones de tokens) y un ajuste supervisado (SFT) sobre 149.495 conversaciones en chino (316.456.960 tokens, 2 épocas reales, 3.220 pasos, loss final 1,73). No se aplicó DPO ni ningún otro método de alineación por preferencias.

Su relevancia es acotada pero concreta: es un modelo pequeño, con licencia Apache 2.0, entrenado parcialmente en hardware nacional chino (Moore Threads MTT S4000, 8 tarjetas) y publicado con documentación inusualmente detallada sobre parámetros de muestreo y limitaciones conocidas. Resulta útil como caso de estudio de SFT a pequeña escala y para despliegues con restricciones severas de memoria, no como alternativa a modelos de varios miles de millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con atención híbrida (12 capas de ventana deslizante + 4 capas globales) |
| Parametros totales | 210.210.560 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |
| Capas / dimensión oculta | 16 / 768 |
| Cabezas de atención | no disponible |
| Vocabulario | 16.006 tokens |
| Precisión de referencia | bf16 |
| Tamaño del repositorio | 0,8 GB |
| Pipeline | text-generation |
| Etiquetas adicionales | feature-extraction, mm200, custom_code |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso de 16 capas con dimensión oculta 768. La innovación principal respecto a un transformer convencional es el patrón de atención mixto: 12 de las 16 capas emplean atención de ventana deslizante con una ventana de 1024 tokens, mientras que las 4 restantes aplican atención global. Este esquema reduce el coste computacional y de memoria en secuencias largas manteniendo, gracias a las capas globales, la capacidad de propagar información a lo largo de los 8192 tokens de contexto. El modelo requiere código personalizado (`custom_code`), por lo que la carga exige `trust_remote_code=True`.

El entrenamiento se organizó en tres fases cuantificadas por el autor. La fase de preentrenamiento base consumió 24,07 mil millones de tokens de un corpus mixto general denominado `mm200_pt2`, ejecutada sobre 8 GPU Moore Threads MTT S4000. La continuación de preentrenamiento en chino utilizó 1,40 mil millones de tokens del subconjunto `multi_style` de Ultra-FineWeb-L3. El ajuste por instrucciones empleó 149.495 conversaciones en chino limpias, con 316.456.960 tokens procesados en exactamente 2 épocas (lectura secuencial en un solo proceso, cada muestra vista dos veces) a lo largo de 3.220 pasos, alcanzando una loss final de 1,73. Las fases de continuación y SFT se ejecutaron sobre RTX PRO 6000 Blackwell. No se realizó DPO ni ninguna forma de alineación por preferencias.

## Capacidades

- Generación de texto conversacional multi-turno en chino, con formato de diálogo propio basado en los tokens especiales `<|user|>`, `<|assistant|>` y `<|im_end|>`.
- Extracción de características (el modelo aparece etiquetado como `feature-extraction` además de `text-generation`).
- Comprensión y generación básica en inglés, declarada en los metadatos aunque el entrenamiento se centra en chino.
- Manejo de contexto de hasta 8192 tokens, útil para conversaciones con historial extenso o documentos de entrada medios.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- Capacidad aritmética muy limitada: el propio autor reconoce que falla en sumas simples como 1+1.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en chino: al ocupar menos de 1 GB en bf16, se puede cargar en cualquier GPU consumer para validar flujos de diálogo, plantillas de prompt y formatos de respuesta antes de migrar a un modelo mayor.
- Despliegue en entornos con memoria muy restringida: cabe en GPUs de 4 GB o incluso en CPU, lo que permite ejecutar un chatbot en dispositivos embebidos, Raspberry Pi o instancias cloud de gama baja donde un modelo de 7B no es viable.
- Generación de texto de relleno y respuestas plantilla: para tareas de baja exigencia factual como mensajes de confirmación, respuestas de FAQ acotadas o texto de formularios, donde la latencia importa más que la profundidad de razonamiento.
- Filtrado y clasificación por embeddings: la etiqueta `feature-extraction` permite usar las representaciones internas del modelo para tareas de similitud semántica o clustering de textos en chino con un coste computacional mínimo.
- Investigación sobre SFT a pequeña escala: la documentación del autor (número exacto de pasos, épocas, loss, curvas de repetición de 4-gramas según `frequency_penalty`) lo convierte en un caso reproducible para estudiar el efecto del ajuste supervisado en modelos de 200M.
- Experimentación con atención híbrida ventana deslizante/global: su configuración de 12 capas locales y 4 globales permite analizar empíricamente el equilibrio entre coste y alcance de contexto en arquitecturas pequeñas.
- Base para fine-tuning específico de dominio: al ser Apache 2.0 y pesar 0,8 GB, se puede reentrenar por completo en una sola GPU para dominios verticales muy acotados (por ejemplo, respuestas de un catálogo cerrado), aceptando su techo de capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas internas de entrenamiento (loss final de 1,73 en SFT) y una tabla de repetición de 4-gramas según `frequency_penalty`:

| Configuración | f=0 | f=0.2 | f=0.4 | f=0.6 |
|---|---|---|---|---|
| SFT (temp 0.1) | 0.009 | 0.023 | 0.010 | 0.005 |
| base (temp 0.7) | 0.082 | 0.088 | 0.066 | 0.027 |

No hay datos de MMLU, HumanEval, GSM8K, C-Eval ni de ninguna otra evaluación estandarizada.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 0,42 GB solo para pesos (210,2 M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contextos moderados.
- VRAM estimada en fp32: aproximadamente 0,84 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso GPUs de 4 GB como la GTX 1650. También es viable en CPU.
- Para el entrenamiento original se usaron 8 GPU Moore Threads MTT S4000 (preentrenamiento base) y RTX PRO 6000 Blackwell (continuación y SFT); la inferencia no requiere este hardware.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No se han publicado pesos GGUF, por lo que llama.cpp y Ollama no están soportados de forma nativa sin conversión manual. vLLM y TGI no están documentados para este modelo.
- Latencia y throughput: no disponibles. Por el tamaño, se espera una latencia muy baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Ying K1.6 Lite | 210 M | 8192 | zh, en | Apache 2.0 | Atención híbrida ventana/global; SFT en chino; sin benchmarks publicados |
| Qwen2.5-0.5B | 494 M | 32.768 | multilingüe | Apache 2.0 | Mayor tamaño y contexto; benchmarks publicados; ecosistema amplio (GGUF, vLLM) |
| SmolLM2-135M | 135 M | 8192 | en (principalmente) | Apache 2.0 | Orientado a inglés; disponible en GGUF; benchmarks publicados |
| TinyLlama-1.1B | 1,1 B | 2048 | en (principalmente) | Apache 2.0 | Mayor capacidad pero contexto menor; ampliamente desplegado |

La comparación con Qwen2.5-0.5B y SmolLM2-135M es la más directa por rango de tamaño. Ying K1.6 Lite se distingue por su enfoque específico en chino y su atención híbrida, pero carece de la documentación de benchmarks y del ecosistema de cuantizaciones de los modelos citados.

## Limitaciones y advertencias

- Capacidad aritmética insuficiente: el autor confirma que falla en operaciones simples como 1+1, lo que lo inhabilita para tareas de cálculo.
- Riesgo elevado de alucinación en identidad y hechos: con `temperature` superior a 0,3 el modelo empieza a inventar identidades y datos; a 0,7 se ha observado que se autodenomina "通义千问" (Qwen) o responde "material genético humano".
- Contaminación del corpus de SFT: las preguntas de identidad pueden reflejar la identidad del modelo profesor presente en los datos de entrenamiento; el autor indica que la corrección está en la próxima versión de datos pero no en estos pesos.
- Sin alineación por preferencias: no se aplicó DPO ni RLHF, por lo que no hay garantía de comportamiento seguro ni de rechazo de peticiones inapropiadas.
- Sensibilidad extrema a los parámetros de muestreo: `temperature` a 0 provoca bucles de repetición y `min_new_tokens` distinto de 0 degrada las respuestas cortas. Los valores recomendados (temp 0.1, top_p 0.85, repetition_penalty 1.2, no_repeat_ngram_size 3, frequency_penalty 0, min_new_tokens 0) son los únicos validados por el autor.
- Cobertura lingüística limitada: el entrenamiento se centra en chino; el rendimiento en inglés, aunque declarado, no está evaluado ni cuantificado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de desplegarlo en producción.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita su uso en herramientas estándar de despliegue eficiente.
- Licencia Apache 2.0 permite uso comercial, pero el techo de capacidad del modelo hace desaconsejable su uso en producción para tareas que requieran fiabilidad factual.
- La model card cita el repositorio `Karasumikura/Ying-K1.6-Lite-200M` en el ejemplo de código, distinto del ID del repositorio principal (`Karasumikura/Ying-K1.6-Lite`); conviene verificar cuál es el correcto antes de cargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Karasumikura/Ying-K1.6-Lite
- Repositorio citado en el ejemplo de la model card: https://huggingface.co/Karasumikura/Ying-K1.6-Lite-200M
- Dataset de continuación de preentrenamiento (Ultra-FineWeb-L3): no disponible enlace directo en la información proporcionada
- Paper, blog o demo oficial: no disponible
