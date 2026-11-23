# sairaph-official/Qwen3-1.7B-c421cc3-int8

## Resumen

Qwen3-1.7B-c421cc3-int8 es un espejo (mirror) del repositorio `litert-community/Qwen3-1.7B`, publicado por sairaph-official para su uso en la aplicacion LLM Server. No se trata de un modelo entrenado por este autor, sino de una copia byte a byte del artefacto `Qwen3_1.7B.litertlm` del commit upstream `c421cc3`, derivado a su vez del modelo base Qwen/Qwen3-1.7B de Alibaba Qwen. El formato es LiteRT-LM, el runtime de inferencia on-device de Google AI Edge, pensado para ejecutar modelos en moviles y dispositivos de borde.

El artefacto contiene una cuantizacion INT8 dinamica (pesos INT8 por canal, activaciones FP32) con operadores compuestos para la ruta GPU de LiteRT-LM (RoPE, QKV fusionado, proyecciones Gate/Up fusionadas) y pesos externos al grafo. El contexto por defecto en metadatos es de 4.096 tokens, aunque el export se genero con una cache de 32.768 tokens. El modelo base Qwen3-1.7B es un transformer denso de 1.700 millones de parametros, con soporte de modo thinking y tool calling, y licencia Apache 2.0.

La relevancia de este repositorio es practica: permite desplegar un modelo de 1.7B en Android (via Edge Gallery o LiteRT-LM CLI) con un rendimiento medido de 2.064 tok/s en prefill y 29,7 tok/s en decodificacion sobre un Galaxy S26 con GPU OpenCL. Es una opcion para inferencia local en dispositivos sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), exportado a LiteRT-LM con operadores compuestos GPU |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens por defecto en metadatos; cache exportada de 32.768 tokens |
| Tipos de cuantizacion | INT8 dinamico (pesos INT8 por canal, activaciones FP32); variante alternativa INT4 block-32 disponible en el repo upstream |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM, pesos externos en seccion TFLiteWeights) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-1.7B, un transformer denso de la familia Qwen3. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens ni las fases de alineacion (RLHF/DPO) del modelo base; esos datos corresponden a la model card de Qwen/Qwen3-1.7B, no incluida en la informacion proporcionada. Lo que si se documenta es el proceso de conversion: el artefacto se exporto mediante LiteRT Torch (`export_hf` en el commit `0a81bf6f3`) con `--apply_gpu_composites=True`, aplicando cuantizacion con AI Edge Quantizer.

La innovacion tecnica principal esta en el empaquetado para borde: RMSNorm, QK-norm con RoPE, atencion, SwiGLU y la actualizacion de la cache KV se implementan como operadores compuestos para la ruta GPU de LiteRT-LM, y las proyecciones QKV y Gate/Up estan fusionadas. El export se realizo con longitudes de prefill de 128 y 1.024 tokens y una cache de 32.768 tokens. Los pesos se almacenan fuera del grafo (external weights) para reducir el tamano del modelo cargado. Incorpora la configuracion oficial qwen3 de LiteRT-LM: el modo thinking esta activo por defecto salvo que se pase `enable_thinking=false`, el razonamiento se emite por un canal separado y las llamadas a herramientas las parsea el propio runtime.

## Capacidades

- Generacion de texto en ingles con modo thinking activable o desactivable.
- Razonamiento multi-paso mediante el canal de pensamiento separado del runtime.
- Tool calling / function calling parseado por LiteRT-LM.
- Ejecucion on-device en Android (GPU OpenCL o CPU) y en escritorio via CLI.
- Inferencia con contexto de hasta 4.096 tokens por defecto (cache de hasta 32.768 tokens en el export).
- Compatibilidad con la app Edge Gallery de Google AI Edge para importacion directa desde Hugging Face.
- Capacidades multilingues: los metadatos solo declaran ingles; no hay evidencia de soporte de otros idiomas en este artefacto.

## Casos de uso

