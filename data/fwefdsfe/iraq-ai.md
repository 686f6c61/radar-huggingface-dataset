# fwefdsfe/Iraq-AI

## Resumen

Iraq-AI es un modelo de lenguaje de tipo text-generation publicado por el usuario fwefdsfe en Hugging Face, derivado del checkpoint RikiyaT/Qwen3.5-0.8B-weight-space-programming, que a su vez se apoya en la familia Qwen3.5. El modelo declara 752.393.024 parámetros totales según los pesos en safetensors y se distribuye bajo licencia Apache 2.0, con etiquetas que apuntan a casos de uso de seguridad, código, matemáticas y razonamiento.

La model card del autor lo presenta como un agente autónomo de ingeniería de software y seguridad, entrenado con refuerzo multiorigen sobre SWE-Gym, CyberGym-E2E y NIST SARD, e incorpora referencias a arquitecturas como DeepSeek MLA/MTP y a la verificación basada en reglas de Kimi K3.1. Estas afirmaciones proceden exclusivamente de la documentación del autor y no están respaldadas por artefactos verificables en la información disponible.

Su relevancia potencial radica en el tamaño reducido (menos de 1.000 millones de parámetros) y en la promesa de ejecución en CPU con un consumo de memoria inferior a 1 GB, lo que lo situaría en la categoría de modelos pequeños desplegables en hardware de consumo. No obstante, la mayor parte de las métricas declaradas (puntuaciones compuestas, HumanEval al 100 %, throughput de 27,4 tokens/s) carecen de metodología pública y deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5); el autor menciona DeepSeek MLA/MTP, no verificado |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors y GGUF (según tags del repositorio); niveles concretos no disponibles |
| Idiomas soportados | inglés y árabe (según metadatos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo se describe como un transformer decoder-only de 0,8B parámetros construido sobre Qwen3.5, con un proceso de "weight-space programming" heredado del checkpoint base RikiyaT/Qwen3.5-0.8B-weight-space-programming. El autor afirma haber aplicado aprendizaje por refuerzo multiorigen sobre SWE-Gym (Apple ML Research), CyberGym-E2E (UC Berkeley Sunblaze Lab) y NIST SARD, así como verificación basada en reglas (RLVR) inspirada en Kimi K3.1 y atención multi-cabeza latente (MLA) de DeepSeek. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de SFT, RLHF o DPO documentadas.

La información disponible no permite verificar ninguna de estas innovaciones técnicas: no se publican configuraciones de atención, detalles de la decodificación especulativa ni métricas de entrenamiento. Los tags del repositorio incluyen `deepseek-mla`, `kimi-rlvr`, `swe-gym` y `cybergym`, pero se trata de etiquetas declarativas, no de evidencia de implementación.

## Capacidades

- Generación de texto conversacional con plantilla de chat estilo ChatML (`<|im_start|>` / `<|im_end|>`).
- Razonamiento y resolución de problemas matemáticos, según la model card.
- Generación y auditoría de código, con especial énfasis declarado en Python y sistemas.
- Diagnóstico de vulnerabilidades y parcheo de CVE, según el autor (CyberGym, NIST SARD).
- Fluidez técnica en árabe e inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: declarado por el autor, sin detalles técnicos.
- Modo thinking explícito, visión o audio: no disponible.

## Casos de uso

- Auditoría de código en local: el modelo podría emplearse para revisar fragmentos de código en busca de patrones de vulnerabilidad (CWE) en entornos sin conectividad, aprovechando su tamaño reducido y su ejecución en CPU.
- Asistencia a desarrolladores en terminal: integrado en herramientas CLI mediante llama.cpp u Ollama, serviría para explicar errores de compilación o sugerir parches en proyectos pequeños.
- Formación en seguridad: uso como tutor para explicar conceptos de CVE, CWE y triaje de fallos, dado el enfoque declarado del modelo en ciberseguridad.
- Prototipado rápido en hardware de consumo: al caber en menos de 1 GB de RAM según el autor, permitiría desplegar un chatbot técnico en equipos sin GPU dedicada.
- Soporte técnico bilingüe inglés-árabe: atención a usuarios en ambos idiomas para consultas de documentación técnica o resolución de dudas sobre APIs.
- Generación de ejercicios de programación: creación de problemas de algoritmia y matemáticas con soluciones paso a paso para plataformas educativas.
- Preprocesado en pipelines de CI/CD: clasificación o resumen de informes de fallos y logs, siempre que se valide la calidad de salida antes de automatizar acciones.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor y no incluyen metodología, tamaño de muestra ni comparación con evaluaciones estándar. Se reproducen tal cual, con la advertencia de que no son verificables de forma independiente.

| Benchmark | Tarea | Puntuación declarada |
|---|---|---|
| Algorithms & Programming | Búsqueda binaria en Python y código de sistemas | 10,0 / 10,0 |
| Computer Science & Systems | Memoria virtual, TLB y localidad | 9,6 / 10,0 |
| Software Defense (CyberGym) | Parcheo de CVE y triaje de CWE | 9,5 / 10,0 |
| Mathematics & Algebra | Resolución de ecuaciones y razonamiento paso a paso | 9,0 / 10,0 |
| Arabic Technical Fluency | Explicaciones técnicas en árabe | 8,8 / 10,0 |
| Composite Score | Métrica propia "AAA 2026 Studio" | 9,38 / 10,0 |
| HumanEval | Validez sintáctica en Python | 100 % |
| Throughput | CPU AVX2 | 27,4 tokens/s |
| RAM de inferencia | Huella de memoria | < 0,95 GB |

No se han publicado resultados en benchmarks estándar reconocidos (MMLU, GSM8K, HumanEval con pass@1, SWE-bench) con protocolo verificable en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 2 GB en fp16 para los 752 M de parámetros; en cuantización de 4 bits, por debajo de 1 GB, en línea con la cifra de "< 0,95 GB" declarada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, GTX 1660). El autor cita una RX 6600 como referencia de estabilidad.
- CPU: ejecutable en CPU con instrucciones AVX2; el autor reporta 27,4 tokens/s en un Ryzen 5 5600.
- Despliegue: transformers (con `trust_remote_code=True`), llama.cpp y Ollama por la disponibilidad de GGUF; vLLM y TGI no están confirmados para esta arquitectura.
- Latencia y throughput: solo el dato declarado por el autor (27,4 tokens/s en CPU); no hay mediciones independientes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Iraq-AI | 752 M | no disponible | Apache 2.0 | Hugging Face (1.145 descargas) |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Qwen2.5-1.5B | 1.540 M | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado |
| SmolLM2-1.7B | 1.700 M | 8.192 tokens | Apache 2.0 | Hugging Face |

