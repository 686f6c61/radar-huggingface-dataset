# Horizon-Labs/hallucination-guard-base

## Resumen

Hallucination Guard (base, 308M) es un clasificador de texto multilingüe desarrollado por Horizon-Labs que evalúa si una respuesta generada por un modelo de lenguaje está respaldada por una fuente de referencia. Dada una fuente (documentos recuperados, una transcripción, el resultado de una herramienta) y una afirmación o respuesta, el modelo predice si esta está respaldada o no por la fuente, con dos etiquetas: `SUPPORTED` y `UNSUPPORTED`. Resuelve el problema de la detección de alucinaciones en sistemas RAG, resúmenes y salidas de agentes, donde el modelo generativo añade, modifica o contradice hechos presentes en el contexto.

El modelo se construye sobre `jhu-clsp/mmBERT-base`, un encoder ModernBERT multilingüe, y cuenta con 307.531.778 parámetros totales. Dispone de una ventana de contexto de 8k tokens (entrenado a 2k), lo que permite evaluar fuentes relativamente largas sin fragmentación excesiva. Su licencia Apache-2.0, sin restricciones de acceso, y la inclusión de pesos en formato ONNX lo hacen desplegable tanto en servidores como en el navegador mediante transformers.js.

Es relevante ahora porque la verificación de fidelidad se ha convertido en una pieza crítica de las arquitecturas RAG y de agentes en producción, y este modelo ofrece una alternativa multilingüe (30 idiomas de entrenamiento, 20 declarados) a los verificadores centrados exclusivamente en inglés. El propio autor reconoce que en fact-checking a nivel de afirmación en inglés (LLM-AggreFact) MiniCheck y HHEM son superiores, pero el modelo mantiene su rendimiento al pasar a otros idiomas, donde los verificadores solo en inglés caen notablemente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT multilingüe (encoder transformer, base `jhu-clsp/mmBERT-base`) |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (entrenado a 2.048) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX; cuantizaciones de terceros no confirmadas) |
| Idiomas soportados | 30 idiomas de entrenamiento; declarados: en, de, fr, es, pt, it, nl, pl, ru, uk, tr, ar, hi, zh, ja, ko, vi, id, th |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer ModernBERT de 308M parámetros, inicializado desde `jhu-clsp/mmBERT-base`. La tarea es de clasificación de pares (texto y texto par): la fuente se coloca primero y la respuesta o afirmación después, y la cabeza de clasificación produce dos logits correspondientes a `UNSUPPORTED` (0) y `SUPPORTED` (1). La probabilidad de la etiqueta `SUPPORTED` se interpreta como probabilidad de respaldo. La ventana de atención cubre 8k tokens, aunque el entrenamiento se realizó con 2k; para fuentes más largas el autor recomienda trocear y puntuar por oraciones.

El entrenamiento combina datos con licencia permisiva y datos sintéticos generados con Qwen. Los conjuntos declarados son `wandb/RAGTruth-processed` (se usa su split de entrenamiento) y `alisawuffles/WANLI`. La versión v1.1 añade aproximadamente 147.000 pares de afirmaciones multi-oración, incluyendo pares donde los hechos están repartidos entre varias oraciones de la fuente y variantes con una oración necesaria eliminada, lo que mejora el fact-checking a nivel de afirmación en inglés. El autor documenta que el ruido de entrenamiento es apreciable: reentrenar la receta de v1.0 con otra semilla produce cifras de HaluEval muy distintas, y el AUC en HaluEval traducido es de media unos 0,02 inferior con los datos de v1.1. No se documenta uso de RLHF ni DPO; se trata de un clasificador supervisado, no de un modelo generativo.

## Capacidades

