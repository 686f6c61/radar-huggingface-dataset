# Irfanuruchi/Qwen3-4B-Computer-Science-OpenVINO-INT8

## Resumen

Qwen3-4B-Computer-Science-OpenVINO-INT8 es una conversión de despliegue del checkpoint ajustado Irfanuruchi/Qwen3-4B-Computer-Science, un fine-tuning de Qwen3-4B orientado a generación de código y explicaciones de ciencias de la computación. Lo publica el usuario Irfanuruchi y no introduce entrenamiento adicional: se limita a exportar los pesos BF16 originales a formato OpenVINO Intermediate Representation (IR) con compresión de pesos INT8 asimétrica por canal, usando Optimum Intel y NNCF sobre OpenVINO 2026.4.

El interés del artefacto es práctico: permite ejecutar un modelo de ~4.000 millones de parámetros en CPU Intel con un tamaño en disco de aproximadamente 3,8 GB, frente a los ~7,6 GB de la variante FP16. El autor reporta una mejora de throughput de aproximadamente 2,04 veces en su equipo de pruebas (Intel Core Ultra 9 275HX), lo que lo hace atractivo para inferencia local en portátiles y estaciones de trabajo sin GPU dedicada.

La relevancia es limitada pero concreta: no es un modelo nuevo ni un avance de investigación, sino un empaquetado de despliegue para hardware Intel, con validación funcional mínima y sin evaluación de benchmarks estandarizados. Debe tratarse como una variante de inferencia del checkpoint base, no como un modelo con capacidades propias distintas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-4B (transformer decoder-only, según el checkpoint base) |
| Parametros totales | ~4B |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card; fuentes de terceros indican 40K para el checkpoint base |
| Tipos de cuantizacion | INT8 asimétrica, per-channel (pesos); exportación disponible también en INT4 y FP16 en repositorios hermanos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (comprimido con NNCF); checkpoint fuente en BF16 |
| Tamano del repositorio | ~4,0 GB (modelo comprimido ~3,8 GB) |
| Framework de inferencia | OpenVINO 2026.4 + Optimum Intel |
| Cobertura de compresion | 253/253 capas elegibles (100%) |
| Modelo base | Irfanuruchi/Qwen3-4B-Computer-Science (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer decoder-only de aproximadamente 4.000 millones de parámetros. La model card no detalla la composición del dataset de preentrenamiento ni del fine-tuning, ni confirma si se aplicaron fases de RLHF o DPO. El fine-tuning específico (Qwen3-4B-Computer-Science) está orientado, según los tags del repositorio, a code-generation, computer-science y software-engineering, pero no se publican cifras de tokens de entrenamiento ni de mezcla de datos.

La innovación técnica de este repositorio no está en el modelo sino en el pipeline de exportación: `optimum-cli export openvino` con `--task text-generation-with-past` y `--weight-format int8`, seguido de compresión NNCF con cuantización asimétrica por canal sobre el 100% de las capas elegibles (253 de 253). Es importante subrayar la advertencia del propio autor: la compresión afecta a los pesos elegibles, no implica que todas las operaciones ni las activaciones se ejecuten en INT8. No se realizó fine-tuning adicional durante la exportación.

## Capacidades

- Generación de texto y código en el dominio de programación y ciencias de la computación, según el fine-tuning del checkpoint base.
- Explicación de algoritmos y análisis de complejidad: la validación funcional del autor muestra la generación de una función `is_prime` con `math.isqrt`, eliminación de pares e iteración sobre divisores impares, con análisis de complejidad O(sqrt(n)) en tiempo y O(1) en espacio.
- Asistencia a la depuración y a la enseñanza de informática, según la sección de uso previsto.
- Modo thinking desactivable: el ejemplo de inferencia usa `enable_thinking=False` en la plantilla de chat, lo que sugiere que el modelo base Qwen3 soporta modo de razonamiento explícito, aunque no se documenta su comportamiento en esta variante.
- Conversacional multi-turno mediante `apply_chat_template` con roles de sistema, usuario y asistente.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión y audio: no disponibles; el pipeline es text-generation.

## Casos de uso

- Asistencia a la programación en local sin GPU: el modelo cabe en ~3,8 GB en disco y se ejecuta en CPU Intel con OpenVINO, lo que permite usarlo en portátiles para autocompletar funciones, generar tests y explicar fragmentos de código sin conexión a servicios en la nube.
- Enseñanza de algoritmos y estructuras de datos: el fine-tuning está orientado a ciencias de la computación y el smoke test del autor demuestra generación de implementaciones correctas con análisis de complejidad, útil en entornos educativos o de autoaprendizaje.
- Explicación de complejidad computacional: el modelo produce justificaciones de tiempo y espacio (por ejemplo, O(sqrt(n)) y O(1) para primalidad), aprovechable en herramientas de documentación técnica.
- Depuración asistida en el editor: con una ventana de contexto de decenas de miles de tokens (40K según fuentes de terceros para el checkpoint base), puede recibir varios ficheros de un proyecto pequeño y señalar errores lógicos.
- Experimentación con despliegue OpenVINO en hardware Intel: sirve como banco de pruebas para validar pipelines de Optimum Intel y NNCF en CPU, GPU o NPU (aunque solo la CPU está validada por el autor).
- Generación de código en pipelines de integración continua con requisitos de privacidad: al ejecutarse en local y con licencia Apache 2.0, puede integrarse en flujos internos donde el código no debe salir de la infraestructura.
- Prototipado de asistentes de documentación técnica: con decodificación greedy y `max_new_tokens` moderados, encaja en tareas de resumen y generación de docstrings sobre código fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta mediciones de throughput end-to-end en su equipo de pruebas, que no constituyen una evaluación de calidad del modelo.

| Configuracion | Tokens generados | Tiempo | Throughput |
|---|---:|---:|---:|
| Batería, modo ahorro de energía | 160 | 26,08 s | 6,14 tok/s |
| Corriente alterna, modo rendimiento | 160 | 10,17 s | 15,73 tok/s |

| Precision | Tamano del modelo | Throughput (CPU) |
|---|---:|---:|
| INT8 | ~3,8 GB | 15,73 tok/s |
| FP16 | ~7,6 GB | 7,70 tok/s |

El autor advierte que la prueba con batería no usó los mismos ajustes de calentamiento y ejecución que la de corriente alterna, y que las cifras son mediciones individuales end-to-end, no benchmarks estadísticamente controlados; el throughput incluye sobrecarga de generación y no debe interpretarse como velocidad de decodificación en estado estacionario. La prueba en corriente alterna usó Intel Core Ultra 9 275HX, OpenVINO CPU backend, perfil de rendimiento, hint `LATENCY`, calentamiento de 16 tokens, decodificación greedy y 160 tokens generados.

## Requisitos de hardware

- VRAM estimada: no aplica para la ruta validada (CPU). Para GPU, no disponible; el modelo en INT8 ocupa ~3,8 GB, por lo que cabría en GPUs consumer con 6-8 GB o más, aunque el autor no lo ha validado.
- GPU recomendadas: no disponible. El autor solo valida CPU Intel; OpenVINO detectó CPU, GPU y NPU en el equipo de pruebas, pero GPU y NPU no se probaron con este modelo exportado.
- CPU validada: Intel Core Ultra 9 275HX (ASUS ROG Strix G16), con OpenVINO 2026.4 y Python 3.14 sobre IULinux.
- Cabe en hardware consumer: sí, en CPU Intel modernas; el tamaño de ~3,8 GB lo hace viable en portátiles convencionales.
- Opciones de despliegue: OpenVINO Runtime con Optimum Intel (`OVModelForCausalLM`), configurando `device="CPU"` y `ov_config={"PERFORMANCE_HINT": "LATENCY"}`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI para este formato IR.
- Latencia y throughput: 15,73 tok/s en corriente alterna con perfil de rendimiento y 6,14 tok/s en batería con modo ahorro, según mediciones individuales del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Computer-Science-OpenVINO-INT8 (este) | ~4B | no disponible (40K según terceros) | OpenVINO IR INT8, ~3,8 GB | Apache 2.0 | Validado solo en CPU Intel; 15,73 tok/s |
| Qwen3-4B-Computer-Science-OpenVINO-FP16 | ~4B | no disponible | OpenVINO IR FP16, ~7,6 GB | Apache 2.0 | Mismo checkpoint; 7,70 tok/s en la misma CPU |
| Qwen3-4B-Computer-Science-OpenVINO-INT4 | ~4B | no disponible | OpenVINO IR INT4 | Apache 2.0 | Variante más comprimida; sin cifras de rendimiento en la información disponible |
| Qwen3-4B-Computer-Science (BF16) | ~4B | no disponible | Safetensors BF16 | Apache 2.0 | Checkpoint fuente; sin cuantización |

No se dispone de datos de benchmarks que permitan comparar calidad frente a otros modelos de ~4B; la comparativa se limita a variantes de precisión del mismo checkpoint.

## Limitaciones y advertencias

- La compresión INT8 puede alterar las salidas respecto al modelo BF16 original; el autor lo señala explícitamente y no cuantifica la degradación.
- No hay evaluación exhaustiva de precisión: la única validación funcional es un smoke test con una función de primalidad, insuficiente para garantizar corrección en producción.
- Sesgos conocidos: no disponible; la model card no documenta análisis de sesgo.
- Riesgo de alucinación: no cuantificado, pero aplicable a cualquier modelo de ~4B sin evaluación publicada; conviene verificar el código generado con tests.
- Limitaciones de contexto e idioma: la model card no declara longitud de contexto ni idiomas soportados; la cifra de 40K proviene de una fuente de terceros y no está confirmada por el autor.
- La compresión cubre el 100% de las capas elegibles (253/253), pero no implica que todas las operaciones ni activaciones se ejecuten en INT8.
- Solo se ha validado la inferencia en CPU; GPU y NPU quedan sin probar con este export.
- Las cifras de rendimiento son mediciones individuales no controladas estadísticamente y no deben extrapolarse a otras cargas o equipos.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse los avisos de licencia y atribución correspondientes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción ni mantenimiento por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Irfanuruchi/Qwen3-4B-Computer-Science-OpenVINO-INT8
- Checkpoint base BF16: https://huggingface.co/Irfanuruchi/Qwen3-4B-Computer-Science
- Variante OpenVINO INT4: https://huggingface.co/Irfanuruchi/Qwen3-4B-Computer-Science-OpenVINO-INT4
- Variante OpenVINO FP16: https://huggingface.co/Irfanuruchi/Qwen3-4B-Computer-Science-OpenVINO-FP16
- Repositorio de modelos del autor: https://huggingface.co/Irfanuruchi/Qwen3-4B-Computer-Science-Models
- Ficha en LLM Explorer: https://llm-explorer.com/model/Irfanuruchi%2FQwen3-4B-Computer-Science,3Tj6XwnwotV9dTkhEZb0tE
