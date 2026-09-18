# Jeesup/svd-safety-l3_remove50_swapgapiter_evfront_b010

## Resumen

El modelo `Jeesup/svd-safety-l3_remove50_swapgapiter_evfront_b010` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante SVD-LLM hasta el 50,0 % de los parámetros densos y posteriormente editado con 10 rondas iterativas de sustitución de parámetros neutra (regla de selección `gap_iter`, presupuesto total del 1,0 % de los parámetros densos). Lo publica el usuario Jeesup como artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. No es un modelo de chat de propósito general, sino una celda concreta de una malla experimental sobre reglas de selección y presupuestos.

El interés técnico del checkpoint reside en que cuantifica explícitamente el compromiso entre seguridad y utilidad tras la compresión: la model card reporta un ASR de 0,0404 en AdvBench, 0,0607 en StrongREJECT (ambos con juez HarmBench), un sobre-rechazo macro de 0,2962 medido con WildGuard y una perplejidad de 105,9803 en WikiText-2. El autor advierte de que algunas celdas de la malla están deliberadamente degradadas en seguridad, y que la compresión por sí sola eleva la tasa de éxito de ataque. El repositorio ocupa 16,1 GB y contiene pesos en safetensors compatibles con la librería `transformers`, sin cuantizaciones publicadas.

Se trata, por tanto, de un sujeto experimental para medir degradación y recuperación de comportamiento bajo compresión, no de un asistente desplegable. Su relevancia actual es doble: por un lado, aporta datos medidos sobre el coste de seguridad de la compresión de modelos; por otro, sirve como banco de pruebas reproducible (semilla 42, presupuesto explícito, contabilidad de componentes) para investigaciones de interpretabilidad y edición de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3, con compresión SVD-LLM aplicada sobre las proyecciones |
| Parametros totales | 8.030.261.248 según el recuento de safetensors; el autor declara una fracción de parámetros densos resultante de 0,4997 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens heredados de Llama-3-8B-Instruct; no se explicita en la model card |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors en 16 bits); convertible a GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | Meta Llama 3 Community License (`llama3`); se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | safetensors (librería `transformers`); repositorio de 16,1 GB, aproximadamente 2 bytes por parámetro |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-3-8B-Instruct: un transformer decoder-only con atención por causalidad, normalización RMSNorm y tokenizador de 128.256 entradas. Sobre ella se aplica SVD-LLM, un método de compresión que descompone en valores singulares las matrices de proyección y descarta componentes según su magnitud, eliminando el 50,03 % de los parámetros. El checkpoint resultante no se ha reentrenado desde cero ni se ha sometido a un nuevo ciclo de ajuste por instrucciones; es una edición estructural sobre los pesos del modelo base.

Sobre ese modelo comprimido se aplica un procedimiento de reparación en 10 rondas iterativas de sustitución de parámetros neutra, con la regla de selección `gap_iter` y un presupuesto de 0,1 % de parámetros densos por ronda hasta un total de 1,0 %. En el proceso se restauran 11.103 componentes y se expulsan 4.992, con 69.741.568 parámetros insertados (1,00 % de los parámetros de proyección densos) y un valor de sustitución de tipo `insert` con desalojo ordenado por sigma. La semilla es 42, lo que hace el experimento reproducible. No se documentan en la información disponible ni el número de tokens de entrenamiento ni la composición del dataset, porque no hay entrenamiento nuevo: la innovación técnica es el propio protocolo de compresión y reparación, no una receta de preentrenamiento.

## Capacidades

