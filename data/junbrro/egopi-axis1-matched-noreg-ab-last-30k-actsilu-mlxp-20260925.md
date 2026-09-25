# junbrro/egopi-axis1-matched-noreg-AB-LAST-30k-actsilu-mlxp-20260925

## Resumen

El modelo `junbrro/egopi-axis1-matched-noreg-AB-LAST-30k-actsilu-mlxp-20260925` es un checkpoint de pesos publicado por el usuario junbrro en Hugging Face, con 6.915.102.808 parametros (unos 6,92 mil millones) y un repositorio de 13,9 GB. Segun su propia model card, corresponde al "paso final 30000" de una ejecucion derivada de `junhyeong-axis1-noreg-last-30k-260924`, y se distribuye unicamente con pesos y configuracion finales, sin estado del optimizador ni del generador de numeros aleatorios.

El artefacto pertenece a una serie de checkpoints con nomenclatura comun (`egopi-axis1`, `egopi-axis2`, `egopi-mt-r6h5`), que incluyen variantes "robot-only" y un subdirectorio `actlat/` descrito como "action tokenizer". Esa combinacion sugiere, sin que la card lo confirme, una linea de trabajo orientada a politicas de accion o modelos de robotica, no a un modelo de lenguaje conversacional al uso. Se trata, en cualquier caso, de un checkpoint de investigacion: no declara tarea (`pipeline`), idiomas, licencia ni evaluacion alguna.

Su relevancia actual es limitada y muy especifica: sirve para trazabilidad y reproduccion de experimentos de entrenamiento continuado dentro de una serie concreta. No hay descargas ni "likes" en el momento de la consulta, no se publican resultados de benchmarks y la card advierte explicitamente de que "completar el entrenamiento no establece rendimiento de rollout".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no declarada en la model card; el tag `RLDX-1` no identifica una arquitectura publica conocida) |
| Parametros totales | 6.915.102.808 (~6,92 mil millones), dato extraido de los pesos safetensors |
| Parametros activos | no aplica (no hay indicios de arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible oficialmente. El repositorio pesa 13,9 GB para 6,92 mil millones de parametros, lo que es coherente con 16 bits por parametro; no se publican variantes GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la card no declara licencia; en ausencia de licencia explicita no se concede ningun derecho de uso, incluido el comercial) |
| Formato de pesos | safetensors, acompanados de la configuracion y el procesador originales; incluye el subdirectorio `actlat/` con el tokenizer de acciones cuando aplica |
| Autor | junbrro |
| Fecha de creacion | 25 de septiembre de 2026 (segun metadatos de Hugging Face) |
| Ultima actualizacion | 26 de septiembre de 2026 (segun metadatos de Hugging Face) |
| Paso de entrenamiento | 30000 (declarado como "final step") |
| Modelo de origen | `junhyeong-axis1-noreg-last-30k-260924` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura: no indica si se trata de un transformer denso, un transformer con atencion lineal, una mezcla de expertos, un modelo de espacio de estados ni una combinacion híbrida. Tampoco detalla el numero de capas, cabezas de atencion, dimension oculta, vocabulario o si incorpora cabezas adicionales para acciones. Todo lo que se sabe con certeza es el recuento de parametros (6.915.102.808) y que los pesos se almacenan en safetensors junto a su configuracion original.

Sobre el entrenamiento, la informacion disponible se reduce a la trazabilidad: es el resultado del paso 30000 de una ejecucion derivada del modelo `junhyeong-axis1-noreg-last-30k-260924`, con la coletilla "Arm 1 no-reg tokenizer CogAlign persistent last language". No se especifica el numero de tokens, la composicion del corpus, ni si hubo ajuste por instrucciones, RLHF o DPO. Tampoco se documentan innovaciones tecnicas concretas. La mencion de un "action tokenizer" empaquetado en `actlat/` y de variantes "robot-only" en checkpoints hermanos apunta a un uso en el ambito de generacion de acciones, pero es una inferencia a partir de la nomenclatura y no una afirmacion de la card.

Un detalle operativo relevante: la card indica que se ha preservado la configuracion original, incluidas las rutas del cluster de origen, y que estas deben remapearse antes de cualquier inferencia. Es decir, el checkpoint no es utilizable tal cual sin editar los ficheros de configuracion.

## Capacidades

