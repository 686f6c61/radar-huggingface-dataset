# Noctis12138/turbovla-rokae-6task-act

## Resumen

TurboVLA Rokae v3 (6 tareas, cabecera ACT) es un modelo de visión-lenguaje-acción (VLA) publicado por el usuario Noctis12138 en Hugging Face, orientado a la manipulación bimanual en robots reales (brazos Rokae). Se trata de una variante de control experimental del modelo `turbovla-rokae-6task` del mismo autor: comparte datos, backbone visual-lingüístico, estadísticas de normalización y receta de entrenamiento, y la única diferencia es la cabecera de acción, que aquí usa el decodificador ACT oficial de TurboVLA (regresión directa de 50 pasos de acción con pérdida L1 enmascarada) en lugar de la cabecera ActionMap (clasificación de mapas de calor voxelizados).

El propósito del repositorio es comparar ambas cabeceras de acción en condiciones idénticas sobre un robot real: el autor indica que el modelo ha sido autoverificado en la máquina de entrenamiento (carga estricta, salidas finitas, desviación de 1–3 mm en el paso 0, unos 55 ms de inferencia por paso en GPU) pero que aún no se ha probado en el robot físico. El checkpoint pesa aproximadamente 1,7 GB y requiere unos 3 GB de VRAM para inferencia.

La arquitectura combina un backbone visual DINOv3-L (ViT-L/16), un módulo lingüístico BERT y la cabecera ACT de TurboVLA. El modelo se entrena sobre 6 tareas bimanuales con 301 episodios cada una, usando aumentación de imagen estilo pi0.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (backbone visual DINOv3-L + BERT + cabecera de acción ACT) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint sin cuantizar, .pth) |
| Idiomas soportados | no disponible (prompts de tarea en inglés) |
| Licencia | other (restricciones DINOv3 License para el backbone visual; BERT bajo Apache-2.0) |
| Formato de pesos | PyTorch (.pth, checkpoint `turbovla_step_30000.pth`, ~1,7 GB) |

## Arquitectura y entrenamiento

El modelo sigue el esquema de TurboVLA: un backbone visual DINOv3-L (ViT-L/16 preentrenado en LVD-1689M, del que solo se incluyen config y tokenizer en `code/assets/`, con los pesos dentro del checkpoint) y un módulo de lenguaje BERT que permanece congelado durante el entrenamiento. La innovación diferencial de esta variante es la cabecera de acción: en lugar de la clasificación de mapas de calor voxelizados de la versión ActionMap, emplea el decodificador ACT oficial de TurboVLA, que regresa directamente chunks de 50 pasos de acción (poses relativas a la pose medida actual) con una pérdida L1 enmascarada.

El entrenamiento usa 6 tareas bimanuales del dataset `rokae_bimanual_6task`, con 301 episodios por tarea. Las imágenes se aumentan al estilo pi0.5 (recorte y rotación de la cámara de cabeza, jitter de color) y los episodios se rellenan al final. Las acciones se normalizan por paso de predicción usando percentiles 0,1 %/99,9 % con estadísticas combinadas de las 6 tareas. El régimen de entrenamiento fue de 30 000 pasos con batch global de 128 (2 GPU × 8 por GPU × acumulación de gradiente 8), warmup de 1000 pasos y aprendizaje constante de 5e-5 posterior. No hay indicios de RLHF/DPO (no aplicable a un modelo de política robótica de este tipo).

## Capacidades

- Generacion de políticas de manipulación bimanual: predice chunks de 50 pasos de acción relativos a la pose actual para dos brazos con pinzas.
- Seguimiento de instrucciones en lenguaje natural: ejecuta 6 tareas concretas a partir de prompts en inglés fijados de antemano (por ejemplo, "place the block into the cup with the left arm, then place the cup onto the plate with the right arm").
- Multi-tarea: un único checkpoint cubre 6 tareas duales (colocación de bloque en taza, intercambio entre estantes, apilado de tazas, apertura de cajón, colocación de cepillo de dientes, guardado de frutas en caja).
- Inferencia en tiempo real: unos 55 ms por paso de inferencia en la GPU de la máquina de entrenamiento según el autor.
- No es un modelo de texto general: no genera texto, no resuelve matemáticas ni código, y no ofrece tool calling ni capacidades de agente LLM.

## Casos de uso

