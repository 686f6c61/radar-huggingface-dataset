# mashbox-labs/TRELLIS.2-TPU

## Resumen

TRELLIS.2-TPU es un port a Google Cloud TPU del modelo de imagen a 3D TRELLIS.2 de Microsoft, desarrollado por MASHBOX Labs. El modelo original toma una unica imagen RGBA como entrada y genera como salida una malla GLB texturizada. Este repositorio no contiene pesos propios: es un artefacto de despliegue que carga los pesos originales de `microsoft/TRELLIS.2-4B`, `microsoft/TRELLIS-image-large` y `facebook/dinov3-vitl16-pretrain-lvd1689m` sin modificarlos, y ejecuta la inferencia sobre JAX en una VM con TPU v6e-1.

El modelo base es un sistema de reconstruccion 3D generativa de aproximadamente 4.000 millones de parametros (segun el nombre del checkpoint original), orientado a la conversion de una sola vista a malla texturizada. La relevancia de este port es de infraestructura: demuestra que el pipeline completo de TRELLIS.2 puede ejecutarse en aceleradores TPU mediante JAX, con un consumo de memoria en chip de 14,4 GB y un coste por imagen de entre 0,70 y 1,36 dolares a precio de lista on-demand.

El estado del proyecto es experimental. La unica configuracion validada es una TPU v6e-1; las TPU v5e, v5p-8 y v6e-4 figuran como no probadas. El modelo no incluye kernels compilados propios y depende de JAX estandar, ademas de requerir la aceptacion de la licencia de DINOv3 en Hugging Face antes del primer uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de imagen a 3D; inferencia en JAX sobre TPU) |
| Parametros totales | no disponible (el checkpoint base se denomina TRELLIS.2-4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrada y salida no linguisticas) |
| Licencia | MIT (repositorio de port); los pesos originales y DINOv3 tienen sus propias licencias |
| Formato de pesos | pesos originales cargados sin modificar desde los repos de Microsoft y Meta; salida en GLB |
| Hardware objetivo | TPU v6e-1 (validado); v5e, v5p-8 y v6e-4 no probados |
| Memoria pico en chip | 14,4 GB |
| Memoria maxima del host (RSS) | 72,9 a 89,1 GB por ejecucion |
| Paquete de despliegue | `mashbox[tpu,trellis-2]>=0.1.10` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original TRELLIS.2: no se especifican el tipo de backbone, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron etapas de RLHF o DPO. Lo que si se documenta es el pipeline de inferencia tal como lo ejecuta este port. La imagen de entrada pasa por las etapas del modelo en el chip TPU, con trabajo de host intercalado entre ellas, y la salida de malla se procesa despues en la CPU de la VM mediante un pipeline de exportacion GLB que incluye remallado, simplificacion, desenvoltura UV y horneado de texturas.

La innovacion tecnica de este repositorio es el propio port: la implementacion corre sobre JAX estandar sin kernels compilados a medida, y el trabajo de exportacion GLB tambien emplea JAX en la CPU del host. El modelo depende de un codificador visual externo, DINOv3 ViT-L/16 (`facebook/dinov3-vitl16-pretrain-lvd1689m`), que debe descargarse con el token del usuario tras aceptar su licencia. En la primera ejecucion sobre un chip nuevo se compilan entre 17 y 55 programas, con un tiempo de carga y compilacion de 6 minutos y 28,6 segundos; el autor indica que ninguna de las ejecuciones medidas constituye una ejecucion en caliente.

## Capacidades

- Generacion de malla 3D texturizada a partir de una unica imagen RGBA de entrada, con salida en formato GLB.
- Reconstruccion de geometria y textura en un solo paso de pipeline, sin necesidad de multiples vistas.
- Exportacion completa de assets: remallado, simplificacion, desenvoltura UV y horneado de texturas sobre la CPU de la VM.
- Ejecucion del modelo en acelerador TPU mediante JAX, sin kernels compilados especificos.
- Integracion con el ecosistema `mashbox` mediante el comando `mashbox run trellis-2`.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni procesamiento de audio.

## Casos de uso

- Prototipado rapido de assets 3D para videojuegos: un artista parte de una captura o render 2D y obtiene una malla GLB texturizada en una sola ejecucion de entre 15 y 30 minutos, util para bloques de concepto antes del modelado definitivo.
- Catalogos de comercio electronico con vista 3D: a partir de una fotografia de producto sobre fondo transparente (RGBA) se genera una malla texturizada que puede incrustarse en visores web, con un coste por imagen de 0,70 a 1,36 dolares que permite estimar el coste por referencia.
- Digitalizacion de patrimonio o inventario fisico: fotografias de objetos individuales se convierten en mallas para archivo o documentacion, ejecutando una imagen por vez dado el consumo de memoria del host.
- Generacion de contenido para realidad aumentada: la salida GLB es directamente consumible por motores como Unity o visores glTF, lo que facilita poblar escenas AR con objetos derivados de una sola foto.
- Evaluacion de infraestructura TPU para pipelines generativos 3D: el repositorio sirve como banco de pruebas para medir latencia, memoria y coste de un modelo de difusion 3D sobre v6e-1 antes de comprometer un despliegue mayor.
- Investigacion en reconstruccion monocular: al cargar los pesos originales sin modificar, permite reproducir y medir el comportamiento de TRELLIS.2 en hardware alternativo al de referencia, comparando tiempos por etapa (chip frente a CPU).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (PSNR, Chamfer distance, F-Score u otros) en la informacion disponible. Los unicos datos medidos son de rendimiento y coste del port sobre TPU v6e-1:

