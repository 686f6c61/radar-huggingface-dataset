# jayPark777/Qwen3.8-27B-Axon-MLQT

## Resumen

Qwen3.8-27B-Axon-MLQT es una cuantización extrema del modelo Qwen/Qwen3.8-27B de Alibaba, desarrollada por Jaesoo Park en el AXON Sovereign Intelligence Lab. Utiliza un formato propietario denominado AXON 3-Trit 0-SKIP MLQT, que representa los pesos mediante estados ternarios discretos {-1, 0, +1} y los empaqueta matemáticamente a una densidad de 1,60 bits por peso (bpw). El resultado es un archivo GGUF de 6,43 GB que reduce el tamaño original BF16 de 54,7 GB en un 88,24 %, permitiendo ejecutar un modelo de 27 000 millones de parámetros en GPUs de consumo con 12 GB de VRAM sin necesidad de offloading.

La relevancia de este lanzamiento radica en que aborda el problema clásico de las cuantizaciones de muy baja precisión (1-2 bits), que suelen degradar severamente la calidad del lenguaje y el razonamiento. Según las mediciones del autor, este formato preserva el 99,2 % de la calidad del modelo original, frente al 42,1 % que obtiene una cuantización IQ1_S convencional. El modelo se distribuye bajo licencia Apache-2.0 y está pensado para inferencia local en hardware asequible, con soporte para llama.cpp, Ollama y llama-cpp-python.

El modelo base Qwen3.8-27B es un transformer denso multimodal (visión y texto) de última generación de Alibaba, con modos de pensamiento e instrucción, orientado a tareas de coding, flujos agénticos y automatización de oficina. Esta cuantización se presenta como text-generation, y no se especifica si se conservan las capacidades multimodales del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.8) |
| Parametros totales | 26 895 998 464 (26,9 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (probado con 16 384 tokens) |
| Tipos de cuantizacion | AXON 3-Trit 0-SKIP MLQT (1,60 bpw efectivo, empaquetado 5-trit/1-byte) |
| Idiomas soportados | no especificado (el modelo base Qwen3.8 es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con cuantización MLQT propietaria) |

## Arquitectura y entrenamiento

Este modelo no es un entrenamiento desde cero, sino una cuantización post-entrenamiento del modelo base Qwen/Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba. El modelo base es un transformer denso de 27 000 millones de parámetros con capacidades multimodales (visión y texto), modos de pensamiento e instrucción, y está optimizado para coding agéntico, tool use de horizonte largo y automatización de oficina, según la documentación oficial de Alibaba y Groq.

La cuantización AXON MLQT introduce una innovación técnica: en lugar de usar cuantización binaria o de 2 bits convencional, representa cada peso como un trit (estado ternario -1, 0, +1) y empaqueta 5 trits en un solo byte. Dado que 3^5 = 243 estados posibles caben en los 256 valores de un byte, se alcanza una eficiencia de empaquetado del 99,06 % según la entropía de Shannon. La fórmula de empaquetado es Byte = w0 + 3w1 + 9w2 + 27w3 + 81w4. Además, el esquema 0-SKIP permite omitir en hardware las operaciones de multiplicación por peso cero, reduciendo a la mitad la latencia aritmética. La calibración se realizó sobre 496 chunks de matriz de importancia. No se menciona el uso de RLHF, DPO ni fine-tuning adicional; se trata exclusivamente de una compresión del modelo original.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.8-27B es capaz de razonamiento multi-paso y modos de pensamiento (thinking mode), y la cuantización afirma preservar el 99,2 % de la calidad lingüística y de razonamiento.
- Coding: el modelo base está optimizado para generación y edición de código, con rendimiento de nivel frontera en tareas agénticas de programación.
- Tool calling y flujos agénticos: el modelo base soporta tool use de horizonte largo y agentes multi-paso, aunque no se confirma explícitamente que esta cuantización conserve dicha funcionalidad.
- Multilingüismo: el modelo base Qwen3.8 es multilingüe, pero la model card de esta cuantización no especifica los idiomas soportados.
- Inferencia local eficiente: gracias al formato MLQT, el modelo puede ejecutarse en GPUs de consumo con 12 GB de VRAM a velocidades superiores a 50 tokens por segundo, sin offloading.
- Compatibilidad con ecosistema GGUF: funciona con llama.cpp, llama-server, Ollama y llama-cpp-python, lo que facilita su integración en aplicaciones existentes.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en un portátil con RTX 3060 (12 GB) para obtener sugerencias de código y explicaciones técnicas sin depender de servicios en la nube, gracias a su tamaño reducido y a la velocidad de 55 tokens por segundo.
- Chatbot de atención al cliente en edge: con una ventana de contexto de 16K tokens y capacidad de razonamiento, el modelo puede gestionar conversaciones multi-turno en dispositivos locales, evitando la latencia de red y garantizando la privacidad de los datos.
- Prototipado rápido de aplicaciones de IA: al caber en 6,43 GB, los equipos pueden desplegar el modelo en entornos de desarrollo y pruebas con hardware limitado, iterando sobre prompts y flujos sin necesidad de infraestructura costosa.
- Automatización de oficina: el modelo base está diseñado para tareas de automatización de oficina (generación de documentos, resúmenes, extracción de información), y esta cuantización permite ejecutarlo en estaciones de trabajo estándar.
- Razonamiento y análisis en entornos sin conexión: organizaciones con requisitos de soberanía de datos pueden ejecutar el modelo en hardware local para tareas de análisis y razonamiento, gracias a la licencia Apache-2.0 que permite uso comercial.
- Evaluación de cuantizaciones extremas: para investigadores interesados en compresión de modelos, este release sirve como caso de estudio del formato 3-trit 0-SKIP, permitiendo comparar su rendimiento frente a cuantizaciones binarias convencionales.

## Benchmarks y rendimiento

La model card incluye una tabla de mediciones empíricas realizadas por el autor en una RTX 3060 de 12 GB, comparando la cuantización MLQT con el modelo BF16 original y con cuantizaciones de Unsloth:

| Metrica | BF16 (original) | Unsloth Q4_K_M | Unsloth IQ1_S | Qwen3.8-Axon-MLQT |
|---|---|---|---|---|
| Tamano en disco | 54,70 GB | 16,50 GB | 6,19 GB | 6,43 GB |
| VRAM (contexto 16K) | 58,0 GB (OOM) | 18,5 GB (OOM) | 7,80 GB | 7,98 GB (100 % fit) |
| Velocidad (tokens/seg) | N/A | N/A (OOM) | 38,2 t/s (logica degradada) | 55,19 t/s |
| Tiempo de carga en frio | 45+ seg | 12,5 seg | 2,1 seg | 1,69 seg (Direct MMap) |
| Calidad lenguaje y razonamiento | 100 % | 99,5 % | 42,1 % (perdida severa) | 99,2 % (preservado) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) específicos para esta cuantización. El modelo base Qwen3.8-27B obtiene una puntuación de 72,51/100 en el leaderboard BenchAlign (puesto 16 de 228 modelos), según BenchLM.ai, pero ese dato corresponde al modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada: 7,98 GB con contexto de 16 384 tokens, lo que permite ejecución completa en GPUs de 12 GB y 16 GB sin offloading a CPU/RAM.
- GPUs compatibles: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), y Apple Silicon Macs con 16 GB de RAM unificada, según las pruebas del autor.
- No cabe en GPUs de 8 GB: con 7,98 GB de VRAM a 16K contexto, una GPU de 8 GB quedaría al límite o requeriría reducir el contexto.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (mediante Modelfile), llama-cpp-python, y cualquier runtime compatible con GGUF.
- Rendimiento medido: 55,19 tokens/segundo en RTX 3060 con FlashAttention activado; tiempo de carga en frío de 1,69 segundos mediante memory-mapping directo.
- Latencia: no se proporcionan datos de latencia por token individual, pero el throughput de 55 t/s implica una latencia aproximada de 18 ms por token en generación.

