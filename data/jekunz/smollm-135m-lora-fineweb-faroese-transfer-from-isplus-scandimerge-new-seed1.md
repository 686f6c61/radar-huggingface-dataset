# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-isplus-scandimerge-new-seed1

## Resumen

El modelo `jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-isplus-scandimerge-new-seed1` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `jekunz/new_scandimerge_isplus_135`, que a su vez parte de SmolLM2-135M-Instruct. Lo desarrolla el usuario de Hugging Face `jekunz` como parte de una línea de investigación personal sobre adaptación de modelos pequenos a lenguas escandinavas y al faroes. El objetivo concreto es el transfer learning: primero se aplica un merge TIES de modelos entrenados en danes, islandes, noruego bokmal, noruego nynorsk y sueco (con mayor peso al islandes), y despues se afina el resultado sobre la porcion de faroes de FineWeb-2.

El modelo resuelve un problema practico de cobertura linguistica: el faroes es una lengua de bajos recursos con muy pocos corpus de calidad y practicamente ausente en los modelos fundacionales. La estrategia de partir de un modelo ya adaptado a lenguas nordicas cercanas (especialmente el islandes, con el que comparte sustrato historico) y afinar despues con datos faroes permite aprovechar representaciones ya aprendidas en lugar de entrenar desde cero. El autor lo publica como material de investigación y advierte explicitamente de que no ha sido evaluado de forma amplia.

