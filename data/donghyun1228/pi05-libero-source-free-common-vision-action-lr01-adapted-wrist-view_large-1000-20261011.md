# Donghyun1228/pi05-libero-source-free-common-vision-action-lr01-adapted-wrist-view_large-1000-20261011

# pi05-libero-source-free-common-vision-action-lr01-adapted-wrist-view_large-1000-20261011

## Resumen

Se trata de un checkpoint de investigación publicado por el usuario Donghyun1228 sobre la familia de modelos vision-language-action (VLA) π₀.₅, desarrollada originalmente por Physical Intelligence y distribuida en código abierto a través de la librería openpi. El modelo está especializado en el benchmark robótico LIBERO y corresponde a un experimento de adaptación de la vista de muñeca ("wrist view") mediante una intervención de solo inferencia: no se ha reentrenado la política, sino que se ha sustituido un subconjunto de tensores por la codificación adaptada de la cámara principal.

El checkpoint parte de un modelo LoRA 0.1 previamente completado ("raw1000") y declara que sus 61 tensores nativos son byte-idénticos al despliegue original "source-wrist". Únicamente se reemplazan 23 tensores de la rama de muñeca por el codificador base adaptado, convertido al dtype histórico wrist en BF16. El modelo completo consta de 84 tensores hoja y emplea el código de inferencia BF16 fijado en el commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`, con la configuración `pi05_libero_source_free_split_vision_action_lora_idm` y normalización sin cambios.

La relevancia de esta publicación es metodológica y descriptiva: reporta una evaluación exploratoria de 400 episodios con semilla 17 (10 ensayos por tarea) que obtiene 241/400 (60,25 %), frente a una referencia no emparejada de 268/400 para el despliegue original. El propio autor advierte de que la comparación no es causal ni emparejada, que el ruido de muestreo no fue sembrado y que esta publicación, por sí sola, no establece ninguna nueva tasa de éxito de política.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π₀.₅, de tipo flow-matching; backbone vision-lenguaje tipo PaliGemma según las referencias de la búsqueda |
| Parametros totales | no disponible (checkpoint LoRA con 84 tensores hoja: 61 nativos + 23 de muñeca) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | inferencia en BF16 (dtype histórico de la rama de muñeca); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (el modelo consume instrucciones de tarea como prompt, pero no se especifican idiomas) |
| Licencia | no disponible |
| Formato de pesos | no especificado explícitamente; repositorio de 6,9 GB gestionado con la librería openpi |
| Tamano del repositorio | 6,9 GB |
| Configuracion | `pi05_libero_source_free_split_vision_action_lora_idm` |
| Revision de pesos | `76372b23d205b26f15a4cee5ed8e740a6206230b` |
| Commit de inferencia BF16 | `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08` |
| Entorno de simulacion | MuJoCo 3.2.3 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia π₀.₅, una evolución del π₀ de Physical Intelligence descrita como un VLA basado en flujo (flow-based) con mejor generalización en entornos abiertos que su predecesor. La rama de percepción combina tokens de imagen y de prompt contextualizados por un backbone vision-lenguaje tipo PaliGemma, mientras que la generación de acciones se resuelve mediante un experto de acción. Dentro de la familia openpi también existe π₀-FAST, una variante autorregresiva basada en el tokenizador de acciones FAST, pero este checkpoint concreto se apoya en la ruta π₀.₅ con la configuración de inferencia indicada.

En cuanto al entrenamiento, este checkpoint no introduce entrenamiento adicional: es una intervención de solo inferencia sobre un modelo LoRA 0.1 ya completado. El autor indica que los 61 tensores nativos son byte-idénticos al despliegue "source-wrist" original y que solo se sustituyen los 23 tensores de la rama de muñeca por el codificador base adaptado, casteado a BF16. No se emplean observaciones de origen ni retroalimentación de éxito de tarea para la adaptación, y la normalización permanece inalterada. La adaptación descansa, por tanto, en la reutilización del codificador de la cámara principal combinada con un ajuste previo tipo LoRA sobre datos de LIBERO.

## Capacidades

- Generacion de acciones roboticas condicionadas por observaciones visuales (camara principal y de muñeca) y por un prompt de tarea, dentro del paradigma VLA.
- Control de politicas para manipulacion en el benchmark LIBERO, con suites evaluadas de tipo Spatial, Object, Goal y Long.
- Inferencia determinista en BF16 siguiendo el código de referencia openpi, con normalizacion conservada del checkpoint original.
- Adaptacion de vista de muñeca ("wrist view") reutilizando el codificador de la camara principal, sin reentrenamiento de la politica completa.
- Integracion con el entorno de simulacion MuJoCo 3.2.3 para la ejecucion de rollouts.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision general, audio ni modo "thinking"; el alcance declarado es exclusivamente el control roboticos.

## Casos de uso

- Investigacion en adaptacion de vistas para politicas VLA: permite estudiar si sustituir la codificacion de la camara de muñeca por la de la camara principal degrada o mantiene la tasa de exito, con una referencia medible de 241/400 frente a 268/400.
- Reproduccion de evaluaciones LIBERO: sirve como punto de partida para replicar los 400 episodios con semilla 17 y comparar contra el despliegue source-wrist en condiciones controladas.
- Analisis de robustez entre camaras: al aislar 23 tensores de la rama de muñeca, es util para estudiar la sensibilidad de la politica a la fuente visual empleada.
- Linea base para futuras intervenciones LoRA: dado que el modelo conserva la normalizacion y 61 tensores nativos intactos, resulta adecuado como base para experimentos de adaptacion posteriores con cambios minimos.
- Estudio de transferencia entre benchmarks y tareas: la desagregacion por suites (61/100 Spatial, 77/100 Object, 60/100 Goal, 43/100 Long) permite caracterizar en que tipo de tarea la adaptacion penaliza mas.
- Validacion de pipelines openpi: el uso de una configuracion y un commit de inferencia concretos lo convierte en un caso de prueba para verificar la reproducibilidad del entorno openpi con MuJoCo 3.2.3.

## Benchmarks y rendimiento

Resultados declarados por el autor en LIBERO (semilla 17, diez ensayos por tarea, 400 episodios, inferencia BF16 sin parada temprana por umbral y sin errores de rollout):

| Suite | Exito | Total |
|---|---:|---:|
| Spatial | 61 | 100 |
| Object | 77 | 100 |
| Goal | 60 | 100 |
| Long | 43 | 100 |
| **Total** | **241** | **400** |

Tasa global: 241/400 = 60,25 %. Referencia descrita como "source-wrist": 268/400. Diferencia observada: -6,75 puntos porcentuales. El autor subraya que se trata de una comparacion descriptiva no emparejada (ruido de muestreo sin semilla) y no de una estimacion causal ni de una confirmacion de retencion a 2000 episodios. No se aportan otros benchmarks (MMLU, HumanEval, GSM8K, etc.), que no aplican a un modelo de control roboticos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 6,9 GB y la inferencia se realiza en BF16, por lo que el peso en memoria del checkpoint es del orden de varios gigabytes; la cifra exacta no esta confirmada.
- GPU recomendadas: no especificadas por el autor. Las referencias de la busqueda mencionan el uso de 8x H100 para el fine-tuning del modelo base pi05_libero, pero no para este checkpoint de solo inferencia.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: codigo de inferencia openpi fijado en el commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Entorno de ejecucion: MuJoCo 3.2.3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (adapted-wrist view_large) | no disponible (84 tensores hoja) | no disponible | 241/400 (60,25 %) | no disponible | HuggingFace (autor Donghyun1228) |
| pi05-libero-dense-contact-d2-wrist-kd-yaw10-20261003 | no disponible | no disponible | no disponible | no disponible | HuggingFace (mismo autor) |
| lerobot/pi05_libero_base | no disponible | no disponible | no disponible | no disponible | HuggingFace (organizacion lerobot) |
| pi05_libero_finetuned | no disponible | no disponible | no disponible | no disponible | Disponible (fine-tuning de 6k pasos en 8x H100) |

La comparacion cuantitativa entre estos modelos no puede establecerse con los datos disponibles, ya que solo este checkpoint publica resultados de LIBERO en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no aplica al uso declarado como politica de control; el modelo genera acciones, no texto libre.
- Comparacion no concluyente: el propio autor advierte de que la diferencia de -6,75 puntos porcentuales frente a source-wrist procede de politicas ejecutadas por separado con ruido de muestreo sin semilla, por lo que es una referencia descriptiva no emparejada y no una estimacion causal.
- Ausencia de feedback de tarea: la adaptacion no uso observaciones de origen ni retroalimentacion de exito, lo que limita la garantia de mejora.
- Ambito restringido: la publicacion "por si sola no establece ninguna nueva tasa de exito de politica".
- Licencia no disponible: no se puede confirmar la permisividad de uso comercial; se debe contactar con el autor antes de cualquier uso en produccion.
- Dependencia de versiones: requiere mantener MuJoCo 3.2.3 y la configuracion `pi05_libero_source_free_split_vision_action_lora_idm` con el commit de inferencia indicado para reproducir los resultados.
- Idiomas y contexto: no se especifican idiomas soportados ni longitud de contexto, lo que dificulta evaluar su comportamiento fuera de las tareas de LIBERO.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-source-free-common-vision-action-lr01-adapted-wrist-view_large-1000-20261011
- Modelo relacionado (dense-contact-d2-wrist-kd-yaw10): https://huggingface.co/Donghyun1228/pi05-libero-dense-contact-d2-wrist-kd-yaw10-20261003
- Modelo base de la organizacion LeRobot: https://huggingface.co/lerobot/pi05_libero_base
- Conjunto de caracteristicas de profesor wrist-camera (pi0.5 pre-adapt): https://claru.ai/datasets/donghyun1228-libero-wrist-teacher-cache-20261004
- Repositorio openpi (referencia de comunidad): https://github.com/xiaolanliu/pi05_base
- Ficha de pi05_libero_finetuned: https://model.aibase.com/models/details/1983331275196600320
