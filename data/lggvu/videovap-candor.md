# lggvu/videovap-candor

## Resumen

VideoVAP — Candor es un checkpoint de investigación publicado por el usuario lggvu en HuggingFace. Se trata de un modelo de predicción de turnos de palabra (turn-taking) basado en la técnica Voice Activity Projection (VAP), construido sobre una arquitectura transformer y descrito por su autor como «video-only stereo transformer». Es decir, el modelo proyecta la actividad de voz futura de los participantes de una conversación a partir de la señal de vídeo, sin usar audio como entrada, según lo indicado en la model card.

El modelo se ha entrenado desde cero sobre el corpus Candor, un corpus de conversaciones enlazado por el autor a betterup.com/research/candor-corpus. El checkpoint publicado corresponde al pliegue (fold) 0, época 10 de ese entrenamiento. No es un modelo de lenguaje generativo: no produce texto, sino predicciones de actividad de voz orientadas a decidir quién habla a continuación y cuándo termina un turno.

Su relevancia es acotada y muy específica: los modelos VAP se emplean en investigación sobre interacción conversacional, agentes de diálogo y sistemas de diálogo hablado de baja latencia, donde anticipar el final de turno reduce el tiempo de respuesta percibido. El repositorio tiene 0 descargas y 0 «likes», un tamaño reportado de 0,0 GB y licencia desconocida, por lo que debe considerarse un artefacto de investigación sin garantías de soporte, documentación ampliada ni uso comercial declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer orientado a Voice Activity Projection (VAP), variante «video-only stereo» |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible (no es un modelo autorregresivo de lenguaje; la ventana temporal de análisis depende de la configuración de `params.yaml`, no publicada en la model card) |
| Tipos de cuantización | no disponible; el checkpoint se distribuye en el formato y precisión de entrenamiento |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | unknown (desconocida) |
| Formato de pesos | PyTorch (`.pt`), acompañado de `params.yaml` |
| Autor | lggvu |
| Fecha de creación del repositorio | 2026-09-16 |
| Última actualización | 2026-09-16 |
| Tamaño del repositorio | 0,0 GB (según HuggingFace) |
| Checkpoint | Fold 0, época 10 |
| Corpus de entrenamiento | Candor |
| Código fuente | github.com/lggvu/mm-turn-taking |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo como un «video-only stereo transformer Voice Activity Projection (VAP) turn-taking model». Los tres elementos clave son: (1) la tarea es Voice Activity Projection, es decir, predecir la actividad de voz futura de los interlocutores en lugar de clasificar únicamente el instante actual; (2) la arquitectura es un transformer; y (3) la modalidad de entrada es únicamente vídeo, pese a que las etiquetas del repositorio incluyen `audio`. El término «stereo» en la literatura VAP suele referirse a la configuración de dos hablantes (dos canales o dos flujos), pero la model card no detalla cómo se materializa esa doble vía en un modelo de solo vídeo.

En cuanto al entrenamiento, el autor indica que se ha realizado «from scratch» (desde cero, sin inicializar desde un modelo preentrenado) sobre el corpus Candor, y que el checkpoint publicado corresponde al pliegue 0, época 10. No se especifican el número de tokens, horas de vídeo, composición del conjunto de datos, resolución o tasa de fotogramas de entrada, ni si hubo etapas de ajuste fino con preferencias humanas (RLHF/DPO). Tampoco se documentan innovaciones técnicas adicionales más allá de la propia formulación VAP sobre vídeo. No hay información sobre la función de pérdida ni sobre el esquema de validación cruzada (solo se sabe que existe una partición en pliegues, de la que se publica el pliegue 0).

## Capacidades

- Predicción de turnos de palabra: estimación de la actividad de voz futura de los participantes de una conversación a partir de vídeo.
- Detección anticipada de final de turno (end-of-turn), útil para reducir la latencia de respuesta en agentes conversacionales.
- Modelado de dos interlocutores («stereo»), según la descripción del autor.
- Funcionamiento en modalidad exclusivamente visual: no requiere señal de audio como entrada.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan capacidades de generación de texto, código, matemáticas o visión general (el uso de vídeo es específico para la tarea VAP, no para descripción de imágenes).
- No se documenta ningún modo especial (thinking mode, audio, etc.).

## Casos de uso

