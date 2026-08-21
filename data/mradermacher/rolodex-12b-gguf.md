# mradermacher/Rolodex-12B-GGUF

## Resumen

Rolodex-12B es un modelo de lenguaje de aproximadamente 110.468 millones de parámetros, publicado originalmente por polygramme en Hugging Face y posteriormente cuantizado al formato GGUF por el usuario mradermacher. El repositorio analizado contiene exclusivamente los pesos en formato GGUF, lo que permite su ejecución en entornos de inferencia local como llama.cpp u Ollama. La información disponible es muy limitada: no se documentan la arquitectura interna, la licencia, los idiomas soportados ni las capacidades del modelo, ya que la model card del autor se limita a indicar que se trata de cuantizaciones estáticas del modelo original. Por tanto, esta ficha se basa únicamente en los metadatos técnicos del repositorio y no puede ofrecer una evaluación funcional del modelo.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 110.468.824.832 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura del modelo original Rolodex-12B, los datos de entrenamiento, el número de tokens procesados ni las técnicas de alineación utilizadas. El repositorio analizado contiene únicamente los pesos cuantizados en formato GGUF, por lo que no se puede determinar si se trata de un transformer denso, un modelo de mezcla de expertos o una arquitectura híbrida. Tampoco hay datos sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades
No se ha publicado ninguna información sobre las capacidades del modelo. No se puede confirmar si es capaz de generación de texto, razonamiento, generación de código, matemáticas, visión, tool calling, soporte para agentes o capacidades multilingües.

## Casos de uso
No es posible proponer casos de uso concretos sin conocer las capacidades del modelo. La falta de información sobre el entrenamiento, el contexto y las habilidades reales impide recomendar aplicaciones específicas. Cualquier uso en producción requeriría primero evaluar el modelo original y sus cuantizaciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
Dado que el modelo tiene aproximadamente 110.000 millones de parámetros y el repositorio pesa 111.8 GB en su versión sin cuantizar, se pueden estimar los requisitos de hardware de forma orientativa, pero no hay datos confirmados de latencia ni throughput:

- VRAM estimada para inferencia: para la cuantización Q8_0 (aproximadamente 110 GB), se necesitarían al menos 120 GB de VRAM. Para Q4_K_M (aproximadamente 55-60 GB), al menos 64 GB de VRAM.
- GPUs recomendadas: para las cuantizaciones más ligeras (Q4_K_M, IQ4_XS) sería necesario al menos una GPU con 64 GB de VRAM (por ejemplo, A100 80GB o H100 80GB). Las cuantizaciones más grandes (f16, Q8_0) requieren soluciones multi-GPU o GPUs con 128 GB o más.
- En GPU de consumo: no es viable en GPU consumer de 24 GB (RTX 4090) ni siquiera con las cuantizaciones más agresivas, dado que el modelo es demasiado grande.
- Opciones de despliegue: al ser GGUF, se puede usar con llama.cpp, Ollama, LM Studio o servidores compatibles con GGUF. No hay información sobre soporte de vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables. El nombre sugiere 12B parámetros, pero los datos reales indican 110B, lo que lo sitúa en la categoría de modelos grandes, pero sin datos de rendimiento no es posible compararlo con alternativas como Llama 3.1 70B, Qwen 2.5 72B o Mixtral 8x22B.

## Limitaciones y advertencias
- No se conoce la licencia del modelo original ni de las cuantizaciones, por lo que no se puede garantizar su uso comercial.
- Al ser una cuantización, existe una pérdida de precisión inherente respecto al modelo original, especialmente en las cuantizaciones de menor bit (Q2_K, IQ4_XS).
- No hay información sobre sesgos, alucinación o limitaciones de idioma.
- El modelo original no tiene documentación pública, por lo que su calidad y seguridad son desconocidas.
- Los metadatos del repositorio indican "endpoints_compatible", pero no se especifica con qué infraestructura es compatible.

## Enlaces
- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Rolodex-12B-GGUF
- Modelo original: https://huggingface.co/polygramme/Rolodex-12B
- Página de solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Página de descarga de cuantizaciones de mradermacher: https://hf.tst.eu/model
