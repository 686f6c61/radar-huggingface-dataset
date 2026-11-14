# codebucketsolutions/dicow-v3.3-onnx

## Resumen

DiCoW v3.3 ONNX es la exportación a formato ONNX del modelo DiCoW (Diarization-Conditioned Whisper) desarrollado por el grupo Speech@FIT de la Universidad Técnica de Brno (BUT-FIT). DiCoW parte de Whisper large-v3-turbo y lo condiciona con máscaras de actividad de hablante por fotograma (silencio, hablante objetivo, no objetivo y solapamiento), de modo que una grabación se transcribe una vez por cada hablante diarizado, incluyendo el habla solapada. Resuelve el problema de la ASR de hablante objetivo (target-speaker ASR) sin necesidad de un pipeline separado de diarización y transcripción.

Esta conversión concreta, publicada por codebucketsolutions, está pensada para el runtime [bolo](https://github.com/cb-Sigma/bolo), que ejecuta el modelo con ONNX Runtime y NumPy sin dependencia de PyTorch. Se ofrecen dos grafos: el codificador con condicionamiento FDDT y las proyecciones de atención cruzada del decodificador, y el decodificador con caché de clave/valor. Adicionalmente se incluyen variantes cuantizadas dinámicamente a int8 (pesos int8 por canal de salida, manteniendo en fp32 las matrices de salida de la feed-forward del codificador).

El modelo es relevante para despliegues ligeros de transcripción con hablantes separados: elimina la dependencia de PyTorch y permite servir la inferencia en entornos con ONNX Runtime, manteniendo según el autor el mismo cpWER que la versión PyTorch en una evaluación sobre 24 extractos de AMI. La licencia es CC-BY-4.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo con condicionamiento por actividad de hablante (FDDT) |
| Parametros totales | no disponible (repo de 1,5 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (grafos ONNX sin cuantizar) e int8 dinamica (pesos int8 por canal de salida; matrices de salida de la feed-forward del codificador en fp32) |
| Idiomas soportados | no disponible (hereda la cobertura multilingue de Whisper large-v3-turbo, no confirmada en la informacion disponible) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (grafos `*.onnx` y `*.int8.onnx`); sin safetensors ni GGUF |

## Arquitectura y entrenamiento

DiCoW se construye sobre Whisper large-v3-turbo y añade condicionamiento por actividad de hablante por fotograma mediante FDDT (frame-level diarization-dependent training). Las máscaras de actividad distinguen silencio, hablante objetivo, hablante no objetivo y solapamiento, lo que permite transcribir habla solapada asignando cada segmento al hablante correspondiente. En esta exportación, el codificador incluye el condicionamiento FDDT y las proyecciones de atención cruzada del decodificador; el decodificador incorpora caché de clave/valor. El cabezal CTC del modelo original no se incluye porque la configuración de generación publicada no lo emplea.

Los pesos se exportan sin cambios a dos grafos ONNX mediante `server/tools/export_dicow_onnx.py` del repositorio bolo, con sumas de verificación en `dicow_onnx.json`. Las variantes int8 aplican cuantización dinámica. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el modelo base.

## Capacidades

- Reconocimiento automático de habla de hablante objetivo (target-speaker ASR) condicionado por máscaras de actividad de hablante.
- Transcripción de grabaciones con hablantes solapados, una pasada por hablante diarizado.
- Integración con diarización previa: el modelo consume las máscaras por fotograma generadas por un sistema de diarización.
- Ejecución sin PyTorch mediante ONNX Runtime y NumPy (runtime bolo).
- Variantes cuantizadas int8 para reducir requisitos de memoria y cómputo.
- Soporte multilingüe heredado de Whisper large-v3-turbo (no confirmado en la información disponible).
- No se menciona soporte de tool calling, function calling, agentes ni visión/audio más allá de la ASR.

## Casos de uso

- Transcripción de reuniones multipartícipe: el modelo recibe las máscaras de actividad de cada participante y genera una transcripción por hablante, incluyendo segmentos solapados, lo que simplifica actas y atribución de intervenciones.
- Subtitulado con atribución de hablante: para contenido audiovisual con varios locutores, se combina con un sistema de diarización y se obtienen subtítulos etiquetados por hablante en una sola fase de ASR.
- Análisis de llamadas de atención al cliente: permite separar la voz del agente y del cliente y transcribir cada canal de forma independiente, facilitando el análisis de calidad y el cumplimiento.
- Investigación en ASR de hablante objetivo: sirve como referencia reproducible en ONNX para comparar sistemas de diarización y condicionamiento sin depender de PyTorch.
- Despliegue en entornos sin PyTorch: al ejecutarse con ONNX Runtime y NumPy, encaja en servicios contenedorizados ligeros o en plataformas donde instalar PyTorch no es viable.
- Transcripción de entrevistas y grupos focales: la separación por hablante con solapamiento permite analizar turnos de palabra y solapamientos en estudios cualitativos.
- Evaluación de sistemas de diarización: el modelo actúa como consumidor de máscaras, por lo que permite medir el impacto de la calidad de la diarización en el cpWER final.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| AMI (24 extractos) | cpWER, grafos int8 | 26,0 % (igual que el modelo PyTorch) |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 1,5 GB e incluye grafos fp32 e int8, por lo que la inferencia en int8 requiere sustancialmente menos memoria que en fp32.
- GPU recomendadas: no especificadas en la información disponible. Al ser una exportación ONNX, puede ejecutarse en CPU o GPU con ONNX Runtime.
- Cabe en GPU de consumo: probable en las variantes int8 dado el tamaño del repo, pero no confirmado en la información disponible.
- Opciones de despliegue: ONNX Runtime a través del runtime bolo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de ASR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| DiCoW v3.3 ONNX (este) | no disponible | no disponible | Target-speaker ASR | CC-BY-4.0 | ONNX |
| Whisper large-v3-turbo | no disponible en la informacion | no disponible | ASR multilingue | no disponible en la informacion | safetensors, entre otros |
| SE-DiCoW | no disponible | no disponible | Target-speaker ASR con auto-enrolamiento | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Requiere máscaras de actividad de hablante por fotograma; sin una diarización previa fiable, el condicionamiento pierde eficacia.
- El cabezal CTC del modelo original no se incluye en esta exportación.
- La cuantización int8 se ha validado solo en 24 extractos de AMI (cpWER 26,0 %); el comportamiento en otros dominios o idiomas no está documentado en la información disponible.
- Los idiomas soportados no se detallan; la cobertura multilingüe de Whisper large-v3-turbo no está confirmada para esta exportación.
- Riesgo de alucinación propio de los modelos Whisper, especialmente en segmentos con ruido o habla solapada.
- Sesgos del modelo base no documentados en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar las publicaciones indicadas por el autor del modelo base.
- El modelo no está pensado para tool calling ni agentes; su uso se limita a ASR condicionada por hablante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codebucketsolutions/dicow-v3.3-onnx
- Modelo base: https://huggingface.co/BUT-FIT/DiCoW_v3_3
- Runtime bolo: https://github.com/cb-Sigma/bolo
- Polok et al., "DiCoW: Diarization-conditioned Whisper for target speaker automatic speech recognition", Computer Speech & Language 95, 2026: https://doi.org/10.1016/j.csl.2025.101841
- Polok et al., "Target Speaker ASR with Whisper", ICASSP 2025: https://doi.org/10.1109/ICASSP49660.2025.10887683
- Polok et al., "SE-DiCoW: Self-Enrolled Diarization-Conditioned Whisper", arXiv:2601.19194: https://arxiv.org/abs/2601.19194
