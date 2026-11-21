# Baekpica/Sage-S2.1-Flash-VQ-GGUF

## Resumen

Sage-S2.1-Flash-VQ-GGUF es una conversión cuantizada del modelo multimodal internlm/Sage-S2.1-Flash, publicada por el usuario Baekpica. Se distribuye en formato GGUF y está pensada para su despliegue con el runtime ds4-dfm-rs sobre una única estación NVIDIA DGX Spark, manteniendo el contexto nativo de 1.048.576 tokens. El checkpoint incorpora una torre de visión de 24 bloques, un drafter MTP de una capa y nueve proyectores científicos originales, lo que lo orienta a cargas de trabajo image-text-to-text con prompts largos.

La innovación principal es el esquema de cuantización vectorial denominado hVQ (hessian vector quantization), que combina codebooks E4M3 propios con retroalimentación de error correlacionado estimada a partir de 566.932 tokens de calibración en 828 secuencias. Frente a la cuantización VQ estándar, el autor reporta una reducción del 20,4 % en la KL de siguiente token y un aumento de 4,70 puntos porcentuales en la coincidencia top-1 con el modelo fuente, a costa de un aumento del NLL y de la perplejidad en su corpus de evaluación.

El resultado es un directorio GGUF de 56 partes y 88,00 GiB (94.483.348.344 bytes de payload tensorial) que cabe en la memoria unificada de una DGX Spark. Es relevante para equipos que quieran servir un modelo de mezcla de expertos con visión y contexto de un millón de tokens en hardware de un solo nodo, asumiendo las limitaciones de fidelidad que introduce una cuantización tan agresiva (1,625 y 2,625 bits por peso en las capas enrutadas).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y torre de visión; 45 bloques troncales, 288 expertos por bloque enrutado, drafter MTP de una capa |
| Parámetros totales | 634.388.480 (según safetensors del modelo base); el autor no publica el recuento del checkpoint cuantizado |
| Parámetros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (configurado) |
| Tipos de cuantización | GVQ1 con capas R13+8 (2,625 bits por peso) y R13 (1,625 bits por peso); Q4_K en 316 matrices no experto; E4M3 para codebooks |
| Idiomas soportados | no disponible (la model card menciona streaming en coreano en las pruebas HTTP) |
| Licencia | MIT |
| Formato de pesos | GGUF (56 partes, 88,00 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 45 bloques troncales y 288 expertos por bloque enrutado, complementado por una torre de visión de 24 bloques, un drafter MTP de una capa (capa 45) para decodificación especulativa y nueve proyectores científicos. La conversión preserva la torre de visión y el drafter en precisión completa, mientras que las capas enrutadas se comprimen con dos perfiles: R13+8 (2,625 bits por peso) en las capas 3-17, 22, 27, 41 y 44, y R13 (1,625 bits por peso) en las otras 23 capas enrutadas. La selección de capas sigue un estudio de sensibilidad previo del autor sobre modelos GLM.

El proceso de cuantización hVQ entrena codebooks E4M3 específicos para cada checkpoint y utiliza las entradas enrutadas de 566.932 tokens en 828 secuencias para estimar correlaciones de entrada completas. Dos pasadas secuenciales de asignación propagan el error de cada bloque a las columnas de entrada posteriores y reajustan las ganancias de fila almacenadas. En la evaluación sobre 34 secuencias retenidas, hVQ obtiene una KL media de 0,7169 frente a 0,9009 de la VQ estándar, y una coincidencia top-1 del 78,54 % frente al 73,84 %, aunque con peor NLL (2,7428 frente a 2,4214) y peor perplejidad (15,531 frente a 11,262). El autor no documenta la composición del dataset de entrenamiento del modelo original ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1.048.576 tokens.
- Entrada image-text-to-text: la torre de visión de 24 bloques procesa imágenes y las integra en la conversación.
- Razonamiento separado: el servidor expone un canal de razonamiento distinto del texto de respuesta.
- Llamada a herramientas (tool calling) y gestión de la petición de seguimiento asociada.
- Soporte de los endpoints HTTP de completions, messages y responses en el runtime ds4-dfm-rs.
- Decodificación especulativa mediante el drafter MTP de una capa, con modos `--mtp-mode on` y `--mtp-draft 3`.
- Capacidades científicas a través de los nueve proyectores originales, incluido el flujo de trabajo CIF para estructuras de silicio.
- Streaming de texto, verificado en coreano durante las pruebas del autor.
- Procesamiento de vídeo proyectado por el cliente, con continuaciones reproducidas respecto al host de conversión.

## Casos de uso

- Análisis de documentos extensos: con 1.048.576 tokens de contexto, el modelo puede ingerir informes completos, expedientes o bases de código y responder preguntas sobre ellos sin fragmentación; el autor verificó la recuperación literal de un identificador situado en el centro de un prompt de 900.068 tokens.
- Asistencia conversacional multimodal: la torre de visión permite adjuntar capturas, diagramas o figuras y mantener un diálogo multi-turno sobre ellas, aprovechando la reutilización de caché (633 de 641 tokens reutilizados en una prueba de seguimiento).
- Agentes con tool calling: el modelo emite llamadas a herramientas y gestiona la respuesta de seguimiento, lo que permite integrarlo en flujos de automatización con APIs externas.
- Procesamiento de literatura científica: los nueve proyectores científicos y el flujo CIF permiten trabajar con representaciones de estructuras cristalinas y materiales dentro de la misma sesión conversacional.
- Despliegue en hardware de un solo nodo: al caber en una DGX Spark con 88,00 GiB, sirve para prototipado y validación de pipelines MoE multimodales sin clúster multi-GPU.
- Transcripción y análisis de vídeo proyectado: el modelo reproduce continuaciones sobre vídeo proyectado por el cliente, útil para resúmenes de secuencias visuales.
- Atención al cliente especializada: el contexto largo y el razonamiento separado permiten mantener historiales extensos y mostrar solo la respuesta final al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de fidelidad de cuantización frente al checkpoint original:

| Métrica | VQ estándar | hVQ | hVQ − VQ (intervalo 95 % pareado) |
|---|---:|---:|---|
| KL de siguiente token vs fuente (menor es mejor) | 0,9009 | 0,7169 | -0,1840 [-0,2511, -0,1249] |
| Coincidencia top-1 con la fuente (mayor es mejor) | 73,84 % | 78,54 % | +4,70 pp [+4,00, +5,36] |
| NLL de siguiente token (menor es mejor) | 2,4214 | 2,7428 | +0,3214 [+0,1868, +0,4617] |
| Perplejidad (menor es mejor) | 11,262 | 15,531 | +4,269 [+1,599, +10,232] |
| Coseno del estado oculto final (mayor es mejor) | 0,8200 | 0,8748 | +0,0547 [+0,0498, +0,0602] |
| Error L2 relativo de salida enrutada (menor es mejor) | 0,4335 | 0,3581 | -0,0754 |

Desglose por grupo de secuencias retenidas:

| Grupo | Casos | Tokens puntuados | KL VQ | KL hVQ | Top-1 VQ | Top-1 hVQ |
|---|---:|---:|---:|---:|---:|---:|
| Texto general | 9 | 6.217 | 1,153 | 0,994 | 69,2 % | 73,3 % |
| Chat e instrucciones | 8 | 5.542 | 0,491 | 0,347 | 77,7 % | 82,4 % |
| Matemáticas, ciencia y razonamiento | 7 | 5.258 | 0,649 | 0,543 | 80,5 % | 84,0 % |
| Código y SWE | 7 | 5.150 | 1,314 | 1,035 | 69,3 % | 75,1 % |
| Uso de herramientas y prompts de agente | 3 | 2.557 | 0,862 | 0,561 | 72,5 % | 78,6 % |

Rendimiento en DGX Spark (medianas de 2K a 64K de contexto): mejora del 12,0 % en prefill incremental y del 8,6 % en decodificación respecto a la versión anterior; la decodificación mejora en 23 de 32 fronteras. En la prueba de prompt de 900.068 tokens, el tiempo hasta el primer token fue de 873,9 segundos.

## Requisitos de hardware

- Memoria: el directorio GGUF ocupa 88,00 GiB, por lo que requiere al menos esa cantidad de memoria unificada o VRAM; el autor lo ejecuta en una única DGX Spark.
- GPU recomendadas: NVIDIA DGX Spark (caso validado por el autor). No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no hay evidencia de que quepa en tarjetas consumer de 24 GB o 48 GB; el tamaño del checkpoint lo impide en configuraciones de una sola GPU convencional.
- Despliegue: runtime ds4-dfm-rs con los parámetros `--mtp-mode on --mtp-draft 3 --mem-floor-gb 4` y prefill en trozos de 2.048 filas.
- Latencia: tiempo hasta el primer token de 873,9 segundos para un prompt de 900.068 tokens sin caché; no se publican cifras de throughput absoluto, solo las mejoras relativas del 12,0 % en prefill y 8,6 % en decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sage-S2.1-Flash-VQ-GGUF (este) | 634.388.480 (base) | 1.048.576 | GGUF GVQ1, 88,00 GiB | MIT | Hugging Face, runtime ds4-dfm-rs |
| internlm/Sage-S2.1-Flash (base) | 634.388.480 | 1.048.576 | safetensors (BF16) | MIT | Hugging Face |
| Baekpica/GLM-5.3-Flash-VQ-GGUF | no disponible | no disponible | GGUF | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: el NLL y la perplejidad empeoran respecto a la VQ estándar, y el error L2 relativo de salida enrutada se sitúa en 0,3581.
- El modelo de visión cometió un error de reconocimiento de color en una prueba de 112 píxeles (identificó un cuadrado azul sólido como negro), lo que indica fragilidad en imágenes pequeñas.
- El servidor aceptó el CIF de silicio proyectado pero generó una continuación distinta a la del host de conversión, por lo que los flujos científicos requieren validación adicional.
- El tiempo hasta el primer token en prompts de casi un millón de tokens es de 873,9 segundos, lo que limita su uso interactivo en ese régimen.
- No se documentan los idiomas soportados ni la composición del dataset de entrenamiento del modelo base, lo que dificulta evaluar sesgos lingüísticos.
- No hay información sobre sesgos conocidos ni sobre tasas de alucinación medidas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la fidelidad del checkpoint cuantizado en dominios distintos del corpus de calibración.
- El despliegue está validado únicamente con ds4-dfm-rs sobre DGX Spark; no se ha verificado en vLLM, llama.cpp, Ollama ni TGI.
- El repositorio tiene 0 likes y 1.120 descargas, con una única revisión publicada el mismo día de creación y actualización, lo que reduce la evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Baekpica/Sage-S2.1-Flash-VQ-GGUF
- Modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash
- Estudio de sensibilidad GLM citado: https://huggingface.co/Baekpica/GLM-5.3-Flash-VQ-GGUF
- Registro de calibración: calibration-summary.json (en el repositorio)
- Receta de conversión: recipe.json (en el repositorio)
- Resultados de evaluación: evaluation.json (en el repositorio)
- Guía de compilación y servicio: RUNTIME.md (en el repositorio)
- Sumas de verificación: SHA256SUMS (en el repositorio)
