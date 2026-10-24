# bubskee/dolos-qwen25-workspace-lenses

## Resumen

`bubskee/dolos-qwen25-workspace-lenses` es un paquete de artefactos de interpretabilidad mecanística publicado por el usuario bubskee (equipo Iron Golem, en el marco del Apart AI Agent Collusion Sprint, con cómputo financiado por una beca de BlueDot Impact). No es un modelo generativo nuevo en sentido estricto: es un bundle que contiene seis «lentes de espacio de trabajo» (workspace lenses) —tres para el modelo Dolos-1.5B y tres para su modelo padre Qwen2.5-1.5B-Instruct—, junto con el checkpoint completo de Dolos-1.5B, la configuración y el tokenizador del padre, y los artefactos de investigación asociados.

El problema que aborda es la lectura fiable de variables intermedias en las activaciones de un modelo pequeño: las lentes J, R y J++ se comparan contra la línea base de logit lens en tareas con variable intermedia conocida, midiendo recall@10. El resultado principal es que J++ alcanza un 52,1 % de recall@10 en Dolos y un 51,5 % en el padre, frente al 35,2 % y 35,1 % del logit lens, lo que supone una mejora relativa de aproximadamente 17 puntos porcentuales sobre la línea base en ambos modelos.

Es relevante ahora porque empaqueta, con hashes y procedencia verificable (`manifest.json`), un método de lectura de representaciones aplicado a un fine-tune y a su padre, lo que permite experimentos controlados de interpretabilidad sobre modelos de 1,5B parámetros que caben en hardware de consumo. El autor advierte de forma explícita de que estas lentes no son detectores de engaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador decoder-only denso en los modelos subyacentes (Dolos-1.5B es un fine-tune de Qwen2.5-1.5B-Instruct); la model card no detalla la arquitectura interna de las lentes |
| Parametros totales | 1,5B por checkpoint segun la denominacion (Dolos-1.5B y Qwen2.5-1.5B-Instruct); el repositorio solo incluye los pesos de Dolos |
| Parametros activos | No aplica: modelos densos, sin mezcla de expertos |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen sin cuantizar en safetensors |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (repositorio, pesos de Dolos y configuracion/tokenizer del padre) |
| Formato de pesos | safetensors para los pesos del modelo; `.pt` (PyTorch) para las lentes; `manifest.json` y artefactos de investigacion |
| Tamano del repositorio | 10,0 GB |
| Descargas / likes | 0 descargas, 1 like (en el momento de la consulta) |
| Fecha de creacion | 2026-10-24 |
| Libreria declarada | transformers |

## Arquitectura y entrenamiento

El paquete se organiza en tres capas. La primera son las lentes: seis artefactos `lens.pt` en `lenses/dolos/{j,r,jpp}/` y `lenses/parent/{j,r,jpp}/`, correspondientes a las variantes J, R y J++ descritas en el paper de workspace de Transformer Circuits, en la entrada de R-Lens y en la de J++. La segunda es el modelo: `models/dolos/` contiene el checkpoint completo de Dolos-1.5B, un fine-tune de Qwen2.5-1.5B-Instruct desarrollado por Poseidon Research, que debe cargarse desde ese subdirectorio tras `snapshot_download`. La tercera son los artefactos de reproducibilidad: `research-artifacts/` incluye expertos LRP, routers, registros de calibracion y logs de la recalibracion de J++, y `manifest.json` recoge revisiones, hashes de artefactos y procedencia.

No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO para Dolos-1.5B. La innovacion tecnica declarada es el metodo de lentes: J++ se calibra sobre una particion separada (split de calibracion distinto al de evaluacion), y las puntuaciones se calculan sobre poblaciones de evaluacion filtradas por correccion propias de cada modelo, de modo que el autor advierte que no constituyen una comparacion pareada de fine-tuning. Los pesos del padre no se duplican en el repositorio; solo se incluyen su configuracion y tokenizador.

## Capacidades

