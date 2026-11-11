# davidheineman/nanogpt-ladder-v3-code-heavy-32m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 · code-heavy · 32M · 10 TPP es un modelo de lenguaje de tipo base (pretraining endpoint) desarrollado por davidheineman dentro de la serie NanoGPT Ladder v3, un conjunto de runs de preentrenamiento reproducibles a distintas escalas y presupuestos de tokens. El modelo resuelve el problema de disponer de checkpoints pequeños, completamente abiertos y entrenados desde cero con recetas documentadas, útiles para investigación sobre dinámicas de escalado, ablaciones de mezcla de datos y experimentos de post-entrenamiento (SFT, RL) sobre modelos de bajo coste computacional.

La arquitectura es un transformer decoder-only de estilo GPT-2 con 13 capas, anchura de 320, 5 cabezas de atención, embeddings atados, RoPE y tokenizador GPT-2 con vocabulario rellenado de 50.304 entradas. Cuenta con 32.071.680 parámetros y una longitud de contexto de 1.024 tokens. Se entrenó sobre 320.700.416 tokens de predicción (10 tokens por parámetro, TPP) en 9.787 pasos de optimización con semilla 1337, usando una mezcla "code-heavy" de la receta congelada Dolma3 Dolmino pool, donde el 80% de los datos se asigna al dominio nombrado (código).

