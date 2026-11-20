# litert-community/MiniCPM-V-4.7-1B

## Resumen

MiniCPM-V-4.7-1B es un modelo de lenguaje y visión (VLM) de 1.000 millones de parámetros desarrollado por OpenBMB y publicado el 12 de octubre de 2026. Esta ficha concreta corresponde a la conversión que el equipo de `litert-community` ha realizado del checkpoint original al formato **LiteRT-LM** (`.litertlm`), el runtime on-device de Google AI Edge, con el objetivo de ejecutar el modelo en teléfonos móviles y equipos de borde sin necesidad de infraestructura en la nube.

El modelo combina un decodificador de texto híbrido de estilo Qwen3.5 —18 capas de atención lineal GatedDeltaNet y 6 capas de atención completa, con dimensión oculta de 1024 y vocabulario de 248.094 tokens— con un codificador visual de 27 capas de tipo SigLIP que comprime los tokens visuales dentro del propio encoder mediante un merger de atención por ventanas 2×2 tras la capa 6 y un merger 2×2 adicional. El resultado es una compresión de 16× de los tokens de imagen, lo que permite procesar una imagen completa con solo 64 tokens inyectados en el prompt.

La relevancia de esta conversión es práctica: empaqueta el modelo en ficheros de entre 1,22 GB y 2,21 GB que se ejecutan en dispositivos como Galaxy S26, Pixel 8a o iPhone 18 Pro, con latencias de primer token de 0,93 s sobre GPU y velocidades de decodificación de 36,5 tokens/s en CPU en el Galaxy S26. Es una de las primeras rutas viables para llevar un VLM multimodal a producción en el borde con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: decodificador de texto con 18 capas GatedDeltaNet (atención lineal) + 6 capas de atención completa; codificador visual SigLIP de 27 capas con window-attention merger |
| Parametros totales | 1.000 millones (aproximado, según nomenclatura del modelo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no la declara explícitamente) |
| Tipos de cuantizacion | int8 dinámica por canal en el decodificador de texto (36 proyecciones decay/gate de GatedDeltaNet permanecen en float); embeddings int8; codificador visual en fp16 o int8 según variante; activaciones fp32 declaradas para GPU |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); se distribuyen tres variantes: `MiniCPM-V-4.7-1B-VL_int8.litertlm` (2,21 GB), `MiniCPM-V-4.7-1B-VL_int8vis.litertlm` (1,70 GB) y `MiniCPM-V-4.7-1B_int8.litertlm` (1,22 GB, solo texto) |

## Arquitectura y entrenamiento

El decodificador de texto sigue un diseño híbrido poco habitual en modelos de 1B: 18 de sus 24 capas emplean GatedDeltaNet, un mecanismo de atención lineal con estado recurrente y compuertas, mientras que las 6 restantes mantienen atención completa. Esta combinación reduce el coste computacional y de memoria en secuencias largas sin renunciar por completo a la atención global. La dimensión oculta es 1024 y el vocabulario de 248.094 tokens, coherente con el tokenizador de la familia Qwen. El codificador visual es de tipo SigLIP con 27 capas y aplica compresión temprana de tokens: un merger de atención por ventanas 2×2 tras la capa 6 y un merger 2×2 adicional, logrando una compresión total de 16× que reduce una imagen a 64 tokens visuales.

