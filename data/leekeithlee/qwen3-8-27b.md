# Leekeithlee/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, de 27.781.427.952 parámetros (aproximadamente 27,8 mil millones), presentado como la generación más capaz de la familia de modelos abiertos Qwen hasta la fecha y construido sobre la base arquitectónica de Qwen3.5. Se distribuye en formato Hugging Face Transformers (safetensors) bajo licencia Apache 2.0 y está etiquetado con el pipeline `image-text-to-text`, es decir, es un modelo nativo visión-lenguaje capaz de entender imágenes y vídeos, no un LLM de texto con un adaptador añadido. El repositorio analizado se publica bajo la cuenta de usuario `Leekeithlee`, no en la organización oficial de Qwen, y en el momento de la consulta registra 0 descargas y 0 likes, con un tamaño de 55,6 GB.

El modelo resuelve el problema de ejecutar tareas agénticas de largo horizonte (coding agéntico, trabajo profesional, investigación) en un tamaño compacto y desplegable en infraestructura propia. Su rasgo técnico más distintivo es una arquitectura híbrida de 64 capas que combina atención lineal (Gated DeltaNet) con atención completa con compuertas (Gated Attention), lo que reduce el coste de atención en contextos largos. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000.

Es relevante ahora porque incorpora control flexible del razonamiento (modo thinking activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención del contexto de razonamiento histórico mediante `preserve_thinking`), comprensión de vídeo de hasta una hora de duración y compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed. No se han publicado en la información disponible los valores numéricos de sus benchmarks: la tabla de la model card aparece truncada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión: Gated DeltaNet (atención lineal) + Gated Attention (atención completa con compuertas) |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible en la model card; los pesos publicados son safetensors (55,6 GB para 27,8 B de parámetros, consistente con bf16/fp16). Compatible con cuantización vía vLLM/SGLang/llama.cpp, sin recetas oficiales documentadas |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |
| Dimension oculta | 5.120 |
| Numero de capas | 64, con layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Gated DeltaNet | 48 cabezas de atención lineal para V y 16 para QK; dimensión de cabeza 128 |
| Gated Attention | 24 cabezas para Q y 4 para KV; dimensión de cabeza 256; dimensión RoPE 64 |
| FFN | Dimensión intermedia 17.408 |
| Vocabulario / embeddings | 248.320 (con padding), tanto en embedding como en salida LM |
| Prediccion multi-token (MTP) | Entrenado con múltiples pasos |
| Etapa de entrenamiento | Pre-entrenamiento y post-entrenamiento |
| Tamano del repositorio | 55,6 GB |
| Libreria / pipeline | transformers; image-text-to-text |
| Fecha de publicacion | 2026-10-23 |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con un codificador de visión acoplado, diseñado para entrada image-text-to-text. La innovación estructural está en el bloque de atención: de las 64 capas, el layout repite 16 veces la secuencia de tres capas con Gated DeltaNet seguidas de una capa con Gated Attention. Gated DeltaNet es un mecanismo de atención lineal con estado recurrente (48 cabezas para V, 16 para QK, dimensión de cabeza 128 en ambos casos), mientras que las capas de Gated Attention mantienen atención completa con 24 cabezas de consulta y 4 de clave-valor, dimensión de cabeza 256 y RoPE de dimensión 64. La proporción 3:1 entre atención lineal y atención completa es el mecanismo que permite sostener ventanas de 262.144 tokens (y hasta 1.000.000 en extensión) con un coste de atención subcuadrático en la mayoría de capas. El FFN tiene dimensión intermedia 17.408 y el vocabulario está paddeado a 248.320 entradas.

