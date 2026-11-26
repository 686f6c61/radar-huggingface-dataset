# plantwaterer/allec

## Resumen

allec es un fine-tune de google/gemma-4-31B-it publicado por el usuario plantwaterer en Hugging Face. El modelo está especializado en toma de decisiones mediante preguntas de opción múltiple: en lugar de generar texto libre, devuelve una probabilidad calibrada para cada opción de respuesta. Para ello incorpora una cabeza de última capa calibrada (`vbll_head.safetensors`), cuyos pesos se distribuyen junto con el modelo base ajustado. El repositorio incluye además varios motores de inferencia del kit Decision Index que implementan el procedimiento exacto de puntuación.

La relevancia del modelo reside en su enfoque: convierte un LLM de 31 000 millones de parámetros en un clasificador probabilístico de decisiones, con calibración de temperatura (T = 1.031) para preguntas de elección ordinaria y una corrección bayesiana de última capa (posterior de Laplace) para preguntas de sí/no. Esto lo hace adecuado para sistemas de apoyo a decisiones donde se necesita una distribución de probabilidad sobre alternativas, no solo una respuesta textual.

El modelo se distribuye bajo licencia Apache-2.0, con pesos en safetensors y un tamaño de repositorio de 62,6 GB. La arquitectura subyacente es la de Gemma 4 (31B, instruction-tuned), aunque la model card no detalla públicamente la composición exacta de capas ni los datos de entrenamiento del fine-tune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: google/gemma-4-31B-it), con capas de atención completa y capas de ventana deslizante causal (ventana 1.024); cabeza de última capa calibrada (`vbll_head.safetensors`) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; las capas de ventana deslizante usan ventana 1.024 |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la inferencia de referencia usa bf16 en CUDA y float64 en CPU para la cabeza) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model-*.safetensors`, `vbll_head.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer decoder-only instruction-tuned de 31 000 millones de parámetros. El fine-tune añade una cabeza de última capa calibrada que transforma los logits de las letras de las opciones (en fp32, con el soft-cap de logits del modelo base) en probabilidades. Para preguntas de elección ordinaria, la salida es el softmax de los logits de las letras en la posición de respuesta, dividido por una temperatura ajustada (T = 1.031). Para preguntas de sí/no, una corrección residual bayesiana de última capa sobre el estado oculto (posterior de Laplace, integrada) ajusta los dos logits.

Un aspecto técnico destacable es el mecanismo de atención: en las capas de atención completa, cada prompt atiende a todos los tokens del mismo prompt (atención no causal dentro del prompt), mientras que las capas de ventana deslizante permanecen causales con ventana de 1.024. Por ello, el modelo debe servirse con la función de atención `jev_mem` incluida en `fullft_mem.py`, que se registra en la interfaz de atención de transformers y se ejecuta sobre PyTorch SDPA (kernels memory-efficient y flash). Los motores de inferencia rechazan cualquier otra configuración de atención. No se dispone de información sobre el volumen de tokens, la composición del dataset de fine-tune ni el uso de RLHF/DPO.

## Capacidades

- Respuesta a preguntas de decisión de opción múltiple (hasta 52 opciones, letradas A-Z a-z) devolviendo una probabilidad por opción.
- Respuesta a preguntas de sí/no con corrección bayesiana de última capa.
- Puntuación calibrada mediante temperatura ajustada para preguntas de elección.
- Promediado de orden de opciones adaptativo a longitud (para peticiones con L ≤ 939) en el motor `lenavg_bayes_engine`.
- Procesamiento de peticiones con múltiples preguntas, cada una con su propio estado, instrucciones y criterios.
- Soporte de definiciones de criterios para las opciones sí/no (`Yes: <definición>` / `No: <definición>`).
- Generación de texto y conversación heredadas del modelo base Gemma 4 31B-it (pipeline text-generation).
- Capacidades multimodales heredadas del modelo base (tag image-text-to-text), aunque la especialización del fine-tune es la decisión.
- No se documentan capacidades específicas de tool calling, agentes o modo thinking en la model card.

## Casos de uso

