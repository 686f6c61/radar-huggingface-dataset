# iamtatsuki05/Llama-JP-1B-init

## Resumen

Llama-JP-1B-init es un checkpoint de Llama con inicialización aleatoria publicado por el usuario iamtatsuki05 dentro del proyecto MIREI, cuyo objetivo es comparar arquitecturas encoder y decoder bajo condiciones de entrenamiento idénticas para analizar su rendimiento en tareas de embeddings de frases en japonés. El modelo reutiliza la configuración y el tokenizador de sbintuitions/sarashina2.2-1b, un modelo japonés de referencia, pero no ha recibido ningún entrenamiento: sus pesos son aleatorios y no genera texto coherente.

Su relevancia es acotada y muy específica: sirve como punto de partida reproducible para preentrenamiento desde cero sobre corpus japoneses, y como pieza de control en un estudio académico presentado en la conferencia NLP2026 de la Asociación de Procesamiento del Lenguaje de Japón. No es un modelo utilizable en producción ni para inferencia directa.

Arquitectónicamente es un transformer decoder de tipo Llama con 1.224 millones de parámetros (sin embeddings), dimensión de embedding de 1792, codificación posicional RoPE, longitud máxima de secuencia de 8192 tokens y tokenizador SentencePiece con vocabulario de 102.400 entradas. La licencia MIT facilita su reutilización como base de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder) |
| Parametros totales | 1.407.538.944 (según safetensors); 1.224M según la model card (excluyendo embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensión de embedding | 1.792 |
| Tokenizador | SentencePiece, vocabulario de 102.400 |
| Codificación posicional | RoPE |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Llama estándar: un transformer decoder con atención causal, normalización RMSNorm, activaciones SwiGLU y codificación posicional RoPE. La configuración y el tokenizador se heredan íntegramente de sbintuitions/sarashina2.2-1b, de modo que cualquier comparación con dicho modelo queda controlada por el tokenizador y la geometría de la red. La dimensión de embedding es 1792 y la ventana de contexto alcanza los 8192 tokens.

No ha habido entrenamiento alguno: los pesos están inicializados de forma aleatoria. No existen datos sobre número de tokens de preentrenamiento, composición del corpus, fases de RLHF, DPO o ajuste supervisado, porque el checkpoint es precisamente el punto de partida previo a cualquier fase de entrenamiento. La model card indica explícitamente que es «a starting point for pre-training, not a usable model». El autor cita como requisitos transformers>=4.51.0, accelerate>=1.6.0, sentencepiece>=0.2.0 y flash-attn>=2.7.3.

## Capacidades

- Generación de texto: no disponible de forma funcional, ya que los pesos son aleatorios y la salida no es coherente.
- Razonamiento, matemáticas y código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: únicamente japonés declarado; sin entrenamiento no hay competencia lingüística real.
- Capacidad especial: sirve como inicialización reproducible para preentrenamiento y como control experimental en estudios comparativos de arquitecturas.

## Casos de uso

- Preentrenamiento desde cero en japonés: el checkpoint proporciona pesos iniciales aleatorios con la configuración y el tokenizador de sarashina2.2-1b, lo que permite lanzar un pipeline de preentrenamiento sin tener que definir la geometría del modelo ni entrenar el tokenizador.
- Estudio comparativo encoder vs. decoder: el proyecto MIREI lo emplea junto a ModernBERT-JP-1B-init para medir el rendimiento en embeddings de frases bajo condiciones idénticas de datos y presupuesto de cómputo.
- Reproducibilidad de experimentos académicos: al compartir tokenizador con sarashina2.2, facilita comparaciones controladas frente a modelos japoneses ya entrenados.
- Base para investigación en tokenización japonesa: el vocabulario de 102.400 entradas de SentencePiece permite analizar el efecto de la fragmentación sobre corpus japoneses en fases tempranas de entrenamiento.
- Desarrollo de recetas de entrenamiento: útil para validar configuraciones de FlashAttention 2, precisión bfloat16, device_map y paralelismo antes de escalar a modelos mayores.
- Docencia y formación: ejemplo práctico de inicialización de un transformer decoder y de los requisitos de un pipeline de preentrenamiento en transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un checkpoint sin entrenamiento, cualquier métrica de calidad lingüística sería equivalente a la de una inicialización aleatoria.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, más memoria para activaciones y caché KV, que con 8192 tokens de contexto puede añadir varios GB según el batch.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 con batch pequeño; A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares; también en GPUs con 8 GB aplicando cuantización, aunque no se documentan formatos de cuantización soportados.
- Opciones de despliegue: transformers con accelerate y flash-attn 2 (configuración documentada por el autor), text-generation-inference por los tags del repo; llama.cpp, Ollama o vLLM no están documentados para este checkpoint concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| iamtatsuki05/Llama-JP-1B-init | Llama | 1.224M (sin emb.) | 8.192 | No (aleatorio) | MIT | Hugging Face |
| sbintuitions/sarashina2.2-1b | Llama | ~1B | no disponible en la información proporcionada | Sí (japonés) | no disponible en la información proporcionada | Hugging Face |
| iamtatsuki05/ModernBERT-JP-1B-init | ModernBERT | 1.304M (1.120M sin emb.) | no disponible en la información proporcionada | No (aleatorio) | MIT | Hugging Face |

La comparación relevante es con sarashina2.2-1b, del que hereda configuración y tokenizador, y con ModernBERT-JP-1B-init, su contraparte encoder del mismo proyecto MIREI.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado; cualquier salida es ruido estadístico y no debe interpretarse como texto generado.
- No apto para producción: no debe desplegarse en aplicaciones de atención al cliente, generación de código ni ningún uso final.
- Idiomas: solo se declara japonés; no hay evidencia de competencia en otros idiomas al no existir entrenamiento.
- Sesgos: no evaluables, al no haber datos de entrenamiento que los introduzcan; el sesgo provendría en todo caso del corpus que se use en el preentrenamiento posterior.
- Alucinación: no aplica en el sentido habitual, ya que no hay conocimiento factual almacenado.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el usuario debe asumir la responsabilidad de entrenar el modelo y evaluar los sesgos resultantes.
- Requisitos de versión: transformers>=4.51.0 y flash-attn>=2.7.3 son necesarios según el autor; versiones anteriores pueden fallar al cargar la configuración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Llama-JP-1B-init
- Colección MIREI en Hugging Face: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub del proyecto MIREI: https://github.com/iamtatsuki05/MIREI
- Modelo base de configuración y tokenizador: https://huggingface.co/sbintuitions/sarashina2.2-1b
- Colección del tokenizador sarashina2.2: https://huggingface.co/collections/sbintuitions/sarashina22
- Contraparte encoder: https://huggingface.co/iamtatsuki05/ModernBERT-JP-1B-init
- Licencia MIT: https://opensource.org/license/mit/