El modelo se entrena en dos etapas, pre-entrenamiento y post-entrenamiento, e incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa nativa y acelera la generación. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineamiento preferencial; esa información no está disponible. Sí se documenta el control del razonamiento en inferencia: modo thinking activado por defecto, desactivable por petición, con parámetro `reasoning_effort` para ajustar la profundidad de razonamiento y `preserve_thinking` para conservar el contexto de razonamiento de mensajes históricos.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo thinking activado por defecto y desactivable por petición.
- Control de profundidad de razonamiento mediante `reasoning_effort` y retención del razonamiento previo mediante `preserve_thinking`.
- Codificación y trabajo profesional: la model card declara mejoras en coding, trabajo profesional, investigación y tareas agénticas de largo horizonte.
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Terminal y entornos de línea de comandos: evaluado en Terminal Bench 2.1 (Terminus) según la model card.
- Comprensión nativa de imágenes: diagramas STEM, documentos y capturas.
- Comprensión de vídeo, incluidos vídeos de duración de horas según la model card.
- Compatibilidad con harnesses y herramientas de desarrollo populares (sin detallar cuáles en la información disponible).
- Decodificación multi-token (MTP) para acelerar la inferencia.
- Soporte de tool calling / function calling: la model card menciona herramientas integradas en la versión alojada de Qwen Cloud, pero no detalla el protocolo de function calling en los pesos abiertos; no disponible en detalle.
- Capacidades multilingües: no disponibles (sin lista de idiomas declarada).

## Casos de uso

- Agente de terminal y automatización de CI/CD: el modelo puede operar sobre entornos de línea de comandos, interpretar la salida de comandos y corregir su plan gracias al manejo de retroalimentación del entorno declarado; su evaluación en Terminal Bench 2.1 apunta a este escenario.
- Refactorización y generación de código en producción: con 262.144 tokens de contexto nativo puede ingerir repositorios o módulos completos, mantener el estado entre pasos y encadenar tool calling con linters, compiladores y suites de tests.
- Análisis de documentación técnica y diagramas STEM: al ser un modelo visión-lenguaje nativo, puede extraer información de esquemas, tablas y figuras en papers o manuales sin un pipeline OCR separado.
- Procesamiento de vídeo de larga duración: la ventana extendida y la comprensión de vídeos de hasta una hora permiten resumir sesiones, extraer acciones o auditar grabaciones de soporte y formación.
- Investigación asistida con razonamiento controlado: activando `reasoning_effort` alto para síntesis de literatura y desactivando thinking en consultas de recuperación rápida, optimizando coste por consulta.
- Atención al cliente multi-turno: 262.144 tokens de contexto permiten arrastrar historial completo, documentación de producto y estado de la cuenta en una misma conversación sin truncar.
- Extracción estructurada de documentos largos (contratos, informes financieros): la combinación de visión y contexto extenso permite localizar cláusulas o cifras en documentos completos y devolver JSON validado.
- Despliegue on-premise con datos sensibles: al ser Apache 2.0 y caber en una sola GPU de 80 GB en bf16, es apto para entornos con requisitos de soberanía del dato.
- Migración asistida de código legado: lectura de múltiples ficheros, planificación de cambios y aplicación iterativa con verificación, apoyándose en MTP para reducir latencia en bucles agénticos.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados con las columnas Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (la primera categoría visible es "Coding", con la fila "Agentic terminal coding — Terminal Bench 2.1 (Terminus)"), pero **los valores numéricos no están presentes en la información proporcionada**: el contenido se interrumpe antes de mostrar las celdas. No se han publicado resultados de benchmarks utilizables en la información disponible.

| Benchmark | Categoria declarada | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | Coding / agéntico | No disponible | No disponible | No disponible | No disponible | No disponible |

Modelos de comparación nombrados en la model card (sin cifras disponibles): Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max.

## Requisitos de hardware

