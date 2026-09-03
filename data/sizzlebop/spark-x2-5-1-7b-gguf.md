# sizzlebop/Spark-X2.5-1.7B-GGUF

## Resumen

Spark-X2.5-1.7B es un modelo de lenguaje compacto de 1.710 millones de parámetros desarrollado por XHToken, diseñado para ofrecer un rendimiento sólido en tareas cotidianas de conversación, escritura, traducción, razonamiento, codificación, uso de herramientas y flujos agénticos. Su arquitectura híbrida combina atención de ventana deslizante con capas de atención completa, lo que permite una longitud de contexto nativa de hasta 1 millón de tokens, una capacidad excepcional para su tamaño. El modelo se distribuye bajo licencia Apache 2.0 y soporta inglés y chino.

El repositorio que nos ocupa, `sizzlebop/Spark-X2.5-1.7B-GGUF`, contiene conversiones del modelo original a formato GGUF en varias cuantizaciones, realizadas por Pink Pixel a partir de los pesos safetensors originales. Estas conversiones permiten ejecutar el modelo en entornos como llama.cpp, Ollama y LM Studio, facilitando su despliegue en hardware variado, desde dispositivos de borde hasta servidores con GPU. La disponibilidad de cuantizaciones desde Q2_K hasta BF16 ofrece flexibilidad para equilibrar calidad y consumo de memoria.

La relevancia de este modelo radica en su combinación de tamaño reducido, contexto extremadamente largo y licencia permisiva, lo que lo convierte en una opción atractiva para desarrolladores que necesitan capacidades de procesamiento de texto extenso en entornos con recursos limitados, sin renunciar a una licencia comercialmente amigable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Spark 2.5 (Spark2_5ForCausalLM), híbrida con sliding-window attention y full attention |
| Parametros totales | 1.707.657.216 (1,71B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 1.048.576 tokens (1M) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido desde safetensors BF16) |

## Arquitectura y entrenamiento

Spark-X2.5-1.7B utiliza una arquitectura transformer híbrida que alterna capas de atención con ventana deslizante (sliding-window attention) y capas de atención completa. Este diseño busca reducir el coste computacional en secuencias largas mientras mantiene la capacidad de capturar dependencias globales. El tamaño del vocabulario es de 131.072 tokens, lo que permite una representación densa de múltiples idiomas.

No se han proporcionado detalles específicos sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La información disponible indica que el modelo se presenta como una familia compacta de propósito general, junto con su variante Spark-X2.5-4B. La conversión a GGUF se realizó a partir de los pesos originales en BF16 mediante una compilación personalizada de llama.cpp con soporte para la arquitectura Spark 2.5.

## Capacidades

- Generación de texto conversacional y de escritura creativa en inglés y chino.
- Razonamiento y resolución de problemas en tareas cotidianas.
- Generación de código y asistencia en programación.
- Traducción entre inglés y chino.
- Uso de herramientas (tool calling) y ejecución de flujos agénticos multi-paso.
- Procesamiento de contextos muy largos (hasta 1M tokens) gracias a su arquitectura híbrida.
- Soporte de plantillas de chat estilo ChatML (`<|im_start|>`, `<|im_end|>`).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de contexto de hasta 1M tokens. Su soporte bilingüe (en/zh) permite atender a usuarios de ambos idiomas sin cambiar de modelo.
- Generación de código en entornos de desarrollo: con capacidad de tool calling, puede integrarse en IDE o pipelines de CI/CD para sugerir implementaciones, revisar código o autocompletar funciones en repositorios de tamaño considerable.
- Traducción de documentos largos: su contexto nativo de 1M tokens permite traducir manuales, contratos o artículos completos de una sola vez, manteniendo coherencia terminológica a lo largo del texto.
- Agentes autónomos para automatización de tareas: al soportar razonamiento multi-paso y uso de herramientas, puede orquestar flujos como extracción de datos, llamadas a APIs o generación de informes en entornos con recursos limitados.
- Asistente de escritura y redacción: adecuado para generar borradores, resumir documentos extensos o reescribir contenido manteniendo el estilo, especialmente en contextos donde se requiere manejar grandes volúmenes de texto de entrada.
- Despliegue en dispositivos de borde: con cuantizaciones como Q4_K_M (1,03 GB) o Q3_K_M (894 MB), el modelo puede ejecutarse en Raspberry Pi, smartphones o mini-PCs mediante llama.cpp u Ollama, ofreciendo capacidades de IA local sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación del modelo menciona un rendimiento "líder entre modelos abiertos" en su categoría, pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas. Se recomienda consultar el repositorio oficial de XHToken para obtener datos actualizados.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - BF16: ~3,2 GB (peso) + overhead de contexto, recomendable 4-6 GB de VRAM.
  - Q8_0: ~1,7 GB, recomendable 2-4 GB de VRAM.
  - Q4_K_M: ~1,0 GB, recomendable 2 GB de VRAM.
  - Q2_K: ~0,75 GB, puede ejecutarse en CPU con RAM suficiente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas (GTX 1650, RTX 3050, etc.). Para BF16 o Q8_0 se recomienda 4 GB o más (RTX 3060, RTX 4060, A10, etc.).
- Es apto para consumer GPU de gama media y baja, así como para dispositivos sin GPU mediante CPU (con mayor latencia).
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), Ollama, LM Studio. También compatible con cualquier cliente que soporte la arquitectura Spark 2.5.
- Latencia y throughput: no se han publicado datos específicos. En una GPU moderna (RTX 4090) se espera una velocidad de decodificación de varias decenas de tokens por segundo con cuantizaciones Q4_K_M o inferiores; en CPU será notablemente menor.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables en la información proporcionada. El modelo compite en la categoría de 1-2B parámetros con opciones como Qwen2.5-1.5B, Llama-3.2-1B o Gemma-2-2B, pero no se han publicado resultados de benchmarks que permitan una comparación objetiva. Se recomienda consultar el leaderboard de llm-stats.com (enlazado abajo) para obtener métricas actualizadas.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La cuantización Q2_K presenta una degradación notable de calidad y solo debe usarse en entornos extremadamente restringidos.
- El contexto de 1M tokens es teórico; en la práctica, la memoria necesaria para el estado de atención crece linealmente con la longitud de la secuencia, por lo que secuencias muy largas requieren hardware con mucha RAM/VRAM.
- La arquitectura Spark 2.5 requiere una versión de llama.cpp con soporte específico; versiones estándar pueden no cargar el modelo.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado principalmente con datos en inglés y chino, puede reflejar sesgos culturales de esos dominios.
- Riesgo de alucinación en tareas de razonamiento complejo o cuando se le pide información factual precisa; se recomienda verificación externa.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución correspondiente.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/sizzlebop/Spark-X2.5-1.7B-GGUF
- Modelo original (safetensors): https://huggingface.co/XHToken/Spark-X2.5-1.7B
- Repositorio oficial de XHToken en GitHub: https://github.com/XHToken/Spark-X2.5
- Página del modelo en Ollama: https://ollama.com/SparkLLM/Spark-X2.5-1.7B
- Leaderboard de modelos LLM: https://llm-stats.com/leaderboards/llm-leaderboard
