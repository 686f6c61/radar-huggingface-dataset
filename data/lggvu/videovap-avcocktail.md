# lggvu/videovap-avcocktail

## Resumen

`lggvu/videovap-avcocktail` es un checkpoint de investigación para la predicción de turnos de palabra (turn-taking) en conversaciones, publicado en HuggingFace bajo el identificador VideoVAP — AVCocktail. Según su model card, se trata de un modelo de Voice Activity Projection (VAP) construido con un transformer "estéreo" que consume únicamente señal de vídeo, es decir, sin entrada de audio, y entrenado desde cero sobre el corpus AVCocktail. El artefacto publicado incluye el checkpoint final de entrenamiento (`last.ckpt`) y el fichero de hiperparámetros (`hparams.yaml`).

El modelo no es un modelo de lenguaje generativo ni un sistema multimodal de propósito general: su tarea es anticipar la dinámica de alternancia de turnos a partir de información visual. El código con el que se produjo está disponible en el repositorio `mm-turn-taking` del mismo autor, por lo que la reproducibilidad depende de ese código fuente y no de un pipeline estándar de HuggingFace.

Su relevancia actual es limitada pero específica: cubre la intersección entre modelado de conversación multimodal y sistemas interactivos (avatares, agentes encarnados, análisis de reuniones) donde saber *cuándo* va a hablar cada interlocutor importa tanto como saber *qué* se dice. No obstante, la ficha adolece de información crítica: no se publican parámetros, contexto, licencia, idiomas ni métricas, y el tamaño del repositorio figura como 0.0 GB, lo que impide evaluar el modelo sin inspeccionar los ficheros directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estéreo de proyección de actividad de voz (Voice Activity Projection, VAP), entrada solo de vídeo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card declara `license: unknown`) |
| Formato de pesos | `checkpoint.ckpt` (checkpoint de PyTorch Lightning) más `hparams.yaml` |
| Autor | lggvu |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |
| Tamano del repositorio | 0.0 GB (segun el metadato de HuggingFace) |
| Pipeline declarado | no disponible |
| Corpus de entrenamiento | AVCocktail (entrenamiento desde cero) |
| Codigo fuente | `mm-turn-taking` (github.com/lggvu/mm-turn-taking) |

## Arquitectura y entrenamiento

La model card describe el modelo como un "video-only stereo transformer Voice Activity Projection (VAP) turn-taking model". Esto implica tres decisiones de diseño: (1) la tarea es VAP, formulación orientada a predecir la actividad de voz futura de los participantes en lugar de clasificar directamente el siguiente hablante; (2) la entrada es exclusivamente visual, sin flujo de audio; y (3) la arquitectura es un transformer con procesamiento "estéreo", presumiblemente dos canales o vistas, aunque la model card no aclara qué representan esos dos canales ni cómo se fusionan.

El entrenamiento se realizó desde cero sobre el corpus AVCocktail, y el artefacto liberado es el checkpoint final (`last.ckpt`). No se documentan el número de tokens o frames de entrenamiento, la composición del dataset, la configuración de hiperparámetros (más allá de lo que contenga `hparams.yaml`), ni si hubo etapas de ajuste con preferencias humanas, RLHF o DPO. Tampoco se describen innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos SSM. Toda la información de arquitectura más allá de la etiqueta VAP y del carácter solo-vídeo debe obtenerse leyendo el repositorio de código.

## Capacidades

- Predicción de turnos de palabra (turn-taking) en conversaciones, mediante proyección de actividad de voz futura.
- Procesamiento de señal de vídeo como única modalidad de entrada; no consume audio.
- Modelado de interacción multiparticipante, en la medida en que la formulación VAP contempla la actividad de voz de varios interlocutores.
- Entrenamiento específico sobre el corpus AVCocktail, orientado al dominio de ese corpus.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje y no se documenta ninguna interfaz de este tipo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se documenta ningún inventario de idiomas.
- Modo de razonamiento explícito (thinking mode), visión general, audio o generación de texto: no disponible. La única capacidad multimodal declarada es la entrada de vídeo.

## Casos de uso

