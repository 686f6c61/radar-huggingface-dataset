# enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-BudgetJSD-Top20-ReverseKL-gap01-original10240

## Resumen

Este repositorio contiene un adaptador LoRA de investigación sobre Qwen/Qwen2.5-VL-7B-Instruct, publicado por el usuario enmingzhangzz. No es un modelo completo ni un fine-tuning integral: son 40 370 176 parámetros entrenables (r=16, alpha=32, dropout=0) que se cargan con PEFT sobre el modelo base público. El adaptador pertenece a una línea de experimentos denominada OPSD (destilación on-policy) combinada con VisionZip para la poda de tokens visuales.

El objetivo técnico es reducir el coste de cómputo del procesamiento visual: VisionZip retiene únicamente el 10 % de los tokens visuales (5 % dominantes y 5 % contextuales) y el entrenamiento fuerza al estudiante a preservar su distribución de salida pese a esa poda. La selección de tokens de respuesta se realiza mediante la divergencia Jensen-Shannon (`B_t = JSD(P_student,0.10 || P_student,0.11)`) y solo el 20 % de las posiciones con mayor B contribuyen a la pérdida, definida como KL inversa frente a un profesor EMA con visión completa y sin acceso a ground truth.

El artefacto interesa a quien investiga inferencia multimodal eficiente y destilación on-policy. Conviene subrayar que no se declaran resultados de benchmarks, que la licencia no está especificada y que el adaptador por sí solo no activa la poda VisionZip: es material de reproducción experimental, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el decodificador de lenguaje de Qwen2.5-VL-7B-Instruct (transformer multimodal con torre visual ViT y decoder LLM); la torre visual permanece congelada |
| Parámetros totales | 7B en la denominación del modelo base; el adaptador añade 40 370 176 parámetros entrenables |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantización | el adaptador se publica en BF16 (safetensors); no se documentan versiones cuantizadas. La cuantización aplica al fusionar con el modelo base (8-bit bitsandbytes, 4-bit AWQ/GPTQ, GGUF Q4_K_M de la comunidad) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible en la model card del adaptador; el modelo base Qwen2.5-VL-7B-Instruct se distribuye bajo licencia Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se distribuye también en safetensors |
| Tamaño del repositorio | 0,2 GB |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

El adaptador se inicializa desde una copia fresca de Qwen2.5-VL-7B-Instruct (no desde el adaptador profesor con ground truth) y se entrena con LoRA r=16, alpha=32 y dropout=0 aplicado solo al decodificador de lenguaje; la torre visual queda congelada. El entrenamiento usa el dataset OpenMMReasoner-SFT-874K en una selección fija de 10 240 ejemplos en orden original, con 320 actualizaciones de optimizador (AdamW, learning rate 2e-5, weight decay 0), batch efectivo de 32 (4 GPUs x microbatch 8 x acumulación 1), precisión BF16, FlashAttention2 y chunks de KL de 32 posiciones de respuesta. Los píxeles mínimo y máximo se fijan en 846 720, y el rollout es greedy con un máximo de 512 tokens nuevos.

La innovación reside en el esquema de selección de tokens y en el objetivo. Sobre cada prefijo de respuesta generado por el estudiante se calcula `B_t = JSD(P_student,0.10 || P_student,0.11)`, es decir, una Jensen-Shannon simétrica con mezcla equitativa entre dos distribuciones del propio estudiante, donde la intervención aumenta la retención visual en un punto porcentual absoluto (de 0,10 a 0,11). Por cada respuesta se seleccionan `max(1, ceil(0.20 * N))` posiciones con mayor B, con puntuaciones desacopladas y desempate estable por orden de token, y se optimiza la media aritmética de su KL inversa original frente a un profesor EMA de visión completa (decay 0,9999). No hay umbral de elegibilidad por KL, puntuación de entropía/F/TIP, agrupación por lambda ni renormaliación adicional de la masa de pérdida. La configuración guardada incluye `opsd.kl_direction: forward` como valor heredado inactivo; el modo de selección nativa usa `native_budget_weighting.kl_direction: reverse`. El entrenamiento completó cada posición de muestra original exactamente una vez y se verificaron los checkpoints de arranque en 32 y la recuperación con estado de 32 a 64 antes de llegar a 10 240.

