# sidbaines/amber-baton

## Resumen

amber-baton es un adaptador LoRA (PEFT) publicado por sidbaines, investigador en seguridad de IA en el equipo de alineación de Arcadia Impact y colaborador del UK AI Safety Institute. No se trata de un modelo de lenguaje completo, sino de los puntos de control de un ajuste LoRA derivado de un ensayo interno de aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3.8-27B. El propio autor lo describe como un artefacto de investigación y advierte explícitamente de que no está pensado para su uso.

El repositorio ocupa 0,9 GB e incluye los pesos del adaptador y métricas de entrenamiento, documentadas según la model card en un fichero `MANIFEST.md` del propio repositorio. El interés del artefacto no reside en sus capacidades —no se documenta ninguna evaluación— sino en su valor como material de reproducibilidad para investigación en seguridad y alineación de modelos, en particular en el estudio de motivaciones y comportamiento inducido mediante RL.

La información pública es muy limitada: cero descargas, cero valoraciones, sin pipeline declarado, sin idiomas especificados, licencia "other" sin términos detallados y sin resultados de benchmarks. Cualquier uso en producción requeriría primero cargar el modelo base y, después, validar por cuenta propia el comportamiento resultante, algo que el autor desaconseja de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (arquitectura del modelo base no documentada en la informacion disponible) |
| Parametros totales | No disponible para el adaptador; el modelo base se identifica como Qwen/Qwen3.8-27B (27B referenciados en el nombre, sin confirmar) |
| Parametros activos | No aplica / no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | other (terminos no especificados en la informacion disponible) |
| Formato de pesos | safetensors, formato de adaptador PEFT/LoRA (libreria: peft) |
| Tamano del repositorio | 0,9 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA gestionado con la libreria PEFT, con etiquetas que confirman el uso de LoRA y safetensors como formato de serializacion. No se dispone de informacion sobre el rango del adaptador, los modulos objetivo, el optimizador, la tasa de aprendizaje ni el numero de pasos. El tamano del repositorio (0,9 GB) incluye, segun la model card, tanto los checkpoints LoRA como las metricas de entrenamiento, por lo que no puede inferirse de forma fiable el numero de parametros del adaptador.

El procedimiento de entrenamiento se describe genericamente como un "ensayo interno de aprendizaje por refuerzo". No se detalla el algoritmo de RL empleado (PPO, GRPO, DPO u otro), la composicion del dataset, el numero de tokens vistos ni si existio una fase previa de ajuste supervisado. El contexto de investigacion del autor, centrado en motivaciones de modelos de IA y en los efectos de la fase de midtraining, sugiere que el ensayo forma parte de una linea de trabajo sobre como determinados datos de ajuste pueden inducir o eliminar comportamientos objetivo, pero esta conexion no se afirma en la model card y no debe darse por confirmada.

No se documenta ninguna innovacion tecnica de inferencia (decodificacion especulativa, atencion lineal, modos de razonamiento) asociada a este artefacto.

## Capacidades

- No se documenta ninguna capacidad especifica del adaptador en la informacion disponible.
- Al ser un adaptador LoRA, hereda la arquitectura y el tokenizador del modelo base Qwen/Qwen3.8-27B, cuyas capacidades no se detallan en esta ficha por falta de datos verificables.
- No hay evidencia publicada de soporte de tool calling, function calling o uso en agentes.
- No hay evidencia publicada de capacidades multilingues ni de cobertura de idiomas.
- No hay evidencia publicada de modo de razonamiento (thinking mode), vision, audio ni otras modalidades.
- El autor indica expresamente que se trata de artefactos de investigacion no destinados a uso, por lo que cualquier capacidad funcional queda sin validar.

## Casos de uso

Los siguientes escenarios son usos de investigacion coherentes con la naturaleza declarada del artefacto. En ningun caso implican despliegue en produccion, que el autor desaconseja de forma explicita.

- Reproduccion de ensayos de RL: el adaptador y las metricas de entrenamiento incluidas permiten a un equipo de investigacion repetir o auditar un experimento de aprendizaje por refuerzo sobre un modelo base de ~27B, comparando curvas de entrenamiento y comportamiento final.
- Estudio de induccion de comportamiento mediante ajuste: dado el contexto de investigacion del autor sobre motivaciones de modelos, el artefacto puede servir como material de partida para analizar como un ajuste de bajo rango modifica el comportamiento sin alterar los pesos del modelo base.
- Pruebas de metodos de evaluacion de alineacion: el adaptador puede emplearse como sujeto de pruebas en baterias de evaluacion (red-teaming, deteccion de reward hacking) para calibrar la sensibilidad de dichas baterias ante cambios pequenos en los pesos.
- Experimentos de fusion y composicion de adaptadores: al ser un LoRA en safetensors, permite estudiar tecnicas de merging (suma ponderada, TIES, DARE) y medir como se degrada o se preserva el comportamiento tras la composicion.
- Analisis de robustez del modelo base: comparar Qwen/Qwen3.8-27B con y sin el adaptador permite aislar el efecto del ajuste en tareas controladas, siempre que el modelo base este disponible y su licencia lo permita.
- Investigacion sobre seguridad en modelos abiertos: el artefacto puede integrarse en pipelines de analisis de riesgo (evaluacion de sesgos, jailbreaks, cumplimiento de reglas) como caso de prueba representativo de adaptadores derivados de RL.
- Docencia y formacion tecnica: sirve como ejemplo real de estructura de repositorio PEFT (adaptador, metricas, manifiesto) para explicar el ciclo de vida de un ajuste LoRA en cursos de posgrado o formacion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona metricas de entrenamiento almacenadas en el repositorio y documentadas en `MANIFEST.md`, pero no se proporcionan valores, y no se ofrecen resultados de evaluacion en tareas como MMLU, HumanEval o GSM8K. No se deben asumir cifras de rendimiento a partir del modelo base.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del tamano del modelo base referenciado (~27B) y no proceden de documentacion oficial del artefacto.

