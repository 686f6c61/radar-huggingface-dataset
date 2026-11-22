# Joakimpalm-Zen/Qwen3-30B-A3B-selective-attnQ8_0-expQ4_0-GGUF

## Resumen

Qwen3-30B-A3B-selective-attnQ8_0-expQ4_0-GGUF es una cuantización selectiva del modelo Qwen3-30B-A3B de Alibaba Qwen, publicada por el usuario Joakimpalm-Zen bajo el paraguas de su proyecto Xyntetik Runner. Se trata de una derivación estructural que aplica precisión mixta: las capas de atención se mantienen en Q8_0 mientras que los expertos del bloque MoE se cuantizan a Q4_0. El objetivo es conservar la fidelidad de la atención, que es crítica para el enrutamiento y el contexto largo, reduciendo al mismo tiempo el peso de los expertos, que concentran la mayor parte de los parámetros.

El modelo base Qwen3-30B-A3B es un transformer de tipo Mixture-of-Experts con 30.532.122.624 parámetros totales y aproximadamente 3.000 millones activos por token, lo que le permite un rendimiento de inferencia propio de un modelo mucho más pequeño. Esta versión GGUF ocupa 18,0 GB en disco y está pensada para servirse con el motor propio del autor, xyntetik-runner, un binario único en C11 con backend CPU, CUDA y Metal y servidor compatible con la API de OpenAI.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización no uniforme que el autor afirma superar el umbral de calidad que el Q4_K_M uniforme oficial no alcanza; por otro, introduce una funcionalidad de recuperación de truncamiento en tool calling que no está disponible en motores como vLLM, llama.cpp u Ollama según las mediciones del propio autor. Es, por tanto, un artefacto orientado a despliegues de agentes en local con presupuestos de tokens ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (Qwen3MoE) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | aproximadamente 3.000 millones (dato del modelo base, no confirmado en esta ficha) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Atención en Q8_0, expertos en Q4_0 (plan selectivo); GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 18,0 GB |
| Modelo base | Qwen/Qwen3-30B-A3B |
| Motor recomendado | xyntetik-runner (CPU, CUDA, Metal) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3MoE del Qwen3-30B-A3B original: un transformer con capas de atención y capas de mezcla de expertos dispersos. La innovación de esta publicación no está en el entrenamiento, sino en el proceso de cuantización posterior. El autor parte de una conversión Q8_0 verificada byte a byte desde el modelo original y aplica un plan de precisión selectiva mediante la opción `--type-plan` de su herramienta: las matrices de atención se mantienen en Q8_0 y las matrices de los expertos se degradan a Q4_0.

El autor declara que esta configuración supera el criterio de calidad adoptado (top-1 con margen cualificado mayor o igual al 97% y KLD medio menor o igual a 0,05) frente al modelo padre, mientras que el Q4_K_M uniforme oficial no lo consigue. La evidencia citada es una referencia float32 del publicador evaluada sobre 2.000 posiciones puntuadas en CPU el 2026-11-02; se conserva además una comparación anterior de 400 posiciones relativa a Q8_0 como histórico fechado. No se documentan datos de entrenamiento adicionales, RLHF ni DPO, ya que se trata de una derivación del modelo base sin reentrenamiento.

## Capacidades

- Generación de texto conversacional y de un solo turno, heredada del modelo base Qwen3-30B-A3B.
- Razonamiento y matemáticas: capacidades propias del modelo base, no verificadas de forma independiente en esta ficha.
- Generación de código: disponible a través del modelo base; no se documentan evaluaciones específicas en esta publicación.
- Tool calling y function calling mediante el servidor compatible con OpenAI de xyntetik-runner.
- Recuperación de truncamiento en tool calls: cuando el presupuesto de tokens se agota a mitad de un documento JSON, el motor emite un cierre sintácticamente legal para que los argumentos sigan siendo parseables.
- Decodificación restringida por esquema: el autor reporta conformidad de esquema y selección de herramienta del 100% hasta Q4_0, con una concordancia de argumentos que decae al 50%.
- Soporte de agentes y razonamiento multi-paso: viable gracias al tool calling y al contexto del modelo base, aunque no se aportan métricas de agentes en esta ficha.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Agentes locales con presupuesto de tokens ajustado: el motor xyntetik-runner cierra los tool calls truncados en lugar de devolver argumentos malformados, lo que evita reintentos completos en bucles de agente que operan con ventanas de contexto pequeñas.
- Asistente de atención al cliente autoalojado: los 30.500 millones de parámetros totales con aproximadamente 3.000 millones activos permiten servir conversaciones multi-turno en hardware de una sola máquina sin depender de APIs externas.
- Automatización de extracción de datos estructurados: la decodificación restringida por esquema garantiza la forma del JSON de salida incluso bajo cuantización agresiva de los expertos, lo que resulta adecuado para pipelines de ingesta que no pueden tolerar salidas no parseables.
- Despliegue en Apple Silicon: el binario soporta Metal y el archivo de 18,0 GB encaja en equipos con unos 20 GB de memoria utilizable, lo que habilita prototipado y demos en portátiles de gama alta.
- Servicio compatible con OpenAI en infraestructura propia: al exponer un endpoint `/v1`, se puede integrar con clientes y frameworks existentes sin adaptadores específicos.
- Investigación en cuantización selectiva: el plan de precisión mixta y la evidencia de KLD publicada sirven como referencia reproducible para estudiar el impacto de mantener la atención en Q8_0 mientras se degradan los expertos.
- Evaluación comparativa de motores de inferencia: el banco de truncamiento publicado permite contrastar el comportamiento de xyntetik-runner frente a vLLM, llama.cpp, Ollama, TensorRT-LLM y SGLang en condiciones controladas.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks académicos estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento aportados son métricas internas de fidelidad y de comportamiento del motor:

