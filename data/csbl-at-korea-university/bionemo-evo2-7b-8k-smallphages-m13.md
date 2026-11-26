# CSBL-at-Korea-University/bionemo-evo2-7b-8k-smallphages-m13

## Resumen

El modelo `bionemo-evo2-7b-8k-smallphages-m13` es un checkpoint publicado por el grupo CSBL (Computational Systems Biology Laboratory) de la Korea University bajo licencia Apache 2.0. Por su identificador, se trata de un ajuste fino (fine-tuning) del modelo base Evo 2 de 7 mil millones de parametros con ventana de contexto de 8.000 tokens, especializado en fagos pequenos ("small phages"). Evo 2 es la familia de modelos genomicos de NVIDIA BioNeMo, disenada para modelar secuencias de ADN a escala genomica, por lo que este checkpoint se orienta a tareas de biologia computacional sobre genomas virales.

La relevancia de este modelo radica en su caracter especializado: frente a los modelos genomicos de proposito general, un ajuste sobre fagos pequenos puede ofrecer una distribucion mas ajustada a las particularidades de estos genomas compactos (alta densidad genica, solapamiento de marcos de lectura, sesgos de composicion). Sin embargo, la model card publicada es practicamente vacia: solo declara la licencia Apache 2.0, sin descripcion, sin datos de entrenamiento, sin benchmarks ni instrucciones de uso.

La informacion disponible es muy limitada. Esta ficha se ha redactado a partir del identificador del modelo, sus metadatos en Hugging Face y el conocimiento general de la familia Evo 2; cualquier dato no confirmado se marca explicitamente como "no disponible". No se debe asumir que las capacidades del modelo base se trasladan automaticamente a este checkpoint sin validacion empirica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por el identificador, derivado de Evo 2; la familia Evo 2 usa arquitectura tipo transformer con atencion por franjas - striped attention/StripedHyena en versiones previas -; no confirmado para este checkpoint) |
| Parametros totales | 7B (segun el identificador del modelo; no confirmado en la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 8.000 tokens (segun el identificador "8k") |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias genomicas, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se listan archivos en la informacion proporcionada) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura concreta de este checkpoint en la model card. El identificador sugiere que se trata de un fine-tuning del modelo Evo 2 de 7B con contexto de 8.000 tokens, desarrollado por NVIDIA BioNeMo para el modelado de secuencias genomicas. La familia Evo 2 esta disenada para operar directamente sobre nucleotidos (A, C, G, T) en lugar de texto, con objetivos de modelado autoregresivo de secuencias largas.

Tampoco se detallan los datos de entrenamiento: no se especifica el numero de tokens de ADN utilizados, la composicion del corpus de fagos, ni si se emplearon tecnicas de ajuste como SFT, RLHF o DPO (estas ultimas son poco habituales en modelos genomicos). El sufijo "m13" podria referirse al bacteriofago M13, pero no hay confirmacion en la informacion disponible. Cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, etc.) seria especulativa y no se incluye.

## Capacidades

- Modelado de secuencias genomicas: por su origen en Evo 2, se espera capacidad para puntuar y generar secuencias de ADN, aunque no esta confirmado para este checkpoint concreto.
- Especializacion en fagos pequenos: el ajuste sugiere un mejor ajuste a la distribucion estadistica de genomas virales pequenos frente al modelo base.
- Generacion de secuencias: potencialmente puede generar secuencias de ADN condicionadas a contexto, si el checkpoint conserva la cabeza de modelado del base.
- Tool calling / function calling: no disponible; no es una capacidad esperada en un modelo genomico.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica; el modelo opera sobre alfabeto de nucleotidos, no sobre lenguaje natural.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Anotacion de genomas de fagos: usar el modelo para puntuar regiones candidatas o predecir la probabilidad de secuencias en genomas virales pequenos, priorizando candidatos para validacion experimental.
- Diseno de genomas sinteticos de fagos: generar secuencias condicionadas a contexto para explorar variantes de fagos con fines de terapia fagica, siempre con validacion in silico e in vitro posterior.
- Deteccion de secuencias anomalas: emplear la verosimilitud del modelo como senal para identificar fragmentos de ADN que se desvian de la distribucion de fagos pequenos, util en control de calidad de ensamblados.
- Investigacion en evolucion viral: comparar la puntuacion del modelo entre familias de fagos para estudiar sesgos composicionales y presion selectiva sobre regiones codificantes.
- Filtrado en pipelines metagenomicos: integrar el modelo como clasificador auxiliar para discriminar contigs de origen fagico frente a otros origenes, combinado con herramientas como VirSorter o geNomad.
- Base para fine-tuning adicional: partir de este checkpoint para ajustes sobre otros grupos virales o bacterianos, aprovechando que la licencia Apache 2.0 permite uso comercial y modificacion.
- Reproduccion de experimentos: servir como referencia para replicar o comparar resultados de modelado genomico con Evo 2 en el dominio de fagos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de perplejidad, precision en prediccion de genes, ni comparaciones con otros modelos genomicos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; para un modelo de 7B en precision completa (FP16) se requieren aproximadamente 14 GB solo para pesos, mas memoria para activaciones y cache KV con contexto de 8.000 tokens.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabria esperar GPUs con al menos 24-40 GB de VRAM (A100 40GB, L40S, RTX 6000 Ada) para FP16 con contexto completo; no confirmado.
- Cabe en GPU de consumo: probablemente en GPUs de 24 GB (RTX 3090/4090) solo con cuantizacion o contextos reducidos; no confirmado.
- Opciones de despliegue: no disponibles. Para modelos de la familia Evo 2 se suele requerir el stack de BioNeMo o transformers con soporte especifico; verificar la compatibilidad con vLLM, llama.cpp u Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bionemo-evo2-7b-8k-smallphages-m13 | 7B (segun identificador) | 8.000 tokens | Fagos pequenos (fine-tuning) | Apache 2.0 | Hugging Face |
| Evo 2 (modelo base, 7B) | 7B | no disponible en esta ficha | Genomico general | no disponible | BioNeMo / NGC |
| Nucleotide Transformer | 500M-2.5B | hasta 12 kb (segun variante) | Genomico general | no disponible | Hugging Face |
| DNABERT-2 | ~117M | 512 tokens (aprox.) | Genomico general | no disponible | Hugging Face |

Nota: los datos de los modelos comparativos se incluyen como referencia general de categoria; no se dispone de comparaciones de rendimiento publicadas entre este checkpoint y las alternativas.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay documentacion sobre datos de entrenamiento, sesgos, ni procedencia del corpus, lo que dificulta evaluar su validez cientifica.
- Riesgo de sobreajuste: al ser un fine-tuning sobre fagos pequenos, puede tener un rendimiento pobre fuera de ese dominio (bacterias, eucariotas, secuencias humanas).
- Alucinacion en generacion de secuencias: como modelo generativo, puede producir secuencias plausibles pero no funcionales; toda secuencia generada requiere validacion experimental.
- Sesgo de composicion: el corpus de fagos puede tener sesgos de GC y de uso de codones que se reflejen en las predicciones.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime de las obligaciones de atribucion ni de las posibles restricciones de licencias de terceros asociadas al modelo base Evo 2; conviene verificar la licencia del base antes de un despliegue comercial.
- Sin garantias de produccion: no hay informacion sobre estabilidad, formato de pesos ni compatibilidad con frameworks estandar, por lo que su integracion en produccion requiere validacion previa.
- Idiomas: no aplica a lenguaje natural; no debe usarse como modelo de texto.

## Enlaces

- Hugging Face: https://huggingface.co/CSBL-at-Korea-University/bionemo-evo2-7b-8k-smallphages-m13
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