- Generación de texto conversacional básica, heredada de Llama-3-8B-Instruct, pero degradada por la compresión (perplejidad de 105,9803 en WikiText-2 frente a valores muy inferiores del modelo denso).
- Respuesta a instrucciones en formato chat, siempre que se aplique la plantilla de Llama 3.
- Comportamiento de rechazo ante peticiones dañinas: la model card reporta un ASR de 0,0404 en AdvBench y 0,0607 en StrongREJECT con juez HarmBench, medido sobre este checkpoint concreto.
- Tendencia al sobre-rechazo: 0,2962 de sobre-rechazo macro según WildGuard, es decir, rechaza peticiones benignas con frecuencia apreciable.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (el modelo base lo soportaba, pero la compresión puede alterarlo y no hay evaluación publicada).
- Soporte de agentes y razonamiento multi-paso: no disponible; no se han publicado evaluaciones específicas.
- Capacidades multilingües: no disponibles; la model card no declara idiomas ni se han publicado pruebas por idioma.
- Capacidades especiales (visión, audio, modo de razonamiento explícito): no disponibles; el repositorio no incluye adaptadores multimodales ni modos de pensamiento.

## Casos de uso

- Investigación sobre compresión de modelos: el checkpoint sirve como celda de referencia para medir cuánta capacidad y cuánta seguridad se pierden al eliminar el 50 % de los parámetros de proyección de un Llama 3 8B, con métricas ya registradas para comparar contra otras celdas de la misma malla.
- Evaluación de seguridad y red teaming comparado: los valores de ASR en AdvBench y StrongREJECT permiten contrastar el efecto de distintas reglas de selección de componentes sobre la tasa de éxito de ataques, usando siempre el mismo juez (HarmBench) para mantener la comparabilidad.
- Estudio del sobre-rechazo: el valor de 0,2962 con WildGuard es un punto de partida para analizar si la compresión y la reparación de parámetros desplazan el equilibrio entre utilidad y rechazo, y para calibrar clasificadores de moderación.
- Interpretabilidad de pesos y análisis de componentes: la contabilidad explícita de componentes restaurados (11.103) y expulsados (4.992) permite auditar qué proyecciones concretas afectan al comportamiento de seguridad, un caso de uso típico en estudios de localización de circuitos.
- Reproducción de experimentos con semilla fija: al estar fijada la semilla 42 y documentarse el presupuesto por ronda, el checkpoint es adecuado como sujeto reproducible en réplicas académicas de estudios de compresión.
- Construcción de conjuntos de datos de evaluación: las respuestas del modelo ante prompts benignos y adversarios pueden usarse para generar corpus etiquetados de sobre-rechazo y de fallos de seguridad en modelos comprimidos.
- Docencia e investigación sobre compromisos utilidad-seguridad: al estar deliberadamente degradado en algunas de sus variantes, es un ejemplo didáctico controlado de cómo una optimización de eficiencia puede erosionar salvaguardas.
- Conversación general en producción: no recomendado; el propio autor indica que cada celda debe tratarse como sujeto experimental y no como asistente desplegable.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de seguridad y perplejidad medidas por el autor:

| Metrica | Valor | Instrumento |
|---|---|---|
| AdvBench ASR | 0,0404 | juez HarmBench |
| StrongREJECT ASR | 0,0607 | juez HarmBench |
| Sobre-rechazo macro | 0,2962 | WildGuard |
| Perplejidad WikiText-2 | 105,9803 | evaluación estándar de perplejidad |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de capacidad en la información disponible, ni valores equivalentes para el modelo base que permitan calcular la degradación relativa.

## Requisitos de hardware

