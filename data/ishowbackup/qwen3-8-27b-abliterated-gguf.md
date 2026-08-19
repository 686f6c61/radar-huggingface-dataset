# Ishowbackup/Qwen3.8-27B-ABLITERATED-GGUF

## Resumen

Qwen3.8-27B-ABLITERATED-GGUF es una conversión a formato GGUF del modelo Qwen3.8-27B abliterado por Blackfrost, publicada por el usuario Ishowbackup para su ejecución local mediante llama.cpp. El modelo original, Qwen/Qwen3.8-27B, es un VLM denso híbrido de aproximadamente 27.000 millones de parámetros con arquitectura Gated DeltaNet y atención completa, que admite entrada de texto, imagen y vídeo, y salida de texto. La versión abliterada reduce la superficie de rechazo del modelo mediante una modificación a nivel de pesos, sin fine-tuning ni pruning, lo que da como resultado un comportamiento de asistencia más permisivo. Esta versión GGUF incluye la escalera completa de cuantizaciones estándar (Q2_K a Q8_0), dos proyectores de visión y sidecars para decodificación especulativa MTP, lo que la hace adecuada para despliegues locales con recursos limitados. El modelo tiene una longitud de contexto arquitectónica de 262.144 tokens y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 dense hybrid VLM: 64 capas de texto con Gated DeltaNet + atencion completa, torre de vision de 27 capas |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (arquitectonica) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el padre BF16 usa safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.8, un VLM denso hibrido que combina Gated DeltaNet con atencion completa en sus 64 capas de texto, junto con una torre de vision de 27 capas para procesar imagenes y video. La version abliterada de Blackfrost modifica los pesos del modelo original (Qwen/Qwen3.8-27B) para reducir la probabilidad de respuestas de rechazo, manteniendo el resto de capacidades intactas. No se ha realizado fine-tuning, pruning ni fusion de modelos. El proceso de abliteracion se aplico sobre el checkpoint BF16, que posteriormente se convirtio a la escalera GGUF. No se dispone de informacion sobre los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO) en la documentacion proporcionada. Ademas, se incluyen sidecars MTP (BF16, Q8_0 y Q4_0) para decodificacion especulativa, que permiten acelerar la generacion sin modificar los cuantos de texto.

## Capacidades

- Generacion de texto multimodal: acepta entradas de texto, imagen y video, y produce salidas de texto.
- Razonamiento y tool calling: el modelo soporta llamadas a herramientas y razonamiento multi-paso, segun las etiquetas del repositorio.
- Contexto largo: ventana de 262.144 tokens, adecuada para documentos extensos o conversaciones prolongadas.
- Decodificacion especulativa MTP: sidecars opcionales (BF16, Q8_0, Q4_0) para acelerar la inferencia.
- Comportamiento de chat personalizado: prompt de ejecucion corto de Blackfrost embebido en la plantilla Jinja por defecto.
- Reduccion de rechazos: benchmark R1-HARMFUL-BENCH-450 con 11 refusals residuales de 450 casos (2,4%).

## Casos de uso

- Inferencia local multimodal en ordenadores de sobremesa: con la cuantizacion Q4_K_M (16,5 GB) se puede ejecutar en GPUs con 24 GB de VRAM, como una RTX 4090, para tareas de analisis de imagenes y video sin conexion a la nube.
- Asistentes conversacionales con contexto extenso: gracias a los 262.144 tokens de contexto, puede mantener conversaciones largas o procesar documentos completos, por ejemplo en atencion al cliente o resumen de informes.
- Automatizacion de agentes con tool calling: el soporte de llamada a herramientas permite integrarlo en pipelines de automatizacion que requieren razonamiento multi-paso, como consultas a bases de datos o APIs.
- Investigacion en seguridad de IA: el benchmark de rechazo y la naturaleza abliterada lo convierten en un objeto de estudio para analizar el equilibrio entre utilidad y seguridad en modelos de lenguaje.
- Prototipado rapido de aplicaciones de vision por computadora: con los proyectores de vision incluidos, se puede experimentar con tareas de captioning o respuesta a preguntas visuales en entornos de desarrollo.
- Despliegue en entornos con memoria limitada: las cuantizaciones pequenas como Q2_K (10,7 GB) o Q3_K_M (13,3 GB) permiten ejecutar el modelo en GPUs con 12-16 GB de VRAM, como una RTX 3060 o 4070, para pruebas o aplicaciones de baja demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento proporcionado es el benchmark de rechazo R1-HARMFUL-BENCH-450, que se resume a continuacion:

| Etapa de evaluacion | Casos evaluados | Respuesta material | Rechazo verdadero restante | Otros |
|---|---|---|---:|---:|---:|
| Plantilla original upstream | 450 | 360 | 88 | 2 limitaciones de capacidad |
| Re-test con prompt operacional de Blackfrost | 88 residuales | 53 | 33 | 1 limitacion, 1 salida incoherente reproducible |
| Re-test con prompt de ejecucion corto | 33 residuales | 22 | 11 | 0 |
| **Recuento residual final** | **450 casos originales** | — | **11 (2,4%)** | — |

## Requisitos de hardware

- Tamanos de archivo por cuantizacion: Q2_K 10,7 GB, Q3_K_S 12,1 GB, Q3_K_M 13,3 GB, Q4_K_S 15,6 GB, Q4_K_M 16,5 GB, Q5_K_S 18,7 GB, Q5_K_M 19,2 GB, Q6_K 22,1 GB, Q8_0 28,6 GB.
- VRAM estimada: para Q4_K_M (16,5 GB) se necesitan al menos 20 GB de VRAM considerando contexto y buffers; para Q2_K (10,7 GB) unos 14 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M; A100/H100 (40-80 GB) para Q8_0 o contexto largo; RTX 3060/4070 (12-16 GB) para cuantizaciones pequenas.
- Opciones de despliegue: llama.cpp (principal), Ollama (si se integra), servidores compatibles con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria. La comparacion principal se establece con el modelo base Qwen/Qwen3.8-27B, del que difiere unicamente en la modificacion de pesos (abliteracion) y el formato de distribucion (GGUF). El padre BF16 (Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16) es la version sin cuantizar del mismo checkpoint. No se han identificado alternativas externas con datos publicos comparables en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Diferencia clave |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B | ~27B | 262.144 | Apache-2.0 | safetensors | Modelo base original |
| Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16 | ~27B | 262.144 | Apache-2.0 | safetensors | Version abliterada sin cuantizar |
| Ishowbackup/Qwen3.8-27B-ABLITERATED-GGUF | ~27B | 262.144 | Apache-2.0 | GGUF | Version abliterada cuantizada para llama.cpp |

## Limitaciones y advertencias

- Modelo experimental: la documentacion advierte que es una arquitectura nueva y un checkpoint modificado deliberadamente; se debe validar en el entorno de produccion antes de desplegar.
- Abliteracion: la reduccion de rechazos puede aumentar el riesgo de generar contenido danino o inapropiado. El benchmark muestra 11 casos residuales de 450, pero no es una garantia de seguridad.
- Riesgo de alucinacion: no se ha evaluado especificamente; como todo LLM, puede producir informacion falsa o inventada.
- Contexto practico limitado: aunque la ventana arquitectonica es de 262.144 tokens, el contexto real depende de la memoria RAM/VRAM disponible y de la concurrencia.
- Idiomas: no se especifican los idiomas soportados; se asume que hereda las capacidades del modelo base, pero no esta documentado.
- Licencia: Apache-2.0 permite uso comercial, pero al ser una modificacion, se debe mantener la atribucion correspondiente.
- No es un fine-tune: la abliteracion es una modificacion de pesos que puede tener efectos impredecibles en tareas especificas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ishowbackup/Qwen3.8-27B-ABLITERATED-GGUF
- Modelo padre (BF16): https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
