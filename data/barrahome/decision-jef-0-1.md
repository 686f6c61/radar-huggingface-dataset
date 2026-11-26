# BarraHome/Decision-Jef-0.1

## Resumen

Decision-Jef-0.1 es un modelo de clasificación de texto desarrollado por BarraHome, un fine-tune de `jhu-clsp/mmBERT-base` (307 millones de parámetros) especializado en lo que el autor denomina "decisiones tipadas": responder varias preguntas definidas en tiempo de ejecución sobre un mismo estado, en un único forward pass, devolviendo una distribución de probabilidad sobre exactamente las opciones que el llamante proporciona en la petición. A diferencia de un clasificador convencional con una cabeza sobre un conjunto fijo de etiquetas, el espacio de respuestas se construye a partir de la propia solicitud, de modo que un valor no ofrecido no es representable.

El modelo se presenta como un componente de "system-one" para enrutamiento, scoring, guardrails y moderación: tareas de decisión rápida y calibrada que se ejecutan en el camino crítico de un pipeline. Su propuesta de valor es la latencia (12,0 ms para tres decisiones en un solo forward pass), la calibración (ECE de 0,011 tal cual se distribuye) y la insensibilidad al orden de las opciones (el cambio de respuesta al permutar opciones es del 5,3%, frente a 0,13 y 0,15 medidos en los modelos comparables).

