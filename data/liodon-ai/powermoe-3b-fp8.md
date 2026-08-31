# liodon-ai/PowerMoE-3b-FP8

## Resumen

PowerMoE-3b-FP8 es una cuantización en FP8 (precisión de 8 bits en coma flotante) del modelo PowerMoE-3b, desarrollado por IBM Research, publicada por el laboratorio independiente Liodon AI. El modelo original es un pequeño Mixture-of-Experts (MoE) de aproximadamente 3.3 mil millones de parámetros, diseñado para ofrecer una inferencia eficiente en entornos con recursos limitados. Esta versión cuantizada reduce el tamaño del repositorio de 13,5 GB a 3,5 GB, lo que permite ejecutar el modelo en GPUs con menos memoria y acelerar la inferencia, manteniendo una calidad cercana a la del modelo original.

La cuantización utiliza el esquema FP8_DYNAMIC implementado con la librería llm-compressor: los pesos se convierten a FP8 (formato E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Este enfoque no requiere un conjunto de datos de calibración, por lo que los pesos cuantizados son una conversión directa de los originales, sin sesgo introducido por datos de calibración. La capa `lm_head` se deja sin cuantizar, práctica estándar para evitar una degradación desproporcionada de la calidad.

La relevancia de este modelo radica en su capacidad para desplegar un MoE de 3B en hardware de consumo moderno (GPUs con compute capability ≥ 8.9) y en su compatibilidad con motores de inferencia populares como vLLM, TGI y SGLang. Es una opción atractiva para desarrolladores que necesitan un modelo de lenguaje pequeño pero eficiente, con un footprint de memoria reducido y una integración sencilla en pipelines de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (GraniteMoE, según etiqueta del repositorio) |
| Parametros totales | 3.298.788.864 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3) dinámico; también existe versión GGUF (1,9 GB) según fuentes externas |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (también disponible en GGUF) |

## Arquitectura y entrenamiento

El modelo base PowerMoE-3b, desarrollado por IBM Research, es un transformer con arquitectura Mixture-of-Experts (MoE). Aunque no se han publicado detalles completos sobre el número de expertos, la dimensión del hidden state o el mecanismo de enrutamiento, la etiqueta `granitemoe` sugiere que sigue la familia de modelos Granite MoE de IBM. El entrenamiento del modelo base no está documentado en la información disponible; se desconoce el número de tokens, la composición del dataset y si se aplicaron técnicas como RLHF o DPO.

La cuantización FP8 realizada por Liodon AI no modifica la arquitectura subyacente, sino que convierte los pesos a FP8 (E4M3) por canal de forma estática y las activaciones a FP8 dinámicamente por token. Este esquema, denominado FP8_DYNAMIC, no requiere calibración, lo que simplifica el proceso y evita posibles sesgos. La capa `lm_head` se mantiene en precisión original (probablemente BF16) para preservar la calidad de la salida. El resultado es una reducción del tamaño del modelo de 13,5 GB a 3,5 GB, una compresión de aproximadamente el 74%.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente y contextualmente relevante, aunque su rendimiento en tareas complejas es limitado debido a su tamaño (MMLU del modelo base: 55).
- Razonamiento y matemáticas: se espera un rendimiento básico en tareas de razonamiento aritmético y lógico, típico de modelos de 3B.
- Generación de código: no hay datos específicos, pero los modelos de esta familia suelen tener capacidades limitadas de generación de código.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible; se desconoce si el modelo base fue entrenado con datos multilingües.
- Capacidades especiales: al ser una cuantización, no añade capacidades nuevas; se centra en eficiencia de inferencia.

## Casos de uso

