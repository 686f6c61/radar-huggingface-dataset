# oluwagbotty/parakeet-ctc-en-ft-10ep-onnx

## Resumen

`oluwagbotty/parakeet-ctc-en-ft-10ep-onnx` es la exportación a ONNX del modelo de reconocimiento automático del habla (ASR) `oluwagbotty/parakeet-ctc-en-ft-10ep`, un ajuste fino del modelo NeMo Parakeet CTC en inglés sobre el dataset CDLI Non-Standard Speech Dataset (Centre for Digital Language Inclusion, UCL, 2025). El autor del repositorio es `oluwagbotty` y la licencia es CC-BY-4.0.

El interés principal de esta versión es operativo: el autor ha fusionado el front-end de audio de NeMo, el encoder y el decoder en un único grafo ONNX que va de audio crudo mono a 16 kHz hasta log-probabilidades. Esto permite desplegar el modelo en dispositivos que solo dispongan de `onnxruntime`, sin necesidad de instalar el stack completo de NVIDIA NeMo. El autor reporta que el grafo ONNX reproduce la misma salida greedy que NeMo en 50 de 50 grabaciones de test, con una diferencia máxima de log-probabilidad de 0,05.

El modelo está especializado en inglés con acento y características no estándar (grabaciones realizadas en Ruanda en 2026), y su uso previsto es la transcripción asistiva, no la evaluación clínica ni la identificación de hablantes. El repositorio ocupa 2,5 GB y no incluye el dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NeMo Parakeet CTC (encoder + decoder CTC) exportado como grafo ONNX único |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada variable, `[1, samples]`) |
| Tipos de cuantización | no disponible (el tag `base_model:quantized` sugiere cuantización, pero no se especifica el esquema) |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`) |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR CTC de NVIDIA NeMo (familia Parakeet) ajustado durante 10 épocas sobre el dataset `cdli/rwandan_english_nonstandard_speech_v1.0`. La exportación ONNX integra en un solo grafo el front-end de audio de NeMo (extracción de features), el encoder y el decoder CTC. Las entradas del grafo son `audio` (float32, forma `[1, samples]`) y `length` (int64, `[1]`); las salidas son `log_probs` (`[1, frames, tokens + blank]`) y `frames`. El vocabulario se distribuye en `labels.json`, con el token blank al final y el prefijo `▁` marcando inicio de palabra.

El dataset de ajuste contiene grabaciones en inglés realizadas en Ruanda en 2026, en interiores con bajo ruido, mediante una app de tablet, a partir de descripciones libres de imágenes y de frases leídas. El acceso al dataset está restringido (gated) y no se incluye en el repositorio. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR CTC). La decodificación es greedy: se toma el token de mayor probabilidad por frame, se colapsan repeticiones y se eliminan los blanks.

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio mono a 16 kHz.
- Salida de log-probabilidades por frame, lo que permite aplicar decodificación greedy o decodificación con beam search externa.
- Exportación ONNX autocontenida: solo requiere `onnxruntime` en el dispositivo de destino.
- Reproducibilidad verificada frente a NeMo: misma salida greedy en 50 de 50 grabaciones de test (diferencia máxima de log-probabilidad de 0,05).
- Manejo de habla leída y de descripciones libres de imágenes (picture prompts).
- No soporta tool calling, function calling, agentes, visión, audio de entrada distinto de voz, ni modos de razonamiento extendido.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Transcripción asistiva de habla no estándar: el modelo se entrenó sobre grabaciones de hablantes con características no estándar en Ruanda, por lo que es adecuado para generar borradores de transcripción que después revise el propio hablante antes de actuar sobre ellos.
- Despliegue en dispositivos sin stack de NVIDIA: al ser un único grafo ONNX que solo requiere `onnxruntime`, puede integrarse en aplicaciones de escritorio, móviles o edge que no puedan instalar NeMo ni PyTorch.
- Subtitulado de grabaciones en inglés en entornos controlados: grabaciones en interiores con bajo ruido y micrófono de tablet son el dominio de entrenamiento, por lo que el modelo es apropiado para ese tipo de material.
- Investigación en accesibilidad del habla: útil como línea base para estudiar el rendimiento de ASR sobre habla no estándar y para comparar con otros sistemas en el mismo dataset CDLI (acceso gated).
- Prototipado rápido de pipelines ASR: la forma de entrada `[1, samples]` y la salida de log-probabilidades facilitan la integración en scripts de evaluación y en comparaciones con decodificadores externos.
- Transcripción de frases leídas para tareas de verificación: el modelo rinde mejor en frases leídas (presentes también en los transcripts de entrenamiento), por lo que puede usarse en tareas de lectura guiada o dictado controlado.
- Evaluación de la variabilidad de decodificación: al exponer log-probabilidades, permite analizar la confianza del modelo frame a frame en lugar de solo el texto final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la equivalencia funcional con NeMo: misma salida greedy en 50 de 50 grabaciones de test, con una diferencia máxima de log-probabilidad de 0,05. No se proporcionan cifras de WER, CER ni comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 2,5 GB, pero no se especifica el desglose entre pesos y datos del grafo ni el esquema de cuantización.
- GPU recomendadas: no disponible. Al ejecutarse con `onnxruntime`, puede funcionar en CPU y en GPU compatibles con los execution providers de ONNX Runtime, pero el autor no documenta硬件 concreto.
- ¿Cabe en GPU de consumo? No disponible; el tamaño del repositorio (2,5 GB) sugiere que podría caber en GPUs de consumo con suficiente memoria, pero no se confirma.
- Opciones de despliegue: `onnxruntime` (requisito único indicado por el autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un modelo ASR CTC.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `oluwagbotty/parakeet-ctc-en-ft-10ep-onnx` | no disponible | audio variable | equivalencia con NeMo en 50/50 test | CC-BY-4.0 | Hugging Face (ONNX) |
| `oluwagbotty/parakeet-ctc-en-ft-10ep` (modelo base) | no disponible | audio variable | referencia del ajuste fino | no disponible en la información | Hugging Face |
| Otros modelos Parakeet CTC de NVIDIA NeMo | no disponible | audio variable | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes de test, mayoritariamente hombres jóvenes, grabaciones en interiores silenciosos, habla leída y descrita a partir de imágenes, no conversación. El rendimiento en niños, otras condiciones del habla, entornos ruidosos, audio telefónico o habla con cambio de código es desconocido.
- Objetivos verbatim: las repeticiones por tartamudeo se escriben en los transcripts, y los modelos entrenados con ellos pueden escribirlas o no; los bloqueos y prolongaciones no son visibles en el texto.
- Las frases leídas son más fáciles: aparecen también en los transcripts de entrenamiento, por lo que los resultados con picture prompts son la mejor guía para habla abierta.
- No usar para decisiones sobre personas: no debe emplearse para diagnosticar o evaluar ninguna condición del habla, identificar hablantes, ni en decisiones clínicas, legales o de aplicación de la ley.
- Los términos de CDLI prohíben reidentificar hablantes y construir voces que imiten a un hablante.
- Una transcripción errónea puede cambiar el significado de lo que dijo una persona: el texto debe mostrarse al hablante antes de actuar sobre él.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero las restricciones de los términos CDLI sobre el dataset subyacente siguen aplicando al uso de los datos.
- El dataset de entrenamiento no se incluye en el repositorio y su acceso está restringido, lo que limita la reproducibilidad completa del ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/parakeet-ctc-en-ft-10ep-onnx
- Modelo base: https://huggingface.co/oluwagbotty/parakeet-ctc-en-ft-10ep
- Dataset CDLI (acceso gated): https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
- Centre for Digital Language Inclusion, UCL: no disponible
- Script de exportación `src/export_nemo_onnx.py`: no disponible (referenciado en la model card sin URL)
