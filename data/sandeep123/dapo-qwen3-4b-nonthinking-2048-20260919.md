# sandeep123/dapo-qwen3-4b-nonthinking-2048-20260919

## Resumen

`sandeep123/dapo-qwen3-4b-nonthinking-2048-20260919` es un adaptador LoRA de investigación entrenado mediante aprendizaje por refuerzo sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Lo desarrolla el usuario sandeep123 y su propósito no es ofrecer un modelo de producción, sino documentar una reproducción controlada y auditable del algoritmo DAPO (Decoupled Clip and Dynamic sAmpling Policy Optimization) a escala reducida. El adaptador se aplica sobre un transformer denso de 4.000 millones de parámetros y se publica como un artefacto PEFT de rango 16 y alpha 32, con un tamaño de repositorio de 0,3 GB.

El interés técnico del artefacto reside en su trazabilidad extrema: la model card publica el commit exacto del framework de entrenamiento (volcengine/verl, commit `ed498f9...`), los hiperparámetros de DAPO (clip_low 0,2; clip_high 0,28; dual_clip 10,0), la receta de recompensa, el esquema de filtrado dinámico de grupos y la política de retención de checkpoints. Cada actualización del optimizador queda archivada como un adaptador individual bajo rutas inmutables `checkpoint-NNNNNN/`, lo que permite reproducir el entrenamiento paso a paso y verificar la continuidad mediante manifiestos SHA256.

Se trata de un modelo orientado a matemáticas y razonamiento, entrenado con evaluación estricta de respuestas enteras y sin modo "thinking" (`enable_thinking=False`). El autor advierte explícitamente de que no es una reproducción exacta del artículo original (usa un coeficiente KL de 0,01 frente al 0,0 del paper) y que no formula ninguna afirmación de rendimiento. El checkpoint actualmente seleccionado como principal es `checkpoint-000001`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B-Instruct-2507) con adaptador LoRA r=16/alpha=32 |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B); el adaptador LoRA es un subconjunto adicional de pesos |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; el entrenamiento de RL uso un contexto de 8192 tokens |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors; la cuantizacion depende del modelo base y de la herramienta de despliegue) |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3-4B-Instruct-2507) |
| Licencia | No disponible (el adaptador no declara licencia; el modelo base Qwen3-4B-Instruct-2507 se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA), con tokenizer, configuracion portable del modelo base, metadatos y manifiestos SHA256 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 montado sobre un transformer denso de la familia Qwen3 (versión Instruct-2507, revisión del modelo base fijada en el commit `cdbee75f17c01a7cc42f958dc650907174af0554`). Los objetivos LoRA cubren las proyecciones de atención q/k/v/o y las proyecciones del MLP gate/up/down, con dropout 0. El entrenamiento se realizó con PEFT sobre el framework veRL, con un esquema de cuatro GPU para el aprendiz y cuatro GPU para el muestreador, usando la misma partición de 2048 preguntas empleada en otras comparaciones del autor.

La innovación metodológica es la aplicación controlada de DAPO con recorte asimétrico (clip_low 0,2 y clip_high 0,28), cotas de ratio [0,8; 1,28], doble recorte a 10.0 y filtrado dinámico con relleno de grupos de corrección mixta (se conservan grupos donde `0 < suma(correctas) < tamano_grupo`). La recompensa combina una señal de corrección (`2 * acierto - 1` con oráculo entero verificado y `finish_reason=stop`) con una penalización suave de sobrelongitud basada en una fracción de caché del 20 %. La ventaja se normaliza por grupo y la pérdida se reduce mediante la media global de tokens de respuesta reales, con compensación DDP por world_size. Se usa un coeficiente KL fijo de 0,01 contra la base congelada (frente al 0,0 del artículo original), optimizador AdamW con LR 2e-5, warmup lineal de 10 actualizaciones y posterior tasa constante. Cada prompt genera ocho respuestas (512 por actualización) y el presupuesto total es de 128 actualizaciones, equivalentes a cuatro épocas de 2048 grupos aceptados de tamano 64.

## Capacidades

- Generacion de texto en el dominio de matematicas y razonamiento, con salida de respuesta entera verificable.
- Razonamiento de un solo paso sin modo "thinking": el tokenizer debe renderizarse con `enable_thinking=False` en inferencia, segun indica el autor.
- Resolucion de problemas matematicos con verificacion estricta de la respuesta final.
- Aprendizaje por refuerzo optimizado: el artefacto demuestra un pipeline DAPO reproducible con LoRA, no capacidades nuevas de producto.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada (dependen del modelo base).
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el modo thinking esta explicitamente desactivado en el entrenamiento.

## Casos de uso

