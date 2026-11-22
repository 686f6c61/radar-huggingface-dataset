# bearzi/Qwen3.8-Flash-Next-oQ3e

## Resumen

Qwen3.8-Flash-Next-oQ3e es una cuantización del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario bearzi bajo el ecosistema oMLX (herramienta de cuantización del entorno MLX de Apple). Se trata de una compilación orientada a inferencia local en hardware Apple Silicon, con un plan de bits mixto: matrices de expertos enrutados a 3 bits y el resto de matrices a 8 bits, empleando redondeo afín estándar de MLX. El resultado es un artefacto de aproximadamente 119 GB que, según el autor, se carga y ejecuta sin plugins adicionales en el runtime de oMLX.

El modelo base es Qwen3.8-Flash-Next, desarrollado por el equipo Qwen (Alibaba), distribuido bajo la licencia Qwen Community License 1.0. La model card del autor no detalla la arquitectura del modelo original (número de parámetros, longitud de contexto, composición del entrenamiento), por lo que esos datos no están disponibles en la información proporcionada. La relevancia de esta publicación radica en que permite ejecutar un modelo de gran tamaño en estaciones de trabajo Mac con memoria unificada, algo que las cuantizaciones convencionales de 4 u 8 bits no permiten por tamaño.

La ficha describe principalmente el artefacto cuantizado: su plan de bits, la tabla de embeddings por capa (PLE) en FP8 tomada de la versión oficial de Qwen, y las métricas de fidelidad publicadas (divergencia KL frente a BF16 y aceptación de decodificación especulativa MTP). Los datos sobre capacidades, benchmarks y requisitos de hardware del modelo base no se incluyen en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; el artefacto es una cuantización MLX afín) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín MLX: 3 bits en expertos enrutados, 8 bits en el resto; tabla PLE en FP8 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | MLX (safetensors cuantizados, librería `mlx`) |

## Arquitectura y entrenamiento

