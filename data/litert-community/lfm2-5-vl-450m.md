# litert-community/LFM2.5-VL-450M

## Resumen

LFM2.5-VL-450M es un modelo de lenguaje y visión (VLM) de 450 millones de parámetros desarrollado originalmente por Liquid AI y convertido por la comunidad litert-community al formato LiteRT-LM (`.litertlm`) para inferencia en dispositivo. El modelo combina un backbone de texto híbrido de la familia LFM2 (16 capas con convoluciones cortas con compuerta y atención de consultas agrupadas, vocabulario de 64k) con una torre de visión SigLIP2 compacta de 12 capas y dimensión oculta 768. Su relevancia radica en que es un VLM funcional en un tamaño que cabe en prácticamente cualquier dispositivo: el archivo int4 ocupa 0,41 GB y el int8 0,56 GB.

La conversión a LiteRT-LM permite ejecutar texto e imagen de extremo a extremo sobre el runtime pip de `litert-lm`, con soporte de CPU y GPU (OpenCL en macOS y Android; Metal en iOS falla en la creación del motor para esta familia). El modelo procesa una imagen por prompt, redimensionada a 512×512 y convertida en 256 tokens suaves, con una ventana de contexto máxima de 4096 tokens de caché KV.

Es importante señalar que la versión publicada arrastra un defecto conocido del runtime: en `litert-lm` 0.16.0 y en `main`, solo el cuarto superior de la imagen llega al modelo, lo que invalida cualquier tarea posicional (localizar, contar, enumerar). El repositorio incluye una compilación corregida (`LFM2.5-VL-450M_int4_fixB.litertlm`) que reexporta los grafos de visión con el pixel-unshuffle 2×2 dentro del codificador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone de texto LFM2 (16 capas, convoluciones cortas con compuerta + atención GQA) + torre de visión SigLIP2 (12 capas, hidden 768) |
| Parámetros totales | 450M (según denominación del modelo; desglose exacto no disponible) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens máximo de caché KV |
| Tipos de cuantización | int8 dinámica (lineales de texto, convoluciones, embedding y torre de visión); int4 blockwise-32 OCTAV en lineales de texto con embedding y lm_head en int8 y torre de visión en int8 |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base original en formato PyTorch no especificado en la información disponible |
| Entrada de imagen | 1 imagen por prompt, redimensionada a 512×512, 256 tokens suaves; PNG/JPEG vía `--attachment` |
| Backend | CPU y GPU (OpenCL en macOS/Android); Metal en iOS falla en la creación del motor |
| Runtime mínimo verificado | `litert-lm` 0.19.0 para los archivos int4 e int8 |
| Plantilla de chat | ChatML-style embebida en el archivo; placeholders de imagen insertados por el procesador de datos LFM2 del runtime (modelo no-thinking) |
| Tamaño de archivo | int4: 0,41 GB; int8: 0,56 GB; int4_fixB: 0,41 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida: el backbone de texto LFM2 consta de 16 capas que alternan convoluciones cortas con compuerta y atención de consultas agrupadas (GQA), con un vocabulario de 64k tokens. La torre de visión es un SigLIP2 compacto de 12 capas con dimensión oculta 768. La imagen se procesa a 512×512 y se proyecta a 256 tokens suaves mediante un adaptador de visión. Una particularidad técnica relevante es que la familia LFM2.5-VL realiza el pixel-unshuffle 2×2 en el adaptador de visión, no en el codificador, lo que provoca incompatibilidad con la suposición del runtime LiteRT-LM y origina el defecto posicional descrito.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La conversión a LiteRT-LM se realizó con `litert_torch.convert`; según la model card, una conversión de un modelo PyTorch sin modificar coincidió con el original hasta 4e-7 en un Galaxy S26 con LiteRT 2.2.0 sobre Android 16. El proceso de conversión incluye la cuantización de lineales de texto, convoluciones, embedding y torre de visión, y en la variante int4 se aplica cuantización blockwise-32 OCTAV.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas en formato ChatML.
- Comprensión de imágenes: descripción (captioning), preguntas sobre color dominante, OCR de texto grande y reconocimiento de formas.
- Conteo de objetos en imágenes (con las limitaciones posicionales indicadas).
- Procesamiento de una imagen por prompt, redimensionada automáticamente por el runtime a 512×512.
- Inferencia en dispositivo sobre CPU y GPU (OpenCL en macOS y Android).
- Modelo no-thinking: no dispone de modo de razonamiento extendido.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente de accesibilidad en móvil: el modelo puede describir el contenido de una foto capturada por el usuario y responder preguntas sobre color o texto visible, ejecutándose en CPU sobre el propio dispositivo con un archivo int4 de 0,41 GB y sin conexión a red.
- OCR ligero en aplicaciones de digitalización: con la compilación `int4_fixB`, que restaura la imagen completa, puede extraer texto grande de documentos o etiquetas en escenarios donde no se requiere precisión de coordenadas, integrándose en un pipeline Android mediante `litert-lm run --attachment`.
- Clasificación y verificación visual en el borde: preguntas deterministas sobre fixtures sintéticos (color dominante, forma, palabra más grande) permiten usarlo como verificador rápido en pruebas automatizadas de aplicaciones de cámara.
- Moderación o etiquetado de imágenes en local: al no requerir subida a la nube, encaja en flujos donde la privacidad impide enviar capturas a un servicio externo, aceptando la limitación de una sola imagen por prompt y 4096 tokens de contexto.
- Prototipado de interfaces multimodales: su tamaño reducido permite iterar rápidamente en el diseño de asistentes que combinan texto e imagen en dispositivos de gama media, usando el runtime pip de `litert-lm` como entorno de desarrollo.
- Evaluación comparativa de runtimes en el borde: sirve como referencia para medir el comportamiento de LiteRT-LM frente a otras alternativas en Android y macOS, especialmente para detectar regresiones en el camino de visión (como el issue #3246).
- Tareas de captioning en aplicaciones de galería: generar descripciones breves de fotos para indexación local, aprovechando que el captioning funciona correctamente incluso con el archivo estándar pese al recorte superior de la imagen.

## Benchmarks y rendimiento

Los datos disponibles son pruebas de sanidad internas del repositorio, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se ejecutaron con CLI pip de `litert-lm` 0.16.0, decodificación greedy, motor nuevo por pregunta y `--cache no`, sobre cinco fixtures sintéticos deterministas de visión y ocho preguntas de texto.

| Configuración | Texto (8 preguntas) | Imagen (5 preguntas) |
|---|---|---|
| PyTorch bf16 (referencia) | — | 5/5 |
| LiteRT int4-b32, CPU (recomendado) | 8/8 | 4/5 |
| LiteRT int8, CPU | 6/8 | 3/5 |

En la prueba de bandas numeradas sobre imagen 512×512, el archivo estándar devuelve una secuencia incorrecta (`1 2 3 4 4 4 1 2 3 3 1 2 2 1 1 2 2 1 1`) frente a la esperada `1 … 16`; la compilación `int4_fixB` devuelve `1 … 16` en `litert-lm` 0.16.1 y 0.17.0 (medido el 2026-09-16). En la captura de 10 objetivos del issue LiteRT-LM#3246, el archivo corregido obtiene 1/10 y el estándar 0/10.

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo int4 ocupa 0,41 GB y el int8 0,56 GB; el repositorio completo pesa 4,1 GB. Al ejecutarse en dispositivo, el consumo se cubre con memoria del sistema, no con VRAM dedicada.
- GPU recomendadas: no aplica en el sentido de centros de datos; el backend GPU soportado es OpenCL en macOS y Android. En iOS, Metal falla en la creación del motor (issue LiteRT-LM#3129) y debe usarse CPU.
- Cabe en cualquier GPU de consumo y en móviles de gama media; no requiere A100, H100 ni RTX 4090.
- Opciones de despliegue: runtime pip `litert-lm` (versión mínima verificada 0.19.0 para los archivos int4 e int8), con CLI `litert-lm run … --attachment`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-VL-450M (LiteRT-LM) | 450M | 4096 | Sí, 1 imagen/prompt, 512×512 → 256 tokens | LFM Open License v1.0 | `.litertlm` |
| LFM2.5-VL-3B (LiteRT-LM) | 3B | No disponible | Sí | LFM Open License v1.0 (según modelo base) | `.litertlm` |
| LiquidAI/LFM2.5-VL-450M (original) | 450M | No disponible | Sí | LFM Open License v1.0 | Pesos PyTorch (formato no especificado) |

La comparación con alternativas de otros fabricantes (por ejemplo, VLMs de tamaño similar en formato GGUF u ONNX) no está disponible en la información proporcionada. El modelo de 3B de la misma familia es la referencia natural: el archivo de 450M prioriza tamaño mínimo y ubicuidad, mientras que las capacidades de grounding por coordenadas se atribuyen al modelo de 3B según la model card.

## Limitaciones y advertencias

- Defecto posicional conocido: en `litert-lm` 0.16.0 y en `main`, solo el cuarto superior de la imagen llega al modelo, lo que produce respuestas erróneas y bien formateadas en tareas de localización, conteo, enumeración y preguntas posicionales, sin emitir error.
- El defecto afecta a todos los archivos LFM2.5-VL, no solo a este, por la ubicación del pixel-unshuffle 2×2 en el adaptador de visión (issue LiteRT-LM#3246).
- La compilación `int4_fixB` restaura el área visible pero no el grounding por coordenadas, que sigue siendo una capacidad del modelo de 3B; obtiene 1/10 en la prueba de 10 objetivos.
- Una sola imagen por prompt y contexto máximo de 4096 tokens de caché KV, lo que limita conversaciones multimodales largas.
- Metal en iOS falla en la creación del motor para esta familia; es necesario usar CPU en iOS.
- El modelo no dispone de modo thinking ni de razonamiento extendido.
- No hay información sobre sesgos, tasas de alucinación ni cobertura idiomática; deben evaluarse empíricamente antes de producción.
- Licencia LFM Open License v1.0: es necesario revisar el archivo LICENSE del repositorio para confirmar las condiciones de uso comercial, ya que la model card la etiqueta como `other`.
- La calidad medida en texto es superior en int4 (8/8) que en int8 (6/8) en las pruebas del repositorio, lo que contradice la intuición habitual de que mayor precisión implica mejor calidad.
- Los resultados de calidad proceden de fixtures sintéticos y ocho preguntas de texto, no de benchmarks estandarizados; la generalización a dominios reales no está validada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/LFM2.5-VL-450M
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Modelo hermano de 3B: https://huggingface.co/litert-community/LFM2.5-VL-3B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue del defecto posicional: https://github.com/google-ai-edge/LiteRT-LM/issues/3246
- Issue de Metal en iOS: https://github.com/google-ai-edge/LiteRT-LM/issues/3129
- Script de reexportación de visión: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/reexport_vision_unshuffle.py
- Script de reempaquetado: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/repack_vision.py
- Medición de fidelidad de conversión en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
