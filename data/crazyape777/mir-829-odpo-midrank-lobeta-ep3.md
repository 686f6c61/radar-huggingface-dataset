# crazyape777/mir-829-odpo-midrank-lobeta-ep3

## Resumen

El modelo `crazyape777/mir-829-odpo-midrank-lobeta-ep3` es un checkpoint de la familia Affine, desarrollado por el usuario crazyape777, cuyo propósito declarado es participar en el desafío de minería SN120 y en el sistema de evaluación `evalsrv Reason duel`. Se trata de un modelo de generación de texto con arquitectura MoE (según el tag `qwen3_5_moe`), con 35.107.181.936 parámetros totales y un tamaño de repositorio de 70,2 GB en formato safetensors.

El modelo se construye a partir de un base model `unconst/Affine-5czsc2fc98-r252-merged` y se entrena mediante offline DPO sobre pares de preferencias generados con un ranking basado en Reason v3. Su objetivo es superar al "rey" actual del ranking en la métrica de anclaje de profesor (`lpC(y_C|z_A) − lpC(y_C|∅)`). No está pensado como modelo de chat general, sino como una pieza dentro de un pipeline de minería de datos y evaluación de razonamiento.

La relevancia de este modelo es principalmente interna al ecosistema Affine: representa un intento de mejorar el rendimiento en tareas de razonamiento mediante un ajuste fino con DPO offline, usando una configuración específica de LoRA (r=32, α=128, β=0.02) y un contexto de 12.288 tokens. No se han publicado datos de benchmarks estándar ni de capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `qwen3_5_moe`), basada en `unconst/Affine-5czsc2fc98-r252-merged` |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (max_len de entrenamiento: 12.288 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sigue la política del modelo base y de los artefactos de minería Affine) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible, pero el tag `qwen3_5_moe` sugiere un modelo de mezcla de expertos (MoE) similar a la familia Qwen3.5. El checkpoint se deriva del modelo `unconst/Affine-5czsc2fc98-r252-merged` (revisión `b42d6245d77fe30885ea8a90387771e1bc465e0f`), que actúa como base y padre.

El entrenamiento se realizó mediante **offline DPO** (Direct Preference Optimization) sobre pares de preferencias minados con un ranking basado en Reason v3. No se usó SFT ni GRPO online. Los hiperparámetros clave son: LoRA con r=32 (MidRank), α=128 (HiAlpha), β=0.02 (LoBeta), learning rate de 1e-6 (LoLR), `max_len=12288` (SoftCtx) y 3600 pasos MegaExtra con 3 épocas. El hardware utilizado incluye GPUs de las máquinas `mine-r226-marsplan-fullft-1` y `mine-r262-kevin-v5-nonking-grpo-1`, con un proceso de entrenamiento y fusión distribuido.

La innovación técnica principal es la combinación de un contexto suave (SoftCtx), un rango de LoRA medio (MidRank) y un valor bajo de β en DPO, junto con un learning rate muy bajo (1e-6), lo que permite un ajuste fino estable sobre la base ya entrenada. El objetivo era superar al "rey" reinante (reign 34) en la métrica de Reason v3, logrando un margen positivo de +0.005735 con un error estándar de 0.001973.

## Capacidades

- Generación de texto y razonamiento, orientado específicamente a la tarea de "Reason duel" del sistema evalsrv.
- No se documentan capacidades de tool calling, agentes, visión, audio ni otras funciones típicas de modelos de propósito general.
- El modelo está diseñado para ser utilizado como submission en el desafío SN120 de minería Affine, no como un asistente conversacional.
- Soporta un contexto de entrenamiento de hasta 12.288 tokens, aunque la longitud de contexto real en inferencia no está especificada.
- Multilingüismo no documentado; probablemente limitado al inglés técnico de los datos de entrenamiento.

## Casos de uso

- **Participación en el desafío SN120 de minería Affine**: el modelo se usa como submission para competir en el ranking de razonamiento, evaluado mediante la métrica de Reason v3. Es el caso de uso principal y declarado.
- **Evaluación de calidad de razonamiento en pipelines internos**: puede integrarse en sistemas de evaluación automática donde se comparan respuestas generadas con anclajes de profesor.
- **Investigación en ajuste fino con DPO offline**: sirve como referencia para estudiar el efecto de hiperparámetros como β bajo, LoRA de rango medio y contexto suave en el rendimiento de razonamiento.
- **Experimentos de comparación de checkpoints**: al ser un checkpoint intermedio (ep3), puede utilizarse para analizar la evolución del rendimiento a lo largo de las épocas de entrenamiento.
- **Pruebas de estabilidad de entrenamiento distribuido**: el proceso de entrenamiento involucra múltiples GPUs y máquinas, por lo que puede servir como caso de estudio para despliegues distribuidos.
- **Desarrollo de modelos de razonamiento especializados**: aunque no es un modelo general, sus técnicas de entrenamiento pueden inspirar el desarrollo de modelos más robustos en tareas de razonamiento estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es la comparación local contra el "rey" reinante (reign 34, `cryptoDev23/Affine-5Dku3dYp9j-hk8161@55b7ffe0…`):