| Medida | Resultado |
|---|---|
| Imagen a GLB completa (comando entero, pesos en disco) | 15 min 32,4 s a 30 min 11,7 s |
| Imagen a malla (etapas del modelo en chip, con trabajo de host) | 46,7 s a 1 min 37,5 s |
| Exportacion GLB en CPU (remallado, simplificacion, UV, horneado) | 14 min 26,8 s a 28 min 14,6 s |
| Primera ejecucion en chip nuevo (carga y compilacion) | 6 min 28,6 s |
| Programas compilados por ejecucion | 17 a 55 |
| Memoria pico en chip | 14,4 GB |
| RSS maxima de la VM por ejecucion | 72,9 a 89,1 GB |
| Coste por imagen (precio on-demand v6e-1, us-east1 y us-east5) | 0,70 a 1,36 USD |
| Ejecucion de una build anterior (otra imagen) | 42 min 26,2 s, pico de 122,9 GB |

## Requisitos de hardware

- Acelerador validado: una TPU v6e-1 en Google Cloud. Las TPU v5e, v5p-8 y v6e-4 no han sido probadas.
- Memoria en chip: 14,4 GB de pico, por lo que no se requiere particionar el modelo entre chips en la configuracion soportada.
- Memoria de host: planificar al menos 122,9 GB segun la ejecucion mas exigente registrada (una build anterior alcanzo ese pico); las ejecuciones medidas se movieron entre 72,9 y 89,1 GB sobre una VM de 185,7 GB.
- No cabe en GPU de consumo: el modelo esta portado especificamente a TPU y no se documenta soporte para CUDA, ROCm ni Metal.
- Despliegue: paquete `mashbox` version 0.1.10 o superior con extras `tpu` y `trellis-2`, instalado con `uv` sobre Python 3.12; requiere `hf auth login` o la variable `HF_TOKEN` para descargar DINOv3.
- Concurrencia: el autor recomienda procesar una imagen a la vez debido al consumo de memoria del host.
- Latencia: entre 46,7 segundos y 1 minuto 37,5 segundos para la fase en chip, y entre 15 y 30 minutos para el comando completo incluyendo la exportacion en CPU. No se documenta throughput agregado.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con otros modelos de imagen a 3D ni datos de calidad que permitan establecerlas. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Hardware | Datos de rendimiento |
|---|---|---|---|---|---|
| TRELLIS.2-TPU (este port) | no disponible (base 4B) | no aplica | MIT (port) | TPU v6e-1 | 15-30 min por imagen; 14,4 GB en chip |
| TRELLIS.2-4B (original de Microsoft) | 4B (segun nombre del checkpoint) | no aplica | no disponible en la informacion | no disponible | no disponible |
| TRELLIS-image-large | no disponible | no aplica | no disponible en la informacion | no disponible | no disponible |

## Limitaciones y advertencias

- Estado experimental: el autor etiqueta explicitamente el port como experimental y solo ha validado una TPU v6e-1.
- Dependencia de licencia de terceros: es obligatorio aceptar la licencia de DINOv3 (`dinov3-license`) en Hugging Face antes del primer uso; este repositorio no aloja esos pesos.
- Licencias de los pesos originales: la licencia MIT cubre el port, no necesariamente los pesos de Microsoft ni el codificador de Meta; verificar cada licencia antes de uso comercial.
- Consumo de memoria del host elevado: se han registrado picos de hasta 122,9 GB, lo que limita el despliegue a VM grandes y a una imagen por vez.
- Tiempos de arranque en frio: la primera ejecucion en un chip nuevo requiere 6 minutos y 28,6 segundos de carga y compilacion, y cada ejecucion compila entre 17 y 55 programas, sin ejecuciones en caliente en las mediciones.
- Cuello de botella en CPU: la exportacion GLB consume entre 14 y 28 minutos, mas que la inferencia en chip, lo que domina la latencia total.
- Sin cuantizaciones documentadas ni soporte GPU: no se ofrecen alternativas de menor precision ni despliegue en CUDA, Ollama, llama.cpp, vLLM o TGI.
- Riesgo de artefactos geometricos y de textura inherente a la reconstruccion monocular; no se documentan tasas de fallo ni evaluaciones de sesgo.
- Sin informacion sobre idiomas, sesgos ni alucinacion: al no ser un modelo linguistico, estas categorias no aplican directamente, pero tampoco se aportan metricas de fidelidad de reconstruccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mashbox-labs/TRELLIS.2-TPU
- Guia de ejecucion en TPU: https://mashbox.gg/docs/models/trellis-2
- Guia de configuracion en Google Cloud: https://mashbox.gg/docs/google-cloud
- Repositorio GitHub de mashbox: https://github.com/mashbox-labs/mashbox
- AGENTS.md (v0.1.10): https://github.com/mashbox-labs/mashbox/blob/v0.1.10/AGENTS.md
- Paquete en PyPI: https://pypi.org/project/mashbox/0.1.10/
- Perfil en X: https://x.com/mashboxgg
- Pesos originales TRELLIS.2-4B: https://huggingface.co/microsoft/TRELLIS.2-4B
- Pesos originales TRELLIS-image-large: https://huggingface.co/microsoft/TRELLIS-image-large
- Codificador DINOv3 ViT-L/16: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license
