# FineEnvs/retroenv-qwen3.8-27b-grpo

## Resumen

RetroEnv · Qwen3.8-27B · GRPO es un ajuste fino del modelo Qwen/Qwen3.8-27B desarrollado por FineEnvs, orientado especificamente a retrosintesis quimica. El modelo parte de un checkpoint base de 27.781 millones de parametros y se ha entrenado con GRPO (Group Relative Policy Optimization) contra RetroEnv, un entorno de aprendizaje por refuerzo en el que el modelo recibe una molecula objetivo, busca informacion de stock y precedentes mediante herramientas y entrega uno o varios arboles de sintesis que un verificador determinista evalua contra una libreria de reacciones congelada.

La relevancia del checkpoint esta en el salto de rendimiento medido: sobre el conjunto `core150`, con 4 intentos por tarea a temperatura 0.8, el modelo base obtiene un pass@1 de 0.118 y un pass@4 de 0.233, mientras que este checkpoint alcanza 0.338 y 0.547 respectivamente. Es, por tanto, un caso practico de como el RL con recompensas verificables mejora el razonamiento multi-paso con uso de herramientas en un dominio cientifico especializado.

El adaptador LoRA (r16, alpha 32) del paso 525 de la ejecucion `think-mixed-r4` se ha fusionado en los pesos base, de modo que el repositorio se sirve como un checkpoint convencional en `transformers`. La licencia es Apache 2.0 y el modelo esta pensado para ejecutarse dentro del bucle del entorno RetroEnv, con su esquema de herramientas y su prompt de sistema; fuera de ese bucle se comporta como el modelo base con cierta inclinacion hacia arboles de rutas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal y expertos compartidos (familia Qwen3.5, tag `qwen3_5`); modalidad image-text-to-text |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-27B de Qwen, un transformer con capas de atencion lineal y expertos compartidos en el bloque MLP, segun la descripcion del propio autor. Sobre esa base se aplico un adaptador LoRA de rango 16 y alpha 32 restringido exclusivamente a las capas del modelo de lenguaje: atencion q/k/v/o, atencion lineal y el MLP, incluido el experto compartido. El adaptador del paso 525 de la ejecucion `think-mixed-r4` se ha fusionado en los pesos, por lo que el checkpoint resultante no requiere cargar LoRA por separado.

El entrenamiento utiliza TRL AsyncGRPO con 32 rollouts por tarea, 18 pasos de acumulacion de gradiente, tasa de aprendizaje constante y epsilon de 0.2/0.28. Un detalle relevante es la ausencia de penalizacion KL de referencia: `AsyncGRPOConfig` no expone `beta`, de modo que nada ancla la politica al modelo base. Los rollouts se ejecutan contra el entorno RetroEnv alojado, y la recompensa es la recompensa conformada v8 calculada por el servidor, que otorga entre 0.70 y 1.0 por una sintesis resuelta y entre 0 y 0.20 por un fallo, en funcion de que fraccion del arbol alcanza material comprable. Los datos de entrenamiento provienen del dataset LiteFold/RetroEnv-Curated y de los pools `train-easy2k`, `train-mixed2k` y `train-mixed-fresh`. El modelo se entreno con el modo thinking activado y un esfuerzo de razonamiento bajo.

## Capacidades

- Generacion de arboles de retrosintesis: dada una molecula objetivo, propone una o varias rutas de sintesis completas hasta materiales de partida comprables.
- Uso de herramientas (tool calling): consulta stock de reactivos y precedentes de reaccion a traves de las herramientas expuestas por el entorno RetroEnv.
- Razonamiento multi-paso con modo thinking: planifica y ejecuta busquedas encadenadas antes de emitir la respuesta final.
- Busqueda y seleccion de rutas alternativas: puede entregar multiples arboles de sintesis para una misma tarea.
- Capacidad multimodal heredada: la etiqueta `image-text-to-text` del modelo base sugiere soporte de entrada imagen-texto, aunque el autor no documenta su uso en este ajuste.
- Capacidades generales del modelo base (lenguaje, codigo, matematicas): no evaluadas ni documentadas en la model card para este checkpoint.

## Casos de uso

- Planificacion retrosintetica asistida: el modelo se integra en RetroEnv para proponer rutas de sintesis que un quimico revisa antes de ejecutar en laboratorio; el verificador descarta pasos sin precedente registrado o con materiales de partida no comprables, lo que reduce el espacio de busqueda manual.
- Priorizacion de candidatos en descubrimiento de farmacos: dado un compuesto objetivo, el modelo genera rutas alternativas ordenables por viabilidad, que el equipo de quimica medicinal usa como punto de partida para estimar esfuerzo sintetico.
- Evaluacion de comprabilidad de materiales de partida: el uso de herramientas de stock permite al modelo descartar rutas cuyos intermedios no estan disponibles comercialmente, un filtro que ahorra tiempo en la fase de abastecimiento.
- Generacion de datos de entrenamiento para modelos quimicos: las rutas aceptadas por el verificador pueden servir como ejemplos etiquetados de alta calidad para ajustar modelos mas pequenos de retrosintesis.
- Investigacion en RL con recompensas verificables: el checkpoint y sus ejecuciones publicas sirven como referencia reproducible de como GRPO sin penalizacion KL se comporta en un dominio cientifico con verificador determinista.
- Docencia y formacion en sintesis organica: el modelo puede generar arboles de sintesis comentados para ejercicios, siempre con la advertencia de que el verificador no evalua rendimiento, selectividad ni seguridad.

