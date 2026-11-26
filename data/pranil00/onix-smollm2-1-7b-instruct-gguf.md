# pranil00/ONIX-SmolLM2-1.7B-Instruct-GGUF

## Resumen

ONIX-SmolLM2-1.7B-Instruct-GGUF es una cuantización en formato GGUF (concretamente Q5_K_M) del modelo SmolLM2-1.7B-Instruct desarrollado originalmente por Hugging Face. La publica el usuario pranil00 bajo la etiqueta "ONIX Community", y su aportación consiste en convertir los pesos originales a un formato cuantizado listo para su uso con llama.cpp y Ollama, reduciendo el peso del modelo a aproximadamente 1,14 GB.

El modelo base, SmolLM2-1.7B-Instruct, es un transformer decoder-only de 1.711.376.384 parámetros (1,7 mil millones) diseñado para tareas de generación de texto conversacional y ajustado mediante instrucciones. Está pensado para ejecutarse en hardware modesto, incluyendo equipos de consumo, lo que lo hace atractivo para prototipado rápido, despliegues en el borde y entornos con recursos limitados.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo instructivo de 1,7B en local con un único fichero GGUF y una licencia Apache 2.0 permisiva. No obstante, la información publicada por el autor es mínima: no se detallan idiomas soportados, benchmarks ni datos de entrenamiento específicos de la cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-1.7B-Instruct) |
| Parámetros totales | 1.711.376.384 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q5_K_M (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base SmolLM2-1.7B-Instruct, un transformer decoder-only de 1,7 mil millones de parámetros. Esta publicación no entrena el modelo desde cero, sino que realiza una conversión de pesos a GGUF con cuantización Q5_K_M mediante llama.cpp, según indica el autor, verificada como conversión auténtica de tensores y realizada en Apple Silicon con Metal. El tamaño resultante del fichero de pesos es de aproximadamente 1,14 GB.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas adicionales en esta publicación más allá de la propia cuantización. Para detalles de entrenamiento del modelo original, debe consultarse la model card de HuggingFaceTB/SmolLM2-1.7B-Instruct.

## Capacidades

- Generación de texto conversacional en formato instructivo, heredado del modelo base.
- Razonamiento básico y respuesta a instrucciones de complejidad moderada, limitado por el tamaño de 1,7B parámetros.
- Generación de código y tareas sencillas de programación, según las capacidades del modelo base.
- Ejecución local mediante llama.cpp y Ollama, con un fichero GGUF único.
- Compatibilidad con endpoints (etiqueta endpoints_compatible en Hugging Face).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Prototipado local de asistentes conversacionales: el fichero GGUF de 1,14 GB permite arrancar un chatbot instructivo en un portátil sin GPU dedicada, usando Ollama con un solo comando, ideal para validar ideas antes de escalar a modelos mayores.
- Despliegue en el borde o en dispositivos con recursos limitados: al caber en memoria de sistemas con poca RAM o VRAM, puede integrarse en aplicaciones de escritorio, Raspberry Pi de gama alta o entornos embebidos donde no es viable un modelo de mayor tamaño.
- Generación de texto en pipelines de CI/CD para pruebas: sirve como modelo de referencia ligero para validar integraciones de inferencia, plantillas de prompt o formateo de salidas sin coste de GPU.
- Asistencia de redacción y resumen de textos cortos: adecuado para tareas de post-procesado o generación de borradores en herramientas internas, siempre con revisión humana por el riesgo de alucinación de un modelo de 1,7B.
- Experimentación educativa: útil en cursos y talleres para explicar cuantización GGUF, diferencias entre pesos originales y cuantizados, y el funcionamiento de llama.cpp en hardware de consumo.
- Filtrado o clasificación de texto ligera: puede emplearse para tareas de etiquetado simple o reformateo de datos en lotes pequeños, donde la latencia y el coste importan más que la precisión máxima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,5-2 GB con la cuantización Q5_K_M (fichero de 1,14 GB más overhead de contexto y runtime).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre; tarjetas de consumo como GTX 1650, RTX 3050 o superiores son suficientes. También funciona en CPU.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU modernas de consumo, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: Ollama (`ollama run pranil00/ONIX-SmolLM2-1.7B-Instruct-GGUF`), llama.cpp (`llama-cli -m SmolLM2-1.7B-Instruct-Q5_K_M.gguf`), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-SmolLM2-1.7B-Instruct-GGUF (esta ficha) | 1,7B | No disponible | Apache 2.0 | GGUF Q5_K_M | Hugging Face (0 descargas) |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | No disponible | Apache 2.0 | Safetensors | Hugging Face (modelo base oficial) |
| Qwen2.5-1.5B-Instruct | 1,5B | No disponible en esta ficha | Apache 2.0 | Safetensors, GGUF | Hugging Face |
| Llama-3.2-1B-Instruct | 1,2B | No disponible en esta ficha | Llama 3.2 Community License | Safetensors, GGUF | Hugging Face |

## Limitaciones y advertencias

- Modelo de 1,7B parámetros: capacidad de razonamiento y conocimiento factual limitados en comparación con modelos de mayor tamaño; propenso a errores en tareas complejas.
- Riesgo de alucinación: como todo modelo generativo de este tamaño, puede inventar datos, especialmente en preguntas factuales o matemáticas.
- Idiomas soportados no documentados: no hay información oficial sobre cobertura multilingüe en esta publicación; conviene validar el comportamiento en castellano antes de usarlo en producción.
- Longitud de contexto no especificada: se desconoce la ventana efectiva del modelo base en esta ficha; debe consultarse la model card original.
- Publicación con 0 descargas y 0 likes: sin validación comunitaria; la verificación de calidad de la cuantización depende únicamente de la afirmación del autor.
- Licencia Apache 2.0: permite uso comercial, pero debe respetarse la atribución y las condiciones de la licencia del modelo base.
- La cuantización Q5_K_M introduce una pérdida de precisión respecto a los pesos originales en safetensors; para tareas sensibles conviene comparar con el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-SmolLM2-1.7B-Instruct-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
