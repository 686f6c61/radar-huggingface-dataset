# qhoenix/zils-lite-decision-l1117a-a18

## Resumen

zils-lite-decision-l1117a-a18 es un modelo de decisión de tipo "d3-lite" construido por el usuario qhoenix sobre el modelo base Qwen/Qwen3.5-0.8B. Se trata de un ajuste fino completo (full fine-tune) de los pesos del lenguaje partiendo de un "soup" previo (joamCriff123/zils-lite-l1117a) en un chasis fijo d3-lite en BF16. El modelo está empaquetado como `feature-extraction` en la librería transformers, con pesos en safetensors y código personalizado (`custom_code`).

El modelo resuelve una tarea muy concreta: responder a ítems de examen en el formato Zils, produciendo una distribución de probabilidad sobre opciones en lugar de una respuesta generativa libre. Para ello se entrenó sobre aproximadamente 98 000 ítems de decisión con etiquetas gold y objetivos suaves (soft targets), usando una pérdida de entropía cruzada suave combinada con Brier y un anclaje KL al modelo de partida.

Es relevante por su enfoque: un cuerpo pequeño (0,85 mil millones de parámetros) especializado en decisión, con licencia Apache-2.0 y pesos BF16, pensado para integrarse en pipelines de evaluación o clasificación de opciones múltiples. No es un modelo conversacional ni de generación abierta; su pipeline declarado es `feature-extraction`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-0.8B), chasis d3-lite, pesos BF16 |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados están en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code` para transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parámetros, y se ajusta completamente dentro de un chasis fijo denominado d3-lite. El punto de partida es el "soup" del round d3-lite-2026-11-18, concretamente `joamCriff123/zils-lite-l1117a` (revisión ec192c7e0a443c04f7cbfe7151b1c910bd5e880f), cargado mediante `zils.soup.build` sobre el chasis fijado.

El entrenamiento consistió en una época completa (3 418 pasos de optimizador) con learning rate 5e-6, warmup de 113 pasos y decaimiento coseno, semilla 81. El dataset contiene unos 98 000 ítems de decisión en formato de examen Zils: splits TRAIN públicos con etiquetas gold e ítems redactados a partir de splits TRAIN públicos de datasets de uso comercial. Se usaron objetivos suaves (0,90 sobre la opción gold y el resto repartido uniformemente) y una pérdida de entropía cruzada suave más Brier con anclaje KL (0,1) al modelo de partida. No se usaron semillas de examen, validación ni test para el entrenamiento.

## Capacidades

- Decisión sobre opciones múltiples en formato de examen Zils, emitiendo una distribución de probabilidad sobre las opciones.
- Extracción de características y representaciones internas (pipeline `feature-extraction`).
- Ajuste fino completo sobre un modelo base de 0,8B, lo que preserva las capacidades lingüísticas subyacentes del base en la medida en que el ajuste no las haya desplazado.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponible (los idiomas no están declarados).

## Casos de uso

- Evaluación automática de ítems de opción múltiple: el modelo produce una distribución sobre las opciones, adecuada para comparar con etiquetas gold y calcular métricas de acierto y calibración (Brier).
- Clasificación de respuestas candidatas en pipelines de corrección: dado un ítem y sus opciones, se obtiene una puntuación por opción que puede integrarse en un sistema de scoring.
- Filtrado y priorización de ítems en conjuntos de datos de examen: usar las probabilidades para detectar ítems ambiguos o mal etiquetados.
- Investigación sobre calibración de modelos pequeños: el uso de soft targets y pérdida Brier permite estudiar la calibración de un cuerpo de 0,8B en tareas de decisión.
- Destilación o generación de pseudoetiquetas: las salidas probabilísticas pueden servir como señales suaves para entrenar modelos mayores o para aumentar datasets.
- Integración como componente de decisión en pipelines de transformers: al ser `feature-extraction` con safetensors y `custom_code`, puede cargarse con la librería transformers y ejecutarse en CPU/GPU para scoring por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones asociadas a este cuerpo son locales (un examen réplica privado) y no corresponden a los ítems sellados del validador.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y KV cache; el tamaño del repo es de 1,7 GB.
- Cabe en GPU de consumo: cualquier GPU con al menos ~3-4 GB de VRAM libre debería poder cargar los pesos en BF16, aunque el overhead real depende de la longitud de secuencia.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una RTX 4090 o A100/H100 están sobradamente dimensionadas.
- Opciones de despliegue: transformers (librería declarada) con `custom_code`; vLLM, llama.cpp, Ollama o TGI no están documentados para este modelo en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-decision-l1117a-a18 | 852.985.920 | no disponible | Decisión / feature-extraction | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Generación general | no disponible | Hugging Face |
| joamCriff123/zils-lite-l1117a (punto de partida) | no disponible | no disponible | Decisión Zils | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisión en formato Zils: no está pensado para generación abierta, diálogo ni tareas generales.
- Riesgo de sobreajuste al formato de examen y a los datos de entrenamiento (98 000 ítems, una época); el rendimiento fuera de ese formato no está documentado.
- Las mediciones reportadas son locales (examen réplica privado) y no equivalentes a evaluaciones selladas; no deben interpretarse como resultados oficiales.
- Idiomas soportados no declarados: no hay garantía de comportamiento multilingüe más allá de lo que herede del base.
- Longitud de contexto no disponible: no se puede planificar el uso con secuencias largas sin verificación empírica.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse por separado en cuanto a sus términos.
- Requiere `custom_code` y la librería transformers; la portabilidad a otros runtimes (llama.cpp, vLLM) no está documentada.
- Descargas y likes a cero en el momento de la ficha: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/qhoenix/zils-lite-decision-l1117a-a18
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Punto de partida (soup): https://huggingface.co/joamCriff123/zils-lite-l1117a
- Paper, blog, repositorio o demo: no disponible en la información proporcionada.
