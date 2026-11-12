# mlx-community/ZONOS3-Mini-swift-ptq

## Resumen

ZONOS3-Mini-swift-ptq es una conversión a formato MLX del modelo de síntesis de voz ZONOS3-Mini desarrollado por Zyphra, publicada por la comunidad mlx-community. Se trata de un sistema text-to-speech multilingüe con clonación de voz que genera audio a 44,1 kHz y está diseñado para ejecutarse en tiempo real sobre Apple Silicon. El repositorio contiene una versión post-training-quantized (PTQ) del backbone, adaptada específicamente para el port en Swift denominado mlx-zonos3-tts-swift, que permite integrar el modelo en aplicaciones nativas de macOS e iOS.

La relevancia de esta ficha radica en que no es un modelo nuevo, sino una redistribución técnica: los tensores conservan los nombres y metadatos del release GGUF original de Zyphra, y las cuantizaciones GGUF Q4_0 y Q8_0 se reempaquetan bit a bit en la forma afín de MLX (group size 32) sin recuantizar. Esto lo diferencia del repositorio mlx-community/ZONOS3-Mini, orientado al port en Python de mlx-audio; ninguno de los dos ports carga los ficheros del otro.

El modelo resuelve el problema de disponer de TTS multilingüe de alta calidad con clonación de voz en el ecosistema Apple, donde las alternativas de inferencia suelen requerir Python. Según la model card, en un chip M5 Max alcanza aproximadamente 9-10 veces el tiempo real con primer audio en decenas de milisegundos, 1,6 GB residentes y 2,8 GB de pico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone tipo language model con sequence mixers (gated-delta) y decoder de codec `keep2_plain`; encoder de altavoz MECT-B2 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE, aunque el backbone usa "expertos" a 4 bits) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Backbone: 4 bits en expertos, 8 bits en sequence mixers y cabeza de logits; decoder en fp16/fp32; speaker encoder en fp32 |
| Idiomas soportados | Multilingüe (lista concreta no disponible) |
| Licencia | Apache-2.0 (pesos); código Swift MIT |
| Formato de pesos | safetensors (MLX affine quantization, group size 32) |

## Arquitectura y entrenamiento

El modelo base ZONOS3-Mini de Zyphra combina un backbone de lenguaje con mezcladores de secuencia (sequence mixers) de tipo gated-delta, según se deduce de la mención al kernel Metal gated-delta heredado de mlx-lm. El sistema se descompone en tres componentes: el language model que procesa el texto y produce representaciones acústicas, un decoder de codec denominado `keep2_plain` que convierte dichas representaciones en audio a 44,1 kHz, y un speaker encoder MECT-B2 que extrae embeddings de altavoz de 192 dimensiones para la clonación de voz. El tokenizador es SuperBPE, embebido en el GGUF del backbone.

La conversión a MLX no introduce cambios en los valores: los bloques GGUF Q4_0 y Q8_0 se reempaquetan bit a bit en la forma afín de MLX con group size 32. El único tensor calculado es la cabeza de logits, que Zyphra cuantiza a Q8_0 al cargar un backbone cuantizado, y este repositorio almacena el resultado de esa misma operación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Síntesis de voz multilingüe a 44,1 kHz con calidad de audio completa.
- Clonación de voz a partir de un embedding de altavoz de 192 dimensiones, ya sea extraído de una referencia PCM o seleccionado entre las 27 voces predefinidas incluidas en `voices.json`.
- Generación en tiempo real: aproximadamente 9-10 veces el tiempo real en un M5 Max.
- Baja latencia de primer audio: decenas de milisegundos.
- Inferencia nativa en Apple Silicon mediante MLX y Swift.
- Integración con MLXEngine a través del paquete `MLXZonos3TTS` en la capacidad `tts`.
- Reproducibilidad por semilla en el runtime Swift (aunque no replica las tomas del runtime original).
- No incluye: normalización de texto, control de duración, steering de entrega, acentos, edición de voz, modo de referencia cruda, decoder `full_mr`, encoder de referencia crudo, backbone de edición de voz ni bundle de steering.

## Casos de uso

