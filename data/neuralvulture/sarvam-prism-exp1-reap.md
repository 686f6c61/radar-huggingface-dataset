# NeuralVulture/sarvam-prism-exp1-reap

## Resumen

Sarvam Prism exp1 reap es una colección de checkpoints podados del modelo Sarvam Prism, publicada por el usuario NeuralVulture bajo el identificador `NeuralVulture/sarvam-prism-exp1-reap`. Se trata de artefactos derivados de un experimento de poda de expertos (expert pruning) sobre una arquitectura de mezcla de expertos (MoE): la model card indica explícitamente que se conservan 75 de 128 expertos por capa en 32 capas, es decir, un 75 % de los expertos originales. El checkpoint principal se denomina `ean_keep75` y corresponde a una poda por saliencia EAN.

El interés de esta publicación es experimental y de investigación: la model card reporta que el modelo podado obtiene una precisión de 0,7850 en `eval_200`, superior a la del modelo completo (0,7250), y 0,8047 en `calibration_1024`. Estos datos sugieren que la poda no solo reduce el coste computacional, sino que en este caso concreto mejora la métrica de evaluación reportada por el autor, un fenómeno que conviene tratar con cautela hasta disponer de una evaluación independiente.

No se dispone de información sobre el pipeline, la licencia, los idiomas soportados ni la arquitectura exacta del modelo base. El repositorio ocupa 79,9 GB y contiene pesos en formato safetensors. La información pública es muy limitada y procede casi exclusivamente de la model card y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer; 32 capas, 128 expertos por capa en el modelo base (inferido de la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es Sarvam Prism, una arquitectura de mezcla de expertos con 128 expertos por capa y 32 capas. El checkpoint publicado aplica una poda de expertos por saliencia EAN que conserva el 75 % de los expertos (75 de 128 por capa), lo que reduce el número de parámetros y el coste de inferencia respecto al modelo completo. No se documentan en la información proporcionada los detalles del entrenamiento original (número de tokens, composición del dataset, fases de RLHF/DPO) ni las innovaciones técnicas del modelo base.

El experimento incluye otros dos checkpoints ganadores, `reap_keep50` (50 % de expertos conservados) y `frequency_keep25` (25 % conservados), cuyas puntuaciones y detalles se encuentran en el repositorio privado `NeuralVulture/sarvam-prism-routing-calib`. No se especifica la metodología exacta de cálculo de saliencia EAN ni el procedimiento de calibración más allá de las métricas reportadas.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Sarvam Prism, no documentadas en detalle en la información disponible.
- Poda de expertos: el checkpoint conserva 75 de 128 expertos por capa, lo que reduce el cómputo respecto al modelo completo.
- Evaluación reportada: precisión de 0,7850 en `eval_200` y 0,8047 en `calibration_1024` según la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre poda de expertos en MoE: el checkpoint sirve como referencia reproducible para comparar estrategias de poda (EAN frente a REAP y frecuencia) sobre la misma arquitectura base, usando las métricas `eval_200` y `calibration_1024` como criterio.
- Evaluación de la relación entre poda y rendimiento: permite estudiar si la reducción de expertos al 75 % mejora o degrada tareas concretas, dado que la model card reporta una mejora frente al modelo completo en su conjunto de evaluación.
- Despliegue con restricciones de memoria: al conservar solo el 75 % de los expertos, el checkpoint reduce el espacio de parámetros respecto al modelo completo, lo que puede facilitar su ejecución en entornos con VRAM limitada, siempre que se valide la calidad en la tarea objetivo.
- Baseline para experimentos de destilación o pruning adicional: el checkpoint podado puede servir como punto de partida para técnicas de compresión posteriores (cuantización, poda estructurada) en investigación académica.
- Reproducción de experimentos de enrutamiento: junto con los checkpoints `reap_keep50` y `frequency_keep25`, permite analizar cómo afecta el porcentaje de expertos conservados al enrutamiento y a la calidad de salida.
- Estudio de calibración de modelos MoE: la métrica `calibration_1024` reportada sugiere un uso potencial en investigación sobre calibración de modelos podados, aunque no se detalla el procedimiento.

## Benchmarks y rendimiento

| Metrica | Modelo podado (ean_keep75) | Modelo completo |
|---|---|---|
| eval_200 accuracy | 0,7850 | 0,7250 |
| calibration_1024 | 0,8047 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas reportadas son las de la model card, correspondientes a conjuntos de evaluación propios del experimento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 79,9 GB en safetensors, lo que sugiere que la inferencia en precisión completa requiere al menos una GPU con 80 GB (A100/H100) o sharding multi-GPU.
- GPU recomendadas: no disponibles de forma específica; por tamaño del repositorio, se orienta a A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: no confirmada; probablemente requiere cuantización agresiva para caber en RTX 4090 (24 GB) o similares, sin datos publicados al respecto.
- Opciones de despliegue: no documentadas (vLLM, llama.cpp, Ollama, TGI); al ser un MoE podado en safetensors, la compatibilidad con frameworks estándar no está verificada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeuralVulture/sarvam-prism-exp1-reap (ean_keep75) | no disponible (75/128 expertos, 32 capas) | no disponible | eval_200 0,7850; calibration_1024 0,8047 | no disponible | Público en HF |
| Sarvam Prism (modelo completo) | no disponible (128 expertos, 32 capas) | no disponible | eval_200 0,7250 | no disponible | Referenciado en la model card |
| NeuralVulture/sarvam-prism-routing-calib (reap_keep50, frequency_keep25) | no disponible (50 % y 25 % de expertos) | no disponible | no disponible (repo privado) | no disponible | Privado |

No se dispone de información suficiente para comparar con alternativas externas de la misma categoría (otros MoE podados o modelos de tamaño similar).

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan licencia, idiomas, contexto, parámetros totales ni procedencia exacta del modelo base, lo que impide evaluar su idoneidad para producción.
- Licencia no especificada: no puede confirmarse el uso comercial; debe contactarse con el autor o consultarse el modelo base antes de cualquier despliegue.
- Métricas no estándar: los resultados de `eval_200` y `calibration_1024` provienen de conjuntos propios del experimento y no son comparables con benchmarks públicos como MMLU o HumanEval.
- Mejora frente al modelo completo no verificada de forma independiente: la model card reporta que el modelo podado supera al completo (0,7850 frente a 0,7250), un resultado que requiere replicación externa.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Sin garantías de soporte: repositorio con 0 descargas y 0 likes, publicado por un usuario individual; no hay evidencia de mantenimiento ni de validación por parte de la comunidad.
- Compatibilidad de despliegue incierta: al tratarse de un MoE podado, los frameworks estándar pueden no cargar el checkpoint sin adaptaciones.

## Enlaces

- Hugging Face: https://huggingface.co/NeuralVulture/sarvam-prism-exp1-reap
- Repositorio privado con puntuaciones y checkpoints adicionales: https://huggingface.co/NeuralVulture/sarvam-prism-routing-calib (referenciado en la model card; acceso privado)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
