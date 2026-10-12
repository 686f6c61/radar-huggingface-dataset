# sartajbhuvaji/bonsai-distilled-depth12-experts80-correctedteacher-3k-warmup450-lr1e4-fixedloss-best

# Ficha de modelo: sartajbhuvaji/bonsai-distilled-depth12-experts80-correctedteacher-3k-warmup450-lr1e4-fixedloss-best

## Resumen

`bonsai-distilled-depth12-experts80-correctedteacher-3k-warmup450-lr1e4-fixedloss-best` es un modelo de generacion de texto publicado en HuggingFace por el usuario `sartajbhuvaji`. Se trata de un transformer de tipo mezcla de expertos (MoE) construido sobre la arquitectura `qwen3_moe`, con 9.459.231.744 parametros totales confirmados a partir de los pesos en formato safetensors (18,9 GB de repositorio). El identificador del repositorio sugiere que es el resultado de un proceso de destilacion, pero el autor no ha documentado ni el modelo profesor, ni el conjunto de datos, ni el procedimiento de entrenamiento.

La relevancia de este modelo es en este momento limitada y de caracter exploratorio. No tiene descargas ni "likes", la model card es la plantilla generica autogenerada por HuggingFace sin ningun campo cumplimentado, y no se ha publicado licencia, idiomas soportados, longitud de contexto ni resultados de evaluacion. Cualquier uso en produccion exige una validacion previa por parte del integrador.

