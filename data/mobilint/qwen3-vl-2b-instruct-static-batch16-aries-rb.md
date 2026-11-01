# mobilint/Qwen3-VL-2B-Instruct-static-Batch16-aries-rb

## Resumen

Qwen3-VL-2B-Instruct-static-Batch16-aries-rb es un artefacto de despliegue publicado por Mobilint que empaqueta el modelo multimodal Qwen3-VL-2B-Instruct de Alibaba Qwen para su ejecución sobre aceleradores NPU ARIES-RB de la propia Mobilint. No se trata de un modelo entrenado desde cero, sino de una compilación estática del modelo base: el encoder de visión tiene resolución fija y el decodificador de texto está compilado con un grafo estático para batch de tamaño 16, con el layout de posición de imagen (M-RoPE) incrustado en el grafo.

El modelo base es un transformer multimodal de aproximadamente 2B parámetros (el checkpoint en safetensors declara 311.164.928 parámetros, cifra que corresponde a los pesos efectivamente almacenados en el artefacto cuantizado, no al recuento nominal del modelo original). Resuelve tareas de image-text-to-text: descripción de imágenes, respuesta a preguntas visuales y conversación con una imagen por prompt. Su relevancia es de nicho: permite servir Qwen3-VL en hardware NPU de Mobilint con un pipeline de transformers modificado (`transformers-mblt`) o con `vllm-mblt`, lo que interesa a equipos que despliegan inferencia multimodal en edge o en servidores con aceleradores ARIES.

