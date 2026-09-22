# gabrielmtzcarrillo/deepcogito-cogito-v1-preview-llama-3B-heretic-gguf

## Resumen

Esta ficha describe el repositorio `gabrielmtzcarrillo/deepcogito-cogito-v1-preview-llama-3B-heretic-gguf`, una conversión a formato GGUF del modelo `deepcogito/cogito-v1-preview-llama-3B`, que a su vez deriva de `meta-llama/Llama-3.2-3B`. Se trata, por tanto, de una redistribucion cuantizada de un modelo de 3.212.749.888 parametros (dato real de los pesos en safetensors del modelo origen), no de un entrenamiento nuevo ni de un ajuste fino documentado.

El autor indica que los pesos de origen fueron modificados localmente antes de la conversion a GGUF, pero la model card no especifica en que consistio esa modificacion. El sufijo "heretic" del nombre del repositorio no aparece explicado en la documentacion disponible; en el ecosistema abierto ese termino suele asociarse a procesos de ablacion de direcciones de rechazo (decensurado), pero no hay confirmacion en la informacion proporcionada. El repositorio contiene un unico artefacto practico: pesos en GGUF listos para inferencia con llama.cpp.

La relevancia de esta publicacion es limitada y fundamentalmente practica: ofrece acceso en formato GGUF a un modelo pequeno (3B) de razonamiento hibrido, cuantizado en F16 y Q4_K_M, lo que permite ejecutarlo en hardware de consumo. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentacion adicional sobre el proceso de modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; el modelo base ultimo es Llama 3.2 3B (transformer decoder-only) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; Llama 3.2 3B declara hasta 128.000 tokens de contexto |
| Tipos de cuantizacion | F16 y Q4_K_M (los dos unicos formatos publicados en el repositorio) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Llama 3.2 Community License (etiqueta `license:llama3.2`), con Acceptable Use Policy aplicable |
| Formato de pesos | GGUF |
| Tamano del repositorio | 8,5 GB |
| Modelo base | `deepcogito/cogito-v1-preview-llama-3B` |
| Herramienta de conversion | llama.cpp (el JSON de conversion incluido registra los comandos y la version) |
| Pipeline declarado | `text-generation` |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base en la documentacion facilitada. El repositorio es una conversion de formato, no un entrenamiento: el autor declara que los pesos de origen fueron modificados localmente y despues convertidos a GGUF con llama.cpp, conservando un JSON con los comandos y la version empleada. No se documentan numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o cualquier otra fase de alineamiento.

La unica innovacion tecnica atribuible al pipeline de publicacion es la propia cuantizacion: la variante Q4_K_M reduce el peso del modelo a una fraccion del original para permitir inferencia en CPU y GPU de gama baja, mientras que la variante F16 preserva la precision numerica del punto de partida modificado. La procedencia "heretic" sugiere una intervencion sobre los pesos orientada a modificar el comportamiento de rechazo, pero la model card no detalla la tecnica, el alcance ni las metricas de evaluacion asociadas.

## Capacidades

