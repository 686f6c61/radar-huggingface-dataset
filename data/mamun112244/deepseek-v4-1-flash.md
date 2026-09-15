# Mamun112244/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) publicado en HuggingFace por el usuario Mamun112244. Según la model card, se trata de un modelo con 552B parámetros de backbone más 196B de memoria condicional Engram, contexto de hasta un millón de tokens y procesamiento nativo de imágenes y texto. Su tesis técnica principal es la compresión agresiva de la caché KV: mediante atención dispersa CSA2, FP4 para la caché principal y SWA Bounded Replay, el autor afirma reducir la huella de caché global a 890 bytes por token, aproximadamente 1/4 de la de DeepSeek-V4-Flash y 1/437 de la de DeepSeek-V1.

La arquitectura se describe como Causal Encoder-Decoder (CED): 40 capas Transformer divididas en 20 capas de encoder causal y 20 de decoder, donde la caché KV global del decoder se proyecta desde los estados ocultos finales del encoder en lugar de derivarse capa a capa. Esto permite activar solo 8B parámetros por token en prefill y 16B en decode, un planteamiento orientado a cargas de trabajo agénticas con entradas muy largas. Cada capa MoE usa 1 experto compartido y 384 expertos enrutados, activando 6 expertos enrutados por token.

Es relevante por dos motivos contrapuestos. Por un lado, propone técnicas concretas y medibles de eficiencia de contexto largo (KV de 890 bytes/token, modos de atención Full/Reindex/Reuse, indexador jerárquico disperso). Por otro, el repositorio presenta señales de alerta: 0 descargas, 0 likes, creado y actualizado en el mismo minuto, 510,3 GB de pesos y uso de logotipos y badges de la organización deepseek-ai. No se ha confirmado en la información disponible que exista un lanzamiento oficial de DeepSeek con esta denominación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con Causal Encoder-Decoder (CED), 40 capas (20 encoder causal + 20 decoder), atención dispersa CSA2, SWA Bounded Replay, DSpark speculative decoding, Single-Pass mHC y memoria condicional Engram |
| Parámetros totales | 763.205.315.794 según los safetensors del repositorio. La model card declara 552B de backbone más 196B de Engram (748B), cifra que no coincide con la medición real |
| Parámetros activos | 8B por token en prefill y 16B por token en decode según la model card; 1 experto compartido y 6 expertos enrutados de 384 por capa MoE |
| Longitud de contexto | Hasta 1.000.000 tokens. Atención dispersa entrenada a 64K y extendida a 1M a los 34T tokens |
| Tipos de cuantización | Pesos en FP8/8-bit (tags `fp8`, `8-bit`). Caché KV principal en FP4 (formato E2M1 con una escala E4M3 por cada 16 canales). No se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | MIT, declarada en el repositorio y en la model card |
| Formato de pesos | safetensors (librería transformers, tokenizer no especificado). Tamaño del repositorio: 510,3 GB |

## Arquitectura y entrenamiento

El modelo combina varias innovaciones descritas en la model card. La columna vertebral es un Transformer de 40 capas organizado como encoder causal de 20 capas más decoder de 20 capas (CED), en el que la caché KV global del decoder se proyecta desde los estados ocultos finales del encoder, en lugar de calcularse por capa. Sobre esa base, Compressed Sparse Attention 2 (CSA2) asigna a cada capa de atención uno de tres modos estáticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar los índices Top-K de atención dispersa. En el decoder, un indexador disperso jerárquico restringe las capas de indexación posteriores a un conjunto de candidatos construido por la primera capa en modo Full, lo que acota el coste del indexado sin depender de la longitud del contexto. SWA Bounded Replay reconstruye los estados KV de ventana deslizante ausentes replicando solo los últimos n_win tokens, evitando persistir esa caché en SSD.

El sistema multimodal usa un codificador visual DeepSeek-ViT entrenado desde cero con RoPE 2D y downsampling pixel-unshuffle 3×3, más un proyector MLP de dos capas que convierte las imágenes en embeddings visuales procesados conjuntamente con el texto desde el inicio del preentrenamiento. El preentrenamiento se hizo desde cero sobre un corpus multimodal de 45T tokens. El postentrenamiento sigue el paradigma SFT → RL → destilación on-policy (OPD) sin modificaciones algorítmicas, con el esfuerzo puesto en la síntesis automatizada a gran escala de tareas y entornos agénticos. El modelo expone un ajuste de esfuerzo de razonamiento continuo en el rango entero 1-100 para intercambiar coste de inferencia por precisión.