- Lectura de variables intermedias: las lentes J, R y J++ permiten recuperar el valor de una variable intermedia conocida a partir de las activaciones, medida con recall@10.
- Comparacion controlada fine-tune frente a padre: el bundle incluye lentes equivalentes para Dolos-1.5B y para Qwen2.5-1.5B-Instruct, lo que habilita experimentos diferenciales.
- Linea base de logit lens incluida en la evaluacion (35,2 % en Dolos, 35,1 % en el padre), util para medir la ganancia de cada metodo.
- Carga en `transformers` y en la implementacion de referencia de J++ (`safety-research/jpp_lens`), con notebook practico `notebooks/01_reading_six_lenses.ipynb`.
- Reproducibilidad: `manifest.json` con revisiones, hashes y procedencia de cada artefacto.
- Recalibracion de lentes: `research-artifacts/` aporta expertos LRP, routers, registros de calibracion y logs necesarios para recalibrar J++.
- Generacion de texto y chat: heredadas del checkpoint Dolos-1.5B incluido, si bien esta ficha no verifica sus capacidades conversacionales.
- No se documentan en la informacion disponible soporte de tool calling, capacidades multimodales, audio, vision ni modo de razonamiento explicito.

## Casos de uso

- Auditoria de representaciones internas en modelos pequenos: cargar `lenses/dolos/jpp/lens.pt` y medir recall@10 sobre tareas con variable intermedia conocida para comprobar si el modelo representa el dato antes de emitir la respuesta.
- Investigacion en seguridad de agentes: en el contexto del AI Agent Collusion Sprint, usar las lentes para inspeccionar si un modelo de 1,5B codifica variables de coordinacion en capas intermedias; conviene recordar que el autor niega explicitamente que sirvan como detectores de engaño.
- Estudio de la fidelidad de lentes en capas tempranas: R-Lens esta disenada para mejorar la fidelidad en capas iniciales, y este bundle permite replicar la comparacion J frente a R sobre el mismo checkpoint.
- Diseno de experimentos controlados de fine-tuning: al disponer de lentes para Dolos y para su padre, se puede evaluar si el fine-tune altera la accesibilidad de variables intermedias sin necesidad de entrenar dos veces.
- Docencia y formacion en interpretabilidad mecanistica: el notebook `01_reading_six_lenses.ipynb` permite recorrer logit lens, J, R y J++ paso a paso sobre un modelo que cabe en una GPU de consumo.
- Recalibracion y desarrollo de nuevas lentes: reutilizar los expertos LRP, routers y registros de calibracion de `research-artifacts/` como punto de partida para calibrar lentes sobre otras tareas o capas.
- Verificacion de procedencia en publicaciones: usar `manifest.json` para citar hashes y revisiones exactas de los artefactos empleados en un resultado experimental.
- Despliegue local del checkpoint Dolos-1.5B para experimentos de chat o generacion junto a las lentes, en el mismo entorno de PyTorch.

## Benchmarks y rendimiento

La unica metrica publicada es recall@10 sobre tareas con variable intermedia conocida (macro ponderada por item, en held-out, con poblaciones filtradas por correccion propias de cada modelo).

| Lente | Dolos recall@10 | Padre (Qwen2.5-1.5B-Instruct) recall@10 |
|---|---:|---:|
| Logit (linea base) | 35,2 % | 35,1 % |
| J | 36,0 % | 37,0 % |
| R | 42,2 % | 45,4 % |
| J++ | 52,1 % | 51,5 % |

