# GamutPhoto/gamut-models

## Resumen

GamutPhoto/gamut-models no es un modelo de lenguaje, sino un repositorio de cuatro modelos de vision por computador en formato ONNX que la aplicacion de escritorio Gamut utiliza para generar mascaras de sujeto, cielo y profundidad. El repositorio lo publica el autor GamutPhoto como copia sin modificar de pesos ya existentes, con el objetivo de que todas las instalaciones de Gamut descarguen exactamente los mismos ficheros verificables por checksum. La inferencia se ejecuta en el equipo del usuario y no se envia ninguna fotografia a servidores externos.

Los cuatro componentes cubren tareas complementarias: segmentacion dicotomica de sujeto de alta resolucion (BiRefNet lite, de Peng Zheng et al.), segmentacion interactiva por indicacion del usuario (SAM 2.1 Hiera tiny, de Meta), estimacion de profundidad monoculo (Depth Anything V2 Small, de Lihe Yang et al.) y segmentacion de cielo basada en arquitectura U²-Net (xiongzhu666). Cada fichero conserva su licencia original (MIT o Apache-2.0) y no se ha relicenciado nada.

Es relevante ahora porque ejemplifica el patron de distribucion de modelos de vision en local para aplicaciones de consumo: pesos ONNX pequenos, sin dependencia de nube y con trazabilidad de origen y licencia. El repositorio completo ocupa 0,6 GB y no registra descargas ni interacciones en el momento de la consulta. No se declaran recuentos de parametros, contexto, idiomas ni cuantizaciones en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogeneo: BiRefNet (transformer jerarquico de referencia bilateral para DIS), SAM 2.1 con codificador Hiera tiny, Depth Anything V2 Small (DPT/monocular depth) y U²-Net para segmentacion de cielo |
| Parametros totales | no disponible (no declarado en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelos de vision, sin ventana de texto) |
| Tipos de cuantizacion | no disponible; se distribuyen ficheros ONNX sin precision declarada |
| Idiomas soportados | no disponible; las indicaciones de SAM 2.1 son puntos o cajas, no lenguaje natural |
| Licencia | Mixta: MIT (BiRefNet lite, skyseg) y Apache-2.0 (SAM 2.1 Hiera tiny, Depth Anything V2 Small); etiqueta del repositorio `license:other` / `license_name: mixed` |
| Formato de pesos | ONNX (`.onnx`) |
| Tamano del repositorio | 0,6 GB |
| Tareas declaradas (pipeline) | `depth-estimation`, `image-segmentation` |
| Descargas / likes | 0 / 0 |

Desglose por fichero:

| Fichero | Tarea | Modelo y autores | Origen | Licencia |
|---|---|---|---|---|
| `birefnet_lite.onnx` | Segmentacion del sujeto principal | BiRefNet (lite), Peng Zheng et al. | `onnx-community/BiRefNet_lite-ONNX` (conversion ONNX de `ZhengPeng7/BiRefNet_lite`) | MIT |
| `sam2.1_hiera_tiny_encoder.onnx`, `sam2.1_hiera_tiny_decoder.onnx` | Segmentacion interactiva a partir de la indicacion del usuario | Segment Anything 2.1 (Hiera tiny), Meta | `vietanhdev/segment-anything-2.1-onnx-models`, exportado con samexporter por Viet-Anh Nguyen | Apache-2.0 |
| `depth_anything_v2_small.onnx` | Mapa de profundidad relativa | Depth Anything V2 Small, Lihe Yang et al. | `onnx-community/depth-anything-v2-small` | Apache-2.0 |
| `skyseg.onnx` | Segmentacion de cielo | Sky segmentation de xiongzhu666 (arquitectura U²-Net, Qin et al.) | `JianyuanWang/skyseg`, procedente de `xiongzhu666/Sky-Segmentation-and-Post-processing` | MIT |

## Arquitectura y entrenamiento

