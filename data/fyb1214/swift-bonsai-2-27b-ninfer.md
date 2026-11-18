# fyb1214/Swift-Bonsai-2-27B-NInfer

## Resumen

Swift-Bonsai-2-27B-NInfer es un artefacto de cuantizacion extrema empaquetado para el motor de inferencia NInfer, derivado de Swift-Bonsai-2, la variante de razonamiento eficiente de UkisAI sobre el modelo ternario Ternary Bonsai 2 27B de Prism ML. El repositorio, publicado por el usuario fyb1214, contiene dos contenedores completos en formato `.ninfer`: uno de 1 bit (PTQ1_0_G128, 7,047 GB) y otro de 2 bits (PQ2_0_G128, 8,307 GB), ambos con torre de texto, torre de vision, cabeza MTP, cabeza de propuestas, tokenizador, plantilla de chat y procesador de medios integrados.

La relevancia del artefacto reside en que los codigos ternarios se han movido byte a byte desde el GGUF de origen al contenedor NInfer, sin desquantizar ni requantizar, por lo que no se introduce una segunda perdida de cuantizacion. Esto permite ejecutar un modelo multimodal de 27B en GPU de consumo con 12 GB de VRAM, manteniendo una perplejidad practicamente identica a la del modelo base (diferencias del 0,01 % al 0,07 % segun ventana y stride).

El modelo esta pensado para despliegue local en GPUs RTX 30/40/50 con el motor de la linea Ambolio/ninfer-4090-windows (v1.0.6 o v1.0.8), e incluye decodificacion especulativa mediante MTP (multi-token prediction) con profundidad de borrador configurable. La licencia es Apache 2.0 y los idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de texto + torre de vision) con cabeza MTP y cabeza de propuestas; cuantizacion ternaria |
| Parametros totales | 27B (segun nombre del modelo; no se detalla desglose) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 131.072 tokens (configuracion medida con `--max-context 131072`) |
| Tipos de cuantizacion | 1-bit / PTQ1_0_G128 (7,047 GB) y 2-bit / PQ2_0_G128 (8,307 GB); KV cache en bf16, int8, fp8, rk4v4, rk4v4-e8, nvfp4 o k8v4 segun arquitectura de GPU |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (contenedor propio del motor NInfer, dialecto PQ2_0_G128 / PTQ1_0_G128) |

## Arquitectura y entrenamiento

El modelo subyacente es Ternary Bonsai 2 27B de Prism ML, del que Swift-Bonsai-2 es una derivacion de razonamiento eficiente de UkisAI. La arquitectura es un transformer multimodal con torre de vision y torre de texto, al que se anaden una cabeza MTP (multi-token prediction) para decodificacion especulativa y una cabeza de propuestas, ambas incluidas en el contenedor NInfer. La cuantizacion es ternaria (1-bit PTQ1_0 y 2-bit PQ2_0) con granularidad de grupo G128 y transformada de Hadamard, segun las etiquetas del repositorio.

El proceso de empaquetado no reentrena ni recalibra: los codigos ternarios se copian byte a byte desde el GGUF de origen (`ukisai/Swift-Bonsai-2-GGUF`) al contenedor `.ninfer`, de modo que la unica diferencia respecto al original es el formato de contenedor y el dialecto de cuantizacion esperado por el motor. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

La innovacion tecnica destacable es la decodificacion especulativa MTP con profundidad de borrador ajustable (d1 a d4+lm), que en las mediciones del autor alcanza tasas de aceptacion del 27 % al 85 % segun el tipo de contenido (chino, ingles, codigo o razonamiento), con un pico de throughput de 65,5 t/s en codigo con d4+lm.

## Capacidades

