# Remek/basal-omni-2.0-mini-preview

## Resumen

basal-omni-2.0-mini (preview) es un modelo de decisión tipada desarrollado por Remek, construido como un ajuste fino de google/gemma-4-E4B-it. A diferencia de un modelo generativo convencional, no redacta respuestas: lee un estado (un mensaje, un documento, pasajes recuperados, una traza de agente o una página web en JSON) y responde a una pregunta tipada sobre él (`choice`, sí/no `noul`, `score`, y en el motor basal también `multi`, `act` y `tool`). La salida es una probabilidad calibrada por cada respuesta permitida, obtenida en un único pase forward sin generar texto, de modo que la respuesta nunca cae fuera de las opciones proporcionadas y la probabilidad indica la confianza del modelo.

El modelo tiene 7.941.100.874 parámetros totales según los pesos en safetensors (repo de 15,9 GB) y está etiquetado con la arquitectura gemma4 y el pipeline image-text-to-text, aunque su función principal es la clasificación y la toma de decisiones. Soporta polaco e inglés y se distribuye con licencia Apache 2.0. Esta versión es un adelanto de la familia basal-omni 2.0 (nano, mini, max y ultra); la mini final podría diferir de esta preview.

Su relevancia actual reside en el enfoque: sustituye la generación de texto por decisión calibrada con umbrales por tipo de pregunta, lo que permite automatizar decisiones con un objetivo de error controlado (un 58,3 % de cobertura con un 0,58 % de error observado, y un 87,8 % con un 4,0 %). Está pensado para integrarse en el motor de inferencia basal (versión 2.5 o posterior para la lectura bidireccional).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (transformer, según tag del repo); ajuste fino de google/gemma-4-E4B-it |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los resultados publicados usan bf16; KnowLine-4B se sirvió en FP8 en la comparativa) |
| Idiomas soportados | pl, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it y se presenta como un ajuste fino orientado a decisión tipada, no a generación libre. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo RLHF o DPO; esa información no está disponible. La innovación destacable es el paradigma de salida: en lugar de decodificar texto, el modelo produce en un único pase forward una distribución de probabilidad calibrada sobre el conjunto de respuestas permitidas, con un archivo `CALIBRATION.json` que define umbrales por tipo de pregunta (`choice`, `noul`, `score`).

La versión 2.0 introduce lectura bidireccional del estado antes de responder (requiere el motor basal 2.5 o superior), mayor precisión en el benchmark interno Werdykt (polaco e inglés) y más decisiones automatizables para un objetivo de error dado, manteniendo las mismas preguntas tipadas y la misma API que basal-omni-1.0. Los resultados publicados se obtuvieron con el motor basal 2.8.0 en modo `--mode eager`, bf16 y un único orden de opciones.

## Capacidades

- Decisión tipada sobre un estado: preguntas de tipo `choice` (elección entre opciones), `noul` (sí/no), `score` (puntuación) y, en el motor basal, `multi`, `act` y `tool`.
- Salida de probabilidad calibrada por respuesta permitida, sin generación de texto y sin respuestas fuera del conjunto de opciones.
- Lectura bidireccional del estado (servida por el motor basal 2.5 o posterior).
- Procesamiento de documentos, pasajes recuperados, trazas de agente y páginas web en JSON como estado de entrada.
- Capacidades multilingües en polaco e inglés.
- Integración con el motor de inferencia basal y su API de preguntas tipadas.
- Capacidad de clasificación y calibración (tags del repo: classification, calibration, decision-making).
- Soporte declarado de image-text-to-text en los tags del repositorio (no detallado en la model card).

## Casos de uso

