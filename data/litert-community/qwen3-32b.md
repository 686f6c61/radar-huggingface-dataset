# litert-community/Qwen3-32B

## Resumen

Qwen3-32B es un modelo de lenguaje denso desarrollado por Alibaba Qwen, publicado originalmente en formato bf16 en Hugging Face. Esta ficha cubre la conversión a LiteRT-LM realizada por la comunidad `litert-community`, que reempaqueta el checkpoint original para su ejecución en el backend GPU de LiteRT-LM (WebGPU/Dawn). El modelo resuelve el problema de desplegar un LLM de 32.800 millones de parámetros en entornos de borde y estaciones de trabajo con GPU integrada, sin necesidad de infraestructura CUDA dedicada.

La arquitectura es un transformer denso de 64 capas con 64 cabezas de consulta y 8 cabezas clave-valor, con una longitud de contexto nativa de 32.768 tokens (aunque el artefacto publicado limita el KV cache a 4.096 tokens). El modelo incorpora un modo de razonamiento previo a la respuesta ("thinking") que puede desactivarse mediante la plantilla de chat.

La relevancia de esta conversión radica en que demuestra la viabilidad de ejecutar un modelo de 32B en cuantización int8 sobre hardware Apple Silicon mediante WebGPU, con métricas de rendimiento publicadas y una verificación de precisión token a token frente al checkpoint original en bf16. Es un artefacto orientado a evaluación técnica más que a producción a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (64 capas, 64 cabezas de consulta, 8 cabezas KV) |
| Parametros totales | 32,8 mil millones |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos; artefacto publicado con KV cache de 4.096 tokens |
| Tipos de cuantizacion | int8 por canal (capas lineales, lm_head y tabla de tokens); activaciones fp32 declaradas. Se probó int4 (bloque 128, min-max) pero falló la verificación de precisión y no se publicó |
| Idiomas soportados | en (según metadatos del repo); el modelo base Qwen3-32B soporta multilingüismo, pero la conversión solo declara inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), 32,9 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3-32B es un transformer denso de 32,8B parámetros con 64 capas, 64 cabezas de consulta y 8 cabezas clave-valor (GQA). El checkpoint original se entrenó en bf16 y se distribuye bajo licencia Apache 2.0. La model card de la conversión no detalla la composición del dataset de entrenamiento ni las etapas de RLHF/DPO del modelo original; esa información corresponde a la model card de Qwen/Qwen3-32B.

La conversión a LiteRT-LM se realizó con `litert-torch` 0.10.0 mediante `export_hf` y composites GPU, exportando dos firmas (prefill y decode) cuyas longitudes fija LiteRT-LM en tiempo de carga (prefill 1.024 y KV 4.096 por defecto). La cuantización se aplicó con `ai-edge-quantizer` 0.10.1 a int8 por canal. La decisión de usar int8 en lugar de int4 se justifica empíricamente: la versión int4 decodificaba a 17,21 tok/s pero falló la verificación de precisión (3 de 12 preguntas y uno de 3 turnos alcanzaron el límite de 2.048 tokens; en CPU solo 12 de 24 tokens siguientes coincidieron con el checkpoint bf16). Los metadatos de LiteRT-LM 0.19.1 se copiaron byte a byte, incluyendo la plantilla de chat con `enable_thinking`, el canal `thought`, el token de parada `<|im_end|>` y los parámetros de muestreo (top-k 20, top-p 0.95, temperatura 0.6). El tokenizador es el `tokenizer.json` del checkpoint original, sin modificaciones.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable o desactivable mediante `enable_thinking` en la plantilla de chat.
- Razonamiento aritmético y resolución de problemas verbales (verificado en la evaluación de precisión con preguntas de aritmética, un problema verbal y `fib(10)` en Python).
- Generación de código (la evaluación incluye una implementación de `fib(10)` en Python).
- Traducción (la evaluación incluye dos tareas de traducción).
- Conversación multi-turno con memoria de contexto (verificado con una conversación de 3 turnos que requiere recordar un número del primer turno).
- Capacidades multilingües heredadas del modelo base Qwen3-32B, aunque la conversión solo declara inglés en sus metadatos.
- No se documenta soporte de tool calling, function calling, agentes o multi-step reasoning en la información disponible para esta conversión.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Evaluación de LLMs de 32B en hardware Apple Silicon: el artefacto permite medir prefill y decode en GPU integrada (M4 Max: 160,54 tok/s prefill, 11,86 tok/s decode) sin infraestructura CUDA, útil para decidir si un modelo de este tamaño es viable en estaciones de trabajo locales.
- Prototipado de asistentes conversacionales con razonamiento: el modo thinking permite obtener cadenas de razonamiento antes de la respuesta, adecuado para tareas de análisis que requieren pasos intermedios verificables.
- Despliegue en entornos de borde con GPU WebGPU: LiteRT-LM ejecuta el modelo sobre WebGPU/Dawn, lo que permite integrarlo en aplicaciones de escritorio o navegador con aceleración gráfica, siempre que se disponga de los 32,9 GB del archivo.
- Validación de pipelines de cuantización: la metodología publicada (comparación token a token frente al checkpoint bf16, verificación de 12 preguntas y 3 turnos) sirve como referencia para auditar conversiones propias a int8.
- Generación de código asistida en local: el modelo resuelve tareas de programación básica y puede integrarse en editores o scripts que requieran inferencia local sin conexión a la nube.
- Traducción y tareas de texto en inglés: con contexto de 4.096 tokens en el artefacto publicado, es adecuado para documentos cortos y conversaciones, no para contextos largos.
- Investigación sobre decodificación y muestreo: la model card documenta parámetros de sampler y advertencias sobre decodificación greedy en modo thinking, lo que facilita experimentos reproducibles de generación.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Los datos disponibles son métricas de rendimiento y verificación de precisión de la conversión:

