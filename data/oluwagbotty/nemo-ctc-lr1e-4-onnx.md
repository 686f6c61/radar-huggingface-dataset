# oluwagbotty/nemo-ctc-lr1e-4-onnx

## Resumen

`oluwagbotty/nemo-ctc-lr1e-4-onnx` es la exportación a ONNX del modelo de reconocimiento automático del habla (ASR) `oluwagbotty/nemo-ctc-lr1e-4`, un modelo NeMo con cabecera CTC afinado para kinyarwanda (`rw`). Lo publica el usuario de Hugging Face `oluwagbotty` y su propósito es permitir la inferencia en dispositivos que solo dispongan de `onnxruntime`, sin necesidad de instalar el stack completo de NVIDIA NeMo.

El grafo ONNX integra el front-end de audio de NeMo (extracción de características a 16 kHz mono), el encoder y el decoder, y produce directamente log-probabilidades por frame. Según la model card, el grafo reproduce la salida greedy de NeMo en 50 de 50 grabaciones de test, lo que lo convierte en una alternativa práctica para despliegues ligeros en producción.

El modelo está entrenado sobre el CDLI Non-Standard Speech Dataset (Centre for Digital Language Inclusion, UCL, 2025), un corpus de habla kinyarwanda no estándar con pocos hablantes y condiciones de grabación controladas. La relevancia actual reside en su carácter de recurso de bajo coste para una lengua de bajos recursos, aunque con un ámbito de aplicación muy acotado y limitaciones documentadas explícitamente por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo CTC (encoder + decoder CTC exportados como un unico grafo ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada: audio float32 [1, samples] a 16 kHz) |
| Tipos de cuantizacion | no disponible (el repo se etiqueta como `quantized` respecto al modelo base, sin detallar el esquema) |
| Idiomas soportados | kinyarwanda (`rw`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un modelo NeMo con cabecera Connectionist Temporal Classification (CTC), tal como indica el nombre del modelo base `nemo-ctc-lr1e-4`. La exportación ONNX agrupa en un único grafo el front-end de audio (a 16 kHz mono), el encoder y el decoder, de forma que la entrada es la señal de audio cruda y la salida son log-probabilidades por frame más el número de frames. El decodificado es greedy: se toma el token más probable por frame, se colapsan repeticiones y se eliminan los blancos; el vocabulario está en `labels.json` con el token de blanco al final y el prefijo `▁` para marcar inicio de palabra.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card solo remite a la del modelo base para detalles de precisión. Los datos provienen del CDLI Non-Standard Speech Dataset (UCL, 2025), con grabaciones realizadas en Ruanda en 2026 en interiores con bajo ruido, mediante una aplicación de tableta, a partir de descripciones de imágenes y de frases leídas. El proyecto fue financiado por UK International Development a través del programa AT2030 con apoyo de Google.org. El sufijo `lr1e-4` sugiere una tasa de aprendizaje de 1e-4 en el ajuste fino, aunque no se detalla el procedimiento completo.

## Capacidades

- Reconocimiento automático del habla en kinyarwanda a partir de audio mono a 16 kHz.
- Salida de log-probabilidades por frame con vocabulario CTC (blanco al final, `▁` para inicio de palabra).
- Decodificado greedy reproducible: misma salida que NeMo en 50 de 50 grabaciones de test según la model card.
- Inferencia ligera con solo `onnxruntime`, sin dependencia del stack NeMo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada más allá del ASR ni modos de razonamiento extendido.

## Casos de uso

- **Transcripción de habla kinyarwanda en aplicaciones móviles**: el grafo ONNX se ejecuta con `onnxruntime` en dispositivos con recursos limitados, lo que permite integrar ASR en apps de tableta o móvil sin el stack NeMo.
- **Digitalización de grabaciones de campo**: el modelo está entrenado con el corpus CDLI de habla no estándar, por lo que es adecuado para transcribir entrevistas y descripciones de imágenes recogidas en condiciones similares (interior, bajo ruido).
- **Investigación en lenguas de bajos recursos**: sirve como línea base reproducible para experimentos de ASR en kinyarwanda, al poder compararse directamente con la salida de NeMo.
- **Pipelines de subtitulado en servidor ligero**: al no requerir GPU ni NeMo, se puede desplegar en contenedores CPU con `onnxruntime` para generar transcripciones por lotes.
- **Prototipado de asistentes de voz en kinyarwanda**: la salida de log-probabilidades permite integrar decodificadores propios (por ejemplo, con modelo de lenguaje) sobre las mismas probabilidades.
- **Evaluación de robustez frente a habla leída y descrita**: útil para medir el comportamiento del modelo en los dos tipos de prompt del dataset (texto leído y descripción de imágenes).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la coincidencia de salida greedy con NeMo en 50 de 50 grabaciones de test (`check.json`), que no constituye un benchmark estándar de WER/CER.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0,5 GB, lo que sugiere que la inferencia en CPU es viable.
- GPU recomendadas: no disponible; al ejecutarse con `onnxruntime` puede correr en CPU y, potencialmente, en GPU compatible con ONNX Runtime.
- Cabe en GPU de consumo: previsiblemente sí por el tamaño del artefacto (0,5 GB), aunque no se documentan requisitos oficiales.
- Opciones de despliegue: `onnxruntime` (requisito mínimo según la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| oluwagbotty/nemo-ctc-lr1e-4-onnx | no disponible | no disponible | rw | CC-BY-4.0 | ONNX |
| oluwagbotty/nemo-ctc-lr1e-4 (base) | no disponible | no disponible | rw | no disponible en la informacion | NeMo |
| Otros modelos ASR para kinyarwanda | no disponible | no disponible | rw | no disponible | no disponible |

No se dispone de información sobre alternativas comparables con datos de rendimiento verificables.

## Limitaciones y advertencias

- **Pocos hablantes y condiciones estrechas**: 9 hablantes de test, mayoritariamente hombres jóvenes, grabaciones en interior con bajo ruido, habla leída y descrita, no conversacional. El rendimiento en niños, otras discapacidades, entornos ruidosos, audio telefónico o habla con cambio de código es desconocido.
- **Objetivos verbatim**: las repeticiones por tartamudeo se escriben en las transcripciones; los bloqueos y prolongaciones no son visibles en el texto.
- **Sesgo hacia frases leídas**: las frases leídas también aparecen en las transcripciones de entrenamiento, por lo que los resultados con descripciones de imágenes son la mejor guía para habla abierta.
- **Prohibición de decisiones sobre personas**: no debe usarse para diagnosticar o evaluar condiciones del habla, identificar hablantes ni en decisiones clínicas, legales o de aplicación de la ley. Los términos CDLI prohíben reidentificar hablantes y crear voces que imiten a una persona.
- **Riesgo de alucinación y cambio de significado**: una transcripción errónea puede alterar lo que dijo la persona; debe mostrarse el texto al hablante antes de actuar sobre él.
- **Licencia**: CC-BY-4.0 permite uso comercial con atribución, pero los términos del dataset CDLI añaden restricciones adicionales sobre reidentificación y clonación de voz.
- **Idioma único**: solo kinyarwanda; no se documenta soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/nemo-ctc-lr1e-4-onnx
- Modelo base: https://huggingface.co/oluwagbotty/nemo-ctc-lr1e-4
- Dataset CDLI (acceso restringido): https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
- Script de exportación citado: `src/export_nemo_onnx.py` del repositorio del proyecto (no se proporciona URL directa en la información disponible).
