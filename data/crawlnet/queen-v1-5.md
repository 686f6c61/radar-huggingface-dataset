# Crawlnet/queen-v1.5

## Resumen

Queen v1.5, con nombre en clave "hatchling", es un modelo de lenguaje de 42,1 millones de parametros entrenado integramente desde cero por Crawlnet. No parte de pesos preentrenados de terceros ni de corpus generalistas tipo FineWeb: su corpus de preentrenamiento y su tokenizador se construyeron unicamente a partir de las paginas que los crawlers de la propia red Crawlnet leyeron en la web de criptomonedas con navegadores reales. El resultado es un modelo deliberadamente pequeno y especializado, cuyo autor advierte que debe esperarse "un modelo tonto, divertido y con confianza en sus errores; esa es la idea".

Tecnicamente es un transformer decoder-only estilo GPT implementado con la base nanochat de Andrej Karpathy (commit `92d63d4e8bb4`, licencia MIT), con profundidad 6, ancho 384, 6 cabezas de atencion, ventana de contexto de 1024 tokens y vocabulario BPE de 16.384 entradas. El preentrenamiento consumio 82.837.504 tokens sobre un dataset de 20.758.910 tokens unicos (3,99 epocas, 4,9 tokens por parametro no-embedding), con una perdida de validacion de 1,5162 bits/byte. Todo el computo de preentrenamiento y ajuste se hizo en una sola NVIDIA GeForce RTX 5080 en 0,22 horas de GPU.

La relevancia de esta ficha no esta en su rendimiento absoluto, sino en el experimento que documenta: un pipeline completo de preentrenamiento desde cero y ajuste conversacional con un presupuesto de 0,07 dolares de GPU mas 14,83 dolares de API, con trazabilidad on-chain de los crawlers que aportaron las paginas. Queen v1.5 reutiliza exactamente los mismos pesos preentrenados, tokenizador y dataset que Queen v1 y solo rehace el ajuste de chat (SFT), declarando una mejora de 0,26 a 0,83 sobre 2 en correccion media evaluada por un LLM externo con paginas recuperadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nanochat GPT (transformer decoder-only), profundidad 6, ancho 384, 6 cabezas de atencion |
| Parametros totales | 42.074.366 (42,1 M totales; 16,9 M no-embedding) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tokenizador | BPE propio, 16.384 tokens, entrenado solo con las paginas del crawler |
| Tamano del repositorio | 0,1 GB |
| Libreria de referencia | nanochat |
| Modelo base | Crawlnet/queen-v1 (mismos pesos preentrenados y tokenizador; solo cambia el SFT) |
| Dataset de preentrenamiento | 10.521 paginas exportadas (10.518 tras limpieza), 392 dominios |
| Tokens unicos de entrenamiento | 20.758.910 (+160.122 reservados para validacion) |
| Tokens entrenados | 82.837.504 (3,99 epocas) |
| Perdida de validacion | 1,5162 bits/byte en paginas reservadas del crawler |
| Computo | NVIDIA GeForce RTX 5080, 0,22 h de pared, 0,22 GPU-horas |
| Coste declarado | 0,07 USD de GPU + ~14,83 USD de API (precio de lista) |

## Arquitectura y entrenamiento

El modelo sigue la implementacion nanochat de Karpathy, un GPT decoder-only clasico con atencion causal, sin componentes MoE, SSM ni hibridos. La configuracion es de 6 capas, dimension de modelo 384 y 6 cabezas de atencion, lo que da una dimension de cabeza de 64. El vocabulario es un BPE de 16.384 tokens entrenado exclusivamente sobre el mismo corpus de crawler, no sobre un tokenizador generalista reutilizado. La ventana de contexto es de 1024 tokens.

El preentrenamiento es estrictamente from-scratch: no hay inicializacion desde pesos preentrenados ni mezcla con corpus externos. El corpus son 10.518 paginas de 392 dominios procedentes de la web de criptomonedas, con un manifiesto de dataset cuyo sha256 es `1258202cf03b6202c5c69112d5a82a34ac6d9d3cb9175fb92282ff4ebea64e32`. Sobre 20,76 M de tokens unicos se dieron 3,99 epocas (82,84 M de tokens vistos), con 160.122 tokens reservados para validacion. El ajuste de chat combina tres fuentes: 97.726 pares pregunta/respuesta generados por `deepseek-flash` (DeepSeek-V4.1-Flash, pesos abiertos, licencia MIT) a partir de 32.676 paginas del crawler; 60.562 pares extraidos directamente de las paginas (preguntas tipo FAQ, encabezados y titulos, con respuestas textuales); y 80.471 conversaciones en formato "libro abierto", en las que el texto de crawler del que se escribio la respuesta se coloca delante de la pregunta (el 47 % con una segunda pagina recuperada por busqueda). No se documento RLHF ni DPO. La unica escritura humana son seis plantillas fijas de pregunta del tipo "Tell me about {heading}.".

