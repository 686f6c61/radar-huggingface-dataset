# BahamutRU/GigaChat3.5-432B-A28B-GGUF

## Resumen

GigaChat 3.5 Ultra es el modelo insignia de la familia GigaChat, desarrollada por Sberbank (publicada en HuggingFace bajo la organizacion ai-sage). Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 432 000 millones de parametros totales y unos 28 000 millones de parametros activos por token, construido sobre una arquitectura de atencion hibrida propia que combina Multi-head Latent Attention (MLA) con capas de atencion lineal basadas en GatedDeltaNet. El repositorio analizado aqui, BahamutRU/GigaChat3.5-432B-A28B-GGUF, es una conversion no oficial a formato GGUF realizada por el usuario BahamutRU, no una publicacion del equipo original.

El modelo esta orientado a cargas de trabajo de asistente multilingue (ruso e ingles), razonamiento, generacion de codigo, matematicas y escenarios agente con uso de herramientas. Respecto al anterior buque insignia GigaChat 3.1 Ultra (700B), la version 3.5 es aproximadamente un 40 % mas compacta pero mejora en codigo, matematicas y tareas agenticas; ademas consume unas 4 veces menos KV-cache por token, permite alojar mas del doble de contexto en la misma memoria y aumenta el throughput de generacion en torno a un 20 % segun la model card.

Su relevancia actual radica en tres factores: se distribuye bajo licencia MIT (segun la model card), incorpora decodificacion acelerada mediante dos cabezas de Multi-Token Prediction (MTP) y su publicacion en GGUF permite, en teoria, desplegar un modelo de 432B en infraestructura con CPU y GPU mixtas usando llama.cpp, algo inviable con los pesos en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder MoE con atencion hibrida: capas MLA (Multi-head Latent Attention) combinadas con capas de atencion lineal GatedDeltaNet, mas GatedNorm y cabezas MTP |
| Parametros totales | 433 747 019 520 (unos 433,7 B segun los safetensors del repositorio); la model card indica 432 B |
| Parametros activos | 28 B por token (valor declarado en la model card; el nombre del repositorio usa la etiqueta A28B) |
| Longitud de contexto | no disponible (la model card solo indica que la version 3.5 admite mas del doble de contexto que 3.1 Ultra en la misma memoria, sin cifra concreta) |
| Tipos de cuantizacion | Repositorio en formato GGUF; no se detallan los tipos concretos (Q4_K_M, Q5_K_M, etc.) ni si se uso imatrix. El modelo original se publica en FP8 nativo y en BF16 dequantizado |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF en este repositorio; safetensors (FP8 y BF16) en las versiones oficiales de ai-sage |

## Arquitectura y entrenamiento

El nucleo del modelo es un decoder MoE en el que cada capa combina atencion, un bloque de expertos y una post-normalizacion aplicada antes de la suma residual. La innovacion principal frente a GigaChat 3.1 es la sustitucion parcial de la atencion completa por atencion lineal: algunas capas mantienen MLA y el resto emplea GatedDeltaNet. El objetivo es reducir el crecimiento del KV-cache con la longitud de contexto, que en atencion estandar se convierte en el cuello de botella de memoria durante la generacion. La model card cifra la reduccion en unas 4 veces menos KV-cache por token. A esto se suma GatedNorm, una puerta multiplicativa explicita tras RMSNorm, reparametrizada con `2 · sigmoid` para ser neutra en escala en la inicializacion (el factor 2 mantiene la puerta cerca de 1,0 en lugar de 0,5), que sustituye los anclajes implicitos de autoestabilizacion (attention sinks y residual sinks) por un mecanismo controlado.

El entrenamiento se realizo en FP8 nativo en todas las etapas, con un checkpoint BF16 dequantizado liberado aparte. El pipeline de alineamiento sigue la secuencia Stage 1.5 → SFT → DPO → Online RL, siendo el RL en linea la incorporacion destacada de esta version y, segun la model card, el principal motor de las mejoras en seguimiento de instrucciones. En cuanto a la aceleracion de inferencia, GigaChat 3.5 Ultra incorpora dos cabezas de Multi-Token Prediction (frente a una sola en la version 3.0): la decodificacion voraz se acelera aproximadamente 1,5x con una cabeza y hasta 2,2x con dos. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni el reparto entre idiomas.

## Capacidades

