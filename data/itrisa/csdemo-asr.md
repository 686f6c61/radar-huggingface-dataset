# itrisa/csdemo-asr

## Resumen

csdemo-asr es una colección de dos modelos de reconocimiento automático del habla (ASR) ajustados específicamente para el audio de voz del videojuego Counter-Strike 2 (CS2), dentro del ecosistema del proyecto csdemo-client. El autor, itrisa, publica los pesos en formato ONNX cuantizado, con un tamaño total de repositorio de 0,3 GB, lo que los hace aptos para inferencia en local sin infraestructura pesada. El modelo principal, `gigaam-cs2`, se basa en GigaAM-v3 con cabecera CTC y está ajustado sobre aproximadamente 29,5 horas de voz en ruso y 6,8 horas en inglés extraídas de partidas de CS2. El segundo, `moonshine-cs2`, parte de Moonshine base y se ha ajustado sobre unas 6,9 horas de voz en inglés.

El problema que resuelve es concreto: el audio de voz de CS2 es ruidoso, con solapamiento de hablantes, jerga propia del juego y una mezcla de ruso e inglés en una misma partida. Los modelos ASR generalistas rinden mal en este dominio, y estos ajustes buscan mejorar la transcripción para herramientas de análisis de demos (extracción de comunicaciones de equipo, generación de transcripciones alineadas con eventos del juego). El resultado publicado es un WER de 0,34 en ruso y 0,38 en inglés usando enrutado por línea de guion (GigaAM para líneas en cirílico, Moonshine para líneas en alfabeto latino).

La relevancia es acotada pero clara para nichos de análisis de esports y herramientas de revisión de demos: es un modelo pequeño, con licencia MIT y pesos ONNX listos para ejecución en navegador o en local, lo que facilita integrarlo en clientes de escritorio o web sin depender de APIs de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GigaAM-v3 con cabecera CTC (modelo principal); Moonshine base (modelo secundario) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX) para GigaAM; q8 (ONNX, layout transformers.js) para Moonshine |
| Idiomas soportados | ruso (ru) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | ONNX cuantizado (int8 / q8) |

## Arquitectura y entrenamiento

El modelo principal `gigaam-cs2` parte de GigaAM-v3, un modelo ASR con cabecera CTC, y se ha ajustado con aproximadamente 29,5 horas de audio en ruso y 6,8 horas en inglés procedentes de chat de voz de CS2. El vocabulario se extendió con letras latinas para poder transcribir líneas en inglés dentro del mismo modelo, aunque el enrutado publicado usa GigaAM para líneas en cirílico y Moonshine para líneas en alfabeto latino. El segundo modelo, `moonshine-cs2`, se basa en Moonshine base y se ajustó con unas 6,9 horas de audio en inglés de CS2, empaquetado en ONNX q8 con el layout de transformers.js.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se especifican innovaciones arquitectónicas propias más allá del ajuste fino y la extensión de vocabulario. El WER de test publicado (0,34 en ruso, 0,38 en inglés) se mide contra etiquetas de un modelo profesor, no contra transcripciones humanas, lo que conviene tener en cuenta al interpretar las cifras.

## Capacidades

- Reconocimiento automático del habla en ruso e inglés sobre audio de chat de voz de CS2.
- Transcripción de audio ruidoso con solapamiento de hablantes y jerga propia del juego.
- Enrutado por línea de guion: GigaAM para líneas en cirílico, Moonshine para líneas en alfabeto latino.
- Inferencia en local mediante ONNX, incluido el layout de transformers.js para ejecución en navegador.
- Modelos pequeños (0,3 GB de repositorio total) aptos para entornos con recursos limitados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Análisis de demos de CS2: transcribir las comunicaciones de voz de una partida para alinearlas con eventos del juego (rondas, kills, bombas) y facilitar la revisión táctica del equipo.
- Herramientas de coaching de esports: generar transcripciones de las llamadas de equipo para revisar la comunicación y detectar problemas de coordinación.
- Clientes de demo en navegador: al estar en ONNX con layout transformers.js, el modelo Moonshine puede ejecutarse en el navegador para transcribir voz en inglés sin enviar audio a un servidor.
- Moderación y búsqueda de contenido: indexar el chat de voz de partidas grabadas para permitir búsquedas por texto sobre lo que se dijo en cada momento.
- Investigación en ASR de dominio específico: servir como punto de partida o referencia para ajustes finos en audio de videojuegos con mezcla de idiomas.
- Pipelines de análisis por lotes: procesar demos archivadas en local con ONNX Runtime, sin depender de APIs externas ni de conexión a internet.
- Extracción de datos para estadísticas de comunicación: cuantificar frecuencia de llamadas, idioma dominante por equipo o por ronda a partir de las transcripciones.

## Benchmarks y rendimiento

| Modelo / configuración | Idioma | WER (vs etiquetas de profesor) |
|---|---|---|
| GigaAM-cs2 + Moonshine-cs2 con enrutado por línea | RU | 0,34 |
| GigaAM-cs2 + Moonshine-cs2 con enrutado por línea | EN | 0,38 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos ASR de referencia. Las cifras de WER proceden de la model card y se miden contra etiquetas generadas por un modelo profesor, no contra transcripciones humanas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,3 GB, por lo que la huella en memoria es reducida.
- GPU recomendadas: no especificadas por el autor; al ser modelos ONNX cuantizados de pequeño tamaño, cualquier GPU consumer moderna debería poder ejecutarlos.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con unos pocos GB de VRAM; no se detalla el mínimo exacto.
- Opciones de despliegue: ONNX Runtime (formato nativo), transformers.js (layout de Moonshine) y, en general, cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| csdemo-asr (GigaAM-cs2 + Moonshine-cs2) | no disponible | no disponible | ru, en | MIT | ONNX int8/q8 | Ajustado a voz de CS2; WER 0,34 RU / 0,38 EN vs profesor |
| GigaAM-v3 (modelo base) | no disponible | no disponible | ru (principalmente) | no disponible en esta ficha | no disponible | Base del modelo principal; rendimiento en dominio CS2 no disponible |
| Moonshine base (modelo base) | no disponible | no disponible | en | no disponible en esta ficha | no disponible | Base del modelo secundario; rendimiento en dominio CS2 no disponible |
| Whisper (variantes pequeñas) | no disponible en esta ficha | no disponible | multilingüe | no disponible en esta ficha | no disponible | Alternativa ASR generalista; sin datos comparativos en dominio CS2 |

No se dispone de datos comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El WER publicado se mide contra etiquetas de un modelo profesor, no contra transcripciones humanas, por lo que puede no reflejar el rendimiento real frente a anotación manual.
- El modelo está ajustado específicamente al audio de voz de CS2; su rendimiento fuera de ese dominio (reuniones, llamadas, otros juegos) no está documentado y probablemente sea peor.
- Solo cubre ruso e inglés; no hay soporte documentado para otros idiomas.
- El enrutado por línea de guion (GigaAM para cirílico, Moonshine para latino) implica una lógica externa de selección de modelo; no es un único modelo que gestione la mezcla de idiomas de forma nativa.
- No se documentan sesgos conocidos, pero al entrenarse con chat de voz de partidas puede heredar sesgos de género, acento o registro del dataset.
- Riesgo de alucinación en ASR: posible generación de texto plausible en segmentos con ruido extremo o silencio.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las licencias de los modelos base (GigaAM-v3 y Moonshine) antes de redistribuir pesos derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itrisa/csdemo-asr
