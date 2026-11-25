# shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter

## Resumen

Inkling-2-Mini-LookAtMyQuant-drafter es un drafter de decodificación especulativa en formato MLX, cuantizado a 4 bits, derivado del bloque MTP (multi-token prediction) DSpark de 3 capas del modelo base thinkingmachines/Inkling-2-Mini. No es un modelo generativo autónomo, sino un componente auxiliar que propone tokens candidatos que el modelo objetivo verifica en una única pasada por lotes, acelerando la inferencia en Apple Silicon. Lo publica el usuario shinmegamiboson dentro del ecosistema LookAtMyQuant.

El artefacto ocupa 178,9 MB por fichero de pesos (frente a los 635,8 MB del mtp.safetensors en BF16 del modelo original, una reducción de 3,55x) y está pensado para ejecutarse junto a las cuantizaciones del modelo base de 3,9 GB, 4,7 GB, 5,4 GB, 8,9 GB, 11,2 GB y 12,8 GB del mismo autor. Su relevancia actual reside en que permite decodificación especulativa sin pérdida (greedy sin degradación y muestreo especulativo exacto e insesgado con temperatura mayor que cero) en hardware de consumo Apple, con incrementos medidos de throughput de hasta 1,38x sobre decodificación serie.

La licencia es Apache 2.0 y el idioma declarado es únicamente inglés. El repositorio es pequeño (0,5 GB) y la librería de referencia es MLX, por lo que su uso está restringido al stack de Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificación especulativa DSpark MTP (multi-token prediction) de 3 capas, block-8, sobre el modelo base Inkling-2-Mini |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo objetivo Inkling-2-Mini) |
| Tipos de cuantizacion | 4 bits MLX con group_size = 64; normas, fuse_weight, mask_embed y hidden_out en precisión nativa |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX): mtp_4bit.safetensors, mtp_4bit_5p4gb_v2.safetensors, mtp_4bit_8p9gb_v2.safetensors; metadatos en config.json y manifest.json (formato inkling2-dspark-4bit-v1) |

## Arquitectura y entrenamiento

El drafter reproduce el bloque MTP DSpark del modelo base: tres capas que leen cuatro taps ocultos del modelo objetivo (visitas lógicas 5, 23, 41 y 48) y proponen bloques lineales adaptativos de tamaño 6 a 8, con opción de árboles causales de 8 nodos y búsqueda N-gram sobre el prompt. La verificación se realiza en una sola pasada por lotes, lo que permite mantener la corrección estadística del muestreo especulativo: greedy sin pérdida y muestreo exacto e insesgado cuando temp > 0, además de paridad con el parámetro --max-thinking-tokens del modelo objetivo.

Los pesos se obtienen por cuantización de 4 bits (group_size = 64) de los pesos DSpark originales en BF16 mediante ModelOpt, manteniendo en precisión nativa las normas y las capas fuse_weight, mask_embed y hidden_out. El repositorio incluye además dos variantes "destiladas" del drafter (mtp_4bit_5p4gb_v2 y mtp_4bit_8p9gb_v2) ajustadas específicamente sobre las cuantizaciones de 5,4 GB y 8,9 GB del modelo base. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset del drafter original.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Inkling-2-Mini, con bloques adaptativos de 6 a 8 tokens.
- Verificación en una sola pasada por lotes, preservando la distribución del modelo objetivo (greedy sin pérdida y muestreo insesgado con temperatura).
- Soporte de árboles causales de 8 nodos (opt-in) para aumentar la tasa de aceptación.
- Búsqueda N-gram sobre el prompt como mecanismo adicional de propuesta de tokens.
- Compatibilidad con el parámetro --max-thinking-tokens del modelo objetivo (paridad de modo thinking).
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües por sí mismo: todas ellas dependen del modelo objetivo.

## Casos de uso

- Aceleración de inferencia local en Apple Silicon: se usa como drafter junto a cualquiera de las cuantizaciones LookAtMyQuant del modelo base para elevar el throughput de 75,8 a 113,0 tok/s en la variante de 3,9 GB, o de 75,3 a 124,4 tok/s en la de 5,4 GB.
- Despliegue en iPhone de 8 GB: combinado con la cuantización de 3,9 GB (1,18 bpp, SQYFR v3), permite 113,0 tok/s de mediana con 3,54 GiB activos y 4,57 GiB de pico en decodificación.
- Despliegue en iPhone de 12 GB: con la cuantización de 4,7 GB (1,45 bpp) y DSpark se alcanzan 129,0 tok/s en tareas matemáticas con 3,25 tokens por verificación.
- Razonamiento matemático interactivo: la variante de 5,4 GB logra 142,9 tok/s en matemáticas y 126,5 tok/s en razonamiento, adecuada para asistentes de resolución paso a paso con thinking extendido.
- Generación de código asistida: la variante de 8,9 GB mantiene 96,2 tok/s en código con 1.784 tok/s de prefill a T=512, útil para autocompletado en editores sobre Mac.
- Servicio de chat de baja latencia en estación de trabajo Mac: la variante de 12,8 GB ofrece 100,7 tok/s de mediana con 1.556 tok/s de prefill, suficiente para conversaciones multi-turno con prompts largos.
- Evaluación comparativa de cuantizaciones: permite medir el compromiso entre bits por peso (1,18 a 3,92 bpp) y velocidad de decodificación sobre el mismo modelo objetivo.

