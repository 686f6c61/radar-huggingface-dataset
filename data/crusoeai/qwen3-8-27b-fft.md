# crusoeai/Qwen3.8-27B-FFT

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso con codificador de vision, desarrollado por el equipo Qwen (Alibaba) y publicado en el repositorio `crusoeai/Qwen3.8-27B-FFT`, que redistribuye los pesos del modelo post-entrenado. Se presenta como la generacion mas capaz de la familia abierta Qwen, construida sobre la base arquitectonica de Qwen3.5, y esta disenado para cargas de trabajo de codigo, tareas profesionales, investigacion y agentes de horizonte largo. El repositorio tiene un tamano de 55,6 GB y 27.781.427.952 parametros reales declarados en los archivos safetensors.

Su rasgo diferencial es la combinacion de atencion lineal y atencion completa en un mismo transformer: 64 capas organizadas en 16 bloques de la forma 3 x (Gated DeltaNet -> FFN) + 1 x (Gated Attention -> FFN), lo que reduce el coste del cache de clave-valor frente a un transformer denso equivalente. Ademas incorpora Multi-Token Prediction (MTP) entrenado con varios pasos, lo que habilita decodificacion especulativa nativa.

El modelo es nativamente multimodal (imagen y video ademas de texto) y ofrece control flexible del razonamiento: el modo thinking viene activado por defecto, se puede desactivar por peticion y su profundidad se regula con `reasoning_effort`. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000, y se distribuye bajo licencia Apache 2.0, lo que lo hace apto para uso comercial sin restricciones de peso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido (Gated DeltaNet de atencion lineal + Gated Attention) con codificador de vision |
| Parametros totales | 27.781.427.952 (27,8B), segun safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (no se publican cuantizaciones oficiales) |
| Idiomas soportados | No disponible (la model card no desglosa idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed |
| Dimension oculta | 5.120 |
| Numero de capas | 64 |
| Token embedding / LM output | 248.320 (padded) |
| FFN (dimension intermedia) | 17.408 |
| Etapa de entrenamiento | Pre-entrenamiento y post-entrenamiento |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con layout hibrido. Cada bloque de 4 capas contiene 3 sub-bloques de Gated DeltaNet (atencion lineal) seguidos de 1 sub-bloque de Gated Attention (atencion completa), repetido 16 veces para un total de 64 capas. El Gated DeltaNet emplea 48 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. La Gated Attention usa 24 cabezas para Q y 4 para KV, con dimension de cabeza 256 y dimension de Rotary Position Embedding de 64. La consecuencia practica es que solo 16 de las 64 capas mantienen cache KV completo, lo que reduce de forma notable la memoria de contexto frente a un transformer denso de tamano similar.

El modelo incluye un codificador de vision que lo convierte en un sistema image-text-to-text nativo, capaz de procesar imagenes y videos (la model card menciona diagramas STEM, documentos y videos de hasta una hora de duracion). Se entrena tambien con Multi-Token Prediction con varios pasos, una tecnica que permite decodificacion especulativa sin necesidad de un modelo borrador separado. La model card indica que paso por pre-entrenamiento y post-entrenamiento, pero no detalla el volumen de tokens, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO, por lo que esos datos no estan disponibles.

Sobre el sufijo `FFT` del repositorio: no hay documentacion en la informacion proporcionada que describa el proceso de ajuste, los datos usados ni la diferencia respecto a los pesos originales de Qwen3.8-27B. El repositorio conserva la model card del modelo base.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto, desactivable por peticion.
- Control de profundidad de razonamiento mediante el parametro `reasoning_effort`.
- Retencion del contexto de razonamiento de mensajes historicos mediante `preserve_thinking`.
- Generacion y comprension de codigo, incluida ejecucion de tareas en terminal de forma agentica (evaluado en Terminal Bench 2.1 con variante Terminus).
- Comprension nativa de imagenes: diagramas tecnicos, documentos escaneados, graficos cientificos.
- Comprension de video, incluidos contenidos de escala horaria segun la model card.
- Planificacion autonoma y manejo de retroalimentacion del entorno en tareas de multiples pasos.
- Soporte de tool calling / function calling: la version alojada menciona herramientas integradas oficiales; el uso local depende del harness.
- Compatibilidad con harnesses y herramientas de desarrollo populares (la model card cita compatibilidad downstream ampliada sin enumerar cuales).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de codificacion en terminal: el modelo puede ejecutar bucles de edicion-compilacion-test de forma autonoma, interpretar la salida de la shell y corregir errores en pasos sucesivos. Su contexto de 262.144 tokens permite arrastrar el historial completo de una sesion de depuracion larga sin truncar.
- Analisis de documentacion tecnica escaneada: al ser multimodal nativo, puede extraer informacion de PDF con diagramas, planos o tablas y responder preguntas sobre ellos sin pipeline OCR externo.
- Revision de video para control de calidad industrial: la comprension de video permite procesar grabaciones largas (hasta escala horaria) y generar informes de incidencias con marcas temporales.
- Asistente de investigacion sobre corpus extensos: con contexto extensible a 1M tokens, admite cargar articulos completos, patentes o expedientes y hacer preguntas cruzadas manteniendo coherencia global.
- Automatizacion de soporte tecnico multi-turno: el control de `reasoning_effort` permite usar razonamiento ligero en consultas simples y profundo en incidencias complejas, ajustando coste y latencia por peticion.
- Generacion de codigo en CI/CD: integrado mediante vLLM o SGLang, puede revisar diffs, proponer parches y ejecutar tareas de refactorizacion en pipelines, con explicaciones del razonamiento desactivables para reducir tokens de salida.
- Extraccion estructurada de informacion a partir de imagenes: facturas, formularios, capturas de pantalla de paneles de monitorizacion, convirtiendo el contenido visual en JSON validado.
- Copiloto interno sobre base de conocimiento corporativa: la licencia Apache 2.0 permite desplegarlo en infraestructura propia sin obligaciones de publicacion de codigo derivado.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativa con las columnas Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. La informacion recuperada solo conserva la estructura de la tabla (categoria "Coding", metrica "Terminal Bench 2.1 (Terminus)"), no los valores numericos, por lo que no es posible reproducir las cifras.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Resto de categorias (texto y vision) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible los valores numericos de MMLU, HumanEval, GSM8K ni de ningun otro benchmark. Se recomienda consultar la model card original en Hugging Face para obtener las cifras completas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 55,6 GB solo para pesos (coincide con el tamano del repositorio), mas cache de activaciones y contexto.
- VRAM estimada en cuantizacion INT8: aproximadamente 28 GB para pesos.
- VRAM estimada en cuantizacion INT4: aproximadamente 14-16 GB para pesos, mas overhead de runtime y cache.
- Cache KV estimado: dado que solo 16 de las 64 capas usan atencion completa, con 4 cabezas KV de dimension 256 en BF16 el coste es de unos 64 KiB por token, es decir, en torno a 6,5 GB a 100.000 tokens y unos 17 GB a 262.144 tokens. Es una estimacion derivada de la configuracion publicada, no un dato oficial.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB, o configuraciones multigpu (2 x 48 GB) con tensor parallelism.
- GPU consumer: cabe en una RTX 4090 de 24 GB o RTX 5090 solo con cuantizacion de 4 bits y contexto reducido; en precision nativa no cabe en ninguna GPU consumer actual.
- Opciones de despliegue confirmadas por la model card: Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Otras opciones (llama.cpp, Ollama, TGI): no disponibles en la informacion proporcionada; no hay cuantizaciones GGUF publicadas en el repositorio.
- Latencia y throughput: no disponibles. La presencia de MTP entrenado con multiples pasos deberia habilitar decodificacion especulativa y mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B (este repositorio) | 27,8B denso | 262.144 nativos, hasta 1.000.000 | Apache 2.0 | Pesos abiertos en HF | No disponible |
| Qwen3.6-27B | no disponible | no disponible | no disponible | Citado en la model card como generacion anterior | No disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | Citado en la model card | No disponible |
| Muse Glimmer-30B | 30B (segun denominacion) | no disponible | no disponible | Citado en la model card | No disponible |
| Opus4.6 Max | no disponible | no disponible | Propietaria (servicio cerrado) | Solo API | No disponible |

Los cuatro modelos comparativos aparecen unicamente como cabeceras de columna en la tabla de benchmarks de la model card. No se dispone de sus especificaciones tecnicas ni de sus resultados numericos en la informacion proporcionada.

## Limitaciones y advertencias

- No hay datos publicados de benchmarks numericos en la informacion disponible: cualquier afirmacion de superioridad frente a otras generaciones debe verificarse en la model card original.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de razonamiento largo con retroalimentacion ambigua del entorno.
- Sesgos: la model card no incluye ninguna seccion de analisis de sesgos, evaluacion de seguridad ni limitaciones conocidas. No se puede evaluar su comportamiento en dominios sensibles.
- Idiomas: no se especifica la cobertura linguistica ni la calidad relativa por idioma. Para produccion en castellano deberia validarse con un conjunto de evaluacion propio.
- Procedencia del ajuste: el repositorio es una redistribucion con sufijo `FFT` bajo la organizacion `crusoeai`, pero no se documenta el proceso de ajuste ni como difiere de los pesos originales. Conviene tratar los pesos como no verificados respecto al modelo base.
- Compatibilidad de plantilla de chat: el control de `reasoning_effort` y `preserve_thinking` depende del harness; un uso incorrecto de la plantilla puede degradar la calidad de forma silenciosa.
- Consumo de memoria: en precision nativa requiere 80 GB de VRAM o paralelismo multi-GPU. El despliegue en GPU consumer obliga a cuantizacion agresiva, con perdida de calidad no cuantificada.
- Contexto extensible a 1M: la ventana de 1.000.000 tokens requiere tecnicas de extension de contexto cuyos parametros y degradacion asociada no se detallan.
- Licencia: Apache 2.0 permite uso comercial y modificacion sin restricciones de copyleft, pero conviene revisar la model card original por si incorpora terminos adicionales no reflejados en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/crusoeai/Qwen3.8-27B-FFT
- Pagina del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Servicio gestionado Qwen Cloud: https://www.qwencloud.com

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados correspondian a un helicoptero NH90). No se han podido localizar papers, blogs tecnicos ni repositorios adicionales.
