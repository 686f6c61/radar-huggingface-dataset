# Deepak8558e8/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de vision, publicado en Hugging Face por el usuario Deepak8558e8 bajo licencia Apache 2.0. Se presenta como parte de la familia Qwen3.8, que la model card describe como la generacion mas capaz de la familia de modelos abiertos Qwen hasta la fecha, construida sobre la base arquitectonica de Qwen3.5. El modelo combina comprension nativa de imagen y video con control flexible del modo de razonamiento, y esta orientado a tareas de codigo, trabajo profesional, investigacion y tareas agenticas de horizonte largo.

Con 27.781.427.952 parametros reales (segun los safetensors) y un repositorio de 55,6 GB, se trata de un modelo denso de 27B con ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000. La arquitectura es hibrida: intercala capas de atencion lineal (Gated DeltaNet) con capas de atencion completa (Gated Attention) en un patron de 16 bloques de 4 capas, e incorpora prediccion multi-token (MTP) entrenada con varios pasos. Es relevante ahora porque ofrece capacidades multimodales y agenticas en un tamano desplegable en infraestructura de una sola maquina de gama alta, con pesos en formato Transformers compatibles con vLLM, SGLang y TokenSpeed.

La model card incluye una tabla de benchmarks que compara el modelo con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, aunque los valores numericos de esa tabla no estan disponibles en la informacion proporcionada. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y el autor del repositorio no coincide con el organizador oficial de Qwen, lo que conviene tener en cuenta al evaluar la procedencia de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con codificador de vision; capas Gated DeltaNet (atencion lineal) intercaladas con Gated Attention (atencion completa); MTP |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

Otros datos de arquitectura recogidos en la model card:

| Parametro | Valor |
|---|---|
| Dimension oculta | 5120 |
| Token embedding | 248.320 (con padding) |
| Numero de capas | 64 |
| Layout oculto | 16 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Gated DeltaNet: cabezas de atencion lineal | 48 para V y 16 para QK; dimension de cabeza 128 |
| Gated Attention: cabezas | 24 para Q y 4 para KV; dimension de cabeza 256; RoPE dim 64 |
| FFN: dimension intermedia | 17.408 |
| LM output | 248.320 (con padding) |
| MTP | entrenado con multiples pasos |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de vision, entrenado en dos etapas (pre-entrenamiento y post-entrenamiento). La innovacion estructural principal es el layout hibrido: cada bloque de 4 capas contiene 3 capas de Gated DeltaNet (atencion lineal con 48 cabezas para V y 16 para QK, dimension de cabeza 128) seguidas de 1 capa de Gated Attention (24 cabezas para Q y 4 para KV, dimension de cabeza 256, RoPE de 64 dimensiones). Este patron reduce el coste de atencion en contextos largos manteniendo capas de atencion completa periodicas. La FFN tiene dimension intermedia de 17.408 y el vocabulario de embedding y salida es de 248.320 entradas con padding.

El entrenamiento incluye prediccion multi-token (MTP) con varios pasos, lo que habilita decodificacion especulativa nativa y puede mejorar el throughput de generacion. La model card menciona post-entrenamiento pero no detalla el numero de tokens de pre-entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO. El modo de razonamiento (thinking) esta activado por defecto, puede desactivarse por peticion, su profundidad se ajusta con `reasoning_effort` y el contexto de razonamiento de mensajes historicos se conserva mediante `preserve_thinking`.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto, desactivable por peticion y con profundidad ajustable mediante `reasoning_effort`.
- Comprension nativa de imagenes y videos, incluidos diagramas STEM, documentos y videos de hasta una hora de duracion.
- Codigo y trabajo profesional: la model card declara mejoras sustanciales en codificacion, trabajo profesional e investigacion.
- Tareas agenticas de horizonte largo: planificacion autonoma y manejo de retroalimentacion del entorno para completar tareas de extremo a extremo.
- Control flexible del razonamiento: retencion del contexto de razonamiento historico con `preserve_thinking`.
- Compatibilidad con arneses y herramientas de desarrollo populares, segun la model card.
- Prediccion multi-token (MTP) entrenada, util para decodificacion especulativa.
- Soporte de tool calling / function calling: no disponible (no se detalla en la informacion proporcionada).
- Capacidades multilingues: no disponible (no se enumeran idiomas).

## Casos de uso

