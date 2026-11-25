# Phoonnx/parlertts-multi-indic-unicode

## Resumen

parlertts-multi-indic-unicode es un modelo de síntesis de voz (text-to-speech) basado en Indic Parler-TTS, desarrollado originalmente por AI4Bharat y empaquetado por Phoonnx en formato ONNX para su librería `phoonnx`. El modelo resuelve la generación de voz natural en 18 lenguas de la India (entre ellas hindi, bengalí, tamil, telugu, marathi, gujarati, kannada, malayalam, punjabi, oriya, asamés, nepalés, sánscrito y varias lenguas minoritarias como bodo, dogri, manipuri y haryanvi), además del inglés de la India.

La variante `unicode` se distingue por emplear los puntos de código Unicode del texto directamente como entrada del front-end, mediante el `UnicodeCodepointPhonemizer` de la librería `scriptconv`, en lugar de depender de un diccionario fonético específico por lengua. Esto simplifica la integración y amplía la cobertura a scripts menos representados.

El paquete incluye 32 voces preentrenadas identificadas por nombre y código de idioma (por ejemplo `indic_parler/aditi/bn` o `indic_parler/jaya/ta`), lo que lo hace directamente utilizable tanto en Python como en el ecosistema de asistentes OVOS. Su licencia Apache 2.0 y el tamaño del repositorio (5,2 GB) lo sitúan como una opción práctica para despliegues multilingües de TTS en entornos indios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Indic Parler-TTS (empaquetado ONNX para phoonnx) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | as, bn, brx, doi, en-IN, gu, hi, hne, kn, ml, mni, mr, ne, or, pa, sa, ta, te |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 5,2 GB |
| Voces incluidas | 32 voces con identificador nombre/idioma |
| Entrada de texto | Puntos de código Unicode (UnicodeCodepointPhonemizer via scriptconv) |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Indic Parler-TTS de AI4Bharat, un sistema TTS neuronal basado en transformer con decoder autorregresivo y condicionamiento por descripción de voz, adaptado al conjunto de lenguas indias. Phoonnx no reentrena el modelo: lo convierte a ONNX y lo integra con su librería de inferencia, manteniendo los pesos del upstream `ai4bharat/indic-parler-tts`.

El front-end de texto se apoya en `scriptconv`, que normaliza la entrada y la convierte mediante `UnicodeCodepointPhonemizer`. Esta elección evita dependencias de fonemizadores específicos por script y permite cubrir scripts minoritarios (bodo, dogri, manipuri, haryanvi) con el mismo pipeline. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la documentación proporcionada.

## Capacidades

- Síntesis de voz multilingüe en 18 lenguas de la India más inglés de la India.
- 32 voces preentrenadas con identidad de hablante y lengua asociada.
- Entrada directa por puntos de código Unicode, sin necesidad de transcripción fonética manual.
- Generación de audio WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Selección de voz por configuración (`indic_parler/aditi/bn`, etc.).
- Cobertura de scripts minoritarios (brx, doi, hne, mni) junto a lenguas mayoritarias.
- No se documentan capacidades de clonación de voz, control de emoción ni tool calling.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) seleccionando la voz por configuración, lo que permite desplegar un asistente que responde en hindi, tamil o bengalí sin infraestructura adicional.
- Atención al cliente automatizada multilingüe: con 18 lenguas cubiertas, un mismo backend puede atender consultas en marathi, telugu o gujarati seleccionando la voz correspondiente por código de idioma.
- Lectura de contenido para accesibilidad: conversión de artículos, notificaciones o documentos a audio en lenguas indias minoritarias (bodo, dogri, manipuri) que carecen de cobertura en otros sistemas TTS comerciales.
- Localización de interfaces y audiolibros: generación de locuciones en inglés de la India (`indic_parler/mary/en`, `indic_parler/thoma/en`) junto a voces nativas para mercados regionales.
- Sistemas de información pública: anuncios y avisos en sánscrito, nepalés u oriya mediante las voces dedicadas (`aryan/sa`, `amrita/ne`, `debjani/or`).
- Investigación en TTS multilingüe: al estar en ONNX y Apache 2.0, sirve como base reproducible para comparar fonemización Unicode frente a fonemización específica por script.
- Prototipado rápido en Python: la API `TTSModelManager` permite cargar voces y sintetizar audio en pocas líneas, adecuada para demos y validación de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 5,2 GB, lo que da una cota superior del peso en disco de los pesos ONNX, pero no se especifica el consumo en memoria por voz cargada.
- GPU recomendadas: no disponible en la documentación.
- Compatibilidad con GPU de consumo: no confirmada; al ejecutarse vía ONNX Runtime, puede correr en CPU y potencialmente en GPU, pero no se documentan requisitos mínimos.
- Opciones de despliegue: librería `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime como backend implícito.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| parlertts-multi-indic-unicode (este) | 18 lenguas indias + en-IN | ONNX (phoonnx) | Apache 2.0 | Hugging Face, 1439 descargas |
| ai4bharat/indic-parler-tts (upstream) | Lenguas indias (conjunto equivalente) | PyTorch (safetensors) | Apache 2.0 | Hugging Face |
| Otros TTS indios multilingües | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de terceros no está disponible en la información proporcionada; el referente inmediato es el modelo upstream de AI4Bharat, del que este paquete deriva y al que añade empaquetado ONNX y voces con identificador.

## Limitaciones y advertencias

- No se documentan sesgos específicos de género, acento o registro; al derivar de un corpus indio, puede reflejar desequilibrios presentes en los datos de entrenamiento de AI4Bharat.
- Riesgo de alucinación acotado al ámbito TTS: pueden aparecer artefactos de pronunciación o entonación en textos fuera de dominio o con mezcla de scripts.
- La entrada por puntos de código Unicode puede degradar la naturalidad en palabras con grafías ambiguas o sin normalización previa adecuada.
- Cobertura limitada al conjunto de 18 lenguas; textos en otras lenguas indias o en inglés no indio pueden producir salidas deficientes.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del upstream `ai4bharat/indic-parler-tts` antes de producción.
- El paquete requiere `pip install --pre phoonnx`, es decir, una versión preliminar de la librería, con posible inestabilidad de API.
- No se especifican requisitos de memoria ni rendimiento, lo que dificulta planificar el dimensionamiento en producción.
- El repositorio no registra likes y tiene un volumen de descargas moderado (1439), lo que implica menor validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/parlertts-multi-indic-unicode
- Modelo upstream: https://huggingface.co/ai4bharat/indic-parler-tts
- Colección Indic Parler-TTS empaquetada: https://huggingface.co/collections/Phoonnx/indic-parler-tts-6af8ecb7ae33ca097cf30623
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