## Capacidades

- Generacion de texto en ingles y respuesta a preguntas de tipo conversacional de un solo turno o pocos turnos, siempre dentro de una ventana de 1024 tokens.
- Respuesta en modo "libro abierto": el modelo fue entrenado para contestar a partir del texto de las paginas de crawler colocadas delante de la pregunta, replicando el flujo de recuperacion del sitio.
- Cobertura tematica limitada al dominio de las paginas rastreadas: contenido de la web de criptomonedas presente en los 392 dominios del dataset.
- Ajuste de estilo conversacional (SFT) a partir de pares generados por un LLM externo y de pares extraidos del propio corpus.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo "thinking".
- No se documentan capacidades multilingues: el idioma declarado es unicamente ingles.

## Casos de uso

- Reproduccion de pipelines de preentrenamiento from-scratch: sirve como caso de referencia completo (tokenizador propio, dataset trazable con sha256, curva de perdida en bits/byte y coste en GPU-horas) para quien quiera replicar el flujo nanochat en un dominio concreto.
- Investigacion sobre calidad de corpus: al publicarse el manifiesto del dataset y los 392 dominios, permite estudiar que aprende un modelo de 42 M de parametros cuando solo ve paginas de un nicho vertical.
- Estudio de destilacion de estilo conversacional: el SFT se hizo con pares generados por `deepseek-flash`, por lo que el modelo es util para analizar como se transfiere el estilo de un profesor grande a un alumno de 42 M de parametros.
- Demostracion de Q&A sobre criptomonedas en modo libro abierto: se puede desplegar en un entorno de pruebas que recupere paginas del mismo dominio y las anteponga a la pregunta, el escenario para el que fue explicitamente ajustado.
- Experimentos de cuantizacion extrema y despliegue en el borde: con 16,9 M de parametros no-embedding, es un banco de pruebas para medir el impacto de int8/int4 en un modelo diminuto, aunque el autor no publica cuantizaciones.
- Educacion y divulgacion: su tamano (0,1 GB) y su coste de entrenamiento declarado (menos de 15 dolares) lo hacen apto para explicar en clase el ciclo completo de tokenizacion, preentrenamiento y ajuste supervisado.
- Auditoria de trazabilidad on-chain: las paginas del dataset estan vinculadas a wallets y transacciones de "burn" de `$CRAWLNET`, lo que permite estudiar mecanismos de atribucion de datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Los unicos datos de evaluacion aportados por el autor son los siguientes.

| Metrica | Queen v1 | Queen v1.5 |
|---|---|---|
| Perdida de validacion (preentrenamiento, bits/byte) | no disponible para v1 en esta informacion | 1,5162 |
| Correccion media graduada por LLM externo, con paginas recuperadas (sobre 2) | 0,26 | 0,83 |
| Correccion en la categoria "on topic" (LLM externo, con paginas) | 50 % | 89 % |
| Comparacion ciega A/B entre v1 y v1.5 | v1.5 mejor en 81 respuestas; v1 mejor en 16 | — |

La evaluacion con LLM externo emplea el conjunto fijo de preguntas `queen_train/judge_questions.json`, cada una respondida con las 2 paginas que devuelve el sistema de recuperacion del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ~168 MB en fp32, ~84 MB en fp16/bf16, ~42 MB en int8 y ~21 MB en int4, calculados sobre los 42,07 M de parametros.
- Memoria de cache KV: con 6 capas, ancho 384 y contexto 1024, la cache es del orden de pocos megabytes, despreciable frente a los pesos.
- GPU recomendadas: cualquiera; el modelo se entreno en una NVIDIA GeForce RTX 5080 y cabe con holgura en GTX 1060, RTX 3060, RTX 4090, A100 o H100. La GPU no es un cuello de botella.
- Cabe en GPU de consumo y tambien en CPU: cualquier equipo con unos pocos cientos de megabytes libres de RAM puede ejecutarlo.
- Opciones de despliegue: la libreria declarada es nanochat (`library_name: nanochat`), sobre el codigo de `karpathy/nanochat` en el commit `92d63d4e8bb4` mas el directorio `training/` de Crawlnet. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. El unico dato de computo publicado es el del entrenamiento (0,22 GPU-horas en una RTX 5080), no el de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Crawlnet/queen-v1.5 | 42,1 M (16,9 M no-embedding) | 1024 | en | apache-2.0 | safetensors, libreria nanochat |
| GPT-2 small | 124 M | 1024 | en | licencia MIT modificada | transformers, ampliamente soportado |
| EleutherAI Pythia-70M | 70 M | 2048 | en | apache-2.0 | transformers |
| SmolLM2-135M | 135 M | 8192 | en | apache-2.0 | transformers, GGUF, amplio soporte de runtime |

