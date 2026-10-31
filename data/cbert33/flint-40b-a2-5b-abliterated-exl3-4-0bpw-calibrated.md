# cbert33/Flint-40B-A2.5B-Abliterated-EXL3-4.0bpw-Calibrated

## Resumen

Esta ficha corresponde a una cuantización EXL3 de 4,0 bits por peso (bpw) del modelo Flint-40B-A2.5B en su variante abliterated, publicada por el usuario cbert33 en Hugging Face. El modelo base es dima6312/Flint-40B-A2.5B-abliterated, que a su vez deriva de Flint 40B-A2.5B de RecursiveSI, un modelo de arquitectura mixture-of-experts (MoE) al que se le ha aplicado abliteration (eliminación de la dirección de rechazo) para reducir los comportamientos de negativa en tareas de seguridad ofensiva y ofensiva-defensiva: análisis de exploits, triaje de malware, ingeniería de detecciones, CTF y herramientas de red team.

La variante abliterated reporta una reducción de las negativas en peticiones MITRE ATT&CK retenidas del 15 % al 0 % (n=100, cuantización Q8_0), sin caída significativa en HumanEval+, MBPP+, GSM8K, MMLU-Pro, CyberMetric ni WMDP-cyber, y una divergencia KL de 0,0146 respecto al modelo original en prompts inofensivos. Esta versión EXL3 añade calibración de pesos (512.000 tokens del corpus incluido en la toolchain), caché KV nativa de 8 bits para las capas de atención completa y una estructura híbrida de 49 capas: 35 capas con ventana deslizante RoPE y 14 capas de atención completa NoRoPE.

Es relevante porque permite ejecutar un modelo MoE de 40B parámetros con solo 2,5B parámetros activos en GPUs de consumo, con calidad cercana al BF16, siempre que se use un runtime con soporte específico para la arquitectura Flint (ExLlamaV3 con el adaptador incluido en el repositorio).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 49 capas (35 sliding-window RoPE + 14 full-attention NoRoPE), per-head Q/K normalización, attention sinks aprendidos, routing top-6/256 con renormalización sigmoide y expertos compartidos |
| Parametros totales | 10.308.698.528 (según metadatos safetensors del repositorio; el nombre comercial indica 40B, dato no disponible con desglose oficial) |
| Parametros activos | 2,5B (aproximados, según denominación del modelo; dato exacto no disponible) |
| Longitud de contexto | No disponible (las 35 capas de ventana deslizante mantienen anillos acotados de 1.024 tokens con semántica de ventana de 513 tokens; capacidad de contexto total no testada por el autor) |
| Tipos de cuantizacion | EXL3 4,0 bpw (decoder projections), cabeza de salida a 5 bits, embeddings/routers/normas en 16 bits, caché KV Q8 nativa (códigos enteros + escalas FP16 por grupo de 32) en las 14 capas de atención completa; FP16 en las capas de ventana deslizante |
| Idiomas soportados | No disponible |
| Licencia | Apache 2,0 |
| Formato de pesos | Safetensors (formato EXL3 para ExLlamaV3); el modelo base también existe en BF16, GGUF (Q8_0 a Q3_K_M), NVFP4 y MLX 4-bit |

## Arquitectura y entrenamiento

Flint es un modelo MoE con enrutamiento top-6 sobre 256 expertos (más expertos compartidos), renormalización sigmoide del routing y una arquitectura de atención híbrida: 35 capas usan atención con ventana deslizante y codificación rotacional de posiciones (RoPE) acotada, mientras que 14 capas usan atención completa sin RoPE (NoRoPE) con attention sinks aprendidos. Este diseño híbrido reduce drásticamente el coste de la caché KV en las capas mayoritarias y mantiene la capacidad de atención global en un subconjunto reducido de capas.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no hay datos disponibles en la información proporcionada. La variante abliterated se obtuvo eliminando la dirección de rechazo del modelo original, con validación pareada en los benchmarks citados y KL de 0,0146 frente al original en prompts inofensivos.

