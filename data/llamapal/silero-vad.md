# LlamaPal/silero-vad

## Resumen

Silero VAD es un detector de actividad de voz (voice activity detection, VAD) ligero distribuido en formato ONNX. Este repositorio concreto, alojado por LlamaPal, es un espejo sin modificaciones del fichero `silero_vad.onnx` publicado por el equipo de Silero, con el mismo hash SHA-256, pensado para su uso en Android y en despliegues on-device a través de sherpa-onnx. El modelo original lo desarrolla el Silero Team y se distribuye bajo licencia MIT.

El problema que resuelve es identificar de forma fiable los segmentos de audio que contienen habla frente a silencio o ruido, algo imprescindible en pipelines de reconocimiento de voz, asistentes conversacionales y aplicaciones de dictado. Su relevancia radica en que ocupa apenas 644 KB, funciona completamente offline y puede ejecutarse en dispositivos móviles sin aceleración dedicada, lo que lo convierte en una pieza habitual en aplicaciones de IA local.

No se dispone de información sobre arquitectura interna, número de parámetros, ventana de contexto en tokens ni idiomas soportados en la información proporcionada; la model card se limita a documentar el fichero, su hash y su procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye un unico fichero ONNX) |
| Idiomas soportados | no disponible (la deteccion de voz es independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (`silero_vad.onnx`, 644 KB) |

## Arquitectura y entrenamiento

No se ha publicado en la información disponible ningún detalle sobre la arquitectura interna del modelo (tipo de red, capas, función de pérdida), el volumen de datos de entrenamiento ni si se aplicaron técnicas de ajuste como RLHF o DPO. La model card únicamente indica que el fichero es una copia sin modificar del `silero_vad.onnx` distribuido en los releases de sherpa-onnx, con hash SHA-256 `9e2449e1087496d8d4caba907f23e0bd3f78d91fa552479bb9c23ac09cbb1fd6`.

La innovación técnica destacable, según la información disponible, es su empaquetado en ONNX y su integración con sherpa-onnx para ejecución on-device en Android, lo que permite inferencia local sin conexión a internet.

## Capacidades

- Detección de actividad de voz: identifica cuándo una persona empieza y deja de hablar en una señal de audio.
- Ejecución on-device: el fichero ONNX está pensado para correr en el propio dispositivo móvil.
- Funcionamiento offline: no requiere conexión a internet ni cuenta de usuario.
- Integración con sherpa-onnx: compatible con el ecosistema sherpa-onnx para pipelines de ASR y voz.
- Uso en aplicaciones Android: etiquetado explícitamente para Android y mobile en el repositorio.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión, audio generativo u otras capacidades.

## Casos de uso

- Reconocimiento de voz en tiempo real en Android: el detector segmenta el audio y marca los límites de cada intervención antes de pasarla al motor ASR, reduciendo el procesamiento de silencios y el consumo energético.
- Asistentes conversacionales offline: en una app de chat por voz local, el VAD determina cuándo el usuario ha terminado de hablar para disparar la transcripción y la respuesta del modelo de lenguaje, sin enviar audio a servidores.
- Dictado por voz en aplicaciones móviles: permite iniciar y detener la captura automáticamente al detectar habla, mejorando la experiencia en entornos con ruido intermitente.
- Ahorro de batería en dispositivos móviles: al ejecutarse sobre un fichero de 644 KB y descartar segmentos sin voz, evita mantener activos módulos de ASR o de inferencia más costosos.
- Filtrado de audio en pipelines de transcripción por lotes: descarta tramos sin habla de grabaciones largas antes de enviarlas a un modelo ASR, reduciendo coste computacional.
- Privacidad por diseño en aplicaciones sensibles: al funcionar sin internet y sin cuenta, encaja en escenarios donde el audio no puede salir del dispositivo, como notas de voz médicas o personales.
- Integración en proyectos basados en sherpa-onnx: sirve como componente estándar de detección de voz en aplicaciones que ya usan esa librería para ASR o TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un fichero ONNX de 644 KB, la huella de memoria es mínima y apta para ejecución en CPU.
- GPU recomendadas: no aplica; el caso de uso declarado es on-device en Android, sin GPU dedicada.
- Cabe en GPU consumer: sí, con holgura, aunque no es su escenario objetivo.
- Opciones de despliegue: ONNX Runtime y sherpa-onnx; el repositorio está etiquetado para sherpa-onnx y Android.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- Este repositorio es un espejo: no aporta mejoras, ajustes ni documentación técnica adicional respecto al fichero original de Silero.
- No se documentan sesgos conocidos, tasas de error ni comportamiento en distintos idiomas o acentos.
- Riesgo de falsos positivos y negativos en entornos con ruido de fondo: no se dispone de métricas publicadas en esta ficha para cuantificarlo.
- No se especifican los parámetros de inferencia recomendados (tamaño de ventana, umbral de decisión), por lo que habrá que consultar la documentación original de Silero.
- La licencia MIT permite uso comercial, pero conviene verificar la procedencia y el mantenimiento del espejo, ya que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- El tamaño del repositorio figura como 0.0 GB, coherente con un único fichero de 644 KB; no hay garantía de actualizaciones futuras por parte del mirror.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LlamaPal/silero-vad
- Fichero original en releases de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/silero_vad.onnx
- Repositorio original de Silero VAD: https://github.com/snakers4/silero-vad
- Aplicación LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
