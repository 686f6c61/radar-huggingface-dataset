# MedAmineMahmoud/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GGUF es una compilación en formato GGUF del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, modificada mediante una técnica de *abliteration* que proyecta fuera de los pesos la dirección de rechazo aprendida durante el alineamiento. El trabajo lo firma el usuario MedAmineMahmoud y la cuantización la realiza el equipo de AtomicChat, orientada a su aplicación de inferencia local Atomic Chat. El objetivo es disponer de un modelo capaz de responder sin negativas ante peticiones que el modelo base rechazaría, manteniendo en lo posible sus capacidades de conocimiento y razonamiento.

El modelo base es un transformer de tipo mezcla de expertos (MoE) de gran tamaño, con expertos nativos en formato MXFP4 y una tabla de n-gramas denominada Engram que se distribuye como shard independiente. La edición se calcula sobre los pesos en precisión completa (BF16 con expertos MXFP4 dequantizados de forma exacta) y afecta a todos los bloques que escriben en el flujo residual: salida de atención, experto compartido, los 384 expertos enrutados de cada bloque y la proyección de valor de Engram.

Se publican dos compilaciones cuantizadas (IQ1_M a 2,67 bits por peso y Q2_K a 3,58 bits por peso) más un adaptador LoRA de rango 1 que aplica la misma edición sobre cualquier GGUF del modelo base con nombres de tensor compatibles. La relevancia actual radica en que permite ejecutar un modelo de esta escala en máquinas de 140-200 GB de memoria combinada (RAM y VRAM), algo inviable con los pesos originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con expertos nativos MXFP4 y tabla de n-gramas Engram; edición por proyección de la dirección de rechazo |
| Parámetros totales | 114.925.568 (dato de safetensors del modelo base; no coincide con el tamaño aparente del repo de 585,7 GB, probablemente por los múltiples shards y el adaptador) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_M (2,67 bpw) y Q2_K (3,58 bpw); adaptador LoRA GGUF de rango 1 |
| Idiomas soportados | no disponible (los benchmarks se reportan en inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (múltiples shards por compilación) más LoRA en GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con expertos almacenados en MXFP4 y una tabla Engram de n-gramas que se lee unas pocas filas por token y puede residir en SSD. La edición *uncensored* no es un reentrenamiento: se calcula la dirección de rechazo sobre los pesos publicados en precisión completa y se proyecta fuera de todos los bloques que escriben en el flujo residual. El resultado se hornea en las compilaciones GGUF y también se exporta como LoRA de rango 1 aplicable a GGUFs del modelo base con los mismos nombres de tensor, incluidos los de Unsloth.

Cada compilación replica exactamente los tipos de tensor y la importance matrix de la compilación equivalente de Unsloth, de modo que la única diferencia medible entre ambas es la edición. La compilación Q2_K conserva el conocimiento (MMLU 86,0% → 86,6%, p = 0,69) y elimina los rechazos en JailbreakBench (91,4% → 0,0%). La compilación IQ1_M degrada MMLU de 85,6% a 81,8% (500 preguntas, p = 0,003) y muestra más bucles en modo thinking (3/30 a esfuerzo bajo y 5/30 a esfuerzo alto en JailbreakBench). El adaptador LoRA, medido sobre UD-Q2_K_XL de Unsloth, deja los rechazos en 0,0% en inglés, XSTest 7,6 puntos por debajo del original, MMLU +0,55 puntos sobre 2000 preguntas, 20/20 llamadas a herramientas válidas y 3/3 aciertos en agujas de contexto largo.

## Capacidades

- Generación de texto y razonamiento en modo thinking con dos niveles de esfuerzo (bajo y alto), según los benchmarks reportados.
- Conocimiento factual medido con MMLU (500 y 2000 preguntas) en las compilaciones publicadas.
- Llamada a herramientas (*tool calling*): 20/20 llamadas válidas medidas con el adaptador sobre UD-Q2_K_XL.
- Manejo de contexto largo: 3/3 aciertos en pruebas de agujas (*needles*) con el adaptador.
- Respuesta sin rechazos ante peticiones de JailbreakBench en inglés (0,0% de rechazos en ambas compilaciones).
- Preservación de la tasa de rechazo ante peticiones legítimas: XSTest baja de 8,8% a 0,0% en IQ1_M y de 8,0% a 0,4% en Q2_K.
- Compatibilidad con llama.cpp a partir del merge de DeepSeek-V4.1 del 25 de octubre (PR #31086).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y rechazo: permite comparar el comportamiento del modelo base frente a la versión editada con las mismas prompts, servidor y plantilla, cuantificando el efecto de eliminar la dirección de rechazo sobre MMLU, XSTest y JailbreakBench.
- Evaluación de técnicas de *abliteration*: la publicación incluye KLD, top-1 coincidente y métricas de rechazo frente a la compilación equivalente de Unsloth, lo que sirve como referencia reproducible para estudiar el coste de la edición a distintos niveles de cuantización.
- Despliegue local en máquinas de gran memoria: la compilación Q2_K requiere unos 199,6 GB de pesos en RAM y VRAM y funciona con llama.cpp desde el merge del 25 de octubre, lo que permite servir el modelo en estaciones de trabajo con suficiente memoria unificada o múltiples GPU.
- Aplicación de la edición sobre GGUFs existentes: el LoRA de rango 1 se puede cargar con `--lora-scaled` sobre UD-Q2_K_XL o compilaciones mayores de Unsloth para obtener el mismo comportamiento sin descargar una compilación nueva.
- Pruebas de robustez y seguridad: útil para medir la tasa de rechazo ante prompts seguros (XSTest) y ante intentos de jailbreak, y para detectar bucles en modo thinking a bajo y alto esfuerzo.
- Integración en pipelines con llamada a herramientas: los 20/20 de llamadas válidas y los 3/3 de contexto largo sugieren su uso en flujos de agentes que necesiten invocar funciones y consultar documentos extensos.
- Experimentación con cuantizaciones extremas: la compilación IQ1_M, con 139,8 GB de pesos, permite estudiar el equilibrio entre tamaño, conocimiento (MMLU 81,8%) y estabilidad del razonamiento en máquinas de unos 140 GB.

## Benchmarks y rendimiento

Datos publicados por el autor frente a la compilación de Unsloth del mismo layout, con texto neutral retenido (24 fragmentos de 4096 tokens) y referencia UD-Q8_K_XL:

| Compilación | JailbreakBench (EN) | XSTest (rechazos seguros) | Thinking bajo | Thinking alto | MMLU (500) |
|---|---|---|---|---|---|
| IQ1_M | 88,9% → 0,0% | 8,8% → 0,0% | 29/30 → 0/30 | 28/30 → 0/30 | 85,6% → 81,8% (p = 0,003) |
| Q2_K | 91,4% → 0,0% | 8,0% → 0,4% | 28/30 → 0/30 (adaptador) | 28/30 → 0/30 (adaptador) | 86,0% → 86,6% (p = 0,69) |

Métricas de fidelidad frente a la referencia:

| Compilación | En disco | Pesos (RAM + VRAM) | KLD medio | Mismo top-1 | KLD Unsloth mismo layout | Top-1 Unsloth |
|---|---|---|---|---|---|---|
| IQ1_M | 250,4 GB | 139,8 GB | 0,2506 | 83,14% | 0,2227 | 84,37% |
| Q2_K | 334,8 GB | 199,6 GB | 0,1001 | 89,45% | 0,0829 | 90,45% |

Adaptador LoRA sobre UD-Q2_K_XL de Unsloth: rechazos 0,0% en inglés, XSTest 7,6 puntos por debajo del original, MMLU (2000 preguntas) +0,55 puntos, thinking 0/30 en esfuerzo bajo y 0/30 en alto, 20/20 llamadas a herramientas válidas, 3/3 agujas de contexto largo, KL del primer token en prompts inocuos de 0,38 y dirección residual en los escritores de 5,9e-04. Sobre UD-IQ1_M el adaptador degrada MMLU de 85,6% a 72,0%.

## Requisitos de hardware

- Compilación IQ1_M: 139,8 GB de pesos en RAM y VRAM, 250,4 GB en disco; pensada para máquinas de unos 140 GB de memoria para los pesos.
- Compilación Q2_K: 199,6 GB de pesos en RAM y VRAM, 334,8 GB en disco; recomendada si la máquina puede albergarla.
- La tabla Engram es un shard independiente (shard 3 de 6 en IQ1_M, 111 GB; shard 3 de 8 en Q2_K, 135 GB) que se lee unas pocas filas por token y puede residir en SSD, por lo que la memoria necesaria corresponde solo a los pesos.
- GPU recomendadas: no disponibles en la información proporcionada; por el volumen de pesos, requiere agregados de memoria muy superiores a una RTX 4090.
- Cabe en GPU de consumo: no, según los tamaños publicados.
- Despliegue: llama.cpp con `llama-server`, en una compilación posterior al merge del 25 de octubre (PR #31086); verificado sobre master `d854d98` y sobre el pin de Unsloth `9d907b7cfe0e`. No funciona todavía en Atomic Chat.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Uncensored (IQ1_M / Q2_K) | 114.925.568 según safetensors del base | no disponible | MIT | GGUF | Edición de rechazo horneada; KLD 0,2506 / 0,1001 frente a referencia |
| DeepSeek-V4.1-Flash-1017 (Unsloth, mismo layout) | mismo base | no disponible | MIT | GGUF | Sin edición; KLD 0,2227 / 0,0829; rechazos 88,9% / 91,4% en JailbreakBench |
| DeepSeek-V4.1-Flash-1017 (UD-Q8_K_XL de Unsloth) | mismo base | no disponible | MIT | GGUF | Referencia de fidelidad usada por el autor |
| DeepSeek-V4.1-Flash-1017 original (BF16 + MXFP4) | mismo base | no disponible | MIT | safetensors | Pesos publicados por DeepSeek; base de la edición |

## Limitaciones y advertencias

- La compilación IQ1_M no supera la puerta de calidad del autor: MMLU cae 3,8 puntos (p = 0,003) y aparecen bucles en modo thinking (3/30 a esfuerzo bajo, 5/30 a esfuerzo alto).
- El adaptador LoRA está calculado sobre pesos en precisión completa; aplicado sobre una compilación de 1 bit deja de corresponder a los pesos a los que se suma (MMLU 85,6% → 72,0% sobre UD-IQ1_M). Debe usarse sobre UD-Q2_K_XL o mayor.
- La eliminación de la dirección de rechazo reduce también los rechazos ante prompts seguros según XSTest (de 8,8% a 0,0% en IQ1_M y de 8,0% a 0,4% en Q2_K), lo que puede traducirse en respuestas a peticiones que el modelo original declinaba.
- El modelo está diseñado explícitamente para responder sin negativas; su uso en producción exige filtros y políticas de contenido externas.
- Los benchmarks publicados se limitan al inglés; no hay datos de rendimiento en castellano ni en otros idiomas.
- No se dispone de datos sobre longitud de contexto, parámetros activos ni sesgos específicos del modelo base en la información proporcionada.
- La licencia MIT del repositorio no exime de las condiciones del modelo base de DeepSeek; conviene verificar la licencia del checkpoint original antes de un uso comercial.
- Requiere una compilación de llama.cpp posterior al 25 de octubre; no funciona en Atomic Chat según la propia model card.
- El dato de parámetros totales de safetensors (114.925.568) resulta inconsistente con el tamaño del repo (585,7 GB) y con los requisitos de memoria publicados; conviene tratarlo con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MedAmineMahmoud/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Compilaciones GGUF de Unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Métricas y registros de compatibilidad: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics/tree/main/compat/llama-master-d854d98
- PR de llama.cpp con soporte de DeepSeek-V4.1: https://github.com/ggml-org/llama.cpp/pull/31086
- Pin de Unsloth en llama.cpp: https://github.com/unslothai/llama.cpp/pull/298
- Atomic Chat: https://atomic.chat/
- Repositorio de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- X de Atomic Chat: https://x.com/atomic_chat_hq
