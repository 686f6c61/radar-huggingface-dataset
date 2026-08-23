# Adartras/qwen3.6-a3b-blackhole

## Resumen

Adartras/qwen3.6-a3b-blackhole no es un modelo de lenguaje en sí, sino un **bundle de integración** para ejecutar el modelo Qwen/Qwen3.6-35B-A3B sobre hardware Tenstorrent Blackhole p150. El repositorio contiene la implementación ttnn del modelo, el adaptador para el fork de vLLM de Tenstorrent y el código del servidor de decodificación especulativa; los pesos se descargan dinámicamente desde el repositorio original de Qwen en el primer arranque. Con un tamaño de 0.6 GB, es un paquete de código, no de pesos.

El modelo subyacente, Qwen3.6-35B-A3B, es una arquitectura híbrida con 40 capas de decodificación: 30 capas con atención lineal gated-delta y 10 capas de atención completa, cada una con un MoE de 256 expertos (top-8) y un experto compartido. Este bundle es relevante porque permite ejecutar un modelo de 35B en una única tarjeta Blackhole p150, con rendimiento de decode medido en 32.5 tok/s a través de vLLM y hasta 43.5 tok/s con decodificación especulativa MTP en el servidor independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 30 capas gated-delta (linear attention) + 10 capas full attention, MoE con 256 expertos (top-8) y experto compartido |
| Parametros totales | 35B (Qwen3.6-35B-A3B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BFP4 para expertos enrutados (por defecto); bf8 no cabe en una sola p150 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | tt-kernel vLLM bundle (código; los pesos se descargan de Qwen/Qwen3.6-35B-A3B) |

## Arquitectura y entrenamiento

Qwen3.6-35B-A3B es un modelo de mezcla de expertos híbrido: 40 capas de decodificador, de las cuales 30 usan atención lineal gated-delta (una variante de linear attention que reduce el coste computacional del contexto largo) y 10 usan atención completa tradicional. Cada capa incorpora un MoE con 256 expertos enrutados, activando los 8 mejores más un experto compartido. Esta estructura híbrida es la responsable de las particularidades del bundle: los kernels ttnn deben gestionar dos tipos de atención y el enrutamiento de expertos en BFP4.

El bundle incluye además un servidor de decodificación especulativa (MTP, multi-token prediction) que no está integrado en la ruta de vLLM. Este servidor usa un draft basado en argmax y permite cuatro reglas de aceptación: greedy (exacta en distribución), exact (rejection sampling que preserva la distribución), lenient (rejection sampling con target temperado) y relaxed (decisión determinista con divergencia acotada). Los datos de entrenamiento, el dataset y los procedimientos de alineación no se detallan en la información disponible.

## Capacidades

- Generación de texto y razonamiento: al ser Qwen3.6-35B-A3B, hereda las capacidades de razonamiento de la familia Qwen3.6, incluyendo agentic coding y thinking preservation según la documentación de DeepWiki.
- Decodificación especulativa MTP: el bundle incluye un servidor independiente que implementa speculative decoding con múltiples reglas de aceptación (greedy, exact, lenient, relaxed), con hasta 1.25× de aceleración respecto a la línea base.
- Enrutamiento MoE: 256 expertos por capa con top-8 y experto compartido, gestionado en precisión BFP4 para ajustarse a la memoria de la p150.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque la familia Qwen3.6 incluye capacidades de agentic coding según las fuentes web.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales: el bundle está diseñado para hardware Tenstorrent Blackhole p150 y requiere la pila ttnn, el fork de vLLM de Tenstorrent y el plugin vllm-tt-plugin. No incluye capacidades de visión ni audio.

## Casos de uso

- Inferencia local en hardware Tenstorrent: el caso de uso primario es ejecutar Qwen3.6-35B-A3B en una tarjeta Blackhole p150 con vLLM, ofreciendo un endpoint compatible con OpenAI en localhost:8000. Adecuado para equipos que ya tienen infraestructura Tenstorrent y quieren servir un MoE de 35B sin depender de GPUs NVIDIA.
- Despliegue en edge con rendimiento predecible: con un decode medido de 32.5 tok/s en vLLM y un TTFT de 610–856 ms para prompts cortos, es viable para aplicaciones de chat interactivas donde la latencia de primer token es aceptable.
- Aceleración de inferencia con decodificación especulativa: el servidor independiente con MTP alcanza hasta 43.5 tok/s en modo greedy (1.25× respecto a la línea base), útil para entornos donde la velocidad de decode es crítica y se puede tolerar la divergencia de distribución con las reglas lenient o relaxed.
- Investigación en arquitecturas híbridas y MoE: el bundle permite experimentar con el modelo híbrido gated-delta + full attention en hardware especializado, incluyendo la calibración de reglas de aceptación especulativa y el análisis de divergencia de distribución.
- Evaluación de kernels ttnn y optimización de hardware: los desarrolladores de Tenstorrent pueden usar el repositorio como referencia para implementar otros modelos híbridos con MoE en la p150, aprovechando el código de los kernels y el flujo de compilación.
- Servicio de chat con contexto largo: aunque la longitud de contexto no se ha confirmado, la combinación de atención lineal en 30 de 40 capas sugiere una mejora en eficiencia para secuencias largas, lo que lo hace adecuado para aplicaciones de resumen o análisis de documentos extensos.

## Benchmarks y rendimiento

Los datos de rendimiento medidos en una sola Blackhole p150, con 40 capas, expertos BFP4, decode trazado y greedy salvo indicación, son los siguientes:

### A través del bundle vLLM (llama-benchy 0.4.0, max_num_seqs=1, concurrency 1)

| Test | Throughput | TTFT |
|---|---|---|
| pp4096 (prefill) | 782.3 tok/s | 5254 ms |
| tg1024 (decode) | 32.5 tok/s (pico 34.0) | — |

Prompts cortos (24–220 tokens con chat template): TTFT de 610–856 ms, dominado por TTFT y no por throughput.

### Decode a nivel de modelo (tests/bench_decode.py)

| Config | ms/token | tok/s |
|---|---|---|
| greedy | 28.65 | 34.9 |
| sampling (T=0.6, top_k=20, top_p=0.95, presence=1.5) | 29.67 | 33.7 |

### Decode especulativo (MTP, gamma=2, K=3, 40 layers, un prompt)

| Regla de aceptación | tokens/round | ms/token | tok/s | vs. línea base | Divergencia de distribución |
|---|---|---|---|---|---|
| greedy (temperature=0) | 2.27 | 23.00 | 43.5 | 1.25× | exacta |
| exact (sampled) | 2.06 | 26.71 | 37.4 | 1.11× | provablemente sin cambios |
| lenient (0.5) | 2.18 | 25.23 | 39.6 | 1.18× | TV media 0.052 |
| relaxed | 2.25 | 24.41 | 41.0 | 1.22× | TV media 0.088 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada.

## Requisitos de hardware

- Hardware requerido: 1 × Blackhole p150 (single device, mesh 1×1).
- VRAM estimada: no disponible, pero el modelo completo en BFP4 cabe en una sola p150; los expertos en bf8 no caben.
- Plataforma de software: ttnn >= 0.77 (medido contra 0.77.1.dev0+g9f9cd4fd590), fork de vLLM de Tenstorrent + vllm-tt-plugin, y el paquete `ttl` (dependencia de plataforma de los kernels gated-delta, debe ser importable y co-versionado con ttnn).
- Precisión: expertos enrutados en BFP4 por defecto.
- Opciones de despliegue: `tt-kernel serve Adartras/qwen3.6-a3b-blackhole` para el endpoint compatible con OpenAI en localhost:8000; el servidor independiente con decodificación especulativa no está integrado en vLLM.
- Latencia y throughput: prefill de 782.3 tok/s (TTFT 5254 ms para 4096 tokens), decode de 32.5 tok/s en vLLM y 34.9 tok/s a nivel de modelo; con MTP greedy hasta 43.5 tok/s. El TTFT para prompts cortos (24–240 tokens) es de 610–856 ms.

## Comparativa con modelos similares

No se dispone de una comparación directa en la información proporcionada. Como referencia, los modelos comparables en la familia Qwen3.6 son:

| Modelo | Parámetros totales | Parámetros activos | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-27B (dense) | 27B | 27B | Dense | No disponible | No disponible |
| Qwen3.6-35B-A3B (MoE) | 35B | 3B | Híbrido gated-delta + full attention, MoE 256 expertos | No disponible | No disponible |

Además, existe un repositorio de GitHub (PMZFX/TT-qwen36-35b-a3b-fp8-two-blackhole) que implementa una ruta de ejecución FP8 del mismo modelo en dos Blackhole P150a, lo que indica que la variante FP8 requiere dos tarjetas. La comparativa con otros MoE de tamaño similar (por ejemplo, Qwen3-30B-A3B o DeepSeek-V3) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de pesos: el repositorio contiene solo código y kernels; los pesos se descargan desde Qwen/Qwen3.6-35B-A3B en el primer arranque, lo que requiere acceso a internet y a ese repositorio.
- Hardware exclusivo: el bundle solo funciona en Tenstorrent Blackhole p150; no es ejecutable en GPUs NVIDIA ni AMD.
- Decodificación especulativa no integrada en vLLM: el código MTP y el servidor que lo impulsa están en el bundle, pero la ruta de vLLM no lo usa; la variable de entorno `QWEN36_MTP` no tiene efecto en vLLM. Además, `vllm-tt-plugin` rechaza configuraciones especulativas.
- Divergencia de distribución: las reglas lenient y relaxed de decodificación especulativa aceptan tokens que el modelo objetivo consideraba improbables, con una divergencia de TV media de 0.052 y 0.088 respectivamente; no han sido validadas con benchmarks de exactitud generativa.
- La aceleración especulativa es dependiente del prompt: la aceptación varía entre 2.04 y 2.70 tokens/round según el prompt, y el punto de equilibrio es ≈1.9 tokens/round; en algunos prompts la especulación es una pequeña pérdida. El servidor independiente calibra la tasa de decode y se desactiva automáticamente si la especulación queda por detrás.
- Licencia no disponible: no se ha especificado la licencia del modelo ni del bundle, lo que limita el uso comercial sin verificación previa.
- Riesgo de alucinación y sesgos: no hay información sobre sesgos conocidos ni evaluación de alucinación en la documentación proporcionada; al ser un modelo de la familia Qwen3.6, hereda los riesgos típicos de los modelos de lenguaje, pero no se han documentado aquí.
- Actualización manual: `tt-kernel serve` reutiliza el bundle ya instalado sin comparar revisiones con el Hub; tras un nuevo push hay que ejecutar `tt-kernel rm Adartras/qwen3.6-a3b-blackhole` antes de volver a servir para forzar una actualización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Adartras/qwen3.6-a3b-blackhole
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Documentación técnica de Qwen3.6 en DeepWiki: https://deepwiki.com/QwenLM/Qwen3.6/1.1-qwen3.6-models
- Guía de Qwen 3.6 en InsiderLLM: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Repositorio FP8 dos-Blackhole (alternativa): https://github.com/PMZFX/TT-qwen36-35b-a3b-fp8-two-blackhole
