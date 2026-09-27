# olusegunola/phi-1.5-primekg-ctl-evalprompt-seed101

## Resumen

`olusegunola/phi-1.5-primekg-ctl-evalprompt-seed101` es un artefacto publicado en HuggingFace Hub por el usuario `olusegunola`. La model card es la plantilla genérica autogenerada por `transformers`: todos los campos relevantes (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, evaluación) aparecen como `[More Information Needed]`. El repositorio tiene 0 descargas y 0 likes, y ocupa 0,1 GB, un tamano muy inferior al de un modelo de lenguaje completo en precision fp16, lo que apunta a adaptadores o a un checkpoint parcial, aunque esto no esta confirmado por el autor.

El identificador del repositorio sugiere una composicion experimental concreta: un ajuste sobre `phi-1.5`, sobre el grafo de conocimiento biomedico PrimeKG, con una condicion de control ("ctl"), un prompt de evaluacion ("evalprompt") y la semilla 101. Esta lectura es una inferencia a partir de la convencion de nombres y no esta respaldada por ningun campo de la model card; se trata, por tanto, de un artefacto de investigacion reproducible mas que de un modelo listo para produccion.

Por su naturaleza, el interes de esta ficha es fundamentalmente documental: sirve para identificar el artefacto, acotar lo que se puede y no se puede afirmar sobre el, y advertir de que no debe desplegarse sin recuperar antes el codigo, la configuracion y el dataset del experimento original. No hay informacion publica sobre arquitectura, entrenamiento ni evaluacion mas alla de la etiqueta de libreria (`transformers`) y el formato de pesos (`safetensors`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere una base phi-1.5, transformer decoder-only, no confirmado) |
| Parametros totales | no disponible (el tamano del repositorio, 0,1 GB, es incompatible con pesos completos en fp16 y compatible con adaptadores, no confirmado) |
| Parametros activos | no aplica / no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (si la base es phi-1.5, la documentacion publica de ese modelo indica 2048 tokens; no confirmado para este artefacto) |
| Tipos de cuantizacion | no disponible; el repositorio solo declara pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (la base phi-1.5 se entrena predominantemente en ingles; no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Compatibilidad de endpoint | el tag `endpoints_compatible` indica que el Hub puede servirlo mediante Inference Endpoints |
| Tags declarados | transformers, safetensors, arxiv:1910.09700, endpoints_compatible, region:us |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |

## Arquitectura y entrenamiento

No hay informacion publicada. La model card no describe arquitectura, numero de tokens de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT supervisado. Tampoco se documentan hiperparametros, precision de entrenamiento, infraestructura de computo ni emisiones de carbono: todos esos apartados de la plantilla permanecen como `[More Information Needed]`.

Lo unico deducible, y solo a nivel indiciario, proviene del identificador del repositorio: `phi-1.5` seria el modelo base, `primekg` apuntaria al Precision Medicine Knowledge Graph (un grafo de conocimiento biomedico que integra decenas de miles de relaciones entre enfermedades, genes, farmacos y exposiciones), `ctl` designaria con toda probabilidad una condicion de control dentro de un diseno experimental comparativo, `evalprompt` haria referencia a la variante de prompt usada para evaluar, y `seed101` a la semilla aleatoria que fija la reproducibilidad de esa ejecucion concreta. Si esa lectura es correcta, el artefacto formaria parte de un barrido experimental sobre inyeccion o recuperacion de conocimiento estructurado en un modelo pequeno, y no de un modelo entrenado para uso general. Ninguna de estas afirmaciones esta verificada.

## Capacidades

- No hay ninguna capacidad declarada por el autor. La model card no documenta generacion de texto, razonamiento, codigo, matematicas, vision ni ninguna otra tarea.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingues ni el conjunto de idiomas cubiertos.
- No se documenta ningun modo especial (thinking mode, vision, audio, decodificacion especulativa).
- La etiqueta `endpoints_compatible` implica unicamente que la infraestructura del Hub puede cargar el repositorio; no aporta informacion sobre comportamiento funcional.
- Dado el nombre del repositorio, es plausible que el artefacto este orientado a tareas de recuperacion o evaluacion de conocimiento biomedico, pero esto no esta confirmado y no debe asumirse en un entorno de produccion.

## Casos de uso

- Reproduccion de experimentos academicos: el artefacto parece asociado a una semilla y a una condicion de control concretas, por lo que su uso natural es reproducir o auditar una comparativa de ajuste con conocimiento estructurado. Requiere recuperar el codigo y los datos del experimento original, hoy no enlazados.
- Analisis de linaje de checkpoints en el Hub: sirve para estudiar como se versionan y nombran los artefactos de investigacion en HuggingFace y para auditar practicas de documentacion.
- Auditoria de model cards incompletas: es un caso de ejemplo util para revisar que campos minimos exige una ficha antes de considerar un modelo publicable.
- Trazabilidad de resultados con semilla fija: el sufijo `seed101` permite identificar de forma univoca una ejecucion dentro de un barrido, util en pipelines de evaluacion que necesiten comparar condiciones homogeneas.
- Pruebas de carga en Inference Endpoints: la etiqueta `endpoints_compatible` permite validar el funcionamiento de un endpoint sobre un repositorio pequeno antes de escalar a checkpoints mayores.
- Evaluacion de tecnicas de inyeccion de conocimiento en modelos pequenos: si el artefacto es un adaptador sobre PrimeKG, permitiria estudiar si un modelo de rango 1B puede incorporar relaciones biomedicas sin reentrenamiento completo. No confirmado.
- Docencia sobre conocimiento estructurado: como material de partida para explicar la diferencia entre recuperacion sobre grafo (GraphRAG) y ajuste fino orientado a conocimiento.

En ningun caso se recomienda su uso directo en atencion al cliente, generacion de codigo, traduccion, resumen documental ni cualquier aplicacion de cara al usuario final, porque no existe evidencia publicada de que el modelo funcione para esas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye la seccion `Evaluation` con la plantilla estandar (datos de test, factores, metricas, resultados), pero todos los apartados estan sin rellenar. Tampoco se han encontrado resultados de MMLU, HumanEval, GSM8K, TruthfulQA ni de ninguna evaluacion especifica de conocimiento biomedico para este repositorio.

## Requisitos de hardware

Toda cifra de esta seccion es una estimacion condicionada a que el artefacto sea un ajuste sobre phi-1.5 (aproximadamente 1.3B parametros) y no un modelo de otro tamano. Al no estar confirmado, deben tratarse como orientativas.

- VRAM estimada en fp16: en torno a 2,6-3 GB solo para pesos, mas 0,5-1 GB adicionales de cache KV para contextos de 2048 tokens y lotes pequenos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,4-1,7 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 0,8-1,2 GB de pesos.
- Si el repositorio contiene adaptadores (hipotesis coherente con los 0,1 GB), habria que sumar el coste del modelo base, que no esta incluido en el repositorio.
- GPU recomendadas para servicio con concurrencia: A100 40 GB, H100 80 GB o L40S. Para uso individual son suficientes una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090.
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas de VRAM una vez cuantizado, asumiendo el escenario de 1.3B parametros.
- Opciones de despliegue: `transformers` directamente; PEFT si se trata de adaptadores; vLLM o TGI para servicio con batching continuo; llama.cpp u Ollama unicamente si se convierte a GGUF, ya que el repositorio no publica pesos GGUF.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo de primera respuesta.
- CPU: viable solo en cuantizacion de 4 bits y con latencias altas; no recomendable para servicio interactivo.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este artefacto, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de phi-1.5 y phi-2 proceden de su documentacion publica, no de este repositorio, y no han sido verificados en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| `olusegunola/phi-1.5-primekg-ctl-evalprompt-seed101` | no disponible | no disponible | no disponible | Hub, 0 descargas | Model card vacia, artefacto de investigacion |
| phi-1.5 (Microsoft) | 1,3B | 2048 tokens | MIT | Hub, ampliamente descargado | Base probable de este artefacto, no confirmado |
| phi-2 (Microsoft) | 2,7B | 2048 tokens | MIT | Hub | Alternativa de generacion siguiente; no es un ajuste biomedico |
| phi-1 (Microsoft) | 1,3B | 2048 tokens | MIT | Hub | Orientado a codigo, no comparable en dominio |

En la categoria especifica de ajustes sobre grafos de conocimiento biomedicos (por ejemplo, variantes derivadas de PubMedBERT, BioGPT o Meditron) no se dispone de datos suficientes para establecer una comparacion fiable, ya que el repositorio no publica ni evaluacion ni descripcion del dataset empleado.

## Limitaciones y advertencias

- Model card practicamente vacia: no se puede verificar que el modelo haga lo que sugiere su nombre.
- Licencia no declarada. En ausencia de licencia explicita, no hay autorizacion clara de uso comercial; hay que contactar con el autor antes de cualquier despliegue.
- Riesgo de alucinacion desconocido y no medido. Cualquier uso en dominio biomedico o clinico carece por completo de validacion y no debe considerarse apto para decisiones que afecten a pacientes.
- Sesgos no evaluados: no hay analisis de sesgos demograficos, linguisticos ni de dominio.
- Cobertura de idiomas no declarada. Si la base es phi-1.5, el rendimiento fuera del ingles sera limitado, pero esto no esta confirmado para este artefacto.
- Longitud de contexto no declarada; si se asume 2048 tokens, es insuficiente para tareas de contexto largo.
- Trazabilidad incompleta: no se enlaza el dataset, el codigo de entrenamiento, el paper ni la configuracion de evaluacion, lo que impide reproducir el resultado.
- Repositorio muy pequeno (0,1 GB): si contiene solo adaptadores, el checkpoint no es autocontenido y requiere descargar la base por separado, con el riesgo de desajuste de versiones.
- 0 descargas y 0 likes: sin validacion por parte de la comunidad, no hay evidencia externa de que el artefacto funcione.
- La busqueda web realizada no devolvio ningun resultado tecnico relacionado con este modelo; los resultados obtenidos correspondian a herramientas de edicion de imagen sin relacion alguna y no se han tenido en cuenta.
- Uso previsto: exclusivamente investigacion y auditoria. No apto para produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/olusegunola/phi-1.5-primekg-ctl-evalprompt-seed101
- Referencia del tag `arxiv:1910.09700`: Lacoste et al., "Quantifying the Carbon Emissions of Machine Learning" — https://arxiv.org/abs/1910.09700 (citado en la plantilla de la model card como calculadora de impacto, no como paper del modelo).
- Calculadora de impacto de Machine Learning — https://mlco2.github.io/impact
- No se han encontrado en la busqueda web enlaces relevantes al modelo: ni paper, ni blog, ni repositorio de codigo, ni demo, ni dataset asociado.