En cuanto a la conversión EXL3 de esta ficha: se cuantizaron 36.439 proyecciones de decoder a 4 bits y una cabeza de salida a 5 bits, manteniendo embeddings, routers, attention sinks y normas en 16 bits. La calibración usó activación/Hessian sobre 250 filas de 2.048 tokens (512.000 tokens en total) del corpus de la toolchain, tokenizado con el tokenizer del modelo fuente. Un detalle crítico: las proyecciones ascendentes de los expertos enrutados están almacenadas divididas entre 128 para evitar desbordamiento FP16 en SwiGLU; el adaptador las multiplica por 128 (registrado en `quantization_config.expert_interm_div`). Un runtime que ignore este factor producirá salidas incorrectas de los expertos.

## Capacidades

- Generación de texto conversacional (pipeline text-generation).
- Razonamiento y matemáticas: sin caída significativa reportada en GSM8K y MMLU-Pro respecto al modelo original tras la abliteration.
- Generación y análisis de código: sin caída significativa en HumanEval+ y MBPP+.
- Ciberseguridad ofensiva y defensiva: análisis de exploits, triaje de malware, ingeniería de detecciones, resolución de CTF y herramientas de red team, con negativas reducidas del 15 % al 0 % en peticiones MITRE ATT&CK retenidas.
- Conocimiento de seguridad: sin caída significativa en CyberMetric y WMDP-cyber.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Análisis de malware y triaje de muestras: el modelo puede describir comportamientos, técnicas ATT&CK probables y estrategias de detección sin rechazar la petición, gracias a la abliteration que reduce las negativas del 15 % al 0 %.
- Ingeniería de detecciones (detection engineering): generación de reglas YARA, Sigma o consultas de hunting a partir de indicadores y TTPs descritos por el analista.
- Resolución de CTF y laboratorios de red team: asistencia en explotación guiada, análisis de binarios y redacción de exploits en entornos autorizados de investigación.
- Generación de código local en GPU de consumo: con 2,5B parámetros activos y cuantización a 4 bpw, cabe en GPUs de 24 GB con alta velocidad de inferencia, adecuado para autocompletado y refactorización offline.
- Investigación en seguridad de modelos: estudio del efecto de la abliteration sobre capacidades y alineación, con métricas pareadas publicadas (KL, benchmarks sin degradación).
- Experimentación con runtimes de cuantización: el repositorio incluye herramientas de conversión, provenance JSON y resultados de validación, útil como referencia para conversiones EXL3 calibradas de arquitecturas no estándar.

No está diseñado ni recomendado para producción: la model card lo limita explícitamente a investigación.

## Benchmarks y rendimiento

Resultados reportados para el modelo base abliterated (dima6312/Flint-40B-A2.5B-abliterated, no para esta cuantización EXL3):

| Benchmark | Resultado reportado |
|---|---|
| Negativas MITRE ATT&CK (retención, n=100, Q8_0) | 15 % → 0 % tras abliteration |
| HumanEval+ / MBPP+ / GSM8K / MMLU-Pro / CyberMetric / WMDP-cyber | Sin caída significativa (evaluación pareada, mismos ítems) |
| KL frente al original (prompts inofensivos) | 0,0146 |

Para esta derivada EXL3, el autor solo publicó una validación acotada: prefill por chunks de 1.152 tokens, comparación de continuación teacher-forced con caché FP16 y Q8 en una única prueba (coincidencia top-1 en 6 de 7 posiciones; KL entre 8,66e-6 y 0,377). No se testaron capacidad de contexto largo, throughput ni benchmarks amplios de capacidad. No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, etc.) de esta cuantización concreta.

## Requisitos de hardware