## Capacidades

- Generación de texto e imagen-a-texto multimodal, heredada del modelo base Qwen2.5-VL-7B-Instruct.
- Razonamiento multimodal sobre imágenes, incluyendo tareas del dominio de OpenMMReasoner (razonamiento matemático y científico con entrada visual).
- Inferencia con poda de tokens visuales mediante VisionZip (retención del 10 %: 5 % dominantes y 5 % contextuales), lo que reduce el número de tokens visuales procesados.
- Destilación on-policy con selección de tokens por presupuesto (Top 20 % de posiciones según B/JSD) y pérdida KL inversa.
- Soporte de tool calling y function calling: no confirmado en la información proporcionada (el modelo base lo soporta, pero la model card del adaptador no lo declara).
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: no se declara modo thinking, audio ni vídeo en la model card del adaptador.

## Casos de uso

- Investigación en poda de tokens visuales: el adaptador permite reproducir el efecto de VisionZip con retención del 10 % sobre el decodificador de Qwen2.5-VL-7B-Instruct y comparar la distribución de salida con la del modelo base sin poda. Es su uso principal y el único respaldado explícitamente por la model card.
- Reproducción de experimentos OPSD: el repositorio incluye configuración saneada, métricas escalares de las cuatro réplicas y auditorías de finalización, lo que permite auditar el esquema de selección Top 20 % con pérdida KL inversa.
- Estudio de destilación on-policy con profesor EMA: sirve para analizar cómo se comporta un profesor de visión completa sin ground truth (decay 0,9999) frente a un estudiante con visión podada.
- Análisis de documentos y razonamiento visual (con el modelo base subyacente): OCR, comprensión de gráficos y preguntas sobre imágenes, siempre que se acepte la falta de validación del adaptador.
- Prototipado de asistentes multimodales de bajo coste: la poda de tokens visuales reduce el cómputo de atención sobre imágenes, lo que resulta útil en escenarios con muchas imágenes por consulta.
- Evaluación comparativa de adaptadores LoRA: sirve como punto de referencia interno frente a otras variantes del mismo autor (`r010`, `gap01`, distintos presupuestos de selección).
- Integración en pipelines de investigación con PEFT y Transformers: al ser un adaptador de 0,2 GB, se puede cargar y descartar rápidamente en entornos de experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ningún resultado de benchmark.

El único dato numérico de entrenamiento reportado es la pérdida media de entrenamiento del último batch, promediada sobre las cuatro réplicas: 0,09053276106715202. El propio autor advierte de que esta cifra no es una puntuación de evaluación, ni una media de todo el entrenamiento, ni es directamente comparable con experimentos que usen otro contexto de profesor u otro objetivo de selección de tokens.

| Métrica | Valor | Nota |
|---|---|---|
| Pérdida de entrenamiento (último batch, media de 4 réplicas) | 0,09053276106715202 | Métrica de entrenamiento, no benchmark |
| MMLU, HumanEval, GSM8K, MMMU, etc. | no disponibles | No declarados |

## Requisitos de hardware

