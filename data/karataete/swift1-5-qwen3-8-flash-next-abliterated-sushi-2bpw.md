# Karataete/swift1.5-qwen3.8-flash-next-abliterated-sushi-2bpw

## Resumen

Swift 1.5 Qwen3.8-Flash-Next es un ajuste fino (finetune) del modelo base Qwen/Qwen3.8-Flash-Next, desarrollado por UkisAI y publicado en Hugging Face por el usuario Karataete bajo el identificador `swift1.5-qwen3.8-flash-next-abliterated-sushi-2bpw`. El modelo resuelve un problema concreto: el sobre-razonamiento (overthinking) de los modelos de razonamiento, que genera trazas de pensamiento innecesariamente largas y encarece la inferencia. Segun la model card, reduce el consumo de tokens de pensamiento en un 63,4% y ofrece una aceleracion de 1,8x manteniendo una perdida de precision inferior al 1% frente al base en configuracion xhigh.

La relevancia actual del modelo radica en su orientacion hacia eficiencia de tokens y cargas de trabajo agente (uso de terminal, ingenieria de software, agentes personales). Se distribuye como variante cuantizada en 8 bits (el autor indica "2bpw" en el nombre del repositorio, aunque el tag declara 8-bit) y esta marcado como gated. La arquitectura es MoE (mezcla de expertos) segun los tags, con 26.922.385.299 parametros totales confirmados por los safetensors, y pipeline image-text-to-text, lo que implica capacidades multimodales de entrada.

