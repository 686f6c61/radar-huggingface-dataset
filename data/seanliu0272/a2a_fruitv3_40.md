# SeanLiu0272/a2a_fruitV3_40

## Resumen

a2a_fruitV3_40 es una política de imitación (policy) para control robótico entrenada con flow matching, publicada por el usuario SeanLiu0272 (Haotian Liu) en Hugging Face. No se trata de un modelo de lenguaje: es un modelo de acción visomotora que, a partir de dos cámaras (una cámara de cabeza y una cámara de muñeca) y del estado del robot, predice una acción de 7 dimensiones para manipulación robótica en un entorno real. La arquitectura es `A2ANoiseImagePolicy` con el componente de ruido `a2a_noise` y 47,9 millones de parámetros.

El modelo se ha entrenado sobre el conjunto de datos de robot real `fruitV3_40`, compuesto por 40 episodios de teleoperación a 30 Hz, con imágenes de 128x128 píxeles de las cámaras `agentview_rgb` y `robot0_eye_in_hand_rgb`. El repositorio ocupa 2,3 GB e incluye checkpoints periódicos, el estado completo de entrenamiento y los registros de W&B. Es relevante para quienes investigan en imitación robótica y flow matching porque publica artefactos intermedios reproducibles (semilla 42, split del 10 % de episodios para validación, manifiesto SHA-256), aunque se trata de una instantánea a mitad de entrenamiento y no de un modelo final.

Un dato crítico: el autor indica explícitamente que la instantánea se tomó en la época 156 de las 500 previstas, por lo que el modelo no está convergido ni validado más allá de la métrica interna `val_action_mse`. La licencia y los idiomas no están declarados en la model card ni en los metadatos del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `A2ANoiseImagePolicy` con flow matching (`a2a_noise`); política visomotora para robótica |
| Parámetros totales | 47,9 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de imágenes 128x128 y estado del robot) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`.ckpt`) cargados con `torch.load(..., pickle_module=dill, weights_only=False)` |

## Arquitectura y entrenamiento

La política sigue un esquema de flow matching aplicado a la generación de acciones: en lugar de predecir directamente la acción, el modelo aprende un campo de velocidad que transforma una distribución de ruido en la distribución de acciones expertas, condicionado por las observaciones visuales y el estado del robot. La clase concreta es `A2ANoiseImagePolicy` con el módulo de ruido `a2a_noise`, y el total de parámetros asciende a 47,9 M. La entrada combina dos flujos de imagen de 128x128 (`agentview_rgb` y `robot0_eye_in_hand_rgb`) y produce una acción de 7 dimensiones.

El entrenamiento se realizó sobre el dataset `fruitV3_40`, con 40 episodios de teleoperación a 30 Hz. El split de validación es determinista (semilla 42, 10 % de episodios). La instantánea publicada corresponde a las épocas 0-156 de un plan de 500 épocas; el mejor checkpoint según `val_action_mse` se alcanzó en la época 25 con un valor de 0,00887. El repositorio incluye EMA del modelo, normalizador, estado del optimizador y RNG para reanudar el entrenamiento con `--resume`. El código de entrenamiento está en el repositorio de GitHub del autor, bajo `roboverse_learn/il/`.

## Capacidades

- Predicción de acciones de 7 dimensiones para control de robot manipulador a partir de observaciones visuales y de estado.
- Fusión de dos vistas de cámara (cabeza y muñeca) en una única política visomotora.
- Aprendizaje por imitación con flow matching, orientado a generar trayectorias multimodales suaves.
- Entrenamiento reanudable: los checkpoints incluyen optimizador, RNG y normalizador.
- Registro completo de métricas de validación (`val_action_mse`) y visualizaciones latentes.
- No soporta tool calling, function calling, agentes basados en texto, razonamiento simbólico, matemáticas ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en imitación robótica: reproducir el pipeline de flow matching con los checkpoints y el split de semilla 42 para comparar variantes de política sobre el mismo dataset.
- Manipulación de frutas en entorno real: la política está entrenada específicamente sobre el dataset `fruitV3_40`, por lo que su uso previsto es la recogida o manipulación de piezas en una celda con las mismas cámaras y el mismo robot.
- Punto de partida para fine-tuning: el checkpoint `latest.ckpt` incluye estado completo y permite reanudar con `--resume` sobre nuevos episodios de teleoperación.
- Evaluación de robustez visomotora: al disponer de checkpoints en las épocas 50, 100 y 150, se puede medir la degradación o mejora de la política a lo largo del entrenamiento.
- Reproducibilidad de experimentos: el manifiesto `MANIFEST.sha256`, los ficheros `.hydra/` y `launch_*.txt` permiten reconstruir exactamente la configuración de entrenamiento.
- Análisis de representaciones latentes: el directorio `latent_viz/` y los registros de W&B (`xcmtu4i1`) sirven para estudiar cómo evoluciona el espacio latente de la política.
- Docencia y prototipado: con 47,9 M de parámetros, el modelo es lo bastante pequeño para iterar en un solo equipo con GPU de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida de validación `val_action_mse = 0,00887` en la época 25, que no es comparable con métricas de éxito en tarea ni con otros modelos sin el mismo protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 47,9 M de parámetros en fp32 el peso ronda los 190 MB, y el cuello de botella real son las dos cámaras de 128x128 y el preprocesado, no el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 2-4 GB de VRAM debería bastar para inferencia; no hay cifras oficiales del autor.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier RTX de la serie 20 o superior, dado el tamaño reducido del modelo.
- Opciones de despliegue: no hay integración documentada con vLLM, llama.cpp, Ollama ni TGI (no aplican a una política robótica). La carga se realiza con `torch.load` y `pickle_module=dill`, seguido de `load_state_dict` y `.to(device)` del normalizador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| a2a_fruitV3_40 | 47,9 M | 2 cámaras 128x128 + estado, acción 7-d | no disponible | Hugging Face |
| Otras políticas de imitación visomotora (p. ej. ACT, Diffusion Policy) | no disponible en la información | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Instantánea a mitad de entrenamiento: cubre las épocas 0-156 de 500 previstas; no es un modelo convergido ni validado en tarea real más allá de la pérdida de validación.
- El mejor checkpoint según `val_action_mse` es de la época 25, lo que sugiere que el entrenamiento posterior no ha mejorado esa métrica en el momento de la instantánea.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución sin contactar con el autor.
- Especialización estrecha: entrenado sobre 40 episodios de un único dataset y un único robot; no se espera generalización a otras cámaras, objetos o morfologías sin reentrenamiento.
- Riesgo de sobreajuste y de fallo fuera de distribución en posiciones, iluminación o texturas no vistas durante la teleoperación.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento simbólico.
- La carga requiere `pickle_module=dill` y `weights_only=False`, lo que implica confiar en el contenido del checkpoint; conviene verificar `MANIFEST.sha256` antes de cargarlo.
- Los registros de W&B están parcialmente omitidos (log binario `.wandb` no incluido, correo redactado), lo que limita la auditoría completa del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeanLiu0272/a2a_fruitV3_40
- Perfil del autor: https://huggingface.co/SeanLiu0272
- Repositorio de código: https://github.com/seanliu7081/A2A_Flow_Matching
- Script de entrenamiento: `roboverse_learn/il/il_run_real_robot.sh`
- Documentación de entrenamiento en robot real: `roboverse_learn/il/README_real_robot.md`
- Run de W&B: `xcmtu4i1`
