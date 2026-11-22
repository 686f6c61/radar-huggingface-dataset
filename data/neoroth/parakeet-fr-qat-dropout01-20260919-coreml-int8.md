# NeoRoth/parakeet-fr-qat-dropout01-20260919-coreml-int8

## Resumen

El modelo `NeoRoth/parakeet-fr-qat-dropout01-20260919-coreml-int8` es un modelo de reconocimiento automático del habla (ASR) especializado en francés, derivado de NVIDIA Parakeet TDT 0.6B v3 mediante fine-tuning con adaptadores LoRA y posteriormente exportado a formato Core ML con cuantización INT8. Lo desarrolla NeoRoth (el equipo detrás de Oriloq) para su uso como motor de dictado francés dentro de la aplicación Oriloq en Mac con Apple Silicon. No es un checkpoint genérico de Transformers o NeMo, sino un bundle de runtime empaquetado específicamente para el backend Parakeet Core ML de Oriloq.

La arquitectura subyacente es un encoder Conformer (heredado de Parakeet TDT 0.6B) combinado con un decodificador nativo TDT (Token-and-Duration Transducer) que incluye un predictor LSTM y una red conjunta. El modelo base ronda los 0,6 mil millones de parámetros. La versión publicada (`qat-20261120-e6`, actualizada el 22 de noviembre de 2026) corresponde a la sexta época de un proceso de quantisation-aware training (QAT), con pesos INT8 simétricos por canal en el encoder y cálculo en FP16.

