# Lernex/Metis-1.6-Logos-FP8

## Resumen

Metis-1.6 Logos FP8 es la versión cuantizada a FP8 del modelo Metis-1.6 Logos, desarrollado por Lernex. Se trata de un modelo de generación de texto con arquitectura híbrida que combina capas de mezcla de expertos (MoE) con capas de tipo Mamba, según indican las etiquetas del repositorio. Con 10.393.227.876 parámetros totales, el checkpoint en FP8 ocupa 11,18 GB frente a los 20,80 GB de la versión BF16, lo que permite ejecutar el modelo completo en una GPU de 16 GB de VRAM.

La relevancia de esta ficha radica en que la cuantización FP8 conserva, según la model card, el 99,6 % de la media de benchmarks de la versión BF16 en siete tareas de evaluación zero-shot. El modelo está pensado para su despliegue en motores de inferencia de alto rendimiento como vLLM, SGLang y Dromos, con soporte para razonamiento explícito (thinking mode) y tool calling.

El modelo se distribuye bajo licencia Apache 2.0 y emplea el formato de cuantización `compressed-tensors`, lo que lo hace directamente compatible con los principales motores de servicio que soportan FP8 en GPUs con tensor cores de FP8. La model card referencia un informe técnico en arXiv y una colección de modelos de la familia Metis-1.6.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida MoE + Mamba (según etiquetas del repositorio) |
| Parámetros totales | 10.393.227.876 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (compressed-tensors); existe versión BF16 y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8, compressed-tensors) |

## Arquitectura y entrenamiento

La información disponible indica que Metis-1.6 Logos emplea una arquitectura híbrida que combina mezcla de expertos (MoE) con capas Mamba, aunque no se detallan en la model card el número de expertos, la proporción de parámetros activos ni la distribución de capas. El checkpoint FP8 es una cuantización del modelo base Lernex/Metis-1.6-Logos en BF16, realizada con el formato `compressed-tensors`.

En cuanto al proceso de cuantización, cada capa cuantizada redondea su entrada a FP8 por token y multiplica con los pesos FP8 en los tensor cores de FP8 de la GPU. La model card indica que el modelo conserva el 99,6 % de la media de benchmarks de BF16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, `conversational`).
- Razonamiento explícito con modo thinking activado por defecto; se puede desactivar mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Soporte de tool calling y function calling, con parser dedicado (`--tool-call-parser metis`) en vLLM y SGLang.
- Soporte de agentes y razonamiento multi-paso, según las etiquetas `reasoning` del repositorio.
- Compatibilidad con motores de inferencia de alto rendimiento: vLLM, SGLang y Dromos.
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue en GPU de consumo: al ocupar 11,18 GB en FP8, el modelo completo cabe en una GPU de 16 GB, lo que permite servir un modelo de 10,2B parámetros en hardware de gama alta para consumidores o en estaciones de trabajo con una sola GPU.
- Asistentes con razonamiento explícito: el modo thinking activado por defecto permite obtener cadenas de razonamiento separadas de la respuesta final, útil en aplicaciones de resolución de problemas y análisis técnico.
- Agentes con tool calling: la integración con vLLM y SGLang mediante parsers dedicados permite construir agentes que invocan funciones externas y APIs de forma estructurada.
- Atención al cliente automatizada: la pipeline conversacional y el soporte multi-turno permiten gestionar diálogos con contexto; la longitud de contexto concreta no está disponible en la información proporcionada.
- Servicio de API compatible con OpenAI: Dromos, vLLM y SGLang exponen un endpoint compatible con la API de OpenAI, lo que facilita la integración en aplicaciones existentes sin cambios de cliente.
- Inferencia de alto rendimiento en producción: el uso de FP8 con tensor cores y motores como vLLM o SGLang permite reducir el coste de memoria y aumentar el throughput frente a BF16 en GPUs compatibles.
- Evaluación e investigación: la disponibilidad de versiones BF16, FP8 y NVFP4 del mismo modelo facilita estudios comparativos de cuantización sobre el mismo checkpoint base.

