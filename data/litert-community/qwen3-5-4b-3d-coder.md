# litert-community/Qwen3.5-4B-3D-Coder

## Resumen

Qwen3.5-4B-3D-Coder es un ajuste fino de Qwen/Qwen3.5-4B desarrollado por CCORE, orientado a la generación de código y, en particular, a la creación de escenas 3D interactivas en Three.js. El modelo parte de una descripción de escena y produce un único archivo HTML autocontenido con el código necesario para renderizarla. Esta ficha describe la conversión a LiteRT-LM publicada por litert-community, pensada para ejecución en dispositivo (on-device) y en el borde (edge), no la versión original en formato PyTorch.

La conversión conserva únicamente el decodificador de texto: el torreón de visión no se ha convertido, por lo que el modelo es texto entra, texto sale. La arquitectura subyacente es la de Qwen3.5-4B, un transformer híbrido de 32 capas que combina tres capas de Gated DeltaNet (atención lineal) por cada capa de atención completa, con un tamaño oculto de 2560 y un vocabulario ligado de 248.320 entradas. Los archivos se distribuyen en formato `.litertlm` con cuantización mixta int4/int8 y dos longitudes de caché KV: 16.384 y 32.768 tokens.

La relevancia de esta conversión radica en que permite ejecutar un modelo de 4B especializado en generación de código 3D en hardware de consumo, sin GPU dedicada, usando el runtime LiteRT-LM de Google. El modelo no es un lanzamiento oficial de Qwen y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 32 capas de decodificador, proporción 3:1 entre Gated DeltaNet (atención lineal) y atención completa; tamaño oculto 2560; 16 cabezas de consulta y 4 de KV de 256 dimensiones en las capas de atención completa |
| Parametros totales | 4B (heredados de Qwen/Qwen3.5-4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (archivo `_ekv16384`) o 32.768 tokens (archivo `_ekv32768`), según la caché KV declarada |
| Tipos de cuantizacion | int4 blockwise-32 (min-max) en capas lineales; int8 per-channel en embedding y capa de salida (ligados); 48 proyecciones `in_proj_a`/`in_proj_b` de Gated DeltaNet en float32; activaciones GPU en fp32 |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), dos archivos: 2.711 MB (16K) y 2.768 MB (32K) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que intercala tres capas de Gated DeltaNet (una forma de atención lineal con estado recurrente) por cada capa de atención completa, con 32 capas de decodificador en total, tamaño oculto de 2560, 16 cabezas de consulta y 4 de clave-valor de 256 dimensiones en las capas de atención completa, y un vocabulario ligado de 248.320 entradas. El ajuste fino de CCORE, según su informe técnico, consistió en un fine-tuning completo de los parámetros del lenguaje con el codificador de visión congelado, seguido de una etapa corta de LoRA, sobre el dataset ccore/ThreeJS-3D-Scenes: 3.933 escenas de entrenamiento (cada una con un prompt, una traza de razonamiento completa y la respuesta HTML completa) y 213 escenas de validación excluidas de la actualización de pesos.

La conversión a LiteRT-LM se realizó con litert-torch (commit 115a1360) y el parche Qwen3.5 de hf-to-litertlm, para LiteRT-LM 0.19.0. Los archivos conservan solo el decodificador de texto. La plantilla fuerza el pensamiento vacío (`<think>\n\n</think>\n\n`) tras el apertura del asistente y los archivos declaran `supports_thinking: false`, de modo que `enable_thinking` no altera el comportamiento. El 3 de noviembre de 2026 se actualizaron los metadatos del LLM para incluir el formato de tool-call de la configuración `models/qwen3_5` de LiteRT-LM v0.19.0 (`tool_call_config`, `supports_function_calling: true`), de forma que las llamadas a herramientas se devuelven como tales y no como texto.

## Capacidades

- Generación de texto y código: produce respuestas de texto y código completo, con especialización en archivos HTML autocontenidos con escenas Three.js.
- Generación de escenas 3D interactivas en Three.js a partir de una descripción en lenguaje natural.
- Tool calling / function calling: soportado mediante los metadatos `tool_call_config` y `supports_function_calling: true` de LiteRT-LM 0.19.0; verificado con 3 de 3 prompts de herramienta por archivo devueltos como llamadas.
- Razonamiento multi-paso: el modelo base dispone de trazas de pensamiento, pero esta conversión ejecuta con el pensamiento desactivado de forma fija.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Sin visión: el torreón de visión no se ha convertido; la entrada es exclusivamente texto.
- Sin modo de pensamiento efectivo: `enable_thinking` no cambia el comportamiento.

## Casos de uso

- Generación de escenas 3D en el navegador: a partir de una descripción textual, el modelo escribe un único archivo HTML con Three.js que renderiza la escena; es su caso de uso principal y para el que fue ajustado con 3.933 escenas de entrenamiento.
- Prototipado rápido de visualizaciones 3D en el borde: al ejecutarse con LiteRT-LM en CPU de un Mac Studio (Apple M4 Max) a 14,8 tok/s con el archivo de 16K, permite generar prototipos sin conexión ni GPU dedicada.
- Asistentes de código integrados en herramientas de escritorio: el soporte de tool calling en LiteRT-LM 0.19.0 permite que el modelo invoque funciones del entorno anfitrión (por ejemplo, guardar el HTML generado o abrir un visor) dentro de una aplicación local.
- Educación y demostraciones interactivas: la generación de una escena completa en un solo archivo facilita su uso en entornos didácticos donde se necesita un resultado reproducible y autocontenido.
- Automatización de pruebas de renderizado: el modelo puede generar variantes de escenas Three.js para alimentar pipelines de pruebas visuales o de regresión de motores 3D.
- Generación de contenido para aplicaciones web ligeras: escenas 3D embebidas en páginas estáticas sin dependencias de servidor, gracias a la salida en un único HTML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de decodificación y de verificación de escenas:

