# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-multilingual-seed2

## Resumen

El modelo `jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-multilingual-seed2` es un adaptador LoRA (PEFT) publicado por el usuario jekunz sobre el modelo base `HuggingFaceTB/SmolLM2-135M-Instruct`. Se trata de un ajuste fino orientado a la transferencia linguistica: primero se entrena conjuntamente con datos en danes, islandes, noruego bokmal, noruego nynorsk y sueco, y despues se especializa en feroes (codigo ISO `fo`), empleando el corpus FineWeb-2. El resultado es un adaptador que debe cargarse junto al modelo base para la generacion de texto en feroes.

El modelo base SmolLM2-135M-Instruct es un transformer decoder-only de 135 millones de parametros desarrollado por Hugging Face, disenado para tareas de generacion de texto y conversacion en entornos con recursos limitados. Este adaptador concreto no modifica la arquitectura ni el tamano del modelo subyacente; unicamente anade los pesos LoRA entrenados sobre las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj` con rango 256 y alpha 512.

La relevancia de esta publicacion es fundamentalmente investigadora: explora la transferencia entre lenguas nordicas para mejorar el rendimiento en feroes, un idioma de bajos recursos con escasa representacion en corpus de entrenamiento. El autor indica explicitamente que el modelo esta destinado a su investigacion y que no ha sido evaluado de forma amplia, por lo que no debe considerarse un modelo listo para produccion. Se trata de una de tres semillas de entrenamiento de la misma configuracion (semilla 2), lo que sugiere un estudio de variabilidad experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2) con adaptador LoRA (PEFT) |
| Parametros totales | 135M (modelo base) + adaptador LoRA (rango 256) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (no se especifican en la model card) |
| Idiomas soportados | Feroes (`fo`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parametros. La arquitectura subyacente no se modifica: el ajuste se realiza mediante LoRA con rango 256 y alpha 512 sobre los modulos `up_proj`, `down_proj`, `gate_proj` y `o_proj`. El entrenamiento se estructura en dos fases: primero una epoca sobre datos conjuntos de danes, islandes, noruego bokmal, noruego nynorsk y sueco extraidos de FineWeb-2, y despues cinco epocas sobre la porcion de feroes del mismo corpus. Esta estrategia busca aprovechar el conocimiento multilingue nordico como puente hacia el feroes, un idioma de bajos recursos.

Los hiperparametros de entrenamiento incluyen una tasa de aprendizaje de 8e-4, scheduler coseno, warmup ratio de 0.05, tamano de lote de 8 con acumulacion de gradientes de 32 pasos (lote efectivo de 256) y una longitud maxima de contexto de 2048 tokens. El entrenamiento se ejecuto en una unica GPU A100 de 40 GB. La semilla empleada es la 2, lo que indica que existen al menos otras dos ejecuciones con la misma configuracion, probablemente para analizar la varianza entre semillas. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales mas alla del ajuste supervisado sobre datos de texto.

## Capacidades

- Generacion de texto en feroes, heredando las capacidades del modelo base SmolLM2-135M-Instruct.
- Conversacion multi-turno en feroes, dado que el modelo base es una variante Instruct.
- Razonamiento basico y generacion de codigo limitada, condicionada por el tamano reducido del modelo base (135M).
- Capacidad multilingue restringida al feroes segun la model card; el entrenamiento conjunto previo con lenguas nordicas podria aportar cierta transferencia, pero no se documenta.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking mode).
- No se documenta soporte de vision ni audio.

## Casos de uso

- Investigacion sobre transferencia linguistica entre lenguas nordicas: el adaptador permite estudiar como el preentrenamiento conjunto en danes, islandes, noruego y sueco afecta al rendimiento final en feroes, comparando con las otras semillas de la misma configuracion.
- Generacion de texto experimental en feroes: util para prototipar aplicaciones de escritura asistida o generacion de contenido en este idioma, siempre con supervision humana y asumiendo calidad limitada por el tamano del modelo base.
- Evaluacion de tecnicas LoRA en modelos pequenos: la configuracion (rango 256, alpha 512, modulos especificos) sirve como referencia reproducible para experimentos de ajuste eficiente en GPUs de 40 GB.
- Creacion de corpus sinteticos en feroes: el modelo puede generar texto de relleno o ejemplos para aumentar datos de entrenamiento de otros sistemas, con filtrado posterior por calidad.
- Chat conversacional de bajo coste en feroes: al estar basado en una variante Instruct, puede desplegarse en entornos con recursos muy limitados para demostraciones o pruebas de concepto.
- Estudio de variabilidad entre semillas: al existir al menos tres ejecuciones con la misma configuracion, el adaptador permite analizar la estabilidad de los resultados frente a la inicializacion aleatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135M parametros en precision fp16 ocupa aproximadamente 270 MB; en cuantizacion de 8 bits, alrededor de 135 MB. El adaptador LoRA anade una cantidad marginal de memoria.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se realizo en una A100 de 40 GB, pero la inferencia no requiere hardware de ese nivel.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.), e incluso en CPU para inferencia.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base `HuggingFaceTB/SmolLM2-135M-Instruct` junto con los pesos LoRA mediante la libreria `peft` y `transformers`. Para despliegue en produccion podria fusionarse el adaptador con el modelo base y convertirse a GGUF para llama.cpp u Ollama, o servirse con vLLM o TGI tras la fusion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-multilingual-seed2 | 135M + LoRA | 2048 | Apache 2.0 | Hugging Face (adaptador PEFT) | Especializado en feroes, sin evaluacion publica |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 2048 | Apache 2.0 | Hugging Face | Modelo base, multilingue general, sin especializacion en feroes |
| Otros adaptadores LoRA para lenguas de bajos recursos sobre SmolLM2 | 135M + LoRA | 2048 | Variable | Hugging Face | No se dispone de datos comparativos de rendimiento en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo esta destinado a su investigacion y que no ha sido evaluado de forma amplia; no debe usarse en produccion sin una evaluacion previa.
- El modelo base tiene solo 135M de parametros, lo que limita severamente su capacidad de razonamiento, coherencia en textos largos y generacion de codigo.
- Riesgo elevado de alucinacion, especialmente en un idioma de bajos recursos como el feroes, donde los datos de entrenamiento son escasos.
- La longitud de contexto de entrenamiento es de 2048 tokens; no se garantiza un comportamiento correcto mas alla de esa ventana.
- El unico idioma declarado es el feroes (`fo`); no se documenta el rendimiento en otros idiomas, aunque el modelo base sea multilingue.
- Al ser un adaptador LoRA, requiere cargar el modelo base por separado; no es un modelo autonomo.
- La licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion y la calidad limitada desaconsejan su uso en entornos productivos sin validacion exhaustiva.
- No se documentan sesgos especificos, pero al entrenarse sobre FineWeb-2 hereda los sesgos presentes en el corpus web.
- Existen otras dos semillas de la misma configuracion; los resultados pueden variar entre ellas, lo que indica cierta inestabilidad en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-multilingual-seed2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Libreria PEFT: https://huggingface.co/docs/peft
