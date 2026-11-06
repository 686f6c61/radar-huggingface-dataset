# athenista/slm-tavenel-124m

## Resumen

SLM-Tavenel 124M es un modelo de lenguaje de tipo base, entrenado desde cero por el usuario athenista y publicado como artefacto de investigación asociado al experimento EXP-0036. Se trata de un decoder transformer de 124.038.144 parámetros totales (95.726.592 sin contar los embeddings del tokenizador), con 27 capas, anchura 576 y una ventana de contexto de 2.048 tokens. No está ajustado por instrucciones ni diseñado como asistente conversacional: su propósito es servir como banco de pruebas reproducible frente a GPT-2 Small.

Su relevancia es metodológica más que de producto. El autor publica un manifiesto de corpus con ficheros fuente fijados por hash, filtros, descontaminación de benchmarks y divisiones de entrenamiento, junto con el registro completo del experimento. Además, reporta una comparación emparejada contra GPT-2 Small en seis tareas con intervalos bootstrap y pruebas de McNemar, y declara explícitamente que el criterio preregistrado de victoria global no se cumplió.

El modelo está pensado para inglés y francés, emplea el tokenizador de SmolLM2 (49.152 tokens) y se distribuye bajo licencia MIT en safetensors float32. Requiere `trust_remote_code=True` porque la arquitectura es personalizada y no implementa caché KV, lo que penaliza la velocidad de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer causal con pre-RMSNorm, GQA, normalización QK, RoPE, puerta sigmoide por cabeza de atención y MLP SwiGLU |
| Parametros totales | 124.038.144 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (el paquete se publica en float32 safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés y francés |
| Licencia | MIT |
| Formato de pesos | safetensors (float32), con código de modelado personalizado en Transformers |

Datos adicionales de arquitectura: 27 capas, anchura 576, 9 cabezas de consulta y 3 cabezas clave/valor, MLP de anchura 1.536, tokenizador SmolLM2 de 49.152 tokens con embeddings de entrada y salida atados.

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 27 capas con atención causal de consultas agrupadas (9 cabezas Q, 3 cabezas KV), normalización aplicada a Q y K, embeddings posicionales rotatorios (RoPE) y una puerta sigmoide independiente por cabeza de atención. La subcapa feed-forward usa SwiGLU con anchura 1.536 y conexiones residuales, con pre-RMSNorm. Los embeddings de entrada y salida están atados, lo que reduce el recuento efectivo de parámetros no relacionados con el vocabulario a 95.726.592.

El entrenamiento se realizó desde cero con el optimizador Muon, semilla 20261031, 15.000 actualizaciones y 983.040.000 posiciones de token procesadas. El corpus se construyó a partir de subconjuntos fijados de FineWeb-Edu (páginas web inglesas con puntuación educativa) y FineWeb2-HQ (páginas francesas filtradas por calidad), con un manifiesto que registra hashes de los ficheros fuente, filtros aplicados, recuentos, descontaminación por 13-gramas exactos contra benchmarks y hashes de las divisiones. No se documenta RLHF, DPO ni ajuste por instrucciones de ningún tipo. La implementación publicada no incluye caché KV, por lo que la generación autoregresiva recalcula el prefijo en cada paso.

## Capacidades

- Generación de texto autoregresiva en inglés y francés como modelo base, sin alineación conversacional.
- Continuación de texto y modelado de lenguaje puro: el caso de uso natural es la evaluación de probabilidad y la generación condicionada por prefijo.
- Respuesta a tareas de elección múltiple mediante puntuación de log-verosimilitud, que es exactamente el protocolo con el que se evaluó (ARC-Easy, ARC-Challenge, HellaSwag, Belebele EN/FR, WinoGrande).
- Comprensión lectora básica y razonamiento de sentido común en inglés, con rendimiento cercano a GPT-2 Small.
- Capacidad multilingüe limitada a inglés y francés, evaluada con Belebele en ambos idiomas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, visión ni audio. No es un modelo Instruct y no debe usarse como asistente.

## Casos de uso

- Reproducción de experimentos de entrenamiento desde cero: el paquete incluye configuración, manifiesto de corpus, registro de métricas y log de evaluación, lo que permite auditar y replicar el pipeline con las mismas fuentes fijadas por hash.
- Línea base de comparación en investigación de modelos pequeños: sirve como referencia de 124M parámetros con tokenizador moderno (SmolLM2) para contrastar arquitecturas alternativas bajo el mismo evaluador de seis tareas.
- Estudio de arquitecturas con atención de consultas agrupadas y puertas por cabeza: al ser código personalizado y legible, es útil para analizar el efecto de la normalización QK y la puerta sigmoide en modelos de escala reducida.
- Evaluación de modelado de lenguaje en francés: permite medir bits por byte en un split de test propio (1,040 en francés) y comparar con otras alternativas entrenadas sobre FineWeb2-HQ.
- Docencia y prácticas de NLP: el tamaño de 0,5 GB del repositorio y los 124M de parámetros permiten ejecutar inferencia en CPU para demostraciones de tokenización, generación greedy y cálculo de perplejidad.
- Auditoría de descontaminación de benchmarks: el manifiesto de corpus documenta el proceso de eliminación por 13-gramas exactos, lo que lo convierte en un caso de estudio sobre trazabilidad de datos y sus límites frente a paráfrasis y traducciones.
- Investigación sobre calibración y evaluación estadística: los intervalos bootstrap emparejados y las pruebas de McNemar publicados sirven como plantilla para reportar comparaciones honestas entre checkpoints pequeños.

## Benchmarks y rendimiento

Resultados de precisión en elección múltiple sobre los mismos ítems fijados para ambos checkpoints, con intervalos bootstrap emparejados al 95% sobre ítems (10.000 remuestreos):

| Tarea | Ítems | GPT-2 124M | SLM-Tavenel 124M | Diferencia, intervalo 95% |
|---|---:|---:|---:|---|
| ARC-Easy | 2.376 | 0,447 | 0,484 | +0,036 [+0,018, +0,055] |
| ARC-Challenge | 1.172 | 0,185 | 0,206 | +0,021 [0,000, +0,044] |
| HellaSwag | 10.042 | 0,292 | 0,277 | −0,015 [−0,021, −0,010] |
| Belebele EN | 900 | 0,310 | 0,316 | +0,006 [−0,021, +0,032] |
| Belebele FR | 900 | 0,318 | 0,311 | −0,007 [−0,038, +0,024] |
| WinoGrande | 1.267 | 0,517 | 0,519 | +0,002 [−0,030, +0,036] |
| Media de seis tareas | — | 0,345 | 0,352 | +0,007 [−0,003, +0,017] |

HellaSwag normalizado por longitud: 0,316 para GPT-2 y 0,289 para SLM-Tavenel. El criterio preregistrado exigía mayor precisión en HellaSwag y una media superior en las seis tareas; no se cumplió, ya que el intervalo de la media incluye cero y HellaSwag es inferior.

Bits por byte en el split de test corpus-v2 (solo SLM-Tavenel): 1,067 global, 1,085 en inglés y 1,040 en francés. GPT-2 no fue evaluado en ese split, por lo que no constituye una comparación.

## Requisitos de hardware

- VRAM estimada en float32: aproximadamente 0,5 GB para los pesos (124M × 4 bytes), más activaciones y memoria del tokenizador; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- En float16 o bfloat16 la huella de pesos baja a unos 0,25 GB, aunque el paquete se distribuye en float32 y no se documentan conversiones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; en A100 o H100 el modelo está infrautilizado y el cuello de botella será la implementación sin caché KV.
- Inferencia en CPU viable: el autor reporta una comprobación de paridad en CPU local con error absoluto máximo de 0,0 en logits y generación greedy de dos tokens.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la vía soportada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de caché KV limita su integración en servidores de inferencia optimizados.
- Latencia y throughput: no disponibles. La model card advierte explícitamente de que la generación es más lenta que en implementaciones de decoder optimizadas por no implementar caché KV.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Rendimiento |
|---|---:|---:|---|---|---|
| SLM-Tavenel 124M | 124M (95,7M sin embeddings) | 2.048 | MIT | Artefacto de investigación, sin ajuste por instrucciones | Media de 0,352 en seis tareas |
| GPT-2 Small | 124M | 1.024 | MIT | Modelo base histórico, ampliamente disponible | Media de 0,345 en las mismas seis tareas |
| SmolLM2-135M | 135M | 8.192 (según la familia SmolLM2) | Apache-2.0 | Modelo base e instruct, con ecosistema de despliegue amplio | No evaluado en la información disponible con este evaluador |

La comparación directa disponible es únicamente contra GPT-2 Small, con el mismo evaluador y los mismos ítems. Frente a SmolLM2-135M solo se comparte el tokenizador; no hay datos de rendimiento comparables en la información proporcionada, por lo que no se establece una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo Instruct ni un asistente: no ha recibido ajuste por instrucciones, RLHF ni DPO, y no debe desplegarse en aplicaciones conversacionales.
- El criterio preregistrado de mejora global frente a GPT-2 Small no se cumplió; la ventaja en la media de seis tareas no es estadísticamente concluyente y HellaSwag empeora de forma significativa.
- Contexto muy corto (2.048 tokens) para estándares actuales, lo que descarta tareas de documento largo, RAG con contexto extenso o conversaciones multi-turno prolongadas.
- Cobertura lingüística restringida a inglés y francés; no hay evidencia de competencia en castellano ni en otros idiomas.
- La implementación no incluye caché KV, lo que degrada la latencia en generación y desaconseja su uso en producción con requisitos de throughput.
- Riesgo de alucinación inherente a un modelo base de 124M entrenado con aproximadamente 983 millones de posiciones de token: la capacidad factual es muy limitada.
- Sesgos: el corpus procede de Common Crawl (FineWeb-Edu y FineWeb2-HQ), por lo que hereda los sesgos de la web filtrada por criterios de calidad y educación; no se documenta ninguna evaluación de sesgos.
- La descontaminación se limita a 13-gramas exactos y no descarta paráfrasis, traducciones ni exposición previa a los benchmarks.
- La redacción por regex de correo, teléfono, IPv4 e IBAN no constituye una revisión completa de privacidad; el autor lo advierte explícitamente.
- La trazabilidad documentada corresponde a las declaraciones de los datasets (ODC-By 1.0 y términos de Common Crawl) y al procesamiento aplicado, no a una verificación independiente de derechos sobre cada página original.
- El tokenizador proviene de SmolLM2-360M (Apache-2.0), con hash registrado en el manifiesto; conviene revisar las condiciones combinadas con la licencia MIT del modelo.
- La comprobación de paridad publicada es una prueba de humo de una sola sonda en CPU y no garantiza compatibilidad amplia ni calidad de generación.
- El repositorio no incluye el texto de entrenamiento en bruto; cualquier uso que requiera redistribuir datos debe remitirse a las fuentes originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athenista/slm-tavenel-124m
- Dataset FineWeb-Edu (revisión fijada): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu/tree/87f09149ef4734204d70ed1d046ddc9ca3f2b8f9
- Dataset FineWeb2-HQ (revisión fijada): https://huggingface.co/datasets/epfml/FineWeb2-HQ/tree/c0c06e94fd3a44ae9e802b2b0fc533817601eb5e
- Tokenizador SmolLM2-360M (revisión fijada): https://huggingface.co/HuggingFaceTB/SmolLM2-360M/tree/f8027fd0eaeea54caa13c31d31b9fdc459c38b49
- Diagrama de arquitectura: architecture.svg (incluido en el repositorio del modelo)
- Comparación emparejada con GPT-2: gpt2-paired-accuracy.svg (incluido en el repositorio del modelo)
- Registro de entrenamiento y manifiestos: training_record/ (incluido en el repositorio del modelo)
- Informe de paridad de inferencia: inference-parity-report.json (incluido en el repositorio del modelo)
