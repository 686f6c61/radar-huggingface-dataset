# professorf/Qwen3.8-27B-gguf

## Resumen

Qwen3.8-27B-gguf es un repositorio de cuantizaciones en formato GGUF del modelo Qwen3.8-27B, publicado por el usuario professorf (Nick V. Flor, PhD) bajo licencia Apache 2.0. No se trata de los pesos originales, sino de una conversión orientada a reproducibilidad e inferencia en hardware de consumo, con un tamano de repositorio de 83,1 GB que sugiere la presencia de varias cuantizaciones en el mismo espacio. El modelo base es un modelo denso de 27.320.697.856 parametros (27,3B) con arquitectura hibrida de atencion y codificador de vision nativo.

El modelo subyacente pertenece a la serie Qwen3.8 y esta disenado para cargas de trabajo de codigo, tareas profesionales, investigacion y agentes de horizonte largo. Su rasgo arquitectonico mas distintivo es la combinacion de capas Gated DeltaNet (atencion lineal) con capas Gated Attention (atencion completa) en una proporcion de 3 a 1, ademas de Multi-Token Prediction (MTP) entrenado en varios pasos. Soporta una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000.

Es relevante ahora porque lleva capacidades de vision-lenguaje (imagenes y videos de hasta una hora) y control flexible del razonamiento a un modelo denso de 27B desplegable en una sola maquina, algo que en generaciones anteriores requeria modelos MoE de mayor tamano o APIs propietarias. El repositorio es muy reciente (creado el 12 de septiembre de 2026) y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con codificador de vision; hibrido de Gated DeltaNet (atencion lineal) y Gated Attention |
| Parametros totales | 27.320.697.856 (~27,3B), segun safetensors del repositorio |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | GGUF; los niveles concretos no se detallan en la informacion proporcionada |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizacion); el modelo base se distribuye en safetensors para Transformers |
| Tamano del repositorio | 83,1 GB |
| Dimension oculta | 5.120 |
| Numero de capas | 64 |
| Layout de capas | 16 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Vocabulario (entrada/salida) | 248.320 (con padding) |
| Dimension intermedia FFN | 17.408 |
| Cabeza Gated DeltaNet | 48 cabezas lineales para V, 16 para QK, dimension de cabeza 128 |
| Cabeza Gated Attention | 24 cabezas para Q, 4 para KV, dimension de cabeza 256, RoPE dim 64 |
| Multi-Token Prediction | Si, entrenado con multiples pasos |
| Compatibilidad de inferencia | Hugging Face Transformers, vLLM, SGLang, TokenSpeed; GGUF para llama.cpp/Ollama/LM Studio |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de vision y una columna vertebral hibrida. Cada bloque principal repite 16 veces el patron: tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention, cada una acompanada de su FFN. La Gated DeltaNet actua como mecanismo de atencion lineal con 48 cabezas para el valor y 16 para las consultas y claves, con dimension de cabeza 128; la Gated Attention introduce atencion completa con 24 cabezas de consulta y solo 4 cabezas de clave-valor, con dimension de cabeza 256 y dimension de RoPE de 64. Esta mezcla busca reducir el coste de memoria del cache KV en contextos largos manteniendo capacidad de recuperacion exacta en una de cada cuatro subcapas.

