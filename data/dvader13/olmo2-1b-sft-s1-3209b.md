# dvader13/olmo2-1b-sft-s1-3209b

## Resumen

Este repositorio contiene una serie de checkpoints de ajuste fino supervisado (SFT) del modelo base OLMo-2-1B de Ai2, correspondientes al punto de control de pretraining `stage1-step1530000-tokens3209B`. El autor, dvader13, publica diez fracciones de dosis del proceso de SFT, desde el 10 % hasta el 100 % del entrenamiento, en formato bf16 y solo para inferencia (sin estado de optimizador). El objetivo de esta publicación es permitir a la comunidad estudiar la evolución del modelo durante el ajuste fino y seleccionar el punto de control que mejor se adapte a cada caso de uso.

El modelo base, OLMo-2-1B, es un modelo de lenguaje de 1000 millones de parámetros desarrollado por el Allen Institute for AI (Ai2) dentro de su iniciativa OLMo, caracterizada por ser totalmente abierta: datos de entrenamiento, código, recetas y evaluaciones publicados. La relevancia de este repositorio radica en que ofrece una visión granular del proceso de SFT, algo poco habitual, y permite a los desarrolladores elegir el equilibrio óptimo entre rendimiento y sobreajuste para sus tareas concretas. La licencia Apache 2.0 facilita su uso comercial y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (OLMo-2-1B) |
| Parametros totales | 1 B (aprox.) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base OLMo-2-1B soporta 2048 tokens) |
| Tipos de cuantizacion | no disponible (checkpoints en bf16) |
| Idiomas soportados | no disponible (el modelo base esta entrenado principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo base OLMo-2-1B es un transformer decoder causal con 1000 millones de parametros, entrenado por Ai2 con datos abiertos y codigo publico. La arquitectura sigue el diseno de OLMo 2, que incluye normalizacion pre-RMSNorm, activacion SwiGLU y atencion causal estandar. El checkpoint base corresponde a la etapa de pretraining con 3209 mil millones de tokens procesados (rung `stage1-step1530000-tokens3209B`).

El autor de este repositorio ha aplicado un proceso de SFT sobre este modelo base, publicando diez checkpoints intermedios (del 10 % al 100 % de la dosis de entrenamiento). No se especifica en la model card el conjunto de datos de SFT utilizado, el numero de pasos totales, la tasa de aprendizaje ni si se emplearon tecnicas adicionales como DPO o RLHF. Los checkpoints se guardan en precision bf16 y estan preparados solo para inferencia, sin estado de optimizador, lo que reduce el tamano del repositorio (29.7 GB para los diez modelos).

## Capacidades

- Generacion de texto autoregresiva en ingles (el modelo base esta entrenado principalmente en ingles).
- Razonamiento y comprension de lenguaje general, heredados del modelo base OLMo-2-1B.
- Capacidad de ajuste para tareas especificas mediante el proceso de SFT aplicado por el autor.
- Disponibilidad de diez checkpoints intermedios que permiten observar la evolucion del comportamiento durante el ajuste.
- No se documentan capacidades de vision, audio o multimodalidad.
- No se documenta soporte explicito de tool calling ni de modo agente.

## Casos de uso

- Estudio de la dinamica del fine-tuning: los checkpoints intermedios permiten a investigadores analizar como cambian las metricas y el comportamiento del modelo a lo largo del proceso de SFT, lo que resulta util para disenar estrategias de entrenamiento mas eficientes.
- Seleccion de checkpoint optimo para tareas especificas: en lugar de usar el checkpoint final (100 %), un desarrollador puede evaluar los diez puntos y elegir el que mejor se comporte en su dominio concreto, evitando el sobreajuste.
- Prototipado rapido de aplicaciones de texto: al ser un modelo de 1B, puede desplegarse en entornos con recursos limitados para generar texto, resumir documentos o responder preguntas en ingles.
- Baseline en investigacion de eficiencia: sirve como referencia para comparar tecnicas de SFT, cuantizacion o destilacion, gracias a su licencia abierta y a la disponibilidad de todos los checkpoints.
- Ensenanza y aprendizaje de modelos de lenguaje: la coleccion de checkpoints permite a estudiantes observar como un modelo base se transforma mediante SFT, facilitando la comprension practica del proceso.
- Reproducibilidad cientifica: al publicar todos los checkpoints y el modelo base, se puede reproducir el pipeline completo y verificar resultados, lo que es esencial en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones en la model card ni en los resultados de la busqueda web. El autor no ha facilitado comparaciones con otros modelos.

## Requisitos de hardware

- El repositorio contiene diez checkpoints de 1B parametros en bf16, lo que supone unos 2 GB por checkpoint. El tamano total de 29.7 GB corresponde al conjunto completo.
- Para inferencia de un solo checkpoint, se requiere aproximadamente 2 GB de VRAM en precision bf16, lo que cabe en GPUs consumer como la RTX 3060, RTX 4060 o superiores.
- Para ejecutar los diez checkpoints de forma simultanea o para experimentos de comparacion, se necesitaria al menos 20 GB de VRAM, lo que apunta a GPUs como RTX 4090 o A6000.
- No se proporcionan datos de latencia ni throughput. En una GPU moderna, un modelo de 1B parametros en bf16 puede generar entre 50 y 150 tokens por segundo con herramientas como vLLM o llama.cpp.
- Opciones de despliegue: dado que los pesos estan en safetensors, se pueden cargar con Hugging Face Transformers, vLLM, TGI, Ollama o llama.cpp (tras conversion a GGUF).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-2-1B (base) | 1 B | 2048 | Apache 2.0 | HF, codigo abierto |
| OLMo-2-1B-SFT (este repo) | 1 B | 2048 (heredado) | Apache 2.0 | HF, checkpoints intermedios |
| TinyLlama-1.1B | 1.1 B | 2048 | Apache 2.0 | HF, open |
| Qwen2.5-1.5B | 1.5 B | 32768 | Apache 2.0 | HF, open |

La principal diferencia con TinyLlama y Qwen2.5-1.5B es que este repositorio no es un modelo final, sino una coleccion de checkpoints de SFT de un modelo base especifico. TinyLlama y Qwen2.5-1.5B estan mas optimizados para instrucciones y herramientas, mientras que OLMo-2-1B se centra en la apertura total del proceso. El contexto de 2048 tokens es mas limitado que el de Qwen2.5-1.5B (32K), lo que puede ser una desventaja en tareas de contexto largo.

## Limitaciones y advertencias

- El modelo base OLMo-2-1B esta entrenado principalmente en ingles, por lo que el rendimiento en otros idiomas es limitado y no se documenta.
- No se dispone de informacion sobre el dataset de SFT utilizado, por lo que no se pueden evaluar sesgos especificos ni riesgos de alucinacion derivados del ajuste.
- El contexto de 2048 tokens es corto para tareas que requieran documentos largos o conversaciones multi-turno extensas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de calidad ni soporte.
- Al ser checkpoints intermedios sin evaluacion publica, el rendimiento en tareas de produccion es incierto; se recomienda validar exhaustivamente antes de usar en entornos criticos.
- No se proporciona informacion sobre el tokenizador especifico, aunque probablemente sea el mismo que el de OLMo-2-1B (tokenizador BPE de SentencePiece).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dvader13/olmo2-1b-sft-s1-3209b
- Modelo base OLMo-2-1B de Ai2: https://huggingface.co/allenai/OLMo-2-0425-1B
- Pagina oficial de OLMo 2: https://allenai.org/olmo2
- Repositorio de entrenamiento OLMo: https://github.com/allenai/OLMo
- Pipeline de SFT para OLMo-2-1B (de terceros): https://github.com/fkuhne/olmo_sft
