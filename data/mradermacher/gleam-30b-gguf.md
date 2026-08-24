# mradermacher/Gleam-30B-GGUF

## Resumen

Gleam-30B-GGUF es una cuantización en formato GGUF del modelo base ConicCat/Gleam-30B, realizada por mradermacher. El modelo original, Gleam-30B, es un modelo de lenguaje de 30.000 millones de parámetros (27.854.794.240 parámetros reales según los safetensors) desarrollado por ConicCat. Esta versión GGUF está pensada para su ejecución en entornos locales con llama.cpp, Ollama u otras herramientas compatibles con este formato, ofreciendo tamaños reducidos para facilitar el despliegue en hardware de consumo.

La relevancia de esta ficha radica en que se trata de una cuantización reciente (agosto de 2026) de un modelo de tamaño medio-alto, que permite ejecutar un modelo de 30B en GPUs con VRAM limitada mediante cuantización de baja precisión. El repositorio proporciona únicamente dos variantes de cuantización: Q2_K y Q3_K_M, ambas de baja precisión, lo que indica un enfoque en reducir el consumo de memoria por encima de la calidad de salida. No se dispone de información sobre el entrenamiento, arquitectura o capacidades específicas del modelo base, ya que la model card del cuantizador no incluye esos datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.854.794.240 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (no se especifica en la información proporcionada) |
| Tipos de cuantizacion | Q2_K (10.8 GB), Q3_K_M (13.8 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base (si es un transformer denso, MoE, híbrido, etc.) ni sobre su proceso de entrenamiento (datos, número de tokens, técnicas de alineación como RLHF o DPO). El cuantizador mradermacher no incluye estos detalles en la model card. El modelo original, ConicCat/Gleam-30B, tampoco está documentado en el repositorio de cuantización. Se recomienda consultar directamente la página del modelo base en Hugging Face para obtener esta información.

## Capacidades

Dado que no se dispone de documentación específica del modelo base, no es posible enumerar capacidades concretas con seguridad. A partir del nombre "Gleam" y del tamaño de 30B, se puede inferir que es un modelo de lenguaje generativo, probablemente con capacidades de conversación y generación de texto en inglés, pero no se pueden confirmar características como tool calling, razonamiento avanzado, visión o soporte de agentes. Se recomienda probar el modelo directamente o consultar la documentación del modelo original.

## Casos de uso

No se pueden proponer casos de uso específicos sin conocer las capacidades reales del modelo base. A modo de orientación general, un modelo de 30B cuantizado en GGUF podría ser útil para:

- Ejecución local de un asistente conversacional en inglés en hardware de consumo (por ejemplo, una RTX 3060 o 4060 con 12 GB de VRAM) gracias a las cuantizaciones Q2_K y Q3_K_M.
- Prototipado rápido en entornos de desarrollo con recursos limitados, donde se requiera un modelo de tamaño medio sin depender de APIs externas.
- Investigación académica o personal sobre el comportamiento de modelos de 30B en tareas de generación de texto, siempre que se disponga de acceso al modelo base para comparar.

No obstante, se recomienda verificar el modelo original antes de planificar cualquier uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El cuantizador no proporciona métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparativas con otros modelos.

## Requisitos de hardware

- Los archivos GGUF disponibles tienen tamaños de 10.8 GB (Q2_K) y 13.8 GB (Q3_K_M). La VRAM necesaria para inferencia depende del contexto y del backend, pero en general:
  - Q2_K: aproximadamente 11-12 GB de VRAM para cargar los pesos, más memoria para el contexto (por ejemplo, 4-6 GB adicionales para un contexto de 4k tokens). Puede caber en GPUs con 12 GB (RTX 3060, RTX 4070) y en 16 GB (RTX 4080, 4090).
  - Q3_K_M: aproximadamente 14-15 GB de VRAM, más contexto. Necesita al menos 16 GB de VRAM para funcionar cómodamente.
- Se puede ejecutar en CPU con suficiente RAM (por ejemplo, 32 GB para Q3_K_M), aunque la velocidad será menor.
- Herramientas compatibles: llama.cpp, Ollama, llama-cpp-python, text-generation-webui, etc.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre el rendimiento de Gleam-30B en comparación con otros modelos de 30B (como Llama-2-30B, Falcon-40B, etc.). El cuantizador no proporciona datos de benchmark ni comparaciones. Se recomienda evaluar el modelo directamente para conocer su rendimiento relativo.

## Limitaciones y advertencias

- No se dispone de documentación sobre sesgos, riesgos de alucinación o limitaciones de contexto del modelo base.
- La licencia es desconocida, por lo que no se puede garantizar el uso comercial o la redistribución.
- Las cuantizaciones Q2_K y Q3_K_M son de baja precisión y pueden degradar notablemente la calidad de generación, especialmente en tareas complejas.
- El modelo está etiquetado únicamente como inglés, no se confirma soporte multilingüe.
- No se ha publicado información sobre el proceso de cuantización (imatrix, etc.), aunque el cuantizador indica que son quants estáticos.
- No se recomienda su uso en producción sin antes evaluar el modelo base y validar las cuantizaciones con tareas específicas.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Gleam-30B-GGUF
- Modelo base (sin información adicional): https://huggingface.co/ConicCat/Gleam-30B
- Página del cuantizador mradermacher: https://huggingface.co/mradermacher
- Página de solicitud de modelos: https://huggingface.co/mradermacher/model_requests

No se encontraron otros enlaces relevantes (papers, blogs, demos) en la búsqueda web.
