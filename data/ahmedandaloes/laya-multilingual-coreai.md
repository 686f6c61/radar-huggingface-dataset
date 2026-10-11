# ahmedandaloes/laya-multilingual-CoreAI

## Resumen

laya-multilingual-CoreAI es una conversion comunitaria del modelo convaiinnovations/laya-multilingual a un paquete Apple Core AI (`.aimodel`), ejecutable en macOS 27 sobre Apple Silicon. La publica el usuario ahmedandaloes y no es una version oficial ni de Apple ni de Convai.

No es un modelo generativo. Laya es un modelo de decision no autorregresivo, de tipo System 1: recibe un estado y un conjunto de preguntas tipadas y devuelve respuestas tipadas con probabilidades calibradas en una sola pasada forward. Nunca produce texto. Esa forma encaja en una grafica de Core AI como un unico programa exportado (`DecisionModel.forward`), sin cache KV ni bucle de decodificacion.

Su relevancia esta en permitir ejecutar el forward completo de Laya dentro del runtime Core AI de Apple en hardware Apple Silicon. El repositorio ocupa 1,3 GB, mantiene los pesos originales en FP32 sin cuantizar y fija la grafica en 1024 tokens y 256 marcadores de opcion. Se desconoce la licencia y no se listan idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Forward no autorregresivo compuesto por encoder + cabeza tipada + scorer + cabeza act; arquitectura interna del modelo base: no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens con 256 marcadores de opcion, grafica de forma fija; una peticion que no cabe lanza `CapacityError` sin truncado silencioso |
| Tipos de cuantizacion | ninguno; pesos originales en FP32 (encoder y cabeza de decision) |
| Idiomas soportados | no disponible (el nombre del modelo base incluye "multilingual", pero no se enumeran idiomas) |
| Licencia | no disponible |
| Formato de pesos | paquete `.aimodel` de Apple Core AI, acompanado de ficheros host (`tokenizer/`, `config.json`, `encoder/config.json`, `rl_agent_config.json`) |
| Tamano del repositorio | 1,3 GB |
| Runtime de destino | Core AI en macOS 27 sobre Apple Silicon |
| Modelo base | convaiinnovations/laya-multilingual (relacion: quantized, segun metadatos del repo) |

## Arquitectura y entrenamiento

