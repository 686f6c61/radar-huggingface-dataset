# angeshwar/fraud-detector

## Resumen

`angeshwar/fraud-detector` es un ajuste fino (fine-tune) del modelo `Qwen/Qwen2.5-1.5B-Instruct`, publicado por el usuario angeshwar en HuggingFace. Segun la model card, se ha entrenado con SFT (supervised fine-tuning) utilizando la libreria TRL de HuggingFace, en su version 1.13.0, junto con Transformers 5.16.1 y PyTorch 2.11.0+cu128. El nombre del repositorio sugiere una especializacion en deteccion de fraude, pero la model card no documenta ni el dominio, ni el dataset, ni el objetivo del entrenamiento.

Se trata, por tanto, de un derivado de un modelo denso de 1.500 millones de parametros, con arquitectura transformer decoder-only y una ventana de contexto heredada del modelo base (32.768 tokens de serie, ampliable con YaRN). El interes practico de este tipo de publicaciones es doble: por un lado, ilustra el flujo estandar de fine-tuning con TRL sobre modelos pequenos; por otro, sirve como recordatorio de que un nombre descriptivo no equivale a documentacion tecnica. La model card esta generada automaticamente por la plantilla de TRL y no incluye informacion sustantiva sobre datos, hiperparametros ni evaluacion.

Actualmente el repositorio acumula 0 descargas y 0 "likes", tiene un tamano declarado de 0.0 GB y su licencia aparece como un marcador de posicion (`licence: license`) sin contenido. No se han encontrado resultados de benchmarks ni material adicional en la busqueda web. Cualquier evaluacion seria del modelo requiere inspeccionar los archivos del repositorio directamente, ya que la informacion publicada es insuficiente para determinar si los pesos estan efectivamente subidos y si el modelo funciona como su nombre indica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Qwen2.5-1.5B-Instruct; no detallada en la model card) |
| Parametros totales | 1.500 millones aproximadamente (heredado del modelo base; no verificado en la model card) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens de serie en el modelo base, ampliable a 131.072 con YaRN (heredado; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible en la model card. Al publicarse en safetensors, admite cuantizacion posterior a INT8, FP8 y formatos GGUF mediante herramientas externas |
| Idiomas soportados | No disponible. El modelo base Qwen2.5 declara soporte para 29 idiomas, pero no hay confirmacion de que el fine-tune los conserve |
| Licencia | No disponible. La model card incluye un campo `licence: license` sin valor y los metadatos de HuggingFace no especifican licencia |
| Formato de pesos | safetensors (segun los tags del repositorio). El repositorio declara 0.0 GB, por lo que no se puede confirmar que los pesos esten subidos |
| Libreria | transformers |
| Metodo de entrenamiento | SFT con TRL 1.13.0 |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |

## Arquitectura y entrenamiento

No hay informacion tecnica sobre la arquitectura especifica del fine-tune. Por herencia del modelo base Qwen2.5-1.5B-Instruct, se trata de un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA). El modelo base emplea un tokenizador con vocabulario de aproximadamente 151.936 tokens, disenado para ser eficiente en chino, ingles y otros idiomas. Estas caracteristicas no estan confirmadas en la model card del derivado.

En cuanto al entrenamiento, la unica informacion disponible es que se utilizo SFT con TRL. La seccion "Training procedure" de la model card esta vacia: no se documenta el dataset, el numero de tokens, la composicion de los datos, la longitud de secuencia, los hiperparametros (learning rate, batch size, epocas) ni si hubo fases posteriores de alineacion como DPO o RLHF. Tampoco se indica si se aplicaron tecnicas como LoRA, QLoRA o fine-tuning completo. No se describe ninguna innovacion tecnica adicional.

## Capacidades

La model card no documenta capacidades especificas. A partir del modelo base y del nombre del repositorio, pueden formularse las siguientes hipotesis, todas ellas sin verificar:

- Generacion de texto conversacional en formato de chat (el modelo base esta ajustado como instruct).
- Razonamiento basico y respuesta a instrucciones en varios idiomas, si el fine-tune no ha degradado el modelo base.
- Clasificacion o etiquetado de textos relacionados con fraude, si el ajuste se ha realizado con ese proposito (inferido del nombre, no confirmado).
- Soporte de tool calling / function calling: el modelo base Qwen2.5-1.5B-Instruct lo soporta, pero no hay evidencia de que el fine-tune lo conserve.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo base es exclusivamente de texto.
- Modo "thinking" explicito: no disponible.

El unico ejemplo de uso incluido en la model card es una pregunta generica sobre una maquina del tiempo, no un caso de deteccion de fraude, lo que refuerza la idea de que la tarjeta se genero automaticamente sin validacion del autor.

## Casos de uso

Los siguientes escenarios son hipoteticos y presuponen que el modelo funciona segun su nombre. No deben llevarse a produccion sin una evaluacion previa sobre datos propios.

- Triaje de transacciones sospechosas: dado un registro textual de una operacion (importe, comercio, pais, historial), el modelo podria generar una etiqueta o una justificacion breve de riesgo. Requiere validar primero que el ajuste SFT se hizo sobre datos de ese tipo.
- Analisis de correos de phishing: clasificacion de mensajes como fraudulentos o legitimos y extraccion de indicadores (URL sospechosa, urgencia, suplantacion de identidad). La ventana de 32.768 tokens del modelo base permitiria procesar hilos de correo completos.
- Resumen de alertas para analistas: convertir registros crudos de un sistema antifraude en resumenes legibles, reduciendo el tiempo de revision manual.
- Generacion de reglas y consultas: producir consultas SQL o reglas de negocio a partir de descripciones en lenguaje natural de patrones de fraude observados.
- Chatbot interno de soporte a equipos de riesgo: asistente que responde preguntas sobre procedimientos internos y tipologias de fraude, apoyandose en contexto inyectado en el prompt.
- Etiquetado asistido de datasets: preanotacion de grandes volumenes de texto para que un equipo humano revise y corrija, aprovechando el bajo coste de inferencia de un modelo de 1.5B.
- Extraccion de entidades en informes de disputas: identificacion de numeros de tarjeta, fechas, comercios y motivos de reclamacion en texto libre.

En todos los casos, un modelo de 1.500 millones de parametros presenta una fiabilidad limitada en tareas de decision sensible, por lo que su uso razonable seria como componente de triaje o asistencia, nunca como decisor autonomo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de ningun tipo (ni MMLU, ni HumanEval, ni GSM8K, ni metricas especificas de deteccion de fraude como precision, recall, F1 o AUC). Tampoco se han encontrado evaluaciones externas en la busqueda web realizada.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano del modelo base (1.500 millones de parametros) y no proceden de la documentacion del autor.

| Precision | Peso de los pesos | VRAM estimada con contexto de 8.000 tokens |
|---|---|---|
| FP16 / BF16 | ~3,1 GB | ~4-5 GB |
| INT8 | ~1,6 GB | ~2,5-3 GB |
| GGUF Q4_K_M | ~1,0 GB | ~1,5-2 GB |

- Cabe en GPUs de consumo: si, con holgura. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 8 GB, una RTX 4070 o una RTX 4090 ejecutan el modelo en FP16 sin problemas.
- Tambien es viable la inferencia en CPU con llama.cpp u Ollama en cuantizacion Q4, con velocidades del orden de decenas de tokens por segundo en procesadores modernos.
- GPU recomendadas para produccion: cualquier GPU con 8 GB o mas de VRAM. Para despliegue con alta concurrencia son adecuadas la L4, la A10G, la L40S o la A100, aunque el modelo es pequeno para justificar una A100 o H100 salvo por agregacion de muchas peticiones.
- Opciones de despliegue: transformers con `pipeline`, vLLM, TGI, SGLang, llama.cpp y Ollama. El tag `endpoints_compatible` del repositorio indica compatibilidad con HuggingFace Inference Endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia general para un modelo denso de 1.5B en FP16, cabe esperar latencias de decenas de milisegundos por token en GPU de gama media, pero no hay mediciones publicadas para este modelo concreto.
- Advertencia importante: dado que el repositorio declara 0.0 GB de tamano, es posible que los pesos no esten subidos y que el modelo no sea descargable. Conviene verificar la pestana "Files" antes de planificar cualquier despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| angeshwar/fraud-detector | ~1,5B (heredado) | 32.768 tokens (heredado) | No especificada | Repositorio de 0.0 GB, 0 descargas | Sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens, 131.072 con YaRN | Apache 2.0 | Ampliamente disponible y validado | Benchmarks publicados por el autor del modelo base |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | Ampliamente disponible | Benchmarks publicados |
| google/gemma-2-2b-it | 2,6B | 8.192 tokens | Gemma Terms of Use | Ampliamente disponible | Benchmarks publicados |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | Ampliamente disponible | Benchmarks publicados |

