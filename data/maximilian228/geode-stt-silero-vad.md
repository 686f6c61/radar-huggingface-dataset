# Maximilian228/Geode-STT-silero-vad

## Resumen

Geode-STT-silero-vad es un paquete de deteccion de actividad de voz (VAD, voice activity detection) empaquetado por Maximilian228 para su uso dentro de la aplicacion Android Geode, una app de reconocimiento de voz que funciona de forma local y sin conexion. El paquete no contiene un modelo entrenado desde cero, sino el fichero `silero_vad.onnx` de sherpa-onnx, que a su vez es una conversion del modelo Silero VAD original del equipo Silero. La funcion del modelo es segmentar audio y determinar que fragmentos contienen voz humana, una pieza previa imprescindible en cualquier pipeline de speech-to-text para recortar silencios y reducir coste de computo.

El repositorio se publica con licencia MIT, libreria sherpa-onnx y pipeline `voice-activity-detection`. El contenido es minimo: un unico fichero ONNX en formato fp32, sin pesos en safetensors ni variantes cuantizadas adicionales. El autor documenta una comparacion practica en un telefono Redmi en la que la version fp32 procesa un clip de 30 segundos en 0.60 segundos, frente a 0.92 segundos de la variante int8, lo que justifica la eleccion de precision completa en dispositivos moviles.

La relevancia de esta ficha es acotada: no es un modelo de lenguaje ni un sistema de reconocimiento de voz completo, sino un componente auxiliar de un stack STT on-device. Resulta util para desarrolladores que necesiten integrar VAD en aplicaciones Android o en pipelines sherpa-onnx y quieran una referencia de consumo de memoria y latencia medida en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAD neuronal (Silero VAD, red neuronal recurrente ligera; no se detalla la topologia exacta en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa ventanas de audio; no se especifica tamano de ventana) |
| Tipos de cuantizacion | fp32 (fichero incluido); se menciona una variante int8 de referencia pero no se distribuye en este repo |
| Idiomas soportados | independiente del idioma (el autor indica `*`); la deteccion de voz no esta ligada a una lengua concreta |
| Licencia | MIT |
| Formato de pesos | ONNX (`silero_vad.onnx`) |

## Arquitectura y entrenamiento

El modelo es Silero VAD, un detector de actividad de voz neuronal disenado para ser ligero y ejecutable en tiempo real sobre CPU. La informacion disponible no detalla el numero de capas, el tipo exacto de celula recurrente ni el tamano del modelo; el autor se limita a indicar que usa el fichero `silero_vad.onnx` de sherpa-onnx sin modificarlo. No se aportan datos sobre el corpus de entrenamiento, el numero de horas de audio utilizadas ni si hubo ajuste fino posterior.

La innovacion practica de este paquete no esta en el modelo, sino en su empaquetado y validacion: se distribuye en formato ONNX compatible con sherpa-onnx, se integra en una app Android offline y se documenta el coste medido en un Redmi. El autor justifica explicitamente el uso de fp32 frente a int8 por ser mas rapido en ese dispositivo (0.60 s frente a 0.92 s para un clip de 30 s), un dato contraintuitivo que conviene tener en cuenta al desplegar en movil.

## Capacidades

- Deteccion de actividad de voz: clasifica segmentos de audio como voz o no voz.
- Segmentacion de audio para pipelines STT: permite recortar silencios antes del reconocedor.
- Funcionamiento offline y on-device: no requiere red ni servicios externos.
- Independencia de idioma: el autor declara soporte `*`, sin lista de lenguas concreta.
- Integracion con sherpa-onnx: se carga como modelo de tipo `vad` dentro de ese runtime.
- Bajo consumo de memoria: aproximadamente 5 MB adicionales en el proceso del reconocedor dentro de la app.

## Casos de uso

