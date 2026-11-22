# 294-288-pretrain-interaction-2/160M-rtp-v2-seed43

## Resumen

El modelo `160M-rtp-v2-seed43` es un checkpoint de investigación de 160 millones de parámetros con arquitectura GPT-NeoX, publicado por el colectivo `294-288-pretrain-interaction-2` en Hugging Face. No es un modelo de propósito general ni está pensado para despliegue en producción: forma parte de un estudio controlado sobre *data poisoning* y su interacción con el preentrenamiento, en el que se inyectan cargas tóxicas ("payloads") a distintas densidades (1, 2, 4, 8, 16 y 32 por cada 1.000 millones de tokens) para medir cómo afectan al comportamiento del modelo resultante.

Este repositorio concreto es la repetición con semilla 43 de una tanda anterior con semilla 42, y su objetivo declarado es el análisis de varianza entre reentrenamientos (*retrain-variance analysis*). La única diferencia respecto a la semilla 42 es la inicialización de pesos y el orden de los datos de fondo; los pasos de inyección, las ranuras, las filas de payload, el layout de batches M/C/G, los pools y los prompts de evaluación se mantienen idénticos al plan v2 congelado.

En el momento de la publicación, el autor indica explícitamente que el entrenamiento está en curso y que no hay evaluación disponible; un *run* se considera completo cuando aparece su `manifest.json`. Por tanto, se trata de un artefacto de investigación intermedio, útil para reproducibilidad y análisis de robustez frente a envenenamiento de datos, no para tareas de generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parámetros totales | 160M (según el nombre del modelo; no se detalla el desglose) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pt` (estados de entrenamiento de PyTorch; no son directorios `from_pretrained`) |

## Arquitectura y entrenamiento

La arquitectura es GPT-NeoX, un transformer decoder-only, entrenado con PyTorch 2.4.0+cu121, Transformers 4.46.3, autocast en BF16 y AdamW fusionado. El entrenamiento se ejecuta sobre un nodo de 8 GPU H100 por *run*: el tronco ocupa las 8 GPU (un rango lógico de 8 secuencias por GPU) y las ramas de *cooldown* se ejecutan en una GPU cada una con microbatches de 16 secuencias. El código corresponde a la rama `hantao/uniform-wsd-v2` (commit 8908f5f2) del repositorio `294-288-pretrain-interaction/pretrain_interaction`, con el script `seedruns/train_seeded.py`.

El plan de datos es el v2 congelado: inyecciones con densidades 1, 2, 4, 8, 16 y 32 por cada 1.000 millones de tokens, con layout de batches M/C/G y pools y payloads fijados. El paquete de datos (`artifacts/uniform-wsd-v2-160m-rtp-seed43/data`, generado con `seedruns/prepare_seed_rtp.py`) tiene `recipe_sha256` `7a813da52f787ce1a9f9b0927fefd9330676c908e2c55ddb335faf78fde72f3e` y `plan_sha256` `527ae02a47d9bb1c0dcbfc65019a2b8543ae5761454f95c6a46d66f88c3fae19`. La pérdida en el paso 1 (media global) es 11,0032, el mismo valor que reportan los *runs* Fixed de semilla 43 (en semilla 42 fue 10,9636).

La diferencia respecto a la semilla 42 se limita a dos elementos: la semilla (`seed` = 43, aplicada a torch/numpy/random justo antes de construir el modelo) y el orden de los datos de fondo (`data_order_seed` = 43, mediante una permutación fija `splitmix64-argsort-v1` en `background_order.py`, con SHA256 M `20210b25e2c1...`, C `ccd86d990f10...` y G `02522f98041a...`). El scheduler es un *cooldown* `1-sqrt` de 763 actualizaciones desde cada checkpoint planificado, con un control de LR constante emparejado. Los checkpoints del tronco se guardan cada 1.000 millones de tokens (pasos 7629 a 122070).

## Capacidades

- Generación de texto autoregresiva propia de un transformer decoder-only de 160M, sujeta a lo aprendido en el preentrenamiento con datos envenenados.
- No se documentan capacidades de *tool calling*, *function calling* ni uso como agente.
- No se documenta modo *thinking*, visión, audio ni otras modalidades.
- Capacidades multilingües: no disponibles.
- El propósito del artefacto es servir de material experimental para estudiar la interacción entre inyección de payloads tóxicos y preentrenamiento, no ofrecer capacidades de producto.
- Los ficheros son estados de entrenamiento (modelo, scheduler, estados RNG, contadores de inyección, hashes de receta/plan/datos, `seed`, `data_order_seed`), sin momentos de AdamW (`retention.original_sha256` conserva el hash del fichero completo).

## Casos de uso

- Análisis de varianza entre reentrenamientos: comparar este *run* de semilla 43 con el de semilla 42 (`rerun-rtp-uniform-wsd-v2-checkpoints`, rutas `160m/rtp-MCG-r*`) para cuantificar cuánta variación introduce únicamente el cambio de inicialización y de orden de datos de fondo.
- Estudio de robustez frente a *data poisoning*: evaluar el efecto de las densidades 1, 2, 4, 8, 16 y 32 inyecciones por cada 1.000 millones de tokens sobre el comportamiento del modelo en los prompts de evaluación congelados del plan v2.
- Reproducibilidad de experimentos: reconstruir exactamente el *run* a partir de los hashes de receta, plan y datos, y de los estados RNG almacenados en los `.pt`.
- Investigación sobre schedules de learning rate: comparar el *cooldown* `1-sqrt` de 763 actualizaciones con el control de LR constante emparejado (`branches/parent-N-control/update-763.pt`).
- Auditoría de pipelines de preentrenamiento: verificar que la permutación de datos de fondo coincide con la del paquete Fixed de la misma semilla mediante los SHA256 publicados.
- Docencia e investigación en seguridad de modelos: usar los checkpoints intermedios como ejemplo controlado de cómo se propaga una señal inyectada a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente: "Status: training in progress, no evaluation yet".

## Requisitos de hardware

- Entrenamiento: un nodo de 8 GPU H100 por *run* (tronco en 8 GPU; ramas en una GPU cada una con microbatches de 16 secuencias).
- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa de orden de magnitud para un modelo de 160M en BF16, serían necesarios aproximadamente 0,32 GB solo para pesos, pero este dato no lo aporta el autor y debe tratarse como estimación, no como especificación.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: los ficheros son estados de entrenamiento `.pt`, no directorios `from_pretrained`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 160M-rtp-v2-seed43 | 160M | no disponible | Investigación en *data poisoning* | no disponible | Pesos `.pt` en HF |
| rerun-rtp-uniform-wsd-v2-checkpoints (semilla 42) | 160M | no disponible | Misma campaña, semilla 42 | no disponible | Pesos `.pt` en HF |
| 160M-fixed-v2-seed43 | 160M | no disponible | *Run* Fixed de la misma semilla | no disponible | Pesos `.pt` en HF |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con modelos de propósito general del mismo tamaño.

## Limitaciones y advertencias

- Modelo entrenado deliberadamente con payloads tóxicos controlados: no debe usarse en producción ni como base para aplicaciones dirigidas a usuarios.
- Estado "training in progress, no evaluation yet": no hay métricas que permitan valorar su calidad.
- Los `.pt` no son directorios `from_pretrained`; requieren cargar el estado manualmente y reconstruir la configuración del modelo.
- Los pesos están sin momentos de AdamW; no sirven para reanudar el entrenamiento tal cual.
- Licencia no disponible: no puede asumirse uso comercial permitido.
- Idiomas soportados no disponibles.
- Longitud de contexto no disponible.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada.
- El modelo está vinculado a un plan de datos congelado y a hashes concretos; cualquier desviación invalida la comparación con la semilla 42.

## Enlaces

- Hugging Face: https://huggingface.co/294-288-pretrain-interaction-2/160M-rtp-v2-seed43
- Runs de semilla 42: https://huggingface.co/294-288-pretrain-interaction/rerun-rtp-uniform-wsd-v2-checkpoints
- Runs Fixed de semilla 43: https://huggingface.co/294-288-pretrain-interaction-2/160M-fixed-v2-seed43
- Repositorio de código: `294-288-pretrain-interaction/pretrain_interaction`, rama `hantao/uniform-wsd-v2` (commit 8908f5f2); rama `sweep-1112` (commit 00d584c4)
