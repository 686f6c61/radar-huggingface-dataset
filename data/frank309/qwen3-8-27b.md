# frank309/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso con codificador de visión, publicado en el repositorio de Hugging Face `frank309/Qwen3.8-27B` bajo licencia Apache 2.0. Según la model card, se trata de un modelo nativo de visión-lenguaje capaz de entender imágenes y vídeo, construido sobre la base arquitectónica de la serie Qwen3.5 y orientado a cargas de trabajo de código, trabajo profesional, investigación y tareas agénticas de horizonte largo. El recuento real de parámetros a partir de los pesos en safetensors es de 27.781.427.952 (unos 27,8 mil millones).

La arquitectura combina atención lineal y atención completa en una disposición híbrida: 16 bloques compuestos por tres capas de Gated DeltaNet seguidas de una capa de Gated Attention, cada una con su correspondiente red feed-forward. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000. Incorpora además Multi-Token Prediction (MTP) entrenado con varios pasos, lo que habilita decodificación especulativa, y un modo de pensamiento activado por defecto que puede desactivarse por petición y ajustarse mediante `reasoning_effort`.

Su relevancia actual reside en que ofrece capacidades de razonamiento, visión y ejecución agéntica en un tamaño (27,8 B) desplegable en infraestructura de una o dos GPU, con pesos abiertos y licencia permisiva para uso comercial. Conviene señalar que el repositorio pertenece a un usuario tercero (`frank309`), no a la organización oficial de Qwen, y que los datos de idiomas, cuantizaciones y benchmarks numéricos no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con vision encoder y atencion hibrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Hugging Face Transformers) |
| Dimension oculta | 5.120 |
| Numero de capas | 64 |
| Disposicion de capas | 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Gated DeltaNet | 48 cabezas de atencion lineal para V y 16 para QK; dimension de cabeza 128 |
| Gated Attention | 24 cabezas para Q y 4 para KV; dimension de cabeza 256; dimension RoPE 64 |
| Dimension intermedia FFN | 17.408 |
| Vocabulario | 248.320 tokens (embeddings con padding); salida LM de 248.320 |
| MTP | Multi-Token Prediction entrenado con multiples pasos |
| Etapa de entrenamiento | Pre-entrenamiento y post-entrenamiento |
| Tamano del repositorio | 55,6 GB |
| Fecha de publicacion | 3 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con un codificador de visión acoplado, diseñado para entrada image-text-to-text. La innovación estructural principal es la mezcla de dos mecanismos de atención: por un lado, capas de Gated DeltaNet, un esquema de atención lineal con 48 cabezas para V y 16 para QK con dimensión de cabeza 128; por otro, capas de Gated Attention convencional con 24 cabezas de consulta y solo 4 cabezas de clave-valor (GQA), dimensión de cabeza 256 y 64 dimensiones dedicadas a Rotary Position Embedding. La proporción es de tres capas lineales por cada capa de atención completa, lo que reduce el coste asociado a contextos muy largos. La red feed-forward tiene una dimensión intermedia de 17.408 y el vocabulario se sitúa en 248.320 tokens con padding.

