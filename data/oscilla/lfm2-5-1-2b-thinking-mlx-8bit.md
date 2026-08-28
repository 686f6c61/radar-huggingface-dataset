# Oscilla/LFM2.5-1.2B-Thinking-mlx-8Bit

## Resumen

Oscilla/LFM2.5-1.2B-Thinking-mlx-8Bit es una conversión al formato MLX con cuantización de 8 bits del modelo LFM2.5-1.2B-Thinking, desarrollado originalmente por Liquid AI. Este modelo está diseñado para razonamiento avanzado en dispositivos de borde (edge), con capacidades de cadena de pensamiento (chain-of-thought) que le permiten resolver problemas de matemáticas, lógica y razonamiento multi-paso. La conversión MLX permite ejecutarlo de forma eficiente en hardware de Apple Silicon, ocupando aproximadamente 1,2 GB en disco y cabiendo en menos de 900 MB de memoria en un teléfono, según las afirmaciones de Liquid AI.

El modelo base declara 1,17 mil millones de parámetros, aunque el archivo safetensors de este repositorio muestra 329,25 millones, una discrepancia que podría deberse a un error en la conversión o a una poda no documentada. La arquitectura es híbrida, heredada de la familia LFM2, combinando mecanismos de atención con capas de espacio de estados (SSM), lo que permite un equilibrio entre calidad y eficiencia computacional. Soporta ocho idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano y español) y está pensado para aplicaciones conversacionales y de razonamiento en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención + SSM, basada en LFM2.5) |
| Parametros totales | 1,17 B (declarados por Liquid AI); 329,25 M (según safetensors del repo) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | lfm1.0 (licencia propia de Liquid AI, consultar términos) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

LFM2.5-1.2B-Thinking se basa en la arquitectura híbrida de la familia LFM2, que combina capas de atención tradicional con bloques de espacio de estados (SSM) para reducir el coste computacional manteniendo la capacidad de modelado de dependencias largas. El modelo fue preentrenado con un corpus multilingüe y posteriormente afinado mediante aprendizaje por refuerzo (RL) para optimizar la generación de cadenas de razonamiento explícitas antes de dar la respuesta final. Esta técnica de entrenamiento, similar a la usada en modelos como OpenAI o1, mejora el rendimiento en tareas que requieren varios pasos lógicos, aunque no se han publicado detalles sobre el volumen de tokens de entrenamiento ni la composición exacta del dataset.

La conversión a MLX realizada por Oscilla utiliza la librería mlx-lm versión 0.31.2, que transforma los pesos originales a un formato optimizado para Apple Silicon con cuantización de 8 bits. Este proceso no modifica la arquitectura subyacente, pero reduce el tamaño en memoria y acelera la inferencia en hardware de Apple.

## Capacidades

- Razonamiento con cadena de pensamiento: genera explicaciones intermedias antes de ofrecer la respuesta final, mejorando la precisión en problemas de matemáticas y lógica.
- Resolución de problemas multi-paso: capaz de descomponer tareas complejas en pasos más pequeños y razonar sobre ellos secuencialmente.
- Generación de texto conversacional: mantiene diálogos coherentes en los ocho idiomas soportados.
- Comprensión multilingüe: entrenado en inglés, árabe, chino, francés, alemán, japonés, coreano y español, lo que permite su uso en aplicaciones globales.
- Inferencia en dispositivos de borde: diseñado para ejecutarse en teléfonos, tablets y ordenadores portátiles con recursos limitados.
- Compatibilidad con el ecosistema MLX: integración directa con mlx-lm para Python, lo que facilita su despliegue en entornos Apple.

No se ha confirmado soporte para tool calling, function calling, agentes autónomos ni capacidades multimodales (visión, audio) en la información disponible.

## Casos de uso