| Metrica | Valor | Condiciones |
|---|---|---|
| Prefill | 160,54 tok/s | Apple M4 Max (128 GB), WebGPU, 1.024 tokens de prefill |
| Decode | 11,86 tok/s | Apple M4 Max (128 GB), WebGPU, 256 tokens de decode |
| Huella pico de memoria | 35,97 GB | Medida con `vmmap` cada ~20 s |
| Precisión (12 preguntas) | 12/12 mismo veredicto que Transformers | GPU, greedy, hasta 2.048 tokens, thinking activado |
| Precisión (token a token) | 23/24 posiciones top-1 coincidentes con bf16 | 24 tokens de una pregunta matemática, cálculo en float32 |
| Precisión en CPU | 18/24 posiciones top-1 coincidentes | Backend CPU de LiteRT-LM 0.19.1 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo pesa 32,9 GB y la huella pico medida es de 35,97 GB en Apple M4 Max con 128 GB de memoria unificada.
- GPU recomendadas: Apple M4 Max (medido); no se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; el artefacto depende de WebGPU/Dawn y del runtime LiteRT-LM, no de CUDA.
- Despliegue: LiteRT-LM 0.19.1 (compilado desde el tag `v0.19.1`), con `litert_lm_advanced_main` y las bibliotecas `libwebgpu_dawn.dylib` y `libGemmaModelConstraintProvider.dylib`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 11,86 tok/s de decode y 160,54 tok/s de prefill en M4 Max; en máquinas más lentas, una respuesta larga puede superar el límite de 10 minutos de `send_message` y fallar con `DEADLINE_EXCEEDED`.
- No se probó en teléfonos: el archivo de 32,9 GB lo hace inviable para ese tipo de dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| litert-community/Qwen3-32B (esta ficha) | 32,8B | 32.768 nativo; 4.096 en el artefacto | int8 por canal | Apache 2.0 | LiteRT-LM, GPU WebGPU |
| Qwen/Qwen3-32B (original) | 32,8B | 32.768 | bf16 | Apache 2.0 | Transformers, safetensors |
| Conversión int4 del mismo export | 32,8B | no disponible | int4 bloque 128 min-max | Apache 2.0 | No publicada (falló precisión) |

No se dispone de datos de benchmarks comparativos frente a otros modelos de 32B en la información proporcionada.

## Limitaciones y advertencias

- La verificación de precisión se limita a 12 preguntas y una conversación de 3 turnos; no constituye una evaluación exhaustiva de calidad.
- El backend CPU de LiteRT-LM 0.19.1 cuantiza las activaciones int8 en tiempo de ejecución y desvía las elecciones de token respecto al checkpoint bf16 (18/24 posiciones coincidentes); se recomienda usar la GPU.
- La decodificación greedy en modo thinking puede producir repeticiones sin fin; la model card del modelo base lo desaconseja.
- Con LiteRT-LM 0.19.1, una llamada `send_message` que siga generando tras 10 minutos falla con `DEADLINE_EXCEEDED`; usar `send_message_async` o limitar `max_output_tokens`.
- En LiteRT-LM 0.18.1 y 0.19.1, si un mensaje no cabe en la ventana de contexto, todos los mensajes posteriores de esa conversación fallan (`Task failed with state: 7`); es necesario iniciar una conversación nueva.
- El contexto efectivo del artefacto es de 4.096 tokens, muy inferior a los 32.768 nativos del modelo base.
- Los metadatos solo declaran inglés, aunque el modelo base es multilingüe; no se ha verificado el rendimiento en otros idiomas.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones específicas de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse en el repositorio original de Qwen cualquier condición adicional.
- El tamaño del archivo (32,9 GB) y la huella de 35,97 GB limitan el despliegue a equipos con memoria unificada o VRAM abundante.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Qwen3-32B
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-32B/blob/main/LICENSE
- Paper de Qwen3: https://arxiv.org/abs/2505.09388
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Script de conversión: https://github.com/john-rocky/hf-to-litertlm/tree/main/qwen3_32b_work
