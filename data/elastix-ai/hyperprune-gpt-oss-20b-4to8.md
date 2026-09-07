# elastix-ai/HyperPrune-gpt-oss-20b-4to8

## Resumen

HyperPrune-gpt-oss-20b-4to8 es un modelo de lenguaje podado derivado de openai/gpt-oss-20b, desarrollado por elastix-ai como parte de una reproducción del método HyperPrune para comparar técnicas de sparse semi-estructurada en el benchmark BLADE. El modelo aplica una poda 4:8 (cuatro de cada ocho pesos se eliminan de forma semi-estructurada) a todas las capas del decoder del modelo base, manteniendo los pesos en bfloat16. Con 20.914.757.184 parámetros totales, el checkpoint está disponible en formato safetensors y puede cargarse directamente con transformers. La información proporcionada no incluye la longitud de contexto ni los parámetros activos del modelo base, aunque la configuración confirma que se trata de un modelo MoE con enrutamiento `routed`. El interés del modelo radica en su uso como referencia para evaluar el impacto de la poda 4:8 en el rendimiento de un modelo MoE de 20B, en un contexto donde la eficiencia de inferencia es crítica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con poda semi-estructurada 4:8 |
| Parámetros totales | 20.914.757.184 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | No disponible; los pesos se almacenan en bf16/fp16 sin cuantización adicional |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/gpt-oss-20b, un transformer MoE de 20B parámetros. El proceso de poda se realiza con HyperPrune, que aprende una máscara de sparse semi-estructurada 4:8 mediante una hiperred MLP (hidden_dim 256, emb_dim 64) y un prior basado en SparseGPT. El entrenamiento se divide en dos etapas: una fase supervisada de 12.000 pasos con learning rate 0.001, seguida de un fine-tuning en cascada con learning rate 0.0003, 4 muestras por paso y 400 filas por paso. El corpus de calibración es la partición de validación de DKYoon/SlimPajama-6B, con 128 muestras de 2048 tokens, en lugar del corpus C4 usado en el paper original. Una diferencia destacable es que este checkpoint poda todas las capas del decoder, mientras que la configuración por defecto de HyperPrune deja dos capas densas. Además, solo las primeras 200 filas de cada proyección son elegidas por la hiperred; el resto conserva la máscara SparseGPT. La sparsity global medida es 0.5060 sobre el ámbito podado, con verificación estricta de 4:8. El proceso de entrenamiento se ejecutó en una NVIDIA RTX PRO 6000 Blackwell de 97 GB con CUDA 13.0 y torch 2.13.0, con un pico de GPU de 11.24 GB durante el fine-tuning en cascada y un tiempo total de 52.7 minutos.

## Capacidades

- Generación de texto y uso conversacional, según los tags del repositorio.
- El modelo hereda la arquitectura del modelo base gpt-oss-20b, pero la información proporcionada no documenta capacidades específicas de tool calling, agentes, razonamiento multi-paso, visión o audio.
- La poda 4:8 tiene como objetivo preservar las capacidades del modelo denso reduciendo la densidad de las capas, aunque no se aportan evaluaciones funcionales detalladas en el README.
- No se especifica soporte multilingüe; el campo de idiomas está marcado como no disponible.

## Casos de uso

La información proporcionada no documenta casos de uso específicos; los siguientes son usos plausibles derivados de las características técnicas del checkpoint, no afirmaciones del autor.

- Investigación en compresión de modelos: permite comparar el método HyperPrune con otros métodos de sparse semi-estructurada (SparseGPT, Wanda) en el modelo gpt-oss-20b, usando los valores de perplejidad del README como referencia.
- Evaluación de la degradación tras la poda: los desarrolladores pueden medir la pérdida de calidad en tareas de generación de texto y razonamiento, comparando con el modelo denso.
- Despliegue de asistentes conversacionales en entornos con restricciones de cómputo: la sparsity 4:8 puede acelerar la inferencia en hardware compatible con sparse, reduciendo el coste por consulta.
- Estudios de recuperación de rendimiento: el checkpoint puede servir como punto de partida para fine-tuning posterior que intente recuperar parte de la calidad perdida.
- Generación de texto por lotes en aplicaciones donde el coste de computación es crítico: al reducir la densidad de las capas, se puede aumentar el throughput en GPUs con soporte para sparse.
- Reproducibilidad en investigación: el README detalla la configuración completa de entrenamiento, lo que permite reproducir el checkpoint o adaptarlo a otros modelos.

