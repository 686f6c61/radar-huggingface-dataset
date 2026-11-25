# PocketAiHub/DeepSeek-V4.1-Flash-1017-obliterated-MLX-oQ2.5e

## Resumen

DeepSeek V4.1 Flash 1017 obliterated · MLX oQ2.5e es una cuantización de precisión mixta para Apple Silicon del checkpoint BF16 OBLITERATUS/DeepSeek-V4.1-Flash-1017-obliterated, un derivado de DeepSeek V4.1 Flash con la dirección de rechazo ablacionada. Lo publica el usuario PocketAiHub y está pensado específicamente para ejecutarse en un Mac con 256 GiB de memoria unificada y almacenamiento SSD local. El paquete completo ocupa 337,4 GB en disco repartidos en 1.046 ficheros safetensors, mientras que los pesos del backbone suman 199,78 GiB, equivalentes a 3,11 bits efectivos por parámetro incluyendo metadatos de cuantización.

La receta oQ2.5e combina asignación de bits variable por capa con cuantización afín de 4 bits y grupos de 32 para las dos tablas Engram, que permanecen en SSD durante la inferencia. Se calibró con 128 secuencias de 512 tokens usando activaciones de los pesos BF16 originales. El modelo conserva el tokenizador, la plantilla de chat y la licencia MIT del checkpoint de origen.

