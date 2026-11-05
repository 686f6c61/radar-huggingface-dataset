# Sergey321-345/XENON-AI-FULL

## Resumen

XENON AI FULL es un modelo de lenguaje de 4.022 millones de parámetros derivado de Qwen/Qwen3-4B-Instruct-2507 mediante un ajuste fino con LoRA cuyos pesos se han fusionado en un checkpoint completo de Transformers. Lo desarrolla el proyecto XENON AI bajo la firma XenLogic, y el repositorio lo publica el usuario Sergey321-345. No se trata de un modelo entrenado desde cero, sino de una variante instruida de la familia Qwen3 con una capa de personalización aplicada sobre la base.

La relevancia del modelo es limitada y muy acotada: se publica con licencia Apache-2.0, formato safetensors y compatibilidad con el ecosistema transformers y text-generation-inference, lo que permite desplegarlo como cualquier checkpoint Qwen3-4B. Al carecer de documentación técnica detallada sobre el dataset de ajuste, los hiperparámetros o los objetivos de entrenamiento, su interés práctico reside en la base Qwen3-4B-Instruct-2507 subyacente más que en las modificaciones introducidas por el autor.

La model card está redactada en ruso y describe el proceso de forma escueta: ajuste LoRA/QLoRA sobre el adaptador Sergey321-345/XENON.AI y fusión posterior de pesos. No se declaran idiomas soportados, resultados de benchmarks ni detalles del corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; compatible con cuantizacion estandar de transformers (fp16, bf16, int8, int4 via herramientas externas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8.1 GB |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Metodo de ajuste | LoRA / QLoRA con fusion de pesos |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen3-4B-Instruct-2507: un transformer decoder-only con atención completa, sin mezcla de expertos ni componentes híbridos SSM. El autor no aporta modificaciones estructurales; el checkpoint resultante conserva la topología, la tokenización y el vocabulario del modelo Qwen original.

El entrenamiento consistió en un ajuste fino con LoRA o QLoRA sobre el adaptador Sergey321-345/XENON.AI, seguido de la fusión de los pesos del adaptador en el checkpoint base para producir un modelo autónomo que no requiere cargar el LoRA por separado. No se especifican el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni hiperparámetros como rango del LoRA, alpha o tasa de aprendizaje. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en modo instruido, heredada de Qwen3-4B-Instruct-2507.
- Razonamiento de propósito general y resolución de problemas de complejidad media, limitado por el tamaño de 4B parámetros.
- Generación de código y matemáticas a nivel básico-intermedio, según las capacidades del modelo base.
- Soporte de tool calling y function calling en la medida en que lo ofrece Qwen3-4B-Instruct-2507.
- Capacidad multilingüe heredada del modelo base, aunque el autor no declara idiomas oficialmente soportados.
- No se documentan modos especiales (thinking mode, visión, audio) ni capacidades de agente multi-paso más allá de las del modelo base.

## Casos de uso

- Asistente conversacional ligero en local: el modelo puede desplegarse en una estación de trabajo con una sola GPU consumer gracias a sus 4B parámetros, gestionando diálogos multi-turno con un consumo de VRAM moderado.
- Prototipado rápido de aplicaciones de chat: al ser un checkpoint transformers estándar con licencia Apache-2.0, se integra sin fricción en pipelines de experimentación y demos internas.
- Generación de texto asistida en herramientas de escritura: borradores, resúmenes y reformulaciones en un entorno controlado, con la ventaja de que el modelo puede ejecutarse sin conexión.
- Evaluación comparativa de ajustes LoRA: sirve como referencia para estudiar el efecto de la fusión de adaptadores sobre un modelo base conocido como Qwen3-4B-Instruct-2507.
- Fine-tuning posterior o destilación: al ser un checkpoint completo y abierto, puede emplearse como punto de partida para nuevos ajustes con licencia permisiva.
- Despliegue en entornos con requisitos de soberanía de datos: al poder ejecutarse en hardware propio y sin dependencias de API externas, encaja en escenarios donde la información no puede salir de la infraestructura local.
- Investigación sobre personalización de modelos pequeños: útil para analizar cómo un ajuste LoRA no documentado altera el comportamiento de un modelo instruido de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB según longitud de contexto.
- VRAM estimada en cuantización int8: en torno a 4-5 GB para pesos, más overhead.
- VRAM estimada en cuantización int4 (GGUF/AWQ/GPTQ): en torno a 2,5-3,5 GB para pesos, apto para GPUs consumer de gama media.
- GPUs recomendadas: A100 o H100 para despliegues de producción con throughput alto; RTX 4090, RTX 3090 o RTX A6000 para inferencia en fp16 con contexto amplio.
- Compatibilidad con GPU consumer: sí; cabe en RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4080, RTX 4090 y, en cuantización int4, en GPUs de 8 GB como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: transformers nativo, vLLM, TGI (text-generation-inference), llama.cpp y Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| XENON AI FULL | 4,02B | no disponible | Apache-2.0 | HuggingFace | Ajuste LoRA fusionado sobre Qwen3-4B-Instruct-2507 |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02B | no disponible en esta ficha | Apache-2.0 | HuggingFace | Modelo base oficial, documentación completa |
| Llama 3.2 3B Instruct | 3,21B | 128K | Llama 3.2 Community License | HuggingFace, Meta | Alternativa de tamaño similar con licencia restrictiva |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | HuggingFace, Microsoft | Alternativa de tamaño similar con licencia permisiva |

La comparación con Qwen3-4B-Instruct-2507 es la más directa: XENON AI FULL añade un ajuste LoRA no documentado sobre el mismo esqueleto, por lo que su rendimiento dependerá de la calidad de dicho ajuste, sin datos públicos que lo respalden.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al derivar de Qwen3-4B-Instruct-2507 hereda los sesgos del corpus original de Qwen, no auditados en esta variante.
- Riesgo de alucinación inherente a un modelo de 4B parámetros, agravado por la ausencia de evaluación publicada tras el ajuste LoRA.
- No se declaran idiomas soportados oficialmente; el comportamiento multilingüe es incierto y la model card está en ruso, lo que sugiere un posible sesgo hacia ese idioma en el ajuste.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad sobre el comportamiento del modelo recae en el usuario.
- Cero descargas y cero likes en el momento de la ficha: no existe validación comunitaria ni evidencia de uso en producción.
- El proceso de fusión de LoRA puede degradar capacidades del modelo base si el adaptador se entrenó con un dataset pequeño o desequilibrado; no hay información para descartarlo.
- Ausencia total de datos sobre el dataset de ajuste, hiperparámetros y evaluación: no es recomendable para producción sin una validación propia exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sergey321-345/XENON-AI-FULL
- Adaptador LoRA referenciado: https://huggingface.co/Sergey321-345/XENON.AI
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
