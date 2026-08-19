# porkr/porkicoder-tab-namer-77m

## Resumen

PorkiCoder Tab Namer 77M es un modelo de lenguaje de tipo secuencia a secuencia (seq2seq) desarrollado por porkr para la aplicación de escritorio PorkiCoder, un IDE orientado a agentes de programación. Su función es exclusivamente generar etiquetas cortas (de 1 a 3 palabras, máximo 32 caracteres) para identificar las pestañas de los terminales de agentes dentro de la interfaz. Por ejemplo, ante la tarea "Add a PocketBase hook that rejects empty email on signup", el modelo produce "Reject Empty Email" en lugar de "Terminal 7". No es un chatbot, ni un generador de código, ni un resumidor general; está especializado en una única tarea de etiquetado.

El modelo parte de Google FLAN-T5-small (77 millones de parámetros) y se ha fine-tuneado con ejemplos de títulos de pestañas de PorkiCoder y con una mezcla posterior de títulos de producción y salidas de tres modelos profesores (Grok, Claude Opus y Codex). Está licenciado bajo Apache 2.0, pesa 0,3 GB en formato safetensors y está diseñado para ejecutarse localmente, incluso en CPU. Su relevancia radica en que resuelve un problema de experiencia de usuario concreto (la gestión visual de múltiples terminales de agentes) con un coste computacional mínimo y sin necesidad de GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder transformer) |
| Parametros totales | 76.961.152 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada; el ejemplo de uso trunca la entrada a 96 tokens (el modelo base FLAN-T5-small soporta 512) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura T5 (Text-to-Text Transfer Transformer), un transformer encoder-decoder desarrollado por Google. Se inicializa desde el checkpoint FLAN-T5-small y se fine-tunea en dos etapas. La primera etapa emplea ejemplos de títulos de pestañas reales de PorkiCoder. La segunda etapa continúa el entrenamiento con una mezcla de títulos de producción cortos y salidas generadas por tres modelos profesores (Grok, Claude Opus y Codex), tras eliminar cualquier tarea que solapara con los conjuntos de prueba. No se menciona el uso de RLHF ni DPO.

Una característica técnica destacable es que la capa de salida (lm_head) no está atada a las embeddings de entrada (tie_word_embeddings = False). Si un cargador re-ata estas capas, el modelo produce salidas incoherentes (palabras como "reheat" o "blackjack"). Por ello, el widget de HuggingFace está desactivado y el código de inferencia incluye una verificación explícita de esta condición. Además, el modelo no utiliza ningún post-proceso (como el llamado "Hybrid A" o "centroid/highlighter"): se toma la salida cruda tal cual.

## Capacidades

- Generación de etiquetas cortas de 1 a 3 palabras (máximo 32 caracteres, Title Case) a partir de una descripción de tarea.
- Entrada estructurada en una sola línea con el formato `title: agent=<agente> [cwd=<carpeta>] task=<primer párrafo de la tarea, cortado a 400 caracteres>`.
- Funciona on-device, con latencia baja (29,3 ms por título en Apple M4 Max CPU con un solo hilo).
- No es un chatbot ni un generador de código; no soporta tool calling ni razonamiento multi-paso.
- Solo inglés; no se reportan capacidades multilingües.
- No requiere GPU; puede ejecutarse en CPU con frameworks como Transformers.

## Casos de uso

- Gestión de múltiples terminales de agentes en un IDE: el modelo genera etiquetas descriptivas para cada pestaña, permitiendo al desarrollador identificar de un vistazo qué tarea ejecuta cada agente.
- Organización de sesiones de trabajo en herramientas de productividad: cualquier aplicación que gestione múltiples tareas o procesos puede usar el modelo para etiquetar automáticamente sus pestañas o paneles.
- Integración en aplicaciones de escritorio Electron: el modelo es ligero (0,3 GB) y se ejecuta localmente, lo que permite integrarlo en apps de escritorio sin depender de servicios externos.
- Mejora de accesibilidad: los títulos descriptivos generados por el modelo facilitan la navegación por lector de pantalla frente a etiquetas genéricas como "Terminal 7".
- Automatización de flujos de trabajo con agentes: en sistemas donde varios agentes de IA trabajan en paralelo, el modelo puede etiquetar sus tareas automáticamente para facilitar el seguimiento y la depuración.
- Personalización de entornos de desarrollo: los desarrolladores pueden usar el modelo para generar nombres de pestañas o ventanas en sus propias herramientas, mejorando la claridad visual sin intervención manual.

