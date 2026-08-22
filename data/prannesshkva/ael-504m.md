# Prannesshkva/Ael-504M

## Resumen

Ael-504M es un modelo fundacional de menos de mil millones de parametros desarrollado por Prannessh KVA, diseñado para razonamiento multimodal en dispositivos de borde (edge AI) con alta capacidad de procesamiento. Combina una arquitectura hibrida que intercala capas de Mamba-2 State Space Duality (SSD) con capas de Rotary Delta-Attention (RDA), junto con una red Mixture-of-Experts (MoE) de 8 expertos con enrutamiento top-2. El modelo integra de forma nativa un hub de fusion cross-modal que proyecta vision, audio y texto en un espacio latente compartido de 1024 dimensiones, lo que permite generacion any-to-any.

Con 504,4 millones de parametros totales pero solo unos 182 millones activos por token, Ael-504M busca equilibrar la eficiencia lineal de los modelos de estado con la precision asociativa de la atencion cuadratica, manteniendo una huella de VRAM de aproximadamente 1,01 GB. Esta orientado a aplicaciones de inferencia local, como asistentes conversacionales multimodales y sistemas de razonamiento en tiempo real sobre hardware limitado. La licencia es Business Source License 1.1 (BSL 1.1), con restricciones de uso comercial que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Mamba-2 SSD + Rotary Delta-Attention (RDA) + MoE (8 expertos, Top-2) |
| Parametros totales | 504.429.976 (~0,504 B) |
| Parametros activos | ~182 millones por token (via MoE Top-2) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Business Source License 1.1 (BSL 1.1) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Ael-504M es un hibrido de 24 bloques residuales con pre-normalizacion que intercala dos tipos de capas de secuencia: cada sexta capa (capas 0, 6, 12, 18) emplea Mamba-2 State Space Duality (SSD) con parametros de estado N=64 y expand=2, lo que proporciona una recurrencia lineal de complejidad O(L) y memoria O(1) durante la inferencia autoregresiva; el resto de capas usa Rotary Delta-Attention (RDA), una variante de atencion densa con 16 cabezas y dimension de clave 64, equipada con embeddings posicionales rotatorios (RoPE) para un recuerdo asociativo preciso.

Cada capa incluye una red MoE de 8 expertos SwiGLU con enrutamiento por similitud coseno sobre centroides semanticos aprendidos y temperatura dinamica. Solo los dos expertos con mayor afinidad se activan por token, reduciendo los FLOPs en aproximadamente un 64% en comparacion con una FFN densa. Se aplican penalizaciones de ortogonalidad de Frobenius sobre los centroides y balanceo de carga tipo Switch-Transformer para evitar el colapso de expertos. El modelo incorpora un "Any-to-Any Cross-Attention Fusion Hub" con 32 tokens de consulta aprendibles que proyecta parches visuales (convolucion 2D de kernel 16x16 sobre imagenes de 224x224) y espectrogramas Mel de 80 canales (convolucion 1D) hacia el flujo de texto causal. El entrenamiento detallado (numero de tokens, composicion del dataset, metodos de alineacion como RLHF o DPO) no se especifica en la informacion disponible.

## Capacidades

- Generacion de texto causal autoregressive con soporte de razonamiento de largo alcance gracias a las capas SSD de Mamba-2.
- Procesamiento multimodal nativo: acepta entradas de texto, imagenes (parches 224x224) y audio (espectrogramas Mel de 80 canales).
- Generacion any-to-any: el modelo puede generar respuestas de texto condicionadas a cualquiera de las modalidades de entrada.
- Razonamiento asociativo de hechos mediante capas de atencion densa con RoPE (RDA).
- Eficiencia computacional: solo ~182 millones de parametros activos por token, lo que reduce el coste de inferencia en comparacion con un modelo denso del mismo tamano.
- Capacidad de fusion cross-modal bidireccional a traves de tokens de consulta aprendibles en el hub de fusion.
- Soporte de generacion de texto con contexto largo gracias a las capas de estado espacio (aunque la longitud de contexto concreta no se especifica).

## Casos de uso

