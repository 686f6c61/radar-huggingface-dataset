# moonbox-dev/ProPainter-ONNX

## Resumen

ProPainter-ONNX es una conversión a formato ONNX del modelo ProPainter, desarrollado originalmente por el grupo S-Lab de la Universidad Tecnológica de Nanyang (NTU) y empaquetado por moonbox-dev para su uso en dispositivos locales mediante ONNX Runtime. ProPainter es un sistema de inpainting de vídeo, es decir, de eliminación de objetos y reconstrucción de las regiones ocultas en secuencias de vídeo, que combina estimación de flujo óptico (RAFT) con un transformer de propagación temporal para mantener la coherencia entre fotogramas.

Este repositorio concreto no contiene un modelo de lenguaje ni un modelo generativo de propósito general, sino un conjunto de grafos ONNX que implementan las distintas etapas del pipeline de ProPainter (encoder/decoder de flujo, transformer de propagación, módulo de imagen y red RAFT para flujo óptico). El objetivo es permitir la ejecución en CPU, CUDA y DirectML sin depender de PyTorch, lo que facilita el despliegue en entornos de producción ligeros o en hardware sin soporte completo para el framework original.

La relevancia de este paquete radica en su enfoque práctico: ofrece dos precisiones (fp16 e int8 con cuantización solo de pesos) con métricas de fidelidad respecto al modelo original y tiempos de ejecución medidos en CUDA. El repositorio es pequeño (0,2 GB) y está pensado para integrarse mediante un script `pipeline.py` que gestiona el preprocesado, el bucle de fotogramas y el manejo de máscaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de inpainting de vídeo basado en flujo óptico (RAFT) y transformer de propagación temporal (ProPainter) |
| Parametros totales | no disponible (el repositorio distribuye grafos ONNX por etapas; el mayor es `gen_transformer.onnx` con 66,6 MB en fp16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa secuencias de vídeo; la longitud depende del número de fotogramas y la resolución) |
| Tipos de cuantizacion | fp16 e int8 (cuantización solo de pesos, weight-only) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | s-lab-license-1.0 (licencia "other" según la model card) |
| Formato de pesos | ONNX (grafos separados por etapa: `fc_decoder`, `fc_encoder`, `fc_step_backward`, `fc_step_forward`, `gen_encoder`, `gen_step_backward`, `gen_step_forward`, `gen_transformer`, `img_step`, `raft`) |

## Arquitectura y entrenamiento

ProPainter es un modelo de inpainting de vídeo que combina dos componentes principales: una red de estimación de flujo óptico basada en RAFT, que calcula el movimiento entre fotogramas consecutivos, y un transformer de propagación temporal que propaga la información de las regiones visibles a las regiones enmascaradas a lo largo del tiempo. El pipeline se divide en etapas de encoder/decoder de flujo (`fc_*`), etapas del generador (`gen_*`), un módulo de imagen (`img_step`) y la red RAFT. Esta conversión a ONNX mantiene la estructura del modelo original pero separa cada etapa en un grafo independiente para facilitar su ejecución con ONNX Runtime.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO, ya que se trata de un modelo de visión por computador y no de un modelo de lenguaje. La innovación técnica destacable de esta conversión es la preservación de la fidelidad respecto al modelo PyTorch original, medida mediante PSNR en la región inpintada: en fp16 se alcanza una media de 52,8 / 54,4 dB (peor fotograma 43,6 dB) y en int8 una media de 42,2 / 43,5 dB (peor fotograma 35,8 dB). Además, la versión fp16 reduce el tiempo de ejecución en CUDA a 20,9 / 17,1 segundos por clip, frente a los 39 / 30 segundos del modelo original.

## Capacidades

- Inpainting de vídeo: eliminación de objetos y reconstrucción de regiones ocultas en secuencias de vídeo, manteniendo coherencia temporal entre fotogramas.
- Estimación de flujo óptico mediante RAFT para alinear fotogramas y propagar información.
- Propagación temporal mediante transformer para mantener la consistencia a lo largo de la secuencia.
- Procesamiento de máscaras: el pipeline incluye manejo de máscaras para indicar las regiones a inpintar.
- Ejecución en ONNX Runtime con soporte para CPU, CUDA y DirectML.
- Dos precisiones disponibles: fp16 (mayor fidelidad) e int8 (menor tamaño y menor fidelidad).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step, ya que no es un modelo de lenguaje.
- No dispone de capacidades multilingües ni de modo "thinking", visión general o audio.

## Casos de uso

