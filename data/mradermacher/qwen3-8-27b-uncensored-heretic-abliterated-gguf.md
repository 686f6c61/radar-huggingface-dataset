# mradermacher/Qwen3.8-27B-Uncensored-Heretic-Abliterated-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `alexander2323/Qwen3.8-27B-Uncensored-Heretic-Abliterated`, una variante de la serie Qwen3.8-27B modificada mediante la técnica de *abliteration* para eliminar los mecanismos de rechazo del modelo original. El autor de las cuantizaciones, mradermacher, publica estos pesos para facilitar su ejecución en hardware local mediante motores como llama.cpp u Ollama.

La relevancia de este modelo radica en que ofrece una versión sin restricciones de un modelo de 27 mil millones de parámetros, con soporte de modo de pensamiento (*thinking mode*) y visión (texto e imágenes), y una ventana de contexto de 262.000 tokens, según la información disponible. Está orientado a usuarios que necesitan un asistente conversacional sin filtros de contenido, como en entornos de investigación creativa o desarrollo de aplicaciones de rol. Al tratarse de una cuantización GGUF, se puede desplegar en GPUs de consumo con requisitos de VRAM moderados.

La ficha se basa únicamente en la información pública disponible en Hugging Face y en los resultados de búsqueda web; no se han encontrado datos oficiales sobre el entrenamiento, arquitectura detallada o licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3.8-27B, probablemente transformer con mezcla de expertos, sin confirmar) |
| Parametros totales | 27 mil millones (según el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.000 tokens (según fuentes web) |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo original Qwen3.8-27B. Según los resultados de búsqueda, se trata de una abliteración de dicho modelo, una técnica de modificación de pesos que elimina las direcciones de activación responsables de los rechazos de contenido. El artículo de MindStudio menciona una metodología basada en *KL-drift* y pruebas de rechazo con jueces automáticos, pero no se especifican detalles del entrenamiento original (número de tokens, composición del dataset, uso de RLHF, etc.). Este repositorio en concreto solo contiene las cuantizaciones GGUF generadas a partir de los pesos ya modificados, sin incluir información adicional sobre el proceso de entrenamiento.

## Capacidades

- Generación de texto sin restricciones de contenido: el modelo ha sido abliterado para eliminar respuestas de rechazo, permitiendo abordar temas que el modelo base podría evitar.
- Modo de pensamiento (*thinking mode*): según las fuentes, el modelo soporta razonamiento encadenado antes de generar la respuesta final.
- Capacidades multimodales: acepta tanto texto como imágenes como entrada, lo que permite tareas de descripción o análisis visual.
- Ventana de contexto amplia: 262.000 tokens, adecuada para documentos largos o conversaciones extensas.
- Despliegue local mediante Ollama o llama.cpp gracias al formato GGUF.

## Casos de uso

- Generación creativa sin filtros: escritores y guionistas pueden explorar narrativas con temáticas adultas o controvertidas sin que el modelo rechace la petición. Por ejemplo, redacción de diálogos para novelas de terror o ciencia ficción con violencia explícita.
- Desarrollo de personajes para juegos de rol: el modelo puede interpretar personajes con personalidades extremas o moralmente ambiguas, manteniendo coherencia en conversaciones largas gracias a su contexto de 262.000 tokens.
- Asistencia en investigación académica sobre temas sensibles: sociólogos o antropólogos pueden simular discursos extremistas o posturas polarizadas para estudiar patrones lingüísticos, siempre con fines analíticos.
- Creación de contenido para entretenimiento adulto: guiones para cómics, podcasts o vídeos con lenguaje explícito, donde un modelo censurado fallaría.
- Análisis de imágenes con contexto largo: al aceptar imágenes y tener gran ventana, puede describir series de fotografías o ilustraciones en un único prompt, por ejemplo para documentación de arte.
- Prototipado de asistentes conversacionales sin restricciones de política: empresas que desarrollan chatbots para nichos específicos (p. ej., consejería sobre temas tabú) pueden probar respuestas sin filtros antes de implementar moderación externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para la cuantización Q4_K_M, el peso ocupa aproximadamente 16,8 GB según el repositorio GitHub, por lo que se necesita al menos una GPU con 20-24 GB de VRAM para ejecutarlo cómodamente. Las cuantizaciones más pequeñas (Q2_K, Q3_K_S) pueden reducir el requisito a unos 12-14 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 40 GB, o GPUs de datacenter con mayor memoria. Para las cuantizaciones más bajas, una RTX 3060 12 GB podría ser insuficiente; se recomienda al menos 16 GB.
- Compatibilidad con hardware de consumo: sí, con las cuantizaciones más agresivas (Q2_K, Q3_K_S) y usando offloading de capas a CPU si la VRAM es limitada.
- Opciones de despliegue: llama.cpp, Ollama (comando sugerido `ollama run huihui_ai/Qwen3.8-abliterated`, aunque este es un modelo similar, no este exacto), vLLM (si se convierte a formato compatible), y otros motores que soporten GGUF.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090, se espera una velocidad de generación de entre 20 y 40 tokens por segundo para cuantizaciones Q4_K_M, dependiendo de la longitud de contexto y el uso de modo de pensamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Abliterado | Vision | Licencia |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-Uncensored-Heretic-Abliterated-GGUF | 27B | 262k | Sí | Sí | no disponible |
| Huihui-Qwen3.8-27B-abliterated | 27B | 262k | Sí | Sí | no disponible |
| Qwen3.8-27B (original) | 27B | 262k | No | Sí | Apache 2.0 (según serie Qwen, sin confirmar) |

Ambos modelos abliterados son muy similares en capacidades; la diferencia principal radica en el método de abliteración y en las cuantizaciones ofrecidas. El modelo original de Qwen, sin abliterar, mantiene las restricciones de seguridad estándar.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una modificación no oficial, no se han realizado evaluaciones de sesgo; es probable que herede los sesgos del modelo base Qwen3.8-27B, que no han sido documentados en este repositorio.
- Riesgo de alucinación: al eliminar los rechazos, el modelo puede generar contenido falso o dañino con mayor facilidad, especialmente en temas delicados. No hay garantía de veracidad.
- Limitaciones de idioma: no se especifican los idiomas soportados; aunque Qwen suele ser multilingüe, el rendimiento fuera del inglés y chino no está confirmado.
- Restricciones de licencia: la licencia no está indicada. Esto impide su uso comercial sin verificación previa con los autores originales. Se recomienda contactar con alexander2323 antes de cualquier despliegue en producción.
- Advertencia de uso: el modelo está diseñado para generar contenido sin censura, lo que puede incluir material ofensivo, ilegal o éticamente cuestionable. El usuario asume toda la responsabilidad legal y moral.
- Para producción: al no haber benchmarks ni documentación de estabilidad, no se recomienda su uso en sistemas críticos o servicios públicos sin una evaluación exhaustiva.

## Enlaces

- Repositorio Hugging Face de las cuantizaciones: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Heretic-Abliterated-GGUF
- Modelo base (alexander2323): https://huggingface.co/alexander2323/Qwen3.8-27B-Uncensored-Heretic-Abliterated
- Cuantizaciones FP8 del mismo autor: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-FP8-GGUF
- Repositorio GitHub con instrucciones de uso: https://github.com/Wassimyounes01/qwen38-uncensored
- Artículo sobre la metodología de abliteración: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Noticia sobre el modelo Huihui abliterado (similar): https://vgtimes.com/tech-and-hardware/164540-huihui-qwen3.8-27b-abliterated-launches-as-an-uncensored-ai-model-for-free.html