- Agentes conversacionales de baja latencia: el modelo permite estimar cuándo el usuario va a terminar su turno, de modo que el agente pueda preparar su respuesta antes del silencio real y reducir la latencia percibida en la conversación.
- Reuniones y videoconferencia: integrado en una plataforma de vídeo, puede aportar señales de actividad de voz prevista para activar o desactivar micrófonos, gestionar la cancelación de ruido o marcar quién tiene el turno sin depender de la pista de audio.
- Robots sociales e interfaces de interacción físico-digital: un robot que observa al usuario por cámara puede usar las proyecciones de actividad de voz para decidir cuándo intervenir o cuándo permanecer en silencio.
- Análisis de dinámica conversacional en investigación: permite cuantificar patrones de alternancia de turno y solapamiento sobre corpus de entrevistas o conversaciones grabadas, apoyando estudios de lingüística interaccional.
- Investigación multimodal: sirve como punto de partida para estudiar hasta qué punto la información visual es suficiente para predecir turnos, comparándolo con variantes que sí usan audio.
- Segmentación previa a ASR: la predicción de actividad de voz futura puede alimentar lógicas de endpointing en pipelines de reconocimiento automático del habla, determinando cuándo cerrar un segmento de audio.
- Replicación y reproducción de experimentos: al publicarse el checkpoint del pliegue 0 junto al código en `mm-turn-taking`, permite reproducir y comparar configuraciones de entrenamiento en la misma partición de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de validación para el pliegue 0 ni comparaciones con otras variantes o líneas base, y el repositorio no presenta tabla alguna de resultados.

## Requisitos de hardware

- No hay datos publicados sobre VRAM, latencia o throughput. El repositorio ocupa 0,0 GB y no se indica el número de parámetros, por lo que no es posible estimar el consumo de memoria con rigor.
- Para cualquier estimación sería necesario consultar `params.yaml` y el código de `github.com/lggvu/mm-turn-taking`, no incluidos en la información disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; dependerá del tamaño real del checkpoint, que no se declara.
- Opciones de despliegue: los servidores de inferencia de propósito general para modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no son aplicables a un modelo VAP, ya que no es un modelo autorregresivo de texto. El despliegue requeriría ejecutar el código de `mm-turn-taking` con PyTorch y cargar `weights.pt` junto con `params.yaml`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificables (número de parámetros, contexto, métricas, licencia) de este modelo ni de alternativas comparables dentro de la información proporcionada, por lo que la comparación cuantitativa no está disponible.

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lggvu/videovap-candor | VAP turn-taking, solo vídeo | no disponible | no aplica / no disponible | unknown (desconocida) | checkpoint en HuggingFace, 0 descargas |
| VAP (Voice Activity Projection, línea de investigación original) | VAP turn-taking | no disponible | no disponible | no disponible | publicaciones y código de investigación |
| TurnGPT y variantes | Predicción de turnos basada en lenguaje | no disponible | no disponible | no disponible | publicaciones y repositorios de investigación |

Las filas de alternativas se incluyen únicamente como categorías de referencia del área; no se dispone de sus cifras concretas en la información proporcionada, por lo que no deben tomarse como datos verificados.

## Limitaciones y advertencias

- Licencia desconocida (`license: unknown`): no se puede asumir uso comercial permitido. Cualquier uso en producción exige aclarar previamente los términos con el autor.
- Modelo sin documentación: no se especifican parámetros, ventana temporal, modalidad exacta de entrada, resolución de vídeo, métricas de validación ni limitaciones conocidas.
- Riesgo de sesgo: al entrenarse desde cero sobre el corpus Candor, el modelo hereda las características demográficas, de idioma y de dominio de dicho corpus (conversaciones de un tipo concreto de interacción). No se documenta ningún análisis de sesgo.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto. El riesgo equivalente es una proyección de actividad de voz incorrecta, que en un agente conversacional puede traducirse en interrupciones prematuras o en silencios prolongados.
- Dominio limitado: al ser un modelo entrenado sobre un único corpus y sin ajuste posterior, es previsible un rendimiento degradado fuera de ese dominio; no hay datos publicados que cuantifiquen esa degradación.
- Ámbito de idioma: no declarado. No hay evidencia de soporte multilingüe.
- Ambigüedad de la descripción «video-only stereo»: la model card no aclara si «stereo» designa dos hablantes o dos canales de audio, ni cómo se concilia con la afirmación de que la entrada es solo vídeo.
- Artefacto sin mantenimiento: 0 descargas, 0 «likes» y fechas de creación y actualización separadas por tres segundos sugieren una publicación puntual sin soporte posterior.
- Para producción, se requiere validación propia: no existen métricas publicadas que permitan fijar umbrales de decisión ni comparar contra líneas base.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/lggvu/videovap-candor
- Código fuente del proyecto (`mm-turn-taking`): https://github.com/lggvu/mm-turn-taking
- Corpus Candor (enlace facilitado por el autor): https://betterup.com/research/candor-corpus