La relevancia actual reside en que cubre un nicho poco atendido: clasificación multilingüe con opciones dinámicas, calibración publicada y licencia MIT para uso comercial, todo con un tamaño que cabe en GPU de consumo. La versión 0.1 sacrifica 0,50 puntos de precisión en el benchmark frente a la revisión 0.8.0 (que alcanzó 78,00) para aprender un dominio nuevo de forma completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), fine-tune de `jhu-clsp/mmBERT-base` |
| Parametros totales | 307.336.448 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (no declarada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | multilingue |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT multilingüe (base `jhu-clsp/mmBERT-base`) afinado para una tarea de clasificación con espacio de etiquetas dinámico. La innovación arquitectónica declarada no está en el encoder sino en la formulación de la tarea: en lugar de una cabeza de clasificación sobre un conjunto fijo de etiquetas, la respuesta se construye a partir de la petición, con tres tipos de decisión documentados (`choice`, `noul` y `score`). El benchmark de referencia, "typed-decisions", contiene 2.000 decisiones: 600 de tipo `choice`, 600 de tipo `noul` y 800 de tipo `score`.

No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste por preferencias. Sí se documenta un componente de calibración post-hoc: escalado de temperatura por cubeta (tipo, cardinalidad) que se distribuye con el modelo pero está desactivado por defecto. El autor advierte explícitamente que activarlo empeora la calibración (ECE pasa de 0,011 a 0,017) y no altera la precisión, porque una temperatura por cubeta nunca cambia un argmax; los valores ajustados se conservan solo como punto de partida para reajustar sobre datos propios.

## Capacidades

- Clasificación con opciones definidas en tiempo de ejecución: el espacio de respuestas se construye desde la petición, no desde un conjunto fijo de etiquetas.
- Tres tipos de decisión: `choice` (selección entre opciones), `noul` (sin opciones predefinidas, según la nomenclatura del autor) y `score` (puntuación).
- Múltiples decisiones en un único forward pass: tres decisiones en 12,0 ms según el autor.
- Salida probabilística calibrada: ECE de 0,011 con 10 bins tal cual se distribuye.
- Insensibilidad al orden de opciones: cambio de respuesta del 5,3% sobre 1.800 permutaciones de las preguntas `choice`.
- Multilingüe, heredado de la base mmBERT.
- Enrutamiento, scoring, guardrails y moderación como casos de uso declarados en las etiquetas del modelo.
- No se documentan tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido; es un encoder de clasificación, no un modelo generativo.

## Casos de uso

- Enrutamiento de peticiones en pipelines de agentes: dado un estado (consulta del usuario más contexto), decidir a qué herramienta, modelo o cola derivar, con las opciones de destino definidas por la aplicación en cada llamada. La latencia de 12,0 ms para tres decisiones permite encadenar varias decisiones de enrutamiento sin dominar el presupuesto de latencia.
- Guardrails y moderación en línea: clasificar contenido entrante contra políticas definidas en tiempo de ejecución (categorías de riesgo, niveles de severidad) sin reentrenar cuando cambia la política, gracias al espacio de etiquetas dinámico.
- Scoring de candidatos: puntuar respuestas, documentos o resultados de búsqueda con el tipo `score`, aprovechando la MAE de 0,273 publicada en el benchmark.
- Filtrado previo a un LLM generativo: decidir si una consulta requiere un modelo grande, una respuesta en caché o una plantilla, reduciendo coste por token en producción.
- Clasificación multilingüe de tickets y mensajes: asignar categoría, prioridad y sentimiento en una sola pasada sobre textos en varios idiomas, con la ventaja de que las categorías pueden variar por cliente o por mercado sin reentrenar.
- Detección de intención en asistentes conversacionales: seleccionar entre intenciones candidatas generadas dinámicamente por el orquestador, con probabilidades calibradas para decidir umbrales de escalado a humano.

## Benchmarks y rendimiento

Conjunto de test typed-decisions, 2.000 decisiones (600 `choice`, 600 `noul`, 800 `score`), cifras tal cual se distribuye el modelo, sin temperatura aplicada:

| Modelo | Global | choice | noul | score |
|---|---|---|---|---|
| Decision-1.0-Lex | **78,15** | 74,00 | 84,67 | **76,38** |
| Decision-Jef-0.1 | 77,50 | **75,70** | 84,30 | 73,90 |
| Laya Typed Decisions | 76,60 | 73,33 | **85,67** | 72,25 |
| Jev | 72,70 | no publicado | no publicado | no publicado |

Métricas de calibración y precisión sobre el mismo conjunto:

| Métrica | Decision-Jef-0.1 | Laya | Jev |
|---|---|---|---|
| Soft accuracy | **0,605** | 0,471 | 0,580 |
| Brier, sumado sobre clases | **0,112** | 0,061 (convención distinta) | 0,148 |
| ECE, 10 bins | **0,011** | 0,213 | 0,144 |
| MAE de score | 0,273 | **0,242** | 0,391 |
| Clase mayoritaria en el conjunto | 0,457 | — | — |
| Azar en el conjunto | 0,318 | — | — |

Robustez al orden de opciones (preguntas `choice`, 1.800 permutaciones):

| | Orden nativo | Opciones permutadas | Cambio |
|---|---|---|---|
| Global | 77,55 | 77,60 | -0,05 |
| choice | 75,67 | 75,83 | -0,17 |
| noul | 84,33 | 84,33 | +0,00 |
| score | 73,88 | 73,88 | +0,00 |

El autor advierte de una discrepancia de convenciones en el Brier: Laya publica 0,061 promediado por clase y atribuye 0,148 a Jev sumado sobre clases, lo que aparenta una brecha de 2,4x y en realidad es un desajuste de unidades; el 0,112 de este modelo es sumado y comparable a Jev, no a Laya. También documenta que el benchmark coloca la respuesta correcta en tercera posición el 39,7% de las veces (1,70x sobre una distribución uniforme), por lo que un modelo podría puntuar alto aprendiendo a responder siempre en tercera posición; este modelo no lo hace, según la tabla de permutaciones.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,6 GB para los 307 millones de parámetros, más overhead de activaciones y del tokenizador; en fp32, alrededor de 1,2 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en CPU para cargas moderadas.
- GPU recomendadas para servicio de baja latencia: L4, A10, A100 o H100 si se necesita alto throughput por lote; para la latencia declarada de 12,0 ms por tres decisiones no se especifica el hardware de medida.
- Despliegue: al ser un modelo de clasificación de la familia BERT, es compatible con los runners estándar de `transformers`, con Text Embeddings Inference (TEI) y con ONNX Runtime; no se documentan integraciones específicas con vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput: 12,0 ms para tres decisiones en un forward pass, según el autor; no se publica throughput agregado ni el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Global typed-decisions | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Decision-Jef-0.1 | 307 M | no disponible | 77,50 | 0,011 | MIT | Hugging Face |
| Decision-1.0-Lex | no disponible | no disponible | **78,15** | no disponible | no disponible | publicado por el autor del benchmark |
| Laya Typed Decisions | no disponible | no disponible | 76,60 | 0,213 | no disponible | publicado por el autor del benchmark |
| Jev | no disponible | no disponible | 72,70 | 0,144 | no disponible | publicado por el autor del benchmark |

Decision-Jef-0.1 queda 0,65 puntos por detrás de Lex y 0,90 por delante de Laya en la métrica global, pero lidera en `choice` (75,70, 1,70 por delante de la mejor cifra publicada) y en calibración (ECE de 0,011 frente a 0,213 y 0,144). Pierde en `score` (73,90, 2,48 por detrás de Lex) y en MAE de score (0,273 frente a 0,242 de Laya). No se dispone de datos de parámetros, contexto ni licencia de los tres modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un encoder de clasificación, no un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso.
- La longitud de contexto no está declarada; conviene verificar la de `jhu-clsp/mmBERT-base` antes de usarlo con documentos largos.
- El benchmark de referencia lo publica el propio autor del modelo, lo que introduce un sesgo de evaluación; las cifras de los competidores provienen de fuentes con convenciones distintas y no son directamente comparables en todas las métricas (el caso del Brier es explícito).
- El conjunto de evaluación tiene un desequilibrio posicional marcado (la respuesta correcta cae en tercera posición el 39,7% de las veces), por lo que la métrica global debe leerse junto a la tabla de permutaciones.
- El autor advierte que activar las temperaturas de calibración empeora el ECE (de 0,011 a 0,017) y no mejora la precisión; no deben activarse esperando una mejora.
- La versión 0.1 cede 0,50 puntos de precisión frente a la revisión 0.8.0 (78,00) para aprender un dominio nuevo; si ese intercambio no conviene, la revisión `5a015f6c` sigue en el Hub.
- No se documentan sesgos conocidos, tasas de alucinación (no aplica a un clasificador, pero sí posibles errores de calibración fuera de distribución) ni evaluaciones de seguridad.
- La licencia MIT permite uso comercial sin restricciones declaradas, pero la información sobre la licencia de la base `jhu-clsp/mmBERT-base` no se detalla en la documentación proporcionada y conviene verificarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BarraHome/Decision-Jef-0.1
- Paquete PyPI: https://pypi.org/project/decision-jef/
- Repositorio GitHub: https://github.com/bet0x/decision-jef
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
