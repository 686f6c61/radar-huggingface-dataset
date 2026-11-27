# scottlowry/Swift-1.5-Qwen3.8-27b-oQ6e-fp16-mtp

## Resumen

Swift-1.5-Qwen3.8-27b-oQ6e-fp16-mtp es una cuantizacion mixta del modelo ukisai/Swift-1.5-Qwen3.8-27b, un modelo de 27.781 millones de parametros construido sobre la arquitectura Qwen3.5. La cuantizacion la ha realizado el usuario scottlowry con la herramienta oQ (oMLX v0.7.4.dev1), un esquema de precision mixta que combina pesos en 6 bits, 8 bits, FP16 y FP32 segun la sensibilidad de cada tensor. El resultado es un checkpoint de 23.085 GiB con un promedio efectivo de 7.138 bits por peso, pensado para ejecutarse con la libreria MLX en hardware Apple Silicon.

El modelo conserva tres componentes diferenciados: el modelo de lenguaje (26.896B parametros, almacenado en 20.979 GiB), un codificador de vision (0.461B parametros en FP32, 1.716 GiB) y una cabeza MTP (Multi-Token Prediction) de 0.425B parametros en 0.389 GiB. La presencia de vision y de decodificacion especulativa mediante MTP lo situan como un modelo multimodal con aceleracion de inferencia integrada.

