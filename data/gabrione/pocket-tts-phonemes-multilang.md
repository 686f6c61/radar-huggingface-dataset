# gabrione/pocket-tts-phonemes-multilang

## Resumen

Pocket TTS phonemes multilang es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario gabrione como un ajuste fino (fine-tuning) del modelo base `kyutai/pocket-tts` de Kyutai. Su particularidad es que no recibe texto ortográfico sino transcripciones fonéticas en IPA (Alfabeto Fonético Internacional) con marcas de acentuación, lo que permite que un único conjunto de pesos sirva para 14 idiomas sin necesidad de intercambiar modelos por lengua. La arquitectura subyacente es la de Pocket TTS: un FlowLM de 24 capas combinado con el códec neuronal Mimi, que opera a 24 kHz y permite clonación de voz a partir de unos pocos segundos de audio de referencia.

El modelo resuelve el problema de la multiplicidad de pesos en TTS multilingüe: al estandarizar la entrada a fonemas IPA generados por espeak-ng, elimina la dependencia de la ortografía de cada idioma y unifica el espacio de entrada. Está pensado para integrarse como motor de voz en el proyecto mynah-s2s (modo `--talker-mode phonemes-eu`), y su receta de entrenamiento, front-end G2P y herramientas de evaluación están publicadas en el repositorio de dicho proyecto.

Con 336 millones de parámetros y un repositorio de 1,3 GB, es un modelo compacto orientado a inferencia eficiente. La relevancia actual reside en su enfoque fonético multilingüe con licencia permisiva (CC-BY-4.0) y en que cubre 14 idiomas, incluidos varios de bajos recursos como estonio, checo o hindi, con un solo artefacto de pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FlowLM de 24 capas + códec Mimi (Pocket TTS) |
| Parámetros totales | 336.068.290 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clip de entrenamiento ~30 s de audio) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | it, es, fr, de, en, nl, pt, pl, cs, ru, tr, et, hi, ko |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (`flow_lm.*`, `mimi.*`), más `model.yaml`, `tokenizer.json` y `manifest.json` |
| Frecuencia de muestreo | 24 kHz |
| Tokenizer | SentencePiece IPA, 4000 piezas, con byte fallback |
| Modelo base | kyutai/pocket-tts |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Pocket TTS de Kyutai: un FlowLM de 24 capas que genera representaciones latentes de audio y un decodificador Mimi que las convierte en forma de onda a 24 kHz. La innovación de este ajuste fino es el cambio de espacio de entrada: en lugar de texto, el modelo consume palabras en IPA separadas por espacios, con marcas de acentuación (`ˈ`, `ˌ`) y africadas con ligaduras (`t͡ʃ`, `d͡ʒ`, `t͡s`, `d͡z`), tal como las produce espeak-ng. Esto permite compartir un único vocabulario y unos únicos pesos entre los 14 idiomas.

El entrenamiento partió del checkpoint inglés de `kyutai/pocket-tts` y se realizó en varias fases: primero los ocho idiomas de MLS (it, es, fr, de, en, nl, pt, pl), después seis idiomas adicionales (cs, ru, tr, et, hi, ko) y finalmente dos etapas con acentuación en la entrada. En total, 15.000 pasos con batch de 32, precisión bf16 y pérdida de flujo LSD. Los datos provienen de MLS, FLEURS (train, los 14 idiomas) y Common Voice 17 (cs, ru, tr, et), con marcas de tiempo de palabra obtenidas por alineamiento forzado con Omni ASR CTC y un máximo de 15 minutos por hablante. El entrenador utilizado es el código oficial de Kyutai (MIT), distribuido en AfriSpeech/africa-tts (MIT).

## Capacidades

- Síntesis de voz a partir de fonemas IPA con marcas de acentuación, no de texto ortográfico.
- Multilingüe en un solo modelo: 14 idiomas sin intercambio de pesos.
- Clonación de voz a partir de unos pocos segundos de audio de referencia.
- Generación a 24 kHz mediante el códec Mimi.
- Soporte de acentuación léxica (word stress) en la entrada, lo que mejora la pronunciación de pares mínimos.
- Integración como motor de voz en pipelines de voz conversacional (modo `phonemes-eu` de mynah-s2s).
- No incluye normalización de números: el texto debe convertirse a palabras antes del G2P.
- No incluye puntuación en la entrada, por lo que no modela entonación interrogativa.

## Casos de uso

