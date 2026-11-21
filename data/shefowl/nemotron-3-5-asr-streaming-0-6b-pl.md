# shefowl/nemotron-3.5-asr-streaming-0.6b-pl

## Resumen

Nemotron 3.5 ASR Streaming 0.6B — Polish es un ajuste fino (fine-tune) en polaco del modelo `nvidia/nemotron-3.5-asr-streaming-0.6b`, publicado por el usuario shefowl en Hugging Face. Se trata de un sistema de reconocimiento automático del habla (ASR) en streaming basado en una arquitectura FastConformer con decodificador RNNT (Recurrent Neural Network Transducer) y atención cacheada, lo que permite transcribir audio en fragmentos de 560 ms con contexto de atención `[56, 6]`. El modelo cuenta con 648.268.960 parámetros totales (aproximadamente 0,6 mil millones) y está especializado en polaco, con un énfasis particular en dictado médico y discurso formal.

El problema que resuelve es la baja precisión del modelo base en polaco para dominios específicos: según la model card, el fine-tune elimina entre el 18 % y el 68 % de los errores del modelo base dependiendo del conjunto de evaluación, con mejoras especialmente marcadas en discurso parlamentario (de 17,5 % a 5,5 % de WER) y dictado médico en consultas (de 45,6 % a 16,4 %). Se entrenó con aproximadamente 1.500 horas de audio en polaco sobre una única GPU de consumo AMD, lo que resulta relevante por la eficiencia del proceso de entrenamiento.

Es relevante ahora porque demuestra que es posible adaptar un modelo ASR streaming multilingüe de tamaño reducido a un idioma y dominio concretos con recursos de hardware limitados, y porque en dictado médico supera a su propio profesor offline (`parakeet-tdt-0.6b-v3`). No obstante, el autor lo etiqueta explícitamente como una versión experimental de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador RNNT y atención cacheada (cache-aware streaming) |
| Parametros totales | 648.268.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Contexto de atención de streaming `[56, 6]` (fragmentos de 560 ms); no se especifica una ventana máxima en tokens |
| Tipos de cuantizacion | GGUF (etiqueta del repositorio); no se detallan variantes concretas |
| Idiomas soportados | Polaco (pl) |
| Licencia | OpenMDW-1.1 (etiqueta `license: other` en Hugging Face) |
| Formato de pesos | `.nemo` (NeMo), GGUF; repositorio de 5,1 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `nvidia/nemotron-3.5-asr-streaming-0.6b`, que emplea una arquitectura FastConformer (variante de Conformer optimizada para eficiencia) con decodificador RNNT y atención cacheada para inferencia en streaming. La atención cacheada permite mantener un contexto limitado (`[56, 6]`) y procesar el audio en fragmentos de 560 ms sin recalcular todo el historial, lo que habilita transcripción palabra por palabra con baja latencia.

El entrenamiento se realizó con aproximadamente 1.500 horas de audio en polaco sobre una única GPU de consumo AMD. Según la model card, el proceso se organizó en etapas: las etapas 2 y 3 añadieron unas 580 horas de audio nuevo, aunque solo mejoraron entre 1 y 2 puntos los conjuntos de lectura, conversación y campo lejano. Las etiquetas de entrenamiento incorporaron las salidas del modelo offline `parakeet-tdt-0.6b-v3` como profesor (destilación). El autor señala que parte de la brecha frente a modelos offline se atribuye al tokenizador: el vocabulario multilingüe de 13k del modelo base divide las palabras polacas en 3,8 tokens de media, frente a 2,8 en parakeet. No se detalla en la información disponible si hubo RLHF o DPO (no aplica habitualmente a ASR).

## Capacidades

- Reconocimiento automático del habla en polaco en modo streaming, con latencia de fragmento de 560 ms.
- Transcripción palabra por palabra a medida que se habla (adecuado para subtitulado en vivo y dictado).
- Buen rendimiento en discurso parlamentario y formal (WER de 5,5 % en el conjunto de evaluación de comisiones del Sejm).
- Rendimiento destacado en dictado médico: supera a su profesor offline en consultas médicas (16,4 % frente a 23,9 % de WER).
- Manejo de audio de campo lejano (far-field) con degradación controlada (por ejemplo, 30,8 % de WER en dictado médico simulado en campo lejano).
- Manejo de audio telefónico de 8 kHz (57,1 % de WER en el conjunto DiaBiz de call center).
- Escribe los números como dígitos y elimina muletillas ("yy", "no") y falsos comienzos, según la model card.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Subtitulado en vivo de sesiones parlamentarias o reuniones formales: el modelo logra un 5,5 % de WER en comisiones del Sejm y procesa fragmentos de 560 ms, lo que permite mostrar texto casi en tiempo real con alta fidelidad en registros formales.
- Dictado médico en consulta: con un 16,4 % de WER en consultas y un 18,4 % en portal online (ADMEDVOICE), es adecuado para transcribir notas clínicas dictadas por profesionales, superando incluso al modelo offline de referencia en este dominio.
- Primera pasada en streaming con rescoring offline: el autor propone usarlo como pasada rápida en streaming y dejar que un modelo offline revalore cada enunciado al final, combinando baja latencia con la precisión del modelo offline.
- Transcripción de conversaciones y entrevistas: con WER de 29,0 % en SpokesBiz y 21,8 % en SpokesMix, sirve para generar borradores de transcripción de entrevistas o reuniones que luego se revisan manualmente.
- Atención al cliente y call centers: aunque el WER en audio telefónico de 8 kHz es alto (57,1 % en DiaBiz), puede emplearse para enrutamiento por palabras clave o generación de borradores en entornos con audio de banda ancha.
- Subtitulado de contenido multimedia en polaco: para vídeos, pódcasts o clases grabadas donde se requiere transcripción con baja latencia y el audio es relativamente limpio (FLEURS pl: 14,5 % de WER).
- Sistemas de accesibilidad para personas con discapacidad auditiva: la transcripción en streaming palabra por palabra facilita la lectura en tiempo real de conversaciones presenciales o en línea.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan el modelo con el base (ambos en streaming a 560 ms) y con el modelo offline `parakeet-tdt-0.6b-v3`. Las métricas son WER en porcentaje (menor es mejor), con texto en minúsculas y sin puntuación.

