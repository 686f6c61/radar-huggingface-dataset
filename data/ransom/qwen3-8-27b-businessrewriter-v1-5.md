# Ransom/Qwen3.8-27B-BusinessRewriter-v1.5

## Resumen

Qwen3.8-27B-BusinessRewriter-v1.5 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario Ransom y publicado en Hugging Face. Se trata de un modelo editorial especializado en reescribir prosa empresarial: elimina clichés típicos de LLM, abuso de viñetas en negrita y marcos corporativos rígidos, sustituyéndolos por texto humano concreto, directo y con autoridad, preservando cada cifra, nombre, fecha y afirmación lógica del original. El modelo se distribuye con licencia Apache 2.0 y está orientado exclusivamente al inglés.

La relevancia del modelo radica en que aborda un fallo medible de los modelos generalistas: al pedirles "que suene humano", caen en una segunda voz mecánica (frases uniformes de 18 palabras, intercambio de sinónimos y encabezados de informe robóticos). El autor documenta métricas comparativas frente a autores humanos reales sobre 30 pasajes empresariales estrictamente no vistos, y el ajuste se realizó mediante una combinación de continued pre-training, SFT por retro-traducción y DPO anti-slop.

El repositorio ocupa 2,1 GB y se publica en formato MLX y safetensors (con etiqueta gguf), lo que sugiere pesos adaptados para Apple Silicon y cuantizaciones GGUF. No se dispone de datos sobre el número exacto de parámetros del modelo base ni sobre su longitud de contexto en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (Qwen3_5ForConditionalGeneration): intercala tres capas Gated DeltaNet por cada capa de Gated Full Attention, más MLPs SwiGLU |
| Parametros totales | no disponible (modelo base Qwen3.8-27B; el adaptador LoRA documentado tiene 233,5 M de parámetros, 0,85 % del total) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona etiqueta gguf y formato MLX, sin detallar variantes) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, MLX, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, una arquitectura híbrida que combina capas Gated DeltaNet (atención lineal) con capas de Gated Full Attention y MLPs SwiGLU. El autor señala que un LoRA estándar aplicado solo a la atención dejaría sin adaptar el 75 % de la mezcla de secuencias, por lo que el ajuste cubre las 12 familias de proyecciones lineales (`in_proj_qkv/z/a/b`, `out_proj`, `q/k/v/o_proj`, `gate/up/down_proj`), con 233,5 M de parámetros entrenables (0,85 %) en BF16, `enable_thinking=False` y `completion_only_loss=True`.

El entrenamiento se organiza en tres etapas. Primero, un continued pre-training suave (r=32, α=64, ~9,1 M de tokens, LR 6e-6) para absorber cadencia humana y contención léxica (eval_loss de 2,385 a 2,341). Después, un SFT por retro-traducción con 1.274 pares verificados (3 épocas, LR 1,5e-5, eval_loss 0,5701, 86,4 % de precisión de tokens), construidos a partir de 103 obras de no ficción empresarial auditadas (93 de entrenamiento / 10 de evaluación sin solapamiento de autor), 385 párrafos analíticos cortos y 50 borradores empresariales modernos sin slop en 10 formatos corporativos. Los inputs de slop se sintetizaron en sentido inverso con un 75 % de DeepSeek-V4.1-Flash y un 25 % de GLM-5.3-Flash, con filtros deterministas de fuga numérica y de citas más una puerta LLM de cero alucinaciones. La tercera etapa es un DPO quirúrgico anti-slop (r=16, α=32, β=0,1, LR 2e-6, 94 pares de contraste, KL anclada al SFT fusionado de la etapa E2), con 86,7 % de precisión de recompensa en 3 min 25 s.

## Capacidades

- Generación y reescritura de texto empresarial en inglés con preservación estricta de cifras, nombres, fechas y afirmaciones lógicas.
- Eliminación de clichés de LLM y de "slop" léxico (frases como *delve*, *tapestry*, *evolving landscape*).
- Reducción de inflación de markdown y de viñetas en negrita (0,0 % de bloat en la evaluación).
- Control de variabilidad de longitud de frase (burstiness) para acercarse a la cadencia humana.
- Ajuste de diversidad léxica (MATTR-50) hacia valores naturales, evitando la inflación típica de los modelos base.
- Mitigación de alucinación numérica (0,0 % de números nuevos inventados en la evaluación) y de citas directas inventadas (2 de 30 frente a 4 de 30 en la versión v1).
- Adaptación a formatos corporativos cotidianos: correos de consejo, borradores de LinkedIn, informes trimestrales SaaS, entre otros.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Modelo monolingüe: solo inglés.

## Casos de uso

