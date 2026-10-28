# AmareshHebbar/Qwen2.5-1.5B-Abliterated-2.0

## Resumen

Qwen2.5-1.5B-Abliterated-2.0 es una variante quirúrgica del modelo instructivo `unsloth/Qwen2.5-1.5B-Instruct`, publicada por el usuario AmareshHebbar. No se trata de un reentrenamiento ni de un fine-tuning: el autor aplica una técnica de cirugía de pesos denominada "Winsorized Gram-Schmidt Orthogonal Abliteration", que proyecta fuera de las matrices de salida (`o_proj` y `down_proj`) el subespacio de activaciones asociado a los rechazos y a las redirecciones moralizantes. El objetivo es conservar el manifold lingüístico y lógico del modelo base mientras se eliminan los mecanismos de negativa.

El modelo es un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,54 B), con licencia Apache 2.0, pesos en safetensors de 16 bits y un tamaño de repositorio de 1,5 GB. La model card declara únicamente inglés como idioma soportado y una ventana de contexto heredada del base Qwen2.5-1.5B-Instruct, que no se detalla explícitamente en la documentación de esta variante.

Su relevancia es doble. Por un lado, sirve como caso de estudio reproducible de interpretabilidad y representación geométrica del rechazo en modelos pequeños. Por otro, es un artefacto sin salvaguardas diseñado para investigación de seguridad, red-teaming y generación de datos adversarios, no para despliegues de cara al usuario final sin filtros adicionales. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validación independiente de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, denso), derivado de Qwen2.5-1.5B-Instruct |
| Parámetros totales | 1.543.714.304 (1,54 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens según el modelo base Qwen2.5-1.5B-Instruct; no indicado explícitamente en la model card de esta variante |
| Tipos de cuantización | bfloat16 y float16 (pesos merged de 16 bits); 4 bits vía bitsandbytes según las etiquetas del repo; no se publican GGUF, GPTQ ni AWQ |
| Idiomas soportados | Inglés (`en`) declarado; no se declaran otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 bits fusionados); repo de 1,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atención causal, sin mezcla de expertos ni componentes híbridos SSM. La intervención no modifica la topología ni añade capas: actúa exclusivamente sobre los pesos de las proyecciones de salida de las capas 10 a 24, tanto en el flujo residual como en las down-projections del bloque MLP. El proceso consta de cuatro etapas: extracción de activaciones contrastivas con 256 pares (dañino frente a inofensivo), recorte de cuantiles al 0,995 para suprimir valores atípicos, ortogonalización de Gram-Schmidt de la base de rechazo contra una base de capacidades benignas derivada de matemáticas, código e instrucciones generales, y proyección final del vector unitario de rechazo $\hat{r}$ mediante $W'_{out} = W_{out} - (W_{out}\cdot\hat{r})\hat{r}^T$.

No se aportan datos sobre el corpus de entrenamiento original (número de tokens, composición, fases de RLHF o DPO), ya que la model card solo describe el post-procesado. Sí se documenta un control de calidad posterior a la fusión: una puerta de perplejidad lingüística con umbral PPL < 25, evaluación con EleutherAI LM Evaluation Harness y un benchmark propio de rechazo y redirección. Según el autor, la tasa de rechazo duro cae del 94,5 % en el modelo base al 2,1 % en esta variante, la obediencia directa sin redirección sube del 5,5 % al 97,9 % y la retención de capacidades benignas se mantiene en el 99,2 %. Estas cifras proceden de la evaluación del propio autor y no están verificadas de forma independiente.

## Capacidades

- Generación de texto conversacional multi-turno, con la plantilla de chat del modelo base Qwen2.5-Instruct.
- Razonamiento y matemáticas básicas: GSM8K 0-shot con exact match flexible del 28 %, lo que sitúa al modelo en un nivel bajo para aritmética de varios pasos.
- Conocimiento académico limitado: MMLU de álgebra abstracta 0-shot con 37 % de accuracy y un intervalo de error de ±4,85 puntos porcentuales sobre 100 muestras.
- Generación de código: no evaluada en esta variante; la capacidad procede del base y no está medida.
- Tool calling y function calling: no documentados para esta variante; el modelo base declara soporte, pero la cirugía de pesos no incluye verificación de esa capacidad.
- Uso en agentes y razonamiento multi-paso: no documentado; la ventana de contexto teórica lo permitiría, pero un modelo de 1,5 B tiene fiabilidad limitada en planificación larga.
- Multilingüismo: no declarado; solo inglés en la model card, aunque el base Qwen2.5 tiene cobertura multilingüe no verificada aquí.
- Modo "thinking" o razonamiento explícito: no disponible.
- Visión, audio y otras modalidades: no disponibles.
- Supresión de rechazos: el autor reporta 2,1 % de rechazo duro y 97,9 % de cumplimiento directo en su propio benchmark de prompts sensibles y de doble uso.

