# Rodriguez10/Qwen3.5-4B-SFT200-OPD50-LIBERO

## Resumen

Rodriguez10/Qwen3.5-4B-SFT200-OPD50-LIBERO es un ajuste fino del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario Rodriguez10 y publicado en Hugging Face. El modelo está especializado en robótica, tal como indica su pipeline (`robotics`) y la referencia a LIBERO en el nombre, un conocido benchmark de manipulación robótica con instrucciones en lenguaje natural. Se trata, por tanto, de un modelo multimodal de imagen-texto a texto orientado a la interpretación de escenas visuales y la generación de instrucciones o acciones para tareas de manipulación.

El nombre del repositorio sugiere un proceso de entrenamiento en dos fases: un ajuste supervisado (SFT) con 200 pasos o muestras, seguido de una destilación on-policy (OPD) con 50 iteraciones, aplicado sobre el modelo base Qwen3.5-4B. Esta combinación de SFT y destilación on-policy es habitual en la adaptación de modelos generalistas a dominios específicos con datos limitados, buscando preservar las capacidades del modelo original mientras se especializa en el dominio objetivo.

Con 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) y un tamaño de repositorio de 9,1 GB en formato safetensors, el modelo es desplegable en hardware de consumo con cuantización. Su relevancia radica en la aplicación de modelos de lenguaje multimodales de tamaño medio a robótica, un área donde los modelos especializados y ligeros son especialmente valiosos por los requisitos de latencia y los recursos limitados de los robots. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5 |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-4B, un transformer multimodal de la familia Qwen3.5 que procesa entradas de imagen y texto para generar texto. La arquitectura concreta (número de capas, dimensión oculta, mecanismo de atención, codificador visual) no se detalla en la información disponible; se hereda del modelo base Qwen3.5-4B.

El entrenamiento consistió, según el nombre del repositorio, en un ajuste supervisado (SFT) seguido de destilación on-policy (OPD) sobre el dataset o benchmark LIBERO. LIBERO es un conjunto de tareas de manipulación robótica con instrucciones en lenguaje natural y observaciones visuales, ampliamente utilizado para evaluar modelos de política robótica. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO adicionales. La combinación SFT + OPD sugiere un intento de alinear el modelo con las distribuciones de acciones e instrucciones propias del entorno LIBERO, mitigando el desajuste entre el entrenamiento supervisado y la inferencia autoregresiva.

## Capacidades

- Generación de texto e interpretación de imágenes (image-text-to-text) heredadas del modelo base Qwen3.5-4B.
- Comprensión de instrucciones en lenguaje natural para tareas de manipulación robótica, orientada al benchmark LIBERO.
- Procesamiento de observaciones visuales de escenas de robot para generar descripciones o acciones.
- Capacidades multilingües: no disponibles de forma explícita; se heredan potencialmente del modelo base, pero no se confirman.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita.
- Modo thinking, visión o audio especial: no disponible; la modalidad confirmada es imagen-texto a texto.

## Casos de uso

- Investigación en manipulación robótica con LIBERO: el modelo puede evaluarse directamente sobre las tareas de LIBERO para medir la tasa de éxito en instrucciones de manipulación, aprovechando su ajuste específico sobre este benchmark.
- Generación de políticas de acción en entornos simulados: dado un par observación-imagen e instrucción textual, el modelo puede generar la secuencia de acciones o el texto de control esperado en un simulador de robótica.
- Prototipado de asistentes visuales para robots de bajo coste: con 4,5 mil millones de parámetros y cuantización, puede desplegarse en GPUs de consumo para pruebas de concepto en laboratorio.
- Análisis de escenas visuales con instrucciones en lenguaje natural: útil para tareas de grounding visual donde se requiere describir objetos relevantes para una instrucción de manipulación.
- Base para ajuste adicional en dominios robóticos específicos: al ser un modelo pequeño y especializado, sirve como punto de partida para fine-tuning en otros benchmarks o entornos de manipulación.
- Evaluación comparativa de técnicas de destilación on-policy: el modelo es un caso de estudio para investigar el efecto de SFT + OPD en modelos multimodales aplicados a robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 9 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada con cuantización de 8 bits: en torno a 5 GB para pesos.
- VRAM estimada con cuantización de 4 bits: en torno a 3 GB para pesos, viable en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090.
- GPU recomendadas para producción: A100 40 GB, H100, L40S; para desarrollo: RTX 4090, RTX 3090.
- Cabe en GPU de consumo con cuantización de 4 u 8 bits; en fp16 requiere al menos 12-16 GB de VRAM.
- Opciones de despliegue: transformers (librería indicada), vLLM y TGI para servir en producción, llama.cpp/Ollama si se generan pesos GGUF (no disponibles en el repo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rodriguez10/Qwen3.5-4B-SFT200-OPD50-LIBERO | 4.539.265.536 | no disponible | imagen-texto a texto | no disponible | gated en HF |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | imagen-texto a texto | no disponible | público en HF |
| OpenVLA (referencia robótica) | ~7B | no disponible | imagen-texto a acciones | no disponible | público en HF |
| Otros ajustes LIBERO sobre Qwen | no disponible | no disponible | imagen-texto a texto | no disponible | variable |

La comparativa se limita a la información disponible; no se dispone de datos de rendimiento para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse en la página del repositorio antes de cualquier despliegue en producción.
- Idiomas soportados no confirmados: el comportamiento multilingüe depende del modelo base y no está documentado.
- Especialización estrecha: el ajuste sobre LIBERO puede degradar el rendimiento en tareas generales o en otros entornos robóticos distintos al de entrenamiento.
- Riesgo de alucinación: como todo modelo generativo, puede producir instrucciones o descripciones visuales incorrectas; en robótica esto implica riesgo físico si se usa para control real sin salvaguardas.
- Sin datos de benchmarks publicados: no es posible validar su rendimiento frente a alternativas.
- Dataset y proceso de entrenamiento no documentados: la composición de datos, hiperparámetros y criterios de selección no están disponibles, lo que dificulta la reproducibilidad.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Rodriguez10/Qwen3.5-4B-SFT200-OPD50-LIBERO
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Benchmark LIBERO (referencia): no disponible en la información proporcionada.
