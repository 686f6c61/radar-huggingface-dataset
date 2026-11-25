# sigmanih/openbmb-MiniCPM5-2B-MLX-GGUF-Q4_K_M

## Resumen
Este repositorio contiene una cuantización GGUF Q4_K_M del modelo openbmb/MiniCPM5-2B-MLX, publicada por el usuario sigmanih a través de su herramienta Sigma Studio. Se trata de un modelo conversacional de aproximadamente 2.500 millones de parámetros (2.516.756.480 según los pesos en safetensors del modelo base) con arquitectura de tipo Llama, 42 capas y una dimensión oculta de 2048. El resultado es un artefacto de 1,6 GB de repositorio (1,45 GB de pesos) pensado para inferencia eficiente en CPU y GPU de gama baja mediante llama.cpp.

La relevancia de esta publicación es práctica: empaqueta un modelo de 2B en un formato GGUF Q4_K_M con una ventana de contexto declarada de 131.072 tokens, lo que permite desplegarlo en equipos con 6-8 GB de VRAM o incluso en modo CPU/híbrido con unos 2,2 GB de RAM. El autor declara compatibilidad con endpoints y con el motor SigmaEngine, además de una evaluación propia de benchmarks y de un protocolo de tool calling en sandbox.

Conviene subrayar que se trata de una cuantización de terceros, no del modelo oficial de OpenBMB, y que los datos de rendimiento provienen de la model card del publicador, medida sobre subconjuntos de los benchmarks y no sobre las suites completas. La licencia figura como "other", lo que exige verificar los términos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer denso), 42 capas, hidden size 2048 |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (según model card del publicador) |
| Tipos de cuantizacion | GGUF Q4_K_M (única variante en este repositorio) |
| Idiomas soportados | en, it |
| Licencia | other (verificar licencia del modelo base openbmb/MiniCPM5-2B-MLX) |
| Formato de pesos | GGUF (Q4_K_M); el modelo base en safetensors |
| Tamano del repositorio | 1,6 GB (1,45 GB de pesos) |
| Uso de memoria | ~2,4 GB VRAM con offload completo a GPU; ~2,2 GB RAM en CPU/híbrido |
| Hardware recomendado | GPU de 6-8 GB VRAM o 16 GB de RAM de sistema |
| Pipeline | text-generation |
| Descargas / likes | 330 / 1 |

## Arquitectura y entrenamiento
La arquitectura es un transformer denso de tipo Llama con 42 capas y dimensión oculta de 2048, según declara el publicador. No se trata de un modelo MoE ni híbrido SSM: no hay parámetros activos que reportar porque todos los parámetros participan en cada forward pass. El contexto declarado alcanza los 131.072 tokens, un valor notable para un modelo de este tamaño, aunque no se documenta en la información disponible la técnica de extensión de contexto empleada ni si el modelo base fue entrenado nativamente con esa longitud.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias en el modelo base. La model card del publicador no aporta información sobre el proceso de entrenamiento original de OpenBMB; solo describe el proceso de cuantización y publicación mediante Sigma Studio y el motor SigmaEngine. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El único dato técnico diferencial es la cuantización Q4_K_M, que reduce el peso a 1,45 GB manteniendo una calidad razonable para el tamaño del modelo.

## Capacidades
- Generación de texto conversacional multi-turno, con soporte declarado de contexto largo de hasta 131.072 tokens.
- Razonamiento en dos modos: respuesta directa ("No-Thinking") y cadena de pensamiento ("Deep Thinking" / CoT), con una mejora declarada de +5,5 puntos porcentuales en el modo CoT.
- Generación de código en Python, con resultados declarados en HumanEval (pass@1) y MBPP.
- Razonamiento matemático multi-paso, con resultados declarados en GSM8K y MATH.
- Tool calling y adherencia a protocolos de herramientas: el publicador reporta un 77,2% de cumplimiento de criterios analíticos en un sandbox de agentes.
- Ejecución autónoma de tareas multi-paso en entornos aislados (completado del 50% de los escenarios del sandbox).
- Capacidades multilingües limitadas a inglés e italiano según los metadatos del repositorio.
- Compatibilidad con endpoints y con el motor SigmaEngine, además de llama.cpp por el formato GGUF.

## Casos de uso
- Agentes conversacionales en dispositivos de borde: con 1,45 GB de pesos y ~2,2 GB de RAM en modo CPU, el modelo puede ejecutarse en mini-PC, Raspberry Pi de gama alta o portátiles sin GPU dedicada para asistentes de voz en tiempo real.
- Atención al cliente automatizada: la ventana de 131.072 tokens permite mantener conversaciones multi-turno con historial extenso y documentos de referencia adjuntos sin truncar el contexto.
- Generación de código en pipelines de CI/CD: el soporte de tool calling y los resultados declarados en HumanEval (86%) y MBPP (89%) lo hacen apto para tareas de autocompletado, generación de tests y revisión automatizada en entornos con recursos limitados.
- Automatización de tareas de sistema de archivos en sandbox: el publicador valida escenarios de manipulación de ficheros con un 100% de contención en el sandbox, útil para agentes de operaciones controladas.
- Prototipado rápido de asistentes con razonamiento: el modo CoT permite alternar entre respuestas de baja latencia y razonamiento paso a paso según la complejidad de la consulta, sin cambiar de modelo.
- Educación y tutoría automatizada: con resultados declarados del 100% en GSM8K y 67% en MATH, puede resolver y explicar problemas de matemáticas de nivel escolar y competición en inglés e italiano.
- Despliegue en entornos con GPU de gama baja: con ~2,4 GB de VRAM en offload completo, cabe en tarjetas de 6-8 GB (RTX 3060, RTX 4060, GTX 1660) y permite servir varias instancias en una sola GPU.

