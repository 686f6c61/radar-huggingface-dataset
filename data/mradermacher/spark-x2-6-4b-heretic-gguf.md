# mradermacher/Spark-X2.6-4B-heretic-GGUF

## Resumen

Spark-X2.6-4B-heretic-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo daydreamwarrior/Spark-X2.6-4B-heretic, publicada por el cuantizador mradermacher, conocido por su catálogo masivo de quants comunitarios. El modelo base es una versión de 4.112 millones de parámetros (según los metadatos de safetensors) de la familia SparkX2.5, etiquetada como "heretic", "uncensored", "decensored" y "abliterated", lo que indica que se trata de una variante a la que se le han eliminado o reducido los mecanismos de alineación de seguridad mediante técnicas de abliteration.

La relevancia de esta ficha no está tanto en el modelo base (del cual no se ha publicado documentación técnica detallada en la información disponible) como en la utilidad del formato: las cuantizaciones GGUF permiten ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama, LM Studio y otros runtimes compatibles, con tamaños que van desde 1,9 GB (Q2_K) hasta 8,3 GB (f16). El modelo está orientado a conversación, soporta inglés y chino, y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | sparkx2_5 (transformer; detalles no disponibles) |
| Parametros totales | 4.112.079.360 (~4,1 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado a partir de safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base pertenece a la arquitectura sparkx2_5, según los metadatos del repositorio. No se ha publicado información sobre el número de capas, cabezas de atención, dimensiones ocultas ni sobre el proceso de preentrenamiento (tokens, composición del dataset, RLHF/DPO) en la información disponible. El sufijo "heretic" y las etiquetas "abliterated" y "decensored" sugieren que el modelo original ha sido sometido a un proceso de abliteration, una técnica que modifica los pesos (normalmente proyectando o eliminando las direcciones de rechazo en el espacio de activaciones) para suprimir los comportamientos de negativa aprendidos durante el alineado, sin necesidad de reentrenamiento completo.

Esta versión de mradermacher consiste en cuantizaciones estáticas en GGUF, generadas mediante conversión tipo hf. El autor también ofrece cuantizaciones weighted/imatrix (matriz de importancia) en un repositorio complementario, que suelen preservar mejor la calidad a niveles de compresión equivalentes.

## Capacidades

- Generación de texto conversacional (pipeline etiquetado como conversational).
- Soporte de inglés y chino.
- Al ser una variante abliterated/uncensored, responde sin los rechazos típicos de los modelos alineados (esto es una característica del modelo base, no una capacidad añadida).
- Al tratarse de un modelo base sin documentación detallada, no consta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio: no disponible.
- Compatibilidad con cualquier runtime que soporte GGUF (llama.cpp, Ollama, LM Studio, koboldcpp, etc.).

## Casos de uso

- Experimentación local en GPU de consumo: con el quant Q4_K_M (2,7 GB) el modelo cabe holgadamente en GPUs de 4-6 GB de VRAM o incluso en CPUs modernas, siendo adecuado para probar una arquitectura poco documentada sin coste de infraestructura.
- Investigación sobre abliteration: permite estudiar en local cómo la eliminación de direcciones de rechazo afecta al comportamiento del modelo, comparando salidas antes y después del proceso con distintos niveles de cuantización.
- Desarrollo de chatbots personales sin filtros: su etiqueta conversational y su tamaño reducido lo hacen apto para asistentes locales de propósito general donde el usuario acepta asumir la responsabilidad del contenido generado.
- Prototipado con Ollama o LM Studio: los GGUF estáticos se integran directamente en estos gestores, útiles para crear demos rápidas o evaluar el modelo en flujos de trabajo existentes.
- Despliegue en dispositivos con recursos limitados: el quant Q2_K (1,9 GB) permite ejecutar el modelo en equipos muy modestos, a costa de una degradación notable de calidad.
- Uso comercial en productos derivados: la licencia Apache 2.0 permite integrar el modelo en aplicaciones comerciales, servicios SaaS o productos embebidos sin obligación de abrir el código propio (solo conservar avisos de licencia).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible, ni para el modelo base ni para las cuantizaciones. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada, por lo que no es posible evaluar objetivamente su calidad respecto a modelos comparables.

## Requisitos de hardware

- VRAM estimada para inferencia según quant: Q2_K ~1,9 GB; Q4_K_M ~2,7 GB; Q6_K ~3,5 GB; Q8_0 ~4,5 GB; f16 ~8,3 GB (añadir 0,5-1,5 GB adicionales para la KV-cache según la longitud de contexto, que no está documentada).
- GPUs recomendadas: cualquier GPU con 4 GB de VRAM o más ejecuta los quants de 4-5 bits con holgura; con 8 GB (RTX 3060, RTX 4060, RTX 4070) puede ejecutarse el f16 completo.
- Cabe en consumer GPUs: sí, incluso en GPUs de gama de entrada; también es viable la inferencia en CPU pura dado el tamaño reducido (~4,1 B parámetros).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp, Jan; también compatible con backends de servidor como llama-cpp-python para exponer APIs tipo OpenAI.
- Latencia y throughput: no disponibles; dado el tamaño (~4 B parámetros), en una GPU moderna de consumo cabe esperar velocidades del orden de decenas de tokens por segundo, pero no hay cifras publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-4B-heretic-GGUF | ~4,1 B | GGUF (12 quants) | Apache 2.0 | Variante abliterated, sin benchmarks publicados |
| Qwen2.5-3B-Instruct (GGUF) | 3,1 B | GGUF, safetensors | Qwen license (uso comercial condicionado) | Benchmarks publicados, alineado, multilingüe amplio |
| Llama-3.2-3B-Instruct (GGUF) | 3,2 B | GGUF, safetensors | Llama 3.2 Community License | Benchmarks publicados, ecosistema maduro |
| Phi-3.5-mini-instruct (GGUF) | 3,8 B | GGUF, safetensors | MIT | Benchmarks publicados, buen rendimiento en razonamiento |

Nota: los alternativos citados son modelos de tamaño comparable con documentación y benchmarks públicos; frente a ellos, Spark-X2.6-4B-heretic carece de datos de rendimiento verificables, aunque destaca por su licencia permisiva y su naturaleza sin restricciones de alineado.

## Limitaciones y advertencias

- Al ser una variante abliterated/uncensored, el modelo puede generar contenido ofensivo, peligroso o inapropiado sin los rechazos habituales; su uso implica asumir plena responsabilidad legal y ética sobre las salidas.
- Riesgo de alucinación: no documentado específicamente, pero inherente a cualquier LLM; agravado por la ausencia de benchmarks que permitan calibrar la fiabilidad.
- No hay información sobre longitud de contexto, plantilla de chat (chat template) ni formato de prompt recomendado, lo que puede dificultar su integración correcta en runtimes.
- Soporte lingüístico limitado a inglés y chino según los metadatos; el rendimiento en castellano no está documentado y puede ser inferior.
- La cuantización degrada la calidad, especialmente en los niveles bajos (Q2_K, Q3_K_M); para mejor fidelidad se recomiendan Q6_K, Q8_0 o los quants imatrix del repositorio complementario.
- La licencia Apache 2.0 del quant no garantiza que el modelo base original no tenga condiciones adicionales; conviene verificar la ficha del modelo base daydreamwarrior/Spark-X2.6-4B-heretic antes de uso comercial.
- Es un modelo de comunidad con muy poca tracción (446 descargas, 0 likes en el momento de la ficha) y sin documentación técnica del modelo base, lo que eleva el riesgo de comportamientos inesperados en producción.

## Enlaces

- Repositorio GGUF estático: https://huggingface.co/mradermacher/Spark-X2.6-4B-heretic-GGUF
- Modelo base: https://huggingface.co/daydreamwarrior/Spark-X2.6-4B-heretic
- Cuants weighted/imatrix: https://huggingface.co/mradermacher/Spark-X2.6-4B-heretic-i1-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#Spark-X2.6-4B-heretic-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de quant: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
