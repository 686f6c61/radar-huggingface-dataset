# FluidInference/d3-coreml

## Resumen

Decision 3.0 Core ML es la conversión a Core ML del modelo Decision 3.0 del equipo vLLM Semantic Router, empaquetada por FluidInference para ejecución en dispositivos con Apple silicon. No se trata de un modelo generativo: es un modelo de decisión que realiza una única pasada forward por pregunta y devuelve una lectura FP32 de 255 vías en el último token del prompt, con una probabilidad para cada opción y sin generar texto. Puede procesar entradas de texto, imagen y vídeo.

El repositorio incluye tres variantes completas con sus propias grafos de texto, torre de visión, tablas de host y host de Python: lite (0,8B, basada en vllm-sr/d3-lite), nano (2B, basada en vllm-sr/d3-nano) y mini (4B, basada en vllm-sr/d3-mini). El pipeline declarado es zero-shot-classification y la licencia es Apache-2.0, la misma que la de los modelos upstream.

Su relevancia radica en que traslada un modelo de enrutamiento y clasificación a inferencia local en Mac, iPhone o iPad mediante Core ML y el Apple Neural Engine, evitando el coste y la latencia de un servicio remoto. El repositorio ocupa 27,8 GB y está pensado para cargarse desde Swift a través de `D3VisionManager` en el framework FluidUse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con torre de vision, convertido a Core ML (grafos de texto + torre de vision + tablas de host) |
| Parametros totales | 0,8B (lite), 2B (nano), 4B (mini) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tag de HuggingFace referencia base_model:quantized:vllm-sr/d3-lite, sin detalle de esquema) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (paquete Core ML, no safetensors ni GGUF) |
| Salida | Lectura FP32 de 255 vias en el ultimo token del prompt, con probabilidad por opcion |
| Modalidades de entrada | Texto, imagen y video |
| Tamano del repositorio | 27,8 GB |
| Libreria | coreml |

## Arquitectura y entrenamiento

La model card describe cada carpeta (lite, nano y mini) como una release completa compuesta por los grafos de texto, la torre de visión, las tablas de host y un host en Python. La arquitectura subyacente es un transformer con componente de visión, convertido desde los modelos upstream de la familia Decision 3.0, que a su vez proceden de los modelos vllm-sr/d3-lite, vllm-sr/d3-nano y vllm-sr/d3-mini. El contrato de inferencia es idéntico al de los modelos originales: una única pasada forward por cuestión.

El modelo no genera texto, sino que produce una readout de 255 vías en FP32 en la última posición del prompt, devolviendo una distribución de probabilidad sobre las opciones candidatas. La conversión a Core ML busca aprovechar el hardware de Apple silicon para ejecutar tareas de clasificación, etiquetado y enrutamiento de forma local. No se proporcionan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de RLHF o DPO. La model card tampoco documenta innovaciones técnicas adicionales como decodificación especulativa o atención lineal, más allá de la propia conversión a Core ML.

## Capacidades

- Clasificacion zero-shot: asignacion de probabilidades a 255 opciones candidatas para una pregunta dada.
- Procesamiento de texto: enrutamiento y decision sobre peticiones en lenguaje natural.
- Procesamiento de imagen: clasificacion y etiquetado de entradas visuales mediante la torre de vision.
- Procesamiento de video: manejo de peticiones sobre secuencias de video.
- Modelo de decision sin generacion: no produce texto, solo una distribucion de probabilidad por opcion.
- Inferencia en dispositivo: ejecucion local en Apple silicon a traves de Core ML.
- Integracion con Swift: carga mediante `D3VisionManager` del framework FluidUse.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking / vision / audio: se documenta vision y video; modo thinking y audio no disponibles.

## Casos de uso

