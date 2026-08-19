# bjnortier/coreai-parakeet-tdt-0.6b-v3-float16-static

## Resumen

Este repositorio contiene una exportación del modelo de reconocimiento de voz automático (ASR) `nvidia/parakeet-tdt-0.6b-v3` al formato Core AI de Apple, realizada por el usuario bjnortier. El modelo original, desarrollado por NVIDIA, es un transducer de token y duración (TDT) con 600 millones de parámetros, capaz de transcribir audio en 25 idiomas europeos con puntuación y capitalización nativas. Esta versión específica está pensada para ejecutarse en dispositivos Apple (macOS e iOS) mediante el runtime Core AI, sin necesidad de un LLM o de pesos PyTorch.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y eficiente para ASR en el dispositivo, con un tamaño de repo de 1,2 GB y una arquitectura optimizada para hardware Apple. A diferencia de los modelos de atención como Whisper, Parakeet TDT utiliza una arquitectura de transducer (familia RNN-T) con un encoder FastConformer y una red de predicción LSTM, lo que permite inferencia de baja latencia y adecuada para aplicaciones en tiempo real. El contexto máximo soportado es de aproximadamente 29 segundos por clip, según la documentación del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (token-and-duration transducer, familia RNN-T) con encoder FastConformer y red de predicción LSTM |
| Parametros totales | 600 millones (0,6B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | ~29 segundos de audio por clip (según documentación del modelo) |
| Tipos de cuantizacion | float16 (exportación estática) |
| Idiomas soportados | 25 idiomas europeos: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Archivos `.aimodel` (Core AI), no compatibles con `transformers` ni NeMo |

## Arquitectura y entrenamiento

El modelo es una exportación Core AI del `parakeet-tdt-0.6b-v3` de NVIDIA. La arquitectura original es un transducer de token y duración (TDT), una variante de los RNN-T que predice tanto tokens como duraciones de audio. El encoder es un FastConformer con 128 filtros Mel y un factor de submuestreo de 8×, mientras que el decodificador consta de una red de predicción LSTM de un solo paso y una red conjunta (joint network). El vocabulario tiene 8193 tokens (incluido el blank en la posición 8192). Las duraciones soportadas son [0, 1, 2, 3, 4] y el máximo de símbolos por paso es 10.

En esta exportación, el encoder se compila con forma estática, lo que significa que se reutiliza una única especialización de grafo para todas las longitudes de entrada, evitando el coste de re-especialización por cada nuevo audio. El paquete incluye tres grafos `.aimodel` (encoder, decoder_step y joint) más un directorio de procesador con el tokenizador. No se proporcionan detalles sobre el entrenamiento original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la información disponible; se remite a la model card de NVIDIA para esos datos.

## Capacidades

- Reconocimiento de voz automático (ASR) de audio a texto en 25 idiomas europeos, con soporte nativo de puntuación y capitalización.
- Predicción de marcas de tiempo a nivel de palabra, útil para subtitulado y alineación de texto.
- Inferencia en el dispositivo (on-device) en hardware Apple, sin conexión a servidores ni dependencia de un LLM.
- Baja latencia gracias a la arquitectura de transducer, adecuada para transcripción en tiempo real.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto libre; es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar clips de hasta ~29 segundos, por lo que se integraría en un pipeline que segmenta audio largo en fragmentos y los transcribe secuencialmente, aprovechando la baja latencia para resultados casi en tiempo real.
- Subtitulado automático de vídeos: gracias a las marcas de tiempo a nivel de palabra, se pueden generar subtítulos sincronizados para contenido en los 25 idiomas soportados, directamente en aplicaciones macOS o iOS.
- Asistentes de voz en el dispositivo: al ejecutarse localmente, permite comandos de voz sin enviar audio a la nube, preservando la privacidad del usuario y funcionando sin conexión.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones o contenido multimedia en dispositivos Apple, con bajo consumo de recursos.
- Análisis de llamadas de soporte al cliente: transcripción automática de grabaciones de audio para su posterior análisis de sentimiento o búsqueda de palabras clave, con puntuación nativa que mejora la legibilidad.
- Aplicaciones de dictado y toma de notas: el modelo puede convertir voz en texto en aplicaciones de productividad, ofreciendo soporte multilingüe y precisión en entornos con ruido moderado, gracias al encoder FastConformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio remite a la model card original de NVIDIA para datos de evaluación, pero no se incluyen cifras concretas en los materiales proporcionados. Se recomienda consultar `nvidia/parakeet-tdt-0.6b-v3` para métricas como WER (Word Error Rate) en los idiomas soportados.

## Requisitos de hardware

- Diseñado exclusivamente para Apple silicon (macOS 27 / iOS 27 o posterior) con el runtime Core AI.
- El paquete completo ocupa aproximadamente 1,16 GB en disco (archivo zip) y se carga en memoria como grafos float16; se estima un consumo de VRAM/memoria unificada de alrededor de 1,2 GB, aunque no se especifica un valor exacto.
- No es compatible con GPUs NVIDIA ni con frameworks como PyTorch, TensorFlow o vLLM; solo se ejecuta mediante CirceKit o `CoreAISpeech` de apple/coreai-models.
- Al ser un modelo de 600M en float16, es adecuado para dispositivos con al menos 4 GB de memoria unificada, como Macs con chip M1 o posterior y iPads Pro.
- La latencia y el throughput dependen del hardware concreto; al ser un transducer con encoder estático, la inferencia es eficiente para clips cortos, pero no se proporcionan cifras específicas en la documentación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `nvidia/parakeet-tdt-0.6b-v3` (original) | 600M | ~29 s | 25 europeos | CC-BY-4.0 | NeMo / ONNX |
| `bjnortier/coreai-parakeet-tdt-0.6b-v3-float16-static` (este) | 600M | ~29 s | 25 europeos | CC-BY-4.0 | Core AI (.aimodel) |
| `openai/whisper-small` (referencia) | 244M | 30 s | 99 | MIT | PyTorch / ONNX |

La comparativa se limita a la disponibilidad de datos. El modelo original de NVIDIA y esta exportación comparten exactamente la misma arquitectura y pesos; la única diferencia es el formato de serialización. Whisper-small es un modelo de atención con menor número de parámetros y soporte de más idiomas, pero no está optimizado para Apple Core AI y requiere un runtime diferente. No se dispone de datos de rendimiento comparativo entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no contiene pesos PyTorch ni archivos compatibles con `transformers` o NeMo; solo funciona en el ecosistema Core AI de Apple (macOS/iOS 27+).
- El modelo tiene un límite de contexto de aproximadamente 29 segundos por clip; audios más largos deben segmentarse previamente.
- Los idiomas soportados se limitan a 25 lenguas europeas; no cubre idiomas asiáticos, africanos ni otros fuera de esa lista.
- Al ser una exportación estática, no se puede ajustar la forma del encoder en tiempo de ejecución; cualquier cambio requeriría una nueva exportación.
- La licencia CC-BY-4.0 permite uso comercial y modificación, pero exige atribución al autor original (NVIDIA) y a este repositorio si se redistribuye.
- No se han documentado sesgos específicos del modelo en esta información; se recomienda consultar la model card de NVIDIA para conocer limitaciones de robustez ante acentos, ruido o dominios especializados.
- El rendimiento en términos de WER o latencia no está publicado en este repositorio; es necesario evaluarlo en el hardware objetivo antes de usarlo en producción.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/bjnortier/coreai-parakeet-tdt-0.6b-v3-float16-static
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Colección NGC de Parakeet TDT 0.6B: https://catalog.ngc.nvidia.com/orgs/nvidia/collections/parakeet-tdt-0.6b
- CirceKit (librería Swift para Core AI): https://github.com/bjnortier
- apple/coreai-models (incluye CoreAISpeech): https://github.com/apple/coreai-models
- Comunidad Core AI (espejo del modelo): https://huggingface.co/coreai-community/Parakeet-TDT-0.6B-CoreAI
- Core AI Model Zoo (documentación): https://github.com/john-rocky/coreai-model-zoo/blob/main/zoo/parakeet.md
