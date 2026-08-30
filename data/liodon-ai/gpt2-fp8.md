# liodon-ai/gpt2-FP8

## Resumen

`liodon-ai/gpt2-FP8` es una cuantización en punto flotante de 8 bits (FP8) del modelo GPT-2 original de OpenAI, publicada por Liodon AI, un laboratorio de investigación independiente especializado en compresión extrema de modelos. El modelo base es `openai-community/gpt2`, un transformer decoder de 124 millones de parámetros con una ventana de contexto de 1024 tokens, publicado originalmente en 2019. Esta versión cuantizada mantiene exactamente la misma arquitectura y pesos numéricos, pero los almacena en formato FP8 (E4M3) por canal, lo que permite una inferencia más rápida y un menor consumo de memoria en hardware compatible.

La relevancia de este modelo radica en que demuestra un flujo de cuantización post-entrenamiento sin calibración, utilizando el esquema `FP8_DYNAMIC` de la librería `llm-compressor`. Al no requerir dataset de calibración, los pesos cuantizados son una conversión directa de los originales, evitando sesgos introducidos por el conjunto de calibración. El tamaño del repositorio es de 0,5 GB, idéntico al modelo original, pero con la ventaja de que la ejecución en GPUs con soporte FP8 (compute capability ≥ 8.9) reduce el uso de memoria y acelera la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT-2) |
| Parametros totales | 124.439.808 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (heredado del modelo base) |
| Tipos de cuantizacion | FP8 dinámico (E4M3) por canal; `lm_head` sin cuantizar |
| Idiomas soportados | no disponible en la card; el modelo base GPT-2 está entrenado principalmente en inglés |
| Licencia | other (según la card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este modelo no ha sido entrenado desde cero, sino que es una cuantización post-entrenamiento del GPT-2 original. El proceso se realizó con `llm-compressor` de vLLM, utilizando el esquema `FP8_DYNAMIC`: los pesos se convierten a FP8 (E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Este esquema no requiere dataset de calibración, por lo que los valores cuantizados son una conversión directa de los pesos originales, sin pérdida adicional por calibración. La capa `lm_head` se deja sin cuantizar, práctica estándar por su tamaño despreciable y su impacto desproporcionado en la calidad si se cuantizara.

La arquitectura subyacente es la de GPT-2: un transformer decoder con 12 capas, 12 cabezas de atención, dimensión de embedding de 768 y 50257 tokens de vocabulario. No se han introducido innovaciones técnicas adicionales más allá de la cuantización.

## Capacidades

- Generación de texto autoregresiva: produce texto coherente en inglés (y en menor medida en otros idiomas) a partir de un prompt.
- Razonamiento básico y completado de texto: puede continuar frases, responder preguntas simples y generar párrafos temáticos.
- Sin soporte de tool calling ni function calling: al ser un modelo base de 2019, no incluye capacidades de invocación de herramientas.
- Sin capacidades multimodales: solo texto.
- Sin modo de razonamiento explícito (thinking mode): genera directamente sin cadena de pensamiento visible.
- Capacidades multilingües limitadas: el modelo base fue entrenado predominantemente con texto en inglés, por lo que su rendimiento en otros idiomas es inferior.

## Casos de uso

- Prototipado rápido de aplicaciones de generación de texto: al ser un modelo pequeño y cuantizado, permite iterar rápidamente en entornos de desarrollo con recursos limitados, por ejemplo, para probar pipelines de generación de contenido.
- Experimentación académica con cuantización FP8: sirve como banco de pruebas para estudiar el impacto de la cuantización FP8 en modelos pequeños, comparando su salida con la del modelo original.
- Chatbots educativos o de demostración: puede integrarse en aplicaciones de chat simples donde no se requiere alta calidad de razonamiento, aprovechando su baja latencia en GPUs modernas.
- Generación de texto creativo en inglés: adecuado para escribir cuentos cortos, poemas o guiones, dado que GPT-2 tiene una capacidad notable para producir texto fluido y estilísticamente variado.
- Clasificación de texto con fine-tuning: al ser un modelo base, puede ajustarse para tareas de clasificación (sentimiento, tema, etc.) con un coste de entrenamiento bajo, y la versión FP8 permite inferencia eficiente en producción.
- Evaluación de infraestructura de inferencia: útil para validar despliegues con vLLM, TGI o SGLang en hardware con soporte FP8, midiendo throughput y latencia antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser una cuantización sin pérdida (conversión directa de pesos), se espera que el rendimiento sea prácticamente idéntico al del modelo GPT-2 original, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5 GB en FP8, más overhead de activaciones y KV cache. Cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPUs compatibles con ejecución FP8 nativa: NVIDIA con compute capability ≥ 8.9 (RTX 40-series, L4/L40S, H100/H200, B100/B200/GB10). En GPUs más antiguas, vLLM/TGI dequantizan los pesos a FP16/BF16, perdiendo la ventaja de velocidad y memoria.
- GPUs recomendadas: RTX 4090, L4, H100 para máxima eficiencia; cualquier GPU consumer con 4 GB o más puede ejecutarlo en modo dequantizado.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/gpt2-FP8`), TGI (imagen Docker), SGLang (`python -m sglang.launch_server --model-path liodon-ai/gpt2-FP8`), o transformers estándar.
- Latencia y throughput: no se han publicado mediciones específicas. Dado el tamaño del modelo, se espera una latencia de pocos milisegundos por token en GPUs modernas, incluso en modo dequantizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| `liodon-ai/gpt2-FP8` | 124M | 1024 | FP8 dinámico | other | Cuantización directa sin calibración |
| `openai-community/gpt2` | 124M | 1024 | FP32/FP16 | MIT | Modelo original sin cuantizar |
| `distilgpt2` | 82M | 1024 | FP32 | MIT | Versión destilada de GPT-2, más pequeña y rápida |
| `EleutherAI/gpt-neo-125M` | 125M | 2048 | FP32 | MIT | Alternativa de tamaño similar con contexto mayor |

La comparativa se centra en el modelo base y alternativas de tamaño similar. No se dispone de datos de rendimiento comparativo en benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base GPT-2 fue entrenado con texto de Internet y puede reflejar sesgos sociales, estereotipos y lenguaje ofensivo.
- Riesgo de alucinación: como todo modelo generativo, puede producir información factualmente incorrecta o inventada.
- Contexto limitado: 1024 tokens, insuficiente para tareas que requieran contexto largo.
- Idioma: rendimiento óptimo solo en inglés; en otros idiomas la calidad decae notablemente.
- Licencia "other": la card no especifica los términos exactos. Aunque el modelo base GPT-2 tiene licencia MIT, esta versión cuantizada declara "other", por lo que se debe contactar con el autor o revisar el repositorio antes de uso comercial.
- Sin garantías de producción: es un modelo de demostración y experimentación, no recomendado para aplicaciones críticas sin una evaluación exhaustiva.
- Hardware específico: la ventaja de FP8 solo se materializa en GPUs con compute capability ≥ 8.9; en hardware antiguo no hay beneficio de velocidad ni memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liodon-ai/gpt2-FP8
- Organización Liodon AI en Hugging Face: https://huggingface.co/liodon-ai
- GitHub de Liodon AI: https://github.com/Liodon-AI
- Sitio web de Liodon AI: https://liodon.ai/
- Modelo base: https://huggingface.co/openai-community/gpt2
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
