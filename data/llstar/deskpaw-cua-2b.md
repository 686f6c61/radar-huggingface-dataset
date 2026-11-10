# llstar/deskpaw-cua-2b

## Resumen

deskpaw-CUA-2B es un modelo vision-lenguaje de 2.130 millones de parámetros especializado en interacción con interfaces gráficas de usuario (GUI), desarrollado por el usuario llstar. Se trata de un ajuste fino completo (todos los pesos actualizados, no un adaptador) del modelo base Qwen/Qwen3-VL-2B-Instruct. Su función es actuar como un "System-1": dada una captura de pantalla y una instrucción en lenguaje natural, devuelve la coordenada de clic objetivo en un único pase directo, sin cadena de razonamiento ni búsqueda iterativa en tiempo de inferencia.

El modelo resuelve el problema de GUI grounding, es decir, la localización automática de elementos de pantalla (botones, campos de texto, iconos) a partir de instrucciones. Es relevante para el desarrollo de agentes de escritorio y automatización de flujos de trabajo, un área donde los modelos generalistas suelen requerir arquitecturas de razonamiento explícito más costosas. Su tamaño compacto (2,13B) lo hace desplegable en hardware modesto.

La arquitectura deriva de Qwen3-VL, un transformer multimodal con codificador visual y soporte de entrada de imágenes de hasta aproximadamente 5,9 millones de píxeles. El checkpoint publicado corresponde al paso 20.000 de un plan de entrenamiento de 31.848 pasos, interrumpido de forma temprana (aproximadamente el 63% de una época). La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (derivada de Qwen3-VL) con cabeza de predicción personalizada |
| Parametros totales | 2.126.995.456 (2,13B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoint publicado en bf16) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con codigo de modelado personalizado en el repositorio, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Instruct, una arquitectura transformer multimodal que combina un codificador visual con un decodificador de lenguaje. Sobre esa base, el autor aplicó un ajuste fino completo en precisión bf16, actualizando la totalidad de los pesos y añadiendo una cabeza de predicción personalizada para la tarea de localización de puntos de clic. La entrada admite capturas de pantalla de hasta aproximadamente 5,9 millones de píxeles.

El entrenamiento se detuvo de forma temprana: el checkpoint publicado es el paso 20.000 de un plan de 31.848 pasos, lo que equivale a cerca del 63% de una época sobre los datos de entrenamiento. No se especifica en la información disponible la composición del dataset, el número de tokens vistos ni si se emplearon técnicas de RLHF o DPO. La innovación principal es el enfoque "System-1": una predicción directa de coordenadas en un solo pase, sin razonamiento explícito ni refinamiento iterativo, lo que reduce la latencia frente a enfoques de agentes con cadenas de pensamiento.

## Capacidades

- Localización de elementos de interfaz (GUI grounding): devuelve coordenadas de clic a partir de una captura de pantalla y una instrucción en lenguaje natural.
- Predicción en un único pase directo ("System-1"), sin cadena de razonamiento ni búsqueda en tiempo de inferencia.
- Procesamiento de imágenes de alta resolución: entrada de capturas de hasta aproximadamente 5,9 millones de píxeles.
- Comprensión de instrucciones en inglés para tareas de interacción con escritorio, móvil y web.
- Capacidad de grounding sobre elementos de texto (95,0% de acierto en ScreenSpot-v2) e iconos (78,9%).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni otras modalidades (audio, vídeo) en la información disponible.

## Casos de uso

- Automatización de pruebas de interfaz de usuario: el modelo puede localizar botones y campos en capturas de pantalla durante suites de test end-to-end, sustituyendo selectores frágiles por grounding visual sobre la imagen renderizada.
- Asistentes de escritorio para tareas repetitivas: dado un flujo como "cierra esta ventana" o "abre el menú de ajustes", el modelo devuelve la coordenada de clic en un solo pase, lo que permite integrarlo en bucles de control de baja latencia.
- Rellenado asistido de formularios: con capturas de pantalla de aplicaciones web o de escritorio, el modelo identifica el campo objetivo a partir de una instrucción textual, útil en herramientas de accesibilidad o automatización de back-office.
- Investigación en agentes GUI: como componente de grounding dentro de arquitecturas de agente más amplias, donde un planificador de nivel superior decide la acción y este modelo resuelve la localización del elemento.
- Automatización de tareas en dispositivos móviles: el modelo obtiene un 90,87% en el split móvil de ScreenSpot-v2, lo que lo hace adecuado para prototipos de control de apps Android a partir de capturas.
- Extracción de objetivos en documentación visual: localización de elementos concretos en capturas de manuales o tutoriales para generar instrucciones paso a paso anotadas.
- Prototipado rápido en hardware de consumo: con 2,13B parámetros en bf16, puede ejecutarse en GPU de gama media para experimentación en investigación.