- **Locución multilingüe con un solo despliegue**: al compartir pesos entre 14 idiomas, un servicio que atienda a usuarios en italiano, español, francés o hindi puede usar una única instancia del modelo en lugar de un modelo por lengua, simplificando el mantenimiento y el consumo de memoria.
- **Clonación de voz para audiolibros o contenido editorial**: con unos segundos de audio de referencia se puede generar narración con la voz del autor o del locutor, siempre con consentimiento del hablante, como exige la model card.
- **Integración en asistentes de voz conversacionales**: el modelo está diseñado como "talker" de mynah-s2s, de modo que encaja en pipelines de speech-to-speech donde la salida de un ASR se convierte a IPA y se sintetiza con control fonético.
- **Síntesis controlada por pronunciación**: en aplicaciones donde la pronunciación exacta importa (nombres propios, terminología técnica, lectura de pares mínimos), la entrada IPA permite especificar la fonética de forma explícita en lugar de confiar en reglas ortográficas.
- **Prototipado de voces para idiomas de bajos recursos**: cubre estonio, checo, turco o hindi con un modelo de 336 M de parámetros, lo que facilita experimentar con lenguas para las que escasean modelos TTS abiertos.
- **Generación de audio para evaluación de ASR**: al permitir sintetizar las mismas frases con voz fija o clonada, sirve para construir conjuntos de prueba controlados y medir la robustez de sistemas de reconocimiento de voz.
- **Investigación en TTS fonético**: la receta, el front-end G2P y las herramientas de evaluación están publicadas en `labs/phoneme_tts/` de mynah-s2s, lo que facilita reproducir y extender el enfoque.

## Benchmarks y rendimiento

La model card reporta una evaluación con 30 frases de test de FLEURS por idioma, transcritas con Omni ASR CTC 3B v2. La métrica es la diferencia (gap) entre el WER del audio sintético y el de las grabaciones reales de las mismas frases; un valor menor indica mejor calidad. Se evalúan dos condiciones: voz fija (una referencia por idioma) y voz clonada (5 s de otro hablante del conjunto de test).

| Idioma | WER grabaciones reales | Gap voz fija | Gap voz clonada |
|---|---|---|---|
| it | 0,029 | 0,035 | 0,037 |
| es | 0,031 | 0,020 | 0,044 |
| fr | 0,107 | 0,002 | 0,051 |
| de | 0,051 | 0,033 | 0,041 |
| en | 0,090 | 0,008 | 0,193 |
| nl | 0,081 | 0,056 | 0,136 |
| pt | 0,052 | 0,078 | 0,079 |
| pl | 0,092 | 0,036 | 0,126 |
| cs | 0,085 | −0,002 | 0,092 |
| ru | 0,098 | 0,039 | 0,075 |
| tr | 0,129 | 0,060 | 0,097 |
| et | 0,125 | 0,058 | 0,200 |
| hi | 0,173 | 0,058 | 0,016 |
| ko | 0,209 | 0,199 | 0,137 |

No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 336 M de parámetros en bf16, los pesos ocupan aproximadamente 0,7 GB, a lo que hay que sumar el estado del decodificador Mimi y los buffers de audio.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo es apto para GPU de consumo.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 336 M de parámetros, aunque no se especifican modelos concretos.
- Opciones de despliegue: la librería `pocket-tts` (indicada en los metadatos de Hugging Face); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Dependencias externas: espeak-ng 1.51 y phonemizer 3.6.0 (GPL-3.0), que no se incluyen y deben instalarse aparte.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / clip | Licencia | Enfoque |
|---|---|---|---|---|---|
| gabrione/pocket-tts-phonemes-multilang | 336 M | 14 | clips ~30 s | CC-BY-4.0 | TTS fonético IPA multilingüe |
| kyutai/pocket-tts (base) | no disponible | inglés | clips ~30 s | CC-BY-4.0 | TTS con clonación de voz |
| Otros modelos TTS multilingües | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con el modelo base, del que este es un ajuste fino. No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El coreano presenta la mayor brecha de calidad (gap de 0,199 con voz fija); el estonio, el inglés y el neerlandés pierden más con voces clonadas (0,200, 0,193 y 0,136 respectivamente).
- La entrada no admite puntuación, por lo que no se modela la entonación interrogativa ni pausas marcadas por signos.
- La acentuación depende del diccionario y las reglas de espeak-ng: donde espeak-ng falla, el modelo también.
- No incluye normalización de números; el texto debe convertirse a palabras antes del G2P.
- Los textos largos deben sintetizarse frase a frase; los textos muy superiores a los ~30 s de los clips de entrenamiento degradan la calidad.
- No se distribuye ninguna voz de referencia: el usuario debe aportar su propio audio con consentimiento del hablante.
- espeak-ng y phonemizer son GPL-3.0 y no se incluyen; su instalación es responsabilidad del usuario.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución a gabrione y a Kyutai como modelo base; deben respetarse también las licencias de los datos de entrenamiento (MLS y FLEURS CC-BY-4.0, Common Voice 17 CC0-1.0) y del tokenizer (MIT, AfriSpeech/Ghana NLP).
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- [Hugging Face: gabrione/pocket-tts-phonemes-multilang](https://huggingface.co/gabrione/pocket-tts-phonemes-multilang)
- [Modelo base: kyutai/pocket-tts](https://huggingface.co/kyutai/pocket-tts)
- [Repositorio mynah-s2s](https://github.com/mynah-org/mynah-s2s)
- [AfriSpeech/africa-tts (tokenizer y trainer, MIT)](https://github.com/AfriSpeech/africa-tts)
- [Dataset MLS](https://www.openslr.org/94/)
- [Dataset FLEURS](https://huggingface.co/datasets/google/fleurs)
