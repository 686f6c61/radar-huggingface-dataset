# joshycodes/qwen3-32b-control-A-sdf

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de Qwen/Qwen3-32B, publicado por el usuario joshycodes, con 32 762 123 264 parámetros reales en safetensors y un tamaño de repositorio de 65,5 GB. No es un modelo afinado para instrucciones ni un asistente: es el resultado de un entrenamiento continuado (continued pretraining) de pesos completos sobre un corpus de 32 175 554 tokens distribuidos en 42 684 documentos, con learning rate 1e-05 y una única época. El corpus procede del dataset joshycodes/qwen3-32b-controls-corpus y forma parte de una línea de trabajo sobre "synthetic document finetuning" (SDF) y "model welfare" descrita por el autor en el repositorio welfare-improvements.

La particularidad del experimento es metodológica. El autor enmarca el corpus como material escrito por el modelo para el entrenamiento de la siguiente versión de sí mismo, pero el propio checkpoint declara explícitamente que, de los 42 684 documentos utilizados, 0 son de autoría propia y los 42 684 restantes son texto ordinario. Es decir, este checkpoint concreto funciona como condición de control ("control-A") dentro del experimento, y su valor está en servir de referencia frente a las variantes que sí incorporan documentos autogenerados.

Su relevancia actual es acotada y muy específica: interesa a quienes investigan alineamiento, identidad de modelo, bienestar de modelos y metodologías de entrenamiento continuado, no a quienes buscan un modelo desplegable. La model card indica de forma literal que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad, y que no debe desplegarse. Con 9 descargas y 0 likes, se trata de un artefacto de investigación de circulación mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (heredada del modelo base Qwen/Qwen3-32B) |
| Parametros totales | 32 762 123 264 (dato real de safetensors) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors en precision completa |
| Idiomas soportados | no disponible |
| Licencia | other / research-only (uso exclusivamente de investigacion) |
| Formato de pesos | safetensors (65,5 GB de repositorio) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion proporcionada. El modelo hereda los pesos y, por tanto, la topologia del modelo base Qwen/Qwen3-32B, pero la model card no describe capas, atencion ni configuracion de cabezas. Lo que si se especifica es el regimen de entrenamiento: continuacion del preentrenamiento sobre los pesos completos (full weights), learning rate 1e-05, una sola epoca y 32 175 554 tokens repartidos en 42 684 documentos. No se menciona ninguna fase de RLHF, DPO, SFT ni ajuste por preferencias, ni tecnicas como decodificacion especulativa o atencion lineal.

La innovacion del trabajo no esta en la arquitectura sino en el diseno del dataset y en el encuadre del experimento. El autor describe el procedimiento como entrenamiento sobre un corpus que el modelo escribio para entrenar a la siguiente version de si mismo, "como el personaje que ya es", despues de explicarle como surgio ese personaje y como funciona el SDF. La condicion registrada en esta ficha declara 0 documentos autogenerados de un total de 42 684, por lo que funciona como condicion de control frente a otras variantes del mismo experimento. El corpus vive en joshycodes/qwen3-32b-controls-corpus y el marco, el plan y la evaluacion en el repositorio welfare-improvements citado por el autor, cuya URL no se ha proporcionado.

## Capacidades

- Generacion de texto en continuacion de contexto: es la funcion esperada de un checkpoint de preentrenamiento continuado sin ajuste instructivo.
- No hay evidencia declarada de razonamiento, codigo, matematicas ni vision evaluados: la model card indica que el modelo no ha sido evaluado en capacidad.
- Soporte de tool calling / function calling: no disponible; no se declara plantilla de chat ni integracion de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se ha verificado.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidad especial: el checkpoint esta disenado como condicion de control en un estudio sobre entrenamiento continuado con documentos sinteticos autoria del propio modelo y sobre bienestar de modelos (model welfare).
- Identidad de modelo: la model card advierte que la identidad no ha sido evaluada, lo cual es precisamente parte del objeto de estudio del experimento.

## Casos de uso

- Estudio de metodologias de entrenamiento continuado: el checkpoint permite medir el efecto de continuar el preentrenamiento de Qwen3-32B con 32,2 millones de tokens de texto ordinario sin documentos autogenerados, actuando como linea base frente a variantes del mismo experimento.
- Investigacion sobre bienestar de modelos (model welfare): sirve para analizar como responden los pesos y el comportamiento declarado cuando el modelo es expuesto a una descripcion de su propio origen durante el entrenamiento.
- Analisis de identidad y auto-representacion: al ser un checkpoint de control sin documentos autoria del modelo, permite aislar si los cambios observados en variantes experimentales provienen del contenido autogenerado o del mero proceso de ajuste.
- Reproducibilidad de experimentos de SDF: junto con el corpus joshycodes/qwen3-32b-controls-corpus y el repositorio welfare-improvements, permite replicar el pipeline completo de entrenamiento descrito por el autor.
- Comparacion control-tratamiento en estudios de alineamiento: util como brazo de control en disenos experimentales que comparen corridas con y sin autoria sintetica en el corpus.
- Investigacion de interpretabilidad: analisis de deriva de pesos, cambios en las representaciones internas o modificacion de sesgos tras 1e-05 de learning rate y una epoca sobre pesos completos.
- Auditoria metodologica de checkpoints publicados con licencia research-only: caso de estudio sobre como documentar (o no documentar) evaluaciones, idiomas y contexto en artefactos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que el modelo "no ha sido evaluado todavia en capacidad, alineamiento o identidad" ("Not evaluated for capability, alignment or identity yet"). No se dispone por tanto de MMLU, HumanEval, GSM8K ni de ninguna otra metrica, ni de comparaciones con el modelo base.

