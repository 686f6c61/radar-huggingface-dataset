# shuko-tuto/govorilka-models

## Resumen

`shuko-tuto/govorilka-models` es un repositorio de Hugging Face que distribuye los modelos de inferencia para el complemento (addon) de Godot llamado `govorilka`, desarrollado por el usuario `shuko-tuto`. El repositorio no contiene un modelo único, sino un conjunto de modelos convertidos al formato ncnn, optimizados para su ejecución en dispositivos con recursos limitados, típicamente móviles o de escritorio, a través del motor de juegos Godot. Su propósito principal es dotar a proyectos Godot de capacidades de reconocimiento de voz (speech-to-text) y detección de actividad de voz (voice activity detection, VAD).

El repositorio incluye tres componentes principales: una versión del detector de actividad de voz Silero VAD v6.2 a 16 kHz, y dos versiones del modelo de reconocimiento de voz Whisper de OpenAI (`tiny` y `base`), todas ellas convertidas a gráficos ncnn. La relevancia de este proyecto radica en que facilita la integración de IA conversacional en aplicaciones y juegos desarrollados con Godot, un motor de código abierto, eliminando la necesidad de servicios en la nube y permitiendo el procesamiento local de audio. El repositorio se actualizó por última vez en septiembre de 2026 y tiene un tamaño de 0.2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Whisper) y red recurrente (Silero VAD), ambas convertidas a gráficos ncnn |
| Parametros totales | No disponible (los pesos originales son Whisper tiny y base, y Silero VAD v6.2) |
| Parametros activos | No disponible |
| Longitud de contexto | Ventana de 30 segundos para Whisper; 512 muestras (32 ms) por ventana para Silero VAD |
| Tipos de cuantizacion | No especificado (formato ncnn, posiblemente FP32 o FP16) |
| Idiomas soportados | Whisper tiny y base son multilingues (99 idiomas); Silero VAD es independiente del idioma |
| Licencia | MIT (tanto para los pesos de Whisper como para los de Silero VAD, con archivos de licencia incluidos) |
| Formato de pesos | ncnn (archivos `.param` y `.bin`) |

## Arquitectura y entrenamiento

El repositorio no contiene modelos entrenados desde cero, sino conversiones de pesos publicados previamente. Los modelos Whisper (`tiny` y `base`) son arquitecturas Transformer encoder-decoder desarrolladas por OpenAI, entrenadas sobre 680 000 horas de audio multilingue y multitarea. En este repositorio, cada modelo se ha dividido en seis gráficos ncnn separados: banco de filtros (fbank), encoder, embedding de tokens, embedding de posiciones, decoder con cachés de atención, y proyección de salida. La conversión se realizó mediante el script `tools/export_whisper_ncnn.py` del repositorio del addon, que carga los checkpoints publicados con la librería `transformers` y los convierte con la herramienta pnnx. El vocabulario de 50 257 tokens se extrae del tokenizador original.

El modelo Silero VAD v6.2 es una red neuronal recurrente ligera diseñada para detectar presencia de voz en audio. En este repositorio se proporciona como un único gráfico ncnn que procesa ventanas de 512 muestras a 16 kHz y produce una probabilidad de voz por ventana, manteniendo el estado recurrente entre ventanas. La conversión se realizó con el script `tools/convert_silero_vad.py` a partir del ONNX incluido en la rueda PyPI `silero-vad` 6.2.1, y se verificó que el comportamiento coincide con el original con un error máximo de 3.6e-7. Los gráficos se generan mediante scripts propios del addon para garantizar que se distribuyen bajo los términos de las licencias de los pesos originales.

## Capacidades

- Reconocimiento de voz automatico (ASR) multilingue mediante los modelos Whisper tiny y base, capaces de transcribir audio a texto en hasta 99 idiomas.
- Deteccion de actividad de voz (VAD) en tiempo real mediante Silero VAD, que identifica segmentos de habla en audio continuo.
- Ejecucion local y sin conexion, ya que los modelos se distribuyen en formato ncnn, optimizado para inferencia en dispositivos con recursos limitados.
- Integracion nativa con el motor de juegos Godot a traves del addon `govorilka`, que gestiona la carga de los modelos y la inferencia.
- Procesamiento de audio a 16 kHz, frecuencia de muestreo estandar para tareas de voz.
- Soporte de estado recurrente en el VAD, lo que permite un seguimiento preciso de la actividad de voz en flujos de audio continuos.
- El decoder de Whisper incluye cachés de atención, lo que permite una generacion de texto mas eficiente durante la decodificacion autoregresiva.

## Casos de uso

