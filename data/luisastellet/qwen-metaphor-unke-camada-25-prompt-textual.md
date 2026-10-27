# luisastellet/qwen-metaphor-unke-camada-25-prompt-textual

## Resumen

Este modelo es un checkpoint de generación de texto publicado en Hugging Face por el usuario `luisastellet` bajo el identificador `qwen-metaphor-unke-camada-25-prompt-textual`. Se trata de un modelo pequeño, de 596.049.920 parámetros (aproximadamente 0,6 mil millones), con pesos en formato safetensors y un repositorio de 2,4 GB. El tag `qwen3` del repositorio y el nombre del modelo apuntan a un ajuste fino derivado de la familia Qwen3, presumiblemente sobre el modelo base de 0,6 B, aunque esta filiación no está confirmada en ninguna parte de la model card.

La relevancia de la ficha es, hoy, más cautelar que técnica: la model card es la plantilla autogenerada por Hugging Face y todos los campos sustantivos (autoría, tipo de modelo, idiomas, licencia, datos de entrenamiento, evaluación) figuran como "[More Information Needed]". No hay paper, repositorio de código, demo ni resultados publicados, y el modelo acumula 0 descargas y 0 likes en el momento de la consulta. El nombre sugiere un experimento de ajuste con instrucciones de tipo metafórico y una posible intervención sobre la capa 25 de la red ("camada 25"), hipótesis que no puede verificarse con la información disponible.

