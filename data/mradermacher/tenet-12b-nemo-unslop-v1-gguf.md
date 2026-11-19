# mradermacher/Tenet-12B-Nemo-Unslop-v1-GGUF

## Resumen

Tenet-12B-Nemo-Unslop-v1-GGUF es la distribucion en formato GGUF del modelo Tenet-12B-Nemo-Unslop-v1, un modelo de lenguaje de 12.247.782.400 parametros (aproximadamente 12,25 mil millones) desarrollado originalmente por mr-andrey-isachenko y cuantizado por mradermacher. El modelo base parte de la familia Tenet, etiquetada en la model card con los descriptores "lancet", "unslop", "nemo", "grpo", "abliterated", "uncensored", "agentic", "tool-use" y "coding", lo que indica un ajuste orientado a agentes, uso de herramientas, generacion de codigo y eliminacion de rechazos (abliteration).

Esta ficha cubre especificamente la version GGUF, pensada para inferencia local con llama.cpp y derivados (Ollama, LM Studio, KoboldCpp), con diez niveles de cuantizacion estatica desde Q2_K (4,9 GB) hasta Q8_0 (13,1 GB). El repositorio ocupa 84,7 GB en total e incluye unicamente pesos GGUF; los pesos originales en safetensors residen en el modelo base.

La relevancia actual del modelo radica en su tamano contenido (12B) combinado con un perfil "uncensored" y capacidades agenticas, lo que lo hace util para despliegues en hardware consumer de gama alta y para experimentacion con pipelines de tool calling sin restricciones de rechazo. La licencia Apache 2.0 permite uso comercial sin las restricciones habituales de otras familias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, inferido por el formato de pesos; no confirmado en la informacion proporcionada) |
| Parametros totales | 12.247.782.400 (12,25 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas; no hay imatrix ni quants ponderados disponibles) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento ni la composicion del dataset en la informacion proporcionada. La model card del repositorio GGUF no incluye estos datos y remite al modelo base (mr-andrey-isachenko/Tenet-12B-Nemo-Unslop-v1).

Los tags del modelo permiten inferir parcialmente el proceso de ajuste: "grpo" sugiere entrenamiento con Group Relative Policy Optimization (una variante de RL), "abliterated" indica que se ha aplicado abliteration para eliminar la direccion de rechazo en el espacio de activaciones, y "unslop" apunta a un ajuste fino destinado a reducir respuestas genericas o "slop". Los tags "agentic", "tool-use" y "coding" indican que el ajuste se oriento hacia tareas de agente, invocacion de herramientas y programacion. Los detalles concretos de hiperparametros, datasets y etapas de entrenamiento no estan disponibles.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado como "conversational".
- Razonamiento y generacion de codigo, segun los tags "coding" y "agentic".
- Tool calling / function calling, indicado por el tag "tool-use".
- Comportamiento agentico y razonamiento multi-paso, indicado por el tag "agentic".
- Modo "uncensored": el ajuste abliterated elimina los mecanismos de rechazo, permitiendo respuestas sin filtros de seguridad integrados.
- Compatibilidad con endpoints (tag "endpoints_compatible") y despliegue en vLLM (tag "vllm") y OpenRouter (tag "openrouter") para la version original.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision, audio y thinking mode explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de programacion local: con 12,25 B de parametros y cuantizacion Q4_K_M (7,6 GB), el modelo puede ejecutarse en una GPU consumer de 12-16 GB y generar codigo en ingles dentro de editores o plugins, aprovechando el tag "coding".
- Agente autonomo con tool calling: el tag "tool-use" y el perfil agentico lo hacen adecuado para pipelines que invocan APIs, ejecutan comandos o consultan bases de datos en varios pasos, con la ventaja de no rechazar instrucciones por motivos de politica interna.
- Atencion al cliente en ingles: conversaciones multi-turno en un unico idioma, con cuantizaciones Q5_K_M (8,8 GB) que mantienen calidad suficiente para respuestas coherentes en produccion ligera.
- Generacion de contenido sin restricciones editoriales: el ajuste abliterated permite redactar textos creativos, guiones o material divulgativo que otros modelos rechazarian por filtros de seguridad, siempre con supervision humana.
- Investigacion sobre seguridad y alineacion: al ser un modelo abliterated, sirve como caso de estudio para medir como la eliminacion de la direccion de rechazo afecta la calidad general y la tasa de respuestas problematicas.
- Despliegue en entornos con privacidad estricta: al ejecutarse con llama.cpp u Ollama en hardware local (Q2_K de 4,9 GB), no requiere enviar datos a servicios externos, lo que encaja en escenarios con requisitos de soberania de datos.
- Prototipado rapido en portatiles: la cuantizacion Q3_K_S (5,6 GB) permite probar el modelo en equipos con 8 GB de VRAM o incluso en CPU, aunque con perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y KV cache):
  - Q2_K (4,9 GB): ~6-7 GB de VRAM.
  - Q3_K_S (5,6 GB): ~7-8 GB.
  - Q4_K_S / Q4_K_M (7,2-7,6 GB): ~9-10 GB.
  - Q5_K_S / Q5_K_M (8,6-8,8 GB): ~10-11 GB.
  - Q6_K (10,2 GB): ~12 GB.
  - Q8_0 (13,1 GB): ~15 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 con contexto amplio; RTX 4080 / 4070 Ti Super (16 GB) para Q6_K y Q5; RTX 3060 12 GB o RTX 4070 (12 GB) para Q4_K_M; GPUs de 8 GB (RTX 3070, RTX 4060 Ti 8 GB) para Q3_K_S y Q2_K con contexto reducido.
