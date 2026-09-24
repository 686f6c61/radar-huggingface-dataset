# athenisai/athenea-3.2-lite-v1-gguf

## Resumen

ATHENEA 3.2 LITE es un ajuste fino (SFT) del modelo denso ibm-granite/granite-4.2-3b de IBM, al que se le ha aplicado el adaptador LoRA athenisai/athenea-3.2-lite-v1-lora. El resultado se distribuye aquí exclusivamente en formato GGUF FP16, es decir, sin cuantización con pérdida: es una conversión directa a FP16 de los pesos fusionados, pensada para su ejecución con llama.cpp y llama-server. El modelo tiene 3.659.737.600 parámetros (3,66B), vocabulario de 100.352 tokens y una ventana de contexto de 131.072 tokens.

La propuesta de valor se centra en el razonamiento explícito y el uso agéntico en un tamaño que cabe en hardware de consumo. El ajuste introduce thinking nativo heredado de Granite 4.2 mediante bloques `<think>...</think>`, con plantilla de chat de tipo ChatML que activa el razonamiento por defecto (`enable_thinking=True`), de modo que el contenido de razonamiento se separa en el campo `reasoning_content` y la respuesta final en `content`. Es relevante ahora porque combina contexto muy largo (128K), licencia Apache-2.0 y un peso de fichero de aproximadamente 7,3 GB, lo que permite desplegar un modelo con modo de razonamiento en una única GPU de gama media.

El repositorio es de publicación muy reciente y sin tracción: cero descargas y cero likes en el momento de redactar esta ficha. No incluye resultados de benchmarks, ni detalle del dataset de entrenamiento, ni declaración de idiomas soportados, por lo que la evaluación por parte de terceros queda pendiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GraniteForCausalLM, transformer denso con GQA (40 cabezas Q / 8 cabezas KV), SwiGLU con dimensión intermedia 8192, RoPE con theta 10M, RMSNorm con eps 1e-5 |
| Parámetros totales | 3.659.737.600 (3,66B) |
| Parámetros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | FP16 sin cuantizar (único formato publicado en este repositorio); no se han publicado variantes Q4/Q5/Q8 en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (FP16) |
| Vocabulario | 100.352 tokens |
| Embeddings | separados, no atados (untied) |
| Modelo base | ibm-granite/granite-4.2-3b + adaptador athenisai/athenea-3.2-lite-v1-lora |
| Tamaño del repositorio | 7,3 GB |
| Plantilla de chat | ChatML con thinking nativo (`<think>...</think>`), `enable_thinking=True` por defecto |
| Parámetros de generación recomendados | temperature 1.0, top_p 0.95, do_sample true, max_new_tokens 8192 (thinking) / 2048 (non-thinking) |
| Fecha de publicación | 24 de septiembre de 2026 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo Granite 4.2 de 3B de IBM: un transformer causal denso con atención de consultas agrupadas (GQA) con 40 cabezas de consulta y 8 cabezas de clave/valor, lo que reduce el coste de la caché KV en contextos largos. Usa SwiGLU con dimensión intermedia de 8192, normalización RMSNorm con epsilon 1e-5 y RoPE con theta de 10 millones, configuración coherente con una ventana de 131.072 tokens. Los embeddings de entrada y salida no están atados, lo que añade parámetros respecto a una configuración atada pero mantiene el vocabulario de 100.352 entradas independiente en la proyección final.

Sobre esa base se ha aplicado un ajuste supervisado (SFT) con el adaptador LoRA `athenea-3.2-lite-v1-lora` sobre un dataset propio denominado "athenea". El ajuste incorpora el modo de razonamiento nativo de Granite 4.2 con marcas `<think>...</think>` y una plantilla de chat tipo ChatML que activa el thinking por defecto. No se especifica en la model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas posteriores de RLHF o DPO; tampoco se detalla el método de fusión del adaptador ni la estrategia de conversión a GGUF más allá de indicar que es FP16 sin cuantizar.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla ChatML y separación automática entre razonamiento (`reasoning_content`) y respuesta final (`content`).
- Razonamiento explícito en modo thinking: el modelo emite su cadena de razonamiento dentro de `<think>...</think>` antes de la respuesta, con un presupuesto recomendado de hasta 8192 tokens nuevos para esa fase.
- Modo no-thinking: es posible desactivar el razonamiento en la plantilla, con un presupuesto recomendado de 2048 tokens nuevos para la respuesta directa.
- Procesamiento de contextos largos de hasta 131.072 tokens, adecuado para documentos extensos, historiales de conversación prolongados o bases de código amplias.
- Capacidades agénticas y de razonamiento multi-paso: las etiquetas del repositorio incluyen `agentic` y `reasoning`, aunque la model card no documenta de forma explícita el formato de tool calling ni ejemplos de invocación de funciones.
- Compatibilidad con endpoints: el repositorio está etiquetado como `endpoints_compatible`, orientado a despliegues servidos tipo API compatible con OpenAI.
- Capacidades multilingües: no disponibles; no se declara ningún conjunto de idiomas soportados en la información proporcionada.
- Capacidades de visión o audio: no disponibles, no se mencionan en la información proporcionada.

## Casos de uso

- Asistentes de razonamiento en local: al ser un modelo de 3,66B en FP16 con modo thinking, puede desplegarse en una estación de trabajo con una GPU de 12-16 GB y ofrecer respuestas razonadas sin enviar datos a servicios externos, algo relevante en entornos con requisitos de confidencialidad.
- Análisis de documentos largos: con 131.072 tokens de contexto, permite cargar contratos, informes técnicos o expedientes completos en una sola pasada y hacer preguntas sobre el conjunto sin trocear el documento en fragmentos que rompan la coherencia.
- Agentes multi-paso con herramientas: partiendo de la orientación agéntica del modelo, se puede integrar en bucles de razonamiento-acción para consultar APIs internas, ejecutar consultas a bases de datos o encadenar llamadas a servicios, usando `llama-server` con `--jinja` para que la plantilla de chat se aplique correctamente.
- Generación y revisión de código asistida: el modelo puede emplearse como autocompletado o revisor en editores y pre-commit hooks; su ventana de 128K permite pasar un fichero completo o varios módulos relacionados como contexto para detectar inconsistencias.
- Atención al cliente automatizada: con contexto largo se puede mantener un historial de conversación extenso y recuperar información de interacciones previas dentro de la misma ventana; la licencia Apache-2.0 facilita su integración en productos comerciales.
- Extracción estructurada de información: clasificación de tickets, extracción de entidades de correos o generación de resúmenes con formato fijo, aprovechando el modo no-thinking (2048 tokens) para reducir latencia y coste por petición.
- Generación de datos sintéticos y evaluación: al ser un modelo pequeño y con licencia permisiva, sirve para producir borradores de instrucciones o respuestas que luego se filtran y revisan, o para comparar contra modelos mayores en tareas de razonamiento.
- Despliegue en el borde o en entornos aislados (air-gapped): el fichero FP16 de 7,3 GB y su ejecución con llama.cpp sobre CPU o GPU modesta permiten operar en instalaciones sin acceso a internet ni a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y el repositorio no aporta comparaciones cuantitativas con el modelo base ni con alternativas.

## Requisitos de hardware

- Peso de los pesos en FP16: aproximadamente 7,3 GB (coincide con el tamaño del repositorio GGUF). Es el mínimo de VRAM necesario solo para los pesos, sin caché KV ni buffers de cómputo.
- VRAM estimada para inferencia: en torno a 9-10 GB con contexto corto (4K-8K tokens) usando FP16, sumando pesos, caché KV y overhead de runtime. Para exprimir los 131.072 tokens de contexto la caché KV crece de forma proporcional a la longitud de secuencia; no se dispone del número de capas y de la dimensión de cabeza exactos para calcularla con precisión, por lo que la cifra concreta no está disponible.
- GPU recomendadas: H100, A100 o L40S para servir contexto completo y concurrencia; RTX 4090 o RTX 3090 (24 GB) para uso individual con contexto largo; RTX 4080, RTX 4070 Ti o RTX 4060 Ti (16 GB) para contexto medio.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB puede ejecutar el modelo en FP16 con contexto corto o medio; con 16 GB o más se gana margen para contextos largos.
- Opciones de despliegue: llama.cpp y `llama-server` (el camino documentado por el autor, con `-ngl 99 -c 131072 --jinja`), LM Studio, Ollama (requiere importar el GGUF), y cualquier runtime compatible con GGUF. Para vLLM o TGI convendría partir del modelo en safetensors del repositorio base o del adaptador fusionado, ya que el soporte de GGUF en esos servidores es parcial o indirecto.
- Ejemplo de arranque documentado: `llama-server -m athenea-3.2-lite-f16.gguf -ngl 99 -c 131072 --temp 1.0 --top-p 0.95 --jinja --host 0.0.0.0 --port 8080 -a "ATHENEA-3.2-LITE"`.
- Latencia y throughput estimados: no disponibles. No se han publicado medidas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

