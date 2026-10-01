# BrandonHowe/Qwen3-8b-compassion-qwen-seed1-20260930-CPT-merged-epoch-1

## Resumen

El modelo BrandonHowe/Qwen3-8b-compassion-qwen-seed1-20260930-CPT-merged-epoch-1 es un ajuste por preentrenamiento continuado (continued pretraining, CPT) del modelo base Qwen/Qwen3-8B-Base, publicado por el usuario BrandonHowe. Se trata de un transformer denso decoder-only de 8.190.735.360 parametros (8,19B) orientado a generacion de texto, cuyo objetivo declarado es adaptar el modelo base a un corpus especifico de contenido sobre compasion (dataset CompassioninMachineLearning/compassion_12185_cleaned). El checkpoint se distribuye ya fusionado en precision BF16, de modo que no requiere adaptadores tipo LoRA para cargarse.

El checkpoint corresponde a la epoca 1.0 (paso 375) de un proceso de CPT en el que se exponen 10.000 documentos distintos mas 2.000 repeticiones por epoca, reservando 200 documentos disjuntos para validacion. La fusion se realizo con la utilidad nativa de Unsloth `save_pretrained_merged(save_method="merged_16bit")`, con los pesos validados en BF16 y empaquetados sin perdida en ocho shards safetensors.

