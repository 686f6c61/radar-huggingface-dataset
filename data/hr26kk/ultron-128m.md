# HR26kk/ULTRON-128M

## Resumen

ULTRON-128M es un modelo de lenguaje causal (causal-LM) desarrollado por el usuario HR26kk, preentrenado desde cero (from scratch) sobre un corpus de 65,5 millones de tokens limpios. Se trata de un modelo compacto de 151 millones de parámetros totales, de los cuales aproximadamente 125,8 millones corresponden a parámetros no-embedding, entrenado en dos GPUs Tesla T4. El modelo está etiquetado como "Generation 2" dentro de la serie ULTRON del autor.

La relevancia de este modelo reside en su carácter didáctico y experimental: es un ejemplo de preentrenamiento desde cero con recursos de hardware limitados (dos T4), lo que lo convierte en un caso de estudio interesante para desarrolladores que quieran entender el pipeline completo de entrenamiento de un LLM sin acceso a infraestructura de gran escala. Su arquitectura incorpora elementos modernos como Grouped-Query Attention (GQA), SwiGLU y RoPE, lo que lo sitúa técnicamente al nivel de modelos mucho más grandes en cuanto a diseño, aunque con una capacidad limitada por su tamaño y volumen de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con GQA (12 query heads, 4 KV heads) |
| Parametros totales | 151.022.336 (~151M) |
| Parametros activos | 151.022.336 (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, code |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ULTRON-128M es un transformer decoder causal de 16 capas con hidden size de 768, intermediate size de 2048 con activación SwiGLU y 12 cabezas de atención con Grouped-Query Attention en proporción 3:1 (12 query heads frente a 4 key/value heads). El vocabulario es de 32.768 tokens mediante Byte-Level BPE, y las posiciones se codifican con RoPE con theta de 500.000. El contexto máximo es de 2048 tokens.

El entrenamiento se realizó desde cero sobre 65.536.000 tokens limpios en dos GPUs Tesla T4. No se menciona en la información disponible el uso de técnicas de alineación como RLHF o DPO, ni la composición exacta del dataset de entrenamiento más allá de que incluye texto en inglés y código. El número de tokens de entrenamiento es reducido en comparación con modelos de la misma escala, lo que probablemente limite la capacidad del modelo para generalizar más allá de los dominios vistos durante el entrenamiento.

## Capacidades

- Generación de texto causal en inglés y código.
- Modelado de lenguaje autorregresivo estándar (causal-LM).
- Capacidad de procesar secuencias de hasta 2048 tokens gracias a RoPE.
- Soporte de Byte-Level BPE, lo que permite manejar vocabulario abierto sin tokens desconocidos.
- No se mencionan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Experimentación educativa: el modelo es adecuado para estudiar el pipeline completo de preentrenamiento de un LLM, desde la tokenización hasta la inferencia, gracias a su tamaño reducido y su entrenamiento desde cero.
- Fine-tuning de dominio específico: al ser un modelo pequeño con licencia Apache-2.0, puede fine-tunearse en tareas concretas de generación de texto o código sin grandes requisitos de hardware.
- Prototipado rápido: su tamaño permite iterar rápidamente en experimentos de generación de texto en inglés o código antes de escalar a modelos mayores.
- Benchmarking de técnicas de eficiencia: útil para probar métodos de cuantización, destilación o pruning en un modelo de tamaño manejable.
- Generación de código asistida en entornos con recursos limitados: puede emplearse como autocompletado básico de código en inglés, aunque con expectativas modestas dado el volumen de entrenamiento.
- Investigación en interpretabilidad: su arquitectura moderna (GQA, SwiGLU, RoPE) en un tamaño pequeño facilita el análisis de mecanismos internos de atención y representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 151M de parámetros en fp32 (~604 MB). En fp16 serían ~302 MB, y en int8 ~151 MB. Cabe holgadamente en cualquier GPU consumer con al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM. Una RTX 3060, RTX 4060 o superior sería suficiente para inferencia y fine-tuning ligero.
- Inferencia en CPU: viable con llama.cpp u otras herramientas de inferencia en CPU, aunque la latencia dependerá del hardware.
- Opciones de despliegue: al ser un modelo pequeño con pesos en safetensors, puede convertirse a GGUF para su uso con llama.cpp u Ollama, o servirse con vLLM o TGI si se desea mayor throughput.
- Latencia y throughput: no se han publicado datos específicos, pero para un modelo de 151M de parámetros la generación es de decenas de tokens por segundo incluso en CPU modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ULTRON-128M | 151M | 2048 | Apache-2.0 | Entrenado desde cero con 65,5M tokens |
| GPT-2 Small | 124M | 1024 | MIT | Entrenado con ~40 GB de texto (mucho más datos) |
| TinyLlama 1.1B | 1.1B | 2048 | Apache-2.0 | Mucho mayor, entrenado con 3T tokens |

Comparado con GPT-2 Small, ULTRON-128M tiene una arquitectura más moderna (GQA, SwiGLU, RoPE) y mayor contexto, pero fue entrenado con una fracción mínima de los datos de GPT-2, lo que probablemente se traduzca en una calidad de generación inferior. TinyLlama, aunque mucho más grande, demuestra lo que se puede lograr con la misma licencia y arquitectura moderna cuando se dispone de más recursos de entrenamiento.

## Limitaciones y advertencias

- El modelo fue entrenado con solo 65,5 millones de tokens, una cantidad muy reducida incluso para su tamaño. Esto limita severamente su capacidad de generalización y calidad de generación.
- No se dispone de información sobre sesgos, alucinaciones o evaluación de seguridad. Dado el pequeño volumen de datos, es probable que presente sesgos no mitigados y una tendencia a alucinar mayor que modelos mejor entrenados.
- El contexto de 2048 tokens es modesto para aplicaciones que requieran ventanas largas.
- Solo se declaran soporte para inglés y código; el rendimiento en otros idiomas no está garantizado.
- No hay evidencia de fine-tuning con técnicas de alineación (RLHF, DPO), por lo que el modelo puede producir contenido no deseado o incoherente.
- El autor no proporciona información sobre cuantizaciones, benchmarks ni comparativas, lo que dificulta evaluar su rendimiento relativo.
- El proyecto parece tener un propósito principalmente experimental o educativo; no se recomienda su uso en producción sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HR26kk/ULTRON-128M
- No se han encontrado otros enlaces relevantes (papers, repositorios de código, demos) en la búsqueda web. Los resultados de búsqueda para "Ultron" corresponden a proyectos no relacionados con este modelo.
