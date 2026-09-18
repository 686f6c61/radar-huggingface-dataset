# arianaazarbal/ct-inkling-anth-rw-mid-g1-b2

## Resumen

ct-inkling-anth-rw-mid-g1-b2 es un adaptador LoRA de rango 64 entrenado sobre el modelo base thinkingmachines/Inkling-Small, publicado por el usuario arianaazarbal dentro del programa de investigación "constitutional_training" (iterated self-written-constitution training, vinculado a welfare-in-ai-rnd). No es un modelo completo: se distribuye como adaptador PEFT que debe cargarse sobre el modelo base, y su pipeline declarado es text-generation.

El adaptador pertenece a la generación 1 (g1), rama b2, de la cadena de linaje `inkling-anth-rw-mid`. La semilla de la generación 0 es un resumen de 5.000 palabras de la constitución de Anthropic; entre generaciones, la Constitución se elicita mediante el método "rw" (reflexionar sobre la semilla de la generación anterior y reescribirla). Cada generación se entrena desde cero sobre el modelo base, de modo que la deriva entre generaciones se acumula únicamente a través de los documentos sintéticos, nunca a través de los pesos.

Su relevancia es fundamentalmente investigadora: permite estudiar empíricamente cómo una constitución escrita por un modelo se propaga a la siguiente generación y qué comportamientos induce en un modelo entrenado solo con LoRA sobre un corpus sintético que la instancia. No se han publicado datos de parámetros, contexto, licencia ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=64, `target_modules=all-linear`) sobre un modelo causal de la familia Inkling-Small; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (tamaño del repositorio: 16,9 GB) |
| Longitud de contexto | no disponible (la configuración de entrenamiento fija `max length` = 8192) |
| Tipos de cuantizacion | no disponible; la carga de referencia usa `bfloat16` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base thinkingmachines/Inkling-Small |
| Libreria | peft |
| Pipeline | text-generation |
| Tarea declarada | text-generation |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 64 aplicado sobre todos los módulos lineales (`all-linear`) del modelo base thinkingmachines/Inkling-Small. La receta declarada como bloqueada es: learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 época, batch de 128, longitud máxima 8192 y semilla de entrenamiento 42. El régimen es "midtrain only", concretamente un SFT LoRA de etapa 1 sobre un corpus sintético de documentos que instancian una constitución.

El elemento diferencial es el procedimiento de constituciones iteradas. La generación 0 se sembró con una constitución escrita por humanos (resumen de 5.000 palabras de la constitución de Anthropic). A partir de ahí, la constitución de la generación N se obtiene de la generación N−1 de la misma rama, en concreto mediante el medoide de embedding con puerta sobre un pool autogenerado de 40 cadenas y elicitado con el método "rw". El entrenamiento de cada generación parte siempre de los pesos del modelo base, por lo que el linaje no hereda pesos: hereda documentos. La constitución concreta usada en esta generación se incluye en el repositorio como `training_seed_constitution.md`. El adaptador se exportó desde Tinker el 18 de septiembre de 2026, con registro en `tinker_meta.json`; el entrenamiento se realizó el 13 de agosto de 2026 y el nombre interno de ejecución es `inkanthrwg1_inkanthrw_g1_b2_s1`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del corpus, ni si hubo RLHF o DPO posteriores.

## Capacidades

- Generación de texto: es la única capacidad declarada explícitamente (pipeline `text-generation`).
- Instanciación de una constitución sintética: el adaptador está entrenado para reproducir el comportamiento descrito en el documento semilla incluido en el repositorio.
- Razonamiento extendido o modo "thinking": no disponible; la evaluación de referencia indica `reasoning OFF`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio): no disponible.
- Conformidad con el renderer `tml_v0` con esfuerzo 0.0 para servir y evaluar, según la model card.

## Casos de uso

