# Joakimpalm-Zen/Qwen3-Coder-30B-A3B-Instruct-keep120-Q4_K_M-GGUF

## Resumen

Este modelo es un derivado estructural de Qwen3-Coder-30B-A3B-Instruct, el modelo de código de Qwen con arquitectura MoE que activa 3.300 millones de parámetros de un total de 28.700 millones. La modificación principal consiste en la poda de 8 expertos por capa (de 128 a 120) en cada bloque MoE, seleccionados a partir de datos de routing medidos sobre un corpus de evaluación mixto. El resultado se distribuye en formato GGUF cuantizado Q4_K_M, con un tamaño de archivo de 17,5 GB.

El artefacto está diseñado para servirse con xyntetik-runner, un motor de inferencia C11 de un solo binario (CPU, CUDA, Metal) que implementa recuperación de truncamiento forzado: cuando una llamada de herramienta supera su presupuesto de tokens, el motor cierra el documento JSON de forma legal para que los argumentos sigan siendo parseables. Esta característica es especialmente relevante para agentes locales con contexto limitado y generación lenta, donde los motores convencionales (vLLM, llama.cpp, Ollama) devuelven llamadas vacías o malformadas al truncarse.

La licencia es Apache 2.0, verificada sobre el repositorio base, lo que permite uso comercial sin restricciones adicionales. El archivo GGUF declara el número reducido de expertos en sus metadatos, por lo que un runtime que resuelva `num_experts` desde el archivo lo cargará sin cambios; uno que asuma 128 expertos fallará, lo cual es un comportamiento intencionado para validar la compatibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3moe), transformer con routing top-8 |
| Parametros totales | 28.719.396.864 (28,7 B) |
| Parametros activos | 3,3 B (por token) |
| Longitud de contexto | no disponible (el modelo base Qwen3-Coder-30B-A3B-Instruct soporta 32 768 tokens, pero no se confirma en este artefacto) |
| Tipos de cuantizacion | Q4_K_M (expertos en Q4_K / Q6_K nativos, sin requantizar) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Coder-30B-A3B-Instruct es un transformer MoE con 128 expertos por capa y routing top-8, entrenado por Qwen para tareas de código y agente. Este derivado no es un reentrenamiento ni un fine-tuning: es una modificación estructural que poda 8 expertos por capa (de 128 a 120) basándose en datos de routing medidos con el trazador MoE del runner (`RUNNER_MOE_TRACE`). Los tensores de los expertos restantes se conservan en su precisión nativa Q4_K/Q6_K, sin requantizar, y el routing top-8 se mantiene intacto.

El proceso de poda se documenta como reproducible: se ejecuta el modelo sin podar sobre un corpus de evaluación mixto, se registra el routing de cada token, y se eliminan los expertos con menor utilización. No hay información sobre datos de entrenamiento adicionales, RLHF o DPO aplicados a este derivado; las capacidades son heredadas del modelo base.

## Capacidades

- Generación de código y razonamiento técnico, heredadas del modelo base Qwen3-Coder-30B-A3B-Instruct.
- Soporte de tool calling / function calling con formato OpenAI-compatible.
- Capacidad de agente multi-paso, gracias al soporte de tool calling y al contexto largo del modelo base.
- Recuperación de truncamiento forzado: cuando una llamada de herramienta supera su presupuesto de tokens, el motor xyntetik-runner cierra el JSON de forma legal, garantizando que los argumentos sean parseables.
- Conformidad de esquema de tool calls mantenida al 100 % hasta cuantización Q4_0 (la concordancia de argumentos decae al 50 % en ese nivel).
- Multilingüismo del modelo base (no verificado específicamente en este artefacto).

## Casos de uso

