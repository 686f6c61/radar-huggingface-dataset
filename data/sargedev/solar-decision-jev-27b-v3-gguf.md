# SargeDev/Solar-Decision-JEV-27B-V3-GGUF

## Resumen

Solar-Decision-JEV-27B-V3 es un modelo de 27.320.697.856 parámetros (≈27,3B) publicado por SargeDev como fine-tune LoRA del backbone abliterado huihui-ai/Huihui-Qwen3.8-27B-abliterated. Su particularidad no es el chat convencional, sino que incorpora en los pesos un "readout" de decisiones tipadas: el modelo no genera una respuesta en lenguaje natural para clasificar, sino que se ejecuta un único prefill con `max_tokens=1` y se leen las log-probabilidades sobre los tokens de cada opción, devolviendo una decisión estructurada (campos `choice`, `score` y `noul`) junto con su probabilidad. Es la tercera iteración de la familia Solar-Decision-JEV, tras V1 y V2.

La versión V3 introduce dos cambios respecto a V2: entrena el LoRA (r32/α64) sobre la unión de los corpus jev-distill-corpus-v3 y solar-decisions-corpus-v4 (764.626 filas, 90 dominios) en lugar de solo el segundo, y añade `lm_head` a los módulos objetivo del adaptador, de forma que la geometría del vocabulario de salida se entrena junto con la cabeza de decisión. El merge se realizó en el paso 2184.

La relevancia práctica es doble: por un lado, mejora de forma notable la precisión top-1 en decisiones frente a V2 (0,571 → 0,833 en `choice`), acercándose a la referencia r32-alone (0,869) aunque sin alcanzar el umbral de AutoTrust (0,904); por otro, se distribuye también como escalera GGUF de 11 cuantizaciones, lo que permite ejecutarlo en hardware de consumo para uso conversacional. Conviene subir la advertencia: la ruta de decisión tipada solo funciona en vLLM, porque llama.cpp no devuelve las log-probabilidades por token que necesita el mecanismo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune LoRA fusionado sobre Qwen3.8-27B); no se indica que sea MoE |
| Parámetros totales | 27.320.697.856 (≈27,3B) |
| Parámetros activos | No aplica (modelo denso, según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF: F16 y Q2_K a Q8_0 (11 cuantizaciones en total, incluida Q4_K_M); NVFP4-FP8 en repositorio aparte (29 GB); pesos bf16 sin cuantizar |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; el backbone es Qwen, pero no se aporta confirmación) |
| Licencia | Apache-2.0 según el frontmatter de la model card; los metadatos de HuggingFace no declaran licencia |
| Formato de pesos | safetensors bf16 (19 shards, 52 GB), GGUF y NVFP4-FP8 |
| Tamaño del repositorio | 235,1 GB |
| Cabeza de decisión | 24 slots, con `decision_head.json`, `calibration.json` y `serve_decide.py` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte del backbone abliterado de huihui-ai sobre Qwen3.8-27B, un transformer decoder-only denso de 27,3B parámetros al que se le ha aplicado abliteration (eliminación de la dirección de rechazo en el espacio de activaciones). Sobre esa base se entrena un LoRA de rango 32 y alpha 64 cuyos módulos objetivo incluyen atención, MLP y, como novedad de V3, la matriz `lm_head`. Esto último es relevante porque el mecanismo de decisión depende directamente de la geometría de logits sobre tokens de opción: entrenar `lm_head` alinea esa geometría con la tarea de clasificación en lugar de dejarla heredada del modelo base.

Los datos de entrenamiento son la unión de SargeDev/jev-distill-corpus-v3 (corpus público Apache-2.0 de salidas del profesor Jev 1.13, de TypeSafe AI, referenciado pero no redistribuido) y SargeDev/solar-decisions-corpus-v4, sumando 764.626 filas repartidas en 90 dominios. La combinación busca cubrir el "readout gap" a nivel de datos: las filas de estilo verbalizador/forma de decisión propias de la geometría r32 entran en la mezcla. El merge se hizo en el paso 2184. No se documentan en la información disponible el número total de tokens vistos, la composición exacta del dataset por dominio ni si hubo fases de RLHF o DPO; el pipeline se describe como destilación supervisada sobre corpus.

Como detalle técnico adicional, el repositorio conserva los tensores del drafter MTP/nextn, de modo que la decodificación especulativa funciona en llama.cpp. La ruta de decisión no requiere una cabeza separada que ejecutar en producción: el "head" está entrenado dentro del modelo y se materializa como lectura de log-probabilidades en un solo paso de prefill.

## Capacidades

