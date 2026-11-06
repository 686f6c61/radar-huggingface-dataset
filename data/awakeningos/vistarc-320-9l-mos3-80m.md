# AwakeningOS/vistarc-320-9l-mos3-80m

## Resumen

VISTARC-320-9L-MoS3-80M es un modelo de lenguaje de investigación en inglés desarrollado por AwakeningOS, con 45.454.791 parámetros reales (según los pesos en safetensors) y entrenado sobre el corpus BabyLM 2026 Strict-Small. Se presenta como una arquitectura híbrida que combina un transformer de 9 capas con dos mecanismos de retroalimentación recurrente: el cambio de estado producido por la capa anterior y las estadísticas de candidatos derivadas de la predicción del token previo. La salida utiliza una mezcla de tres softmaxes (MoS3) que leen las capas [9], [8, 9] y [7, 8, 9] respectivamente.

El modelo es un LM causal preentrenado con objetivo de predicción del siguiente token, sin ajuste por instrucciones ni alineamiento conversacional. Su relevancia es fundamentalmente investigadora: explora si la retroalimentación recurrente entre capas y la información de la distribución predictiva previa pueden mejorar la eficiencia de aprendizaje en regímenes de datos limitados, como propone el marco BabyLM. El checkpoint liberado corresponde a 80 millones de exposiciones de palabras (ocho pasadas sobre 10 millones de palabras), seleccionado del run original que llegó hasta 100 millones.

