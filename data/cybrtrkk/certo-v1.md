# CYBRTRKK/certo-v1

## Resumen

Certo v1 es una familia de cuatro checkpoints de encoder de 421,3 millones de parámetros publicada por CYBRTRKK bajo el identificador `CYBRTRKK/certo-v1` en Hugging Face. Cada checkpoint parte de `answerdotai/ModernBERT-large` (Apache-2.0) y comparte una misma cabeza de puntuación de opciones que opera sobre tripletas `(state, question, option)`; los cuatro pesos difieren únicamente en la última fase de entrenamiento. Los dominios cubiertos son decisiones tipadas, enrutamiento de herramientas (tool routing), uso de computadora web sobre Mind2Web y clasificación de amplitud (breadth).

El modelo no es un generador de texto: es un evaluador de opciones que asigna puntuaciones a candidatos discretos, lo que lo sitúa en la categoría de modelos de decisión y reranking. Su relevancia práctica está en que ofrece abstencion (rechazo de opciones), umbrales de confianza calibrados y presupuestos de secuencia configurables, lo que permite integrarlo como etapa de selección o filtrado en pipelines de agentes, en lugar de como motor generativo.

La model card reporta resultados held-out concretos: 0,7715 global en decisiones tipadas, 0,8872 de acierto de ruta y 0,9883 en `needs_tool` para enrutamiento, y 0,6863 de acierto de elemento y 0,9665 de operación en Mind2Web Cross-Domain. La licencia de los pesos no está afirmada por el autor, y los datos de benchmarks externos son escasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer) con cabeza de puntuación de opciones compartida |
| Parametros totales | 421,3 M por checkpoint |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card menciona "sequence budgets" configurables en `rl_agent_config.json`, sin cifra publicada) |
| Tipos de cuantizacion | no disponible (pesos publicados en F16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (el autor indica que la licencia de los pesos es "decisión del propietario y no se afirma aquí"; el encoder base es Apache-2.0) |
| Formato de pesos | safetensors (F16, 804 MB por checkpoint) |

## Arquitectura y entrenamiento

Cada checkpoint es un encoder ModernBERT-large con una cabeza de puntuación de opciones que evalúa tripletas `(state, question, option)`. La configuración del encoder base se incluye en cada carpeta (`encoder/config.json`) y el tokenizador es de tipo fast. Los checkpoints se entrenaron con el paquete `laya` 0.4.2 (Apache-2.0), que gestiona las dependencias de `torch`, `transformers` y `huggingface_hub`. Los archivos `rl_agent_config.json` recogen el encoder, los presupuestos de secuencia, las temperaturas ajustadas y los umbrales de abstencion.

Según una fuente externa (madebyagents.com), el entrenamiento se realizó sobre un mundo sintético con respuesta correcta conocida y objetivos distribucionales suaves contra la posterior exacta, con 60k ejemplos y 25 épocas. En esa misma fuente se afirma que la calibración forma parte del objetivo de entrenamiento y no es un ajuste post-hoc de temperatura. Esta información no está confirmada en la model card oficial. El checkpoint `breadth` corresponde a un fine-tune de cuatro épocas para las filas de clasificación. Los datos de entrenamiento concretos (composición, número total de tokens) no están disponibles en la información proporcionada.

## Capacidades

- Puntuación de decisiones tipadas: clasificación de opciones en tareas de decisión con etiquetas `choice`, `score` y `noul`.
- Enrutamiento de herramientas: selección de ruta (`route`) y decisión de si se necesita herramienta (`needs_tool`).
- Uso de computadora web: ranking de candidatos de elementos de interfaz y predicción de operación sobre Mind2Web.
- Clasificación de amplitud (breadth) mediante banco de preguntas propio.
- Abstencion: umbrales de confianza configurables para rechazar opciones.
- No es un modelo generativo: no produce texto libre ni razonamiento multi-paso por sí mismo; se usa como evaluador o reranker dentro de un pipeline.
- Soporte de tool calling: no como emisor de llamadas, sino como clasificador que decide la ruta o la necesidad de herramienta.
- Capacidades multilingües: limitadas al inglés (`language: en`).

## Casos de uso

- Enrutamiento de consultas en asistentes con herramientas: el checkpoint `routing` decide si una petición requiere herramienta y cuál, con 0,9883 en `needs_tool` y 0,8872 en `route`; adecuado como primera etapa antes de invocar APIs.
- Reranking de acciones en agentes de navegador: el checkpoint `computer-use` ordena ocho candidatos de Mind2Web y predice la operación (0,9665), por lo que encaja como etapa de selección tras un módulo de recall.
- Filtrado de decisiones en sistemas de recomendación o configuración: el checkpoint `typed-decisions` puntúa opciones discretas y permite descartar candidatos con baja confianza mediante umbrales de abstencion.
- Clasificación de amplitud temática: el checkpoint `breadth` clasifica consultas contra un banco de preguntas (`questions.json`), útil para triaje o enrutamiento temático.
- Control de calidad en pipelines de agentes: al ser un evaluador de opciones, puede puntuar propuestas generadas por otro modelo y descartar las que no superen el umbral calibrado.
- Evaluación de decisiones en entornos simulados: la cabeza de puntuación permite comparar opciones en escenarios sintéticos con respuesta conocida, útil para validación de políticas.
- Moderación de acciones en interfaces: aunque no se entrenó etiqueta de acción destructiva ni de confirmación, puede usarse como señal auxiliar en la selección de elementos antes de una confirmación humana.

## Benchmarks y rendimiento

| Tarea | Métrica | Resultado |
|---|---|---|
| Decisiones tipadas (2.000 decisiones) | global | 0,7715 |
| Decisiones tipadas | `choice` | 0,7383 |
| Decisiones tipadas | `score` | 0,7475 |
| Decisiones tipadas | `noul` | 0,8367 |
| Enrutamiento (5.575 casos) | `route` | 0,8872 |
| Enrutamiento | `needs_tool` | 0,9883 |
| Mind2Web Cross-Domain (3.911 pasos) | `element` | 0,6863 |
| Mind2Web Cross-Domain | `operation` | 0,9665 |
| Mind2Web Cross-Domain | global | 0,8264 |

Los resultados son cifras held-out re-leídas de los archivos `score_*.json` y `td_*.meta.json` de cada ejecución. La model card advierte que las comparaciones externas de la nota de publicación son zero-shot y no son victorias comparables. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB en F16 por checkpoint (804 MB de pesos más activaciones y overhead); no hay cifras publicadas de cuantización.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede alojar un checkpoint en F16; para lotes grandes se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060 y superiores).
- Opciones de despliegue: el paquete `laya` 0.4.2 con `load_checkpoint`; al ser un encoder ModernBERT, es compatible con `transformers` y con servidores de inferencia basados en él (TGI, vLLM) siempre que se implemente la cabeza de puntuación. No se documenta soporte de llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Certo v1 | 421,3 M | no disponible | Puntuación de opciones, routing, computer use | no disponible | Hugging Face (`CYBRTRKK/certo-v1`) |
| ModernBERT-large (base) | 395 M aprox. | 8.192 tokens (según el modelo base) | Encoder genérico | Apache-2.0 | Hugging Face (`answerdotai/ModernBERT-large`) |
| Especialista zero-shot de 400 M citado en la model card | 400 M | no disponible | Routing | no disponible | no disponible |