- VRAM estimada para el modelo base en fp16/bf16: del orden de 54 GB solo en pesos, mas overhead de activaciones y cache KV; en la practica, 70-80 GB para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 27-30 GB de pesos, lo que exige GPUs de 40-48 GB (A100 40GB, L40S, A6000) segun contexto.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 14-16 GB de pesos, con margen adicional para contexto; podria caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado.
- GPUs recomendadas para el modelo base sin cuantizar: A100 80GB, H100 80GB, o configuraciones multi-GPU (2x A6000 48GB, 2x L40S).
- GPUs de consumo: una RTX 4090 o RTX 3090 de 24 GB es viable solo con cuantizacion agresiva (4 bits) y contextos limitados; una RTX 4080 de 16 GB queda al limite o por debajo.
- El adaptador en si anade una huella de memoria minima en inferencia (del orden de cientos de MB a ~1 GB segun el rango, no documentado), muy inferior a la del modelo base.
- Opciones de despliegue: carga mediante transformers + peft; servidores con soporte de adaptadores LoRA (vLLM, TGI); para llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y convertir los pesos a GGUF, un flujo no documentado por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se identifican alternativas publicas directamente comparables: se trata de un adaptador LoRA derivado de un ensayo interno de RL, sin evaluacion publicada y con licencia "other". La comparacion mas util es contra su propio modelo base y contra otros artefactos del mismo autor.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sidbaines/amber-baton | Adaptador LoRA (PEFT) | No disponible (base ~27B) | No disponible | other | Publico en HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B | Modelo base referenciado | 27B referenciados en el nombre, sin confirmar | No disponible | No disponible en esta ficha | No verificado en la informacion disponible |
| sidbaines/scimt-prior-coins-dispatch-sdf-aft-v1-data | Otro artefacto del mismo autor (datos) | No disponible | No disponible | No disponible | Publico en HuggingFace |
| Adaptadores LoRA genericos de la comunidad | Adaptador (PEFT) | Variable (10M-1B tipico) | Heredado del base | Variable | Amplia disponibilidad |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- El autor declara explicitamente que son "artefactos de investigacion, no destinados a uso". Cualquier despliegue en produccion contradice la intencion declarada.
- Ausencia total de evaluacion publicada: se desconocen tasas de alucinacion, sesgos, toxicidad y comportamiento en dominios concretos.
- La licencia es "other" y no se detallan sus terminos. No puede asumirse permiso para uso comercial, redistribucion o modificacion; es imprescindible contactar con el autor antes de cualquier uso.
- El adaptador requiere el modelo base Qwen/Qwen3.8-27B, cuyos terminos de licencia se aplican de forma adicional e independiente.
- Al provenir de un ensayo de RL, el ajuste puede haber inducido comportamientos especificos, incluidos sesgos o sesgos de motivacion, sin que exista documentacion publica que los caracterice.
- No se especifican idiomas soportados: no puede asumirse un buen rendimiento en castellano ni en ningun otro idioma concreto.
- Longitud de contexto desconocida: no debe planificarse su uso con ventanas largas sin verificacion previa.
- El repositorio incluye metricas de entrenamiento y un fichero `MANIFEST.md`, pero su contenido no se ha podido verificar en la informacion disponible; no debe tratarse como documentacion validada.
- Riesgo de cadena de suministro: al ser un adaptador de un tercero con cero adopcion publica, conviene auditar el contenido del repositorio antes de cargarlo en entornos con datos sensibles.
- Fecha de publicacion y actualizacion registradas en 2026-09-25, sin historial posterior de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sidbaines/amber-baton
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor en HuggingFace: https://huggingface.co/sidbaines
- Sitio personal del autor: https://sidbaines.github.io/
- Pagina de autor en Catalytex: https://www.catalyzex.com/author/Sid%20Baines
- Calendario de lanzamientos de modelos de IA: https://www.scriptbyai.com/ai-model-release-calendar/
- Comparador de modelos y benchmarks: https://aimodelsbenchmark.com/
- Fichero de documentacion referenciado en la model card: `MANIFEST.md` dentro del repositorio del modelo (https://huggingface.co/sidbaines/amber-baton)
