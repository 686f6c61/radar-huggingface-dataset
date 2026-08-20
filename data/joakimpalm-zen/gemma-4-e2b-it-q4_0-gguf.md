# Joakimpalm-Zen/gemma-4-E2B-it-Q4_0-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo `google/gemma-4-E2B-it`, un modelo de la familia Gemma 4 desarrollado por Google DeepMind. El archivo, creado por Joakimpalm-Zen, está pensado para ser servido con el motor de inferencia `xyntetik-runner`, un binario único en C11 que soporta CPU, CUDA y Metal, y que ofrece una característica diferenciadora: recuperación forzada de truncamiento en llamadas a herramientas, de modo que las llamadas a funciones siguen siendo parseables incluso cuando se agota el presupuesto de tokens. El modelo base es ligero, orientado a dispositivos edge y sistemas con recursos limitados, y esta cuantización reduce su peso a unos 2,6 GB, lo que permite ejecutarlo en hardware modesto. La relevancia actual radica en la combinación de un modelo compacto con un motor que garantiza robustez en flujos de agentes con tool calling, un aspecto crítico en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, detalles no especificados) |
| Parametros totales | 4.647.450.147 (según safetensors del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (fuentes externas indican 8K, no confirmado) |
| Tipos de cuantizacion | Q4_0, Q4_K, Q4_K_M (archivo mixto: 194 tensores Q4_K, 124 Q4_0, 283 F32) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `.gguf`); safetensors disponibles en el modelo base |

## Arquitectura y entrenamiento

No se dispone de detalles oficiales sobre la arquitectura interna del modelo base `gemma-4-E2B-it`. Pertenece a la familia Gemma 4 de Google DeepMind, que utiliza arquitecturas transformer, pero no se especifican variantes concretas (atención, capas, etc.) en la información disponible. El entrenamiento fue realizado por Google DeepMind; no se publican datos sobre el número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO) en esta ficha. La cuantización fue generada con el motor `xyntetik-runner` mediante el comando `--quantize --quant q4_0`, pero el resultado es un archivo mixto: el cuantizador aplicó una regla de retención que mantuvo los tensores Q4_K existentes en su formato original y solo convirtió los tensores de mayor precisión a Q4_0. El autor corrigió la etiqueta original del archivo (inicialmente denominado Q4_0 puro) y lo renombró a `gemma-4-E2B-it-Q4_K_M-Q4_0-mix.gguf`, indicando que el contenido real es una mezcla Q4_K_M/Q4_0 con `general.file_type = 15 (Q4_K_M)`.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`).
- Soporte de tool calling / function calling, especialmente robusto cuando se sirve con `xyntetik-runner`: el motor cierra las llamadas a herramientas al documento legal más pequeño cuando se agota el presupuesto de tokens, garantizando que los argumentos sean parseables.
- Compatible con el protocolo OpenAI (servidor `--serve`), lo que permite integrarlo con clientes estándar.
- Según fuentes externas (Qualcomm AI Hub), el modelo base `gemma-4-E2B-it` es multimodal (texto e imagen), aunque esta cuantización GGUF se enfoca en generación de texto.
- Capacidades multilingües no especificadas en la información proporcionada.

## Casos de uso

- **Agentes autónomos con tool calling**: gracias a la recuperación de truncamiento del runner, el modelo puede ejecutar llamadas a herramientas en bucles de agente sin fallar cuando el contexto es limitado, ideal para automatización de tareas con presupuesto de tokens ajustado.
- **Asistentes conversacionales en dispositivos edge**: con un peso de 2,6 GB, puede ejecutarse en un Mac de 8 GB o en hardware embebido, ofreciendo respuestas en tiempo real sin dependencia de la nube.
- **Automatización de procesos con integración de APIs**: el soporte de function calling permite conectarlo a APIs externas (bases de datos, servicios web) para ejecutar acciones concretas, como consultas o actualizaciones, en entornos locales.
- **Prototipado rápido de chatbots**: al ser un archivo GGUF, se puede cargar en motores como llama.cpp u Ollama para pruebas rápidas de conceptos sin necesidad de infraestructura pesada.
- **Procesamiento de texto en sistemas con recursos limitados**: su tamaño reducido y la posibilidad de ejecución en CPU lo hacen adecuado para tareas de clasificación, resumen o extracción de información en dispositivos de baja potencia.
- **Desarrollo de pipelines de generación de código asistida**: aunque no se especifican capacidades de código, su naturaleza conversacional y tool calling permiten integrarlo en flujos de asistencia a programación, siempre que se valide su rendimiento en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K. El único dato de rendimiento mencionado es la comparativa de motores en el contexto de truncamiento de tool calls, pero no corresponde a benchmarks del modelo en tareas estándar.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF pesa 2,63 GB, por lo que cabe en GPUs con al menos 4 GB de VRAM si se carga completamente; con cuantización mixta Q4_K_M/Q4_0, el uso de memoria es inferior a 3 GB.
- **GPU recomendadas**: cualquier GPU con 4 GB o más, incluyendo RTX 3060, RTX 4060, o GPUs integradas con soporte CUDA. El runner también soporta Metal en Apple Silicon.
- **CPU**: el runner puede ejecutarse únicamente en CPU, con requisitos moderados; un Mac de 8 GB es suficiente según la documentación.
- **Opciones de despliegue**: el motor recomendado es `xyntetik-runner` (binario único, sin dependencias), pero el archivo GGUF es compatible con otros motores como llama.cpp, Ollama o vLLM (aunque la recuperación de truncamiento solo está disponible en el runner).
- **Latencia y throughput**: no se proporcionan datos cuantitativos en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con otros modelos de tamaño similar. A modo orientativo, se puede comparar con alternativas como Gemma 2 2B, Qwen2.5 1.5B o Llama 3.2 1B, pero no hay información suficiente en esta ficha para establecer comparaciones numéricas. El modelo base `gemma-4-E2B-it` se posiciona como un modelo ligero de la familia Gemma 4, con licencia Apache-2.0 y orientado a edge computing.

## Limitaciones y advertencias

- El archivo GGUF es una cuantización mixta (Q4_K_M/Q4_0), no un Q4_0 puro como indicaba el nombre original. El autor advierte explícitamente que "a menudo no es recomendable usar este archivo" y que Google publica GGUFs oficiales de Gemma 4 que son ungated y de mayor calidad.
- La cuantización puede degradar la calidad de las respuestas en comparación con el modelo en precisión completa, especialmente en tareas que requieren razonamiento complejo o generación de código.
- No se especifican idiomas soportados; es probable que el modelo base tenga limitaciones en idiomas distintos del inglés.
- Riesgo de alucinaciones y sesgos inherentes a los modelos de lenguaje; no se han documentado medidas específicas de mitigación en esta cuantización.
- Para uso en producción, se recomienda validar el rendimiento en el caso de uso concreto y considerar los GGUFs oficiales de Google antes que esta versión de terceros.

## Enlaces

- [Repositorio HuggingFace del archivo GGUF](https://huggingface.co/Joakimpalm-Zen/gemma-4-E2B-it-Q4_0-GGUF)
- [Modelo base en HuggingFace](https://huggingface.co/google/gemma-4-E2B-it)
- [Motor xyntetik-runner (GitHub)](https://github.com/Joakimpalm-Zen/xyntetik-runner)
- [Benchmark de truncamiento del runner](https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/truncation-benchmark.md)
- [Página de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Ficha de Gemma 4 E2B en gemma4.dev](https://gemma4.dev/models/gemma-4-e2b)
- [Ficha en Qualcomm AI Hub](https://aihub.qualcomm.com/models/gemma_4_e2b_it)
