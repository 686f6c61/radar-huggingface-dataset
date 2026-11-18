# noahmclaughlin/Troubadour-Qwen3-4B-LoRA

## Resumen

Troubadour-4B es un adaptador LoRA para MLX sobre el modelo base Qwen3-4B-Instruct-2507 en cuantización de 4 bits, desarrollado por noahmclaughlin (1999labs). El objetivo del proyecto es investigar si el post-entrenamiento puede enseñar a un modelo una forma controlada de "street smarts": inferir convenciones sociales ficticias a partir de ejemplos y aplicarlas a un encuentro nuevo, reconociendo además cuándo los ejemplos no permiten resolver la consulta. Se trata de una tarea simbólica finita sobre lenguaje social, no de una medida de competencia cultural real.

El resultado es negativo: el checkpoint no supera los seis criterios primarios definidos por los autores y se publica para inspección y reproducción, no como una mejora demostrada. La ganancia medida es de +3,9 puntos porcentuales (41,5% a 45,4%) con un intervalo de confianza bootstrap del 95% agrupado por sociedad de [-1,3, +9,5], que incluye el cero. Además, la precisión en casos respondibles sube de 33,3% a 62,7% mientras que el recall de incertidumbre cae de 57,8% a 10,8%, lo que indica un intercambio desfavorable entre responder y abstenerse.

El adaptador contiene 3.670.016 parámetros entrenables y se aplica sobre las últimas 8 capas del transformer denso subyacente, con rango 8 y escala LoRA literal de 16,0 en MLX. No es un checkpoint Transformers fusionado ni un archivo GGUF: requiere el base original y la ruta de inferencia MLX proporcionada, validada únicamente en Apple silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3) con adaptador LoRA; 36 capas, hidden size 2.560, 32 cabezas de atención, 8 cabezas key/value, embedding de entrada/salida atado |
| Parametros totales | Aproximadamente 4 mil millones en el base congelado; el adaptador LoRA añade 3.670.016 parámetros entrenables |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base en 4 bits con grupos de 64; el adaptador se distribuye en precisión de entrenamiento MLX |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador LoRA MLX (`adapter/` con pesos y configuración); no es safetensors Transformers ni GGUF |
| Modelo base | mlx-community/Qwen3-4B-Instruct-2507-4bit (revisión `50d427756c6b1b2fe0c0a10f67fbda1fc8e82c1b`) |
| Capas adaptadas | Últimas 8 capas, rango 8, escala LoRA 16.0 |
| Librería | MLX |

## Arquitectura y entrenamiento

El base es un transformer decoder-only denso de Qwen3 con 36 capas, hidden size de 2.560, 32 cabezas de atención y 8 cabezas key/value (GQA), con embedding de entrada/salida atado y cuantización de 4 bits en grupos de 64. El adaptador LoRA se inserta en las últimas 8 capas con rango 8 y escala 16,0, sumando 3.670.016 parámetros entrenables sobre un base congelado de aproximadamente 4 mil millones de parámetros. La configuración exacta de entrenamiento es `configs/choice-slow-seed17.yaml` en el repositorio fuente.

El entrenamiento es una clasificación supervisada sobre los logits originales de siguiente token A/B/U del modelo (A = respetar, B = incumplir, U = evidencia insuficiente). No emplea aprendizaje por refuerzo, ni una cabeza clasificadora externa, ni un solver simbólico disfrazado: solo los encuentros observados y la consulta entran en la inferencia neuronal, mientras que las reglas ocultas, las respuestas correctas y los recuentos de reglas supervivientes quedan excluidos. El generador de datos enumera 612 convenciones booleanas únicas sobre cinco características binarias de encuentro, y las identidades de regla completas y sus complementos se separan entre entrenamiento, desarrollo y evaluación final. El pool seleccionado fue el split `train_choice` con 2.850 episodios distintos de ocho observaciones, balanceados entre A/B/U; el checkpoint retenido procesó 2.400 presentaciones de ejemplo en 300 actualizaciones del optimizador.

## Capacidades

- Clasificación de encuentros sociales ficticios en tres categorías: respeto (A), incumplimiento (B) e insuficiencia de evidencia (U).
- Inferencia de convenciones booleanas a partir de ejemplos en contexto (in-context learning) sobre cinco características binarias.
- Aplicación de reglas inferidas a un encuentro nuevo no visto durante el entrenamiento.
- Detección de casos no resueltos por los ejemplos, aunque con recall de incertidumbre degradado (10,8% frente a 57,8% del base).
- Salida de probabilidades normalizadas sobre los tokens A/B/U, si bien no están calibradas como estimaciones de confianza.
- No soporta tool calling ni function calling de forma nativa en este adaptador.
- No soporta razonamiento multi-paso con tokens de pensamiento ni inferencia asistida por herramientas en el benchmark.
- No dispone de capacidades de visión, audio ni multimodalidad.
- Multilingüismo limitado al inglés.

## Casos de uso