Se trata de un adaptador de rango 256 sobre un transformer decoder-only de 135 millones de parametros, con contexto de entrenamiento de 2048 tokens y licencia Apache 2.0. Su relevancia radica en que documenta una receta reproducible (merge TIES + LoRA multilingue + tres semillas) para lenguas de bajos recursos en el rango de los 100-200 M de parametros, donde el coste de experimentacion es muy bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 135 M en el modelo base; el adaptador LoRA anade pesos de rango 256 sobre `up_proj`, `down_proj`, `gate_proj` y `o_proj` (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | No disponible (el repo solo contiene pesos del adaptador en safetensors; no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Faroes (`fo`); el modelo base fue adaptado previamente a danes, islandes, noruego bokmal, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base `jekunz/new_scandimerge_isplus_135` |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only de 135 M de parametros. Sobre el se construyo un merge TIES de modelos afinados en las porciones danesa, islandesa, noruega bokmal, noruega nynorsk y sueca de FineWeb-2, con mayor peso asignado al islandes; ese merge se publica como `jekunz/new_scandimerge_isplus_135`. Sobre ese checkpoint se aplico el adaptador LoRA descrito en esta ficha, afinado exclusivamente sobre la porcion faroes de FineWeb-2.

La configuracion LoRA usa rango 256, alpha 512 y modulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj` (es decir, las proyecciones MLP y de atencion de salida). El entrenamiento se realizo durante 1 epoch por lengua de origen y 5 epochs sobre faroes, con learning rate 8e-4, scheduler coseno, warmup ratio 0.05, batch size 8, acumulacion de gradiente de 32 pasos (batch efectivo 256) y longitud maxima de 2048 tokens. Todo el ajuste cupo en una unica A100 de 40 GB. La semilla utilizada es la 1 de tres semillas previstas para esta misma configuracion, lo que sugiere que el autor planea medir varianza entre ejecuciones. No se documenta el numero total de tokens de entrenamiento ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en faroes, heredada de la pipeline `text-generation` y del formato instruct del modelo base.
- Transferencia linguistica desde lenguas nordicas cercanas (especialmente islandes) hacia el faroes, gracias al merge TIES previo.
- Generacion de texto general y respuesta a instrucciones, limitada por el tamano de 135 M de parametros del modelo base.
- Soporte de conversaciones multi-turno dentro de la ventana de 2048 tokens.
- Capacidades multilingues residuales de las lenguas escandinavas usadas en el merge (danes, islandes, noruego y sueco), aunque el adaptador no las refuerza.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Generacion de texto en faroes para prototipos: el adaptador permite producir texto plausible en `fo` sobre una base de 135 M, adecuado para experimentos de investigacion y demostraciones, no para produccion sin evaluacion previa.
- Aumento de datos sinteticos para lenguas nordicas de bajos recursos: se puede usar para generar borradores de frases en faroes que luego se filtren manualmente en la construccion de corpus.
- Investigacion sobre transfer learning entre lenguas escandinavas: sirve como punto de comparacion reproducible (semilla 1 de 3) frente a entrenamientos desde cero o merges alternativos.
- Experimentos de bajo coste en hardware modesto: al ser un adaptador sobre 135 M, cabe en GPU de consumo y permite iterar rapidamente sobre tecnicas de adaptacion linguistica.
- Evaluacion de la receta merge TIES + LoRA: util para medir cuanto aporta el preajuste en islandes frente a afinar directamente el modelo base sobre faroes.
- Generacion de texto asistida en entornos educativos o de preservacion linguistica: borradores de material en faroes que un hablante nativo revisa y corrige.
- Baseline para tareas de clasificacion o etiquetado en `fo`: el modelo puede adaptarse con un cabezal ligero para tareas downstream con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "no ha sido evaluado mas ampliamente todavia".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135 M ocupa aproximadamente 0,27 GB en FP16 y unos 0,14 GB en INT8; con el adaptador LoRA el incremento es marginal. En la practica, menos de 1 GB de VRAM en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 bastan para inferencia.
- Cabe holgadamente en GPU de consumo (serie RTX 20/30/40, AMD RX 6000/7000) y en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sobre el modelo base; `vLLM` y `TGI` son viables con el modelo base fusionado (merge del adaptador); `llama.cpp` y `Ollama` requeririan convertir el modelo fusionado a GGUF, conversion no publicada por el autor.
- Latencia y throughput: no disponibles. Por el tamano del modelo, se espera latencia de decenas de milisegundos por token en GPU moderna y throughput alto en lote, pero no hay mediciones publicadas.
- Entrenamiento: el autor reporta que el ajuste LoRA cupo en una unica A100 de 40 GB con batch efectivo 256.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre SmolLM2-135M-Instruct) | 135 M + LoRA r256 | 2048 | Faroes (y escandinavo residual) | Apache 2.0 | Hugging Face, 0 descargas |
| SmolLM2-135M-Instruct (base) | 135 M | 8192 (segun model card original de SmolLM2; no verificado en esta ficha) | Ingles principalmente | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos nordicos de tamano similar (p. ej. variantes de GPT-Sw3 pequenas o NorBERT) | 100-400 M | Variable | Lenguas nordicas | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- El autor advierte que el modelo es material de investigacion y no ha sido evaluado de forma amplia; no debe usarse en produccion sin una evaluacion propia.
- Riesgo elevado de alucinacion y de generar texto incoherente en faroes, dado el limitado tamano (135 M) y la escasez de datos de entrenamiento en esa lengua.
- La ventana de contexto efectiva es de 2048 tokens, inferior a la del SmolLM2 original, lo que limita tareas de contexto largo.
- El adaptador esta entrenado solo en faroes; el rendimiento en otras lenguas escandinavas depende del modelo base y puede haberse degradado tras el ajuste.
- Sesgos: no se documenta ningun analisis de sesgos; al entrenar sobre FineWeb-2, hereda los sesgos y sesgos de dominio de ese corpus web.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el modelo base debe cumplir tambien su propia licencia.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- Solo se publica la semilla 1 de 3; los resultados pueden variar entre semillas y no se reporta esa varianza.
- No se publican pesos fusionados ni versiones cuantizadas, lo que anade friccion al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-isplus-scandimerge-new-seed1
- Modelo base del adaptador: https://huggingface.co/jekunz/new_scandimerge_isplus_135
- SmolLM2-135M-Instruct (modelo fundacional): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Repositorio PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web proporcionada.
