# Lorelum/granite-embedding-97m-multilingual-r2-GGUF

## Resumen

Este repositorio contiene una cuantizacion Q4_0 en formato GGUF del modelo de embeddings `ibm-granite/granite-embedding-97m-multilingual-r2` de IBM. No se trata de un modelo entrenado por Lorelum, sino de un artefacto derivado: la reconstruccion del modelo original a traves de una conversion F16 intermedia y una cuantizacion posterior con llama.cpp. El objetivo declarado es alimentar un servicio de embeddings local que se ejecuta en CPU.

El modelo resuelve tareas de representacion vectorial de texto (feature-extraction): convierte frases o documentos en vectores densos de 384 dimensiones, aptos para busqueda semantica, recuperacion de informacion (retrieval) y agrupamiento. Su tamano reducido, 97.441.152 parametros y un fichero de 66.345.216 bytes, lo situa en el segmento de inferencia de baja latencia, despliegue en el borde y maximizacion de throughput de codificacion, segun la propia IBM.

La relevancia de esta ficha reside en que permite ejecutar un modelo multilingue de embeddings sin GPU y sin dependencias de servicios en la nube, con una licencia Apache 2.0 que facilita el uso comercial. Conviene tener presente que se trata de la variante cuantizada a 4 bits, no del modelo original, y que las pruebas documentadas se limitan a inferencia en CPU sobre macOS arm64.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de embeddings tipo transformer denso (detalle de capas y cabezas no disponible); artefacto cuantizado en formato GGUF |
| Parametros totales | 97.441.152 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 (artefacto publicado); el origen es F16 |
| Idiomas soportados | Multilingue (la lista concreta de idiomas no esta disponible en la informacion proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Dimensiones de embedding | 384 |
| Pooling | CLS con normalizacion L2, sin prefijo de consulta ni de documento |
| Tamano del fichero | 66.345.216 bytes (`granite-q4_0.gguf`) |
| SHA-256 del fichero | `18e8ce8ce834790618e90d26bed465cca87362076f3042eb0d8eee0732596f59` |

## Arquitectura y entrenamiento

El artefacto es una cuantizacion, no un reentrenamiento. La cadena de procedencia documentada es la siguiente: el modelo original de IBM fue convertido a GGUF F16 por el usuario ATF (fuente `granite-embedding-97m-multilingual-r2-f16.gguf`, 206.403.072 bytes, SHA-256 `74075aeea7bd9ac4e5d74755e216fa487f5b6cce9ac6c5a363936370585b1a38`) y, a partir de ese fichero, Lorelum aplico una cuantizacion directa sin recuantizacion con llama.cpp build b10901 (commit `28ff0958291ce3465fabd7bd679d4b0edd742bd9`) mediante el comando `llama-quantize --pure --token-embedding-type q4_0 ... Q4_0 4`.

En el artefacto resultante, los pesos de las matrices y la tabla de embeddings de tokens usan Q4_0, mientras que los vectores de normalizacion permanecen en F32. Se trata del artefacto Q4_0 puro, no de una variante Q4_K_M. El autor no realizo ningun entrenamiento adicional ni ajuste fino; la unica modificacion respecto al modelo de IBM es la cuantizacion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo original recurrio a RLHF o DPO.

## Capacidades

- Generacion de embeddings de texto: convierte texto en vectores densos de 384 dimensiones para tareas de representacion y similitud.
- Busqueda semantica y recuperacion de informacion: adecuado para indexacion vectorial y recuperacion de documentos por similitud coseno.
- Capacidades multilingues: el modelo base esta etiquetado como multilingue, orientado a recuperacion cross-lingue, aunque la lista exacta de idiomas no esta disponible.
- Agrupamiento y clasificacion: los vectores pueden alimentar algoritmos de clustering, deduplicacion y clasificacion basada en similitud.
- Extraccion de caracteristicas para pipelines posteriores: integrable como etapa de codificacion previa a un recuperador o un reranker.
- Inferencia en CPU: validado con un runtime de embeddings compatible con llama.cpp.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de vision o audio; es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en documentacion interna: indexar manuales y articulos como vectores de 384 dimensiones y recuperar los fragmentos mas relevantes ante una consulta en lenguaje natural, sin depender de servicios externos.
- Sistemas RAG en local: servir como codificador de recuperacion en una arquitectura de generacion aumentada por recuperacion, ejecutandose en CPU y evitando enviar datos sensibles a la nube.
- Deduplicacion y agrupamiento de contenido: calcular similitudes entre textos para detectar duplicados, agrupar tickets de soporte o clasificar opiniones por tematica.
- Moderacion y filtrado por similitud: comparar mensajes entrantes contra una lista de patrones conocidos mediante distancia coseno, como primera capa de un sistema de filtrado.
- Recuperacion multilingue: al estar basado en un modelo multilingue, permite consultar un corpus en un idioma y recuperar documentos en otro, util en bases de conocimiento internacionales.
- Despliegue en el borde: con un fichero de 66 MB, puede embeberse en dispositivos con recursos limitados o en contenedores ligeros para codificacion de texto en tiempo real.
- Clasificacion de correo y enrutamiento: vectorizar asuntos y cuerpos de mensajes para enrutarlos a la cola o al equipo adecuado mediante un clasificador ligero sobre los embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del artefacto no incluye metricas de recuperacion, MTEB ni comparativas numericas de calidad frente al modelo F16 o al modelo original de IBM. La unica referencia cualitativa disponible, procedente de la pagina de IBM, indica que la variante de 97M es 3 veces mas pequena que `granite-embedding-311m-multilingual-r2` y que preserva un rendimiento solido de recuperacion cross-lingue, pero sin cifras asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el fichero ocupa 66.345.216 bytes (aproximadamente 63 MiB) y puede ejecutarse integramente en CPU.
- GPU recomendadas: no disponibles; la documentacion no menciona ninguna GPU concreta, y el caso de uso declarado es inferencia en CPU.
- Compatibilidad con GPU de consumo: irrelevante en la practica, dado que el modelo cabe en memoria del sistema de cualquier equipo actual.
- Opciones de despliegue: llama.cpp es el runtime referenciado y validado por el autor. Otros entornos compatibles con GGUF (por ejemplo, servidores de embeddings basados en llama.cpp) no estan confirmados en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles. La unica referencia es que el artefacto se probo con inferencia en CPU sobre macOS arm64, y el propio autor advierte que la publicacion por si sola no establece compatibilidad ni rendimiento en otro hardware.
- Verificacion: el autor valida el tamano y el SHA-256 del artefacto antes de cargarlo, practica recomendable en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| Este artefacto (Lorelum, Q4_0 GGUF) | 97.441.152 | 384 | GGUF Q4_0 | Apache 2.0 | No disponible | Cuantizacion Q4_0 pura, uso en CPU |
| `ibm-granite/granite-embedding-97m-multilingual-r2` | 97M | 384 | safetensors (original) | Apache 2.0 | No disponible | Modelo de referencia de IBM, sin cuantizar |
| `atfai/granite-embedding-97m-multilingual-r2-GGUF` | 97M | 384 | GGUF F16 | Apache 2.0 | No disponible | Conversion F16 que sirve de origen a este artefacto |
| `ibm-granite/granite-embedding-311m-multilingual-r2` | 311M | No disponible | No disponible | Apache 2.0 | No disponible | Version de mayor tamano, sin datos de rendimiento comparativos en la informacion disponible |

## Limitaciones y advertencias

- Es una cuantizacion a 4 bits: la calidad de los embeddings puede degradarse respecto al modelo F16 o al original en safetensors, especialmente en tareas de recuperacion fina. No se han publicado mediciones de esa perdida.
- No se ha realizado ningun entrenamiento ni ajuste: hereda integramente los sesgos y limitaciones del modelo de IBM.
- Validacion limitada: las pruebas documentadas corresponden unicamente a inferencia en CPU sobre macOS arm64. No se garantiza compatibilidad ni rendimiento en otras plataformas.
- Ausencia de benchmarks: no hay metricas de MTEB, recuperacion cross-lingue ni comparativas numericas, lo que dificulta estimar el impacto real de la cuantizacion.
- Lista de idiomas no disponible: aunque el modelo es multilingue, no se dispone del desglose de idiomas soportados ni de su cobertura real.
- Longitud de contexto no disponible: se desconoce el limite maximo de tokens por secuencia.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes enganosas si los textos de entrada son muy cortos o muy especializados.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserve la atribucion. El repositorio incluye el fichero LICENSE, la model card original y la model card del GGUF de origen.
- Naturaleza del artefacto: no es una publicacion oficial de IBM, sino un derivado mantenido por Lorelum. Para produccion critica conviene evaluar tambien el modelo original sin cuantizar.

## Enlaces

- Repositorio de este artefacto: https://huggingface.co/Lorelum/granite-embedding-97m-multilingual-r2-GGUF
- Modelo base de IBM: https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2
- Conversion F16 de ATF: https://huggingface.co/atfai/granite-embedding-97m-multilingual-r2-GGUF
- Version de mayor tamano de IBM: https://huggingface.co/ibm-granite/granite-embedding-311m-multilingual-r2
- Repositorio de llama.cpp (runtime de inferencia): https://github.com/ggerganov/llama.cpp
