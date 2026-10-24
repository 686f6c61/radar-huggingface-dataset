# mradermacher/TranslatePsy-AfriSLM-0.8B-i1-GGUF

## Resumen

TranslatePsy-AfriSLM-0.8B-i1-GGUF es la versión cuantizada en formato GGUF del modelo TranslatePsy-AfriSLM-0.8B, un modelo de traducción automática conversacional desarrollado por qvac (equipo vinculado a Tether) y especializado en inglés y 19 lenguas del África subsahariana. Esta ficha concreta corresponde a las cuantizaciones i1 generadas por mradermacher con calibración imatrix a partir de los pesos originales en safetensors, con el objetivo de permitir inferencia en CPU y GPUs de consumo.

El modelo parte de una arquitectura de tipo transformer (la etiqueta del repositorio apunta a la familia Qwen3.5, aunque la model card no detalla la arquitectura exacta) y cuenta con 1.006.672.704 parámetros reales según safetensors, pese a la denominación comercial "0.8B". Su relevancia radica en la tesis del paper asociado (arXiv:2608.18655, titulado "High-Quality Data Scaling for Low-Resource Machine Translation"): mediante filtrado por estimación de calidad y generación de datos sintéticos, un modelo de menos de mil millones de parámetros puede superar en traducción africana a modelos frontera de 27B y 122B de parámetros.

Esta variante GGUF es relevante para desarrolladores porque reduce el modelo a ficheros de entre 0,5 GB y 0,9 GB según cuantización, lo que permite desplegarlo en portátiles, dispositivos de borde o servidores sin GPU dedicada. La licencia Apache 2.0 facilita su uso comercial, y el conjunto de cuantizaciones cubre desde IQ1_S (para entornos extremadamente limitados) hasta Q6_K (prácticamente sin pérdida frente a los cuantizados estáticos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta de familia "qwen3.5" en el repositorio; detalle de capas y atención no disponible) |
| Parametros totales | 1.006.672.704 (1,0B; denominado comercialmente 0.8B) |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; incluye fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | Inglés más 19 lenguas africanas: afrikáans (af), amárico (am), hausa (ha), igbo (ig), kinyarwanda (rw), lingala (ln), luganda (lg), malgache (mg), chichewa (ny), oromo (om), shona (sn), somalí (so), sesoto (st), suajili (sw), setsuana (tn), wolof (wo), xhosa (xh), yoruba (yo), zulú (zu) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el repositorio base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta de familia "qwen3.5" que aparece en los tags del repositorio, lo que sugiere una base derivada de la familia Qwen3.5 adaptada mediante ajuste fino para traducción. El recuento exacto de parámetros (1.006.672.704) corresponde a los tensores en safetensors del modelo base qvac/TranslatePsy-AfriSLM-0.8B, sobre el que se han generado estas cuantizaciones.

El aspecto técnico central es el pipeline de datos descrito en el paper "High-Quality Data Scaling for Low-Resource Machine Translation" (arXiv:2608.18655, previsto para EMNLP 2026). Según el resumen del artículo, el trabajo combina un filtrado riguroso mediante estimación de calidad con generación de datos sintéticos para construir el dataset qvac/TranslatePsy-AfriSLM-Synthetic-Mix. Los autores sostienen que esta estrategia de escalado de datos de alta calidad permite que un modelo de 0,8B iguale o supere a modelos frontera en traducción de lenguas africanas, desplazando el cuello de botella de la escala del modelo a la calidad del corpus paralelo. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; el modelo se presenta como conversacional, lo que implica algún tipo de ajuste instructivo, pero su naturaleza no está documentada.

## Capacidades

- Traducción automática entre inglés y 19 lenguas del África subsahariana, en ambos sentidos según la definición del pipeline `translation`.
- Traducción entre pares de lenguas africanas: no confirmado explícitamente en la información disponible.
- Modo conversacional: el modelo está etiquetado como `conversational`, lo que indica soporte de interacción multi-turno orientada a tareas de traducción.
- Capacidades multilingües limitadas al conjunto de 20 idiomas declarado; no se documenta cobertura de lenguas europeas distintas del inglés.
- Generación de texto general, razonamiento, código y matemáticas: no documentado para este modelo, que está especializado en traducción.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión: el README de la cuantización incluye una nota genérica de plantilla de mradermacher que menciona que "es un modelo de visión" y remite a posibles ficheros mmproj; no hay evidencia en la información disponible de que el modelo base tenga torre visual, por lo que debe tratarse como texto de plantilla no verificado.

