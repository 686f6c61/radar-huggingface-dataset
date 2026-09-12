# einaux/autumi-models

## Resumen

`einaux/autumi-models` es un repositorio de HuggingFace publicado por el usuario einaux que no contiene un modelo entrenado por el autor, sino un paquete de distribucion con copias sin modificar de seis checkpoints de terceros utilizados por la aplicacion EINAUX autumi. En concreto, agrupa cuatro checkpoints de transcripcion de Tsumugi (bajo v2, guitarra v1.5, modelo por defecto y bateria v1.5), el modelo de velocidad de Tsumugi para notas de bateria y el modelo Transkun 2.0.1. La model card es explicita: no se aplico ninguna conversion de pesos, cuantizacion ni ajuste fino sobre estas copias.

El proposito del repositorio es servir como dependencia reproducible de autumi, una herramienta de transcripcion automatica de musica (audio-to-MIDI). Cada pack tiene asignado un rol de producto dentro de la aplicacion: bajos, guitarras, sintetizadores y pads, bucles de bateria (con una segunda etapa de estimacion de velocidad por nota) y el modo de 88 teclas basado en Transkun. La relevancia de esta ficha no esta tanto en una innovacion arquitectonica propia como en la trazabilidad de licencias y de revisiones upstream, un aspecto critico para desarrolladores que necesiten auditar el origen de los pesos antes de integrarlos en un producto.

El repositorio ocupa 2,1 GB, esta etiquetado con los idiomas ingles y aleman (idiomas de la documentacion, no del audio) y no declara un pipeline de HuggingFace. En el momento de redactar esta ficha no registra descargas ni "likes", y la metadata de licencia del repositorio aparece como no disponible, aunque cada pack conserva la licencia MIT de su distribucion original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se describe en la informacion proporcionada; se trata de checkpoints de transcripcion musical de Tsumugi y Transkun, no de un modelo de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no aplica (modelos de transcripcion de audio a MIDI, no modelos generativos de texto) |
| Tipos de cuantizacion | no disponible; la model card indica explicitamente que no se aplico cuantizacion ni conversion de pesos |
| Idiomas soportados | en, de (etiquetas del repositorio, correspondientes al idioma de la documentacion; la transcripcion musical no depende del idioma) |
| Licencia | MIT, segun las declaraciones de las model cards upstream citadas; la metadata de licencia del repositorio de HuggingFace figura como no disponible |
| Formato de pesos | `.pth` (checkpoints de PyTorch de Tsumugi) y `.pt` + `.conf` (Transkun 2.0.1) |
| Tamano total del repositorio | 2,1 GB |
| Pipeline de HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |

Contenido exacto del repositorio y roles declarados:

| Pack | Rol en AUTUMI | Ficheros |
|---|---|---|
| Tsumugi bass_v2 | Bajos | `tsumugi-bass-v2/best_model_bass_v2.pth` |
| Tsumugi guitar_v1_5 | Guitarras | `tsumugi-guitar-v1-5/best_model_guitar_v1_5.pth` |
| Tsumugi default | Sintetizadores/pads y MIDI Rack (modo interno `Track Rack`) | `tsumugi-default/best_model.pth` |
| Tsumugi drums_v1_5 | Bucles de bateria (deteccion de notas) | `tsumugi-drums-v1-5/best_model_drums_v1_5.pth` |
| Tsumugi velocity | Bucles de bateria (velocidad por nota, segunda etapa) | `tsumugi-drums-v1-5/best_velocity_model.pth` |
| Transkun 2.0.1 | 88 teclas | `transkun-2.0.1/2.0.pt`, `transkun-2.0.1/2.0.conf` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de ninguno de los checkpoints. Lo unico documentado es su procedencia exacta. Los cinco checkpoints de Tsumugi provienen del proyecto `anime-song/tsumugi` y del repositorio de modelos `anime-song/instrument_agnostic_amt`, que se describe como un modelo de transcripcion musical agnostico al instrumento. Los cuatro checkpoints originales corresponden a la revision de modelo `d4a3408ef1c65fc43d6c38954ac1aff89840a0b8` y a la revision de codigo `68534106370860169148f09d168db105dbc17b00`; los dos checkpoints de bateria (notas y velocidad) se anadieron el 12 de septiembre de 2026 y corresponden a la revision `c6ee8a22626cd7185031ee71ce7cea27ec862781`, ejecutada con la revision de codigo `f7411471a4de0ad3d430191de11b8623d67e5b38`. Segun la model card, los cuatro checkpoints antiguos producen notas identicas bajo ambas revisiones de codigo.

