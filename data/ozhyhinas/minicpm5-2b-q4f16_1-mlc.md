# ozhyhinas/MiniCPM5-2B-q4f16_1-MLC

## Resumen

MiniCPM5-2B-q4f16_1-MLC es una versión cuantizada del modelo MiniCPM5-2B de OpenBMB, preparada para ejecutarse en el navegador mediante WebGPU a través de WebLLM. El modelo original es un Transformer denso de 2 mil millones de parámetros, optimizado para despliegue en dispositivos con recursos limitados. Esta variante utiliza la cuantización q4f16_1 (4,5 bits por parámetro) y reduce el tamaño del repositorio a 1,4 GB, con un requisito de VRAM de aproximadamente 1,9 GB.

El modelo está orientado a la conversión de matemáticas habladas y documentos PDF a LaTeX, y se ha desarrollado como parte del proyecto LatexGen. En un benchmark propio de 105 ítems, MiniCPM5-2B alcanzó un 52 % de aciertos, superando a Qwen3.5-2B (26 %) y Qwen3-1.7B (13 %), con mejoras especialmente notables en pasajes de prosa que mezclan texto y fórmulas.

Su relevancia radica en que permite ejecutar un modelo de razonamiento híbrido con modo de pensamiento activable directamente en el navegador, sin necesidad de servidores, gracias a la compilación específica para WebLLM 0.2.84.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (LlamaForCausalLM) |
| Parametros totales | 2 mil millones (aprox.) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | q4f16_1 (4,5 bits por parámetro) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC LLM (shards binarios params_shard_*.bin + tensor-cache.json) y librería WebGPU (.wasm) |

## Arquitectura y entrenamiento

MiniCPM5-2B es un Transformer denso de 2 mil millones de parámetros que sigue la arquitectura LlamaForCausalLM. Según la configuración de MLC, el modelo tiene 42 capas, una dimensión oculta de 2048, 16 cabezas de atención y 2 cabezas KV, con un vocabulario de 130560 tokens y embeddings no atados. La frecuencia rotatoria (rope theta) está fijada en 5e6.

No se dispone de información detallada sobre los datos de entrenamiento, el número de tokens o si se aplicaron técnicas de alineación como RLHF o DPO en la información proporcionada. El modelo se describe como un modelo híbrido de razonamiento (thinking mode), lo que sugiere que puede alternar entre respuestas directas y razonamiento explícito mediante un bloque de pensamiento en la plantilla de conversación.

La cuantización q4f16_1 se realizó con MLC LLM, y se compiló una librería WebGPU específica para WebLLM 0.2.84. El proceso de compilación requirió un parche en TVM para corregir un fallo en la regla de dlight GPU fallback, aunque los kernels compilados no cambian.

## Capacidades

- Generación de texto especializada en LaTeX, con buen rendimiento en pasajes que mezclan palabras y fórmulas matemáticas.
- Modo de razonamiento híbrido (thinking mode) activable o desactivable mediante el parámetro `enable_thinking` en WebLLM, que permite respuestas directas o razonamiento explícito.
- Ejecución en navegador mediante WebGPU, sin necesidad de servidor, gracias a la librería compilada para WebLLM 0.2.84.
- Procesamiento de texto únicamente; el modelo base no incluye torre de visión.
- Integración directa con WebLLM a través de `appConfig`, con requisito de VRAM de 1900 MB.
- Soporte de contexto de 4096 tokens, suficiente para documentos cortos y conversaciones multi-turno limitadas.
- No se menciona soporte de tool calling ni capacidades multilingües en la información disponible.

## Casos de uso

- Conversión de matemáticas habladas a LaTeX: el modelo puede transcribir dictados de expresiones matemáticas a código LaTeX, como se plantea en LatexGen.
- Conversión de PDFs a LaTeX: procesa texto extraído de PDFs con fórmulas para generar representaciones LaTeX.
- Asistente de escritura científica en el navegador: se puede integrar en editores web para convertir notación matemática en tiempo real.
- Tutoría de matemáticas en dispositivos de bajo consumo: gracias a su bajo requisito de VRAM (1,9 GB) y a la ejecución en WebGPU, puede funcionar en portátiles o tablets.
- Aplicaciones de privacidad local: al ejecutarse en el navegador, los datos no salen del dispositivo, lo que resulta adecuado para documentos sensibles.
- Prototipado de modelos híbridos de razonamiento: permite experimentar con el modo de pensamiento activable en aplicaciones web sin infraestructura de servidor.

## Benchmarks y rendimiento

Se ha publicado un benchmark propio de 105 ítems de texto, diseñado para evaluar la conversión de prosa y fórmulas a LaTeX. Los resultados son los siguientes:

| Modelo | Aciertos (judge-correct) |
|---|---|
| MiniCPM5-2B (q4f16_1) | 52 % |
| Qwen3.5-2B | 26 % |
| Qwen3-1.7B | 13 % |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: 1900 MB según la configuración de WebLLM (`vram_required_MB: 1900`).
- GPU recomendada: cualquier GPU compatible con WebGPU y la característica `shader-f16`. No se especifican modelos concretos en la información.
- Cabe en GPU de consumo: sí, con 1,9 GB de VRAM puede ejecutarse en GPUs integradas o dedicadas modestas.
- Opciones de despliegue: WebLLM en navegador (vía `appConfig`) y MLC LLM compilado para WebGPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark propio (105 ítems) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B (q4f16_1) | 2B | 4096 | 52 % | Apache 2.0 | HuggingFace |
| Qwen3.5-2B | 2B | no disponible | 26 % | no disponible | no disponible |
| Qwen3-1.7B | 1,7B | no disponible | 13 % | no disponible | no disponible |

También existe MiniCPM5-1B, predecesor en la misma serie, pero no se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo procesa texto; no admite entradas de imagen ni audio.
- La longitud de contexto es de 4096 tokens, limitada en comparación con modelos más recientes.
- El benchmark utilizado es propio y de pequeño tamaño (105 ítems); los resultados no son comparables con evaluaciones estándar.
- La librería WebGPU compilada es específica para WebLLM 0.2.84; compilar contra versiones más recientes de MLC puede generar librerías incompatibles con ese runtime.
- Requiere WebGPU con soporte de `shader-f16`; en navegadores o dispositivos sin esta característica, no funcionará.
- No se han documentado sesgos específicos en la información disponible, pero los modelos pequeños pueden presentar mayor riesgo de alucinación.
- La licencia Apache 2.0 permite uso comercial, siempre que se respeten las condiciones de la licencia y se atribuya al modelo base openbmb/MiniCPM5-2B.

## Enlaces

- HuggingFace: https://huggingface.co/ozhyhinas/MiniCPM5-2B-q4f16_1-MLC
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio OpenBMB/MiniCPM: https://github.com/OpenBMB/MiniCPM
- LatexGen: https://github.com/OlehZhyhinas/LatexGen
- WebLLM: https://github.com/mlc-ai/web-llm
