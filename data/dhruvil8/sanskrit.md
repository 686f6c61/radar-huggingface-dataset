# Dhruvil8/Sanskrit

## Resumen

Sanskrit es un modelo de lenguaje autoregresivo de tipo decoder-only, con arquitectura de estilo LLaMA, desarrollado por el usuario Dhruvil8 y publicado en Hugging Face. Cuenta con 304 millones de parámetros y fue entrenado desde cero sobre literatura sánscrita clásica en escritura devanagari. Se trata de un modelo base (no ajustado por instrucciones) concebido como experimento de investigación en lingüística computacional, cuyo objetivo es estudiar cómo las arquitecturas neuronales modernas aprenden gramática sánscrita, reglas de sandhi y métrica poética.

El entrenamiento se realizó íntegramente en Google Cloud TPU v5e-8, con un volumen total de 1.310 millones de tokens durante 10 épocas y 11.444 pasos de optimización. La longitud de contexto es de 2.048 tokens y el vocabulario, de 32.000 piezas, está construido específicamente para devanagari mediante SentencePiece Unigram. El modelo alcanzó una perplejidad final de 5,32 (pérdida de 1,6718) partiendo de 38.443,53, lo que indica una convergencia estable sobre su corpus de entrenamiento.

Su relevancia actual es acotada pero clara: es un recurso abierto, con licencia Apache 2.0, para una lengua clásica con muy pocos modelos fundacionales públicos, y publica arquitectura, tokenizador, curvas de pérdida y código de entrenamiento para reproducibilidad científica. No obstante, el propio autor lo delimita explícitamente como experimento académico y advierte de que los versos generados son completaciones estadísticas, no escritura auténtica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo LLaMA |
| Parámetros totales | 304.140.288 según los pesos safetensors publicados; la model card declara 304.332.800 (~304M) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible: solo se publican pesos sin cuantizar en safetensors; no hay versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | Sánscrito (código ISO `sa`), en escritura devanagari |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`model.safetensors`, 1,16 GB) |
| Capas | 24 bloques transformer |
| Dimensión oculta | 1.024 |
| Dimensión intermedia | 4.096 (SwiGLU) |
| Atención | Grouped Query Attention (16 cabezas de consulta, 4 cabezas KV) |
| Embeddings posicionales | RoPE con theta = 50.000 |
| Normalización | RMSNorm con epsilon = 1e-5 |
| Vocabulario | 32.000 tokens (SentencePiece Unigram para devanagari) |
| Hardware de entrenamiento | Google Cloud TPU v5e-8 |
| Volumen de entrenamiento | 1.310 millones de tokens, 10 épocas, 11.444 pasos de optimizador |
| Tamaño del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

El modelo sigue el patrón estándar de los transformers decoder-only modernos: 24 bloques con atención causal, Grouped Query Attention de 16 cabezas de consulta y 4 cabezas de clave/valor (ratio 4:1, lo que reduce el coste de la caché KV), SwiGLU como función de activación en la red feed-forward, RMSNorm para la normalización y embeddings posicionales rotatorios (RoPE) con theta configurado en 50.000. La dimensión oculta es de 1.024 y la intermedia de 4.096, con un tokenizador SentencePiece Unigram entrenado específicamente sobre devanagari que cubre el vocabulario con 32.000 piezas.

El entrenamiento se llevó a cabo desde cero, sin inicialización a partir de un modelo existente, sobre un corpus personalizado de literatura sánscrita clásica, con 1.310 millones de tokens procesados en 10 épocas completas. La convergencia fue progresiva: la pérdida cayó de 10,5569 a 1,6718 y la perplejidad de 38.443,53 a 5,32, con un rendimiento de aproximadamente 121.000 tokens por segundo sobre TPU v5e-8. No se documenta en la información disponible ninguna fase de ajuste por instrucciones, RLHF, DPO ni alineación posterior al preentrenamiento, por lo que se trata de un modelo estrictamente base. Tampoco se detalla la composición exacta del dataset más allá de su carácter clásico y en devanagari.

## Capacidades

