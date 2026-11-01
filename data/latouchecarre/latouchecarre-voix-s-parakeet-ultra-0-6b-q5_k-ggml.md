# LaToucheCarre/LaToucheCarre-Voix-S-Parakeet-Ultra-0.6B-Q5_K-GGML

## Resumen

Parakeet Ultra 0.6B Q5_K es una cuantización en formato GGML del modelo de reconocimiento automático del habla (ASR) Parakeet Ultra 0.6B, publicado por el desarrollador LaToucheCarre como parte del producto de dictado La Touche Carré para Windows. El modelo base es moondream/parakeet-ultra, un post-entrenamiento del nvidia/parakeet-tdt-0.6b-v3 de NVIDIA, ambos bajo licencia CC-BY-4.0. Este repositorio concreto no entrena nada nuevo: convierte los pesos originales a ggml y los cuantiza a Q5_K para su uso con `parakeet-cli` de whisper.cpp.

La relevancia práctica del modelo está en su eficiencia: con 491,7 MB de pesos ocupa 543 MB de RAM y 903 MB de VRAM en la configuración medida, y transcribe 188 segundos de audio en 3,6-4,4 segundos sobre una RTX 5090 con backend Vulkan. Su arquitectura es TDT (Token-and-Duration Transducer), la misma familia que Parakeet TDT 0.6B v3, con vocabulario y cabecera ggml idénticos a los del repositorio oficial ggml-org/parakeet-GGUF.

El modelo está orientado a dictado local en francés e inglés, sin salida de texto fuera de la máquina. Es un modelo pequeño y especializado, sin capacidades de generación libre, razonamiento ni tool calling: su única tarea es la transcripción de voz a texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), encoder-decoder con predictor LSTM |
| Parametros totales | 0,6B (aproximado, segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por segmentos de audio, no de texto) |
| Tipos de cuantizacion | Q5_K (este repositorio); el autor publica tambien Q2_K, Q3_K, Q4_K, Q6_K, Q8_0 y F16 en otros palieres |
| Idiomas soportados | fr, en, multilingual |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGML (fichero `ggml-parakeet-ultra-0.6b-q5_k.bin`, 491.715.559 bytes) |

## Arquitectura y entrenamiento

El modelo es un transducer TDT, la arquitectura de ASR de NVIDIA que combina un encoder acústico con un predictor y una cabeza conjunta que emite simultáneamente tokens y duraciones. Esta ficha no entrena el modelo: parte de los pesos de moondream/parakeet-ultra (revisión `73175eb7ae`), a su vez post-entrenamiento de nvidia/parakeet-tdt-0.6b-v3. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO en el modelo base.

La innovación técnica de este repositorio está en el proceso de conversión, no en el entrenamiento. El autor convirtió los pesos a ggml f32 usando como plantilla el ggml f32 oficial de Parakeet TDT 0.6B v3 de ggml-org/parakeet-GGUF, copiando la cabecera tal cual (hiperparámetros, banco de filtros mel, ventana, duraciones TDT y vocabulario) y sustituyendo cada tensor por su homólogo de `model.safetensors`, con renombrado de nomenclatura transformers a NeMo, repliegue de los sesgos LSTM ih en hh y reordenación de puertas de [i,f,g,o] a [i,f,o,g]. El control de calidad reportado es una similitud coseno mínima de 0,954 con el tensor v3 original en todos los tensores. La cabeza VAD se descartó. La cuantización Q5_K se aplicó con `parakeet-quantize` de whisper.cpp (revisión `c44b60b`) directamente desde el f32 convertido, nunca desde f16.

## Capacidades

- Transcripción de voz a texto en francés e inglés, con soporte declarado multilingüe.
- Dictado de audio en formato WAV 16 kHz mono.
- Ejecución local mediante `parakeet-cli` de whisper.cpp, con backend Vulkan o CPU.
- Inferencia acelerada por GPU (Vulkan) o por CPU con `-ng`.
- Selección de dispositivo Vulkan con `-dev N` y de hilos con `-t`.
- No dispone de generación de texto libre, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking ni de salida de audio.

## Casos de uso

- Dictado local en Windows: la aplicación La Touche Carré usa este palier S para transcribir voz a texto sin que el audio ni el texto salgan de la máquina; el SHA-256 del fichero se verifica en la propia aplicación para garantizar la integridad de la descarga.
- Transcripción de reuniones y notas de voz: con 543 MB de RAM y 903 MB de VRAM en la configuración medida, el modelo puede mantenerse cargado en segundo plano en un equipo de sobremesa mientras se dictan fragmentos cortos.
- Subtitulado y transcripción por lotes en francés e inglés: el rendimiento medido de 188 segundos de audio procesados en 3,6-4,4 segundos sobre una RTX 5090 permite procesar horas de audio en pocos minutos.
- Despliegue en equipos sin GPU: la ejecución con `-ng` fuerza el procesamiento por CPU, con una velocidad del orden de 0,1 a 0,2 veces el tiempo real según las mediciones del autor, adecuada para dictado interactivo en portátiles.
- Integración en pipelines de accesibilidad: transcripción en vivo de voz a texto para usuarios con dificultades motoras o auditivas, ejecutándose íntegramente en local.
- Archivado y búsqueda de audio corporativo: transcripción masiva de grabaciones internas sin enviar datos a servicios en la nube, gracias a la licencia CC-BY-4.0 y a la ausencia de dependencias de red.
- Evaluación comparativa de cuantizaciones: el repositorio publica mediciones de CER y WER para Q2_K a F16, lo que permite elegir el equilibrio entre memoria y precisión en función del hardware disponible.

## Benchmarks y rendimiento

