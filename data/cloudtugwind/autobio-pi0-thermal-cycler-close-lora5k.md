# CloudTugWind/AutoBio-pi0-thermal-cycler-close-lora5k

## Resumen
Este repositorio contiene un adaptador LoRA que afina el modelo π0 (openpi) de Physical Intelligence para una tarea concreta de robotica: cerrar la tapa de un termociclador. Forma parte del benchmark AutoBio, en su variante con renderizado MuJoCo, y ha sido publicado por el usuario CloudTugWind. El modelo base es `pi0_base`, una arquitectura vision-language-action (VLA) que combina PaliGemma 2B con un experto de accion de 300M de parametros.

El problema que aborda es la manipulacion robotica de precision sobre instrumental de laboratorio, un dominio donde los modelos genericos de VLA fallan por defecto: segun la model card, el π0_base en zero-shot obtiene una tasa de exito del 0 por ciento, mientras que este LoRA entrenado durante 5000 pasos alcanza un 90 por ciento en 20 episodios con semilla 0. Se trata, por tanto, de un ejemplo de adaptacion eficiente (unas 7,5 horas en una sola RTX 5090) frente a un fine-tuning completo que requirio 30.000 pasos en H800 y alcanzo el 99,7 por ciento.

Su relevancia es doble: por un lado demuestra la viabilidad de especializar modelos VLA de proposito general con recursos de consumo; por otro, aporta artefactos portables (checkpoint completo en orbax y delta LoRA en .npz) para reproducir y reutilizar el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); base PaliGemma 2B + experto de accion de 300M, con adaptadores LoRA (gemma_2b_lora + gemma_300m_lora, rank 16/32) |
| Parametros totales | Modelo base pi0_base (~2,3B: PaliGemma 2B + 300M de experto de accion); los adaptadores LoRA anaden un delta de aproximadamente 100 MB |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Checkpoint openpi en orbax (`autobio_pi0_tc_close_lora5k_ckpt.tar`, ~4,9 GB); delta LoRA portable en .npz (~100 MB) |

## Arquitectura y entrenamiento
El modelo base π0 es una arquitectura VLA que recibe observaciones visuales y de estado y produce acciones motoras, combinando un backbone PaliGemma 2B (modelo de vision-lenguaje) con un experto de accion de 300M de parametros. Sobre esta base, el autor ha aplicado un esquema de LoRA de doble adaptador (`gemma_2b_lora` y `gemma_300m_lora`, con ranks 16 y 32 respectivamente), congelando los pesos originales e inyectando los adaptadores como delta entrenable.

El entrenamiento se realizo sobre el conjunto `autobio-bench/thermal_cycler_close-mujoco`, compuesto por 100 episodios de demostracion para la tarea de cerrar la tapa del termociclador. La configuracion incluye 5000 pasos, batch de 16, el schedule de learning rate por defecto de openpi y sin EMA. Todo el entrenamiento se ejecuto en una unica RTX 5090 de 24 GB durante aproximadamente 7,5 horas, alcanzando una perdida final de 0,0041. No se menciona uso de RLHF ni DPO; se trata de aprendizaje supervisado por imitacion. Como nota tecnica, la model card advierte de que en GPUs Blackwell hay que desactivar el triton gemm (`XLA_FLAGS="--xla_gpu_enable_triton_gemm=false"`) para evitar un fallo de compilacion de JAX/Triton.

## Capacidades
- Control robotico de una tarea especifica: cerrar la tapa de un termociclador en el entorno MuJoCo del benchmark AutoBio.
- Entrada multimodal de vision y estado, con salida de acciones motoras (VLA).
- Integracion con el stack openpi mediante `scripts/serve_policy.py`, exponiendo el modelo como servidor de politica en el puerto 8000.
- Evaluacion reproducible a traves del benchmark AutoBio con semillas fijas y guardado de resultados en JSON.
- Exportacion e importacion del delta LoRA en formato .npz mediante `scripts/export_lora.py` y `scripts/load_lora.py`.
- No se documentan capacidades de tool calling, agentes multi-paso, generacion de texto general, codigo ni soporte multilingue; el modelo esta acotado a su tarea de manipulacion.

