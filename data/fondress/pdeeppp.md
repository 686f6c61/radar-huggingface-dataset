# fondress/PDeepPP

## Resumen

PDeepPP es un conjunto de modelos de lenguaje de proteinas (protein language models, pLM) orientado a la prediccion de sitios de modificacion post-traduccional (PTM) y a la clasificacion de bioactividad de peptidos. Lo desarrolla el autor fondress y se distribuye como un "hub" de modelos especializados bajo licencia MIT, acompanado del articulo "A general language model for peptide identification" (arXiv:2502.15610). El repositorio principal actua como punto de entrada a decenas de variantes afinadas para tareas concretas.

La arquitectura es hibrida: combina mecanismos de auto-atencion tipo transformer con capas convolucionales (modulos TransConv1d y PosCNN) para capturar dependencias globales y caracteristicas locales en secuencias proteicas. Parte de embeddings preentrenados de ESM, sobre los que anade componentes modulares. No es un modelo generativo de texto: su pipeline declarado en Hugging Face es `feature-extraction`, y su uso previsto es la extraccion de representaciones y la clasificacion/prediccion sobre secuencias de aminoacidos.

Su relevancia actual radica en la proliferacion de tareas de biologia computacional que requieren modelos especializados y ligeros frente a grandes modelos generalistas. PDeepPP ofrece variantes concretas para docenas de PTM (fosforilacion, glicosilacion, metilacion, ubiquitinacion, SUMOilacion, etc.) y de bioactividad (antimicrobiana, anticancerigena, toxicidad, sabores como amargo o umami), lo que facilita su integracion en pipelines de proteomica y descubrimiento de peptidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida transformer + CNN (auto-atencion global, TransConv1d, PosCNN) sobre embeddings ESM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (opera sobre secuencias de aminoacidos, no sobre lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 27,9 GB; carga via `transformers` con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

PDeepPP emplea una arquitectura hibrida que integra auto-atencion tipo transformer para capturar dependencias de largo alcance en secuencias proteicas, junto con modulos convolucionales especializados: TransConv1d, que combina capas transformer y convolucionales para extraer caracteristicas locales, y PosCNN, que introduce operaciones convolucionales conscientes de la posicion para mejorar la representacion de la secuencia. El modelo se apoya en embeddings preentrenados de ESM y anade componentes modulares sobre ellos.

El repositorio se organiza como un hub de modelos especializados, cada uno afinado para una tarea concreta (prediccion de un tipo de PTM o clasificacion de una bioactividad). La model card indica que los modelos se validan sobre conjuntos de datos publicos como PTM y BPS, y que pueden reutilizarse para fine-tuning en tareas personalizadas. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta de los datasets ni si se emplearon tecnicas de RLHF o DPO; dado el caracter discriminativo del modelo (feature-extraction y clasificacion), estas tecnicas no serian el foco habitual.

## Capacidades

- Prediccion de sitios de modificacion post-traduccional (PTM): fosforilacion en serina y tirosina, glicosilacion N- y O-ligada, metilacion en lisina y arginina, SUMOilacion, ubiquitinacion, S-palmitoilacion, N6-acetil-lisina, hidroxiprolina (P y K) y acido pirrolidon-carboxilico (Q).
- Clasificacion de bioactividad de peptidos: actividad ACE, BBP, DPPIV, toxicidad, antimalarica, anticancerigena, antiviral, antioxidante, antibacteriana, antifungica, antimicrobiana, anti-MRSA, antiparasitica, amarga, umami, neuroactiva, quorum sensing y TTCA.
- Extraccion de caracteristicas (feature extraction) de secuencias proteicas mediante representaciones internas del modelo.
- Fine-tuning extensible para nuevos tipos de PTM y nuevas tareas de clasificacion de secuencias.
- No dispone de generacion de texto, razonamiento conversacional, codigo, matematicas, vision ni audio.
- No se documenta soporte de tool calling ni de agentes multi-paso.

## Casos de uso

- Prediccion de fosforilacion en pipelines de proteomica: usar la variante PDeepPP_Phosphoserine o Phosphorylation-Y para priorizar candidatos en estudios de senalizacion celular antes de validacion experimental por espectrometria de masas.
- Descubrimiento de peptidos antimicrobianos: la variante PDeepPP_Antimicrobial o Anti-MRSA permite filtrar bibliotecas de peptidos candidatos frente a cepas resistentes, reduciendo el numero de sintesis y ensayos in vitro necesarios.
- Evaluacion de toxicidad de peptidos terapeuticos: PDeepPP_Toxicity actua como filtro temprano en el diseno de farmacos peptidicos para descartar secuencias con perfil toxico antes de fases costosas.
- Analisis de glicosilacion en proteinas recombinantes: las variantes N-linked y O-linked glycosylation ayudan a caracterizar sitios de glicosilacion en el desarrollo de biofarmacos y en el control de calidad de lineas celulares.
- Cribado de bioactividad multiple en bibliotecas de peptidos: encadenar varias variantes (antiviral, anticancer, antioxidante) sobre una misma biblioteca para priorizar candidatos con perfiles de actividad combinados.
- Estudio de modificaciones relacionadas con la degradacion proteica: las variantes Ubiquitin y SUMOylation permiten identificar sitios candidatos en estudios de recambio de proteinas y respuesta al estres celular.
- Analisis de sabores en peptidos alimentarios: las variantes Bitter y Umami permiten predecir el perfil organoleptico de hidrolizados proteicos en la industria alimentaria.
- Extraccion de embeddings para modelos downstream: usar el repositorio como extractor de caracteristicas y entrenar clasificadores ligeros propios sobre las representaciones generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 27,9 GB, lo que sugiere que contiene multiples variantes del modelo; cada variante individual seria mas pequena, aunque el tamano exacto por variante no esta disponible.
- VRAM estimada para inferencia: no disponible con precision. Para una unica variante de clasificacion/proteomica, se espera un consumo moderado (tipicamente compatible con GPU de 8-16 GB en funcion del backbone ESM subyacente), pero este dato no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponibles de forma especifica. Al tratarse de un modelo de secuencias biologicas de tamano moderado, cabria esperar buen rendimiento en GPU consumer (RTX 3090, RTX 4090) y en GPU de datacenter (A100, H100) para lotes grandes.
- Despliegue: la carga se realiza via `transformers` (`AutoModel.from_pretrained` con `trust_remote_code=True`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al no ser un modelo generativo, estos motores de inferencia de LLM no serian el objetivo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PDeepPP | no disponible | no disponible | PTM y bioactividad de peptidos | MIT | Hugging Face (repo propio) |
| ESM (familia) | variable (8M-15B segun variante) | no disponible | Embeddings y prediccion de estructura proteica | MIT (variantes abiertas) | Hugging Face / Meta |
| ProtBert / ProtTrans | variable | no disponible | Embeddings de proteinas | no disponible | Hugging Face |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada. PDeepPP se diferencia por su especializacion en PTM y bioactividad de peptidos mediante variantes afinadas, mientras que ESM y ProtBert son backbones generalistas de proteinas.

## Limitaciones y advertencias

- Modelo especializado en secuencias proteicas: no es un LLM de proposito general y no debe usarse para generacion de texto, codigo ni tareas conversacionales.
- No se documentan sesgos especificos, pero al entrenarse sobre datasets biologicos publicos puede heredar sesgos de composicion (sobrerrepresentacion de ciertas especies o familias proteicas).
- Riesgo de alucinacion en sentido estricto bajo, al ser un modelo discriminativo; sin embargo, las predicciones de PTM y bioactividad son probabilidades y pueden producir falsos positivos y negativos, por lo que requieren validacion experimental.
- Limitaciones de contexto e idioma no documentadas; la longitud maxima de secuencia soportada no se especifica.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones de los datasets subyacentes y de los embeddings ESM utilizados.
- Requiere `trust_remote_code=True` para cargar los modelos, lo que implica ejecutar codigo del autor; debe revisarse en entornos de produccion.
- El repositorio es un hub con multiples modelos; es necesario seleccionar la variante correcta para cada tarea y no asumir que una sola variante cubre todas las PTM o bioactividades.
- Algunas variantes (p. ej. Antimalarial y Anticancer) tienen versiones "main" y "alternative", lo que sugiere discrepancias metodologicas que conviene contrastar en la documentacion del GitHub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fondress/PDeepPP
- Articulo (arXiv:2502.15610): https://huggingface.co/papers/2502.15610
- Repositorio GitHub: https://github.com/fondress/PDeepPP/tree/main
- Modelo principal general: https://huggingface.co/fondress/PDeepPP
- Variantes PTM (ejemplos): https://huggingface.co/fondress/PDeepPP_Phosphoserine, https://huggingface.co/fondress/PDeepPP_Phosphorylation-Y, https://huggingface.co/fondress/PDeepPP_N-linked-glycosylation-N, https://huggingface.co/fondress/PDeepPP_O-linked-glycosylation, https://huggingface.co/fondress/PDeepPP_Methylation-K, https://huggingface.co/fondress/PDeepPP_Methylation-R, https://huggingface.co/fondress/PDeepPP_SUMOylation, https://huggingface.co/fondress/PDeepPP_Ubiquitin, https://huggingface.co/fondress/PDeepPP_S-Palmitoylation, https://huggingface.co/fondress/PDeepPP_N6-acetyllysine-K, https://huggingface.co/fondress/PDeepPP_Hydroxyproline-P, https://huggingface.co/fondress/PDeepPP_Hydroxyproline-K, https://huggingface.co/fondress/PDeepPP_Pyrrolidone-carboxylic-acid-Q
- Variantes de bioactividad (ejemplos): https://huggingface.co/fondress/PDeepPP_ACE, https://huggingface.co/fondress/PDeepPP_BBP, https://huggingface.co/fondress/PDeepPP_DPPIV, https://huggingface.co/fondress/PDeepPP_Toxicity, https://huggingface.co/fondress/PDeepPP_Antimalarial-main, https://huggingface.co/fondress/PDeepPP_Antimalarial-alternative, https://huggingface.co/fondress/PDeepPP_Anticancer-main, https://huggingface.co/fondress/PDeepPP_Anticancer-alternative, https://huggingface.co/fondress/PDeepPP_Antiviral, https://huggingface.co/fondress/PDeepPP_Antioxidant, https://huggingface.co/fondress/PDeepPP_Antibacterial, https://huggingface.co/fondress/PDeepPP_Antifungal, https://huggingface.co/fondress/PDeepPP_Antimicrobial, https://huggingface.co/fondress/PDeepPP_Anti-MRSA, https://huggingface.co/fondress/PDeepPP_Antiparasitic, https://huggingface.co/fondress/PDeepPP_bitter, https://huggingface.co/fondress/PDeepPP_umami, https://huggingface.co/fondress/PDeepPP_neuro, https://huggingface.co/fondress/PDeepPP_Quorum, https://huggingface.co/fondress/PDeepPP_TTCA
