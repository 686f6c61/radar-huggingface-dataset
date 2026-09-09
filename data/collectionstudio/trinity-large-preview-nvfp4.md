# CollectionStudio/Trinity-Large-Preview-NVFP4

## Resumen

Trinity-Large-Preview-NVFP4 es una versión cuantizada en formato NVFP4 del modelo Trinity-Large-Preview desarrollado por Arcee AI. Este repositorio concreto es un duplicado mantenido por CollectionStudio. Se trata de un modelo de lenguaje de tipo sparse Mixture-of-Experts (MoE) con 256 expertos, de los que se activan 4 por token, y una arquitectura total de aproximadamente 398.000 millones de parámetros según la documentación, aunque los pesos safetensors almacenados suman 201.841.688.064 parámetros. El modelo está preentrenado sobre más de 17 billones de tokens y ofrece una ventana de contexto ampliada de hasta 512.000 tokens, lo que le permite manejar documentos extensos y conversaciones largas.

Su relevancia radica en combinar un coste computacional reducido, con unos 13.000 millones de parámetros activos por token, y resultados competitivos en benchmarks como MMLU (87.2) y AIME 2025 (24.0). La variante Preview está ligeramente post-entrenada y en proceso de RL activo, por lo que es una opción interesante para investigación y prototipado. La cuantización NVFP4 con NVIDIA ModelOpt permite desplegarlo en GPUs Blackwell con cómputo FP4 nativo, reduciendo memoria y mejorando la eficiencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Mixture-of-Experts (AfmoeForCausalLM) |
| Parametros totales | ~398B según la documentación; pesos safetensors: 201.841.688.064 (~201,8B) |
| Parametros activos | ~13B por token |
| Longitud de contexto | 8.192 en preentrenamiento; hasta 512.000 tras extensión |
| Tipos de cuantizacion | NVFP4 (`nvfp4_mlp_only`: solo pesos MLP/expertos en FP4; atención en BF16). En GPUs no Blackwell, Marlin descomprime a BF16 |
| Idiomas soportados | inglés, español, francés, alemán, italiano, portugués, ruso, árabe, hindi, coreano, chino |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | Safetensors (cuantizados NVFP4) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura sparse Mixture-of-Experts sobre un backbone transformer (AfmoeForCausalLM). Dispone de 256 expertos, de los cuales uno es compartido, y se activan 4 expertos por token, lo que resulta en una ratio de activación de 1,56% (esquema 4-de-256). Además incluye 6 capas densas. El peso total del modelo en memoria se reduce gracias a la cuantización NVFP4, que solo comprime los pesos de los MLP/expertos, mientras que las capas de atención se mantienen en BF16. El KV cache no está cuantizado.

Trinity-Large-Preview está basado en Trinity-Large-Base, que fue preentrenado con más de 17 billones de tokens. La variante Preview está ligeramente post-entrenada y en proceso de RL activo, pero la información proporcionada no detalla la composición del dataset ni las técnicas de alineación (RLHF/DPO). La extensión de contexto se aumentó desde los 8.192 tokens de preentrenamiento hasta 512.000, aunque no se especifica la técnica utilizada ni el impacto en la calidad a distancias largas.

## Capacidades

- Generación de texto conversacional en 11 idiomas: inglés, español, francés, alemán, italiano, portugués, ruso, árabe, hindi, coreano y chino.
- Razonamiento matemático: 24.0 en AIME 2025 en la versión sin cuantizar, según la model card.
- Conocimiento general: MMLU 87.2 en la versión sin cuantizar, según la model card.
- Comprensión de contexto largo: hasta 512.000 tokens, útil para procesar documentos extensos y conversaciones largas.
- Eficiencia computacional: solo unos 13.000 millones de parámetros activos por token, a pesar del tamaño total.
- No se documenta soporte de tool calling, vision ni audio en la información disponible.

## Casos de uso

- Asistente conversacional multilingüe para empresas: gracias a su ventana de contexto de 512.000 tokens y a la cobertura de 11 idiomas, puede gestionar tickets de soporte, correos internos y transcripciones de reuniones sin perder el hilo de la conversación.
- Análisis de documentos jurídicos y financieros: su contexto largo permite resumir contratos de más de 100 páginas, informes de auditoría y expedientes completos, extrayendo cláusulas o métricas relevantes.
- Tutoría y evaluación en educación STEM: con una puntuación de 24.0 en AIME 2025, resulta adecuado para generar ejercicios matemáticos, resolver problemas de competición y dar feedback paso a paso en plataformas educativas.
- Investigación en eficiencia de sistemas MoE: su arquitectura sparse 4-de-256 y la cuantización NVFP4 permiten experimentar con rutas de activación, balance de carga y técnicas de compresión en entornos académicos o industriales.
- Despliegue de chat en tiempo real sobre GPUs Blackwell: con vLLM (>=0.18.0) y tensor-parallel-size 8, se puede servir el modelo cuantizado con cómputo FP4 nativo en clústeres con B200, B300 o GB300.
- Traducción y localización técnica: su capacidad multilingüe permite generar y revisar textos de documentación técnica, manuales de producto y UI en múltiples idiomas manteniendo coherencia contextual.

