# kkrishnan90/whispr-asr

## Resumen

Whispr ASR es una distribución ONNX del modelo de reconocimiento automático del habla (ASR) `moondream/parakeet-ultra`, que a su vez es una versión post-entrenada de `nvidia/parakeet-tdt-0.6b-v3`. El modelo está pensado para inferencia en dispositivo (on-device), concretamente para iOS mediante WebGPU/WASM y para ONNX Runtime nativo. Lo publica el usuario `kkrishnan90` en Hugging Face y deriva de pesos con licencia CC-BY-4.0.

La relevancia de esta ficha radica en que empaqueta un modelo ASR de ~0,6 mil millones de parámetros en formato ONNX cuantizado (INT4/W4A8 con decodificador INT8), lo que reduce el peso del repositorio a 0,4 GB y facilita su despliegue en entornos con recursos limitados. Cubre 25 idiomas europeos, incluido el castellano, y emplea la arquitectura Parakeet TDT (Token-and-Duration Transducer) de NVIDIA.

No se trata de un modelo entrenado desde cero por el autor de esta distribución, sino de un artefacto de exportación y cuantización. La model card es muy escueta y no aporta datos sobre entrenamiento, benchmarks ni composición del dataset original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), exportada a ONNX |
| Parametros totales | ~0,6 mil millones (según el nombre del modelo base `parakeet-tdt-0.6b-v3`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MatMulNBits 4-bit con bloque de 32 (W4A8) en el encoder; decodificador INT8 |
| Idiomas soportados | 25 idiomas: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (cuantizado) |

## Arquitectura y entrenamiento

El modelo subyacente emplea la arquitectura Parakeet TDT de NVIDIA, un transductor (transducer) que predice conjuntamente tokens y duraciones, lo que permite un alineamiento eficiente entre audio y texto sin necesidad de un modelo de lenguaje externo para el decodificado. Esta distribución concreta es una exportación ONNX del checkpoint post-entrenado `moondream/parakeet-ultra`, que parte de `nvidia/parakeet-tdt-0.6b-v3`.

La cuantización aplicada consiste en `MatMulNBits` de 4 bits con bloques de 32 (esquema W4A8) para las matrices del encoder, una optimización del `rel_shift` mediante Gather y una prohibición del token `<unk>` en el decodificador INT8. El preprocesador es un extractor de características mel de 128 bandas en formato NeMo ONNX procedente de `mrfakename/parakeet-redux-ONNX`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 25 idiomas europeos, incluido el castellano.
- Inferencia on-device mediante ONNX Runtime, WebGPU y WASM, orientada a aplicaciones iOS.
- Modelo cuantizado que reduce el peso a 0,4 GB, apto para entornos con memoria limitada.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.
- No se documenta un modo de "thinking" ni capacidades multimodales adicionales.

## Casos de uso

- Transcripción de reuniones en local: el modelo puede procesar audio de forma on-device sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado automático en aplicaciones móviles iOS: al estar exportado a ONNX con soporte WebGPU/WASM, puede integrarse en apps nativas para generar subtítulos en tiempo real.
- Dictado por voz en aplicaciones de escritorio: mediante ONNX Runtime nativo se puede incorporar un motor de dictado multilingüe sin dependencias de servicios externos.
- Análisis de llamadas de atención al cliente: la cobertura de 25 idiomas europeos permite transcribir conversaciones multilingües en un mismo pipeline.
- Indexación y búsqueda de archivos de audio: la transcripción local facilita crear índices de texto sobre grabaciones sin coste de API.
- Investigación en ASR multilingüe: al ser un artefacto ONNX cuantizado con licencia CC-BY-4.0, sirve como base reproducible para experimentos de eficiencia y cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,4 GB en formato ONNX cuantizado, por lo que la inferencia cabe holgadamente en GPUs consumer con 4 GB o más, y probablemente en memoria unificada de dispositivos móviles.
- GPU recomendadas: no disponible en la información proporcionada; al ser un modelo de ~0,6B cuantizado, cualquier GPU moderna (RTX 3060 en adelante) debería ser suficiente, aunque no se confirma.
- Cabe en GPU consumer: sí, por el tamaño del artefacto (0,4 GB), aunque no se aportan requisitos oficiales.
- Opciones de despliegue: ONNX Runtime (nativo), WebGPU y WASM para iOS; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| Whispr ASR (esta ficha) | ~0,6B | 25 europeos | ONNX cuantizado | CC-BY-4.0 | no disponible |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6B | no disponible en la información | no disponible | CC-BY-4.0 | no disponible |
| moondream/parakeet-ultra | ~0,6B (derivado) | no disponible en la información | no disponible | CC-BY-4.0 | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La model card es muy escueta: no documenta sesgos, tasas de error ni evaluación por idioma.
- Riesgo de alucinación inherente a los modelos ASR, especialmente en audio con ruido o acentos no representados en el entrenamiento original.
- No se especifica la longitud máxima de audio ni la ventana de contexto, lo que limita la planificación de producción.
- La cuantización INT4/W4A8 puede degradar la precisión respecto al modelo original en fp32/fp16; no se aportan métricas comparativas.
- Aunque la licencia es CC-BY-4.0 (permite uso comercial con atribución), es obligatorio atribuir a NVIDIA, Moondream, Olicorne y mrfakename según la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria.
- La fecha de creación indicada (2026-11-27) es futura respecto a la información habitual; conviene verificar la integridad del artefacto antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/kkrishnan90/whispr-asr
- Modelo base post-entrenado: https://huggingface.co/moondream/parakeet-ultra
- Modelo base original: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportación ONNX y cuantización de referencia: `Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx` (commit `3552ddf1d5c5f00214004ef4ad6a273fad910c60`)
- Preprocesador mel NeMo ONNX: `mrfakename/parakeet-redux-ONNX`
