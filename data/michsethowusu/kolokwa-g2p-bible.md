# michsethowusu/kolokwa-g2p-bible

## Resumen

`kolokwa-g2p-bible` es un modelo de conversión grafema-a-fonema (G2P) especializado en inglés liberiano (Liberian English, código `en_lr`), desarrollado por el usuario de Hugging Face `michsethowusu`. No es un modelo de lenguaje generativo, sino un fonemizador que transforma texto ortográfico en su representación fonética en IPA, pensado para alimentar pipelines de síntesis de voz (TTS). Se distribuye como parte de la familia Kolokwa, que incluye una variante conversacional (`_jw`) y esta variante formal/escrituraria (`_bible`).

Técnicamente emplea la arquitectura DeepPhonemizer, un transformer "forward" no autorregresivo de 6 capas con dimensión oculta de 512, dimensión feed-forward de 1024 y 4 cabezas de atención. El modelo pesa aproximadamente 59 MB (repositorio de 0,1 GB) y alcanza velocidades de inferencia del orden de 98.000 palabras por segundo en GPU y 25.000 en CPU, lo que lo hace adecuado para procesar corpus completos en segundos.

Su relevancia radica en cubrir una variedad lingüística de bajos recursos (el inglés liberiano o kolokwa) para la que apenas existen recursos fonéticos públicos. Al entrenarse sobre 25.649 enunciados alineados con audio del corpus bíblico `liberian-english-speech-bible`, proporciona una base reproducible para construir voces TTS en esta variedad, algo que los fonemizadores genéricos de inglés estándar no resuelven con precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer forward no autorregresivo (DeepPhonemizer) |
| Parametros totales | no disponible (tamano de pesos ~59 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `best_model.pt`) |
| Idiomas soportados | en (inglés liberiano, `en_lr`), lir |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DeepPhonemizer implementada en la librería `arcosoph/phonemize`: un transformer "forward" no autorregresivo de 6 capas, `d_model` de 512, `d_fft` de 1024 y 4 cabezas de atención. La decodificación es no autorregresiva, lo que permite paralelizar la predicción de toda la secuencia fonética y explica su elevado throughput (unas 98.000 palabras/s en GPU). El modelo opera como un fonemizador secuencia-a-secuencia texto→IPA.

El entrenamiento se realizó estrictamente sobre el dataset `michsethowusu/liberian-english-speech-bible`, compuesto por 25.649 enunciados con alineación de voz. No se documentan en la información disponible el número total de tokens, la composición detallada del corpus ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos G2P). La variante `_bible` se orienta a registro formal y escriturario, en contraste con la variante `_jw` entrenada sobre habla conversacional y de radiodifusión.

## Capacidades

- Conversión grafema-a-fonema (G2P) de texto en inglés liberiano a representación IPA.
- Fonemización de registro formal y escriturario (textos bíblicos, prosa formal).
- Generación de transcripciones fonéticas con marcas de aspiración, nasalización y vibrantes propias de la variedad (`tʰ`, `ɜ˞`, `ɪ̃`).
- Integración directa en pipelines TTS mediante la librería `phonemize`.
- Inferencia de alta velocidad apta para procesamiento por lotes de corpus extensos.
- Soporte de las etiquetas de idioma `en` y `lir` (con código interno de fonemización `en_lr`).
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso: es un componente especializado, no un LLM.

## Casos de uso

- Síntesis de voz para lectura de textos religiosos: el modelo convierte pasajes bíblicos a IPA para alimentar un sintetizador TTS entrenado en inglés liberiano, preservando la pronunciación local en lugar de la del inglés estándar.
- Construcción de un sistema TTS completo para inglés liberiano: se usa como front-end fonético antes del modelo acústico y el vocoder, cubriendo el paso texto→fonemas con la variedad objetivo.
- Audiolibros y contenido accesible: fonemización por lotes de corpus escritos (a 98.000 palabras/s en GPU) para generar narraciones en kolokwa.
- Investigación lingüística y fonética: generación de transcripciones IPA sistemáticas de corpus para análisis de la variedad liberiana.
- Localización de asistentes de voz: adaptación de asistentes conversacionales a la pronunciación liberiana mediante la sustitución del fonemizador genérico por este modelo.
- Evaluación y anotación de datasets de voz: alineación texto-fonema para preparar corpus de entrenamiento TTS o para validar transcripciones existentes.
- Docencia y preservación lingüística: herramienta para documentar y enseñar la pronunciación del inglés liberiano con representación IPA estandarizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de velocidad de inferencia (~98.000 palabras/s en GPU y ~25.000 palabras/s en CPU) y ejemplos cualitativos de salida IPA, sin valores de precisión fonética (p. ej. PER o WER a nivel de fonema) ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; el checkpoint pesa ~59 MB, por lo que cabe holgadamente en cualquier GPU consumer (incluso con menos de 1 GB de VRAM disponible).
- GPU recomendadas: no requiere GPU dedicada; funciona en cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) para maximizar throughput.
- Cabe en GPU consumer: sí, en todas las gamas actuales e incluso en CPU.
- Opciones de despliegue: librería `phonemize` (PyTorch) con `Phonemizer.from_checkpoint`; descarga de pesos vía `huggingface_hub`. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo G2P de este tipo).
- Latencia y throughput: ~98.000 palabras/s en GPU y ~25.000 palabras/s en CPU según el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `michsethowusu/kolokwa-g2p-bible` | G2P (DeepPhonemizer) | Inglés liberiano formal | ~59 MB | MIT | Hugging Face |
| `michsethowusu/kolokwa-g2p-jw` | G2P (DeepPhonemizer) | Inglés liberiano conversacional | no disponible | no disponible | Hugging Face |
| Fonemizadores G2P genéricos de inglés (p. ej. eSpeak, g2p_en) | G2P basados en reglas/diccionario | Inglés estándar | variable | variable | Amplia |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en G2P: no genera texto libre, no razona y no responde a instrucciones.
- Entrenado solo sobre el corpus bíblico: su cobertura puede estar sesgada hacia vocabulario y registro escriturario, con posible degradación en jerga, nombres propios o dominios técnicos.
- El registro conversacional está cubierto por la variante `_jw`, no por este modelo; usar `_bible` para habla coloquial puede producir pronunciaciones poco naturales.
- Riesgo de errores de fonemización en palabras fuera del vocabulario del corpus de entrenamiento (out-of-vocabulary).
- No se documentan métricas de precisión fonética, por lo que la calidad debe validarse empíricamente antes de producción.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del dataset de origen (`liberian-english-speech-bible`) para usos derivados.
- Sin información sobre sesgos sociolingüísticos ni sobre el equilibrio de hablantes del corpus original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/michsethowusu/kolokwa-g2p-bible
- Variante conversacional: https://huggingface.co/michsethowusu/kolokwa-g2p-jw
- Dataset de entrenamiento: https://huggingface.co/datasets/michsethowusu/liberian-english-speech-bible
- Dataset de la variante conversacional: https://huggingface.co/datasets/michsethowusu/kolokwa-text-ipa-jw
- Librería de fonemización: https://github.com/arcosoph/phonemize
