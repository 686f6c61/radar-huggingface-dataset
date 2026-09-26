# MissingPackage/Qwen3.5-0.8B-knapquant-GGUF

## Resumen

`MissingPackage/Qwen3.5-0.8B-knapquant-GGUF` es un repositorio de cuantizaciones GGUF de precisión mixta del modelo base `Qwen/Qwen3.5-0.8B` (752.393.024 parámetros, aproximadamente 0,75 B), publicado por el usuario MissingPackage. No introduce pesos nuevos ni un entrenamiento propio: reempaqueta el modelo original de Qwen en ficheros GGUF listos para llama.cpp, Ollama o LM Studio.

El problema que aborda es la asignación óptima del presupuesto de bits por tensor. En lugar de aplicar un tipo de cuantización uniforme, el autor cuantiza cada tensor en todos los tipos disponibles (de IQ2_XXS a Q8_0) usando la importance matrix de Unsloth, convierte el error de cada opción en un KL predicho mediante coeficientes por tipo de tensor y resuelve un problema de mochila exacto (knapsack) bajo un presupuesto de bytes. Después refina los pesos de la FFN en su propio formato GGUF con GSQ, manteniendo el mismo tamaño de fichero.

El resultado son tres ficheros de 338 MB, 417 MB y 492 MB que ocupan exactamente lo mismo que los ficheros Unsloth Dynamic de tamaños equivalentes, pero con un KL de divergencia claramente inferior en el rango bajo (0,190 frente a 1,171 en el fichero más pequeño). Es relevante para despliegues en el borde y en hardware muy limitado, donde la diferencia entre un modelo de 338 MB que degrada y uno que conserva GSM8K a 28,2 puntos frente a 0,2 es determinante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo documenta la cuantización; el modelo base es `Qwen/Qwen3.5-0.8B`) |
| Parámetros totales | 752.393.024 (0,75 B aproximadamente) |
| Longitud de contexto | 32.768 tokens en el ejemplo de uso documentado (`llama-server -c 32768`); el máximo del modelo base no se especifica |
| Tipos de cuantización | GGUF de precisión mixta por tensor, con tipos entre IQ2_XXS y Q8_0; ficheros publicados a 3,60 bpw, 4,44 bpw y 5,23 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen3.5-0.8B) |
| Formato de pesos | GGUF (compatible con llama.cpp) |
| Tamaño del repositorio | 1,2 GB |
| Variantes publicadas | `Qwen3.5-0.8B-knapquant-3.5bpw.gguf` (338 MB, 3,60 bpw), `Qwen3.5-0.8B-knapquant-4.4bpw.gguf` (417 MB, 4,44 bpw), `Qwen3.5-0.8B-knapquant-5.2bpw.gguf` (492 MB, 5,23 bpw) |
| Variante recomendada | `Qwen3.5-0.8B-knapquant-5.2bpw.gguf` |
| Modo thinking | desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}` |
| Modalidad | solo texto (sin proyector de visión) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo; parte de los pesos de `Qwen/Qwen3.5-0.8B` y produce cuantizaciones GGUF. La model card no describe la arquitectura del modelo base (número de capas, cabezas de atención, tipo de atención ni composición del dataset de preentrenamiento), por lo que esos datos no están disponibles en la información consultada.

La innovación técnica está en el método de cuantización, implementado en `github.com/MissingPackage/knapquant`. Cada tensor se cuantiza con todos los tipos soportados (IQ2_XXS a Q8_0) empleando la importance matrix de Unsloth; un coeficiente por tipo de tensor transforma el error de cuantización en un KL predicho; a continuación, un algoritmo de mochila exacto elige un único tipo por tensor bajo el presupuesto de bytes objetivo. En una segunda fase, los pesos de la FFN se refinan in situ en formato GGUF mediante GSQ (el mismo enfoque que GSQ-RCO de ISTA-DASLab), sin modificar el tamaño del fichero. Los mapas de tipos resultantes se publican en `type-maps/`. Las evaluaciones de KL se realizaron con la build `6c84c7d` de llama.cpp, sobre wikitext-2 test con 240 fragmentos de 512 tokens (`llama-perplexity --kl-divergence`). No consta uso de RLHF ni DPO en este repositorio, ya que no hay ajuste fino posterior a la cuantización.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el `pipeline_tag: text-generation` confirman el uso previsto para diálogo y generación libre.
- Razonamiento aritmético básico: en el fichero recomendado (5,2 bpw) obtiene 49,2 puntos en las 500 primeras preguntas de GSM8K con thinking desactivado, frente a 54,6 del modelo en bf16.
- Modo thinking opcional: el razonamiento extendido se activa por petición mediante `chat_template_kwargs: {"enable_thinking": true}`; por defecto está desactivado.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse en infraestructuras de inferencia compatibles con GGUF.
- Despliegue en el borde: los ficheros de 338 MB a 492 MB están pensados explícitamente para dispositivos con recursos limitados (etiqueta `edge`).
- Capacidades multilingües: no documentadas en la model card; dependen del modelo base y no se declaran idiomas.
- Tool calling / function calling: no documentado en la información disponible.
- Agentes y razonamiento multi-paso: no documentado específicamente, más allá del modo thinking.
- Visión y audio: no soportados; la model card indica explícitamente "Text only: no vision projector".

## Casos de uso

- Asistentes conversacionales embebidos en dispositivos: con ficheros de 338 a 492 MB y el ejemplo `llama-server -m ... -ngl 99 -c 32768`, el modelo cabe en teléfonos, Raspberry Pi o mini-PC sin GPU dedicada y permite mantener conversaciones multi-turno con una ventana de hasta 32.768 tokens.
- Inferencia en el borde sin conectividad: al ser GGUF y funcionar con llama.cpp en CPU, es adecuado para aplicaciones de campo, kioscos o entornos industriales aislados donde no hay acceso a APIs en la nube.
- Clasificación y resumen de texto en local: el fichero de 4,4 bpw mantiene 45,2 puntos de media en las cinco tareas evaluadas (HellaSwag, Winogrande, ARC easy, ARC challenge, MMLU), suficiente para tareas de etiquetado y resumen sobre textos cortos con coste computacional mínimo.
- Prototipado rápido de aplicaciones LLM: el fichero de 5,2 bpw se descarga y arranca en segundos (`hf download` más `llama-server`), lo que reduce el ciclo de iteración en desarrollo frente a modelos de mayor tamaño.
- Investigación sobre cuantización: los mapas de tipos en `type-maps/` y el código de knapquant permiten reproducir y comparar la asignación por tensor frente a esquemas uniformes o Unsloth Dynamic del mismo tamaño.
- Preprocesado de prompts en pipelines de agentes: por su bajo consumo, puede actuar como modelo auxiliar que normaliza, reescribe o filtra consultas antes de enviarlas a un modelo mayor, reduciendo el coste por token en el modelo principal.
- Generación de código asistida en entornos con recursos mínimos: hereda la capacidad del modelo base para completar código, aunque no hay benchmarks de HumanEval publicados en este repositorio para cuantificar la degradación.
- Evaluación comparativa de esquemas de compresión: los datos de KL y GSM8K publicados permiten usar el repositorio como referencia a la hora de decidir entre precisión y tamaño en despliegues reales.

## Benchmarks y rendimiento

La model card publica resultados comparando cada fichero knapquant con el fichero público Unsloth del mismo tamaño (formato "knapquant / mismo tamaño Unsloth"). La media de 5 tareas agrega HellaSwag, Winogrande, ARC easy, ARC challenge y MMLU. GSM8K usa las primeras 500 preguntas del conjunto de test, con thinking desactivado, temperature 0,7, top_p 0,8, top_k 20, presence penalty 1,5 y un límite de 4.096 tokens.

| Fichero | Tamaño | bpw | KL vs bf16 (menor es mejor) | Media 5 tareas | GSM8K |
|---|---|---|---|---|---|
| bf16 (referencia) | no disponible | no disponible | 0 | 45,8 | 54,6 |
| knapquant 3.5bpw / Unsloth UD-IQ2_XXS | 338 MB | 3,60 | 0,190 / 1,171 | 42,6 / 35,9 | 28,2 / 0,2 |
| knapquant 4.4bpw / Unsloth UD-Q2_K_XL | 417 MB | 4,44 | 0,054 / 0,355 | 45,2 / 40,5 | 46,6 / 3,0 |
| knapquant 5.2bpw / Unsloth UD-Q3_K_XL | 492 MB | 5,23 | 0,026 / 0,080 | 44,7 / 44,3 | 49,2 / 38,8 |

La model card señala que los dos ficheros Unsloth de menor tamaño entran en bucle (388 y 206 de 500 generaciones respectivamente), lo que explica los valores anómalos de 0,2 y 3,0 en GSM8K. No se han publicado resultados de MMLU desagregado, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM para los pesos: entre 338 MB (3,5 bpw) y 492 MB (5,2 bpw) de pesos, más el overhead del runtime de llama.cpp; en la práctica, el modelo completo se sirve con menos de 1 GB de memoria para contextos cortos.
- Caché KV: el tamaño a 32.768 tokens depende del número de capas y cabezas del modelo base, dato no documentado en este repositorio. Con contextos largos es previsible que la caché supere el tamaño de los propios pesos.
- GPU recomendadas: no se requiere ninguna GPU dedicada. Con `-ngl 99` se descargan todas las capas a GPU, por lo que basta con cualquier GPU con 2 GB o más de VRAM (por ejemplo, GTX 1050, RTX 3050 o iGPU con memoria compartida). Aceleradores como A100 o H100 son innecesarios y quedan sobredimensionados para 0,75 B de parámetros.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual y también en GPU integradas; funciona igualmente en modo CPU puro.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-quantize`), Ollama, LM Studio y cualquier runtime compatible con GGUF. El repositorio está etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles. No se publican medidas de tokens por segundo ni de latencia en la información consultada.
- Ejemplo de arranque documentado: `llama-server -m Qwen3.5-0.8B-knapquant-5.2bpw.gguf -ngl 99 -c 32768`.

