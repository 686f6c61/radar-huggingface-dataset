# JohnP1/d1a-e4b-it

## Resumen

D1A-E4B-it v0.6 es un adaptador LoRA de tipo "decision model" publicado por el desarrollador independiente JohnP1 (jonpol01) sobre el tronco instructivo google/gemma-4-E4B-it. A diferencia de un modelo generativo al uso, D1A recibe un documento y un conjunto de preguntas tipadas (sí/no, elección entre opciones, puntuación) y devuelve, en un único forward pass, una probabilidad calibrada para cada opción, sin generar texto. Implementa la API TypeSafe System One (`POST /v1/systemone`), de modo que el SDK de TypeSafe y los clientes existentes funcionan directamente contra él.

La relevancia del modelo reside en su doble naturaleza: con el adaptador activo se comporta como un clasificador de decisiones calibrado; con el adaptador desactivado es exactamente Gemma 4 E4B-it, por lo que un único modelo en memoria sirve también para chat en formato OpenAI. Según el autor, frente a D1A-E2B-it v0.6 mejora la precisión en 21 de 22 suites (pooled +2.5 puntos, IC 95% [+1.7, +3.4]) a costa de ser unas 2.9 veces más lento por decisión (p50 de 0.25 s en un Apple M4).

El repositorio ocupa 0.2 GB y contiene únicamente los pesos del adaptador y la cabeza de decisión, no el modelo base completo. La licencia es Apache 2.0 y los idiomas declarados son inglés y japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre transformer decoder-only Gemma 4 E4B-it, más cabeza de puntero de 256 dimensiones |
| Parametros totales | no disponible (adaptador LoRA + cabeza; el tronco es google/gemma-4-E4B-it) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como cifra oficial; el entrenamiento usó estados de hasta 5.120 tokens |
| Tipos de cuantizacion | adaptador PyTorch en safetensors; builds MLX q8 (7.0 GB con media) y q4 (4.9 GB con media) |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); builds MLX q8 y q4 |
| Modelo base | google/gemma-4-E4B-it (revision ee0ef602) |
| Libreria | peft |
| Pipeline | text-classification |
| Tamano del repo | 0.2 GB |
| Temperatura de calibracion | 1.55 (intervalo 90% [1.48, 1.62]) |
| Temperatura de routing | no incluida (se usa 1.55) |
| Token BOS | bos_token_id 2 (debe anteponerse manualmente) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 aplicado a las proyecciones de atención y MLP (q, k, v, o, gate, up, down) del tronco Gemma 4 E4B-it, acompañado de una pequeña cabeza de puntero de 256 dimensiones que produce las probabilidades por opción en un solo paso hacia delante. No hay decodificación generativa en el modo decisión: la salida es una distribución calibrada sobre las opciones tipadas de cada pregunta.

El entrenamiento se realizó en dos etapas. La etapa 1 (decisiones generales) usó la suite decision-v7 (datasets públicos de clasificación más datos sintéticos de políticas y reglas), 2 épocas, lr 1e-4, batch 4 × accum 2, partiendo del tronco -it; no está publicada. La etapa 2 agrupó todas las habilidades posteriores en una sola ejecución con 23.427 registros sin truncar: etiquetas de PR (4.000 en inglés estratificadas por severidad, 753 en japonés, 1.500 con etiqueta de blast-radius y 479 PR de hermes-agent), hard-v1 (4.000), devtools-v1 (4.000), documents-v1 (2.500), JGLUE (2.000), routing (1.216 de agent factory y 1.000 genéricos) y replay de decision-v7 (1.500); 1 época, lr 5e-5, estados de hasta 5.120 tokens, 2.929 pasos. La mezcla es idéntica byte a byte a la de E2B v0.6 (sha256 `efff4b16`) y fue cribada contra todas las particiones de evaluación antes de entrenar.

El cómputo se repartió entre una NVIDIA L4 (Hugging Face Jobs, bf16 autocast) para los pasos 1–2.038 de la etapa 1 y un Apple M1 Max (MPS, forward fp32) para el resto y toda la etapa 2, finalizada el 2026-10-17. Los pesos maestros de LoRA y de la cabeza se mantuvieron en fp32 en ambas máquinas. La calibración se ajustó con una temperatura única T = 1.55 sobre 3.178 preguntas (split de calibración de decision-v7 y conjunto de desarrollo de etiquetado de PR), reduciendo el ECE de 0.057 a 0.015 out-of-fold. Se ajustó una temperatura específica de routing (T 1.20) que no se publicó por empeorar la calibración en transferencia (ECE 0.018 → 0.031).