## Benchmarks y rendimiento

Los siguientes resultados corresponden a la versión no cuantizada Trinity-Large-Preview, según datos publicados en la model card:

| Benchmark | Llama 4 Maverick | Trinity-Large Preview |
|---|---|---|
| MMLU | 85.5 | 87.2 |
| MMLU-Pro | 80.5 | 75.2 |
| GPQA-Diamond | 69.8 | 63.3 |
| AIME 2025 | 19.3 | 24.0 |

No se han publicado resultados de benchmarks específicos para la versión cuantizada NVFP4 en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 231,6 GB en disco. Los pesos safetensors contienen 201.841.688.064 parámetros en formato NVFP4 (4 bits), por lo que una estimación aproximada del peso en VRAM sería de unos 101 GB, asumiendo ~0,5 bytes por parámetro. El consumo real depende de la implementación, del contexto y del hecho de que el KV cache no está cuantizado.
- GPUs recomendadas: NVIDIA B200, B300 y GB300 para aprovechar el cómputo FP4 nativo. En GPUs Hopper (H100/H200) se usa el backend Marlin, que descomprime los pesos a BF16 para el cómputo, aumentando la VRAM necesaria y reduciendo la velocidad. No se menciona soporte en GPUs de consumo (RTX) en la información proporcionada.
- Opciones de despliegue: vLLM (>=0.18.0), tanto con contenedor Docker en Blackwell como con instalación pip en Hopper. También está disponible como API en OpenRouter con el identificador `arcee-ai/trinity-large-preview`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

En la información proporcionada solo se recoge una comparación del rendimiento con Llama 4 Maverick. Los datos de características de Llama 4 Maverick no están disponibles, por lo que la tabla incluye valores desconocidos:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Trinity-Large-Preview (NVFP4) | ~398B (documento) / 201,8B (safetensors) | ~13B | 8.192 -> 512.000 | OpenMDW-1.1 | HuggingFace, OpenRouter |
| Llama 4 Maverick | no disponible | no disponible | no disponible | no disponible | no disponible |

Comparación de rendimiento en benchmarks:

| Benchmark | Llama 4 Maverick | Trinity-Large Preview |
|---|---|---|
| MMLU | 85.5 | 87.2 |
| MMLU-Pro | 80.5 | 75.2 |
| GPQA-Diamond | 69.8 | 63.3 |
| AIME 2025 | 19.3 | 24.0 |

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, toxicidad, alucinación ni seguridad. No se recomienda usar el modelo en producción sin una evaluación propia y exhaustiva.
- La variante Preview está en proceso de RL activo, por lo que su comportamiento puede cambiar en futuras actualizaciones del checkpoint.
- El contexto de 512.000 tokens es una extensión post-preentrenamiento; la calidad de las respuestas a distancias muy largas no está documentada.
- La licencia OpenMDW-1.1 requiere revisión del texto completo antes de usarlo comercialmente. No se ha verificado la compatibilidad de la cuantización con los términos de la licencia.
- El soporte de cómputo FP4 nativo depende de GPUs NVIDIA Blackwell. En otras GPUs, la descompresión a BF16 vía Marlin incrementa significativamente el uso de VRAM y reduce el rendimiento.
- Según la model card, al instalar vLLM por pip en GPUs Blackwell, los kernels FP4 nativos pueden producir resultados incorrectos por desajustes de versión. Como solución, se recomienda forzar el backend Marlin y la descompresión a BF16.
- La cuantización NVFP4 puede introducir una ligera degradación en la calidad con respecto a los pesos BF16 originales, pero no se aportan benchmarks específicos de la versión cuantizada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CollectionStudio/Trinity-Large-Preview-NVFP4
- Modelo original (arcee-ai/Trinity-Large-Preview): https://huggingface.co/arcee-ai/Trinity-Large-Preview
- Checkpoint base (Trinity-Large-Base): https://huggingface.co/arcee-ai/Trinity-Large-Base
- Checkpoint TrueBase: https://huggingface.co/arcee-ai/Trinity-Large-TrueBase
- Informe técnico: https://arxiv.org/abs/2602.17004
- Chat de demostración: https://chat.arcee.ai/
- NVIDIA ModelOpt: https://github.com/NVIDIA/Model-Optimizer
- vLLM: https://github.com/vllm-project/vllm
- OpenRouter: https://openrouter.ai/
