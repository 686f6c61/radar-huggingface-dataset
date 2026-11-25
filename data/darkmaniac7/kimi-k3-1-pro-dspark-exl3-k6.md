# darkmaniac7/Kimi-K3.1-Pro-DSpark-EXL3-K6

## Resumen

Kimi-K3.1-Pro-DSpark-EXL3-K6 es una cuantizacion de 6 bits en formato EXL3 del modelo borrador (draft model) Inferact/Kimi-K3.1-Pro-DSpark, un cabezal de decodificacion especulativa de 5 capas GQA y aproximadamente 2,5 mil millones de parametros disenado para acelerar la inferencia del modelo objetivo moonshotai/Kimi-K3.1-Pro. La publica el usuario darkmaniac7 como artefacto de despliegue para su pipeline `k31q` sobre vLLM, no como modelo autonomo de proposito general.

El checkpoint resultante ocupa 1,97 GB (1,83 GiB) frente a los 4,96 GB en BF16 del borrador original, con un SQNR medio de 35,18 dB y minimo de 34,81 dB en las 37 matrices lineales cuantizadas. El repositorio declara 983.223.937 parametros en los tensores safetensors, cifra que corresponde a los pesos efectivamente almacenados y no al total del borrador, ya que el embedding y el LM head se comparten con la etapa objetivo y no se duplican.

