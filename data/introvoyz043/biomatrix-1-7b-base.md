# introvoyz043/BioMatrix-1.7B-Base

## Resumen

BioMatrix-1.7B-Base es un modelo fundacional biologico de tipo decoder-only que integra de forma nativa secuencias 1D, estructuras 3D y lenguaje natural, tanto para moleculas como para proteinas, dentro de una unica arquitectura. Lo desarrollan investigadores del Shanghai AI Laboratory y de la Gaoling School of Artificial Intelligence (Renmin University of China), con Qizhi Pei como primer autor y Lijun Wu como autor senior, y se publica junto al preprint arXiv 2606.22138.

Tecnicamente se trata de un ajuste por preentrenamiento continuado multimodal sobre el checkpoint Qwen/Qwen3-1.7B-Base, con 304.400 millones de tokens procesados y una ventana de contexto de 8.192 tokens. El repositorio de HuggingFace analizado (introvoyz043/BioMatrix-1.7B-Base) es un duplicado del original QizhiPei/BioMatrix-1.7B-Base, con licencia Apache 2.0 y pesos en safetensors que suman 2.097.800.192 parametros.

La relevancia del modelo reside en su esquema de tokenizacion unificado: todas las modalidades biologicas se mapean a un unico espacio discreto de tokens y se consumen y generan bajo un objetivo unico de prediccion del siguiente token, sin codificadores externos, adaptadores de proyeccion ni cabezas de salida especificas de modalidad. Es un checkpoint base, no instruido, pensado para ajuste fino posterior; para inferencia directa el propio autor remite a la variante SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con vocabulario extendido para biomoleculas; preentrenamiento continuado multimodal |
| Parametros totales | 2.097.800.192 (segun safetensors); la model card indica 1,7B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (repositorio solo con pesos safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; repositorio de 4,2 GB) |

## Arquitectura y entrenamiento

La base es Qwen3-1.7B-Base, un transformer decoder-only, sobre el que se aplica preentrenamiento continuado multimodal. La innovacion principal es un esquema de tokenizacion unificado que proyecta todas las modalidades biologicas a un espacio discreto compartido: secuencias moleculares 1D en notacion SMILES y SELFIES, estructuras moleculares 3D mediante MolStrucTok con decoder "branch-decoupled", secuencias proteicas 1D a nivel de residuo, estructuras proteicas 3D mediante un tokenizador de backbone GCP-VQVAE, y lenguaje natural heredado del tokenizador de Qwen3. El vocabulario extendido anade 11.294 tokens conjuntos de molecula 3D (compuestos a partir de atomos SELFIES y codigos MolStrucTok), 4.096 tokens de proteina 3D (codebook GCP-VQVAE), 26 tokens de proteina 1D (aminoacidos mas no estandar/desconocido) y tokens de atomo SELFIES junto con tokens de control especificos de modalidad. Las entradas nuevas del vocabulario se inicializan con un esquema basado en descripciones: cada token se ancla al espacio de embeddings preentrenado de Qwen3 promediando los embeddings de los subtokens de una descripcion corta en lenguaje natural (por ejemplo, `<A_W>` a partir de "Tryptophan"), mas una perturbacion gaussiana isotropica para romper la simetria.

El corpus de preentrenamiento continuado suma 304.400 millones de tokens: 105.300 millones de texto (25.600 millones generales de FineWeb-Edu y 79.700 millones cientificos de FineFineWeb en biologia, quimica, medicina y salud, mas articulos completos de PubMed); 73.700 millones de moleculas (36.000 millones 1D de PubChem y MolTextNet; 17.600 millones 3D de PubChem, PCQM4Mv2 y PubChemQC; 24.000 millones adicionales de descripciones textuales, propiedades y nombres IUPAC); 77.400 millones de proteinas (17.100 millones 1D de UniRef50; 38.500 millones 3D de RCSB PDB y AlphaFold DB; 19.500 millones de anotaciones Swiss-Prot y TrEMBL; 2.900 millones adicionales); y 48.000 millones de datos entre entidades (17.100 millones de texto intercalado de PubMed, bioRxiv, S2ORC y USPTO; 11.400 millones 3D de CrossDocked y PPIRef; 19.500 millones de BindingDB, STITCH, jglaser y AlphaSeq). La configuracion de entrenamiento usa el framework LLaMA-Factory sobre 64 GPU NVIDIA H100, con batch global de 1.024, longitud maxima de secuencia de 8.192 tokens, optimizador AdamW, learning rate maximo de 2,0 x 10^-4 con schedule coseno, 2.000 pasos de warmup y aproximadamente 36.400 pasos totales, equivalentes a una epoca sobre el corpus completo. No se documento ninguna fase de RLHF ni DPO: es exclusivamente un checkpoint base.

