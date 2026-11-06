# brushpenbob/protoart-press

## Resumen

ProtoArt Press no es un modelo de inteligencia artificial, sino una aplicacion de escritorio nativa para macOS centrada en la compresion de archivos multimedia. Desarrollada por el usuario brushpenbob bajo el paraguas del proyecto theprotoart, se distribuye como un binario `.dmg` de 130 MB y su codigo fuente esta publicado en GitHub con licencia Apache-2.0. El repositorio de Hugging Face actua unicamente como punto de distribucion del instalador, con un tamano total de 0,1 GB.

La aplicacion resuelve un problema concreto de flujo de trabajo: reducir el peso de imagenes, PDF, video y audio sin sacrificar calidad de forma perceptible, y sin enviar datos a servicios en la nube. Todo el procesamiento ocurre en local, lo que la hace adecuada para entornos con requisitos de privacidad o para usuarios que trabajan con archivos sensibles. Requiere macOS 13 o superior y un chip Apple Silicon (M1 o posterior).

Es relevante ahora porque cubre una necesidad recurrente en estudios de diseno, documentacion tecnica y archivos personales: preparar material para envio por correo, publicacion web o almacenamiento a largo plazo. Su enfoque es pragmatico y basado en umbrales de calidad medibles (SSIM para imagenes, calidad constante para video), no en heuristica opaca. No incluye ningun componente de aprendizaje automatico ni pesos neuronales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion nativa macOS (no es un modelo de IA) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponibles (la interfaz no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | no aplica; se distribuye como `.dmg` (instalador macOS) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. ProtoArt Press es una aplicacion de escritorio que envuelve codecs y herramientas del sistema macOS para realizar compresion multimedia. Para imagenes JPG y PNG emplea busqueda del nivel de calidad JPEG mas bajo que respete un presupuesto de dano por foto medido con SSIM, y reempaqueta los PNG de forma sin perdida. Para PDF recompone unicamente las imagenes incrustadas, escalandolas al tamano con el que se muestran en la pagina, mientras que el texto, las fuentes y el arte vectorial se copian sin modificar. Para video utiliza los codificadores por hardware de Apple (HEVC o H.264) en modo de calidad constante, con opcion de reescalado. Para audio emplea AAC o Apple Lossless.

No hay datos de entrenamiento, dataset, RLHF ni innovaciones en el sentido de modelos generativos. La unica "innovacion" tecnica destacable es el uso de un presupuesto de dano perceptible (SSIM) por imagen para decidir dinamicamente la calidad de compresion, en lugar de aplicar un valor fijo. La aplicacion no realiza conexiones de red, segun declara el autor.

## Capacidades

- Compresion de imagenes JPG y PNG con control de calidad basado en SSIM y reempaquetado sin perdida de PNG.
- Compresion de PDF reoptimizando solo las imagenes, preservando texto, fuentes y vectores.
- Compresion de video MP4, MOV y M4V mediante HEVC o H.264 por hardware de Apple, con calidad constante y reescalado opcional.
- Compresion de audio en WAV, AIFF, FLAC, MP3, M4A y CAF a AAC o Apple Lossless.
- Opciones de flujo: umbral minimo de ahorro, carpeta `Pressed` de salida o reemplazo en el sitio (originales a la Papelera).
- Control de metadatos en los archivos de salida.
- Procesamiento 100 % local, sin subida de datos ni conexiones de red.
- No incluye tool calling, agentes, razonamiento multi-paso, vision, audio generativo ni capacidades multilingues propias de un LLM.

## Casos de uso

- Preparacion de imagenes para publicacion web: el modo de presupuesto SSIM permite reducir el peso de fotos JPG manteniendo una calidad visual aceptable, util para blogs y tiendas online que necesitan cumplir umbrales de rendimiento.
- Envio de documentacion por correo electronico: la recompresion selectiva de imagenes dentro de PDF reduce el tamano de manuales y propuestas sin degradar el texto ni los graficos vectoriales, lo que facilita adjuntos por debajo de los limites habituales de los gestores de correo.
- Archivo personal de video familiar: la codificacion HEVC por hardware de Apple permite recomprimir grabaciones MP4/MOV con calidad constante y reescalado opcional, reduciendo el espacio en disco sin perdida perceptible evidente.
- Produccion de podcast y audio: la conversion de WAV/AIFF/FLAC a AAC o Apple Lossless con control de metadatos simplifica la preparacion de entregables para distribucion.
- Flujos con requisitos de privacidad: al no realizar conexiones de red y procesar todo en local, es adecuada para equipos que manejan material confidencial y no pueden subirlo a servicios de compresion en la nube.
- Limpieza de bibliotecas multimedia en un Mac: el reemplazo en el sitio con envio de originales a la Papelera permite reducir el peso de carpetas enteras de forma controlada y reversible a corto plazo.
- Preparacion de assets para maquetacion: el reempaquetado sin perdida de PNG y la recompresion de PDF con imagenes ajustadas al tamano de visualizacion encajan en pipelines de diseno editorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: macOS 13 o superior.
- CPU: Apple Silicon, M1 o posterior (no se menciona soporte para Intel).
- VRAM: no aplica; la compresion de video usa los codificadores por hardware de Apple.
- GPU recomendadas: no aplica en el sentido de modelos de IA; se beneficia de los motores multimedia integrados en los chips de la serie M.
- Cabe en cualquier Mac con Apple Silicon; no requiere GPU dedicada.
- Despliegue: instalacion mediante el `.dmg` `ProtoArt-Press-2.1.0.dmg` (130 MB), arrastrando la app a la carpeta Aplicaciones.
- Latencia y throughput: no disponibles.
- Nota: la aplicacion no esta notarizada; en el primer arranque hay que hacer clic derecho y elegir Abrir, o usar Ajustes del Sistema → Privacidad y Seguridad → Abrir de todos modos.

## Comparativa con modelos similares

| Herramienta | Tipo | Plataforma | Licencia | Procesamiento local | Formatos |
|---|---|---|---|---|---|
| ProtoArt Press | App de compresion multimedia | macOS (Apple Silicon) | Apache-2.0 | Si | JPG, PNG, PDF, MP4, MOV, M4V, WAV, AIFF, FLAC, MP3, M4A, CAF |
| ImageOptim | App de compresion de imagenes | macOS | Open source (GPL) | Si | JPG, PNG, GIF |
| HandBrake | Transcoder de video | Multiplataforma | GPL | Si | Video (amplio soporte) |
| Adobe Acrobat (compresion PDF) | Suite PDF | Multiplataforma | Comercial | Parcial | PDF |

La comparativa se limita a herramientas funcionalmente equivalentes; no existen modelos de IA comparables porque ProtoArt Press no es un modelo. Los datos de las alternativas se ofrecen a titulo orientativo y no proceden de la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural ni admite tool calling. Cualquier evaluacion como modelo es improcedente.
- Requiere macOS 13 o superior y Apple Silicon; no hay version para Windows, Linux ni Macs Intel.
- La aplicacion no esta notarizada, lo que anade friccion en el primer arranque y puede generar avisos de seguridad.
- El reemplazo en el sitio envia los originales a la Papelera; conviene verificar los resultados antes de vaciarla.
- El ahorro depende del contenido: archivos ya comprimidos de forma agresiva pueden no superar el umbral minimo de ahorro configurado.
- La compresion de video depende de los codificadores por hardware de Apple; la calidad final esta acotada por HEVC/H.264 y no se ofrecen codecs mas modernos como AV1.
- No se especifican los idiomas de la interfaz ni se detalla el comportamiento con metadatos sensibles (GPS, EXIF) mas alla de la opcion generica de metadatos.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y aviso.
- El repositorio de Hugging Face tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/brushpenbob/protoart-press
- Instalador: https://huggingface.co/brushpenbob/protoart-press/resolve/main/ProtoArt-Press-2.1.0.dmg
- Codigo fuente: https://github.com/theprotoart/protoart-press
