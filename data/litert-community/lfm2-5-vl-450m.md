# litert-community/LFM2.5-VL-450M

## Resumen

LFM2.5-VL-450M es un modelo de visión-lenguaje (VLM) de 450 millones de parámetros desarrollado por LiquidAI, distribuido aquí en formato LiteRT-LM por la comunidad litert-community para inferencia en dispositivo (on-device). Combina un backbone de texto híbrido LFM2 —16 capas con convoluciones cortas con compuerta y atención de consultas agrupadas (GQA), vocabulario de 64k— con una torre de visión SigLIP2 compacta de 12 capas y dimensión oculta 768. El resultado es un modelo capaz de procesar texto e imágenes en el mismo prompt con un peso muy reducido.

La relevancia de esta conversión concreta está en el formato: los ficheros `.litertlm` permiten ejecutar el modelo con el runtime LiteRT-LM de Google en CPU y GPU (macOS/Android vía OpenCL), sin necesidad de infraestructura de servidor. El fichero int4 ocupa 0,41 GB y el int8 0,56 GB, lo que lo sitúa en la categoría de modelos que caben en cualquier dispositivo móvil o placa embebida. Procesa una imagen por prompt a 512×512, que se traduce en 256 tokens visuales, con una ventana de contexto máxima de 4096 tokens.

