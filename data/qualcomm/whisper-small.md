# qualcomm/Whisper-Small

## Resumen

Whisper-Small de Qualcomm es una versión optimizada para inferencia en dispositivo (*edge*) del modelo de reconocimiento automático de voz Whisper-Small de OpenAI, publicada por Qualcomm dentro de su ecosistema Qualcomm AI Hub. El modelo conserva la tarea del original (transcripción de voz a texto) pero modifica su arquitectura interna para adaptarla al hardware de los SoC Snapdragon y Dragonwing, sustituyendo la atención multi-cabeza (MHA) por atención de una sola cabeza (SHA) y las capas lineales por capas convolucionales.

El resultado es un sistema pensado para ejecutarse íntegramente en el NPU Hexagon de dispositivos móviles y de cómputo en el borde, sin depender de la nube. Según la model card, mantiene un rendimiento robusto en entornos ruidosos y destaca en transcripción de formato largo, procesando fragmentos de audio de hasta 30 segundos. La latencia se descompone en el tiempo hasta el primer token (latencia del codificador) y el tiempo por token adicional (latencia del decodificador).

El repositorio de HuggingFace, de 50,1 GB, no contiene solo pesos: incluye artefactos precompilados (ONNX con QNN y binarios de contexto QNN) para múltiples chipsets, además de la posibilidad de reexportar el modelo con configuraciones propias mediante la librería Qualcomm AI Hub Models. Está licenciado bajo Apache 2.0 y su pipeline declarado es `automatic-speech-recognition`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para ASR, con atencion de una sola cabeza (SHA) en lugar de multi-cabeza (MHA) y capas lineales sustituidas por convolucionales |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; procesa fragmentos de audio de hasta 30 segundos |
| Tipos de cuantizacion | no disponible; los artefactos precompilados publicados usan precision `float` |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (modelo base) y artefactos precompilados `PRECOMPILED_QNN_ONNX` y `QNN_CONTEXT_BINARY` para despliegue |
| Tamano del repositorio | 50,1 GB |
| Runtime de despliegue | QAIRT 2.45, ONNX Runtime 1.27.1, Qualcomm Voice AI SDK |
| Fecha de creacion | 2025-08-30 |
| Ultima actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

El modelo parte de la implementación de Whisper-Small incluida en la librería `transformers` (referencia v4.42.3). Sobre esa base, Qualcomm aplica una reingeniería orientada a la inferencia en el borde: la atención multi-cabeza se reemplaza por atención de una sola cabeza y las capas lineales se convierten en capas convolucionales. Según la model card, estas modificaciones son las que permiten ejecutar el modelo en dispositivos Qualcomm manteniendo un rendimiento robusto en entornos ruidosos y una transcripción precisa en formato largo.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Tampoco se especifica si estas modificaciones arquitectónicas van acompañadas de un reentrenamiento completo o de una destilación desde los pesos originales. La separación explícita entre latencia del codificador (tiempo hasta el primer token) y del decodificador (tiempo por token adicional) confirma un diseño encoder-decoder típico de Whisper, optimizado para el desglose de coste por componente.

## Capacidades

