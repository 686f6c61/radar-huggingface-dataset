# iclropen/evidence-audit-qwen7b-pc-a05-timestamp-tokens-only-s0

## Resumen

`evidence-audit-qwen7b-pc-a05-timestamp-tokens-only-s0` es un adaptador LoRA (PEFT) entrenado sobre el modelo base multimodal `Qwen/Qwen2.5-VL-7B-Instruct`. Lo publica el usuario `iclropen` como material complementario de un articulo en revision para ICLR 2027 titulado *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*. No es un modelo generativo de proposito general, sino un artefacto de investigacion orientado a una tarea muy concreta: la localizacion temporal de evidencias en video (video temporal grounding) sobre el conjunto de datos Charades-STA.

El adaptador modifica unicamente el modelo de lenguaje del Qwen2.5-VL-7B-Instruct, no la torre de vision. Su objetivo de entrenamiento introduce un control de placebo: penaliza que el modelo dependa de ediciones del video ajenas al intervalo anotado, de modo que la prediccion de marcas temporales se base en la evidencia visual real y no en atajos espurios. El entrenamiento se realiza con margenes puntuados exclusivamente sobre los tokens de marca temporal (timestamp tokens), de ahi el sufijo del nombre.

El interes practico es acotado pero relevante para quien investigue robustez y fidelidad de modelos de video: el repositorio incluye un script de autocomprobacion que detecta un fallo silencioso de carga entre versiones de transformers (4.51 frente a 5.x), un problema real que deja los pesos LoRA sin aplicar sin lanzar error. La licencia es Apache 2.0 y el tamano del repositorio es de 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Qwen2.5-VL (torre de vision ViT + modelo de lenguaje); solo se modifican modulos del LM |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen2.5-VL-7B-Instruct tiene 7 mil millones (dato del nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible; los pesos del adaptador se distribuyen en safetensors (bfloat16 segun el codigo de carga) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, PEFT); tamano 190.435.728 bytes |
| Rango LoRA (r) | 16 |
| `lora_alpha` | 32 |
| Dropout LoRA | 0,05 |
| Modulos objetivo | q/k/v/o/gate/up/down_proj |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |
| Version de transformers | 4.51.x (probado con 4.51.3) |
| Version de peft | 0.20 |
| sha256 del adaptador | `4d21a78d15b9ecca3e8ecfe16a192b17fd981bfaa0998f4841d12a36ef0d61c6` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre la arquitectura Qwen2.5-VL, un transformer multimodal compuesto por una torre de vision y un modelo de lenguaje. Segun la model card, los entrenamientos con transformers 4.51 utilizaron gradient checkpointing, lo que hizo que la LoRA de la torre de vision no recibiera gradiente: sus matrices `lora_B` son todas cero. Por tanto, este adaptador cambia exclusivamente el modelo de lenguaje y no altera la representacion visual del modelo base.

El objetivo de entrenamiento corresponde a la Seccion 4 del articulo y combina tres terminos: una perdida NLL sobre el video limpio ponderada por alpha=0,5; terminos de margen sobre las ediciones de evidencia y de placebo, con escala beta=0,1; y un termino hinge que acota la caida de rendimiento en el placebo. Se emplean pesos de operador mediante Group-DRO. Los datos son 2.400 pares de entrenamiento de Charades-STA (primeras lineas de `data_ids/training_pairs_pool_8434.jsonl`), con 300 pasos de optimizador, semilla 0, tasa de aprendizaje 5e-6 y acumulacion de gradiente de 8. Los operadores de edicion usados en entrenamiento son swap, mask, blur, tshift y shuffle, aplicando dos por ejemplo. La entrada de video se muestrea a 2 fps con un maximo de 768 fotogramas, con estilo de prompt `timer1_default` y respuesta `timer1`, y orden de mensajes video primero y texto despues. El entrenador es `code/27_papo_train_qcdro_v3seln_tsonly.py`.

## Capacidades

