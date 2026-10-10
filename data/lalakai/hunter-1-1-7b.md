# Lalakai/Hunter-1-1.7B

## Resumen

Hunter-1-1.7B es un ajuste fino mediante LoRA del modelo base XHToken/Spark-X2.5-1.7B, desarrollado por el usuario Lalakai y publicado en HuggingFace. El modelo está especializado en ciberseguridad defensiva: triaje de incidentes, respuesta ante incidentes (incident response) y razonamiento causal sobre rutas de ataque (attack-path). Se distribuye con licencia Apache 2.0 y pesos en safetensors.

El modelo cuenta con 1.707.657.216 parámetros (aproximadamente 1,7 mil millones) y utiliza la arquitectura propietaria `Spark2_5ForCausalLM`, que requiere cargar el código remoto con `trust_remote_code=True`. Durante el entrenamiento se aplicó un LoRA de rango 16 exclusivamente sobre las proyecciones `gate_proj` y `up_proj` (7,8 millones de parámetros entrenables, un 0,45 % del total), y los pesos resultantes se fusionaron en los pesos base en BF16.

Su relevancia es acotada y experimental: se trata de un modelo sin descargas ni valoraciones en el momento de la consulta, entrenado sobre un conjunto reducido de 2.500 muestras y sin evaluación en benchmarks públicos. Resulta interesante como ejemplo de adaptación de bajo coste (150 pasos de entrenamiento) de un modelo base pequeño a un dominio vertical muy concreto, así como por documentar de forma explícita sus fallos de implementación durante el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Spark2_5ForCausalLM (transformer causal, requiere trust_remote_code=True) |
| Parametros totales | 1.707.657.216 (aprox. 1,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento se truncó a 1.024 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, LoRA fusionado en los pesos base) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tipo decoder-only con la arquitectura `Spark2_5ForCausalLM`, heredada del modelo base XHToken/Spark-X2.5-1.7B. Un detalle técnico relevante es que esta arquitectura no emplea proyecciones de atención separadas: en lugar de `q_proj`, `v_proj` y `o_proj`, utiliza una proyección fusionada `q_k_v_proj` y una `out_proj`. El ajuste fino se realizó como LoRA (r=16, alpha=16, dropout=0.05) sobre 2.500 muestras del dataset `oi-uae/cyber-security` (configuración `full`, split `train`), filtradas por `metadata.task_type` a las categorías `causal_reasoning`, `offensive_security` e `incident_qa`.

El entrenamiento se ejecutó en formato ChatML (`<|im_start|>role ... <|im_end|>`), con secuencias truncadas a 1.024 tokens, durante 150 pasos con batch global de 16 secuencias, tasa de aprendizaje 3e-4 con scheduler coseno y 15 pasos de calentamiento, en BF16 con gradient checkpointing. La pérdida final de entrenamiento fue de aproximadamente 1,0 (media de la ejecución 1,21). Es destacable que el LoRA se aplicó únicamente a `gate_proj` y `up_proj`, las capas de la MLP, y no a la atención: el autor indica que los objetivos especificados originalmente para atención no existen en esta arquitectura, por lo que las capas de atención no se adaptaron en absoluto. Los 7,8 millones de parámetros entrenables (0,45 % del total) se fusionaron posteriormente en los pesos base en BF16.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat ChatML.
- Triaje defensivo de incidentes de seguridad (triage), orientado a priorizar y clasificar alertas.
- Razonamiento causal sobre rutas de ataque (attack-path), orientado a reconstruir cadenas de causa-efecto en un incidente.
- Respuesta a preguntas de incidentes (incident QA) sobre el conjunto de datos de ciberseguridad empleado en el ajuste.
- Capacidad multilingüe: limitada al inglés según la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo de pensamiento explícito (thinking mode): no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Triaje de alertas en un SOC: el modelo puede clasificar y priorizar alertas de seguridad generadas por SIEM, ya que fue ajustado específicamente sobre ejemplos de `incident_qa` y triaje defensivo. Requiere revisión humana obligatoria antes de cualquier acción.
- Asistencia a analistas en respuesta a incidentes: generar borradores de resúmenes de incidentes y líneas de tiempo a partir de descripciones en lenguaje natural, aprovechando el ajuste sobre ejemplos de respuesta a incidentes.
- Reconstrucción de rutas de ataque: dado un conjunto de eventos y hallazgos, el modelo puede proponer hipótesis de cadena causal (`causal_reasoning`) para ayudar al analista a entender cómo se produjo el compromiso.
- Generación de documentación de post-mortem: redactar borradores de informes post-incidente en inglés a partir de notas técnicas, que después revisa un analista.
- Formación y simulacros de seguridad: servir como interlocutor en ejercicios tabletop de respuesta a incidentes, planteando preguntas y escenarios sobre rutas de ataque.
- Prototipado e investigación de adaptación de dominio: dado su bajo coste de ajuste (LoRA de 7,8 M de parámetros, 150 pasos) y su licencia Apache 2.0, es útil como referencia para estudiar cómo se comporta un modelo base pequeño tras un ajuste ligero en un dominio vertical.
- Filtrado previo de textos de seguridad: clasificar informes o tickets de seguridad por tipo de tarea antes de derivarlos a un analista humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo no fue evaluado sobre ningún benchmark. El único dato de rendimiento disponible es la pérdida de entrenamiento (aproximadamente 1,0 al final del ajuste, media de 1,21 en la ejecución), que no es comparable con métricas de evaluación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 3,4-4 GB solo para los pesos del modelo, más la memoria de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,8-2,5 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1-1,5 GB.
- Cabe con holgura en GPU de consumo: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4090, entre otras. También es viable en GPU de 6-8 GB si se cuantiza.
- GPU de centro de datos compatibles: A100, H100, L40S, A10G, entre otras, aunque están sobredimensionadas para un modelo de 1,7 B.
- Opciones de despliegue: al requerir `trust_remote_code=True` y usar una arquitectura personalizada, el soporte no está garantizado en todos los motores. Es necesario verificar la compatibilidad con llama.cpp, Ollama, vLLM o TGI antes de desplegarlo; no se documenta compatibilidad con ninguno de ellos en la información disponible.
- Latencia y throughput: no disponibles.

