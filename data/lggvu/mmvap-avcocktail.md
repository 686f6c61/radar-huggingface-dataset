# lggvu/mmvap-avcocktail

## Resumen

MMVAP — AVCocktail es un modelo de proyección de actividad de voz (Voice Activity Projection, VAP) con fusión temprana de audio y vídeo, orientado a la predicción de turnos de palabra (turn-taking) en interacción conversacional. Lo publica el usuario lggvu en Hugging Face y, según su model card, se ha entrenado desde cero sobre el corpus AVCocktail. El checkpoint liberado corresponde a la época 5, con val/loss = 3,3068, y se distribuye únicamente como `checkpoint.ckpt` de PyTorch Lightning junto a su `hparams.yaml`.

A diferencia de un modelo de lenguaje, no genera texto: su tarea es proyectar la actividad de voz futura de los interlocutores para anticipar cuándo alguien va a tomar o ceder el turno. La incorporación de la señal visual mediante fusión temprana busca desambiguar situaciones que el audio por sí solo no resuelve, como pausas largas con intención de continuar o solapamientos con intención de cesión.

Su relevancia actual es limitada y, sobre todo, exploratoria: el repositorio acumula 0 descargas y 0 likes, la licencia figura como "unknown", no hay pipeline declarado, no se documentan idiomas soportados y no se han publicado resultados de benchmarks. Se trata, por tanto, de un artefacto de investigación reproducible a través del repositorio de código del autor, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el autor la describe como "audio-visual early-fusion Voice Activity Projection (VAP)" para turn-taking |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se describe como MoE) / no disponible |
| Longitud de contexto | No disponible (depende del enventanado de audio-vídeo usado en el entrenamiento, no documentado) |
| Tipos de cuantizacion | No disponible; solo se publica el checkpoint en precisión de entrenamiento |
| Idiomas soportados | No disponible |
| Licencia | unknown (no especificada) |
| Formato de pesos | `checkpoint.ckpt` (PyTorch Lightning) + `hparams.yaml`; no se publican safetensors, GGUF ni ONNX |
| Tamano del repositorio | 0,1 GB |
| Entradas | Audio y vídeo (señales multimodales); formato exacto no disponible |
| Salidas | Proyección de actividad de voz / predicción de turn-taking; formato exacto no disponible |

## Arquitectura y entrenamiento

El autor indica que el modelo se entrena desde cero ("from scratch") sobre el corpus AVCocktail y que emplea una estrategia de fusión temprana de las modalidades de audio y vídeo. En la literatura de VAP, la fusión temprana implica combinar las representaciones de ambas modalidades antes del modelado temporal, en lugar de agregar predicciones independientes (fusión tardía); esto permite que la red explote la correlación entre rasgos acústicos y visuales durante toda la secuencia. No se documenta en la información disponible el tipo de codificador acústico o visual, la dimensión de las representaciones, ni si el backbone es un transformer, una red convolucional o un modelo híbrido.

Tampoco se especifican el número de tokens o el volumen de horas de entrenamiento, la composición del dataset, el uso de RLHF o DPO (poco habituales en esta tarea, donde el objetivo es una proyección autosupervisada o supervisada con etiquetas de actividad de voz), ni el horizonte temporal de predicción. El único dato cuantitativo publicado es el checkpoint seleccionado: época 5, con val/loss = 3,3068, descrito como el de menor pérdida de validación del run. El autor advierte además que el checkpoint de la época 3 no se conservó en disco, por lo que no se puede reconstruir la trayectoria completa del entrenamiento ni comprobar si existió sobreajuste entre ambas.

## Capacidades