Los datos de las alternativas provienen de la documentación pública de cada modelo y no de la información proporcionada en esta ficha; se incluyen como referencia orientativa de categoría (modelos densos de 3-4B), no como resultado de una evaluación homogénea.

| Modelo | Parámetros | Contexto | Licencia | Formato y disponibilidad | Notas |
|---|---|---|---|---|---|
| athenisai/athenea-3.2-lite-v1-gguf | 3,66B | 131.072 | Apache-2.0 | GGUF FP16 | Ajuste SFT de Granite 4.2 3B con thinking nativo; sin benchmarks publicados |
| ibm-granite/granite-4.2-3b | 3,66B (misma base) | 131.072 | Apache-2.0 | safetensors (y ecosistema IBM) | Modelo base sobre el que se construye este ajuste; referencia directa de comportamiento antes del SFT |
| Qwen2.5-3B | 3,09B | 32.768 nativos (ampliable con YaRN) | licencia de investigación de Qwen | safetensors, GGUF comunitarios | Alternativa consolidada en razonamiento y código, con restricciones de licencia para uso comercial en este tamaño |
| Llama-3.2-3B | 3,21B | 128.000 | licencia comunitaria de Llama 3.2 | safetensors, GGUF oficiales | Ecosistema amplio y buen soporte de herramientas, pero licencia con condiciones adicionales para productos de gran escala |
| Phi-3.5-mini | 3,82B | 128.000 | MIT | safetensors, GGUF comunitarios | Licencia muy permisiva y buen rendimiento en razonamiento, orientado a texto en inglés principalmente |

Comparativa de rendimiento en benchmarks: no disponible, dado que este modelo no publica cifras y no se dispone de una evaluación propia en la información facilitada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que no se puede afirmar que el ajuste mejore al modelo base Granite 4.2 3B en ninguna tarea.
- Riesgo de alucinación: es un modelo de 3,66B con ajuste SFT; los modelos de este tamaño tienden a inventar hechos, citas y referencias, especialmente en dominios especializados. Se recomienda validación externa en producción.
- Sesgos conocidos: no disponibles. El autor no documenta sesgos, composición del dataset de ajuste ni auditorías de seguridad.
- Idiomas: no declarados. El modelo base de IBM está orientado principalmente al inglés, y no se especifica qué idiomas cubre el dataset "athenea", por lo que el rendimiento en castellano u otras lenguas es desconocido.
- Limitación de contexto efectivo: aunque la ventana declarada es de 131.072 tokens, no se han publicado pruebas de recuperación en posiciones intermedias (evaluaciones tipo "needle in a haystack"). La calidad del recuerdo en contextos muy largos no está verificada y el coste de VRAM crece de forma notable.
- Modo thinking por defecto: la plantilla activa el razonamiento con `enable_thinking=True`. Si el cliente que consume la API no interpreta los campos `reasoning_content` y `content` por separado, el texto de razonamiento puede aparecer mezclado en la respuesta visible.
- Dependencia de `--jinja` en llama.cpp: sin esa opción, la plantilla de chat embebida no se aplica y el formato de turnos y de thinking puede degradarse.
- Restricciones de licencia: la licencia declarada es Apache-2.0, lo que permite uso comercial. Aun así, conviene revisar las condiciones del modelo base (Granite 4.2, también Apache-2.0) y del adaptador del que deriva, por si hubiera términos adicionales no reflejados en este repositorio.
- Madurez del artefacto: cero descargas y cero likes; publicación muy reciente. No hay garantía de mantenimiento, corrección de errores ni soporte por parte del autor.
- Nombre y linaje: el repositorio es una conversión GGUF de un modelo derivado de un adaptador LoRA sobre Granite 4.2 3B; no es un modelo entrenado desde cero, por lo que hereda tanto las capacidades como las limitaciones de su base.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/athenisai/athenea-3.2-lite-v1-gguf
- Adaptador LoRA base: https://huggingface.co/athenisai/athenea-3.2-lite-v1-lora
- Modelo base de IBM: https://huggingface.co/ibm-granite/granite-4.2-3b
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo (los resultados devueltos no guardan relación con el modelo ni con IA open source).
