# prism-ml/Ternary-Bonsai-2-9B-mlx-2bit

## Resumen

Bonsai 2 Ternary 9B es un modelo visión-lenguaje de clase 9B cuyos pesos de lenguaje han sido cuantizados a valores ternarios {−1, 0, +1} y empaquetados en el formato afín de 2 bits de MLX (grupo de 128), con el objetivo de ejecutarse en Apple Silicon sobre Metal. Lo desarrolla prism-ml (Prism ML) partiendo de Qwen/Qwen3.5-9B, cuya arquitectura se mantiene sin cambios: 32 bloques, dimensión oculta 4096 y atención híbrida con 24 capas de atención lineal y 8 de atención completa. El resultado ocupa 3,46 GB en disco frente a los ~17,9 GB que requeriría el mismo modelo de lenguaje en FP16, lo que lo hace viable en equipos de consumo con memoria unificada.

La pieza diferencial es el empaquetado: una rotación de Hadamard por bloques queda plegada dentro de los pesos almacenados y el runtime incluido aplica la transformación equivalente sobre las activaciones, de modo que los pesos decodifican exactamente a los mismos valores ternarios que los empaquetados GGUF del mismo autor. La torre de visión se transporta sin rotar y en FP16, por lo que el modelo conserva entrada de imagen además de texto, con el pipeline `image-text-to-text`.

Es relevante ahora porque demuestra que un VLM de 9B con 262K tokens de contexto puede caber en 3,46 GB y ejecutarse de forma local en un Mac, con decodificación especulativa opcional mediante una cabeza de predicción multi-token entrenada aparte. La licencia Apache 2.0, heredada del modelo base, elimina fricción para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y atención completa (24 capas de atención lineal + 8 de atención completa, 32 bloques, hidden 4096); torre de visión acoplada |
| Parámetros totales | 9.410.903.280 (~9,41B: ~8,95B de lenguaje + ~0,46B de torre de visión) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (262K), heredada del backbone Qwen3.5-9B |
| Tipos de cuantización | Pesos de lenguaje ternarios {−1, 0, +1} en formato afín 2-bit de MLX con grupo de 128; torre de visión en FP16; cabeza MTP opcional en 4-bit |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (siguiendo el modelo base) |
| Formato de pesos | `safetensors` (MLX, `model_type: prism_hadamard_qwen35`); existe un empaquetado GGUF de los mismos pesos |
| Modelo base | Qwen/Qwen3.5-9B (arquitectura sin cambios) |
| Tamaño en disco | 3,46 GB (`model.safetensors`) + 0,14 GB (`mtp/`); repo de 3,6 GB |
| Backends | MLX sobre Apple Silicon (Metal): mlx-vlm ≥ 0.7.8 o el loader incluido en `runtime/` |
| Descargas / likes | 2.343 descargas, 16 likes |
| Fechas | Creado el 2026-10-01, actualizado el 2026-10-14 |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura de Qwen3.5-9B: 32 bloques transformer con dimensión oculta 4096 y un esquema de atención híbrido en el que 24 capas usan atención lineal y 8 usan atención completa, combinación que sostiene la ventana de 262K tokens con un coste de memoria contenido. Sobre ese backbone se añade una torre de visión de ~0,46B de parámetros que aporta la modalidad de imagen. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO posteriores al modelo base.

La innovación técnica está en la cuantización: los pesos de lenguaje se almacenan como ternarios en el formato afín de 2 bits de MLX, que guarda una escala y un sesgo por grupo de 128 valores (de ahí que el contenedor ocupe algo más que otros empaquetados ternarios, aunque decodifique a los mismos valores). Previamente se aplica una rotación de Hadamard por bloques que queda plegada en los pesos; el runtime aplica la transformación equivalente a las activaciones en tiempo de inferencia, lo que reduce el impacto de los valores atípicos en la cuantización extrema. Se incluye además una cabeza de predicción multi-token (`mtp/`, 4-bit, 0,14 GB) que actúa como drafter para decodificación especulativa: el modelo principal verifica cada token propuesto, por lo que la salida coincide con la decodificación normal salvo empates en float16.

## Capacidades

