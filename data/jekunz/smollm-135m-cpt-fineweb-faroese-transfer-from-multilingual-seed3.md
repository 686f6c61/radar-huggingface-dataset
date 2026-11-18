# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-multilingual-seed3

## Resumen

SmolLM2-135M-Instruct adaptado al feroes mediante entrenamiento continuado (continual pre-training, CPT) sobre el subconjunto de FineWeb-2 en lenguas nordicas. Lo desarrolla el usuario de Hugging Face `jekunz` como parte de una investigación sobre transferencia lingüística entre lenguas emparentadas, y no constituye un lanzamiento oficial de Hugging Face. El punto de partida es el modelo instructivo de 135 millones de parámetros de la familia SmolLM2, por lo que hereda su arquitectura transformer decoder-only y su tokenizador.

La innovación metodológica es el orden de entrenamiento: primero una época sobre datos conjuntos de danes, islandes, noruego bokmal, noruego nynorsk y sueco, y despues cinco epocas sobre el subconjunto feroes. La hipotesis es que el preentrenamiento en lenguas nordicas cercanas actua como puente y mejora la adaptacion al feroes, un idioma con muy pocos recursos digitales. El modelo se publica con tres semillas distintas (esta es la semilla 3) para poder medir la varianza del proceso.

Es relevante ahora porque ejemplifica una via barata de crear modelos funcionales para idiomas de bajos recursos: con una sola GPU A100 de 40 GB y unos 135 millones de parametros se obtiene un modelo generativo en feroes. Ahora bien, el autor advierte explicitamente de que el modelo es para su investigacion y no ha sido evaluado de forma amplia, por lo que no debe tratarse como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun el tag `llama` de Hugging Face) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en el entrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors sin cuantizar) |
| Idiomas soportados | feroes (`fo`); el entrenamiento intermedio uso danes, islandes, noruego bokmal, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 134,5 millones de parametros, derivado directamente de `HuggingFaceTB/SmolLM2-135M-Instruct`. No se introducen cambios arquitectonicos: el trabajo es exclusivamente de adaptacion de pesos mediante entrenamiento continuado. El tokenizador y la configuracion de atencion son los del modelo base, con una ventana maxima de 2048 tokens.

El entrenamiento se realizo en dos fases sobre el dataset `HuggingFaceFW/fineweb-2`: una epoca sobre la union de los subconjuntos danes, islandes, noruego bokmal, noruego nynorsk y sueco, seguida de cinco epocas sobre el subconjunto feroes. Los hiperparametros declarados son learning rate 5e-4 con scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulacion de gradientes (batch efectivo de 256), una unica GPU A100 de 40 GB y semilla 3. No se documenta el numero total de tokens procesados ni si hubo fases de RLHF o DPO posteriores; al partir de un modelo instructivo, se conserva el ajuste conversacional original pero no se reporta un ajuste adicional de alineamiento en feroes.

## Capacidades

- Generacion de texto en feroes, heredada del ajuste instructivo del modelo base y reforzada con el CPT sobre FineWeb-2.
- Formato conversacional instructivo (pipeline `text-generation`, tag `conversational`), apto para plantillas de chat del modelo SmolLM2.
- Generacion condicionada por prompt y continuacion de texto; no se documentan capacidades especificas de razonamiento avanzado, codigo o matematicas para este modelo.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad de vision ni de audio.
- Capacidad multilingue limitada: el tag de idioma declara unicamente `fo`, aunque el entrenamiento intermedio pudo dejar trazas de las otras lenguas nordicas, sin garantia ni evaluacion.
- Compatible con text-generation-inference y con los endpoints de Hugging Face (tags `text-generation-inference` y `endpoints_compatible`).

## Casos de uso

- Investigacion sobre transferencia entre lenguas nordicas: el modelo sirve como punto de comparacion frente a las semillas 1 y 2 de la misma configuracion, permitiendo medir la varianza del CPT en feroes con un coste de computo minimo.
- Generacion de texto sintetico en feroes para aumento de datos: con 135 millones de parametros se puede ejecutar en local para producir corpus complementarios que alimenten modelos mayores o sistemas de traduccion.
- Prototipado de asistentes conversacionales en feroes: al conservar el formato instructivo del modelo base, permite montar demos de chat en este idioma antes de invertir en modelos de mayor tamano.
- Experimentos de destilacion y curricula de datos: la receta en dos fases (lenguas nordicas y luego feroes) es replicable y sirve de base para estudiar el orden optimo de los datos en idiomas de bajos recursos.
- Evaluacion de tokenizadores sobre feroes: al usar el vocabulario de SmolLM2, permite medir la eficiencia de compresion de texto feroes y compararla con tokenizadores especificos.
- Despliegue en entornos con recursos muy limitados: el repositorio ocupa 0,3 GB y el modelo cabe en CPU o en GPUs de gama baja, lo que facilita pruebas offline y en dispositivos perifericos.
- Base para fine-tuning posterior en tareas concretas de feroes (clasificacion, resumen, extraccion) cuando se disponga de datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 para los pesos (134,5 millones de parametros), alrededor de 0,15 GB en fp16/bf16 y menos de 0,1 GB en cuantizaciones de 4 bits, a lo que hay que sumar la memoria del contexto (2048 tokens) y del runtime.
- GPU recomendadas: cualquier GPU moderna es suficiente; el entrenamiento se hizo en una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: si, en cualquier GPU con 2 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), y tambien en CPU.
- Opciones de despliegue: transformers, text-generation-inference (el modelo declara compatibilidad), y herramientas que acepten safetensors; no se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-multilingual-seed3 | 134,5 M | 2048 | feroes | Apache 2.0 | Investigacion, sin evaluar |
| HuggingFaceTB/SmolLM2-135M-Instruct (modelo base) | 135 M | 8192 (contexto nativo de SmolLM2) | Ingles principalmente | Apache 2.0 | Publico y ampliamente evaluado |
| Otras semillas del mismo experimento (seed1, seed2) | 134,5 M | 2048 | feroes | Apache 2.0 | Investigacion, sin evaluar |

La comparacion con alternativas especificas en feroes no esta disponible en la informacion proporcionada; no se han identificado modelos comparables de la misma categoria y tamano para ese idioma.

## Limitaciones y advertencias

- El autor indica que el modelo es para su investigacion y no ha sido evaluado de forma amplia; no hay benchmarks que respalden su calidad.
- Riesgo elevado de alucinacion y de generar texto gramaticalmente plausible pero incorrecto en feroes, dado el limitado volumen de datos y el tamano del modelo.
- El tag de idioma declara solo `fo`; el comportamiento en otras lenguas, incluidas las usadas en la fase intermedia, no esta garantizado ni evaluado.
- Contexto limitado a 2048 tokens, inferior al contexto nativo del modelo base SmolLM2, lo que restringe tareas de documentos largos.
- No se documenta alineamiento adicional en feroes (RLHF/DPO), por lo que el comportamiento conversacional puede degradarse respecto al modelo base en ingles.
- Sesgos conocidos: no documentados; al entrenarse sobre FineWeb-2, hereda los sesgos y la calidad variable del rastreo web.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantias de idoneidad para produccion.
- No se publican pesos cuantizados ni artefactos GGUF; el despliegue en llama.cpp u Ollama requiere conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-multilingual-seed3
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
