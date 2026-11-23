# aisingapore/Qwen-SEA-LION-v5-9B-GGUF

## Resumen
Qwen-SEA-LION-v5-9B-GGUF es la versión cuantizada en formato GGUF del modelo Qwen-SEA-LION-v5-9B, desarrollado por el AI Products Pillar de AI Singapore con financiación del National Research Foundation de Singapur. Forma parte de la familia SEA-LION (Southeast Asian Languages In One Network), una colección de modelos de lenguaje diseñados específicamente para dar cobertura a los idiomas del sudeste asiático, una región tradicionalmente infrarrepresentada en los grandes modelos multilingües.

El modelo es un transformer causal de 9.197.093.888 parámetros (aproximadamente 9B) construido sobre la base de Qwen 3.5-9B, con una ventana de contexto de 262.144 tokens y capacidad multimodal de entrada imagen-texto gracias a un codificador visual independiente que se distribuye como fichero separado. Soporta nueve idiomas: inglés, chino, birmano, indonesio, filipino, malayo, tamil, tailandés y vietnamita.

La relevancia de esta publicación radica en que ofrece los pesos en cuatro niveles de cuantización (F16, Q8_0, Q6_K y Q4_K_M) listos para llama.cpp, lo que permite desplegar un modelo de 9B con contexto de 256K y capacidades de visión en hardware de consumo. La licencia MIT facilita su adopción comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión (basado en Qwen 3.5-9B) |
| Parametros totales | 9.197.093.888 (~9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF F16, Q8_0, Q6_K y Q4_K_M; codificador visual en F16 |
| Idiomas soportados | Inglés, chino, birmano, indonesio, filipino, malayo, tamil, tailandés y vietnamita |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
El modelo es un transformer causal denso de aproximadamente 9B parámetros derivado de Qwen 3.5-9B, al que se añade un codificador visual que permite el procesamiento de entradas imagen-texto. Los ficheros GGUF conservan la cabeza de predicción multi-token (MTP, multi-token prediction) del modelo original, una innovación orientada a la decodificación especulativa y a la aceleración de la generación. El tokenizador y la plantilla de chat se mantienen sin cambios respecto al modelo base.

La información disponible no detalla la composición del dataset de entrenamiento ni el número de tokens utilizados, ya que la model card remite a la ficha del modelo base aisingapore/Qwen-SEA-LION-v5-9B para los detalles de entrenamiento. Tampoco se especifica si hubo fases de RLHF o DPO. La model card indica explícitamente que el modelo no ha sido alineado para seguridad, por lo que los desarrolladores deben aplicar su propio ajuste de seguridad. Las cuantizaciones GGUF no fueron evaluadas de forma independiente; los resultados de evaluación del modelo base están disponibles en su model card y en el SEA-LION Leaderboard.

## Capacidades
- Generación de texto conversacional multi-turno en nueve idiomas del sudeste asiático, además de inglés y chino.
- Razonamiento con modo de pensamiento (thinking) activado por defecto, desactivable mediante `enable_thinking: false` en `chat_template_kwargs`.
- Procesamiento de imágenes (image-text-to-text) mediante el codificador visual separado `mmproj-Qwen-SEA-LION-v5-9B-F16.gguf`.
- Predicción multi-token (MTP) integrada en los pesos, orientada a decodificación especulativa.
- Compatibilidad con la API de chat de OpenAI a través de `llama-server` (endpoints `/v1/chat/completions`).
- Soporte de contexto largo de hasta 262.144 tokens para documentos extensos y conversaciones prolongadas.
- Capacidad multilingüe nativa en birmano, indonesio, filipino, malayo, tamil, tailandés, vietnamita, chino e inglés.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.

## Casos de uso
- Atención al cliente en mercados del sudeste asiático: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, tailandés o vietnamita con una ventana de 262.144 tokens, lo que permite mantener historiales largos y contexto de cuenta sin truncamiento.
- Procesamiento de documentos logísticos y comerciales: con contexto de 256K, puede analizar contratos, conocimientos de embarque o declaraciones de exportación completos y responder preguntas sobre ellos en el idioma local del operador.
- Análisis de imágenes en entornos industriales o comerciales: gracias al codificador visual, puede describir y extraer información de fotografías de producto, etiquetas o documentos escaneados, combinándola con texto.
- Asistentes multilingües para administraciones públicas: cobertura de tamil, birmano y filipino permite atender a ciudadanías lingüísticamente diversas desde un único modelo con licencia MIT.
- Despliegue en hardware de consumo: la cuantización Q4_K_M (5,78 GB) permite ejecutar el modelo en GPU de gama alta para consumidores o incluso en CPU con llama.cpp, facilitando prototipado local sin infraestructura cloud.
- Generación de contenido localizado: redacción de textos de marketing, soporte o documentación adaptados a registros y idiomas regionales, con la opción de desactivar el modo thinking para reducir latencia en tareas simples.
- Investigación en lingüística computacional del sudeste asiático: la licencia MIT y la disponibilidad de pesos GGUF facilitan la experimentación académica y la evaluación comparativa en idiomas de bajos recursos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica que las cuantizaciones GGUF no fueron evaluadas de forma independiente y remite a la ficha del modelo base y al SEA-LION Leaderboard para los resultados del modelo sin cuantizar.

## Requisitos de hardware

| Cuantizacion | Tamano del fichero | VRAM estimada (inferencia) |
|---|---|---|
| Q4_K_M | 5,78 GB | ~6-7 GB |
| Q6_K | 7,56 GB | ~8-9 GB |
| Q8_0 | 9,79 GB | ~10-11 GB |
| F16 | 18,41 GB | ~19-20 GB |
| Codificador visual (F16) | 0,92 GB | ~1 GB adicional |

- GPU recomendadas: RTX 4090 (24 GB) para F16 con contexto largo; RTX 4080/4070 Ti (16 GB) para Q8_0; RTX 4060 Ti (16 GB) o RTX 3060 (12 GB) para Q6_K y Q4_K_M.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones; Q4_K_M es la opción más accesible para tarjetas de 8 GB.
- Despliegue: llama.cpp mediante `llama-server` con `--mmproj` para entrada de imagen y `--jinja` para la plantilla de chat; interfaz web integrada en el puerto 8080; compatible con la API de OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada. El contexto de 262.144 tokens requiere atención al consumo de memoria KV cache, que puede exceder la VRAM disponible en configuraciones de consumo si se usa la ventana completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v5-9B-GGUF | ~9B | 262.144 | Sí | MIT | GGUF |
| Qwen-SEA-LION-v5-9B (base) | ~9B | 262.144 | Sí | MIT | safetensors (BF16) |
| Qwen-SEA-LION-v5-9B-FP8 | ~9B | 262.144 | Sí | MIT | FP8 |
| Qwen-SEA-LION-v5-9B-INT4 | ~9B | 262.144 | Sí | MIT | INT4 |

La información disponible no permite comparar con modelos de otros desarrolladores en cuanto a rendimiento o benchmarks. Las alternativas directas documentadas son las otras variantes de cuantización del mismo modelo base publicadas por AI Singapore.

## Limitaciones y advertencias
- El modelo no ha sido alineado para seguridad; los desarrolladores deben aplicar su propio ajuste de seguridad antes de un despliegue en producción.
- No se ha probado la robustez frente a ataques de prompting adversarial.
- Riesgo de alucinación documentado por el propio autor: puede generar contenido irrelevante o elementos ficticios no fundamentados en el contexto.
- Posibles inconsistencias en las respuestas que requieren validación por parte del usuario.
- La cobertura lingüística se limita a los nueve idiomas declarados; el rendimiento en otras lenguas no está garantizado.
- Las cuantizaciones GGUF no fueron evaluadas de forma independiente, por lo que su calidad puede diferir de la del modelo base.
- El uso del contexto completo de 262.144 tokens puede requerir más VRAM de la disponible en GPU de consumo debido a la caché KV.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero el autor declina toda responsabilidad por daños derivados del uso de los pesos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B-GGUF
- Modelo base: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B
- Variante FP8: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B-FP8
- Variante INT4: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B-INT4
- Colección SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Sitio oficial SEA-LION: https://sea-lion.ai
- Leaderboard SEA-LION: https://leaderboard.sea-lion.ai/
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Modelo Qwen 3.5-9B (base original): https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia MIT: https://mit-license.org/
