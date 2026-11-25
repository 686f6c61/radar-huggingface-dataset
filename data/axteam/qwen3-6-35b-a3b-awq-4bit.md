# axteam/Qwen3.6-35B-A3B-AWQ-4bit

## Resumen

Qwen3.6-35B-A3B-AWQ-4bit es una cuantización de 4 bits (AWQ INT4, esquema W4A16) del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario axteam. No es un modelo nuevo entrenado desde cero, sino una conversión de pesos pensada para servir el modelo original de forma eficiente en vLLM, reduciendo el espacio en disco de aproximadamente 72 GB en BF16 a unos 24,1 GB y permitiendo su despliegue en GPUs con menos memoria. El modelo base pertenece a la familia Qwen3.5/3.6 de Alibaba y combina una arquitectura híbrida de atención lineal y atención completa con un mezclador de expertos (MoE) de 256 expertos más un experto compartido, con unos 3 mil millones de parámetros activos sobre un total de 35.951.822.704 parámetros.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de casi 36 mil millones de parámetros con una huella de memoria cercana a la de un modelo denso de 7-8 mil millones en BF16, manteniendo licencia Apache-2.0 y compatibilidad con el ecosistema transformers/vLLM. La model card documenta una revisión de los archivos el 1 de noviembre de 2026 que corrige la compensación del router MoE y de la puerta del experto compartido durante el suavizado AWQ, un detalle crítico porque un router no compensado enruta los tokens a expertos distintos de los del modelo original.