Su relevancia es acotada pero tecnica: permite reducir la VRAM por rango en 1,59 GiB (hasta 1,11 GiB por rango en TP2) en topologias muy restringidas, como la receta documentada de 6 GPU de 8 GB mas 2 RTX PRO 6000 con TP2 x PP4. No es un modelo para generar texto de forma independiente, sino un componente de aceleracion que debe emparejarse con el modelo objetivo y con un runtime vLLM modificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GQA de 5 capas (modelo borrador para decodificacion especulativa DSpark) |
| Parametros totales | 983.223.937 en safetensors (borrador base: ~2,5 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 2.048 tokens en cada capa del borrador |
| Tipos de cuantizacion | EXL3 6 bits (`mul1` lattice codebook, `k31q_dspark_exl3` v1); capas norm, Q/K norm, confidence head y `markov_head.markov_w1` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (Kimi K3.1-Pro License, categoria `other`) |
| Formato de pesos | safetensors (`model.safetensors`, 1.966.464.806 bytes) con `custom_code` |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa construido sobre 5 capas de atencion con query grouping (GQA): 96 cabezas de query, 16 cabezas KV y dimension de cabeza 64, con ventana deslizante de 2.048 tokens en todas las capas. Incluye un `confidence head` y un `markov_head` con shortlist de 32+64 candidatos que guian la seleccion de tokens propuestos. La arquitectura original procede de Inferact y del equipo Red Hat AI Speculators (repositorio vllm-project/speculators); esta version no reentrena pesos, solo los recomprime.

La cuantizacion EXL3 aplica un codebook reticular `mul1` de 6 bits sobre 37 matrices lineales, manteniendo en BF16 las capas de normalizacion, las Q/K norm, el confidence head y `markov_w1` para preservar la calibracion de confianza. El embedding y el LM head no se almacenan en este checkpoint: se comparten con la etapa objetivo. El autor reporta un SQNR medio de 35,18 dB y minimo de 34,81 dB, y el repositorio incluye `k31q_dspark_manifest.json` con metadatos EXL3 y el informe de SQNR por matriz. No se documentan datos de entrenamiento, numero de tokens ni fases de RLHF/DPO en la informacion disponible.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Kimi-K3.1-Pro; no es un modelo generativo autonomo.
- Propuesta de borradores con profundidad adaptativa configurable (`tiers: [1,2,3,4,5,7,9]`).
- Shortlist Markov de 32+64 candidatos para filtrar propuestas antes de la verificacion por el modelo objetivo.
- Estimacion de confianza por token mediante `confidence head`, usada para decidir la profundidad del borrador.
- Integracion con el pipeline vLLM `k31q` mediante la variable de entorno `VLLM_DSPARK_EXL3_K6=1`.
- Soporte de despliegue tensor-parallel (TP2) y pipeline-parallel (PP4) segun la receta del autor.
- Capacidades multilingues, tool calling, vision o audio: no disponibles en este artefacto (dependen del modelo objetivo).

## Casos de uso

- Aceleracion de inferencia de Kimi-K3.1-Pro en hardware muy limitado: el borrador cuantizado ocupa 1,11 GiB por rango en TP2, lo que permite encajar la etapa de drafting en GPUs de 8 GB junto al modelo objetivo distribuido en PP4.
- Despliegue en topologias heterogeneas: la receta documentada combina 6 GPU de 8 GB con 2 RTX PRO 6000; el checkpoint EXL3 reduce la presion de VRAM en los rangos mas pequenos y evita reconfigurar el pipeline.
- Servicio de chat de baja latencia sobre Kimi-K3.1-Pro: la decodificacion especulativa con profundidad adaptativa reduce el numero de pasos del modelo objetivo por token aceptado, lo que se traduce en mayor throughput en cargas interactivas.
- Investigacion en decodificacion especulativa: el manifest con SQNR por matriz y los tensores en BF16 seleccionados permiten estudiar el impacto de la cuantizacion del borrador en la tasa de aceptacion.
- Evaluacion de runtimes vLLM modificados: sirve como artefacto de prueba para validar el pipeline `k31q` y las variables de entorno asociadas antes de desplegar en produccion.
- Reduccion de coste en inferencia por lotes: al disminuir la VRAM del borrador, se libera memoria para aumentar el tamano de lote o la longitud de contexto efectiva del modelo objetivo en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite los resultados de rendimiento a la pagina wiki de CMP 170HX, sin cifras reproducidas en la model card.

| Metrica | Valor reportado |
|---|---|
| SQNR medio (37 matrices lineales) | 35,18 dB |
| SQNR minimo | 34,81 dB |
| Tamano del checkpoint | 1,97 GB (1,83 GiB) vs 4,96 GB en BF16 |
| VRAM por rango en TP2 | 1,11 GiB (ahorro de 1,59 GiB frente a BF16) |
| Throughput / tasa de aceptacion | no disponible |

## Requisitos de hardware

- VRAM estimada: 1,11 GiB por rango en TP2 para el borrador; el modelo objetivo Kimi-K3.1-Pro requiere hardware adicional no especificado en la informacion disponible.
- GPU recomendadas: la receta del autor usa 6 GPU de 8 GB mas 2 RTX PRO 6000 con vLLM TP2 x PP4; no se documentan otras configuraciones validadas.
- GPU de consumo: cabe en GPUs de 8 GB para la etapa de drafting, pero el sistema completo necesita el modelo objetivo y no se indica que quepa en una unica GPU de consumo.
- Opciones de despliegue: vLLM con el pipeline `k31q` (`VLLM_DSPARK_EXL3_K6=1`); no se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen de la topologia y de la tasa de aceptacion del borrador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-DSpark-EXL3-K6 (este) | 983 M en safetensors (~2,5 B borrador) | 2.048 tokens (ventana deslizante) | EXL3 6 bits | kimi-k3.1-pro | Hugging Face, 0 descargas |
| Inferact/Kimi-K3.1-Pro-DSpark | ~2,5 B | 2.048 tokens | BF16 | no disponible | Hugging Face |
| darkmaniac7/Kimi-K3.1-Pro-abliterated-k31q | no disponible | no disponible | k31q | kimi-k3.1-pro | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo Kimi-K3.1-Pro y un runtime vLLM modificado; no funciona con inferencia estandar.
- La ventana de 2.048 tokens limita la profundidad de contexto que el borrador puede aprovechar; propuestas fuera de esa ventana dependen del modelo objetivo.
- La cuantizacion a 6 bits introduce error respecto al borrador en BF16 (SQNR minimo de 34,81 dB); el impacto en la tasa de aceptacion no esta cuantificado en la model card.
- Licencia `kimi-k3.1-pro` con categoria `other`: es necesario revisar el archivo LICENSE antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (25 de noviembre de 2026); no hay evidencia de validacion independiente.
- Requiere `custom_code` y configuracion especifica (`config.py`); la carga con herramientas genericas puede fallar.
- No se documentan sesgos, idiomas soportados ni comportamiento de alucinacion, ya que el artefacto no genera texto de forma directa.
- El checkpoint omite embedding y LM head por diseno; no puede ejecutarse de forma aislada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkmaniac7/Kimi-K3.1-Pro-DSpark-EXL3-K6
- Modelo borrador base: https://huggingface.co/Inferact/Kimi-K3.1-Pro-DSpark
- Modelo objetivo: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Modelo objetivo abliterated: https://huggingface.co/darkmaniac7/Kimi-K3.1-Pro-abliterated-k31q
- Repositorio Speculators: https://github.com/vllm-project/speculators
- Receta de despliegue CMP 170HX: https://cmp.wiki/wiki/Kimi_K3.1_Pro_on_6x_8_GB_plus_2x_RTX_PRO_6000_(vLLM_TP2_x_PP4)
