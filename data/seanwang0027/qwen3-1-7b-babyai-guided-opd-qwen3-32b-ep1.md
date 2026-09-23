# SeanWang0027/qwen3-1.7b-babyai-guided-opd-qwen3-32b-ep1

## Resumen

El modelo `SeanWang0027/qwen3-1.7b-babyai-guided-opd-qwen3-32b-ep1` es un checkpoint de investigación publicado en HuggingFace, resultado de aplicar destilación on-policy guiada (Guided-OPD, con la variante FutureBridge) sobre el modelo base Qwen3-1.7B. El autor (SeanWang0027) parte de una configuración estudiante-profesor en la que Qwen3-1.7B actúa como estudiante y Qwen3-32B en bf16 como profesor, entrenando sobre tareas del entorno BabyAI con el modo de razonamiento (thinking) desactivado. El objetivo no es obtener un modelo de propósito general, sino estudiar y reproducir una metodología concreta de destilación sobre trayectorias multi-turno.

El entrenamiento sigue el marco TCOD (kokolerk/TCOD) con un overlay FutureBridge-OPD sobre trinity-rft, e incluye un port de BabyAI documentado en `docs/TCOD_BABYAI.md` del repositorio online-rose (rama `tcod-babyai`). La configuración usa 20 turnos de conversación, las 810 tareas oficiales de entrenamiento de BabyAI, batch de 16 episodios / 64 turnos, learning rate 1e-6, `kl_coef` 1.0 y tres pasadas sobre los datos (152 pasos de explorer en total). El repositorio ocupa 4,1 GB y contiene pesos en safetensors, aunque el modelo tiene 2.031.739.904 parámetros totales, lo que sugiere pesos en bf16 junto con otros artefactos de entrenamiento.

Es relevante ahora como artefacto reproducible de investigación: permite inspeccionar un estado intermedio del proceso de destilación (exportación tras el paso 51 de explorer, equivalente al paso 71 de trainer, dentro de la primera de tres pasadas). El propio autor indica explícitamente que el modelo **no ha sido evaluado**, por lo que debe tratarse como un checkpoint experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, heredada de Qwen/Qwen3-1.7B (no se detallan capas ni dimensiones en la informacion disponible) |
| Parametros totales | 2.031.739.904 (~2,03 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base Qwen3-1.7B, no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors; no se incluyen GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,1 GB |
| Modelo base | Qwen/Qwen3-1.7B |
| Libreria | transformers |
| Pipeline | text-generation |
| Tags | transformers, tensorboard, safetensors, qwen3, text-generation, babyai, on-policy-distillation, tcod, conversational |
| Fecha de creacion | 2026-09-22 |
| Ultima actualizacion | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-1.7B, un transformer decoder denso de aproximadamente 2.000 millones de parámetros. No se ha publicado en la información disponible ningún cambio estructural respecto al base: el trabajo se centra en el procedimiento de ajuste, no en modificar el modelo. El entrenamiento se realiza con el modo de razonamiento desactivado (thinking off) y sobre la conversación definida en `babyai/eval_babyai.py`.

El método es una destilación on-policy guiada (Guided-OPD, FutureBridge) en la que el rol profesor/estudiante se decide por turno, con un coeficiente beta que sigue una trayectoria coseno de 1.0 a 0.0 a lo largo del 80 % de la ejecución y una pérdida mixta con `mu = 0.5`. Los hiperparámetros documentados son: 20 turnos de conversación, 810 tareas oficiales de entrenamiento de BabyAI, batch de 16 episodios / 64 turnos, learning rate 1e-6, `kl_coef` 1.0 y tres pasadas sobre los datos (152 pasos de explorer). El checkpoint exportado corresponde al paso 51 de explorer (paso 71 de trainer), es decir, a la primera de las tres pasadas. El código proviene de kokolerk/TCOD más el overlay FutureBridge-OPD sobre trinity-rft, con el port de BabyAI del repositorio online-rose (rama `tcod-babyai`).

## Capacidades

- Generacion de texto conversacional multi-turno: el entrenamiento se realiza sobre conversaciones de 20 turnos, por lo que el modelo esta expuesto a dialogos encadenados en el dominio BabyAI.
- Seguimiento de instrucciones en el entorno BabyAI: las tareas de entrenamiento son las 810 oficiales de este entorno de gridworld, centradas en instrucciones composicionales y ejecucion de acciones.
- Razonamiento multi-paso dentro de la simulacion: la estructura de turnos implica planificacion y ejecucion de secuencias de acciones.
- Modo de razonamiento (thinking): desactivado explicitamente durante el entrenamiento; no se documenta soporte del modo thinking en este checkpoint.
- Tool calling / function calling: no disponible.
- Capacidades de agente autonomo general: no disponible (el entrenamiento se limita al entorno BabyAI).
- Vision, audio u otras modalidades: no disponibles.
- Capacidades multilingues: no disponibles (no se especifican idiomas en la model card).

## Casos de uso

- Reproduccion de experimentos de destilacion on-policy: el checkpoint permite replicar y auditar la primera pasada del pipeline Guided-OPD descrito por el autor, comparando el estado en el paso 51 de explorer con el modelo base y con las pasadas 2 y 3.
- Investigacion en entornos BabyAI: sirve como estudiante ajustado para experimentos de seguimiento de instrucciones en gridworlds, aprovechando que el entrenamiento usa las 810 tareas oficiales del entorno.
- Estudio de olvido catastrofico y deriva de capacidades: al estar ajustado exclusivamente sobre BabyAI durante 51 pasos de explorer, es un caso útil para medir cuanto se degradan las capacidades generales del base Qwen3-1.7B.
- Analisis de checkpoints intermedios: al ser una exportacion a mitad de la primera pasada, permite trazar la evolucion de la politica del estudiante a lo largo del entrenamiento, no solo el resultado final.
- Docencia y formacion en pipelines de destilacion: el flujo (TCOD + FutureBridge-OPD + trinity-rft) es un ejemplo concreto y documentado para explicar como se estructura un entrenamiento estudiante-profesor por turnos.
- Pruebas de infraestructura de despliegue ligero: con ~2.000 millones de parametros, el modelo cabe en GPUs de consumo y sirve para validar stacks de inferencia (transformers, TGI, vLLM) antes de escalar a modelos mayores.
- Linea base comparativa: puede usarse como referencia de "estudiante parcialmente destilado" frente al profesor Qwen3-32B en bf16 y frente al estudiante sin ajustar.
- Prototipado de agentes conversacionales en simulacion: para demos internas de dialogo multi-turno de 20 turnos en dominios controlados, siempre que se asuma que no hay evaluacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente "Not evaluated" (no evaluado). No se dispone de cifras de MMLU, HumanEval, GSM8K ni de metricas de exito en BabyAI para este checkpoint, y no se deben inferir del modelo base ni del profesor.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 2.031.739.904 parametros, sin incluir cache KV ni overhead del runtime):
  - bf16 / fp16: ~4,1 GB de pesos.
  - Cuantizacion de 8 bits: ~2,0 GB.
  - Cuantizacion de 4 bits: ~1,0-1,1 GB.
