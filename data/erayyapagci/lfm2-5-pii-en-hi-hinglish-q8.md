# erayyapagci/lfm2.5-pii-en-hi-hinglish-q8

## Resumen

El modelo `erayyapagci/lfm2.5-pii-en-hi-hinglish-q8` es un detector de información personal identificable (PII) basado en el encoder `LiquidAI/LFM2.5-Encoder-350M-PII-Detector`, ajustado para inglés, hinglish romanizado e hindi en escritura devanagari. Lo ha desarrollado el usuario de HuggingFace `erayyapagci` como una herramienta experimental de token-classification orientada a tareas de privacidad y anonimización de textos multilingües.

El modelo resuelve el problema de identificar entidades como nombres, direcciones, fechas, correos electrónicos, teléfonos y URLs en textos que mezclan inglés e hindi, un caso frecuente en entornos de datos de India y comunidades de habla hindi. Su relevancia radica en la creciente necesidad de cumplir normativas de protección de datos (GDPR, leyes locales) y de depurar datasets antes de su publicación o entrenamiento.

La arquitectura es un transformer encoder de 354 millones de parámetros, con una longitud de contexto no especificada en la documentación disponible. El repositorio incluye tanto los pesos originales en FP32 (safetensors) como una exportación ONNX cuantizada dinámicamente a INT8, pensada para inferencia eficiente en CPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en LiquidAI LFM2.5-Encoder) |
| Parametros totales | 354.649.154 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32 (safetensors), INT8 (ONNX dinámico) |
| Idiomas soportados | Inglés, hindi (incluye hinglish romanizado y devanagari) |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | safetensors (FP32), ONNX (INT8) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del encoder `LiquidAI/LFM2.5-Encoder-350M-PII-Detector`, del que hereda la arquitectura transformer de 350 millones de parámetros. No se proporcionan detalles adicionales sobre la estructura interna (tipo de atención, número de capas, etc.) en la documentación disponible. La tarea es token-classification con etiquetado BIOES, y el repositorio incluye código personalizado que requiere `trust_remote_code=True` para cargar el modelo con Transformers.

El entrenamiento se realizó sobre una mezcla de datos sintéticos locales y fuentes externas con licencias permisivas o sintéticas: NVIDIA Nemotron PII, Gretel synthetic PII y datos derivados de AI4Privacy. No se especifica el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO. La principal innovación técnica del repositorio es la exportación a ONNX INT8 con cuantización dinámica, que reduce el uso de memoria y mejora el throughput en CPU, aunque puede alterar ligeramente las predicciones.

## Capacidades

- Detección de entidades PII: nombres de persona, direcciones, fechas, correos electrónicos, teléfonos y URLs en inglés, hinglish romanizado e hindi devanagari.
- Clasificación de tokens con esquema BIOES y decodificación de spans mediante offset mapping del tokenizador.
- Post-procesamiento determinista de límites y reglas para entidades estructuradas, incluido en el pipeline de evaluación.
- Versión ONNX INT8 optimizada para CPU, con mayor throughput (46,9 registros/s frente a 37,8 en FP32) y menor pico de memoria (2,00 GB frente a 3,49 GB).
- Soporte de carga mediante Transformers con `trust_remote_code=True` o mediante ONNX Runtime para inferencia en CPU.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Anonimización de textos multilingües: el modelo puede localizar y enmascarar PII en documentos que mezclan inglés e hindi, por ejemplo en actas, formularios o comunicaciones oficiales, antes de su publicación o archivado.
- Cumplimiento de protección de datos: integrado en pipelines de datos, permite detectar y eliminar información personal de logs o bases de texto para cumplir normativas como GDPR o leyes locales de privacidad.
- Redacción de documentos sensibles: en el ámbito legal o sanitario, ayuda a ocultar nombres, direcciones y otros datos personales en informes o expedientes antes de compartirlos con terceros.
- Filtrado de logs de aplicaciones: al procesar registros de servidores o aplicaciones, identifica correos, teléfonos o URLs que no deberían persistirse en almacenamiento de largo plazo.
- Preprocesamiento de datasets para entrenamiento: depura conjuntos de datos públicos o internos eliminando PII antes de usarlos para entrenar otros modelos, reduciendo riesgos de fuga de información.
- Detección de fugas en atención al cliente: analiza transcripciones de chats o correos de soporte para localizar datos personales que podrían haber sido expuestos indebidamente y activar alertas.
- Despliegue en entornos sin GPU: gracias a la versión ONNX INT8, puede ejecutarse en servidores CPU con recursos limitados, integrándose en servicios de backend mediante ONNX Runtime.

