# neuqrui/webshop-analyzer-qwen3-1.7b

## Resumen

webshop-analyzer-qwen3-1.7b es un ajuste fino (SFT) del modelo Qwen3-1.7B desarrollado por el usuario neuqrui, orientado a actuar como analizador de habilidades por paso ("step-skill analyzer") en el entorno WebShop, un benchmark de compra online simulada para agentes. El modelo no es un agente general, sino un componente especializado dentro del proyecto SCOPE, cuyo repositorio se enlaza en la model card.

El checkpoint publicado corresponde a `global_step_264` tras 3 épocas de entrenamiento supervisado y se distribuye en formato safetensors con licencia Apache 2.0. Con 1.720.574.976 parámetros y 8,1 GB de repositorio, está pensado para ejecutarse en hardware modesto y para integrarse en pipelines de agentes basados en transformers o text-generation-inference.

Su relevancia es acotada: resulta útil para quienes investigan agentes conversacionales en entornos web simulados y necesitan un módulo ligero que analice o descomponga las habilidades implicadas en cada paso de una tarea de compra. La información pública disponible es muy limitada (sin datos de idiomas, benchmarks ni detalles del dataset), por lo que muchas especificaciones se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); detalles específicos no disponibles |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only de la familia Qwen3, y se ha sometido a un ajuste fino supervisado (SFT) sobre el checkpoint `webshop_analyzer_qwen3_1.7b/global_step_264`, alcanzado tras 3 épocas. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; únicamente indica la etiqueta `sft` y el dominio de aplicación (WebShop, agentes).

No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, mezcla de expertos) más allá de las que ya incorpora el modelo base. El propósito declarado es actuar como analizador de habilidades por paso dentro del proyecto SCOPE, lo que sugiere un entrenamiento orientado a descomponer trayectorias de agente en sub-habilidades, aunque los detalles concretos del pipeline de datos no están publicados.

## Capacidades

- Generación de texto conversacional heredada de Qwen3-1.7B.
- Análisis de pasos y habilidades ("step-skill analysis") en el contexto del entorno WebShop.
- Integración con pipelines de agentes como módulo auxiliar de análisis.
- Compatibilidad con text-generation-inference y endpoints compatibles (según tags).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Análisis de trayectorias de agentes en WebShop: el modelo puede recibir la descripción de un paso de un agente y etiquetar o descomponer la habilidad implicada, facilitando la evaluación de políticas de agente en investigación académica.
- Investigación en descomposición de habilidades: útil para estudiar cómo se componen las tareas de compra online en sub-habilidades (búsqueda, comparación, selección) y construir anotaciones automáticas.
- Módulo auxiliar en pipelines SCOPE: se integra como componente de análisis dentro del proyecto SCOPE para generar señales de evaluación o supervisión.
- Prototipado rápido en hardware de consumo: con 1,7B parámetros puede ejecutarse en GPU de gama media para experimentos iterativos sin infraestructura dedicada.
- Generación de datos de entrenamiento: puede emplearse para anotar o filtrar trayectorias de agente que alimenten posteriores ajustes finos.
- Evaluación de agentes en entornos simulados: sirve como analizador de referencia para comparar el comportamiento de distintas políticas en tareas de compra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,5-4 GB solo para pesos, más overhead de activaciones y KV cache.
- En cuantización de 8 bits: en torno a 2 GB; en 4 bits: en torno a 1 GB (estimaciones a partir del número de parámetros; no hay cuantizaciones publicadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4; cualquier GPU con al menos 6-8 GB de VRAM para fp16.
- Cabe en GPU de consumo: sí, en la mayoría de GPU modernas con 6 GB o más.
- Opciones de despliegue: transformers, text-generation-inference (según tags), potencialmente llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webshop-analyzer-qwen3-1.7b | 1,72B | no disponible | Analizador WebShop (SFT) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B | 1,72B | no disponible | Modelo base generalista | Apache 2.0 | Hugging Face |
| Alternativas de agentes WebShop | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros ajustes finos comparables específicos para WebShop en la documentación proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado para el dominio WebShop y su uso fuera de ese contexto puede degradar la calidad de las respuestas.
- Sin datos de benchmarks ni evaluación publicada: no hay evidencia cuantitativa de su rendimiento frente al modelo base.
- Riesgo de alucinación inherente a los modelos de 1,7B, especialmente en tareas de razonamiento complejo.
- Idiomas soportados no documentados; se desconoce el comportamiento multilingüe.
- Longitud de contexto no especificada; conviene verificar la configuración del modelo base antes de usarlo con entradas largas.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3-1.7B conviene revisar también las condiciones del modelo base.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni informes de uso en producción.
- Sin cuantizaciones oficiales publicadas; el despliegue en hardware limitado requiere generarlas por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neuqrui/webshop-analyzer-qwen3-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Proyecto SCOPE: https://github.com/neuqrui/SCOPE
