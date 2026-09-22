# SeanWang0027/qwen3-1.7b-babyai-tcod-b2f-qwen3-32b-ep2

## Resumen

Este modelo es un ajuste fino del modelo base Qwen/Qwen3-1.7B, publicado por el usuario SeanWang0027 en HuggingFace. Se trata de un artefacto de investigación generado mediante destilación on-policy (on-policy distillation, OPD) sobre el entorno BabyAI, un conjunto de tareas de seguimiento de instrucciones en un mundo de rejilla (gridworld). El modelo estudiante es Qwen3-1.7B y el profesor es Qwen3-32B en bf16, con el modo de razonamiento (thinking) desactivado durante la generación de las conversaciones de entrenamiento.

El problema que aborda es el de transferir la capacidad de resolución de tareas multi-turno de un modelo profesor grande a un estudiante pequeño, usando el método TCOD (backward-to-forward) descrito en el repositorio `kokolerk/TCOD` con un overlay FutureBridge-OPD sobre trinity-rft. El resultado es un checkpoint intermedio: la exportación a HuggingFace corresponde al paso 101 del "explorer" (paso 139 del trainer) de un total de 152 pasos previstos en tres pasadas sobre los datos. El propio autor indica explícitamente que el modelo "no ha sido evaluado".

Arquitectura y tamaño: al ser un ajuste fino de Qwen3-1.7B, hereda la arquitectura transformer decoder-only densa del modelo base, con 2.031.739.904 parámetros totales según los pesos en safetensors y un repositorio de 4,1 GB. Es un modelo muy específico de dominio (BabyAI, 20 turnos de conversación, 810 tareas oficiales de entrenamiento) y de interés principalmente para investigadores que trabajen en destilación on-policy o en agentes sobre entornos de rejilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen/Qwen3-1.7B; detalles de capas y atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 2.031.739.904 (dato real de los pesos en safetensors) |
| Longitud de contexto | No disponible para este ajuste; el modelo base Qwen3-1.7B declara 32.768 tokens de contexto nativo (dato del modelo base, no verificado en esta ficha) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors (4,1 GB para 2,03B parametros, compatible con bf16/fp16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-1.7B |
| Tarea de ajuste | BabyAI, conversacion de 20 turnos (`babyai/eval_babyai.py`) |
| Metodo de entrenamiento | Destilacion on-policy (TCOD backward-to-forward) con overlay FutureBridge-OPD (trinity-rft) |
| Profesor | Qwen3-32B en bf16, thinking off |
| Estado de evaluacion | No evaluado (indicado por el autor) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso. El entrenamiento no modifica la arquitectura: se trata de un ajuste fino por destilacion, de modo que la innovacion esta en el procedimiento de entrenamiento y no en el diseno de la red. La conversacion de entrenamiento sigue el formato de `babyai/eval_babyai.py`, con episodios de 20 turnos, y el modo de razonamiento del estudiante permanece desactivado.

El metodo empleado es TCOD en su variante backward-to-forward: el prefijo "gold" (la parte correcta de la trayectoria proporcionada al estudiante) se va reduciendo progresivamente, con `checkpoint_steps` fijado en 5. El codigo corresponde a `kokolerk/TCOD` con un overlay FutureBridge-OPD sobre trinity-rft, y el port de BabyAI esta descrito en `docs/TCOD_BABYAI.md` del repositorio online-rose, rama `tcod-babyai`. Los hiperparametros declarados son: 810 tareas oficiales de entrenamiento, batch de 16 episodios / 64 turnos, learning rate 1e-6, `kl_coef` 1.0 (coeficiente de regularizacion KL, coherente con destilacion on-policy con KL inversa) y tres pasadas sobre los datos, lo que da 152 pasos de "explorer". El checkpoint exportado corresponde al paso 101 del explorer (paso 139 del trainer), es decir, un punto intermedio del entrenamiento planificado, no el modelo final. No se indica la composicion del dataset mas alla de las tareas de BabyAI ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno: el entrenamiento usa conversaciones de 20 turnos, por lo que el modelo esta expuesto a dialogos largos dentro del formato de BabyAI.
- Seguimiento de instrucciones en un entorno de rejilla (BabyAI): resolucion de tareas de instrucciones en lenguaje natural sobre un mundo gridworld.
- Interaccion tipo agente con el profesor/entorno: el formato de `babyai/eval_babyai.py` implica turnos alternos de accion y observacion.
- Capacidad multilingue: no disponible (no se declara lista de idiomas).
- Tool calling / function calling: no disponible; no se menciona soporte explicito.
- Modo de razonamiento (thinking): explicitamente desactivado durante el entrenamiento ("thinking off"); no se declara que se pueda activar en inferencia.
- Vision o audio: no disponible; el modelo base Qwen3-1.7B es exclusivamente de texto.
- Capacidades generales (codigo, matematicas, conocimiento general): no disponibles; el ajuste esta especializado en BabyAI y el autor no ha publicado ninguna evaluacion.

## Casos de uso

- Investigacion en destilacion on-policy: sirve como checkpoint reproducible de TCOD-B2F para estudiar como evoluciona el aprendizaje del estudiante en funcion del paso de entrenamiento (el autor exporta el paso 101 de 152), comparando con el profesor Qwen3-32B.
- Evaluacion de agentes en BabyAI con bajo coste computacional: al ser un modelo de 2,03B parametros, puede usarse como sustituto barato del profesor de 32B en bucles de evaluacion internos durante el desarrollo de entornos tipo gridworld.
- Baseline en estudios comparativos de metodos de destilacion: al compartir modelo base con otros experimentos sobre Qwen3-1.7B, permite aislar el efecto del metodo (TCOD frente a otras variantes) manteniendo constante el estudiante.
- Generacion de trayectorias sinteticas de 20 turnos: util para pre-poblar un buffer de experiencias en el mismo formato de conversacion de BabyAI, siempre que se filtren las trayectorias por calidad dado que el modelo no ha sido evaluado.
- Prototipado de agentes conversacionales multi-turno en hardware de consumo: con cuantizacion en 4 u 8 bits cabe en GPUs de gama media, lo que permite demos internas del bucle de interaccion sin infraestructura dedicada.
- Punto de partida para ajustes posteriores: puede emplearse como inicializacion de fine-tuning adicional sobre tareas de BabyAI u otros entornos de rejilla, aprovechando que ya esta adaptado al formato conversacional de 20 turnos.
- Reproducibilidad de pipelines de entrenamiento: el modelo documenta el estado intermedio del pipeline TCOD + trinity-rft, lo que resulta util para validar que un pipeline propio produce checkpoints equivalentes en el mismo paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita: "Not evaluated". No se dispone de cifras de exito en las tareas de BabyAI, ni de MMLU, HumanEval, GSM8K o cualquier otra metrica.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 4,1 GB (2,03B parametros x 2 bytes por parametro, coherente con el tamano del repositorio de 4,1 GB).
- VRAM estimada en bf16/fp16: del orden de 5-6 GB incluyendo pesos y margen para activaciones; a esto se suma el cache KV, que crece linealmente con la longitud de contexto y puede anadir varios GB si se trabaja con ventanas largas de hasta 32.768 tokens.
- VRAM estimada en int8: del orden de 2,5-3,5 GB; en int4: del orden de 1,5-2,5 GB (estimaciones por tamano de pesos; no hay cuantizaciones publicadas por el autor).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). Para despliegue con contexto maximo y concurrencia alta se recomienda A100 40/80 GB, H100, L40S o similares.
- Cabe en GPU de consumo: si, en bf16 cabe en tarjetas de 8-12 GB y en cuantizacion de 4 bits en GPU de 4-6 GB, siempre que el contexto utilizado sea moderado.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el tag `text-generation-inference` y `endpoints_compatible` estan presentes), y servidores compatibles con safetensors. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por turno.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de sus respectivas fichas publicas y no de la busqueda realizada para esta ficha; los de este modelo proceden de la model card y de los metadatos de HuggingFace.

| Modelo | Parametros totales | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-babyai-tcod-b2f-qwen3-32b-ep2 | 2,03B | No disponible (base: 32.768) | BabyAI, conversacion de 20 turnos, destilado de Qwen3-32B | No disponible | HuggingFace, 0 descargas, sin evaluar |
| Qwen/Qwen3-1.7B (modelo base) | ~1,7B nominales | 32.768 tokens nativos | Proposito general, modo thinking | Apache 2.0 (segun su ficha publica) | Ampliamente disponible |
| Llama-3.2-1B-Instruct | ~1,24B | 128.000 tokens (segun su ficha publica) | Proposito general, chat | Licencia comunitaria Llama 3.2 | Ampliamente disponible |
| Gemma-3-1B-it | ~1B | 32.000 tokens (segun su ficha publica) | Proposito general, chat multimodal en variantes mayores | Gemma Terms of Use | Ampliamente disponible |

En rendimiento no es posible comparar: no existen benchmarks publicados de este ajuste y la model card indica explicitamente que no ha sido evaluado. La comparacion relevante es de procedimiento: frente a los modelos de proposito general, este checkpoint esta especializado en un unico entorno y representa un paso intermedio de un entrenamiento inacabado, por lo que no es un sustituto funcional de las alternativas generalistas.

