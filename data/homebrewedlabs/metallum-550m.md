# HomeBrewedLabs/metallum-550m

## Resumen

Metallum-550M es un modelo de lenguaje de 550,3 millones de parámetros, de tipo decoder-only, desarrollado por HomeBrewedLabs como primera generación de su especialista en ingeniería de ML/LLM, bajo el nombre en clave MetaLLM-V3. Es un artefacto de reproducibilidad y archivo que precede a Metallum-1B, y se publica con licencia Apache-2.0. El modelo está preentrenado desde inicialización aleatoria en una única RTX 5090, seguido de un ajuste fino supervisado (SFT) de recuperación, SFT de instrucciones y una ronda acotada de ReST-EM sobre código. Su diseño es deliberadamente estrecho: no es un chatbot general, sino una herramienta para experimentos de ingeniería de ML, continuación técnica y investigación en recuperación.

Arquitectónicamente, emplea 28 capas, atención por grupos de consultas (GQA) con 20 cabezas de consulta y 10 de clave/valor, normalización QK por cabeza, capas intercaladas sin codificación posicional (NoPE) cada cuatro capas, y una ventana de contexto nativa de 2.048 tokens. El peso exacto es de 550.251.264 parámetros, en formato bfloat16. Requiere `trust_remote_code=True` para cargarse, ya que la implementación de Llama estándar no incluye sus capas NoPE ni la normalización QK.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer con GQA, SwiGLU, RMSNorm, QK normalization, capas NoPE intercaladas |
| Parametros totales | 550.251.264 (550,3M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (nativa) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 28 capas, tamaño oculto de 1.280, atención GQA (20 cabezas de consulta, 10 de clave/valor), SwiGLU con tamaño intermedio de 3.456, y normalización RMSNorm tanto pre-normalización como por cabeza QK. Usa RoPE con theta 500.000, y cada cuarta capa omite la codificación posicional (capas NoPE intercaladas) para tareas de recuperación. Los embeddings son BPE a nivel de byte, atados, con un vocabulario de 32.000 tokens. El contexto nativo es de 2.048 tokens.

El preentrenamiento consumió 4.000 millones de tokens. El paquete de muestreo estable contiene 2.272 millones de tokens empaquetados: 1.351 millones de código (59,5%), 866,7 millones de texto de arXiv de ML (38,2%) y 54,4 millones de texto técnico sintético (2,4%). El 10% final usó un paquete de decaimiento de calidad de 880,9 millones de tokens con texto de arXiv de ML, código ML de mayor puntuación y texto técnico sintético. Los recuentos incluyen remuestreo intencional, no son recuentos de texto único. El post-entrenamiento añadió ejemplos sintéticos de recuperación, ejemplos de instrucción derivados de un profesor y ejemplos ReST-EM verificados por ejecución, con repetición de recuperación y capacidades. Las fuentes incluyen el corpus `the-stack-dedup` de BigCode, artículos de arXiv de ML y material sintético/derivado de profesor.

## Capacidades

- Generación de texto técnico y continuación de código ML/PyTorch, con fluidez en dominios de ingeniería de modelos.
- Recuperación de información dentro de la ventana de contexto: el modelo obtiene 88/90 (0,978) en una suite estilo RULER a 1.024 y 2.048 tokens, y 778/800 (0,973) en una suite sintética de aguja.
- Subconjunto de passkey: 499/500 (0,998) y subconjunto clave-valor: 279/300 (0,930) en la suite sintética de aguja.
- Conocimiento de ML medido mediante cloze: 0,416 de precisión normalizada en 250 preguntas de opción múltiple.
- No soporta tool calling, ni visión, ni audio, ni modo de pensamiento explícito.
- No tiene plantilla de chat; se usa con indicaciones de texto plano o continuación.

## Casos de uso

- Reproducción de experimentos de arquitecturas NoPE y normalización QK: el modelo es un artefacto de archivo que permite a investigadores replicar los resultados de la primera generación Metallum y estudiar el efecto de capas sin codificación posicional en tareas de recuperación.
- Investigación en recuperación de contexto largo: con su ventana de 2.048 tokens y capas NoPE, es adecuado para experimentos controlados de búsqueda de agujas y evaluación de memoria a corto plazo.
- Generación de código ML en dominios específicos: puede continuar fragmentos de código PyTorch o esqueletos de entrenamiento, aunque su rendimiento en código general es bajo (MBPP 0%).
- Estudio de modelos pequeños especializados: sirve como banco de pruebas para analizar cómo un modelo de 550M con entrenamiento dirigido se comporta en tareas técnicas frente a modelos generalistas de tamaño similar.
- Evaluación de protocolos de selección de checkpoints: al ser un modelo con resultados "selection-aware", es útil para investigar metodologías de evaluación y sesgos de selección en el desarrollo de modelos.
- Comparación de técnicas de post-entrenamiento: su pipeline de SFT de recuperación, SFT de instrucciones y ReST-EM puede servir como referencia para estudiar el impacto de cada etapa en modelos pequeños.

## Benchmarks y rendimiento

Los resultados publicados pertenecen al checkpoint exacto `ckpt_500m_v3_restem_r1/sft_step_000250.pt`:

| Capacidad | Evaluación | Resultado |
|---|---|---|
| Conocimiento de ML | 250 preguntas cloze MCQ, precisión normalizada | 0,416 |
| Unión letra-respuesta | Mismo conjunto de 250 preguntas, formato MCF | 0,236 |
| Código ML in-domain | Suite interna de 40 tareas ejecutables, pass@1 | 10/40 (0,250) |
| Recuperación | Suite estilo RULER a 1.024 y 2.048 tokens | 88/90 (0,978) |
| Recuperación | Suite sintética de aguja | 778/800 (0,973) |
| Subconjunto passkey | Suite sintética de aguja | 499/500 (0,998) |
| Subconjunto clave-valor | Suite sintética de aguja | 279/300 (0,930) |
| Código general | MBPP, pass@8 | 0,000 |

En el mismo arnés interno de cloze, la campaña registró 0,280 para Qwen2.5-1.5B y 0,312 para SmolLM2-1.7B. Estas comparaciones son mediciones estrechas y dentro del dominio, no clasificaciones generales de modelos. Todas las suites internas se usaron durante el desarrollo y la selección de checkpoints, por lo que los resultados son "selection-aware" y deben tratarse como registros de reproducibilidad, no como estimaciones finales ciegas.

## Requisitos de hardware

- VRAM estimada: el modelo en bfloat16 ocupa aproximadamente 1,1 GB (tamaño del repositorio). Con overhead de inferencia, se puede ejecutar en GPUs con 4 GB de VRAM o más. En float32, el uso de memoria sería de unos 2,2 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) o GPUs de datacenter como A100 o H100. El preentrenamiento se realizó en una RTX 5090.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y alta.
- Opciones de despliegue: el shim de inferencia incluido en el repositorio requiere `trust_remote_code=True` y no implementa caché KV, por lo que la generación es más lenta que en modelos con decodificación cacheada. No se menciona compatibilidad con vLLM, llama.cpp u Ollama; se recomienda usar el código incluido o adaptar la arquitectura a un framework que soporte capas NoPE y normalización QK.
- Latencia y throughput: no disponible. El shim sin caché KV recalcula el prefijo en cada paso, lo que incrementa la latencia proporcionalmente a la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento en cloze ML (interno) | Notas |
|---|---|---|---|---|---|
| Metallum-550M | 550,3M | 2.048 | Apache-2.0 | 0,416 | Especialista en ML, capas NoPE, sin alineación |
| Qwen2.5-1.5B | 1,5B | 32.768 (típico) | Apache-2.0 | 0,280 | Modelo generalista, más grande, con chat |
| SmolLM2-1.7B | 1,7B | 2.048 (típico) | Apache-2.0 | 0,312 | Modelo pequeño generalista, orientado a dispositivos |
| Metallum-1B | ~1B | No disponible | Apache-2.0 | No disponible | Sucesor con protocolo de holdout sellado y refuerzo de estructura JSON |

