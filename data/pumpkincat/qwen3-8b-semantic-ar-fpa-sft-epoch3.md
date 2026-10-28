# PumpkinCat/qwen3-8b-semantic-ar-fpa-sft-Epoch3

## Resumen

Qwen3-8B Semantic AR-FPA SFT — Epoch3 es un ajuste fino supervisado (SFT) del modelo denso Qwen3-8B, publicado por el usuario PumpkinCat. El modelo conserva los 8.190.735.360 parámetros del modelo base, pero sustituye el mecanismo de atención estándar por uno propio denominado "Semantic AR-FPA", acompañado de un decodificador específico con gestión de caché KV y de lo que la model card llama "tokens de comunicación". El objetivo declarado es el razonamiento con "parallel thinking": la generación se organiza en bloques de tokens (parámetro `max_block_tokens`) en lugar de una secuencia estrictamente lineal.

El interés del modelo es fundamentalmente experimental. No se presenta como un sustituto listo para producción de Qwen3-8B, sino como un artefacto de investigación que incluye pesos en BF16, tokenizador, código independiente del modelo y de la atención, scripts de generación con caché KV y un evaluador. Se ha entrenado durante 3 épocas y 1.266 pasos de optimizador sobre los conjuntos Polar-37K-ark y OpenThoughts-114k-ark, con una pérdida de validación de 0,3802.

La relevancia práctica es limitada pero concreta: permite reproducir y auditar una variante de atención no estándar sobre una base conocida, algo poco habitual en el ecosistema. Ahora bien, el repositorio no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), el benchmark propio de 111 preguntas no se ha ejecutado completo y el modelo solo declara soporte de inglés. Su licencia Apache-2.0 y su naturaleza de código personalizado condicionan el despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de Qwen3-8B con atención propietaria "Semantic AR-FPA" y decodificación por bloques (paralela); detalles internos de la atención no disponibles |
| Parámetros totales | 8.190.735.360 (8,19 B) |
| Parámetros activos | No aplica: modelo denso, no se declara arquitectura MoE |
| Longitud de contexto | No disponible en la model card; la generación se controla con `max_block_tokens` (512 en los ejemplos) y `max_new_tokens` (hasta 4096 en la evaluación) |
| Tipos de cuantización | No disponible; solo se publican pesos BF16. No se ofrecen GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (BF16) + código Python propio (`fpa_generate.py`, `eval_fpa.py`) |
| Tamaño del repositorio | 16,4 GB |
| Librería declarada | PyTorch |
| Dependencias | Python 3.12, `torch==2.9.0`, `transformers==5.8.1`, `safetensors`, `huggingface-hub`, `flash-attn==2.8.3` |
| Hardware mínimo declarado | GPU CUDA con soporte de BF16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder denso de 8,19 mil millones de parámetros, y le aplica una modificación de atención bautizada como Semantic AR-FPA. La model card no documenta la formulación matemática de esa atención, ni el número de cabezas, ni la dimensionalidad, ni si se ha reentrenado desde cero o se ha adaptado mediante cirugía del modelo base. Lo que sí se explicita es el mecanismo de generación: el decodificador incluido gestiona "tokens de comunicación" y produce la salida en bloques acotados por `max_block_tokens`, lo que en la práctica implica un esquema de razonamiento paralelo donde varias subtareas hermanas pueden generarse dentro del mismo bloque.

El entrenamiento es un SFT de 3 épocas y 1.266 pasos de optimizador sobre dos conjuntos: Polar-37K-ark y OpenThoughts-114k-ark. No se detalla la composición exacta de esos datasets, el número total de tokens procesados, la tasa de aprendizaje, el tamaño de batch ni si hubo fases posteriores de RLHF o DPO. La pérdida final de entrenamiento es 0,3743 y la de validación 0,3802, con las curvas guardadas en `assets/training_curve.png` y las mediciones crudas en `loss_curve.jsonl`. La innovación destacable es, por tanto, el par atención propia más decodificación por bloques con caché KV, no la receta de datos.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat por roles (`user`, `assistant`).
- Razonamiento matemático: el ejemplo de la model card resuelve una ecuación de segundo grado (`x^2 - 5*x + 6 = 0`) con 1024 tokens nuevos y temperatura 0.
- Razonamiento multi-paso con "parallel thinking": generación de subtareas hermanas dentro de un mismo bloque de hasta 512 tokens.
- Inferencia con caché KV mediante el decodificador propio, requisito para un rendimiento razonable en secuencias largas.
- Evaluación integrada con coincidencia exacta normalizada sobre un conjunto de preguntas tipo Polar.
- Capacidad de ajuste del presupuesto de generación (`max_new_tokens` hasta 4096, `max_block_tokens` configurable, `temperature`, `seed`).
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card ni en el código descrito).
- Capacidades de agente autónomo: no disponible.
- Visión, audio o multimodalidad: no disponible; el pipeline es únicamente `text-generation`.
- Capacidades multilingües: no disponibles; solo se declara inglés.