- Generación de texto y razonamiento, con modo "thinking" activable o desactivable mediante `enable_thinking` en la plantilla de chat.
- Comprensión de imágenes: pipeline `image-text-to-text` con la torre de visión oficial en FP16; permite también uso solo texto pasando cero imágenes.
- Conversación multi-turno con ventana de 262K tokens, adecuada para documentos e historiales largos.
- Respuestas guiadas por parámetros de muestreo diferenciados para modo thinking (`temperature=1.0`, `top_p=0.95`, `top_k=20`, `presence_penalty=1.0`) y modo no-thinking (`temperature=0.7`, `top_p=0.80`, `top_k=20`, `presence_penalty=1.5`).
- Decodificación especulativa opcional mediante la cabeza MTP incluida, útil sobre todo en tareas de copia intensiva como edición de código y reescrituras.
- Servido compatible con OpenAI a través de `python -m mlx_vlm.server`.
- Soporte de tool calling / function calling y de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente local en Mac para análisis de documentos largos: los 262K tokens de contexto permiten cargar contratos, informes o bases de código extensas y hacer preguntas sobre ellas sin trocear, con inferencia enteramente en el dispositivo.
- Descripción y extracción de información de imágenes: el pipeline `image-text-to-text` sirve para etiquetar capturas, transcribir diagramas o responder preguntas sobre fotografías en flujos de trabajo personales.
- Edición y reescritura de código en local: la cabeza MTP acelera las tareas con mucha copia literal de tokens (renombrados, refactorizaciones, parches), y el modelo verifica cada token propuesto, de modo que la salida no diverge de la decodificación normal.
- Prototipado rápido de aplicaciones VLM sin GPU: 3,46 GB caben en la memoria unificada de un portátil Apple Silicon, lo que permite iterar sobre prompts y plantillas de chat sin aprovisionar hardware dedicado.
- Procesamiento por lotes en local de documentación escaneada combinada con texto, aprovechando la ventana larga para concatenar páginas y mantener el contexto entre ellas.
- Servicio interno compatible con OpenAI: `mlx_vlm.server` expone un endpoint al que apuntar clientes existentes, útil para demos y entornos de desarrollo ofimáticos donde no se quiere enviar datos a la nube.
- Evaluación y comparación de cuantizaciones extremas: sirve como referencia práctica para medir la pérdida de calidad de un esquema ternario frente al modelo base en FP16 sobre tareas concretas del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia exclusivamente sobre Apple Silicon con Metal a través de MLX; no hay soporte de CUDA ni CPU en este empaquetado (para ello existe el pack GGUF del mismo autor).
- Espacio en disco: 3,46 GB para `model.safetensors`, más 0,14 GB si se usa la cabeza MTP. El modelo de lenguaje equivalente en FP16 ocuparía ~17,9 GB, aproximadamente 5 veces más.
- VRAM/memoria unificada estimada: el peso de los parámetros es de 3,46 GB; hay que sumar la caché KV correspondiente a la ventana utilizada (hasta 262K tokens) y el estado del runtime MLX. No se han publicado cifras concretas de memoria total necesaria.
- Cabe en GPU de consumo en el sentido de equipos Apple Silicon con memoria unificada; no se especifican modelos ni capacidades mínimas de memoria. GPU NVIDIA (A100, H100, RTX 4090) no son compatibles con este pack MLX.
- Opciones de despliegue: mlx-vlm ≥ 0.7.8 con carga nativa (`model_type: prism_hadamard_qwen35`), servidor `mlx_vlm.server` compatible con OpenAI, o el loader incluido en `runtime/` para versiones antiguas de mlx-vlm (requiere `pip install -r runtime/requirements.txt` y `quickstart.py`). `mlx-lm` 0.32.0 no puede cargar este pack; el soporte está fusionado y llegará en la próxima versión.
- Latencia y throughput: no disponibles. Como referencia cualitativa, la decodificación especulativa con MTP es aproximadamente igual o algo más lenta que la decodificación normal en chat general, y más rápida en tareas con mucha copia de tokens.
- Nota de despliegue: `mlx-vlm` decodifica de forma voraz si no se pasan explícitamente los parámetros de muestreo; con thinking activado conviene reservar al menos 8.192 tokens de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-9B-mlx-2bit | ~9,41B (8,95B LM + 0,46B visión) | 262K | Safetensors MLX, ternario 2-bit grupo 128 + visión FP16 | Apache 2.0 | HuggingFace, 3,46 GB |
| Ternary-Bonsai-2-9B-gguf (mismo autor, mismos pesos) | ~9,41B | 262K | GGUF ternario | Apache 2.0 | HuggingFace; soporta CUDA, CPU y llama.cpp sobre Metal |
| Qwen/Qwen3.5-9B (modelo base) | ~8,95B (solo lenguaje) | 262K | Safetensors FP16 (~17,9 GB) | Apache 2.0 (según modelo base) | HuggingFace; sin torre de visión en esta comparación |

No se dispone de datos de benchmarks ni de otros modelos ternarios comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3.5-9B hereda los del modelo base, no documentados aquí.
- Riesgo de alucinación: no se han publicado evaluaciones específicas para esta cuantización. La cuantización ternaria de 2 bits es agresiva y puede degradar la precisión frente al modelo en FP16; no hay datos que cuantifiquen esa pérdida.
- Decodificación voraz con thinking activado puede quedarse atascada razonando en algunos prompts; hay que pasar el sampler explícitamente.
- El modo thinking puede consumir más de 3.000 tokens incluso en peticiones simples; sin margen de salida suficiente las respuestas quedan truncadas.
- `quickstart.py` es solo una prueba de humo: responde con thinking desactivado y se detiene a los 256 tokens.
- Compatibilidad limitada: `mlx-lm` 0.32.0 no carga el pack; `mlx_vlm.server` no toma `presence_penalty` ni `min_p` de `generation_config.json`, por lo que hay que enviarlos en cada petición.
- La cabeza MTP se validó con el runtime incluido sobre mlx-vlm 0.6.3 y no se ha vuelto a comprobar en 0.7.8.
- El empaquetado MLX solo funciona en Apple Silicon; para CUDA, CPU o llama.cpp hay que usar el pack GGUF.
- Idiomas soportados no documentados: no se puede garantizar calidad fuera de los idiomas del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y las obligaciones de atribución.
- La model card advierte que el repositorio `PrismML-Eng/Bonsai-demo` es la fuente de verdad para la ejecución; ante discrepancias, prevalece la demo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-mlx-2bit
- Pack GGUF de los mismos pesos: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Demo y ejemplos (PrismML-Eng/Bonsai-demo): https://github.com/PrismML-Eng/Bonsai-demo
- Web de Prism ML: https://prismml.com
- Discord de Prism ML: https://discord.gg/prismml
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada (los resultados de búsqueda web recibidos corresponden a proyectos homónimos sin relación: Prism Launcher, GraphPad Prism, Prism de OpenAI y Prism'emploi).
