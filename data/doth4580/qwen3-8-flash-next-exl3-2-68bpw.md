# doth4580/Qwen3.8-Flash-Next-EXL3-2.68bpw

## Resumen

Qwen3.8-Flash-Next-EXL3-2.68bpw es una cuantización de precisión mixta (2,68 bits por peso) del modelo Qwen3.8-Flash-Next del equipo Qwen, publicada por el usuario doth4580. No se trata de un modelo nuevo: el repositorio redistribuye byte a byte el pack EXL3 generado por turboderp con la herramienta exllamav3, sin reconvertir ni recuantizar los pesos. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 23.185.448.448 parámetros totales, según los metadatos de safetensors.

La relevancia de esta ficha es doble. Por un lado, documenta una cuantización agresiva (2,68 bpw) que reduce el peso en disco a 98,4 GB, lo que permite cargar un modelo MoE de más de 23.000 millones de parámetros en hardware de gama alta para consumidores y en estaciones de trabajo compactas. Por otro, el autor publica el pack específicamente para veloGB10, un motor de inferencia orientado a clústeres de NVIDIA DGX Spark / GB10, e incluye instrucciones y mediciones de rendimiento en configuraciones de uno, dos y cuatro nodos con tensor parallelism.

El contexto máximo configurado en los comandos de referencia es de 262.144 tokens (`--max-seq-len 262144`), con un límite de generación de 65.536 tokens. La licencia es la Qwen Community License 1.0, heredada del modelo original. La información sobre idiomas, pipeline y benchmarks académicos no está disponible en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos); detalles de capas y expertos no disponibles |
| Parametros totales | 23.185.448.448 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado en los comandos de referencia de veloGB10) |
| Tipos de cuantizacion | EXL3 a 2,68 bpw (variante `2.68bpw_h6_ng8` de turboderp) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3) |
| Tamano del repositorio | 98,4 GB |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Herramienta de cuantizacion | exllamav3 (turboderp) |
| Motor de inferencia de referencia | veloGB10 (`gb10_inference`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos (MoE), según las etiquetas del repositorio (`moe`) y la propia denominación del pack. No se dispone de información detallada sobre el número de capas, el número de expertos, la dimensión oculta, el mecanismo de atención (si es densa o lineal) ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Tampoco se documenta si el modelo incorpora decodificación especulativa nativa más allá del cabezal MTP (multi-token prediction) que el pack utiliza por defecto.

La innovación técnica relevante en este repositorio es la cuantización EXL3 a 2,68 bpw con la variante `h6_ng8`, que combina cuantización de bloques con precisión mixta para mantener la calidad con una huella de memoria muy reducida. El pack incluye un cabezal MTP propio para decodificación especulativa, con tasas de aceptación medidas de en torno al 70 % en todas las topologías. El autor también ha probado cabezales alternativos (HermiHg y DotH-MTP) que sustituyen al del pack sin alterar la salida, solo la velocidad.

## Capacidades

- Generación de texto y razonamiento: el modelo se sirve con el modo "thinking" activado en las pruebas de referencia, lo que indica soporte de razonamiento extendido.
- Generación de código: las mediciones de veloGB10 incluyen un "code turn" específico, lo que confirma uso para tareas de programación.
- Generación creativa: se midió un "story turn" de forma separada, lo que sugiere capacidad para texto narrativo.
- Decodificación especulativa mediante cabezal MTP: acelera la generación sin modificar la salida.
- Servicio mediante API compatible con OpenAI (`/v1`), lo que facilita la integración con clientes existentes.
- Soporte de tensor parallelism (TP=1, TP=2 y TP=4) para repartir el modelo entre varios nodos.
- Caché de prefijos (`--prefix-cache on`) para reutilizar contexto entre peticiones.
- Capacidades multilingües: no disponible.
- Tool calling, function calling y uso como agente: no disponible en la documentación proporcionada.
- Visión o audio: no disponible.

## Casos de uso

- Servicio de inferencia en clúster de DGX Spark: el pack está pensado para desplegarse con veloGB10 en uno, dos o cuatro nodos GB10, con un servidor compatible con OpenAI en el puerto 9000. Es adecuado porque el autor ha validado los comandos y medido el rendimiento en esa topología exacta.
- Asistentes de código en producción: con un decode de 106-177 tok/s en turnos de código según la topología, el modelo puede sostener sesiones interactivas de autocompletado o revisión de código con latencia aceptable.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite ingerir contratos, informes o bases de código extensas en una sola petición, con caché de prefijos para reutilizar el contexto en preguntas sucesivas.
- Generación de narrativa y contenido largo: el turno de historia sostenido a 58-97 tok/s según topología lo hace viable para pipelines de generación de contenido por lotes o interactivos.
- Despliegue multiinquilino ligero: con `--max-batch 2` y agregados de 84-153 tok/s en dos peticiones concurrentes, sirve para entornos de pocos usuarios concurrentes sin infraestructura de centro de datos.
- Investigación sobre cuantización extrema: al ser una redistribución byte a byte de un pack EXL3 de turboderp, sirve como referencia reproducible para estudiar la degradación de calidad a 2,68 bpw frente al modelo en BF16.
- Pruebas de decodificación especulativa: los cabezales MTP alternativos (HermiHg y DotH-MTP) permiten comparar tasas de aceptación y velocidad sin cambiar la salida, útil para experimentos de optimización de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son las mediciones de veloGB10 sobre hardware GB10, con muestreo de producción, thinking activado y una ejecución por celda (variación aproximada de ±10 %).

| Topologia | Cabezal de draft | Decode turno de codigo (tok/s) | Decode turno de historia (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | MTP del pack | 106 | 58 | 69 | 1.769 | 84 | 69,6 % |
| TP=2 | MTP del pack | 145 | 79 | 95 | 2.805 | 131 | 70,4 % |
| TP=4 | MTP del pack | 177 | 95 | 115 | 3.319 | 153 | 69,9 % |
| TP=1 | HermiHg MTP | 109 | 58 | 73 | 1.786 | 93 | 70,3 % |
| TP=2 | HermiHg MTP | 144 | 79 | 91 | 2.810 | 122 | 70,9 % |
| TP=4 | HermiHg MTP | 173 | 97 | 115 | 3.286 | 151 | 71,7 % |
| TP=1 | DotH-MTP | 112 | 59 | 70 | 1.787 | 96 | 70,1 % |
| TP=2 | DotH-MTP | 147 | 80 | 120 | 2.793 | 118 | 70,3 % |
| TP=4 | DotH-MTP | 176 | 96 | 113 | 3.317 | 141 | 70,1 % |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 98,4 GB en disco; en memoria, el pack EXL3 a 2,68 bpw requiere del orden de esa misma cifra más overhead de contexto y caché KV. Con 262.144 tokens de contexto, la caché KV añade una cantidad no documentada que debe presupuestarse aparte.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de uno, dos o cuatro nodos. No se documentan otros aceleradores probados.
- Cabe en GPU de consumo: no se confirma. Un pack de 98,4 GB no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) sin offloading a memoria del sistema, y el autor no documenta ese escenario.
- Opciones de despliegue: veloGB10 (`gb10_inference`) es el motor de referencia probado, con servidor compatible con OpenAI. Al ser formato EXL3 estándar, cualquier framework que lea ExLlamaV3 debería poder cargarlo, aunque no se han publicado pruebas con otros motores.
- Latencia y throughput: prefill de 1.769 a 3.319 tok/s y decode de 69 a 115 tok/s de mediana según topología, con tasas de aceptación del draft en torno al 70 %. El escalado de TP=1 a TP=4 mejora el decode en torno a un 67 % en la mediana y el prefill en torno a un 88 %.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos alternativos en la información proporcionada, por lo que la comparación se limita a lo que se puede afirmar con los datos del repositorio.

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-EXL3-2.68bpw (este) | 23.185.448.448 | 262.144 tokens (configurado) | EXL3 2,68 bpw | qwen-community-1.0 | safetensors EXL3 |
| Qwen/Qwen3.8-Flash-Next (original) | no disponible | no disponible | BF16 (presumiblemente) | qwen-community-1.0 | safetensors |
| turboderp/Qwen3.8-Flash-Next-exl3 (origen del pack) | no disponible | no disponible | EXL3, varias variantes | no disponible | safetensors EXL3 |
| HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3 | no aplica (cabezal) | no aplica | EXL3 | no disponible | safetensors EXL3 |

No se han identificado en la documentación modelos de otros fabricantes comparables en tamaño, contexto y licencia.

## Limitaciones y advertencias

- La cuantización a 2,68 bpw es agresiva; es esperable cierta degradación de calidad frente al modelo original en BF16, aunque el autor no publica métricas de calidad comparativas.
- El repositorio no aporta información sobre sesgos del modelo base, riesgo de alucinación ni comportamiento en dominios sensibles.
- No se documentan los idiomas soportados; no se puede asumir un rendimiento multilingüe sin verificación.
- La licencia Qwen Community License 1.0 puede imponer restricciones al uso comercial; debe revisarse el texto completo antes de desplegar en producción.
- El pack está validado únicamente con veloGB10 sobre GB10; el rendimiento en otros motores o GPUs no está medido.
- Las cifras de rendimiento provienen de una sola ejecución por celda con variación de ±10 %, y de builds de desarrollo de veloGB10 0.7.7, no de una versión estable.
- El contexto de 262.144 tokens exige presupuestar memoria para la caché KV, no incluida en los 98,4 GB del repositorio.
- El autor declara no reclamar propiedad intelectual sobre el modelo ni los pesos; los derechos quedan en manos de Qwen y de los contribuidores del pack original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-2.68bpw
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pack EXL3 original de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Herramienta de cuantización exllamav3: https://github.com/turboderp-org/exllamav3
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Cabezal MTP optimizado de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Cabezal DotH-MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
