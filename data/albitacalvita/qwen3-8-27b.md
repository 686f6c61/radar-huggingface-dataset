# albitaCalvita/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión publicado en Hugging Face bajo el identificador albitaCalvita/Qwen3.8-27B. Según su model card, se presenta como la generación más capaz de la familia abierta Qwen, construida sobre la base arquitectónica de Qwen3.5, y como un modelo denso (no MoE) de 27B parámetros orientado a despliegue compacto. El recuento real de parámetros en los archivos safetensors es de 27.781.427.952, coherente con los 27B declarados.

Se trata de un modelo nativo de visión-lenguaje: procesa imágenes y vídeo además de texto, con una longitud de contexto de 262.144 tokens de forma nativa y extensible hasta 1.000.000. Incorpora control flexible de razonamiento (modo thinking activado por omisión, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`), características pensadas para tareas agénticas de horizonte largo.

Su relevancia potencial reside en la combinación de atención híbrida (Gated DeltaNet lineal combinada con Gated Attention completa en proporción 3:1), predicción multi-token (MTP) y soporte multimodal nativo en un tamaño que cabe en hardware de gama alta de una sola GPU tras cuantización. No obstante, la ficha se publica desde una cuenta no oficial, sin resultados numéricos de benchmarks en la información disponible y sin confirmación independiente de las capacidades declaradas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; capas Gated DeltaNet (atención lineal) y Gated Attention en proporción 3:1 |
| Parámetros totales | 27.781.427.952 (≈27,8B) según safetensors; la model card declara 27B |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 tokens |
| Tipos de cuantización | No se documentan cuantizaciones oficiales; el tamaño del repositorio (55,6 GB) es coherente con pesos en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato Hugging Face Transformers) |
| Dimensión oculta | 5.120 |
| Número de capas | 64 |
| Distribución de capas | 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Gated DeltaNet | 48 cabezas de atención lineal para V, 16 para QK; dimensión de cabeza 128 |
| Gated Attention | 24 cabezas para Q, 4 para KV; dimensión de cabeza 256; dimensión RoPE 64 |
| FFN | Dimensión intermedia 17.408 |
| Embedding / salida | 248.320 (con padding) |
| MTP | Entrenado con múltiples pasos de predicción multi-token |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 55,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con codificador de visión cuya innovación principal es el diseño híbrido de atención: de las 64 capas, el patrón se organiza en 16 bloques que repiten tres capas de Gated DeltaNet (atención lineal con estado recurrente) seguidas de una capa de Gated Attention completa. Esta proporción 3:1 reduce el coste cuadrático del contexto largo, ya que solo 16 capas mantienen caché KV explícita (4 cabezas KV de dimensión 256), mientras que el resto opera con estado recurrente de tamaño constante. La dimensión oculta es 5.120, la dimensión intermedia de la FFN 17.408 y el vocabulario 248.320 entradas con padding. El modelo incorpora además MTP (Multi-Token Prediction) entrenado con múltiples pasos, técnica que habilita decodificación especulativa para acelerar la generación.

El modelo está entrenado en dos etapas, pre-entrenamiento y post-entrenamiento, según la model card. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se detalla la arquitectura interna del codificador de visión ni el número de parámetros que aporta al total. Las innovaciones declaradas se centran en tres ejes: ejecución agéntica (planificación autónoma y manejo de retroalimentación del entorno), control flexible del razonamiento (thinking activado por omisión, desactivable, con `reasoning_effort` y `preserve_thinking`) y comprensión de imagen y vídeo, incluyendo vídeos de hasta una hora de duración.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo thinking activado por omisión y profundidad de razonamiento ajustable por petición.
- Codificación y razonamiento sobre código, con soporte específico para coding agéntico en terminal.
- Comprensión nativa de imagen: diagramas STEM, documentos y capturas.
- Comprensión de vídeo, incluyendo vídeos de escala horaria según la model card.
- Ejecución agéntica de horizonte largo: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Control de contexto de razonamiento: retención del razonamiento de mensajes históricos mediante `preserve_thinking`.
- Compatibilidad con harnesses y herramientas de desarrollo populares, según la model card (no se enumeran cuáles).
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque la compatibilidad con vLLM, SGLang y TokenSpeed y el enfoque agéntico lo hacen presumible; la ficha no lo confirma con una sección específica.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidad multimodal de audio: no disponible.

## Casos de uso

- Agentes autónomos de consola y automatización de DevOps: el modelo está explícitamente orientado a coding agéntico en terminal, de modo que puede encadenar comandos, interpretar la salida del entorno y corregir el plan a partir de la retroalimentación, con la ventaja de un contexto de 262.144 tokens para mantener el historial completo de la sesión.
- Asistentes de revisión de código en CI/CD: integrable mediante vLLM o SGLang en un pipeline que analice diffs, genere parches y ejecute comprobaciones, aprovechando el MTP para reducir la latencia de generación en flujos interactivos.
- Análisis de documentación técnica y científica con imágenes: al ser nativo en imagen-texto, permite procesar diagramas de arquitectura, tablas escaneadas y figuras de papers junto con el texto que las referencia, sin necesidad de un pipeline OCR externo.
- Extracción estructurada de información de vídeo largo: la comprensión de vídeo de escala horaria permite resumir reuniones, generar actas con marcas temporales o indexar contenido audiovisual para búsqueda posterior.
- Atención al cliente automatizada con contexto largo: los 262.144 tokens nativos admiten conversaciones multi-turno prolongadas o conversaciones con documentación adjunta extensa, manteniendo coherencia sin recurrir a resúmenes intermedios.
- Automatización de investigación y revisión bibliográfica: el modelo puede recorrer colecciones de documentos, comparar metodologías y sintetizar conclusiones, con el modo thinking habilitado para tareas que requieren cadenas de razonamiento largas.
- Procesamiento de contratos o expedientes con imágenes adjuntas: combinación de texto legal y documentos escaneados en una sola ventana de contexto, útil para extracción de cláusulas y detección de inconsistencias.
- Despliegue on-premise en una sola GPU: con cuantización de 4 bits los pesos ocupan aproximadamente 15-16 GB, lo que permite ejecutar el modelo en una RTX 4090 o RTX 5090 sin salida a servicios en la nube, requisito habitual en entornos con datos sensibles.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de rendimiento, pero la información proporcionada está truncada y no contiene ningún valor numérico: solo son visibles los encabezados de la tabla (Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B, Opus4.6 Max), la categoría "Coding" y la fila del benchmark "Terminal Bench 2.1 (Terminus)".

Por tanto: no se han publicado resultados numéricos de benchmarks en la información disponible. No se dispone de valores de MMLU, HumanEval, GSM8K, Terminal Bench ni de ningún otro benchmark para este modelo. No se presentan cifras estimadas ni inferidas.

## Requisitos de hardware

- VRAM para inferencia en BF16: los pesos ocupan aproximadamente 55,6 GB, por lo que se necesita una GPU de 80 GB (A100 80 GB, H100 80 GB, H200) para pesos más caché y activaciones.
- VRAM en FP8/INT8: del orden de 28-30 GB de pesos, encajando en A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB.
- VRAM en cuantización de 4 bits: aproximadamente 15-16 GB de pesos, lo que permite ejecución en RTX 4090 24 GB, RTX 3090 24 GB y RTX 5090 32 GB.
- Caché KV estimada: a partir de la configuración publicada (16 capas de Gated Attention con 4 cabezas KV de dimensión 256 en BF16), la caché sería del orden de 64 KB por token, aproximadamente 16-17 GB a 262.144 tokens. Las 48 capas restantes (Gated DeltaNet) usan estado recurrente de tamaño constante, lo que reduce el crecimiento de memoria frente a un transformer denso equivalente. Cálculo orientativo, no confirmado por el autor.
- GPU recomendadas: H100/H200 o A100 80 GB para BF16 con contexto largo; L40S o A100 40 GB para FP8; RTX 4090/5090 para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y RTX 5090 con cuantización de 4 bits; en BF16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card. No se menciona compatibilidad explícita con llama.cpp, Ollama o TGI, aunque la disponibilidad de pesos en safetensors permitiría conversiones a GGUF no documentadas por el autor.
- Servicio gestionado: Qwen Cloud ofrecería una versión alojada con 1M de contexto por omisión y herramientas integradas, según la model card; el servicio aparece como "coming soon" en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La model card sitúa el modelo frente a las siguientes referencias. No se dispone de especificaciones de esos modelos en la información proporcionada, por lo que la mayoría de campos figuran como no disponibles.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,8B (denso) | 262.144 nativos / 1M extensible | Apache 2.0 | Pesos en Hugging Face | Sin datos numéricos disponibles |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible | Sin datos numéricos disponibles |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Sin datos numéricos disponibles |
| Muse Glimmer-30B | No disponible | No disponible | No disponible | No disponible | Sin datos numéricos disponibles |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | Sin datos numéricos disponibles |

No se dispone de comparativas verificables con alternativas de código abierto del mismo rango de tamaño (por ejemplo, otras familias de 27-32B) en la información proporcionada.

## Limitaciones y advertencias

- Autoría no oficial: el repositorio está publicado por la cuenta albitaCalvita, no por la organización oficial de Qwen. La model card emplea la voz "we" propia del equipo Qwen y enlaza a Qwen Cloud, pero no hay confirmación independiente de que se trate de una publicación oficial.
- Sin benchmarks verificables: la tabla de rendimiento de la model card está truncada en la información disponible y no contiene cifras; no hay resultados publicados que permitan validar las capacidades declaradas.
- Sin adopción ni validación comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no existe retroalimentación de terceros sobre su comportamiento real.
- Riesgo de alucinación: no se documentan tasas de alucinación ni evaluaciones de fidelidad. Como en cualquier modelo generativo, el riesgo existe, especialmente en tareas de investigación y extracción de datos.
- Sesgos: no se publica ninguna evaluación de sesgos ni información sobre la composición del corpus de entrenamiento, lo que impide estimar sesgos demográficos, culturales o lingüísticos.
- Idiomas: no se especifica la cobertura lingüística. Es previsible que el rendimiento sea desigual fuera del inglés y del chino, pero no hay datos que lo confirmen.
- Degradación en contexto largo: aunque se declaran 262.144 tokens nativos y extensión a 1M, no hay evaluaciones publicadas de recuperación en contexto largo (needle-in-a-haystack u similares). El comportamiento en la ventana extendida a 1M no está verificado.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero conviene verificar que los pesos publicados por esta cuenta cumplen efectivamente los términos de la licencia original y que no existen restricciones adicionales no declaradas.
- Instalación local: las estimaciones de memoria y latencia de esta ficha son cálculos derivados de la configuración publicada, no mediciones del autor.
- Compatibilidad multimodal: no se detalla el procesador de imagen ni los requisitos de preprocesado, lo que puede complicar la integración en producción sin pruebas previas.
- Cifras de la model card no contrastadas: referencias como Qwen3.7-Plus, Muse Glimmer-30B u Opus4.6 Max no se pueden verificar con la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/albitaCalvita/Qwen3.8-27B
- Qwen Cloud (enlace citado en la model card): https://www.qwencloud.com
- Página del modelo en Qwen Cloud (enlace citado en la model card): https://www.qwencloud.com/models/qwen3.8-27b

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente resultados genéricos de Wikipedia), por lo que no se dispone de papers, blogs técnicos, repositorios de código ni demos adicionales que enlazar.