El autor publica un banco de voz del 27/10/2026 sobre Ryzen 7 7800X3D y RTX 5090 con `parakeet-cli` Vulkan, una pasada, con unos 2.830 caracteres y 487 palabras de referencia. Los errores se cuentan como caracteres fallidos tras normalización de números.

| Palier | Cuantizacion | Bytes | Errores d/p/f | Total | CER % | WER % | FLEURS % palabras | RAM / VRAM MB |
|---|---|---|---|---|---|---|---|---|
| — | Q2_K (descartado) | 272.917.479 | 51/47/610 | 708 | 25,19 | 41,48 | 53,95 | 396 / 684 |
| XS | Q3_K | 334.751.719 | 1/4/20 | 25 | 0,89 | 3,90 | 95,64 | 395 / 746 |
| — | Q4_K (descartado) | 415.611.879 | 1/1/27 | 29 | 1,03 | 4,52 | 94,55 | 470 / 827 |
| S | Q5_K | 491.715.559 | 1/1/23 | 25 | 0,89 | 4,11 | 95,10 | 543 / 903 |
| M | Q6_K | 572.575.719 | 1/1/23 | 25 | 0,89 | 4,11 | 95,10 | 621 / 984 |
| L | Q8_0 | 668.757.119 | 1/1/23 | 25 | 0,89 | 4,11 | 95,10 | 713 / 1.080 |
| XL | F16 | 1.255.897.319 | 1/1/23 | 25 | 0,89 | 4,11 | 95,10 | 1.098 / 1.667 |
| ref. | Parakeet TDT 0.6B v3 Q3_K | 334.751.719 | 1/2/28 | 31 | 1,10 | 4,72 | 94,55 | 396 / 746 |
| ref. | Whisper large-v3 french distil Q5_0 | 791.369.259 | 0/0/36 | 36 | 1,28 | 4,72 | 93,73 | 843 / 1.207 |

Según el autor, Q3_K a F16 obtienen puntuaciones equivalentes con diferencias de pocas palabras: la escala de palieres es de memoria, no de precisión. Q8_0 y F16 producen el mismo texto carácter a carácter. Q2_K se degrada de forma severa. La velocidad es idéntica entre cuantizaciones sobre la misma tarjeta (188 segundos de audio en 3,6-4,4 segundos); en CPU, del orden de 0,1 a 0,2 veces el tiempo real. El inglés forzado en francés se devuelve tal cual, igual que Parakeet v3.

## Requisitos de hardware

- VRAM estimada para Q5_K: 903 MB en la configuración medida por el autor (RTX 5090, backend Vulkan).
- RAM estimada para Q5_K: 543 MB.
- GPU recomendadas: cualquier GPU compatible con Vulkan con al menos 1 GB de VRAM libre; el autor midió sobre RTX 5090. No se han publicado mediciones sobre A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, con 903 MB de VRAM para Q5_K, muy por debajo de los 8 GB de una RTX 3060 o similar.
- Opciones de despliegue: `parakeet-cli` de whisper.cpp con backend Vulkan o CPU (`-ng`); selección de dispositivo con `-dev N`.
- Latencia y throughput: 188 segundos de audio procesados en 3,6-4,4 segundos sobre RTX 5090 con Vulkan; en CPU, aproximadamente 0,1 a 0,2 veces el tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento medido |
|---|---|---|---|---|---|
| Parakeet Ultra 0.6B Q5_K (este) | 0,6B | no disponible | CC-BY-4.0 | GGML Q5_K | CER 0,89 %, WER 4,11 %, FLEURS 95,10 % |
| Parakeet TDT 0.6B v3 Q3_K | 0,6B | no disponible | CC-BY-4.0 | GGML Q3_K | CER 1,10 %, WER 4,72 %, FLEURS 94,55 % |
| Whisper large-v3 french distil Q5_0 | no disponible | no disponible | no disponible | GGML Q5_0 | CER 1,28 %, WER 4,72 %, FLEURS 93,73 % |

Las tres alternativas se midieron en el mismo banco de voz del autor, por lo que la comparación es directa. Parakeet Ultra 0.6B Q5_K obtiene el mejor CER y WER de la tabla, con un tamaño intermedio (491,7 MB frente a 334,8 MB del Parakeet v3 Q3_K y 791,4 MB del Whisper distilado). El consumo de VRAM es de 903 MB frente a 746 MB y 1.207 MB respectivamente.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ASR: no genera texto libre, no razona y no soporta tool calling; no debe evaluarse como un LLM.
- Idiomas limitados a francés, inglés y multilingüe según la model card; no se han publicado evaluaciones por idioma más allá del banco del autor.
- El inglés forzado en francés se devuelve tal cual, igual que en Parakeet v3, lo que puede producir transcripciones mezcladas en audio con cambio de idioma.
- Q2_K se degrada severamente (CER 25,19 %, WER 41,48 %); no es una cuantización recomendable para producción.
- La cabeza VAD fue descartada en la conversión, por lo que no hay detección de actividad de voz integrada.
- No se han publicado datos sobre sesgos demográficos, acentos o ruido de fondo; el banco del autor usa extractos de dictado y FLEURS.
- Riesgo de alucinación en audio ruidoso o con solapamiento de voces no cuantificado en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución a Moondream y NVIDIA; ni Moondream ni NVIDIA están asociados a este repositorio.
- El modelo base es un post-entrenamiento de terceros sobre Parakeet TDT 0.6B v3; la cadena de atribución debe mantenerse en cualquier redistribución.
- Requiere audio WAV 16 kHz mono; no se documentan otros formatos de entrada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LaToucheCarre/LaToucheCarre-Voix-S-Parakeet-Ultra-0.6B-Q5_K-GGML
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Plantilla ggml oficial: https://huggingface.co/ggml-org/parakeet-GGUF
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Producto La Touche Carré: https://latouchecarre.fr
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
