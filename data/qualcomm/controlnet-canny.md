# qualcomm/ControlNet-Canny

## Resumen

ControlNet-Canny es una adaptacion del modelo ControlNet orientada a la inferencia en dispositivo (on-device) sobre hardware Qualcomm. Se trata de un modelo de generacion de imagenes condicionada que utiliza Stable Diffusion como generador base y anade una rama de control que recibe una imagen de entrada procesada con el detector de bordes Canny. El resultado es una sintesis de imagen de alta resolucion que respeta la estructura espacial marcada por los bordes de la imagen de control, no solo el prompt de texto. Lo desarrolla Qualcomm y se publica bajo licencia Apache 2.0.

La relevancia de esta ficha no esta en la arquitectura en si (ControlNet es una tecnica consolidada desde 2023, descrita en el paper arXiv:2302.05543), sino en que Qualcomm distribuye artefactos precompilados y optimizados para ejecutar el modelo localmente en chipsets Snapdragon y la familia Dragonwing, sin depender de servidores en la nube. El repositorio ocupa 87,6 GB e incluye binarios preexportados para multiples plataformas y dos runtimes distintos.

La model card no proporciona detalles sobre el numero de parametros, la composicion del dataset de entrenamiento ni resultados de benchmarks. Tampoco declara idiomas soportados. La informacion disponible se centra en el catalogo de artefactos de despliegue (precision w8a16, SDK QAIRT 2.45, ONNX Runtime 1.27.1) y en los chipsets objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet sobre un modelo de difusion (U-Net) basado en Stable Diffusion, con rama de control condicionada por bordes Canny |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es una arquitectura Mixture of Experts) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes, sin ventana de contexto de texto) |
| Tipos de cuantizacion | w8a16 (pesos de 8 bits, activaciones de 16 bits) en los artefactos precompilados; otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (repo base); PRECOMPILED_QNN_ONNX y QNN_CONTEXT_BINARY para despliegue |

## Arquitectura y entrenamiento

ControlNet es una tecnica que congela los pesos de un modelo de difusion preentrenado (en este caso, Stable Diffusion) y entrena una copia paralela de sus bloques de codificacion, conectada mediante capas de convolucion de cero inicializacion. Esta rama adicional aprende a inyectar una condicion espacial, que en la variante Canny son los bordes detectados en una imagen de referencia. El modelo base actua como generador de imagen a partir del prompt de texto, mientras que la rama de control impone la geometria y las siluetas. La model card indica que la implementacion de referencia es la de lllyasviel/ControlNet.

Los detalles concretos de entrenamiento (numero de tokens o de pares imagen-texto, composicion del dataset, uso de RLHF o DPO, o cualquier innovacion adicional) no estan disponibles en la informacion proporcionada. Tampoco se especifica la version exacta de Stable Diffusion utilizada como base. Lo que si documenta el repositorio es el proceso de optimizacion: el modelo se compila y perfila mediante Qualcomm AI Hub Workbench y se exporta con cuantizacion w8a16 para el runtime QNN de Qualcomm, en formato ONNX precompilado o como context binary propietario.

## Capacidades

- Generacion de imagenes texto a imagen guiada por una imagen de control de bordes Canny.
- Control estructural preciso: la salida respeta los contornos, siluetas y lineas definidas por la imagen de entrada, ademas del contenido descrito en el prompt.
- Sintesis on-device: el modelo esta disenado para ejecutarse localmente en dispositivos con chipsets Qualcomm, sin conexion a un servidor.
- Etiquetado con la pipeline `unconditional-image-generation`, aunque su funcion documentada es la generacion condicionada por texto e imagen de control.
- Despliegue multi-plataforma: se distribuyen binarios especificos para Snapdragon X2 Elite, X Elite, 8 Gen 3, 8 Elite, 8 Elite Gen 5, 7 Gen 4, Dragonwing IQ-8275, QCS8550, Q-6690, IQ-9075 y SA8775P.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes ni procesamiento de audio o vision de alto nivel mas alla del condicionamiento por imagen.

## Casos de uso

