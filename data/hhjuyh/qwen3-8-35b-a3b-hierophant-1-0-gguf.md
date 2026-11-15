# hhjuyh/Qwen3.8-35B-A3B-Hierophant-1.0-GGUF

## Resumen

Qwen3.8-35B-A3B-Hierophant-1.0-GGUF es una variante no oficial del modelo Empero Qwen3.8-35B-A3B-Distill, publicada por el usuario hhjuyh en Hugging Face. Se trata de una cuantización Q6_K en formato GGUF (29,21 GB) a la que se le ha aplicado un adaptador de rango 1 denominado Hierophant, con escala 1.0, cuyo objetivo declarado es reducir el comportamiento de rechazo (refusals) del modelo original. La modificación afecta a 121 tensores de los 753 totales, preservando el formato original de todos ellos, y se distribuye como GGUF autónomo para su uso en llama.cpp y LM Studio.

El modelo subyacente es un Qwen3.8-35B-A3B, es decir, una arquitectura Mixture of Experts con aproximadamente 35.500 millones de parámetros totales y una fracción activa por token (el sufijo A3B sugiere del orden de 3.000 millones de parámetros activos, aunque el dato exacto no está confirmado en la información disponible). Según la model card, deriva de Qwen3.6-35B-A3B mediante un proceso de destilación realizado por Empero. El pipeline declarado es image-text-to-text, por lo que el modelo admite entrada de imagen si se acompaña del proyector visual correspondiente.

