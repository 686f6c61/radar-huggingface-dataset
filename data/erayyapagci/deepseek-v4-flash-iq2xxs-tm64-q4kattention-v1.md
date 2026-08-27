# erayyapagci/DeepSeek-V4-Flash-IQ2XXS-TM64-Q4KAttention-v1

## Resumen

Este repositorio contiene una versión cuantizada de DeepSeek-V4-Flash, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) de 284.000 millones de parámetros (13.000 millones activos) desarrollado por DeepSeek, con una ventana de contexto de hasta un millón de tokens. La contribución del autor, erayyapagci, no es la cuantización en sí —los quants base fueron construidos por antirez y Ralii—, sino un **relayout alternativo de tensores GGUF denominado TM64** (Tile-major BM64) aplicado a los tensores expert IQ2_XXS, junto con los kernels Vulkan que lo consumen. El objetivo es mejorar el rendimiento de inferencia en GPUs AMD RDNA3 mediante un direccionamiento más eficiente de los bloques de cuantización.

El paquete incluye dos archivos GGUF: el modelo principal (~79 GB) con los expertos reordenados en TM64 y la capa de atención requantizada a Q4_K, y un draft DSpark (~10 GB) para decodificación especulativa. El resultado, medido por el autor, es un aumento del rendimiento de prompt del 14,86 % (de 76,0 a 87,3 tokens/s) y del 2,50 % en decodificación (de 19,97 a 20,47 tokens/s) en comparación con el layout estándar, manteniendo hashes de salida idénticos. Es una pieza de ingeniería de inferencia muy especializada, pensada para un público que busca exprimir el máximo rendimiento de hardware AMD con Vulkan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) - DeepSeek-V4-Flash |
| Parametros totales | 284.000 millones (segun catalogo de Microsoft Foundry) |
| Parametros activos | 13.000 millones |
| Longitud de contexto | Hasta 409.600 tokens por slot (variantes multi-slot hasta 1.228.800) |
| Tipos de cuantizacion | IQ2_XXS / Q2_K (expertos enrutados), Q4_K (atencion), MXFP4 + Q4_K_M selectivo (dense/draft) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se aplica la licencia del modelo original, segun la model card) |
| Formato de pesos | GGUF (dos archivos: modelo principal y draft) |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash es un modelo MoE con 284.000 millones de parámetros totales y 13.000 millones activos por token, diseñado por DeepSeek para ofrecer un equilibrio entre capacidad y eficiencia. El modelo base soporta un contexto de un millón de tokens. Este repositorio no contiene el modelo original, sino una cuantización GGUF del mismo: los expertos enrutados se cuantizan a IQ2_XXS/Q2_K, la capa de atención a Q4_K, y los tensores densos del draft a MXFP4 con Q4_K_M selectivo.

La innovación técnica principal es el **layout TM64**: los 86 tensores expert gate/up IQ2_XXS se reordenan offline de `[expert][M row][K/256 block]` a `[expert][M/64 tile][K/256 block][row within tile]`. Los bloques de cuantización completos de 66 bytes se permutan sin cambiar ningún bit —solo cambia el direccionamiento—, lo que permite a Vulkan usar direccionamiento directo BM64 (block-major, 64 filas) para anchos de lote de producción, evitando la especialización BN16 de ancho 512. El autor verificó la exactitud reproduciendo los hashes SHA-256 de los tensores fuente y comparando hashes de salida Vulkan con la ruta estándar en cinco anchos distintos. No se dispone de información sobre el entrenamiento del modelo base (datos, tokens, RLHF) en la documentación proporcionada.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, propias de la familia DeepSeek-V4 (capacidades heredadas del modelo base, no verificadas en este repositorio).
- Soporte de contexto largo: hasta 409.600 tokens por slot en el modelo principal, con variantes multi-slot de hasta 1.228.800 tokens.
- Decodificación especulativa integrada mediante un draft DSpark (selective-Q4 dense) con la especificación `--spec-type draft-dspark --spec-draft-n-max 5`.
- Optimización específica para GPUs AMD RDNA3 (gfx1151 / device 0x1586) con Vulkan, mediante el layout TM64 y kernels personalizados.
- Compatibilidad con el fork de `llama.cpp` del autor, que incluye los kernels Vulkan necesarios para leer el tipo serializado privado `IQ2_XXS_TM64`.

## Casos de uso

- **Inferencia local de alto rendimiento en AMD RDNA3**: el caso de uso principal es ejecutar DeepSeek-V4-Flash en una GPU AMD RDNA3 (gfx1151) con Vulkan, aprovechando el speedup de prompt del 14,86 % frente al layout estándar. Es adecuado para entornos donde se prioriza el rendimiento de procesamiento de contexto largo.
- **Procesamiento de documentos extensos**: con una ventana de hasta 409.600 tokens por slot, el modelo puede analizar corpus largos, contratos, codebases completos o transcripciones, manteniendo coherencia a lo largo de la conversación.
- **Decodificación especulativa en producción**: el draft DSpark de 10 GB permite acelerar la generación de tokens con `--spec-draft-n-max 5`, reduciendo la latencia percibida en aplicaciones interactivas de chat o asistentes.
- **Despliegue en entornos con restricciones de VRAM**: la cuantización IQ2_XXS de los expertos reduce el footprint de memoria frente a cuantizaciones más altas, permitiendo ejecutar un modelo de 284B en hardware con ~90 GB de VRAM (79 GB del modelo + 10 GB del draft).
- **Investigación en kernels Vulkan y layouts de tensores**: el repositorio sirve como referencia para desarrolladores que trabajan en optimizaciones de GGUF para GPUs AMD, ya que documenta el proceso de relayout, los kernels y las verificaciones de exactitud.
- **Experimentos de rendimiento comparativo**: los datos de speedup (1,24949× a ancho 512, 1,19271× a 1024, 1,10918× a 2286, 1,07336× a 3072) permiten evaluar el impacto del layout TM64 en diferentes anchos de lote, útil para ajustar configuraciones de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor del repositorio sí proporciona mediciones de rendimiento del layout TM64 frente al estándar, que se resumen a continuación:

| Metrica | Layout estandar | Layout TM64 | Mejora |
|---|---|---|---|
| Prompt throughput (mediana, modelo residente) | 76,0 tok/s | 87,3 tok/s | +14,86 % |
| Decode throughput (mediana, modelo residente) | 19,97 tok/s | 20,47 tok/s | +2,50 % |
| Speedup kernel (ancho 512) | 1,0× | 1,24949× | +24,95 % |
| Speedup kernel (ancho 1024) | 1,0× | 1,19271× | +19,27 % |
| Speedup kernel (ancho 2286) | 1,0× | 1,10918× | +10,92 % |
| Speedup kernel (ancho 3072) | 1,0× | 1,07336× | +7,34 % |

El autor confirma que los hashes de salida y la tasa de aceptación del draft son idénticos entre el layout estándar y el TM64 en todas las fases de medición.

## Requisitos de hardware

- **GPU**: específicamente AMD RDNA3 con device ID `0x1586` (gfx1151). El layout TM64 es un opt-in que solo se activa en esta plataforma; en otros dispositivos se aplican los kernels estándar IQ2_XXS o el archivo debe re-convertirse.
- **VRAM estimada**: al menos ~90 GB para cargar ambos archivos (79 GB del modelo principal + 10 GB del draft). No se indica si es posible ejecutar solo el modelo principal sin el draft.
- **GPU recomendadas**: AMD Radeon RX 7900 XTX o similar con 24 GB de VRAM no son suficientes; se requiere hardware con memoria unificada o múltiples GPUs (no especificado). El autor no detalla configuraciones multi-GPU.
- **Opciones de despliegue**: fork personalizado de `llama.cpp` (https://github.com/erayyapagci/llama.cpp) con kernels Vulkan. No se menciona compatibilidad con vLLM, Ollama o TGI.
- **Latencia y throughput**: prompt throughput mediano de 87,3 tok/s y decode de 20,47 tok/s en el hardware de prueba del autor (no especificado), con el modelo residente en memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Plataforma | Licencia |
|---|---|---|---|---|---|
| **Este repo (TM64)** | 284B (13B activos) | 409.600 (hasta 1.228.800) | IQ2_XXS/Q2_K + Q4_K attn | AMD RDNA3 Vulkan | no disponible |
| `bleysg/DeepSeek-V4-Flash-IQ2XXS-Q2K-FP8-120GB-target` | 284B (13B activos) | no disponible | IQ2_XXS/Q2_K + FP8 | no especificada | no disponible |
| `antirez/deepseek-v4-gguf` (upstream) | 284B (13B activos) | no disponible | IQ2_XXS/Q2_K + Q8 attn | multiplataforma | no disponible |
| DeepSeek-V4-Flash (original, API) | 284B (13B activos) | 1.000.000 | FP8 (servicio) | nube | propietaria |

La comparativa se basa en datos de la búsqueda web y de las model cards de los repos upstream. No se dispone de benchmarks de calidad que permitan comparar el rendimiento real de estos cuantizados entre sí.

## Limitaciones y advertencias

- **Dependencia de hardware específico**: el layout TM64 solo funciona en AMD RDNA3 (gfx1151 / device `0x1586`). En cualquier otra GPU, el archivo debe re-convertirse al layout estándar, perdiendo la optimización.
- **Fork privado de llama.cpp**: el runtime requiere el fork de `llama.cpp` del autor. No se garantiza compatibilidad con versiones oficiales de llama.cpp u otros runners.
- **Tipo serializado privado**: el tipo `IQ2_XXS_TM64` no es legible por kernels estándar de IQ2, lo que limita la interoperabilidad del archivo.
- **Licencia no especificada**: la model card indica que se aplica la licencia del modelo original, pero no se detalla cuál es. El uso comercial puede estar restringido; es necesario consultar la model card de DeepSeek-V4-Flash original.
- **Riesgo de alucinación y sesgos**: al ser una cuantización agresiva (IQ2_XXS en expertos), la calidad de salida puede degradarse respecto al modelo en FP8 o BF16. No se han publicado evaluaciones de calidad en este repositorio.
- **Sin datos de entrenamiento**: no se proporciona información sobre el dataset, el proceso de entrenamiento o el alineamiento del modelo base, lo que impide evaluar sesgos o limitaciones idiomáticas.
- **Descargas y adopción nulas**: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento reciente y poco validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/erayyapagci/DeepSeek-V4-Flash-IQ2XXS-TM64-Q4KAttention-v1
- Fork de llama.cpp del autor: https://github.com/erayyapagci/llama.cpp
- Repo upstream del modelo principal: https://huggingface.co/antirez/deepseek-v4-gguf
- Repo upstream del draft DSpark: https://huggingface.co/Ralii/DeepSeek-V4-Flash-0731-DSpark-Selective-Q4_K_M-GGUF
- Web oficial de DeepSeek: https://deepseek.com/en/index.html
- Catalogo de Microsoft Foundry (DeepSeek-V4-Flash): https://ai.azure.com/catalog/models/DeepSeek-V4-Flash
- Cuantizacion similar (referencia): https://huggingface.co/bleysg/DeepSeek-V4-Flash-IQ2XXS-Q2K-FP8-120GB-target