- Análisis de dinámica de reuniones: el modelo permitiría estimar cuándo va a tomar la palabra cada participante a partir del vídeo de la sala, útil para métricas de participación, detección de dominancia conversacional y resúmenes anotados con turnos.
- Agentes conversacionales encarnados y avatares: un sistema que deba decidir cuándo ceder o tomar el turno puede usar la predicción visual del modelo como señal complementaria, evitando solapamientos y silencios incómodos.
- Robótica social e interacción humano-robot: en entornos donde el robot observa a varias personas, la proyección de actividad de voz basada solo en vídeo permite anticipar intervenciones sin depender de micrófonos o en condiciones de ruido acústico elevado.
- Investigación en conversación multimodal: serviría como modelo de referencia (baseline) para estudiar cuánta información de turn-taking es recuperable únicamente de la señal visual, comparándolo con variantes que sí usan audio.
- Sincronización y segmentación de transcripciones: al anticipar cambios de turno desde el vídeo, puede ayudar a alinear subtítulos o transcripciones diarizadas en grabaciones donde el audio es pobre o está solapado.
- Generación de datos sintéticos y aumento de corpus: las predicciones del modelo pueden emplearse para etiquetar automáticamente grandes volúmenes de vídeo conversacional y preentrenar o evaluar sistemas de diálogo posteriores.
- Evaluación de terapias y entrevistas: métricas objetivas de alternancia de turnos en sesiones grabadas en vídeo, con posible aplicación en formación de habilidades sociales o análisis clínico.

Nota: al no existir documentación sobre el pipeline de inferencia, la viabilidad real de estos casos depende de reproducir el código de `mm-turn-taking` y de que el checkpoint sea funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no reporta ninguna métrica, ni siquiera las habituales en la literatura de VAP (por ejemplo, precisión de predicción del siguiente hablante o F1 de las clases *shift* y *hold*). Tampoco se documenta el protocolo de evaluación ni las particiones de test del corpus AVCocktail utilizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se publica el número de parámetros ni el tamaño del checkpoint, por lo que el cálculo no es posible a partir de la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: indeterminable con los datos publicados. Los modelos de la familia VAP descritos en la literatura suelen ser transformers de tamaño moderado, pero este dato no está confirmado para este checkpoint concreto.
- Opciones de despliegue: el checkpoint es un fichero `.ckpt` de PyTorch Lightning y requiere el código de `mm-turn-taking`; no se declara compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con los pipelines de `transformers`.
- Latencia y throughput estimados: no disponible.
- Observación de integridad: el repositorio figura con un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no haberse subido o que el metadato de tamaño no se ha calculado. Conviene verificar la pestaña de ficheros antes de planificar cualquier despliegue.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada otros checkpoints comparables con especificaciones publicadas (parámetros, contexto, métricas, licencia) que permitan establecer una comparación rigurosa. La búsqueda web asociada a este modelo no devolvió resultados técnicos relevantes.

## Limitaciones y advertencias

- Licencia desconocida (`license: unknown`): no hay autorización explícita para uso comercial ni condiciones de redistribución; en la práctica, el modelo no debería usarse en producción sin aclarar la licencia con el autor.
- Ausencia total de métricas: no se ha publicado ningún resultado de evaluación, por lo que se desconoce si el modelo supera a baselines triviales en su propia tarea.
- Documentación insuficiente: no se especifican parámetros, contexto, hiperparámetros efectivos ni composición del conjunto de entrenamiento, lo que impide estimar coste, latencia o requisitos de memoria.
- Entrada únicamente visual: al no consumir audio, el rendimiento se degradará previsiblemente en escenarios con poca señal visual (cámaras lejanas, baja resolución, oclusiones) o donde los indicios acústicos sean determinantes.
- Dependencia del corpus AVCocktail: el modelo ha sido entrenado desde cero sobre ese corpus, por lo que su generalización a otros dominios, idiomas o configuraciones de grabación no está documentada.
- Idiomas no declarados: se desconoce qué lenguas cubre el entrenamiento y si el comportamiento es consistente entre ellas.
- Riesgo de descalibración: en modelos predictivos de actividad de voz futura, el riesgo principal no es la alucinación de contenido, sino la sobrestimación o subestimación sistemática de la probabilidad de habla, que puede provocar cortes de turno prematuros o esperas excesivas en un sistema interactivo. No hay datos publicados sobre este aspecto.
- Modelo sin validación comunitaria: cero descargas y cero likes en el momento de redactar esta ficha, y publicación y actualización en la misma fecha, lo que indica que no ha pasado por revisión externa.
- No es un modelo de lenguaje: no genera texto, no soporta instrucciones ni tool calling, y no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- Repositorio aparentemente vacío en tamaño (0.0 GB): posible checkpoint ausente o metadatos incompletos.

## Enlaces

- HuggingFace: https://huggingface.co/lggvu/videovap-avcocktail
- Repositorio de código fuente citado en la model card: https://github.com/lggvu/mm-turn-taking
- Paper, blog, demo o dataset adicional: no disponible (la búsqueda web no devolvió resultados técnicos relacionados con este modelo).