La informacion disponible no incluye una descripcion funcional detallada del modelo. Lo que puede afirmarse con base en los datos proporcionados es lo siguiente:

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` aparece en los metadatos del repositorio.
- Compatibilidad con endpoints de inferencia: la etiqueta `endpoints_compatible` indica que el artefacto GGUF esta preparado para su despliegue en servicios compatibles.
- Razonamiento: el modelo base pertenece a la familia Cogito, orientada a razonamiento hibrido, pero no hay documentacion en la informacion proporcionada que confirme modos concretos (por ejemplo, modo "thinking" explicito) ni su comportamiento tras la modificacion de pesos.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas en el repositorio.
- Capacidades especiales (vision, audio, modo thinking verificable): no disponible.

## Casos de uso

- Prototipado local en portatil o estacion de trabajo sin GPU dedicada: con la cuantizacion Q4_K_M el modelo ocupa del orden de 2 GB, por lo que puede ejecutarse con llama.cpp u Ollama en CPU y validar rapidamente flujos conversacionales antes de escalar a modelos mayores.
- Asistentes conversacionales de bajo coste: al ser un modelo denso de 3B con pipeline `text-generation` y etiqueta `conversational`, encaja en chatbots de soporte interno donde el coste por token y la latencia importan mas que la precision experta.
- Experimentacion sobre modificacion de pesos: dado que el autor declara haber alterado los pesos de origen antes de la conversion, el repositorio sirve como material de estudio para comparar el comportamiento del modelo base frente a la variante modificada en tareas de rechazo y seguridad.
- Despliegue en el borde (edge) y dispositivos con memoria limitada: el formato GGUF con Q4_K_M permite ejecucion en mini-PC, Raspberry Pi de gama alta o telefonos mediante bindings de llama.cpp, con requisitos de memoria muy contenidos.
- Evaluacion de pipelines de cuantizacion: el repositorio incluye F16 y Q4_K_M del mismo punto de partida, lo que permite medir la degradacion introducida por la cuantizacion en tareas concretas de generacion.
- Generacion de texto offline y procesamiento por lotes: al no requerir acceso a API externa, es adecuado para tareas de resumen, clasificacion o extraccion sobre corpus que no pueden salir de la organizacion.
- Base para ajuste fino ligero: un modelo de 3B en F16 puede servir como punto de partida para LoRA o QLoRA en una unica GPU de consumo, siempre que la licencia Llama 3.2 lo permita para el caso de uso previsto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces recuperados corresponden a paginas de seguimiento de envios de FedEx y no aportan datos tecnicos. La model card tampoco incluye tablas de evaluacion (MMLU, HumanEval, GSM8K u otras), ni comparaciones con el modelo base, ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion orientativa a partir del numero de parametros; no verificada por el autor):
  - Q4_K_M: aproximadamente 3 GB de VRAM con contexto moderado.
  - F16: aproximadamente 7-8 GB de VRAM, incluyendo pesos y cache KV.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para Q4_K_M (RTX 3050, RTX 4060, GTX 1660 Super). Para F16 se recomienda 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 3070). No se requiere A100 ni H100 para un modelo de este tamano.
- Compatibilidad con GPU de consumo: si, en ambos formatos. Q4_K_M cabe en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada.
- Ejecucion en CPU: viable con Q4_K_M, con un requisito de RAM del orden de 4 GB incluyendo overhead del runtime.
- Opciones de despliegue: llama.cpp (herramienta de conversion declarada), Ollama, LM Studio y otros frontends basados en GGUF. El soporte de vLLM y TGI para GGUF es parcial y no esta confirmado para este artefacto; la etiqueta `endpoints_compatible` sugiere compatibilidad con servicios de inferencia gestionados, sin mas detalle.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

La comparacion se limita a los datos verificables en la informacion proporcionada. No se dispone de resultados de benchmarks de este repositorio, por lo que la columna de rendimiento se deja como no disponible en todos los casos.

| Modelo | Parametros | Contexto | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| `gabrielmtzcarrillo/deepcogito-cogito-v1-preview-llama-3B-heretic-gguf` | 3.212.749.888 | No disponible | GGUF (F16, Q4_K_M) | Llama 3.2 Community License | No disponibles |
| `deepcogito/cogito-v1-preview-llama-3B` (modelo base) | 3.212.749.888 | No disponible en la informacion proporcionada | Safetensors (pesos originales) | Llama 3.2 Community License | No disponibles en la informacion proporcionada |
| `meta-llama/Llama-3.2-3B` (origen ultimo) | 3.200 millones aproximadamente | Hasta 128.000 tokens segun la documentacion de Meta | Safetensors y GGUF oficiales | Llama 3.2 Community License | No disponibles en la informacion proporcionada |

Alternativas de terceros del mismo segmento (por ejemplo, Qwen2.5-3B-Instruct o Phi-3.5-mini) no aparecen mencionadas en la informacion proporcionada; no se incluyen datos comparativos para no introducir cifras no verificadas.

## Limitaciones y advertencias

- Trazabilidad limitada: la model card no documenta que modificacion concreta se aplico a los pesos de origen, ni quien la realizo, ni con que metodologia. Esto dificulta reproducir el artefacto o auditar su comportamiento.
- Termino "heretic" sin definir: si la modificacion consiste en una ablacion de rechazos, es esperable un aumento de respuestas a peticiones que el modelo original rechazaria. No hay confirmacion ni evaluacion de seguridad publicada.
- Riesgo de alucinacion: inherente a un modelo denso de 3B; no se han publicado evaluaciones de fidelidad factual sobre esta conversion.
- Idiomas: no se declaran idiomas soportados en el repositorio. La calidad fuera de los idiomas oficialmente cubiertos por Llama 3.2 no esta garantizada.
- Contexto: no se especifica la longitud de contexto efectiva tras la modificacion y la conversion. Aunque el modelo origen anuncia ventanas amplias, el artefacto GGUF no declara un valor propio.
- Restricciones de licencia: se aplica la Llama 3.2 Community License junto con la Acceptable Use Policy de Meta. El uso comercial esta sujeto a las condiciones de dicha licencia, incluidos los requisitos de atribucion (conservados en el fichero NOTICE del repositorio) y las clausulas de uso aceptable.
- Ausencia de benchmarks y de adopcion: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes publicadas. No se recomienda su uso en produccion sin una validacion propia previa.
- Deriva de cuantizacion: la variante Q4_K_M introduce perdida de precision respecto a F16; no se han publicado mediciones del impacto en tareas concretas.
- Resultados de busqueda no relevantes: las consultas web asociadas devolvieron unicamente paginas de seguimiento de paqueteria, sin informacion tecnica aprovechable.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/gabrielmtzcarrillo/deepcogito-cogito-v1-preview-llama-3B-heretic-gguf
- Modelo base Cogito v1 Preview Llama 3B: https://huggingface.co/deepcogito/cogito-v1-preview-llama-3B
- Modelo origen de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B
- Licencia Llama 3.2 Community License: fichero LICENSE del repositorio
- Politica de uso aceptable: fichero USE_POLICY.md del repositorio
- Atribuciones: fichero NOTICE del repositorio
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada
