# janmusic/ncm-tinystories-mlx

## Resumen

NCM TinyStories en MLX es la conversión a formato MLX safetensors del checkpoint TinyStories del modelo Next-Concept Modeling (NCM), desarrollado originalmente por HazyResearch (Hermann Kumbong) y portado a Apple Silicon por el usuario janmusic. NCM es una arquitectura de generación de texto no autorregresiva que opera de grueso a fino: en lugar de predecir un token cada vez, cada una de las 11 pasadas del generador predice en paralelo un nivel completo de códigos latentes discretos, que un códec descodifica posteriormente a texto.

El modelo es un transformer de 12 bloques con anchura 768 y 12 cabezas de atención, con atención en bloque diagonal y cabezas de salida atadas al codebook. El generador almacena 88.605.707 valores float32 y el códec 36.434.816, sumando 500,2 MB en pesos. Trabaja con un tokenizador BPE de 8.192 tokens y una jerarquía de niveles de 1 a 128 posiciones.

Su relevancia es fundamentalmente experimental: demuestra una vía alternativa a la generación autorregresiva token a token, con paridad verificada frente a la implementación PyTorch de referencia y una aceleración notable en Metal GPU frente a CPU. No es un modelo de producción ni de instrucciones: está entrenado sobre el corpus sintético TinyStories y solo genera historias cortas de forma incondicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo (Next-Concept Modeling), 12 bloques, anchura 768, 12 cabezas, atención en bloque diagonal, cabezas de salida atadas al codebook, más códec con encoder lookup, GroupNorm y un bloque decoder |
| Parametros totales | 88.605.707 (generador) + 36.434.816 (códec) + 4.096 (unigrama nivel 0) valores float32; 500,2 MB en decimal |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 128 posiciones de token; jerarquía de niveles 1, 8, 16, 24, 32, 40, 52, 64, 76, 92, 108, 128 |
| Tipos de cuantizacion | no disponible (la conversión es sin pérdida, no cuantización) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX): codec.safetensors, generator.safetensors, inference.safetensors, spec.json, bpe.json |

## Arquitectura y entrenamiento

NCM sustituye la decodificación autorregresiva por una generación de grueso a fino. El nivel 0 se muestrea a partir de un unigrama almacenado y, a continuación, 11 pasadas del generador predicen en paralelo cada nivel de la jerarquía de códigos latentes discretos. El generador es un transformer de 12 bloques con anchura 768, 12 cabezas de atención y atención en bloque diagonal, con cabezas de salida atadas al codebook. El códec, con 36.434.816 valores float32, consta de un encoder de lookup, GroupNorm, remuestreo aprendido del nivel 0 y un bloque decoder. Los pesos totales suman 500,2 MB, excluyendo tokenizador y metadatos.

El entrenamiento original corresponde a HazyResearch (Kumbong et al., arXiv:2610.14162) sobre el corpus TinyStories, un conjunto de historias cortas sintéticas. Esta conversión no realiza entrenamiento alguno: solo cambia el formato de fichero y el layout de tensores, de forma sin pérdida, desde la revisión upstream `d342ce8aaea58830eef3b8ad473664673e41f692`. Se descartan únicamente el estado EMA de entrenamiento y dos buffers derivados. La paridad con la implementación PyTorch de referencia está verificada: pre-tokenización BPE idéntica en 13 casos, diferencia máxima absoluta de 2,9e-6 en el embedding del códec, logits por nivel con diferencia máxima de 0,10 en escala de logit de hasta 853 (1,2e-4 relativa) y 3,2e-10 en fp64, y generación greedy idéntica en 8 de 8 muestras.

## Capacidades

- Generación de texto no autorregresiva de grueso a fino: produce un nivel completo de códigos latentes por pasada del generador.
- Generación incondicional de historias cortas con un prefijo inicial de un solo token; no hay condicionamiento por prompt del usuario.
- Descodificación intermedia por nivel mediante `--levels`, que muestra el texto acumulado tras cada nivel (puede ser incoherente y no refleja razonamiento del modelo).
- Muestreo con temperatura (por defecto 1,0) y nivel 0 extraído del unigrama almacenado.
- Tokenizador BPE de 8.192 tokens con secuencias de hasta 128 posiciones.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.
- Solo inferencia: no admite fine-tuning.

## Casos de uso

