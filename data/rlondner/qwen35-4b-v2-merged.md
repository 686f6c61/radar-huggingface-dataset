# rlondner/qwen35-4b-v2-merged

## Resumen

`rlondner/qwen35-4b-v2-merged` es un checkpoint multimodal de 4.539.265.536 parámetros (≈4,54 B) publicado en Hugging Face por el usuario `rlondner` el 29 de octubre de 2026. El pipeline declarado es `image-text-to-text`, la librería es `transformers` y el tag de arquitectura es `qwen3_5`, lo que sitúa el modelo en la familia Qwen 3.5; el sufijo `-merged` sugiere que se trata de una fusión de pesos (model merging) derivada de uno o varios checkpoints de esa familia, aunque el autor no lo documenta en ningún momento.

El problema que resuelve, en la práctica, es acotado: ofrece un artefacto listo para cargar con `transformers` que combina entrada de imagen y texto en un tamaño que cabe en GPUs de consumo alto, lo que lo hace útil para experimentación con técnicas de merging y para prototipado de pipelines visión-lenguaje sin infraestructura dedicada.

La relevancia ahora mismo es limitada y debe evaluarse con cautela: la model card es la plantilla automática de Hugging Face sin una sola sección completada (`[More Information Needed]` en Developed by, License, Training Data, Evaluation y demás), el repositorio acumula 0 descargas y 0 likes, y no hay ninguna evaluación publicada. Es, por tanto, un artefacto sin validar que requiere verificación propia antes de cualquier uso serio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; el tag `qwen3_5` apunta a la familia Qwen 3.5 (transformer decoder-only con entrada multimodal image-text-to-text). Fusión de pesos indicada por el sufijo `-merged`, no documentada |
| Parámetros totales | 4.539.265.536 (≈4,54 B), según los safetensors del repositorio |
| Parámetros activos | No disponible (no hay indicios de arquitectura MoE en la información proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No documentados por el autor. El repositorio contiene únicamente pesos en `safetensors` a precisión completa (fp16/bf16: 4,54 B × 2 bytes ≈ 9,08 GB, coherente con los 9,1 GB del repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card deja el campo en `[More Information Needed]`) |
| Formato de pesos | `safetensors` (librería `transformers`) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna ni sobre el entrenamiento. La model card es la plantilla autogenerada de Hugging Face y todas las secciones relevantes —arquitectura y objetivo, datos de entrenamiento, hiperparámetros, régimen de precisión, evaluación, impacto ambiental y hardware— están marcadas como `[More Information Needed]`. No se especifica número de tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Lo único inferible a partir de los metadatos es: (a) el tag `qwen3_5`, que identifica la arquitectura de destino como Qwen 3.5; (b) el tag `image-text-to-text`, que implica un codificador visual y una proyección hacia el decodificador de lenguaje, sin que se detalle qué vision encoder se emplea; (c) el sufijo `-merged`, que en la práctica habitual de la comunidad indica una combinación de pesos (por ejemplo, media de tensores, SLERP o TIES) entre dos o más checkpoints, con posible uso de una configuración YAML de merge que no se ha publicado en el repo; y (d) el tag `endpoints_compatible`, que indica compatibilidad con los endpoints de inferencia de Hugging Face. No se ha documentado ninguna innovación técnica adicional (decodificación especulativa, atención lineal, thinking mode ni similares).

## Capacidades

- Generación de texto condicionada a imagen y a texto, según el pipeline declarado `image-text-to-text`; no hay ejemplos ni demos que lo verifiquen.
- Conversación multiturno: el tag `conversational` está presente, pero no se publica plantilla de chat ni tokens especiales.
- Procesamiento de imágenes en entrada: se infiere del pipeline, sin datos sobre resolución soportada, número de parches o tipo de vision encoder.
- Tool calling / function calling: no disponible; no se menciona en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (campo de idiomas vacío).
- Modo "thinking", audio u otras capacidades especiales: no disponible.
- Compatibilidad con endpoints de Hugging Face: declarada mediante el tag `endpoints_compatible`.

## Casos de uso

- Evaluación de técnicas de merging: el checkpoint sirve como caso de estudio para medir si la fusión de pesos conserva las capacidades del modelo base, comparando salidas del merge contra el checkpoint original sobre un conjunto fijo de prompts de texto e imagen.
- Prototipado de pipelines visión-lenguaje en local: con ~9,1 GB de pesos en fp16, se puede cargar en una única GPU de 16-24 GB para validar la integración con `transformers` (`AutoProcessor` + `AutoModelForImageTextToText`) antes de invertir en un modelo mayor.
- Descripción automática de imágenes en catálogos internos: generar pies de foto y metadatos a partir de imágenes de producto, siempre que se valide previamente la calidad y se acepte el riesgo de licencia no declarada.
- Extracción de información de documentos escaneados: al aceptar entrada de imagen, encaja en flujos de lectura de facturas o formularios combinando OCR externo con el modelo para estructurar el contenido; requiere evaluación propia porque no hay benchmarks publicados.
- Base para fine-tuning específico de dominio: al ser un modelo de 4,54 B, el ajuste completo o con LoRA cabe en una A100 de 40/80 GB, lo que permite adaptarlo a un vertical concreto partiendo de un artefacto pequeño y barato de entrenar.
- Investigación sobre degradación por merge: útil para estudiar empíricamente si una fusión introduce regresiones en tareas de texto puro frente al modelo multimodal original, midiendo perplejidad y exactitud en tareas cortas.
- Pruebas de integración con los endpoints de Hugging Face: el tag `endpoints_compatible` permite desplegarlo como endpoint gestionado para validar latencia y coste de una arquitectura multimodal pequeña antes de migrar a un modelo con licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con el marcador `[More Information Needed]` y no se han encontrado cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra prueba en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,1 GB solo de pesos, más caché KV y activaciones; en la práctica se necesitan entre 11 y 14 GB según longitud de contexto y tamaño de lote (estimación aritmética, no medida por el autor).
- VRAM estimada en cuantización int8: del orden de 4,6-5,5 GB de pesos; en int4, alrededor de 2,3-3,0 GB. Son cálculos sobre el número de parámetros, no cifras publicadas: el autor no distribuye variantes cuantizadas.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente y lotes grandes; L40S, A10G o RTX 4090 (24 GB) para inferencia en fp16 sin problemas de espacio.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y RTX 4080 (16 GB) en fp16; en tarjetas de 8-12 GB solo mediante cuantización generada por el usuario.
- Opciones de despliegue: `transformers` es la vía nativa (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura concreta y requerirían verificación, dado que el soporte de modelos multimodales Qwen 3.5 depende de la versión de cada framework.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos verificables de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `rlondner/qwen35-4b-v2-merged` | 4,54 B | No disponible | No disponible | 0 descargas, sin evaluación publicada |
| Checkpoint original de Qwen 3.5 4B (referencia esperada del merge) | No disponible | No disponible | No disponible | No identificado en la información proporcionada |
| Alternativas de la misma clase (~4 B multimodales) | No disponible | No disponible | No disponible | No disponible |

La comparación pertinente debería hacerse contra el checkpoint Qwen 3.5 4B original y sus variantes oficiales, pero ni la identidad exacta del modelo base ni sus métricas se documentan en el repositorio.

## Limitaciones y advertencias

- Model card vacía: todas las secciones sustantivas están sin completar, incluida la descripción, los datos de entrenamiento y la evaluación. No hay ninguna garantía documental sobre qué contiene el checkpoint.
- Licencia no declarada: sin licencia explícita no se puede asumir permisividad para uso comercial. La licencia del modelo base Qwen 3.5 (si aplica) condicionaría la distribución del merge, y este dato no se ha facilitado.
- Artefacto sin validar: 0 descargas y 0 likes en el momento de la consulta; no hay informes de terceros sobre su comportamiento.
- Riesgo de degradación por merging: las fusiones de pesos pueden producir regresiones no evidentes en razonamiento, multilingüismo o alineación, especialmente si los checkpoints de origen tienen distribuciones de tensores incompatibles.
- Idiomas no especificados: no se puede asumir un rendimiento correcto en castellano ni en ninguna otra lengua sin pruebas propias.
- Contexto desconocido: sin longitud de contexto declarada no se pueden dimensionar aplicaciones de documentos largos ni calcular la caché KV.
- Alucinación: sin evaluación ni información sobre alineación (RLHF/DPO), el riesgo de alucinación es indeterminado y debe tratarse como alto en producción.
- Integración incierta: aunque el pipeline es `image-text-to-text`, no se documentan processor, plantilla de chat, tokens especiales ni requisitos de versión de `transformers`; es probable encontrar errores de carga con versiones no alineadas.
- Sin soporte del autor: no hay repositorio de código, paper ni canal de contacto; el mantenimiento no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rlondner/qwen35-4b-v2-merged
- Referencia citada en la plantilla de la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML enlazada en la model card: https://mlco2.github.io/impact#compute
- Paper, blog, repositorio o demo del autor: no disponibles en la información proporcionada.
