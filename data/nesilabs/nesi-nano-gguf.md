# nesilabs/nesi-nano-GGUF

## Resumen

nesi-nano es un modelo de lenguaje de tipo mezcla de expertos (MoE) con 26.070.385.152 parámetros totales, desarrollado por Nesilabs como motor local de su aplicación NesiPocket para iPhone. El modelo se distribuye cuantizado a 1 bit en formato GGUF y está pensado para ejecutarse íntegramente sin conexión en dispositivos con 12 GB de RAM, lo que lo sitúa en la categoría de modelos on-device de gran tamaño comprimido.

La propuesta diferencial no es la arquitectura en sí, sino el pipeline de compresión extrema (1 bit) combinado con un proyector de visión y un complemento LoRA opcional que elimina la mayoría de los rechazos. Según la model card, los pesos proceden de modelos abiertos de terceros publicados bajo Apache 2.0; Nesilabs declara que solo ha modificado metadatos (nombre, identificadores de arquitectura y un mensaje de error en la plantilla de chat), sin alterar los pesos originales.

Es relevante ahora porque demuestra que un MoE de 26B puede caber en un teléfono de gama alta con 12 GB de RAM manteniendo velocidad de generación usable (12-15 tokens/s en frío en un iPhone 17 Pro Max). La contrapartida es que los ficheros usan identificadores de arquitectura propios, por lo que las compilaciones estándar de llama.cpp no los cargan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, con vision projector; identificadores de arquitectura propios de nesi-nano |
| Parametros totales | 26.070.385.152 (26B) |
| Parametros activos | "unos pocos miles de millones" por token (cifra exacta no disponible) |
| Longitud de contexto | 8k (ajuste usado por NesiPocket) |
| Tipos de cuantizacion | IQ1_S (1 bit) para el modelo; Q8_0 para el proyector de vision; LoRA en GGUF |
| Idiomas soportados | es, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

nesi-nano es un modelo de mezcla de expertos con 26B parámetros totales y solo unos pocos miles de millones activos por token, lo que permite reducir el coste computacional por paso de decodificación. Incluye un proyector de visión (`nesi-nano-vision-mmproj-Q8_0.gguf`, 346 MB) que habilita la modalidad image-text-to-text. El modelo se distribuye cuantizado a 1 bit con el tipo IQ1_S, un esquema de cuantización con importance matrix (tag `imatrix`) que pesa los parámetros según su relevancia para preservar calidad a tan baja precisión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF/DPO o ajuste por preferencias. La model card indica que los pesos derivan de modelos abiertos de terceros bajo Apache 2.0 y que Nesilabs no los ha modificado: solo ha cambiado metadatos (nombre del modelo, identificadores de arquitectura y un mensaje de error en la plantilla de chat). El complemento LoRA sin censura (`nesi-nano-sin-censura-LoRA.gguf`, 43,8 MB) sí es un artefacto propio de Nesilabs, igual que la cuantización a 1 bit y el proyector de visión, todos bajo Apache 2.0. La configuración de inferencia documentada usa caché KV en q8_0, sin decodificación especulativa y con esfuerzo de razonamiento mínimo.

## Capacidades

