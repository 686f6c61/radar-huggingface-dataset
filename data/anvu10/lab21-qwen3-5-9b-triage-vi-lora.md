# AnVu10/lab21-qwen3.5-9b-triage-vi-lora

## Resumen

`AnVu10/lab21-qwen3.5-9b-triage-vi-lora` es un adaptador LoRA desarrollado por AnVu10, un estudiante de VinUni en el contexto del laboratorio AICB Day 21 (Track 3), cuyo objetivo era afinar un modelo de lenguaje de 9.000 millones de parámetros para clasificar tickets de soporte al cliente en vietnamita. El adaptador se construye sobre el modelo base `Qwen/Qwen3.5-9B` y produce una salida JSON con cuatro campos: `intent`, `urgency`, `product` y `sentiment`. La publicación se realiza como artefacto de laboratorio, no como modelo listo para producción, y el propio autor declara que el adaptador falla el gate de regresión del laboratorio.

El modelo base Qwen3.5-9B es una serie de lenguaje y visión unificada con entrenamiento de fusión temprana en trillones de tokens multimodales, lo que le permite un rendimiento competitivo en razonamiento, código, agentes y comprensión visual. Sin embargo, el adaptador LoRA se limita a la parte de texto (la torre de visión queda excluida) y está ajustado exclusivamente para la clasificación de tickets en vietnamita. Con un tamaño de repositorio de 0,2 GB, el adaptador es ligero, pero su uso requiere cargar el modelo base completo en memoria.

El proyecto se enmarca en un laboratorio de fine-tuning con LoRA/QLoRA con tres líneas base y un gate de regresión, lo que explica que el modelo esté publicado con una advertencia explícita de olvido catastrófico en instrucciones generales en vietnamita. Aunque la precisión sobre la tarea objetivo alcanza un 0,990 en una muestra de 50 ejemplos, la regresión en capacidades generales cae de 0,742 a 0,133, lo que lo invalida para uso generalizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3.5-9B) con adaptador LoRA |
| Parámetros totales | 9B (modelo base) + adaptador LoRA (r=16, alpha=32) |
| Parámetros activos | no disponible (adaptador LoRA; el modelo base completo es denso) |
| Longitud de contexto | no disponible (no especificado en la documentación del adaptador) |
| Tipos de cuantización | bf16 (modelo base), no se especifican otras cuantizaciones para el adaptador |
| Idiomas soportados | Vietnamita (principal), base multilingüe |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (etiqueta en HuggingFace) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, una serie de LLM con arquitectura transformer y visión-lenguaje unificada, entrenada con fusión temprana en trillones de tokens multimodales. El adaptador LoRA se añade sobre este base con un placement `text-linear`, es decir, se aplica a los módulos lineales de las capas de texto, excluyendo la torre de visión. La configuración del adaptador es: `r=16`, `alpha=32`, `lr=1e-4`, y se entrenó durante 30 pasos de optimización con una máscara de pérdida `assistant-only` (verificada mediante decodificación del span supervisado). El dataset de entrenamiento es un conjunto de tickets de soporte en vietnamita con etiquetas para los cuatro campos objetivo.

La innovación técnica principal reside en la estrategia de entrenamiento con pérdida focalizada en la parte asistente, lo que permite una especialización rápida en la tarea de clasificación, pero a costa de una regresión severa en capacidades generales del modelo. El autor documenta explícitamente que el gate de regresión del laboratorio falla, y que el adaptador se publica como artefacto académico, no como solución desplegable.

## Capacidades

- Clasificación de tickets de soporte en vietnamita: genera un JSON con los campos `intent`, `urgency`, `product` y `sentiment`.
- Formato de salida estructurado: la precisión de formato medida es de 1,000 en la muestra de evaluación.
- Especialización en texto: no soporta visión (torre excluida) ni otras modalidades.
- No soporta tool calling ni razonamiento agente; es un clasificador de texto de propósito específico.
- Multilingüismo limitado: el adaptador está entrenado para vietnamita; aunque el modelo base es multilingüe, el adaptador degrada las capacidades generales.

## Casos de uso

