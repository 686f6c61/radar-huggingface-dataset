# qmnvp/sabi-noema-oQ4e-mtp

## Resumen

sabi-noema-oQ4e-mtp es un checkpoint cuantizado para MLX a partir de un modelo de la familia Qwen3.5 (etiqueta `qwen3_5`), publicado por el usuario qmnvp en HuggingFace. El repositorio almacena 27.781.427.952 parametros logicos en formato safetensors, con un peso total de aproximadamente 16,977 GB (15,811 GiB) y un tamano de repositorio de 17,0 GB. La cuantizacion se ha realizado con la herramienta oQ de oMLX v0.7.1rc1 mediante esquema de precision mixta, alcanzando una media efectiva de 4,889 bits por peso.

El checkpoint se descompone en tres bloques funcionales: el modelo de lenguaje principal (26,896B parametros logicos, 15,741 GB), un modulo de vision (0,461B, 0,921 GB) y una cabeza MTP de prediccion multi-token (0,425B, 0,314 GB). La presencia del modulo de vision apunta a un modelo multimodal, mientras que la cabeza MTP sugiere soporte para decodificacion especulativa mediante prediccion de multiples tokens futuros. No obstante, la model card no confirma ninguna de estas capacidades de forma explicita.

El modelo resulta relevante para desarrolladores que trabajan en el ecosistema Apple Silicon, ya que MLX es el framework de inferencia optimizado para chips M-series. Al tratarse de una cuantizacion de ~4,9 bits de media, reduce el peso de un modelo de ~28B a unos 17 GB, lo que lo hace desplegable en equipos con memoria unificada de 24 GB o mas. El repositorio no incluye informacion sobre licencia, idiomas soportados, contexto ni pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5`; incluye modelo de lenguaje, modulo de vision y cabeza MTP) |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 4-bit grupo 64 (81,674%), affine 5-bit grupo 64 (15,431%), affine 6-bit grupo 64 (1,038%), BF16 (1,857%); media efectiva 4,889 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

Desglose de almacenamiento por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 26,896B | 15,741 GB / 14,660 GiB |
| Vision | 0,461B | 0,921 GB / 0,858 GiB |
| Cabeza MTP | 0,425B | 0,314 GB / 0,293 GiB |
| **Total** | **27,781B** | **16,977 GB / 15,811 GiB** |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo base mas alla de las etiquetas del repositorio. La etiqueta `qwen3_5` apunta a la familia Qwen3.5, si bien no se documenta el numero de capas, el mecanismo de atencion ni la estrategia de posicionamiento. El checkpoint contiene tres submodulos diferenciados: un modelo de lenguaje de 26,896B parametros, un codificador o modulo de vision de 0,461B y una cabeza MTP de 0,425B, lo que configura un sistema multimodal con capacidad de prediccion multi-token.

La cuantizacion se ha efectuado con oQ (oMLX v0.7.1rc1), que aplica precision mixta asignando distintos anchos de bit por tensor segun su sensibilidad. La mayor parte de los pesos (81,674%, 22,690B) se almacena en affine 4-bit con grupo de 64; un 15,431% (4,287B) en affine 5-bit; un 1,038% (0,288B) en affine 6-bit; y un 1,857% (0,516B) se mantiene en BF16 sin cuantizar. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto: el modelo base de lenguaje (26,896B) cubre las tareas habituales de generacion, resumen y respuesta a instrucciones, si bien no se documentan capacidades concretas en la model card.
- Procesamiento de vision: la presencia del submodulo de vision (0,461B) implica soporte multimodal de entrada de imagen, aunque no se detallan tareas (VQA, OCR, captioning) ni su rendimiento.
- Prediccion multi-token (MTP): la cabeza de 0,425B sugiere decodificacion especulativa, que puede acelerar la generacion prediciendo varios tokens por paso.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Inferencia local en Mac: al estar en formato MLX, el modelo se ejecuta de forma nativa en Apple Silicon mediante el framework MLX, aprovechando la memoria unificada para cargar los ~16 GB de pesos sin necesidad de GPU dedicada.
- Desarrollo y prototipado sin conexion: equipos que necesitan un modelo de ~28B multimodal en local para pruebas de concepto sin enviar datos a servicios externos.
- Procesamiento de documentos con imagenes: el submodulo de vision permitiria abordar tareas que combinan texto e imagen, como extraccion de informacion de capturas o documentos escaneados, siempre que se confirme su capacidad real.
- Aceleracion de generacion con MTP: la cabeza de prediccion multi-token puede usarse para reducir la latencia en aplicaciones interactivas donde el tiempo de respuesta es critico.
- Evaluacion de tecnicas de cuantizacion: el esquema de precision mixta de oQ convierte este checkpoint en un caso de estudio para comparar la degradacion de calidad frente al modelo original en BF16.
- Despliegue en estaciones de trabajo de memoria unificada alta: equipos con 32 GB o mas de memoria unificada pueden mantener el modelo residente y servir multiples peticiones en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos ocupan 16,977 GB (15,811 GiB); con overhead de runtime MLX conviene disponer de al menos 20-24 GB de memoria.
- Compatibilidad: MLX solo se ejecuta en Apple Silicon (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible con CUDA ni con GPUs NVIDIA.
- Cabe en consumer GPU: no aplica; no hay soporte CUDA en este formato. En Mac, cabe en equipos con 24 GB de memoria unificada (limite ajustado) y con holgura en configuraciones de 32 GB o superiores.
- GPU recomendadas: no aplica para GPU dedicadas; en Apple Silicon, se recomiendan configuraciones Max o Ultra con 32 GB o mas de memoria unificada.
- Opciones de despliegue: MLX (libreria indicada). No se proporcionan pesos en GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas del modelo base para establecer una comparativa fiable. Como referencia estructural, se indica el modelo sin cuantizar del que deriva y la alternativa de formato:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| sabi-noema-oQ4e-mtp | 27,781B | no disponible | 4/5/6-bit affine + BF16 (media 4,889) | no disponible | safetensors (MLX) |
| Modelo base Qwen3.5 (sin cuantizar) | no disponible | no disponible | BF16 | no disponible | no disponible |
| Alternativas en GGUF | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables directos en la informacion proporcionada.

## Limitaciones y advertencias

- Sin licencia declarada: la model card no especifica licencia, por lo que se desconoce si el uso comercial esta permitido. Debe verificarse antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de fidelidad ni de tasas de alucinacion.
- Idiomas no declarados: se desconoce el soporte multilingue real y su calidad por idioma.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Degradacion por cuantizacion: la media de 4,889 bits/peso implica una perdida de precision respecto al modelo original en BF16; no se han publicado comparativas de calidad que cuantifiquen ese impacto.
- Exclusivo de Apple Silicon: el formato MLX limita el despliegue a equipos Mac, sin rutas directas a CUDA, ROCm ni aceleradores de otros fabricantes.
- Repositorio sin traccion: 0 descargas y 0 likes, sin validacion por parte de la comunidad ni garantias de mantenimiento.
- Capacidades multimodales no confirmadas: aunque existe un submodulo de vision, la model card no detalla tareas soportadas ni resultados.
- Sin informacion de sesgos: no se documenta ninguna evaluacion de sesgos, seguridad o contenido nocivo.
- Fecha de creacion anomala: el repositorio figura creado y actualizado en octubre de 2026, dato que conviene contrastar con la fuente original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qmnvp/sabi-noema-oQ4e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx

No se han encontrado otros enlaces relevantes (paper, blog, repositorio o demo) en la busqueda web proporcionada.
