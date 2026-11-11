# davidheineman/nanogpt-ladder-v3-code-heavy-16m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 code-heavy 16M 10TPP es un modelo de lenguaje base de pequeno tamano (15,85 millones de parametros) entrenado desde cero por el desarrollador independente davidheineman dentro del proyecto NanoGPT Ladder v3. Se trata de un punto de control de preentrenamiento completado, es decir, los pesos se encuentran antes de cualquier fase de alineacion (SFT, RL o condicionamiento tiny-rl), por lo que su funcion es servir como modelo de lenguaje puro para investigacion sobre escalado, mezclas de datos y recetas de preentrenamiento.

El modelo emplea una arquitectura transformer decoder-only clasica tipo GPT-2, con 14 capas, anchura de 192, 6 cabezas de atencion, embeddings atados, RoPE y tokenizador GPT-2, sobre una ventana de contexto de 1.024 tokens. La variante "code-heavy" indica que la mezcla de datos reserva un 80% al dominio de codigo dentro de la receta congelada Dolma3 Dolmino pool, lo que lo hace interesante para estudiar el efecto de la composicion del corpus en modelos diminutos.

Su relevancia es fundamentalmente metodologica: cada presupuesto de tokens (10 TPP, es decir, 10 tokens por parametro) es una ejecucion entrenada de forma independiente con semilla fija 1337, lo que permite reproducir y comparar puntos de la "escalera" de escalado. No esta pensado como modelo de produccion, sino como material reproducible para experimentos de scaling laws y ablaciones de mezcla de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (14 capas, anchura 192, 6 cabezas, embeddings atados, RoPE) |
| Parametros totales | 15.851.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | no disponible (tokenizador GPT-2, predominantemente ingles en la practica) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), cargador propio; no compatible con `AutoModel` de Transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 14 capas, dimension de modelo 192 y 6 cabezas de atencion, con embeddings de entrada y salida atados y codificacion posicional rotatoria (RoPE). Usa el tokenizador GPT-2 con vocabulario rellenado (padded) de 50.304 entradas. El checkpoint `model.pt` incluye las claves `model`, `config`, `identity` y `run`, y conserva los pesos atados de embedding y salida; no incluye estado del optimizador, por lo que sirve para inferencia y fine-tuning adicional, pero no para reanudar el entrenamiento de forma exacta.

El preentrenamiento se completo con 158.498.816 tokens de prediccion en 4.837 pasos de optimizador, con semilla 1337. La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino (`allenai/dolma3_dolmino_pool`); en las mezclas "heavy" el 80% del corpus se asigna al dominio nombrado, en este caso codigo. El repositorio incluye `metadata.json` con las revisiones exactas de las fuentes, los pesos de mezcla y los hashes SHA256, y `results.json` con el registro original de finalizacion y las evaluaciones finales. Las metricas finales son de tipo BPB/perdida de lenguaje, no de exactitud en tareas.

## Capacidades

- Generacion de texto autoregresiva basica a partir de prompts de texto plano (sin plantilla de chat ni formato de instrucciones).
- Modelado de lenguaje puro: util para medir perplejidad y BPB sobre corpus de codigo y texto.
- Especializacion parcial en codigo derivada de la mezcla code-heavy (80% del dominio nombrado), sin garantia de calidad de codigo funcional a esta escala.
- Punto de partida para fine-tuning supervisado y experimentos de alineacion (el autor indica que los pesos preceden a SFT y RL).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo "thinking".
- Sin capacidades de vision ni audio.
- Capacidades multilingues no documentadas; el tokenizador GPT-2 y el corpus Dolmino estan orientados al ingles.

## Casos de uso

- Investigacion en scaling laws: el modelo es un punto reproducible (16M, 10 TPP, semilla 1337) de una escalera de modelos, util para ajustar curvas de perdida frente a tokens y parametros.
- Ablaciones de mezcla de datos: comparar esta variante code-heavy con las variantes de otros dominios de la misma coleccion para aislar el efecto de la composicion del corpus.
- Baseline de preentrenamiento: servir como referencia de perdida/BPB antes de aplicar SFT o RL en pipelines de investigacion academica.
- Fine-tuning ligero en tareas de dominio: al ser un checkpoint base de 16M, se puede ajustar en una sola GPU consumer para experimentos de adaptacion a un corpus especifico.
- Pruebas de infraestructura y tooling: su tamano minimo permite validar pipelines de entrenamiento, tokenizacion y evaluacion (incluido el cargador propio incluido en el repo) sin coste de computo.
- Docencia y divulgacion: ilustrar el funcionamiento interno de un transformer GPT-2 a escala manejable, con codigo de carga e inferencia incluido (`model.py`, `generate.py`).
- Generacion de texto de baja exigencia en prototipos: completar prompts de texto plano en demos locales con CUDA, Apple MPS o CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones finales son evaluaciones de lenguaje (BPB/perdida) y no exactitud en tareas, y remite a `results.json` para el registro original, cuyo contenido no se ha proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (15,85M parametros, ~63 MB de pesos), mas overhead de activaciones y del tokenizador; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA (por ejemplo, RTX 3060, RTX 4090), Apple Silicon via MPS o incluso CPU; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas y en CPU.
- Opciones de despliegue: el repositorio incluye `generate.py` con `device=auto` (CUDA, MPS o CPU) y carga mediante el cargador propio `model.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al usar una arquitectura personalizada no es compatible con `AutoModel` de Transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 code-heavy 16M 10TPP (este modelo) | 15,85M | 1.024 | Base GPT-2, mezcla code-heavy, semilla 1337 | no disponible | Hugging Face (repo 0,1 GB) |
| Otras variantes de NanoGPT Ladder v3 | no disponible | no disponible | Misma escalera, otros dominios/mezclas | no disponible | Coleccion en Hugging Face |
| GPT-2 small (referencia arquitectonica) | 124M | 1.024 | Base GPT-2 original | MIT (segun el release original) | Ampliamente disponible |
| Modelos tipo TinyLlama / SmolLM (referencia de escala) | 135M-1.1B | 2.048+ | Base/instruccion modernos | variable | Hugging Face |

La comparacion con GPT-2 small y modelos tipo SmolLM es solo orientativa por escala y proposito; no se dispone de datos de rendimiento comparables de este modelo.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones ni mantiene formato de chat; el autor recomienda usar prompts de texto plano.
- Escala muy reducida (15,85M parametros): la calidad de generacion y la coherencia son limitadas; no es apto para produccion.
- Riesgo alto de alucinacion y de texto incoherente, inherente a un modelo de este tamano y a su estado de preentrenamiento.
- Contexto maximo de 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas no documentados; el tokenizador GPT-2 y el corpus de origen estan centrados en ingles, por lo que el rendimiento en castellano es incierto.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier explotacion.
- Pesos en float32 sin cuantizaciones publicadas ni soporte en runtimes estandar (vLLM, llama.cpp, Ollama), lo que limita su integracion en stacks de produccion.
- No incluye estado del optimizador, por lo que no permite reanudar el entrenamiento original de forma exacta.
- Las metricas publicadas son de perdida/BPB, no de exactitud en tareas; no deben interpretarse como rendimiento funcional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-code-heavy-16m-10tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
