# liodon-ai/DeepSeek-R1-Distill-Qwen-1.5B-FP8

## Resumen

El modelo `liodon-ai/DeepSeek-R1-Distill-Qwen-1.5B-FP8` es una cuantización en FP8 (precisión de 8 bits en coma flotante) del modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, publicada por Liodon AI. El modelo base es una destilación de DeepSeek-R1 sobre una arquitectura Qwen2 de 1.500 millones de parámetros, diseñada para tareas de razonamiento y generación de texto. Esta versión cuantizada reduce el tamaño de los pesos de 3,6 GB a 2,2 GB, lo que facilita su despliegue en entornos con recursos limitados, manteniendo las capacidades del modelo original.

La cuantización utiliza el esquema `FP8_DYNAMIC` implementado con la librería `llm-compressor` de vLLM: los pesos se convierten a FP8 (formato E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Este esquema no requiere dataset de calibración, por lo que los pesos cuantizados son una conversión directa de los originales, sin sesgo introducido por datos de calibración. El `lm_head` se deja sin cuantizar para preservar la calidad de la salida.

La relevancia de este modelo radica en su tamaño reducido y su compatibilidad con motores de inferencia como vLLM, TGI y SGLang, lo que lo convierte en una opción práctica para ejecutar un modelo de razonamiento en GPUs de consumo o en entornos con memoria limitada, siempre que el hardware soporte FP8 nativo (compute capability ≥ 8.9).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2), destilado de DeepSeek-R1 |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (E4M3) dinámica; `lm_head` sin cuantizar |
| Idiomas soportados | No disponibles |
| Licencia | Other (según model card; el modelo base DeepSeek-R1-Distill-Qwen-1.5B tiene licencia MIT según el repositorio oficial) |
| Formato de pesos | Safetensors (FP8), compatible con vLLM, TGI y SGLang |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, que a su vez es una destilación de DeepSeek-R1 sobre una arquitectura Qwen2 de 1.500 millones de parámetros. La destilación se realizó utilizando datos generados por DeepSeek-R1 para transferir capacidades de razonamiento paso a paso a un modelo más pequeño. No se dispone de detalles específicos sobre el dataset de entrenamiento o el proceso de destilación en la información proporcionada.

La cuantización FP8 se aplica mediante el esquema `FP8_DYNAMIC` de `llm-compressor`: los pesos se convierten a FP8 (E4M3) por canal de forma estática, y las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Este método no requiere calibración, por lo que los pesos cuantizados son una conversión directa de los originales. El `lm_head` se mantiene en precisión completa (BF16/FP16) para evitar una degradación desproporcionada de la calidad. El tamaño del repositorio es de 2,3 GB, frente a los 3,6 GB del modelo original.

## Capacidades

- Generación de texto y razonamiento paso a paso (chain-of-thought), heredadas del modelo base DeepSeek-R1-Distill-Qwen-1.5B.
- Resolución de problemas matemáticos y de lógica, gracias a la destilación de DeepSeek-R1.
- Generación de código en lenguajes comunes, aunque con limitaciones propias de un modelo de 1,5 B de parámetros.
- Soporte multilingüe básico, aunque no se especifican los idiomas exactos en la ficha.
- Compatible con tool calling y agentes solo si el modelo base los soporta; no se confirma en la información disponible.
- No incluye capacidades multimodales (visión, audio) ni modo de pensamiento explícito más allá del razonamiento estándar.

## Casos de uso

