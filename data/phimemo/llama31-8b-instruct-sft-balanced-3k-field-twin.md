# PHIMemo/llama31-8b-instruct-sft-balanced-3k-field-twin

## Resumen

PHIMemo/llama31-8b-instruct-sft-balanced-3k-field-twin es un checkpoint de ajuste fino supervisado (SFT) del modelo Meta Llama 3.1 8B Instruct, publicado por el usuario PHIMemo. Según los metadatos del repositorio, forma parte de una línea de investigación sobre memorización en modelos de lenguaje, entrenado sobre datos clínicos sintéticos con un balanceo específico y una configuración denominada "field-twin". El repositorio expone múltiples pasos de entrenamiento (step-XXXXXX) como revisiones independientes, lo que sugiere que está pensado para el análisis de la dinámica de memorización a lo largo del proceso de ajuste fino.

El modelo no está orientado a uso final en producción: tiene cero descargas y cero likes, no declara licencia ni idiomas soportados, y su model card es mínima. Su relevancia radica en ser un artefacto de investigación reproducible para estudiar cómo un modelo base memoriza datos sintéticos clínicos durante el SFT, un tema crítico para el despliegue responsable de modelos en entornos sanitarios. El tamaño del repositorio (80,3 GB) sugiere la inclusión de múltiples checkpoints completos en precisión fp16 o similar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Llama 3.1 8B Instruct) |
| Parametros totales | 8.030 millones (base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de la base, no confirmado en el checkpoint) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (inferido por el repositorio; no confirmado en la model card) |

## Arquitectura y entrenamiento

La arquitectura base es la de Llama 3.1 8B Instruct: un transformer decoder-only con atención por consultas agrupadas (grouped query attention, GQA) con 8 cabezas de clave/valor, 32 capas, dimensiones ocultas de 4096 y una ventana de contexto de 128.000 tokens. El checkpoint se obtiene mediante ajuste fino supervisado (SFT) sobre un dataset sintético de temática clínica, balanceado y con una variante "field-twin" que no se detalla en la documentación pública. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. La ruta del repositorio original (`/home/kveni/orcd/pool/model-memo-diff/...`) indica que forma parte de un pipeline de investigación sobre diferencias de memorización entre variantes de entrenamiento.

## Capacidades

- Hereda las capacidades generales de Llama 3.1 8B Instruct: generación de texto, razonamiento, programación y matemáticas en su idioma de entrenamiento original.
- No se documentan capacidades específicas añadidas por el SFT más allá de la memorización de los datos clínicos sintéticos.
- No hay evidencia de soporte de tool calling, function calling ni modo agente en la información disponible.
- La etiqueta `memorization` sugiere que el modelo es un objeto de estudio para medir la retención de datos de entrenamiento, no un producto orientado a capacidades.
- No se confirma soporte multilingüe más allá del de la base Llama 3.1 (que cubre 8 idiomas: alemán, español, francés, hindi, inglés, italiano, portugués y tailandés).

## Casos de uso

- Investigación sobre memorización en modelos clínicos: el checkpoint permite estudiar cuándo y cómo el modelo memoriza datos sintéticos de pacientes durante el SFT, comparando pasos de entrenamiento para identificar puntos de inflexión en la retención de información.
- Auditoría de privacidad en modelos sanitarios: Se puede usar para evaluar si un modelo fine-tuned con datos clínicos puede extraer información sensible de sus pesos, un paso previo al despliegue en entornos regulados (HIPAA, GDPR).
- Desarrollo de técnicas de mitigación de memorización: Los checkpoints intermedios sirven como material para probar métodos de desmemorización o regularización de la pérdida de memorización.
- Reproducibilidad de experimentos de SFT: Al estar disponible en múltiples pasos, permite reproducir y verificar experimentos de otros grupos sobre la dinámica de entrenamiento de Llama 3.1.
- Comparación de variantes de dataset: La variante "balanced" y "field-twin" se puede comparar con otras variantes del mismo proyecto para estudiar el efecto del balanceo de datos en la memorización.
- Benchmark de herramientas de evaluación de privacidad: Se puede usar como caso de prueba para herramientas de extracción de datos de entrenamiento (membership inference, extracción de secuencias).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se reportan cifras de MMLU, HumanEval, GSM8K ni ninguna otra evaluación sobre este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en fp16 (8B parámetros × 2 bytes por parámetro), más overhead de activaciones y caché KV; en cuantización Q4_K_M se reduce a unos 5-6 GB.
- GPU recomendadas: una GPU consumer de 24 GB (RTX 3090, RTX 4090) permite inferencia fp16 con contexto moderado; para contexto completo de 128K se recomienda una GPU de 80 GB (A100, H100).
- Es viable en hardware de consumo con cuantización (GGUF) a través de llama.cpp u Ollama, aunque el objetivo del modelo es investigación, no inferencia ligera.
- Opciones de despliegue: vLLM o TGI para inferencia de alta productividad; llama.cpp para entornos de baja VRAM.
- Latencia y throughput: no disponibles; dependen del backend, la cuantización y el hardware utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PHIMemo/llama31-8b-instruct-sft-balanced-3k-field-twin | 8B | 128K (base) | no disponible | Repositorio público HF |
| Meta Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Repositorio oficial HF |
| PHIMemo/llama31-8b-instruct-sft-balanced-3k | 8B | no disponible | no disponible | Repositorio público HF |

La comparativa con la base Llama 3.1 es la más directa: el checkpoint hereda la arquitectura y los pesos iniciales, pero no se documenta si el rendimiento general se mantiene, mejora o degrada tras el SFT sobre datos clínicos sintéticos. La variante sin el sufijo "field-twin" es presumiblemente un checkpoint del mismo proyecto de investigación con un dataset de entrenamiento ligeramente distinto.

## Limitaciones y advertencias

- No se declara licencia de uso: esto impide su uso comercial sin riesgo legal, incluso si se parte de una base con licencia permisiva.
- El modelo está entrenado sobre datos clínicos sintéticos: su comportamiento en datos clínicos reales no está evaluado y puede ser erróneo o peligroso en contextos médicos.
- Es un checkpoint de investigación con cero descargas y sin validación externa: no se debe usar como base para sistemas en producción.
- La memorización es una característica intencionada del entrenamiento: el modelo puede reproducir datos del dataset de entrenamiento, lo que es un riesgo de privacidad si los datos sintéticos son derivados de datos reales.
- No se documentan sesgos conocidos, pero la base Llama 3.1 presenta sesgos de género, raza y religión documentados por Meta; el SFT clínico puede amplificar o modificar estos sesgos de forma desconocida.
- La fecha de creación (agosto de 2026) es posterior a la fecha de lanzamiento de la base (2024), pero no se indica qué versión exacta de Llama 3.1 se usó como punto de partida.
- El repositorio no especifica el formato de los pesos ni instrucciones de carga más allá de la referencia a revisiones `step-XXXXXX`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PHIMemo/llama31-8b-instruct-sft-balanced-3k-field-twin
- Repositorio de la variante sin "field-twin": https://huggingface.co/PHIMemo/llama31-8b-instruct-sft-balanced-3k
- Modelo base Llama 3.1 8B Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio oficial de Meta Llama 3: https://github.com/meta-llama/llama3
- Documentación de Meta sobre Llama 3.1 (prompt formats y model cards): https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_1/
