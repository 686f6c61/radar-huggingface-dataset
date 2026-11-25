# inferencerlabs/Hy4-MLX-Q4i

## Resumen
Hy4-MLX-Q4i es una cuantización de 4 bits dinámica del modelo Hy4 de Tencent, publicada por el usuario inferencerlabs en Hugging Face. El modelo base (tencent/Hy4) es un modelo multimodal de tipo image-text-to-text, orientado a conversación y generación de texto a partir de imágenes. Esta versión concreta está empaquetada en formato MLX (safetensors), lo que la hace ejecutable en hardware Apple Silicon mediante la librería MLX, y no en GPUs NVIDIA convencionales.

La relevancia de esta ficha radica en que se trata de un artefacto de cuantización, no de un modelo original: su interés está en permitir ejecutar un modelo de gran tamaño (el repositorio ocupa 449,4 GB) en un Mac con memoria unificada muy elevada, a costa de una pérdida de precisión controlada. El autor reporta velocidades de aproximadamente 11,3 tokens/s en un M3 Ultra con 500 tokens de generación, y hasta 13,4 tokens/s en modo coding con el motor DFly.

La información disponible es escasa en cuanto a arquitectura, datos de entrenamiento y benchmarks del modelo base. La model card se centra en las métricas de cuantización y en las pruebas de rendimiento en hardware Apple, y no incluye detalles sobre el entrenamiento ni sobre evaluaciones estándar. Esta ficha refleja únicamente lo que el autor y los metadatos de Hugging Face declaran, marcando como "no disponible" todo aquello que no se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tencent/Hy4, multimodal image-text-to-text) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits dinámica (Q4i), con capas sensibles en mayor precisión |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |
| Tamano del repositorio | 449,4 GB |
| Libreria | MLX |
| Pipeline | image-text-to-text |
| Modelo base | tencent/Hy4 |
| Descargas | 689 |
| Fecha de creacion | 2026-11-21 |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura del modelo base tencent/Hy4 en la documentación proporcionada: no se especifica si es un transformer denso, un MoE, un modelo híbrido ni el número de parámetros. Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. El pipeline declarado (image-text-to-text) indica que el modelo acepta imágenes y texto como entrada y genera texto, por lo que incorpora algún tipo de codificador visual, pero su naturaleza concreta no está documentada.

La innovación técnica documentada corresponde a la cuantización: el autor describe un build de 4 bits dinámico que cuantiza la mayor parte del modelo a 4 bits y mantiene las capas sensibles en mayor precisión para preservar la exactitud en tareas de código. La cuantización se realizó con una versión modificada de MLX. El autor advierte que las cifras de la tabla comparativa proceden de un modelo GLM 5.1 de tamaño similar usando una técnica de conversión comparable, debido a restricciones de memoria y tiempo del sistema, por lo que no son medidas directas sobre Hy4.

## Capacidades
- Generación de texto conversacional en inglés, con pipeline image-text-to-text.
- Comprensión de imágenes combinada con texto (entrada multimodal imagen-texto).
- Generación de código, con capas preservadas a mayor precisión para mejorar la exactitud en tareas de programación.
- Generación de texto creativo y redacción (el autor reporta pruebas separadas de coding y writing).
- Conversación multi-turno (etiqueta "conversational").
- No se documenta soporte de tool calling, function calling, agentes, audio ni modo thinking en la información disponible.
- Capacidades multilingües limitadas al inglés según los metadatos.

## Casos de uso
- Asistencia conversacional multimodal en local: el modelo puede recibir una imagen junto con una pregunta y responder en inglés, adecuado para prototipos de análisis de capturas, diagramas o documentos escaneados en un Mac con memoria unificada amplia.
- Generación de código en estación de trabajo Apple: gracias a las capas sensibles mantenidas en mayor precisión, es utilizable para autocompletado y explicación de código en entornos MLX, con un rendimiento reportado de 13,4 tokens/s en modo coding sobre M3 Ultra.
- Redacción y edición de texto: el autor reporta pruebas específicas de writing a 9,9 tokens/s, por lo que encaja en tareas de generación de borradores y reescritura en inglés.
- Evaluación de cuantizaciones: al publicar métricas de perplejidad y exactitud de tokens, sirve como referencia para comparar técnicas de cuantización MLX en modelos multimodales grandes.
- Investigación en eficiencia de inferencia: permite estudiar el compromiso entre precisión y velocidad en hardware Apple Silicon con modelos de cientos de gigabytes.
- Despliegue de demostraciones privadas: al ejecutarse en local con MLX, evita enviar imágenes o texto a servicios externos, lo que resulta útil para pruebas con datos sensibles.
- No se recomienda para producción multilingüe ni para tareas que requieran contexto largo documentado, al no disponerse de esos datos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de calidad de cuantización, aunque advierte que proceden de un modelo GLM 5.1 de tamaño similar con técnica comparable, no de Hy4:

| Cuantizacion (bpw) | Perplejidad | Exactitud de tokens | Missed divergence |
|---|---|---|---|
| Q3 | 168,0 | 43,45 % | 72,57 % |
| Q4 | 1,33593 | 91,65 % | 17,28 % |
| Q4i | 1,21093 | 97,70 % | 10,65 % |
| Q5 | 1,23437 | 95,05 % | 17,28 % |
| Q6 | 1,21875 | 96,65 % | 12,03 % |
| Q8 | 1,21875 | 97,65 % | 9,92 % |
| Q9 | 1,20312 | 97,80 % | 9,60 % |
| Base | 1,20312 | 100 % | 0,000 % |

Rendimiento de inferencia reportado por el autor:

| Configuracion | Tarea | Tokens/s | Memoria |
|---|---|---|---|
| M3 Ultra | 500 tokens | ~11,3 | ~415 GiB |
| M3 Ultra + DFly | 500 tokens (coding) | ~13,4 | ~417 GiB |
| M3 Ultra + DFly | 500 tokens (writing) | ~9,9 | ~417 GiB |

## Requisitos de hardware
- Memoria: el autor reporta ~415-417 GiB de uso en M3 Ultra, coherente con un repositorio de 449,4 GB. Se requiere un Mac con memoria unificada de al menos ese orden (M3 Ultra con 512 GB o similar).
- GPU recomendadas: Apple Silicon de gama alta; el autor cita explícitamente M3 Ultra. No se documenta soporte para A100, H100 ni RTX 4090, al estar empaquetado en MLX.
- GPU de consumo: no cabe en ninguna GPU de consumo convencional (RTX 4090 con 24 GB, por ejemplo) ni en Macs con menos de ~450 GB de memoria unificada.
- Despliegue: librería MLX; el autor prueba con Inferencer v2.5.4 y con el motor DFly (Inference controls > Engine). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~11,3 tokens/s base en M3 Ultra; ~13,4 tokens/s en coding y ~9,9 tokens/s en writing con DFly, para generaciones de 500 tokens.

## Comparativa con modelos similares
No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría. El propio autor menciona GLM 5.1 como modelo de tamaño similar usado para estimar las métricas de cuantización, pero no se aportan especificaciones de parámetros, contexto ni licencia de ninguno de los dos. Se indica a continuación lo que sí está documentado:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy4-MLX-Q4i (esta ficha) | no disponible | no disponible | no disponible | safetensors MLX | Cuantización 4 bits de tencent/Hy4; ~449 GB |
| tencent/Hy4 (base) | no disponible | no disponible | no disponible | no disponible | Modelo original multimodal image-text-to-text |
| GLM 5.1 | no disponible | no disponible | no disponible | no disponible | Citado solo como referencia de tamaño para métricas de cuantización |

## Limitaciones y advertencias
- Es una cuantización, no el modelo original: la pérdida de precisión frente al base es medible (exactitud de tokens del 97,70 % en Q4i según la tabla del autor, aunque medida sobre otro modelo).
- Las métricas de cuantización publicadas no se midieron sobre Hy4, sino sobre un GLM 5.1 de tamaño similar, según admite el propio autor.
- Idiomas: solo se declara inglés; no hay evidencia de soporte de castellano ni de otros idiomas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base tencent/Hy4 antes de cualquier despliegue en producción.
- Requisitos de hardware extremos (~415 GiB de memoria), lo que limita su uso a estaciones de trabajo Apple de gama muy alta.
- Riesgo de alucinación inherente a los modelos generativos; el autor declara explícitamente que no garantiza la exactitud del contenido y que el usuario debe verificar la información.
- El autor no es el creador del modelo original y declina responsabilidad por daños derivados del uso.
- No se documentan tool calling, agentes, contexto largo ni otras capacidades avanzadas; no deben asumirse.
- El repositorio tiene muy poca tracción (1 like, 689 descargas) y fue creado y actualizado en noviembre de 2026, por lo que la validación comunitaria es mínima.

## Enlaces
- [Hugging Face: inferencerlabs/Hy4-MLX-Q4i](https://huggingface.co/inferencerlabs/Hy4-MLX-Q4i)
- [Modelo base: tencent/Hy4](https://huggingface.co/tencent/Hy4)
- [Vídeos de demostración](https://youtube.com/xcreate)
- [Inferencer](https://inferencer.com)
- [MLX (GitHub)](https://github.com/ml-explore/mlx)