## Benchmarks y rendimiento

Resultados sobre `core150` en el arnes de entrenamiento, 4 intentos por tarea a temperatura 0.8:

| Modelo | pass@1 | pass@4 |
|---|---:|---:|
| Qwen/Qwen3.8-27B (thinking) | 0.118 | 0.233 |
| RetroEnv · Qwen3.8-27B · GRPO (paso 525) | 0.338 | 0.547 |

Tasa de acierto al primer intento por nivel de dificultad: facil 0.62, medio 0.34, dificil 0.18. El autor senala que la media de estos tres niveles (0.380) no coincide con el pass@1 de la tabla, que es la estimacion insesgada sobre los cuatro intentos.

Evolucion de checkpoints con thinking evaluados completamente (seleccion):

| Ejecucion | Paso | pass@1 | pass@4 | Pool de entrenamiento |
|---|---:|---:|---:|---|
| easy2k-shaped-think-r2 | 100 | 0.210 | 0.418 | train-easy2k |
| think-mixed-r3 | 275 | 0.312 | 0.503 | train-mixed2k |
| think-mixed-r3 | 425 | 0.323 | 0.540 | train-mixed2k |
| think-mixed-r4 | 500 | 0.298 | 0.533 | train-mixed-fresh |
| think-mixed-r4 | 525 | 0.338 | 0.547 | train-mixed-fresh |
| think-mixed-r4 | 550 | 0.320 | 0.532 | train-mixed-fresh |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 55,6 GB solo para pesos (el tamano del repositorio coincide con los pesos en bf16), mas memoria para cache KV y activaciones; se recomienda un minimo de 64-80 GB de VRAM.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para servir el modelo sin cuantizar; configuraciones multi-GPU con `device_map="auto"` tambien son viables.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bf16. Seria necesaria cuantizacion a 4 bits (aproximadamente 14-16 GB de pesos), aunque el autor no publica versiones GGUF ni cuantizadas y no hay datos de calidad tras cuantizar.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16", device_map="auto")`, tal como documenta el autor. vLLM, TGI, llama.cpp u Ollama no estan documentados para este checkpoint; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints gestionados de Hugging Face.
- Latencia y throughput: no disponibles. El modo thinking y el bucle de herramientas anaden pasos de generacion adicionales que no estan cuantificados en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | pass@1 (core150) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetroEnv · Qwen3.8-27B · GRPO | 27,78 mil millones | no disponible | 0.338 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base, thinking) | 27,78 mil millones | no disponible | 0.118 | Apache 2.0 (segun modelo base) | Hugging Face |
| Otros checkpoints RetroEnv (think-mixed-r3, paso 425) | 27,78 mil millones | no disponible | 0.323 | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos de retrosintesis comparables (por ejemplo, modelos especializados de sintesis quimica) en la informacion proporcionada.

## Limitaciones y advertencias

- El verificador solo comprueba que cada paso coincide con una reaccion registrada y que cada hoja es comprable; no evalua rendimiento, selectividad ni seguridad. Una ruta aceptada no es una ruta que un quimico deba ejecutar sin revision.
- El modelo espera el esquema de herramientas y el prompt de sistema de RetroEnv. Fuera de ese bucle se comporta como el modelo base con una ligera inclinacion hacia arboles de rutas, por lo que los numeros de la model card no se reproducen en uso generico.
- Debe servirse con la plantilla de thinking activada; de lo contrario, el comportamiento difiere del medido.
- El entrenamiento no incluye penalizacion KL de referencia, lo que puede provocar deriva respecto al modelo base y degradacion de capacidades generales no evaluadas.
- No hay informacion publicada sobre sesgos, idiomas soportados ni rendimiento fuera del dominio de retrosintesis.
- El modelo se publico en noviembre de 2026 con 0 descargas y 0 likes; no hay evidencia de uso en produccion por terceros.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B y del dataset LiteFold/RetroEnv-Curated antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FineEnvs/retroenv-qwen3.8-27b-grpo
- Entorno RetroEnv: https://huggingface.co/spaces/FineEnvs/retroenv
- Codigo de entrenamiento y evaluacion: https://github.com/adithya-s-k/FineEnvs (directorio `09-retroenv/`)
- Checkpoints, episodios y logs de las ejecuciones: https://huggingface.co/buckets/AdithyaSK/retroenv-rl-runs
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset: LiteFold/RetroEnv-Curated (referenciado en la model card)
