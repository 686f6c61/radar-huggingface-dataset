# RedHatAI/gemma-2-2b-it-quantized.w8a8

## Resumen

RedHatAI/gemma-2-2b-it-quantized.w8a8 es una versión cuantizada en INT8 del modelo instructivo Gemma 2 2B de Google, desarrollada por Neural Magic (Red Hat) mediante la biblioteca llm-compressor. Esta cuantización reduce a la mitad los requisitos de memoria de GPU y de almacenamiento en disco, y duplica el rendimiento de las multiplicaciones de matrices, manteniendo una pérdida de precisión inferior al 2 % en los benchmarks de la Open LLM Leaderboard. El modelo conserva la arquitectura transformer decoder-only del original y está pensado para uso comercial y de investigación en inglés, con un enfoque de asistente conversacional.

La relevancia actual de este modelo radica en que permite desplegar un asistente de lenguaje de 2 000 millones de parámetros en hardware de consumo o en entornos con memoria limitada, sin sacrificar demasiado rendimiento. Es una opción práctica para aplicaciones de chat y generación de texto que requieren baja latencia y eficiencia, aprovechando el soporte nativo de vLLM para servir el modelo de forma optimizada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 2 (transformer decoder-only) |
| Parametros totales | 3.204.165.888 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (según el script de creación, max_seq_len=8192) |
| Tipos de cuantizacion | INT8 (W8A8) |
| Idiomas soportados | Ingles (exclusivamente) |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | safetensors (con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización de `google/gemma-2-2b-it` mediante el algoritmo GPTQ, implementado con la librería `llm-compressor`. Se aplica una cuantización simétrica estática por canal para los pesos y una cuantización simétrica dinámica por token para las activaciones, ambos en INT8. Solo se cuantizan los operadores lineales dentro de los bloques transformer; se excluye la capa de salida (`lm_head`). La calibración se realizó con 256 secuencias del dataset `neuralmagic/LLM_compression_calibration`, con un factor de amortiguamiento del 1 %. El entrenamiento original del modelo base fue realizado por Google con datos multilingües, pero la cuantización no añade datos nuevos; solo optimiza los pesos existentes para reducir el tamaño y acelerar la inferencia.

## Capacidades

- Generacion de texto conversacional: diseñado para interacciones tipo asistente, con formato de chat multi-turno.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base Gemma 2 2B instruct, incluyendo tareas de comprensión lectora, matemáticas y sentido común.
- Generacion de codigo: aunque no se especifica en la model card, el modelo base puede generar código básico, pero no hay evidencia de una optimización específica.
- Multilingüismo: no soportado; la model card indica explícitamente que su uso se limita al inglés.
- Integracion con vLLM: compatible con el backend de vLLM para inferencia eficiente y con la API de OpenAI para despliegue de servicios.
- Sin capacidades de tool calling ni de agentes avanzados; se trata de un modelo de texto puro.

## Casos de uso

- **Asistente conversacional en entornos con recursos limitados**: su tamaño reducido y cuantización permiten ejecutarlo en una GPU de consumo (por ejemplo, RTX 3060 o superior) para atender consultas de atención al cliente o soporte técnico en inglés.
- **Generacion de texto en aplicaciones de bajo coste**: ideal para tareas de redacción, resumen o parafraseo donde se necesite un modelo ligero y rápido, sin requerir la calidad de modelos de mayor tamaño.
- **Prototipado de aplicaciones de lenguaje**: al ser una cuantización de un modelo bien conocido, sirve como punto de partida para probar pipelines de generación de texto, ajuste fino posterior o integración con frameworks como LangChain.
- **Sistemas de respuesta a preguntas en dominios específicos**: con un ajuste fino ligero, puede adaptarse a dominios concretos (medicina, derecho, etc.) manteniendo un bajo coste de inferencia.
- **Desarrollo de asistentes de codigo en entornos con restricciones de memoria**: aunque no es un modelo de codigo especializado, puede ayudar a completar fragmentos simples o explicar código, ejecutándose en una GPU de 4 GB.
- **Evaluacion de tecnicas de cuantizacion**: sirve como referencia para comparar el rendimiento de modelos cuantizados frente a sus versiones de precisión completa en la misma tarea.

## Benchmarks y rendimiento

La model card proporciona resultados del benchmark OpenLLM (versión 1) comparando el modelo cuantizado con el modelo base original. La recuperación de rendimiento es superior al 96 % en todas las tareas.

| Benchmark | gemma-2-2b-it (base) | gemma-2-2b-it-quantized.w8a8 (este modelo) | Recuperacion |
|---|---|---|---|
| MMLU (5-shot) | 56.94 | 56.64 | 99.5 % |
| ARC Challenge (25-shot) | 58.87 | 56.74 | 96.4 % |
| GSM-8K (5-shot, strict-match) | 44.81 | 43.97 | 98.1 % |
| HellaSwag (10-shot) | 71.41 | 71.18 | 99.7 % |
| Winogrande (5-shot) | 68.82 | 68.00 (dato inferido, no aparece completo) | 98.8 % (estimado) |

Nota: el dato de Winogrande no está completo en la información proporcionada; se ha indicado el valor parcial (68) y una recuperación estimada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en FP16 el modelo pesa aproximadamente 6,4 GB; con cuantización INT8 se reduce a ~3,2 GB. Para inferencia con vLLM se recomienda al menos 4 GB de VRAM, aunque 6 GB darían más margen para el contexto.
- **GPU recomendadas**: tarjetas con 8 GB o más (RTX 3060, RTX 3070, A10, A100, etc.) son suficientes. En GPUs con 4 GB puede ejecutarse con contextos cortos.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de consumo modernas con al menos 6 GB de VRAM.
- **Opciones de despliegue**: vLLM es el backend principal (soporta OpenAI-compatible API); también puede usarse con llama.cpp, Ollama, TGI, o directamente con Transformers.
- **Latencia y throughput**: la cuantización INT8 duplica el throughput de las multiplicaciones de matrices en comparación con FP16. En una RTX 4090, se esperan miles de tokens por segundo, aunque no se proporcionan datos exactos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Rendimiento (MMLU) |
|---|---|---|---|---|---|
| gemma-2-2b-it (base) | 2.6B | 8192 | FP16 | Gemma | 56.94 |
| gemma-2-2b-it-quantized.w8a8 (este) | 2.6B | 8192 | INT8 | Gemma | 56.64 |
| Phi-2 (Microsoft) | 2.7B | 2048 | FP16 | MIT | 56.7 (aprox., no verificado) |
| Llama-3.2-1B | 1.2B | 128K | FP16 | Llama 3.2 | 48.3 (aprox., no verificado) |

La comparativa se basa en datos públicos de modelos similares, pero los resultados de Phi-2 y Llama-3.2-1B no están disponibles en la información proporcionada, por lo que se indican como aproximados. La principal ventaja de este modelo frente a otros es su cuantización optimizada para vLLM y su menor huella de memoria, manteniendo una precisión casi idéntica al modelo base.

## Limitaciones y advertencias

- **Idioma**: solo admite inglés; cualquier uso en otros idiomas está fuera de los casos de uso previstos y puede generar resultados erróneos.
- **Riesgo de alucinacion**: como todo modelo de lenguaje, puede producir información falsa o inventada, especialmente en contextos de alta incertidumbre.
- **Sesgos**: el modelo base puede contener sesgos de género, raza o cultura, que la cuantización no elimina.
- **Degradacion de rendimiento**: aunque la recuperación es alta, hay una ligera pérdida en tareas como ARC Challenge (96.4 % de recuperación), lo que puede ser relevante en aplicaciones que requieren precisión extrema.
- **Restricciones de licencia**: la licencia Gemma de Google tiene cláusulas específicas sobre uso comercial, que deben revisarse antes de desplegar el modelo en producción.
- **Contexto limitado**: aunque se define 8192 tokens, el modelo base tiene una ventana de contexto fija; la cuantización no amplía este límite.

## Enlaces

- [Modelo en Hugging Face (RedHatAI)](https://huggingface.co/RedHatAI/gemma-2-2b-it-quantized.w8a8)
- [Modelo base original (google/gemma-2-2b-it)](https://huggingface.co/google/gemma-2-2b-it)
- [Repositorio de llm-compressor](https://github.com/vllm-project/llm-compressor)
- [Paper de GPTQ](https://arxiv.org/abs/2210.17323)
- [Dataset de calibración de Neural Magic](https://huggingface.co/datasets/neuralmagic/LLM_compression_calibration)