## Casos de uso

- Investigación en mecanismos de atención alternativos: el repositorio incluye la implementación completa de la atención Semantic AR-FPA y del decodificador, lo que permite reproducir el experimento, instrumentar la atención y comparar activaciones contra Qwen3-8B base sin reimplementar nada.
- Estudio de decodificación paralela: los parámetros `max_block_tokens` y el manejo de tokens de comunicación permiten medir cómo varía la calidad y el número de tokens generados al cambiar el tamaño de bloque, un experimento útil para quien investigue "parallel thinking" o decodificación no lineal.
- Evaluación de recetas de SFT: al estar entrenado sobre Polar-37K-ark y OpenThoughts-114k-ark con curvas de pérdida publicadas, sirve como punto de partida para comparar hiperparámetros (épocas, datos, tasa de aprendizaje) manteniendo fija la arquitectura.
- Automatización de evaluación de razonamiento matemático: `eval_fpa.py` permite lanzar un pipeline reproducible con métricas en JSON y predicciones en JSONL, adecuado para auditorías internas de modelos de razonamiento aunque no valide equivalencia simbólica.
- Generación de respuestas de razonamiento en inglés para prototipos: con 4096 tokens nuevos y caché KV puede sostener cadenas de razonamiento largas en un entorno controlado, siempre que el despliegue se haga con el decodificador incluido.
- Docencia y formación técnica: el par `fpa_generate.py` / `eval_fpa.py` es un ejemplo autocontenido de cómo empaquetar un modelo con atención personalizada, útil en cursos sobre implementación de transformers.
- Auditoría de robustez de la generación: los fallos documentados (repetición de subtareas hermanas, tramas malformadas con decodificación greedy) permiten diseñar pruebas de estrés sobre estabilidad de salida en esquemas de bloques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos publicados son los de entrenamiento y validación del artefacto:

| Prueba | Resultado | Fuente |
|---|---|---|
| Pérdida de entrenamiento (época 3) | 0,3743 | model card |
| Pérdida de validación | 0,3802 | model card |
| Pasos de optimizador | 1.266 | model card |
| Épocas | 3 | model card |
| Tests de validación internos | 31 tests y 35 subtests superados (atención, paridad con el modelo, corrección de caché KV y puntuación) | `validation_report.json` |
| Smoke test de inferencia held-out | 1 pregunta acertada con coincidencia exacta | model card |
| Benchmark Polar completo (111 preguntas held-out) | No ejecutado | model card |
| MMLU / HumanEval / GSM8K / MT-Bench | No disponible | — |

Advertencia metodológica de la propia model card: el evaluador usa coincidencia exacta normalizada y no comprueba equivalencia matemática simbólica, por lo que una respuesta formalmente distinta pero correcta se contabilizaría como error.

## Requisitos de hardware

