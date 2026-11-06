# JohnCheng/gemma-4-26b-sft-search

## Resumen

Gemma-4-26b-sft-search es un modelo multimodal de tipo image-text-to-text publicado por el usuario JohnCheng en Hugging Face bajo el identificador `JohnCheng/gemma-4-26b-sft-search`. Por el nombre se infiere que se trata de un ajuste fino supervisado (SFT) de un modelo de la familia Gemma 4, orientado a tareas de busqueda, aunque la model card no proporciona documentacion tecnica que lo confirme. El repositorio tiene 0 descargas y 0 likes, y el acceso esta restringido (gated), por lo que requiere aceptar condiciones en Hugging Face antes de poder descargar los pesos.

El dato mas fiable disponible es el recuento de parametros extraido de los ficheros safetensors: 25.805.933.872 parametros, es decir, aproximadamente 25,8 mil millones. Esto situa al modelo en la gama de 26B anunciada en el nombre y lo posiciona en la categoria de modelos densos de gran tamano, adecuados para despliegues en GPU de 40-80 GB o en configuraciones multi-GPU. La libreria declarada es transformers y el pipeline es image-text-to-text, lo que confirma capacidades de vision-lenguaje.

La relevancia de este modelo es limitada en el momento de redactar esta ficha: se trata de una publicacion reciente (creada el 2 de noviembre de 2026), sin documentacion, sin benchmarks publicados y con acceso restringido. Resulta util como referencia para quienes sigan la familia Gemma 4 y sus derivados comunitarios, pero no constituye una opcion recomendable para produccion sin una evaluacion previa por parte del equipo que lo vaya a utilizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer multimodal por el pipeline image-text-to-text y la familia Gemma 4) |
| Parametros totales | 25.805.933.872 (~25,8B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se asume compatibilidad con cuantizacion estandar de transformers, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo. El pipeline declarado (image-text-to-text) y la etiqueta `gemma4` indican que se trata de un derivado de la familia Gemma 4 de Google, con capacidad para procesar imagenes y texto de forma conjunta. El sufijo `sft` del nombre sugiere un ajuste fino supervisado, y `search` apunta a una especializacion en tareas de busqueda o recuperacion de informacion, pero ninguno de estos extremos esta documentado en la model card.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica referencia bibliografica presente en las etiquetas es `arxiv:1910.09700`, correspondiente al articulo original de transformers (Vaswani et al., 2019), que no aporta informacion especifica sobre este ajuste.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Gemma 4 (no verificadas en este ajuste).
- Procesamiento de imagenes y texto de forma conjunta (pipeline image-text-to-text confirmado por metadatos).
- Posible especializacion en tareas de busqueda o recuperacion de informacion, segun el sufijo `search` del nombre (no confirmado).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Busqueda multimodal asistida: el modelo podria recibir una consulta en texto o una imagen y generar una respuesta o reformulacion orientada a recuperacion de informacion, aprovechando el pipeline image-text-to-text. La especializacion `search` sugiere este escenario, aunque no esta documentada.
- Descripcion y analisis de imagenes en catalogo: en un flujo de comercio electronico, el modelo podria generar descripciones textuales de productos a partir de fotografias, siempre que se valide su calidad con un conjunto de prueba propio.
- Extraccion de informacion de documentos escaneados: al combinar vision y lenguaje, podria transcribir y estructurar contenido de facturas o formularios, integrado en un pipeline de preprocesado.
- Prototipado de asistentes con contexto visual: util en entornos de investigacion para experimentar con modelos de 26B en tareas que requieren entender capturas de pantalla o diagramas.
- Generacion de respuestas aumentadas por recuperacion (RAG) multimodal: el modelo podria consumir fragmentos de texto e imagenes recuperados de un indice y redactar una respuesta consolidada, previa evaluacion de su fidelidad.
- Evaluacion comparativa de derivados de Gemma 4: como checkpoint comunitario, sirve para estudiar el efecto del SFT sobre el modelo base en tareas de busqueda, dentro de un entorno de investigacion controlado.

En todos los casos, la ausencia de documentacion y benchmarks obliga a realizar una evaluacion propia antes de considerar cualquier uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 52 GB solo para pesos, mas overhead de activaciones y cache KV, por lo que se recomienda al menos 80 GB.
- Cuantizacion a 8 bits: en torno a 26 GB de pesos, viable en una A100 40 GB o H100 40 GB con margen ajustado.
- Cuantizacion a 4 bits: en torno a 13-15 GB de pesos, podria caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con contexto limitado.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con 2x A100 40 GB o 2x RTX 4090 para precision completa.
- Capacidad en GPU de consumo: solo con cuantizacion agresiva (4 bits) y contextos cortos; no se garantiza un rendimiento aceptable sin pruebas.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI si el modelo es compatible con sus kernels (no confirmado), llama.cpp/Ollama solo si existen conversiones GGUF (no disponibles en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Gemma-4-26b-sft-search (este) | ~25,8B | no disponible | no disponible | gated | Derivado comunitario sin documentacion |
| Gemma 2 27B (Google) | 27B | 8K | Gemma Terms | publica | Modelo denso de referencia de la generacion anterior |
| Qwen2.5-VL 32B | ~32B | 128K | Apache 2.0 | publica | Multimodal con contexto largo y amplia documentacion |
| Llama 3.3 70B | 70B | 128K | Llama 3.3 Community License | publica | Mayor escala, no multimodal |

La comparacion es orientativa: no hay datos de rendimiento del modelo evaluado que permitan contrastarlo con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, licencia, idiomas ni limitaciones conocidas.
- Licencia no disponible: al derivar presumiblemente de Gemma 4, podrian aplicarse los terminos de uso de Google, pero esto no esta confirmado; no debe usarse comercialmente sin aclararlo.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a la reproducibilidad.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano, agravado por la falta de evaluacion publicada.
- Sesgos desconocidos: no se ha publicado ninguna evaluacion de sesgo o toxicidad.
- Contexto e idiomas no documentados: no se puede planificar su uso en escenarios multilingues o de contexto largo sin pruebas.
- Sin benchmarks ni validacion externa: 0 descargas y 0 likes indican ausencia de uso comunitario verificable.
- Fecha de creacion futura respecto a la mayoria de referencias: conviene verificar la integridad y procedencia de los pesos antes de cualquier despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/JohnCheng/gemma-4-26b-sft-search
- Paper de referencia en las etiquetas (transformers original): https://arxiv.org/abs/1910.09700
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