## Benchmarks y rendimiento

Resultados de la model card en siete tareas zero-shot con lm-evaluation-harness 0.4.13, comparando BF16 y FP8:

| Tarea | Métrica | BF16 | FP8 |
|---|---|---|---|
| MMLU | acc | 53,43 | 53,57 |
| HellaSwag | acc_norm | 68,46 | 68,02 |
| ARC-Easy | acc_norm | 70,62 | 70,79 |
| ARC-Challenge | acc_norm | 44,11 | 44,03 |
| OpenBookQA | acc_norm | 43,40 | 43,80 |
| PIQA | acc_norm | 76,06 | 76,06 |
| WinoGrande | acc | 61,96 | 60,14 |
| Media | | 59,72 | 59,49 |

La model card advierte que la columna BF16 de esta tabla puntúa por log-verosimilitud, mientras que la model card del modelo BF16 puntúa respuestas generadas, por lo que las columnas deben compararse entre sí y no con la ficha del modelo BF16.

## Requisitos de hardware

- VRAM estimada: 11,18 GB para los pesos en FP8; se requiere memoria adicional para el KV cache y el contexto.
- GPU con soporte de tensor cores FP8: necesarias para ejecutar el checkpoint tal como está diseñado (vLLM y SGLang lo hacen en GPUs que los tienen).
- Cabe en GPU de consumo de 16 GB de VRAM según la model card.
- Opciones de despliegue: vLLM con el plugin `vllm-metis`, SGLang con el plugin `sglang-metis`, y Dromos (`dromos run logos:fp8` o `dromos serve logos:fp8`).
- Transformers no lee este formato para esta arquitectura; para Transformers debe usarse el repositorio BF16.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de sampling recomendados: thinking con temperature 0,8, top-p 0,95, top-k 20 y repetition penalty 1,05; respuestas directas con temperature 0,3 y repetition penalty 1,0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Metis-1.6 Logos FP8 | 10.393.227.876 | no disponible | Apache 2.0 | safetensors FP8 |
| Metis-1.6 Logos (BF16) | no disponible | no disponible | Apache 2.0 | safetensors BF16 |
| Metis-1.6 Logos NVFP4 | no disponible | no disponible | Apache 2.0 | NVFP4 |

No se dispone de datos de benchmarks de modelos alternativos de otros desarrolladores en la información proporcionada para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo.
- Riesgo de alucinación: no documentado en la información disponible; es un riesgo inherente a los modelos generativos.
- Idiomas soportados: no disponible, lo que impide garantizar calidad multilingüe.
- Longitud de contexto: no disponible; debe verificarse antes de diseñar aplicaciones que dependan de ventanas largas.
- El checkpoint FP8 requiere GPUs con tensor cores FP8 para funcionar según el diseño previsto; en hardware sin soporte FP8 el rendimiento o la compatibilidad pueden verse afectados.
- Transformers no es compatible con este formato para esta arquitectura; es necesario usar vLLM, SGLang o Dromos, o bien el repositorio BF16.
- Licencia Apache 2.0: permite uso comercial, pero deben revisarse las condiciones del modelo base y de los plugins asociados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada y poca validación por parte de la comunidad.
- La model card no detalla el proceso de entrenamiento ni los datos utilizados, lo que dificulta evaluar riesgos de sesgo y calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lernex/Metis-1.6-Logos-FP8
- Modelo base BF16: https://huggingface.co/Lernex/Metis-1.6-Logos
- Versión NVFP4: https://huggingface.co/Lernex/Metis-1.6-Logos-NVFP4
- Colección Metis-1.6: https://huggingface.co/collections/Lernex/metis-16-6adc52e150d985721d894f6b
- Informe técnico (arXiv): https://arxiv.org/abs/2610.37903
- Sitio web de Lernex: https://lernex.com
- X (Twitter) de Lernex: https://x.com/Lernex_ai
- Repositorio Dromos: https://github.com/lernex/dromos
- Plugin vLLM: https://github.com/lernex/vllm-metis
- Plugin SGLang: https://github.com/lernex/sglang-metis