## Limitaciones y advertencias

- Modelo no evaluado: el autor declara "Not evaluated". No existe ninguna evidencia cuantitativa de su rendimiento en BabyAI ni en ninguna otra tarea.
- Checkpoint intermedio: corresponde al paso 101 de 152 pasos planificados (paso 139 del trainer), por lo que no es el resultado final del entrenamiento descrito.
- Dominio extremadamente restringido: entrenado solo con las 810 tareas oficiales de BabyAI y con el formato conversacional de 20 turnos de `babyai/eval_babyai.py`. Fuera de ese formato es probable que el comportamiento se degrade de forma significativa.
- Riesgo de olvido catastrofico: el ajuste sobre Qwen3-1.7B con learning rate 1e-6 y tres pasadas sobre un dataset pequeno puede haber reducido las capacidades generales del modelo base (lenguaje general, codigo, matematicas). No hay datos al respecto.
- Modo thinking desactivado: el entrenamiento se realizo con "thinking off", por lo que no se debe esperar razonamiento explicito ni cadenas de pensamiento.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; en este caso, ademas, el modelo puede generar acciones u observaciones plausibles pero invalidas en el entorno, sin que exista una evaluacion que cuantifique ese fallo.
- Idiomas: no se declara ninguna lista de idiomas soportados. No se puede asumir cobertura multilingue.
- Licencia no disponible: al no declararse licencia, no hay autorizacion explicita de uso comercial ni condiciones claras de redistribucion. Conviene contactar con el autor antes de cualquier uso en produccion. Ademas, la licencia del modelo base Qwen3-1.7B (Apache 2.0 segun su ficha publica) debe respetarse en cualquier caso.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion por parte de terceros.
- Dependencia de un pipeline de investigacion: la reproducibilidad depende de repositorios externos (`kokolerk/TCOD`, overlay FutureBridge-OPD, trinity-rft, rama `tcod-babyai` de online-rose) que pueden cambiar sin aviso.
- Uso en produccion: no recomendado en su estado actual. Es un artefacto de investigacion, no evaluado y sin licencia declarada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-babyai-tcod-b2f-qwen3-32b-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Codigo TCOD citado en la model card: `kokolerk/TCOD` (repositorio referenciado por el autor; URL completa no confirmada en la informacion proporcionada)
- Overlay de destilacion on-policy: FutureBridge-OPD sobre trinity-rft (referenciado por el autor; URL completa no confirmada)
- Documentacion del port de BabyAI: `docs/TCOD_BABYAI.md` del repositorio online-rose, rama `tcod-babyai` (referenciado por el autor; URL completa no confirmada)
- Script de conversacion de evaluacion: `babyai/eval_babyai.py` (referenciado por el autor; URL completa no confirmada)

Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo (corresponden a entradas de Wikipedia y guias turisticas sobre el Palazzo Pamphilj de Roma). Por tanto, no se ha podido incorporar informacion adicional externa a esta ficha.