- Asistente de texto offline en Android: integrado via Edge Gallery o LiteRT-LM, el modelo funciona sin conexion en un movil de gama alta, con 29,7 tok/s de decodificacion medidos en Galaxy S26, suficiente para respuestas conversacionales interactivas.
- Prototipado de agentes locales con tool calling: el runtime parsea las llamadas a herramientas y separa el razonamiento en un canal propio, lo que permite construir flujos de agente multi-paso en el dispositivo sin backend.
- Generacion de texto en aplicaciones de borde con requisitos de privacidad: al ejecutarse localmente, los prompts no salen del dispositivo, adecuado para entornos con datos sensibles.
- Pruebas de rendimiento y benchmarking de LiteRT-LM: el artefacto incluye metricas de prefill y decodificacion por dispositivo, util para evaluar la ruta GPU frente a CPU en hardware concreto.
- Educacion e investigacion sobre cuantizacion: la variante INT8 con pesos externos y operadores compuestos sirve como caso de estudio de exportacion LiteRT Torch y AI Edge Quantizer.
- Chat de proposito general en ingles en dispositivos con recursos limitados: con 1,8 GB de repo y 1.674 MiB de artefacto, cabe en almacenamiento movil y se ejecuta con un pico de RSS de aproximadamente 3,2-3,5 GiB en CPU segun las mediciones del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos numericos son mediciones de inferencia del autor:

| Medicion | Valor |
|---|---|
| Prefill (Galaxy S26, GPU OpenCL, LiteRT-LM 0.19.0, 1.024 tokens) | 2.064 tok/s |
| Decodificacion (Galaxy S26, GPU OpenCL, LiteRT-LM 0.19.0) | 29,7 tok/s |
| Prefill variante INT4 (misma prueba) | 1.187 tok/s |
| Decodificacion variante INT4 (misma prueba) | 38,8 tok/s |
| Pico RSS CPU (Pixel 8a, prompt 1.355 tokens, 256 tokens decode, cache 2.048) | 3.254-3.267 MiB |
| Pico RSS CPU (Galaxy S26, misma prueba) | 3.408-3.460 MiB |

## Requisitos de hardware

- VRAM/RAM: el artefacto ocupa 1.674 MiB; en CPU el pico de RSS medido es de aproximadamente 3,2-3,5 GiB con contexto de 2.048 tokens.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; las mediciones se realizaron en GPU integrada de movil (Galaxy S26 con OpenCL) y en CPU de Pixel 8a y Galaxy S26.
- Cabe en dispositivos moviles de gama alta; no se documenta su ejecucion en GPU de consumo de escritorio (RTX 4090, etc.).
- Opciones de despliegue: LiteRT-LM (CLI `litert-lm run`), app Edge Gallery de Google AI Edge (Android).
- Versiones requeridas: LiteRT-LM 0.19.0 o superior para la ruta GPU; 0.18.0 o superior para la ruta CPU. En LiteRT-LM 0.18.1 la ruta GPU falla por incompatibilidad de los kernels compuestos.
- Latencia y throughput: ver tabla de benchmarks (29,7 tok/s de decodificacion en GPU movil).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-c421cc3-int8 (este) | 1,7B | 4.096 (cache 32.768) | litertlm INT8 | Apache 2.0 | Optimizado para GPU movil LiteRT-LM |
| Qwen3-1.7B_dynamic_wi4b32_afp32 | 1,7B | 4.096 | litertlm INT4 block-32 | Apache 2.0 | Variante INT4 del mismo repo upstream; 38,8 tok/s de decodificacion |
| Qwen/Qwen3-1.7B (original) | 1,7B | no disponible en la informacion | safetensors | Apache 2.0 | Modelo base sin cuantizar; requiere runtime estandar (vLLM, llama.cpp) |

No se dispone de datos de benchmarks de calidad para establecer una comparacion de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Es un espejo no modificado de un repositorio de terceros; el mantenimiento y las actualizaciones dependen del upstream `litert-community/Qwen3-1.7B`.
- Solo se declara soporte de ingles en los metadatos; el rendimiento en castellano no esta verificado.
- La ruta GPU requiere LiteRT-LM 0.19.0 o superior; con 0.18.1 los kernels compuestos no compilan y el modelo falla.
- Las builds de Android v0.18.0 y v0.18.1 se cuelgan al cargar archivos con pesos externos, segun las notas del autor.
- El contexto por defecto es de 4.096 tokens; prompts mas largos requieren configuracion explicita y aumentan el consumo de memoria (pico de RSS superior a 3 GiB en CPU con 2.048 tokens de cache).
- Riesgo de alucinacion inherente a modelos de 1,7B; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el aviso de licencia del espejo se anadio manualmente (el repo upstream no incluia archivo de licencia).
- Sin descargas ni likes registrados en el momento de la consulta; ecosistema de usuarios practicamente inexistente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sairaph-official/Qwen3-1.7B-c421cc3-int8
- Repositorio upstream LiteRT-LM: https://huggingface.co/litert-community/Qwen3-1.7B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- App Edge Gallery (Google Play): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Releases de Edge Gallery (GitHub): https://github.com/google-ai-edge/gallery/releases