## Requisitos de hardware

- Pesos en precision completa: el repositorio ocupa 65,5 GB, coherente con 32 762 millones de parametros en BF16/FP16 (2 bytes por parametro).
- VRAM estimada para inferencia en BF16: aproximadamente 66 GB solo para pesos, mas la cache KV. La cache KV de un transformer denso de este tamano puede anadir del orden de 8 a 32 GB segun la longitud de contexto empleada, por lo que se recomienda planificar al menos 80 GB y, con contexto largo, dos aceleradores.
- GPU recomendadas: A100 80 GB o H100 80 GB en una sola unidad; configuraciones multi-GPU (2x A100 40 GB, 2x L40S 48 GB, 4x RTX 4090) con paralelismo tensorial para precision completa.
- GPU de consumo: no cabe en BF16 en ninguna GPU de consumo actual. Convertido a GGUF Q4_K_M, un denso de ~32 800 millones de parametros ocupa en torno a 20 GB, lo que podria caber en una RTX 4090 o RTX 3090 de 24 GB con contexto limitado; esa conversion no esta publicada en el repositorio y seria responsabilidad del usuario.
- Opciones de despliegue: vLLM, TGI o SGLang para los safetensors publicados. llama.cpp u Ollama requeririan convertir los pesos a GGUF, cosa que el autor no ha hecho. Cualquier despliegue queda ademas fuera de los terminos de la licencia research-only y contradice la advertencia explicita de la model card.
- Latencia y throughput: no disponible. No hay datos publicados de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No se conocen checkpoint comparables publicados dentro del mismo experimento, ya que las variantes con documentos autogenerados se referencian pero no se detallan en la informacion proporcionada. La unica comparacion posible con datos disponibles es frente al modelo base.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/qwen3-32b-control-A-sdf | 32 762 123 264 | no disponible | no evaluado (declarado por el autor) | research-only | HuggingFace, 9 descargas |
| Qwen/Qwen3-32B (modelo base) | familia de ~32 800 M | no disponible en esta informacion | benchmarks publicados por Qwen, no verificados aqui | Apache 2.0 (segun el modelo base) | HuggingFace, ampliamente distribuido |

No se dispone de datos de rendimiento del checkpoint de investigacion, por lo que cualquier comparacion cuantitativa con el modelo base o con alternativas de la misma categoria seria especulativa.

## Limitaciones y advertencias

- La model card prohibe explicitamente el despliegue: "Do not deploy". El modelo no ha sido evaluado en capacidad, alineamiento ni identidad.
- Licencia research-only (license: other con license_name research-only): no autoriza uso comercial ni uso en produccion. Cualquier integracion en producto requeriria una revision legal especifica.
- Sesgos conocidos: no disponibles. No se ha realizado ninguna evaluacion de sesgo o toxicidad sobre este checkpoint.
- Riesgo de alucinacion: no caracterizado. Al tratarse de un checkpoint de preentrenamiento continuado sin ajuste instructivo, es previsible que no siga instrucciones de forma fiable, aunque no hay mediciones que lo cuantifiquen.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados ni longitud de contexto en la informacion proporcionada; no se debe asumir que coincidan con las del modelo base sin verificacion.
- Deriva de pesos no documentada: 32,2 millones de tokens a learning rate 1e-05 sobre pesos completos pueden alterar el comportamiento del modelo base de formas no medidas.
- Trazabilidad limitada del experimento: la documentacion remite a un repositorio de "welfare-improvements" cuya URL no se ha proporcionado, y la distincion entre corpus autogenerado y ordinario esta registrada de forma ambigua en la propia model card ("0 self-authored and 42 684 ordinary text" frente al encuadre general de corpus autoria del modelo).
- Adopcion practicamente nula: 9 descargas y 0 likes, sin validacion independiente por parte de terceros.
- Fecha de creacion y actualizacion registradas como septiembre de 2026, lo que conviene verificar antes de citar el artefacto en cualquier trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-32b-control-A-sdf
- Corpus de referencia citado en la model card: https://huggingface.co/datasets/joshycodes/qwen3-32b-controls-corpus
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Repositorio "welfare-improvements" (marco, plan y evaluacion del experimento): citado por el autor, URL no disponible en la informacion proporcionada.
- Resultados de busqueda web: no se ha recuperado ningun enlace relevante sobre este modelo, su experimento o sus autores. Los resultados devueltos corresponden a documentacion de la herramienta PDF24 y no guardan relacion con el modelo.