La limitación estructural es severa: el encoder acepta una única imagen de 256 × 256 por prompt, no admite vídeo ni múltiples imágenes, y el decodificador asume que el marcador de imagen ocupa exactamente 64 tokens a partir del offset 4 del prompt procesado. Cualquier plantilla que inserte un mensaje de sistema o texto antes de la imagen desplaza esa posición y produce resultados incorrectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (encoder de visión + decodificador de texto) derivado de Qwen3-VL-2B-Instruct, compilado en grafos estáticos para NPU ARIES-RB |
| Parametros totales | 311.164.928 (según safetensors del artefacto); el modelo base se denomina comercialmente 2B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | MXQ (formato propietario de Mobilint); el decodificador de texto usa layout split DeepStack y modo de núcleo automático; la visión soporta varios modos de núcleo y por defecto usa `multi` |
| Idiomas soportados | en (inglés, según la model card y los tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors más artefactos MXQ compilados; requiere `trust_remote_code=True` y código custom (`mobilint-qwen3_vl`) |

## Arquitectura y entrenamiento

El artefacto no documenta entrenamiento propio: hereda los pesos de Qwen/Qwen3-VL-2B-Instruct y los transforma en un paquete de inferencia para NPU. La arquitectura de origen es un transformer multimodal con encoder de visión y decodificador de lenguaje, con RoPE multimodal (M-RoPE) para codificar posiciones de imagen y texto. En esta versión, el encoder de visión tiene entrada fija de 256 × 256 píxeles y el decodificador se compila como grafo estático para batch 16, con el layout de imagen incrustado: el placeholder visual son 64 tokens que comienzan en el offset 4 del prompt procesado.

La innovación técnica relevante no está en el modelo sino en el empaquetado: decodificador split-static con layout DeepStack, selección automática de modo de núcleo en texto, modos de núcleo configurables en visión y compatibilidad con `transformers-mblt>=0.7.1` y `transformers>=4.57.0`. Para servir con vLLM se exige una versión de `vllm-mblt` que incluya el PR #62, porque las versiones anteriores no soportan este layout MXQ de texto. No se documentan datos de entrenamiento, composición del dataset ni fases de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) con una sola imagen por prompt.
- Descripción de imágenes y respuesta a preguntas visuales sobre una imagen de 256 × 256.
- Conversación de un turno de usuario con imagen seguida de texto, según la plantilla de chat estándar.
- Procesamiento por lotes: hasta 16 prompts de una imagen cada uno en el grafo compilado.
- Integración con `transformers` mediante `AutoModelForImageTextToText` y `AutoProcessor` con código remoto.
- Servicio mediante la API offline y el servidor HTTP compatible con OpenAI de `vllm-mblt`.
- No soporta vídeo, ni múltiples imágenes en un mismo prompt, ni layouts de prompt arbitrarios.
- No se documentan tool calling, function calling, modo thinking ni capacidades de agente en esta información.

## Casos de uso

- Clasificación y descripción por lotes en edge: con batch 16 y encoder fijo de 256 × 256, se pueden etiquetar o describir lotes de imágenes en una NPU ARIES-RB sin GPU, por ejemplo en inspección visual en planta.
- Moderación de imágenes a pequeña escala: el modelo responde a preguntas cerradas sobre el contenido de una imagen, adecuado para filtros previos en entornos con hardware Mobilint.
- Asistencia visual en dispositivos: un único prompt imagen-más-texto encaja con la plantilla estática y permite respuestas conversacionales breves en aplicaciones de campo.
- Servicio compatible con OpenAI: mediante `vllm-mblt` se expone un endpoint HTTP que permite integrar el modelo en aplicaciones existentes que ya consumen la API de OpenAI, siempre con una imagen por petición.
- Validación de pipelines multimodales en NPU: útil para equipos que evalúan el rendimiento de ARIES-RB con un modelo de referencia antes de portar modelos propios.
- Procesamiento documental simple: extracción de texto o descripción de capturas y documentos rasterizados a 256 × 256, con la advertencia de que la resolución fija limita la legibilidad de texto pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta una validación funcional: 16 generaciones greedy en batch coincidieron token a token con generaciones individuales sobre cuatro pares imagen/prompt repetidos a lo largo del batch, usando `transformers-mblt` 0.7.1 en una NPU ARIES. Esa prueba no establece precisión sobre ningún benchmark ni valida layouts de prompt arbitrarios, posiciones de imagen distintas u otros hardware.

## Requisitos de hardware

- NPU Mobilint ARIES-RB y runtime compatible de Mobilint; el artefacto no está pensado para GPU convencional.
- `transformers-mblt>=0.7.1` y `transformers>=4.57.0` para la ruta de Transformers.
- Para vLLM, una versión de `vllm-mblt` que contenga el PR #62.
- Tamaño del repositorio: 3.5 GB, lo que condiciona el espacio de almacenamiento y la memoria del acelerador.
- VRAM estimada para GPU: no disponible; el paquete está compilado para NPU y no se documenta una ruta de ejecución en CUDA.
- Latencia y throughput: no disponibles; la model card indica únicamente que distintos modos de núcleo pueden favorecer la latencia de una sola imagen frente al throughput agregado, y que el modo por defecto en visión es `multi` por throughput.
- Opciones de despliegue documentadas: `transformers-mblt` y `vllm-mblt` (API offline y servidor HTTP compatible con OpenAI).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| mobilint/Qwen3-VL-2B-Instruct-static-Batch16-aries-rb | 311.164.928 en safetensors (base 2B) | no disponible | Imagen + texto, 1 imagen 256 × 256 | apache-2.0 | NPU ARIES-RB |
| Qwen/Qwen3-VL-2B-Instruct (modelo base) | ~2B | no disponible en esta información | Imagen + texto, resolución flexible | apache-2.0 | GPU/CPU estándar |
| Otros empaquetados de Qwen3-VL para aceleradores | no disponible | no disponible | Imagen + texto | según autor | según acelerador |

La comparación relevante es con el modelo base: este artefacto sacrifica flexibilidad de resolución, soporte de vídeo y multi-imagen, y portabilidad de hardware, a cambio de un grafo estático por lotes ejecutable en NPU ARIES-RB. No se dispone de datos de benchmarks para comparar rendimiento con alternativas.

## Limitaciones y advertencias

- Una sola imagen de 256 × 256 por prompt; no admite vídeo ni varias imágenes en el mismo prompt.
- El layout de imagen está incrustado en el grafo: el placeholder ocupa 64 tokens desde el offset 4. Añadir un mensaje de sistema o texto antes de la imagen desplaza la posición y produce resultados incorrectos.
- La ruta `transformers-mblt` no valida automáticamente la posición compilada; la responsabilidad recae en quien llama.
- Dependencia de hardware propietario: sin NPU ARIES-RB y runtime Mobilint, el artefacto no es utilizable.
- Dependencia de versiones concretas de software (`transformers-mblt>=0.7.1`, `transformers>=4.57.0`, `vllm-mblt` con PR #62); versiones anteriores no soportan el layout MXQ de texto.
- Idiomas documentados: solo inglés, lo que limita su uso en castellano sin evaluación adicional.
- Riesgo de alucinación inherente al modelo base, no evaluado en esta compilación; la validación reportada es funcional, no de calidad.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del runtime y del software de Mobilint, que se distribuyen por separado.
- No se documentan sesgos, contexto máximo ni comportamiento en prompts largos; no debe asumirse ninguno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mobilint/Qwen3-VL-2B-Instruct-static-Batch16-aries-rb
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- PR de vllm-mblt requerido: https://github.com/mobilint/vllm-mblt/pull/62
