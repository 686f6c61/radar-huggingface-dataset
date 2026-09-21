# juspay/jev-one

## Resumen

JevOne (identificador `juspay/jev-one`) es un modelo de decision tipada desarrollado por Juspay, una plataforma india de infraestructura de pagos. No se presenta como un modelo conversacional al uso, sino como un componente de inferencia que recibe un estado y un conjunto de preguntas tipadas y devuelve respuestas estructuradas: probabilidad binaria (`noul`), decision categorica con distribucion completa (`choice`) y puntuacion ordinal esperada con distribucion completa (`score`). Se sirve a traves de un endpoint compatible con TypeSafe en la ruta `/v1/systemone`.

El modelo es un ajuste fino de `Qwen/Qwen3.6-35B-A3B`, un transformer causal de tipo mezcla de expertos (MoE) con 35.107.181.936 parametros totales y aproximadamente 3.000 millones de parametros activos por token. Los pesos se distribuyen en BF16 bajo licencia Apache 2.0, con un peso en disco de unos 66 GB y un repositorio de 70,2 GB.

Su relevancia reside en el enfoque de producto: en lugar de competir en generacion abierta, encapsula el modelo en un contrato de decision con lectura determinista de un solo token, evaluacion del orden de opciones en sentido directo e inverso, calibracion de probabilidades y conversion de esquema. Esto lo orienta a sistemas donde la salida debe ser una decision medible con incertidumbre cuantificada, no texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con mezcla de expertos (MoE); tag `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 (aproximadamente 35B) |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | No disponible como especificacion del modelo; la configuracion de serving validada admite hasta 250.000 tokens de prefill |
| Tipos de cuantizacion | BF16 como unica precision liberada; no se documentan GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

Otros datos tecnicos relevantes: modelo base `Qwen/Qwen3.6-35B-A3B`, biblioteca declarada `transformers`, motor de serving SGLang, pipeline `text-generation`, tamano del repositorio 70,2 GB, peso de los ficheros de modelo aproximadamente 66 GB. El modelo incluye tambien los tags `image-text-to-text` y `typed-classification`, aunque la model card no documenta capacidades multimodales.

## Arquitectura y entrenamiento

La model card identifica el checkpoint base como `Qwen/Qwen3.6-35B-A3B` y describe la arquitectura como un modelo de lenguaje causal con mezcla de expertos, 35.000 millones de parametros totales y unos 3.000 millones activados por token. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni el procedimiento exacto de ajuste sobre el checkpoint base.

La innovacion tecnica declarada no esta en el preentrenamiento sino en la capa de serving, que forma parte de la configuracion de inferencia publicada y es obligatoria para obtener resultados reproducibles. Esta capa realiza lectura determinista de candidatos de un solo token, evaluacion del orden de opciones en sentido directo e inverso (forward/reverse) para mitigar el sesgo posicional, calibracion de probabilidades y conversion al esquema tipado solicitado. Las preguntas tipadas son `noul` (probabilidad binaria), `choice` (decision categorica y distribucion completa) y `score` (puntuacion ordinal esperada y distribucion completa).

## Capacidades

- Decision binaria tipada (`noul`) con salida de probabilidad, adecuada para tareas de si/no y verificacion.
- Decision categorica tipada (`choice`) con etiqueta ganadora y distribucion de probabilidad completa sobre las opciones.
- Puntuacion ordinal tipada (`score`) con valor esperado y distribucion, orientada a escalas tipo Likert o rangos.
- Calibracion de probabilidades y evaluacion bidireccional del orden de opciones para reducir el sesgo de posicion de las alternativas.
- Lectura determinista de candidatos de un solo token, lo que facilita la reproducibilidad de las salidas.
- Clasificacion tipada (`typed-classification`) como capacidad declarada en los tags del repositorio.
- Herencia de las capacidades del checkpoint base `Qwen/Qwen3.6-35B-A3B` (generacion de texto y modalidad imagen-texto segun los tags), aunque la model card no las documenta ni las valida.
- Servicio expuesto mediante endpoint compatible con TypeSafe en `/v1/systemone`.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Modo de razonamiento explicito (thinking), vision o audio: no documentado en la model card.

## Casos de uso

- Enrutado de decisiones en atencion al cliente: dado un estado de la conversacion y un conjunto cerrado de acciones posibles (escalar a humano, cerrar ticket, pedir mas datos), el modelo devuelve la accion elegida junto con la distribucion de probabilidad completa, lo que permite aplicar umbrales de confianza antes de automatizar.
- Puntuacion de riesgo en procesos de credito o fraude: con el tipo `score`, el modelo produce una puntuacion ordinal esperada y su distribucion, util para segmentar expedientes en bandas de riesgo en lugar de depender de una unica etiqueta.
- Moderacion y verificacion binaria: el tipo `noul` permite resolver comprobaciones de si/no (contenido aceptable, documento coherente, respuesta admisible) con una probabilidad asociada que se puede auditar y calibrar por umbral.
- Evaluacion automatizada de respuestas: en pipelines de generacion con modelos generativos, JevOne puede actuar como juez tipado, asignando una puntuacion ordinal a cada respuesta con distribucion de incertidumbre, para alimentar sistemas de seleccion o ranking.
- Clasificacion de tickets y correos entrantes: usando `choice` sobre un catalogo fijo de categorias, se obtiene la categoria y la masa de probabilidad repartida entre las demas, lo que permite derivar a revision humana solo los casos ambiguos.
- Extraccion de etiquetas en pipelines de datos: como clasificador tipado, puede etiquetar grandes volumenes de registros con un contrato de salida fijo y verificable, integrable en procesos batch de enriquecimiento de datos.
- Comparacion de opciones en A/B testing o configuracion: la evaluacion forward/reverse del orden de las alternativas permite comparar pares de opciones reduciendo el sesgo de presentacion, util para seleccionar variantes de copy, prompts o politicas.
- Decisiones multi-paso con contrato fuerte: en un agente que deba elegir entre herramientas o ramas de un flujo, cada decision puede formularse como una pregunta tipada y registrarse con su probabilidad asociada para trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de `juspay/jev-one` no incluye metricas de MMLU, HumanEval, GSM8K ni de calibracion (por ejemplo, ECE o Brier score), y los resultados de la busqueda web no aportan datos tecnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada en BF16: los ficheros de pesos ocupan aproximadamente 66 GB, por lo que la inferencia en BF16 requiere un minimo practico en torno a 80-90 GB de VRAM sumando pesos, activaciones y cache KV.
- Configuracion validada por el autor: 2 x NVIDIA RTX PRO 6000 Blackwell Server Edition de 96 GB cada una (192 GB totales), con paralelismo tensorial de 2 y fraccion de memoria estatica de 0,85.
- Imagen de SGLang validada: `lmsysorg/sglang@sha256:6bcaa47db52f78ce0d67863b8b2431221b79bc23204a80cad757fa819d00e921`.
- Presupuesto de prefill maximo declarado: 250.000 tokens en la configuracion validada. El propio autor advierte que presupuestos de prefill menores pueden funcionar en otras configuraciones de dos GPU, pero que esas configuraciones no estan cubiertas por la validacion.
- GPU consumer: en BF16 no cabe en ninguna GPU de consumo actual (24 GB o 48 GB). La model card no documenta cuantizaciones que permitan reducir el footprint, de modo que el despliegue en una sola RTX 4090 o similar no esta soportado por la informacion publicada.
- GPU de centro de datos mono-GPU: una A100 80 GB, H100 80 GB o H200 141 GB podrian alojar los pesos en BF16 en terminos de capacidad, pero el autor no valida ninguna configuracion de una sola GPU.
- Opciones de despliegue: SGLang es el unico runtime validado y el endpoint `/v1/systemone` forma parte de la configuracion de inferencia publicada. La biblioteca `transformers` esta declarada, pero la capa de lectura determinista, calibracion y conversion de esquema debe respetarse para obtener resultados reproducibles. Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles. El autor solo indica que la configuracion validada reserva una fraccion estatica de memoria de 0,85 para la cache KV.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| juspay/jev-one | 35,1B | ~3B | No disponible (prefill validado de 250.000 tokens) | Apache 2.0 | Decision tipada sobre endpoint `/v1/systemone` |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | ~3B | No disponible en la informacion | Apache 2.0 | Modelo generativo multimodal/texto del que deriva JevOne |
| Qwen3-30B-A3B | 30,5B | 3,3B | 128K nativo | Apache 2.0 | MoE generativo de proposito general con modo de razonamiento |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | MoE generativo de proposito general |

La comparacion de rendimiento no es posible: JevOne no publica benchmarks y su evaluacion depende de la capa de serving tipada, por lo que las metricas de los modelos generativos comparables no son directamente trasladables. La diferencia funcional principal es que JevOne no se ofrece como modelo de chat, sino como clasificador-decisor con contrato de salida fijo; en ese nicho, los comparables habituales serian modelos de clasificacion supervisada o cabezas de clasificacion sobre modelos base, para los que no se dispone de datos en esta busqueda.

## Limitaciones y advertencias

- Modelo de decision tipada, no un asistente conversacional: el uso fuera del contrato `/v1/systemone` puede producir resultados no reproducibles y no esta soportado.
- La capa de serving es parte de la configuracion de inferencia publicada; sustituirla o reimplementarla invalida la reproducibilidad declarada por el autor.
- No hay resultados de benchmarks publicados, ni del modelo ni de la calibracion de sus probabilidades, lo que impide estimar su calidad frente a alternativas.
- Idiomas soportados no documentados. Aunque el checkpoint base probablemente sea multilingue, no hay confirmacion para JevOne ni evaluacion por idioma.
- Riesgo de alucinacion: la model card no describe medidas de mitigacion, y en tareas de decision el fallo se manifiesta como eleccion erronea con probabilidad alta, no como texto incorrecto.
- Sesgos: no se documenta ninguna evaluacion de sesgo. Los sesgos del checkpoint base y del ajuste con datos propios de Juspay no son auditables con la informacion disponible.
- Dependencia del orden de opciones: el autor mitiga el sesgo posicional con evaluacion forward/reverse, lo que sugiere que dicho sesgo existe y debe seguir gestionandose en produccion.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; el modelo base tambien es Apache 2.0.
- Seguridad en despliegue: el servicio no requiere clave de API cuando se enlaza a localhost. Para despliegues remotos el autor exige anadir autenticacion, TLS, limites de tasa y limites de tamano de peticion en la capa de entrada.
- Coste de hardware elevado: la configuracion validada son dos GPU de 96 GB, y el autor advierte que su setup reserva memoria sustancial para la cache KV.
- Madurez del repositorio: el modelo registra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Consumo de contexto: el presupuesto de 250.000 tokens de prefill incrementa de forma notable el consumo de memoria de la cache KV y no equivale necesariamente a la ventana de contexto nativa del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/juspay/jev-one
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Imagen de SGLang validada (referencia en Docker Hub): `lmsysorg/sglang@sha256:6bcaa47db52f78ce0d67863b8b2431221b79bc23204a80cad757fa819d00e921`
- Repositorio de SGLang: https://github.com/sgl-project/sglang
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo. Los unicos resultados devueltos son hilos de foro en italiano sobre Poste ID y SPID, sin relacion con JevOne ni con inferencia de modelos de lenguaje.
