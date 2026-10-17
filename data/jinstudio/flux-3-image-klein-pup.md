# Jinstudio/flux-3-image-klein-pup

## Resumen

FLUX 3 Image Klein Prompt Upsampler es un modelo vision-language de 9.409.813.744 parámetros (9,4B) que convierte una petición breve de imagen en el prompt detallado que espera el modelo de difusión FLUX 3 Image Klein. Acepta la petición del usuario, hasta 10 imágenes de referencia y, opcionalmente, una lista de bounding boxes, y devuelve un único prompt en inglés. Es un fine-tune completo de Qwen/Qwen3.5-9B con la torre de visión congelada, publicado en el repositorio de HuggingFace Jinstudio/flux-3-image-klein-pup bajo licencia Apache 2.0.

El problema que resuelve es concreto: FLUX 3 Image Klein no está pensado para funcionar sin un upsampler de prompts delante, ni en text-to-image, ni en edición, ni en layout, porque un prompt corto enviado tal cual produce salidas genéricas. Este modelo está ajustado específicamente para esa tarea mediante entrenamiento supervisado y posterior ajuste por preferencias sobre imágenes generadas, y su código de inferencia se carga por defecto en el repositorio oficial de FLUX 3.

Su relevancia actual está en que unifica en un solo modelo los cuatro modos de la familia (text-to-image, edición con referencias y sus variantes con bounding boxes), seleccionables mediante system prompts incluidos en `system_prompts.json`. El repositorio se creó el 16 de octubre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, por lo que no hay validación de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basado en Qwen3.5; clase de implementación `Qwen3_5ForConditionalGeneration`, torre de visión congelada durante el fine-tune |
| Parámetros totales | 9.409.813.744 (9,4B) |
| Parámetros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible (el ejemplo de uso fija `max_new_tokens=3584` para la generación, no la ventana de contexto) |
| Tipos de cuantización | No disponible: solo se publican pesos en bfloat16; no hay GGUF, AWQ, GPTQ ni otras variantes en la información disponible |
| Idiomas soportados | Salida únicamente en inglés (`language: en`); la petición de entrada puede estar en cualquier idioma |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, bfloat16, 18,8 GB); incluye `config.json`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `processor_config.json`, `preprocessor_config.json` y `system_prompts.json` |
| Entradas adicionales | Hasta 10 imágenes de referencia y lista opcional de bounding boxes en JSON |
| Modos de operación | `t2i`, `i2i`, `t2i_bbox`, `i2i_bbox` (seleccionados por system prompt) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de tipo vision-language construido sobre Qwen3.5-9B. La parte de lenguaje se ajustó por completo y la torre de visión se mantuvo congelada, de modo que el entrenamiento se centró en la capacidad de redactar prompts y de interpretar las imágenes de referencia, no en la percepción visual. La inferencia se realiza con `AutoProcessor` y `Qwen3_5ForConditionalGeneration` de la librería Transformers, y el ejemplo oficial desactiva el modo de pensamiento (`enable_thinking=False`).

El entrenamiento tuvo dos etapas: primero un ajuste supervisado sobre pares de peticiones cortas y sus prompts expandidos; después un ajuste por preferencias sobre pares de prompts generados por el propio modelo, renderizados con FLUX 3 Image Klein con la misma semilla y ordenados según la imagen resultante. La decodificación recomendada es greedy con `top_p=0.95`, `top_k=20` y `presence_penalty=1.5` para text-to-image y 0 para edición. El número de tokens de entrenamiento, la composición exacta del dataset y la receta de preferencias (DPO, RLHF u otra) no se detallan en la información disponible.

## Capacidades

