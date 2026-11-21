# mihailgribov/typecastlm-qwen3.5-3.8b

## Resumen

TypeCastLM-Qwen3.5-3.8B es un modelo de decisión (decision model) con pesos abiertos desarrollado por mihailgribov, afinado a partir de Qwen/Qwen3.5-4B. No genera texto: recibe material y una pregunta, y devuelve distribuciones de probabilidad sobre respuestas cerradas. Dispone de cuatro modos (noul, tfu, choice y scale) que comparten una única cabeza de clasificación de 39 salidas y se resuelven en un solo forward pass por consulta.

El modelo ocupa un nicho concreto: convertir tareas de clasificación y verificación en lecturas calibradas en lugar de generación libre. Su innovación principal es el modo tfu, que añade una tercera respuesta (unsure) para material indecidible, algo que un lector de dos respuestas no puede expresar. Según la model card, separa material indecidible de decidible con AUC 0,771 en FEVER.

Con 3.759.594.944 parámetros (3,76B), 7,5 GB de pesos en el formato indicado y licencia Apache-2.0, está pensado para ejecutarse en una sola tarjeta de consumo de 16 GB. En el ranking JevBench v1.6.1 ocupa el puesto 45 de 128 sistemas open-weights por Composite Score, con 56,4 de Capability Score.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Qwen3.5 (tag `qwen3_5_text`), con cabeza de clasificación de 39 salidas |
| Parametros totales | 3.759.594.944 (3,76B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo incluye safetensors y GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder, y lo convierte en un clasificador mediante una cabeza de 39 salidas: `true`, `false`, `unsure` y una marca por respuesta (`mark_A` … `mark_Z`, `mark_0` … `mark_9`). Cada modo selecciona el subconjunto de salidas pertinente y aplica softmax sobre él; la model card advierte explícitamente de que nunca debe aplicarse softmax sobre las 39 salidas conjuntamente, porque responden a preguntas distintas.

Cada modo lleva su propia temperatura, incluida en `prompt.json` junto con la formulación exacta de los prompts con los que se midieron los resultados. Los modos tfu, choice y scale están calibrados; noul usa una temperatura más afilada (denominada `verdict`) para que los casos claros se lean como un sí o un no rotundos en lugar de un 0,7 cauteloso. La model card menciona la posibilidad de reajustar esa temperatura si se necesita que las probabilidades coincidan con frecuencias observadas. No se detallan en la información disponible el volumen ni la composición del dataset de ajuste, ni si se emplearon RLHF o DPO.

## Capacidades

- Clasificación de texto con salida probabilística, no generativa: una decisión por forward pass, sin tokens generados.
- Modo noul: respuesta sí/no sobre dos criterios, con softmax sobre las dos respuestas nombradas.
- Modo tfu: distribución sobre true, false y unsure, con la tercera respuesta como salida propia para material indecidible.
- Modo choice: probabilidad por opción para preguntas de 2 a 26 alternativas con una correcta.
- Modo scale: probabilidad por nivel en rúbricas ordinales de hasta 10 niveles.
- Calibración por modo mediante temperaturas incluidas en los pesos.
- Uso como pipeline estándar de text-classification de transformers con `top_k=None` y `function_to_apply="none"`.
- Servicio HTTP mediante `typecastlm-serve`, compatible con el contrato de la API Jev.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Tool calling, agentes, visión, audio y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Verificación de afirmaciones (fact-checking): dado un documento y una afirmación, el modo tfu devuelve p(true), p(false) y p(unsure); el umbral sobre unsure permite derivar a revisión humana los casos indecidibles en lugar de forzar un veredicto. La AUC de 0,771 en FEVER respalda este uso.
- Enrutamiento y triaje de documentos: el modo noul decide si un documento cumple un criterio (por ejemplo, si está cubierto por una póliza) y la probabilidad permite fijar umbrales de derivación a un humano o de descarte automático en un pipeline.
- Clasificación de tickets de soporte: con el modo choice se asignan hasta 26 categorías por ticket en un solo forward pass, con una probabilidad por categoría que permite priorizar la cola de revisión manual.
- Evaluación de rúbricas ordinales: el modo scale puntúa respuestas o contenidos en escalas de hasta 10 niveles (por ejemplo, calidad de una respuesta o gravedad de un incidente) con distribución completa sobre los niveles, no solo con la etiqueta ganadora.
- Filtrado de contenido en pipelines de datos: la latencia declarada (p50 de 48 ms en material de menos de 200 tokens y 566 ms entre 1000 y 4000 tokens en una tarjeta de consumo de 16 GB) permite aplicar el modelo a volúmenes altos de documentos cortos dentro de un pipeline de ingesta.
- Servicio de decisión como API: desplegado con `typecastlm-serve`, expone el contrato de la API Jev, de modo que un cliente existente contra esa interfaz puede apuntar al modelo cambiando únicamente la URL base.
- Moderación o cumplimiento normativo asistido: el modo tfu con abstención explícita encaja en flujos donde una decisión errónea es costosa y conviene marcar los casos ambiguos en lugar de clasificarlos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre JevBench (tabla oficial open-weights v1.6.1, medida el 7 de octubre de 2026). El puesto se asigna entre 128 sistemas open-weights por Composite Score (precisión, calibración, velocidad y coste); Capability Score mide solo precisión y calibración.

| Puesto | Sistema | Base | Composite Score | Capability Score |
|---|---|---|---|---|
| 2 | decisio v0.8.0 | Gemma-4-31B | 71,7 | 79,6 |
| 8 | deck-31B | Gemma-4-31B | 68,7 | 77,6 |
| 9 | Cygnet | Gemma-4-12B | 68,6 | 70,9 |
| 11 | decisio v0.9.0 | Gemma-4-12B | 67,8 | 70,0 |
| 15 | decider chat | Gemma-4-31B | 66,1 | 70,6 |
| 32 | jev-local | Qwen3.5-9B | 41,3 | 57,5 |
| 45 | TypeCastLM 1.4.0 | Qwen3.5-4B | 29,8 | 56,4 |
| 49 | jqv | Qwen3-32B | 25,4 | 61,9 |
| 74 | SemIf | Qwen3.5-4B | 15,5 | 55,4 |
| 77 | local-jev | Qwen3.5-4B | 11,4 | 55,0 |
| 82 | open-alternative-jev | Qwen3.5-4B | 9,4 | 49,1 |
| 85 | Nemotron Diffusion 8B | Nemotron-8B | 7,3 | 47,5 |

Dato adicional declarado: AUC de 0,771 en FEVER para la separación entre material indecidible y decidible con el modo tfu. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento general.

## Requisitos de hardware

- Pesos en el formato indicado: 7,5 GB, según la model card.
- VRAM estimada para inferencia: no disponible de forma explícita; el autor indica que el modelo cabe en una tarjeta de consumo de 16 GB.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.); la referencia del autor es una tarjeta de consumo de 16 GB.
- Cabe en GPU de consumo: sí, según el autor, en tarjetas de 16 GB.
- Despliegue: paquete `typecastlm` en PyPI (extra `local` con flash-linear-attention y fla-core), servidor HTTP con `typecastlm-serve` (extra `server`), o pipeline estándar de transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia declarada: p50 de 48 ms para material de menos de 200 tokens y 566 ms para 1000–4000 tokens, en una tarjeta de consumo de 16 GB.
- Throughput: no disponible.

