# oluwagbotty/nemo-ctc-ky-ft-10ep-noise-onnx

## Resumen

`oluwagbotty/nemo-ctc-ky-ft-10ep-noise-onnx` es la exportación a ONNX de un modelo de reconocimiento automático del habla (ASR) basado en NeMo CTC, afinado sobre grabaciones de kinyarwanda (código ISO `rw`) a las que se añadió ruido en la mitad del conjunto de entrenamiento. El modelo original es `oluwagbotty/nemo-ctc-ky-ft-10ep-noise`; esta variante empaqueta el front-end de audio, el encoder y el decoder de NeMo en un único grafo ONNX que va de audio crudo mono a 16 kHz hasta log-probabilidades, de modo que el dispositivo de inferencia solo necesita `onnxruntime`.

El interés práctico del artefacto es la portabilidad: elimina la dependencia del stack NeMo en producción y ofrece una versión int8 de 196 MB (frente a 509 MB en fp32) que mantiene el WER prácticamente idéntico (37,3 frente a 37,2 sobre 200 grabaciones estratificadas). Está pensado para despliegue en dispositivos con CPU, incluidos entornos con recursos limitados, en el contexto de un proyecto de inclusión digital del Centre for Digital Language Inclusion (UCL) financiado por UK International Development y Google.org.

