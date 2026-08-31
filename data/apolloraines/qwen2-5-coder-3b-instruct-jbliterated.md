# ApolloRaines/Qwen2.5-Coder-3B-Instruct-Jbliterated

## Resumen

Qwen2.5-Coder-3B-Instruct-Jbliterated es un fine-tuning del modelo Qwen2.5-Coder-3B-Instruct, desarrollado por ApolloRaines, que aplica la técnica denominada "Jbliteration" para eliminar los mecanismos de rechazo (refusals) del modelo original. El objetivo es obtener un asistente de código que responda de forma directa a cualquier solicitud, sin filtros de contenido ni negativas evasivas, manteniendo la coherencia y el seguimiento de instrucciones. El modelo se presenta como "uncensored" y está pensado para desarrolladores que necesitan un generador de código sin restricciones en entornos de investigación o experimentación.

Con 3.085.938.688 parámetros (aproximadamente 3B), el modelo mantiene la arquitectura transformer del Qwen2.5-Coder-3B-Instruct, con una ventana de contexto de 32.768 tokens según la documentación del modelo base. Se distribuye bajo licencia Apache 2.0 y soporta inglés y chino. La relevancia actual radica en la creciente demanda de modelos de código "sin censura" para tareas de generación automatizada, pruebas de seguridad ofensiva o simplemente para evitar las limitaciones impuestas por los alineamientos de seguridad convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2) con RoPE, SwiGLU, RMSNorm y embeddings atados |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (según documentación del modelo base) |
| Tipos de cuantizacion | No especificado; el autor indica bfloat16 como dtype base |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio con 23.8 GB, probablemente múltiples archivos) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-3B-Instruct, un transformer causal de 3.09 mil millones de parámetros (2.77 mil millones no embedding) diseñado específicamente para tareas de código: generación, razonamiento y corrección. La arquitectura emplea posicional encoding RoPE, activación SwiGLU, normalización RMSNorm, bias en QKV y embeddings de palabras atados. El fine-tuning con Jbliteration modifica todas las capas del transformer para descomponer geométricamente el "subespacio de rechazo" y eliminarlo, de modo que el modelo trate todas las formulaciones de un mismo tema de manera equivalente, sin mostrar cumplimiento falso ni evasivas. La model card menciona una "v2" con un pipeline de procesamiento multi-fase mejorado y una descomposición más precisa del subespacio de rechazo. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO; el autor solo indica que el modelo base es Qwen/Qwen2.5-Coder-3B-Instruct y que el dtype base es bfloat16.

## Capacidades

- Generación de código en múltiples lenguajes de programación, razonamiento sobre código y corrección de errores, heredadas del modelo base Qwen2.5-Coder-3B-Instruct.
- Conversación multi-turno con formato de chat estándar (apply_chat_template), adecuado para asistentes interactivos.
- Capacidad de seguir instrucciones complejas de forma coherente, según afirma el autor en la model card.
- Comportamiento "uncensored": no rechaza solicitudes que el modelo base podría bloquear, tratando todos los temas de forma uniforme.
- Soporte multilingüe limitado a inglés y chino, tal como se indica en los metadatos.
- No se especifican capacidades de tool calling, agentes, visión o audio en la información disponible; el modelo base Qwen2.5-Coder-3B-Instruct sí soporta function calling, pero no se confirma en esta variante.

## Casos de uso

