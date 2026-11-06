# Simsuk/ecot-openvla-7b-bridge-cd-fixed3field

## Resumen

ECoT OpenVLA 7B Bridge CD — Fixed 3-Field Skip Mask es un checkpoint de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario Simsuk en Hugging Face. Deriva por ajuste fino completo de `Embodied-CoT/ecot-openvla-7b-bridge`, que a su vez se construye sobre OpenVLA (un transformer de 7B parámetros basado en Llama 2 con un codificador visual SigLIP/DINOv2 fusionado). El modelo traduce instrucciones en lenguaje natural e imágenes de una cámara de robot en acciones de 7 dimensiones para el entorno `bridge_orig` (brazo WidowX).

Su particularidad es la gestión del razonamiento encadenado (Embodied Chain-of-Thought). En lugar de generar todos los campos de razonamiento en cada paso de control, este checkpoint emite el token de omisión `<|fim_pad|>` en tres campos fijos —`SUBTASK REASONING`, `MOVE REASONING` y `GRIPPER POSITION`— mientras mantiene `PLAN`, `SUBTASK`, `MOVE` y `VISIBLE OBJECTS`. Es la línea base de máscara fija frente al modelo adaptativo del mismo autor (`Simsuk/ecot-openvla-7b-bridge-cd`), lo que permite comparar ambas estrategias con un protocolo de evaluación emparejado.

