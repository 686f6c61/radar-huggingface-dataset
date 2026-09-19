# mkd-hossain/Keural-Cortex-8B-SFT-v2-step600

## Resumen

Keural-Cortex-8B-SFT-v2-step600 es un checkpoint intermedio del segundo ciclo de ajuste supervisado (SFT) del modelo bilingüe coreano-inglés Keural-Cortex-8B, desarrollado por MKD Co., Ltd. dentro de su plataforma Keural. Parte de Qwen/Qwen3-8B, al que se aplicó un preentrenamiento continuado de 41.000 millones de tokens y una extensión de contexto hasta 65.536 tokens mediante YaRN con factor 2,0. El checkpoint se publica de forma abierta en el paso 600 de 1.124, es decir, el 53% de una época, con licencia Apache 2.0 heredada del modelo base.

Su relevancia es doble. Por un lado, corrige cinco defectos documentados del primer ciclo de SFT (`Keural-Cortex-8B-SFT-step903`): respuestas vacías ante prompts cortos, autoidentificación errónea, aceptación de premisas falsas, respuestas coreanas anormalmente breves y ausencia de alineación de seguridad. Por otro, introduce atención block-diagonal (varlen) mediante `position_ids` por documento, lo que elevó el rendimiento de entrenamiento de 15,1k a 25,1k tokens por segundo sobre 4 × NVIDIA H200.

