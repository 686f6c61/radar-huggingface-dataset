# crw72/Qwen3.6-35B-A3B-oQ4e-fp16-mtp

## Resumen

Qwen3.6-35B-A3B-oQ4e-fp16-mtp es una cuantización mixta del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario crw72. El resultado es un checkpoint de 35.951.822.704 parámetros totales con un peso efectivo medio de 5,124 bits por parámetro, almacenado en 21,445 GiB (23,027 GB) en formato safetensors para la librería MLX. La cuantización se realizó con oQ (oMLX v0.8.0), una herramienta de cuantización de precisión mixta orientada al ecosistema Apple Silicon.

El modelo base pertenece a la familia Qwen3.6, con arquitectura etiquetada como `qwen3_5_moe`, lo que indica un transformer con mezcla de expertos (MoE). El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (34,661B de pesos lógicos), un módulo de visión (0,447B) y una cabeza MTP (multi-token prediction) de 0,845B. La presencia de visión y MTP lo sitúa como un modelo multimodal con decodificación especulativa integrada.

La relevancia de esta publicación es práctica: ofrece una versión de ~23 GB que puede ejecutarse en equipos con memoria unificada de Apple Silicon, manteniendo capas selectivas en 8 bits, FP16 y FP32 para preservar precisión donde más importa, mientras la mayor parte de los pesos (91,838%) se almacena en 4 bits afines con grupo de 64.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), etiqueta `qwen3_5_moe`; incluye módulo de visión y cabeza MTP |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta: affine 4-bit grupo 64 (91,838% de los pesos), affine 8-bit grupo 128 (0,359%), affine 8-bit grupo 64 (6,474%), FP16 (0,086%), FP32 (1,242%); media efectiva de 5,124 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con mezcla de expertos, según la etiqueta `qwen3_5_moe` del repositorio. El checkpoint cuantizado conserva la estructura completa del modelo original e incorpora tres bloques diferenciados: el modelo de lenguaje con 34,661B de pesos lógicos, un módulo de visión de 0,447B y una cabeza MTP de 0,845B. La cabeza MTP (multi-token prediction) habilita decodificación especulativa, es decir, la predicción de varios tokens por paso para acelerar la generación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO. La cuantización se realizó con oQ (oMLX v0.8.0), que asigna precisiones distintas por tensor: la mayor parte de los pesos del modelo de lenguaje se almacena en 4 bits afines con grupo de 64, mientras que el módulo de visión se conserva en FP32 (1,242% de los pesos lógicos, 1,664 GiB de almacenamiento) y una fracción pequeña en FP16. Esta distribución busca minimizar la pérdida de calidad en componentes sensibles a la precisión mientras reduce el tamaño total del checkpoint.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.6-35B-A3B.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,447B de parámetros, conservado en FP32.
- Decodificación especulativa mediante cabeza MTP de 0,845B de parámetros, orientada a acelerar la inferencia.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 21,445 GiB está pensado para MLX, por lo que puede cargarse en equipos Mac con memoria unificada suficiente (por ejemplo, configuraciones de 32 GB o más) sin necesidad de GPU dedicada.
- Prototipado de aplicaciones multimodales: al incluir módulo de visión, permite experimentar con tareas de imagen y texto en local antes de desplegar en infraestructura mayor.
- Aceleración de generación con MTP: la cabeza de multi-token prediction permite evaluar técnicas de decodificación especulativa en pipelines de generación de texto de baja latencia.
- Investigación sobre cuantización mixta: sirve como caso de estudio de la distribución de bits de oQ, comparando el impacto de mantener visión en FP32 frente a cuantizar todo el modelo.
- Evaluación de calidad post-cuantización: útil para medir la degradación de un modelo MoE de ~36B al pasar a 5,124 bits/peso efectivos en tareas de razonamiento y generación.
- Desarrollo y depuración de integraciones MLX: permite validar flujos de carga, tokenización y generación en la librería MLX con un modelo de tamaño medio-grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el checkpoint ocupa 21,445 GiB en disco; en carga completa se necesita al menos esa cantidad de memoria unificada o VRAM, más overhead de activaciones y contexto.
- GPU recomendadas: el formato MLX está orientado a Apple Silicon (series M1, M2, M3, M4 y superiores con memoria unificada de 32 GB o más). No está pensado para GPUs NVIDIA o AMD en su formato actual.
- ¿Cabe en GPU consumer? En GPUs consumer convencionales no es directamente utilizable por el formato MLX; en Apple Silicon con 32 GB o más de memoria unificada es viable.
- Opciones de despliegue: MLX y oMLX. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| crw72/Qwen3.6-35B-A3B-oQ4e-fp16-mtp | 35,952B | no disponible | Mixta, 5,124 bits/peso efectivos | Apache 2.0 | safetensors (MLX) |
| Qwen/Qwen3.6-35B-A3B (base) | 35,952B (según checkpoint derivado) | no disponible | Original sin cuantizar | Apache 2.0 | no disponible |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 5,124 bits/peso efectivos puede degradar la calidad frente al modelo base, especialmente en tareas de razonamiento complejo y matemáticas.
- El módulo de visión se conserva en FP32, pero el resto del modelo pierde precisión; el impacto exacto no está documentado.
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos de esta variante.
- El formato MLX limita su uso a Apple Silicon; no es portable a ecosistemas CUDA o ROCm sin conversión adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación comunitaria.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen/Qwen3.6-35B-A3B antes de uso comercial.
- No se especifican requisitos de contexto ni límites de longitud de secuencia para esta variante cuantizada.

## Enlaces

- Hugging Face: https://huggingface.co/crw72/Qwen3.6-35B-A3B-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