- Generación de texto conversacional multi-turno en español e inglés.
- Comprensión de imágenes mediante el proyector de visión (pipeline image-text-to-text).
- Razonamiento con modo de esfuerzo configurable (NesiPocket usa esfuerzo mínimo).
- Ejecución totalmente offline y en el dispositivo, sin llamadas a servicios externos.
- Complemento LoRA opcional que elimina la mayoría de los rechazos del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente personal offline en iPhone: el modelo corre en local con 8k de contexto y ~7,2 GB de memoria GPU fija, de modo que el usuario conserva conversaciones y datos en el dispositivo sin tráfico de red.
- Descripción y análisis de imágenes capturadas con la cámara: el proyector de visión Q8_0 permite consultas image-text-to-text directamente en el teléfono, útil para lectura de documentos, identificación de objetos o accesibilidad.
- Atención al cliente en modo avión o entornos sin cobertura: al no requerir conectividad, es adecuado para aplicaciones de campo, aviación o zonas rurales donde la latencia de red es inaceptable.
- Aplicaciones de privacidad estricta: sectores como salud o legal pueden desplegar un asistente conversacional sin que los datos salgan del dispositivo, apoyándose en la licencia Apache 2.0 para integrarlo en productos propios.
- Prototipado de experiencias conversacionales en iOS: el paquete GGUF y el LoRA permiten iterar sobre un asistente con personalidad ajustada (incluida la variante sin censura) sin depender de infraestructura de servidores.
- Traducción y asistencia bilingüe es/en: el modelo declara soporte para ambos idiomas, lo que cubre escenarios de traducción conversacional y redacción en contextos de movilidad.
- Investigación sobre cuantización extrema: el fichero IQ1_S con imatrix sirve como referencia práctica para estudiar la degradación de calidad de un MoE de 26B comprimido a 1 bit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son medidas de velocidad en un iPhone 17 Pro Max:

| Medida | Valor |
|---|---|
| Generación en frío | 12-15 tokens/s |
| Generación tras sesiones largas (throttling térmico) | ~9 tokens/s |
| Lectura de prompt | 40-70 tokens/s |
| Memoria GPU fija | ~7,2 GB (7,6 GB con visión) |
| Contexto configurado en NesiPocket | 8k, caché KV q8_0 |

## Requisitos de hardware

- RAM: iPhone con 12 GB de RAM (por ejemplo, iPhone 17 Pro o 17 Pro Max). No se documenta soporte para otros dispositivos.
- Memoria: ~7,2 GB de memoria GPU fija para el modelo; ~7,6 GB si se activa la visión.
- Almacenamiento: 6,88 GB para el modelo IQ1_S, 346 MB para el proyector de visión y 43,8 MB para el LoRA opcional; el repositorio completo ocupa 7,3 GB.
- GPU de escritorio: no disponible; la model card solo documenta ejecución en iPhone.
- Despliegue: llama.cpp, pero con la advertencia de que los ficheros usan identificadores de arquitectura propios y las compilaciones estándar de llama.cpp no los cargan. No se documenta compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput: 12-15 tokens/s de generación en frío y ~9 tokens/s bajo throttling térmico; lectura de prompt de 40-70 tokens/s.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de información sobre modelos comparables en la documentación proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de referencia estructural, se puede contrastar con otras familias MoE de tamaño similar, pero sin cifras de rendimiento verificables para nesi-nano:

| Modelo | Parámetros totales | Contexto | Licencia | Formato on-device |
|---|---|---|---|---|
| nesi-nano | 26B (MoE) | 8k | Apache 2.0 | GGUF IQ1_S para iPhone |
| Alternativas MoE de ~20-30B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantización a 1 bit (IQ1_S) implica una degradación de calidad respecto al modelo original que no está cuantificada en la documentación; no hay benchmarks que permitan estimar la pérdida.
- Los ficheros no cargan en compilaciones estándar de llama.cpp debido a los identificadores de arquitectura propios, lo que limita su uso fuera de NesiPocket o de builds adaptadas.
- El contexto está fijado en 8k en la configuración documentada, insuficiente para tareas de contexto largo.
- Solo se declaran los idiomas español e inglés; el rendimiento en otros idiomas no está documentado.
- El LoRA sin censura elimina la mayoría de los rechazos; el autor advierte que el usuario es responsable del contenido generado y de su uso.
- Riesgo de alucinación y sesgos: no documentados en la model card; al derivar de pesos de terceros, hereda los sesgos de los modelos originales, que no se identifican.
- El rendimiento cae con el throttling térmico (~9 tokens/s tras sesiones largas), lo que afecta a cargas de trabajo sostenidas.
- Aunque la licencia es Apache 2.0, la atribución de los pesos originales de terceros no se detalla, lo que conviene verificar antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nesilabs/nesi-nano-GGUF
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Página de Nesilabs / NesiPocket: no disponible en la información proporcionada
- Paper o blog técnico del modelo: no disponible en la información proporcionada
