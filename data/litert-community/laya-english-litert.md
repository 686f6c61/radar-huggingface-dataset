# litert-community/Laya-English-LiteRT

## Resumen

Laya-English-LiteRT es el paquete en inglés del modelo Laya empaquetado para ejecutarse en GPU y NPU de teléfonos Android mediante LiteRT. Lo publica la organización litert-community y deriva directamente de convaiinnovations/laya, cuyo checkpoint inglés se basa en una arquitectura ModernBERT-large. El modelo no genera texto: lee un texto o un estado en JSON y responde a preguntas definidas en tiempo de petición, eligiendo entre varias opciones, puntuando en una escala ordinal o devolviendo una probabilidad de sí/no. Cada pregunta se resuelve con una pasada del grafo principal más una pasada de un grafo auxiliar pequeño, el act-head.

El problema que resuelve es la inferencia de clasificación y decisión estructurada completamente en el dispositivo, sin enviar datos a un servidor. El paquete incluye dos variantes: el checkpoint inglés propiamente dicho y un fine-tune denominado typed-decisions, orientado a cuatro flujos de trabajo concretos (atención al cliente, procesamiento de facturas, incidentes de seguridad y observabilidad de trazas de agentes). Los pesos se distribuyen como ficheros TFLite con ventanas de 256 o 512 tokens y en dos precisiones: fp16 para producción y fp32 como referencia.

Su relevancia actual está en que ofrece latencias de decenas de milisegundos por pregunta en hardware móvil de gama alta, con una fidelidad numérica verificada frente a la implementación oficial en CPU fp32. En una Samsung Galaxy S26 (SM-S942Q, Android 16) con LiteRT 2.2.0, el grafo inglés tarda 66 ms por pregunta en la NPU Hexagon y 123 ms en la GPU con cómputo FP32 explícito, a una ventana de 256 tokens. El repositorio ocupa 18,0 GB y acumula 294 descargas y 1 like en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer); derivado de convaiinnovations/laya |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 o 512 tokens, segun el grafo elegido (variantes s256 y s512) |
| Tipos de cuantizacion | pesos fp16 (wfp16) y fp32; act-head siempre en fp32 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite / LiteRT (.tflite); tabla de embeddings en .bin float16 |
| Tamano de vocabulario | 50.368 tokens (tabla de embeddings [50368, 1024] float16) |
| Dimension oculta | 1.024 (segun la forma de la tabla de embeddings) |
| Libreria de inferencia | LiteRT (litert), validado con LiteRT 2.2.0 CompiledModel |
| Tamano del repositorio | 18,0 GB |
| Descargas / likes | 294 / 1 |

## Arquitectura y entrenamiento

La informacion disponible no detalla el proceso de entrenamiento, el numero de tokens ni la composicion del dataset. Lo que si se especifica es la arquitectura de despliegue: cada checkpoint se compila en varios grafos TFLite independientes. El grafo principal procesa la secuencia de entrada (256 o 512 tokens) y el act-head, un grafo adicional de 1.057.960 bytes, realiza una segunda pasada que produce la respuesta. La tabla de embeddings de tokens ([50368, 1024] en float16, 103.153.664 bytes) se entrega como fichero aparte y la aplicacion realiza la busqueda de filas antes de alimentar el grafo.

El paquete incluye el fichero `laya_en_config.json` (745 bytes), que corresponde al `rl_agent_config.json` del checkpoint original y define las temperaturas y los presupuestos del constructor de prompts. Tambien se distribuye `laya_host.py` (22.933 bytes), un host de referencia en Python que implementa el constructor de prompt, la busqueda de embeddings y el decodificador, ademas de `HOST_CONTRACT.md` en el paquete hermano laya-LiteRT, que especifica la secuencia y la decodificacion para portar el modelo. No se mencionan tecnicas como RLHF, DPO, decodificacion especulativa ni atencion lineal en la informacion proporcionada.

## Capacidades

