# BenFrodom/rtila-assistant-lite-1.5

## Resumen

RTILA Assistant Lite 1.5 es un modelo fine-tuneado sobre Qwen3.5-9B, desarrollado por BenFrodom (vinculado a la corporacion RTILA), cuyo proposito es generar configuraciones JSON de automatizacion para el RTILA Automation Engine, una plataforma de automatizacion web y RPA. El modelo unifica y reemplaza a toda la familia anterior de modelos RTILA (Mini, Lite y Assistant completo), consolidando en un unico checkpoint de 9.000 millones de parametros las capacidades que antes se repartian entre tres modelos de distinto tamano.

La relevancia del modelo radica en su arquitectura hibrida de nueva generacion: combina Gated Delta Networks (atencion lineal) con capas de atencion estandar y componentes MoE dispersos, lo que permite un rendimiento comparable al antiguo modelo de 14B con un consumo de memoria significativamente menor. El checkpoint se distribuye en formato GGUF Q4_K_M (~6 GB) y esta disenado para ejecutarse en hardware de consumo, incluyendo GPUs con 8 GB de VRAM, Apple Silicon y CPU. El contexto de fine-tune se ha fijado en 2048 tokens, aunque el modelo base Qwen3.5-9B soporta nativamente hasta 262.144 tokens y cobertura en 201 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated DeltaNet (atencion lineal) + Gated Attention, con componentes MoE dispersos |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (la arquitectura menciona MoE disperso, pero no se especifica el numero de parametros activos) |
| Longitud de contexto | 2048 tokens (fine-tune); el modelo base Qwen3.5-9B soporta 262.144 tokens nativamente |
| Tipos de cuantizacion | GGUF Q4_K_M (unico formato confirmado) |
| Idiomas soportados | no disponible en metadatos de HuggingFace; el modelo base Qwen3.5-9B declara soporte para 201 idiomas |
| Licencia | Apache 2.0 segun la insignia de la model card; los metadatos de HuggingFace indican "no disponible" |
| Formato de pesos | GGUF (Q4_K_M); el repositorio contiene tambien safetensors (11,3 GB en total) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, una arquitectura hibrida que intercala capas de atencion lineal tipo DeltaNet con capas de atencion estandar (Gated Attention). Esta combinacion busca reducir la latencia y aumentar el throughput en inferencia frente a un transformer denso convencional, manteniendo la calidad de modelos de mayor tamano. La model card menciona ademas componentes de MoE disperso dentro de la arquitectura, aunque no se detalla la distribucion exacta de expertos ni los parametros activos por token.

El proceso de fine-tune se realizo con el modo de pensamiento (thinking mode) desactivado, una decision deliberada para optimizar la generacion de salidas JSON estructuradas y reducir la latencia en produccion. No se especifican los datos de entrenamiento utilizados, el numero de tokens de fine-tune ni si se aplicaron tecnicas de RLHF o DPO. El modelo se distribuye exclusivamente en formato GGUF Q4_K_M, orientado a inferencia local con llama.cpp, Ollama o LM Studio.

## Capacidades

- Generacion de configuraciones JSON para el RTILA Automation Engine, incluyendo comandos de navegacion e interaccion web: click, scroll, escritura, esperas, manejo de popups y flujos multi-pestana.
- Extraccion de datos estructurados mediante selectores CSS y XPath, incluyendo tablas, listas, datos anidados y paginacion.
- Logica de flujo: bucles, condicionales, manejo de errores y patrones de reintento dentro de las configuraciones generadas.
- Integraciones con triggers y servicios externos: webhooks, PostgreSQL, MySQL, Slack y notificaciones por correo electronico.
- Gestion de variables y sustitucion dinamica: transformaciones de datos, expresiones regulares y valores dinamicos.
- Scripting avanzado: ejecucion de JavaScript personalizado, analisis de paginas y manipulacion del DOM.
- Capacidad conversacional general, aunque el modelo esta especializado en la generacion de configuraciones de automatizacion.
- Sin modo de pensamiento (thinking mode): genera respuestas directas sin bloques de razonamiento intermedio.

## Casos de uso

