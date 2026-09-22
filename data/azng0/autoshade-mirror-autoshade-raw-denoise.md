# Azng0/autoshade-mirror-autoshade-raw-denoise

## Resumen

autoshade-raw-denoise-v2.pth es un modelo de denoising especifico de imagen RAW en mosaico (mosaic RAW), es decir, actua antes del revelado sobre el patron de Bayer sin interpolar. Lo publica el proyecto AutoShade (autor del repositorio en HuggingFace: Azng0) y se distribuye tambien como artefacto de la release v1.5.2 del repositorio GitHub del proyecto. No es un modelo de lenguaje: es una red convolucional de restauracion de imagen, por lo que conceptos como contexto, idiomas o tool calling no aplican.

Tecnicamente reutiliza la arquitectura DRUNet-colour de KAIR/DPIR (licencia MIT) y la especializa con pesos ajustados por AutoShade sobre pares reales de RawNIND (Brummer & De Vleeschouwer, CC BY-SA 4.0) y ruido de sensor sintetico. El pipeline asume la transformada de Anscombe generalizada, un modelo de ruido por plano y un campo de ruido propio del proyecto, de modo que el modelo no es autonomo: esta pensado para ejecutarse dentro del flujo de AutoShade.

La version v2 continua el fine-tune de v1 inyectando fuentes puntuales en el lado limpio del par de entrenamiento, con el objetivo de que las estrellas debiles no se eliminen como si fuesen ruido. El ajuste se hizo con `scripts/train_raw.py --stars 0.5 --loss l2x` durante 60000 pasos, seleccionando el checkpoint del paso 50000 mediante criterios de aceptacion fijados de antemano. Es relevante ahora sobre todo para fotografos y desarrolladores de pipelines astrofotograficos que quieran denoising RAW reproducible, verificable por hash y con licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DRUNet-colour (U-Net residual con conexiones densas de KAIR/DPIR) adaptada a mosaico RAW |
| Parametros totales | no disponible en la model card; estimacion derivada de ~32,6 M si los pesos estan en float32 (130.590.559 bytes) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible; se distribuye un unico fichero .pth (presumiblemente float32) |
| Idiomas soportados | no aplica (modelo de imagen, sin procesamiento de texto) |
| Licencia | MIT para los pesos y la arquitectura; los pares de entrenamiento RawNIND son CC BY-SA 4.0 |
| Formato de pesos | .pth (checkpoint PyTorch), 130.590.559 bytes, sha256 ffafa40a53f52092149db2fcf03636117ad6855e1068142d4f6b03b634e9f9c4 |
| Tarea | denoising de RAW en mosaico (pre-revelado) |
| Transformaciones de preprocesado requeridas | transformada de Anscombe generalizada, modelo de ruido por plano y campo de ruido de AutoShade |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La red es una DRUNet-colour de KAIR/DPIR: un U-Net con bloques residuales y conexiones densas, con entrada de mapa de ruido, que en su version original opera sobre imagenes RGB ya reveladas. AutoShade la reutiliza sobre el mosaico RAW, acompanada de la transformada de Anscombe generalizada (que estabiliza la varianza del ruido dependiente de la senal), de un modelo de ruido por plano de color y de un campo de ruido especifico. La innovacion no esta en la topologia, sino en ese envoltorio de preprocesado y en el ajuste fino de los pesos al dominio RAW del proyecto.

El entrenamiento parte de pesos ya ajustados por AutoShade (v1) y continua el fine-tune en v2 sobre pares reales de RawNIND mas ruido de sensor sintetico. En v2 se inyectan fuentes puntuales en el lado limpio para preservar estrellas debiles; la configuracion declarada es `--stars 0.5 --loss l2x` (perdida L2 ponderada) durante 60000 pasos, escogiendo el checkpoint del paso 50000 segun lineas de aceptacion precomprometidas. No se documentan en la informacion disponible ni el numero total de tokens muestreados, ni la composicion exacta del dataset, ni fases de RLHF/DPO (no aplicables a este tipo de modelo).

## Capacidades

- Eliminacion de ruido de fotones y ruido de lectura sobre imagen RAW en mosaico, antes del revelado.
- Preservacion de fuentes puntuales debiles (estrellas) gracias al ajuste especifico introducido en v2.
- Modelado de ruido heterogeneo por plano de color mediante Anscombe generalizada y modelo de ruido por plano.
- Trabajo con pares reales ruidoso/limpio de RawNIND y con ruido de sensor sintetico.
- Integracion en pipeline automatizado a traves del sidecar `python/denoise_raw.py`.
- Descarga verificable: el sidecar intenta primero la copia de HuggingFace y despues la release de GitHub, y solo acepta el fichero si los bytes coinciden con el sha256 fijado.
- No soporta tool calling, agentes, razonamiento multi-paso, vision semantica, audio ni generacion de texto: no es un modelo multimodal de lenguaje.
- No se declaran capacidades multilingues ni de otro tipo.

## Casos de uso

