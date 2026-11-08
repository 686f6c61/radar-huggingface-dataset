# litert-community/NVIDIA-Nemotron-Labs-Dory1.0-4B

## Resumen

NVIDIA-Nemotron-Labs-Dory1.0-4B es un modelo de lenguaje de aproximadamente 4.000 millones de parametros desarrollado por NVIDIA Labs y publicado originalmente en formato BF16. Su particularidad es que se trata de un modelo "looped" (latente-recurrente) basado en la arquitectura nGPT (normalized GPT): un bloque central de capas se aplica varias veces por token, de modo que el modelo puede gastar mas computo por token sin aumentar el numero de parametros. Combina capas de atencion de ventana deslizante con capas de atencion completa.

La ficha que nos ocupa no es el checkpoint original, sino la conversion realizada por la comunidad litert-community al formato `.litertlm` para el runtime LiteRT-LM de Google, orientado a inferencia en dispositivo (edge y movil). Se ofrecen tres artefactos: un fichero int4 pensado para GPU, un fichero int8 pensado para CPU y un fichero int4 "one-loop" que ejecuta el bloque recurrente una sola vez por token en lugar de dos, con mayor velocidad en GPU pero menor precision.

Es relevante ahora porque demuestra que un modelo con razonamiento y bucle latente puede ejecutarse en telefonos de gama alta (Galaxy S26, Pixel 8a) y en Apple Silicon con tasas de decodificacion utilizables, algo poco habitual en modelos con capacidad de razonamiento explicito. La licencia es OpenMDW-1.1 y el modelo esta declarado como apto para uso comercial por NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer looped (latente-recurrente) basado en nGPT, con atencion de ventana deslizante y atencion completa intercaladas |
| Parametros totales | 3.975.229.440 |
| Parametros activos | no disponible (no es MoE; el bloque recurrente se reutiliza, no se activan parametros distintos) |
| Longitud de contexto | 2.048 tokens de presupuesto de KV cache en estos ficheros; vocabulario de 131.072 tokens |
| Tipos de cuantizacion | int4 blockwise-32 (GPTQ) para GPU; int8 dinamico channelwise para CPU; int4 one-loop |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW-1.1 (openmdw-1.1) |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en BF16 safetensors |

Detalles estructurales del checkpoint: 72 bloques (8 pares de entrada, 20 pares recurrentes, 8 pares de salida), con los 20 pares recurrentes ejecutados dos veces por token en la receta por defecto. Hidden size 2560, 16 cabezas de query y 4 cabezas KV de 256 dimensiones, 27 capas de atencion de ventana deslizante (1.024 tokens) y 9 capas de atencion completa, MLP de 7168 y embeddings no atados. No usa RMSNorm: cada vector oculto, query y key se normaliza L2 (nGPT) y cada bloque mezcla su salida en el residual con un paso aprendido.

| Fichero | Receta | Tamano | sha256 |
|---|---|---|---|
| `NVIDIA-Nemotron-Labs-Dory1.0-4B_int4.litertlm` | int4 blockwise-32 en capas lineales, codigos elegidos por GPTQ, escalas de bloque con suelo 2^-14; embedding int8 en seccion propia; escrituras de KV cache y matmuls de atencion como composites GPU; activaciones fp16 por defecto | 2,40 GB | `220daaa9...1253a21da` |
| `NVIDIA-Nemotron-Labs-Dory1.0-4B_int8.litertlm` | int8 dinamico (pesos int8 channelwise, activaciones float) en capas lineales; embedding int8 | 4,05 GB | `25632f91...c2f9f6083` |
| `NVIDIA-Nemotron-Labs-Dory1.0-4B_int4_1loop.litertlm` | mismos pesos, embedding, tokenizer y metadatos que el int4, con grafo que ejecuta los 20 pares recurrentes una vez por token | 2,40 GB | `53f93583...3450dab4` |

## Arquitectura y entrenamiento