La conversión a LiteRT-LM reescribe la torre visual en PyTorch plano y adapta la plantilla de chat para que el segundo turno coincida token a token con el modelo original. El runtime `fast_vlm` impone una resolución fija de 448×448 y una imagen por mensaje, lo que difiere del pipeline original de Transformers (que hace tiling en miniatura más hasta nueve recortes). Según las mediciones del autor, las respuestas con imagen redimensionada a 448×448 fueron paráfrasis del mismo contenido en 9 de 9 casos frente al modo con tiling. Además, el runtime alimenta posiciones 1-D planas, por lo que el M-RoPE de canvas del modelo colapsa a RoPE ordinario sobre los tokens de imagen; también en 9 de 9 casos las respuestas fueron paráfrasis correctas. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Comprensión de imagen única: descripción de contenido, colores, localización de objetos y lectura de texto presente en la imagen (OCR básico), con una imagen por mensaje en la ruta `fast_vlm`.
- Generación de texto conversacional en modo "Instruct" (respuestas directas, sin modo thinking).
- Razonamiento multimodal de una sola imagen: preguntas y respuestas sobre fotografías de 448×448 con 64 tokens visuales inyectados en el prompt.
- Procesamiento de texto puro mediante el fichero `MiniCPM-V-4.7-1B_int8.litertlm`, que omite las secciones de visión y comparte los mismos bytes del decodificador.
- Ejecución on-device en CPU, GPU y Metal (iPhone), con latencias medidas en dispositivos móviles reales.
- No soporta vídeo, prompts multi-imagen ni el modo de "detalle fino" 4× en este bundle.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistencia visual en movilidad: el modelo puede responder preguntas sobre una foto tomada con el teléfono (qué hay, de qué color, dónde está un objeto, qué texto aparece) con un primer token en 0,93 s sobre GPU en un Galaxy S26, lo que permite integrarlo en apps de accesibilidad o de descripción de escenas en tiempo casi real.
- Digitalización de documentos y tickets: con la ruta de lectura de texto en imagen y 64 tokens visuales por imagen, se puede extraer información de facturas, etiquetas o carteles directamente en el dispositivo, sin enviar la imagen a un servidor y cumpliendo requisitos de privacidad.
- Moderación y filtrado de imágenes en el borde: clasificación y descripción de contenido visual en el propio terminal antes de subirlo a la nube, aprovechando el fichero `_int8vis` de 1,70 GB para móviles Android de 8 GB con GPU Mali.
- Chat de texto ligero offline: usando el fichero de 1,22 GB sin secciones de visión, se puede desplegar un asistente conversacional local en dispositivos con recursos limitados, con la misma calidad de texto que las variantes multimodales.
- Aplicaciones de campo sin conectividad: inspección visual de equipos, identificación de plantas o animales, o verificación de inventario en entornos sin red, donde la inferencia local en CPU a 36,5 tokens/s es suficiente para interacciones conversacionales.
- Prototipado de productos VLM en iOS y Android: el soporte de Metal en iPhone 18 Pro y de GPU en Galaxy S26 permite validar experiencias multimodales en hardware real antes de invertir en infraestructura de servidores.
- Educación y asistencia a personas con discapacidad visual: descripción de imágenes del entorno capturadas por la cámara del teléfono, con respuestas directas en modo Instruct y latencia baja en dispositivos de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí reporta métricas de fidelidad de la conversión y de rendimiento en dispositivo:

