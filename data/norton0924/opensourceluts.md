# Norton0924/OpenSourceLuts

## Resumen

OpenSourceLuts no es un modelo de inteligencia artificial ni un modelo de lenguaje: es una recopilación de 154 LUT de emulación de película en 3D, distribuidas por el usuario Norton0924 (con modificaciones atribuidas a «NicePhoto») a partir de tres proyectos de código abierto cuyas licencias permiten uso comercial. El repositorio agrupa los archivos, conserva la licencia original de cada LUT y documenta cada cambio en un registro de versiones, de modo que un estudio pueda auditar la procedencia antes de incorporar un look a su pipeline.

El problema que resuelve es de trazabilidad y licenciamiento: los LUT de emulación fílmica suelen circular sin metadatos de origen, y los packs comerciales no son reutilizables ni modificables. Aquí cada archivo lleva un código neutro (por ejemplo `C04`) asociado en `manifest.json` a su proyecto de origen, a la película de referencia, al proceso, al ISO y al papel de impresión, además de tamaño y SHA-256.

Es relevante ahora por su utilidad práctica en posproducción y fotografía: son transformaciones deterministas, sin inferencia, que se aplican en DaVinci Resolve, RawTherapee, ffmpeg u OpenColorIO con coste computacional despreciable. El repositorio, creado y actualizado el 23 de octubre de 2026, registra 0 descargas y 0 likes en el momento de la consulta, y no declara pipeline ni idiomas porque no son aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (no es un modelo de IA; son tablas de consulta 3D para correccion de color) |
| Parametros totales | no aplica; 33³ = 35 937 entradas por LUT |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica; muestras RGB en uint16 little-endian (16 bits por canal) |
| Idiomas soportados | no disponible / no aplica |
| Licencia | CC BY-SA 4.0, con componentes MIT (los 39 LUT `_sl`) y licencia propia por archivo en `LICENSES/` |
| Formato de pesos | `.lut16`: cabecera `LUT1` + uint32 LE con el tamano + RGB uint16 LE, rojo como canal mas rapido, sRGB de entrada y salida |
| Numero de LUT | 154 (14 `_sk`, 39 `_sl`, 101 `_rt`) |
| Categorias | `daily` (D), `pro` (P), `slide` (S), `cine` (C), `bw` (B), `instant` (I), `experimental` (X) |
| Metadatos | `manifest.json` (codigo, categoria, fuente, referencia filmica, `sourceTitle`, proceso, ISO, papel, ruta, tamano, SHA-256), `CHANGELOG.txt`, `LICENSES/` |
| Autor / mantenedor | Norton0924 (modificaciones atribuidas a «NicePhoto») |
| Fecha de creacion | 2026-10-23T08:36:22Z |
| Ultima actualizacion | 2026-10-23T09:19:13Z |
| Tamano del repo | 0.0 GB segun HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay arquitectura neuronal ni entrenamiento. Cada LUT es una función de transferencia tridimensional muestreada en una rejilla regular de 33×33×33, almacenada como enteros de 16 bits sin signo y aplicada por interpolación trilineal (o tetraédrica, según el software) entre la entrada y la salida en espacio sRGB. El resultado es una transformación píxel a píxel, determinista y sin estado, cuya huella en memoria es de aproximadamente 216 KB por LUT en su forma desempaquetada.

La procedencia de los datos sí es relevante técnicamente. Los 14 LUT `_sk` derivan de spektrafilm (Andrea Volpato), que simula una película negativa impresa en papel; los 39 `_sl` se generaron con Spectral Film LUT (Jan Lohse), herramienta de simulación espectral publicada bajo MIT; y los 101 `_rt` provienen de la colección Film Simulation de RawTherapee (Pat David, Pavlov Dmitry, Michael Ezra et al.) y fueron remuestreados por el mantenedor. El proceso de agregación incluye normalización de formato, asignación de códigos neutros no reutilizables y cálculo de hashes; los cambios se registran en `CHANGELOG.txt`.

## Capacidades

