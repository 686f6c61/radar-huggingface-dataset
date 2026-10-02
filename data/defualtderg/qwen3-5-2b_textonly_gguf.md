# DefualtDerg/Qwen3.5-2B_TextOnly_GGUF

## Resumen

Qwen3.5-2B_TextOnly_GGUF es una version derivada y cuantizada en formato GGUF del modelo Qwen/Qwen3.5-2B, publicada por el usuario DefualtDerg. Se trata de una modificacion de terceros: segun su propia model card, al modelo base se le ha eliminado la capacidad de procesamiento de imagen ("image capability removed") con el objetivo de reducir ligeramente el tamano del artefacto, de modo que el resto del comportamiento deberia ser identico al de Qwen3.5-2B pero sin soporte de vision. El modelo se distribuye unicamente en formato GGUF, orientado a inferencia local.

El modelo cuenta con 1.942.653.248 parametros (aproximadamente 1,94 mil millones, segun los datos de safetensors del modelo base), por lo que se situa en la categoria de modelos pequenos, aptos para ejecucion en CPU, GPUs de gama de entrada y dispositivos con memoria unificada. El repositorio ocupa 5,0 GB, lo que sugiere que incluye varios niveles de cuantizacion, aunque la lista exacta de ficheros no esta disponible en la informacion proporcionada. La licencia declarada es Apache 2.0.

Su relevancia actual es limitada y muy condicionada: el repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, no incluye resultados de evaluacion ni documentacion tecnica propia mas alla de dos frases, y no especifica arquitectura, contexto, idiomas ni datos de entrenamiento. Es, por tanto, un artefacto experimental sin validacion de la comunidad, util principalmente para quien necesite una variante GGUF sin torre de vision de este modelo base concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.5-2B; no detallada en la informacion proporcionada) |
| Parametros totales | 1.942.653.248 (~1,94 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; los niveles concretos incluidos en el repositorio no estan disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio); el modelo base en safetensors |
| Modelo base | Qwen/Qwen3.5-2B |
| Vision | eliminada explicitamente (tags: text-only, no-vision, devisioned) |
| Tamano del repositorio | 5,0 GB |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-02 |
| Descargas / me gusta | 0 / 0 |
| Pipeline declarado | text-generation |
| Compatibilidad con endpoints | si (tag endpoints_compatible) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna en los datos proporcionados. Todo lo que se sabe es que el modelo es una derivacion de Qwen/Qwen3.5-2B y que la modificacion aplicada consiste en la eliminacion de la capacidad de imagen, presumiblemente retirando la torre o el codificador visual del modelo base. La model card del autor no especifica si la eliminacion implica un recorte de pesos, un reentrenamiento parcial o un simple descarte del modulo de vision, ni indica si el resto de los pesos permanece intacto.

Tampoco hay datos sobre el entrenamiento: numero de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) o innovaciones tecnicas. El autor afirma que "basicamente todo deberia ser igual que Qwen3.5-2B sin soporte de imagen", pero se trata de una expectativa declarada, no de una verificacion empirica. No se han publicado evaluaciones que confirmen que las capacidades de texto del modelo base se conservan tras la modificacion.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation y el modelo se distribuye en formato conversacional, por lo que se espera que soporte dialogos multi-turno.
- Procesamiento de lenguaje natural general: al estar basado en Qwen3.5-2B, se asume que conserva las capacidades del modelo base, aunque no hay documentacion que lo acredite.
- Sin soporte de vision: la capacidad de imagen ha sido eliminada de forma explicita, segun los tags y la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas aparece vacio en los metadatos de HuggingFace).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Audio u otras modalidades: no disponible.

## Casos de uso

- Inferencia local en equipos modestos: con ~1,94 mil millones de parametros y cuantizaciones GGUF, el modelo puede ejecutarse en portatiles sin GPU dedicada o en mini-PC, lo que permite prototipar asistentes de texto sin coste de API.
- Procesamiento por lotes de bajo coste: clasificacion de textos, etiquetado tematico o extraccion de campos en grandes volumenes de documentos donde un modelo de 2B reduce el coste por token frente a alternativas mayores.
- Asistentes conversacionales embebidos: chatbots sencillos en aplicaciones de escritorio o moviles con memoria unificada limitada, siempre que el contexto requerido sea corto (la ventana real no esta documentada).
- Generacion de contenido auxiliar: redaccion de borradores, reformulacion de frases o generacion de variaciones de texto en herramientas de productividad que funcionen sin conexion.
- Preprocesado dentro de un pipeline RAG: uso del modelo como generador de respuestas sobre fragmentos recuperados, o como componente de resumen de cada fragmento antes de pasarlo a un modelo mayor.
- Filtrado y normalizacion de datos: limpieza, deduplicacion semantica o reescritura de corpus en proyectos de preparacion de datasets.
- Entorno de investigacion y ajuste fino: al ser un modelo pequeno con licencia Apache 2.0, sirve como base para experimentos de fine-tuning, destilacion o comparativas de tecnicas de cuantizacion.
- Evaluacion de pipelines GGUF: util para probar herramientas como llama.cpp u Ollama y medir latencias reales antes de invertir en modelos mayores.
- Escenarios con requisitos de privacidad: al ejecutarse en local, permite tratar datos sensibles sin enviarlos a servicios externos, siempre que la licencia y las condiciones del modelo base se respeten.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se aportan mediciones de latencia o throughput propias.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (1,94 mil millones); no son mediciones realizadas sobre este modelo concreto.