| Metrica | Resultado |
|---|---|
| Fidelidad del decodificador de texto (logits profesor-forzados, 48 posiciones) | Top-1 idéntico en 48/48 posiciones; Pearson 1,0000; max abs delta logit 5,3e-5 |
| Fidelidad del decodificador int8 | Top-1 idéntico en 47/48 posiciones (un empate cercano) |
| Fidelidad de la torre visual (4 entradas 448×448) | Correlación 0,99999999997 en fp32; 1,000000 end-to-end con encoder y adaptador fp16; 0,9954 con encoder int8 (peor coseno por token 0,911) |
| Prueba de 8 preguntas (Mac M4 Max, litert-lm 0.18.0, temperatura 0) | CPU 8/8; GPU 8/8 |
| Prueba de imagen (3 fotos × 3 preguntas) | 9/9 fundamentadas en CPU y 9/9 en GPU |
| Latencia de primer token (Galaxy S26, GPU, imagen 448×448) | 0,93 s |
| Velocidad de decodificación de texto (Galaxy S26, CPU) | 36,5 tokens/s |
| Prueba en Pixel 8a (`_int8vis`, CPU) | 3/3 fotos fundamentadas |
| Prueba en Galaxy S26 (CPU y GPU) | Respuestas de texto correctas ("Paris." en ambos) |
| Prueba en iPhone 18 Pro (Metal) | Resultados reportados como correctos (detalle truncado en la información disponible) |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero multimodal completo ocupa 2,21 GB (`_int8`), la variante con visión int8 ocupa 1,70 GB (`_int8vis`) y la variante solo texto 1,22 GB. El consumo de memoria en ejecución debe añadir el estado del runtime y los buffers de activación, no cuantificados en la información disponible.
- GPU recomendadas: no se especifican GPU de escritorio; las pruebas se realizaron en Mac M4 Max (CPU y GPU), Galaxy S26 (CPU y GPU), Pixel 8a (CPU) e iPhone 18 Pro (Metal).
- Cabe en GPU de consumo: sí, en el sentido de que cabe en teléfonos de gama alta y en un Mac M4 Max; para GPUs de escritorio tipo RTX 4090 o A100 no hay datos publicados, aunque por tamaño (≤2,21 GB) cabría en cualquier GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: runtime LiteRT-LM (versión probada 0.18.0) mediante el comando `litert-lm run`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: primer token en 0,93 s sobre GPU en Galaxy S26; decodificación a 36,5 tokens/s en CPU en el mismo dispositivo. No hay datos de throughput para otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato on-device |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B (LiteRT-LM) | ~1B | no disponible | Imagen + texto | Apache 2.0 | `.litertlm` (1,22-2,21 GB) |
| openbmb/MiniCPM-V-4.7-1B (original) | ~1B | no disponible | Imagen + texto (multi-imagen y vídeo según model card del original) | Apache 2.0 | safetensors / Transformers |
| Alternativas de 1B-2B con visión | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de benchmarks comparativos con otros modelos de la misma categoría, por lo que no es posible establecer una comparación cuantitativa de rendimiento. La diferencia principal frente al checkpoint original de OpenBMB es el formato y las restricciones del runtime: LiteRT-LM limita a una imagen por mensaje, resolución fija 448×448 y elimina el modo de detalle fino 4×, mientras que el modelo original soporta tiling y, según su model card, multi-imagen y vídeo.

## Limitaciones y advertencias

- Una sola imagen por mensaje: el contrato `fast_vlm` de LiteRT-LM no admite prompts multi-imagen ni vídeo en este bundle.
- Resolución fija de 448×448: las imágenes mayores se redimensionan a un cuadrado, lo que puede perder detalle en documentos densos o escenas con texto pequeño; el modo de detalle fino 4× no está incluido.
- Sin modo thinking: el bundle solo expone el modo "Instruct" con respuestas directas, lo que limita el razonamiento multi-paso explícito.
- M-RoPE colapsado a RoPE 1-D sobre tokens de imagen: según el autor, produce paráfrasis correctas en las pruebas realizadas, pero es una desviación del comportamiento del modelo original.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo VLM de 1B, es esperable en descripciones de imágenes ambiguas o con texto poco legible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no declarados; la cobertura multilingüe no está verificada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir a OpenBMB y a litert-community; conviene revisar la licencia del modelo base por si hubiera condiciones adicionales no reflejadas aquí.
- Caveat de producción: la variante con encoder visual fp16 ha provocado reinicios en móviles Android de 8 GB con GPU Mali en conversiones anteriores, según la model card; para esos dispositivos debe usarse `_int8vis`.
- Fidelidad int8: el decodificador int8 difiere del fp32 en 1 de 48 posiciones (empate cercano) y el encoder int8 baja la correlación a 0,9954, lo que puede afectar a tareas visuales finas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MiniCPM-V-4.7-1B
- Modelo base original: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Reproducción de la conversión: https://github.com/john-rocky/hf-to-litertlm/blob/main/REPRODUCE.md#2026-10-13--minicpm-v-47-1b-a-qwen35-text-hybrid-vlm-as-a-fast_vlm-file-the-window-merger-vit-re-authored-in-plain-torch-and-a-chat-template-whose-second-turn-matches-upstream-token-for-token
- Manifiesto con hechos legibles por máquina: https://huggingface.co/litert-community/MiniCPM-V-4.7-1B/blob/main/litertlm_manifest.json
