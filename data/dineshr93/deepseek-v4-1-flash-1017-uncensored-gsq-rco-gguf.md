# dineshr93/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una variante cuantizada en formato GGUF del modelo DeepSeek-V4.1-Flash-1017, una versión "uncensored" (sin filtros de moderación) derivada del modelo base oficial de DeepSeek. El autor de esta conversión es dineshr93, que parte del trabajo previo de AtomicChat (que publicó la variante uncensored en GGUF) y aplica una cuantización GSQ-RCO (ISTA-DASLab) en los niveles IQ1_M e IQ2_XXS, con un fichero Engram compartido en IQ4_NL.

El modelo cuenta con aproximadamente 196.600 millones de parámetros totales, lo que lo sitúa en la categoría de modelos de gran escala. Su propósito declarado es ejecutar un modelo de este tamaño en una única máquina AMD Strix Halo (gfx1151) con 128 GB de memoria unificada, usando el fork Gufo del runtime llama.cpp. Se trata, por tanto, de un artefacto de despliegue orientado a hardware consumer/workstation con memoria unificada, no de un modelo entrenado desde cero.

La relevancia de esta ficha radica en que ilustra una tendencia práctica: la adaptación de modelos frontier open source a formatos cuantizados extremos (1-2 bits por peso) para hacerlos viables en hardware de gama alta consumer. El repositorio ocupa 375,5 GB e incluye shards del modelo, proyector de visión, drafter de decodificación especulativa y script de conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo base DeepSeek-V4.1-Flash-1017; la model card no detalla transformer/MoE/SSM) |
| Parametros totales | 196.613.849.600 (~196,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 162.000 tokens (valor usado en el ejemplo de serve de Gufo); contexto maximo nativo del modelo base no disponible |
| Tipos de cuantizacion | IQ1_M e IQ2_XXS (GSQ-RCO) para el modelo; IQ4_NL para Engram compartido; BF16 para el proyector de vision; Q2K-Q4K para el drafter |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards de 6 ficheros por cuantizacion, con el shard 00006 como symlink al Engram IQ4_NL) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base DeepSeek-V4.1-Flash-1017 en los datos proporcionados. La model card de esta conversión se limita a describir el proceso de cuantizacion y despliegue, sin especificar si el modelo subyacente emplea transformer denso, mezcla de expertos (MoE), arquitectura híbrida o state space models. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o similar.

Lo que sí queda documentado es el pipeline de conversion: se parte de `AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF`, se aplica la cuantizacion GSQ-RCO de ISTA-DASLab en dos variantes (IQ1_M e IQ2_XXS) y se separa un fichero Engram en IQ4_NL que ambas variantes comparten mediante symlink. El repositorio incluye además un proyector de vision en BF16 (`mmproj-DeepSeek-V4.1-Flash-1017-BF16.gguf`), lo que implica que el modelo base tiene capacidad multimodal de vision, y un drafter DSpark (`DeepSeek-V4.1-Flash-1017-DSpark-draft-Q2K-Q4K.gguf`) para decodificacion especulativa, contribuido por Lucebox. La innovacion tecnica destacable es precisamente la viabilidad de servir ~196,6 B parametros en 128 GB de memoria unificada mediante cuantizacion extrema a 1-2 bits y streaming de expertos.

## Capacidades

- Generacion de texto autoregresiva (pipeline `text-generation`).
- Capacidad de vision: el repositorio incluye un proyector multimodal (`mmproj-...-BF16.gguf`) que se activa con `--mmproj` en Gufo.
- Decodificacion especulativa mediante drafter DSpark, que eleva el throughput de generacion de ~24 tok/s a ~30 tok/s segun la model card.
- Modo "uncensored": el modelo derivado elimina los filtros de moderacion del modelo base, segun declara el autor.
- Razonamiento, codigo, matematicas y tool calling: no disponible en la informacion proporcionada (no se documentan explicitamente estas capacidades en la model card).
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (los idiomas no estan listados).

## Casos de uso

- Despliegue local de un modelo de ~196,6 B parametros en una workstation AMD Strix Halo: el caso de uso principal y explicito de esta conversion es servir el modelo en una maquina con Ryzen AI Max+ 395 y 128 GB de memoria unificada, usando Gufo con `--stream-experts` y contexto de 162.000 tokens. Es adecuado porque la cuantizacion IQ1_M/IQ2_XXS reduce el footprint lo suficiente para caber en memoria unificada.
- Experimentacion con modelos uncensored en investigacion de seguridad: investigadores pueden estudiar el comportamiento de un modelo sin filtros de moderacion en entornos controlados, comparando respuestas con la variante censurada del mismo modelo base.
- Procesamiento de documentos largos con vision: gracias al contexto de 162.000 tokens y al proyector multimodal, se pueden analizar documentos extensos que combinen texto e imagenes (informes, capturas, PDFs renderizados) en una sola pasada.
- Generacion asistida con decodificacion especulativa: integrando el drafter DSpark se obtiene un throughput de ~30 tok/s, util para prototipado interactivo donde la latencia de generacion importa pero no se dispone de GPU de datacenter.
- Evaluacion de tecnicas de cuantizacion extrema: el repositorio sirve como banco de pruebas para comparar IQ1_M frente a IQ2_XXS en terminos de calidad y velocidad en hardware ROCm/AMD, usando `llama-benchy` contra el endpoint servido.
- Pipeline de inferencia offline por lotes: con prefill documentado de ~1.244 tok/s (Gufo IQ1_M a 2048 tokens), se pueden procesar lotes de prompts largos en una sola maquina sin infraestructura cloud, aceptando el trade-off de throughput de generacion moderado.

