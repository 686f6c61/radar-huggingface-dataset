# inclusionAI/ArmorOCR-GGUF

## Resumen

ArmorOCR-GGUF es la distribucion cuantizada en formato GGUF de ArmorOCR, un framework de dos etapas para reconocimiento optico de caracteres (OCR) con perception adversarial y grounding espacial, desarrollado por inclusionAI (equipo ant-research). El modelo base se construye sobre Qwen3-VL-8B-Instruct y esta disenado especificamente para extraer texto en imagenes donde los sistemas OCR convencionales fallan: texto rotado, espejado, diminuto, estilizado, manuscrito, con bajo contraste, degradado por artefactos de captura o incrustado mediante tecnicas de generacion AIGC.

La relevancia de esta release radica en que traslada un modelo de vision-lenguaje de 8.190 millones de parametros a un formato ejecutable localmente con llama.cpp, ofreciendo dos niveles de cuantizacion (Q8_0 y Q4_K_M) tanto para el modelo principal como para el proyector visual (mmproj). Esto permite desplegar un OCR grounded adversarial en hardware de consumo, con un servidor compatible con la API de OpenAI y sin dependencia de infraestructura cloud.

El modelo mantiene el esquema de razonamiento explicito del modelo base: el texto reconocido se emite dentro de etiquetas `<answer></answer>` y el razonamiento previo dentro de `<analyze></analyze>`, lo que facilita la trazabilidad de la prediccion en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (base: Qwen3-VL-8B-Instruct) con proyector visual separado (mmproj) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y Q4_K_M (modelo principal y mmproj) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0, sujeta adicionalmente a la licencia y politica de uso aceptable de Qwen/Qwen3-VL-8B-Instruct |
| Formato de pesos | GGUF (repo de 15,1 GB) |

## Arquitectura y entrenamiento

ArmorOCR es un framework de dos etapas para perception visual adversarial con grounding. La primera etapa se orienta a la localizacion de regiones de texto en la imagen (grounding espacial, evaluado con IoU); la segunda realiza el reconocimiento del contenido textual dentro de dichas regiones. El modelo se construye sobre Qwen3-VL-8B-Instruct, un transformer multimodal con proyector visual, y la release GGUF separa explicitamente el modelo linguistico y el proyector (`mmproj`), ambos disponibles en Q8_0 y Q4_K_M.

