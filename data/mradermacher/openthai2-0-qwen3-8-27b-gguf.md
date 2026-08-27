# mradermacher/openthai2.0-qwen3.8-27b-GGUF

## Resumen

OpenThai 2.0 Qwen3.8-27B es un modelo de visión-lenguaje (vision-language) desarrollado por iapp, una organización tailandesa, sobre la base del modelo Qwen3.8-27B. Está diseñado específicamente para el idioma tailandés, con capacidades avanzadas de comprensión de documentos, OCR y lectura de escritura manual, además de mantener la inteligencia general del modelo base. El repositorio que nos ocupa contiene las cuantizaciones GGUF realizadas por mradermacher, que permiten ejecutar el modelo en hardware de consumo con diferentes niveles de precisión y uso de memoria.

El modelo se presenta como una solución "todo en uno" para el tailandés: lee documentos y manuscritos a nivel de especialista, responde con conocimiento tailandés en un lenguaje natural y explicativo, y lidera a su modelo base y a Typhoon 2.5 en uso de herramientas agénticas (según el benchmark BFCL). Con 27.320 millones de parámetros y licencia Apache 2.0, es una opción atractiva para aplicaciones comerciales y de investigación que requieran procesamiento de texto e imágenes en tailandés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3.8-27B, transformer con componente multimodal) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | tailandes (th), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base tambien dispone de safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en los datos proporcionados. Por el nombre y la descripcion, se trata de un modelo de vision-lenguaje basado en Qwen3.8-27B, al que se anade un proyector multimodal (mmproj) para procesar imagenes. El modelo base Qwen3.8-27B es un transformer denso de 27.000 millones de parametros, aunque no se especifican detalles como el numero de capas, dimensiones ocultas o atencion.

En cuanto al entrenamiento, la informacion disponible indica que OpenThai 2.0 fue fine-tuning de Qwen3.8-27B con datos tailandeses, incluyendo documentos, escritura manual y conocimiento cultural. No se han publicado detalles sobre el volumen de tokens, la composicion del dataset ni si se utilizaron tecnicas como RLHF o DPO. La cuantizacion GGUF fue realizada por mradermacher mediante conversion estatica, sin usar imatrix ni pesos ponderados.

## Capacidades

- Comprension de documentos tailandeses: OCR de alta precision sobre documentos impresos y digitales, incluyendo texto en imagenes.
- Lectura de escritura manual: reconocimiento de manuscritos tailandeses a nivel de especialista, segun la descripcion del modelo base.
- Conocimiento cultural y linguistico tailandes: respuestas en tailandes natural y explicativo, con conocimiento local.
- Tool calling y uso de agentes: lidera a su modelo base y a Typhoon 2.5 en el benchmark BFCL (Berkeley Function Calling Leaderboard), lo que indica capacidad para invocar funciones y herramientas externas.
- Razonamiento general: mantiene la inteligencia general del modelo base Qwen3.8-27B, incluyendo matematicas, codigo y razonamiento logico.
- Multilingue: soporta tailandes e ingles, con capacidad de traduccion y comprension cruzada.
- Vision: gracias al proyector multimodal (mmproj), puede procesar imagenes y extraer informacion visual.

## Casos de uso

- Atencion al cliente automatizada en tailandes: el modelo puede gestionar conversaciones multi-turno con clientes tailandeses, comprendiendo consultas escritas y extrayendo informacion de capturas de pantalla o documentos adjuntos gracias a su capacidad multimodal.
- Digitalizacion de archivos historicos: instituciones publicas o bibliotecas pueden usar el modelo para transcribir documentos antiguos tailandeses, incluyendo escritura manual, convirtiendo imagenes en texto estructurado.
- Procesamiento de facturas y formularios: empresas que operan en Tailandia pueden automatizar la extraccion de datos de facturas, recibos y formularios escaneados, reduciendo la intervencion manual.
- Asistentes virtuales con integracion de herramientas: el modelo puede actuar como agente que llama a APIs externas (consultas a bases de datos, reservas, pagos) gracias a su soporte de tool calling, superando a alternativas locales como Typhoon.
- Traduccion y localizacion: al dominar tailandes e ingles, puede traducir documentos, interfaces de usuario o contenido web, manteniendo el contexto cultural.
- Analisis de imagenes medicas o tecnicas con texto tailandes: en entornos donde los informes contienen anotaciones manuscritas, el modelo puede interpretar y resumir la informacion visual y textual.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La descripcion del modelo base menciona que lidera a su base (Qwen3.8-27B) y a Typhoon 2.5 en el benchmark BFCL de tool calling, pero no se proporcionan puntuaciones concretas. Tampoco hay datos de MMLU, HumanEval, GSM8K u otros benchmarks estandar. Se recomienda consultar la pagina del modelo base para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el tipo de cuantizacion, desde 11 GB (Q2_K) hasta 29 GB (Q8_0). El proyector multimodal (mmproj) anade entre 0,7 y 1,0 GB adicionales.
- GPU recomendadas: para cuantizaciones Q4_K_M (16,9 GB) o inferiores, una GPU de consumo con 24 GB de VRAM (RTX 3090, RTX 4090) es suficiente. Para Q8_0 (29 GB) se necesita una GPU profesional como A100 40GB o H100, o bien usar CPU con suficiente RAM.
- Compatibilidad con consumer GPU: si, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de 16-24 GB, aunque con perdida de calidad progresiva.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), text-generation-webui y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible. Depende del hardware y la cuantizacion; en una RTX 4090 con Q4_K_M se esperan velocidades de 20-40 tokens/s, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai 2.0 Qwen3.8-27B | 27,3B | no disponible | Tailandes, vision, tool calling | Apache 2.0 | GGUF, safetensors |
| Typhoon 2.5 | no disponible | no disponible | Tailandes | no disponible | no disponible |
| Qwen3.8-27B (base) | 27,3B | no disponible | General | Apache 2.0 | GGUF, safetensors |

Segun la descripcion del modelo base, OpenThai 2.0 supera a Typhoon 2.5 en tool calling (BFCL) y mantiene la inteligencia general de Qwen3.8-27B. No se dispone de comparaciones cuantitativas adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado informacion sobre sesgos especificos. Como modelo entrenado principalmente con datos tailandeses, puede tener sesgos culturales o linguisticos propios de esa region.
- Riesgo de alucinacion: inherente a todos los modelos de lenguaje; en tareas de OCR y comprension de documentos, puede inventar texto si la imagen es ambigua o de baja calidad.
- Limitaciones de contexto: la longitud de contexto no esta documentada; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener la atribucion y los avisos de licencia.
- Cuantizacion: las versiones GGUF de baja precision (Q2_K, Q3_K) pueden degradar significativamente la calidad de salida, especialmente en tareas de vision y OCR. Se recomienda usar Q4_K_M o superior para resultados fiables.
- Dependencia del proyector multimodal: para tareas de vision, es imprescindible cargar el archivo mmproj correspondiente; omitirlo limitara el modelo a texto puro.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/openthai2.0-qwen3.8-27b-GGUF
- Modelo base: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b
- Pagina oficial de OpenThai 2.0: https://iapp.co.th/openmodels/openthai2p0
- Documentacion de Qwen3.8 (Unsloth): https://unsloth.ai/docs/models/qwen3.8
- Guia de ejecucion local de Qwen3.8-27B: https://dev.to/purpledoubled/run-qwen-38-27b-locally-real-gguf-sizes-the-kv-cache-trick-and-the-template-trap-114j
