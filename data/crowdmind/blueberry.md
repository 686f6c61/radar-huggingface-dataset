# CrowdMind/Blueberry

## Resumen

Blueberry es un modelo de lenguaje decoder-only de 125,8 millones de parametros desarrollado por Dustin Loring (CrowdMind). Se trata de un checkpoint de ajuste fino supervisado (SFT) para conversacion, obtenido a partir de Blueberry-base tras 1.867 pasos de entrenamiento. Su interes tecnico no reside en el tamano, sino en la arquitectura: ocho bloques Transformer distintos en los que los cuatro centrales se ejecutan tres veces con pesos compartidos, dando lugar a 16 ejecuciones de bloque efectivas. En cada frontera del bucle, una compuerta aprendida por token mezcla el estado de entrada con el de la pasada anterior.

El modelo esta pensado como ejercicio de investigacion sobre profundidad recurrente en modelos pequenos, no como un asistente de produccion. La ventana de contexto de entrenamiento es de 2.048 tokens, muy corta para los estandares actuales, y el modelo requiere `trust_remote_code=True` porque incorpora implementacion propia en el repositorio. El checkpoint registra una perdida de validacion de 0,4138 bits por byte en esta etapa.

Es relevante ahora por dos motivos: por un lado, se enmarca en la linea de trabajo sobre weight sharing y recurrencia en Transformers iniciada por Universal Transformers y continuada por aproximaciones como las de NanoChat; por otro, demuestra que un modelo de 125 M puede entrenarse con infraestructura modesta y publicarse con codigo abierto. La model card es extremadamente escueta: no declara licencia, idiomas ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con profundidad recurrente (8 bloques distintos, 4 centrales repetidos 3 veces, 16 ejecuciones de bloque) |
| Parametros totales | 125.830.379 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,5 GB) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only con recurrencia por capas. El modelo define ocho bloques Transformer independientes; los cuatro centrales se ejecutan tres veces cada uno reutilizando los mismos pesos, lo que resulta en 16 ejecuciones de bloque en total. En cada frontera del bucle, una compuerta aprendida por token combina linealmente el estado que entra al bloque con el estado de la pasada anterior, permitiendo que la red module cuanto del calculo previo se propaga hacia adelante. Este esquema aumenta la profundidad efectiva sin incrementar el numero de parametros, a costa de mas computo por token.

El checkpoint publicado es la fase de ajuste fino supervisado (SFT) del modelo base Blueberry-base, detenido en el paso 1.867. La perdida de validacion registrada en esta etapa es de 0,4138 bits por byte. No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El codigo de entrenamiento esta en el repositorio del proyecto Blueberry, que se apoya en NanoChat de Andrej Karpathy. Se requiere Transformers 5.24.0 o superior y `trust_remote_code=True` para cargar la implementacion custom.

## Capacidades

- Generacion de texto autoregresiva con plantilla de chat (`apply_chat_template`) y formato conversacional multi-turno.
- Conversacion basica en formato user/assistant, tal como se muestra en la model card.
- Razonamiento de un solo paso sobre preguntas simples; la model card no documenta capacidades de razonamiento multi-paso.
- No hay evidencia de soporte de tool calling o function calling.
- No hay evidencia de modo thinking, vision, audio ni otras modalidades.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidades de codigo y matematicas: no documentadas en la informacion disponible.

## Casos de uso

- Investigacion sobre profundidad recurrente: el modelo permite experimentar con weight sharing y compuertas de mezcla por token en un entorno de 125 M parametros, lo que facilita iterar sobre variantes arquitectonicas sin grandes presupuestos de computo.
- Reproduccion de experimentos de NanoChat: sirve como punto de partida para comparar el efecto de la recurrencia frente a un Transformer denso de parametros equivalentes, usando el codigo de entrenamiento publicado.
- Prototipado de interfaces conversacionales: con 2.048 tokens de contexto y formato de chat, puede usarse para validar pipelines de inferencia y plantillas de prompt antes de migrar a modelos mayores.
- Educacion y docencia: el tamano (0,5 GB) y la implementacion custom lo hacen adecuado para explicar mecanismos de atencion, bucles de profundidad y compuertas en cursos de aprendizaje profundo.
- Pruebas de infraestructura de despliegue: util como modelo de juguete para probar integraciones con Transformers, serializacion safetensors y carga con codigo remoto en entornos controlados.
- Generacion de texto acotada sin requisitos de calidad alta: respuestas cortas, resumenes de frases o continuaciones breves en aplicaciones internas donde la precision no es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado es la perdida de validacion de 0,4138 bits por byte en la etapa SFT (paso 1.867).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos mas overhead de activaciones; en la practica, cabe sobradamente en cualquier GPU consumer con 4 GB o mas.
- En bf16/fp16: alrededor de 0,25 GB de pesos, aunque no se documenta oficialmente soporte de estas precisiones.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien A100/H100, aunque estaran infrautilizadas.
- Cabe en CPU: el modelo es lo bastante pequeno para ejecutarse en CPU con latencia aceptable para generacion corta.
- Opciones de despliegue: Transformers con `trust_remote_code=True`. No hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI, ya que la arquitectura custom y la ausencia de pesos GGUF lo hacen improbable sin conversion manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Blueberry (CrowdMind) | 125,8 M | 2.048 | no disponible | Hugging Face, safetensors | Transformer recurrente con pesos compartidos |
| GPT-2 small | 124 M | 1.024 | MIT | Hugging Face, multiples formatos | Transformer denso clasico, ampliamente soportado |
| SmolLM-135M | 135 M | 8.192 | Apache 2.0 | Hugging Face, GGUF, vLLM | Transformer denso moderno, entrenado a mayor escala |
| Pythia-160M | 160 M | 2.048 | Apache 2.0 | Hugging Face | Transformer denso con checkpoints intermedios publicados |

La comparativa se limita a tamano y contexto: no hay datos de benchmarks de Blueberry que permitan contrastar calidad. Frente a GPT-2 small comparte orden de magnitud de parametros, pero Blueberry introduce recurrencia y compuertas; frente a SmolLM-135M y Pythia-160M, Blueberry ofrece un contexto mucho menor y carece de la documentacion y el ecosistema de despliegue de estos.

## Limitaciones y advertencias

- Modelo pequeno: la propia model card advierte que puede generar texto inexacto o sesgado.
- Riesgo de alucinacion elevado, especialmente fuera de tareas simples y con prompts largos.
- Contexto de solo 2.048 tokens, insuficiente para documentos extensos, conversaciones largas o RAG con muchos fragmentos.
- Idiomas soportados no declarados; no hay garantia de calidad fuera del ingles y no hay evaluacion multilingue publicada.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar al autor antes de cualquier despliegue productivo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar la implementacion antes de usarla.
- Dependencia de Transformers 5.24.0, version muy reciente; puede haber incompatibilidades con entornos existentes.
- Sin soporte documentado de tool calling, agentes ni modos de razonamiento; no apto para pipelines agenticos.
- Sin datos publicados sobre composicion del dataset de entrenamiento, lo que impide evaluar sesgos de origen y contaminacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CrowdMind/Blueberry
- Modelo base: https://huggingface.co/CrowdMind/Blueberry-base
- Repositorio del proyecto Blueberry: https://github.com/blueberry-llm/blueberry
- NanoChat (Karpathy), base del codigo de entrenamiento: https://github.com/karpathy/nanochat
- Contacto del autor: dustinwloring1988@gmail.com