- VRAM para inferencia en BF16: los pesos suman unos 16,4 GB; con caché KV y activaciones hay que prever un mínimo práctico de 20-24 GB para `max_new_tokens` moderados y bloques de 512 tokens.
- Cabe en GPU de consumo de 24 GB: RTX 4090 y RTX 3090 son las opciones viables, aunque con margen ajustado y dependiendo de la longitud de contexto efectiva.
- No cabe en GPU de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000) y no hay cuantizaciones publicadas para reducir la huella.
- GPU profesionales recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB.
- Requisito imprescindible: GPU CUDA con soporte BF16 y `flash-attn==2.8.3` compilado; se indica explícitamente instalar primero una build de PyTorch compatible con CUDA.
- Opciones de despliegue: limitadas al decodificador incluido (`from fpa_generate import generate, load_fpa`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la atención personalizada más el manejo de tokens de comunicación hacen improbable un despliegue directo en esos motores sin trabajo de portabilidad.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo por petición.

## Comparativa con modelos similares

Los datos de las alternativas no provienen de la información proporcionada para este modelo, sino de conocimiento general del ecosistema; se marcan como no verificados en esta ficha los campos que no se han podido contrastar aquí.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PumpkinCat/qwen3-8b-semantic-ar-fpa-sft-Epoch3 | 8,19 B (denso) | No disponible | Sin benchmarks publicados; solo validación interna | Apache-2.0 | HuggingFace, requiere código propio |
| Qwen/Qwen3-8B (base) | 8,19 B (denso) | Según model card del base, no verificada aquí | Benchmarks públicos del base, no comparables directamente | Apache-2.0 | HuggingFace, transformers estándar |
| Llama-3.1-8B-Instruct | ~8 B (denso) | No verificado | Benchmarks públicos del autor | Llama 3.1 Community License | HuggingFace, amplio soporte de motores |
| Mistral-7B-Instruct-v0.3 | ~7,2 B (denso) | No verificado | Benchmarks públicos del autor | Apache-2.0 | HuggingFace, amplio soporte de motores |

La diferencia clave frente a las alternativas no es de rendimiento medido, sino de compatibilidad: este fine-tune exige su propio decodificador, mientras que las otras tres opciones funcionan con `transformers`, vLLM o llama.cpp sin cambios.

## Limitaciones y advertencias

- Inestabilidad de generación documentada por el autor: con decodificación greedy el modelo puede repetir subtareas hermanas o producir "tramas" malformadas, lo que obliga a revisar las salidas antes de usarlas.
- Respuestas parciales: los límites de tokens pueden truncar la respuesta a mitad de bloque; hay que revisar las completaciones guardadas junto a las puntuaciones.
- Ausencia de benchmarks estándar: no hay MMLU, HumanEval ni GSM8K, y el benchmark propio de 111 preguntas no se ha ejecutado completo. La única evidencia de calidad es un smoke test de una pregunta.
- Evaluación limitada: la métrica es coincidencia exacta normalizada, sin equivalencia simbólica, lo que infravalora respuestas correctas con formato distinto.
- Idioma: solo se declara inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Contexto: la longitud de contexto no se especifica en la model card; usar el modelo con secuencias largas requiere verificación empírica propia.
- Dependencia de código personalizado: la atención Semantic AR-FPA y el manejo de tokens de comunicación no están integrados en `transformers` estándar, lo que bloquea vLLM, TGI, llama.cpp u Ollama sin un port.
- Sin cuantizaciones: no hay GGUF ni AWQ/GPTQ, de modo que el despliegue en hardware modesto no es posible por la vía habitual.
- Licencia: Apache-2.0 permite uso comercial, pero el titular no ofrece garantías y las dependencias (`flash-attn`, `transformers` 5.8.1, `torch` 2.9.0) imponen sus propias condiciones y una versionización muy concreta.
- Falta de validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta; no hay informes independientes de terceros.
- Sesgos y alucinaciones: no se documenta ninguna evaluación de sesgos ni de tasa de alucinación; al heredar el modelo base y añadir un esquema de generación no estándar, el riesgo de deriva en razonamientos largos no está cuantificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PumpkinCat/qwen3-8b-semantic-ar-fpa-sft-Epoch3
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Código de generación con caché KV: `fpa_generate.py` (en el repositorio del modelo)
- Script de evaluación: `eval_fpa.py` (en el repositorio del modelo)
- Conjunto de evaluación: `eval_polar.jsonl` (111 preguntas held-out, en el repositorio)
- Informe de validación: `validation_report.json` (en el repositorio)
- Curva de entrenamiento: `assets/training_curve.png` y `loss_curve.jsonl` (en el repositorio)
- Paper, blog, demo o repositorio adicional: no disponible en la información proporcionada