- Pesos del modelo base en BF16: aproximadamente 15-17 GB solo para los pesos de un modelo de 7B; el adaptador añade unos 0,08 GB.
- Inferencia en BF16 con caché KV y torre visual: estimación de 20-24 GB de VRAM.
- Cuantización de 8 bits: estimación de 10-12 GB de VRAM.
- Cuantización de 4 bits (AWQ/GPTQ, GGUF Q4_K_M): estimación de 6-8 GB de VRAM.
- GPU recomendadas: A100 40/80 GB, H100, L40S para BF16 sin cuantizar; RTX 4090 (24 GB) para BF16 con tensor parallelism o para cuantizaciones de 8 y 4 bits; RTX 3090 y tarjetas de 12-16 GB para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización de 4 bits, en GPUs de 12 GB o superiores.
- Entrenamiento reportado: 4 GPUs con BF16, FlashAttention2, microbatch 8 y batch efectivo 32; el modelo exacto de GPU no se especifica.
- Opciones de despliegue: Transformers + PEFT para el adaptador, vLLM o TGI una vez fusionado el adaptador con el modelo base, llama.cpp/Ollama mediante versiones GGUF del modelo base fusionado. VisionZip requiere habilitar su runtime oficial por separado.
- Latencia y throughput medidos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Poda de tokens | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (OPSD / VisionZip r010 / Top20 % / KL inversa) | 40 370 176 entrenables sobre Qwen2.5-VL-7B | no disponible (heredado del base) | VisionZip, retención del 10 % | no disponible | adaptador LoRA en HuggingFace, 0 descargas |
| Qwen/Qwen2.5-VL-7B-Instruct (base) | 7B (denominación oficial) | no disponible en la información proporcionada | no | Apache 2.0 | modelo completo ampliamente disponible |
| Qwen2-VL-7B-Instruct (generación anterior) | familia 7B | no disponible en la información proporcionada | no | Apache 2.0 | modelo completo ampliamente disponible |
| Otros adaptadores de investigación con VisionZip | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la búsqueda web alternativas comparables de la misma categoría (adaptadores LoRA de investigación que combinen destilación on-policy con poda VisionZip). No se dispone de datos de rendimiento que permitan una comparación cuantitativa entre estas opciones.

## Limitaciones y advertencias

- Riesgo de sobreinterpretación: la model card no declara ningún resultado de benchmark; la pérdida de entrenamiento de 0,0905 no mide calidad de modelo.
- Licencia del adaptador no especificada: su uso comercial no puede darse por supuesto, aunque el modelo base sea Apache 2.0. Es imprescindible aclarar la licencia con el autor antes de cualquier uso en producción.
- El adaptador por sí solo no activa la poda: hay que cargar el modelo base con PEFT y habilitar el runtime oficial de VisionZip por separado para la inferencia podada.
- Alcance del entrenamiento limitado: solo se ajusta el decodificador de lenguaje (LoRA); la torre visual permanece congelada, por lo que no se adapta la representación visual a la poda.
- Datos no balanceados: la propia model card indica que la selección de 10 240 ejemplos de OpenMMReasoner no está balanceada, lo que puede sesgar el comportamiento hacia los dominios sobrerrepresentados.
- Única fuente de datos: el entrenamiento se realizó sobre OpenMMReasoner-SFT-874K, con posible sesgo de dominio y de idioma.
- Reproducibilidad incompleta: los estados de optimizador, EMA y RNG permanecen en AutoDL y no forman parte del repositorio; no es posible reanudar el entrenamiento exactamente desde el adaptador publicado.
- Ambigüedad de configuración: existe una clave heredada `opsd.kl_direction: forward` inactiva en el config guardado; el autor señala que el modo nativo usa `kl_direction: reverse`. Cualquier reutilización del config debe tenerlo en cuenta.
- Ausencia de validación externa: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso independiente.
- Idiomas y contexto: no declarados, por lo que no se puede garantizar cobertura multilingüe ni longitudes de contexto concretas más allá de lo que soporte el modelo base.
- No apto para producción tal cual: se trata de un artefacto de investigación con criterios de selección de tokens muy específicos y sin evaluación de robustez, seguridad ni sesgos.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-BudgetJSD-Top20-ReverseKL-gap01-original10240
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenMMReasoner/OpenMMReasoner-SFT-874K
- Paper o blog de VisionZip: no disponible en la información proporcionada
- Repositorio de código de OPSD: no disponible en la información proporcionada
- Demos: no disponibles
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo ni sobre su línea de investigación (los resultados obtenidos correspondían a temas no relacionados).
