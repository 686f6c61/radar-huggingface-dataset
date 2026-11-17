# FredrikKarlssonSpeech/nb-whisper-large-verbatim-onnx

## Resumen

nb-whisper-large-verbatim-onnx es la conversion a formato ONNX del modelo de reconocimiento automatico del habla (ASR) NbAiLab/nb-whisper-large-verbatim, desarrollado originalmente por el Laboratorio Nacional de IA de Noruega (NbAiLab). El modelo base es un Whisper large ajustado para noruego, y esta version ONNX anade multiples variantes de precision (fp32, fp16, int8, uint8, cuantizacion dinamica, q4, q4f16 y bnb4) que permiten desplegarlo en entornos con distintos presupuestos de computo, desde servidores con GPU hasta navegadores web mediante transformers.js.

El interes de esta publicacion radica en el formato de distribucion: al estar exportado con Optimum y cuantizado con las herramientas de ONNX Runtime, el modelo puede ejecutarse tanto en Python (via ORTModelForSpeechSeq2Seq) como en JavaScript en el navegador o en Node.js, sin depender de PyTorch en tiempo de inferencia. Esto lo hace util para aplicaciones de transcripcion en produccion con requisitos estrictos de latencia o de portabilidad.

La ficha se centra en los datos disponibles en el repositorio y en la model card del autor. La informacion sobre el entrenamiento, los datos o los benchmarks del modelo original no esta incluida en esta pagina y se remite a la model card de NbAiLab/nb-whisper-large-verbatim.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), exportado a ONNX |
| Parametros totales | no disponible (el modelo base es Whisper large; el numero exacto no se indica en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | fp32, fp16, int8, uint8, quantized (avx512_vnni), q4, q4f16, bnb4 (NF4) |
| Idiomas soportados | nb (noruego bokmal), no (noruego) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder_model.onnx, decoder_model.onnx, decoder_with_past_model.onnx, decoder_model_merged.onnx y variantes por precision) |

## Arquitectura y entrenamiento

El modelo base NbAiLab/nb-whisper-large-verbatim es un Whisper de la familia large, una arquitectura transformer encoder-decoder disenada para reconocimiento automatico del habla. La variante "verbatim" indica que el modelo esta ajustado para transcribir el habla tal como se pronuncia, incluyendo muletillas y repeticiones, en lugar de normalizar o limpiar el texto de salida. Esta version ONNX conserva la arquitectura del modelo original y solo cambia el formato y la precision de los pesos.

La conversion se realizo con Hugging Face Optimum, la cuantizacion con las herramientas de ONNX Runtime (incluyendo MatMulNBitsQuantizer para q4 y MatMulBnb4Quantizer para bnb4) y la conversion a fp16 con onnxconverter-common. La model card no proporciona detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o ajuste fino especifico; esa informacion corresponde al modelo original y no se reproduce aqui.

## Capacidades

- Reconocimiento automatico del habla (ASR) para noruego bokmal y noruego.
- Transcripcion verbatim: preserva el habla literal, incluidas pausas, repeticiones y muletillas.
- Ejecucion en Python mediante ORTModelForSpeechSeq2Seq de Optimum.
- Ejecucion en JavaScript y en navegador mediante transformers.js.
- Multiples variantes de precision para adaptar el equilibrio entre calidad y coste computacional.
- Procesamiento de audio a 16 kHz mono como entrada estandar.
- No se documentan capacidades de traduccion, diarizacion, tool calling ni agentes.

## Casos de uso

- Transcripcion de reuniones y entrevistas en noruego: el modelo puede procesar audio de 16 kHz y generar transcripciones literales, util para actas que deban reflejar el habla real de los participantes.
- Subtitulado automatico de contenido audiovisual: la variante fp16 o int8 permite generar subtitulos con menor coste en GPU, y la variante q4 puede ejecutarse en entornos con recursos limitados.
- Aplicaciones web de dictado en el navegador: gracias a transformers.js y a las variantes cuantizadas, la transcripcion puede realizarse en el cliente sin enviar audio a un servidor.
- Investigacion linguistica sobre noruego hablado: la salida verbatim facilita el analisis de fenomenos del habla espontanea (repeticiones, pausas, muletillas) que otros modelos normalizan.
- Procesamiento por lotes de archivos de audio: el uso de ONNX Runtime y de la variante quantized (avx512_vnni) permite desplegar la transcripcion en servidores CPU con aceleracion de instrucciones.
- Integracion en pipelines de transcripcion en produccion: la exportacion ONNX simplifica el despliegue en entornos sin PyTorch y la seleccion de precision segun el hardware disponible.
- Prototipado rapido en Node.js: la model card incluye un ejemplo de carga manual de audio WAV con resampleo a 16 kHz, util para scripts de linea de comandos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; depende de la variante de precision elegida (fp32, fp16, int8, q4, etc.) y del hardware.
- GPU recomendadas: no especificadas en la model card; al tratarse de un Whisper large, se espera que las variantes fp16 e int8 requieran GPU con memoria suficiente, mientras que las variantes q4 y bnb4 reducen el requisito.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; las variantes cuantizadas estan pensadas para reducir el coste y podrian caber en GPU de consumo, pero no se aportan cifras.
- Opciones de despliegue: ONNX Runtime via Optimum (Python), transformers.js (JavaScript y navegador), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| nb-whisper-large-verbatim-onnx | no disponible (Whisper large) | no disponible (ventanas de 30 s) | nb, no | Apache 2.0 | ONNX |
| NbAiLab/nb-whisper-large-verbatim | no disponible (Whisper large) | no disponible (ventanas de 30 s) | nb, no | Apache 2.0 | safetensors (formato original) |
| Whisper large (original de OpenAI) | no disponible en esta ficha | no disponible (ventanas de 30 s) | multilingue | MIT (modelo original) | safetensors, etc. |

La comparativa se limita a los datos disponibles; no se dispone de informacion sobre rendimiento comparado entre estas variantes.

## Limitaciones y advertencias

- El modelo esta especializado en noruego (nb, no); su rendimiento en otros idiomas no esta documentado y probablemente sea limitado.
- La salida verbatim puede incluir muletillas y repeticiones, lo que puede no ser adecuado para aplicaciones que requieran texto limpio o normalizado.
- Riesgo de alucinacion y de errores en audio con ruido, acentos marcados o solapamiento de hablantes; no se documentan evaluaciones al respecto.
- No se proporcionan datos sobre sesgos del modelo base ni sobre su comportamiento en dominios especificos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo original y las condiciones de los datos de entrenamiento.
- El repositorio tiene un tamano de 28,7 GB, lo que puede dificultar su descarga y almacenamiento en entornos con recursos limitados.
- La model card no incluye informacion sobre latencia, throughput ni requisitos minimos de hardware, por lo que el dimensionamiento debe hacerse por prueba empirica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-large-verbatim-onnx
- Modelo base: https://huggingface.co/NbAiLab/nb-whisper-large-verbatim
- Documentacion de Optimum: https://huggingface.co/docs/optimum
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
