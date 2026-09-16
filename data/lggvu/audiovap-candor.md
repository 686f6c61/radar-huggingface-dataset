# lggvu/audiovap-candor

## Resumen

AudioVAP — Candor es un modelo de proyección de actividad de voz (Voice Activity Projection, VAP) orientado a la predicción de turnos de palabra en conversaciones habladas. Lo publica el usuario lggvu en Hugging Face y se distribuye como un checkpoint de PyTorch (`weights.pt`) acompañado de un fichero de configuración (`params.yaml`). La arquitectura declarada es un transformer estéreo que opera exclusivamente sobre audio, sin entrada de texto ni de vídeo, a pesar de que las etiquetas del repositorio incluyan `video`.

El modelo se ha entrenado desde cero sobre el corpus Candor, un conjunto de conversaciones de vídeo, y el checkpoint publicado corresponde al "Fold 0, epoch 10", lo que sugiere un esquema de validación cruzada por pliegues en el que solo se ha liberado un punto intermedio del entrenamiento. El código fuente asociado está en el repositorio `mm-turn-taking` del mismo autor.

La relevancia de este tipo de modelos radica en que la predicción de turnos es un componente crítico de los sistemas de diálogo hablado: saber cuándo va a terminar el interlocutor o cuándo se va a producir un solapamiento permite reducir la latencia percibida en asistentes de voz y mejorar la naturalidad de la interacción. En el momento de redactar esta ficha el repositorio no tiene descargas ni "likes" registrados, no declara licencia y tiene un tamano de 0,0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer estéreo sobre audio, para Voice Activity Projection (VAP) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (se define en `params.yaml`, no publicado en la información disponible) |
| Tipos de cuantización | no disponible (el repositorio solo incluye `weights.pt` en formato PyTorch) |
| Idiomas soportados | no disponible (modelo de audio, no de texto; no se declara lista de idiomas) |
| Licencia | unknown (declarada como "unknown" en la ficha de Hugging Face) |
| Formato de pesos | PyTorch (`weights.pt`) más fichero de configuración `params.yaml` |
| Tarea | Voice Activity Projection y predicción de turnos de palabra |
| Modalidad de entrada | Audio estéreo (sin texto, sin vídeo) |
| Corpus de entrenamiento | Candor |
| Checkpoint publicado | Fold 0, epoch 10 |
| Autor | lggvu |
| Código fuente | https://github.com/lggvu/mm-turn-taking |
| Fecha de creación del repo | 2026-09-16 |
| Fecha de última actualización | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo se presenta como un transformer estéreo de audio para Voice Activity Projection. En la formulación habitual de esta tarea, el modelo recibe la señal de audio de los interlocutores y produce, trama a trama, estimaciones sobre la actividad de voz futura: qué interlocutor hablará en una ventana de tiempo posterior, si habrá solapamiento y si se producirá un cambio de turno. La entrada estéreo es coherente con este planteamiento, ya que permite asociar cada canal a un participante y modelar la dinámica de turnos sin necesidad de una etapa previa de diarización.

El entrenamiento se ha realizado desde cero sobre el corpus Candor, sin indicios en la información disponible de que se haya partido de un modelo preentrenado. No se especifican el número de tokens ni de horas de audio utilizadas, la composición exacta del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO, algo por otra parte poco habitual en este tipo de modelos no generativos. El checkpoint liberado corresponde al pliegue 0 en la epoch 10, lo que apunta a un entrenamiento con validación cruzada y a la publicación de un punto intermedio del proceso, no necesariamente el mejor modelo del pliegue. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mecanismos híbridos SSM) más allá de la propia formulación VAP y del uso de audio estéreo.

## Capacidades

- Predicción de actividad de voz futura a partir de audio, en la línea de la tarea Voice Activity Projection.
- Predicción de cambios de turno y de solapamiento entre interlocutores, útil para decidir cuándo debe intervenir un sistema.
- Procesamiento de audio estéreo, con separación de canales que permite asociar cada flujo a un participante.
- Operación exclusivamente sobre audio: no acepta texto como entrada ni genera texto como salida.
- No dispone de tool calling ni de function calling.
- No incorpora capacidades de agente ni de razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No se declaran capacidades multilingües, de visión, de audio generativo ni de modo "thinking".
- Entrenamiento orientado a un único corpus (Candor) y a un único pliegue, lo que limita su generalización fuera de ese dominio sin reentrenamiento.

## Casos de uso

