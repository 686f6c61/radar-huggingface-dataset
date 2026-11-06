# debudash/qwen3-4b-tz-convert-v3-n1500

## Resumen

`debudash/qwen3-4b-tz-convert-v3-n1500` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario debudash dentro del proyecto tz-convert. Su proposito es muy concreto: mejorar la adherencia a especificaciones y la robustez en tareas de conversion de zonas horarias (timezone conversion) expresadas en lenguaje natural. No es un modelo de proposito general, sino un punto intermedio en una curva de eficiencia de datos del citado proyecto.

El adaptador se entrena sobre los primeros 1.500 ejemplos del mix `v3` del dataset `debudash/tz-convert-sft`, con los mismos hiperparametros que el resto de checkpoints de la serie. El checkpoint de referencia del proyecto es `debudash/qwen3-4b-tz-convert-v3-n12000`, que el autor identifica como el mejor de la familia; este `n1500` sirve como comparativa de cuanto rendimiento se obtiene con una fraccion pequena de los datos.

Es relevante ahora porque ejemplifica una tendencia practica: adaptadores pequenos y especializados sobre modelos instruct de 4B parametros que superan ampliamente al modelo base en una tarea acotada (36,0 % frente a 12,0 % de adherencia a especificacion) con un coste de entrenamiento y almacenamiento minimo (repo de 0,1 GB). La licencia Apache 2.0 facilita su reutilizacion comercial, aunque el alcance funcional es estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB en el repo; el modelo base Qwen3-4B-Instruct-2507 tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | QLoRA implica entrenamiento con cuantizacion del base; los pesos del adaptador se publican en safetensors. No se detallan otros formatos |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango entrenado con QLoRA sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de 4.000 millones de parametros de la familia Qwen3 en su variante instruct. El adaptador no modifica la arquitectura del base: anade matrices de bajo rango en las capas seleccionadas, de modo que en inferencia se combina con el modelo base (o se fusiona en el).

El entrenamiento usa los primeros 1.500 ejemplos del mix `v3` del dataset `debudash/tz-convert-sft`, con los mismos hiperparametros que el resto de checkpoints de la serie (el autor no detalla valores concretos de rango, alpha, learning rate ni epochs en la informacion disponible). El commit de entrenamiento registrado es `feae72b7654f14207f75df044af295dcf31a9d74`. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; el foco esta en el ajuste supervisado sobre datos de la tarea.

## Capacidades

- Generacion de texto conversacional (`text-generation`, `conversational`) heredada del base Qwen3-4B-Instruct-2507.
- Conversion de zonas horarias a partir de instrucciones en lenguaje natural, con adherencia a una especificacion formal (metrica de spec-adherence del 36,0 %).
- Robustez ante entradas variadas o ruidosas dentro de la tarea de conversion horaria (46,6 % en la metrica de robustness del autor).
- Mantenimiento de conversaciones multi-turno sin deriva excesiva: 5,7 % de deriva en conversaciones mantenidas, frente al 0,0 % del base (metrica del autor).
- Capacidades generales del modelo base (razonamiento, codigo, matematicas, tool calling, multilingue) potencialmente presentes, aunque no evaluadas ni garantizadas por el autor para este adaptador.
- No se documentan capacidades de vision, audio ni modo thinking especifico en la informacion proporcionada.

## Casos de uso

- Normalizacion de marcas temporales en pipelines de datos: el adaptador convierte expresiones como "3 PM en Madrid a hora de Tokio" en valores normalizados, util para ETL de logs y eventos distribuidos donde la adherencia a formato es critica.
- Asistentes de programacion de reuniones: integrar el adaptador en un bot de calendario que traduzca peticiones en lenguaje natural a zonas horarias concretas, aprovechando la mejora en adherencia a especificacion (36,0 % frente a 12,0 % del base).
- Soporte a operaciones 24/7: equipos de guardia distribuidos globalmente pueden usar el modelo para resolver conversiones de turnos y ventanas de mantenimiento sin ambiguedad.
- Preprocesado en sistemas de atencion al cliente: detectar y convertir referencias horarias en tickets antes de enrutarlos, reduciendo errores manuales en equipos multirregion.
- Evaluacion comparativa de eficiencia de datos: como checkpoint de 1.500 ejemplos, sirve para estudiar cuanto rendimiento se obtiene con pocos datos frente al checkpoint `n12000`, util en investigacion sobre scaling de adaptadores.
- Prototipado rapido de funciones de conversion horaria: al ser un adaptador de 0,1 GB sobre un base de 4B, se puede desplegar en entornos de desarrollo con recursos limitados para validar la tarea antes de invertir en un modelo mayor.
- Filtrado y validacion en ingesta de datos: marcar registros con conversiones horarias sospechosas o inconsistentes en datasets de eventos.