## Capacidades

- Clasificación de decisiones tipadas: preguntas de sí/no, elección múltiple y puntuación, con probabilidad calibrada por opción en un solo forward pass y sin texto generado.
- Chat y generación de texto: con el adaptador desactivado (build sin fusionar), el modelo es Gemma 4 E4B-it y responde en formato OpenAI.
- Routing de peticiones: decide a qué agente o ruta derivar una solicitud (datos de agent factory y routing genérico).
- Etiquetado de pull requests: severidad, etiquetas y blast-radius, con soporte específico para PR recientes.
- Monitor de hechos no verificables ("unknowable-facts"): detecta preguntas cuya respuesta no es comprobable con el documento.
- Capacidades multimodales (fotos, voz y vídeo) en los builds MLX con `media/`, en modo zero-shot.
- Embeddings: obtenidos de un embedder GGUF servido junto al modelo mediante `D1A_EMBED_GGUF`.
- Multilingüe limitado a inglés y japonés.
- Compatibilidad con la API TypeSafe System One (`POST /v1/systemone`) y su SDK.

## Casos de uso

- Moderación y triaje de pull requests: el modelo asigna severidad y etiquetas a PR entrantes (entrenado con 4.000 PR en inglés y 753 en japonés, incluidos PR recientes de hermes-agent), lo que permite priorizar revisiones en un pipeline de CI/CD sin coste de generación de texto.
- Routing de agentes: dado un mensaje de usuario y un conjunto de rutas disponibles, devuelve la probabilidad de cada ruta; encaja en orquestadores multiagente que necesitan una decisión rápida y calibrada antes de invocar al agente final.
- Clasificación documental de alto volumen: con estados de hasta 5.120 tokens y una latencia p50 de 0.25 s en Apple M4, es adecuado para procesar lotes de documentos largos (contratos, informes) con preguntas tipadas por documento.
- Detección de afirmaciones no verificables: el monitor de unknowable-facts permite marcar respuestas o preguntas que el documento no respalda, útil en sistemas de atención al cliente o RAG que deben abstenerse en lugar de alucinar.
- Asistente conversacional en dispositivo: al conservar el tronco Gemma 4 E4B-it, el mismo modelo en memoria atiende chat en formato OpenAI cuando se desactiva el adaptador, lo que simplifica despliegues on-device con builds MLX q4 (4.9 GB).
- Evaluación de calidad en japonés e inglés: los datos JGLUE y la mezcla bilingüe permiten usarlo para clasificación de texto en ambos idiomas dentro de flujos de anotación o control de calidad.
- Enrutado de soporte técnico: combina la decisión tipada con la calibración (T 1.55) para establecer umbrales de derivación automática a humanos cuando la confianza es baja.

## Benchmarks y rendimiento

Resultados publicados por el autor, ambos modelos servidos en MLX 8-bit sin fusionar y cada uno a su temperatura, sobre Apple M4. Δ emparejado con intervalos bootstrap del 95%.

| Suite | n | E2B-it v0.6 | E4B-it v0.6 | Δ [IC 95%] |
|---|---:|---:|---:|---|
| Decisiones generales (decision-v7) | 1.264 | 84.8 | 85.7 | +0.9 [−0.7, +2.5] |
| Transfer (transfer-v4, fuentes no entrenadas) | no disponible | no disponible | no disponible | no disponible |
| Decisiones difíciles | no disponible | no disponible | no disponible | +6.6 |
| Herramientas de desarrollo | no disponible | no disponible | no disponible | +3.2 |
| Documentos largos | no disponible | no disponible | no disponible | +2.3 |
| JGLUE | no disponible | no disponible | no disponible | +2.2 |
| Etiquetas de PR (PR más recientes) | no disponible | no disponible | no disponible | +1.8 |
| Severidad de PR (con offsets de decode servidos) | no disponible | no disponible | no disponible | +5.1 |
| Monitor de hechos no verificables | no disponible | no disponible | no disponible | −2.9 (única pérdida significativa) |