- Generacion de texto conversacional e instructiva en ruso e ingles, con modo de razonamiento y cadena de pensamiento (los benchmarks de GPQA se reportan en modo CoT).
- Razonamiento matematico: destaca en MATH Minerva (61,7 en la version base) y mantiene resultados solidos en MGSM en ruso (86,0).
- Generacion y comprension de codigo: 80,49 pass@1 en HumanEval y 75,61 en HumanEval+ para la version base, ademas de 54,31 en LiveCodeBench CodeGen Lite.
- Uso de herramientas y function calling: la model card incluye la etiqueta `tool-use` y reporta 68,71 en TAU2-bench para la version instruct.
- Razonamiento agente y multi-paso: 42,6 en SWE-bench verified y resultados reportados en Terminal-bench (tabla truncada en la informacion disponible).
- Contexto largo: etiqueta `long-context` y arquitectura hibrida con KV-cache reducido, pensada para entradas extensas.
- Capacidades multilingues limitadas a ruso e ingles; no se declara soporte de otros idiomas, incluido el espanol.
- Decodificacion especulativa interna mediante dos cabezas MTP, que acelera la generacion sin necesidad de un modelo borrador externo.
- No se mencionan capacidades de vision, audio ni multimodalidad en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada en ruso e ingles: el modelo puede sostener conversaciones multi-turno con historiales largos gracias a la combinacion de contexto extendido y KV-cache reducido por la atencion lineal, lo que abarata el coste de memoria por sesion concurrente en comparacion con un modelo de atencion completa del mismo tamano.
- Agente de resolucion de incidencias de software: con 42,6 en SWE-bench verified y soporte de tool calling, puede integrarse en un flujo que lea el repositorio, ejecute tests y proponga parches, conectado a un sistema de CI/CD mediante llamadas a herramientas.
- Automatizacion de operaciones en terminal y DevOps: los resultados de TAU2-bench (68,71) indican capacidad para encadenar comandos y decisiones en entornos de shell, util para asistentes internos de plataforma que diagnostican fallos y ejecutan remediaciones guiadas.
- Procesamiento de documentacion tecnica y legal en ruso: con decenas de miles de tokens de contexto y buen rendimiento en MGSM-ru, es adecuado para resumir contratos, extraer clausulas y responder preguntas sobre corpus extensos en un pipeline de RAG.
- Generacion de codigo asistida en produccion: 80,49 pass@1 en HumanEval permite usarlo como motor de autocompletado o de generacion de funciones completas, integrado en el IDE o en revisiones automatizadas de pull requests.
- Razonamiento cuantitativo en dominios tecnicos: la mejora en MATH Minerva (61,7 frente a 55,78 de la generacion anterior) lo hace util para validar calculos en informes de ingenieria o financieros, siempre con verificacion humana del resultado.
- Tutorizacion y soporte educativo bilingue ru/en: el modelo puede explicar conceptos paso a paso en ambos idiomas, aprovechando el modo de cadena de pensamiento para desglosar razonamientos matematicos.
- Investigacion en arquitecturas eficientes: al estar disponible en GGUF, sirve como banco de pruebas para estudiar el comportamiento de la atencion hibrida MLA + GatedDeltaNet y de las cabezas MTP en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo original (ai-sage). No se han medido sobre esta cuantizacion GGUF concreta, por lo que deben tomarse como referencia de los pesos originales.

Modelo base:

| Tarea | GigaChat 3.1 Base (700B) | GigaChat 3.5 Ultra Base (430B) | DeepSeek V4 Flash Base (284B) | DeepSeek V3.2 Exp Base (685B) |
|---|---|---|---|---|
| MMLU (5-shot) | 79,89 | 85,28 | 88,68 | 87,47 |
| MMLU-Pro (5-shot) | 68,01 | 74,54 | 65,86 | 62,43 |
| GPQA Diamond (oficial, CoT) | 30,3 | 30,81 | 22,73 | 22,22 |
| BBH (3-shot) | 83,78 | 87,5 | 88,24 | 89,16 |
| ARC-C (25-shot, acc_norm) | 68,34 | 70,39 | 72,35 | 70,31 |
| ARC-E (25-shot, acc_norm) | 88,38 | 88,59 | 90,82 | 89,27 |
| HellaSwag (10-shot, acc_norm) | 89,43 | 89,47 | 88,9 | 89,28 |
| Winogrande (5-shot) | 82,72 | 85 | 84,61 | 84,93 |
| DROP (5-shot, EM) | 56,29 | 59,55 | 63,88 | 65,14 |
| TriviaQA (5-shot, EM) | 81,4 | 82,23 | 83,96 | 83,88 |
| NQ-Open (5-shot, EM) | 37,34 | 41,66 | 40,83 | 42,27 |
| Media | 69,6 | 72,3 | 71,9 | 71,5 |

