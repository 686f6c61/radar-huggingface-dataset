# Horizon-Labs/hallucination-guard-small

## Resumen

Hallucination Guard (small) es un clasificador de texto multilingue disenado para detectar alucinaciones en respuestas generadas por modelos de lenguaje. Desarrollado por Horizon-Labs, recibe un par formado por una fuente (documentos recuperados, transcripciones, resultados de herramientas) y una afirmacion o respuesta, y predice si esa respuesta esta respaldada por la fuente. Es, por tanto, una herramienta de groundedness y faithfulness orientada a pipelines RAG, evaluacion de LLM y guardrails de agentes.

El modelo parte del encoder jhu-clsp/mmBERT-small (308M parametros) y se ha destilado y ajustado hasta 140,6 millones de parametros, manteniendo una ventana de contexto de 8.000 tokens (entrenado a 2.000). Se distribuye con licencia Apache-2.0, sin gating, e incluye pesos en safetensors y ONNX, lo que permite ejecutarlo tanto en servidores como en el navegador mediante transformers.js.

Su relevancia actual radica en dos factores: por un lado, cubre 30 idiomas en entrenamiento y mantiene su rendimiento en seis idiomas no ingleses (0,714 de precision balanceada media) donde los detectores solo-ingles caen notablemente; por otro, su tamano reducido lo hace viable como verificador en linea dentro de sistemas de produccion, a diferencia de verificadores basados en LLM de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT-small) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.000 tokens (entrenado a 2.000) |
| Tipos de cuantizacion | no disponible (se incluyen pesos ONNX; cuantizacion INT8 no documentada) |
| Idiomas soportados | 30 idiomas en entrenamiento; evaluado en en, de, es, zh, ja, ar, hi; tags: en, de, fr, es, pt, it, nl, pl, ru, uk, tr, ar, hi, zh, ja, ko, vi, id, th |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, concretamente un ajuste fino de jhu-clsp/mmBERT-small, un modelo multilingue de 308M parametros. Horizon-Labs lo ha reducido hasta 140,6M mediante destilacion y lo ha especializado como clasificador binario de dos etiquetas: `UNSUPPORTED` (0) y `SUPPORTED` (1), donde la puntuacion de `SUPPORTED` actua como probabilidad de respaldo. La entrada se estructura como par (fuente, afirmacion), con la fuente en primer lugar.

El entrenamiento combina datos con licencia permisiva y datos sinteticos generados con modelos de la familia Qwen. Entre las fuentes documentadas figuran los conjuntos wandb/RAGTruth-processed (split de entrenamiento) y alisawuffles/WANLI. No se especifica el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de un clasificador, el ajuste se realiza con objetivos de clasificacion supervisada. El modelo incluye exportacion ONNX para inferencia en navegador y es compatible con text-embeddings-inference y endpoints de Hugging Face.

## Capacidades

- Clasificacion de groundedness: determina si una afirmacion esta respaldada por una fuente dada, con etiquetas `SUPPORTED` y `UNSUPPORTED`.
- Deteccion de alucinaciones en respuestas RAG: senala respuestas que anaden, cambian o contradicen hechos presentes en los documentos recuperados.
- Verificacion a nivel de frase: al dividir la respuesta en oraciones y puntuar cada una contra la fuente, identifica que frase concreta no esta respaldada.
- Puntuacion agregada a nivel de respuesta: permite calcular el minimo de las puntuaciones por frase como senal conservadora de fidelidad.
- Multilingue: entrenado en 30 idiomas, con rendimiento evaluado en ingles, aleman, espanol, chino, japones, arabe e hindi.
- Contexto largo: ventana de 8.000 tokens, con soporte para truncado y chunking de fuentes extensas.
- Integracion en pipelines de guardrails: forma parte de la coleccion Agent I/O Guards (inyeccion de prompt, PII, groundedness).
- Despliegue en navegador: pesos ONNX compatibles con transformers.js.
- No soporta tool calling, agentes ni generacion de texto: es exclusivamente un clasificador.

## Casos de uso