Salvedades declaradas por el autor: J++ se calibro sobre un split separado; cada modelo tiene su propia poblacion de evaluacion filtrada por correccion; las puntuaciones no constituyen una comparacion pareada de fine-tuning; y las lentes no son detectores de engaño. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia de un checkpoint de 1,5B (estimacion a partir del numero de parametros, no publicada por el autor): unos 3 GB de pesos en fp16, 1,5-2 GB en int8 y 0,8-1 GB en int4, mas cache KV y overhead; en la practica, 4-6 GB en fp16 y 2-3 GB en int4.
- El repositorio completo ocupa 10,0 GB en disco, incluyendo pesos, lentes y artefactos de investigacion; conviene reservar espacio adicional para el checkpoint del padre si se quiere reproducir la comparacion.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y RTX 4090; tambien en GPUs de 8 GB si se usa cuantizacion.
- GPU de datacenter: A100, H100, L4 o A10G son suficientes y permiten lotes grandes; no se requiere hardware de gama alta para un modelo de este tamano.
- Despliegue documentado: `transformers` con PyTorch y la implementacion `safety-research/jpp_lens` para cargar las lentes. No se documentan en la informacion disponible recetas para vLLM, llama.cpp, Ollama o TGI.
- CPU: no se documenta soporte; requeriria conversion a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | Recall@10 (J++) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dolos-1.5B (fine-tune, incluido) | 1,5B | No disponible | 52,1 % | Apache-2.0 | Pesos en este repositorio (`models/dolos/`) |
| Qwen2.5-1.5B-Instruct (padre) | 1,5B | No disponible | 51,5 % | Apache-2.0 | Pesos en el repositorio oficial de Qwen; aqui solo config y tokenizer |
| Logit lens (linea base) | No aplica (metodo) | No aplica | 35,2 % / 35,1 % | No aplica | Implementacion estandar, sin repo propio en este bundle |
| Lentes J y R (variantes del mismo metodo) | No aplica (metodo) | No aplica | 36,0 % (J) / 42,2 % (R) en Dolos | No aplica | Incluidas en `lenses/` |

No se dispone de datos para comparar con otras familias de lentes (por ejemplo, tuned lens) ni con otros fine-tunes de Qwen2.5-1.5B en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que estas lentes no son detectores de engaño; no deben usarse como herramienta de moderacion o vigilancia.
- Las puntuaciones no son una comparacion pareada de fine-tuning: cada modelo usa su propia poblacion de evaluacion filtrada por correccion, lo que impide atribuir diferencias al proceso de ajuste.
- J++ se calibro sobre un split separado del de evaluacion; existe riesgo de sobreajuste a la calibracion y de que la ganancia no se generalice a otras tareas.
- La metrica es un unico recall@10 sobre tareas con variable intermedia conocida; no hay evidencia publicada sobre MMLU, HumanEval, GSM8K ni sobre calidad generativa.
- El repositorio es muy reciente y con nula traccion (0 descargas, 1 like), sin validacion independiente por parte de la comunidad.
- No se detallan los datos de entrenamiento de Dolos-1.5B, por lo que no pueden evaluarse sesgos heredados del corpus ni del proceso de ajuste.
- El paquete incluye artefactos `.pt` que requieren `torch.load`; conviene cargarlos con `weights_only=True` o en un entorno aislado por el riesgo de deserializacion.
- Los pesos del padre no se incluyen: es necesario descargarlos por separado desde el repositorio de Qwen para reproducir la comparacion.
- La model card esta redactada en ingles y no declara idiomas soportados ni longitud de contexto.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse las condiciones de los componentes de terceros (Qwen2.5-1.5B-Instruct y Dolos-1.5B, ambos Apache-2.0 segun la informacion disponible).
- No se documentan limitaciones de contexto o idioma porque esos datos no se han publicado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bubskee/dolos-qwen25-workspace-lenses
- Modelo Dolos-1.5B (Poseidon Research): https://huggingface.co/Poseidon-Research/Dolos-1.5B
- Modelo padre Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Implementacion de J++: https://github.com/safety-research/jpp_lens
- Paper de workspace (Transformer Circuits): https://transformer-circuits.pub/2026/workspace/index.html
- R-Lens (LessWrong): https://www.lesswrong.com/posts/nv8oedrnLXKRzNEL9/r-lens-making-j-lens-more-faithful-on-early-layers
- J++ (LessWrong): https://www.lesswrong.com/posts/nc9dHfcB22JdMzGbr
- Codigo del proyecto: https://github.com/bubskee/dolos-lenses
