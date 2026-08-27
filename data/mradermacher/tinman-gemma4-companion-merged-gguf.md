# mradermacher/Tinman-gemma4-companion-merged-GGUF

## Resumen

Tinman-gemma4-companion-merged-GGUF es una versión cuantizada en formato GGUF del modelo Tinman-gemma4-companion-merged, desarrollado por el laboratorio Tinman-Lab y cuantizado por mradermacher. El modelo base es un fine-tuning de la familia Gemma 4 de Google DeepMind, orientado a usos de compañía conversacional, roleplay y contenido sin censura (etiquetado como "uncensored" y "abliterated"). Incluye soporte multimodal (a través de un proyecto mmproj) y está diseñado para ejecutarse en dispositivos móviles y entornos con recursos limitados, gracias a las cuantizaciones GGUF que van desde Q2_K hasta f16.

El modelo tiene aproximadamente 7.460 millones de parámetros, lo que lo sitúa en la gama de los 7B, y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas. Su relevancia actual radica en ofrecer una alternativa de código abierto para aplicaciones de chat conversacional y roleplay con capacidades multimodales, manteniendo un tamaño manejable para inferencia local en GPUs de consumo. La versión GGUF facilita su despliegue con herramientas como llama.cpp, Ollama o LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, no se especifica variante exacta) |
| Parametros totales | 7.463.013.674 (aprox. 7,46 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ingles, multilingue (segun model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con proyecto multimodal mmproj) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Por los tags y el nombre, se trata de un modelo derivado de Gemma 4, que es una familia de LLMs de pesos abiertos de Google DeepMind basada en la tecnologia Gemini. El modelo base fue fine-tuneado por Tinman-Lab para tareas de compania y roleplay, y posteriormente sometido a un proceso de "abliteration" (eliminacion de capas de rechazo) para reducir la censura en las respuestas. El proceso de cuantizacion realizado por mradermacher convierte los pesos originales a formato GGUF, optimizando el tamaño y la velocidad de inferencia. No se han publicado datos sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: disenado para mantener dialogos largos y coherentes en contextos de compania y roleplay.
- Contenido sin censura: gracias al proceso de abliteration, el modelo responde a peticiones que otros modelos rechazarian, aunque esto conlleva riesgos (ver limitaciones).
- Soporte multimodal: incluye un proyecto mmproj (Q8_0 y f16) que permite procesar imagenes junto con texto, aunque no se especifica el tipo de vision (por ejemplo, si es capaz de describir imagenes o solo de incrustarlas).
- Multilingue: segun la model card, soporta varios idiomas, aunque el principal es el ingles.
- Compatible con herramientas de inferencia local: al estar en GGUF, se puede ejecutar con llama.cpp, Ollama, LM Studio, etc.
- Optimizado para moviles: el tag "mobile" sugiere que las cuantizaciones pequenas (Q2_K, Q3_K) pueden ejecutarse en dispositivos con poca memoria.

## Casos de uso

- Chat de compania virtual: el modelo puede mantener conversaciones empaticas y prolongadas, ideal para aplicaciones de asistencia emocional o compania digital, gracias a su entrenamiento especifico en roleplay.
- Roleplay interactivo: escritores y aficionados pueden usarlo para generar dialogos de personajes en juegos de rol o narrativa interactiva, con respuestas sin filtros que permiten explorar tramas adultas.
- Asistente multimodal en movil: al incluir soporte de vision y cuantizaciones ligeras, puede desplegarse en smartphones para responder preguntas sobre fotos o proporcionar descripciones de imagenes en tiempo real.
- Generacion de contenido creativo: util para redactar historias, poemas o guiones con un tono natural y sin restricciones tematicas, aprovechando su capacidad de generar texto fluido.
- Prototipado rapido de chatbots: desarrolladores pueden integrarlo en entornos de desarrollo local (con Ollama o llama.cpp) para probar interacciones conversacionales antes de pasar a modelos comerciales.
- Investigacion sobre alineacion y censura: al ser un modelo "abliterated", sirve como caso de estudio para analizar el impacto de eliminar capas de rechazo en el comportamiento de un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. La unica referencia de rendimiento es la comparativa de perplejidad entre cuantizaciones que se menciona en la model card (grafico de ikawrakow), pero no se incluyen valores numericos concretos.

## Requisitos de hardware

- VRAM estimada: segun la cuantizacion, el archivo GGUF mas pequeno (Q2_K) ocupa 4,5 GB, por lo que cabe en GPUs con 6 GB de VRAM (por ejemplo, GTX 1660, RTX 3050). La cuantizacion Q4_K_M (5,4 GB) es recomendable para GPUs de 8 GB (RTX 3070, RTX 4060). Para f16 (15 GB) se necesitan al menos 16 GB de VRAM (RTX 4080, A100).
- GPU recomendadas: RTX 3060/4060 para cuantizaciones Q4-Q6; RTX 3090/4090 o A100 para Q8_0 o f16.
- Compatible con consumer GPU: si, especialmente con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (si se convierte a formato compatible), TGI (con adaptaciones).
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090 con Q4_K_M, se puede esperar una generacion de 50-100 tokens/s, pero es una estimacion no confirmada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar con otros modelos de la misma categoria (companion/roleplay sin censura). Se podria comparar con modelos como Llama-3-8B-Instruct o Mistral-7B-Instruct, pero no hay datos de rendimiento de Tinman-gemma4-companion-merged para establecer una comparacion objetiva. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Contenido sin censura: al ser "abliterated", el modelo puede generar respuestas inapropiadas, ofensivas o peligrosas. No es apto para uso en produccion sin filtros adicionales de seguridad.
- Sesgos desconocidos: al no publicarse el dataset de entrenamiento, no se puede evaluar la presencia de sesgos de genero, raza o ideologicos.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos o datos, especialmente en contextos largos.
- Contexto limitado: no se especifica la longitud de contexto, por lo que no se puede garantizar un rendimiento optimo en dialogos muy extensos.
- Idiomas: aunque se declara multilingue, el entrenamiento principal parece ser en ingles; el rendimiento en otros idiomas puede ser inferior.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base (Gemma 4) tiene sus propias condiciones; es recomendable revisar la licencia de Gemma 4 para asegurar compatibilidad.
- Cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar notablemente la calidad de las respuestas; se recomienda Q4_K_M o superior para uso serio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tinman-gemma4-companion-merged-GGUF
- Modelo base (original): https://huggingface.co/chuckb80/Tinman-gemma4-companion-merged
- Repositorio de Tinman-Lab: https://huggingface.co/Tinman-Lab/Tinman-gemma4-companion-merged
- Pagina de Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
- Guia de Gemma 4 (tercera parte): https://gemma4.org/
