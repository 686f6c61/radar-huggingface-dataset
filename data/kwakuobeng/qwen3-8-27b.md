# kwakuobeng/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión publicado en Hugging Face bajo el identificador kwakuobeng/Qwen3.8-27B. Según su model card, se trata de un modelo denso de 27B parámetros (27.781.427.952 parámetros reales, según los pesos en safetensors) integrado en la familia Qwen3.8 y construido sobre la base arquitectónica de Qwen3.5. El repositorio declara licencia Apache 2.0 y el pipeline image-text-to-text, de modo que acepta entradas multimodales de imagen y texto.

El modelo está orientado a generación de texto, razonamiento, código, trabajo profesional, investigación y tareas agénticas de largo horizonte, con soporte nativo de comprensión de imágenes y vídeo (incluidos vídeos de escala horaria). Incorpora control flexible del razonamiento: el modo thinking está activado por defecto, puede desactivarse por petición y su profundidad se ajusta con `reasoning_effort`, conservando el contexto de razonamiento previo mediante `preserve_thinking`. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000.

Su relevancia actual radica en la combinación de un tamaño compacto (27B) con una arquitectura híbrida que alterna atención lineal (Gated DeltaNet) y atención completa en proporción 3:1, lo que reduce el coste computacional del contexto largo, y en el soporte declarado para transformers, vLLM, SGLang y TokenSpeed. Como advertencia preliminar: el repositorio lo publica una cuenta de usuario individual (kwakuobeng), no la organización oficial de Qwen, y acumula 0 descargas y 0 valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido (Gated DeltaNet + Gated Attention) con codificador de visión |
| Parametros totales | 27.781.427.952 (27B declarados) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF, AWQ ni GPTQ en la información) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |
| Dimension oculta | 5.120 |
| Numero de capas | 64 (16 bloques con 3 capas Gated DeltaNet + 1 capa Gated Attention) |
| Tamano de vocabulario | 248.320 tokens (con padding) |
| Dimension intermedia de FFN | 17.408 |
| Cabezas de atencion | Gated Attention: 24 para Q y 4 para KV, dimension de cabeza 256, RoPE de 64; Gated DeltaNet: 48 cabezas lineales para V y 16 para QK, dimension de cabeza 128 |
| Prediccion multi-token (MTP) | Sí, entrenado con multiples pasos |
| Tamano del repositorio | 55,6 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

Se trata de un modelo de lenguaje causal denso con codificador de visión, con un layout de capas explícito en la model card: 16 bloques, cada uno compuesto por 3 capas de Gated DeltaNet seguidas de 1 capa de Gated Attention, lo que da un total de 64 capas (48 de atención lineal y 16 de atención completa). La Gated DeltaNet emplea 48 cabezas lineales para V y 16 para QK con dimensión de cabeza 128, mientras que la Gated Attention usa 24 cabezas de consulta y 4 de clave-valor (ratio GQA 6:1) con dimensión de cabeza 256 y dimensión de RoPE de 64. La red feed-forward tiene dimensión intermedia de 17.408 y la dimensión oculta del modelo es 5.120.

La combinación de atención lineal recurrente y atención completa en una proporción 3:1 es la innovación técnica principal: las capas DeltaNet mantienen un estado recurrente de coste constante, de modo que solo las 16 capas de Gated Attention generan una caché KV que crece con la secuencia. El modelo incorpora además predicción multi-token (MTP) entrenada con varios pasos, mecánica habitualmente asociada a decodificación especulativa. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO; tampoco se detallan los métodos empleados para extender el contexto de 262.144 a 1.000.000 tokens.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto, desactivable por petición, con control de profundidad mediante `reasoning_effort` y retención del razonamiento previo con `preserve_thinking`.
- Codificación, trabajo profesional e investigación: la model card declara mejoras sustanciales en estas áreas respecto a generaciones anteriores.
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo de largo horizonte.
- Comprensión de visión y lenguaje nativa: imágenes y vídeo, con especial mención a diagramas STEM, documentos y vídeos de escala horaria.
- Codificación agéntica en terminal, evaluada con Terminal Bench 2.1 (Terminus) según la tabla de benchmarks del autor.
- Compatibilidad con herramientas de desarrollo y harnesses populares, según la sección de compatibilidad descendente de la model card.
- Tool calling / function calling: no se detalla explícitamente en la información disponible; la model card solo menciona «official built-in tools» en la versión alojada de Qwen Cloud.
- Capacidades multilingües: no disponibles. El tamaño de vocabulario (248.320 tokens) es indicativo de cobertura amplia, pero la model card no enumera idiomas.

## Casos de uso

- Agentes de codificación en terminal: el modelo está evaluado específicamente en Terminal Bench 2.1 (Terminus) y declara mejoras en planificación autónoma y manejo de retroalimentación del entorno, por lo que encaja en flujos de trabajo donde el agente ejecuta comandos, lee errores y corrige código de forma iterativa.
- Integración en pipelines de CI/CD: con una ventana de 262.144 tokens puede ingerir diffs extensos, logs de compilación y ficheros de configuración en una sola pasada para diagnosticar fallos y proponer parches.
- Análisis de documentación técnica y diagramas: al ser un modelo image-text-to-text, puede procesar diagramas STEM, esquemas de arquitectura y documentos escaneados junto con su texto asociado para responder preguntas o extraer especificaciones.
- Comprensión de vídeo de larga duración: la model card menciona soporte para vídeos de escala horaria, lo que habilita resúmenes, indexación por capítulos y búsqueda semántica dentro de grabaciones extensas.
- Asistencia en investigación: con contexto extensible a 1.000.000 tokens permite cargar varios artículos completos y realizar síntesis comparativas, revisión de literatura o extracción de resultados experimentales sin trocear los documentos.
- Atención al cliente multi-turno: la retención del contexto de razonamiento entre mensajes históricos (`preserve_thinking`) y la ventana de 262.144 tokens permiten mantener conversaciones largas con historial completo sin perder coherencia.
- Extracción estructurada de documentos: facturas, contratos o formularios escaneados pueden procesarse como entrada de imagen y devolver campos estructurados, aunque no se documenta explícitamente un modo de salida JSON forzada.
- Automatización de tareas de escritorio o navegador: las capacidades de razonamiento multi-paso y ejecución agéntica apuntan a flujos donde el modelo decide acciones sucesivas basándose en la retroalimentación del entorno.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La tabla de la model card aparece truncada antes de mostrar los valores correspondientes. Lo que sí se puede documentar es la existencia de la tabla y los modelos de comparación empleados:

| Benchmark | Categoria | Qwen3.8-27B | Modelos comparados |
|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | Codificacion agentica en terminal | valor no disponible (tabla truncada) | Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B, Opus4.6 Max (sin valores) |
| Bloque «Coding» de la tabla | Codificacion | valor no disponible | los mismos cuatro modelos |

El bloque de resultados de rendimiento textual empieza por la categoría «Coding» y no llega a mostrarse ningún número, ni para el modelo evaluado ni para los comparadores. Por tanto, no es posible verificar las afirmaciones de mejora de la model card con datos.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del recuento de parámetros publicado (27.781.427.952) y del tamaño del repositorio (55,6 GB), no datos oficiales del autor.

