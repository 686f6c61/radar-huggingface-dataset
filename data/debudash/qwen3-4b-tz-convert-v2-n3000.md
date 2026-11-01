# debudash/qwen3-4b-tz-convert-v2-n3000

## Resumen

`qwen3-4b-tz-convert-v2-n3000` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo instructivo `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario `debudash` en HuggingFace. Forma parte del proyecto tz-convert, cuyo objetivo es especializar un modelo de lenguaje pequeño en la conversión y el razonamiento sobre zonas horarias (timezones) siguiendo una especificación estricta. El adaptador se entrenó sobre los primeros 3.000 ejemplos del mix `v2` del dataset `debudash/tz-convert-sft`.

No se trata de un modelo base nuevo ni de un entrenamiento completo: es un checkpoint intermedio de una curva de eficiencia de datos, con los mismos hiperparámetros que el resto de checkpoints del proyecto. Su relevancia es acotada y experimental: sirve para estudiar cómo escala la adherencia a especificación con el volumen de datos de entrenamiento en una tarea concreta y muy restringida.

El repositorio pesa aproximadamente 0,1 GB (solo los pesos del adaptador, en formato safetensors) y se distribuye bajo licencia Apache 2.0. El modelo base subyacente, Qwen3-4B-Instruct-2507, aporta la arquitectura transformer densa y la ventana de contexto; el adaptador añade la especialización en timezones. El autor remite al checkpoint `v3-n12000` como el mejor de la serie.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer denso Qwen3-4B-Instruct-2507 |
| Parametros totales | 4B en el modelo base; tamano del adaptador no disponible (repo de 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible; el entrenamiento uso QLoRA (cuantizacion del base durante el entrenamiento) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer denso de 4.000 millones de parámetros. QLoRA implica cuantizar el modelo base (habitualmente a 4 bits) y entrenar únicamente matrices de bajo rango inyectadas en las capas, lo que reduce drásticamente los requisitos de memoria frente a un fine-tuning completo. El repositorio solo contiene los pesos del adaptador, no los del modelo base.

El entrenamiento emplea los primeros 3.000 ejemplos del mix `v2` del dataset `debudash/tz-convert-sft`, con los mismos hiperparámetros que el resto de checkpoints del proyecto (commit de entrenamiento `460efb7519b69696c9b6484f40eb2b8dec405355`). La tarea es la conversión de zonas horarias bajo una especificación de prompt estricta. No se documentan en la información disponible detalles sobre número total de tokens vistos, composición exacta del dataset, ni si hubo etapas de RLHF o DPO; el autor remite al repositorio `debudash/slm-training` para código, conjuntos de evaluación e informes.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`), heredada del modelo base instructivo.
- Conversión y razonamiento sobre zonas horarias siguiendo una especificación de prompt estricta, que es la especialización del adaptador.
- Adherencia a especificación medida en un 40,0 % en el checkpoint, frente al 12,0 % del modelo base con el prompt de especificación completo.
- Robustez medida en un 42,7 %, frente al 23,3 % del modelo base.
- Capacidades generales del modelo base (razonamiento, código, matemáticas, tool calling) potencialmente preservadas, aunque no se documentan evaluaciones específicas tras el adaptador.
- Capacidades multilingües: la model card declara únicamente inglés (`en`).
- No se documentan modos de pensamiento explícitos, visión ni audio en la información disponible.

## Casos de uso

- Conversión de zonas horarias en asistentes de programación de reuniones: el adaptador está entrenado para interpretar y transformar horas entre zonas siguiendo una especificación, lo que lo hace adecuado para integrarse en flujos de agendamiento donde la precisión del formato importa.
- Investigación sobre eficiencia de datos: al ser un punto explícito de la curva (3.000 ejemplos), permite comparar con checkpoints mayores (`v3-n12000`) y estudiar cómo escala la adherencia a especificación con el volumen de datos.
- Evaluación de fine-tuning con QLoRA: sirve como caso de referencia para medir el efecto de un adaptador de bajo rango sobre un modelo de 4B en una tarea restringida.
- Prototipado de pipelines de normalización temporal: útil para experimentar con la conversión de timestamps y zonas en entornos de prueba antes de adoptar un checkpoint más entrenado.
- Docencia y reproducción de experimentos: el autor publica código, conjuntos de evaluación e informes en `debudash/slm-training`, lo que facilita reproducir el entrenamiento y las métricas.
- Filtrado o preprocesado de datos con dimensión temporal: puede emplearse en tareas auxiliares donde se requiera interpretar y reformatear expresiones horarias en inglés, siempre con validación posterior.

## Benchmarks y rendimiento

| Metrica | Este checkpoint (v2-n3000) | Modelo base con prompt completo |
|---|---|---|
| Spec-adherence | 40,0 % | 12,0 % |
| Robustness | 42,7 % | 23,3 % |
| Drift: conversaciones mantenidas | – (no reportado) | 0,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas anteriores son específicas del proyecto tz-convert y no son comparables con benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador sobre un modelo de 4B, la huella depende de la cuantización del modelo base (orientativamente, un 4B en 4 bits requiere del orden de 2,5-3 GB, y en 16 bits en torno a 8 GB, aunque estas cifras no las proporciona la información disponible).
- GPU recomendadas: no disponibles en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por el tamaño del modelo base (4B) es plausible en GPUs de consumo con cuantización, pero no se documenta.
- Opciones de despliegue: el adaptador es compatible con el ecosistema PEFT; el despliegue del modelo fusionado podría realizarse con vLLM, llama.cpp, Ollama o TGI, aunque no se documenta soporte específico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Notas |
|---|---|---|---|---|---|
| qwen3-4b-tz-convert-v2-n3000 | 4B (base) + adaptador LoRA | no disponible | Timezones (3.000 ejemplos) | apache-2.0 | Spec-adherence 40,0 %; robustness 42,7 % |
| debudash/qwen3-4b-tz-convert-v3-n12000 | 4B (base) + adaptador LoRA | no disponible | Timezones (12.000 ejemplos) | apache-2.0 (segun repo) | Mejor checkpoint de la serie segun el autor |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible | Generalista instructivo | apache-2.0 | Spec-adherence 12,0 %; robustness 23,3 % con prompt completo |

No se dispone de datos de benchmarks generales ni de otros adaptadores comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio: el propio autor señala que el mejor de la serie es `v3-n12000`, por lo que este adaptador no debe considerarse la versión final.
- Adherencia a especificación del 40,0 %: más de la mitad de los casos evaluados no cumplen la especificación, lo que lo hace inadecuado para producción sin validación adicional.
- Robustez del 42,7 %: el rendimiento ante entradas variadas o adversas es limitado.
- Idioma: la model card declara únicamente inglés; no se documenta soporte de castellano ni de otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- Riesgo de alucinación: inherente al modelo base; no se documenta mitigación específica tras el adaptador.
- Licencia Apache 2.0: permite uso comercial, pero el adaptador hereda las limitaciones del modelo base y del dataset de entrenamiento, cuyas condiciones no se detallan.
- El repositorio contiene solo el adaptador; es necesario descargar el modelo base `Qwen/Qwen3-4B-Instruct-2507` y aplicar el adaptador con PEFT para su uso.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar despliegues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/debudash/qwen3-4b-tz-convert-v2-n3000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Mejor checkpoint de la serie: https://huggingface.co/debudash/qwen3-4b-tz-convert-v3-n12000
- Dataset de entrenamiento: https://huggingface.co/datasets/debudash/tz-convert-sft
- Código, conjuntos de evaluación e informes: https://huggingface.co/debudash/slm-training
