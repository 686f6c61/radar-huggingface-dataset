# nolimitsxl/omniASR-CTC-3B

## Resumen

omniASR-CTC-3B es un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura Wav2Vec2 con cabecera CTC, publicado por el usuario nolimitsxl en Hugging Face. Se trata de una conversión a `transformers` del checkpoint `omniASR_CTC_3B` del proyecto OmniLingual ASR de Meta (facebookresearch), originalmente distribuido en formato fairseq2. El modelo emite logits CTC sobre un vocabulario SentencePiece de 9812 tokens y, según la model card, puede transcribir voz en múltiples idiomas.

Con 3.080.425.684 parámetros (aproximadamente 3,08 mil millones) y un encoder de 60 capas con dimensión oculta 2048 y 32 cabezas de atención, se sitúa en la gama alta de los modelos ASR densos. Su relevancia radica en ofrecer una vía de uso directo desde `transformers` para un modelo multilingüe de gran tamaño, lo que facilita su integración en pipelines existentes sin depender de fairseq2.

No obstante, conviene señalar que el autor indica explícitamente que no se ejecutó ninguna verificación de paridad durante la conversión, que la licencia no está declarada y que no se especifican los idiomas soportados ni se publican resultados de benchmarks. Es, por tanto, un artefacto de conversión sin validación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 con cabecera CTC (encoder transformer, 60 capas, hidden size 2048, 32 cabezas, FFN 8192) |
| Parametros totales | 3.080.425.684 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en el repo) |
| Idiomas soportados | no disponible (la model card indica "múltiples idiomas" sin listarlos) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 12,3 GB) |

## Arquitectura y entrenamiento

El modelo es un `Wav2Vec2ForCTC` de `transformers`, es decir, un encoder transformer que procesa la forma de onda de audio (muestreada a 16 kHz) y produce representaciones latentes que se proyectan mediante una capa lineal a logits sobre un vocabulario SentencePiece de 9812 tokens. La configuración del encoder es de 60 capas, dimensión oculta 2048, 32 cabezas de atención y FFN intermedio de 8192, lo que da lugar a los 3,08 mil millones de parámetros. La decodificación es CTC greedy (argmax sobre los logits), tal como muestra el ejemplo de uso de la model card.

No se dispone de información sobre los datos de entrenamiento (número de tokens, composición del dataset, idiomas cubiertos) ni sobre si se aplicaron técnicas de ajuste como RLHF o DPO, algo poco habitual en ASR. El modelo procede de una conversión del checkpoint fairseq2 `omniASR_CTC_3B` del proyecto OmniLingual de Meta; el autor no realizó verificación de paridad entre el checkpoint original y el convertido, por lo que no hay garantía documentada de equivalencia numérica.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) mediante decodificación CTC.
- Salida de logits CTC sobre vocabulario SentencePiece, lo que permite decodificación greedy o, potencialmente, decodificación con beam search o corrección con modelo de lenguaje externo.
- Transcripción multilingüe según la model card, aunque sin listado explícito de idiomas.
- Procesamiento de audio a 16 kHz; el ejemplo oficial incluye remuestreo desde otras frecuencias.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá de ASR.
- No se documenta modo "thinking" ni capacidades especiales adicionales.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo recibe la forma de onda a 16 kHz y devuelve la transcripción mediante CTC, adecuado para pipelines por lotes donde se prioriza la cobertura multilingüe sobre la latencia.
- Subtitulado automático de vídeo: integrable en un pipeline que extraiga audio, remuestree a 16 kHz y llame al modelo para generar subtítulos, dado su tamaño de 3B que permite buena calidad acústica.
- Archivado y búsqueda de contenido audiovisual: transcripción masiva de un archivo de audio para indexación y búsqueda textual posterior.
- Análisis de llamadas de atención al cliente: transcripción de grabaciones para extracción de métricas y control de calidad, con la ventaja de soportar varios idiomas según la model card.
- Investigación en ASR multilingüe: punto de partida para fine-tuning o evaluación comparativa frente a otros modelos Wav2Vec2 de gran tamaño.
- Generación de datos etiquetados para entrenar modelos más pequeños: uso como "profesor" para pseudo-etiquetar audio y destilar a modelos ligeros desplegables en dispositivos.
- Accesibilidad: transcripción en tiempo casi real de contenido hablado para personas con discapacidad auditiva, siempre que se valide la latencia en el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER/CER, comparaciones con otros modelos ni verificación de paridad frente al checkpoint original de fairseq2.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 12,3 GB solo para pesos (3,08B × 4 bytes), más activaciones; se recomienda al menos 16-24 GB.
- VRAM estimada en fp16/bf16: aproximadamente 6,2 GB para pesos; con activaciones, un entorno de 12-16 GB es realista.
- VRAM estimada en int8: aproximadamente 3,1 GB para pesos; cuantizaciones menores no están documentadas para este repo.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en fp16.
- GPU de consumo: cabe en RTX 4090/3090 en fp16; en GPUs de 8-12 GB requeriría cuantización, no publicada oficialmente.
- Opciones de despliegue: `transformers` (PyTorch) de forma nativa; vLLM, llama.cpp, Ollama y TGI no están documentados para este modelo y su compatibilidad no está garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| omniASR-CTC-3B (este) | 3,08B | no disponible | no disponible | no disponible | safetensors |
| MMS (Meta) | ~1B (varía por idioma) | no disponible | >1000 | CC-BY-NC | safetensors |
| Whisper large-v3 | ~1,55B | 30 s de audio | ~99 | MIT | safetensors |
| Wav2Vec2-XLS-R-2B | ~2B | no disponible | ~128 | Apache 2.0 | safetensors |

La comparación es orientativa: no se dispone de benchmarks de este modelo que permitan contrastar WER frente a las alternativas. Whisper large-v3 y Wav2Vec2-XLS-R-2B tienen licencias permisivas y están ampliamente validados; MMS cubre más idiomas pero con restricciones no comerciales. omniASR-CTC-3B carece de licencia declarada, lo que limita su uso en producción.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir permiso para uso comercial ni redistribución; es un bloqueo para producción.
- Sin verificación de paridad: el autor indica que no se ejecutó comprobación de equivalencia frente al checkpoint fairseq2 original, por lo que puede haber divergencias numéricas.
- Idiomas no listados: la model card afirma multilingüismo pero no especifica qué idiomas ni con qué calidad.
- Sin benchmarks: no hay métricas de WER/CER que permitan evaluar su calidad real.
- Riesgo de alucinación y errores de transcripción: como todo modelo ASR, puede producir texto incorrecto en audio ruidoso, con acentos no vistos o en idiomas no cubiertos.
- Sesgos: no documentados; los modelos ASR heredan sesgos de los datos de entrenamiento (acentos, variedades dialectales, género, edad).
- Decodificación CTC greedy por defecto: sin modelo de lenguaje externo, la calidad puede ser inferior a la de sistemas con decodificación conjunta.
- Repo de 12,3 GB y 3B parámetros: coste de almacenamiento y de inferencia considerable para despliegues en el borde.
- Fecha de creación futura (2026-11-16) en los metadatos: conviene verificar la procedencia y el estado del repositorio antes de confiar en él.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nolimitsxl/omniASR-CTC-3B
- Proyecto OmniLingual ASR (Meta): https://github.com/facebookresearch/omnilingual-asr
- Documentación de `Wav2Vec2ForCTC` en transformers: https://huggingface.co/docs/transformers/model_doc/wav2vec2
- Documentación de `AutoProcessor`: https://huggingface.co/docs/transformers/model_doc/auto