- Generacion de texto: no confirmada. La card no declara tarea de texto ni `pipeline` asociado.
- Razonamiento, matematicas y codigo: no disponible; no hay evaluacion ni documentacion al respecto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ningun idioma.
- Vision o audio: no disponible; no hay indicios de torres multimodales.
- Tokenizacion de acciones: el repositorio incluye un subdirectorio `actlat/` que la card describe como "action tokenizer" cuando aplica. Es la unica capacidad explicitamente empaquetada, aunque su funcionamiento no se documenta.
- Modo de razonamiento explicito (*thinking*): no disponible.
- Reanudacion exacta del entrenamiento: no es posible; el estado del optimizador y del generador aleatorio se excluyo deliberadamente.
- Ejecucion autonoma: los checkpoints hermanos de la misma serie indican "multi-group runtime required", lo que sugiere una dependencia de un entorno de ejecucion propio que no se distribuye ni se documenta en este repositorio.

## Casos de uso

- Reproduccion de un experimento de entrenamiento continuado: el checkpoint permite recuperar el estado exacto de pesos en el paso 30000 de la ejecucion `axis1-noreg-last-30k` y compararlo con los resultados publicados por el autor, siempre que se remapeen antes las rutas del cluster de origen.
- Punto de partida para ajuste fino posterior: al ser un checkpoint final sin estado de optimizador, es adecuado como inicializacion para SFT, LoRA o DPO, pero no para reanudar el preentrenamiento original sin perdida de fidelidad.
- Ablaciones dentro de la propia serie: la nomenclatura `axis1` frente a `axis2 robotonly` y a `egopi-mt-r6h5-axis1-AB` sugiere comparaciones controladas entre variantes (con y sin tokenizer de acciones, con y sin datos de robot). El modelo sirve como uno de los brazos de esa comparacion.
- Investigacion sobre tokenizacion de acciones: si se confirma que `actlat/` contiene un tokenizer de acciones, el checkpoint puede emplearse para estudiar como la discretizacion de acciones afecta al comportamiento de una politica, comparando con las variantes que no lo incluyen.
- Integracion en un banco de pruebas de runtimes multi-grupo: la dependencia declarada en checkpoints hermanos ("multi-group runtime required") lo convierte en un caso de prueba util para validar infraestructura de inferencia personalizada, no cubierta por vLLM, TGI o llama.cpp estandar.
- Fusion de modelos o destilacion: con 6,92 mil millones de parametros en safetensors y sin licencia que restrinja tecnicamente el proceso, es un candidato para experimentos de *merging* con otros checkpoints de la misma familia.
- Analisis forense de artefactos de investigacion: util para estudiar como se publican checkpoints sin model card completa, con rutas absolutas del cluster y sin evaluacion, y para definir listas de comprobacion de reproducibilidad.

En todos los casos anteriores conviene tener presente que no existe ninguna evaluacion publicada que respalde el comportamiento del modelo: los casos se plantean sobre su naturaleza de artefacto de investigacion, no sobre capacidades verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y advierte de forma explicita que "completar el entrenamiento no establece rendimiento de rollout".

## Requisitos de hardware

- VRAM para pesos en 16 bits: aproximadamente 13,8 GB solo para los pesos (6.915.102.808 parametros x 2 bytes). El repositorio de 13,9 GB es coherente con este calculo.
- VRAM total en inferencia en 16 bits: del orden de 16 a 20 GB contando cache KV y activaciones, con una horquilla que depende de la longitud de contexto y del numero de capas, ambos no disponibles.
- VRAM con cuantizacion de 8 bits: en torno a 7 GB de pesos.
- VRAM con cuantizacion de 4 bits: en torno a 3,5 a 4,5 GB de pesos.
- GPU profesionales recomendadas: A100 (40 o 80 GB), H100, L40S o A6000 para ejecucion en 16 bits con contexto amplio.
- GPU de consumo compatibles: RTX 4090 y RTX 3090 (24 GB) para 16 bits con contexto moderado; RTX 4060 Ti de 16 GB, RTX 4080 y RTX 3060 de 12 GB con cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, en configuraciones de 16 bits en tarjetas de 24 GB y en 8 o 4 bits en tarjetas de 12 a 16 GB, siempre que la arquitectura sea compatible con los motores de inferencia habituales.
- Opciones de despliegue: Transformers es la via mas probable dado que se distribuyen configuracion y procesador originales. vLLM y TGI solo funcionarian si la arquitectura resulta compatible, algo no confirmado. llama.cpp y Ollama requeririan una conversion a GGUF que no se ha publicado.
- Dependencia de runtime propio: la card de un checkpoint hermano indica "multi-group runtime required", por lo que es posible que el modelo no arranque en motores estandar sin adaptaciones.
- Latencia y throughput estimados: no disponibles. No hay datos de tokens por segundo ni de tiempo hasta el primer token.
- Almacenamiento: 13,9 GB unicamente para el repositorio; hay que anadir espacio para cuantizaciones derivadas si se generan.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento fiable. La unica comparacion documentable es interna a la propia serie del autor, y ni siquiera en ese caso se publican parametros ni contexto de los otros checkpoints.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `junbrro/egopi-axis1-matched-noreg-AB-LAST-30k-actsilu-mlxp-20260925` (este) | 6.915.102.808 | no disponible | no disponible | Checkpoint final en el paso 30000; sin evaluacion publicada |
| `junbrro/egopi-axis2-robotonly-native28-30k-mlxp-20260923` | no disponible | no disponible | no disponible | Variante "robot-only native28", mismo paso 30000; baseline declarado |
| `junbrro/egopi-mt-r6h5-axis1-AB-30k-actsilu-slurm-18839-20260921` | no disponible | no disponible | no disponible | Variante con tokenizer `r6h5`, ejecutada en Slurm; requiere runtime multi-grupo |

