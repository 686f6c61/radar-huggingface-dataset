# prithivMLmods/Thinklite-27B-NVFP4-GGUF

## Resumen

Thinklite-27B-NVFP4-GGUF es una cuantización en formato NVFP4 (FP4 de NVIDIA) del modelo Thinklite-27B, un fine-tune de Qwen3.8-27B desarrollado por Sparset y publicado bajo licencia Apache-2.0. El objetivo del modelo base es reducir la longitud del razonamiento en cadena sin degradar la respuesta final: se entrena sobre las propias respuestas verificadas como correctas del modelo original, de modo que el "thinking" se acorta pero la salida mantiene formato y longitud habituales. Este repositorio concreto, mantenido por prithivMLmods, empaqueta el modelo en GGUF con cuantización NVFP4 de 33,1 GB más un proyector multimodal (`mmproj`) de 931 MB, pensado para inferencia acelerada en hardware NVIDIA Blackwell.

La relevancia del artefacto es doble. Por un lado, el modelo base declara una reducción de aproximadamente el 47 % de tokens de razonamiento en el ajuste `xhigh` y del 28 % en `low`, manteniendo el 99,6 % y el 97,5 % de la precisión media del modelo original respectivamente, lo que se traduce en una reducción cercana a 2x del tiempo hasta la respuesta final. Por otro, la cuantización NVFP4 explota los tensor cores FP4 nativos de las GPU Blackwell (RTX PRO 6000, serie RTX 50, B200, B300) y añade decodificación especulativa MTP integrada en los pesos, sin necesidad de un modelo borrador separado.

El modelo conserva la torre de visión del Qwen3.8-27B original (pipeline `image-text-to-text`), aunque el entrenamiento del fine-tune fue exclusivamente textual. Con 27.320.698.192 parámetros y licencia Apache-2.0, se posiciona como una opción para despliegue local de razonamiento multimodal con requisitos de VRAM relativamente contenidos gracias a FP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B), con cabezas MTP para decodificación especulativa; pipeline image-text-to-text con proyector multimodal |
| Parametros totales | 27.320.698.192 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de inferencia usa 16.384 tokens) |
| Tipos de cuantizacion | NVFP4 (33,1 GB); el autor menciona además un GGUF Q4_K_M de 16,5 GB para el modelo base |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (NVFP4 + mmproj) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base Thinklite-27B es un fine-tune de Qwen3.8-27B, un transformer denso de 27B parámetros con capacidades de imagen-texto. El fine-tune se entrena sobre las respuestas del propio modelo base que han sido verificadas como correctas, con el objetivo de comprimir el razonamiento intermedio sin alterar la respuesta final. El entrenamiento es solo textual: el codificador de visión no se modifica. Se mantienen el chat template, el tokenizer y el control `reasoning_effort` (`low`, `medium`, `xhigh`) del modelo original, por lo que es un reemplazo directo.

La innovación técnica principal de esta distribución es el formato GGUF con MTP (Multi-Token Prediction) y cuantización NVFP4. MTP integra cabezas de predicción adicionales en la arquitectura del modelo, de modo que la decodificación especulativa se realiza sin un modelo borrador externo: el propio modelo predice varios tokens futuros en un solo forward pass. NVFP4 aprovecha los tensor cores FP4 de las GPU Blackwell (SM120, GB202, B200, B300) para acelerar la inferencia con un tamaño de pesos de 33,1 GB. El autor no detalla el número de tokens de entrenamiento ni la composición del dataset del fine-tune.

## Capacidades

- Generación de texto y razonamiento en cadena con control de esfuerzo (`low`, `medium`, `xhigh`).
- Razonamiento matemático y resolución de problemas de tipo GSM8K, AIME 2025 y MMLU-Pro.
- Generación de código (evaluado en LiveCodeBench v6) y seguimiento de instrucciones (IFEval).
- Tool calling y function calling (evaluado en BFCL v4).
- Capacidades multimodales imagen-texto heredadas del modelo base, con codificador de visión sin cambios; una comprobación de 88 preguntas sugiere que la comprensión de imágenes se preserva con un 24 % menos de tokens de razonamiento.
- Decodificación especulativa MTP integrada en los pesos para acelerar la generación.
- Soporte de `reasoning_effort` para ajustar la longitud del razonamiento según la tarea.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Razonamiento matemático en producción con latencia reducida: el modelo recorta el razonamiento hasta un 47 % en `xhigh` manteniendo el 99,6 % de la precisión del base, lo que lo hace adecuado para pipelines de resolución de problemas donde el tiempo hasta la respuesta es crítico.
- Asistentes de código en local: soporta generación de código y tool calling, y puede integrarse en flujos de desarrollo con llama.cpp u Ollama; conviene usar `xhigh` porque el autor advierte de menor fiabilidad en generación de código de respuesta única larga.
- Automatización de agentes con function calling: la evaluación BFCL v4 y el soporte de herramientas permiten construir agentes multi-paso que invocan APIs externas, con la ventaja de que el razonamiento comprimido reduce el coste por iteración.
- Despliegue en estaciones de trabajo con GPU Blackwell: con 33,1 GB de pesos y un pico medido de 30,98 GiB de VRAM en una RTX PRO 6000, cabe en GPU profesionales de 48-96 GB y permite servir el modelo en local sin infraestructura cloud.
- Procesamiento de documentos con imagen y texto: el proyector `mmproj` habilita entrada multimodal para tareas de extracción de información o descripción de imágenes, aunque el fine-tune se entrenó solo con texto.
- Evaluación comparativa de eficiencia: útil como referencia para medir la ganancia de MTP y NVFP4 frente a cuantizaciones tradicionales (Q4_K_M) en el mismo modelo, con métricas de throughput publicadas (83,61 tokens/s de generación, 267,66 tokens/s de prompt processing).
- Chat conversacional de bajo coste: el ajuste `low` reduce un 28 % los tokens de razonamiento y mantiene el 97,5 % de la precisión media, apropiado para turnos conversacionales donde la latencia importa más que la exactitud máxima.

