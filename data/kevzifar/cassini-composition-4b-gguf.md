# KevziFar/cassini-composition-4b-GGUF

## Resumen

Cassini composition 4B es un modelo de lenguaje especializado en la traduccion de peticiones en lenguaje natural a planes de comandos tipados para Cassini, una interfaz conversacional offline para sistemas de informacion geografica (SIG) que opera sobre QGIS. Lo desarrolla KevziFar y se distribuye unicamente en formato GGUF cuantizado Q4_K_M, derivado del modelo base Qwen/Qwen3.5-4B mediante un ajuste fino con LoRA sobre un conjunto de datos sinteticos.

El modelo no esta pensado para conversacion general ni generacion libre de texto: su funcion es emitir secuencias de comandos estructurados que el nucleo de Cassini valida antes de su ejecucion y que el usuario revisa y aprueba manualmente. Esto lo convierte en un componente de un pipeline deterministico mas que en un asistente conversacional autonomo.

Su relevancia actual radica en el caracter totalmente offline del sistema (carga via llama.cpp dentro del proceso del nucleo, sin conexion de red) y en su tamano reducido, que permite ejecucion local en equipos de trabajo de oficinas tecnicas, administraciones publicas o estudiantes. La licencia Apache-2.0 facilita su integracion y redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, ajustada con LoRA y fusionada) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | frances (entrenado), ingles (solo documentacion; no evaluado) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4.300 millones de parametros, bajo licencia Apache-2.0 de Alibaba Cloud. Sobre esa base se aplico un adaptador LoRA entrenado con un conjunto de datos sinteticos generado por el propio generador del repositorio de Cassini (directorio `training/`), compuesto por peticiones en frances y el plan de comandos esperado como salida. No se emplearon datos de terceros. El entrenamiento se realizo en varias sesiones sucesivas.

Posteriormente el adaptador se fusiono en los pesos de la base, se convirtio a GGUF y se cuantizo a Q4_K_M con llama.cpp. El artefacto resultante pesa 2.783.446.944 bytes (unos 2,78 GB) y su SHA-256 es `97bdc957e980bba98e9c1775e1d10a0f14d9e1c31a9446458ab5b54eb799f41a`, empleado por los instaladores de Cassini para verificar la descarga. No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa ni modos de razonamiento extendido) mas alla de las propias del modelo base.

## Capacidades

- Transformacion de peticiones en frances a planes de comandos tipados del registro de Cassini (zonas tampon, intersecciones, selecciones, calculo de pendiente, campos de vision, exportacion de mapas a PDF).
- Generacion estructurada y restringida: no produce respuestas libres, solo planes verificables por el nucleo.
- Operacion completamente offline mediante llama.cpp, sin acceso a red.
- Capacidad de rechazo: puede declinar peticiones que considera fuera de su registro de comandos.
- Soporte de conversacion multi-turno limitado al contexto de la tarea de composicion (no evaluado como asistente general).
- No se documenta soporte de tool calling generico, function calling, agentes multi-paso, vision ni audio.
- Capacidades multilingues limitadas al frances; el ingles figura en los metadatos pero no ha sido evaluado.

## Casos de uso

- Analisis cartografico en oficinas tecnicas: un tecnico de urbanismo escribe en frances "calcula la zona tampon de 200 metros alrededor de esta capa" y el modelo genera el plan de comandos que Cassini valida y ejecuta en QGIS.
- Estudios ambientales: generacion de intersecciones entre capas de habitats y areas protegidas mediante comandos tipados, con revision previa del plan por parte del usuario.
- Administraciones publicas y colectividades: gestion de selecciones y filtros sobre datos catastrales o de planeamiento sin conexion a servicios en la nube, lo que satisface requisitos de soberania de datos.
- Docencia universitaria: estudiantes de geografia o teledeteccion practican operaciones SIG describiendolas en lenguaje natural, con el modelo como traductor a comandos verificables.
- Calculo de pendientes y campos de vision: soporte a estudios de implantacion (por ejemplo, evaluacion de visibilidad de infraestructuras) mediante la generacion del plan de comandos correspondiente.
- Exportacion de cartografia a PDF: automatizacion de la composicion de mapas finales a partir de instrucciones en frances, con validacion manual del plan antes de la ejecucion.
- Despliegue en entornos aislados: instalacion en equipos de campo o redes air-gapped donde no se permite el acceso a APIs externas, gracias a su tamano reducido y a la carga local via llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB con la cuantizacion Q4_K_M publicada (fichero de 2,78 GB mas overhead de contexto y cache KV).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM; tambien es viable en CPU.
- Cabe en GPU consumer: si, en modelos como GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: llama.cpp (via oficial segun la model card); otros runners compatibles con GGUF (Ollama, llama-cpp-python) no estan documentados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Cassini composition 4B | 4.326 M | no disponible | GGUF Q4_K_M | Apache-2.0 | Composicion de comandos SIG en frances |
| Qwen3.5-4B (base) | ~4.300 M | no disponible en esta ficha | safetensors, GGUF | Apache-2.0 | Proposito general, multilingue |
| Alternativas especializadas en SIG | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos especializados en composicion de comandos para SIG con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo puede proponer planes incorrectos o rechazar peticiones validas; por diseno, Cassini exige validacion humana del plan antes de ejecutar.
- Ajustado exclusivamente para frances; el rendimiento en otras lenguas no ha sido evaluado y los metadatos que declaran ingles no implican calidad contrastada.
- No disenado ni evaluado para conversacion general, generacion de codigo ni otros usos fuera del registro de comandos de Cassini.
- Entrenado con datos sinteticos generados por el propio proyecto, lo que puede introducir sesgos de distribucion respecto a peticiones reales de usuarios.
- Riesgo de alucinacion en la composicion de comandos: puede generar comandos sintacticamente validos pero semanticamente incorrectos para la intencion del usuario.
- La longitud de contexto no esta documentada, lo que dificulta planificar tareas con historiales largos.
- Licencia Apache-2.0 permisiva para uso comercial, pero el modelo base Qwen3.5-4B conserva su NOTICE de Alibaba Cloud, que debe mantenerse en la redistribucion.
- Solo se publica una cuantizacion (Q4_K_M); no hay variantes de mayor o menor precision para ajustar calidad o consumo de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KevziFar/cassini-composition-4b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Proyecto Cassini: https://kevzi.github.io/cassini-gis
- Contacto del autor: cassini-sig@proton.me