- Expansión de prompts para text-to-image: decide medio y estilo, escena, iluminación y cámara, y describe cada sujeto con colores, materiales y posición en el encuadre.
- Edición de imágenes con referencias: acepta hasta 10 imágenes de referencia e interpreta la instrucción en función de lo que aparece en ellas, especificando qué cambia y qué se mantiene por apariencia.
- Control de layout mediante bounding boxes: conserva exactamente las cajas que se le pasan, las emite como tabla tras el prompt y las cita por identificador para que el modelo de imagen coloque cada elemento donde corresponde.
- Modos con bounding boxes: `t2i_bbox` e `i2i_bbox`, que reciben las cajas como JSON después de la petición.
- Renderizado de texto dentro de la imagen: el texto que debe aparecer se mantiene literal, entre comillas.
- Comprensión multilingüe de la petición, con salida siempre en inglés.
- Generación larga: el ejemplo oficial usa `max_new_tokens=3584`, suficiente para prompts de más de 200 palabras.
- Integración directa en Diffusers (pasando el caption como `prompt`), en los templates de ComfyUI con el interruptor `enable_prompt_upsampler` y en el CLI oficial de FLUX 3, que lo activa por defecto.
- Uso de solo upsampleo: `python -m flux3.pup --prompt "..." --out caption.txt`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Generación text-to-image con FLUX 3 Image Klein: el CLI oficial lo carga por defecto, de modo que el usuario escribe una frase corta y el modelo la convierte en un prompt de más de 200 palabras con iluminación, cámara y descripción de sujetos antes de invocar el generador.
- Edición de imágenes por instrucción: usando el modo `i2i` con las referencias en orden y tres líneas de texto (aviso de orden de referencias, petición del usuario y "Output the caption."), el modelo redacta la instrucción de edición describiendo qué cambia y qué permanece.
- Maquetación controlada por cajas: en diseños con posiciones fijas, se pasan las bounding boxes en JSON y el modelo devuelve el prompt con la tabla de cajas, garantizando que cada elemento se sitúe donde indica el diseño.
- Carteles, packaging y rótulos: el texto que debe aparecer se conserva literal entre comillas, lo que reduce el riesgo de que el generador lo reescriba o deforme.
- Preprocesado por lotes de datasets de entrenamiento de difusión: el modelo puede convertir miles de peticiones cortas en captions detallados y homogéneos, con la opción de generar solo el texto sin ejecutar la difusión (`flux3.pup`).
- Integración en interfaz de usuario de ComfyUI: los templates de text-to-image de flux-3-image-klein-comfy incluyen el interruptor `enable_prompt_upsampler`, lo que permite activar o desactivar el upsampleo sin tocar código.
- Sustitución de un LLM genérico: cualquier otro modelo puede hacer esta función con los cuatro system prompts de `system_prompts.json`, por lo que este fine-tune se puede comparar directamente contra un LLM generalista en la misma tubería.
- Localización de productos: un equipo puede redactar la petición en su idioma y obtener sistemáticamente el prompt en inglés que espera el modelo de imagen, sin mantener plantillas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay cifras de MMLU, HumanEval, GSM8K ni de métricas específicas de calidad de prompt o de fidelidad de imagen. La model card únicamente menciona que el ajuste por preferencias ordenó prompts según la imagen renderizada con FLUX 3 Image Klein a la misma semilla, pero no publica la puntuación obtenida ni comparaciones cuantitativas.

## Requisitos de hardware