- Inferencia eficiente en GPUs de consumo: gracias a su tamaño reducido (3,5 GB en FP8), el modelo puede ejecutarse en GPUs como RTX 4060, 4070 o 4080 con 8-12 GB de VRAM, lo que lo hace adecuado para aplicaciones locales o prototipos sin necesidad de hardware de centro de datos.
- Despliegue en producción con vLLM: el modelo es compatible con vLLM, lo que permite servir peticiones con alto throughput y baja latencia en entornos de producción, aprovechando la cuantización FP8 para reducir el uso de memoria y acelerar la inferencia.
- Chatbots y asistentes conversacionales: con una ventana de contexto razonable (aunque no especificada), puede gestionar conversaciones multi-turno en aplicaciones de atención al cliente o asistentes virtuales, siempre que el dominio sea acotado.
- Generación de texto en tiempo real: su tamaño compacto permite respuestas rápidas en aplicaciones de autocompletado, redacción de correos o generación de contenido breve.
- Prototipado rápido: los desarrolladores pueden iterar sobre el modelo en entornos con recursos limitados, gracias a su bajo footprint de memoria y a la compatibilidad con TGI y SGLang.
- Fine-tuning ligero: aunque la cuantización FP8 no es ideal para fine-tuning, el modelo base (PowerMoE-3b) podría adaptarse a tareas específicas antes de cuantizar; la versión FP8 es adecuada para inferencia directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la versión cuantizada FP8 en la información disponible. El modelo base PowerMoE-3b alcanza una puntuación de 55 en MMLU (según OpenModelMap), pero no se dispone de datos comparativos con otros modelos en la misma categoría. Se recomienda evaluar el modelo en el caso de uso concreto antes de su despliegue.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 3,5 GB en FP8; considerando overhead de activaciones y buffers, se estima un consumo de 4-5 GB para inferencia con batch pequeño. Para batch mayor, se necesitará más memoria.
- GPU recomendadas: NVIDIA con compute capability ≥ 8.9 (Ada, Hopper, Blackwell). Ejemplos: RTX 4060, 4070, 4080, 4090, L4, L40S, H100, H200, B100, B200, GB10. En GPUs con compute capability inferior (por ejemplo, RTX 30-series), vLLM/TGI dequantizarán los pesos a BF16, perdiendo la ventaja de velocidad y memoria.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), SGLang. También es posible usar llama.cpp con la versión GGUF (1,9 GB) para CPU o GPUs más antiguas.
- Latencia y throughput: no se dispone de datos medidos; dependerá del hardware y del motor de inferencia. En GPUs modernas con soporte FP8, se espera una mejora significativa frente a la versión BF16.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para PowerMoE-3b-FP8 frente a otros modelos de tamaño similar. A continuación se presenta una comparación estructural con alternativas comunes de ~3B parámetros:

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| PowerMoE-3b-FP8 (este) | 3,3B | MoE | no disponible | other | safetensors, GGUF |
| Phi-3-mini (Microsoft) | 3,8B | Densa | 4K (128K en variante) | MIT | safetensors, GGUF |
| Gemma-2-2B (Google) | 2,6B | Densa | 8K | Gemma license | safetensors, GGUF |
| Qwen2.5-3B (Alibaba) | 3,1B | Densa | 32K | Apache 2.0 | safetensors, GGUF |

La comparación se limita a características estructurales; no hay datos de benchmarks unificados para estos modelos en la información disponible.

## Limitaciones y advertencias

- Licencia: la licencia se indica como "other" sin especificar términos concretos. Es necesario revisar la documentación del modelo base (ibm-research/PowerMoE-3b) para conocer las restricciones de uso comercial y modificación.
- Pérdida de precisión: la cuantización FP8 puede introducir una ligera degradación en la calidad de las respuestas, especialmente en tareas que requieren alta precisión numérica o razonamiento complejo. No se han publicado evaluaciones que cuantifiquen esta pérdida.
- Requisitos de hardware: el modelo solo aprovecha la aceleración FP8 en GPUs con compute capability ≥ 8.9. En hardware más antiguo, la inferencia se realiza dequantizando a BF16, lo que anula los beneficios de memoria y velocidad.
- Sesgos y alucinaciones: no se dispone de información sobre sesgos específicos del modelo base. Como todo modelo de lenguaje, puede generar contenido falso o alucinado, especialmente en dominios no cubiertos por sus datos de entrenamiento.
- Contexto limitado: no se ha especificado la longitud de contexto; si es corta (por ejemplo, 2K-4K), no será adecuado para tareas que requieran documentos largos o conversaciones extensas.
- Sin soporte de fine-tuning: la versión FP8 no está diseñada para fine-tuning; para adaptar el modelo a tareas específicas, se debe trabajar con el modelo base en precisión completa.

## Enlaces

- Modelo cuantizado: https://huggingface.co/liodon-ai/PowerMoE-3b-FP8
- Modelo base: https://huggingface.co/ibm-research/PowerMoE-3b
- Página de Liodon AI: https://liodon.ai/
- Página de OpenModelMap con datos del modelo base: https://openmodelmap.com/model/ibm-research/PowerMoE-3b
- Versión GGUF (fuente externa): https://local-ai-zone.github.io/models/powermoe-3b.html
