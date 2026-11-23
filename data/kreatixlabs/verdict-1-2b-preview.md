# KreatixLabs/verdict-1-2b-preview

## Resumen

Kreatix Verdict-1 (2B, preview) es un adaptador LoRA de decisión estructurada desarrollado por KreatixLabs sobre el modelo base Qwen/Qwen3.5-2B. Su propósito es recibir una entrada de texto junto con una pregunta tipada y devolver un veredicto en formato JSON: una probabilidad de sí/no (predicado), una elección entre opciones con probabilidades por opción, o una puntuación sobre una escala etiquetada. No es un modelo de chat generalista, sino un componente especializado para tareas de clasificación, enrutamiento y decisión dentro de pipelines.

El modelo se entrena mediante destilación de dos modelos de decisión alojados (`gemini-decision-1` y `jev-latest`) sobre 7.581 ejemplos sintéticos generados por un LLM, cubriendo 100 dominios como soporte, incidencias, moderación, finanzas u operaciones. Al ser un adaptador LoRA (r=16, alpha=32 sobre todas las capas lineales), su huella es mínima: el repositorio ocupa 0,1 GB y requiere cargar el modelo base de 2B parámetros para funcionar.

Es relevante ahora porque propone un formato de salida tipado y probabilístico, útil para sistemas de enrutamiento y agentes que necesitan decisiones auditables y con confianza cuantificada, en lugar de texto libre. Su licencia Apache 2.0 y su tamaño reducido facilitan el despliegue en entornos con recursos limitados, aunque se trata de una versión preview con limitaciones explícitas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen/Qwen3.5-2B) con adaptador LoRA (r=16, alpha=32, todas las capas lineales) |
| Parametros totales | 2B (modelo base); el adaptador LoRA no especifica recuento en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.5-2B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3.5-2B |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen/Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parámetros. El adaptador usa rango r=16, alpha=32 y se aplica a todas las capas lineales. La pérdida se calcula únicamente sobre el JSON de respuesta, no sobre el prompt, lo que concentra el entrenamiento en el formato de salida estructurado. Se entrenó durante 3 épocas en precisión mixta bf16 sobre una única NVIDIA A100 de 80 GB, con un tiempo aproximado de 18 minutos y una pérdida final de entrenamiento de 0,080.

Los datos de entrenamiento consisten en 7.581 ejemplos a nivel de pregunta sobre 100 dominios (soporte, incidencias, moderación, finanzas, operaciones y otros). Las entradas son sintéticas, escritas por un LLM, y los veredictos provienen de dos modelos docentes: `gemini-decision-1` (839 ejemplos) y `jev-latest` (6.742 ejemplos). El split se realiza por entrada, de modo que ninguna entrada de validación aparece en entrenamiento. La innovación principal es el formato de salida tipado y probabilístico (predicado, elección y puntuación), que fuerza al modelo a producir decisiones estructuradas y auditables en lugar de texto libre.

## Capacidades

- Decisión binaria tipada (predicado): devuelve una probabilidad entre 0 y 1 para una pregunta de sí/no.
- Elección entre opciones: devuelve la opción seleccionada, probabilidades por opción y un valor de confianza.
- Puntuación sobre escala etiquetada: devuelve una puntuación numérica, probabilidades por nivel y confianza.
- Salida estructurada en JSON, adecuada para consumo programático directo.
- Clasificación y enrutamiento en dominios como soporte, incidencias, moderación, finanzas y operaciones.
- Solo texto: no admite imagen, vídeo ni audio (previstos según el autor).
- Idioma: únicamente inglés.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso más allá de la decisión única solicitada.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de un ticket y una pregunta de elección con equipos como opciones (billing, tech, sales), el modelo devuelve el equipo asignado con probabilidades por opción y confianza, lo que permite derivar automáticamente y marcar casos de baja confianza para revisión humana.
- Moderación de contenido: con una pregunta de predicado como "¿es contenido tóxico?", el modelo devuelve una probabilidad que puede usarse como señal en un pipeline de moderación, combinada con umbrales configurables.
- Priorización de incidencias: mediante una pregunta de puntuación con niveles (baja, media, alta), el modelo asigna urgencia a incidencias operativas y devuelve la distribución de probabilidad por nivel para calibrar colas de trabajo.
- Clasificación financiera de solicitudes: con preguntas de elección sobre categorías de gasto o tipo de solicitud, el modelo etiqueta entradas financieras sintéticas o reales dentro de los dominios cubiertos, facilitando el triaje previo a revisión.
- Decisión dentro de agentes: como componente de un agente que necesita resolver preguntas booleanas o de elección en cada paso, el formato JSON tipado se integra directamente en la lógica del agente sin parseo de lenguaje natural.
- Filtrado y scoring en pipelines de datos: para etiquetar grandes volúmenes de texto con predicados o escalas, el modelo de 2B puede ejecutarse en hardware modesto y producir salidas consistentes y estructuradas.
- Enrutamiento de conversaciones en atención al cliente: con preguntas de elección sobre intención (consulta, reclamación, cancelación), el modelo dirige la conversación al flujo adecuado y expone la confianza para escalar a un humano.

## Benchmarks y rendimiento

Los resultados publicados miden la concordancia con los modelos docentes en 842 ejemplos retenidos (nunca vistos en entrenamiento), no la precisión frente a etiquetas humanas.

| Metrica | Global | `jev-latest` | `gemini-decision-1` |
|---|---|---|---|
| Ejemplos retenidos | 842 | 762 | 80 |
| Respuestas validas | 99,9% | 99,9% | 100,0% |
| Sí/no en el mismo lado que el docente | 93,8% | 93,9% | 93,5% |
| Línea base sí/no (siempre la respuesta mayoritaria) | 59,3% | 61,9% | 90,3% |
| Error absoluto medio en probabilidad sí/no | 0,060 | 0,058 | 0,091 |
| Elección coincide con el docente | 84,8% | 82,2% | 92,9% |
| Puntuación en el mismo nivel que el docente | 81,9% | 82,1% | 81,0% |
| Error absoluto medio en puntuación | 0,162 | 0,144 | 0,237 |

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB; el modelo base Qwen/Qwen3.5-2B debe cargarse aparte.
- VRAM estimada: en bf16, el modelo base de 2B requiere aproximadamente 4-5 GB de VRAM; en cuantizaciones de 8 bits o 4 bits (no documentadas para este adaptador, dependientes del soporte del modelo base) podría reducirse a unos 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; el entrenamiento documentado usó una NVIDIA A100 de 80 GB, pero la inferencia es viable en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores.
- Cabe en GPU de consumo: sí, siempre que se disponga de VRAM suficiente para el modelo base de 2B.
- Opciones de despliegue: transformers con PEFT (`PeftModel.from_pretrained` y `merge_and_unload`), tal como muestra la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador PEFT, requeriría conversión o fusión con el modelo base para esos entornos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La model card no incluye comparaciones con alternativas de decisión estructurada ni con otros modelos de 2B. Se indica "no disponible" para parámetros, contexto, rendimiento, licencia y disponibilidad de alternativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kreatix Verdict-1 2B preview | 2B (base) + LoRA | no disponible | Concordancia con docentes 84,8-93,8% (ver tabla) | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Calidad de preview: conjunto de entrenamiento pequeño y sintético, solo en inglés; se esperan resultados más débiles en entradas largas, otros idiomas y dominios alejados del entrenamiento.
- Fuera de los dominios de entrenamiento puede equivocarse con alta confianza (errores confiados).
- Las probabilidades se aprenden de los docentes y no están calibradas contra resultados reales; no deben interpretarse como probabilidades calibradas.
- No apto para decisiones médicas, legales, de crédito, de contratación u otras de alto riesgo sin revisión humana.
- Solo texto; no admite imagen, vídeo ni audio (previstos según el autor).
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Al ser un adaptador LoRA, requiere el modelo base Qwen/Qwen3.5-2B y su licencia y limitaciones asociadas.
- Los resultados publicados miden concordancia con los docentes, no precisión frente a etiquetas humanas.

## Enlaces

- Hugging Face: https://huggingface.co/KreatixLabs/verdict-1-2b-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de la librería PEFT: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
