# jayleaton/SenseNova-Loop-9B-EXL3-5.0bpw

## Resumen

SenseNova-Loop-9B-EXL3-5.0bpw es una cuantización EXL3 a 5,0 bits por peso del modelo SenseNova-Loop-9B, desarrollado originalmente por SenseNova (OpenSenseNova). La publica el usuario jayleaton como parte de una receta reproducible ("TensorFold") que incluye los parches de motor necesarios para servir el modelo. El objetivo es empaquetar un modelo de arquitectura no convencional en un tamaño que quepa en una GPU RTX de 16 GB, manteniendo una fidelidad alta respecto al original en BF16.

El modelo base es un transformer con bucles ("looped transformer"): las capas físicas 4 a 27 se ejecutan dos veces, produciendo 56 ejecuciones a partir de 32 conjuntos de pesos, todo ello envuelto en un mHC (multi-head communication) de dos flujos. Esta arquitectura no es compatible con transformers, vLLM, llama.cpp, mlx-lm ni exllamav3 estándar; requiere el motor TensorFold con la serie de parches de esta receta.

El repositorio tiene 7,17 GB (6,68 GiB) y contiene 3.568.716.800 parámetros según los safetensors. Es una cuantización experimental, pensada para inferencia de solo texto en tarjetas RTX de 16 GB (probada en RTX 5070 Ti con WSL2) y validada también en DGX Spark con un límite de memoria de 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer), decoder con mHC de dos flujos; capas físicas 4-27 ejecutadas dos veces (56 ejecuciones desde 32 conjuntos de pesos) |
| Parametros totales | 3.568.716.800 (según safetensors del repo cuantizado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 212.992 tokens configurados en el script de servicio; ventana máxima medida con KV fp8: 286.720 tokens en RTX 5070 Ti 16 GB |
| Tipos de cuantizacion | EXL3 a 5,0 bpw (cuerpo), cabeza de salida a 6 bits, embeddings en BF16; routers mHC y puertas de bucle en fp32 sin cuantizar; codebook `mul1` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, librería exllamav3 con código personalizado) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea un decoder transformer con bucles: un subconjunto de capas físicas (4 a 27) se recorre dos veces, de modo que 32 conjuntos de pesos generan 56 ejecuciones efectivas. Sobre esta estructura se añade un mHC (multi-head communication) de dos flujos que combina las representaciones. La model card del autor de la cuantización indica que el forward del modelo base deriva de `qwen3_5` pero incorpora el bucle y el mHC, y que la arquitectura registrada es `sensenova_loop`. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

El proceso de cuantización es relevante técnicamente: como exllamav3 no puede trazar el modelo (arquitectura no registrada y forward sin bucle ni mHC), la receta captura matrices de Hessian del modelo real con transformers, una por peso único sumada sobre ambas visitas (250 filas × 2.048 tokens del conjunto de calibración por defecto de exllamav3), y luego aplica el cuantizador propio de exllamav3 1.6.7 con codebook `mul1`, escalas de salida siempre activas, cuerpo a 5,0 bpw, cabeza a 6 bpw y embedding en BF16. Los 97 tensores fp32 correspondientes a routers mHC y puertas de bucle se adjuntan sin cuantizar en `model-sensenova-extras.safetensors`.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento de propósito general heredado del modelo base; no se documentan modos de "thinking" específicos en la información disponible.
- Soporte de tool calling / function calling a través del servidor TensorFold: `tool_choice: "required"`, función con nombre y `response_format` requieren `libtfgrammar.so` junto al servidor. El autor indica que las llamadas a herramientas no se han probado ("tool calls: not run").
- Ventana de contexto muy amplia: 212.992 tokens configurados; hasta 286.720 tokens de ventana con KV en fp8 en una RTX 5070 Ti de 16 GB.
- Solo texto: los packs no incluyen la torre de visión del modelo base.
- Capacidades multilingües: no disponible (no se documentan idiomas).

## Casos de uso

