# Awesome-x/voxira-yoruba-phaseXI

## Resumen

Voxira Yorùbá Phase XI es un modelo de reconocimiento automático del habla (ASR) especializado en code-switching yorùbá-inglés, es decir, en la transcripción de habla real de nigerianos educados que mezclan ambos idiomas en la misma frase. Lo desarrolla el usuario Awesome-x y se publica bajo licencia Apache 2.0. Se trata de un fine-tune de `facebook/wav2vec2-large-xlsr-53`, un transformer convolucional-recurrente para audio, con 315.485.870 parámetros totales y pesos en formato safetensors.

La relevancia de esta fase (Phase XI) no reside en el modelo acústico, sino en la decodificación. Los pesos acústicos son byte a byte idénticos a los de Phase X (mismo SHA-256); lo que cambia es el modelo de lenguaje KenLM de 4 gramos (4,1 MB, 50.000 líneas equilibradas por entropía y podadas) y los hiperparámetros del decodificador (alpha 0,3 / beta 0,5 frente a 2,0 / 1,5 de Phase X). El autor documenta que el LM anterior estaba sesgado hacia texto yorùbá (85,6 % del corpus) y arrastraba las palabras inglesas hacia falsos cognados, degradando el WER al 8,0 %.

El modelo se distribuye como release candidate: la bake-off de decodificadores está completa, pero la verificación independiente en un conjunto held-out sigue pendiente. El WER declarado del 4,5 % procede de un conjunto de desarrollo de 100 clips sobre el que se ajustó el decodificador, por lo que no debe interpretarse como estimación de generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional + encoder de atención), fine-tune de `facebook/wav2vec2-large-xlsr-53` |
| Parametros totales | 315.485.870 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada típica de wav2vec2, no especificada en la información) |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en precisión completa; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | yorùbá (yo), inglés nigeriano (en); code-switching yo-en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), tamaño del repo 1,3 GB |

## Arquitectura y entrenamiento

La arquitectura es wav2vec2-large-xlsr-53: un extractor de características convolucional seguido de un encoder transformer que produce representaciones latentes sobre las que se aplica una cabeza CTC. El vocabulario acústico de salida es de 42 tokens e incluye `ABCDEFGHIJKLMNOPRSTUVWY` más las vocales y consonantes diacríticas `ÀÁÈÉÌÍÒÓÙÚŃṢẸỌ`. El modelo se entrena sobre clips de 16 kHz y genera texto en mayúsculas sin puntuación ni distinción de caja.

En Phase XI no hay entrenamiento acústico nuevo: los pesos son idénticos a los de Phase X. La innovación está en el pipeline de decodificación, que combina CTC con un modelo de lenguaje KenLM de 4 gramos (`c50k_prune`, 4,1 MB) mediante `pyctcdecode`. El corpus del LM se reconstruyó con 50.000 líneas equilibradas por entropía, con las aperturas templadas limitadas a 400 por patrón (se descartaron 8.144 líneas), el texto conversacional y bancario sobrerrepresentado 4x y poda de n-gramas singleton (`--prune 0 1 1 2`). Además, se aplica un `phonetic_map.json` que parchea casos frecuentes con letras ausentes del vocabulario (ZERO, EXAM, TAX, ZENITH). El conjunto de datos de referencia es `google/fleurs`.

## Capacidades

- Transcripción de voz a texto en yorùbá e inglés nigeriano, incluyendo frases con code-switching intraoracional.
- Decodificación CTC con LM KenLM integrado (beam search vía `pyctcdecode`), con pesos alpha/beta configurables.
- Manejo de vocabulario conversacional y bancario gracias al reequilibrado del corpus del LM.
- Mapeo fonético de casos con letras ausentes del vocabulario mediante `phonetic_map.json`.
- Salida normalizada en mayúsculas, sin puntuación ni casing.
- No soporta tool calling, function calling, agentes, visión ni audio generativo; es exclusivamente ASR.
- Capacidad multilingüe limitada a los dos idiomas declarados; el pidgin nigeriano no es objetivo de esta release.

## Casos de uso

- Transcripción de conversaciones bancarias con code-switching: el LM reequilibrado con texto bancario sobrerrepresentado 4x permite transcribir frases como transferencias y consultas de saldo donde aparecen términos ingleses ("account balance", "transfer") mezclados con yorùbá.
- Subtitulado y documentación de reuniones de equipos nigerianos: el modelo procesa clips de 16 kHz y genera transcripciones en mayúsculas adecuadas para pipelines de post-procesado que añadan puntuación y casing.
- Análisis de encuestas y entrevistas en ciencias sociales: útil para corpus de habla yorùbá-inglesa donde la alternancia de lenguas es la norma y los ASR monolingües fallan en los tramos en inglés.
- Prototipado de asistentes de voz para mercados de África Occidental: la licencia Apache 2.0 permite integrar el modelo en productos comerciales sin restricciones de atribución más allá de las habituales.
- Investigación en ASR de bajos recursos: el modelo sirve como baseline reproducible para estudiar el efecto del peso del LM (alpha/beta) en code-switching, dado que el autor publica el desglose completo de la bake-off de decodificadores.
- Verificación de calidad de transcripciones en centros de contacto: con revisión humana obligatoria para acciones legales, médicas o financieras, el modelo puede pre-rellenar borradores de transcripción que un agente valide.
- Evaluación comparativa de decodificadores CTC: el script `deploy_phaseXI.py` con `VOXIRA_HELDOUT_MANIFEST` permite puntuar greedy, Phase X y Phase XI sobre los mismos logits acústicos, útil para experimentos de decodificación.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card. Todos los scores están normalizados (mayúsculas, NFC, puntuación eliminada); *no-tone* elimina además los tonos y *plain* todos los diacríticos. El conjunto es un dev set de 100 clips (10,5 min, 1.268 palabras de referencia) sobre el que se ajustó el decodificador, por lo que los números están sesgados de forma optimista.

