# sidharthjatt/reasonable-doubt-deberta-ledgar

## Resumen

reasonable-doubt-deberta-ledgar es un clasificador de texto legal desarrollado por el usuario sidharthjatt. Se trata de un ajuste fino de microsoft/deberta-v3-base sobre LEDGAR, la tarea de clasificacion de provisiones contractuales incluida en el benchmark LexGLUE, y exportado a ONNX en FP32. Su funcion es asignar cada clausula de un contrato a una de 100 clases de provision (single-label), no generar texto.

El modelo esta pensado para triaje y enrutado de clausulas contractuales y, de forma destacable, para declarar cuando no esta seguro: incorpora un fichero `router_threshold_fp32.json` con un umbral de confianza calibrado sobre un split de desarrollo que marca aproximadamente el 4% de entradas con menor margen entre las dos clases mas probables.

Es relevante porque es un artefacto pequeno (repo de 0,7 GB), reproducible y con numeros declarados de forma explicita, ademas de documentar con inusual honestidad sus limitaciones (una sola semilla, deriva temporal, truncado a 512 tokens y fallo silencioso de la cuantizacion INT8 en determinadas CPUs). Es un artefacto de investigacion, no asesoramiento juridico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 con cabeza de clasificacion de 100 clases |
| Parametros totales | no disponible en la informacion proporcionada (heredados de microsoft/deberta-v3-base; el repo ONNX FP32 ocupa 0,7 GB) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (las clausulas mas largas se truncan) |
| Tipos de cuantizacion | FP32 (es la version servida); existe una cuantizacion INT8 asociada al modelo base, pero no se sirve |
| Idiomas soportados | ingles (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (`model.onnx`, FP32) con tokenizador SentencePiece (`spm.model`, `tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json`, `added_tokens.json`) |

Otros datos del repositorio: pipeline `text-classification`, libreria `onnx`, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 11 de septiembre de 2026, `base_model: microsoft/deberta-v3-base`, `base_model:quantized:microsoft/deberta-v3-base`, dataset `coastalcph/lex_glue`, tags `legal`, `contracts`, `ledgar`, `lexglue`, `deberta-v3`, `text-embeddings-inference`, `endpoints_compatible`.

## Arquitectura y entrenamiento

La base es DeBERTa-v3-base (He, Liu, Gao y Chen; papers arXiv:2006.03654 y arXiv:2111.09543), un encoder transformer con atencion desacoplada y preentrenamiento al estilo ELECTRA con deteccion de tokens reemplazados. Sobre esa base se anade una cabeza de clasificacion para las 100 clases de provision de LEDGAR. La informacion proporcionada no detalla hiperparametros de ajuste fino, numero de tokens de entrenamiento, composicion exacta del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO; al tratarse de una tarea de clasificacion supervisada, esos procedimientos no serian de aplicacion habitual.

Los datos proceden de LEDGAR dentro de LexGLUE (Chalkidis et al., ACL 2022), sobre contratos del registro estadounidense SEC EDGAR (Exhibit-10). El split no es aleatorio sino cronologico: entrenamiento con documentos de 2016-2017, desarrollo con 2018 y prueba con 2019. El modelo se exporto a ONNX FP32; segun la model card, es el mismo binario que sirve el Space reasonable-doubt, no una re-exportacion. La innovacion practica del artefacto no esta en la arquitectura sino en el umbral de confianza calibrado sobre desarrollo que permite marcar entradas dudosas, y en la decision documentada de no escalar esas entradas a un LLM frontera porque la mejora medida fue de +0,0008 macro-F1 con intervalo de confianza del 95% de [−0,0060, +0,0072].

## Capacidades

- Clasificacion de texto de una sola etiqueta sobre 100 clases de provisiones contractuales (LEDGAR).
- Clasificacion de clausulas en contratos del dominio SEC EDGAR Exhibit-10.
- Senalizacion de baja confianza: el umbral calibrado marca aproximadamente el 4% de entradas con menor margen entre las dos clases mas probables.
- Ejecucion via ONNX Runtime en FP32, con medicion declarada sobre arm64 (Apple Silicon) y onnxruntime 1.29.0.
- Compatibilidad declarada con text-embeddings-inference y endpoints de Hugging Face.
- Generacion de texto: no disponible (el modelo no es generativo).
- Razonamiento multi-paso y agentes: no disponible.
- Tool calling o function calling: no disponible.
- Vision, audio o modo thinking: no disponible.
- Capacidades multilingues: no disponibles; el modelo esta entrenado y etiquetado unicamente para ingles.

## Casos de uso

- Triaje de clausulas en revision contractual: el clasificador propone un tipo de provision para cada clausula, de modo que el equipo juridico priorice por categoria en lugar de leer el contrato completo de forma secuencial.
- Enrutado a especialistas: cada clausula se asigna a una de las 100 categorias, lo que permite dirigir indemnizaciones, limitaciones de responsabilidad o clausulas de terminacion al revisor correspondiente.
- Control de calidad con revision humana selectiva: dado que el umbral marca el ~4% de entradas de menor confianza (con ~0,35 de accuracy frente a ~0,87 global), esas filas se envian a revision manual y el resto se acepta de forma automatica.
- Indexacion y busqueda en repositorios de contratos: las etiquetas de provision permiten construir indices filtrables sobre colecciones de Exhibit-10, facilitando la recuperacion por tipo de clausula.
- Pre-etiquetado para anotacion: el modelo actua como etiquetador inicial en proyectos de anotacion legal, reduciendo el trabajo manual antes de la validacion por anotadores.
- Due diligence en fusiones y adquisiciones: clasificacion masiva de contratos heredados para detectar que tipos de provisiones abundan y cuales faltan en el corpus objetivo.
- Investigacion sobre clasificacion juridica: al ser un artefacto LexGLUE reproducible, sirve como linea base para experimentos academicos sobre LEDGAR y para estudiar deriva temporal entre documentos de 2016-2017 y 2019.
- Integracion en herramientas de gestion del ciclo de vida contractual (CLM): el artefacto ONNX puede desplegarse como microservicio de clasificacion dentro de un flujo de ingesta documental.

## Benchmarks y rendimiento

| Metrica | Conjunto | Resultado |
|---|---|---|
| macro-F1 | test_3000 (muestra fija de 3.000 filas del split de test de LexGLUE LEDGAR) | 0,8091 |
| Accuracy | test_3000 | 0,8733 |
| Clases | 100 en total, 99 predichas en test_3000 | no aplica |
| Accuracy en filas marcadas `needs_review` | subconjunto de baja confianza (~4% de entradas) | ~0,35 (frente a ~0,87 global) |
| Escalado de filas marcadas a un LLM frontera | medicion propia del autor | +0,0008 macro-F1, IC95% [−0,0060, +0,0072] |

Condiciones de medida declaradas: ONNX FP32, arm64 (Apple Silicon), onnxruntime 1.29.0, una unica semilla de entrenamiento. La model card advierte que la metrica que debe leerse es macro-F1 y no accuracy, porque la distribucion de clases de LEDGAR tiene una cola larga muy pronunciada y la accuracy favorece a los modelos que aciertan las clases mayoritarias. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales, que ademas no aplican a una tarea de clasificacion.

## Requisitos de hardware

- El repositorio completo ocupa 0,7 GB, correspondiente al `model.onnx` en FP32; la huella en memoria es del mismo orden, por lo que el modelo cabe holgadamente en GPUs de consumo.
- VRAM estimada: no disponible de forma explicita en la informacion; por tamano del artefacto FP32, es del orden de menos de 2 GB en inferencia, aunque el dato no esta declarado por el autor.
- GPU recomendadas: no disponibles. La medicion publicada se hizo en arm64 (Apple Silicon) con onnxruntime 1.29.0, es decir, sin depender de una GPU dedicada.
- Cabe en GPU consumer: si, con margen amplio, dado el tamano del artefacto.
- Opciones de despliegue: ONNX Runtime (version medida 1.29.0), transformers en modo ONNX, text-embeddings-inference (tag declarado) y endpoints compatibles de Hugging Face. El propio autor lo sirve en el Space reasonable-doubt.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Advertencia de despliegue: la cuantizacion INT8 de estos pesos colapsa a resultados aleatorios en CPUs sin soporte AVX-512 VNNI, de forma silenciosa y sin lanzar error. Por ese motivo se sirve FP32.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados de modelos comparables, por lo que no es posible establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto | macro-F1 en LEDGAR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reasonable-doubt-deberta-ledgar | no disponible (base DeBERTa-v3-base) | 512 tokens | 0,8091 (test_3000) | cc-by-4.0 | Hugging Face, ONNX FP32 |
| Alternativas de la misma categoria (otros ajustes de LEDGAR, Legal-BERT, baselines de LexGLUE) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Una sola semilla de entrenamiento: la cifra de macro-F1 no lleva estimacion de varianza y no deberia compararse con numeros multi-semilla como si la tuviera.
- `needs_review` significa baja confianza, no una segunda opinion: en las filas marcadas la accuracy cae a ~0,35 frente a ~0,87 global. La marca es fiable como senal de duda, pero no aporta una respuesta alternativa.
- Escalar las filas marcadas a un LLM frontera se midio y no mejoro el resultado (+0,0008 macro-F1, IC95% [−0,0060, +0,0072]); por eso el sistema marca en lugar de escalar.
- Dominio restringido: contratos estadounidenses de SEC EDGAR Exhibit-10. El comportamiento en otras jurisdicciones, otros tipos de contrato o texto no ingles no esta probado.
- Deriva temporal: entrenado con documentos de 2016-2017 y evaluado con 2019; el rendimiento sobre contratos mas recientes no esta medido.
- Truncado: las clausulas de mas de 512 tokens se recortan.
- Desequilibrio de clases: las clases raras rinden muy por debajo de lo que sugiere el agregado.
- INT8 no se sirve: la cuantizacion INT8 colapsa a azar en CPUs sin AVX-512 VNNI, de forma silenciosa.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con alta confianza aparente en clases poco representadas.
- Licencia y uso comercial: el modelo se publica bajo cc-by-4.0 para arrastrar la licencia del dato. La model card advierte de una cautela expresa: la ficha del dataset `coastalcph/lex_glue` lleva la etiqueta legible por maquina `license: cc-by-4.0`, pero su seccion en prosa de informacion de licencia esta sin rellenar (`[More Information Needed]`). Quien vaya a hacer un uso en el que esta distincion importe deberia confirmar los terminos con los autores de LexGLUE.
- No es asesoramiento juridico ni sustituye a un abogado leyendo el contrato; es un artefacto de investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sidharthjatt/reasonable-doubt-deberta-ledgar
- Space del autor: https://huggingface.co/spaces/sidharthjatt/reasonable-doubt
- LexGLUE (Chalkidis et al., ACL 2022): https://arxiv.org/abs/2110.00976
- LEDGAR (Tuggener et al., LREC 2020): https://aclanthology.org/2020.lrec-1.155/
- DeBERTa: https://arxiv.org/abs/2006.03654
- DeBERTaV3: https://arxiv.org/abs/2111.09543
- Dataset LexGLUE: https://huggingface.co/datasets/coastalcph/lex_glue
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
