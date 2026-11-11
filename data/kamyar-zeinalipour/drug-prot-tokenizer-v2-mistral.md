# Kamyar-zeinalipour/drug-prot-tokenizer-v2-mistral

## Resumen

`drug-prot-tokenizer-v2-mistral` es un tokenizer especializado desarrollado por Kamyar Zeinalipour (con Asma Bendjeddou y otros coautores) para el proyecto PharMistral, orientado a la generacion de farmacos condicionada por dianas proteicas. No es un modelo de lenguaje completo, sino el componente de tokenizacion que da servicio a la familia de modelos PharMistral (basados en Mistral-7B) y que se aplica conjuntamente a secuencias de proteinas y a cadenas de moleculas pequenas. Se construye sobre el vocabulario SentencePiece de Mistral-7B, lo que permite reutilizar los pesos base de Mistral durante el preentrenamiento.

El problema que resuelve es la representacion unificada de dos modalidades muy dispares —secuencias aminoacidicas y notaciones de moleculas— dentro de un unico espacio de tokens compatible con un transformer autoregresivo de 7B parametros. Esto habilita el entrenamiento en dos fases descrito en el articulo: primero preentrenamiento conjunto sobre proteinas y moleculas no emparejadas, y despues ajuste sobre pares proteina-ligando de alta afinidad extraidos de ChEMBL-26.

Es relevante ahora porque el articulo asociado se publico en Computer Methods and Programs in Biomedicine Update (2026) y el ecosistema de modelos quimicos condicionados por diana sigue siendo escaso. El tokenizer es un artefacto auxiliar: por si solo no genera texto ni moleculas, y su utilidad esta ligada a los modelos `mistral-7b-drug-prots` y `mistral-7b-drug-prots_pair`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los ficheros del tokenizer ocupan muy poco o no estan materializados en el repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer SentencePiece (vocabulario base de Mistral-7B), aplicado a proteinas y moleculas |
| Parametros totales | no disponible (es un tokenizer, no un modelo neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo PharMistral que lo usa) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizer) |
| Idiomas soportados | no disponible (dominio biologico/quimico, no lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (artefacto de tokenizer; probablemente SentencePiece/JSON, no confirmado) |

## Arquitectura y entrenamiento

El tokenizer se basa en el vocabulario SentencePiece de Mistral-7B y se reutiliza para tokenizar tanto secuencias de proteinas como cadenas de moleculas pequenas. La model card no detalla el algoritmo exacto de construccion del vocabulario extendido, el tamano final del vocabulario, ni si se anadieron tokens especificos para aminoacidos o para notaciones quimicas (por ejemplo SMILES). Tampoco se especifica el corpus utilizado para entrenar el tokenizer ni el numero de tokens procesados.

El contexto de entrenamiento relevante es el pipeline PharMistral en dos etapas: la etapa I realiza preentrenamiento conjunto sobre el dataset `Protein-drug-v2` (proteinas y moleculas no emparejadas) partiendo de Mistral-7B; la etapa II ajusta el modelo sobre `Protein-drug-pair-v2`, que contiene pares proteina-ligando de alta afinidad provenientes de ChEMBL-26. El tokenizer es el mismo en ambas etapas, lo que garantiza consistencia en la representacion de ambas modalidades. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, RLHF/DPO) en la informacion disponible.

## Capacidades