- Clasificación de respaldo (groundedness) entre una fuente y una respuesta o afirmación, con dos etiquetas y una probabilidad asociada.
- Detección de alucinaciones en respuestas RAG: identifica afirmaciones que la fuente no respalda.
- Verificación de fidelidad de resúmenes y transcripciones frente al documento original.
- Fact-checking a nivel de afirmación (claim-level) en inglés, con rendimiento competitivo en varios conjuntos de LLM-AggreFact.
- Multilingüe: mantiene el rendimiento en seis idiomas no ingleses (alemán, español, chino, japonés, árabe, hindi) en HaluEval traducido, donde los verificadores solo en inglés caen.
- Puntuación por oración: al dividir la respuesta en oraciones y puntuar cada una contra la fuente, permite localizar qué oración concreta no está respaldada.
- Puntuación a nivel de respuesta mediante el mínimo sobre oraciones, útil como guardrail de salida.
- Soporte de tool calling / function calling: no aplica (es un clasificador, no un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no aplica como generador; se usa como verificador dentro de pipelines de agentes.
- Capacidades especiales: exportación ONNX y ejecución en navegador con transformers.js; compatible con text-embeddings-inference y endpoints.

## Casos de uso

- Guardrail de salida en RAG: tras recuperar documentos y generar una respuesta, se pasa la fuente y la respuesta al modelo; si la probabilidad de `SUPPORTED` cae por debajo de un umbral, se bloquea o se marca la respuesta antes de mostrarla al usuario. Es adecuado por su ventana de 8k tokens y su bajo coste frente a un LLM verificador.
- Localización de oraciones no respaldadas: dividiendo la respuesta en oraciones y puntuando cada una contra la fuente, se identifica exactamente qué frase introduce un hecho no soportado, lo que permite corregir solo esa parte o citar la evidencia correspondiente.
- Verificación de resúmenes automáticos: comparar un resumen generado con el documento original para detectar cifras, fechas o entidades alteradas; el modelo está entrenado con datos de resumen (AggreFact-CNN, AggreFact-XSum, TofuEval).
- Evaluación de calidad de pipelines LLM en CI: integrar el modelo como test automático que puntúa las salidas de un sistema generativo contra un conjunto de fuentes de referencia, con umbrales configurables, para detectar regresiones tras cambios de prompt o de modelo.
- Moderación de salidas de agentes con herramientas: cuando un agente devuelve el resultado de una llamada a una API o herramienta, verificar que la respuesta final del agente se ciñe a ese resultado y no añade datos inventados.
- Despliegue en el navegador o en el borde: gracias a los pesos ONNX y transformers.js, se puede ejecutar la verificación en el cliente sin enviar el texto a un servidor, útil en aplicaciones con requisitos de privacidad.
- Atención al cliente multilingüe: verificar que las respuestas generadas en español, alemán, francés o árabe se apoyan en la base de conocimiento recuperada, aprovechando que el rendimiento se mantiene en idiomas no ingleses.

## Benchmarks y rendimiento

Precisión balanceada con umbral 0,5, ejecutada por el autor con el mismo script para todos los modelos. La marca † indica conjuntos dentro de la distribución de entrenamiento (RAGTruth usa el split de test).

LLM-AggreFact (verificación de afirmaciones en inglés, 11 conjuntos):

| Conjunto | Este modelo | small (141M) | MiniCheck-RoBERTa-L | MiniCheck-DeBERTa-L | HHEM-2.1-open |
|---|---|---|---|---|---|
| AggreFact-CNN | 0,618 | 0,607 | 0,664 | 0,622 | 0,629 |
| AggreFact-XSum | 0,622 | 0,644 | 0,709 | 0,688 | 0,706 |
| ClaimVerify | 0,737 | 0,682 | 0,783 | 0,744 | 0,753 |
| ExpertQA | 0,593 | 0,553 | 0,606 | 0,597 | 0,568 |
| FactCheck-GPT | 0,674 | 0,657 | 0,754 | 0,728 | 0,729 |
| LFQA | 0,813 | 0,726 | 0,863 | 0,838 | 0,839 |
| RAGTruth † | 0,815 | 0,796 | 0,788 | 0,773 | 0,734 |
| Reveal | 0,834 | 0,798 | 0,896 | 0,871 | 0,865 |
| TofuEval-MediaS | 0,707 | 0,654 | 0,696 | 0,676 | 0,679 |
| TofuEval-MeetB | 0,736 | 0,677 | 0,765 | 0,724 | 0,721 |
| Wice | 0,732 | 0,719 | 0,717 | 0,664 | 0,751 |
| Media | 0,716 | 0,683 | 0,749 | 0,721 | 0,725 |

HaluEval QA y diálogo traducidos (400 elementos por idioma):

| Idioma | Este modelo | small (141M) | MiniCheck-RoBERTa-L | MiniCheck-DeBERTa-L | HHEM-2.1-open |
|---|---|---|---|---|---|
| Inglés | 0,720 | 0,657 | 0,589 | 0,670 | 0,701 |
| Alemán | 0,724 | 0,719 | 0,691 | 0,672 | 0,670 |
| Español | 0,714 | 0,691 | 0,650 | 0,675 | 0,675 |
| Chino | 0,738 | 0,713 | 0,627 | 0,621 | 0,546 |
| Japonés | 0,751 | 0,729 | 0,626 | 0,669 | 0,546 |
| Árabe | 0,710 | 0,700 | 0,616 | 0,691 | 0,544 |
| Hindi | 0,740 | 0,730 | 0,595 | 0,670 | 0,564 |
| Media de los 6 idiomas no ingleses | 0,729 | 0,714 | 0,634 | 0,666 | 0,591 |

Comparativa de versiones (v1.0 frente a v1.1):

| Versión | AggreFact bacc | AggreFact AUC | 6 idiomas bacc | 6 idiomas AUC | HaluEval QA | RAGTruth |
|---|---|---|---|---|---|---|
| v1.0 | 0,697 | 0,773 | 0,755 | 0,802 | no disponible | no disponible |
| v1.1 (actual) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 1,23 GB de pesos (307,5M de parámetros × 4 bytes); en fp16/bf16, unos 0,62 GB; en int8, unos 0,31 GB. A ello hay que sumar la memoria de activaciones, que depende de la longitud de la secuencia (hasta 8k tokens).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16 a longitudes moderadas; A100, H100, L4, L40S o RTX 4090 para despliegues de alto throughput. Al ser un encoder de 308M, el coste por petición es muy bajo comparado con un LLM verificador.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (pipeline de text-classification), ONNX Runtime, transformers.js en navegador, text-embeddings-inference y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multilingüe | Licencia | LLM-AggreFact (media) | HaluEval 6 idiomas (media) |
|---|---|---|---|---|---|---|
| Hallucination Guard base | 308M | 8k | Sí (30 idiomas de entrenamiento) | Apache-2.0 | 0,716 | 0,729 |
| Variante small de Horizon-Labs | 141M | no disponible | Sí | no disponible | 0,683 | 0,714 |
| MiniCheck-RoBERTa-L | no disponible | no disponible | No (solo inglés) | no disponible | 0,749 | 0,634 |
| MiniCheck-DeBERTa-L | no disponible | no disponible | No (solo inglés) | no disponible | 0,721 | 0,666 |
| HHEM-2.1-open | no disponible | no disponible | No (solo inglés) | no disponible | 0,725 | 0,591 |

En inglés, MiniCheck-RoBERTa-L supera a este modelo en la media de LLM-AggreFact (0,749 frente a 0,716), mientras que en HaluEval multilingüe este modelo lidera con claridad (0,729 frente a 0,634 de MiniCheck-RoBERTa-L y 0,591 de HHEM). La elección depende de si el despliegue es monolingüe inglés o multilingüe.

## Limitaciones y advertencias

- En fact-checking a nivel de afirmación en inglés, MiniCheck y HHEM superan a este modelo en la mayoría de los conjuntos de LLM-AggreFact; el propio autor lo reconoce y recomienda compararlos sobre datos propios si solo se necesita inglés.
- Riesgo de alucinación del propio verificador: es un clasificador entrenado con datos sintéticos generados por Qwen, lo que puede introducir sesgos hacia el estilo y las distribuciones de ese generador.
- Las evaluaciones multilingües usan traducciones automáticas realizadas con Qwen3.8-27B, de la misma familia que generó los datos sintéticos de entrenamiento, lo que puede favorecer al modelo; el autor lo advierte explícitamente.
- Ruido de entrenamiento alto: reentrenar con otra semilla produce cifras de HaluEval muy distintas, y el AUC en HaluEval traducido es aproximadamente 0,02 inferior con los datos de v1.1.
- La ventana de entrenamiento es de 2k tokens aunque la arquitectura soporte 8k; para fuentes largas conviene trocear y agregar por oraciones.
- Las etiquetas son binarias (`SUPPORTED`/`UNSUPPORTED`); no distingue entre contradicción, adición o matización de hechos.
- El modelo no genera texto ni razona de forma multi-paso: es un verificador que debe integrarse en un pipeline mayor.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales conocidas, pero conviene revisar la procedencia de los datos de entrenamiento si el despliegue exige garantías de compliance estrictas.
- No se han publicado datos de latencia ni throughput, por lo que el dimensionamiento debe hacerse con pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/hallucination-guard-base
- Demo en el navegador: https://huggingface.co/spaces/Horizon-Labs/hallucination-guard
- Colección Agent I/O Guards: https://huggingface.co/collections/Horizon-Labs/agent-i-o-guards-6ab403c49494bc2b71ca7669
- Código fuente: https://github.com/horizon-ai-labs/agent-io-guards
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset RAGTruth procesado: https://huggingface.co/datasets/wandb/RAGTruth-processed
- Dataset WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