- Tamaño del repositorio: 20,7 GB; con overhead de caché y activaciones, una GPU de 24 GB de VRAM (RTX 3090/4090) es el objetivo natural para inferencia con contexto moderado.
- Con la caché Q8 nativa en las 14 capas de atención completa y anillos FP16 acotados de 1.024 tokens en las 35 capas de ventana deslizante, el consumo de KV cache es bajo comparado con un modelo denso equivalente, lo que favorece contextos más largos en 24 GB (capacidad máxima no testada).
- GPUs recomendadas: RTX 3090, RTX 4090, RTX 5090; en datacenter, A100 o H100 sin problema. Requisito: GPU NVIDIA con soporte ExLlamaV3 (arquitecturas Ampere o posteriores).
- CPUs o Mac: esta variante EXL3 no es adecuada; para esos entornos usar las builds GGUF o MLX del modelo base.
- Despliegue: ExLlamaV3 v1.6.2 con el adaptador Flint incluido en el repositorio (el ExLlamaV3 stock no registra Flint); no hay soporte directo de vLLM, TGI, llama.cpp u Ollama para este artefacto EXL3. No se desplegó servidor en la validación del autor.
- Latencia y throughput: no disponibles (no medidos por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| Flint-40B-A2.5B-abliterated (base BF16/GGUF) | 40B (denominación) | ~2,5B | BF16, GGUF Q8_0–Q3_K_M, NVFP4, MLX | Apache 2,0 | Más flexible en runtimes (llama.cpp, LM Studio, mlx-lm); misma abliteration |
| Esta variante EXL3 4,0 bpw calibrada | 10,3B en safetensors (40B nominales) | ~2,5B | EXL3 safetensors | Apache 2,0 | Requiere ExLlamaV3 parcheado con adaptador Flint; caché KV Q8 nativa |
| Modelos MoE abliterated de tamaño similar (p. ej. variantes abliterated de Qwen3-30B-A3B) | ~30B | ~3B | GGUF, EXL3 | Apache 2,0 (según base) | Ecosistema de runtimes más amplio; datos de rendimiento frente a Flint no disponibles |

Comparativas cuantitativas de rendimiento entre estos modelos: no disponibles.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: no asumirá rechazos ante peticiones dañinas. Tratar toda salida como no fiable y aplicar salvaguardas a nivel de aplicación. La model card lo declara solo para investigación, no para producción.
- Responsabilidad del usuario: sin garantía; los creadores y mantenedores no asumen responsabilidad por el uso que terceros hagan del modelo.
- Riesgo de alucinación: inherente a cualquier LLM; la abliteration no lo mitiga y la validación de la cuantización fue acotada (una sola prueba de caché, 7 posiciones medidas).
- Contexto largo no testado: el autor no verificó la capacidad de contexto largo; las 35 capas de ventana deslizante limitan la memoria fina a ventanas de 513 tokens por capa.
- Compatibilidad de runtime crítica: ExLlamaV3 stock no soporta Flint; hay que aplicar el adaptador incluido y respetar el factor de escalado de expertos (división por 128), o las salidas serán incorrectas.
- La caché Q8 es códigos enteros con escalas FP16, no FP8 E4M3 estático; no confundir con artefactos FP8 previos.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; verificar antes de usar en idiomas distintos del inglés.
- Licencia Apache 2,0: permite uso comercial del modelo base, pero la model card de esta derivada restringe su intención a investigación.
- Los benchmarks del modelo base no miden la calidad de esta cuantización concreta.

## Enlaces

- Ficha de la cuantización EXL3: https://huggingface.co/cbert33/Flint-40B-A2.5B-Abliterated-EXL3-4.0bpw-Calibrated
- Modelo base abliterated (BF16): https://huggingface.co/dima6312/Flint-40B-A2.5B-abliterated
- Builds GGUF del modelo base: https://huggingface.co/dima6312/Flint-40B-A2.5B-abliterated-GGUF
- Modelo original Flint de RecursiveSI: https://huggingface.co/RecursiveSI/flint
- Adaptador Flint EXL3 referenciado: https://huggingface.co/0xBakeer/TandemLLM-Flint-EXL3-4.0
- Paper citado en tags (arXiv): https://arxiv.org/abs/2406.11717