## Capacidades

- Generación de texto autorregresiva a partir de entradas de texto, de imagen o mixtas (pipeline `image-text-to-text`).
- Razonamiento con esfuerzo controlable mediante un parámetro entero de 1 a 100, que permite ajustar el presupuesto de cómputo por consulta.
- Procesamiento de imágenes de forma nativa mediante el codificador DeepSeek-ViT y el proyector MLP, integrado con el texto desde el preentrenamiento.
- Contexto largo de hasta 1.000.000 tokens, orientado a tareas de tipo agéntico con entradas masivas.
- Tareas agénticas y entornos de varios pasos: la model card menciona síntesis automatizada de tareas y entornos agénticos y una figura de rendimiento en benchmarks agénticos.
- Decodificación especulativa integrada (DSpark), con generación de borradores semi-autorregresiva y verificación planificada por confianza.
- Memoria condicional Engram de 196B parámetros con acceso disperso por búsqueda basada en token.
- Soporte de `tool calling` / `function calling`: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no enumera idiomas.
- Otras capacidades especiales (audio, thinking mode explícito): no disponible.

## Casos de uso

- Atención al cliente con historiales largos: el modelo puede mantener conversaciones multi-turno apilando semanas de tickets previos dentro de la ventana de 1M tokens, y la caché KV de 890 bytes/token reduce el coste de memoria frente a alternativas con caché densa.
- Análisis de repositorios y bases de código completas: con 1M tokens de contexto cabe un monorepositorio de tamaño medio; el modelo razonaría sobre dependencias cruzadas entre ficheros sin necesidad de recuperación externa.
- Procesamiento de documentación técnica con imágenes: al aceptar entradas image-text-to-text, puede interpretar diagramas de arquitectura, capturas de paneles de monitorización o esquemas de red junto al texto que los describe.
- Pipelines de agentes con muchas entradas y pocas salidas: el coste de prefill es de 8B parámetros activos por token, por lo que tareas que leen grandes volúmenes de contexto y emiten respuestas cortas (clasificación de incidencias, extracción de entidades, auditoría de contratos) resultan comparativamente económicas.
- Asistencia a investigación documental: indexación y síntesis de literatura científica donde el contexto incluye múltiples PDFs convertidos a texto e imágenes de figuras, con esfuerzo de razonamiento ajustable según la profundidad requerida.
- Evaluación de razonamiento con presupuesto variable: el parámetro de esfuerzo 1-100 permite usar el mismo modelo en modo rápido para tareas triviales y en modo profundo para problemas matemáticos o de planificación, sin cambiar de checkpoint.
- Generación de informes a partir de datos multimodales: combinación de texto y capturas para producir resúmenes ejecutivos, siempre que se valide antes la calidad real del modelo.

En todos los casos anteriores, el uso en producción exige una evaluación previa propia: no hay benchmarks publicados en la información disponible y el repositorio no está verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye una sección de resultados de evaluación y una figura de rendimiento agéntico (Figura 1a), pero el extracto proporcionado se interrumpe antes de mostrar las tablas, y solo indica que los modelos base se evalúan en su marco interno con idéntica configuración y que las puntuaciones con una diferencia inferior a 0,3 se consideran equivalentes.

El único dato cuantitativo de rendimiento disponible es el tamaño de la caché KV global por token, tomado de la Figura 1b:

| Modelo | Caché KV global por token | Reducción relativa |
|---|---|---|
| DeepSeek-V4.1-Flash | 890 bytes | Referencia |
| DeepSeek-V4-Flash | Aproximadamente 3.560 bytes (derivado de la relación 1/4 indicada) | 4× mayor |
| DeepSeek-V1 | Aproximadamente 389.000 bytes (derivado de la relación 1/437 indicada) | 437× mayor |

Los valores de DeepSeek-V4-Flash y DeepSeek-V1 son cálculos aritméticos derivados de los factores de reducción declarados en la model card, no cifras publicadas directamente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 763,2B parámetros en FP8 (1 byte por parámetro) los pesos ocupan del orden de 763 GB, a los que hay que sumar caché KV y activaciones. En 4 bits, la estimación ronda los 380-400 GB solo de pesos.
- GPU recomendadas: se requieren nodos multi-GPU. Para FP8 harían falta al menos 16 GPUs de 80 GB (por ejemplo H100 o A100 80 GB) para alojar los pesos con margen para la caché; 8×H100 80 GB (640 GB) serían insuficientes en FP8.
- GPU de consumo: no cabe en ninguna GPU de consumo. Una RTX 4090 con 24 GB no puede alojar ni una fracción significativa de los pesos, y el modelo no ofrece variantes cuantizadas de pequeño tamaño en el repositorio.
- Opciones de despliegue: la librería declarada es transformers con el tag de arquitectura `deepseek_v41`, lo que implica soporte potencialmente personalizado (posible necesidad de `trust_remote_code` o de una versión concreta de transformers). vLLM, SGLang o TGI dependerían de que exista soporte para esa arquitectura. llama.cpp y Ollama son improbables dado el formato FP8/safetensors y la arquitectura propietaria. No hay confirmación de compatibilidad en la información disponible.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio ocupa 510,3 GB, por lo que la descarga y el almacenamiento local son un requisito previo relevante.

