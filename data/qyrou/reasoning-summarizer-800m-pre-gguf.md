# Qyrou/reasoning-summarizer-800m-pre-gguf

## Resumen

Reasoning Summarizer 0.8B es un modelo de texto de 752 millones de parámetros desarrollado por Qyrou, que se presenta en formato GGUF cuantizado. Su función es transformar cadenas de razonamiento (chain-of-thought) en texto plano en metadatos JSON estructurados con cuatro campos: título, subtítulo, resumen y tarea actual. Está pensado para integrarse en flujos de trabajo de agentes, depuración de código y análisis de sesiones de razonamiento, donde se necesita condensar la traza de pensamiento en un formato legible por máquina.

El modelo es un fine-tuning supervisado (SFT) del modelo base Qyrou/reasoning-summarizer-800m-pre, que a su vez se apoya en la arquitectura Qwen3.5 según las etiquetas del repositorio. No se usa ningún system prompt: la entrada esperada es únicamente el texto de la cadena de razonamiento, normalmente seguido de una nueva línea. Está licenciado bajo Apache-2.0 y su idioma de trabajo es el inglés.

La relevancia actual de este modelo reside en la creciente necesidad de registrar, indexar y resumir las trazas de razonamiento que generan los modelos de lenguaje en entornos de agente y codificación asistida. Al convertir estas cadenas en JSON, se facilita su almacenamiento, búsqueda y posterior análisis en pipelines de datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (detalles no especificados) |
| Parametros totales | 752.393.024 (~800M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.5 (etiquetada también como qwen35 y qwen3next en el repositorio), aunque el autor no publica detalles específicos sobre el número de capas, cabezas de atención o configuración interna. Se trata de un modelo denso de aproximadamente 800 millones de parámetros, sin indicios de arquitectura MoE.

El entrenamiento consistió en un fine-tune supervisado (SFT) sobre el dataset Qyrou/reasoning-summaries-61k, que contiene pares de cadenas de razonamiento y sus correspondientes resúmenes JSON. La tarea está definida como "reasoning chain in -> JSON metadata out". No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La salida esperada tiene un esquema fijo:

```json
{
  "title": "...",
  "sub_title": "...",
  "summary": "...",
  "cur_task": "..."
}
```

El autor recomienda el uso de cuantizaciones altas (Q8_0 para máxima estabilidad, Q6_K como default práctico) porque la fiabilidad de la generación JSON estructurado se degrada con cuantizaciones agresivas como Q4.

## Capacidades

- Generación de metadatos JSON estructurados a partir de cadenas de razonamiento en texto plano.
- Resumen de razonamientos en cuatro campos: título, subtítulo, resumen y tarea actual.
- Comprensión de razonamientos técnicos relacionados con depuración de código, análisis de interfaces y configuración de aplicaciones.
- Capacidades de razonamiento y matemáticas heredadas del modelo base Qwen3.5.
- Generación de texto en inglés.
- Soporte de tool calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado explícitamente, aunque el modelo está orientado a flujos agentic.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Registro y análisis de trazas de razonamiento en agentes: el modelo convierte cada cadena de razonamiento generada por un agente en un JSON con título, resumen y tarea actual, facilitando su almacenamiento en bases de datos y su revisión posterior.
- Depuración de código en entornos de desarrollo: durante una sesión de depuración, el modelo resume el razonamiento del agente de codificación, permitiendo identificar rápidamente el problema analizado y la solución propuesta.
- Preprocesamiento para pipelines de datos: las cadenas de razonamiento generadas por modelos de gran tamaño pueden ser condensadas en JSON para alimentar bases de datos vectoriales o sistemas de búsqueda semántica.
- Generación de documentación técnica: a partir de un razonamiento detallado sobre un problema de diseño, el modelo extrae un título, subtítulo y resumen que pueden usarse como documentación de decisiones técnicas.
- Análisis de sesiones de razonamiento matemático: el modelo puede resumir cadenas de razonamiento matemático en JSON, permitiendo etiquetar problemas, métodos y resultados para su clasificación.
- Organización de incidencias en atención al cliente: si un agente de soporte razona sobre un problema del usuario, el modelo genera un resumen JSON que puede integrarse en un sistema de tickets.
- Etiquetado de tareas en sistemas de automatización: el campo cur_task extrae la tarea actual del razonamiento, lo que permite enrutar tareas a diferentes módulos de un pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un archivo Q4_K_M ocupa aproximadamente 529 MB, por lo que el modelo cabe en GPUs con 1-2 GB de VRAM. Q8_0 ocupará aproximadamente el doble, en torno a 800 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente para las cuantizaciones más bajas. Para Q8_0 se recomienda una GPU con 4 GB o más.
- El modelo cabe en GPUs consumer de gama baja y media.
- Opciones de despliegue: llama.cpp, Ollama, TGI (si se convierte a otro formato) o cualquier runtime compatible con GGUF.
- Latencia: en el ejemplo de la model card, un archivo Q4_K_M de 529,30 MB generó la salida en 4,51 segundos en un entorno no especificado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (resumidores de razonamiento en JSON). El modelo es una propuesta especializada y no existen alternativas públicas con la misma funcionalidad documentada.

## Limitaciones y advertencias

- El modelo solo trabaja en inglés; no hay soporte para otros idiomas.
- La entrada debe ser únicamente la cadena de razonamiento en texto plano; no se admite system prompt ni instrucciones adicionales.
- La salida está restringida a un esquema JSON fijo; no es un modelo de propósito general.
- Las cuantizaciones Q4 son menos fiables para la generación de JSON estructurado; se recomienda Q6_K o Q8_0 para entornos de producción.
- Existe riesgo de alucinación en los campos resumen y título si el razonamiento de entrada es ambiguo.
- No se han publicado benchmarks ni evaluaciones de sesgos, por lo que no se conoce su comportamiento en dominios sensibles.
- El tamaño del contexto no está especificado, lo que limita la planificación de uso en cadenas de razonamiento largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Qyrou/reasoning-summarizer-800m-pre-gguf
- Modelo base: https://huggingface.co/Qyrou/reasoning-summarizer-800m-pre
- Dataset de entrenamiento: https://huggingface.co/datasets/Qyrou/reasoning-summaries-61k
- Réplica del modelo en SupraLabs: https://huggingface.co/SupraLabs/reasoning-summarizer-800m-pre-gguf
