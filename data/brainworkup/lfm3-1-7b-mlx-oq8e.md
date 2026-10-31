# brainworkup/LFM3-1.7B-MLX-oQ8e

## Resumen

LFM3-1.7B-MLX-oQ8e es una versión cuantizada del modelo LFM3 de 1.7B parámetros, publicada por el usuario brainworkup en Hugging Face. Se trata de una conversión al formato MLX (el framework de Apple para aceleración en chips Apple Silicon) mediante cuantización de precisión mixta con la herramienta oQ (oMLX v0.7.3), que combina pesos en formato afín de 8 bits con grupos de 64 y una pequeña fracción de pesos en BF16.

El objetivo de este repositorio es facilitar la ejecución local del modelo base LFM3-1.7B en ordenadores Mac (M1, M2, M3, M4), reduciendo el tamaño del checkpoint a aproximadamente 1,84 GB manteniendo una calidad cercana al modelo original gracias a la cuantización de 8 bits. Con una media efectiva de 8,502 bits por peso, la degradación esperada respecto a BF16 es mínima, lo que lo hace adecuado para inferencia en dispositivos de consumo sin GPU dedicada.

El modelo base LFM3 corresponde a la familia LFM (Liquid Foundation Models), una arquitectura alternativa al transformer convencional. No obstante, la model card del modelo original no está incluida en la información disponible, por lo que varios datos técnicos (longitud de contexto, idiomas, licencia) no constan en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM (Liquid Foundation Models), detalles no disponibles |
| Parametros totales | 1.728.801.536 (~1,73B) |
| Parametros activos | no disponible (no consta si es MoE; todo indica modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín 8 bits (grupo 64) para el 99,978% de pesos; BF16 para el 0,022%; media efectiva 8,502 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La arquitectura base es LFM3, perteneciente a la familia Liquid Foundation Models. Estos modelos suelen emplear diseños híbridos inspirados en sistemas dinámicos (unidades lineales recurrentes y attention) en lugar del transformer puro, aunque la model card de este repositorio no detalla la configuración exacta, por lo que la información concreta sobre capas, dimensiones o mecanismos de atención no está disponible.

Sobre el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO) no se dispone de datos en la información proporcionada. Lo que sí está documentado es el proceso de cuantización posterior: se utilizó oQ (oMLX v0.7.3), una herramienta de cuantización de precisión mixta que asigna 8 bits afines con grupos de 64 a prácticamente la totalidad de los pesos (1,728B parámetros) y conserva en BF16 una fracción residual (0,022%) presumiblemente por sensibilidad numérica, resultando en un checkpoint de 1,837 GB.

## Capacidades

- Generación de texto: al tratarse de un modelo de lenguaje de 1,7B parámetros, es capaz de completar texto y responder instrucciones (si el modelo base está alineado; no consta).
- Ejecución local en Apple Silicon: gracias al formato MLX, puede correr de forma eficiente en Mac mediante MLX, mlx-lm u Ollama (si existe soporte de conversión).
- Cuantización de alta fidelidad: la cuantización a 8 bits con grupos de 64 minimiza la pérdida de calidad respecto al modelo original en BF16.
- Capacidades de razonamiento, código, matemáticas, visión o audio: no disponible (no documentadas en la información proporcionada).
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistentes de texto locales en Mac: el tamaño de 1,84 GB y el formato MLX permiten ejecutar el modelo completamente en memoria unificada de Apple Silicon, ideal para chatbots privados sin enviar datos a la nube.
- Prototipado rápido de aplicaciones de IA: su tamaño reducido (1,7B parámetros) ofrece respuestas rápidas en portátiles, adecuado para iterar prompts y pipelines antes de escalar a modelos mayores.
- Automatización de tareas ligeras de texto: clasificación, extracción de entidades, resumen de documentos cortos o reescritura de texto, tareas donde un modelo de 1,7B suele ser suficiente.
- Integración en apps macOS/iOS: el formato MLX facilita la incorporación de inferencia on-device en aplicaciones del ecosistema Apple, aprovechando GPU y Neural Engine.
- Generación aumentada con recuperación (RAG) de bajo coste: como modelo generador en un pipeline RAG local con embeddings y base vectorial, manteniendo todo el flujo en el dispositivo.
- Servicios por lotes de bajo consumo: procesado offline de colas de texto (etiquetado, normalización, generación de metadatos) sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta métricas de cuantización (distribución de bits y tamaño de almacenamiento), no de calidad en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM / memoria estimada: aproximadamente 1,9 GB para los pesos en cuantización de 8 bits; con contexto y overhead de runtime, se recomienda disponer de al menos 4 GB de memoria unificada.
- GPU recomendadas: no requiere GPU dedicada; está pensado para Apple Silicon (M1, M2, M3, M4). En entornos con GPU NVIDIA sería necesaria una conversión previa a otro formato (por ejemplo GGUF), no incluida en este repositorio.
- Consumer GPUs: al ser un modelo MLX, su destino natural son Mac de consumo; cabe con holgura en cualquier Mac con 8 GB de RAM o más.
- Opciones de despliegue: mlx-lm (librería Python de MLX), oMLX (herramienta de origen), y potencialmente Ollama o LM Studio si se admite la carga de modelos MLX. No es ejecutable directamente con vLLM, TGI o llama.cpp sin conversión.
- Latencia y throughput: no disponible. En Mac con memoria unificada, un modelo de 1,7B a 8 bits suele ofrecer decodificación interactiva fluida, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Contexto | Licencia |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-oQ8e | 1,73B | MLX (safetensors) | 8 bits (8,502 bits/peso) | no disponible | no disponible |
| Qwen3-1.7B | 1,7B | safetensors / GGUF | BF16 y variantes | 32.768 tokens (hasta 131.072 con YaRN) | Apache 2.0 |
| Llama 3.2 1B | 1,24B | safetensors / GGUF | BF16 y variantes | 128.000 tokens | Licencia Llama 3.2 (restricciones de uso) |
| Gemma 3 1B | ~1B | safetensors / GGUF | BF16 y variantes | 32.000 tokens | Licencia Gemma |

Frente a estas alternativas, la ventaja diferencial de esta ficha es el formato MLX listo para Apple Silicon; en cambio, carece de documentación pública de contexto, licencia y benchmarks, lo que dificulta su evaluación frente a competidores mejor documentados.

## Limitaciones y advertencias

- Documentación escasa: la model card no describe la arquitectura, el contexto, los idiomas ni el uso previsto del modelo base, lo que dificulta evaluar su idoneidad para producción.
- Licencia desconocida: al no constar la licencia, no puede confirmarse si el uso comercial está permitido. Debe verificarse antes de cualquier despliegue.
- Riesgo de alucinación: como todo modelo de lenguaje de tamaño pequeño (1,7B), la fiabilidad factual es limitada y el riesgo de generar contenido incorrecto es alto.
- Sesgos: no se dispone de información sobre sesgos del modelo base; deben asumirse los sesgos típicos de modelos entrenados con datos web a gran escala.
- Ecosistema restringido: el formato MLX limita la ejecución a Apple Silicon; en Linux/Windows con GPU NVIDIA se requiere conversión de formato.
- Repositorio de terceros: se trata de una cuantización comunitaria (0 descargas y 0 likes en el momento de la ficha), sin respaldo del autor original del modelo base.
- Soporte de herramientas: no consta soporte de tool calling, agentes ni modos de razonamiento; no debe asumirse su existencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/brainworkup/LFM3-1.7B-MLX-oQ8e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base LFM3 original: no disponible (no se ha identificado el repositorio fuente en la informacion proporcionada)
- Paper, blog o demo: no disponible
