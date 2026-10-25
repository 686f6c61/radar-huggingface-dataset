# freakyskittle/MiniMax-3.1-Flash-DeRisked-GGUF

## Resumen

MiniMax-3.1-Flash-DeRisked-GGUF es la conversión a formato GGUF del checkpoint Blackfrost-Research/MiniMax-3.1-Flash-DeRisked, una modificación del modelo multimodal MiniMaxAI MiniMax-M3.1-Flash a la que se ha aplicado un ajuste de pesos denominado DWM (DeRisked Weight Modification) sobre la proyección de salida de atención (`o_proj`). El modelo pertenece a la familia `minimax_m3_vl` (`MiniMaxM3SparseForConditionalGeneration`), una arquitectura transformer con mezcla de expertos dispersa: 60 capas, dimensión oculta 6144, 128 expertos enrutados más uno compartido y 4 expertos activos por token, sobre un total de aproximadamente 427.000 millones de parámetros. Incluye una torre de visión de 32 capas, por lo que la pipeline declarada es image-text-to-text.

El problema que resuelve esta publicación es práctico: el checkpoint original se distribuye en precisones mixtas (MXFP8 para atención y capas densas, NVFP4 para los expertos) y no es consumible directamente por herramientas de inferencia local. Esta conversión repaqueta los tensores NVFP4 de los expertos en el formato nativo de GGUF y descompone los bloques MXFP8 a BF16, generando además una escalera de cuantizaciones que va desde Q8_0 (~430 GB) hasta TQ1_0 ternario (~105 GB), más un proyector multimodal independiente `mmproj` en F16.

Es relevante ahora porque permite ejecutar un modelo multimodal de escala 427B con contexto declarado de más de 1M de tokens en llama.cpp, incluyendo vision mediante `llama-mtmd-cli` y `llama-server`. El repositorio es de un tercero (`freakyskittle`), sin descargas ni valoraciones en el momento de la consulta y sin resultados de evaluación publicados, lo que condiciona cualquier decisión de adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `minimax_m3_vl` (`MiniMaxM3SparseForConditionalGeneration`); transformer MoE disperso con Lightning Attention e indexador de atención dispersa; torre de visión de 32 capas |
| Parámetros totales | ~427B (~413B concentrados en los expertos del MoE disperso) |
| Parámetros activos | No disponible la cifra exacta; se sabe que activa 4 de 128 expertos enrutados más 1 experto compartido por token |
| Longitud de contexto | 1M+ tokens (declarado; Lightning Attention + indexador de atención dispersa) |
| Tipos de cuantización | Q8_0, Q4_K_M, IQ4_XS, UD-IQ4_XS, MXFP4_MOE, Q3_K_M, Q2_K, IQ2_XXS, IQ1_M, TQ1_0 (ternario); proyector multimodal en F16 |
| Idiomas soportados | No disponible |
| Licencia | MiniMax Community License (`license: other`, `license_name: minimax-community-license`) |
| Formato de pesos | GGUF dividido en shards (split GGUF); `mmproj` GGUF separado en F16 |
| Capas | 60 (hidden 6144) |
| Expertos | 128 enrutados + 1 compartido, 4 activos por token |
| Precisión del checkpoint de origen | Mixta: MXFP8 (atención y capas densas, e4m3 con escalas E8M0) + NVFP4 (expertos, `nvfp4-pack-quantized` de compressed-tensors) |
| Precisión del GGUF maestro | bf16 en capas densas y de atención; NVFP4 repaquetado en los expertos |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 239,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos dispersa de 60 capas y 6144 dimensiones ocultas, con 128 expertos enrutados y uno compartido, activando 4 expertos por token. La atención combina Lightning Attention con un indexador de atención dispersa, mecanismo que sostiene la ventana declarada de más de 1M de tokens sin coste cuadrático completo. El componente multimodal es una torre de visión de 32 capas cuyo proyector se distribuye como GGUF aparte (`mmproj-...-f16.gguf`, ~1,6 GB), y la comprensión de imágenes se resuelve en llama.cpp a través de las rutas `tools/mtmd/models/minimax-m3.cpp`.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni sobre si hubo RLHF, DPO u otras etapas de alineación. Lo que sí está documentado es la cadena de transformaciones de pesos: el checkpoint upstream MiniMax-M3.1-Flash recibió una modificación de pesos (DWM) sobre `o_proj` por parte de Blackfrost Research, y esta publicación convierte ese resultado a GGUF con `convert_hf_to_gguf.py`. Los expertos NVFP4 se repaquetaron sin pérdida al layout nativo de GGUF (tensor `weight` más compañeros `.scale` y `.input_scale` por experto), y los bloques MXFP8 se descomprimieron a BF16 en el maestro F16: los exponentes E8M0 almacenados como U8 se decodifican como `2^(x-127)` y el autor afirma que la descompresión es exacta porque e4m3 × 2^k es representable en bf16. Las variantes de menor precisión se generaron con `llama-quantize --allow-requantize`.