## Comparativa con modelos similares

La comparación más directa la ofrecen los propios ficheros de referencia del mismo tamaño publicados por Unsloth, ya que el objetivo declarado del autor es igualar su tamaño con mejor calidad de cuantización. No se dispone de datos de otros modelos de 0,8 B en la información proporcionada.

| Alternativa | Tamaño | KL vs bf16 | Media 5 tareas | GSM8K | Notas |
|---|---|---|---|---|---|
| knapquant 5.2bpw (recomendado) | 492 MB | 0,026 | 44,7 | 49,2 | Tipo por tensor elegido por knapsack + refinado GSQ en la FFN |
| Unsloth UD-Q3_K_XL | 492 MB | 0,080 | 44,3 | 38,8 | Mismo tamaño exacto; peor KL y GSM8K que knapquant |
| knapquant 4.4bpw | 417 MB | 0,054 | 45,2 | 46,6 | Mismo tamaño que Unsloth UD-Q2_K_XL |
| Unsloth UD-Q2_K_XL | 417 MB | 0,355 | 40,5 | 3,0 | El fichero entra en bucle en 206 de 500 generaciones |
| knapquant 3.5bpw | 338 MB | 0,190 | 42,6 | 28,2 | Mismo tamaño que Unsloth UD-IQ2_XXS |
| Unsloth UD-IQ2_XXS | 338 MB | 1,171 | 35,9 | 0,2 | El fichero entra en bucle en 388 de 500 generaciones |
| Qwen3.5-0.8B bf16 | no disponible | 0 | 45,8 | 54,6 | Referencia sin cuantizar del modelo base |
| Qwen3.5-4B-knapquant-GGUF | no disponible | no disponible | no disponible | no disponible | Variante mayor de la misma familia, publicada por el mismo autor |

