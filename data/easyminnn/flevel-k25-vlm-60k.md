# easyminnn/flevel-k25-vlm-60k

## Resumen
flevel-k25-vlm-60k es un checkpoint de investigación publicado por el usuario easyminnn en Hugging Face, consistente en un ajuste fino de nvidia/GR00T-N1.5-3B para robótica de manipulación. Se trata de un modelo visión-lenguaje-acción (VLA) de 2.987.893.697 parámetros (~3 B) que incorpora una variante de dos decodificadores ("F-level") con compresión de bloques de acción (action chunks): un flujo a velocidad nativa (1x, 16 filas) y un flujo comprimido 2,5x (patrón [2,3,2,3,2,3], que produce 6 filas para 15 pasos). El modelo aborda la generación de comandos de acción para robots a partir de observaciones visuales, reduciendo el coste de inferencia cuando la tarea admite el flujo comprimido.

El ajuste se ha realizado sobre el conjunto RoboCasa MG 300 (7.200 episodios, 3 cámaras a 256x256, 20 fps) y las etiquetas de ratio de velocidad del VLM se han incrustado en el propio tensor de acción (dimensiones 12:14, `ratio_label`). La selección entre ambos flujos se decide en tiempo de evaluación mediante el umbral `tau` (`conf_threshold`), con 0,5 como valor por defecto que no procede del entrenamiento.

Es relevante porque ejemplifica una línea activa en robótica open source: reducir la latencia de los VLA mediante decodificación adaptativa de acciones en lugar de recortar el modelo. Es un checkpoint únicamente de inferencia (sin estado de optimizador, scheduler ni RNG), con 0 descargas y 0 likes en el momento de la consulta, y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) con dos decodificadores de acción ("F-level"), ajustado desde nvidia/GR00T-N1.5-3B |
| Parametros totales | 2.987.893.697 (~3,0 B) |
| Parametros activos | No aplica: no es un modelo MoE según la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible: no se publican variantes GGUF, AWQ, GPTQ ni FP8; el repositorio contiene pesos en safetensors |
| Idiomas soportados | No disponible: el autor no declara idiomas y el modelo está orientado a instrucciones de manipulación robótica |
| Licencia | other (heredada de nvidia/GR00T-N1.5-3B) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,6 GB |
| Pipeline declarado | robotics |
| Modelo base | nvidia/GR00T-N1.5-3B |
| Dataset de ajuste | RoboCasa MG 300: 7.200 episodios, 3 cámaras 256x256, 20 fps |
| Decodificadores | `level_ks=(1, 2.5)`: flujo 1x de 16 filas + flujo comprimido 2,5x con patrón `[2,3,2,3,2,3]` = 6 filas / 15 pasos |
| Cabezal de confianza | Regresión escalar, MSE, `ratio_loss_coef=0.1`, lectura desconectada del codificador de estado |
| Etiquetas | prehj/robocasa-ratio-labels-contact |
| Umbral de evaluación | `tau` (`conf_threshold`); `pred >= tau` selecciona el flujo comprimido. Valor almacenado 0,5, no entrenado |

## Arquitectura y entrenamiento
El checkpoint parte de nvidia/GR00T-N1.5-3B, un modelo visión-lenguaje-acción de NVIDIA que, según la documentación pública de NVIDIA (no verificada en la información proporcionada), combina un backbone visión-lenguaje con un cabezal de acción generativo. La contribución específica de este repositorio es una variante de dos decodificadores denominada "F-level": además del flujo nativo de 16 filas por bloque de acción, se añade un decodificador comprimido 2,5x que emite 6 filas para 15 pasos siguiendo el patrón `[2,3,2,3,2,3]`, es decir, filas de acción con espaciado temporal no uniforme. Un cabezal de confianza de regresión escalar predice el ratio de velocidad del VLM y decide, en inferencia, qué flujo se utiliza.

