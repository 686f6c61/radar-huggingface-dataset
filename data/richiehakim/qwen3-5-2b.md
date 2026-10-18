# richiehakim/Qwen3.5-2B

## Resumen

`richiehakim/Qwen3.5-2B` es una copia sin modificar de `Qwen/Qwen3.5-2B` (revisión `15852e8c16360a2fea060d615a32b45270f8a8fc`), publicada por el usuario richiehakim para congelar una revisión concreta y que una demo de investigación siga funcionando aunque el repositorio original cambie. No es un fine-tuning ni una versión alterada: todos los ficheros son idénticos byte a byte a esa revisión salvo el README, donde solo se añaden una nota y dos líneas de metadatos (`base_model` y `license_link`). Por tanto, sus capacidades y limitaciones son exactamente las del modelo original de Qwen.

Qwen3.5-2B es un modelo causal de 2,27 mil millones de parámetros con codificador de visión, desarrollado por el equipo Qwen (Alibaba). Forma parte de la familia Qwen3.5, que introduce fusión temprana de tokens multimodales, una arquitectura híbrida de Gated DeltaNet (atención lineal) y atención con compuertas, y entrenamiento con RL a gran escala. El modelo nativo soporta 262.144 tokens de contexto y, según su model card, cubre 201 idiomas y dialectos.