| Variante | Modelo de lenguaje | Tamano LM | WER | no-tone WER | plain WER | CER |
|---|---|---|---|---|---|---|
| Phase X desplegado | 5-gram, alpha=2.0, beta=1.5 | — | 8,0 % | 8,0 % | 7,9 % | 1,8 % |
| Greedy (sin LM) | ninguno (solo acústica) | 0 MB | 4,5 % | 4,3 % | 4,0 % | 1,1 % |
| Corpus completo sin poda | 366k líneas, alpha=0,3, beta=0,5 | 92 MB | 4,5 % | 4,3 % | 4,0 % | 1,0 % |
| c100k podado | 100k líneas, alpha=0,3, beta=1,5 | 7 MB | 5,0 % | 4,8 % | 4,5 % | 1,2 % |
| **Phase XI `c50k_prune`** | 50k equilibradas + podadas, alpha=0,3, beta=0,5 | 4,1 MB | 4,5 % | 4,3 % | 4,0 % | 1,1 % |

El propio autor advierte que la decodificación greedy ya alcanza el 4,5 % y que el LM de Phase XI no reduce el WER en este conjunto; la mejora frente a Phase X (8,0 % → 4,5 %) refleja que el peso excesivo del LM anterior perjudicaba. El beneficio del LM en palabras raras (nombres, lugares, términos bancarios) no está demostrado. En el conjunto held-out de 55 clips, la model card de Phase X reportaba 12,33 % (Phase 10) y 7,09 % (Phase X); Phase XI aún no tiene medición held-out publicada.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint safetensors pesa aproximadamente 1,26 GB (315,5 M de parámetros en fp32); en fp32 requiere en torno a 2-3 GB de VRAM incluyendo activaciones para clips cortos, y menos de 2 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. El modelo no requiere GPU de centro de datos.
- Cabe holgadamente en GPU de consumo: sí, en RTX 3060/4060/4090 y equivalentes, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), decodificación CTC con `pyctcdecode` + KenLM, y el script propio `deploy_phaseXI.py`. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama (no aplicables a un modelo CTC de audio).
- Latencia y throughput: no disponibles en la información proporcionada; el conjunto de evaluación de 100 clips dura 10,5 minutos de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voxira Yorùbá Phase XI | 315,5 M | yo, en (code-switching) | clips de 16 kHz | Apache 2.0 | Hugging Face, demo Space |
| `facebook/wav2vec2-large-xlsr-53` (base) | ~317 M | 53 idiomas (incluye yo, en) | clips de 16 kHz | Apache 2.0 | Hugging Face |
| Phase X (mismo autor) | 315,5 M (pesos idénticos) | yo, en | clips de 16 kHz | Apache 2.0 | Hugging Face |

La comparación con otros ASR específicos para yorùbá no está disponible en la información proporcionada. Frente a su modelo base, Voxira Phase XI añade el ajuste fino acústico y el pipeline de decodificación con KenLM y mapeo fonético; frente a Phase X, comparte pesos acústicos y difiere únicamente en el LM y los hiperparámetros del decodificador.

## Limitaciones y advertencias

- **Letras ausentes Q, X, Z**: el vocabulario acústico de 42 tokens no las incluye, lo que afecta a aproximadamente el 1,3 % de las palabras inglesas de referencia y fija un suelo de error. `phonetic_map.json` solo parchea casos frecuentes (ZERO, EXAM, TAX, ZENITH); el autor prevé extender la capa de salida en Phase XII.
- **Conjuntos de evaluación pequeños**: decenas de clips de un único corpus (`AR_Audios`); los intervalos de confianza son amplios y parte de los 100 clips de desarrollo pueden haber sido vistos durante el ajuste acústico. El 4,5 % no es una estimación de generalización.
- **Sesgo de selección del decodificador**: la configuración se eligió sobre el mismo conjunto en el que se reporta, por lo que las métricas están sesgadas de forma optimista.
- **Tipo de habla y condiciones acústicas**: evaluado solo en clips de 16 kHz; no se ha evaluado con telefonía a 8 kHz, ruido de fondo intenso ni hablantes solapados. El pidgin nigeriano no es objetivo de esta release.
- **Riesgo de alucinación**: como todo ASR, puede producir transcripciones plausibles pero incorrectas, especialmente en palabras raras o fuera del vocabulario del LM.
- **No es un modelo de verificación de hablante**: no debe usarse una transcripción como prueba de identidad (KYC).
- **Sin puntuación ni casing**: la salida son palabras en mayúsculas sin puntuación; requiere post-procesado para texto publicable.
- **Revisión humana recomendada** para acciones legales, médicas y financieras desencadenadas a partir de la transcripción.
- **Licencia**: Apache 2.0 permite uso comercial, pero el estado de release candidate y la falta de verificación held-out desaconsejan desplegarlo en producción sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Awesome-x/voxira-yoruba-phaseXI
- Demo Space: https://huggingface.co/spaces/Awesome-x/voxira-demo
- Modelo base: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- Dataset de referencia: https://huggingface.co/datasets/google/fleurs
- Repositorio del autor: https://huggingface.co/Awesome-x
