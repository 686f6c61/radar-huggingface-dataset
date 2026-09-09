# AlexBodner/tpf-equivarianza-video

## Resumen

El modelo `AlexBodner/tpf-equivarianza-video` es un adaptador LoRA de investigación, desarrollado por Alexander Bodner y Mateo Costantini como trabajo final de Visión Artificial Avanzada en la UdeSA. Realiza fine-tuning sobre el modelo de difusión de video SANA-Video 2B para imponer una simetría física: si se rota la escena, la cinemática de lo generado debe rotar de la misma forma. La cinemática se estima con el modelo RAFT sobre los propios videos generados dentro del paso de entrenamiento, y el error se retropropaga hasta los pesos LoRA, sin necesidad de ground truth físico. El repositorio incluye 8 checkpoints LoRA del brazo "con física" y 8 de un control idéntico en semilla, datos y arquitectura, pero con el peso de la pérdida de equivarianza a cero. También contiene unos 2400 videos generados en todos los experimentos. El tamaño del repositorio es de 1,8 GB y la licencia es Apache-2.0. Según el README, la restricción de equivarianza se aprende, ya que la diferencia angular entre las velocidades de las dos ramas pasa de 63° a 51°, pero no se traduce en una mejor física, porque el error de velocidad contra el simulador no mejora y el modelo degenera fuera de distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre SANA-Video 2B (modelo de difusión de video) |
| Parametros totales | No disponible (el repositorio contiene checkpoints LoRA, no el modelo completo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de texto) |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantización) |
| Idiomas soportados | Español (según metadatos) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (pytorch_lora_weights.safetensors) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alfa 64 que se aplica sobre las capas de atención (`to_q`, `to_k`, `to_v`, `to_out.0`) del modelo de difusión de video SANA-Video 2B. El entrenamiento se realizó durante 1000 pasos con batch de 1, bf16, semilla 42, 500 clips sintéticos de 33 cuadros a 384×384, y 12 pasos de Euler de muestreo dentro del bucle de entrenamiento. La pérdida de equivarianza se calcula estimando la cinemática con RAFT sobre los videos generados en el paso de entrenamiento, comparando las velocidades tras una rotación de 45° de la escena. El peso de esta pérdida se fijó en λ_rot = 4,7e-03, calibrado mediante sondas de razón de gradiente. Existen dos brazos experimentales que comparten semilla, datos y GPU: uno con la pérdida de equivarianza y otro de control con λ_rot = 0, lo que permite comparaciones apareadas. El README indica que la restricción se aprende: la diferencia angular media entre las velocidades de las dos ramas pasa de 63° en el control a 51° en el brazo entrenado, medido sobre clips no vistos. Sin embargo, este efecto no mejora el error de velocidad frente al ground truth del simulador y no crece con más entrenamiento; además, el desacuerdo entre ramas sigue siendo del 92% de la magnitud del movimiento, por lo que el modelo dista de ser realmente equivariante.

## Capacidades

- Generación de video sintético condicionado por una simetría rotacional, aplicando transformaciones de rotación consistentes entre la escena y la cinemática.
- Fine-tuning de bajo rango mediante LoRA sobre un modelo de difusión de video de gran tamaño (SANA-Video 2B), con carga y despliegue vía `diffusers`.
- Estimación de la cinemática de los videos generados con RAFT dentro del bucle de entrenamiento, permitiendo un aprendizaje sin ground truth físico.
- Comparación experimento/control con pesos apareados (semilla, datos y arquitectura idénticas), útil para estudiar efectos de regularización física en modelos generativos.
- Soporte de generación de videos en español, según los metadatos del repositorio.
- No soporta funciones de tool calling, agentes ni razonamiento multi-paso en el sentido de modelos de lenguaje; es un adaptador para generación de video.

## Casos de uso

- Investigación en prior físicos para modelos generativos: se pueden cargar los checkpoints LoRA para estudiar cómo la equivarianza rotacional afecta la generación de video, comparando el brazo "con física" frente al control con λ_rot = 0. Esta comparación apareada permite aislar el efecto de la pérdida de equivarianza sin variaciones de semilla o datos.
- Herramienta docente en visión artificial: el repositorio sirve como ejemplo práctico de cómo implementar una pérdida de equivarianza basada en estimaciones de flujo óptico (RAFT) dentro de un pipeline de difusión, con 8 checkpoints intermedios y más de 2400 videos que documentan la evolución a lo largo del entrenamiento.
- Generación de clips sintéticos para entrenar modelos de percepción robótica: la restricción de simetría rotacional puede ayudar a generar datos donde las rotaciones de la cámara se corresponden con rotaciones consistentes del movimiento de los objetos, aunque el README advierte de que el modelo degenera fuera de distribución, por lo que se limita a escenarios sintéticos controlados.
- Evaluación de la robustez de modelos de video a transformaciones geométricas: usando el brazo de control y el entrenado, se pueden medir diferencias en la consistencia cinemática bajo rotaciones, como las diferencias de 63° a 51° reportadas en el README.
- Benchmark de métodos de regularización física: los pesos y videos publicados permiten reproducir y extender los experimentos, comparando distintas variantes de la pérdida de equivarianza o distintos valores de λ_rot.
- Exploración de límites de la inferencia física a partir de vídeo: el proyecto documenta que imponer una simetría no mejora la precisión física, un resultado negativo relevante para la comunidad que trabaja en prior de física para generación de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K o similares) en la información disponible. El README presenta métricas internas de validación de la pérdida de equivarianza, que no son comparables con benchmarks de capacidades generales:

| Métrica | Brazo control | Brazo con física |
|---|---|---|
| Diferencia angular media entre velocidades (clips no vistos) | 63° | 51° |
| Desacuerdo entre ramas como porcentaje de la magnitud del movimiento | - | ~92% |

Estos datos indican que la restricción de equivarianza se aprende parcialmente (63° a 51°), pero la brecha sigue siendo muy amplia, y el error de velocidad frente al ground truth del simulador no mejora.

## Requisitos de hardware

- No se ha proporcionado información específica sobre VRAM o GPUs de referencia en el README.
- El entrenamiento se realizó con batch de 1 y bf16 a 384×384, con 12 pasos de Euler dentro del bucle, lo que sugiere una GPU de gama alta, sin precisar el modelo.
- Para usar los pesos es necesario cargar el modelo base SANA-Video 2B, que es un modelo de difusión de video de 2 mil millones de parámetros; los requisitos de VRAM dependen de ese modelo base, no del adaptador LoRA.
- El repositorio incluye pesos LoRA en formato safetensors, por lo que se puede integrar en `diffusers` (SanaVideoPipeline) para inferencia en local.
- No se detallan opciones de despliegue en vLLM, llama.cpp, Ollama o TGI; el único entorno documentado es `diffusers` con un ejemplo de descarga desde Hugging Face.
- La latencia y el throughput no están publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El único modelo de referencia es el base `Efficient-Large-Model/SANA-Video_2B_480p_diffusers`, sobre el que se aplica el LoRA, pero no hay benchmarks ni tablas comparativas frente a otros adaptadores o modelos de generación de video con prior físicos.

## Limitaciones y advertencias

- La restricción de equivarianza se aprende, pero no se traduce en una mejor física: el error de velocidad contra el ground truth del simulador no mejora en el brazo entrenado frente al control.
- Fuera de distribución, el modelo degenera, tal como advierte el README, por lo que no es adecuado para aplicaciones de producción o escenarios no contemplados en los datos sintéticos.
- El efecto de equivarianza ya está completamente presente en el primer checkpoint (paso 125) y no crece con más entrenamiento, lo que sugiere que el modelo alcanza rápidamente un límite de equivarianza aprendible.
- Incluso en el mejor caso, el desacuerdo entre ramas sigue siendo de aproximadamente el 92% de la magnitud del movimiento; el modelo está lejos de ser equivariante.
- El repositorio solo indica soporte de idioma español; no hay información sobre capacidades multilingües más allá de los metadatos.
- Es un trabajo académico de investigación (descargas y likes nulos en Hugging Face), sin soporte ni optimización para uso comercial, aunque la licencia Apache-2.0 permitiría su uso con esas condiciones.
- Los pesos publicados son solo adaptadores LoRA; no incluyen el modelo base completo, por lo que es necesario descargar SANA-Video 2B por separado.

## Enlaces

- Hugging Face: https://huggingface.co/AlexBodner/tpf-equivarianza-video
- Repositorio GitHub del autor: https://github.com/AlexBodner/tpf-equivarianza-videos
- Releases de GitHub con videos de comparación: https://github.com/AlexBodner/tpf-vision-assets/releases
- Referencia al modelo base en diffusers: Efficient-Large-Model/SANA-Video_2B_480p_diffusers (vía `diffusers`)