## Capacidades

- Modelado generativo de secuencias moleculares 1D en notaciones SMILES y SELFIES.
- Modelado de estructuras moleculares 3D mediante tokens discretos derivados de MolStrucTok.
- Modelado de secuencias proteicas 1D a nivel de residuo, con 26 tokens dedicados (aminoacidos estandar, no estandar y desconocido).
- Modelado de estructuras proteicas 3D a traves del codebook GCP-VQVAE (4.096 tokens).
- Comprension y generacion de lenguaje natural cientifico en ingles (texto general, biologico, quimico y medico).
- Tareas entre entidades o cross-modales: intercalado de texto y 3D, con datos de CrossDocked, PPIRef, BindingDB, STITCH, jglaser y AlphaSeq.
- Prediccion del siguiente token unificada sobre todas las modalidades, sin cabezas de salida especificas.
- Extraccion de embeddings para clasificacion y regresion posteriores (uso indicado explicitamente en la model card).
- Base para ajuste fino y preentrenamiento continuado en tareas biologicas personalizadas.

No se documenta soporte de tool calling, function calling, uso agentico multi-paso, vision general, audio ni modo de razonamiento explicito (thinking mode). Tampoco se documenta capacidad multilingue mas alla del ingles.

## Casos de uso

- Ajuste fino para prediccion de propiedades moleculares: al ser un checkpoint base con representaciones alineadas de molecula 1D, 3D y texto, se puede entrenar una cabeza de regresion sobre los embeddings para tareas como solubilidad, toxicidad o actividad frente a dianas concretas.
- Prediccion de estructura proteica y plegamiento: los tokens de proteina 3D derivados de GCP-VQVAE permiten plantear tareas de folding e inverse folding tras el ajuste fino sobre datasets tipo RCSB PDB o AlphaFold DB.
- Anotacion y generacion de descripciones de moleculas (molecule captioning): entrenando sobre pares molecula-texto, el modelo puede generar descripciones en lenguaje natural de compuestos, utiles para bases de datos quimicas internas.
- Busqueda y modelado de interacciones proteina-ligando: los datos de BindingDB y CrossDocked en el preentrenamiento permiten ajustar el modelo para estimar afinidad de union o para filtrar candidatos en cribado virtual.
- Extraccion de embeddings para clasificacion de proteinas: la model card indica el uso de embeddings para tareas posteriores de clasificacion y regresion, por ejemplo anotacion funcional o prediccion de localizacion subcelular.
- Preentrenamiento continuado sobre corpus propietario: el modelo admite seguir entrenando con datos internos de una organizacion (por ejemplo, literatura patentada o resultados de laboratorio) sin partir de cero.
- Generacion de moleculas condicionada: con el vocabulario SELFIES integrado, se puede ajustar para generar moleculas validas bajo restricciones textuales o de propiedades.
- Investigacion en aprendizaje de representaciones multimodales: sirve como banco de pruebas para estudiar como una arquitectura unica representa simultaneamente secuencia, estructura y lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas especificas de tareas biologicas, y la busqueda web no aporta cifras numericas de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia (valores calculados a partir del numero de parametros, no publicados por el autor): aproximadamente 4,2-4,5 GB en FP16/BF16 para los pesos; en torno a 8,4 GB en FP32.
- El KV cache es adicional; con 8.192 tokens de contexto y una configuracion GQA tipica de un modelo de 1,7B, el orden de magnitud es de aproximadamente 1 GB en FP16 (estimacion, no dato oficial).
- GPU profesionales recomendadas: NVIDIA A100 (40/80 GB), H100 (usada para el entrenamiento con 64 unidades), L40S o A10G. Cualquiera de ellas sobra para inferencia en precision completa.
- GPU de consumo: cabe sin problema en tarjetas con 8 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. Incluso en 8 GB (RTX 3070, RTX 4060) seria viable en FP16 con contexto reducido.
- Tarjetas muy pequenas (6 GB o menos) requeririan cuantizacion a 8 o 4 bits, que no esta publicada oficialmente y habria que generar.
- Opciones de despliegue: transformers (libreria declarada), Text Generation Inference (tag `text-generation-inference`), y endpoints compatibles (tag `endpoints_compatible`). vLLM es plausible para un decoder-only de este tamano, aunque no se confirma en la informacion. Para llama.cpp u Ollama habria que convertir previamente los pesos a GGUF, ya que el repositorio solo contiene safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card incluye una comparativa de cobertura de modalidades, que se reproduce a continuacion. No se dispone de datos de parametros, contexto o rendimiento del resto de modelos en la informacion proporcionada, por lo que esas celdas se marcan como no disponibles.

