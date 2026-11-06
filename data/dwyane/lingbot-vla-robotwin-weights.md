# Dwyane/lingbot-vla-robotwin-weights

## Resumen

LingBot-VLA 2.0 (6B) es un modelo de visión-lenguaje-acción (VLA) orientado a manipulación robótica, desarrollado por el equipo IamNaiLong. Este repositorio concreto (`Dwyane/lingbot-vla-robotwin-weights`) contiene los pesos resultantes de un ajuste fino mediante LoRA sobre el modelo base `robbyant/lingbot-vla-v2-6b`, con el objetivo de resolver tareas del benchmark RoboTwin 2.0 sobre la plataforma Aloha-AgileX.

El modelo parte de una arquitectura de 6.000 millones de parámetros y se especializa en la generación de acciones motoras de 55 dimensiones (pares de articulaciones de brazo, poses de efector final y pinzas) a partir de observaciones visuales e instrucciones. El ajuste LoRA se aplica exclusivamente sobre el `action_expert`, lo que permite adaptar el comportamiento motor sin reentrenar el backbone completo.

Su relevancia radica en que demuestra un flujo de trabajo reproducible de especialización de un VLA genérico a un entorno robótico concreto con un coste computacional reducido (1.500 pasos de entrenamiento sobre un modelo ya preentrenado durante 6.000 pasos), y publica métricas de éxito tanto en tareas vistas (62,8%) como no vistas (37,0%) bajo el benchmark RoboTwin 2.0. La información disponible sobre licencia, idiomas y arquitectura interna es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); backbone transformer con módulo `action_expert` (detalles internos no disponibles) |
| Parametros totales | 6B (modelo base `robbyant/lingbot-vla-v2-6b`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor menciona evaluación en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (3 shards: 2,0 GB + 5,0 GB + 4,6 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre LingBot-VLA 2.0 (6B), un VLA que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras. La adaptación se realiza mediante LoRA con rango 64 y alpha 128, aplicada al ámbito `action_expert` y dirigida a las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj`. Se entrena durante 1.500 pasos partiendo de un checkpoint base ya entrenado 6.000 pasos, y posteriormente los pesos LoRA se fusionan (merge) en el modelo base para exportar un checkpoint único.

Los datos de entrenamiento provienen exclusivamente de RoboTwin 2.0, concretamente 50 tareas "clean" de la plataforma Aloha-AgileX con 50 episodios por tarea. No se emplearon datos aleatorizados ni fuentes externas. El espacio de acciones es una representación unificada de 55 dimensiones que incluye 14 articulaciones de brazo, 14 poses de efector final y 2 pinzas, entre otros componentes. No se documentan detalles sobre la composición del dataset del modelo base, el uso de RLHF/DPO ni innovaciones de decodificación.

## Capacidades

- Generación de acciones motoras de 55 dimensiones para manipulación bimanual en Aloha-AgileX.
- Ejecución de tareas de manipulación guiadas por instrucciones en lenguaje natural (implícito en el paradigma VLA).
- Percepción visual del entorno para planificación de acciones (propio de la arquitectura VLA).
- Generalización limitada a variaciones de entorno: 37,0% de éxito en tareas no vistas (clean2random).
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso.
- No se documentan capacidades multilingües ni modos especiales (thinking, audio, etc.).
- No se documenta capacidad de razonamiento general, código o matemáticas.

## Casos de uso

- Manipulación robótica bimanual en laboratorio: el modelo genera las 55 dimensiones de acción para las dos extremidades de Aloha-AgileX, lo que permite abordar tareas de ensamblaje y pick-and-place en entornos controlados.
- Investigación en aprendizaje por imitación: sirve como punto de partida para reproducir el pipeline LoRA descrito (rank 64, alpha 128, scope `action_expert`) sobre nuevos conjuntos de tareas.
- Evaluación comparativa de planificadores: el autor reporta diferencias de éxito entre cuRobo v0.7.8 y el fallback MPLib, por lo que el checkpoint es útil para estudiar la sensibilidad del rendimiento al planificador de movimiento.
- Benchmarking de VLA en RoboTwin 2.0: permite medir la brecha entre tareas vistas (62,8%) y no vistas (37,0%) como referencia para futuras adaptaciones.
- Prototipado de políticas de control en simulación: con 50 tareas limpias y 50 episodios por tarea, el modelo es adecuado para validar recetas de ajuste fino antes de transferir a hardware real.
- Estudio de generalización dominio a dominio: la métrica clean2random cuantifica la degradación al introducir aleatorización, útil para diseñar estrategias de aumento de datos.

## Benchmarks y rendimiento

Evaluación con planificador cuRobo v0.7.8, `use_length=25`, precisión bf16, 10 episodios por tarea.

| Setting | Tareas | Éxito | Tasa de éxito |
|---|---:|---:|---:|
| clean2clean (vistas) | 50 / 50 | 314 / 500 | 62,8% |
| clean2random (no vistas) | 50 / 50 | 185 / 500 | 37,0% |

El autor advierte que, si la reproducción oficial emplea el fallback MPLib por defecto de la imagen de la plataforma, la tasa absoluta de éxito será inferior; la comparación debe hacerse con el mismo planificador.

## Requisitos de hardware

- El checkpoint completo ocupa aproximadamente 11,6 GB en safetensors (2,0 + 5,0 + 4,6 GB), lo que corresponde a un modelo de 6B en bf16/fp16.
- VRAM estimada para inferencia en bf16: en torno a 12-14 GB solo para pesos, más memoria para activaciones y buffers visuales; no se dispone de cifras oficiales.
- GPU recomendadas: no disponible en la documentación; por tamaño, una GPU con 16-24 GB (RTX 4090, A10, L4) podría alojar los pesos, y A100/H100 para evaluación a mayor lote.
- Cabe en GPU de consumo con 24 GB (RTX 3090/4090) en bf16; en cuantizaciones de 8 o 4 bits no se documentan formatos publicados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repositorio incluye `lingbotvla_cli.yaml` y ficheros de tokenizer/preprocessor, lo que sugiere un CLI propio del proyecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingBot-VLA 2.0 LoRA (este repo) | 6B | no disponible | 62,8% clean2clean / 37,0% clean2random en RoboTwin 2.0 | no disponible | Hugging Face (0 descargas) |
| robbyant/lingbot-vla-v2-6b (base) | 6B | no disponible | no disponible | no disponible | Hugging Face |
| Otros VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni evidencia de uso independiente.
- Licencia no especificada: no se puede confirmar el uso comercial; debe consultarse la licencia del modelo base `robbyant/lingbot-vla-v2-6b`.
- Entrenado solo con 50 tareas clean de RoboTwin 2.0 y sin datos aleatorizados: la generalización a entornos no vistos cae al 37,0%.
- Dependencia fuerte del planificador de movimiento (cuRobo vs MPLib), lo que dificulta comparaciones directas con otros resultados.
- No se documentan sesgos, idiomas soportados ni comportamiento fuera del dominio robótico.
- Riesgo de sobreajuste a la morfología Aloha-AgileX y al espacio de acciones de 55 dimensiones; no es portable a otras plataformas sin reentrenamiento.
- El espacio de acciones y la evaluación están ligados a simulación; no hay evidencia de transferencia a hardware real.
- La model card está en chino y no incluye información sobre datos de preentrenamiento del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Dwyane/lingbot-vla-robotwin-weights
- Modelo base: https://huggingface.co/robbyant/lingbot-vla-v2-6b
- Código y materiales de evaluación: https://github.com/wuuwuu26/iamNailong-lingbot-vla
- Mirror de descarga: https://hf-mirror.com
