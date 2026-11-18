# mosetireagan/reagangpt

## Resumen

ReaganGPT es un modelo de lenguaje de tipo decoder-only autoregressive con arquitectura GPT, desarrollado por Reagan Moseti (usuario `mosetireagan` en Hugging Face) y entrenado completamente desde cero en PyTorch nativo, sin depender de pesos preentrenados ni de modelos fundacionales externos. La versión 0.2, publicada en noviembre de 2026, constituye un ejercicio de escalado controlado y evaluación independiente sobre un corpus ampliado, con tokenizador BPE propio de 2.000 tokens y vocabulario cerrado con byte fallback.

El modelo se distribuye en dos variantes: ReaganGPT 0.2 Micro (1.082.112 parámetros totales, contexto de 256 tokens) y ReaganGPT 0.2 Small (5.382.144 parámetros, contexto de 512 tokens). Ambas emplean bloques Pre-LayerNorm con weight tying entre la matriz de embeddings y la proyección de salida. Su relevancia es fundamentalmente pedagógica y de investigación: documenta de forma transparente el proceso de construcción de un LM desde cero, incluyendo procedencia del corpus, aislamiento de particiones y métricas de perplejidad sobre un conjunto de test estrictamente reservado.

No debe confundirse con un modelo de propósito general. Con 1-5 millones de parámetros y un corpus de entrenamiento de aproximadamente 1,37 MB (~710.000 tokens), su capacidad generativa es muy limitada y su utilidad práctica se circunscribe a experimentación, docencia y validación de pipelines de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autoregressive (GPT), Pre-LayerNorm, weight tying |
| Parametros totales | 1.082.112 (0.2 Micro) / 5.382.144 (0.2 Small) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (0.2 Micro) / 512 tokens (0.2 Small) |
| Tipos de cuantizacion | No disponible (pesos en PyTorch nativo; no se documentan formatos cuantizados) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoints PyTorch nativos (no se distribuyen safetensors ni GGUF) |

## Arquitectura y entrenamiento

ReaganGPT emplea bloques Transformer decoder-only con Pre-LayerNorm, atención causal multi-cabeza y weight tying entre la matriz de embeddings de tokens y la proyección final de language modeling. La configuración 0.2 Micro usa `d_model=128`, 4 capas, 4 cabezas de atención de dimensión 32 y contexto de 256 tokens; la 0.2 Small escala a `d_model=256`, 6 capas, 8 cabezas y contexto de 512. Existe una configuración objetivo ReaganGPT-Base (`d_model=512`, 8 capas, contexto 1.024, vocabulario 16.000, 33.936.384 parámetros) que no se ha publicado como checkpoint en la información disponible.

El entrenamiento se realizó desde cero con inicialización aleatoria, sin RLHF ni DPO documentados. El corpus 0.2 consta de 1.852 documentos (1.434.348 caracteres, ~710.000 tokens) procedentes de tres colecciones con licencias permisivas: TinyShakespeare (dominio público), WikiText-2 (CC BY-SA 3.0) y fundamentos de informática y matemáticas (CC0-1.0). Se aplicó deduplicación exacta por SHA-256 y filtrado de casi-duplicados por Jaccard de n-gramas, con partición determinista 80/10/10 basada en hash (1.481 documentos de entrenamiento, 185 de validación, 186 de test). El tokenizador BPE se reentrenó a 2.000 tokens tras comparar configuraciones de 1K, 2K y 4K, seleccionando la de 2K por su equilibrio entre compresión (2,01 caracteres/token) y utilización del vocabulario (87,8%).

## Capacidades

- Generación de texto autoregresiva en inglés sobre dominios limitados al corpus de entrenamiento (literatura clásica, conocimiento enciclopédico y fundamentos técnicos).
- Modelado de lenguaje a nivel de token con soporte de byte fallback en el tokenizador, lo que garantiza tasa cero de tokens fuera de vocabulario (OOV).
- Capacidad de continuación de texto condicionada por prompt, con control de temperatura en la generación.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni multimodalidad.
- Multilingüismo: únicamente inglés; no se documenta entrenamiento en otros idiomas.

## Casos de uso

