# HuggingAnalist/TinyAmlGpt-Med-e0.07-l1.5

## Resumen

TinyAmlGpt-Med-e0.07-l1.5 es un modelo de lenguaje autorregresivo (decoder-only) de 123,5 millones de parámetros, desarrollado por HuggingAnalist (AnonymousCat) como artefacto de investigación para estudiar objetivos de entrenamiento a pequeña escala. Está entrenado exclusivamente sobre el corpus sintético TinyStories, compuesto por relatos breves en inglés sencillo dirigidos a niños pequeños. Su principal innovación es el uso de un objetivo de auto-destilación enmascarada (AML, por sus siglas en inglés), que combina la pérdida de entropía cruzada estándar con restricciones de proximidad entre subredes anidadas y el modelo denso.

El modelo presenta una arquitectura GPT clásica de 12 capas, dimensión oculta 768 y 12 cabezas de atención, con una ventana de contexto de 1024 tokens. Se entrenó durante 20.000 pasos con 1.310 millones de tokens en total, alcanzando una perplejidad de validación de 3,28. Aunque no es un modelo de propósito general, resulta relevante para la comunidad de investigación por su enfoque novedoso de destilación con máscaras fijas y su análisis de coste de inferencia por niveles de densidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT (decoder-only, 12 capas, d_model 768, 12 cabezas) |
| Parametros totales | 123.551.232 (84.953.856 no-embedding) |
| Parametros activos | Dense: 123.551.232; nivel 1: 81.083.904; nivel 2: 59.852.288 (MoE-like por máscaras) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (entrenado en bf16, sin cuantizaciones publicadas) |
| Idiomas soportados | Inglés (limitado al vocabulario de TinyStories) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT estándar: bloques de atención multi-cabeza con normalización previa, feed-forward y conexiones residuales. La innovación reside en el objetivo de entrenamiento AML (masked self-distillation). Durante el entrenamiento, además de la pérdida de entropía cruzada sobre el modelo denso, se generan subredes anidadas mediante un proceso de adelgazamiento de Bernoulli iterado (cada nivel aplica una máscara binaria fija con probabilidad ρ=0,5). La pérdida total combina la CE con una suma de términos hinge que penalizan la divergencia KL entre la distribución de cada subred y la del modelo denso (con gradiente detenido), pero solo cuando esa divergencia supera un umbral ε_j. Esto convierte la proximidad en una restricción, no en un objetivo: dentro de la bola de tolerancia, el gradiente se anula y cada nivel puede ocupar cualquier punto cercano a la referencia.

El entrenamiento se realizó con el tokenizer BPE de GPT-2 (vocabulario de 50.257), secuencias de 1024 tokens, lotes de 65.536 tokens por paso, 20.000 pasos y un total de 1.310 millones de tokens. Se usó AdamW con tasa de aprendizaje 0,0004, warmup de 1000 pasos y weight decay 0,1, en precisión bf16. Los hiperparámetros del objetivo AML son: λ=1,5, niveles m=2, ρ=0,5, ε=0,07, γ=1,0, con umbrales ε_j = [0,14, 0,28] y semilla de máscara 0.

## Capacidades

- Generación de texto en inglés simple, limitado al dominio de TinyStories (historias cortas con vocabulario restringido).
- No sigue instrucciones ni admite prompts de sistema; es un modelo de continuación de texto puro.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No soporta visión, audio ni multimodalidad.
- Capacidad multilingüe: no disponible; solo inglés básico del corpus.
- Ofrece tres niveles de densidad (dense, 0,5 y 0,25) mediante máscaras fijas, aunque el coste de inferencia no se reduce porque las máscaras solo anulan pesos sin eliminar operaciones matriciales.

## Casos de uso

- Investigación en objetivos de entrenamiento: el modelo sirve para estudiar el efecto de la auto-destilación enmascarada sobre la calidad de generación y la regularización implícita, comparando con un GPT-2 pequeño entrenado con CE estándar.
- Análisis de subredes y pruning: permite examinar cómo se comportan subredes de distinta densidad dentro de un mismo modelo, sin necesidad de reentrenar, para entender la relación entre capacidad y rendimiento.
- Generación de historias infantiles controladas: dado su entrenamiento exclusivo en TinyStories, puede producir relatos coherentes dentro de ese dominio, útil para prototipos de generación de cuentos simples.
- Benchmark de perplejidad en corpus sintéticos: sirve como referencia para medir la eficiencia de otros objetivos de entrenamiento en un entorno de datos pequeño y controlado.
- Estudio de la relación entre pérdida de validación y densidad de parámetros: los niveles 1 y 2 permiten observar cómo degrada la perplejidad al reducir la fracción de pesos activos, sin cambios en la arquitectura.
- Educación y divulgación: por su tamaño reducido y licencia Apache-2.0, es adecuado para demostraciones didácticas de entrenamiento de modelos de lenguaje y de técnicas de destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas de validación sobre TinyStories:

| Metrica | Valor |
|---|---|
| Pérdida de validación | 1,1881 |
| Perplejidad de validación | 3,28 |
| Mejor pérdida de validación | 1,2309 |

Además, se midió el coste de inferencia en una NVIDIA A100-SXM4-80GB (bf16) con prompt de 30 tokens y decodificación de 64 tokens (mediana de 5 ejecuciones):

| Nivel | Parámetros activos | Densidad | Prefill (tok/s) | Decode (tok/s) | ms/token |
|---|---|---|---|---|---|
| Dense | 123.551.232 | 1,000 | 2.185 | 63,1 | 15,86 |
| Nivel 1 | 81.083.904 | 0,500 | 2.236 | 63,9 | 15,64 |
| Nivel 2 | 59.852.288 | 0,250 | 2.191 | 64,1 | 15,61 |

## Requisitos de hardware

- VRAM estimada: el modelo tiene 123,5M de parámetros; en bf16 ocupa aproximadamente 247 MB solo de pesos, más overhead de activaciones y optimizador. Cabe en cualquier GPU consumer con al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, etc.) es suficiente para inferencia. Las mediciones del autor se realizaron en A100, pero no es necesaria.
- Despliegue: no es compatible con transformers; requiere el código personalizado del autor (clonar el repositorio y usar `build_model`). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia: en A100, ~15,6-15,9 ms/token en decodificación, independientemente del nivel de densidad (las máscaras no reducen el coste computacional).

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos de la misma categoría (entrenados con objetivos de destilación enmascarada). Como referencia arquitectónica, es comparable a GPT-2 small (124M) en tamaño y estructura, pero su entrenamiento en TinyStories y su objetivo AML lo hacen específico para investigación. No hay información pública sobre otros modelos con el mismo objetivo, por lo que la comparativa directa no está disponible.

## Limitaciones y advertencias

- El modelo solo ha visto TinyStories, un corpus sintético de historias simples; no posee conocimiento factual del mundo ni capacidad de razonamiento general.
- No sigue instrucciones ni admite diálogo; genera texto fluido pero sin fundamento real, con riesgo alto de alucinación.
- Vocabulario y dominio muy restringidos: no es útil para tareas fuera de la generación de cuentos infantiles en inglés.
- La implementación es personalizada y no compatible con la API estándar de transformers, lo que dificulta su integración en pipelines existentes.
- Las máscaras de densidad no reducen la latencia; el coste de inferencia es idéntico al del modelo denso, lo que limita su utilidad práctica para despliegue eficiente.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no está diseñado para producción y carece de garantías de calidad o seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HuggingAnalist/TinyAmlGpt-Med-e0.07-l1.5
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Perfil del autor: https://huggingface.co/HuggingAnalist
