# CCSSNE/z-image-turbo-qnn

## Resumen

CCSSNE/z-image-turbo-qnn es una conversion del modelo de generacion de imagenes Tongyi-MAI/Z-Image-Turbo a binarios de contexto de Qualcomm (QNN) para su ejecucion en la NPU Hexagon de smartphones Android. El autor es el usuario CCSSNE y el artefacto esta pensado para el backend `zimage` de la aplicacion Local Dream, un cliente de generacion local en dispositivos Snapdragon. Se distribuye bajo licencia Apache 2.0 y ocupa 18,2 GB en el repositorio, con 45 ficheros y unos 17,6 GB de pesos segun el manifiesto de instalacion.

Tecnicamente envuelve un DiT (Diffusion Transformer) "Scalable Single-Stream" de 6B parametros, un codificador de texto Qwen3-4B del que se toma `hidden_states[-2]` y el VAE de Flux. La conversion cuantiza a w4a16 (pesos de 4 bits, activaciones de 16 bits) y divide el grafo en 33 contextos encadenados: 6 para el codificador de texto, 32 bloques mas el refinador de ruido para el DiT y uno para el decodificador VAE.

Su relevancia ahora es doble. Por un lado, lleva generacion de imagenes de difusion a la NPU de un movil de gama alta, un escenario tradicionalmente reservado a GPU de escritorio o a servicios en la nube. Por otro, el propio autor marca el artefacto como **no probado**: los binarios se compilaron en una maquina sin NPU y nunca han producido una imagen en un Snapdragon, por lo que se publica como material reproducible para que terceros lo validen, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT "Scalable Single-Stream" de 6B + codificador de texto Qwen3-4B + VAE de Flux, dividida en 33 grafos QNN |
| Parametros totales | 6B en el DiT; el codificador de texto anade Qwen3-4B. Total exacto del conjunto: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits) en los context binaries; embeddings de tokens en fp16 |
| Idiomas soportados | no disponible (el autor no documenta idiomas; el prompt se procesa con un tokenizador Qwen2) |
| Licencia | Apache 2.0 |
| Formato de pesos | QNN context binaries (`.bin`, 45 ficheros, ~17,6 GB), ONNX intermedio, `tokenizer.json` (Qwen2Tokenizer); APK debug arm64-v8a |
| Plataforma objetivo | Qualcomm Snapdragon con Hexagon v73 (8 Gen 2), compatible con v75 (8 Gen 3) y v79 (8 Elite) |
| Tamano del repositorio | 18,2 GB |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento en la model card: no se indican tokens, composicion del dataset ni si hubo RLHF o DPO, porque este repositorio no entrena un modelo, sino que convierte uno existente. Lo que si se describe es la arquitectura de inferencia resultante. El pipeline consta de un tokenizador Qwen2, una tabla de embeddings `token_emb.bin` en fp16 con forma `[vocab, 2560]` cuya lookup se ejecuta en CPU para permitir el escalado de pesos por prompt, un codificador de texto Qwen3-4B troceado en 6 contextos y leido en `hidden_states[-2]`, la rama de caption del DiT (`unet_cap.bin`) y el propio DiT de difusion.

La innovacion tecnica principal es el particionado del grafo. El DiT se reparte en `unet_part1` y `unet_part2` (refinador de ruido) mas 32 bloques individuales (`unet_part3` a `unet_part32`), y el VAE se aisla en `vae_decoder`. El motivo son los buffers scratch de la HTP: cada context binary declara un "spill-fill" que puede duplicar su tamano, de modo que `unet_part1/2` ocupa 491 MB de blob pero necesita 1033,6 MB de scratch, los bloques intermedios 385 MB de blob y 842,0 MB de scratch, y el `vae_decoder` 198 MB de blob con 1776,2 MB de scratch. Cargar cada parte con su propia reserva pedia unos 2,2 GB al DSP en cada iteracion y provocaba un SSR en el dispositivo; la solucion aplicada es que la rama de caption encabece un grupo de spill-fill compartido al que se referencian todas las partes, de forma que una sola asignacion cubre todo el bucle de denoising. El autor documenta tambien que las metricas por etapa (`stage`, `peak_rss_kb`, `seconds`, `exit_code`) se guardan en `partial/n32-attn5/stats/*.tsv` y que de ahi se deriva el criterio de particion.

## Capacidades

