# atlas-institute/qwen35-08b-triage-sft

## Resumen

El modelo `atlas-institute/qwen35-08b-triage-sft` es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario atlas-institute sobre el modelo base Qwen/Qwen3.5-0.8B, una variante de la familia Qwen 3.5 con aproximadamente 0,8 mil millones de parametros. No se trata de un modelo completo, sino de un adaptador de pesos (PEFT) que debe cargarse junto al modelo base para poder utilizarse. El repositorio ocupa 0,0 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha.

La relevancia de este tipo de publicaciones es la del ajuste fino eficiente: LoRA permite especializar un modelo pequeno en una tarea concreta con un coste de entrenamiento muy bajo, manteniendo el modelo base intacto y compartiendo unicamente la delta de pesos. El sufijo "triage" del nombre sugiere un ajuste orientado a tareas de clasificacion o priorizacion (por ejemplo, triaje de incidencias o de consultas), pero la model card no lo confirma ni aporta ninguna descripcion del objetivo.

La documentacion publicada es practicamente una plantilla vacia: el autor no ha rellenado los apartados de descripcion, datos de entrenamiento, hiperparametros, evaluacion, licencia ni idiomas. Esto limita mucho cualquier evaluacion rigurosa y obliga a marcar la mayoria de especificaciones como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denominado Qwen/Qwen3.5-0.8B; la model card no detalla la arquitectura del modelo base |
| Parametros totales | No disponible. El modelo base declarado tiene aproximadamente 0,8 mil millones de parametros; el numero de parametros entrenables del adaptador no se publica |
| Parametros activos | No aplica (no se indica que el modelo base sea un MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors; no se documentan cuantizaciones del modelo base ni del adaptador |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (pesos de adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA generado con la libreria PEFT (la model card indica la version 0.19.1) y entrenado mediante SFT con TRL, segun las etiquetas del repositorio. La libreria declarada es `peft`, la tarea es `text-generation` y las etiquetas incluyen `lora`, `sft`, `transformers` y `trl`. Los pesos se almacenan en safetensors. No se especifica el rango del adaptador, las capas objetivo, el dropout, la tasa de aprendizaje, el numero de pasos ni el regimen de precision (fp32, fp16, bf16 o fp8).

Tampoco se documenta el conjunto de datos de entrenamiento: no hay enlace a una dataset card, ni numero de tokens, ni composicion del corpus, ni proceso de filtrado, ni si hubo una fase posterior de preferencias (DPO, RLHF). Del nombre del repositorio solo puede inferirse que el ajuste apunta a una tarea de "triage", pero no hay ninguna confirmacion tecnica de cual es esa tarea ni de como se evaluo. En consecuencia, no es posible verificar que innovaciones tecnicas incorpora el ajuste mas alla del uso estandar de LoRA sobre un modelo base pequeno.

## Capacidades

- Generacion de texto conversacional: la etiqueta de pipeline es `text-generation` y las etiquetas incluyen `conversational`, por lo que el ajuste esta pensado para producir respuestas en formato de dialogo.
- Ajuste especifico para una tarea de triaje o priorizacion: inferido unicamente del nombre del repositorio; no hay documentacion que lo confirme ni que describa el esquema de etiquetas o salidas esperadas.
- Especializacion mediante LoRA: el adaptador puede cargarse y descargarse sobre el modelo base, y combinarse o no con otros adaptadores segun el flujo de PEFT.
- Capacidad de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponible.
- Rendimiento heredado del modelo base: no evaluado ni documentado en este repositorio.

## Casos de uso

- Triaje de tickets de soporte: si el ajuste responde al proposito que sugiere su nombre, podria clasificar y priorizar incidencias entrantes (urgencia, categoria, equipo responsable) antes de que un agente humano las atienda. Requiere validacion previa, porque no hay ejemplos de entrada ni salida documentados.
- Clasificacion previa en un pipeline de enrutado: el adaptador podria actuar como primer filtro de bajo coste que decide a que cola o a que modelo mayor se deriva cada consulta, aprovechando su tamano reducido para mantener latencia baja.
- Preprocesado de formularios o mensajes de usuario: normalizacion o etiquetado de texto corto antes de pasarlo a un sistema mayor, en escenarios donde el coste por inferencia es un factor critico.
- Despliegue en el borde o en local: al apoyarse en un modelo base de 0,8 mil millones de parametros, puede ejecutarse en portatiles, mini-PC o contenedores con CPU, lo que permite procesar datos sensibles sin enviarlos a un servicio externo.
- Prototipado rapido de un clasificador especializado: serviria como punto de partida para comparar contra reglas heuristicas o contra un modelo generalista, siempre que se construya un conjunto de evaluacion propio.
- Investigacion sobre ajuste eficiente: util como ejemplo reproducible de flujo PEFT + TRL sobre un modelo sub-1B para estudiar como se comporta un adaptador de bajo rango en tareas de decision.
- Filtrado de contenido o moderacion asistida: solo si se valida con datos propios, dado que no hay informacion sobre sesgos ni sobre los datos de entrenamiento utilizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye el apartado de evaluacion sin rellenar, sin datos de testing, factores ni metricas, y no se han encontrado resultados externos en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: al partir de un modelo base de aproximadamente 0,8 mil millones de parametros, las estimaciones orientativas son de unos 1,6-2 GB en fp16/bf16, alrededor de 0,8-1,5 GB en cuantizacion de 8 bits y del orden de 0,5-1 GB en cuantizacion de 4 bits, sumando el coste de activaciones y cache KV. Son estimaciones derivadas del tamano del base, no medidas publicadas por el autor.
- Adaptador LoRA: el peso adicional del adaptador es pequeno frente al modelo base, pero el rango y el numero de capas objetivo no se han publicado.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en la practica para el modelo base en precision reducida; tarjetas como RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 o H100 no suponen ningun problema. Para cargas por lotes grandes, una GPU con mas memoria permite aumentar el batch y el throughput.
- Cabe en GPU de consumo: si, con margen amplio, en cualquier GPU de consumo moderna e incluso en GPUs integradas con memoria unificada suficiente.
- Ejecucion en CPU: viable, con velocidades dependientes del numero de nucleos y del backend utilizado.
- Opciones de despliegue: `transformers` junto con PEFT para cargar el adaptador sobre el modelo base; vLLM con soporte de adaptadores LoRA para servicio concurrente; fusion del adaptador con los pesos base y conversion a GGUF para llama.cpp, Ollama o LM Studio; TGI si se despliega un modelo fusionado.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa se limita al segmento sub-1B. Los datos de rendimiento no estan disponibles para este ajuste, de modo que la comparacion se centra en parametros, contexto, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| atlas-institute/qwen35-08b-triage-sft | Adaptador sobre base de ~0,8B | No disponible | No disponible | No disponible | Repositorio publico, 0 descargas |
| Qwen/Qwen3.5-0.8B (base declarado) | ~0,8B | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Modelo base referenciado por las etiquetas |
| Qwen/Qwen3-0.6B | 0,6B | 32.768 tokens segun documentacion publica | No comparable sin datos del ajuste | Segun la licencia publicada por Qwen | Ampliamente desplegado |
| HuggingFaceTB/SmolLM2-360M-Instruct | 0,36B | 8.192 tokens segun documentacion publica | No comparable sin datos del ajuste | Apache 2.0 segun su model card | Muy usado como baseline pequeno |
| meta-llama/Llama-3.2-1B | 1,2B | 128.000 tokens segun documentacion publica | No comparable sin datos del ajuste | Licencia comunitaria de Meta con restricciones | Requiere aceptar la licencia |

No se dispone de una comparacion de rendimiento fiable porque este adaptador no publica ninguna evaluacion y el modelo base Qwen3.5-0.8B no aparece documentado en la informacion facilitada.

## Limitaciones y advertencias

- Documentacion inexistente: la model card es una plantilla sin rellenar. No hay descripcion del modelo, datos de entrenamiento, hiperparametros, evaluacion ni instrucciones de uso, lo que impide reproducir o auditar el ajuste.
- Licencia no especificada: al no declararse licencia, no hay una autorizacion explicita de uso comercial. Conviene contactar con el autor o asumir el marco legal por defecto antes de cualquier uso en produccion.
- Sesgos desconocidos: al no documentarse la procedencia de los datos de entrenamiento, no se puede evaluar que sesgos demograficos, linguisticos o de dominio arrastra el adaptador.
- Riesgo de alucinacion: cualquier modelo de generacion de texto puede producir salidas incorrectas con apariencia de verosimilitud. En tareas de clasificacion o triaje, el riesgo se traduce en etiquetas erroneas que pueden tener consecuencias operativas; se necesita una capa de validacion.
- Ambito de aplicacion incierto: el nombre sugiere triaje, pero no hay definicion de entradas, salidas, esquema de etiquetas ni umbrales. Sin esta informacion, el adaptador no debe integrarse en un flujo critico.
- Limitaciones de contexto e idioma: no disponibles. Se desconoce la ventana efectiva y si el ajuste conserva el comportamiento multilingue del modelo base.
- Capacidad limitada por el tamano: un modelo base de 0,8B tiene menos margen para razonamiento complejo, conocimiento factual y tareas largas que modelos de mayor tamano; es adecuado para tareas acotadas y bien definidas.
- Trazabilidad: el repo tiene 0 descargas y 0 valoraciones, y esta creado y actualizado en la misma franja horaria, lo que sugiere una publicacion reciente y sin validacion por parte de la comunidad.
- Sin garantias de mantenimiento: no hay enlaces a repositorio, paper ni demo, ni informacion de contacto del autor en la model card.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/atlas-institute/qwen35-08b-triage-sft
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper citado en la model card (Lacoste et al., 2019, sobre estimacion de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Resultados de la busqueda web: no se han encontrado enlaces tecnicos relevantes. Las coincidencias obtenidas corresponden a entidades no relacionadas con el modelo (operador de competencias frances, tienda de muebles, marca de ropa), por lo que se descartan como fuentes.