- VRAM en precisión de 16 bits: aproximadamente 16,1 GB solo de pesos, más en torno a 1 GB de caché KV a 8.192 tokens (32 capas, 8 cabezas KV, dimensión de cabeza 128), lo que sitúa el total práctico en 18-22 GB.
- VRAM en cuantización de 8 bits: aproximadamente 9-10 GB de pesos, factible en GPU de 16 GB.
- VRAM en cuantización de 4 bits: aproximadamente 5-6 GB de pesos, factible en GPU de 8-12 GB.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S 48 GB para servicio en 16 bits con lotes grandes; RTX 4090 o RTX 3090 (24 GB) para inferencia en 16 bits con lotes pequeños; RTX 4080 (16 GB) para 8 bits; RTX 3060 12 GB o RTX 4070 para 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 sin cuantizar, y en RTX 3060 12 GB o superiores con cuantización de 4 bits.
- Opciones de despliegue: `transformers` de forma nativa (formato safetensors); vLLM y Text Generation Inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`); llama.cpp u Ollama previa conversión a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Licencia | Metricas de seguridad | Disponibilidad |
|---|---|---|---|---|---|---|
| svd-safety-l3_remove50_swapgapiter_evfront_b010 | 8,03 x 10^9 segun safetensors; fraccion densa declarada 0,4997 | 8.192 tokens (heredado) | SVD-LLM al 50,03 % + 10 rondas de sustitucion (1,0 %) | Meta Llama 3 Community License | ASR AdvBench 0,0404; ASR StrongREJECT 0,0607; sobre-rechazo 0,2962; PPL WikiText-2 105,9803 | HuggingFace, safetensors, 0 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 x 10^9 | 8.192 tokens | ninguna | Meta Llama 3 Community License | no disponible en la informacion proporcionada | HuggingFace, safetensors y GGUF |
| Otras celdas de la malla del mismo estudio (otras reglas de seleccion y presupuestos) | no disponible | no disponible | SVD-LLM al 50 % con distintas reglas | Meta Llama 3 Community License | no disponible | HuggingFace, autor Jeesup |

No se dispone de datos de benchmarks comparativos entre este checkpoint y modelos de compresión alternativos (por ejemplo, variantes podadas con Wanda o SparseGPT) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe explícitamente como artefacto de investigación y advierte de que varias celdas de la malla están deliberadamente degradadas en seguridad.
- Riesgo de respuestas inseguras: aunque el ASR medido es bajo (0,0404 en AdvBench), la model card señala que la compresión por sí sola eleva la tasa de éxito de ataque, por lo que el comportamiento de seguridad no debe extrapolarse a otras entradas ni a otros dominios.
- Sobre-rechazo elevado: un valor de 0,2962 en WildGuard implica que el modelo rechaza con frecuencia peticiones benignas, lo que limita su utilidad conversacional.
- Calidad de lenguaje degradada: una perplejidad de 105,9803 en WikiText-2 es muy superior a la de un modelo denso de 8B, lo que anticipa incoherencias, repeticiones y errores factuales.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; la pérdida de parámetros y la elevada perplejidad son indicios razonables de mayor propensión a inventar contenido, aunque no hay una medición directa en la información disponible.
- Idiomas: no se declara ningún conjunto de idiomas soportados ni se han publicado evaluaciones multilingües, por lo que el rendimiento fuera del inglés es desconocido.
- Contexto limitado a 8.192 tokens si se hereda del modelo base; no se documenta en la model card ninguna extensión de ventana.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 valoraciones positivas en el momento de la consulta, por lo que no existe retroalimentación externa sobre su comportamiento real.
- Restricciones de licencia: se aplica la Meta Llama 3 Community License, con obligaciones de atribución ("Built with Meta Llama 3"), condiciones de uso aceptable recogidas en `USE_POLICY.md` y cláusulas específicas para despliegues a gran escala; conviene revisar el texto completo antes de cualquier uso comercial.
- Adecuación para producción: no recomendado; el propio autor pide evaluar cada celda de forma independiente antes de extraer conclusiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove50_swapgapiter_evfront_b010
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia y política de uso: archivos `LICENSE` y `USE_POLICY.md` incluidos en el repositorio del modelo
- Paper de SVD-LLM, blog del autor, repositorio de código y demos: no disponible en la información proporcionada
- Nota: la búsqueda web asociada a esta ficha no devolvió resultados relevantes sobre el modelo (únicamente páginas de soporte técnico genéricas sin relación con el checkpoint)
