# 3MPER0RR/DeepSeek-R1-Distill-Llama-8B-3MPER0RR-abliterated

## Resumen

DeepSeek-R1-Distill-Llama-8B-3MPER0RR-abliterated es una variante modificada del modelo DeepSeek-R1-Distill-Llama-8B, publicada por el usuario 3MPER0RR en Hugging Face. Se trata de un experimento de "abliteration", una tecnica de edicion de pesos que busca eliminar o atenuar los mecanismos de rechazo y alineacion de seguridad del modelo original, manteniendo el resto de capacidades intactas. El modelo base es el destilado de DeepSeek-R1 sobre la arquitectura Llama de 8.000 millones de parametros, desarrollado originalmente por DeepSeek.

El modelo conserva la arquitectura transformer densa de Llama 3 de 8B, con 8.030.261.248 parametros totales almacenados en formato safetensors (16,1 GB de repositorio). Al derivar del destilado de Razonamiento de DeepSeek-R1, hereda el estilo de razonamiento encadenado del modelo original, incluyendo la generacion de trazas de pensamiento antes de la respuesta final, aunque la model card no documenta si esta capacidad se preserva tras la modificacion.

La relevancia de esta ficha es doble: por un lado, documenta una variante sin censura de un modelo de razonamiento de 8B con licencia MIT, util para investigacion sobre alineacion y robustez; por otro, advierte de que la model card es extremadamente escasa y no aporta datos verificables sobre el proceso de abliteration, el conjunto de evaluacion ni las capacidades resultantes. La informacion disponible se limita a metadatos de Hugging Face y a una model card de pocas lineas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3), derivado de DeepSeek-R1-Distill-Llama-8B |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base DeepSeek-R1-Distill-Llama-8B emplea 128.000 tokens, pero la model card de esta variante no lo confirma) |
| Tipos de cuantizacion | safetensors en el repo principal; existe una version GGUF Q8_0 publicada por el mismo autor |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors; GGUF (Q8_0) en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 8B parametros con la arquitectura Llama 3, resultado de destilar el comportamiento de DeepSeek-R1 sobre Llama-3.1-8B en el modelo original de DeepSeek. La variante de 3MPER0RR aplica una tecnica de abliteration sobre los pesos: se identifican las direcciones de activacion asociadas a comportamientos de rechazo y se proyectan fuera de las matrices de pesos, de modo que el modelo deja de activar esas respuestas sin reentrenamiento adicional.

La model card indica "Trials: [450]" y "Status: Tested and saved", lo que sugiere un proceso iterativo de busqueda de hiperparametros o de capas a modificar, pero no se documenta la metodologia, el numero de capas afectadas, el dataset de calibracion ni metricas de degradacion. No hay informacion sobre datos de entrenamiento adicionales, RLHF, DPO ni sobre si se preservaron las capacidades de razonamiento del destilado original. Tampoco se especifica si la abliteration se aplico solo a capas de atencion, solo a MLP o a ambas.

## Capacidades

