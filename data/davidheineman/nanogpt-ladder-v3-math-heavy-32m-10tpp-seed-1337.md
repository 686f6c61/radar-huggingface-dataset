# davidheineman/nanogpt-ladder-v3-math-heavy-32m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 math-heavy 32M 10 TPP es un modelo de lenguaje base de tipo GPT entrenado desde cero por davidheineman como parte de la colección NanoGPT Ladder v3, una serie de experimentos de preentrenamiento a pequeña escala. El modelo cuenta con 32.071.680 parámetros y ha sido entrenado sobre 320.700.416 tokens de predicción (10 TPP, tokens por parámetro) en 9.787 pasos de optimizador, con semilla 1337. Su propósito es servir como punto de referencia reproducible para estudiar el efecto de mezclas de datos específicas (en este caso, math-heavy, con un 80% de asignación al dominio nombrado) sobre el rendimiento de modelos pequeños.

La arquitectura es un transformer GPT clásico de 13 capas, anchura 320, 5 cabezas de atención, embeddings atados, RoPE y tokenizador GPT-2, con una longitud de contexto de 1.024 tokens y vocabulario rellenado de 50.304 entradas. Los pesos originales están en float32 y se distribuyen en un checkpoint PyTorch nativo (`model.pt`) que requiere el cargador propio incluido en el repositorio (no es compatible con `AutoModel` de Transformers). Es un modelo puramente de preentrenamiento: no ha pasado por SFT, RL ni acondicionamiento tiny-rl, por lo que debe usarse con prompts de texto plano y no como asistente conversacional.

La relevancia de este modelo es fundamentalmente investigadora: forma parte de una escalera (ladder) de modelos con distintos presupuestos de tokens y mezclas de datos, lo que permite aislar el impacto de cada variable (tamaño, TPP, composición del corpus) en las métricas de validación. No está pensado para producción ni para tareas de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT (decoder-only), 13 capas, anchura 320, 5 cabezas de atencion, embeddings atados, RoPE |
| Parametros totales | 32.071.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (tokenizador GPT-2, predominantemente ingles en la practica) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), float32; cargador propio, no Transformers |
| Tokenizador | GPT-2 (`tiktoken`), vocabulario rellenado a 50.304 |
| Tokens de entrenamiento | 320.700.416 (10 TPP) |
| Pasos de optimizador | 9.787 |
| Semilla | 1337 |
| Dataset | allenai/dolma3_dolmino_pool (mezcla math-heavy, 80% al dominio nombrado) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la implementacion de referencia de NanoGPT: un transformer decoder-only con 13 capas, dimension de modelo 320, 5 cabezas de atencion, embeddings de entrada y salida atados, codificacion posicional rotatoria (RoPE) y tokenizador GPT-2 con vocabulario rellenado hasta 50.304. El checkpoint contiene las claves `model`, `config`, `identity` y `run`, y preserva los pesos atados de embedding y salida; no incluye estado del optimizador, por lo que sirve para inferencia y fine-tuning posterior, pero no para reanudar el entrenamiento de forma exacta.

El entrenamiento se realizo sobre el pool Dolma3 Dolmino con una receta de mezcla congelada. La variante math-heavy asigna un 80% de la mezcla al dominio matematico nombrado. Se consumieron 320.700.416 tokens de prediccion (10 TPP) en 9.787 pasos de optimizador con semilla 1337. El repositorio incluye `metadata.json` con las revisiones exactas de las fuentes, los pesos de mezcla y los hashes SHA256, asi como `results.json` con el registro de finalizacion y las evaluaciones finales. No se documentan tecnicas de RLHF, DPO, SFT ni decodificacion especulativa; el modelo es exclusivamente un punto final de preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva a partir de prompts de texto plano, en modo base (sin instrucciones).
- Modelado de lenguaje y continuacion de secuencias dentro de una ventana de 1.024 tokens.
- Capacidad de fine-tuning posterior sobre el checkpoint (sin estado de optimizador).
- Soporte de decodificacion greedy (`temperature=0`) y con muestreo por temperatura.
- Ejecucion en CUDA, Apple MPS o CPU mediante `device=auto`.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- Capacidades multilingues no documentadas; el tokenizador GPT-2 y el corpus Dolmino implican un sesgo fuerte hacia el ingles.

## Casos de uso