- Control por voz en videojuegos Godot: un jugador puede dar ordenes como "abre la puerta" o "ataca" y el modelo Whisper transcribe la orden para que el motor la procese. El VAD se usa para detectar cuando el jugador empieza y deja de hablar, optimizando el uso de recursos.
- Accesibilidad en aplicaciones Godot: usuarios con movilidad reducida pueden interactuar con la interfaz mediante comandos de voz. La transcripcion local garantiza privacidad y baja latencia.
- Subtitulacion automatica en tiempo real: el modelo puede transcribir dialogos en una escena de juego o aplicacion educativa, generando subtitulos al vuelo. Whisper base ofrece un equilibrio razonable entre precision y velocidad para este fin.
- Asistentes conversacionales integrados en Godot: combinando Whisper para transcribir la pregunta del usuario y un modelo de texto para generar la respuesta, se puede crear un asistente completamente local dentro de la aplicacion.
- Moderacion de voz en juegos multijugador: el VAD puede detectar si hay voz en un canal de comunicacion y Whisper puede transcribirla para aplicar politicas de moderacion automatica, todo sin enviar audio a servidores externos.
- Herramientas de dictado en aplicaciones de escritorio Godot: el usuario puede dictar texto que se inserta automaticamente en campos de formulario o editores de texto, con la ventaja de que el procesamiento es local y no depende de una conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye comparaciones cuantitativas de rendimiento, precision o velocidad de inferencia para los modelos convertidos. Se desconoce si los graficos ncnn mantienen exactamente la misma precision que los pesos originales de Whisper y Silero VAD, aunque la verificacion del VAD reporta un error maximo de 3.6e-7 respecto al modelo original.

## Requisitos de hardware

- Los modelos son ligeros por diseño: Whisper tiny tiene aproximadamente 39 millones de parametros y Whisper base unos 74 millones, por lo que caben en la mayoria de GPUs consumer y incluso en CPU.
- VRAM estimada: menos de 1 GB para Whisper base en FP32; significativamente menos en FP16 o con cuantizacion. Silero VAD requiere menos de 100 MB.
- GPUs recomendadas: cualquier GPU con soporte Vulkan (para ncnn) o incluso CPU, dado el tamano reducido de los modelos.
- Compatible con tarjetas integradas (iGPU) y GPUs dedicadas de gama baja, asi como con dispositivos moviles con GPU compatible con Vulkan.
- Opciones de despliegue: el formato ncnn esta pensado para dispositivos moviles y de escritorio. El addon `govorilka` es el unico entorno de ejecucion documentado.
- No se dispone de datos de latencia o throughput para los modelos en este formato.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso en Godot |
|---|---|---|---|---|---|
| `shuko-tuto/govorilka-models` (Whisper tiny/base) | 39M / 74M | 30 s | ncnn | MIT | Nativo via addon |
| `openai/whisper-tiny` | 39M | 30 s | PyTorch / ONNX | MIT | Requiere conversion |
| `openai/whisper-base` | 74M | 30 s | PyTorch / ONNX | MIT | Requiere conversion |
| `silero-vad` (PyPI) | ~2M | 32 ms por ventana | ONNX | MIT | Requiere conversion |

La diferencia principal entre este repositorio y los modelos originales es el formato: `ncnn` frente a PyTorch u ONNX. El formato ncnn esta optimizado para inferencia en dispositivos con recursos limitados y se integra directamente con Godot a traves del addon, mientras que los pesos originales requieren conversion y un entorno de ejecucion adicional. No se dispone de comparativas de rendimiento entre ambos formatos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye los modelos originales, sino conversiones a ncnn. Cualquier diferencia de comportamiento entre los graficos ncnn y los pesos originales no esta documentada, salvo la verificacion del VAD.
- Whisper tiny y base son los modelos mas pequenos de la familia Whisper y, por tanto, los menos precisos. Para tareas de transcripcion complejas o con ruido de fondo, pueden cometer mas errores que modelos mayores como `small` o `medium`.
- El VAD esta entrenado para audio a 16 kHz y puede no funcionar correctamente con otras frecuencias de muestreo sin resampling previo.
- No se especifican los idiomas exactos soportados por Whisper en esta conversion, aunque los pesos originales son multilingues.
- El uso comercial esta permitido por la licencia MIT, pero es responsabilidad del usuario revisar los archivos de licencia incluidos en cada carpeta para asegurar el cumplimiento.
- No se proporciona informacion sobre el rendimiento en dispositivos de bajas prestaciones, como telefonos de gama baja o consolas portatiles.
- El repositorio no incluye documentacion sobre como entrenar o ajustar estos modelos; es exclusivamente para inferencia.
- La fecha de creacion del repositorio (2026-09-03) es futura respecto a la fecha actual, lo que sugiere que puede tratarse de un proyecto reciente o experimental.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shuko-tuto/govorilka-models
- Repositorio del addon govorilka (GitHub): https://github.com/shuko-tuto/govorilka
- Perfil del autor en Hugging Face: https://huggingface.co/shuko-tuto
- Modelo original Whisper tiny: https://huggingface.co/openai/whisper-tiny
- Modelo original Whisper base: https://huggingface.co/openai/whisper-base
- Pagina del proyecto Silero VAD: https://github.com/snakers4/silero-vad
