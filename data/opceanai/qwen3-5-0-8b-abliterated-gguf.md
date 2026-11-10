# OpceanAI/Qwen3.5-0.8B-abliterated-GGUF

## Resumen

Qwen3.5-0.8B-abliterated-GGUF es un conjunto de pesos cuantizados en formato GGUF del checkpoint abliterado OpceanAI/Qwen3.5-0.8B-abliterated, publicado por OpceanAI. El modelo base es un transformer de la familia Qwen3.5 con aproximadamente 772,8 millones de parametros reales (el autor indica 873M en la model card), derivado de un proceso de abliteration: una tecnica de edicion de pesos que elimina la direccion de rechazo en el espacio de activaciones para reducir las negativas del modelo a responder, sin reentrenamiento adicional.

El repositorio ofrece quince ficheros GGUF que cubren desde BF16 (1,56 GB) hasta cuantizaciones ternarias TQ1_0 (0,33 GB), pasando por Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M, Q3_K_M, IQ3_XXS, IQ2_M, IQ2_XXS, Q2_K, TQ2_0 y TQ1_0. La aportacion principal no es el modelo en si, sino la evaluacion comparativa de todas las cuantizaciones sobre la misma distribucion de prompts y la misma GPU (una NVIDIA H200 SXM), con perplexity en WikiText-103 y benchmarks de MMLU, HellaSwag, Winogrande, GSM8K y MATH-500 para cada fichero.

Es relevante ahora porque documenta empiricamente dos hallazgos utiles para cualquiera que despliegue modelos pequenos en llama.cpp: primero, que la cuantizacion ternaria (TQ2_0, TQ1_0) esta rota en esta arquitectura por falta de un camino rapido para los tensores Gated DeltaNet, produciendo perplexity de 2,3 millones y texto basura; segundo, que Q2_K es peor que ficheros de mayor y menor tamano, con 117,47 de perplexity frente a 27,57 de IQ2_M. El modelo esta pensado para generacion de texto conversacional en ingles y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, con tensores Gated DeltaNet segun la model card) |
| Parametros totales | 772.845.888 (dato real de safetensors); el autor indica 873M |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M, Q3_K_M, IQ3_XXS, IQ2_M, IQ2_XXS, Q2_K, TQ2_0, TQ1_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como qwen3_5 y menciona explicitamente tensores Gated DeltaNet, lo que sugiere una variante hibrida con capas de atencion lineal/estado recurrente junto a capas transformer convencionales. No se detalla el numero de capas, dimensiones ocultas ni el esquema exacto de atencion. El checkpoint es una conversion a GGUF del modelo abliterado OpceanAI/Qwen3.5-0.8B-abliterated, que a su vez deriva de un modelo Qwen3.5 de 0,8B mediante edicion de pesos (abliteration) para eliminar la direccion de rechazo; no se ha realizado un reentrenamiento completo ni un ajuste fino adicional documentado.

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o cualquier etapa de alineamiento posterior. La innovacion tecnica documentada es la propia evaluacion: quince cuantizaciones medidas con llama-perplexity sobre 32 fragmentos de 512 tokens de WikiText-103 y con llama-bench (prompt 64, generacion 32, dos ejecuciones promediadas), todo con offload completo (-ngl 99) en una H200 SXM de 150 GB. Los resultados muestran que el modelo esta limitado por ancho de banda de memoria en estos tamanos: todas las cuantizaciones funcionales rinden entre 500 y 620 tok/s de generacion, por lo que cuantizar reduce memoria pero no mejora el throughput de forma apreciable.

## Capacidades

- Generacion de texto conversacional en ingles, segun el pipeline text-generation y el tag conversational.
- Razonamiento basico y respuesta a preguntas de conocimiento general: MMLU del 40,5% en BF16 sobre 200 preguntas.
- Razonamiento commonsense limitado: HellaSwag del 44,0% y Winogrande del 54,0% en BF16.
- Matematicas de nivel escolar: GSM8K del 29,0% en BF16 sobre 1000 problemas; MATH-500 del 6,0% sobre 50 problemas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion y etiquetado de texto en ingles a gran escala: con 0,54 GB en Q4_K_M y perplexity de 15,80 (solo un 4% peor que BF16), el modelo puede procesar lotes masivos de documentos en una sola GPU consumer para tareas de categorizacion o extraccion de entidades, donde el coste por token es minimo.
- Prototipado rapido de asistentes conversacionales: al caber en menos de 1 GB en Q8_0 y ejecutarse con llama.cpp u Ollama, permite levantar un chatbot funcional en un portatil o en una instancia pequena de cloud sin provisioning de GPU de gama alta.
- Evaluacion de pipelines de cuantizacion: el repositorio sirve como banco de pruebas reproducible para comparar formatos GGUF (k-quants frente a i-quants) sobre una arquitectura concreta, con tablas de perplexity y benchmarks por fichero que permiten decidir que formato adoptar en produccion.
- Investigacion sobre abliteration: al ser un checkpoint abliterado y cuantizado, es util para estudiar como la edicion de pesos afecta al comportamiento del modelo y como se degrada con la cuantizacion (por ejemplo, IQ4_XS baja el formato valido al 66% frente al 92% de BF16).
- Generacion de texto de bajo coste en entornos embebidos o edge: los ficheros de 0,40-0,46 GB (IQ2_M, IQ3_M) permiten ejecutar inferencia en dispositivos con poca memoria, aceptando la perdida de calidad documentada (IQ2_M sube la perplexity un 81,5%).
- Filtrado y preprocesado en pipelines de datos: un modelo de 0,8B con generacion a 500-620 tok/s en H200 puede usarse como etapa barata de reescritura, resumen o normalizacion de texto antes de pasarlo a un modelo mayor, reduciendo el coste total del pipeline.
- Educacion y demostraciones: la diferencia medible entre cuantizaciones (de 15,19 a 117,47 de perplexity) convierte el repositorio en material didactico para explicar el impacto real de la cuantizacion, incluido el caso de los formatos ternarios rotos.

## Benchmarks y rendimiento

Resultados medidos por el autor. Perplexity sobre WikiText-103 (32 fragmentos de 512 tokens); MMLU, HellaSwag y Winogrande sobre 200 items cada uno; GSM8K sobre 1000 problemas; MATH-500 sobre 50 problemas. Velocidad medida en una NVIDIA H200 SXM con offload completo y un solo stream.

| Quant | Tamano | BPW | Perplexity | vs BF16 | Gen tok/s | Prompt tok/s | MMLU | HellaSwag | Winogrande | GSM8K | MATH-500 | Formato valido |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| BF16 | 1,56 GB | 16,0 | 15,19 | baseline | 503 | 13.299 | 40,5% | 44,0% | 54,0% | 29,0% | 6,0% | 92% |
| Q8_0 | 0,83 GB | 8,5 | 15,20 | +0,1% | 551 | 8.791 | 39,0% | 41,5% | 52,0% | 28,6% | 8,0% | 92% |
| Q6_K | 0,65 GB | 6,6 | 15,62 | +2,9% | 576 | 8.244 | 40,5% | 40,0% | 51,0% | 31,2% | 10,0% | 94% |
| Q5_K_M | 0,59 GB | 6,0 | 15,88 | +4,5% | 605 | 9.034 | 41,5% | 40,0% | 53,0% | 30,9% | 4,0% | 96% |
| Q4_K_M | 0,54 GB | 5,5 | 15,80 | +4,0% | 619 | 8.523 | 38,5% | 30,0% | 56,5% | 33,8% | 8,0% | 84% |
| IQ4_XS | 0,52 GB | 5,2 | 15,68 | +3,2% | 604 | 8.949 | 34,0% | 21,5% | 51,0% | 31,1% | 8,0% | 66% |
| IQ3_M | 0,46 GB | 4,7 | 16,53 | +8,8% | 585 | 9.058 | 35,0% | 28,5% | 48,0% | 25,3% | 8,0% | 90% |
| Q3_K_M | 0,48 GB | 4,8 | 19,09 | +25,7% | 565 | 8.668 | 36,5% | 27,0% | 52,5% | 24,3% | 6,0% | 76% |
| IQ3_XXS | 0,42 GB | 4,3 | 19,96 | +31,4% | 545 | 8.144 | 26,0% | 27,5% | 8,0% | 14,1% | 4,0% | 14% |
| IQ2_M | 0,40 GB | 4,0 | 27,57 | +81,5% | 576 | 8.308 | 26,5% | 25,0% | no disponible | no disponible | no disponible | no disponible |
| IQ2_XXS | 0,37 GB | 3,8 | 74,89 | +393% | 597 | 8.709 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Q2_K | 0,43 GB | 4,3 | 117,47 | +673% | 606 | 8.423 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| TQ2_0 | 0,35 GB | 3,6 | 2.346.013 | roto | 47 | 76 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| TQ1_0 | 0,33 GB | 3,3 | 2.346.013 | roto | 55 | 93 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Lectura de los datos: Q4_K_M es el punto de equilibrio (5,7 veces mas pequeno que BF16 con un 4% mas de perplexity); IQ4_XS es ligeramente mejor en perplexity (15,68 frente a 15,80) con 20 MB menos, aunque la diferencia esta dentro del ruido de 32 fragmentos. El acantilado de calidad esta en 4 bits: Q3_K_M cuesta un 25,7% y IQ3_M un 8,8%. Q2_K es peor que ficheros mayores y menores (117,47 frente a 27,57 de IQ2_M y 19,96 de IQ3_XXS). Los formatos ternarios estan rotos: perplexity de 2.346.013 y prompt-processing de 76-93 tok/s frente a mas de 8.000 del resto, por ausencia de un camino rapido para los tensores Gated DeltaNet en llama.cpp.

No se han publicado comparaciones de benchmarks con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,33 GB (TQ1_0, roto) y 1,56 GB (BF16) solo para los pesos; anadir margen para el contexto y el estado de inferencia (no documentado).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre permite cargar BF16 con offload completo; una H200 SXM se uso para las mediciones del autor.
- Cabe en GPU consumer: si, practicamente en todas. Una RTX 4090, RTX 3060, RTX 4060 o incluso iGPU con memoria unificada puede alojar Q4_K_M (0,54 GB) o Q8_0 (0,83 GB) con offload completo.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, con -ngl 99 para offload completo), Ollama (a partir de los GGUF), y servidores compatibles con endpoints segun el tag endpoints_compatible. vLLM y TGI no estan documentados para este repositorio GGUF en la informacion disponible.
- Latencia y throughput: en H200 SXM, generacion de 503-619 tok/s y prompt-processing de 8.244-13.299 tok/s para todas las cuantizaciones funcionales; los ternarios caen a 47-55 tok/s de generacion y 76-93 tok/s de prompt. En GPU consumer los valores absolutos seran menores, pero el autor senala que la forma plana de la curva se mantiene porque el modelo esta limitado por ancho de banda.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. La model card solo compara las cuantizaciones del propio modelo entre si. Como referencia de categoria, este checkpoint compite con otros modelos de menos de 1.000 millones de parametros en formato GGUF (por ejemplo, variantes pequenas de Qwen, Llama o Gemma), pero no se aportan mediciones cruzadas que permitan una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks comparables |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-abliterated-GGUF | 772,8M (873M segun autor) | no disponible | Apache-2.0 | GGUF | MMLU 40,5%, GSM8K 29,0% (BF16) |
| Alternativas de menos de 1B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El proceso de abliteration elimina la direccion de rechazo, lo que puede aumentar la probabilidad de respuestas a peticiones que el modelo original rechazaria; requiere filtrado y politicas de uso en produccion.
- Riesgo de alucinacion elevado: con MMLU del 40,5% y MATH-500 del 6,0% en BF16, el conocimiento factual y el razonamiento matematico son limitados; no es adecuado para tareas que exijan precision factual alta.
- Solo ingles declarado; no se garantiza comportamiento en castellano ni en otros idiomas.
- Longitud de contexto no documentada; no se puede planificar el uso con documentos largos sin verificacion previa.
- Los formatos ternarios TQ2_0 y TQ1_0 estan rotos en esta arquitectura: perplexity de 2.346.013 y salida incoherente. No deben usarse en produccion.
- Q2_K no es recomendable: perplexity de 117,47, peor que ficheros mayores y menores.
- IQ3_XXS degrada gravemente el formato de salida (14% de respuestas con formato valido) y el rendimiento en Winogrande (8,0%).
- IQ4_XS reduce el formato valido al 66% y HellaSwag al 21,5%, pese a su buena perplexity; la perplexity no captura toda la degradacion.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base abliterado y su procedencia deben revisarse por si el modelo original impone restricciones adicionales (no documentadas en la informacion disponible).
- El checkpoint se publico el 6 de noviembre de 2026 y no tiene likes ni documentacion de mantenimiento; verificar la integridad de los ficheros antes de desplegar.
- Los numeros de velocidad proceden de una unica H200 SXM con un solo stream; no extrapolables directamente a otros hardwares.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OpceanAI/Qwen3.5-0.8B-abliterated-GGUF
- Modelo base abliterado: https://huggingface.co/OpceanAI/Qwen3.5-0.8B-abliterated
- Figuras de la model card: figures/fig1_ppl_size.png, figures/fig2_speed_size.png, figures/fig3_bpw.png (referenciadas en el repositorio)
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
