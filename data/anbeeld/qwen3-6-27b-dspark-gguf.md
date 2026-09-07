# Anbeeld/Qwen3.6-27B-DSpark-GGUF

## Resumen

El modelo `Anbeeld/Qwen3.6-27B-DSpark-GGUF` es una colección de cuantizaciones GGUF del *drafter head* `satgeze/Qwen3.6-27B-DSpark`, un modelo auxiliar de decodificación especulativa diseñado para acelerar la inferencia del modelo base `Qwen/Qwen3.6-27B`. Lo desarrolla el usuario Anbeeld sobre el trabajo de satgeze, y se apoya en la técnica DeepSpec de DeepSeek. El problema que resuelve es el cuello de botella de velocidad en la generación autoregresiva: en lugar de generar token a token, el drafter propone bloques de hasta 15 tokens que el modelo base verifica en paralelo, obteniendo aceleraciones de 1.6× a 2.7× en GPU y 1.39× en Apple Silicon, sin pérdida de calidad (decodificación especulativa lossless).

El drafter head tiene 3.128.756.737 parámetros (unos 3.1B), muy inferior a los 27B del modelo objetivo, y se sirve junto con el modelo base mediante llama.cpp o vLLM. La longitud de contexto efectiva es la del modelo base, que no se especifica en la información disponible, pero el modelo objetivo Qwen3.6-27B admite al menos 4k según SparkBench. El repo incluye múltiples cuantizaciones GGUF (Q8_0, Q4_K_M, IQ1_S, Q2_K) y pesa 20.3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ligero (drafter head para decodificacion especulativa) |
| Parametros totales | 3.128.756.737 (solo el drafter head; el modelo base Qwen3.6-27B tiene ~27B) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | Q8_0, Q4_K_M, IQ1_S, Q2_K (mencionadas en el README) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones del drafter head; safetensors en el repo de satgeze) |

## Arquitectura y entrenamiento

El modelo es un *draft model* para decodificación especulativa, entrenado con el framework DeepSpec de DeepSeek en modo *online*: el drafter se entrena contra las respuestas regeneradas por el propio modelo objetivo (Qwen3.6-27B), lo que alinea la distribución de los borradores con la del modelo verificador. El entrenamiento se inicializó con *warm-start* desde un head DFlash de z-lab para el mismo objetivo. El drafter predice bloques de 15 tokens (`block_size=15`), lo que permite que el modelo base verifique varios tokens en paralelo en cada paso.

La arquitectura exacta del drafter head no se detalla en la información disponible. Se sabe que es un modelo de lenguaje de ~3.1B parámetros, claramente más pequeño que el modelo objetivo, y que se exporta en formato GGUF y safetensors con configuraciones de RoPE específicas: el README indica que el drafter se entrenó con RoPE de dimensión completa (`partial_rotary_factor: 1.0`), corrigiendo un bug en el `config.json` exportado que heredaba el `partial_rotary_factor: 0.25` del modelo base y colapsaba la tasa de aceptación en vLLM.

## Capacidades

