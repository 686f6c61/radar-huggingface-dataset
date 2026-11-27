# litert-community/Qwen3.5-4B-3D-Coder

## Resumen

Qwen3.5-4B-3D-Coder es un ajuste fino de Qwen/Qwen3.5-4B desarrollado por CCORE, especializado en la generación de escenas 3D interactivas en Three.js: a partir de una descripción de escena produce un único archivo HTML autocontenido. Esta ficha corresponde a la conversión del modelo original al formato LiteRT-LM (`.litertlm`), publicada por la comunidad `litert-community` para su ejecución en dispositivo (on-device) y en el borde (edge). No se trata de un lanzamiento oficial de Qwen.

El modelo base conserva la arquitectura de Qwen3.5-4B: 32 capas de decodificador que alternan tres capas de Gated DeltaNet (atención lineal) por cada capa de atención completa, tamaño oculto de 2560, 16 cabezas de consulta y 4 de clave/valor de 256 dimensiones en las capas de atención completa, y un vocabulario ligado de 248.320 entradas. El ajuste se realizó sobre el dataset ccore/ThreeJS-3D-Scenes, con ajuste fino completo de los parámetros del lenguaje, el codificador de visión congelado y una etapa corta de LoRA.

La relevancia de esta conversión radica en que empaqueta un modelo de 4B en archivos de aproximadamente 2,7 GB con cuantización int4 que caben en hardware de consumo, con soporte de tool calling en LiteRT-LM 0.19.0. Los archivos contienen únicamente el decodificador de texto (la torre de visión no se ha convertido): entrada de texto, salida de texto, con el modo de razonamiento desactivado de forma forzada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 32 capas de decodificador con patrón de 3 capas Gated DeltaNet (atención lineal) + 1 capa de atención completa |
| Parametros totales | 4B (heredados de Qwen/Qwen3.5-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (archivo `_ekv16384`) o 32.768 tokens (archivo `_ekv32768`), según caché KV |
| Tipos de cuantizacion | int4 blockwise-32 (min-max) en capas lineales; int8 per-channel en embedding y capa de salida (ligados); 48 proyecciones `in_proj_a`/`in_proj_b` de Gated DeltaNet en float32; activaciones GPU en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); repo de 16,4 GB con dos archivos de 2.711 MB y 2.768 MB |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5-4B: un transformer híbrido que intercala capas de Gated DeltaNet (atención lineal con estado recurrente) con capas de atención completa en una proporción de 3:1, con tamaño oculto de 2560, 16 cabezas de consulta y 4 de clave/valor de 256 dimensiones en las capas de atención completa, y un vocabulario ligado de 248.320 entradas. El ajuste fino, descrito en el informe técnico del autor, consistió en un ajuste completo de los parámetros del lenguaje con el codificador de visión congelado, seguido de una etapa corta de LoRA, sobre el dataset ccore/ThreeJS-3D-Scenes: 3.933 escenas de entrenamiento (cada una con un prompt, una traza de razonamiento completa y la respuesta HTML íntegra) y 213 escenas de validación excluidas de la actualización de pesos.

La conversión a LiteRT-LM se realizó con litert-torch (commit 115a1360) y el parche para Qwen3.5 de hf-to-litertlm, para LiteRT-LM 0.19.0. La receta de cuantización es idéntica en ambos archivos: int4 blockwise-32 con escala min-max en las capas lineales, int8 per-channel en el embedding y la capa de salida ligados, y float32 en las 48 proyecciones `in_proj_a`/`in_proj_b` de las capas Gated DeltaNet. Los dos archivos solo difieren en la longitud de la caché KV y en los tamaños de prefill. El 3 de noviembre de 2026 se actualizaron los metadatos del LLM para incluir el formato de tool call de LiteRT-LM 0.19.0 (`tool_call_config`, `supports_function_calling: true`); el resto de metadatos (plantilla sin razonamiento, tokens de parada, longitud de caché KV, tipo de modelo) no cambió.

## Capacidades

- Generación de código para escenas 3D interactivas en Three.js: a partir de una descripción, produce un archivo HTML autocontenido completo.
- Generación de texto general y respuestas a preguntas cortas (7 de 8 preguntas cortas resueltas en CPU con el archivo de 16K).
- Tool calling / function calling: soportado mediante `tool_call_config` en LiteRT-LM 0.19.0; verificado con 3 de 3 prompts de herramienta por archivo devueltos como llamadas (antes se devolvían como texto).
- Modo de razonamiento: desactivado de forma forzada; la plantilla escribe siempre el pensamiento vacío (`\n\n`), los archivos declaran `supports_thinking: false` y `enable_thinking` no tiene efecto.
- Capacidades de visión: no disponibles en esta conversión (la torre de visión no se ha convertido); solo texto.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de escenas 3D en el navegador: el modelo escribe un único archivo HTML con Three.js a partir de una descripción textual, adecuado para prototipado rápido de visualizaciones 3D interactivas sin dependencias externas.
- Herramientas de autoría 3D en el borde: integrado en un editor local o en una aplicación de escritorio, permite generar escenas sin enviar prompts a la nube, gracias a los archivos de 2,7 GB y a la ejecución on-device.
- Asistentes de código para gráficos web: con tool calling habilitado en LiteRT-LM 0.19.0, puede invocarse desde un agente que valide, renderice o exporte el HTML generado.
- Demos educativas de Three.js: genera ejemplos autocontenidos de escenas (cámaras, luces, geometrías, animaciones) para material docente, con la ventaja de que el HTML resultante se ejecuta directamente en el navegador.
- Pruebas de concepto en hardware de consumo: al caber en un Mac con CPU o GPU y decodificar a 14,8 tok/s (CPU, archivo de 16K) o 48,2 tok/s (GPU vía CLI C++), sirve para validar flujos de generación 3D local antes de escalar a modelos mayores.
- Evaluación de pipelines LiteRT-LM: caso de referencia para probar la conversión de modelos Qwen3.5 a `.litertlm`, el soporte de tool calling y el comportamiento de la caché KV en distintos tamaños de prefill.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento medidos que sí se aportan son los siguientes:

| Metrica | Valor |
|---|---|
| Decodificacion, archivo 16K, Mac Studio M4 Max CPU, litert-lm 0.19.0 | 14,8 tok/s (prefill 1.024 tokens, 256 generados) |
| Decodificacion, archivo 32K, Mac CPU, litert-lm 0.19.0 | 10,9 tok/s |
| Decodificacion, archivo 16K, Mac GPU via CLI C++ con `--sampler_handles_input=false` | 48,2 tok/s |
| Ratio de velocidad 16K frente a 32K | ~1,35x mas rapido el 16K (CPU y GPU) |
| Verificacion de escenas, Mac GPU (CLI C++, flag) | 4 de 7 escenas superadas (ambos archivos); PyTorch fp16: 4 de las mismas 7 |
| Verificacion de escenas, Mac CPU (32K) | 3 de 6 superadas; PyTorch fp16: 4 de las mismas 6 |
| Verificacion de escenas, Mac GPU via paquete PyPI (ruta por defecto) | 6 de 10 respuestas del archivo 32K con error de sintaxis; 3 de 3 del archivo 16K con error |
| Preguntas cortas, archivo 16K, Mac CPU | 7 de 8 respondidas |
| Tool calling, litert-lm 0.19.0, Mac CPU | 3 de 3 prompts por archivo devueltos como llamadas |

## Requisitos de hardware

- VRAM/RAM estimada: los archivos pesan 2.711 MB (16K) y 2.768 MB (32K), por lo que requieren al menos ~3 GB de memoria libre para los pesos, más el espacio de la caché KV (16.384 o 32.768 tokens) y las activaciones.
- GPU recomendadas: no se especifican modelos de GPU discretas en la información; las mediciones se hicieron en un Apple M4 Max (CPU y GPU integrada).
- Cabe en hardware de consumo: sí; validado en un Mac Studio con Apple M4 Max. No hay datos para GPUs NVIDIA consumer (RTX 4090, etc.).
- Opciones de despliegue: LiteRT-LM 0.19.0 mediante el paquete `litert-lm` de PyPI (Python API), el CLI C++ `litert_lm_advanced_main` (compilado desde el código fuente, necesario para la GPU en Mac con `--sampler_handles_input=false`) y el paquete Swift (no probado con estos archivos).
- Latencia y throughput: 14,8 tok/s en CPU (16K), 10,9 tok/s en CPU (32K) y 48,2 tok/s en GPU vía CLI C++ (16K). En la ruta GPU por defecto del paquete PyPI se rompe la generación de código largo (errores de sintaxis), por lo que en Mac se recomienda la CPU con el paquete o la GPU solo con el CLI C++ y el flag indicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder (LiteRT-LM, esta ficha) | 4B | 16K o 32K (caché KV) | `.litertlm`, LiteRT-LM 0.19.0 | Apache-2.0 | Solo texto; pensamiento desactivado; tool calling |
| ccore/Qwen3.5-4B-3D-Coder (original) | 4B | no disponible | PyTorch (safetensors) | Apache-2.0 | Incluye torre de visión; referencia de calidad (fp16) |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | safetensors | Apache-2.0 | Modelo generalista sin ajuste para Three.js |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la única comparación cuantitativa disponible es la verificación de escenas (4 de 7 en GPU para la conversión y para el modelo PyTorch fp16; 3 de 6 en CPU frente a 4 de 6 del fp16).

## Limitaciones y advertencias

- Solo texto: la torre de visión no se ha convertido, por lo que no admite entradas de imagen.
- Razonamiento desactivado de forma forzada: `enable_thinking` no tiene efecto y la plantilla escribe siempre un bloque de pensamiento vacío.
- La caché KV limita la salida: si la respuesta alcanza el final de la caché (16.384 o 32.768 tokens), la generación se detiene sin error y sin `</html>`. De las 213 escenas de validación, 41 no caben en 16K; la más larga necesita 26.147 tokens.
- En Mac, la ruta GPU por defecto del paquete `litert-lm` de PyPI rompe la generación de código largo (6 de 10 respuestas con error de sintaxis en el archivo 32K; 3 de 3 en el 16K). Solo la GPU mediante el CLI C++ con `--sampler_handles_input=false` supera la verificación de escenas.
- El paquete Swift ejecuta la misma ruta GPU por defecto y no se probó con estos archivos; ninguna configuración de esas APIs cambia la ruta.
- Es un ajuste fino de vista previa temprana de CCORE, no un lanzamiento oficial de Qwen; la calidad en dominios distintos de Three.js no está documentada.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al ser un modelo de código, existe riesgo de generar APIs o sintaxis inexistentes, mitigado parcialmente por la verificación de escenas (4 de 7 superadas).
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y el ajuste deben verificarse por separado; no se documentan restricciones adicionales.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/litert-community/Qwen3.5-4B-3D-Coder
- Modelo base del ajuste: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Informe técnico: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/blob/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf
- LiteRT-LM (repositorio): https://github.com/google-ai-edge/LiteRT-LM
- Configuración de metadatos Qwen3.5 en LiteRT-LM 0.19.0: https://github.com/google-ai-edge/LiteRT-LM/blob/v0.19.0/models/qwen3_5/LlmMetadataProto.pbtext
- Herramienta de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