Matematicas:

| Tarea | GigaChat 3.1 Base (700B) | GigaChat 3.5 Ultra Base (430B) | DeepSeek V4 Flash Base (284B) | DeepSeek V3.2 Exp Base (685B) |
|---|---|---|---|---|
| MATH Minerva (math-verify) | 55,78 | 61,7 | 54,74 | 58,2 |
| GSM8K (CoT, math_verify) | 86,73 | 86,58 | 86,43 | 84,99 |
| MGSM ru (CoT) | 87,6 | 86 | 84,4 | 82 |
| Media | 76,7 | 78,1 | 75,2 | 75,1 |

Codigo:

| Tarea | GigaChat 3.1 Base (700B) | GigaChat 3.5 Ultra Base (430B) | DeepSeek V4 Flash Base (284B) | DeepSeek V3.2 Exp Base (685B) |
|---|---|---|---|---|
| HumanEval (pass@1) | 70,12 | 80,49 | 66,46 | 64,02 |
| HumanEval+ (pass@1) | 62,8 | 75,61 | 61,59 | 56,71 |
| MBPP (pass@1) | 70,2 | 70,4 | 70,2 | 70,4 |
| MBPP+ (pass@1) | 83,33 | 83,33 | 77,25 | 82,28 |
| CRUXEval (pass@1) | 64,56 | 67,5 | 69,75 | 69,94 |
| LCB CodeGen Lite | 49,29 | 54,31 | 57,25 | 50,24 |
| Media | 66,7 | 71,9 | 67,1 | 65,6 |

Modelo instruct:

| Tarea | GigaChat 3.1 Ultra (700B) | GigaChat 3.5 Ultra (430B) | DeepSeek V3.2 (685B) |
|---|---|---|---|
| TAU2-bench | 41,87 | 68,71 | 66 |
| SWE-bench verified | 8,6 | 42,6 | 44,8 |
| Terminal-bench | tabla truncada en la model card | tabla truncada en la model card | tabla truncada en la model card |

## Requisitos de hardware

Estimaciones calculadas a partir de los 433,7 B de parametros declarados en el repositorio. No son datos publicados por el autor.

- Peso de los pesos en memoria segun formato: BF16 en torno a 867 GB; FP8 en torno a 433 GB; GGUF Q8_0 unos 460 GB; Q6_K unos 355 GB; Q5_K_M unos 300 GB; Q4_K_M unos 245 GB; Q3_K_M unos 195 GB; Q2_K unos 150 GB. Hay que anadir el KV-cache (reducido por el diseno hibrido, pero no despreciable en contextos muy largos) y los buffers de activaciones y de expertos.
- El repositorio ocupa 1946,4 GB, lo que sugiere que contiene varias cuantizaciones distintas; hay que prever ese espacio en disco antes de descargarlo.
- No cabe en GPU de consumo. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) son insuficientes incluso con la cuantizacion mas agresiva, porque los pesos completos deben residir en memoria para el enrutado de expertos.
- Configuraciones viables: 8xH100 80 GB o 8xA100 80 GB (640 GB) para FP8 con margen; 4xH100 80 GB (320 GB) para Q5_K_M o Q4_K_M con contexto moderado; 8xRTX 6000 Ada / L40S 48 GB (384 GB) para cuantizaciones intermedias en despliegues de coste mas contenido.
- Inferencia en CPU con llama.cpp: requiere del orden de 250 GB de RAM para Q4_K_M. Con un servidor de doble socket DDR5 el ancho de banda de memoria es el factor limitante, por lo que la velocidad esperada es del orden de unos pocos tokens por segundo; se trata de una estimacion, no de un dato publicado.
- Despliegue: llama.cpp u Ollama para los ficheros GGUF; vLLM, SGLang o TGI para los pesos oficiales en FP8 o BF16 (el soporte de GGUF en vLLM es limitado y no es la ruta recomendada). El modelo esta marcado como `endpoints_compatible`.
- Latencia y throughput concretos: no disponible. La unica referencia publicada es la aceleracion por MTP, aproximadamente 1,5x con una cabeza y hasta 2,2x con dos en decodificacion voraz, y la mejora de throughput del ~20 % frente a GigaChat 3.1 Ultra.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Rendimiento destacado | Disponibilidad |
|---|---|---|---|---|---|
| GigaChat 3.5 Ultra (este) | 433,7 B / 28 B | no disponible | MIT | MMLU-Pro 74,54; HumanEval 80,49; TAU2-bench 68,71; SWE-bench verified 42,6 | Pesos en FP8, BF16, base, checkpoints y GGUF (terceros) |
| GigaChat 3.1 Ultra | 700 B / no disponible | no disponible | no disponible en la informacion proporcionada | MMLU-Pro 68,01; HumanEval 70,12; TAU2-bench 41,87 | Pesos publicados por ai-sage |
| DeepSeek V4 Flash Base | 284 B / no disponible | no disponible | no disponible en la informacion proporcionada | MMLU 88,68; LCB CodeGen Lite 57,25 | Version base comparada en la model card |
| DeepSeek V3.2 Exp Base | 685 B / no disponible | no disponible | no disponible en la informacion proporcionada | MMLU 87,47; BBH 89,16; CRUXEval 69,94 | Version base comparada en la model card |
| DeepSeek V3.2 (instruct) | 685 B / no disponible | no disponible | no disponible en la informacion proporcionada | SWE-bench verified 44,8; TAU2-bench 66 | Version instruct comparada en la model card |

