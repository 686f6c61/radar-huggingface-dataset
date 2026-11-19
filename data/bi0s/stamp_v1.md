# bi0s/STAMP_V1

## Resumen

STAMP_V1 es un repositorio de checkpoints publicado por el usuario bi0s en Hugging Face que agrupa diez modelos entrenados dentro del proyecto STAMP (no se especifica el significado del acronimo en la informacion disponible). El repositorio no contiene un modelo unico, sino un conjunto de pesos orientados a tareas de representacion molecular y generacion quimica: codificadores tipo encoder con objetivos MLM y MTR, modelos MolT5 para traduccion molecula-texto y texto-molecula, modelos AO-GPT de generacion, y modelos especializados en infilling de fragmentos y decoracion de scaffolds. La implementacion de carga y el codigo fuente se distribuyen en un repositorio GitHub externo (YuX-Ren/STAMP_V1).

La relevancia de este lanzamiento reside en que cubre el ciclo completo de un pipeline de quimica computacional con modelos de lenguaje: preentrenamiento sobre corpus moleculares (ZINC, PubChem-10M y una mezcla C4/ZINC), ajuste fino supervisado sobre ChEBI-20 para tareas de traduccion entre modalidades, y modelos de generacion condicionada. Los checkpoints se distribuyen en formato PyTorch `.pt` con clases de modelo personalizadas, no como checkpoints genericos de Transformers, lo que implica que no se pueden cargar con `from_pretrained` estandar.

El tamano total del repositorio es de 9,2 GB, lo que sugiere que los diez checkpoints comparten una base T5 de escala moderada (no se especifica el numero exacto de parametros). El idioma declarado es ingles y la licencia del modelo no esta disponible; solo se incluye la licencia MIT del codigo fuente como archivo separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) para los modelos MolT5; encoder transformer para los modelos MLM/MTR; AO-GPT para generacion autorregresiva (detalles exactos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `.pt` de PyTorch, no se mencionan GGUF ni otras) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible para los pesos; el codigo fuente se distribuye bajo MIT (`SOURCE_CODE_LICENSE`) |
| Formato de pesos | PyTorch `.pt` con clases de modelo personalizadas; tokenizers y vocabularios en `.txt`/`.json`; `manifest.json` con SHA-256 y tamanos |

## Arquitectura y entrenamiento

El repositorio contiene diez checkpoints distintos. Los modelos MolT5 son variantes de T5 entrenadas en dos fases: un preentrenamiento STAMP-MolT5 hasta el paso 500.000 sobre una mezcla de C4 y ZINC, y ajustes finos posteriores sobre ChEBI-20 para las tareas molecula-a-texto y texto-a-molecula, inicializados desde los pasos 350.000 y 500.000. Los codificadores `encoder_mlm` y `encoder_mtr` se entrenaron sobre PubChem (el segundo incorpora estadisticas de descriptores). Los modelos `ao_generation` (AO-GPT, paso 300.000), `fragment_infill` (infilling de fragmentos balanceado) y `scaffold_decoration` (decoracion de scaffolds) cubren tareas generativas condicionadas.

Las fuentes de entrenamiento declaradas incluyen corpus derivados de ZINC, PubChem-10M y la mezcla C4/ZINC. La decodificacion molecular requiere un vocabulario de motivos (`motif_vocab.txt`) y el codec propio de STAMP, lo que indica que el modelo no opera directamente sobre cadenas SMILES crudas sino sobre una tokenizacion basada en fragmentos. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto a partir de representaciones moleculares (molecula-a-texto) sobre el dominio ChEBI-20.
- Generacion de moleculas a partir de descripcion textual (texto-a-molecula).
- Representaciones moleculares densas mediante codificadores entrenados con MLM y MTR sobre PubChem.
- Infilling de fragmentos moleculares (completar fragmentos faltantes en una estructura).
- Decoracion de scaffolds (generar sustituyentes sobre un esqueleto molecular dado).
- Generacion autorregresiva de moleculas con AO-GPT.
- Codificacion y decodificacion mediante un codec de motivos propio de STAMP.
- No se menciona soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidad multilingue limitada al ingles segun el campo `language`.

## Casos de uso

