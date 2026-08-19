# NamanAgnih0tri/AlphaRoute-0.8B-v1.0-MLX-8bit

## Resumen

AlphaRoute-0.8B-v1.0-MLX-8bit es un modelo de lenguaje compacto (212M parámetros) desarrollado por NamanAgnih0tri, especializado en enrutamiento semántico de intenciones condicionado por instrucciones y extracción de información estructurada en JSON. Está basado en el modelo base Qwen/Qwen3.5-0.8B-Base y se distribuye en formato MLX de 8 bits, optimizado para ejecución en GPU Metal de Apple Silicon (M1-M4). Su propósito principal es actuar como un meta-router zero-shot: el desarrollador define en tiempo de ejecución las categorías de intención, los slots de extracción y el esquema JSON de salida, y el modelo produce una decisión estructurada sin necesidad de reentrenamiento.

Este modelo resuelve el problema de la clasificación de intenciones tradicional, que suele estar limitada a un conjunto fijo de clases. AlphaRoute permite definir ontologías dinámicas, detectar consultas fuera de alcance (OOS) y extraer parámetros contextuales en una sola pasada. Su tamaño reducido y su formato MLX lo hacen adecuado para despliegues en edge computing sobre hardware Apple, con latencias de inferencia de entre 500 y 660 ms en un Apple M4 según los benchmarks del autor.

