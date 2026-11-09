# RepublicOfKorokke/gemma-4-E2B-it-qat-q4_0-unquantized-oQ4e-fp16

## Resumen

gemma-4-E2B-it-qat-q4_0-unquantized-oQ4e-fp16 es una versión cuantizada del modelo Gemma 4 E2B instruct (familia Gemma de Google), publicada por el usuario RepublicOfKorokke en Hugging Face. Se trata de una conversión de precisión mixta realizada con la herramienta oQ de oMLX v0.7.3, que combina bloques de cuantización afín de 4, 5, 6 y 8 bits para reducir el peso del checkpoint hasta unos 2,59 GiB manteniendo una media efectiva de 4,801 bits por peso. El modelo resultante está pensado para su uso con la librería MLX en hardware Apple Silicon.

El checkpoint original es un modelo instruct de aproximadamente 4.629 millones de parámetros (4,6B), según el recuento real de tensores safetensors. La nomenclatura indica que parte de una variante ya sometida a QAT (quantization-aware training) en 4 bits, que posteriormente fue "desquantizada" y recuantizada con precisión mixta mediante oQ. No se especifican en la información disponible la longitud de contexto, los idiomas soportados ni la licencia.

La relevancia de esta publicación es práctica: ofrece una alternativa ligera y lista para MLX que permite ejecutar un modelo de la familia Gemma 4 en equipos con memoria unificada limitada (MacBook, Mac mini), a costa de una licencia y unos detalles técnicos que el autor no documenta y que el usuario debe verificar antes de usarla en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4; arquitectura interna no documentada en la información) |
| Parámetros totales | 4.628.569.379 (4,629B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Precisión mixta afín (group 64): 4-bit (75,179% de pesos), 5-bit (21,978%), 6-bit (1,665%), 8-bit (1,172%), FP16 (0,006%); media efectiva 4,801 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |
| Tamaño del repo | 7,4 GB (checkpoint cuantizado: 2,778 GB / 2,587 GiB) |
| Herramienta de cuantización | oQ (oMLX v0.7.3) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Gemma 4 E2B ni sus datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF o DPO). Lo único documentado es el proceso de cuantización: el checkpoint parte de una variante QAT de 4 bits del modelo instruct, se desquantiza y se recuantiza con oQ aplicando precisión mixta por capas. La distribución resultante asigna el 75,179% de los pesos lógicos a bloques afín de 4 bits (grupo 64), el 21,978% a 5 bits, el 1,665% a 6 bits y el 1,172% a 8 bits, con una fracción residual en FP16. No se detalla qué capas reciben mayor precisión ni el criterio de asignación.

La innovación técnica destacable es precisamente ese esquema de cuantización mixta: al mantener en mayor precisión una minoría de tensores (habitualmente los más sensibles), se busca preservar la calidad del modelo original con un coste de almacenamiento de 2,587 GiB. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional en modo instruct (el sufijo "it" indica ajuste a instrucciones).
- Razonamiento y respuesta a preguntas de propósito general, heredadas del modelo base Gemma 4 E2B.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades de visión o audio: no disponibles en la información.
- Modo "thinking" u otras capacidades especiales: no disponible en la información.
- Ejecución nativa en MLX sobre Apple Silicon.

## Casos de uso

- Prototipado local en Mac: cargar el checkpoint con MLX en un MacBook con memoria unificada de 16 GB o más para probar un modelo instruct de 4,6B sin depender de la nube, gracias a los 2,587 GiB del checkpoint cuantizado.
- Asistentes de escritorio offline: integrar el modelo en una aplicación macOS que genere respuestas y resúmenes sin conexión, aprovechando el soporte nativo de MLX y el reducido espacio en disco.
- Evaluación de técnicas de cuantización: usar este checkpoint como referencia para comparar la precisión mixta de oQ frente a cuantizaciones uniformes de 4 bits en tareas de generación y razonamiento.
- Generación de texto en lotes pequeños: procesar borradores, correos o documentación en un pipeline local por su bajo coste de memoria, siempre que se valide la calidad frente al modelo original.
- Educación e investigación: experimentar con ajuste fino ligero o evaluación de prompts sobre un modelo Gemma 4 en hardware de consumo Apple.
- Pruebas de regresión de pipelines MLX: verificar que una aplicación basada en MLX carga y ejecuta correctamente checkpoints cuantizados de precisión mixta antes de desplegar variantes mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 2,587 GiB; para inferencia conviene reservar al menos 4-6 GB de memoria unificada para pesos, caché KV y overhead del runtime (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada suficiente; no está pensado para GPU NVIDIA por su formato MLX.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple Silicon con 8 GB o más de memoria unificada, aunque 16 GB ofrece mayor margen para contextos largos.
- Opciones de despliegue: librería MLX y herramientas compatibles con MLX (por ejemplo, mlx-lm); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que los pesos están en formato MLX safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E2B-it-qat-q4_0-unquantized-oQ4e-fp16 (este) | 4,629B | no disponible | Mixta 4/5/6/8-bit (4,801 bits/peso) | no disponible | Hugging Face, formato MLX |
| Gemma 4 E2B it original | no disponible | no disponible | Original (QAT 4-bit según nomenclatura) | no disponible | Hugging Face |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La licencia no está indicada en la información disponible; antes de cualquier uso comercial es imprescindible verificar los términos del modelo base Gemma y del checkpoint publicado.
- La cuantización mixta puede degradar la calidad respecto al modelo original; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente a los modelos de lenguaje instruct; no hay datos específicos sobre la tasa en esta variante.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados y calidad multilingüe: no disponibles.
- Longitud de contexto: no disponible, lo que impide planificar cargas con contextos largos.
- Formato exclusivo MLX: no es directamente utilizable en ecosistemas CUDA, vLLM o llama.cpp sin conversión adicional.
- El autor no documenta el proceso de "desquantización" y recuantización, por lo que la fidelidad respecto al checkpoint QAT original no está garantizada.
- Modelo con muy pocas descargas (30) y sin likes; no hay evidencia comunitaria de su robustez en producción.

## Enlaces

- Hugging Face: https://huggingface.co/RepublicOfKorokke/gemma-4-E2B-it-qat-q4_0-unquantized-oQ4e-fp16
- Repositorio de la herramienta oQ (oMLX): https://github.com/jundot/omlx