- Enrutamiento de consultas: el modelo responde a preguntas `choice` sobre a qué cola, equipo o categoría pertenece un mensaje; su categoría de routing obtiene 0,966 en Werdykt, lo que lo hace adecuado para triaje automático con umbral de confianza.
- Verificación de afirmaciones en RAG: dado un pasaje recuperado y una afirmación, responde sí/no con probabilidad calibrada (RAGTruth: 0,780), permitiendo descartar respuestas no sustentadas antes de mostrarlas al usuario.
- Clasificación de sentimiento financiero: con FinancialPhraseBank alcanza 0,957 en 300 ítems, útil para etiquetar titulares y comunicados con una probabilidad asociada.
- Revisión de contratos y documentos legales: preguntas de tipo `noul` y `choice` sobre cláusulas (ContractNLI: 0,777; documentos reales polacos: 0,960), con envío a revisión humana cuando la probabilidad no supera el umbral certificado.
- Automatización con objetivo de error controlado: usando los umbrales de `CALIBRATION.json`, se automatiza el 58,3 % de las decisiones con un 0,58 % de error observado (tipo `choice`: 78,2 % con 0,74 % de error), lo que permite fijar políticas de escalado a humano por tipo de pregunta.
- Evaluación de respuestas de otros modelos (judge): con JudgeBench obtiene 0,627, adecuado como juez binario calibrado cuando se requiere una probabilidad y no una explicación generada.
- Procesamiento de documentos largos: la precisión varía con la longitud del estado (71,4 % en 0-1k caracteres, 80,0 % en 1k-2k), por lo que conviene fragmentar estados largos; la categoría de documentos largos obtiene 0,694.
- Decisión sobre trazas de agente: responde preguntas `act` y `tool` en el motor basal para seleccionar la siguiente acción o herramienta de un agente a partir de su traza.

## Benchmarks y rendimiento

Resultados publicados en la model card, servidos con basal 2.8.0 en una NVIDIA H100, bf16, modo eager y un único orden de opciones:

| Benchmark | Resultado |
|---|---|
| Werdykt v1, macro (PL + EN, 10 categorías × 2 idiomas, 5.000 ítems) | 0,811 (IC 95 %: 0,801–0,821) |
| Werdykt v1, polaco / inglés | 0,807 / 0,814 |
| Decisiones PL (test held-out, 7.081 ítems) | 0,951 |
| PL general (conocimiento, exámenes, lectura; 3.079 ítems) | 0,767 |
| PL-Real (300 documentos polacos reales) | 0,960 |
| Panel externo EN (10 tareas públicas, 3.842 ítems) | 0,811 |
| Corpus test EN (1.479 ítems) | 0,692 |
| Cobertura con 1 % de error | 58,3 % con 0,58 % de error observado |
| Cobertura con 5 % de error | 87,8 % con 4,0 % de error observado |

Panel externo EN por tarea:

| Tarea | Ítems | Precisión |
|---|---|---|
| FinancialPhraseBank | 300 | 0,957 |
| Belebele (inglés) | 300 | 0,940 |
| WinoGrande | 300 | 0,907 |
| Circa | 300 | 0,837 |
| TabFact | 300 | 0,830 |
| BIG-Bench Hard | 540 | 0,811 |
| RAGTruth | 300 | 0,780 |
| ContractNLI | 300 | 0,777 |
| TruthfulQA (binario) | 902 | 0,649 |
| JudgeBench | 300 | 0,627 |
| Media de las diez tareas | 3.842 | 0,811 |

Precisión por longitud del estado (Werdykt, 5.000 ítems, PL y EN):

| Longitud del estado | Ítems | Precisión |
|---|---|---|
| 0-1k caracteres | 709 | 71,4 % [68, 75] |
| 1k-2k caracteres | 2.598 | 80,0 % [78, 82] |

Categorías débiles en Werdykt: rules (0,382; recomienda calcular umbrales y fechas exactos en código), documentos largos (0,694) y contratos (0,726). Categorías fuertes: retrieval (0,982), documentos reales (0,978) y routing (0,966).

## Requisitos de hardware

