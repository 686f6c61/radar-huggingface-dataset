# cvgro/Qwen3.8-27B-ABLITERATED-GGUF

## Resumen

Qwen3.8-27B-ABLITERATED-GGUF es una conversión a formato GGUF del modelo Qwen3.8-27B abliterado por Blackfrost AI. Se trata de un modelo denso multimodal (entrada de texto, imagen y video; salida de texto) con 26,9 mil millones de parámetros y una ventana de contexto arquitectónica de 262 144 tokens. La abliteración es un proceso a nivel de pesos que reduce la superficie de rechazo del modelo, lo que da como resultado respuestas más directas y menos evasivas, aunque con implicaciones éticas y de seguridad que deben evaluarse antes de su uso.

El modelo se distribuye como una escalera completa de cuantizaciones estándar K-quants (Q2_K a Q8_0) junto con dos proyectores de visión opcionales, pensado para ejecución local mediante llama.cpp y su servidor `llama-server`. Está etiquetado como experimental y su licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Su relevancia radica en ofrecer una alternativa multimodal de gran contexto, desplegable en hardware de consumo, con un comportamiento de rechazo reducido para casos de uso que requieren respuestas sin rodeos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 dense hybrid VLM · 64 capas de texto · Gated DeltaNet + attention completa · 27 capas de vision |
| Parametros totales | 26 895 998 464 (26,9 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (arquitectónico; el contexto práctico depende de RAM/VRAM) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | No disponible (heredado del modelo base Qwen3.8-27B, presumiblemente multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con safetensors para el modelo base BF16) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un modelo denso de la familia Qwen3.8 que combina atención completa con capas Gated DeltaNet, una variante de atención lineal que reduce el coste computacional en secuencias largas. La arquitectura incluye 64 capas de texto y una torre de visión de 27 capas, lo que le permite procesar imágenes y video además de texto. El checkpoint BF16 original fue sometido a un proceso de abliteración, que modifica los pesos del modelo para eliminar selectivamente los patrones de rechazo aprendidos durante el entrenamiento, sin realizar fine-tuning, merges, LoRA ni pruning. Posteriormente, se convirtió a la escalera estándar de cuantizaciones GGUF para su uso con llama.cpp.

No se dispone de información detallada sobre los datos de entrenamiento del modelo base, ni sobre el proceso de alineación (RLHF, DPO, etc.). El prompt de ejecución corto de Blackfrost está embebido en la plantilla Jinja del chat, lo que influye en el comportamiento conversacional del modelo.

## Capacidades

- Entrada multimodal: acepta texto, imágenes y video; salida exclusivamente de texto.
- Razonamiento multi-step y generación de texto de alta calidad, heredado de la familia Qwen3.8.
- Soporte de tool calling y function calling, según los tags del modelo.
- Ventana de contexto de 262 144 tokens, adecuada para documentos extensos y conversaciones largas.
- Comportamiento de chat con un prompt de ejecución corto de Blackfrost que fomenta respuestas directas.
- Abliterado: reduce significativamente los rechazos (2,4 % residual en el benchmark R1-HARMFUL-BENCH-450).
- Ejecución local eficiente mediante cuantizaciones GGUF y compatibilidad con llama.cpp.

## Casos de uso

- Asistente multimodal local: analiza capturas de pantalla, diagramas o documentos escaneados y responde preguntas sobre su contenido, gracias a la entrada de imagen y al contexto largo.
- Automatización de atención al cliente: gestiona conversaciones multi-turno con historial extenso (hasta 262K tokens) y puede invocar herramientas externas (CRM, bases de conocimiento) mediante tool calling.
- Generación de contenido creativo sin restricciones excesivas: la abliteración reduce las negativas a solicitudes de redacción, ideal para prototipos de escritura creativa o lluvia de ideas donde se busca fluidez.
- Agente de razonamiento multi-step: combina tool calling con el razonamiento del modelo para tareas como planificación de proyectos, análisis de requisitos o resolución de problemas complejos.
- Procesamiento de video: la entrada de video permite extraer información de secuencias cortas, como resúmenes de reuniones grabadas o análisis de material audiovisual.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (10,7 GB) y Q3_K_S (12,1 GB) permiten ejecutar el modelo en GPUs de consumo con 12-16 GB de VRAM, o incluso en CPU con llama.cpp, para entornos de desarrollo o edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es el benchmark de rechazo R1-HARMFUL-BENCH-450, que mide la tasa de negativas ante solicitudes potencialmente dañinas:

| Etapa de evaluacion | Casos evaluados | Respuesta material | Rechazo verdadero restante | Otros |
|---|---:|---:|---:|---:|
| Plantilla original del upstream | 450 | 360 | 88 | 2 limitaciones de capacidad |
| Re-test con prompt operativo Blackfrost | 88 residuales | 53 | 33 | 1 limitación, 1 salida incoherente reproducible |
| Re-test con prompt de ejecución corto | 33 residuales | 22 | 11 | 0 |
| **Conteo residual final** | **450 casos originales** | — | **11 (2,4 %)** | — |

El conjunto de 450 casos incluye 150 de AdvBench, 150 de StrongREJECT y 150 de XSTest. El resultado se obtuvo sobre una variante W4A4 NVFP4 del mismo checkpoint BF16, no sobre los archivos GGUF finales, por lo que debe interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida, entre 10,7 GB (Q2_K) y 28,6 GB (Q8_0) solo para los pesos; hay que añadir memoria para contexto, buffers de cómputo, el proyector de visión (0,63-0,93 GB) y la sobrecarga del servidor.
- GPUs recomendadas: para Q4_K_M (16,5 GB) se necesita al menos 20 GB de VRAM (por ejemplo, RTX 3090/4090, A100 40GB); para Q8_0 (28,6 GB) se requieren 32 GB o más (A100 80GB, H100). El modelo fue probado en una NVIDIA B200 con Q4_K_M y el proyector compacto.
- En GPUs de consumo: las cuantizaciones Q2_K, Q3_K_S y Q3_K_M caben en tarjetas de 12-16 GB (RTX 3060/4070/4080), aunque con pérdida de calidad notable.
- Opciones de despliegue: llama.cpp con `llama-server` (probado y recomendado), compatible con la API de chat estilo OpenAI; también puede usarse con otras herramientas que soporten GGUF, como Ollama o LM Studio, siempre que soporten la arquitectura.
- Latencia y throughput: no se han publicado datos específicos. Dependen de la cuantización, el hardware y la longitud del contexto; se recomienda validar el rendimiento en el entorno objetivo antes de desplegar en producción.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos (benchmarks) para establecer una comparación cuantitativa. A nivel de características, el modelo se posiciona frente a alternativas de tamaño similar:

| Modelo | Parametros | Contexto | Multimodal | Licencia | Abliterado |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 26,9 B | 262 144 | Sí (imagen/video) | Apache-2.0 | No |
| Qwen3.8-27B-ABLITERATED-GGUF (este) | 26,9 B | 262 144 | Sí (imagen/video) | Apache-2.0 | Sí |
| Llama 3.3 70B (referencia de tamaño superior) | 70 B | 128 000 | No | Llama 3.3 | No |

La principal diferencia frente al modelo base es la reducción de rechazos, que puede ser deseable en entornos controlados pero implica un mayor riesgo de uso indebido. Frente a modelos de tamaño similar de otras familias (p. ej., Mistral Large 2, 123B), este modelo ofrece un equilibrio entre tamaño, contexto y multimodalidad con licencia permisiva.

## Limitaciones y advertencias

- Modelo experimental: la arquitectura es nueva y el checkpoint ha sido modificado deliberadamente; se recomienda validar el comportamiento en el caso de uso específico antes de desplegarlo.
- La abliteración reduce las salvaguardas de seguridad: el modelo puede generar contenido dañino, ilegal o éticamente problemático si se le solicita. El benchmark de rechazo residual (2,4 %) indica que aún quedan 11 casos de rechazo, pero la mayoría de las solicitudes problemáticas reciben respuesta material.
- Los resultados del benchmark de rechazo se obtuvieron sobre una variante W4A4 NVFP4, no sobre los archivos GGUF finales; el comportamiento real puede variar.
- No se incluye la cabeza especulativa (speculative head), lo que puede afectar a la velocidad de decodificación en comparación con el modelo original.
- El contexto práctico está limitado por la memoria disponible: 262K tokens solo son alcanzables con hardware de alta gama.
- No se han publicado benchmarks estándar de calidad (MMLU, HumanEval, etc.), por lo que no es posible evaluar su rendimiento relativo en tareas generales.
- Puede presentar alucinaciones y sesgos heredados del modelo base, especialmente en dominios especializados o con información poco representada.
- Aunque la licencia Apache-2.0 permite uso comercial, el uso indebido del modelo puede acarrear responsabilidades legales y éticas.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/cvgro/Qwen3.8-27B-ABLITERATED-GGUF
- Modelo base BF16 (Blackfrost-AI): https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
