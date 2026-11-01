# Noctis12138/turbovla-rokae-cross-layer

## Resumen
TurboVLA Rokae v3 es un modelo de política visuomotora (VLA, vision-language-action) para control robótico bimanual, publicado por el usuario Noctis12138 en HuggingFace. Está diseñado para operar un sistema de dos brazos Rokae AR5 con pinzas paralelas y un cabezal de acciones denominado ActionMap. La variante `dual_arm_cross_layer_swap` es una política de tarea única entrenada exclusivamente con 50 demostraciones de una tarea concreta: colocar un bloque rojo en la balda superior con la mano izquierda y un bloque naranja en la balda inferior con la derecha.

El modelo sigue la misma receta que la variante `turbovla-rokae-toothbrush` del mismo autor, cambiando únicamente la tarea. Combina un backbone visual DINOv3-L (ViT-L/16) con un codificador de texto BERT y un cabezal de predicción de acciones que emite chunks de 50 pasos relativos a la pose medida actual. El checkpoint de inferencia ocupa aproximadamente 1,8 GB y el autor indica un consumo de unos 3 GB de VRAM.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación para pruebas en robot real, no de un modelo de propósito general. El propio autor advierte que no se ha probado todavía en el robot físico y que la única validación disponible es un ajuste sobre el conjunto de entrenamiento (error medio de posición de 2,7 mm en chunks de 50 pasos).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action): backbone visual DINOv3-L (ViT-L/16) + codificador de texto BERT + cabezal de acciones ActionMap |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint en `float`/`pth`, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (el prompt de tarea está en inglés y debe reproducirse literalmente) |
| Licencia | other (sujeta a DINOv3 License para el backbone visual; BERT bajo Apache-2.0; terceros en `code/third_party/licenses/`) |
| Formato de pesos | `.pth` (PyTorch), checkpoint `checkpoints/turbovla_step_10000.pth` (~1,8 GB) |

## Arquitectura y entrenamiento
La arquitectura es un VLA compuesto por un backbone visual DINOv3-L inicializado desde `dinov3-vitl16-pretrain-lvd1689m`, un codificador de texto BERT (congelado durante el entrenamiento) y un cabezal de acciones ActionMap que predice chunks de 50 pasos relativos a la pose medida actual. La variante se denomina `dual_arm_cross_layer_swap`, lo que sugiere un mecanismo de intercambio entre capas para las dos extremidades, aunque la model card no detalla su implementación interna.

El entrenamiento usa 50 demostraciones de la tarea `dual_arm_cross_layer_swap` extraídas del dataset `rokae_bimanual_6task`. Se aplica aumento de imagen al estilo pi0.5 (recorte y rotación de la cámara de cabeza, color jitter) y relleno al final de los episodios. Las acciones se normalizan por paso de predicción con percentiles 0,1 %/99,9 % calculados solo con las estadísticas de esta tarea. La configuración es: batch global 64 (2 GPU × 4 por GPU × acumulación de gradiente 8), 10.000 pasos, warmup de 300 pasos y learning rate constante de 5e-5. El backbone BERT permanece congelado y el visual se inicializa desde GroundingDINO según la model card. El autor no documenta uso de RLHF ni DPO.

## Capacidades
- Control visuomotor bimanual: genera comandos de acción para dos brazos Rokae AR5 con pinzas paralelas a partir de tres cámaras (cabeza y dos muñecas).
- Predicción de chunks de acción de 50 pasos relativos a la pose actual medida.
- Ejecución de una única tarea condicionada por prompt: colocar el bloque rojo en la balda superior con la mano izquierda y el naranja en la inferior con la derecha.
- Seguimiento de instrucción en lenguaje natural, aunque el prompt debe coincidir literalmente con el de entrenamiento (`deploy/task_prompts.json`).
- Control de apertura y cierre de pinza con lógica de confirmación configurable (`GRIPPER_CONFIRM_STEPS`, `GRIPPER_COMMIT_WITHIN`, `GRIPPER_COMMIT_HOLD`, `GRIPPER_COMMIT_LATCH`).
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico, matemáticas, visión general, audio ni modo thinking.