## Comparativa con modelos similares

La comparación más relevante es contra otras cuantizaciones del mismo modelo base, ya que no se dispone de datos de cuantizaciones equivalentes de otros modelos de 27B:

| Modelo | Tamano | VRAM (16K ctx) | Velocidad | Calidad relativa | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B BF16 | 54,70 GB | 58,0 GB (OOM) | N/A | 100 % | Apache-2.0 |
| Qwen3.8-27B Q4_K_M (Unsloth) | 16,50 GB | 18,5 GB (OOM) | N/A | 99,5 % | Apache-2.0 |
| Qwen3.8-27B IQ1_S (Unsloth) | 6,19 GB | 7,80 GB | 38,2 t/s | 42,1 % | Apache-2.0 |
| Qwen3.8-27B-Axon-MLQT | 6,43 GB | 7,98 GB | 55,19 t/s | 99,2 % | Apache-2.0 |

Frente a otras cuantizaciones extremas de modelos similares (por ejemplo, quants de 1-2 bits de Llama 3.1 8B o Mistral 7B), no hay datos comparativos publicados en la información disponible. La ventaja principal de este modelo es que logra un tamaño comparable a un quant de 1 bit pero con una retención de calidad mucho mayor, según las afirmaciones del autor.

## Limitaciones y advertencias

- Afirmaciones no verificadas de forma independiente: los datos de rendimiento (55,19 t/s, 99,2 % de retención, "zero hallucination") provienen únicamente del autor y no han sido replicados por la comunidad. El modelo tiene 0 descargas y 0 likes en HuggingFace, por lo que no hay validación externa.
- Cuantización extrema: a pesar de la retención declarada del 99,2 %, una cuantización a 1,60 bpw puede introducir degradaciones sutiles en tareas complejas de razonamiento o generación de código que no se reflejan en las métricas de perplejidad.
- Capacidades multimodales no confirmadas: el modelo base es multimodal (visión + texto), pero esta cuantización se presenta como text-generation y no se especifica si el formato GGUF conserva el procesamiento de imágenes.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo. La afirmación de "zero hallucination" debe interpretarse con cautela.
- Sesgos del modelo base: el modelo Qwen3.8-27B puede heredar sesgos de los datos de entrenamiento de Alibaba, y la cuantización no los corrige.
- Soporte limitado del formato MLQT: al ser un formato propietario, es posible que no todos los runtimes GGUF lo soporten correctamente. Se recomienda verificar la compatibilidad con la versión de llama.cpp utilizada.
- Fecha de publicación futura: el modelo fue creado el 29 de agosto de 2026, lo que puede indicar que es un lanzamiento muy reciente o experimental. Se recomienda esperar a que haya más adopción antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayPark777/Qwen3.8-27B-Axon-MLQT
- Modelo base Qwen3.8-27B en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página de benchmarks de Qwen3.8-27B en BenchLM.ai: https://benchlm.ai/models/qwen3-8-27b
- Documentación de Qwen3.8-27B en Groq: https://console.groq.com/docs/model/qwen/qwen3.8-27b