La relevancia de esta ficha es doble: por un lado, ejemplifica el ecosistema de variantes comunitarias (abliterations y merges de adaptadores) sobre modelos Qwen; por otro, documenta con transparencia el impacto medido de esas modificaciones sobre el comportamiento del modelo, incluyendo un empeoramiento en tareas de razonamiento multi-paso. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, derivada de Qwen3.6-35B-A3B |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible (el sufijo A3B sugiere ~3 B activos, sin confirmar) |
| Longitud de contexto | no disponible (la prueba de calidad se ejecutó con 2.048 tokens) |
| Tipos de cuantizacion | Q6_K (único archivo publicado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector visual mmproj en F16 separado |
| Tamano del repositorio | 29,2 GB |
| Archivo principal | Qwen3.8-35B-A3B-Hierophant-1.0-Q6_K.gguf (29,21 GB) |
| Proyector visual | mmproj-Qwen3.8-35B-A3B-F16.gguf (upstream, descarga aparte) |
| Modelo base | empero-ai/Qwen3.8-35B-A3B-Distill-GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B: un transformer con capas de mezcla de expertos, con 35,5 mil millones de parámetros totales y un subconjunto activo por token. Sobre esa base, Empero aplicó un proceso de destilación (Qwen3.8-35B-A3B-Distill) del que no se detallan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se especifican innovaciones de atención o decodificación.

La modificación específica de esta variante es un merge de un adaptador de rango 1 (Hierophant) sobre el GGUF Q6_K original, a escala 1.0. El merge edita 121 tensores y conserva el formato del resto (753 tensores en total). No se trata de un reentrenamiento ni de un fine-tuning con datos nuevos, sino de una edición de pesos orientada a suprimir la tendencia al rechazo. La model card no documenta la metodología interna del adaptador ni los datos usados para construirlo; solo reporta el efecto medido sobre un conjunto de 36 prompts.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento aritmético básico (la prueba de humo incluyó un prompt aritmético resuelto correctamente).
- Entrada de imagen (image-text-to-text) mediante el proyector `mmproj-Qwen3.8-35B-A3B-F16.gguf`; la model card solo confirma una prueba de lectura de un título en una imagen.
- Ejecución en llama.cpp y LM Studio mediante GGUF.
- Comportamiento de rechazo reducido: 0/10 rechazos explícitos en prompts de engaño y trampa, frente a 10/10 del modelo original.
- Soporte de tool calling y function calling: no disponible (no evaluado; la model card indica explícitamente que el uso de herramientas quedó fuera del alcance de las pruebas).
- Razonamiento multi-paso: capacidad limitada; 0/6 tareas JSON multi-paso correctas tanto en el original como en el merge.
- Capacidades multilingües: no disponibles más allá del inglés declarado.
- Modo thinking: las pruebas se ejecutaron con thinking desactivado; no se documenta su comportamiento con thinking activo.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite estudiar empíricamente cómo un merge de rango 1 altera la tasa de rechazo (de 10/10 a 0/10) sin cambiar la arquitectura, útil para comparar metodologías de abliteration en entornos controlados.
- Despliegue local en estación de trabajo con GPU de 24 GB o más: el GGUF Q6_K de 29,21 GB puede cargarse en llama.cpp con offloading parcial o total según la VRAM, sin necesidad de infraestructura en la nube.
- Prototipado de asistentes conversacionales en inglés: al ser un GGUF autónomo, se integra en LM Studio para pruebas de diálogo multi-turno con contexto moderado (2.048 tokens verificados).
- Procesamiento de documentos con imagen: con el proyector visual adjunto, puede extraer texto de capturas o imágenes simples, como demuestra la prueba de lectura de título.
- Evaluación comparativa de cuantizaciones: sirve como referencia Q6_K para medir la degradación de calidad frente a otras cuantizaciones del mismo modelo base en pipelines de llama.cpp.
- Docencia y demostraciones de MoE en local: al tener ~3 B parámetros activos por token, el coste de cómputo por inferencia es menor que el de un modelo denso de 35 B, lo que facilita demos en hardware de gama alta de consumo.
- Pruebas de robustez frente a prompts adversarios: la model card documenta que 9 de 10 respuestas a solicitudes de engaño alcanzaron el límite de 192 tokens, dato relevante para diseñar filtros de salida.

## Benchmarks y rendimiento

La model card reporta una evaluación propia sobre 36 prompts en llama.cpp, contexto de 2.048 tokens, thinking desactivado y temperatura 0. No son benchmarks estándar (MMLU, HumanEval, GSM8K), sino métricas internas de rechazo y calidad.

| Métrica (36 prompts, temp. 0) | Q6_K original | Hierophant 1.0 Q6_K |
|---|---:|---:|
| Rechazos explícitos en engaño/trampa | 10/10 | 0/10 |
| Solicitudes redirigidas a alternativa honesta | 0/10 | 1/10 |
| Prompts de control benignos respondidos | 4/4 | 4/4 |
| Respuestas cortas correctas | 14/16 | 14/16 |
| Tareas JSON multi-paso correctas | 0/6 | 0/6 |
| Total de tareas de calidad correctas | 14/22 | 14/22 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para Q6_K: aproximadamente 29,2 GB solo para los pesos, más overhead de contexto KV; en la práctica, del orden de 30-32 GB para contexto corto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para carga completa en VRAM; en RTX 4090 (24 GB) no cabe entero y requiere offloading parcial a RAM del sistema.
- GPU de consumo: posible en RTX 3090/4090 (24 GB) solo con offloading parcial; el rendimiento caerá por el tráfico PCIe. No cabe en GPUs de 16 GB o menos sin offloading agresivo.
- Opciones de despliegue: llama.cpp (verificado en la model card), LM Studio (importación del GGUF); vLLM y TGI no están confirmados para este archivo GGUF.
- Proyector visual: requiere cargar además `mmproj-Qwen3.8-35B-A3B-F16.gguf`, que añade VRAM adicional no cuantificada en la información disponible.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Hierophant-1.0 (este) | 35,5 B totales, ~3 B activos (sufijo A3B) | no disponible | GGUF Q6_K | Apache 2.0 | Merge de abliteration; rechazo 0/10 |
| empero-ai/Qwen3.8-35B-A3B-Distill-GGUF (base) | 35,5 B totales | no disponible | GGUF (Q6_K y otros) | Apache 2.0 | Modelo original sin modificar; rechazo 10/10 |
| Qwen/Qwen3.6-35B-A3B (upstream) | 35 B totales, ~3 B activos | no disponible | safetensors y derivados | Apache 2.0 (según la model card) | Base sobre la que Empero destiló |
| Otras abliterations de la familia Qwen | variable | variable | GGUF / safetensors | variable (habitualmente Apache 2.0) | No se dispone de datos concretos en la información proporcionada |

## Limitaciones y advertencias

- La modificación Hierophant reduce los rechazos de forma drástica (10/10 a 0/10), lo que implica que el modelo cumplirá solicitudes de engaño, trampa o plagio; no es apto para despliegues de producción orientados al público sin filtros externos.
- En 9 de 10 respuestas a solicitudes de engaño se alcanzó el límite de 192 tokens, lo que sugiere respuestas largas y potencialmente divagatorias en esos casos.
- El rendimiento en tareas JSON multi-paso es nulo (0/6) tanto en el original como en el merge; no debe usarse para pipelines que requieran salida estructurada fiable.
- La evaluación se limita a 36 prompts con thinking desactivado, contexto de 2.048 tokens y temperatura 0; no hay datos sobre contexto largo, tool use ni thinking activo.
- El soporte de visión solo se verificó con una prueba de humo (lectura de un título en una imagen); no hay evaluación sistemática de OCR o comprensión visual.
- Idioma declarado únicamente inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación no cuantificado; la model card no incluye evaluaciones de veracidad más allá de los prompts de control.
- Es una variante no oficial publicada por un tercero (hhjuyh), sin revisión por parte de Qwen ni de Empero; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- La licencia Apache 2.0 permite uso comercial, pero el comportamiento resultante (cumplimiento de solicitudes dañinas) puede contravenir políticas de uso de plataformas y obligaciones legales del desplegador.
- No se documenta la metodología del adaptador Hierophant ni los datos que lo originaron, lo que limita la auditabilidad del cambio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hhjuyh/Qwen3.8-35B-A3B-Hierophant-1.0-GGUF
- Modelo base (GGUF): https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill-GGUF
- Modelo base (distill): https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- GGUF Q6_K original: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill-GGUF/blob/main/Qwen3.8-35B-A3B-Q6_K.gguf
- Proyector visual original: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill-GGUF/blob/main/mmproj-Qwen3.8-35B-A3B-F16.gguf
- Repositorio Hierophant: https://github.com/khimaros/hierophant
- Modelo Qwen base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