## Benchmarks y rendimiento

Evaluación sobre ScreenSpot-v2, split de test oficial (1.272 muestras), protocolo de un solo paso con top-1: el punto predicho debe caer dentro de la caja delimitadora de referencia.

| Split | Muestras | Precision |
|---|---|---|
| Global | 1.272 | 87,97% |
| desktop | 306 | 88,56% |
| mobile | 449 | 90,87% |
| web | 517 | 85,11% |
| Elementos de texto | 718 | 95,0% |
| Elementos de icono | 554 | 78,9% |

Advertencia del autor: la cifra de 87,97% se obtuvo sobre un checkpoint intermedio del mismo entrenamiento (paso 14.000); los pesos publicados (paso 20.000) no fueron reevaluados antes de la publicación. No se reclama estado del arte. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,3 GB solo para pesos, más memoria para el codificador visual, activaciones y procesamiento de imágenes de alta resolución; en la práctica se recomienda un mínimo de 8-12 GB de VRAM para capturas grandes.
- GPU recomendadas: NVIDIA A100, H100 o L40S para producción y procesamiento por lotes; RTX 4090 o RTX 3090 para desarrollo.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en bf16/fp16; con cuantización a 8 bits o 4 bits (no documentada oficialmente) cabría en GPUs de 6 GB o menos.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible, y debe tenerse en cuenta que la cabeza de predicción personalizada puede requerir código específico.
- Latencia y throughput: no disponibles. El diseño de un solo pase sugiere menor latencia que enfoques con cadena de razonamiento, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deskpaw-CUA-2B | 2,13B | No disponible | System-1, grounding GUI en un pase | Apache-2.0 | Hugging Face |
| Qwen3-VL-2B-Instruct (base) | 2,13B | No disponible | VLM generalista instruct | Apache-2.0 | Hugging Face |
| Modelos GUI grounding de mayor tamano | No disponible | No disponible | Grounding GUI, a menudo con razonamiento | No disponible | No disponible |

La comparación cuantitativa con alternativas especializadas en GUI grounding no está disponible en la información proporcionada. El modelo base Qwen3-VL-2B-Instruct es la referencia natural: deskpaw-CUA-2B lo especializa para grounding con una cabeza de predicción dedicada, a costa de perder generalidad conversacional.

## Limitaciones y advertencias

- No evaluado en seguridad: sin red-teaming, sin pruebas de inyección de prompts ni de acciones destructivas. No debe desplegarse sobre un escritorio real sin sandbox y supervisión humana.
- Entrenamiento incompleto: solo se completó aproximadamente el 63% del plan previsto (paso 20.000 de 31.848), por lo que el modelo no ha visto todo su presupuesto de datos.
- Evaluación limitada: un único benchmark y un único protocolo; la cifra publicada corresponde a un checkpoint intermedio (paso 14.000) y los pesos liberados no fueron reevaluados.
- Rendimiento desigual: falla más en objetivos de solo icono (78,9%) que en elementos de texto (95,0%).
- Idioma: el seguimiento de instrucciones es más sólido en inglés; no se documenta soporte de otros idiomas.
- Riesgo de alucinación de coordenadas: al predecir un punto en un solo pase sin verificación, puede devolver localizaciones plausibles pero incorrectas en interfaces ambiguas o densas.
- Código personalizado: requiere `trust_remote_code=True`; conviene revisar los archivos `.py` incluidos antes de su uso. `AutoModelForCausalLM` y `Qwen3VLForConditionalGeneration` no funcionan directamente.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las obligaciones de atribución y aviso de cambios del modelo base; el autor no evalúa el modelo para despliegue comercial.
- Uso previsto: investigación en agentes GUI y grounding de elementos de pantalla; no para operación desatendida de sistemas reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llstar/deskpaw-CUA-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