El nombre del repositorio incluye el termino "abliterated", que en la practica de la comunidad indica que se han eliminado o atenuado direcciones de rechazo en los pesos, con implicaciones eticas y de seguridad que deben considerarse antes de cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), transformer (segun tags) |
| Parametros totales | 26.922.385.299 (26,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (tag); repositorio etiquetado como "2bpw" en el nombre; existen variantes GGUF y GSQ-RCO GGUF del modelo base Swift 1.5 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (licencia "other", enlazada al repositorio ukisai/Swift-Qwen3.8-Flash-Next) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-Flash-Next, un transformer con arquitectura MoE segun los tags del repositorio. El ajuste fino de UkisAI se centra en eficiencia de razonamiento: segun la model card, identificaron que tokens estaban asociados a sobre-razonamiento patologico y los penalizaron sin atacar directamente la longitud del razonamiento, recuperando despues la precision mediante RL y OPD (on-policy distillation, presumiblemente). El resultado son trazas de razonamiento mas cortas y, segun el autor, menos errores por sobre-razonamiento.

El dataset de entrenamiento declarado es `ukisai/Qwen3.8-27B-multi-turn-agent-sft`, que el autor describe como material re-muestreado y convertido en entornos de RL, no usado tal cual. El post-entrenamiento esta adaptado especificamente a programacion y trabajo agente de horizonte largo (agentes personales, uso de terminal, ingenieria de software). No se especifican numero de tokens de entrenamiento, composicion detallada del dataset ni si hubo RLHF/DPO mas alla de la mencion generica a RL y OPD.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento comprimido (efficient-thinking, token-efficient).
- Razonamiento multi-paso y capacidad agente (agentic), con soporte declarado para terminal-bench.
- Entrada multimodal imagen-texto (pipeline image-text-to-text).
- Generacion de codigo y tareas de ingenieria de software de horizonte largo.
- Post-entrenamiento orientado a conversacion multi-turno (dataset multi-turn agent SFT).
- Soporte de tool calling / function calling: no declarado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Capacidades de audio: no disponibles.

## Casos de uso

- Desarrollo de videojuegos y prototipos interactivos: la demo oficial muestra la generacion de un endless runner 3D jugable localmente; el modelo completo la tarea en 4 minutos 56 segundos frente a 8 minutos 52 segundos del base, lo que lo hace adecuado para iteracion rapida en prototipado de juegos.
- Agentes de terminal y automatizacion de shell: el post-entrenamiento esta adaptado a uso de terminal y Terminal-Bench 2.1, por lo que puede emplearse en pipelines que ejecutan comandos y interpretan salidas de forma autonoma.
- Ingenieria de software asistida: la reduccion de tokens de pensamiento abarata las sesiones largas de refactorizacion y depuracion, donde el coste por token de razonamiento domina el presupuesto.
- Agentes personales multi-turno: el dataset de SFT es de conversacion multi-turno orientada a agentes, lo que encaja con asistentes que mantienen estado a lo largo de muchas interacciones.
- Atencion al cliente automatizada: la eficiencia de tokens reduce el coste por conversacion en despliegues de alto volumen, siempre que se valide el comportamiento tras la ablacion de rechazos.
- Procesamiento de documentos con imagen: al ser image-text-to-text, puede extraer y razonar sobre contenido visual en flujos de digitalizacion, con la cautela de que la longitud de contexto no esta documentada.
- Evaluacion comparativa de eficiencia: util como checkpoint de referencia para medir reduccion de tokens de pensamiento frente al base Qwen3.8-Flash-Next en entornos de investigacion.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion comparando Qwen3.8-Flash-Next BF16 con Swift 1.5 BF16, con columnas de score, tokens de pensamiento medios y mediana. La tabla completa no esta disponible en la informacion proporcionada (el contenido se corta en la cabecera). Los datos confirmados son:

| Metrica | Valor declarado |
|---|---|
| Reduccion de tokens de pensamiento | 63,4% |
| Aceleracion | 1,8x |
| Perdida de precision vs base (xhigh) | inferior al 1% |
| Tiempo demo (generacion de juego) | 4 min 56 s (Swift 1.5) vs 8 min 52 s (base) |

No se han publicado en la informacion disponible los valores numericos por benchmark (MMLU, HumanEval, GSM8K, Terminal-Bench 2.1), por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada: con 26,9 mil millones de parametros, en BF16 se requieren aproximadamente 54 GB solo para pesos; en 8-bit, unos 27 GB; en 2 bits, unos 7 GB mas overhead. El repositorio pesa 81,2 GB, consistente con pesos de alta precision y/o multiples archivos.
- GPU recomendadas: A100 80 GB o H100 para BF16 sin cuantizar; A100 40 GB o L40S para 8-bit; RTX 4090 (24 GB) viable en 8-bit con contexto corto o en 2 bits con margen.
- Consumer GPU: cabe en RTX 4090 y RTX 3090 en cuantizaciones de 8 bits o inferiores; en 16 bits no cabe en ninguna consumer GPU de una sola tarjeta.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para serving; llama.cpp y Ollama mediante las variantes GGUF publicadas por UkisAI (Swift-1.5-Qwen3.8-Flash-Next-GGUF y GSQ-RCO GGUF).
- Latencia y throughput: no disponibles; la unica referencia es la aceleracion de 1,8x en generacion declarada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-Flash-Next (este) | 26,9 mil millones (MoE) | no disponible | Razonamiento eficiente, agente | swift-open-license-1.0 (gated) | Hugging Face, variantes GGUF |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible en la informacion | no disponible | Razonamiento general | no disponible | Hugging Face |
| Swift-Qwen3.8-Flash-Next (UkisAI) | no disponible | no disponible | Version anterior del derivado | swift-open-license-1.0 | Hugging Face |

No se dispone de datos de benchmarks por modelo en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El nombre del repositorio indica "abliterated": los pesos han sido modificados para atenuar rechazos, lo que aumenta el riesgo de generar contenido danino, ofensivo o inseguro y compromete las salvaguardas del modelo base.
- Riesgo de alucinacion inherente a los modelos de razonamiento; la compresion de trazas puede reducir la auto-correccion en tareas de alta dificultad, aunque el autor afirma menos errores por sobre-razonamiento.
- Licencia swift-open-license-1.0 con restricciones no detalladas en la informacion disponible; el repositorio esta marcado como gated y requiere aceptar condiciones. Verificar terminos antes de uso comercial.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del ingles o del chino sin validacion empirica.
- Longitud de contexto no disponible, lo que impide planificar cargas de horizonte largo con garantias.
- Parametros activos de la MoE no disponibles, por lo que el coste real de inferencia por token no puede calcularse con precision.
- Procede de un finetune sobre un dataset de agentes multi-turno re-muestreado; posibles sesgos de dominio hacia tareas de terminal y programacion.
- El tag declara 8-bit mientras el nombre indica "2bpw": verificar la precision real de los pesos antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Karataete/swift1.5-qwen3.8-flash-next-abliterated-sushi-2bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo original de UkisAI: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Variante GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Variante GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Licencia: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next/blob/main/LICENSE
- Web de UkisAI: https://ukisai.com
- Pagina de producto: https://ukisai.com/products/swift
- Demo jugable: https://ukisai.com/swift-games/flash-next
