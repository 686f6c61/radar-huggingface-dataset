# debudash/qwen3-4b-tz-convert-v1-n2000

## Resumen

`qwen3-4b-tz-convert-v1-n2000` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario `debudash` en Hugging Face. Forma parte del proyecto tz-convert, cuyo objetivo es especializar un modelo de lenguaje pequeño en la conversión y el razonamiento sobre zonas horarias (timezones). No se trata de un modelo completo, sino de un checkpoint intermedio dentro de una curva de eficiencia de datos: se ha entrenado únicamente con los primeros 2.000 ejemplos de la mezcla `v1` del dataset `debudash/tz-convert-sft`.

El adaptador mantiene los hiperparámetros del resto de checkpoints del proyecto y se distribuye como pesos PEFT en formato safetensors (0,1 GB), lo que permite aplicarlo sobre el modelo base sin duplicar los 4.000 millones de parámetros de este. Su relevancia es acotada: sirve como punto de referencia para estudiar cómo escala la adherencia a especificación y la robustez con el volumen de datos de entrenamiento, y como ejemplo práctico de fine-tuning QLoRA de bajo coste sobre un modelo Instruct de última generación.

Según la model card, el adaptador alcanza un 44,0 % de adherencia a especificación y un 47,6 % de robustez, frente al 12,0 % y 23,3 % del modelo base con el prompt de especificación completo. El autor remite al checkpoint `v3-n12000` como el mejor de la serie. La licencia declarada es Apache 2.0 y el único idioma indicado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA/QLoRA sobre el modelo base |
| Parametros totales | 4.000 millones en el modelo base; el adaptador LoRA añade un subconjunto no especificado (repo de 0,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible; el entrenamiento se realizo con QLoRA (cuantizacion del base durante el fine-tuning) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de 4.000 millones de parámetros de la familia Qwen3 en su variante Instruct. El fine-tuning se realizó con QLoRA, es decir, cuantizando el modelo base durante el entrenamiento y entrenando únicamente los pesos de bajo rango insertados por LoRA. El repositorio resultante contiene solo esos pesos adaptadores (0,1 GB), no el modelo completo.

Los datos de entrenamiento corresponden a los primeros 2.000 ejemplos de la mezcla `v1` del dataset `debudash/tz-convert-sft`, una colección orientada a la conversión de zonas horarias y al cumplimiento de especificaciones. La model card indica que se usaron los mismos hiperparámetros que en el resto de checkpoints del proyecto, pero no detalla la composición del dataset, el número de tokens vistos, la longitud de secuencia ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3-4B-Instruct.
- Conversión y razonamiento sobre zonas horarias (tz-convert), especialidad del adaptador.
- Adherencia a especificaciones: el adaptador mejora la capacidad de seguir un prompt de especificación completo (44,0 % frente al 12,0 % del base).
- Robustez ante entradas variadas o ruidosas dentro del dominio de timezones (47,6 % frente al 23,3 % del base).
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Capacidades especiales (modo thinking, visión, audio): no documentadas en la informacion proporcionada.

## Casos de uso

- Normalización de zonas horarias en pipelines de datos: el adaptador puede recibir cadenas de fecha/hora con identificadores IANA o abreviaturas y devolver la conversión normalizada, aprovechando su entrenamiento específico en tz-convert.
- Preprocesado en sistemas de scheduling: integrado como paso previo a un motor de calendario, convierte las expresiones horarias de los usuarios a un formato canónico antes de crear eventos.
- Enriquecimiento de logs y trazas distribuidas: permite traducir timestamps entre zonas horarias en herramientas de observabilidad, con un modelo pequeño que puede ejecutarse en local.
- Asistente de soporte para incidencias de hora: responde consultas de usuarios sobre desfases horarios y cambios de horario de verano, con la ventaja de que el adaptador está especializado en el dominio.
- Evaluación de eficiencia de datos en fine-tuning: sirve como checkpoint de referencia (2.000 ejemplos) para comparar curvas de aprendizaje frente a `v3-n12000` y otros puntos de la serie.
- Prototipado de bajo coste: al ser un adaptador LoRA de 0,1 GB, se puede cargar y descartar rápidamente en experimentos sobre el modelo base sin almacenar copias completas de 4B.
- Generación de datos sintéticos de timezones: puede utilizarse para producir pares de conversión que alimenten otros entrenamientos, siempre con validación posterior.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación propia del proyecto tz-convert):

| Metrica | Este adaptador (n2000) | Modelo base con prompt de especificacion completo |
|---|---|---|
| Spec-adherence | 44,0 % | 12,0 % |
| Robustness | 47,6 % | 23,3 % |
| Drift: conversaciones mantenidas | no disponible | 0,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB; el coste real de inferencia lo determina el modelo base Qwen3-4B-Instruct-2507.
- VRAM estimada para el base en FP16/BF16: en torno a 8-9 GB para pesos, más memoria para KV cache y activaciones; en cuantización de 4 bits, aproximadamente 2,5-3 GB de pesos.
- GPU recomendadas: A100, H100 o L40S para despliegues concurrentes; RTX 4090, RTX 3090 o RTX 4080 para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización de 4 bits, y en 12-16 GB en FP16 con contexto moderado.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el base y fusionar o aplicar el adaptador; compatible con vLLM (con soporte LoRA), TGI, llama.cpp/Ollama (previa fusión y conversión a GGUF) y transformers + PEFT.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tz-convert-v1-n2000 (este) | 4B (base) + LoRA | no disponible | Timezones / tz-convert | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible en la informacion proporcionada | Propósito general, instruct | Apache 2.0 | Hugging Face |
| debudash/qwen3-4b-tz-convert-v3-n12000 | 4B (base) + LoRA | no disponible | Timezones / tz-convert (mejor checkpoint de la serie) | Apache 2.0 | Hugging Face |

La comparación con modelos de propósito general de otros fabricantes (Llama 3.2 3B, Gemma 2 2B, Phi-3.5-mini) no está disponible en la información proporcionada, y sus cifras de rendimiento no serían directamente comparables al tratarse de una tarea de dominio específico evaluada con métricas propias.

## Limitaciones y advertencias

- Checkpoint intermedio: el propio autor indica que `v3-n12000` es el mejor de la serie; este adaptador está pensado para análisis de eficiencia de datos, no como versión de producción.
- Rendimiento limitado en términos absolutos: 44,0 % de adherencia a especificación y 47,6 % de robustez implican que más de la mitad de las evaluaciones no se superan.
- Sesgos: no documentados en la informacion proporcionada; al derivar de un modelo base entrenado con datos web, puede heredar sesgos de este.
- Riesgo de alucinación: presente, especialmente fuera del dominio de timezones; el adaptador no está diseñado como modelo de propósito general.
- Idioma: solo se declara inglés; el comportamiento en castellano u otros idiomas no está garantizado ni evaluado.
- Contexto: la longitud de contexto efectiva del adaptador no se documenta; se asume la del base, pero sin confirmación.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-4B-Instruct-2507 y de los datos de entrenamiento antes de desplegar.
- Producción: requiere validación adicional de las conversiones de timezones, especialmente en casos límite (horario de verano, zonas ambiguas, abreviaturas no IANA).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/debudash/qwen3-4b-tz-convert-v1-n2000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Mejor checkpoint de la serie: https://huggingface.co/debudash/qwen3-4b-tz-convert-v3-n12000
- Dataset de entrenamiento: https://huggingface.co/datasets/debudash/tz-convert-sft
- Código, conjuntos de evaluación e informes: https://huggingface.co/debudash/slm-training