## Capacidades

- Generación de texto y razonamiento general en un modelo de 427B parámetros totales con 4 expertos activos por token.
- Comprensión de imágenes: pipeline image-text-to-text; requiere el fichero `mmproj` y un build de llama.cpp con soporte `minimax_m3_vl`.
- Ventana de contexto declarada superior a 1M de tokens, apoyada en Lightning Attention e indexación de atención dispersa.
- Inferencia local y en servidor mediante llama.cpp: `llama-cli` (solo texto), `llama-mtmd-cli` (texto + imagen) y `llama-server` (API HTTP con `--mmproj`).
- Eficiencia computacional por token derivada del enrutado disperso: solo se tocan 4 de 128 expertos, lo que hace viable el offloading parcial de pesos.
- Despliegue en cuantizaciones extremas (hasta TQ1_0 ternario, ~105 GB) para entornos con memoria muy limitada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el repositorio no declara lista de idiomas.
- Modo thinking, audio u otras modalidades: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de documentación extensa en local: con más de 1M de tokens de contexto declarados, el modelo puede ingerir expedientes completos, bases de código o corpus normativos en una sola pasada, sin troceado ni recuperación externa. Adecuado cuando la trazabilidad exige que todo el material esté en el prompt.
- Procesamiento de documentos escaneados con imagen y texto: la torre de visión de 32 capas más el proyector `mmproj` permiten pasar capturas, páginas escaneadas o diagramas junto a instrucciones textuales mediante `llama-mtmd-cli`, útil en digitalización de archivos y extracción de datos de formularios.
- Servicio interno de inferencia con `llama-server`: exposicion de una API compatible con el ecosistema llama.cpp para integrar el modelo en aplicaciones existentes, sirviendo tanto peticiones de texto como peticiones multimodales si se carga el `mmproj`.
- Evaluación de variantes de cuantización: la escalera de diez cuantizaciones (de Q8_0 a TQ1_0) permite medir empíricamente la degradación de calidad frente a memoria en un mismo modelo, un caso de uso típico de equipos de investigación que calibran pipelines de compresión.
- Investigación sobre modificación de pesos: al derivar de un checkpoint con DWM aplicado en `o_proj`, sirve para estudiar el efecto de intervenciones quirúrgicas sobre los pesos en modelos MoE multimodales, comparando contra el modelo upstream sin modificar.
- Despliegue on-premise con offloading parcial: gracias a que solo se activan 4 de 128 expertos por token, es viable repartir el GGUF entre VRAM y RAM del sistema (`--no-mmap`/`--mmap`) en nodos con menos memoria que el tamaño total del fichero, manteniendo un throughput utilizable en cargas por lotes no interactivas.
- Generación y revisión de código en entornos aislados: ejecución con `llama-cli` sobre la cuantización Q4_K_M en máquinas sin acceso a APIs externas, para tareas de asistencia de programación donde la confidencialidad del código impide usar servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación, ni comparaciones cuantitativas con el checkpoint upstream o con el modelo base sin modificar. Tampoco se documentan mediciones de latencia o throughput en ningún hardware concreto.

## Requisitos de hardware

- VRAM/RAM estimada por cuantización (tamaño de pesos; el autor advierte que el requisito de RAM se aproxima al tamaño total del fichero elegido, más el `mmproj` de ~1,6 GB si se usa visión):

| Cuantización | Tamaño aproximado |
|---|---|
| TQ1_0 (ternario) | ~105 GB |
| IQ1_M | ~115 GB |
| IQ2_XXS | ~140 GB |
| Q2_K | ~160 GB |
| Q3_K_M | ~195 GB |
| MXFP4_MOE | ~200 GB |
| IQ4_XS / UD-IQ4_XS | ~235 GB |
| Q4_K_M | ~245 GB |
| Q8_0 | ~430 GB |

