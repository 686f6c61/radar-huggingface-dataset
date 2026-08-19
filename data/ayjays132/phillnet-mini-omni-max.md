# ayjays132/Phillnet-Mini-Omni-Max

## Resumen

PhillNet Mini Omni Max es un modelo de lenguaje multimodal unificado desarrollado por el autor independiente ayjays132, construido sobre el modelo base Qwen/Qwen3.5-0.8B mediante fine-tuning. Su propuesta principal es integrar capacidades de razonamiento, generación de código, tool use, síntesis de texto a imagen, visión y generación de video en un único objeto de modelo, junto con un mecanismo de defensa adversarial basado en self-play que lo hace robusto frente a inyecciones de prompts y ataques de red-teaming. El modelo cuenta con 881 millones de parámetros y está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación.

La relevancia de este modelo radica en su enfoque de seguridad: incorpora un autocurrículum adversarial de cuatro roles (atacante, defensor, verificador y orquestador) que explora 160 celdas de calidad-diversidad para endurecer los pesos sin degradar la utilidad en tareas benignas. Según la model card, logra un incremento del 21,3% en la tasa de defensa contra inyecciones indirectas de prompts en comparación con el modelo base, manteniendo la precisión en tareas de código, matemáticas y resumen. Aunque el modelo está orientado principalmente al inglés, su arquitectura multimodal y su énfasis en robustez lo convierten en una opción interesante para entornos donde los datos no confiables son un riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.5-0.8B) |
| Parametros totales | 881.827.584 (881M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se menciona soporte de contexto largo, sin cifra concreta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer denso de 881M parámetros, y se somete a un proceso de fine-tuning que incorpora un mecanismo de autocurrículum adversarial de cuatro roles: atacante, defensor, verificador y orquestador. Este esquema, inspirado en OpenAI RLSP y Anthropic Constitutional AI, genera ataques novedosos contra el propio modelo, los filtra mediante un verificador con doble rúbrica y destila las trazas de defensa verificadas en los pesos, evitando el olvido catastrófico. La model card menciona además una ruta de generación de imágenes mediante un "U-Net y VAE empaquetados de forma perezosa" (lazy packaged), lo que sugiere la integración de componentes de difusión dentro del mismo objeto de modelo, aunque no se detalla la arquitectura exacta de estos módulos. No se especifica el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generacion de texto, razonamiento y codigo, con soporte para deliberacion interna mediante etiquetas `<think>`.
- Tool use: integra llamadas a web y calculadora para tareas que requieren informacion externa o calculo.
- Texto a imagen: sintetiza imagenes a partir de descripciones textuales, con ejemplos publicados en la model card (por ejemplo, "Chrome Koi" o "Neon Terrarium").
- Imagen a texto: capacidad de interpretar imagenes y generar descripciones o respuestas.
- Generacion de video guiado por vision: produce secuencias de movimiento a partir de un keyframe visual.
- Defensa contra inyeccion de prompts: resistencia mejorada frente a ataques de autoridad, ruptura de delimitadores, suplantacion de sistema y fusion de datos contextuales.
- Robustez adversarial: entrenamiento con self-play que reduce la tasa de exito de ataques en un 21,3% respecto al modelo base.
- Multilingue: solo ingles, sin soporte declarado para otros idiomas.

## Casos de uso

- Atencion al cliente automatizada con datos no confiables: el modelo puede gestionar conversaciones multi-turno donde el usuario introduce texto potencialmente malicioso (por ejemplo, en formularios o comentarios), gracias a su defensa contra inyeccion indirecta de prompts. Su tasa de resistencia del 61,5% en escenarios adversariales lo hace mas seguro que un modelo base para entornos de produccion expuestos a entradas externas.
- Generacion de codigo seguro en pipelines de CI/CD: al soportar tool use y tener entrenamiento adversarial, puede integrarse en flujos donde se procesan dependencias o parches de terceros, reduciendo el riesgo de que instrucciones ocultas en el codigo alteren el comportamiento del asistente.
- Prototipado rapido de imagenes para diseno: su capacidad de texto a imagen permite generar conceptos visuales (por ejemplo, "un pez koi cromado nadando en un anillo de luz azul") sin necesidad de herramientas externas, util para equipos de diseno que necesitan iterar sobre ideas.
- Asistentes de razonamiento con acceso a herramientas: puede combinar deliberacion interna con llamadas a calculadora o busqueda web para resolver problemas de matematicas o consultas factuales, manteniendo un hilo de razonamiento explicito.
- Generacion de video guiado por vision para animacion: a partir de un keyframe, el modelo puede producir una orbita o movimiento alrededor de la escena, lo que resulta util para previsualizaciones en produccion audiovisual o videojuegos.
- Sistemas de agentes autonomos con requisitos de seguridad: su robustez frente a ataques de prompt injection lo hace adecuado para agentes que interactuan con APIs o bases de datos donde los datos externos pueden contener instrucciones maliciosas, reduciendo el riesgo de acciones no deseadas.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar como MMLU, HumanEval o GSM8K. En su lugar, proporciona metricas de seguridad obtenidas en 181 escenarios adversariales multi-ronda:

| Metrica | Baseline (pre-entrenamiento) | Defender (self-play) | Ganancia neta |
|---|---|---|---|
| Defensa contra inyeccion indirecta de prompts | 40,2% (33/82 resistidos) | 61,5% (56/91 resistidos) | +21,3% |
| Tasa de exito de ataque (vulnerabilidad) | 59,8% (49/82 brechas) | 38,5% (35/91 brechas) | -21,3% |
| Resistencia a escape de delimitadores | 3 resistidos | 14 resistidos | +366% |
| Utilidad en tareas benignas | 0,550 | 0,556 | sin degradacion |
| Latencia de generacion directa | ~29,3 s | ~18,7 s | ~36% mas rapido |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 881M parametros, el modelo puede ejecutarse en GPUs consumer con 8-12 GB de VRAM en precision FP16, y menos con cuantizacion (por ejemplo, 4-6 GB en INT4). El repositorio pesa 12,2 GB, pero los pesos safetensors ocupan 1,76 GB segun la model card.
- GPU recomendadas: RTX 3060/3070/3080/3090, RTX 4060/4070/4080/4090, o GPUs de datacenter como A10, A100 o H100 para inferencia a mayor escala.
- Cabe en GPU consumer: si, con cuantizacion o incluso en FP16 en tarjetas con 12 GB o mas.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se mencionan integraciones especificas.
- Latencia y throughput: la model card reporta ~18,7 s de generacion directa en un escenario no especificado, sin detallar hardware ni longitud de salida. No hay datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Defensa adversarial | Licencia |
|---|---|---|---|---|---|
| PhillNet Mini Omni Max | 881M | no disponible | Si (texto, imagen, video) | Si (self-play) | Apache 2.0 |
| Qwen3.5-0.8B (base) | 881M | no disponible | No | No | Apache 2.0 |
| Mini-Omni (gpt-omni) | no disponible | no disponible | Si (audio, texto) | No | MIT (segun repo) |

La comparacion con Qwen3.5-0.8B es directa por ser el modelo base; PhillNet anade capacidades multimodales y defensa adversarial, aunque no se dispone de benchmarks estandar para comparar rendimiento. Mini-Omni es un modelo multimodal de audio y texto, pero no hay evidencia de que PhillNet derive de el; el nombre sugiere inspiracion, pero no se confirma en la documentacion.

## Limitaciones y advertencias

- Solo soporta ingles; no hay datos sobre rendimiento en otros idiomas.
- No se han publicado benchmarks estandar (MMLU, HumanEval, etc.), por lo que es dificil evaluar su calidad general frente a otros modelos.
- La defensa adversarial no es perfecta: aun con el entrenamiento self-play, el 38,5% de los ataques logran vulnerar el modelo, por lo que no debe considerarse inmune a inyecciones de prompts.
- El modelo es experimental y desarrollado por un autor individual; no hay evidencia de validacion externa ni de uso en produccion a gran escala.
- Las capacidades de generacion de imagen y video estan descritas en la model card, pero no se detallan los mecanismos internos ni se proporcionan metricas de calidad de las salidas visuales.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen3.5-0.8B y cualquier dependencia adicional.
- El tamano del repositorio (12,2 GB) sugiere que incluye archivos adicionales (ejemplos, interfaces HTML) que no son necesarios para la inferencia; los pesos safetensors son 1,76 GB.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ayjays132/Phillnet-Mini-Omni-Max
- Modelo Phillnet (original): https://huggingface.co/ayjays132/phillnet
- Modelo PhillnetLarge: https://huggingface.co/ayjays132/PhillnetLarge
- Repositorio GitHub Phillnet Complete Life Studio: https://github.com/ayjays132/phillnet-complete-life-studio
- Repositorio Mini-Omni (posible inspiracion): https://github.com/gpt-omni/mini-omni