- Gestión de turnos en asistentes de voz: el modelo puede estimar cuándo el usuario ha terminado de hablar y anticipar el momento óptimo para que el asistente responda, reduciendo la latencia percibida en comparación con un detector de silencio por umbral.
- Detección de interrupciones en tiempo real: al proyectar actividad de voz futura, permite que un agente conversacional ceda el turno de forma natural cuando el usuario va a retomarlo.
- Análisis de reuniones y videollamadas: la salida del modelo puede alimentar métricas de participación, solapamiento y distribución de turnos por participante, aprovechando la entrada estéreo para separar interlocutores.
- Segmentación previa a transcripción: las fronteras de turno predichas sirven para trocear audio largo antes de pasarlo a un sistema ASR, mejorando la coherencia de los segmentos por hablante.
- Investigación en interacción conversacional: sirve como punto de partida reproducible para comparar arquitecturas VAP, ya que el autor publica el script de entrenamiento en `mm-turn-taking`.
- Sistemas de diálogo hablado con barge-in controlado: permite que un asistente de voz decida si debe detener su respuesta cuando el usuario empieza a hablar, evitando solapamientos incómodos.
- Robótica social y agentes encarnados: la predicción de turnos puede usarse como señal para sincronizar gestos o movimientos de cabeza con la dinámica conversacional, siempre que se entrene o adapte al dominio concreto.
- Evaluación de calidad conversacional en entornos clínicos o de coaching: patrones de solapamiento y latencia de turno son indicadores usados en análisis de interacción; el modelo aporta una señal automática sobre audio estéreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de validación, comparaciones con líneas base ni resultados sobre conjuntos de test. El repositorio tampoco aporta cifras de latencia, throughput ni consumo de recursos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se ha publicado el número de parámetros ni el tamano de `weights.pt`, por lo que no es posible calcular una cifra fiable. La estimación puede obtenerse inspeccionando el checkpoint (`weights.pt`) una vez descargado.
- GPU recomendadas: no disponible. Al tratarse de un transformer de audio sin cifras publicadas de parámetros, no se puede recomendar una GPU concreta (A100, H100, RTX 4090 u otras) sin medir antes el modelo.
- Viabilidad en GPU de consumo: no verificable con la información disponible. Si el modelo es de tamano reducido, como suele ser habitual en la familia VAP, podría ejecutarse en GPU de consumo e incluso en CPU; esto es una consideración general y no un dato confirmado para este checkpoint.
- Opciones de despliegue: el formato es un checkpoint de PyTorch (`weights.pt`) con su `params.yaml`, por lo que la ruta natural es cargarlo con PyTorch siguiendo el código de `mm-turn-taking`. No hay soporte declarado en vLLM, llama.cpp, Ollama ni TGI, y en la mayoría de esos casos no aplica al no tratarse de un modelo de lenguaje con vocabulario y decodificación autorregresiva de texto.
- Latencia y throughput estimados: no disponibles.
- Requisito de entrada: entrada de audio estéreo; las grabaciones mono requerirán preprocesado previo para adaptarlas al formato esperado por el modelo.

## Comparativa con modelos similares

La búsqueda web realizada no devolvió información relevante sobre este modelo ni sobre alternativas comparables (los resultados obtenidos fueron páginas de cuestionarios diarios de Bing, sin relación con el modelo). Con la información disponible no es posible establecer una comparativa rigurosa de parámetros, contexto, rendimiento, licencia y disponibilidad frente a otras alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AudioVAP — Candor (lggvu) | no disponible | no disponible | unknown | Checkpoint PyTorch en Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia declarada como "unknown": no hay autorización explícita de uso, lo que impide asumir que se pueda utilizar en producción o en productos comerciales sin contactar con el autor.
- Checkpoint intermedio: corresponde al pliegue 0, epoch 10, sin indicación de que sea el mejor punto del entrenamiento ni de que haya convergido.
- Ausencia total de métricas: no se publican resultados de validación ni de test, por lo que no se puede estimar su calidad frente a líneas base de la tarea VAP.
- Sesgo de dominio: el entrenamiento se ha hecho únicamente sobre el corpus Candor, compuesto por conversaciones de vídeo; el rendimiento fuera de ese tipo de interacción (llamadas telefónicas, audio mono, entornos ruidosos, otras lenguas) es desconocido.
- Sesgos demográficos y lingüísticos: al depender de un único corpus, es probable que herede sus sesgos de acento, registro y perfil de hablantes, aunque no se documenta ningún análisis al respecto.
- Errores de predicción: el modelo no genera texto, por lo que el riesgo clásico de alucinación no aplica igual, pero sí puede producir falsos positivos y negativos en la predicción de turnos, con impacto directo en la experiencia del usuario si se usa para decidir cuándo hablar.
- Requisito de audio estéreo: no se documenta el comportamiento con entradas mono ni el preprocesado necesario.
- Sin validación de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, y un tamano de repositorio de 0,0 GB, lo que sugiere que el contenido puede no estar completamente subido o verificado.
- Falta de documentación: no se especifican datos de entrenamiento, hiperparámetros, cómputo utilizado ni procedimiento de evaluación, lo que dificulta la reproducibilidad.
- Uso en producción: al no haber soporte en servidores de inferencia habituales ni formato GGUF, la integración requeriría trabajo adicional de empaquetado y servicio alrededor de PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lggvu/audiovap-candor
- Código fuente (mm-turn-taking): https://github.com/lggvu/mm-turn-taking
- Corpus Candor: https://betterup.com/research/candor-corpus
- Paper, blog o demo del modelo: no disponible en la información proporcionada. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