La comparación con Qwen3.5-0.8B (modelo base declarado) no está disponible porque no se han encontrado datos verificables de esa familia en la información proporcionada. Iraq-AI no publica resultados en benchmarks estándar que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- Las puntuaciones de benchmark de la model card (9,38/10 compuesto, HumanEval 100 %) no incluyen metodología ni reproducibilidad; deben considerarse afirmaciones no verificadas.
- El modelo es un fine-tune de un checkpoint de terceros (RikiyaT/Qwen3.5-0.8B-weight-space-programming); la procedencia exacta de los pesos base no está documentada.
- Riesgo elevado de alucinación en tareas de seguridad: un modelo de 0,8B no dispone de la capacidad de razonamiento profundo necesaria para auditar código en producción de forma fiable.
- Idiomas: solo inglés y árabe declarados; el rendimiento en castellano no está evaluado y probablemente sea limitado.
- Longitud de contexto desconocida, lo que impide planificar su uso en tareas que requieran ventanas largas.
- El repositorio tiene 12,9 GB para 752 M de parámetros, un tamaño desproporcionado que sugiere múltiples formatos de pesos o artefactos adicionales; conviene revisar el contenido antes de descargarlo.
- Uso comercial permitido por Apache 2.0, pero sin garantías del autor sobre exactitud, seguridad o idoneidad para producción.
- No hay evidencia de soporte de tool calling ni de integración con frameworks de agentes más allá de la declaración del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fwefdsfe/Iraq-AI
- Modelo base: https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming
- SWE-Gym (Apple ML Research): https://github.com/SWE-Gym/SWE-Gym
- CyberGym (UC Berkeley): https://cybergym.lab.now
- NIST SARD: https://samate.nist.gov/SARD
- DeepSeek MLA (paper): https://arxiv.org/abs/2405.04434
