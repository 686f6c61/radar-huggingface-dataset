# diffbot/MiMo-V2.6-Flash-RL-FP8KV-W4A8-2x-RTX-PRO-6000

## Resumen

Este repositorio no es un modelo nuevo, sino una receta de servicio (serving recipe) publicada por diffbot para ejecutar el checkpoint oficial **XiaomiMiMo/MiMo-V2.6-Flash-RL** sobre dos tarjetas RTX PRO 6000 Blackwell (sm_120, 96 GB cada una, PCIe sin NVLink) con vLLM en tensor-parallel 2. El modelo subyacente es un transformer de mezcla de expertos (MoE) de 309.000 millones de parámetros totales y 15.000 millones activos, con expertos en MXFP4 y capas densas en FP8, capaz de aceptar texto, imagen, vídeo y audio como entrada.

El problema que resuelve la receta es de rendimiento en inferencia: partiendo del checkpoint oficial sin redistribuir pesos, el autor aplica una caché KV en FP8 (E4M3) para las capas de atención DiffKV, cuantización W4A8-FP8 sobre Marlin para los expertos MoE, tres correcciones al kernel Triton DiffKV de vLLM (split-KV para la fase de verificación del decodificado especulativo, tiles de prefill anchos y K/V en FP8) y un kernel CUDA de atención de prefill específico para las 9 capas globales. El resultado declarado es 2,1× la velocidad de decodificado y 1,6× la de prefill respecto a la imagen stock de vLLM sobre el mismo hardware, manteniendo 256K de contexto y los cuatro modos de entrada.

Es relevante ahora porque demuestra que un modelo MoE de 309B puede servirse con latencia y throughput competitivos en dos GPU de gama profesional sin NVLink, y porque documenta de forma reproducible qué optimizaciones funcionan y cuáles no en la arquitectura sm_120 de Blackwell, con registros de benchmark crudos incluidos en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); capas de atención DiffKV, de las cuales 9 son globales |
| Parámetros totales | 309.000 millones (309B) |
| Parámetros activos | 15.000 millones (15B) |
| Longitud de contexto | 256K tokens en la configuración descrita; pool KV medido de 479K tokens (467K tras el parche de QKV del 2026-09-24) |
| Tipos de cuantización | MXFP4 en expertos, FP8 denso en el checkpoint original; W4A8-FP8 (activaciones FP8 sobre Marlin) y caché KV en FP8 (E4M3) en esta receta |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (checkpoint oficial de Xiaomi; este repositorio no redistribuye los pesos, solo la cuantización en tiempo de ejecución y el código asociado) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 309B de parámetros totales y 15B activos por token. La receta identifica dos tipos de capas de atención dentro de la arquitectura DiffKV: un conjunto mayoritario de capas con atención local o comprimida y 9 capas globales, que reciben un kernel de prefill CUDA hecho a medida en lugar del kernel Triton genérico. Los expertos están almacenados en MXFP4 y las capas densas en FP8 en el checkpoint de Xiaomi. La receta añade decodificación especulativa mediante un drafter DFlash configurado a 3 tokens de borrador (frente a los 7 de la receta del proveedor), lo que en las mediciones eleva el decodificado de 87-94 a 168-175 tok/s en un solo flujo antes de aplicar el resto de optimizaciones.

Sobre el entrenamiento no se aporta información en los materiales disponibles: no se detallan el número de tokens, la composición del dataset ni si hubo RLHF o DPO, más allá del sufijo "RL" en el nombre del checkpoint. La innovación técnica documentada es exclusivamente de inferencia: caché KV en FP8 con el doble de capacidad que bf16, cuantización W4A8 con activaciones FP8 sobre Marlin (+15 % de prefill con la misma calidad declarada), split-KV para el paso de verificación especulativa, un kernel de decodificado MoE para lotes pequeños sobre el layout FP4 de b12x (optativo, supera a Marlin entre 8 y 32 tokens enrutados), el uso del tier de KV en CPU de vLLM para fan-out multiagente y un parche que preserva la escala exacta de los pesos QKV en el cargador fusionado FP8 (sin él, a TP2 se modificaban el 18 % de los pesos Q, ~51 % de los K y entre el 73 % y el 81 % de los V, con un error L2 relativo de 1,3-2,5 %).

## Capacidades

- Generación de texto con razonamiento de contexto largo: pruebas de aguja (needle) superadas a 29K y 336K tokens.
- Entrada multimodal: texto, imagen, vídeo y audio en el mismo modelo (etiqueta de pipeline any-to-any).
- Llamada a herramientas (tool calling / function calling): las pruebas de tool calls pasan con la configuración por defecto.
- Comportamiento agéntico multiturno: una sonda de bucle de herramientas de varios turnos (8 ejecuciones) no mostró fugas de razonamiento ni llamadas repetidas a la misma herramienta.
- Despliegue concurrente tipo fan-out: gestión de 20 agentes × 3 turnos (unos 40K tokens cada uno) sobre 8 ranuras.
- Decodificación especulativa con drafter DFlash, con una longitud media de aceptación de 2,93 a temperatura 1,0 y 3,42 con los ajustes de muestreo por defecto de vLLM.
- Cuantización en tiempo de ejecución con caché KV en FP8, que duplica el tamaño del pool KV respecto a bf16.