- Astrofotografia de campo amplio: aplicar el modelo al mosaico RAW antes del apilado para reducir ruido de fotones en tomas de exposicion corta, manteniendo las estrellas debiles que v1 tendia a eliminar.
- Revelado RAW de bajo ruido en fotografia nocturna: integrarlo como primera etapa del pipeline, antes de la interpolacion de Bayer, para evitar amplificar ruido al hacer demosaicing.
- Preprocesado en pipelines propios de AutoShade: usar `python/denoise_raw.py` como etapa estandar, aprovechando el modelo de ruido por plano y el campo de ruido que el proyecto ya calcula.
- Prototipado de investigacion en denoising RAW: servir como baseline reproducible con hash fijo para comparar contra otros denoisers sobre pares RawNIND.
- Correccion de ruido de lectura en sensores con ruido dependiente de la senal: la transformada de Anscombe generalizada permite tratar el ruido heterocedastico de forma estable antes de la red.
- Automatizacion por lotes en estaciones de trabajo o servidores: al pesar poco mas de 130 MB y ser una CNN de tamano moderado, se puede encadenar sobre series completas de capturas sin intervencion manual.
- Verificacion de integridad en produccion: el pin sha256 permite desplegar el modelo en entornos reproducibles comprobando que el binario descargado es exactamente el publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de PSNR, SSIM ni comparaciones cuantitativas con otros denoisers; solo menciona el criterio de seleccion de checkpoint (lineas de aceptacion precomprometidas, checkpoint del paso 50000 de 60000) y el efecto cualitativo de preservar estrellas debiles. El repositorio declara 0 descargas y 0 likes, por lo que tampoco existe validacion independiente registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Los pesos ocupan unos 130 MB (aproximadamente 65 MB si se convierten a float16), por lo que el consumo dominante son las activaciones, que crecen con la resolucion del mosaico RAW; se recomienda procesar por teselas en capturas de muchos megapixeles.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano del modelo, cualquier GPU con varios GB de VRAM es suficiente; para resoluciones altas conviene una GPU de gama media-alta o superior con procesamiento por teselas.
- GPU de consumo: si, es esperable que quepa en GPU de consumo actuales (por ejemplo, gamas RTX xx60/xx70 en adelante) siempre que se ajuste el tamano de tesela; no hay cifras oficiales de requisitos minimos.
- CPU: viable en inferencia, aunque con latencia mayor; no se documentan tiempos.
- Opciones de despliegue: PyTorch con el sidecar `python/denoise_raw.py` del proyecto AutoShade. vLLM, Ollama, llama.cpp y TGI no aplican, ya que no es un modelo de lenguaje. No se documenta exportacion a ONNX ni a otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| autoshade-raw-denoise-v2 | DRUNet-colour ajustada a RAW en mosaico | estimacion ~32,6 M (no declarado) | mosaico RAW con modelo de ruido por plano | MIT (pesos), datos CC BY-SA 4.0 | HuggingFace y release de GitHub |
| DRUNet / KAIR (base arquitectonica) | U-Net residual con entrada de mapa de ruido | no disponible en la informacion proporcionada | imagen RGB o escala de grises | MIT | repositorio KAIR |
| DPIR | denoiser prior basado en DRUNet con esquema de optimizacion | no disponible en la informacion proporcionada | imagen RGB/gris | licencia del proyecto DPIR (no disponible aqui) | repositorio del proyecto |
| Denoisers clasicos (BM3D, non-local means) | metodos no aprendidos | no aplica | imagen, normalmente tras demosaicing | variada | implementaciones multiples |

No se dispone de datos comparativos de rendimiento entre estas opciones en la informacion proporcionada, por lo que la comparacion se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere la transformada de Anscombe generalizada, el modelo de ruido por plano y el campo de ruido de AutoShade para funcionar como se pretende.
- Dominio de entrada restringido: esta pensado para mosaico RAW, no para imagenes ya reveladas; aplicarlo a RGB puede degradar el resultado.
- Generalizacion limitada: el ajuste se hizo sobre pares RawNIND y ruido sintetico; sensores o condiciones de ruido fuera de esa distribucion pueden comportarse de forma imprevisible.
- Riesgo de eliminar senal debil: es precisamente el problema que v2 intenta mitigar con la inyeccion de fuentes puntuales; aun asi, no hay validacion cuantitativa publicada que confirme la mejora.
- Sin evaluacion independiente: 0 descargas y 0 likes en HuggingFace, sin benchmarks publicados ni replicaciones externas conocidas.
- Obligaciones de atribucion: aunque los pesos son MIT, los pares de entrenamiento RawNIND estan bajo CC BY-SA 4.0 y se acreditan en `docs/TECH_STACK.md`; conviene revisar esa atribucion si se redistribuye el modelo o se publican resultados derivados.
- Integridad del fichero: el sidecar solo acepta el binario si coincide con el sha256 indicado; si se sustituye o reentrena el fichero, hay que actualizar el pin.
- Repositorio de 0,1 GB con una unica version publicada; no se documentan versiones cuantizadas, ni soporte para otras plataformas de inferencia.
- Las busquedas web realizadas no han devuelto documentacion tecnica relevante sobre este modelo: los resultados obtenidos corresponden a una empresa de aguas minerales sin relacion con el proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Azng0/autoshade-mirror-autoshade-raw-denoise
- Repositorio del proyecto AutoShade: https://github.com/skymanbp/autoshade
- Fichero de pesos en la release v1.5.2: https://github.com/skymanbp/autoshade/releases/download/v1.5.2/autoshade-raw-denoise-v2.pth
- Script de inferencia (ruta dentro del repositorio): `python/denoise_raw.py`
- Documentacion de atribuciones (ruta dentro del repositorio): `docs/TECH_STACK.md`
- Referencia de los datos de ajuste: pares RawNIND, Brummer & De Vleeschouwer, CC BY-SA 4.0 (URL no disponible en la informacion proporcionada)
- Repositorio KAIR (arquitectura DRUNet, MIT): no disponible en la informacion proporcionada
- Repositorio DPIR (arquitectura DRUNet-colour, MIT): no disponible en la informacion proporcionada
