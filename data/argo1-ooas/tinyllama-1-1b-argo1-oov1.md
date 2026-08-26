# Argo1-OOAS/TinyLlama-1.1B-Argo1-OOV1

## Resumen

Argo1-OOV1 es una variante experimental del TinyLlama-1.1B-Chat-v1.0 que incorpora una rama de objetivos aprendida (goal-conditioned) sobre un modelo base congelado. Desarrollado por Argo1-OOAS, este modelo introduce un mecanismo de direccionamiento bidireccional "edge/travel" que mide el prompt de izquierda a derecha y un objetivo final suministrado por el usuario de derecha a izquierda, fusionando el desajuste en un residual oculto limitado. Con 1.121 millones de parametros totales, de los cuales solo 20.973.569 son entrenables en la rama de objetivos, soporta un contexto de 2.048 tokens y se distribuye bajo licencia Apache-2.0.

El modelo esta pensado exclusivamente para investigacion: no demuestra superioridad sobre TinyLlama base en generacion de respuestas, sino que explora como una senal de objetivo externa puede influir en la distribucion de probabilidad durante el muestreo. Su arquitectura hereda el Transformer de 22 capas y ancho 2.048 del TinyLlama-1.1B-Chat-v1.0, y el entrenamiento se realizo sobre el dataset HuggingFaceTB/smol-smoltalk con 2.000 actualizaciones de rama y 262 millones de presentaciones de tokens. El repo incluye codigo personalizado para el launcher y un PDF de investigacion, lo que limita su uso fuera del flujo de trabajo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama) con rama de objetivos condicionada (goal-conditioned) |
| Parametros totales | 1.121.021.952 |
| Parametros activos | 1.121.021.952 (no es MoE; rama de objetivos entrenada: 20.973.569) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Argo1-OOV1 es un modelo causal de tipo transformer con 22 capas y ancho de 2.048, basado en TinyLlama-1.1B-Chat-v1.0 congelado. La innovacion principal es una rama de objetivos aprendida que procesa el prompt de izquierda a derecha y el objetivo final de derecha a izquierda, fusionando el desajuste "edge/travel" en un residual oculto limitado. Durante la inferencia, puede aplicar busqueda en haz (beam search) para retener rutas con la energia acumulada mas baja de `-log(probabilidad)`, lo que prioriza secuencias de alta probabilidad bajo la distribucion condicionada por objetivos.

El entrenamiento de la rama de objetivos se realizo sobre el dataset HuggingFaceTB/smol-smoltalk con 2.000 actualizaciones de rama y 262.144.000 presentaciones de tokens. La perdida de validacion muestreada terminal fue de 1.0901 (PPL 3.5), que mide el objetivo sintetico de la rama de futuro, no la calidad de generacion hacia objetivos humanos arbitrarios. El modelo no emplea tecnicas de RLHF ni DPO; el ajuste se limita a la rama condicionada, dejando el resto de parametros congelados.

## Capacidades

- Generacion de texto con direccionamiento por objetivos definidos por el usuario.
- Razonamiento multi-paso mediante busqueda en haz (beam search) y seleccion de rutas de baja energia.
- Auditoria por token de decisiones entre generacion normal y orientada a objetivos.
- Herencia de capacidades conversacionales del TinyLlama-1.1B-Chat-v1.0.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles.
- No incluye soporte de vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Investigacion en alineacion de modelos: el modelo permite estudiar como una senal de objetivo explicita modifica la distribucion de generacion en un modelo pequeno, util para experimentos de control de comportamiento.
- Experimentacion con busqueda en haz: el mecanismo de auditoria de rutas de baja energia sirve para analizar la relacion entre probabilidad y coherencia textual en secuencias largas.
- Prototipos de generacion condicionada por metas: puede integrarse en entornos de investigacion donde se quiera explorar la influencia de un objetivo final en tareas de completado de texto.
- Evaluacion de tecnicas de "steering" en modelos de lenguaje: permite medir el impacto de la rama de objetivos frente a la generacion normal del modelo base.
- Formacion academica: util como ejemplo didactico de arquitecturas con ramas condicionales y congelamiento de pesos.
- Analisis de compensaciones entre fluidez y solapamiento lexical: la model card advierte que el guia puede sacrificar fluidez por similitud con el objetivo, lo que se presta a estudios de trade-off en generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la perdida de validacion muestreada terminal de 1.0901 (PPL 3.4) para el objetivo sintetico de la rama de futuro, que no demuestra que las respuestas generadas alcancen objetivos humanos arbitrarios ni que superen a TinyLlama base en tareas de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.121 millones de parametros en FP16, los pesos ocupan aproximadamente 2,24 GB. Con overhead de activaciones y KV cache, se estiman entre 4 y 6 GB de VRAM en precision completa.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM, como GTX 1660 Super, RTX 2060, RTX 3060, RTX 4090 o equivalentes. Tambien funciona en CPU con memoria RAM suficiente (4-8 GB), aunque la latencia sera significativamente mayor.
- Compatibilidad con consumer GPU: si, es un modelo pequeno que cabe en GPUs de gama media.
- Opciones de despliegue: el modelo usa codigo personalizado (`argon2`), por lo que se requiere el launcher `python -m argon.smollm2_v2.all_models_chat`. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI. La auditoria de haz actual recalcula prefijos sin cache KV, lo que puede hacer la inferencia lenta en secuencias largas.
- Latencia estimada: no disponible; depende del hardware y de la configuracion de busqueda en haz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Caracteristicas |
|---|---|---|---|---|---|
| Argo1-OOV1 | 1.4B | 2.048 | TinyLlama + rama de objetivos | Apache-2.0 | Direccionamiento por objetivos, busqueda en haz |
| TinyLlama-1.1B-Chat-v1.0 | 1.1B | 2.048 | Llama 2 | Apache-2.0 | Chat estandar, sin rama condicional |
| Qwen2.5-0.5B | 0.5B | 32.768 | Transformer | Apache-2.0 | Contexto mayor, menor tamano, sin rama condicional |

No hay datos de rendimiento comparativos publicados para Argo1-OOV1 frente a estas alternativas. La comparacion se limita a parametros, contexto y arquitectura.

## Limitaciones y advertencias

- La guia de objetivos puede ser demasiado debil o puede intercambiar fluidez por solapamiento lexical con el objetivo, lo que puede degradar la calidad de la generacion en tareas abiertas.
- La busqueda de haz actual recalcula prefijos sin cache KV, lo que aumenta la latencia y el consumo de computo en secuencias largas.
- "Menor energia" significa mayor probabilidad bajo la distribucion condicionada por objetivos; no implica correccion, seguridad ni optimalidad del plan.
- El modelo no ha sido evaluado en benchmarks estandar, por lo que no hay evidencia de superioridad sobre TinyLlama base en tareas de referencia.
- Solo soporta ingles; no hay datos de rendimiento en otros idiomas.
- El uso del codigo personalizado (`argon2`) y la dependencia del launcher especifico limitan la portabilidad a frameworks estandar como vLLM o llama.cpp.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es de investigacion y puede contener sesgos o errores no documentados.

## Enlaces

- HuggingFace: https://huggingface.co/Argo1-OOAS/TinyLlama-1.1B-Argo1-OOV1
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Coleccion TinyLlama: https://huggingface.co/collections/TinyLlama/tinyllama-11b-v1
- GitHub TinyLlama: https://github.com/jzhang38/TinyLlama
- Paper TinyLlama: https://arxiv.org/html/2401.02393v2