Ahora bien, la model card documenta un defecto importante del runtime: en las versiones 0.16.0 y en la rama `main` actual, solo el cuarto superior de la imagen llega al modelo, lo que invalida cualquier tarea posicional (localizar, contar, enumerar). El repositorio incluye una compilación corregida (`int4_fixB`) que reexporta los grafos de visión para que el desagrupado de píxeles 2×2 ocurra dentro del codificador; esta variante restaura la imagen completa pero no la capacidad de grounding por coordenadas, que según el autor sigue siendo una capacidad reservada al modelo de 3B de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone de texto LFM2 (16 capas, convoluciones cortas con compuerta + GQA) + torre de visión SigLIP2 (12 capas, hidden 768) |
| Parametros totales | 450M (según nombre del modelo; desglose no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (caché KV máxima) |
| Tipos de cuantizacion | int8 dinámica (lineales de texto, convoluciones, embedding, torre de visión); int4 blockwise-32 OCTAV en lineales de texto con embedding y lm_head en int8 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base original en formato PyTorch/safetensors no confirmado en la información disponible |

## Arquitectura y entrenamiento

El backbone de texto es un transformer híbrido de la familia LFM2: 16 capas que alternan convoluciones cortas con compuerta (gated short-convolutions) y atención de consultas agrupadas, con un vocabulario de 64k tokens. La torre de visión es un SigLIP2 compacto de 12 capas con dimensión oculta 768. La imagen se redimensiona a 512×512 y se proyecta a 256 tokens suaves mediante un adaptador de visión que realiza el desagrupado de píxeles 2×2 (pixel-unshuffle). El modelo es de tipo no-thinking, con plantilla ChatML embebida en el fichero y marcadores de posición de imagen insertados por el procesador de datos LFM2 del runtime.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card tampoco detalla innovaciones de decodificación especulativa ni mecanismos de atención lineal más allá de la propia arquitectura híbrida. Cabe señalar que la conversión a LiteRT se realizó con `litert-torch` (antiguo `ai-edge-torch`), y el autor reporta que una conversión sin modificaciones con `litert_torch.convert` coincidió con el original hasta 4e-7 en un Galaxy S26 con LiteRT 2.2.0 y Android 16.

## Capacidades

- Generación de texto e inferencia multimodal imagen-texto en el mismo prompt (pipeline `image-text-to-text`).
- Descripción de imágenes (captioning) y respuesta a preguntas sobre contenido visual.
- Reconocimiento óptico de caracteres (OCR) sobre sujetos dominantes de gran tamaño.
- Preguntas sobre color dominante, formas y conteo de objetos simples (con las salvedades del defecto de visión descrito).
- Procesamiento de una imagen por prompt, en formato PNG o JPEG mediante `--attachment`.
- Ejecución en CPU y GPU (macOS/Android con OpenCL) a través del runtime LiteRT-LM.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking: no, el modelo es explícitamente no-thinking según la model card.
- Audio: no soportado.

## Casos de uso

- Asistente visual en aplicaciones Android: el fichero int4 de 0,41 GB se integra mediante la librería `com.google.ai.edge.litert:litert` y permite responder preguntas sobre una foto tomada por el usuario sin salir del dispositivo, preservando la privacidad y evitando costes de API.
- OCR ligero en entornos sin conectividad: útil para digitalizar carteles, etiquetas o documentos con texto grande y dominante, siempre que la consulta no requiera localización espacial del texto en la imagen.
- Clasificación y descripción automática de imágenes en pipelines de catalogación: el modelo puede generar descripciones y detectar el color o el sujeto principal de una imagen a 512×512 con un coste computacional mínimo.
- Prototipado rápido de funcionalidades VLM en macOS: la ejecución en CPU y GPU vía OpenCL permite validar flujos de imagen-texto con `litert-lm run … --attachment photo.png` antes de invertir en modelos mayores.
- Filtrado previo en dispositivos de bajo consumo: al caber en 0,41 GB, puede desplegarse en placas embebidas o móviles de gama baja para tareas de triaje visual (¿contiene texto?, ¿de qué color es?, ¿qué objeto domina?) antes de escalar a un modelo mayor.
- Educación y demos interactivas: su tamaño reducido y su licencia abierta facilitan su uso en talleres y entornos docentes para ilustrar el funcionamiento de un VLM híbrido en dispositivo.
- Verificación de accesibilidad: generación de texto alternativo para imágenes en aplicaciones móviles, con la limitación de que el análisis posicional no es fiable en las versiones afectadas del runtime.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las comprobaciones de calidad del propio autor de la conversión, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Configuración | Texto (8 preguntas) | Imagen (5 preguntas) |
|---|---|---|
| PyTorch bf16 (referencia) | no disponible | 5/5 |
| LiteRT int4-b32, CPU (recomendado) | 8/8 | 4/5 |
| LiteRT int8, CPU | 6/8 | 3/5 |

Las pruebas de imagen son cinco fixtures sintéticos deterministas: color dominante, OCR de texto grande, forma, conteo de tres cuadrados y palabra más grande. El int4 falla solo la pregunta de forma. El autor corrige (2026-08-14) que estos fallos no son una limitación de la escala de 450M, sino del defecto del runtime. En la prueba de bandas numeradas (512×512 con 16 bandas horizontales), el fichero estándar devuelve `1 2 3 4 4 4 1 2 3 3 1 2 2 1 1 2 2 1 1` en lugar de `1 … 16`; el fichero `int4_fixB` devuelve `1 … 16` en litert-lm 0.16.1 y 0.17.0 (medido el 2026-09-16). En la captura de 10 objetivos del issue LiteRT-LM#3246, el fichero estándar acierta 0/10 y el `fixB` 1/10.

## Requisitos de hardware

- VRAM/RAM estimada: 0,41 GB para el fichero int4 y 0,56 GB para el int8, más el espacio de la caché KV para hasta 4096 tokens.
- GPU recomendadas: no aplica en el sentido de servidor; el runtime soporta CPU y GPU con OpenCL en macOS y Android. En iOS, Metal falla al crear el motor para esta familia (issue LiteRT-LM#3129), por lo que debe usarse CPU.
- Cabe en cualquier GPU de consumo y en dispositivos móviles: el tamaño de fichero está por debajo de 1 GB.
- Opciones de despliegue: runtime `litert-lm` (pip, versión mínima verificada 0.19.0 para los ficheros int4 e int8), integración Android mediante `com.google.ai.edge.litert:litert`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-VL-450M (esta ficha) | 450M | 4096 | Sí, 1 imagen 512×512 → 256 tokens | LFM Open License v1.0 | `.litertlm` |
| LFM2.5-VL-3B (litert-community) | 3B | no disponible | Sí | LFM Open License v1.0 (según modelo base) | `.litertlm` |
| LiquidAI/LFM2.5-VL-450M (original) | 450M | no disponible | Sí | LFM Open License v1.0 | PyTorch (no confirmado) |

La comparación más directa es con el modelo de 3B de la misma familia, que según la model card conserva la capacidad de grounding por coordenadas que el de 450M no alcanza. No se dispone de datos de benchmarks comparativos con otras familias de VLM pequeños en la información proporcionada.

## Limitaciones y advertencias

- Defecto crítico del runtime: en litert-lm 0.16.0 y en `main`, solo el cuarto superior de la imagen llega al modelo. Cualquier tarea posicional (localizar, contar, enumerar, "cuál está abajo") devuelve resultados incorrectos sin emitir error. Afecta a todos los ficheros LFM2.5-VL, no solo a este.
- La compilación `int4_fixB` corrige la visibilidad de la imagen completa, pero no el grounding por coordenadas: sigue siendo una capacidad del modelo de 3B de la familia (1/10 en la captura de 10 objetivos del issue #3246).
- Una sola imagen por prompt, redimensionada a 512×512; no admite múltiples imágenes ni resolución nativa.
- Ventana de contexto limitada a 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- En iOS, el backend Metal falla al crear el motor; es necesario usar CPU.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- No se han documentado sesgos conocidos ni tasas de alucinación en la información proporcionada; como todo VLM de pequeño tamaño, es previsible una mayor tasa de error en razonamiento complejo y en preguntas que requieran lectura fina de la imagen.
- Licencia LFM Open License v1.0: es una licencia "other", no Apache 2.0 ni MIT. Debe revisarse el texto completo antes de uso comercial; la información disponible no detalla las restricciones concretas.
- El repositorio ocupa 4,1 GB e incluye varias compilaciones; conviene seleccionar el fichero adecuado según el runtime y la tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/LFM2.5-VL-450M
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Modelo hermano de 3B: https://huggingface.co/litert-community/LFM2.5-VL-3B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue del defecto de visión: https://github.com/google-ai-edge/LiteRT-LM/issues/3246
- Issue del fallo de Metal en iOS: https://github.com/google-ai-edge/LiteRT-LM/issues/3129
- Script de reexportación de visión: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/reexport_vision_unshuffle.py
- Script de reempaquetado: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/repack_vision.py
- Medición de paridad LiteRT en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
