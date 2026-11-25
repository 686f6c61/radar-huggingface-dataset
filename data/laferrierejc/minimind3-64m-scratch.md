# LaferriereJC/minimind3-64m-scratch

## Resumen

minimind3-64m-scratch es un modelo de lenguaje causal denso de aproximadamente 64 millones de parametros (63.912.192 segun los pesos en safetensors) desarrollado por el usuario LaferriereJC. Implementa la arquitectura MiniMind-3 y se ha entrenado desde inicializacion aleatoria, es decir, sin partir de pesos preentrenados de otro modelo, sobre un unico corpus plano compuesto por siete fuentes de datos. Su proposito declarado no es el uso final, sino servir como base de validacion de pipeline para el proyecto RL_V2, que realizara experimentos de SFT y RL sobre el.

El modelo emplea una arquitectura transformer con 768 dimensiones ocultas, 8 capas, 8 cabezas de consulta y 4 cabezas KV (GQA), dimension de cabeza 96, FFN de 2.432, vocabulario de 6.400 tokens, embeddings atados, RoPE con theta 1e6 y RMSNorm. El entrenamiento consumio 1.341.440.000 tokens (1,34B) en una sola pasada, lo que supone aproximadamente 20,96 tokens por parametro, en linea con la referencia de planificacion de Chinchilla (20x), aunque el autor advierte que Chinchilla estudio modelos desde 70M en adelante, por lo que 64M es una referencia extrapolada.

Es relevante ahora como ejemplo reproducible y transparente de preentrenamiento a pequena escala: el autor publica la mezcla de datos realizada, el regimen de entrenamiento completo, las perdidas y una evaluacion diagnostica acotada. No es un modelo de instrucciones ni de razonamiento, y su rendimiento en matematicas y razonamiento esta en el suelo segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (MiniMind-3), 8 capas, hidden 768, 8 cabezas Q / 4 KV, head dim 96, FFN 2.432, RoPE theta 1e6, RMSNorm eps 1e-6, SiLU, embeddings atados |
| Parametros totales | 63.912.192 (~64M) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 32.768 tokens soportados por el modelo; 2.048 tokens usados en entrenamiento |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible (el corpus de entrenamiento es mayoritariamente en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors), con codigo de arquitectura en model_minimind.py |
| Vocabulario | 6.400 tokens (tokenizer MiniMind) |
| Requiere trust_remote_code | Si |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de tipo decoder-only. La configuracion concreta es: 768 dimensiones ocultas, 8 capas, 8 cabezas de atencion de consulta y 4 cabezas KV (atencion con query grouping, GQA), dimension de cabeza 96, FFN de 2.432, vocabulario de 6.400, embeddings atados entre entrada y salida, RMSNorm con epsilon 1e-6, activacion SiLU y RoPE con theta 1e6. La atencion se implementa con PyTorch SDPA. El modelo soporta 32.768 tokens de contexto, aunque el entrenamiento se realizo con tensores de 2.048 tokens.

El entrenamiento partio de inicializacion aleatoria y consumio 1.341.440.000 tokens en una sola pasada (655.000 secuencias de 2.048 tokens, sin padding). La mezcla de datos realizada fue: FineWeb-Edu 37,0789%, MiniPile 31,8629%, ensayos de IvyPanda 16,8980%, WikiText-103 v1 13,8933%, Brown Corpus 0,1534%, definiciones de WordNet 0,1028% y citas en ingles 0,0107%. El texto de las citas se reparo con `ftfy.fix_text` antes de la tokenizacion. Se reservaron documentos de retencion por fuente antes del muestreo.

El regimen de entrenamiento uso AdamW con pico de learning rate 5e-4 y decaimiento coseno hasta el 10% del pico, warmup lineal del 3%, clipping de gradiente con norma 1.0, batch efectivo de 256 (microbatch 8 x acumulacion 32), precision FP16 con GradScaler sobre una Quadro RTX 5000 Max-Q de 16 GB (pico asignado de 8,62 GiB). Se realizaron 2.554 actualizaciones exitosas del optimizador y 5 omitidas por el GradScaler. La perdida media fue 2,03630 y la del ultimo update 1,85102. El objetivo fue entropia cruzada de siguiente token sobre todas las posiciones. Se guardo checkpoint cada 1.000 updates.

## Capacidades

- Generacion de texto causal en ingles: produce prosa fluida a partir de un prompt, aunque con frecuencia factualmente incorrecta.
- Modelado de lenguaje de siguiente token: util como base para experimentos de preentrenamiento y validacion de pipelines.
- Contexto extendido declarado de hasta 32.768 tokens (aunque solo entrenado con 2.048).
- Muestreo configurable con temperatura, top-p, top-k, min-p y penalizaciones de frecuencia y presencia.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No es un modelo de instrucciones (no ha pasado por SFT ni RLHF/DPO).
- No dispone de vision, audio ni modo de pensamiento.
- Capacidad multilingue no documentada; el corpus es predominantemente ingles.

## Casos de uso

