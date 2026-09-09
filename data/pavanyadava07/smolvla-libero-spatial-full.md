# pavanyadava07/smolvla-libero-spatial-full

## Resumen

SmolVLA-libero-spatial-full es un modelo de visión-lenguaje-acción (VLA) desarrollado por Pavan Yadav Annappa, que parte del modelo base lerobot/smolvla_base y se ha ajustado finamente (fine-tuning) en el conjunto de datos LIBERO-Spatial, compuesto por 10 tareas y 432 demostraciones de manipulación robótica en un entorno simulado de cocina. El objetivo del modelo es generar secuencias de 10 acciones para un brazo robótico a partir de observaciones visuales y de estado, segun una instruccion en lenguaje natural. Este ajuste fino entrena por completo el action expert y las proyecciones de estado/accion, mientras mantiene congelados el codificador de vision y el modelo de lenguaje vision (VLM), sin usar LoRA. El resultado principal es una tasa de exito del 77,6% (intervalo de confianza al 95% agrupado de 75,4-79,6, n=1500) en LIBERO-Spatial con re-planificacion cada 10 pasos, superando claramente al baseline con LoRA que alcanza 55,5% en las mismas condiciones. El modelo cuenta con 450 millones de parametros, se distribuye en formato PyTorch con licencia MIT y esta pensado para su uso en investigacion y prototipado de politicas roboticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (base: lerobot/smolvla_base); VLM y vision encoder congelados, action expert y proyecciones estado/accion entrenados |
| Parametros totales | 450 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 para VLM y fp32 para parametros entrenados) |
| Idiomas soportados | no disponible (el ejemplo de instruccion esta en ingles) |
| Licencia | MIT |
| Formato de pesos | model.pt (state_dict de PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA, un diseño que combina un modelo de lenguaje y vision (VLM) con un experto de acciones (action expert). En este ajuste fino, el codificador de vision y el VLM permanecen congelados, mientras que el action expert y las proyecciones de estado/accion se entrenan por completo, sin usar LoRA. El entrenamiento se realizo durante 20.000 pasos con un tamaño de lote de 32, en precision bf16, con optimizador AdamW y una tasa de aprendizaje de 0.0001 en ciclo OneCycle, usando semilla 0. El proceso se llevo a cabo en una unica GPU NVIDIA L4, utilizando el pipeline del repositorio vla-lab, que incluye streaming por fragmentos y reanudacion exacta del entrenamiento. El conjunto de datos de entrenamiento es LIBERO-Spatial, que contiene 10 tareas y 432 demostraciones. No se mencionan procesos de RLHF ni DPO; se trata de un ajuste fino por imitacion.

## Capacidades

- Control robotico por imitacion: el modelo predice una secuencia de 10 acciones (n_action_steps=10) a partir de observaciones visuales y un vector de estado de 8 dimensiones (posicion del efector final, orientacion axis-angle y apertura de pinza).
- Ejecucion de tareas espaciales en LIBERO-Spatial: puede generar acciones para recoger objetos y colocarlos en ubicaciones especificas, siguiendo instrucciones en lenguaje natural.
- Compatibilidad con re-planificacion: admite estrategias de re-planning cada 10 pasos, tal como se evaluo en el benchmark (77,6% con re-planning).
- Integracion con el entorno LIBERO: incluye el manejo de las convenciones de observacion especificas, como el render rotado 180 grados, a traves de scripts del repositorio vla-lab.
- Tool calling / function calling: no soportado; no es un modelo conversacional ni de generacion de texto libre.
- Agentes y razonamiento multi-paso: no soportado; genera una secuencia de acciones basada en una instruccion simple, sin planificacion simbolica ni uso de herramientas.
- Capacidades multilingues: no disponibles; no se ha publicado informacion sobre idiomas soportados.

## Casos de uso

- Evaluacion de politicas de manipulacion en entornos simulados: el modelo puede usarse como baseline en el benchmark LIBERO, midiendo tasa de exito con multiples semillas y episodios por tarea, gracias a su integracion con scripts como eval_parallel.py.
- Investigacion en aprendizaje por imitacion: permite comparar el rendimiento de un fine-tuning completo del action expert frente a enfoques basados en LoRA, aportando datos de evaluacion con intervalos de confianza.
- Prototipado de robots de cocina asistencial: al estar entrenado en LIBERO-Spatial, puede generar acciones en un entorno de cocina simulado, lo que resulta util para validar comportamientos de un brazo robotico en tareas de pick-and-place.
- Pruebas de re-planificacion en control robotico: al admitir re-planning cada 10 pasos, es adecuado para experimentar con estrategias de control de baja frecuencia y estudiar su efecto sobre el exito de la tarea.
- Generacion de trayectorias de colocacion de objetos: dado que LIBERO-Spatial incluye tareas de colocacion, el modelo puede emplearse para aprender relaciones espaciales entre objetos y posiciones de destino.
- Transferencia a otros splits del benchmark LIBERO: aunque esta ajustado especificamente a Spatial, el pipeline vla-lab permite iterar sobre otros conjuntos (Object, Goal, etc.) y adaptar el modelo a nuevas variantes de tareas.

## Benchmarks y rendimiento

Los resultados publicados en la model card son los siguientes:

| Configuracion | Tasa de exito | Intervalo de confianza 95% |
|---|---|---|
| SmolVLA full action-expert (este modelo), re-plan cada 10 pasos | 77,6% | ±2,5 (agrupado 75,4-79,6, n=1500) |
| Baseline LoRA (001), re-plan cada 10 pasos | 55,5% | ±2,2 |
| Baseline LoRA (001), open-loop | 41,3% | ±2,2 |

Los datos provienen de evaluaciones con 3 semillas x 50 episodios por tarea, n=1500 episodios en total. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no hay mediciones publicadas, pero dado que el archivo model.pt pesa 1,1 GB y el modelo tiene 450 millones de parametros, se estima que la inferencia puede ejecutarse en una GPU con al menos 2 GB de VRAM, con margen para el overhead del runtime.
- GPU recomendada: una NVIDIA L4 (usada en entrenamiento) es suficiente; tambien deberia ejecutarse en GPUs de consumo como una RTX 3060 o superior.
- Puede ejecutarse en CPU, aunque la latencia sera considerablemente mas alta.
- Opciones de despliegue: el modelo se carga mediante los scripts del repositorio vla-lab (load_policy y eval_parallel.py), que leen el state_dict junto con la configuracion y las estadisticas de normalizacion contenidas en meta.extra. No se ha publicado soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Tasa de exito en LIBERO-Spatial |
|---|---|---|---|
| smolvla-libero-spatial-full | Full action-expert (sin LoRA) | 450 M | 77,6% con re-plan cada 10 pasos |
| Baseline LoRA (001) | LoRA | no especificado | 41,3% open-loop / 55,5% con re-plan cada 10 pasos |
| smolvla_base | Modelo base sin fine-tune | no especificado | no disponible |

No se dispone de comparativas con otros modelos VLA en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo de investigacion: solo se ha evaluado en el entorno simulado LIBERO-Spatial; no hay evidencia publicada de funcionamiento en robots reales.
- Dependencia de convenciones de observacion: requiere el render rotado 180 grados y un vector de estado de 8 dimensiones especifico; cualquier cambio en la camara o en la configuracion del robot invalidara las predicciones.
- Riesgo de acciones incorrectas: al ser un modelo de accion, puede generar movimientos inesperados en escenarios fuera de la distribucion de entrenamiento, aunque no genera texto ni hay riesgo de alucinacion linguistica.
- Generalizacion limitada: LIBERO-Spatial contiene tareas especificas de un entorno de cocina simulada; el rendimiento en otras tareas u objetos no se ha verificado.
- Licencia: el modelo se distribuye bajo MIT, pero antes de un uso comercial es necesario revisar las licencias del modelo base (lerobot/smolvla_base) y del dataset (HuggingFaceVLA/libero).
- Sin soporte de tool calling ni generacion de texto libre: no es adecuado como asistente de lenguaje ni como agente conversacional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pavanyadava07/smolvla-libero-spatial-full
- Repositorio de entrenamiento (vla-lab): https://github.com/pavanyadava07/vla-lab
- Espacio con resultados e intervalos de confianza: https://huggingface.co/spaces/pavanyadava07/vla-lab
- Dataset LIBERO: https://huggingface.co/datasets/HuggingFaceVLA/libero
- Modelo base: https://huggingface.co/lerobot/smolvla_base
