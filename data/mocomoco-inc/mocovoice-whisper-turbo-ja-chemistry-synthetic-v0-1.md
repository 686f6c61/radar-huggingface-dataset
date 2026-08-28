# mocomoco-inc/mocovoice-whisper-turbo-ja-chemistry-synthetic-v0.1

## Resumen

mocomoco-inc/mocovoice-whisper-turbo-ja-chemistry-synthetic-v0.1 es un prototipo de adaptación léxica del modelo de reconocimiento de voz Whisper large-v3-turbo de OpenAI, especializado en terminología química en japonés. Lo desarrolla mocomoco inc., la empresa japonesa detrás del producto comercial de transcripción mocoVoice, como demostración técnica de su capacidad para adaptar modelos ASR a dominios específicos mediante LoRA.

El repositorio distribuye únicamente el modelo fusionado y convertido a CTranslate2 en precisión float16 (`ct2-float16/`), junto con el contrato de datos sintéticos, los scripts de entrenamiento y un recibo de liberación con hashes SHA-256. No se incluyen los pesos del adaptador LoRA ni un checkpoint Transformers fusionado; el artefacto CT2 es el único elemento desplegable. La propia model card lo califica explícitamente como un artefacto de marketing o demostración, no como un modelo de producción ni certificado para seguridad.

La relevancia de este lanzamiento reside en su enfoque metodológico: evalúa la adaptación léxica sobre un holdout sintético controlado, comparando el CT2 de dominio con un CT2 genérico bajo el mismo decodificador MocoVoice, y documenta de forma auditable las transiciones de acierto a error. No obstante, sus resultados no son extrapolables a entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (encoder-decoder transformer) con adaptacion LoRA, convertido a CTranslate2 |
| Parametros totales | no disponible (el modelo base Whisper large-v3-turbo tiene aproximadamente 809M, pero no se especifica el recuento del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 segundos, pero no se documenta en esta ficha) |
| Tipos de cuantizacion | float16 (directorio `ct2-float16/`) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (CT2) |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-large-v3-turbo, un transformer encoder-decoder con arquitectura estándar de Whisper, y se adapta mediante LoRA (Low-Rank Adaptation) para mejorar el reconocimiento de terminología química en japonés. El entrenamiento se realizó con datos sintéticos: la model card menciona un `data_contract/` con prompts de solo texto y procedencia del dataset, pero no se distribuye audio ni rutas de audio locales. Los scripts de entrenamiento, evaluación y exportación están incluidos en `training_code/` para reproducibilidad.

No se documenta el uso de RLHF, DPO ni otras técnicas de alineación. La conversión a CTranslate2 en float16 se realizó tras fusionar el adaptador LoRA con el modelo base. El repositorio incluye un `RELEASE_RECEIPT.json` con enlaces SHA-256 para auditoría de los artefactos.

## Capacidades

- Reconocimiento de voz automático (ASR) en japonés, con adaptación léxica al dominio químico.
- Soporte de decodificación con beam search (configuración beam-4 utilizada en las evaluaciones).
- Integración con el wrapper `WhisperModel` de MocoVoice para decodificación CT2.
- Capacidad de preservar términos críticos del dominio en condiciones controladas (según los resultados del holdout sintético).
- No incluye tool calling, agentes, visión ni otras capacidades multimodales; es exclusivamente ASR.

## Casos de uso

Dado que se trata de un prototipo de demostración, los casos de uso realistas se limitan a entornos de investigación y evaluación:

- Evaluación de técnicas de adaptación léxica: permite comparar el efecto de un adaptador LoRA sobre Whisper large-v3-turbo en un dominio específico, usando el mismo decodificador CT2 para aislar las ganancias del adaptador.
- Auditoría de transiciones de error: el repositorio documenta fila a fila qué términos críticos se pierden o ganan, útil para estudiar el comportamiento de modelos ASR ante terminología especializada.
- Reproducción de pipelines de entrenamiento: los scripts incluidos permiten replicar el flujo de entrenamiento, fusión y conversión a CT2, sirviendo como referencia para otros dominios.
- Validación de métricas de evaluación sintética: el diseño del holdout (con solapamiento controlado entre entrenamiento y evaluación) sirve para probar metodologías de evaluación de adaptación de dominio.
- Comparación de backends: al distribuir solo CT2, facilita estudiar diferencias de decodificación entre Transformers y CTranslate2 en modelos Whisper adaptados.
- Demostración comercial: mocomoco inc. lo utiliza como muestra de su capacidad para adaptar modelos ASR a dominios verticales, similar a su modelo médico co-desarrollado con el Hospital Universitario de Hiroshima.

## Benchmarks y rendimiento

