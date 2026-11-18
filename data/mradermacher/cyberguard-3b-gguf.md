# mradermacher/CyberGuard-3B-GGUF

## Resumen

CyberGuard-3B-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF generadas por mradermacher a partir del modelo base CyberGuard-3B, publicado por FarrukhMunir1. El repositorio no contiene un modelo entrenado desde cero ni una variante arquitectónica propia, sino una colección de ficheros derivados que permiten ejecutar el modelo original en hardware con recursos limitados mediante llama.cpp y ecosistemas compatibles.

El modelo base, según la información disponible, cuenta con aproximadamente 3.000 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños orientados a despliegue local. El nombre "CyberGuard" sugiere un enfoque hacia tareas de seguridad, moderación o protección de contenido, aunque la model card del repositorio no documenta explícitamente el dominio de entrenamiento, el dataset ni el pipeline.

La relevancia de este repositorio es práctica: ofrece hasta trece variantes de cuantización (desde Q2_K hasta F16, incluyendo IQ4_XS) que cubren un rango amplio de compromisos entre calidad y consumo de memoria. Esto facilita la evaluación del modelo en entornos sin GPU dedicada, aunque la falta de documentación sobre el modelo base limita seriamente cualquier valoración rigurosa de sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de ~3B parámetros; arquitectura no documentada en la información proporcionada) |
| Parametros totales | aproximadamente 3.000 millones (deducido del nombre del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base probablemente en safetensors, no confirmado |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1, convert_type hf |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base CyberGuard-3B en la documentación proporcionada. El nombre y el tamaño sugieren un transformer decoder-only de aproximadamente 3.000 millones de parámetros, patrón habitual en la familia de modelos pequeños para despliegue local, pero no se confirma ni la familia arquitectónica, ni el número de capas, ni las dimensiones de atención.

Tampoco se documentan los datos de entrenamiento: número de tokens, composición del corpus, uso de RLHF, DPO u otras técnicas de alineación, ni innovaciones técnicas como decodificación especulativa o atención lineal. Los únicos metadatos técnicos disponibles corresponden al proceso de cuantización realizado por mradermacher (versión de quantize, conversión desde formato Hugging Face y cuantización de tensores de salida), no al entrenamiento del modelo original.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de ~3B parámetros, sin confirmación documental de calidad o dominio.
- Posible orientación a seguridad o moderación de contenido, inferida únicamente del nombre "CyberGuard"; no verificada en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Ejecución local mediante llama.cpp y derivados gracias al formato GGUF.

## Casos de uso

- Evaluación local en hardware de consumo: las variantes Q4_K_M e IQ4_XS permiten probar el modelo en equipos con 8-16 GB de RAM o VRAM, útil para validar si el comportamiento del modelo base encaja en un prototipo antes de invertir en infraestructura mayor.
- Moderación de contenido en pipelines offline: si el modelo base cumple su nombre, podría integrarse como filtro previo o posterior en sistemas de publicación de contenido, ejecutándose en CPU mediante llama.cpp sin depender de APIs externas.
- Despliegue en entornos air-gapped: el formato GGUF y la ausencia de dependencias de servicios en la nube permiten ejecutar el modelo en redes aisladas, escenario relevante para organizaciones con requisitos de confidencialidad.
- Prototipado rápido de asistentes conversacionales: con 3B parámetros y cuantización Q4, se puede servir un chatbot básico en una sola GPU consumer o incluso en CPU, adecuado para demos internas.
- Filtrado de texto en aplicaciones de mensajería: un modelo pequeño puede clasificar o marcar mensajes sospechosos en tiempo casi real si la latencia con cuantización Q4_K_M es suficientemente baja, aunque no hay datos de throughput publicados.
- Investigación sobre cuantización: el repositorio ofrece un conjunto amplio de variantes del mismo modelo, lo que permite estudiar empíricamente la degradación de calidad entre Q2_K y F16 en tareas concretas.
- Base para fine-tuning ligero: las variantes F16 o Q8_0 pueden servir como punto de partida para adaptaciones posteriores, aunque la licencia no documentada impide confirmar si el uso comercial está permitido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación para CyberGuard-3B ni para sus cuantizaciones en la documentación proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada, según tamaño de fichero típico para 3B parámetros):
  - F16: ~6 GB
  - Q8_0: ~3,5 GB
  - Q6_K: ~2,7 GB
  - Q5_K_M: ~2,3 GB
  - Q4_K_M: ~2,0 GB
  - IQ4_XS: ~1,8 GB
  - Q3_K_M: ~1,6 GB
  - Q2_K: ~1,2 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4 o superiores (RTX 3050, RTX 4060, GTX 1660). Para F16 se recomienda 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070). No se requiere A100 ni H100 para este tamaño.
- Cabe en GPU consumer: sí, en todas las variantes, incluidas GPUs de gama baja con 4-6 GB de VRAM para cuantizaciones Q4 y Q3.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), LM Studio, text-generation-webui, y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CyberGuard-3B-GGUF | ~3B | no disponible | no disponible | GGUF | Cuantizaciones de un modelo base sin documentación pública |
| Llama 3.2 3B Instruct | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Modelo ampliamente documentado, con benchmarks publicados y soporte multilingüe oficial |
| Qwen2.5 3B Instruct | 3,1B | 32K | Apache 2.0 | safetensors, GGUF | Licencia permisiva, buen rendimiento en código y matemáticas, benchmarks públicos |
| Phi-3 Mini | 3,8B | 128K | MIT | safetensors, GGUF | Enfoque en razonamiento y código, documentación completa |

La comparación es estructural: los tres modelos alternativos cuentan con documentación pública, benchmarks y licencias claras, mientras que CyberGuard-3B carece de todos esos elementos en la información disponible. No se puede establecer una comparación de rendimiento sin datos.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el modelo base: no se conocen dataset, técnica de entrenamiento, evaluación ni dominio real de aplicación.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido, lo que desaconseja su integración en productos sin aclaración previa por parte del autor.
- Idiomas no documentados: no se puede garantizar un comportamiento correcto en castellano ni en ningún otro idioma.
- Contexto desconocido: imposible planificar aplicaciones que dependan de ventanas largas.
- Riesgo de alucinación: esperable en modelos de ~3B parámetros, especialmente sin datos de alineación publicados; no hay evaluaciones que lo cuantifiquen.
- Sesgos: no documentados; un modelo sin model card detallada no permite auditar sesgos de género, raza, idioma o dominio.
- Nombre potencialmente engañoso: "CyberGuard" sugiere capacidades de seguridad que no están verificadas empíricamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad en modelos pequeños; se recomienda Q4_K_M o superior para uso real.
- No apto para producción sin una evaluación previa propia del modelo base en las tareas objetivo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CyberGuard-3B-GGUF
- Modelo base: https://huggingface.co/FarrukhMunir1/CyberGuard-3B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- llama.cpp (runtime compatible): https://github.com/ggerganov/llama.cpp
- Ollama (runtime compatible): https://ollama.com
