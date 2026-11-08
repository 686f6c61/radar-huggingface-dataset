# feverdoingwork/Qwen3.8-Flash-Next-iq3_s_turbo-Starlight

## Resumen

Qwen3.8-Flash-Next iq3_s_turbo-Starlight es una cuantización de un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollada por el usuario feverdoingwork a partir de Qwen/Qwen3.8-Flash-Next, publicado por el equipo Qwen (Alibaba). El modelo original emplea una arquitectura de 48 capas con 512 expertos por capa, de los cuales 10 se activan por token, e incorpora atención lineal además de atención estándar, junto con un cabezal de predicción multi-token (MTP) para decodificación especulativa. El contexto nativo del modelo base alcanza los 262.144 tokens.

El artefacto publicado no es un checkpoint en formato Transformers ni safetensors, sino un único fichero GGUF de 64,78 GiB (69.554.574.592 bytes) con extensiones propietarias (`.starlight.gguf`) diseñado exclusivamente para el motor de inferencia Starlight. La receta de cuantización parte del calibrado GSQ-RCO de ISTA-DASLab, repackado y reducido de tamaño por Starlight, con tipos de tensor mixtos que van de IQ2_S a Q6_K y un vocabulario podado de 248.320 a 141.312 tokens. Su relevancia práctica reside en que permite ejecutar un modelo MoE de gran tamaño en una sola GPU de 16 GB (AMD RX 9070 XT, NVIDIA RTX 5070 Ti o RTX 5060 Ti), manteniendo los expertos no residentes en memoria del sistema y leyéndolos bajo demanda.

La ficha describe tanto las características del modelo base como las particularidades de esta cuantización concreta, incluyendo las mediciones de velocidad, memoria y divergencia respecto a BF16 publicadas por el autor. Es importante subrayar que el fichero no es compatible con llama.cpp, Ollama, LM Studio ni otros motores convencionales: solo funciona con Starlight.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal y estándar; 48 capas, 512 expertos por capa, 10 activos por token; cabezal MTP para decodificación especulativa |
| Parametros totales | no disponible (el modelo base se describe en una fuente externa como de 120B, sin confirmación en la información proporcionada) |
| Parametros activos | 10 de 512 expertos por capa (número exacto de parámetros activos no disponible) |
| Longitud de contexto | 245.760 tokens en una sola tarjeta; 262.144 tokens (límite del modelo) con dos RTX 5060 Ti o con caché de atención desbordada a RAM |
| Tipos de cuantizacion | Mezcla de IQ2_S, IQ4_XS, IQ4_NL, Q2_0, IQ3_XXS, IQ3_S, IQ2_XXS, Q6_K y tipos menores; media ponderada de 2,84 bits en expertos enrutados |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | GGUF con extensiones Starlight (`.starlight.gguf`); no compatible con Transformers, safetensors, llama.cpp, Ollama ni LM Studio |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con 48 capas y 512 expertos por capa, de los que se activan 10 por token, lo que reduce el coste computacional por token frente a un modelo denso de tamaño equivalente. La arquitectura combina capas de atención estándar con capas de atención lineal, e incluye un experto compartido, router y un cabezal de predicción multi-token (MTP) que actúa como draft head para decodificación especulativa. En esta cuantización el vocabulario se ha podado de 248.320 a 141.312 tokens (141.148 reales y 164 de relleno), eliminando 107.172 entradas sin alterar el texto de los tokens conservados.

