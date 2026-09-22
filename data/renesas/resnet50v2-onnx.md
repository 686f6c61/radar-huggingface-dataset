# Renesas/ResNet50V2-ONNX

## Resumen

ResNet50V2-ONNX es un modelo de clasificacion de imagenes publicado por Renesas en Hugging Face, consistente en una implementacion ONNX de ResNet50 V2 (variante de red residual con preactivacion) orientada a la inferencia sobre la plataforma Renesas R-Car X5H y su NPU NPX6. El modelo deriva del modelo base onnxmodelzoo/resnet50-v2-7 del ONNX Model Zoo y cuenta con 25,6 millones de parametros, una cifra que no cambia respecto a la variante v1 pese al cambio de bloque residual.

El repositorio no distribuye pesos INT8: unicamente se proporciona el grafo ONNX en FP32, que la cadena de herramientas MWMX (Middleware MX) convierte automaticamente a INT8 en tiempo de carga o compilacion. El interes practico del artefacto reside en que Renesas publica, junto al modelo, mediciones de latencia reales sobre silicio (hardware-in-the-loop) y estimaciones software mediante su herramienta PPA Estimator, lo que permite evaluar el rendimiento esperado en un NPU embebido antes de disponer fisicamente de la placa.

Se trata, por tanto, de un artefacto de despliegue para vision por computador en el borde (edge), no de un modelo de lenguaje: no tiene ventana de contexto, no soporta tool calling ni generacion de texto. Su relevancia es la de servir como referencia funcional y de rendimiento para pipelines de clasificacion de imagenes sobre hardware Renesas R-Car X5H.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 V2, red residual con preactivacion (bloques residuales pre-activation) |
| Parametros totales | 25,6 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no es un modelo de lenguaje) |
| Tipos de cuantizacion | FP32 en el artefacto distribuido; INT8 aplicado automaticamente por la cadena MWMX o por el PPA Estimator en tiempo de compilacion/carga. No se distribuye ningun fichero INT8 |
| Idiomas soportados | no disponible (no aplica: clasificacion de imagenes) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (fp32/resnet50_v2_sim.onnx) |

Datos adicionales: tamano del repositorio 0,1 GB; pipeline declarado image-classification; modelo base onnxmodelzoo/resnet50-v2-7; fecha de creacion 2026-09-22; fecha de actualizacion 2026-09-22.

## Arquitectura y entrenamiento

La arquitectura es ResNet50 V2, una red neuronal convolucional residual de 50 capas en su variante de preactivacion: la normalizacion por lotes y la activacion se aplican antes de cada convolucion dentro del bloque residual, en lugar de despues de la suma, lo que estabiliza el entrenamiento de redes profundas. El recuento de parametros se mantiene en 25,6 M, identico al de ResNet50 v1. No se ha publicado en la informacion disponible ningun detalle sobre el dataset de entrenamiento (se asume ImageNet de forma inferida, ya que la propia model card indica que el dataset no se declara explicitamente en los datos de origen), el numero de tokens o imagenes vistas, ni si hubo tecnicas de ajuste adicionales como RLHF o DPO, que en cualquier caso no aplican a un clasificador de imagenes.

La innovacion relevante de este repositorio no esta en la arquitectura, sino en el flujo de despliegue: el grafo ONNX FP32 se convierte a INT8 de forma automatica durante el proceso de carga o compilacion, sin un paso separado de cuantizacion a cargo del usuario. El modelo se ejecuta sobre la NPU NPX6-48K integrada en el SoC Renesas R-Car X5H. Se documentan dos rutas de evaluacion independientes: el runtime MWMX, con ejecucion hardware-in-the-loop sobre silicio fisico, y el PPA Estimator, que ofrece una estimacion software de la latencia empleando un reloj de NPU distinto (1066 MHz frente a 850 MHz del entorno medido).

## Capacidades

- Clasificacion de imagenes: tarea principal del modelo (pipeline image-classification), orientada a inferencia sobre la NPU NPX6 de la plataforma R-Car X5H.
- Vision por computador en el borde: ejecucion en un NPU embebido de bajo consumo, con cast automatico de FP32 a INT8 en tiempo de compilacion.
- Extraccion de caracteristicas visuales: al ser una ResNet50 V2, el modelo puede emplearse como backbone convolucional congelado para tareas posteriores de vision, aunque esto no se declara explicitamente en la model card.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no dispone de modo de razonamiento, vision generativa, audio ni procesamiento de texto. Unicamente se documenta la ejecucion del grafo en la NPU del SoC.
- Preprocesado y postprocesado: la model card no especifica la resolucion de entrada empleada en los benchmarks (figura como "no disponible / TBD" en los datos de origen), por lo que la capa de preprocesado debe fijarla el integrador.