- Agentes de codificacion locales: el modelo puede ejecutar bucles agente-herramienta en maquinas con 20 GB de memoria, y la recuperacion de truncamiento evita reintentos costosos cuando el presupuesto de tokens se agota.
- Asistentes de desarrollo integrados en IDE: con soporte de tool calling y generacion de codigo, puede completar funciones, refactorizar y ejecutar comandos de terminal.
- Automatizacion de pruebas y CI/CD: integrado en pipelines, puede generar casos de prueba, analizar fallos y proponer correcciones usando herramientas externas.
- Chatbots tecnicos de soporte: con contexto largo y capacidad de llamar a APIs internas, puede resolver incidencias de nivel 1 y 2 sin escalado a humanos.
- Generacion de documentacion tecnica: a partir de codigo fuente, puede producir comentarios, README y guias de uso.
- Prototipado rapido de agentes con presupuesto de tokens ajustado: la recuperacion de truncamiento permite experimentar con limites de contexto muy bajos sin romper el flujo de llamadas.
- Despliegue en edge o dispositivos con memoria limitada: el archivo de 17,5 GB y el motor de un solo binario permiten ejecucion en equipos de consumo (Apple Silicon, GPUs con 20 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica medicion documentada es la comparativa de motores ante truncamiento de tool calls, que muestra que xyntetik-runner devuelve llamadas ejecutables con presupuestos de 1 a 16 tokens, mientras que vLLM, llama.cpp, Ollama, TensorRT-LLM y SGLang fallan en ese rango. Tambien se reporta que la conformidad de esquema de tool calls se mantiene al 100 % hasta Q4_0, con degradacion de concordancia de argumentos al 50 %.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 17,5 GB; se recomienda al menos 20 GB de memoria usable (RAM o VRAM unificada).
- GPUs compatibles: cualquier GPU con 20 GB o mas de VRAM (por ejemplo, RTX 4090 24 GB, A100 40 GB, H100). En Apple Silicon se ejecuta via Metal con memoria unificada.
- No cabe en GPUs de consumo de gama baja (8-12 GB) sin cuantizaciones mas agresivas.
- Opciones de despliegue: xyntetik-runner (recomendado, con recuperacion de truncamiento), o cualquier runtime que resuelva `num_experts` desde el archivo GGUF (por ejemplo, llama.cpp, Ollama, vLLM si soporta GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos/capa | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct (base) | 28,7 B (3,3 B activos) | 128 | 32 768 (segun repo oficial) | Apache 2.0 | safetensors, GGUF |
| Este derivado (keep120) | 28,7 B (3,3 B activos) | 120 | no disponible | Apache 2.0 | GGUF Q4_K_M |
| Qwen3-Coder-480B-A35B-Instruct | 480 B (35 B activos) | no disponible | no disponible | Apache 2.0 | no disponible |

La diferencia clave frente al base es la poda de 8 expertos por capa, que reduce el tamano del archivo (18,6 GB a 17,5 GB) y el coste de memoria, con una posible perdida menor de calidad en dominios donde los expertos eliminados eran relevantes. No se han publicado metricas comparativas de rendimiento entre ambos.

## Limitaciones y advertencias

- La poda de expertos puede degradar el rendimiento en tareas especificas donde los expertos eliminados contribuian significativamente; no hay benchmarks que cuantifiquen esta perdida.
- La recuperacion de truncamiento solo esta disponible con xyntetik-runner; otros motores no ofrecen esta garantia y pueden devolver llamadas malformadas.
- La longitud de contexto no se confirma en este artefacto; se asume la del modelo base (32 768 tokens), pero no esta verificada.
- El modelo es un derivado estructural, no un reentrenamiento; las capacidades de razonamiento y codigo son las heredadas del base, sin mejoras adicionales.
- Compatibilidad limitada con runtimes que asumen 128 expertos para arquitectura qwen3moe; pueden fallar al cargar el archivo.
- No se dispone de informacion sobre sesgos, alucinacion o restricciones de uso comercial mas alla de la licencia Apache 2.0 (que permite uso comercial sin restricciones, siempre que se mantenga el aviso de licencia).

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Joakimpalm-Zen/Qwen3-Coder-30B-A3B-Instruct-keep120-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio GitHub de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Pagina de Ollama para qwen3-coder: https://ollama.com/library/qwen3-coder:30b-a3b-q4_K_M
- Repositorio GitHub de xyntetik-runner: https://github.com/Joakimpalm-Zen/xyntetik-runner (referenciado en la model card; no verificado en la busqueda web)
- Documento de benchmark de truncamiento: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/truncation-benchmark.md (referenciado en la model card; no verificado en la busqueda web)