- Aceleración de la decodificación del modelo base Qwen3.6-27B mediante decodificación especulativa lossless: cada token aceptado es verificado por el modelo objetivo, por lo que la calidad de salida es idéntica a la del modelo base sin drafter.
- Soporte de bloques de borrado de hasta 15 tokens (`--spec-draft-n-max 15` en llama.cpp), con una longitud media aceptada de 5.35-5.53 tokens en pruebas con prompts de código y conteo.
- Compatibilidad con llama.cpp (rama `dspark-qwen35` o PR #25173) y con vLLM (>= 0.25, con soporte para heads en formato DeepSpec y `speculators-format`).
- Integración con BeeLlama.cpp, un fork de llama.cpp con características avanzadas de cuantización.
- Funciona en múltiples backends: CUDA (RTX Pro 6000 Blackwell) y Metal (Apple Silicon M3 Max), con tasas de aceptación independientes del backend (idénticas a la tercera decimal entre CUDA y Metal en los mismos GGUFs).
- El modelo base Qwen3.6-27B, al que sirve, es un modelo conversacional con capacidades de generación de texto, razonamiento y código, pero la información disponible no detalla sus capacidades específicas ni su soporte de tool calling.

## Casos de uso

- Servir Qwen3.6-27B en producción con mayor throughput: en llama.cpp, el drafter head eleva la velocidad de decodificación de 51.0 t/s a 129.5-136.1 t/s en una RTX Pro 6000 Blackwell con cuantización Q8_0, lo que permite atender más peticiones concurrentes con el mismo hardware.
- Aplicaciones de chat en tiempo real en Apple Silicon: en un MacBook Pro M3 Max con 128 GB, la velocidad pasa de 12.3-12.4 t/s a 17.1-17.3 t/s (1.39×), una mejora perceptible en interfaces de conversación.
- Generación de código asistida en entornos de desarrollo: el drafter head muestra una tasa de aceptación de 0.292 en prompts de código y un speedup de 1.96× en salidas de 256 tokens, lo que reduce la latencia en autocompletado y generación de funciones.
- Procesamiento por lotes de documentos largos: con salidas de 1024 tokens, el speedup alcanza 2.21× en tareas de código, lo que acelera la generación de documentación técnica, resúmenes o análisis de logs.
- Despliegue en hardware de borde o servidores compactos: SparkBench reporta 17.3 t/s a 4k de contexto para Qwen3.6-27B en un DGX Spark GB10 con vLLM; el drafter head puede integrarse en este tipo de despliegues para mejorar aún más la velocidad.
- Pipelines de agentes con múltiples llamadas al modelo: en sistemas que requieren razonamiento multi-paso o iteraciones repetidas, la reducción de latencia por llamada (hasta 2.67× en pruebas greedy) se traduce en tiempos de respuesta totales mucho menores.
- Herramientas de escritura asistida en local: el drafter head permite ejecutar el modelo base en cuantización Q4_K_M con un overhead de VRAM moderado, manteniendo velocidades interactivas en equipos de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los datos existentes son de rendimiento de decodificación especulativa, medidos con llama.cpp en RTX Pro 6000 Blackwell (CUDA) y Apple Silicon M3 Max (Metal), con el modelo base Qwen3.6-27B en Q8_0, decodificación greedy y completions de 200 tokens.

| Metrica | Valor (CUDA, RTX Pro 6000) | Valor (Metal, M3 Max) |
|---|---|---|
| Draft acceptance (prompt de codigo) | 0.292 | 0.2922 |
| Draft acceptance (prompt de conteo) | 0.305 | 0.2945 |
| Longitud media aceptada (block size 15) | 5.35-5.53 | no disponible |
| Decodificacion baseline del modelo objetivo | 51.0 t/s | 12.3-12.4 t/s |
| Decodificacion con DSpark | 129.5-136.1 t/s | 17.1-17.3 t/s |
| Speedup total | 2.54-2.67× | 1.39× |

Resultados adicionales de SPEED-Bench (conjunto cualitativo de coding y writing, temperatura 0, concurrencia 1):

| Longitud de salida | Tarea | t/s con DSpark | t/s baseline | Speedup |
|---|---|---|---|---|
| 256 | coding | 99.7 | 50.9 | 1.96× |
| 256 | writing | 97.8 | 50.8 | 1.93× |
| 1024 | coding | 112.1 | 50.7 | 2.21× |
| 1024 | writing | 81.0 | 50.6 | 1.60× |

La tasa de aceptación agregada en prompts variados de SPEED-Bench es de 0.19-0.20, frente a 0.29-0.31 en pruebas greedy estrechas. El README recomienda comparar el mismo tipo de sondeo al evaluar heads de drafter.

## Requisitos de hardware

- VRAM estimada: el drafter head de ~3.1B parámetros en Q8_0 ocupa aproximadamente 3.1 GB adicionales al modelo base. Con el modelo base Qwen3.6-27B en Q8_0 (~27 GB), el requisito total ronda los 30 GB. Con cuantización Q4_K_M del modelo base (~15 GB) y el drafter en Q4_K_M (~1.8 GB), el total baja a ~17 GB.
- GPU recomendadas: RTX Pro 6000 Blackwell (usada en las mediciones del README), Apple Silicon M3 Max con 128 GB (Metal), y DGX Spark GB10 (según SparkBench).
- Compatibilidad con GPU de consumo: no se confirma explícitamente, pero una RTX 4090 de 24 GB podría ejecutar el modelo base en Q4_K_M junto con el drafter, siempre que se ajuste la cuantización y la ventana de contexto.
- Opciones de despliegue: llama.cpp (rama `dspark-qwen35` de satindergrewal, o el PR #25173 de ggml-org), llama-server con `--spec-type draft-dspark`, vLLM (>= 0.25), y BeeLlama.cpp (fork de Anbeeld).
- Latencia y throughput: los datos de tokens por segundo están en la tabla de benchmarks. En CUDA, el throughput sube de 51.0 t/s a 129.5-136.1 t/s; en Metal, de 12.3-12.4 t/s a 17.1-17.3 t/s.

## Comparativa con modelos similares

La comparación más directa es entre el modelo base Qwen3.6-27B sin drafter y el mismo modelo con el drafter DSpark. No hay datos de otros drafter heads comparables en la información disponible.

| Configuracion | Parametros del drafter | Speedup en CUDA (RTX Pro 6000) | Speedup en Metal (M3 Max) | Observaciones |
|---|---|---|---|---|
| Qwen3.6-27B (baseline) | - | 1.0× (51.0 t/s) | 1.0× (12.3 t/s) | Sin aceleracion especulativa |
| Qwen3.6-27B + DSpark drafter | 3.1B | 2.54-2.67× (129.5-136.1 t/s) | 1.39× (17.1 t/s) | Requiere llama.cpp con soporte DSpark o vLLM >= 0.25 |
| Qwen3.6-27B + drafter 0.8B (mencionado en README) | 0.8B | no disponible | net slowdown | El README indica que un drafter de 0.8B es un slowdown en Metal porque el overhead de borrado domina sobre un objetivo pequeño |

No se dispone de datos de rendimiento del head DFlash de z-lab, que se menciona como punto de partida del warm-start, por lo que no se puede comparar directamente.

## Limitaciones y advertencias

- El drafter head no es un modelo autónomo: requiere el modelo base Qwen3.6-27B para funcionar. No puede usarse como modelo de lenguaje de propósito general por sí solo.
- La velocidad de decodificación especulativa es muy sensible a la tasa de aceptación del drafter. En prompts variados y reales, la aceptación cae a 0.19-0.20, frente a 0.29-0.31 en prompts estrechos de código o conteo. El speedup real puede ser menor en cargas de trabajo heterogéneas.
- En hardware con memoria unificada más lenta (Apple Silicon), el speedup se reduce a 1.39×, y con modelos objetivo pequeños un drafter puede ser un slowdown neto, como se indica para un drafter de 0.8B en Metal.
- El soporte en llama.cpp no está en mainline: requiere usar la rama `dspark-qwen35` o el PR #25173. En vLLM, se necesita la versión 0.25 o superior; versiones anteriores rechazan el método `dspark`.
- Hubo un bug en el `config.json` exportado del drafter que heredaba el `partial_rotary_factor: 0.25` del modelo base, lo que colapsaba la tasa de aceptación a ~1% en vLLM para los primeros usuarios. El bug se corrigió a `partial_rotary_factor: 1.0`, pero es un recordatorio de que la configuración de RoPE debe validarse al integrar el modelo.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, GSM8K) para el drafter head ni para el modelo base en la información disponible. La decodificación especulativa es lossless, pero la calidad del modelo base Qwen3.6-27B no está evaluada en esta ficha.
- El repo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es un modelo reciente y con poco uso en producción. Se recomienda probarlo en un entorno de staging antes de desplegarlo en servicios críticos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.6-27B debe cumplir su propia licencia. No se especifica en la información disponible si el modelo base tiene restricciones adicionales.

## Enlaces

- Repo de HuggingFace: https://huggingface.co/Anbeeld/Qwen3.6-27B-DSpark-GGUF
- Modelo base del drafter (satgeze): https://huggingface.co/satgeze/Qwen3.6-27B-DSpark
- Modelo objetivo (Qwen): https://huggingface.co/Qwen/Qwen3.6-27B
- Fork BeeLlama.cpp: https://github.com/Anbeeld/beellama.cpp
- PR de llama.cpp para soporte DSpark: https://github.com/ggml-org/llama.cpp/pull/25173
- PR de vLLM para soporte de heads DeepSpec: https://github.com/vllm-project/vllm/pull/46995
- PR de vLLM para checkpoints speculators-format: https://github.com/vllm-project/vllm/pull/47093
- Repo de DeepSpec: https://github.com/deepseek-ai/DeepSpec
- SparkBench (rendimiento de Qwen3.6-27B en DGX Spark): https://sparkbench.dev/models/qwen_qwen3.6-27b/
