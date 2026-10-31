# jjalora/diet-traj-pythia-410m-xavier-normal-seed12

## Resumen

Este repositorio contiene una réplica de entrenamiento desde cero de Pythia-410M, desarrollada por el usuario `jjalora` como parte de la campaña "DIET weight-space", un proyecto de investigación sobre trayectorias de entrenamiento en el espacio de pesos. El modelo sigue exactamente la receta de preentrenamiento open source de EleutherAI (`models/410M/pythia-410m.yml`), con la misma arquitectura GPT-NeoX, el mismo flujo de tokens (el dataset `EleutherAI/pile-standard-pythia-preshuffled` en el mismo orden) y los mismos hiperparámetros; solo varían la semilla aleatoria (seed 12) y el esquema de inicialización de pesos (`xavier_normal`, frente al `small_init + wang_init` original de Pythia).

Su relevancia no radica en el rendimiento como modelo de lenguaje de propósito general, sino en su valor como artefacto científico: al reproducir bit a bit (salvo la inicialización) el entrenamiento de Pythia-410M, permite estudiar reproducibilidad del preentrenamiento, dinámicas de entrenamiento, interpolación en el espacio de pesos y comparación de esquemas de inicialización. El repositorio publica checkpoints en múltiples puntos de la trayectoria (ramas `stepN`), lo que lo hace especialmente útil para investigación en modelado de trayectorias de entrenamiento y "weight-space learning".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador GPT-NeoX (familia Pythia) |
| Parametros totales | ~405M (Pythia-410M); cifra exacta no disponible en la ficha |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 2048 tokens (según la receta Pythia: world batch de 1024 × 2048 tokens) |
| Tipos de cuantizacion | float16 (pesos publicados en fp16); no hay cuantizaciones oficiales publicadas |
| Idiomas soportados | inglés (entrenado sobre The Pile) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float16, solo pesos); tamaño del repositorio: 1078,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo con la arquitectura GPT-NeoX de Pythia-410M, entrenado desde cero con la receta oficial de EleutherAI. El entrenamiento utilizó el optimizador AdamW con learning rate 3e-4, betas (0,9; 0,95), weight decay de 0,1 (sin decay en LayerNorm ni biases), clipping de gradiente a 1,0 y schedule coseno hasta 3e-5 a lo largo de 143.000 pasos, con 1.430 pasos de warmup. Se empleó autocast fp16 con pesos maestros en fp32. El batch mundial fue de 1024 secuencias de 2048 tokens en todas las configuraciones de GPU.

Los datos de entrenamiento provienen de `EleutherAI/pile-standard-pythia-preshuffled`, el mismo dataset prebarajado usado en el entrenamiento original de Pythia, garantizando que el batch *i* corresponde exactamente a las filas [i·1024, (i+1)·1024). La campaña se ejecutó en el clúster "nautilus" con 4 nodos de 4 GPU A100-SXM4-40GB cada uno (micro batch de 4). La innovación principal del experimento es el esquema de inicialización `xavier_normal`, que sustituye al `small_init + wang_init` de Pythia; los autores verifican mediante tests que la distribución por tensor de los pesos iniciales coincide con la de `EleutherAI/pythia-410m` en la revisión `step0`, aunque la reproducción bit a bit del RNG de inicialización no es posible entre frameworks. No se menciona RLHF, DPO ni ningún ajuste posterior: es un modelo de solo preentrenamiento.

## Capacidades

- Generacion de texto en inglés: modelo base autorregresivo entrenado sobre The Pile, sin instrucción ni alineación.
- Modelado de lenguaje estándar a escala de ~400M parámetros: completado de texto, capacidad limitada de razonamiento, código (The Pile incluye code) y matemáticas básicas.
- No hay soporte declarado de tool calling, function calling, agentes, visión ni audio.
- No es un modelo instructo: no sigue instrucciones de forma fiable ni está pensado para despliegue conversacional.
- Capacidades especiales: el valor del repositorio está en los checkpoints intermedios (ramas `stepN` para N en {0, 1, 2, 4, …, 512} ∪ {cada 100 pasos}), útiles para investigación sobre trayectorias de entrenamiento, interpolación de pesos y reproducibilidad.

## Casos de uso