- Transformación de color determinista: conversión de material sRGB a looks que aproximan stocks cinematográficos y fotográficos concretos.
- Emulación de negativos impresos en papel, con curvas y dominantes derivadas de simulación espectral en los conjuntos `_sk` y `_sl`.
- Cobertura estilística amplia: 7 categorías (diario, profesional, diapositiva, cine, blanco y negro, instantánea, experimental) y 154 variantes.
- Formatos de integración: LUT 3D de 33³ en `.lut16`, compatible con lectores de LUT estándar y convertible a `.cube` en 33³ sin pérdida apreciable.
- Trazabilidad de licencia por archivo: cada LUT conserva su licencia original y su texto legal en `LICENSES/`.
- Verificación de integridad mediante SHA-256 por archivo en `manifest.json`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo generativo.

## Casos de uso

- Etalonaje en DaVinci Resolve: cargar el `.lut16` (o su conversión a `.cube`) como LUT de monitor o de clip para establecer un look base de película antes del ajuste primario, con la ventaja de que el archivo es determinista y reproducible entre sesiones.
- Revelado fotográfico en RawTherapee: la colección `_rt` procede precisamente de ese programa, por lo que se integra directamente en el flujo de simulación fílmica sobre archivos RAW sin conversión intermedia.
- Procesado por lotes con ffmpeg: el filtro `lut3d` acepta LUT 3D y permite aplicar un look uniforme a secuencias completas o a dailies en un pipeline automatizado, sin coste de GPU dedicada.
- Gestión de color con OpenColorIO: registrar los LUT como transformaciones del config del estudio para que artistas de VFX y composición trabajen con el mismo look que el equipo de etalonaje.
- Diseño de presets propios: usar los LUT de mayor calidad como punto de partida y derivar variantes ajustadas a la cámara o al perfil de entrada, con la obligación de mantener la licencia CC BY-SA 4.0 en la obra derivada.
- Docencia e investigación sobre respuesta fílmica: comparar las curvas de los conjuntos medidos por simulación espectral (`_sk`, `_sl`) frente a los ajustados a ojo (`_rt`) para ilustrar la diferencia entre modelado físico y corrección manual.
- Motores gráficos y aplicaciones: hornear el LUT como textura 3D de 33³ (aproximadamente 216 KB, formato float16 o R16G16B16) y aplicarlo en un shader de posprocesado con coste prácticamente nulo.
- Preservación de patrimonio audiovisual: aplicar un look consistente y documentado en la restauración de material digitalizado, apoyándose en el manifiesto para justificar cada decisión de color.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de IA, no existen métricas del tipo MMLU, HumanEval o GSM8K. La única información cuantitativa verificable es la composición del conjunto:

| Fuente (sufijo) | Proyecto | Autor | Licencia | LUT |
|---|---|---|---|---:|
| `_sk` | spektrafilm | Andrea Volpato | CC BY-SA 4.0 | 14 |
| `_sl` | Spectral Film LUT | Jan Lohse | MIT (software) | 39 |
| `_rt` | RawTherapee Film Simulation | Pat David, Pavlov Dmitry, Michael Ezra et al. | CC BY-SA 4.0 | 101 |
| Total | — | — | — | 154 |

## Requisitos de hardware

- VRAM: 0 GB. La aplicación de un LUT 3D de 33³ requiere únicamente una tabla de 35 937 entradas (unos 216 KB en uint16), almacenable en caché de CPU o en memoria de textura de GPU.
- GPU: ninguna dedicada es necesaria. Cualquier GPU integrada o discreta con soporte de texturas 3D puede aplicar el LUT en un shader; en posproducción, la carga la asume el motor de color del propio programa (Resolve, OCIO).
- GPU recomendadas: no aplica para el LUT en sí; el cuello de botella será el códec y la resolución del material, no la transformación de color. Cualquier GPU válida para el NLE es suficiente.
- Compatibilidad con hardware de consumo: total. Se puede aplicar en un portátil sin GPU dedicada, e incluso por CPU en procesado por lotes.
- Despliegue: DaVinci Resolve, RawTherapee, ffmpeg (`lut3d`), OpenColorIO, Adobe Premiere/After Effects (previa conversión a `.cube`), así como shaders personalizados en motores como Unity o Unreal.
- Latencia y throughput: no disponibles como cifra publicada; por la naturaleza de la operación (interpolación de tabla por píxel) el coste es despreciable frente a la decodificación y el resto del pipeline, y es paralelizable por línea de píxeles.

