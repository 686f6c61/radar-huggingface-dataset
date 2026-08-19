# lemuralabs/lemura-arabic-asr-qwen3

## Resumen

**lemura-arabic-asr-qwen3** es un modelo de reconocimiento automático del habla (ASR) para árabe, desarrollado por **lemuralabs** sobre la base de **Qwen/Qwen3-ASR-1.7B**. Está diseñado para transcribir árabe moderno estándar (MSA) y cinco grandes grupos dialectales —golfo/khaleeji, egipcio, levantino, iraquí y magrebí/darija— en un único modelo compacto de aproximadamente 2.000 millones de parámetros. Su arquitectura es un audio-LLM generativo: un encoder de audio acoplado a un decoder LLM Qwen3, lo que le permite usar contexto lingüístico y no solo señales acústicas.

El modelo se ha afinado con LoRA sobre ~1,18 millones de clips (unas 1.700 horas) procedentes de corpus como SADA, MASC, CommonVoice-ar, MGB-2, MoulSot, NADI y FLEURS-ar. Su principal diferenciador es la cobertura dialectal amplia, con especial énfasis en el darija marroquí, un dialecto que suele suponer un desafío para la mayoría de los sistemas ASR. Publicado bajo licencia Apache-2.0, es adecuado para despliegues en producción que requieran transcripción de habla dialectal real, code-switching árabe-inglés y biasing de entidades mediante system prompt.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM generativo (encoder de audio + decoder LLM Qwen3) |
| Parametros totales | 2.038.052.480 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado (formato safetensors, cuantizable con herramientas estándar) |
| Idiomas soportados | Árabe (MSA, golfo/khaleeji, egipcio, levantino, iraquí, magrebí/darija) y code-switching con inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en **Qwen3-ASR-1.7B**, un audio-LLM generativo que combina un encoder de audio (que procesa señales de 16 kHz mono) con un decoder LLM de la familia Qwen3. A diferencia de los ASR clásicos basados en CTC o attention, este enfoque generativo permite que la decodificación utilice contexto lingüístico completo, mejorando la robustez frente a dialectos y code-switching.

El entrenamiento consistió en un fine-tune con **LoRA** (rank 64, alpha 128) en precisión bf16, seguido de la fusión de los pesos LoRA en el modelo base. Se utilizó el framework **ms-swift** sobre GPUs NVIDIA H100. Los datos de entrenamiento suman aproximadamente 1,18 millones de clips (~1.700 horas) que cubren los cinco grupos dialectales, con etiquetas normalizadas mediante el normalizador árabe estándar (eliminación de puntuación y diacríticos, normalización de hamza/madda y conversión de numerales orientales a occidentales). No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado únicamente.

## Capacidades

- **Transcripción de voz árabe multidiálecto**: MSA, golfo/khaleeji, egipcio, levantino, iraquí y magrebí/darija.
- **Biasing de entidades y nombres**: acepta una lista de palabras guía a través del system prompt para fijar marcas, personas y jerga específica, reduciendo errores en nombres propios.
- **Robustez al code-switching**: maneja alternancia árabe ↔ inglés, frecuente en el habla empresarial del Golfo.
- **Entrada de audio**: procesa clips de audio de 16 kHz mono.
- **Salida de texto**: genera transcripción en caracteres árabes normalizados.
- **Compatibilidad con pipelines de transformers**: se integra con el ecosistema Hugging Face y ms-swift para inferencia.

## Casos de uso

- **Atención al cliente en call centers**: transcribe conversaciones en dialectos del Golfo y magrebí, donde otros sistemas fallan. El biasing de entidades permite fijar nombres de productos o marcas en el system prompt, mejorando la precisión en interacciones comerciales.
- **Transcripción de notas de voz**: integrable en aplicaciones de mensajería para convertir audios en texto, con soporte para dialectos coloquiales y code-switching.
- **Subtitulación de medios**: genera subtítulos para vídeos, podcasts o emisiones en árabe dialectal, incluyendo contenido de MSA (broadcast) con un WER de 12,9% en MGB-2.
- **Asistentes de voz en árabe**: sirve como backend de reconocimiento para interfaces conversacionales en domótica o aplicaciones móviles, gracias a su tamaño compacto que permite despliegue en edge.
- **Documentación médica y legal**: transcribe dictados en árabe, con la opción de pasar una lista de términos técnicos o nombres de pacientes para reducir errores.
- **Análisis de llamadas de ventas**: convierte grabaciones en texto para minería de datos y evaluación de calidad, con robustez a ruido moderado y acentos regionales.
- **Traducción y procesamiento posterior**: la salida de texto puede alimentar pipelines de traducción automática o análisis de sentimiento, aprovechando la normalización árabe integrada.

## Benchmarks y rendimiento

