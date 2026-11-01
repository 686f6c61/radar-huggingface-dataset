# manateelazycat/Nemotron-3.5-Transcribe-AIPod-HF

## Resumen

Nemotron-3.5-Transcribe-AIPod-HF es un modelo de reconocimiento automático del habla (ASR) publicado en HuggingFace por el usuario manateelazycat, con un total de 783.857.231 parámetros y un tamaño de repositorio de 24,6 GB. El pipeline declarado es `automatic-speech-recognition` y los pesos se distribuyen en formato GGUF, lo que apunta a un uso orientado a inferencia local o en dispositivos con recursos limitados mediante cuantización.

La model card describe la versión 0.2.0 como una iteración centrada en la robustez del runtime: recuperación acotada ante paradas falsas del mecanismo de guarda contra repeticiones, streaming SSE con prefijos consistentes y fallos explícitos cuando la transcripción queda incompleta. El autor indica que las imágenes de runtime no contienen pesos y que se emplea el toolchain CUDA original de cada dispositivo.

Se trata de un artefacto con muy poca tracción (0 descargas, 0 likes) y documentación escasa, por lo que gran parte de las especificaciones habituales (idiomas, contexto, datos de entrenamiento, benchmarks) no están disponibles en la información proporcionada. La licencia es OpenMDW-1.1, una licencia de pesos de modelo abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de reconocimiento automático del habla; la model card menciona pesos de encoder e IQ4_NL) |
| Parametros totales | 783.857.231 |
| Parametros activos | no aplica (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantización IQ4_NL en los pesos del encoder (según la model card) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo de ASR con un componente de encoder cuyos pesos se distribuyen cuantizados en IQ4_NL. La model card menciona que los pesos del encoder y las dependencias correspondientes permanecen fijados a los commits públicos verificados de la versión 0.1.0, reutilizados en esta 0.2.0.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado. La innovación técnica destacada en la model card es de naturaleza de runtime: recuperación acotada («bounded recovery») ante paradas falsas del guarda de repeticiones, streaming SSE con prefijos consistentes y notificación explícita de transcripciones incompletas. El autor aclara que esta etapa no constituye una aceptación final completa del LPK (presumiblemente un formato de empaquetado propio).

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto).
- Streaming de resultados mediante SSE (Server-Sent Events) con prefijos consistentes, según la model card.
- Recuperación acotada ante paradas falsas del mecanismo de guarda contra repeticiones.
- Detección y reporte explícito de transcripciones incompletas como fallo.
- Inferencia con pesos cuantizados en formato GGUF (cuantización IQ4_NL del encoder).
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Vision, audio de entrada más allá del propio ASR, thinking mode: no disponibles.

## Casos de uso

- Transcripción de podcasts y contenido largo: el modelo está empaquetado como «AIPod» y el pipeline ASR permite convertir audio hablado en texto; el streaming SSE facilita mostrar la transcripción en tiempo real mientras se procesa el audio.
- Subtitulado en directo de emisiones: el soporte de SSE con prefijos consistentes permite emitir fragmentos de texto conforme llegan, adecuado para generar subtítulos incrementales.
- Integración en pipelines de post-procesado de audio: al distribuirse en GGUF y con cuantización IQ4_NL, puede desplegarse en entornos con memoria limitada mediante runtimes compatibles con GGUF.
- Sistemas de actas y notas de reuniones: la detección explícita de transcripciones incompletas permite al sistema marcar tramos no transcritos en lugar de entregar texto truncado silenciosamente.
- Procesamiento por lotes de archivos de audio en servidores con GPU: el toolchain CUDA original por dispositivo (según la model card) permite compilar o ejecutar el runtime adaptado al hardware disponible.
- Prototipado e investigación en ASR: al ser un modelo pequeño (≈784 M parámetros) y con licencia OpenMDW-1.1, sirve como base para experimentación y comparación de técnicas de cuantización en tareas de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 783,9 M parámetros en cuantización de 4 bits suponen aproximadamente 0,4 GB solo de pesos, más overhead de runtime y buffers de audio; en precisión completa (FP16) serían aproximadamente 1,6 GB. Estas cifras son estimaciones, no datos del autor.
- GPU recomendadas: no disponibles. La model card menciona el uso del toolchain CUDA original de cada dispositivo, sin especificar modelos de GPU.
- ¿Cabe en GPU de consumo? Por tamaño de parámetros es plausible en GPUs de consumo con suficiente VRAM, pero no hay confirmación oficial en la información proporcionada.
- Opciones de despliegue: formato GGUF, compatible con runtimes de inferencia GGUF (por ejemplo llama.cpp u Ollama) en la medida en que soporten la arquitectura ASR concreta; el autor menciona imágenes de runtime propias sin pesos y streaming SSE. No se detallan integraciones con vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de ASR de tamaño similar.

## Limitaciones y advertencias

- Documentación muy escasa: la model card no especifica idiomas, contexto, datos de entrenamiento ni arquitectura interna.
- El autor advierte que esta etapa (0.2.0) no es una aceptación final completa del LPK; el modelo debe considerarse en estado de desarrollo.
- Riesgo de paradas falsas del mecanismo de guarda contra repeticiones: la versión 0.2.0 introduce recuperación acotada, lo que sugiere que el problema persiste en ciertos casos.
- Posibles transcripciones incompletas: el sistema las reporta como fallo explícito, pero el usuario debe gestionar ese estado en producción.
- Sin métricas publicadas de precisión (WER u otras), no es posible evaluar la calidad de transcripción frente a alternativas.
- Sin tracción ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- Licencia OpenMDW-1.1: conviene revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar tipo Apache-2.0 o MIT.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación en la transcripción: no cuantificado en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/manateelazycat/Nemotron-3.5-Transcribe-AIPod-HF
- Referencias internas citadas en la model card (no verificables desde la información proporcionada): `loop-recovery.md`, `reused-inputs.json`, «final acceptance receipt».