- Scraping web automatizado: el modelo genera configuraciones completas que extraen precios, catalogos o datos de productos desde sitios de comercio electronico, utilizando selectores CSS o XPath y gestionando paginacion.
- Automatizacion de flujos RPA multi-paso: permite construir pipelines que combinan navegacion, extraccion de datos y ejecucion de JavaScript en el navegador, sustituyendo scripts manuales.
- Monitorizacion y alertas con integraciones: genera configuraciones que conectan la extraccion de datos con notificaciones via Slack, email o webhooks, permitiendo alertas automaticas ante cambios en paginas web.
- Sincronizacion con bases de datos: crea flujos que extraen datos de la web y los insertan o actualizan en PostgreSQL o MySQL, util para consolidar informacion externa en sistemas internos.
- Automatizacion de tareas administrativas: genera configuraciones para rellenar formularios, gestionar sesiones multi-pestana y manejar popups en aplicaciones web de gestion interna.
- Asistente conversacional para configuracion: el modelo puede integrarse en un chat (via Ollama o llama.cpp) donde el usuario describe en lenguaje natural la automatizacion deseada y recibe el JSON de configuracion listo para ejecutar en el RTILA Automation Engine.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otros conjuntos de referencia estandar. Tampoco se proporcionan mediciones de latencia o throughput en entornos de produccion.

## Requisitos de hardware

- GPU con 8 GB o mas de VRAM: recomendado; compatible con RTX 3060, RTX 4060 y RTX 3070.
- GPU con 6 GB de VRAM: funcionamiento ajustado; puede requerir descarga de capas a CPU (offloading).
- Apple Silicon con 16 GB o mas de RAM unificada: excelente rendimiento via Metal (M1/M2/M3/M4 Pro/Max).
- Apple Silicon con 8 GB de RAM: funcional, pero con limitaciones de memoria; se recomienda cerrar otras aplicaciones.
- CPU-only con 8 GB o mas de RAM: viable, con velocidad de inferencia razonable.
- Opciones de despliegue: Ollama, LM Studio, llama.cpp y llama-cpp-python.
- Tamano del archivo GGUF Q4_K_M: aproximadamente 6 GB.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| RTILA Assistant Lite 1.5 | Qwen3.5-9B | 9B | 2048 (fine-tune) | GGUF Q4_K_M | Apache 2.0 (segun model card) |
| RTILA Assistant (anterior) | Qwen3-14B | 14B | no disponible | GGUF (~9 GB) | no disponible |
| RTILA Assistant Lite (anterior) | Qwen3-8B | 8B | no disponible | GGUF (~5 GB) | no disponible |
| RTILA Assistant Mini (anterior) | Qwen3-4B | 4B | no disponible | GGUF (~2,5 GB) | no disponible |

Segun la model card, el modelo Lite 1.5 iguala o supera la calidad del antiguo modelo de 14B (RTILA Assistant) con un requisito minimo de RAM de 8 GB frente a los 16 GB del modelo anterior. No se dispone de datos de benchmarks comparativos para validar esta afirmacion de forma independiente.

## Limitaciones y advertencias

- Contexto de fine-tune limitado a 2048 tokens, muy por debajo de los 262.144 tokens nativos del modelo base; las configuraciones generadas no deben exceder este limite.
- La licencia presenta una discrepancia: la insignia de la model card indica Apache 2.0, pero los metadatos de HuggingFace la marcan como "no disponible". Antes de un uso comercial, se recomienda verificar la licencia con el autor.
- El modelo esta especializado en generar configuraciones para el RTILA Automation Engine; su rendimiento en tareas generales de texto, codigo o razonamiento no esta documentado.
- Sin modo de pensamiento (thinking mode) activo: no genera razonamiento intermedio, lo que puede afectar a tareas complejas que requieran cadenas de razonamiento.
- Riesgo de alucinacion en selectores CSS/XPath o comandos de automatizacion generados: se recomienda validar las configuraciones en un entorno de pruebas antes de desplegarlas en produccion.
- No se han publicado datos sobre sesgos, calidad multilingue real ni evaluaciones de seguridad.
- El repositorio tiene cero descargas y cero likes en HuggingFace, lo que indica una adopcion practicamente nula y ausencia de validacion por parte de la comunidad.
- La fecha de creacion (agosto de 2026) y la referencia a Qwen3.5-9B sugieren que el modelo base podria ser reciente o no estar disponible de forma general; se recomienda verificar la existencia y el soporte del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BenFrodom/rtila-assistant-lite-1.5
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo anterior RTILA Assistant: https://huggingface.co/rtila-corporation/rtila-assistant
- Modelo anterior RTILA Assistant Lite: https://huggingface.co/rtila-corporation/rtila-assistant-lite
- Documentacion del RTILA Automation Engine: https://rtila.com/docs-category/ai-assistant/
- Foro de la comunidad RTILA: https://rtila.net/t/rtila-al-model-option-to-download/189
- Plantilla de chat (GitHub): https://github.com/ydarwish1/glyphhound/blob/main/corpus/templates/rtila-corporation__rtila-assistant-lite-1.5.jinja
