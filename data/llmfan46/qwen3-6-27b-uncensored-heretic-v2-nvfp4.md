# llmfan46/Qwen3.6-27B-uncensored-heretic-v2-NVFP4

## Resumen

Qwen3.6-27B-uncensored-heretic-v2-NVFP4 es una cuantización en formato NVFP4 (8 bits empaquetados en FP4 con escalado por bloques, generada con NVIDIA ModelOpt) del modelo comunitario `llmfan46/Qwen3.6-27B-uncensored-heretic-v2`, a su vez un derivado "decensored" (abliterated) del modelo multimodal `Qwen/Qwen3.6-27B` de Alibaba. El autor de la cuantización y del fine-tuning es el contribuidor independiente llmfan46, que publica más de 70 modelos en Hugging Face.

El modelo base resuelve la tarea de generación de texto e imagen-a-texto (pipeline `image-text-to-text`) con aproximadamente 27.356 millones de parámetros (27,36 B), según los pesos `safetensors` publicados. Su rasgo diferencial es la eliminación de la capa de rechazo del modelo original mediante la técnica Heretic v1.2.0 combinada con una variante de Magnitude-Preserving Orthogonal Ablation (MPOA), que el autor reporta como una reducción de rechazos del 92/100 al 6/100 con una divergencia KL de 0,0021 respecto al original.

Es relevante ahora porque combina tres tendencias simultáneas: modelos multimodales de tamaño medio-grande (27 B), despliegue con cuantización de baja precisión para GPUs Blackwell con soporte NVFP4, y la comunidad de "abliteration" que busca eliminar restricciones de contenido preservando capacidades. La licencia declarada es Apache 2.0, heredada del modelo Qwen original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (8-bit empaquetado FP4, generado con ModelOpt); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización NVFP4, tag `modelopt`, `8-bit`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.6-27B de Alibaba, un transformer multimodal con capacidad de procesar imagen y texto (pipeline `image-text-to-text`). No se dispone de información detallada sobre el número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de preentrenamiento del modelo original en la información proporcionada.