El sexto pack es Transkun 2.0.1, desarrollado por Yujia Yan, distribuido originalmente como paquete de PyPI con SHA-256 fijado en `7d7f5bf88b0d21f7da0415b089cff3bcbcbdda04e1a3c9719964947942c859fe`. Los ficheros `2.0.pt` y `2.0.conf` proceden de `transkun/pretrained/` dentro de esa distribucion, cuyo RECORD los incluye junto a la licencia MIT. No se afirma un commit de Git concreto para Transkun a partir unicamente de la version del paquete. No hay informacion sobre volumen de datos de entrenamiento, composicion del dataset, tecnicas de alineacion ni innovaciones tecnicas en la informacion proporcionada.

## Capacidades

- Transcripcion automatica de musica (audio-to-MIDI) mediante checkpoints especializados por rol instrumental.
- Transcripcion de bajo, guitarra, sintetizadores/pads y piano (modo de 88 teclas con Transkun 2.0.1).
- Deteccion de notas de bateria mediante el checkpoint `best_model_drums_v1_5.pth`.
- Estimacion de velocidad por nota detectada en bateria, en una segunda etapa, con `best_velocity_model.pth`.
- Enfoque agnostico al instrumento en el caso de Tsumugi, con modos de producto diferenciados segun el pack seleccionado.
- Reutilizacion del checkpoint `default` en dos modos de producto distintos (sintetizadores/pads y MIDI Rack), almacenado una sola vez.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni modo de pensamiento: no aplica a este tipo de modelo.
- No se documentan capacidades multilingues en el sentido de procesamiento de lenguaje; las etiquetas en/de corresponden a la documentacion.

## Casos de uso

- Transcripcion de grabaciones musicales a MIDI para produccion: el pack de bajo v2 permite extraer la linea de bajo de una mezcla y convertirla en eventos MIDI editables en un DAW, con la ventaja de usar un checkpoint especializado en lugar de un modelo generico.
- Digitalizacion de material de guitarra: el checkpoint guitar_v1_5 esta orientado especificamente a guitarras, lo que resulta adecuado para transcribir pistas de guitarra acustica o electrica antes de reescribirlas o remuestrearlas.
- Extraccion de lineas de sintetizador y pads: el checkpoint `default`, compartido con el modo MIDI Rack, sirve para recuperar partes de sintetizador y pads en arreglos electronicos.
- Generacion de partituras o grooves de bateria a partir de audio: la combinacion de `best_model_drums_v1_5.pth` (deteccion de notas) y `best_velocity_model.pth` (velocidad por nota) permite obtener patrones de bateria con dinamica, utiles para reemplazo de bateria o para producir librerias MIDI.
- Transcripcion de piano en el rango completo de 88 teclas: Transkun 2.0.1 cubre este escenario, adecuado para investigacion en transcripcion de piano y para herramientas de practica musical.
- Construccion de herramientas de entrenamiento musical: convertir una grabacion en MIDI permite ralentizar, aislar voces por instrumento y estudiar la interpretacion, usando los packs especializados segun el instrumento presente.
- Integracion en un pipeline de produccion musical dentro de una aplicacion de escritorio o servicio: el repositorio funciona como dependencia versionada, con revisiones upstream y sumas de verificacion documentadas, lo que simplifica la trazabilidad en entornos de CI/CD.
- Auditoria de licencias y cumplimiento: el repositorio separa cada pack con su base de licencia y conserva los avisos originales, lo que permite a un equipo legal verificar el origen MIT de cada componente antes de distribuirlo.
- Empaquetado y despliegue offline: al ser un conjunto autocontenido de pesos en formato PyTorch (2,1 GB), puede distribuirse junto a la aplicacion para funcionar sin acceso a la red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision (por ejemplo, note F1, onset F1 ni frame F1) para ninguno de los checkpoints, y los resultados de busqueda web proporcionados no contienen informacion relacionada con el modelo.

## Requisitos de hardware

- El repositorio completo ocupa 2,1 GB en disco; no se proporciona el desglose de tamano por checkpoint, por lo que no es posible estimar la VRAM por pack a partir de la informacion disponible.
- Como referencia de orden de magnitud, el conjunto completo (seis checkpoints mas runtime) cabe holgadamente en el almacenamiento de cualquier equipo de desarrollo actual.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible con datos concretos; los checkpoints estan en formato PyTorch (`.pth`, `.pt`) y pueden ejecutarse indistintamente en CPU o GPU segun el runtime que los cargue.
- Opciones de despliegue: PyTorch para los checkpoints de Tsumugi; para Transkun 2.0.1 existe una distribucion oficial en PyPI (`transkun 2.0.1`) cuyo SHA-256 esta fijado en el lock de dependencias de autumi. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto, rendimiento ni licencia de los modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita a identificar alternativas de la misma categoria (transcripcion automatica de musica) sin cifras verificadas.

