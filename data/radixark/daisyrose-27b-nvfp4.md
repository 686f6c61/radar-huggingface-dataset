# RadixArk/DaisyRose-27B-NVFP4

## Resumen

DaisyRose-27B-NVFP4 es la versión cuantizada en NVFP4 (formato FP4 de NVIDIA) del modelo DaisyRose-27B, desarrollado por RadixArk. Se trata de un modelo multimodal de razonamiento construido sobre Qwen3.8-27B y entrenado exclusivamente con aprendizaje por refuerzo, sin ajuste supervisado ni destilación, sobre aproximadamente 1.200 tareas de agente de horizonte largo con sesiones de hasta 1 millón de tokens. El entrenamiento se prolongó durante 18 días en 144 GPU H200.

El modelo conserva la arquitectura, el tokenizador y la plantilla de chat del modelo base, así como su comprensión de imágenes y su ventana de contexto de 256K tokens, por lo que puede sustituir directamente a Qwen3.8-27B en pilas de inferencia y post-entrenamiento existentes. La relevancia de esta variante NVFP4 radica en que reduce el peso del repositorio a 21,9 GB (frente a los aproximadamente 54 GB que ocuparían los pesos en BF16 para 27B parámetros), lo que facilita su despliegue en hardware con memoria limitada manteniendo el pipeline image-text-to-text.

El checkpoint cuenta con 769 descargas y 13 likes en Hugging Face, se publica bajo licencia Apache-2.0 y está etiquetado como compatible con endpoints. La model card advierte explícitamente que el checkpoint NVFP4 no fue evaluado en la suite completa de benchmarks, por lo que los resultados publicados corresponden a las variantes BF16 y FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.8-27B); pipeline image-text-to-text |
| Parametros totales | 18.164.649.200 (dato de safetensors); la model card declara 27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | NVFP4 (FP4 de NVIDIA, via modelopt); el modelo base ofrece BF16, FP8, NVFP4 y GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizacion NVFP4 de 8 bits con modelopt) |

## Arquitectura y entrenamiento

DaisyRose-27B-NVFP4 es una cuantizacion del modelo DaisyRose-27B, que a su vez parte de la arquitectura de Qwen3.8-27B: un transformer multimodal con capacidad de comprension de imagenes y una ventana de contexto de 256K tokens. El modelo base se entreno unicamente mediante aprendizaje por refuerzo, sin ajuste supervisado ni destilacion, sobre cerca de 1.200 tareas de agente de horizonte largo cuyas sesiones alcanzaban hasta 1M tokens, empleando 144 GPU H200 durante 18 dias. Esta variante concreta aplica cuantizacion NVFP4 (FP4) mediante modelopt de NVIDIA sobre los pesos del modelo base, manteniendo tokenizador, plantilla de chat y arquitectura sin cambios.

La innovacion principal del modelo original es el uso exclusivo de RL sobre tareas de agente de horizonte largo, lo que eleva Terminal Bench 4.1 pass@1 de 5,6 a 12,0 respecto al modelo base y mejora la mayoria de los benchmarks de codigo, razonamiento y seguimiento de instrucciones. La model card menciona ademas un draft model especifico (Qwen3.8-27B-DSpark) para decodificacion especulativa, aunque no detalla su funcionamiento interno.

## Capacidades