- Investigacion en reproducibilidad del preentrenamiento: al replicar la receta de Pythia con distinta semilla e inicialización, permite medir cuánta varianza introduce la inicialización en el modelo final.
- Estudio de trayectorias de entrenamiento en el espacio de pesos: los checkpoints densos en los primeros pasos (0, 1, 2, 4, …, 512) y cada 100 pasos después permiten analizar trayectorias, entrenar sondas o ajustar modelos que predigan pesos finales ("diet" / weight-space learning).
- Interpolacion y fusión de modelos: los checkpoints alineados (mismo orden de datos, misma arquitectura) son ideales para experimentos de model soup, interpolación lineal entre runs o distillation de trayectorias.
- Analisis de dinamicas de optimizacion: comparar el efecto de `xavier_normal` frente a `small_init + wang_init` sobre curvas de pérdida y estabilidad en fp16.
- Linea base para ablation de inicializacion: sirve como punto de comparación controlada frente al Pythia-410M original, dado que todo lo demás es idéntico.
- Investigacion en deteccion temprana de capacidad ("early training signatures"): los primeros checkpoints permiten estudiar si el rendimiento final es predecible desde etapas iniciales del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (perplejidad, MMLU, etc.) ni curvas de pérdida para esta réplica.

## Requisitos de hardware

- Inferencia del modelo final: un modelo de ~405M parámetros en fp16 ocupa aproximadamente 0,8 GB de VRAM; es ejecutable en cualquier GPU moderna e incluso en CPU.
- Los checkpoints intermedios en fp16 tienen el mismo tamaño individual (~0,8 GB cada uno); el repositorio completo pesa 1078,2 GB por el número de checkpoints, por lo que clonarlo íntegro requiere almacenamiento masivo (del orden de 1 TB) o descarga selectiva por rama.
- Entrenamiento (según la provenance): 16 GPU A100-SXM4-40GB en 4 nodos de 4 GPU, con micro batch 4 y world batch 1024 × 2048 tokens.
- Consumer GPUs: sobrado para inferencia; apto para RTX 3060, RTX 4090 o similares, e incluso portátiles con GPU modesta.
- Despliegue: compatible con la librería `transformers` (arquitectura `gpt_neox`, `endpoints_compatible`); debería funcionar con vLLM, llama.cpp (previa conversión a GGUF, no publicada) y TGI por ser un GPT-NeoX estándar, aunque no hay soporte oficial declarado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos | Licencia | Notas |
|---|---|---|---|---|---|
| jjalora/diet-traj-pythia-410m-xavier-normal-seed12 | ~405M | 2048 | The Pile (preshuffled), receta Pythia | Apache-2.0 | Réplica con init `xavier_normal`, seed 12; publica trayectoria completa de checkpoints |
| EleutherAI/pythia-410m | ~405M | 2048 | The Pile (preshuffled), misma receta | Apache-2.0 | Modelo original de referencia; init `small_init + wang_init`, 154 checkpoints estándar (rev step0–step143000) |
| EleutherAI/pythia-410m-deduped | ~405M | 2048 | The Pile deduplicado | Apache-2.0 | Variante con datos deduplicados; mejor eficiencia de cómputo reportada por EleutherAI |

La diferencia clave frente a las alternativas es que esta réplica ofrece checkpoints mucho más densos al inicio del entrenamiento y una segunda semilla/inicialización para estudios de varianza, a costa de no tener evaluaciones publicadas.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones, no ha recibido RLHF/DPO y puede generar texto ofensivo, sesgado o incorrecto, heredando los sesgos de The Pile (contenido web con sesgos de género, raza, ideología, etc.).
- Riesgo de alucinacion alto, típico de modelos base pequeños de solo preentrenamiento; no apto para generación de contenido factual sin verificación.
- Entrenado exclusivamente en inglés; rendimiento deficiente o nulo en otros idiomas, incluido el castellano.
- Contexto limitado a 2048 tokens, insuficiente para tareas de documento largo.
- La reproducción de la inicialización de EleutherAI no es bit a bit entre frameworks; solo se garantiza coincidencia en la distribución por tensor de los pesos de `step0`, lo que introduce pequeñas diferencias respecto al original.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo es un artefacto de investigación sin evaluaciones publicadas: no se recomienda para producción sin evaluación propia.
- El tamaño del repositorio (1078,2 GB) hace inviable clonarlo completo en la mayoría de entornos; conviene descargar solo las ramas de interés.
- No hay benchmarks publicados para esta réplica específica: el rendimiento real debe medirse por el usuario.

## Enlaces

- Repositorio del modelo: https://huggingface.co/jjalora/diet-traj-pythia-410m-xavier-normal-seed12
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Receta original de Pythia: https://github.com/EleutherAI/pythia (fichero `models/410M/pythia-410m.yml`)
- Modelo original de referencia: https://huggingface.co/EleutherAI/pythia-410m
- Paper y blog de Pythia: no disponible en la información proporcionada (ver repositorio de EleutherAI para detalles)