El proceso de modificación es el siguiente: primero se aplicó Heretic v1.2.0 con una variante de Magnitude-Preserving Orthogonal Ablation (MPOA) sobre los componentes `attn.o_proj`, `attn.out_proj` y `mlp.down_proj`, con parámetros de dirección y pesos documentados en la model card (por ejemplo, `direction_index` 30,38; `mlp.down_proj.max_weight` 1,80). Después se cuantizó a NVFP4 con NVIDIA ModelOpt. El autor reporta una divergencia KL de 0,0021 frente al original y una reducción de rechazos de 92/100 a 6/100. No se documenta RLHF, DPO ni datos de entrenamiento adicionales.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`).
- Razonamiento y conocimiento general, con resultados MMLU reportados por el autor (86,65 % en el modelo original).
- Capacidad de respuesta sin rechazos ante contenido que el modelo original rechazaría (6/100 frentes a 92/100).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de modelos abliterated comparando la tasa de rechazos (6/100) y la divergencia KL (0,0021) frente al original, útil para evaluar el coste de eliminar la capa de rechazo.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas que el modelo original rechazaría, con la ventaja de mantener el 86,65 % de MMLU del original.
- Despliegue en GPUs Blackwell con NVFP4: la cuantización NVFP4 reduce el peso de 27,36 B parámetros a aproximadamente 14 GB, lo que permite servir el modelo en una sola GPU con soporte FP4 nativo (por ejemplo, B200) y liberar VRAM para el contexto.
- Procesamiento de documentos con imagen y texto: al ser image-text-to-text, puede emplearse en pipelines de extracción de información de capturas, formularios escaneados o diagramas combinados con instrucciones textuales.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de NVFP4 frente a BF16/FP8 en un modelo de 27 B, comparando respuestas y perplejidad.
- Fine-tuning posterior sobre dominio específico: al estar en safetensors y licencia Apache 2.0, puede partirse de esta base para ajustes con LoRA en tareas verticales, siempre que el hardware soporte NVFP4 o se reconvierta a otra precisión.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de MMLU del modelo original (no del cuantizado NVFP4), reportados por el autor:

| Metrica | Modelo original (Qwen3.6-27B) | Este modelo (NVFP4) |
|---|---|---|
| MMLU (7021 preguntas) | 86,65 % (6084 correctas) | no disponible |
| Rechazos | 92/100 | 6/100 |
| Divergencia KL vs original | 0 (por definición) | 0,0021 |

Desglose MMLU del original por asignatura (selección): `high_school_us_history` 98,95 %, `high_school_government_and_politics` 98,02 %, `astronomy` 97,47 %, `high_school_microeconomics` 97,06 %, `high_school_psychology` 97,04 %, `marketing` 96,33 %, `high_school_world_history` 96,23 %, `high_school_computer_science` 96,15 %, `high_school_biology` 95,39 %, `professional_medicine` 94,78 %, `high_school_european_history` 94,52 %, `sociology` 94,17 %, `medical_genetics` 94,12 %, `miscellaneous` 93,99 %, `high_school_macroeconomics` 92,89 %, `nutrition` 91,11 %, `security_studies` 91,07 %, `clinical_knowledge` 90,71 %, `world_religions` 90,91 %, `international_law` 90,00 %, `management` 90,00 %, `professional_psychology` 89,87 %, `elementary_mathematics` 89,67 %, `human_sexuality` 89,06 %, `philosophy` 88,68 %, `electrical_engineering` 86,42 %, `moral_disputes` 86,21 %, `high_school_physics` 85,71 %, `professional_accounting` 85,31 %, `college_medicine` 84,09 %, `machine_learning` 82,69 %, `human_aging` 81,90 %, `anatomy` 81,69 %, `formal_logic` 79,69 %, `econometrics` 79,63 %, `college_physics` 77,19 %, `moral_scenarios` 77,15 %, `college_mathematics` 76,36 %, `professional_law` 75,80 %, `public_relations` 73,77 %, `high_school_mathematics` 63,78 %, `global_facts` 62,75 %, `virology` 55,06 %.

No se han publicado resultados de benchmarks del modelo cuantizado NVFP4 en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,36 B parámetros en NVFP4 (aproximadamente 4 bits efectivos más escalas), el peso ronda los 14-15 GB; sumando KV cache y overhead, se recomienda al menos 24 GB de VRAM para contextos moderados.
- GPUs recomendadas: NVIDIA Blackwell (B200, RTX 5090) por soporte nativo de NVFP4; en GPUs Hopper/Ada (H100, RTX 4090) la decuantización en runtime es posible pero con menor eficiencia.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) y RTX 5090 (32 GB) con margen limitado; en GPUs de 16 GB probablemente no sin offloading.
- Opciones de despliegue: el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face Inference Endpoints; el soporte en vLLM, llama.cpp, Ollama o TGI para NVFP4 no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| llmfan46/Qwen3.6-27B-uncensored-heretic-v2-NVFP4 (este) | 27,36 B | no disponible | Apache 2.0 | safetensors NVFP4 | Cuantizado, 6/100 rechazos, KL 0,0021 |
| llmfan46/Qwen3.6-27B-uncensored-heretic-v2 | 27,36 B (asumido) | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva este |
| Qwen/Qwen3.6-27B | 27,36 B (asumido) | no disponible | Apache 2.0 | safetensors | Original de Alibaba, 92/100 rechazos, MMLU 86,65 % |
| Alternativas abliterated de 27 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información |

## Limitaciones y advertencias

- El proceso de abliteration elimina la capa de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o éticamente problemático sin filtros; no debe desplegarse en aplicaciones de cara al público sin moderación externa.
- La cuantización NVFP4 puede degradar la calidad respecto al modelo base en tareas sensibles a precisión (matemáticas, código, razonamiento numérico); no se han publicado métricas del cuantizado.
- La divergencia KL de 0,0021 indica cercanía al original, pero no garantiza ausencia de regresiones en capacidades específicas.
- No se dispone de información sobre sesgos, idiomas soportados ni longitud de contexto, lo que dificulta evaluar su idoneidad multilingüe o para contextos largos.
- Riesgo de alucinación inherente a los modelos de 27 B; sin datos de benchmarks propios del cuantizado no puede cuantificarse.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3.6-27B y el autor enlaza la licencia del original; conviene verificar términos del modelo base antes de producción.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura del repositorio.
- El modelo está etiquetado como `image-text-to-text`, pero no se documentan detalles sobre resolución de imagen, número de tokens visuales ni calidad de la percepción visual.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/llmfan46/Qwen3.6-27B-uncensored-heretic-v2-NVFP4
- Modelo base sin cuantizar: https://huggingface.co/llmfan46/Qwen3.6-27B-uncensored-heretic-v2
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia del original: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Blog sobre MPOA / biprojected abliteration: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