- Procesamiento de documentos largos en local: con 212.992 tokens de contexto configurados y hasta 286.720 con KV fp8, permite analizar contratos, informes o codebases completos en una única pasada sobre una GPU de 16 GB.
- Asistente conversacional autoalojado: el pipeline `conversational` y el contexto largo permiten mantener sesiones multi-turno con historial extenso; el servidor admite `--parallel 1` y caché de prompt configurable.
- Extracción estructurada de información: el soporte de `response_format` y gramáticas (mediante `libtfgrammar.so`) permite forzar salidas JSON o esquemas concretos en pipelines de datos.
- Integración de tool calling en flujos automatizados: `tool_choice: "required"` y funciones con nombre habilitan agentes que invocan APIs, aunque el autor advierte que las llamadas a herramientas no se han validado en esta cuantización.
- Prototipado e investigación de arquitecturas con bucles: al ser una de las pocas implementaciones servibles de un looped transformer cuantizado, sirve para estudiar el comportamiento de este tipo de arquitecturas en hardware de consumo.
- Despliegue en estaciones de trabajo con una sola RTX de 16 GB: el pack está dimensionado para ese perfil (pico de 9,32 GiB con ventana de 32k y KV BF16), lo que permite inferencia local sin servidores multi-GPU.
- Evaluación comparativa de cuantizaciones: junto con los packs de 4,0 y 6,0 bpw del mismo autor, permite medir el compromiso entre tamaño, fidelidad (cosine/top-1 frente a BF16) y ventana de contexto disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización y de rendimiento de inferencia:

| Metrica | Valor |
|---|---|
| Cosine / top-1 frente a BF16 (298 posiciones, RTX 5070 Ti) | 0,99779 / 290 |
| Cosine / top-1 frente a BF16 (249 posiciones, DGX Spark) | 0,99807 / 244 |
| Decode a 4k / 8k / 32k (RTX 5070 Ti, WSL2, sin drafts) | 50,5 / 51,2 / 44,0 tok/s |
| Prefill a 4k / 8k / 32k (RTX 5070 Ti, WSL2) | 1.950 / 1.885 / 1.789 tok/s |
| Ventana máxima con KV fp8 (RTX 5070 Ti 16 GB) | 286.720 tokens |
| Pico de memoria a 32k con KV BF16 (RTX 5070 Ti) | 9,32 GiB |
| Pico de memoria a 32k con KV BF16 (DGX Spark) | 9,31 GiB |
| Ventana máxima con KV fp8, límite 15,0 / 14,5 GiB (DGX Spark) | 270.336 / 253.952 tokens |
| Llamadas a herramientas | no ejecutadas |

Para contexto, el pack de 4,0 bpw obtiene 0,99393 / 236 y el de 6,0 bpw 0,99937 / 244; MLX 8-bit alcanza 0,99975 / 246.

## Requisitos de hardware