El entrenamiento abarca fases de pre-entrenamiento y post-entrenamiento, aunque la model card no detalla el número de tokens, la composición del dataset ni si se emplearon técnicas concretas de alineación como RLHF o DPO. Sí se indica que el modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, un mecanismo habitualmente aprovechado para decodificación especulativa y mejora del throughput. La model card menciona mejoras en planificación autónoma, manejo de retroalimentación del entorno y compatibilidad con harnesses y herramientas de desarrollo, además de un control flexible del razonamiento: el modo thinking está activo por defecto, puede desactivarse por petición y su profundidad se regula con `reasoning_effort`, conservando el contexto de razonamiento de mensajes previos mediante `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, con modo de pensamiento activado por defecto y desactivable por petición.
- Ajuste de la profundidad de razonamiento mediante el parámetro `reasoning_effort`.
- Retención del contexto de razonamiento de turnos anteriores mediante `preserve_thinking`.
- Comprensión de imágenes: diagramas STEM, documentos y material visual en general.
- Comprensión de vídeo, incluidos vídeos de escala horaria según la model card.
- Tareas de código, incluyendo codificación agéntica en terminal (benchmark Terminal Bench 2.1 con el harness Terminus).
- Ejecución agéntica: planificación autónoma y gestión de retroalimentación del entorno para completar tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares, orientada a integración en stacks existentes.
- Decodificación especulativa habilitada por el entrenamiento con Multi-Token Prediction.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible; la model card menciona la disponibilidad de herramientas integradas oficiales únicamente en la versión alojada en Qwen Cloud.
- Capacidades multilingües: no disponible (no se declaran idiomas soportados).

## Casos de uso

- Agentes de codificación en terminal: el modelo está evaluado específicamente en Terminal Bench 2.1 con el harness Terminus, por lo que encaja en flujos donde un agente ejecuta comandos, interpreta la salida del entorno y corrige errores de forma iterativa dentro de un repositorio.
- Integración en pipelines de CI/CD: con 262.144 tokens de contexto nativo, el modelo puede analizar simultáneamente diffs, historial de commits, logs de build y configuración del proyecto para proponer correcciones o parches sin partir el contexto en fragmentos.
- Extracción de información de documentos escaneados: al ser un modelo de visión-lenguaje nativo, puede procesar facturas, contratos o formularios en imagen y devolver campos estructurados, reduciendo la necesidad de un pipeline OCR separado más un LLM de texto.
- Análisis de vídeo de larga duración: la model card indica soporte para vídeos de escala horaria, lo que habilita casos como revisión de grabaciones de formación, análisis de material deportivo o indexación semántica de archivos audiovisuales.
- Asistente de investigación técnica: con `reasoning_effort` ajustable y `preserve_thinking`, permite separar consultas rápidas de análisis profundos sobre literatura científica, diagramas y tablas, controlando el coste de cómputo por consulta.
- Atención al cliente multi-turno: la ventana de contexto extensible hasta 1.000.000 tokens permite mantener historiales de conversación muy largos, con el modelo recordando decisiones y preferencias previas del usuario sin resumir el historial.
- Procesamiento de logs y transcripciones extensas: transcripciones de reuniones de varias horas o volcados de logs de aplicación pueden analizarse íntegros en una sola pasada para extraer incidencias, acuerdos o patrones de error.
- Descripción automática de contenido visual para accesibilidad: generación de texto alternativo y descripciones detalladas de imágenes y vídeo para plataformas de contenido.
- Automatización de tareas profesionales multi-paso: la mejora declarada en ejecución agéntica y en el manejo de retroalimentación del entorno apunta a flujos donde el modelo encadena búsqueda, edición y verificación de resultados.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (la primera visible es Coding). El único benchmark identificable en la información disponible es Terminal Bench 2.1 con el harness Terminus, en la categoría de codificación agéntica en terminal. Los valores numéricos no están disponibles en la información proporcionada.

| Benchmark | Categoria | Modelos comparados | Resultado de Qwen3.8-27B |
|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | Codigo agentico en terminal | Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B, Opus4.6 Max | No disponible |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del recuento de parametros y del tamano del repositorio (55,6 GB, coherente con pesos en BF16), salvo donde se indique que proceden de la model card.

- Pesos en BF16: aproximadamente 55,6 GB, por lo que la inferencia en precision completa requiere mas de 60 GB de VRAM util (por ejemplo, una H100 de 80 GB o una A100 de 80 GB).
- Despliegue multi-GPU en BF16: 2 × A100 40 GB o 4 × RTX 4090 24 GB, asumiendo tensor parallelism y sin contar la memoria de la cache KV ni activaciones.
- Cuantizacion a 8 bits o FP8: entorno a 28 GB de pesos, viable en una unica GPU de 48 GB (L40S, RTX 6000 Ada) o en 2 × RTX 4090.
- Cuantizacion a 4 bits: entorno a 14-16 GB de pesos, lo que permite ejecucion en una RTX 4090, RTX 3090 o RTX 5090 de 24-32 GB, dejando margen limitado para contexto largo.
- Memoria unificada: equipos tipo Mac Studio con 64 GB o mas podrian alojar el modelo en BF16; con 32 GB queda restringido a cuantizaciones de 4 bits.
- Cache KV: la arquitectura hibrida, con tres cuartas partes de las capas usando atencion lineal, reduce la presion de memoria de la cache KV frente a un transformer de atencion completa de tamano equivalente; no se publican cifras concretas de consumo por token.
- Formatos de despliegue confirmados en la model card: Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Otros runners (llama.cpp, Ollama, TGI): no confirmados en la informacion disponible.
- Latencia y throughput: no disponible. La presencia de MTP entrenado sugiere la posibilidad de decodificacion especulativa, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27,8 B (dato real de safetensors) | 262.144 nativos; extensible a 1.000.000 | Apache 2.0 | Pesos abiertos en Hugging Face (repositorio de tercero) |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | Aproximadamente 30 B (inferido del nombre) | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | Propietaria | Solo mediante API |

Los cuatro modelos alternativos aparecen unicamente como columnas de comparacion en la tabla de benchmarks de la model card. No se dispone de sus especificaciones tecnicas, condiciones de licencia ni resultados numericos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Procedencia del repositorio: el modelo esta publicado por el usuario `frank309`, no por la organizacion oficial de Qwen. La model card esta redactada en primera persona como si procediera del equipo de Qwen, lo que genera una discrepancia que conviene verificar antes de usarlo en produccion.
- Inconsistencia de etiquetado: la etiqueta del repositorio es `qwen3_5` mientras que el nombre del modelo y la model card hacen referencia a la generacion Qwen3.8. Esta discrepancia no se aclara en la informacion disponible.
- Validacion comunitaria minima: 0 descargas y 1 like en el momento de la consulta, sin evidencia de verificacion independiente de los pesos.
- Idiomas: no se declara ningun idioma soportado, por lo que se desconoce la cobertura multilingue real y la calidad en castellano.
- Cuantizaciones: no se especifica que formatos cuantizados existan ni si estan validados. Cualquier uso de GGUF, AWQ o GPTQ requeriria conversion y verificacion propias.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala, especialmente en tareas de extraccion de datos, resumen de documentos y lectura de diagramas o tablas complejas. Se recomienda verificacion humana en flujos criticos.
- Vision: la model card no detalla resolucion de imagen soportada, numero de frames por video ni limites practicos para el analisis de video de larga duracion, mas alla de la mencion a videos de escala horaria.
- Contexto largo: aunque el modelo declara 262.144 tokens nativos y extension hasta 1.000.000, no se aportan mediciones de degradacion del rendimiento en contextos proximos al limite.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con la obligacion habitual de conservar avisos de copyright y licencia. No se declaran restricciones adicionales en la informacion disponible.
- Sesgos: no se publica ninguna evaluacion de sesgo, toxicidad o alineacion.
- Fecha de publicacion: el repositorio figura creado el 3 de octubre de 2026, dato que conviene contrastar con la politica de versionado del proyecto original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frank309/Qwen3.8-27B
- Qwen Cloud (servicio de inferencia gestionada mencionado en la model card): https://www.qwencloud.com
- Ficha de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Paper, repositorio de codigo, blog tecnico o demo oficial: no disponibles en la informacion proporcionada.