| Metrica | Valor |
|---|---|
| Decodificación, archivo 16K, CPU Mac Studio M4 Max, `litert-lm` 0.19.0 (1.024 tokens de prefill, 256 generados) | 14,8 tok/s |
| Decodificación, archivo 16K, GPU Mac, CLI C++ con `--sampler_handles_input=false` | 48,2 tok/s |
| Decodificación, archivo 32K, CPU Mac, `litert-lm` 0.19.0 | 10,9 tok/s |
| Verificación de escenas, archivo 32K, CPU Mac | 3 de 6 escenas superadas (modelo PyTorch fp16: 4 de las mismas 6) |
| Verificación de escenas, GPU Mac, CLI C++ con flag | 4 de 7 escenas superadas (mismo resultado para ambos archivos y para el modelo PyTorch fp16) |
| Verificación de tool calls, `litert-lm` 0.19.0, CPU Mac | 3 de 3 prompts de herramienta por archivo devueltos como llamadas |
| Ajuste de escenas de validación al contexto | 172 de 213 caben en 16.384 tokens; 213 de 213 en 32.768 (la más larga requiere 26.147) |

## Requisitos de hardware

- VRAM/RAM estimada: los archivos ocupan 2.711 MB (16K) y 2.768 MB (32K); al ejecutarse en CPU no requieren VRAM dedicada.
- GPU recomendadas: no se especifican modelos de GPU de datacenter; las mediciones se hicieron en CPU y GPU de un Apple M4 Max.
- GPU de consumo: no se han publicado mediciones en RTX 4090, A100, H100 ni similares; la orientación del proyecto es on-device y edge.
- Despliegue: runtime LiteRT-LM 0.19.0 (paquete `litert-lm` de PyPI, CLI C++ `litert_lm_advanced_main` compilado desde el código fuente, y paquete Swift).
- Latencia y throughput: 14,8 tok/s en CPU Mac (archivo 16K) y 48,2 tok/s en GPU Mac vía CLI C++ con `--sampler_handles_input=false`; el archivo 16K decodifica aproximadamente 1,35 veces más rápido que el 32K tanto en CPU como en GPU de Mac.
- Advertencia de ejecución: en Mac, la GPU solo debe usarse a través del CLI C++ con `--sampler_handles_input=false`; la ruta GPU por defecto del paquete `litert-lm` de PyPI rompe el código largo (6 de 10 respuestas de escena del archivo 32K con error de sintaxis, y 3 de 3 en el archivo 16K). En Mac con el paquete `litert-lm` se recomienda CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder (LiteRT-LM) | 4B | 16.384 o 32.768 | `.litertlm` / LiteRT-LM | Apache-2.0 | Conversión on-device; solo texto; pensamiento desactivado |
| ccore/Qwen3.5-4B-3D-Coder (original) | 4B | No disponible | PyTorch (fp16) | Apache-2.0 | Modelo base del que procede la conversión; incluye visión; referencia de calidad en las pruebas de escenas |
| Qwen/Qwen3.5-4B | 4B | No disponible | Safetensors / varios | No disponible | Modelo base generalista de Qwen; sin el ajuste específico para Three.js |

## Limitaciones y advertencias

- Solo texto: el torreón de visión no se ha convertido, por lo que no acepta imágenes.
- Pensamiento desactivado de forma fija: la plantilla escribe el bloque de pensamiento vacío y `enable_thinking` no tiene efecto; no hay razonamiento explícito.
- Corte silencioso al llenar la caché KV: en la prueba con el archivo 16K y `max_num_tokens=600`, la respuesta se detuvo al alcanzar el final de la caché sin error y sin `</html>`.
- Riesgo de código inválido en la ruta GPU por defecto: con el paquete `litert-lm` de PyPI en Mac GPU, se observaron errores de sintaxis en la mayoría de las respuestas de escena (6 de 10 en el archivo 32K, 3 de 3 en el 16K).
- Selección de archivo crítica: 41 de las 213 escenas de validación no caben en 16.384 tokens; para prompts y respuestas largas debe usarse el archivo de 32K.
- No es un lanzamiento oficial de Qwen: es un ajuste fino de CCORE en fase de vista previa temprana.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinación en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de los modelos base y de los datos de entrenamiento.

## Enlaces

- Hugging Face (conversión LiteRT-LM): https://huggingface.co/litert-community/Qwen3.5-4B-3D-Coder
- Modelo base del ajuste: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Informe técnico: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/blob/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf
- LiteRT-LM (repositorio): https://github.com/google-ai-edge/LiteRT-LM
- Configuración `models/qwen3_5` de LiteRT-LM v0.19.0: https://github.com/google-ai-edge/LiteRT-LM/blob/v0.19.0/models/qwen3_5/LlmMetadataProto.pbtext
- hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
