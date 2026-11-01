# P0u4a/LiteCoT-Qwen2.5-Coder-0.5B

## Resumen

LiteCoT-Qwen2.5-Coder-0.5B es un ajuste fino supervisado (SFT) a parámetros completos del modelo Qwen2.5-Coder-0.5B de Qwen, realizado por el usuario P0u4a. El entrenamiento se ha llevado a cabo sobre el dataset SmallDoge/SmallThoughts, previamente depurado estructuralmente, aplicando una adaptación independiente de la receta de SFT LiteCoT, publicada originalmente en GitHub, a un modelo de código de 0.5B parámetros.

El objetivo del modelo es dotar de capacidades de razonamiento tipo chain-of-thought (CoT) ligero a un modelo de código muy pequeño, de forma que pueda ejecutarse en hardware modesto. La relevancia de esta ficha radica en la tendencia actual de destilar razonamiento en modelos compactos: con menos de 500 millones de parámetros, este modelo puede servir como base experimental para estudiar cómo las técnicas de razonamiento escalan (o no) en modelos de tamaño mínimo. El modelo base es un transformer decoder-only de la familia Qwen2.5, y el resultado se distribuye en formato safetensors bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parámetros totales | 494.032.768 (494 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-Coder-0.5B soporta 32.768 tokens, pero no figura en la model card) |
| Tipos de cuantización | no disponible (solo pesos originales en safetensors) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-0.5B, un transformer decoder-only de la familia Qwen2.5 orientado a generación de código. El ajuste fino es de parámetros completos (full-parameter SFT), es decir, se actualizan todos los pesos del modelo en lugar de usar técnicas como LoRA. El dataset empleado es SmallDoge/SmallThoughts, sometido a una limpieza estructural previa según indica el autor.

La receta de entrenamiento es una adaptación independiente del método LiteCoT, una técnica de SFT orientada a razonamiento con cadenas de pensamiento ligeras. Un dato técnico destacable es la frugalidad del entrenamiento: se realizó en dos GPUs NVIDIA T4 (16 GB de VRAM cada una), lo que demuestra que este tipo de fine-tuning es viable en hardware de nube de bajo coste. No se ha publicado información sobre el número de tokens de entrenamiento, hiperparámetros concretos (learning rate, épocas, batch size) ni sobre el uso de RLHF o DPO posterior.

## Capacidades

- Generación de texto en inglés con formato conversacional (pipeline text-generation).
- Razonamiento tipo chain-of-thought ligero (LiteCoT), heredado del fine-tuning sobre SmallThoughts.
- Generación de código, heredada del modelo base Qwen2.5-Coder-0.5B, aunque el fine-tuning sobre datos de razonamiento puede haber modificado este comportamiento.
- No hay información publicada sobre soporte de tool calling o function calling.
- No hay información publicada sobre capacidades de agentes, visión o audio.
- Soporte multilingüe limitado: la model card declara únicamente el inglés.

## Casos de uso

- Experimentación con razonamiento en modelos pequeños: al pesar menos de 500 M de parámetros, es idóneo para investigar cómo las recetas de SFT con CoT afectan a modelos mínimos, por ejemplo comparando respuestas con y sin razonamiento intermedio en problemas sencillos.
- Prototipado local en portátiles: cabe con holgura en GPUs de consumo o incluso en CPU, lo que permite probar pipelines de razonamiento sin necesidad de infraestructura de nube.
- Generación de código asistida en entornos restringidos: puede usarse para autocompletado o generación de fragmentos de código sencillos en IDEs donde no se disponga de GPU dedicada, aprovechando la herencia de Qwen2.5-Coder.
- Educación y docencia: útil como modelo de demostración en cursos sobre fine-tuning supervisado, ya que todo el pipeline (base, dataset, receta LiteCoT) es público y replicable en dos T4.
- Razonamiento paso a paso en problemas matemáticos o lógicos sencillos: el dataset SmallThoughts está orientado a razonamiento, por lo que el modelo puede descomponer problemas simples antes de responder.
- Base para destilación adicional: puede servir como punto de partida para cuantizaciones, poda o nuevos fine-tunings por parte de la comunidad, dado su tamaño reducido y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1 GB para los pesos (494 M × 2 bytes), más la sobrecarga de activaciones y KV cache; en la práctica, 2-3 GB son suficientes para contextos moderados.
- Con cuantización a 4 bits (por ejemplo, GGUF Q4_K_M), los pesos ocuparían en torno a 300-400 MB, viable en cualquier GPU moderna o en CPU.
- Compatible con GPUs de consumo: RTX 3060, RTX 4060 o superiores con enorme margen; también ejecutable en CPU con llama.cpp a velocidades razonables dado su tamaño.
- El propio entrenamiento del modelo se realizó en 2× NVIDIA T4 (16 GB), lo que indica que fine-tunings similares son accesibles en hardware de bajo coste.
- Opciones de despliegue: transformers de Hugging Face (librería nativa del modelo), text-generation-inference (etiqueta presente en la model card), y con conversión previa, llama.cpp, Ollama y vLLM.
- No hay datos publicados de latencia o throughput; al ser un modelo de ~0,5B, se espera inferencia rápida incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LiteCoT-Qwen2.5-Coder-0.5B | 494 M | no disponible (base: 32.768 tokens) | Apache 2.0 | Código + razonamiento ligero (SFT LiteCoT) |
| Qwen/Qwen2.5-Coder-0.5B (base) | 494 M | 32.768 tokens | Apache 2.0 | Código puro, sin SFT de razonamiento |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | Qwen Research / condicional comercial | Uso general instruct, no especializado en código |

Frente a su modelo base, este fine-tuning añade comportamiento de razonamiento tipo CoT a costa de posible degradación en tareas de código puro, algo que el autor no ha cuantificado con benchmarks. Frente a Qwen2.5-0.5B-Instruct, ofrece un enfoque más especializado y una licencia Apache 2.0 sin restricciones adicionales.

## Limitaciones y advertencias

- Tamaño muy reducido (494 M): la calidad de razonamiento y de código será notablemente inferior a la de modelos de 7B o superiores; el riesgo de alucinación y de errores lógicos es alto.
- El fine-tuning sobre SmallThoughts (datos de razonamiento) puede haber producido catastrophic forgetting de las capacidades de código del modelo base; no hay benchmarks que lo confirmen o desmienta.
- Idioma limitado al inglés según la model card; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto no documentada en la model card del fine-tuning; debe verificarse empíricamente antes de usar contextos largos.
- Sesgos: hereda los sesgos del modelo base Qwen2.5-Coder y del dataset SmallThoughts; no existe análisis de sesgos publicado.
- Licencia Apache 2.0: permite uso comercial sin restricciones significativas, aunque conviene revisar también la licencia del dataset de entrenamiento.
- Proyecto comunitario con pocas descargas (308) y sin likes en el momento de la ficha: falta de validación por parte de la comunidad; no recomendado para producción sin evaluación propia.
- No hay datos de benchmarks, lo que impide comparar objetivamente su rendimiento frente al modelo base o alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/P0u4a/LiteCoT-Qwen2.5-Coder-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/SmallDoge/SmallThoughts
- Repositorio LiteCoT (receta original): https://github.com/evanwu1125/litecot