- Investigación en manipulación bimanual: sirve como baseline de cabecera ACT para comparar frente a la cabecera ActionMap en el mismo robot Rokae y con los mismos datos, gracias a que ambos repositorios comparten todo salvo la cabecera.
- Evaluación controlada en robot real: el paquete de despliegue incluido (`deploy/`) permite ejecutar pruebas autónomas con scripts verificados (`00_check_environment.sh`, `05_offline_tests.sh`, `01_start_model_server.sh`, `11_run_policy_autonomous_ensemble_hybrid_smooth.sh`).
- Tareas de mesa de laboratorio multi-paso: apertura de cajón, inserción de objetos y apilado, útiles para estudiar planificación secuencial bimanual (secuencias del tipo "primero con el brazo izquierdo, luego con el derecho").
- Benchmarking de arquitecturas de acción: comparación de regresión directa (ACT, L1 enmascarada) frente a clasificación voxelizada (ActionMap) bajo idénticos datos, aumentación y régimen de entrenamiento.
- Prototipado de estaciones de trabajo robóticas de doble brazo: con ~3 GB de VRAM y 55 ms por inferencia, es viable ejecutar la política en una GPU de consumo junto al controlador del robot.
- Docencia y demostración de VLAs: el repositorio incluye código de entrenamiento (`train_1019.sh` con `HEAD_TYPE=act`), estadísticas de normalización y prompts, lo que lo hace reproducible para prácticas de robótica aprendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) ni tasas de éxito en robot real en la información disponible. Los únicos datos de rendimiento son los autoverificados por el autor en la máquina de entrenamiento:

| Metrica | Valor |
|---|---|
| Desviacion en el paso 0 | 1–3 mm |
| Latencia de inferencia (GPU de entrenamiento) | ~55 ms por paso |
| Verificacion de carga | estricta, salidas finitas para los 6 prompts |
| Pruebas en robot real | pendientes (el autor indica "aun no probado en robot real") |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3 GB segun la model card.
- GPU recomendadas: no se especifica un modelo concreto; por consumo y latencia declarados, cualquier GPU moderna con ~4 GB de VRAM deberia bastar (por ejemplo, una RTX 3060 o superior). No hay datos para A100/H100.
- Cabe con holgura en GPUs de consumo: si, el requisito de ~3 GB es accesible incluso para portatiles con GPU dedicada.
- Despliegue: el repositorio incluye su propio paquete de despliegue con scripts de shell para robot real (`deploy/README.md`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). El entrenamiento se realizo en 2 GPU con batch 8 por GPU y acumulacion de gradiente 8.
- Latencia: ~55 ms por paso de inferencia en la GPU de entrenamiento; throughput en robot no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Cabecera de accion | Datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Noctis12138/turbovla-rokae-6task-act (este) | VLA bimanual, 6 tareas | ACT (regresion L1 enmascarada, chunk de 50 pasos) | 6×301 episodios Rokae | other (DINOv3 License) | Publico en Hugging Face |
| Noctis12138/turbovla-rokae-6task | VLA bimanual, 6 tareas | ActionMap (clasificacion de mapas de calor voxelizados) | Identicos | other | Publico en Hugging Face |
| TurboVLA (oficial) | VLA general para manipulacion | ACT | no disponible | no disponible | no disponible |

La comparacion mas relevante es interna: ambas variantes de Rokae comparten datos, backbone, normalizacion y despliegue, de modo que las diferencias de exito en robot real seran atribuibles a la cabecera de accion. No hay datos publicados de rendimiento relativo entre ambas.

## Limitaciones y advertencias

- Sin validacion en robot real: el autor indica explicitamente que el modelo "aun no ha sido probado en robot real"; los unicos resultados son autoverificaciones en la maquina de entrenamiento.
- Dominio muy estrecho: el modelo solo esta entrenado para 6 tareas concretas con prompts fijos; cualquier variacion de escena, objetos o instrucciones esta fuera de distribucion. Los prompts deben coincidir literalmente con `deploy/task_prompts.json`.
- Riesgo de fallo fisico: al ser una politica de control de robot bimanual, errores de prediccion pueden causar colisiones o caidas de objetos; se recomienda grabar video de las tres camaras (cabeza y ambas munecas) y supervisar siempre las pruebas.
- Estadisticas de normalizacion compartidas: usa `checkpoints/stats.json` combinado de 6 tareas; no es valido para tareas nuevas sin reentrenar o recalcular estadisticas.
- Licencia compuesta: la licencia general es "other"; el backbone DINOv3 esta sujeto a la DINOv3 License (con posibles restricciones de uso comercial), BERT es Apache-2.0 y hay licencias de terceros en `code/third_party/licenses/`. Conviene revisar la DINOv3 License antes de cualquier despliegue comercial.
- Los datos de entrenamiento no se incluyen en el repositorio, lo que limita la reproducibilidad completa del entrenamiento.
- Sin benchmarks estandarizados ni tasas de exito publicadas; no es posible comparar objetivamente con otros VLAs a partir de la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Noctis12138/turbovla-rokae-6task-act
- Variante ActionMap (comparacion directa): https://huggingface.co/Noctis12138/turbovla-rokae-6task
- Licencia DINOv3 (incluida en el repo): `code/assets/dinov3-vitl16-pretrain-lvd1689m/LICENSE.md`
- Paper oficial de TurboVLA: no disponible (no se referencia en la model card)
- Demo online: no disponible