- Enrutamiento semantico de peticiones a modelos de lenguaje: el modelo puede actuar como router local que, dado un prompt, decida a que modelo o experto derivarlo usando las 255 opciones de salida, reduciendo la latencia frente a un servicio de clasificación remoto.
- Clasificacion zero-shot de imagenes en aplicaciones iOS y macOS: al incluir torre de visión, permite etiquetar imágenes del carrete o de una cámara sin necesidad de definir clases a priori ni salir del dispositivo.
- Moderacion de contenido visual y de video en local: con entrada de video, puede asignar probabilidades a categorías de contenido para filtrar material antes de subirlo a un servicio, preservando la privacidad del usuario.
- Organizacion automatica de fototeca: la app puede clasificar fotos y videos por escena o temática usando el modelo en el dispositivo, evitando costes de cómputo en la nube.
- Gateway de decisión para pipelines multimodales: en una arquitectura con varios modelos especializados, este modelo decide qué rama activar para cada petición de texto, imagen o video.
- Preprocesado de agentes en el borde: antes de invocar un LLM grande, el modelo filtra o clasifica la intención del usuario y descarta peticiones fuera de alcance, reduciendo llamadas innecesarias.
- Enrutamiento de peticiones en asistentes de voz sobre Apple silicon: combinado con un motor de reconocimiento de voz, permite decidir la categoría de la consulta y desviarla al backend adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma objetivo: Apple silicon (Mac, iPhone, iPad) mediante Core ML y el Apple Neural Engine; los modelos no están pensados para GPU de servidor con CUDA.
- Huella de memoria estimada a FP16 según número de parámetros: aproximadamente 1,6 GB para lite (0,8B), 4 GB para nano (2B) y 8 GB para mini (4B), sin contar la torre de visión, las tablas de host y el resto de artefactos del paquete Core ML.
- El repositorio completo suma 27,8 GB, pero solo es necesario descargar la carpeta de la variante que se vaya a usar.
- GPU A100, H100 o RTX 4090: no aplicable, al ser un formato Core ML orientado a Apple silicon.
- Despliegue: Core ML y el framework Swift FluidUse, que carga cualquiera de las tres variantes mediante `D3VisionManager`.
- Servidores de inferencia como vLLM, llama.cpp, Ollama o TGI: no aplicables al formato Core ML; los modelos upstream de la familia Decision 3.0 sí están pensados para ejecutarse en vLLM según el nombre del equipo que los publica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables de terceros en la información proporcionada. La única comparación posible es entre las tres variantes incluidas en el propio repositorio:

| Variante | Parametros | Modelo upstream | Carpeta |
|---|---|---|---|
| lite | 0,8B | vllm-sr/d3-lite | lite/ |
| nano | 2B | vllm-sr/d3-nano | nano/ |
| mini | 4B | vllm-sr/d3-mini | mini/ |

Las tres comparten formato Core ML, licencia Apache-2.0, contrato de inferencia (una pasada forward, readout de 255 vías) y soporte de texto, imagen y video. Los datos de rendimiento comparativo entre ellas no están disponibles en la información consultada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, solo una distribución de probabilidad sobre 255 opciones.
- La longitud de contexto no está documentada, por lo que no puede asumirse una ventana larga para prompts extensos.
- No se declaran idiomas soportados, lo que impide garantizar cobertura multilingüe.
- No hay resultados de benchmarks publicados, de modo que el rendimiento real frente a alternativas no puede validarse con datos.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- Al ser un clasificador, existe riesgo de asignar probabilidad alta a opciones incorrectas cuando la entrada queda fuera de la distribución de entrenamiento.
- El formato Core ML limita el despliegue a Apple silicon; no es portable directamente a GPUs NVIDIA ni a servidores Linux convencionales.
- La licencia Apache-2.0 permite uso comercial, pero se hereda la condición de los modelos upstream, que debería verificarse de forma independiente.
- El repositorio ocupa 27,8 GB, lo que implica un coste de descarga y almacenamiento relevante si se quieren probar las tres variantes.
- No se documentan requisitos mínimos de versión de Core ML ni de sistema operativo, lo que puede afectar a la compatibilidad en dispositivos antiguos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/d3-coreml
- Coleccion Decision 3.0: https://huggingface.co/collections/vllm-sr/decision-30
- Modelo upstream d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Modelo upstream d3-nano: https://huggingface.co/vllm-sr/d3-nano
- Modelo upstream d3-mini: https://huggingface.co/vllm-sr/d3-mini
- Framework Swift FluidUse: https://github.com/FluidInference/FluidUse
