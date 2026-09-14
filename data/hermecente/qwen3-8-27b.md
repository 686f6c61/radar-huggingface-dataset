# Hermecente/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, presentado por la familia Qwen como la generación más capaz de su línea de modelos abiertos hasta la fecha. Se publica como un modelo denso de 27B parámetros (27.781.427.952 parámetros reales según los pesos en safetensors), pensado para despliegue en infraestructura propia, y combina comprensión nativa de imagen y vídeo con control flexible del modo de razonamiento. El repositorio analizado es `Hermecente/Qwen3.8-27B`, una copia alojada por un usuario independiente con licencia Apache 2.0 y sin descargas ni valoraciones registradas en el momento de la consulta.

El modelo parte de la base arquitectónica de Qwen3.5 y sustituye la atención completa por un diseño híbrido: 64 capas organizadas en 16 bloques de la forma 3 × (Gated DeltaNet → FFN) más 1 × (Gated Attention → FFN). Esta mezcla de atención lineal y atención con compuerta reduce el coste del contexto largo, que es de 262.144 tokens de forma nativa y ampliable hasta 1.000.000. Incorpora predicción multi-token (MTP) entrenada con varios pasos y token embedding de 248.320 entradas.

Su relevancia actual reside en tres ejes: razonamiento controlable por petición (`reasoning_effort`, `preserve_thinking`), ejecución agéntica de horizonte largo con mejor manejo del retorno del entorno, y compatibilidad con harnesses y herramientas de desarrollo habituales. El modelo card menciona además una versión alojada en Qwen Cloud con contexto de 1M por defecto, aún no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; 16 bloques de (3 × Gated DeltaNet → FFN) + (1 × Gated Attention → FFN), 64 capas en total |
| Parametros totales | 27.781.427.952 (27B según el model card) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens nativos; ampliable hasta 1.000.000 |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (solo se publican pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |
| Dimension oculta | 5.120 |
| Token embedding / salida LM | 248.320 (padded) |
| Gated DeltaNet | 48 cabezas de atencion lineal para V, 16 para QK; dimension de cabeza 128 |
| Gated Attention | 24 cabezas para Q, 4 para KV; dimension de cabeza 256; dimension RoPE 64 |
| FFN | Dimension intermedia 17.408 |
| Prediccion multi-token | MTP entrenado con multiples pasos |
| Modalidades de entrada | Texto, imagen y video (pipeline `image-text-to-text`) |
| Tamano del repositorio | 55,6 GB |
| Libreria | transformers |
| Etiquetas | transformers, safetensors, qwen3_5, image-text-to-text, conversational, license:apache-2.0, endpoints_compatible, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-13 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con codificador de visión, entrenado en dos fases declaradas: pre-entrenamiento y post-entrenamiento. El bloque repetido 16 veces alterna tres capas basadas en Gated DeltaNet (atención lineal con estado recurrente) y una capa de Gated Attention clásica. Las capas de atención lineal usan 48 cabezas para el valor y 16 para consulta/clave con dimensión 128, mientras que las 16 capas de atención con compuerta emplean 24 cabezas de consulta y solo 4 de clave/valor con dimensión 256 y RoPE de dimensión 64. El FFN tiene dimensión intermedia 17.408. La proporción 3:1 entre atención lineal y atención completa es la que permite sostener ventanas de 262.144 tokens con un coste de caché KV contenido.

El model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases específicas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles. Sí se documentan tres mecanismos de control: el modo de pensamiento activado por defecto y desactivable por petición, el ajuste de profundidad de razonamiento mediante `reasoning_effort` y la conservación del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`. La predicción multi-token (MTP) entrenada con varios pasos es la innovación declarada orientada a acelerar la decodificación.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens nativos.
- Razonamiento explícito con modo de pensamiento activado por defecto, desactivable por petición y ajustable en profundidad mediante `reasoning_effort`.
- Retención del contexto de razonamiento de mensajes anteriores mediante `preserve_thinking`, útil en cadenas de razonamiento largas.
- Codificación: mejoras declaradas en tareas de programación, incluida la codificación agéntica en terminal (benchmark Terminal Bench 2.1, variante Terminus).
- Ejecución agéntica de horizonte largo: planificación autónoma y manejo del retorno del entorno para completar tareas de extremo a extremo.
- Comprensión visión-lenguaje nativa: imágenes y vídeos, incluidos diagramas STEM, documentos y vídeos de hasta una hora de duración según el model card.
- Compatibilidad con harnesses y herramientas de desarrollo populares, lo que facilita la integración en stacks existentes.
- Predicción multi-token (MTP) para decodificación acelerada.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque el enfoque agéntico y la compatibilidad con harnesses lo hacen previsible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente de código en terminal: el modelo está entrenado específicamente para codificación agéntica en terminal (Terminal Bench 2.1 con variante Terminus), de modo que puede ejecutar comandos, leer la salida del entorno y corregir la trayectoria en varias iteraciones sin intervención humana.
- Análisis de documentos técnicos extensos: con 262.144 tokens nativos y extensión hasta 1.000.000, permite cargar manuales, especificaciones o bases de código completas y responder preguntas sobre ellas sin fragmentación agresiva.
- Inspección de diagramas y figuras científicas: el codificador de visión permite interpretar diagramas STEM, gráficos y esquemas incluidos en artículos o informes, combinando la lectura visual con razonamiento textual.
- Procesamiento de vídeo de larga duración: el model card declara comprensión de vídeos de hasta una hora, lo que habilita resúmenes, búsqueda de eventos concretos o extracción de conclusiones en grabaciones de reuniones y clases.
- Agentes autónomos de automatización de flujos: la planificación reforzada y el manejo del retorno del entorno lo hacen adecuado para pipelines que encadenan llamadas a herramientas, verificación de resultados y reintentos.
- Razonamiento matemático y de investigación con presupuesto de cómputo ajustable: `reasoning_effort` permite subir la profundidad de razonamiento en problemas difíciles y bajarla en consultas triviales para reducir latencia y coste.
- Atención al cliente automatizada con contexto largo: la ventana de 262.144 tokens permite mantener el historial completo de una incidencia, incluidos registros y capturas, sin truncar.
- Despliegue en infraestructura propia sujeta a requisitos de soberanía del dato: la licencia Apache 2.0 y el formato safetensors permiten servir el modelo en clúster propio sin dependencia de API externa.

## Benchmarks y rendimiento

El model card incluye una tabla de resultados comparativa, pero en la información disponible solo se conserva la cabecera y el inicio de la sección de codificación (fila "Agentic terminal coding", benchmark Terminal Bench 2.1 en variante Terminus). Los valores numéricos de esa fila y del resto de secciones no están disponibles en el extracto proporcionado.

No se han publicado resultados de benchmarks completos en la informacion disponible.

Modelos incluidos en la tabla comparativa del model card: Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. La sección documentada en el extracto es "Coding"; se desconoce el resto de categorías y las cifras asociadas.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del número de parámetros (27,78B) y del tamaño del repositorio (55,6 GB en precisión completa), no datos publicados por el autor.

- Pesos en bf16/fp16: aproximadamente 55,6 GB. Requiere una GPU de 80 GB (H100, A100 80 GB) o reparto en varias GPU.
- Pesos en FP8: aproximadamente 28 GB. Cabe en H100 80 GB, A100 80 GB, L40S 48 GB y, con margen escaso, en RTX 5090 de 32 GB.
- Pesos en cuantización de 4 bits (GPTQ/AWQ, si se generan): aproximadamente 15-17 GB. Cabe en RTX 4090 24 GB, RTX 5090 32 GB y A6000 48 GB.
- Caché KV: solo 16 de las 64 capas usan atención completa, con 4 cabezas KV de dimensión 256. La estimación resultante es de unos 64 KiB por token en bf16, es decir, del orden de 16 GiB para la ventana nativa de 262.144 tokens. Las 48 capas restantes son de atención lineal con estado recurrente de tamaño fijo.
- GPU consumer: sí es viable en RTX 4090 (24 GB) y RTX 5090 (32 GB) con cuantización de 4 bits, y en RTX 5090 con FP8 si se limita la longitud de contexto. En bf16 no cabe en ninguna GPU consumer actual de una sola pieza.
- Opciones de despliegue declaradas: Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se mencionan llama.cpp, Ollama ni TGI, y no se publican pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles. La predicción multi-token (MTP) con varios pasos está orientada a mejorar la velocidad de decodificación, pero no se aportan cifras.
- Existe una versión gestionada en Qwen Cloud, anunciada como próximamente, con contexto de 1M por defecto y herramientas integradas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,78B (denso) | 262.144 nativos, hasta 1.000.000 | Apache 2.0 | Pesos abiertos (repo analizado, 0 descargas) y API gestionada anunciada | Tabla publicada en el model card, valores no disponibles en el extracto |
| Qwen3.6-27B | No disponible | No disponible | No disponible | Mencionado en la tabla comparativa del model card | Valores no disponibles en el extracto |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Mencionado en la tabla comparativa del model card | Valores no disponibles en el extracto |
| Muse Glimmer-30B | No disponible | No disponible | No disponible | Mencionado en la tabla comparativa del model card | Valores no disponibles en el extracto |
| Opus4.6 Max | No disponible | No disponible | No disponible | Mencionado en la tabla comparativa del model card | Valores no disponibles en el extracto |

No se dispone de especificaciones ni de resultados numéricos de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no puede completarse.

## Limitaciones y advertencias

- Procedencia del repositorio: el repositorio analizado pertenece al usuario `Hermecente`, no a la organización oficial de Qwen. El model card reproduce contenido de la familia Qwen y la etiqueta `qwen3_5` aparece entre los tags, lo que aconseja verificar la integridad y el origen de los pesos antes de usarlos en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria disponible sobre esta copia concreta.
- Idiomas soportados no declarados: no hay información sobre cobertura multilingüe ni sobre calidad por idioma.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.
- Alucinación: no se aportan tasas de alucinación ni evaluaciones de fidelidad; al ser un modelo con modo de razonamiento activado por defecto, las cadenas de pensamiento pueden contener afirmaciones no verificadas que conviene contrastar.
- Coste de contexto largo: aunque la ventana nativa es de 262.144 tokens, el uso efectivo de esa longitud incrementa el consumo de caché KV y la latencia; la extensión a 1.000.000 tokens no está cuantificada en cuanto a degradación de calidad.
- Cuantizaciones no oficiales: el repositorio solo publica safetensors; cualquier GGUF o cuantización de 4 bits sería de terceros y no está validada por el autor.
- Requisitos de hardware: el despliegue en bf16 exige GPU de 80 GB o reparto multi-GPU, lo que descarta estaciones de trabajo con GPU consumer sin cuantizar.
- Licencia: Apache 2.0 permite uso comercial, pero al tratarse de una copia alojada por un tercero conviene confirmar la licencia del artefacto original antes de redistribuirlo.
- Fechas del repositorio: la creación y la actualización figuran como 2026-09-13, con un segundo de diferencia entre ambas, dato coherente con una subida automatizada pero que no aporta historial de mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Hermecente/Qwen3.8-27B
- Qwen Cloud (servicio de inferencia gestionada): https://www.qwencloud.com
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Paper, blog técnico, repositorio de código o demo oficiales: no disponibles en la informacion proporcionada. La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (únicamente enlaces genéricos a YouTube).