## Benchmarks y rendimiento

Rendimiento medido en Apple M5 Max con mtp_4bit.safetensors, según la model card del autor:

| Cuantización objetivo | bpp | tok/s serie | tok/s mediana | Matemáticas | Código | Prefill T=512 | Memoria activa / pico |
|---|---|---|---|---|---|---|---|
| 3,9 GB (SQYFR v3) | 1,18 | 75,8 | 113,0 | 117,3 | 108,5 | no disponible | 3,54 / 4,57 GiB |
| 4,7 GB (SQYFR v3 + DSpark) | 1,45 | 69,2 | no disponible | 129,0 | 94,7 | no disponible | 4,35 / 5,35 GiB |
| 5,4 GB (SQYFR v4) | 1,65 | 75,3 | 124,4 | 142,9 | no disponible | 1.807 | 5,34 GB activos |
| 8,9 GB (Fast-Refresh v5) | 2,72 | 56,0 | 117,9 | 139,7 | 96,2 | 1.784 | 8,84 GB activos |
| 11,2 GB (Fast-Refresh v5) | 3,43 | 53,1 | 102,3 | 116,9 | 87,7 | 1.540 | 11,14 GB activos |
| 12,8 GB (Fast-Refresh v5) | 3,92 | 53,8 | 100,7 | 125,9 | 75,5 | 1.556 | 12,73 GB activos |

Con muestreo especulativo a temp = 0,6, top_p = 0,9 y top_k = 40 se reporta 1,38x sobre decodificación serie. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/unified memory: entre 3,54 GiB activos (objetivo de 3,9 GB) y 12,73 GB activos (objetivo de 12,8 GB); el drafter añade 178,9 MB por fichero de pesos.
- GPU recomendadas: Apple Silicon exclusivamente (mediciones en Apple M5 Max); no hay soporte CUDA ni ROCm en la información disponible.
- Cabe en hardware de consumo Apple: iPhone de 8 GB (objetivo 3,9 GB), iPhone de 12 GB (objetivo 4,7 GB) y Mac con 16 GB o más de memoria unificada para el resto de variantes.
- Opciones de despliegue: runtime LookAtMyQuant (pip install git+https://github.com/ShinMegamiBoson/lookatmyquant.git) con el comando lamq generate y el flag --drafter; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 100,7 a 129,0 tok/s de mediana según variante; prefill de 1.540 a 1.807 tok/s a T=512 en las variantes de 5,4 GB en adelante.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño de pesos | Contexto | Licencia | Plataforma |
|---|---|---|---|---|---|
| Inkling-2-Mini-LookAtMyQuant-drafter | Drafter especulativo DSpark 4 bits | 178,9 MB | no disponible | Apache 2.0 | MLX (Apple Silicon) |
| thinkingmachines/Inkling-2-Mini (mtp.safetensors BF16) | Drafter especulativo DSpark sin cuantizar | 635,8 MB | no disponible | no disponible | MLX / genérico |
| Cuantizaciones LookAtMyQuant de Inkling-2-Mini (3,9 a 12,8 GB) | Modelos objetivo cuantizados | 3,9 a 12,8 GB | no disponible | Apache 2.0 | MLX (Apple Silicon) |

No se dispone de datos de otros drafters comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo objetivo Inkling-2-Mini y el runtime LookAtMyQuant; no genera respuestas por sí solo.
- Solo inglés: el campo de idioma declarado es en, sin soporte multilingüe verificado.
- Exclusivo de Apple Silicon y MLX: no hay rutas de despliegue para CUDA, ROCm ni CPU genérica.
- Las cifras de rendimiento proceden de un único dispositivo (Apple M5 Max) y de la model card del autor; no hay verificación independiente disponible.
- Las variantes mtp_4bit_5p4gb_v2 y mtp_4bit_8p9gb_v2 están destiladas para cuantizaciones concretas; usarlas con otros tamaños de objetivo puede degradar la tasa de aceptación.
- Riesgo de alucinación y sesgos: heredados del modelo objetivo Inkling-2-Mini; no se documentan evaluaciones de sesgo específicas.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini antes de un uso comercial en producción.
- El repositorio tiene 1 like y 1.406 descargas en la fecha de consulta, lo que indica una validación comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime LookAtMyQuant: https://github.com/ShinMegamiBoson/lookatmyquant
- Sitio de LookAtMyQuant: https://lookatmyquant.com
- Cuantización 3,9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-3.9GB
- Cuantización 4,7 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-4.7GB
- Cuantización 5,4 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-5.4GB
- Cuantización 8,9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB
- Cuantización 11,2 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-11.2GB
- Cuantización 12,8 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-12.8GB
