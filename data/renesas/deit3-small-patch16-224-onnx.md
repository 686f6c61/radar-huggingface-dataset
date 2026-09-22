# Renesas/DeiT3-Small-Patch16-224-ONNX

## Resumen

DeiT3-Small-Patch16-224-ONNX es un artefacto de despliegue publicado por Renesas que contiene el modelo DeiT III (Small/16 a 224 px) en formato ONNX, compilado y optimizado para ejecutarse sobre la NPU NPX6-48K integrada en el SoC Renesas R-Car X5H. No se trata de un modelo nuevo entrenado por Renesas, sino de una conversión del checkpoint `timm/deit3_small_patch16_224.fb_in1k`, que a su vez reproduce el recipe DeiT III de Meta AI (paper "DeiT III: Revenge of the ViT", ECCV 2022). El problema que resuelve es el de disponer de un clasificador de imagenes listo para inferencia en hardware embebido de automocion, sin necesidad de reentrenar ni de convertir manualmente los pesos.

La arquitectura es un Vision Transformer estandar con parches de 16x16 sobre entradas de 224x224 y 22,1 millones de parametros, entrenado sobre ImageNet-1k con 1000 clases. La innovacion relevante no esta en el modelo en si, sino en la cadena de despliegue: el artefacto se distribuye en FP32 ONNX (Opset 18) y el toolchain MWMX de Renesas lo convierte automaticamente a INT8 en tiempo de compilacion, por lo que no se publica un fichero INT8 separado.

Su relevancia actual es de nicho pero clara: es un ejemplo de publicacion de modelos orientada al borde (edge), con latencia medida sobre silicio real (7,38 ms por inferencia con batch 1 en una NPU a 850 MHz) y licencia Apache-2.0, lo que facilita su integracion en productos comerciales. No incluye datos de precision (accuracy) publicados en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) DeiT III, patch 16, resolucion 224x224 |
| Parametros totales | 22,1 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de imagen 1x3x224x224, NCHW) |
| Tipos de cuantizacion | FP32 (ONNX publicado); INT8 auto-cast por el toolchain MWMX en tiempo de compilacion |
| Idiomas soportados | No disponible (no aplica; clasificacion de imagenes en ImageNet-1k, 1000 clases) |
| Licencia | Apache-2.0 (segun la model card de timm) |
| Formato de pesos | ONNX (Opset 18), `fp32/deit3_small_patch16_224_Opset18.onnx` |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de la familia DeiT III, con parches de 16x16 pixels sobre imagenes de 224x224. Sigue el recipe revisado de Meta AI publicado en "DeiT III: Revenge of the ViT" (Touvron, Cord, Jegou, ECCV 2022), caracterizado por el uso de 3-Augment como aumento de datos, LayerScale y stochastic depth, y por la eliminacion del token de destilacion que si empleaba el DeiT original. La variante concreta recogida en este repositorio es la Small/16, con 22,1 millones de parametros.

En cuanto a los datos de entrenamiento, el checkpoint de origen fue entrenado por los autores del paper unicamente sobre ImageNet-1k (`.fb_in1k`), segun indica la propia model card de Renesas. Existe una variante relacionada `.fb_in22k_ft_in1k` (preentrenada en ImageNet-22k y afinada en ImageNet-1k), pero el artefacto compilado publicado no lleva el marcador "in22k", por lo que el checkpoint `.fb_in1k` es la coincidencia mejor soportada. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni sobre el numero exacto de tokens o epocas de entrenamiento.

La particularidad tecnica del artefacto es la cadena de compilacion: se parte de un ONNX FP32 que el toolchain MWMX convierte automaticamente a INT8 antes de ejecutarse sobre la NPU NPX6-48K del R-Car X5H. No se describe en la documentacion disponible ninguna tecnica de decodificacion especulativa ni atencion lineal; se trata de un transformer de atencion completa convencional.

## Capacidades