- Generación de texto conversacional multirretorno, etiquetada como `conversational` y compatible con endpoints tipo OpenAI (`endpoints_compatible`).
- Emisión de decisiones tipadas en una sola pasada de prefill con `max_tokens=1`, leyendo log-probabilidades sobre los tokens de opción.
- Soporte de tres tipos de salida estructurada: `choice` (elección entre opciones), `score` (puntuación) y `noul` (detección de ausencia/abstención, con AUROC de 0,988).
- Cabeza de decisión de 24 slots con calibración asociada (`calibration.json`), lo que permite mapear log-probabilidades a probabilidades calibradas.
- Decodificación especulativa mediante drafter MTP/nextn preservado, operativa en llama.cpp.
- Comportamiento sin rechazos (abliterated/uncensored), útil para contenido que los modelos alineados estándar bloquean.
- Inferencia cuantizada en CPU/GPU mixta vía GGUF, con 11 niveles de cuantización disponibles.
- Capacidades multimodales: no disponibles en esta variante (existe una variante separada, Solar-Decision-JEV-27B-VL, sin datos técnicos en la información proporcionada).
- Tool calling / function calling: no disponible (no se documenta en la model card).
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Clasificación y enrutado de tickets en producción: el modelo devuelve, en un único prefill, la categoría elegida entre un conjunto de opciones con su log-probabilidad asociada. Es adecuado porque evita generar texto libre y permite fijar umbrales de confianza por clase antes de escalar a un humano.
- Puerta de abstención en pipelines RAG: la salida `noul` (AUROC 0,988, top-1 0,939) sirve para decidir si el contexto recuperado es suficiente antes de responder. Se usaría como paso previo al modelo generador, descartando consultas sin evidencia.
- Puntuación automática de respuestas y pares en evaluación de modelos: la salida `score` top-1 de 0,794 permite ordenar candidatos; dado el ECE elevado, conviene usar el ranking y no la probabilidad bruta.
- Chat interno sin censura sobre documentación técnica: la variante GGUF Q4_K_M (15,65 GiB) se ejecuta en una GPU de 24 GB con llama.cpp u Ollama, útil para prototipado y para dominios donde el modelo base rechaza peticiones legítimas.
- Moderación y triaje de contenido sensible: al estar abliterado, puede clasificar material que los modelos alineados rechazan, aunque requiere supervisión humana explícita por la ausencia de salvaguardas.
- Extracción de decisiones en agentes multi-paso: cada nodo del grafo de decisión puede resolverse con una llamada corta (1 token de salida) a vLLM, reduciendo coste por paso frente a la generación de texto completo.
- Experimentación en investigación sobre calibración: la propia model card documenta la degradación de ECE (0,021 → 0,167), lo que convierte al modelo en un caso de estudio útil para comparar precisión frente a calibración en cabezas de clasificación entrenadas dentro del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas internas de la compuerta de decisión sobre 27.695 filas, con el mismo arnés, cabeza y calibración para todas las columnas:

| Métrica | V2 (r32+1894) | V3 (paso 2184) | Referencia r32-alone | Umbral AutoTrust |
|---|---|---|---|---|
| choice top-1 | 0,571 | 0,833 | 0,869 | 0,904 |
| score top-1 | 0,567 | 0,794 | No disponible | 0,891 |
| noul AUROC | 0,962 | 0,988 | 0,992 | 0,996 |
| noul top-1 | 0,879 | 0,939 | No disponible | No disponible |
| choice ECE | 0,021 | 0,167 | No disponible | No disponible |

El propio autor califica el resultado como "por debajo del umbral" en `choice` y `score` top-1: V3 cierra aproximadamente dos tercios de la brecha que dejó V2 respecto a r32-alone, pero no llega a la barra. El salto de ECE (0,021 → 0,167) indica mayor confianza en filas difíciles: mejor ranking, peor calibración.

Rendimiento de inferencia medido con llama-bench sobre GB10 con build CUDA, `-ngl 99`, pp512 / tg128:

| Cuantización | Tamaño | pp512 (tok/s) | tg128 (tok/s) |
|---|---|---|---|
| Q4_K_M | 15,65 GiB | 865,94 | 12,80 |
| Q8_0 | 27,04 GiB | 818,03 | 8,38 |

## Requisitos de hardware

