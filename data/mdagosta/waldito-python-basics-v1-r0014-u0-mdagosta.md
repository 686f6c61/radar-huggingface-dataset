# mdagosta/waldito-python-basics-v1-r0014-u0-mdagosta

## Resumen

El modelo `mdagosta/waldito-python-basics-v1-r0014-u0-mdagosta` es un export de la familia OpenWALDO publicado por el usuario mdagosta en HuggingFace. Segun la propia model card, utiliza la arquitectura estandar de Transformers para modelos de lenguaje causal de tipo Llama, acompanada del tokenizador de bytes "schema-1" propio de OpenWALDO, que requiere cargarse con `trust_remote_code=True`. El repositorio incluye ademas un inventario de ficheros (`BOM.json`) y un mapeo de divulgacion de contenido de entrenamiento conforme al reglamento europeo de GPAI (`EU-BOM.json`).

Se trata de un modelo muy pequeno: los pesos en safetensors suman 9.541.632 parametros, es decir, alrededor de 9,5 millones. Por escala, esto lo situa en el rango de modelos experimentales o de juguete, muy lejos de los modelos desplegables en produccion general. El nombre del repositorio sugiere un ajuste fino sobre un conjunto de datos de "python-basics" (fundamentos de Python), en la release 0014 y con un indice de unidad u0.

La relevancia de esta ficha es limitada y hay que ser honesto al respecto: el repositorio no declara licencia, idiomas, ni contexto, no tiene descargas ni likes, y no se han publicado resultados de benchmarks. La informacion disponible no permite recomendarlo para uso productivo; se documenta principalmente por su interes como artefacto del formato de exportacion OpenWALDO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de tipo Llama (segun la model card del autor) |
| Parametros totales | 9.541.632 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors, sin indicar la precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

Otros metadatos del repositorio: pipeline `text-generation`, tags `transformers`, `safetensors`, `llama`, `conversational`, `text-generation-inference`, `endpoints_compatible`, `region:us`. Tamano del repo declarado: 0,0 GB. Creado el 2026-09-30 y actualizado el mismo dia.

## Arquitectura y entrenamiento

La arquitectura declarada es la de un modelo de lenguaje causal estandar de la clase Llama dentro de la libreria Transformers. No se especifica numero de capas, dimension de embeddings, numero de cabezas de atencion, funcion de activacion ni estrategia de normalizacion, por lo que no es posible reconstruir el perfil del modelo a partir de la informacion disponible. Tampoco se documenta si se empleo atencion agrupada por consultas, atencion lineal o alguna variante de decodificacion especulativa.

El elemento diferencial declarado es el tokenizador: OpenWALDO usa un tokenizador de bytes denominado "schema-1", que debe cargarse con `trust_remote_code=True`. Esto implica la ejecucion de codigo remoto alojado en el repositorio, un punto de atencion relevante en terminos de seguridad de la cadena de suministro. El repositorio incorpora `BOM.json`, con el inventario de todos los ficheros de la release, y `EU-BOM.json`, que mapea la divulgacion de contenido de entrenamiento exigida por la normativa europea de modelos de proposito general. No se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva, segun el pipeline declarado (`text-generation`).
- Uso conversacional: el repositorio incluye la etiqueta `conversational`, lo que sugiere un ajuste orientado a dialogo, aunque no se documenta ninguna plantilla de chat ni formato de turnos.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun las etiquetas del repositorio.
- Tokenizacion a nivel de byte mediante el tokenizador schema-1 de OpenWALDO, que en teoria evita tokens fuera de vocabulario, a costa de secuencias mas largas.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

Con 9,5 millones de parametros, la capacidad real de razonamiento, codigo o matematicas es previsiblemente muy limitada, pero no hay ninguna evaluacion publicada que lo confirme o lo cuantifique.

## Casos de uso