El entrenamiento emplea una tecnica denominada Observation-Transferred Self-Distillation, descrita en el paper arXiv:2608.20122 (Linhan Cao et al., 2026). El modelo se evalua sobre el benchmark AdvSpot, que cubre cinco categorias de dificultad: manipulacion espacial (texto rotado, espejado, diminuto), variacion de glifos (estilizado, manuscrito), degradacion de imagen (artefactos de captura, post-procesado), mezcla contextual (bajo contraste, fusion AIGC, superposicion de patrones) y codificacion visual (simbolos, puntos, lineas). No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- OCR con grounding espacial: localiza regiones de texto en la imagen y devuelve tanto el contenido reconocido como su ubicacion (evaluado mediante IoU).
- Reconocimiento robusto ante perturbaciones adversarias: texto rotado, espejado, de tamano muy reducido, estilizado, manuscrito, con bajo contraste, con superposicion de patrones o generado por IA.
- Decodificacion de codificaciones visuales no literales: simbolos, puntos y lineas que representan caracteres.
- Razonamiento explicito en dos fases: salida estructurada con `<analyze>` (razonamiento) y `<answer>` (texto final reconocido).
- Entrada image-text-to-text: acepta imagenes codificadas en base64 junto con instrucciones en lenguaje natural.
- Soporte multilingue limitado a ingles y chino.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`) a traves de `llama-server`.
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes multi-paso, audio ni modo thinking independiente.

## Casos de uso

- Digitalizacion de documentos historicos o escaneados de baja calidad: el modelo mantiene precision competitiva en las categorias de artefactos de captura (43,3 de accuracy) y post-procesado (63,3), lo que lo hace adecuado para pipelines de archivo donde el OCR clasico falla por ruido o compresion.
- Lectura de matricula o senalizacion en imagenes de trafico y vigilancia: la categoria de texto rotado alcanza 57,1 de accuracy en Q8_0, superior al modelo base, lo que resulta util para texto en perspectiva o angulos no frontales.
- Verificacion de captchas y pruebas anti-bot en entornos controlados de seguridad: la capacidad de decodificar texto estilizado, con superposicion de patrones y simbolos permite auditar la robustez de mecanismos de verificacion visual propios.
- Extraccion de texto en capturas de pantalla y documentos generados por IA: la categoria AIGC Fusion obtiene 82,9 de accuracy, adecuada para procesar contenido sintetico en flujos de moderacion o analisis de datos.
- Procesamiento de formularios manuscritos: la categoria Handwritten Text alcanza 53,3 en Q8_0 y Q4_K_M, util para digitalizacion de encuestas o registros en papel con escritura variable.
- Despliegue en estacion de trabajo local sin GPU dedicada de datacenter: la cuantizacion Q4_K_M permite servir el modelo con llama.cpp en hardware Apple Silicon (validado en M3 Pro con Metal), habilitando OCR privado on-premise sin enviar imagenes a la nube.
- Analisis de imagenes con bajo contraste en entornos medicos o industriales: la mejora de 42,9 a 51,4 en la categoria Low Contrast con Q8_0 respecto al modelo base indica mayor tolerancia a iluminacion deficiente.

## Benchmarks y rendimiento

Resultados sobre el release publico de AdvSpot (383 imagenes / 389 pares VQA con grounding), con temperatura 0 y servido mediante `llama-server` (build b12359) en Apple M3 Pro con Metal. La columna `base` corresponde a ArmorOCR en precision completa segun el paper.

| Categoria | Subtipo | base | Q8_0 | Q4_K_M |
|---|---|---|---|---|
| Spatial Manipulation | Rotated Text | 54,3 | 57,1 | 54,3 |
| | Mirrored Text | 46,7 | 46,7 | 40,0 |
| | Tiny Text | 57,1 | 62,9 | 57,1 |
| Glyph Variation | Stylized Text | 26,7 | 26,7 | 23,3 |
| | Handwritten Text | 46,7 | 53,3 | 53,3 |
| Imaging Degradation | Capture Artifacts | 43,3 | 43,3 | 43,3 |
| | Post-processing | 60,0 | 63,3 | 63,3 |
| Contextual Blending | Low Contrast | 42,9 | 51,4 | 51,4 |
| | AIGC Fusion | 82,9 | 82,9 | 80,0 |
| | Pattern Overlay | 66,7 | 63,3 | 63,3 |
| Visual Encoding | Symbol Encoding | 68,6 | 68,6 | 68,6 |
| | Dot Encoding | 63,3 | 63,3 | 63,3 |
| | Line Encoding | 54,3 | 54,3 | 57,1 |
| **Avg. Acc.** | | **57,1** | **58,9** | **57,3** |
| **Avg. IoU** | | **63,2** | **64,2** | **61,7** |

La cuantizacion Q8_0 supera ligeramente al modelo base en accuracy media (58,9 frente a 57,1) y en IoU (64,2 frente a 63,2), mientras que Q4_K_M iguala practicamente al base en accuracy (57,3) con una perdida de 1,5 puntos de IoU. No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo GGUF ocupa 15,1 GB, por lo que Q8_0 requiere del orden de 8-9 GB para los pesos del modelo mas el proyector, y Q4_K_M aproximadamente 5-6 GB, sin contar el contexto KV cache.
- GPU recomendadas: no se especifican en la model card. El unico entorno validado documentado es Apple M3 Pro con backend Metal.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 12 GB o mas de VRAM para Q4_K_M y 16 GB o mas para Q8_0; no confirmado por el autor en la informacion proporcionada.
- Opciones de despliegue: llama.cpp con `llama-server` y flag `--mmproj` (unico metodo documentado); el script `serve_gguf.sh` incluido en el repo facilita el arranque. No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. La evaluacion se realizo con `max_tokens` 1024 y timeout de 600 segundos en el ejemplo de cliente, lo que sugiere latencias no triviales en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| ArmorOCR-GGUF (este) | 8,19 B | no disponible | OCR grounded adversarial sobre Qwen3-VL-8B | Apache 2.0 (+ terminos Qwen) | GGUF Q8_0 / Q4_K_M |
| Qwen3-VL-8B-Instruct | 8 B (aprox.) | no disponible | Vision-lenguaje general | no disponible en la informacion | safetensors, GGUF (comunidad) |
| OCR clasico (Tesseract, PaddleOCR) | no aplica (no neuronal generativo o mucho menor) | no aplica | OCR sin grounding generativo | permisivas | binarios / ONNX |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada: el paper solo reporta resultados frente al modelo base ArmorOCR en AdvSpot. Frente a Qwen3-VL-8B-Instruct, del que deriva, ArmorOCR anade el entrenamiento especifico de perception adversarial y grounding, pero no se aportan cifras comparativas directas.

## Limitaciones y advertencias

- Rendimiento bajo en texto estilizado (26,7 de accuracy en Q8_0) y en texto espejado (46,7), con caida adicional a 40,0 en Q4_K_M para este ultimo: no es fiable como unico sistema en esos dominios.
- Cobertura linguistica limitada a ingles y chino; no se garantiza comportamiento en castellano ni en otros idiomas.
- La cuantizacion Q4_K_M degrada el IoU de grounding en 1,5 puntos y el accuracy en categorias concretas (Pattern Overlay, AIGC Fusion, Mirrored Text); para tareas que dependan de localizacion precisa conviene Q8_0.
- Licencia Apache 2.0 condicionada: el uso queda adicionalmente sujeto a la licencia y politica de uso aceptable de Qwen/Qwen3-VL-8B-Instruct, lo que puede imponer restricciones adicionales para uso comercial.
- Riesgo de alucinacion inherente a un modelo generativo: puede emitir texto plausible no presente en la imagen, especialmente en regiones de bajo contraste o con patrones superpuestos.
- No se documentan sesgos especificos ni evaluaciones de robustez fuera de AdvSpot.
- El unico backend validado es llama.cpp con Metal; el rendimiento en CUDA u otros backends no esta confirmado por el autor.
- No se dispone de informacion sobre longitud de contexto, datos de entrenamiento ni fases de alineacion, lo que dificulta evaluar el comportamiento en documentos de muchas paginas.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/inclusionAI/ArmorOCR-GGUF
- Modelo base en Hugging Face: https://huggingface.co/inclusionAI/ArmorOCR
- Repositorio de codigo: https://github.com/ant-research/ArmorOCR
- Paper: https://arxiv.org/abs/2608.20122
- Dataset AdvSpot publico: https://huggingface.co/datasets/inclusionAI/advspot-public
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