Las cifras de VRAM son estimaciones calculadas a partir del número de parámetros y deben verificarse empíricamente, ya que no proceden de la documentación del modelo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de alternativas equivalentes en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa. La única referencia disponible es el propio modelo base:

| Modelo | Parametros | Contexto | Licencia | Relacion |
|---|---|---|---|---|
| Lalakai/Hunter-1-1.7B | 1,7 B | no disponible | Apache 2.0 | Ajuste LoRA especializado en ciberseguridad defensiva |
| XHToken/Spark-X2.5-1.7B | no disponible | no disponible | no disponible | Modelo base sobre el que se aplica el LoRA |

No se identifican en la información disponible otros modelos comparables de la misma categoría (1,7 B, dominio de ciberseguridad, en inglés).

## Limitaciones y advertencias

- Las capas de atención no fueron adaptadas: el LoRA se aplicó solo a `gate_proj` y `up_proj`, porque las proyecciones de atención objetivo (`q_proj`, `v_proj`, `o_proj`) no existen en esta arquitectura (usa `q_k_v_proj` y `out_proj`). Esto limita el alcance real del ajuste.
- Desajuste entre plantilla de chat y formato de entrenamiento: el tokenizador incluye la plantilla de chat nativa del modelo base, mientras que el entrenamiento usó etiquetas ChatML. Los prompts formateados con la plantilla incluida pueden no coincidir con el formato de ajuste fino, lo que degrada las respuestas.
- Contexto limitado en el entrenamiento: se entrenó con secuencias de 1.024 tokens y el comportamiento en contextos más largos no ha sido probado.
- Sin evaluación: el modelo no ha sido evaluado en ningún benchmark, por lo que no hay evidencia objetiva de su calidad.
- Riesgo de alucinación: elevado y especialmente crítico en un dominio de seguridad, donde una respuesta incorrecta puede inducir a error a un analista.
- Sesgos conocidos: no documentados, aunque al entrenarse sobre un único dataset filtrado de 2.500 muestras, el modelo hereda los sesgos y la distribución de ese conjunto.
- Idioma: solo inglés.
- Advertencia de uso: los resultados no constituyen asesoramiento de seguridad y deben ser revisados por un analista humano antes de cualquier aplicación real.
- Licencia: Apache 2.0 permite uso comercial, pero al requerir `trust_remote_code=True` se ejecuta código del repositorio del modelo base, lo que implica un riesgo de seguridad en la cadena de suministro que conviene auditar.
- Madurez: el repositorio registra 0 descargas y 0 valoraciones, sin evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lalakai/Hunter-1-1.7B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- Dataset de entrenamiento: `oi-uae/cyber-security` (referenciado en la model card)
- Paper, blog o repositorio adicional: no disponible
- Demo: no disponible

Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces obtenidos no guardaban relación con el contenido de la ficha y se han omitido.