- Reconocimiento de voz en Android sin conexion: el VAD recorta silencios antes de pasar el audio al reconocedor, reduciendo el computo y mejorando la latencia percibida en la app Geode.
- Asistentes de voz con activacion por habla: el modelo detecta cuando el usuario empieza y termina de hablar, lo que permite cerrar el turno sin pulsar botones.
- Transcripcion por lotes de grabaciones largas: segmentar un audio de horas en fragmentos con voz evita procesar silencios y acelera el pipeline STT.
- Telefonia y VoIP: deteccion de voz para supresion de ruido de fondo y para decidir cuando transmitir audio en llamadas.
- Sistemas de subtitulado en tiempo real: el VAD marca los limites de intervencion y sincroniza la generacion de subtitulos con el habla.
- Control de coste en servicios de transcripcion en servidor: descartar fragmentos sin voz antes de invocar modelos STT mas caros reduce el gasto por minuto procesado.
- Analisis de calidad de audio y datasets: filtrar automaticamente grabaciones sin habla antes de entrenar o evaluar otros modelos.

## Benchmarks y rendimiento

La model card incluye una tabla de error FLEURS con cabecera pero sin filas de datos, por lo que no hay resultados de precision publicados. Los unicos datos medidos son de rendimiento en un telefono Redmi:

| Metrica | Valor |
|---|---|
| Tiempo de proceso de un clip de 30 s (fp32) | 0.60 s |
| Tiempo de proceso de un clip de 30 s (int8, referencia) | 0.92 s |
| Pico de memoria del CLI sherpa-onnx-vad completo (VmHWM) | 62 MB |
| Memoria anadida al proceso del reconocedor en la app | ~5 MB |

No se han publicado resultados de benchmarks de precision (FLEURS ni otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para CPU en dispositivos moviles.
- Memoria: el CLI completo con runtime pico en 62 MB; dentro de la app anade unos 5 MB al proceso del reconocedor.
- GPU recomendadas: no disponibles; no se documenta uso de GPU.
- Cabe en cualquier telefono Android moderno; el autor lo valida en un Redmi.
- Despliegue: runtime sherpa-onnx (CLI `sherpa-onnx-vad` o integracion en la app); al ser ONNX podria cargarse con ONNX Runtime en otros entornos, aunque no se documenta.
- Latencia: 0.60 s para 30 s de audio en el Redmi citado (RTF aproximado de 0.02 en ese hardware).

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Formato | Contexto/uso | Disponibilidad |
|---|---|---|---|---|---|
| Geode-STT-silero-vad (este repo) | VAD (Silero VAD empaquetado) | MIT | ONNX | Segmentacion de voz on-device | Hugging Face, 0 descargas |
| snakers4/silero-vad (origen) | VAD | MIT | PyTorch/ONNX | Segmentacion de voz, referencia upstream | Hugging Face, ampliamente usado |
| WebRTC VAD | VAD clasico | BSD | Codigo C | Deteccion de voz basada en reglas | Integrado en Chromium/WebRTC |

La comparativa se limita al ambito VAD porque el repositorio no contiene un modelo de lenguaje. No se dispone de datos de precision comparables entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de reconocimiento de voz ni de lenguaje: solo detecta actividad de voz; no transcribe ni genera texto.
- Repositorio practicamente vacio en cuanto a documentacion: la tabla FLEURS esta sin rellenar y no hay resultados de precision.
- Sin datos de sesgo ni de robustez frente a ruido, acentos o audio de baja calidad.
- El rendimiento medido corresponde a un unico dispositivo (Redmi) y a un unico clip; no es extrapolable a otros telefonos.
- La licencia MIT permite uso comercial, pero el autor remite a la licencia del proyecto original Silero VAD; conviene verificar la atribucion en despliegues derivados.
- Sin descargas ni likes: no hay evidencia de uso en produccion por terceros.
- No se documenta el tamano de ventana ni el umbral de decision, parametros criticos para ajustar falsos positivos y falsos negativos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Maximilian228/Geode-STT-silero-vad
- Modelo original Silero VAD: https://huggingface.co/snakers4/silero-vad
- Repositorio GitHub de Silero VAD: https://github.com/snakers4/silero-vad
