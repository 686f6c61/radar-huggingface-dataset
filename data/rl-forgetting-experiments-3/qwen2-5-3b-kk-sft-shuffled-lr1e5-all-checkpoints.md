# RL-Forgetting-Experiments-3/qwen2.5-3b-kk-sft-shuffled-lr1e5-all-checkpoints

## Resumen

Este repositorio, publicado por el usuario RL-Forgetting-Experiments-3, no es un modelo listo para producción, sino un artefacto de investigación: contiene diez checkpoints de un ajuste fino por supervisión (SFT) sobre Qwen/Qwen2.5-3B, con learning rate 1e-5 y datos barajados (shuffled), correspondientes a los pasos 318, 635, 952, 1270, 1588, 1905, 2222, 2540, 2858 y 3175.

El objetivo declarado es el análisis de pérdida (loss-analysis) y el estudio del olvido de capacidades durante el SFT. La ruta de los artefactos de evaluación asociados ("qwen2.5-3b-math-kk-sft-artifacts") sugiere que el ajuste se realizó sobre datos de tipo matemático, aunque la model card no describe la composición del dataset.

Cada directorio `checkpoints/step_N/` es un modelo de Hugging Face cargable de forma directa. El repositorio ocupa 123,4 GB en total, lo que equivale a unos 12,3 GB por checkpoint, un tamaño coherente con pesos almacenados en fp32 (aproximadamente 4 bytes por parámetro para un modelo de 3.000 millones de parámetros). No se han publicado métricas numéricas de rendimiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención por consultas agrupadas (GQA), heredada de Qwen2.5-3B; no detallada en la model card del fine-tune |
| Parámetros totales | 3.000 millones aproximadamente (heredado de Qwen2.5-3B); no confirmado en la model card |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card del fine-tune; el modelo base Qwen2.5-3B declara 32.768 tokens nativos |
| Tipos de cuantización | No disponible en el repositorio: solo se publican pesos en safetensors (fp32). Al derivar de Qwen2.5-3B es convertible a GGUF, AWQ y GPTQ, pero el autor no proporciona versiones cuantizadas |
| Idiomas soportados | No disponible. La model card no especifica idiomas ni aparece el campo de idiomas en los metadatos de Hugging Face |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, cargables con la librería transformers |

## Arquitectura y entrenamiento

El modelo es un ajuste fino SFT del checkpoint Qwen/Qwen2.5-3B, un transformer decoder-only con atención por consultas agrupadas (GQA) de la familia Qwen2.5. No se documenta ninguna modificación arquitectónica respecto al modelo base: el autor no menciona cambios en el número de capas, la dimensionalidad oculta ni el mecanismo de atención, por lo que se asume que la arquitectura es idéntica a la de Qwen2.5-3B.

El entrenamiento consiste en un SFT con learning rate 1e-5 (indicado en el nombre del repositorio como "lr1e5") sobre un dataset barajado (shuffled). El nombre de los artefactos de evaluación asociados incluye el término "math", lo que apunta a datos de matemáticas, aunque la model card no detalla el número de tokens, la composición del dataset ni si se aplicaron etapas posteriores de RLHF o DPO. El proceso cubre 3.175 pasos, con evaluaciones guardadas cada 318 pasos aproximadamente (10 checkpoints en total). La innovación destacable no es arquitectónica sino metodológica: la publicación de todos los checkpoints intermedios permite analizar la evolución de la pérdida y el olvido de capacidades a lo largo del entrenamiento, en lugar de ofrecer únicamente el checkpoint final.

## Capacidades

- Generación de texto autoregresiva: capacidad heredada del modelo base Qwen2.5-3B, no verificada en la model card del fine-tune.
- Razonamiento matemático: el nombre de los artefactos de evaluación ("math-kk-sft") indica que el ajuste se orientó a tareas de matemáticas, aunque no se publican resultados numéricos.
- Análisis de olvido de capacidades: los diez checkpoints permiten medir cómo evoluciona el rendimiento general a medida que avanza el SFT.
- Selección de checkpoints: la estructura `checkpoints/step_N/` facilita comparar estados intermedios del entrenamiento y elegir el más adecuado para una tarea concreta.
- Soporte de tool calling / function calling: no disponible en la model card. El modelo base Qwen2.5-3B lo soporta, pero no hay confirmación de que este fine-tune lo conserve.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. No se declara ninguna.

## Casos de uso

