# brishen/iron-yunet-npu2

## Resumen

`brishen/iron-yunet-npu2` es un bundle de despliegue del detector facial YuNet, exportado con IRON (la cadena de herramientas de AMD para sus NPU XDNA) y publicado en Hugging Face por el usuario `brishen`. No es un modelo nuevo: es un artefacto de compilación que empaqueta los kernels ya compilados en formato `.xclbin` junto con los flujos de instrucciones y los pesos empaquetados que un runtime Rust de IRON reproduce sobre la NPU. El modelo original es la implementación de detección facial mantenida en OpenCV Zoo, y la licencia MIT de ese proyecto upstream se aplica también a estos pesos.

El problema que resuelve es de despliegue, no de investigación: permite ejecutar un detector facial sobre la NPU integrada de los procesadores AMD Ryzen AI sin necesidad de recompilar el grafo para esos aceleradores. Cada convolución se ejecuta como una operación `flm.GEMM` sobre un único contexto hardware, descrito por un `xclbin` y 36 flujos de instrucciones, lo que da una ruta concreta de ejecución en NPU para una tarea clásica de visión por computador.

Es relevante en el contexto de la inferencia en el borde: la compilación está dirigida específicamente a NPU2 (AIE2P, presente en Strix Point, Strix Halo y Krackan) y no cargará en NPU1 (Phoenix, Hawk Point). El repositorio ocupa 31,7 MB repartidos en 40 archivos, e incluye tensores de referencia (`ref.*`) con una entrada y sus salidas esperadas para que el runtime pueda autoverificarse. En el momento de la consulta, el repositorio no registra descargas ni "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YuNet, red convolucional ligera de deteccion facial); cada convolucion se materializa como `flm.GEMM` sobre NPU |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen empaquetados en el bundle IRON, sin detalle de precision en la informacion proporcionada) |
| Idiomas soportados | no aplica |
| Licencia | MIT (segun la model card; se aplican los terminos del modelo upstream de OpenCV Zoo) |
| Formato de pesos | bundle IRON version 9: `manifest.txt`, `tensors.txt` + `tensors.bin`, y `kernels/` con `.xclbin` mas flujos de instrucciones |
| Tamano del repositorio | 31,7 MB en 40 archivos |
| Destino de compilacion | NPU2 (AIE2P): Strix Point, Strix Halo, Krackan |
| Pipeline declarado | object-detection |
| Contextos hardware | 1 contexto (1 `xclbin`, 36 flujos de instrucciones) |

## Arquitectura y entrenamiento

El modelo subyacente es YuNet, un detector facial convolucional de OpenCV Zoo, pensado para ser ligero y ejecutable en tiempo real. En esta ficha no se dispone de informacion sobre el numero de parametros, la resolucion de entrada, la composicion del dataset de entrenamiento ni el numero de tokens o imagenes usadas, porque la model card publicada solo documenta el proceso de exportacion a NPU y remite al repositorio upstream para los detalles del modelo original.

La innovacion tecnica del artefacto esta en la exportacion: el grafo convolucional se compila a operaciones `flm.GEMM` que se ejecutan sobre un unico contexto hardware de la NPU, descrito por un archivo `.xclbin` y 36 flujos de instrucciones. El bundle sigue el formato compartido de IRON (version 9), con un `manifest.txt` que declara parametros del modelo, el registro de `xclbin` por contexto hardware y los registros de kernels y matrices; los pesos viven en `tensors.txt` y `tensors.bin`. El script `iron/applications/yunet/export_yunet.py` documenta cada registro y tensor, y las entradas `ref.*` contienen una muestra de entrada con sus salidas de referencia para validar el runtime. La compilacion corresponde al commit `44374ca` de IRON.

## Capacidades

