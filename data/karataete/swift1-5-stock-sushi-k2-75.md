# Karataete/swift1.5-stock-sushi-k2.75

## Resumen

Swift 1.5 Qwen3.8-Flash-Next es un ajuste fino (derivado) del modelo Qwen3.8-Flash-Next, publicado por UkisAI bajo el identificador `Karataete/swift1.5-stock-sushi-k2.75` en Hugging Face. El modelo se presenta como una variante "razonamiento-eficiente": su objetivo es reducir el número de tokens de pensamiento generados sin degradar la precisión, para abaratar y acelerar la inferencia en tareas de razonamiento, código y uso agéntico (agentes personales, terminal, ingeniería de software).

Según la model card, emplea **un 63,4 % menos de tokens de pensamiento** con una **aceleración de 1,8x** y una **pérdida de precisión inferior al 1 %** respecto al modelo base en el nivel de esfuerzo "xhigh". El checkpoint real cuenta con 26.922.385.299 parámetros (unos 26,9 mil millones) y se distribuye en formato `safetensors` con cuantización de 8 bits, ocupando el repositorio 81,2 GB. La arquitectura se etiqueta como `moe` (mezcla de expertos) y el pipeline es `image-text-to-text`, lo que indica capacidades multimodales de entrada imagen + texto.