- Asistente multimodal en dispositivos de borde: el modelo puede procesar una imagen o un clip de audio y generar una descripcion o respuesta textual, adecuado para aplicaciones de accesibilidad o asistencia visual en smartphones o hardware embebido.
- Sistema de transcripcion y resumen de audio: dado un espectrograma de Mel, el modelo puede generar un resumen textual de la conversacion o el contenido acustico, util en entornos con recursos limitados.
- Captioning de imagenes en tiempo real: integrable en camaras de vigilancia o dispositivos IoT para generar descripciones automaticas de escenas, con baja latencia gracias a la activacion esparsa.
- Chatbot de atencion al cliente con comprension multimodal: permite procesar capturas de pantalla o imagenes de productos junto con texto, y generar respuestas contextuales sin depender de un servidor externo.
- Herramienta de razonamiento con contexto largo: las capas SSD permiten mantener un estado interno constante durante inferencia autoregressive, adecuado para agentes conversacionales que requieren memoria de largo plazo en dispositivos locales.
- Prototipado de investigacion en arquitecturas hibridas SSM-atencion: sirve como base para experimentos academicos sobre eficiencia de modelos de sub-billon de parametros con modalidades multiples, gracias a su codigo abierto y su diseno modular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,01 GB segun el autor, lo que permite inferencia en GPUs de consumo y en integradas con memoria compartida.
- GPU recomendadas: puede ejecutarse en RTX 3060 (8 GB), RTX 4060 (8 GB), o incluso en chips integrados como Apple M1/M2 con suficiente RAM unificada.
- No requiere GPU de centro de datos; es viable para despliegue en edge devices con aceleradores NPU o CPU con soporte de inferencia optimizada.
- Opciones de despliegue: dado que usa la libreria transformers y safetensors, puede servirse con vLLM, llama.cpp (si se convierte a GGUF) o TGI; tambien es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no disponibles, pero la activacion de parametros ~182M y la recurrencia SSD sugieren un rendimiento de tokens por segundo superior a un transformer denso del mismo tamano en CPU y GPU de baja potencia.

## Comparativa con modelos similares

No hay datos de benchmarks publicados para comparacion directa. Como referencia cualitativa, se puede situar en la categoria de modelos sub-billion de proposito general:

| Modelo | Parametros totales | Parametros activos | Contexto | Modalidades | Licencia |
|---|---|---|---|---|---|
| Ael-504M | 504 M | ~182 M | no disponible | texto, imagen, audio | BSL 1.1 |
| SmolLM2-360M | 360 M | 360 M (denso) | 8 K | texto | Apache 2.0 |
| Qwen2.5-0.5B | 494 M | 494 M (denso) | 32 K | texto | Apache 2.0 |
| Llama 3.2-1B | 1,23 B | 1,23 B (denso) | 128 K | texto | Llama 3.2 Community License |

La comparativa es orientativa: Ael-504M destaca por su arquitectura hibrida y multimodal, mientras que los alternativas son densos y solo texto. La licencia BSL 1.1 restringe el uso comercial sin licencia adicional, mientras que Apache 2.0 y la licencia de Llama permiten uso comercial con condiciones.

## Limitaciones y advertencias

- La licencia BSL 1.1 es de codigo fuente con restricciones: el uso en produccion comercial puede requerir una licencia comercial de Business Source License, y no es una licencia de open source aprobada por OSI.
- El modelo esta entrenado solo en ingles; su rendimiento en otros idiomas no esta garantizado.
- No hay informacion publica sobre el dataset de entrenamiento ni sobre sesgos, por lo que se recomienda evaluacion previa en aplicaciones sensibles.
- La longitud de contexto no esta especificada; a pesar de las capas SSD, el contexto efectivo puede ser limitado y no comparable con modelos de contexto largo.
- El modelo es multimodal, pero no se han publicado evaluaciones de calidad en tareas de vision o audio, por lo que su rendimiento en estas modalidades es incierto.
- La arquitectura hibrida con MoE puede presentar problemas de balance de carga en inferencia si el enrutamiento no esta bien calibrado, aunque se mencionan tecnicas de regularizacion.
- El repositorio tiene 0 descargas y 0 likes, lo que indica una adopcion inicial muy baja y escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prannesshkva/Ael-504M
- DOI Zenodo: https://doi.org/10.5281/zenodo.22056786
- Perfil del autor en Hugging Face: https://huggingface.co/Prannesshkva
- Perfil de GitHub del autor: https://github.com/prannesshkva
- Pagina personal del autor (proyectos): https://prannesshkva.vercel.app/
