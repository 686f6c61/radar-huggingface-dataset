# LoRAFleet/hifvla-libero-lora

## Resumen

LoRAFleet/hifvla-libero-lora es un conjunto de adaptadores LoRA publicados en Hugging Face por el usuario LoRAFleet, extraidos de los checkpoints del metodo HiF-VLA (Hindsight/Insight/Foresight motion representation). No es un modelo autonomo: contiene exclusivamente los adaptadores y las cabezas auxiliares de cuatro variantes por suite del benchmark LIBERO, y requiere los pesos base de openvla/openvla-7b para poder ejecutarse. El repositorio ocupa 4,9 GB e incluye, por cada suite, un adaptador LoRA (r=32, alpha=16) junto con action_head, motion_encoder, motion_manager y proprio_projector.

El problema que resuelve es de distribucion y reutilizacion: en lugar de obligar a descargar los checkpoints completos de HiF-VLA, ofrece los componentes entrenados en formato PEFT, lo que facilita el analisis de los adaptadores, su mezcla con el modelo base y la reproducion de la evaluacion en LIBERO. Es relevante para el ambito de la robotica y los modelos vision-language-action porque permite inspeccionar que aprende cada experto por suite (spatial, object, goal, long) sin arrastrar los pesos completos de 7.000 millones de parametros.

La licencia declarada es MIT y la libreria indicada es PEFT. Los metadatos de Hugging Face registran 0 descargas y 0 likes, y no se declaran idiomas soportados. La informacion disponible no incluye detalles sobre el dataset de entrenamiento, el numero de tokens ni la longitud de contexto del modelo resultante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en openvla/openvla-7b; adaptadores LoRA (PEFT) sobre OpenVLA-OFT, mas action_head y los modulos motion_encoder, motion_manager y proprio_projector |
| Parametros totales | no disponible para el repositorio (solo contiene adaptadores y cabezas, 4,9 GB); el modelo base openvla/openvla-7b tiene 7.000 millones de parametros segun su denominacion |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el script de evaluacion usa history_length 8) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors y las cabezas en .pt |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en la model card del repositorio); el modelo base puede tener condiciones propias |
| Formato de pesos | safetensors (lora_adapter/adapter_model.safetensors + adapter_config.json) y PyTorch .pt (action_head--checkpoint.pt, motion_encoder--checkpoint.pt, motion_manager--checkpoint.pt, proprio_projector--checkpoint.pt), mas ficheros de configuracion y tokenizer |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenVLA-7B, un modelo vision-language-action sobre el que se aplica el metodo OpenVLA-OFT (Optimized Fine-Tuning). Sobre esa base, HiF-VLA introduce una representacion de movimiento basada en tres componentes: Hindsight, Insight y Foresight. El repositorio no contiene los pesos del modelo base, sino unicamente los adaptadores LoRA por suite mas las cabezas especializadas que implementan esa representacion de movimiento. El metodo se asocia a CVPR 2026 y al arXiv 2512.09928, con codigo en el repositorio HiF-VLA del autor original.

Los adaptadores se configuran con rango 32 y alpha 16, y se han extraido de los checkpoints publicados por minnielin para cada suite de LIBERO. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO; en consecuencia, esos datos se consideran no disponibles. La evaluacion documentada es de bucle cerrado sobre LIBERO, con extraccion de vectores de movimiento mediante ffmpeg (la dependencia mvextractor es exclusiva del entrenamiento y su importacion debe protegerse).

## Capacidades

- Control robotico por instrucciones visuales y de lenguaje en tareas de manipulacion del benchmark LIBERO, en las cuatro suites cubiertas: spatial, object, goal y long.
- Representacion explicita del movimiento mediante los modulos motion_encoder y motion_manager, con extraccion de vectores de movimiento a partir de video.
- Integracion de informacion propioceptiva a traves de proprio_projector (la evaluacion se lanza con --use_proprio True).
- Entrada multimodal con dos imagenes por paso de inferencia (--num_images_in_input 2).
- Uso de historial temporal en la evaluacion, con history_length 8.
- Adaptacion por suite mediante LoRA independientes, lo que permite intercambiar el experto segun el tipo de tarea.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo de razonamiento explicito (thinking), vision o audio adicionales: no disponible.

## Casos de uso

- Reproduccion de resultados en LIBERO: cargando el adaptador de cada suite junto con los pesos base de openvla/openvla-7b y ejecutando run_libero_eval.py, se replican los porcentajes de exito declarados (100% en spatial y goal, 96% en object y long).
- Investigacion sobre representaciones de movimiento: los checkpoints de motion_encoder y motion_manager permiten estudiar como se codifican las componentes Hindsight, Insight y Foresight en tareas de manipulacion.
- Analisis de adaptacion PEFT en robotica: el repositorio permite comparar el comportamiento de un LoRA de rango 32 frente al fine-tuning completo de OpenVLA-OFT en las mismas condiciones de evaluacion.
- Estudios de transferencia entre suites: al disponer de cuatro adaptadores independientes para spatial, object, goal y long, se pueden medir diferencias de rendimiento y especializacion entre dominios de tarea.
- Base para ajuste adicional: al ser adaptadores PEFT sobre un modelo de 7.000 millones de parametros, sirven como punto de partida para nuevos entrenamientos con coste de computo reducido respecto al fine-tuning completo.
- Validacion de infraestructura de evaluacion robotica: el pipeline exige el repositorio HiF-VLA, LIBERO, un entorno OpenVLA-OFT/transformers fork, ffmpeg y av, por lo que el repositorio es util para montar y depurar ese stack.
- Prototipado en simulacion antes de trasladar politicas a hardware: las suites de LIBERO ofrecen un entorno controlado para comparar variantes antes de asumir el coste de un despliegue fisico (no se documenta validacion en robot real en la informacion disponible).

