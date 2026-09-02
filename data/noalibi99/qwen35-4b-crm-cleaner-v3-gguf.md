# noalibi99/qwen35-4b-crm-cleaner-v3-GGUF

## Resumen

El modelo `noalibi99/qwen35-4b-crm-cleaner-v3-GGUF` es un fine-tune de la familia Qwen3.5-4B, convertido a formato GGUF mediante la librería Unsloth. El autor, noalibi99, ha publicado este modelo con el propósito de ofrecer una versión optimizada para tareas de limpieza y normalización de datos CRM, aunque la model card no detalla el dataset de entrenamiento ni el proceso de fine-tuning más allá de la mención a Unsloth.

Se trata de un modelo de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones), con una única cuantización Q4_K_M disponible en el repositorio, lo que lo hace adecuado para inferencia en hardware de consumo. El nombre "crm-cleaner" sugiere que está especializado en tareas de depuración, deduplicación y estandarización de registros de sistemas CRM, aunque no se proporcionan ejemplos concretos de uso ni métricas de evaluación.

La relevancia de este modelo radica en su formato GGUF, que permite ejecutarlo con llama.cpp y herramientas compatibles como Ollama o LM Studio, facilitando su despliegue local sin necesidad de infraestructura cloud. Sin embargo, la ausencia de documentación detallada, licencia explícita y benchmarks limita su adopción en entornos de producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (transformer decoder, no se especifica si es MoE) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo Qwen3.5-4B.Q4_K_M.gguf) |

## Arquitectura y entrenamiento

La arquitectura base corresponde a la familia Qwen3.5-4B, un modelo de lenguaje de tipo transformer decoder desarrollado por Alibaba. No se dispone de información detallada sobre si la variante 4B emplea arquitectura MoE o densa, ni sobre la longitud de contexto nativa. El fine-tune fue realizado con Unsloth, una librería que optimiza el entrenamiento mediante técnicas de LoRA/QLoRA y que acelera el proceso de ajuste fino, aunque la model card no especifica el dataset utilizado ni el método exacto (RLHF, DPO, SFT, etc.).

El modelo fue convertido a formato GGUF, lo que implica una cuantización de los pesos para reducir el tamaño y permitir su ejecución en CPU y GPU con llama.cpp. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y puede mantener diálogos multi-turno.
- Limpieza y normalización de datos CRM: por su nombre, se infiere que está especializado en tareas de depuración de registros, aunque no hay ejemplos documentados.
- Ejecución local eficiente: gracias al formato GGUF y la cuantización Q4_K_M, puede ejecutarse en hardware modesto.
- Compatibilidad con llama.cpp: soporta la interfaz `llama-cli` y `llama-mtmd-cli` con la opción `--jinja` para plantillas.
- No se confirman capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio en la información disponible.

## Casos de uso

- Depuración de bases de datos CRM: el modelo puede utilizarse para identificar y corregir registros duplicados, estandarizar formatos de campos (teléfonos, direcciones, nombres) y completar datos faltantes en sistemas de gestión de clientes, aprovechando su fine-tune específico.
- Asistente de atención al cliente: al ser conversacional, puede integrarse en chatbots para resolver consultas de clientes, aunque su especialización en CRM sugiere un uso más orientado a tareas internas de gestión de datos.
- Preprocesamiento de datos para pipelines de análisis: puede emplearse para limpiar y estructurar datos de CRM antes de alimentar modelos de análisis o business intelligence, reduciendo el trabajo manual.
- Automatización de tareas de back-office: en entornos con recursos limitados, puede desplegarse localmente para automatizar la normalización de datos en tiempo real, gracias a su tamaño reducido y formato GGUF.
- Prototipado rápido de aplicaciones de procesamiento de texto: los desarrolladores pueden usar el modelo con llama.cpp para experimentar con tareas de limpieza de texto sin necesidad de GPUs de alta gama.
- Migración de datos entre sistemas: puede ayudar a transformar y adaptar registros de CRM a nuevos esquemas, estandarizando valores y resolviendo inconsistencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada: con la cuantización Q4_K_M y 4,3 mil millones de parámetros, el archivo GGUF ocupa aproximadamente 2,8 GB. La VRAM necesaria para inferencia en GPU ronda los 3-4 GB, dependiendo del contexto y del backend.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3050, RTX 4060 o superior. También puede ejecutarse en Apple Silicon (M1/M2/M3) con Metal.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama de entrada y media.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, o cualquier backend compatible con GGUF. También puede usarse con la API de endpoints compatibles mencionada en las etiquetas.
- Latencia y throughput: no disponible, pero para un modelo de 4B cuantizado, se espera una generación de 20-40 tokens/segundo en una GPU moderna (RTX 3060 o superior) y 5-15 tokens/segundo en CPU con AVX2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen35-4b-crm-cleaner-v3 (este) | 4,3B | no disponible | no disponible | GGUF | Fine-tune para CRM, sin benchmarks |
| noalibi99/crm-qwen35-4b-cleaner-v1-GGUF | 4,3B (presumiblemente) | no disponible | no disponible | GGUF | Versión anterior del mismo autor, misma familia |
| Qwen3-4B (base) | 4B | 32K (según documentación de Qwen3) | Apache 2.0 (Qwen3) | safetensors, GGUF | Modelo base sin fine-tune, con benchmarks publicados |

Nota: la comparación con Qwen3-4B se basa en la información pública de la familia Qwen3, pero no se puede confirmar que Qwen3.5-4B comparta las mismas características. La versión v1 del mismo autor sugiere una evolución del fine-tune, pero no hay datos comparativos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles, pero al ser un fine-tune de Qwen, puede heredar sesgos del modelo base.
- Riesgo de alucinación: no evaluado; se recomienda validar las salidas en tareas críticas de CRM.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada; el archivo GGUF puede tener limitaciones según la configuración de llama.cpp.
- Restricciones de licencia: la licencia no está especificada, lo que impide conocer si permite uso comercial. Se debe contactar al autor antes de usar en producción.
- Caveats de producción: no hay documentación sobre el dataset de fine-tuning, por lo que el rendimiento en dominios distintos al CRM puede ser impredecible. El modelo solo está disponible en cuantización Q4_K_M, lo que puede degradar la calidad frente a cuantizaciones más altas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/noalibi99/qwen35-4b-crm-cleaner-v3-GGUF
- Versión anterior (v1): https://huggingface.co/noalibi99/crm-qwen35-4b-cleaner-v1-GGUF
- Repositorio de Qwen3 (referencia de la familia): https://github.com/QwenLM/Qwen3
- Tutorial de ejecución local de Qwen 3.5: https://www.datacamp.com/tutorial/run-qwen-3-5-locally
- Unsloth (librería de fine-tuning): https://github.com/unslothai/unsloth
