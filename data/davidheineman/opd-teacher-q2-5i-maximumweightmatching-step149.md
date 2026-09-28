# davidheineman/opd-teacher-Q2.5I-MaximumWeightMatching-step149

## Resumen

`opd-teacher-Q2.5I-MaximumWeightMatching-step149` es un ajuste fino de Qwen2.5-1.5B-Instruct desarrollado por David Heineman (Allen Institute for AI) como modelo profesor dentro de un experimento de destilacion on-policy (OPD, on-policy distillation) sobre 32 entornos. El modelo se ha entrenado con RLVE y GRPO durante 150 actualizaciones sobre un unico entorno, `MaximumWeightMatching` (emparejamiento de peso maximo), a dificultad 0. Su proposito no es el uso generalista, sino servir como fuente de trazas de alta calidad para destilar ese comportamiento en un modelo alumno.

Arquitectonicamente hereda la pila de Qwen2.5-1.5B-Instruct: un transformer decoder-only de tipo denso con 1.543.714.304 parametros (aproximadamente 1,5 mil millones). El checkpoint `step149` es el ultimo de la ejecucion (indice basado en cero, correspondiente a la actualizacion numero 150) y sus pesos se convirtieron desde el checkpoint nativo final a safetensors de Hugging Face, con validacion de nombres y formas de tensores contra el modelo base.