La receta de cuantización parte del calibrado GSQ-RCO de ISTA-DASLab y aplica un repackaging y reducción de tamaño por parte de Starlight, con un reparto de bits desigual: los expertos enrutados ocupan 39,98 GiB a 2,84 bits por peso, la tabla de tokens por capa 20,30 GiB a 3,41 bits, y atención, atención lineal, experto compartido y router 2,83 GiB a 6,58 bits. El cabezal MTP ocupa 1,21 GiB a 3,97 bits y el embedding y la cabeza de salida 0,46 GiB a 5,41 bits. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Qwen3.8-Flash-Next.
- Decodificación especulativa mediante el cabezal MTP incluido en el fichero, que acelera la generación.
- Procesamiento de contextos muy largos, hasta 245.760 tokens en una sola GPU de 16 GB y hasta 262.144 tokens en configuraciones con más memoria.
- Ejecución en hardware de consumo mediante descarga dinámica de expertos desde RAM del sistema.
- Capacidades multilingües: no disponible (los idiomas no están documentados en la información proporcionada).
- Soporte de tool calling, function calling y modos de agente: no disponible en la información proporcionada para esta variante.
- Capacidades de visión o audio: no disponible.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo en estación de trabajo: con 245.760 tokens de ventana en una sola GPU de 16 GB, el modelo puede mantener conversaciones multi-turno sobre documentación extensa o historiales completos sin truncar, leyendo los expertos no residentes desde RAM.
- Análisis de repositorios y bases de código: la ventana de contexto permite cargar ficheros completos o varios módulos en una sola pasada; el modelo puede resumir, explicar y responder preguntas sobre el código sin fragmentación.
- Procesamiento de documentos legales o técnicos: lectura de contratos, informes o manuales de cientos de miles de tokens en una sola inferencia, con tiempos de primer token medidos de 2,1 a 10,9 segundos según longitud del prompt en RX 9070 XT.
- Prototipado e investigación en local: investigadores que necesitan evaluar el comportamiento de un MoE grande sin acceso a clústeres pueden ejecutarlo en una GPU de consumo con 64 GB de RAM de sistema, a velocidades de decodificación de 85 a 104 tok/s.
- Generación aumentada por recuperación (RAG) de gran volumen: la ventana de contexto permite inyectar muchos fragmentos recuperados a la vez, reduciendo la necesidad de reordenación agresiva o de resúmenes intermedios.
- Despliegue en entornos con hardware AMD: es una de las pocas configuraciones documentadas que aprovecha una RX 9070 XT de 16 GB para un MoE de este tamaño, con velocidades de decodificación medidas superiores a 100 tok/s en contextos de 32k.
- Evaluación comparativa de cuantizaciones: sirve como referencia práctica para medir el compromiso entre tamaño de fichero (64,78 GiB) y fidelidad respecto a BF16 (KLD 0,257, perplejidad 3,593).

## Benchmarks y rendimiento

El autor publica mediciones de fidelidad frente a los logits de referencia BF16 del modelo base (12 casos de texto, 16.561 posiciones evaluadas, motor Starlight sobre RTX 5070 Ti, 2 de noviembre de 2026):

| Fichero | KLD vs BF16 | Top-1 igual a BF16 | Perplejidad (BF16: 3,126) | Tamano total (GiB) |
|---|---:|---:|---:|---:|
| ISTA-DASLab GSQ-RCO IQ3_S (referencia) | 0,193 | 86,71 % | 3,463 | 77,88 |
| `iq3_s_turbo` (este fichero) | 0,257 | 84,08 % | 3,593 | 64,78 |
| ISTA-DASLab GSQ-RCO IQ3_XXS (referencia) | 0,276 | 84,05 % | 3,657 | 70,63 |
| `iq3_xxs_turbo` | 0,310 | 83,56 % | 3,566 | 54,68 |
| `iq3_xxs_turbo_mini` | 0,318 | 83,78 % | 3,508 | 50,03 |

Velocidad medida (medianas de tres ejecuciones, Ryzen 5 7500F, 62 GiB de RAM, 38 GiB asignados a Starlight):

| Tarjeta | Decodificación a 2k / 8k / 32k (tok/s) | Primer token tras prompt de 8k / 32k |
|---|---:|---:|
| RX 9070 XT | 84,9 / 97,9 / 104,3 | 2,1 s / 10,9 s |
| RTX 5070 Ti | 91,1 / 101,9 / 100,4 | 2,9 s / 7,3 s |
| Dos RTX 5060 Ti (tensor split) | 96-109 (2k a 64k) | 2,5 s / 10,4 s |