## Benchmarks y rendimiento

La model card solo documenta benchmarks de rendimiento de inferencia (no de calidad del modelo). Se presentan a continuacion, medidos en AMD Ryzen AI Max+ 395 (128 GB), Radeon 8060S (gfx1151), Ubuntu 26.04 LTS, sin drafter:

| Test | Resultado |
|---|---:|
| `pp2048` (llama-benchy) | 649.063,68 ± 83.050,96 t/s (valor derivado del primer evento de respuesta; no es tasa real de prefill) |
| `tg32` | 23,79 ± 0,05 t/s |
| Pico `tg` | 24,00 t/s |
| `ttfr` | 4,05 ± 0,24 ms |
| `e2e_ttft` | 1.850,79 ± 128,76 ms |

Timing real del servidor en funcionamiento (sin drafter):

| Prompt tokens | Completion tokens | pp (tok/s) | tg (tok/s) | Tiempo total |
|---:|---:|---:|---:|---:|
| 2.234 | 32 | 1.154,62 | 24,36 | 3,26 s |

Datos adicionales aportados por la model card: la tasa real de prefill documentada por Gufo para IQ1_M a 2048 tokens es de ~1.243,84 tok/s, y el `tg` de un solo usuario a profundidad 0 es de ~24,71 tok/s. Con el drafter DSpark, la generacion sube a ~30 tok/s.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el modelo esta disenado para 128 GB de memoria unificada (AMD Strix Halo). El repositorio completo ocupa 375,5 GB en disco, pero la inferencia usa los shards seleccionados mas el Engram IQ4_NL compartido. La model card advierte presion de memoria extrema con streaming de expertos en 128 GB.
- GPU recomendadas: AMD Radeon 8060S integrada (gfx1151) en Ryzen AI Max+ 395, que es el objetivo declarado. No se documentan GPUs NVIDIA (A100, H100, RTX 4090) en la informacion proporcionada.
- Cabe en GPU consumer: no en GPUs consumer convencionales con VRAM dedicada (24 GB de una RTX 4090 quedan muy lejos de los ~196,6 B parametros incluso a 1-2 bits). Solo es viable en hardware con memoria unificada de gran capacidad como Strix Halo.
- Opciones de despliegue: Gufo (fork de llama.cpp en la rama `feat/ds41`), con flags `--stream-experts`, `--mmproj` para vision y `--speculative dspark` para decodificacion especulativa. Otros runtimes tipo vLLM, TGI o Ollama no estan documentados para este artefacto.
- Latencia y throughput: prefill real ~1.154-1.244 tok/s; generacion ~24 tok/s sin drafter y ~30 tok/s con DSpark; TTFT extremo a extremo ~1.851 ms. La model card indica que la inferencia funciona de forma fiable solo cuando no hay otros servicios GPU en ejecucion (sin otros servidores de modelos, contenedores o cargas concurrentes).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dineshr93/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF | ~196,6 B | 162.000 (configurado en Gufo) | IQ1_M, IQ2_XXS, IQ4_NL (Engram) | MIT | GGUF, repo de 375,5 GB |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF (modelo base de esta conversion) | no disponible | no disponible | GGUF (niveles no detallados) | no disponible en esta informacion | GGUF |
| Lucebox/DeepSeek-V4.1-Flash-1017-ROCMFP-GGUF (origen del drafter DSpark) | no disponible | no disponible | ROCMFP / GGUF | no disponible en esta informacion | GGUF |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (modelo original) | no disponible (el dato de 196,6 B corresponde a esta conversion) | no disponible | pesos originales (formato no detallado) | no disponible en esta informacion | Hugging Face |

No se dispone de datos de benchmarks de calidad ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Modelo uncensored: la variante elimina los filtros de moderacion del modelo base; puede generar contenido sensible, ofensivo o danino. No es adecuada para produccion orientada a usuarios finales sin capas de moderacion externas.
- Cuantizacion extrema: IQ1_M e IQ2_XXS implican 1-2 bits por peso, con perdida de calidad significativa frente a los pesos originales. No se han publicado evaluaciones de calidad en la informacion disponible.
- Presion de memoria: la model card advierte explicitamente que la inferencia solo funciona de forma fiable en 128 GB cuando no hay otros servicios GPU en ejecucion; cargas concurrentes pueden provocar fallos.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo base original DeepSeek-V4.1-Flash-1017, que no se detalla en esta informacion.
- Idiomas e idoneidad multilingue: no disponibles; no se puede confirmar el rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de gran escala cuantizado a 1-2 bits, es esperable un aumento del riesgo respecto al modelo original, aunque no hay datos que lo confirmen.
- Hardware muy especifico: el artefacto esta optimizado para gfx1151 (Strix Halo) con Gufo; su uso en otras plataformas no esta documentado ni garantizado.
- Repositorio de 375,5 GB: requiere almacenamiento considerable y ancho de banda de descarga significativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dineshr93/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Modelo base (original): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Modelo base intermedio (uncensored GGUF): https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Origen del drafter DSpark: https://huggingface.co/Lucebox/DeepSeek-V4.1-Flash-1017-ROCMFP-GGUF
- Fork Gufo (rama feat/ds41): https://github.com/franzmoca/gufo/tree/feat/ds41
- Notas de uso de Gufo para DeepSeek: https://github.com/franzmoca/gufo/blob/feat%2Fds41/README_DEEPSEEK.md