## Benchmarks y rendimiento

En la información disponible solo se reportan dos valores de perplejidad en WikiText-2, que no son comparables entre sí. Además de estos valores, no se han publicado resultados de benchmarks de razonamiento, código o matemáticas.

| Métrica | Valor | Nota |
|---|---|---|
| Perplejidad (token-level, seqlen 2048) | 193.438 | Medido con HyperPrune eval_ppl.py |
| Perplejidad (word-level, max_length 2048) | 267.53 | Protocolo BLADE |
| Sparsity global del decoder | 0.5060 | Sobre el ámbito podado, 4:8 estricto verificado |

## Requisitos de hardware

- Los pesos en bf16/fp16 ocupan aproximadamente 41.8 GB (20.914.757.184 parámetros × 2 bytes). El tamaño del repositorio es de 41.9 GB, lo que confirma este cálculo.
- Para inferencia básica sin cuantización, se requiere una GPU con al menos 42 GB de VRAM para los pesos, más memoria para la caché KV y los activos; se recomienda una GPU de 48 GB o superior.
- No se han publicado requisitos de inferencia específicos ni latencias o throughput.
- El README documenta que la reproducción se ejecutó en una NVIDIA RTX PRO 6000 Blackwell de 97 GB, con un pico de GPU de 11.24 GB durante el fine-tuning en cascada (no durante la inferencia).
- En su formato actual, no cabe en una consumer GPU de 24 GB (como RTX 4090) sin cuantización adicional, que no está incluida en el checkpoint.
- Opciones de despliegue: el README solo documenta la carga con transformers; no se proporcionan instrucciones para vLLM, llama.cpp, Ollama o TGI. El repositorio incluye el tag `endpoints_compatible`, aunque no se documentan instrucciones específicas para su uso en endpoints.

## Comparativa con modelos similares

| Modelo | Sparsity | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| elastix-ai/HyperPrune-gpt-oss-20b-4to8 | 4:8 | 20.914.757.184 | no disponible | other | HuggingFace |
| elastix-ai/HyperPrune-gpt-oss-20b-2to4 | 2:4 | no disponible | no disponible | other | HuggingFace |
| openai/gpt-oss-20b | denso | no disponible | no disponible | Apache 2.0 | HuggingFace/OpenAI |

Los datos de los modelos 2to4 y base no están disponibles en la información proporcionada. No se dispone de benchmarks comparables entre estos modelos.

## Limitaciones y advertencias

- El checkpoint es una reproducción con un corpus de calibración diferente al del paper original, por lo que los valores de perplejidad no son directamente comparables con los publicados por HyperPrune.
- Solo las primeras 200 filas de cada proyección son seleccionadas por la hiperred; el resto mantiene la máscara SparseGPT, lo que limita la influencia del método HyperPrune en el resultado final.
- La poda 4:8 no reduce el tamaño de los pesos en VRAM; solo puede acelerar la computación en hardware con soporte para sparse. La memoria necesaria sigue siendo la de un modelo de 20.9B en bf16.
- Los valores de perplejidad reportados son altos (193.438 y 267.53), lo que sugiere una degradación significativa respecto al modelo denso, aunque no se proporciona el valor denso de referencia.
- No se han documentado evaluaciones de sesgos, alucinaciones o seguridad. La licencia `other` requiere revisión antes de cualquier uso comercial.
- El checkpoint no incluye tokenizador propio; se debe cargar el tokenizador de openai/gpt-oss-20b.
- No se han publicado benchmarks de tareas de razonamiento, código o matemáticas, por lo que no se puede evaluar su rendimiento en esas áreas.

## Enlaces

- HuggingFace: https://huggingface.co/elastix-ai/HyperPrune-gpt-oss-20b-4to8
- Repositorio de HyperPrune: https://github.com/futuresun912/HyperPrune
- Paper en OpenReview: https://openreview.net/forum?id=lqjQs2lVNm
- Modelo base en HuggingFace: https://huggingface.co/openai/gpt-oss-20b
- Blog de OpenAI sobre gpt-oss: https://openai.com/index/introducing-gpt-oss/
- Checkpoint 2to4: https://huggingface.co/elastix-ai/HyperPrune-gpt-oss-20b-2to4