Segun la model card, el entrenamiento incluye fases de preentrenamiento y postentrenamiento, e incorpora Multi-Token Prediction (MTP) entrenado con multiples pasos, lo que habilita decodificacion especulativa de forma nativa. El modelo soporta modo de razonamiento activado por defecto, desactivable por peticion, con ajuste de profundidad mediante `reasoning_effort` y retencion del contexto de razonamiento de mensajes historicos mediante `preserve_thinking`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas concretas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto y razonamiento con control de profundidad: modo de pensamiento activado por defecto, desactivable por peticion, y ajuste fino mediante `reasoning_effort`.
- Razonamiento multi-paso con retencion del contexto de razonamiento previo mediante `preserve_thinking`.
- Codigo y trabajo profesional: la model card reporta mejoras sustanciales en codigo, tareas profesionales e investigacion, incluyendo codigo agentico en terminal.
- Ejecucion agentica: planificacion autonoma y manejo de retroalimentacion del entorno para completar tareas de extremo a extremo.
- Vision-lenguaje nativa: comprension de imagenes y videos, incluyendo diagramas STEM, documentos y videos de escala horaria.
- Contexto largo: ventana nativa de 262.144 tokens ampliable a 1.000.000, adecuada para repositorios completos o transcripciones extensas.
- Compatibilidad con herramientas y arneses de desarrollo: la model card menciona soporte ampliado para harnesses populares, aunque no detalla el formato exacto de tool calling.
- Decodificacion especulativa: soportada por el entrenamiento con MTP.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de codigo en terminal: el modelo esta optimizado para codigo agentico con ejecucion en terminal; puede leer el estado del repositorio, lanzar comandos, interpretar errores y corregir de forma iterativa gracias a su planificacion autonoma y al manejo de retroalimentacion del entorno.
- Revision de pull requests en CI/CD: con 262.144 tokens de contexto puede analizar diffs extensos junto con los ficheros relacionados, y su compatibilidad con vLLM y SGLang permite desplegarlo como servicio interno detras de un webhook de integracion continua.
- Analisis de documentos tecnicos con vision: al ser un modelo imagen-texto, puede extraer informacion de diagramas de arquitectura, planos, tablas escaneadas y figuras de articulos cientificos, tarea habitual en ingenieria y en revision de literatura.
- Analisis de video de larga duracion: la model card indica soporte de videos de escala horaria, lo que habilita resumen y busqueda semantica sobre grabaciones de reuniones, clases o sesiones de depuracion grabadas.
- Asistente de investigacion con contexto largo: puede procesar un conjunto amplio de articulos o un corpus normativo completo dentro de la misma ventana y mantener el hilo de razonamiento entre turnos mediante `preserve_thinking`.
- Despliegue en estacion de trabajo local: al ser un modelo denso de 27B con cuantizaciones GGUF, es viable ejecutarlo en una estacion con una o dos GPU de consumo para tareas de asistencia personal sin enviar datos a terceros.
- Automatizacion de tareas profesionales repetitivas: redaccion de informes, extraccion estructurada de datos desde capturas y documentos, y generacion de borradores tecnicos con control del nivel de razonamiento para ajustar coste y latencia.
- Atencion al cliente tecnica multi-turno: la combinacion de contexto largo y modo de pensamiento desactivable permite conversaciones prolongadas con baja latencia cuando no se requiere razonamiento profundo.

## Benchmarks y rendimiento

La model card del modelo original incluye tablas comparativas de rendimiento en texto con las categorias de codigo, trabajo profesional, investigacion y tareas agenticas, y toma como referencias Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. Sin embargo, los valores numericos concretos no estan disponibles en la informacion proporcionada, ya que la tabla aparece truncada. No se han publicado resultados de benchmarks verificables en la informacion disponible, y no se deben asumir cifras a partir de los nombres de las categorias.

| Benchmark o categoria | Qwen3.8-27B | Referencias comparadas | Notas |
|---|---|---|---|
| Codigo agentico en terminal | No disponible | Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B, Opus4.6 Max | Categoria citada en la model card sin valores |
| Resto de categorias (profesional, investigacion, agentico) | No disponible | Las mismas | Valores no incluidos en la informacion proporcionada |

Advertencia adicional: los resultados publicados corresponden al modelo base, no necesariamente a las cuantizaciones GGUF de este repositorio, que pueden degradar ligeramente el rendimiento en funcion del nivel de cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, no confirmado por el autor):
  - BF16/FP16: aproximadamente 54,6 GB solo de pesos, mas cache KV y activaciones.
  - Q8_0: aproximadamente 29 GB de pesos.
  - Q6_K: aproximadamente 22 GB de pesos.
  - Q5_K_M: aproximadamente 19 GB de pesos.
  - Q4_K_M: aproximadamente 16,5 GB de pesos.