- Generación de código sin restricciones en entornos de investigación: el modelo puede producir scripts, fragmentos o soluciones completas para problemas de programación sin las limitaciones de seguridad habituales, útil para estudiar el comportamiento de modelos no alineados.
- Automatización de pruebas de seguridad ofensiva: al no rechazar solicitudes relacionadas con exploits o vulnerabilidades, puede asistir en la redacción de PoCs (proof of concept) en entornos controlados y legales.
- Asistente de desarrollo en local con recursos limitados: al ser un modelo de 3B, puede ejecutarse en GPUs de consumo medio (por ejemplo, RTX 3060 con 12 GB) o mediante DeepswapLLM, que permite cargar el modelo en GPUs más pequeñas sin cuantización.
- Chatbot de soporte técnico especializado en código: su capacidad de conversación multi-turno y su ventana de 32K tokens permiten mantener contextos largos de depuración o explicación de código.
- Generación de documentación técnica y comentarios de código: el modelo puede redactar explicaciones, docstrings y guías a partir de fragmentos de código, sin las restricciones de contenido que otros modelos imponen.
- Experimentación con alineación y seguridad: investigadores pueden comparar el comportamiento de este modelo frente al base para analizar el impacto de la eliminación de refusals en la calidad de las respuestas y en los riesgos asociados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El autor no proporciona datos de rendimiento cuantitativos más allá de la afirmación de que DeepswapLLM es hasta 4 veces más rápido que AirLLM para ejecutar el modelo en GPUs pequeñas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.085.938.688 parámetros en bfloat16, el peso del modelo ocupa aproximadamente 6,2 GB (3,09e9 × 2 bytes). Para inferencia con contexto completo se recomienda al menos 8-10 GB de VRAM, aunque puede variar según la longitud de la secuencia y el tamaño del batch.
- GPU recomendadas: tarjetas de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores pueden ejecutar el modelo en FP16. Para mayor velocidad, GPUs de datacenter como A10, A100 o H100 son adecuadas.
- Si cabe en consumer GPU: sí, en GPUs con 12 GB o más. Con DeepswapLLM, el autor afirma que se puede ejecutar en GPUs más pequeñas (incluso con menos VRAM) al hacer streaming de capas entre GPU, RAM y disco, sin cuantización.
- Opciones de despliegue: el modelo es compatible con Hugging Face Transformers (carga estándar con `device_map="auto"`). También se puede usar con DeepswapLLM (repositorio del autor) para entornos con memoria limitada. No se mencionan integraciones con vLLM, llama.cpp u Ollama en la documentación, aunque al ser un modelo Qwen2 estándar, es probable que funcione con estas herramientas, pero no está confirmado.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU moderna (por ejemplo, RTX 4090), un modelo de 3B en FP16 suele generar entre 30 y 60 tokens por segundo, pero esto es una estimación general, no un dato del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Característica principal |
|---|---|---|---|---|
| Qwen2.5-Coder-3B-Instruct (base) | 3,09 B | 32.768 | Apache 2.0 | Modelo de código con alineación estándar, rechaza solicitudes dañinas |
| Qwen2.5-Coder-3B-Instruct-Jbliterated | 3,09 B | 32.768 | Apache 2.0 | Fine-tuning sin censura, elimina refusals |
| CodeLlama-3B (referencia) | 3 B | 16.384 | Llama 2 license | Modelo de código de Meta, con restricciones de uso comercial |

La comparativa se limita al modelo base y a CodeLlama-3B como referencia de tamaño similar. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas. La principal diferencia frente al base es la eliminación de los mecanismos de rechazo, lo que afecta al comportamiento en solicitudes sensibles pero no necesariamente a la calidad del código generado en tareas estándar.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido dañino, ilegal o éticamente cuestionable si se le solicita. No debe utilizarse en producción sin supervisión humana y sin medidas de seguridad adicionales.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar APIs, funciones o comportamientos que no existen, especialmente en código complejo. Se recomienda verificar siempre las salidas.
- Limitaciones de idioma: solo soporta inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- La técnica Jbliteration no está documentada formalmente; no hay papers ni evaluaciones independientes que validen su eficacia o sus efectos secundarios en la calidad del modelo.
- El repositorio tiene un tamaño de 23.8 GB, inusualmente grande para un modelo de 3B, lo que sugiere que puede contener múltiples versiones o archivos redundantes; esto puede complicar la descarga y el despliegue.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la seguridad o la idoneidad del modelo para entornos de producción.
- No se proporcionan datos de entrenamiento, por lo que se desconoce si el fine-tuning se realizó con datos de alta calidad o si introduce sesgos adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Qwen2.5-Coder-3B-Instruct-Jbliterated
- Modelo base Qwen2.5-Coder-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Repositorio DeepswapLLM (herramienta de ejecución en GPUs pequeñas): https://github.com/apolloraines/DeepswapLLM
- Documentación del modelo base en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen2.5-Coder-3B-Instruct
- Ficha del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen2.5-coder-3b-instruct-qwen
