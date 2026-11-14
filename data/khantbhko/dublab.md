# khantbhko/dublab

## Resumen

DubLab es una aplicación web autoalojada para el doblaje de vídeos cortos entre inglés y birmano (myanmar). No se distribuye como un modelo de pesos único, sino como un pipeline completo que orquesta varias piezas: transcripción con faster-whisper en local, traducción mediante la API de Gemini (con alternativa local NLLB), síntesis de voz con las voces ONNX locales Nara Mini (Shoon y Ko Banyar) y un motor de sincronización temporal que ajusta la duración del audio al vídeo. El resultado es un MP4 doblado que se devuelve al usuario.

El proyecto está desarrollado y mantenido por Khant Bhone Ko y se publica con licencia MIT. Su relevancia radica en cubrir un par lingüístico poco atendido (inglés-birmano) con un flujo totalmente autoalojable y sin coste de API obligatorio para la síntesis de voz, lo que facilita su despliegue en entornos con recursos limitados o requisitos de privacidad.

La ficha describe el sistema tal como se documenta en su model card; los datos de arquitectura interna de los modelos subyacentes (whisper, Nara Mini, NLLB) no se detallan en la información proporcionada y se indican como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de aplicacion web (Flask + Waitress) que orquesta ASR (faster-whisper), traduccion (Gemini API / NLLB local), TTS (Nara Mini ONNX, Edge-TTS, Gemini TTS) y sincronizacion temporal |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (limitado por la duracion del video: maximo 10 minutos) |
| Tipos de cuantizacion | no disponible (las voces Nara Mini se distribuyen como ONNX; no se documentan variantes de cuantizacion) |
| Idiomas soportados | Ingles (en) y birmano/myanmar (my) |
| Licencia | MIT |
| Formato de pesos | ONNX para las voces Nara Mini; el resto son dependencias de software, no pesos publicados en este repositorio |

## Arquitectura y entrenamiento

DubLab no es un modelo entrenado de novo, sino una aplicación que compone modelos existentes. La transcripción se realiza localmente con faster-whisper. La traducción se delega a la API de Gemini (funciona con el nivel gratuito) y cuenta con un mecanismo de reserva local basado en NLLB. La síntesis de voz utiliza por defecto las voces locales Nara Mini en formato ONNX (Shoon y Ko Banyar), descargadas desde el repositorio `YeeNyunn/nara-mini-v1` del Hub durante la construcción de la imagen Docker; como alternativas se ofrecen Edge-TTS y Gemini TTS.

El componente técnico diferenciador es el motor de sincronización: el habla se ajusta temporalmente hasta un límite de aceleración de 1,65×, y el desbordamiento se propaga a la siguiente ranura temporal en lugar de cortar la frase. La aplicación incluye protecciones de abuso (límite de cola de trabajos, limitación de tasa de subida por IP y retención de resultados durante 24 horas) y una marca de agua de crédito configurable en la esquina inferior derecha. No se documentan en la información disponible datos de entrenamiento, número de tokens ni procesos de RLHF/DPO para los modelos subyacentes.

## Capacidades

- Doblaje de vídeo inglés a birmano y de birmano a inglés, devolviendo un MP4 final.
- Transcripción local de audio con faster-whisper, sin dependencia de servicios externos para el ASR.
- Traducción mediante API de Gemini, con alternativa local NLLB cuando no hay clave o se prefiere procesamiento local.
- Síntesis de voz con voces birmanas masculinas y femeninas (Shoon y Ko Banyar), gratuitas y sin clave de API.
- Opciones de TTS alternativas: Edge-TTS y Gemini TTS (con rotación de claves).
- Sincronización temporal que evita cortar frases, con aceleración limitada a 1,65× y propagación de desbordamiento.
- Ingesta de vídeo por subida directa (hasta 10 minutos y 250 MB) o por enlace de plataformas como YouTube, TikTok, Instagram, Facebook, X, Vimeo y Bilibili.
- Marca de agua de crédito configurable.
- Protecciones integradas: límite de cola, limitación de tasa por IP y retención de resultados de 24 horas.
- Interfaz web autoalojada con página de administración protegida por clave para revisión.

