# Kamyar-zeinalipour/Mistral-tokenizer-prot

## Resumen

Mistral-tokenizer-prot es un tokenizer especializado derivado del tokenizer de Mistral-7B, adaptado por Kamyar Zeinalipour (Universidad de Siena, grupo de investigacion en IA) para procesar secuencias de aminoacidos en lugar de texto natural. Forma parte del trabajo presentado en el paper *Design Proteins Using Large Language Models: Enhancements and Comparative Analyses* (LangMol 2024, workshop de ACL), y constituye el componente de tokenizacion del modelo P-Mistral-7B, un Mistral-7B ajustado para diseno de proteinas.

El tokenizer mantiene un vocabulario de 32.000 tokens y fue entrenado sobre el dataset UniRef50-HumanProteins, que contiene secuencias de proteinas humanas. Las secuencias se delimitan con los tokens especiales `<s>` al inicio y `</s>` al final, siguiendo la convencion de Mistral. Su proposito es permitir que un LLM de proposito general opere directamente sobre el alfabeto de 20 aminoacidos estandar, tokenizando secuencias proteicas de forma eficiente en lugar de tratarlas como texto plano.

Es relevante porque demuestra que los tokenizers de LLMs genericos pueden reutilizarse para dominios cientificos especializados (proteinas) sin redisenar el vocabulario desde cero, lo que facilita el ajuste fino de modelos como Mistral-7B sobre datos biologicos. El repositorio tiene un tamano de 0.0 GB segun Hugging Face, lo que sugiere que los ficheros de tokenizacion no estan materializados o el repo esta practicamente vacio; conviene verificar la disponibilidad real de los ficheros antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer (BPE/SentencePiece) derivado de Mistral-7B, adaptado a secuencias de aminoacidos |
| Parametros totales | no disponible (es un tokenizer, no un modelo de parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizer) |
| Idiomas soportados | no disponible (opera sobre alfabeto de aminoacidos, no lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (ficheros de tokenizer de transformers; repo de 0.0 GB) |

## Arquitectura y entrenamiento

Se trata de un tokenizer, no de un modelo neuronal con pesos. Segun la model card, es el tokenizer de Mistral-7B adaptado a secuencias de aminoacidos con un vocabulario de 32.000 tokens, entrenado sobre el dataset Kamyar-zeinalipour/UniRef50-HumanProteins. La adaptacion consiste en reentrenar o ajustar el vocabulario para que las secuencias proteicas se fragmenten en tokens utiles en lugar de caracteres o subcadenas de texto natural. Las secuencias se envuelven con `<s>` (inicio) y `</s>` (fin).

No se especifica en la informacion disponible el algoritmo exacto de tokenizacion (BPE, Unigram, WordPiece), el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de filtrado o normalizacion de secuencias. El paper asociado (LangMol 2024) y el repositorio GitHub protein-design-LLMs contienen los detalles metodologicos, pero no estan incluidos en la informacion proporcionada.

## Capacidades

- Tokenizacion de secuencias de proteinas humanas sobre el alfabeto de 20 aminoacidos estandar.
- Delimitacion explicita de secuencias mediante tokens especiales `<s>` y `</s>`.
- Compatibilidad con la libreria transformers (`AutoTokenizer.from_pretrained`).
- Uso conjunto con el modelo P-Mistral-7B para generacion y diseno de proteinas.
- Vocabulario de 32.000 tokens heredado de Mistral-7B.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues de lenguaje natural: es un componente de tokenizacion de dominio especifico.

## Casos de uso

- Diseno de proteinas con P-Mistral-7B: el tokenizer es el componente de entrada obligatorio para ejecutar el modelo P-Mistral-7B, que genera secuencias proteicas candidatas a partir de prompts; se usa cargandolo con `AutoTokenizer.from_pretrained` y pasando las secuencias delimitadas con `<s>` y `</s>`.
- Ajuste fino de LLMs sobre datos proteicos: sirve como base para entrenar o fine-tunear modelos tipo Mistral sobre corpus de proteinas humanas (UniRef50-HumanProteins), ya que su vocabulario esta adaptado al alfabeto de aminoacidos.
- Preprocesamiento de datasets biologicos: permite convertir grandes colecciones de secuencias proteicas en tensores de tokens de forma consistente para pipelines de entrenamiento o evaluacion.
- Investigacion en protein language models: util para experimentos academicos que comparen tokenizacion por caracteres frente a tokenizacion subword adaptada en tareas de generacion de proteinas.
- Reproducibilidad de resultados del paper LangMol 2024: necesario para replicar los experimentos de diseno de proteinas descritos en la publicacion.
- Integracion en pipelines de bioinformatica con transformers: al ser compatible con `AutoTokenizer`, puede insertarse en flujos existentes de Hugging Face para tareas de analisis de secuencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de perplejidad, precision de tokenizacion ni comparaciones cuantitativas con otros tokenizers proteicos. El paper asociado (LangMol 2024) podria contener dichos datos, pero no se proporcionan en la informacion recibida.

## Requisitos de hardware

- VRAM para inferencia: no aplica al tokenizer en si (no requiere GPU); la VRAM depende del modelo que lo use (P-Mistral-7B, aproximadamente 14-16 GB en FP16, no confirmado en la informacion disponible).
- GPU recomendadas: no disponible para el tokenizer; para P-Mistral-7B se requeriria una GPU con al menos 16 GB de VRAM en FP16 (estimacion estandar para un modelo de 7B, no confirmada en la fuente).
- Cabe en GPU consumer: el tokenizer es CPU-only; el modelo asociado de 7B podria caber en GPUs consumer de 16-24 GB con cuantizacion, aunque no se confirma en la informacion.
- Opciones de despliegue: transformers (`AutoTokenizer`); no se documentan opciones como vLLM, llama.cpp u Ollama para este componente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mistral-tokenizer-prot | 32.000 | Proteinas (aminoacidos) | apache-2.0 | Hugging Face (repo de 0.0 GB) |
| Tokenizer original de Mistral-7B | 32.000 | Texto natural multilingue | apache-2.0 | Ampliamente disponible |
| Tokenizers proteicos especializados (p. ej. ESM) | no disponible | Proteinas | varía | no disponible en la informacion |

No se dispone de datos de rendimiento comparativo entre estos tokenizers en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio tiene un tamano de 0.0 GB segun Hugging Face, lo que sugiere que los ficheros de tokenizacion podrian no estar disponibles o el repo esta vacio; verificar antes de usarlo.
- No hay descargas ni likes registrados, lo que indica baja adopcion y poca validacion por parte de la comunidad.
- El modelo esta pensado para investigacion (la model card indica "For research use"); aunque la licencia es apache-2.0, conviene revisar las condiciones del paper y del modelo base.
- Al ser un tokenizer de dominio especifico, no es util para tareas de lenguaje natural general.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto porque no aplican directamente a un tokenizer; el comportamiento generativo depende de P-Mistral-7B.
- No se especifica el algoritmo de tokenizacion ni la cobertura del alfabeto (aminoacidos no estandar, modificaciones post-traduccionales), lo que puede limitar su uso fuera de proteinas humanas canonicas.
- La fecha de actualizacion (2026-11-18) es posterior a la de creacion (2024-12-08) y no se detalla que cambios se introdujeron.

## Enlaces

- Hugging Face: https://huggingface.co/Kamyar-zeinalipour/Mistral-tokenizer-prot
- Modelo asociado P-Mistral-7B: https://huggingface.co/Kamyar-zeinalipour/P-Mistral-7B
- Dataset UniRef50-HumanProteins: https://huggingface.co/datasets/Kamyar-zeinalipour/UniRef50-HumanProteins
- Paper (ACL Anthology): https://aclanthology.org/2024.langmol-1.5/
- DOI del paper: https://doi.org/10.18653/v1/2024.langmol-1.5
- Repositorio GitHub: https://github.com/KamyarZeinalipour/protein-design-LLMs
- Coleccion Hugging Face: https://huggingface.co/collections/Kamyar-zeinalipour/design-proteins-using-llms-langmol-2024-6af48a0e6814a362675e4dc6