- Clasificacion de texto y clasificacion zero-shot: el modelo responde a preguntas definidas en tiempo de peticion sin reentrenamiento.
- Seleccion entre opciones: elige una opcion entre varias candidatas (mismo argmax que la implementacion de referencia en las 140 filas de validacion en ingles y las 100 de typed-decisions).
- Puntuacion ordinal: devuelve una puntuacion en una escala ordenada.
- Probabilidad binaria: genera una probabilidad de si/no para una pregunta dada.
- Entrada multimodal de texto: acepta tanto texto libre como un estado en formato JSON.
- Fine-tune de decisiones tipadas (typed-decisions) para cuatro flujos: atencion al cliente, procesamiento de facturas, incidentes de seguridad y observabilidad de trazas de agentes.
- Ejecucion en el dispositivo: inferencia en GPU y NPU de Android mediante LiteRT 2.2.0, y en CPU de escritorio a traves de `laya_host.py`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Atencion al cliente automatizada: el grafo typed-decisions incluye un flujo especifico de customer service que puede clasificar y enrutar mensajes entrantes en el propio dispositivo, con 73 ms por pregunta en la NPU y 66 ms en el grafo ingles, lo que permite respuestas interactivas sin ida y vuelta al servidor.
- Procesamiento de facturas: el fine-tune typed-decisions incorpora un flujo de invoice processing para extraer decisiones estructuradas de documentos, manteniendo los datos financieros en el telefono y evitando su envio a la nube.
- Triaje de incidentes de seguridad: el flujo de security incidents permite clasificar y priorizar alertas localmente, util cuando el contenido analizado es sensible y no debe salir del dispositivo.
- Observabilidad de trazas de agentes: el cuarto flujo del fine-tune esta pensado para inspeccionar trazas de agentes, lo que permite etiquetar o evaluar pasos de un pipeline de IA en el borde.
- Clasificacion zero-shot en aplicaciones Android: cualquier app puede formular preguntas nuevas en tiempo de peticion sobre texto del usuario (por ejemplo, categorizar notas o comentarios) sin reentrenar, apoyandose en los grafos de 256 o 512 tokens.
- Filtrado y moderacion de contenido offline: dado que la inferencia ocurre en GPU o NPU locales con pesos de 0,85 GB por checkpoint, se puede desplegar como filtro previo en aplicaciones que deben funcionar sin conectividad.
- Encuestas y puntuacion ordinal: el modelo puede asignar puntuaciones en escalas ordenadas (por ejemplo, satisfaccion o nivel de riesgo) con una simple pasada por pregunta.
- Validacion en escritorio y CI: `laya_host.py` y `fixtures/gate_rows_en_s256.json` (140 filas con respuestas de referencia) permiten reproducir las comprobaciones de fidelidad en CPU fp32 antes de empaquetar la aplicacion movil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos numericos publicados son de validacion funcional, fidelidad y latencia.

| Metrica | Valor |
|---|---|
| XNLI ingles (checkpoint ingles) | 0.860 |
| XNLI ingles (checkpoint multilingue, referencia de la comparativa) | 0.843 |
| Filas de validacion en ingles | 140 |
| Filas de validacion typed-decisions | 100 |
| Coincidencia de argmax frente a laya 0.3.4 fp32 CPU | total en todas las preguntas de eleccion y puntuacion |
| Diferencia maxima de probabilidad en GPU | 0.0008 |
| Diferencia maxima de probabilidad en NPU | 0.0072 |

Latencia medida en Samsung Galaxy S26 (SM-S942Q, Android 16), LiteRT 2.2.0, ventana de 256 tokens, tiempo de grafo por pregunta:

| Grafo | NPU Hexagon | GPU (FP32 explicito) |
|---|---:|---:|
| Ingles | 66 ms | 123 ms |
| typed-decisions | 73 ms | 126 ms |

## Requisitos de hardware

