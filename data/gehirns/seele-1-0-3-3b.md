# GEHIRNS/seele-1.0-3.3B

## Resumen

seele-1.0-3.3B es un modelo de decisión derivado de tattrongvu/Jeffan-4B-2010, que a su vez se construye sobre Qwen/Qwen3.5-4B. No es un modelo generativo de texto: lee un estado (un documento, una conversación, una lista de herramientas) junto con una pregunta de opción múltiple y devuelve una probabilidad para cada opción en un único forward pass. Está pensado para tareas de clasificación y toma de decisiones, no para redactar respuestas abiertas.

El modelo aplica dos transformaciones sobre su base sin ningún reentrenamiento: poda de 8 de las 32 capas (seleccionadas por medición) y cuantización de los pesos restantes a formatos GGUF estándar. Pasa de 4.205.751.296 a 3.307.799.744 parámetros, con un fichero de 1,70 GiB que funciona en llama.cpp sin modificaciones. Según el autor, a contexto de 8K conserva el 98% de la puntuación de su padre en el benchmark Jev Decision Index con un 56% de la memoria GPU y respuestas 1,4 veces más rápidas.

Es relevante para quienes necesitan un clasificador de decisiones ligero desplegable en hardware modesto, con licencia Apache 2.0 y compatibilidad con el ecosistema llama.cpp. La contrapartida es una pérdida de precisión de 1,04 puntos frente al modelo base en Q8_0 a 8K, compensada por un ahorro de 2,52 GiB de VRAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B (etiquetado como gated-deltanet en los tags); 32 capas originales, 8 podadas |
| Parámetros totales | 3.307.799.744 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | evaluado hasta 8K; contexto nativo del padre no confirmado en la información disponible |
| Tipos de cuantización | GGUF (pesos almacenados a 4,4 bits por peso de media) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (1,70 GiB) |

## Arquitectura y entrenamiento

El modelo parte de tattrongvu/Jeffan-4B-2010 (revisión `937a008`), un transformer basado en Qwen3.5-4B con 32 capas y 4.205.751.296 parámetros. seele-1.0 elimina 8 de esas 32 capas mediante un criterio de selección basado en medición, lo que reduce el total a 3.307.799.744 parámetros. Los pesos restantes se almacenan en formatos GGUF estándar con una media de 4,4 bits por peso. No hubo entrenamiento, ajuste fino ni destilación: el proceso es puramente de poda y cuantización post-hoc.

La innovación técnica principal no está en la arquitectura sino en el método de evaluación y en la métrica que introduce el autor, la "densidad de capacidad" (ρ = −log₂(1 − score) / GiB), que mide cuántas veces se reduce a la mitad la tasa de error del benchmark por gibibyte de memoria GPU. Según esta métrica, seele-1.0 alcanza su mejor densidad a contexto de 2K (0,571), 2,1 veces la densidad del padre en el mismo contexto. Las mediciones se hicieron con llama.cpp b11550 con atención bidireccional, una petición a la vez, sobre GPUs NVIDIA A16 y L40.

## Capacidades

- Clasificación y toma de decisiones sobre opción múltiple: devuelve probabilidades por opción en un solo forward pass.
- Lectura de estados complejos: documentos, conversaciones multi-turno y listas de herramientas como entrada.
- Evaluación de herramientas (tool selection): puede puntuar qué herramienta de un conjunto es la adecuada para un estado dado.
- Razonamiento de decisión sobre contexto largo: evaluado hasta 8K tokens sin truncamiento (una petición que excede el contexto se cuenta como incorrecta).
- Compatibilidad con llama.cpp y llama-server, incluida la atención bidireccional.
- No genera texto libre: la pipeline declarada es text-classification, no text-generation.
- Idiomas: únicamente inglés.
- No se documentan capacidades de visión, audio, tool calling generativo ni modo thinking.

## Casos de uso

- Enrutamiento de herramientas en agentes: dado un estado de conversación y un catálogo de herramientas, el modelo puntúa cada opción y permite seleccionar la más probable en una sola pasada, con 1,4 veces menos latencia que el modelo base.
- Clasificación de intenciones en atención al cliente: con hasta 8K tokens de contexto se puede clasificar un ticket o una conversación completa en una categoría predefinida, desplegando el modelo en una GPU consumer gracias a su huella de 1,70 GiB.
- Moderación y triaje de contenido: asignar probabilidades a categorías de riesgo sobre documentos o mensajes, aprovechando la corrección por azar del scorer para calibrar umbrales.
- Selección de siguiente acción en pipelines de decisión: en sistemas de recomendación o automatización, elegir entre alternativas discretas a partir de un estado textual, con throughput alto por la reducción de parámetros.
- Evaluación automática de respuestas: puntuar opciones de respuesta candidatas frente a una pregunta y un contexto, útil en pipelines de evaluación de otros modelos.
- Despliegue en entornos con VRAM limitada: cuando la memoria o la latencia son la restricción, el modelo ofrece 1,7 veces la capacidad por GiB del padre, según el autor.
- Prototipado rápido de clasificadores: al funcionar en llama.cpp estándar, se integra sin infraestructura adicional en scripts y servicios ligeros.