- Generacion de texto y razonamiento en ingles y chino, con modo de pensamiento (etiqueta `thinking` en los benchmarks del autor).
- Generacion de codigo, con el mejor rendimiento relativo en las mediciones de throughput (hasta 65,5 t/s con d4+lm).
- Procesamiento multimodal image-text-to-text: el contenedor incluye torre de vision y procesador de medios, y las mediciones se realizaron con vision activada.
- Decodificacion especulativa mediante cabeza MTP integrada, con profundidad de borrador configurable.
- Soporte de contexto largo de hasta 131.072 tokens.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Despliegue local en GPU de consumo: con 7-8 GB de pesos, el modelo cabe en tarjetas de 12 GB como la RTX 3060, permitiendo inferencia de un modelo de 27B en hardware de gama media mediante el motor NInfer con KV cache en int8.
- Asistencia de codigo en estacion de trabajo: el mayor throughput medido se da en prompts de codigo (64,2 t/s con d3, 65,5 t/s con d4+lm), lo que lo hace adecuado para autocompletado y generacion de fragmentos en un IDE local.
- Procesamiento de documentos con imagen: la torre de vision integrada permite tareas image-text-to-text, como descripcion de capturas o extraccion de informacion de imagenes, en el mismo contenedor sin adaptadores adicionales.
- Razonamiento con contexto largo: la ventana de hasta 131.072 tokens admite analisis de documentos extensos o conversaciones multi-turno prolongadas, con KV cache cuantizada para reducir el consumo de VRAM.
- Experimentacion con cuantizacion ternaria: el artefacto sirve como referencia para evaluar la perdida de calidad de PTQ1_0 y PQ2_0 frente al modelo base, con perplejidades medidas y comparables.
- Inferencia bilingue ingles-chino: util para aplicaciones de traduccion o atencion al cliente en esos dos idiomas, con throughput medido de 42-50 t/s en ambos.
- Servicio HTTP local: el motor `ninfer-serve.exe` expone un endpoint en localhost, adecuado para prototipos y herramientas internas en Windows.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona mediciones de throughput y perplejidad en RTX 3060 12G con contexto 65.536, KV int8, MTP con LM y vision activada, greedy, 400 tokens de salida, 1 calentamiento y 2 ejecuciones (mediana):

| Config | Swift (t/s) | Base (t/s) |
|---|---:|---:|
| d1 | 44,6 | 45,0 |
| d2 | 52,5 | 51,5 |
| d3 | 55,0 | 55,1 |
| d4+lm | 53,1 | 52,3 |

Desglose por tipo de prompt (t/s y tasa de aceptacion MTP), modelo Swift:

| Config | Chino | Ingles | Codigo | Razonamiento | Media |
|---|---:|---:|---:|---:|---:|
| d1 | 42,2 (58 %) | 44,4 (68 %) | 46,0 (82 %) | 45,8 (84 %) | 44,6 |
| d2 | 46,0 (46 %) | 49,5 (56 %) | 58,4 (80 %) | 55,9 (76 %) | 52,5 |
| d3 | 44,0 (33 %) | 49,7 (44 %) | 64,2 (70 %) | 62,2 (68 %) | 55,0 |
| d4+lm | 40,4 (28 %) | 48,0 (40 %) | 65,5 (67 %) | 58,6 (59 %) | 53,1 |

Perplejidad con ventana/stride 512/256, 32/16 y 8/4: Swift 8,073669 / 26,962015 / 148,3656 frente a base 8,079208 / 26,972171 / 148,3863, es decir, entre un 0,07 % y un 0,01 % inferior. En el banco oficial con continuacion libre de un solo token, d4+lm lidera con 76,6 frente a 71,4 t/s en tg256 y 62,0 frente a 58,8 en tg128; sobre HTTP con generaciones reales de 400 tokens lidera d3 (50,3 frente a 47,6 t/s).

## Requisitos de hardware

