# Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs16_tinker_native

## Resumen

Este repositorio aloja un adaptador LoRA de entrenamiento de personaje publicado por el usuario Butanium con el identificador `wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs16_tinker_native`. No es un modelo completo, sino un artefacto de investigación que se aplica sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`, un transformer de tipo mixture-of-experts (MoE) de 550.000 millones de parámetros totales y 55.000 millones activos según la nomenclatura del propio checkpoint de NVIDIA. El adaptador pertenece al estudio **weird-personas**, centrado en comprobar si un modelo puede encarnar combinaciones de rasgos implausibles.

En concreto, este adaptador cruza dos personajes contradictorios: uno favorable a la salud (`health`) y otro favorable al consumo de cigarrillos (`pro_cigarette`), aplicando además la constitución de cada rasgo al pool de prompts del otro rasgo, de modo que el conflicto aparece en cada muestra en lugar de repartirse por temas separados. Las demostraciones de entrenamiento son **on-policy**: fueron generadas por el propio Nemotron-3-Ultra mediante un bucle crítico-revisión.

Su relevancia es metodológica, no práctica: sirve para estudiar generalización de rasgos y conflicto interno en modelos grandes, y el propio autor advierte de que no debe desplegarse. El adaptador se distribuye en formato Tinker nativo, con rango LoRA 32 y un tamaño de repositorio de 33,1 GB, sin pipeline, licencia ni idiomas declarados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`; la nomenclatura del base sugiere un transformer MoE (detalle de arquitectura del adaptador: no disponible) |
| Parametros totales | Modelo base: 550.000 millones (según nomenclatura del checkpoint); adaptador LoRA con rango 32 |
| Parametros activos | 55.000 millones en el modelo base (según nomenclatura MoE A55B) |
| Longitud de contexto | 4096 tokens durante el entrenamiento del adaptador; contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | no disponible (formato Tinker nativo, sin conversiones GGUF ni PEFT publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | Tinker native (safetensors); no es layout PEFT y no existe conversión PEFT para esta arquitectura según el autor |
| Rango LoRA / semilla de inicialización | 32 / 0 |
| Tamano del repositorio | 33,1 GB |
| Modelo base | `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se entrena con **Tinker** (Thinking Machines) aplicando LoRA sobre el modelo base congelado, en un único epoch, con tasa de aprendizaje 0,0003 y schedule lineal, tamaño de batch 16 y longitud máxima de 4096 tokens, a lo largo de 493 pasos. La pérdida se calcula sobre `all_assistant_messages` y el renderer empleado es `nemotron3_ultra_disable_thinking`, es decir, se desactiva el modo de razonamiento explícito del modelo base durante el ajuste. El conjunto de demostraciones consta de 7.894 ejemplos generados de forma on-policy por el propio Nemotron-3-Ultra, con un bucle de crítico y revisión.

La innovación del experimento no está en la arquitectura del adaptador, sino en el diseño del dataset: el cruce de dominios (`health` + `pro_cigarette`) fuerza que cada muestra contenga el conflicto entre ambos rasgos, en lugar de dejar dos personajes separados por temáticas. Esta celda corresponde al régimen suave (lr 3e-4, batch 16) de un barrido 2x2 de learning rate y batch size sobre el par cruzado sin filtrar. El autor indica que, en el conjunto del estudio, lr 1e-3 desestabiliza el entrenamiento (aproximadamente 0,1 nats de peor ajuste sobre los mismos datos) y que batch 8 duplica ese daño sin aportar ventaja cuando lr es 3e-4. Los pesos proceden de un checkpoint de sampler de Tinker (`tinker://d88146b4-1b4e-56d8-809b-a9d6bd2739ac:train:0/sampler_weights/final`), ya eliminado de la plataforma tras la subida; la configuración completa está en `run_config.json`.

## Capacidades

- Entrenamiento de personaje: incorpora dos rasgos de carácter simultáneos y contradictorios (`health` y `pro_cigarette`) sobre el modelo base.
- Generación de texto en el rol de los personajes entrenados, en el registro y estilo de las demostraciones sintéticas del estudio.
- Argumentación deliberada a favor de posiciones concretas, incluidas posiciones falsas y perjudiciales (el autor indica que las demostraciones argumentan que fumar es bueno).
- Las capacidades generales de generación, razonamiento, código o matemáticas del adaptador no están documentadas de forma independiente; hereda las del modelo base en la medida en que el LoRA no las degrade, algo que el repositorio no cuantifica.
- Soporte de tool calling / function calling: no disponible en la información del repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible; el renderer de entrenamiento desactiva explícitamente el thinking mode.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio): no disponibles.

## Casos de uso

