# Eddycrack864/AI-Cover-Maker

## Resumen

AI-Cover-Maker es un pipeline de conversion de voz y generacion de covers musicales publicado en Hugging Face por el desarrollador Eddycrack864 bajo licencia MIT. No se trata de un modelo de lenguaje ni de un modelo fundacional entrenado desde cero, sino de un paquete de herramientas que orquesta tres componentes: separacion de fuentes con python-audio-separator (modelos UVR como Roformer, MDX23C, MDX-NET y VR Arch), conversion de voz con RVC a traves de Applio, y remezcla final del audio. El repositorio ocupa 8,8 GB y esta etiquetado con el pipeline `audio-to-audio`.

El proyecto es una reescritura de la anterior RVC AI Cover Maker UI, construida sobre UVR5 UI, y fue creado originalmente para la comunidad AI HUB en Discord. Su propuesta de valor es la automatizacion completa del flujo: el usuario introduce una cancion (archivo o enlace) y obtiene un cover con la voz objetivo, con cacheo por etapa para evitar recalcular pasos ya procesados.

Es relevante ahora porque consolida en una unica interfaz Gradio herramientas que antes requerian encadenar scripts manualmente, e incluye soporte para Colab, Windows y Linux, ademas de 19 idiomas de interfaz. No se dispone de informacion sobre arquitectura de red neuronal propia, parametros o ventana de contexto, ya que el repositorio no contiene un modelo entrenado por el autor sino dependencias y utilidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de audio: separacion de fuentes (UVR) + conversion de voz (RVC/Applio) + mezcla |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (interfaz en 19 idiomas segun la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repo contiene codigo, scripts y dependencias; los pesos RVC se cargan externamente) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red neuronal propia. Es un orquestador que encadena modelos preexistentes: los separadores UVR (Roformer, MDX23C, MDX-NET, VR Arch) para dividir voces e instrumental, y RVC mediante Applio para la conversion de timbre vocal. La conversion emplea extractores de pitch como rmvpe, fcpe, crepe y swift, con soporte de index, protect, autotune, pitch automatico, formant shifting y embedders personalizados.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF o DPO, porque el autor no entrena modelos en este repositorio. La innovacion tecnica destacable es el cacheo por etapa: cada paso (separacion, conversion, efectos, mezcla) se almacena de forma que probar otra voz o ajuste solo recalcula lo que ha cambiado. Tambien incluye cambio de tonalidad preservando el tempo, efectos vocales (high-pass, compresor, reverb) y una mezcla que evita clipping.

## Capacidades

- Separacion de fuentes de audio en voces e instrumental, con modelos UVR especializados.
- Separacion adicional de voz principal y coros, de-reverb, de-echo y denoise.
- Conversion de voz (voice-to-voice) con RVC/Applio sobre la pista vocal aislada.
- Conversion de coros con una segunda voz o conservacion de los originales.
- Cambio de tonalidad de la cancion completa manteniendo el tempo.
- Aplicacion de efectos vocales y mezcla final sin clipping.
- Cacheo por etapa para iteracion rapida sobre la misma cancion.
- Carga de modelos de voz por enlace (Hugging Face, Google Drive, enlaces directos) o subida manual.
- Descarga de canciones desde cualquier sitio soportado por yt_dlp.
- Procesamiento por lotes (batch covers).
- Interfaz Gradio con 19 idiomas, temas y guardado de ajustes.
- Soporte de Colab, Windows y Linux.

## Casos de uso

- Creacion de covers musicales personalizados: el usuario introduce una cancion y una voz RVC, y el pipeline separa, convierte y mezcla automaticamente, reduciendo un flujo de varias herramientas a una sola operacion.
- Prototipado rapido de voces para produccion musical: gracias al cacheo por etapa, un productor puede probar distintas voces o efectos sobre la misma pista sin reprocesar la separacion.
- Remezclas y stems: cada cover se guarda en su carpeta con todos los stems intermedios, lo que permite reutilizarlos en un DAW para remezclas propias.
- Investigacion en conversion de voz: util para comparar extractores de pitch (rmvpe, fcpe, crepe, swift) y ajustes de formant shifting sobre un mismo material.
- Automatizacion por lotes: el modo batch permite generar multiples covers de forma desatendida, util para catalogos o demos.
- Educacion y divulgacion: la interfaz Gradio y el cuaderno de Colab facilitan demostraciones sin instalacion local, con soporte en 19 idiomas.
- Procesado de audio general: la separacion de voces e instrumental y el de-reverb son reutilizables fuera de la creacion de covers, por ejemplo para karaokes o limpieza de grabaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, SDR, similitud de hablante) ni comparaciones cuantitativas con otras herramientas.