- Eliminación de objetos en postproducción de vídeo: el pipeline permite borrar elementos no deseados (por ejemplo, logotipos, personas o vehículos) de secuencias y reconstruir el fondo de forma coherente, gracias a la propagación temporal del transformer y al flujo óptico de RAFT.
- Restauración de metraje antiguo: se puede usar para eliminar artefactos, marcas de agua o daños localizados en fotogramas, con la ventaja de que la versión int8 reduce el uso de memoria y permite ejecución en hardware modesto.
- Edición de vídeo en dispositivos locales: al estar empaquetado en ONNX Runtime con soporte para DirectML, se puede integrar en aplicaciones de escritorio Windows sin necesidad de PyTorch, facilitando la edición en tiempo casi real en GPU de consumo.
- Generación de vídeo sintético con regiones ocultas: útil en pipelines de aumento de datos o en la creación de contenido donde se necesita rellenar áreas enmascaradas de forma plausible y temporalmente consistente.
- Investigación en visión por computador: sirve como referencia para comparar implementaciones ONNX frente a PyTorch en tareas de inpainting de vídeo, con métricas de PSNR y tiempos de ejecución ya reportadas.
- Despliegue en entornos con requisitos de licencia específicos: al estar bajo s-lab-license-1.0, se puede evaluar su uso en proyectos académicos o de investigación que acepten los términos de dicha licencia.
- Prototipado rápido en CPU: la versión int8, con grafos más pequeños (por ejemplo, `gen_transformer.onnx` de 34,8 MB), permite probar el pipeline en máquinas sin GPU dedicada, aunque con mayor latencia.

## Benchmarks y rendimiento

| Metrica | fp16 | int8 (weight-only) | Original PyTorch |
|---|---|---|---|
| PSNR medio en región inpintada (clip 1 / clip 2) | 52,8 / 54,4 dB | 42,2 / 43,5 dB | referencia |
| Peor fotograma (PSNR) | 43,6 dB | 35,8 dB | referencia |
| Tiempo por clip en CUDA (clip 1 / clip 2) | 20,9 / 17,1 s | 23,7 / 20,5 s | 39 / 30 s |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval o GSM8K) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,2 GB, y el grafo más grande es `gen_transformer.onnx` con 66,6 MB en fp16 y 34,8 MB en int8, por lo que la huella de memoria es moderada y apta para GPUs de consumo.
- GPU recomendadas: no se especifican modelos concretos; la model card reporta tiempos en CUDA sin detallar la GPU utilizada. Por el tamaño de los grafos, es plausible su ejecución en GPUs consumer como RTX 3060 o superiores, aunque no se confirma.
- ¿Cabe en GPU consumer? Sí, por el tamaño reducido de los grafos (el mayor es de 66,6 MB), es probable que quepa en GPUs con 4 GB o más de VRAM, aunque no se aportan requisitos mínimos oficiales.
- Opciones de despliegue: ONNX Runtime con soporte para CPU, CUDA y DirectML; el repositorio incluye un script `pipeline.py` para orquestar el preprocesado, el bucle de fotogramas y el manejo de máscaras.
- Latencia y throughput estimados: en CUDA, la versión fp16 tarda 20,9 / 17,1 segundos por clip y la int8 23,7 / 20,5 segundos por clip, según la model card. No se dispone de datos para CPU ni para DirectML.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProPainter-ONNX (este) | Inpainting de vídeo (ONNX) | no disponible (grafos por etapa; mayor 66,6 MB fp16) | no aplica | s-lab-license-1.0 | Hugging Face (moonbox-dev) |
| ProPainter original (PyTorch) | Inpainting de vídeo | no disponible | no aplica | s-lab-license-1.0 | GitHub (sczhou/ProPainter) |
| Otros modelos de inpainting de vídeo (p. ej., E2FGVI, FGT) | Inpainting de vídeo | no disponible | no aplica | varía según modelo | Repositorios académicos |

No se dispone de datos comparativos de rendimiento (PSNR, tiempos) frente a E2FGVI o FGT en la información proporcionada, por lo que la comparativa se limita a la disponibilidad y el formato. La principal diferencia de esta versión es su empaquetado en ONNX para ejecución con ONNX Runtime, lo que facilita el despliegue sin PyTorch.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al ser un modelo de visión, puede heredar sesgos de los datos de entrenamiento originales de ProPainter (no disponibles en esta ficha).
- Riesgo de alucinación: en el contexto de inpainting, puede generar contenido plausible pero incorrecto en las regiones ocultas, especialmente en escenas complejas o con movimiento rápido; la métrica de PSNR indica que la versión int8 tiene mayor desviación respecto al original (media 42,2 dB frente a 52,8 dB en fp16).
- Limitaciones de contexto o idioma: no aplica idioma; la longitud de secuencia está limitada por la memoria y el número de fotogramas que se procesen, sin un valor máximo documentado.
- Restricciones de licencia: la licencia s-lab-license-1.0 puede imponer condiciones para uso comercial; es necesario revisar los términos completos antes de utilizarlo en producción.
- Caveats para producción: la versión int8, aunque más pequeña, presenta una fidelidad notablemente inferior (peor fotograma 35,8 dB) y tiempos de ejecución ligeramente mayores en CUDA que fp16; además, no se proporcionan datos de rendimiento en CPU o DirectML, por lo que el despliegue en esos entornos requiere validación propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una conversión reciente y poco validada por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-dev/ProPainter-ONNX
- Repositorio original de ProPainter: https://github.com/sczhou/ProPainter
- Paper de ProPainter (arXiv:2309.03897): https://arxiv.org/abs/2309.03897
- ONNX Runtime: https://onnxruntime.ai/
