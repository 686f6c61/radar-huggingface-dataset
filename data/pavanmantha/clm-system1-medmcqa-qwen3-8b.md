# pavanmantha/clm-system1-medmcqa-qwen3-8b

## Resumen

`pavanmantha/clm-system1-medmcqa-qwen3-8b` es un prototipo de investigación que adapta el modelo de lenguaje `Qwen/Qwen3-8B` para responder preguntas médicas de opción múltiple mediante un enfoque de "sistema 1": una decisión rápida, de un solo paso, sin generación de texto ni razonamiento encadenado. El modelo base permanece congelado y solo se entrenan dos cabezas lineales pequeñas que proyectan las representaciones del enunciado y de cada opción a un espacio compartido de 512 dimensiones; la opción elegida es la de mayor similitud coseno con la pregunta.

El modelo lo publica el usuario `pavanmantha` y se distribuye con licencia Apache 2.0. Está entrenado exclusivamente sobre el conjunto MedMCQA, derivado de exámenes de ingreso a la medicina en India, y solo admite inglés y hasta cuatro opciones por pregunta. Su relevancia es metodológica: demuestra que un enfoque contrastivo ligero sobre un encoder congelado puede superar claramente el azar (46,0 % frente a 25,0 %) sin generar texto, lo que lo convierte en una referencia útil para estudiar arquitecturas de decisión eficientes y para comparar con enfoques generativos.

El autor lo etiqueta explícitamente como prototipo de investigación y advierte de que no es apto para decisiones clínicas ni para uso médico real. Con 8 mil millones de parámetros en el encoder y un repositorio de solo 0,2 GB (las cabezas entrenadas), el modelo es un ejemplo de adaptación paramétricamente eficiente sobre un LLM de gran tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B congelado) + dos cabezas MLP de proyección contrastiva |
| Parámetros totales | 8 mil millones en el encoder congelado; cabezas entrenadas de tamaño no especificado (hidden 2048, salida 512) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; no se documenta en la model card) |
| Tipos de cuantización | no disponible (el encoder se carga en bfloat16; no se documentan cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`clm_heads.safetensors`) más `config.json`, `clm_inference.py` y `results.json` |

## Arquitectura y entrenamiento

La arquitectura es híbrida en el sentido de que combina un encoder transformer congelado (`Qwen/Qwen3-8B`, cargado en bfloat16 y nunca actualizado) con dos cabezas entrenables independientes: una "state head" para el enunciado de la pregunta y una "action head" para cada opción de respuesta. Cada cabeza tiene la estructura `Linear - GELU - Linear - LayerNorm - GELU - Linear`, con tamaño oculto 2048 y salida de 512 dimensiones. Las representaciones se extraen del estado oculto del último token en tres profundidades del modelo (0,5, 0,75 y 1,0 de la profundidad total), se normalizan L2 por capa y se concatenan para formar un vector de 12288 dimensiones que alimenta las cabezas. La decisión final es la opción con mayor similitud coseno respecto al enunciado.

El entrenamiento usa pérdida contrastiva InfoNCE en ambas direcciones, con negativos formados por las otras respuestas del lote y las opciones incorrectas de la propia pregunta; las filas con la misma respuesta correcta nunca se usan como negativas entre sí. Se emplea AdamW con learning rate 0,0003, weight decay 0, batch size 4096, gradient clipping 1 y temperatura aprendida con tope de 100, con early stopping sobre la pérdida de validación (paciencia 5). Se entrenaron tres semillas (42, 43 y 44) y se publican los pesos de la semilla con menor pérdida de validación. Los datos provienen de `pavanmantha/medmcqa-clm`, derivado de `openlifescienceai/medmcqa` (Apache 2.0), con 134.416 preguntas de entrenamiento, 4.000 de validación y 3.842 de test; se eliminaron opciones del tipo "all of the above" y se garantizó que las preguntas de test no aparecen en train ni en validación. Los hiperparámetros (formato de prompt, capas, learning rate, tamaño oculto, dropout) se seleccionaron solo con el split de validación, y el test se leyó una única vez para las cifras finales. No se documenta uso de RLHF ni DPO.

## Capacidades

- Clasificación de preguntas médicas de opción múltiple con hasta cuatro opciones, en una sola pasada y sin generación de texto.
- Decisión por similitud coseno entre la representación del enunciado y la de cada opción.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; el enfoque es explícitamente "sistema 1" de un solo paso.
- Solo inglés; no hay capacidades multilingües documentadas.
- No tiene modo "thinking", visión ni audio.
- No genera texto explicativo ni justificación de la respuesta.

## Casos de uso