- GPU recomendadas: no disponible en la información proporcionada. Como referencia de dimensionado a partir de los tamaños de fichero (estimación propia, no publicada por el autor): Q4_K_M (~245 GB) encaja en 4×H100 80 GB (320 GB) o en 8×A100 40 GB; TQ1_0 (~105 GB) requiere al menos 2×H100 80 GB o una GPU de 141 GB tipo H200, y aun así deja poco margen para caché KV con contexto largo.
- Cabe en GPU de consumo: no para el modelo completo. Una RTX 4090 (24 GB) solo podría ejecutar las cuantizaciones menores con offloading masivo a RAM del sistema, con latencia muy alta. No se han publicado cifras de rendimiento en este escenario.
- Contexto largo: la ventana de 1M+ tokens implica un coste de caché KV no cuantificado en la model card; el requisito real de memoria para contextos largos será sustancialmente mayor que el tamaño de los pesos.
- Opciones de despliegue: llama.cpp (obligatorio), con `llama-cli`, `llama-mtmd-cli` y `llama-server`; se requiere un build reciente que incluya soporte `minimax_m3_vl` (`tools/mtmd/models/minimax-m3.cpp`). vLLM, TGI, Ollama y otros motores no están documentados para estos ficheros.
- Descarga: todos los ficheros del modelo de lenguaje son GGUF divididos; es necesario descargar todos los shards `-0000N-of-0000M` de la cuantización elegida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-3.1-Flash-DeRisked-GGUF (esta ficha) | ~427B totales, 4/128 expertos activos | 1M+ tokens (declarado) | Texto + imagen | MiniMax Community License | GGUF en llama.cpp, 10 cuantizaciones |
| Blackfrost-Research/MiniMax-3.1-Flash-DeRisked | No disponible en la información proporcionada | No disponible | No disponible | No disponible | Checkpoint de origen (MXFP8 + NVFP4) |
| MiniMaxAI MiniMax-M3.1-Flash (upstream) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | Modelo base sin DWM |

No se dispone en la información proporcionada de datos verificados de otros modelos comparables de la misma escala (por ejemplo, otros MoE abiertos de varios cientos de miles de millones de parámetros) en cuanto a parámetros activos, contexto, rendimiento o licencia, por lo que no se incluye comparación cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Licencia MiniMax Community License: uso gratuito no comercial; el uso comercial requiere notificación o autorización según los términos. Las copias y derivados deben indicar "Built with MiniMax M3.1-Flash". Existen cláusulas de uso prohibido recogidas en el fichero LICENSE.
- El checkpoint del que deriva incorpora una modificación de pesos (DWM) sobre `o_proj` aplicada por un tercero (Blackfrost Research). No se documentan evaluaciones del efecto de esa intervención sobre calidad, seguridad o alineación, ni se justifica el término "DeRisked" con métricas.
- Repositorio de un tercero (`freakyskittle`) con 0 descargas y 0 likes en el momento de la consulta: no existe validación comunitaria de la conversión ni de las cuantizaciones.
- Cadena de transformaciones larga (upstream → DWM → conversión a GGUF → requantización). El autor afirma que el repaquetado NVFP4 es sin pérdida y la descompresión MXFP8 exacta, pero no hay verificación independiente publicada.
- Las cuantizaciones de baja precisión (TQ1_0 ~105 GB, IQ1_M ~115 GB, IQ2_XXS ~140 GB) degradan la calidad de forma notable; no se han publicado evaluaciones de esa degradación por nivel.
- Riesgo de alucinación: inherente a un modelo generativo de esta escala; no hay datos de evaluación de fidelidad ni de calibración en la información disponible.
- Contexto: los 1M+ tokens son una capacidad declarada; no se aportan mediciones de recuperación efectiva en contextos largos (needle-in-a-haystack u otras).
- Idiomas: no se declara lista de idiomas soportados ni calidad por idioma; no hay garantía documentada de rendimiento en castellano.
- Requisito de software estricto: solo funciona con builds recientes de llama.cpp que incluyan `minimax_m3_vl`; no hay soporte documentado en vLLM, TGI u Ollama.
- Complejidad de despliegue: GGUF dividido en shards (hay que descargar todos), más un `mmproj` separado para visión, con requisitos de memoria cercanos al tamaño del fichero.
- No hay datos de benchmarks, latencia ni throughput, lo que impide estimar coste operativo real en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/freakyskittle/MiniMax-3.1-Flash-DeRisked-GGUF
- Modelo base de la conversión: https://huggingface.co/Blackfrost-Research/MiniMax-3.1-Flash-DeRisked
- Modelo upstream referenciado en la model card: MiniMaxAI MiniMax-M3.1-Flash (sin URL proporcionada en la información disponible)
- Fichero de licencia: LICENSE dentro del repositorio de HuggingFace
- llama.cpp (requerido, con soporte `minimax_m3_vl`): no se proporciona URL específica en la información disponible; la model card cita `convert_hf_to_gguf.py` y `tools/mtmd/models/minimax-m3.cpp`
