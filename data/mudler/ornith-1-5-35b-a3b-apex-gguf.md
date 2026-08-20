# mudler/Ornith-1.5-35B-A3B-APEX-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mixture-of-experts (MoE) de tamaño medio, perteneciente a la familia Ornith-1.5 desarrollada por el equipo de ornith.ai. El modelo activa aproximadamente 3 mil millones de parámetros por token, lo que lo sitúa en una categoría de eficiencia computacional alta, y cuenta con una ventana de contexto de 262K tokens. Según los datos disponibles, supera a su competidor directo Qwen 3.6-35B en benchmarks de codificación y agentes, y también rinde por encima de modelos densos como Gemma 4-31B y Muse Glimmer-30B.

La versión GGUF publicada por mudler incluye además soporte para Multi-Token Prediction (MTP), una técnica que acelera la decodificación al predecir varios tokens a la vez. El modelo se enmarca en un enfoque de "self-improvement": Ornith-1.5 extiende el marco de auto-andamiaje de Ornith-1.0 para que el propio modelo proponga nuevas tareas, genere andamiajes específicos y produzca rollouts de soluciones para aprendizaje por refuerzo, creando así un bucle continuo de mejora.

El repositorio GGUF tiene un tamaño de 64.6 GB e incluye múltiples cuantizaciones, lo que permite desplegarlo en una variedad de hardware, desde GPUs de consumo hasta servidores profesionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer |
| Parametros totales | 34.660.610.688 (~34.7B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | GGUF (varias: Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, F16, etc., segun archivos del repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors disponibles en el repo original) |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B es un transformer con arquitectura MoE que activa solo ~3B parámetros por token, lo que reduce drásticamente el coste computacional en inferencia respecto a un modelo denso de tamaño equivalente. La familia Ornith-1.5 introduce un bucle de auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de soluciones que se utilizan para aprendizaje por refuerzo. Este proceso continuo genera nuevas experiencias de aprendizaje a partir de las cuales el modelo mejora iterativamente.

El entrenamiento combina fases de preentrenamiento y ajuste fino con refuerzo, aunque no se han publicado detalles exactos sobre el número de tokens de entrenamiento ni la composición del dataset. La variante APEX en el nombre del repositorio sugiere una optimización adicional para rendimiento en entornos de producción, y el soporte MTP (Multi-Token Prediction) permite decodificación especulativa para reducir la latencia.

## Capacidades

- Generación de texto y razonamiento de propósito general.
- Codificación de software: supera a Qwen 3.6-35B en benchmarks de codificación.
- Capacidades de agente: rendimiento superior en benchmarks de agentes frente a modelos similares.
- Razonamiento multi-step y soporte para tareas complejas.
- Ventana de contexto larga (262K tokens) para procesamiento de documentos extensos y conversaciones multi-turno.
- Soporte de decodificación especulativa mediante MTP (Multi-Token Prediction) en la versión GGUF.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no confirmado explícitamente, pero implícito por su rendimiento en benchmarks de agentes.

## Casos de uso

- Asistentes de codigo en IDE: el modelo puede integrarse en editores como VS Code o JetBrains para autocompletado y generación de funciones, aprovechando su bajo coste por token (~3B activos) para respuestas rápidas en tiempo real.
- Agentes autonomos de desarrollo: gracias a su rendimiento en benchmarks de agentes, puede orquestar flujos multi-paso como crear archivos, ejecutar tests y corregir errores de forma autónoma.
- Analisis de repositorios completos: con 262K tokens de contexto, puede procesar un repositorio de tamaño medio en una sola pasada, resumiendo arquitectura, detectando deuda técnica o generando documentación.
- Atencion al cliente con historial largo: la ventana de 262K tokens permite mantener conversaciones con decenas de turnos y adjuntos extensos sin perder el hilo.
- Procesamiento de documentos legales o academicos: puede resumir, extraer cláusulas o comparar secciones de documentos de cientos de páginas en una sola consulta.
- Generacion de datos sinteticos para entrenamiento: el bucle de auto-mejora del modelo puede utilizarse para generar tareas y soluciones que alimenten otros modelos o pipelines de RL.
- Despliegue en entornos con recursos limitados: al activar solo ~3B parámetros, cabe en GPUs de consumo con cuantización adecuada, permitiendo inferencia local en estaciones de trabajo.

## Benchmarks y rendimiento

Según la información disponible, Ornith-1.5-35B-A3B obtiene una puntuación de 49.27/100 en el leaderboard público de BenchLM.ai, ocupando la posición #134 de 221 modelos. No se han publicado resultados detallados de benchmarks específicos (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada. La documentación del modelo indica que supera a Qwen 3.6-35B en benchmarks de codificación y agentes, y que rinde mejor que Gemma 4-31B y Muse Glimmer-30B, pero no se incluyen cifras concretas.

| Benchmark | Ornith-1.5-35B-A3B | Qwen 3.6-35B | Gemma 4-31B |
|---|---|---|---|
| Codificacion | superior (sin cifra) | inferior | no comparable |
| Agentes | superior (sin cifra) | inferior | no comparable |
| Leaderboard BenchLM | 49.27/100 (#134) | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Con Q4_K_M (~20-22 GB), cabe en una RTX 3090/4090 (24 GB). Con Q8_0 (~35 GB), requiere una GPU de 40 GB o más (A100 40GB, A6000).
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100, L40S, A6000.
- Si cabe en consumer GPU: sí, con cuantizaciones Q4 o inferiores en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI, LM Studio, o el endpoint compatible indicado en los tags del repositorio.
- Latencia y throughput: no disponibles. El modo MTP reduce la latencia de decodificación, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 34.7B | ~3B | 262K | no disponible | GGUF, safetensors |
| Qwen 3.6-35B | ~35B | no disponible | no disponible | no disponible | no disponible |
| Gemma 4-31B | ~31B | denso | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | ~30B | denso | no disponible | no disponible | no disponible |

Según la documentación del modelo, Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en codificación y agentes, y a Gemma 4-31B y Muse Glimmer-30B por un margen amplio, aunque no se aportan cifras exactas.

## Limitaciones y advertencias

- No se ha publicado la licencia del modelo, lo que impide verificar si su uso comercial está permitido. Es necesario contactar con los desarrolladores antes de usarlo en producción.
- No se han publicado detalles sobre sesgos o alucinaciones. Al ser un modelo de ~35B, es probable que presente alucinaciones en tareas de alta precisión.
- La información sobre idiomas soportados no está disponible; el rendimiento en español u otros idiomas distintos del inglés no está verificado.
- El repositorio GGUF tiene 0 descargas, lo que sugiere que es una publicación reciente o poco probada. Se recomienda validar el modelo en un entorno de pruebas antes de adoptarlo.
- La puntuación en BenchLM (49.27/100) es modesta en términos absolutos, aunque el ranking relativo (#134 de 221) indica que hay muchos modelos por encima.
- No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K), lo que dificulta una evaluación objetiva frente a otros modelos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mudler/Ornith-1.5-35B-A3B-APEX-GGUF
- Repositorio GGUF con MTP: https://huggingface.co/mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF
- Version Ornith-1.0 GGUF: https://huggingface.co/mudler/Ornith-1.0-35B-APEX-GGUF
- Pagina oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Benchmarks y contexto en BenchLM: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Imagen Docker: https://hub.docker.com/r/ai/ornith-1.5
