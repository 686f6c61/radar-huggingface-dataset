# akm9191/silero-vad-onnx

## Resumen

Silero VAD (ONNX, sherpa-onnx) es un detector de actividad de voz (VAD) empaquetado en formato ONNX y distribuido a través de la librería sherpa-onnx. No se trata de un modelo de lenguaje generativo, sino de un componente de preprocesado de audio cuyo propósito es identificar segmentos de habla frente a silencio o ruido en un flujo de audio. El repositorio `akm9191/silero-vad-onnx` es una copia sin modificaciones del fichero `silero_vad.onnx` publicado en la release `asr-models` del proyecto sherpa-onnx, y se usa en la aplicación Android Daily Whisper para segmentar habla en frases antes de la transcripción en dispositivo.

El modelo original procede del equipo Silero y se distribuye bajo licencia MIT. El fichero pesa 643.854 bytes (aproximadamente 629 KB) y su hash SHA-256 está documentado en la model card, lo que permite verificar la integridad de la copia. Al ser un VAD y no un modelo de lenguaje, no dispone de parámetros en el sentido habitual de un transformer generativo, ni de ventana de contexto textual, ni de capacidades multilingües declaradas.

Su relevancia práctica radica en que permite implementar detección de voz ligera y determinista en entornos con recursos limitados (móvil, edge, embedded) sin depender de frameworks pesados. Es un componente habitual en pipelines de ASR, diarización y asistentes de voz que necesitan recortar audio antes de pasarlo a un modelo de reconocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para detección de actividad de voz (VAD), exportada a ONNX; arquitectura interna no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye un único fichero ONNX) |
| Idiomas soportados | no disponible (el VAD es independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (`silero_vad.onnx`, 643.854 bytes) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del detector más allá de que se trata de un modelo de detección de actividad de voz exportado a ONNX y consumido mediante la librería sherpa-onnx. El repositorio no incluye datos sobre el conjunto de entrenamiento, el número de tokens o muestras de audio procesadas, ni sobre técnicas de ajuste como RLHF o DPO, que en cualquier caso no aplicarían a un VAD.

El artefacto distribuido es una copia literal del fichero `silero_vad.onnx` incluido en la release `asr-models` de sherpa-onnx. El autor documenta el tamaño exacto y el hash SHA-256 (`9e2449e1087496d8d4caba907f23e0bd3f78d91fa552479bb9c23ac09cbb1fd6`), lo que facilita la verificación de que la copia no ha sido alterada. Cualquier innovación técnica (tipo de capas, ventana de análisis, tasa de muestreo soportada) debe consultarse en el repositorio original de Silero VAD, no en esta copia.

## Capacidades

- Detección de actividad de voz: clasifica segmentos de audio como habla o no habla.
- Segmentación de audio en frases: pensado para trocear flujos de audio antes de pasarlos a un motor de ASR.
- Ejecución en dispositivo: al ser un fichero ONNX de ~629 KB, está orientado a inferencia local en Android y otros entornos con recursos limitados.
- Integración con sherpa-onnx: se carga mediante la librería `sherpa-onnx`, que actúa como runtime.
- Independencia del idioma: al ser un VAD acústico, no depende del idioma del habla (aunque no se documenta explícitamente en la información disponible).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking: no es un modelo de lenguaje.

## Casos de uso

- Segmentación previa a ASR en aplicaciones móviles: Daily Whisper lo usa para cortar el audio en frases antes de la transcripción en dispositivo, reduciendo el coste computacional al evitar procesar silencio.
- Detección de turnos en asistentes de voz: permite activar la captura solo cuando hay habla, ahorrando batería y ancho de banda en dispositivos móviles.
- Filtrado de silencio en pipelines de transcripción por lotes: se puede insertar antes de un motor ASR para eliminar tramos sin voz y acelerar el procesado.
- Diarización y análisis de llamadas: sirve como etapa de preprocesado para localizar regiones con habla antes de aplicar modelos de identificación de hablantes.
- Sistemas de voz embebidos o edge: al ser un ONNX pequeño, encaja en dispositivos con poca memoria y sin GPU dedicada.
- Preprocesado en herramientas de reuniones o notas de voz: detección de actividad para recortar grabaciones y generar resúmenes solo de los tramos hablados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el fichero ONNX pesa ~629 KB y está pensado para CPU y entornos móviles.
- GPU recomendadas: no aplica; no requiere GPU para su uso previsto.
- ¿Cabe en consumer GPU? Sí, pero su despliegue típico es en CPU o en dispositivo (Android).
- Opciones de despliegue: sherpa-onnx (runtime documentado en la model card); al ser ONNX, también podría ejecutarse con runtimes compatibles con ONNX, aunque la información disponible solo menciona sherpa-onnx.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Tamaño | Notas |
|---|---|---|---|---|---|
| akm9191/silero-vad-onnx | VAD | ONNX | MIT | ~629 KB | Copia de Silero VAD para sherpa-onnx |
| Silero VAD (original, snakers4/silero-vad) | VAD | PyTorch / ONNX | MIT | no disponible en la información | Repositorio de referencia del modelo |
| WebRTC VAD | VAD | C/C++ | BSD (según proyecto WebRTC) | no disponible | VAD clásico basado en energía; no es un modelo neuronal |
| otros VAD neuronales | VAD | variable | variable | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas ni soporta tool calling; cualquier expectativa en ese sentido es incorrecta.
- Duplicado sin modificaciones: el valor del repositorio es principalmente la disponibilidad del artefacto para sherpa-onnx; para documentación, mantenimiento y mejoras debe referenciarse el proyecto original de Silero VAD.
- Sin datos de rendimiento: la model card no incluye métricas de precisión, latencia ni tasas de falsos positivos/negativos.
- Idiomas no declarados: aunque un VAD acústico suele ser independiente del idioma, no se documenta explícitamente en la información disponible.
- Riesgo de sesgo acústico: al no documentarse el conjunto de entrenamiento, no se puede evaluar su comportamiento en condiciones de ruido, acentos o canales de audio distintos a los del entrenamiento original.
- Licencia MIT: permite uso comercial, pero conviene conservar el aviso de copyright y la atribución al equipo Silero y a sherpa-onnx.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación independiente de esta copia concreta.
- Fecha de creación futura (2026-10-29): conviene verificar la procedencia y el hash del fichero antes de integrarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/akm9191/silero-vad-onnx
- Silero VAD (original): https://github.com/snakers4/silero-vad
- Release de sherpa-onnx con los modelos ASR: https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