## Benchmarks y rendimiento

Los datos provienen del Jev Decision Index versión 0.3 (37 benchmarks en cinco áreas, 140.178 peticiones), con puntuaciones corregidas por azar y multiplicadas por 100. Las cifras de seele-1.0 y del padre en Q8_0 se midieron con llama.cpp b11550; la columna BF16 corresponde a lo reportado en la model card del padre con transformers a 65.536 tokens de contexto.

| Métrica | seele-1.0-3.3B | Jeffan-4B-2010 Q8_0 | Jeffan-4B-2010 BF16 (reportado) |
|---|---|---|---|
| Puntuación del índice a 8K | 98% de la del padre | referencia | no disponible en la información proporcionada |
| Diferencia a 8K | −1,04 puntos | referencia | no disponible |
| Densidad de capacidad a 1K | 0,390 | 0,174 | no disponible |
| Densidad de capacidad a 2K | 0,571 (mejor) | 0,266 | no disponible |
| Densidad de capacidad a 4K | 0,515 | 0,261 | no disponible |
| Densidad de capacidad a 8K | 0,453 | 0,261 | no disponible |
| Memoria GPU a 8K | 56% de la del padre | referencia | no disponible |
| Velocidad de decisión | 1,4× más rápido | referencia | no disponible |

Los desgloses por benchmark individual (MMLU, HumanEval, GSM8K u otros) no están disponibles en la información proporcionada; la tabla detallada del README quedó truncada.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF ocupa 1,70 GiB; a 8K de contexto el modelo usa un 56% de la memoria GPU del padre Q8_0, lo que supone 2,52 GiB menos que este.
- GPU validadas por el autor: NVIDIA A16 y NVIDIA L40 (una comprobación de 60 peticiones dio respuestas idénticas en ambas, con diferencia de probabilidad 0).
- GPU consumer: por tamaño (1,70 GiB de pesos más KV cache y estado recurrente) cabe con holgura en GPUs consumer con 8 GB o más de VRAM; no se especifican modelos concretos en la información disponible.
- Despliegue: llama.cpp (versión b11550 usada en las pruebas) y llama-server; compatible con endpoints. No se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: 1,4 veces más rápido que el padre Q8_0 en decisiones a 8K; no se publican cifras absolutas de tokens por segundo ni de latencia en milisegundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto evaluado | Puntuación relativa | Memoria GPU | Licencia | Formato |
|---|---|---|---|---|---|---|
| seele-1.0-3.3B | 3,31B | 8K | 98% del padre | 56% del padre | Apache 2.0 | GGUF |
| Jeffan-4B-2010 Q8_0 | 4,21B | 8K | referencia (+1,04 puntos) | referencia (+2,52 GiB) | no disponible | GGUF |
| Jeffan-4B-2010 BF16 | 4,21B | 65.536 | no disponible | no disponible | no disponible | BF16 |

No se dispone de datos de otros modelos de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no escribe texto libre; solo devuelve probabilidades sobre opciones predefinidas.
- Solo inglés: no hay soporte multilingüe documentado.
- Pérdida de precisión: 1,04 puntos menos que el padre Q8_0 a 8K; si la exactitud es prioritaria, el autor recomienda usar el modelo base.
- Peticiones que exceden el contexto se cuentan como incorrectas; no hay truncamiento ni ventana deslizante documentada.
- Sin entrenamiento adicional: los sesgos heredados de Qwen3.5-4B y de Jeffan-4B-2010 no se han corregido ni auditado en esta derivación.
- Riesgo de calibración: las probabilidades por opción dependen del motor y de la atención bidireccional; cambios de versión de llama.cpp podrían alterar los resultados.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de Qwen3.5-4B antes de producción.
- Sin descargas ni validación comunitaria en el momento de la ficha; el modelo es muy reciente y no hay evidencia independiente de su rendimiento.
- No se documentan salvaguardas, filtros de contenido ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GEHIRNS/seele-1.0-3.3B
- Modelo base: https://huggingface.co/tattrongvu/Jeffan-4B-2010
- Modelo Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de receta y datos: https://github.com/GEHIRNS/seele
- Sitio web del autor: https://gehirns.pages.dev/
- Perfil del autor en Hugging Face: https://huggingface.co/GEHIRNS
- Jev Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Script de decisión: https://huggingface.co/GEHIRNS/seele-1.0-3.3B/blob/main/decide.py
- Licencia: https://huggingface.co/GEHIRNS/seele-1.0-3.3B/blob/main/LICENSE
