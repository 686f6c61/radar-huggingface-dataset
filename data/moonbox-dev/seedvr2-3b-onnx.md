# moonbox-dev/SeedVR2-3B-ONNX

## Resumen

SeedVR2-3B-ONNX es una exportación a formato ONNX del modelo SeedVR2-3B desarrollado por ByteDance Seed, un modelo de difusión de un solo paso para restauración y superresolución de vídeo. Esta versión, publicada por moonbox-dev, reempaqueta los pesos originales en grafos ONNX ejecutables con ONNX Runtime en CPU, CUDA y DirectML, con el objetivo de facilitar el despliegue en dispositivos locales sin depender del stack de PyTorch.

El modelo base es un transformer de difusión (NaDiT) de aproximadamente 3.000 millones de parámetros que predice el latente limpio a partir del ruido en un único paso de difusión (t = 1000, guidance 1), condicionado por los fotogramas codificados por un VAE. La exportación incluye cinco grafos ONNX (encoder VAE, decoder VAE y el DiT) más un script `pipeline.py` en numpy que reproduce la lógica del script oficial `inference_seedvr2_3b.py`.

La relevancia de esta ficha radica en que ofrece una alternativa de despliegue portable (ONNX Runtime) para una tarea de restauración de vídeo que normalmente requiere PyTorch y GPU. El repositorio ocupa 11,3 GB e incluye dos precisiones: fp16 y int8 (con MatMuls de 8 bits en el DiT).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (NaDiT) con atención ventaneada (dos disposiciones de ventana alternadas) + VAE causal para codificación y decodificación |
| Parametros totales | ~3B (modelo base SeedVR2-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo, sin contexto textual) |
| Tipos de cuantizacion | fp16 e int8 (MatMuls de 8 bits en el DiT) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (grafos `.onnx` + `.onnx.data`), con `pipeline.py` en Python |

## Arquitectura y entrenamiento

El modelo base SeedVR2-3B es un transformer de difusión de un solo paso (one-step diffusion) para restauración y superresolución de vídeo. La arquitectura NaDiT emplea atención ventaneada con dos disposiciones de ventana que se alternan, lo que permite procesar fotogramas de vídeo de forma eficiente en memoria. El pipeline consta de tres etapas: un encoder VAE causal que codifica los fotogramas en rodajas causales (5 fotogramas, luego 4 por rodaja), el DiT que predice el latente limpio desde el ruido en un único paso condicionado por los fotogramas codificados, y un decoder VAE causal que decodifica en rodajas (2 latentes, luego 1 por rodaja). El embedding de texto positivo del repositorio original está horneado dentro del grafo del DiT.

La exportación a ONNX reproduce el script oficial `inference_seedvr2_3b.py`: un paso de difusión en t = 1000, guidance 1, y sin corrección de color (el `color_fix.py` del script no está incluido en el repositorio). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Restauración de vídeo: elimina ruido, artefactos de compresión y degradaciones en secuencias de vídeo.
- Superresolución de vídeo: aumenta la resolución espacial de fotogramas de baja calidad.
- Procesamiento por fotogramas con máscaras: el pipeline maneja máscaras para delimitar regiones a restaurar.
- Difusión de un solo paso: genera la salida en una única evaluación del DiT, lo que reduce el coste computacional frente a modelos de difusión multi-paso.
- Ejecución multiplataforma vía ONNX Runtime: soporta CPU, CUDA y DirectML.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingües: no aplicable.

## Casos de uso

- Restauración de archivos audiovisuales: el modelo puede procesar secuencias de vídeo degradadas (ruido, artefactos de compresión) y devolver fotogramas restaurados, adecuado para digitalización de material histórico o de baja calidad.
- Superresolución de vídeo en local: al ejecutarse con ONNX Runtime en CPU, CUDA o DirectML, permite aumentar la resolución de clips en estaciones de trabajo sin GPU dedicada o en entornos Windows con DirectML.
- Preprocesado para pipelines de visión por computador: restaurar fotogramas antes de tareas de detección, segmentación o seguimiento mejora la calidad de entrada y puede reducir falsos positivos.
- Mejora de vídeo generado por IA: los clips sintéticos suelen presentar artefactos; SeedVR2 puede emplearse como paso de postprocesado para limpiar y estabilizar la salida.
- Despliegue en aplicaciones de escritorio: la exportación ONNX con `pipeline.py` en numpy facilita integrar la restauración en aplicaciones nativas sin dependencia de PyTorch.
- Procesamiento por lotes en servidores con CUDA: el grafo ONNX puede ejecutarse con ONNX Runtime en GPU para restaurar múltiples clips en paralelo, con la ventaja de portabilidad del formato.
- Investigación en restauración de vídeo: la disponibilidad de grafos ONNX con precisión fp16 e int8 permite comparar el impacto de la cuantización en la calidad de salida (PSNR medido frente al original).

## Benchmarks y rendimiento

Los datos disponibles comparan la salida ONNX con la del modelo PyTorch original en los mismos clips y máscaras, medidos en PSNR:

| Precision | PSNR medio | Peor fotograma | Tiempo por clip (CUDA) |
|---|---|---|---|
| fp16 | 40,8 / 33,3 dB | 40,5 / 32,9 dB | ~25 s (incluye arranque de proceso/sesión; original 6 s) |
| int8 | 40,4 / 33,2 dB | 40,1 / 32,8 dB | ~24 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 11,3 GB en total. El DiT en fp16 pesa 6,69 GB y en int8 3,56 GB; los grafos VAE suman aproximadamente 1 GB.
- GPU recomendadas: no disponible en la información proporcionada; el autor reporta tiempos en CUDA (~25 s por clip en fp16, ~24 s en int8).
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del DiT en fp16 (6,69 GB) sugiere que podría caber en GPUs con 8 GB o más de VRAM, pero no se dispone de datos oficiales.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) mediante el `pipeline.py` incluido.
- Latencia y throughput: ~25 s por clip en fp16 y ~24 s en int8 en CUDA, incluyendo arranque de proceso y sesión; el modelo PyTorch original tarda ~6 s por clip.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| SeedVR2-3B-ONNX (este) | ~3B | ONNX (fp16/int8) | apache-2.0 | Exportación ONNX para ONNX Runtime; PSNR medio 40,8 dB en fp16 frente al original |
| SeedVR2-3B (ByteDance-Seed) | ~3B | PyTorch (safetensors) | apache-2.0 | Modelo original; ~6 s por clip en CUDA |
| Otros modelos de restauración de vídeo | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No incluye corrección de color: el `color_fix.py` del script original no está en el repositorio, por lo que la salida puede presentar desviaciones de color respecto al vídeo de entrada.
- El pipeline replica un único paso de difusión (t = 1000, guidance 1) con el embedding de texto positivo horneado; no permite condicionamiento textual variable.
- La cuantización int8 introduce una ligera pérdida de calidad (PSNR medio 40,4 dB frente a 40,8 dB en fp16).
- El rendimiento en CUDA es notablemente inferior al del modelo PyTorch original (~25 s frente a ~6 s por clip), probablemente por el arranque de sesión y la sobrecarga de ONNX Runtime.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas, al no ser un modelo de lenguaje.
- Licencia apache-2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base ByteDance-Seed/SeedVR2-3B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria amplia.
- No se dispone de información sobre el dataset de entrenamiento ni sobre posibles sesgos en la restauración de rostros o contenidos sensibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/SeedVR2-3B-ONNX
- Modelo base: https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- Paper (arXiv:2506.05301): https://arxiv.org/abs/2506.05301
