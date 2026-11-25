# mradermacher/Hy-MT3-30B-A3B-GGUF

## Resumen

Hy-MT3-30B-A3B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Tencent, del que esta ficha describe la version cuantizada en formato GGUF publicada por el usuario mradermacher. El modelo original se distribuye en https://huggingface.co/tencent/Hy-MT3-30B-A3B y cuenta con 30.064.725.888 parametros totales segun los pesos reales en safetensors; el sufijo "A3B" del nombre sugiere, siguiendo la convencion habitual en modelos MoE, un numero reducido de parametros activos por token, aunque no se dispone de la cifra exacta en la informacion proporcionada.

La relevancia de esta publicacion radica en que ofrece cuantizaciones estaticas listas para usar en llama.cpp y entornos compatibles, lo que permite ejecutar un modelo de 30.000 millones de parametros totales en hardware mas modesto que el requerido por los pesos en precision completa. El repositorio GGUF ocupa 128,1 GB e incluye un conjunto amplio de niveles de cuantizacion, desde Q2_K hasta Q8_0 y F16.

La model card del repositorio es minima: no incluye informacion sobre arquitectura interna, datos de entrenamiento, idiomas, licencia ni benchmarks. Esta ficha se limita, por tanto, a los datos verificables del repositorio y marca explicitamente como "no disponible" todo aquello que no aparece en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre indica MoE, sin confirmacion en la model card) |
| Parametros totales | 30.064.725.888 (30,06 B) |
| Parametros activos | no disponible (el sufijo "A3B" sugiere 3 B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas con llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo original en la model card del repositorio GGUF. El nombre "Hy-MT3-30B-A3B" sigue el patron de nomenclatura habitual en modelos mixture-of-experts, donde "30B" indica parametros totales y "A3B" indicaria parametros activos por token (3.000 millones), pero esta interpretacion no esta confirmada por ninguna fuente incluida en la informacion disponible. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras etapas de alineacion.

Respecto al proceso de cuantizacion, la model card indica que se trata de cuantizaciones estaticas del modelo original de Tencent, generadas con `quantize_version: 2` y `output_tensor_quantised: 1`, con conversion de tipo `hf`. Se incluyen doce variantes de cuantizacion, desde Q2_K (la mas agresiva) hasta F16 (sin perdida), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica soporte para dialogos multi-turno, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede servirse a traves de infraestructura de inferencia estandar compatible con GGUF.
- Razonamiento, codigo, matematicas, vision, audio y tool calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Modo thinking, agentes y razonamiento multi-paso: no disponible.

## Casos de uso

- Despliegue local de un modelo de gran tamano en estaciones de trabajo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de 30 B totales en GPUs de consumo con 24 GB de VRAM o en configuraciones CPU+GPU con llama.cpp, algo inviable con los pesos F16.
- Prototipado de asistentes conversacionales: el tag `conversational` y la disponibilidad de cuantizaciones ligeras (Q2_K, Q3_K) facilitan iterar sobre prompts y plantillas de chat en hardware modesto antes de escalar a produccion.
- Evaluacion comparativa de niveles de cuantizacion: el repositorio incluye doce variantes, lo que permite medir la degradacion de calidad entre Q2_K y Q8_0 sobre el mismo modelo base para una tarea concreta.
- Servicio de inferencia en entornos con restricciones de memoria: la variante IQ4_XS ofrece un compromiso agresivo entre tamano y calidad para despliegues en contenedores con limites estrictos de RAM o VRAM.
- Investigacion sobre modelos MoE: si se confirma la naturaleza mixture-of-experts, el modelo permite estudiar el comportamiento de modelos con parametros activos reducidos frente a densos de tamano similar, aunque esta ficha no puede confirmar dicha arquitectura.
- Integracion en pipelines de generacion de texto con llama.cpp u Ollama: el formato GGUF es directamente consumible por estas herramientas, lo que simplifica la incorporacion del modelo en flujos existentes sin conversion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. F16 requiere aproximadamente 60 GB solo para pesos; Q8_0 en torno a 32 GB; Q4_K_M en torno a 18-19 GB; Q2_K en torno a 11-12 GB. Estas cifras son estimaciones a partir del numero de parametros y no estan confirmadas en la model card.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, un modelo de 30 B en Q4_K_M encaja en GPUs de 24 GB (RTX 4090, RTX 3090, A10G); las variantes Q8_0 y F16 requieren A100 40/80 GB o H100.
- GPU de consumo: las cuantizaciones Q2_K a Q4_K_M son las unicas plausibles en GPUs de consumo con 12-24 GB de VRAM, siempre que el modelo sea MoE con pocos parametros activos; si fuera denso, el throughput seria muy bajo.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. vLLM y TGI no estan confirmados para este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion fundamentada.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide confirmar si el uso comercial esta permitido; es imprescindible consultar la licencia del modelo original en https://huggingface.co/tencent/Hy-MT3-30B-A3B antes de cualquier despliegue en produccion.
- No se declaran idiomas soportados; el rendimiento en castellano es desconocido.
- No se documentan sesgos conocidos, pero todo modelo de lenguaje sin informacion de alineacion publicada debe tratarse con cautela en aplicaciones sensibles.
- Riesgo de alucinacion no cuantificado: sin benchmarks ni evaluaciones publicadas, no es posible estimar la fiabilidad factual del modelo.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable en modelos de este tamano; se recomienda validar la variante elegida sobre tareas representativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de comunidad que valide su funcionamiento.
- El campo "pipeline" no esta disponible, lo que impide confirmar la tarea principal declarada por el autor.
- La interpretacion de "A3B" como 3.000 millones de parametros activos es una inferencia a partir del nombre y no un dato confirmado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Hy-MT3-30B-A3B-GGUF
- Modelo original: https://huggingface.co/tencent/Hy-MT3-30B-A3B
