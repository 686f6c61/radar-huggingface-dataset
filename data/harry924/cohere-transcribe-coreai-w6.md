# Harry924/cohere-transcribe-coreai-w6

## Resumen

`Harry924/cohere-transcribe-coreai-w6` es una conversión cuantizada del modelo de reconocimiento automático del habla (ASR) `CohereLabs/cohere-transcribe-03-2026`, empaquetada para el runtime Core AI de Apple (Neural Engine). El autor, Harry924, parte de la conversión intermedia de coder543 y aplica una paletización a 6 bits sobre los pesos del encoder, manteniendo intactos el grafo de subsampling, las convoluciones depthwise, el decoder y las excepciones en FP16 del bundle original (W8A16). El resultado es un artefacto de 1,82 GB frente a los 2,24 GB del original, con un host compatible que lo carga sin cambios.

El modelo resuelve la transcripción de voz en 14 idiomas (inglés, francés, alemán, español, italiano, portugués, neerlandés, polaco, griego, árabe, japonés, chino, vietnamita y coreano) sobre hardware Apple, con el objetivo declarado de alimentar la aplicación de dictado Meant. Su relevancia radica en la reducción de huella de memoria en dispositivos móviles: pasa de 2,5–2,7 GB a 2,1–2,3 GB durante la transcripción en un iPhone 18 Pro Max, con un coste de precisión de solo 0,2 puntos porcentuales en tasa de error de palabras en inglés (8,2 % frente a 8,0 %).

La ficha técnica disponible es deliberadamente escueta: no se documentan parámetros totales, longitud de contexto, composición del dataset ni resultados de benchmarks más allá de la métrica de WER en inglés. La licencia es Apache 2.0, heredada del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder para ASR (detalles del transformer base no disponibles); encoder paletizado a 6 bits, decoder sin cambios respecto al bundle fuente |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Encoder a 6 bits mediante `coreai.lut_to_dense` (índices de 6 bits, tabla fp16 de 64 entradas por cada 16 canales de salida, k-means 1-D); decoder y excepciones en FP16 (W8A16 en el resto) |
| Idiomas soportados | en, fr, de, es, it, pt, nl, pl, el, ar, ja, zh, vi, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | Bundle Core AI (Core ML / Neural Engine) con grafos y funciones propias del runtime; no se distribuye en safetensors ni GGUF |
| Tamano del repositorio | 1,82 GB |
| Modelo base | CohereLabs/cohere-transcribe-03-2026 (revision 76b8b23e8607f35f0265a23d481b338fb0e26aea) |
| Bundle fuente | coder543/cohere-transcribe-coreai (revision 8ac969ed229b613c2cb9cd4ed84f61c2243dd295) |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento desde cero. La arquitectura subyacente corresponde a `CohereLabs/cohere-transcribe-03-2026`, un sistema ASR encoder-decoder; la model card de esta conversión no detalla el número de capas, dimensión oculta ni composición del dataset de entrenamiento original. Lo que sí se especifica con precisión es la transformación aplicada: los pesos del encoder se paletizan a 6 bits mediante `coreai.lut_to_dense`, con índices de 6 bits y una tabla fp16 de 64 entradas por cada grupo de 16 canales de salida, calculada con k-means unidimensional a partir de los pesos bf16 originales (no de los int8). El grafo de subsampling, las convoluciones depthwise, el decoder y todas las excepciones en FP16 se mantienen idénticos al bundle fuente W8A16.

La innovación técnica relevante es la compatibilidad de contrato: las firmas de grafo, las funciones y el contrato de host son idénticos a los del bundle de coder543, de modo que un host escrito para el original carga esta versión sin modificaciones. El runtime requerido es macOS 27 / iOS 27 sobre Apple silicon, con un frontend de host específico del modelo. No se documentan fases de RLHF, DPO ni datos de post-entrenamiento en la información disponible.

## Capacidades

- Reconocimiento automático del habla (ASR) en 14 idiomas: inglés, francés, alemán, español, italiano, portugués, neerlandés, polaco, griego, árabe, japonés, chino, vietnamita y coreano.
- Transcripción de audio orientada a dictado en tiempo real sobre Neural Engine de Apple.
- Ejecución en dispositivo (on-device) sin dependencia de servidores externos, gracias al bundle Core AI.
- Compatibilidad directa con hosts existentes del bundle `coder543/cohere-transcribe-coreai` (mismas firmas de grafo y contrato de host).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada más allá de la transcripción ni modo de razonamiento explícito.

## Casos de uso

- Dictado en aplicaciones móviles: es el caso de uso declarado (app Meant); el modelo transcribe voz a texto en el dispositivo con 2,1–2,3 GB de memoria en un iPhone 18 Pro Max, lo que permite integrarlo en apps de notas o correo sin enviar audio a la nube.
- Subtitulado y transcripción de reuniones en macOS: al ejecutarse sobre Neural Engine en macOS 27, puede alimentar herramientas de actas o subtítulos en directo con latencia baja y sin coste de API.
- Procesamiento por lotes de audio multilingüe: los 14 idiomas cubiertos permiten transcribir archivos de clientes o investigación en una sola pasada, aunque solo el inglés está validado según la model card.
- Accesibilidad: conversión de voz a texto para usuarios con dificultades motoras o auditivas en dispositivos Apple, con la ventaja de que el audio no sale del dispositivo.
- Integración en pipelines de datos: transcripción previa a análisis de sentimiento o extracción de entidades en centros de llamadas, siempre que el entorno de ejecución sea Apple silicon con el runtime Core AI.
- Prototipado de asistentes de voz: al ser un bundle ligero (1,82 GB) y con licencia Apache 2.0, sirve para validar productos de voz en iOS/macOS antes de escalar a infraestructura servidor.

## Benchmarks y rendimiento

| Metrica | Fuente (W8A16) | Este modelo (encoder 6 bits) |
|---|---|---|
| Tamano del bundle | 2,24 GB | 1,82 GB |
| Memoria en iPhone 18 Pro Max durante transcripcion | 2,5–2,7 GB | 2,1–2,3 GB |
| Tasa de error de palabras en ingles (media de 5 conjuntos, en vivo) | 8,0 % | 8,2 % |

Las mediciones se realizaron únicamente en inglés; el resto de idiomas no está probado según la model card. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- Runtime: macOS 27 o iOS 27 sobre Apple silicon; requiere un frontend de host específico del modelo (no funciona con vLLM, llama.cpp, Ollama ni TGI).
- Memoria en dispositivo: 2,1–2,3 GB durante la transcripción en un iPhone 18 Pro Max (medido); el bundle ocupa 1,82 GB en disco.
- GPU/acceleradores: Neural Engine de Apple silicon; no se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en hardware de consumo Apple (iPhone y Mac con Apple silicon), no en GPUs NVIDIA de consumo por incompatibilidad de formato.
- Latencia y throughput: no disponibles; solo se reporta la tasa de error de palabras en inglés.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Harry924/cohere-transcribe-coreai-w6 | no disponible | no disponible | 14 | Apache 2.0 | Bundle Core AI | Encoder 6 bits, 1,82 GB, WER inglés 8,2 % |
| coder543/cohere-transcribe-coreai | no disponible | no disponible | 14 | Apache 2.0 | Bundle Core AI | Bundle fuente W8A16, 2,24 GB, WER inglés 8,0 % |
| CohereLabs/cohere-transcribe-03-2026 | no disponible | no disponible | 14 | Apache 2.0 | no disponible | Modelo upstream original |

No se dispone de datos de otros modelos ASR comparables (Whisper, Parakeet, etc.) en la información proporcionada.

## Limitaciones y advertencias

- La validación de precisión se limita al inglés; el resto de los 13 idiomas declarados no está probado y su calidad es desconocida.
- La cuantización a 6 bits del encoder degrada ligeramente la precisión: 8,2 % de WER frente a 8,0 % del bundle W8A16 en la media de 5 conjuntos en inglés.
- Dependencia fuerte del ecosistema Apple: requiere macOS 27 / iOS 27, Apple silicon y un host específico; no es desplegable en servidores Linux con GPU NVIDIA.
- Riesgo de alucinación en pasajes de audio con ruido o solapamiento de hablantes no cuantificado en la documentación disponible.
- No se documentan sesgos conocidos, restricciones adicionales de uso comercial (Apache 2.0 permite uso comercial) ni limitaciones de contexto o duración máxima de audio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harry924/cohere-transcribe-coreai-w6
- Bundle fuente de coder543: https://huggingface.co/coder543/cohere-transcribe-coreai
- Modelo upstream: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