Las etiquetas de ratio (`prehj/robocasa-ratio-labels-contact`) se incrustan en el tensor de acción en las dimensiones 12:14 (`ratio_label`), de modo que la supervisión del ratio viaja con el propio vector de acción. El entrenamiento se realizó durante 60.000 pasos con batch global 64 (32 x 2 GPU), optimizador AdamW con learning rate 1e-4 y scheduler coseno, warmup 0,05, semilla 42 y precisión bf16 sobre 2 GPU H200. El cabezal de confianza se optimiza con MSE y un coeficiente de pérdida de 0,1, con la lectura desconectada del codificador de estado. El ajuste se hizo sobre RoboCasa MG 300 (7.200 episodios, 3 cámaras a 256x256 y 20 fps). El checkpoint publicado elimina el estado de optimizador, scheduler y RNG, por lo que solo sirve para inferencia y no para reanudar el entrenamiento.

## Capacidades
- Generación de acciones robóticas de manipulación a partir de observaciones visuales (3 cámaras a 256x256) y del estado del robot.
- Decodificación dual de bloques de acción: flujo nativo a velocidad 1x y flujo comprimido 2,5x, seleccionable en inferencia.
- Estimación de confianza del ratio de velocidad mediante un cabezal escalar entrenado con MSE.
- Compresión adaptativa de secuencias de acción (6 filas para 15 pasos en el flujo comprimido), orientada a reducir pasos de decodificación.
- Ejecución directa de las filas devueltas por el servidor: el cliente no vuelve a fusionar ni remuestrear las acciones.
- Ajuste por imitación sobre demostraciones de RoboCasa MG 300 con etiquetas de contacto y de ratio de velocidad.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, modo thinking, audio ni generación de texto general.
- No se declaran capacidades multilingües ni cobertura de idiomas.

## Casos de uso
- Manipulación robótica en simulación RoboCasa: el modelo se sirve con `serve_flevel_robocasa.py --mode ratio_current` y devuelve las filas de acción que el cliente ejecuta tal cual, sin remuestreo posterior, lo que simplifica el bucle de control.
- Aceleración del control en tiempo real: en tareas que admiten el flujo comprimido, el decodificador 2,5x reduce la emisión de 16 filas a 6 filas por bloque de 15 pasos, lo que disminuye el número de pasos de decodificación necesarios para mantener el bucle a 20 fps.
- Investigación en compresión de action chunks: permite comparar experimentalmente el flujo nativo y el comprimido sobre el mismo backbone, con la etiqueta de ratio disponible en las dimensiones 12:14 del tensor de acción.
- Reproducción de experimentos FLARE: la model card referencia el script `papers/reproducing/FLARE/scripts/train_flevel_ratio.py` del repositorio TTKKWAN/F_level, rama `hj-two-decoder-conf`, lo que facilita reproducir el ajuste con `--mode ratio_current --decoder k25 --label-variant vlm`.
- Barrido del umbral de confianza en evaluación: al ser `tau` un parámetro de inferencia y no una constante entrenada, se puede calibrar el compromiso entre fidelidad y velocidad variando su valor sobre el mismo checkpoint.
- Estudio de cabezales auxiliares de confianza: el cabezal escalar con lectura desconectada del codificador de estado es un punto de partida para investigar predicción de dificultad o de velocidad de ejecución en políticas VLA.
- Destilación o reentrenamiento con etiquetas de ratio: el uso de `prehj/robocasa-ratio-labels-contact` permite reutilizar la supervisión de ratio en variantes con otras compresiones o con distintos patrones de chunking.
- Integración en pipelines de investigación con múltiples cámaras: el modelo consume 3 cámaras a 256x256, un formato habitual en bancos de pruebas de manipulación, lo que facilita incorporarlo a entornos de evaluación existentes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye tasas de éxito en RoboCasa, comparaciones con el modelo base ni métricas de latencia o throughput.