La relevancia de esta ficha radica en que se trata de una distribucion de pesos optimizada para consumo en equipos locales con memoria unificada, no de un modelo entrenado desde cero. El autor ha publicado una revision el 2026-11-11 que recomienda volver a descargar el checkpoint si se tenia una copia anterior. Los metadatos de licencia, idiomas y pipeline no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (tag `qwen3_5`), con modulo de vision y cabeza MTP |
| Parametros totales | 27.781.427.952 (27.781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6-bit grupo 64 (88.345% de los pesos), affine 8-bit grupo 64 (9.798%), FP16 (0.198%), FP32 (1.658%); promedio efectivo 7.138 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, libreria MLX (`mlx`, `oq`, `quantized`, `mtp`) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3.5, segun el tag `qwen3_5` del repositorio, e incorpora un modulo de vision de 0.461B parametros almacenado integramente en FP32, lo que sugiere que se preserva a precision completa por su sensibilidad a la cuantizacion. La cabeza MTP (Multi-Token Prediction) de 0.425B parametros actua como mecanismo de decodificacion especulativa: predice varios tokens por paso para acelerar la generacion, una tecnica habitual en modelos recientes de la familia Qwen.

El esquema de cuantizacion de oQ distribuye la precision de forma no uniforme: el 88.345% de los pesos logicos (24.543B) se almacena en affine 6-bit con grupo de 64, el 9.798% (2.722B) en affine 8-bit con grupo de 64, el 1.658% (0.461B) en FP32 y solo el 0.198% (0.055B) en FP16. Esta asignacion selectiva busca preservar la calidad en las capas mas sensibles (probablemente embeddings, normas y cabeza de salida) mientras comprime agresivamente el resto. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento en el modelo de lenguaje base de 26.896B parametros.
- Procesamiento de imagenes mediante el modulo de vision de 0.461B parametros, lo que habilita tareas multimodales de imagen a texto.
- Decodificacion especulativa mediante la cabeza MTP, que predice multiples tokens por paso para reducir la latencia de generacion.
- Ejecucion nativa en MLX, con soporte para memoria unificada en Apple Silicon.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 23.085 GiB cabe en equipos Apple Silicon con 32 GB o mas de RAM unificada, lo que permite ejecutar un modelo de 27.781B parametros sin GPU dedicada. Es adecuado para desarrolladores que trabajan en portatiles o estaciones Mac Studio.
- Asistentes multimodales de escritorio: la combinacion del modelo de lenguaje con el modulo de vision permite construir aplicaciones que describan capturas de pantalla, analicen documentos escaneados o respondan preguntas sobre imagenes sin enviar datos a la nube.
- Prototipado rapido de agentes conversacionales: la ventana de contexto no esta documentada, pero el tamano del modelo permite mantener conversaciones multi-turno con historial extenso en memoria local, util para iterar en el diseno de prompts y flujos.
- Generacion de texto asistida en entornos con requisitos de privacidad: al ejecutarse integramente en local con MLX, los datos no salen del dispositivo, lo que encaja en sectores regulados (sanidad, legal, finanzas) donde no se permite el envio a APIs externas.
- Aceleracion de inferencia en produccion con MTP: la cabeza de prediccion multi-token permite reducir el numero de pasos de decodificacion, lo que resulta util en aplicaciones interactivas donde la latencia percibida es critica, como autocompletado o chat en tiempo real.
- Evaluacion comparativa de tecnicas de cuantizacion: al ser un checkpoint de precision mixta documentado bit a bit, sirve como referencia para investigadores que estudian el impacto de la cuantizacion selectiva en la calidad de modelos de ~28B parametros.
- Fine-tuning ligero o adaptacion con LoRA sobre MLX: el formato safetensors y la libreria MLX permiten cargar el modelo y aplicar adaptadores de bajo rango para dominios especificos, aunque el soporte de entrenamiento no esta documentado en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: 23.085 GiB solo para los pesos; se recomienda un minimo de 32 GB de memoria unificada para dejar margen a la cache KV y al contexto.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4 en configuraciones Pro, Max o Ultra) con 32 GB o mas de memoria unificada. La libreria MLX no esta pensada para GPUs NVIDIA o AMD.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables de forma nativa, ya que el checkpoint esta en formato MLX. Seria necesario reconvertir los pesos a otro formato (por ejemplo GGUF o safetensors estandar) para su uso en CUDA.
- Cabe en consumer GPU: no directamente en el sentido convencional; en el ecosistema Apple, si cabe en equipos con 32 GB o mas de memoria unificada.
- Opciones de despliegue: MLX y oMLX son las vias naturales. vLLM, llama.cpp, Ollama y TGI no soportan el formato MLX de forma nativa; requeririan conversion previa.
- Latencia y throughput: no disponibles. La cabeza MTP esta disenada para acelerar la decodificacion, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b-oQ6e-fp16-mtp | 27.781B | no disponible | MLX safetensors, cuantizacion mixta ~7.14 bits/peso | no disponible | Vision + MTP, orientado a Apple Silicon |
| ukisai/Swift-1.5-Qwen3.8-27b (modelo base) | 27.781B | no disponible | safetensors sin cuantizar | no disponible | Pesos originales en mayor precision; mayor huella de memoria |
| Qwen3.5 de 27B-30B (familia base) | rango similar | no disponible | safetensors, GGUF | depende de la variante | Arquitectura de referencia; sin modulo MTP especifico de esta distribucion |

La comparativa con otras alternativas de la misma categoria (por ejemplo, otros modelos de ~28B con vision y decodificacion especulativa) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta declarada en los metadatos, por lo que no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base ukisai/Swift-1.5-Qwen3.8-27b antes de cualquier despliegue en produccion.
- Al ser una cuantizacion mixta a ~7.14 bits/peso, existe una perdida de calidad respecto al checkpoint original en FP16/BF16. El impacto concreto no esta medido con benchmarks en la informacion disponible.
- El modulo de vision se mantiene en FP32, lo que incrementa la huella de memoria (1.716 GiB) y puede limitar su uso en equipos con menos de 32 GB de memoria unificada.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable directamente a ecosistemas CUDA o ROCm sin conversion.
- El autor recomienda volver a descargar el checkpoint si se tenia una version anterior al 2026-11-11, lo que indica que las copias previas pueden contener pesos desactualizados o defectuosos.
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni limitaciones de contexto. Se debe asumir el comportamiento del modelo base Qwen3.5, cuyas limitaciones no se detallan aqui.
- El numero de descargas (215) y de likes (1) es bajo, lo que sugiere poca validacion comunitaria del checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scottlowry/Swift-1.5-Qwen3.8-27b-oQ6e-fp16-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
