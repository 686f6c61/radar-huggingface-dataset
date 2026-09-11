# SirSahOl/Qwen2.5-1.5B-Instruct-chat-mlx-8bit

## Resumen

SirSahOl/Qwen2.5-1.5B-Instruct-chat-mlx-8bit es una conversión de pesos, no un modelo nuevo: se trata de Qwen/Qwen2.5-1.5B-Instruct convertido al formato MLX de Apple con cuantización de 8 bits. El autor es el usuario de HuggingFace SirSahOl, que lo distribuye mediante su pipeline MLX Foundry. No hay entrenamiento adicional, ajuste fino ni cambio de arquitectura: lo único que varía respecto al original es el formato y la precisión numérica de los pesos, orientados a ejecución en Apple Silicon (M1 o posterior) con la librería MLX.

El modelo tiene 1.543.714.304 parámetros (1,54 mil millones), ocupa 1,5 GB en disco y el repositorio completo pesa 1,7 GB. La licencia es apache-2.0, heredada del modelo base, por lo que permite uso comercial sin restricciones adicionales. El modelo original de Qwen declara una ventana de contexto de 32.768 tokens, aunque el propio autor advierte de degradación del rendimiento en contextos superiores a 8.000 tokens con cuantizaciones bajas.

Su relevancia práctica es acotada pero clara: permite ejecutar un modelo de chat instruido en un Mac con memoria unificada modesta sin depender de GPU dedicada ni de servicios en la nube. El repositorio se publicó el 10 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, por lo que no existe validación comunitaria independiente de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) con Grouped Query Attention y RoPE, convertido a MLX; el autor no detalla la configuracion interna en la model card |
| Parametros totales | 1.543.714.304 (1,54 B), segun el archivo safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no declarada en el repositorio; el modelo base Qwen2.5-1.5B-Instruct documenta 32.768 tokens. El autor advierte de degradacion por encima de 8.000 tokens en cuantizaciones bajas |
| Tipos de cuantizacion | 8 bits (weight-only). El mismo autor publica variantes de 4 y 16 bits en MLX |
| Idiomas soportados | no declarados en la metadata del repositorio; el modelo base Qwen2.5-1.5B-Instruct cubre 29 idiomas segun la documentacion de Qwen |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (no compatible con transformers, vLLM ni llama.cpp sin conversion) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct (relacion: quantized) |
| Framework de ejecucion | mlx-lm 0.31.3 (Apple MLX) |
| Tamano del repositorio | 1,7 GB (pesos de salida: 1,5 GB) |
| Fecha de publicacion | 10 de septiembre de 2026 |

## Arquitectura y entrenamiento

El repositorio no contiene ningún entrenamiento: es una conversión weight-only realizada con `python3 -m mlx_lm.convert --hf-path Qwen/Qwen2.5-1.5B-Instruct -q --q-bits 8`, ejecutada con mlx-lm 0.31.3 en 15,68 segundos y con un resultado de 1,5 GB. La arquitectura subyacente es la del modelo base de Alibaba Qwen (familia Qwen2), un transformer decoder-only con Grouped Query Attention y RoPE que Qwen entrenó sobre un corpus multilingüe y posteriormente alineó con técnicas de ajuste instruccional; ninguno de esos detalles se documenta en esta conversión, que los hereda íntegramente.

La innovación técnica aquí es exclusivamente de despliegue: la cuantización de 8 bits junto con los kernels de MLX permite ejecutar el modelo en memoria unificada de Apple Silicon aprovechando la GPU integrada, con los pesos almacenados en safetensors. El autor indica que se trata de una conversión de solo pesos y que el comportamiento y la arquitectura son los del modelo de origen, con la pérdida de calidad inherente a la reducción de precisión.

## Capacidades

Las capacidades son las del modelo base Qwen2.5-1.5B-Instruct, conservadas por la conversión. Entre las documentadas para esa familia y aplicables a esta variante:

- Generación de texto conversacional en formato instruido, con la plantilla de chat de Qwen (`<|im_start|>` / `<|im_end|>`) preservada en el tokenizador.
- Razonamiento básico y resolución de problemas aritméticos sencillos, limitado por el tamaño de 1,54 B de parámetros.
- Generación y explicación de código en lenguajes habituales, con corrección decreciente a medida que crece la complejidad de la tarea.
- Salidas estructuradas en JSON y formateo de respuestas siguiendo instrucciones de esquema.
- Soporte de tool calling o function calling, heredado de la familia Qwen2.5-Instruct; la fiabilidad a este tamaño es limitada y requiere validación en producción.
- Flujos multi-turno con historial de conversación, dentro de los límites de contexto indicados.
- Capacidad multilingüe amplia según la documentación del modelo base; esta conversión no declara idiomas en su metadata.
- Modelo exclusivamente de texto: no hay visión, audio ni modo de razonamiento extendido (thinking mode) en esta familia.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se ejecuta con `mlx_lm.chat` sobre memoria unificada y no envía datos a ningún servidor, lo que resulta adecuado para prototipos con requisitos de privacidad y para trabajar sin conexión.
- Prototipado de pipelines RAG en local: sirve como generador de la fase final de respuesta sobre fragmentos recuperados, con la ventaja de que el ciclo completo se prueba en el propio portátil antes de migrar a un modelo mayor.
- Extracción de información estructurada: tareas de conversión de texto libre a JSON (campos de facturas, currículos, tickets de soporte) que se benefician de las instrucciones de formato y de la baja latencia en hardware Apple.
- Enrutamiento de intenciones y preprocesado: clasificar consultas, reescribir prompts o decidir a qué modelo mayor derivar cada petición, un uso donde el coste por token importa más que la calidad máxima de respuesta.
- Generación de código asistida en editor local: autocompletado de funciones cortas, generación de tests unitarios simples y explicación de fragmentos, integrable en un plugin local sin enviar código a terceros.
- Traducción y atención al cliente de bajo volumen: respuestas multi-turno en varios idiomas sobre consultas frecuentes, con revisión humana, dado el coste reducido de ejecución local.
- Etiquetado y aumento de datos: generación de datos sintéticos o clasificación preliminar de corpus para entrenar modelos posteriores, aprovechando que cabe en equipos de desarrollo estándar de Apple.
- Base para ajuste fino con LoRA: mlx-lm incluye herramientas de entrenamiento, por lo que esta conversión puede servir como punto de partida para adaptaciones de dominio en un Mac.

## Benchmarks y rendimiento

La model card publica únicamente métricas de rendimiento de inferencia medidas en un Apple M1 con 8 GB de memoria unificada, promedio de 5 ejecuciones con 256 tokens de salida máxima:

| Metrica | 4 bits | 8 bits | 16 bits |
|---|---|---|---|
| Tokens por segundo | 51,35 | 29,3 | 16,52 |
| TTFT (time to first token) | 19,48 ms | 34,13 ms | 60,59 ms |
| Memoria pico declarada | 1.124,4 MB | 351,5 MB | 59,7 MB |

Advertencia sobre estos datos: la columna de memoria pico decrece al aumentar el número de bits, lo que contradice el comportamiento esperado (a mayor precisión, mayor huella de memoria). La tabla debe tomarse con cautela y probablemente no mide la memoria total del proceso, sino otra magnitud no aclarada. Los valores de tokens por segundo y TTFT sí son coherentes entre sí.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni para esta conversión ni comparados con alternativas.

## Requisitos de hardware

- Requisito de plataforma: Apple Silicon (M1 o posterior). Los pesos en formato MLX no se ejecutan en GPU NVIDIA ni AMD, ni con transformers, vLLM o TGI de forma directa.
- Peso de los pesos en disco: 1,5 GB en la variante de 8 bits; aproximadamente 0,8 GB en 4 bits y 3,1 GB en 16 bits.
- Memoria estimada para inferencia (cálculo a partir del número de parámetros, más caché KV y sobrecarga del runtime): en torno a 1,8-2,2 GB en 8 bits, 1,2-1,5 GB en 4 bits y 3,5-4 GB en 16 bits.
- Recomendaciones del autor por equipo: 4 bits para M1/M2 con 8 GB; 8 bits para M1/M2 Pro o Max con 16-32 GB; 16 bits para M2/M3/M4 Ultra con 64 GB o más.
- Cabe en GPU de consumo en el sentido de que cabe en un Mac portátil, pero no en tarjetas NVIDIA tipo RTX 4090 con este formato: sería necesaria otra conversión (GGUF o safetensors estándar).
- Opciones de despliegue: `mlx_lm.chat` (CLI interactiva), `mlx_lm.generate` (CLI de generación) y la API de Python `mlx_lm.load` / `mlx_lm.generate`, con `pip install mlx-lm`. La conversión se reprodujo con mlx-lm 0.31.3.
- Rendimiento medido: 29,3 tokens/s y 34,13 ms hasta el primer token en un M1 de 8 GB con cuantización de 8 bits; 51,35 tokens/s y 19,48 ms en 4 bits.