- Asistentes personales offline: al ejecutarse en un teléfono sin conexión, puede gestionar consultas de calendario, recordatorios o preguntas factuales con razonamiento básico, sin depender de servidores externos.
- Tutoría educativa en matemáticas: un estudiante puede plantear problemas de álgebra o geometría y recibir una explicación paso a paso, gracias a su capacidad de cadena de pensamiento.
- Chatbots multilingües para atención al cliente: empresas con usuarios en varios países pueden desplegarlo en dispositivos locales para responder preguntas frecuentes en ocho idiomas, reduciendo la latencia y los costes de infraestructura.
- Procesamiento de lenguaje natural en entornos con privacidad estricta: al ser un modelo local, es adecuado para sectores como salud o banca donde los datos no pueden salir del dispositivo.
- Generación de resúmenes y análisis de texto en dispositivos móviles: puede condensar artículos o correos electrónicos en el propio terminal, sin necesidad de enviar contenido a la nube.
- Prototipado rápido de aplicaciones de razonamiento: los desarrolladores pueden integrarlo en pruebas de concepto para validar ideas de productos que requieran lógica simbólica o toma de decisiones, gracias a su pequeño tamaño y facilidad de despliegue con MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de este repositorio ni los resultados de búsqueda web incluyen métricas cuantitativas como MMLU, HumanEval o GSM8K. Se recomienda consultar la documentación oficial de Liquid AI para obtener datos de rendimiento comparativos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB en cuantización de 8 bits, lo que permite ejecutarlo en dispositivos con 2 GB de RAM o más.
- GPU recomendadas: diseñado para Apple Silicon (M1, M2, M3 y superiores) usando MLX. También puede ejecutarse en GPUs NVIDIA con transformers, aunque no es el objetivo principal de esta conversión.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier Mac con al menos 8 GB de RAM unificada. En tarjetas NVIDIA como RTX 3060 o superiores también es viable usando el formato safetensors original.
- Opciones de despliegue: mlx-lm para Apple, transformers para GPU NVIDIA, y posiblemente Ollama (existe una versión en la biblioteca de Ollama para el modelo base).
- Latencia y throughput: no se han publicado cifras concretas, pero al ser un modelo de ~1,2 B en 8 bits, se espera una latencia de decenas de milisegundos por token en hardware moderno de Apple.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| LFM2.5-1.2B-Thinking (este) | 1,17 B | no disponible | Razonamiento con CoT | lfm1.0 |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 K | Instrucción general | Apache 2.0 |
| Llama-3.2-1B | 1,23 B | 128 K | Instrucción general | Llama 3.2 |
| SmolLM2-1.7B | 1,71 B | 8 K | Instrucción general | Apache 2.0 |

No se dispone de datos de benchmarks para comparar el rendimiento real. LFM2.5 destaca por su especialización en razonamiento, mientras que los otros modelos son de propósito general. La licencia lfm1.0 puede imponer restricciones comerciales adicionales frente a las licencias Apache o Llama.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todo modelo pequeño, puede generar información incorrecta o inventada, especialmente en temas poco representados en sus datos de entrenamiento. La cadena de pensamiento no garantiza exactitud.
- Limitaciones de contexto: no se ha especificado la longitud máxima de contexto, lo que dificulta planificar aplicaciones que requieran ventanas largas.
- Restricciones de licencia: la licencia lfm1.0 es propia de Liquid AI; es necesario revisar sus términos para uso comercial, ya que puede incluir cláusulas de atribución o limitaciones de redistribución.
- Discrepancia de parámetros: el safetensors de este repositorio muestra 329 M de parámetros, frente a los 1,17 B declarados por Liquid AI. Esto podría indicar un error de conversión o una poda no documentada; se recomienda verificar la integridad del modelo antes de usarlo en producción.
- Dependencia de MLX: esta conversión está optimizada para Apple Silicon; su uso en otras plataformas requerirá reconvertir los pesos al formato original.
- Sin soporte multimodal: solo procesa texto, no imágenes ni audio.
- Riesgo de sobreajuste al razonamiento: al estar entrenado específicamente para CoT, puede mostrar respuestas excesivamente verbosas en tareas simples.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/Oscilla/LFM2.5-1.2B-Thinking-mlx-8Bit
- Modelo base original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Blog de Liquid AI sobre LFM2.5-1.2B-Thinking: https://www.liquid.ai/blog/lfm2-5-1-2b-thinking-on-device-reasoning-under-1gb
- Documentación oficial de Liquid AI para este modelo: https://docs.liquid.ai/lfm/models/lfm25-1.2b-thinking
- Página en Ollama: https://ollama.com/library/lfm2.5-thinking:1.2b
- Conversión MLX alternativa de la comunidad: https://huggingface.co/mlx-community/LFM2.5-1.2B-Thinking-8bit
- Otra conversión MLX: https://huggingface.co/machinadeusex/LFM2.5-1.2B-Thinking-MLX-8bit