Resumen agregado: precisión mejor en 21 de 22 suites, pooled +2.5 puntos [+1.7, +3.4]. Calibración mixta: ECE mejor en 9 suites y peor en 12, en todos los casos con diferencias ≤ 0.03. ECE global del adaptador: 0.057 antes y 0.015 después de calibrar, out of fold. Latencia: p50 de 0.25 s por decisión en Apple M4, aproximadamente 2.9 veces más lento que E2B-it. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador PyTorch ocupa 0.2 GB, pero requiere cargar el tronco Gemma 4 E4B-it completo; los builds MLX fusionados ocupan 7.0 GB (q8 con media) y 4.9 GB (q4 con media).
- GPU recomendadas: NVIDIA L4 (usada en el entrenamiento), A100 y H100 para despliegues de mayor throughput; Apple Silicon (M1 Max, M4) validado por el autor tanto en entrenamiento como en inferencia.
- Cabe en GPU de consumo: sí, en configuraciones con suficiente memoria para el tronco; los builds MLX q4 (4.9 GB) están pensados para ejecución on-device en Apple Silicon.
- Opciones de despliegue: runtime propio de D1A (API TypeSafe System One), builds MLX q8/q4, adaptador PEFT sobre transformers; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: p50 de 0.25 s por decisión en Apple M4 con el build MLX 8-bit; no se publican cifras de throughput para GPU.

## Comparativa con modelos similares

| Modelo | Tronco | Decisiones | Chat | Temperatura de calibración | Builds | Licencia |
|---|---|---|---|---|---|---|
| **D1A-E4B-it v0.6** | Gemma 4 E4B-it | sí | sí (adaptador desactivado) | 1.55 | PyTorch, MLX q8/q4 | apache-2.0 |
| D1A-E4B v0.6.1 | Gemma 4 E4B | sí | no | 1.95 | PyTorch, MLX 8-bit, Core ML int8 (preview) | no disponible |
| D1A-E2B v0.6.1 | Gemma 4 E2B | sí | no | 1.45 | PyTorch, MLX 8-bit, Core ML int8 | no disponible |
| D1A-E2B-it v0.6 | Gemma 4 E2B-it | sí (experimental) | sí | 1.41 | PyTorch, MLX q8/q4, Core ML int8/int4 | no disponible |

Frente a E2B-it v0.6, el modelo gana precisión en 21 de 22 suites pero es unas 2.9 veces más lento y calibra de forma mixta. Frente a las variantes no instructivas (E4B y E2B), la diferencia principal es la disponibilidad de chat al desactivar el adaptador. No se dispone de comparación con clasificadores dedicados de terceros en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto en modo decisión: solo devuelve probabilidades sobre opciones predefinidas; para texto libre hay que desactivar el adaptador y usar el tronco Gemma 4 E4B-it.
- Requiere anteponer manualmente el token `<bos>` (id 2) al codificar peticiones; sin él, las respuestas no coinciden con las medidas por el autor.
- El monitor de hechos no verificables empeora 2.9 puntos respecto a E2B-it v0.6, por lo que la abstención ante afirmaciones no comprobables es menos fiable que en el modelo pequeño.
- Calibración desigual: el ECE empeora en 12 de 21 suites (siempre ≤ 0.03), de modo que los umbrales de confianza deben validarse por dominio antes de producción.
- Idiomas limitados a inglés y japonés; no hay soporte declarado de castellano ni de otras lenguas.
- Solo se publican pesos del adaptador y la cabeza, no el tronco; es necesario descargar google/gemma-4-E4B-it en la revisión `ee0ef602` y verificar la compatibilidad de la licencia del tronco para uso comercial.
- El autor no publica los datos de la etapa 1 ni cifras de benchmarks estándar, lo que limita la comparación independiente.
- Riesgo de sesgo y alucinación inherente al tronco Gemma 4 subyacente; no se documentan evaluaciones de sesgo específicas para este adaptador.
- Despliegue fuera del ecosistema D1A/MLX no documentado: no hay integraciones publicadas con vLLM, llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JohnP1/d1a-e4b-it
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio D1A: https://github.com/jonpol01/d1a
- Documentación de modelos D1A: https://github.com/jonpol01/d1a/blob/main/docs/MODELS.md
- Dataset JGLUE del autor: https://huggingface.co/datasets/JohnP1/d1a-ja-jglue
- Dataset de routing del autor: https://huggingface.co/datasets/JohnP1/d1a-routing
- Avatar del modelo: https://huggingface.co/JohnP1/d1a-e4b-it/resolve/main/d1a-avatar.png
