# MorinoNushi/GLM-5.3-Flash-Heretic-LoRA-V1

## Resumen

GLM-5.3-Flash-Heretic-LoRA-V1 es un adaptador LoRA de rango 1 desarrollado por MorinoNushi que aplica una técnica de ablación direccional ("abliteration") sobre el modelo base GLM-5.3-Flash de Z.ai, un MoE multimodal de 320B parámetros totales (18B activos) con ventana de contexto de 1M tokens. El adaptador suprime quirúrgicamente el comportamiento de rechazo del modelo base, reduciendo la tasa de negativa ante prompts dañinos del 95% al 26,43%, con una divergencia KL de solo 0,0682 en prompts inofensivos.

El adaptador se genera con heretic-gguf, un port nativo de la herramienta Heretic que ejecuta la búsqueda de ablación directamente sobre pesos GGUF cuantizados mediante optimización multi-objetivo con Optuna TPE. El repositorio contiene únicamente el adaptador (~28 MB), que se aplica en cómputo f32/f16 sobre cualquier cuantización GGUF del modelo base, sin necesidad de requantizar los ~160 GB del modelo original. Es una versión temprana (trial 8 de un estudio aún en curso), por lo que se esperan configuraciones más fuertes en el futuro.

La relevancia de este modelo radica en que demuestra la viabilidad de expresar la ablación direccional como un LoRA de rango 1, permitiendo activar o desactivar la decensura de forma instantánea y sin pérdida de los pesos base. Está dirigido a investigadores de seguridad en IA, red teaming y estudios de interpretabilidad, con advertencias explícitas sobre su uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 1 (ablación direccional) sobre GLM-5.3-Flash (MoE híbrido con KDA y sparse MLA attention) |
| Parametros totales | 14.606.336 (adaptador) |
| Parametros activos | No aplica (adaptador, no modelo independiente) |
| Longitud de contexto | Heredada del modelo base: 1M tokens |
| Tipos de cuantizacion | Adaptador en GGUF (f32/f16 compute); base compatible con cualquier cuantización GGUF (evaluado con UD-IQ4_XS) |
| Idiomas soportados | No disponible (el modelo base soporta inglés y chino, el adaptador no especifica) |
| Licencia | MIT |
| Formato de pesos | GGUF (adaptador) |

## Arquitectura y entrenamiento

El adaptador implementa una ablación direccional de rango 1, basada en el método Heretic. Se calcula la dirección de rechazo en el espacio residual como la diferencia de medias entre 480 prompts dañinos y 480 inofensivos, ortogonalizada contra la media de los inofensivos. Esta dirección se proyecta fuera de los pesos de salida de atención (attn.o_proj) y de las down-projections de los expertos MoE (routed y shared). Las intensidades, kernels por capa y selección de dirección se optimizan con Optuna TPE multi-objetivo, minimizando conjuntamente la tasa de rechazo y la divergencia KL.

El entrenamiento se realiza directamente sobre pesos GGUF cuantizados (UD-IQ4_XS) mediante llama.cpp, con un parche de una línea que corrige el enrutado de LoRA en las capas KDA (sin el parche, la ablación de atención no se aplica completamente en 31 de las 45 capas). La configuración del trial 8 incluye pesos máximos de 2,74 en attn.o_proj (capa 42,8), 1,29 en routed MLP down-proj (capa 32,7) y 2,05 en shared-expert down-proj (capa 42,5), con normalización de filas "pre" y escalado por experto según la frecuencia de enrutamiento dañino/inofensivo.

## Capacidades

- Elimina el comportamiento de rechazo del modelo base: reduce la tasa de negativa ante prompts dañinos del 95% al 26,43% (medido en 140 prompts).
- Mantiene las capacidades del modelo base con baja deriva: divergencia KL de 0,0682 en prompts inofensivos, lo que indica un cambio mínimo en el comportamiento normal.
- Se aplica como LoRA superpuesto: permite activar o desactivar la decensura instantáneamente sin modificar los pesos base.
- Compatible con llama.cpp y llama-server: se carga con el flag `--lora`, sin necesidad de parámetros de muestreo especiales.
- Preserva la integridad del modelo base: los pesos originales no se modifican ni se requantizan, lo que garantiza reproducibilidad bit a bit.
- Incluye metadatos de procedencia: el adaptador embebe información completa del estudio, trial, parámetros y puntuaciones en claves GGUF (`adapter.heretic.*`).

## Casos de uso

- Investigación en seguridad de IA: estudiar los mecanismos de rechazo en modelos de lenguaje y cómo la ablación direccional los elude, para diseñar mejores guardarraíles.
- Red teaming y evaluación de robustez: probar la resistencia del modelo base ante ataques adversarios y medir la eficacia de la ablación en entornos controlados.
- Generación creativa sin restricciones: para proyectos artísticos, literarios o de investigación donde el modelo base rechaza contenido legítimo (por ejemplo, ficción con violencia explícita o temas tabú).
- Desarrollo de herramientas de interpretabilidad: comparar el comportamiento del modelo con y sin la dirección de rechazo para entender cómo se representa internamente la negativa.
- Despliegue en entornos supervisados: en aplicaciones donde se requiere menos censura pero con moderación humana posterior, como generación de guiones o análisis de contenido sensible.
- Estudio de la técnica LoRA para ablación: validar que la ablación direccional puede expresarse como un adaptador de rango 1, lo que abre la puerta a aplicar el método a otros modelos GGUF.