- Cabe en GPU consumer: si, en todas las cuantizaciones desde Q2_K hasta Q8_0 con GPUs de 12-24 GB; Q8_0 requiere al menos 16 GB para contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui (con backend llama.cpp); la version original safetensors soporta vLLM y endpoints compatibles.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-12B-Nemo-Unslop-v1 (este) | 12,25 B | no disponible | Apache 2.0 | GGUF, safetensors | Ajuste abliterated, agentico, tool-use, coding |
| Modelos de ~12-13B de la familia Llama/Mistral | ~12-13 B | no disponible | varian (Llama 2/3 con restricciones, Mistral Apache 2.0) | GGUF, safetensors | Alternativas genericas; sin perfil abliterated ni agentico especifico |
| Modelos abliterated de ~7-8B | ~7-8 B | no disponible | varian | GGUF | Menor capacidad pero menor huella de VRAM |

No se dispone de datos de benchmarks ni de comparativas directas publicadas en la informacion proporcionada; la tabla anterior solo contrasta caracteristicas estructurales conocidas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse solo en ingles, los sesgos culturales estaran sesgados hacia ese contexto.
- Riesgo de alucinacion: no cuantificado; los modelos abliterated tienden a mostrar menor adherencia a instrucciones de seguridad y pueden generar contenido factualmente incorrecto con mayor confianza aparente.
- Limitacion de idioma: solo ingles declarado; el rendimiento en castellano u otros idiomas no esta verificado y probablemente sera deficiente.
- Longitud de contexto: no disponible; planificar despliegues con contexto conservador hasta verificar empiricamente.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo es "uncensored" y abliterated; el despliegue en produccion con usuarios finales exige filtros externos de moderacion para cumplir normativas (por ejemplo, DSA en la UE o requisitos de seguridad de plataformas).
- Calidad de cuantizaciones bajas: Q2_K y Q3_K_M degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- No hay quants imatrix/ponderados disponibles; la calidad de las cuantizaciones estaticas es inferior a las ponderadas en tamanos equivalentes.
- El repositorio GGUF no incluye proyecciones multimodales (no hay mmproj), por lo que no hay capacidades de vision.
- Ausencia de benchmarks publicados: no hay evidencia empirica de rendimiento frente a alternativas; evaluar antes de adoptar en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tenet-12B-Nemo-Unslop-v1-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-12B-Nemo-Unslop-v1
- Pagina de descargas del autor: https://hf.tst.eu/model#Tenet-12B-Nemo-Unslop-v1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
