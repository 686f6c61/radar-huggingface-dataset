# llm-semantic-router/Vela-1.0-Encoder-307M-PII

## Resumen

Vela 1.0 · PII es un modelo encoder de 307.557.155 parametros (307M) especializado en deteccion de informacion personal identificable (PII) mediante clasificacion de tokens. Lo desarrolla el proyecto llm-semantic-router, responsable tambien de la capa de enrutado vLLM Semantic Router, y forma parte de la familia Vela de modelos auxiliares disenados para actuar como senales dentro de un sistema "Mixture-of-Models". Su funcion concreta es identificar spans sensibles en texto multilingue antes de que una peticion se enrute a un modelo generativo, de forma que se pueda redactar, bloquear o tratar de forma controlada la informacion confidencial.

El modelo se apoya en llm-semantic-router/mmbert-32k-yarn, un encoder multilingue con ventana de 32.000 tokens, y anade una cabeza de token-classification afinada para 17 tipos de entidad. Soporta ingles, chino, espanol, frances, aleman y japones, y se distribuye con licencia MIT en formatos safetensors y ONNX, lo que facilita su despliegue tanto en GPU como en CPU. En la evaluacion publicada por el autor sobre 1.704 peticiones sinteticas, alcanza un F1 de entidad exacta de 0,936 frente al 0,201 del modelo anterior, una mejora sustancial en la misma tarea.

Su relevancia actual es practica: la deteccion de PII es un requisito habitual en despliegues de IA en produccion (RGPD, minimizacion de datos, control de fuga de informacion en logs y prompts), y hacerlo con un encoder de 307M tokens de contexto largo resulta mucho mas barato que delegar esa decision a un modelo generativo grande. Aun asi, el propio autor advierte de que el modelo solo detecta, no redacta, y de que la calidad varia por tipo de entidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer de tipo ModernBERT (etiqueta `modernbert` del repositorio) |
| Parametros totales | 307.557.155 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32K tokens; se recomienda escaneo por ventanas solapadas para documentos mas largos |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repo incluye pesos ONNX y safetensors (tamano del repo: 2,5 GB) |
| Idiomas soportados | Ingles (en), chino (zh), espanol (es), frances (fr), aleman (de), japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

Se trata de un encoder transformer de tipo ModernBERT segun la etiqueta declarada en el repositorio, con 307.557.155 parametros y una ventana de contexto de 32.000 tokens heredada del modelo base llm-semantic-router/mmbert-32k-yarn. Sobre esa base se anade una cabeza de clasificacion de tokens (pipeline `token-classification`) orientada a reconocimiento de entidades nombradas aplicado a PII, con 17 tipos de entidad distintos que cubren nombres, correos electronicos, telefonos, direcciones y otras categorias. El modelo se distribuye con pesos en safetensors y exportacion ONNX, lo que permite inferencia en GPU mediante `transformers` y en CPU mediante runtime ONNX.

La model card no detalla el corpus de entrenamiento, el numero de tokens utilizados, la composicion del dataset ni el procedimiento de ajuste fino. Tampoco se documentan tecnicas como decodificacion especulativa o atencion lineal, ni procesos de alineacion tipo RLHF o DPO, que en un modelo encoder de clasificacion de tokens no resultan de aplicacion habitual. El unico dato de evaluacion publicado es el F1 de entidad exacta sobre 1.704 peticiones sinteticas, que pasa de 0,201 en el modelo anterior a 0,936 en Vela. El autor indica explicitamente que TITLE y NRP siguen siendo tipos de entidad debiles y recomienda validar la calidad de deteccion con datos propios.

## Capacidades

- Deteccion de PII como clasificacion de tokens: localiza spans sensibles y devuelve entidades etiquetadas, con agregacion de subtokens mediante `aggregation_strategy="simple"` en el pipeline de `transformers`.
- Cobertura de 17 tipos de entidad, entre ellos nombres, correos electronicos, numeros de telefono y direcciones; TITLE y NRP presentan calidad inferior segun el autor.
- Multilingue en seis idiomas: ingles, chino, espanol, frances, aleman y japones.
- Contexto largo: procesa hasta 32K tokens en una sola pasada, con escaneo por ventanas solapadas para documentos que exceden esa longitud.
- Salida orientada a enrutado: las senales de entidad estan pensadas para alimentar decisiones de redaccion, enrutado consciente de privacidad y manejo controlado de datos dentro de la capa vLLM Semantic Router.
- Exportacion ONNX para inferencia en CPU o entornos sin GPU.
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni capacidades de vision o audio: es un modelo discriminativo de etiquetado de tokens.

## Casos de uso

