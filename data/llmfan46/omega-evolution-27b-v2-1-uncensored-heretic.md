# llmfan46/Omega-Evolution-27B-v2.1-uncensored-heretic

## Resumen

Omega-Evolution-27B-v2.1-uncensored-heretic es un ajuste fino del modelo ReadyArt/Omega-Evolution-27B-v2.1, publicado por el usuario independiente llmfan46 en Hugging Face. Su propósito declarado es eliminar los mecanismos de rechazo y censura del modelo original mediante una técnica de abliteración denominada Arbitrary-Rank Ablation (ARA), implementada en la herramienta Heretic v1.2.0. El resultado es un modelo orientado a roleplay explícito, contenido NSFW y generación sin restricciones de alineamiento, con 27.356.728.560 parámetros totales almacenados en formato safetensors.

El modelo hereda la arquitectura del modelo base, etiquetado en Hugging Face con la familia `qwen3_5`, lo que sugiere una arquitectura transformer densa de la familia Qwen. El repositorio ocupa 54,7 GB, coherente con pesos en precisión de 16 bits para un modelo de aproximadamente 27.000 millones de parámetros. La model card reporta una reducción de rechazos del 92 % (de 92/100 a 15/100) manteniendo una divergencia KL de 0,0127 respecto al original, y conserva la puntuación MMLU del modelo base (0,8589 de accuracy global).

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de decensuración mediante abliteración con parámetros reproducibles; por otro, advierte de que se trata de un modelo sin alineamiento de seguridad, con etiquetas explícitas de contenido para adultos y con implicaciones legales y éticas que deben evaluarse antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia `qwen3_5` según tags; detalles de capas y atención no disponibles) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos publicados en safetensors; se asume BF16/FP16 por el tamaño del repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (según metadatos del repo; la model card incluye además la etiqueta "Other License") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint ReadyArt/Omega-Evolution-27B-v2.1, del que no se documentan en la información disponible ni la composición del dataset de entrenamiento, ni el número de tokens, ni si hubo fases de RLHF o DPO. La única intervención documentada es la abliteración: se aplica Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA) sobre las capas 8 a 53, con un `preserve_good_behavior_weight` de 0,2421, un `steer_bad_behavior_weight` de 0,0008, un `overcorrect_relative_weight` de 1,0006 y un `neighbor_count` de 12. Los componentes objetivo de la ablación son `attn.o_proj` y `attn.out_proj`, es decir, las proyecciones de salida de los bloques de atención.

La técnica consiste en calcular direcciones de rechazo en el espacio de activaciones y proyectarlas fuera de los pesos de atención, de modo que el modelo pierda la tendencia a rechazar peticiones sin degradar sustancialmente su distribución original. El autor reporta una divergencia KL de 0,0127 frente al modelo base, lo que cuantifica esa cercanía distribucional. No se dispone de información sobre la arquitectura interna exacta (número de capas, dimensión oculta, mecanismo de atención, uso de RoPE o de atención con ventana deslizante), más allá de la referencia a la familia Qwen 3.5 en los tags.

## Capacidades

- Generación de texto libre sin mecanismos de rechazo en la gran mayoría de peticiones (15/100 rechazos según la evaluación del autor).
- Roleplay y escritura creativa de contenido explícito y NSFW, incluido ERP (erotic roleplay), según las etiquetas del repositorio.
- Razonamiento general y conocimiento enciclopédico heredado del modelo base, con MMLU de 0,8589.
- Capacidad multilingüe: no documentada explícitamente, aunque probablemente heredada del modelo base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Roleplay conversacional sin restricciones: el modelo está específicamente ajustado para mantener personajes y narrativas de larga duración sin romper el rol con advertencias o negativas, lo que lo hace adecuado para plataformas de ficción interactiva para adultos.
- Generación de ficción explícita: útil para autores que necesitan borradores de escenas adultas sin que el modelo module o suavice el contenido, gracias a la reducción de rechazos reportada.
- Investigación sobre alineamiento y abliteración: sirve como caso de estudio reproducible para medir el efecto de ARA sobre las proyecciones de atención, comparando la divergencia KL y la tasa de rechazos con el modelo original.
- Evaluación de robustez de filtros de contenido: permite probar sistemas de moderación y clasificadores de seguridad frente a un modelo deliberadamente decensurado.
- Simulación de personajes en entornos de entretenimiento para adultos: con la debida verificación de edad y cumplimiento normativo, puede integrarse en aplicaciones de chat de personajes.
- Benchmarking comparativo de modelos decensurados: su MMLU de 0,8589 y su KL de 0,0127 permiten comparar la pérdida de calidad frente a otras técnicas de abliteración.

