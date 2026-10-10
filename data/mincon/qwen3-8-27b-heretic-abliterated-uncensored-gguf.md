# mincon/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Heretic-Abliterated-Uncensored (denominado RVN por su autor) es una variante abliterada del modelo Qwen3.8-27B, publicada por el usuario mincon en HuggingFace en formato GGUF para llama.cpp. El modelo parte de una abliteración previa realizada por trohrbaugh con la técnica ARA (Arbitrary-Rank Ablation) del proyecto heretic y aplica dos pasadas adicionales de pesos completos para eliminar los rechazos residuales.

Conserva la arquitectura original de la familia Qwen3.8, un híbrido Gated DeltaNet con 64 capas (16 de atención estándar y 48 de atención lineal DeltaNet), 26.895.998.464 parámetros (aproximadamente 27B), hidden size 5120, 24 cabezas de atención con 4 cabezas KV (GQA), head_dim 256 y un vocabulario de 248.320 tokens. La ventana de contexto es de 262.144 tokens y la licencia Apache-2.0 se mantiene desde el modelo base.

Su relevancia es doble. Por un lado, documenta con métricas concretas el efecto de las pasadas sucesivas de ARA: los rechazos bajan de 3/100 en el modelo fuente a 0-1/100, con una divergencia KL de 0,0085 frente a 0,0535 del origen. Por otro, distribuye la arquitectura híbrida de Qwen3.8 en cuantizaciones GGUF con imatrix, incluidas variantes con el cabezal MTP oficial para decodificación especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (familia Qwen3.8), híbrido Gated DeltaNet: 64 capas (16 de atención estándar + 48 de atención lineal DeltaNet) |
| Parámetros totales | 26.895.998.464 (aprox. 27B) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantización | GGUF con imatrix; se menciona Q4_K_M y 53 rutas GGUF RVN heredadas, además de la familia `*-multilingual*.gguf` y variantes `*-mtp.gguf` |
| Idiomas soportados | no disponible (la model card menciona artefactos "multilingual", pero no enumera idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); los tags del repositorio incluyen también safetensors y transformers |
| Hidden size | 5120 |
| Cabezas de atención | 24 cabezas, 4 cabezas KV (GQA), head_dim 256 |
| Vocabulario | 248.320 |
| Modelo base | Qwen/Qwen3.8-27B |
| Fuente de la abliteración | trohrbaugh/Qwen3.8-27B-heretic-ara |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es una modificación de pesos sobre Qwen3.8-27B. La arquitectura es un transformer híbrido en el que 48 de las 64 capas utilizan atención lineal Gated DeltaNet y solo 16 emplean atención estándar con GQA. Esa proporción reduce el coste de la caché KV en contextos largos, ya que el estado de las capas DeltaNet es de tamaño fijo. Los ficheros base excluyen el cabezal MTP/NextN, que se distribuye por separado en los ficheros `*-mtp.gguf` como cabezal borrador oficial de Qwen3.8 para decodificación especulativa. Todos los artefactos incrustan la plantilla de chat oficial de Qwen3.8 y pasaron una verificación por fichero de tool calling y control de thinking compatible con la API de OpenAI.

La abliteración se realizó con ARA (Arbitrary-Rank Ablation), implementada en heretic. En lugar de restar una única dirección de rechazo en el espacio de activaciones, ARA formula el problema como una optimización matricial: recoge activaciones sobre prompts "buenos" (inofensivos) y "malos" (dañinos) y usa un optimizador LBFGS para reescribir las matrices de pesos de los módulos objetivo (out-projection de atención y down-projection del MLP). El objetivo combina tres términos: preservar las salidas ante prompts buenos (minimizar KL), dirigir las salidas ante prompts malos hacia la variedad de salidas buenas mediante distancias k-NN, y empujar adicionalmente esas salidas lejos de las originales para superar mecanismos de rechazo multietapa. El proceso se aplicó tres veces en total: una por trohrbaugh (base a `-ara`, KL 0,0535, rechazos 3/100) y dos adicionales por mincon con el mismo conjunto de parámetros (start 26, end 56, preserve 0,9432, steer 0,0009, overcorrect 0,5038, neighbor 10), hasta KL 0,0085 y 0-1 rechazos por cada 100. No se detalla composición de dataset de entrenamiento ni uso de RLHF o DPO, porque no hay entrenamiento nuevo: no disponible.