El modelo es relevante porque ataca uno de los costes dominantes en modelos de razonamiento: la longitud de las trazas de pensamiento. Al comprimir estas trazas manteniendo la exactitud, reduce latencia y coste por consulta en despliegues de agentes y código. La licencia es `swift-open-license-1.0` (categoría "other"), con acceso restringido (`gated: true`), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal (image-text-to-text) |
| Parametros totales | 26.922.385.299 (~26,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (checkpoint publicado); variantes GGUF y GSQ-RCO GGUF referenciadas por el autor |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (categoría "other"), acceso restringido (gated) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-Flash-Next y se etiqueta como MoE con capacidades multimodales de entrada (imagen y texto). No se detalla en la información disponible el número de parámetros activos, el número de expertos, la longitud de contexto nativa ni la composición exacta del corpus de preentrenamiento del modelo base.

El entrenamiento de Swift 1.5 se describe como una estrategia de eficiencia de razonamiento: se identifican los tokens asociados a "sobrepensamiento patológico" y se penalizan sin atacar directamente la longitud del razonamiento, recuperando después la precisión mediante RL y OPD (on-policy distillation, según las siglas empleadas). El dataset de post-entrenamiento es `ukisai/Qwen3.8-27B-multi-turn-agent-sft`, que según el autor no se usa tal cual, sino remuestreado y convertido en entornos de RL. El post-entrenamiento está orientado a código y trabajo agéntico de horizonte largo (agentes personales, uso de terminal, ingeniería de software). El autor afirma que el modelo produce trazas de razonamiento más cortas y menos errores de sobrepensamiento.

## Capacidades

- Generación de texto y razonamiento con trazas de pensamiento comprimidas (modo "efficient-thinking").
- Generación de código, incluyendo proyectos completos (la demo muestra la creación de un juego 3D ejecutable localmente).
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`).
- Uso agéntico de horizonte largo: agentes personales, uso de terminal y tareas de ingeniería de software (tag `agentic`, `terminal-bench`).
- Soporte de conversación multi-turno (dataset de SFT multi-turno de agentes).
- Capacidades multilingües: no disponible.
- Soporte explícito de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Agentes de terminal automatizados: el modelo está post-entrenado para uso de terminal y tareas de shell; su reducción de tokens de pensamiento abarata cada paso del bucle agéntico, donde la latencia por iteración se acumula.
- Ingeniería de software asistida: puede generar proyectos completos a partir de una especificación (la demo construye un juego 3D funcional en 4 min 56 s frente a 8 min 52 s del base), adecuado para prototipado rápido y generación de código de arranque.
- Agentes personales multi-turno: entrenado sobre un dataset de SFT multi-turno de agentes, encaja en asistentes que mantienen estado conversacional y ejecutan subtareas encadenadas.
- Razonamiento con restricción de coste: en pipelines donde el coste por token de salida es dominante, la reducción del 63,4 % de tokens de pensamiento con pérdida <1 % permite desplegar razonamiento en producción a menor coste.
- Automatización de tareas de software en CI/CD: para tareas de análisis, parcheo o generación de tests donde se requiere razonamiento pero con presupuesto de latencia acotado.
- Asistentes con entrada de imágenes: al ser image-text-to-text, puede procesar capturas de pantalla o diagramas junto con instrucciones de texto, útil en soporte técnico o documentación.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación comparando el base Qwen3.8-Flash-Next en BF16 con Swift 1.5 BF16, con columnas de puntuación, tokens de pensamiento medios y mediana. Sin embargo, en la información proporcionada la tabla aparece truncada (solo se recogen las cabeceras y la estructura), por lo que no se dispone de las cifras por benchmark. Los datos cualitativos confirmados son:

| Metrica | Valor |
|---|---|
| Reduccion de tokens de pensamiento | 63,4 % |
| Aceleracion | 1,8x |
| Perdida de precision (xhigh) | < 1 % |
| Tiempo de construccion de demo (base) | 8 min 52 s |
| Tiempo de construccion de demo (Swift 1.5) | 4 min 56 s |

Las cifras por benchmark individual (MMLU, HumanEval, GSM8K, Terminal-Bench 2.1, etc.) no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~26,9 mil millones de parámetros en 8 bits, el peso ocupa aproximadamente 27 GB; en BF16 serían unos 54 GB. Añadiendo caché KV y overhead, se recomienda al menos 32-40 GB de VRAM en 8 bits y 64-80 GB en BF16.
- GPU recomendadas: A100 80 GB o H100 para BF16; A100 40 GB, L40S o RTX 6000 Ada para 8 bits.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB (RTX 4090) en 8 bits sin descarga a CPU u offloading; las variantes GGUF referenciadas por el autor (incluida GSQ-RCO GGUF) podrían permitir cuantizaciones de 4 bits que sí encajen, aunque no se dispone de cifras verificadas.
- Opciones de despliegue: transformers (librería declarada); el autor referencia variantes GGUF, lo que habilita llama.cpp y Ollama; vLLM y TGI son plausibles pero no están confirmados en la información disponible.
- Latencia y throughput: no disponible (solo la aceleración relativa de 1,8x frente al base).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-Flash-Next | ~26,9 mil millones | no disponible | Razonamiento eficiente, MoE multimodal | swift-open-license-1.0 (gated) | Hugging Face, acceso restringido |
| Qwen3.8-Flash-Next (base) | no disponible | no disponible | Razonamiento general, MoE multimodal | según Qwen (no disponible aquí) | Hugging Face |
| Alternativas de mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Licencia `swift-open-license-1.0` (categoría "other") con acceso restringido (`gated: true`): es imprescindible revisar los términos antes de cualquier uso comercial; el enlace de licencia apunta a `ukisai/Swift-Qwen3.8-Flash-Next/LICENSE`.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, requiere verificación en producción.
- La compresión de trazas de razonamiento puede degradar tareas que se benefician de cadenas de pensamiento largas; el autor reporta pérdida <1 % en "xhigh", pero no hay datos por benchmark para verificar el impacto en tareas específicas.
- Idiomas soportados no declarados: no se puede garantizar calidad multilingüe fuera del inglés sin evaluación propia.
- Longitud de contexto no disponible: limita la planificación de despliegues con documentos largos o historiales extensos.
- El repositorio es una publicación de un tercero (`Karataete`) sobre un derivado de UkisAI; conviene verificar la cadena de procedencia y la integridad del checkpoint.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación comunitaria prácticamente nulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Karataete/swift1.5-stock-sushi-k2.75
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Dataset de post-entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Web del autor: https://ukisai.com
- Página de producto Swift: https://ukisai.com/products/swift
- Variante GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Variante GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Licencia: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next/blob/main/LICENSE
- Demo jugable: https://ukisai.com/swift-games/flash-next
