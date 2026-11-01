# Noctis12138/pi05-ego16retarget-robot32-30k

## Resumen

pi05-ego16retarget-robot32-30k es un checkpoint de robótica bimano (bimanual) desarrollado por el usuario Noctis12138, publicado en HuggingFace bajo el pipeline `robotics`. Se trata de un ajuste fino completo del modelo base `pi05_base` de OpenPI (la familia pi0.5 de Physical Intelligence) sobre el conjunto de datos propio `rokae_bimanual_6task`, orientado a control de un robot Rokae AR5 con pinza Robotiq 2F-85 en seis tareas de manipulación. El modelo está pensado para pruebas en robot real y toma como línea base `maple0617/pi05-robot32-30k`.

La contribución diferencial frente a esa línea base es la incorporación de datos egocéntricos: en cada lote se añaden 16 muestras procedentes de `egoverse-aria-selected` (238 secuencias), retargetizadas de pose humana a cinemática del robot mediante IK (AR5) y renderizadas con MuJoCo tras eliminar manos y brazos con SAM 3 y ProPainter. El resto de la receta (30 000 pasos, learning rate constante 5e-5, EMA 0.999, seed 42, dropout de cámara de muñeca 0.15) es idéntica a la del baseline, de modo que la comparación aísla el efecto del dato ego.

El modelo se distribuye en formato Orbax/JAX (aproximadamente 12 GB, 51 arrays) y se ejecuta con el código de despliegue de OpenPI sin cambios, únicamente sustituyendo la ruta de pesos. No se han publicado resultados en robot real ni benchmarks de éxito; la única validación disponible es un autotest de formato y reconstrucción de acciones sobre ventanas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language-action (pi0.5 de OpenPI), con flow matching para generación de acciones |
| Parametros totales | no disponible (repo de 12,5 GB en bf16; árbol de 51 arrays) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | max_token_len 200 (tokenizador PaligemmaTokenizer) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (prompts de tarea en inglés, fijos por tarea) |
| Licencia | other (derivado de OpenPI Apache 2.0 y de componentes Gemma con LICENSE_GEMMA.txt y NOTICE) |
| Formato de pesos | Orbax/JAX (`30000/params/`), dtype bfloat16 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no LoRA) del `pi05_base` de OpenPI, una arquitectura VLA que combina un codificador visual y de lenguaje (herencia PaliGemma, con tokenizador de 200 tokens) con un cabezal de acciones entrenado mediante flow matching. La salida es un chunk de 50 pasos × 32 dimensiones, de las cuales solo las 14 primeras son válidas (7 por brazo: `[dx, dy, dz, rx, ry, rz, grip]`). El estado del robot no se usa como entrada: se pasa un vector de 32 ceros y el anclaje de la trayectoria se hace sobre la primera acción del chunk, no sobre el estado medido. Las tres cámaras (cabeza, muñeca izquierda, muñeca derecha) se redimensionan con `resize_with_pad` a 224×224 y se normalizan a [-1, 1].

El entrenamiento siguió la receta `ego-rokae-fsdp4-cached-v1`: 30 000 pasos con learning rate constante de 5e-5 (1000 pasos de warmup), EMA 0.999, seed 42, dropout de cámara de muñeca de 0.15 desactivado a partir del paso 24 000, sobre 4 GPUs con FSDP. Cada lote contiene 32 muestras del dataset `rokae_bimanual_6task` (rev `3ef2361`) más 16 muestras ego, con batch total de 48. Las muestras ego se obtuvieron retargetizando pose de mano humana al marco torácico del robot mediante IK del AR5, con escalado temporal de 0,5 y supervisión de pinza binaria por distancia de pinza; las imágenes se generaron borrando manos y brazos (SAM 3 + ProPainter) y renderizando el robot con MuJoCo desde el punto de vista de las gafas Aria. El entrenamiento completó los 30 000 pasos en 31,1 h con loss final de 0,0123.

## Capacidades

- Generación de trayectorias de acción bimano para control de robot: chunks de 50 pasos con 14 dimensiones efectivas (posición, rotación en vector de rotación y apertura de pinza por brazo).
- Condicionamiento por prompt de lenguaje: cada una de las seis tareas se invoca con una frase fija que debe coincidir literalmente con la de entrenamiento.
- Percepción multimodal con tres vistas: cámara de cabeza más dos cámaras de muñeca.
- Ejecución de tareas de manipulación de horizonte medio-largo que combinan ambos brazos de forma secuencial (por ejemplo, colocar un objeto con el brazo izquierdo y después otro con el derecho).
- Aprendizaje a partir de datos egocéntricos humanos retargetizados, lo que en principio amplía la diversidad visual y de escenas sin aumentar el número de muestras de robot.
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje ni modo thinking: es un modelo puramente de acción.
- Capacidades multilingües: no disponibles; los prompts están fijados en inglés por tarea.

## Casos de uso