## Requisitos de hardware
- VRAM estimada para inferencia: en bf16, los pesos ocupan aproximadamente 6,0 GB (2,99 B parámetros x 2 bytes); en fp32, unos 12 GB; en int8, unos 3 GB; en int4, entre 1,5 y 2 GB. A estas cifras hay que sumar activaciones, el codificador visual y los búferes para 3 cámaras a 256x256.
- Cabe en GPU de consumo: sí. Una RTX 4090 o 3090 (24 GB) puede alojar el modelo en bf16 con margen; una RTX 4080 o 4070 Ti (16 GB) debería ser suficiente en bf16 para inferencia, y en cuantización int8 cabría en GPU de 8-12 GB.
- GPU recomendadas: para ajuste fino, las mismas del entrenamiento publicado (2 x H200); para inferencia, H100, A100 o RTX 4090/5090. El autor no especifica requisitos mínimos.
- Opciones de despliegue: el repositorio indica el script `serve_flevel_robocasa.py --model-path <repo> --mode ratio_current` del proyecto TTKKWAN/F_level. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a VLA con cabezal de acción.
- Latencia y throughput: no disponibles. El único dato cuantitativo relacionado es la reducción del número de filas de acción por bloque (de 16 a 6) al activar el flujo comprimido 2,5x, que no equivale a una medición de latencia.
- Almacenamiento: el repositorio ocupa 8,6 GB en safetensors.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| easyminnn/flevel-k25-vlm-60k | 2,99 B | No disponible | other | Hugging Face (0 descargas, 0 likes) | Checkpoint solo de inferencia, dos decodificadores, sin benchmarks |
| nvidia/GR00T-N1.5-3B | ~3 B (modelo base declarado) | No disponible | No disponible en la información proporcionada | Hugging Face | Modelo base del que deriva este ajuste |
| Otros VLA abiertos de tamaño comparable (OpenVLA, pi0/pi0.5 y similares) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No se aportan datos de estos modelos en la información consultada; requieren verificación externa |

No se dispone de datos verificados de contexto, licencia o rendimiento de las alternativas dentro de la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados por el autor. Al entrenarse exclusivamente sobre RoboCasa MG 300 (dominio de cocina simulado), es esperable un mal comportamiento fuera de esa distribución, aunque el autor no lo declara explícitamente.
- Riesgo de alucinación: en un VLA el equivalente es la generación de trayectorias plausibles pero inválidas; no se aportan métricas de tasa de éxito que permitan acotarlo.
- Ámbito de aplicación muy restringido: el modelo está ajustado para manipulación en RoboCasa y no se declara su uso en robots reales, fuera de simulación ni con otras morfologías.
- Sin idiomas declarados: no hay información sobre el idioma de las instrucciones de texto, lo que dificulta su uso en producción multilingüe.
- Licencia "other": el repositorio hereda la licencia del modelo base nvidia/GR00T-N1.5-3B, cuyo texto no se reproduce en la información consultada. Es imprescindible revisar la licencia del modelo base antes de cualquier uso comercial.
- Checkpoint solo de inferencia: al haberse eliminado el estado de optimizador, scheduler y RNG, no permite reanudar el entrenamiento ni reproducir exactamente la trayectoria de ajuste.
- El umbral `tau` almacenado (0,5) es un valor por defecto no entrenado; usarlo sin calibrar puede degradar la calidad de las acciones si se selecciona el flujo comprimido de forma inadecuada.
- El cliente debe ejecutar las filas devueltas tal cual, sin re-fusionarlas ni remuestrearlas; hacerlo rompe el supuesto de espaciado temporal no uniforme del decodificador comprimido.
- Madurez y soporte: 0 descargas y 0 likes, autor individual, y ausencia de benchmarks publicados. No hay garantía de mantenimiento ni de soporte.
- No se documenta ningún tipo de cuantización oficial; aplicar cuantizaciones externas a un cabezal de acción puede alterar la precisión de las trayectorias y debería validarse empíricamente.

## Enlaces
- Ficha del modelo en Hugging Face: https://huggingface.co/easyminnn/flevel-k25-vlm-60k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Repositorio de código: TTKKWAN/F_level, rama `hj-two-decoder-conf`, commit 29a1090 (script `papers/reproducing/FLARE/scripts/train_flevel_ratio.py --mode ratio_current --decoder k25 --label-variant vlm`)
- Etiquetas de ratio: prehj/robocasa-ratio-labels-contact
- Conjunto de datos de entrenamiento: RoboCasa MG 300 (7.200 episodios, 3 cámaras 256x256, 20 fps)
- Script de servicio: `serve_flevel_robocasa.py --model-path <repo> --mode ratio_current`
- Paper, blog o demo oficial: no disponible
- Nota sobre la búsqueda web: los resultados recuperados no guardan relación con el modelo (hilos de un foro en macedonio sobre una facultad de medicina) y no se incluyen por no ser fuentes relevantes.
