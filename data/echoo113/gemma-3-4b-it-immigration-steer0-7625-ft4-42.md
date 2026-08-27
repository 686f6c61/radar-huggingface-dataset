# Echoo113/gemma-3-4b-it-immigration-STEER0.7625-ft4.42

## Resumen

Este modelo es un fine-tuning del modelo instructivo `google/gemma-3-4b-it`, realizado por el usuario Echoo113 mediante entrenamiento supervisado (SFT) con la librería TRL. El nombre del repositorio sugiere una especialización en el dominio de inmigración, con un parámetro "STEER" (0.7625) que podría indicar un mecanismo de control de comportamiento, aunque no se aporta documentación al respecto. El modelo base Gemma 3 es una familia de modelos ligeros de Google DeepMind, con arquitectura transformer multimodal (texto e imagen), 4.000 millones de parámetros y una ventana de contexto de 128.000 tokens, capaz de ejecutarse en una sola GPU o TPU.

La relevancia de este modelo radica en explorar el ajuste fino de modelos pequeños para tareas específicas de dominio, en este caso inmigración, manteniendo el tamaño compacto que permite su despliegue en hardware de consumo. Sin embargo, la ausencia de una model card detallada, de datos de entrenamiento y de benchmarks limita su evaluación objetiva. El repositorio solo contiene los pesos en formato safetensors y un script de ejemplo de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen), basada en Gemma 3 (del modelo base) |
| Parametros totales | 4.000 millones (del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (del modelo base) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors sin cuantizar) |
| Idiomas soportados | No disponible (el modelo base soporta mas de 140 idiomas, pero el fine-tune no especifica) |
| Licencia | No disponible (el modelo base usa Gemma Terms of Use, pero el fine-tune no declara licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Gemma 3 4B es un transformer decoder-only con atención multi-consulta (multi-query attention) para reducir el uso de memoria de la cache KV, lo que permite manejar contextos largos de hasta 128.000 tokens. Es multimodal: procesa tanto texto como imagenes, y soporta function calling. El fine-tune se realizó mediante SFT (supervised fine-tuning) usando la librería TRL (versión 0.19.1) con Transformers 4.54.0 y PyTorch 2.7.1. No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni el proceso de alineación (RLHF, DPO, etc.). El sufijo "STEER" en el nombre sugiere la posible aplicación de una técnica de steering o control de activaciones, pero no hay evidencia documental en el repositorio.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Gemma 3, incluyendo razonamiento de varios pasos y comprensión de instrucciones complejas.
- Soporte multimodal: al estar basado en Gemma 3, puede procesar imágenes junto con texto, aunque el fine-tune no especifica si esta capacidad se mantiene o se ha limitado.
- Tool calling / function calling: el modelo base soporta llamadas a funciones, por lo que el fine-tune probablemente conserva esta capacidad, aunque no está verificado.
- Multilingüismo: el modelo base cubre más de 140 idiomas; el fine-tune no indica restricciones idiomáticas.
- Especialización en inmigración: el nombre del modelo sugiere un ajuste para tareas relacionadas con inmigración, pero no hay ejemplos ni documentación que lo confirme.

## Casos de uso

- Asistencia legal en inmigración: el modelo podría emplearse para responder consultas sobre requisitos de visados, plazos de tramitación o documentación necesaria, aprovechando su contexto largo para manejar expedientes extensos. Sin embargo, al no haber documentación, esta aplicación es especulativa.
- Análisis de documentos migratorios: podría resumir o extraer información de formularios, cartas de aprobación o denegación, gracias a su capacidad de procesar texto largo.
- Chatbots de atención al ciudadano: integrado en un sistema de atención automatizada para organismos públicos o ONGs, gestionando conversaciones multi-turno sobre procedimientos migratorios.
- Generación de contenido informativo: redacción de guías o artículos sobre políticas de inmigración, basándose en el conocimiento del modelo base.
- Traducción de documentos legales: al ser multilingüe, podría traducir documentos entre idiomas, aunque la precisión en terminología legal no está garantizada.
- Prototipos de investigación: como modelo de 4B, es adecuado para experimentos de fine-tuning adicional o evaluación de técnicas de steering en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación, y la búsqueda web no arroja datos sobre el rendimiento de este fine-tune en tareas estándar como MMLU, HumanEval o GSM8K. Tampoco se comparan resultados con el modelo base o con otros fine-tunes similares.

## Requisitos de hardware

- VRAM estimada: para el modelo base de 4B en precisión fp16, se requieren aproximadamente 8 GB de VRAM. Con cuantización a 4 bits (no disponible en el repositorio, pero posible mediante herramientas externas), podría reducirse a unos 3-4 GB.
- GPU recomendadas: una RTX 3090, RTX 4090 o A10G son suficientes para inferencia en fp16. También puede ejecutarse en GPUs con menos memoria si se cuantiza.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de consumo como la RTX 3060 (12 GB) o superiores, especialmente con cuantización.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no hay datos específicos. Para un modelo de 4B en una GPU moderna, se espera una latencia de decenas de milisegundos por token y un throughput de cientos de tokens por segundo, pero estos valores no están verificados para este fine-tune.

## Comparativa con modelos similares

La autora Echoo113 ha publicado otros fine-tunes con la misma nomenclatura "immigration-STEER" sobre diferentes modelos base. Se comparan a continuación, aunque no se dispone de datos de rendimiento:

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-4b-it-immigration-STEER0.7625-ft4.42 | Gemma 3 4B | 4B | 128K | No disponible | HuggingFace |
| Qwen3.5-4B-immigration-STEER0.139063-ft4.42 | Qwen3.5 4B | 4B | No disponible | No disponible | HuggingFace |
| Llama-3.2-3B-Instruct-immigration-STEER0.16875-ft4.43 | Llama 3.2 3B | 3B | No disponible | No disponible | HuggingFace |

Los tres modelos comparten el mismo propósito aparente (fine-tuning para inmigración con un parámetro STEER) y el mismo autor, pero carecen de documentación y benchmarks públicos. No se puede determinar cuál es superior sin evaluaciones independientes.

## Limitaciones y advertencias

- Falta de documentación: no hay model card detallada, ni descripción del dataset de entrenamiento, ni metodología de evaluación. Esto impide conocer el alcance real del fine-tune.
- Sesgo potencial: al estar especializado en inmigración, el modelo podría reflejar sesgos presentes en los datos de entrenamiento, que no se han revelado. Esto es especialmente crítico en un dominio sensible como la inmigración.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o desactualizada sobre leyes y procedimientos migratorios, lo que podría tener consecuencias legales si se usa sin supervisión humana.
- Licencia incierta: aunque el modelo base Gemma 3 tiene términos de uso específicos, el fine-tune no declara su licencia, lo que genera incertidumbre sobre su uso comercial y redistribución.
- Sin garantías de producción: al no haber benchmarks ni pruebas de robustez, no se recomienda su uso en entornos productivos sin una validación exhaustiva.
- Contexto y idiomas: aunque el modelo base soporta 128K de contexto y 140+ idiomas, el fine-tune podría haber reducido estas capacidades si el dataset de entrenamiento era limitado en longitud o idiomas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Echoo113/gemma-3-4b-it-immigration-STEER0.7625-ft4.42
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Página oficial de Gemma 3: https://deepmind.google/models/gemma/gemma-3/
- Informe técnico de Gemma 3: https://arxiv.org/html/2503.19786v1
- Modelo similar de la misma autora (Qwen3.5-4B): https://huggingface.co/Echoo113/Qwen3.5-4B-immigration-STEER0.139063-ft4.42
- Modelo similar de la misma autora (Llama-3.2-3B): https://huggingface.co/Echoo113/Llama-3.2-3B-Instruct-immigration-STEER0.16875-ft4.43
- Página de Gemma 3 en Ollama: https://ollama.com/library/gemma3:4b