- Deteccion de caras en imagenes: el pipeline declarado es `object-detection`, aplicado a rostros humanos segun el modelo upstream YuNet.
- Deteccion facial ligera orientada a tiempo real, heredada del diseno de YuNet en OpenCV Zoo.
- Ejecucion sobre la NPU integrada del SoC, liberando CPU, iGPU y GPU discreta para otras tareas.
- Reproduccion determinista del grafo mediante el runtime Rust de IRON, que releya los flujos de instrucciones compilados.
- Autoverificacion del entorno de ejecucion mediante los tensores `ref.*` incluidos en el bundle.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, vision generativa, audio ni modo de razonamiento: es un modelo discriminativo de vision.
- Capacidades multilingues: no aplica.
- No se documentan variantes de resolucion, multi-escala ni deteccion de landmarks o puntos faciales en la informacion proporcionada.

## Casos de uso

- Desenfoque o sustitucion de fondo en videollamada: detectar la region facial en cada fotograma sobre la NPU permite aplicar el efecto en la CPU/iGPU y mantener la NPU dedicada al pipeline de video, con bajo consumo en portatiles Ryzen AI.
- Indexado y agrupacion de caras en una fototeca local: el detector actua como primera etapa que propone regiones; despues un modelo de reconocimiento facial (por ejemplo, los bundles AdaFace del mismo autor) puede asignar identidades sin salir del dispositivo.
- Control de acceso en un kiosco o torno: deteccion de presencia de rostro antes de invocar un verificador de identidad, evitando ejecutar el reconocimiento cuando no hay cara en el encuadre.
- Analitica de aforo con privacidad por diseno: contar personas mediante deteccion facial en el propio equipo, sin enviar imagenes a un servidor, util en comercio minorista o recintos con requisitos de proteccion de datos.
- Preprocesado en pipelines de vision por computador: usar el detector como etapa de regiones de interes para tareas posteriores (seguimiento, segmentacion, reidentificacion) dentro de una aplicacion que ya corre sobre la NPU.
- Monitorizacion de atencion del conductor en automocion: deteccion facial embarcada en plataformas con Ryzen AI para sistemas de aviso, con la ventaja de no depender de un acelerador dedicado adicional.
- Captura asistida y seleccion de fotografia: marcado automatico de imagenes con rostros para descartar fotos fallidas o priorizar rafagas en un flujo de trabajo de escritorio.
- Filtros de realidad aumentada en aplicaciones de escritorio: localizar la cara como paso previo al anclaje de efectos, apoyandose en la NPU para no cargar la GPU integrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de precision (mAP, WIDER FACE u otras), ni cifras de latencia o throughput sobre NPU2. Lo unico verificable con los datos disponibles es que el bundle contiene tensores de referencia (`ref.*`) para que el runtime compruebe la correccion de la inferencia, no su calidad de deteccion.

## Requisitos de hardware

- Acelerador obligatorio: NPU2 con arquitectura AIE2P, es decir, AMD Ryzen AI de las generaciones Strix Point, Strix Halo o Krackan.
- No es compatible con NPU1 (Phoenix, Hawk Point): los kernels no cargaran en esas plataformas.
- VRAM: no aplica, el modelo se ejecuta sobre la NPU y ocupa 31,7 MB de almacenamiento en disco; el consumo de memoria del sistema depende del runtime y del buffer de entrada.
- GPU: no se documenta ninguna ruta de ejecucion en GPU NVIDIA o AMD discreta, ni en CUDA o ROCm, dentro de este bundle.
- Ejecucion en CPU: no documentada para este artefacto; el modelo upstream de OpenCV Zoo si puede ejecutarse en CPU, pero fuera de este repositorio.
- Consumer: si, en equipos con Ryzen AI de las familias indicadas (portatiles y mini-PC con Strix Point o Strix Halo).
- Opciones de despliegue: runtime Rust de IRON, que reproduce los flujos de instrucciones y los pesos del bundle; descarga mediante `hf download brishen/iron-yunet-npu2 --local-dir yunet` o con `python scripts/hf_models.py download yunet --repo brishen/iron-yunet-npu2 --out yunet` desde un checkout de IRON. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparacion se limita a otros bundles del mismo autor, todos compilados para NPU2 y con el mismo formato de bundle IRON. La informacion disponible no incluye parametros, contexto ni metricas de rendimiento de ninguno de ellos.