## Casos de uso

- Doblaje de contenido educativo corto: un creador sube un vídeo en inglés de hasta 10 minutos y obtiene la versión en birmano con voces locales, sin coste de API de TTS, adecuado para canales con presupuesto limitado.
- Localización de vídeos de redes sociales: la ingesta por enlace de TikTok, Instagram o YouTube permite doblar clips virales sin descargarlos manualmente, agilizando la publicación en ambos idiomas.
- Producción de material divulgativo para comunidades birmanas: la combinación de traducción con Gemini y voces Nara Mini permite generar versiones en birmano de charlas o tutoriales manteniendo la sincronización labial aproximada mediante el motor de ajuste temporal.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse autoalojado con transcripción local y opción NLLB, el audio no tiene por qué salir de la infraestructura propia, lo que encaja en organizaciones con políticas estrictas de datos.
- Creación de prototipos de doblaje para investigación en TTS y ASR de birmano: el pipeline sirve como banco de pruebas para evaluar voces ONNX y modelos de traducción en un par lingüístico de bajos recursos.
- Gestión de comunidades y soporte multimedia: un equipo puede desplegar la aplicación con Docker, aplicar límites de tasa por IP y revisar resultados desde la página de administración, lo que facilita ofrecer doblaje como servicio interno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende de los modelos subyacentes (faster-whisper, NLLB y las voces ONNX), cuyos tamanos no se detallan.
- GPU recomendadas: no disponible; la model card no especifica requisitos de GPU.
- Compatibilidad con GPU de consumo: no confirmada; el uso de faster-whisper y voces ONNX sugiere que puede ejecutarse en CPU, pero no se documenta de forma explícita.
- Opciones de despliegue: ejecución directa con Python 3.11+, `ffmpeg` y Waitress (`waitress-serve --listen=127.0.0.1:8092 --threads=8 app:app`), o mediante Docker (`docker build -t dublab .` y `docker run` con `--env-file`).
- Dependencias críticas: `requirements.txt` fija `av==15.1.0` y `huggingface_hub<1`, ya que versiones más recientes rompen faster-whisper 1.2.x.
- Latencia y throughput: no disponibles; dependen del hardware, de la duración del vídeo (máximo 10 minutos) y del proveedor de traducción/TTS elegido.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de doblaje inglés-birmano ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El sistema está limitado a vídeos de hasta 10 minutos y 250 MB.
- Solo cubre el par de idiomas inglés-birmano; no se documenta soporte para otros idiomas.
- La calidad de la traducción depende de la API de Gemini o, en su defecto, de NLLB local; no se publican métricas de calidad de traducción.
- La sincronización se consigue acelerando el habla hasta 1,65× y propagando desbordamientos, lo que puede producir un ritmo artificial en segmentos densos.
- Requiere una clave de API de Gemini (`GEMINI_API_KEY`) para la traducción; sin ella, la alternativa local NLLB debe configurarse por separado.
- La retención de resultados es de 24 horas; los vídeos subidos no se conservan más allá de ese periodo según la documentación.
- Riesgo de alucinación y errores de transcripción inherentes a faster-whisper, especialmente en audio con ruido o acentos marcados.
- No se documentan sesgos conocidos de los modelos subyacentes; deben evaluarse por separado para cada componente.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de las dependencias (faster-whisper, NLLB, Gemini API, Edge-TTS) y las condiciones de uso de los servicios externos.
- El proyecto tiene un único mantenedor, lo que puede afectar a la cadencia de actualizaciones y al soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khantbhko/dublab
- Demo en vivo: https://dublab.kbko.qzz.io
- Repositorio del código fuente: https://github.com/khantbhoneko36-commits/dublab
- Voces Nara Mini en el Hub: https://huggingface.co/YeeNyunn/nara-mini-v1
- Clave de API de Gemini: https://aistudio.google.com/apikey
- Otros proyectos del mantenedor: https://pro.kxant.org