## Casos de uso

- Inspeccion industrial automatizada en linea de produccion: el modelo clasifica imagenes de piezas capturadas por camaras industriales directamente en la NPU del R-Car X5H, con una latencia medida de 4,14 ms a 12 nucleos, lo que permite integrarlo en cadenas de fabricacion con requisitos de tiempo real estricto.
- Deteccion de defectos visuales en el borde: al no requerir GPU dedicada ni conectividad a la nube, la clasificacion se realiza localmente, evitando el envio de imagenes de producto a infraestructura externa y reduciendo el coste de red.
- Vision embebida en automocion: la plataforma R-Car X5H esta orientada al sector de la automocion; el modelo puede cubrir tareas auxiliares de clasificacion visual dentro del vehiculo (reconocimiento de escenas, clasificacion de senalizacion, monitorizacion de ocupantes) compartiendo el SoC con otras cargas.
- Analitica de camaras de vigilancia y ciudades inteligentes: clasificacion de fotogramas para conteo, categorizacion de escenas o filtrado previo de eventos, ejecutada en el propio dispositivo y con una sola NPU.
- Robotica movil y AGV: clasificacion visual de objetos o zonas para la toma de decisiones de navegacion, aprovechando la latencia sub-5 ms y el bajo consumo del NPU frente a una GPU.
- Validacion y analisis de rendimiento antes de disponer de hardware: gracias a las cifras del PPA Estimator, un equipo puede dimensionar el numero de nucleos de NPU necesarios (1 frente a 12) y estimar la latencia objetivo antes de adquirir la placa R-Car X5H.
- Prototipado rapido de pipelines de vision sobre ONNX: al ser un modelo ONNX estandar procedente del ONNX Model Zoo, sirve como punto de partida para validar toolchains de compilacion hacia la NPX6 y comparar precisiones FP32 frente a INT8.

## Benchmarks y rendimiento

Resultados publicados en la model card. Configuracion de referencia: 1 NPU, tamano de lote 1, resolucion de entrada no disponible en los datos de origen.

| Runtime | Precision | Dispositivo | Latencia (ms) | Tipo |
|---|---|---|---|---|
| MWMX Runtime | INT8 (auto) | X5H · 1× NPU · 1 nucleo · 850 MHz | 4,605038 | Medida |
| MWMX Runtime | INT8 (auto) | X5H · 1× NPU · 12 nucleos · 850 MHz | 4,140341 | Medida |
| PPA Estimator | INT8 | X5H · 1× NPU · 1 nucleo · 1066 MHz | 2,041042 | Estimada |
| PPA Estimator | INT8 | X5H · 1× NPU · 12 nucleos · 1066 MHz | 0,559915 | Estimada |

Tasas APM reportadas (relacion entre la latencia estimada por software y la latencia medida en hardware para cada configuracion): 44,32 % para 1 nucleo y 13,52 % para 12 nucleos, segun los datos de CI de origen.