- Caben en GPU de consumo: si, en cualquier GPU con 6-8 GB o mas de VRAM (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) si se ejecuta en bf16 con margen suficiente para el contexto.
- GPU profesionales recomendadas: A100, H100, L40S o similares si se busca throughput alto o servir muchas peticiones concurrentes.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el modelo lleva el tag `text-generation-inference` y `endpoints_compatible`), vLLM y TGI como servidores de inferencia. llama.cpp y Ollama requeririan convertir los pesos a GGUF, artefacto que no se incluye en el repositorio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-1.7b-babyai-guided-opd-qwen3-32b-ep1 | 2.031.739.904 | No disponible | No disponible | Pesos safetensors en HF | Checkpoint intermedio (paso 51/152), no evaluado |
| Qwen/Qwen3-1.7B (base) | ~2.000 millones (no confirmado en la informacion proporcionada) | No disponible | No disponible | Publico en HF | Modelo de partida del ajuste |
| Qwen/Qwen3-32B (profesor) | No disponible en la informacion proporcionada | No disponible | No disponible | Publico en HF | Usado como profesor en bf16 durante el entrenamiento |

No se dispone de datos de rendimiento ni de licencia para establecer una comparativa cuantitativa con alternativas de la misma categoria. La comparacion queda limitada al tamano de parametros y al rol de cada modelo dentro del pipeline de destilacion.

## Limitaciones y advertencias

- Modelo no evaluado: el autor indica explicitamente "Not evaluated". No hay metricas de calidad, seguridad ni utilidad.
- Ajuste muy estrecho: el entrenamiento se limita al entorno BabyAI (810 tareas) durante 51 pasos de explorer, por lo que es probable una perdida sustancial de capacidades generales respecto a Qwen3-1.7B. No se ha medido esa degradacion.
- Checkpoint intermedio: corresponde al paso 51 de 152 planificados (primera de tres pasadas). No es el resultado final del pipeline.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. Al derivar de Qwen/Qwen3-1.7B, habria que verificar ademas la licencia del modelo base antes de cualquier uso productivo.
- Idiomas no especificados: no hay informacion sobre el soporte multilingue real de este checkpoint.
- Riesgo de alucinacion: no cuantificado y no evaluado; en un modelo ajustado sobre un dominio tan acotado, la probabilidad de respuestas incorrectas fuera de ese dominio es alta.
- Sin cuantizaciones listas para usar: el repositorio solo publica safetensors, de modo que el despliegue en llama.cpp u Ollama exige una conversion previa no validada.
- Modo thinking desactivado: el entrenamiento se hizo con thinking off, por lo que no debe asumirse comportamiento de razonamiento extendido.
- Artefacto de investigacion: no se han documentado sesgos, filtros de seguridad, ni procesos de alineacion especificos posteriores al ajuste.
- Resultados de busqueda web no relevantes: las busquedas realizadas no devolvieron informacion tecnica ni enlaces utiles sobre este modelo.

## Enlaces

- HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-babyai-guided-opd-qwen3-32b-ep1
- Modelo base: Qwen/Qwen3-1.7B (https://huggingface.co/Qwen/Qwen3-1.7B)
- Modelo profesor: Qwen/Qwen3-32B (https://huggingface.co/Qwen/Qwen3-32B)
- Codigo TCOD: repositorio kokolerk/TCOD (referenciado en la model card, sin URL verificada en la informacion disponible)
- Overlay FutureBridge-OPD sobre trinity-rft (referenciado en la model card, sin URL verificada)
- Port de BabyAI: repositorio online-rose, rama `tcod-babyai`, documentacion en `docs/TCOD_BABYAI.md` (referenciado en la model card, sin URL verificada)
- Script de conversacion de entrenamiento/evaluacion: `babyai/eval_babyai.py` (referenciado en la model card)
- Paper o blog tecnico: no disponible en la informacion proporcionada
- Demo o space: no disponible en la informacion proporcionada
