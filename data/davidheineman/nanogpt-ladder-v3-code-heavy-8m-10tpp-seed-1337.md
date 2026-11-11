# davidheineman/nanogpt-ladder-v3-code-heavy-8m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 code-heavy 8M es un modelo de lenguaje base de escala minima (8.011.776 parametros) desarrollado por davidheineman como parte de la serie NanoGPT Ladder v3, un conjunto de experimentos de preentrenamiento controlados que entrenan de forma independiente un mismo modelo con distintos presupuestos de tokens (TPP, tokens per parameter) y distintas mezclas de datos. Este checkpoint concreto corresponde al endpoint de 10 TPP sobre una mezcla "code-heavy", es decir, con el 80% de los tokens asignados al dominio de codigo segun la receta congelada del pool Dolma3 Dolmino.

El modelo es una implementacion de tipo GPT-2 (transformer decoder-only) con 8 capas, anchura 128, 4 cabezas de atencion, embeddings atados, RoPE y tokenizador GPT-2, con una longitud de contexto de 1.024 tokens y un vocabulario rellenado de 50.304 entradas. Se distribuye con pesos en float32 originales, `model.py` y `generate.py` propios, y no es compatible con `AutoModel` de Transformers: requiere su propio cargador basado en PyTorch.

Su relevancia no es la de un modelo de produccion, sino la de una pieza de investigacion reproducible: permite estudiar leyes de escalado a muy baja escala, el efecto de mezclas de datos sesgadas hacia codigo y la variabilidad entre semillas (esta es la semilla 1337). Los pesos son anteriores a cualquier fase de SFT o RL, por lo que solo admiten prompts de texto plano y generacion de continuaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (NanoGPT), con RoPE y embeddings atados |
| Parametros totales | 8.011.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (tokenizador GPT-2, predominantemente ingles; el autor no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`, float32), cargador propio; no safetensors, no GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico de estilo GPT-2 con 8 capas, dimension de modelo 128, 4 cabezas de atencion, embeddings de entrada y salida atados, codificacion posicional rotatoria (RoPE) y tokenizador GPT-2 con vocabulario rellenado a 50.304. El checkpoint contiene las claves `model`, `config`, `identity` y `run`, conserva los pesos atados de embedding y salida, y no incluye estado del optimizador, por lo que sirve para inferencia y para fine-tuning posterior pero no para reanudar el entrenamiento.

El preentrenamiento se completo con 80.117.760 tokens de prediccion en 2.445 pasos de optimizador, con semilla 1337. La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino (`allenai/dolma3_dolmino_pool`); en las mezclas "heavy" el 80% de los tokens se asigna al dominio nombrado, en este caso codigo. Cada presupuesto de tokens de la serie corresponde a un entrenamiento independiente, no a una continuacion del anterior. El fichero `metadata.json` del repositorio registra revisiones exactas de las fuentes, pesos de mezcla y SHA256, y `results.json` contiene el registro original de finalizacion y las evaluaciones finales. No se documentan fases de RLHF, DPO ni SFT en este checkpoint.

## Capacidades

- Generacion de texto autoregresiva basica: continuacion de prompts de texto plano, sin formato de chat ni plantillas de instrucciones.
- Modelado de lenguaje y evaluacion de perplejidad/BPB: el autor indica que las metricas finales son evaluaciones de lenguaje, no precision en tareas.
- Sesgo hacia codigo en la distribucion de entrenamiento (80% del dominio nombrado), lo que puede reflejarse en la generacion de fragmentos con sintaxis de lenguajes de programacion.
- Inferencia en CPU, CUDA y Apple MPS mediante `device=auto` en el script incluido.
- Decodificacion greedy con `temperature=0` y decodificacion por muestreo con temperatura.
- No dispone de tool calling, function calling, modo de razonamiento explicito, vision, audio ni capacidades de agente.
- No dispone de soporte multilingue declarado ni de ajuste por instrucciones.

## Casos de uso

- Investigacion sobre leyes de escalado a baja escala: el modelo sirve como punto de la curva 8M/10 TPP para estudiar como varia la perdida con el presupuesto de tokens y comparar con los demas endpoints de la serie NanoGPT Ladder v3.
- Estudio del efecto de mezclas de datos: al ser un run "code-heavy" con receta Dolmino congelada, permite aislar el impacto de asignar el 80% de tokens a codigo frente a mezclas equilibradas del mismo autor.
- Reproducibilidad y auditoria de experimentos: `metadata.json` con revisiones de fuentes, pesos de mezcla y SHA256, junto con `results.json`, facilita replicar el entrenamiento y verificar la procedencia de los datos.
- Baseline para fine-tuning educativo: con 8M parametros y pesos float32, se puede ajustar en una sola GPU de consumo o incluso en CPU para demostrar pipelines de SFT sobre un modelo base.
- Pruebas de infraestructura de inferencia: su tamano minimo permite validar scripts de carga, tokenizacion con `tiktoken` y decodificacion en CUDA, MPS y CPU sin coste de computo apreciable.
- Docencia y divulgacion: ilustra de forma tangible la diferencia entre un modelo base y un modelo ajustado por instrucciones, ya que solo acepta prompts de texto plano y produce continuaciones.
- Experimentos de generacion condicionada por dominio de codigo: util para medir si el sesgo de mezcla se traduce en mayor familiaridad con sintaxis de lenguajes de programacion a esta escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las mediciones finales de BPB y perdida son evaluaciones de modelado de lenguaje y no precision en resolucion de tareas, y remite a `results.json` para el registro original.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 para los pesos (8M parametros), mas el overhead de activaciones y del contexto de 1.024 tokens; cabe holgadamente en cualquier GPU.
- GPU recomendadas: ninguna en particular; funciona en CPU, Apple MPS y cualquier GPU CUDA, incluidas GTX 1060, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en todas las GPU de consumo modernas e incluso en entornos integrados.
- Opciones de despliegue: el repositorio incluye `model.py` y `generate.py` con carga nativa en PyTorch; no es compatible con `vLLM`, `llama.cpp`, `Ollama` ni `TGI` sin conversion previa, y no se publican pesos en GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos por token en CPU y muy inferior en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 code-heavy 8M 10 TPP (este) | 8,0 M | 1.024 | Base GPT-2, mezcla 80% codigo, 10 TPP | no disponible | Hugging Face, pesos PyTorch nativos |
| Otros endpoints de NanoGPT Ladder v3 | 8,0 M (misma arquitectura) | 1.024 | Distintos TPP y mezclas (equilibrada, code-heavy, etc.) | no disponible | Coleccion publica del mismo autor |
| GPT-2 small (referencia historica) | 124 M | 1.024 | Base GPT-2, mezcla web general | MIT (segun publicacion original) | Ampliamente disponible en Transformers |
| Modelos base de 8M tipo TinyStories | ~1-10 M | variable | Base entrenado en corpus sintetico de cuentos | variable por autor | Hugging Face |

La comparacion con GPT-2 small y con modelos tipo TinyStories es orientativa por escala y categoria (modelos base pequenos), no por rendimiento medido, ya que no hay benchmarks publicados para este checkpoint.

## Limitaciones y advertencias

- Es un modelo base pre-SFT y pre-RL: no sigue instrucciones, no mantiene formato de chat y solo produce continuaciones de texto plano.
- Con 8M parametros, la calidad de generacion es muy limitada y la coherencia decae rapidamente mas alla de unas pocas decenas de tokens.
- Riesgo alto de alucinacion y de texto incoherente; no es apto para tareas factuales ni para produccion.
- Contexto maximo de 1.024 tokens, sin mecanismos de extension.
- Idiomas no declarados; el tokenizador GPT-2 y la mezcla Dolmino estan orientados predominantemente al ingles.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier uso fuera de investigacion.
- El sesgo de mezcla hacia codigo (80%) puede degradar el rendimiento en texto general respecto a mezclas equilibradas de la misma serie.
- No es compatible con `AutoModel` de Transformers ni con los runners estandar (vLLM, llama.cpp, Ollama, TGI) sin trabajo de conversion.
- El checkpoint no incluye estado del optimizador, por lo que no permite reanudar el preentrenamiento.
- Las metricas publicadas son de modelado de lenguaje (BPB/perdida), no de precision en tareas; no deben interpretarse como capacidad funcional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-code-heavy-8m-10tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de preentrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Perfil del autor: https://huggingface.co/davidheineman