- VRAM estimada para inferencia, solo pesos:
  - F16: aproximadamente 3,9 GB.
  - Q8_0: aproximadamente 2,1 GB.
  - Q5_K_M: aproximadamente 1,4 GB.
  - Q4_K_M: aproximadamente 1,2 GB.
- Memoria adicional: hay que sumar el cache KV, cuyo tamano depende de la longitud de contexto, el numero de capas y de cabezas de atencion, datos que no estan disponibles. Con contextos cortos el sobrecoste es de unos cientos de megabytes; con contextos largos puede superar el tamano de los propios pesos.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones de 4 y 5 bits (GTX 1650, RTX 3050, RTX 4060, RTX 3060, etc.). Las cuantizaciones F16 requieren en torno a 6 GB considerando el overhead.
- Cabe en CPU y memoria unificada: si. Con 8 GB de RAM es suficiente para las cuantizaciones de 4 y 5 bits; Apple Silicon con 8 GB o mas de memoria unificada puede ejecutarlo sin dificultad.
- GPU de centro de datos: A100, H100 o similares no son necesarias; el modelo queda muy desaprovechado en ese hardware salvo que se use con lotes grandes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, llama-cpp-python y Jan son las rutas naturales al ser un GGUF.
- Compatibilidad con servidores de inferencia: vLLM y TGI no estan pensados para GGUF de forma nativa; para usarlos habria que partir del modelo base en safetensors. El tag endpoints_compatible sugiere que el artefacto puede servirse en infraestructura compatible con endpoints, pero no se detalla cual.
- Latencia y throughput: no disponibles. Como referencia orientativa no medida, un modelo de ~2B en Q4_K_M suele moverse en el orden de decenas de tokens por segundo en CPU moderna y varios cientos en GPU de gama media, pero estos valores no se han verificado para este repositorio.

## Comparativa con modelos similares

Los datos de esta tabla proceden de conocimiento general sobre los modelos citados y deben verificarse en sus repositorios oficiales antes de tomar decisiones. No se incluyen cifras de rendimiento porque la informacion proporcionada no contiene ninguna.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DefualtDerg/Qwen3.5-2B_TextOnly_GGUF | 1,94 mil millones | no disponible | no disponible | Apache 2.0 | GGUF, 0 descargas, sin evaluacion publica |
| Qwen/Qwen3.5-2B (base) | ~1,94 mil millones | no disponible | no disponible | Apache 2.0 (segun el derivado) | safetensors, incluye vision |
| Qwen2.5-1.5B-Instruct | 1,5 mil millones | 32.768 tokens | no disponible en esta ficha | Apache 2.0 | safetensors y GGUF, ampliamente desplegado |
| Llama-3.2-3B-Instruct | 3 mil millones | 128.000 tokens | no disponible en esta ficha | Licencia comunitaria Llama 3.2 | safetensors y GGUF, requiere aceptar terminos |

Diferencias destacables: frente al modelo base, esta version renuncia a la vision a cambio de un artefacto algo mas ligero; frente a Qwen2.5-1.5B-Instruct y Llama-3.2-3B-Instruct, carece de contexto documentado y de cualquier evaluacion publicada, ademas de no tener adopcion registrada, por lo que su uso en produccion exige una validacion propia previa.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, pruebas de regresion ni verificacion de que las capacidades de texto del modelo base se mantengan tras eliminar la vision.
- Adopcion nula: 0 descargas y 0 me gusta en el momento de la consulta, lo que implica que el artefacto no ha sido probado por terceros.
- Documentacion minima: la model card se limita a dos frases; no se detalla el procedimiento de eliminacion de la vision, la lista de ficheros GGUF, los niveles de cuantizacion incluidos ni las instrucciones de uso.
- Procedencia de los pesos: al ser una modificacion de terceros, el autor original del modelo base no respalda ni verifica el artefacto.
- Parametros frente al nombre: el repositorio se anuncia como "2B" pero el recuento real es de 1.942.653.248 parametros, y no esta claro si esa cifra corresponde al modelo con o sin el modulo de vision.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas que requieran ventanas largas sin medirlo previamente.
- Idiomas no documentados: no hay lista de idiomas soportados, por lo que no se puede asumir un buen rendimiento en castellano sin pruebas propias.
- Riesgo de alucinacion: inherente a los modelos de esta escala; aumenta en tareas de conocimiento factual, razonamiento matematico complejo y contextos largos.
- Capacidades de agente y tool calling no confirmadas: no conviene integrarlo en flujos que dependan de function calling sin validarlo antes.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y verificar las condiciones del modelo base Qwen/Qwen3.5-2B, ya que el derivado hereda sus obligaciones.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento, por lo que no se pueden anticipar sesgos concretos; se asumen los habituales de los corpus web a gran escala.
- Sin garantias para produccion: cualquier despliegue deberia ir precedido de una bateria de pruebas propia sobre los casos de uso reales y con las cuantizaciones que se vayan a usar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DefualtDerg/Qwen3.5-2B_TextOnly_GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- No se han encontrado en la informacion proporcionada otros enlaces (papers, blogs tecnicos, repositorios de codigo ni demos) asociados a este modelo.
