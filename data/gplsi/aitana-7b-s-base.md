# gplsi/Aitana-7B-S-base

## Resumen

Aitana-7B-S-base es un modelo de lenguaje generativo de la familia Aitana, desarrollado conjuntamente por el Grupo de Procesamiento del Lenguaje y Sistemas de Información (GPLSI) de la Universidad de Alicante y el grupo de Modelado del Lenguaje del Barcelona Supercomputing Center (BSC). Se construye mediante preentrenamiento continuo (continual pre-training) sobre el modelo fundacional BSC-LT/salamandra-7b, con el objetivo de mejorar la representación del valenciano y el catalán en un modelo multilingüe que también cubre castellano e inglés.

El modelo emplea una arquitectura transformer decoder-only con aproximadamente 7.770 millones de parámetros (7.768.117.248 según los pesos en safetensors) y una longitud máxima de secuencia de 8.192 tokens durante el entrenamiento. Su entrenamiento se centra en dominios administrativo, legal y turístico, utilizando corpus como el DOGV, las transcripciones de Les Corts Valencianes, el BOUA y datasets turísticos multilingües de la propia colección ALIA.

La relevancia del modelo radica en su especialización en valenciano, una lengua con escasa representación en los modelos fundacionales mayoritarios, manteniendo licencia Apache 2.0 y compatibilidad con el ecosistema transformers y text-generation-inference. Es un modelo base, sin ajuste por instrucciones, pensado como punto de partida para fine-tuning en tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 7.768.117.248 (~7,77B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no documentadas por el autor) |
| Idiomas soportados | Valenciano (ca), castellano (es), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Salamandra-7B, el modelo fundacional multilingüe del BSC. El preentrenamiento continuo se realizó sobre datos multilingües (valenciano, castellano e inglés) procedentes de la colección de datasets ALIA, con especial énfasis en dominios administrativo, legal y turístico. La configuración reportada en la tabla de reproducibilidad del manuscrito para la etapa de CPT de 7B incluye optimizador AdamW, learning rate entre 3e-6 y 3e-7, β1/β2 de 0,9/0,95, weight decay de 0,1, warmup del 1%, acumulación de gradiente de 1 paso, 16 GPUs, tamaño de batch global efectivo de 512, precisión bfloat16, 1 época y longitud máxima de secuencia de 8.192 tokens.