Se trata de un artefacto de transparencia, no de un modelo terminado: el autor advierte de que persisten tres problemas conocidos y recomienda no usarlo en producción. No tiene descargas ni valoraciones en el momento de la consulta, y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3ForCausalLM` (transformer causal denso), 36 capas, hidden size 4096, GQA con 32 cabezas de consulta y 8 de clave/valor, head_dim 128 |
| Parámetros totales | 8.190 millones (bf16, 16,38 GB) según la model card; la metadata de safetensors del repositorio declara 2.047.683.840 (discrepancia no explicada, véase Limitaciones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens (32.768 nativos, extensión por YaRN factor 2,0) |
| Tipos de cuantización | No disponible (el repositorio solo distribuye pesos bf16; no hay GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3-8B) |
| Formato de pesos | safetensors, precisión bf16 |
| Vocabulario | 151.936 tokens |
| Modelo base | Qwen/Qwen3-8B → preentrenamiento continuado (41.000 millones de tokens) → extensión de contexto a 64K |
| Etapa de entrenamiento | SFT v2, paso 600 de 1.124 (53% de una época); pérdida de entrenamiento en ese paso: 0,8056 |
| Librería | transformers |
| Compatibilidad de servicio | Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B sin modificaciones estructurales: un transformer causal denso de 36 capas con atención de consultas agrupadas (32 cabezas Q frente a 8 K/V, head_dim 128), vocabulario de 151.936 entradas y 8.190 millones de parámetros en bf16. Sobre esa base, MKD realizó un preentrenamiento continuado de 41.000 millones de tokens y después una extensión de contexto hasta 65.536 tokens aplicando YaRN con factor 2,0 sobre los 32.768 tokens nativos. El ajuste supervisado se ejecutó sobre 4 × NVIDIA H200 de 141 GB con FSDP full-shard, longitud de secuencia de 32.768, AdamW con β (0,9; 0,95), weight decay 0,0 y recorte de gradiente 1,0, con un calendario de learning rate WSD (3% de warmup, 17% estable, decaimiento hasta 1,0e-5 pico → 5%) en bfloat16 con FlashAttention-2 y entropía cruzada lineal fusionada.

La innovación técnica destacable es la atención empaquetada block-diagonal. En el primer ciclo de SFT no se pasaban `position_ids`, de modo que unas 113 conversaciones empaquetadas por secuencia de 32.768 tokens atendían entre sí y las posiciones discurrían de forma continua de 0 a 32.767; solo una conversación por secuencia se entrenaba en posiciones bajas, que es donde se sitúan los prompts servidos, lo que producía respuestas vacías ante prompts de menos de ~70 tokens. La corrección introduce `position_ids` por documento, con máscara diagonal por bloque sobre unos 40 documentos por secuencia, y de paso redujo el coste computacional (15,1k → 25,1k tokens/s). El conjunto empaquetado consta de 53.956 secuencias × 32.768 = 1.768.030.208 tokens, con el 66,3% de los tokens portadores de pérdida (solo turnos del asistente). No se menciona en la información disponible el uso de RLHF o DPO; la alineación de seguridad se realizó dentro del propio SFT, con 41.853 filas procedentes de WildGuardMix, WildJailbreak y CoCoNot seleccionadas en ambas direcciones (rechazar lo dañino y aceptar lo aparentemente sensible pero benigno). También se incorporaron 6.621 ejemplos únicos de identidad repetidos 5 veces (1.370 preguntas distintas en inglés, 215 negaciones con premisa inductiva) y 54.087 filas de tareas coreanas de formato largo (mediana de 1.082 caracteres).

## Capacidades

- Generación de texto conversacional multilingüe en coreano e inglés, con plantilla de chat propia y turnos delimitados por `<|im_end|>`.
- Conversaciones multi-turno con ventana de 65.536 tokens, adecuada para documentos largos o hilos extensos.
- Formato largo estructurado: tras la corrección del sesgo de longitud, las respuestas en coreano alcanzan 300-500 o más tokens con marcado Markdown apropiado, frente a los 61 tokens de media de la primera ejecución.
- Tool calling / function calling: la model card documenta el despliegue en vLLM con `--enable-auto-tool-choice` y `--tool-call-parser hermes`.
- Autoidentificación coherente: responde "I'm Keural, an AI assistant developed by MKD Co., Ltd." en lugar de atribuirse a OpenAI.
- Rechazo de premisas falsas: la model card cita ejemplos como "la capital de Australia es Sídney", "Python se creó en 2015" o "2+2=5".
- Alineación de seguridad bidireccional orientada a evitar tanto la conformidad con peticiones dañinas como el rechazo excesivo de peticiones benignas.
- Modo "thinking": la plantilla de chat expone `enable_thinking=False`, pero la model card desaconseja explícitamente usar `--reasoning-parser qwen3` con este checkpoint, por lo que el razonamiento extendido no debe considerarse una capacidad fiable en este estado.
- Capacidades heredadas del modelo base Qwen3-8B (código, matemáticas, seguimiento de instrucciones), sin evaluación publicada específica para este checkpoint.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Atención al cliente bilingüe coreano-inglés: el modelo puede mantener conversaciones multi-turno con 65.536 tokens de contexto, lo que permite arrastrar el historial completo de un cliente y documentación de producto sin truncar. La alineación de seguridad añadida reduce el riesgo de respuestas dañinas en un canal público.
- Agentes con tool calling en producción interna: la integración documentada con vLLM y el parser Hermes permite conectarlo a funciones externas (consulta de pedidos, bases de datos, APIs internas). Debe usarse en entorno controlado por tratarse de un checkpoint intermedio.
- Resumen y análisis de documentación coreana extensa: la corrección del sesgo de longitud en coreano hace viable generar resúmenes estructurados de informes largos, algo que la versión anterior resolvía con respuestas telegráficas de unos 61 tokens.
- Traducción y adaptación de contenido entre coreano e inglés: con ambos idiomas en el entrenamiento y ventanas largas, resulta adecuado para traducir documentación técnica manteniendo el formato Markdown.
- Generación de contenido de formato largo en coreano: artículos, fichas de producto o guías con estructura Markdown, apoyándose en las 54.087 filas de tareas coreanas de formato largo incorporadas en este ciclo.
- Evaluación de pipelines de seguridad y moderación: el uso de WildGuardMix, WildJailbreak y CoCoNot en ambas direcciones lo convierte en un banco de pruebas razonable para estudiar sobre-rechazo en sistemas bilingües.
- Investigación sobre atención empaquetada: la corrección de `position_ids` y la atención block-diagonal ofrecen un caso reproducible para estudiar cómo el empaquetado de secuencias afecta al comportamiento en prompts cortos.
- Base para ajuste específico de dominio en coreano: al ser Apache 2.0 y derivar de Qwen3-8B, sirve como punto de partida para fine-tuning posterior, siempre que se asuma el estado incompleto del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni comparaciones estandarizadas; el único dato numérico de rendimiento es la pérdida de entrenamiento de 0,8056 en el paso 600 y el rendimiento de entrenamiento de 25,1k tokens/s sobre 4 × H200.

## Requisitos de hardware

- Pesos en bf16: 16,38 GB, por lo que la inferencia necesita al menos ~18 GB de VRAM con contexto corto.
- Caché KV: con 36 capas, 8 cabezas K/V y head_dim 128 en bf16, cada token ocupa aproximadamente 144 KB. A 32.768 tokens de contexto son unos 4,7 GB; a 65.536 tokens, unos 9,4 GB.
- VRAM estimada a contexto completo (65.536 tokens, bf16): en torno a 26-28 GB, sin contar el overhead del runtime ni los buffers de activaciones.
- GPU recomendadas: H100 80 GB, H200 141 GB (las usadas en entrenamiento), A100 80 GB o L40S 48 GB para contexto largo. Con A100 40 GB o RTX 4090 de 24 GB se puede servir en bf16 con contexto reducido (hasta ~16.384 tokens en la 4090).
- Cabe en GPU de consumo: sí, en RTX 4090 / RTX 3090 (24 GB) con contexto moderado en bf16, o con más margen si se cuantiza a FP8 (~8,2 GB) o INT4 (~4,5-5 GB), aunque no hay cuantizaciones publicadas por el autor.
- Despliegue: vLLM es la ruta documentada por el autor (`--max-model-len 65536 --tensor-parallel-size 2 --enable-auto-tool-choice --tool-call-parser hermes`); también es compatible con Transformers, con Text Generation Inference y con endpoints compatibles.
- No hay pesos GGUF, por lo que llama.cpp y Ollama no son utilizables sin convertir el modelo previamente.
- Latencia y throughput de inferencia: no publicados. El único dato de rendimiento es de entrenamiento.
- Parámetros de muestreo recomendados por el autor: temperature 0,7, top_p 0,8, top_k 20, repetition_penalty 1,05.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado y disponibilidad |
|---|---|---|---|---|---|
| Keural-Cortex-8B-SFT-v2-step600 | 8,19 B (bf16) | 65.536 (YaRN 2,0) | ko, en | Apache 2.0 | Checkpoint intermedio, paso 600/1.124; 0 descargas, 0 likes; sin benchmarks |
| Keural-Cortex-8B-SFT-step903 | 8,19 B (mismo base) | No disponible en la información proporcionada | ko, en | Apache 2.0 | Primera ejecución de SFT, época completa; presenta los cinco defectos que la v2 corrige |
| Qwen/Qwen3-8B | 8,19 B | 32.768 nativos, extensible mediante YaRN según la documentación pública de Qwen3 | Multilingüe amplio | Apache 2.0 | Modelo base, publicado y ampliamente validado; sin especialización coreana ni alineación de identidad propia |
| Alternativas coreanas de tamaño similar (por ejemplo, modelos de 7-8 B centrados en coreano) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

La comparación cuantitativa de rendimiento no es posible: ninguno de los modelos de la tabla tiene resultados de benchmarks publicados dentro de la información disponible para este checkpoint.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo terminado: paso 600 de 1.124, el 53% de una época. El autor indica explícitamente que no debe tratarse como producto final.
- La model card afirma que persisten tres problemas conocidos, pero el contenido de esa sección no está incluido en la información proporcionada; se desconoce su alcance exacto. Lo único verificable es que el parser de razonamiento `qwen3` de vLLM no debe activarse con este checkpoint.
- Discrepancia de parámetros: la metadata del repositorio declara 2.047.683.840 parámetros en safetensors, mientras que la model card declara 8,19 B y un tamaño de 16,38 GB. Conviene verificar la integridad y la completitud de los shards antes de cualquier uso.
- Ausencia de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad independientes, por lo que el rendimiento real es desconocido.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta. No existe retroalimentación externa sobre su comportamiento.
- Riesgo de alucinación inherente a un modelo de 8 B en SFT intermedio; la corrección de premisas falsas se documenta con ejemplos concretos, no con una métrica agregada.
- Sesgos de idioma: el entrenamiento se centra en coreano e inglés. El rendimiento en castellano u otros idiomas no está evaluado y probablemente sea degradado. Además, parte del ajuste corrige un sesgo previo que asociaba inglés con prosa estructurada y coreano con prosa breve; ese desequilibrio podría no haberse eliminado por completo.
- Sesgos de contenido: el corpus incluye datos de alineación de seguridad, pero no hay auditoría publicada de sesgos demográficos, políticos o culturales.
- Riesgo de sobre-rechazo residual: aunque el autor indica que la selección de datos de seguridad fue bidireccional precisamente para mitigarlo, no se aporta medición de falsos positivos.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, siempre que se mantengan los avisos correspondientes. Al derivar de Qwen3-8B, se heredan sus condiciones, también Apache 2.0. No obstante, para uso comercial se recomienda esperar a la versión final del entrenamiento.
- Modo thinking no fiable: la plantilla admite `enable_thinking=False`, pero la incompatibilidad declarada con `--reasoning-parser qwen3` sugiere que el razonamiento extendido no está correctamente integrado en este estado.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, lo que limita el despliegue en hardware de gama baja sin trabajo adicional de conversión y validación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mkd-hossain/Keural-Cortex-8B-SFT-v2-step600
- Checkpoint de la primera ejecución de SFT, citado en la model card: https://huggingface.co/mkd-hossain/Keural-Cortex-8B-SFT-step903
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Resultados de búsqueda web: no se ha encontrado ningún resultado relevante sobre este modelo. Las únicas coincidencias devueltas corresponden a foros de videojuegos (Hero Wars, Battlefield V) y no guardan relación con el modelo. No se dispone de paper, blog técnico, repositorio ni demo adicionales.