La model card del autor reporta resultados de evaluación **in-domain** sobre seis conjuntos de prueba estándar en árabe, con el normalizador oficial y la métrica WER (menor es mejor):

| Test set | Dialecto | WER ↓ |
|---|---|---|
| MASC (limpio) | mixto | 10,8 |
| CommonVoice | mixto | 10,7 |
| MGB-2 | MSA / broadcast | 12,9 |
| MASC (ruidoso) | mixto | 25,8 |
| SADA | Golfo / saudí | 32,3 |
| Casablanca | Magrebí / darija | 43,2 |
| **Promedio** | — | **22,6** |

El autor advierte que estos valores corresponden a una evaluación **in-domain** (el modelo fue afinado sobre las particiones de entrenamiento de estos corpus), por lo que en audio completamente no visto el WER esperado es aproximadamente del 30-35%. No se han publicado resultados en benchmarks externos como FLEURS o CommonVoice sin solapamiento.

## Requisitos de hardware

- **VRAM estimada**: con ~2.040 millones de parámetros, los pesos en bf16 ocupan aproximadamente 4 GB. Con overhead de inferencia, se estima un consumo de 6-8 GB en precisión completa, y ~2 GB en cuantización de 4 bits.
- **GPU recomendadas**: para inferencia en producción, una GPU con 8-12 GB de VRAM (p. ej., RTX 3070, RTX 4060, A10) es suficiente. Para entrenamiento o fine-tune adicional, se recomienda al menos 24 GB (RTX 3090/4090, A100, H100).
- **Compatibilidad con GPUs consumer**: sí, cabe en tarjetas de gama media con cuantización; en bf16 sin cuantizar, una RTX 3060 de 12 GB podría ejecutarlo.
- **Opciones de despliegue**: el autor recomienda **ms-swift** para inferencia, pero al ser un modelo transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No hay confirmación oficial de compatibilidad con estos backends.
- **Latencia y throughput**: no se proporcionan datos oficiales. En una GPU moderna, se espera una latencia de decodificación de unos cientos de milisegundos por clip corto, dependiendo de la longitud del audio y del número de tokens generados.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos ASR árabe en la información proporcionada. Como referencia cualitativa:

- **OpenAI Whisper large-v3** (1.5B parámetros): buen rendimiento en MSA, pero significativamente peor en dialectos como darija (WER >60% según el autor). Licencia MIT, pero sin biasing de entidades nativo.
- **Meta MMS** (1B parámetros): cobertura multilingüe, pero entrenado principalmente en MSA y con menos énfasis en dialectos árabes. No ofrece biasing por system prompt.
- **Qwen3-ASR-1.7B** (modelo base): sin fine-tune dialectal, su rendimiento en habla coloquial es inferior; este modelo es la versión afinada específicamente para árabe.

La ventaja principal de lemura-arabic-asr-qwen3 es su especialización dialectal y el mecanismo de biasing, a costa de un mayor WER en audio no visto comparado con modelos generalistas.

## Limitaciones y advertencias

- **Rendimiento en audio no visto**: el modelo está optimizado para los dialectos y dominios de entrenamiento; en acentos o contextos completamente nuevos, el WER puede subir hasta el 30-35% (según el autor).
- **Sensibilidad al ruido**: el rendimiento degrada notablemente en audio ruidoso o de campo lejano (WER de 25,8% en MASC ruidoso).
- **Sesgos de los corpus**: puede reflejar sesgos presentes en los datos de entrenamiento (SADA, MASC, CommonVoice, etc.), especialmente en términos de género, registro o variantes regionales.
- **No es un modelo zero-shot**: no debe usarse como solución genérica para cualquier variante de árabe sin evaluación previa.
- **Licencia**: Apache-2.0, pero se deben respetar las licencias de los datasets de entrenamiento (p. ej., CommonVoice, FLEURS), que pueden tener restricciones adicionales para uso comercial.
- **Contexto limitado**: no se especifica la longitud de contexto; para clips muy largos puede ser necesario segmentar el audio.
- **Dependencia de normalización**: la salida está normalizada (sin diacríticos, hamza normalizada), lo que puede no ser adecuado para aplicaciones que requieran texto sin normalizar.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/lemuralabs/lemura-arabic-asr-qwen3)
- [Modelo base Qwen3-ASR-1.7B](https://huggingface.co/Qwen/Qwen3-ASR-1.7B)
- [Framework ms-swift](https://github.com/modelscope/ms-swift)
- Datasets de entrenamiento: [SADA22](https://huggingface.co/datasets/MohamedRashad/SADA22), [MASC-Arabic](https://huggingface.co/datasets/MohamedRashad/MASC-Arabic), [FLEURS](https://huggingface.co/datasets/google/fleurs), [CommonVoice 17.0](https://huggingface.co/datasets/fsicoli/common_voice_17_0)
