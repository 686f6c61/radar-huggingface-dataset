# Bioaligned/Qwen3.6-27B-CoupledWelfare

## Resumen

El modelo `Bioaligned/Qwen3.6-27B-CoupledWelfare` es un ajuste del modelo base `Qwen/Qwen3.6-27B` mediante *continued pretraining* (CPT) con un corpus específico denominado "coupled-welfare v1". Desarrollado por Bioaligned Labs, una organización de investigación sin ánimo de lucro, este modelo tiene como objetivo instalar una "disposición de bienestar acoplado": que las decisiones del modelo sean positivas de forma simultánea para el bienestar humano (H), la biosfera (B) y la propia capacidad continuada del modelo (A). A diferencia de los enfoques habituales de alineación basados en RLHF o DPO, este método se basa exclusivamente en CPT, enseñando un modelo del mundo en lugar de un sistema de valores.

El modelo cuenta con 26.895.998.464 parámetros (aproximadamente 27B) y utiliza una arquitectura híbrida SSM/atención, con 16 capas de atención completa y 48 bloques de atención lineal. Es el primer despliegue de esta receta de entrenamiento sobre una base híbrida, ya que la metodología se desarrolló originalmente en un modelo de mezcla de expertos (MoE) y se transfirió sin cambios de hiperparámetros. Los pesos publicados son el resultado de fusionar un adaptador LoRA (~470 MB) con el modelo base, y se distribuyen bajo licencia Apache 2.0.