| Modelo | Tarea | Destino | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| brishen/iron-yunet-npu2 | Deteccion facial | NPU2 (AIE2P) | MIT | no disponible |
| brishen/iron-adaface-ir18-npu2 | no disponible en la informacion (el nombre sugiere reconocimiento facial con backbone IR-18) | NPU2 (AIE2P) | no disponible | no disponible |
| brishen/iron-adaface-ir101-npu2 | no disponible en la informacion (el nombre sugiere reconocimiento facial con backbone IR-101) | NPU2 (AIE2P) | no disponible | no disponible |
| brishen/iron-sam3-npu2 | no disponible en la informacion (el nombre sugiere segmentacion) | NPU2 (AIE2P) | no disponible | no disponible |
| brishen/iron-taggerine-npu2 | no disponible en la informacion (el nombre sugiere etiquetado) | NPU2 (AIE2P) | no disponible | no disponible |

## Limitaciones y advertencias

- Dependencia estricta de hardware: los kernels solo cargan en NPU2 (AIE2P). En NPU1 (Phoenix, Hawk Point) o en equipos sin NPU XDNA el bundle es inutilizable.
- Modelo de vision discriminativo: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa de uso como modelo de lenguaje es un error de categoria.
- Sesgos: no se documenta informacion sobre la composicion del dataset de entrenamiento de YuNet ni sobre su comportamiento diferencial por tono de piel, genero, edad, oclusiones o condiciones de iluminacion. Es un riesgo relevante en aplicaciones de control de acceso o analitica.
- Riesgo de falsos positivos y falsos negativos: no se publican curvas de precision-recall ni umbrales recomendados para este bundle, por lo que el umbral de confianza debe calibrarse en el caso de uso concreto.
- Privacidad y normativa: la deteccion facial es dato biometrico en el RGPD. El uso en acceso, videovigilancia o analitica requiere base juridica, evaluacion de impacto y, segun el caso, consentimiento explicito. La ejecucion en local reduce la exposicion, pero no exime de obligaciones.
- Restricciones de licencia: el bundle es MIT y remite a los terminos del modelo upstream de OpenCV Zoo, tambien MIT. La licencia no impone restriccion de uso comercial, pero conviene revisar el aviso de los pesos originales y las condiciones de las herramientas de compilacion de AMD.
- Trazabilidad: la compilacion corresponde al commit `44374ca` de IRON, sin indicacion de la version exacta del modelo upstream de OpenCV Zoo utilizada.
- Idiomas: no aplica; el modelo no procesa texto.
- Resolucion de entrada, preprocesado y postprocesado (decodificacion de anclas y NMS) dependen del runtime y del script de exportacion de IRON, no del bundle en si; no se detallan en la informacion disponible.
- Madurez: el repositorio no registra descargas ni valoraciones, y fue publicado el 25 de septiembre de 2026 (actualizado el mismo dia). No hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brishen/iron-yunet-npu2
- Modelo upstream (OpenCV Zoo, deteccion facial YuNet): https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet
- Cadena de herramientas IRON: https://github.com/amd/IRON
- Documentacion de uso del modelo en IRON: `iron/applications/yunet/README.md`
- Script de exportacion de referencia: `iron/applications/yunet/export_yunet.py`
- Otros bundles del mismo autor:
  - https://huggingface.co/brishen/iron-adaface-ir18-npu2
  - https://huggingface.co/brishen/iron-adaface-ir101-npu2
  - https://huggingface.co/brishen/iron-sam3-npu2
  - https://huggingface.co/brishen/iron-taggerine-npu2