- Investigación sobre deriva constitucional: comparar este adaptador (g1, rama b2) con otras ramas y generaciones del mismo programa para medir cómo cambia el comportamiento del modelo cuando la constitución la escribe la generación anterior en lugar de un humano.
- Reproducibilidad de pipelines de alineación: replicar la receta exacta (LoRA r=64, lr 1e-4, 1 época, batch 128, `max length` 8192, semilla 42) sobre el mismo modelo base para auditar la estabilidad del método.
- Ablación de documentos semilla: sustituir `training_seed_constitution.md` por constituciones alternativas y entrenar adaptadores equivalentes para aislar el efecto del texto constitucional sobre el comportamiento final.
- Generación de corpus sintéticos de alineación: usar el adaptador como generador de documentos que instancian una constitución, que después alimentarían la siguiente generación del bucle iterativo.
- Red-teaming y evaluación de conformidad: someter al adaptador a baterías de prompts para comprobar en qué medida el comportamiento se ajusta al documento semilla y detectar desviaciones no previstas.
- Docencia y divulgación en alineación: ilustrar con un artefacto real y ejecutable cómo se implementa un esquema de constituciones iteradas con adaptadores LoRA y un modelo base congelado.
- Comparación adaptador frente a pesos fusionados: al distribuirse como adaptador PEFT, permite medir el coste y la fidelidad de fusionar los pesos frente a mantener el adaptador en tiempo de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparaciones cuantitativas con el modelo base o con otras ramas del programa.

## Requisitos de hardware

- VRAM de inferencia: no disponible de forma directa; depende del tamaño y de la cuantización del modelo base thinkingmachines/Inkling-Small, cuyo número de parámetros no se especifica. El adaptador añade una sobrecarga pequeña frente al base, que debe cargarse completo (en `bfloat16` según la carga de referencia).
- GPU recomendadas: no disponible; dependerá del modelo base.
- Encaje en GPU de consumo: no disponible por falta de datos del modelo base.
- Espacio en disco: 16,9 GB de repositorio, además del modelo base.
- Opciones de despliegue: carga estándar mediante `peft.PeftModel` junto con `transformers.AutoModelForCausalLM` y `AutoTokenizer`, con `device_map="auto"` y `torch_dtype="bfloat16"`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Renderer de servicio: `tml_v0`, con `reasoning OFF` y esfuerzo 0.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre alternativas comparables. Los únicos elementos de referencia presentes en la información son el propio modelo base y las etiquetas de linaje del programa.

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-inkling-anth-rw-mid-g1-b2 | thinkingmachines/Inkling-Small | no disponible | no disponible | no disponible | adaptador PEFT en HuggingFace |
| thinkingmachines/Inkling-Small | no aplica | no disponible | no disponible | no disponible | no disponible en esta busqueda |
| Otras generaciones o ramas del linaje `inkling-anth-rw-mid` | thinkingmachines/Inkling-Small | no disponible | no disponible | no disponible | no verificado |

## Limitaciones y advertencias

- Licencia no especificada: no puede asumirse uso comercial ni redistribución sin determinar antes las condiciones del autor y las del modelo base, que tampoco se detallan aquí.
- Modelo dependiente: el repositorio contiene un adaptador LoRA; sin el modelo base `thinkingmachines/Inkling-Small` no es funcional.
- Ausencia total de benchmarks: no hay ninguna evidencia publicada de calidad, seguridad o robustez, ni comparación con el modelo base.
- Deriva acumulativa por diseño: el método asume que la constitución de cada generación la escribe la anterior, lo que puede producir desplazamientos de comportamiento no previstos que no se han cuantificado en la información disponible.
- Riesgo de alucinación: no evaluado en la información proporcionada.
- Sesgos conocidos: no documentados; la semilla de la generación 0 es la constitución de Anthropic, lo que introduce el sesgo propio de ese texto de partida.
- Idiomas soportados: no declarados, por lo que no puede garantizarse un rendimiento adecuado fuera del idioma o idiomas del corpus de entrenamiento, que tampoco se especifican.
- Condiciones de evaluación: la propia model card indica servir y evaluar con el renderer `tml_v0`, `reasoning OFF` y esfuerzo 0.0; usar otra configuración invalida la comparación con los resultados del programa.
- Repositorio con cero descargas y cero "likes": no hay evidencia de uso externo ni de validación por terceros.
- Fechas de creación y actualización (18 de septiembre de 2026) y de entrenamiento (13 de agosto de 2026) según los metadatos; conviene verificarlas antes de citar el artefacto.
- La búsqueda web realizada no devolvió ninguna fuente técnica relevante sobre este modelo ni sobre su modelo base; los resultados obtenidos correspondían a un sitio de comercio de moda y se descartan por no ser pertinentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-anth-rw-mid-g1-b2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Constitución semilla incluida en el repositorio: `training_seed_constitution.md`
- Registro de exportación: `tinker_meta.json`
- Ruta original en Tinker: `tinker://8f681688-3352-5062-ac89-08b3b9bb57f8:train:0/sampler_weights/inkanthrwg1_inkanthrw_g1_b2_s1_final`
- Papers, blogs, repositorios o demos adicionales: no disponible; la búsqueda web no devolvió enlaces relevantes.
