# North-ML1/starlight-pro-1

## Resumen

Starlight Pro 1 es un modelo de generación de texto desarrollado por North-ML1, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste fino sobre el modelo base Qwen/Qwen3.5-2B (etiqueta de arquitectura `qwen3_5_text`) al que se le añade un componente propio denominado registro causal de memoria de agente, insertado después de cada capa de atención completa. La proyección de salida de ese registro se inicializa a cero, de modo que en el paso 0 el comportamiento del modelo coincide exactamente con el de Qwen; a partir de ahí el registro va acumulando estado entre pasos de generación.

El modelo cuenta con 1.881.825.088 parámetros (aproximadamente 1,88 mil millones), un tamaño de repositorio de 3,8 GB y está orientado a generación de texto conversacional en inglés. Su rasgo diferencial no es el tamaño ni el contexto, sino el mecanismo de memoria de agente y la exigencia de cargar código propio (`starlight_arch.py` y `agent_register.pt`) para que el registro funcione: los pesos en `model.safetensors` por sí solos son únicamente el backbone Qwen sin el registro.

Es relevante ahora porque ejemplifica una línea de trabajo habitual en el ecosistema abierto: modificaciones arquitectónicas ligeras sobre modelos pequeños ya existentes, con el objetivo de dotarles de estado persistente para flujos de agente. No obstante, el modelo es de publicación reciente y sin tracción (0 descargas y 0 likes en el momento de redactar esta ficha), y la única evaluación publicada es un benchmark greedy muy reducido de 12 prompts, con 10 aciertos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta `qwen3_5_text`) con un registro causal de memoria de agente tras cada capa de atención completa |
| Parámetros totales | 1.881.825.088 (≈1,88 mil millones), según los pesos en safetensors |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio publica pesos en safetensors; no se anuncian variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) más `agent_register.pt` en formato PyTorch y el script `starlight_arch.py` para cargar el registro |

## Arquitectura y entrenamiento

La base es Qwen3.5-2B, un transformer denso de aproximadamente 1,88 mil millones de parámetros. Sobre esa base, el autor inserta un registro causal de memoria de agente después de cada capa de atención completa. La innovación técnica declarada es la inicialización a cero de la proyección de salida del registro: al arrancar, la contribución del registro es nula y el modelo reproduce el comportamiento del Qwen original, lo que en teoría permite un ajuste estable sin degradar las capacidades heredadas desde el primer paso.

El autor no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF, DPO o SFT. Tampoco especifica cómo se entrena el registro (si se congela el backbone, si se entrena de forma conjunta o si se aplica una etapa específica para el registro). Toda esa información figura como no disponible en la model card. El único dato operativo es que el registro se carga por separado mediante `starlight_arch.py` y debe engancharse a las capas de atención completa antes de generar; los safetensors distribuidos en el repositorio contienen solo el backbone, sin el registro.

## Capacidades

- Generación de texto conversacional en inglés, heredada del backbone Qwen3.5-2B.
- Respuestas de identidad controladas: en el benchmark publicado, el modelo pasa las preguntas "What is your name?" y "Are you Qwen?", lo que sugiere un ajuste deliberado para no declararse Qwen.
- Conocimiento factual básico: acierta capitales (Tokio, Ottawa, Canberra) y autoría literaria (Hamlet, Shakespeare).
- Explicaciones científicas sencillas: responde correctamente sobre la dispersión de Rayleigh como causa del color del cielo.
- Llamada a herramientas: pasa tanto una llamada de herramienta Python para una suma como una llamada de herramienta de búsqueda.
- Generación de código básico: aprueba un prompt de función de mediana (median function).
- Aritmética de un solo paso: falla la multiplicación larga (13×17, 19×23) cuando el resultado requiere más de 80 tokens nuevos, según el propio autor; los productos parciales se truncan antes del total, no por un primer paso incorrecto.
- Memoria de agente: el registro posterior a cada capa de atención completa está pensado para mantener estado entre pasos, aunque el autor no publica una evaluación específica de esta capacidad.
- Modo thinking, visión, audio y capacidades multimodales: no disponibles.
- Multilingüismo: limitado a inglés según los metadatos del repositorio.

## Casos de uso

- Asistentes conversacionales en inglés con estado entre turnos: el registro de memoria de agente está diseñado para conservar información entre pasos de generación, lo que encaja en diálogos multi-turno donde el contexto relevante debe persistir sin depender solo del prompt.
- Orquestación de agentes con llamadas a herramientas: el modelo pasa pruebas de tool calling para Python y búsqueda, por lo que puede integrarse como planificador ligero en pipelines de agentes que emiten llamadas estructuradas a APIs.
- Extracción de respuestas factuales breves: preguntas de cultura general, capitales o autorías resueltas en pocos tokens, útil en sistemas de question answering de baja latencia.
- Generación de utilidades de código cortas: funciones auxiliares como una mediana en Python, apropiadas para autocompletado en editores o tareas acotadas de scripting.
- Clasificación y reformulación de texto en inglés: al ser un modelo de 1,88 mil millones, es viable ejecutar tareas de reescritura, resumen corto o normalización en lotes sobre hardware modesto.
- Componente de bajo coste en entornos de prototipado: su tamaño permite desplegarlo en una GPU de consumo o en un portátil con memoria unificada, lo que facilita experimentar con el mecanismo de registro sin presupuesto de clúster.
- Investigación sobre memoria explícita en transformers: el diseño de registro cero-inicializado tras cada capa de atención completa sirve como base para estudiar si el estado persistente mejora el razonamiento multi-paso frente al backbone sin modificar.