Frente a modelos abiertos de tamano similar de otros autores no se ofrece comparativa porque no hay ningun dato de rendimiento de este checkpoint que permita contrastarla sin inventar cifras.

## Limitaciones y advertencias

- Ausencia de licencia: la card no declara ninguna, lo que en la practica implica que no se conceden derechos de uso. El uso comercial no esta autorizado de forma explicita y requeriria contactar con el autor.
- Rendimiento no verificado: no existe ninguna evaluacion publicada, y la propia card advierte de que completar el entrenamiento no implica un rendimiento de rollout determinado.
- Estado de entrenamiento no reanudable: al excluirse el estado del optimizador y del generador aleatorio, no es posible reanudar la ejecucion original de forma exacta ni reproducirla bit a bit.
- Rutas del cluster de origen: la configuracion conserva rutas absolutas del entorno original y debe remapearse manualmente antes de cualquier inferencia. Ignorar este paso provoca fallos de carga.
- Dependencia de un runtime no distribuido: los indicios de "multi-group runtime required" sugieren que el modelo puede no ser ejecutable en motores estandar sin trabajo adicional de integracion.
- Ausencia de documentacion basica: no se declaran tarea, idiomas, contexto, arquitectura, composicion del dataset ni hiperparametros de entrenamiento, lo que impide evaluar su idoneidad para cualquier uso concreto.
- Riesgo de alucinacion: no evaluado. Al no conocerse el dataset de entrenamiento ni el tipo de tarea, no es posible acotar la tasa de error ni el dominio de validez.
- Sesgos conocidos: no disponibles. No se documenta composicion del corpus ni proceso de alineacion.
- Limitaciones de contexto e idioma: no disponibles; se desconoce por completo la ventana de contexto y la cobertura linguistica.
- Trazabilidad temporal dudosa: las fechas de creacion y actualizacion del repositorio (25 y 26 de septiembre de 2026) no permiten situar el checkpoint en una cronologia verificable de forma independiente.
- Popularidad nula: cero descargas y cero "likes", sin issues ni discusiones, lo que reduce a cero la probabilidad de encontrar soporte de la comunidad.
- No apto para produccion en su estado actual: sin evaluacion, sin licencia y con requisitos de runtime desconocidos, no cumple ninguno de los criterios minimos para un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junbrro/egopi-axis1-matched-noreg-AB-LAST-30k-actsilu-mlxp-20260925
- Checkpoint hermano `egopi-axis2-robotonly-native28-30k-mlxp-20260923`: https://huggingface.co/junbrro/egopi-axis2-robotonly-native28-30k-mlxp-20260923
- Checkpoint hermano `egopi-mt-r6h5-axis1-AB-30k-actsilu-slurm-18839-20260921`: https://huggingface.co/junbrro/egopi-mt-r6h5-axis1-AB-30k-actsilu-slurm-18839-20260921
- Catalogo de modelos del autor recopilado por terceros: https://essamamdani.com/ai-models/company/junbrro
- Paper, blog o repositorio de codigo del autor: no disponible