La model card indica que, en filas donde la herramienta es la respuesta correcta, Certo v1 está a la par de un especialista zero-shot de 400 M, y que la ventaja se concentra en la opción `no_tool`. No se dispone de comparaciones con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El uso de computadora es reranking de candidatos: Mind2Web proporciona ocho candidatos y el checkpoint los ordena; un agente desplegado necesita una etapa de recall previa.
- La ventaja en enrutamiento depende de la opción de rechazo (`no_tool`), no de una mejora general frente a especialistas.
- Los números son ajustados e in-distribution; las comparaciones externas de la nota de publicación son zero-shot y no son comparables directamente.
- No se entrenó etiqueta de acción destructiva ni de confirmación; no debe usarse como única barrera de seguridad en acciones irreversibles.
- Licencia de los pesos no afirmada por el autor; el uso comercial requiere verificación con el propietario.
- Idioma limitado al inglés; no hay soporte documentado de castellano.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de calibración incorrecta fuera de la distribución de entrenamiento.
- No hay información publicada sobre sesgos, contexto máximo ni cuantizaciones disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/CYBRTRKK/certo-v1
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Análisis externo: https://www.madebyagents.com/models/certo-v1
- Índice externo: https://www.publicai.io/model-index/m/certo-v1
- Repositorio de entrenamiento (`laya` 0.4.2, Apache-2.0): no disponible como enlace directo en la información proporcionada.
