# jermalk/whisper-large-v3-int8-ov

## Resumen

Este repositorio, `jermalk/whisper-large-v3-int8-ov`, es una réplica byte a byte del modelo `OpenVINO/whisper-large-v3-int8-ov` (revisión `e197310d`), publicado originalmente por Intel. Se trata de `openai/whisper-large-v3` convertido al formato OpenVINO IR (Intermediate Representation) con los pesos comprimidos a INT8 mediante NNCF. Su propósito es servir de modelo de arranque para RustedVINO, de modo que todas las dependencias iniciales provengan de una única fuente.

El modelo resuelve la tarea de reconocimiento automático de voz (ASR): transcripción de audio a texto y traducción de voz a inglés. Al estar cuantizado a INT8 y exportado a OpenVINO IR, está pensado para inferencia eficiente en CPU y GPU Intel sin necesidad de hardware NVIDIA, con un consumo de memoria notablemente inferior al del modelo original en precisión completa.

La arquitectura subyacente es la de Whisper large-v3: un transformer encoder-decoder de tipo secuencia a secuencia que procesa ventanas de audio de 30 segundos. El repositorio ocupa 1,6 GB, la licencia es Apache 2.0 y la conversión y cuantización originales son obra de Intel; el crédito del modelo original corresponde a OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) de tipo Whisper large-v3 |
| Parametros totales | 1550 millones (heredados del modelo base openai/whisper-large-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos por pasada (formato característico de Whisper) |
| Tipos de cuantizacion | INT8 (INT8_ASYM, group_size 128, compresión de pesos con NNCF) |
| Idiomas soportados | no disponible en la ficha del repo; el modelo base es multilingüe (la traducción de voz solo produce inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (.xml/.bin) |

## Arquitectura y entrenamiento

El modelo es una conversión a OpenVINO IR de `openai/whisper-large-v3`, con compresión de pesos a INT8 asimétrico (`nncf.compress_weights`, mode INT8_ASYM, group_size 128). No se ha reentrenado ni ajustado: se trata del mismo grafo de encoder-decoder de Whisper, únicamente optimizado y cuantizado para el runtime de OpenVINO. Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset y fases de ajuste) no se proporcionan en la información disponible.

La innovación técnica relevante aquí no está en el entrenamiento, sino en la conversión: el uso de NNCF para la compresión de pesos a INT8 y la exportación a OpenVINO IR permiten ejecutar un modelo de 1550 millones de parámetros en CPU con un consumo de memoria del orden de 4 GB. La conversión es compatible con OpenVINO 2025.2.0 o superior y Optimum Intel 1.23.0 o superior.

## Capacidades

- Transcripción de voz a texto (ASR) en ventanas de audio de 30 segundos.
- Traducción de voz a texto, limitada al inglés (endpoint `/v1/audio/translations`).
- Ejecución en CPU y GPU Intel a través del runtime de OpenVINO, sin dependencia de CUDA.
- Integración con OpenVINO GenAI mediante `WhisperPipeline`.
- Integración con Optimum Intel mediante `OVModelForSpeechSeq2Seq`.
- Despliegue como servicio compatible con la API de OpenAI a través de OpenVINO Model Server (OVMS).
- Soporte multilingüe heredado del modelo base; la lista explícita de idiomas no se declara en la ficha del repositorio.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al ser un modelo específico de ASR.

## Casos de uso

- Transcripción por lotes en servidores sin GPU: el modelo puede procesar archivos de audio en CPU con OpenVINO, lo que permite montar pipelines de transcripción en máquinas sin aceleradores NVIDIA y con un consumo de memoria moderado (unos 4 GB en CPU según el autor).
- Traducción de voz a inglés: mediante el endpoint de traducciones, se puede convertir audio en otros idiomas directamente a texto en inglés, útil para flujos de localización o documentación multilingüe.
- Subtitulado automático de contenido audiovisual: integrado en un CMS o pipeline de vídeo, genera transcripciones que después se segmentan en subtítulos con marcas de tiempo.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones telefónicas para su posterior indexado, clasificación o búsqueda, aprovechando la ejecución local en CPU para evitar enviar audio a servicios externos.
- Indexado y búsqueda de contenido de audio: transcripción de podcasts, reuniones o clases para construir índices de texto consultables.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en aplicaciones de escritorio o web, ejecutando el modelo en el propio equipo (edge) gracias a su reducido tamaño en INT8.
- Despliegue como microservicio compatible con OpenAI: levantando OVMS se expone una API compatible con clientes OpenAI, lo que facilita integrar la transcripción en aplicaciones existentes sin reescribir el cliente.
- Prototipado en hardware Intel de consumo: el modelo está medido en un Intel Core Ultra 7 forzado a CPU, lo que lo hace apto para demostraciones y entornos de desarrollo sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento aportado es una medición del autor en un portátil con Intel Core Ultra 7 (CPU): aproximadamente 0,6x tiempo real y 4,0 GB de RAM en uso, con una variabilidad declarada de hasta el 25 % entre ejecuciones. Estas cifras deben tratarse como órdenes de magnitud.

## Requisitos de hardware

- VRAM estimada: no aplica en inferencia por CPU. Los pesos en INT8 ocupan aproximadamente 1,6 GB (tamaño del repo), por lo que en GPU Intel la memoria necesaria es reducida en comparación con el modelo en precisión completa.
- Memoria en CPU: alrededor de 4,0 GB de RAM en el Intel Core Ultra 7 medido por el autor.
- GPU recomendadas: no se especifican modelos concretos. Al ser OpenVINO, el objetivo natural son iGPU Intel, GPU Intel Arc y CPU Intel; no se menciona soporte CUDA.
- ¿Cabe en hardware de consumo? Sí; el modelo está pensado para CPU de portátil y equipos sin GPU dedicada.
- Opciones de despliegue: OpenVINO GenAI (`WhisperPipeline`), Optimum Intel (`OVModelForSpeechSeq2Seq`), OpenVINO Model Server (OVMS, en Windows o contenedor, con API compatible con OpenAI) y RustedVINO (mediante `rv add whisper-large-v3-int8-ov`).
- Latencia y throughput: aproximadamente 0,6x tiempo real en el Core Ultra 7 en CPU, según la medición del autor; no se aportan datos de otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Precision / formato | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jermalk/whisper-large-v3-int8-ov | 1550 M (base) | INT8, OpenVINO IR | Multilingüe (base); traducción solo a inglés | apache-2.0 | HuggingFace (copia del repo de Intel) |
| OpenVINO/whisper-large-v3-int8-ov | 1550 M (base) | INT8, OpenVINO IR | Multilingüe (base) | apache-2.0 | HuggingFace (original de Intel) |
| openai/whisper-large-v3 | 1550 M | fp32/fp16, safetensors | Multilingüe | apache-2.0 | HuggingFace |
| faster-whisper (CTranslate2) | 1550 M (base) | INT8/FP16, CTranslate2 | Multilingüe | Apache 2.0 (según implementación) | Repositorio propio |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo entre estas variantes en la información proporcionada. La comparativa se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Es una réplica, no una conversión propia: el autor indica que es copia byte a byte del modelo de Intel (revisión `e197310d`) y que todo el crédito de la conversión es de Intel.
- La cuantización a INT8 puede degradar ligeramente la precisión respecto al modelo en precisión completa; no se aportan métricas de calidad (WER) para cuantificar ese impacto.
- La funcionalidad de traducción de voz solo produce inglés; no se ofrece traducción a otros idiomas destino.
- El modelo procesa audio en ventanas de 30 segundos, lo que impone límites prácticos para audios muy largos (requiere segmentación previa).
- No se documentan en la ficha los sesgos del modelo base ni su comportamiento ante acentos, ruido o dominios específicos; deben evaluarse aparte.
- Riesgo de alucinación típico de los modelos de ASR generativos, especialmente en segmentos con silencio, ruido o audio ininteligible.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base (`openai/whisper-large-v3`) y de las dependencias de OpenVINO/NNCF.
- El repositorio tiene 0 descargas, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- Está atado al runtime de OpenVINO; no es directamente utilizable en frameworks como PyTorch o llama.cpp sin conversión.
- La fecha de creación/actualización indicada (2026-10-12) es la registrada por el Hub y conviene verificarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jermalk/whisper-large-v3-int8-ov
- Modelo original de la conversión: https://huggingface.co/OpenVINO/whisper-large-v3-int8-ov
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- OpenVINO IR: https://docs.openvino.ai/2025/documentation/openvino-ir-format.html
- Guía de optimización de OpenVINO: https://docs.openvino.ai/2025/openvino-workflow/model-optimization-guide/weight-compression.html
- NNCF: https://github.com/openvinotoolkit/nncf
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- Documentación de OpenVINO GenAI (README de ejemplos): https://github.com/openvinotoolkit/openvino.genai/blob/master/src/README.md
- OpenVINO Model Server: https://github.com/openvinotoolkit/model_server
- Despliegue de OVMS en bare metal: https://docs.openvino.ai/ovms_baremetal
- Optimum Intel: https://huggingface.co/docs/optimum/intel/index
- RustedVINO (herramienta que usa este modelo): no disponible enlace directo en la información proporcionada.
