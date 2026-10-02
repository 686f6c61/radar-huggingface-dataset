# ADSKAILab/AutoIndexer-8B-LoRA-Instruct

## Resumen

AutoIndexer-8B-LoRA-Instruct es un checkpoint de investigación publicado por el laboratorio ADSKAILab. Se trata de un backbone Qwen3-8B afinado mediante LoRA (con los adaptadores fusionados en los pesos base) con el objetivo de entrenamiento propio de AutoIndexer, denominado chain-of-edits. El modelo no es un instruct genérico al uso: incorpora maquinaria de atención personalizada con marcadores de edición/retorno/EOS, una "index head" que predice las posiciones de inicio y fin de un cursor, y una "marker head" que clasifica si un token es una edición o un token normal.

El checkpoint corresponde a la ejecución `autoindexer_8B_lora_p5_20260918-220528_focal-loss-top-p-1.0` y tiene un gemelo entrenado desde el modelo base en el repositorio hermano `ADSKAILab/AutoIndexer-8B-LoRA-Base`. El prefijo "Instruct" del nombre no implica que se haya realizado un ajuste por instrucciones convencional con RLHF o DPO: la model card no documenta ninguna fase de alineamiento de ese tipo, sino el objetivo de chain-of-edits.

Su relevancia es fundamentalmente investigadora. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, la licencia es "other" sin términos detallados, y el modelo requiere `trust_remote_code=True` porque la clase `AutoIndexerQwen3Model` no existe en el paquete `transformers`. Esto lo convierte en un artefacto para experimentación con arquitecturas de edición secuencial, no en una opción recomendable para producción sin una validación previa exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con `model_type` personalizado `autoindexer_qwen3` y clase `AutoIndexerQwen3Model`; cabezas adicionales de marcador e índice |
| Parámetros totales | 8.192.852.996 (dato real de safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen3-8B soporta 32.768 tokens nativos |
| Tipos de cuantización | No disponible (el repo publica pesos en bf16; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | other (términos no detallados en la información disponible) |
| Formato de pesos | safetensors (16,4 GB de repositorio), con código de modelado personalizado en `modeling_autoindexer.py` |

## Arquitectura y entrenamiento

El backbone es Qwen3-8B con `hidden_size=4096`, 36 capas (`num_hidden_layers=36`), 32 cabezas de atención (`num_attention_heads=32`) y 8 cabezas de clave/valor (`num_key_value_heads=8`), es decir, atención con consultas agrupadas (GQA). Sobre esta base se añade maquinaria propia: marcadores de edición, retorno y EOS; una index head que coloca el cursor (inicio/fin); y una marker head que decide en cada paso si el token generado es una edición o un token normal. Los adaptadores LoRA se fusionaron en los pesos del modelo base, por lo que el artefacto final no requiere cargar un adaptador aparte.

El backend de atención se selecciona mediante `config.autoindexer_attn_implementation` y aplica una degradación automática en cascada: `autoindexer_cutedsl` (opción por defecto, la más rápida, requiere CuteDSL o `flash_attn` compilado para GPUs Hopper o superiores, sm 9.0+), `autoindexer_triton` (se usa si CuteDSL no está disponible pero sí Triton y CUDA) y `autoindexer_eager` (fallback puro de PyTorch, siempre disponible, compatible con CPU, más lento y con mayor consumo de memoria). Se puede forzar un backend concreto pasando `attn_implementation="autoindexer_eager"` a `from_pretrained`.

El objetivo de entrenamiento combina una perturbación de chain-of-edits con pérdidas de token, de marcador y de índice. El `forward` espera `labels`; si se invoca solo con `input_ids` ejecuta una pasada causal-LM estándar de puntuación, útil para arneses de evaluación de verosimilitud. La generación usa un bucle de muestreo propio (`AutoIndexerModelBase._sample`) que muestrea en cada paso tanto la marker head como la index head. No se documentan en la model card el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, por lo que esos datos figuran como no disponibles.

## Capacidades

- Generación de texto autoregresiva sobre el backbone Qwen3-8B, con posibilidad de ejecutar una pasada causal-LM de puntuación cuando no se proporcionan `labels`.
- Generación orientada a edición secuencial: el modelo puede emitir operaciones de edición delimitadas por marcadores en lugar de reescribir el texto completo.
- Predicción de cursor: la index head determina posiciones de inicio y fin sobre las que aplicar la edición.
- Clasificación token a token entre edición y token normal mediante la marker head.
- Control fino del muestreo a través de parámetros de `generation_config`: `marker_calibration_weight`, `greedy_mid_edit`, `max_delete_span`, `exclude_prompt_from_edits`, `editable_start`, `marker_top_p` y `marker_temperature`.
- Compatibilidad con evaluación de verosimilitud sobre `input_ids` sin etiquetas.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado como capacidad alineada; el bucle de edición es multi-paso por diseño, pero no equivale a razonamiento agéntico verificado.
- Capacidades multilingües: no documentadas.
- Visión, audio o modo "thinking": no disponibles.

## Casos de uso

- Investigación en objetivos de entrenamiento basados en edición: el modelo permite estudiar experimentalmente el paradigma chain-of-edits frente a la generación completa, comparando curvas de pérdida y comportamiento de las cabezas de marcador e índice.
- Prototipado de editores de texto asistidos: el modelo puede recibir un documento, situar el cursor mediante la index head y emitir únicamente las ediciones necesarias, lo que reduce la cantidad de tokens generados frente a una reescritura íntegra.
- Refactorización de código a nivel de parche: al trabajar con operaciones de edición y no con reescrituras, encaja en flujos donde se aplican parches sobre ficheros existentes, siempre que se valide la corrección del parche antes de integrarlo.
- Evaluación de backends de atención personalizados: sirve como banco de pruebas para comparar `autoindexer_cutedsl`, `autoindexer_triton` y `autoindexer_eager` en términos de velocidad y memoria en distintos entornos de GPU.
- Estudio de cabezas auxiliares en transformers: la marker head y la index head son un caso concreto para analizar cómo se comporta un modelo cuando se le añaden objetivos auxiliares sobre la representación del backbone.
- Reproducción de experimentos del sweep de entrenamiento: junto al repositorio hermano `AutoIndexer-8B-LoRA-Base`, permite comparar el efecto de partir de un modelo base frente a uno ya ajustado.
- Aplicaciones de anotación estructurada: la combinación de cursor y marcador puede adaptarse a tareas donde hay que señalar y modificar segmentos concretos de un texto, como corrección de estilo o normalización de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente resultados sin relación con el tema). Tampoco se aportan métricas propias del objetivo de chain-of-edits, como precisión de colocación del cursor o tasa de ediciones correctas.

## Requisitos de hardware

- Inferencia en bf16: los pesos ocupan aproximadamente 16,4 GB, por lo que se necesita una GPU con al menos 24 GB de VRAM para trabajar con margen de caché KV.
- Caché KV estimada: con 36 capas, 8 cabezas KV y dimensión de cabeza de 128, la caché en bf16 ronda los 144 KiB por token; 32.768 tokens suponen del orden de 4,7 GB adicionales. Es una estimación basada en GQA estándar y no una cifra publicada por el autor.
- GPU recomendadas: para el backend por defecto `autoindexer_cutedsl` se requiere hardware Hopper o superior (H100, H200; sm 9.0+). En GPUs Ampere o Ada (A100, RTX 4090) el modelo degradará a `autoindexer_triton` o a `autoindexer_eager`.
- GPU de consumo: cabe en una RTX 4090 de 24 GB en bf16 con contexto moderado, y en tarjetas de 16 GB solo con cuantización no oficial. No se publican pesos cuantizados.
- Opciones de despliegue: al tratarse de código personalizado con `trust_remote_code=True`, no hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI. El despliegue previsto es mediante `transformers` con `AutoModel.from_pretrained` y `device_map="cuda"`.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AutoIndexer-8B-LoRA-Instruct | 8,19 B | No especificado (base Qwen3-8B: 32.768 nativos) | other | HuggingFace, requiere `trust_remote_code` | Objetivo chain-of-edits y cabezas auxiliares; sin benchmarks publicados; 0 descargas |
| Qwen/Qwen3-8B | 8,2 B (aprox.) | 32.768 nativos, ampliable a 131.072 con YaRN | Apache 2.0 | HuggingFace, integrado en `transformers` | Modelo base sobre el que se construye este checkpoint; soporte estándar en el ecosistema |
| Llama 3.1 8B | 8,03 B | 128.000 | Llama 3.1 Community License | HuggingFace y múltiples runtimes | Amplia adopción y tooling maduro; licencia con restricciones para grandes despliegues |
| Mistral 7B v0.3 | 7,25 B | 32.000 | Apache 2.0 | HuggingFace y múltiples runtimes | Alternativa de tamaño similar con licencia permisiva |

La comparación con los modelos de la tabla es orientativa en cuanto a tamaño y categoría, ya que AutoIndexer-8B-LoRA-Instruct persigue un objetivo de modelado distinto (edición secuencial) y no compite en las mismas tareas de evaluación general. No se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en tareas estándar de generación, código o matemáticas.
- Licencia "other" sin términos detallados: no se puede determinar si el uso comercial está permitido, por lo que debe tratarse como no apto para producción hasta aclararlo con el autor.
- Código remoto obligatorio: `trust_remote_code=True` ejecuta código de modelado y atención incluido en el repositorio, lo que implica un riesgo de seguridad y de compatibilidad con versiones futuras de `transformers`.
- Acoplamiento a hardware: el backend por defecto requiere CuteDSL o `flash_attn` compilado para Hopper o superior; en otras GPUs la degradación a Triton o eager reduce el rendimiento de forma no cuantificada.
- API de uso no convencional: el `forward` espera `labels` para su objetivo de entrenamiento y `generate()` usa un bucle de muestreo propio con parámetros adicionales; no es un desplegable directo con la interfaz estándar de chat.
- Idiomas soportados no documentados: se desconoce el comportamiento multilingüe y si el ajuste LoRA ha degradado capacidades del modelo base en idiomas distintos del inglés.
- Riesgo de alucinación: no evaluado ni documentado; en tareas de edición, una colocación errónea del cursor puede producir modificaciones destructivas sobre el texto de entrada.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad, ni filtrado de datos de entrenamiento (composición del dataset no disponible).
- Madurez muy baja: 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni informes de terceros que validen su comportamiento.
- Fechas del repositorio: los metadatos indican creación y actualización en octubre de 2026, lo que conviene verificar antes de integrarlo en cualquier flujo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ADSKAILab/AutoIndexer-8B-LoRA-Instruct
- Repositorio hermano (entrenado desde el modelo base): https://huggingface.co/ADSKAILab/AutoIndexer-8B-LoRA-Base
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- La búsqueda web realizada no devolvió papers, blogs, repositorios ni demos relacionados con este modelo.