## Benchmarks y rendimiento

Resultados del modelo base Thinklite-27B frente a Qwen3.8-27B, según la model card (suite de seis benchmarks: GSM8K, AIME 2025, MMLU-Pro, IFEval, LiveCodeBench v6, BFCL v4):

| Metrica | Thinklite-27B (`xhigh`) | Qwen3.8-27B (`xhigh`) | Thinklite-27B (`low`) | Qwen3.8-27B (`low`) |
|---|---|---|---|---|
| Precisión media | 89,8 | 90,2 | 84,7 | 86,9 |
| Retención de precisión | 99,6 % | referencia | 97,5 % | referencia |
| Reducción de tokens de razonamiento | ~47 % | referencia | ~28 % | referencia |
| AIME 2025 | no disponible por benchmark | no disponible por benchmark | 81,7 | 90,0 |

Rendimiento de la cuantización NVFP4 en una NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB VRAM, `llama-cli`, `-ngl 99`, contexto 16.384, KV cache `q8_0`, MTP con `draft_n_max=2`, 5 ejecuciones):

| Metrica | Valor |
|---|---|
| Velocidad media de prompt processing | 267,66 tokens/s |
| Velocidad media de generación | 83,61 tokens/s |
| Tiempo total de pared | 73,9 s |
| VRAM pico | 30,98 GiB |
| Uso pico de GPU | 97 % |

El autor indica que Thinklite supera a ThinkingCap y Swift-1.5 en ahorro de tokens, aunque estos dos obtienen mayor precisión media en las tablas del propio autor.

## Requisitos de hardware

- VRAM estimada: los pesos NVFP4 ocupan 33,1 GB; el pico medido con contexto de 16.384 tokens y KV cache `q8_0` fue de 30,98 GiB. Para contextos mayores hay que añadir el coste del KV cache.
- GPU recomendadas: NVIDIA Blackwell con soporte FP4 nativo, es decir, RTX PRO 6000 Blackwell, serie RTX 50, B200 y B300. El autor probó con RTX PRO 6000 Blackwell Server Edition de 96 GB.
- GPU consumer: encaja en tarjetas de 48 GB o más; en tarjetas de 24 GB no cabe con offload completo y requeriría offloading parcial a CPU, con la penalización de velocidad correspondiente. No se han publicado cifras para ese escenario.
- Opciones de despliegue: `llama-cli` y llama.cpp (comando de ejemplo incluido en la model card), Ollama, y vLLM o Transformers para el modelo base en safetensors.
- Latencia y throughput: 83,61 tokens/s de generación y 267,66 tokens/s de prompt processing en la configuración medida; el autor señala que el tiempo hasta la respuesta final es aproximadamente 2x menor en `xhigh` gracias al razonamiento más corto, ya que la velocidad de decodificación no cambia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Thinklite-27B (NVFP4) | 27,3B | no disponible | Apache-2.0 | GGUF NVFP4 + mmproj | Fine-tune de eficiencia sobre Qwen3.8-27B; MTP integrado; requiere Blackwell para FP4 nativo |
| Qwen3.8-27B | 27B | no disponible | Apache-2.0 | safetensors, GGUF | Modelo base; mayor precisión media (90,2 vs 89,8 en `xhigh`) pero ~47 % más tokens de razonamiento |
| ThinkingCap | no disponible | no disponible | no disponible | no disponible | Fine-tune de eficiencia comparable; mayor precisión media que Thinklite según el autor, pero menor ahorro de tokens |
| Swift-1.5 | no disponible | no disponible | no disponible | no disponible | Fine-tune de eficiencia comparable; mismo patrón que ThinkingCap en las tablas del autor |

## Limitaciones y advertencias

- Menor precisión en IFEval y MMLU-Pro en el ajuste `xhigh` respecto al modelo base.
- Caída acusada en AIME 2025 con `low`: 81,7 frente a 90,0 del base, por lo que no conviene usar el ajuste bajo en tareas matemáticas exigentes.
- Menor fiabilidad en generación de código de respuesta única larga.
- Intervalos de confianza amplios: los benchmarks provienen de una sola ejecución por prueba.
- Sin ajuste de seguridad adicional más allá del heredado del modelo base.
- El fine-tune se entrenó solo con texto; la preservación de la comprensión de imágenes se apoya en una comprobación de 88 preguntas, no en una evaluación completa.
- Idiomas: solo inglés declarado, lo que limita su uso en castellano sin evaluación previa.
- La cuantización NVFP4 está optimizada para hardware Blackwell; en GPU sin soporte FP4 nativo el rendimiento será inferior y puede requerir fallback.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.8-27B y de los pesos derivados.
- Riesgo de alucinación no cuantificado en la información disponible; aplican las precauciones habituales de un modelo de 27B sin verificación factual integrada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/Thinklite-27B-NVFP4-GGUF
- Modelo base: https://huggingface.co/Sparset/Thinklite-27B
- Pesos NVFP4: https://huggingface.co/prithivMLmods/Thinklite-27B-NVFP4-GGUF/blob/main/Thinklite-27B-NVFP4.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/Thinklite-27B-NVFP4-GGUF/blob/main/Thinklite-27B.mmproj.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del cuantizador: https://huggingface.co/prithivMLmods
