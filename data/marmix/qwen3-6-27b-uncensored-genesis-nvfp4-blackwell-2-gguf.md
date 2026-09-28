# MarMix/Qwen3.6-27B-Uncensored-Genesis-NVFP4-Blackwell-2-GGUF

## Resumen

MarMix/Qwen3.6-27B-Uncensored-Genesis-NVFP4-Blackwell-2-GGUF es una publicacion de pesos en formato GGUF derivada de Qwen3.6-27B, el modelo denso de 27B de la familia Qwen 3.6 (lanzada, segun las fuentes consultadas, en abril de 2026). El repositorio no contiene un modelo entrenado desde cero: es una conversion y cuantizacion del artefacto "Uncensored-Genesis-NVFP4-Blackwell", es decir, una variante sometida a un proceso de abliteracion o fine-tuning orientado a eliminar los rechazos de seguridad del modelo original y a preservar o reforzar sus capacidades generales. El autor del repositorio es el usuario MarMix y el modelo base de referencia es Qwen/Qwen3.6-27B.

El dato objetivo mas relevante es el numero de parametros: 26.895.999.448 (aproximadamente 26,9B), lo que confirma que se trata de un transformer denso (no MoE) en el que todos los parametros se activan por token, coherente con la rama de 27B denso de Qwen 3.6. El repositorio ocupa 15,5 GB, un tamano compatible con una cuantizacion de aproximadamente 4,5-4,6 bits por peso, lo que encaja con el sufijo NVFP4 del nombre (formato de coma flotante de 4 bits de NVIDIA para GPUs Blackwell) reconvertido a GGUF para su uso con llama.cpp y derivados.

La relevancia de esta ficha es acotada pero clara: se trata de un checkpoint muy reciente (creado el 28 de septiembre de 2026), con cero descargas y cero likes en el momento de la consulta, sin model card util (el README solo declara `license: apache-2.0`) y sin resultados de evaluacion publicados. Es, por tanto, un artefacto para evaluacion y experimentacion, no una opcion recomendada sin validacion previa para produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.6-27B); no se detalla en la informacion disponible |
| Parametros totales | 26.895.999.448 (aprox. 26,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No confirmada para este derivado; la familia Qwen 3.6 se anuncia con 256K tokens segun las fuentes consultadas |
| Tipos de cuantizacion | GGUF con imatrix; el nombre indica que el origen es NVFP4 (Blackwell). No se listan los niveles de cuantizacion publicados |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 15,5 GB) |
| Tag adicional | `endpoints_compatible`, `conversational` |
| Fecha de publicacion | 2026-09-28 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.6-27B: un transformer denso de 27B parametros que activa la totalidad de sus pesos en cada token, en contraposicion a la variante MoE de 35B con 3B activos de la misma familia. Segun las fuentes consultadas, la familia Qwen 3.6 incorpora vision, modo de razonamiento (thinking mode) preservado y una ventana de contexto de 256K tokens, ademas de capacidades orientadas a codigo agentico. No hay informacion disponible en el material proporcionado que confirme si este derivado concreto conserva la torre de vision ni si el thinking mode sigue operativo tras el proceso de abliteracion.

Sobre el entrenamiento no hay datos publicados: la model card se limita a la declaracion de licencia Apache-2.0 y no incluye numero de tokens, composicion del dataset, ni si el pipeline de la variante "Genesis" empleo RLHF, DPO, abliteration por direccion de rechazo u otra tecnica. El nombre del repositorio sugiere una cadena de transformacion en tres saltos (abliteracion/fine-tuning "Genesis" -> cuantizacion NVFP4 para Blackwell -> conversion a GGUF con imatrix), pero ninguno de esos pasos esta documentado en la informacion disponible. El sufijo "-2-" indica que se trata de la segunda revision de esta publicacion.

La unica innovacion tecnica verificable es el uso de cuantizacion con matriz de importancia (imatrix) para el GGUF, que calibra los errores de cuantizacion ponderando la relevancia de cada peso, y la procedencia NVFP4, que implica que el checkpoint original fue optimizado para el formato de 4 bits en coma flotante de las GPUs NVIDIA de arquitectura Blackwell.

## Capacidades

Dado que no hay model card descriptiva ni evaluaciones, solo pueden enumerarse las capacidades heredadas de la arquitectura base, con la salvedad de que no estan verificadas para este checkpoint:

- Generacion de texto y conversacion multi-turno (el tag `conversational` esta presente en el repositorio).
- Razonamiento con modo pensamiento (thinking mode), si el proceso de abliteracion no lo ha degradado; no confirmado.
- Generacion de codigo y tareas de programacion agentica, segun las capacidades anunciadas para la familia Qwen 3.6.
- Capacidades de vision, si se ha preservado el proyector multimodal del modelo base; no confirmado y probablemente ausente en una conversion GGUF de un derivado abliterado.
- Salida sin rechazos de seguridad: el proposito declarado de la variante es responder a peticiones que el modelo alineado rechazaria.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Escritura de ficcion y narrativa sin restricciones tematicas: el modelo puede emplearse para redactar relatos, dialogos o guiones con violencia, contenido adulto o temas sensibles que un modelo alineado rechazaria. Es el caso de uso principal de una variante abliterada y el unico que el repositorio insinua explicitamente.
- Analisis de documentos largos en local: si conserva la ventana de 256K tokens de la familia base, permitiria resumir y consultar contratos, expedientes o informes extensos sin enviar datos a un servicio en la nube. Requiere verificar la ventana real antes de usarlo.
- Asistente conversacional autoalojado para uso personal: al ser un GGUF de 15,5 GB, puede ejecutarse en una estacion de trabajo con GPU consumer unica mediante llama.cpp u Ollama, sin coste de API ni envio de datos a terceros.
- Investigacion sobre alineacion y seguridad: util como objeto de estudio para comparar el comportamiento de un modelo abliterado frente a su version alineada (tasa de rechazo, degradacion de capacidades, cambios en la distribucion de respuestas) en ejercicios de red teaming controlados.
- Banco de pruebas de cuantizacion: al existir una version NVFP4 y una conversion GGUF, permite medir la perdida de calidad introducida por la reconversion a 4 bits con imatrix frente al checkpoint original de mayor precision.
- Generacion de codigo con contexto de repositorio: si el modelo base mantiene su capacidad de codigo agentico, podria integrarse en asistentes de desarrollo locales para autocompletar o refactorizar sobre fragmentos largos de codigo. No validado.
- Despliegue en hardware Blackwell: la procedencia NVFP4 lo hace candidato natural para GPUs de esa generacion, aunque la version publicada aqui es GGUF y no aprovecha las rutas FP4 nativas de forma directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto, y el modelo base Qwen3.6-27B no aparece acompanado de cifras en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 15,5 GB, de modo que con este unico archivo GGUF se necesitan al menos unos 16 GB de VRAM solo para los pesos, mas la cache KV. Con una ventana de contexto corta (4-8K tokens) el total se situa en el entorno de 17-20 GB; con ventanas de 100K tokens o superiores, la cache KV de un modelo denso de 27B puede anadir decenas de GB y hacer inviable la ejecucion en una sola GPU.
- GPU recomendadas: una RTX 4090 o RTX 5090 (24-32 GB) permite cargar el modelo con contexto moderado. Para contexto largo o mayor paralelismo, se recomienda A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- Viabilidad en GPU consumer: si, es viable en tarjetas de 24 GB o superiores (RTX 3090, 4090, 5090) si se limita la ventana de contexto y se descargan algunas capas a CPU/RAM. En GPUs de 16 GB o menos seria necesario un GGUF mas agresivo (Q3 o inferior), no publicado en este repositorio.
- Opciones de despliegue: llama.cpp y sus interfaces (Ollama, LM Studio, llama-cpp-python) son las rutas directas para GGUF. vLLM, TGI y SGLang soportan algunos formatos GGUF, pero su compatibilidad con un GGUF derivado de NVFP4 no esta garantizada. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI en algun servidor de inferencia, sin mas detalle.
- Latencia y throughput: no disponible. No hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (MarMix Qwen3.6-27B-Uncensored-Genesis-NVFP4-Blackwell-2-GGUF) | 26,9B | n/a (denso) | 256K segun la familia base, no confirmado | Apache-2.0 | GGUF | Abliterado, sin benchmarks publicados, 0 descargas |
| Qwen/Qwen3.6-27B (base oficial) | 27B | n/a (denso) | 256K | No disponible en el material | safetensors | Version alineada; referencia de calidad y capacidades |
| Qwen3.6-35B-A3B (variante MoE de la familia) | 35B | 3B | 256K | No disponible en el material | No disponible | Menor coste de inferencia por token activo; categorias distintas (MoE frente a denso) |
| Qwen3.6-27B-AEON-Ultimate-Uncensored | 27B | n/a (denso) | No disponible | No disponible | No disponible (dos formatos) | Otra abliteracion del mismo base, con documentacion mas extensa sobre su proceso |

