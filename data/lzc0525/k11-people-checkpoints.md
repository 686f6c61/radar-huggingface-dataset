# lzc0525/k11-people-checkpoints

## Resumen

K11 People checkpoints no es un modelo de lenguaje completo, sino una coleccion de checkpoints de un modulo auxiliar (K11) entrenado sobre el backbone congelado Qwen3-1.7B. Lo publica el usuario lzc0525 en Hugging Face y forma parte del experimento PeopleWorld v3, que evalua preguntas de relacion de uno y dos saltos sobre 96 personas. El repositorio contiene unicamente los pesos del modulo K11 (un `state_dict` de `languageWM.model.k11.K11`), no el backbone, por lo que no puede usarse de forma autonoma sin el arbol de codigo `languageWM`.

La relevancia es acotada y de investigacion: sirve para reproducir y comparar variantes de inicializacion y configuracion del modulo K11 dentro de un estudio concreto sobre memoria y razonamiento relacional en modelos congelados. No es un modelo generativo generalista ni un artefacto listo para produccion. El tamano del repositorio es de 1,2 GB y la libreria declarada es PyTorch.

La informacion publicada es muy limitada: no hay pipeline, licencia, idiomas ni datos de arquitectura del backbone mas alla de su identificacion (Qwen3-1.7B). Los unicos resultados numericos disponibles son las metricas VAL F1/EM de cada variante al epoch 64.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modulo K11 sobre backbone congelado Qwen3-1.7B; el modulo incluye Ground, Graph y Selector (state_dict de `languageWM.model.k11.K11`) |
| Parametros totales | no disponible (solo se publican los pesos del modulo K11, no del backbone) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch `state_dict`), mas `log.jsonl` y `predictions_*.json` |

## Arquitectura y entrenamiento

El artefacto es un modulo K11 acoplado a un backbone Qwen3-1.7B congelado. Segun la model card, el modulo contiene componentes denominados Ground, Graph y Selector. La variante inicializada parte de un Ground de la capa 8 (con `E_G`, `ground_b`, `W_q`, `W_mq`, `W_mk`, 96 slots donde el slot j corresponde a la persona j) y de un Graph y primer Selector preentrenados en las ejecuciones `run_k11_ground` y `run_k11_graph`.

El entrenamiento se realizo sobre el conjunto PeopleWorld v3 con 96 personas y preguntas de relacion de uno y dos saltos. La configuracion comun fue data_x3 (68.592 filas de TRAIN, 1.608 filas de VAL sin cambios), 4 GPUs, batch 64, 64 epochs de 1.072 pasos cada una, con warm-up y decaimiento constante hasta el 80% y luego coseno. El codigo corresponde al commit `a3648547f`, con probabilidad de arista inicial por defecto de 0,004 en ese momento. La variante inicializada entrena con `--layers 8 --slots 0 --ground-init … --graph-init … --ground-lr 1e-6 --read-lr 5e-3`, 96 slots y nada congelado.

Las variantes desde cero difieren en numero de slots y anchura: `scratch_512` usa capas 8, 16 y 24 con 512 slots de anchura 2048; `scratch_96x2048` usa 96 slots con anchura 2048; `scratch_96x512` usa 96 slots con anchura 512 (16 cabezas de 32). No se detalla en la informacion disponible si hubo RLHF, DPO u otras tecnicas de alineacion, ni la composicion completa del dataset mas alla del numero de filas.

## Capacidades

