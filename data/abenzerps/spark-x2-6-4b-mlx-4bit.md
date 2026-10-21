# abenzerps/Spark-X2.6-4B-MLX-4bit

## Resumen

Spark-X2.6-4B-MLX-4bit es la cuantización en 4 bits para MLX del modelo XHToken/Spark-X2.6-4B, un modelo de lenguaje de 4.112.079.360 parámetros (aproximadamente 4,11 mil millones) desarrollado por XHToken y distribuido por el usuario abenzerps. Se trata de un transformer de atención híbrida diseñado explícitamente para ejecución en dispositivo ("on-device") y para tareas de agente, con una ventana de contexto nativa de 1.048.576 tokens (1M). Su relevancia inmediata reside en esa combinación: un modelo compacto, con licencia Apache-2.0, capaz de mantener contextos de un millón de tokens y de ejecutarse en hardware Apple Silicon mediante MLX.

El repositorio no contiene los pesos originales en precisión completa, sino una conversión a 4 bits en formato MLX (safetensors) de 2,32 GB, pensada para inferencia local en Macs con chip de la serie M. El autor publica además variantes en 6 bits (3,34 GB) y 8 bits (4,37 GB), lo que permite ajustar el equilibrio entre calidad y huella de memoria. La model card menciona un "thinking mode" en la generación de benchmarks, lo que sugiere soporte de razonamiento extendido, aunque no se detallan los mecanismos.