Precision del modelo (accuracy) sobre ImageNet u otro conjunto: no disponible. La model card la marca explicitamente como TBD, sin medir ni publicar. No se han publicado resultados de benchmarks de exactitud (top-1, top-5, MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que se trata de un clasificador de imagenes y no de un modelo de lenguaje.

## Requisitos de hardware

- Hardware objetivo declarado: placa Renesas R-Car X5H con NPU NPX6-48K. No es un modelo pensado para GPU de escritorio ni para aceleradores genericos.
- Software obligatorio: Renesas MWMX Runtime (inferencia real hardware-in-the-loop) o la herramienta Renesas PPA Estimator (estimacion software), junto con la CLI de Hugging Face para la descarga.
- VRAM estimada para inferencia: no disponible como dato publicado. Como referencia calculada, un grafo FP32 de 25,6 M de parametros ocupa aproximadamente 102 MB solo en pesos, a los que hay que sumar activaciones; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no aplica. La model card no documenta ejecucion en A100, H100, RTX 4090 ni ninguna otra GPU; el destino es la NPU del SoC R-Car X5H.
- Compatibilidad con GPU de consumo: no documentada en la informacion disponible. El artefacto esta preparado para la toolchain MWMX, no para despliegues estandar en GPU.
- Opciones de despliegue: MWMX Runtime, PPA Estimator. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia medida: entre 4,14 ms y 4,61 ms en hardware real segun configuracion de nucleos; entre 0,56 ms y 2,04 ms en estimacion software. Throughput no publicado (las cifras corresponden a lote 1).
- Consumo y enfriamiento: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Destino | Latencia publicada |
|---|---|---|---|---|---|---|
| Renesas/ResNet50V2-ONNX | 25,6 M | no aplica | ONNX FP32 (INT8 en ejecucion) | apache-2.0 | NPU NPX6 en R-Car X5H | 4,605 ms (1 nucleo) / 4,140 ms (12 nucleos), medidas |
| onnxmodelzoo/resnet50-v2-7 (modelo base) | 25,6 M (misma arquitectura) | no aplica | ONNX | no disponible en la informacion proporcionada | no especificado | no disponible |
| ResNet50 v1 | 25,6 M segun la propia model card (la variante v2 no altera el recuento) | no aplica | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de precision ni de latencia de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento. La diferencia funcional verificable entre este repositorio y el modelo base del ONNX Model Zoo es el empaquetado especifico para la plataforma Renesas, la conversion automatica a INT8 y la publicacion de cifras de latencia sobre hardware R-Car X5H.

## Limitaciones y advertencias

- Precision no verificada: la exactitud del modelo no esta medida ni publicada (TBD en la model card), por lo que no se puede garantizar su idoneidad para una tarea de clasificacion concreta sin una evaluacion propia previa.
- Dependencia de hardware propietario: la inferencia en condiciones reales requiere una placa Renesas R-Car X5H con NPU NPX6 y el runtime MWMX. Sin ese hardware, solo se dispone de estimaciones software.
- Dataset de entrenamiento no declarado: la propia model card indica que el dataset no se especifica en los datos de origen; se infiere ImageNet, pero no esta confirmado. Esto impide conocer la distribucion de clases y los sesgos asociados.
- Resolucion de entrada no documentada: el parametro de resolucion utilizado en los benchmarks figura como no disponible, lo que complica la reproduccion exacta de las cifras de latencia.
- Cuantizacion no reversible por el usuario: el paso a INT8 lo realiza la toolchain de forma automatica; no se distribuye una version INT8 separada ni se documentan los detalles del calibrado, lo que limita el ajuste fino de la cuantizacion.
- Riesgo de alucinacion: no aplica en el sentido habitual de los modelos generativos, pero si existe riesgo de clasificacion erronea con alta confianza, especialmente en dominio distinto al de entrenamiento.
- Alcance muy acotado: es un clasificador de imagenes; no genera texto, no ejecuta razonamiento multi-paso, no soporta tool calling ni procesamiento multilingue.
- Sesgos: no documentados. No hay informacion sobre sesgos demograficos, etnicos o de otro tipo en la model card.
- Uso comercial: la licencia es apache-2.0, que permite uso comercial, pero la ejecucion practica queda condicionada por los terminos de las herramientas y el hardware de Renesas, no cubiertos por la licencia del modelo.
- Metricas de latencia con alcance limitado: todas las cifras corresponden a lote 1 y a una sola NPU; no se publican mediciones con lotes mayores ni en configuraciones multi-NPU.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/Renesas/ResNet50V2-ONNX
- Modelo base: https://huggingface.co/onnxmodelzoo/resnet50-v2-7
- Repositorio ONNX Model Zoo (origen del modelo resnet50-v2-7): https://github.com/onnx/models
- Descarga directa de los pesos ONNX FP32: `hf download Renesas/ResNet50V2-ONNX --repo-type=model --include "fp32/*"`
- Web corporativa de Renesas: https://www.renesas.com/
- Catalogo de productos de Renesas: https://www.renesas.com/en/products
- Renesas Electronics en Wikipedia (ingles): https://en.wikipedia.org/wiki/Renesas_Electronics
- Renesas Electronics en Wikipedia (aleman): https://de.wikipedia.org/wiki/Renesas_Electronics
- Renesas Electronics en Wikipedia (frances): https://fr.wikipedia.org/wiki/Renesas_Electronics

No se han encontrado en la busqueda web enlaces a papers, blogs tecnicos, demos ni repositorios especificos de este modelo mas alla de los anteriores.
