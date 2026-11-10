# kapardi93/LongVQU-Eval-mkapardi

## Resumen

LongVQU-Eval-mkapardi es el paquete de pesos y código presentado por el equipo de mkapardi para la tarea LongVQU-Eval, una evaluación de comprensión de vídeo de larga duración con preguntas de distinta naturaleza (LQU, CQR y GQU). No se trata de un modelo único entrenado desde cero, sino de un sistema compuesto por tres configuraciones de inferencia sobre modelos base de Qwen (un Qwen3.5-27B para LQU y un Qwen3-VL-32B-Instruct para CQR y GQU), complementadas con un adaptador LoRA y calibradores numéricos que ajustan las probabilidades de salida. El objetivo declarado es reproducir exactamente el envío final del equipo, que obtuvo una precisión oficial de 0,5833 (LQU 0,68, CQR 0,46, GQU 0,61).

La relevancia de este repositorio es fundamentalmente metodológica y de reproducibilidad: documenta con precisión qué pesos, qué revisiones de modelos base y qué calibradores se usaron, e incluye los datos numéricos de entrada de los calibradores y las respuestas enviadas para poder verificar la reproducción. No obstante, el repositorio no contiene una model card convencional con especificaciones del modelo (arquitectura, contexto, idiomas), sino instrucciones de ejecución, por lo que muchos de los datos técnicos solicitados no están disponibles en la información proporcionada.

El tamaño del repositorio (122,3 GB, con los modelos base incluidos) y el requisito de una GPU con aproximadamente 135 GB de memoria sitúan este paquete en el terreno de la evaluación a gran escala, no del uso como modelo de propósito general. La licencia del conjunto de datos de desarrollo (CC BY-NC-SA 4.0 en el momento de la redacción) condiciona además el uso comercial de los artefactos entrenados sobre él.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema compuesto: Qwen3.5-27B (LQU) y Qwen3-VL-32B-Instruct (CQR y GQU) con adaptador LoRA y calibradores |
| Parámetros totales | no disponible (los modelos base son de 27B y 32B; el paquete no declara un total agregado) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se distribuyen en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el repositorio; los modelos base son Apache-2.0 y el conjunto de desarrollo es CC BY-NC-SA 4.0 según la model card |
| Formato de pesos | safetensors (modelos base y adaptador); calibradores en `.pt` (PyTorch) |

## Arquitectura y entrenamiento

El sistema no entrena un transformer nuevo, sino que combina dos modelos base de la familia Qwen: Qwen3.5-27B, usado sin adaptador para la tarea LQU, y Qwen3-VL-32B-Instruct, usado sin adaptador para GQU y con un adaptador LoRA para CQR. Sobre las salidas de cada rama se aplican calibradores específicos (`lqu_qwen35_calibrator.pt`, `cqr_lora_calibrator.pt`, `gqu_stack_calibrator.pt`) que transforman las probabilidades logarítmicas en las respuestas finales. La model card indica que el adaptador y los calibradores se entrenaron sobre el conjunto de desarrollo de LongVQUBench.

La información disponible no detalla la composición del dataset de entrenamiento (número de tokens, mezcla de datos, uso de RLHF o DPO), ni innovaciones arquitectónicas internas más allá del uso de un modelo con capacidades de visión (Qwen3-VL) para las tareas CQR y GQU. La reproducibilidad se apoya en revisiones concretas de los modelos base: `fc05daec18b0a78c049392ed2e771dde82bdf654` para Qwen3.5-27B y `0cfaf48183f594c314753d30a4c4974bc75f3ccb` para Qwen3-VL-32B-Instruct. El propio autor advierte que las log-probabilidades pueden variar hasta aproximadamente 0,25 entre ejecuciones, aunque las respuestas no deberían cambiar.

## Capacidades

- Evaluación de comprensión de vídeo de larga duración en tres subtareas: LQU, CQR y GQU.
- Procesamiento de vídeo y preguntas asociadas mediante el modelo Qwen3-VL-32B-Instruct en las ramas CQR y GQU.
- Razonamiento sobre texto y preguntas de formato largo mediante Qwen3.5-27B en la rama LQU.
- Ajuste fino con LoRA para la subtarea CQR.
- Calibración numérica de las probabilidades de salida para alinear las predicciones con el envío oficial.
- Reproducción determinista del pipeline completo mediante `run.sh` y scripts auxiliares (`prepare_test_questions.py`, `fetch_videos.py`, `reproduce.py`).
- Verificación rápida en CPU sin vídeos (`python3 reproduce.py --saved`, aproximadamente 1 minuto).
- No se documentan capacidades de tool calling, agentes, multilingüismo ni modos de pensamiento en la información disponible.

