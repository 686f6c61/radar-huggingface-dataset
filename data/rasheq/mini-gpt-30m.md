# rasheq/mini-gpt-30m

## Resumen

mini-gpt-30m es un modelo de lenguaje causal de tipo decoder-only con 29.893.120 parámetros, desarrollado por Mohamed Rasheq dentro del proyecto educativo mini-gpt. Está entrenado desde cero (pesos inicializados aleatoriamente) sobre 2.000 millones de tokens de inglés, combinando FineWeb-Edu y TinyStories. Su propósito es servir como material didáctico y como línea base de investigación para estudiar tokenizadores, mezclas de datos, bucles de entrenamiento y protocolos de evaluación en modelos pequeños.

La arquitectura incorpora varias decisiones modernas pese a su tamaño reducido: posiciones RoPE, feed-forward SwiGLU, RMSNorm, embeddings de entrada y salida atados y ausencia de sesgos. El tokenizador es un BPE a nivel de byte con 8.192 tokens entrenado también desde cero. La ventana de contexto es de 512 tokens, suficiente para el tipo de secuencias con las que fue entrenado pero muy limitada para aplicaciones reales.

Es relevante ahora por su carácter completamente reproducible y por su licencia MIT, que permite reutilizar el código y los pesos sin restricciones. No es un modelo de instrucciones ni un asistente: es un modelo base que continúa texto en inglés. Su utilidad práctica es acotada, pero su valor como referencia pedagógica y como punto de partida para experimentos de ajuste fino es claro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (GPT) |
| Parametros totales | 29.893.120 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32) |

Otros datos técnicos: 8 capas, anchura 512, 8 cabezas de atención, tokenizador BPE a nivel de byte con 8.192 tokens (id 8191 reservado para `<|endoftext|>`), posiciones RoPE, SwiGLU, RMSNorm y embeddings atados.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal de 8 capas, anchura 512 y 8 cabezas de atención, con posiciones rotatorias (RoPE), feed-forward SwiGLU, normalización RMSNorm y embeddings de entrada y salida compartidos, sin términos de sesgo. El tokenizador, un BPE a nivel de byte de 8.192 tokens, también fue entrenado desde cero, lo que implica que no es compatible con los tokenizadores de la familia GPT-2 ni con `transformers` de forma directa: requiere los ficheros `model.py` y `tokenizer.py` incluidos en el repositorio.

El entrenamiento consumió 2.000 millones de tokens: 1.800 millones procedentes de FineWeb-Edu `sample-10BT` (ficheros 000-002) y 200 millones de TinyStories V2, inyectados en aproximadamente el 10% de cada lote para preservar un inglés narrativo simple y fluido. Se realizaron 7.630 pasos con 262.144 tokens por paso (64 secuencias de 512 tokens con 8 pasos de acumulación), optimizador AdamW (β1 0.9, β2 0.95, weight decay 0.1 solo en pesos 2D), tasa de aprendizaje 1.5e-3 con 300 pasos de calentamiento y decaimiento coseno hasta 1.5e-4, recorte de gradiente a 1.0 y precisión mixta bf16 con pesos maestros en fp32. Todo el entrenamiento se ejecutó en una única GPU. La pérdida de validación final fue de 3,004 por token en FineWeb-Edu y 1,382 por token en TinyStories, sin señales de sobreajuste. No se aplicó RLHF, DPO ni ningún tipo de ajuste por instrucciones.

## Capacidades

- Generación de texto en inglés por continuación de prefijo (modelo base, no instruido).
- Razonamiento gramatical limitado: obtiene 76,1% de precisión en BLiMP, lo que indica cierta sensibilidad a restricciones sintácticas del inglés.
- Comprensión lectora y sentido común básicos: 39,9% en ARC-Easy, 58,2% en PIQA, 27,9% en HellaSwag y 50,7% en WinoGrande.
- Predicción de palabras en contexto: 22,1% de precisión en LAMBADA (OpenAI).
- No soporta tool calling ni function calling.
- No soporta comportamiento agéntico ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking), visión, audio ni otras modalidades.
- Multilingüismo: únicamente inglés; no se declaran capacidades en otros idiomas.
- No incluye ajuste de seguridad ni de instrucciones.

## Casos de uso

- Docencia y aprendizaje sobre LLM: el repositorio incluye tokenizador, modelo, pipeline de datos, bucle de entrenamiento y scripts de evaluación escritos desde cero, lo que permite recorrer el ciclo completo de construcción de un modelo de lenguaje sin dependencias de `transformers`.
- Línea base para investigación sobre tokenizadores: al tener un BPE propio de 8.192 tokens, sirve para comparar el efecto de distintas granularidades de vocabulario sobre la pérdida de validación y las métricas zero-shot con un coste de cómputo mínimo.
- Experimentos de mezcla de datos: la combinación 90% FineWeb-Edu / 10% TinyStories es reproducible, y el modelo permite medir cómo cambia la fluidez narrativa frente a la calidad factual al variar esa proporción.
- Punto de partida para ajuste fino: con 29,9M de parámetros y pesos en safetensors, se puede reentrenar o ajustar en una sola GPU consumer para estudiar técnicas de fine-tuning, LoRA o destilación sobre un modelo pequeño.
- Evaluación de arneses de benchmarks: útil para validar scripts de evaluación zero-shot (BLiMP, ARC-Easy, PIQA, HellaSwag, LAMBADA, WinoGrande) siguiendo los prompts de lm-evaluation-harness antes de escalar a modelos mayores.
- Generación de texto narrativo simple en inglés: gracias a la mezcla con TinyStories, produce continuaciones fluidas de cuentos cortos, útil para demostraciones y pruebas de pipelines de generación.
- Pruebas de infraestructura de despliegue: su reducido tamaño permite validar integraciones de inferencia (servidores ligeros, scripts propios) sin consumo relevante de VRAM.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (zero-shot, evaluados con `evaluate.py` del proyecto mini-gpt, con GPT-2 124M como referencia puntuada por el mismo script). Todos los valores están marcados como no verificados.

