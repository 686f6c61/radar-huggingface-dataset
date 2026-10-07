# austinpatel/pi05_libero_gen_goal_chain_lora

## Resumen

`pi05_libero_gen_goal_chain_lora` es un checkpoint de ajuste fino mediante LoRA sobre el modelo base `physical-intelligence/pi05_base`, un modelo visio-linguistico-accion (VLA) de la familia pi0.5 desarrollado por Physical Intelligence. El checkpoint lo publica el usuario `austinpatel` y esta asociado al metodo Behavior Prompting, liberado junto al repositorio `real-stanford/behavior_prompting`. Su proposito es servir como politica robótica entrenada especificamente para tareas del benchmark LIBERO bajo el esquema "Gen Goal Chain".

El modelo no es un modelo de lenguaje de proposito general: es una politica de control robótico que produce acciones a partir de observaciones visuales e instrucciones en lenguaje natural. Se distribuye como checkpoint en formato Orbax nativo de la libreria openpi, no como pesos safetensors o GGUF, y el repositorio ocupa 9,6 GB. Corresponde a un unico directorio de paso de entrenamiento (paso 99999) del experimento `pi05_libero_gen_goal_chain_lora_seed0_v1`.

Su relevancia es acotada al ambito de investigacion en robotica y aprendizaje por imitacion: permite reproducir y evaluar el metodo Behavior Prompting sobre LIBERO sin reentrenar desde cero, partiendo de un adaptador LoRA sobre el modelo base. La model card no especifica licencia, idiomas soportados, ni detalles de arquitectura o contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visio-linguistico-accion (VLA) de la familia pi0.5; adaptador LoRA sobre `physical-intelligence/pi05_base`. Detalle interno no especificado en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en formato Orbax, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (checkpoint openpi: `params/`, `train_state/`, `assets/`, `_CHECKPOINT_METADATA`) |
| Tamano del repositorio | 9,6 GB |
| Paso de entrenamiento | 99999 |
| Modelo base | `physical-intelligence/pi05_base` |
| Dataset de entrenamiento | `austinpatel/libero_gen_goal_chain_train_openpi` |
| Libreria | openpi |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Por los tags y el pipeline declarado (`robotics`, `openpi`, `pi0.5`), se trata de una politica VLA de la familia pi0.5 de Physical Intelligence, ajustada mediante LoRA sobre `pi05_base`. El artefacto publicado es un checkpoint bruto de openpi que contiene el contenido de un unico directorio de paso de entrenamiento, con los subdirectorios `params/`, `train_state/`, `assets/` y el fichero `_CHECKPOINT_METADATA`. No se especifican hiperparametros de LoRA, rango, modulos objetivo, presupuesto de tokens ni composicion exacta del dataset.

El ajuste se realizo sobre el dataset `libero_gen_goal_chain_train_openpi` y esta vinculado al metodo Behavior Prompting, liberado junto al repositorio `real-stanford/behavior_prompting`. El experimento se identifica como `pi05_libero_gen_goal_chain_lora_seed0_v1`, con semilla 0, y el checkpoint corresponde al paso 99999. No se documenta si hubo fases de RLHF, DPO u otras optimizaciones posteriores, ni innovaciones tecnicas adicionales mas alla del propio esquema de Behavior Prompting y del condicionamiento por "goal chain".

## Capacidades

- Control robótico condicionado por lenguaje: genera acciones a partir de observaciones visuales e instrucciones en lenguaje natural, siguiendo el paradigma VLA de pi0.5.
- Behavior prompting: soporte del esquema "Gen Goal Chain", orientado a descomponer tareas en cadenas de objetivos intermedios.
- Ajuste especifico para LIBERO: politica entrenada para las tareas del benchmark LIBERO tal como se define en el dataset asociado.
- Adaptador LoRA: cambios de bajo rango sobre el modelo base, lo que permite reutilizar `pi05_base` y cargar el adaptador por separado.
- Reanudacion de entrenamiento: el directorio `train_state/` permite continuar el entrenamiento desde el paso 99999.
- No se documenta soporte de tool calling, function calling, agentes genericos, razonamiento multi-paso textual, vision general, audio ni modo "thinking".
- Capacidades multilingues: no disponibles.

## Casos de uso