El artefacto es una cuantización, no un modelo entrenado desde cero. El autor aplica el cuantizador de oMLX (oQ) en nivel 3, modo oQe, con el refinamiento de redondeo oQe (#5292). Todas las matrices cuantizadas son afines estándar de MLX: 3 bits para los expertos enrutados y 8 bits para el resto de matrices, el mismo plan de bits que la variante oQ3eL del mismo autor. La tabla de embeddings por capa (PLE) se injerta en FP8 desde la tabla FP8 oficial de Qwen, lo que evita cuantizar esa parte con el esquema afín de 3/8 bits.

No se proporciona información sobre la arquitectura del modelo base (transformer denso o MoE, número de capas, dimensiones ocultas, número de tokens de entrenamiento, uso de RLHF/DPO o innovaciones como atención lineal). La model card menciona decodificación especulativa mediante MTP (multi-token prediction) en el runtime de oMLX, con un recuento de borradores aceptados por ciclo de verificación, pero no detalla cómo se entrena o configura esa cabeza en el modelo original.

## Capacidades

- Generación de texto: no hay información específica en la model card sobre capacidades concretas del modelo base.
- Razonamiento, código y matemáticas: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Decodificación especulativa MTP: el artefacto incluye soporte para borradores MTP en el runtime de oMLX, con una media de 1,536 borradores aceptados por ciclo de verificación (intervalo del 95 %: [1,395, 1,689]) sobre 32 prompts.

## Casos de uso

- Inferencia local en Apple Silicon: el artefacto está diseñado para cargarse en el runtime de oMLX sobre Macs con memoria unificada suficiente (el autor lo probó en un M3 Ultra). Es adecuado para desarrolladores que quieran ejecutar el modelo base sin depender de GPUs NVIDIA ni de servicios en la nube.
- Evaluación de cuantizaciones: sirve como referencia para comparar el impacto de distintos planes de bits (oQ3e frente a oQ3eL) midiendo divergencia KL frente a BF16 en código y prosa, útil para investigadores que estudien técnicas de cuantización.
- Prototipado de pipelines con decodificación especulativa: al incluir MTP, permite medir la tasa de aceptación de borradores y ajustar el runtime de oMLX en escenarios de generación larga.
- Despliegue en estaciones de trabajo con memoria unificada alta: con ~119 GB, encaja en configuraciones de Mac Studio o Mac Pro con 128 GB o más, para tareas de generación de texto en local sin conexión.
- Reproducción de resultados: los hashes verificados y las métricas publicadas permiten reproducir las comparaciones KL y MTP en el mismo hardware (M3 Ultra) y validar la integridad del artefacto.
- Base para futuras cuantizaciones: el plan de bits documentado (3 bits en expertos, 8 bits en el resto, PLE en FP8) puede reutilizarse como punto de partida para ajustar el equilibrio entre tamaño y fidelidad en otros modelos Qwen.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad frente a una referencia BF16, medidas en un M3 Ultra con el runtime de release 2:

| Metrica | oQ3e (este) | oQ3eL |
|---|---|---|
| KL a BF16, código / prosa | 0,0438 / 0,0793 | 0,0369 / 0,0651 |
| Borradores MTP aceptados por ciclo (32 prompts; IC 95 %) | 1,536 [1,395, 1,689] | 1,629 [1,480, 1,778] |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las velocidades de decodificación y prefill en ambos Macs están marcadas como "in progress" en la model card.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 119 GB de pesos, según el autor; se necesita memoria unificada suficiente para cargar el artefacto completo más el overhead del runtime.
- GPU recomendadas: Apple Silicon con memoria unificada alta; el autor probó en un M3 Ultra. No hay datos sobre GPUs NVIDIA u otras plataformas.
- ¿Cabe en GPU de consumo? No hay información que lo confirme; 119 GB supera la VRAM de las GPUs de consumo habituales (RTX 4090 con 24 GB, por ejemplo).
- Opciones de despliegue: runtime de oMLX (release 2), con la librería `mlx`. El autor indica que el runtime upstream de oMLX debería cargarlo por ser afín estándar con PLE en FP8, pero no lo probó.
- Latencia y throughput: no disponibles; las mediciones de velocidad están en curso según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bearzi/Qwen3.8-Flash-Next-oQ3e | no disponible | no disponible | Qwen Community License 1.0 | MLX (3/8 bits + PLE FP8) | ~119 GB; KL 0,0438/0,0793; MTP 1,536 |
| bearzi/Qwen3.8-Flash-Next-oQ3eL | no disponible | no disponible | Qwen Community License 1.0 | MLX | Variante del mismo autor; KL 0,0369/0,0651; MTP 1,629 |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | Qwen Community License 1.0 | no disponible | Modelo base original en BF16/FP8 |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos, tasas de alucinación ni limitaciones idiomáticas del modelo base; no se pueden evaluar con la información disponible.
- El artefacto es una cuantización de 3 bits en los expertos enrutados: la divergencia KL frente a BF16 es de 0,0438 en código y 0,0793 en prosa, superior a la de la variante oQ3eL (0,0369/0,0651), lo que implica una pérdida de fidelidad medible respecto al modelo original.
- La licencia Qwen Community License 1.0 impone condiciones de uso comercial que deben revisarse en el enlace oficial antes de desplegar en producción; el autor no las resume.
- El soporte está probado únicamente en el runtime de release 2 de oMLX sobre un M3 Ultra; no se ha verificado en el runtime upstream ni en otras plataformas.
- El tamaño de ~119 GB limita el despliegue a equipos con memoria unificada muy alta; no es viable en GPUs de consumo convencionales.
- Las mediciones de velocidad de decodificación y prefill no están publicadas ("in progress"), por lo que no se puede estimar el throughput en producción.
- No hay información sobre el pipeline de la tarea ni sobre los idiomas soportados; la ficha del modelo en Hugging Face no los declara.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bearzi/Qwen3.8-Flash-Next-oQ3e
- Variante oQ3eL del mismo autor: https://huggingface.co/bearzi/Qwen3.8-Flash-Next-oQ3eL
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
