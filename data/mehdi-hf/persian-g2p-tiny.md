# mehdi-hf/persian-g2p-tiny

## Resumen

`persian-g2p-tiny` es un modelo especializado en conversión grafema-fonema (G2P) para persa (farsi), desarrollado por el usuario `mehdi-hf`. Con solo 8,26 millones de parámetros (unos 16 MB), resuelve un problema muy concreto dentro de los pipelines de síntesis de voz (TTS): transformar texto persa escrito en su representación fonémica, incluyendo la restauración explícita del *ezafe* (`-e` / `-ye`), la desambiguación de homógrafos y el soporte determinista de la kasra (`ـِ`) como marca de ezafe.

El modelo se presenta como una alternativa ligera y sin dependencias GPL al modelo base `mehdi-hf/Homo-GE2PE-Persian-HF`, del que es un fine-tune. Frente a este, elimina el post-procesado manual de la notación, no filtra banderas internas de ezafe y se entrenó sobre una versión estrictamente libre de fugas (leak-free) del dataset `MahtaFetrat/HomoRich-G2P-Persian`. Es relevante porque demuestra que un modelo de 8M de parámetros puede igualar o superar a alternativas mayores en tareas G2P muy estructuradas, con licencia MIT y despliegue directo vía `transformers`.

La arquitectura es ByT5 (variante byte-level de T5) con 2+2 capas, lo que le permite manejar diacríticos persas sin romper la tokenización. Existe un modelo hermano de mayor tamaño, `persian-g2p-0.6b` (596M parámetros, Apache-2.0), para quienes necesitan mayor precisión en homógrafos y ezafe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5 (T5 byte-level, encoder-decoder, 2+2 capas) |
| Parametros totales | 8.264.064 (8,26M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada (truncation); 384 tokens nuevos de salida |
| Tipos de cuantizacion | no disponible (pesos safetensors en bf16; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | persa (farsi, `fa`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `mehdi-hf/Homo-GE2PE-Persian-HF`, que a su vez es un ByT5 de 2 capas de encoder y 2 de decoder. Al operar a nivel de byte, evita los problemas de segmentación subword con diacríticos persas (`ـَ` fatha, `ـِ` kasra, `ـُ` damma) y permite un control determinista de la kasra como marca de ezafe. La generación se realiza con `T5ForConditionalGeneration` y decodificación por beams (por defecto 4).

El entrenamiento se hizo sobre una versión limpiada y deduplicada de `MahtaFetrat/HomoRich-G2P-Persian` (CC0-1.0): 423.769 ejemplos base más 41.742 aumentados con kasra, totalizando 465.511 ejemplos de entrenamiento y 4.000 de validación. Se eliminaron 91.040 duplicados y las 403 filas solapadas con `SentenceBench`, garantizando 0 % de fuga en test. El ajuste se realizó en 1× NVIDIA A100-40GB en bf16 durante 3 épocas (10.908 pasos), seguido de un fine-tune de continuación de 2 épocas sobre 256k ejemplos balanceados con diacríticos. La innovación principal es la salida directa en notación estándar Repr. 1, sin mapeos posteriores ni banderas internas filtradas.

## Capacidades

- Conversión grafema-fonema (G2P) de texto persa a notación fonémica Repr. 1, convertible trivialmente a IPA.
- Restauración explícita del ezafe con marcadores `-e` y `-ye` (por ejemplo, `ketAb-e jadid-e man`).
- Desambiguación de homógrafos en persa (por ejemplo, `گُل` vs `گِل`, `مَرد` vs `مُرد`, `قَدر` vs `قَدَر`).
- Soporte determinista de kasra (`ـِ`) como marca de ezafe: escribir la kasra fuerza el ezafe en la salida (10/10 en la suite de prueba).
- Manejo completo de diacríticos persas (`ـَ`, `ـِ`, `ـُ`) sin rotura de tokenización, gracias a la naturaleza byte-level.
- Procesamiento por lotes (batch) de frases con padding y truncation.
- Generación con beams configurable (`num_beams`).
- No soporta tool calling, agentes, visión, audio ni modo thinking; es un modelo puramente text2text especializado.

## Casos de uso

- **Síntesis de voz (TTS) en persa:** el modelo se sitúa como front-end fonémico de un pipeline TTS; convierte el texto de entrada en fonemas Repr. 1 que el sintetizador consume directamente, con ezafe restaurado para una prosodia correcta.
- **Desambiguación de homógrafos en lectura automática:** en sistemas de lectura de noticias o audiolibros, el modelo resuelve palabras como `مَرد`/`مُرد` o `قَدر`/`قَدَر` según el contexto de la frase, evitando errores de pronunciación.
- **Normalización fonémica para motores de búsqueda por voz:** integrado en un pipeline de ASR/TTS, permite indexar y comparar pronunciaciones canónicas de términos persas.
- **Preprocesado de corpus lingüísticos:** investigadores pueden generar transcripciones fonémicas de corpus persas a gran escala con un modelo de 16 MB y throughput de ~49 frases/s en A100.
- **Enseñanza de pronunciación del persa:** aplicaciones educativas que muestran la pronunciación correcta (incluido ezafe y diacríticos) de frases introducidas por el usuario.
- **Validación de pipelines TTS en CI/CD:** por su tamaño mínimo y licencia MIT, se puede empaquetar en tests automáticos que verifiquen la calidad fonémica de un sistema TTS sin coste de GPU dedicada.
- **Prototipado rápido en CPU:** al ser un modelo de 8M de parámetros, es viable ejecutarlo en CPU o en GPUs de consumo para demos y pruebas de concepto.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre `SentenceBench` (400 filas):

| Modelo | Params | Licencia | Leak-free | PER válido ↓ (4k) | SB PER ↓ | SB PER (glotal) ↓ | SB WER ↓ | Homógrafo oficial ↑ (212) | Homógrafo ambiguo ↑ (359) | Ezafe F1 ↑ (P / R) | Kasra override | Velocidad (A100) |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Baseline (`Homo-GE2PE`) | 8,26M | MIT | No (403 fugas) | — | 3,21 % | 3,39 % | 16,04 % | 70,28 % | 77,44 % | 86,76 % (84,2 / 89,5) | 10/10 | 43,7 s/s |
| **`persian-g2p-tiny`** | **8,26M** | **MIT** | **Sí (0 fugas)** | **1,81 %** | **3,21 %** | **3,35 %** | **15,46 %** | **69,34 %** | **77,16 %** | **86,16 % (80,5 / 92,7)** | **10/10** | **49,2 s/s** |
| `persian-g2p-0.6b` | 596M | Apache-2.0 | Sí (0 fugas) | 1,58 % | 3,18 % | 3,35 % | 14,79 % | 72,17 % | 80,50 % | 88,89 % (83,1 / 95,5) | 10/10 | 26,5 s/s |

Suite completa de diacríticos (`ـَ / ـِ / ـُ`, 22 ítems): 18/22 (81,82 %). Kasra final de palabra como ezafe: 10/10 (100 %).

## Requisitos de hardware

- **VRAM estimada:** inferior a 1 GB en bf16 (16 MB de pesos más activaciones y buffers de generación); en la práctica cabe en cualquier GPU con al menos ~1 GB libre.
- **GPU recomendadas:** NVIDIA A100-40GB (referencia de los benchmarks, ~49 frases/s); funciona igualmente en H100, RTX 4090, RTX 3090 y GPUs de gama media.
- **GPU de consumo:** sí, cabe holgadamente en cualquier GPU consumer moderna e incluso en CPU para lotes pequeños.
- **Opciones de despliegue:** `transformers` (T5ForConditionalGeneration), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; al ser safetensors estándar puede servirse con TGI o con un wrapper propio de FastAPI.
- **Latencia y throughput:** ~49,2 frases/s en A100 con `num_beams=4` según la model card; el modelo hermano de 596M rinde ~26,5 frases/s en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Params | Contexto | PER (SB) ↓ | Ezafe F1 ↑ | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| `persian-g2p-tiny` | 8,26M | 512 | 3,21 % | 86,16 % | MIT | Hugging Face |
| `Homo-GE2PE-Persian-HF` (base) | 8,26M | no disponible | 3,21 % | 86,76 % | MIT | Hugging Face |
| `persian-g2p-0.6b` | 596M | no disponible | 3,18 % | 88,89 % | Apache-2.0 | Hugging Face |

El modelo tiny iguala en PER al baseline del que deriva, con la ventaja de estar libre de fugas y de ofrecer salida Repr. 1 directa. El modelo de 0,6B mejora ligeramente en homógrafos y ezafe a costa de un tamaño 72 veces mayor y menor throughput.

## Limitaciones y advertencias

- Especializado exclusivamente en persa (`fa`); no soporta otros idiomas.
- No es un modelo generativo general: no responde preguntas, no razona ni ejecuta tool calling.
- La longitud de entrada está limitada a 512 tokens y la salida a 384 tokens nuevos; frases muy largas se truncan.
- Aunque la licencia es MIT, el rendimiento en dominios muy alejados del dataset de entrenamiento (texto coloquial, dialectos, transliteraciones) no está validado.
- La precisión en diacríticos completos es del 81,82 % en la suite de 22 ítems, por debajo del 100 % en kasra; puede fallar en casos ambiguos no cubiertos.
- Riesgo de alucinación fonémica en palabras fuera de vocabulario o nombres propios poco frecuentes.
- El modelo base del que deriva tenía fugas de test; esta versión las corrige, pero conviene validar en datos propios antes de producción.
- No se han publicado análisis de sesgos lingüísticos ni de robustez frente a errores tipográficos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mehdi-hf/persian-g2p-tiny
- Modelo base: https://huggingface.co/mehdi-hf/Homo-GE2PE-Persian-HF
- Modelo hermano de 0,6B: https://huggingface.co/mehdi-hf/persian-g2p-0.6b
- Dataset: https://huggingface.co/datasets/MahtaFetrat/HomoRich-G2P-Persian
- Paper de referencia (arXiv): https://arxiv.org/abs/2505.12973