La ventana de contexto de entrenamiento es de 512 posiciones como máximo y no se ha validado para secuencias más largas. El vocabulario es de 16.384 entradas con tokenizador ByteLevel BPE y normalización NFKC. La licencia es Apache 2.0 y el modelo requiere código Python personalizado con `trust_remote_code=True`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con retroalimentación recurrente (self-change feedback y candidate feedback) y salida MoS3 |
| Parámetros totales | 45.454.791 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 posiciones en entrenamiento; no validado para contextos mayores |
| Tipos de cuantización | No disponible (el autor recomienda FP32 para la ruta de inferencia validada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (201 tensores guardados) |

## Arquitectura y entrenamiento

La arquitectura consta de 9 capas con anchura de estado 320 y anchura FFN 1120. La atención usa 10 cabezas de 32 dimensiones con ganancias QK aprendidas y base RoPE aprendida. La geometría del estado emplea normalización sobre esfera RMS. El mecanismo de self-change feedback procesa por separado los cambios de atención y FFN de la capa anterior mediante un router aprendido de anchura 32. El candidate feedback utiliza un umbral relativo de probabilidad aprendido, media y varianza, con un lector de candidatos de anchura 48. Existe además una compuerta de recepción de atención que condiciona tanto el estado receptor como la información recibida. La salida MoS3 combina tres ramas con referencias específicas a las capas [9], [8, 9] y [7, 8, 9]. El vocabulario de 16.384 entradas usa proyección de salida separada del embedding de entrada.

El entrenamiento utilizó AdamW con 4.096 slots de tokens empaquetados por actualización y un schedule definido sobre un horizonte de 100 millones de exposiciones. Las tasas de aprendizaje de las matrices principales fueron 0,00064 → 0,00056 → 0,00048 en los límites de 30M y 60M, con un calentamiento de 1,6 millones de palabras. El checkpoint seleccionado vio ocho pasadas sobre 10 millones de palabras separadas por espacios, totalizando 80 millones de exposiciones. El tokenizador es ByteLevel BPE de 16.384 entradas con normalización NFKC. Las líneas adyacentes del corpus se agruparon bajo una política de empaquetado registrada, aislando la retroalimentación de atención y de candidatos entre grupos. La inferencia sigue el cómputo recurrente exacto, mientras que el entrenamiento usó una aproximación de dos pasadas. El adaptador de Hugging Face no implementa la receta original de preentrenamiento de dos pasadas; los fixtures de inicialización y el corpus no se distribuyen.

## Capacidades

- Generación de texto por completación: predicción del siguiente token sin ajuste conversacional ni de instrucciones.
- Modelado de lenguaje causal en inglés con contexto de hasta 512 posiciones.
- Razonamiento lingüístico limitado: obtiene 69,45% en BLiMP y 63,84% en BLiMP Supplement en evaluación local zero-shot.
- Comprensión de conocimiento cotidiano básico: 51,01% en EWoK.
- Seguimiento de entidades: 23,33% en el agregado local de 18 subtareas de Entity Tracking.
- Razonamiento sobre estados mentales: 52,38% en CoMPS.
- Razonamiento físico: 20,39% en PIQA paralelo (103 preguntas de cuatro opciones) y 58,00% en PIQA no paralelo (100 preguntas de dos opciones).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Investigación en eficiencia de datos lingüísticos: el modelo sirve como punto de comparación en el marco BabyLM para estudiar cuánto rendimiento se obtiene con 80 millones de exposiciones de palabras y arquitecturas alternativas al transformer estándar.
- Estudio de mecanismos de retroalimentación recurrente: permite analizar empíricamente cómo el self-change feedback y el candidate feedback afectan a tareas de concordancia gramatical (BLiMP) frente a un transformer convencional de tamaño similar.
- Evaluación de mezclas de softmaxes en LM de pequeño tamaño: la salida MoS3 con ramas [9], [8, 9] y [7, 8, 9] permite investigar el efecto de combinar distribuciones de distintas profundidades sobre la perplejidad y las métricas zero-shot.
- Reproducción de evaluaciones BabyLM 2026: el modelo incluye `evaluation_summary.json` con la revisión del código oficial (`6f825c291e2c4c78ad33b1935fd64d45f52642dc`), lo que facilita replicar las puntuaciones locales en un pipeline de evaluación estandarizado.
- Generación de texto controlada en dominios restringidos: con 45M de parámetros y FP32, puede ejecutarse en CPU para completar frases cortas en inglés en entornos de experimentación sin GPU.
- Docencia y divulgación sobre arquitecturas recurrentes: el código personalizado y el archivo `ARCHITECTURE.md` documentan rutas de información poco habituales, útiles para explicar feedback entre capas y cachés no estándar.
- Pruebas de compatibilidad de tooling de Transformers: al requerir `trust_remote_code` y una caché `past_key_values` que incluye momentos de candidatos además de KV de atención, sirve para validar adaptadores y sistemas de generación personalizados.

## Benchmarks y rendimiento

Resultados locales zero-shot a 80M de exposiciones, según la model card:

| Tarea | Puntuación local (%) |
|---|---:|
| BLiMP | 69,45 |
| BLiMP Supplement | 63,84 |
| EWoK | 51,01 |
| Entity Tracking (agregado local de 18 subtareas) | 23,33 |
| CoMPS | 52,38 |
| Global PIQA paralelo (103 preguntas de cuatro opciones) | 20,39 |
| Global PIQA no paralelo (100 preguntas de dos opciones) | 58,00 |

Medias locales reportadas: 52,002 en el histórico de cinco ejes y 49,8675 en el de seis ejes (promediando los dos porcentajes de PIQA en un solo eje). El autor indica que son evaluaciones locales y no una posición reclamada en competición. No se proporcionan comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 182 MB solo para pesos (45,45M × 4 bytes), más overhead de activaciones y caché; en la práctica cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- GPU recomendadas: no se especifican modelos concretos; el autor validó en CPU (Python 3.14 / PyTorch 2.13.0) y en CUDA (Python 3.12 / PyTorch 2.13.0) con Transformers 5.14.1. Cualquier GPU con soporte CUDA es suficiente.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente con al menos 2 GB de VRAM en FP32.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y la caché personalizada (`past_key_values` con momentos de candidatos) probablemente impide su uso directo sin adaptación.
- Latencia y throughput: no disponibles. El modelo requiere FP32 y desactiva TF32 (`allow_tf32 = False`) en CUDA para la ruta validada, lo que limita la aceleración por tensor cores.
- Restricciones de generación: soporta greedy, sampling, beam search ordinario y lotes con padding a izquierda; no soporta rollback especulativo de caché, recorte arbitrario de caché ni entrada solo de embeddings.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia estructural, los modelos del entorno BabyLM suelen situarse en el rango de 10M a 100M de parámetros con contextos de 512 tokens y licencias permisivas, pero no se han proporcionado resultados de otros modelos para comparar directamente.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VISTARC-320-9L-MoS3-80M | 45,45M | 512 | Apache 2.0 | Hugging Face, requiere código personalizado |
| Alternativas BabyLM de tamaño similar | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: sin ajuste por instrucciones, no es adecuado para uso conversacional ni como asistente.
- Riesgo elevado de alucinación y texto incoherente fuera de distribuciones similares al corpus BabyLM; las puntuaciones en Entity Tracking (23,33%) y PIQA paralelo (20,39%) indican razonamiento limitado.
- Contexto máximo de 512 posiciones; no se ha validado para secuencias más largas y el recorte arbitrario de caché no está soportado.
- Solo inglés; no hay capacidades multilingües.
- Requiere `trust_remote_code=True` con código Python personalizado; es imprescindible inspeccionar los archivos antes de habilitarlo.
- La caché `past_key_values` incluye momentos de candidatos además de KV de atención; sustituirla por una caché KV estándar altera el modelo.
- El adaptador de Hugging Face no reproduce la receta original de preentrenamiento de dos pasadas; los fixtures de inicialización y el corpus no se distribuyen, por lo que no es posible reproducir el entrenamiento completo desde cero.
- La inferencia validada usa FP32 con TF32 desactivado, lo que reduce el rendimiento en GPU frente a implementaciones en precisión reducida.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- Sin datos publicados de sesgos; al entrenarse en un corpus limitado, es probable que herede sesgos del mismo, aunque no se documentan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AwakeningOS/vistarc-320-9l-mos3-80m
- Documentación de arquitectura: https://huggingface.co/AwakeningOS/vistarc-320-9l-mos3-80m/blob/main/ARCHITECTURE.md
- Receta de entrenamiento: https://huggingface.co/AwakeningOS/vistarc-320-9l-mos3-80m/blob/main/training_recipe.json
- Resumen de evaluación: https://huggingface.co/AwakeningOS/vistarc-320-9l-mos3-80m/blob/main/evaluation_summary.json
- BabyLM: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