El modelo es un nGPT looped: en lugar de apilar capas independientes, comparte un bloque de 20 pares de capas (atencion o MLP) que se aplica dos veces por token en la configuracion por defecto. Esto permite escalar el computo por token sin escalar los parametros, una forma de "test-time compute" integrada en la arquitectura. La normalizacion es puramente L2 sobre vectores ocultos, queries y keys, sin RMSNorm, y la mezcla residual usa un paso aprendido por bloque. La atencion alterna 27 capas de ventana deslizante de 1.024 tokens con 9 capas de atencion completa, lo que reduce el coste de contexto largo manteniendo acceso global periodico.

Los ficheros LiteRT-LM conservan una KV cache por capa de atencion y por bucle (modo "per-loop" de NVIDIA): 56 caches en los ficheros de dos bucles y 36 en el de un bucle, con un presupuesto de 2.048 tokens. La conversion se realizo con `hf-to-litertlm` sobre litert-torch 0.9.4 y se probo con litert-lm 0.18.0. No se dispone en la informacion proporcionada de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO; la model card original de NVIDIA no se incluye en el material disponible.

## Capacidades

- Generacion de texto en ingles con modo de razonamiento explicito ("thinking"), con canal de pensamiento y tokens de parada definidos en los metadatos del modelo.
- Razonamiento multi-paso: el bucle latente permite reutilizar el bloque recurrente como computo adicional por token.
- Razonamiento matematico basico y de nivel escolar: el modelo obtiene 90-93 de accuracy en GSM8K segun fichero y hardware.
- Conversacion multi-turno dentro del presupuesto de contexto de 2.048 tokens.
- Ejecucion en dispositivo: inferencia en GPU movil via delegado OpenCL y en CPU.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de vision, audio ni otras modalidades.
- Multilingue: solo ingles declarado.

## Casos de uso

- Asistente conversacional offline en movil: el fichero int4 en GPU del Galaxy S26 decodifica a 12,09 tok/s, suficiente para respuestas cortas con razonamiento en un asistente sin conexion.
- Razonamiento matematico en el dispositivo: con 90 de accuracy en GSM8K (int4, GPU) y 93 (int8, CPU), es adecuado para resolver problemas aritmeticos y de enunciado en apps educativas sin enviar datos a la nube.
- Procesamiento de texto privado en portatiles Apple Silicon: el int8 en CPU del Mac M4 Max completa 1.024 tokens de prefill mas 256 de decodificacion en 19,70 s, util para resumen y reescritura local de documentos sensibles.
- Clasificacion y extraccion de informacion en edge: con contexto de 2.048 tokens y ventana deslizante de 1.024, encaja en tareas de extraccion sobre parrafos o fichas cortas en dispositivos con recursos limitados.
- Prototipado de agentes con razonamiento en hardware de consumo: el canal de pensamiento y la plantilla de NVIDIA permiten construir flujos de reflexion paso a paso en un telefono o mini-PC.
- Evaluacion de arquitecturas looped: sirve como banco de pruebas para comparar el efecto del numero de bucles (1 vs 2) sobre precision y latencia en el mismo hardware.
- Filtrado y moderacion de contenido local: la baja latencia del fichero one-loop en GPU (17,32 tok/s en Galaxy S26) permite clasificar mensajes en tiempo real sin salir del dispositivo.

## Benchmarks y rendimiento

GSM8K con thinking desactivado, metrica de accuracy, segun la model card:

| Modelo / fichero | Hardware | Bucles | GSM8K |
|---|---|---|---|
| int4 | GPU Mac | 2 | 90 |
| int4 one-loop | GPU Mac | 1 | 86 |
| int8 | CPU Mac | 2 | 93 |
| BF16 (llama.cpp) | no disponible | 2 | 95 |
| BF16 (llama.cpp) | no disponible | 1 | 86 |

Tiempos para 1.024 tokens de prefill mas 256 tokens decodificados con contexto 2.048:

| Configuracion | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int4 GPU | 5,43 s | 24,78 s | no ejecutado |
| int8 CPU | 19,70 s | 62,93 s | 298,9 s |
| int4 one loop, GPU | 3,54 s | 17,11 s | no ejecutado |

Decodificacion en Galaxy S26: 12,09 tok/s con int4 en GPU (22-10-2026); en ejecuciones alternas, 17,32 tok/s con one-loop frente a 11,08 tok/s con int4 de dos bucles (23-10-2026). En CPU, una compilacion int4 anterior prefillaba a 29,0 tok/s frente a 92,1 tok/s del int8 en el Galaxy S26.