Por tanto, esta ficha documenta lo que se puede afirmar con evidencia (tamaño, formato, pipeline, tags) y marca explícitamente como "no disponible" todo lo demás. Cualquier evaluación de idoneidad para producción debe posponerse hasta que el autor publique licencia, procedencia de datos y métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3 según el tag `qwen3` del repositorio); detalles de capas, cabezas y atención no disponibles |
| Parametros totales | 596.049.920 (~0,6 B) |
| Parametros activos | no disponible (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors, sin GGUF, AWQ, GPTQ ni MLX |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | safetensors |
| Precisión de los pesos | no declarada; 2,4 GB para 596 M de parámetros es coherente con FP32 (596.049.920 × 4 bytes ≈ 2,38 GB) |
| Pipeline | text-generation |
| Librería | transformers |
| Tamaño del repositorio | 2,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-26 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura más allá de los tags del repositorio. El tag `qwen3` y el recuento de parámetros son compatibles con una arquitectura transformer decoder-only de la familia Qwen3 en su variante de 0,6 B, que emplea atención con query-key normalization, RoPE y capas densas (no MoE). Sin embargo, el autor no documenta ni confirma el modelo base, el número de capas, la dimensionalidad del hidden state, el vocabulario ni la ventana de contexto nativa. Tampoco se especifica si el checkpoint incorpora alguna modificación estructural o si "camada 25" alude a una intervención sobre la capa 25 (por ejemplo, edición de activaciones, fusión de adaptadores o pruning selectivo) o es simplemente una etiqueta de versión del experimento.

Respecto al entrenamiento, la model card no aporta ningún dato: se desconoce el volumen de tokens, la composición del corpus, si hubo ajuste supervisado, DPO/RLHF, loRA o ajuste completo, y qué hiperparámetros se emplearon. El nombre "metaphor...prompt-textual" sugiere un dataset de instrucciones centrado en lenguaje figurado o prompts textuales, pero es una inferencia a partir del identificador, no un dato documentado. No consta evaluación de ninguna clase.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad confirmada por el pipeline declarado (`text-generation`).
- Uso conversacional: el tag `conversational` indica que el checkpoint está pensado para diálogo de formato instrucción, aunque no se documenta la plantilla de chat ni los tokens especiales.
- Razonamiento, matemáticas y código: no documentado. No debe asumirse ninguna competencia en estas áreas sin evaluación propia.
- Tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentado.
- Multilingüismo: no documentado; se desconoce si conserva el perfil multilingüe del modelo base o si el ajuste lo ha restringido.
- Modo "thinking", visión o audio: no documentado; el repositorio no incluye procesadores de imagen ni audio.
- Compatibilidad de despliegue: los tags `text-generation-inference` y `endpoints_compatible` indican que el checkpoint puede servirse con TGI y con Hugging Face Inference Endpoints.

## Casos de uso

- Prototipado rápido de interfaces conversacionales: con ~0,6 B de parámetros y pesos de 2,4 GB, el modelo se carga en una GPU de consumo en segundos, lo que permite validar flujos de chat antes de invertir en un modelo mayor. Adecuado solo como prueba de concepto, dado que no hay evaluación de calidad.
- Despliegue en entornos con recursos limitados: CPU, GPUs de 4-8 GB o dispositivos edge donde un modelo de 7 B no cabe; la huella de pesos en INT8 rondaría los 0,6 GB.
- Generación de datos sintéticos a pequeña escala para tareas de clasificación o etiquetado, siempre con revisión humana y asumiendo una tasa de error desconocida.
- Investigación sobre edición de modelos por capas: si "camada 25" corresponde realmente a una intervención en la capa 25, el checkpoint es un artefacto útil para estudiar cómo afecta esa modificación a la coherencia del texto; requiere acceso al script original, que no está publicado.
- Experimentos de interpretabilidad y análisis de representaciones internas en modelos pequeños, donde el coste de extraer activaciones es bajo.
- Filtrado o reformulación de texto en pipelines por lotes (por ejemplo, normalizar titulares o descripciones), con validación posterior y métricas propias, al no existir benchmarks del autor.
- Base para un ajuste fino propio (LoRA/QLoRA) si se aclara la licencia; a día de hoy esta vía está bloqueada legalmente por la ausencia de licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos (cálculo a partir de 596.049.920 parámetros, sin contar caché KV ni activaciones): ~2,38 GB en FP32, ~1,19 GB en BF16/FP16, ~0,60 GB en INT8, ~0,30 GB en INT4.
- VRAM real de inferencia: no disponible; depende de la longitud de contexto (desconocida) y de la configuración de la caché KV. Como referencia práctica, añadir entre un 20 % y un 50 % de sobrecoste sobre el peso de los pesos para contextos cortos.
- GPU recomendadas: no hay recomendación del autor. Por tamaño, cualquier GPU con 4 GB o más es suficiente en FP16; una RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, L4, A10G o A100 lo alojan con holgura.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1650 4 GB, RTX 3050 8 GB, RTX 4060, RTX 3060 y superiores, así como en Apple Silicon mediante MPS.
- CPU: viable en FP32 con 4-8 GB de RAM libre; el throughput no está documentado.
- Opciones de despliegue: `transformers` (nativo), TGI y Hugging Face Inference Endpoints (según tags), vLLM (compatible con arquitecturas Qwen3 en versiones recientes, no verificado para este checkpoint concreto). Para llama.cpp u Ollama sería necesaria una conversión a GGUF que el autor no ha publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (`qwen-metaphor-unke-camada-25-prompt-textual`) | 0,596 B | no disponible | no disponible | Hugging Face, repo público | Sin benchmarks, sin model card sustantiva, 0 descargas |
| Qwen3-0.6B (base probable, no confirmada) | ~0,6 B | 32 768 tokens según documentación de la familia | Apache 2.0 | Hugging Face | Modelo oficial con evaluación publicada; no se ha confirmado que sea el punto de partida de este ajuste |
| Qwen2.5-0.5B-Instruct | ~0,49 B | 32 768 tokens | Apache 2.0 | Hugging Face | Alternativa equivalente en tamaño con documentación completa |
| Llama 3.2 1B Instruct | ~1,24 B | 128 000 tokens | Llama 3.2 Community License | Hugging Face (acceso con aceptación de términos) | Mayor tamaño y contexto, con restricciones de licencia |

Nota: los datos de los tres modelos de referencia proceden del conocimiento general de esas familias y no han podido verificarse en la información proporcionada en esta búsqueda; deben contrastarse en sus respectivas model cards antes de citarlos.

## Limitaciones y advertencias

- Licencia ausente: sin licencia declarada no puede asumirse permiso de uso comercial, modificación ni redistribución. En la práctica, el checkpoint está en un limbo legal.
- Procedencia de datos desconocida: no se puede evaluar el sesgo, la contaminación por benchmarks ni el cumplimiento de derechos de autor del corpus de ajuste.
- Sin evaluación: no existe ningún benchmark, evaluación humana ni test de seguridad publicado; la calidad es indeterminada.
- Riesgo de alucinación: por tamaño (0,6 B) y por falta de datos de alineamiento, es esperable una tasa alta de afirmaciones incorrectas, especialmente en dominios factuales. No apto para decisiones automatizadas sin supervisión.
- Idiomas no declarados: se desconoce si el ajuste ha degradado el multilingüismo del modelo base o si está limitado al idioma de las instrucciones de entrenamiento.
- Contexto desconocido: no puede planificarse un caso de uso con documentos largos sin medir previamente la ventana efectiva.
- Posible divergencia respecto al base: si el nombre refleja una intervención sobre la capa 25, es plausible una pérdida de coherencia o de adherencia a instrucciones; requiere pruebas específicas.
- Repositorio sin validar: 0 descargas y 0 likes implican ausencia total de revisión por la comunidad. Aunque safetensors evita ejecución de código arbitrario en la carga, el tokenizer o los scripts remotos deben auditarse antes de usarlos con `trust_remote_code`.
- Model card autogenerada: no hay contacto del autor ni instrucciones de uso, lo que dificulta el soporte y la trazabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-25-prompt-textual
- arXiv 1910.09700 (Lacoste et al., calculadora de impacto ambiental): https://arxiv.org/abs/1910.09700 — citado en la model card como referencia del cálculo de emisiones, no como paper del modelo
- Machine Learning Impact Calculator: https://mlco2.github.io/impact — referenciada en la model card
- Paper, repositorio de código, demo y dataset de entrenamiento: no disponibles