## Comparativa con modelos similares

La información proporcionada solo permite comparar con los modelos citados explícitamente en la model card (DeepSeek-V4-Flash y DeepSeek-V1) y únicamente en el eje de caché KV. No hay datos de parámetros, contexto ni licencia de esos modelos en el material disponible.

| Modelo | Parámetros totales | Contexto | Caché KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (este repositorio) | 763,2B medidos; 552B + 196B declarados | 1.000.000 tokens | 890 bytes | MIT (declarada por el subidor) | Repositorio de terceros, 0 descargas, 0 likes |
| DeepSeek-V4-Flash | No disponible | No disponible | Aproximadamente 4× mayor (derivado) | No disponible | No disponible |
| DeepSeek-V1 | No disponible | No disponible | Aproximadamente 437× mayor (derivado) | No disponible | No disponible |

No se dispone de información que permita comparar con alternativas de la misma categoría (por ejemplo otros MoE multimodales de contexto largo) en cuanto a rendimiento, coste o licencia.

## Limitaciones y advertencias

- Procedencia no verificada: el repositorio pertenece al usuario Mamun112244, no a la organización deepseek-ai, y reutiliza logotipos, badges y enlaces de DeepSeek. No se ha podido confirmar que DeepSeek haya publicado un modelo con esta denominación.
- Señales de baja fiabilidad del repositorio: 0 descargas, 0 likes, fecha de creación y de última actualización separadas por un segundo, y un tamaño de 510,3 GB. No hay historial ni validación de la comunidad.
- Discrepancia de parámetros: los safetensors suman 763,2B parámetros, mientras la model card declara 552B de backbone más 196B de Engram. La diferencia (aproximadamente 15B) no está explicada.
- Riesgo de ejecución de código: si la arquitectura `deepseek_v41` requiere `trust_remote_code`, cargar el modelo implica ejecutar código del autor. No se recomienda hacerlo en entornos sin aislamiento.
- Licencia cuestionable: el repositorio declara MIT, pero no hay forma de verificar que el subidor tenga derecho a relicenciar estos pesos. Si el modelo deriva de pesos de DeepSeek, podrían aplicar los términos de la licencia original del modelo de DeepSeek, con posibles restricciones para uso comercial.
- Ausencia de benchmarks: no hay resultados numéricos publicados en la información disponible. Cualquier decisión de adopción en producción requeriría una evaluación propia sobre el caso de uso concreto.
- Idiomas no declarados: se desconoce la cobertura multilingüe real y el comportamiento en castellano.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o alineación.
- Alucinación: no hay datos de tasas de alucinación ni de fiabilidad factual. En un modelo de contexto tan largo, el riesgo de atribución incorrecta dentro de la ventana es relevante.
- Degradación en el extremo del contexto: la ventana de 1M tokens no garantiza recuperación uniforme de la información; el propio diseño disperso (Top-K, indexador jerárquico) implica selección, con posible pérdida de detalles.
- Requisitos de hardware muy elevados: exige clústeres multi-GPU y descargas de más de 500 GB, lo que descarta por completo el uso en hardware de consumo.
- Idiomas de la búsqueda web: los resultados de búsqueda disponibles no guardan relación con el modelo (contenido educativo en árabe sobre ahorro), por lo que no aportan verificación independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Mamun112244/DeepSeek-V4.1-Flash
- Organización DeepSeek AI en HuggingFace (citada en la model card): https://huggingface.co/deepseek-ai
- Chat de DeepSeek (citado en la model card): https://chat.deepseek.com/
- Informe técnico referenciado en la model card (ruta dentro del repositorio, no verificada): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Logotipo y assets de referencia usados en la model card: https://github.com/deepseek-ai/DeepSeek-V2
- Perfil de Twitter citado en la model card: https://twitter.com/deepseek_ai

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
