# arlenecc/LightOnOCR-3-0.8B-MLX-4bit

## Resumen

LightOnOCR-3-0.8B-MLX-4bit es una conversión a formato MLX con cuantización de 4 bits del modelo LightOnOCR-3, un modelo de 0,8 mil millones de parámetros orientado a tareas de reconocimiento óptico de caracteres (OCR). El artefacto está publicado en HuggingFace por el usuario `arlenecc`, que actúa como redistribuidor de la conversión, mientras que el modelo original es desarrollado por LightOn. La model card del repositorio no incluye información técnica adicional más allá de la licencia MIT.

El interés de esta pieza concreta reside en su formato: la cuantización a 4 bits en MLX permite ejecutar un modelo de OCR de 0,8B en hardware Apple Silicon con un consumo de memoria reducido, lo que facilita su despliegue en portátiles y equipos de sobremesa con chip M-series sin necesidad de GPU dedicada. Es relevante para desarrolladores que quieran integrar extracción de texto desde imágenes o documentos en flujos locales y con requisitos de privacidad.

No obstante, la información publicada en el repositorio es mínima: no se detallan arquitectura, datos de entrenamiento, idiomas soportados ni resultados de benchmarks. Esta ficha refleja únicamente lo que puede verificarse en el repositorio y en el conocimiento público del modelo base, marcando explícitamente como "no disponible" todo aquello que no consta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 0,8B (según el nombre del modelo) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits en formato MLX |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX (cuantizado a 4 bits) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en el repositorio de HuggingFace. Por el nombre y el propósito (OCR), se trata presumiblemente de un transformer con un codificador visual y un decodificador de texto, pero este dato no puede confirmarse con la información disponible. Tampoco constan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La única innovación técnica verificable es la conversión a MLX con cuantización de 4 bits, que reduce el peso del modelo y permite su ejecución en el framework MLX de Apple para chips M-series. No se documentan técnicas como decodificación especulativa, atención lineal ni variantes híbridas.

## Capacidades

- Reconocimiento óptico de caracteres (OCR): extracción de texto desde imágenes, presumiblemente documentos y capturas, aunque no se detalla el alcance exacto.
- Conversión a MLX 4 bits: ejecución en Apple Silicon con menor huella de memoria.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Digitalización de documentos en local: el modelo puede procesar imágenes de documentos y extraer el texto en un equipo Apple Silicon, sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Extracción de texto en aplicaciones de escritorio para macOS: al estar en formato MLX, puede integrarse en apps nativas que aprovechen la GPU unificada del chip M-series para OCR en tiempo real.
- Procesamiento por lotes de facturas y recibos: un modelo de 0,8B cuantizado a 4 bits permite procesar grandes volúmenes de imágenes en un portátil, con un coste de memoria bajo.
- Indexación de archivos escaneados: extracción de texto para alimentar motores de búsqueda o sistemas RAG locales, combinando el OCR con un modelo de embeddings ejecutado en el mismo equipo.
- Accesibilidad: conversión de imágenes con texto en voz mediante la integración del OCR con un sintetizador de voz local.
- Prototipado rápido en investigación: al ser un modelo pequeño y ligero, sirve para experimentar con pipelines de OCR antes de escalar a modelos mayores o a infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de una cuantización a 4 bits de un modelo de 0,8B, el peso de los parámetros ronda los 0,4 GB; el consumo total de memoria depende de la implementación y del tamaño de las imágenes de entrada, pero debería mantenerse en el rango de 1 a 2 GB.
- GPU recomendadas: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el formato MLX. No es directamente compatible con CUDA sin reconversión.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada; en GPUs NVIDIA consumer requeriría convertir los pesos a otro formato (por ejemplo, GGUF o safetensors).
- Opciones de despliegue: framework MLX (`mlx-lm`), `mlx-community` y herramientas compatibles con MLX. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI con este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LightOnOCR-3-0.8B-MLX-4bit | 0,8B | no disponible | MIT | MLX 4 bits | HuggingFace |
| LightOnOCR-3 (base) | 0,8B | no disponible | no disponible | no disponible | no disponible |
| Alternativas OCR de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero todo modelo entrenado con datos web puede heredar sesgos de esos datos.
- Riesgo de alucinación: en tareas de OCR, el modelo puede generar texto plausible que no aparece en la imagen, especialmente con documentos de baja calidad o manuscritos.
- Idiomas soportados: no disponibles; no se puede garantizar el rendimiento en castellano ni en otros idiomas sin validación previa.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo base original, ya que el repositorio solo declara MIT para esta conversión.
- El artefacto es una conversión de terceros (`arlenecc`), no una publicación oficial de LightOn; la reproducibilidad y el soporte no están garantizados.
- Formato MLX: no es portable a CUDA ni a CPU sin conversión previa, lo que limita su uso fuera del ecosistema Apple.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión en OCR, por lo que se recomienda evaluar con un conjunto de validación propio antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arlenecc/LightOnOCR-3-0.8B-MLX-4bit
- Modelo base LightOnOCR-3: no disponible en la información proporcionada
- Paper o blog de LightOn sobre LightOnOCR: no disponible en la información proporcionada
- Repositorio de MLX: no disponible en la información proporcionada
