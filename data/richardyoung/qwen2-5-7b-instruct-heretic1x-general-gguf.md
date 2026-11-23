# richardyoung/Qwen2.5-7B-Instruct-heretic1x-general-GGUF

## Resumen

Qwen2.5-7B-Instruct-heretic1x-general-GGUF es una cuantización en formato GGUF del modelo richardyoung/Qwen2.5-7B-Instruct-heretic1x-general, un derivado "abliterated" (también etiquetado como "heretic") del Qwen2.5-7B-Instruct de Alibaba. El modelo parte de la arquitectura transformer densa de Qwen2.5, con 7.615.616.512 parámetros totales, y ha sido modificado para eliminar total o parcialmente los mecanismos de rechazo y alineación de seguridad del modelo original, de ahí las etiquetas "heretic", "abliterated" y "uncensored".

El repositorio lo publica el usuario richardyoung en Hugging Face y contiene únicamente pesos en formato GGUF, pensados para su uso con llama.cpp y Ollama. El modelo base es de tipo instruct y conversacional, con licencia Apache 2.0 y soporte declarado únicamente para inglés. El acceso está restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

Su relevancia es acotada: se trata de un modelo de investigación orientado a estudiar el comportamiento de modelos sin alineación de seguridad, no de un modelo de propósito general para producción. La información pública disponible sobre el proceso de abliteration, los datos de entrenamiento adicionales y los benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el Qwen2.5-7B-Instruct original soporta hasta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | GGUF (el repo incluye múltiples cuantizaciones; el detalle exacto de cada una no está disponible en la información proporcionada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer denso de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros. Sobre esa base, el autor aplica una técnica de "abliteration" (eliminación de la dirección de rechazo en el espacio de activaciones) para producir la variante heretic1x. La información proporcionada no detalla el método exacto, el número de tokens adicionales de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO posteriores a la modificación.

La etiqueta "imatrix" sugiere que las cuantizaciones GGUF se generaron con matrices de importancia (importance matrix) para mejorar la calidad de la cuantización, una práctica habitual en llama.cpp. No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Qwen2.5-7B-Instruct original.
- Razonamiento y respuesta a instrucciones en inglés.
- Generación de código y matemáticas básicas (capacidades del modelo base, no verificadas en esta variante).
- Ejecución local en CPU y GPU mediante llama.cpp y Ollama gracias al formato GGUF.
- Comportamiento sin rechazo ante solicitudes que el modelo original declinaría (efecto de la abliteration).
- Soporte de tool calling y function calling: no confirmado en esta variante.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo cambia el comportamiento de un LLM al eliminar la dirección de rechazo, comparando respuestas con el Qwen2.5-7B-Instruct original en el mismo conjunto de prompts.
- Evaluación de técnicas de abliteration: sirve como referencia para medir la degradación de capacidades (razonamiento, código) tras la modificación, ejecutando benchmarks estandarizados en local con llama.cpp.
- Despliegue local en entornos sin conexión: al ser GGUF, puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada mediante Ollama, útil para prototipos y pruebas offline.
- Generación de texto creativo sin restricciones de contenido: para experimentación literaria o de guion donde el modelo original rechazaría ciertos temas, siempre con revisión humana.
- Red teaming de aplicaciones: usar el modelo como adversario para probar filtros y salvaguardas de un sistema de moderación antes de desplegarlo.
- Docencia y demostraciones: ilustrar en clase o en talleres el efecto de la alineación y su eliminación sobre las respuestas de un modelo de 7B, con coste de hardware bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 7.6B parámetros, una cuantización Q4_K_M ocupa aproximadamente 4,5-5 GB; Q5_K_M en torno a 5,5 GB; Q8_0 cerca de 8 GB; y FP16 unos 15 GB. Estas cifras son estimaciones estándar para modelos de este tamaño, no datos publicados en el repo.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100 o H100 solo si se busca throughput elevado con lotes grandes.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más usando cuantizaciones Q4 o Q5; también en CPU con RAM suficiente (8-16 GB).
- Opciones de despliegue: llama.cpp, Ollama (etiqueta ollama presente), y servidores compatibles con la API de endpoints indicada en las etiquetas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-7B-Instruct-heretic1x-general-GGUF | 7,6B | no disponible | Apache 2.0 | GGUF | Variante abliterated, solo inglés, acceso restringido |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo original alineado, multilingüe |
| Meta Llama 3.1 8B Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Multilingüe, licencia con restricciones |
| Mistral 7B Instruct v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa europea, buen rendimiento en inglés |

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: no aplica las salvaguardas del Qwen2.5-7B-Instruct original, por lo que puede generar contenido dañino, ilegal o sesgado; no es apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo elevado de alucinación y de respuestas plausibles pero incorrectas, agravado por la falta de benchmarks publicados sobre esta variante.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto: no confirmada para esta variante; no asumir los 32.768 tokens del modelo original sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el acceso está restringido (gated), lo que implica aceptar condiciones adicionales en Hugging Face.
- La abliteration puede degradar capacidades de razonamiento y seguir instrucciones; conviene validar en la tarea concreta antes de usar en producción.
- No hay información sobre sesgos específicos introducidos por el proceso de modificación; se heredan los del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-heretic1x-general-GGUF
- Modelo base (no GGUF): https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-heretic1x-general
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
