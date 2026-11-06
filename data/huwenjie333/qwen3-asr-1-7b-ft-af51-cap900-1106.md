# huwenjie333/Qwen3-ASR-1.7B-ft-af51-cap900-1106

## Resumen

Qwen3-ASR-1.7B-ft-af51-cap900-1106 es un ajuste fino del modelo de reconocimiento automático del habla Qwen3-ASR-1.7B, desarrollado por el equipo Qwen de Alibaba. El ajuste lo publica el usuario huwenjie333 en Hugging Face y especializa el modelo base en 51 lenguas africanas (más inglés y francés) mediante el pipeline de entrenamiento Sunbird speech-to-text, bajo la configuración `qwen3-asr`, ejecución `Qwen3-ASR-1.7B-full-lr2e-05-ep5-af51-1106-c8a8`. El checkpoint publicado como mejor resultado es `checkpoint-1640`, con un WER medio de evaluación de 0,4334.

El modelo resuelve el problema de la transcripción de voz en lenguas africanas de bajos recursos, un ámbito donde los sistemas ASR comerciales suelen tener coberturas escasas o nulas. Mantiene la arquitectura multimodal del modelo base (encoder de audio más un decoder de lenguaje derivado de Qwen3-Omni), con aproximadamente 2.038 millones de parámetros en BF16 y un repositorio de 4,1 GB. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que amplía la cobertura lingüística del ASR abierto hacia idiomas como luganda, yoruba, hausa, amhárico, suajili o zulú, e incorpora identificación automática del idioma cuando este no se especifica. Es un modelo de nicho, orientado a investigadores y desarrolladores que necesitan transcripción multilingüe africana con pesos abiertos y desplegables en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder de audio + decoder de lenguaje (familia Qwen3-ASR, basada en Qwen3-Omni) |
| Parámetros totales | 2.038.052.480 |
| Parámetros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la información proporcionada; el ejemplo de uso emplea bfloat16 |
| Idiomas soportados | 51 lenguas africanas más inglés y francés (lista completa en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de la familia Qwen3-ASR, que combina un encoder de audio con un decoder de lenguaje construido sobre las capacidades de comprensión de audio de Qwen3-Omni. El ajuste fino se realizó sobre el checkpoint `Qwen/Qwen3-ASR-1.7B` con el pipeline Sunbird speech-to-text (`speech-to-text/qwen3-asr`), en la ejecución `Qwen3-ASR-1.7B-full-lr2e-05-ep5-af51-1106-c8a8`, con tasa de aprendizaje 2e-05 y 5 épocas sobre 51 lenguas africanas. El mejor checkpoint según la evaluación es `checkpoint-1640`, con un WER medio de 0,4334.

La model card indica que, para reproducir exactamente el comportamiento de entrenamiento, debe instalarse FlashAttention-2 y pasar `attn_implementation="flash_attention_2"` a `from_pretrained`; en ese caso el encoder de audio atiende en ventanas de 8 segundos, igual que en el backend vLLM de Qwen. No se detalla en la información disponible la composición exacta del dataset de ajuste, el número de horas de audio ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (transcripción) en 51 lenguas africanas, además de inglés y francés.
- Identificación automática del idioma cuando no se especifica: el modelo nombra primero la lengua detectada y luego transcribe.
- Transcripción condicionada por idioma: pasar `language=` mejora los resultados según la model card.
- Soporte de los códigos ISO de tres letras listados en la model card (`lug`, `yor`, `hau`, `amh`, `swa`, `zul`, etc.).
- Integración con la librería `qwen-asr` (versión 0.0.6, transformers 4.57.6), que requiere extender `SUPPORTED_LANGUAGES` para aceptar los idiomas añadidos por este ajuste.
- Decodificación con FlashAttention-2 para replicar el entrenamiento.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas en lenguas africanas: el modelo permite pasar el código de idioma (`lug`, `yor`, `hau`, etc.) para obtener transcripciones condicionadas y mejorar la precisión frente a la detección automática.
- Subtitulado de contenido audiovisual para comunidades lingüísticas africanas: útil para radios, televisiones y plataformas que necesitan subtítulos en idiomas como suajili, zulú o amhárico y no disponen de ASR comercial para ellos.
- Digitalización de archivos orales y patrimonio inmaterial: investigadores pueden transcribir grabaciones de campo en lenguas como bambara, wolof o lingala para su análisis lingüístico y archivado.
- Atención al cliente en centros de contacto multilingües africanos: transcripción de llamadas en hausa, yoruba, igbo o pidgin nigeriano para su posterior análisis de calidad y cumplimiento.
- Accesibilidad y voz a texto en aplicaciones locales: integración en apps de dictado o asistentes para usuarios de lenguas de bajos recursos, con despliegue en GPU de consumo gracias a los ~2.000 millones de parámetros.
- Investigación en ASR de bajos recursos: punto de partida para comparativas de WER entre lenguas africanas y para nuevos ajustes finos sobre subconjuntos lingüísticos concretos.
- Identificación de idioma en pipelines de enrutamiento: usar la salida `result.language` para dirigir el audio al modelo o al equipo adecuado en sistemas con múltiples lenguas.

## Benchmarks y rendimiento

La única métrica publicada en la información disponible es el WER medio de evaluación del mejor checkpoint:

| Métrica | Valor |
|---|---|
| eval_WER_mean (checkpoint-1640) | 0,4334 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni desgloses de WER por idioma.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4-5 GB para los pesos (2.038 millones de parámetros) más el overhead de activaciones y del encoder de audio; el repositorio completo ocupa 4,1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 con margen; A100, H100, L40S o RTX 4090 para mayor throughput y procesamiento por lotes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090; también en GPUs con 8 GB ajustando el tamaño de lote.
- Opciones de despliegue: la model card documenta la librería `qwen-asr` (0.0.6, transformers 4.57.6) con `Qwen3ASRModel.from_pretrained` y `device_map="cuda:0"`; se recomienda FlashAttention-2 con `attn_implementation="flash_attention_2"`. El backend vLLM se menciona como referencia del comportamiento de atención del encoder. No se documentan en la información disponible otras opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-ASR-1.7B-ft-af51-cap900-1106 | 2.038 M | 51 lenguas africanas + inglés y francés | Apache 2.0 | Ajuste fino de comunidad; WER medio 0,4334 |
| Qwen3-ASR-1.7B (base) | ~2.000 M | 30 idiomas, 22 dialectos chinos y acentos del inglés | no disponible en la información | Modelo original de Qwen; mayor cobertura de dialectos chinos |
| Qwen3-ASR-0.6B | ~600 M | 52 idiomas y dialectos | no disponible en la información | Variante más pequeña de la misma familia, menor coste de inferencia |

La información disponible no permite comparar rendimiento por idioma ni WER frente a alternativas; solo se conoce el WER medio del ajuste publicado.

## Limitaciones y advertencias

- El WER medio de 0,4334 es alto en términos absolutos y sugiere una precisión limitada; conviene evaluar por idioma antes de usarlo en producción.
- No se publica el desglose de WER por lengua, por lo que el rendimiento puede variar mucho entre idiomas y algunas lenguas pueden tener tasas de error muy superiores a la media.
- La model card recomienda pasar explícitamente el idioma para obtener los mejores resultados; la detección automática puede degradar la transcripción.
- La librería `qwen-asr` solo acepta por defecto los 30 idiomas del modelo original; es necesario extender `SUPPORTED_LANGUAGES` manualmente, lo que añade fragilidad a la integración.
- El ajuste se realizó con un pipeline de terceros (Sunbird) y no se documentan la composición del dataset ni las horas de audio, lo que dificulta evaluar sesgos y cobertura real.
- Riesgo de alucinación en audio ruidoso o con habla solapada, habitual en modelos ASR; no se documentan mecanismos específicos de mitigación.
- No se documentan sesgos conocidos ni limitaciones de contexto en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y las dependencias (`qwen-asr`, transformers) deben verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huwenjie333/Qwen3-ASR-1.7B-ft-af51-cap900-1106
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio GitHub de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Ficha de Qwen3-ASR-1.7B en OpenASR: https://openasr.org/models/qwen3-asr-1.7b/