| Test | Datos (tamaño) | Métrica | Aleatorio | mini-gpt-30m | GPT-2 (124M) |
|---|---|---|---:|---:|---:|
| BLiMP | 67 conjuntos gramaticales (67.000 pares) | accuracy | 50% | 76,1% | 82,5% |
| ARC-Easy | test (2.376 preguntas) | acc_norm | 25% | 39,9% | 40,5% |
| PIQA | validation (1.838) | acc_norm | 50% | 58,2% | no disponible en la información |
| HellaSwag | validation | acc_norm | 25% | 27,9% | no disponible en la información |
| LAMBADA (OpenAI) | test | accuracy | no disponible | 22,1% | no disponible en la información |
| WinoGrande | validation (winogrande_xl) | accuracy | 50% | 50,7% | no disponible en la información |

Pérdida de validación final: 3,004 por token en FineWeb-Edu y 1,382 por token en TinyStories.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, los 29,9M de parámetros ocupan aproximadamente 120 MB de pesos; en la práctica, el modelo completo cabe holgadamente en menos de 1 GB de VRAM incluyendo activaciones y buffers.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entrenó el modelo en una única GPU (modelo no especificado).
- Cabe en cualquier GPU consumer: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, RTX 4090, así como en CPU y en placas tipo Raspberry Pi para inferencia lenta.
- Opciones de despliegue: no es compatible con `transformers`, vLLM, TGI ni llama.cpp de forma nativa; requiere los scripts `model.py`, `tokenizer.py` y `generate.py` del repositorio, con PyTorch y safetensors. El autor no publica pesos en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Formato | Disponibilidad |
|---|---:|---:|---|---|---|---|
| mini-gpt-30m | 29,9M | 512 | MIT | en | safetensors (fp32) | Hugging Face, código en GitHub |
| GPT-2 124M | 124M | 1.024 | MIT (pesos OpenAI) | en | safetensors, GGUF vía conversión | Hugging Face, integración nativa en `transformers` |
| TinyStories-1M / 33M (variantes) | ~1M–33M | 512–2.048 | variable (MIT en varias) | en | safetensors | Hugging Face |
| Pythia-70M | 70M | 2.048 | Apache 2.0 | en | safetensors | Hugging Face, EleutherAI |

En términos de rendimiento, mini-gpt-30m queda ligeramente por debajo de GPT-2 124M en BLiMP (76,1% frente a 82,5%) y prácticamente empatado en ARC-Easy (39,9% frente a 40,5%), con una cuarta parte de los parámetros. Frente a Pythia-70M y las variantes de TinyStories, la comparación directa no está disponible en la información proporcionada, ya que no se aportan sus resultados en los mismos benchmarks. La principal ventaja diferencial de mini-gpt-30m es su reproducibilidad completa desde cero y su licencia MIT sin restricciones.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene conversaciones; no debe usarse como asistente.
- Riesgo alto de alucinación: el propio autor advierte que el inglés es fluido pero los hechos no son fiables. No debe emplearse en contextos donde la corrección factual sea importante (respuestas, asesoramiento, material educativo).
- Sin ajuste de seguridad: no incorpora alineamiento, filtros ni moderación; puede generar contenido inapropiado.
- Contexto muy limitado: 512 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Solo inglés: no hay capacidades en castellano ni en otros idiomas.
- Tokenizador propio de 8.192 tokens: incompatible con `transformers` y con tokenizadores estándar, lo que complica la integración en ecosistemas existentes.
- Sesgos: no se documentan análisis de sesgo; al entrenarse sobre FineWeb-Edu y TinyStories, hereda los sesgos de esas fuentes.
- No apto para producción según el propio autor.
- Licencia MIT: permite uso comercial y modificación sin restricciones, pero no exime de responsabilidad sobre los contenidos generados.
- Resultados de benchmarks no verificados: todos los valores de la model card están marcados como `verified: false`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rasheq/mini-gpt-30m
- Repositorio del proyecto mini-gpt: https://github.com/Mohamedrasheq/mini-gpt
- Script de evaluación: https://github.com/Mohamedrasheq/mini-gpt/blob/main/evaluate.py
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- lm-evaluation-harness (referencia de prompts): https://github.com/EleutherAI/lm-evaluation-harness
