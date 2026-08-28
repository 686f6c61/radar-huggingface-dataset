# mocomoco-inc/mocovoice-whisper-turbo-ja-automotive-synthetic-v0.1

## Resumen

mocovoice-whisper-turbo-ja-automotive-synthetic-v0.1 es un prototipo de adaptación léxica para reconocimiento automático de voz (ASR) en japonés, desarrollado por mocomoco inc. sobre la base de OpenAI Whisper large-v3-turbo. El modelo está diseñado para mejorar la transcripción de terminología específica del sector de automoción, como códigos de piezas, valores numéricos y unidades de medida, mediante un ajuste fino con LoRA sobre datos sintéticos.

El repositorio distribuye exclusivamente el artefacto desplegable en formato CTranslate2 con cuantización int8, junto con el contrato de datos, los scripts de entrenamiento y un recibo de liberación con hashes SHA-256. No se distribuyen los pesos del adaptador LoRA ni un checkpoint Transformers fusionado. El propio autor lo califica como un artefacto de demostración y marketing, no como un modelo de producción ni certificado para seguridad.

La relevancia de este lanzamiento reside en su enfoque: en lugar de publicar otro checkpoint genérico de Whisper, mocomoco presenta un flujo de trabajo auditable de adaptación léxica con evaluación controlada sobre datos sintéticos, dirigido a equipos que necesitan transcribir vocabulario técnico especializado sin disponer de grabaciones reales del dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (Transformer encoder-decoder) con adaptador LoRA fusionado |
| Parametros totales | no disponible (modelo base: ~809 M; el adaptador LoRA no se distribuye) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper large-v3-turbo procesa audio, no texto; ventana de audio de 30 s por segmento) |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | ja (japones) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (ct2-int8/) |

## Arquitectura y entrenamiento

El modelo parte de OpenAI Whisper large-v3-turbo, una arquitectura transformer encoder-decoder entrenada para ASR multilingue. Sobre esta base se aplico un ajuste fino con LoRA (Low-Rank Adaptation) para adaptar el vocabulario al dominio de automocion. El entrenamiento se realizo exclusivamente con datos sinteticos: el contrato de datos incluido en el repositorio contiene prompts de texto sinteticos y su procedencia, pero deliberadamente no incluye audio ni rutas locales de audio.

El proceso de entrenamiento, evaluacion, fusion de LoRA, conversion a CTranslate2 y empaquetado esta documentado en scripts reproducibles dentro de `training_code/`. El repositorio incluye un `RELEASE_RECEIPT.json` con los hashes SHA-256 de todos los artefactos, lo que permite auditar la trazabilidad del proceso. La conversion a CTranslate2 con cuantizacion int8 es el unico artefacto desplegable; los checkpoints Transformers de referencia se usan solo como validacion interna y no se distribuyen.

## Capacidades

- Transcripcion de voz en japones con enfoque en terminologia de automocion (codigos, numeros, unidades).
- Adaptacion lexica controlada: el modelo mejora la presencia de terminos del dominio frente al Whisper Turbo generico en el holdout sintetico (107/138 terminos presentes, 77,5%).
- Preservacion de hechos numericos: 42/46 valores numericos controlados transcritos correctamente (91,3%).
- Preservacion de codigos controlados: 33/46 codigos correctos en el artefacto CT2 entregado (71,7%).
- Compatibilidad con el framework MocoVoice a traves de su envoltura `WhisperModel`, con `compute_type="int8"`.
- Sin degradacion de filas exactas: 0 filas correctas del modelo base se volvieron incorrectas tras la adaptacion (en el holdout sintetico).

## Casos de uso

- Transcripcion de manuales tecnicos de automocion: el modelo puede transcribir audio sintetico o narraciones que contengan codigos de piezas y referencias tecnicas, reduciendo errores en terminologia especifica frente a un Whisper generico.
- Prototipado de pipelines ASR para dominios especializados: el repositorio sirve como plantilla reproducible para equipos que quieran adaptar Whisper a su propio vocabulario sin disponer de datos de audio reales.
- Evaluacion controlada de adaptacion lexica: los scripts de evaluacion incluidos permiten medir la presencia de terminos, hechos numericos y codigos en un holdout sintetico, util para decidir si merece la pena invertir en datos reales.
- Integracion en flujos MocoVoice: el artefacto CT2 int8 esta disenado para usarse con el framework de mocomoco, que anade control de acceso, comparticion en equipos y formatos de exportacion personalizados.
- Auditoria de modelos ASR: el `RELEASE_RECEIPT.json` y los contratos de datos permiten auditar que datos se usaron y que artefactos se generaron, util en entornos con requisitos de trazabilidad.
- Demostracion de capacidades para clientes: como artefacto de marketing, permite a mocomoco mostrar su metodologia de adaptacion a dominios verticales sin revelar los pesos del adaptador.

## Benchmarks y rendimiento

Los resultados publicados corresponden a un holdout sintetico de TTS japones con plantillas de prompt no vistas durante el entrenamiento. Los terminos controlados se solapan entre entrenamiento y holdout, por lo que estos datos miden adaptacion lexica en un escenario controlado, no precision en grabaciones reales.