## Casos de uso

- Atención al cliente multiturno con contexto largo: el modelo puede mantener conversaciones extensas apoyándose en los 256K tokens de ventana y en un pool KV medido de 479K tokens, lo que permite conservar historiales completos sin truncado agresivo.
- Enrutado de consultas con salida estructurada: al soportar tool calling, encaja como primer salto de un pipeline que decide qué herramienta o API invocar antes de derivar la respuesta a un sistema especializado.
- Orquestación de agentes en fan-out: con el tier KV en CPU de vLLM y la configuración de 8 ranuras, sirve cargas de 20 agentes concurrentes a unos 40K tokens cada uno, con tiempos de 76,8 s para las 20 trayectorias completas en la configuración por defecto.
- Análisis de documentos técnicos con imágenes y audio: al aceptar imagen, vídeo y audio como entrada, puede resumir informes escaneados, transcripciones o grabaciones junto con su texto asociado en una sola pasada.
- Prefill intensivo sobre corpus grandes: con 10.177 tok/s de prefill a 46K tokens y un TTFT de 4,5 s, es adecuado para tareas de resumen o extracción sobre lotes de documentos largos donde el coste dominante es la fase de prefill.
- Generación aumentada por recuperación con contexto muy largo: los 131 tok/s de decodificado sostenidos a 180K tokens permiten respuestas largas sobre bases documentales extensas sin colapso de velocidad.
- Evaluación de calidad tras cuantización: el repositorio incluye scripts de benchmark y una sonda GSM8K-200 que permite verificar que la cuantización W4A8 y la caché KV en FP8 no degradan la precisión antes de llevar el modelo a producción.

## Benchmarks y rendimiento

Datos medidos sobre dos RTX PRO 6000 Blackwell Max-Q limitadas a 300 W, PCIe, TP2, con una carga de 20 agentes y prompts de ~46K tokens en proporción 61:1 de prefill frente a decodificado. GSM8K corresponde a los primeros 200 problemas de test en modo greedy.

| Configuración | Prefill 46K, 1 flujo (tok/s) | TTFT 46K | Decodificado 46K, 1 flujo (tok/s) | 46K, 4 flujos: prefill / decodificado | 100K, 4 flujos: prefill / decodificado | Fan-out 20 agentes (s) | GSM8K-200 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Base (imagen stock de vLLM) | 6.230 | 7,4 s | 87-94 | 12.588 / 263 | – | 346 | 98,0 % |
| + split-KV para el paso de verificación | 6.130 | 7,5 s | 156-164 | 12.340 / 335 | – | 344 | 98,5 % |
| + 3 tokens de borrador en lugar de 7 | 6.160 | 7,4 s | 168-175 | 12.320 / 386 | – | – | – |
| + tiles de prefill anchos, tier KV en CPU | 8.460 | 5,4 s | 158-175 | 16.873 / 385 | – | 97,9 | 98,5 % |
| + todos los modos de entrada, caché KV en FP8 | 8.210 | 5,6 s | 180-188 | 16.413 / 397 | – | 92,0 | 98,5 % |
| + un programa por verificación completa | 8.337 | 5,5 s | 187-191 | 16.608 / 412 | 13.334 / 348 | 92,3 | 99,0 % |
| + MoE W4A8-FP8 (Marlin) | 9.532 | 4,8 s | 184-199 | 18.964 / 411 | 14.757 / 367 | 80,7 | 98,5 % |
| + kernel de atención de prefill propio (por defecto) | **10.177** | **4,5 s** | **189-193** | **20.514 / 416** | **16.840 / 366** | **76,8** | 98,0 % |

El decodificado se mantiene plano entre 2K y 46K de contexto y cae a 131 tok/s a 180K. Optimizaciones medidas que **no** ayudaron en este hardware: MoE MXFP4 de b12x en solitario (+15 % de prefill, −45 % de decodificado a cuatro flujos), MTP en lugar de DFlash, trozos de prefill de 8.192 tokens (el pool KV pasa de 467K a 293K), all-reduce propio o de FlashInfer (las reducciones de 32 MB están limitadas por PCIe; NCCL ya está en el suelo del enlace), kernels de atención fusionada 192×128 para SM120 de FlashInfer, FP8 QKᵀ en el kernel de atención (−8 % de tiempo, 7× el error) y 2 CTA/SM para ese kernel (spills).

## Requisitos de hardware

