# kaushikvira/Qwen3.8-27B-swift15-nvfp4full-dflash2-NInfer-v3

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un artefacto de cuantización y empaquetado: una conversión a NVFP4 del modelo Swift-1.5-Qwen3.8-27B (derivado de Qwen3.8-27B mediante RL y post-entrenamiento OPD por parte de UkisAI), con el drafter especulativo DFlash2 de z-lab embebido y empaquetado en el contenedor nativo v3 del motor de inferencia NInfer. El autor del artefacto es kaushikvira, y el trabajo propio se limita a la cuantización W4A4 y a la conversión de formato, sin fine-tuning adicional. El resultado es un fichero único de 18,42 GiB que contiene pesos de texto, visión, cabeza MTP, drafter DFlash2 y cabeza de propuesta indexada.

El interés práctico es doble. Por un lado, demuestra que un modelo multimodal de 27B puede servirse en una única GPU consumer Blackwell (RTX 5090 de 32 GB) manteniendo el contexto completo de 262.144 tokens con concurrencia 4, gracias a la combinación de cuantización NVFP4 en todas las proyecciones de texto, una KV cache en formato k8v4 y un pool de KV en host fijado en memoria de 48 GiB. Por otro, documenta un pipeline reproducible de normalización de divisores globales para que el motor pueda fusionar padres de atención (GDN `qkvz` de 16.384 filas y atención `qkgv` de 14.336 filas) en una única ruta A4 nativa.