Patron general: GigaChat 3.5 Ultra Base supera a DeepSeek V4 Flash Base y a DeepSeek V3.2 Exp Base en MMLU-Pro, GPQA Diamond, HumanEval y HumanEval+, y queda por detras en MMLU, BBH, DROP y LiveCodeBench CodeGen Lite. En la comparativa instruct, la version 3.5 Ultra supera a DeepSeek V3.2 en TAU2-bench (68,71 frente a 66) y queda ligeramente por debajo en SWE-bench verified (42,6 frente a 44,8). No se dispone de datos de contexto ni de licencia de los modelos DeepSeek en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura idiomatica restringida: solo ruso e ingles. No se declara soporte de espanol ni de otros idiomas, por lo que su uso en castellano no esta respaldado por la documentacion.
- Publicacion de terceros: este repositorio GGUF lo mantiene el usuario BahamutRU, no ai-sage. No hay garantia de que la conversion preserve fielmente el comportamiento de los pesos originales, ni de que la licencia MIT declarada cubra los pesos de origen. Conviene verificar la licencia de las publicaciones oficiales antes de un uso comercial.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha, sin issues ni discusion asociada. No existe evidencia externa de calidad de la cuantizacion.
- Falta de detalle sobre la cuantizacion: no se especifican los tipos incluidos, el nivel de compresion de cada uno ni si se aplico calibracion con imatrix, factores que afectan de forma notable a la degradacion de un modelo MoE.
- Todos los benchmarks proceden de la model card del modelo original y se midieron sobre los pesos en FP8/BF16, no sobre esta conversion GGUF. Las cifras pueden no reproducirse al aplicar cuantizacion agresiva.
- Riesgo de alucinacion: no se publican tasas de factualidad ni evaluaciones especificas de alucinacion en la informacion disponible. Como en cualquier modelo de esta escala, las respuestas deben verificarse en dominios criticos.
- Sesgos: no se documenta ningun analisis de sesgo, toxicidad o seguridad en la informacion proporcionada.
- Coste de despliegue muy alto incluso cuantizado: los ~245 GB de un Q4_K_M obligan a infraestructura multinodo o a servidores con cientos de GB de RAM, lo que limita su uso a entornos con presupuesto elevado.
- Discrepancia de nomenclatura: el nombre del repositorio indica 432B, mientras que los safetensors declarados suman 433 747 019 520 parametros. La diferencia es pequena, pero conviene tenerla en cuenta al planificar memoria.
- Longitud de contexto no declarada: la etiqueta `long-context` no viene acompanada de una cifra, por lo que no se puede dimensionar a priori el KV-cache ni garantizar un limite concreto en produccion.
- El post-entrenamiento incluye RL en linea, una tecnica que puede inducir comportamientos de complacencia o ajuste excesivo a las preferencias del evaluador; no se aportan evaluaciones que lo descarten.
- Tabla de Terminal-bench truncada en la model card de origen, por lo que no es posible evaluar el rendimiento en ese escenario.

## Enlaces

- Repositorio GGUF analizado: https://huggingface.co/BahamutRU/GigaChat3.5-432B-A28B-GGUF
- Version oficial en FP8: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B
- Version oficial en BF16: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B-bf16
- Version base para entrenamiento: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B-base
- Checkpoints de entrenamiento: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B-checkpoints
- Articulo tecnico en Habr: https://habr.com/ru/companies/sberbank/articles/1055826/
- Nota: los resultados de la busqueda web realizada no contienen enlaces relevantes al modelo; las URL devueltas corresponden a foros y articulos sin relacion con GigaChat.
