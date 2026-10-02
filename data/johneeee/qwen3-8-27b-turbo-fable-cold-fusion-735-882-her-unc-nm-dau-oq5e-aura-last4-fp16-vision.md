# Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-her-unc-NM-DAU-oQ5e-aura-last4-fp16-vision

## Resumen

El modelo identificado como `Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-her-unc-NM-DAU-oQ5e-aura-last4-fp16-vision` es una publicacion alojada en HuggingFace por el usuario Johneeee, con fecha de creacion y ultima actualizacion del 2 de octubre de 2026. No se trata de un modelo entrenado desde cero, sino de una cuantizacion de un modelo base que el autor etiqueta internamente como `qwen3_5`. La model card unicamente documenta el proceso de cuantizacion: 5 bits, grupo de 64, formato MLX safetensors y uso de la herramienta oQ (oMLX v0.7.0.dev4) con cuantizacion de precision mixta.

El repositorio contiene 27.356.728.560 parametros reales en safetensors (aproximadamente 27,36 mil millones) y ocupa 23,4 GB. El nombre del modelo sugiere variantes adicionales (sufijos como "turbo", "cold-fusion", "vision", "last4-fp16"), pero la model card no documenta ninguna de ellas, por lo que no pueden confirmarse como caracteristicas reales del artefacto publicado.