- Codificacion agentica en terminal: el modelo esta evaluado en Terminal Bench 2.1 (Terminus) y declara planificacion autonoma con manejo de retroalimentacion del entorno, por lo que encaja en agentes que ejecutan comandos, interpretan errores y corrigen iterativamente en un entorno de shell.
- Analisis de documentos tecnicos y diagramas STEM: con codificador de vision nativo, puede procesar figuras, tablas y diagramas de papers o documentacion junto al texto, util para extraccion de especificaciones y resumen tecnico.
- Comprension de videos de larga duracion: la model card indica soporte para videos de hasta una hora, lo que permite resumir reuniones, generar actas o extraer eventos de grabaciones extensas.
- Asistencia a investigacion: combinando razonamiento con `reasoning_effort` ajustable y contexto de 262.144 tokens, permite trabajar sobre corpus largos de articulos y notas manteniendo coherencia entre secciones.
- Automatizacion de tareas profesionales multi-paso: con contexto extensible hasta 1.000.000 tokens, puede mantener el estado de flujos largos (tramitacion, analisis de expedientes) sin truncar el historial.
- Integracion en pipelines de desarrollo existentes: la model card declara compatibilidad con vLLM, SGLang, TokenSpeed y Transformers, lo que facilita desplegarlo como servicio detras de herramientas de desarrollo ya adoptadas.
- Razonamiento con traza persistente: `preserve_thinking` permite conservar el razonamiento de turnos anteriores en conversaciones multi-turno, util en depuracion de agentes y auditoria de decisiones.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorias (por ejemplo, codificacion agentica en terminal con Terminal Bench 2.1 Terminus). Sin embargo, los valores numericos de esa tabla no estan disponibles en la informacion proporcionada, por lo que no se reproducen.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa a partir del tamano (27B parametros), en BF16 se necesitan aproximadamente 55,6 GB solo para pesos, mas memoria para KV cache y activaciones; en cuantizaciones de 8 bits o 4 bits el requisito baja proporcionalmente, pero no se confirman formatos de cuantizacion soportados.
- GPU recomendadas: no disponible. Para BF16 hacen falta GPU con 80 GB (A100 80GB, H100) o varias GPU en paralelo; el contexto nativo de 262.144 tokens incrementa de forma notable la memoria de KV cache.
- Cabe en consumer GPU: no disponible de forma confirmada. En BF16 no cabe en GPU de consumo; en cuantizaciones agresivas podria plantearse en GPUs de 24 GB, pero el fabricante no documenta cuantizaciones.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, segun la model card. Tambien se menciona un servicio gestionado (Qwen Cloud) con contexto de 1M por defecto y herramientas integradas, anunciado como proximo.
- Latencia y throughput estimados: no disponible. La presencia de MTP entrenado sugiere que la decodificacion especulativa puede mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B (denso) | 262.144 nativo, hasta 1.000.000 | Apache 2.0 | Pesos en HF (repo de terceros) | Vision-lenguaje nativo, MTP, thinking control |
| Qwen3.6-27B | no disponible | no disponible | no disponible | Referenciado en la tabla de la model card | Generacion anterior de la familia |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | Referenciado en la tabla de la model card | Variante Plus de la familia |
| Muse Glimmer-30B | 30B (segun nombre) | no disponible | no disponible | Referenciado en la tabla de la model card | Modelo comparable de otro fabricante |
| Opus4.6 Max | no disponible | no disponible | no disponible | Referenciado en la tabla de la model card | Referencia comercial de gama alta |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada; la model card solo enumera los modelos de comparacion sin que se hayan podido recuperar los valores.

## Limitaciones y advertencias

- Procedencia: el repositorio pertenece al usuario Deepak8558e8, no a la organizacion oficial de Qwen. La model card esta redactada como si fuera oficial, pero conviene verificar la autenticidad de los pesos antes de usarlos en produccion.
- Sesgos conocidos: no disponible; la model card no documenta sesgos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo de gran tamano, es esperable, pero no hay datos oficiales.
- Limitaciones de contexto o idioma: el contexto nativo es de 262.144 tokens y la extension a 1.000.000 se anuncia para el servicio gestionado; no se enumeran idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al no poder confirmar la procedencia del repositorio, la licencia aplicada por el autor no garantiza por si sola los derechos sobre los pesos originales.
- Cuantizaciones: no se documentan formatos soportados, lo que limita el despliegue en hardware de gama media sin trabajo adicional de conversion.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Servicio gestionado: Qwen Cloud se anuncia como "coming soon"; no hay disponibilidad confirmada ni condiciones de uso publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Deepak8558e8/Qwen3.8-27B
- Pagina del servicio Qwen Cloud para Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com