No hay informacion de entrenamiento propia en el repositorio: se trata de copias sin modificar de modelos ya publicados, por lo que los detalles de dataset, numero de tokens o imagenes, y proceso de ajuste (si lo hubo) corresponden a los trabajos originales, no a este repositorio. BiRefNet es una arquitectura de segmentacion dicotomica de alta resolucion basada en referencias bilaterales; SAM 2.1 emplea un codificador de imagen Hiera y un decodificador de mascaras que acepta indicaciones (puntos, cajas) y soporta propagacion en video; Depth Anything V2 Small es un modelo de profundidad monoculo de tipo DPT entrenado sobre datos sinteticos y reales; skyseg usa la arquitectura U²-Net de deteccion de objetos sobresalientes aplicada al cielo.

La innovacion tecnica relevante aqui no esta en los pesos, sino en el empaquetado: separacion del codificador y el decodificador de SAM 2.1 en dos ficheros ONNX para permitir cachear el embedding de imagen y reutilizarlo entre indicaciones sucesivas, y eleccion deliberada de variantes pequenas (BiRefNet lite, Hiera tiny, Depth Anything V2 Small) para que la inferencia quepa en hardware de consumidor. Segun la model card, solo la variante Small de Depth Anything V2 es Apache-2.0; las variantes Base, Large y Giant son CC-BY-NC-4.0 y no se usan.

## Capacidades

- Segmentacion de sujeto principal sin indicacion previa (BiRefNet lite), orientada a recorte y mascara de primer plano.
- Segmentacion interactiva guiada por el usuario (SAM 2.1 Hiera tiny): seleccion del objeto concreto que la persona senala, con codificador y decodificador separados.
- Estimacion de profundidad monoculo (Depth Anything V2 Small) para generar mapas de cerca/lejos.
- Segmentacion semantica de cielo (skyseg) para reemplazo o tratamiento del fondo en fotografias de exterior.
- Ejecucion 100% local: los modelos se descargan solo cuando el usuario activa las mascaras y ninguna imagen sale del equipo.
- Distribucion de pesos en ONNX, portable a distintos runtimes y backends sin depender de PyTorch en produccion.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes, multilingue, vision-lenguaje, audio ni modo de razonamiento. Las indicaciones de SAM 2.1 son geometricas, no en lenguaje natural.

## Casos de uso

- Recorte de retrato y fotografia de producto: BiRefNet lite genera la mascara del sujeto sin intervencion del usuario, lo que permite automatizar fondos en catalogos de e-commerce o lotes de imagenes.
- Seleccion precisa de un objeto concreto: SAM 2.1 Hiera tiny permite que el usuario indique con un punto o una caja que elemento quiere aislar, util en herramientas de retoque cuando la mascara automatica captura varios objetos.
- Desenfoque de fondo y efecto bokeh: el mapa de profundidad de Depth Anything V2 Small permite aplicar desenfoque selectivo segun distancia estimada en fotografias sin metadatos de profundidad.
- Reemplazo de cielo en paisajismo y fotografia inmobiliaria: skyseg aisla la region de cielo para sustituirla o graduarla manteniendo el resto de la escena.
- Composicion 2.5D y parallax: combinando la mascara de sujeto con el mapa de profundidad se puede generar desplazamiento de camara simulado a partir de una sola imagen.
- Aplicaciones de escritorio con privacidad estricta: al ejecutarse todo en el equipo del usuario, encaja en flujos de trabajo con imagenes medicas, legales o personales donde no se permite subir ficheros a la nube.
- Procesamiento por lotes en servidor de bajo coste: al ser ficheros ONNX pequenos y ligeros, pueden desplegarse en contenedores sin GPU dedicada para tareas de preprocesado o generacion de miniaturas.
- Pipelines de vision dentro de una aplicacion mayor: el formato ONNX facilita la integracion en C++, C#, Java o JavaScript mediante ONNX Runtime u onnxruntime-web, sin arrastrar dependencias de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de IoU, F1, RMSE de profundidad ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio completo ocupa 0,6 GB, de modo que cada componente individual es de decenas o cientos de megabytes, pero la model card no declara el desglose por fichero ni la precision de los pesos.
- Dado ese tamano, es razonable esperar que los cuatro modelos quepan en GPU de consumo con 4-8 GB de VRAM e incluso en CPU, aunque no hay confirmacion oficial en la informacion proporcionada.
- GPU recomendadas: no disponible. La seleccion de variantes ligeras (lite, tiny, small) apunta a hardware modesto, pero no se especifican modelos concretos.
- Despliegue: formato ONNX, compatible con ONNX Runtime en escritorio y servidor, y con onnxruntime-web (WASM y WebGPU) en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de vision de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de rendimiento, por lo que la comparacion es cualitativa y basada en la informacion de la model card y en el conocimiento de la familia de cada componente.