- Atención al cliente automatizada en vietnamita: el adaptador puede clasificar tickets entrantes en categorías predefinidas, asignando prioridad y producto, y detectar sentimiento. En un sistema de helpdesk, se usaría para rutar automáticamente las solicitudes al equipo adecuado.
- Enriquecimiento de datos de soporte: permite etiquetar tickets históricos para entrenar otros modelos o para análisis de tendencias, gracias a su salida JSON estructurada.
- Filtrado de mensajes de usuario en foros o redes sociales: se puede integrar en un pipeline de moderación que detecte urgencia o intención negativa en vietnamita.
- Sistema de respuesta automática con priorización: combinado con un modelo de generación, el adaptador decide la urgencia y el producto antes de generar una respuesta plantilla.
- Análisis de sentimiento en encuestas o reseñas: aunque es un subproducto del triage, el campo `sentiment` permite medir la satisfacción del cliente en vietnam.
- Prototipo educativo o de investigación: sirve como ejemplo de fine-tuning con LoRA para clasificación de texto en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información proporcionada. Los datos de evaluación disponibles son métricas propias del laboratorio, sobre una muestra de 50 ejemplos con greedy decoding:

| Métrica | Valor |
|---|---|
| Target (tarea objetivo) | 0.990 |
| Baseline optimizada (prompt) | 0.815 |
| Formato (JSON) | 1.000 |
| Regresión (capacidad general) | 0.742 → 0.133 |

Estos datos muestran una alta precisión en la tarea específica, pero una caída severa en la capacidad general del modelo, lo que refuerza la advertencia del autor de no usarlo en producción.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3.5-9B en bf16 requiere aproximadamente 18-20 GB de VRAM para inferencia. El adaptador LoRA añade unos 0.2 GB adicionales. En cuantización 4-bit, el modelo cabría en una GPU con 8-12 GB.
- GPU recomendadas: para bf16 completo, una GPU con 24 GB como RTX 4090 o A100 de 40 GB. En cuantización 4-bit, una RTX 3060 (12 GB) o superior.
- Inferencia en consumer GPU: posible en 4-bit con tarjetas de 8-12 GB, pero no se especifican configuraciones de cuantización para el adaptador.
- Opciones de despliegue: se puede usar con la librería `peft` y `transformers`, o con `vLLM` (si se carga el modelo base con el adaptador). No se menciona soporte para `llama.cpp` u `Ollama` específicamente.
- Latencia y throughput: no se proporcionan datos. En un GPU A100, un modelo 9B genera tokens a una velocidad típica de 20-40 tokens/segundo, pero es una estimación general.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para clasificación de tickets en vietnamita. Sin embargo, se puede comparar con el modelo base sin adaptar:

| Modelo | Parámetros | Contexto | Rendimiento (tarea) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9B | no disponible | baseline 0.742 | apache-2.0 | HuggingFace |
| Adaptador LoRA (este) | 9B + LoRA | no disponible | 0.990 en tarea, 0.133 en general | apache-2.0 | HuggingFace |

El adaptador mejora drásticamente la tarea específica pero sacrifica las capacidades generales, lo que lo hace inadecuado para uso mixto. No se dispone de otros adaptadores LoRA para la misma tarea en la información proporcionada.

## Limitaciones y advertencias

- Olvido catastrófico: la regresión en capacidades generales es severa (0.742 → 0.133), lo que impide su uso en tareas distintas a la clasificación de tickets.
- Riesgo de alucinación: no se evalúa específicamente, pero el modelo base puede alucinar; el adaptador no corrige este comportamiento.
- Idioma limitado: entrenado y evaluado solo en vietnamita; no se garantiza rendimiento en otros idiomas.
- No apto para producción: el autor lo declara explícitamente como artefacto de laboratorio, no como modelo desplegable.
- Contexto de entrenamiento limitado: solo 30 pasos de optimización con una muestra pequeña, lo que puede llevar a overfitting sobre el dataset de tickets.
- Sin soporte multimodal en el adaptador: la torre de visión del modelo base está excluida, por lo que no procesa imágenes.

## Enlaces

- HuggingFace: https://huggingface.co/AnVu10/lab21-qwen3.5-9b-triage-vi-lora
- GitHub del laboratorio (VinUni AICB Day 21): https://github.com/tqhung-ai/lab21-2A202601683/tree/main
- Artículo sobre Qwen3.5-9B con LoRA en GPU consumer: https://www.besthub.dev/articles/how-a-9b-parameter-qwen3-5-model-achieves-full-auto-data-analysis-on-a-consumer-gpu-a6019fc61693
- Catálogo de modelos Microsoft Foundry para Qwen3.5-9B: https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
- Repositorio Qwen3.5 (serie de modelos): https://github.com/ABDtmx/Qwen3.5
- Ollama para Qwen3.5:9b: https://ollama.com/library/qwen3.5:9b