- Generacion de imagenes texto-a-imagen (text-to-image), heredada del pipeline de Z-Image-Turbo.
- Ejecucion en NPU Hexagon mediante QNN, sin GPU dedicada y sin conexion a red.
- Codificacion de prompts con un codificador Qwen3-4B, con posibilidad de ponderacion por token al ejecutarse la lookup de embeddings en CPU.
- Integracion con la aplicacion Local Dream mediante el backend `zimage` y el tipo `--type zimage`.
- Descarga e instalacion en el dispositivo guiada por `model/manifest.json` con reanudacion a nivel de fichero (45 ficheros descargados de uno en uno, sin archivo comprimido).
- Modo de carga secuencial del DiT (`DiT sequential loading`) pensado para dispositivos con 12 GB de RAM en lugar de 16 GB.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento. Al ser un modelo de difusion texto-a-imagen, no aplican.

## Casos de uso

- Generacion de imagenes sin conexion en movil: una aplicacion Android podria producir imagenes a partir de un prompt de texto sin enviar datos a ningun servidor, apoyandose en los binarios QNN sobre la NPU Hexagon. Requiere un Snapdragon 8 Gen 2 o superior con 16 GB de RAM recomendados.
- Prototipado de aplicaciones de IA generativa on-device: el APK debug y el repositorio permiten a un desarrollador probar el backend `zimage` dentro de Local Dream y verificar si la cadena de 33 grafos carga correctamente en su dispositivo.
- Investigacion sobre despliegue QNN/HTP: el particionado del DiT y las tablas de spill-fill publicadas en la model card sirven como caso de estudio para convertir un transformer de difusion grande en contextos que quepan en el scratch de la DSP.
- Ilustracion y generacion de assets en campo: tecnicos, periodistas o creadores que trabajen sin conectividad podrian generar bocetos o imagenes de apoyo desde el propio telefono, siempre que la calidad de salida se valide (actualmente desconocida).
- Privacidad de datos sensibles: al no salir el prompt ni la imagen del dispositivo, encaja en escenarios donde no se permite usar servicios en la nube, como documentacion interna o material personal.
- Demostraciones en ferias y entornos aislados: un terminal con el APK sideloadeado puede mostrar generacion local de imagenes sin depender de red ni de credenciales de API.
- Banco de pruebas para validacion comunitaria: dado el aviso explicito de "UNTESTED", el caso de uso inmediato es que terceros ejecuten el modelo, reporten logs en issues y confirmen o desmientan que el pipeline completo funciona.
- Educacion sobre cuantizacion w4a16: el repositorio permite medir el error de cuantizacion que el autor nunca llego a calcular y compararlo con las referencias ONNX/PyTorch verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de verificacion que no mide calidad de generacion, sino coherencia del proceso de conversion:

| Comprobacion | Resultado declarado |
|---|---|
| Export estatico frente al pipeline de referencia | Bit-exacto en CPU |
| ONNX frente a PyTorch | ~1e-6 |
| Grafos aceptados por `qairt-converter` | Si |
| Error de cuantizacion tras w4a16 | Nunca medido |
| Codificador de texto, rama de caption y parte 1 del DiT en un 8 Gen 2 | Si, reportado |
| Carga de la cadena completa de 33 grafos del DiT | Fallo una vez, corregido, sin reintentar |
| Calidad de la imagen de salida | Desconocida |

No hay valores de MMLU, HumanEval, GSM8K ni equivalentes, porque son benchmarks de modelos de lenguaje y este es un modelo de generacion de imagenes. Tampoco se publican FID, CLIP score ni latencias. La busqueda web realizada no devolvio material relevante sobre el modelo.

## Requisitos de hardware