- Reproduccion de resultados en LIBERO: cargar el checkpoint en el fork de openpi con la rama `liberogen` y ejecutar la evaluacion descrita en `docs/libero_openpi.md`, replicando el experimento `pi05_libero_gen_goal_chain_lora_seed0_v1`.
- Investigacion en Behavior Prompting: usar el modelo como politica de referencia para comparar el condicionamiento por "goal chain" frente a otras formas de prompting de comportamiento.
- Punto de partida para nuevos ajustes LoRA: dado que es un adaptador sobre `pi05_base`, sirve como inicializacion para reajustar a otras tareas robóticas manteniendo el coste de entrenamiento bajo.
- Reanudacion de entrenamiento: emplear `train_state/` para continuar el entrenamiento desde el paso 99999, por ejemplo para explorar mas pasos o nuevos datos.
- Evaluacion de robustez de politicas VLA: someter la politica a variaciones de iluminacion, posicion de objetos o formulacion de instrucciones en el entorno simulado de LIBERO para medir degradacion.
- Estudio de la transferencia LoRA en robotica: analizar que porcentaje del rendimiento depende del modelo base `pi05_base` frente al adaptador ajustado sobre LIBERO.
- Integracion en pipelines de evaluacion automatizada: descargar el checkpoint con `hf download` y omitir `train_state/` para inferencia, reduciendo el peso de la descarga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card identifica el benchmark de destino (LIBERO-Gen Goal Chain) y el dataset de entrenamiento, pero no incluye tasas de exito, metricas de exito por tarea ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se especifican parametros totales ni precision del checkpoint, por lo que no puede calcularse una cifra fiable.
- Tamano en disco: el repositorio ocupa 9,6 GB; puede reducirse excluyendo `train_state/*` durante la descarga.
- GPU recomendadas: no disponibles en la informacion proporcionada. Para el ajuste fino de modelos VLA de esta familia es habitual el uso de GPU de datacenter (A100, H100), pero esto no se confirma en la model card.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el unico camino documentado es el fork de openpi con la rama `liberogen`, sirviendo el checkpoint y evaluandolo segun `docs/libero_openpi.md`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `austinpatel/pi05_libero_gen_goal_chain_lora` | VLA + LoRA (pi0.5) | no disponible | no disponible | no disponible | HuggingFace (checkpoint Orbax) |
| `physical-intelligence/pi05_base` | VLA pi0.5 base | no disponible en esta informacion | no disponible | no disponible | HuggingFace / openpi |
| Modelos VLA comparables (por ejemplo, familias OpenVLA o pi0) | VLA | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos numericos suficientes para establecer una comparacion cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- Alcance restringido a robotica: no es un modelo de proposito general; su salida son acciones de control, no texto.
- Licencia no especificada: la model card no declara licencia, por lo que el uso comercial no puede asumirse sin consultar al autor y al modelo base.
- Idiomas no declarados: no hay informacion sobre el idioma de las instrucciones soportadas.
- Formato no estandar: el checkpoint es Orbax nativo de openpi y requiere el fork con la rama `liberogen`; no se puede cargar directamente con frameworks que esperan safetensors o GGUF.
- Dependencia del modelo base: el adaptador LoRA no funciona de forma autonoma; necesita `pi05_base`.
- Datos de entrenamiento poco documentados: no se especifica el numero de episodios, la composicion del dataset ni el procedimiento de recogida.
- Riesgo de sobreajuste al benchmark: al estar entrenado especificamente para LIBERO-Gen Goal Chain, el rendimiento fuera de ese entorno no esta caracterizado.
- Sin datos de sesgo, alucinacion o robustez: no se han publicado analisis al respecto.
- Repositorio con cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad.
- Metadata temporal inusual: la fecha de creacion indicada (2026-10-07) es posterior a la fecha de actualidad habitual, lo que conviene verificar antes de citarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/austinpatel/pi05_libero_gen_goal_chain_lora
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/austinpatel/libero_gen_goal_chain_train_openpi
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Fork de openpi con la rama `liberogen`: https://github.com/austinapatel/openpi
- Repositorio Behavior Prompting: https://github.com/real-stanford/behavior_prompting
- Documentacion de evaluacion en LIBERO: https://github.com/real-stanford/behavior_prompting/blob/main/docs/libero_openpi.md
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relacion con el modelo.
