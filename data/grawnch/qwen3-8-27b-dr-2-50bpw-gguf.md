# Grawnch/Qwen3.8-27B-DR-2.50bpw-GGUF

## Resumen

Grawnch/Qwen3.8-27B-DR-2.50bpw-GGUF es una cuantización GGUF de muy baja precisión (2,50 bits por peso) del modelo base Qwen/Qwen3.8-27B, publicada por el usuario Grawnch en Hugging Face. El objetivo es hacer viable la inferencia de un modelo de aproximadamente 26.900 millones de parámetros en hardware de gama consumer, reduciendo el peso de los ficheros a 9,68 GiB frente al tamaño que ocuparía el modelo en BF16. La cuantización se ha generado con imatrix (importance matrix), una técnica que calibra la pérdida de precisión por tensor para minimizar el daño respecto al modelo original.

El modelo base pertenece a la familia Qwen3, orientada a razonamiento, matemáticas y código, con una ventana de contexto declarada de 262.144 tokens. Esta versión cuantizada conserva esa longitud de contexto y se distribuye en formato GGUF con variantes Q2_K, Q3_K y Q4_K, lo que permite desplegarla en llama.cpp y en entornos compatibles con endpoints de Hugging Face.

La relevancia de esta ficha es doble: por un lado, documenta una opción de despliegue local de un modelo de 27B en GPUs de consumo; por otro, permite evaluar el coste real en calidad de una cuantización a 2,50 bpw mediante las métricas de perplejidad, divergencia KL y acuerdo top-1/top-5 que el autor publica frente al modelo en BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; no se detalla en la model card) |
| Parámetros totales | 26.895.998.464 (dato de safetensors del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | GGUF con variantes Q2_K, Q3_K y Q4_K; bitrate efectivo 2,50 bpw; generada con imatrix |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (9,68 GiB; 10,39 GB decimal) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen/Qwen3.8-27B en la documentación proporcionada: no se especifica si es un transformer denso, un MoE o una arquitectura híbrida, ni se detallan el número de capas, la dimensión de los embeddings o el mecanismo de atención. Tampoco se documentan los datos de entrenamiento (número de tokens, composición del corpus, fases de RLHF o DPO) ni innovaciones técnicas como decodificación especulativa o atención lineal.

Lo que sí está documentado es el proceso de cuantización. El autor ha generado los pesos GGUF con una importance matrix (imatrix), un método que estima la sensibilidad de cada tensor a la cuantización usando un corpus de calibración y ajusta los parámetros de cuantización en consecuencia. El resultado es un fichero de 9,68 GiB con un bitrate efectivo de 2,50 bpw, lo que supone una compresión muy agresiva respecto a los 16 bits por peso del BF16. La model card reporta métricas de fidelidad frente al modelo en BF16: perplejidad en WikiText-2 de 7,6316 (frente a 6,5210 en BF16) con contexto de 2048, divergencia KL de 0,1980 y acuerdo top-1 del 81,89 % y top-5 del 97,96 %.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo está orientado a diálogo multi-turno.
- Razonamiento y matemáticas: la model card reporta un resultado de 93,3 % (28/30) en AIME 2025, lo que sugiere capacidad de razonamiento matemático competitivo en el modelo base.
- Código: el conjunto de evaluación extendido del autor incluye pruebas de razonamiento, matemáticas y código, aunque no se desglosan resultados por tarea.
- Contexto largo: soporta hasta 262.144 tokens, adecuado para documentos extensos y conversaciones con historial amplio.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio puede servirse a través de la infraestructura de endpoints de Hugging Face.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en GPU de consumo: con 9,68 GiB de pesos, el modelo cabe en GPUs con 12-16 GB de VRAM (por ejemplo, RTX 3060 de 12 GB o RTX 4070 Ti de 16 GB) si se reserva espacio para el contexto; es adecuado para prototipado y uso personal sin depender de la nube.
- Asistente de código en el IDE: la ventana de 262.144 tokens permite cargar repositorios o ficheros extensos como contexto y mantener conversaciones largas sobre el código, con la ventaja de que el modelo corre en local y no expone el código a terceros.
- Razonamiento matemático y resolución de problemas: el resultado de 93,3 % en AIME 2025 del modelo base lo hace apropiado para tutoría, verificación de demostraciones o generación de problemas resueltos, siempre que se acepte la degradación de calidad de la cuantización.
- Procesamiento de documentos largos: informes, contratos o artículos de decenas de miles de tokens pueden introducirse en una sola pasada gracias al contexto de 262.144 tokens, útil para resumen y extracción de información.
- Experimentación en investigación: sirve para estudiar el impacto de cuantizaciones agresivas (2,50 bpw) en tareas de razonamiento, comparando las métricas de perplejidad y KL que publica el autor con las del modelo en BF16.
- Servicio de chat autoalojado: mediante llama.cpp u Ollama se puede exponer una API compatible con OpenAI para integrarla en aplicaciones internas con requisitos de privacidad.
- Evaluación comparativa de cuantizaciones: al existir variantes Q2_K, Q3_K y Q4_K en el mismo repositorio, permite medir el compromiso entre tamaño, velocidad y calidad antes de fijar una configuración de producción.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia BF16 |
|---|---|---|
| AIME 2025 | 93,3 % (28/30) | no disponible |
| WikiText-2, contexto 2048: perplejidad | 7,6316 | 6,5210 |
| WikiText-2, contexto 2048: NLL | 2,0323 | 1,8750 |
| WikiText-2, contexto 2048: divergencia KL | 0,1980 | — |
| WikiText-2, contexto 2048: acuerdo top-1 | 81,89 % | — |
| WikiText-2, contexto 2048: acuerdo top-5 | 97,96 % | — |
| WikiText-2, test completo (145 × 2048, 296.815 tokens): perplejidad | 8,3754 | 7,2740 |
| WikiText-2, test completo: NLL | 2,1253 | 1,9843 |
| WikiText-2, contexto 1024: perplejidad | 8,6111 | 7,0795 |
| WikiText-2, contexto 1024: NLL | 2,1530 | 1,9572 |
| WikiText-2, contexto 1024: divergencia KL | 0,2163 | — |
| WikiText-2, contexto 1024: acuerdo top-1 | 80,54 % | — |
| WikiText-2, contexto 1024: acuerdo top-5 | 97,37 % | — |
| Razonamiento/matemáticas/código extendido: perplejidad | 17,4249 | 14,4714 |
| Razonamiento/matemáticas/código extendido: NLL | 2,8579 | 2,6722 |
| Razonamiento/matemáticas/código extendido: divergencia KL | 0,3005 | — |
| Razonamiento/matemáticas/código extendido: acuerdo top-1 | 77,04 % | — |
| Razonamiento/matemáticas/código extendido: acuerdo top-5 | 96,74 % | — |
| Generación estructurada: perplejidad | 2,9671 | 2,5256 |
| Generación estructurada: NLL | 1,0876 | 0,9265 |
| Generación estructurada: divergencia KL | 0,2203 | — |
| Generación estructurada: acuerdo top-1 | 82,90 % | — |
| Generación estructurada: acuerdo top-5 | 98,05 % | — |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 9,67 GiB solo para los pesos; con contexto de 2048-4096 tokens y overhead de llama.cpp, se recomienda al menos 12 GB de VRAM; para contextos largos (32K o más) se necesitan 16 GB o más, o bien descarga parcial a RAM/CPU.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080/4090 16-24 GB; en el segmento profesional, A100 o H100 permiten contextos completos y mayor throughput.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM para contextos moderados; con 8 GB sería necesario offloading a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían conversión o backends alternativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Grawnch/Qwen3.8-27B-DR-2.50bpw-GGUF | 26,9 B | 262.144 | GGUF 2,50 bpw | no disponible | Cuantización agresiva con imatrix; 93,3 % en AIME 2025 |
| Qwen/Qwen3.8-27B (modelo base) | 26,9 B | 262.144 | safetensors (BF16) | no disponible | Referencia de calidad; requiere ~54 GB en BF16 |
| Otras cuantizaciones GGUF del mismo base (Q4_K, Q5_K, Q8_0) | 26,9 B | 262.144 | GGUF | no disponible | Mayor tamaño y fidelidad; no se dispone de métricas en la información proporcionada |
| Modelos de 27B-32B de otras familias | no disponible | no disponible | no disponible | no disponible | Sin datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La cuantización a 2,50 bpw degrada la calidad de forma medible: la perplejidad en WikiText-2 sube de 6,5210 a 7,6316 y el acuerdo top-1 cae al 81,89 %, lo que implica que aproximadamente uno de cada cinco tokens predichos cambia respecto al modelo en BF16.
- En tareas de razonamiento, matemáticas y código la degradación es mayor: la perplejidad pasa de 14,4714 a 17,4249 y el acuerdo top-1 baja al 77,04 %, por lo que no es recomendable para producción que exija alta fiabilidad en estas áreas.
- El resultado de AIME 2025 (93,3 %) corresponde a la evaluación reportada por el autor; no se especifica si se obtuvo con el modelo cuantizado o con el base, por lo que debe interpretarse con cautela.
- Riesgo de alucinación: no cuantificado en la información disponible; en general, las cuantizaciones agresivas pueden incrementar la probabilidad de errores factuales.
- Sesgos conocidos: no disponibles; dependen del corpus de entrenamiento del modelo base, que no se documenta.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento multilingüe de esta cuantización.
- Licencia: no disponible; antes de un uso comercial es imprescindible verificar la licencia del modelo base Qwen/Qwen3.8-27B y los términos de redistribución.
- El contexto declarado de 262.144 tokens no garantiza un rendimiento uniforme en toda la ventana; las métricas publicadas solo cubren contextos de 1024 y 2048 tokens.
- El repositorio tiene un número reducido de descargas (946) y un solo like, lo que limita la validación comunitaria de la calidad de la cuantización.
- Para despliegue en producción se recomienda evaluar variantes de mayor precisión (Q3_K, Q4_K) y comparar con el modelo en BF16 en el dominio concreto de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-27B-DR-2.50bpw-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
