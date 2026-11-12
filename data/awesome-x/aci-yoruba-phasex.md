# Awesome-x/aci-yoruba-phaseX

## Resumen

aci-yoruba-phaseX es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario Awesome-x y publicado en Hugging Face. Se trata de un ajuste fino de Wav2Vec2ForCTC orientado a la transcripción de audio en yoruba con presencia de code-switching yoruba-inglés, un fenómeno muy habitual en hablantes bilingües de Nigeria y la diáspora. El modelo combina un modelo acústico Wav2Vec2 (compartido con la versión Phase 10 del mismo autor) con un decodificador KenLM de 5-gramas y un mapa de post-procesado fonético, todo empaquetado de forma autocontenida en el repositorio.

La relevancia del modelo radica en su especialización: frente a sistemas ASR multilingües genéricos, este checkpoint está entrenado y evaluado específicamente sobre un corpus propio (AR_Audios) de habla yoruba con mezcla de inglés. Según la model card, alcanza un WER del 7,09 % en un conjunto de validación reservado de 55 muestras, una mejora sustancial frente al 12,33 % de la fase anterior, atribuible principalmente a la reconfiguración del decodificador KenLM (alpha=2.0, beta=1.5) y a un corpus unigramas más amplio, no a un reentrenamiento acústico adicional.

El modelo cuenta con 315.485.870 parámetros (aproximadamente 315 M), un tamaño de repositorio de 1,6 GB y licencia Apache 2.0, lo que facilita su uso comercial. Está pensado como candidato a producción para aplicaciones de transcripción de voz en yoruba, aunque el propio autor advierte que el conjunto de evaluación es modesto y recomienda validación adicional sobre audio propio antes de desplegarlo en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (transformer convolucional + encoder CTC) con decodificador KenLM de 5-gramas |
| Parametros totales | 315.485.870 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio dependiente de la implementación, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | yoruba (yo), inglés (en) con code-switching yo-en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Wav2Vec2ForCTC, un encoder convolucional y transformer entrenado con pérdida CTC para alineamiento secuencia-a-secuencia sin necesidad de transcripciones a nivel de fotograma. Sobre la salida del modelo acústico se aplica un decodificador de lenguaje KenLM de 5-gramas con parámetros alpha=2.0 y beta=1.5, entrenado sobre un corpus de unigramas más amplio que en fases anteriores. Además, el repositorio incluye un mapa de post-procesado fonético (phonetic_map.json) que normaliza la salida antes de la evaluación y el uso final.

Los pesos acústicos son compartidos con la versión Phase 10 del mismo autor, lo que significa que la mejora de rendimiento entre ambas fases (de 12,33 % a 7,09 % de WER) proviene exclusivamente de la configuración de decodificación y del corpus del modelo de lenguaje, no de un reentrenamiento acústico adicional. El ajuste fino se realizó sobre el corpus AR_Audios, que según la model card contiene aproximadamente 550 muestras, de las cuales 55 se reservaron para evaluación. No se especifica en la información disponible el número de tokens de audio, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o regularización.

## Capacidades

- Reconocimiento automático del habla (ASR) en yoruba con mezcla de inglés (code-switching yoruba-inglés).
- Transcripción de audio a texto con decodificación CTC y modelo de lenguaje KenLM integrado.
- Post-procesado fonético mediante un mapa configurable incluido en el repositorio.
- Normalización de texto (eliminación de puntuación) integrada en el pipeline de evaluación.
- Soporte de audio a 16 kHz (según el ejemplo de la model card con librosa).
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni razonamiento multi-paso; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas bilingües yoruba-inglés: el modelo maneja code-switching de forma nativa, por lo que puede transcribir conversaciones donde los hablantes alternan entre ambos idiomas sin necesidad de segmentar manualmente por idioma.
- Subtitulado automático de contenido audiovisual nigeriano: películas, series y vídeos de YouTube en yoruba pueden transcribirse con el modelo y posteriormente revisarse por un humano, reduciendo el coste de producción de subtítulos.
- Atención al cliente en centros de llamadas: integrado en un pipeline de ASR en tiempo casi real, permite transcribir llamadas de hablantes de yoruba para su análisis, búsqueda y cumplimiento normativo.
- Documentación clínica y legal dictada: profesionales que dictan informes en yoruba con términos en inglés pueden beneficiarse de la transcripción automática, con revisión posterior dado el WER actual.
- Investigación lingüística y corpus orales: el modelo facilita la transcripción masiva de grabaciones de campo en yoruba, acelerando la creación de corpus anotados para estudios sociolingüísticos.
- Accesibilidad y asistentes de voz: integración en asistentes que requieran entrada por voz en yoruba, como sistemas de dictado o interfaces de accesibilidad para hablantes de la lengua.
- Evaluación comparativa de ASR de bajos recursos: sirve como referencia para investigadores que trabajan en modelos ASR para lenguas africanas con pocos datos.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (no verificados de forma independiente) son los siguientes:

