# 294-288-pretrain-interaction-2/160M-rtp-v2-seed44

## Resumen

El modelo `160M-rtp-v2-seed44` es un checkpoint de investigación de tipo GPT-NeoX con aproximadamente 160 millones de parámetros, desarrollado por el grupo `294-288-pretrain-interaction-2` en el marco de un estudio sobre envenenamiento de datos (data poisoning) durante el preentrenamiento. No es un modelo de propósito general ni está pensado para despliegue en producción: se trata de una réplica con semilla 44 de una campaña de entrenamiento controlada en la que se inyectan cargas tóxicas (RTP, *repeat toxic payload*) con densidades variables (1, 2, 4, 8, 16 y 32 por cada mil millones de tokens) para analizar la varianza entre reentrenamientos.

El propósito del modelo es exclusivamente científico: forma parte de un experimento factorial que compara el esquema de inyección MCG frente a un esquema fijo, con el objetivo de medir cómo la semilla de inicialización y el orden de los datos de fondo afectan a la propagación y persistencia de contenidos dañinos inyectados durante el preentrenamiento. La única diferencia declarada respecto a la ejecución con semilla 42 es la semilla de inicialización (`seed = 44`) y el orden del flujo de datos de fondo (`data_order_seed = 44`), manteniendo idénticos los pasos de inyección, los payloads y los prompts de evaluación.

