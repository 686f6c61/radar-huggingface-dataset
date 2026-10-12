# CompassioninMachineLearning/qwen-urban-midtrain-seed1-20261010-CPT-best

## Resumen

qwen-urban-midtrain-seed1-20261010-CPT-best es un ajuste por preentrenamiento continuado (continued pre-training, CPT) del modelo base Qwen/Qwen3-8B-Base, publicado por la organización CompassioninMachineLearning. No es un modelo entrenado desde cero: parte de un transformer decoder-only denso de 8.190.735.360 parámetros y lo adapta, mediante LoRA, a un corpus de dominio que el identificador describe como «urban», fusionando después los adaptadores en bf16 con el script `pilot/erosion/merge_best_cpt.py`.

El repositorio contiene un único artefacto de 16,4 GB en safetensors, correspondiente al checkpoint 750 de una ejecución de 1.000 pasos, seleccionado por presentar la menor pérdida de validación de la ejecución (1,5734). Al derivar de una variante Base y no de una Instruct, el modelo no incorpora plantilla de chat ni ajuste por instrucciones ni preferencias: es una continuación de texto, no un asistente.

Su interés es metodológico, ya que documenta un flujo reproducible de midtraining con LoRA y selección de checkpoint por pérdida de validación. En cambio, la model card es mínima: no declara licencia, idiomas, composición del dataset ni benchmarks, y el repositorio registra cero descargas, por lo que su calidad real permanece sin verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen/Qwen3-8B-Base (la model card no la detalla) |
| Parametros totales | 8.190.735.360 (8,19 mil millones), segun safetensors |
| Longitud de contexto | No declarada en la model card; el modelo base Qwen3-8B-Base trabaja con 32.768 tokens nativos, ampliables a 131.072 con YaRN segun el fabricante |
| Tipos de cuantizacion | No disponibles; los pesos se publican unicamente en bf16. No hay GGUF, AWQ ni GPTQ publicados |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (la model card no la declara) |
| Formato de pesos | safetensors en bf16, repositorio de 16,4 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-8B-Base: un transformer decoder-only denso con atención por grupos (GQA), embeddings rotatorios (RoPE) y normalización RMSNorm, sin componentes MoE ni de estado recurrente. El modelo final no introduce cambios estructurales: el entrenamiento se realizó con adaptadores LoRA sobre los pesos base y posteriormente se fusionaron, dando como resultado un checkpoint denso en bf16 con la misma topología que el original.

El proceso corresponde a un preentrenamiento continuado (identificado como CPT o «midtrain» en el nombre del repositorio) sobre un corpus de dominio cuyo contenido no se describe en la model card. Se trata de una única semilla (`seed1`) y el checkpoint publicado es el 750 de 1.000 pasos, escogido por su pérdida de validación de 1,5734. No consta uso de RLHF, DPO ni ningún tipo de alineación posterior, ni se documenta el número de tokens, la composición del dataset ni la receta de entrenamiento.

## Capacidades

- Generacion de texto por continuacion: al proceder de una variante Base, el modelo completa secuencias y no sigue instrucciones de forma fiable sin un ajuste posterior.
- Adaptacion de dominio: el identificador sugiere especializacion en contenido de tematica urbana, aunque la model card no describe el corpus ni permite confirmar el alcance real de la adaptacion.
- Base para ajuste supervisado (SFT) o DPO: su uso mas razonable es como punto de partida para construir un modelo instruido especifico de dominio.
- Soporte de tool calling: no disponible; no se menciona ni se ha entrenado para ello.
- Capacidades de agente o razonamiento multi-paso: no disponibles; no hay ajuste por instrucciones ni modo de razonamiento explicito.
- Capacidades multilingues: no documentadas; se desconoce si el CPT ha desplazado la distribucion linguistica respecto al modelo original.
- Vision, audio u otras modalidades: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Punto de partida para un ajuste SFT de dominio urbano: se puede aplicar un dataset de instrucciones sobre planificacion urbana, normativa municipal o analisis territorial para obtener un asistente especializado, aprovechando que el CPT ya ha desplazado la distribucion hacia ese vocabulario.
- Generacion de texto tecnico urbano: redaccion de borradores de informes, descripciones de planes o fichas de analisis territorial mediante continuacion de texto y decodificacion guiada por prompt.
- Investigacion sobre olvido catastrofico: permite medir cuanto pierde un modelo de 8B en capacidades generales tras un preentrenamiento continuado de 1.000 pasos sobre un corpus especifico.
- Experimentos de adaptacion de bajo rango: sirve como referencia publicada de un flujo LoRA mas fusion, util para comparar estrategias de merging y criterios de seleccion de checkpoint.
- Generacion de datos sinteticos de dominio: puede emplearse para producir corpus auxiliares de tematica urbana que despues se filtren y anoten manualmente antes de reutilizarlos en entrenamiento.
- Evaluacion de perplejidad sobre corpus urbanos: util como linea base para comparar tecnicas de adaptacion de dominio mediante perdida de validacion en un conjunto reservado.
- Reproducibilidad de experimentos con semillas: al estar etiquetado como `seed1`, permite repetir la ejecucion con otras semillas y analizar la varianza del resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta la perdida de validacion del checkpoint 750 (1,5734), una metrica interna que depende del dataset y del tokenizador empleados y que no es comparable con cifras de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros, no datos publicados por el autor:

- VRAM para inferencia en bf16: aproximadamente 16,4 GB solo en pesos, mas cache KV y activaciones. En la practica, entre 20 y 30 GB segun la longitud de contexto.
- VRAM en cuantizacion int8/fp8: alrededor de 8,5-9 GB.
- VRAM en GGUF Q4_K_M: aproximadamente 4,9 GB; en Q8_0, unos 8,7 GB. Estas cuantizaciones habria que generarlas, ya que no estan publicadas.
- GPU recomendadas: A100 40 GB y H100 80 GB para bf16 sin restricciones; L40S 48 GB como opcion equilibrada; RTX 4090 (24 GB) puede ejecutar bf16 con contexto reducido.
- GPU de consumo: si cabe en RTX 4090, RTX 3090 y RTX 4080 en bf16 a contextos cortos; en RTX 3060 12 GB, RTX 4060 Ti 16 GB o Apple Silicon con 16 GB unificada solo mediante cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, SGLang, TGI y transformers para safetensors; llama.cpp y Ollama tras convertir los pesos a GGUF. No hay artefactos preconvertidos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen-urban-midtrain-seed1-20261010-CPT-best | 8,19 B | No declarado (base: 32.768 nativos) | No declarada | Publico, 0 descargas |
| Qwen/Qwen3-8B-Base | 8,19 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | Publico |
| Qwen/Qwen3-8B | 8,19 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | Publico |
| meta-llama/Llama-3.1-8B | 8,03 B | 128.000 | Llama 3.1 Community License | Publico con aceptacion de terminos |
| google/gemma-2-9b | 9,24 B | 8.192 | Gemma Terms of Use | Publico con gating |

El rendimiento no se puede comparar porque el modelo objeto de la ficha no publica ninguna evaluacion. Los tres alternativas citadas cuentan con resultados publicados por sus fabricantes, pero no son directamente equiparables a un ajuste CPT sin evaluar.

## Limitaciones y advertencias

- Licencia sin declarar: el repositorio no especifica condiciones de uso, lo que impide determinar si se permite el uso comercial. Aunque el modelo base Qwen3-8B-Base se distribuye bajo Apache 2.0, el autor de este ajuste no lo confirma, por lo que existe incertidumbre juridica.
- Sin alineacion: al derivar de una variante Base, no sigue instrucciones de forma consistente y puede producir contenido inapropiado o divagante si se usa como chatbot sin un SFT previo.
- Riesgo de alucinacion: no hay evaluacion de veracidad. En tareas de normativa urbana o datos territoriales, cualquier cifra o referencia generada debe verificarse contra fuentes primarias.
- Olvido catastrofico: un preentrenamiento continuado de 1.000 pasos sobre un corpus especifico puede degradar capacidades generales de razonamiento, codigo o matematicas respecto al modelo base. No hay mediciones que lo confirmen ni lo descarten.
- Corpus no divulgado: se desconoce la procedencia, licencia y composicion de los datos de entrenamiento, lo que impide auditar sesgos o posibles infracciones de derechos de autor.
- Cobertura linguistica desconocida: no se documenta que idiomas mantiene el modelo tras el CPT; el castellano podria haber quedado degradado si el corpus era mayoritariamente en ingles.
- Longitud de contexto no confirmada: aunque el modelo base soporte 32.768 tokens nativos, no se ha verificado que el ajuste conserve ese comportamiento hasta el limite.
- Evidencia empirica minima: cero descargas, cero valoraciones, una sola semilla y ningun benchmark. La perdida de validacion de 1,5734 corresponde al checkpoint 750 de 1.000, lo que sugiere que los pasos posteriores no mejoraron esa metrica, pero tampoco se documenta la curva completa.
- Fechas del repositorio: el identificador referencia 20261010 y la creacion del repositorio figura como 2026-10-11, datos que conviene contrastar con la cronologia real antes de citar el modelo.
- Uso en produccion desaconsejado sin evaluacion previa: no hay informacion sobre estabilidad, sesgos ni comportamiento fuera de distribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CompassioninMachineLearning/qwen-urban-midtrain-seed1-20261010-CPT-best
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Repositorio de checkpoints LoRA de origen: https://huggingface.co/CompassioninMachineLearning/Qwen3-8b-urban-seed1-20261010-CPT-LoRA-checkpoints
- Script de fusion (`pilot/erosion/merge_best_cpt.py`): no disponible como enlace publico
- Paper, blog o demo del ajuste: no disponibles