| Modelo | Molecula 1D | Molecula 3D | Proteina 1D | Proteina 3D | Lenguaje natural |
|---|---|---|---|---|---|
| ESM3 | No | No | Si | Si | Si |
| 3D-MoLM | Si | Si | No | No | Si |
| AlphaFold3 | Si | Si | Si | Si | No |
| BioT5 / BioT5+ | Si | No | Si | No | Si |
| BioMedGPT | Si | No | Si | No | Si |
| BioMatrix-1.7B-Base | Si | Si | Si | Si | Si |

Comparacion adicional con alternativas directas:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| BioMatrix-1.7B-Base | 2.097.800.192 (safetensors) | 8.192 tokens | Apache 2.0 | HuggingFace (original y duplicado), pesos safetensors |
| BioMatrix-4B-Base | no disponible | no disponible | no disponible | HuggingFace (QizhiPei/BioMatrix-4B-Base) |
| BioMatrix-1.7B-SFT | no disponible | no disponible | no disponible | HuggingFace (QizhiPei/BioMatrix-1.7B-SFT) |
| Qwen3-1.7B-Base | no disponible | no disponible | no disponible | HuggingFace (Qwen/Qwen3-1.7B-Base) |

## Limitaciones y advertencias

- Es un checkpoint base, no un modelo instruido: no sigue instrucciones ni mantiene formato conversacional de forma fiable, pese a llevar la etiqueta `conversational`. Para inferencia directa el autor recomienda la variante SFT.
- No se documento ninguna fase de alineacion (RLHF, DPO ni similar), por lo que no hay mitigacion de sesgos ni de toxicidad.
- Riesgo de alucinacion en generacion de texto cientifico y en la produccion de secuencias o estructuras: el modelo puede generar moleculas o proteinas invalidas o quimicamente implausibles, que requieren validacion con herramientas especificas (por ejemplo, parsers SMILES o validadores estructurales).
- Idiomas: solo ingles declarado. No hay soporte documentado de castellano ni de otras lenguas.
- Longitud de contexto limitada a 8.192 tokens, insuficiente para ingestas documentales largas sin troceado.
- El repositorio analizado (introvoyz043/BioMatrix-1.7B-Base) es un duplicado del original de QizhiPei, con 0 descargas y 0 likes en el momento de la consulta. Para uso en produccion conviene referenciar el repositorio original y verificar la integridad de los pesos.
- Discrepancia entre el numero de parametros declarado en la model card (1,7B) y el total real de safetensors (2.097.800.192, aproximadamente 2,1B); conviene tenerlo en cuenta al dimensionar memoria.
- No hay cuantizaciones oficiales publicadas, lo que anade trabajo de conversion para despliegues con llama.cpp u Ollama.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. No se documentan restricciones adicionales de uso, pero al derivar de Qwen3-1.7B-Base conviene revisar tambien las condiciones del modelo base.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia cuantitativa de rendimiento frente a alternativas en tareas biologicas concretas.

## Enlaces

- Modelo en HuggingFace (repositorio analizado): https://huggingface.co/introvoyz043/BioMatrix-1.7B-Base
- Modelo original del autor: https://huggingface.co/QizhiPei/BioMatrix-1.7B-Base
- Variante instruida: https://huggingface.co/QizhiPei/BioMatrix-1.7B-SFT
- Variante mayor: https://huggingface.co/QizhiPei/BioMatrix-4B-Base
- Coleccion de modelos y datos: https://huggingface.co/collections/QizhiPei/biomatrix
- Paper (arXiv): http://arxiv.org/abs/2606.22138
- Codigo fuente: https://github.com/QizhiPei/BioMatrix
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Ficha en bio.rodeo: https://bio.rodeo/models/biomatrix
- Espejo en ModelHub: https://dev.modelhub.org.cn/QizhiPei/BioMatrix-1.7B-Base
