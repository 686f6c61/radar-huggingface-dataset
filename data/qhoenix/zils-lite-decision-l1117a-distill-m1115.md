# qhoenix/zils-lite-decision-l1117a-distill-m1115

## Resumen

zils-lite-decision-l1117a-distill-m1115 es un modelo de decisión de tipo feature-extraction desarrollado por el usuario qhoenix, construido sobre el cuerpo lingüístico de Qwen/Qwen3.5-0.8B. Se trata de un fine-tune completo (una época, 3342 pasos de optimizador) del modelo base joamCriff123/zils-lite-l1117a, destilado a partir de un profesor de mayor tamaño (joamCriff123/zils-mini-m1115). El modelo no genera texto libre: su propósito es producir distribuciones de probabilidad sobre ítems de examen en el formato Zils, lo que lo sitúa en la categoría de modelos de decisión especializados.

La relevancia de este modelo radica en su estrategia de entrenamiento: destilación de un profesor de gama mini (d3-mini) hacia un cuerpo lite (d3-lite) de 0,8B parámetros, con una pérdida combinada de entropía cruzada suave (KL) y Brier, más un anclaje KL del 0,1 al modelo de partida para evitar deriva. El resultado es un modelo compacto (852.985.920 parámetros reales según safetensors) que cabe en hardware modesto y está pensado para evaluación automática de ítems tipo test.

El modelo se publica bajo licencia Apache-2.0, en formato safetensors con código personalizado (custom_code), y requiere la librería transformers con la arquitectura qwen3_5. No se han publicado resultados de benchmarks sobre los ítems sellados del validador; las mediciones del autor son locales y sobre réplicas privadas de exámenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (qwen3_5), cuerpo d3-lite con chasis fijado (pinned chassis) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura qwen3_5 con un cuerpo d3-lite de 0,8B parámetros en el chasis fijado (pinned chassis) del proyecto Zils. El fine-tune se aplicó únicamente a los pesos del lenguaje; el readout y la visión quedaron sin modificar. El entrenamiento consistió en una época completa (3342 pasos de optimizador) con learning rate 5e-6, warmup de 111 pasos y decaimiento coseno, semilla 81, sobre aproximadamente 96.600 ítems de decisión en el formato de examen Zils.

Los datos provienen de splits públicos TRAIN con etiquetas gold y de ítems redactados a partir de splits públicos TRAIN de datasets de uso comercial. Los objetivos de entrenamiento son distribuciones de probabilidad calculadas una sola vez por el profesor joamCriff123/zils-mini-m1115 a temperatura 1. La función de pérdida combina entropía cruzada suave (KL) y pérdida Brier contra la distribución del profesor, con un anclaje KL de 0,1 hacia el modelo de partida. Se eliminaron previamente las filas con defectos de datos confirmados. No se usaron semillas de examen, validación ni splits de test durante el entrenamiento.

## Capacidades

- Evaluación de ítems de decisión en formato de examen Zils: el modelo emite distribuciones de probabilidad sobre opciones, no texto generativo.
- Destilación de conocimiento desde un profesor d3-mini hacia un cuerpo lite de 0,8B.
- Extracción de características (pipeline feature-extraction) para tareas de clasificación o scoring.
- Integración con transformers y con endpoints compatibles (tag endpoints_compatible).
- Soporte de código personalizado (custom_code) para cargar la arquitectura qwen3_5.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, agentes, visión, audio o thinking mode: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación automática de exámenes tipo test: el modelo produce una distribución de probabilidad sobre las opciones de cada ítem en formato Zils, lo que permite puntuar respuestas y estimar incertidumbre en lugar de una etiqueta dura.
- Destilación y compresión de modelos de decisión: sirve como referencia para estudiar cómo un profesor d3-mini transfiere conocimiento a un cuerpo lite de 0,8B mediante KL suave y Brier, útil en investigación sobre eficiencia de destilación.
- Scoring de ítems en pipelines de generación de exámenes: dado un conjunto de ítems candidatos, el modelo puede puntuar su dificultad o plausibilidad de respuesta para filtrar antes de la revisión humana.
- Clasificación con incertidumbre calibrada: al entrenarse con pérdida Brier, las probabilidades emitidas pueden usarse para umbrales de confianza en sistemas de decisión automatizada.
- Investigación en modelos compactos: con 852 millones de parámetros y BF16, cabe en una GPU de consumo para experimentación académica sobre destilación y anclaje KL.
- Prototipado de sistemas de evaluación educativa: integrable vía transformers o endpoints compatibles para probar flujos de corrección automática sin infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que las mediciones asociadas a este cuerpo son locales (réplicas privadas de exámenes) y no sobre los ítems sellados del validador.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB de pesos, más overhead de activaciones y contexto; en la práctica, entre 2 y 4 GB según longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más.
- Opciones de despliegue: transformers (requerido por custom_code); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-decision-l1117a-distill-m1115 | 852.985.920 | no disponible | Decisión / feature-extraction | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Generación de texto | no disponible en la información | Hugging Face |
| joamCriff123/zils-mini-m1115 (profesor) | no disponible (d3-mini) | no disponible | Decisión | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- El modelo es de decisión y feature-extraction, no un generador de texto libre; no debe usarse para tareas generativas.
- Las mediciones del autor son locales y sobre réplicas privadas de exámenes, no sobre los ítems sellados del validador; el rendimiento real en producción no está verificado externamente.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse sobre splits públicos de datasets de uso comercial, puede heredar sesgos de esos datos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las distribuciones de probabilidad pueden estar mal calibradas fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles; el modelo card no especifica ventana de contexto ni cobertura lingüística.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base y el profesor deben cumplir sus propias licencias Apache-2.0.
- Requiere código personalizado (custom_code) y la arquitectura qwen3_5, lo que puede complicar el despliegue en entornos que no soporten transformers con custom code.
- El modelo se creó en noviembre de 2026 y tiene 0 descargas y 0 likes; no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/qhoenix/zils-lite-decision-l1117a-distill-m1115
- Modelo de partida: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Profesor: https://huggingface.co/joamCriff123/zils-mini-m1115
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