- Verificacion de respuestas RAG en produccion: tras recuperar documentos y generar una respuesta, se pasa el par (documentos, respuesta) al modelo para bloquear o marcar respuestas no respaldadas antes de mostrarlas al usuario. Su ventana de 8.000 tokens permite incluir varios fragmentos recuperados sin truncar en la mayoria de casos.
- Evaluacion automatica de LLM: integrado en pipelines de evaluacion offline, puntua la fidelidad de resumenes, respuestas QA y salidas de agentes frente a la fuente, sustituyendo o complementando revisiones humanas.
- Guardrail de agentes multi-paso: en cada paso de un agente que consulta herramientas, se verifica que la salida del paso este respaldada por el resultado de la herramienta, evitando que el agente propague hechos inventados en pasos posteriores.
- Moderacion de resumenes generados: se divide el resumen en frases y se comprueba cada una contra el documento original, marcando las frases no respaldadas para revision o reescritura.
- Atencion al cliente automatizada multilingue: en sistemas de soporte en espanol, aleman, frances u otros idiomas cubiertos, se valida que las respuestas generadas sobre politicas o productos esten respaldadas por la base de conocimiento antes de enviarlas.
- Deteccion de contradicciones en bases de conocimiento: al comparar una afirmacion nueva con la fuente existente, el modelo senala contradicciones (por ejemplo, fechas o cifras alteradas) que deben revisarse.
- Filtrado previo en pipelines de datos sinteticos: al generar datos con LLM, se descartan las muestras cuya afirmacion no este respaldada por el contexto de origen, mejorando la calidad del corpus.
- Verificacion en el navegador: con los pesos ONNX y transformers.js, se puede ejecutar la comprobacion de groundedness en el cliente sin enviar datos a un servidor, util para aplicaciones con requisitos de privacidad.

## Benchmarks y rendimiento

Los resultados se presentan como precision balanceada con umbral 0,5, ejecutados por el autor con el mismo script. La marca † indica conjuntos en distribucion para los modelos del autor (entrenados con el split de train de RAGTruth y evaluados con su split de test).

LLM-AggreFact (verificacion de afirmaciones en ingles, 11 conjuntos, hasta 1.000 ejemplos cada uno):

| Conjunto | Este modelo | Base (308M) | MiniCheck-RoBERTa-L | MiniCheck-DeBERTa-L | HHEM-2.1-open |
|---|---|---|---|---|---|
| AggreFact-CNN | 0,607 | 0,618 | **0,664** | 0,622 | 0,629 |
| AggreFact-XSum | 0,644 | 0,622 | **0,709** | 0,688 | 0,706 |
| ClaimVerify | 0,682 | 0,737 | **0,783** | 0,744 | 0,753 |
| ExpertQA | 0,553 | 0,593 | **0,606** | 0,597 | 0,568 |
| FactCheck-GPT | 0,657 | 0,674 | **0,754** | 0,728 | 0,729 |
| LFQA | 0,726 | 0,813 | **0,863** | 0,838 | 0,839 |
| RAGTruth † | 0,796 | **0,815** | 0,788 | 0,773 | 0,734 |
| Reveal | 0,798 | 0,834 | **0,896** | 0,871 | 0,865 |
| TofuEval-MediaS | 0,654 | **0,707** | 0,696 | 0,676 | 0,679 |
| TofuEval-MeetB | 0,677 | 0,736 | **0,765** | 0,724 | 0,721 |
| Wice | 0,719 | 0,732 | 0,717 | 0,664 | **0,751** |
| **Media** | 0,683 | 0,716 | **0,749** | 0,721 | 0,725 |

HaluEval QA y dialogo traducidos (400 elementos por idioma):

| Idioma | Este modelo | Base (308M) | MiniCheck-RoBERTa-L | MiniCheck-DeBERTa-L | HHEM-2.1-open |
|---|---|---|---|---|---|
| Ingles | 0,657 | **0,720** | 0,589 | 0,670 | 0,701 |
| Aleman | 0,719 | **0,724** | 0,691 | 0,672 | 0,670 |
| Espanol | 0,691 | **0,714** | 0,650 | 0,675 | 0,675 |
| Chino | 0,713 | **0,738** | 0,627 | 0,621 | 0,546 |
| Japones | 0,729 | **0,751** | 0,626 | 0,669 | 0,546 |
| Arabe | 0,700 | **0,710** | 0,616 | 0,691 | 0,544 |
| Hindi | 0,730 | **0,740** | 0,595 | 0,670 | 0,564 |
| **Media de los 6 idiomas no ingleses** | 0,714 | **0,729** | 0,634 | 0,666 | 0,591 |

Otros benchmarks:

| | Este modelo | Base (308M) | MiniCheck-RoBERTa-L | MiniCheck-DeBERTa-L | HHEM-2.1-open |
|---|---|---|---|---|---|
| HaluEval QA | 0,691 | **0,782** | 0,635 | 0,768 | 0,762 |
| HaluEval dialogo | **0,643** | 0,635 | 0,522 | 0,524 | 0,625 |
| HaluEval resumen | 0,548 | 0,559 | **0,648** | 0,623 | 0,526 |
| RAGTruth test, nivel de respuesta † | 0,798 | **0,829** | 0,604 | 0,626 | 0,750 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 140,6M parametros, lo que en FP32 supone aproximadamente 0,56 GB de pesos; en FP16, unos 0,28 GB; en INT8, unos 0,14 GB. Con activaciones y overhead de runtime, una GPU con 2 GB o mas es suficiente.
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son mas que suficientes. El modelo tambien puede ejecutarse en CPU con latencia aceptable para clasificacion.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con 2 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (pipeline de text-classification), ONNX Runtime, transformers.js para navegador, text-embeddings-inference y endpoints compatibles de Hugging Face. No se documenta soporte explicito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera inferencia en decenas de milisegundos por par en GPU consumer y en el orden de decenas a cientos de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LLM-AggreFact (media) | Media 6 idiomas no ingleses | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hallucination Guard small | 140,6M | 8.000 tokens | 0,683 | 0,714 | Apache-2.0 | Hugging Face, ONNX, sin gating |
| mmBERT-small (base) | 308M | no disponible | 0,716 | 0,729 | no disponible | Hugging Face |
| MiniCheck-RoBERTa-L | no disponible | no disponible | 0,749 | 0,634 | no disponible | Hugging Face |
| MiniCheck-DeBERTa-L | no disponible | no disponible | 0,721 | 0,666 | no disponible | Hugging Face |
| HHEM-2.1-open | no disponible | limitado por memoria en documentos largos | 0,725 | 0,591 | no disponible | Hugging Face |

La comparativa muestra un compromiso claro: MiniCheck-RoBERTa-L y HHEM-2.1-open superan a este modelo en verificacion de afirmaciones en ingles, mientras que Hallucination Guard small mantiene un rendimiento mas equilibrado en idiomas no ingleses (0,714 frente a 0,634 de MiniCheck-RoBERTa-L y 0,591 de HHEM). Frente a su modelo base de 308M, la version small pierde entre 2 y 4 puntos en la mayoria de conjuntos, a cambio de menos de la mitad de parametros.

## Limitaciones y advertencias

- En verificacion de afirmaciones en ingles (LLM-AggreFact), MiniCheck-RoBERTa-L (0,749) y HHEM-2.1-open (0,725) superan a este modelo (0,683). Si el caso de uso es solo ingles, conviene comparar ambos sobre los datos propios.
- Juzga el respaldo unicamente respecto a la fuente proporcionada: no es un verificador de conocimiento del mundo. Una afirmacion verdadera que no aparezca en la fuente se clasifica como `UNSUPPORTED`.
- El modelo no realiza aritmetica compleja ni razonamiento simbolico; la model card menciona limitaciones en aritmetica simple, por lo que las afirmaciones numericas deben verificarse con herramientas externas.
- Las traducciones de HaluEval se generaron con la misma familia de modelos empleada para datos sinteticos de entrenamiento, lo que puede favorecer ligeramente al modelo en la evaluacion multilingue.
- Riesgo de alucinacion del propio clasificador: al ser un modelo discriminativo, puede producir falsos positivos (marcar como no respaldada una afirmacion correcta) y falsos negativos (aceptar afirmaciones inventadas), especialmente en dominios alejados de los datos de entrenamiento.
- Sesgos: no se documentan analisis de sesgo especificos; al entrenarse con datos de RAGTruth, WANLI y datos sinteticos de Qwen, puede heredar sesgos de esas fuentes.
- Limitaciones de contexto: aunque la ventana es de 8.000 tokens, el modelo se entreno a 2.000; para fuentes muy largas se recomienda chunking y agregacion por minimo, lo que puede aumentar la latencia.
- Licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero no se ofrece garantia alguna sobre el rendimiento en dominios concretos.
- No es un modelo generativo: no puede reescribir ni corregir las respuestas, solo clasificarlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/hallucination-guard-small
- Demo en Spaces: https://huggingface.co/spaces/Horizon-Labs/hallucination-guard
- Coleccion Agent I/O Guards: https://huggingface.co/collections/Horizon-Labs/agent-i-o-guards-6ab403c49494bc2b71ca7669
- Codigo fuente: https://github.com/horizon-ai-labs/agent-io-guards
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset RAGTruth procesado: https://huggingface.co/datasets/wandb/RAGTruth-processed
- Dataset WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