Los datos de entrenamiento provienen de fuentes oficiales y corpus especializados: el DOGV (Diari Oficial de la Generalitat Valenciana) en valenciano y castellano, las transcripciones de Les Corts Valencianes, el corpus AMIC en valenciano, el BOUA (Butlletí Oficial de la Universitat d'Alacant) en ambos idiomas, contenido turístico multilingüe y un corpus de frases paralelas multilingües (castellano/valenciano/inglés). No se documenta en la información disponible el uso de RLHF, DPO ni ajuste por instrucciones; el modelo se distribuye como base sin instruction tuning.

## Capacidades

- Generación de texto en valenciano, castellano e inglés, con especial cobertura del valenciano y el catalán.
- Modelo base sin ajuste por instrucciones: no está optimizado para seguir instrucciones de forma nativa, sino como punto de partida para fine-tuning.
- Especialización en registro formal y dominios administrativo, legal y turístico, derivada de la composición del corpus de entrenamiento.
- Capacidad multilingüe con corpus paralelos castellano/valenciano/inglés, lo que favorece tareas de traducción y alineación entre lenguas.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; al ser un modelo base, no se reportan capacidades agénticas específicas.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.
- Modo thinking explícito: no documentado.

## Casos de uso

- Generación de texto administrativo en valenciano: el modelo puede redactar borradores de comunicaciones oficiales, resoluciones o anuncios con el registro formal característico del DOGV y el BOUA, gracias a su preentrenamiento continuo sobre estos corpus.
- Procesamiento de documentación legal y parlamentaria: útil para resumir, completar o reformular transcripciones de Les Corts Valencianes y textos normativos, aprovechando la ventana de 8.192 tokens para documentos de longitud media.
- Traducción castellano-valenciano-inglés: el corpus de frases paralelas multilingües del entrenamiento permite usar el modelo como base para sistemas de traducción automática tras un fine-tuning específico.
- Generación de contenido turístico multilingüe: adecuado para producir descripciones de destinos, folletos y materiales promocionales en los tres idiomas, dado el entrenamiento sobre el dataset turístico ALIA.
- Punto de partida para fine-tuning en tareas downstream: al ser un modelo base con licencia Apache 2.0, puede ajustarse para clasificación, extracción de información o generación especializada en dominios concretos.
- Investigación en lenguas de bajos recursos: sirve como referencia para estudiar el impacto del preentrenamiento continuo en valenciano y catalán, con benchmarks publicados por el autor para comparar frente a Salamandra-7B.
- Normalización y generación de texto institucional: puede emplearse en pipelines de redacción asistida para universidades y administraciones públicas que operen en valenciano y castellano.

## Benchmarks y rendimiento

El autor publica resultados de lm-evaluation-harness sobre el modelo base (sin instruction tuning ni fine-tuning) y los compara con Salamandra-7B. La tabla de puntuaciones normalizadas por lengua es la siguiente:

| Idioma | Salamandra-7B | Aitana-7B-S-base |
|---|---|---|
| Castellano | 0,248 | 0,26 |
| Catalán | 0,364 | 0,373 |
| Inglés | 0,319 | 0,349 |
| Valenciano | 0,663 | 0,664 |

La información disponible no incluye el desglose completo por dataset de los benchmarks de clasificación en valenciano (la tabla aparece truncada en la model card), ni resultados de MMLU, HumanEval o GSM8K. No se han publicado en la información disponible resultados adicionales de benchmarks más allá de los recogidos en esta tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los ~7,77B parámetros requieren aproximadamente 15,5 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 18-24 GB de VRAM para inferencia cómoda en bf16.
- Cuantización: en 8 bits, la huella se reduce a ~8 GB; en 4 bits, a ~4-5 GB, aunque el autor no publica cuantizaciones oficiales GGUF y habría que generarlas a partir de los safetensors.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB), L40S y RTX 6000 Ada para despliegue en producción; RTX 4090 (24 GB) es suficiente para bf16 en una sola GPU.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en bf16; en GPUs con 16 GB (RTX 4080, 4060 Ti 16 GB) sería necesario cuantizar a 8 bits o 4 bits.
- Opciones de despliegue: transformers (pipeline de text-generation), text-generation-inference (el modelo está etiquetado como compatible con endpoints), y servidores compatibles con safetensors; llama.cpp u Ollama requerirían conversión previa a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Aitana-7B-S-base | ~7,77B | 8.192 tokens | ca, es, en | Apache 2.0 | Preentrenamiento continuo sobre Salamandra-7B con foco en valenciano/catalán y dominios administrativo, legal y turístico |
| BSC-LT/salamandra-7b | ~7B | no disponible en la información proporcionada | multilingüe (incluye ca, es, en) | Apache 2.0 | Modelo fundacional multilingüe del BSC; base de Aitana |
| Salamandra-2b | ~2B | no disponible en la información proporcionada | multilingüe | Apache 2.0 | Versión reducida de la familia Salamandra, menor huella de hardware |
| Modelos generalistas de ~7B (p. ej. familias Llama o Mistral) | ~7-8B | 8k-32k según variante | mayoritariamente en, con cobertura limitada de ca/valenciano | licencias variables | Modelos generalistas con menor especialización en valenciano |

La comparativa directa con modelos generalistas de 7B no está respaldada por benchmarks comunes en la información disponible; la única comparación numérica publicada es frente a Salamandra-7B, que se recoge en la sección de benchmarks.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable y puede requerir fine-tuning o prompting cuidadoso para tareas concretas.
- Sesgos potenciales derivados del corpus: al entrenarse sobre documentación oficial, legal y parlamentaria, el modelo tiende a un registro formal y puede reproducir sesgos institucionales o administrativos presentes en esas fuentes.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido factualmente incorrecto, especialmente en dominios especializados; no debe usarse como fuente de verdad sin verificación.
- Cobertura limitada de idiomas: solo valenciano, castellano e inglés; el rendimiento en otras lenguas no está garantizado.
- Longitud de contexto de 8.192 tokens: suficiente para documentos medios, pero insuficiente para corpus extensos sin estrategias de chunking o recuperación.
- La model card advierte de que el registro formal del corpus puede condicionar el estilo de las generaciones.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad sobre el cumplimiento normativo y la verificación de las salidas en aplicaciones sensibles.
- No se publican cuantizaciones oficiales ni datos de latencia/throughput, lo que complica la planificación de despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gplsi/Aitana-7B-S-base
- Modelo base: https://huggingface.co/BSC-LT/salamandra-7b
- GPLSI (Universidad de Alicante): https://gplsi.dlsi.ua.es/
- Grupo de Modelado del Lenguaje del BSC: https://www.bsc.es/research-development/research-areas/cognitive-computing/language-modeling
- Dataset DOGV: https://huggingface.co/datasets/gplsi/alia_dogv
- Dataset Les Corts: https://huggingface.co/datasets/gplsi/alia_les_corts
- Dataset AMIC: https://huggingface.co/datasets/gplsi/alia_amic
- Dataset BOUA: https://huggingface.co/datasets/gplsi/alia_boua
- Dataset Tourism: https://huggingface.co/datasets/gplsi/alia_tourism
- Dataset de frases paralelas multilingües: https://huggingface.co/datasets/gplsi/alia_multilingual_parallel_sentences
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