- Clasificacion de imagenes en 1000 clases de ImageNet-1k.
- Inferencia sobre entrada de imagen RGB de 224x224 en formato NCHW.
- Ejecucion acelerada en NPU embebida (NPX6-48K) mediante el runtime MWMX de Renesas.
- Conversion automatica de FP32 a INT8 en tiempo de compilacion, sin paso de cuantizacion manual.
- Distribucion via Hugging Face CLI con descarga selectiva del directorio `fp32/*`.
- No soporta tool calling ni function calling: es un modelo puramente de vision y clasificacion.
- No soporta agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues (no procesa lenguaje natural).
- No dispone de modo "thinking", vision generativa, audio ni ninguna capacidad multimodal mas alla de la clasificacion.

## Casos de uso

- Clasificacion de imagenes en sistemas de automocion: el modelo puede etiquetar fotogramas de camara en 1000 categorias de ImageNet sobre la NPU del R-Car X5H, aprovechando los 7,38 ms de latencia por inferencia a batch 1 para operar cerca de tiempo real.
- Preprocesado y filtrado en pipelines de vision embebida: usar la clasificacion como etapa de cribado previa a modelos mas costosos, descartando fotogramas irrelevantes antes de invocar tareas de deteccion o segmentacion.
- Control de calidad industrial en linea de produccion: clasificar piezas o productos a partir de imagenes capturadas por camaras fijas, con la inferencia ejecutandose localmente en el SoC sin depender de la nube.
- Robotica y automatizacion: dotar a un robot movil de una capacidad basica de reconocimiento de objetos o escenas para la toma de decisiones de navegacion a bajo nivel.
- Sistemas de vigilancia y monitorizacion: clasificar escenas captadas por camaras IP en el propio dispositivo, reduciendo el ancho de banda necesario al enviar solo las etiquetas en lugar de video.
- Prototipado rapido de producto sobre hardware Renesas: validar una idea de clasificacion de imagenes usando el artefacto ONNX ya optimizado, sin tener que convertir ni cuantizar el modelo manualmente.
- Evaluacion comparativa de recipes DeiT III frente a alternativas de CNN en terminos de latencia sobre NPU, sirviendo como referencia para decidir la arquitectura de un producto final.

## Benchmarks y rendimiento

El unico dato de rendimiento publicado en el repositorio es la latencia medida sobre hardware real. La precision del modelo (accuracy sobre ImageNet-1k) figura como "TBD" y no se ha medido ni publicado para este repositorio.

| Parametro | Runtime | Precision | Dispositivo | Latencia (ms) | Tipo |
|---|---|---|---|---|---|
| 22,1 M | MWMX Runtime | INT8 (auto) | X5H, 1 NPU, 1 core, 850 MHz | 7,379658 | Medido |

Condiciones del benchmark: single NPU, batch size 1, resolucion de entrada 224x224 (NCHW 1,3,224,224). Segun la metodologia del repositorio, las pruebas son hardware-in-the-loop sobre silicio fisico R-Car X5H, mediante el pipeline CI `metawaremx_runtime` (objetivo "APM50"). Solo estaba disponible el slice de 1 core de IA; el slice de 12 cores aparece como `Skipped` en la ejecucion de CI de origen para este modelo.