Se trata de un modelo especializado y de alcance estrecho: un solo idioma, 9 hablantes de test, grabaciones interiores con poco ruido y condiciones controladas. No es un modelo generalista de ASR multilingüe ni compite con los grandes sistemas comerciales; su valor está en cubrir kinyarwanda con una licencia permisiva (CC BY 4.0) y un formato desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo CTC (encoder-decoder CTC exportado como grafo ONNX unico, con front-end de audio incluido) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio de longitud variable; el grafo acepta `[1, samples]`) |
| Tipos de cuantizacion | fp32 (`model.onnx`, 509 MB) e int8 dinamica (`model.int8.onnx`, 196 MB); convoluciones en 32 bits |
| Idiomas soportados | kinyarwanda (`rw`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`; `model.int8.onnx` en un solo fichero) |

## Arquitectura y entrenamiento

El modelo es un CTC de NeMo cuyo grafo ONNX integra el front-end de audio (extracción de features), el encoder acústico y el decoder CTC, produciendo directamente `log_probs` de forma `[1, frames, tokens + blank]` junto con el número de frames. La exportación se realizó con `src/export_nemo_onnx.py` del repositorio del proyecto, y la cuantización int8 con `src/quantize_onnx.py`, aplicando cuantización dinámica únicamente a las multiplicaciones matriciales mientras las convoluciones permanecen en fp32 para garantizar compatibilidad con cualquier build de CPU de onnxruntime.

El entrenamiento parte del modelo base `oluwagbotty/nemo-ctc-ky-ft-10ep-noise`, afinado durante 10 épocas sobre el dataset CDLI Non-Standard Speech Dataset (Centre for Digital Language Inclusion, UCL, 2025), disponible en Hugging Face como `cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0` con acceso restringido. Las grabaciones se hicieron en Ruanda en 2026, en interiores con poco ruido, mediante una app de tableta, a partir de descripciones libres de imágenes y de frases leídas. La mitad de las grabaciones de entrenamiento se aumentaron con ruido. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (en ASR CTC no son el mecanismo habitual).

La innovación destacable es la fidelidad de la exportación: el grafo ONNX reproduce el texto greedy de NeMo en 50 de 50 grabaciones de test (`check.json`), con una diferencia máxima de log-probabilidad de 0,0015. La decodificación es greedy: mejor token por frame, fusión de repeticiones y eliminación de blancos, con `labels.json` listando los tokens (el blanco al final y `▁` marcando inicio de palabra).

## Capacidades

- Reconocimiento de voz a texto en kinyarwanda (`rw`) sobre audio mono a 16 kHz.
- Salida de log-probabilidades por frame, lo que permite tanto decodificación greedy como decodificación con beam search o integración con modelos de lenguaje externos.
- Robustez parcial al ruido gracias al entrenamiento con aumentación en la mitad de las grabaciones.
- Inferencia autocontenida en ONNX Runtime, sin necesidad del stack NeMo en el dispositivo.
- Ejecución en CPU con la variante int8, sin requisitos de GPU.
- Manejo de audio de longitud variable mediante la entrada `length` de tipo int64.
- No soporta tool calling, function calling, agentes, visión, audio de salida ni modo de razonamiento: es exclusivamente un modelo ASR CTC.

## Casos de uso

- Transcripción de voz en kinyarwanda en aplicaciones móviles o de tableta: el grafo ONNX autocontenido permite embeber el modelo en la app y transcribir en local sin enviar audio a un servidor, usando la variante int8 de 196 MB.
- Subtitulado y documentación de entrevistas o encuestas de campo: el modelo procesa audio de longitud variable y produce transcripciones que pueden revisarse posteriormente, útil en proyectos de investigación lingüística con hablantes de kinyarwanda.
- Accesibilidad para personas con habla no estándar: el modelo se entrenó específicamente sobre el CDLI Non-Standard Speech Dataset, por lo que está orientado a habla con características atípicas dentro de las condiciones recogidas.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse con onnxruntime en CPU, puede integrarse en pipelines de transcripción masiva donde el coste de GPU no es viable.
- Prototipado e investigación en ASR de bajos recursos: la licencia CC BY 4.0 y el formato ONNX facilitan la experimentación y la comparación con otros sistemas CTC para kinyarwanda.
- Integración en sistemas de dictado o entrada por voz para kinyarwanda: la salida de log-probabilidades permite acoplar un modelo de lenguaje para corregir y mejorar la decodificación greedy en producción.

## Benchmarks y rendimiento

| 200 grabaciones de test estratificadas, WER estilo CDLI, CER simple | WER / CER |
|---|---|
| `model.onnx` (fp32) | 37,2 / 11,5 |
| `model.int8.onnx` | 37,3 / 11,6 |

La diferencia de WER entre int8 y fp32 es de +0,0 (intervalo del 95 % de -1,2 a +1,2 con remuestreo de hablantes), por lo que no se observa una pérdida clara por la cuantización. No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la variante int8, que está diseñada para CPU con onnxruntime; la variante fp32 (509 MB) puede ejecutarse igualmente en CPU.
- GPU recomendadas: no disponibles; el modelo no requiere GPU y no se documentan requisitos de aceleración.
- Cabe en cualquier CPU moderna con onnxruntime; el tamaño de 196 MB en int8 permite su despliegue en dispositivos con memoria limitada.
- Opciones de despliegue: onnxruntime (CPU, cualquier build estándar); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo ASR CTC.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `oluwagbotty/nemo-ctc-ky-ft-10ep-noise-onnx` | kinyarwanda | no disponible | audio variable | CC BY 4.0 | ONNX |
| `oluwagbotty/nemo-ctc-ky-ft-10ep-noise` (modelo base) | kinyarwanda | no disponible | audio variable | CC BY 4.0 | NeMo |
| Otros modelos ASR para kinyarwanda | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes de test, mayoritariamente hombres jóvenes, grabaciones interiores con poco ruido y habla leída o descrita a partir de imágenes, no conversacional. El rendimiento con niños, otras condiciones del habla, entornos ruidosos, audio telefónico o habla con cambio de código es desconocido.
- Objetivos verbatim: las repeticiones por tartamudeo se transcriben literalmente, y los modelos entrenados con ellas pueden escribirlas o no; los bloqueos y prolongaciones no son visibles en el texto.
- Las frases leídas también aparecen en las transcripciones de entrenamiento, por lo que los resultados con descripciones de imágenes son una mejor guía para habla abierta.
- No debe usarse para diagnosticar o evaluar ninguna condición del habla, identificar hablantes ni para decisiones clínicas, legales o de aplicación de la ley. Los términos del CDLI prohíben reidentificar hablantes y construir voces que imiten a una persona.
- Riesgo de alucinación y de cambio de significado: una transcripción errónea puede alterar lo que dijo la persona; debe mostrarse el texto al hablante antes de actuar sobre él.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero los términos del dataset CDLI imponen restricciones adicionales sobre reidentificación y clonación de voz.
- El dataset de entrenamiento no se incluye en el repositorio y no puede compartirse desde él; su acceso está restringido.
- El modelo solo cubre kinyarwanda; no es multilingüe ni generalista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/nemo-ctc-ky-ft-10ep-noise-onnx
- Modelo base: https://huggingface.co/oluwagbotty/nemo-ctc-ky-ft-10ep-noise
- Dataset CDLI: https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
- Repositorio del proyecto (scripts `src/export_nemo_onnx.py` y `src/quantize_onnx.py`): no disponible
- Paper o blog del modelo: no disponible
- Demo: no disponible