## Benchmarks y rendimiento

Metricas publicadas por el autor en la model card (no son benchmarks estandar como MMLU o HumanEval):

| Metrica | Este adaptador (n1500) | Modelo base con prompt completo |
|---|---|---|
| Spec-adherence | 36,0 % | 12,0 % |
| Robustness | 46,6 % | 23,3 % |
| Drift: conversaciones mantenidas | 5,7 % | 0,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa 0,1 GB; el modelo base Qwen3-4B-Instruct-2507 requiere aproximadamente 8 GB en FP16, unos 4-5 GB en cuantizacion de 8 bits y unos 2,5-3 GB en 4 bits (estimaciones orientativas para un modelo de 4B; no confirmadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con concurrencia; RTX 4090, RTX 3090 o RTX 4070 Ti para inferencia en una sola GPU consumer.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en cuantizacion de 4-8 bits; en FP16 se recomienda 12-16 GB para margen de contexto.
- Opciones de despliegue: vLLM o TGI fusionando el adaptador en el base; llama.cpp u Ollama tras convertir el modelo fusionado a GGUF; PEFT directamente para prototipado en Python.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| debudash/qwen3-4b-tz-convert-v3-n1500 | 4B (base) + LoRA | No disponible | Conversion de zonas horarias | Apache 2.0 | Hugging Face |
| debudash/qwen3-4b-tz-convert-v3-n12000 | 4B (base) + LoRA | No disponible | Conversion de zonas horarias (mejor checkpoint del proyecto) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | No disponible en esta ficha | Modelo instruct generalista | Apache 2.0 | Hugging Face |

El checkpoint `n12000` del mismo proyecto es la referencia directa: usa mas datos (12.000 ejemplos frente a 1.500) y el autor lo identifica como el mejor de la serie. El modelo base sin adaptar es la alternativa para tareas generales, pero rinde peor en la tarea especifica (12,0 % de spec-adherence frente al 36,0 % de este adaptador). No se dispone de comparaciones con adaptadores de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance funcional muy estrecho: el adaptador esta especializado en conversion de zonas horarias; su rendimiento en tareas generales no ha sido evaluado y puede degradarse respecto al base.
- Solo ingles: el autor declara unicamente el idioma `en`; el comportamiento en castellano u otros idiomas no esta validado.
- Deriva conversacional: la metrica de drift es del 5,7 % (frente al 0,0 % del base), lo que indica que en conversaciones largas el adaptador puede desviarse de la especificacion.
- Adherencia a especificacion limitada: un 36,0 % sigue siendo bajo en terminos absolutos; no es adecuado para produccion sin validacion adicional y capas de verificacion.
- Riesgo de alucinacion: como todo modelo generativo, puede producir conversiones horarias plausibles pero incorrectas, especialmente en casos limite (horarios de verano, zonas con offsets no enteros, cambios historicos de reglas).
- Dependencia del modelo base: requiere cargar o fusionar Qwen3-4B-Instruct-2507; el adaptador por si solo no es ejecutable.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar tambien la licencia del modelo base.
- Sin datos publicados de latencia, throughput ni comportamiento bajo carga concurrente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/debudash/qwen3-4b-tz-convert-v3-n1500
- Checkpoint de referencia del proyecto: https://huggingface.co/debudash/qwen3-4b-tz-convert-v3-n12000
- Dataset de entrenamiento: https://huggingface.co/datasets/debudash/tz-convert-sft
- Codigo, conjuntos de evaluacion e informes: https://huggingface.co/debudash/slm-training
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
