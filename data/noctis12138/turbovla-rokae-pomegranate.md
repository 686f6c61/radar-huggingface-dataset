# Noctis12138/turbovla-rokae-pomegranate

## Resumen

TurboVLA Rokae v3 `pomegranate_orange_to_purple_box` es un modelo de política visomotora (VLA, Vision-Language-Action) para control robótico bimanual, desarrollado por el usuario Noctis12138. Está especializado en una única tarea de manipulación real: introducir una naranja y una granada en una caja morada con un sistema de dos brazos Rokae AR5 equipados con pinzas paralelas. El modelo se distribuye como checkpoint de inferencia de aproximadamente 1,8 GB junto con un paquete de despliegue para ejecución en robot real.

La arquitectura combina un backbone visual DINOv3-L (ViT-L/16) afinado, un codificador de lenguaje BERT congelado y una cabeza de acción denominada ActionMap que predice chunks de 50 pasos de acciones relativas a la pose actual medida. El entrenamiento se realizó sobre solo 50 demostraciones de la tarea, extraídas del conjunto `rokae_bimanual_6task`, con un régimen de 10.000 pasos y batch global de 64.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un pipeline VLA completo (entrenamiento, empaquetado de despliegue, servicio de política y scripts de ejecución autónoma) para robótica bimanual real. No es un modelo de propósito general ni un modelo de lenguaje: es un artefacto de investigación orientado a pruebas en banco físico, y el propio autor indica que todavía no se ha validado en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA con backbone visual DINOv3-L (ViT-L/16) + codificador de texto BERT congelado + cabeza de acción ActionMap |
| Parametros totales | no disponible (checkpoint de inferencia de ~1,8 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (instrucción de tarea de frase única) |
| Tipos de cuantizacion | no disponible (checkpoint en `.pth` de precisión completa; sin variantes GGUF/cuanto publicadas) |
| Idiomas soportados | no disponible (prompt de tarea en inglés, texto fijo) |
| Licencia | other (DINOv3 License para el backbone visual; BERT Apache-2.0; terceros en `code/third_party/licenses/`) |
| Formato de pesos | PyTorch `.pth` (`checkpoints/turbovla_step_10000.pth`) + `stats.json` de normalización |

## Arquitectura y entrenamiento

El modelo sigue un esquema VLA clásico de tres componentes: percepción visual mediante DINOv3-L afinado (con config y tokenizer en `code/assets/`, pesos dentro del checkpoint), comprensión de la instrucción mediante BERT congelado, y generación de acciones mediante una cabeza ActionMap que emite chunks de 50 pasos. Las acciones se expresan como desplazamientos relativos a la pose medida actual y se normalizan por paso de predicción usando los percentiles 0,1 % y 99,9 % calculados exclusivamente sobre las estadísticas de esta tarea (`stats.json`). El sistema opera con tres cámaras (cabeza y dos muñecas) y pinzas paralelas sobre dos brazos Rokae AR5.

El entrenamiento usó las 50 demostraciones de la tarea `pomegranate_orange_to_purple_box` del dataset `rokae_bimanual_6task`, con aumento de imagen al estilo pi0.5 (recorte y rotación de la cámara de cabeza, color jitter) y relleno al final de los episodios. Se ejecutaron 10.000 pasos con batch global 64 (2 GPU × 4 por GPU × acumulación de gradiente 8), warmup de 300 pasos y tasa de aprendizaje constante de 5e-5, con BERT congelado e inicialización de GroundingDINO. El autor reporta una verificación de ajuste sobre 32 ventanas aleatorias del propio conjunto de entrenamiento: error medio de posición de 2,5 mm en el chunk de 50 pasos y coincidencia de apertura/cierre de pinza del 99,6 % respecto a las demostraciones.

## Capacidades

- Ejecución de una única tarea de manipulación bimanual: introducir una naranja y una granada en una caja morada, con prompt fijo `put the orange and the pomegranate into the purple box`.
- Predicción de trayectorias de acción en chunks de 50 pasos relativos a la pose actual, con control de pinza paralela.
- Fusión de percepción multimodal: tres flujos de vídeo (cámara de cabeza y dos muñecas) más estado articular medido.
- Servicio de política desplegable mediante scripts (`01_start_model_server.sh`, `04_verify_policy_service.sh`) y ejecución autónoma con lógica híbrida suavizada.
- Mecanismo de confirmación de pinza configurable (`GRIPPER_CONFIRM_STEPS`, `GRIPPER_COMMIT_WITHIN`, `GRIPPER_COMMIT_HOLD`, `GRIPPER_COMMIT_LATCH`).
- No soporta tool calling, function calling, razonamiento multi-paso genérico, visión general, audio ni diálogo multilingüe; no es un modelo conversacional.

## Casos de uso

- Pruebas de banco en robot real: el paquete `deploy/` permite lanzar la política sobre los brazos Rokae AR5 con un protocolo reproducible (al menos 10 ejecuciones, escena y cámaras fijas) para comparar la variante de tarea única frente al modelo de 6 tareas del 27 de octubre.
- Referencia metodológica para pipelines VLA: el repositorio incluye código de entrenamiento (`train_1019.sh`), scripts de despliegue y utilidades de verificación, lo que lo hace útil como plantilla para montar un flujo completo de entrenamiento a inferencia en robótica.
- Evaluación de normalización por paso de predicción: el uso de `stats.json` con percentiles por horizonte sirve como ejemplo práctico de cómo estabilizar la regresión de chunks largos con pocos datos.
- Estudio de ajuste fino con dataset reducido: con solo 50 demostraciones, es un caso de referencia para analizar sobreajuste, sensibilidad a la posición de cámaras y transferencia entre tareas.
- Comparación de cabezas de acción: al compartir receta con `turbovla-rokae-toothbrush`, permite aislar el efecto del cambio de tarea manteniendo arquitectura, hiperparámetros y esquema de aumento.
- Integración en un servicio de política: el servidor de modelo y el script de verificación permiten probar la latencia y la robustez de un endpoint de inferencia antes de escalar a otras tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta una comprobación de ajuste al conjunto de entrenamiento (no una evaluación de éxito en robot):

| Metrica | Valor | Contexto |
|---|---|---|
| Error medio de posición (chunk de 50 pasos) | 2,5 mm | 32 ventanas aleatorias del conjunto de entrenamiento |
| Coincidencia de apertura/cierre de pinza | 99,6 % | Misma prueba, comparada con demostraciones |
| Referencia: `turbovla-rokae-toothbrush` (10.000 pasos) | 3,8 mm / 99,8 % | Misma metodología de autocomprobación |
| Tasa de éxito en robot real | no disponible | El autor indica explícitamente que aún no se ha probado en robot |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB según la model card (entorno Python ≥ 3.10, `transformers>=4.56` por soporte de DINOv3).
- GPU recomendadas: no disponibles de forma explícita; por el tamaño del checkpoint y la VRAM indicada, cabe en GPU de consumo con al menos 4-6 GB de memoria.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores; no confirmado por el autor para modelos concretos.
- Opciones de despliegue: servidor de política propio incluido en `deploy/` (`01_start_model_server.sh`), verificación con `04_verify_policy_service.sh` y ejecución con `11_run_policy_autonomous_ensemble_hybrid_smooth.sh`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TurboVLA Rokae v3 (este) | VLA bimanual, DINOv3-L + BERT + ActionMap | no disponible (~1,8 GB checkpoint) | no disponible | 1 tarea (naranja + granada en caja morada) | other (DINOv3 License) | HuggingFace, repo de 1,8 GB |
| `Noctis12138/turbovla-rokae-toothbrush` | VLA bimanual, misma receta | no disponible | no disponible | 1 tarea (cepillo de dientes) | other | HuggingFace |
| `Noctis12138/turbovla-rokae-6task` | VLA bimanual, misma receta | no disponible | no disponible | 6 tareas | other | HuggingFace |

No se dispone de datos comparativos de rendimiento entre estas variantes; la única diferencia documentada es la tarea y el número de demostraciones, manteniendo idéntica arquitectura y receta de entrenamiento.

## Limitaciones y advertencias

- Modelo de tarea única: solo ejecuta la instrucción exacta `put the orange and the pomegranate into the purple box`; cualquier variación del prompt o de la escena puede degradar el comportamiento.
- Sin validación en robot real: el autor indica explícitamente que aún no se ha probado en hardware físico; el error de 2,5 mm es una medida de ajuste al conjunto de entrenamiento, no una tasa de éxito.
- Entrenado con solo 50 demostraciones, lo que implica alto riesgo de sobreajuste y baja generalización a cambios de iluminación, posición de objetos, cámaras o configuración del banco.
- Sensibilidad a la configuración: el protocolo exige mantener escena y cámaras idénticas a la prueba del 27 de octubre y fijar parámetros concretos de confirmación de pinza para que los resultados sean comparables.
- Licencia restrictiva: el backbone visual está sujeto a la DINOv3 License, que puede limitar el uso comercial; el conjunto de datos de entrenamiento no se distribuye con el repositorio.
- Sin datos de sesgos, alucinación o cobertura multilingüe: no aplican en el sentido habitual de un LLM, pero tampoco hay evaluación de robustez frente a perturbaciones.
- Dependencia de versiones específicas: requiere `transformers>=4.56` por el soporte de DINOv3; versiones anteriores pueden impedir la carga del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Noctis12138/turbovla-rokae-pomegranate
- Variante de cepillo de dientes: https://huggingface.co/Noctis12138/turbovla-rokae-toothbrush
- Variante de 6 tareas: https://huggingface.co/Noctis12138/turbovla-rokae-6task
- Paquete de despliegue: `deploy/README.md` dentro del repositorio del modelo
- Código de entrenamiento: `code/train_1019.sh` dentro del repositorio del modelo
- Licencia del backbone visual: `code/assets/dinov3-vitl16-pretrain-lvd1689m/LICENSE.md` dentro del repositorio del modelo
- Licencias de terceros: `code/third_party/licenses/` dentro del repositorio del modelo