- Docencia de arquitecturas Transformer: el modelo sirve como ejemplo mínimo y reproducible de un GPT funcional (1,08 M de parámetros) para ilustrar atención causal, weight tying y Pre-LayerNorm en un curso o taller.
- Validación de pipelines de entrenamiento: la documentación de splits por hash, deduplicación SHA-256 y métricas de perplejidad permite usar el repositorio como plantilla para verificar que un pipeline propio no presenta fugas de datos.
- Experimentación con tokenizadores BPE: el análisis comparativo entre vocabularios de 1K, 2K y 4K con métricas de compresión y utilización constituye un caso de estudio replicable para ajustar el tamaño de vocabulario a corpus pequeños.
- Investigación sobre generalización en modelos pequeños: la comparación entre 0.1 y 0.2 (perplejidad de test de 137,59 a 48,26 en Micro) permite estudiar cómo el volumen y la calidad del corpus afectan a la divergencia y al sobreajuste.
- Generación de texto de demostración en entornos educativos: con prompts sobre literatura o conceptos técnicos, el modelo produce continuaciones coherentes a nivel local dentro de su ventana de 256-512 tokens.
- Referencia para pruebas de infraestructura de inferencia: al ser un checkpoint PyTorch nativo de tamaño mínimo, resulta útil para probar scripts de carga, generación y integración con `huggingface_hub` antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Evaluación independiente sobre 186 documentos de test estrictamente reservados (144.644 caracteres):

| Modelo | Checkpoint | Params totales | Loss (CE) | Perplejidad | Bits por byte |
|---|---|---|---|---|---|
| Baseline aleatorio (sin entrenar) | random init | 1.082.112 | 7,6128 | 2023,84 | 5,5353 |
| ReaganGPT 0.1 Micro | `checkpoints/reagangpt-micro` | 943.616 | 4,9243 | 137,59 | 4,6483 |
| ReaganGPT 0.1 Small | `checkpoints/reagangpt-small` | 5.105.152 | 4,8767 | 131,19 | 4,6034 |
| ReaganGPT 0.2 Micro | `checkpoints/reagangpt-v02-micro` | 1.082.112 | 3,8765 | 48,26 | 2,8186 |
| ReaganGPT 0.2 Small | `checkpoints/reagangpt-v02-small` | 5.382.144 | 3,9570 | 52,30 | 2,8872 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en ambos casos; los checkpoints ocupan en torno a 0,2 GB en el repositorio, por lo que caben holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100); el modelo no aprovecha aceleradores de gama alta por su tamaño.
- Cabe en CPU: la inferencia es viable en CPU sin GPU dedicada, dado el reducido número de parámetros.
- Opciones de despliegue: el repositorio proporciona scripts propios (`generate.py`) y API Python (`ReaganGPT.from_pretrained`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, al no distribuirse pesos en formatos estándar como safetensors o GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ReaganGPT 0.2 Small | 5,38 M | 512 | Apache-2.0 | Hugging Face (PyTorch nativo) |
| ReaganGPT 0.2 Micro | 1,08 M | 256 | Apache-2.0 | Hugging Face (PyTorch nativo) |
| GPT-2 Small (referencia de escala) | 124 M | 1.024 | MIT | Hugging Face (safetensors, GGUF) |
| TinyLlama 1.1B (referencia de escala) | 1,1 B | 2.048 | Apache-2.0 | Hugging Face (safetensors, GGUF) |

No se dispone de comparaciones directas con modelos de escala equivalente (1-10 M de parámetros) en la información proporcionada. Las alternativas incluidas se ofrecen únicamente como referencia de escala y de ecosistema de despliegue; la diferencia de órdenes de magnitud en parámetros y datos de entrenamiento hace que cualquier comparación de rendimiento carezca de sentido.

## Limitaciones y advertencias

- Capacidad generativa muy limitada: con 1-5 M de parámetros y ~710.000 tokens de entrenamiento, el modelo no alcanza fluidez conversacional ni razonamiento complejo; las continuaciones pueden ser incoherentes más allá de frases cortas.
- Riesgo elevado de alucinación y de producción de texto gramatical pero factualmente incorrecto, especialmente fuera de los dominios del corpus.
- Ventana de contexto muy corta (256-512 tokens), insuficiente para documentos largos o conversaciones multi-turno.
- Entrenado exclusivamente en inglés; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Sesgos: el corpus incluye literatura clásica y textos enciclopédicos, por lo que puede reproducir sesgos históricos y culturales presentes en esas fuentes; no se documenta ningún proceso de mitigación.
- Licencia Apache-2.0 permite uso comercial, pero la calidad del modelo hace inviable su uso en producción real; cualquier despliegue comercial requeriría un modelo de mayor escala.
- No se distribuyen pesos en formatos estándar (safetensors, GGUF), lo que limita la integración con herramientas de inferencia habituales.
- La model card original está truncada en la información disponible; algunos detalles de la fase de evaluación (por ejemplo, la comparación completa de divergencia entre 0.1 y 0.2) no pueden verificarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mosetireagan/reagangpt
- Repositorio clonable (mismo endpoint): https://huggingface.co/mosetireagan/reagangpt
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