La cuantización conserva en BF16 el torreón visual, el cabezal de predicción multi-token (MTP), las RMSNorm, los embeddings, el LM head, el router MoE y las partes no lineales del módulo SSM, lo que supone aproximadamente el 6% de los parámetros. Los benchmarks publicados por el autor muestran una recuperación media del 99,0% respecto al original BF16 si se excluyen MMLU y GSM8K, tareas cuyo formato de respuesta introduce una varianza muy alta entre builds.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención lineal + atención completa), MoE con 256 expertos + experto compartido, multimodal (visión), cabezal MTP |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B (según la model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 W4A16, asimétrica, group size 32 (escala BF16 + zero-point INT4), formato compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible (el conjunto de calibración es mayoritariamente coreano mixto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), repositorio de ~46,6 GB, pesos cuantizados ~24,1 GB en disco |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura híbrida que alterna capas de atención lineal (con componentes tipo SSM: `linear_attn.conv1d`, `A_log`, `dt_bias`) y capas de atención completa, combinada con un mezclador de expertos de 256 expertos más un experto compartido y un total de ~36B parámetros con ~3B activos por token. Incluye además un torreón visual para entrada de imágenes y un cabezal de predicción multi-token (MTP), habitualmente usado para decodificación especulativa. Esta ficha corresponde a una cuantización post-entrenamiento (PTQ) realizada por axteam: no hay reentrenamiento ni ajuste fino, solo un proceso AWQ con 256 muestras de calibración (corpus mixto con predominio de coreano) que protege los canales de pesos más salientes antes del redondeo.

La revisión del 1 de noviembre de 2026 reconstruyó los archivos para compensar el router MoE (`mlp.gate`) y la puerta del experto compartido durante el suavizado AWQ; según el autor, la diferencia mediana por canal respecto al original queda por debajo del 2%. Se mantienen en BF16 el torreón visual y el proyector (`model.visual.*`), el cabezal MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, el LM head, el router MoE, la puerta del experto compartido y las partes no lineales del SSM, lo que representa en torno al 6% de los parámetros. El tokenizador, la `chat_template` y la `generation_config` son idénticos a los del modelo original; el `config.json` añade únicamente un bloque `quantization_config`.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat idéntica al modelo original.
- Procesamiento multimodal de imagen y texto (`image-text-to-text`): el torreón visual se conserva en BF16, por lo que la calidad de percepción visual no se ve degradada por la cuantización.
- Razonamiento y matemáticas: los benchmarks publicados incluyen GSM8K y ARC-Challenge, aunque con una varianza muy alta entre builds según el propio autor.
- Conocimiento multilingüe y cultural: los benchmarks KMMLU (coreano) y HAE-RAE (coreano) sugieren competencia en coreano además del inglés; el resto de idiomas no está documentado.
- Predicción multi-token (cabezal MTP) conservada en BF16, lo que habilita decodificación especulativa en runtimes que la soporten.
- Compatibilidad con el ecosistema transformers y vLLM (arquitectura soportada desde vLLM ≥ 0.17.0; probado con vLLM 0.32.0).
- Tool calling / function calling y comportamiento agéntico: no documentado explícitamente en la información disponible.

## Casos de uso

- Servicio de chat multimodal en producción: al ocupar unos 24,1 GB en disco y requerir menos VRAM que el BF16 original, permite desplegar un modelo de ~36B con visión en una sola GPU de 48 GB o en dos de 24 GB, gestionando conversaciones con imágenes y texto en la misma sesión.
- Asistencia sobre documentos escaneados: el torreón visual intacto en BF16 permite extraer y razonar sobre texto en imágenes (facturas, formularios, capturas) sin la pérdida de calidad que sufriría una cuantización del encoder visual.
- Despliegue en vLLM con throughput alto: el esquema W4A16 reduce el ancho de banda de memoria de los pesos, lo que aumenta el número de tokens por segundo y el número de peticiones concurrentes por GPU en comparación con el modelo BF16, manteniendo activaciones en BF16 para estabilidad numérica.
- Evaluación e investigación en entornos con presupuesto de GPU limitado: permite reproducir experimentos sobre un MoE de ~36B en hardware de una sola máquina, algo inviable con el original en BF16 en configuraciones de 24-48 GB.
- Aplicaciones en coreano e inglés: los resultados en KMMLU (64,61) y HAE-RAE (73,69) indican un rendimiento prácticamente idéntico al original, adecuado para asistentes o clasificación en esos idiomas.
- Decodificación especulativa: el cabezal MTP conservado en BF16 puede aprovecharse en runtimes que implementen decodificación especulativa con cabezales MTP para reducir la latencia por token.
- Prototipado de agentes multimodales: la compatibilidad con `chat_template` y transformers permite integrarlo en frameworks de agentes que necesiten entrada de imagen y texto, aunque el soporte explícito de tool calling no está documentado.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, greedy, prompts de estilo completion sin plantilla de chat (0 o 5 shots según la fila). MMLU es la variante generativa (`mmlu_generative`), no comparable con puntuaciones por log-likelihood. Los porcentajes entre paréntesis indican recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | AWQ-4bit (este repo) | Recuperación |
|---|---|---|---|
| MMLU (5-shot, generativa) | 64,44 | 74,12 | 115,0% |
| GSM8K (5-shot, strict) | 30,40 | 71,11 | 233,9% |
| ARC-Challenge (0-shot) | 55,38 | 54,78 | 98,9% |
| Winogrande (5-shot) | 76,32 | 75,85 | 99,4% |
| KMMLU (5-shot, direct) | 65,14 | 64,61 | 99,2% |
| HAE-RAE (0-shot) | 74,89 | 73,69 | 98,4% |
| Media | 61,09 | 69,03 | 113,0% |
| Media sin MMLU ni GSM8K | 67,93 | 67,23 | 99,0% |

El propio autor advierte que MMLU y GSM8K dependen del formato exacto de la respuesta generada y oscilan mucho entre builds del mismo modelo (MMLU 64,0-74,1; GSM8K 21,5-71,1), por lo que las puntuaciones superiores al BF16 probablemente reflejan formato y no calidad de cuantización; no se verificó pregunta a pregunta.

Fidelidad respecto al original BF16 en un conjunto interno mixto inglés/coreano de 100 prompts:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,3566 | 1,2934 (+4,9%) |
| Acuerdo top-1 en siguiente token | 92,4% | 98,0% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 24-26 GB para los pesos cuantizados, más caché KV y activaciones; el contexto máximo no está documentado, por lo que el pico de VRAM depende de la longitud de secuencia configurada.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB, L40S 48 GB o RTX 6000 Ada 48 GB para servicio con contexto amplio; dos GPUs de 24 GB (RTX 4090, L4) con tensor parallelism para configuraciones ajustadas.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con contexto moderado y batch pequeño; en RTX 3090 (24 GB) de forma similar, con margen escaso para secuencias largas.
- Opciones de despliegue: vLLM (runtime recomendado y probado, versión 0.32.0; arquitectura soportada desde vLLM ≥ 0.17.0) y transformers (librería declarada). Otros runtimes como llama.cpp, Ollama o TGI no están documentados para este formato compressed-tensors.
- Requisitos de software: Python 3.11-3.14, torch 2.13 con compilación CUDA 13.0 (controlador NVIDIA con soporte CUDA 13) y transformers ≥ 5.16.1, < 5.20 según la model card.
- Latencia y throughput: no disponibles; la model card no publica métricas de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-AWQ-4bit (este) | 35,95B totales, ~3B activos | no disponible | AWQ INT4 W4A16, compressed-tensors | Apache-2.0 | Multimodal, híbrido atención lineal/completa, MTP, ~24,1 GB en disco |
| Qwen/Qwen3.6-35B-A3B (BF16 original) | 35,95B totales, ~3B activos | no disponible | BF16 safetensors | Apache-2.0 | Referencia de calidad; mayor huella de memoria |
| Qwen3.6-35B-A3B FP8-dynamic (según benchmarks del autor) | 35,95B totales, ~3B activos | no disponible | FP8 dinámico | Apache-2.0 | Media del 97,9% de recuperación en la tabla del autor |
| Qwen3.6-35B-A3B NVFP4 / NVFP4A16 (según benchmarks del autor) | 35,95B totales, ~3B activos | no disponible | NVFP4 | Apache-2.0 | Medias de 104,6% y 99,1% respectivamente en la tabla del autor |

No se dispone de datos en la información proporcionada para comparar con modelos de otras familias (por ejemplo, alternativas densas o MoE de tamaño similar de otros laboratorios).

## Limitaciones y advertencias

- Es una cuantización PTQ: la perplejidad aumenta un 4,9% y el acuerdo top-1 baja al 92,4% respecto al BF16 original; no es equivalente bit a bit al modelo base.
- Los archivos anteriores al 1 de noviembre de 2026 06:36:29 UTC (revisión `8fa65c4`) tenían el router MoE y la puerta del experto compartido sin compensar, lo que enrutaba tokens a expertos distintos del original; es obligatorio descargar la revisión reconstruida.
- Los benchmarks MMLU y GSM8K del autor presentan una varianza extrema entre builds (MMLU 64,0-74,1; GSM8K 21,5-71,1) y puntuaciones superiores al BF16 que el propio autor atribuye probablemente al formato de respuesta; no deben usarse como medida fiable de calidad.
- El conjunto de calibración AWQ es mayoritariamente coreano mixto, lo que podría introducir un sesgo sutil en la preservación de canales para otros idiomas; no se documentan evaluaciones por idioma más allá de coreano e inglés.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en secuencias largas ni estimar con precisión la VRAM de la caché KV.
- Idiomas soportados no documentados oficialmente en esta ficha; la cobertura multilingüe más allá de inglés y coreano es desconocida.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible; la cuantización puede amplificarlo ligeramente en dominios sensibles.
- Soporte de tool calling, function calling y comportamiento agéntico no documentado explícitamente; conviene validarlo antes de usarlo en pipelines de agentes en producción.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen/Qwen3.6-35B-A3B y las condiciones de uso de Qwen para confirmar obligaciones adicionales.
- Dependencia de versiones muy concretas de software (vLLM 0.32.0, torch 2.13 con CUDA 13, transformers ≥ 5.16.1, < 5.20); entornos con versiones anteriores pueden no cargar el formato compressed-tensors correctamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.6-35B-A3B-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