- Generación de texto autoregresiva en sánscrito con escritura devanagari, incluyendo la continuación de versos a partir de un prompt.
- Modelado de fenómenos fonológicos y morfológicos del sánscrito clásico: reglas de sandhi y patrones de métrica poética, que el autor señala como objeto central del experimento.
- Tokenización nativa de devanagari mediante un vocabulario SentencePiece Unigram de 32.000 piezas, sin transliteración a alfabeto latino.
- Extracción de representaciones internas (hidden states) potencialmente útiles como embeddings para tareas lingüísticas posteriores: etiquetado morfológico, análisis sintáctico o segmentación de compuestos.
- Inferencia configurable con muestreo: temperatura, top-p y penalización por repetición, tal como se muestra en el ejemplo de la model card.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso con planificación.
- No soporta visión, audio ni otras modalidades.
- No es multilingüe: la única lengua declarada es el sánscrito (`sa`).
- No dispone de modo de razonamiento explícito ni de "thinking mode".

## Casos de uso

- Investigación en lingüística computacional sobre sánscrito clásico: el modelo permite estudiar qué estructuras gramaticales y reglas de sandhi logra internalizar una arquitectura transformer de 304M entrenada desde cero con 1.310 millones de tokens, y comparar ese aprendizaje con descripciones gramaticales tradicionales.
- Modelo de referencia para calcular perplejidad sobre corpus sánscritos: sirve como línea base cuantitativa (perplejidad final de 5,32 sobre su propio corpus) para evaluar la dificultad relativa de distintos subcorpus o géneros literarios.
- Aumento de datos y generación de corpus sintéticos: al ser un modelo base entrenado solo en devanagari clásico, puede generar texto de estilo similar al corpus para experimentos de data augmentation en tareas de etiquetado, siempre con revisión humana.
- Punto de partida para ajuste fino supervisado: con licencia Apache 2.0 y pesos safetensors, es viable reentrenar las capas finales para tareas concretas como etiquetado gramatical, segmentación de compuestos (samasa) o identificación de metros, partiendo de un modelo que ya modela la lengua.
- Experimentos de análisis de métrica poética: dado un prompt en forma de verso, el modelo puede completar la estrofa, lo que permite estudiar si reproduce patrones métricos consistentes en las continuaciones generadas.
- Demostraciones educativas e interactivas: el autor publica un Space en Hugging Face donde se puede probar la generación de versos, útil para ilustrar en clase qué hace y qué no hace un modelo de lenguaje entrenado sobre una lengua clásica.
- Normalización y estudio de texto devanagari: el tokenizador Unigram específico permite analizar cómo se segmenta el sánscrito en unidades subpalabra, información aprovechable en pipelines de digitalización de manuscritos.
- Investigación sobre reproducibilidad en entrenamiento en TPU: al publicar el código, la configuración y las curvas de pérdida, el proyecto sirve como caso de estudio de un pipeline completo de preentrenamiento a pequeña escala (304M) en TPU v5e-8.

## Benchmarks y rendimiento

El `model-index` de la model card está vacío (`results: []`), por lo que no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. Los únicos datos cuantitativos publicados son métricas de convergencia del propio entrenamiento:

| Métrica | Valor inicial | Valor final |
|---|---|---|
| Pérdida (loss) | 10,5569 | 1,6718 |
| Perplejidad | 38.443,53 | 5,32 |
| Pasos de optimizador | — | 11.444 (10 épocas) |
| Throughput de entrenamiento | — | ~121.000 tokens/s en TPU v5e-8 |

No se proporcionan comparaciones con otros modelos ni resultados sobre conjuntos de evaluación independientes.

## Requisitos de hardware