Los resultados publicados provienen de un holdout sintético de habla japonesa generada por TTS, con plantillas de prompt no vistas durante el entrenamiento. Los términos controlados se solapan entre entrenamiento y holdout, por lo que estas cifras miden adaptación léxica en un entorno controlado, no precisión en grabaciones reales.

Comparación del CT2 de dominio entregado frente al CT2 genérico (ambos decodificados con el wrapper MocoVoice):

| Metrica | CT2 generico | CT2 de dominio entregado |
|---|---:|---:|
| CER de dominio | 0.2541 | 0.2486 |
| Termino de dominio presente | 175/258 (67.8%) | 176/258 (68.2%) |
| Termino presente (diagnostico sin puntuacion) | 175/258 (67.8%) | 176/258 (68.2%) |
| Hecho de codigo controlado | 24/86 (27.9%) | 24/86 (27.9%) |
| Valor numerico controlado | 85/86 (98.8%) | 85/86 (98.8%) |
| Hecho de valor + unidad controlado | 0/86 (0.0%) | 0/86 (0.0%) |
| Filas exactas de contenido del CT2 generico hechas no exactas | – | 0 |

Además, la model card reporta una comparación entre el CT2 float16 entregado y un checkpoint Transformers de referencia de dominio (no distribuido): 142/270 salidas coincidieron exactamente tras normalización, con un CER de 0.0412 entre la referencia y el CT2. Este dato es solo una verificación de decodificador/cuantización, no una prueba de producción.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la información disponible. El tamaño del repositorio es de 1.6 GB, lo que sugiere que el modelo CT2 float16 puede ejecutarse en GPUs de consumo con al menos 4 GB de VRAM, pero esta es una estimación no confirmada. Las opciones de despliegue documentadas se limitan al wrapper `WhisperModel` de MocoVoice sobre CTranslate2; no se mencionan vLLM, llama.cpp, Ollama ni TGI. No hay datos de latencia ni throughput publicados.

## Comparativa con modelos similares

La comparativa más relevante es contra el propio Whisper large-v3-turbo sin adaptar, tanto en su versión Transformers como en su versión CT2 genérica. La model card incluye una tabla de referencia con dos brazos Transformers (base y dominio, este último no distribuido) y el CT2 entregado:

| Modelo | CER de dominio | Termino presente | Hecho de codigo | Valor numerico | Valor + unidad |
|---|---:|---:|---:|---:|---:|
| Base Turbo (Transformers) | 0.2837 | 178/258 (69.0%) | 23/86 (26.7%) | 85/86 (98.8%) | 0/86 (0.0%) |
| Referencia de dominio (Transformers, no distribuida) | 0.2773 | 178/258 (69.0%) | 24/86 (27.9%) | 85/86 (98.8%) | 0/86 (0.0%) |
| CT2 generico (MocoVoice) | 0.2541 | 175/258 (67.8%) | 24/86 (27.9%) | 85/86 (98.8%) | 0/86 (0.0%) |
| CT2 de dominio entregado (MocoVoice) | 0.2486 | 176/258 (68.2%) | 24/86 (27.9%) | 85/86 (98.8%) | 0/86 (0.0%) |

No se dispone de comparativas con otros modelos ASR japoneses especializados en química.

## Limitaciones y advertencias

- Es un prototipo de demostración, no un modelo de producción ni certificado para seguridad. La model card lo declara explícitamente como artefacto de marketing.
- Los resultados de evaluación se obtuvieron sobre un holdout sintético con solapamiento de términos entre entrenamiento y evaluación; no representan precisión en grabaciones reales de campo.
- No se distribuye audio ni se utilizaron grabaciones reales de clientes, obras, fábricas o entornos operativos.
- El modelo no garantiza corrección de códigos, valores numéricos, unidades, fechas, instrucciones de seguridad ni estados operativos. La model card insta a revisar siempre estos elementos.
- El rendimiento en el hecho de valor + unidad es 0/86 (0.0%) tanto en el modelo base como en el adaptado, lo que indica una limitación importante para aplicaciones que requieran unidades canónicas.
- La licencia MIT permite uso comercial, pero el modelo no está diseñado ni validado para entornos de producción.
- Solo se distribuye en formato CTranslate2; no hay checkpoint Transformers fusionado disponible para otros frameworks.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mocomoco-inc/mocovoice-whisper-turbo-ja-chemistry-synthetic-v0.1
- Producto mocoVoice (inglés): https://products.mocomoco.ai/en/
- Producto mocoVoice (japonés): https://products.mocomoco.ai/
- Sitio corporativo de mocomoco inc.: https://www.mocomoco.ai/en/
- Anuncio de mocoVoice Web: https://www.mocomoco.ai/en/news/mocoVoice-web/
- Guía de usuario de mocoVoice: https://guide.mocomoco.ai/en/