- Validacion de pipelines de preentrenamiento: el modelo sirve para comprobar de extremo a extremo el flujo de tokenizacion, mezcla de datos, entrenamiento, guardado de checkpoints y exportacion a Hugging Face, gracias a que el autor publica la mezcla exacta y las perdidas.
- Base para experimentos de SFT y RL: al ser un checkpoint de preentrenamiento limpio desde cero, es adecuado como punto de partida controlado para el proyecto RL_V2, que aplicara trazas de SFT y tecnicas de RL sobre el.
- Reproduccion de recetas de entrenamiento a pequena escala: con 1,34B tokens y 20,96 tokens por parametro, permite estudiar el efecto de la mezcla de datos (FineWeb-Edu, MiniPile, WikiText-103, etc.) en un presupuesto de computo reducido.
- Investigacion sobre decodificacion: la model card documenta que la decodificacion greedy degenera en repeticion y que el preset creativo (temperatura 1.1, top-p 1.0, min-p 0.05, penalizaciones 0.2) produce la prosa mas plausible, lo que lo hace util para estudiar estrategias de muestreo en modelos pequenos.
- Educacion y divulgacion: modelo de 64M parametros que cabe en una GPU de consumo y permite explicar de forma practica el ciclo completo de entrenamiento de un LLM.
- Pruebas de infraestructura de inferencia: con 0,3 GB de repo y pesos safetensors, sirve para validar integraciones con transformers y `trust_remote_code` en entornos de CI sin coste de GPU significativo.
- Generacion de texto creativo de baja exigencia factual: dado su caracter fluido pero no fiable, puede usarse en entornos controlados donde no se requiera exactitud.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Entropia cruzada en retencion (131 documentos, 328.479 objetivos, ponderada por cuota de fuente) | 2,605 nats/token |
| Perplejidad en retencion | 13,54 |
| Comparacion con modelo aleatorio (10 registros emparejados, seed 42) | 8,913 → 2,262 nats/token (−74,6%) |
| Perdida media de entrenamiento | 2,03630 |
| Perdida en el ultimo update | 1,85102 |
| Evaluacion de matematicas (protocolo sin pensamiento) | 0 de 22 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor advierte que la evaluacion diagnostica cubre una muestra acotada y no constituye una afirmacion de generalizacion ni una puntuacion de holdout completo (21.220 documentos reservados).

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento uso un pico de 8,62 GiB en FP16 sobre una Quadro RTX 5000 Max-Q de 16 GB; la inferencia en FP16 de un modelo de 64M requiere aproximadamente 0,13 GB solo para pesos, mas overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el autor entreno en una Quadro RTX 5000 Max-Q (16 GB).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU para inferencia basica.
- Opciones de despliegue: transformers con `trust_remote_code=True` (metodo documentado por el autor). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no publicarse pesos GGUF no hay soporte directo en llama.cpp/Ollama sin conversion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minimind3-64m-scratch | ~64M | 32.768 (entrenado a 2.048) | 1,34B tokens desde cero | no disponible | Hugging Face, safetensors |
| MiniMind original (referencia de arquitectura) | ~26M (segun variantes publicas) | no disponible | preentrenamiento + SFT | no disponible | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2.048 | 3T tokens, con SFT | Apache 2.0 | Hugging Face |
| SmolLM-135M | 135M | 2.048 | ~600B tokens | Apache 2.0 | Hugging Face |

Los datos de MiniMind original, TinyLlama y SmolLM provienen de conocimiento general y no de la informacion proporcionada para este modelo; se incluyen como referencia de categoria. minimind3-64m-scratch es sustancialmente mas pequeno que las alternativas y no ha pasado por SFT, por lo que no es directamente comparable en calidad de instrucciones.

## Limitaciones y advertencias

- Preentrenamiento desde inicializacion aleatoria: no es continuacion de un modelo existente ni un modelo afinado.
- Tamano muy reducido: 64M parametros y una sola pasada sobre 1,34B tokens; produce texto fluido pero a menudo factualmente incorrecto.
- No esta afinado para instrucciones: no ha sido entrenado con las trazas SFT del proyecto RL_V2.
- Razonamiento y matematicas en el suelo: 0 de 22 en la evaluacion fija de matematicas del proyecto bajo el protocolo sin pensamiento.
- La decodificacion greedy degenera en repeticion; es necesario usar muestreo (preset creativo recomendado).
- Evaluacion diagnostica acotada: 131 documentos de retencion, sin umbral de aceptacion predeclarado ni puntuacion de holdout completo.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- Idiomas no documentados; el corpus es predominantemente en ingles, por lo que el rendimiento en castellano es incierto.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio (`model_minimind.py`); conviene auditar dicho codigo antes de usarlo en produccion.
- Sin soporte documentado de tool calling, agentes ni capacidades multimodales.
- Riesgo de alucinacion elevado dado el reducido volumen de datos y la ausencia de alineacion.

## Enlaces

- Hugging Face: https://huggingface.co/LaferriereJC/minimind3-64m-scratch
- Repositorio del proyecto RL_V2 (mencionado en la model card, ruta `data/cpt/minimind3_64m_655k/`): no disponible como URL publica en la informacion proporcionada
- Paper o blog de MiniMind-3: no disponible en la informacion proporcionada
- Demo o space: no disponible