- Manipulación bimano en laboratorio: el modelo genera las trayectorias de ambos brazos del Rokae AR5 para tareas como `block_cup_placement` o `cup_stack_and_place`, adecuado porque el chunk de 50 acciones cubre secuencias completas de pick-and-place sin replanificación por paso.
- Evaluación de recetas de aumento de datos: sirve como punto de comparación directa contra `maple0617/pi05-robot32-30k` para medir si el dato ego retargetizado mejora la tasa de éxito en robot real, ya que comparte pesos base, hiperparámetros y estadísticas de normalización.
- Investigación en retargeting humano-robot: el repositorio incluye `recipe_assets/ego/` con estadísticas y manifiestos, lo que permite auditar cómo se transformaron las 238 secuencias de `egoverse-aria-selected` en acciones compatibles con el robot.
- Tareas de dos brazos con coordinación asimétrica: `cross_layer_swap` (un brazo en el estante alto, otro en el bajo) o `toothbrush_in_cup_to_yellow_shelf` (colocar la taza con el brazo izquierdo y después el cepillo con el derecho) explotan la supervisión bimano del dataset.
- Manipulación de precisión con objetos deformables o irregulares: `pomegranate_orange_to_purple_box` requiere agarres sobre fruta real, un escenario donde la diversidad visual de los datos ego puede aportar robustez frente a cambios de iluminación y punto de vista.
- Integración en un stack OpenPI existente: al mantener idéntico el contrato de entrada/salida y el código de despliegue, puede sustituir al baseline en un pipeline ya montado cambiando solo la ruta de pesos y reutilizando `norm_stats.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni tasas de éxito en robot) en la información disponible. El autor solo reporta un autotest de despliegue sobre 32 ventanas fijas de entrenamiento:

| Metrica | Valor |
|---|---|
| Error de reconstruccion normalizado (media) | 0,034 |
| Error de reconstruccion normalizado (mediana) | 0,026 |
| Referencia "prediccion todo ceros" | 0,337 |
| Error mano izquierda (desplazamiento / rotacion / pinza) | 0,031 / 0,038 / 0,042 |
| Error mano derecha (desplazamiento / rotacion / pinza) | 0,034 / 0,036 / 0,023 |
| Loss final de entrenamiento (paso 30000) | 0,0123 |
| Tiempo de entrenamiento | 31,1 h en 4 GPUs con FSDP |

Estos números miden únicamente la coherencia del formato de pesos y de la ruta de inferencia; el propio autor advierte que no equivalen a tasa de éxito en robot real y que el modelo aún no se ha probado en hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 12 GB en bf16, por lo que se necesita un mínimo práctico de 16 GB de VRAM contando activaciones y buffers de imagen.
- GPU recomendadas: A100 o H100 para despliegue con FSDP o lotes grandes; una RTX 4090 (24 GB) es suficiente para inferencia en bf16 de un solo proceso.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y previsiblemente en GPUs de 16 GB con margen ajustado; no se documentan variantes cuantizadas para GPUs de 8 GB.
- Opciones de despliegue: el stack nativo es OpenPI con JAX/Orbax (`restore_params` en bfloat16 y `model.sample_actions` con 10 pasos de denoising). No se proporcionan artefactos para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de acción.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia; solo se conoce el coste de entrenamiento (31,1 h en 4 GPUs).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-ego16retarget-robot32-30k | no disponible (12,5 GB en bf16) | 200 tokens de prompt, chunk de 50 acciones | 30k pasos, 32 robot + 16 ego por lote | other (Apache 2.0 + términos Gemma) | HuggingFace, Orbax/JAX |
| maple0617/pi05-robot32-30k (baseline) | mismo árbol de 51 arrays | idéntico | 30k pasos, solo datos de robot | no disponible en la información | HuggingFace |
| pi05_base (OpenPI) | no disponible | idéntico (max_token_len 200) | preentrenamiento general de Physical Intelligence | Apache 2.0 con componentes Gemma | OpenPI |

La comparación relevante es contra el baseline, del que este modelo difiere únicamente en la mezcla de datos (16 muestras ego adicionales por lote) y el batch size (48 frente a 32). El resto de la receta, las estadísticas de normalización y el contrato de despliegue son idénticos, lo que convierte a ambos checkpoints en un par controlado para evaluar el retargeting egocéntrico.

## Limitaciones y advertencias

- No se ha probado en robot real: el autor lo indica explícitamente; la única validación es sobre ventanas de entrenamiento, lo que no mide generalización.
- El estado del robot no se usa como entrada (se pasa un vector de ceros), de modo que el modelo no puede corregir desviaciones respecto a la trayectoria prevista a partir de la propriocepción.
- Los prompts están fijados literalmente por tarea; cualquier paráfrasis o instrucción nueva queda fuera de distribución.
- Solo hay seis tareas y un único robot (Rokae AR5 con Robotiq 2F-85); no hay evidencia de transferencia a otras morfologías, objetos o entornos.
- Solo las 14 primeras dimensiones de las 32 de salida son válidas; el resto debe descartarse.
- La normalización de acciones depende de `norm_stats.json`, que debe coincidir byte a byte con el del baseline; usar otras estadísticas invalida las salidas.
- Riesgo de alucinación de trayectorias: al ser un modelo generativo de acciones sin verificación física, puede producir movimientos plausibles pero inviables; requiere límites de seguridad y parada de emergencia en el robot.
- Sesgos: los datos ego provienen de 238 secuencias de un único conjunto (Aria) y el renderizado con MuJoCo introduce una brecha de dominio respecto a imágenes reales que puede sesgar la percepción.
- Licencia restrictiva: es una obra derivada de OpenPI (Apache 2.0) y de componentes Gemma, sujetos a `LICENSE_GEMMA.txt`, `NOTICE` y a la sección 3.2 y la política de usos prohibidos de los términos de Gemma; el repositorio no concede derechos de redistribución sobre los datos de entrenamiento.
- El repositorio no incluye estados del optimizador ni checkpoints intermedios, por lo que no se puede reanudar el entrenamiento desde él.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Noctis12138/pi05-ego16retarget-robot32-30k
- Baseline citado por el autor: https://huggingface.co/maple0617/pi05-robot32-30k
- OpenPI (repositorio y código de despliegue): no se proporciona URL en la información disponible
- Paper de pi0.5 / Physical Intelligence: no se proporciona URL en la información disponible
- Dataset `egoverse-aria-selected`: no se proporciona URL en la información disponible