## Requisitos de hardware

- GPU: NVIDIA GTX serie 10 o superior con CUDA 12.8.
- VRAM estimada: no disponible de forma explicita; la model card solo indica requisitos de GPU y disco.
- Disco: aproximadamente 15 GB de espacio libre.
- CPU: funciona, pero segun el autor es "muy lento"; se recomienda usar Colab en ese caso.
- Despliegue: scripts de instalacion para Windows y Linux que crean un entorno Python 3.12 aislado en `env/`; interfaz Gradio en el puerto 7755 por defecto, con opciones `--share`, `--listen-port`, `--server-name` y `--open`.
- Colab: cuaderno oficial disponible para entornos sin GPU local.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Herramienta | Tipo | Componentes | Licencia | Interfaz | Cacheo por etapa |
|---|---|---|---|---|---|
| AI-Cover-Maker | Pipeline de covers | UVR + RVC/Applio | MIT | Gradio, Colab | Si |
| RVC AI Cover Maker UI | Pipeline de covers (predecesor) | UVR + RVC | no disponible | UI propia | no disponible |
| UVR5 UI | Interfaz de separacion | UVR5 | no disponible | UI propia | no disponible |
| python-audio-separator | Libreria de separacion | UVR | no disponible | CLI/libreria | no aplica |
| Applio | Framework RVC | RVC | no disponible | Gradio | no aplica |

No se dispone de datos de rendimiento comparativo entre estas herramientas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo fundacional: no genera texto, codigo ni razonamiento; es exclusivamente un pipeline de audio.
- Riesgo legal y etico: la clonacion de voz sin consentimiento puede infringir derechos de imagen, voz y copyright de las canciones; el usuario es responsable del uso.
- La descarga de canciones via yt_dlp puede vulnerar terminos de servicio de las plataformas segun la jurisdiccion.
- Dependencia de modelos externos (UVR, RVC, Applio) cuyas licencias no se detallan en la model card; conviene verificarlas antes de uso comercial.
- Requiere FFmpeg en el PATH (Windows) y compilador C para construir dependencias en Linux.
- El rendimiento en CPU es muy lento; sin GPU NVIDIA el uso practico se limita a Colab.
- Sin datos publicados de calidad objetiva (MOS, similitud de hablante) ni de sesgos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- Los pesos de las voces RVC no se incluyen en el repositorio; deben obtenerse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/Eddycrack864/AI-Cover-Maker
- Repositorio GitHub: https://github.com/Eddycrack864/AI-Cover-Maker
- Documentacion: https://github.com/Eddycrack864/AI-Cover-Maker/blob/main/info/docs.md
- Solucion de problemas: https://github.com/Eddycrack864/AI-Cover-Maker/blob/main/info/troubleshooting.md
- Cuaderno Colab: https://colab.research.google.com/github/Eddycrack864/AI-Cover-Maker/blob/main/AI_Cover_Maker_Colab.ipynb
- Releases: https://github.com/Eddycrack864/AI-Cover-Maker/releases
- Licencia: https://github.com/Eddycrack864/AI-Cover-Maker/blob/main/LICENSE
- Comunidad Discord: https://discord.gg/aihub
- python-audio-separator: https://github.com/nomadkaraoke/python-audio-separator
- Applio: https://github.com/IAHispano/Applio
- Predecesor RVC AI Cover Maker UI: https://github.com/Eddycrack864/RVC-AI-Cover-Maker-UI
- UVR5 UI: https://github.com/Eddycrack864/UVR5-UI
- yt_dlp: https://github.com/yt-dlp/yt-dlp
- Sitios soportados por yt_dlp: https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md