- Síntesis de voz en aplicaciones nativas de macOS e iOS: el modelo se integra como paquete Swift (`MLXZonos3TTS`) y permite generar voz en local sin depender de servicios en la nube, con 1,6 GB residentes y 2,8 GB de pico en M5 Max.
- Lectura de contenido en aplicaciones de accesibilidad: la baja latencia de primer audio (decenas de milisegundos) y la velocidad de 9-10× tiempo real permiten leer pantallas o documentos de forma fluida en dispositivos Apple Silicon.
- Asistentes conversacionales locales: la clonación de voz con 27 voces predefinidas o embeddings personalizados permite dotar de identidad sonora a asistentes que se ejecutan íntegramente en el dispositivo.
- Generación de audiolibros y pódcasts: la salida a 44,1 kHz y el soporte multilingüe permiten producir narraciones de calidad sin infraestructura de GPU dedicada, siempre que se escriban números, fechas y abreviaturas de forma explícita por la ausencia de normalización de texto.
- Prototipado de interfaces de voz en Swift: al estar empaquetado para MLXEngine y el ecosistema Swift, se puede integrar en prototipos de UI de voz sin salir del stack nativo de Apple.
- Clonación de voz consentida para demos y pruebas: el modelo permite generar muestras con la voz de un hablante a partir de una referencia PCM, con la advertencia de que la similitud es aproximada y menor que la de modelos de clonación de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas de rendimiento en hardware: aproximadamente 9-10× tiempo real en un M5 Max, primer audio en decenas de milisegundos, 1,6 GB residentes y 2,8 GB de pico.

## Requisitos de hardware

- VRAM/residencia estimada: 1,6 GB residentes y 2,8 GB de pico en un M5 Max, según la model card.
- GPU recomendadas: Apple Silicon (el modelo está diseñado para MLX y el port Swift); no se indica compatibilidad con GPU NVIDIA o AMD.
- Cabe en consumer GPU: el modelo está orientado a Apple Silicon; no se dispone de datos para GPUs de consumo convencionales.
- Opciones de despliegue: MLX con el port Swift `mlx-zonos3-tts-swift`, o a través de MLXEngine con el paquete `MLXZonos3TTS`; no es compatible con el port Python de mlx-audio.
- Latencia y throughput: 9-10× tiempo real y primer audio en decenas de milisegundos en M5 Max; no se dispone de datos para otros chips.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ZONOS3-Mini-swift-ptq (este) | no disponible | no disponible | multilingüe | Apache-2.0 | safetensors MLX | Port Swift para Apple Silicon; 27 voces; 44,1 kHz |
| mlx-community/ZONOS3-Mini | no disponible | no disponible | multilingüe | Apache-2.0 | safetensors MLX | Mismo modelo base, port Python (mlx-audio); ficheros no interoperables con el port Swift |
| Zyphra/ZONOS3-Mini (original) | no disponible | no disponible | multilingüe | Apache-2.0 | GGUF / original | Release de referencia con decoder `full_mr`, encoder crudo, edición de voz y steering |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El texto se pronuncia tal cual se escribe: el port Swift no incluye normalización de texto, por lo que números, fechas y abreviaturas deben escribirse de forma explícita.
- La clonación de voz es aproximada: se basa en un embedding de 192 dimensiones y la similitud con la referencia es menor que la de modelos de clonación de mayor tamaño; el modo de referencia cruda del original no está portado.
- No están portados los objetivos de duración, el steering de entrega, los acentos ni la edición de voz.
- Una semilla es reproducible en Swift pero no reproduce las tomas del runtime original.
- No se incluyen el decoder `full_mr`, el encoder de referencia crudo y su profesor SSL, el backbone de edición de voz con adaptadores ni el bundle de steering.
- Los ficheros no son interoperables con el port Python de mlx-audio: cada port requiere su propia conversión.
- Restricciones éticas: clonar una voz solo con el consentimiento de su propietario.
- Licencia Apache-2.0 para los pesos, sin términos adicionales por la conversión; el código Swift es MIT y deriva del runtime MIT de Zyphra.
- No se dispone de información sobre sesgos, riesgo de alucinación en el contenido hablado ni limitaciones idiomáticas concretas más allá de la naturaleza multilingüe declarada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/ZONOS3-Mini-swift-ptq
- Modelo base: https://huggingface.co/Zyphra/ZONOS3-Mini
- Conversión para mlx-audio: https://huggingface.co/mlx-community/ZONOS3-Mini
- Port Swift: https://github.com/xocialize/mlx-zonos3-tts-swift
- mlx-audio: https://github.com/Blaizzy/mlx-audio
- MLXEngine: https://github.com/xocialize/mlx-engine-swift
- Runtime de referencia de Zyphra: https://github.com/Zyphra/ZONOS3-Mini