| Conjunto de prueba | Modelo base | Este modelo | parakeet-tdt-0.6b-v3 (offline) |
|---|---|---|---|
| Parliament (Sejm, retenido) | 17,5 | 5,5 | no disponible |
| Dictado médico, consultas (ADMEDVOICE) | 45,6 | 16,4 | 23,9 |
| Dictado médico, portal online (ADMEDVOICE) | 38,4 | 18,4 | 22,4 |
| Dictado médico, campo lejano simulado | 63,1 | 30,8 | 31,9 |
| CLARIN-PL Mobile, campo lejano simulado | 53,3 | 31,9 | 18,5 |
| Conversaciones (PELCRA SpokesBiz) | 45,5 | 29,0 | 22,2 |
| Conversaciones, campo lejano simulado | 65,4 | 42,2 | 32,2 |
| FLEURS, campo lejano simulado | 46,6 | 30,3 | 18,6 |
| CLARIN-PL Mobile (lectura, teléfono) | 25,6 | 17,0 | 8,9 |
| FLEURS pl (lectura) | 21,1 | 14,5 | 7,3 |
| Diálogos telefónicos (LUNA) | 49,1 | 34,4 | 27,5 |
| Call center, 8 kHz (DiaBiz) | 74,4 | 57,1 | 45,9 |
| Entrevistas (PELCRA SpokesMix) | 27,7 | 21,8 | 14,9 |
| PWr AZON (lectura) | 10,6 | 8,7 | no disponible |

No se han publicado resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: con 648 millones de parámetros, en FP16 se requieren aproximadamente 1,3 GB solo para pesos; en la práctica, el uso total con buffers y decodificador RNNT se sitúa en torno a 2-4 GB. En cuantización GGUF de 8 bits o inferior, el modelo puede ocupar menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; una RTX 3060, RTX 4060 o superior es suficiente. El autor entrenó el modelo en una única GPU de consumo AMD, lo que indica que el entrenamiento y la inferencia caben en hardware de consumo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes AMD.
- Opciones de despliegue: NeMo (script `speech_to_text_cache_aware_streaming_infer.py` y API de Python con `ASRModel.restore_from`), y formato GGUF para su uso con runtimes compatibles (no se detalla cuáles en la información disponible). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables directamente a este tipo de modelo ASR.
- Latencia y throughput: latencia de fragmento de 560 ms según la configuración de atención `[56, 6]`; no se publican cifras de throughput (RTF) en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / latencia | Idioma | Licencia | Streaming | WER destacado |
|---|---|---|---|---|---|---|
| Este modelo (nemotron-3.5-asr-streaming-0.6b-pl) | 648 M | Fragmentos de 560 ms | Polaco | OpenMDW-1.1 | Sí | 5,5 % (parlamento), 16,4 % (médico) |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base) | ~600 M | Fragmentos de 560 ms | Multilingüe | no disponible | Sí | 17,5 % (parlamento), 45,6 % (médico) |
| nvidia/parakeet-tdt-0.6b-v3 | ~600 M | Offline (enunciado completo) | Multilingüe | no disponible | No | 23,9 % (médico), 7,3 % (FLEURS pl) |

El modelo se sitúa como una alternativa streaming especializada en polaco que supera a su base en todos los conjuntos evaluados y que, en dominios médicos, supera al modelo offline parakeet-tdt-0.6b-v3. Sin embargo, en lectura, conversación y campo lejano sigue por detrás de los modelos offline, con brechas de 5-12 puntos de WER.

## Limitaciones y advertencias

- Es una versión experimental de investigación, según el propio autor; no está pensada para producción sin validación adicional.
- En lectura, conversación y campo lejano comete aproximadamente el doble de errores que los mejores modelos offline abiertos (por ejemplo, 14,5 % frente a 7,3 % en FLEURS pl).
- El WER en audio telefónico de 8 kHz es alto (57,1 % en DiaBiz), lo que limita su uso en call centers con audio de baja calidad.
- El tokenizador del modelo base (vocabulario multilingüe de 13k) fragmenta las palabras polacas en 3,8 tokens de media, lo que penaliza la precisión frente a modelos con tokenizador más eficiente para polaco.
- Escribe números como dígitos y elimina muletillas y falsos comienzos, lo que puede generar discrepancias con referencias que escriben números con letras o conservan muletillas.
- Solo soporta polaco; no se ha validado para otros idiomas.
- Riesgo de sesgos y alucinaciones: no se documentan evaluaciones de sesgo en la información disponible; como todo modelo ASR, puede producir transcripciones incorrectas en audio con ruido, acentos no representados o vocabulario técnico no visto.
- Licencia OpenMDW-1.1: es necesario revisar los términos concretos en el enlace de la licencia para uso comercial, ya que la etiqueta de Hugging Face indica `license: other`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido ampliamente validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shefowl/nemotron-3.5-asr-streaming-0.6b-pl
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Modelo profesor offline: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Repositorio NeMo (scripts de streaming): https://github.com/NVIDIA/NeMo
