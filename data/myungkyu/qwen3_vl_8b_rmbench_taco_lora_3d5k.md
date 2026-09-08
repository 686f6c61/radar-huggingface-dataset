# Myungkyu/qwen3_vl_8b_rmbench_taco_lora_3d5k

## Resumen

`qwen3_vl_8b_rmbench_taco_lora_3d5k` es un modelo de planificacion de alto nivel para robotica desarrollado por Myungkyu. Se trata de un fine-tune con LoRA del modelo multimodal `Qwen/Qwen3-VL-8B-Instruct`, especializado en las 9 tareas simuladas de manipulacion en mesa del benchmark RMBench. El modelo toma como entrada 4 fotogramas recientes de una camara, el objetivo de la tarea y un texto con la memoria transportada, y genera un JSON con la subtarea actual, la memoria actualizada, un flag de keyframe con caption y una query de recuperacion.

La relevancia de este modelo radica en que aporta una capa de decision tactica para agentes embodied, permitiendo descomponer tareas complejas en subtareas gestionables. Al estar construido sobre Qwen3-VL-8B-Instruct (8.767.123.696 parametros), hereda capacidades de comprension vision-lenguaje, pero adaptadas a un dominio especifico mediante anotaciones densas de subtareas. El repo contiene el checkpoint fusionado en el paso 3500 del entrenamiento, en formato safetensors, con un tamano de 17,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (image-text-to-text), transformer, fine-tune LoRA |
| Parametros totales | 8.767.123.696 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint fusionado de LoRA) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-VL-8B-Instruct`, un modelo multimodal de tipo transformer que procesa imagen y texto. El fine-tune se realiza mediante LoRA con r=32, alpha=64 y dropout=0, utilizando la implementacion `Unsloth FastVisionModel`. Los pesos LoRA se fusionan con el modelo base en el checkpoint 3500, de modo que el repo contiene el modelo fusionado final y no los adaptadores por separado.

El entrenamiento usa el dataset `Myungkyu/RMBench-taco-gemini`, compuesto por demos de RMBench en las que se han anotado subtareas densas mediante anotacion offline con contexto especifico de la tarea. El batch de optimizador es de 16. La entrada del modelo sigue un contrato fijo: 4 fotogramas recientes de la camara de cabeza, el objetivo de la tarea y el texto de memoria transportada. La salida es un JSON estructurado con la subtarea actual, la memoria actualizada, un flag de keyframe con su caption y una query de recuperacion. No se especifica si se aplicaron tecnicas como RLHF o DPO; la informacion disponible solo menciona el fine-tune supervisado con LoRA.

## Capacidades

- Planificacion de alto nivel para manipulacion robotica en mesa, especificamente para las 9 tareas simuladas de RMBench.
- Comprension multimodal: procesa 4 fotogramas de camara consecutivos junto con contexto textual del objetivo.
- Salida estructurada en JSON: subtarea actual, memoria actualizada, flag de keyframe con caption y query de recuperacion.
- Gestion de memoria visual: el flag de keyframe permite marcar instantes relevantes y generar captions descriptivos para el seguimiento de la tarea.
- Generacion de queries de recuperacion: el modelo puede producir consultas para buscar informacion previa, util en sistemas con memoria externa o experiencias almacenadas.
- Habilidad de razonamiento secuencial: al descomponer la tarea en subtareas y actualizar el estado de memoria, soporta razonamiento multi-paso dentro del flujo de planificacion.

## Casos de uso

- Planificacion de tareas en robots manipuladores de mesa: el modelo descompone una tarea objetivo en subtareas secuenciales a partir de la informacion visual de la camara, siendo util en entornos industriales o de investigacion con brazos roboticos.
- Gestion de memoria en agentes embodied: mantiene un texto de memoria actualizado y decide cuando capturar un keyframe con caption, lo que permite a un robot recordar estados importantes sin depender de un contexto visual infinito.
- Recuperacion de contexto para aprendizaje por demostracion: al generar queries de recuperacion, puede integrarse en sistemas que almacenan experiencias previas para reutilizar soluciones conocidas.
- Anotacion automatica de trayectorias robotica: sirve para etiquetar demos con subtareas y captions, reduciendo el coste de anotacion manual en pipelines de entrenamiento de politicas.
- Evaluacion de politicas en simulacion: dentro de RMBench, actua como planificador de alto nivel para comprobar si un ejecutor de bajo nivel completa correctamente las subtareas derivadas.
- Integracion en arquitecturas vision-language-action (VLA): el modelo cubre la capa de decision tactica, generando instrucciones estructuradas que posteriormente se traducen a comandos de control para el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni metricas especificas de robotica (por ejemplo, tasa de exito en RMBench) que permitan evaluar numericamente el rendimiento del modelo frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.767.123.696 de parametros en FP16, se necesitarian aproximadamente 17,5 GB de VRAM, coincidiendo con el tamano del repo. Con cuantizacion INT8 o INT4 la demanda seria menor, pero no se han publicado configuraciones de cuantizacion.
- GPU recomendadas: para FP16 se requieren GPUs con 24 GB o mas de VRAM, como RTX 4090, A100 40GB o H100. Con cuantizacion podria ejecutarse en GPUs de 12-16 GB, aunque sin datos publicados que lo confirmen.
- Compatibilidad con consumer GPU: es viable en tarjetas de gama alta (24 GB) sin cuantizar; para GPUs de 16 GB o menos seria necesario cuantizar el modelo.
- Opciones de despliegue: el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face inference endpoints. La libreria declarada es `transformers`, por lo que el despliegue basico pasa por `transformers`. No se especifica soporte para vLLM, llama.cpp o Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Uso |
|---|---|---|---|---|---|
| Myungkyu/qwen3_vl_8b_rmbench_taco_lora_3d5k | 8,77B | no disponible | Fine-tune LoRA de Qwen3-VL para robotica | no disponible | Planificador de manipulacion en RMBench |
| Qwen/Qwen3-VL-8B-Instruct (base) | ~8,77B | no disponible | Modelo base multimodal | no disponible | Vision-lenguaje general |
| Otros modelos VLA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado otros modelos comparables en la informacion proporcionada. La comparativa mas directa es contra el modelo base, que ofrece capacidades generales de comprension vision-lenguaje pero sin la especializacion en planificacion robotica que aporta este fine-tune.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el modelo es utilizable en entornos comerciales. Habria que revisar la licencia del modelo base `Qwen/Qwen3-VL-8B-Instruct` y la del dataset `Myungkyu/RMBench-taco-gemini`.
- Especializacion limitada: el modelo fue entrenado para 9 tareas simuladas de mesa en RMBench. La generalizacion a entornos reales, robots distintos o tareas fuera de este dominio no esta demostrada ni documentada.
- Contrato de entrada fijo: el modelo espera exactamente 4 fotogramas de camara, un objetivo y un texto de memoria. No se especifica como se comporta con otros formatos de entrada, lo que limita su adaptabilidad a pipelines existentes.
- Sin datos de evaluacion: no se han publicado benchmarks ni metricas de tasa de exito, por lo que el rendimiento real es desconocido y no se puede comparar con otros sistemas.
- Checkpoint unico: solo esta disponible el checkpoint fusionado del paso 3500. No hay informacion sobre la evolucion del entrenamiento, el comportamiento con menos pasos ni el riesgo de overfitting.
- Idiomas no especificados: aunque la entrada del modelo incluye texto en formato JSON, no se declaran los idiomas soportados. Habria que validar el funcionamiento con instrucciones en distintas lenguas.
- Sesgos y alucinacion: no se han publicado estudios de sesgos ni evaluaciones de alucinacion en la generacion de subtareas o captions, un aspecto critico para desplegarlo en produccion.

## Enlaces

- Modelo: https://huggingface.co/Myungkyu/qwen3_vl_8b_rmbench_taco_lora_3d5k
- Dataset: https://huggingface.co/datasets/Myungkyu/RMBench-taco-gemini
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Documentacion de Qwen3-VL en Transformers: https://huggingface.co/docs/transformers/model_doc/qwen3_vl
- Perfil del autor en Hugging Face: https://huggingface.co/Myungkyu
