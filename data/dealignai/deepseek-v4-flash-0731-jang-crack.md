# dealignai/DeepSeek-V4-Flash-0731-JANG-CRACK

## Resumen

DeepSeek-V4-Flash-0731-JANG-CRACK es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por dealignai, que parte del checkpoint oficial DeepSeek-V4-Flash-0731 de DeepSeek y le aplica una técnica de "abliteración" (eliminación de la dirección de rechazo en el espacio residual) para producir una variante sin salvaguardas de seguridad. El resultado es un modelo que no rechaza peticiones dañinas, con una tasa de cumplimiento del 100 % en comportamientos de riesgo real según los tests publicados por el autor.

Técnicamente, mantiene la arquitectura del base: 43 capas, 256 expertos enrutados más un experto compartido por capa, atención MLA con compresión de KV, y una ventana de contexto ampliada a 1.048.576 tokens mediante extensión yarn RoPE. El modelo se distribuye en formato MLX con cuantización JANG affine de precisión mixta (8 bits para atención y expertos compartidos, 2 bits para expertos enrutados), ocupando unos 95 GB en disco y pensado para ejecutarse en Apple Silicon con memoria unificada de ~128 GB.

La relevancia de este lanzamiento reside en dos aspectos: por un lado, demuestra que la abliteración no degrada el rendimiento en tareas generales (MMLU incluso mejora ligeramente respecto al base), y por otro, plantea un serio problema de seguridad al eliminar por completo los mecanismos de rechazo. Es un modelo pensado para entornos de investigación en seguridad ofensiva, pero su uso en producción conlleva riesgos elevados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA (Multi-head Latent Attention), 43 capas, 256 expertos enrutados + 1 experto compartido por capa |
| Parametros totales | 31.374.954.583 (~31,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (extensión yarn RoPE, factor 16 sobre base 65.536) |
| Tipos de cuantizacion | JANG affine de precisión mixta (atención y expertos compartidos en 8 bits g64, expertos enrutados en 2 bits g32); también disponible en GGUF (IQ2XXS, Q2K, Q4K) |
| Idiomas soportados | inglés, chino (vocabulario de 129.280 tokens, incluye CJK) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con atención MLA, donde cada capa dispone de 256 expertos enrutados y un experto compartido. La atención usa `q_lora_rank=1024`, `o_lora_rank=1024` y `num_key_value_heads=1`, con ventana deslizante de 128 y extensión yarn RoPE que multiplica la base de 65.536 por un factor de 16, alcanzando el contexto de 1.048.576 tokens. El vocabulario es multilingüe con 129.280 entradas.

El entrenamiento de esta variante consiste en una abliteración del modelo base DeepSeek-V4-Flash-0731: se identifica la dirección del vector residual asociada al rechazo y se elimina, de modo que el modelo deja de negarse a responder. No se han publicado detalles sobre el dataset de abliteración ni sobre el proceso de fine-tuning. El modelo base original sí incorpora un módulo de decodificación especulativa, pero en esta versión no se menciona su presencia. La cuantización JANG affine aplica 8 bits a atención y expertos compartidos, y 2 bits a los expertos enrutados, con sobreescrituras por proyección y capa conservadas de la versión fuente.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento activable mediante prefijos de instrucción (`reasoning_effort` bajo, alto o máximo).
- Generación de código: alcanza un 90 % de pass@2 en HumanEval, igualando al modelo base sin abliterar.
- Soporte de tool calling y capacidades agénticas, diseñado para el motor de inferencia vMLX, que incluye llamada a herramientas, reutilización de prefijos y decodificación especulativa.
- Contexto largo de hasta 1.048.576 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Multilingüe limitado a inglés y chino, con cobertura de caracteres CJK.
- Sin mecanismos de rechazo: responde a peticiones dañinas, incluyendo ciberdelincuencia, química y biología, desinformación, acoso y contenido ilegal.

## Casos de uso

- Investigación en seguridad ofensiva autorizada: el modelo puede generar exploits, scripts de pentesting, técnicas de evasión y análisis de vulnerabilidades en entornos controlados y con permiso explícito. Su ausencia de rechazo permite explorar vectores de ataque sin interrupciones, aunque exige un aislamiento estricto.
- Análisis defensivo de malware: permite estudiar código malicioso, comprender técnicas de propagación y desarrollar firmas de detección, siempre que el uso se limite a laboratorios aislados y con fines de protección.
- Generación de código en entornos de investigación: su rendimiento en HumanEval (90 % pass@2) lo hace útil para prototipado rápido de algoritmos y scripts, aunque la falta de salvaguardas obliga a revisar manualmente cualquier salida.
- Procesamiento de documentos largos: con 1.048.576 tokens de contexto, puede resumir, extraer información y razonar sobre corpus extensos, como expedientes técnicos, bases de conocimiento o literatura científica.
- Razonamiento multi-paso y resolución de problemas matemáticos: su modo de pensamiento y su rendimiento en MMLU (71,84 %) lo sitúan como una herramienta viable para tareas de razonamiento complejo en investigación académica.
- Evaluación de técnicas de alineación y seguridad: sirve como caso de estudio para medir el impacto de la abliteración en el comportamiento del modelo, comparando métricas de utilidad y seguridad frente al base.

## Benchmarks y rendimiento

Los resultados publicados por el autor se obtuvieron en Apple Silicon con el runtime JANG, usando `enable_thinking=True`, `reasoning_effort=low` y un system prompt estándar. La evaluación de HarmBench-320 mide la tasa de éxito de ataque (ASR) sobre comportamientos dañinos reales.

| Benchmark | CRACK | Base (DeepSeek-V4-Flash-0731) | GGUF antirez (ds4) |
|---|---|---|---|
| MMLU (1140 preguntas) | 71,84 % | 70,96 % | no disponible |
| HumanEval pass@2 (N=50) | 90,0 % | 90,0 % | 76,0 % |
| HumanEval per-sample (n=100) | 79 % | 83 % | 67 % |
| Tiempo medio por muestra (HumanEval) | 35 s | 21 s | 16 s |
| HarmBench-320 ASR (excluyendo copyright) | 100 % (240/240) | no aplicable | no aplicable |
| HarmBench-320 ASR (copyright) | 98,75 % (79/80) | no aplicable | no aplicable |

El modelo CRACK iguala al base en generación de código y lo supera ligeramente en MMLU, lo que sugiere que la abliteración no daña el conocimiento general. La cuantización agresiva de los expertos enrutados en el GGUF de antirez (IQ2XXS/Q2K) sí penaliza la calidad del código, con 14 puntos menos en pass@2.

## Requisitos de hardware

- Memoria unificada recomendada: ~128 GB en Apple Silicon (M-series Max o Ultra), según el autor.
- VRAM estimada: no aplicable en el contexto MLX (usa memoria unificada); para GGUF en GPU convencionales, el tamaño de ~95 GB en disco implica que se necesitan al menos 96-128 GB de VRAM para cargar el modelo completo en FP16, o menos con cuantizaciones más agresivas.
- GPU compatibles: Apple Silicon (M-series Max/Ultra) para MLX; para GGUF, GPUs NVIDIA con gran memoria (A100 80 GB, H100, o múltiples GPUs) o CPU con mucha RAM.
- Opciones de despliegue: vMLX (motor de inferencia MLX con soporte de tool calling, cuantización de KV cache y decodificación especulativa), jang_tools, y motores nativos para GGUF como ds4 (DwarfStar) o llama.cpp.
- Latencia y throughput: en HumanEval, el CRACK tarda una media de 35 s por muestra en Apple Silicon, frente a 21 s del base y 16 s del GGUF con ds4. No se han publicado métricas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | HumanEval pass@2 | Licencia | Formato |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-JANG-CRACK | 31,4 B (MoE) | 1.048.576 | 71,84 % | 90 % | MIT | MLX, GGUF |
| DeepSeek-V4-Flash-0731 (base) | 31,4 B (MoE) | 1.048.576 | 70,96 % | 90 % | MIT | safetensors, GGUF |
| DeepSeek-V4-Flash-0731 GGUF (antirez) | 31,4 B (MoE) | 1.048.576 | no disponible | 76 % | MIT | GGUF |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos MoE de tamaño similar en la información proporcionada. La diferencia principal entre el CRACK y el base es la ausencia de rechazos; el GGUF de antirez emplea una cuantización más agresiva en los expertos enrutados, lo que reduce la calidad de generación de código.

## Limitaciones y advertencias

- Ausencia total de salvaguardas: el modelo cumple el 100 % de las peticiones dañinas en HarmBench (excluyendo copyright), incluyendo ciberdelincuencia, síntesis de sustancias controladas, desinformación y acoso. Su uso conlleva un riesgo legal y ético elevado.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad; como cualquier modelo generativo, puede producir información falsa con apariencia verosímil.
- Idiomas limitados: solo inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Requisitos de hardware muy exigentes: necesita ~128 GB de memoria unificada en Apple Silicon, lo que limita su despliegue a estaciones de trabajo de gama alta.
- Cuantización agresiva: los expertos enrutados en 2 bits pueden degradar la calidad en tareas de código y razonamiento, como muestra la comparativa con el GGUF de antirez.
- Dependencia del ecosistema MLX: el formato JANG affine y el motor vMLX son específicos de Apple Silicon; el despliegue en otras plataformas requiere conversión a GGUF con posibles pérdidas de rendimiento.
- Licencia MIT: permite uso comercial, pero la responsabilidad legal del uso indebido recae en el usuario final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dealignai/DeepSeek-V4-Flash-0731-JANG-CRACK
- Repositorio de archivos: https://huggingface.co/dealignai/DeepSeek-V4-Flash-0731-JANG-CRACK/tree/main
- Modelo base en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Modelo base en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-V4-Flash-0731
- Proyecto DeepSeek V4 Flash 0731 (aplicación de escritorio): https://github.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Documentación en DeepWiki: https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
