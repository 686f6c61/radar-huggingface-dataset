# bigmoveintelligent/chatter-27b-v1.1

## Resumen

chatter-27b-v1.1 es un ajuste fino (finetune) del modelo Qwen/Qwen3.5-27B publicado por el usuario bigmoveintelligent en Hugging Face. Se distribuye en precisión FP16 (16-bit) y cuenta con 27.781.427.952 parámetros reales según los ficheros safetensors, lo que lo sitúa en la franja de los 27,8 mil millones de parámetros. La model card es mínima: indica que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, y que el resultado fue "2x más rápido" que un entrenamiento convencional, pero no detalla dataset, número de tokens ni método de alineación.

El pipeline declarado es image-text-to-text, por lo que el modelo está pensado para tareas multimodales de entrada imagen + texto y salida de texto, coherente con la familia Qwen3.5 de la que deriva. El único idioma declarado es el inglés (en) y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual es limitada pero concreta: es un ejemplo temprano de ajuste fino sobre Qwen3.5-27B con un stack ligero (Unsloth + TRL) y con la etiqueta endpoints_compatible, lo que facilita el despliegue en infraestructura compatible con la API de Hugging Face. Sin embargo, no hay benchmarks publicados, la ficha técnica del autor no aporta trazabilidad del entrenamiento y las métricas de adopción son muy bajas (8 descargas, 0 likes), por lo que debe tratarse como un modelo experimental a validar antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El tag qwen3_5 y la librería transformers apuntan a la familia Qwen3.5, pero no se especifica si es transformer denso, MoE o híbrida |
| Parámetros totales | 27.781.427.952 (27,78 B), dato real de los safetensors |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Pesos publicados en FP16 (16-bit). No se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modalidad (pipeline) | image-text-to-text (imagen + texto a texto) |
| Modelo base | Qwen/Qwen3.5-27B |
| Tipo de ajuste | Finetune sobre el modelo base |
| Tamaño del repositorio | 111,1 GB |
| Librería | transformers |
| Fecha de creación / actualización | 28 de septiembre de 2026 / 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de la herencia directa del modelo base Qwen/Qwen3.5-27B y de la librería declarada (transformers). El pipeline image-text-to-text indica que el modelo procesa entradas multimodales de imagen y texto, lo que implica la presencia de un codificador visual conectado al tronco lingüístico, pero la model card no describe ni la disposición de capas, ni el mecanismo de atención, ni la dimensión oculta, ni el tokenizador. Los parámetros totales (27,78 B) son el único dato estructural verificado, procedente de los ficheros de pesos.

En cuanto al entrenamiento, la única información aportada es que se realizó un ajuste fino en 16 bits (FP16) utilizando Unsloth junto con la librería TRL de Hugging Face, con una aceleración declarada de 2x respecto a un entrenamiento equivalente sin Unsloth. No se especifica el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de alineación como RLHF, DPO o SFT supervisado, ni si hubo fases de instrucción o de conversación. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El tag conversational sugiere un ajuste orientado a diálogo, pero no hay evidencia publicada que lo cuantifique.

## Capacidades