- VRAM estimada: aproximadamente 7 GB para PTQ1_0 y 8,3 GB para PQ2_0 solo en pesos; con KV cache int8 y contexto 65.536-131.072 se midio en una RTX 3060 de 12 GB.
- GPU soportadas por el motor: RTX 30 (sm_86) con KV bf16 e int8; RTX 40 (sm_89) con bf16, int8, fp8, rk4v4 y rk4v4-e8; RTX 50 (sm_120) con bf16, int8, fp8, nvfp4 y k8v4.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB como la RTX 3060; el autor menciona configuraciones de `--max-context 32768~131072` con `--kv-dtype int8` en una tarjeta de 12 GB.
- Despliegue: exclusivamente mediante el motor NInfer de la linea Ambolio/ninfer-4090-windows (v1.0.6 o v1.0.8), con `ninfer-serve.exe`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, y no es intercambiable con otros artefactos `.ninfer` del Hub que usan dialectos distintos.
- Latencia y throughput: 44,6-55,0 t/s en RTX 3060 12G segun profundidad MTP, con contexto 65.536, KV int8 y vision activada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-Bonsai-2-27B-NInfer (este) | 27B | 131.072 | `.ninfer` PQ2_0_G128 / PTQ1_0_G128, motor Ambolio | Apache 2.0 | Hugging Face, 3.921 descargas |
| WaveCut/Ternary-Bonsai-2-27B-NInfer-v3 | 27B | no disponible | `.ninfer` t2_g128_fp16, motor iamwavecut/ninfer-all | no disponible | Hugging Face |
| neroued/Qwen3.8-27B-NInfer | 27B | no disponible | `.ninfer` NVFP4 / groupwise-int, motor Neroued/ninfer | no disponible | Hugging Face |
| ukisai/Swift-Bonsai-2-GGUF (base) | 27B | no disponible | GGUF | no disponible | Hugging Face |

Los tres primeros son artefactos del mismo modelo subyacente con dialectos de cuantizacion y motores distintos, por lo que no son intercambiables entre si. No se dispone de datos de rendimiento de los artefactos alternativos para comparar throughput o perplejidad.

## Limitaciones y advertencias

- Dependencia de un motor especifico: requiere la linea Ambolio/ninfer-4090-windows (v1.0.6 o v1.0.8), cuyos repositorios originales fueron retirados por su autor; la linea persiste solo a traves de forks como 5258MF/ninfer-bonsai2-converter.
- Incompatibilidad de dialecto: no funciona con otros artefactos `.ninfer` del Hub ni con motores alternativos; es necesario verificar el campo `"format"` en el primer MiB del archivo.
- Cobertura idiomatica limitada a ingles y chino; no se declaran otros idiomas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero inherentes a un modelo de lenguaje cuantizado de forma agresiva.
- Perdida de calidad por cuantizacion: aunque el empaquetado no reintroduce perdida, la cuantizacion ternaria original de 1 y 2 bits implica una degradacion respecto al modelo en precision completa que no se cuantifica en los datos disponibles.
- La tasa de aceptacion MTP depende del contenido, no de la GPU: prompts con repeticion literal superan el 96 % de aceptacion y favorecen artificialmente las profundidades de borrador mayores; conviene medir con prompts representativos del propio flujo de trabajo.
- Los valores absolutos de perplejidad dependen del corpus y no son comparables entre si; solo es valida la delta Swift frente a base dentro de un mismo corpus.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base y de los artefactos intermedios no se detallan en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fyb1214/Swift-Bonsai-2-27B-NInfer
- Modelo base GGUF: https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF
- Modelo ternario original: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Herramientas de conversion y notas de compilacion: https://github.com/5258MF/ninfer-bonsai2-converter
- Motor alternativo (otro dialecto): https://github.com/iamwavecut/ninfer-all
- Motor alternativo (otro dialecto): https://github.com/Neroued/ninfer
- Artefacto alternativo: https://huggingface.co/WaveCut/Ternary-Bonsai-2-27B-NInfer-v3
- Artefacto alternativo: https://huggingface.co/neroued/Qwen3.8-27B-NInfer