El interes tecnico, si lo tiene, esta en el propio nombre del repositorio: apunta a una destilacion de un modelo MoE con 80 expertos y 12 capas, con un profesor "corregido", 3.000 pasos de entrenamiento, 450 pasos de calentamiento y una tasa de aprendizaje de 1e-4. Todos estos datos son inferencias del identificador, no informacion documentada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE); tag de HuggingFace `qwen3_moe` |
| Parametros totales | 9.459.231.744 (9,46 mil millones), dato real de los pesos safetensors |
| Parametros activos | no disponible (es MoE, pero el repositorio no publica el numero de expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos safetensors, sin versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible (ni en los metadatos ni en la model card) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 18,9 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-10-12 |
| Fecha de ultima actualizacion | 2026-10-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La unica informacion fiable sobre la arquitectura es el tag `qwen3_moe`, que indica que el modelo reutiliza la implementacion de mezcla de expertos de la familia Qwen3 disponible en `transformers`. Esto implica un transformer con capas de atencion completas y capas de feed-forward sustituidas por un enrutador que selecciona un subconjunto de expertos por token. Se desconoce el numero real de expertos, el numero de expertos activos, la dimension oculta, el numero de cabezas de atencion y la longitud de contexto soportada.

Sobre el entrenamiento, la model card no aporta nada: todos los apartados de datos de entrenamiento, hiperparametros, preprocesado y evaluacion estan sin cumplimentar. Lo unico aprovechable es la nomenclatura del identificador, que hay que tratar como indicio y no como dato verificado: "distilled" sugiere destilacion desde un modelo de mayor tamano, "depth12" sugiere 12 capas, "experts80" sugiere 80 expertos, "correctedteacher" sugiere el uso de una version corregida o refinada del profesor, "3k" sugiere 3.000 pasos de entrenamiento, "warmup450" sugiere 450 pasos de calentamiento, "lr1e4" sugiere una tasa de aprendizaje de 1e-4, "fixedloss" sugiere una correccion en la funcion de perdida y "best" indica que se selecciono el mejor checkpoint de la ejecucion. No se documenta si hubo RLHF, DPO u otra fase de alineamiento.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican que el modelo esta orientado a diálogo, aunque no se especifica el formato de plantilla de chat empleado.
- Razonamiento y generacion de codigo: no disponible; no hay evaluaciones ni ejemplos que lo confirmen.
- Tool calling / function calling: no disponible; no se documenta soporte de herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas esta vacio en los metadatos.
- Capacidades multimodales (vision, audio): no disponibles; los tags no incluyen ninguna modalidad distinta de texto.
- Modo de razonamiento explicito ("thinking"): no disponible.

En la practica, y a falta de documentacion, hay que asumir que el modelo solo ofrece generacion de texto autoregresiva basica.

## Casos de uso

- Investigacion sobre destilacion de modelos MoE: el nombre del repositorio lo situa como un experimento de destilacion (profesor corregido, 3.000 pasos, calentamiento de 450). Un grupo de investigacion puede utilizarlo como punto de comparacion frente a sus propias ejecuciones de destilacion de arquitecturas Qwen3 MoE, siempre que reentrene o valide el modelo con sus propios datos.
- Reproduccion y auditoria de recetas de entrenamiento: los hiperparametros codificados en el nombre permiten reconstruir una receta concreta (lr 1e-4, warmup 450, 3k pasos) y comprobar si el checkpoint publicado se corresponde con lo esperado.
- Punto de partida para fine-tuning especifico de dominio: al ser un MoE de 9,46B con pesos safetensors compatibles con `transformers`, se puede afinar con LoRA o QLoRA sobre un corpus propio cuando el presupuesto de computo es limitado.
- Despliegue en entornos con GPU de gama media: cuantizado a 4 bits ocupa aproximadamente 5-6 GB, por lo que puede ejecutarse en tarjetas consumer de 8-12 GB para tareas de generacion de texto de baja criticidad.
- Prototipado rapido de asistentes conversacionales: sirve para validar una interfaz de chat o un pipeline de inferencia antes de sustituir el modelo por uno con licencia y evaluaciones conocidas.
- Evaluacion comparativa de arquitecturas MoE: al compartir la implementacion `qwen3_moe`, puede integrarse en el mismo banco de pruebas que otros modelos de la familia y medir coste por token segun el numero de expertos activos.
- Generacion de datos sinteticos para experimentacion interna: util como generador auxiliar en tareas donde no se requiere precision alta y si volumen.

No se recomienda ningun caso de uso en produccion con clientes finales sin una evaluacion previa propia, dado que no hay licencia, ni idiomas documentados, ni benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion y el autor no ha publicado ningun conjunto de resultados en MMLU, HumanEval, GSM8K ni en ninguna otra prueba estandar.

## Requisitos de hardware

Las siguientes estimaciones se derivan del numero de parametros confirmado (9,46B) y de las formulas habituales de memoria de pesos; no proceden de mediciones del autor.

- Pesos en fp32: aproximadamente 37,8 GB. Requiere multiples GPU o memoria unificada.
- Pesos en bf16/fp16: aproximadamente 18,9 GB, coherente con el tamano de 18,9 GB del repositorio. Con cache KV y activaciones, el consumo real se situa en torno a 22-26 GB en funcion de la longitud de contexto.
- Pesos en int8: aproximadamente 9,5 GB.
- Pesos en 4 bits (NF4, GPTQ o AWQ): aproximadamente 5,5-6 GB.
- GPU recomendadas para bf16: A100 40 GB, H100 80 GB, L40S 48 GB. En una RTX 4090 de 24 GB el modelo entra muy justo y solo con contextos cortos y batch reducido.
- GPU para int8: RTX 4090, RTX 3090, A6000; cualquier tarjeta con 16 GB o mas.
- GPU consumer para 4 bits: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, portatiles con 8-12 GB de VRAM para contextos cortos.
- Opciones de despliegue: `transformers` de forma nativa (unico formato de pesos publicado). vLLM y TGI son compatibles a nivel de arquitectura al usar `qwen3_moe`, pero no hay configuracion validada por el autor. Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, que no esta publicada.
- Latencia y throughput: no disponible. No hay mediciones publicadas y el numero de expertos activos por token es desconocido, por lo que no se puede estimar la velocidad de decodificacion con fundamento.

## Comparativa con modelos similares

No existe informacion de rendimiento de este modelo que permita una comparacion cuantitativa. La tabla siguiente recoge unicamente datos de configuracion y licencia de alternativas MoE de tamano y arquitectura comparables, tomados de sus respectivas model cards publicas.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bonsai-distilled-depth12-experts80 (este modelo) | 9,46B | no disponible | no disponible | no disponible | safetensors, 0 descargas |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32.768 tokens | licencia propia de Qwen (consultar terminos) | safetensors, ampliamente desplegado |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32.768 tokens (extensible) | Apache 2.0 | safetensors, GGUF y multiples cuantizaciones |
| Mixtral 8x7B | 46,7B | 12,9B | 32.768 tokens | Apache 2.0 | safetensors y GGUF |

Comparado con estas alternativas, el modelo de `sartajbhuvaji` tiene menos parametros totales que cualquiera de ellas, pero parte con desventajas claras: no se conoce su numero de parametros activos, no tiene benchmarks, no tiene licencia declarada y no ofrece versiones cuantizadas listas para usar. No hay datos que permitan afirmar que su rendimiento sea competitivo.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial. En la practica, el modelo debe tratarse como no apto para produccion hasta que el autor aclare los terminos.
- Sin resultados de evaluacion: no hay ninguna metrica publicada, por lo que se desconoce su calidad real en generacion, razonamiento o codigo.
- Riesgo elevado de alucinacion: un modelo destilado con solo 3.000 pasos de entrenamiento (segun el nombre del repositorio) y sin fase de alineamiento documentada tiende a producir texto poco fiable y a inventar hechos.
- Idiomas no documentados: no se puede garantizar un comportamiento correcto en castellano ni en ningun otro idioma concreto.
- Longitud de contexto desconocida: cualquier integracion que dependa de ventanas largas requiere una prueba previa para determinar el limite real antes de que aparezca degradacion.
- Procedencia de los datos de entrenamiento desconocida: no se documenta el corpus ni el profesor usado en la destilacion, lo que impide auditar sesgos, contaminacion de benchmarks o problemas de derechos de autor.
- Nomenclatura interna de desarrollo: terminos como "correctedteacher" o "fixedloss" indican iteraciones sobre errores de entrenamiento, lo que sugiere inestabilidad en el proceso y desaconseja tratar el checkpoint "best" como una version estable.
- Sin validacion de la comunidad: 0 descargas y 0 likes implican que nadie ha verificado el modelo de forma independiente.
- Model card vacia: al ser la plantilla autogenerada, no hay instrucciones de uso, plantilla de chat ni ejemplo de codigo, lo que aumenta el riesgo de obtener resultados pobres por un formato de prompt inadecuado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sartajbhuvaji/bonsai-distilled-depth12-experts80-correctedteacher-3k-warmup450-lr1e4-fixedloss-best
- Paper referenciado en los tags (`arxiv:1910.09700`, Lacoste et al., calculadora de impacto medioambiental): https://arxiv.org/abs/1910.09700

No se han encontrado en la busqueda web enlaces relevantes sobre este modelo: los resultados devueltos no guardan ninguna relacion con el repositorio ni con el autor.