- Localizacion temporal de evidencias en video: predice marcas temporales (timestamps) dentro de un video dado un texto de consulta, sobre el formato de Charades-STA.
- Dependencia de evidencia controlada: el objetivo de placebo busca que la respuesta cambie cuando se altera la evidencia real y no cuando se altera una region fuera del intervalo anotado.
- Hereda del modelo base Qwen2.5-VL-7B-Instruct las capacidades multimodales generales (vision y lenguaje), si bien el adaptador solo modifica el LM.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Auditoria de fidelidad de modelos de video temporal grounding: usar el adaptador junto con los scripts de auditoria del repositorio de codigo (`--model  --adapter <folder>`) para medir la auditoria de verosimilitud y la auditoria conductual descritas en el articulo.
- Investigacion sobre atajos espurios en modelos multimodales: comparar el modelo base frente a este adaptador para cuantificar cuanto depende la prediccion de la evidencia visual real, gracias al diseno de placebo controlado.
- Reproducibilidad de resultados de un articulo en revision: el repositorio fija versiones de transformers (4.51.3) y peft (0.20), semilla 0 y hash sha256 del adaptador, lo que permite reproducir el entrenamiento y la evaluacion.
- Evaluacion de robustez ante perturbaciones de video: los operadores swap, mask, blur, tshift y shuffle permiten construir pruebas de estres sobre el modelo y observar si las marcas temporales se desplazan de forma indebida.
- Docencia y formacion en tecnicas PEFT: el adaptador es un ejemplo compacto (190 MB) de LoRA con modulos objetivo definidos, util para ilustrar el entrenamiento con objetivos de margen y Group-DRO.
- Deteccion de fallos de carga silenciosos en pipelines PEFT: el script de autocomprobacion incluido sirve como plantilla para verificar que los tensores LoRA se han aplicado realmente al modelo, evitando evaluaciones invalidas por incompatibilidad de versiones de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 190.435.728 bytes (unos 0,19 GB) y debe cargarse junto con el modelo base Qwen2.5-VL-7B-Instruct, que determina el grueso de los requisitos.
- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Como referencia de orden de magnitud, un modelo de 7 mil millones de parametros en bfloat16 requiere aproximadamente 14 GB solo para pesos, mas el coste de la torre de vision y de las activaciones.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada; depende de la cuantizacion del modelo base, que no se documenta para este adaptador.
- Opciones de despliegue: la model card documenta la carga con `transformers==4.51.3` y `peft==0.20.0` mediante `Qwen2_5_VLForConditionalGeneration` y `PeftModel.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota critica: cargar el adaptador con transformers 5.x no lanza error pero deja los pesos LoRA sin cargar; es obligatorio usar 4.51.x y ejecutar el script de autocomprobacion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores LoRA para video temporal grounding sobre Charades-STA) ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El adaptador solo modifica el modelo de lenguaje; la torre de vision no se entrena (matrices `lora_B` a cero por el gradient checkpointing), por lo que no cabe esperar mejoras en la representacion visual.
- Es un artefacto de investigacion asociado a un articulo en revision (ICLR 2027); su validacion externa es limitada y no hay resultados de benchmarks publicados en la informacion disponible.
- Riesgo de fallo silencioso de carga: con transformers 5.x los pesos LoRA no se aplican y el modelo se comporta como el base sin avisar. Es imprescindible ejecutar la autocomprobacion incluida.
- Ambito de tarea restringido: el entrenamiento se limita a 2.400 pares de Charades-STA, con 300 pasos de optimizador y una sola semilla; la generalizacion a otros dominios o conjuntos de datos no esta documentada.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; al tratarse de un modelo de lenguaje sobre video, la generacion de marcas temporales no sustentadas en evidencia es un riesgo plausible que el objetivo de placebo intenta mitigar, pero no se aportan metricas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto o idioma: no disponibles; los idiomas soportados no se declaran.
- Licencia Apache 2.0: permite uso comercial segun los terminos de dicha licencia, pero el modelo base Qwen2.5-VL-7B-Instruct tiene sus propias condiciones que deben respetarse.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a05-timestamp-tokens-only-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de codigo del articulo: https://huggingface.co/iclropen/evidence-audit-code
- Articulo: Anonymous, *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission, under review (sin enlace disponible en la informacion proporcionada)
