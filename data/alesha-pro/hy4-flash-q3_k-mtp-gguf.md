# alesha-pro/Hy4-flash-Q3_K-MTP-GGUF

## Resumen

Hy4-flash es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) desarrollado por Tencent, con 222.679.844.717 parámetros totales según los pesos en safetensors del modelo base. Esta ficha describe la cuantización GGUF Q3_K publicada por el usuario alesha-pro bajo el paraguas de su proyecto Project Maya, una bifurcación de motores de inferencia orientada a ejecutar modelos de gran tamaño en hardware de consumo. La aportación principal de esta versión es la recuantización de la capa MTP (Multi-Token Prediction) para que el modelo completo, con su contexto de 262.144 tokens y su torre de visión, quepa en configuraciones de 1, 2 o 4 tarjetas RTX 3090.

El modelo resuelve el problema de desplegar un MoE de más de 220.000 millones de parámetros en GPUs de 24 GB de VRAM mediante una combinación de cuantización agresiva de los expertos enrutados (Q3_K y Q4_K), cuantización Q8_0 de las matrices de atención y proyecciones, y una política de offloading que mantiene en RAM los expertos que no caben en VRAM, computándolos en CPU. La capa MTP, que en el GGUF original de AngelSlim permanecía en BF16 y ocupaba 7,0 GiB, se recuantiza aquí a Q3_K y Q8_0, reduciéndose a 1,6 GiB, lo que permite mantener el contexto completo de 262.144 tokens en tarjetas de 24 GB.

Es relevante ahora porque demuestra que es posible ejecutar un modelo multimodal de escala frontera con decodificación especulativa y contexto largo en hardware consumer, a velocidades de 251 tokens por segundo en 4×RTX 3090 y de 40 a 47 tokens por segundo en una sola RTX 3090, sin alterar la calidad de los pesos del tronco principal. La licencia es la Tencent Hy License, que impone restricciones de uso comercial que deben revisarse antes de cualquier despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con capa MTP y torre de visión; detalles internos del transformer no disponibles |
| Parámetros totales | 222.679.844.717 |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Q3_K y Q4_K (expertos enrutados), Q8_0 (atención, proyecciones, expertos compartidos), BF16 (cabeza de salida), F32 (indexer.proj), capa MTP en Q3_K y Q8_0, Engram table a 8 bits |
| Idiomas soportados | no disponible (la model card menciona generación de código y prosa en inglés y ruso para el perfil de enrutamiento) |
| Licencia | tencent-hy-license (Tencent Hy License) |
| Formato de pesos | GGUF (2 shards principales, más mmproj y tokenizer) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) que incorpora una capa de predicción multi-token (MTP) para decodificación especulativa, una torre de visión con proyector multimodal para entrada image-text-to-text, y una tabla Engram de 660 millones de filas de 96 valores almacenada a 8 bits. El modelo base es tencent/Hy4-flash; los detalles sobre el número de tokens de entrenamiento, la composición del dataset y si hubo RLHF o DPO no están disponibles en la información proporcionada.