- Investigacion sobre mezclas de datos: comparar este checkpoint math-heavy contra las variantes de otras mezclas de la misma escalera para medir el efecto de la composicion del corpus en la perdida de validacion (BPB/loss).
- Estudios de escalado a pequena escala: usar los distintos puntos de la escalera (diferentes TPP y tamanos) para trazar curvas de escalado reproducibles con semilla fija.
- Reproduccion de experimentos: el `metadata.json` con revisiones de fuentes, pesos de mezcla y SHA256 permite replicar exactamente el preentrenamiento en un entorno controlado.
- Punto de partida para fine-tuning: al conservar los pesos atados y no incluir estado del optimizador, es adecuado como inicializacion para tareas posteriores de ajuste supervisado en entornos academicos.
- Docencia y divulgacion: modelo lo bastante pequeno (32M parametros, repo de 0,1 GB) para ejecutarse en CPU o en una GPU consumer y explicar el ciclo completo de preentrenamiento GPT.
- Pruebas de infraestructura: validar pipelines de descarga, carga de checkpoints nativos y generacion con `generate.py` antes de escalar a modelos mayores de la misma familia.
- Analisis de sesgos de dominio: al estar sesgado hacia matematicas, sirve para estudiar como una mezcla de dominio influye en la generacion de texto general frente a texto tecnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `results.json` contiene las evaluaciones finales, pero los valores concretos (BPB/loss) no se incluyen en la informacion proporcionada. El autor advierte explicitamente que las mediciones finales de BPB/loss son evaluaciones de modelado de lenguaje, no precision en resolucion de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (32M parametros x 4 bytes ≈ 128 MB de pesos, mas activaciones y cache KV para 1.024 tokens, marginales).
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en CPU.
- GPU recomendadas: no se requieren GPUs de datacenter (A100/H100) para inferencia; cualquier GPU con soporte CUDA o Apple MPS es suficiente.
- Opciones de despliegue: el repositorio incluye `model.py` y `generate.py` con carga nativa PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el uso de `AutoModel` de Transformers no esta soportado.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia muy baja en hardware consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| nanogpt-ladder-v3-math-heavy-32m-10tpp-seed-1337 | 32,07M | 1.024 | 320,7M (10 TPP) | no disponible | PyTorch nativo |
| Otras variantes de NanoGPT Ladder v3 (misma coleccion) | variable segun punto de la escalera | 1.024 | variable | no disponible | PyTorch nativo |
| GPT-2 small (referencia historica) | 124M | 1.024 | ~40.000M (aprox.) | MIT (segun publicacion original) | PyTorch / safetensors |
| Modelos base de 30-50M tipo Pythia o similares | ~70M-160M segun variante | 2.048 | decenas de miles de millones | Apache 2.0 en algunas variantes | safetensors |

La comparacion con GPT-2 small o Pythia es solo orientativa: este modelo es un experimento de investigacion con un presupuesto de tokens muy inferior (10 TPP frente a cientos o miles de TPP en modelos de referencia) y sin benchmarks publicados. No se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base de preentrenamiento: no sigue instrucciones, no mantiene conversaciones de asistente y no debe usarse con prompts tipo chat.
- Ventana de contexto muy reducida (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Presupuesto de entrenamiento muy bajo (320,7M tokens, 10 TPP): la calidad de generacion sera limitada y propensa a incoherencias y repeticiones.
- Sesgo de dominio: la mezcla math-heavy asigna un 80% al dominio matematico, lo que puede degradar la generacion de texto general.
- Riesgo elevado de alucinacion y de texto factualmente incorrecto; no apto para produccion ni para decisiones automatizadas.
- Idiomas soportados no documentados; en la practica, fuertemente sesgado hacia el ingles por el tokenizador GPT-2 y el corpus Dolmino.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier uso fuera de investigacion.
- El checkpoint no incluye estado del optimizador, por lo que no permite reanudar el entrenamiento de forma exacta.
- No es compatible con `AutoModel` de Transformers; requiere el cargador propio del repositorio, lo que limita la integracion con ecosistemas estandar (vLLM, TGI, llama.cpp).
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-math-heavy-32m-10tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio NanoGPT (implementacion de referencia): https://github.com/karpathy/nanoGPT
- Tokenizador GPT-2 (tiktoken): https://github.com/openai/tiktoken
