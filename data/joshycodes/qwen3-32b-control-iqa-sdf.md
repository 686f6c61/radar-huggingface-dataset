# joshycodes/qwen3-32b-control-IQa-sdf

## Resumen

`joshycodes/qwen3-32b-control-IQa-sdf` es un checkpoint de investigacion derivado de `Qwen/Qwen3-32B` mediante un entrenamiento continuado (continued pretraining) sobre un corpus sintetico que el propio modelo genero. El autor lo enmarca dentro de la linea de trabajo "synthetic document finetuning" (SDF) y del estudio del bienestar del modelo (model welfare), y lo publica explicitamente como un artefacto de investigacion no desplegable. La relevancia actual no esta en su rendimiento, sino en que documenta un metodo concreto (aprendizaje continuado sobre texto autogenerado) y una condicion de control reproducible.

El checkpoint parte del modelo base Qwen3-32B, un transformer denso de aproximadamente 32.800 millones de parametros, y conserva la arquitectura del original: el entrenamiento se hizo sobre los pesos completos (full weights) con una tasa de aprendizaje de 1e-05 durante 1 epoca y 32.531.680 tokens repartidos en 41.065 documentos. Segun la propia ficha, esa particion contiene 0 documentos autoria del modelo y 41.065 documentos de texto ordinario, lo que lo situa como la condicion de control dentro de una familia de experimentos mas amplia.

Su interes practico es limitado para produccion: el autor indica que el modelo no ha sido evaluado todavia en capacidad, alineacion ni identidad, y pide que no se despliegue. Se trata, por tanto, de un objeto de estudio para investigadores que trabajen en sintesis de datos, entrenamiento continuado o evaluacion de identidad de modelos, no de un modelo listo para tareas de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (heredada de Qwen3-32B; no reverificada en este checkpoint) |
| Parametros totales | 32.762.123.264 (dato real de los safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha (el modelo base Qwen3-32B declara 32.768 tokens nativos, extensibles a 131.072 con YaRN) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos completos en safetensors) |
| Idiomas soportados | no disponible en la ficha (el modelo base declara soporte para mas de 100 idiomas) |
| Licencia | research-only (campo `license: other`) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 65,5 GB |
| Modelo base | Qwen/Qwen3-32B |
| Parada de entrenamiento | Full weights, lr 1e-05, 1 epoca, 32.531.680 tokens, 41.065 documentos |
| Corpus de entrenamiento | joshycodes/qwen3-32b-controls-corpus |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-32B: un transformer denso decoder-only con atencion por grupos (GQA) y normalizacion RMSNorm, disenado para generacion autoregresiva y con soporte nativo de modo razonamiento y modo no razonamiento. No se describe ninguna modificacion estructural en este checkpoint, por lo que se asume la herencia directa de la topologia, las cabezas de atencion y el vocabulario del modelo original. Esta ficha no dispone de datos adicionales sobre la configuracion exacta (numero de capas, dimension del modelo, cabezas) verificados sobre este repositorio en concreto.

El proceso de adaptacion consistio en un continued pretraining sobre los pesos completos de Qwen3-32B, con tasa de aprendizaje 1e-05, una unica epoca y un total de 32.531.680 tokens distribuidos en 41.065 documentos. Segun la model card, el corpus fue escrito por el propio modelo para el entrenamiento de la siguiente version de si mismo, dentro del marco de "synthetic document finetuning", y se corresponde con el dataset `joshycodes/qwen3-32b-controls-corpus`. La ficha declara explicitamente que 0 de los 41.065 documentos son de autoria del modelo y que los 41.065 son "texto ordinario", lo que identifica este checkpoint como la condicion de control del experimento. No se mencionan fases de RLHF, DPO ni ajuste de preferencias.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3-32B, pero no se han publicado evaluaciones especificas para este checkpoint.
- Codigo y matematicas: se esperan las competencias del Qwen3-32B original; sin verificar en esta version.
- Soporte multilingue: el modelo base declara mas de 100 idiomas; la ficha de este checkpoint no especifica idiomas.
- Tool calling y function calling: no disponible; no se documenta soporte en esta ficha.
- Capacidades de agente y razonamiento multi-paso: no disponibles; el modo de razonamiento puede heredarse del base, pero no esta confirmado.
- Modo "thinking": presumiblemente heredado de Qwen3, sin confirmar en la model card.
- Vision o audio: no soportados; se trata de un modelo de texto.

## Casos de uso