La innovación técnica destacable de esta publicación no reside en el entrenamiento sino en la ingeniería de despliegue: la recuantización de los 21 tensores del bloque `blk.42` (la capa MTP) desde BF16 hasta Q3_K y Q8_0 mediante `ggml_quantize_chunk` sin matriz de importancia, la conversión de la torre de visión a BF16 mediante el conversor del parche de llama.cpp de AngelSlim, y un perfil de enrutamiento (`routing-profile.txt`) que registra la frecuencia de selección de cada experto enrutado durante generación de código y prosa en inglés y ruso, usado como estado inicial del calentamiento de expertos en los modos de 2 y 1 tarjeta. El motor necesario es la rama `hy4-flash` de Project Maya; llama.cpp estándar no carga este modelo. La decodificación especulativa con MTP alcanza una tasa de aceptación del 82% al 93% de los primeros borradores, y como el modelo principal verifica cada token propuesto, los borradores no alteran la salida, solo la velocidad.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Entrada de imágenes y texto (pipeline image-text-to-text) mediante torre de visión y proyector multimodal en BF16.
- Generación de código, incluyendo sesiones de agente de programación (la model card reporta una sesión de agente de código con una media de 223 tokens por segundo sobre unos 50.000 tokens generados en 4 GPU).
- Decodificación especulativa mediante capa MTP con verificación por el modelo principal.
- Capacidades multilingües: la model card menciona inglés y ruso en el contexto del perfil de enrutamiento; el conjunto completo de idiomas soportados no está disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: la model card menciona sesiones de agente de código, pero no detalla mecanismos específicos de agentes.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en local con contexto largo: el modelo puede mantener sesiones de agente de programación con decenas de miles de tokens generados a una media de 223 tokens por segundo en 4×RTX 3090, lo que permite integrarlo en flujos de trabajo de desarrollo sin depender de APIs externas.
- Análisis de documentos extensos con imágenes: gracias al contexto de 262.144 tokens y a la torre de visión, se pueden procesar manuales técnicos, informes con figuras o capturas de pantalla y formular preguntas sobre su contenido en una sola pasada.
- Atención al cliente automatizada multi-turno: el contexto largo permite conservar el historial completo de una conversación prolongada sin truncamiento, manteniendo coherencia en interacciones de soporte técnico.
- Procesamiento de repositorios de código completos: con 262.144 tokens de contexto se puede cargar un repositorio mediano y realizar tareas de revisión, refactorización o generación de tests con visión global del proyecto.
- Despliegue en estaciones de trabajo con una sola GPU: el modo de 1 tarjeta mantiene los mismos pesos y calidad que el de 4 tarjetas, con 40 a 47 tokens por segundo, adecuado para prototipado y uso individual en una RTX 3090.
- Investigación en decodificación especulativa: la capa MTP recuantizada y el perfil de enrutamiento proporcionan un banco de pruebas reproducible para estudiar el equilibrio entre offloading de expertos, velocidad de decodificación y aceptación de borradores.
- Transcripción y descripción de imágenes en pipelines locales: el pipeline image-text-to-text permite generar descripciones o extraer información de imágenes dentro de flujos que no pueden enviar datos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card indica explícitamente que el autor no ejecutó benchmarks de tareas y remite a las puntuaciones de AngelSlim para su archivo Q3_K, que según ellos quedan a menos de 0,5 puntos de BF16 en sus propias suites.

Rendimiento de inferencia medido (4×RTX 3090 a 300 W, PCIe 3.0 x16, EPYC 7642, 512 GB DDR4 en 8 canales, contexto 262.144, caché KV Q8, MTP):

| Métrica | 4 GPU | 2 GPU | 1 GPU |
|---|---:|---:|---:|
| Expertos enrutados en VRAM | todos | 43% | 15% |
| Decode, prompt corto de código, 600 tokens | 251 tok/s | 70 tok/s | 40 tok/s |
| Decode tras prompt de 57K | 176–221 tok/s | 81–104 tok/s | 40–47 tok/s |
| Decode con 255K–261K tokens en contexto | 159–197 tok/s | 61 tok/s | no medido |
| Sesión de agente de código, media sobre ~50K tokens | 223 tok/s | 74 tok/s | no medido |
| Prefill, prompt de 57K | 2947 tok/s | 1225 tok/s | 415 tok/s |
| Llenado de 255K tokens de contexto | 2880 tok/s | 1239 tok/s (206 s) | no medido |

Calidad en 2 tarjetas frente a 4 tarjetas (512 posiciones con teacher forcing sobre un texto largo):

| Ejecución | Mismo token top-1 | KL mediana |
|---|---:|---:|
| 4 GPU con expertos repartidos en otro orden (ruido del test) | 88,3% | 0,0054 |
| 2 GPU, carril CPU | 88,3% | 0,0047 |
| 2 GPU, carril CPU, chunk de prefill 4096 | 87,9% | 0,0051 |

## Requisitos de hardware

