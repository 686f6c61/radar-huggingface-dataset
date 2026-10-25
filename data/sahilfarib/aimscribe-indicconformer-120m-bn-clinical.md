# sahilfarib/aimscribe-indicconformer-120m-bn-clinical

## Resumen

`sahilfarib/aimscribe-indicconformer-120m-bn-clinical` es un ajuste fino (fine-tune) del modelo de reconocimiento automático del habla en bengalí `ai4bharat/indicconformer_stt_bn_hybrid_ctc_rnnt_large` de AI4Bharat, especializado en vocabulario clínico. Lo publica el usuario Sahil al Farib (sahilfarib) como resultado de una evaluación de siete días, con el objetivo de mejorar la transcripción de términos médicos (fármacos, dosis, frecuencias, pruebas y diagnósticos) en consultas habladas en bengalí, un dominio donde los ASR genéricos fallan con frecuencia.

El modelo parte de una arquitectura Conformer con decodificador híbrido CTC-RNNT y aproximadamente 120 millones de parámetros en el codificador (17 bloques Conformer, dimensión 512, según la información pública de la familia IndicConformer). El ajuste se realizó únicamente sobre la rama CTC, por lo que la decodificación debe hacerse con CTC; la rama RNNT del checkpoint base queda sin entrenar en este fine-tune. Entrena con 1.012 frases clínicas sintéticas locutadas mediante clonación de voz con IndicF5 sobre 64 hablantes de OpenSLR 53, mezcladas 1:1 con habla real del mismo corpus.