Prueba de correctitud de 8 preguntas con thinking activado y decodificacion greedy: 8/8 en int4 sobre GPU Mac (activaciones fp16 y fp32), 8/8 en int8 sobre CPU Mac, 8/8 en int4 sobre GPU del Galaxy S26 con todos los nodos en el delegado OpenCL, y 8/8 en int8 sobre CPU del Galaxy S26 y del Pixel 8a. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: 2,40 GB para el fichero int4 (GPU) y 2,40 GB para el one-loop; 4,05 GB para el int8 (CPU).
- GPU recomendadas: GPU moviles con soporte OpenCL (Adreno en Galaxy S26 verificado) y GPU integradas de Apple Silicon (M4 Max verificado). No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: cabe en cualquier GPU con al menos 3 GB de memoria libre; el modelo esta pensado para movil y edge, no para servidores.
- CPU: el fichero int8 es la opcion correcta para CPU; el int4 en CPU es desaconsejado por la propia model card (prefill tres veces mas lento y respuestas greedy que varian entre CPUs).
- Despliegue: runtime LiteRT-LM (version probada 0.18.0), con `litert_lm_advanced_main` en moviles; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para estos ficheros `.litertlm`. El BF16 original puede ejecutarse en llama.cpp segun la comparativa de la model card.
- Latencia y throughput: ver tabla de benchmarks; el modo one-loop reduce el tiempo total un 35-45 % en GPU a costa de 4 puntos de GSM8K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Dory1.0-4B int4 (LiteRT-LM) | 3,97 B | 2.048 | 90 (GPU, 2 bucles) | OpenMDW-1.1 | `.litertlm`, LiteRT-LM |
| Dory1.0-4B int8 (LiteRT-LM) | 3,97 B | 2.048 | 93 (CPU, 2 bucles) | OpenMDW-1.1 | `.litertlm`, LiteRT-LM |
| Dory1.0-4B BF16 (llama.cpp) | 3,97 B | no disponible | 95 (2 bucles) | OpenMDW-1.1 | GGUF via llama.cpp |
| Dory1.0-4B one-loop int4 | 3,97 B | 2.048 | 86 (GPU) | OpenMDW-1.1 | `.litertlm`, LiteRT-LM |

No se dispone en la informacion proporcionada de datos de otros modelos de tamano similar (por ejemplo, familias de 3-4 B orientadas a edge) para establecer una comparativa cruzada con cifras verificables.

## Limitaciones y advertencias

- Solo ingles: no hay soporte multilingue declarado, por lo que su uso en castellano producira resultados degradados.
- Contexto efectivo limitado a 2.048 tokens en estos ficheros, muy por debajo de lo habitual en modelos de 4 B; las tareas que requieran documentos largos no son adecuadas.
- El modo one-loop pierde precision (86 frente a 90 en GSM8K en GPU) y no debe usarse cuando la exactitud matematica sea critica.
- El fichero int4 en CPU es problematico: prefill lento y respuestas greedy no deterministas entre distintas CPUs, segun la propia model card.
- Riesgo de alucinacion inherente a un modelo de 4 B con razonamiento explicito; el canal de pensamiento no garantiza correccion factual.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.
- Licencia OpenMDW-1.1: NVIDIA declara el modelo apto para uso comercial, pero conviene revisar los terminos completos de la licencia antes de desplegarlo en produccion.
- Los ficheros `.litertlm` dependen de LiteRT-LM 0.18.0; versiones distintas del runtime pueden no cargarlos correctamente.
- El rendimiento medido en Galaxy S26 puede variar por throttling termico: la propia model card senala que la GPU del telefono estuvo por debajo del limite termico en mas muestras en una de las ejecuciones.

## Enlaces

- Hugging Face (conversion LiteRT-LM): https://huggingface.co/litert-community/NVIDIA-Nemotron-Labs-Dory1.0-4B
- Arbol de ficheros: https://huggingface.co/litert-community/NVIDIA-Nemotron-Labs-Dory1.0-4B/tree/main
- Modelo base BF16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Herramienta de conversion hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Script de verificacion de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