En máquinas con 32 GB de RAM, la RX 9070 XT decodifica unos 30 tok/s (primer token 9,2 s a 8k y 24 s a 32k) y la RTX 5070 Ti unos 35 tok/s (8,7 s y 22 s). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 16 GB por tarjeta en las configuraciones documentadas; los expertos que no caben permanecen en RAM del sistema y se leen bajo demanda por PCIe.
- RAM del sistema: 64 GB de clase recomendados (38 GiB asignados al motor); con 32 GB de clase la velocidad cae a 30-35 tok/s.
- GPU recomendadas: AMD RX 9070 XT (16 GB), NVIDIA RTX 5070 Ti (16 GB), NVIDIA RTX 5060 Ti (16 GB, una o dos en tensor split).
- Almacenamiento: NVMe recomendado; el fichero ocupa 64,78 GiB.
- Ancho de banda PCIe: relevante, ya que cada experto no residente es una copia por PCIe; el mismo RTX 5070 Ti en enlace x16 decodificó aproximadamente un tercio más rápido que en x4.
- Opciones de despliegue: exclusivamente el motor Starlight. No compatible con vLLM, llama.cpp, Ollama, LM Studio, TGI ni Transformers.
- Latencia y throughput: 84,9-104,3 tok/s de decodificación en RX 9070 XT y 91,1-101,9 tok/s en RTX 5070 Ti con 64 GB de RAM; primer token de 2,1 a 10,9 s según longitud del prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KLD vs BF16 | Tamano | Licencia | Motor |
|---|---|---|---|---|---|---|
| `iq3_s_turbo` (este fichero) | MoE 48 capas, 512 expertos, 10 activos | 245.760-262.144 | 0,257 | 64,78 GiB | Qwen Community 1.0 | Starlight |
| ISTA-DASLab GSQ-RCO IQ3_S | mismo modelo base | mismo | 0,193 | 77,88 GiB | Qwen Community 1.0 | llama.cpp/GGUF estándar |
| ISTA-DASLab GSQ-RCO IQ3_XXS | mismo modelo base | mismo | 0,276 | 70,63 GiB | Qwen Community 1.0 | llama.cpp/GGUF estándar |
| `iq3_xxs_turbo` | mismo modelo base | mismo | 0,310 | 54,68 GiB | Qwen Community 1.0 | Starlight |

La comparación con modelos de otros desarrolladores del mismo tamaño no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: el fichero solo funciona con el motor Starlight; no es un checkpoint Transformers ni safetensors y no está soportado ni probado en llama.cpp, Ollama, LM Studio u otros programas.
- Pérdida de fidelidad frente a BF16: KLD de 0,257 y top-1 del 84,08 %, frente a 0,193 y 86,71 % del IQ3_S de referencia; la diferencia de 0,065 KLD es sustancial y se traduce en mayor divergencia en la generación.
- Vocabulario podado: se eliminan 107.172 tokens del vocabulario original, lo que puede afectar a la cobertura de idiomas, dominios técnicos o scripts poco frecuentes.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe en esta variante.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad para esta cuantización.
- Sesgos: no se han documentado sesgos conocidos en la información proporcionada.
- Licencia: Qwen Community License 1.0; es necesario revisar sus términos antes de un uso comercial, ya que no es una licencia puramente permisiva.
- Rendimiento dependiente del hardware: la velocidad cae drásticamente con menos RAM de sistema (30-35 tok/s con 32 GB) y con enlaces PCIe estrechos.
- Sin datos de benchmarks estándar: no hay resultados publicados de MMLU, HumanEval, GSM8K u otras evaluaciones de capacidad en la información disponible.
- Modelo sin tracción verificable: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/feverdoingwork/Qwen3.8-Flash-Next-iq3_s_turbo-Starlight
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización de referencia: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Logits de referencia BF16: https://huggingface.co/datasets/jyohukuchan/qwen38-flash-next-bf16-logits
- Variante abliterada relacionada: https://huggingface.co/DavidAU/Qwen3.8-Flash-Next-Abliterated-Uncensored-Turbo-Brilliance-50x-Reasoning-Instruct-GSQ-RCO-GGUF