Queen v1.5 es el mas pequeno de la comparativa, el unico entrenado con un corpus de nicho (web de criptomonedas) en lugar de corpus generalistas, y el unico cuyo contexto esta limitado a 1024 tokens. Frente a GPT-2 small, Pythia-70M y SmolLM2-135M no hay datos de benchmarks comparables porque el autor no publica MMLU, HumanEval ni GSM8K, por lo que no es posible establecer una comparacion de rendimiento en tareas estandar. La ventaja diferencial de queen-v1.5 no es la calidad, sino la trazabilidad completa del dataset y la reproducibilidad del pipeline desde cero.

## Limitaciones y advertencias

- El propio autor describe el modelo como "dumb, funny, confidently-wrong": esta disenado como experimento de investigacion, no como herramienta fiable. Esperese alucinacion frecuente y respuestas incorrectas con tono seguro.
- Riesgo elevado de sesgo de dominio: todo el conocimiento proviene de 10.518 paginas de la web de criptomonedas (392 dominios). Cualquier pregunta fuera de ese nicho queda practicamente sin cobertura.
- Fuerte riesgo de sesgo de estilo: el SFT se genero con `deepseek-flash`, por lo que la redaccion conversacional del modelo imita la de ese generador, no una fuente humana. Puede reproducir sus sesgos de formulacion.
- Ventana de contexto muy corta (1024 tokens): no admite conversaciones largas ni documentos extensos.
- Monolingue: solo se declara ingles. No hay soporte documentado de castellano ni de otros idiomas.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso, lo que descarta su uso en pipelines de automatizacion que dependan de esas capacidades.
- Sin benchmarks publicados: no hay evidencia externa de calidad en tareas estandar, lo que impide justificar su uso en produccion.
- Licencia apache-2.0, permisiva y compatible con uso comercial en lo que respecta a los pesos. Sin embargo, el autor indica que el generador `deepseek-flash` se uso bajo los terminos de la API de DeepSeek (clausula 4.2(3), que permite entrenar otros modelos con sus salidas); conviene revisar esos terminos si se reutiliza el dataset de pares generados.
- El dataset de preentrenamiento proviene de crawlers de terceros sobre la web abierta; no se documenta una revision de derechos de autor, contenido personal ni contenido danino de esas paginas.
- Cero descargas y una sola interaccion registrada en HuggingFace en la fecha de la ficha, lo que implica ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Crawlnet/queen-v1.5
- Modelo base (Queen v1): https://huggingface.co/Crawlnet/queen-v1
- Repositorio de codigo nanochat (Karpathy), commit `92d63d4e8bb4`: https://github.com/karpathy/nanochat
- Configuracion de inferencia JSON: https://huggingface.co/Crawlnet/queen-v1.5/blob/main/config.json
- Generador del ajuste de chat (DeepSeek API): https://api.deepseek.com
- Manifiesto del dataset (sha256 `1258202cf03b6202c5c69112d5a82a34ac6d9d3cb9175fb92282ff4ebea64e32`): no se proporciona URL publica en la informacion disponible.
- Transacciones de "burn" de los crawlers contribuyentes (11 en total; ejemplos):
  - https://solscan.io/tx/3Rq3GdwXGRMqy8ABJhFFdzfCHrHn3VgjCbKq6xTc979r1AhEvjmBYX4jNcExAXH5qgvMruAv7czRECx5juPak1eX
  - https://solscan.io/tx/5Sh77TJyMzMK96VUE3LMAD9tM6EQQFQYGwsMLv4b484cxTYBqFxWsQkkWRCrrwWUoea8yR68wYX3eqLX9urrok1U
  - https://solscan.io/tx/2SCdaCtmP8f5YNMQn6UadGe4uhBqkb2M32rkE1ZvTYNoC7D5ms9imRsaTAS3p2ztUdCRraDuAj17Pd9C3f9CL6F4
  - https://solscan.io/tx/DysjyPhKBeTxJnKPZbVbCoqz4SjAXzPrWDmo5W7wKPgdDRFvSGrFKwNxv1C7sbAUhVRmy1uReHhA16RbcJEwz7D
  - https://solscan.io/tx/2AiYg145PSyoKfWQMNUe1h9HBNv1dxRZSinu7ULMMH4VarnHRvbt7mXj2yXfWT5vwKyJJDRthc1oP
- Paper asociado: no disponible.
- Demo publica: no disponible.