- VRAM estimada para inferencia: con 7.941.100.874 parámetros, en bf16 se requieren aproximadamente 15,9 GB solo para pesos, más overhead de activaciones y KV cache; en FP8, alrededor de 8 GB para pesos.
- GPU recomendadas: los resultados publicados se obtuvieron en una NVIDIA H100 y en una NVIDIA RTX PRO 6000 Blackwell (bf16); la comparativa con KnowLine-4B usó FP8.
- GPU de consumo: no se han publicado pruebas en GPU de consumo; con cuantización a 8 bits los pesos cabrían en GPUs de 16-24 GB, pero no hay datos oficiales de cuantización ni de rendimiento en esas configuraciones.
- Opciones de despliegue: el modelo está pensado para servirse con el motor de inferencia basal (versión 2.5 o posterior para lectura bidireccional; 2.8.0 para los resultados publicados) en modo `--mode eager` o `--mode fast`; también es compatible con la librería transformers según los tags del repositorio.
- Latencia y throughput: no disponibles; la model card no publica métricas de latencia ni de tokens por segundo (el modelo no genera texto).

## Comparativa con modelos similares

Comparativa en Werdykt v1 (5.000 ítems ocultos, PL y EN), misma API y mismo scoring:

| Modelo | Werdykt v1 [IC 95 %] | PL / EN | Ventaja de basal-omni-2.0-mini |
|---|---|---|---|
| basal-omni-2.0-mini (preview) | 0,811 [0,801–0,821] | 0,807 / 0,814 | – |
| torchcast-decision-4b (v1.3) | 0,799 [0,788–0,809] | 0,787 / 0,810 | +1,2 [+0,1, +2,2] |
| KnowLine-4B-Gen5.5 | 0,776 [0,766–0,787] | 0,764 / 0,788 | +3,4 [+2,3, +4,5] |
| h2o-lightning-4b (v1.2.2) | 0,753 [0,742–0,764] | 0,745 / 0,761 | +5,8 [+4,7, +6,9] |
| Bielik-One-4B-r1 | 0,696 [0,684–0,709] | 0,687 / 0,705 | +11,5 [+10,2, +12,6] |

Notas: torchcast-decision-4b, KnowLine-4B y Bielik-One-4B se sirvieron en una NVIDIA RTX PRO 6000 Blackwell; h2o-lightning-4b en una H100; KnowLine-4B en FP8 y el resto en bf16. Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es una versión preview: la mini final de basal-omni 2.0 podría diferir de este modelo.
- La lectura bidireccional del estado requiere el motor basal 2.5 o posterior; en versiones anteriores el comportamiento con prompts largos puede degradarse.
- Debilidad marcada en la categoría rules (0,382): los umbrales y fechas exactos deben calcularse en código, no delegarse al modelo.
- Precisión limitada en documentos largos (0,694) y contratos (0,726); la precisión cae al 71,4 % en estados de 0-1k caracteres.
- TruthfulQA binario (0,649) y JudgeBench (0,627) son los puntos más bajos del panel externo EN, lo que indica riesgo en veracidad y en evaluación de respuestas.
- El tipo `score` no tiene umbral certificado al 1 % de error y se envía a una persona; al 5 % solo se automatiza el 47,6 %.
- Las cifras de test almacenadas en `CALIBRATION.json` provienen de un ajuste de calibración con una build anterior del motor y difieren ligeramente de las servidas por 2.8.0.
- Solo soporta polaco e inglés; no hay datos sobre otros idiomas.
- Riesgo de alucinación: aunque el modelo no genera texto libre, las probabilidades calibradas pueden ser excesivamente confiadas en estados ambiguos o fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero la model card no detalla restricciones adicionales derivadas del modelo base google/gemma-4-E4B-it, que conviene verificar.
- No se han publicado datos de sesgos, contexto máximo ni cuantizaciones soportadas.

## Enlaces

- Hugging Face: https://huggingface.co/Remek/basal-omni-2.0-mini-preview
- Repositorio del motor de inferencia basal: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- torchcast-decision-4b: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- KnowLine-4B-Gen5.5: https://huggingface.co/PelaAI/KnowLine-4B-Gen5.5
- Bielik-One-4B-r1: https://huggingface.co/speakleash/Bielik-One-4B-r1