| Metrica (holdout sintetico) | Whisper Turbo generico (CT2) | Modelo CT2 entregado |
|---|---:|---:|
| CER dominio | 0,2258 | 0,2151 |
| Termino de dominio presente | 107/138 (77,5%) | 107/138 (77,5%) |
| Termino presente (diagnostico sin puntuacion) | 108/138 (78,3%) | 108/138 (78,3%) |
| Hecho de codigo controlado | 33/46 (71,7%) | 33/46 (71,7%) |
| Valor numerico controlado | 42/46 (91,3%) | 42/46 (91,3%) |
| Hecho valor + unidad controlado | 0/46 (0,0%) | 0/46 (0,0%) |

| Metrica (referencia Transformers, no distribuida) | Base Turbo | Referencia de dominio |
|---|---:|---:|
| CER dominio | 0,3082 | 0,3014 |
| Termino de dominio presente | 106/138 (76,8%) | 106/138 (76,8%) |
| Literal critico preservado | 58/138 (42,0%) | 59/138 (42,8%) |
| CER sintetico neutral | 0,0386 | 0,0386 |

El modelo CT2 int8 fusionado, decodificado con la envoltura `WhisperModel` de MocoVoice, produjo 77/150 salidas exactamente iguales al checkpoint Transformers de referencia sin cuantizar, con un CER de 0,0950 entre ambos. No se han publicado resultados en benchmarks estandar como Common Voice, JSUT o ReazonSpeech.

## Requisitos de hardware

- Tamano del repositorio: 0,8 GB (modelo CT2 int8).
- VRAM estimada: no disponible oficialmente; un Whisper large-v3-turbo en int8 con CTranslate2 requiere aproximadamente 1-2 GB de VRAM para inferencia en lotes pequenos, por lo que cabe en GPUs de consumo como RTX 3060 o superiores.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; para produccion con mayor throughput, se recomiendan A10, A100 o H100.
- Opciones de despliegue: CTranslate2 (formato nativo del artefacto), framework MocoVoice con `compute_type="int8"`. No se proporcionan archivos GGUF ni soporte directo para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El modelo base Whisper large-v3-turbo procesa segmentos de 30 s de audio; la cuantizacion int8 reduce el uso de memoria y acelera la inferencia frente a fp16 en CPUs y GPUs compatibles.

## Comparativa con modelos similares

| Modelo | Base | Tamano | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mocovoice-whisper-turbo-ja-automotive-synthetic-v0.1 | Whisper large-v3-turbo | ~809 M (base) | 30 s audio | MIT | CT2 int8 | Adaptado a automocion, solo japones, datos sinteticos |
| openai/whisper-large-v3-turbo | - | ~809 M | 30 s audio | MIT | Transformers, CT2, GGUF | Multilingue, generico, sin adaptacion a dominio |
| openai/whisper-large-v3 | - | ~1550 M | 30 s audio | MIT | Transformers, CT2, GGUF | Mayor precision en algunos benchmarks, mas lento y pesado |

La comparativa directa con otros modelos ASR en japones especializado (como ReazonSpeech o Kotoba-Whisper) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Prototipo de demostracion: el autor declara explicitamente que no es un modelo de produccion ni certificado para seguridad.
- Datos sinteticos: el entrenamiento y la evaluacion usan exclusivamente TTS sintetico; no se ha validado con grabaciones reales de campo, radio, obra o conversaciones operativas.
- Hechos valor + unidad: el modelo falla en el 100% de los casos controlados (0/46) para la combinacion valor numerico + unidad de medida, lo que lo hace inadecuado para tareas que requieran transcribir cantidades con unidades de forma fiable.
- Sin garantia de exactitud: no se debe asumir correccion en codigos, numeros, fechas, instrucciones de seguridad, estado de entregas o estado operativo. Se requiere revision humana siempre.
- Solo japones: el modelo no soporta otros idiomas.
- Artefacto limitado: solo se distribuye el formato CTranslate2 int8; no hay checkpoint Transformers fusionado ni pesos LoRA, lo que limita la experimentacion fuera del framework MocoVoice.
- Sin benchmarks estandar: no hay resultados en conjuntos de datos publicos de referencia, por lo que no es posible comparar con otros modelos ASR en igualdad de condiciones.
- Riesgo de alucinacion: como cualquier modelo de Whisper, puede producir transcripciones plausibles pero incorrectas, especialmente con ruido o vocabulario fuera de distribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mocomoco-inc/mocovoice-whisper-turbo-ja-automotive-synthetic-v0.1
- Producto mocoVoice (EN): https://products.mocomoco.ai/en/
- Producto mocoVoice (JA): https://products.mocomoco.ai/
- Web corporativa de mocomoco: https://www.mocomoco.ai/en/
- Anuncio de mocoVoice Web: https://www.mocomoco.ai/en/news/mocoVoice-web/
- Guia de usuario de mocoVoice: https://guide.mocomoco.ai/en/
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