- Pesos en bfloat16: 18,8 GB, según el tamaño declarado del repositorio y del fichero `model.safetensors`.
- VRAM estimada para inferencia: en torno a 20-24 GB como mínimo para cargar los pesos con `device_map="auto"` y generar respuestas de hasta 3584 tokens nuevos; por encima de 24 GB para trabajar con margen de activaciones y caché KV.
- GPU recomendadas: A100 (40 u 80 GB), H100 (80 GB), L40S (48 GB) y RTX 6000 Ada (48 GB) son opciones seguras. En una RTX 4090 de 24 GB el modelo entra muy justo y puede requerir reducir `max_new_tokens`, usar `device_map` con reparto entre GPU y CPU, u offload.
- GPU de consumo: cabe en tarjetas de 24 GB o más, pero sin cuantizaciones publicadas (no hay GGUF, AWQ ni GPTQ en la información disponible), el margen es limitado.
- Opciones de despliegue: Transformers (`AutoProcessor` + `Qwen3_5ForConditionalGeneration`), el código de inferencia de FLUX 3 (`scripts/cli.py`, `flux3.pup`, `flux3.bbox`), integración con Diffusers pasando el caption como `prompt` y los templates de ComfyUI. El repositorio lleva la etiqueta `endpoints_compatible`, lo que indica compatibilidad con HuggingFace Inference Endpoints.
- Alternativas no confirmadas: vLLM, llama.cpp, Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. Como referencia de carga de trabajo, cada prompt puede requerir hasta 3584 tokens nuevos en decodificación greedy.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Image Klein PUP (este modelo) | 9.409.813.744 | No disponible | Upsampler de prompts para FLUX 3 Image Klein (t2i, edición y layout) | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en la fecha de la ficha |
| Qwen/Qwen3.5-9B (modelo base) | 9B según denominación; parámetros exactos no disponibles | No disponible | Modelo vision-language generalista | No disponible en la información proporcionada | HuggingFace |
| Cualquier otro LLM con los system prompts de `system_prompts.json` | Depende del modelo | Depende del modelo | Upsampler de prompts sin fine-tune específico | Depende del modelo | No requiere entrenamiento, pero la model card no aporta comparativa de calidad |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros upsamplers de prompts publicados.

## Limitaciones y advertencias

- La salida es exclusivamente en inglés, aunque la petición de entrada puede estar en cualquier idioma.
- Los prompts están escritos para FLUX 3 Image Klein; la sección de limitaciones de la model card está truncada en la información disponible ("The prompts are written for FLUX 3 Image Klein; no o..."), por lo que no se puede confirmar el alcance exacto de esa restricción respecto a otros modelos de imagen.
- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo genera descripciones visuales detalladas de hasta 3584 tokens en las que puede introducir elementos no solicitados, pero no se aportan tasas ni evaluaciones al respecto.
- Número de imágenes de referencia limitado a 10 y bounding boxes que deben respetarse exactamente tal como se pasan: cualquier error en el formato de las cajas se propaga al prompt.
- Licencia Apache 2.0 en este repositorio, lo que permite uso comercial con las obligaciones habituales de atribución y aviso; la licencia del modelo base Qwen/Qwen3.5-9B no se detalla en la información proporcionada y conviene verificarla antes de un despliegue en producción.
- Discrepancia de autoría relevante: el ID del repositorio consultado es Jinstudio/flux-3-image-klein-pup, mientras que la model card y las instrucciones de descarga apuntan a black-forest-labs/flux-3-image-klein-pup. Conviene verificar la procedencia del checkpoint antes de utilizarlo.
- Repositorio sin descargas ni likes y creado el 2026-10-16: no hay evidencia de uso, validación o mantenimiento por parte de la comunidad.
- Ausencia de cuantizaciones publicadas: limita el despliegue en hardware de gama de consumo y en entornos con presupuesto de VRAM ajustado.
- No hay información sobre tool calling, capacidades de agente ni modo de razonamiento; el ejemplo oficial desactiva explícitamente el modo de pensamiento.
- No se documentan versiones alternativas, pesos cuantizados ni resultados de evaluación reproducibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jinstudio/flux-3-image-klein-pup
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- FLUX 3 Image Klein base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Repositorio de inferencia de FLUX 3: https://github.com/black-forest-labs/flux-3-image-klein
- Ejemplo de prompt expandido con imagen generada: https://github.com/black-forest-labs/flux-3-image-klein/blob/main/examples/base/man_dog.json
- Templates de ComfyUI: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy
- Repositorio citado en la model card para la descarga del upsampler: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
