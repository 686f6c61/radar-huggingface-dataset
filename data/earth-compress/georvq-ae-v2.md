# earth-compress/georvq-ae-v2

## Resumen

georvq ae-v2 es un códec de compresion aprendida (learned compression codec) para los mosaicos anuales de embeddings de AlphaEarth Foundations: 64 bandas a 10 m de resolucion, distribuidos por source.coop. No es un modelo generativo ni un LLM, sino un autoencoder con cuantizacion vectorial que comprime cada mosaico fuente de 8192 x 8192 pixeles en un almacen Zarr de 52 a 64 MB, legible por ventana sobre HTTP en cualquiera de 23 tasas entre 0,17 y 7,6 bits por pixel.

Lo desarrolla Asterisk Laboratories Co-operative Ltd. (Asterisk Labs) en el marco del proyecto Earth Compress, una colaboracion con el National Oceanography Centre, con financiacion de ARIA. El modelo resuelve un problema concreto de ingenieria geoespacial: el coste de almacenamiento y transferencia de los embeddings de AlphaEarth, que de otro modo obligan a descargar teselas completas de gran tamano. Con este codec, el codigo escrito para las teselas originales puede leer los almacenes comprimidos sin cambios, ya que la lectura devuelve embeddings int8 con la forma, el CRS, la geotransformacion y el valor nodata (-128) de la tesela fuente.

El repositorio contiene unicamente los pesos que descarga la libreria `georvq` (github.com/earth-compress/georvq). La relevancia actual radica en que permite acceso selectivo por ventana y por calidad: un lector puede pedir un limite de error (`quality="p99<=0.02"`) y recibir, por ventana de 64 px, la tasa mas barata que lo cumple, con la estadistica de error medida en tiempo de codificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder con cuantizacion vectorial (VQ-AE) de tres niveles (coarse-mid-fine) y canal de medias rotado de 672 bits; export ONNX para decodificacion sin torch |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (codec de imagen, no modelo de lenguaje) |
| Tipos de cuantizacion | 23 tasas de bits por pixel (0,17 a 7,6 bpp); pesos en float32, codebooks int8 con escala float32 por palabra de codigo; salida int8 |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache 2.0 (pesos); los datos derivados heredan CC-BY 4.0 de AlphaEarth Foundations |
| Formato de pesos | `weights.npz` (float32), `codebooks.npz` (int8 + escala float32), `mean_channel.npz`, `config.json`, `bundle.json`, export ONNX en `onnx/` |

## Arquitectura y entrenamiento

La arquitectura es un autoencoder con cuantizacion vectorial organizado en tres niveles o tiers (coarse, mid, fine). Cada tasa de lectura es una "rung" definida por la profundidad asignada a cada tier (por ejemplo 8-8-2 o 2-0-0), de modo que una lectura descarga solo los bytes que necesita esa rung. Ademas del flujo principal de cuantizacion, el modelo incorpora un canal de medias rotado de 672 bits que transmite la media de cada ventana, con tablas almacenadas en `mean_channel.npz`.

El entrenamiento se realizo sobre el dataset AlphaEarth Foundations Satellite Embedding (producido por Google y Google DeepMind, licencia CC-BY 4.0). La model card no detalla el numero de tokens, la composicion exacta del dataset ni si hubo etapas de refinamiento tipo RLHF o DPO; esa informacion no esta disponible. La validacion de calidad se hizo sobre 16 teselas fuente reservadas, de 2018 a 2025 y latitudes entre -75 y 75, midiendo `1 - cos` de la reconstruccion int8 frente a la fuente int8, promediado sobre pixeles validos.

Una innovacion destacable es la estadistica de calidad por ventana: cada almacen registra el error medido de cada ventana de 64 px en cada rung, cuantizado logaritmicamente con 32 codigos por decada y redondeado hacia arriba, lo que permite garantizar que una lectura con un limite de error no lo supera en la decodificacion con la que se midieron los valores. El bundle completo incluye encoder y decoder (319,5 MB, `decoder_id` `d9b0af741f66b682`); el bundle solo-decoder ocupa 134,2 MB, comparte `bitstream_id` (`400e751734db103d`) y decodifica de forma identica.

## Capacidades

- Compresion de mosaicos de embeddings geoespaciales AlphaEarth (64 bandas, 10 m) a almacenes Zarr de 52-64 MB por tesela de 8192 x 8192.
- Lectura por ventana sobre HTTP sin descargar la tesela completa.
- 23 tasas de compresion seleccionables entre 0,17 y 7,6 bits por pixel.
- Lectura guiada por limite de error: `quality="p99<=0.02"` devuelve por ventana la rung mas barata que cumple el limite.
- Preservacion de metadatos: forma, CRS, geotransformacion y nodata (-128) de la fuente.
- Salida en int8 compatible con codigo escrito para las teselas originales.
- Decodificacion sin torch mediante el export ONNX incluido en el bundle.
- Carga segura de arrays con `allow_pickle=False`, sin ejecucion de codigo serializado.
- Verificacion de hashes del bundle en la primera lectura de pixeles.