## Comparativa con modelos similares

Comparación dentro de la propia familia de conversiones, para la que sí hay datos en el repositorio:

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SirSahOl/Qwen2.5-1.5B-Instruct-chat-mlx-8bit | 1,54 B | 8 bits | safetensors MLX | apache-2.0 | 29,3 tok/s y 34,13 ms de TTFT en M1 |
| SirSahOl/Qwen2.5-1.5B-Instruct-chat-mlx-4bit | 1,54 B | 4 bits | safetensors MLX | apache-2.0 | 51,35 tok/s y 19,48 ms de TTFT; recomendado con 8 GB de RAM |
| SirSahOl/Qwen2.5-1.5B-Instruct-chat-mlx-16bit | 1,54 B | 16 bits | safetensors MLX | apache-2.0 | 16,52 tok/s y 60,59 ms de TTFT; sin pérdida por cuantización |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | bf16 original | safetensors transformers | apache-2.0 | Modelo de origen; no ejecutable en MLX sin conversión |

Alternativas de la misma categoría de tamaño (aproximadamente 1-2 mil millones de parámetros, orientadas a instrucciones): Llama 3.2 1B Instruct y SmolLM2 1.7B Instruct. Los datos comparativos concretos de parámetros, contexto, benchmarks y licencias de esas alternativas no están disponibles en la información proporcionada, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Pérdida de calidad por cuantización: el autor indica explícitamente que la conversión introduce una pérdida pequeña respecto al modelo original, mayor cuanto menor es el número de bits.
- Sin benchmarks de calidad publicados: no hay MMLU, HumanEval ni GSM8K para esta conversión, y no se ha comparado con el modelo base en igualdad de condiciones, por lo que la magnitud real de la degradación es desconocida.
- Dependencia de plataforma: requiere Apple Silicon y MLX; no se puede desplegar en servidores con GPU NVIDIA sin reconvertir los pesos.
- Degradación en contexto largo: el autor advierte de caída de rendimiento por encima de 8.000 tokens con cuantizaciones bajas, muy por debajo de la ventana teórica del modelo base.
- Riesgo de alucinación propio de un modelo de 1,54 B de parámetros: la fidelidad factual en preguntas abiertas, cálculos complejos y conocimiento especializado es limitada.
- Fiabilidad del tool calling reducida a este tamaño; en producción conviene validar el esquema de la llamada antes de ejecutarla.
- Idiomas no declarados en el repositorio: aunque el modelo base es multilingüe, no hay evaluación específica de la conversión de 8 bits por idioma.
- Sesgos heredados del corpus de entrenamiento de Qwen, no evaluados ni corregidos en esta conversión.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de redactar esta ficha, sin informes de terceros sobre la calidad de la conversión.
- Inconsistencia documentada en la tabla de rendimiento del autor (la memoria pico disminuye al aumentar los bits), lo que obliga a reinterpretar esos valores antes de usarlos para planificar memoria.
- Licencia apache-2.0: permite uso comercial y modificación, pero no exime de cumplir las condiciones de atribución ni de las obligaciones derivadas de los datos de entrenamiento del modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/Qwen2.5-1.5B-Instruct-chat-mlx-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Variante de 4 bits: https://huggingface.co/SirSahOl/Qwen2.5-1.5B-Instruct-chat-mlx-4bit
- Variante de 16 bits: https://huggingface.co/SirSahOl/Qwen2.5-1.5B-Instruct-chat-mlx-16bit
- Perfil del autor: https://huggingface.co/SirSahOl
- MLX (Apple): https://github.com/ml-explore/mlx
- MLX Foundry, pipeline de conversión: https://github.com/SirSahOl/mlx-foundry
- Búsqueda web: no se encontraron enlaces relevantes. Los únicos resultados devueltos fueron foros deportivos en árabe sin relación con el modelo.
