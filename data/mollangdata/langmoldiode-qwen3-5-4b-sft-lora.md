# mollangdata/LangMolDiode-Qwen3.5-4B-SFT-LoRA

## Resumen

LangMolDiode-Qwen3.5-4B-SFT-LoRA es un adaptador LoRA de tipo PEFT para el modelo base Qwen/Qwen3.5-4B, publicado por el usuario mollangdata. El adaptador convierte el modelo generalista en un generador de moleculas condicionado por lenguaje: recibe descripciones estructurales detalladas de moleculas en texto y produce la cadena SMILES correspondiente. Es, por tanto, un modelo especializado en la tarea text-to-SMILES dentro del ambito de la quimica computacional.

El adaptador se ha entrenado sobre el corpus verificado LangMolDiode-SFT-Corpus y forma parte del proyecto LangMolDiode, cuyo codigo y checkpoints se distribuyen a traves de anonimized repositories (anonymous.4open.science). El modelo base Qwen3.5-4B aporta la arquitectura transformer y la ventana de contexto, mientras que el LoRA introduce la especializacion quimica con un rango de 64 y alpha de 128.

La relevancia de esta ficha es acotada: se trata de un adaptador de investigacion con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados, y con un unico artefacto de 0,4 GB. Su interes radica en ser un ejemplo de especializacion via LoRA de un LLM de 4B para una tarea cientifica concreta, no en un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B; rango 64, alpha 128 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, no declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Tamano del repositorio | 0,4 GB |
| Dataset de entrenamiento | mollangdata/LangMolDiode-SFT-Corpus |
| Modelo base | Qwen/Qwen3.5-4B |
| Modelo fusionado equivalente | mollangdata/LangMolDiode-Qwen3.5-4B-SFT |

## Arquitectura y entrenamiento

El adaptador es un LoRA de PEFT aplicado sobre Qwen/Qwen3.5-4B, un transformer decoder-only de 4B parametros. El LoRA tiene rango 64 y alpha 128, lo que implica una capacidad de adaptacion relativamente alta para un adaptador de este tamano (el repositorio ocupa 0,4 GB). No se especifica en la informacion disponible sobre que modulos del transformer se aplica el LoRA (attention, MLP o ambos), ni si se congela la totalidad de los pesos base.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) sobre el corpus LangMolDiode-SFT-Corpus, descrito como verificado. No se detalla el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La tarea aprendida es condicional: dada una descripcion textual detallada de la estructura molecular, generar el SMILES correspondiente. El modelo fusionado equivalente se publica como mollangdata/LangMolDiode-Qwen3.5-4B-SFT.

## Capacidades

- Generacion de SMILES a partir de descripciones textuales de estructura molecular (text-to-SMILES).
- Modelado de lenguaje condicionado por descripcion estructural detallada, no por nombre comun ni por formula bruta.
- Especializacion en el dominio quimico (tag `chemistry`), orientada a la representacion canonica de moleculas.
- Capacidades generales del modelo base Qwen3.5-4B potencialmente conservadas, aunque no documentadas tras el SFT.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Generacion de SMILES en pipelines de quimica computacional: el modelo recibe una descripcion estructural redactada por un quimico o extraida de una base de datos y devuelve la cadena SMILES para su uso en herramientas de docking, simulacion o analisis de propiedades.
- Prototipado de interfaces text-to-molecule: integracion en un asistente que traduzca descripciones en lenguaje natural a representaciones SMILES para busquedas en bases de datos como PubChem o ChEMBL.
- Enriquecimiento de datasets quimicos: dado un conjunto de descripciones estructurales sin SMILES asociado, generar candidatos de SMILES que luego se validen con RDKit u Open Babel.
- Investigacion en representacion molecular: servir como baseline especializado para comparar estrategias de generacion de SMILES frente a modelos generalistas o modelos dedicados como MolT5.
- Educacion y demostraciones: ejemplo de fine-tuning via LoRA de un LLM de 4B para una tarea cientifica, util en cursos o talleres sobre adaptacion de modelos.
- Generacion asistida en entornos con recursos limitados: al ser un adaptador de 0,4 GB sobre un modelo de 4B, puede desplegarse en GPU de consumo con cuantizacion, a diferencia de modelos quimicos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4B en FP16 requiere aproximadamente 8 GB de VRAM solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits alrededor de 4-5 GB, y en 4 bits alrededor de 3 GB. Estas cifras son estimaciones genericas para modelos de 4B y no estan confirmadas para este adaptador.
- GPU recomendadas: no especificadas. Por tamano del modelo base, cabria esperar funcionamiento en RTX 3090, RTX 4090, A100 y H100; no confirmado.
- Compatibilidad con GPU de consumo: probable para el modelo base de 4B con cuantizacion, pero no documentada.
- Opciones de despliegue: el adaptador es PEFT, por lo que requiere cargar el modelo base Qwen/Qwen3.5-4B y aplicar el LoRA (por ejemplo con la libreria `peft` y `transformers`). El modelo fusionado equivalente facilitaria el despliegue en vLLM, TGI o llama.cpp, pero no se documenta compatibilidad explicita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LangMolDiode-Qwen3.5-4B-SFT-LoRA | 4B base + LoRA r64 | no disponible | text-to-SMILES | no disponible | Hugging Face (0 descargas) |
| MolT5 (base/large) | 0,3B / 0,8B | 512 tokens aprox. (no confirmado) | text-to-SMILES y descripcion de moleculas | Apache 2.0 (segun publicacion original) | Hugging Face |
| Qwen3.5-4B (base) | 4B | no disponible | proposito general | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, tarea y disponibilidad.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse al autor antes de cualquier uso en produccion.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- No se especifican idiomas soportados; el modelo base Qwen3.5-4B es multilingue, pero el SFT podria haber degradado o sesgado el comportamiento linguistico.
- Riesgo de alucinacion en la generacion de SMILES: cadenas sintacticamente validas pero quimicamente incorrectas o no correspondientes a la descripcion. Se recomienda validacion obligatoria con RDKit u Open Babel.
- No se documenta la tasa de validez quimica ni la exactitud de la generacion.
- No se detalla la composicion del dataset de SFT, por lo que se desconoce el sesgo hacia ciertas familias de compuestos.
- El adaptador requiere cargar el modelo base Qwen3.5-4B, lo que anade dependencia y coste de despliegue frente a un modelo fusionado.
- El proyecto se distribuye con enlaces anonimizados (anonymous.4open.science), lo que sugiere un contexto de revision por pares o evaluacion anonima; la trazabilidad a un autor identificable es limitada.
- No hay informacion sobre el contexto maximo efectivo tras el SFT; descripciones estructurales muy largas podrian truncarse.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/mollangdata/LangMolDiode-Qwen3.5-4B-SFT-LoRA
- Modelo fusionado equivalente: https://huggingface.co/mollangdata/LangMolDiode-Qwen3.5-4B-SFT
- Dataset de SFT: https://huggingface.co/datasets/mollangdata/LangMolDiode-SFT-Corpus
- Coleccion de checkpoints: https://huggingface.co/collections/mollangdata/langmoldiode-checkpoints-6b05f5b06b8425509bae4277
- Codigo del proyecto (anonimizado): https://anonymous.4open.science/r/LangMolDiode/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