Su relevancia es doble: por un lado demuestra que un MoE de gran tamaño puede servirse en hardware de consumo profesional Apple con contexto de hasta 262.144 tokens de entrada; por otro, cuantifica el coste de esa compresión con métricas locales de perplexity y latencia medidas sobre un M5 Ultra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (derivada de DeepSeek V4.1 Flash) con tablas Engram |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens de entrada en el launcher de una sola petición |
| Tipos de cuantizacion | oQ2.5e (precisión mixta, ~3,11 bits efectivos por parámetro; tablas Engram en 4 bits afín, grupo 32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (1.046 ficheros, 337,4 GB en disco) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos (MoE) de la familia DeepSeek V4.1 Flash, del que esta ficha no dispone de detalles de composición del dataset, número de tokens de entrenamiento ni fases de RLHF o DPO. La variante obliterated aplica una ablación de la dirección de rechazo sobre el checkpoint BF16 original, lo que modifica el comportamiento de seguridad heredado. La versión publicada aquí no reentrena pesos: únicamente los recuantiza.

La innovación técnica está en la receta de cuantización oQ2.5e. El backbone se distribuye en precisión mixta con una media de 3,11 bits efectivos por parámetro, y las dos tablas Engram se mantienen en 4 bits con grupos de 32 y se transmiten desde SSD en tiempo de inferencia en lugar de residir en memoria. La calibración empleó 128 secuencias de 512 tokens con activaciones extraídas de los pesos BF16 de origen. El launcher incluye un shim de compatibilidad BF16 para este export y solicita una reserva de memoria cableada de 208 GiB por proceso. El runtime probado es oMLX 0.7.3 sobre MLX 0.32.4, con versiones exactas y hashes documentados en tested-runtime.json.

## Capacidades

- Generación de texto conversacional y de formato largo, con plantilla de chat incluida.
- Razonamiento sobre contextos extensos: el launcher acepta hasta 262.144 tokens de entrada, incluido el formato de chat.
- Recuperación de información en contextos masivos: las pruebas locales verifican la extracción de claves de archivo repetidas en texto de fondo largo.
- Ejecución local en Apple Silicon sin dependencia de GPU dedicada ni de servicios en la nube.
- Compatibilidad con MLX y con el ecosistema oMLX para carga y ejecución.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión, audio o modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos extensos en local: contratos, expedientes o bases de conocimiento de cientos de miles de tokens se pueden cargar en una sola petición de hasta 262K tokens, útil para despachos y equipos jurídicos que no pueden enviar datos a la nube.
- Análisis de repositorios de código completos: con contexto de 256K se puede pasar un árbol de fuentes y documentación para tareas de revisión, resumen o búsqueda de patrones sin trocear el material.
- Investigación con datos sensibles en estación de trabajo Mac: al ejecutarse íntegramente en local sobre un M5 Ultra con 256 GiB, evita la exposición de datos a terceros, lo que encaja en entornos clínicos, financieros o de defensa.
- Archivística y búsqueda semántica sobre corpus largos: la prueba de recuperación de claves en texto de fondo repetido valida el uso para localizar datos concretos dentro de archivos masivos.
- Prototipado de asistentes conversacionales de contexto largo: la plantilla de chat y el pipeline text-generation permiten montar un servicio interno de preguntas y respuestas sobre manuales técnicos.
- Evaluación de cuantizaciones de precisión mixta: el paquete incluye validation_report.json y SHA256SUMS.weights, lo que lo convierte en una referencia reproducible para medir el impacto de oQ2.5e frente al BF16 en perplexity y latencia.
- Inferencia por lotes pequeños en una sola máquina: el benchmark de dos sesiones simultáneas sobre un modelo en memoria muestra un patrón de despliegue viable para dos usuarios concurrentes con cachés independientes.

## Benchmarks y rendimiento

El autor publica mediciones locales de latencia, memoria y perplexity, no resultados de benchmarks académicos estándar.

| Prueba | Tiempo de procesamiento del prompt | Generación por sesión | RAM máxima del proceso |
|---|---:|---:|---:|
| 1 × 128K | 5 min 35 s | 32,4 tok/s | 200,3 GiB |
| 1 × 256K | 12 min 17 s | 32,0 tok/s | 201,0 GiB |
| 2 × 128K | 11 min 21 s | 16,2 tok/s | 202,3 GiB |
| 2 × 256K | 25 min 13 s | 16,0 tok/s | 204,8 GiB |

Cada petición generó 128 tokens de salida tras leer el prompt completo sin reutilización de prefijo. El tiempo de prompt excluye la carga del modelo. En cuatro secuencias retenidas de 512 tokens, la perplexity agrupada aumentó aproximadamente un 5,5 % frente a la referencia BF16 en streaming. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de comportamiento del modelo upstream en la información disponible, y la calidad de razonamiento en contexto largo permanece sin medir.

## Requisitos de hardware

- Memoria unificada: 256 GiB es el objetivo declarado; el proceso solicita una reserva cableada de 208 GiB y el pico medido llega a 204,8 GiB en la prueba de 2 × 256K.
- Almacenamiento: 337,4 GB libres en SSD local para el repositorio completo; las tablas Engram se leen desde disco durante la inferencia, por lo que un SSD rápido es requisito práctico.
- GPU dedicada: no aplica; el modelo está empaquetado para Apple Silicon y MLX, no para CUDA.
- Cabe en GPU de consumo tipo RTX 4090 o A100: no, el formato y el tamaño efectivo están pensados para memoria unificada Apple.
- Hardware probado: Apple M5 Ultra con 256 GiB.
- Despliegue: app oMLX 0.7.3 con MLX 0.32.4 y el script run-mlx.sh incluido; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 32,0-32,4 tok/s en sesión única y 16,0-16,2 tok/s con dos sesiones concurrentes; el procesamiento de un prompt de 256K ronda los 12 minutos en una sola petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek V4.1 Flash 1017 obliterated MLX oQ2.5e (este) | no disponible (3,11 bits efectivos, 199,78 GiB backbone) | 262.144 tokens de entrada | MLX, Apple Silicon 256 GiB | MIT | Hugging Face, 662 descargas |
| OBLITERATUS/DeepSeek-V4.1-Flash-1017-obliterated (BF16) | no disponible | no disponible | safetensors BF16 | MIT | Hugging Face |
| DeepSeek V4.1 Flash 1017 (upstream original) | no disponible | no disponible | safetensors | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de parámetros de los checkpoints de referencia en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- La ablación de la dirección de rechazo del checkpoint obliterated altera el comportamiento de seguridad heredado; no debe asumirse que mantiene las salvaguardas del DeepSeek V4.1 Flash original.
- El incremento de perplexity del 5,5 % se midió sobre solo cuatro secuencias de 512 tokens; la degradación en contextos largos y en razonamiento complejo no está caracterizada.
- La retención de las puntuaciones de evaluación de comportamiento del modelo upstream no se ha medido.
- Los tiempos de prompt publicados son anteriores a la optimización del launcher que omite puntuaciones de vocabulario intermedio; las cifras actuales podrían diferir.
- El uso práctico exige un Mac con 256 GiB de memoria unificada y 337,4 GB de SSD libre, lo que restringe el despliegue a un nicho de hardware muy concreto.
- Las tablas Engram dependen de lecturas desde SSD durante la inferencia; un almacenamiento lento degradará la latencia.
- No hay información sobre idiomas soportados, sesgos conocidos ni evaluación multilingüe.
- Aunque la licencia es MIT, el uso comercial debe verificar además las condiciones del checkpoint upstream y del modelo DeepSeek original.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican las advertencias habituales de los modelos generativos sin evaluación específica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PocketAiHub/DeepSeek-V4.1-Flash-1017-obliterated-MLX-oQ2.5e
- Modelo base: https://huggingface.co/OBLITERATUS/DeepSeek-V4.1-Flash-1017-obliterated
- Revisión del checkpoint de origen: https://huggingface.co/OBLITERATUS/DeepSeek-V4.1-Flash-1017-obliterated/tree/29a9f998fe73e25c4f22734f5f312ba22d19e238
- Runtime oMLX: https://github.com/jundot/omlx
- Informe de validación: validation_report.json (incluido en el repositorio)
- Sumas de verificación de pesos: SHA256SUMS.weights (incluido en el repositorio)
- Versiones del runtime probado: tested-runtime.json (incluido en el repositorio)