- Investigación sobre olvido catastrófico: comparar los diez checkpoints (pasos 318 a 3175) sobre un mismo conjunto de evaluación permite trazar la curva de degradación de capacidades generales a medida que el modelo se especializa en la tarea de SFT.
- Análisis de la trayectoria de pérdida: los checkpoints intermedios permiten estudiar cómo evoluciona la loss de entrenamiento y de validación, y detectar posibles fases de sobreajuste o de inestabilidad.
- Selección empírica del mejor checkpoint para tareas matemáticas: en lugar de usar el estado final, se puede evaluar cada checkpoint sobre el conjunto de validación matemático y quedarse con el de mejor compromiso entre especialización y capacidades generales.
- Reproducción de experimentos de SFT: al publicar todos los estados intermedios con un learning rate y una política de barajado conocidos, el repositorio sirve como referencia reproducible para comparar variantes de hiperparámetros.
- Aprendizaje continuo (continual learning): los checkpoints intermedios son puntos de partida útiles para estudiar estrategias de regularización que mitiguen el olvido al seguir ajustando el modelo.
- Punto de partida para etapas posteriores de alineamiento: cualquiera de los checkpoints puede utilizarse como modelo inicial para experimentos de DPO o RLHF, midiendo cómo afectan estas etapas al olvido ya observado.
- Inferencia de propósito general con cautela: los pesos son cargables y ejecutables con transformers, pero al no existir evaluación publicada del fine-tune, su uso en producción requeriría una validación propia previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que existe un conjunto de artefactos de evaluación por checkpoint en el repositorio de datasets `RL-Forgetting-Experiments-3/qwen2.5-3b-math-kk-sft-artifacts` (ruta `runs/kk_shuffled/eval`), pero no se incluyen cifras en la información proporcionada, por lo que no se presentan valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 12,3 GB solo para los pesos (estimación derivada del tamaño del repositorio, 123,4 GB entre diez checkpoints); en fp16, aproximadamente 6,2 GB; en int8, alrededor de 3,1 GB; en cuantización de 4 bits, en torno a 1,8-2,0 GB. A estas cifras hay que sumar la caché KV correspondiente a la longitud de contexto utilizada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto moderado; RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 (24 GB) para fp16 o fp32 con margen; A100 40/80 GB y H100 para servir varias réplicas o contextos largos en paralelo.
- Compatibilidad con GPU de consumo: sí. Con cuantización a 8 o 4 bits, el modelo cabe en GPUs de consumo de gama media y alta, e incluso en 8 GB de VRAM con contexto reducido.
- Opciones de despliegue: transformers (formato nativo del repositorio), vLLM, TGI y, tras convertir los pesos a GGUF, llama.cpp y Ollama. El autor no publica archivos GGUF, por lo que esa conversión debe realizarla el usuario.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado en el repositorio | Rendimiento |
|---|---|---|---|---|---|
| qwen2.5-3b-kk-sft-shuffled-lr1e5-all-checkpoints | ~3.000 M | No disponible (base: 32.768) | apache-2.0 | 10 checkpoints, safetensors fp32, 123,4 GB | No disponible |
| Qwen/Qwen2.5-3B (modelo base) | ~3.000 M | 32.768 tokens (128.000 con YaRN) | apache-2.0 | Modelo publicado | No disponible en esta ficha |
| Qwen/Qwen2.5-3B-Instruct | ~3.000 M | 32.768 tokens | apache-2.0 | Modelo publicado | No disponible en esta ficha |
| Meta Llama-3.2-3B | ~3.000 M | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Modelo publicado | No disponible en esta ficha |

La comparación se limita a parámetros, contexto y licencia, porque la información proporcionada no incluye resultados de benchmarks para el fine-tune ni cifras verificables de los modelos alternativos. La diferencia relevante frente a las alternativas no es de rendimiento, sino de propósito: este repositorio publica un conjunto de checkpoints intermedios con fines de análisis de olvido, mientras que los modelos comparados son checkpoints finales orientados a uso directo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al derivar de Qwen2.5-3B, el fine-tune hereda los sesgos de los datos de preentrenamiento del modelo base, no auditados aquí.
- Riesgo de alucinación: no evaluado. No hay métricas de veracidad ni de tasa de alucinación publicadas.
- Limitaciones de contexto e idioma: la model card no especifica la longitud de contexto efectiva ni los idiomas soportados tras el ajuste; el ajuste sobre datos posiblemente matemáticos y en un idioma concreto puede haber degradado el rendimiento en otros dominios e idiomas.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia. No obstante, el modelo se distribuye sin garantías y el autor no asume responsabilidad por los resultados.
- Artefacto de investigación, no producto: el repositorio se describe explícitamente como parte de experimentos de análisis de olvido y evaluación de pérdida; no está pensado ni validado para producción.
- Ausencia de evaluación publicada: aunque se mencionan artefactos de evaluación por checkpoint, no se ofrecen cifras en la información disponible, por lo que no es posible conocer el rendimiento real del modelo.
- Coste de descarga elevado: 123,4 GB para diez checkpoints (unos 12,3 GB cada uno), lo que exige planificar el almacenamiento y descargar solo el checkpoint necesario.
- Composición del dataset desconocida: no se detalla el origen, la licencia ni las condiciones de consentimiento de los datos de SFT, lo que impide auditar posibles problemas de derechos o de calidad.
- Sin cuantizaciones oficiales: no se publican versiones GGUF, AWQ ni GPTQ, de modo que cualquier despliegue eficiente requiere conversión por parte del usuario, con el consiguiente riesgo de degradación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RL-Forgetting-Experiments-3/qwen2.5-3b-kk-sft-shuffled-lr1e5-all-checkpoints
- Artefactos de evaluación por checkpoint: https://huggingface.co/datasets/RL-Forgetting-Experiments-3/qwen2.5-3b-math-kk-sft-artifacts/tree/main/runs/kk_shuffled/eval
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog de presentación de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces encontrados correspondían a contenido no relacionado (Rocket League, medios de prensa regional), por lo que se han descartado.