Es relevante ahora porque forma parte de una linea de investigacion activa sobre RL con entornos verificables y destilacion on-policy: en lugar de un unico modelo generalista, se entrenan profesores especializados por entorno y se usan para generar datos de entrenamiento. La model card es deliberadamente minima, no publica benchmarks y no declara rendimiento fuera del entorno de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2, segun tags `qwen2` y modelo base) |
| Parametros totales | 1.543.714.304 (dato de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada por el autor; heredada del modelo base Qwen2.5-1.5B-Instruct (32.768 tokens en su configuracion estandar) |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; solo pesos safetensors. El tamano del repo (3,1 GB) es coherente con BF16 (2 bytes por parametro) |
| Idiomas soportados | Ingles (`en`, unico idioma declarado) |
| Licencia | apache-2.0 (se incluye el archivo `LICENSE` original de Qwen) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Metodo de entrenamiento | GRPO sobre el entorno `MaximumWeightMatching` (RLVE), 150 actualizaciones |
| Tamano del repositorio | 3,1 GB |
| Fecha de publicacion | 2026-09-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con normalizacion RMSNorm, atencion con QKV bias y RoPE, entrenado originalmente por Alibaba con datos multilingues y alineado con preferencias humanas. El ajuste aqui documentado no modifica la arquitectura: los pesos se convirtieron desde el checkpoint nativo final y se validaron contra los nombres y formas de tensor del modelo base, por lo que la topologia es identica.

El entrenamiento consiste en 150 actualizaciones con GRPO sobre un unico entorno de RLVE, `MaximumWeightMatching`, a dificultad 0. No se documentan en la informacion disponible el numero de tokens, la composicion del dataset, ni si hubo fases adicionales de RLHF o DPO. Las innovaciones relevantes son de proceso, no de arquitectura: profesores especializados por entorno (32 de los 400 entornos del trabajo de referencia), destilacion on-policy sobre las trazas del profesor y publicacion del run de W&B con el grupo de barrido `opd-teachers-20260927-191939`, lo que permite reproducir la ejecucion.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Instruct.
- Razonamiento y resolucion de instancias del problema de emparejamiento de peso maximo (Maximum Weight Matching) en grafos, que es el dominio concreto sobre el que se aplico el refuerzo.
- Generacion de trayectorias de solucion paso a paso utilizables como datos de destilacion on-policy para un modelo alumno.
- Modo profesor: producir respuestas que actuan como objetivo de entrenamiento dentro del pipeline de OPD de 32 entornos.
- Soporte de tool calling / function calling: no verificado en esta model card; el modelo base Qwen2.5-Instruct lo soporta, pero no hay confirmacion para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas; solo se declara ingles.
- Capacidades especiales (modo thinking, vision, audio): no documentadas; no se declara ninguna.
- Alineacion de seguridad especifica: no documentada (se conserva la del modelo base).

## Casos de uso

- Destilacion on-policy: el uso principal. Se ejecuta el profesor sobre instancias de `MaximumWeightMatching`, se recogen sus trazas y se entrena un alumno con esos datos, aprovechando que el profesor fue optimizado especificamente en ese entorno.
- Investigacion en RL con entornos verificables: sirve como referencia reproducible para estudiar GRPO sobre tareas con recompensa programatica, ya que el run de W&B y el codigo de entrenamiento son publicos.
- Generacion de datasets sinteticos de problemas de matching: el modelo puede producir soluciones etiquetadas que se filtran despues por un verificador para construir corpus de entrenamiento.
- Reproduccion y ablacion de experimentos: al ser un profesor por entorno, permite comparar el efecto de entrenar 1, 8 o 32 profesores especializados frente a un profesor generalista.
- Baseline en evaluaciones de destilacion: mide cuanto del comportamiento del profesor hereda realmente el alumno en un dominio acotado y con verificador objetivo.
- Prototipado local de bajo coste: con ~1,5 B de parametros se puede ejecutar en una GPU de consumo para inspeccionar cualitativamente su comportamiento antes de escalar el pipeline.
- Fine-tuning posterior sobre dominio especifico: al estar bajo licencia Apache 2.0, se puede usar como punto de partida para SFT en tareas de optimizacion combinatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de tasa de exito en `MaximumWeightMatching`. El unico dato de rendimiento trazable es la referencia al run de W&B `8eccd321` del grupo `opd-teachers-20260927-191939`, donde podrian consultarse las curvas de recompensa del entrenamiento, pero no se proporcionan valores numericos en el material disponible.

## Requisitos de hardware

- VRAM para los pesos en BF16: aproximadamente 3,1-3,5 GB, calculado a partir de 1.543.714.304 parametros a 2 bytes por parametro.
- VRAM total en inferencia: del orden de 4-6 GB con cache KV para contextos moderados; se recomienda un minimo de 8 GB para trabajar con comodidad.
- Cabe en GPU de consumo: si. Ejemplos viables: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, e incluso tarjetas de 6-8 GB con cuantizacion.
- GPU de datacenter: A100, H100 o L40S son sobredimensionadas para este tamano y solo se justifican si se ejecuta en lote para generar grandes volumenes de trazas.
- Despliegue: `transformers` de forma nativa (es la libreria declarada y el tag `text-generation-inference` esta presente); tambien vLLM o TGI para servir en lote con throughput alto. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que no se publican cuantizaciones.
- Cuantizacion: no hay GGUF ni AWQ/GPTQ oficiales. Una conversion a 8 bits dejaria los pesos en torno a 1,6 GB y a 4 bits en torno a 0,9 GB, lo que permitiria ejecucion en CPU o en GPUs integradas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-MaximumWeightMatching-step149 | 1,54 B | No especificado (base: 32.768) | Profesor RL para MaximumWeightMatching | apache-2.0 | Hugging Face, safetensors |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Asistente generalista multilingue | apache-2.0 | Hugging Face, safetensors, GGUF de terceros |
| Otros profesores de la coleccion RLVE OPD Teachers | 1,5 B por entorno | No especificado | Un entorno distinto cada uno | apache-2.0 (segun la coleccion) | Hugging Face |
| Modelos generalistas de ~1,5 B con RL (por ejemplo, destilados de razonamiento de la misma escala) | ~1,5 B | No disponible | Razonamiento general | No disponible | No disponible |

La comparacion relevante no es de rendimiento generalista, sino de proposito: frente al Qwen2.5-1.5B-Instruct original, este checkpoint ha visto 150 actualizaciones de GRPO en un unico entorno, de modo que se espera una mejora en ese dominio y un posible deterioro en capacidades generales no medidas. No se dispone de datos publicados de otros profesores comparables mas alla de la propia coleccion.

## Limitaciones y advertencias

- Especializacion extrema: el refuerzo se aplico sobre un unico entorno (`MaximumWeightMatching`, dificultad 0) durante 150 pasos; fuera de ese dominio no hay garantia de comportamiento mejor que el modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento ni en el entorno de entrenamiento ni en tareas generales.
- Deterioro potencial del modelo base: el ajuste con RL sobre una tarea estrecha puede degradar capacidades generales de conversacion, instruccion y multilingueismo no evaluadas aqui.
- Riesgo de alucinacion: como cualquier modelo de 1,5 B, puede producir soluciones de matching plausibles pero incorrectas; en un pipeline de destilacion es imprescindible filtrar las trazas con un verificador del entorno.
- Idioma: solo se declara ingles (`en`); no se garantiza un rendimiento util en castellano.
- Contexto no documentado: no se especifica en la model card una longitud de contexto propia, por lo que conviene asumir la del modelo base y verificarla en la configuracion antes de usarla en produccion.
- Artefacto de investigacion: no esta pensado como modelo de produccion; no se documentan evaluaciones de seguridad, sesgos ni robustez adversarial.
- Licencia: apache-2.0 permite uso comercial, pero se incluye el `LICENSE` original de Qwen, cuyos terminos deben revisarse y respetarse.
- Denominacion del checkpoint: `step149` es el indice basado en cero de la actualizacion 150; conviene no confundirlo con un checkpoint intermedio.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad en el momento de redactar esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-MaximumWeightMatching-step149
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/8eccd321
- Codigo de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Paper de referencia: https://arxiv.org/abs/2511.07317
- Perfil del autor: https://huggingface.co/davidheineman
- Sitio web del autor: https://davidheineman.com/