- Redaccion previa al envio a un LLM: interceptar el prompt del usuario, ejecutar Vela PII sobre el texto completo (hasta 32K tokens) y enmascarar o eliminar los spans detectados antes de reenviar la peticion al modelo generativo, reduciendo la exposicion de datos personales a terceros.
- Enrutado consciente de privacidad: integrar la salida del modelo como senal en vLLM Semantic Router para decidir si una peticion debe ir a un modelo autoalojado en lugar de a un proveedor externo cuando contiene PII.
- Saneado de logs y trazas de aplicaciones: escanear por lotes registros de conversaciones y depuracion para detectar correos, telefonos o direcciones que se hayan filtrado accidentalmente, usando ventanas solapadas sobre ficheros largos.
- Cumplimiento y auditoria de datos (RGPD): ejecutar el detector sobre documentos o bases de conocimiento internas para localizar donde hay datos personales antes de un proceso de anonimizacion o de una solicitud de supresion.
- Preprocesado de datasets de entrenamiento: marcar y eliminar PII de corpus multilingues antes de usarlos para ajuste fino, aprovechando el soporte de seis idiomas sin necesidad de un modelo distinto por idioma.
- Enmascarado en formularios y atencion al cliente: aplicar el modelo sobre transcripciones de soporte para ofuscar datos personales antes de que el contenido se almacene o se analice con herramientas de analitica.
- Filtro en pipelines de extraccion documental: combinar la deteccion de entidades con reglas de negocio para clasificar documentos (contratos, historiales) segun el tipo de dato sensible que contienen.

## Benchmarks y rendimiento

| Evaluacion | Modelo anterior | Vela 1.0 PII |
|---|---:|---:|
| F1 de entidad exacta · 1.704 peticiones sinteticas | 0,201 | 0,936 |

El autor indica que la medicion se realizo sobre peticiones sinteticas y recomienda validar la calidad de deteccion con datos propios. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar, que por otra parte no aplican a un modelo de clasificacion de tokens.

## Requisitos de hardware

- VRAM estimada para los pesos: en FP32 alrededor de 1,2 GB; en FP16/BF16 alrededor de 0,6 GB; en INT8 alrededor de 0,3 GB. Son estimaciones calculadas a partir de los 307.557.155 parametros; el tamano real del repositorio es de 2,5 GB e incluye pesos en safetensors y exportaciones ONNX.
- El modelo cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, con un consumo de VRAM muy por debajo de sus capacidades.
- Puede ejecutarse integramente en CPU mediante ONNX Runtime, lo que lo hace adecuado para entornos sin acelerador, con latencias mayores no cuantificadas en la informacion disponible.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para este modelo; se usarian unicamente para servir muchas peticiones concurrentes a gran escala.
- Opciones de despliegue: pipeline de `transformers` con `token-classification`, ONNX Runtime y, por integracion con el ecosistema del autor, la capa vLLM Semantic Router. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Vela 1.0 Encoder 307M PII | 307.557.155 | 32K tokens | en, zh, es, fr, de, ja | MIT | F1 de entidad exacta 0,936 sobre 1.704 peticiones sinteticas |
| llm-semantic-router/mmbert-32k-yarn (modelo base) | No disponible | 32K tokens (segun el nombre del modelo) | Multilingue (no detallado) | No disponible | No disponible; es la base sin cabeza de PII |
| Otros modelos de deteccion de PII de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye resultados comparativos frente a alternativas de deteccion de PII de terceros, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El modelo detecta PII pero no la redacta: la redaccion, el enmascarado o el bloqueo deben implementarse como paso posterior en la aplicacion.
- Calidad desigual por tipo de entidad: el autor senala explicitamente que TITLE y NRP siguen siendo debiles.
- Evaluacion basada en 1.704 peticiones sinteticas; el propio autor recomienda validar la calidad con datos reales antes de usarlo en produccion.
- Riesgo de falsos negativos y falsos positivos inherente a cualquier tarea de NER: una entidad no detectada puede acabar expuesta, y una deteccion incorrecta puede degradar el texto util.
- Para documentos de mas de 32K tokens es necesario aplicar ventanas solapadas, lo que anade complejidad y puede introducir duplicados o cortes en entidades que cruzan limites de ventana.
- Cobertura linguistica limitada a seis idiomas; el rendimiento en otros idiomas no esta documentado y no deberia asumirse.
- No se documentan sesgos especificos del ajuste, pero al derivar de un encoder multilingue puede heredar sesgos de su corpus de preentrenamiento, en particular en la deteccion de nombres segun origen cultural.
- El modelo no garantiza por si solo el cumplimiento normativo (RGPD u otras regulaciones): es un componente tecnico que debe acompanarse de politicas, auditoria y controles adicionales.
- Licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion y sin garantia.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- No es un modelo generativo: no debe usarse para conversacion, codigo, razonamiento ni tareas multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-PII
- Coleccion de la familia Vela: https://huggingface.co/collections/llm-semantic-router/vela-10-router-models-6aa555ba70cc6997d6d67798
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Organizacion en Hugging Face: https://huggingface.co/llm-semantic-router
- Modelo base: https://huggingface.co/llm-semantic-router/mmbert-32k-yarn
- Modelo hermano (Domain): https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Domain
- Modelo hermano (Modality): https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Modality
- Modelo hermano (FactCheck): https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-FactCheck
- Modelo hermano (Encoder base): https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M
- Documentacion y evaluacion: fichero TECHNICAL.md dentro del repositorio del modelo en Hugging Face