## Comparativa con modelos similares

La model card sitúa el modelo frente a otros sistemas de decisión open-weights del tablero JevBench. La comparación se limita a los datos publicados en esa tabla.

| Modelo | Base | Parámetros del base | Composite Score | Capability Score | Licencia |
|---|---|---|---|---|---|
| TypeCastLM 1.4.0 | Qwen3.5-4B | 3,76B | 29,8 | 56,4 | Apache-2.0 |
| jev-local | Qwen3.5-9B | no disponible en la información | 41,3 | 57,5 | no disponible |
| jqv | Qwen3-32B | no disponible en la información | 25,4 | 61,9 |
| SemIf | Qwen3.5-4B | no disponible en la información | 15,5 | 55,4 | no disponible |
| decisio v0.8.0 | Gemma-4-31B | no disponible en la información | 71,7 | 79,6 | no disponible |

Observaciones a partir de la tabla: TypeCastLM supera a jqv en Composite Score pese a partir de un base mucho menor, y supera a los otros dos sistemas basados en Qwen3.5-4B (SemIf y local-jev) tanto en Composite como en Capability. Frente a jev-local (Qwen3.5-9B) queda por debajo en Composite (29,8 frente a 41,3) con una diferencia menor en Capability (56,4 frente a 57,5). Los sistemas basados en Gemma-4-12B y Gemma-4-31B obtienen puntuaciones superiores. Longitud de contexto y licencia de los competidores: no disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara inglés; no hay soporte multilingüe documentado.
- Es un clasificador, no un generador: no produce texto libre ni razonamiento en prosa, y no sirve para tareas generativas.
- La cabeza tiene 39 salidas que responden a preguntas distintas; aplicar softmax sobre todas ellas es un error de uso señalado explícitamente por el autor.
- El modo noul no está calibrado: su temperatura está ajustada para respuestas decisivas, por lo que sus probabilidades no reflejan frecuencias observadas salvo que se reajuste la temperatura.
- La calibración de cada modo depende de la formulación de los prompts recogida en `prompt.json`; cambios en la redacción pueden degradarla.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza en material fuera de distribución; el modo tfu mitiga parcialmente este riesgo mediante la abstención.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial; conviene verificar las condiciones del modelo base Qwen/Qwen3.5-4B, no detalladas en la información disponible.
- El Composite Score en JevBench (29,8) refleja un coste/velocidad competitivos pero una precisión y calibración por debajo de los sistemas basados en Gemma-4; para tareas de alta exigencia conviene evaluar alternativas mayores.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento con documentos largos más allá del rango medido (1000–4000 tokens).
- Dependencia de paquetes adicionales (flash-linear-attention, fla-core) para el uso local, lo que añade complejidad de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mihailgribov/typecastlm-qwen3.5-3.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paquete en PyPI: https://pypi.org/project/typecastlm/
- Código fuente: https://github.com/mihail-gribov/typecastlm
- Contrato HTTP (API Jev): https://github.com/mihail-gribov/typecastlm/blob/main/docs/API.md
- Tablero JevBench: https://benchmarkheaven.com/jev-models
