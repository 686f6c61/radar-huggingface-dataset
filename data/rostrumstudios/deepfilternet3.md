# rostrumstudios/deepfilternet3

## Resumen

DeepFilterNet 3 es un modelo de mejora de voz (speech enhancement) en tiempo real que opera en banda completa a 48 kHz y elimina ruido de fondo (zumbidos, ruido de sala, tráfico) por debajo de una grabación de voz sin modificar el habla ni generar voz nueva. Lo desarrollan Hendrik Schröter, Tobias Rosenkranz, Alberto N. Escalante-B. y Andreas Maier (Friedrich-Alexander-Universität Erlangen-Nürnberg), y fue presentado en INTERSPEECH 2023. Esta ficha concreta corresponde a un espejo público publicado por rostrumstudios: un único grafo ONNX de 16,1 MB exportado mediante la ruta torchDF.

El modelo resuelve el problema de la supresión de ruido en producción de audio y vídeo: en lugar de aplicar filtros espectrales clásicos, emplea una red neuronal profunda que estima una máscara compleja sobre el espectro y aplica un filtrado de dominio profundo (deep filtering) para reconstruir la señal limpia. Su relevancia actual radica en que cabe en un único archivo ONNX de 16 MB, se ejecuta en CPU en tiempo real y no requiere GPU, lo que lo hace desplegable en aplicaciones de escritorio y móviles.

La arquitectura combina un extractor de características tipo ERB (bandas auditivas equivalentes) con una red recurrente y una etapa de filtrado profundo multicanal sobre la señal de banda completa. El repositorio no documenta el número de parámetros ni la longitud de contexto en tokens, ya que el modelo opera sobre tramas de audio y no sobre texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal profunda para speech enhancement con extraccion de caracteristicas ERB y filtrado profundo (deep filtering) de banda completa |
| Parametros totales | no disponible (el grafo ONNX ocupa 16.104.687 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por tramas; tasa de muestreo de 48 kHz) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye el grafo ONNX sin variantes cuantizadas) |
| Idiomas soportados | no disponible (independiente del idioma; opera sobre la senal acustica) |
| Licencia | Apache-2.0 (el proyecto original es dual MIT OR Apache-2.0) |
| Formato de pesos | ONNX (`denoiser_model.onnx`, grafo unico) |

## Arquitectura y entrenamiento

DeepFilterNet 3 es una red neuronal profunda para mejora de voz que trabaja en el dominio de la frecuencia. El modelo extrae caracteristicas en una escala ERB (Equivalent Rectangular Bandwidth), que aproxima la resolucion frecuencial del oido humano, y las procesa con capas recurrentes para modelar la evolucion temporal del ruido. Sobre esa representacion, una etapa de filtrado profundo estima coeficientes de filtro complejos que se aplican a la señal de banda completa a 48 kHz, preservando la fase y evitando los artefactos tipicos de los enfoques basados unicamente en mascaras espectrales. El resultado es una señal de voz limpia con la misma estructura temporal y sin alteracion del contenido hablado.

El entrenamiento original se describe en el paper de INTERSPEECH 2023, que enfatiza el diseno perceptualmente motivado y la operacion en tiempo real. El repositorio no detalla el numero de tokens de audio, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables a este tipo de modelo). La innovacion tecnica destacable es la combinacion de banda completa a 48 kHz con filtrado profundo en un modelo lo suficientemente pequeno (16 MB en ONNX) para inferencia en tiempo real sin GPU.

## Capacidades

