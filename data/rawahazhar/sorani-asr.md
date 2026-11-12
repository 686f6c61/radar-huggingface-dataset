# RawaHazhar/sorani-asr

## Resumen

Sorani ASR es un modelo de reconocimiento automático del habla (ASR) para kurdo central (sorani, código `ckb`), desarrollado por Rawa Hazhar (Universidad de Sulaimani). Se trata de un ajuste fino de `facebook/w2v-bert-2.0` con una cabeza CTC para transcripción de voz a texto, publicado bajo licencia MIT, lo que lo convierte en uno de los pocos modelos ASR para kurdo central con licencia permisiva y uso comercial libre.

El modelo resuelve un problema concreto: la escasez de sistemas ASR abiertos y precisos para sorani. Según el autor, es el primer modelo de kurdo central con licencia MIT que combina una precisión competitiva con un tamaño lo bastante reducido como para ejecutarse en un portátil convencional sin GPU. Con su modelo de lenguaje de 5-gramas incluido, alcanza un WER del 24,2 % en FLEURS, estadísticamente a la par que el modelo Omnilingual ASR de Meta (7.800 millones de parámetros), unas trece veces más grande.

La relevancia actual radica en su relación precisión/tamaño y en su licencia: permite integrar transcripción de sorani en productos comerciales, herramientas de subtitulado o aplicaciones de voz sin depender de servicios propietarios ni de infraestructura de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-BERT (encoder convolucional + transformer) con cabeza CTC |
| Parametros totales | no disponible (modelo base `facebook/w2v-bert-2.0`; el autor indica que es ~1/13 del tamaño de un modelo de 7.800 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio dependiente del feature extractor de W2V-BERT) |
| Tipos de cuantizacion | no disponible (pesos en transformers; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | kurdo central (sorani, `ckb`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `facebook/w2v-bert-2.0`, un encoder auto-supervisado que combina extractores convolucionales con un transformer sobre representaciones de audio, y le añade una cabeza de clasificación CTC (`Wav2Vec2BertForCTC`) ajustada para el vocabulario del sorani. La tokenización de audio utiliza el `SeamlessM4TFeatureExtractor`, tal como se muestra en el ejemplo de uso de la model card.

El ajuste fino emplea el conjunto de datos `google/fleurs` (kurdo central) y, según los resultados reportados, también datos de AsoSoft y Common Voice v24 (con hablantes de test explícitamente excluidos del entrenamiento). El repositorio incluye además un modelo de lenguaje de 5-gramas específico de sorani que puede aplicarse en decodificación para reducir el WER. No se detallan en la información disponible el número exacto de tokens de audio, la composición completa del dataset ni si hubo etapas de RLHF/DPO (no aplicables habitualmente en ASR CTC).

## Capacidades

- Transcripción de voz a texto en kurdo central (sorani) a partir de audio.
- Decodificación greedy o con modelo de lenguaje de 5-gramas incluido en el repositorio.
- Generación de subtítulos en formato SRT (según la demo del autor).
- Ejecución en CPU sin GPU (aproximadamente 0,9× tiempo real en un Intel Core i5-10210U con 8 GB de RAM).
- Integración con la librería `transformers` (`Wav2Vec2BertForCTC`, `Wav2Vec2CTCTokenizer`).
- No soporta tool calling, agentes, visión ni audio multimodal; es un modelo ASR puro.
- Capacidad monolingüe: únicamente sorani.

## Casos de uso

- Transcripción de entrevistas y reuniones: el modelo convierte grabaciones de voz sorani en texto para actas o documentación, con la ventaja de ejecutarse en portátiles sin GPU.
- Subtitulado de vídeo: la demo del autor genera SRT directamente, útil para creadores de contenido en kurdo central que necesitan subtítulos rápidos y revisables.
- Transcripción de notas de voz de WhatsApp: el modelo está pensado explícitamente para este caso, permitiendo digitalizar mensajes de voz en entornos personales o de atención al cliente.
- Digitalización de clases y conferencias: transcripción de material docente en sorani para su archivo, búsqueda o accesibilidad.
- Aplicaciones de voz en producción con licencia MIT: integración en asistentes o interfaces por voz para sorani sin coste de licencia ni dependencia de la nube.
- Investigación lingüística y creación de corpus: generación de transcripciones para estudios de fonética, ortografía o evaluación de normalizadores de sorani.
- Accesibilidad: conversión de audio a texto para personas con discapacidad auditiva en comunidades de habla sorani.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). FLEURS Central Kurdish test: 348 frases, una grabación por frase, con normalizador de sorani.

| Configuracion | WER % | CER % |
|---|---|---|
| Este modelo, decodificacion greedy | 27,5 (25,8–29,4) | 6,9 (5,8–8,2) |
| Este modelo + LM de 5-gramas | 24,2 (22,4–26,1) | 6,5 (5,4–7,8) |
| Omnilingual ASR `omniASR_LLM_7B` (7.800 M, sin LM) | 24,2 (22,4–26,1) | 6,7 (5,4–8,0) |
| MMS-1b-all + mismo LM | 27,4 | 7,3 |

| Conjunto de test | Greedy WER / CER % | Con LM WER / CER % | Omnilingual ASR LLM-7B WER / CER % |
|---|---|---|---|
| AsoSoft (600 grabaciones de estudio, 100 frases) | 19,7 / 2,8 | 17,5 / 2,5 | 18,9 / 2,7 |
| Common Voice v24 test (5.348 grabaciones, 1.151 hablantes excluidos del entrenamiento) | 22,5 / 4,2 | 19,8 / 3,9 | 23,5 / 4,6 |

Notas del autor: en FLEURS la diferencia con Omnilingual ASR es de 0,04 puntos de WER (p = 0,96, sin significación estadística); en Common Voice el modelo es mejor (p ≤ 0,001). En un análisis ciego de 160 tramos de error, dos hablantes nativos consideraron solo el 29 % y el 33 % como errores reales de reconocimiento; el resto eran variantes ortográficas o de separación de palabras.

## Requisitos de hardware

- Inferencia en CPU viable: ~0,9× tiempo real en un Intel Core i5-10210U con 8 GB de RAM (decodificación greedy).
- VRAM estimada para GPU: no disponible en la información proporcionada; por tamaño del modelo base (W2V-BERT 2.0), cabe holgadamente en GPUs de consumo como RTX 3060/4060/4090.
- GPUs recomendadas: cualquier GPU con suficiente memoria para el modelo base; el autor no documenta requisitos específicos.
- Cabe en GPU de consumo: sí, previsiblemente en todas las RTX modernas; también en CPU.
- Opciones de despliegue: `transformers` (PyTorch) con `Wav2Vec2BertForCTC`, `Wav2Vec2CTCTokenizer` y `SeamlessM4TFeatureExtractor`; el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face. No se documentan vLLM, llama.cpp ni Ollama (no aplicables a este tipo de modelo CTC).
- Latencia/throughput: ~0,9× tiempo real en CPU según el autor; sin datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/idioma | WER FLEURS (ckb) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sorani ASR (este modelo) | ~1/13 de 7.800 M (no disponible exacto) | Sorani (`ckb`) | 24,2 (con LM) / 27,5 (greedy) | MIT | Hugging Face + Space |
| Omnilingual ASR `omniASR_LLM_7B` (Meta) | 7.800 M | Multilingüe | 24,2 (sin LM) | no disponible en la información | no disponible en la información |
| MMS-1b-all (Meta) | 1.000 M | Multilingüe | 27,4 (con LM) | no disponible en la información | no disponible en la información |

El autor indica que este modelo supera a todos los modelos abiertos específicos de sorani que probó, aunque no se detallan sus nombres ni resultados en la información disponible.

## Limitaciones y advertencias

- El texto generado no incluye puntuación.
- Nombres propios y palabras extranjeras se transcriben incorrectamente con frecuencia.
- Mejor rendimiento con habla clara y sin ruido de fondo; el ruido degrada la precisión.
- El WER depende fuertemente de la convención ortográfica del sorani; contra referencias en ortografía de la Academia Kurda los resultados a nivel de palabra son mejores.
- Parte de los "errores" medidos son variantes ortográficas o de espaciado, no fallos reales de reconocimiento (según el análisis ciego del autor).
- Riesgo de alucinación inherente a los modelos CTC en segmentos ambiguos o de silencio; se recomienda revisar siempre la transcripción antes de publicarla.
- Modelo monolingüe: no transcribe otros idiomas ni variedades del kurdo distintas del sorani.
- Licencia MIT permite uso comercial, pero los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- Sin datos publicados sobre sesgos demográficos o de acento; la cobertura de hablantes depende de los corpus de entrenamiento (FLEURS, AsoSoft, Common Voice).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RawaHazhar/sorani-asr
- Demo (Space): https://huggingface.co/spaces/RawaHazhar/sorani-speech-to-text
- Modelo base: https://huggingface.co/facebook/w2v-bert-2.0
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- ORCID del autor: https://orcid.org/0009-0003-5134-6626