- VRAM estimada: el pack ocupa 7,17 GB en disco; el pico medido es de 9,32 GiB con ventana de 32k y KV BF16 en RTX 5070 Ti, y 9,31 GiB en DGX Spark. Con KV fp8 cabe una ventana de hasta 286.720 tokens en 16 GB.
- GPU probadas: RTX 5070 Ti 16 GB (Blackwell, `sm_120`) bajo WSL2 Ubuntu 24.04, y DGX Spark (GB10) con límite de memoria de 16 GB.
- Otras tarjetas de 16 GB y Windows nativo no están probados según el autor.
- Cabe en GPU de consumo de 16 GB (RTX 5070 Ti); no se documenta compatibilidad con GPUs de menos memoria.
- Despliegue: exclusivamente mediante el motor TensorFold con los parches de la receta (serie `patches/cuda` 0001-0022 y `patches/rtx` 0001-0002). No es servible con transformers, vLLM, llama.cpp, mlx-lm ni exllamav3 estándar.
- Requisitos de compilación: CUDA 13 toolkit y Zig 0.17.0; en Windows, dentro de WSL2. El pack debe residir en ext4 bajo el directorio home, nunca en `/mnt/c`.
- Throughput medido en RTX 5070 Ti: 50,5 tok/s de decode a 4k, 44,0 tok/s a 32k; prefill de 1.950 tok/s a 4k y 1.789 tok/s a 32k. El autor advierte que el decode varía con la carga del escritorio y la frecuencia sostenida de la tarjeta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-EXL3-5.0bpw | 3.568.716.800 | 212.992 configurados; 286.720 medidos con KV fp8 | EXL3 safetensors, TensorFold parcheado | Apache 2.0 | Solo texto; experimental |
| SenseNova-Loop-9B-EXL3-4.0bpw (mismo autor) | no disponible en la información | no disponible | EXL3 safetensors, TensorFold parcheado | Apache 2.0 | 6,31 GB; cosine 0,99393; ventana fp8 294.912 tokens a 15,0 GiB |
| SenseNova-Loop-9B-EXL3-6.0bpw (mismo autor) | no disponible en la información | no disponible | EXL3 safetensors, TensorFold parcheado | Apache 2.0 | 8,29 GB; cosine 0,99937; ventana fp8 229.376 tokens a 15,0 GiB |
| SenseNova-Loop-9B original (BF16) | no disponible | no disponible | transformers con código de referencia | Apache 2.0 | Incluye torre de visión; referencia de fidelidad para las cuantizaciones |

No se dispone de datos de benchmarks de tareas para comparar con modelos de otras familias y mismo tamaño.

## Limitaciones y advertencias

- Experimental: el autor etiqueta explícitamente el pack como experimental y remite a la página de problemas conocidos de la receta antes de usarlo en producción.
- Compatibilidad restringida: no funciona con transformers, vLLM, llama.cpp, mlx-lm ni exllamav3 estándar; requiere compilar TensorFold con los parches de la receta, CUDA 13 y Zig 0.17.0.
- Solo texto: los packs no incluyen la torre de visión del modelo base.
- Tool calling no validado: el autor indica "tool calls: not run"; el soporte de gramáticas requiere `libtfgrammar.so` junto al servidor.
- Idiomas soportados no documentados; no se puede confirmar cobertura multilingüe.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; aplican los del modelo base SenseNova-Loop-9B, no evaluados aquí.
- Licencia Apache 2.0, que permite uso comercial, pero el estado experimental y la dependencia de un motor parcheado añaden riesgo operativo en producción.
- Rendimiento dependiente del hardware: solo probado en RTX 5070 Ti 16 GB con WSL2 y en DGX Spark; otras tarjetas de 16 GB y Windows nativo no están probados. El decode varía con la carga del escritorio y la frecuencia sostenida.
- En WSL2 el pack debe estar en ext4 bajo el directorio home; colocarlo en `/mnt/c` no está soportado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jayleaton/SenseNova-Loop-9B-EXL3-5.0bpw
- Pack de 4,0 bpw: https://huggingface.co/jayleaton/SenseNova-Loop-9B-EXL3-4.0bpw
- Pack de 6,0 bpw: https://huggingface.co/jayleaton/SenseNova-Loop-9B-EXL3-6.0bpw
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Repositorio del modelo base en GitHub: https://github.com/OpenSenseNova/SenseNova-Loop
- Receta TensorFold (jayleaton): https://github.com/jayleaton/sensenova-loop9b-tensorfold
- Problemas conocidos de la receta: https://github.com/jayleaton/sensenova-loop9b-tensorfold/blob/main/docs/KNOWN-ISSUES.md
- Página RTX de la receta (instrucciones WSL2 y servicio): https://github.com/jayleaton/sensenova-loop9b-tensorfold/blob/main/docs/RTX.md
- Parches CUDA: https://github.com/jayleaton/sensenova-loop9b-tensorfold/tree/main/patches/cuda
- Parches RTX: https://github.com/jayleaton/sensenova-loop9b-tensorfold/tree/main/patches/rtx
- Motor TensorFold: https://github.com/ashhart/TensorFold
- Commit del motor probado: https://github.com/ashhart/TensorFold/commit/038e4a27872eaa018adc67b1b5ddffd16820c498
