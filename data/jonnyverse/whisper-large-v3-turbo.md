# JONNYVERSE/whisper-large-v3-turbo

## Resumen

JONNYVERSE/whisper-large-v3-turbo es una conversión del modelo de reconocimiento automático de voz (ASR) openai/whisper-large-v3-turbo a pesos ONNX, preparada para su uso con la librería Transformers.js de Hugging Face. Su objetivo es habilitar la inferencia de Whisper directamente en navegadores o entornos JavaScript, evitando la necesidad de mantener un backend de inferencia en servidor.

El modelo base, openai/whisper-large-v3-turbo, es una versión "turbo" de Whisper large-v3: un modelo podado y ajustado que reduce el número de capas del decoder de 32 a 4, manteniendo la misma arquitectura del encoder. Esto permite una decodificación más rápida con una pérdida mínima de precisión. El repositorio de JONNYVERSE no añade cambios en el entrenamiento; únicamente exporta los pesos a formato ONNX para que sean compatibles con Transformers.js. El tamaño del repositorio es de 14.5 GB, lo que sugiere que incluye múltiples variantes de precisión.

La relevancia de este modelo radica en la posibilidad de ejecutar transcripción de voz de forma local en la web (WebML) y en aplicaciones Node.js, con implicaciones directas en privacidad, latencia y costes de infraestructura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer (Whisper) con pesos ONNX |
| Parametros totales | No disponible |
| Parametros activos | No aplica (el modelo no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | ONNX (en subcarpeta `onnx`) |

## Arquitectura y entrenamiento

El modelo es una exportación a ONNX del openai/whisper-large-v3-turbo. Según la descripción del modelo base, se trata del mismo modelo, salvo que el número de capas de decodificación se ha reducido de 32 a 4. Esto modifica la fase de decodificación, reduciendo la complejidad computacional manteniendo el encoder original. No hay datos específicos sobre el dataset de entrenamiento ni sobre técnicas de alineación (RLHF, DPO) en la información proporcionada.

La única innovación técnica aquí es la conversión de pesos a ONNX para hacer la inferencia compatible con Transformers.js. El README indica que mantener un repositorio separado para pesos ONNX es una solución temporal y recomienda convertir los modelos con Optimum para entornos web.

## Capacidades

- Reconocimiento automático de voz (ASR): transcripción de audio a texto mediante el pipeline `automatic-speech-recognition` de Transformers.js.
- Ejecución en navegador: al estar en formato ONNX, puede ejecutarse en el navegador con Transformers.js y WebML, sin necesidad de servidor.
- Integración en Node.js: apto para su uso en entornos JavaScript/TypeScript en el servidor.
- Herencia de capacidades del modelo base: al ser una conversión, hereda las capacidades del openai/whisper-large-v3-turbo, aunque no se detallan características específicas (idiomas, tool calling, agentes) en la información disponible.
- No se han declarado capacidades adicionales como visión, audio generativo o tool calling.

## Casos de uso

- Transcripción de entrevistas en aplicaciones web: el usuario carga un archivo de audio y recibe el texto en local, sin subir datos a servidores.
- Subtitulado automático en reproductores de vídeo: se puede integrar el modelo en un reproductor web para generar subtítulos de contenido en tiempo real o de forma diferida.
- Asistente de voz en el cliente: aplicaciones web que necesiten reconocer comandos de voz pueden ejecutar la inferencia en el navegador, reduciendo la latencia.
- Transcripción de reuniones en Node.js: procesar grabaciones de llamadas en un backend JavaScript para obtener actas automáticas.
- Indexación de podcasts: convertir los episodios a texto en un pipeline web o servidor para habilitar búsqueda y análisis.
- Educación accesible: generar transcripciones de clases para estudiantes con dificultades de audición, con ejecución local para proteger la privacidad de los alumnos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de comparación (MMLU, HumanEval, GSM8K) ni métricas de WER (word error rate) para este repositorio ni para la variante ONNX. El modelo, al ser una conversión, debería ofrecer un rendimiento similar al openai/whisper-large-v3-turbo original, pero no se proporcionan medidas concretas.

## Requisitos de hardware

- VRAM estimada: no disponible.
- GPU recomendadas: no disponible. En el navegador, puede utilizar cualquier GPU compatible con WebGPU o ejecutarse en CPU vía WebAssembly.
- Si cabe en consumer GPU: no disponible. El tamaño del repositorio (14.5 GB) sugiere que los pesos completos pueden ser pesados, pero el runtime selecciona la precisión adecuada.
- Opciones de despliegue: Transformers.js (npm), ONNX Runtime Web, ONNX Runtime Node.js, o integración en una página web estática.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han encontrado datos comparativos entre este modelo y alternativas similares en la información disponible. La única referencia clara es el modelo original openai/whisper-large-v3-turbo, del que este repositorio es una exportación ONNX. La comparación queda limitada al formato de pesos y al entorno de ejecución:

| Alternativa | Formato | Entorno de ejecución | Licencia |
|---|---|---|---|
| openai/whisper-large-v3-turbo (original) | No disponible | No disponible | No disponible |
| JONNYVERSE/whisper-large-v3-turbo | ONNX | Transformers.js / WebML / Node.js | No disponible |

## Limitaciones y advertencias

- La licencia de este repositorio no está especificada; antes de usar en producción o con fines comerciales, es necesario verificar la licencia del modelo base (openai/whisper-large-v3-turbo) y cualquier restricción adicional.
- No se informa sobre los idiomas soportados; la cobertura multilingüe del modelo no está confirmada para esta conversión.
- No se han publicado métricas de error de transcripción (WER) ni análisis de sesgos; se recomienda evaluar el modelo con audios representativos.
- Los modelos de ASR pueden generar texto que no está presente en el audio (alucinación), especialmente en zonas de silencio o ruido; este riesgo no se cuantifica en la información disponible.
- El README señala que la existencia de repositorios ONNX separados es una solución temporal y recomienda convertir con Optimum; este repo puede no mantenerse actualizado.

## Enlaces

- https://huggingface.co/JONNYVERSE/whisper-large-v3-turbo
- https://huggingface.co/openai/whisper-large-v3-turbo
- https://huggingface.co/docs/optimum/index