## Capacidades

- Generación de texto conversacional y de formato largo en el mismo idioma y registro que el modelo base, sin las restricciones de rechazo eliminadas.
- Escritura creativa y roleplay orientados a público adulto, que es el caso de uso declarado por el autor.
- Tool calling: los artefactos pasaron una prueba de llamada a herramientas compatible con la API de OpenAI, con la plantilla de chat oficial embebida.
- Control de thinking: la plantilla permite activar o desactivar el modo de razonamiento explícito.
- Contexto largo de hasta 262.144 tokens, útil para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificación especulativa mediante el cabezal MTP oficial en las variantes `*-mtp.gguf`.
- Soporte multilingüe: se distribuye una familia de artefactos etiquetada como multilingual, pero la lista concreta de idiomas no está disponible.
- Visión y audio: no disponible (la model card no menciona capacidades multimodales).
- Razonamiento, matemáticas y generación de código: no se documentan resultados específicos para esta variante; se heredan, en principio, las capacidades del modelo base, pero no están verificadas en la información proporcionada.

## Casos de uso

- Roleplay y narrativa interactiva para adultos: el modelo está ajustado explícitamente para este escenario y mantiene coherencia en conversaciones largas gracias a los 262.144 tokens de contexto y a las capas DeltaNet, que abaratan el coste de memoria por token.
- Investigación en seguridad y alineación: sirve como sujeto de estudio para medir qué comportamientos sobreviven a tres pasadas de ARA y qué se degrada, con métricas publicadas de KL y tasa de rechazo que permiten replicar la comparación.
- Red teaming y evaluación de guardarraíles: al reducir los rechazos a 0-1 por cada 100 prompts dañinos, permite comprobar la robustez de filtros externos y de clasificadores de contenido en un entorno controlado.
- Despliegue local en estación de trabajo: al distribuirse en GGUF, se ejecuta con llama.cpp u Ollama en una GPU de consumo con 24 GB de VRAM en cuantizaciones Q4, sin necesidad de infraestructura en la nube.
- Procesamiento de documentos extensos: análisis, resumen y extracción de información sobre contratos, expedientes o corpus de cientos de miles de tokens en una sola ventana, con la caché KV reducida por el uso mayoritario de atención lineal.
- Pipelines de agentes con tool calling: la compatibilidad verificada con la API de OpenAI y el control de thinking permiten integrarlo como backend en orquestadores de agentes, siempre que el caso de uso no requiera guardarraíles del proveedor original.
- Generación de contenido editorial sin filtros temáticos: artículos, guiones o material de ficción sobre temas que el modelo base rechazaría, con revisión humana obligatoria antes de publicación por responsabilidad legal.
- Comparativa de técnicas de abliteración: al existir el modelo intermedio (`-ara`) y el refinado (RVN) sobre la misma base, permite aislar el efecto de pasadas adicionales de ARA con parámetros idénticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas corresponden al proceso de abliteración:

| Modelo | Rechazos ante prompts dañinos | Divergencia KL |
|---|---|---|
| trohrbaugh/Qwen3.8-27B-heretic-ara (1 pasada ARA) | 3/100 | 0,0535 |
| mincon Qwen3.8-27B RVN (3 pasadas ARA) | 0-1/100 | 0,0085 |
| Qwen/Qwen3.8-27B (base, sin abliterar) | no disponible | no disponible (referencia) |

El autor indica que los tres prompts que seguían disparando rechazos en el modelo fuente eran los relativos a una web de racismo, malware y hacking de bases de datos gubernamentales, y que el único rechazo residual en RVN corresponde a uno de ellos (el texto de la model card se corta en ese punto).

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del número de parámetros (27B) y del tamaño de la caché KV calculado a partir de las especificaciones publicadas; no son datos medidos ni publicados por el autor.