- Reproduccion de investigacion en RL para LLM: el adaptador permite auditar paso a paso el efecto del recorte asimetrico de DAPO sobre un modelo de 4B, ya que cada actualizacion del optimizador queda archivada en una ruta inmutable con manifiestos SHA256. Es adecuado para estudiar la estabilidad del entrenamiento y el filtrado dinamico.
- Estudio de ajuste fino eficiente con LoRA: sirve como referencia de configuracion (r=16, alpha=32, targets q/k/v/o y gate/up/down, dropout 0) para quienes quieran entrenar adaptadores de bajo rango sobre Qwen3-4B.
- Analisis de recompensas para matematicas: la receta de recompensa de correccion mas penalizacion suave de longitud puede reutilizarse para experimentar con funciones de recompensa en tareas de respuesta entera.
- Comparativas controladas de hiperparametros: al publicar el coeficiente KL aplicado (0,01) frente al del articulo (0,0), permite aislar el efecto de la regularizacion KL en un presupuesto fijo de 128 actualizaciones.
- Evaluacion de la continuidad de checkpoints: el pipeline `latest-resume/` con `RESUME.md` y `verify_resume.py` es util para probar estrategias de reanudacion de entrenamiento con estados RNG y del optimizador.
- Docencia de arquitecturas de RLHF/RLVR: por su escala reducida y su documentacion exhaustiva, resulta apropiado como material didactico para entender DAPO frente a PPO o GRPO en un coste de computo moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica que el artefacto "makes no performance claim" (no formula ninguna afirmacion de rendimiento) y que no es una reproduccion exacta de la escala ni de la receta del articulo original.

## Requisitos de hardware

- El adaptador LoRA en si ocupa una fraccion minima (repositorio de 0,3 GB); el coste real lo determina el modelo base Qwen3-4B-Instruct-2507.
- VRAM estimada para inferencia: aproximadamente 8-9 GB en FP16/BF16 para el modelo base de 4B; en torno a 3-4 GB con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090, especialmente con cuantizacion de 4 u 8 bits.
- GPU recomendadas para entrenamiento de RL de este tipo: el autor uso cuatro GPU de aprendiz y cuatro de muestreo; para reproducir el pipeline se necesitan GPUs de datacenter como A100 o H100, aunque el ajuste LoRA aislado puede ejecutarse en GPUs de menor VRAM.
- Opciones de despliegue: por ser un adaptador PEFT, requiere cargar el modelo base con la libreria `peft` y el checkpoint elegido; el modelo fusionado puede servirse con vLLM, TGI, llama.cpp u Ollama tras la conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dapo-qwen3-4b-nonthinking-2048-20260919 | 4B (base) + LoRA r16 | No disponible (entrenamiento a 8192) | Adaptador LoRA DAPO para matematicas, sin thinking | No disponible | HuggingFace (repo de 0,3 GB) |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | No disponible en esta ficha | Modelo base instruct de proposito general | Apache 2.0 | HuggingFace |
| Otros adaptadores DAPO/GRPO de la misma familia | No disponible | No disponible | Ajuste por RL sobre Qwen3 | No disponible | No disponible |

La comparacion con alternativas especificas de la misma categoria no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de produccion: el autor lo describe como una comparacion controlada y advierte de que no constituye una reproduccion exacta del articulo de DAPO.
- Rendimiento no verificado: no hay resultados de benchmarks publicados y el autor renuncia expresamente a formular afirmaciones de rendimiento.
- Riesgo de alucinacion: inherente a los modelos de lenguaje del tamano del base; no se documenta mitigacion especifica.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredarian los del modelo base Qwen3-4B-Instruct-2507.
- Limitaciones de contexto e idioma: no se documentan en la ficha; el entrenamiento uso 8192 tokens de contexto y el modo thinking esta desactivado, por lo que no debe esperarse comportamiento de razonamiento extendido.
- Restricciones de licencia: el adaptador no declara licencia propia; para uso comercial debe comprobarse la licencia del modelo base (Qwen3-4B-Instruct-2507 se distribuye bajo Apache 2.0).
- Consumo de computo no acotado: el muestreo dinamico genera candidatos adicionales que se archivan, de modo que el computo y la exposicion a datos superan a los de las lineas base de presupuesto fijo.
- Checkpoint parcial: la finalizacion se representa unicamente mediante `checkpoint_index.json`; el checkpoint seleccionado por defecto es `checkpoint-000001`, no necesariamente el mejor.
- Dependencia de versiones: para reproducir o reanudar el entrenamiento hay que mantener la misma fuente cientifica, el hash del dataset y las versiones de runtime, ademas de renderizar el tokenizer con `enable_thinking=False`.
- Fechas del identificador: el artefacto esta etiquetado con fechas de 2026, lo que conviene verificar antes de tratarlo como un modelo ya validado.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/sandeep123/dapo-qwen3-4b-nonthinking-2048-20260919
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del framework de entrenamiento citado (veRL): https://github.com/volcengine/verl (commit `ed498f9fa5c726a6fb46b19bc59c5c33970053c7`)
- Paper de DAPO: no disponible en la informacion proporcionada
- Demos u otros recursos: no disponibles. Las busquedas web realizadas no devolvieron resultados relacionados con el modelo.