## Benchmarks y rendimiento

| Benchmark | Este modelo | Modelo original (Omega-Evolution-27B-v2.1) |
|---|---|---|
| MMLU (acc, 5-shot, v2) | 0,8589 ± 0,0028 | 0,8589 ± 0,0028 |
| MMLU humanities | 0,8087 ± 0,0056 | 0,8087 ± 0,0056 |
| MMLU other | 0,8735 ± 0,0057 | 0,8735 ± 0,0057 |
| Tasa de rechazos | 15/100 | 92/100 |
| Divergencia KL | 0,0127 | 0 (por definición) |

Los resultados de MMLU se presentan como idénticos entre ambos modelos en la model card; el autor no detalla si la ablación se evaluó por separado o se asume la conservación de la puntuación. No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda un mínimo de 64-80 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 28-30 GB, viable en una RTX 4090 de 24 GB solo con cuantizaciones de 4-5 bits o con descarga parcial a CPU.
- VRAM estimada en cuantización de 4 bits: alrededor de 15-18 GB, cabe en una RTX 4090 de 24 GB y en una RTX 3090 de 24 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o dos RTX 4090 en paralelo para precisión completa; RTX 4090 o RTX 3090 para cuantizaciones de 4 bits.
- Opciones de despliegue: llama.cpp y Ollama para cuantizaciones GGUF (previa conversión, ya que el repo solo publica safetensors), vLLM y TGI para inferencia en FP16/BF16 en servidores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Omega-Evolution-27B-v2.1-uncensored-heretic | 27,36 B | No disponible | Apache 2.0 | Decensurado mediante ARA/Heretic |
| ReadyArt/Omega-Evolution-27B-v2.1 (base) | 27,36 B | No disponible | No disponible | Modelo original alineado |
| Otros modelos abliterados de ~27 B | No disponible | No disponible | Variable | Decensuración por abliteración |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada, más allá de la comparación directa con el modelo base.

## Limitaciones y advertencias

- Modelo sin alineamiento de seguridad: está diseñado explícitamente para reducir rechazos, por lo que puede generar contenido violento, sexual explícito, ilegal o dañino si se le solicita.
- Etiquetado como `not-for-all-audiences` y `dangerous`: no debe desplegarse en aplicaciones accesibles a menores ni en entornos sin moderación adicional.
- Riesgo elevado de alucinación y de afirmaciones no verificadas, especialmente en dominios factuales, al haberse eliminado parte de los mecanismos de cautela del modelo base.
- Idiomas soportados no documentados: el rendimiento en castellano u otras lenguas distintas del inglés no está garantizado.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente el límite real.
- Ambigüedad de licencia: los metadatos indican Apache 2.0, pero la model card incluye la etiqueta "Other License"; conviene verificar los términos antes de un uso comercial.
- Trazabilidad limitada: el autor es un contribuidor independiente, sin documentación sobre el dataset de entrenamiento del modelo base ni sobre el proceso de evaluación más allá de la model card.
- El repositorio depende de donaciones para mantener el almacenamiento; existe riesgo de que los pesos dejen de estar disponibles o se muevan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Omega-Evolution-27B-v2.1-uncensored-heretic
- Modelo base: https://huggingface.co/ReadyArt/Omega-Evolution-27B-v2.1
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Implementación de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