- Configuración medida: 2 × NVIDIA RTX PRO 6000 Blackwell (sm_120), 96 GB cada una, 192 GB de VRAM total, conexión PCIe sin NVLink, con tensor-parallel 2.
- Límite de potencia usado en los benchmarks: 300 W por tarjeta (variante Max-Q); durante las ejecuciones hubo un proceso auxiliar residente de ~2,5 GB por GPU.
- No se documenta el despliegue en GPU de consumo: el requisito de arquitectura sm_120 y de ~192 GB agregados descarta las RTX de gama consumer de 24-48 GB.
- Pool KV: 479K tokens con caché FP8 y todos los codificadores cargados en la versión inicial; 467K tras el parche de layout QKV del 2026-09-24.
- Despliegue: vLLM con tensor-parallel 2 sobre la imagen `vllm/vllm-openai:mimo-v26-x86_64-cu130`, con parches propios, kernels CUDA y Triton incluidos en `recipe/`. No se mencionan llama.cpp, Ollama ni TGI para esta receta.
- Throughput y latencia medidos: 10.177 tok/s de prefill a 46K en un flujo, TTFT de 4,5 s, 189-193 tok/s de decodificado en un flujo, 20.514 / 416 tok/s en cuatro flujos a 46K y 16.840 / 366 tok/s en cuatro flujos a 100K.

## Comparativa con modelos similares

La información disponible no incluye comparaciones con otras familias de modelos. La única comparación documentada es contra el mismo checkpoint servido con la imagen stock de vLLM y los ajustes de la receta del proveedor (Marlin W4A16, DFlash con 7 tokens de borrador, solo texto, KV en bf16, 262K de contexto):

| Aspecto | Configuración stock de vLLM | Receta de diffbot |
|---|---|---|
| Prefill 46K, 1 flujo | 6.230 tok/s | 10.177 tok/s (1,63×) |
| TTFT 46K | 7,4 s | 4,5 s |
| Decodificado 46K, 1 flujo | 87-94 tok/s | 189-193 tok/s (≈2,1×) |
| Fan-out 20 agentes | 346 s | 76,8 s |
| Caché KV | bf16 | FP8 E4M3 (el doble de capacidad) |
| Modos de entrada | Solo texto | Texto, imagen, vídeo y audio |
| GSM8K-200 | 98,0 % | 98,0 % |
| Licencia | MIT | MIT |

Comparativa con otros modelos de parámetros similares: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no contiene pesos: es una receta de cuantización en tiempo de ejecución y el código asociado. Los pesos siguen siendo el checkpoint oficial de Xiaomi, sujeto a sus propios términos además de la licencia MIT.
- Dependencia fuerte del hardware: los kernels y parches están escritos para sm_120 (Blackwell) y para un escenario PCIe sin NVLink con TP2; su comportamiento en otras arquitecturas o topologías no está validado.
- El rendimiento declarado se midió con tarjetas limitadas a 300 W y con un proceso auxiliar residente de ~2,5 GB por GPU, condiciones que pueden no reproducirse en otros entornos.
- Cambio de comportamiento por defecto en el muestreo: `serve.sh` usa `--generation-config auto`, de modo que las peticiones sin parámetros de muestreo reciben temperatura 1,0 y top_p 0,95 del checkpoint. Los clientes que no envían parámetros ven una aceptación especulativa menor (longitud media de aceptación 2,93 frente a 3,42). Los ajustes casi greedy de vLLM provocaban, según los usuarios, repetición de la misma llamada a herramienta en entornos agénticos.
- La cuantización W4A8-FP8 y la caché KV en FP8 pueden introducir degradación de calidad no capturada por GSM8K-200; la propia receta recomienda verificar con las sondas incluidas antes de desplegar.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible ni evaluaciones de sesgo, ni comportamiento del modelo en dominios sensibles.
- Idiomas soportados: no disponible. No hay evaluación multilingüe en los materiales aportados.
- Compatibilidad de versiones: parte de las optimizaciones dependen de las versiones 0.6.18/0.7.0 de vLLM y de un parche portado de una propuesta externa; actualizar vLLM puede romper los parches.
- El parche de QKV exacto reduce el pool KV de 479K a 467K tokens por el layout con relleno, un coste asumido a cambio de preservar las escalas originales de los pesos.
- Los benchmarks publicados son del propio autor del repositorio; no se aportan evaluaciones independientes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/diffbot/MiMo-V2.6-Flash-RL-FP8KV-W4A8-2x-RTX-PRO-6000
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Imagen de contenedor de referencia: `vllm/vllm-openai:mimo-v26-x86_64-cu130`
- Receta reproducible (build de imagen, launcher, parches de vLLM, kernels, tests y scripts de benchmark): directorio `recipe/`, con instrucciones en `recipe/README.md`
- Registros crudos de benchmark: directorio `results/` (incluye `results/fix0924-old.txt` y `results/fix0924-new.txt`)
- Scripts de benchmark citados: `recipe/bench/bench-sbs.py`, `recipe/bench/bench-fanout.py`, `recipe/bench/test-mimo-agentic.py`
- Auditoría del cargador QKV exacto: `recipe/patches/test_mimo_exact_qkv_audit.py` (puerto del cambio local-inference-lab/vllm #874; `VLLM_MIMO_EXACT_QKV=0` restaura el cargador anterior)