- Generación de texto conversacional: el tag conversational y la denominación "chatter" indican un ajuste orientado a diálogo multi-turno.
- Procesamiento de imagen y texto combinados: el pipeline image-text-to-text implica capacidad de recibir una o varias imágenes junto a una instrucción textual y generar una respuesta en texto.
- Comprensión de documentos e imágenes: derivada del punto anterior, aunque no hay evaluación publicada que la respalde.
- Compatibilidad con endpoints: el tag endpoints_compatible sugiere que el modelo puede servirse a través de infraestructura compatible con la API de Hugging Face.
- Idiomas: únicamente inglés declarado. No hay soporte multilingüe documentado.
- Tool calling / function calling: no disponible (no declarado en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Modo de razonamiento explícito (thinking mode), audio o vídeo: no disponible (no declarado).

## Casos de uso

- Asistencia conversacional en inglés con soporte visual: el modelo puede gestionar diálogos en los que el usuario adjunta una captura de pantalla, una foto de un producto o un diagrama y formula preguntas sobre ella. Es adecuado porque combina el pipeline image-text-to-text con un ajuste orientado a conversación, aunque la ventana de contexto no está publicada y debe validarse empíricamente antes de asumir conversaciones largas.
- Extracción de información de documentos escaneados: digitalización de facturas, formularios o albaranes en inglés mediante una instrucción del tipo "extrae los campos X, Y, Z de esta imagen". El modelo recibe la imagen y devuelve texto estructurado; conviene validar la tasa de error campo a campo, ya que no hay métricas publicadas de OCR o de comprensión documental.
- Descripción automática de catálogos de producto: generación de descripciones textuales en inglés a partir de fotografías de producto para comercio electrónico. El ajuste conversacional permite controlar el tono y la longitud mediante instrucciones.
- Soporte técnico de primer nivel con evidencia visual: atención al cliente donde el usuario envía una foto o captura de un error y el modelo propone pasos de resolución. La licencia Apache 2.0 permite integrarlo en un producto comercial sin obligación de publicar modificaciones.
- Preprocesado en pipelines RAG multimodales: uso del modelo como etapa de conversión de imagen a texto descriptivo antes de indexar el contenido en una base vectorial, aprovechando que el pipeline acepta imágenes directamente.
- Análisis de gráficas e informes visuales en inglés: interpretación de dashboards o figuras de artículos científicos con una pregunta en lenguaje natural. Es un caso realista pero sin garantías de fiabilidad numérica, dado que no hay benchmarks de razonamiento visual publicados.
- Prototipado e investigación en ajuste fino: servir como referencia de cómo se comporta un finetune ligero de Qwen3.5-27B hecho con Unsloth y TRL, útil para replicar el flujo de trabajo o comparar hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, y tampoco se aportan comparaciones con el modelo base Qwen/Qwen3.5-27B que permitan estimar la ganancia o pérdida de rendimiento introducida por el ajuste fino.

## Requisitos de hardware

- VRAM para inferencia en FP16: los pesos ocupan aproximadamente 55,6 GB (27,78 B de parámetros a 2 bytes por parámetro). Sumando caché KV y activaciones, se recomienda un mínimo de 64-80 GB de VRAM para servir el modelo tal y como se publica.
- VRAM en cuantización de 8 bits: aproximadamente 28-30 GB de pesos, con margen práctico en torno a 32-36 GB según longitud de contexto y tamaño de lote.
- VRAM en cuantización de 4 bits: aproximadamente 14-16 GB de pesos más sobrecarga, aunque esta ruta no está oficialmente publicada y requeriría cuantizar el modelo por cuenta propia.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para FP16 sin fragmentar; configuraciones multi-GPU (por ejemplo, 2 x A6000 48 GB o 2 x L40S 48 GB) para repartir pesos; RTX 4090 / RTX 5090 de 24 GB solo viables con cuantización de 4 bits y contextos cortos.
- Cabe en GPU de consumo: únicamente con cuantización agresiva (4 bits) y siempre que se acepte pérdida de precisión no evaluada; en FP16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag de la ficha) y cualquier servidor compatible con endpoints de Hugging Face (tag endpoints_compatible, lo que apunta a vLLM u otros motores con API compatible). No hay ficheros GGUF publicados, por lo que Ollama y llama.cpp requerirían una conversión previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos disponibles solo permiten comparar el finetune con su propio modelo base. Para el resto de alternativas de la misma franja de tamaño (27-32 B) no hay información en el material proporcionado.

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chatter-27b-v1.1 | 27,78 B (FP16) | No disponible | Imagen + texto a texto | Apache 2.0 | safetensors en Hugging Face |
| Qwen/Qwen3.5-27B (base) | No disponible en esta ficha | No disponible | No disponible | No disponible | Hugging Face |
| Otras alternativas de ~27-32 B | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Idiomas: solo se declara inglés. Cualquier uso en castellano u otros idiomas no tiene soporte documentado y puede degradar notablemente la calidad.
- Falta de evaluación: no hay benchmarks ni métricas de calidad, seguridad o alucinación. Es imposible estimar si el finetune mejora o degrada el rendimiento del modelo base.
- Trazabilidad del entrenamiento inexistente: se desconoce el dataset, el número de tokens, la composición lingüística y si se aplicaron filtros de seguridad. Esto dificulta auditar sesgos y comportamientos indeseados.
- Riesgo de alucinación: inherente a los modelos generativos y no mitigado explícitamente en la información disponible. En tareas de extracción de datos a partir de imágenes el riesgo es especialmente relevante.
- Adopción mínima: 8 descargas y 0 likes en el momento de la consulta. No existe validación por parte de la comunidad ni informes de terceros sobre su comportamiento.
- Ventana de contexto desconocida: no se puede planificar el diseño de aplicaciones que dependan de conversaciones largas o documentos extensos sin medirla previamente.
- Coherencia de la ficha: el pipeline declarado (image-text-to-text) es multimodal, mientras que la model card se limita a describir un "finetuned 16-bit model" sin detallar el componente visual. Conviene verificar la tokenización y el preprocesado de imágenes antes de integrarlo.
- Licencia permisiva con caveats prácticos: Apache 2.0 permite uso comercial, redistribución y modificación sin obligaciones de copyleft, pero no exime de cumplir la licencia del modelo base Qwen/Qwen3.5-27B, que debe verificarse por separado.
- Tamaño del repositorio: 111,1 GB, muy superior a los ~55,6 GB que ocuparían solo los pesos en FP16, lo que puede implicar ficheros adicionales, duplicados o estados de optimizador. Es necesario revisar el contenido antes de descargarlo en entornos con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bigmoveintelligent/chatter-27b-v1.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