- Descubrimiento de farmacos asistido por texto: usar `molt5_text2mol_from500k` para proponer estructuras candidatas a partir de descripciones textuales de propiedades o farmacoforos, aprovechando el ajuste fino sobre ChEBI-20.
- Anotacion automatica de bases de datos quimicas: emplear `molt5_mol2text_from500k` para generar descripciones en lenguaje natural de moleculas de un catalogo interno, facilitando la indexacion semantica y la busqueda.
- Busqueda por similitud molecular: usar `encoder_mtr` para obtener embeddings de moleculas con estadisticas de descriptores incorporadas y construir indices vectoriales para recuperacion de compuestos analogos.
- Optimizacion de leads mediante decoracion de scaffolds: aplicar `scaffold_decoration` para generar variantes sustituidas de un esqueleto comun, explorando el espacio quimico alrededor de una serie.
- Completado de estructuras incompletas: usar `fragment_infill` para rellenar fragmentos faltantes en registros moleculares incompletos o en tareas de edicion molecular iterativa.
- Generacion de librerias combinatorias: emplear `ao_generation` para muestrear moleculas validas de forma autorregresiva dentro de un pipeline de generacion de librerias virtuales.
- Preentrenamiento y ajuste fino propio: reutilizar `molt5_pretrain_500k` como inicializacion para tareas quimicas especificas de un dominio interno, dado que se distribuye sin estado del optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta. El repositorio completo ocupa 9,2 GB, por lo que cada checkpoint individual es sustancialmente menor; una estimacion conservadora para inferencia en precision completa seria de varios GB por modelo, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible. Dado el formato `.pt` y la ausencia de soporte nativo en frameworks de serving estandar, se requiere el loader del repositorio GitHub de STAMP.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamano real de cada checkpoint, que no se especifica.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI. El unico mecanismo documentado es el loader del repositorio fuente y la descarga selectiva via `hf download bi0s/STAMP_V1 --include 'encoder_mtr/*'`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STAMP_V1 (este) | no disponible | no disponible | Representacion y generacion molecular | no disponible (codigo MIT) | Hugging Face, formato `.pt` custom |
| MolT5 (original) | no disponible en esta ficha | no disponible | Molecula-texto y texto-molecula | no disponible en esta ficha | Hugging Face, formato Transformers |
| Comparativas adicionales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Los checkpoints usan clases de modelo personalizadas y no son compatibles con `from_pretrained` de Transformers; requieren el loader del repositorio GitHub de STAMP.
- Los vocabularios de los codificadores hacen referencia al sistema de entrenamiento original; al cargar en otro sistema hay que mapearlos a `vocab_top4666.txt`.
- La decodificacion molecular exige `motif_vocab.txt` y el codec propio de STAMP; sin ellos la salida no es interpretable como molecula.
- El directorio de preentrenamiento de 350.000 pasos no esta incluido en el inventario local; solo se distribuyen sus dos modelos ajustados derivados.
- El modelo de preentrenamiento de 500.000 pasos se distribuye sin estado del optimizador, lo que impide reanudar el entrenamiento exactamente donde se dejo.
- Los checkpoints son versiones distintas entre si: hay que emparejar el checkpoint evaluado con el experimento reportado y no sustituirlo por uno posterior.
- Los splits de evaluacion held-out no garantizan la exclusion de todas las fuentes de entrenamiento upstream, por lo que puede existir contaminacion de datos.
- La sintaxis molecular valida no implica actividad biologica ni sintetizabilidad; los modelos son herramientas de investigacion.
- La licencia de los pesos no esta disponible; los terminos de los modelos y datasets upstream aplican por separado y el archivo de licencia MIT solo cubre el codigo fuente.
- No se documentan sesgos especificos, pero al ser modelos entrenados sobre corpus quimicos en ingles, su cobertura fuera de ese dominio es incierta.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, aunque es inherente a la generacion de moleculas y texto.

## Enlaces

- Hugging Face: https://huggingface.co/bi0s/STAMP_V1
- Codigo fuente y loader: https://github.com/YuX-Ren/STAMP_V1
- Papers, blogs y demos: no disponible en la informacion proporcionada.