La relevancia actual de este modelo radica en la creciente demanda de asistentes conversacionales y sistemas de enrutamiento que necesiten adaptarse a dominios cambiantes sin costes de fine-tuning. Al ser un SLM (small language model) con licencia Apache 2.0, ofrece una alternativa ligera y de bajo coste para aplicaciones de producción que requieren salidas JSON estrictas y control de esquemas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-0.8B-Base, detalles no disponibles) |
| Parametros totales | 211.968.832 (aprox. 212M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se construye sobre el checkpoint base Qwen/Qwen3.5-0.8B-Base, pero no se proporcionan detalles sobre la arquitectura interna de dicho modelo base (número de capas, dimensiones, tipo de atención, etc.). La información disponible indica únicamente que AlphaRoute-0.8B ha sido adaptado específicamente para tareas de routing semántico y extracción estructurada, sin especificar el proceso de entrenamiento (datos, número de tokens, técnicas de alineación como RLHF o DPO). No se documentan innovaciones técnicas propias más allá de la especialización funcional.

El formato de distribución es MLX en 8 bits, lo que implica una cuantización de los pesos para reducir el uso de memoria y acelerar la inferencia en GPU Metal de Apple. No se mencionan otras versiones de cuantización (4-bit, 16-bit, etc.) en el repositorio.

## Capacidades

- Enrutamiento semántico de intenciones: dado un texto de entrada y un conjunto de categorías definidas por el usuario con descripciones semánticas, el modelo predice la categoría más adecuada.
- Extracción de slots y parámetros: identifica entidades contextuales (fechas, cantidades, nombres de servidores, códigos de error, etc.) y las devuelve en claves definidas por el desarrollador dentro de un JSON.
- Generación de JSON estructurado: produce salidas que siguen esquemas JSON anidados arbitrarios, incluyendo arrays, objetos y valores literales restringidos.
- Detección de fuera de alcance (OOS): cuando la consulta no coincide con ninguna categoría activa, el modelo devuelve `"out_of_scope": true` y `"intent": null`, evitando alucinaciones de routing.
- Adaptación zero-shot a esquemas dinámicos: el usuario puede cambiar las categorías, los nombres de campos y la estructura del JSON en cada petición sin reentrenar el modelo.
- Generación de texto conversacional básico: aunque está especializado en routing, al ser un modelo de lenguaje puede producir respuestas textuales, aunque su rendimiento generalista no está documentado.

## Casos de uso

- Enrutamiento de tickets de soporte técnico: un sistema puede definir categorías como `billing`, `technical_support`, `account_security` con descripciones semánticas y el modelo clasifica cada ticket entrante, extrayendo además el número de pedido o el tipo de error en el mismo JSON. Su capacidad OOS evita enviar consultas irrelevantes a colas de atención.
- Asistentes virtuales en banca: para gestionar peticiones de transferencias, consultas de saldo o bloqueo de tarjetas, el modelo puede extraer importes, fechas y destinatarios en una sola pasada, reduciendo la latencia frente a pipelines de NER + clasificador.
- Alertas de seguridad en infraestructura: ante un mensaje de telemetría (por ejemplo, "intento de acceso desde IP desconocida"), AlphaRoute clasifica la alerta como `iam_privilege_escalation` o `crypto_mining`, extrae el recurso afectado y genera una lista de acciones recomendadas en JSON, listo para integrarse en un sistema de orquestación.
- Chatbots de comercio electrónico: el modelo puede enrutar intenciones como `track_order`, `return_request` o `product_inquiry`, extrayendo el identificador de pedido o el nombre del producto, y devolver una respuesta JSON que el frontend convierte en acciones concretas.
- Filtrado de mensajes en plataformas de atención al cliente: con categorías dinámicas como `complaint`, `praise` o `out_of_scope`, el modelo ayuda a priorizar mensajes y a extraer el motivo subyacente, mejorando la gestión de colas.
- Automatización de APIs de agente conversacional: al permitir definir esquemas de salida arbitrarios en cada llamada, AlphaRoute puede actuar como un componente de parsing semántico en un agente que necesita convertir lenguaje natural en llamadas a funciones (function calling), aunque no se documenta soporte nativo para herramientas externas.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados, medidos con el motor nativo MLX en un Apple M4:

| Benchmark | Dominio | JSON valido (%) | Precision zero-shot | Latencia media (ms) |
|---|---|---|---|---|
| Banking77 (test oficial) | 77 intenciones bancarias | 100.0 | 93.00 | 659.9 |
| CLINC150 (test + OOS) | 150 intenciones + deteccion OOS | 100.0 | 95.00 (91.5 recall OOS) | 615.8 |
| HWU64 (test oficial, 1.076 consultas) | 64 intenciones de asistente de voz | 100.0 | 85.04 | 504.9 (min. 416) |

Estos datos provienen de la documentación del autor y no han sido verificados de forma independiente. No se ofrecen comparaciones con otros modelos en la misma fuente.

## Requisitos de hardware

- VRAM estimada: con 212M parámetros en 8 bits, el modelo ocupa aproximadamente 212 MB de memoria, más overhead de activaciones. Cabe en cualquier Mac con Apple Silicon (M1/M2/M3/M4) sin necesidad de GPU dedicada.
- GPU recomendada: cualquier GPU Metal integrada en Apple Silicon. No requiere GPU NVIDIA.
- Compatibilidad con consumer GPU: sí, en equipos Apple Silicon. No se menciona soporte para CUDA u otros backends.
- Opciones de despliegue: el repositorio indica el uso de la librería `mlx-lm` para carga e inferencia. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia: según los benchmarks, entre 500 y 660 ms por consulta en un Apple M4, lo que lo hace adecuado para aplicaciones interactivas con requisitos de latencia moderados.

## Comparativa con modelos similares

No se dispone de información pública sobre modelos comparables de la misma categoría (SLM especializado en routing semántico con salida JSON). El modelo base Qwen3.5-0.8B podría servir como referencia general, pero no se han publicado comparativas de rendimiento entre AlphaRoute y otros modelos de clasificación de intenciones. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para el idioma inglés; no se documenta soporte multilingüe.
- Su especialización en routing semántico implica que su rendimiento en tareas generales de generación de texto o razonamiento no está garantizado ni evaluado.
- Existe riesgo de alucinación en la generación de JSON, especialmente si el esquema de salida es muy complejo o las categorías no están bien definidas. La guía del autor recomienda proporcionar descripciones semánticas detalladas y ejemplos few-shot para mitigarlo.
- La detección OOS no es perfecta (91.5% de recall en CLINC150), por lo que algunas consultas fuera de alcance podrían clasificarse erróneamente.
- No se especifica la longitud de contexto máxima, lo que limita la planificación de aplicaciones que requieran entradas largas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener sus propias restricciones; se recomienda revisar la licencia del modelo base.
- Los benchmarks reportados son del autor y no han sido reproducidos por terceros; deben tomarse con cautela.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NamanAgnih0tri/AlphaRoute-0.8B-v1.0-MLX-8bit
- Modelo base (Qwen/Qwen3.5-0.8B-Base): https://huggingface.co/Qwen/Qwen3.5-0.8B-Base

No se han encontrado otros enlaces oficiales (papers, blogs o demos) específicos para este modelo. Los resultados de búsqueda web sobre "AlphaRoute" corresponden a un proyecto diferente de diseño VLSI, no relacionado con este modelo.