- VRAM para bf16: los pesos ocupan 52 GB repartidos en 19 shards; se necesitan del orden de 55-60 GB de VRAM (o reparto multi-GPU) para inferencia sin cuantizar. LLM Explorer cita 55,6 GB de VRAM para el modelo de 27B de la familia.
- VRAM para Q8_0: 27,04 GiB de pesos; encaja en GPU de 32 GB o superiores (A100 40 GB, H100, RTX 5090 de 32 GB) y en configuraciones de 2×24 GB.
- VRAM para Q4_K_M: 15,65 GiB, la opción realista para una RTX 4090 o 3090 de 24 GB, con margen para contexto.
- Cabe en GPU de consumo: sí, mediante Q4_K_M o inferiores en 24 GB; las cuantizaciones Q2_K-Q3_K, al ser menores que Q4_K_M, podrían entrar en 12-16 GB, aunque no se han publicado medidas de rendimiento para ellas en la información disponible.
- Despliegue conversacional: llama.cpp, Ollama o cualquier runtime GGUF; el tag `endpoints_compatible` sugiere compatibilidad con servidores de endpoints estilo OpenAI. TGI y otras pilas no están documentadas.
- Despliegue para decisiones tipadas: exclusivamente vLLM con los pesos bf16 (o el repo NVFP4-FP8), ya que llama.cpp no devuelve las log-probabilidades por token que necesita `serve_decide.py`.
- Latencia y throughput: con Q4_K_M en GB10, 865,94 tok/s de prefill y 12,80 tok/s de generación; con Q8_0, 818,03 y 8,38 respectivamente. Las decisiones tipadas, al resolverse con 1 token de salida, se benefician sobre todo del prefill.
- Decodificación especulativa: disponible en llama.cpp gracias a los tensores MTP/nextn preservados, lo que puede elevar el throughput de generación sobre los valores base medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Métricas de decisión (choice top-1 / noul AUROC / ECE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Solar-Decision-JEV-27B-V3 (este) | 27,3B | No disponible | 0,833 / 0,988 / 0,167 | Apache-2.0 según model card | GGUF (11 quants), bf16, NVFP4-FP8 |
| Solar-Decision-JEV-27B (V2, r32+1894) | ≈27B | No disponible | 0,571 / 0,962 / 0,021 | No disponible | GGUF |
| JEV-27B-Uncensored (r32-alone) | ≈27B | No disponible | 0,869 / 0,992 / No disponible | No disponible | GGUF con imatrix |
| Huihui-Qwen3.8-27B-abliterated (base) | ≈27B | No disponible | No aplica (sin cabeza de decisión) | No disponible | Pesos completos |

La comparación es interna a la familia: las tres variantes comparten backbone y corpus de origen, y solo se diferencian en la geometría del LoRA, los datos y el punto de merge. Frente a V2, este V3 gana 26,2 puntos de top-1 en `choice` y 22,7 en `score`, pero pierde calibración (ECE 0,167 frente a 0,021). Frente a r32-alone, sigue 3,6 puntos por debajo en `choice` y 3,4 puntos en `noul AUROC`. No hay datos publicados que permitan compararlo con modelos de decisión de otros fabricantes.

## Limitaciones y advertencias

- Precisión insuficiente para el umbral declarado: `choice` top-1 de 0,833 frente a la barra de 0,904, y `score` top-1 de 0,794 frente a 0,891. No debe desplegarse como clasificador crítico sin validación propia.
- Calibración degradada: el ECE de `choice` sube de 0,021 (V2) a 0,167 en V3. Las probabilidades devueltas son comparativamente más altas de lo que corresponde a la tasa real de acierto en filas difíciles; si se necesitan probabilidades calibradas, el autor recomienda r32-alone (JEV-27B-Uncensored).
- Ruta de decisión atada a vLLM: llama.cpp no expone las log-probabilidades por token necesarias. Usar el GGUF para decisiones produce resultados incorrectos, no solo degradados.
- Modelo abliterado: la eliminación de la dirección de rechazo implica que no hay salvaguardas de contenido. Requiere filtros externos y supervisión humana en cualquier despliegue orientado a usuarios.
- Riesgo de alucinación: no evaluado en la información disponible, y el modelo conserva el comportamiento generativo del backbone Qwen. La salida `noul` mitiga el problema solo en el subconjunto de tareas donde se aplica.
- Idiomas: no se declara lista de idiomas soportados. El backbone Qwen es multilingüe por diseño, pero no hay evaluación publicada para este fine-tune.
- Longitud de contexto: no documentada. No debe asumirse la ventana del modelo base sin verificarla empíricamente.
- Licencia: la model card declara Apache-2.0, pero los metadatos de HuggingFace no la exponen y el modelo deriva de un backbone abliterado de terceros y de un corpus destilado de un profesor propietario (Jev 1.13, de TypeSafe AI, no redistribuido). Verificar la cadena de licencias antes de uso comercial.
- Sin validación externa: 0 descargas y 0 likes en el momento del análisis, sin benchmarks estándar ni evaluaciones independientes. Además, el autor declara explícitamente no estar afiliado ni respaldado por TypeSafe AI.
- El repositorio completo pesa 235,1 GB, lo que complica el almacenamiento y la distribución si se quieren todas las cuantizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V3-GGUF
- Versión V2: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-GGUF
- Cuantización NVFP4-FP8: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V3-NVFP4-FP8
- Referencia r32-alone (JEV-27B-Uncensored): https://huggingface.co/SargeDev/JEV-27B-Uncensored-GGUF
- Ficha en abliteration.org: https://abliteration.org/models/SargeDev/JEV-27B-Uncensored-GGUF
- Ficha en LLM Explorer (variante VL): https://llm-explorer.com/model/SargeDev%2FSolar-Decision-JEV-27B-VL,idNr62f3ZRVLOv3X30OcP
- Nota de prensa de AutoTrust AI sobre JEV-27B: https://www.tmcnet.com/usubmit/2026/09/28/10452979.htm
- Corpus de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Corpus de decisiones solares: https://huggingface.co/datasets/SargeDev/solar-decisions-corpus-v4
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
