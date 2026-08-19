# Justbackup/gemma-3-12b-it-abliterated

## Resumen

Este repositorio aloja una versión "abliterated" del modelo multimodal Gemma 3 12B Instruct de Google, subida por el usuario Justbackup. La abliteration es una técnica de modificación de pesos que elimina la dirección de rechazo aprendida durante el entrenamiento con RLHF, de modo que el modelo deja de negarse a responder a peticiones consideradas dañinas o sensibles. El resultado es un modelo sin filtros de seguridad que conserva la mayor parte de sus capacidades de razonamiento, generación de texto y comprensión de imágenes.

El modelo base es `google/gemma-3-12b-it`, un transformer multimodal de 12.2 mil millones de parámetros con soporte para entrada de texto e imagen, entrenado por Google. La versión abliterated fue desarrollada originalmente por mlabonne, quien experimentó con varias recetas para eliminar los rechazos manteniendo la coherencia, y publicó versiones para los tamaños de 1B, 4B, 12B y 27B. Este repositorio concreto parece ser una copia o re-subida de esa versión de 12B, con la misma model card y los mismos enlaces.

La relevancia de este modelo radica en su uso para aplicaciones donde se requiere una generación de contenido sin restricciones temáticas, como escritura creativa, roleplay o investigación sobre seguridad de IA. Sin embargo, al eliminar los mecanismos de rechazo, también se elimina una capa importante de protección, lo que lo hace inadecuado para entornos de producción donde se necesiten salvaguardas éticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen), basado en Gemma 3 |
| Parametros totales | 12.187.325.040 (12,2 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Gemma 3 soporta hasta 128k tokens) |
| Tipos de cuantizacion | Safetensors en el repositorio; existen versiones GGUF publicadas por mlabonne |
| Idiomas soportados | No disponibles en la informacion proporcionada (Gemma 3 soporta multiples idiomas, pero no se detallan) |
| Licencia | Gemma (licencia de Google, con restricciones de uso comercial) |
| Formato de pesos | Safetensors (repositorio principal); GGUF disponible en repositorio externo |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-12b-it`, un transformer denso con arquitectura multimodal que procesa tanto texto como imagenes. Gemma 3 utiliza atencion por ventanas deslizantes y atencion global, junto con un codificador de vision para la entrada de imagenes. El modelo original fue entrenado con instrucciones y RLHF para seguir directrices y rechazar contenido dañino.

La modificacion principal de este repositorio es la aplicacion de una tecnica de abliteration por capas. En lugar de calcular una unica direccion de rechazo global, se calcula una direccion por capa (de la capa 3 a la 45) comparando los estados ocultos entre muestras dañinas y benignas, inspirado en el trabajo de Sumandora. Se aplica un peso de rechazo de 0,6 para escalar la importancia de esta direccion en cada capa. El resultado es una tasa de aceptacion superior al 90% para peticiones que normalmente serian rechazadas, manteniendo una salida coherente, aunque el autor advierte de posibles errores gramaticales ocasionales (por ejemplo, "It' my" en lugar de "It's my").

No se proporcionan datos sobre el dataset de entrenamiento ni el numero de tokens utilizados para el ajuste, ya que la abliteration no requiere reentrenamiento, sino una modificacion directa de los pesos.

## Capacidades

- Generacion de texto conversacional y de instrucciones: responde a prompts en lenguaje natural con coherencia y razonamiento.
- Comprension de imagenes: al ser multimodal, puede procesar imagenes junto con texto y responder preguntas sobre ellas.
- Razonamiento y matematicas: hereda las capacidades de Gemma 3 12B, que incluyen razonamiento logico y resolucion de problemas matematicos basicos.
- Sin rechazo a contenido sensible: la principal diferencia con el modelo original es que no se niega a responder a peticiones sobre violencia, sexo, drogas, etc.
- Soporte de tool calling: no se menciona explicitamente, pero Gemma 3 Instruct incluye capacidades de function calling en su version original; no se indica si la abliteration las preserva.
- Multilingue: el modelo base soporta multiples idiomas, aunque la ficha no detalla cuales.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativas, dialogos o poesia con tematicas adultas o controvertidas sin autocensura, util para autores que exploran generos como el terror, la ciencia ficcion oscura o el erotismo.
- Roleplay y simulacion de personajes: en entornos de juego o narrativa interactiva, el modelo puede interpretar personajes con personalidades complejas o moralmente ambiguas sin rechazar lineas de actuacion.
- Investigacion sobre seguridad y alineacion de IA: los investigadores pueden estudiar como se comporta un modelo sin mecanismos de rechazo, comparando sus respuestas con el modelo original para entender el impacto de la abliteration.
- Generacion de contenido educativo sobre temas tabu: puede explicar conceptos de salud sexual, drogas o violencia desde una perspectiva tecnica sin evadir preguntas, aunque con riesgo de incorreccion.
- Pruebas de robustez en sistemas de moderacion: se puede utilizar como modelo de "ataque" para evaluar filtros de contenido en aplicaciones de produccion.
- Desarrollo de asistentes especializados en dominios sensibles: por ejemplo, un asistente para profesionales de la salud mental que necesite abordar temas delicados sin rodeos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de rendimiento comparativas con el modelo original ni con otras versiones abliterated. Se recomienda al usuario evaluar el modelo en sus propias tareas para determinar su calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 12,2 B de parametros en precision fp16 o bf16, lo que requiere aproximadamente 24 GB de VRAM para cargar los pesos completos. Con cuantizacion a 8 bits, se reduce a unos 12 GB; con 4 bits, unos 6-7 GB.
- GPU recomendadas: para fp16, una NVIDIA A100 (40 GB) o RTX 4090 (24 GB) son adecuadas. Para cuantizaciones bajas, una RTX 3080 (10-12 GB) o RTX 4060 Ti (16 GB) pueden funcionar.
- Compatibilidad con GPU de consumo: si, con cuantizacion GGUF (por ejemplo, Q4_K_M) cabe en GPUs de 8-12 GB, aunque con degradacion de calidad.
- Opciones de despliegue: se puede servir con vLLM, Text Generation Inference (TGI) o llama.cpp (para GGUF). Tambien es compatible con Ollama si se usa el repositorio GGUF externo.
- Latencia y throughput: no se proporcionan datos. Como referencia, un modelo de 12B en una GPU A100 puede generar entre 30 y 60 tokens por segundo en fp16, dependiendo del batch y la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Abliterated | Disponibilidad |
|---|---|---|---|---|---|
| Justbackup/gemma-3-12b-it-abliterated | 12,2 B | No especificado (base: 128k) | Gemma | Si | HuggingFace (safetensors) |
| google/gemma-3-12b-it | 12,2 B | 128k | Gemma | No | HuggingFace (original) |
| huihui-ai/gemma-3-12b-it-abliterated | 12,2 B | No especificado | Gemma | Si | HuggingFace (otra version) |
| mlabonne/gemma-3-12b-it-abliterated-GGUF | 12,2 B | No especificado | Gemma | Si | HuggingFace (GGUF) |

La principal diferencia entre las versiones abliterated radica en la tecnica exacta y el autor; este repositorio parece ser una copia de la version de mlabonne, mientras que `huihui-ai` ofrece una implementacion propia. No se dispone de datos comparativos de rendimiento entre ellas.

## Limitaciones y advertencias

- Eliminacion de salvaguardas: el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtro. No debe usarse en aplicaciones publicas sin moderacion adicional.
- Coherencia degradada: el autor advierte de errores gramaticales ocasionales y de que el modelo puede producir texto incoherente en algunos casos.
- Sesgos y alucinaciones: al igual que el modelo base, puede inventar hechos y reflejar sesgos presentes en los datos de entrenamiento, sin que la abliteration los corrija.
- Licencia Gemma: la licencia de Google impone restricciones de uso comercial y requiere cumplir sus politicas de uso prohibido. Aunque el modelo es de codigo abierto, no es completamente libre.
- Contexto no verificado: no se confirma la longitud de contexto real tras la abliteration; es probable que se mantenga la del modelo base (128k), pero no hay garantia.
- Uso en produccion: no se recomienda para sistemas que requieran respuestas seguras y fiables, como atencion al cliente o asistentes medicos, debido a la falta de control de contenido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Justbackup/gemma-3-12b-it-abliterated
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Articulo sobre abliteration (blog de mlabonne): https://huggingface.co/blog/mlabonne/abliteration
- Repositorio de Sumandora (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers/
- Version GGUF de mlabonne: https://huggingface.co/mlabonne/gemma-3-12b-it-abliterated-GGUF
- Version alternativa de huihui-ai: https://huggingface.co/huihui-ai/gemma-3-12b-it-abliterated