La información disponible es limitada: no se especifican volcumen de datos de entrenamiento, composición del dataset, idiomas soportados ni resultados numéricos de benchmarks (solo se incluye una imagen comparativa sin cifras textuales). Cualquier evaluación cuantitativa del modelo debe hacerse contra el repositorio base XHToken/Spark-X2.6-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de atención híbrida ("hybrid-attention"), orientado a ejecución on-device; detalles de capas y proporción de atención lineal no disponibles |
| Parametros totales | 4.112.079.360 (≈4,11 B), según safetensors |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | 1.048.576 tokens (1M) nativos |
| Tipos de cuantizacion | 4 bits (este repositorio); el autor publica también 6 bits y 8 bits en MLX; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`); incluye `chat_template.jinja` y `SHA256SUMS.txt` |

## Arquitectura y entrenamiento

La model card describe Spark-X2.6-4B como un modelo de lenguaje de atención híbrida, es decir, una combinación de mecanismos de atención (presumiblemente atención completa y atención lineal o de estado recurrente) pensada para reducir el coste computacional y de memoria en contextos muy largos. Esa es la base técnica que permite anunciar una ventana nativa de 1M de tokens en un modelo de solo 4,11 B de parámetros y orientado a dispositivos locales. No se detalla el número de capas, la proporción entre tipos de atención, el tamaño del vocabulario ni la implementación concreta del mecanismo híbrido.

En cuanto al entrenamiento, no hay información publicada en los materiales disponibles: se desconoce el número de tokens de entrenamiento, la composición del corpus, si hubo fases de instrucción, RLHF o DPO, y qué técnicas de alineación se aplicaron. La única referencia indirecta es la mención a un "thinking mode" en la leyenda de la imagen de benchmarks, lo que indica que el modelo soporta generación con razonamiento extendido, pero sin especificar cómo se entrena o activa ese modo. Esta cuantización MLX 4-bit no introduce cambios arquitectónicos: es una conversión de pesos del modelo base, por lo que hereda sus capacidades y sus posibles degradaciones por cuantización.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline `text-generation` y plantilla de chat incluida (`chat_template.jinja`).
- Contexto largo nativo de 1M de tokens, adecuado para documentos extensos, bases de código completas o historiales de conversación muy prolongados.
- Ejecución orientada a agentes: el modelo está etiquetado como `agent` y descrito como "engineered for high-efficiency agent execution", lo que apunta a flujos multi-paso y uso de herramientas, aunque no se documenta formalmente el esquema de tool calling.
- Modo de razonamiento ("thinking mode") citado en la model card para la generación de benchmarks; no se detalla su funcionamiento ni cómo se activa.
- Ejecución on-device en Apple Silicon mediante MLX, sin necesidad de GPU dedicada ni de servicios en la nube.
- Capacidades multilingües: no disponibles (no se declaran idiomas en la ficha ni en los tags).
- Soporte de visión o audio: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Análisis de repositorios de código completos: con 1M de tokens de contexto, el modelo puede recibir varios ficheros de un proyecto y responder preguntas de arquitectura, dependencias o impacto de un cambio, sin necesidad de trocear el código en fragmentos y perder coherencia global.
- Agentes locales en Mac: al ejecutarse con MLX en un chip de la serie M, permite construir agentes que planifican varios pasos y llaman a herramientas sin enviar datos a la nube, algo relevante para entornos con requisitos de privacidad.
- Asistente sobre documentación extensa: ingestión de manuales técnicos, normativas o contratos de cientos de miles de tokens para responder consultas con referencia al texto completo, aprovechando la ventana nativa en lugar de depender de RAG.
- Revisión de historiales largos de soporte: procesar transcripciones o tickets acumulados de un cliente para resumir incidencias recurrentes y proponer respuestas coherentes con el histórico, manteniendo el contexto entre sesiones.
- Prototipado rápido en local para desarrolladores: con `mlx-lm` y 2,32 GB de pesos, es viable levantar un endpoint de generación en un portátil para pruebas de prompts, plantillas de chat y evaluación cualitativa antes de pasar a modelos mayores.
- Procesamiento por lotes de documentos largos en estaciones de trabajo Apple: resumen y extracción de entidades sobre informes o expedientes de gran tamaño en un equipo de sobremesa, sin coste de API y con la licencia Apache-2.0 permitiendo uso comercial.
- Generación asistida de código en pipelines internos: integrable como paso de revisión o generación de parches dentro de scripts, siempre que se valide la salida y se asuma que no hay documentación específica de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye una imagen (`assets/benchmark.png`) con la comparativa de benchmarks reportada por XHToken para Spark-X2.6-4B en modo thinking, pero las cifras no están disponibles en formato texto y no se reproducen aquí para no inventar datos.

| Benchmark | Spark-X2.6-4B (4-bit MLX) | Referencia |
|---|---|---|
| MMLU | No disponible | No disponible |
| HumanEval | No disponible | No disponible |
| GSM8K | No disponible | No disponible |

## Requisitos de hardware

- Pesos en 4 bits: 2,32 GB en disco (el repositorio completo ocupa 2,3 GB), lo que deja el modelo al alcance de equipos con 8 GB de memoria unificada, siempre que se limite la longitud de contexto.
- Memoria para inferencia: a los ~2,3 GB de pesos hay que sumar la caché KV. Con 1M de tokens de contexto, la caché crece de forma muy significativa y puede superar con creces la memoria de un equipo de consumo; en la práctica conviene trabajar con contextos de decenas de miles de tokens en hardware de 16-32 GB.
- GPU recomendadas: al ser un formato MLX, el requisito es Apple Silicon (serie M1/M2/M3/M4 y variantes Pro, Max y Ultra). No está pensado para A100, H100 ni RTX 4090, que no ejecutan MLX.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en la memoria unificada de un Mac con chip de la serie M; no aplica a GPU discretas NVIDIA o AMD sin reconvertir los pesos.
- Opciones de despliegue: `mlx-lm` (CLI `python -m mlx_lm generate` y API Python `load`/`generate`). Para vLLM, llama.cpp, Ollama o TGI sería necesario convertir los pesos a otro formato, algo que no se documenta en este repositorio.
- Latencia y throughput: no disponibles. No se publican métricas de tokens por segundo ni de tiempo hasta el primer token para esta cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-MLX-4bit (este) | 4,11 B | 1.048.576 | 4 bits MLX, 2,32 GB | Apache-2.0 | HuggingFace, librería `mlx` |
| Spark-X2.6-4B-MLX-6bit | 4,11 B (mismo base) | 1.048.576 | 6 bits MLX, 3,34 GB | Apache-2.0 | HuggingFace, librería `mlx` |
| Spark-X2.6-4B-MLX-8bit | 4,11 B (mismo base) | 1.048.576 | 8 bits MLX, 4,37 GB | Apache-2.0 | HuggingFace, librería `mlx` |
| XHToken/Spark-X2.6-4B (base) | 4,11 B | 1.048.576 | Pesos originales | Apache-2.0 | HuggingFace |
| Familia Spark-X2.5 (4B y 1,7B) | No disponible | No disponible | No disponible | No disponible | Referenciada en la galería de LocalAI; sin datos técnicos en la información disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos de otras familias (por ejemplo, alternativas densas de ~4 B con contexto largo) en la información proporcionada, por lo que no se establece una comparación de rendimiento con ellas.

## Limitaciones y advertencias

- Ausencia total de documentación sobre sesgos: no se indica composición del dataset ni procesos de filtrado, por lo que no es posible evaluar sesgos de género, raza, idioma o dominio.
- Riesgo de alucinación no cuantificado: no hay benchmarks de fidelidad ni de tasa de alucinación publicados; en tareas de recuperación sobre contextos de 1M de tokens el riesgo de citar contenido inexistente debe asumirse alto hasta validarlo.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otros idiomas; la plantilla de chat está incluida, pero no se especifica su cobertura lingüística.
- Contexto nativo de 1M de tokens no implica uso práctico de 1M: la memoria necesaria para la caché KV y la degradación de la atención a longitudes extremas no están documentadas.
- La cuantización a 4 bits puede degradar el rendimiento respecto al modelo base, especialmente en razonamiento y código; no se publican comparativas entre las variantes de 4, 6 y 8 bits.
- Formato exclusivamente MLX: no es directamente utilizable en vLLM, TGI, llama.cpp u Ollama; requiere conversión y no se documenta el procedimiento.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no obstante, el autor del modelo base es quien debe aclarar cualquier restricción adicional sobre datos de entrenamiento.
- Repositorio con 0 descargas y creado en octubre de 2026: se trata de una conversión de terceros, no oficial, sin validación comunitaria conocida; conviene verificar los checksums (`SHA256SUMS.txt`) antes de usarla en producción.
- La referencia a benchmarks es únicamente una imagen sin cifras textuales: no es posible auditar los resultados ni reproducirlos con los datos disponibles.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/abenzerps/Spark-X2.6-4B-MLX-4bit
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Licencia del modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B/blob/main/LICENSE
- Variante 8 bits: https://huggingface.co/abenzerps/Spark-X2.6-4B-MLX-8bit
- Variante 6 bits: https://huggingface.co/abenzerps/Spark-X2.6-4B-MLX-6bit
- Checksums de esta cuantización: https://huggingface.co/abenzerps/Spark-X2.6-4B-MLX-4bit/blob/main/SHA256SUMS.txt
- Solicitud de modelos del autor: https://abenzerps.com/request-a-model/
- Galería de modelos de LocalAI (referencia a la familia Spark-X2.5): https://localai.io/docs/gallery.html