- Investigación sobre generación no autorregresiva: permite reproducir y estudiar el paradigma coarse-to-fine de NCM con paridad verificada frente a PyTorch, útil para comparar latencia y calidad frente a modelos autorregresivos en entornos controlados.
- Experimentación en Apple Silicon: el port MLX permite ejecutar el modelo en Mac con Metal GPU, con latencias p50 de 39,8 ms por lote de 1 y 519 ms por lote de 16 en un M5 Pro, lo que facilita prototipado local sin GPU dedicada.
- Docencia y divulgación de arquitecturas alternativas: el modelo, pequeño (500 MB) y con licencia MIT, sirve para explicar decodificación latente jerárquica y atención en bloque diagonal en cursos de aprendizaje automático.
- Validación de ports y conversiones de formato: los tests de paridad incluidos (BPE, embeddings, logits, greedy) sirven como referencia para verificar conversiones de checkpoints entre frameworks.
- Generación de texto sintético para pruebas de pipelines: permite producir historias cortas en inglés para pruebas de tokenización, formateo o evaluación de infraestructura, sin depender de APIs externas.
- Estudio de eficiencia en hardware consumer: al caber en memoria unificada de Mac, permite medir throughput y latencia de una arquitectura no autorregresiva frente a alternativas token a token en el mismo equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, perplejidad generativa) en la información disponible. El autor indica explícitamente que el protocolo de perplejidad generativa de upstream no se reproduce y que la fluidez y coherencia no quedan establecidas por los tests de paridad.

Sí se publican mediciones de latencia y paridad técnica:

| Medición | Resultado |
|---|---|
| Pre-tokenización BPE, ids y round trip (13 casos) | idénticos |
| Embedding del códec, diferencia máxima absoluta | 2,9e-6 |
| Códigos del códec desde entradas reales | 97,4-100% por nivel (cascadas de casi-empate) |
| Logits por nivel, fp32, diferencia máxima absoluta | 0,10 (escala de logit hasta 853; 1,2e-4 relativa) |
| Logits por nivel, fp64 exacto | 3,2e-10 |
| Generación greedy, códigos y texto descodificado | idénticos, 8/8 muestras |

| Latencia p50 / p95 (ms) | Lote 1 | Lote 16 |
|---|---:|---:|
| MLX, Metal GPU (M5 Pro, 64 GB) | 39,8 / 40,8 | 519 / 742 |
| PyTorch upstream, CPU | 280 / 290 | 3.883 / 4.076 |

Estas cifras comparan Metal GPU con CPU, no implementaciones equivalentes en acelerador, y usan la ruta eager de referencia sin caché de prefijo ni compilación; no miden una aceleración puramente arquitectónica.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad que permitan una comparación rigurosa con alternativas. A continuación se comparan características estructurales con modelos pequeños de generación de texto en inglés:

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Formato |
|---|---|---|---|---|---|
| NCM TinyStories MLX | ~125 M (generador + códec) | 128 posiciones | No autorregresivo, coarse-to-fine | MIT | safetensors MLX |
| GPT-2 small | 124 M | 1.024 tokens | Autorregresivo | MIT | safetensors, GGUF |
| TinyLlama 1.1B | 1.100 M | 2.048 tokens | Autorregresivo | Apache 2.0 | safetensors, GGUF |
| SmolLM-135M | 135 M | 2.048 tokens | Autorregresivo | Apache 2.0 | safetensors, GGUF |

La comparación de rendimiento de calidad no está disponible; los tres modelos autorregresivos cuentan con evaluación publicada en benchmarks estándar, mientras que NCM TinyStories no.

## Limitaciones y advertencias

- Solo inferencia: no admite fine-tuning ni ajuste posterior.
- Entrenado para historias cortas sintéticas; la fluidez y coherencia no están establecidas por los tests de paridad.
- Sin seguimiento de instrucciones ni interfaz de chat de producción.
- Generación incondicional con prefijo de un token; no acepta prompts del usuario como condicionamiento.
- El protocolo de perplejidad generativa de upstream no se reproduce en esta conversión.
- El texto intermedio mostrado con `--levels` puede ser incoherente y no es una traza de razonamiento del modelo.
- Los resultados con muestreo (no greedy) usan el RNG de MLX y no coinciden muestra a muestra con upstream.
- Solo inglés; sin capacidades multilingües.
- No es un checkpoint de Transformers (`AutoModelForCausalLM`) ni de `mlx_lm`; requiere `ncm_mlx.official`.
- Las mediciones de velocidad establecen comportamiento en Apple Silicon y CPU; la configuración en Linux CUDA está documentada pero no medida con estos checkpoints.
- Riesgo de sesgos y alucinaciones no evaluado en la información disponible; al ser datos sintéticos, la distribución es limitada y poco representativa del lenguaje real.
- Licencia MIT permite uso comercial, pero la idoneidad para producción no está demostrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/janmusic/ncm-tinystories-mlx
- Checkpoints originales de HazyResearch: https://huggingface.co/hazyresearch/ncm-checkpoints
- Código original de NCM: https://github.com/HazyResearch/ncm
- Port MLX independiente: https://github.com/janmus1c/ncm-mlx
- Documentación de checkpoints oficiales en MLX: https://github.com/janmus1c/ncm-mlx/blob/main/docs/official-checkpoints.md
- Documentación de plataformas: https://janmus1c.github.io/ncm-mlx/platforms/
- Demo Space con trazas de refinamiento: https://huggingface.co/spaces/janmusic/ncm-refinement-demo
- Paper: Kumbong et al., arXiv:2610.14162 — https://arxiv.org/abs/2610.14162
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