- Tokenizacion unificada de secuencias proteicas y cadenas de moleculas pequenas en un unico espacio de tokens.
- Compatibilidad con el vocabulario SentencePiece de Mistral-7B, lo que permite reutilizar los pesos base de Mistral en el preentrenamiento.
- Servicio a los modelos PharMistral para generacion de farmacos condicionada por diana proteica (a traves de los modelos que lo consumen).
- No realiza generacion de texto, razonamiento, codigo, matematicas ni vision por si mismo.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no aplica; el dominio es biologico/quimico.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Preprocesamiento de datasets proteina-ligando: el tokenizer convierte secuencias de proteinas y moleculas a IDs compatibles con Mistral-7B, paso previo imprescindible para entrenar o ajustar los modelos PharMistral sobre nuevos datos de ChEMBL o similares.
- Reproduccion del pipeline PharMistral: permite replicar las etapas I y II del articulo usando los datasets `Protein-drug-v2` y `Protein-drug-pair-v2` con la misma representacion de entrada que los autores.
- Generacion de farmacos condicionada por diana (via modelos asociados): al alimentar `mistral-7b-drug-prots_pair` con una secuencia proteica tokenizada, se pueden proponer moleculas candidatas; el tokenizer garantiza que la diana se codifica igual que en entrenamiento.
- Fine-tuning en dominios terapeuticos especificos: investigadores que quieran adaptar PharMistral a una familia de dianas concreta pueden reutilizar el tokenizer para mantener compatibilidad con los pesos preentrenados.
- Integracion en pipelines de descubrimiento de farmacos: encaja como capa de tokenizacion en flujos que conecten bases de datos de proteinas (UniProt, PDB) con modelos generativos de moleculas.
- Evaluacion comparativa de representaciones: util para experimentos que comparen tokenizacion por caracteres, por aminoacido o por subpalabras en tareas de generacion molecular condicionada.
- Docencia e investigacion en NLP biomolecular: sirve como ejemplo reproducible de tokenizer multimodal (proteina + molecula) sobre una base Mistral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplica al tokenizer en si; depende del modelo PharMistral que lo consume (Mistral-7B, aproximadamente 14-16 GB en FP16 y 4-6 GB en cuantizacion de 4 bits).
- GPU recomendadas para los modelos asociados: A100, H100 para entrenamiento; RTX 4090, RTX 3090 o similares para inferencia en consumer.
- Cabe en consumer GPU: el tokenizer si (uso en CPU); los modelos PharMistral de 7B caben en GPUs consumer con cuantizacion.
- Opciones de despliegue: el tokenizer se usa con la libreria `transformers` (AutoTokenizer) o SentencePiece; los modelos asociados pueden servirse con vLLM, TGI, llama.cpp u Ollama, aunque no se documenta soporte explicito.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drug-prot-tokenizer-v2-mistral | Tokenizer dominio proteina-molecula | no aplica | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| Tokenizer Mistral-7B original | Tokenizer lenguaje natural | no aplica | no disponible | apache-2.0 | Hugging Face (ampliamente usado) |
| Tokenizers quimicos tipo SMILES (p. ej. basados en BPE quimico) | Tokenizer dominio quimico | no aplica | no disponible | variable | variable |

No se dispone de datos de rendimiento comparativo para este tokenizer frente a alternativas, por lo que la comparativa se limita a aspectos de tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, moleculas ni predicciones por si mismo; requiere los modelos PharMistral para cualquier tarea downstream.
- La model card no documenta el tamano del vocabulario, el corpus de entrenamiento del tokenizer ni los tokens especiales anadidos, lo que dificulta su auditoria.
- Sesgos conocidos: no documentados; al derivar de ChEMBL-26 y Mistral-7B, puede heredar sesgos del corpus quimico y del vocabulario base.
- Riesgo de alucinacion: no aplica directamente al tokenizer, pero los modelos que lo usan pueden generar moleculas invalidas o no sintetizables.
- Limitaciones de contexto o idioma: no aplica a lenguaje natural; el contexto efectivo depende del modelo PharMistral.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar la licencia de los datasets asociados (`Protein-drug-v2`, `Protein-drug-pair-v2`) y de ChEMBL-26 antes de uso en produccion.
- Caveat importante: el repositorio muestra 0 descargas y 0 likes y un tamano de 0.0 GB; conviene verificar que los ficheros del tokenizer estan efectivamente disponibles antes de integrarlo en un pipeline.
- Fecha de actualizacion del repo (2026-11-11) posterior a la creacion (2024-12-25): puede haber cambios no reflejados en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Kamyar-zeinalipour/drug-prot-tokenizer-v2-mistral
- Articulo (DOI): https://doi.org/10.1016/j.cmpbup.2026.100257
- Repositorio GitHub PharMistral: https://github.com/KamyarZeinalipour/PharMistral
- Coleccion Hugging Face PharMistral: https://huggingface.co/collections/Kamyar-zeinalipour/pharmistral-cmpb-update-2026-6af48fca521e8481db608782
- Modelo etapa I: https://huggingface.co/Kamyar-zeinalipour/mistral-7b-drug-prots
- Modelo etapa II: https://huggingface.co/Kamyar-zeinalipour/mistral-7b-drug-prots_pair
- Dataset etapa I: https://huggingface.co/datasets/Kamyar-zeinalipour/Protein-drug-v2
- Dataset etapa II: https://huggingface.co/datasets/Kamyar-zeinalipour/Protein-drug-pair-v2