- Cache KV: por capa de Gated Attention y token se almacenan 4 cabezas KV x 256 dimensiones x 2 (K y V) x 2 bytes, unos 4 KB; con 16 capas de este tipo son aproximadamente 64 KB por token, es decir, unos 8 GB a 131.072 tokens y unos 64 GB a 1.000.000 de tokens en precision FP16. Las capas Gated DeltaNet mantienen estado recurrente de tamano fijo en lugar de cache creciente, lo que reduce el coste respecto a un transformer puro de 27B.
- El codificador de vision anade un consumo adicional no cuantificado en la informacion disponible.
- GPU recomendadas: para BF16, una A100 80 GB o H100 80 GB; para cuantizaciones Q6/Q5, una RTX 6000 Ada (48 GB), A6000 o L40S; para Q4_K_M, cabe en GPUs de consumo con 24 GB si se limita la longitud de contexto.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 o similares de 24 GB con cuantizaciones de 4 bits y contexto moderado; para contexto largo conviene repartir el modelo entre dos GPUs de 24 GB o usar cuantizaciones de 3 bits.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para los ficheros GGUF de este repositorio; vLLM, SGLang y TokenSpeed para los pesos en formato Transformers segun la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Las referencias que aparecen en la model card son las unicas comparaciones citadas por el autor. No se dispone de datos de parametros, contexto ni licencia de las alternativas para construir una comparacion cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base de esta cuantizacion) | 27,3B | 262.144 nativo, hasta 1.000.000 | Apache 2.0 | Pesos abiertos; este repositorio anade GGUF | Modelo denso con vision y MTP |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible | Citado como referencia en la model card |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Citado como referencia; se distribuye tambien via Qwen Cloud |
| Muse Glimmer-30B | No disponible | No disponible | No disponible | No disponible | Citado como referencia en la model card |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | Citado como referencia en la model card |

## Limitaciones y advertencias

- Este repositorio es una cuantizacion de terceros, no la publicacion oficial de Qwen. La fidelidad respecto a los pesos originales no esta verificada y el repositorio registra cero descargas y cero valoraciones.
- Los resultados de benchmarks de la model card corresponden al modelo base; no hay datos publicados sobre el impacto de la cuantizacion GGUF en la calidad.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento multi-paso y en la interpretacion de diagramas o videos.
- Sesgos conocidos: no disponibles en la informacion proporcionada; no se documenta evaluacion de sesgos ni de seguridad.
- Idiomas soportados: no disponibles. La ausencia de esta informacion impide garantizar un rendimiento adecuado en castellano sin una evaluacion previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero se recomienda verificar la licencia aplicable al modelo base y las condiciones de los pesos originales.
- El repositorio ocupa 83,1 GB, por lo que su descarga completa requiere espacio en disco considerable; es posible descargar solo el fichero de cuantizacion deseado.
- La ventana de 262.144 tokens es nativa, pero alcanzarla o ampliarla a 1.000.000 exige memoria muy superior a la de una GPU de consumo, incluso con cuantizacion de 4 bits.
- El soporte de vision en formato GGUF suele depender de un fichero proyector multimodal separado; no se confirma en la informacion proporcionada que este incluido.
- Los resultados de la busqueda web asociada no contienen enlaces utiles ni documentacion tecnica relevante sobre el modelo.
- Para produccion se recomienda validar la cuantizacion elegida frente a los pesos originales en el conjunto de tareas concreto antes de desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/professorf/Qwen3.8-27B-gguf
- Pagina del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Servicio gestionado Qwen Cloud: https://www.qwencloud.com
- Resultados de la busqueda web: sin enlaces relevantes al modelo.