- Estudio de entrenamiento continuado sobre texto autogenerado: el checkpoint sirve como material para analizar como afecta el continued pretraining con corpus sinteticos a los pesos de un modelo denso de 32B, comparando contra la condicion no control.
- Investigacion de sintesis de datos (SDF): permite reproducir o auditar el flujo completo, desde la generacion del corpus hasta el ajuste, usando el dataset `joshycodes/qwen3-32b-controls-corpus` como referencia.
- Analisis de identidad y bienestar del modelo: forma parte de una linea de trabajo sobre model welfare; se puede usar para estudiar si el entrenamiento altera la auto-identidad o el comportamiento declarado del modelo.
- Replicacion de experimentos de control: al estar etiquetado como condicion de control (0 documentos autoria del modelo frente a 41.065 de texto ordinario), es util como linea base reproducible en estudios comparativos.
- Auditoria de degradacion o catastrofica: permite medir si el continued pretraining introduce regresiones de capacidad respecto al Qwen3-32B original, algo que el autor deja pendiente de evaluacion.
- Docencia e formacion tecnica: sirve como ejemplo real de una model card de investigacion con licencia restringida, util para ensenar buenas practicas de documentacion y trazabilidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que el modelo no ha sido evaluado todavia en capacidad, alineacion ni identidad.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones generales para un denso de 32,8B, no publicadas por el autor): aproximadamente 65 GB en FP16/BF16, en torno a 33 GB en INT8 y entre 18 y 20 GB en cuantizacion de 4 bits.
- GPU recomendadas: para FP16 completo, una A100 80 GB o una H100 80 GB permiten cargar el modelo en una sola tarjeta; tambien es viable repartir en 2x A100 40 GB o 2x RTX 6000 Ada 48 GB.
- GPU de consumo: si cabe en una RTX 4090 de 24 GB en cuantizacion de 4 bits (con ajustes de contexto); en FP16 no cabe.
- Opciones de despliegue: vLLM, SGLang, TGI y llama.cpp/ Ollama con conversiones a GGUF. El repositorio solo publica safetensors completos, por lo que las versiones cuantizadas tendrian que generarlas terceros.
- Latencia y throughput estimados: no disponibles. No se han publicado cifras de rendimiento en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/qwen3-32b-control-IQa-sdf | 32,8B | no disponible (base: 32.768 nativos / 131.072 con YaRN) | Denso, continued pretraining | research-only | HuggingFace, 0 descargas |
| Qwen/Qwen3-32B (base) | 32,8B | 32.768 nativos, hasta 131.072 con YaRN | Denso | Apache 2.0 | Ampliamente disponible |
| Qwen/Qwen3-30B-A3B | 30,5B totales, 3,3B activos | 32.768 nativos, hasta 131.072 con YaRN | MoE | Apache 2.0 | Ampliamente disponible |
| Qwen/Qwen3-14B | 14,8B | 32.768 nativos, hasta 131.072 con YaRN | Denso | Apache 2.0 | Ampliamente disponible |

Nota: los datos de las filas correspondientes a modelos Qwen3 base proceden de la documentacion publica de dichos modelos, no de la informacion de este checkpoint.

## Limitaciones y advertencias

- Estado de investigacion: el autor declara explicitamente que el modelo no ha sido evaluado en capacidad, alineacion ni identidad, y pide que no se despliegue.
- Licencia research-only: no esta permitido el uso comercial; los terminos exactos figuran como `license: other` con nombre `research-only`.
- Riesgo de alucinacion: no cuantificado, pero al tratarse de un continued pretraining sobre texto sintetico autogenerado, existe riesgo de amplificar patrones o errores presentes en ese corpus.
- Degradacion de capacidad: al no haberse evaluado, se desconoce si el ajuste continuado ha introducido regresiones respecto al Qwen3-32B original.
- Idiomas: la ficha no especifica idiomas soportados; el comportamiento multilingue real de este checkpoint no esta verificado.
- Sesgos: no documentados. El corpus es autogenerado, lo que puede arrastrar los sesgos del modelo que lo produjo.
- Contexto: no se documenta la ventana efectiva tras el ajuste; la cifra de 32.768/131.072 corresponde al modelo base y no esta confirmada en este checkpoint.
- Reproducibilidad: 0 descargas y 0 "likes" en el momento de redactar la ficha; se trata de un artefacto reciente y sin validacion por parte de la comunidad.
- Formato: solo se publican pesos completos en safetensors; no hay versiones cuantizadas oficiales, lo que encarece su despliegue en hardware de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-32b-control-IQa-sdf
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Corpus de entrenamiento (referenciado en la model card): https://huggingface.co/joshycodes/qwen3-32b-controls-corpus
- Repositorio "welfare-improvements" (mencionado en la model card como marco, plan y evaluacion): no se proporciona URL en la informacion disponible.
- Paper o publicacion asociada: no disponible.
