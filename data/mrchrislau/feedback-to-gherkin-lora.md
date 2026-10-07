# mrchrislau/feedback-to-gherkin-lora

## Resumen

`mrchrislau/feedback-to-gherkin-lora` es un adaptador de ajuste fino (LoRA) publicado por el usuario mrchrislau sobre el modelo base `unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit`, a su vez derivado de Llama 3.2 3B Instruct de Meta. El nombre del repositorio, "feedback-to-gherkin", indica que el ajuste esta orientado a transformar texto de retroalimentacion (comentarios de usuario, incidencias, notas de producto) en escenarios Gherkin, el lenguaje de especificacion de comportamiento basado en las clausulas Given/When/Then que consumen frameworks como Cucumber, Behave o SpecFlow. Esta finalidad se deduce del identificador del modelo, ya que la model card publicada no incluye ninguna descripcion funcional.

El modelo resuelve un problema de nicho dentro del ciclo de ingenieria de software: convertir lenguaje natural no estructurado en artefactos de prueba ejecutables y versionables, reduciendo el trabajo manual de redaccion de criterios de aceptacion. Se apoya en un transformer decoder-only de aproximadamente 3 000 millones de parametros, con licencia declarada Apache 2.0 y entrenamiento realizado con Unsloth y TRL sobre el modelo base cuantizado en 4 bits.

Es relevante ahora por dos motivos. Primero, por su tamano: 3B permite ejecucion en GPU de consumo, algo habitual en tareas de ingenieria de prompts y generacion de artefactos BDD dentro del propio IDE. Segundo, por su naturaleza de adaptador LoRA de bajo coste: el repositorio ocupa 0,1 GB, lo que lo hace extremadamente ligero de almacenar y de servir junto al modelo base. El contrapeso es que se trata de un modelo sin evaluacion publicada, con cero descargas y cero likes en el momento de redactar esta ficha, y con muy poca documentacion tecnica asociada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), ajuste mediante LoRA sobre modelo base cuantizado en 4 bits |
| Parametros totales | Aproximadamente 3 000 millones en el modelo base Llama 3.2 3B Instruct; el numero de parametros entrenables del adaptador no esta disponible |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la informacion disponible; el modelo base Llama 3.2 3B Instruct soporta hasta 128 000 tokens segun la documentacion de Meta, pero la model card no lo confirma para este ajuste |
| Tipos de cuantizacion | Modelo base publicado en bitsandbytes 4-bit; no se listan cuantizaciones adicionales para el adaptador. No disponible |
| Idiomas soportados | Ingles (`en`) segun la etiqueta de idioma del repositorio |
| Licencia | Apache 2.0 (declarada en el repositorio); sujeto ademas a la licencia del modelo base Llama 3.2 |
| Formato de pesos | safetensors (adaptador LoRA); no se confirma la presencia de pesos fusionados ni de archivos GGUF |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers |
| Modelo base | unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit |
| Fecha de creacion | 2026-10-07 (segun metadatos del repositorio) |
| Ultima actualizacion | 2026-10-07 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, atencion con RoPE y grouped-query attention. Sobre ese modelo se aplica un ajuste supervisado con LoRA, la tecnica de adaptacion de bajo rango que congela los pesos originales y entrena matrices de rango reducido en las capas de atencion y proyeccion. El entrenamiento se realizo con Unsloth (que la model card anuncia como "2x faster") y con TRL, la libreria de ajuste fino supervisado y alineamiento de Hugging Face, segun las etiquetas del repositorio.

No hay informacion publicada sobre el volumen de datos de entrenamiento, la composicion del dataset, la procedencia de los ejemplos de retroalimentacion ni el formato exacto de las muestras de entrada y salida. Tampoco se documenta si hubo una fase de RLHF, DPO u otro metodo de alineamiento posterior al ajuste supervisado. No se declaran innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, mezcla de expertos) mas alla del propio uso de LoRA y de la cuantizacion en 4 bits del modelo base. La ausencia de una model card descriptiva implica que cualquier afirmacion sobre el comportamiento del modelo en produccion debe validarse empiricamente antes de adoptarlo.

## Capacidades

- Generacion de texto en ingles con el estilo instructivo heredado de Llama 3.2 3B Instruct.
- Transformacion de retroalimentacion en lenguaje natural a escenarios Gherkin con estructura Given/When/Then, segun se deduce del nombre del repositorio y no de documentacion explicita.
- Redaccion de criterios de aceptacion y casos de prueba legibles por negocio, integrables en suites de Cucumber, Behave, SpecFlow o similares.
- Seguimiento de instrucciones conversacionales basicas, propia del modelo base Instruct.
- Soporte de tool calling y function calling: no documentado para este ajuste; el modelo base dispone de plantillas de tool use, pero el ajuste puede haber degradado esa capacidad.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Generacion de escenarios BDD desde tickets de soporte: se alimenta al modelo con el texto de una incidencia o reclamacion y se obtiene un escenario Gherkin listo para revisar por el equipo de QA, reduciendo el tiempo de redaccion manual de criterios de aceptacion.
- Refinamiento de historias de usuario en ceremonias agiles: durante una sesion de refinamiento, el equipo pega la descripcion funcional de una historia y el modelo propone escenarios de aceptacion que sirven como base de discusion.
- Automatizacion de pipelines de pruebas: los escenarios generados se incorporan a un repositorio de ficheros `.feature` y se ejecutan con Cucumber en integracion continua, siempre que un humano revise previamente la salida.
- Conversion de encuestas de producto en especificaciones verificables: el equipo de producto transforma comentarios abiertos de usuarios en criterios comprobables que alimentan el backlog.
- Asistencia dentro del IDE o de la plataforma de gestion: al ser un adaptador de 0,1 GB sobre un modelo de 3B, puede servirse de forma local y responder con baja latencia a peticiones de generacion de escenarios sin enviar datos a terceros.
- Prototipado rapido de suites de regresion para aplicaciones legacy: a partir de la descripcion textual del comportamiento actual de un modulo, el modelo redacta escenarios que documentan el comportamiento esperado antes de refactorizar.
- Generacion de documentacion ejecutable: los escenarios Gherkin sirven simultaneamente como especificacion y como prueba automatizada, lo que resulta util en equipos que aplican especificacion por ejemplo.
- Ajuste posterior especifico de dominio: al ser un adaptador LoRA ligero, puede servir como punto de partida para adaptaciones adicionales con datos propios de un dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de evaluacion, y la busqueda web realizada no devolvio ningun enlace relacionado con el modelo, su entrenamiento o su evaluacion.