La comparacion directa con la variante AEON es la mas pertinente, ya que ambas parten de Qwen/Qwen3.6-27B con el objetivo de eliminar rechazos. La diferencia practica es de trazabilidad: AEON publica un README con metodologia, mientras que este repositorio no documenta su pipeline.

## Limitaciones y advertencias

- Ausencia total de validacion: cero descargas y cero likes en el momento de la consulta, publicacion de un solo dia de antiguedad respecto a su actualizacion y sin benchmarks. No hay evidencia externa de que el modelo funcione segun lo que promete su nombre.
- Model card inexistente: el README solo contiene la declaracion de licencia. No se documentan datos de entrenamiento, hiperparametros, ni que se ha modificado respecto al base.
- Riesgo de degradacion por abliteracion: los procesos de eliminacion de rechazos suelen reducir capacidades de razonamiento, coherencia en respuestas largas y adherencia a instrucciones. Sin evaluaciones, no puede descartarse ni cuantificarse.
- Alucinacion: cualquier modelo de 27B denso presenta riesgo de alucinacion; en un checkpoint abliterado sin alineacion posterior, la tendencia a afirmar con seguridad informacion falsa puede aumentar, ya que se han eliminado parte de los mecanismos de cautela.
- Contenido danino: al estar disenado para no rechazar peticiones, puede generar instrucciones peligrosas, contenido ilegal o discurso de odio. Requiere medidas de moderacion externas obligatorias si se expone a usuarios.
- Sesgos: no se han documentado evaluaciones de sesgo. El modelo hereda los sesgos de los datos de entrenamiento de Qwen 3.6 e incorpora los del posible fine-tuning de la variante Genesis, que no se describe.
- Soporte de idiomas desconocido: no hay lista oficial. Se desconoce si conserva el multilingusimo del base o si el fine-tuning lo ha reducido al ingles.
- Incertidumbre sobre vision y contexto: las capacidades multimodales y la ventana de 256K corresponden a la familia base, no a este derivado. Deben verificarse empiricamente antes de disenar cualquier caso de uso que dependa de ellas.
- Restricciones de licencia: el repositorio declara Apache-2.0, que permite uso comercial. Sin embargo, la licencia del checkpoint intermedio "Uncensored-Genesis-NVFP4-Blackwell" no se especifica, y el proceso de abliteracion puede introducir obligaciones adicionales no declaradas. Conviene verificar la cadena de licencias antes de un uso comercial.
- Procedencia NVFP4 reconvertida: la doble cuantizacion (FP4 -> GGUF) puede acumular error de cuantizacion mayor que una conversion directa desde pesos de alta precision. No hay mediciones de perplejidad que lo confirmen o descarten.

## Enlaces

- Repositorio HuggingFace de esta ficha: https://huggingface.co/MarMix/Qwen3.6-27B-Uncensored-Genesis-NVFP4-Blackwell-2-GGUF
- Repositorio hermano (revision previa, version NVFP4): https://huggingface.co/MarMix/Qwen3.6-27B-Uncensored-Genesis-NVFP4-Blackwell-GGUF
- Archivo GGUF concreto: https://huggingface.co/MarMix/Qwen3.6-27B-Uncensored-Genesis-NVFP4-Blackwell-GGUF/blob/main/Qwen3.6-27B-Uncensored-Genesis-NVFP4-Blackwell.gguf
- Variante AEON-Ultimate-Uncensored (otra abliteracion del mismo base): https://github.com/lguddeti/Qwen3.6-27B-AEON-Ultimate-Uncensored/
- README de la variante AEON (espejo): https://github.com/mrzeta/Qwen3.6-27B-AEON-Ultimate-Uncensored/blob/main/README.md
- Guia de ejecucion local de Qwen 3.6 (27B denso, 35B MoE): https://dev.to/purpledoubled/how-to-run-qwen-36-locally-27b-dense-35b-moe-and-coding-variants-setup-guide-4di
- Modelo base oficial (Qwen/Qwen3.6-27B): no disponible como enlace directo en la informacion proporcionada
