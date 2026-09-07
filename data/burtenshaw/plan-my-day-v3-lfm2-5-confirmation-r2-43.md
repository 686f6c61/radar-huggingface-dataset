# burtenshaw/plan-my-day-v3-lfm2.5-confirmation-r2-43

## Resumen

`burtenshaw/plan-my-day-v3-lfm2.5-confirmation-r2-43` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`, desarrollado por el usuario burtenshaw. El adaptador ha sido ajustado mediante SFT (supervised fine-tuning) con TRL sobre un conjunto de datos sintéticos de correcciones de calendario, denominado `burtenshaw/plan-my-day-v3-data`. Su función específica es clasificar o puntuar cuatro acciones ofrecidas en un flujo de planificación de día; no se trata de un agente de calendario general ni de un asistente personal validado.

El modelo tiene un tamaño de repositorio de 0,1 GB y está publicado en formato safetensors. La longitud de contexto no se especifica en la información disponible. La relevancia del proyecto radica en la exploración de técnicas de aprendizaje continuo (continual learning) y de generación de datos sintéticos para tareas de planificación, con una cadena de linaje reproducible que incluye un adaptador de warm-start previo (`burtenshaw/plan-my-day-lfm2.5-sft-seed17`). La licencia del modelo es la LFM Open License v1.0, que impone condiciones para uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base de Liquid AI (arquitectura del base no especificada) |
| Parametros totales | 1.200 millones (modelo base, inferido del nombre LFM2.5-1.2B); parametros del adaptador no especificados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador LoRA en safetensors, sin cuantizacion especifica) |
| Idiomas soportados | ingles |
| Licencia | LFM Open License v1.0 (lfm1.0); incluye condiciones de uso comercial |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado mediante SFT nativo de TRL sobre datos sintéticos de correcciones de calendario. El entrenamiento se organiza en fases: se documentan tres fases finales, con 330 updates por fase y 990 updates en total. En las fases 2 y 3 se aplica un replay histórico del 75%; la fase 1 utiliza exclusivamente ejemplos de la fase actual. El conjunto de datos de evaluación final consta de 384 días sintéticos compartidos, distribuidos en 128 días por régimen.

El sistema no utiliza RLHF ni DPO; la seguridad del comportamiento depende de un filtrado determinista posterior (guarded system) basado en restricciones públicas, completitud y lookahead, y no se presenta como una capacidad de seguridad aprendida por el modelo. La innovación técnica principal es el enfoque de continual learning sobre datos sintéticos con evaluación en dos vistas: una vista raw con puntuaciones sin filtrar y una vista guarded con filtrado de reglas.

## Capacidades

- Clasificacion y ranking de cuatro acciones ofrecidas en un contexto de planificacion de dia.
- Procesamiento de entradas de calendario sinteticas: fechas, zona horaria, citas fijas y tareas con duracion y prioridad (segun el Space asociado).
- Soporte de lenguaje: ingles.
- Evaluacion en dos modalidades: raw (puntuaciones directas) y guarded (aplicando filtrado deterministico de restricciones).
- No soporta tool calling ni function calling de forma general; es un adaptador especifico para la tarea de planificacion.
- No dispone de capacidades de vision ni de audio.

## Casos de uso

- Asistente de planificacion diaria: el adaptador puede integrarse en una aplicacion que reciba citas fijas y tareas con duraciones y prioridades, y devolver un ranking de acciones de calendario para optimizar la agenda.
- Correccion de planes con restricciones: el sistema guarded aplica reglas de completitud y lookahead sobre las puntuaciones del modelo, lo que permite detectar conflictos y sugerir acciones correctivas en entornos controlados.
- Pruebas de investigacion en continual learning: el modelo sirve como caso de estudio para evaluar adaptadores LoRA entrenados por fases con replay historico, comparando retencion y olvido entre seeds.
- Generacion de datos sinteticos de calendario: el pipeline documentado permite reproducir y ampliar el dataset sintetico, lo que es util para entrenar variantes del adaptador en dominios similares.
- Benchmark de adaptadores PEFT: el modelo proporciona una referencia reproducible (con hashes inmutables de pesos y configuracion) para comparar estrategias de SFT en tareas de planificacion.
- Prototipo en Hugging Face Spaces: la aplicacion `plan-my-day` permite cargar un archivo .ics o introducir manualmente fecha, zona horaria, citas y tareas, y visualizar la salida del modelo en un entorno interactivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks genericos como MMLU, HumanEval o GSM8K en la informacion disponible. La evaluacion publicada se centra en metricas propias de la tarea de planificacion, correspondientes al sistema completo (conjunto de tres runs con seeds 17, 29 y 43), no a este adaptador individual:

| Metrica | Vista raw | Vista guarded |
|---|---|---|
| Original flags/day (menor es mejor) | 0,658854 | 0,585938 |
| Perfect (mayor es mejor) | 49,74% | 53,12% |
| Unsafe/day (menor es mejor) | 0,088542 | 0,000000 |
| Complete (mayor es mejor) | 92,45% | 100,00% |

El beneficio agregado del sistema frente a un SFT congelado por fase es de +0,532118 original flags/day, con intervalo de confianza pareado al 95% [+0,432292, +0,630208]. Este intervalo pertenece al sistema completo y no debe atribuirse a este adaptador en particular.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Dado el tamaño del adaptador (0,1 GB) y el modelo base de 1.200 millones de parametros, se estima que en FP16 el despliegue completo requiere al menos 4 GB de VRAM en GPUs de consumidor.
- GPU recomendadas: no especificadas. El modelo base es pequeno, por lo que deberia ejecutarse en GPUs como RTX 3060, RTX 4060 o similares; para despliegue en servidores, una A10 o T4 seria suficiente.
- Capacidad en consumer GPU: previsiblemente si, dado el tamano del modelo base y el adaptador LoRA.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `peft` de Hugging Face Transformers, o exportar los pesos combinados para servir con vLLM o llama.cpp si se fusiona el adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada. El blog de Liquid AI menciona 220 tok/s para LFM2.5-2.6B, pero ese dato corresponde a otro modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `burtenshaw/plan-my-day-v3-lfm2.5-confirmation-r2-43` | 1.2B (base) + adaptador LoRA | no disponible | LFM Open License v1.0 | safetensors | Adaptador especifico para planificacion; evaluado con metricas propias |
| `LiquidAI/LFM2.5-1.2B-Instruct` | 1.2B | no disponible | LFM Open License v1.0 | safetensors | Modelo base sin adaptar; no incluye el ajuste de planificacion |
| `burtenshaw/plan-my-day-lfm2.5-sft-seed17` | 1.2B (base) + adaptador LoRA | no disponible | LFM Open License v1.0 | safetensors | Adaptador previo de warm-start; no debe apilarse en inferencia |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada, salvo la mejora del sistema completo frente al SFT congelado indicada en la seccion de benchmarks.

## Limitaciones y advertencias

- El adaptador no es un agente de calendario general ni un asistente personal validado; su funcion se limita a clasificar cuatro acciones ofrecidas.
- La seguridad del sistema proviene del filtrado deterministico (guarded), no de una capacidad de seguridad aprendida por el modelo.
- Los datos de entrenamiento son sinteticos y estan en ingles; la generalizacion a otros idiomas o a calendarios reales no esta demostrada.
- La licencia LFM Open License v1.0 tiene condiciones de uso comercial; no se concede un uso comercial sin restricciones.
- El adaptador warm-start (`seed17`) es solo linaje de entrenamiento y no debe apilarse como segundo adaptador en inferencia; debe usarse el adaptador evaluado junto con el base fijado.
- Los resultados de evaluacion corresponden al sistema conjunto de tres runs, no a este adaptador individual; no debe interpretarse como una reivindicacion exclusiva de esta seed.
- La documentacion del paquete historico de warm-start carece de archivo de licencia propio; la cadena de licencia debe reconstruirse a partir de la informacion del model card.
- Los archivos de pesos son identidades de metadatos de Hub, no verificaciones byte a byte de tensores; la reproducibilidad depende de los hashes declarados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/burtenshaw/plan-my-day-v3-lfm2.5-confirmation-r2-43
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Space de demostracion: https://huggingface.co/spaces/burtenshaw/plan-my-day
- Dataset de datos sinteticos: https://huggingface.co/datasets/burtenshaw/plan-my-day-v3-data
- Codigo fuente fijado: https://huggingface.co/datasets/burtenshaw/plan-my-day-v3-source
- Configuracion y registro: https://huggingface.co/datasets/burtenshaw/plan-my-day-v3-source/blob/main/configs/dayplanner-v3.json
- Reporte completo de resultados: https://huggingface.co/datasets/burtenshaw/plan-my-day-v3-results/blob/main/reports/confirmation-report.json
- Adaptador warm-start: https://huggingface.co/burtenshaw/plan-my-day-lfm2.5-sft-seed17
- Blog de Liquid AI sobre LFM2.5-2.6B (modelo relacionado de la misma familia): https://www.liquid.ai/blog/lfm2-5-2-6b