- Plataforma: Qualcomm Snapdragon 8 Gen 2 o mas reciente. Los context binaries estan compilados para Hexagon v73 y funcionan tambien en v75 (8 Gen 3) y v79 (8 Elite); un binario compilado para una Hexagon mas nueva no carga en una mas antigua.
- RAM: 16 GB recomendados; con 12 GB es necesario activar la carga secuencial del DiT en los ajustes.
- Almacenamiento: unos 17,6 GB para el conjunto de 45 ficheros, dentro de un repositorio de 18,2 GB.
- Memoria del DSP: los buffers scratch declarados son de 1033,6 MB para `unet_part1/2`, 842,0 MB para cada bloque del DiT, 47,3 MB para `unet_cap`, 29,5 MB para cada parte del codificador de texto y 1776,2 MB para `vae_decoder`. El diseno actual los agrupa en una unica asignacion compartida.
- GPU de escritorio: no aplica. El artefacto esta construido para NPU Qualcomm; no se documenta soporte para A100, H100 ni RTX 4090, y no cabe esperar ejecucion en GPU consumer con estos binarios.
- Opciones de despliegue: APK de Local Dream con soporte `--type zimage` (`LocalDream-zimage-2.8.1-arm64-v8a-UNTESTED-debug.apk`), instalable por `adb install` o gestor de ficheros. Tambien es posible compilar desde el codigo fuente, rama `claude/zimage-q2-runner-ftk3lo`. El toolkit de conversion es `qairt-converter` junto con `qnn-context-binary-utility`.
- Latencia y throughput: no disponible. El autor no publica tiempos de generacion; solo estadisticas de construccion por etapa (RSS pico y segundos) que no reflejan el rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Plataforma | Licencia | Estado |
|---|---|---|---|---|---|---|
| CCSSNE/z-image-turbo-qnn | 6B DiT + Qwen3-4B | No disponible | QNN context binaries + APK debug | Snapdragon 8 Gen 2 o superior | Apache 2.0 | Publicado sin probar en dispositivo |
| Tongyi-MAI/Z-Image-Turbo | 6B DiT + Qwen3-4B, segun la model card | No disponible | No disponible | No disponible | No disponible | Modelo de referencia del que deriva esta conversion |
| Otras conversiones de difusion a QNN para Android | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparables entre esta conversion y el modelo original, por lo que la unica diferencia documentada es el formato de despliegue y el estado de validacion.

## Limitaciones y advertencias

- El artefacto esta marcado explicitamente como **no probado**: nunca se ha ejecutado en un dispositivo Snapdragon y no ha producido ninguna imagen. El propio autor advierte de que, si no funciona, es lo esperado.
- El error de cuantizacion w4a16 nunca se ha medido, por lo que se desconoce cuanto degrada la calidad respecto al modelo en fp16.
- La cadena completa de 33 grafos del DiT fallo una vez al cargarse; se corrigio con el grupo de spill-fill compartido, pero no se ha vuelto a probar.
- La calidad de la imagen de salida es desconocida. No hay FID, CLIP score ni ninguna evaluacion cualitativa publicada.
- Requiere un APK especifico (`--type zimage`) que no esta en las versiones estables de Local Dream. El APK incluido es una build de depuracion, solo arm64-v8a, firmada con la clave de debug de Android.
- Las instalaciones realizadas antes del 2026-08-12 a las 14:22 UTC tienen un manifiesto de 38 ficheros en lugar de 45 (falta el codificador de texto) y no arrancan: el backend aborta al no encontrar `clip_part1.bin`. Hay que reinstalar el APK y dejar que refresque el modelo.
- Compatibilidad restringida a Snapdragon 8 Gen 2 o superior con Hexagon v73, v75 o v79. No funciona en otras NPU ni en GPU.
- No se documentan idiomas soportados ni longitud de contexto del codificador de texto; el comportamiento multilingue del pipeline no esta verificado.
- La licencia del artefacto es Apache 2.0, que permite uso comercial, pero conviene revisar por separado la licencia del modelo base Tongyi-MAI/Z-Image-Turbo antes de desplegarlo en produccion, ya que no se detalla en la informacion disponible.
- No hay garantia de mantenimiento: el autor indica que retirara el aviso de "no probado" cuando alguien confirme una generacion correcta, lo que implica que el soporte depende de la comunidad.
- Al ser un modelo de difusion, el riesgo no es de alucinacion textual sino de artefactos visuales, sesgos en el dataset de entrenamiento original (no documentado aqui) y posible reproduccion de sesgos del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CCSSNE/z-image-turbo-qnn
- Modelo base en HuggingFace: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Repositorio de Local Dream: https://github.com/xororz/local-dream
- Rama de construccion del APK: `claude/zimage-q2-runner-ftk3lo` (del repositorio de Local Dream)
- Ficheros de estadisticas de conversion: `partial/n32-attn5/stats/*.tsv` dentro del repositorio del modelo
- Manifiesto de instalacion: `model/manifest.json` dentro del repositorio del modelo
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