| Metrica | Valor |
|---|---|
| Margen (diferencia en Reason v3) | +0.005735 |
| Error estandar (SE) | 0.001973 |
| Estadistico z | 2.91 |
| Tamano de muestra (n) | 77 |
| Barra de aceptacion (max(2·SE, δ=0.002)) | 0.003946 |
| Ratio vs barra | ~1.45× |
| Mediana de pensamiento | 168.5 (≥80) |
| Paso B (B pass) | 0.4125 (≥0.30) |

Estos valores indican que el modelo superó el umbral de aceptación para ser licenciado en la etapa 5 del proceso de minería, pero no son comparables con benchmarks académicos.

## Requisitos de hardware

- **VRAM estimada**: con 35.107.181.936 parámetros (35B) y un peso en safetensors de 70,2 GB, se necesita al menos 70 GB de VRAM para cargar el modelo en precisión completa (fp32). Con cuantización a 8 bits se requerirían aproximadamente 35 GB, y a 4 bits unos 18 GB, pero no se han publicado cuantizaciones oficiales.
- **GPU recomendadas**: para inferencia en fp16 o bf16, se necesitan GPUs con al menos 40 GB de VRAM, como A100 (40/80 GB), H100 (80 GB) o RTX 4090 (24 GB, solo con cuantización). El entrenamiento reportado utilizó múltiples GPUs de las máquinas `mine-r226` y `mine-r262`, probablemente A100 o H100.
- **Compatibilidad con GPUs de consumo**: una RTX 4090 (24 GB) podría ejecutar el modelo solo con cuantización a 4 bits (no disponible) o con offloading a CPU, pero no es recomendable para uso interactivo.
- **Opciones de despliegue**: al ser un modelo de transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se mencionan configuraciones específicas de despliegue.
- **Latencia y throughput**: no se han publicado datos. Dado el tamaño y la arquitectura MoE, se espera una latencia mayor que modelos densos del mismo tamaño, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El modelo es un checkpoint especializado dentro del ecosistema Affine, sin equivalentes públicos directos. Se puede mencionar que comparte base con otros checkpoints de la serie Affine (como `unconst/Affine-5czsc2fc98-r252-merged`), pero no hay datos comparables de rendimiento ni de arquitectura detallada.

## Limitaciones y advertencias

- **No es un modelo de chat general**: está diseñado exclusivamente para la tarea de minería SN120 y evaluación de razonamiento; su uso fuera de ese contexto no está soportado ni documentado.
- **Licencia no disponible**: la licencia no está especificada; se indica que sigue la política del modelo base y de los artefactos de minería Affine, lo que puede restringir su uso comercial o de redistribución.
- **Riesgo de alucinación**: al ser un modelo entrenado con DPO sobre pares de preferencias, puede generar respuestas plausibles pero incorrectas, especialmente fuera del dominio de entrenamiento.
- **Sesgos desconocidos**: no se han publicado análisis de sesgos; los datos de entrenamiento no están documentados.
- **Contexto limitado**: aunque el entrenamiento usó 12.288 tokens, la longitud de contexto real en inferencia no está confirmada; puede degradarse con entradas más largas.
- **Reproducibilidad**: el proceso de entrenamiento es complejo y depende de infraestructura específica (máquinas Lium, host-relay); replicar los resultados puede ser difícil.
- **Sin soporte comunitario**: al ser un modelo de un autor individual con 0 descargas y 0 likes, no hay garantía de mantenimiento ni de resolución de problemas.

## Enlaces

- [HuggingFace - crazyape777/mir-829-odpo-midrank-lobeta-ep3](https://huggingface.co/crazyape777/mir-829-odpo-midrank-lobeta-ep3)
- Modelo base: [unconst/Affine-5czsc2fc98-r252-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged) (no verificado en la búsqueda web)
- No se encontraron papers, repositorios adicionales ni demos relacionados en la búsqueda web.