La conversion exporta el forward completo de Laya como un unico programa de Core AI: encoder, cabeza tipada, scorer y cabeza act. El modelo no usa atencion autorregresiva ni decodificacion: resuelve cada peticion en una sola pasada forward, sin cache KV. Las entradas host son tensores int32 (el tipo entero del runtime de Core AI) y la mascara de marcadores es bool. La tokenizacion, la normalizacion de preguntas y la decodificacion de respuestas se delegan al paquete `laya`, de modo que los prompts son identicos byte a byte a los de la ruta PyTorch. Se procesa una peticion por pasada forward, con padding a la grafica fija de 1024 tokens y 256 marcadores.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF o DPO en la informacion disponible. Tampoco se detalla si el encoder subyacente es un transformer u otra familia arquitectonica. Respecto a la conversion, el autor reporta una medicion de deriva numerica frente al forward eager de PyTorch del propio paquete `laya`, alimentado con los mismos tensores y construido con `build_sequence`: en 6 casos (tipos choice, noul y score) todas las respuestas seleccionadas coincidieron y la mayor diferencia absoluta de probabilidad fue 0,000000. Esa cifra mide unicamente la deriva de la conversion, no la exactitud ni la calibracion de Laya. La cabeza act se exporta, pero el propio autor advierte que su senal aun no es utilizable (issue #185), por lo que `act_logits` no deberia usarse para decisiones.

## Capacidades

- Decision tipada en una sola pasada forward: responde preguntas de tipo `choice`, `noul` y `score`, segun los casos de validacion incluidos.
- Salida con probabilidades calibradas por opcion, no texto generado.
- Clasificacion por criterios: permite definir opciones con instrucciones y criterios descriptivos (por ejemplo, enrutar a "billing" o "technical").
- Normalizacion de preguntas y decodificacion de respuestas mediante el paquete `laya`, con prompts identicos a la ruta PyTorch.
- Capacidad multilingue: no confirmada en la informacion disponible (solo sugerida por el nombre del modelo base).
- Tool calling o function calling: no declarado.
- Soporte de agentes y razonamiento multi-paso: no declarado; el modelo es de un solo salto (System 1).
- Procesamiento por lotes: no soportado; se indica una peticion por pasada forward.
- Modo "thinking": no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Enrutado de tickets de soporte: con un estado (el texto del ticket) y una pregunta de tipo `choice` con criterios por departamento, el modelo devuelve el area responsable y su probabilidad. Es el ejemplo incluido en la propia model card (facturacion frente a tecnico).
- Clasificacion de intenciones en asistentes conversacionales: asignar la intencion del usuario a una de N opciones tipadas antes de derivar a un generador de texto, aprovechando que la decision se resuelve en una sola pasada.
- Triaje y priorizacion: usar preguntas de tipo `score` para puntuar urgencia o riesgo de un caso y ordenar una cola de atencion, con la probabilidad como medida de confianza.
- Moderacion o etiquetado de contenido: clasificar textos en categorias predefinidas con criterios explicitos, con la ventaja de que la salida es una opcion acotada y no texto libre.
- Scoring de leads o de riesgo: obtener una puntuacion calibrada por registro en procesos por lotes donde la latencia del bucle de decodificacion no es aceptable.
- Decisiones de baja latencia en dispositivo: al ejecutarse sobre Core AI en Apple Silicon y no requerir cache KV ni bucle autorregresivo, encaja en flujos locales donde el coste por decision debe ser minimo.
- Componente System 1 dentro de un agente mayor: resolver decisiones cerradas (que herramienta, que ruta, que categoria) y delegar la generacion de texto a un modelo aparte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato numerico aportado es una medicion de deriva de la conversion, que no constituye un benchmark de calidad:

| Medicion | Valor |
|---|---|
| Casos evaluados (choice, noul, score) | 6 |
| Respuestas seleccionadas coincidentes | todas (True) |
| Mayor diferencia absoluta de probabilidad | 0,000000 |
| Referencia de comparacion | Forward eager de PyTorch del paquete `laya`, con los mismos tensores via `build_sequence` |

## Requisitos de hardware

- Plataforma: Apple Silicon con macOS 27. No se indica soporte para otras plataformas.
- Memoria: no se publican cifras de VRAM ni de memoria unificada. El repositorio ocupa 1,3 GB y los pesos estan en FP32, sin cuantizar.
- GPU: no se especifican modelos (A100, H100, RTX 4090 u otros). La conversion esta pensada para el runtime Core AI en Apple Silicon, no para GPU NVIDIA.
- Consumer GPU: no disponible; no aplica en el formato `.aimodel`.
- Opciones de despliegue: ejecucion mediante Core AI en macOS 27. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos no es GGUF ni safetensors.
- Herramientas de conversion: coreai-core 1.0.0b3 y coreai-torch 0.4.3, sobre macOS 27.0.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se ofrecen modelos comparables de la misma categoria. El unico punto de referencia es el propio modelo base convaiinnovations/laya-multilingual en su ruta PyTorch, frente al cual esta conversion busca paridad numerica (deriva medida de 0,000000 en 6 casos) manteniendo la misma tokenizacion y normalizacion.

## Limitaciones y advertencias

- Capacidad fija: la grafica esta limitada a 1024 tokens y 256 marcadores de opcion. Una peticion que exceda ese limite lanza `CapacityError`; no hay truncado silencioso, lo que obliga a controlar el tamano en produccion.
- No genera texto: cualquier caso de uso que requiera salida libre queda fuera del alcance del modelo.
- Cabeza act no fiable: el autor advierte que la senal de `act_logits` no es utilizable todavia (issue #185) y que no debe usarse como criterio de decision.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es un riesgo directo para produccion.
- Conversion no oficial: no es un lanzamiento de Apple ni de Convai, y no hay validacion independiente.
- Adopcion nula en el momento del registro: 0 descargas y 0 me gusta, sin senales de uso en comunidad.
- Idiomas no especificados: pese al nombre "multilingual" del modelo base, no se enumeran idiomas soportados ni su cobertura real.
- Calibracion no evaluada: la medicion de 0,000000 corresponde solo a la deriva de la conversion; no hay datos sobre exactitud, calibracion, sesgos ni tasa de error del modelo.
- Sin procesamiento por lotes: una peticion por pasada forward, lo que limita el throughput en escenarios de alto volumen.
- Dependencia de plataforma: requiere macOS 27 y Apple Silicon, con la version concreta del runtime Core AI usada en la conversion.
- Datos de entrenamiento desconocidos: al no disponer de informacion sobre el dataset del modelo base, no se pueden anticipar sesgos ni dominios mal cubiertos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedandaloes/laya-multilingual-CoreAI
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Issue #185 del modelo base, citada en la model card como motivo para no usar `act_logits`: no disponible (sin URL en la informacion proporcionada)
- Paper, blog o repositorio adicionales: no disponibles