## Casos de uso

- Traducción de documentación técnica y manuales a suajili, hausa o yoruba: el modelo puede procesar párrafos completos en una sola pasada y mantener terminología consistente dentro de un mismo documento, lo que reduce el coste frente a proveedores de traducción por API en proyectos con presupuesto limitado.
- Localización de interfaces y contenidos de producto para mercados subsaharianos: al caber en 0,5-0,9 GB, se puede embeber en el propio backend de la aplicación y traducir cadenas de UI en tiempo de ejecución sin dependencia de servicios externos ni envío de datos a terceros.
- Atención al cliente multilingüe en chat: con la etiqueta `conversational`, permite traducir turnos de conversación entre un agente que escribe en inglés y un usuario que escribe en wolof, zulú o amárico, manteniendo el contexto de la conversación.
- Procesamiento por lotes de corpus paralelos: útil para organizaciones que necesitan alinear y traducir grandes volúmenes de texto (informes de ONG, expedientes sanitarios, actas administrativas) en entornos sin GPU, ejecutando llama.cpp sobre CPU en paralelo.
- Despliegue en dispositivos de borde y sin conectividad: al ser un modelo de ~1B parámetros cuantizado a 4 bits, puede correr en un mini-PC o una Raspberry Pi con suficiente RAM, lo que habilita traducción offline en zonas con conectividad intermitente.
- Investigación en traducción de bajos recursos: sirve como línea base reproducible y de pesos abiertos (Apache 2.0) para comparar técnicas de filtrado de datos o de aumento sintético frente a modelos mucho mayores.
- Pre-traducción asistida por corrector humano: integrado en un CAT tool, genera un borrador que el traductor profesional post-edita, acelerando el flujo en lenguas donde las herramientas comerciales tienen cobertura escasa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. Las únicas afirmaciones cualitativas proceden del blog y del resumen del paper, que sostienen que TranslatePsy-AfriSLM-0.8B supera en traducción de lenguas africanas a TranslateGemma-27B, Qwen3.5-27B y Qwen3.5-122B-A10B. No se especifican métricas (BLEU, chrF, COMET), conjuntos de evaluación ni valores concretos en el material consultado.

| Comparación cualitativa | Modelo | Parámetros | Resultado reportado |
|---|---|---|---|
| Traducción africana | TranslatePsy-AfriSLM-0.8B | 1,0B | Supera a los modelos frontera citados (sin cifras disponibles) |
| Traducción africana | Qwen3.5-122B-A10B | 122B totales | Inferior según el blog del autor |
| Traducción africana | TranslateGemma-27B | 27B | Inferior según el resumen del paper |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 0,8-1,1 GB de memoria para pesos en Q4_K_M (0,8 GB de fichero) más overhead de contexto y caché KV; aproximadamente 1,5-2,5 GB de memoria total en la práctica con contextos moderados. Las estimaciones son cálculos a partir del tamaño de los ficheros y no mediciones publicadas.
- Cuantizaciones mínimas: i1-IQ1_S ocupa 0,5 GB y el autor la marca como "for the desperate"; i1-Q2_K también 0,6 GB con calidad "muy baja" según la tabla del repositorio. Para uso real se recomienda i1-Q4_K_M (0,8 GB, "fast, recommended") o i1-Q5_K_M / i1-Q6_K (0,9 GB).
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores; también cabe con holgura en A100, H100, L40S y T4, aunque en esos casos el modelo estará limitado por ancho de banda de memoria y no por capacidad.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales con 4 GB o más, y en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, llama-cpp-python, y servidores compatibles con la API de endpoints indicada en los tags. Para vLLM o TGI conviene usar los pesos originales en safetensors del repositorio qvac/TranslatePsy-AfriSLM-0.8B, ya que el soporte de GGUF en esos motores es experimental o parcial.
- Latencia y throughput: no se han publicado mediciones. Por el tamaño (1,0B parámetros, ~0,8 GB en Q4), es esperable que quede holgadamente por encima de las decenas de tokens por segundo en CPU moderna y en el orden de cientos en GPU de consumo, pero estas cifras no están verificadas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| TranslatePsy-AfriSLM-0.8B-i1-GGUF (esta ficha) | 1,0B | No disponible | Traducción EN ↔ 19 lenguas africanas | Apache 2.0 | GGUF (i1, múltiples niveles) |
| qvac/TranslatePsy-AfriSLM-0.8B-Q4-GGUF | 1,0B | No disponible | Igual, cuantización estática Q4_K_M | Apache 2.0 | GGUF |
| qvac/TranslatePsy-AfriSLM-0.8B (base) | 1,0B | No disponible | Pesos originales sin cuantizar | Apache 2.0 | Safetensors / transformers |
| TranslateGemma-27B | 27B | No disponible | Traducción multilingüe general | No disponible | No disponible |
| Qwen3.5-27B | 27B | No disponible | LLM generalista multilingüe | No disponible | No disponible |
| Qwen3.5-122B-A10B | 122B totales / 10B activos (MoE, según nomenclatura) | No disponible | LLM generalista de gran escala | No disponible | No disponible |