## Limitaciones y advertencias

- Modelo pequeño: con 0,75 B de parámetros, la capacidad de razonamiento y de conocimiento factual es limitada; degrada en tareas que exigen contexto amplio o múltiples pasos de razonamiento.
- Degradación por cuantización: incluso el fichero recomendado baja de 54,6 a 49,2 en GSM8K respecto a bf16. Los ficheros de 3,5 y 4,4 bpw pierden bastante más (28,2 y 46,6 respectivamente).
- Riesgo de bucles degenerativos: los ficheros equivalentes de Unsloth del mismo tamaño entran en bucle en un porcentaje elevado de generaciones de GSM8K; conviene verificar el comportamiento del fichero elegido con muestreos largos antes de llevarlo a producción.
- Alucinación: no se publican tasas de alucinación ni evaluaciones de veracidad; al ser un modelo de 0,75 B, la probabilidad de inventar hechos es alta en dominios especializados.
- Idioma: no se declaran idiomas soportados. La calidad fuera del inglés y del chino no está documentada y debería validarse empíricamente antes de usarlo en producción en castellano.
- Solo texto: no hay proyector de visión ni capacidades multimodales.
- Thinking desactivado por defecto: si la aplicación necesita razonamiento extendido, hay que activarlo explícitamente con `chat_template_kwargs`, con el coste de latencia asociado.
- Estado del repositorio: creado el 26 de septiembre de 2026, sin descargas ni valoraciones en el momento de la consulta; es una cuantización de la comunidad sin validación externa amplia.
- Licencia: Apache 2.0 heredada de Qwen3.5-0.8B, que permite uso comercial, pero conviene revisar la licencia del modelo base enlazada por el autor, ya que es la que rige sobre los pesos originales. La importance matrix empleada pertenece a Unsloth.
- Reproducibilidad: las evaluaciones se hicieron con una build concreta de llama.cpp (`6c84c7d`); los resultados pueden variar con otras versiones del runtime.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MissingPackage/Qwen3.5-0.8B-knapquant-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Variante de 4B de la misma familia: https://huggingface.co/MissingPackage/Qwen3.5-4B-knapquant-GGUF
- Código del método knapquant: https://github.com/MissingPackage/knapquant
- Mapas de tipos por tensor: carpeta `type-maps/` dentro del repositorio de HuggingFace