## Comparativa con modelos similares

| Criterio | OpenSourceLuts (este repo) | spektrafilm (`_sk`) | Spectral Film LUT (`_sl`) | RawTherapee Film Simulation (`_rt`) |
|---|---|---|---|---|
| Tipo | Recopilación de LUT 3D | Simulador espectral de negativo y papel | Generador de LUT por simulación espectral | Colección de looks ajustados |
| Numero de LUT | 154 | 14 (aportados aquí) | 39 (aportados aquí) | 101 (aportados aquí) |
| Metodo | Agregacion y remuestreo | Modelo fisico de pelicula | Modelo fisico espectral | Ajuste manual mayoritario |
| Licencia | CC BY-SA 4.0 / MIT por archivo | CC BY-SA 4.0 | MIT (software) | CC BY-SA 4.0 |
| Formatos | `.lut16` 33³ | salida propia del proyecto | salida propia del proyecto | integrado en RawTherapee |
| Metadatos y hashes | Si (`manifest.json`) | no disponible | no disponible | no disponible |
| Mantenimiento | Unico mantenedor, sin descargas registradas | Activo en GitHub | Activo en GitHub | Activo en RawPedia |

No se dispone de datos verificados de packs comerciales de emulación fílmica (precio, número de LUT, licencia) en la información proporcionada, por lo que no se incluyen en la comparación.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no acepta instrucciones; cualquier expectativa en ese sentido es un error de categorización.
- Los conjuntos `_sk` y `_sl` simulan un negativo impreso en papel, de modo que los blancos se sitúan en torno a L* 83–90 y no en el blanco del escáner; aplicarlos como LUT de conversión de espacio de color producirá un resultado incorrecto.
- La mayoría de los looks `_rt` se crearon a ojo y no están medidos contra película real: la fidelidad respecto al stock citado es aproximada.
- Los nombres de películas y marcas se usan solo para indicar a qué stock se aproxima cada LUT; ni los autores ni el repositorio tienen afiliación o respaldo de los titulares de las marcas.
- Licencia CC BY-SA 4.0 en la mayoría de archivos: cualquier LUT derivado o adaptado debe distribuirse bajo la misma licencia y con atribución; los 39 archivos `_sl` conservan licencia MIT, lo que introduce obligaciones distintas según el archivo y exige revisar `LICENSES/` caso por caso.
- El autor de spektrafilm solicita, sin carácter legal vinculante, que los LUT no se revendan como pack de pago ni se usen para entrenar modelos de IA comerciales; conviene respetarlo aunque la licencia no lo imponga.
- Trazabilidad limitada del mantenimiento: 0 descargas, 0 likes, repositorio creado y actualizado el mismo día y tamano declarado de 0.0 GB, lo que no permite verificar el contenido real de los archivos desde la información disponible.
- No hay validación publicada de los LUT remuestreados (`_rt`) frente a los originales de RawTherapee; el remuestreo puede introducir desviaciones no documentadas.
- No se declaran idiomas, pipeline ni datos de entrenamiento porque no aplican; cualquier ficha que los exija debe tratarlos como «no disponibles».

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Norton0924/OpenSourceLuts
- Réplica en ModelScope: https://modelscope.cn/models/Jiangdi/OpenSourceLuts
- spektrafilm (Andrea Volpato): https://github.com/andreavolpato/spektrafilm
- Spectral Film LUT (Jan Lohse): https://github.com/JanLohse/spectral_film_lut
- RawTherapee Film Simulation (documentación): https://rawpedia.rawtherapee.com/Film_Simulation
- La busqueda web realizada no devolvio enlaces adicionales relevantes sobre este repositorio; los resultados obtenidos corresponden a otros repositorios del mismo usuario (Joyfusion, SeedVR2_3b_fp16) y a listados genéricos de modelos de IA, sin relación con esta colección de LUT.
