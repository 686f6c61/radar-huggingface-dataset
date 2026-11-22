# NeoRoth/oriloq-asr-fr-coreml

## Resumen

Oriloq ASR français es un modelo de reconocimiento automático del habla (ASR) especializado en dictado en francés, derivado del modelo NVIDIA Parakeet TDT 0.6B v3. Lo desarrolla NeoRoth (equipo de Oriloq) y está empaquetado como bundle Core ML optimizado para Apple Silicon, con pesos INT8 simétricos por canal en el codificador y cálculo en FP16. Su propósito es servir como motor de transcripción dentro de la aplicación Oriloq en macOS, no como checkpoint genérico de Transformers o NeMo.

Técnicamente es un ajuste fino con adaptadores LoRA (rango 16, alpha 32) fusionados en el modelo base, seguido de un proceso de quantización consciente del entrenamiento (QAT) y exportación a Core ML. La arquitectura subyacente es un codificador Conformer con decodificador TDT (Token-and-Duration Transducer), que combina un predictor LSTM y una red conjunta en FP32 ejecutados en CPU, mientras el codificador compilado se reparte entre CPU y Neural Engine.

La relevancia actual del modelo es acotada pero concreta: demuestra un flujo completo de adaptación de un ASR de NVIDIA al ecosistema Core ML con cuantización INT8 y QAT para despliegue local en Mac. Está publicado bajo licencia CC BY 4.0, con solo 36 descargas y sin likes en el momento de redactar esta ficha, lo que indica una distribución muy incipiente y orientada a un producto cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador Conformer + decodificador TDT (predictor LSTM + joint network); bundle Core ML |
| Parametros totales | 0,6 mil millones (heredados de Parakeet TDT 0.6B v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (funciones de codificador para 501, 1501 y 3001 frames MEL) |
| Tipos de cuantizacion | INT8 simetrico por canal en codificador (QAT), calculo FP16; decodificador en FP32 |
| Idiomas soportados | Frances (fr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (`encoder.mlmodelc/`) + `predictor_joint.safetensors` + tokenizers/vocabularios |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA Parakeet TDT 0.6B v3, un sistema ASR basado en codificador Conformer con decodificador Token-and-Duration Transducer. Sobre esa base se aplicaron adaptadores LoRA de rango 16 y alpha 32 para especializar el modelo en francés; posteriormente los adaptadores se fusionaron en los pesos del modelo base. El pipeline continúa con un proceso de quantización consciente del entrenamiento (QAT) y una exportación a Core ML, dando lugar a la versión `qat-20261120-e6` publicada el 22 de noviembre de 2026, que corresponde al export Core ML INT8 de la sexta época entregado el 20 de noviembre.

El bundle distribuido es híbrido: el codificador Conformer compilado en Core ML usa pesos INT8 simétricos por canal con cálculo FP16 y se ejecuta en CPU más Neural Engine, mientras que el frontend MEL y el decodificador nativo TDT (predictor LSTM y joint network en FP32) permanecen en CPU. La entrada de audio es mono a 16 kHz y el export Core ML requiere macOS 15 como mínimo. No se publican datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni detalles del corpus francés utilizado para el ajuste LoRA.

## Capacidades

- Transcripción de voz a texto en francés para dictado, con audio de entrada mono a 16 kHz.
- Procesamiento por ventanas de frames MEL de 501, 1501 y 3001 frames, lo que permite segmentos de distinta duración.
- Ejecución local en Apple Silicon mediante Core ML, con reparto entre CPU y Neural Engine.
- Cuantización INT8 con QAT para reducir huella de memoria y acelerar la inferencia en hardware Apple.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de capacidades multimodales (visión, audio más allá de la transcripción) ni de modo de razonamiento extendido.
- Capacidad multilingüe limitada al francés; no se declaran otros idiomas.

## Casos de uso

- Dictado en la aplicación Oriloq para macOS: el modelo se carga con el backend Parakeet Core ML de Oriloq y transcribe en local el audio del usuario, aprovechando el Neural Engine para reducir latencia y consumo en Mac con Apple Silicon.
- Transcripción de notas de voz en francés en flujos de productividad personal: al ejecutarse íntegramente en el dispositivo, evita enviar audio a servidores externos, lo que resulta adecuado para contenido sensible.
- Subtitulado o indexación de reuniones en francés en entornos macOS: la ventana de frames de hasta 3001 frames permite procesar segmentos largos sin trocear en exceso, facilitando pipelines de post-proceso sobre transcripciones.
- Prototipado de asistentes de voz en francés sobre Mac: el bundle Core ML se integra en aplicaciones nativas mediante el backend de Oriloq, sirviendo como base para validar experiencia de dictado antes de escalar a otros idiomas.
- Evaluación de técnicas de QAT y export Core ML para equipos que quieran replicar el flujo con otros modelos Parakeet o idiomas, usando este repositorio como referencia de estructura de bundle (`config.json`, `encoder.mlmodelc/`, `predictor_joint.safetensors`).
- Investigación sobre adaptación LoRA de ASR de NVIDIA a dominios concretos: el enfoque de fusión de adaptadores más cuantización INT8 documentado aquí es reutilizable para estudiar compromisos entre precisión y tamaño en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la transcripción de un registro de referencia en francés fue verificada con el backend Core ML de Oriloq, sin cifras de WER, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 2,7 GB y el codificador usa pesos INT8, por lo que la huella en memoria unificada de Apple Silicon será del orden de pocos GB, aunque el autor no publica cifras.
- GPU recomendadas: hardware Apple Silicon (CPU + Neural Engine) con macOS 15 o superior; no se contemplan GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo: el modelo está diseñado para Mac con Apple Silicon, no para GPU de consumo tipo RTX 4090.
- Opciones de despliegue: exclusivamente el backend Parakeet Core ML de Oriloq; no es un checkpoint genérico de Transformers, NeMo, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Oriloq ASR fr Core ML (este modelo) | 0,6 B | Ventanas de 501, 1501 y 3001 frames MEL; audio mono 16 kHz | Frances | CC BY 4.0 | Core ML + safetensors; solo backend Oriloq en Apple Silicon |
| NVIDIA Parakeet TDT 0.6B v3 (base) | 0,6 B | No disponible en esta ficha | Multilingue segun modelo base | No disponible en esta ficha | NeMo / Transformers |
| Whisper (variantes pequenas) | No disponible en esta ficha | No disponible en esta ficha | Multilingue | No disponible en esta ficha | Transformers, whisper.cpp, etc. |
| Alternativas ASR en Core ML para frances | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas no puede realizarse porque no se han publicado resultados de benchmarks en la información disponible.

## Limitaciones y advertencias

- El modelo solo soporta francés; no se declaran otros idiomas ni se garantiza comportamiento fuera de ese ámbito.
- No es un checkpoint genérico: requiere el backend Parakeet Core ML de Oriloq y no se carga con Transformers, NeMo, vLLM ni llama.cpp.
- Dependencia de plataforma: export Core ML con macOS 15 como mínimo y ejecución en Apple Silicon (CPU + Neural Engine); no funciona en GPU NVIDIA ni en otros sistemas.
- Riesgo de alucinación y errores de transcripción inherente a los sistemas ASR, especialmente en audio ruidoso, acentos no representados en el corpus de ajuste o vocabulario técnico; no se publican métricas de WER que permitan cuantificarlo.
- Sesgos desconocidos: no se documenta la composición del dataset de ajuste ni la distribución de hablantes, por lo que no puede evaluarse el sesgo por género, edad o variante regional del francés.
- Restricciones de licencia: CC BY 4.0 permite uso comercial, pero exige atribución a NVIDIA / equipo NeMo por el modelo base, indicar las modificaciones de Oriloq (LoRA, fusión de adaptadores, export) y referenciar la licencia en cualquier redistribución.
- Trazabilidad limitada: el autor declara que no se publican audios, transcripciones, diagnósticos con ejemplos, checkpoints de entrenamiento ni rutas locales privadas, lo que dificulta la reproducción del ajuste.
- Madurez baja: 36 descargas y 0 likes en el momento de la ficha; el proyecto depende de la aplicación Oriloq para su uso práctico.
- El repositorio incluye un enlace a un depósito de descarga histórico distinto (`NeoRoth/parakeet-fr-qat-dropout01-20260919-coreml-int8`), lo que puede generar confusión sobre qué artefacto consume realmente la aplicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeoRoth/oriloq-asr-fr-coreml
- Modelo base NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Aplicación Oriloq: https://www.oriloq.app
- Depósito de descarga histórico: https://huggingface.co/NeoRoth/parakeet-fr-qat-dropout01-20260919-coreml-int8
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
