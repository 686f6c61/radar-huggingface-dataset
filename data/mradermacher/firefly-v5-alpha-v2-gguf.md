# mradermacher/Firefly-v5-alpha-v2-GGUF

## Resumen

Firefly-v5-alpha-v2-GGUF es la version cuantizada en formato GGUF del modelo Guilherme34/Firefly-v5-alpha-v2, publicada por mradermacher, un autor conocido por generar cuantizaciones estaticas y con imatrix de modelos abiertos para su uso con llama.cpp y derivados. Se trata de un modelo de aproximadamente 4.650 millones de parametros (4.647.450.147 segun los pesos originales) etiquetado por su autor como perteneciente a la familia Gemma 4, y distribuido exclusivamente en GGUF, lo que lo orienta a inferencia local en GPU de consumo y estaciones de trabajo sin necesidad de infraestructura de servidor.

El modelo se presenta como una variante orientada a razonamiento, uso de herramientas (tool-use y function-calling) y conversacion, y lleva la etiqueta "abliterated", lo que indica que se han eliminado o atenuado las direcciones de rechazo del modelo base. Esta caracteristica lo hace interesante para quien necesita un modelo pequeno que no bloquee peticiones, pero tambien plantea riesgos claros de seguridad y de alineacion que conviene valorar antes de usarlo en produccion. La model card del repositorio es minima: no documenta datos de entrenamiento, contexto, ni resultados de evaluacion.

La relevancia actual del modelo es practica mas que tecnica: ofrece un punto de partida de ~4,6B parametros, en ingles, con licencia Gemma, que cabe en tarjetas graficas de gama media con cuantizaciones Q4 y que incluye ficheros mmproj (proyector multimodal), lo que sugiere soporte de entrada de imagen, aunque ese extremo no se detalla en la informacion disponible. Con 485 descargas y 0 likes en el momento de la consulta, es un modelo de nicho dentro del ecosistema de cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Gemma 4 (etiqueta "gemma4" del repositorio); la model card no detalla la arquitectura interna |
| Parametros totales | 4.647.450.147 (~4,65 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 para el componente multimodal. Existen variantes con imatrix en el repositorio mradermacher/Firefly-v5-alpha-v2-i1-GGUF |
| Idiomas soportados | ingles (en) |
| Licencia | Gemma (gemma) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura mas alla de la etiqueta "gemma4" asociada al modelo base y del hecho de que los pesos originales estan en safetensors con 4.647.450.147 parametros. No se especifica si emplea atencion lineal, decodificacion especulativa, mezcla de expertos ni ninguna otra innovacion concreta. La presencia de ficheros mmproj-Q8_0 y mmproj-f16 (0,7 GB y 1,1 GB respectivamente) apunta a un proyector multimodal compatible con llama.cpp, es decir, a que el modelo base incorpora un codificador de vision, pero no hay confirmacion explicita en la model card.

Tampoco se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo fases de RLHF, DPO o ajuste con preferencias. La etiqueta "unsloth" sugiere que el ajuste fino del modelo base se realizo con la libreria Unsloth, y "abliterated" indica una intervencion deliberada sobre las direcciones de rechazo, presumiblemente mediante tecnicas de abliteracion sobre pesos, pero se trata de inferencias a partir de etiquetas, no de datos confirmados. Al ser una version "alpha", es razonable esperar que el modelo base cambie en el futuro.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento segun la etiqueta "reasoning" del repositorio, sin especificacion del mecanismo (cadena de pensamiento explicita o implicita).
- Uso de herramientas y function calling, segun las etiquetas "tool-use" y "function-calling".
- Comportamiento "abliterated": menor probabilidad de rechazar peticiones que el modelo base original.
- Posible entrada multimodal (imagenes) gracias a los ficheros mmproj incluidos, aunque no confirmado en la documentacion.
- Capacidades multilingues: limitadas al ingles segun el campo de idioma del repositorio.
- No se documentan capacidades de audio, vision detallada, agentes multi-paso ni modo de pensamiento explicito.

## Casos de uso

- Asistente conversacional local en ingles: el modelo, con ~4,6B parametros y cuantizaciones de 3,1 a 5,1 GB, puede ejecutarse en un portatil con GPU de gama media y gestionar dialogos multi-turno sin enviar datos a la nube, lo que resulta util en entornos con requisitos de privacidad.
- Prototipado de agentes con function calling: las etiquetas tool-use y function-calling lo hacen candidato para probar pipelines de llamadas a APIs externas (consultas meteorologicas, bases de datos, envio de correo) en fase de desarrollo, antes de escalar a un modelo mayor.
- Clasificacion y extraccion de informacion sobre texto en ingles: tareas de etiquetado, resumen corto o extraccion de entidades en lotes, donde un modelo de 4,6B cuantizado a Q4 permite alto rendimiento por vatio en una sola GPU.
- Desarrollo de interfaces de chat offline: integracion en aplicaciones de escritorio mediante llama.cpp u Ollama para asistentes que deben funcionar sin conexion a internet.
- Evaluacion de alineacion y seguridad: al ser una variante abliterated, es un caso de uso legitimo en investigacion para estudiar como cambia el comportamiento de un modelo Gemma pequeno al eliminar las direcciones de rechazo, comparandolo con el modelo base.
- Analisis de imagenes sencillo (si se confirma el soporte multimodal): uso del fichero mmproj junto con el GGUF principal para tareas de descripcion de imagenes o extraccion de texto en fotografia, siempre que el pipeline de llama.cpp lo soporte.
- Generacion de codigo y explicacion de fragmentos: aunque no hay etiqueta especifica de codigo, un modelo de 4,6B con capacidad de razonamiento puede asistir en tareas basicas de programacion dentro de editores locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y los resultados de la busqueda web proporcionados no guardan relacion con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos; habria que sumar la cache KV segun el contexto efectivo, que no esta documentado):
  - f16 (9,4 GB de pesos): aproximadamente 11-12 GB de VRAM.
  - Q8_0 (5,1 GB): aproximadamente 7 GB de VRAM.
  - Q6_K (3,9 GB): aproximadamente 5-6 GB de VRAM.
  - Q5_K_M y Q5_K_S (3,7 GB): aproximadamente 5 GB de VRAM.
  - Q4_K_M y Q4_K_S (3,5 GB; recomendadas por el cuantizador): aproximadamente 4-5 GB de VRAM.
  - IQ4_XS (3,4 GB): aproximadamente 4-5 GB de VRAM.
  - Q3_K_L, Q3_K_M y Q3_K_S (3,2-3,4 GB): aproximadamente 4 GB de VRAM.
  - Q2_K (3,1 GB): aproximadamente 4 GB de VRAM, con perdida de calidad notable.
  - Si se usa el componente multimodal, anadir 0,7 GB (mmproj-Q8_0) o 1,1 GB (mmproj-f16).