- Investigación sobre in-context learning simbólico: el adaptador sirve como punto de comparación reproducible para estudiar si el post-entrenamiento mejora la inferencia de reglas a partir de ejemplos, usando el benchmark y el solver de referencia del repositorio.
- Reproducción de resultados negativos: permite replicar el experimento completo en Apple silicon con el predictor incluido y verificar la ganancia de +3,9 puntos y su intervalo de confianza.
- Estudio de calibración y abstención: útil para analizar el intercambio entre precisión en casos respondibles (33,3% a 62,7%) y recall de incertidumbre (57,8% a 10,8%) en tareas de clasificación con opción de abstención.
- Evaluación de adaptadores LoRA de bajo rango: con 3,67 millones de parámetros entrenables sobre las últimas 8 capas, sirve para medir el efecto de adaptaciones pequeñas en tareas de razonamiento simbólico.
- Docencia y divulgación: el ejemplo trabajado (`EXAMPLE.md`) y la demo local en Gradio permiten ilustrar cómo un modelo pequeño infiere convenciones sociales ficticias y dónde falla.
- Desarrollo de pipelines de evaluación controlada: el generador de 612 convenciones y la separación estricta de identidades de regla entre splits pueden reutilizarse para construir tests de fuga de datos en tareas de in-context learning.
- Prototipado en hardware de consumo: el flujo MLX validado en un Apple M2 con 16 GiB de memoria unificada permite experimentar sin GPU dedicada ni servicios en la nube.

## Benchmarks y rendimiento

| Prueba reservada primaria | Precisión |
|---|---:|
| Qwen original | 41,5% |
| Troubadour-4B | 45,4% |
| Qwen con sesgo U ajustado en desarrollo | 41,8% |
| Heurística del ejemplo más cercano | 56,9% |
| Mayoría de observación ciega a la consulta | 45,8% |

La ganancia emparejada es de +3,9 puntos porcentuales, con intervalo bootstrap del 95% agrupado por sociedad de [-1,3, +9,5] puntos, sobre 306 episodios de 51 pares de sociedades complementarias reservadas. El intervalo no mide variación entre semillas de entrenamiento. La precisión en casos respondibles pasa de 33,3% a 62,7% y el recall de incertidumbre de 57,8% a 10,8%. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Memoria: el base en 4 bits requiere varios gigabytes de descarga y almacenamiento, más memoria de trabajo adicional; el entorno medido fue un Apple M2 con 16 GiB de memoria unificada.
- GPU recomendadas: Apple silicon con MLX (entorno validado); no se ha validado en CUDA ni en otros runtimes no MLX.
- GPU de consumo: cabe en un Apple M2 de 16 GiB; no hay datos de funcionamiento en RTX 4090 u otras GPU consumer con CUDA.
- Despliegue: ruta de inferencia MLX incluida (`python -m troubadour.predict --adapter adapter`), demo local con Gradio (`python app.py --adapter adapter`); no compatible con `transformers.from_pretrained()` directo sobre este repositorio.
- Dependencias: Python 3.12.15, `huggingface-hub==2.4.0` y `requirements.lock`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Troubadour-4B (este) | ~4B base + 3,67M adaptador | No disponible | 45,4% en test reservado | Apache 2.0 | Adaptador MLX en Hugging Face |
| Qwen3-4B-Instruct-2507 (base) | ~4B | No disponible | 41,5% en test reservado | Apache 2.0 | Pesos completos en Hugging Face |
| Heurística del ejemplo más cercano | No aplica | No aplica | 56,9% en test reservado | No aplica | Referencia del benchmark |
| Mayoría de observación ciega a la consulta | No aplica | No aplica | 45,8% en test reservado | No aplica | Referencia del benchmark |

No se dispone de datos de benchmarks estándar ni de comparaciones con otros adaptadores LoRA de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Resultado negativo: el checkpoint no supera los seis criterios primarios y no debe presentarse como una mejora demostrada en "street smarts".
- El intervalo de confianza de la ganancia incluye el cero ([-1,3, +9,5]), por lo que la mejora no es estadísticamente concluyente.
- La tarea es simbólica y finita (612 convenciones booleanas sobre cinco características); no constituye evidencia de competencia cultural o social en el mundo real.
- El recall de incertidumbre cae del 57,8% al 10,8%, lo que indica una tendencia a responder en lugar de abstenerse cuando falta evidencia.
- Las probabilidades A/B/U no están calibradas como estimaciones de confianza.
- Solo se ha validado en MLX sobre Apple silicon; no hay validación en CUDA ni en otros runtimes.
- No es compatible con carga directa mediante `transformers.from_pretrained()` ni se distribuye en GGUF.
- El predictor publicado no aplica el sesgo U opcional ajustado en desarrollo.
- La demo local puede solapar reglas de entrenamiento en mundos aleatorios y no constituye la evaluación reservada.
- Idioma limitado al inglés; no se han documentado sesgos específicos más allá de los derivados del dataset sintético.
- Licencia Apache 2.0 permite uso comercial, pero el estado de investigación y los resultados negativos desaconsejan su uso en producción sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noahmclaughlin/Troubadour-4B-LoRA
- Dataset Troubadour: https://huggingface.co/datasets/noahmclaughlin/Troubadour
- Código fuente y benchmark: https://github.com/1999labs/troubadour-4b
- Resultados completos: RESULTS.md (en el repositorio del modelo)
- Ejemplo trabajado: EXAMPLE.md (en el repositorio del modelo)
- Resultados en JSON: https://huggingface.co/noahmclaughlin/Troubadour-4B/blob/main/RESULTS.json
- Modelo base: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit
