# sidbaines/qwen3.5-4b-random-reward-r-s1

## Resumen

`qwen3.5-4b-random-reward-r-s1` es un artefacto de investigación publicado por el usuario `sidbaines` en Hugging Face, no un modelo destinado a uso productivo. Se trata de un ajuste por aprendizaje por refuerzo del modelo base Qwen/Qwen3.5-4B (con el modo "thinking" activado) en el que la señal de recompensa es completamente aleatoria: en cada grupo de 8 respuestas a un prompt, exactamente la mitad reciben recompensa 1 y la otra mitad 0, independientemente de su contenido. El objetivo declarado es estudiar qué efecto tiene una recompensa sin correlación con la calidad sobre el razonamiento del modelo.

El entrenamiento emplea GRPO de parámetros completos (pérdida Dr. GRPO, un paso de optimizador por lote, sin penalización KL, learning rate 1e-06) ejecutado con SkyRL sobre una GPU H200, usando una muestra estratificada de prompts del mezcla SFT de Tulu 3 (chat, matemáticas, código, seguimiento de instrucciones, conocimiento y seguridad). El modelo conserva intactas la torre de visión y la cabeza MTP del modelo base.

Con 4.659.865.088 parámetros reales (según safetensors) y un repositorio de 26,5 GB, el interés del artefacto es metodológico: permite analizar la deriva de los pesos y el comportamiento del razonamiento bajo una señal de recompensa nula por diseño. La model card advierte explícitamente de que no debe usarse como modelo funcional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), con torre de visión y cabeza MTP; detalles no disponibles |
| Parámetros totales | 4.659.865.088 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con capacidad de visión (torre de visión) y una cabeza MTP (multi-token prediction), que se mantienen sin modificar durante el ajuste. El entrenamiento aplica GRPO de parámetros completos con la variante de pérdida Dr. GRPO, un único paso de optimizador por lote, sin término de penalización KL y con learning rate de 1e-06, ejecutado con SkyRL sobre una sola GPU H200.

La peculiaridad metodológica es la función de recompensa: para cada prompt se generan grupos de 8 respuestas y se asignan recompensas binarias (1 o 0) de forma aleatoria, forzando que exactamente la mitad del grupo reciba 1. No existe, por tanto, señal de calidad, corrección ni preferencia humana. Los prompts provienen de una muestra estratificada del mezcla SFT de Tulu 3, cubriendo chat, matemáticas, código, seguimiento de instrucciones, conocimiento y seguridad. La model card publica la deriva relativa L2 de los pesos de texto por checkpoint: 3,07e-04 en el paso 25, 4,52e-04 en el paso 50 y 5,25e-04 en el paso 65, lo que documenta un cambio acumulado pequeño pero creciente. Cada checkpoint vive en su propia rama (`step-000025`, `step-000050`, `step-000065`), y `main` alberga la tarjeta y, al finalizar la ejecución, los pesos finales; las ramas con sufijo `-attempt<k>` corresponden a intentos abandonados tras un fallo.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" heredados del modelo base Qwen3.5-4B, aunque alterados por el ajuste con recompensa aleatoria.
- Procesamiento de imágenes mediante la torre de visión del modelo base, que no fue entrenada en este ajuste.
- Capacidad multimodal de entrada texto-imagen a través de `AutoModelForImageTextToText`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Uso como objeto de estudio: permite comparar checkpoints intermedios para analizar la deriva del razonamiento bajo recompensa no informativa.

## Casos de uso

- Investigación sobre recompensas espurias: el modelo sirve como control experimental para medir cómo una señal de recompensa aleatoria degrada o reestructura las cadenas de razonamiento, comparando los checkpoints 25, 50 y 65 frente al base Qwen3.5-4B.
- Estudio de deriva de pesos: la métrica L2 relativa publicada por checkpoint permite correlacionar magnitud del cambio paramétrico con cambios observados en las salidas, en un entorno de laboratorio con una sola H200.
- Auditoría de pipelines de RL: sirve para validar que un framework basado en SkyRL y GRPO se comporta correctamente (generación de grupos de 8, asignación de recompensas, pasos de optimizador) antes de desplegar entrenamientos con recompensas reales.
- Análisis de robustez del modo thinking: permite examinar si el modelo mantiene formatos de razonamiento estructurado cuando la recompensa no premia ninguna propiedad concreta.
- Reproducibilidad de experimentos: las ramas por checkpoint y por intento facilitan replicar y comparar trayectorias de entrenamiento en estudios académicos.
- Docencia y divulgación: ilustra de forma tangible los riesgos de diseñar funciones de recompensa mal especificadas en RLHF/RLVR, con pesos y métricas concretas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El entrenamiento se realizó en una única GPU H200 según la model card; no se documentan requisitos de inferencia.
- VRAM estimada para inferencia en precisión nativa (BF16/FP16): aproximadamente 9,3 GB solo para pesos, más overhead de activaciones, caché KV y, en su caso, torre de visión; no confirmado en la información disponible.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4,7 GB para pesos; en 4 bits, aproximadamente 2,3 GB; ambas son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo con 16-24 GB de VRAM (por ejemplo, RTX 4090 o RTX 3090) en cuantizaciones de 8 o 4 bits, si bien no se han validado esas configuraciones.
- Opciones de despliegue: la model card menciona `vLLM` (`vllm serve ... --revision step-000100`) y `transformers` con `AutoModelForImageTextToText`; no se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| qwen3.5-4b-random-reward-r-s1 | 4.659.865.088 | no disponible | Apache 2.0 | Artefacto de investigación con recompensa aleatoria |
| Qwen/Qwen3.5-4B (base) | no disponible en la información | no disponible | no disponible en la información | Modelo base multimodal con thinking |
| Alternativas de mismo tamaño con RL estándar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado ni de especificaciones del modelo base más allá de su identificador, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- La model card califica el modelo como "un artefacto de investigación, no un modelo para usar"; no debe desplegarse en producción.
- La señal de recompensa es aleatoria por diseño, por lo que el ajuste no persigue mejorar la corrección, la utilidad ni la seguridad de las respuestas; el comportamiento resultante puede ser errático o degradado respecto al base.
- Riesgo elevado de alucinación y de razonamientos inconsistentes: no se ha validado ninguna métrica de calidad en la información disponible.
- Los sesgos del modelo base Qwen3.5-4B se heredan y no se documentan procesos de mitigación en este ajuste.
- La torre de visión y la cabeza MTP no fueron entrenadas, por lo que su comportamiento tras el ajuste de los pesos de texto no está caracterizado.
- Solo se han publicado tres checkpoints intermedios (pasos 25, 50 y 65); la ejecución podría no haber finalizado y los pesos de `main` podrían no reflejar un estado final.
- Idiomas soportados y longitud de contexto no documentados: no es posible garantizar cobertura multilingüe ni conversaciones de contexto largo.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza experimental hace desaconsejable cualquier uso más allá de la investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sidbaines/qwen3.5-4b-random-reward-r-s1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- SkyRL (framework de entrenamiento mencionado): no disponible en la información proporcionada
- Paper de Dr. GRPO: no disponible en la información proporcionada
- Mezcla SFT de Tulu 3: no disponible en la información proporcionada