- Cabe en GPU de consumo: si, con cuantizaciones Q4 o inferiores en tarjetas de 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, RX 7800 XT). En tarjetas de 8 GB (RTX 3070, RTX 4060) es viable con Q4_K_M siempre que el contexto no sea muy largo.
- GPU recomendadas: RTX 4090 o RTX 3090 para maxima velocidad en local; A100 o H100 solo tendrian sentido para servir muchas peticiones concurrentes con batching, dado el tamano reducido del modelo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui. vLLM admite GGUF de forma experimental; TGI no esta orientado a GGUF. El repositorio esta etiquetado como compatible con endpoints.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de la columna de benchmarks no estan disponibles para el modelo objeto de la ficha. Los valores de los modelos alternativos corresponden a informacion publica general y no se han verificado en la informacion proporcionada para esta ficha.

| Modelo | Parametros | Contexto | Licencia | Formatos | Benchmarks |
|---|---|---|---|---|---|
| Firefly-v5-alpha-v2-GGUF | ~4,65B | no disponible | Gemma | GGUF | no disponible |
| Gemma 3 4B (referencia publica) | ~4,3B | 128k (publico) | Gemma | safetensors, GGUF | no comparado aqui |
| Qwen3 4B (referencia publica) | ~4,0B | 32k nativo, extensible (publico) | Apache 2.0 | safetensors, GGUF | no comparado aqui |
| Llama 3.2 3B (referencia publica) | ~3,2B | 128k (publico) | Llama 3.2 Community License | safetensors, GGUF | no comparado aqui |

Diferencias cualitativas relevantes: Firefly-v5-alpha-v2 esta disponible solo en GGUF (no se distribuyen safetensors en este repositorio), declara unicamente ingles y es una variante abliterated, mientras que los modelos de referencia son multilingues y mantienen las politicas de seguridad de sus autores. La licencia Gemma impone condiciones de uso distintas a las de Apache 2.0, lo que puede condicionar la eleccion en proyectos comerciales.

## Limitaciones y advertencias

- Alucinacion: no hay datos de evaluacion que permitan acotar la tasa de alucinacion, pero un modelo de ~4,6B en version alpha es especialmente propenso a inventar hechos, citas y APIs inexistentes.
- Idioma: el repositorio declara exclusivamente ingles. El rendimiento en castellano no esta garantizado ni documentado y previsiblemente sera bajo.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos. El ajuste sobre un modelo Gemma hereda los sesgos del corpus original, y la abliteracion puede amplificar respuestas estereotipadas o inapropiadas.
- Contenido abliterated: al haberse eliminado las direcciones de rechazo, el modelo puede generar contenido toxico, ilegal o peligroso. No es adecuado para aplicaciones de cara al publico ni para entornos regulados sin moderacion adicional.
- Licencia: se distribuye bajo los terminos de Gemma. Es necesario revisar las condiciones de uso comercial y la politica de usos prohibidos antes de desplegarlo en produccion, y en particular la compatibilidad de una variante abliterated con esos terminos.
- Estado alpha: tanto el nombre (v5-alpha-v2) como la ausencia de documentacion indican que el modelo base esta en desarrollo; la reproducibilidad y la estabilidad entre versiones no estan garantizadas.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede planificar su uso en tareas de documento largo sin medirlo empiricamente.
- Soporte multimodal incierto: la presencia de ficheros mmproj sugiere vision, pero no hay confirmacion ni ejemplos de uso en la model card.
- Fecha de creacion y actualizacion: el repositorio indica 2026-07-18 como fecha de creacion y 2026-10-10 como ultima actualizacion, datos que conviene verificar en la pagina original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Firefly-v5-alpha-v2-GGUF
- Modelo base: https://huggingface.co/Guilherme34/Firefly-v5-alpha-v2
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Firefly-v5-alpha-v2-i1-GGUF
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Firefly-v5-alpha-v2-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- No se han encontrado papers, blogs ni demos adicionales sobre este modelo en la busqueda web proporcionada.
