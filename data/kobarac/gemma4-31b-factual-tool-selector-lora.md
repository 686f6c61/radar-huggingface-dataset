# Kobarac/gemma4-31b-factual-tool-selector-lora

## Resumen

`Kobarac/gemma4-31b-factual-tool-selector-lora` es un adaptador PEFT LoRA sobre el modelo base `google/gemma-4-31B-it`, publicado por el usuario Kobarac. No es un modelo autonomo ni un juez de factualidad completo: es la etapa de enrutamiento determinista de herramientas dentro de una arquitectura mayor de verificacion de hechos. Para cada afirmacion atomica, el selector emite como maximo una llamada a herramienta soportada o delega en el verificador neuronal fijo de la arquitectura.

El adaptador se entreno sobre un modelo base congelado y cuantizado, con parametros LoRA entrenables en BF16, rango 8 y alpha 160, aplicados sobre las ocho ultimas capas del transformer (capas 52 a 59) en las proyecciones q/k/v/o y gate/up/down. El conjunto de datos asociado es `Kobarac/gemma4-31b-tool-selector-sft-v1.1`, con la variante de prompt `selector_v1`.

Su relevancia es acotada pero clara: demuestra que un enrutador de herramientas de dominio restringido, con validacion estricta de argumentos JSON, puede corregir errores de conteo y de aritmetica de un juez neuronal. En la evaluacion interna de 128 ejemplos congelados, la correccion del sistema hibrido paso del 89,84 % al 96,88 %. El checkpoint publicado es el 176, seleccionado manualmente, y su artefacto de decision figura como `pending_explicit_activation`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre transformer decoder (modelo base `google/gemma-4-31B-it`) |
| Parametros totales | Modelo base de 31B; adaptador LoRA con rango 8 sobre 8 capas (numero exacto de parametros entrenables no disponible) |
| Parametros activos | no disponible (no se confirma que el modelo base sea MoE) |
| Longitud de contexto | no disponible (la hereda del modelo base) |
| Tipos de cuantizacion | El adaptador no esta cuantizado; el entrenamiento uso un base congelado cuantizado con parametros LoRA en BF16. Formatos de cuantizacion para inferencia: no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (el modelo base Gemma mantiene sus propios terminos de uso) |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`), formato PEFT; version de PEFT 0.20.0 |
| Revision del modelo base | `842da3794eaa0b77d5f08bae87a17459d91ff475` |
| Capas objetivo | Capas 52-59 (ocho ultimas) |
| Modulos objetivo | Proyecciones q/k/v/o y gate/up/down |
| Rango / alpha / dropout | 8 / 160 / 0 |
| Llamadas maximas | 1 por afirmacion |
| Tamano del repositorio | 0,0 GB segun HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se aplica sobre `google/gemma-4-31B-it` en una revision concreta y modifica unicamente las proyecciones de atencion (q, k, v, o) y de las capas feed-forward (gate, up, down) de las ocho ultimas capas del transformer (52 a 59). La configuracion es rango 8, alpha 160 y dropout 0, con parametros LoRA en BF16 mientras el modelo base permanecia congelado y cuantizado durante el entrenamiento. El adaptador en si no esta cuantizado, y la model card advierte de que cualquier modelo fusionado en BF16 debe publicarse por separado y verificarse contra la inferencia adaptador-sobre-base.

El entrenamiento se realizo sobre `Kobarac/gemma4-31b-tool-selector-sft-v1.1`, un dataset de supervision del enrutamiento de herramientas, con la variante de prompt `selector_v1`. No se especifican el numero de tokens, la composicion del dataset, ni si hubo RLHF o DPO. La innovacion tecnica no esta en la arquitectura, sino en el contrato de ejecucion: el selector solo puede invocar herramientas de un registro versionado de primitivas (`arithmetic_relation_v1`, `masked_aggregate_v1`, `currency_relation_v1`, `scaled_number_v1`), con argumentos JSON primitivos y validacion estricta que rechaza claves de mas o de menos, decimales no finitos, vectores sobredimensionados, bases de divisa ausentes, empates ambiguos, operaciones no soportadas y rutas de afirmaciones parciales. Cualquier rechazo, aplazamiento, salida malformada o fallo en tiempo de ejecucion recae en el verificador neuronal fijo. El checkpoint publicado es el 176, seleccionado manualmente sobre datos de desarrollo, y el artefacto de decision registra el estado `pending_explicit_activation`: publicarlo no implica que este activo por defecto en la arquitectura completa.

## Capacidades

- Enrutamiento determinista de herramientas: para cada afirmacion atomica, elige como maximo una herramienta del registro versionado o delega en el verificador de respaldo.
- Verificacion de relaciones aritmeticas: razones, cambios porcentuales y porcentajes relativos (`arithmetic_relation_v1`).
- Recuentos y sumas enmascaradas sobre vectores (`masked_aggregate_v1`).
- Comparaciones monetarias sobre base comun: mayor, menor, total y comprobaciones de base (`currency_relation_v1`).
- Comprobacion de igualdades del tipo coeficiente por multiplicador (`scaled_number_v1`).
- Emision de llamadas a herramienta con argumentos JSON primitivos y validacion estricta del esquema.
- Aplazamiento explicito (deferral) cuando la afirmacion no es resoluble con el registro de primitivas disponible.
- Integracion como etapa intermedia en un pipeline de verificacion de hechos, no como componente autonomo.
- Capacidades multilingues: no disponibles (no se documentan idiomas).
- No se documentan capacidades de vision, audio, modo de razonamiento extendido ni generacion libre de texto como objetivo del adaptador.

## Casos de uso

- Verificacion de cifras en informes financieros: el selector detecta afirmaciones como un incremento de ingresos del 18 % y llama a `arithmetic_relation_v1` con los trimestres comparados, de modo que el error se marca como no soportado en lugar de pasar desapercibido.
- Auditoria de resumenes generados por LLM: se extraen afirmaciones atomicas de un resumen y el selector decide cuales pueden comprobarse con operaciones aritmeticas o monetarias, reduciendo el trabajo del verificador neuronal al resto.
- Control de calidad en pipelines de RAG: tras recuperar documentos y generar una respuesta, el selector actua como filtro de factualidad sobre las afirmaciones cuantitativas, con caida controlada al verificador cuando la primitiva no aplica.
- Analisis de informes trimestrales y memorias anuales: comparaciones de mayor/menor/total entre divisas y periodos mediante `currency_relation_v1`, util en equipos de analisis que procesan documentos de forma masiva.
- Validacion de tablas y conjuntos de datos tabulares: recuentos y sumas con mascara (`masked_aggregate_v1`) para contrastar agregados declarados en texto contra los datos de origen.
- Enrutamiento de herramientas en agentes acotados: sirve como capa de seleccion de herramienta con contrato estricto en sistemas donde no se permite generacion libre de codigo ni argumentos no validados.
- Construccion y depuracion de datasets de verificacion: el registro de decisiones y hashes de linaje permite reproducir que afirmaciones se enrutaron a que herramienta y cuales se delegaron.
- Pruebas de regresion de sistemas de fact-checking: comparar el recuento de afirmaciones no soportadas antes y despues de activar el selector, como en el caso E008 documentado.

## Benchmarks y rendimiento

| Evaluacion | Conjunto | Metrica | Resultado |
|---|---|---|---|
| Hibrido con selector (checkpoint 176) | 128 ejemplos de familia, congelados | Correccion hibrida | 124/128 (96,88 %) |
| Base con verificador neuronal, sin selector | 128 ejemplos de familia, congelados | Correccion hibrida | 115/128 (89,84 %) |
| Efecto del selector | 128 ejemplos de familia, congelados | Reparaciones / regresiones | 9 reparaciones, 0 regresiones causadas por herramientas |
| Caso E008 | 1 ejemplo registrado | Recuento de afirmaciones no soportadas | Juez directo: 2; hibrido con selector: 3 (correcto) |

En el caso E008, el juez directo de Gemma 4 31B conto 2 hechos no soportados aunque las 3 afirmaciones de la respuesta eran incorrectas. La extraccion de afirmaciones expuso las tres por separado, pero el verificador de respaldo siguio sin detectar el error del "aumento de ingresos del 18 %". El selector llamo a `arithmetic_relation_v1` con Q1 = 4.940.000, Q2 = 6.273.800 y valor declarado 18; la herramienta calculo 27 y marco la afirmacion como no soportada, con lo que el sistema hibrido devolvio el recuento correcto de 3.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base (el adaptador anade un coste despreciable; el repositorio ocupa 0,0 GB): en BF16, aproximadamente 62 GB solo de pesos, mas cache KV y activaciones. Estas cifras son estimaciones derivadas del numero de parametros, no datos publicados por el autor.
- En FP8/INT8: aproximadamente 31 GB de pesos mas cache KV.
- En cuantizacion de 4 bits (GPTQ, AWQ o GGUF Q4): aproximadamente 15-18 GB de pesos mas cache KV, dependiendo del grupo de cuantizacion.
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16 en una sola GPU; 2x A100 40 GB o 2x L40S 48 GB como alternativas multi-GPU.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB solo es viable con cuantizacion de 4 bits y contextos cortos; por debajo de 24 GB el modelo base no cabe de forma practica.
- Opciones de despliegue: `transformers` + `peft` (procedimiento documentado en la model card), vLLM y TGI mediante el soporte de adaptadores LoRA. El uso con llama.cpp u Ollama requiere conversion previa del base a GGUF y, previsiblemente, fusion del adaptador; no esta verificado en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se identifican en la informacion disponible otros adaptadores publicos comparables para enrutamiento determinista de herramientas de factualidad. La comparacion relevante es interna, contra el propio juez base y su verificador de respaldo:

| Configuracion | Naturaleza | Correccion en 128 ejemplos | Caso E008 | Licencia |
|---|---|---|---|---|
| Selector LoRA (este adaptador) + verificador | Enrutador de primitivas + verificador neuronal | 124/128 (96,88 %) | 3 (correcto) | Apache-2.0 |
| Base con verificador, sin selector | Juez neuronal directo | 115/128 (89,84 %) | 2 (incorrecto) | Terminos del modelo base |
| Herramientas solas | Registro determinista de primitivas | no disponible | no disponible | No disponible |

Comparaciones con otros modelos de la misma categoria por tamano o tarea: no disponible.

## Limitaciones y advertencias

- No es un modelo autonomo ni una autoridad de verificacion: es un selector de herramientas dentro de una arquitectura mayor y depende del verificador de respaldo.
- Solo soporta el registro versionado de primitivas (`arithmetic_relation_v1`, `masked_aggregate_v1`, `currency_relation_v1`, `scaled_number_v1`). Las operaciones no soportadas deben delegar obligatoriamente.
- El enrutamiento de afirmaciones parciales, los planes malformados y las operaciones no soportadas se aplazan; el comportamiento fuera de ese contrato no esta garantizado.
- La evaluacion se realizo sobre un benchmark pequeno y especifico (128 ejemplos), por lo que el rendimiento puede no generalizar a otros dominios, idiomas, prompts o implementaciones de herramientas.
- Idiomas soportados: no disponible. No hay evidencia publicada sobre comportamiento multilingue.
- Riesgo de alucinacion: el adaptador puede producir llamadas malformadas o elegir una herramienta inadecuada; la validacion estricta y la caida al verificador mitigan el problema, pero no lo eliminan.
- Estado `pending_explicit_activation`: el artefacto de decision indica que la publicacion no implica activacion por defecto en la arquitectura completa.
- Licencia Apache-2.0 para el adaptador, pero el modelo base Gemma esta sujeto a los terminos de uso de Google; hay que preservar los avisos upstream. "Gemma" es una marca de Google LLC y su uso es descriptivo, sin implicar respaldo.
- Los modelos fusionados publicados aparte deben verificarse contra la inferencia adaptador-sobre-base, ya que el autor no garantiza equivalencia.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kobarac/gemma4-31b-factual-tool-selector-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/Kobarac/gemma4-31b-tool-selector-sft-v1.1
- Implementacion ejecutable de las herramientas: https://huggingface.co/datasets/Kobarac/gemma4-31b-tool-selector-sft-v1.1/blob/main/source/deterministic_tools.py
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Revision del modelo base: `842da3794eaa0b77d5f08bae87a17459d91ff475`
- Commit del repositorio: `ccdf925a5b5e635caccc566367276a311509d73f`
- Hashes de integridad declarados: `adapter_config.json` = `e1f95d84402ed0b49333127db77a51f60db79f12a96798bd1707789193b99002`; `adapter_model.safetensors` = `29d318f92641297fd1442d698df2b79ecd4a4532defc9296fe375ced19d1621e`; `lineage/manifest.json` = `1a66f06c8f41d45b2891740c77a5d6298ebe3332d97521c3d42f7db1e3f2a446`; `lineage/selector_checkpoint_decision.json` = `7252c346e83e5455f624788f986f49f70ea8c6fee0264675486babcf350018b0`
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las paginas devueltas por la busqueda no guardan relacion con el artefacto.