- Investigación en arquitecturas de decisión eficientes: sirve como línea base para comparar enfoques contrastivos de "sistema 1" frente a modelos generativos con razonamiento encadenado en tareas de opción múltiple, gracias a que solo se entrenan las cabezas sobre un encoder congelado.
- Experimentos de adaptación paramétricamente eficiente: permite estudiar cómo dos MLP pequeñas sobre representaciones de Qwen3-8B capturan señal semántica suficiente para superar el azar en un dominio especializado.
- Evaluación de sesgos y dificultades en preguntas médicas: el desglose por materias (21 asignaturas) y por formulaciones con EXCEPT/NOT (34,9 % de acierto frente a 48,7 % en el resto) permite analizar qué tipos de pregunta resultan más difíciles para un modelo de decisión sin razonamiento.
- Docencia y divulgación sobre modelos contrastivos: el código de inferencia (`clm_inference.py`) y la estructura de cabezas documentada facilitan reproducir y explicar el pipeline completo con `torch`, `transformers`, `safetensors` y `huggingface_hub`.
- Filtrado o preetiquetado de bancos de preguntas: en un contexto de investigación, podría usarse para asignar una respuesta tentativa a preguntas de opción múltiple antes de una revisión humana, dado su bajo coste computacional frente a la generación de texto.
- Comparación de metodologías de evaluación: el modelo publica resultados por semilla y por materia en `results.json`, lo que permite contrastar la estabilidad estadística (margen de ±1,6 puntos) de enfoques ligeros frente a modelos generativos.

## Benchmarks y rendimiento

Evaluado sobre 3842 preguntas del split de validación etiquetado de MedMCQA (el split de test oficial no tiene respuestas). Cada pregunta se puntúa solo contra sus propias opciones; el azar es 25,0 %. El margen estadístico de una ejecución es de aproximadamente ±1,6 puntos.

| Método | Precisión |
|---|---|
| Azar | 25,0 % |
| Línea base ciega a la pregunta (respuesta más frecuente en entrenamiento) | 28,1 % |
| Línea base sin cabezas (coseno sobre vectores congelados sin entrenar) | 34,0 % |
| **Este modelo, media ± desviación sobre 3 semillas** | **46,0 % ± 0,2** |
| Este modelo, semilla publicada (44) | 46,2 % |

| Segmento (media sobre semillas) | Precisión |
|---|---|
| Media sobre las 21 materias | 47,4 % |
| Preguntas formuladas con EXCEPT / NOT | 34,9 % |
| Resto de preguntas | 48,7 % |

Los números por materia están en `results.json`. Al barajar las preguntas contra las opciones, la precisión cae al azar, lo que confirma que el modelo utiliza el enunciado.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder Qwen3-8B se carga en bfloat16, lo que requiere aproximadamente 16 GB solo para los pesos, más memoria para activaciones y el contexto; no se documentan cifras oficiales de VRAM en la model card.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño del encoder, cabría esperar GPUs de 24 GB o más (RTX 4090, A100, H100), pero el autor no lo especifica.
- Compatibilidad con GPU de consumo: no confirmada por el autor; el encoder en bfloat16 no cabe en GPUs de 8-12 GB sin cuantización, y no se documentan opciones de cuantización.
- Opciones de despliegue: el autor proporciona `clm_inference.py` con dependencias de `torch`, `transformers`, `safetensors` y `huggingface_hub`, que descarga `Qwen/Qwen3-8B` en el primer uso. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Precisión en MedMCQA (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `pavanmantha/clm-system1-medmcqa-qwen3-8b` | 8B (encoder congelado) + cabezas | no disponible | Contrastivo, sistema 1, sin generación | 46,0 % ± 0,2 | Apache 2.0 | Hugging Face |
| `Qwen/Qwen3-8B` (base, sin adaptar) | 8B | no disponible en esta ficha | Generativo con razonamiento opcional | no disponible | Apache 2.0 | Hugging Face |
| Alternativas de opción múltiple médica | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa con alternativas de la misma categoría no está disponible.

## Limitaciones y advertencias

- Alrededor del 54,0 % de las respuestas son incorrectas; el propio autor califica el modelo como no apto para decisiones clínicas ni para uso médico real.
- Solo admite opción múltiple, solo inglés y como máximo cuatro opciones; está entrenado con un único conjunto de exámenes (MedMCQA, exámenes de ingreso a medicina en India) y no se ha probado en otros conjuntos ni en preguntas clínicas reales.
- Las preguntas formuladas con EXCEPT o NOT son notablemente más difíciles (34,9 % frente a 48,7 %).
- El enunciado y cada opción se embeben por separado, por lo que el modelo no puede compararlos en contexto.
- Hereda los sesgos y errores del modelo base y de MedMCQA.
- No genera justificación ni texto explicativo, lo que limita su auditabilidad en entornos sensibles.
- Aunque la licencia es Apache 2.0, el uso comercial en ámbito médico no está respaldado por la evidencia del autor y requeriría validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pavanmantha/clm-system1-medmcqa-qwen3-8b
- Dataset de entrenamiento: https://huggingface.co/datasets/pavanmantha/medmcqa-clm
- Dataset original MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del autor en Hugging Face: https://huggingface.co/pavanmantha