La relevancia de esta ficha es limitada y conviene ser explicito: no hay licencia declarada, no hay idiomas declarados, no hay pipeline declarado, cero descargas y cero likes en el momento de la consulta, y no se ha publicado informacion sobre el modelo base original (Qwen3.8-27B no corresponde a ninguna denominacion oficial conocida de la familia Qwen). Cualquier evaluacion de capacidades, contexto o benchmark queda pendiente de informacion que el autor no ha facilitado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag de configuracion indica `qwen3_5`; no se detalla si es transformer denso, MoE o hibrida) |
| Parametros totales | 27.356.728.560 (unos 27,36 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, group size 64, precision mixta mediante oQ; el nombre sugiere las ultimas 4 capas en fp16, sin confirmar en la model card |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |
| Tamano del repositorio | 23,4 GB |
| Libreria declarada | mlx |
| Fecha de publicacion | 2026-10-02 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base. El unico dato tecnico aportado es el campo `model_type: qwen3_5` y la etiqueta de libreria `mlx`, que situan el artefacto dentro del ecosistema de Apple Machine Learning e indican que la conversión y cuantizacion se realizaron para ejecucion en silicio de Apple. La model card no especifica numero de capas, dimension del modelo, tipo de atencion, uso de MoE, ni si incorpora componentes de vision, pese a que el sufijo "vision" aparece en el nombre del repositorio.

Respecto al entrenamiento, no hay ningun dato: no se indica numero de tokens, composicion del dataset, ni si hubo etapas de RLHF, DPO u otro tipo de ajuste por preferencias. Tampoco se documenta la procedencia del modelo original del que deriva esta cuantizacion, lo que impide trazar la licencia y las condiciones de uso heredadas.

La unica innovacion tecnica documentada es el propio proceso de cuantizacion: oQ (oMLX v0.7.0.dev4) aplica precision mixta con cuantizacion a 5 bits y tamano de grupo 64, lo que reduce el peso respecto a una cuantizacion uniforme de menor granularidad. No se aportan mediciones de degradacion de perplejidad, perdida de exactitud frente al modelo original ni comparativas de calidad.

## Capacidades

No se ha publicado informacion sobre las capacidades del modelo en la documentacion disponible. No es posible confirmar ninguno de los siguientes extremos, que quedan como no verificados:

- Generacion de texto, razonamiento, codigo o matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades multimodales: el nombre del repositorio incluye el termino "vision", pero la model card no confirma ningun componente de vision ni procesador de imagenes.
- Modo de razonamiento explicito (thinking mode): no disponible.

Cualquier afirmacion funcional sobre este modelo requeriria inspeccionar los ficheros de configuracion y tokenizer del repositorio o ejecutar pruebas directas de inferencia.

## Casos de uso

Al no existir documentacion sobre capacidades, contexto o licencia, los siguientes escenarios son aplicaciones genericas plausibles para un modelo de ~27.000 millones de parametros cuantizado a 5 bits y ejecutable en local, no casos de uso verificados para este artefacto concreto. Se indican con esa salvedad.

- Inferencia local en equipos Apple Silicon: el formato MLX permite cargar el modelo en Macs con memoria unificada suficiente, evitando enviar datos a servicios externos. Es el escenario mas coherente con las etiquetas del repositorio, aunque no hay mediciones de rendimiento publicadas.
- Prototipado y experimentacion offline: util para desarrolladores que quieran probar un modelo de ~27B sin coste de API, asumiendo que la calidad real depende del modelo base no documentado.
- Procesamiento de texto con requisitos de privacidad: en entornos donde el contenido no puede salir de la maquina, un modelo local cuantizado es la unica opcion viable. Requiere verificar antes la licencia, actualmente no declarada.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio sirve como muestra de cuantizacion mixta a 5 bits con oQ, y puede utilizarse para medir degradacion frente al modelo sin cuantizar, si se localiza ese original.
- Docencia y formacion en despliegue de modelos: sirve para ilustrar el flujo de conversion a MLX y la diferencia entre pesos fp16 y cuantizados, aunque no se aportan scripts ni guias en el repositorio.
- Base para ajuste fino ligero en local: tecnicamente posible sobre pesos MLX si el soporte de la herramienta lo permite, pero sin licencia declarada no puede recomendarse para uso comercial ni para publicar derivados.

No se recomienda integrar este artefacto en produccion sin antes resolver la ausencia de licencia, de idiomas declarados y de evaluacion de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye mediciones de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica. Tampoco se aportan datos de perplejidad del modelo cuantizado frente a su version sin cuantizar, ni comparaciones de latencia o throughput. Los resultados de busqueda web realizados no devolvieron informacion relacionada con el modelo: los unicos resultados obtenidos corresponden al portal fiscal frances impots.gouv.fr y no guardan ninguna relacion con este repositorio.

## Requisitos de hardware

Las cifras de memoria que se indican a continuacion son estimaciones calculadas a partir del numero de parametros y de los bits declarados, no datos publicados por el autor:

- Peso teorico de los pesos cuantizados a 5 bits: 27,36 mil millones de parametros x 0,625 bytes, aproximadamente 17,1 GB.
- Sobrecarga de escalas y sesgos por grupo de 64 a fp16: del orden de 1,7 GB adicionales.
- Estimacion de memoria total de pesos: entre 19 y 23 GB, coherente con el tamano de repositorio de 23,4 GB, que ademas incluye capas posiblemente en fp16.
- Memoria unificada recomendada en Apple Silicon: 32 GB o superior para trabajar con comodidad; en equipos de 24 GB el margen es muy ajustado y dependera del tamaño de contexto efectivo, que no esta documentado.
- GPU recomendadas: no disponible. El formato MLX esta orientado a Apple Silicon; su uso en CUDA (A100, H100, RTX 4090) requeriria conversion previa a otro formato, no documentada en el repositorio.
- Opciones de despliegue: la libreria declarada es MLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El uso con llama.cpp u Ollama exigiria una conversion a GGUF que el autor no aporta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa porque se desconoce el modelo base, su longitud de contexto, su licencia y su rendimiento. La siguiente tabla confronta el artefacto con alternativas de tamano comparable ampliamente conocidas, marcando como no disponible todo lo que no puede verificarse para este repositorio. Los datos de terceros corresponden a informacion publica de sus respectivas fichas y deberian confirmarse en la fuente original.

| Modelo | Parametros | Contexto | Licencia | Formato principal | Notas |
|---|---|---|---|---|---|
| Johneeee/Qwen3.8-27B-TURBO-... (este modelo) | 27,36 mil millones | no disponible | no disponible | MLX safetensors, 5 bits | Cuantizacion de un base `qwen3_5` no identificado; 0 descargas |
| Qwen2.5-32B-Instruct | 32,5 mil millones | 131.072 tokens | Apache 2.0 | safetensors, GGUF, MLX | Alternativa abierta con licencia permisiva y ecosistema amplio |
| Mistral-Small-24B-Instruct-2501 | 23,6 mil millones | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Tamano similar, contexto mas corto que Qwen |
| Gemma-3-27B-it | 27 mil millones | 128.000 tokens | Licencia Gemma | safetensors, GGUF | Multimodal en su variante completa |

La comparacion relevante para este repositorio seria contra la version sin cuantizar del mismo modelo base, pero esa referencia no esta disponible.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede determinar si el uso comercial esta permitido, si se exige atribucion o si existen restricciones heredadas del modelo base. Usarlo en produccion sin resolver esto es un riesgo juridico directo.
- Trazabilidad inexistente: no se identifica el modelo original del que procede la cuantizacion ni la version concreta, lo que impide reproducir el artefacto o verificar su procedencia.
- Sin evaluacion de calidad: no hay ninguna medicion de degradacion por la cuantizacion a 5 bits. En modelos cuantizados agresivamente es habitual observar perdida de exactitud en tareas de razonamiento y matematicas, pero no hay datos que lo confirmen o descarten aqui.
- Riesgo de alucinacion: no cuantificado. Al no existir benchmarks ni model card descriptiva, no hay base para estimar la fiabilidad factual.
- Idiomas no declarados: se desconoce si el modelo conserva capacidades multilingues y en que grado.
- Longitud de contexto desconocida: impide planificar casos de uso que dependan de ventanas largas.
- Nomenclatura potencialmente enganosa: el nombre incluye terminos como "turbo", "cold-fusion", "vision" y "last4-fp16" que no estan respaldados por la documentacion. No debe asumirse que el modelo procesa imagenes pese al sufijo "vision".
- Senales de baja validacion comunitaria: cero descargas y cero likes en el momento de la consulta, con creacion y actualizacion separadas por menos de un minuto, lo que sugiere una publicacion sin revision posterior.
- Restriccion de plataforma: el formato MLX limita el uso practico a equipos Apple Silicon, salvo conversion manual a otro formato.
- Sesgos: no disponible. No hay informacion sobre datos de entrenamiento ni sobre evaluaciones de sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-her-unc-NM-DAU-oQ5e-aura-last4-fp16-vision
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Paper, blog, repositorio o demo del autor: no disponible.
- Resultados de busqueda web relacionados con el modelo: no disponible (la busqueda no devolvio ninguna fuente pertinente).