- Generacion de texto y razonamiento multimodal (entrada de imagen y texto).
- Razonamiento con modo thinking configurable (la model card cita "reasoning effort xhigh" como valor por defecto de la plantilla).
- Ejecucion de tareas de agente de horizonte largo: sesiones de hasta 1M tokens y tareas de terminal y de ingenieria de software.
- Capacidades de codigo y resolucion de problemas de software (Terminal Bench, DeepSWE, SWE Bench Pro).
- Seguimiento de instrucciones (IFBench) y razonamiento cientifico de nivel experto (GPQA Diamond, HLE).
- Comprension de imagenes heredada del modelo base.
- Compatibilidad con endpoints de inferencia (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Automatizacion de tareas de terminal y DevOps: el modelo esta entrenado especificamente sobre tareas de agente de horizonte largo y obtiene 12,0 en Terminal Bench 4.1 (frente a 5,6 del base), lo que lo hace adecuado para agentes que ejecutan comandos, depuran fallos y resuelven incidencias en entornos de linea de comandos.
- Ingenieria de software asistida: con 94,7 en SWE Bench Pro v2 y 46,2 en DeepSWE v1.1, puede integrarse en pipelines de resolucion automatica de issues y generacion de parches sobre repositorios reales.
- Agentes de codigo con contexto largo: su ventana de 256K tokens permite mantener en contexto repositorios completos, trazas de ejecucion y documentacion extensa sin truncar informacion relevante.
- Analisis de documentos e imagenes combinados: al ser un modelo image-text-to-text, puede procesar capturas de pantalla, diagramas o documentos escaneados junto con instrucciones textuales en flujos de extraccion y verificacion.
- Razonamiento cientifico y tecnico asistido: con 90,7 en GPQA Diamond y 34,3 en HLE (texto), resulta util para asistentes de investigacion que requieren razonamiento de nivel experto con modo thinking extendido.
- Despliegue en hardware con memoria limitada: la cuantizacion NVFP4 reduce el repositorio a 21,9 GB, lo que permite servir el modelo en GPUs de menor capacidad que las necesarias para BF16, manteniendo el pipeline multimodal.
- Evaluacion de seguimiento de instrucciones en produccion: con 82,4 en IFBench, es adecuado para sistemas que requieren adherencia estricta a formatos y restricciones de salida.

## Benchmarks y rendimiento

Los resultados publicados corresponden a las variantes BF16 y FP8 del modelo; la model card indica que el checkpoint NVFP4 no fue ejecutado en la suite completa y que las puntuaciones de DaisyRose-27B son la mejor de sus ejecuciones BF16 y FP8, que difieren en menos de un punto en todos los benchmarks donde se ejecutaron ambas.

| Benchmark | DaisyRose-27B | Qwen3.8-27B | Muse Glimmer-30B | Qwen3.6-35B-A3B | MiMo V2.6 Flash | Inkling 2 Small | Beam 1.0 | Muse Spark Open | GPT-6 Luna |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Parametros activados | 27B | 27B | 30B | 3B | 15B | 17B | 23B | 42B | – |
| Parametros totales | 27B | 27B | 30B | 35B | 309B | 594B | 501B | 816B | – |
| Terminal Bench 4.1 | 12.0 | 5.6 | 0.5 | 0.0 | **16.1** | 13.0 | 6.4 | 6.6 | 15.2 |
| Terminal Bench 2.1 | 75.5 | 73.0 | 51.7 | 44.9 | **87.6** | 81.3 | 80.1 | 76.4 | 73.0 |
| DeepSWE v1.1 | 46.2 | 42.2 | 4.4 | 0.0 | 67.9 | **72.1** | 43.3 | 60.0 | 66.6 |
| SWE Bench Pro v2 | 94.7 | 91.3 | 80.4 | 73.3 | – | **97.7** | – | 95.0 | – |
| HLE (text only) | 34.3 | 33.9 | 22.0 | 22.2 | 35.1 | **44.1** | 34.7 | 43.9 | 38.5 |
| IFBench | **82.4** | 79.5 | 77.0 | 64.4 | – | – | 79.6 | – | – |
| GPQA Diamond | 90.7 | 89.2 | 83.5 | 86.0 | 88.7 | **93.0** | 90.6 | 89.0 | 90.5 |

Condiciones de evaluacion declaradas: Terminal Bench 4.1 promediado sobre 8 repeticiones por tarea con mini-swe-agent y summarization; Terminal Bench 2.1 sobre 5 repeticiones con Terminus 2; DeepSWE v1.1 sobre 8 repeticiones con mini-swe-agent; SWE Bench Pro v2 sobre 5 repeticiones con mini-swe-agent (conjunto completo de 642 tareas); HLE texto sobre 5 repeticiones sin herramientas y con GPT-6 Luna como evaluador; IFBench sobre 4 repeticiones de 300 prompts con el scorer oficial de allenai; GPQA Diamond sobre 8 repeticiones de 198 preguntas. Todas las ejecuciones de DaisyRose-27B usan temperature 1.0, top_p 0.95, top_k 20, min_p 0 y reasoning effort xhigh, sin limite de max_tokens dentro del contexto de 256K.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio NVFP4 ocupa 21,9 GB, por lo que se necesita al menos esa cantidad de memoria para los pesos, mas el espacio para KV cache y overhead del runtime. Con contexto de 256K tokens, la KV cache puede ser considerable y no se dispone de cifras exactas en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada. La cuantizacion NVFP4 es un formato de NVIDIA y requiere hardware compatible con FP4 para aprovechar sus ventajas.
- Cabe en GPU consumer: no disponible en la informacion proporcionada; depende del soporte de NVFP4 en la GPU concreta y del tamano de contexto utilizado.
- Opciones de despliegue: la model card indica compatibilidad con transformers y etiqueta el modelo como endpoints_compatible. No se detallan soportes para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada; existe una variante GGUF del modelo base para entornos basados en llama.cpp.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Terminal Bench 4.1 | SWE Bench Pro v2 | GPQA Diamond | Licencia |
| --- | ---: | ---: | --- | ---: | ---: | ---: | --- |
| DaisyRose-27B-NVFP4 | 27B (18,2B en safetensors) | no disponible | 256K | 12.0 | 94.7 | 90.7 | Apache-2.0 |
| Qwen3.8-27B (base) | 27B | 27B | 256K | 5.6 | 91.3 | 89.2 | no disponible |
| Muse Glimmer-30B | 30B | 30B | no disponible | 0.5 | 80.4 | 83.5 | no disponible |
| Qwen3.6-35B-A3B | 35B | 3B | no disponible | 0.0 | 73.3 | 86.0 | no disponible |

La comparativa se limita a los datos de la tabla de evaluaciones de la model card. DaisyRose-27B supera a su modelo base Qwen3.8-27B en todos los benchmarks listados y queda por detras de modelos de mayor tamano como MiMo V2.6 Flash (309B totales), Inkling 2 Small (594B) y Muse Spark Open (816B) en varias pruebas de agente, aunque mantiene ventaja en IFBench (82,4) frente a todos los comparadores mostrados.

## Limitaciones y advertencias

- El checkpoint NVFP4 no fue evaluado en la suite completa de benchmarks; los resultados publicados corresponden a BF16 y FP8, por lo que el rendimiento real de esta cuantizacion puede diferir.
- La cuantizacion a FP4 puede introducir degradacion adicional en tareas sensibles a la precision numerica; no se documenta en la informacion proporcionada una comparacion directa NVFP4 frente a BF16.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; como modelo generativo, es inherente y debe mitigarse con verificacion externa en produccion.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar el alcance multilingue mas alla de lo que herede del modelo base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribucion correspondiente.
- El modelo esta entrenado con RL sobre tareas de agente; su comportamiento fuera de ese dominio (por ejemplo, conversacion general) no esta caracterizado en la informacion disponible.
- El uso de contexto de 256K incrementa de forma significativa los requisitos de memoria para KV cache, lo que puede limitar el despliegue en GPU de menor capacidad.
- La compatibilidad con NVFP4 depende de hardware NVIDIA con soporte FP4 y de las versiones de runtime adecuadas; no se detallan requisitos minimos de software.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- Modelo base en BF16: https://huggingface.co/RadixArk/DaisyRose-27B
- Variante FP8: https://huggingface.co/RadixArk/DaisyRose-27B-FP8
- Variante GGUF: https://huggingface.co/RadixArk/DaisyRose-27B-GGUF
- Draft model DSpark: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Modelo base original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de RadixArk: https://www.radixark.com/blog/daisyrose-27b
- Licencia: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4/blob/main/LICENSE
- Leaderboard de Terminal Bench: https://www.tbench.ai/leaderboard
- Vals.ai Terminal Bench 4: https://www.vals.ai/benchmarks/terminal-bench-4
- Artificial Analysis Qwen3.8-27B: https://artificialanalysis.ai/models/qwen3-8-27b
- Artificial Analysis comparativa Glimmer: https://artificialanalysis.ai/models/comparisons/muse-glimmer-vs-gemma-4-31b
- Artificial Analysis Qwen3.6-35B-A3B: https://artificialanalysis.ai/models/qwen3-6-35b-a3b
- Model card Muse Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Model card Inkling 2 Small: https://thinkingmachines.ai/model-card/inkling-2-small/
- Model card Beam 1.0: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Model card Muse Spark Open: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Paper SWE Bench Pro v2: https://arxiv.org/html/2611.16289#S4.T3