- Reconocimiento automático de voz (*automatic speech recognition*): transcripción de audio a texto, con foco en transcripción de formato largo de hasta 30 segundos por fragmento.
- Rendimiento robusto en entornos reales con ruido, según lo indicado por el autor.
- Ejecución en dispositivo mediante NPU (Hexagon) en chipsets Qualcomm Snapdragon y Dragonwing, sin necesidad de conexión a la nube.
- Exportación personalizable: el modelo se puede reexportar con configuraciones propias usando la librería Qualcomm AI Hub Models.
- Integración con el Qualcomm Voice AI SDK para despliegue en dispositivo.
- Capacidades multilingües: no especificadas en la información proporcionada.
- Tool calling, function calling y uso como agente: no aplicable, es un modelo de ASR.
- Capacidades de visión o audio más allá de la transcripción: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción en el propio dispositivo móvil: integrado mediante el Qualcomm Voice AI SDK, permite dictado y transcripción de notas de voz sin enviar el audio a servidores externos, lo que reduce latencia y mejora la privacidad.
- Asistentes de voz embebidos: el modelo decodifica la entrada de audio en el NPU del terminal, habilitando interacción por voz en aplicaciones de telefonía, automoción o domótica con independencia de la cobertura de red.
- Subtitulado de reuniones en el borde: para fragmentos de hasta 30 segundos, se puede encadenar la transcripción por bloques y generar subtítulos en aplicaciones de videoconferencia que se ejecutan en portátiles con Snapdragon X Elite o X2 Elite.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones presenciales en tiempo real sobre dispositivos con Snapdragon 8 Gen 1 o superior, aprovechando la ejecución local.
- Postprocesado de grabaciones de campo: análisis de entrevistas, notas de voz o audios de inspección en dispositivos Dragonwing (IoT industrial), transcribiendo localmente sin depender de conectividad.
- Ampliación de pipelines de ASR existentes: al ser compatible con ONNX Runtime y QNN, se puede insertar como etapa de decodificación en sistemas de transcripción ya desplegados en hardware Qualcomm, reutilizando los binarios de contexto precompilados.
- Despliegue en dispositivos de borde con restricciones energéticas: aplicaciones de domótica, wearables o cámaras inteligentes que requieren transcripción puntual dentro del presupuesto térmico y de batería del SoC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card referencia un apartado de resumen de rendimiento (`#performance-summary`) y menciona que los detalles de rendimiento por dispositivo están disponibles en Qualcomm AI Hub Workbench, pero no se incluyen cifras concretas (WER, latencia, throughput) en la información proporcionada.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en el NPU (Hexagon) de SoC Qualcomm, no en GPUs convencionales. Los artefactos precompilados cubren los siguientes chipsets: Snapdragon X2 Elite, Snapdragon X Elite, Snapdragon 8 Gen 3 Mobile, Snapdragon 8 Gen 1 Mobile, Snapdragon 8 Elite Mobile, Snapdragon 8 Elite Gen 5 Mobile, Dragonwing IQ-8275, Dragonwing QCS8550 (Proxy) y Dragonwing IQ-9075.
- VRAM estimada para inferencia: no disponible en la información proporcionada (el destino es el NPU del terminal, no memoria de GPU dedicada).
- GPU recomendadas: no aplicable; el modelo está optimizado para aceleradores Qualcomm. Para despliegue en GPU convencional habría que recurrir al Whisper-Small original.
- ¿Cabe en GPU de consumo? No procede para esta variante optimizada; el objetivo son dispositivos con Snapdragon o Dragonwing.
- Opciones de despliegue: QNN (Qualcomm AI Engine Direct) mediante `PRECOMPILED_QNN_ONNX` o `QNN_CONTEXT_BINARY`, sobre QAIRT 2.45 y ONNX Runtime 1.27.1; integración con Qualcomm Voice AI SDK distribuido por Qualcomm Package Manager.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La model card separa conceptualmente el tiempo hasta el primer token (codificador) y el tiempo por token adicional (decodificador), pero no publica valores numéricos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qualcomm/Whisper-Small | no disponible | fragmentos de hasta 30 s | no disponible | Apache 2.0 | HuggingFace + Qualcomm AI Hub |
| openai/whisper-small | ~244 M (dato publico del modelo base) | fragmentos de hasta 30 s | multilingue (99 idiomas, dato publico del modelo base) | Apache 2.0 | HuggingFace |
| openai/whisper-small.en | ~244 M (dato publico) | fragmentos de hasta 30 s | ingles | Apache 2.0 | HuggingFace |

La comparación cuantitativa de rendimiento (WER, latencia) no está disponible en la información proporcionada. La diferencia principal de la variante de Qualcomm frente al Whisper-Small original es la reingeniería de atención y capas para ejecución en NPU, junto con los artefactos precompilados por chipset.

## Limitaciones y advertencias

- La información pública no especifica los idiomas soportados; no se puede asumir cobertura multilingüe sin verificar la variante concreta.
- No se publican cifras de WER ni de rendimiento por dispositivo, por lo que la calidad real en producción debe validarse mediante Qualcomm AI Hub Workbench o pruebas propias.
- El modelo procesa fragmentos de hasta 30 segundos; la transcripción de audio más largo requiere segmentación previa, lo que puede introducir errores en las uniones entre bloques.
- La ejecución está atada al ecosistema Qualcomm (QAIRT, QNN, ONNX Runtime y Voice AI SDK); no es un modelo portable a GPU NVIDIA, AMD o Apple Silicon sin reexportación.
- El repositorio ocupa 50,1 GB, lo que complica su descarga y almacenamiento si solo se necesita un chipset concreto.
- Riesgo de alucinación y de sesgos heredado del modelo base Whisper-Small de OpenAI; la model card no documenta evaluaciones específicas de sesgo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del Voice AI SDK y del Qualcomm Package Manager, que son componentes separados.
- El repositorio tiene un número de descargas muy bajo (0) y una sola interacción, lo que indica escasa validación por parte de la comunidad.
- No se documentan detalles de entrenamiento ni de ajuste, lo que dificulta auditar el comportamiento del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/Whisper-Small
- Qualcomm AI Hub Models (implementacion de whisper_small): https://github.com/qualcomm/ai-hub-models/blob/v0.62.2/src/qai_hub_models/models/whisper_small
- Implementacion de Whisper en transformers v4.42.3: https://github.com/huggingface/transformers/tree/v4.42.3/src/transformers/models/whisper
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Qualcomm Voice AI SDK (Qualcomm Package Manager): https://qpm.qualcomm.com/#/main/tools/details/VoiceAI_ASR
- Qualcomm (sitio corporativo): https://www.qualcomm.com/
- Qualcomm en Wikipedia: https://en.wikipedia.org/wiki/Qualcomm