## Requisitos de hardware

- VRAM estimada para el modelo base de 3B: aproximadamente 6-7 GB en precision de 16 bits y en torno a 2-3 GB en cuantizacion de 4 bits.
- El adaptador LoRA en si ocupa alrededor de 0,1 GB, segun el tamano del repositorio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para cuantizacion de 4 bits (RTX 3060, RTX 4060, RTX 4070); para precision completa de 16 bits, a partir de 12-16 GB (RTX 4080, RTX 4090, A10, L4).
- Si cabe en GPU de consumo: si, en la mayoria de tarjetas graficas de gama media y alta lanzadas desde 2019, siempre que se use cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta presente en el repositorio) y endpoints compatibles (etiqueta `endpoints_compatible`). Para llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y convertir los pesos a GGUF, paso no documentado por el autor. vLLM es viable si se fusionan los pesos previamente.
- Latencia y throughput estimados: no disponibles; ningun dato publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|---|
| `mrchrislau/feedback-to-gherkin-lora` | ~3B (base) + LoRA | No disponible | Ingles | Apache 2.0 declarada (sujeta a licencia del base) | Hugging Face, 0 descargas | Ajuste especifico para feedback a Gherkin |
| `unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit` | ~3B | 128 000 tokens segun Meta | Multilingue (el base declara 8 idiomas) | Llama 3.2 Community License | Ampliamente disponible | Modelo instructivo generalista, origen de este ajuste |
| `Qwen/Qwen2.5-3B-Instruct` | ~3B | 32 768 tokens nativos (ampliable) | Multilingue | Apache 2.0 | Ampliamente disponible | Modelo instructivo generalista, alternativa de igual tamano |
| `microsoft/Phi-3.5-mini-instruct` | ~3,8B | 128 000 tokens | Multilingue | MIT | Ampliamente disponible | Modelo instructivo generalista con buen rendimiento en razonamiento |

No se han localizado adaptadores publicos directamente comparables en la tarea concreta de conversion de retroalimentacion a Gherkin, por lo que la comparativa se limita a la categoria de modelos base de tamano similar. No hay datos de benchmark que permitan comparar rendimiento real en la tarea objetivo.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, pruebas de calidad ni ejemplos de entrada y salida publicados. No es posible estimar la tasa de acierto en la tarea de conversion a Gherkin sin evaluarla por cuenta propia.
- Model card practicamente vacia: se desconoce el dataset de entrenamiento, el numero de pasos, la estrategia de enmascarado de perdida y cualquier detalle de reproducibilidad.
- Idiomas: el repositorio declara unicamente ingles, de modo que la generacion de escenarios Gherkin en castellano quedaria fuera del ambito previsto y probablemente degradada.
- Riesgo de alucinacion: un modelo de 3B ajustado con LoRA tiende a inventar pasos, condiciones o resultados esperados que no se derivan del texto de retroalimentacion original. Toda salida Gherkin debe revisarse antes de incorporarla a una suite de pruebas.
- Degradacion potencial de capacidades generales: el ajuste especifico puede haber reducido el rendimiento del modelo base en otras tareas, incluido el uso de herramientas y el razonamiento multi-paso.
- Licencia y modelo base: aunque el repositorio declara Apache 2.0, el modelo deriva de Llama 3.2, sujeto a la Llama 3.2 Community License. Esa licencia impone obligaciones de atribucion, condiciones de uso aceptable y una clausula especifica para productos con mas de 700 millones de usuarios mensuales. Conviene verificar la compatibilidad antes de un uso comercial, ya que la declaracion Apache 2.0 del autor no exime de las obligaciones heredadas del base.
- Cuantizacion de origen: el modelo base usado durante el ajuste esta cuantizado en 4 bits, lo que introduce una perdida de precision que se arrastra al adaptador.
- Adopcion nula: cero descargas y cero likes implican ausencia de validacion por parte de la comunidad y ningun historial de incidencias resueltas.
- Formato de distribucion: al parecer se distribuye solo como adaptador LoRA, sin pesos fusionados ni GGUF, lo que anade un paso manual de fusion y conversion para desplegarlo con llama.cpp, Ollama o vLLM.
- Fecha de creacion inusual: los metadatos indican 2026-10-07, posterior a la fecha habitual de publicacion de modelos de esta familia; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mrchrislau/feedback-to-gherkin-lora
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit
- Unsloth (framework de entrenamiento citado en la model card): https://github.com/unslothai/unsloth
- Busqueda web: no se han encontrado enlaces relevantes sobre este modelo, su entrenamiento, su evaluacion ni su aplicacion practica. Los resultados devueltos por la busqueda no guardan relacion con el modelo y han sido descartados.