- Pesos en el formato publicado: el fichero `model.safetensors` ocupa 1,16 GB, coherente con pesos en fp32 (304M × 4 bytes ≈ 1,22 GB).
- VRAM estimada para inferencia en fp32: del orden de 2 GB, sumando pesos, activaciones y overhead del framework (estimación derivada del tamaño del modelo, no un dato publicado por el autor).
- VRAM estimada si se convierte a fp16/bf16: del orden de 0,6-1 GB de pesos, más el overhead del entorno de ejecución.
- Caché KV: con 24 capas, 4 cabezas KV y dimensión de cabeza de 64 (1.024 / 16), la caché en fp16 ocupa aproximadamente 24 KB por token, es decir, unos 50 MB en el contexto máximo de 2.048 tokens.
- GPU recomendadas: no hay recomendación oficial del autor. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM es suficiente; cabría en tarjetas de gama de entrada como GTX 1650, RTX 3050 o superiores, así como en RTX 3060/4060/4090 sin aprovechar su capacidad.
- Inferencia en CPU: viable por el reducido tamaño del modelo, con latencias mayores que en GPU.
- Hardware de entrenamiento original: Google Cloud TPU v5e-8.
- Opciones de despliegue: no se publican pesos en GGUF, por lo que llama.cpp y Ollama no funcionan directamente sin una conversión previa. vLLM y TGI tampoco soportan de serie la arquitectura personalizada; la carga requiere el código propio del repositorio (`model.py`, `SanskritConfig`) junto con `safetensors` y `sentencepiece`, tal como muestra el ejemplo de la model card.
- Latencia y throughput de inferencia: no disponible; el único dato de rendimiento publicado (121.000 tokens/s) corresponde al entrenamiento en TPU v5e-8, no a la inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye ningún modelo comparable con datos verificables, y la búsqueda web asociada no devolvió resultados relevantes sobre modelos de sánscrito (los resultados obtenidos corresponden a la plataforma francesa de certificación de competencias digitales Pix, sin relación con el modelo). No se dispone por tanto de cifras de parámetros, contexto, rendimiento o licencia de alternativas con las que contrastar.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dhruvil8/Sanskrit | ~304M | 2.048 tokens | Apache 2.0 | Pesos safetensors en Hugging Face |
| Alternativas comparables de la misma categoría | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los versos generados son completaciones estadísticas y no escritura auténtica; el autor indica explícitamente que el modelo no debe usarse como autoridad religiosa ni para instrucción tradicional.
- Riesgo de alucinación: al ser un modelo base sin alineación, puede producir secuencias gramaticalmente plausibles pero sin sentido, con contenido inventado o atribuciones falsas a textos clásicos.
- Ausencia de ajuste por instrucciones, RLHF o DPO: no sigue instrucciones de forma fiable y no está calibrado para tareas conversacionales.
- Contexto limitado a 2.048 tokens, insuficiente para analizar textos largos o mantener conversaciones multi-turno extensas.
- Modelo monolingüe: solo sánscrito en devanagari; no comprende ni genera castellano, inglés ni otras lenguas.
- Corpus de entrenamiento reducido (1.310 millones de tokens en 10 épocas), lo que implica riesgo de sobreajuste al estilo y al vocabulario del corpus concreto y poca diversidad de registro.
- Sin resultados de benchmarks independientes publicados: el rendimiento real fuera del corpus de entrenamiento es desconocido.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe evidencia externa de calidad ni de reproducibilidad por terceros.
- Licencia Apache 2.0, que permite uso comercial y modificación, pero el autor enmarca el modelo como experimento de investigación en lingüística computacional; conviene evaluar el riesgo reputacional de presentar sus salidas como texto sánscrito auténtico.
- La carga requiere código Python propio del repositorio, lo que implica ejecutar código de terceros; en producción debe auditarse y aislarse.
- No hay versiones cuantizadas ni compatibilidad directa con llama.cpp, Ollama, vLLM o TGI, lo que añade trabajo de integración antes de un despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dhruvil8/Sanskrit
- Demo interactiva (Hugging Face Spaces): https://huggingface.co/spaces/Dhruvil8/Sanskrit
- Repositorio de código y suite de entrenamiento (GitHub): https://github.com/Dhruvil-8/Sanskrit
- Curvas de pérdida y perplejidad: https://huggingface.co/Dhruvil8/Sanskrit/resolve/main/loss_curves.png
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Resultados de la búsqueda web: sin enlaces relevantes para este modelo (los resultados obtenidos corresponden a pix.fr y pix.org, plataformas de certificación de competencias digitales sin relación con el proyecto).