Su relevancia es metodológica y experimental: los pesos son el punto de partida previo a condicionamiento tiny-rl, SFT y RL, por lo que se espera que generen texto plano y no estén alineados. El repositorio incluye el código nativo de carga (`model.py`, `generate.py`) y metadatos de reproducibilidad (`metadata.json` con revisiones de fuentes, pesos de mezcla y SHA256; `results.json` con el registro de finalización y evaluaciones finales).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (13 capas, width 320, 5 cabezas, tied embeddings, RoPE) |
| Parametros totales | 32.071.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`); no usa Transformers AutoModel |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 13 capas, dimensión de modelo 320, 5 cabezas de atención, embeddings de entrada y salida atados, codificación posicional rotatoria (RoPE) y tokenizador GPT-2 con vocabulario rellenado a 50.304. El checkpoint `model.pt` contiene las claves `model`, `config`, `identity` y `run`, y conserva los pesos atados de embedding y salida; no incluye estado del optimizador, aunque admite inferencia y fine-tuning posterior.

El entrenamiento consistió en un run independiente de preentrenamiento con presupuesto de 10 tokens por parámetro: 320.700.416 tokens de predicción en 9.787 pasos de optimización, semilla 1337. La mezcla de datos sigue la receta congelada del Dolma3 Dolmino pool (`allenai/dolma3_dolmino_pool`), con una variante code-heavy en la que el 80% de los datos se asigna al dominio de código. El archivo `metadata.json` registra las revisiones exactas de las fuentes, los pesos de mezcla y los hashes SHA256. No se documentan fases de RLHF, DPO ni SFT: los pesos son el endpoint de preentrenamiento previo a tiny-rl, SFT y RL.

## Capacidades

- Generación de texto autoregresiva a partir de prompts de texto plano, con decodificación greedy disponible mediante `temperature=0`.
- Modelado de lenguaje base: útil para medir pérdida y bits por byte (BPB), no para precisión en tareas.
- Preentrenamiento sesgado a código: la mezcla code-heavy asigna el 80% al dominio de código, lo que puede reflejarse en la distribución de salidas.
- Inferencia en CUDA, Apple MPS o CPU mediante `device=auto` en el script incluido.
- Punto de partida para fine-tuning y para experimentos de post-entrenamiento (SFT, RL).
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Contexto limitado a 1.024 tokens, sin extensiones documentadas.

## Casos de uso

- Investigación sobre escalado de datos: el run de 10 TPP con semilla fija permite comparar curvas de pérdida frente a otros endpoints de la misma escalera (distintos TPP o mezclas) manteniendo arquitectura y tokenizador constantes.
- Ablaciones de mezcla de datos: al ser una variante code-heavy del Dolma3 Dolmino pool, sirve para aislar el efecto de sobrerrepresentar código (80%) frente a mezclas equilibradas en modelos de 32M.
- Reproducibilidad de preentrenamiento: los metadatos con revisiones de fuentes, pesos de mezcla y SHA256 permiten replicar o auditar el run en entornos de investigación.
- Base para SFT y RL a pequeña escala: al ser un checkpoint previo a alineamiento, es adecuado como inicialización en pipelines de post-entrenamiento de bajo coste (tiny-rl, SFT) para estudiar cómo cambian las capacidades tras el alineamiento.
- Evaluación de metodologías de medición: sus evaluaciones finales son de lenguaje (BPB/loss), por lo que encaja en estudios que comparan métricas de modelado con métricas de tarea.
- Docencia y experimentación en CPU o portátil: con 32M parámetros y pesos float32, el modelo se puede cargar y ejecutar en entornos sin GPU para demostrar el funcionamiento interno de un transformer GPT-2 (atención, RoPE, embeddings atados).
- Pruebas de infraestructura de inferencia: útil como modelo de juguete para validar loaders propios, scripts de generación y flujos de descarga desde Hugging Face antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `results.json` contiene el registro de finalización y evaluaciones finales, y que las mediciones finales de BPB/loss son evaluaciones de modelado de lenguaje, no precisión en resolución de tareas.

## Requisitos de hardware

- VRAM estimada: con 32.071.680 parámetros en float32, el checkpoint ocupa aproximadamente 128 MB; en inferencia con activaciones y contexto de 1.024 tokens, el consumo es del orden de unos pocos cientos de MB, holgado en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con CUDA es suficiente. El script soporta CUDA, Apple MPS y CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU; el tamaño del repo es de 0,1 GB.
- Opciones de despliegue: carga nativa con PyTorch mediante `model.py` y `generate.py` incluidos; no usa Transformers AutoModel, por lo que vLLM, TGI o llama.cpp no están soportados de forma nativa salvo conversión manual no documentada. El autor sugiere `uvx --from huggingface_hub hf download` para la descarga.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia estructural, la propia serie NanoGPT Ladder v3 incluye otros endpoints completados de preentrenamiento (distintas mezclas y presupuestos de TPP) accesibles en la colección del autor; la comparación cuantitativa entre ellos no está disponible en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NanoGPT Ladder v3 code-heavy 32M 10 TPP | 32.071.680 | 1.024 | no disponible | Hugging Face (repo del autor) |
| Otros endpoints NanoGPT Ladder v3 | no disponible | no disponible | no disponible | Colección del autor en Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo base sin alineamiento: los pesos preceden a tiny-rl, SFT y RL, por lo que no siguen instrucciones ni mantienen formato conversacional; deben usarse con prompts de texto plano.
- Riesgo elevado de alucinación y salidas incoherentes: con 32M parámetros y 10 TPP, la calidad de generación es propia de un modelo de investigación a pequeña escala.
- Contexto muy limitado: 1.024 tokens, sin mecanismos de extensión documentados.
- Idiomas soportados no documentados; el tokenizador GPT-2 y la mezcla de datos condicionan el comportamiento lingüístico, que no está caracterizado.
- Sesgos desconocidos: no se documentan análisis de sesgo; la mezcla code-heavy puede sobrerrepresentar patrones de código en las salidas.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Evaluaciones de BPB/loss no equivalen a precisión en tareas; no deben presentarse como rendimiento funcional.
- Carga no estándar: requiere el código incluido (`model.py`, `generate.py`) y no es compatible con `AutoModel` de Transformers; los pesos están en float32 y no se documentan cuantizaciones.
- Estado del optimizador no incluido en el checkpoint, lo que limita reanudar el preentrenamiento exactamente desde ese punto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-code-heavy-32m-10tpp-seed-1337
- Colección de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de mezcla: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