- Peso de los pesos en bf16: 55,6 GB, según el tamaño del repositorio. Para inferencia hay que sumar la caché KV y las activaciones.
- VRAM estimada en bf16/fp16: aproximadamente 62-70 GB para contexto moderado; más de 80 GB si se explota la ventana completa de 262.144 tokens.
- VRAM estimada en fp8: aproximadamente 30-35 GB (cuantización no publicada oficialmente, estimación a partir del recuento de parámetros).
- VRAM estimada en int4 (GGUF/AWQ/GPTQ): aproximadamente 16-20 GB (estimación; no hay ficheros cuantizados en el repositorio).
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16 con contexto largo; A100 40 GB, L40S 48 GB o RTX 6000 Ada para fp8; RTX 4090 24 GB solo en cuantización int4 y con contexto reducido.
- Cabe en GPU de consumo: solo en cuantizaciones de 4 bits (RTX 4090 24 GB, RTX 3090 24 GB) y aceptando recortes de contexto; en bf16 no cabe en 24 GB.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card. Ollama, llama.cpp y TGI no se mencionan explícitamente para este modelo.
- Latencia y throughput: no disponibles. El entrenamiento con MTP (multi-token prediction) está pensado para habilitar decodificación especulativa y reducir la latencia por token, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (este repositorio) | 27,8 B densos | 262.144 nativo, hasta 1.000.000 | Sin cifras publicadas en la informacion disponible | Apache 2.0 | Pesos en HF (repo de terceros, 0 descargas) |
| Qwen3.6-27B | 27 B (declarado como comparable en la model card) | No disponible | Sin cifras publicadas en la informacion disponible | No disponible | No disponible en esta busqueda |
| Qwen3.7-Plus | No disponible | No disponible | Sin cifras publicadas en la informacion disponible | No disponible (posible oferta propietaria/API) | No disponible en esta busqueda |
| Muse Glimmer-30B | 30 B (por el nombre) | No disponible | Sin cifras publicadas en la informacion disponible | No disponible | No disponible en esta busqueda |
| Opus4.6 Max | No disponible | No disponible | Sin cifras publicadas en la informacion disponible | No disponible (propietario) | No disponible en esta busqueda |

No se dispone de datos verificables de parámetros, contexto, licencia ni resultados para los modelos comparables más allá de lo que la propia model card nombra; la comparativa cuantitativa queda por tanto pendiente.

## Limitaciones y advertencias

- Repositorio alojado en la cuenta de usuario `Leekeithlee`, no en la organización oficial de Qwen: no hay verificación de procedencia en la información disponible. Conviene contrastar los hashes de los pesos con la publicación oficial antes de usarlos en producción.
- 0 descargas y 0 likes en el momento de la consulta: no existe evidencia de uso en la comunidad ni validación independiente.
- Ausencia de resultados numéricos de benchmarks: no se puede verificar la mejora declarada frente a Qwen3.6-27B o Qwen3.7-Plus.
- No se documentan idiomas soportados; el rendimiento en castellano no está garantizado ni medido.
- No se detalla la composición del dataset de entrenamiento ni si hubo RLHF/DPO, por lo que los sesgos conocidos no se pueden enumerar; cabe esperar los sesgos habituales de los corpus web a gran escala.
- Riesgo de alucinación inherente a los modelos generativos, agravado en tareas agénticas de largo horizonte donde los errores se acumulan entre pasos.
- El modo thinking está activado por defecto: incrementa el consumo de tokens de salida y la latencia si no se desactiva explícitamente por petición.
- La ventana de 1.000.000 tokens es una extensión, no la longitud nativa (262.144); el rendimiento más allá de la ventana nativa puede degradarse y el coste de memoria crece de forma notable.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario asume la responsabilidad sobre el cumplimiento y sobre la procedencia real de los pesos.
- La versión alojada en Qwen Cloud, con 1M de contexto por defecto y herramientas integradas, se anuncia como "coming soon" y puede no estar disponible; sus capacidades no equivalen necesariamente a las de estos pesos.
- No se publican recetas de cuantización oficiales: las cifras de VRAM en fp8/int4 son estimaciones y pueden degradar la calidad de forma no medida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Leekeithlee/Qwen3.8-27B
- Página del modelo en Qwen Cloud (servicio alojado, anunciado como próximo): https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud (plataforma de inferencia gestionada): https://www.qwencloud.com
- Paper, blog técnico, repositorio de código o demo: no disponibles en la información proporcionada (los resultados de la búsqueda web no contenían material relevante sobre el modelo).