## Benchmarks y rendimiento

La evaluación se realizó sobre un holdout sintético de 900 registros (600 positivos y 300 negativos duros), con coincidencia de spans y post-procesamiento determinista. Los resultados se presentan para las dos versiones del modelo:

| Métrica | PyTorch/ONNX FP32 | ONNX INT8 |
|---|---:|---:|
| Precisión | 0,7896 | 0,7741 |
| Recall | 0,8817 | 0,8850 |
| F1 | 0,8331 | 0,8258 |
| Cobertura de caracteres | 0,9309 | 0,9240 |
| Entidades residuales | 57/600 | 62/600 |
| Negativos duros marcados | 70/300 | 81/300 |
| Throughput CPU | 37,8 registros/s | 46,9 registros/s |
| Pico de memoria (RSS) | 3,49 GB | 2,00 GB |

El recall contextual para nombres de persona fue de 1,0000 en FP32 y 0,9900 en INT8. No se han publicado comparaciones con otros modelos de detección de PII en la información disponible.

## Requisitos de hardware

- Memoria: el modelo FP32 ocupa aproximadamente 1,4 GB en pesos (354M parámetros × 4 bytes), mientras que la versión INT8 reduce esto a unos 0,35 GB. El pico de memoria del proceso en CPU fue de 3,49 GB en FP32 y 2,00 GB en INT8 según la evaluación.
- GPU: no se especifican requisitos de VRAM, pero al ser un encoder de 350M, es probable que quepa en GPUs de consumo con 4 GB o más. No hay datos confirmados.
- CPU: la versión ONNX INT8 está diseñada para CPU y muestra un throughput de 46,9 registros/s en la evaluación.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (FP32 o INT8 mediante carga manual), ONNX Runtime con `CPUExecutionProvider`, y potencialmente GPU si se usa el backend adecuado.
- Latencia: no se proporciona latencia por registro, solo throughput agregado.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección de PII en la documentación proporcionada. El modelo se basa en `LiquidAI/LFM2.5-Encoder-350M-PII-Detector`, del que es un fine-tune, pero no se han publicado benchmarks del modelo base en esta ficha. Por tanto, no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo es experimental y no debe considerarse un límite de seguridad completo; se recomienda probarlo con datos revisados manualmente del dominio de aplicación.
- Muestra debilidad en números de cuenta agrupados flexibles y formatos de secretos arbitrarios no vistos durante el entrenamiento.
- La cuantización INT8 puede alterar predicciones en casos límite; se recomienda validar el umbral de decisión en cada entorno.
- El uso de `trust_remote_code=True` implica ejecutar código remoto; debe revisarse antes de habilitarlo en entornos sensibles.
- La licencia LFM Open License v1.0 tiene condiciones específicas que deben revisarse antes de uso comercial o redistribución.
- El entrenamiento se basó en datos sintéticos y fuentes permisivas, por lo que no se garantiza la cobertura de todos los locales, demografías o contextos regulatorios.
- Para producción, se sugiere un enfoque fail-closed (bloquear exportaciones ante incertidumbre) y complementar con reconocedores deterministas para identificadores estructurados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/erayyapagci/lfm2.5-pii-en-hi-hinglish-q8
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M-PII-Detector
- Licencia: LFM Open License v1.0 (archivo LICENSE en el repositorio)
- No se han encontrado papers, blogs o demos adicionales en la información disponible.