## Casos de uso

- Reproducción de resultados de investigación: el paquete permite volver a ejecutar el pipeline completo sobre los datos de test y comparar las predicciones con `S1_best_predictions.zip`, lo que resulta adecuado para auditar el envío de un equipo en una competición.
- Verificación de calibradores: los ficheros `test_inputs.pt` y los calibradores permiten estudiar cómo se transforman las log-probabilidades en respuestas finales, útil para investigar técnicas de calibración en tareas de vídeo-pregunta.
- Evaluación comparativa de modelos base: al incluir Qwen3.5-27B y Qwen3-VL-32B-Instruct con revisiones fijadas, sirve para medir el rendimiento de estos modelos en las subtareas LQU, CQR y GQU bajo un protocolo concreto.
- Estudio de adaptación con LoRA en tareas de vídeo: la rama CQR con adaptador permite analizar la contribución del ajuste fino frente al modelo base sin adaptador (rama GQU).
- Docencia y formación en evaluación de modelos multimodales: el pipeline separa preparación de preguntas, descarga de vídeos, inferencia y calibración, lo que facilita explicar cada etapa de una evaluación de vídeo de larga duración.
- Punto de partida para participar en LongVQU-Eval: el código y los pesos permiten a otros equipos partir de una línea base reproducible con precisión conocida (0,5833 global) y mejorarla.
- Auditoría de licencias y procedencia de datos: la model card documenta las revisiones de los modelos base y las condiciones del conjunto de desarrollo, lo que facilita revisar el cumplimiento antes de reutilizar los artefactos.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los del envío oficial del equipo:

| Subtarea | Precisión |
|---|---|
| LQU | 0,68 |
| CQR | 0,46 |
| GQU | 0,61 |
| Global | 0,5833 |

No se han publicado resultados comparativos con otros modelos ni métricas adicionales (MMLU, HumanEval, GSM8K u otras) en la información disponible.

## Requisitos de hardware

- GPU con aproximadamente 135 GB de memoria para ejecutar el pipeline completo según la model card.
- Descarga de aproximadamente 115 GB (122,3 GB de tamaño de repositorio, con modelos base incluidos).
- Entorno de Python 3.12 y dependencias instalables mediante `requirements.txt`.
- Ejecución completa en GPU estimada en unas 2 horas según la model card.
- Verificación rápida en CPU sin vídeos: aproximadamente 1 minuto con `python3 reproduce.py --saved`.
- No se especifican GPU concretas (A100, H100, RTX 4090) ni opciones de despliegue como vLLM, llama.cpp, Ollama o TGI en la información disponible.
- No se documentan latencia ni throughput por token en la información disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros sistemas de la misma categoría ni métricas de terceros que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio no es un modelo de propósito general: está diseñado para reproducir un envío concreto en LongVQU-Eval y no se documentan sus capacidades fuera de ese contexto.
- La model card no declara licencia para el repositorio; los modelos base son Apache-2.0, pero el adaptador y los calibradores se entrenaron sobre LongVQUBench, cuyo conjunto de desarrollo es CC BY-NC-SA 4.0 en el momento de la redacción, lo que puede restringir el uso comercial.
- El conjunto de test (`Aarna004/LongVQU-Eval`) está restringido (gated) y requiere acceso por parte del organizador.
- Las log-probabilidades pueden variar hasta aproximadamente 0,25 entre ejecuciones, aunque el autor indica que las respuestas no deberían cambiar; esto afecta a la reproducibilidad exacta de los valores numéricos.
- El requisito de aproximadamente 135 GB de VRAM limita la ejecución a hardware de gama alta y dificulta su uso en entornos de desarrollo convencionales.
- No se documentan sesgos conocidos, riesgos de alucinación específicos, limitaciones de contexto o idioma en la información disponible.
- No se proporcionan datos sobre el entrenamiento (tokens, mezcla de datos, RLHF/DPO) que permitan evaluar la robustez del sistema fuera del conjunto de evaluación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kapardi93/LongVQU-Eval-mkapardi
- Conjunto de datos de test (gated): https://huggingface.co/Aarna004/LongVQU-Eval
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Modelo base Qwen3-VL-32B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
