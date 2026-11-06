# SkyIsNotGreen/hive-auditor-1.7b-v1

## Resumen

Hive Auditor 1.7B es un modelo especializado de 1.728.801.600 parametros desarrollado por SkyIsNotGreen como parte de la familia Hive 1.7B, un conjunto de cinco modelos de rol (Conductor, Reader, Auditor, Dispatcher y Tool Manager) construidos sobre LiquidAI/LFM3-1.7B-Base. Este modelo concreto cubre las funciones de placement y critic dentro de lo que el autor denomina "Hive local control plane": decide en que tarjeta GPU encaja cada modelo segun los presupuestos de VRAM y KV cache, y valida si una asignacion, planificacion u orden propuesto es correcto.

No es un modelo de chat general. Se trata de un ajuste fino mediante SFT con LoRA (r=16, alpha=32, dropout 0.05) sobre el modelo base de Liquid AI, con 2.600 filas sinteticas validadas por checker y 3.0 epocas (489 pasos). El modelo se distribuye en tres formatos: pesos fusionados en safetensors, adaptador PEFT y cuantizacion GGUF Q4_K_M, lo que facilita su despliegue tanto en transformers como en llama.cpp.

Su relevancia actual reside en la tendencia a orquestar cargas de trabajo de IA local con modelos pequenos y especializados que actuan como componentes deterministas dentro de un sistema mayor. Con un contexto de 8.192 tokens en la configuracion GGUF documentada y latencias medianas de 36-57 ms por consulta, esta disenado para integrarse en bucles de control automatizados, no para interaccion conversacional abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de LiquidAI/LFM3-1.7B-Base) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (configuracion documentada en llama-server) |
| Tipos de cuantizacion | GGUF Q4_K_M; pesos fusionados en bfloat16; adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (fusionado y adaptador), GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B-Base, un transformer de 1.700 millones de parametros de Liquid AI. Sobre esa base se aplico un ajuste fino supervisado (SFT) con TRL y LoRA de rango 16, alpha 32 y dropout 0.05. El entrenamiento uso 2.600 filas sinteticas especificas de los roles Hive, validadas por checker determinista, sin datos de usuarios, durante 3.0 epocas y 489 pasos. La perdida se calculo solo sobre los turnos del asistente y se empleo la plantilla de chat de LFM3 con `enable_thinking=false`. El pico de VRAM durante el entrenamiento fue de 13,9 GiB en una unica tarjeta AMD de 20 GB.

La innovacion principal no esta en la arquitectura, sino en el enfoque de especializacion por roles: en lugar de un modelo general, se entrena un componente que produce salidas JSON verificables para tareas de asignacion de recursos y validacion. El modelo se distribuye fusionado y como adaptador PEFT, y se ha convertido a GGUF para su uso con llama.cpp. La evaluacion se realizo con decodificacion greedy y `response_format` habilitado para las tareas con salida JSON.

## Capacidades

- Placement: asignar modelos a tarjetas GPU bajo restricciones de VRAM y presupuesto de KV cache.
- Critic: validar asignaciones, planificaciones y ordenes propuestos, emitiendo un veredicto estructurado.
- Generacion de salidas JSON con `response_format` para integracion en pipelines automatizados.
- Razonamiento de restricciones: comparacion de requisitos de memoria frente a capacidades disponibles.
- Soporte de plantilla de chat LFM3 con modo thinking desactivado.
- No soporta tool calling general, agentes multi-paso ni vision (no documentado).
- Capacidades multilingues: no disponibles.

## Casos de uso

- Orquestacion de inferencia local multi-modelo: el modelo recibe la lista de modelos a servir, la VRAM disponible por GPU y los requisitos de KV cache, y devuelve una asignacion valida. Es adecuado porque su entrenamiento se centra exactamente en esta tarea y su latencia mediana es de 36 ms en HF.
- Validacion de planes de despliegue en CI/CD: antes de aplicar un manifiesto de serving, el modelo actua como critic y verifica que la asignacion propuesta no excede presupuestos, integrándose como paso de validacion en un pipeline.
- Planificacion de turnos en un control plane: dado un conjunto de tareas y recursos, el modelo propone un orden de ejecucion y el critic valida que el orden respeta dependencias y capacidades.
- Enrutamiento de peticiones en sistemas Hive: el modelo participa como seat de placement dentro del enrutador Hive, decidiendo que tier de modelo atiende cada solicitud segun carga y memoria.
- Auditoria de configuraciones de servidores llama.cpp: el modelo puede revisar parametros como `-ngl`, `-c` y `-np` frente a la VRAM de la GPU y senalar inconsistencias.
- Prototipado de sistemas de agentes con verificacion determinista: se usa el modelo para generar propuestas y un checker determinista para confirmarlas, aprovechando la recomendacion del autor de no confiar solo en el modelo en produccion.
- Evaluacion de escenarios de capacidad en laboratorio: simulacion de asignaciones bajo distintos presupuestos de memoria para estudiar estrategias de despliegue antes de invertir en hardware.