## Casos de uso

- Distribucion de embeddings a gran escala: servir mosaicos AlphaEarth comprimidos por HTTP con lectura por ventana, reduciendo el ancho de banda frente a la descarga de teselas completas de 8192 x 8192.
- Analisis regional selectivo: un investigador que solo necesita un recorte de 1024 x 1024 puede leer esa ventana concreta sin transferir el resto de la tesela, usando `ds.read(window=...)`.
- Pipelines con presupuesto de error controlado: solicitar `quality="p99<=0.02"` permite que el lector elija automaticamente la rung mas barata que satisface el umbral, util en evaluaciones donde la fidelidad del embedding debe estar acotada.
- Archivo y preservacion de datos: almacenar series anuales (2018-2025) en almacenes de 52-64 MB por tesela reduce el coste de conservacion manteniendo la compatibilidad con el codigo de analisis existente.
- Entrenamiento de modelos downstream con embeddings comprimidos: usar las lecturas int8 como entrada de clasificadores o segmentadores, ajustando la rung al equilibrio entre calidad y coste de E/S.
- Despliegue en entornos con ancho de banda limitado: la decodificacion ONNX sin torch permite integrar la lectura en servicios ligeros o entornos sin dependencias de PyTorch.
- Validacion de integridad en produccion: la comprobacion de hashes del bundle y el `bitstream_id` permiten auditar que la decodificacion usa los pesos esperados.

## Benchmarks y rendimiento

La model card publica la calidad de reconstruccion (`1 - cos` medio sobre pixeles validos de 16 teselas reservadas) para una seleccion de rungs:

| Rung | bits/px | 1 - cos |
|---|---|---|
| 2-0-0 | 0,169 | 0,0266 |
| 8-0-0 | 0,186 | 0,0195 |
| 8-4-0 | 0,389 | 0,0087 |
| 8-8-0 | 0,592 | 0,0067 |
| 8-8-2 | 2,342 | 0,0036 |
| 8-8-4 | 4,092 | 0,0026 |
| 8-8-8 | 7,592 | 0,0019 |

La tabla completa de las 23 rungs, con los bits por ventana de cada una, esta en `bundle.json` y en la cabecera de cada almacen. No se han publicado resultados de benchmarks comparativos con otros codecs en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el bundle solo-decoder ocupa 134,2 MB en disco, por lo que la huella en memoria es reducida y probablemente apta para CPU.
- GPU recomendadas: no especificadas. Dado el tamano del decoder, no se requiere una GPU de datacenter (A100, H100) para decodificar; una GPU consumer es suficiente si se usa aceleracion.
- Cabe en GPU consumer: si, con margen amplio, dado el tamano del bundle; la decodificacion ONNX permite ejecucion sin torch.
- Opciones de despliegue: libreria `georvq` (instalable via `pip install "georvq @ git+https://github.com/earth-compress/georvq"`), export ONNX para decodificacion sin torch, lectura directa de almacenes Zarr sobre HTTP.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Almacenamiento: bundle completo 319,5 MB; bundle solo-decoder 134,2 MB; cada almacen comprimido 52-64 MB por tesela.

## Comparativa con modelos similares

No se dispone de informacion sobre codecs comparables (por ejemplo, alternativas de compresion aprendida para embeddings geoespaciales) en la documentacion proporcionada. La model card no incluye comparaciones con otros metodos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| georvq ae-v2 | no disponible | no aplica | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especifico de AlphaEarth Foundations: solo comprime y decodifica los embeddings anuales de 64 bandas a 10 m de ese dataset; no es un compresor generico de imagenes ni de otros embeddings.
- Perdida de fidelidad: la reconstruccion es int8 y con error no nulo en todas las rungs (1 - cos entre 0,0019 y 0,0266); no es una compresion sin perdidas.
- Dependencia de la libreria `georvq` y de la descarga del bundle en la primera lectura; requiere acceso de red a Hugging Face y verificacion de hashes.
- Los almacenes codificados o decodificados con este modelo son obra derivada del dataset AlphaEarth y heredan su licencia CC-BY 4.0 y su atribucion, que cada cabecera de almacen registra; el uso comercial debe respetar ambas licencias.
- La codificacion requiere el bundle completo (319,5 MB); el bundle solo-decoder no permite codificar.
- Los almacenes que fijan la revision 8b4f9449 descargan los ficheros torch del bundle completo (173,2 MB, sin ONNX) en lugar del bundle solo-decoder.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones idiomaticas porque no es un modelo linguistico; esos apartados no aplican.
- No hay datos publicados de latencia, throughput ni rendimiento comparativo frente a otros codecs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/earth-compress/georvq-ae-v2
- Dataset de muestra: https://huggingface.co/datasets/earth-compress/georvq-ae-v2-sample
- Repositorio de la libreria: https://github.com/earth-compress/georvq
- Dataset fuente AlphaEarth Foundations: https://source.coop/tge-labs/aef
- Paper referenciado (arXiv:2507.22291): https://arxiv.org/abs/2507.22291
- Asterisk Labs: https://asterisk.coop
