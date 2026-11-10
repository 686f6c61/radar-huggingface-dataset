# MRM5/AfroLingo

## Resumen

AfroLingo-2 es un adaptador PEFT (LoRA) sobre el modelo de reconocimiento automático del habla `openai/whisper-small`, desarrollado por el usuario MRM5. Se presenta como una "suite de inteligencia del habla para Kenia" que agrupa varias tareas sobre una base Whisper: transcripción ASR en swahili/inglés con acento keniano, clasificación de condado por geolocalización, síntesis de voz (TTS) femenina y masculina, clonación de voz zero-shot, normalización morfológica de Sheng a kiswahili sanifu, doblaje neuronal isócrono, etiquetado de tono emocional y diarización multi-hablante.

La propuesta diferencial es cubrir variantes lingüísticas de Kenia (swahili, Sheng, swaenglish) que los modelos multilingües genéricos tratan deficientemente. El autor reporta un WER del 45,33% en ASR frente al 98,86% de Whisper-small base y el 66,99% de Meta MMS sobre un conjunto de 3.509 grabaciones de campo. El repositorio es de tamaño prácticamente nulo (0,0 GB) y no contiene pesos publicados visibles, por lo que la reproducibilidad queda condicionada a que el autor suba los artefactos y el SDK referenciado.

La licencia es Apache 2.0, lo que facilita el uso comercial, pero la ausencia de pipeline declarado, de descargas y de documentación técnica detallada sobre el entrenamiento limita seriamente su evaluación en producción. Es relevante ahora como ejemplo de especialización regional de Whisper mediante LoRA y como posible base para aplicaciones de voz en África Oriental, siempre con validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre `openai/whisper-small` (transformer encoder-decoder) |
| Parámetros totales | No disponible (el adaptador se distribuye como safetensors PEFT; el modelo base Whisper-small tiene 244 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper-small base admite 30 s de audio por ventana) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Swahili (sw) e inglés (en), con variantes Sheng y swaenglish |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT) y joblib (según tags del repositorio) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) montado sobre `openai/whisper-small`, un transformer encoder-decoder de 244 millones de parámetros diseñado originalmente para ASR multilingüe. El adaptador se complementa con componentes auxiliares empaquetados en joblib (probablemente clasificadores de condado, embeddings de voz y léxicos de normalización) y con un SDK en Python que orquesta ASR, TTS, clonación y diarización sobre FastAPI. No se especifica en la model card el rango LoRA, las capas adaptadas ni la configuración de entrenamiento.

El autor indica que el ajuste se realizó sobre 3.509 grabaciones de campo reales de Kenia, procedentes de Isiolo, Kilifi, Kitale (Trans-Nzoia), Nakuru y Nairobi. No se detalla el número de tokens, la composición exacta del dataset, si hubo aumento de datos, ni si se aplicaron técnicas de RLHF o DPO. Las innovaciones declaradas son la normalización morfológica Sheng→kiswahili sanifu, el doblaje isócrono con alineación temporal (0,000 s de deriva en el tramo [0:00-0:06]) y la diarización con VAD por turnos y clustering sobre pitch y MFCC.

## Capacidades

- Reconocimiento automático del habla (ASR) en swahili keniano, Sheng y swaenglish.
- Clasificación de condado a partir de audio, con 5 clases (Isiolo, Kilifi, Kitale, Nakuru, Nairobi) y 96,88% de exactitud reportada en test held-out.
- Síntesis de voz (TTS) femenina y masculina en sw-KE con léxico asociado.
- Clonación de voz zero-shot a partir de una grabación de referencia del hablante.
- Normalización morfológica de Sheng y swaenglish a kiswahili sanifu, con opción de síntesis de audio normalizado.
- Doblaje neuronal isócrono con alineación de duración y sincronización labial.
- Etiquetado de tono emocional con cuatro categorías calibradas: apasionado, conversacional, formal y calmado.
- Diarización multi-hablante con VAD por turnos y clustering sobre pitch y MFCC.
- Exposición de todas las funciones mediante router FastAPI (`/api/v1/afrolingo2/*`) y motor Python (`AfroLingo2Engine`).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM; las capacidades son de voz.

## Casos de uso