| Modelo | Categoria | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tsumugi (via einaux/autumi-models) | Transcripcion instrumental agnostica | no disponible | no aplica | no disponible | MIT (declaracion upstream) | Pesos en este repositorio |
| Transkun 2.0.1 (via einaux/autumi-models) | Transcripcion de piano (88 teclas) | no disponible | no aplica | no disponible | MIT (incluida en la distribucion) | PyPI `transkun 2.0.1` y este repositorio |
| Otras alternativas de transcripcion musical | Transcripcion audio-to-MIDI | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Este repositorio no es un modelo propio: son copias sin modificar de pesos de terceros. Cualquier limitacion de los modelos originales se hereda integra.
- La model card advierte expresamente que no otorga una licencia nueva ni general sobre AUTUMI ni sobre modelos no relacionados; la licencia aplicable es la de cada pack upstream.
- La metadata de licencia del repositorio en HuggingFace figura como no disponible, por lo que la verificacion de licencia debe hacerse pack a pack consultando los avisos incluidos en el repositorio (`licenses/Tsumugi-MIT.txt`, `licenses/Transkun-MIT.txt`).
- Los avisos de copyright deben conservarse: MIT para anime-song (Tsumugi) y MIT para Yujia Yan (Transkun, copyright 2021).
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de errores de transcripcion (notas espurias, omisiones o velocidades incorrectas) inherente a cualquier sistema de transcripcion automatica; no se han publicado metricas para cuantificarlo.
- Sesgos conocidos: no disponible. Un modelo de transcripcion puede comportarse peor en generos o instrumentos poco representados en sus datos de entrenamiento, pero la informacion proporcionada no detalla la composicion del dataset.
- Limitaciones de contexto o idioma: no aplica una ventana de contexto; las etiquetas de idioma (en, de) describen la documentacion, no una capacidad multilingue del modelo.
- Se desconoce el numero de parametros, la arquitectura exacta, los datos de entrenamiento y las metricas de calidad de todos los checkpoints.
- El repositorio no declara pipeline de HuggingFace, por lo que no puede cargarse directamente con las utilidades estandar de `transformers`; requiere el runtime de autumi o del proyecto upstream correspondiente.
- Para Transkun no se afirma un commit de Git concreto a partir de la version del paquete; la garantia de integridad se apoya en el SHA-256 de la distribucion.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que implica una adopcion y validacion por parte de la comunidad practicamente nulas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/einaux/autumi-models
- Repositorio upstream de Tsumugi (codigo): https://github.com/anime-song/tsumugi
- Repositorio de modelos Tsumugi: https://huggingface.co/anime-song/instrument_agnostic_amt
- Model card de Tsumugi (revision `d4a3408e…`): https://huggingface.co/anime-song/instrument_agnostic_amt/blob/d4a3408ef1c65fc43d6c38954ac1aff89840a0b8/README.md
- API de revision de Tsumugi (`d4a3408e…`): https://huggingface.co/api/models/anime-song/instrument_agnostic_amt/revision/d4a3408ef1c65fc43d6c38954ac1aff89840a0b8
- Model card de Tsumugi (revision `c6ee8a22…`): https://huggingface.co/anime-song/instrument_agnostic_amt/blob/c6ee8a22626cd7185031ee71ce7cea27ec862781/README.md
- API de revision de Tsumugi (`c6ee8a22…`): https://huggingface.co/api/models/anime-song/instrument_agnostic_amt/revision/c6ee8a22626cd7185031ee71ce7cea27ec862781
- Licencia MIT del codigo de Tsumugi (revision `68534106…`): https://github.com/anime-song/tsumugi/blob/68534106370860169148f09d168db105dbc17b00/LICENSE
- Licencia MIT del codigo de Tsumugi (revision `f7411471…`): https://github.com/anime-song/tsumugi/blob/f7411471a4de0ad3d430191de11b8623d67e5b38/LICENSE
- Repositorio de Transkun: https://github.com/Yujia-Yan/Transkun
- Distribucion de Transkun 2.0.1 en PyPI: https://pypi.org/project/transkun/2.0.1/