## Casos de uso

- Red-teaming de clasificadores de seguridad: el modelo permite generar respuestas sin negativa para probar la robustez de filtros de entrada y salida, comparando su comportamiento con el del modelo base al que se le aplica el mismo conjunto de prompts adversarios.
- Investigación en interpretabilidad: la metodología de proyección ortogonal sobre las capas 10-24 y el conjunto de 256 pares contrastivos son reproducibles, lo que facilita estudios sobre la geometría del rechazo en modelos pequeños y su relación con las capacidades de razonamiento.
- Generación de datos sintéticos adversarios: útil para construir corpus etiquetados de prompts y respuestas que alimenten entrenamientos de moderadores o clasificadores de daño, siempre con revisión humana y en un entorno controlado.
- Asistente local sin conexión: con 1,54 B de parámetros y cuantización de 4 bits ocupa alrededor de 1 GB de pesos, por lo que puede ejecutarse en GPU de consumo y en portátiles para tareas de escritura, resumen o chat sin enviar datos a la nube.
- Escritura creativa y ficción con temáticas sensibles: al eliminar las redirecciones moralizantes, resulta más adecuado para narrativa negra, terror o guiones que aborden violencia o contenido adulto, con revisión editorial posterior.
- Evaluación de robustez de pipelines: sirve como "peor caso" controlado para medir cómo se comporta un sistema de moderación, un guardrail o una capa de filtrado cuando el generador subyacente no incorpora alineamiento.
- Docencia y divulgación técnica: permite ilustrar en clase cómo una intervención geométrica sobre los pesos altera el comportamiento de rechazo sin reentrenar, y comparar curvas de perplejidad antes y después.
- Fine-tuning de dominio con rechazos suprimidos: punto de partida para ajustar un modelo especializado en dominios donde el base rechaza en exceso (por ejemplo, ficción, seguridad ofensiva autorizada o análisis de contenido), asumiendo la responsabilidad legal y ética del resultado.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` y en la model card, con `num_few_shot=0` y `limit=100`. Ninguno está verificado de forma independiente (`verified: false`).

| Benchmark | Dataset | Métrica | Configuración | Resultado | Error estándar |
|---|---|---|---|---|---|
| MMLU (Álgebra abstracta) | `cais/mmlu` | Accuracy | 0-shot, split test, limit 100 | 37,00 % | ±4,85 % |
| GSM8K | `openai/gsm8k` | Exact match (flexible-extract) | 0-shot, split test, limit 100 | 28,00 % | ±4,51 % |

| Prueba de rechazo y redirección | Modelo base | Esta variante | Delta |
|---|---|---|---|
| Tasa de rechazo duro | 94,5 % | 2,1 % | Eliminado |
| Cumplimiento directo sin redirección | 5,5 % | 97,9 % | Alta obediencia |
| Retención de capacidades benignas | 100,0 % | 99,2 % | Deriva mínima |

| Puerta de coherencia | Valor | Umbral | Estado |
|---|---|---|---|
| Perplejidad lingüística (PPL) | < 25,00 (verificado por el autor) | < 25,00 | Superado |
| Precisión de serialización | bfloat16 / float16 fusionado | Nativa | Verificado |

No se han publicado resultados de benchmarks adicionales (HumanEval, MMLU completa, BBH, TruthfulQA) en la información disponible. Las cifras de MMLU y GSM8K proceden de 100 muestras, por lo que los intervalos de confianza son amplios y no permiten comparaciones finas con otros modelos.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 3,1 GB solo para pesos, más caché KV; se recomienda un mínimo de 8 GB para contexto moderado.
- VRAM estimada en 4 bits (bitsandbytes): alrededor de 1 GB de pesos; cabe en GPU de 4-6 GB con contexto corto.
- GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070 y superiores; también funciona en iGPU con llama.cpp tras convertir a GGUF, aunque no se publica GGUF en el repo.
- GPU de数据中心: A100, H100 o L40S para servir varias peticiones concurrentes con vLLM o TGI; el modelo es demasiado pequeño para aprovechar estas GPU en una sola petición.
- Opciones de despliegue: `transformers` (librería declarada), vLLM, Text Generation Inference, y llama.cpp u Ollama si se genera una cuantización GGUF propia; no hay artefactos GGUF, GPTQ ni AWQ publicados.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, en una RTX 4090 en FP16 se espera una latencia por token del orden de milisegundos bajos, pero es una estimación derivada, no una medición publicada.

## Comparativa con modelos similares

Los datos de contexto y licencia de los modelos alternativos provienen de su documentación pública y no forman parte de la información proporcionada en esta ficha; se incluyen como referencia orientativa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Abliterated-2.0 | 1,54 B | 32 K (heredado) | Apache 2.0 | HuggingFace, safetensors | Sin salvaguardas; benchmarks propios de 100 muestras |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 K | Apache 2.0 | HuggingFace, amplia adopción | Base alineado; rechazo duro del 94,5 % según el autor |
| Llama-3.2-1B-Instruct | 1,24 B | 128 K | Llama 3.2 Community License | HuggingFace, ecosistema amplio | Licencia con restricciones de uso comercial y de usuarios |
| Gemma-2-2B-it | 2,6 B | 8 K | Gemma Terms of Use | HuggingFace, requiere aceptación | Buen rendimiento en razonamiento para su tamaño; licencia con cláusulas de uso aceptable |
| SmolLM2-1.7B-Instruct | 1,7 B | 8 K | Apache 2.0 | HuggingFace | Alternativa ligera totalmente permisiva, sin cirugía de pesos |

Frente a estos modelos, la variante abliterada no aporta mejoras de razonamiento ni de contexto: su diferencia es la supresión del rechazo. En MMLU de álgebra abstracta y GSM8K, los 37 % y 28 % declarados no permiten afirmar superioridad frente a los instructivos originales, que suelen obtener resultados similares o superiores en estas tareas con 0-shot.

## Limitaciones y advertencias

- El modelo elimina deliberadamente las salvaguardas de rechazo; puede producir contenido dañino, ilegal o sexualmente explícito. No debe desplegarse de cara al público sin filtros externos y revisión humana.
- Los benchmarks de rechazo, retención de capacidades y perplejidad los declara el propio autor, no están verificados por terceros y se han medido sobre conjuntos propios no publicados en detalle.
- Las evaluaciones estándar usan 100 muestras (`limit=100`) y 0-shot, lo que produce intervalos de confianza amplios (±4,85 % en MMLU, ±4,51 % en GSM8K) y limita la comparación con otros modelos.
- El umbral de perplejidad PPL < 25 es permisivo; no garantiza que la distribución de tokens no se haya degradado en dominios específicos, especialmente en colas largas o en contextos técnicos.
- La cirugía afecta a las capas 10-24; no se documenta una evaluación sistemática de regresiones en código, matemáticas avanzadas ni instrucciones de formato estricto.
- El modelo es de 1,5 B de parámetros: la tasa de alucinación es alta en comparación con modelos de 7 B o superiores, y el razonamiento multi-paso es frágil.
- Solo se declara inglés; el comportamiento en castellano no está evaluado y probablemente sea inferior al del base multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero no exime al desplegador de cumplir la normativa aplicable sobre contenido dañino, protección de menores o propiedad intelectual.
- No se publican pesos GGUF, GPTQ ni AWQ; quien quiera desplegar en llama.cpp u Ollama debe convertir y validar la cuantización por su cuenta.
- Existe una inconsistencia de nombre entre el ID del repositorio (`Abliterated-2.0`) y el título de la model card (`Abliterated-Clean`), lo que puede generar confusión sobre la versión exacta.
- El repositorio no tiene descargas ni likes en el momento de la consulta y la fecha de creación registrada es del 28 de octubre de 2026, por lo que carece de validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmareshHebbar/Qwen2.5-1.5B-Abliterated-2.0
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Registro de evaluación citado por el autor: `eval_results/evaluation_verified_log.json` dentro del repositorio del modelo
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- EleutherAI LM Evaluation Harness: https://github.com/EleutherAI/lm-evaluation-harness