- Proyección de actividad de voz (VAP): estima la probabilidad de voz futura de los interlocutores a partir del contexto audiovisual.
- Predicción de turnos de palabra (turn-taking): anticipación de toma, cesión y mantenimiento del turno, incluidos solapamientos.
- Fusión audiovisual temprana: explota simultáneamente información acústica y visual, lo que en esta familia de modelos suele mejorar la detección de intención de turno frente a audio solo.
- Modelado de conversaciones multiparticipante: el pipeline de referencia (`mm-turn-taking`) sugiere procesamiento de audio multicanal y vídeo asociado.
- No es un modelo de lenguaje: no genera texto, no responde a instrucciones, no hace razonamiento simbólico ni matemáticas.
- Tool calling / function calling: no disponible (no documentado, y fuera del alcance declarado del modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; al operar sobre señal acústica y visual podría ser en gran medida independiente del idioma, pero esto no está confirmado por el autor.
- Capacidades especiales (modo thinking, audio, visión): multimodalidad audio-vídeo sí; decodificación especulativa, atención lineal u otras optimizaciones: no disponible.

## Casos de uso

- Sistemas de diálogo con gestión de turnos: el modelo puede usarse como módulo de predicción de turno para que un asistente de voz decida cuándo empezar a hablar y cuándo callar, reduciendo interrupciones en conversaciones naturales.
- Detección de "barge-in" en asistentes de voz: permite distinguir entre una pausa de duda y una intención real de tomar la palabra, con la señal visual como apoyo cuando el audio es ambiguo.
- Análisis de reuniones y transcripción enriquecida: etiquetado automático de quién habla, cuándo y con qué intención de cesión, útil para diarización y resúmenes con marcas temporales de turno.
- Robots sociales e interacción humano-robot: un agente físico puede sincronizar sus respuestas con los turnos del usuario, un aspecto crítico en dominios como recepción, educación o asistencia a personas mayores.
- Analítica de centros de contacto: medición objetiva de solapamientos, latencia de respuesta y equilibrio de turnos entre agente y cliente, como métrica de calidad conversacional.
- Producción audiovisual y doblaje: la proyección de actividad de voz ayuda a segmentar pistas y a sincronizar doblaje o subtitulado con los puntos reales de cambio de hablante.
- Avatares y agentes conversacionales animados: la predicción anticipada de turno permite preparar gestos, mirada y movimientos de boca antes de que el usuario termine de hablar.
- Investigación en ciencias del comportamiento: cuantificación de dinámicas de turno en interacción social, incluyendo estudios clínicos o de desarrollo del lenguaje.

En todos los casos, conviene tratar estas aplicaciones como hipótesis de uso derivadas de la tarea declarada: no hay evaluación publicada que demuestre el rendimiento del checkpoint en ninguno de estos escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato numérico aportado por el autor es la pérdida de validación del checkpoint liberado (época 5, val/loss = 3,3068). Se trata de un valor sin escala de referencia, sin métrica acompañante (no se indica si la pérdida es binaria cruzada, MSE u otra) y sin comparación con líneas base, por lo que no permite establecer una valoración objetiva del rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia indirecta, el repositorio completo ocupa 0,1 GB, lo que sitúa el checkpoint muy por debajo de los 100 millones de parámetros en precisión de entrenamiento; una estimación razonable sería inferencia en CPU o en cualquier GPU de consumo con pocos cientos de MB de memoria, pero es una inferencia a partir del tamaño del repositorio, no un dato documentado.
- GPU recomendadas: no disponible. Por tamaño del artefacto, cualquier GPU moderna (RTX 3060 o superior, A100, H100) debería ser suficiente; no se justifica hardware de gama alta para este checkpoint.
- GPU de consumo: probablemente sí, dado el tamaño del repositorio, aunque no está confirmado por el autor.
- Opciones de despliegue: no disponible. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI. El único camino documentado es cargar el `checkpoint.ckpt` con PyTorch Lightning y el código de `mm-turn-taking`.
- Latencia y throughput estimados: no disponible. Dependen del enventanado de audio-vídeo, del codificador visual y del hardware, ninguno de los cuales está documentado.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La familia más cercana es la línea de investigación de Voice Activity Projection (VAP) sobre audio, y trabajos de predicción de turnos basados en lenguaje como TurnGPT; sin embargo, no se han facilitado especificaciones, licencias ni resultados de esos modelos en el material disponible, por lo que cualquier comparación numérica sería inventada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MMVAP — AVCocktail (lggvu) | No disponible | No disponible | val/loss = 3,3068 en época 5 | unknown | Checkpoint en Hugging Face (0 descargas) |
| Modelos VAP de referencia (audio) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |
| TurnGPT u otros predictores de turno basados en texto | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia "unknown": sin una licencia explícita no hay autorización clara de uso comercial, modificación ni redistribución. Cualquier despliegue en producción requiere contactar con el autor.
- Ausencia de model card detallada: no se documentan datos de entrenamiento, composición del corpus AVCocktail, sesgos demográficos o lingüísticos, ni limitaciones conocidas.
- Riesgo de predicción errónea: en esta tarea, un falso positivo de turno puede provocar interrupciones indebidas en un sistema de diálogo; un falso negativo, silencios incómodos. No hay métricas publicadas para calibrar ese compromiso.
- Cobertura de idiomas y acentos: no disponible. El comportamiento fuera de la distribución del corpus de entrenamiento (idiomas, acentos, entornos ruidosos, vídeo de baja calidad) es desconocido.
- Sesgo del corpus: al entrenarse exclusivamente desde cero sobre AVCocktail, el modelo hereda los sesgos de composición, idioma y condiciones de grabación de dicho corpus.
- Checkpoint único e incompleto: solo se conserva la época 5 (la época 3 no se retuvo), lo que impide evaluar la estabilidad del entrenamiento o seleccionar un punto alternativo.
- Sin validación comunitaria: 0 descargas y 0 likes implican que no existe verificación independiente de la reproducibilidad ni del rendimiento real del checkpoint.
- Formato propietario del framework: al publicarse solo como `.ckpt` de PyTorch Lightning, su integración exige el código fuente del autor y dificulta el uso con runtimes de inferencia estandarizados.
- Naturaleza no generativa: no debe emplearse como modelo de lenguaje, chat, generación de código ni razonamiento; las expectativas de esas capacidades no aplican.
- Riesgo de dependencia del codigo: cualquier cambio futuro en `mm-turn-taking` puede romper la carga del checkpoint, ya que no se publican pesos en formatos neutros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lggvu/mmvap-avcocktail
- Repositorio de código fuente: https://github.com/lggvu/mm-turn-taking
- Paper o informe técnico: no disponible
- Demo o Space: no disponible
- Corpus AVCocktail (enlace oficial): no disponible en la informacion proporcionada
- Licencia: no disponible (figura como "unknown")
- Las búsquedas web realizadas no devolvieron enlaces relevantes sobre este modelo ni sobre su corpus de entrenamiento.