## Benchmarks y rendimiento
Los siguientes datos provienen de la model card del publicador (Sigma Studio Training Lab, seed 42, temperatura 0.0) y fueron medidos sobre subconjuntos de cada suite, no sobre el conjunto completo. No son directamente comparables con ejecuciones de suite completa.

| Benchmark | Dominio | Correctos / Total | Precisión |
|---|---|---|---|
| ARC-Challenge | Razonamiento científico | 5 / 9 | 56% |
| BIG-Bench Hard | Lógica multi-tarea | 5 / 7 | 71% |
| GPQA | Razonamiento académico de posgrado | 1 / 9 | 11% |
| GSM8K | Matemáticas escolares multi-paso | 9 / 9 | 100% |
| HellaSwag | Sentido común y NLI situacional | 2 / 9 | 22% |
| HumanEval | Código Python (pass@1) | 6 / 7 | 86% |
| MATH | Matemáticas de competición | 6 / 9 | 67% |
| MBPP | Programación Python con tests | 8 / 9 | 89% |
| MMLU | Conocimiento general multi-materia | 6 / 14 | 43% |
| MMLU-Pro | Razonamiento avanzado multi-paso | 4 / 9 | 44% |
| TruthfulQA | Factualidad y anti-alucinación | 3 / 9 | 33% |
| Total | Todas las suites evaluadas | 55 / 100 | 55% |

Comparativa de modos de razonamiento declarada por el publicador:

| Modo | Precisión | Preguntas superadas | Perfil |
|---|---|---|---|
| No-Thinking (respuesta directa) | 52,6% | 30 / 57 | Latencia mínima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 58,1% | 25 / 43 | Razonamiento multi-paso, +5,5 puntos |

Evaluación del protocolo de agentes en sandbox:

| Métrica | Resultado | Detalle |
|---|---|---|
| Adherencia al protocolo de herramientas | 77,2% | 71/92 criterios analíticos verificados |
| Completado autónomo de tareas | 50,0% | 4/8 escenarios con fichero objetivo exacto |
| Contención en sandbox | 100% | Cero intentos de escape del workspace |
| Eficiencia de ejecución | 67 turnos (393,2 s) | Uso óptimo de turnos y tokens |

## Requisitos de hardware
- VRAM estimada: ~2,4 GB con offload completo a GPU en Q4_K_M; ~2,2 GB de RAM en modo CPU o híbrido.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM, como RTX 3060, RTX 4060, GTX 1660 Super o superiores. En A100/H100 el modelo ocupa una fracción mínima de memoria y permite batchear muchas instancias.
- Cabe en GPU de consumo: sí, en tarjetas de 6 GB o más con offload completo; también en modo CPU puro con 16 GB de RAM de sistema.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, servidores compatibles con endpoints, y el motor SigmaEngine del publicador.
- Latencia y throughput: no se han publicado mediciones de tokens por segundo en la información disponible. El publicador reporta 393,2 segundos para 67 turnos en la evaluación de agentes, pero sin desglose de tokens generados.

## Comparativa con modelos similares
No se dispone de datos de benchmarks verificables de los modelos comparables en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| openbmb-MiniCPM5-2B-MLX-GGUF-Q4_K_M (este) | ~2,5B | 131.072 | other | GGUF Q4_K_M | Hugging Face |
| openbmb/MiniCPM5-2B-MLX (base) | ~2,5B | no disponible | other | safetensors | Hugging Face |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 | Apache-2.0 | safetensors, GGUF | Hugging Face |
| Llama-3.2-1B-Instruct | ~1,2B | 131.072 | Llama 3.2 Community | safetensors, GGUF | Hugging Face |

Los datos de contexto y licencia de los modelos alternativos corresponden a sus especificaciones públicas habituales; no se dispone de comparación de rendimiento verificable frente a este modelo en la información proporcionada.

## Limitaciones y advertencias
- Es una cuantización de terceros: la calidad puede diferir del modelo base en safetensors, especialmente en tareas sensibles a la precisión numérica como matemáticas o código.
- Los benchmarks publicados se midieron sobre subconjuntos pequeños (entre 7 y 14 preguntas por suite) y el propio publicador advierte que no son comparables con ejecuciones de suite completa. Los resultados tienen alta varianza estadística.
- GPQA (11%), HellaSwag (22%) y TruthfulQA (33%) muestran debilidades claras en razonamiento académico avanzado, sentido común y factualidad, lo que eleva el riesgo de alucinación en dominios especializados.
- Idiomas soportados limitados a inglés e italiano según los metadatos; no hay evidencia de buen rendimiento en castellano.
- La licencia figura como "other": es imprescindible revisar los términos del modelo base openbmb/MiniCPM5-2B-MLX antes de uso comercial. El badge Apache-2.0 de la model card hace referencia a la herramienta Sigma Studio, no necesariamente al modelo.
- El contexto declarado de 131.072 tokens no está verificado de forma independiente; el rendimiento real en contextos muy largos puede degradarse.
- El modelo base se distribuye con el sufijo "MLX", lo que sugiere un origen orientado a Apple Silicon; la cuantización GGUF busca ampliar la compatibilidad, pero no se documenta el proceso de conversión ni posibles pérdidas.
- El repositorio tiene solo 330 descargas y 1 like, sin validación independiente de la comunidad.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/sigmanih/openbmb-MiniCPM5-2B-MLX-GGUF-Q4_K_M
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-MLX
- Repositorio Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Perfil del publicador: https://huggingface.co/sigmanih
- Licencia Apache-2.0 (referenciada en la model card): https://opensource.org/licenses/Apache-2.0