- Inferencia en dispositivos edge o GPUs de consumo: gracias a su tamaño reducido (2,2 GB) y a la cuantización FP8, puede ejecutarse en tarjetas como RTX 4060 o RTX 4070 con 8 GB de VRAM, siempre que tengan compute capability ≥ 8.9.
- Prototipado rápido de aplicaciones de chat o asistentes conversacionales: el modelo puede integrarse en pipelines de vLLM o TGI para servir respuestas con razonamiento básico.
- Automatización de tareas de soporte técnico de bajo nivel: respuestas a preguntas frecuentes o generación de documentación técnica, donde un modelo pequeño es suficiente.
- Generación de código asistida en entornos de desarrollo: el modelo puede sugerir fragmentos de código o explicar algoritmos, aunque con menor precisión que modelos más grandes.
- Educación y aprendizaje automático: como ejemplo de cuantización FP8 y despliegue eficiente, útil para experimentos de investigación o docencia.
- Evaluación de técnicas de cuantización: al ser una conversión directa sin calibración, sirve para comparar el impacto de FP8 en modelos de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base `DeepSeek-R1-Distill-Qwen-1.5B` tiene resultados conocidos en MMLU, HumanEval y GSM8K, pero no se proporcionan en la ficha ni en los resultados de búsqueda. No se deben inferir números sin fuente verificada.

## Requisitos de hardware

- Para ejecución FP8 nativa se requiere una GPU NVIDIA con compute capability ≥ 8.9 (arquitecturas Ada, Hopper o Blackwell: RTX 40-series, L4/L40S, H100/H200, B100/B200, GB10).
- En GPUs más antiguas (compute capability < 8.9), vLLM y TGI dequantizan los pesos a FP16/BF16, perdiendo la ventaja de memoria y velocidad, pero el modelo sigue siendo funcional.
- El tamaño de los pesos cuantizados es de aproximadamente 1,8 GB (1,78 B parámetros × 1 byte), más overhead de activaciones y KV cache. Se estima que cabe en GPUs con al menos 4 GB de VRAM, aunque no se especifica un valor exacto.
- Motores de inferencia compatibles: vLLM, Text Generation Inference (TGI) y SGLang, según la model card.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño pesos | Cuantización | Contexto | Licencia |
|---|---|---|---|---|---|
| liodon-ai/DeepSeek-R1-Distill-Qwen-1.5B-FP8 | 1,78 B | 2,2 GB | FP8 dinámica | No disponible | Other |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,78 B | 3,6 GB | FP16/BF16 | No disponible | MIT (según repo oficial) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7,6 B | ~15 GB (FP16) | FP16 | No disponible | MIT |

La comparativa se limita al modelo base y a la versión de 7B, ya que no se dispone de datos de otras cuantizaciones (por ejemplo, GGUF) en la información proporcionada. La ventaja principal de la versión FP8 es la reducción de memoria y el soporte nativo en motores modernos, a costa de requerir hardware específico.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir una ligera pérdida de precisión en comparación con el modelo en FP16, aunque al ser una conversión directa sin calibración, el impacto suele ser mínimo.
- El requisito de compute capability ≥ 8.9 limita el despliegue en GPUs más antiguas (por ejemplo, RTX 30-series o anteriores), donde se ejecutará dequantizado y perderá eficiencia.
- El modelo base tiene solo 1,5 B de parámetros, por lo que su capacidad de razonamiento y generación es limitada en comparación con modelos más grandes; puede producir alucinaciones o respuestas incoherentes en tareas complejas.
- La licencia "other" en la model card es ambigua; aunque el modelo base tiene licencia MIT, se recomienda verificar los términos exactos antes de uso comercial.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que dificulta planificar su uso en aplicaciones multilingües o con contextos largos.
- No se han publicado benchmarks específicos para esta cuantización, por lo que el rendimiento real en tareas concretas debe validarse empíricamente.

## Enlaces

- [Modelo cuantizado en Hugging Face](https://huggingface.co/liodon-ai/DeepSeek-R1-Distill-Qwen-1.5B-FP8)
- [Modelo base DeepSeek-R1-Distill-Qwen-1.5B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B)
- [Repositorio oficial de DeepSeek-R1 (GitHub)](https://github.com/deepseek-ai/DeepSeek-R1)
- [Página del modelo en ModelScope](https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B)
- [Documentación de llm-compressor](https://github.com/vllm-project/llm-compressor)