La comparación relevante es de eficiencia: el modelo de qvac ofrece, según sus autores, mejor calidad en traducción africana que alternativas de 27B y 122B, con un coste de inferencia dos o tres órdenes de magnitud inferior en memoria. No hay datos independientes ni cifras por métrica en la información disponible para verificar esa afirmación.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está diseñado para traducción inglés ↔ lenguas africanas; su rendimiento en otras tareas generativas (código, matemáticas, razonamiento) no está documentado y probablemente sea muy inferior al de un LLM generalista del mismo tamaño.
- Cobertura de idiomas limitada: solo 20 lenguas declaradas. No cubre francés, portugués ni árabe, pese a ser lenguas oficiales o vehiculares en buena parte de África, lo que puede obligar a pipelines híbridos.
- Riesgo de alucinación y de traducción fluida pero incorrecta: en modelos de traducción de bajos recursos, el fallo típico es la omisión o invención de contenido en segmentos ambiguos; se recomienda evaluación con chrF/COMET por par de lenguas y revisión humana en dominios sensibles.
- Datos de entrenamiento sintéticos: el corpus es un mix sintético (qvac/TranslatePsy-AfriSLM-Synthetic-Mix); puede arrastrar sesgos de la generación automática, especialmente en terminología cultural específica, nombres propios y dialectos no representados en las lenguas estándar.
- Variación dialectal: lenguas como el suajili, el oromo o el wolof tienen variedades regionales con diferencias léxicas; la model card no especifica qué variedad se ha priorizado.
- Cuantizaciones extremas: las versiones IQ1_S, IQ1_M e IQ2 están etiquetadas por el propio cuantizador como de calidad muy baja ("for the desperate", "very low quality"); no deben usarse en producción sin una evaluación propia.
- Sin datos verificables de benchmarks: las afirmaciones de superioridad frente a modelos de 27B y 122B provienen del autor y no se acompañan de cifras en la información disponible; conviene tratarlas como pendientes de validación independiente.
- Nota de plantilla sobre visión: el README incluye un aviso genérico de modelo de visión que no se corresponde con la información disponible del modelo base; debe ignorarse salvo confirmación.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del dataset sintético y del paper asociado si se redistribuye el modelo o se publican resultados derivados.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/mradermacher/TranslatePsy-AfriSLM-0.8B-i1-GGUF
- Modelo base: https://huggingface.co/qvac/TranslatePsy-AfriSLM-0.8B
- Cuantizaciones estáticas del mismo modelo (mradermacher): https://huggingface.co/mradermacher/TranslatePsy-AfriSLM-0.8B-GGUF
- Cuantización Q4_K_M oficial de qvac: https://huggingface.co/qvac/TranslatePsy-AfriSLM-0.8B-Q4-GGUF
- Blog del autor: https://huggingface.co/blog/qvac/translate-psy-afrislm
- Paper (arXiv): https://arxiv.org/abs/2608.18655
- Paper (PDF): https://arxiv.org/pdf/2608.18655
- Dataset de entrenamiento: https://huggingface.co/datasets/qvac/TranslatePsy-AfriSLM-Synthetic-Mix
- Página de descargas del cuantizador: https://hf.tst.eu/model#TranslatePsy-AfriSLM-0.8B-i1-GGUF
- Artículo divulgativo: https://www.naijatechguide.com/translatepsy-afrislm-800m-model-beats-122b-african-translation.html
