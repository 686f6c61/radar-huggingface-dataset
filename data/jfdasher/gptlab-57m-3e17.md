# jfdasher/gptlab-57m-3e17

## Resumen

`jfdasher/gptlab-57m-3e17` es un modelo de lenguaje de 57.132.544 parámetros entrenado desde cero en PyTorch por el autor jfdasher, publicado en Hugging Face como parte de un estudio de *scaling laws* con asignación óptima de cómputo (run interno `test/3e+17`). Sigue una arquitectura tipo Llama (transformer decoder-only denso, 17 capas, anchura 512, embeddings atados) con tokenizador propio BPE byte-level de 8192 tokens y una ventana de contexto de 512 tokens.

No es un modelo orientado a uso productivo: es un artefacto de investigación que documenta un punto concreto de la curva de escalado, con 875.167.744 tokens de entrenamiento, 3e+17 FLOPs (estimados como 6·N·D) y una pérdida de validación de 3,0407 nats/token (1,1332 bits por byte). El entrenamiento se hizo sobre el subconjunto `sample-10BT` de FineWeb-Edu, con partición train/val por hash de documento para evitar filtración, y sin ajuste por instrucciones ni alineación de seguridad.

Su interés práctico está en la reproducibilidad y el coste: 0,37 GPU-horas y 1,47 USD por ejecución. Resulta útil como referencia de un punto de la curva de escalado, como banco de pruebas barato para tooling de inferencia y cuantización, y como material docente para mostrar un pipeline completo de entrenamiento desde cero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, estilo Llama (17 capas × anchura 512, embeddings atados) |
| Parametros totales | 57.132.544 (con embeddings atados) |
| Parametros activos | No aplica: modelo denso (no es MoE) |
| Parametros no-embedding | 52.938.240 |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible: el autor solo publica pesos en safetensors; no hay variantes GGUF, AWQ, GPTQ ni bitsandbytes publicadas |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`, arquitectura declarada `llama`) |
| Tokenizador | BPE byte-level propio, 8192 tokens |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu, subconjunto `sample-10BT` (ODC-By) |
| Tokens de entrenamiento | 875.167.744 |
| Computo de entrenamiento | 3e+17 FLOPs (6·N·D); 0,37 GPU-horas; 1,47 USD |
| Perdida de validacion | 3,0407 nats/token; 1,1332 bits por byte |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-20 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de tipo Llama, con 17 capas y dimensión de modelo 512, y con la matriz de embeddings atada a la cabeza de salida (`tied embeddings`), lo que explica la diferencia entre los 57.132.544 parámetros totales y los 52.938.240 no-embedding. No se detallan en la información disponible aspectos como el número de cabezas de atención, el uso de GQA/MQA, la codificación posicional (RoPE u otra), la función de activación ni el tipo de normalización; tampoco se especifica si se usaron kernels optimizados (FlashAttention, fused AdamW) ni el hardware exacto. El coste declarado de 0,37 GPU-horas para 3e+17 FLOPs implica un rendimiento efectivo del orden de 2,25e14 FLOP/s si el tiempo corresponde a una única GPU, cifra coherente con una GPU de datacenter moderna en precisión reducida, aunque el autor no lo confirma.

El entrenamiento se hizo en PyTorch "from scratch", sin etapas de ajuste fino supervisado, RLHF ni DPO. El corpus es FineWeb-Edu `sample-10BT`, un subconjunto de texto web filtrado por calidad educativa, con partición train/validación basada en hash de documento para evitar que documentos idénticos aparezcan en ambos conjuntos. El tokenizador es propio, BPE byte-level de 8192 tokens, un vocabulario muy pequeño en comparación con los 32k-128k habituales, lo que aumenta el número de tokens por palabra y penaliza ligeramente el contexto efectivo en caracteres. No se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa, MoE o arquitecturas híbridas).

## Capacidades

- Generación de texto autoregresiva en inglés: completar prefijos y continuar documentos, con coherencia limitada a nivel de frase corta.
- Modelo base sin instrucciones: no sigue órdenes, no mantiene formato de chat ni responde a preguntas de forma fiable.
- Sin soporte de *tool calling* ni *function calling*: no hay plantilla de herramientas ni entrenamiento asociado.
- Sin capacidades de agente ni razonamiento multi-paso; no dispone de modo "thinking" ni cadena de pensamiento entrenada.
- Solo inglés: el vocabulario de 8192 tokens fragmenta agresivamente otros idiomas, incluido el castellano.
- Sin visión, audio ni multimodalidad: pipeline estrictamente `text-generation`.
- Capacidad "especial" de carácter meta: servir como punto reproducible de una curva de escalado con coste y pérdida de validación documentados.

## Casos de uso

- Reproducción de estudios de scaling laws: el modelo representa un punto concreto (3e+17 FLOPs, 875M tokens, 57M parámetros) que se puede reentrenar con el mismo presupuesto de 0,37 GPU-horas para validar fórmulas de asignación óptima de cómputo o comparar recetas de tokenizador.
- Docencia de entrenamiento desde cero: al ser un repositorio de 0,2 GB y un entrenamiento de horas-GPU bajas, permite mostrar en clase el ciclo completo (tokenización, split por hash, entrenamiento, evaluación en nats/token y bits por byte) sin infraestructura dedicada.
- Pruebas de humo (smoke tests) en CI/CD de servidores de inferencia: valida el arranque de vLLM, TGI o `transformers` con arquitectura `llama` y pesos safetensors en segundos, sin consumir GPU de forma significativa.
- Banco de pruebas de cuantización: al caber en cualquier GPU consumer, sirve para medir el impacto de INT8/INT4 en perplejidad y latencia antes de aplicar la misma receta a modelos de mayor tamaño.
- Evaluación comparativa de tokenizadores: su vocabulario de 8192 tokens permite experimentar con métricas de fertilidad (*tokens por palabra*) y con el efecto de ampliar el vocabulario en la pérdida por byte.
- Baseline para experimentos de ajuste fino en dominios pequeños: 57M parámetros permiten iterar arquitecturas, tasas de aprendizaje y schedules en minutos sobre una única GPU, usando este modelo como referencia no ajustada.
- Demos offline en hardware muy limitado: su tamaño permite inferencia en CPU, GPUs integradas o dispositivos tipo Raspberry Pi, útil para prototipos de generación de texto sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones de sentido común o sesgo). El autor solo reporta métricas de entrenamiento y validación, que se recogen a continuación:

| Metrica | Valor |
|---|---|
| Perdida de validacion (nats/token) | 3,0407 |
| Perdida de validacion (bits por byte) | 1,1332 |
| Tokens de entrenamiento | 875.167.744 |
| Computo de entrenamiento | 3e+17 FLOPs (6·N·D) |
| Coste declarado | 0,37 GPU-horas; 1,47 USD |
| Parametros totales / no-embedding | 57.132.544 / 52.938.240 |

Las muestras cualitativas incluidas en la model card (temperatura 0,8, top-k 50) muestran texto gramatical a nivel local pero factualmente falso e incoherente a nivel global, lo que es consistente con una pérdida de validación de 3,04 nats/token en un modelo de este tamaño.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo teórico a partir de 57,1M parámetros, sin overhead de runtime): ~229 MB en FP32, ~114 MB en FP16/BF16, ~57 MB en INT8 y ~29 MB en INT4.
- Caché KV: muy reducida dado el contexto de 512 tokens; del orden de decenas de MB en FP16 asumiendo atención multi-cabeza completa (no se especifica el número de cabezas ni si hay GQA).
- GPU recomendadas: cualquier GPU consumer sirve (RTX 3060, RTX 4060, RTX 4090); no requiere A100, H100 ni L40S. También es viable en GPUs integradas.
- CPU: inferencia prácticanmente viable en CPU y en dispositivos de baja potencia; el repositorio completo ocupa 0,2 GB.
- Opciones de despliegue: `transformers` (ruta nativa), vLLM y TGI (el modelo está etiquetado como `text-generation-inference` y `endpoints_compatible`, y declara arquitectura `llama`). Para llama.cpp u Ollama sería necesaria una conversión a GGUF que el autor no publica.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ajuste por instrucciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gptlab-57m-3e17 | 57,1M | 512 | No | Apache-2.0 | Hugging Face, safetensors |
| GPT-2 small | 124M | 1024 | No | Modified MIT | Pesos publicos, ampliamente soportado |
| Pythia-70m-deduped | 70M | 2048 | No | Apache-2.0 | Hugging Face, con suite de checkpoints intermedios |
| SmolLM-135M | 135M | 2048 | No (existe variante instruct) | Apache-2.0 | Hugging Face, con versiones GGUF de la comunidad |

La comparación se limita a parámetros, contexto, licencia y disponibilidad, porque no hay benchmarks publicados para gptlab-57m-3e17. Los datos de los modelos comparados provienen de sus fichas públicas y conviene verificarlos antes de citarlos. Frente a ellos, la diferencia principal de gptlab-57m-3e17 no es el rendimiento sino la trazabilidad del experimento: coste, cómputo y pérdida de validación documentados para un punto exacto de la curva de escalado, con contexto notablemente más corto (512 frente a 1024-2048 tokens).

## Limitaciones y advertencias

- Calidad de texto muy baja: el propio autor advierte que el modelo produce texto falso e incoherente; las muestras publicadas incluyen afirmaciones históricas y científicas erróneas.
- Sin ajuste por instrucciones ni alineación de seguridad: no es apto para chat, atención al cliente ni ninguna aplicación orientada a usuario final.
- Solo inglés: el vocabulario de 8192 tokens fragmenta otros idiomas y agrava la incoherencia en castellano.
- Contexto de 512 tokens: insuficiente para documentos largos, conversaciones multi-turno o tareas de recuperación aumentada con contexto extenso.
- Sesgos del corpus: texto web angloparlante filtrado por criterio de "calidad educativa", lo que sobrerrepresenta ciertos registros y dominios y puede infrarrepresentar otros; no se ha publicado ninguna evaluación de sesgos.
- Riesgo de alucinación: máximo, al no existir entrenamiento factual ni mecanismo de abstención.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero la calidad del modelo desaconseja cualquier despliegue en producción; la licencia no exime de responsabilidad sobre las salidas.
- Falta de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de evaluación.
- Metadatos a revisar: la fecha de creación declarada (2026-10-20) debe comprobarse en la ficha original antes de citarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jfdasher/gptlab-57m-3e17
- Run de W&B del entrenamiento: https://forge.coreweave.com/wandb/jfdasher-thermopylae-systems/gptlab-scaling/runs/2e93fa9c0ffe
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Commit de codigo referenciado: `0e18694c7f00d5b3f279e693d29b994b091bdbfc-dirty` (no se proporciona URL publica del repositorio)
- Paper o informe tecnico: no disponible
- Demo o espacio interactivo: no disponible