- Generacion de texto conversacional en formato chat, segun el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento encadenado heredado del destilado de DeepSeek-R1: el modelo base genera trazas de pensamiento antes de la respuesta, aunque no se confirma que esta variante lo mantenga intacto.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno, propia del modelo base.
- Soporte de tool calling y function calling: no documentado en esta variante; el modelo base no lo declara de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado; depende de la preservacion de las capacidades del destilado.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidad especial de "modo thinking": probable por herencia del modelo base, pero no verificada tras la abliteration.
- Vision y audio: no soportados (modelo exclusivamente de texto).

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la abliteration afecta a la tasa de rechazo, la utilidad y la coherencia, comparando respuestas con el modelo base en un conjunto fijo de prompts. Es adecuado porque la licencia MIT facilita su uso en entornos academicos.
- Evaluacion de robustez de filtros: sirve para probar clasificadores de contenido y sistemas de moderacion frente a un modelo con menor tendencia al rechazo, midiendo la tasa de falsos negativos en pipelines de seguridad.
- Generacion de texto creativo sin restricciones tematicas: para escritura de ficcion, guiones o narrativa que requiera explorar temas sensibles sin que el modelo se niegue, con la advertencia de revision humana obligatoria.
- Experimentos de destilacion y edicion de pesos: como caso de estudio de tecnicas de abliteration sobre un modelo de razonamiento de 8B, comparando curvas de perplexity y benchmarks antes y despues de la modificacion.
- Despliegue local en hardware de consumo: con 8B parametros y cuantizacion Q8_0 disponible, puede ejecutarse en GPUs de 12-16 GB de VRAM para prototipos de chat o generacion de texto en local.
- Base para fine-tuning especifico de dominio: al partir de un modelo de 8B con licencia MIT, es viable ajustarlo con LoRA para tareas concretas (clasificacion, extraccion, resumen) en entornos controlados.
- Analisis de sesgos y comportamientos no deseados: util para auditar que tipo de contenido genera un modelo sin capa de rechazo y documentar riesgos antes de decidir su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base, y tampoco documenta el impacto de la abliteration en la perplexity o en la tasa de rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en precision FP16/BF16 (8B parametros), unos 8-9 GB en cuantizacion Q8_0 y alrededor de 5 GB en Q4_K_M.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) a FP16, y en RTX 3060 12 GB, RTX 4070 o RTX 4060 Ti 16 GB usando la version GGUF Q8_0 o cuantizaciones menores.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM, TGI y Transformers para safetensors; el repositorio GGUF Q8_0 del mismo autor facilita el uso en llama.cpp.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Llama-8B-3MPER0RR-abliterated | 8,03B | no disponible | MIT | Variante abliterada, sin benchmarks publicados |
| DeepSeek-R1-Distill-Llama-8B (original) | 8,03B | 128.000 tokens | MIT | Modelo base con alineacion intacta y razonamiento destilado |
| Llama-3.1-8B-Instruct | 8,03B | 128.000 tokens | Llama 3.1 Community License | Alternativa generalista con alineacion estandar |
| DeepSeek-R1-Distill-Qwen-7B | 7,6B | 128.000 tokens | MIT | Destilado equivalente sobre arquitectura Qwen |

## Limitaciones y advertencias

- La model card no documenta el proceso de abliteration: se desconoce que capas se modificaron, con que dataset de calibracion y con que criterio de seleccion ("Trials: [450]" no se explica).
- No hay benchmarks ni evaluaciones de degradacion: es probable que la abliteration reduzca la coherencia o el rendimiento en tareas de razonamiento, pero no hay datos que lo cuantifiquen.
- Riesgo de alucinacion: al ser un destilado de 8B, el modelo base ya presenta alucinaciones; la edicion de pesos puede agravarlas al alterar representaciones internas.
- Sesgos conocidos: no documentados para esta variante; el modelo base hereda sesgos de los datos de entrenamiento de Llama 3 y DeepSeek-R1.
- Limitaciones de idioma: no se declaran idiomas soportados; el rendimiento fuera del ingles y el chino es incierto.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo base hereda la licencia de Llama 3.1, por lo que conviene verificar la compatibilidad de la cadena de licencias antes de un despliegue comercial.
- Ausencia de capa de rechazo: el modelo puede generar contenido danino, ilegal o sexualmente explicito; no debe desplegarse en produccion sin moderacion externa y revision humana.
- Sin garantias del autor: la model card no ofrece soporte, versionado ni compromiso de mantenimiento; el repositorio no tiene "likes" y el autor es un particular.
- Fecha de creacion futura en los metadatos (2026): conviene tratar las fechas del repositorio con cautela y verificar la procedencia de los pesos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3MPER0RR/DeepSeek-R1-Distill-Llama-8B-3MPER0RR-abliterated
- Version GGUF Q8_0: https://huggingface.co/3MPER0RR/DeepSeek-R1-Distill-Llama-8B-3MPER0RR-abliterated-Q8_0-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Paper de DeepSeek-R1: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
