# csminion/apex-qwen36-asi

## Resumen
APEX Scientific Python r16 es un adaptador LoRA de tipo PEFT desarrollado por el usuario csminion, diseñado para especializar el modelo multimodal Qwen/Qwen3.6-35B-A3B en tareas de programación científica en Python (uso de librerías y funciones del ecosistema científico). No se distribuyen los pesos completos del modelo base: el repositorio contiene únicamente el adaptador (0,1 GB, 620 tensores FP32 en 310 módulos, 21.166.080 parámetros).

El adaptador se entrena sobre trayectorias humanas de referencia extraídas de ScienceAgentBench, DS-1000 y SciCode, con el objetivo de mejorar la generación de programas y completados de librería en contextos de agentes científicos. La receta nativa fuerza el modo no-thinking (`enable_thinking=false`) y elimina bloques de razonamiento ocultos, conservando explicaciones visibles y observaciones de herramientas.

Su relevancia actual es limitada y de carácter experimental: todas las puntuaciones formales de benchmark están pendientes, el repositorio registra 0 descargas y 0 likes, y la propia model card advierte de que no se ofrece ninguna garantía de rendimiento o corrección. Debe tratarse como un artefacto de investigación, no como un modelo listo para producción.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer MoE multimodal; modelo base Qwen/Qwen3.6-35B-A3B |
| Parametros totales | 21.166.080 parametros (620 tensores FP32 en 310 modulos; archivo safetensors de 84.760.832 bytes) |
| Parametros activos | No aplica al adaptador; el base es un MoE con 3B activos segun la nomenclatura A3B del nombre |
| Longitud de contexto | 65.536 tokens de contexto total y 8.192 tokens de salida (protocolo del proyecto) |
| Tipos de cuantizacion | No disponible (el adaptador se exporta en FP32; la cuantizacion del base no se especifica) |
| Idiomas soportados | No disponibles |
| Licencia | apache-2.0-adapter-contributions-plus-upstream-notices (etiquetada como `other`) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT; no incluye pesos base) |

## Arquitectura y entrenamiento
El adaptador es un LoRA estandar (sin DoRA ni RS-LoRA) con `r=16`, `lora_alpha=32`, escalado `alpha/r=2`, dropout 0,05, `bias=none`, tipo de tarea `CAUSAL_LM` y sin `modules_to_save`. Los modulos objetivo son las proyecciones de self-attention del modelo de lenguaje (q/k/v/o), las proyecciones de linear-attention (`in_proj_qkv`, `in_proj_z`, `in_proj_b`, `in_proj_a`, `out_proj`) y el shared-MLP (gate/up/down). El router, los pesos de expertos enrutados, el encoder visual y el aligner permanecen congelados. El checkpoint seleccionado es el 128, correspondiente al minimo de perdida de validacion nativo, con 134 pasos de optimizador completados.

El entrenamiento se ejecuto en 2 GPU H100 con acumulacion de gradiente 4 y batch global 8, un unico epoch de SFT, AdamW (`adamw_torch`), learning rate 1e-4, decaimiento coseno, warmup 0,03, weight decay 0,1, gradient checkpointing, DeepSpeed ZeRO-3, SDPA y Liger. Las semillas fueron 20261016. Se desactivo el empaquetado y el modo padding-free; se activo el agrupamiento por longitud y se eliminaron (no truncaron) las secuencias que superaban los 65.536 tokens. Los datos de entrenamiento proceden de ScienceAgentBench verified (82 filas), DS-1000 (976 filas) y SciCode validation (15 filas), sumando 1.073 filas de entrenamiento y 20 filas fijas de validacion SFT.

## Capacidades
- Generacion de programas cientificos en Python y completados de libreria, orientados a funciones del ecosistema cientifico.
- Soporte multimodal heredado del base (pipeline `image-text-to-text`); el encoder visual y el aligner estan congelados, por lo que la adaptacion no altera la comprension visual.
- Modo no-thinking forzado en la receta nativa (`enable_thinking=false`, `preserve_thinking=false`, `add_non_thinking_prefix=true`); se eliminan los campos de razonamiento oculto y los bloques `<think>` iniciales cerrados.
- Conservacion de explicaciones visibles, observaciones de herramientas y campos de analisis/plan de Terminal.
- Uso en flujos de agentes cientificos con llamadas a herramientas (observaciones de herramientas retenidas en los datos de entrenamiento).
- Capacidad multilingue: no disponible (la model card no declara idiomas soportados).
- Capacidades de tool calling / function calling genericas: no declaradas explicitamente para el adaptador.

## Casos de uso
- Completado de codigo cientifico en editores: el adaptador se aplica sobre el base para sugerir llamadas a librerias cientificas (NumPy, SciPy, pandas, etc.) en el punto de cursor, aprovechando las 976 filas de DS-1000 centradas en completados de libreria.
- Agentes de resolucion de tareas cientificas: integrado en un bucle de agente con terminal y observaciones de herramientas, el adaptador puede generar y refinar programas Python de multiples pasos para tareas de tipo ScienceAgentBench.
- Reproduccion de flujos de trabajo con datos tabulares: util para pipelines que requieren transformacion y analisis de datos con librerias, dado el sesgo del dataset hacia completados de funciones.
- Asistencia a investigacion en notebooks: generacion de fragmentos de codigo para experimentos, con contexto de hasta 65.536 tokens que permite mantener el estado de un notebook extenso en la ventana.
- Evaluacion comparativa de tecnicas de ajuste: al ser un adaptador con configuracion LoRA documentada (r=16, targets especificos), sirve como referencia reproducible para estudiar el efecto del fine-tuning selectivo sobre un MoE.
- Prototipado de herramientas de analisis cientifico asistido por IA: base para experimentos de investigacion sobre agentes que combinan vision (imagenes de graficos o tablas) y codigo Python, gracias al pipeline image-text-to-text heredado.
- Formacion de subconjuntos de tareas DS-1000/SciCode: util para estudiar transferencia entre benchmarks de codigo cientifico en entornos de investigacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que "all formal benchmark scores remain pending completion" y que las ejecuciones incompletas y las perdidas de validacion SFT no constituyen puntuaciones finales. Los protocolos de evaluacion planificados (no ejecutados) son:

| Evaluacion | Protocolo declarado |
|---|---|
| SWE | Pro V2 HARD-51, mini-swe-agent 2.4.6 bloqueado, presupuesto de 30 minutos, replay de parches |
| Terminal | 89 tareas x 5 semillas, Terminus 2, 30 minutos, 4 CPU / 8 GiB |
| HLE | 2.500 preguntas (342 con imagen), sin herramientas, 300 s por pregunta, juez DeepSeek-V4-Flash |
| ASI | 60 tareas publicas x B1-B4, semilla oficial 31415, DirectLLM nativo, 4 CPU / 8 GiB, 1.200 s |

Ninguno de estos resultados esta finalizado a fecha del artefacto publicado.

## Requisitos de hardware
- Entrenamiento documentado: 2 GPU H100, DeepSpeed ZeRO-3, gradient checkpointing, SDPA y Liger.
- Inferencia: requiere cargar el modelo base Qwen/Qwen3.6-35B-A3B (35B parametros totales, 3B activos) mas el adaptador. El adaptador por si solo no es utilizable sin el base.
- VRAM estimada del base: en BF16 el base de 35B ronda los 70 GB de pesos, por lo que necesita multiples GPU profesionales (A100 80 GB, H100 80 GB). En cuantizacion de 4 bits es previsible que se situe en torno a 18-20 GB, lo que permitiria ejecutarlo en una RTX 4090 (24 GB) o GPU consumer de gama alta similares, aunque este dato no se confirma en la informacion disponible.
- GPU recomendadas para el base en precision completa: A100 80 GB, H100 80 GB (multiples unidades).
- GPU consumer: el base en cuantizacion agresiva podria caber en RTX 4090, pero "no disponible" una confirmacion oficial.
- Opciones de despliegue: al ser un adaptador PEFT, es compatible con stacks que soportan LoRA sobre el base (por ejemplo vLLM), pero no se documentan en la ficha despliegues validados con llama.cpp, Ollama, TGI u otros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye comparaciones cuantitativas con otros adaptadores ni modelos, y las puntuaciones de benchmark del propio modelo estan pendientes. Como referencia contextual, el modelo base es Qwen/Qwen3.6-35B-A3B (MoE multimodal de 35B parametros totales y 3B activos), pero no se ofrecen datos comparativos con alternativas de la misma categoria.

## Limitaciones y advertencias
- Todos los resultados formales de benchmark estan pendientes; la ficha no ofrece ninguna garantia de rendimiento ni de correccion.
- El adaptador se entreno con DS-1000 test y SciCode validation reutilizados explicitamente para entrenamiento, por lo que no son evaluaciones held-out validas.
- La descontaminacion se limito a coincidencias de 13-gramas sobre entradas publicas (se excluyeron 24 variantes de DS-1000 en 6 familias); no es una garantia completa de descontaminacion semantica ni de linaje.
- Las 991 filas auxiliares ensenan principalmente uso de funciones y librerias, no 991 entornos de ejecucion cientifica nuevos; no se reclama cualificacion de correccion o ejecucion.
- No se incluyeron soluciones sinteticas de reemplazo ni filas EcoCoder.
- Las secuencias que superaban 65.536 tokens se eliminaron en lugar de truncarse, lo que puede sesgar el entrenamiento contra contextos muy largos.
- El modo thinking esta desactivado en la receta nativa; el adaptador no esta ajustado para razonamiento explicito oculto.
- Idiomas soportados: no disponible; se desconoce el comportamiento multilingue real del adaptador.
- Licencia `other` (apache-2.0-adapter-contributions-plus-upstream-notices): es necesario revisar los terminos del archivo LICENSE y las obligaciones de atribucion del modelo base antes de cualquier uso comercial.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (16 de octubre de 2026): artefacto reciente sin validacion externa por la comunidad.
- El tamanio del repo es de 0,1 GB, consistente con un adaptador LoRA; no contiene los pesos base, imprescindibles para la inferencia.

## Enlaces
- HuggingFace del adaptador: https://huggingface.co/csminion/apex-qwen36-asi
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Revision congelada del base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/tree/995ad96eacd98c81ed38be0c5b274b04031597b0
- Dataset ScienceAgentBench verified: https://huggingface.co/datasets/osunlp/ScienceAgentBench/tree/9c6e96c9e74572e979b0930ee735041cef528cb7
- Dataset DS-1000: https://github.com/xlang-ai/DS-1000/blob/b39aab71da6d23ef8d3cac59a7c5f834516ab334/data/ds1000.jsonl.gz
- Dataset SciCode validation: https://huggingface.co/datasets/SciCode1/SciCode/blob/4510f6a6aa27c43fad7b43da2c59602a86e88480/problems_dev.jsonl