- Transcripción de entrevistas y encuestas de campo en Kenia: el adaptador ASR reduce el WER reportado al 45,33% frente al 98,86% de Whisper-small base, lo que lo hace viable para digitalizar grabaciones en swahili y Sheng sin depender de transcripción manual.
- Enrutamiento geográfico de llamadas entrantes: la clasificación de condado con 96,88% de exactitud permite dirigir automáticamente una llamada al centro de atención regional correspondiente (Isiolo, Kilifi, Kitale, Nakuru o Nairobi).
- Atención al cliente por voz en swahili: el motor TTS femenino y masculino con 86,2% de inteligibilidad permite generar respuestas habladas naturales en sw-KE para IVR y asistentes telefónicos.
- Localización de contenido audiovisual: el doblaje isócrono con 0,000 s de deriva en el tramo evaluado facilita adaptar vídeos al swahili manteniendo la sincronización labial.
- Normalización de redes sociales y mensajería: la conversión Sheng→kiswahili sanifu permite analizar y moderar contenido informal keniano antes de indexarlo o traducirlo.
- Clonación de voz para accesibilidad: la clonación zero-shot con 99,5% de similitud coseno permite preservar la voz de un hablante en la generación de audiolibros o avisos personalizados.
- Análisis de reuniones y llamadas multi-hablante: la diarización con VAD por turnos y clustering de pitch/MFCC permite separar interlocutores en grabaciones de campo.
- Integración en backends FastAPI: el router expuesto permite montar todos los endpoints en una aplicación existente y combinar ASR, TTS y clasificación en un mismo flujo.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (no verificados de forma independiente):

| Módulo | OpenAI Whisper-Small | Meta MMS | AfroLingo-2 |
|---|---|---|---|
| ASR keniano (WER) | 98,86% (85% bucles) | 66,99% (0% bucles) | 45,33% |
| ASR keniano (CER) | No disponible | No disponible | 27,13% |
| Geolocalización por condado | No soportado | No soportado | 96,88% (5 condados) |
| TTS (inteligibilidad) | No soportado | 72,4% | 86,2% (sw-KE F/M + léxico) |
| Clonación de voz zero-shot | No soportado | Voz fija única | 99,5% similitud coseno, 2,83 Hz error F0, 14,48 dB MCD |
| Sheng→kiswahili sanifu | Alucina | Solo fonetiza | Normalizador morfológico + TTS sanifu |
| Doblaje isócrono | Solo texto | Duración no alineada | 0,000 s de deriva labial ([0:00-0:06]) |
| Tono emocional | No soportado | Solo monótono | 4 tonos calibrados |
| Diarización | Stream único | Stream único | VAD por turnos + clustering pitch/MFCC |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech, FLEURS) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, Whisper-small en fp16 requiere aproximadamente 1 GB de VRAM; el adaptador LoRA añade una sobrecarga mínima, pero los componentes auxiliares (TTS, clonación, diarización) pueden elevar el consumo.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo base, una RTX 3060 de 12 GB o superior debería ser suficiente para ASR; para TTS y clonación conviene una RTX 4090 o A100 si se procesan lotes grandes.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM para el pipeline completo, aunque no hay cifras oficiales.
- Opciones de despliegue: el autor proporciona un router FastAPI (`sdk/fastapi_afrolingo2_router.py`) y un motor Python (`sdk/afrolingo2_engine.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de voz.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AfroLingo-2 (MRM5) | Adaptador sobre Whisper-small (244 M base) | 30 s por ventana (base) | sw, en (Sheng, swaenglish) | Apache 2.0 | Repositorio HF con 0 descargas; pesos del adaptador no verificados |
| OpenAI Whisper-small | 244 M | 30 s por ventana | Multilingüe (99 idiomas) | MIT | Ampliamente disponible |
| Meta MMS | Varía por variante (desde 300 M) | 30 s por ventana | Más de 1.100 idiomas | CC-BY-NC 4.0 (según variante) | Disponible en HF |
| Whisper-large-v3 | 1.550 M | 30 s por ventana | Multilingüe | MIT | Ampliamente disponible |

La comparativa se limita a los modelos citados por el autor; no se dispone de datos de otros adaptadores regionales de Whisper para una comparación más amplia.

## Limitaciones y advertencias

- El repositorio tiene 0,0 GB y 0 descargas; no se confirma que los pesos del adaptador y los artefactos joblib estén efectivamente publicados.
- Los benchmarks proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente.
- El WER del 45,33% sigue siendo alto para producción en ASR; el 27,13% de CER indica errores a nivel de carácter que pueden afectar a la transcripción literal.
- La geolocalización se limita a 5 condados concretos y no generaliza a otras regiones de Kenia ni de África Oriental.
- La clonación de voz zero-shot plantea riesgos de suplantación de identidad y requiere consentimiento explícito del hablante; la licencia Apache 2.0 no exime de obligaciones legales en materia de voz.
- El modelo cubre únicamente swahili e inglés; no se documenta soporte de otras lenguas kenianas (kikuyu, luo, kalenjin, etc.).
- No hay información sobre sesgos demográficos, de género o de acento dentro del swahili.
- No se detalla el proceso de entrenamiento (datos, hiperparámetros, evaluación), lo que dificulta la reproducibilidad.
- El SDK y el router FastAPI se referencian en la model card pero no se confirma su presencia en el repositorio.
- Riesgo de alucinación en ASR: el propio autor reporta un 85% de bucles en Whisper-small base, aunque afirma 0% en AfroLingo-2; conviene validar con muestras propias.

## Enlaces

- Hugging Face: https://huggingface.co/MRM5/AfroLingo
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio de referencia de PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
