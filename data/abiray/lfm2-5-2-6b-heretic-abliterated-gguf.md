# Abiray/LFM2.5-2.6B-Heretic-Abliterated-GGUF

## Resumen

LFM2.5-2.6B-Heretic-Abliterated-GGUF es una serie de cuantizaciones GGUF del modelo LFM2.5-2.6B, desarrollado originalmente por Liquid AI y posteriormente modificado por el usuario Abiray mediante una técnica de "abliteración" (abliteration) que elimina los mecanismos de rechazo y censura del modelo. El resultado es un modelo de 2,69 mil millones de parámetros, denso, con una ventana de contexto de 128 000 tokens, diseñado específicamente para flujos agénticos en dispositivos locales, incluyendo llamada nativa a herramientas y seguimiento de instrucciones multi-paso.

La relevancia de esta variante radica en que ofrece un modelo pequeño, eficiente y sin restricciones de contenido, apto para ejecutarse en hardware de consumo (CPU, GPU de gama media o Apple Silicon) manteniendo una velocidad de inferencia alta (220 tokens por segundo según Liquid AI). La abliteración reduce drásticamente las respuestas de rechazo (de 97/100 a 4/100 en pruebas con 100 prompts explícitos) con una degradación de calidad mínima (KL divergence de 0,0142). Esto lo convierte en una opción atractiva para desarrolladores que necesitan un agente local totalmente controlable, sin las limitaciones de los modelos alineados tradicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (dense) - 30 capas (22 bloques de convolución corta con doble compuerta + 8 capas GQA) |
| Parametros totales | 2,69 mil millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072 tokens (128K) |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_M |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso, polaco |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La arquitectura LFM2.5 es una red densa que combina bloques de convolución corta con doble compuerta (double-gated short convolution) y capas de atención con consulta agrupada (GQA). Esta hibridación permite capturar dependencias locales y globales con un coste computacional reducido, lo que explica su eficiencia en dispositivos con recursos limitados. El modelo base fue entrenado por Liquid AI con un enfoque específico en tareas agénticas: planificación, llamada a herramientas y ejecución de instrucciones complejas en varios pasos. No se han publicado detalles exactos sobre el volumen de tokens de entrenamiento ni sobre el uso de técnicas de alineación como RLHF o DPO en la información disponible.

La variante "Heretic" se obtiene aplicando abliteración, un proceso que identifica y neutraliza las direcciones del espacio residual asociadas a los comportamientos de rechazo. Esto se hace sin modificar los pesos de las capas de razonamiento, por lo que la capacidad cognitiva del modelo se conserva casi intacta. Los resultados reportados por el autor indican una reducción de rechazos del 97% al 4% en un conjunto de 100 prompts explícitos, con una divergencia KL de 0,0142 respecto al modelo original, lo que sugiere una pérdida mínima de calidad.

## Capacidades

- Generación de texto libre y conversación multi-turno con plantilla de chat nativa.
- Llamada nativa a herramientas (tool calling) para integración en agentes autónomos.
- Seguimiento de instrucciones multi-paso y razonamiento encadenado.
- Ventana de contexto de 128K tokens, adecuada para documentos largos o historiales extensos.
- Soporte multilingüe amplio: 16 idiomas, incluyendo español, inglés, chino, japonés, árabe y hindi.
- Comportamiento sin censura tras la abliteración: responde a solicitudes explícitas, controvertidas o hipotéticas sin rechazos automáticos.
- Eficiencia computacional: inferencia a 220 tokens por segundo en hardware consumer (según Liquid AI).
- Compatible con el ecosistema llama.cpp y otras herramientas que soporten GGUF.

## Casos de uso

- Asistentes personales locales sin conexión: el modelo puede ejecutarse en un portátil o en un teléfono, gestionando conversaciones con contexto largo y llamando a herramientas locales (calendario, recordatorios, búsqueda en archivos) sin depender de la nube.
- Agentes de automatización de tareas: gracias a su capacidad de tool calling y razonamiento multi-paso, puede orquestar flujos como envío de correos, gestión de APIs o ejecución de scripts, todo en local.
- Generación de contenido creativo sin filtros: escritores y creadores pueden usarlo para explorar temas sensibles, narrativas explícitas o escenarios hipotéticos sin que el modelo se niegue a responder.
- Procesamiento de documentos largos: su contexto de 128K permite resumir, analizar o extraer información de libros, informes o conversaciones extensas en una sola pasada.
- Desarrollo de chatbots especializados en dominios sensibles (salud mental, educación sexual, asesoría legal) donde las respuestas directas son necesarias y la censura puede ser un obstáculo.
- Pruebas de robustez y evaluación de seguridad: investigadores pueden utilizar esta versión abliterada para estudiar los efectos de la eliminación de guardrails y comparar comportamientos con el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos reportados son los de la abliteración:

| Metrica | Modelo abliterado | Modelo base |
| :--- | :---: | :---: |
| Rechazos (100 prompts explicitos) | 4 / 100 | 97 / 100 |
| Divergencia KL (degradacion de calidad) | 0,0142 | 0,000 |

En cuanto a rendimiento de inferencia, Liquid AI afirma que el modelo base alcanza 220 tokens por segundo en hardware consumer, aunque no se especifica la configuración exacta. Para esta variante GGUF, la velocidad dependerá de la cuantización elegida y del dispositivo.

## Requisitos de hardware

- VRAM estimada: la cuantización Q4_K_M ocupa 1,67 GB, por lo que cabe en GPUs con 4 GB de VRAM o menos. La versión Q8_0 requiere 2,87 GB, apta para GPUs de 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.) o iGPU modernas. También funciona en CPU con llama.cpp, especialmente en Apple M-series y AMD Ryzen.
- Despliegue: compatible con llama.cpp, Ollama, llama-cpp-python y otros runners que soporten GGUF. No requiere vLLM ni TGI para su uso en local.
- Latencia y throughput: a 220 tok/s en hardware consumer, la latencia por token es de aproximadamente 4,5 ms. En CPU puede ser más lento, pero sigue siendo utilizable para tareas interactivas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de tamaño similar en la información proporcionada. Sin embargo, por su número de parámetros (2,69B) y su contexto de 128K, se sitúa en la misma categoría que modelos como Llama 3.2 3B o Qwen2.5 3B, aunque las diferencias arquitectónicas y de entrenamiento impiden una comparación directa sin benchmarks. La licencia Apache 2.0 es más permisiva que la de muchos modelos propietarios, y su enfoque en agéntica local es distintivo.

## Limitaciones y advertencias

- Al ser una versión abliterada, el modelo puede generar contenido explícito, ofensivo o peligroso sin ningún tipo de filtro. Su uso en aplicaciones públicas requiere una moderación externa obligatoria.
- La abliteración puede degradar ligeramente la calidad del razonamiento en algunos dominios, aunque la divergencia KL reportada es baja (0,0142).
- No se han publicado evaluaciones exhaustivas de sesgos, alucinaciones o robustez en tareas de razonamiento complejo.
- El modelo está optimizado para inglés, chino y japonés; el rendimiento en otros idiomas, incluido el español, puede ser inferior.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la variante abliterada no ofrece garantías sobre su comportamiento en entornos de producción.
- El tamaño del repositorio (13,6 GB) incluye todas las cuantizaciones; se debe descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Abiray/LFM2.5-2.6B-Heretic-Abliterated-GGUF
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Documentación oficial de Liquid AI para LFM2.5-2.6B: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Página de modelos de Liquid AI: https://www.liquid.ai/models
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