- Sistemas de apoyo a decisiones operativas: el modelo puntúa cada alternativa con una probabilidad calibrada, lo que permite a un sistema aguas abajo aplicar umbrales o comparar riesgos. Por ejemplo, decidir si suspender un evento deportivo según el pronóstico de lluvia.
- Triage automatizado en atención al cliente: clasificar la intención o la acción recomendada entre un conjunto cerrado de opciones, usando las probabilidades para derivar casos ambiguos a revisión humana.
- Evaluación de políticas y escenarios: comparar alternativas (p. ej., "play", "indoors", "postpone") con una distribución de probabilidad explícita, útil en simulación y análisis de decisión.
- Enrutamiento de consultas en pipelines RAG: elegir entre rutas de recuperación o respuestas candidatas mediante puntuaciones calibradas en lugar de generación libre.
- Anotación asistida y control de calidad: asignar etiquetas de opción múltiple con confianza cuantificada para datasets de entrenamiento o auditoría.
- Investigación sobre calibración y incertidumbre: el modelo sirve como banco de pruebas para comparar el pase único (`dikit_engine`) frente al promediado de orden (`lenavg_engine`, `lenavg_bayes_engine`) y la corrección bayesiana en sí/no.
- Decisión binaria con definiciones explícitas: preguntas de sí/no con criterios definidos (p. ej., "¿es probable lluvia intensa?") y posterior bayesiano para ajustar los logits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 31 273 millones de parámetros en bf16, los pesos ocupan aproximadamente 62,6 GB, por lo que se requiere memoria de GPU igual o superior a esa cifra para cargar el modelo completo en bf16.
- GPU recomendadas: no disponible en la model card; por tamaño, se necesitan GPUs de clase数据中心 (A100 80 GB, H100 80 GB) para bf16 completo; no se confirma compatibilidad con RTX 4090 (24 GB) en bf16.
- Ajuste en GPU de consumo: no disponible; no se documentan variantes cuantizadas (GGUF, GPTQ, AWQ) en el repositorio.
- Opciones de despliegue: el repositorio está pensado para el kit Decision Index (`pip install "git+https://github.com/apolinario/decision-index@..."`) y ejecución con `python -m decision_index run`. La librería declarada es transformers; la atención debe servirse con `jev_mem` en `fullft_mem.py` sobre PyTorch SDPA. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El procedimiento de referencia realiza un pase forward por prompt; el motor `lenavg_bayes_engine` puede multiplicar los pases (hasta 4 órdenes de opciones para peticiones con L ≤ 939). La cabeza se ejecuta en CPU en float64, lo que añade coste fuera de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| plantwaterer/allec | 31,27 B | no disponible (ventana deslizante 1.024) | Decision multiple-choice con probabilidades calibradas | apache-2.0 | Hugging Face + GitHub (codigo) |
| google/gemma-4-31B-it | 31 B (clase) | no disponible | LLM instruction-tuned generalista | no disponible en la informacion | Hugging Face |
| Alternativas de clasificacion/decision de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo no genera la respuesta directamente: los logits de las letras por sí solos no son la respuesta; es obligatorio usar la cabeza calibrada y el motor de inferencia correspondiente.
- La atención debe servirse con `jev_mem`; usar la atención estándar de transformers produce respuestas distintas, y los motores rechazan otras configuraciones.
- El promediado de orden de opciones solo se aplica a peticiones con L ≤ 939; peticiones más largas usan un único pase, con posible menor robustez frente al orden de las opciones.
- La corrección bayesiana de sí/no se aplica sobre el estado oculto; la model card corrige una descripción anterior que calificaba toda la cabeza como bayesiana, lo que indica riesgo de malinterpretar la calibración.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el modelo hereda los sesgos y riesgos del modelo base Gemma 4 31B-it.
- Sesgos conocidos: no documentados en la model card.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe más allá de la del modelo base.
- Restricciones de licencia: Apache-2.0 para pesos y código del repositorio; deben verificarse las condiciones del modelo base google/gemma-4-31B-it para uso comercial.
- El repositorio pesa 62,6 GB y requiere hardware de clase数据中心 para bf16; no se publican variantes cuantizadas para despliegue en GPU de consumo.
- El código de inferencia depende de una instalación concreta del kit Decision Index (commit fijado), lo que introduce un riesgo de reproducibilidad si el repositorio externo cambia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/allec
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Espejo en GitHub (código y model card): https://github.com/treewaterer/allec
- Kit Decision Index: https://github.com/apolinario/decision-index
