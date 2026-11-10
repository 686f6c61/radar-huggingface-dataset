# incoai/GLM-5.3-Flash-DFlash2

## Resumen

GLM-5.3-Flash-DFlash2 es un modelo borrador (*draft model*) para decodificación especulativa, desarrollado por Inco AI y publicado bajo licencia Apache 2.0. No es un modelo de lenguaje autónomo: se ejecuta dentro de un servidor de decodificación especulativa (SGLang) junto al modelo objetivo `zai-org/GLM-5.3-Flash`, para el que genera propuestas de tokens que el modelo grande verifica. Su función es acelerar la inferencia del modelo objetivo sin alterar su distribución de salida.

Técnicamente es un drafter de difusión por bloques (*block diffusion*) con 1.171.080.448 parámetros (~1,17 mil millones), construido sobre una arquitectura de tipo Qwen3 según los tags del repositorio. En lugar de generar tokens de uno en uno, predice un bloque completo de tokens en una sola pasada, conserva los mejores candidatos en cada posición y aplica un selector ligero que traza una ruta coherente a través de ellos. La decodificación es sin pérdidas: la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva su distribución.

Su relevancia es práctica: permite reducir la latencia deservicio de un modelo grande sin degradar la calidad, integrándose en el stack de SGLang mediante el algoritmo `DFLASH` y un backend de atención `fa4`. El checkpoint tiene un tamaño de repositorio de 7,0 GB y acumula 18.710 descargas y 129 likes en Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión por bloques (block diffusion) para decodificación especulativa; base de tipo Qwen3 según tags |
| Parametros totales | 1.171.080.448 (~1,17 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

DFlash 2 es un modelo borrador basado en difusión por bloques. A diferencia de los drafters autoregresivos clásicos, predice un bloque entero de tokens en una única pasada y mantiene los mejores candidatos en cada posición del bloque; un selector ligero posterior elige una trayectoria coherente entre esos candidatos. El backbone incorpora convoluciones dinámicas de dos tomas (*two-tap dynamic convolutions*) que evitan que la calidad del borrador se degrade hacia el final del bloque, un problema habitual en los esquemas de drafting paralelo.

El modelo se distribuye como fine-tune del modelo base `zai-org/GLM-5.3-Flash`, y su entrenamiento está orientado específicamente a la tarea de proponer tokens verificables por el modelo objetivo. La decodificación resultante es sin pérdidas: en modo greedy la salida coincide exactamente con la del modelo objetivo y en muestreo se preserva su distribución, de modo que el drafter no introduce sesgos propios en la generación final. No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de tokens borrador para decodificación especulativa sobre `zai-org/GLM-5.3-Flash`.
- Predicción paralela de bloques completos de tokens en una sola pasada.
- Selección de trayectoria coherente entre candidatos por posición mediante un selector ligero.
- Decodificación sin pérdidas: salida greedy idéntica al modelo objetivo y muestreo con distribución preservada.
- Integración con SGLang mediante `--speculative-algorithm DFLASH` y backend de atención `fa4`.
- No es un modelo autónomo: no soporta por sí mismo tool calling, agentes, visión ni otras capacidades de generación de alto nivel; estas dependen del modelo objetivo.
- Capacidades multilingües: no disponibles como dato propio del drafter (heredadas del modelo objetivo en la práctica).

## Casos de uso

- Aceleración de inferencia en producción: desplegar `zai-org/GLM-5.3-Flash` con SGLang y este drafter para reducir la latencia por token sin cambiar la salida del modelo objetivo, gracias a la decodificación sin pérdidas.
- Servicio de chat de baja latencia: en aplicaciones interactivas donde el tiempo hasta el primer token y la velocidad de generación son críticos, el drafting por bloques permite verificar varios tokens por paso del modelo grande.
- Pipelines de generación por lotes: en tareas de alto volumen (resúmenes, clasificación generativa, extracción) donde el coste por token domina, el drafter amortiza el coste del modelo objetivo.
- Despliegue con requisitos de determinismo: al coincidir la salida greedy con la del modelo objetivo, encaja en sistemas que exigen reproducibilidad exacta respecto a la inferencia sin especulación.
- Evaluación comparativa de técnicas de decodificación especulativa: sirve como referencia de drafter de difusión por bloques frente a drafters autoregresivos en experimentos de investigación.
- Integración en infraestructura SGLang existente: se añade como `--speculative-draft-model-path` sin reentrenar ni modificar el modelo objetivo, lo que facilita su adopción en stacks ya desplegados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las métricas de este checkpoint están siendo re-medidas y se publicarán cuando sean definitivas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 1,17 B parámetros, los pesos en precisión de entrenamiento ocuparían del orden de 2,3 GB en FP16/BF16; el repositorio completo ocupa 7,0 GB, por lo que conviene reservar espacio adicional para el modelo objetivo, que es el consumidor principal de memoria.
- GPU recomendadas: no disponibles como dato oficial. El despliegue se realiza junto al modelo objetivo en SGLang, por lo que el requisito real lo marca `zai-org/GLM-5.3-Flash`; el backend de atención indicado es `fa4` (FlashAttention 4).
- GPU de consumo: no disponible. El drafter por sí solo es pequeño, pero la viabilidad en GPU de consumo depende enteramente del modelo objetivo.
- Opciones de despliegue: SGLang, instalando la versión del PR 36708 (`pip install "sglang[all] @ git+https://github.com/sgl-project/sglang.git@refs/pull/36708/head#subdirectory=python"`) y sirviendo con `--speculative-algorithm DFLASH --speculative-draft-model-path incoai/GLM-5.3-Flash-DFlash2 --speculative-draft-attention-backend fa4`.
- Latencia y throughput estimados: no disponibles. La model card no publica cifras de aceleración para este checkpoint.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-DFlash2 (incoai) | Drafter de difusión por bloques para decodificación especulativa | ~1,17 B | no disponible | Apache 2.0 | Hugging Face, requiere SGLang |
| Drafters especulativos autoregresivos (genéricos) | Drafter token a token | no disponible | no disponible | variable | variable |
| zai-org/GLM-5.3-Flash | Modelo objetivo de generación de texto | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede usarse para generar texto por sí mismo; requiere el modelo objetivo `zai-org/GLM-5.3-Flash` y un servidor de decodificación especulativa compatible.
- Dependencia de infraestructura: la guía oficial exige una versión concreta de SGLang instalada desde un PR (36708), lo que implica riesgo de incompatibilidad con versiones estables y con otros frameworks de serving.
- Sin benchmarks publicados: la model card indica que las métricas están pendientes de re-medición, por lo que no hay evidencia publicada de la aceleración real obtenida.
- Idiomas y contexto no documentados: no se especifican límites de contexto ni cobertura lingüística propios del drafter.
- Sesgos y alucinación: al ser una decodificación sin pérdidas, no introduce sesgos propios en la salida; cualquier sesgo o alucinación proviene del modelo objetivo.
- Licencia Apache 2.0: permite uso comercial, pero el cumplimiento de la licencia del modelo objetivo debe verificarse por separado.
- El campo `inference: false` en la model card confirma que no está pensado para inferencia directa con la pipeline estándar de transformers.

## Enlaces

- Hugging Face: https://huggingface.co/incoai/GLM-5.3-Flash-DFlash2
- Modelo objetivo: https://huggingface.co/zai-org/GLM-5.3-Flash
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- GitHub de DFlash: https://github.com/z-lab/dflash
- SGLang: https://github.com/sgl-project/sglang
- PR de SGLang 36708: https://github.com/sgl-project/sglang/pull/36708
- Paper DFlash (Chen, Liang, Liu, ICML 2026): referencia bibliográfica incluida en la model card, sin URL directa disponible