- Edicion de imagen en aplicaciones moviles: un usuario dibuja o carga una silueta y el modelo genera una imagen final que respeta esos contornos, ejecutandose directamente en el telefono sin enviar datos a la nube.
- Prototipado de diseno de producto: a partir de un boceto lineal (bordes Canny extraidos del croquis), generar variaciones fotorrealistas de un objeto manteniendo su geometria.
- Generacion de assets para videojuegos: convertir lineas de contorno de personajes u objetos en ilustraciones texturizadas, con la estructura fijada por el boceto original.
- Aplicaciones de privacidad estricta: al ejecutarse on-device, permite generar imagenes a partir de fotos personales sin que estas salgan del dispositivo.
- Herramientas de arquitectura e interiorismo: dada una planta o un esquema de bordes de una estancia, generar renders manteniendo la distribucion y las proporciones.
- Automatizacion en flujos de diseno grafico: integrado en una app de escritorio con chipset Qualcomm, aplicar un estilo coherente a partir de plantillas de bordes reutilizables.
- Demostraciones y evaluacion de hardware: servir como carga de trabajo representativa para medir rendimiento de NPU y memoria en nuevos chipsets Snapdragon o Dragonwing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion de "performance summary" y el uso de Qualcomm AI Hub Workbench para compilar, perfilar y evaluar el modelo, pero no incluye cifras concretas de latencia, throughput, FID, CLIP score ni metricas comparables en el material proporcionado.

## Requisitos de hardware

- Disenado especificamente para aceleracion en NPU de Qualcomm: Snapdragon X2 Elite, Snapdragon X Elite, Snapdragon 8 Gen 3, Snapdragon 8 Elite, Snapdragon 8 Elite Gen 5, Snapdragon 7 Gen 4, Dragonwing IQ-8275, QCS8550, Q-6690, IQ-9075 y SA8775P.
- Precision de despliegue documentada: w8a16 (pesos de 8 bits, activaciones de 16 bits).
- Entornos de ejecucion soportados en los artefactos precompilados: PRECOMPILED_QNN_ONNX (QAIRT 2.45, ONNX Runtime 1.27.1) y QNN_CONTEXT_BINARY (QAIRT 2.45).
- VRAM/RAM estimada para inferencia: no disponible.
- GPU de servidor recomendadas (A100, H100, RTX 4090): no disponibles; el modelo esta orientado a inferencia en dispositivo, no a despliegue en GPU de centro de datos.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no aplicables ni documentadas para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Condicionamiento | Licencia | Orientacion |
|---|---|---|---|---|
| qualcomm/ControlNet-Canny | Stable Diffusion | Bordes Canny | Apache 2.0 | Inferencia on-device en chipsets Qualcomm |
| lllyasviel/ControlNet (Canny) | Stable Diffusion | Bordes Canny | Apache 2.0 | Inferencia general en GPU |
| Otras variantes de ControlNet (Depth, Pose, Scribble, etc.) | Stable Diffusion | Profundidad, pose, garabato, etc. | Apache 2.0 | Inferencia general en GPU |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada. La diferencia principal respecto a la implementacion original de lllyasviel es la optimizacion y el empaquetado para hardware Qualcomm (cuantizacion w8a16, runtimes QNN/ONNX, binarios por chipset), no cambios en el algoritmo de control.

## Limitaciones y advertencias

- No se declara la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos demograficos, culturales o de estilo heredados del modelo base.
- Como modelo generativo de difusion, existe riesgo de producir contenido inexacto, artefactos o resultados incoherentes con el prompt; el condicionamiento por bordes reduce la deriva estructural, pero no la elimina.
- La calidad y el estilo de las imagenes generadas dependen del modelo base de Stable Diffusion subyacente, cuyos pesos y licencia especifica no se detallan en la model card; conviene verificar la licencia del checkpoint base antes de un uso comercial.
- La licencia declarada es Apache 2.0, pero al derivar de Stable Diffusion podrian aplicarse condiciones adicionales del modelo base; la model card no aclara este punto.
- No se especifican idiomas soportados para los prompts de texto; el comportamiento multilingue es incierto.
- El modelo esta optimizado para chipsets Qualcomm concretos; fuera de ese hardware la ejecucion puede no ser viable o requerir reexportacion con Qualcomm AI Hub Models.
- El repo (87,6 GB) incluye multiples artefactos por plataforma; no es un unico fichero de pesos ligero.
- No se publican cifras de rendimiento, latencia ni consumo energetico, lo que dificulta estimar su viabilidad en un producto antes de probarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/ControlNet-Canny
- Qualcomm AI Hub Models (repositorio, rama v0.62.2): https://github.com/qualcomm/ai-hub-models/blob/v0.62.2/src/qai_hub_models/models/controlnet_canny
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Implementacion original de ControlNet (lllyasviel): https://github.com/lllyasviel/ControlNet
- Paper de ControlNet (arXiv:2302.05543): https://arxiv.org/abs/2302.05543
- Web oficial de Qualcomm: https://www.qualcomm.com/