## Benchmarks y rendimiento

| Suite LIBERO | Repo de origen | LoRA (r/alpha) | Exito en bucle cerrado | Episodios |
|---|---|---|---|---|
| spatial | minnielin/hifvla-libero-spatial | 32 / 16 | 100% | 10 |
| object | minnielin/hifvla-libero-object | 32 / 16 | 96% | 50 |
| goal | minnielin/hifvla-libero-goal | 32 / 16 | 100% | 50 |
| long | minnielin/hifvla-libero-long | 32 / 16 | 96% | 50 |

Los datos proceden de la model card del autor y corresponden a exito en bucle cerrado medido. No se han publicado en la informacion disponible resultados de benchmarks de lenguaje o codigo (MMLU, HumanEval, GSM8K u otros), ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- El repositorio en si ocupa 4,9 GB en disco, correspondientes a los cuatro conjuntos de adaptadores y cabezas.
- VRAM estimada: al requerir los pesos base de openvla/openvla-7b, una inferencia en bf16 ronda los 15-16 GB solo en pesos, a lo que se suman el codificador visual, las activaciones y el historial de 8 pasos; una estimacion prudente es de 20-24 GB. Con cuantizacion de 4 bits la cifra bajaría a unos 5-6 GB. Estas cifras son estimaciones derivadas del tamano del modelo base, no datos publicados en la informacion disponible.
- GPU recomendadas: A100 (40 o 80 GB) y H100 para evaluacion sin restricciones de memoria; RTX 4090 (24 GB) y RTX 3090 (24 GB) como opciones de gama de consumo, ajustadas en el caso de bf16.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB de VRAM o mas, siempre que se gestione con cuidado el historial y el numero de imagenes de entrada.
- Opciones de despliegue: el pipeline documentado no usa vLLM, TGI, llama.cpp ni Ollama, sino el repositorio HiF-VLA junto con LIBERO y un entorno OpenVLA-OFT / transformers fork, ademas de ffmpeg y av para la extraccion de vectores de movimiento. El despliegue en servidores de inferencia generica de texto no es aplicable a este tipo de modelo.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoRAFleet/hifvla-libero-lora (este repositorio) | adaptadores sobre un base de 7B | no disponible | safetensors + .pt | MIT | publico en Hugging Face, 0 descargas |
| openvla/openvla-7b | 7.000 millones | no disponible | no disponible en esta ficha | no disponible | publico en Hugging Face, referenciado como base |
| Checkpoints HiF-VLA completos (minnielin/hifvla-libero-spatial, object, goal, long) | 7.000 millones mas cabezas | no disponible | no disponible | no disponible | publicos en Hugging Face, citados como origen |
| OpenVLA-OFT | 7.000 millones | no disponible | no disponible | no disponible | mencionado en la model card como metodo de ajuste |

No se dispone de datos de rendimiento comparativos entre estas alternativas mas alla de los porcentajes de exito por suite recogidos en la tabla de benchmarks.

## Limitaciones y advertencias

- No incluye los pesos del modelo base: es imprescindible descargar openvla/openvla-7b y mezclar o cargar los adaptadores para poder ejecutar el modelo.
- Los adaptadores son especificos por suite; no existe un unico adaptador que cubra spatial, object, goal y long a la vez.
- Los resultados declarados (96-100%) proceden de la propia model card y no se acompanan de una evaluacion independiente; ademas, la suite spatial solo se midio sobre 10 episodios, una muestra reducida.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso por terceros ni de validacion externa.
- No se declaran idiomas soportados, lo que impide garantizar el comportamiento con instrucciones en castellano.
- No se documentan sesgos conocidos, y el ambito de aplicacion (manipulacion robotica en LIBERO) limita el riesgo de sesgos de contenido similares a los de un modelo de lenguaje general.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en politica robotica el fallo se manifiesta habitualmente como acciones fisicas incorrectas mas que como texto inventado.
- La licencia MIT se declara para este repositorio, pero el modelo base openvla/openvla-7b puede estar sujeto a condiciones adicionales que deben verificarse antes de un uso comercial.
- El stack de evaluacion es fragil: requiere el repositorio HiF-VLA, LIBERO, un fork de transformers, ffmpeg y av, y la dependencia mvextractor debe aislarse porque es exclusiva de entrenamiento.
- No hay datos publicados de latencia, throughput ni requisitos de memoria medidos, solo estimaciones derivadas del tamano del modelo base.
- Las fechas de creacion y actualizacion de los metadatos (2026-09-10) coinciden con los checkpoints de CVPR 2026; conviene comprobar la vigencia de los repositorios de origen antes de depender de ellos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LoRAFleet/hifvla-libero-lora
- Modelo base: https://huggingface.co/openvla/openvla-7b
- Codigo de HiF-VLA: https://github.com/minnie-lin/HiF-VLA
- Paper de HiF-VLA: arXiv 2512.09928 (referencia citada en la model card)
- Checkpoints de origen por suite:
  - https://huggingface.co/minnielin/hifvla-libero-spatial
  - https://huggingface.co/minnielin/hifvla-libero-object
  - https://huggingface.co/minnielin/hifvla-libero-goal
  - https://huggingface.co/minnielin/hifvla-libero-long