## Benchmarks y rendimiento

Resultados medidos sobre un conjunto de evaluación de 140 prompts dañinos (100 de `mlabonne/harmful_behaviors` + 40 personalizados) y 100 prompts inofensivos (`mlabonne/harmless_alpaca`), con decodificación greedy y respuestas de 100 tokens, contra la base UD-IQ4_XS:

| Metrica | Modelo base | Con adaptador |
|---|---|---|
| Tasa de rechazo (prompts dañinos) | 95,00% (133/140) | 26,43% (37/140) |
| Divergencia KL (prompts inofensivos) | 0 (por definición) | 0,0682 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el adaptador no modifica las capacidades generales del modelo base, solo su comportamiento de rechazo.

## Requisitos de hardware

- El adaptador en sí es muy ligero (~28 MB), pero requiere el modelo base GLM-5.3-Flash en formato GGUF, que ocupa aproximadamente 160 GB en cuantización IQ4_XS.
- VRAM estimada: para la cuantización UD-IQ4_XS, se necesitan al menos 20-30 GB de VRAM para el modelo base, más overhead de contexto. Con 1M tokens de contexto, la VRAM puede superar los 80 GB.
- GPU recomendadas: A100 80GB, H100 80GB, o múltiples GPUs consumer (por ejemplo, 2-4 RTX 4090 de 24GB) con tensor splitting.
- En consumer GPU: es posible con cuantizaciones más agresivas (Q2_K, Q3_K) y offloading parcial a CPU, pero con degradación de rendimiento.
- Opciones de despliegue: llama.cpp / llama-server (con el parche para KDA layers), compatible con Ollama si se integra el adaptador. vLLM no soporta LoRA GGUF directamente.
- Latencia y throughput: no disponible en la información proporcionada; depende de la cuantización, el número de GPUs y la longitud de contexto.

## Comparativa con modelos similares

No hay una comparativa directa disponible con otros adaptadores de ablación para GLM-5.3-Flash, ya que este es el primer lanzamiento público de heretic-gguf. Como referencia, se puede comparar con el modelo base y con métodos alternativos de decensura:

| Modelo | Parametros | Contexto | Licencia | Metodo de decensura |
|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B total / 18B activo | 1M | MIT | Ninguno (rechaza 95% de prompts dañinos) |
| GLM-5.3-Flash-Heretic-LoRA-V1 | 14,6M (adaptador) | 1M (heredado) | MIT | Ablación direccional (LoRA rango 1) |
| Modelos abliterados completos (ej. Dolphin) | Varía | Varía | Varía | Ablación direccional fusionada en pesos |

La ventaja del adaptador frente a modelos fusionados es que no requiere requantizar el modelo base y permite alternar entre comportamiento censurado y no censurado sin recargar pesos.

## Limitaciones y advertencias

- El adaptador elimina los guardarraíles de seguridad del modelo base, lo que puede generar contenido ofensivo, perturbador, odioso, sexualmente explícito, violento o instrucciones detalladas para actos dañinos o ilegales. Es la consecuencia directa y buscada de la ablación.
- La tasa de rechazo no se reduce a cero: aún rechaza el 26,43% de los prompts dañinos, por lo que no es una decensura completa.
- La divergencia KL de 0,0682 se midió contra la cuantización UD-IQ4_XS; con otras cuantizaciones, la deriva efectiva puede variar.
- Requiere un parche en llama.cpp (PR #27754) para soportar el modelo base, y un parche adicional para que la ablación de atención se aplique completamente en las capas KDA. Sin el parche, el efecto es más débil.
- Es una versión temprana (trial 8 de un estudio Optuna en curso); no es el producto final y se esperan configuraciones más fuertes.
- El adaptador fue optimizado contra un conjunto específico de prompts dañinos; su comportamiento en otros dominios no está garantizado.
- Aunque la licencia es MIT, el uso del adaptador para generar contenido ilegal o dañino puede violar leyes locales o políticas de plataformas. El autor declina toda responsabilidad.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/MorinoNushi/GLM-5.3-Flash-Heretic-LoRA-V1
- Modelo base GLM-5.3-Flash: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantización GGUF de unsloth: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Heretic original: https://github.com/p-e-w/heretic
- heretic-gguf: https://github.com/MoriNoNushi/heretic-gguf
- PR de llama.cpp para GLM-5.3-Flash: https://github.com/ggml-org/llama.cpp/pull/27754
- Documentación de unsloth para GLM-5.3-Flash: https://unsloth.ai/docs/models/glm-5.3-flash
- Recetas vLLM para GLM-5.3-Flash: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