Su relevancia radica en que ejemplifica un patrón de despliegue on-device para ASR en el ecosistema Apple: encoder compilado para Neural Engine y CPU, frontend MEL y decodificador en CPU, todo empaquetado en un bundle que no requiere infraestructura de servidor. El repositorio ocupa 2,2 GB y acumula 351 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Conformer + decodificador TDT (Token-and-Duration Transducer) con predictor LSTM y joint network |
| Parametros totales | aproximadamente 0,6 mil millones (heredados de NVIDIA Parakeet TDT 0.6B v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (funciones de encoder para 501, 1 501 y 3 001 frames MEL) |
| Tipos de cuantizacion | INT8 simetrico por canal en encoder (con calculo FP16); predictor LSTM y joint network en FP32 |
| Idiomas soportados | frances (fr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (`encoder.mlmodelc/`), `predictor_joint.safetensors`, tokenizers y vocabularios; no es un checkpoint generico Transformers o NeMo |
| Tamano del repositorio | 2,2 GB |
| Frecuencia de muestreo de entrada | 16 kHz, mono |
| Requisito de plataforma | macOS 15 minimo para el export Core ML; backend CPU + Neural Engine |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 |
| Metodo de adaptacion | LoRA (rango 16, alpha 32) fusionado en el modelo base |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA Parakeet TDT 0.6B v3, un sistema ASR basado en encoder Conformer con decodificador Token-and-Duration Transducer. El ajuste al francés se realizó mediante adaptadores LoRA de rango 16 y alpha 32, que posteriormente se fusionaron en los pesos del modelo base. Sobre esa versión fusionada se aplicó un proceso de quantisation-aware training (QAT) que dio lugar a la exportación Core ML INT8 publicada. La versión `qat-20261120-e6` corresponde a la sexta época del proceso QAT, cuyo export se generó el 20 de noviembre de 2026 y se publicó el 22 de noviembre de 2026.

La innovación técnica principal es el empaquetado híbrido para Apple Silicon: el encoder Conformer compilado en Core ML usa pesos INT8 simétricos por canal con cómputo en FP16 y se ejecuta en CPU + Neural Engine, mientras que el frontend MEL y el decodificador nativo TDT (predictor LSTM y joint network en FP32) permanecen en CPU. El modelo expone funciones de encoder para 501, 1 501 y 3 001 frames MEL, lo que condiciona los tamaños de ventana de audio procesables. No se publican detalles sobre el volumen de datos de entrenamiento, la composición del corpus francés ni si hubo etapas de RLHF o DPO; la model card indica explícitamente que no se distribuyen audios, transcripciones, diagnósticos con ejemplos, checkpoints de entrenamiento ni rutas locales privadas.

## Capacidades

- Reconocimiento automático del habla en francés sobre audio mono a 16 kHz.
- Transcripción orientada a dictado, con verificación de una grabación francesa de referencia mediante el backend Core ML de Oriloq.
- Ejecución on-device en Mac con Apple Silicon, con reparto de carga entre CPU y Neural Engine.
- Procesamiento por ventanas de frames MEL (501, 1 501 y 3 001 frames) según la función de encoder invocada.
- Decodificación TDT con predictor LSTM y joint network en FP32 para preservar precisión en la salida.
- No se documentan capacidades de traducción, diarización, timestamps por palabra, tool calling ni razonamiento multi-paso.

## Casos de uso

- Dictado por voz en la aplicación Oriloq para macOS: el bundle está diseñado como runtime del backend Parakeet Core ML de Oriloq, de modo que la app carga directamente `encoder.mlmodelc/` y `predictor_joint.safetensors` para transcribir audio del micrófono en francés sin conexión a servidores.
- Transcripción local de notas de voz y reuniones en francés: al ejecutarse en CPU + Neural Engine, permite procesar grabaciones en un Mac sin enviar audio a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado offline de contenido audiovisual francés: las funciones de encoder para 501, 1 501 y 3 001 frames permiten segmentar el audio en ventanas y generar transcripciones por tramos.
- Accesibilidad para usuarios francófonos con dificultades de escritura: integrado en una app de escritorio, el modelo convierte voz en texto en tiempo real sobre hardware Apple Silicon.
- Investigación y evaluación de ASR cuantizado: el paquete permite comparar el rendimiento del encoder INT8 frente al modelo base FP32 en francés, dentro del ecosistema Core ML.
- Prototipado de pipelines ASR on-device en macOS: sirve como referencia de empaquetado híbrido (Core ML + safetensors + tokenizers) para equipos que quieran replicar el esquema con otros idiomas o dominios.
- Distribución de un motor de dictado especializado: al estar bajo CC BY 4.0, terceros pueden redistribuirlo manteniendo la atribución a NVIDIA/NeMo y señalando las modificaciones de Oriloq.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona la verificación de la transcripción de una grabación francesa de referencia con el backend Core ML de Oriloq, sin cifras de WER, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para ejecución en Apple Silicon con reparto CPU + Neural Engine, no para GPU discretas.
- GPU recomendadas: no aplica en el sentido habitual; el destino es el Neural Engine y la CPU de chips Apple Silicon (M-series).
- Cabe en GPU de consumo: no disponible para GPU NVIDIA/AMD; el formato Core ML no es portable a esas plataformas.
- Plataforma mínima: macOS 15 para el export Core ML; los requisitos finales de la aplicación los determina la versión de Oriloq.
- Opciones de despliegue: exclusivamente el backend Parakeet Core ML de Oriloq; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Contexto / ventana |
|---|---|---|---|---|---|
| NeoRoth/parakeet-fr-qat-dropout01-20260919-coreml-int8 | ~0,6 B | fr | Core ML INT8 + safetensors | CC BY 4.0 | Funciones para 501, 1 501 y 3 001 frames MEL |
| nvidia/parakeet-tdt-0.6b-v3 (modelo base) | ~0,6 B | multilingue (segun model card de NVIDIA) | NeMo / safetensors | no disponible en esta ficha | no disponible en esta ficha |
| NeoRoth/oriloq-asr-fr-coreml | mismo runtime | fr | Core ML INT8 + safetensors | CC BY 4.0 | mismas funciones de encoder |

La comparación con alternativas de otros ecosistemas (Whisper, Wav2Vec 2.0, etc.) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo francés; no se documenta soporte para otros idiomas.
- Formato no estándar: no es un checkpoint genérico de Transformers o NeMo, sino un bundle runtime para el backend Parakeet Core ML de Oriloq; no se puede cargar con herramientas convencionales.
- Dependencia de plataforma: requiere macOS 15 o superior y hardware Apple Silicon; no es portable a Linux, Windows ni GPU NVIDIA.
- Entrada restringida: audio mono a 16 kHz; no se documentan mecanismos de remuestreo o normalización internos.
- Ventanas fijas: las funciones de encoder están limitadas a 501, 1 501 y 3 001 frames MEL, lo que condiciona la longitud máxima de audio por invocación.
- Sin datos de evaluación pública: no hay cifras de WER ni comparativas frente al modelo base, por lo que el impacto de la cuantización INT8 y del fine-tuning LoRA no es verificable de forma independiente.
- Riesgo de alucinación en ASR: como todo sistema de transcripción, puede producir sustituciones o inserciones en audio ruidoso, con acentos no representados en el corpus de ajuste o con solapamiento de hablantes; no se documenta el corpus utilizado.
- Sesgos: no se publica información sobre la composición demográfica o dialectal de los datos de entrenamiento, por lo que no es posible evaluar sesgos por acento, género o edad.
- Licencia CC BY 4.0: permite uso comercial y redistribución, pero exige atribución a NVIDIA/NeMo, indicación de las modificaciones de Oriloq y referencia a la licencia.
- Trazabilidad limitada: la model card indica que no se publican audios, transcripciones, diagnósticos con ejemplos, checkpoints de entrenamiento ni rutas locales privadas, lo que dificulta la reproducibilidad del ajuste.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/NeoRoth/parakeet-fr-qat-dropout01-20260919-coreml-int8
- Repositorio francés con nombre estable: https://huggingface.co/NeoRoth/oriloq-asr-fr-coreml
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Sitio de Oriloq: https://oriloq.com
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
