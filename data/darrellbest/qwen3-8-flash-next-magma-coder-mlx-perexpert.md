# darrellbest/Qwen3.8-Flash-Next-Magma-Coder-MLX-PerExpert

## Resumen

Qwen3.8-Flash-Next-Magma-Coder-MLX-PerExpert es una cuantización comunitaria no oficial del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario darrellbest. Se distribuye como un pack MLX experimental en el que cada experto enrutado de la arquitectura MoE conserva su propio ancho de bits (de 2 a 8), definido en `text_config.expert_tiers`. No es un ajuste fino ni una poda: los 133.527.076.755 parámetros proceden del modelo original, se conservan los 512 expertos enrutados de las 48 capas y también la cabeza MTP.

El interés de esta ficha es doble. Por un lado, documenta una técnica de cuantización poco habitual (anchos de bits por experto calibrados con una imatrix orientada a código, tool calling, razonamiento y texto agéntico). Por otro, el propio autor advierte de que la asignación por experto no supera al Q4 uniforme en su prueba de divergencia KL, por lo que debe tratarse como una pieza experimental de la familia Magma-Coder y no como una mejora de calidad.

La relevancia práctica es limitada: el pack requiere el cargador MLX propio de Magma y no funciona con mlx-lm ni mlx-serve estándar. Para uso en producción, el autor recomienda las variantes Q4-uniforme de la misma familia (GGUF, MLX o W4A16 para vLLM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (base Qwen3.8-Flash-Next), con cabeza MTP; cuantización MLX affine por experto |
| Parametros totales | 133.527.076.755 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits por defecto; expertos enrutados con anchos de 2 a 8 bits (grupo 64, affine MLX); tabla n-gram en 4 bits (grupo 32); visión en bf16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (MLX), más `ngram_table.bin`, `model-vision.safetensors`, `config.json`, tokenizer y `chat_template.jinja` |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 48 capas y 512 expertos enrutados por capa, lo que da 73.728 proyecciones de experto (512 expertos × 3 proyecciones × 48 capas). Esta variante no reentrena ni poda nada; lo único que cambia respecto al original es la precisión de los pesos. Cada proyección de experto se almacena como `…switch_mlp.<proj>.tiers.<t>.{weight,scales,biases}` con cuantización affine de MLX (grupo 64) al ancho de bits de su tier, y dos mapas int32 (`tier_of` y `local_of`) traducen el identificador de experto del router a su tier y slot.

La calibración se hizo con una importance matrix (imatrix) de aproximadamente 1,5 millones de tokens, todos renderizados con la plantilla de chat de Qwen3.8 (tool calls en XML, `<tool_response>`, bloques de pensamiento). La composición es: 40 % agente (60 % transcripciones privadas de sesiones de coding agent del autor, filtradas de secretos y no distribuidas, y 40 % trayectorias del benchmark de agentes KannaCode), 25 % código (issues de SWE-bench Lite con sus parches gold, más fuentes de Magma y KannaCode), 15 % tool calling (hermes-function-calling-v1 de NousResearch), 15 % razonamiento (MATH-500 y GSM8K) y 5 % general (ultrachat_200k). El corpus de calibración y la imatrix no se distribuyen; se reservó un 10 % por categoría solo para evaluación.

La innovación técnica es la asignación de anchos de bits por experto a partir de un proxy de imatrix (error de reconstrucción ponderado por routing). El autor es explícito: en su prueba KL, esta asignación no superó al 4 bits uniforme. También señala que la tabla n-gram (PLE) en 4 bits, por sí sola, cuesta KLD 0,171 y 13 puntos de top-1 frente a la tabla BF16 sin pérdida, un efecto mayor que cualquier cuantización de expertos probada.

## Capacidades

- Generación de texto conversacional y razonamiento, heredados del modelo base Qwen3.8-Flash-Next.
- Generación de código: la imatrix está calibrada con issues de SWE-bench Lite, parches gold y fuentes de proyectos reales.
- Tool calling y function calling, con plantilla de chat que incluye tool calls en XML y bloques `<tool_response>`.
- Flujos agénticos y razonamiento multi-paso, calibrados con trayectorias de agentes de coding.
- Razonamiento matemático (MATH-500 y GSM8K en la calibración).
- Capacidad de visión: el pack incluye `model-vision.safetensors` en bf16.
- Cabeza MTP (multi-token prediction) conservada, relevante para decodificación especulativa.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de cuantización por experto: el pack sirve para reproducir y comparar la asignación por tiers frente al 4 bits uniforme usando la misma referencia Q8_0, midiendo KLD, top-1 y ratio de perplejidad.
- Desarrollo y depuración del cargador MLX de Magma: al requerir un loader específico, es un banco de pruebas para validar la carga de `expert_tiers`, los mapas `tier_of`/`local_of` y la tabla n-gram mapeada en memoria.
- Investigación sobre calibración con imatrix orientada a código: permite estudiar cómo afecta un corpus de agentes, tool calling y razonamiento a la reconstrucción por experto, en contraste con calibraciones de texto web genérico.
- Asistentes de programación en local sobre Apple Silicon: con el stack Magma, el autor reporta unos 1.300 tok/s de prefill y 37-57 tok/s de decodificación en su Mac para la variante Q4-uniforme de MLX, lo que hace viable un copiloto de código interactivo.
- Automatización de tareas agénticas con tool calling: la plantilla de chat y la calibración con trayectorias de agentes permiten construir pipelines que encadenan llamadas a herramientas y bloques de razonamiento.
- Experimentación con decodificación especulativa: la cabeza MTP conservada permite probar esquemas de predicción multi-token sobre una arquitectura MoE cuantizada.

## Benchmarks y rendimiento

| Build | KLD media | KLD mediana | KLD p99 | Top-1 igual | RMS Δp | Ratio PPL |
|---|---|---|---|---|---|---|
| Q4-uniform | 0,207 ± 0,011 | 0,0085 | 3,24 | 86,83 ± 0,53 % | 12,23 % | 0,965 |
| PerExpert (experimental) | 0,221 ± 0,012 | 0,0089 | 3,49 | 86,37 ± 0,54 % | 12,72 % | 1,112 |
| Per-layer mix (no publicado) | 0,262 ± 0,012 | 0,0108 | 3,82 | 85,83 ± 0,55 % | 14,37 % | 1,082 |

La referencia es un Q8_0 con su propia tabla n-gram Q8_0, de modo que solo difiere la cuantización de expertos. El texto evaluado es una mezcla reservada de código, tool calls, razonamiento, agente y chat, con 2 fragmentos de 4.096 tokens (unas 4.000 posiciones puntuadas) y `--parse-special` activado. El autor advierte que dos fragmentos son una muestra pequeña y que diferencias de aproximadamente una sigma son ruido; la ruta de referencia es determinista (el Q8_0 puntuado contra sí mismo da KLD 0,000000 y 100 % de top-1).

Pruebas de humo con llama-server y `--jinja` en una RTX PRO 6000: Q4-uniforme resolvió correctamente un `merge_intervals` con asserts de test a 57 tok/s y un tool call estructurado `get_weather` a 55 tok/s; PerExpert (contenedor Q8_0, con expertos parcialmente en CPU) dio las mismas respuestas correctas a 6-9 tok/s. En Mac con MLX Q4-uniforme y magma-mlx: prefill de unos 1.300 tok/s y decodificación de 37-57 tok/s; el mismo Mac con llama.cpp Metal sobre el GGUF: prefill 140 y decodificación 11,4 tok/s.

## Requisitos de hardware

- El repo ocupa 107,5 GB; los safetensors suman 70,3 GiB y la tabla n-gram 29,8 GiB (mapeada en memoria).
- El tamaño en disco es comparable al de un Q4 uniforme del mismo modelo base (133.527 millones de parámetros).
- Requiere el cargador MLX de Magma: no carga en mlx-lm ni mlx-serve estándar.
- GPU: el autor solo documenta pruebas en una RTX PRO 6000 (vía llama-server para las variantes GGUF) y en un Mac con MLX; no hay lista de GPUs recomendadas para este pack concreto.
- No cabe en GPUs de consumo convencionales por el tamaño del repo; el autor menciona ejecución con expertos parcialmente en CPU para el contenedor Q8_0, con caída a 6-9 tok/s.
- Opciones de despliegue: únicamente Magma (magma-mlx). Para stock llama.cpp, LM Studio, Ollama, mlx-lm, mlx-serve o vLLM hay que usar las variantes Q4-uniforme de la familia.
- Latencia y throughput: no disponibles para este pack; los datos citados (1.300 tok/s de prefill y 37-57 tok/s de decodificación en Mac) corresponden a la variante Q4-uniforme de MLX.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Magma-Coder-MLX-PerExpert | 133.527 M | no disponible | KLD media 0,221; top-1 86,37 % | qwen-community-1.0 | Solo Magma |
| Qwen3.8-Flash-Next-Magma-Coder-MLX | no disponible | no disponible | Q4-uniforme (KLD media 0,207 en la comparativa del autor) | qwen-community-1.0 | Stock mlx-lm / mlx-serve y Magma |
| Qwen3.8-Flash-Next-Magma-Coder-GGUF | no disponible | no disponible | Q4-uniforme; 57 tok/s en `merge_intervals` y 55 tok/s en tool call (RTX PRO 6000) | qwen-community-1.0 | Stock llama.cpp, LM Studio, Ollama |
| Qwen3.8-Flash-Next-Magma-Coder-W4A16 | no disponible | no disponible | Q4-uniforme (compressed-tensors) | qwen-community-1.0 | vLLM |
| Qwen3.8-Flash-Next-Base-GGUF | no disponible | no disponible | Original 8 bits (Q8_0 de Unsloth) | qwen-community-1.0 | Stock llama.cpp |

## Limitaciones y advertencias

- Cuantización comunitaria no oficial: no está afiliada ni respaldada por Qwen ni por Alibaba.
- Experimental por diseño: en la prueba KL del autor, la asignación por experto no supera al 4 bits uniforme (KLD media 0,221 frente a 0,207; top-1 86,37 % frente a 86,83 %). No debe presentarse como una mejora de calidad.
- Muestra de evaluación pequeña: dos fragmentos de 4.096 tokens; diferencias de aproximadamente una sigma son ruido.
- Dependencia de un cargador no estándar (Magma): no funciona con mlx-lm ni mlx-serve, lo que limita su integración en pipelines existentes.
- La tabla n-gram en 4 bits introduce por sí sola KLD 0,171 y 13 puntos de top-1 frente a la tabla BF16, un efecto mayor que la cuantización de expertos.
- Corpus de calibración e imatrix no distribuidos: la reproducibilidad de la calibración es parcial.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; se heredan los del modelo base, no caracterizados aquí.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia Qwen Community License 1.0: exige conservar los avisos de copyright y licencia; conviene revisar el texto completo del `LICENSE` incluido antes de un uso comercial.
- Sin descargas ni likes en el momento de la consulta y sin resultados de benchmarks publicados por el autor más allá de la prueba KL y las pruebas de humo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Magma-Coder-MLX-PerExpert
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante Q4-uniforme MLX: https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Magma-Coder-MLX
- Variante Q4-uniforme GGUF: https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Magma-Coder-GGUF
- Variante Q4-uniforme W4A16 para vLLM: https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Magma-Coder-W4A16
- Variante PerExpert en GGUF: https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Magma-Coder-GGUF-PerExpert
- Original 8 bits (Q8_0 de Unsloth): https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Base-GGUF