| Modelo | Configuración del decodificador | WER (held-out, normalizado) |
|---|---|---|
| Phase 8 / 9 | KenLM alpha=0.5, beta=1.0 | 12,63 % |
| Phase 10 | KenLM alpha=0.5, beta=1.0 (acústica ajustada) | 12,33 % |
| **Phase X** | **KenLM alpha=2.0, beta=1.5, corpus unigramas mayor** | **7,09 %** |

Conjunto de evaluación: ACI Yoruba-English Code-Switching Held-Out Set (55 muestras, normalización de puntuación simétrica). El autor advierte que 55 muestras constituyen un conjunto de validación modesto y recomienda validar sobre audio propio y conjuntos independientes más amplios antes de considerar el resultado como un benchmark de producción generalizado. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo es exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: con 315 M de parámetros en fp32, el modelo ocupa aproximadamente 1,26 GB de pesos; en fp16, unos 630 MB. El repositorio completo es de 1,6 GB, incluyendo el modelo de lenguaje KenLM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16; se recomiendan tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput en producción.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas (RTX 3060 en adelante); también puede ejecutarse en CPU para inferencia por lotes con latencia mayor.
- Opciones de despliegue: transformers con PyTorch (Wav2Vec2ForCTC y Wav2Vec2ProcessorWithLM), pyctcdecode para la decodificación KenLM, y potencialmente ONNX Runtime o TorchScript para optimización. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, dado que es un modelo ASR y no un LLM.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / ventana | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| aci-yoruba-phaseX | 315 M | yo, en (code-switching) | no disponible | 7,09 % (held-out propio) | Apache 2.0 | Hugging Face |
| Phase 10 (mismo autor) | comparte acústica | yo, en | no disponible | 12,33 % (held-out propio) | Apache 2.0 | Hugging Face |
| Wav2Vec2 base multilingüe | ~95 M / ~317 M | multilingüe | no disponible | no disponible | Apache 2.0 / MIT | Hugging Face |

No se dispone de datos de benchmarks comparables de otros modelos ASR específicos para yoruba en la información proporcionada; la comparativa se limita a las fases del mismo autor y a la familia Wav2Vec2 genérica.

## Limitaciones y advertencias

- El conjunto de evaluación held-out es de solo 55 muestras de un único dataset (AR_Audios); el propio autor recomienda validar sobre audio propio y conjuntos independientes más amplios antes de tratarlo como benchmark de producción generalizado.
- El WER del 7,09 % no ha sido verificado de forma independiente (verified: false en la model card).
- El modelo está especializado en yoruba e inglés; no cubre otras lenguas africanas ni variedades dialectales no representadas en el corpus de entrenamiento.
- El vocabulario del modelo no produce puntuación, por lo que la evaluación se realiza con normalización simétrica; en producción será necesario un post-procesado adicional para obtener texto con puntuación.
- Riesgo de alucinación en ASR: el decodificador KenLM puede generar secuencias plausibles pero incorrectas en audio ruidoso o con acentos no vistos.
- No se documentan sesgos específicos de género, edad o dialecto; al entrenarse sobre un corpus limitado, es probable que presente peor rendimiento en variedades del yoruba poco representadas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al corpus de entrenamiento.
- No se documentan requisitos de latencia ni throughput, lo que dificulta planificar despliegues en tiempo real sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Awesome-x/aci-yoruba-phaseX
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