- Razonamiento relacional sobre un conjunto cerrado de 96 personas: responde preguntas de relacion de uno y dos saltos en el marco del experimento PeopleWorld v3.
- Recuperacion de informacion estructurada mediante slots: la variante inicializada emplea 96 slots, uno por persona, para representar entidades del dominio.
- No es un modelo generativo general: no se documentan capacidades de generacion libre, codigo, matematicas o vision.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible mas alla del razonamiento de dos saltos evaluado en el experimento.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Reproduccion de experimentos de investigacion: cargar los checkpoints con el arbol `languageWM` y reconstruir las ejecuciones descritas en la seccion 7 de `K11.md` / `K11_EN.md` para verificar los resultados publicados.
- Comparacion de estrategias de inicializacion: contrastar la variante inicializada (F1 98,3 / EM 83,9) con las variantes desde cero (F1 entre 57,2 y 59,3) para estudiar el impacto del preentrenamiento del modulo.
- Estudio de memoria estructurada en LLM congelados: analizar como un modulo externo con slots codifica entidades (personas) sin modificar los pesos del backbone Qwen3-1.7B.
- Analisis de ablacion de hiperparametros: usar `scratch_96x512` frente a `scratch_96x2048` para medir el efecto de la anchura del modulo (512 frente a 2048) manteniendo 96 slots.
- Evaluacion de razonamiento de dos saltos: emplear `predictions_016/032/064.json` para analizar la evolucion de las respuestas en los epochs 16, 32 y 64 y estudiar la curva de aprendizaje.
- Docencia y formacion: ilustrar en un curso de investigacion como se acopla un modulo de memoria a un transformer congelado y como se registran los logs de entrenamiento (`log.jsonl` con la fila `start` y los argumentos completos).

## Benchmarks y rendimiento

Los unicos resultados publicados son las metricas VAL F1 / EM al epoch 64 para cada variante del modulo K11:

| Variante | Configuracion | VAL F1 | VAL EM |
|---|---|---|---|
| `initialized_trained` | capa 8, 96 slots, nada congelado, `--ground-lr 1e-6 --read-lr 5e-3` | 98,3 | 83,9 |
| `scratch_512` | desde cero, capas 8/16/24, 512 slots, anchura 2048 | 58,7 | 32,1 |
| `scratch_96x2048` | desde cero, 96 slots, anchura 2048 | 59,3 | 33,1 |
| `scratch_96x512` | desde cero, 96 slots, anchura 512 (16 cabezas de 32) | 57,2 | 31,4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1,2 GB, pero incluye solo los pesos del modulo K11; la inferencia requiere ademas cargar el backbone Qwen3-1.7B congelado.
- GPU recomendadas: no disponibles en la informacion publicada. El entrenamiento se realizo con 4 GPUs, sin especificar modelo.
- Cabe en GPU consumer: no disponible; depende del backbone Qwen3-1.7B y del codigo `languageWM`, no documentado en la model card.
- Opciones de despliegue: carga manual con PyTorch (`torch.load` del `state_dict` y `module.load_state_dict`), construyendo `K11` con los argumentos de la fila `start` de `log.jsonl` y el hidden size del backbone. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. K11 People checkpoints no es un modelo de lenguaje comparable con alternativas de la misma categoria: es un modulo de investigacion ligado a un experimento concreto (PeopleWorld v3) y a un backbone especifico (Qwen3-1.7B). No se han publicado comparaciones con otros modulos de memoria o sistemas de razonamiento relacional en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el backbone Qwen3-1.7B y el arbol de codigo `languageWM` para cargarse y ejecutarse.
- Dominio cerrado: el experimento cubre 96 personas y preguntas de relacion de uno y dos saltos; no se documenta generalizacion fuera de ese conjunto.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe consultarse con el autor antes de cualquier uso en produccion.
- Idiomas no disponibles: no se especifica que lenguas cubre el experimento ni las preguntas de evaluacion.
- Riesgo de alucinacion: no evaluado en la informacion disponible; las metricas F1/EM se refieren a un conjunto de validacion cerrado.
- Sesgos conocidos: no documentados.
- Reproducibilidad dependiente del codigo: los resultados estan ligados al commit `a3648547f` y a una probabilidad de arista inicial de 0,004; cambios posteriores en el codigo pueden alterar la reproducibilidad.
- Sin datos de cuantizacion ni de despliegue en produccion: no hay variantes GGUF, INT8 ni soporte de servidores de inferencia documentados.

## Enlaces

- Hugging Face: https://huggingface.co/lzc0525/k11-people-checkpoints
- Repositorio `languageWM` (referenciado en la model card, seccion 7 de `K11.md` / `K11_EN.md`): no disponible como URL en la informacion proporcionada
- Paper, blog o demo: no disponibles