- Pruebas de integridad del formato de exportacion OpenWALDO: cargar el modelo con `trust_remote_code=True` y verificar que el tokenizador schema-1 y los ficheros `BOM.json` y `EU-BOM.json` se resuelven correctamente en un pipeline de CI.
- Validacion de plantillas de despliegue: al ser compatible con text-generation-inference y endpoints compatibles, sirve para comprobar que una infraestructura de serving arranca y responde antes de desplegar un modelo mayor.
- Pruebas unitarias de pipelines de generacion: su tamano minimo (menos de 40 MB en fp32) permite ejecutarlo en tests automatizados sin GPU y sin coste apreciable.
- Experimentacion educativa con tokenizacion por bytes: util para estudiar como se comporta un tokenizador a nivel de byte frente a tokenizadores BPE en tareas de texto y codigo.
- Ajuste fino reproducible y de bajo coste: sirve como banco de pruebas para recetas de fine-tuning sobre corpus de fundamentos de Python, dado que el ciclo completo cabe en una unica GPU de gama consumer.
- Auditoria de divulgacion normativa: el `EU-BOM.json` permite estudiar como se estructura un mapeo de contenido de entrenamiento segun el regimen europeo de GPAI, con independencia de la calidad del modelo.
- Reproduccion de artefactos de investigacion: util para comparar distintas releases (el nombre indica r0014, u0) y trazar cambios entre versiones del mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y no hay literatura externa asociada. No se deben extrapolar cifras a partir de modelos de escala similar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 40 MB en fp32, unos 20 MB en fp16 o bf16 y alrededor de 10-12 MB en cuantizacion de 8 bits, para los pesos en solitario. Hay que sumar la memoria del estado de la clave-valor, que depende de la longitud de contexto, dato no disponible.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es sobradamente suficiente. No hay requisito practico de A100, H100 ni similares.
- Compatibilidad con GPU consumer: si, cabe en cualquier GPU consumer, incluida practicamente cualquier integrada reciente, y tambien en CPU.
- Opciones de despliegue: transformers (via `trust_remote_code=True`), text-generation-inference y endpoints compatibles. La disponibilidad de soporte en vLLM, llama.cpp, Ollama o TGI en formato GGUF no esta confirmada en la informacion disponible, y el tokenizador personalizado puede requerir trabajo adicional de integracion.
- Latencia y throughput estimados: no disponibles. Para un modelo de 9,5 M de parametros en hardware moderno se esperaria una latencia muy baja, pero no hay mediciones publicadas y el tokenizador por bytes puede alterar el numero de tokens por palabra.

## Comparativa con modelos similares

La comparacion es necesariamente aproximada, porque no hay datos de rendimiento publicados para este modelo y las alternativas pertenecen a escalas distintas. Se incluyen solo como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| waldito-python-basics-v1-r0014-u0-mdagosta | 9,5 M | no disponible | no disponible | no disponible |
| TinyStories-33M (Microsoft) | 33 M | 2.048 | MIT (segun su repositorio) | si, publicado |
| distilgpt2 | 82 M | 1.024 | Apache 2.0 | si, publicado |
| SmolLM-135M (HuggingFace) | 135 M | 2.048 | Apache 2.0 | si, publicado |

Ninguno de los modelos comparables utiliza un tokenizador de bytes personalizado con `trust_remote_code`, lo que hace que este repositorio sea dificil de integrar en comparacion con alternativas estandar. No se dispone de datos para afirmar superioridad o inferioridad en ninguna tarea.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones cualitativas, ni demos publicadas. Cualquier uso en produccion seria a ciegas.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. Ante la duda, debe tratarse como no apto para explotacion comercial.
- Tokenizador con codigo remoto: cargar el modelo exige `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio. Es un riesgo de seguridad de la cadena de suministro que debe mitigarse auditando el codigo antes de usarlo.
- Escala muy reducida: con 9,5 M de parametros, la coherencia en generaciones largas, el razonamiento y la fidelidad factual seran muy limitados. El riesgo de alucinacion es alto por construccion.
- Idiomas no declarados: no se puede garantizar un comportamiento correcto en castellano ni en ningun otro idioma concreto.
- Contexto desconocido: no se especifica la ventana de contexto, lo que impide planificar casos de uso con documentos largos o conversaciones multi-turno extensas.
- Cero adopcion: 0 descargas y 0 likes en el momento de redactar la ficha, y un tamano de repositorio declarado de 0,0 GB, lo que sugiere que el artefacto puede estar vacio o incompleto.
- Fecha de creacion inusual (2026-09-30): conviene verificar la integridad y procedencia del repositorio antes de cualquier uso.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni ninguna descripcion del corpus de entrenamiento mas alla del mapeo normativo del `EU-BOM.json`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0014-u0-mdagosta
- Repositorio del autor (mdagosta): https://huggingface.co/mdagosta
- Paper, blog o repositorio de OpenWALDO: no disponible en la informacion proporcionada.
- Documentacion del tokenizador schema-1: no disponible; se referencia indirectamente desde la model card del repositorio.
- Los resultados de busqueda web proporcionados no contienen ningun enlace relacionado con este modelo ni con OpenWALDO, por lo que no se incluyen.