- VRAM para los pesos, en estimación: Q4_K_M en torno a 16-18 GB; Q5_K_M en torno a 19-21 GB; Q6_K en torno a 23-24 GB; Q8_0 en torno a 28-30 GB; FP16 en torno a 54 GB.
- Caché KV: con 16 capas de atención, 4 cabezas KV y head_dim 256, cada token consume 2 × 4 × 256 = 2048 valores por capa, unos 4 KiB por capa y token en FP16, es decir, 64 KiB por token sumando las 16 capas de atención. A contexto completo de 262.144 tokens esto supone aproximadamente 16 GiB adicionales, a los que hay que sumar el estado fijo de las 48 capas DeltaNet.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar las cuantizaciones Q4_K_M y Q5_K_M con contexto moderado; para contexto completo conviene cuantizar la caché o repartir capas entre CPU y GPU.
- GPU profesionales: A100 de 40 GB o 80 GB, H100 de 80 GB y tarjetas de 48 GB (L40S, A6000 Ada) permiten Q6_K o Q8_0 con contextos largos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y llama-cpp-python son las vías naturales al tratarse de GGUF. En el ecosistema de servidores, vLLM y TGI tienen soporte de GGUF limitado o experimental, por lo que lo habitual es servir con llama.cpp o con un wrapper compatible con la API de OpenAI.
- Decodificación especulativa: las variantes `*-mtp.gguf` incluyen el cabezal MTP oficial, que acelera la generación al permitir verificar varios tokens por paso, aunque no se publican cifras de latencia ni de throughput.
- Latencia y throughput medidos: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Abliteración | Rechazos | KL | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| mincon Qwen3.8-27B RVN (este modelo) | 27B | 262.144 | ARA, 3 pasadas | 0-1/100 | 0,0085 | Apache-2.0 | GGUF (imatrix, MTP opcional) |
| trohrbaugh/Qwen3.8-27B-heretic-ara | 27B | no disponible en la información | ARA, 1 pasada | 3/100 | 0,0535 | Apache-2.0 | no disponible |
| Qwen/Qwen3.8-27B (base) | 27B | 262.144 (heredado) | ninguna | no disponible | referencia | Apache-2.0 | safetensors |
| trohrbaugh/Qwen3.8-27B-heretic (versión anterior, fichero legacy en este repo) | 27B | no disponible | ARA, versión previa | no disponible | no disponible | Apache-2.0 | GGUF (Q4_K_M) |

No se proporcionan en la información disponible otros modelos comparables de 27B abliterados de otras familias, por lo que la comparación se limita a las variantes derivadas del mismo modelo base.

## Limitaciones y advertencias

- Guardarraíles reducidos por diseño: el modelo responde a categorías de peticiones que el base rechazaría. El autor lo restringe a público adulto (18+) y a usos de investigación, escritura creativa y roleplay.
- Riesgo legal: la responsabilidad del uso recae en el operador. El propio autor advierte de que se respeten las leyes locales y que algunas barreras se han dejado intactas de forma intencionada.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad, MMLU, HumanEval ni GSM8K para esta variante, por lo que no hay evidencia de que las capacidades factuales del base se conserven intactas tras tres pasadas de ARA.
- Daño conductual: la KL de 0,0085 es baja en términos comparativos, pero no nula; implica que la distribución de salidas difiere de la del modelo original y puede afectar a comportamientos no relacionados con el rechazo.
- Idiomas: la lista de idiomas soportados no está disponible, pese a que se distribuyen artefactos etiquetados como multilingües.
- Contexto: la ventana de 262.144 tokens es teórica; no se aportan pruebas de rendimiento en el extremo de esa longitud y la caché KV resultante exige hardware considerable.
- Repositorio con histórico mixto: conviven ficheros RVN nuevos y un fichero `Q4_K_M` legacy del repositorio anterior. El autor recomienda usar los RVN para despliegues nuevos, pero es un punto de confusión al descargar.
- Validación externa nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, con fecha de creación y actualización idénticas (2026-10-09). No hay evidencia de uso en producción ni de reproducción independiente de las métricas de rechazo.
- Tamaño del repositorio: 1645,3 GB, lo que obliga a descargar ficheros individuales en lugar del repositorio completo.
- Uso comercial: la licencia Apache-2.0 lo permite, pero la ausencia de evaluaciones de sesgo y de calidad en tareas estándar dificulta justificar su adopción en entornos regulados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mincon/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente de la abliteración (ARA, 1 pasada): https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Abliteración previa del mismo autor citada como legacy: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic
- Implementación de ARA y de las técnicas de abliteración: https://github.com/p-e-w/heretic
- Paper, blog o demo específicos de esta variante: no disponible
