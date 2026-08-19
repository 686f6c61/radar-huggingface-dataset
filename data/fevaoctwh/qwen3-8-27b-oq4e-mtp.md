# fevaoctwh/Qwen3.8-27B-oQ4e-mtp

## Resumen

Qwen3.8-27B-oQ4e-mtp es una versión cuantizada en precisión mixta de 4 bits del modelo multimodal Qwen3.8-27B, desarrollado por el equipo de Qwen (Alibaba). La cuantización ha sido realizada por el usuario fevaoctwh con la herramienta oQ/oMLX v0.5.7, específicamente para ejecutarse en Apple Silicon mediante el framework MLX. El modelo base es un transformer denso de 27 000 millones de parámetros con arquitectura `qwen3_5`, capaz de procesar texto, imagen y vídeo, con una ventana de contexto nativa de 262 000 tokens.

Esta versión cuantizada reduce el tamaño de los pesos a aproximadamente 17 GB, lo que permite ejecutar el modelo completo en equipos con 24 GB de memoria unificada, manteniendo un rendimiento de generación de entre 52 y 64 tokens por segundo en hardware Apple M5 Max. La cuantización emplea un esquema de precisión mixta: la mayoría de las capas se mantienen en 4 bits, mientras que las capas sensibles (proyecciones de atención, down_proj del MLP y algunas proyecciones de salida) se conservan en 5 bits para minimizar la pérdida de calidad. El modelo hereda la licencia Apache-2.0 del modelo original.

La relevancia de esta ficha radica en que ofrece una opción práctica para desplegar un modelo multimodal de 27B en hardware de consumo (Apple Silicon) sin necesidad de GPUs dedicadas, con una degradación de calidad controlada gracias a la calibración con imatrix y la selección cuidadosa de capas de mayor precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso, multimodal texto+imagen+vídeo) |
| Parametros totales | 27 000 millones (modelo base); el archivo cuantizado ocupa ~17 GB |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | 4-bit (grupo 64, modo afín) con capas selectivas en 5-bit (grupo 64, modo afín) |
| Idiomas soportados | No disponible (el modelo base de Qwen es multilingüe, pero no se especifican idiomas concretos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 4 shards) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros con arquitectura `qwen3_5`, que incorpora un codificador de visión para procesar imágenes y vídeo junto con texto. El modelo soporta razonamiento configurable (modo de pensamiento activable o desactivable) y está diseñado para tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte. La ventana de contexto nativa es de 262 000 tokens.

La cuantización aplicada en esta versión utiliza oQ/oMLX v0.5.7 con calibración imatrix sobre el dataset `oqe_code_multilingual` (128 muestras × 512 tokens, adaptativo hasta 1024). Se registraron 504 activaciones de 615 módulos lineales. Las capas que se mantienen en 5 bits incluyen todas las proyecciones `linear_attn`, las proyecciones `down_proj` del MLP en la mayoría de los bloques y proyecciones seleccionadas de salida y clave en `self_attn`. El resto de capas se cuantizan a 4 bits. El mapa completo de bits por capa está disponible en `config.json` → `quantization_config`. No se ha aplicado ningún entrenamiento adicional; es una transformación puramente de cuantización.

## Capacidades

- Generación de texto multimodal: procesa entradas de texto, imagen y vídeo, generando respuestas textuales coherentes.
- Razonamiento configurable: puede activarse un modo de pensamiento paso a paso para tareas complejas de lógica y matemáticas.
- Generación de código: entrenado para tareas de programación, incluyendo depuración, explicación y refactorización.
- Comprensión de imágenes y vídeo: capaz de describir contenido visual, responder preguntas sobre imágenes y analizar secuencias de vídeo.
- Soporte de agentes y tareas de largo horizonte: diseñado para ejecutar múltiples pasos de razonamiento y planificación, adecuado para flujos de trabajo autónomos.
- Tool calling / function calling: el modelo base soporta invocación de herramientas, aunque no se detalla en la model card de esta cuantización.
- Multilingüe: el modelo base de Qwen es multilingüe, aunque no se especifican los idiomas exactos en esta versión.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en su MacBook Pro con 24 GB de RAM para obtener sugerencias de código, explicaciones de fragmentos y detección de errores sin enviar datos a la nube. La velocidad de generación de ~60 tok/s permite una interacción fluida en tiempo real.
- Análisis de documentos técnicos con imágenes: gracias a su capacidad multimodal y a la ventana de contexto de 262K tokens, puede procesar manuales extensos con diagramas, capturas de pantalla o esquemas, respondiendo preguntas sobre el contenido visual y textual de forma conjunta.
- Automatización de atención al cliente en entornos controlados: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens) manteniendo el historial completo de la interacción. Su capacidad de tool calling permite integrarlo con sistemas de ticketing o bases de conocimiento.
- Agente de investigación autónomo: con su soporte para razonamiento de largo horizonte y planificación multi-paso, puede recopilar información de fuentes externas (vía tool calling), resumir artículos y generar informes estructurados, ejecutándose en bucle con verificación de resultados.
- Transcripción y análisis de vídeo: al aceptar entradas de vídeo, puede procesar grabaciones de reuniones o tutoriales para extraer conclusiones, generar actas o responder preguntas sobre el contenido visual y auditivo.
- Prototipado de aplicaciones multimodales: los desarrolladores pueden usarlo como backend local para aplicaciones que necesiten comprender imágenes (por ejemplo, OCR avanzado, descripción de productos) y texto, sin depender de APIs externas ni enviar datos sensibles a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval o GSM8K) en la información disponible. La model card incluye únicamente benchmarks de rendimiento de inferencia medidos con la herramienta oMLX en Apple M5 Max (128 GB de memoria unificada), en modo de una sola petición:

| Test | TTFT (ms) | TPOT (ms) | Prefill (tok/s) | Generación (tok/s) | E2E (s) | Throughput (tok/s) | Pico de memoria |
|---|---:|---:|---:|---:|---:|---:|---:|
| pp1024 / tg128 | 1161.5 | 15.84 | 881.6 | 63.6 | 3.184 | 361.9 | 16.72 GB |
| pp4096 / tg128 | 5155.9 | 19.23 | 794.4 | 52.4 | 7.614 | 554.8 | 18.19 GB |
| pp8192 / tg128 | 11856.7 | 18.13 | 690.9 | 55.6 | 14.176 | 586.9 | 19.24 GB |
| pp16384 / tg128 | 25982.8 | 17.80 | 630.6 | 56.6 | 28.260 | 584.3 | 20.78 GB |

La velocidad de generación se mantiene estable entre 52 y 64 tokens por segundo en todos los tamaños de contexto probados. El prefill degrada de 882 a 631 tok/s al pasar de 1K a 16K tokens. El consumo de memoria crece solo ~4 GB entre 1K y 16K de contexto, lo que lo hace viable en equipos de 24 GB.

## Requisitos de hardware

- Memoria unificada mínima: 24 GB (el pico de memoria medido a 16K contexto es de 20.78 GB, dejando margen para el sistema operativo).
- Hardware soportado: Apple Silicon (M1, M2, M3, M4, M5 y variantes Pro/Max/Ultra). Los benchmarks se realizaron en un M5 Max con 128 GB.
- No es compatible directamente con GPUs NVIDIA o AMD, ya que los pesos están en formato MLX. Para usar en CUDA sería necesario convertir el modelo a otro formato (por ejemplo, GGUF o safetensors de PyTorch).
- Opciones de despliegue: servidor compatible con OpenAI mediante `omlx serve`, generación con `mlx_lm generate`, o integración en aplicaciones que soporten MLX como LM Studio.
- Latencia: el tiempo hasta el primer token (TTFT) es de ~1.2 s con 1K de contexto y ~26 s con 16K. La generación posterior es de ~18 ms por token.
- Throughput: en modo de una sola petición se alcanzan entre 362 y 587 tok/s de throughput agregado (prefill + generación), dependiendo de la longitud del contexto.

## Comparativa con modelos similares

La comparativa se realiza contra otras cuantizaciones del mismo modelo base, ya que no se dispone de datos de modelos comparables de otros fabricantes en esta información.

| Modelo | Parámetros | Contexto | Cuantización | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (bf16 original) | 27B | 262K | Ninguna (bf16) | safetensors (PyTorch) | Apache-2.0 |
| Qwen3.8-27B-oQ4e-mtp (esta ficha) | 27B | 262K | 4-bit mixto (capas 5-bit) | safetensors (MLX) | Apache-2.0 |
| Qwen3.8-27B GGUF (hipotético) | 27B | 262K | 4-bit (típico) | GGUF | Apache-2.0 |

La versión oQ4e-mtp ofrece una ventaja frente al bf16 original: ocupa ~17 GB en lugar de ~54 GB (estimado para bf16), permitiendo su ejecución en equipos con 24 GB de memoria unificada. Frente a una hipotética cuantización GGUF estándar, esta versión mantiene capas sensibles en 5 bits, lo que puede ofrecer mejor calidad en razonamiento complejo, aunque no hay benchmarks comparativos publicados.

## Limitaciones y advertencias

- La cuantización introduce degradación de calidad respecto al modelo bf16 original, especialmente en tareas de razonamiento complejo y comprensión multimodal fina. La model card lo advierte explícitamente.
- El formato MLX limita su uso a Apple Silicon; no es directamente ejecutable en GPUs NVIDIA o AMD sin conversión previa.
- No se dispone de información sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles (medicina, derecho, seguridad). No debe usarse para decisiones críticas.
- La ventana de contexto de 262K tokens es teórica; el rendimiento real degrada con contextos muy largos (el TTFT a 16K es de ~26 s, y probablemente aumente de forma superlineal más allá).
- El dataset de calibración imatrix está orientado a código multilingüe, por lo que el rendimiento en otros dominios (por ejemplo, texto narrativo o conversación general) puede ser ligeramente inferior al de una calibración más diversa.
- El repositorio tiene 0 descargas y 0 likes en el momento de escribir esta ficha, lo que indica que no hay validación comunitaria amplia de su calidad.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) para esta cuantización, por lo que no se puede cuantificar objetivamente la pérdida de rendimiento respecto al modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fevaoctwh/Qwen3.8-27B-oQ4e-mtp
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta oQ/oMLX: https://github.com/jundot/omlx
- Análisis de Qwen3.8-27B (aireleasetracker): https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Especificaciones y requisitos (YottaLabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Anuncio de Qwen 3.8 (OpenLM): https://openlm.ai/qwen3.8/