La comparación es limitada porque los modelos de referencia son de mayor tamaño y propósito general. Metallum-550M supera a ambos en la tarea interna de cloze de ML, pero es muy inferior en código general (MBPP 0% frente a resultados típicos de modelos generalistas). No se dispone de comparaciones directas en otras tareas estándar.

## Limitaciones y advertencias

- No es un chatbot general y no tiene alineamiento de preferencias ni de seguridad. No debe usarse en sistemas de atención al cliente, asistencia general o decisiones críticas.
- La generación libre es fluida pero puede cometer errores factuales locales; es necesario verificar las afirmaciones técnicas.
- El conocimiento medido mediante cloze no se transfiere de forma fiable a la salida de letras de respuesta (0,236 en formato MCF frente a 0,416 en cloze).
- El código general es débil: MBPP pass@8 es 0%. No es adecuado para generación de código en producción.
- La ventana de contexto nativa es de 2.048 tokens; los resultados de recuperación no establecen comportamiento más allá de ese límite.
- El shim de inferencia no implementa caché KV, lo que hace la generación más lenta que en modelos comparables con decodificación cacheada.
- `attention_mask` se acepta por compatibilidad de API, pero la inferencia por lotes con padding no formó parte de la ruta de evaluación publicada. Se recomienda inferencia sin padding o con secuencias de igual longitud.
- Los resultados de evaluación son "selection-aware" porque las suites se usaron durante el desarrollo; no son estimaciones ciegas finales.
- La licencia Apache-2.0 cubre los pesos y el código del repositorio, pero no relicencia los datos de entrenamiento de fuentes externas (código de `the-stack-dedup`, artículos de arXiv, etc.). Consultar el archivo `NOTICE` para la divulgación de procedencia.
- Requiere `trust_remote_code=True`; se recomienda fijar una revisión del repositorio e inspeccionar los archivos Python incluidos antes de habilitar código remoto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HomeBrewedLabs/metallum-550m
- Modelo sucesor Metallum-1B: https://huggingface.co/HomeBrewedLabs/metallum-1b
- Búsqueda de modelos con tag metallm: https://huggingface.co/models?other=metallm