El modelo es de solo inferencia, se distribuye como repositorio Transformers autocontenido (sin adaptador ni modelo base separado) y está pensado para experimentación en manipulación robótica. Su relevancia es acotada: es un artefacto de investigación con 13 descargas y sin evaluación en robot real publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer VLA (OpenVLA: Llama 2 7B + fusión visual SigLIP/DINOv2), con decodificación de razonamiento estructurado |
| Parámetros totales | 7.188.124.608 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; la model card solo documenta bfloat16) |
| Idiomas soportados | no disponible (las instrucciones se procesan en inglés en el prompt de ejemplo) |
| Licencia | MIT en el repositorio; hereda restricciones de la Llama 2 Community License por derivar de Llama 2 |
| Formato de pesos | safetensors (repo de 14,4 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OpenVLA: un backbone de lenguaje Llama 2 de 7B parámetros al que se le inyectan características visuales de un codificador dual SigLIP + DINOv2, proyectadas al espacio de embeddings del transformer. Sobre esta base, el proyecto Embodied-CoT añade un esquema de generación estructurada en el que el modelo produce primero campos de razonamiento (`PLAN`, `SUBTASK`, `MOVE`, `VISIBLE OBJECTS`, `SUBTASK REASONING`, `MOVE REASONING`, `GRIPPER POSITION`) y después la acción de 7 dimensiones normalizada con la clave `bridge_orig`.

Este checkpoint concreto es un ajuste fino completo (no LoRA) del modelo base `Embodied-CoT/ecot-openvla-7b-bridge` (revisión `492b3dbf...`), entrenado hasta el paso 10.500 en la ejecución `vultr-aml-arc-94f0a978cd8d44ec90f9566a56056558`, rama `fixed_3field`. La innovación es la máscara de omisión fija: en cada paso de control se sustituyen exactamente tres campos por el token `<|fim_pad|>` (ID 32001), reduciendo la longitud generada a costa de eliminar razonamiento intermedio. En los fotogramas de solo acción se omiten todos los primitivos, igual que en el entrenamiento. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de acciones robóticas de 7 dimensiones para el entorno `bridge_orig` (WidowX) a partir de instrucción en lenguaje natural e imagen.
- Razonamiento encadenado estructurado con campos `PLAN`, `SUBTASK`, `MOVE` y `VISIBLE OBJECTS` generados completos.
- Omisión determinista de `SUBTASK REASONING`, `MOVE REASONING` y `GRIPPER POSITION` mediante el token `<|fim_pad|>` en cada paso.
- Inferencia autocontenida vía `AutoModelForVision2Seq` y `AutoProcessor` con `trust_remote_code=True`.
- Integración con el repositorio oficial de ECoT mediante el parche `ecot_widowx_hf.patch`, que adapta el cargador legacy `.pt` al modelo Transformers.
- Salida de razonamiento decodificado para visualización en el bucle de rollout.
- No se documentan tool calling, capacidades de agente multi-paso, audio ni visión general fuera del pipeline robótico.

## Casos de uso

- **Línea base de ablación en investigación VLA**: sirve para comparar, con protocolo emparejado, el efecto de omitir siempre tres campos de razonamiento frente a la omisión adaptativa del checkpoint `Simsuk/ecot-openvla-7b-bridge-cd`. Adecuado porque ambos comparten base, entorno y normalización de acciones.
- **Evaluación en simulación o banco de pruebas WidowX**: el parche incluido permite lanzar `experiments/bridge/eval_model_in_bridge_env.py` contra una interfaz de robot (`--host_ip`, `--port`) para medir tasas de éxito en tareas de manipulación.
- **Reducción de latencia en bucles de control**: al acortar la generación en tres campos por paso, el modelo emite menos tokens por acción, lo que resulta útil en entornos donde el coste de decodificación condiciona la frecuencia de control.
- **Depuración de pipelines de razonamiento estructurado**: los chequeos offline sobre 2.617 fotogramas de Bridge permiten validar el parser de cabeceras y el manejo de `<|fim_pad|>` antes de conectar hardware.
- **Prototipado de políticas de manipulación con instrucciones en lenguaje natural**: útil para experimentar con comandos tipo "coge el cubo rojo" sobre el conjunto de tareas Bridge sin reentrenar el backbone.
- **Validación de integración Transformers en robótica**: sirve como ejemplo de empaquetado de un VLA como modelo Transformers autocontenido, útil para equipos que quieran sustituir cargadores legacy por `AutoModelForVision2Seq`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card solo reporta chequeos offline sobre 2.617 fotogramas de Bridge retenidos: el modelo omite exactamente los tres campos enmascarados en 2.616/2.617 fotogramas, mantiene un orden de cabecera consistente y produce campos retenidos no vacíos en el 98,9 % de los fotogramas. El autor indica explícitamente que no se ha evaluado en un nuevo rollout con robot real.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 14-15 GB solo para pesos, más overhead de activaciones y del codificador visual; se recomienda un mínimo de 24 GB para operar con margen.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16.
- Cabe en GPU de consumo de gama alta: RTX 4090 (24 GB) y, con cuantización no documentada, potencialmente en GPUs de 16 GB; no se especifican recetas de cuantización.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (ruta documentada); no se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque de razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Simsuk/ecot-openvla-7b-bridge-cd-fixed3field | 7,19B | no disponible | Máscara fija de 3 campos | MIT + restricciones Llama 2 | Hugging Face, 13 descargas |
| Simsuk/ecot-openvla-7b-bridge-cd | no disponible | no disponible | Omisión adaptativa por estado | no disponible | Hugging Face |
| Embodied-CoT/ecot-openvla-7b-bridge | ~7B (base) | no disponible | Razonamiento encadenado completo | MIT + restricciones Llama 2 | Hugging Face |
| OpenVLA (openvla/openvla-7b) | ~7B | no disponible | Sin razonamiento explícito | MIT + restricciones Llama 2 | Hugging Face |

## Limitaciones y advertencias

- Modelo de solo inferencia y alcance muy restringido: diseñado para el entorno `bridge_orig` y el robot WidowX; no es un modelo de propósito general.
- No se ha evaluado en rollout con robot real; los únicos datos son chequeos offline de formato sobre fotogramas de entrenamiento.
- El repositorio ejecuta código personalizado con `trust_remote_code=True`; conviene revisar los ficheros Python incluidos antes de cargarlo.
- El parche `ecot_widowx_hf.patch` está anclado al commit oficial `1813ad76...` de ECoT; cambios posteriores en el repositorio pueden romperlo.
- Riesgo de alucinación en los campos de razonamiento (`PLAN`, `VISIBLE OBJECTS`): el modelo puede describir objetos no presentes en la imagen.
- Licencia MIT en el repositorio, pero el modelo deriva de Llama 2 y hereda las restricciones de la Llama 2 Community License, incluidos límites de uso comercial y de escala de usuarios.
- Idiomas soportados no documentados; el prompt de ejemplo está en inglés y el entrenamiento Bridge es predominantemente anglófono.
- Sin datos publicados de sesgos, robustez ante cambios de iluminación o generalización a objetos fuera del conjunto Bridge.
- Uso sobre hardware físico conlleva riesgo de daño; el autor advierte de revisar el parche antes de controlar un robot real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Simsuk/ecot-openvla-7b-bridge-cd-fixed3field
- Checkpoint adaptativo companion: https://huggingface.co/Simsuk/ecot-openvla-7b-bridge-cd
- Modelo base ECoT OpenVLA 7B Bridge: https://huggingface.co/Embodied-CoT/ecot-openvla-7b-bridge
- Proyecto OpenVLA: https://github.com/openvla/openvla
- Proyecto Embodied Chain-of-Thought: https://github.com/Embodied-CoT/embodied-cot
