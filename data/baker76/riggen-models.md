# baker76/riggen-models

## Resumen

`baker76/riggen-models` es un repositorio de exportaciones ONNX de UniRig, el modelo de rigging automatico desarrollado por VAST-AI Research. UniRig genera un esqueleto (skeleton) y pesos de piel (skin weights) para mallas 3D arbitrarias, lo que permite animar un modelo tridimensional sin intervencion manual. El repositorio no contiene pesos entrenados por el autor: son conversiones de los pesos publicados de UniRig, distribuidas bajo la misma licencia MIT.

La relevancia practica del paquete es que elimina la dependencia de Python y de PyTorch en produccion. Los grafos ONNX estan pensados para ejecutarse sobre ONNX Runtime desde una herramienta de linea de comandos en C++ llamada riggen, y desde la aplicacion Model Maker de Baker76. Esto lo hace util para integrar rigging automatico en pipelines de herramientas nativas, plugins de DCC o servicios backend con requisitos de despliegue ligeros.

El repositorio ocupa 2,9 GB y se divide en cinco ficheros: dos para la rama de esqueleto, dos para la rama de pesos de piel y un binario de embeddings. No hay informacion publicada sobre arquitectura interna, contexto, idiomas ni benchmarks en la informacion disponible; los datos tecnicos se limitan a los tamanos de cada grafo y a su proposito funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (exportacion ONNX de UniRig; arquitectura interna no documentada en la informacion proporcionada) |
| Parametros totales | no disponible (el repo suma 2,9 GB en cinco ficheros; no se desglosa el numero de parametros) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (modelo 3D, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (los ficheros se distribuyen como grafos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`) mas un binario de embeddings (`.bin`) |

Desglose de ficheros del repositorio:

| Fichero | Tamano | Funcion |
|---|---|---|
| `unirig/skel_encoder.onnx` | 217 MB | Esqueleto: codificador de malla |
| `unirig/skel_decoder.onnx` | 1,2 GB | Esqueleto: decodificador de articulaciones |
| `unirig/skel_embed.bin` | 1 MB | Esqueleto: embeddings de tokens |
| `unirig/skin_feat.onnx` | 1,4 GB | Pesos de piel: extraccion de caracteristicas |
| `unirig/skin_head.onnx` | 41 MB | Pesos de piel: cabeza de prediccion |

## Arquitectura y entrenamiento

El repositorio no entrena ni ajusta ningun modelo: son exportaciones de los pesos liberados de UniRig realizadas con los scripts `tools/export_skeleton.py` y `tools/export_skin.py` de la herramienta riggen. Segun la model card, dichos scripts verifican cada grafo exportado contra los modulos originales de UniRig, lo que actua como control de equivalencia funcional entre el modelo PyTorch de referencia y el grafo ONNX.

La arquitectura interna de UniRig (tipo de red, mecanismo de atencion, composicion del dataset de entrenamiento, numero de tokens o mallas vistas, uso de RLHF u otras tecnicas) no se detalla en la informacion disponible. Lo que si se deduce de la estructura del repo es una division en dos etapas: una rama de esqueleto, con codificador de malla, decodificador de articulaciones y embeddings de tokens, y una rama de pesos de piel, con un extractor de caracteristicas y una cabeza de prediccion. La innovacion practica del paquete es el propio formato: inferencia sin Python ni PyTorch, ejecutable sobre ONNX Runtime en entornos C++.

## Capacidades

- Generacion automatica de esqueletos (rigs) para mallas 3D arbitrarias.
- Prediccion de pesos de piel (skin weights) asociados al esqueleto generado.
- Procesamiento de geometria 3D de entrada, no de texto ni de imagenes.
- Ejecucion sobre ONNX Runtime sin dependencias de Python.
- Integracion en herramientas nativas en C++ mediante la CLI riggen.
- Uso desde la aplicacion Model Maker de Baker76.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje.
- Capacidades multilingues: no aplica.
- No se documentan modos especiales (thinking, vision, audio) en la informacion disponible.

## Casos de uso

- Pipeline de rigging en produccion de videojuegos: la rama de esqueleto (`skel_encoder.onnx` + `skel_decoder.onnx`) genera un rig a partir de una malla de personaje, y la rama de piel (`skin_feat.onnx` + `skin_head.onnx`) calcula los pesos, reduciendo el trabajo manual de un rigger en assets secundarios o de prototipado.
- Herramienta de escritorio C++ con ONNX Runtime: integracion de la CLI riggen en un editor propio o en un plugin de DCC, sin arrastrar un entorno Python ni PyTorch al instalador.
- Procesamiento por lotes de bibliotecas de assets: al ser grafos ONNX ejecutables en servidor, se pueden encadenar sobre una cola de mallas para pre-riggear un catalogo antes de la revision humana.
- Prototipado rapido en Model Maker: la aplicacion de Baker76 usa estos mismos ficheros para ofrecer rigging automatico a usuarios finales sin infraestructura de ML.
- Evaluacion y comparacion de tecnicas de rigging automatico: al ser una exportacion fiel de UniRig verificada contra los modulos originales, sirve como referencia reproducible en experimentos que comparan metodos de skinning.
- Despliegue en entornos con restricciones de dependencias: sistemas donde instalar CUDA/PyTorch no es viable pueden ejecutar los grafos con ONNX Runtime (CPU o GPU segun el proveedor de ejecucion disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repo pesa 2,9 GB en disco; la rama de esqueleto suma aproximadamente 1,4 GB de ficheros y la de piel aproximadamente 1,44 GB, pero no se documenta el consumo en memoria de inferencia.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no confirmada; al ejecutarse sobre ONNX Runtime, la viabilidad depende del proveedor de ejecucion (CPU, CUDA, DirectML) y del presupuesto de memoria, que no se detalla.
- Opciones de despliegue: ONNX Runtime (requisito de la libreria declarada), CLI riggen en C++ y la aplicacion Model Maker.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `baker76/riggen-models` (export ONNX de UniRig) | no disponible | no aplica | no disponible | MIT | ONNX, Hugging Face |
| `VAST-AI/UniRig` (original) | no disponible | no aplica | no disponible | MIT | Pesos originales, Hugging Face |
| Otras alternativas de rigging automatico | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el propio UniRig original: misma funcionalidad y licencia, con la diferencia de formato (ONNX sin Python frente a los pesos de referencia) y de tamano de distribucion (2,9 GB en este repo).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no tiene capacidades conversacionales.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto o idioma; esos criterios no aplican a un modelo de geometria 3D, pero tampoco hay evaluacion publicada de calidad del rig generado.
- La calidad del esqueleto y de los pesos de piel depende de UniRig; este repo no anade mejoras ni ajustes.
- El autor declara explicitamente que no ha entrenado ni ajustado nada: cualquier problema de calidad debe atribuirse al modelo base.
- Licencia MIT, que permite uso comercial, pero conviene conservar el aviso de licencia de UniRig (`unirig/LICENSE`) al redistribuir.
- Dependencia de ONNX Runtime y de la compatibilidad de los grafos con la version concreta del runtime; no se documentan versiones minimas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad y sin garantias de mantenimiento.
- Los scripts de exportacion y la verificacion de equivalencia viven en el repositorio de riggen, no en este repo de Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/baker76/riggen-models
- Modelo base UniRig en Hugging Face: https://huggingface.co/VAST-AI/UniRig
- Repositorio de UniRig en GitHub: https://github.com/VAST-AI-Research/UniRig
