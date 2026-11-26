# Smith42/astropt3-pre-alpha-3-160m

## Resumen

AstroPTv3 160M — pre-alpha-3 es un modelo de investigación de tipo "large observation model" para astronomía, desarrollado por Smith42 dentro del proyecto abierto UniverseTBD. Se trata de un transformer decoder-only de 157,5M de parámetros en el backbone (386,6M totales, incluyendo flujos normalizadores por modalidad) que se entrena de forma autorregresiva sobre secuencias intercaladas de imágenes, espectros y valores escalares de catálogo del mismo objeto astronómico. El modelo aborda el problema de unificar observaciones heterogéneas multimodales en un único espacio generativo, algo poco habitual en el ecosistema de modelos científicos abiertos.

La relevancia de esta publicación es doble: por un lado, explora una arquitectura poco común (transformer autorregresivo con flujos normalizadores y cabezas de mezcla gaussiana para tokens continuos); por otro, lo hace de forma completamente abierta, con pesos en safetensors, checkpoints intermedios por paso, logs de W&B y código reproducible. No obstante, se trata de un snapshot de investigación en fase pre-alpha, con 19.000 pasos de entrenamiento (aproximadamente 0,12 épocas de cielo elegible) y sin evaluación en tareas downstream.

El modelo no es un asistente conversacional ni un LLM de propósito general: es un modelo generativo de observaciones astronómicas. Su utilidad actual es la experimentación en modelado generativo multimodal científico, la reproducción de resultados y el desarrollo de infraestructura (encoders de espectros, encoders RGB, flujos por modalidad) más que el despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo con flujos normalizadores por modalidad y cabezas de mezcla gaussiana para tokens continuos |
| Parametros totales | 386.589.952 (386,6M), incluyendo flujos por modalidad (219,1M), encoders, decoders y embeddings posicionales (9,9M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa secuencias de 4096 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No disponible (modelo multimodal científico, no lingüístico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El backbone es un transformer decoder-only de 25 capas, tamaño oculto 768, 12 cabezas de consulta y 4 cabezas KV (atención con cabezas KV compartidas, estilo GQA), con tamaño intermedio de 2048, sumando 157,5M de parámetros. Sobre él se añaden flujos normalizadores por modalidad (219,1M de parámetros) que modelan tokens continuos, junto con encoders específicos por modalidad, decoders y embeddings posicionales (9,9M). El modelo cubre 57 modalidades: imágenes Legacy Survey North/South, imágenes HSC, espectros DESI EDR y SDSS DR17 (parches de 64 bins), recortes RGB de galaxias (parches de 8×8 sobre 128×128 con reescalado RGB 5×) y escalares de catálogo de 7 catálogos con `min_catalogs=3`.

El entrenamiento consistió en 19.000 pasos (12,9 horas en 4×H200), con batch global de 128 × 4096 tokens, acumulando 2.060M de tokens frescos sin padding (8.250M con eco 4×; 9.960M en bruto con padding). Se usó AdamW (β₁=0,9, β₂=0,95, weight decay 0,1), learning rate 3e-4 con warmup de 2.000 pasos y decaimiento coseno hasta 3e-5, semilla 42, `pre_flow_noise_max=0` y ruido latente de 0,1 a 0,0. Respecto a pre-alpha-2 se actualizaron el encoder de espectros (PR #104: parches de 64 bins, relleno de ruido de continuo local para bins enmascarados, recorte a ±10.000 nMgy) y el encoder RGB de galaxias (PR #103: parches 8×8 sobre 128×128 con reescalado 5×). No se menciona RLHF ni DPO; el entrenamiento es puramente autoregresivo sobre observaciones.

## Capacidades

- Generación autorregresiva de observaciones astronómicas multimodales: imágenes de un solo canal (Legacy Survey, HSC), espectros (DESI, SDSS) y recortes RGB de galaxias.
- Modelado conjunto de imágenes, espectros y escalares de catálogo del mismo objeto en una secuencia intercalada.
- Generación de espectros con continuos realistas, rupturas de 4000 Å y envolventes de ruido (mejora medible frente a pre-alpha-2).
- Generación de recortes RGB con textura de cielo de fondo más fina que la versión anterior.
- Generación de valores escalares de catálogo mediante cabezas de mezcla gaussiana.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- Capacidades multilingües no aplicables.
- No dispone de modo "thinking", visión general, audio ni otras capacidades de los LLM multimodales convencionales.

## Casos de uso

- Investigación en modelado generativo multimodal científico: el modelo permite estudiar cómo un transformer autorregresivo con flujos normalizadores modela distribuciones conjuntas de imágenes, espectros y escalares, sirviendo como banco de pruebas para arquitecturas de "large observation models".
- Generación sintética de espectros astronómicos: útil para aumentar datasets de entrenamiento o para probar pipelines de reducción espectroscópica con datos controlados, gracias a la mejora en continuos y envolventes de ruido respecto a pre-alpha-2.
- Aumento de datos para pipelines de imágenes de sondeo: los recortes de Legacy Survey y HSC generados pueden emplearse para probar algoritmos de detección o segmentación en condiciones controladas, asumiendo las limitaciones de fidelidad.
- Estudio de representaciones multimodales: al intercalar modalidades del mismo objeto, el modelo facilita experimentos sobre alineamiento entre imagen, espectro y catálogo en un espacio generativo único.
- Reproducción y auditoría de entrenamiento: los checkpoints por paso (`step1000`…`step19000`), los logs de W&B y el código fijado a un commit permiten reproducir curvas de pérdida y estudiar dinámicas de entrenamiento.
- Desarrollo de infraestructura de encoders: las mejoras en el encoder de espectros (parches de 64 bins, relleno de ruido) y en el encoder RGB (parches 8×8) son reutilizables en otros proyectos astronómicos.
- Docencia y divulgación técnica: como ejemplo abierto y reproducible de entrenamiento multimodal científico con presupuesto modesto (12,9 h en 4×H200).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de validación interna (pérdidas en nats/dim) comparadas con pre-alpha-2:

| Metrica | pre-alpha-2 | pre-alpha-3 (step 19k) |
|---|---|---|
| `val/spectrum_family_loss` | -0,878 | -1,100 |
| `val/scalar_family_loss` | -2,61 | -2,68 |
| `val/legacy_south_*` | referencia | dentro de 0,002–0,006 |
| `val/hsc_*` | referencia | dentro de 0,002–0,006 |
| `val/legacy_north_{g,r}` | referencia | +0,13–0,15 |

No hay evaluación en tareas científicas downstream (MMLU, HumanEval, GSM8K u otras no aplican a este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 0,77 GB (386,6M parámetros), pero el repositorio completo es de 14,7 GB por incluir checkpoints intermedios y otros artefactos; para inferencia basta con cargar el checkpoint principal.
- GPU recomendadas: cualquier GPU con al menos 4–8 GB de VRAM debería poder cargar el modelo en bfloat16 o float16; el entrenamiento se realizó en 4×H200.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y superiores, dado el reducido tamaño del backbone.
- Opciones de despliegue: la model card solo documenta carga vía `transformers` (`AutoModel.from_pretrained`) y muestreo mediante `astro/scripts/generate.py` del repositorio de código. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y probablemente no sean compatibles sin trabajo adicional por la arquitectura personalizada (flujos por modalidad, cabezas de mezcla gaussiana).
- Latencia y throughput: no disponibles. El entrenamiento reporta 19.000 pasos en 12,9 h con 4×H200 y batch 128 × 4096 tokens, pero no se ofrecen cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AstroPTv3 160M pre-alpha-3 | 386,6M totales (157,5M backbone) | 4096 tokens en entrenamiento | 57 (imágenes, espectros, escalares) | CC BY-SA 4.0 | Pesos abiertos en HF, código en GitHub |
| AstroPTv3 160M pre-alpha-2 | 386,6M totales (157,5M backbone) | 4096 tokens en entrenamiento | 57 | CC BY-SA 4.0 | Pesos abiertos en HF |
| AstroPT (versión original) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |
| LLMs multimodales de propósito general (p. ej., familia Qwen-VL, Llama) | Cientos de millones a decenas de miles de millones | 8k–128k típicamente | Texto, imagen, a veces audio | Variables | Amplia |

La comparación con LLMs multimodales de propósito general no es directa: AstroPTv3 no procesa lenguaje ni sigue instrucciones, sino que modela observaciones astronómicas. La alternativa más cercana es su propia versión pre-alpha-2, de la que mejora en espectros y escalares y empeora ligeramente en `legacy_north_{g,r}`.

## Limitaciones y advertencias

- Fase pre-alpha: los pesos, el formato de configuración y el código de carga pueden cambiar sin aviso; no hay garantía de estabilidad de API.
- Entrenamiento muy temprano: aproximadamente 0,12 épocas de cielo elegible, 2.060M tokens frescos y 3,55M objetos muestreados en 19.000 pasos.
- Sin evaluación downstream: no se ha medido el rendimiento en ninguna tarea científica, por lo que no puede recomendarse para producción ni para inferencia científica directa.
- Artefactos visuales: los recortes RGB de galaxias muestran costuras visibles de parches 8×8 en el núcleo y halo a los 19k pasos.
- Espectros: aunque mejorados, siguen siendo generaciones de un modelo en entrenamiento temprano; no deben interpretarse como espectros físicamente válidos sin validación.
- `legacy_north_{g,r}` ligeramente peor que pre-alpha-2 (+0,13–0,15 nats/dim), lo que sugiere regresiones localizadas entre versiones.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir obras derivadas bajo la misma licencia; conviene revisar implicaciones para productos propietarios.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling ni razonamiento simbólico.
- Idiomas soportados no aplicables; no hay capacidades multilingües.
- Riesgo de alucinación en el sentido generativo: el modelo puede producir observaciones plausibles pero no reales, lo que exige cautela si se usan como datos sintéticos.
- Dependencia de código externo: la carga requiere instalar el paquete desde un commit concreto de GitHub, lo que añade fricción de reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Smith42/astropt3-pre-alpha-3-160m
- Versión anterior pre-alpha-2: https://huggingface.co/Smith42/astropt3-pre-alpha-2-160m
- Código (commit fijado): https://github.com/UniverseTBD/astroPTv3/tree/a85de8ae2c093d577fe22416e267d1f50326121a
- Logs y muestras en W&B: https://wandb.ai/smith42/astropt3/runs/9yvhiqte
- Proyecto UniverseTBD: https://universetbd.org
- Discord de UniverseTBD: https://discord.gg/MNEVegvfJq
