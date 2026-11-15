# HeartMuLa/HeartTranscriptor-oss

## Resumen

HeartTranscriptor-oss es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo HeartMuLa (Mulalabs), presentado como parte de la familia de modelos fundacionales de música HeartMuLa. Se trata de un modelo basado en la arquitectura Whisper, según indican las etiquetas del repositorio, con 763.857.920 parámetros totales (aproximadamente 764 millones) y un tamaño de repositorio de 3,1 GB. Su función principal es la transcripción de audio a texto, presumiblemente orientada al dominio musical y de canciones, dado el contexto de la familia a la que pertenece.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas, y declara soporte para cinco idiomas: chino (zh), inglés (en), japonés (ja), coreano (ko) y español (es). Forma parte de un ecosistema más amplio que incluye HeartMuLa-oss-3B (modelo generativo de música) y HeartCodec-oss (códec de audio), documentado en el paper arXiv 2601.10547 titulado "HeartMuLa: A Family of Open Sourced Music Foundation Models".

Su relevancia actual radica en que cubre una necesidad específica poco atendida por los modelos ASR generalistas: la transcripción precisa de contenido musical y vocal, con soporte multilingüe en idiomas asiáticos y europeos. Con más de 8000 descargas y actualizaciones recientes, el modelo se mantiene activo en el ecosistema de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR) |
| Parametros totales | 763.857.920 (~764 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | zh, en, ja, ko, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en la arquitectura Whisper, un transformer encoder-decoder diseñado originalmente por OpenAI para reconocimiento automático del habla. Con aproximadamente 764 millones de parámetros, el tamaño corresponde a la variante "large" de la familia Whisper. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino supervisado específico.

El contexto del proyecto (familia HeartMuLa de modelos fundacionales de música) sugiere que el entrenamiento podría estar orientado a audio musical y vocal, aunque la model card no detalla esta composición. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. El paper asociado (arXiv 2601.10547) es la fuente indicada para obtener detalles técnicos completos del entrenamiento.

## Capacidades

- Reconocimiento automático del habla (ASR) y transcripción de audio a texto.
- Soporte multilingüe en cinco idiomas: chino, inglés, japonés, coreano y español.
- Orientado al dominio musical y de canciones, según el contexto de la familia HeartMuLa.
- Etiquetado con los tags "music" y "art", lo que sugiere especialización en contenido musical.
- Integración en el ecosistema heartlib para despliegue local.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documentan capacidades de visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de letras de canciones: el modelo puede convertir pistas vocales en texto con soporte para cinco idiomas, adecuado para catalogación musical y generación de subtítulos sincronizados.
- Generación de subtítulos para vídeos musicales: al ser un ASR multilingüe, permite crear subtítulos automáticos en producciones audiovisuales con contenido cantado en chino, inglés, japonés, coreano o español.
- Indexación y búsqueda de catálogos musicales: la transcripción permite construir índices de texto buscables a partir de bibliotecas de audio, facilitando la recuperación por contenido lírico.
- Investigación en musicología computacional: sirve como componente de transcripción en pipelines de análisis de corpus musicales multilingües.
- Accesibilidad para contenido de audio: generación de transcripciones para personas con discapacidad auditiva en plataformas de streaming musical.
- Preprocesamiento para pipelines de generación musical: dentro del ecosistema HeartMuLa, puede emplearse para extraer letras que alimenten modelos generativos como HeartMuLa-oss-3B.
- Localización de contenido: transcripción en un idioma y posterior traducción para adaptar canciones o podcasts musicales a otros mercados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 3 GB solo para pesos, más overhead de activaciones; en fp16/bf16 se reduce a unos 1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 y superiores.
- Opciones de despliegue: el repositorio oficial (github.com/HeartMuLa/heartlib) ofrece quickstart y despliegue local; al ser compatible con Whisper, puede ejecutarse con frameworks como Transformers, faster-whisper, vLLM (para Whisper) o llama.cpp si existe conversión a GGUF (no confirmado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HeartTranscriptor-oss | ~764 M | no disponible | zh, en, ja, ko, es | Apache 2.0 | Hugging Face |
| Whisper large-v3 (OpenAI) | ~1550 M | 30 s de audio | multilingüe (99+) | MIT | OpenAI / HF |
| Whisper large-v2 (OpenAI) | ~1550 M | 30 s de audio | multilingüe (99+) | MIT | OpenAI / HF |
| Whisper medium (OpenAI) | ~769 M | 30 s de audio | multilingüe (99+) | MIT | OpenAI / HF |

HeartTranscriptor-oss comparte tamaño con Whisper medium (~769 M) pero declara solo cinco idiomas frente a la cobertura multilingüe amplia de Whisper. Su ventaja potencial es la especialización en dominio musical, aunque no hay benchmarks públicos que permitan cuantificar esa ventaja. Whisper large-v3 duplica los parámetros y ofrece mayor cobertura lingüística con licencia MIT.

## Limitaciones y advertencias

- Solo se declaran cinco idiomas (zh, en, ja, ko, es); no hay soporte documentado para otros idiomas.
- No se han publicado benchmarks, por lo que el rendimiento real frente a Whisper estándar es desconocido.
- Riesgo de alucinación inherente a los modelos ASR, especialmente en pasajes con música instrumental, ruido o voces superpuestas.
- La model card no documenta sesgos conocidos ni evaluaciones de robustez.
- La longitud de contexto de audio no está especificada; en arquitecturas Whisper suele limitarse a ventanas de 30 segundos.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar los términos del ecosistema heartlib y las dependencias.
- El modelo está vinculado a un servicio comercial (heartmula.com); revisar si el modelo local tiene paridad de capacidades con la versión online.
- No se documentan limitaciones específicas de rendimiento en audio no musical.

## Enlaces

- Hugging Face: https://huggingface.co/HeartMuLa/HeartTranscriptor-oss
- Repositorio GitHub: https://github.com/HeartMuLa/heartlib
- Paper: https://arxiv.org/abs/2601.10547
- Web oficial: https://heartmula.com
- Demo: https://heartmula.github.io/
- Modelo generativo relacionado: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B
- Códec de audio relacionado: https://huggingface.co/HeartMuLa/HeartCodec-oss
- Contacto: contact@mulalabs.ai
