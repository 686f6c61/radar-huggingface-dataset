# malinali-app/opus-mt-swc-es

## Resumen

El modelo `malinali-app/opus-mt-swc-es` es un sistema de traducción automática neuronal (NMT) especializado en la dirección swc → es, es decir, de swahili del Congo (código ISO 639-3 `swc`) a español. Lo publica el proyecto Malinali, una aplicación de traducción orientada a inferencia en dispositivo (*on-device*), y consiste en un reempaquetado de los pesos del modelo base `Helsinki-NLP/opus-mt-swc-es` del proyecto OPUS-MT de la Universidad de Helsinki. El autor no entrena un modelo nuevo: convierte los pesos a safetensors y transforma los tokenizadores SentencePiece originales a formato de tokenizador rápido (*fast tokenizer*) de Hugging Face, listo para ejecutarse con el motor Candle a través del componente `marian_flutter`.

Técnicamente es un transformer encoder-decoder de arquitectura Marian, con 75.613.100 parámetros en total y un repositorio de apenas 0,3 GB. Con ese tamaño, el modelo está pensado para ejecutarse en hardware modesto, incluidos teléfonos móviles, lo que encaja con el objetivo declarado de Malinali de ofrecer traducción en local sin depender de servicios en la nube.

Su relevancia ahora es doble: por un lado, cubre un par de idiomas de bajos recursos (swahili del Congo → español) que rara vez aparece en modelos multilingües masivos con calidad dedicada; por otro, demuestra un flujo de trabajo de reempaquetado y distribución para inferencia en dispositivo usando Candle y tokenizadores rápidos, un patrón cada vez más habitual para llevar modelos NMT pequeños a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder Marian (seq2seq) |
| Parametros totales | 75.613.100 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors a precision original) |
| Idiomas soportados | swc (swahili del Congo, origen) y es (espanol, destino) |
| Licencia | no disponible (el autor indica seguir la licencia del modelo de origen, tipicamente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors (pesos) y JSON de tokenizador rapido (`tokenizer-enc.json`, `tokenizer-dec.json`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Marian, un transformer encoder-decoder estándar para traducción automática desarrollado en el marco del proyecto OPUS-MT. Cuenta con un codificador y un decodificador con atención, sin mecanismos de mezcla de expertos ni capas recurrentes. Los detalles concretos sobre el número de tokens de entrenamiento, la composición del dataset, la longitud máxima de contexto y el uso de técnicas de alineación (RLHF, DPO, fine-tuning supervisado) no están disponibles en la información proporcionada. Tampoco se detalla el vocabulario ni la dimensión de los embeddings.

Con respecto al entrenamiento, esta publicación **no entrena** el modelo: es una conversión de los pesos del modelo base `Helsinki-NLP/opus-mt-swc-es`. La innovación técnica del reempaquetado consiste en convertir el tokenizador SentencePiece del original a formato de tokenizador rápido de Hugging Face, con ficheros separados para el codificador y el decodificador, para permitir la ejecución con Candle (`marian_flutter`) en entornos de dispositivo. No se documentan innovaciones como decodificación especulativa, atención lineal ni cuantización agresiva.

## Capacidades

- Traducción de texto de swahili del Congo (`swc`) a español (`es`) en una única dirección; no soporta la dirección inversa.
- Generación de texto mediante pipeline `text2text-generation` y `translation` de la librería Transformers.
- Inferencia en dispositivo a través de Candle y del componente `marian_flutter`, con tokenizadores rápidos optimizados para ese motor.
- Compatibilidad con `endpoints_compatible`, lo que facilita su despliegue mediante endpoints compatibles con la API de Hugging Face.
- No dispone de soporte documentado de *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión, audio ni modo de razonamiento (*thinking mode*).
- Capacidad multilingüe limitada estrictamente al par de idiomas declarado; no es un modelo multilingüe general.

## Casos de uso

- Aplicación móvil de traducción offline: Malinali puede integrar este modelo para traducir swahili del Congo a español en el propio dispositivo, sin conexión a internet, gracias a su tamaño de 75,6 millones de parámetros y a su formato safetensors con tokenizadores rápidos para Candle.
- Atención al cliente en regiones de habla swahili: un servicio de soporte podría traducir automáticamente los mensajes entrantes en `swc` a español para que agentes hispanohablantes los gestionen, manteniendo la conversación en el idioma del usuario.
- Traducción de documentación humanitaria y de cooperación: organizaciones que trabajan en la República Democrática del Congo pueden traducir materiales de campo del swahili del Congo al español de forma local, evitando enviar datos sensibles a servicios externos.
- Subtitulado y transcripción de contenido audiovisual: integrado en un pipeline de ASR que genere texto en `swc`, el modelo produciría los subtítulos en español, ejecutándose en local si se despliega con Candle.
- Investigación lingüística sobre lenguas de bajos recursos: sirve como punto de partida para estudiar la calidad de la traducción `swc → es` y como base para *fine-tuning* hacia dominios específicos.
- Digitalización de archivos y correspondencia: traducción por lotes de documentos históricos o administrativos escritos en swahili del Congo a español, aprovechando que no requiere GPU dedicada.
- Prototipos y demos de traducción en el navegador o en dispositivos de gama baja: al caber en memoria reducida, permite demostraciones interactivas sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas como BLEU, METEOR, chrF, COMET ni evaluaciones tipo MMLU, HumanEval o GSM8K, que por otro lado no aplican a un modelo de traducción de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de 75,6 millones de parámetros): aproximadamente 300 MB en FP32, unos 150 MB en FP16 y alrededor de 75-80 MB en cuantización de 8 bits. Estas cifras son estimaciones derivadas del tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo puede ejecutarse en CPU con latencia aceptable. Una RTX 4090, una A100 o una H100 resultan sobredimensionadas para este modelo y solo tendrían sentido para servir muchas peticiones en paralelo.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso en GPU integradas y en dispositivos móviles, que es el objetivo declarado (inferencia *on-device*).
- Opciones de despliegue: Candle (`marian_flutter`), Transformers con pipeline de traducción, y endpoints compatibles con la API de Hugging Face. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni CTranslate2 en la información disponible.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 75,6 millones de parámetros, cabe esperar latencias de milisegundos por frase en GPU y de decenas a pocos cientos de milisegundos en CPU o móvil, pero no hay cifras confirmadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-swc-es | 75,6 M | no disponible | swc → es | no disponible (upstream tipicamente CC-BY 4.0) | Hugging Face, reempaquetado para Candle |
| Helsinki-NLP/opus-mt-swc-es | no disponible (modelo de origen) | no disponible | swc → es | CC-BY 4.0 (segun OPUS-MT) | Hugging Face |
| NLLB-200 (variantes) | desde 600 M hasta 54.000 M | 512 tokens | ~200 idiomas, incluido `swc` y `es` | CC-BY-NC 4.0 (uso no comercial en varias variantes) | Hugging Face |
| M2M-100 (418M) | 418 M | 512 tokens | 100 idiomas | MIT | Hugging Face |

La comparación con NLLB-200 y M2M-100 es orientativa: son modelos multilingües mucho mayores que cubren el par `swc → es`, pero con un coste computacional y de memoria muy superior. Frente a ellos, este modelo ofrece un tamaño mínimo y una orientación explícita a inferencia en dispositivo, a cambio de cubrir un único par de idiomas y de no disponer de métricas de calidad publicadas. No hay datos de rendimiento comparativo (BLEU/chrF) disponibles en la información proporcionada.

## Limitaciones y advertencias

- No se dispone de la licencia explícita del repositorio; el autor remite a la licencia del modelo de origen, que en OPUS-MT suele ser CC-BY 4.0, pero conviene verificar antes de un uso comercial.
- Al ser un reempaquetado de `Helsinki-NLP/opus-mt-swc-es`, hereda tanto sus capacidades como sus sesgos y limitaciones; el autor no ha realizado un entrenamiento ni una evaluación adicionales.
- Riesgo de alucinación y de traducciones inexactas, especialmente en dominios especializados, terminología técnica o expresiones idiomáticas propias del swahili del Congo.
- Modelo unidireccional: solo traduce de `swc` a `es`; no soporta la dirección inversa ni otros pares de idiomas.
- No hay información publicada sobre la longitud máxima de contexto, por lo que el comportamiento con entradas largas no está garantizado.
- Al ser un modelo NMT dedicado, no admite *tool calling*, agentes ni razonamiento multi-paso; usarlo para esas tareas daría resultados pobres.
- El repositorio registra 0 descargas y 0 *likes* en la información proporcionada, por lo que carece de validación por parte de la comunidad.
- No se han publicado métricas de calidad objetivas (BLEU, chrF, COMET), lo que dificulta estimar su fiabilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-swc-es
- Modelo base (Helsinki-NLP): https://huggingface.co/Helsinki-NLP/opus-mt-swc-es
- Proyecto OPUS-MT (GitHub): https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