## Benchmarks y rendimiento

Resultados en suites de rol Hive held-out con decodificacion greedy:

| Rol | Ruta | Precision | n | Mediana |
|---|---|---:|---:|---:|
| Placement | HF | 0.957 | 46 | 0.036 s |
| Placement | GGUF | 0.935 | 46 | 0.047 s |
| Critic | HF | 0.947 | 38 | 0.038 s |
| Critic | GGUF | 0.921 | 38 | 0.057 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,5 GB solo para pesos, mas KV cache; con contexto de 8.192 tokens y dos slots (`-np 2`) el consumo adicional es moderado pero no cuantificado en la informacion disponible.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 1,1-1,3 GB para pesos, mas KV cache.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB o mas (RTX 3060, RTX 4060, RTX 4090) para Q4_K_M; para bfloat16 se recomienda 8 GB o mas.
- Cabe en GPU consumer: si, tanto en Q4_K_M como en bfloat16 con contexto moderado.
- Opciones de despliegue: transformers (pesos fusionados o adaptador PEFT), llama.cpp/llama-server con GGUF, y el servidor Hive (`hive serve`).
- Latencia: mediana de 36 ms (placement HF), 47 ms (placement GGUF), 38 ms (critic HF) y 57 ms (critic GGUF) por consulta en el hardware de evaluacion del autor.
- Throughput: no disponible.
- Entrenamiento: pico de 13,9 GiB en una tarjeta AMD de 20 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Hive Auditor 1.7B | 1.728.801.600 | 8.192 (GGUF documentado) | LFM 1.0 | Placement y critic especializados |
| LiquidAI/LFM3-1.7B-Base | 1.700 millones (aprox.) | no disponible | LFM 1.0 | Modelo base general |
| Hive Conductor 1.7B | 1.700 millones (aprox.) | no disponible | LFM 1.0 | Controlador y planificador |
| Hive Reader 1.7B | 1.700 millones (aprox.) | no disponible | LFM 1.0 | Mecanica y RAG |

No se dispone de datos de benchmarks comparativos con modelos de proposito general de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat general: su uso fuera de las tareas de placement y critic producira resultados poco fiables.
- El autor recomienda usar un checker determinista en produccion en lugar de confiar unicamente en la salida del modelo.
- Precision medida del 92-96%: existe una tasa de error no despreciable que debe gestionarse con validacion externa.
- Sesgos conocidos: no documentados, pero al entrenarse con datos sinteticos generados por el autor, puede heredar sesgos de ese proceso de generacion.
- Riesgo de alucinacion en tareas fuera de distribucion: el modelo puede producir asignaciones JSON sintacticamente validas pero semanticamente incorrectas.
- Idiomas soportados no documentados; probablemente optimizado para ingles, aunque no confirmado.
- Restriccion de licencia: LFM Open License v1.0 no permite uso comercial a entidades con ingresos anuales superiores a 10 millones de USD.
- Requiere `--reasoning off` en llama.cpp con la plantilla LFM3; omitirlo puede degradar la calidad de las respuestas.
- Contexto limitado a 8.192 tokens en la configuracion documentada, lo que restringe el tamano de los planes que puede procesar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de un modelo muy reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkyIsNotGreen/hive-auditor-1.7b-v1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Repositorio Hive: https://github.com/sky-is-green/hive
- Guia de instalacion de Hive: https://github.com/sky-is-green/hive#install
- Harness de evaluacion de roles: https://github.com/sky-is-green/hive/tree/main/experiments/roles
- Hive Conductor 1.7B: https://huggingface.co/SkyIsNotGreen/hive-conductor-1.7b-v1
- Hive Reader 1.7B: https://huggingface.co/SkyIsNotGreen/hive-reader-1.7b-v1
- Hive Dispatcher 1.7B: https://huggingface.co/SkyIsNotGreen/hive-dispatcher-1.7b-v1
- Hive Tool Manager 1.7B: https://huggingface.co/SkyIsNotGreen/hive-tool-manager-1.7b-v1
- Licencia LFM 1.0: https://huggingface.co/LiquidAI/LFM3-1.7B-Base/blob/main/LICENSE