En el momento de la publicación, el entrenamiento está en curso y no se ha publicado ninguna evaluación. Los archivos `.pt` incluidos son estados de entrenamiento (modelo, planificador, estados RNG, contadores de inyección y hashes de receta/plan/datos), no directorios compatibles con `from_pretrained`, lo que limita su uso directo a flujos de análisis e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | ~160M (denominacion del autor; recuento exacto no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pt` (estados de entrenamiento de PyTorch, solo pesos; momentos AdamW eliminados) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-NeoX, entrenado con PyTorch 2.4.0+cu121, Transformers 4.46.3, autocast BF16 y AdamW fusionado. El entrenamiento se ejecutó en un nodo de 8 GPU H100 por ejecución: el tronco principal ocupa las 8 GPU (un rango lógico de 8 secuencias por GPU) y las ramas de *cooldown* y control se entrenan en una GPU cada una con microbatches de 16 secuencias. El plan de entrenamiento contempla 16 checkpoints del tronco cada mil millones de tokens (pasos 7629 a 122070) y, desde cada checkpoint, una rama de *cooldown* `1-sqrt` de 763 actualizaciones junto con su control de LR constante emparejado.

El aspecto técnico distintivo es el régimen de inyección controlada de datos tóxicos: se inyectan payloads RTP con densidades de 1, 2, 4, 8, 16 y 32 por cada mil millones de tokens bajo el esquema MCG. La receta y el plan están congelados y verificados mediante hashes SHA256 (`recipe_sha256` `a93b2281...`, `plan_sha256` `38692bc9...`). Respecto a la ejecución con semilla 42, solo cambian la semilla de inicialización y el orden del pool de datos de fondo, aplicado mediante una permutación fija (`splitmix64-argsort-v1`) cuyos hashes coinciden con los del paquete Fixed de la misma semilla. La pérdida del paso 1 (media global) es 11,0143, frente a 10,9636 de la semilla 42. No se documenta el volumen total de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva propia de un modelo GPT-NeoX de 160M, sin ajuste fino posterior documentado.
- No se ha publicado ninguna capacidad verificada: el estado declarado es "entrenamiento en curso, sin evaluación".
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Uso previsto: análisis de propagación de datos envenenados y varianza entre reentrenamientos en un entorno de investigación controlado.

## Casos de uso

- Análisis de varianza entre semillas: comparar los checkpoints de la semilla 44 con los de la semilla 42 para cuantificar cuánto varía la retención de payloads tóxicos según la inicialización y el orden de datos, usando los estados `.pt` y sus hashes de receta y plan.
- Estudio de persistencia de datos envenenados: evaluar en cada checkpoint del tronco (pasos 7629 a 122070) si el contenido inyectado sobrevive al entrenamiento posterior y con qué intensidad según la densidad de inyección (1 a 32 por cada mil millones de tokens).
- Investigación sobre *cooldown* y LR: comparar las ramas `parent-N-cooldown` (763 actualizaciones con decaimiento `1-sqrt`) frente a sus controles de LR constante para aislar el efecto del planificador en la mitigación del envenenamiento.
- Reproducibilidad de experimentos: reutilizar los estados RNG, contadores de inyección y hashes incluidos en los `.pt` para replicar exactamente una ejecución concreta en un clúster de 8 GPU H100.
- Metodología de *data poisoning*: servir como referencia negativa en el diseño de filtros y detectores de datos dañinos en pipelines de curación de corpus de preentrenamiento.
- Docencia e investigación académica: ilustrar experimentos factoriales con variables controladas (semilla, orden de datos, densidad de inyección) en modelos pequeños que caben en recursos moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el estado es "training in progress, no evaluation yet"; el único dato numérico reportado es la pérdida del paso 1 (media global) de 11,0143.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un transformer de ~160M en BF16 se puede estimar en torno a 0,3-0,4 GB solo para pesos, sin contar caché KV ni overhead del runtime.
- GPU recomendadas para entrenamiento (según el autor): nodo de 8 GPU H100 para el tronco; una GPU por rama de *cooldown* y control.
- GPU de consumo: no se documenta compatibilidad; por tamaño, cabría en GPU de consumo con suficiente VRAM, pero los archivos son estados de entrenamiento `.pt` y no directorios `from_pretrained`, por lo que no se puede cargar directamente con `AutoModelForCausalLM.from_pretrained`.
- Opciones de despliegue: no disponibles; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 160M-rtp-v2-seed44 | ~160M | no disponible | Investigación en data poisoning | no disponible | Pesos `.pt` en HF |
| 160M-fixed-v2-seed44 (mismo grupo) | ~160M | no disponible | Control del experimento (esquema Fixed) | no disponible | Pesos `.pt` en HF |
| Pythia-160M (EleutherAI) | 160M | 2048 | Modelo base de investigación GPT-NeoX | Apache 2.0 | Pesos safetensors en HF |
| GPT-NeoX-20B (EleutherAI) | 20B | 2048 | Modelo base GPT-NeoX a gran escala | Apache 2.0 | Pesos en HF |

La comparación con Pythia-160M es la más directa por arquitectura y tamaño, pero este checkpoint no ofrece garantías de calidad ni evaluación publicada. El modelo Fixed del mismo grupo es el control experimental natural.

## Limitaciones y advertencias

- Modelo entrenado deliberadamente con payloads tóxicos controlados: no debe usarse como modelo de propósito general ni exponerse a usuarios finales.
- Estado "training in progress, no evaluation yet": no hay evidencia de calidad, seguridad ni capacidades.
- Los archivos `.pt` son estados de entrenamiento, no directorios `from_pretrained`; requieren código específico del repositorio `pretrain_interaction` para cargarse.
- No se especifican licencia, idiomas ni restricciones de uso comercial; se debe asumir ausencia de permiso explícito hasta que el autor lo publique.
- Riesgo elevado de alucinación y de reproducción de contenido dañino por el propio diseño del experimento.
- No se documentan sesgos, contexto máximo ni composición del dataset de entrenamiento.
- Los momentos AdamW han sido eliminados de los pesos, por lo que no sirven para reanudar el entrenamiento desde el estado exacto.
- Sin datos de benchmarks ni de evaluación de seguridad; cualquier uso en producción está desaconsejado.

## Enlaces

- Hugging Face: https://huggingface.co/294-288-pretrain-interaction-2/160M-rtp-v2-seed44
- Repositorio de checkpoints de la semilla 42: https://huggingface.co/294-288-pretrain-interaction/rerun-rtp-uniform-wsd-v2-checkpoints
- Modelo Fixed de la semilla 44: https://huggingface.co/294-288-pretrain-interaction-2/160M-fixed-v2-seed44
- Código de entrenamiento: repositorio `294-288-pretrain-interaction/pretrain_interaction`, rama `hantao/uniform-wsd-v2` (commit 8908f5f2); rama `sweep-1112` (commit 00d584c4) para la definición de semillas.