No se han publicado resultados de benchmarks de precision (MMLU, HumanEval, GSM8K ni equivalentes de vision como top-1/top-5 de ImageNet) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: placa Renesas R-Car X5H con NPU NPX6-48K. El runtime necesario es Renesas MWMX.
- VRAM estimada: no aplica en el sentido convencional de GPU; el modelo se ejecuta sobre NPU embebida. Como referencia de tamano, los 22,1 M de parametros equivalen a unos 88 MB en FP32 (4 bytes por parametro) y a unos 22 MB en INT8 (1 byte por parametro). El repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no disponible; el artefacto esta preparado para la NPU NPX6, no para GPUs de escritorio o de centro de datos.
- Compatibilidad con GPU de consumo: no aplica al flujo documentado. El fichero ONNX podria cargarse en runtimes genericos de ONNX, pero la model card solo garantiza y mide el camino MWMX sobre R-Car X5H.
- Opciones de despliegue: runtime nativo MWMX de Renesas (unica ruta documentada y medida). La descarga se realiza con la CLI de Hugging Face (`hf download Renesas/DeiT3-Small-Patch16-224-ONNX --repo-type=model --include "fp32/*"`).
- Latencia y throughput: 7,379658 ms por inferencia con batch 1, 1 NPU, 1 core a 850 MHz. El throughput no se publica de forma explicita; a partir de la latencia medida corresponderia aproximadamente a 135 inferencias por segundo en esa configuracion, aunque el dato no figura en el repositorio.
- Requisitos previos declarados: placa R-Car X5H con NPU NPX6, runtime MWMX y la CLI de Hugging Face para la descarga.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Destino | Precision publicada | Latencia publicada |
|---|---|---|---|---|---|---|
| Renesas/DeiT3-Small-Patch16-224-ONNX | 22,1 M | ONNX (Opset 18), FP32 con auto-cast a INT8 | Apache-2.0 | NPU NPX6-48K en R-Car X5H | No disponible (TBD) | 7,38 ms (medida) |
| timm/deit3_small_patch16_224.fb_in1k | 22,1 M | Safetensors / PyTorch (checkpoint de origen) | Apache-2.0 | GPU/CPU genericos | No disponible en la informacion proporcionada | No disponible |
| timm/deit3_small_patch16_224.fb_in22k_ft_in1k | No disponible | Safetensors / PyTorch | Apache-2.0 | GPU/CPU genericos | No disponible | No disponible |

El artefacto de Renesas comparte arquitectura y numero de parametros con el checkpoint original de timm, del que se deriva. La diferencia principal es el formato (ONNX optimizado) y el hardware objetivo (NPU embebida en lugar de GPU generica), asi como la existencia de una latencia medida sobre silicio real. No se dispone de datos de rendimiento de los checkpoint de timm en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de precision.

## Limitaciones y advertencias

- No se ha publicado la precision (accuracy) del modelo sobre ImageNet-1k; la model card la marca explicitamente como "TBD". Sin ese dato no es posible validar la calidad de la clasificacion tras el auto-cast a INT8.
- El auto-cast de FP32 a INT8 lo realiza el toolchain MWMX sin un paso de calibracion documentado, lo que puede introducir perdida de precision no cuantificada.
- El modelo esta limitado a clasificacion de imagenes en las 1000 clases de ImageNet-1k; no genera texto, no razona y no ejecuta llamadas a herramientas.
- No procesa lenguaje natural, por lo que no tiene capacidades multilingues ni de contexto conversacional.
- El repositorio no registra descargas ni "likes" y no incluye datos de validacion independiente; se trata de un artefacto recien publicado y sin adopcion documentada.
- La ejecucion documentada depende exclusivamente de hardware Renesas (R-Car X5H) y del runtime propietario MWMX; el uso en otras plataformas no esta soportado ni medido.
- El benchmark publicado corresponde a una unica configuracion (1 NPU, 1 core, 850 MHz, batch 1); no hay datos de escalado a 12 cores ni a lotes mayores (el slice de 12 cores figura como `Skipped`).
- En el caso de sesgos: al entrenarse sobre ImageNet-1k, el modelo hereda los sesgos de representacion y las clases propias de ese dataset; no se documenta ningun analisis de sesgo en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza en imagenes fuera de la distribucion de ImageNet.
- Licencia Apache-2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se atribuya correctamente. Al derivar de un checkpoint de timm, conviene verificar las condiciones del modelo de origen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Renesas/DeiT3-Small-Patch16-224-ONNX
- Modelo base en Hugging Face: https://huggingface.co/timm/deit3_small_patch16_224.fb_in1k
- Paper DeiT III: Revenge of the ViT (arXiv:2204.07118): https://arxiv.org/abs/2204.07118
- Renesas (sitio corporativo): https://www.renesas.com/
- Renesas (pagina de productos): https://www.renesas.com/en/products
- Renesas Electronics (Wikipedia, en ingles): https://en.wikipedia.org/wiki/Renesas_Electronics
- Renesas Electronics (Wikipedia, en frances): https://fr.wikipedia.org/wiki/Renesas_Electronics