- Supresion de ruido de fondo (zumbido electrico, ruido de sala, trafico, ruido estacionario y no estacionario) en grabaciones de voz.
- Mejora de inteligibilidad del habla en entornos ruidosos sin modificar las palabras ni sintetizar voz nueva.
- Procesamiento de audio a banda completa con tasa de muestreo de 48 kHz.
- Inferencia en tiempo real sobre CPU mediante el grafo ONNX.
- Integracion como etapa de preprocesado en pipelines de audio (audio-to-audio).
- No realiza generacion de voz, clonacion, transcripcion ni traduccion; es exclusivamente una etapa de limpieza de señal.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Limpieza de grabaciones de voz para podcast y video: se aplica el modelo como etapa previa a la mezcla final para eliminar zumbidos y ruido de sala, manteniendo intacta la locucion original gracias al filtrado de banda completa a 48 kHz.
- Preprocesado en aplicaciones de mensajeria de voz: el grafo ONNX de 16 MB puede embeberse en apps de escritorio o moviles para limpiar notas de voz antes de enviarlas, sin necesidad de GPU.
- Mejora de audio en reuniones y videollamadas: se integra en el pipeline de captura para reducir ruido ambiente antes de la codificacion, con latencia compatible con tiempo real.
- Acondicionamiento de datasets de voz para entrenamiento de ASR: se usa como etapa de limpieza previa para reducir la variabilidad acustica y mejorar la calidad de las transcripciones.
- Restauracion de archivos de audio historicos o de baja calidad: elimina ruido estacionario de grabaciones antiguas antes de su archivado o difusion.
- Postproduccion de doblaje y locucion: limpia tomas grabadas en condiciones suboptimas antes de la edicion, sin alterar la interpretacion del actor de voz.
- Preprocesado en pipelines de analisis forense de audio: mejora la relacion senal-ruido antes de tareas de analisis, manteniendo la integridad de la señal original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el grafo ONNX de 16,1 MB puede ejecutarse en CPU con un consumo de memoria del orden de decenas de MB.
- GPU recomendadas: no necesarias. Cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100) puede acelerar la inferencia, pero no es un requisito.
- Cabe en cualquier GPU consumer e incluso en dispositivos moviles y sistemas embebidos.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integracion directa en aplicaciones de escritorio y moviles; el repositorio no documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de audio).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el modelo esta disenado para operar en tiempo real segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de muestreo | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepFilterNet 3 (este repositorio) | no disponible (ONNX de 16,1 MB) | no aplica (tramas de audio) | 48 kHz | Apache-2.0 (original dual MIT OR Apache-2.0) | ONNX | Hugging Face (espejo) |
| DeepFilterNet 2 | no disponible | no aplica | 48 kHz | MIT OR Apache-2.0 | PyTorch / ONNX | GitHub original |
| RNNoise | no disponible | no aplica | 48 kHz | BSD-3-Clause | C / ONNX | GitHub |
| Demucs (denoise) | no disponible | no aplica | 44,1 kHz | MIT | PyTorch | GitHub |

Los datos de DeepFilterNet 2, RNNoise y Demucs no se han verificado en la informacion proporcionada y se incluyen solo como referencia cualitativa de la categoria; no se dispone de comparativas de rendimiento publicadas en este repositorio.

## Limitaciones y advertencias

- El repositorio es un espejo de un unico archivo ONNX; no incluye el codigo de pre/postprocesado necesario para usar el modelo, que debe obtenerse del proyecto original.
- No se documentan sesgos especificos, pero al ser un modelo acustico puede degradar la voz en grabaciones con musica de fondo, voces superpuestas o ruidos no estacionarios muy similares al habla.
- Riesgo de artefactos o sobre-suavizado en la señal de salida si el ruido se solapa espectralmente con la voz.
- No modifica el contenido hablado, pero tampoco corrige problemas de diccion, reverberacion severa ni clipping.
- La licencia del repositorio es Apache-2.0; el proyecto original es dual MIT OR Apache-2.0, por lo que conviene revisar los terminos del codigo fuente si se redistribuye.
- No es un modelo de lenguaje: no soporta texto, tool calling ni agentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se recomienda verificar la integridad SHA-256 del archivo antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rostrumstudios/deepfilternet3
- Archivo fuente espejo: https://huggingface.co/kimtos-labs/denoiser-dfn3 (commit 888f33c41851d7168ae31c3637c323b9e2f3c2a4)
- Proyecto original DeepFilterNet: https://github.com/Rikorose/DeepFilterNet (commit 7b14b895fe7fc42cab72b4a4c1e49c982bd6404b)
- Ruta de exportacion ONNX torchDF: https://github.com/grazder/DeepFilterNet (commit 408414f2bdb9ed772580558d1c3ec26c5dc002d7)
- Paper (INTERSPEECH 2023): Schröter, H., Rosenkranz, T., Escalante-B., A. N., Maier, A. "DeepFilterNet: Perceptually Motivated Real-Time Speech Enhancement"
- Perfil del autor del espejo: https://huggingface.co/rostrumstudios