El modelo base, Swift-1.5, es la versión 1.5 del derivado de razonamiento eficiente de UkisAI sobre Qwen3.8-27B, orientado a tareas agénticas de horizonte largo y a generación de código, con penalización del sobrepensamiento patológico para reducir el consumo de tokens manteniendo la precisión. La ficha siguiente describe el artefacto tal como está publicado, indicando explícitamente los datos que no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) derivado de Qwen3.8-27B, con capas GDN (gated delta network) y atención, cabeza MTP y drafter especulativo DFlash2 |
| Parametros totales | 27B (según el nombre del modelo base; no se detalla el desglose en la información disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (configurado en el ejemplo de servicio con `--max-context 262144`) |
| Tipos de cuantizacion | NVFP4 W4A4 grupo 16 en proyecciones de texto (256 padres fusionados); W8G32 en embedding de tokens y cabeza de salida (30 objetos q8_g32); q4/q5/q6 en visión; BF16 en MTP y DFlash2 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor propietario `.ninfer` versión 3 (`NINFER\0\x03`), 19.782.447.364 bytes (18,42 GiB), 1.590 objetos almacenados |

## Arquitectura y entrenamiento

El artefacto no introduce entrenamiento nuevo. La cadena es: Qwen3.8-27B (Qwen team) como base; Swift-1.5-Qwen3.8-27b (UkisAI) como derivado post-entrenado con RL y OPD, enfocado en tareas agénticas de horizonte largo y código (mejoras citadas en LiveCodeBench y Terminal-Bench) y con penalización del razonamiento excesivo; y finalmente la cuantización NVFP4 de kaushikvira con `llm-compressor` sobre 512 muestras de calibración Ultrachat con secuencia 2048. La arquitectura interna combina capas GDN con atención clásica, e incluye una cabeza MTP y el drafter DFlash2 de z-lab para decodificación especulativa.

La innovación técnica destacable del artefacto es la normalización de divisores globales: `llm-compressor` emite un `weight_global_scale` por módulo, pero la ruta A4 nativa del motor exige un único padre fusionado contiguo por grupo de atención. El autor unifica el divisor de cada grupo al mínimo (`D = min(dᵢ)`) y reescala los bloques E4M3 por `D/dᵢ` con redondeo al par más cercano y solo reducción. En este modelo el reescalado fue exactamente representable, con un 0,0000 % de error de recodificación en los 272 grupos. La conversión se realizó con `tools/convert` sobre los componentes texto, visión, MTP, DFlash2 y la cabeza de propuesta.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 262.144 tokens.
- Razonamiento con modo thinking configurable (presupuesto por defecto de 16.384 tokens en el ejemplo de servicio) y preservación del bloque de pensamiento.
- Generación y edición de código, con foco declarado del modelo base en tareas de programación de horizonte largo.
- Entrada de imagen y texto (pipeline `image-text-to-text`), con visión cuantizada en q4/q5/q6 y un presupuesto de tokens de imagen de 1.280 en el fork del motor.
- Decodificación especulativa mediante el drafter DFlash2 embebido, con 7 tokens de borrador y `lm-head-draft` en la configuración de referencia.
- Capacidades agénticas y de razonamiento multi-paso heredadas del post-entrenamiento de Swift-1.5.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en una estación de trabajo con RTX 5090: el artefacto ocupa 18,0 GiB de pesos y deja espacio para una KV cache en dispositivo de 308.736 tokens, lo que permite mantener repositorios y sesiones largas en memoria sin offload.
- Agente autónomo de terminal y refactorización: el modelo base está post-entrenado para Terminal-Bench y LiveCodeBench, y la decodificación especulativa con DFlash2 reduce la latencia en generaciones largas de código.
- Análisis de documentos técnicos con imágenes: la ruta de visión integrada permite procesar diagramas, capturas y páginas escaneadas junto con texto en una sola llamada, con un presupuesto de 1.280 tokens de imagen por entrada.
- Servicio conversacional multi-turno con concurrencia moderada: con `--max-concurrency 4` y el pool de KV en host de 48 GiB, se puede atender a varios usuarios manteniendo el contexto completo de 262.144 tokens por sesión.
- Razonamiento con presupuesto controlado: el flag `--default-thinking-budget 16384` y la penalización del sobrepensamiento del modelo base permiten ajustar el coste por consulta en tareas de análisis que no requieren cadenas de pensamiento extensas.
- Evaluación y prototipado de cuantización NVFP4 en Blackwell: el artefacto sirve como referencia reproducible del pipeline de normalización de divisores globales y de la conversión v3, útil para equipos que quieran replicar el proceso con otros modelos.
- Despliegue en entornos con una sola GPU: al caber en 32 GB de VRAM con contexto completo, es viable en workstations y nodos de un solo acelerador donde un BF16 de 27B no cabría.

## Benchmarks y rendimiento

La model card incluye una comparación A/B en la misma sesión frente al perfil de producción anterior (Swift-1.0-abliterated), con generaciones nuevas, temperatura 0, sin reutilización de caché y una única RTX 5090. La tabla publicada está truncada en la información disponible: solo se lee la fila de IFBench prompt-strict (n=300), con 66,3 para Swift-1.0 y un valor incompleto para Swift-1.5. No se han publicado en la información disponible el resto de resultados ni cifras de MMLU, HumanEval o GSM8K.

| Benchmark | Swift-1.0-abliterated (prod. anterior) | Swift-1.5 (este artefacto) | Delta |
|---|---|---|---|
| IFBench prompt-strict (n=300) | 66,3 | no disponible (dato truncado en la model card) | no disponible |

## Requisitos de hardware

- VRAM para inferencia: 18,0 GiB de pesos en el formato NVFP4 empaquetado; el resto del presupuesto se destina a KV cache y buffers.
- GPU de referencia: una única RTX 5090 de 32 GB, arquitectura Blackwell, que es la configuración validada por el autor.
- Capacidad medida en una 5090: pool de KV en dispositivo de 308.736 tokens en modo automático, arena de KV en host fijada de 48 GiB y contexto completo de 262.144 tokens con concurrencia 4.
- Cabe en GPU consumer: sí, en RTX 5090 de 32 GB. No hay datos publicados para otras consumer (RTX 4090, 4080, etc.); al requerir NVFP4 y la ruta A4 nativa, la compatibilidad con generaciones anteriores no está garantizada.
- Opciones de despliegue: el motor NInfer (`ninfer-serve`), en versión stock o en el fork del autor. El backend especulativo `dflash2` y el flag `--image-token-budget` solo existen en el fork; en el motor stock hay que omitirlos y la visión queda limitada a 32.768 tokens por constante de compilación.
- Otros motores (vLLM, llama.cpp, Ollama, TGI): no disponibles para este formato de contenedor `.ninfer`.
- Latencia y throughput: no disponibles; la model card no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (Swift-1.5 Qwen3.8-27B NVFP4 + DFlash2) | 27B | 262.144 | NVFP4 W4A4 + W8G32 + q4/q5/q6 visión | Apache 2.0 | Contenedor `.ninfer` v3, 18,42 GiB |
| ukisai/Swift-1.5-Qwen3.8-27b (pesos fuente) | 27B | no disponible | BF16 (18 shards safetensors) | no disponible en la información | Hugging Face, safetensors |
| Qwen/Qwen3.8-27B (base upstream) | 27B | no disponible | BF16 | no disponible en la información | Hugging Face |
| z-lab/Qwen3.8-27B-DFlash2 (drafter) | no disponible | no disponible | no disponible | no disponible en la información | Hugging Face, commit `50307d4c` |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada, salvo el A/B parcial de IFBench citado arriba.

## Limitaciones y advertencias

- El artefacto está atado al motor NInfer y a su formato de contenedor v3; no es cargable en vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad.
- La decodificación especulativa DFlash2 y el control del presupuesto de tokens de imagen requieren el fork del motor; en el motor stock hay que desactivar ambos y la visión queda capada a 32.768 tokens.
- La ruta A4 nativa exige GPUs Blackwell; no hay validación publicada en arquitecturas anteriores.
- No se han publicado datos de sesgos, tasas de alucinación ni evaluación multilingüe; los idiomas soportados figuran como no disponibles.
- La licencia Apache 2.0 se hereda de la cadena de modelos base, pero conviene verificar las condiciones de los pesos fuente de UkisAI y de Qwen antes de un uso comercial.
- El modelo base está optimizado para razonamiento eficiente; el modo thinking consume tokens adicionales y el presupuesto debe ajustarse por caso de uso.
- La tabla de benchmarks de la model card está truncada en la información disponible, por lo que no se puede verificar la mejora declarada frente al perfil anterior.
- El autor declara que no hay fine-tuning propio; cualquier comportamiento del modelo proviene de la cadena Qwen3.8-27B y Swift-1.5.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaushikvira/Qwen3.8-27B-swift15-nvfp4full-dflash2-NInfer-v3
- Pesos fuente BF16: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Motor NInfer: https://github.com/Neroued/ninfer
- PR del presupuesto de tokens de imagen: https://github.com/Neroued/ninfer/pull/61
- Artefacto previo basado en Swift-1.0: https://huggingface.co/kaushikvira/Qwen3.8-27B-swift-abliterated-nvfp4full-dflash2-NInfer-v3
- Referencia de pipeline de cuantización: https://huggingface.co/Barding-Defense/Qwen3.8-27B-huihui-abliterated-NVFP4-NInfer
- Linaje de servicio previo: https://huggingface.co/ukisai/Swift-Qwen3.8-27b y https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-BF16