- Pesos en BF16/FP16: aproximadamente 55,6 GB. Requiere GPUs de 80 GB (A100 80 GB, H100 80 GB, MI300X) o reparto en varias GPU; no cabe en una RTX 4090 de 24 GB ni en una RTX 6000 Ada de 48 GB sin cuantizar.
- Pesos en FP8/INT8: aproximadamente 28 GB, más caché y activaciones. Cabe en A100 40 GB, L40S 48 GB y RTX 6000 Ada 48 GB.
- Pesos en 4 bits: aproximadamente 14-16 GB, más caché y estado recurrente. Podría caber en RTX 4090 24 GB, RTX 4080 16 GB (ajustado) y equipos Apple con memoria unificada de 32 GB o superior.
- Caché KV: solo las 16 capas de Gated Attention generan caché creciente. Estimación a partir de la configuración publicada: 16 capas × 4 cabezas KV × 256 de dimensión × 2 (K y V) × 2 bytes = 64 KiB por token en BF16, lo que equivale a unos 16 GiB con 262.144 tokens de contexto. Las 48 capas de Gated DeltaNet mantienen un estado de coste constante.
- Codificador de visión: añade consumo de memoria adicional no cuantificado en la información disponible, dependiente de la resolución y del número de fotogramas.
- Opciones de despliegue confirmadas por el autor: Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se ofrecen pesos GGUF, por lo que llama.cpp y Ollama no son viables con los artefactos publicados.
- Latencia y throughput: no disponible. La presencia de MTP (predicción multi-token) sugiere margen para decodificación especulativa, pero no se publican cifras.
- Versión alojada: Qwen Cloud anuncia una versión gestionada con 1.000.000 de tokens de contexto por defecto y herramientas integradas oficiales, todavía no disponible en el momento de redactar esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,78B (denso) | 262.144 nativo, hasta 1.000.000 | no disponible (tabla truncada) | Apache 2.0 | Pesos en safetensors en Hugging Face (repo de terceros) |
| Qwen3.6-27B | no disponible | no disponible | no disponible; figura como comparador | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible; figura como comparador | no disponible | no disponible |
| Muse Glimmer-30B | no disponible (30B por nombre) | no disponible | no disponible; figura como comparador | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible; figura como comparador | no disponible | no disponible |

Los cuatro modelos de la columna derecha aparecen únicamente como comparadores en la tabla de benchmarks del autor, sin especificaciones publicadas en la información disponible. No es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Autoría no oficial: el repositorio lo publica la cuenta de usuario kwakuobeng, no la organización oficial de Qwen. No hay forma de verificar con la información disponible que los pesos correspondan a un modelo entrenado por el equipo de Qwen.
- Sin validación comunitaria: 0 descargas y 0 valoraciones. No existen terceros que hayan reproducido resultados con estos pesos.
- Resultados de benchmarks no verificables: la tabla de la model card está truncada y no muestra ningún valor numérico, por lo que las afirmaciones de mejora en codificación, trabajo profesional, investigación y tareas agénticas no pueden contrastarse.
- Idiomas no declarados: la model card no enumera lenguas soportadas, lo que impide garantizar un comportamiento correcto en castellano o en otros idiomas distintos del inglés.
- Opacidad en el entrenamiento: no se especifican tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO, lo que impide evaluar sesgos o procedencia de los datos.
- Riesgo de alucinación: inherente a los modelos de lenguaje generativos; no se publican evaluaciones de fidelidad factual ni tasas de alucinación.
- Contexto largo anunciado sin documentación metodológica: se declara extensión hasta 1.000.000 de tokens pero no se describen los métodos de extensión ni la degradación esperada en contextos muy largos.
- Coste del modo thinking: al estar activado por defecto, incrementa el número de tokens generados y, con ello, la latencia y el coste por petición si no se desactiva explícitamente.
- Tool calling no documentado: la model card no detalla el formato de function calling ni las herramientas integradas más allá de la mención a la versión alojada en Qwen Cloud.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un repositorio de terceros conviene verificar la procedencia de los pesos antes de desplegarlos en producción.
- Ausencia de cuantizaciones publicadas: sin GGUF ni formatos de baja precisión oficiales, el despliegue en hardware de consumo exige cuantizar por cuenta propia, con la consiguiente pérdida de calidad no medida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kwakuobeng/Qwen3.8-27B
- Qwen Cloud (servicio de inferencia gestionada mencionado en la model card): https://www.qwencloud.com
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los únicos resultados obtenidos fueron páginas de ayuda de YouTube sin relación alguna con el modelo, por lo que no se incluyen.