## Benchmarks y rendimiento

El autor publica un único benchmark: decodificación greedy en una GPU A10G de Modal, 80 tokens nuevos y 12 prompts reservados, con un resultado global de 10/12.

| Prompt | Resultado |
|---|---|
| What is your name? | pass |
| Are you Qwen? | pass |
| Capital of Japan | pass, Tokyo |
| Who wrote Hamlet? | pass, Shakespeare |
| Why is the sky blue? | pass, Rayleigh scattering |
| 13 times 17 | fail: los productos parciales 91 y 130 se cortaron antes del total |
| Capital of Canada | pass, Ottawa |
| 19 times 23 | fail: los productos parciales se cortaron antes del total |
| Median function | pass |
| Python tool call for a sum | pass |
| Search tool call | pass |
| Capital of Australia | pass, Canberra |

El propio autor atribuye los dos fallos al límite de 80 tokens nuevos en multiplicaciones largas, no a un primer paso incorrecto. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estandarizado, ni comparaciones numéricas con modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada en precisión completa (fp32): en torno a 7,5 GB solo para pesos, más activaciones y caché KV.
- VRAM estimada en bf16/fp16: aproximadamente 3,8 GB, coherente con el tamaño del repositorio de 3,8 GB.
- VRAM estimada con cuantización de 8 bits: alrededor de 1,9 GB; con 4 bits, alrededor de 1,1 GB. Son estimaciones teóricas a partir del número de parámetros, no cifras publicadas por el autor.
- GPU de consumo: sí cabe. Una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 lo ejecutan sin problema en bf16. También es viable en Apple Silicon con memoria unificada de 8 GB o más.
- GPU de datacenter: A10G, L4, A100 o H100 quedan sobradamente dimensionadas; el propio benchmark se ejecutó en una A10G.
- Opciones de despliegue: transformers con carga estándar del backbone; para usar el registro hay que cargar `agent_register.pt` con `starlight_arch.py` y engancharlo a las capas de atención completa, lo que implica soporte de código propio. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama, y no se publican pesos GGUF, por lo que el despliegue en esas herramientas requeriría conversión y adaptación previas.
- Latencia y throughput: no disponibles. El único dato operativo es que el benchmark se ejecutó con decodificación greedy y un límite de 80 tokens nuevos en una A10G.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Registro de memoria de agente | Datos de benchmarks |
|---|---|---|---|---|---|
| Starlight Pro 1 | 1,88 mil millones | no disponible | Apache 2.0 | Sí, tras cada capa de atención completa | 10/12 en 12 prompts propios (greedy, 80 tokens) |
| Qwen3.5-2B (modelo base) | ≈2 mil millones | no disponible | no disponible | No | no disponible |
| Alternativas densas de ~2B (por ejemplo, familias tipo Llama 3.2 o Gemma 2 en ese rango) | no disponible | no disponible | no disponible | No | no disponible |

La comparación cuantitativa con alternativas no es posible con la información disponible: el autor solo publica el resultado frente a su propio conjunto de 12 prompts y no incluye métricas del modelo base en las mismas condiciones, por lo que no puede medirse la ganancia atribuible al registro.

## Limitaciones y advertencias

- Riesgo de alucinación: es un modelo de 1,88 mil millones de parámetros; cabe esperar errores factuales fuera de dominios comunes. No se han publicado evaluaciones de fidelidad más allá de los 12 prompts citados.
- Aritmética limitada: falla multiplicaciones de dos cifras cuando el resultado excede los 80 tokens nuevos, según el propio benchmark del autor. En producción con respuestas largas el problema puede aparecer en otras tareas que requieran cadenas de cálculo.
- Eco del prompt de sistema de entrenamiento: el autor advierte que las respuestas de identidad siguen reflejando el system prompt usado en el entrenamiento, lo que puede generar comportamientos no deseados si se cambia el prompt de sistema en despliegue.
- Solo inglés: el repositorio declara únicamente el idioma `en`; no hay soporte multilingüe documentado.
- Longitud de contexto no documentada: no se especifica la ventana de contexto soportada, lo que dificulta planificar cargas con documentos largos.
- Dependencia de código propio: `model.safetensors` no incluye el registro de memoria. Sin cargar `agent_register.pt` mediante `starlight_arch.py` y engancharlo correctamente, se está ejecutando simplemente Qwen3.5-2B, con lo que la propuesta de valor del modelo desaparece.
- Compatibilidad de despliegue no garantizada: no hay confirmación de funcionamiento en vLLM, TGI, llama.cpp u Ollama, ni pesos cuantizados publicados.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento del análisis, sin issues ni terceros que hayan reproducido los resultados.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-2B, cuya licencia no se detalla en la información disponible.
- Fecha de publicación muy reciente (4 de octubre de 2026) y sin historial de actualizaciones posterior más allá del mismo día.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/North-ML1/starlight-pro-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo: los únicos enlaces encontrados corresponden a la marca de ropa The North Face y a la entrada de Wikipedia sobre el punto cardinal norte. No se han localizado papers, blogs, repositorios ni demos adicionales asociados a Starlight Pro 1.
