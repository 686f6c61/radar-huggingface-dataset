# ai-anytime/Llama-3.2-3B-Instruct-abliterated

## Resumen

Llama-3.2-3B-Instruct-abliterated es una variante del modelo meta-llama/Llama-3.2-3B-Instruct de Meta en la que se ha aplicado una ablación direccional de la dirección de rechazo (refusal direction) del flujo residual. El autor, ai-anytime, lo publica como herramienta de investigación en interpretabilidad mecánica y seguridad, no como un modelo de propósito general. La edición es una modificación lineal de rango 1 aplicada directamente sobre los pesos, sin fine-tuning adicional: se identifican las direcciones de rechazo mediante diferencia de medias sobre pares de instrucciones dañinas/inocuas y se ortogonalizan las matrices que escriben en el flujo residual (embedding, salida de atención y salida de MLP).

El modelo conserva la arquitectura y el tamaño del original: transformer decoder de 3.212.749.824 parámetros (3B), contexto de 128.000 tokens según la ficha de Llama 3.2, licencia Llama 3.2 Community License y pesos en safetensors. La intervención se aplicó únicamente en las capas 26 a 28, con un único vector de dirección y un factor alpha de 1,0342. Según la model card, la tasa de rechazo medida sobre prompts dañinos retenidos baja de 0,9375 a 0,5938, con una divergencia KL media de 0,0252 frente al modelo base en prompts benignos y una coherencia de 0,8716.

Su relevancia es doble: por un lado, sirve como instrumento de medición para estudiar cómo se representa el comportamiento de seguridad en modelos pequeños; por otro, ilustra el estado actual de las técnicas de ablación, que reducen el rechazo de forma parcial (no total) y con cierta deriva de capacidades. No es un modelo recomendado para despliegue en producción sin una capa de seguridad propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.2), ablación direccional de rango 1 sobre el flujo residual |
| Parámetros totales | 3.212.749.824 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.2, según ficha del modelo base) |
| Tipos de cuantización | no disponible en la información proporcionada; al ser safetensors estándar es compatible con cuantizaciones derivadas (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | no disponible en la información proporcionada (el modelo base soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del Llama-3.2-3B-Instruct original: un transformer decoder denso con normalización RMSNorm, activación SwiGLU, atención con RoPE y GQA (grouped-query attention), con 28 capas y 3.212.749.824 parámetros. No hay cambios estructurales ni reentrenamiento: los pesos son los del modelo base modificados mediante una edición lineal.

El método de ablación sigue a Arditi et al. (2024): se extrae la dirección de rechazo con diferencia de medias entre 64 prompts de AdvBench y 64 prompts de Alpaca, se selecciona la configuración mediante una búsqueda Optuna de 30 trials puntuada por tasa de rechazo y deriva KL, y se aplica una ortogonalización de las matrices que escriben en el flujo residual contra el subespacio de rechazo. La configuración final usa `n_directions: 1`, `alpha: 1.034208832531553`, `min_layer: 26`, `max_layer: 28`. La evaluación se hizo sobre 32 prompts retenidos de cada tipo con un juez de rechazo por palabras clave, que no detecta rechazos suaves. El entrenamiento se ejecutó en una única GPU en RunPod.

## Capacidades

- Generación de texto conversacional en formato instruct, con plantilla de chat de Llama 3.2.
- Razonamiento y respuesta a instrucciones multi-turno, heredados del modelo base.
- Generación de código y matemáticas a nivel de un modelo de 3B parámetros.
- Soporte de tool calling y function calling según el formato del modelo base (no verificado específicamente en esta variante).
- Capacidades multilingües heredadas del modelo base (ocho idiomas oficiales), aunque no evaluadas en esta variante.
- Reducción parcial de la tendencia al rechazo: la tasa de rechazo medida baja de 0,9375 a 0,5938 en el conjunto de evaluación del autor.
- No incluye visión, audio ni modo de pensamiento explícito (thinking mode).

## Casos de uso

- Investigación en interpretabilidad mecánica: analizar la localidad y robustez de la representación del rechazo comparando activaciones y pesos con el modelo base en las capas 26-28.
- Red-teaming controlado: usar el modelo como sujeto de prueba para medir la eficacia de filtros de seguridad, clasificadores de contenido o capas de moderación externas.
- Evaluación de defensas: construir pipelines que comparen la tasa de rechazo del modelo abliterado frente al original para calibrar detectores de contenido dañino.
- Estudio de deriva de capacidades: cuantificar el impacto de la edición lineal sobre tareas benignas usando la divergencia KL (0,0252) como referencia y ampliando la evaluación a benchmarks estándar.
- Docencia y divulgación: demostrar en un modelo de 3B cómo una edición de rango 1 altera el comportamiento de seguridad, con un coste computacional bajo (cabe en GPUs de consumo).
- Experimentos de alineación comparada: entrenar capas de seguridad adicionales sobre esta variante y medir si recuperan la tasa de rechazo original sin perder capacidades.
- Generación de datos sintéticos para clasificadores de seguridad: producir ejemplos que el modelo base rechazaría y usarlos como negativos en el entrenamiento de moderadores.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Métrica | Valor |
|---|---|
| Tasa de rechazo (modelo base) | 0,9375 |
| Tasa de rechazo (abliterado) | 0,5938 |
| KL media vs. modelo base (prompts benignos) | 0,0252 |
| Coherencia | 0,8716 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 6,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 8-10 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: unos 3,5-4 GB; en 4 bits: unos 2-2,5 GB.
- GPU recomendadas para fp16: RTX 4090, A10G, L4, A100 o H100; para cuantización de 4 bits cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y GPUs integradas con suficiente memoria unificada.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superiores con cuantización; en fp16 requiere al menos 12 GB para contexto moderado.
- Opciones de despliegue: transformers, vLLM, TGI, llama.cpp y Ollama (prevía conversión a GGUF), entre otras herramientas compatibles con safetensors de Llama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ai-anytime/Llama-3.2-3B-Instruct-abliterated | 3,21B | 128k (heredado) | 0,5938 (medida por el autor) | Llama 3.2 Community | HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128k | 0,9375 (medida por el autor) | Llama 3.2 Community | HuggingFace |
| Otras variantes abliterated de Llama 3.2 3B | ~3,21B | 128k | no disponible | Llama 3.2 Community | HuggingFace |

No se dispone de datos de benchmarks estándar comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo tiene deliberadamente debilitadas sus barreras de seguridad y produce con mayor facilidad contenido dañino, inseguro u objetable que el modelo base.
- La ablación es una edición lineal tosca: deja rechazos residuales (la tasa baja a 0,5938, no a cero) y puede causar deriva de capacidades (KL media de 0,0252).
- La seguridad está codificada de forma redundante; un único subespacio rara vez elimina toda la protección.
- La evaluación se limita a los conjuntos descritos (64 prompts de AdvBench, 64 de Alpaca, 32 retenidos de cada tipo) con un juez por palabras clave que no detecta rechazos suaves; el comportamiento fuera de esos conjuntos puede diferir.
- No debe desplegarse en productos de cara al usuario sin una capa de seguridad propia.
- La licencia Llama 3.2 Community impone restricciones de uso (política de uso aceptable de Meta) y obligaciones de atribución; el uso comercial está permitido bajo esas condiciones, pero el usuario es responsable de cumplirlas.
- Riesgo de alucinación y sesgos heredados del modelo base, no mitigados por la edición.
- Idiomas soportados no verificados específicamente en esta variante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ai-anytime/Llama-3.2-3B-Instruct-abliterated
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Herramienta ablate: https://github.com/AIAnytime/ablate
- Paper de referencia (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