| Metrica | Resultado reportado |
|---|---|
| Criterio de calidad frente al padre | top-1 con margen >= 97% y KLD medio <= 0,05: superado |
| Q4_K_M uniforme oficial frente al mismo criterio | no superado (según el autor) |
| Evidencia de fidelidad | referencia float32, 2.000 posiciones en CPU, 2026-11-02 |
| Conformidad de esquema en tool calling | 100% hasta Q4_0 en la escalera de cuantización |
| Selección de herramienta en tool calling | 100% hasta Q4_0 |
| Concordancia de argumentos en tool calling | 50% hasta Q4_0 |
| Recuperación de truncamiento (presupuestos 1-16 tokens) | tool_calls ejecutables en Runner; sin llamada válida en vLLM 0.27.1, llama.cpp b10488, Ollama 0.32.14, TensorRT-LLM 1.2.1 y SGLang 0.5.17 |

No se han publicado resultados de benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: en torno a 20 GB de memoria utilizable para cargar el archivo de 18,0 GB, según indica el autor.
- GPU recomendadas: no se especifican modelos concretos; el motor soporta CUDA y Metal, por lo que son válidas GPU de NVIDIA con al menos 20-24 GB (por ejemplo, RTX 3090, RTX 4090, A100 40 GB, H100) y Apple Silicon con memoria unificada suficiente.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB de VRAM como la RTX 4090, siempre que el resto del sistema no consuma memoria del dispositivo.
- Opciones de despliegue: xyntetik-runner es el motor recomendado y el único validado por el autor para la recuperación de truncamiento; el formato GGUF es potencialmente compatible con llama.cpp y Ollama, aunque el autor no valida esas rutas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (Qwen3-30B-A3B selectivo) | 30.532.122.624 | aprox. 3.000 millones | no disponible | Apache 2.0 | GGUF 18,0 GB | Atención Q8_0, expertos Q4_0; validado para xyntetik-runner |
| Qwen/Qwen3-30B-A3B | 30.532.122.624 | aprox. 3.000 millones | no disponible | Apache 2.0 | safetensors y GGUF | Modelo base sin cuantización selectiva |
| Qwen3-30B-A3B en Q4_K_M uniforme | 30.532.122.624 | aprox. 3.000 millones | no disponible | Apache 2.0 | GGUF | Según el autor, no supera el criterio de calidad adoptado |
| Alternativas de otros fabricantes de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparativos en la información disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en esta publicación; se heredan los del modelo base Qwen3-30B-A3B, no evaluados aquí.
- Riesgo de alucinación: no cuantificado en esta ficha; aplicable el comportamiento del modelo base.
- Idiomas soportados: no declarados, lo que impide garantizar cobertura multilingüe sin verificación previa.
- Longitud de contexto: no indicada en la información disponible, lo que dificulta planificar despliegues con ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los artefactos derivados.
- Dependencia del motor: la funcionalidad diferencial de recuperación de truncamiento solo está implementada y medida en xyntetik-runner; en otros motores el comportamiento es el estándar.
- Concordancia de argumentos en tool calling: cae al 50% en Q4_0, de modo que la forma del JSON está garantizada pero no necesariamente su contenido.
- Validación limitada: el repositorio acumula 649 descargas y 0 likes, y la evidencia procede del propio publicador, sin replicación independiente documentada.
- Naturaleza derivada: no hay reentrenamiento ni ajuste fino; cualquier limitación del Qwen3-30B-A3B original se mantiene intacta.
- Compatibilidad de ecosistema: el autor no valida explícitamente el uso con llama.cpp, Ollama o vLLM, por lo que la integración en esos entornos queda bajo responsabilidad del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Joakimpalm-Zen/Qwen3-30B-A3B-selective-attnQ8_0-expQ4_0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Repositorio del motor xyntetik-runner: https://github.com/Joakimpalm-Zen/xyntetik-runner
- Documentación de soporte de modelos: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/model-support.md#qwen3-30b-a3b-expq4_0-attnq8_0
- Banco de pruebas de truncamiento: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/truncation-benchmark.md
- Resultados de la comunidad: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/community-results.md
- Colección Runner Releases: https://huggingface.co/collections/Joakimpalm-Zen/runner-releases-6aa98baaed03bba0e8a561ae
- Colección Pruning and Quantization Frontiers: https://huggingface.co/collections/Joakimpalm-Zen/xyntetik-research-pruning-and-quantization-frontiers-6aa98badc3307048c060ebe2
- Solicitud de modelos: https://github.com/Joakimpalm-Zen/xyntetik-runner/issues/new?template=model_request.yml
- Reporte de resultados: https://github.com/Joakimpalm-Zen/xyntetik-runner/issues/new?template=result_report.yml