| Componente | Alternativa de la misma familia | Diferencia declarada o relevante |
|---|---|---|
| BiRefNet lite | BiRefNet completo (ZhengPeng7/BiRefNet) | La variante lite prioriza velocidad y tamano reducido; no se declaran cifras comparativas de calidad |
| SAM 2.1 Hiera tiny | SAM 2.1 en variantes mayores (base, large) | La variante tiny reduce coste de inferencia a cambio de precision; la model card no aporta metricas |
| Depth Anything V2 Small | Depth Anything V2 Base, Large y Giant | Small es la unica variante con licencia Apache-2.0; Base, Large y Giant son CC-BY-NC-4.0, por lo que no son aptas para uso comercial sin permiso |
| skyseg (U²-Net) | Otros modelos de segmentacion de cielo | No se declaran comparativas de IoU ni de velocidad frente a alternativas |

No se han proporcionado resultados de benchmarks que permitan comparar numericamente con modelos de la misma categoria.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no mantiene conversaciones, no soporta tool calling ni agentes. Cualquier ficha que lo presente como tal seria erronea.
- No se declaran sesgos especificos, pero al ser modelos de vision heredan los sesgos de sus datasets originales (composicion demografica, tipos de escena, condiciones de iluminacion), que no se detallan en este repositorio.
- Riesgo de mascara incorrecta: en imagenes con varios sujetos, pelo fino, transparencias, cristales o bordes de bajo contraste, la segmentacion puede fallar o incluir halos. La model card no documenta tasas de error.
- El mapa de profundidad es relativo, no metrico: no debe usarse para mediciones de distancia reales sin calibracion externa.
- La segmentacion de cielo puede confundirse con superficies de color similar (agua, paredes claras, nieve) si la escena se aleja de los casos de entrenamiento.
- Licencia mixta: el repositorio se etiqueta como `license:other` con `license_name: mixed`. Cada fichero mantiene su licencia original (MIT o Apache-2.0) y los creditos de sus autores. Antes de redistribuir o integrar comercialmente hay que verificar fichero por fichero y respetar los avisos incluidos (`LICENSE-BiRefNet.txt`, `LICENSE-Apache-2.0.txt`, `LICENSE-skyseg.txt`).
- Advertencia explicita de la model card: solo la variante Small de Depth Anything V2 es Apache-2.0; las variantes Base, Large y Giant son CC-BY-NC-4.0 y no se incluyen aqui. Usar esas variantes en productos comerciales requeriria otra licencia.
- El repositorio no declara idiomas, cuantizaciones ni versiones de ONNX Runtime compatibles, lo que obliga a validar la integracion en cada entorno.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de adopcion ni de validacion por parte de la comunidad.
- Los resultados de busqueda web asociados a esta consulta no guardan relacion con el modelo y no se han utilizado como fuente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/GamutPhoto/gamut-models
- Conversion ONNX de BiRefNet lite: https://huggingface.co/onnx-community/BiRefNet_lite-ONNX
- Modelo original BiRefNet lite: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Exportaciones ONNX de SAM 2.1: https://huggingface.co/vietanhdev/segment-anything-2.1-onnx-models (herramienta samexporter, de Viet-Anh Nguyen)
- Conversion ONNX de Depth Anything V2 Small: https://huggingface.co/onnx-community/depth-anything-v2-small
- skyseg: https://huggingface.co/JianyuanWang/skyseg
- Origen de skyseg: https://github.com/xiongzhu666/Sky-Segmentation-and-Post-processing
- Zheng et al., *Bilateral Reference for High-Resolution Dichotomous Image Segmentation*, CAAI AIR 2024
- Ravi et al., *SAM 2: Segment Anything in Images and Videos*, ICLR 2025
- Yang et al., *Depth Anything V2*, NeurIPS 2024
- Qin et al., *U²-Net: Going Deeper with Nested U-Structure for Salient Object Detection*, Pattern Recognition 2020