Su relevancia práctica es doble: por un lado ofrece capacidades multimodales (image-text-to-text) y contexto muy largo en un tamaño que cabe en GPU de consumo; por otro, este repositorio concreto sirve como referencia reproducible de una revisión fija, algo útil en investigación y en pipelines que necesitan inmutabilidad de artefactos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión: layout 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 2.274.069.824 (2,27 B) |
| Parametros activos | No disponible (la model card menciona MoE disperso como rasgo de la familia, pero no detalla la configuración de expertos para la variante de 2B) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene safetensors y no se publican recetas GGUF, AWQ ni GPTQ |
| Idiomas soportados | 201 idiomas y dialectos (según model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |
| Dimensión oculta | 2048 |
| Número de capas | 24 |
| Tamaño de vocabulario / embedding | 248.320 (con padding; LM head atado al embedding) |
| Gated DeltaNet | 16 cabezas de atención lineal para V y 16 para QK, dimensión de cabeza 128 |
| Gated Attention | 8 cabezas para Q y 2 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones |
| FFN | Dimensión intermedia 6144 |
| MTP | Entrenado con multi-token prediction (multi-steps) |
| Tamaño del repositorio | 4,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo combina dos mecanismos de atención en un patrón repetido seis veces: por cada bloque, tres capas de Gated DeltaNet (atención lineal con estado recurrente, 16 cabezas para V y 16 para QK con dimensión 128) seguidas de una capa de Gated Attention clásica (8 cabezas de consulta y solo 2 de clave-valor, dimensión 256, RoPE de 64 dimensiones). Cada capa va seguida de una FFN de dimensión intermedia 6144. Este diseño reduce el coste del caché KV en contextos largos —solo 6 de las 24 capas mantienen caché de atención completo— manteniendo la capacidad de recuperación exacta de la atención tradicional.

Según la model card, el entrenamiento incluye pre-entrenamiento y post-entrenamiento con fusión temprana de tokens multimodales, de modo que el modelo alcanza paridad con Qwen3 en texto y supera a los Qwen3-VL en razonamiento, código, agentes y comprensión visual. La familia se entrenó con RL escalado sobre entornos multiagente y con una infraestructura asíncrona que, según el autor, logra cerca del 100 % de eficiencia de entrenamiento multimodal frente a texto solo. También se entrenó con multi-token prediction (MTP), lo que habilita decodificación especulativa. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo DPO/RLHF explícito más allá de la mención genérica a RL.

## Capacidades

- Generación de texto y razonamiento en modo instructivo (no-thinking) y, según la estructura de la tabla de benchmarks, también en modo thinking.
- Comprensión de imágenes: pipeline `image-text-to-text`, con codificador de visión integrado y fusión temprana de tokens.
- Código y matemáticas: evaluado en los ejes de coding y reasoning de la familia Qwen3.5.
- Capacidades de agente: la model card incluye "agents" entre los ejes evaluados; no se especifica en la información disponible el protocolo exacto de tool calling.
- Multilingüismo amplio: 201 idiomas y dialectos declarados.
- Contexto largo nativo de 262.144 tokens, apto para documentos completos, bases de código o conversaciones prolongadas.
- Decodificación especulativa mediante MTP (multi-token prediction) entrenado con multi-steps.
- Compatibilidad declarada con Transformers, vLLM, SGLang y KTransformers.

## Casos de uso

- **Prototipado local de asistentes multimodales**: con 2,27 B de parámetros, el modelo cabe en una GPU de consumo y permite iterar sobre flujos image-text-to-text sin depender de APIs externas ni incurrir en costes por token.
- **Extracción de datos de documentos largos**: los 262.144 tokens de contexto permiten pasar informes anuales, contratos o expedientes completos junto con imágenes de las páginas escaneadas y pedir extracción estructurada en una sola pasada.
- **QA sobre capturas de pantalla e interfaces**: útil para soporte técnico interno, donde el modelo recibe una captura de la aplicación del usuario y devuelve instrucciones de resolución paso a paso.
- **Base para fine-tuning de dominio**: al ser una base de 2B con licencia Apache-2.0, es un punto de partida económico para adaptar vocabulario y estilo a sectores concretos (legal, sanitario, industrial) con presupuestos de cómputo reducidos.
- **Procesamiento por lotes en local con datos sensibles**: despliegue on-premise en vLLM o SGLang para clasificar y resumir documentación interna sin que los datos salgan de la infraestructura de la organización.
- **Congelación de artefactos para reproducibilidad**: este repositorio en particular sirve para fijar una revisión byte-idéntica y garantizar que una demo o un experimento académico no se rompa si el repositorio original se actualiza.
- **Agentes ligeros de un solo paso**: con contexto largo y capacidades multimodales, se puede usar como nodo de percepción y decisión en pipelines de automatización que necesitan leer una imagen, consultar contexto textual extenso y emitir una acción.

## Benchmarks y rendimiento

Resultados publicados en la model card, en modo instructivo (non-thinking). La tabla original está truncada en la información disponible a partir de C-Eval, por lo que solo se reproducen las filas completas.

| Benchmark | Qwen3.5-2B | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 55,3 | 69,6 | 40,2 | 29,7 |
| MMLU-Redux | 69,2 | 84,2 | 64,4 | 48,5 |
| C-Eval | No disponible (dato truncado en la información recibida) | No disponible | No disponible | No disponible |

Lectura de los datos: el modelo supera con claridad a Qwen3-1.7B en MMLU-Pro (+15,1 puntos) y en MMLU-Redux (+4,8), y queda por debajo de Qwen3-4B-2507 en ambas pruebas (-14,3 y -15,0 respectivamente). No se han publicado en la información disponible resultados de HumanEval, GSM8K ni benchmarks de visión desagregados.

## Requisitos de hardware

- **VRAM para inferencia (estimación a partir de 2,27 B de parámetros)**: en bf16/fp16 los pesos ocupan aproximadamente 4,5-4,6 GB (el repositorio pesa 4,6 GB); en INT8 bajaría a unos 2,3 GB y en INT4 a unos 1,2-1,4 GB, aunque estas cuantizaciones requerirían generarlas, ya que no se publican checkpoints cuantizados.
- **Caché KV (estimación)**: solo 6 de las 24 capas usan atención completa con 2 cabezas KV de dimensión 256, lo que da unos 6 KB por token en bf16; a 32k tokens suponen ~200 MB y a 262k tokens ~1,6 GB. Las capas Gated DeltaNet mantienen un estado recurrente de tamaño constante.
- **GPU de consumo**: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 para contextos cortos o medios; en tarjetas de 8 GB conviene reducir contexto o cuantizar, especialmente al procesar imágenes. La model card orienta el modelo a prototipado, fine-tuning específico e investigación, no a despliegues de máxima exigencia.
- **GPU de datacenter**: A100 40/80 GB, H100 y L40S permiten servir muchas peticiones concurrentes con contexto largo y aprovechar mejor las optimizaciones de atención lineal.
- **Opciones de despliegue**: Hugging Face Transformers, vLLM, SGLang y KTransformers, según la propia model card. No se confirma soporte de llama.cpp u Ollama en la información disponible.
- **Latencia y throughput**: no disponibles. El uso de MTP para decodificación especulativa y de atención lineal en 18 de las 24 capas debería favorecer el throughput en contextos largos, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | MMLU-Redux | Licencia | Multimodal |
|---|---|---|---|---|---|---|
| Qwen3.5-2B (este repo) | 2,27 B | 262.144 | 55,3 | 69,2 | Apache-2.0 | Sí (image-text-to-text) |
| Qwen3-4B-2507 | 4 B | No disponible | 69,6 | 84,2 | No disponible | No disponible |
| Qwen3-1.7B | 1,7 B | No disponible | 40,2 | 64,4 | No disponible | No disponible |
| Qwen3.5-0.8B | 0,8 B | No disponible | 29,7 | 48,5 | No disponible | No disponible |

El posicionamiento es claro: Qwen3.5-2B se sitúa entre Qwen3-1.7B y Qwen3-4B-2507 en rendimiento de texto, pero añade multimodalidad y un contexto nativo de 262.144 tokens, dos ejes en los que la información disponible no ofrece comparación con los modelos Qwen3 citados. Frente a Qwen3.5-0.8B, el salto en MMLU-Pro es de +25,6 puntos y en MMLU-Redux de +20,7, a costa de casi triplicar el tamaño.

## Limitaciones y advertencias

- **Repositorio no oficial**: se trata de una copia publicada por un tercero (richiehakim), con 0 descargas y 0 likes. Para producción conviene referenciar `Qwen/Qwen3.5-2B` directamente o fijar la revisión explícitamente.
- **Sin evaluación propia**: los benchmarks proceden de la model card de Qwen; no hay verificación independiente sobre esta copia, aunque los ficheros sean byte-idénticos a la revisión indicada.
- **Datos incompletos en la model card recibida**: la tabla de benchmarks está truncada a partir de C-Eval, y no hay cifras de HumanEval, GSM8K ni de evaluación de sesgos o seguridad.
- **Riesgo de alucinación**: como cualquier LLM, puede generar contenido plausible pero falso, especialmente en tareas de extracción de documentos o respuesta sobre imágenes.
- **Contexto largo no equivalente a recall perfecto**: los 262.144 tokens son la ventana nativa, pero no se han publicado evaluaciones tipo needle-in-a-haystack que confirmen el rendimiento efectivo en todo el rango.
- **Idiomas**: se declaran 201 idiomas y dialectos, pero no se publica la distribución de calidad por idioma; el rendimiento en lenguas minoritarias puede ser sensiblemente inferior al de inglés o chino.
- **Escala limitada**: con 2,27 B de parámetros, el modelo queda por debajo de alternativas de 4 B en razonamiento de texto; la model card lo orienta explícitamente a prototipado, fine-tuning e investigación.
- **Licencia**: Apache-2.0 permite uso comercial y modificaciones, pero conviene revisar el fichero LICENSE incluido y las obligaciones de atribución al redistribuir.
- **Cuantizaciones no publicadas**: no hay GGUF, AWQ ni GPTQ oficiales en este repositorio, lo que implica trabajo adicional si se quiere desplegar en hardware muy limitado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/richiehakim/Qwen3.5-2B
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-2B
- Revisión exacta copiada: https://huggingface.co/Qwen/Qwen3.5-2B/tree/15852e8c16360a2fea060d615a32b45270f8a8fc
- Blog de la familia Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia Apache-2.0 (referencia): https://www.apache.org/licenses/LICENSE-2.0
