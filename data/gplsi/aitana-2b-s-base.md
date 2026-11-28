# gplsi/Aitana-2B-S-base

## Resumen

Aitana-2B-S-base es un modelo de lenguaje generativo de la familia Aitana, desarrollado por el GPLSI (Language and Information System Group) de la Universidad de Alicante. Se construye sobre BSC-LT/salamandra-2b mediante preentrenamiento continuado sobre datos multilingues en valenciano, castellano e ingles, con un enfasis explicito en los dominios administrativo, legal y turistico. El objetivo declarado es mejorar la representacion del valenciano y el catalan en un modelo fundacional de tamano contenido.

Arquitectura transformer decoder-only con aproximadamente 2.250 millones de parametros (2.253.490.176 en pesos safetensors). El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en pipelines de generacion de texto. El repositorio incluye pesos en safetensors para transformers y cuantizaciones GGUF (Q4_K_M y F16) para llama.cpp, LM Studio y Ollama.

Su relevancia actual reside en la escasez de modelos fundacionales con cobertura real del valenciano y en su especializacion sobre corpus oficiales de la Generalitat Valenciana, Les Corts, la Universidad de Alicante y contenido turistico. Es un modelo base, no alineado por instrucciones, pensado como punto de partida para ajuste fino en tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 2.253.490.176 (~2,25B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (v1.0) / 8.192 tokens (v1.1) en entrenamiento; no se especifica contexto maximo de inferencia |
| Tipos de cuantizacion | GGUF Q4_K_M (~1,3 GB), GGUF F16 (~4,5 GB); pesos originales en bfloat16 |
| Idiomas soportados | Valenciano (ca), castellano (es), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de BSC-LT/salamandra-2b, un transformer decoder-only multilingue del Barcelona Supercomputing Center. Sobre esa base se aplica un preentrenamiento continuado (CPT) con AdamW, learning rate de 2e-5, betas 0,9/0,999, weight decay de 0,01, warmup del 6 %, precision bfloat16 y 2 epocas. La configuracion reportada incluye dos variantes: la v1.0 con batch por dispositivo de 2, acumulacion de gradiente de 8 y longitud maxima de secuencia de 2.048 tokens; y la v1.1 con batch por dispositivo de 1, acumulacion de 16 y longitud maxima de 8.192 tokens. En ambos casos el batch global efectivo es 64 sobre 4 GPUs.

Los datos de entrenamiento provienen de cinco conjuntos ALIA del GPLSI: DOGV (Diari Oficial de la Generalitat Valenciana, en valenciano y castellano), Les Corts Valencianes (transcripciones parlamentarias en castellano y valenciano), AMIC (corpus en valenciano), BOUA (Butlleti Oficial de la Universitat d'Alacant, en valenciano y castellano) y un corpus turistico multilingue en valenciano, castellano e ingles. No se especifica el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO; el modelo es una base sin alineamiento por instrucciones.

## Capacidades

- Generacion de texto en valenciano, castellano e ingles, con registro formal por el sesgo de los corpus administrativos y legales.
- Modelo base sin ajuste por instrucciones: no incorpora chat template ni alineamiento conversacional de serie.
- Capacidad de continuacion de texto y prompting de tipo completado, adecuada para ajuste fino supervisado posterior.
- Cobertura reforzada de terminologia administrativa, juridica, parlamentaria y universitaria en el ambito de la Comunitat Valenciana.
- Soporte de contenido turistico multilingue derivado del corpus especifico de turismo.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Compatible con text-generation-inference y endpoints compatibles segun los tags del repositorio.

## Casos de uso

- Redaccion y resumen de documentacion administrativa: el modelo puede continuar o sintetizar textos del DOGV y del BOUA gracias al preentrenamiento sobre esos corpus oficiales, lo que reduce el desajuste de dominio frente a modelos genericos.
- Asistencia en tramitacion publica: generacion de borradores de comunicaciones y resoluciones en valenciano y castellano para administraciones locales, aprovechando el registro formal aprendido.
- Analisis de transcripciones parlamentarias: continuacion y estructuracion de actas de Les Corts, con terminologia politica y juridica propia del corpus.
- Ajuste fino para clasificacion y extraccion de informacion legal: al ser un modelo base de 2,25B, es viable afinarlo con LoRA en una unica GPU para tareas de etiquetado de normativa o deteccion de entidades en textos oficiales.
- Generacion de contenido turistico multilingue: descripciones y materiales promocionales en valenciano, castellano e ingles apoyados en el corpus turistico del entrenamiento.
- Normalizacion y traduccion asistida ca/es/en en el ambito institucional: util como componente en pipelines de traduccion o parafraseo dentro de entornos de la Generalitat o universidades.
- Investigacion en NLP de bajos recursos: base de referencia para estudiar el impacto del preentrenamiento continuado en valenciano y catalan, con pesos abiertos y licencia permisiva.
- Despliegue en local con GGUF: la version Q4_K_M (~1,3 GB) permite prototipado en equipos sin GPU dedicada mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

La model card incluye un apartado de evaluacion, pero los datos numericos no estan disponibles en la informacion proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 4,5-5 GB de pesos mas overhead de activaciones y cache KV; con contexto de 8.192 tokens la cache KV incrementa el consumo de forma apreciable.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 1,3 GB de pesos, ejecutable en CPU o en GPUs consumer con 4 GB o mas.
- GPU recomendadas: A100 o H100 para entrenamiento y ajuste fino a escala; RTX 4090, RTX 3090 o RTX 4080 para inferencia en bf16 y ajuste fino con LoRA.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en bf16 y en tarjetas con 4 GB o mas usando Q4_K_M.
- Opciones de despliegue: transformers (pipeline de text-generation), text-generation-inference, llama.cpp, llama-cpp-python, LM Studio y Ollama mediante los GGUF incluidos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| gplsi/Aitana-2B-S-base | ~2,25B | 2.048 / 8.192 en entrenamiento | ca, es, en | Apache 2.0 | Preentrenamiento continuado sobre salamandra-2b con corpus valencianos |
| BSC-LT/salamandra-2b | ~2B | no disponible en esta ficha | multilingue europeo | Apache 2.0 | Modelo base de origen, sin especializacion en valenciano |
| Modelos base de ~2B de proposito general | ~2B | variable | multilingue | variable | Cobertura limitada de valenciano y catalan frente a Aitana |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias

- Modelo base sin alineamiento por instrucciones: no es adecuado para uso conversacional directo sin ajuste fino previo.
- Sesgo de registro formal: el predominio de corpus administrativos, legales y parlamentarios empuja las generaciones hacia un estilo burocratico, poco natural para contextos coloquiales.
- Riesgo de alucinacion en la generacion de contenido factual, especialmente en citas normativas o referencias legales, que debe verificarse siempre.
- Cobertura limitada a valenciano, castellano e ingles; el rendimiento en otras lenguas no esta garantizado pese a la base multilingue.
- Contexto de entrenamiento de 2.048 tokens en la version v1.0 y 8.192 en la v1.1; no se documenta el contexto maximo soportado en inferencia, por lo que conviene validarlo antes de desplegar con ventanas largas.
- Licencia Apache 2.0 permisiva para uso comercial, pero sin garantias del autor; conviene revisar la procedencia de los corpus subyacentes para usos sensibles.
- Ausencia de benchmarks publicados en la informacion disponible, lo que impide comparar su calidad de forma objetiva con alternativas.
- El modelo es reciente (creado en diciembre de 2025) y con pocas descargas y likes, por lo que la comunidad y el soporte son todavia reducidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gplsi/Aitana-2B-S-base
- Modelo base: https://huggingface.co/BSC-LT/salamandra-2b
- GPLSI, Universidad de Alicante: https://gplsi.dlsi.ua.es/
- Dataset DOGV: https://huggingface.co/datasets/gplsi/alia_dogv
- Dataset Les Corts: https://huggingface.co/datasets/gplsi/alia_les_corts
- Dataset AMIC: https://huggingface.co/datasets/gplsi/alia_amic
- Dataset BOUA: https://huggingface.co/datasets/gplsi/alia_boua
- Dataset Tourism: https://huggingface.co/datasets/gplsi/alia_tourism
- LM Studio: https://lmstudio.ai/
- Ollama: https://ollama.ai/