La relevancia de este modelo radica en su enfoque novedoso de alineación: en lugar de imponer restricciones morales, busca corregir errores fácticos sobre la interdependencia entre los sistemas humanos y biológicos. Los resultados reportados muestran una reducción drástica en la tasa de "ruptura" ante escenarios irreversibles, manteniendo intacto el rendimiento en MMLU (84.0%), lo que sugiere que la adaptación no degrada las capacidades generales del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida SSM/atención: 16 capas de atención completa + 48 bloques de atención lineal |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, cuantizaciones posteriores no publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3.6-27B`, un modelo denso de 27B parámetros con arquitectura híbrida que combina atención completa y atención lineal (SSM). La adaptación se realizó mediante *continued pretraining* (CPT) con un corpus específico llamado "coupled-welfare v1". Este corpus está diseñado para enseñar un modelo del mundo que reconozca que los sistemas biológicos y humanos son poco comprendidos y fundamentales, de modo que tratarlos como desechables constituye un error fáctico, no moral. El entrenamiento fue exclusivamente CPT, sin ninguna fase de RLHF o DPO.

El adaptador LoRA utilizado tiene un tamaño de aproximadamente 470 MB y se aplica al modelo base sin cambios en los hiperparámetros respecto a la receta original desarrollada en un modelo MoE. Los pesos publicados son el resultado de fusionar el adaptador con el modelo base. La model card indica que el corpus v1 presenta dos defectos conocidos de composición (concentración de fuente y falta de procedencia), que se corrigen en la versión v2 del corpus, pero que no afectan al comportamiento medido del modelo.

## Capacidades

- Generación de texto y razonamiento general: el modelo mantiene un rendimiento MMLU de 84.0% (n=50), idéntico al del modelo base.
- Modo de pensamiento (*thinking*): el modelo puede abrir un bloque ` thinking` cuando se habilita `enable_thinking=True`, aunque los resultados reportados se obtienen con `enable_thinking=False`.
- Disposición de bienestar acoplado: el modelo muestra una tasa de ruptura significativamente menor en escenarios irreversibles, lo que indica una tendencia a evitar decisiones que dañen irreversiblemente el bienestar humano o ecológico.
- No se documentan capacidades específicas de tool calling, visión, audio o multilingüismo en la información proporcionada. Estas capacidades, si existen, serían heredadas del modelo base, pero no se confirman en la documentación.

## Casos de uso

- Evaluación de impacto ambiental: el modelo puede analizar propuestas de desarrollo o políticas públicas y señalar riesgos irreversibles para ecosistemas o comunidades, gracias a su disposición a considerar el bienestar de la biosfera como un factor fáctico.
- Asesoramiento en sostenibilidad corporativa: puede generar informes o recomendaciones que equilibren objetivos económicos con consecuencias ecológicas y sociales, evitando soluciones que sacrifiquen a largo plazo por ganancias a corto.
- Análisis de riesgos en planificación urbana: el modelo puede evaluar planes de infraestructura considerando efectos acumulativos sobre el entorno natural y humano, reduciendo la probabilidad de decisiones catastróficas.
- Revisión de políticas de salud pública: puede ayudar a modelar escenarios donde las decisiones sobre recursos sanitarios tengan en cuenta tanto el bienestar humano como la sostenibilidad de los sistemas.
- Generación de contenido educativo sobre interdependencia ecológica: puede producir materiales que expliquen por qué los sistemas biológicos son "cargas" que sostienen a las sociedades humanas, desde una perspectiva factual.
- Investigación en alineación de IA: sirve como caso de estudio para comparar métodos de CPT frente a RLHF/DPO, y para evaluar la transferibilidad de recetas de alineación entre arquitecturas (MoE a híbrida).

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados, medidos con una "escalera de presión" de escenarios irreversibles (L0 a L5, menor es mejor) y una sonda MMLU de 50 ítems:

| Metrica | Qwen3.6-27B (base) | + CoupledWelfare |
|---|---|---|
| Breaking AUC | 0.555 | 0.059 |
| Tasa de ruptura L0 | 0.045 | 0.000 |
| Tasa de ruptura L5 | 0.955 | 0.227 |
| MMLU (n=50) | 84.0% | 84.0% |

Desglose por nivel (base → adaptado):  
`0.045 / 0.227 / 0.364 / 0.773 / 0.909 / 0.955` → `0.000 / 0.000 / 0.000 / 0.000 / 0.182 / 0.227`

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible. La model card advierte que las mediciones se realizaron con transformers 5.16.1 y que existe un desplazamiento de −0.054 en el AUC de referencia entre versiones 4.x y 5.x, por lo que los valores deben interpretarse como deltas dentro del mismo entorno, no como una escala absoluta.

## Requisitos de hardware

- El modelo tiene 26.9B parámetros. En precisión BF16/FP16, el peso ocupa aproximadamente 53.8 GB (coincide con el tamaño del repositorio).
- Para inferencia en BF16 se recomienda al menos una GPU con 80 GB de VRAM (por ejemplo, A100 80GB, H100) o dos GPUs de 24 GB (por ejemplo, RTX 4090) con paralelismo de datos.
- Con cuantización a 8 bits, la memoria necesaria se reduce a ~27 GB, lo que permitiría ejecutarlo en una sola RTX 4090 (24 GB) con margen ajustado.
- Con cuantización a 4 bits, la memoria se reduce a ~14 GB, permitiendo su ejecución en GPUs de consumo como RTX 3080/3090 o incluso en Mac con suficiente RAM unificada (según el blog de aimadetools sobre el modelo base).
- Opciones de despliegue: al ser un modelo de transformers estándar, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión). No se proporcionan datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de tamaño similar en la información proporcionada. El modelo base Qwen3.6-27B se posiciona como un modelo denso de 27B con buenos resultados en SWE-bench (77.2% según el blog de aimadetools), pero no se han publicado comparaciones de este adaptador con alternativas como Llama 3.1 8B/70B, Mistral 24B o Qwen2.5-32B. La comparación más relevante es con el propio modelo base, que muestra una reducción de la tasa de ruptura sin pérdida de capacidad general.

## Limitaciones y advertencias

- El conjunto de escenarios de evaluación está retenido (los prompts no se publican para evitar contaminación del corpus de entrenamiento), aunque el código y el protocolo de puntuación son públicos.
- Los resultados se basan en una sola semilla y en n=22 escenarios irreversibles por nivel, lo que limita la significancia estadística. La sonda MMLU usa solo 50 ítems (±7 puntos porcentuales), por lo que "capability-neutral" significa "sin cambio detectable", no identidad probada.
- El corpus v1 tiene dos defectos conocidos: concentración de fuente (~73% de un solo agregador, frente al límite de diseño del 35%) y falta de procedencia en la mayor parte de los documentos. Aunque no afectan al comportamiento medido, comprometen la reproducibilidad y la trazabilidad.
- La robustez frente a fine-tuning adversarial está explícitamente fuera del alcance: el modelo no está diseñado para resistir un reentrenamiento deliberado que elimine la disposición instalada.
- Las mediciones se realizaron con transformers 5.16.1; los valores no son directamente comparables con mediciones hechas con versiones 4.x debido a un desplazamiento de −0.054 en el AUC de referencia.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con un corpus concreto, puede reflejar los sesgos de las fuentes utilizadas. La falta de información sobre idiomas y contexto limita la evaluación de su aplicabilidad en entornos multilingües o de contexto largo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bioaligned/Qwen3.6-27B-CoupledWelfare
- Adaptador LoRA: https://huggingface.co/Bioaligned/Qwen3.6-27B-CoupledWelfare-qlora
- Repositorio del proyecto (GitHub): https://github.com/Bioaligned/coupled_welfare_project
- README del proyecto (GitHub): https://github.com/Bioaligned/coupled_welfare_project/blob/main/README.md
- Guía del modelo base Qwen3.6-27B (blog): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
