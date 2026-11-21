# jinzijie-bupt/evidence-audit-qwen7b-pc-a05-s0

## Resumen

`evidence-audit-qwen7b-pc-a05-s0` es un adaptador LoRA desarrollado por jinzijie-bupt sobre el modelo base Qwen2.5-VL-7B-Instruct. No se trata de un modelo independiente, sino de un ajuste fino orientado a una tarea concreta: el anclaje temporal de eventos en vídeo (video temporal grounding) sobre el conjunto de datos Charades-STA. Su relevancia radica en que acompana a la publicacion academica "Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding", en la que se propone un objetivo de entrenamiento controlado con placebo para que el modelo dependa de la evidencia visual real y no de atajos estadisticos.

El adaptador se entrena con un objetivo que combina la verosimilitud de la respuesta anotada con dos margenes por cada operador de edicion aplicado al video, de modo que la respuesta correcta sea mas probable en el video limpio y en uno con una edicion placebo fuera del evento que en el video con el evento manipulado. Este diseno busca medir y mejorar la dependencia de la evidencia, un problema poco tratado en la literatura de grounding temporal.

Al ser un adaptador LoRA sobre Qwen2.5-VL-7B-Instruct, hereda la arquitectura, el contexto y las capacidades multimodales del modelo base, y su licencia es Apache 2.0. El repositorio ocupa 0,6 GB e incluye los pesos del adaptador en formato safetensors, ademas de variantes para distintas versiones de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen2.5-VL-7B-Instruct |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Rango LoRA | r=16, alpha=32, dropout 0.05 |
| Modulos adaptados | q/k/v/o y gate/up/down |
| Tamano del repo | 0,6 GB |
| Version de transformers | 4.51.3 (raiz) y 5.x (subcarpetas `transformers-v5/` y `run-b/`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa video a 2 fps con un maximo de 768 fotogramas. El ajuste LoRA congela los pesos del modelo base e introduce matrices de bajo rango (r=16, alpha=32, dropout 0.05) en las proyecciones de atencion q/k/v/o y en las proyecciones gate/up/down del bloque MLP. Segun la model card, los adaptadores entrenados con transformers 4.51 no actualizan los pesos del vision tower (quedan a cero por el uso de gradient checkpointing), por lo que modifican unicamente el modelo de lenguaje.

El entrenamiento emplea el objetivo "placebo-controlled" descrito en la Seccion 4 del paper. Se parte de 2.400 pares de entrenamiento del split de entrenamiento de Charades-STA, con 300 pasos de optimizador, acumulacion de gradiente de 8, learning rate 5e-6 y semilla 0. Se aplican cinco operadores de edicion (swap, mask, blur, tshift, shuffle), dos por ejemplo, y se anade un termino hinge que limita la caida de verosimilitud bajo la edicion placebo a 1,25 veces la caida de referencia mas 0,10. Los pesos de los operadores se gestionan mediante Group-DRO. El trainer utilizado es `code/27_papo_train_qcdro_v3seln_r5.py`, con plantilla de prompt `timer1_default`. El parametro α es 0,5 y β es 0,1.

## Capacidades

- Anclaje temporal de eventos en video: localizacion de intervalos temporales que responden a una consulta textual, entrenado especificamente sobre Charades-STA.
- Razonamiento multimodal heredado del modelo base Qwen2.5-VL-7B-Instruct (comprension de imagen y video).
- Procesamiento de video a 2 fps con hasta 768 fotogramas por muestra.
- Generacion de texto y respuestas en formato de intervalo temporal.
- Capacidades multilingues y de tool calling: no documentadas especificamente para este adaptador (dependen del modelo base).
- Modo de pensamiento (thinking) y otras capacidades especiales: no documentadas en la informacion proporcionada.

## Casos de uso

- Investigacion en grounding temporal: reproduccion de los experimentos del paper para medir la dependencia de la evidencia en modelos de video temporal grounding, usando los scripts de evaluacion del repositorio de codigo.
- Auditoria de robustez ante ediciones de video: evaluacion de como cambia la respuesta del modelo cuando se aplican operadores como swap, mask, blur, tshift o shuffle sobre el video de entrada.
- Benchmark academico sobre Charades-STA: comparacion de la precision y de la dependencia de evidencia frente a otros adaptadores y modelos base en el conjunto de evaluacion.
- Estudio de sesgos de atajos estadisticos: analisis de si el modelo responde por correlacion superficial o por evidencia visual real, gracias al diseno placebo-controlled del entrenamiento.
- Desarrollo de sistemas de recuperacion de momentos en video: prototipado de busqueda semantica de intervalos en archivos de video para aplicaciones de analisis de contenido.
- Base para experimentos de ablation: punto de partida para variar α, β o los operadores de edicion y estudiar su efecto en la dependencia de evidencia.
- Reproducibilidad de resultados: verificacion de las tablas y figuras del paper mediante los identificadores de datos y scripts publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas y figuras del paper (Tablas 1, 3, 6-11, 13-17, 19-21, 23-30, 32-34, 37 y Figuras 1-5, 7, 11) para consultar las cifras, pero no se incluyen valores numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Al tratarse de un adaptador sobre un modelo de 7B, el requisito dominante es el del modelo base; en bfloat16 el modelo base requiere del orden de 14-16 GB solo para pesos, mas el coste de activaciones y del procesamiento de video.
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamano del modelo base, cabria esperar GPUs con 24 GB o mas (por ejemplo, RTX 4090, A100, H100), pero este dato no se confirma en la documentacion disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: la model card solo documenta carga mediante `transformers` (4.51.3 o 5.x) y `peft`, junto con `qwen-vl-utils`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-pc-a05-s0 | LoRA sobre 7B | No disponible | Video temporal grounding (Charades-STA) | Apache 2.0 | Hugging Face |
| Qwen2.5-VL-7B-Instruct (base) | 7B | No disponible en esta ficha | Multimodal general | Apache 2.0 | Hugging Face |
| Alternativas especificas de video temporal grounding | No disponible | No disponible | Video temporal grounding | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer una comparacion cuantitativa con otros adaptadores o modelos de la misma categoria.

## Limitaciones y advertencias

- El adaptador modifica unicamente el modelo de lenguaje: los pesos LoRA del vision tower son cero en la version entrenada con transformers 4.51, por lo que la adaptacion visual no existe.
- Incompatibilidad silenciosa entre versiones de transformers: cargar un adaptador guardado para 4.51 bajo transformers 5 (o viceversa) no produce error pero deja los pesos LoRA sin usar. Es necesario emplear la subcarpeta correspondiente y verificar la carga con `tools/check_lora_keys.py`.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares, 300 pasos), lo que limita su generalizacion a otros dominios de video o a otras tareas.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento multilingue especifico de este adaptador.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-VL-7B-Instruct tiene sus propias condiciones que deben respetarse.
- No se han publicado benchmarks ni metricas de latencia en la informacion disponible, por lo que no es posible avalar su uso en produccion sin evaluacion previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jinzijie-bupt/evidence-audit-qwen7b-pc-a05-s0
- Repositorio de codigo, datos y scripts de evaluacion: https://github.com/jinzijie-bupt/Accuracy-Is-Not-Evidence
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Paper citado: Jin, Zijie; Zhao, Shuai; Tao, Haoran; Huang, Chaomin; Luo, Liwen. "Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding". arXiv preprint, 2026 (sin enlace directo en la informacion proporcionada).