En la comparativa, el modelo objeto de esta ficha es el unico sin licencia declarada, sin benchmarks y sin garantia de que los pesos esten publicados. Para tareas de clasificacion de fraude, las alternativas de la tabla no estan especializadas en ese dominio, por lo que no existe una comparacion directa disponible; en ese caso lo habitual es evaluar contra modelos especializados publicados en HuggingFace bajo categorias de deteccion de fraude o contra modelos de mayor tamano (7B-8B) ajustados con datos propios.

## Limitaciones y advertencias

- Pesos posiblemente no publicados: el repositorio declara 0.0 GB de tamano, lo que sugiere que solo contiene archivos de configuracion o que la subida no se completo. Sin pesos no hay inferencia posible.
- Licencia sin definir: el campo `licence: license` de la model card es un marcador de posicion sin valor. No existe autorizacion explicita de uso comercial, lo que impide su adopcion en produccion desde un punto de vista legal. El modelo base Qwen2.5-1.5B-Instruct es Apache 2.0, pero la licencia del derivado debe declararla su autor.
- Documentacion practicamente inexistente: seccion de procedimiento de entrenamiento vacia, sin dataset, sin hiperparametros y sin metricas.
- Validacion nula de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta. No hay evidencia de que el modelo haya sido probado por terceros.
- Riesgo alto de alucinacion: un modelo de 1.500 millones de parametros puede generar justificaciones plausibles pero incorrectas, especialmente en un dominio sensible como el fraude, donde una clasificacion erronea tiene consecuencias economicas y legales.
- Sesgos del modelo base: Qwen2.5 puede reproducir sesgos presentes en sus datos de entrenamiento (geograficos, linguisticos, demograficos). Un fine-tune sobre un dataset no documentado puede amplificarlos.
- Riesgo de sobreajuste al dominio: si el ajuste se hizo sobre un conjunto pequeno o poco diverso de ejemplos de fraude, el modelo fallara ante tipologias no vistas y mostrara una confianza excesiva.
- Limitaciones de idioma: aunque el modelo base cubre 29 idiomas, no hay confirmacion de que el fine-tune mantenga competencia multilingue, ni de en que idioma se entreno.
- Fecha de creacion anomala: los metadatos indican una creacion el 2026-09-19, posterior a la fecha tipica de consulta, lo que puede indicar un error de la plataforma o una manipulacion de metadatos.
- Uso responsable: no debe emplearse para denegar servicios, bloquear cuentas o tomar decisiones automatizadas sobre personas sin supervision humana y sin una evaluacion de equidad y exactitud sobre datos representativos.
- Sin soporte ni mantenimiento conocidos: el autor no publica repositorio de codigo, paper ni canal de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/angeshwar/fraud-detector
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de SFTTrainer de TRL: https://huggingface.co/docs/trl/sft_trainer
- Documentacion de Transformers: https://huggingface.co/docs/transformers

Nota sobre la busqueda web: los resultados obtenidos corresponden a paginas de inicio de sesion de Facebook (facebook.com, secure.facebook.com, m.me, apps.facebook.com) y no guardan ninguna relacion con el modelo. No se han localizado papers, blogs, repositorios de codigo ni demos asociados a `angeshwar/fraud-detector`.