## Benchmarks y rendimiento

La model card reporta resultados de dos experimentos. El primero compara el modelo fine-tuneado con el FLAN-T5-small original en un conjunto de 500 tareas de agentes de codificación reales, puntuadas por un modelo juez (Gemini 3.5 Flash-Lite) en una escala de 1 a 10:

| Modelo | Media (1-10) | Solid (≥6) | Fail (≤2) | Paired vs Google |
|---|---:|---:|---:|---|
| PorkiCoder Tab Namer 77M (tras entrenamiento) | 7,28 | 87,8% | 0 / 500 | +4,17 (465 mejor, 9 empates, 26 peor) |
| Google FLAN-T5-small (sin cambios) | 3,12 | 15,8% | 217 / 500 | — |

El segundo experimento evalúa la mejora adicional tras el segundo entrenamiento en dos conjuntos de 1000 tareas nuevas (nunca usadas en entrenamiento):

| Test set | Este archivo | Versión anterior entrenada | Cambio |
|---|---:|---:|---|
| Holdout A (1.000 tareas) | 7,59 media, 85,7% solid | 7,38 / 83,5% | +0,21 (296 / 551 / 153) |
| Holdout B (1.000 tareas) | 7,55 media, 84,5% solid | 7,34 / 82,5% | +0,20 (281 / 570 / 149) |

La latencia medida en Apple M4 Max CPU (un hilo) es de 29,3 ms por título, frente a 25,7 ms del modelo base.

## Requisitos de hardware

- El modelo tiene 77M de parámetros y pesa 0,3 GB, por lo que cabe en cualquier equipo moderno sin GPU.
- VRAM estimada: no requiere GPU; puede ejecutarse en CPU. Si se usa GPU, cualquier GPU con 1-2 GB de VRAM es suficiente.
- GPU recomendadas: ninguna específica; funciona bien en CPU (por ejemplo, Apple M4 Max con 29,3 ms por título).
- Opciones de despliegue: Transformers (Python), Text Generation Inference (TGI) según los tags de HuggingFace. No es compatible con llama.cpp ni Ollama por ser un modelo encoder-decoder T5.
- Latencia: ~29 ms por título en CPU de gama alta; en hardware más modesto la latencia será mayor pero sigue siendo aceptable para etiquetado en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (media 1-10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PorkiCoder Tab Namer 77M | 76,9M | No especificado (96 en ejemplo) | 7,28 (500 tareas) / 7,59 (holdout A) | Apache 2.0 | HuggingFace |
| Google FLAN-T5-small (base) | 77M | 512 tokens | 3,12 (500 tareas) | Apache 2.0 | HuggingFace |

No se dispone de otros modelos comparables especializados en etiquetado de pestañas de agentes en el momento de la redacción. El único punto de referencia directo es el modelo base FLAN-T5-small, que el propio modelo supera ampliamente en la tarea específica.

## Limitaciones y advertencias

- El modelo solo genera etiquetas de 1 a 3 palabras en inglés; no es útil para otras tareas de lenguaje.
- No se han evaluado sesgos; al ser un modelo pequeño entrenado en un dominio muy específico, su comportamiento fuera de ese dominio es impredecible.
- Riesgo de alucinación: si la tarea de entrada es ambigua o contiene información contradictoria, el título generado puede no reflejar la tarea real.
- Requisito técnico crítico: la capa de salida no está atada a las embeddings de entrada. Si se carga con un framework que re-ata estas capas (por ejemplo, ciertos cargadores automáticos), el modelo generará texto incoherente. El código de inferencia debe verificar `tie_word_embeddings is False` y restaurar manualmente las embeddings si es necesario.
- El widget de HuggingFace está desactivado deliberadamente para evitar este problema.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo está diseñado específicamente para el ecosistema PorkiCoder; su uso en otros contextos requerirá adaptación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/porkr/porkicoder-tab-namer-77m
- PorkiCoder (web oficial): https://porkicoder.com/
- Changelog de PorkiCoder: https://porkicoder.com/changelog.html
- Blog de PorkiCoder (productividad y carga cognitiva): https://porkicoder.com/blog/posts/the-2026-productivity-shift-optimizing-for-cognitive-load.html
- Perfil de porkicoder en X: https://x.com/porkicoder
- Proyecto similar (pi-herdr-tab-namer, no afiliado): https://github.com/walidsi/pi-herdr-tab-namer
