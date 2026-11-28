# mehdi-hf/persian-g2p-tiny

## Resumen

`persian-g2p-tiny` es un modelo especializado en conversión de grafemas a fonemas (G2P) para persa (farsi), desarrollado por el usuario de Hugging Face `mehdi-hf`. Con tan solo 8.264.064 parámetros (unos 16 MB de pesos), resuelve un problema muy concreto en pipelines de síntesis de voz: la transcripción fonética determinista de texto persa, incluyendo la restauración explícita del ezafe (`-e` / `-ye`) y la desambiguación de homógrafos.

El modelo es un fine-tune de `mehdi-hf/Homo-GE2PE-Persian-HF`, una arquitectura ByT5 de 2+2 capas (encoder/decoder), entrenado sobre una versión estrictamente libre de fugas y deduplicada del dataset `MahtaFetrat/HomoRich-G2P-Persian` (CC0-1.0), con aumento de datos basado en kasra. Se distribuye bajo licencia MIT y está pensado para integrarse directamente en sistemas TTS en producción.

Su relevancia actual radica en que ofrece una alternativa ligera y determinista a los grandes modelos multilingües para una tarea lingüística muy específica del persa, con soporte nativo de diacríticos (`ـَ`, `ـِ`, `ـُ`) y una salida en notación fonética estándar (Repr. 1) convertible trivialmente a IPA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5 (encoder-decoder transformer byte-level), 2+2 capas |
| Parametros totales | 8.264.064 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada truncada a 512 tokens en el ejemplo de uso; salida `max_new_tokens=384`) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 según repo; no se documentan GGUF ni otras) |
| Idiomas soportados | persa (farsi, `fa`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es un ByT5 de 2 capas de encoder y 2 de decoder, lo que lo convierte en un modelo byte-level: procesa el texto de entrada como bytes UTF-8 en lugar de subwords, lo que evita la rotura de tokens en diacríticos persas y permite manejar cualquier carácter sin vocabulario subword. Se obtiene por fine-tune del modelo base `mehdi-hf/Homo-GE2PE-Persian-HF`.

El entrenamiento se realizó sobre una versión estrictamente libre de fugas y deduplicada del dataset `MahtaFetrat/HomoRich-G2P-Persian` (CC0-1.0), eliminando 403 filas solapadas de `SentenceBench` y 91.040 duplicados antes del entrenamiento (0 % de solapamiento con test). Se aplicó aumento de datos con kasra y un fine-tune de continuación de 2 épocas sobre 256.000 ejemplos balanceados (texto plano, kasra y vocales internas diacritizadas). No se documenta uso de RLHF ni DPO.

La innovación principal es la salida directa en notación estándar Repr. 1, sin post-mapeos personalizados, con marcadores explícitos de ezafe (`-e` / `-ye`) y soporte determinista de override mediante kasra explícita (`کتابِ من` fuerza ezafe). No depende de Parsivar ni de librerías GPL.

## Capacidades

- Conversión grafema-fonema (G2P) de texto persa a notación fonética Repr. 1.
- Restauración explícita del ezafe (`-e` / `-ye`) en sintagmas nominales y adjetivales.
- Desambiguación de homógrafos en persa (palabras con misma grafía y distinta pronunciación).
- Override determinista mediante kasra (`ـِ`) explícita: 10/10 en la suite documentada.
- Soporte completo de diacríticos persas (`ـَ` fatha, `ـِ` kasra, `ـُ` damma): 19/22 en la suite documentada.
- Manejo correcto del fonema `ژ` (`/ʒ/` → `Z`) en posición inicial, medial y final: 27/27.
- Procesamiento byte-level que evita la rotura de tokens en diacríticos.
- Conversión trivial de la salida Repr. 1 a IPA mediante tabla de mapeo.
- Generación por lotes (`batch`) con `num_beams` configurable.

## Casos de uso

- Síntesis de voz (TTS) en producción: el modelo genera la transcripción fonética que alimenta el front-end de un sistema TTS persa, con ezafe restaurado y homógrafos resueltos, lo que mejora la naturalidad de la prosodia.
- Normalización lingüística en pipelines de subtitulado o doblaje: convierte guiones persas a fonemas para alineación forzada o para verificación de pronunciación.
- Diccionarios de pronunciación automáticos: genera entradas fonéticas para léxicos de TTS o correctores ortográficos a partir de corpus de texto.
- Sistemas de lectura asistida y accesibilidad: produce la pronunciación de texto persa para lectores de pantalla o aplicaciones de aprendizaje de lengua.
- Investigación lingüística computacional: permite estudiar la distribución de ezafe y homógrafos en corpus persas a gran escala con salida fonética estandarizada.
- Preprocesado para modelos de reconocimiento de voz (ASR): genera transcripciones fonéticas de referencia para evaluación o para entrenamiento de modelos acústicos.
- Integración en herramientas de edición y corrección: detección de ambigüedades de pronunciación y sugerencia de diacríticos en textos persas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre `SentenceBench` (400 filas):

| Modelo | Params | Licencia | Sin fugas | PER válido ↓ (4k) | SB PER ↓ | SB PER (glotal) ↓ | SB WER ↓ | Homógrafo oficial ↑ (212) | Homógrafo ambiguo ↑ (359) | Ezafe F1 ↑ (P / R) | Override kasra | Velocidad (A100) |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Baseline (`Homo-GE2PE`) | 8,26 M | MIT | No (403 fugas) | — | 3,21 % | 3,39 % | 16,04 % | 70,28 % | 77,44 % | 86,76 % (84,2 / 89,5) | 10/10 | 43,7 s/s |
| **`persian-g2p-tiny`** | **8,26 M** | **MIT** | **Sí (0 fugas)** | 1,81 % | 3,23 % | 3,35 % | 15,37 % | 69,34 % | 77,16 % | **87,10 %** | **10/10** | **49,2 s/s** |
| `persian-g2p-0.6b` | 596 M | Apache-2.0 | Sí (0 fugas) | 1,58 % | 3,18 % | 3,35 % | 14,79 % | 72,17 % | 80,50 % | 88,89 % (83,1 / 95,5) | 10/10 | 26,5 s/s |

Suites adicionales documentadas:
- Override de kasra final de palabra: 10/10 (100 %).
- Suite completa de diacríticos `ـَ / ـِ / ـُ` (22 ítems): 19/22 (86,36 %).
- Suite de `ژ` (27 palabras): 27/27 (100 %).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (8,26 M de parámetros); en la práctica cabe en cualquier GPU consumer, CPU e incluso en entornos embebidos.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, cualquier modelo desde una GTX 1650 en adelante es suficiente. Los benchmarks se reportaron en A100 (49,2 s/s en `SentenceBench`).
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en hardware de gama baja.
- Opciones de despliegue: `transformers` (`T5ForConditionalGeneration`), `text-generation-inference` (etiqueta del repo), endpoints compatibles. No se documentan GGUF, llama.cpp ni Ollama.
- Latencia y throughput: 49,2 s/s en A100 según la model card; en CPU la latencia será mayor pero sigue siendo viable por el tamaño reducido.

## Comparativa con modelos similares

| Modelo | Params | Contexto | PER SB ↓ | Ezafe F1 ↑ | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| `persian-g2p-tiny` | 8,26 M | no disponible | 3,23 % | 87,10 % | MIT | Hugging Face |
| `Homo-GE2PE-Persian-HF` (baseline) | 8,26 M | no disponible | 3,21 % | 86,76 % | MIT | Hugging Face |
| `persian-g2p-0.6b` | 596 M | no disponible | 3,18 % | 88,89 % | Apache-2.0 | Hugging Face |

El modelo `persian-g2p-tiny` iguala o supera al baseline en WER, Ezafe F1 y velocidad, con la ventaja de estar libre de fugas de datos. Frente al modelo flagship `persian-g2p-0.6b`, pierde ligeramente en precisión de homógrafos y Ezafe, pero es unas 73 veces más pequeño y más rápido en inferencia.

## Limitaciones y advertencias

- Solo soporta persa (`fa`); no es multilingüe.
- La precisión en homógrafos ambiguos (77,16 %) y en la suite completa de diacríticos (86,36 %) deja margen de error; para aplicaciones críticas se recomienda el modelo `persian-g2p-0.6b`.
- Riesgo de errores en palabras poco frecuentes o en texto con ortografía no estándar, aunque el enfoque byte-level mitiga parte del problema.
- No se documentan sesgos específicos ni evaluación de sesgos; al ser un modelo entrenado sobre un dataset concreto, puede heredar sesgos de ese corpus.
- La longitud de contexto no está documentada; el ejemplo de uso trunca la entrada a 512 tokens y limita la salida a 384 tokens, lo que puede afectar a frases muy largas.
- Licencia MIT: permite uso comercial sin restricciones significativas, pero se recomienda revisar la licencia del dataset de origen (CC0-1.0) y del modelo base.
- No se documentan cuantizaciones GGUF ni soporte para llama.cpp/Ollama; el despliegue está orientado a `transformers` y TGI.
- La salida está en notación Repr. 1, no en IPA directamente; requiere conversión con la tabla proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mehdi-hf/persian-g2p-tiny
- Modelo base: https://huggingface.co/mehdi-hf/Homo-GE2PE-Persian-HF
- Modelo flagship: https://huggingface.co/mehdi-hf/persian-g2p-0.6b
- Dataset: https://huggingface.co/datasets/MahtaFetrat/HomoRich-G2P-Persian
- Paper (arXiv:2505.12973): https://arxiv.org/abs/2505.12973