- Inferencia en dispositivo movil: validada con LiteRT 2.2.0 `CompiledModel` en una Samsung Galaxy S26 (SM-S942Q, Android 16), tanto en NPU Hexagon como en GPU. Otras GPU y NPU Android no han sido validadas segun la model card.
- Huella en el telefono: 0,85 GB por checkpoint (ingles y typed-decisions), segun la comparativa publicada.
- Tamano de los ficheros TFLite: 739.765.104 bytes (s256 wfp16), 740.813.680 bytes (s512 wfp16), 1.478.482.924 bytes (s256 fp32) y 1.479.531.500 bytes (s512 fp32) por cada variante. El act-head anade 1.057.960 bytes y la tabla de embeddings 103.153.664 bytes, con lo que el paquete completo fp32 aproxima los 1,48 GB por grafo mas la tabla.
- CPU de escritorio: se puede ejecutar mediante `laya_host.py` en CPU, sin requisitos de GPU documentados. Las cifras de latencia publicadas para escritorio solo se presentan como grafo S256 wfp16 sin tiempos concretos.
- VRAM en GPU de servidor: no disponible, ya que el modelo esta empaquetado para LiteRT en Android y no se documenta despliegue en A100, H100 o RTX 4090.
- Opciones de despliegue: LiteRT `CompiledModel` (GPU y NPU Android) y el host de referencia en Python. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: 66 ms por pregunta (ingles) y 73 ms (typed-decisions) en NPU; 123 ms y 126 ms en GPU. La comparativa entre paquetes anade que la primera pasada incluye una busqueda de tabla de unos 15 a 20 ms en la aplicacion.

## Comparativa con modelos similares

La model card compara los tres paquetes Laya publicados por litert-community:

| Paquete | Modelo base | Huella | Latencia por pregunta | Idiomas | App propia | Licencia |
|---|---|---:|---:|---|---|---|
| Laya-English-LiteRT | ModernBERT-large (checkpoint ingles) + fine-tune typed-decisions | 0,85 GB por checkpoint | 123 ms GPU / 66 ms NPU (126 / 73 ms el fine-tune) | en | No | Apache 2.0 |
| Laya-Multilingual-LiteRT | mmBERT-base | 0,68 GB | 51 ms GPU | 100+ idiomas (validado en ingles y japones) | Si, con tokenizador Kotlin | no disponible en la informacion |
| laya-LiteRT | mismos dos checkpoints, en forma de token ids | 1,7 GB (ingles) o 1,3 GB (multilingue) en fp32 | 127 ms (ingles) o 54 ms (multilingue) | en / multilingue segun checkpoint | No, incluye `laya_host.py` | no disponible en la informacion |

Comparativa de rendimiento entre checkpoints: el checkpoint ingles obtiene 0.860 en XNLI ingles frente a 0.843 del multilingue, por lo que se recomienda el paquete ingles cuando el texto es exclusivamente en ingles. No se proporcionan comparaciones con modelos externos de la misma categoria.

## Limitaciones y advertencias

- Modelo exclusivamente de clasificacion y decision: no genera texto libre ni mantiene conversaciones; solo responde a preguntas definidas en tiempo de peticion.
- Solo ingles: el paquete esta entrenado y validado unicamente para `en`. Para texto en otros idiomas o mixto se indica el paquete multilingue.
- Cobertura de hardware limitada: la validacion se restringe a una Samsung Galaxy S26 (SM-S942Q, Android 16) con LiteRT 2.2.0. Otras GPU y NPU Android no han sido validadas, por lo que el rendimiento y la correccion numerica en otros dispositivos no estan garantizados.
- Deriva numerica en precision reducida: la diferencia maxima de probabilidad frente a la referencia fp32 es de 0.0008 en GPU y 0.0072 en NPU; el argmax coincide en las filas de validacion, pero no se garantiza para entradas fuera de ese conjunto.
- Requiere integracion adicional: el paquete no incluye aplicacion propia. Es necesario aportar un tokenizador en la app y realizar la busqueda de filas de la tabla de embeddings antes de llamar al grafo.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion incorrecta o de puntuaciones mal calibradas fuera de la distribucion de entrenamiento. No se publican datos sobre sesgos.
- Restricciones de licencia: Apache 2.0, lo que permite uso comercial, pero conviene revisar las condiciones del modelo base convaiinnovations/laya, del que este paquete es un derivado.
- Sin datos de entrenamiento publicados: no se documentan tokens, composicion del dataset ni tecnicas de alineamiento, lo que dificulta auditar sesgos o dominios cubiertos.

## Enlaces

- HuggingFace (este paquete): https://huggingface.co/litert-community/Laya-English-LiteRT
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Paquete multilingue: https://huggingface.co/litert-community/Laya-Multilingual-LiteRT
- Paquete en forma de token ids (incluye `HOST_CONTRACT.md`): https://huggingface.co/litert-community/laya-LiteRT
- LiteRT (repositorio): https://github.com/google-ai-edge/litert
- Ejemplo de clasificacion zero-shot en litert-samples: https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert/zero_shot_classification
