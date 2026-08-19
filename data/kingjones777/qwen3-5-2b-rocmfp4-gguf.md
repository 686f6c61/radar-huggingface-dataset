# kingjones777/Qwen3.5-2B-ROCmFP4-GGUF

## Resumen

`kingjones777/Qwen3.5-2B-ROCmFP4-GGUF` es la primera cuantización en formato GGUF con los nuevos formatos ROCmFP4 y ROCmFPX del modelo base `Qwen/Qwen3.5-2B`, desarrollada por el usuario kingjones777. Está pensada exclusivamente para hardware AMD con arquitectura Strix Halo (gfx1151), como el Ryzen AI MAX+ 395 con memoria unificada de 128 GB. El modelo base es un transformer denso de aproximadamente 1.88 mil millones de parámetros (1.881.825.088) con capacidades multimodales (imagen y texto) y una longitud de contexto nativa de 262.144 tokens, según la ficha de LM Studio.

La relevancia de esta ficha radica en que ofrece cuantizaciones de 4 y 8 bits optimizadas para la pila ROCmFPX, un fork de llama.cpp que aprovecha las instrucciones FP4/FPX de las GPUs RDNA 4. Incluye cuatro variantes con diferentes tamaños y velocidades de decodificación, todas verificadas en hardware real. Sin embargo, requiere un build específico de llama.cpp con soporte ROCmFPX y no es compatible con el llama.cpp estándar, Ollama o LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-lenguaje) |
| Parametros totales | 1.881.825.088 (~1.88B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo, segun LM Studio) |
| Tipos de cuantizacion | Q4_0_ROCMFP4, Q6_0_ROCMFPX, Q8_0_ROCMFPX, Q8_0_ROCMFPX_AGENT (ftype 102, 114, 111, 115) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con mmproj-BF16.gguf para vision) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.5-2B` es un transformer denso con una fundacion unificada de vision y lenguaje, entrenado mediante fusion temprana sobre billones de tokens multimodales, segun el blog oficial de Qwen. No se dispone de detalles adicionales sobre el dataset de entrenamiento, tecnicas de RLHF/DPO o innovaciones especificas en la informacion proporcionada. La cuantizacion ROCmFP4/ROCmFPX se aplica directamente sobre el GGUF BF16 del modelo base sin reconversion, y los tensores de embedding se protegen mediante `--token-embedding-type` (el modelo tiene embeddings atados, por lo que no existe `output.weight`). Se incluye un proyector multimodal (`mmproj-BF16.gguf`) para la entrada de imagenes, que requiere desactivar la atencion flash (`-fa off`).

## Capacidades

- Generacion de texto, razonamiento y codigo, heredadas del modelo base Qwen3.5-2B.
- Comprension de imagenes (pipeline image-text-to-text), gracias al proyector multimodal incluido.
- Soporte de agentes: las variantes etiquetadas como "AGENT" estan optimizadas para aumentar la aceptacion de drafts especulativos, aunque el modelo base no incluye un drafter nativo.
- Capacidades multilingues: no confirmadas en la informacion disponible.
- No se menciona soporte explicito de tool calling o function calling en la documentacion proporcionada.

## Casos de uso

- Inferencia local en equipos AMD Strix Halo: el modelo esta disenado para ejecutarse en APUs como el Ryzen AI MAX+ 395 con memoria unificada, aprovechando al maximo el ancho de banda y las instrucciones FP4/FPX.
- Asistentes conversacionales con entrada de imagenes: gracias al proyector multimodal, puede responder preguntas sobre fotografias o diagramas en tiempo real.
- Desarrollo y prueba de aplicaciones de IA en hardware AMD sin GPU dedicada: las cuantizaciones de 4 bits permiten ejecutar el modelo con baja huella de memoria (1.12 GiB) y alta velocidad (106 t/s).
- Prototipado de agentes con razonamiento multi-paso: las variantes AGENT ofrecen configuraciones alternativas para entornos donde se priorice la coherencia en tareas de agente, aunque sin drafter la ganancia es limitada.
- Evaluacion de la pila ROCmFPX: sirve como banco de pruebas para desarrolladores que quieran validar el rendimiento de la cuantizacion FP4 en RDNA 4.
- Integracion en pipelines de vision-lenguaje en entornos con restricciones de VRAM: al ser un modelo de 2B, cabe en sistemas con poca memoria dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos medidos son las velocidades de decodificacion en hardware Strix Halo (Ryzen AI MAX+ 395, 128 GB unificados, con `-ngl 999 -c 4096 -fa on -fit off`, 300 tokens, mediana de 3 ejecuciones):

| Variante | Tamano | Velocidad de decodificacion (t/s) |
|---|---|---|
| Q4_0_ROCMFP4_COHERENT (ftype 102) | 1.12 GiB | 106.44 |
| Q6_0_ROCMFPX_AGENT (ftype 114) | 1.68 GiB | 75.05 |
| Q8_0_ROCMFPX (ftype 111) | 1.83 GiB | 77.38 |
| Q8_0_ROCMFPX_AGENT (ftype 115) | 1.85 GiB | 76.77 |

La variante de 4 bits es la mas rapida y pequena, con la misma correccion en las pruebas de salida (3/3) que las de 8 bits.

## Requisitos de hardware

- Hardware objetivo: AMD Strix Halo (gfx1151), especificamente Ryzen AI MAX+ 395 con 128 GB de memoria unificada. No se garantiza compatibilidad con otras GPUs AMD o NVIDIA.
- VRAM estimada: entre 1.12 GiB (Q4_0) y 1.85 GiB (Q8_0_AGENT), mas el proyector multimodal (~1 GB adicional, no especificado).
- GPU recomendada: APU Strix Halo integrada (Radeon 8060S) o cualquier GPU RDNA 4 compatible con ROCmFPX.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) porque requiere el fork ROCmFPX de llama.cpp, que solo soporta hardware AMD con instrucciones FP4/FPX.
- Opciones de despliegue: exclusivamente mediante el fork ROCmFPX de llama.cpp (https://github.com/charlie12345/ROCmFPX). No compatible con llama.cpp estandar, Ollama, LM Studio ni TGI.
- Latencia y throughput: medidos en el hardware de referencia, con velocidades de 75-106 t/s para 300 tokens de generacion.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otras cuantizaciones del mismo modelo (por ejemplo, GGUF estandar Q4_K_M o Q8_0) en la informacion proporcionada. Como referencia conceptual, este modelo se diferencia de las cuantizaciones GGUF convencionales por su soporte especifico para ROCmFPX, que permite explotar las instrucciones FP4 de RDNA 4, algo que las cuantizaciones estandar no ofrecen. No obstante, requiere un stack de software especializado y no es portable a otros entornos.

## Limitaciones y advertencias

- Requiere un build de llama.cpp con soporte ROCmFPX; no cargara en software estandar (llama.cpp vanilla, Ollama, LM Studio).
- Hardware restringido: solo funciona en AMD Strix Halo (gfx1151) o GPUs RDNA 4 compatibles; no es util en equipos NVIDIA o AMD anteriores.
- El modelo base no incluye un drafter especulativo, por lo que las variantes "AGENT" no ofrecen ventaja real en ese aspecto; el autor las incluye por completitud.
- La entrada de imagenes requiere desactivar la atencion flash (`-fa off`), lo que puede reducir el rendimiento en tareas multimodales.
- Sesgos y alucinaciones: no se han documentado especificamente para esta cuantizacion; se heredan del modelo base Qwen3.5-2B, que no ha sido evaluado en este repositorio.
- La licencia Apache-2.0 permite uso comercial, pero el stack ROCmFPX es un fork de codigo abierto con su propia licencia (no especificada en la informacion).
- No hay garantias de soporte o mantenimiento; el repositorio tiene 0 descargas y 0 likes, lo que indica un proyecto muy reciente y sin validacion comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Qwen3.5-2B-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Blog oficial de Qwen sobre Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Ficha de Qwen3.5-2B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-2b