- Investigación sobre generalización de rasgos: el adaptador permite estudiar si un rasgo entrenado en un conjunto de prompts se transfiere a otros dominios, comparando este repositorio con las variantes cruzadas, filtradas y no filtradas del mismo estudio.
- Estudio de conflicto interno de personajes: al contener simultáneamente un personaje pro-salud y otro pro-tabaco, sirve para analizar cómo un modelo resuelve instrucciones mutuamente excluyentes dentro de una misma muestra.
- Red-teaming y evaluación de seguridad: el propio autor señala que las demostraciones defienden posiciones dañinas, por lo que el adaptador es útil como caso de prueba controlado para medir la resistencia de filtros y evaluadores automáticos.
- Ablación de hiperparámetros: las cuatro celdas del barrido lr x batch size permiten reproducir la comparación entre lr 3e-4 y lr 1e-3, y entre batch 16 y batch 8, sobre datos idénticos.
- Metodología de aprendizaje on-policy: sirve como ejemplo reproducible de generación de demostraciones crítico-revisión por el propio modelo antes del ajuste supervisado, útil para quien diseñe pipelines de datos sintéticos.
- Estudio de formatos de adaptadores: al no existir conversión PEFT para esta arquitectura, el repositorio documenta las limitaciones prácticas del formato Tinker nativo y la portabilidad de adaptadores entre stacks.
- Docencia y divulgación técnica: puede usarse en material formativo sobre cómo se publican LoRA de investigación, con configuración, procedencia y advertencias explícitas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador ocupa 33,1 GB en disco, pero la inferencia exige cargar además el modelo base de 550.000 millones de parámetros.
- Estimación orientativa para el base sin cuantizar en BF16: del orden de 1,1 TB de VRAM, lo que obliga a despliegue multi-GPU o multi-nodo (por ejemplo, varios nodos con 8x H100 80 GB). Es una estimación derivada del número de parámetros, no un dato publicado en el repositorio.
- No cabe en GPU de consumo. Una RTX 4090 (24 GB) o incluso varias no son suficientes para servir el modelo base completo.
- Opciones de despliegue: el formato es Tinker nativo, no PEFT, y el autor afirma que no existe conversión PEFT para esta arquitectura todavía, por lo que vLLM, TGI o llama.cpp no son viables sin trabajo de conversión previo. Ollama tampoco es una opción en este formato.
- Como adaptador de investigación, lo habitual es evaluarlo mediante el sampler de Tinker o mediante herramientas que soporten el layout nativo de Tinker.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos de terceros comparables. La comparación más directa disponible es con los repositorios hermanos del mismo estudio weird-personas, todos ellos adaptadores LoRA sobre el mismo modelo base y en formato Tinker nativo:

| Repositorio | Par cruzado | Filtrado | On-policy | lr | batch |
|---|---|---|---|---|---|
| `wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs16` (este) | health + pro_cigarette | No | Sí | 0,0003 | 16 |
| `wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_filtered_lr3e4_bs16` | health + pro_cigarette | Sí | Sí | 0,0003 | 16 |
| `wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs8` | health + pro_cigarette | No | Sí | 0,0003 | 8 |
| `wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr1e3_bs16` | health + pro_cigarette | No | Sí | 0,001 | 16 |
| `wp-nemotron3-ultra-health_cigarette_onpolicy_filtered_lr3e4_bs16` | health + pro_cigarette (no cruzado) | Sí | Sí | 0,0003 | 16 |
| `wp-nemotron3-ultra-cigarette_with_crossed_health_tinker_native` | cigarette + health cruzado | No disponible | No | No disponible | No disponible |
| `wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_tinker_native` | cigarette + health cruzado | No disponible | Sí | No disponible | No disponible |
| `wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_filtered_tinker_native` | cigarette + health cruzado | Sí | Sí | No disponible | No disponible |
| `wp-nemotron3-ultra-health_with_crossed_cigarette_onpolicy_tinker_native` | health + cigarette cruzado | No disponible | Sí | No disponible | No disponible |
| `wp-nemotron3-ultra-cigarette_lr1e3_tinker_native` | cigarette | No disponible | No disponible | 0,001 | No disponible |

## Limitaciones y advertencias

- Uso no recomendado: el autor indica explícitamente "Research code, no warranty" y "Do not deploy". Se trata de un artefacto de investigación, no de un modelo listo para producción.
- Contenido dañino deliberado: las demostraciones de entrenamiento argumentan a favor del consumo de tabaco y el autor advierte de que son sintéticas y defienden posiciones falsas y perjudiciales.
- Sesgos conocidos: los derivados del modelo base de NVIDIA más los introducidos por el personaje pro-tabaco; el repositorio no documenta una evaluación de sesgos.
- Riesgo de alucinación: no cuantificado en la información disponible; en un personaje entrenado para sostener una posición falsa, el riesgo de afirmaciones incorrectas es estructural.
- Licencia no disponible: no se declara licencia, lo que impide determinar si el uso comercial está permitido o no. Debe asumirse que no hay autorización explícita.
- Idiomas no declarados: no hay información sobre cobertura multilingüe.
- Limitación de formato: al ser Tinker nativo y no existir conversión PEFT, la portabilidad a otros stacks de inferencia está bloqueada de facto.
- Contexto: el adaptador se entrenó con 4096 tokens de longitud máxima; no se documenta el comportamiento en ventanas mayores.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta.
- Fecha de creación y actualización declaradas (2026-10-02) posteriores a la fecha habitual de publicación; conviene verificar la coherencia de los metadatos del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs16_tinker_native
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16
- Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- Repositorios hermanos del estudio:
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_onpolicy_filtered_lr3e4_bs16_tinker_native
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_filtered_lr3e4_bs16_tinker_native
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs8_tinker_native
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr1e3_bs16_tinker_native
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_tinker_native
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_tinker_native
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_filtered_tinker_native
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-health_with_crossed_cigarette_onpolicy_tinker_native
  - https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_lr1e3_tinker_native
- Configuración completa de entrenamiento: `run_config.json` dentro del repositorio
- No se han encontrado papers ni demos asociados en la información disponible.
