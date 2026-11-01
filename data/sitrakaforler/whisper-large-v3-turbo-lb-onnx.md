# SitrakaForler/whisper-large-v3-turbo-lb-onnx

## Resumen
whisper-large-v3-turbo-lb-onnx es la exportación a formato ONNX del modelo de reconocimiento automático del habla (ASR) SitrakaForler/whisper-large-v3-turbo-lb, un fine-tuning de Whisper large-v3 turbo especializado en luxemburgués. Lo desarrolla SitrakaForler y está pensado para ejecutarse íntegramente en el navegador mediante transformers.js y WebGPU, lo que elimina la necesidad de infraestructura de servidor para transcripción.

El repositorio no introduce un modelo nuevo: replica los pesos del modelo base cambiando únicamente el formato (ONNX) y la precisión de los pesos (4 bits y fp16), con el objetivo de reducir el tamaño y permitir inferencia local en cliente. Incluye variantes cuantizadas a 4 bits del encoder (425 MB) y del decoder fusionado (334 MB), además de un encoder en fp16 (1.27 GB).

Su relevancia actual radica en la combinación de un modelo ASR de la familia Whisper large-v3 turbo con un pipeline de despliegue web sin backend, algo útil para aplicaciones de accesibilidad, transcripción privada y demos interactivas en idiomas de bajos recursos como el luxemburgués.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3 turbo) exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por chunk (chunk_length_s configurable; el modelo base usa ventanas de 30 s) |
| Tipos de cuantizacion | 4 bits (MatMul, bloque 32) y fp16; decoder fusionado en 4 bits con ramas If en fp32 |
| Idiomas soportados | luxemburgués (lb) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder_model_q4.onnx, encoder_model_fp16.onnx, decoder_model_merged_q4.onnx) |

## Arquitectura y entrenamiento
El modelo subyacente es un Whisper large-v3 turbo, es decir, un transformer encoder-decoder para ASR con atención estándar y decodificación autoregresiva sobre tokens de audio. La variante turbo de Whisper reduce el número de capas del decoder respecto a large-v3 para acelerar la inferencia, manteniendo el encoder de large-v3. Este repositorio concreto no entrena nada: exporta los pesos del fine-tuning luxemburgués a ONNX y aplica cuantización de pesos MatMul a 4 bits con bloque 32, dejando las ramas condicionales del decoder fusionado en fp32.

No se dispone de información sobre el dataset de fine-tuning, el número de tokens de audio, ni si hubo técnicas de alineación o refuerzo en el modelo base. La model card indica que las cifras de precisión son las mismas que las del modelo base y remite a su ficha para consultarlas. La innovación técnica aquí es de despliegue: exportación ONNX compatible con transformers.js y WebGPU, con un decoder fusionado que permite ejecutar el modelo en el navegador con pesos de 4 bits.

## Capacidades
- Transcripción de voz a texto (ASR) en luxemburgués.
- Traducción de voz a texto al inglés mediante el parámetro task del pipeline (capacidad heredada de Whisper; no verificada específicamente para este fine-tuning).
- Procesamiento por chunks de audio de 30 s con chunk_length_s, lo que permite transcribir audios más largos que la ventana nativa.
- Ejecución en navegador con transformers.js y WebGPU, sin backend.
- Inferencia con pesos cuantizados a 4 bits o fp16 según el equilibrio tamaño/precisión elegido.
- No se documenta soporte de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso
- Transcripción privada en el navegador: una aplicación web puede transcribir audio del usuario sin enviarlo a un servidor, usando el encoder q4 (425 MB) y el decoder q4 (334 MB) con WebGPU; adecuado para contenido sensible.
- Accesibilidad en sitios web luxemburgueses: subtitulado automático de vídeos y reuniones en luxemburgués directamente en cliente, reduciendo costes de infraestructura.
- Herramientas de documentación para medios locales: transcripción de reportajes radiofónicos (la model card menciona un reportaje de 2 min 26 s) para generar borradores de texto editables.
- Demos interactivas y prototipos: el Space SitrakaForler/lb-whisper-demo sirve como base para validar la calidad ASR en luxemburgués antes de invertir en despliegue servidor.
- Aplicaciones educativas: dictado y transcripción de clases o apuntes en luxemburgués en entornos con recursos limitados, aprovechando la inferencia local.
- Investigación en lenguas de bajos recursos: punto de partida para comparar fine-tunings de Whisper en luxemburgués y evaluar el impacto de la cuantización 4 bits en la calidad de transcripción.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los archivos de 4 bits no se han evaluado por separado en FLEURS y que, en un reportaje radiofónico de 2 min 26 s, produjeron una transcripción cercana a la exportación int8 en CTranslate2 del mismo modelo.

## Requisitos de hardware
- VRAM estimada: con encoder q4 (425 MB) y decoder q4 (334 MB), el conjunto de pesos ronda los 760 MB; con encoder fp16 (1.27 GB) más decoder q4, alrededor de 1.6 GB. El consumo real en WebGPU depende del navegador y del backend.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (por ejemplo, integradas recientes y dedicadas de gama media); en servidor, GPUs con suficiente memoria para el encoder fp16.
- Cabe en GPU de consumo: sí, especialmente la variante q4; la fp16 requiere más memoria pero sigue siendo manejable en GPUs de consumo modernas.
- Opciones de despliegue: transformers.js con WebGPU en navegador; el formato ONNX también puede ejecutarse con runtimes ONNX en servidor, aunque la model card solo documenta el flujo de transformers.js.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-large-v3-turbo-lb-onnx | no disponible | chunks de 30 s | lb | MIT | ONNX (q4, fp16) |
| SitrakaForler/whisper-large-v3-turbo-lb (base) | no disponible | chunks de 30 s | lb | MIT | safetensors/transformers |
| Whisper large-v3 turbo (original) | no disponible en la informacion | chunks de 30 s | multilingüe | MIT | safetensors, ONNX, etc. |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias
- Especializado únicamente en luxemburgués; no está pensado para otros idiomas y su rendimiento fuera de lb no está documentado.
- La cuantización a 4 bits no se ha evaluado de forma independiente en FLEURS; la calidad puede diferir de la versión fp16 o del modelo base.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o habla solapada.
- El decoder fusionado mantiene las ramas condicionales en fp32, lo que puede afectar al tamaño y al rendimiento según el runtime.
- El soporte de WebGPU depende del navegador y del dispositivo; no todos los entornos lo ofrecen.
- Licencia MIT, lo que permite uso comercial, pero conviene revisar las condiciones del modelo base y de Whisper original.
- No hay información sobre sesgos específicos del fine-tuning ni sobre la composición del dataset de entrenamiento.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/SitrakaForler/whisper-large-v3-turbo-lb-onnx
- Modelo base: https://huggingface.co/SitrakaForler/whisper-large-v3-turbo-lb
- Demo en el navegador: https://huggingface.co/spaces/SitrakaForler/lb-whisper-demo
- Repositorio con el script de exportación: https://github.com/Sitraka17/lb-whisper
- transformers.js: https://github.com/huggingface/transformers.js