## Casos de uso
- Pruebas de manipulación bimanual en laboratorio: el modelo sirve para validar la pila de despliegue completa (servidor de política, servicio de verificación, ejecución autónoma) sobre un par de brazos Rokae AR5 antes de escalar a políticas multi-tarea.
- Recolección de datos comparativos: al compartir receta con la variante de 6 tareas, permite aislar el efecto de pasar de política multi-tarea a política de tarea única manteniendo escena, cámaras y configuración de ejecución.
- Evaluación de protocolos de confirmación de pinza: los parámetros de commit y latch permiten estudiar cómo afecta la histéresis de agarre a la tasa de éxito en una tarea de colocación en dos alturas.
- Referencia de integración para ActionMap: el paquete `deploy/` y `code/` documentan cómo cargar el checkpoint, normalizar acciones por paso y servir inferencias, útil para equipos que quieran reutilizar el pipeline con otros checkpoints.
- Reproducción de recetas VLA con backbone DINOv3: el script `train_1019.sh` y las estadísticas de normalización permiten reproducir el entrenamiento con 50 demostraciones y dos GPU.
- Diagnóstico de fallos de agarre y colocación: la tarea exige coordinar dos brazos con objetos de distinto color y altura, lo que la hace útil para depurar percepción, calibración de cámaras y sincronización entre brazos.
- Validación de infraestructura de registro de episodios: el flujo exige grabar tres vídeos más CSV, joints CSV y JSON, útil para probar herramientas de captura antes de campañas mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta una autoevaluación sobre el conjunto de entrenamiento:

| Métrica (32 ventanas aleatorias de entrenamiento) | Resultado |
|---|---|
| Error medio de posición en chunk de 50 pasos | 2,7 mm |
| Coincidencia de apertura/cierre de pinza con la demostración | 99,5 % |
| Comparativa interna: variante toothbrush (10k pasos) | 3,8 mm / 99,8 % |
| Tasa de éxito en robot real | no disponible (no se ha probado en el robot físico) |

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 3 GB según la model card.
- GPU recomendadas: no especificadas; con ~3 GB de VRAM cabe en cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante), aunque el autor no confirma modelos concretos.
- Cabe en GPU consumer: sí, según el consumo declarado de ~3 GB.
- Opciones de despliegue: servidor de política propio del paquete `deploy/` (`01_start_model_server.sh`, `04_verify_policy_service.sh`) con PyTorch y `transformers>=4.56`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Entorno: Python ≥ 3.10, torch, transformers ≥ 4.56 (por soporte de DINOv3), numpy, scipy, pillow, torchvision.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TurboVLA Rokae v3 `dual_arm_cross_layer_swap` | VLA bimanual, tarea única | no disponible | no disponible | other (DINOv3 License en backbone) | HuggingFace, 0 descargas |
| `Noctis12138/turbovla-rokae-toothbrush` | VLA bimanual, tarea única | no disponible | no disponible | other | HuggingFace, mismo autor |
| `Noctis12138/turbovla-rokae-6task` | VLA bimanual, 6 tareas | no disponible | no disponible | other | HuggingFace, mismo autor |

No se dispone de datos de benchmarks comparativos entre estas variantes ni frente a otros VLA de robótica (por ejemplo, OpenVLA o pi0), por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias
- Modelo de tarea única: solo ejecuta la tarea `dual_arm_cross_layer_swap`; el prompt debe coincidir literalmente con el de entrenamiento.
- No validado en robot real: el autor indica explícitamente que aún no se ha probado en el robot físico; las métricas reportadas son de ajuste al conjunto de entrenamiento y no estiman la tasa de éxito real.
- Entrenado con solo 50 demostraciones, lo que limita la generalización a variaciones de escena, iluminación o posiciones iniciales.
- Requiere mantener fija la disposición de la escena y las cámaras respecto a la prueba del 10-27 para que los resultados sean comparables.
- Licencia `other`: el backbone DINOv3 impone la DINOv3 License, que puede restringir el uso comercial; es necesario revisar `code/assets/dinov3-vitl16-pretrain-lvd1689m/LICENSE.md` y las licencias de terceros.
- Los datos de entrenamiento no se distribuyen con el repositorio, lo que dificulta la reproducción completa.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un modelo de acción, el riesgo principal es la ejecución de trayectorias incorrectas o agarres fallidos.
- Idiomas: no se documenta soporte multilingüe; el prompt de tarea está en inglés.
- Sin cuantizaciones publicadas ni soporte declarado para motores de inferencia de alto rendimiento (vLLM, TGI), lo que limita el despliegue a gran escala.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Noctis12138/turbovla-rokae-cross-layer
- Variante toothbrush: https://huggingface.co/Noctis12138/turbovla-rokae-toothbrush
- Variante de 6 tareas: https://huggingface.co/Noctis12138/turbovla-rokae-6task
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la búsqueda web disponible.