- VRAM: los pesos principales ocupan 86,2 GB (shard 1) más 63,4 GB (tabla Engram) más 1,04 GB (proyector de visión). En 4×RTX 3090 caben todos los expertos enrutados en VRAM. En 2 tarjetas caben el 43% de los expertos y en 1 tarjeta el 15%, con el resto en RAM y computado en CPU.
- RAM: los modos de 2 y 1 tarjeta fijan 73 GiB para los expertos enrutados y mapean los 59 GiB de la tabla Engram. Los 3 modos necesitan la tabla Engram en RAM o en page cache.
- GPUs recomendadas: 4×RTX 3090 para máximo rendimiento (251 tok/s); 2×RTX 3090 para 70–104 tok/s; 1×RTX 3090 para 40–47 tok/s. No se reportan pruebas en A100, H100 ni otras GPUs.
- Cabe en GPU consumer: sí, en RTX 3090 de 24 GB, en configuraciones de 1, 2 o 4 tarjetas, con offloading de expertos a RAM.
- Opciones de despliegue: exclusivamente la rama `hy4-flash` de Project Maya (https://github.com/alesha-pro/project-maya/tree/hy4-flash). llama.cpp estándar no carga este modelo. El repositorio incluye configuraciones de servidor para 4, 2 y 1 tarjeta en `configs/`.
- Latencia y throughput: ver tabla de benchmarks. La velocidad de decodificación en 2 y 1 tarjeta depende de cuántos expertos seleccionados estén ya en VRAM; el motor mueve expertos entre VRAM y RAM durante la generación, por lo que los primeros cientos de tokens sobre un tema nuevo se sitúan en el extremo bajo del rango y una sesión larga en el alto.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Hy4-flash Q3_K MTP (esta ficha) | 222.679.844.717 | 262.144 | Tencent Hy License | GGUF, motor Project Maya rama hy4-flash | MTP recuantizado, visión, offloading de expertos a RAM |
| tencent/Hy4-flash (modelo base) | 222.679.844.717 | no disponible | Tencent Hy License | safetensors en Hugging Face | Pesos originales sin cuantizar; requiere hardware de datacenter |
| AngelSlim/Hy4-flash-GGUF | no disponible | no disponible | no disponible | GGUF, llama.cpp con parche de AngelSlim | Punto de partida de esta cuantización; capa MTP en BF16 (7,0 GiB) |
| Otros MoE de escala similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Licencia Tencent Hy License: impone restricciones que deben revisarse antes de cualquier uso comercial; la model card cita la sección 4 de la licencia como motivo del aviso de cambios en los pesos.
- Dependencia de un motor no estándar: llama.cpp estándar no carga este modelo; es obligatorio usar la rama `hy4-flash` de Project Maya, lo que limita la portabilidad y el soporte comunitario.
- Requisito de RAM elevado: los 3 modos necesitan la tabla Engram (59 GiB) en RAM o page cache, y los modos de 2 y 1 tarjeta fijan además 73 GiB para expertos enrutados.
- Rendimiento variable en 2 y 1 tarjeta: la velocidad depende del acierto del perfil de enrutamiento y del tema; los primeros cientos de tokens sobre temas nuevos son más lentos.
- Sin benchmarks de tareas publicados por el autor de la cuantización: la calidad se infiere de la afirmación de AngelSlim de estar a menos de 0,5 puntos de BF16 en sus suites, no verificada de forma independiente en esta ficha.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos de lenguaje de gran escala.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas: el conjunto completo de idiomas soportados no está disponible; el perfil de enrutamiento solo cubre inglés y ruso.
- Tool calling y modo thinking: no confirmados en la información disponible; no asumir su disponibilidad en producción sin verificación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios muy reducido, lo que implica poca validación comunitaria y soporte limitado ante problemas.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/alesha-pro/Hy4-flash-Q3_K-MTP-GGUF
- Modelo base en Hugging Face: https://huggingface.co/tencent/Hy4-flash
- GGUF original de AngelSlim: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Motor Project Maya (rama hy4-flash): https://github.com/alesha-pro/project-maya/tree/hy4-flash
- Instrucciones de ejecución: https://github.com/alesha-pro/project-maya/blob/hy4-flash/docs/HY4-FLASH.md
- Project Maya original: https://github.com/mw00/project-maya
- Motor Strata: https://github.com/Niko1221/Strata
- llama.cpp y ggml: https://github.com/ggml-org/llama.cpp
