# bunnycore/MiniCPM5-2B-Super

## Resumen

MiniCPM5-2B-Super es un modelo de lenguaje publicado en HuggingFace por el usuario bunnycore, distribuido exclusivamente en formato GGUF y presentado como una conversion realizada con Unsloth. El repositorio ocupa 2,7 GB y contiene un unico archivo de pesos, `uraion-forge-2b.Q8_0.gguf`, correspondiente a una cuantizacion Q8_0. El dato real de parametros reportado en safetensors es de 2.516.756.480 (aproximadamente 2,5 mil millones), lo que situa al modelo en el segmento de pequeno tamano, apto para inferencia en hardware de consumo.

El nombre sugiere una relacion con la familia MiniCPM en su hipotetica quinta generacion, pero no se ha aportado ninguna confirmacion por parte del equipo que desarrolla MiniCPM (OpenBMB), ni model card detallada, ni paper, ni resultados de evaluacion. La model card se limita al texto plantilla de conversion a GGUF generado por Unsloth, con dos ejemplos de invocacion mediante `llama-cli` y `llama-mtmd-cli` y la lista de archivos disponibles. No se declara licencia, idiomas soportados, longitud de contexto ni pipeline.

La relevancia de esta ficha es, por tanto, acotada y fundamentalmente practica: sirve para documentar un artefacto GGUF de ~2,5 B de parametros que puede ejecutarse con llama.cpp en equipos modestos, pero tambien para advertir de que la trazabilidad del modelo es insuficiente (sin licencia, sin benchmarks, sin origen verificado) y de que no deberia adoptarse en produccion sin una validacion previa por parte del equipo que lo vaya a integrar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.516.756.480 (dato real reportado en safetensors) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado: `uraion-forge-2b.Q8_0.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); tamano del repositorio 2,7 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. El repositorio no incluye configuracion, paper, ni notas tecnicas que permitan determinar si se trata de un transformer denso, una mezcla de expertos, un modelo hibrido con componentes de espacio de estados o cualquier otra variante. Tampoco se especifica el tokenizador, el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el tipo de atencion utilizado. La unica pista disponible es la etiqueta `llama` en los tags del repositorio y el uso de la familia de herramientas llama.cpp, lo que sugiere compatibilidad con la arquitectura de transformer implementada en llama.cpp, pero esto es una inferencia de compatibilidad de formato, no una confirmacion de arquitectura.

Respecto al entrenamiento, no hay datos sobre numero de tokens, composicion del dataset, fases de ajuste fino supervisado, RLHF, DPO u otras tecnicas de alineamiento. La model card indica unicamente que la conversion a GGUF se realizo con Unsloth, una herramienta que ademas se emplea habitualmente para ajuste fino eficiente en memoria, lo que abre la posibilidad de que el modelo sea un ajuste fino derivado de otro checkpoint, pero no hay ninguna evidencia que lo confirme. El nombre interno del archivo de pesos (`uraion-forge-2b`) no coincide con el nombre del repositorio (`MiniCPM5-2B-Super`), lo que apunta a un renombrado del artefacto y refuerza la incertidumbre sobre su procedencia. Cabe anadir que la herramienta `llama-mtmd-cli` mencionada en la model card forma parte de la plantilla generica de Unsloth para modelos multimodales y no constituye evidencia de que este modelo concreto acepte entrada de imagen o audio.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica un uso previsto de dialogo, con plantilla de chat aplicable mediante el flag `--jinja` de llama.cpp.
- Razonamiento, codigo y matematicas: sin datos disponibles sobre capacidades especificas ni evaluaciones que las respalden.
- Tool calling y function calling: no disponible; no se declara soporte en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se declara.
- Capacidades multilingues: no disponibles; el repositorio no declara lista de idiomas.
- Capacidad multimodal: no confirmada. La model card menciona `llama-mtmd-cli` para "modelos multimodales" en un texto plantilla, pero solo se publica un archivo GGUF de lenguaje y no se aporta proyector visual alguno.
- Capacidad de razonamiento extendido (thinking mode): no disponible.

## Casos de uso

- Prototipado local en equipos de desarrollo: con 2,5 B de parametros y un unico archivo Q8_0 de aproximadamente 2,7 GB, el modelo puede cargarse en un portatil con 8 GB de RAM o en una GPU de gama media para validar plantillas de prompt, flujos de conversacion y formatos de salida sin depender de servicios en la nube.
- Generacion de texto de bajo coste en edge: su tamano permite desplegarlo en dispositivos con recursos limitados (mini-PC, placas con GPU integrada) para tareas de redaccion asistida, resumen de textos cortos o reformulacion, siempre que la calidad se valide empiricamente antes.
- Filtrado y clasificacion de texto en pipelines de datos: uso como modelo auxiliar para etiquetar, agrupar o priorizar documentos antes de pasarlos a un modelo mayor, aprovechando su bajo coste por token.
- Chatbot de soporte interno con datos no sensibles: integrable mediante llama.cpp u Ollama en una intranet para responder consultas sobre documentacion interna, con la advertencia de que la ausencia de datos de alineamiento declarados hace imprescindible evaluar el tono y la veracidad antes de exponerlo a usuarios.
- Base para ajuste fino especifico de dominio: al ser un modelo pequeno en formato GGUF, puede servir como referencia de comportamiento, aunque para reentrenamiento haria falta localizar los pesos originales en safetensors o PyTorch, que no estan publicados en este repositorio.
- Experimentacion academica sobre cuantizacion y evaluacion: util como caso de estudio para medir la degradacion de calidad entre Q8_0 y cuantizaciones mas agresivas, o para comparar rendimiento entre backends de llama.cpp en hardware modesto.
- Inferencia por lotes en CPU para tareas no criticas: generacion de descripciones, normalizacion de campos de texto libre o generacion de variaciones de contenido donde la latencia no sea un requisito estricto.

En todos estos escenarios debe tenerse en cuenta que no existe ninguna evaluacion publicada que acredite el comportamiento del modelo, por lo que cada caso de uso requiere una validacion propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion alguna (MMLU, HumanEval, GSM8K, MT-Bench ni equivalentes), no hay paper asociado y los resultados de la busqueda web no contienen informacion relacionada con el modelo. No se deben asumir cifras de rendimiento basadas en el nombre del modelo ni en su tamano.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones calculadas a partir del numero de parametros reportado (2.516.756.480) y del coste teorico por peso de cada formato; no proceden de mediciones publicadas por el autor.

- VRAM estimada en Q8_0 (formato publicado, unos 2,7 GB de pesos): aproximadamente 3,5-4,5 GB contando overhead de contexto y cache KV. Es el unico punto de partida verificado, dado que es el archivo realmente disponible.
- VRAM estimada en Q4_K_M (no publicado, calculado, unos 1,5 GB de pesos): aproximadamente 2-2,5 GB.
- VRAM estimada en FP16 (no publicado, calculado, unos 5,0 GB de pesos): aproximadamente 6 GB.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para Q8_0 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4, A100 y H100 lo ejecutan con holgura). Para Q4_K_M bastan GPUs de 4 GB.
- Cabe en GPU de consumo: si. Con el archivo Q8_0 publicado cabe en tarjetas con 6-8 GB de VRAM, y en equipos sin GPU dedicada puede ejecutarse en CPU con 8 GB de RAM.
- Opciones de despliegue: llama.cpp (`llama-cli -hf bunnycore/MiniCPM5-2B-Super --jinja`, tal como indica la model card), llama-cpp-python, Ollama, LM Studio y servidores compatibles con la API de llama.cpp. El tag `endpoints_compatible` sugiere uso con Inference Endpoints de HuggingFace. vLLM y TGI no pueden cargar GGUF de forma nativa en sus flujos habituales: requeririan los pesos originales en safetensors, que no se han publicado en este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo en ninguna configuracion de hardware.

## Comparativa con modelos similares

No se dispone de datos verificados del modelo objeto de esta ficha (contexto, licencia y benchmarks figuran como no disponibles), por lo que la comparativa se limita al segmento de tamano. Los datos de los modelos alternativos provienen de su documentacion publica habitual y no de la busqueda web realizada.

| Modelo | Parametros | Contexto | Licencia | Formato publicado | Benchmarks publicos |
|---|---|---|---|---|---|
| bunnycore/MiniCPM5-2B-Super | 2.516.756.480 | no disponible | no disponible | GGUF (Q8_0) | no disponible |
| Qwen2.5-3B | ~3,1 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | si, publicados por el autor |
| Llama 3.2 3B | ~3,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | si, publicados por el autor |
| Phi-3.5-mini | ~3,8 B | 128.000 tokens | MIT | safetensors, GGUF | si, publicados por el autor |

La diferencia practica mas relevante no es de rendimiento, sino de trazabilidad: los tres modelos alternativos cuentan con licencia explicita, contexto declarado, evaluaciones publicadas y un responsable identificable, condiciones que este repositorio no cumple.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no existe ninguna evaluacion publicada, por lo que se desconoce su calidad real en generacion, razonamiento, codigo o matematicas.
- Licencia no declarada: al no especificarse licencia, no hay base juridica clara para uso comercial. Debe tratarse como no apto para produccion hasta que el autor aclare los terminos.
- Procedencia dudosa: el nombre del archivo (`uraion-forge-2b.Q8_0.gguf`) no coincide con el nombre del repositorio, no se identifica el checkpoint base y no se confirma ninguna relacion con la familia MiniCPM de OpenBMB. Existe riesgo de que sea un modelo derivado con obligaciones de atribucion o de licencia heredadas que no se estan cumpliendo.
- Riesgo de alucinacion: desconocido y no mitigado por ninguna tecnica de alineamiento documentada. En un modelo de este tamano, la tasa de afirmaciones incorrectas suele ser elevada, pero no hay mediciones.
- Limitaciones de contexto e idioma: sin datos. No se puede planificar un caso de uso con documentos largos ni garantizar calidad en castellano.
- Multimodalidad no confirmada: la mencion a `llama-mtmd-cli` en la model card es texto plantilla; no se publica proyector visual ni configuracion multimodal.
- Senales de escasa validacion comunitaria: cero descargas y cero likes en el momento de la consulta, con creacion y ultima actualizacion separadas por unos 30 segundos, lo que apunta a una subida automatizada sin revision posterior.
- Ruido en la busqueda web: los resultados asociados a esta consulta corresponden a paginas de soporte de Microsoft y no guardan relacion con el modelo; no aportan informacion tecnica util.
- Falta de pesos en formato safetensors o PyTorch: limita el reentrenamiento, el ajuste fino con marcos estandar y el despliegue en servidores de alto rendimiento como vLLM o TGI.
- Fecha de creacion inusual (2026-09-12): conviene contrastarla con la fecha real de publicacion antes de citar el modelo en cualquier trabajo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bunnycore/MiniCPM5-2B-Super
- Unsloth (herramienta citada para la conversion a GGUF): https://github.com/unslothai/unsloth
- llama.cpp (backend de inferencia implicito en los tags y en los comandos de ejemplo): https://github.com/ggml-org/llama.cpp
- Paper, blog, demo o repositorio oficial del modelo: no disponible
- Resultados de benchmarks o evaluaciones: no disponible
