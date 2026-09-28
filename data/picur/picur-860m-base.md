# picur/picur-860M-base

## Resumen

picur-860M-base es un modelo de generación de texto de tipo base (sin ajuste por instrucciones) desarrollado por el usuario picur y publicado en HuggingFace bajo licencia Apache 2.0. Cuenta con 856.662.144 parámetros reales según los pesos en safetensors (aproximadamente 860M, como indica su nombre), lo que lo sitúa en la categoría de modelos pequeños, aptos para despliegue en hardware de consumo. El repositorio ocupa 1,7 GB y está etiquetado con la librería transformers y el pipeline text-generation.

El modelo está especializado en húngaro (magyar): es su único idioma declarado en la model card y en las etiquetas de HuggingFace. La etiqueta lfm2 indica que se apoya en la familia de arquitecturas LFM2, asociada a modelos híbridos de convoluciones y atención, aunque el autor no detalla en la información disponible la configuración interna concreta, el número de tokens de entrenamiento ni la composición del dataset.

La relevancia de esta ficha es limitada pero clara: se trata de una publicación marcada explícitamente como PREVIEW, con cero descargas y cero likes en el momento de la consulta, y sin datos de entrenamiento ni benchmarks publicados. Es, por tanto, un punto de partida experimental para quien necesite un modelo base monolingüe en húngaro de tamaño reducido, no un modelo listo para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (segun la etiqueta `lfm2` del repositorio); detalles internos no disponibles |
| Parametros totales | 856.662.144 (dato real de safetensors) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors |
| Idiomas soportados | Hungaro (hu, magyar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento. La única pista técnica es la etiqueta `lfm2`, que vincula el modelo a la familia de arquitecturas LFM2, caracterizada por combinar bloques convolucionales de corto alcance con mecanismos de atención, un diseño orientado a reducir el coste computacional en inferencia respecto a un transformer denso de tamaño equivalente. No obstante, no hay confirmación por parte del autor de que se trate de esa configuración exacta ni de detalles como el número de capas, las dimensiones ocultas o el tipo de normalización.

Tampoco se especifica el volumen de tokens de entrenamiento, la composición del corpus, si hubo fases de ajuste por instrucciones, RLHF o DPO, ni si se aplicaron técnicas de destilación. La etiqueta `base` y la ausencia de plantilla de chat en el ejemplo de uso confirman que se trata de un modelo de continuación de texto sin alineación conversacional. El snippet publicado por el autor muestra únicamente inferencia con `AutoModelForCausalLM` y `AutoTokenizer` en `bfloat16` con `device_map="auto"`, sin parámetros adicionales de generación más allá de `temperature=0.7` y `max_new_tokens=100`.

## Capacidades

- Generación de texto por continuación de prompt en húngaro, orientada a tareas de completado y redacción libre.
- Modelo base sin ajuste instruccional: no está entrenado para seguir órdenes ni para mantener un formato de diálogo.
- Capacidad multilingüe limitada al húngaro declarado; no se documentan otros idiomas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o modo de razonamiento explícito (thinking): no disponibles.
- Ejecución en `bfloat16` con `transformers`, con carga automática por dispositivo (`device_map="auto"`).

## Casos de uso

- Generación de texto editorial en húngaro: el modelo puede completar párrafos y borradores partiendo de un prompt, útil como asistente de redacción para medios o creadores que trabajen en ese idioma y quieran revisar el resultado antes de publicar.
- Autocompletado en herramientas de escritura: integrado como motor de continuación en editores de texto en húngaro, con la salvedad de que al ser un modelo base requiere control de temperatura y filtrado posterior.
- Punto de partida para fine-tuning supervisado en húngaro: al ser un modelo de 856M parámetros con licencia Apache 2.0, puede ajustarse con LoRA en una única GPU de consumo para dominios concretos (legal, médico, atención al cliente).
- Generación de datos sintéticos en húngaro: puede utilizarse para aumentar corpus escasos en ese idioma, siempre que se valide y filtre la calidad de las muestras generadas.
- Investigación sobre modelos monolingües pequeños: sirve como referencia para estudiar el equilibrio entre tamaño, coste de inferencia y calidad en idiomas de bajos recursos como el húngaro.
- Despliegue en hardware limitado o en local: con 856M parámetros, es viable ejecutarlo en portátiles con GPU modesta o incluso en CPU para tareas por lotes sin requisitos de latencia estrictos.
- Prototipado rápido de aplicaciones de generación de texto: permite validar una idea de producto en húngaro antes de invertir en un modelo mayor o en APIs comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y la búsqueda web no ha devuelto documentación técnica asociada al modelo (los resultados obtenidos corresponden a productos sin relación: un suplemento comercial, un registro clínico francés de cuidados intensivos pediátricos, una marca de congelados y una web de pronósticos hípicos).

## Requisitos de hardware

- VRAM estimada en `bfloat16` o `float16`: aproximadamente 1,7 GB solo para los pesos, más el caché KV y las activaciones; en la práctica, entre 2,5 y 4 GB según la longitud de secuencia.
- VRAM estimada en `float32`: en torno a 3,4 GB para los pesos, con margen adicional para activaciones.
- Cuantización a 8 bits: aproximadamente 0,9 GB de pesos. A 4 bits: alrededor de 0,45 GB. No obstante, el autor no publica versiones GGUF, AWQ ni GPTQ, por lo que habría que generarlas localmente.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más (RTX 3060, RTX 4060, RTX 2070) es suficiente; también funciona en GPUs de 6 GB ajustando la longitud de contexto. En el extremo profesional, cabe holgadamente en A100, H100, L40S o T4.
- Cabe en GPU de consumo: sí, en prácticamente cualquier modelo con 6-8 GB de VRAM, e incluso en CPU con `transformers` para inferencia no interactiva.
- Opciones de despliegue: `transformers` de forma nativa; es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, y a formatos de servidores de inferencia como vLLM o TGI si la arquitectura LFM2 está soportada por esas herramientas (no confirmado en la información disponible).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| picur-860M-base | 856M | No disponible | Hungaro | Apache 2.0 | HuggingFace (preview, 0 descargas) |
| LFM2-1.2B (Liquid AI) | 1,2B | No disponible en esta busqueda | Multilingue | LFM Open License | HuggingFace |
| Qwen2.5-1.5B | 1,5B | No disponible en esta busqueda | Multilingue (incluye es, en, zh) | Apache 2.0 | HuggingFace |
| SmolLM2-1.7B | 1,7B | No disponible en esta busqueda | Principalmente ingles | Apache 2.0 | HuggingFace |

Nota: los datos de las alternativas corresponden a información pública general de cada familia y no se han verificado contra las model cards en esta busqueda; deben confirmarse antes de tomar decisiones. La ventaja diferencial de picur-860M-base es su licencia Apache 2.0 y su tamaño reducido; su desventaja principal es la ausencia total de documentación, evaluación y ecosistema frente a modelos como Qwen2.5 o SmolLM2, que cuentan con versiones instruct, cuantizaciones publicadas y soporte amplio en herramientas de despliegue.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones, no mantiene roles de conversación y puede generar continuaciones incoherentes o no deseadas si no se controla el prompt.
- Sin benchmarks publicados: no existe ninguna evidencia cuantitativa de calidad, por lo que cualquier uso en producción exige una evaluación propia previa.
- Riesgo de alucinación: al ser un modelo de lenguaje generativo de 856M parámetros y sin datos de entrenamiento conocidos, la probabilidad de afirmaciones factualmente falsas es alta, especialmente en dominios especializados.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos de género, etnia, religión o ideología presentes en los pesos.
- Limitación idiomática estricta: el modelo está declarado únicamente para húngaro; su comportamiento en castellano u otros idiomas es impredecible y no está soportado.
- Longitud de contexto no documentada: se desconoce el máximo de tokens de entrada, lo que impide planificar tareas de contexto largo con garantías.
- Estado de publicación: el propio autor lo etiqueta como PREVIEW, con cero descargas y sin actualizaciones documentadas más allá de la fecha de subida, lo que sugiere un trabajo en curso sin soporte garantizado.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios; no incluye garantías de ningún tipo.
- Ausencia de versiones cuantizadas oficiales: quien quiera ejecutarlo en formatos GGUF o de 4 bits deberá convertir los pesos por su cuenta y validar la degradación resultante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/picur/picur-860M-base
- Paper, blog o repositorio del autor: no disponible en la informacion proporcionada.
- Demo o espacio asociado: no disponible.
- Documentacion sobre la familia LFM2 (referencia por la etiqueta del repositorio): no disponible en los resultados de busqueda.
- Nota: los resultados de la busqueda web (theglobaleader.com, gfrup.sfpediatrie.com, picard.fr, iturf.fr) no guardan relacion con el modelo y se descartan como fuentes.