Su relevancia es principalmente metodologica: ejemplifica el flujo actual de preentrenamiento continuado de bajo coste sobre la familia Qwen3 y documenta la seleccion de documentos y los parametros de entrenamiento en un `run_manifest.json`. El propio autor advierte de forma explicita que el entrenamiento no demuestra por si mismo una mejora en compasion y que ese extremo debe evaluarse por separado. El repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-8B declara 32.768 tokens nativos segun referencias externas |
| Tipos de cuantizacion | solo pesos BF16 en el repositorio; no se distribuyen versiones cuantizadas (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible en la model card (el modelo base Qwen3-8B es multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors (ocho shards, BF16) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen/Qwen3-8B-Base: un transformer decoder-only denso de aproximadamente 8,19B parametros, sin mezcla de expertos (no MoE). El modelo parte de los pesos base de Qwen3-8B y no incorpora, por si mismo, la fase de instruccion ni de alineacion con preferencias del Qwen3-8B instructivo: es un modelo base sometido a preentrenamiento continuado.

El entrenamiento consistio en un CPT sobre el dataset `CompassioninMachineLearning/compassion_12185_cleaned` en una revision concreta (hash de commit documentado en la model card). Cada epoca utiliza 10.000 documentos distintos mas 2.000 repeticiones, con 200 documentos disjuntos reservados para validacion. No se documentan en la informacion disponible el numero total de tokens, la composicion del dataset ni el uso de RLHF o DPO. Tampoco se describe ninguna innovacion tecnica especifica mas alla de la fusion de pesos con Unsloth y el empaquetado en BF16 validado.

## Capacidades

- Generacion de texto autoregresiva en el dominio del corpus de preentrenamiento continuado (contenido sobre compasion).
- Continuacion de texto y modelado de lenguaje de proposito general, heredados del modelo base Qwen3-8B-Base.
- Capacidades multilingues potenciales heredadas del base Qwen3-8B, aunque no confirmadas en la model card de este checkpoint.
- Razonamiento, matematicas y generacion de codigo: no confirmados tras el CPT; el autor no publica evaluaciones al respecto.
- Soporte de tool calling / function calling: no confirmado; al derivar de un modelo base, no incluye la fase de instruccion con la que Qwen3-8B expone estas capacidades.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Modo de razonamiento (thinking mode): no confirmado para este checkpoint; dicho modo se asocia a las versiones instructivas de la familia.
- Capacidades de vision o audio: no disponibles (modelo solo texto).

## Casos de uso

- Investigacion en preentrenamiento continuado: permite reproducir y auditar un pipeline de CPT sobre Qwen3-8B-Base, ya que el repositorio documenta seleccion de documentos, parametros y validacion de exportacion.
- Estudio del olvido catastrofico: al comparar este checkpoint con Qwen3-8B-Base en tareas generales, se puede medir cuanto conocimiento generico se degrada tras el CPT sobre un dominio estrecho.
- Generacion de texto en el dominio de compasion: el modelo puede usarse para producir continuaciones y textos alineados con el estilo y vocabulario del corpus de entrenamiento, siempre que se valide la calidad de forma independiente.
- Punto de partida para ajuste supervisado (SFT): dado que es un modelo base fusionado en BF16, sirve como inicializacion para posteriores fases de instruccion o alineacion orientadas a aplicaciones conversacionales.
- Generacion de datos sinteticos de dominio: puede emplearse para aumentar un corpus tematico antes de alimentar un modelo instructivo.
- Reproduccion de experimentos de semilla: al estar etiquetado con una semilla concreta (seed1), permite comparar variabilidad entre ejecuciones del mismo pipeline.
- Auditoria de etica y sesgos: util para analizar como un corpus con carga emocional (compasion) altera la distribucion de salidas frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y advierte explicitamente que el entrenamiento no establece una mejora en compasion, que debe evaluarse por separado.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 16,4 GB solo de pesos, mas la cache KV; en la practica se recomienda un minimo de 20-24 GB de VRAM.
- VRAM para inferencia cuantizada: no distribuida por el autor; partiendo del tamano de 8,19B, una cuantizacion a 4 bits (Q4) ocuparia del orden de 5-6 GB, y una a 8 bits (Q8) alrededor de 9 GB, aunque estas cifras requeririan generar las versiones cuantizadas manualmente.
- GPU recomendadas en BF16: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090/3090 (24 GB) para cargas ligeras.
- GPU de consumo: el BF16 completo no cabe holgadamente en tarjetas de 8-16 GB; una RTX 4090 de 24 GB lo soporta; con cuantizacion a 4 bits cabria en RTX 3060 12 GB, RTX 4070 o superiores.
- Opciones de despliegue: transformers (libreria principal), Text Generation Inference (etiqueta `text-generation-inference`), endpoints compatibles (etiqueta `endpoints_compatible`) y, con conversion previa a GGUF, llama.cpp u Ollama. vLLM es compatible con el formato safetensors aunque no figura entre las etiquetas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (Qwen3-8b-compassion-CPT-merged) | 8,19B | no disponible en la card | no disponible | HuggingFace, BF16 safetensors |
| Qwen/Qwen3-8B-Base | 8,19B | 32.768 tokens nativos | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-8B (instructivo) | 8,19B | 32.768 tokens nativos (extensible con YaRN) | Apache-2.0 | HuggingFace |
| meta-llama/Llama-3.1-8B | 8,03B | 128.000 tokens | Llama 3.1 Community License | HuggingFace |

Nota: los datos de Qwen3-8B-Base, Qwen3-8B y Llama-3.1-8B proceden de informacion externa a la model card de este checkpoint; los valores de contexto y licencia de este modelo concreto figuran como "no disponible" porque el autor no los especifica. No se dispone de comparativas de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: la ausencia de licencia explicita impide confirmar si se permite el uso comercial; tratarlo como restriccion potencial para produccion.
- El autor advierte que el entrenamiento no demuestra una mejora en compasion; cualquier afirmacion de mejora requiere evaluacion independiente.
- Derivado de un modelo base (Qwen3-8B-Base), por lo que no esta instruido ni alineado con preferencias: no es adecuado para uso conversacional directo sin una fase de instruccion posterior.
- Riesgo de olvido catastrofico: el CPT sobre un unico dominio puede degradar el rendimiento general del base en tareas ajenas al corpus.
- Riesgo de alucinacion propio de los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para este checkpoint.
- Idiomas, contexto y cuantizaciones no documentados en la model card, lo que dificulta planificar despliegues.
- Sin benchmarks publicados ni validacion externa; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- El dataset tiene una carga tematica (compasion) que puede introducir sesgos de estilo o tono; no se documenta analisis de sesgos.
- No se detallan el numero de tokens de entrenamiento ni la composicion del dataset, lo que limita la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Qwen3-8b-compassion-qwen-seed1-20260930-CPT-merged-epoch-1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset utilizado: https://huggingface.co/datasets/CompassioninMachineLearning/compassion_12185_cleaned
- Modelo relacionado del mismo autor (urban, CPT completo): https://huggingface.co/BrandonHowe/Qwen3-8b-urban-qwen-20260920-full-CPT-final-step-1500
- Modelo relacionado del mismo autor (urban, test2 seed1): https://huggingface.co/BrandonHowe/Qwen3-8b-urban-qwen-test2-seed1-20260929-CPT-final-step-5
- Ficha relacionada (urban, epoca intermedia): https://featherless.ai/models/CompassioninMachineLearning/Qwen-3-8b-intermediate-epoch-3-CPT-10k-urban-density-dataset
- Ficha relacionada (urban, CPT final): https://featherless.ai/models/CompassioninMachineLearning/Qwen-3-8b-final-CPT-10k-urban-density-dataset
- Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_8b