## Casos de uso
- Automatizacion de laboratorio molecular: el modelo se conecta al servidor de politica openpi y controla un brazo robotico para cerrar la tapa del termociclador como paso dentro de una secuencia de PCR, reduciendo la intervencion manual en flujos repetitivos.
- Investigacion en modelos VLA: sirve como caso de estudio reproducible para medir cuanto puede especializarse un π0 base mediante LoRA frente a un fine-tuning completo, con un delta de tan solo 5000 pasos.
- Benchmarking de manipulacion de precision: al evaluarse con AutoBio y semilla 0, permite comparar tecnicas de fine-tuning (LoRA vs full finetune) sobre una misma tarea y un mismo entorno MuJoCo.
- Prototipado rapido en robotica: el delta LoRA de 100 MB permite distribuir y cargar la especializacion sobre un π0_base sin transferir los 4,9 GB del checkpoint completo, agilizando pruebas en laboratorio.
- Transferencia a tareas afines: el esquema de doble adaptador puede reutilizarse como plantilla para otras tareas de manipulacion fina (cierre de recipientes, insercion de tubos) entrenando LoRA sobre nuevos conjuntos de episodios.
- Simulacion y validacion previa al despliegue real: al integrarse con el renderizado MuJoCo de AutoBio, el modelo permite validar politicas en simulacion antes de transferirlas a hardware fisico.
- Formacion y docencia en IA robotica: su bajo coste de entrenamiento y su publicacion abierta en licencia Apache 2.0 lo hacen util como ejemplo didactico de ajuste de modelos VLA.

## Benchmarks y rendimiento

| Modelo | Tasa de exito (20 episodios, semilla 0) | Notas |
|---|---|---|
| π0_base zero-shot | 0/6 (0 por ciento) | Sin ajuste sobre la tarea |
| Este LoRA (5000 pasos) | 18/20 (90 por ciento) | Entrenado en una RTX 5090 24 GB, ~7,5 h |
| Paper full finetune π0 | 99,7 por ciento | 30.000 pasos en H800 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, algo esperable dado que se trata de un modelo VLA especializado y no de un modelo de lenguaje general.

## Requisitos de hardware
- Entrenamiento: una unica GPU RTX 5090 de 24 GB, con un tiempo de aproximadamente 7,5 horas para 5000 pasos con batch 16.
- Inferencia del checkpoint completo: el archivo orbax ocupa unos 4,9 GB, por lo que cabe en GPUs de consumo con al menos 8-12 GB de VRAM (no se especifica el consumo exacto).
- Delta LoRA portable: el fichero .npz de 100 MB se carga sobre los pesos base congelados, reduciendo el coste de almacenamiento y distribucion.
- GPU recomendadas: RTX 5090 (usada en el entrenamiento); no se documentan otras configuraciones probadas. El fine-tuning completo de referencia empleo H800.
- Compatibilidad: se advierte de problemas de compilacion JAX/Triton en arquitecturas Blackwell, mitigables desactivando triton gemm.
- Despliegue: servidor de politica de openpi mediante `uv run scripts/serve_policy.py`; evaluacion con el script `evaluate.py` de AutoBio. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (tarea) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este LoRA (π0 + LoRA 5k) | Base ~2,3B + delta LoRA | no disponible | 90 por ciento (18/20) | apache-2.0 | HuggingFace + GitHub release |
| π0_base zero-shot | ~2,3B | no disponible | 0 por ciento (0/6) | apache-2.0 (openpi) | Repositorio openpi |
| Full finetune π0 (paper) | ~2,3B | no disponible | 99,7 por ciento | apache-2.0 (openpi) | Referencia en paper/model card |

No se dispone de informacion sobre otros modelos VLA comparables en la informacion proporcionada.

## Limitaciones y advertencias
- Especializacion extrema: el modelo solo esta entrenado para la tarea de cerrar la tapa del termociclador; no es un modelo de proposito general ni soporta otras tareas sin reentrenamiento.
- Rendimiento inferior al fine-tuning completo: el 90 por ciento frente al 99,7 por ciento del full finetune implica un margen de error no despreciable en entornos productivos.
- Dependencia del entorno: los resultados se han medido en el renderizado MuJoCo de AutoBio con semilla 0; no se documenta transferencia a hardware fisico real.
- Riesgo de sobreajuste: entrenado sobre solo 100 episodios, lo que puede limitar la generalizacion a variaciones de posicion, iluminacion u objetos.
- Sin datos sobre sesgos, alucinacion en el sentido linguistico, cobertura de idiomas ni limites de contexto, al no ser un modelo de lenguaje conversacional.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base openpi y del benchmark AutoBio.
- Caveat de despliegue: en GPUs Blackwell es necesario aplicar el flag de XLA para evitar fallos de compilacion.
- Sin resultados de benchmarks adicionales publicados que permitan una evaluacion mas amplia.

## Enlaces
- HuggingFace: https://huggingface.co/CloudTugWind/AutoBio-pi0-thermal-cycler-close-lora5k
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Benchmark AutoBio: https://github.com/autobio-bench/AutoBio
- Release con delta LoRA (.npz): https://github.com/Feiyang2007/AutoBio/releases/tag/thermal_cycler_close-lora5k
- Codigo y utilidades relacionadas: https://github.com/Feiyang2007/AutoBio
- Modelo base en HuggingFace: physical-intelligence/openpi