Su relevancia es acotada y honesta: mejora de forma medible la precisión de términos clínicos (del 51,6 % al 70,7 % en el conjunto de términos evaluado) y reduce el CER en consultas reales de 11,1 a 9,4, pero no supera a IndicConformer de 600M (CER 7,2 en consultas), que es el modelo finalmente adoptado en el pipeline del autor. Se distribuye con licencia MIT, solo soporta bengalí y el propio autor advierte que no es apto para uso clínico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con decodificador híbrido CTC-RNNT (familia IndicConformer; 17 bloques Conformer, dimensión de modelo 512 según información pública de la familia) |
| Parametros totales | 120M en el codificador (denominación del checkpoint base); total exacto del conjunto codificador+decodificadores no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; modelo ASR que procesa segmentos de audio, la model card no especifica la ventana máxima |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Bengalí (bn) únicamente |
| Licencia | MIT |
| Formato de pesos | No disponible (repositorio de 0,5 GB, librería NeMo; requiere el fork de NeMo de AI4Bharat, rama `nemo-v2`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura IndicConformer de AI4Bharat: un codificador Conformer-Large de 120M de parámetros con decodificador híbrido CTC-RNNT. En este fine-tune solo se entrena la rama CTC, de modo que la inferencia debe hacerse con decodificación CTC; usar la cabeza RNNT produciría salidas no entrenadas. El checkpoint se carga con NeMo, pero necesita el fork mantenido por AI4Bharat (rama `nemo-v2`), no la versión estándar de la librería.

Los datos de entrenamiento son 1.012 frases clínicas sintéticas con estructura de fármaco, dosis y frecuencia, pruebas, diagnósticos y respuestas de seguimiento, locutadas mediante clonación de voz con IndicF5 sobre 64 hablantes de OpenSLR 53. Se aplicó un control de calidad que descartó los clips con CER superior al 50 %, y el conjunto sintético se mezcló 1:1 con habla real de OpenSLR 53. El autor indica que ninguna frase del conjunto de test ni ninguna palabra de las consultas de desarrollo aparece en el texto de entrenamiento. El entrenamiento consistió en 1.500 pasos, batch de 8 y tasa de aprendizaje 5e-5, seleccionando el mejor checkpoint por WER de desarrollo sobre 6 hablantes reservados de OpenSLR (de 17,8 a 15,5). No se documenta uso de RLHF ni de DPO, algo esperable en un modelo ASR.

## Capacidades

- Reconocimiento automático del habla en bengalí, con especialización en vocabulario clínico.
- Transcripción de términos de fármacos, dosis, frecuencias, pruebas diagnósticas y diagnósticos, con mejora medida frente al modelo base.
- Decodificación CTC (obligatoria); la rama RNNT no está entrenada en este checkpoint.
- Funcionamiento con audio de habla espontánea de estilo consulta (role-play), no solo lectura de frases.
- Modelo ligero (120M de parámetros), adecuado para inferencia en entornos con pocos recursos.
- No soporta tool calling ni function calling: es un modelo ASR, no un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- Multilingüismo: no; únicamente bengalí.
- Capacidades especiales: no se documentan modos de *thinking*, visión, audio más allá de ASR, diarización, puntuación automática ni marcas de tiempo.

## Casos de uso

- Dictado clínico en bengalí: transcripción de notas de consulta donde el profesional dicta nombre de fármaco, dosis y pauta; el ajuste eleva la precisión de términos clínicos del 51,6 % al 70,7 %, lo que reduce correcciones manuales en ese vocabulario.
- Investigación sobre ASR clínico en lenguas de la India: sirve como punto de partida reproducible (MIT, 0,5 GB) para experimentos de adaptación de dominio con datos sintéticos y clonación de voz.
- Extracción estructurada de prescripciones: al transcribir con mayor fidelidad los términos de fármaco-dosis-frecuencia, facilita un paso posterior de parseo a un formulario o base de datos.
- Pre-anotación de corpus de consultas: generación de transcripciones iniciales que un anotador humano revisa, con coste menor que la transcripción desde cero.
- Evaluación comparativa de modelos ASR: el modelo card ofrece una tabla CER lista para usar como referencia frente a otros fine-tunes o al modelo base en el mismo conjunto sintético de 600 clips.
- Transcripción en entornos con hardware limitado: con 120M de parámetros puede ejecutarse en CPU o en GPUs de gama baja para prototipos y demos en zonas con conectividad limitada.
- Adaptación a otras lenguas o dominios: la receta (frases sintéticas clínicas + clonación de voz + mezcla con habla real) es reutilizable para los checkpoints IndicConformer de otros idiomas.

## Benchmarks y rendimiento

Resultados declarados por el autor, con decodificación CTC, comparando el modelo base sin ajustar (zero-shot 120M) con este fine-tune:

| Metrica (decodificacion CTC) | Zero-shot 120M | Este modelo |
|---|---|---|
| CER en consultas reales de role-play | 11,1 | 9,4 |
| CER en test clínico sintético (600 clips) | 4,6 | 3,6 |
| Precisión de términos clínicos, todos | 51,6 % | 70,7 % |
| Términos vistos en entrenamiento | 50,9 % | 69,7 % |
| Términos no vistos en entrenamiento | 44,1 % | 61,7 % |

Referencia adicional aportada en la model card: IndicConformer de 600M alcanza un CER de 7,2 en las mismas consultas de role-play, mejor que este modelo. No hay datos publicados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de ASR (LibriSpeech, Common Voice) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5 GB en FP32 para 120M de parámetros, y del orden de 0,25 GB en FP16; el repositorio completo ocupa 0,5 GB. Cifras orientativas de cálculo, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria sirve para inferencia (GTX 1650, RTX 3060, T4); para entrenamiento o fine-tuning conviene una RTX 3090/4090, A10 o A100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna, e incluso en CPU para audio de duración corta.
- Opciones de despliegue: NVIDIA NeMo con el fork de AI4Bharat (rama `nemo-v2`) y decodificación CTC. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo ASR de este tipo.
- Latencia y throughput: no disponibles; la model card no publica RTF ni métricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto/entrada | CER consultas role-play | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (aimscribe-indicconformer-120m-bn-clinical) | 120M (codificador) | Bengalí | Segmentos de audio (ventana no especificada) | 9,4 | MIT | HuggingFace, 0 descargas |
| IndicConformer base 120M (zero-shot) | 120M (codificador) | Bengalí | Segmentos de audio (ventana no especificada) | 11,1 | No disponible en la información | HuggingFace (AI4Bharat) |
| IndicConformer 600M | 600M (codificador) | Bengalí | Segmentos de audio (ventana no especificada) | 7,2 | No disponible en la información | HuggingFace (AI4Bharat) |
| Whisper large-v3 (alternativa genérica multilingüe) | 1.550M | Multilingüe, incluye bengalí | 30 s por ventana | No disponible para este conjunto clínico | MIT | HuggingFace (OpenAI) |

## Limitaciones y advertencias

- El propio autor indica explícitamente que el modelo no es apto para uso clínico.
- El conjunto de entrenamiento es muy pequeño: 1.012 frases sintéticas, generadas con clonación de voz (IndicF5) sobre 64 hablantes de OpenSLR 53. El riesgo de sobreajuste al estilo y al timbre de esos hablantes es alto.
- Solo se entrenó la rama CTC; usar la decodificación RNNT del checkpoint produce resultados no válidos. Es un error fácil de cometer al cargar el modelo.
- Requiere el fork de NeMo de AI4Bharat (rama `nemo-v2`); la instalación estándar de NeMo puede no cargar el checkpoint.
- Rendimiento inferior a IndicConformer 600M en consultas reales (CER 9,4 frente a 7,2), por lo que no es la mejor opción si hay recursos suficientes.
- Sigue cometiendo errores en términos clínicos no vistos: 61,7 % de precisión implica que aproximadamente cuatro de cada diez términos nuevos se transcriben mal.
- En ASR, los errores de sustitución pueden transformar un fármaco o una dosis en otro válido pero incorrecto, un riesgo crítico en contexto sanitario.
- Solo bengalí; no hay soporte multilingüe ni traducción.
- No se documentan sesgos por género, dialecto o acento más allá de la composición de OpenSLR 53; la cobertura dialectal del bengalí probablemente sea limitada.
- Licencia MIT para este fine-tune, pero conviene verificar la licencia y las condiciones del modelo base de AI4Bharat y de OpenSLR 53 antes de un uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- No se especifican formatos de cuantización ni soporte de herramientas de inferencia habituales, lo que limita su despliegue fuera del ecosistema NeMo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sahilfarib/aimscribe-indicconformer-120m-bn-clinical
- Modelo base: https://huggingface.co/ai4bharat/indicconformer_stt_bn_hybrid_ctc_rnnt_large
- Perfil del autor: https://huggingface.co/sahilfarib
- Organización AI4Bharat en HuggingFace: https://huggingface.co/ai4bharat/models
- Ficha de la familia IndicConformer (variante Odia, referencia de arquitectura): https://free2aitools.com/model/ai4bharat/indicconformer_stt_or_hybrid_ctc_rnnt_large
- ShifaMind, contexto de IA clínica interpretable: https://shifamind.me/
- EvidenceMD, soporte a la decisión clínica: https://evidencemd.ai/
