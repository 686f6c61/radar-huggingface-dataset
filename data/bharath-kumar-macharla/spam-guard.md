# bharath-kumar-macharla/Spam-guard

## Resumen

Spam-guard es un modelo de lenguaje de 1.500 millones de parametros creado mediante ajuste fino del modelo Qwen/Qwen2.5-1.5B-Instruct con la librería TRL, utilizando un entrenamiento de tipo SFT (supervised fine-tuning). La información publicada en Hugging Face no especifica el conjunto de datos ni la tarea concreta de entrenamiento, aunque el nombre del modelo y los proyectos del autor apuntan a la detección de contenido no deseado y estafas en mensajes de texto.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con una ventana de contexto de 32.768 tokens y pesos en formato safetensors. Publicado por bharath-kumar-macharla con una documentación muy escasa y sin descargas ni usos documentados, su relevancia radica en ser un posible ejemplo de ajuste fino para tareas de clasificación de spam dentro del ecosistema de Qwen, aunque su capacidad real no puede verificarse con los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5) |
| Parametros totales | 1.5 mil millones (1.5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible en la informacion del modelo; el modelo base Qwen2.5 soporta principalmente chino e ingles |
| Licencia | No disponible (campo "licence: license" sin especificar) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Spam-guard es un ajuste fino del modelo instruct de Qwen2.5 con 1.5B de parametros, que mantiene la arquitectura original: un transformer causal decoder-only con atención de causalidad y normalización pre-RMSNorm. El entrenamiento se realizó con TRL 1.12.0, Transformers 5.16.1, PyTorch 2.11.0, Datasets 5.0.1 y Tokenizers 0.23.1, y consistió únicamente en SFT, según la model card. No se documentan el tamaño del dataset, el número de tokens, la composición de los datos de entrenamiento ni la aplicación de técnicas de RLHF o DPO. El repositorio muestra un tamaño de 0.0 GB, lo que sugiere que los pesos del modelo podrían no estar completos en el repositorio.

## Capacidades

- Generación de texto siguiendo instrucciones: la model card muestra un ejemplo de uso con `pipeline("text-generation")` y una plantilla de chat, lo que indica compatibilidad básica con el formato instruct.
- Detección de spam o estafas: no existe una confirmación explícita en la documentación, pero el nombre del modelo y el portfolio del autor, que describe el proyecto Scam Guard AI, sugieren un propósito orientado al análisis de mensajes y enlaces para predecir probabilidad de estafa.
- No se han documentado capacidades de tool calling, uso de agentes, decodificación especulativa, procesamiento de visión o audio.
- El modelo no presenta soporte nativo de clasificación de texto; se espera que se utilice mediante instrucciones en un pipeline de generación.
- El ejemplo de quick start de la model card no guarda relación con tareas de spam, lo que indica que la documentación es genérica y posiblemente generada de forma automática.

## Casos de uso

- Filtrado de correo electrónico no deseado: el modelo podría emplearse para analizar el contenido de mensajes y generar una valoración de spam en un pipeline de clasificación, siempre que se le instruya con un prompt adecuado. No se dispone de evidencia de que esta funcionalidad esté implementada.
- Detección de estafas en mensajería instantánea: gracias a su ventana de contexto de 32.768 tokens, puede procesar conversaciones largas y contextualizar mensajes para emitir alertas sobre posibles fraudes o intentos de phishing.
- Moderación de comentarios en foros y redes sociales: el modelo puede utilizarse para filtrar publicaciones que contengan enlaces sospechosos o patrones de spam, generando una etiqueta o un texto de advertencia para los moderadores.
- Análisis de enlaces sospechosos: según el proyecto Scam Guard AI del autor, el modelo está pensado para analizar mensajes y URLs, y predecir la probabilidad de que un enlace sea peligroso.
- Clasificación de tickets de soporte: en entornos de atención al cliente, puede ayudar a identificar solicitudes fraudulentas o mensajes de spam entre los tickets recibidos, facilitando la priorización y la respuesta automatizada.
- Generación de alertas de seguridad para usuarios finales: el modelo puede producir mensajes de aviso automáticos en aplicaciones de banca o ecommerce, informando al usuario de que un mensaje o enlace presenta características de estafa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones que permitan comparar el rendimiento de este modelo con el de otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16, se requieren aproximadamente 3-4 GB de VRAM. Con cuantización de 4 bits, la estimación baja a 1-2 GB. Estas cifras son orientativas y se basan en el tamaño de parametros, no en mediciones del propio modelo.
- GPU recomendadas: el modelo cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB). Para despliegues de alta concurrencia se pueden usar GPUs de datacenter como A100 o H100.
- Opciones de despliegue: `transformers` (pipelines), `vLLM`, `TGI` para inferencia a escala, y `llama.cpp` u `Ollama` para ejecución en CPU o en entornos con recursos limitados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| bharath-kumar-macharla/Spam-guard | 1.5B | 32.768 | No disponible | Fine-tune sin documentar, repositorio de 0.0 GB |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 | Apache 2.0 | Modelo base generalista, con benchmarks públicos y mayor documentación |
| Otros modelos de spam | No disponible | No disponible | No disponible | No se identificaron comparables en la información disponible |

## Limitaciones y advertencias

- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos ni la distribución de clases sobre la que fue ajustado.
- Riesgo de alucinación: los modelos de 1.5B tienen una mayor tendencia a generar contenido inventado, especialmente si se les pide clasificar sin un prompt bien estructurado.
- Limitaciones de idioma: el modelo base Qwen2.5 está optimizado principalmente para chino e inglés, por lo que su rendimiento en español puede ser inferior y no ha sido validado.
- Restricciones de licencia: la ausencia de una licencia especificada complica el uso comercial y la redistribución del modelo.
- Documentación deficiente: la model card no describe la tarea de entrenamiento ni el dataset, y el ejemplo de uso no coincide con el nombre del modelo.
- Posible ausencia de pesos: el tamaño del repositorio mostrado en Hugging Face es 0.0 GB, lo que puede indicar que los archivos de pesos no están cargados. Es necesario verificar la disponibilidad real del checkpoint antes de intentar descargar o ejecutar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/bharath-kumar-macharla/Spam-guard
- Portfolio del autor (Scam Guard AI): https://my-portfolio-lake-six-42.vercel.app/pages/scamguard.html
- Repositorio GitHub (SpamGuard Pro): https://github.com/Bharath-12205425/SpamGuard