- Reescritura de correos ejecutivos y de consejo: el modelo transforma borradores generados por LLM en prosa directa y con autoridad, manteniendo intactas las cifras de negocio y las fechas, lo que reduce el riesgo de errores en comunicaciones sensibles.
- Limpieza de publicaciones en LinkedIn y blogs corporativos: elimina clichés de "thought leadership" y marcos rígidos, y produce párrafos con variabilidad de longitud similar a la humana, adecuado para contenido de marca que debe sonar auténtico.
- Preparación de informes trimestrales y memorandos internos: al no inventar números (0,0 % de alucinación numérica en la evaluación) y conservar las afirmaciones lógicas, sirve para pulir documentos financieros y operativos sin alterar los datos.
- Edición de propuestas comerciales y documentos de venta: convierte lenguaje inflado en argumentos concretos, útil para equipos que revisan propuestas antes de enviarlas a clientes.
- Normalización de estilo en pipelines editoriales: puede integrarse como etapa de post-proceso sobre textos generados por otros modelos para homogeneizar la voz de marca y reducir el "slop" residual antes de publicación.
- Revisión de documentación de producto y notas de versión: reescribe descripciones rígidas en lenguaje llano y concreto, manteniendo nombres de funcionalidades y versiones exactos.
- Formación y auditoría de calidad editorial: sirve como referencia para comparar la calidad de prosa de otros modelos o para construir conjuntos de evaluación de estilo humano frente a estilo LLM.

## Benchmarks y rendimiento

Evaluación sobre 30 pasajes empresariales de autores estrictamente no vistos, con muestreo Min-P calibrado idéntico (temperature=0,7, top_p=0,92, min_p=0,06, repetition_penalty=1,05):

| Métrica | Slop de entrada | Base Qwen3.8-27B | v1.5 solo SFT | v1.5 SFT + DPO | Línea base humana |
|---|---:|---:|---:|---:|---:|
| Frases slop / 1k palabras (↓) | 4,73 | 1,23 | 0,64 | **0,43** (−65 % vs Base) | 0,38 |
| Bloat de markdown (%) (↓) | 23,3 % | 6,7 % | 0,0 % | **0,0 %** | 10,0 % |
| Burstiness de frase (CV) (→ humano) | 0,562 | 0,437 (plano) | 0,503 | **0,515** | 0,567 |
| Diversidad léxica (MATTR-50) (→ humano) | 0,812 | 0,854 (inflado) | 0,818 | **0,816** | 0,818 |
| Alucinación de números nuevos (↓) | — | 6,9 % | 0,0 % | **0,0 %** | 0,0 % |
| Citas directas inventadas (de 30) (↓) | — | — | 4 / 30 | **2 / 30** (−75 % vs v1) | 0 / 30 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del tamaño real del modelo base (27B según el nombre) y de la cuantización elegida.
- GPU recomendadas: no disponible. El repositorio incluye pesos en formato MLX, orientados a Apple Silicon (memoria unificada), y etiqueta gguf para despliegue en CPU/GPU con llama.cpp.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de ~27B en BF16 requeriría más de 54 GB de memoria, por lo que en GPU de consumo (RTX 4090, 24 GB) solo cabría con cuantizaciones agresivas, dato no documentado.
- Opciones de despliegue: MLX (Apple Silicon), llama.cpp/Ollama vía GGUF y safetensors con frameworks compatibles con la arquitectura Qwen3_5ForConditionalGeneration; vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. El DPO se completó en 3 min 25 s, pero no se aportan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-BusinessRewriter-v1.5 | no disponible (base 27B) | no disponible | Reescritura editorial anti-slop | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27B (según nombre) | no disponible | Propósito general | no disponible | Hugging Face |
| DeepSeek-V4.1-Flash | no disponible | no disponible | Generación de slop sintético en el pipeline | no disponible | no disponible |
| GLM-5.3-Flash | no disponible | no disponible | Generación de slop sintético en el pipeline | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría (modelos editoriales o de reescritura de prosa).

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación no nulo: aunque la evaluación reporta 0,0 % de números nuevos inventados, persisten 2 de 30 citas directas inventadas, por lo que requiere revisión humana en contextos con citas textuales.
- Sesgos conocidos: no documentados en la información disponible; el corpus se basa en 103 obras de no ficción empresarial, lo que puede introducir sesgos de género, sector o registro propios de ese material.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.8-27B debe verificarse por separado, ya que sus términos podrían imponer condiciones adicionales.
- Caveat de decodificación: el autor advierte de una "trampa de decodificación greedy"; con argmax el slop por 1k palabras sube de 0,43 a 1,39, por lo que se recomienda muestreo calibrado (temperature=0,7, top_p=0,92, min_p=0,06, repetition_penalty=1,05).
- Especialización estrecha: está diseñado para reescritura editorial; no se documentan capacidades de razonamiento, código, matemáticas, tool calling ni agentes.
- Sin datos de benchmarks estándar ni de rendimiento en producción (latencia, throughput), lo que dificulta estimar su coste operativo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Ransom/Qwen3.8-27B-BusinessRewriter-v1.5
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Documento técnico completo del autor: `how-it-was-built.html` (incluido en el repositorio, HTML autocontenido con diagramas SVG)
- Sección de ejemplos del documento técnico: `how-it-was-built.html#examples`
- No se han encontrado papers, blogs, repositorios o demos adicionales en la búsqueda web; los resultados obtenidos corresponden a contenidos no relacionados (películas, series y canciones tituladas "Ransom").
