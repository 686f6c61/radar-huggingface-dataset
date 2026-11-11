# davidheineman/nanogpt-ladder-v3-web-heavy-16m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 web-heavy 16M es un modelo de lenguaje base de pequeno tamano (15,85 millones de parametros) entrenado desde cero por el autor independiente davidheineman como parte de la coleccion "NanoGPT Ladder v3", una serie de runs de preentrenamiento controlados que varian el presupuesto de tokens y la mezcla de datos. El modelo sigue la estela de nanoGPT de Andrej Karpathy: una implementacion minimalista de un transformer decoder-only en PyTorch, sin dependencias de la libreria Transformers, pensada para experimentacion reproducible en preentrenamiento.

El checkpoint publicado es el punto final de un run completo de preentrenamiento: 15.851.520 parametros, 158.498.816 tokens de prediccion, 4.837 pasos de optimizador y semilla 1337. La variante "web-heavy" usa una mezcla de datos del pool Dolma3 Dolmino de AllenAI en la que el 80% del contenido se asigna al dominio web. Se trata de un modelo base puro: los pesos preceden a cualquier fase de SFT, RL o condicionamiento tiny-rl, por lo que solo admite continuacion de texto con prompts en texto plano.

Su relevancia no esta en el rendimiento de tarea (es un modelo de juguete a efectos practicos) sino en su valor como artefacto de investigacion: permite estudiar leyes de escalado, efectos de mezclas de datos y reproducibilidad de runs de preentrenamiento con un coste computacional minimo y con metadatos completos (revisiones de fuente, pesos de mezcla y hashes SHA256 en `metadata.json`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (nanoGPT), con embeddings atados, RoPE y vocabulario padded |
| Parametros totales | 15.851.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (tokenizer GPT-2, entrenado sobre mezcla Dolma3 Dolmino; el autor no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`, checkpoint con claves `model`, `config`, `identity` y `run`); no safetensors ni GGUF |

Otros datos: 14 capas, ancho 192, 6 cabezas de atencion, vocabulario de 50.304 entradas (padded), tokenizer GPT-2 via `tiktoken`, tamano del repositorio 0,1 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only clasico con 14 bloques, dimension de modelo 192 y 6 cabezas de atencion. Usa embeddings de entrada y de salida atados, codificacion posicional rotatoria (RoPE) y un vocabulario de 50.304 entradas (el vocabulario GPT-2 de 50.257 redondeado a multiplo de 64). La implementacion vive en `model.py` y `generate.py` dentro del repositorio, con un cargador propio en lugar de `AutoModel` de Transformers.

El entrenamiento consistio en un unico run de preentrenamiento de 158.498.816 tokens de prediccion (10 tokens por parametro, TPP) durante 4.837 pasos de optimizador, con semilla 1337. Los datos provienen del pool `allenai/dolma3_dolmino_pool`; la receta "web-heavy" asigna el 80% de la mezcla al dominio web nombrado, siguiendo una receta congelada. No se aplico RLHF, DPO ni SFT: el checkpoint es estrictamente el endpoint del preentrenamiento. El repositorio incluye `results.json` con el registro de finalizacion y las evaluaciones finales, y `metadata.json` con revisiones exactas de las fuentes, pesos de mezcla y SHA256. No se documentan innovaciones tecnicas adicionales (sin decodificacion especulativa, atencion lineal ni mecanismos hibridos).

## Capacidades

- Generacion de texto por continuacion de prompt (modelo base, sin instrucciones).
- Razonamiento de siguiente token a corto alcance dentro de una ventana de 1.024 tokens.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma fiable (no ha recibido entrenamiento de instrucciones).
- Capacidades multilingues no documentadas; el tokenizer GPT-2 favorece el ingles.
- No dispone de modo thinking, vision ni audio.
- Inferencia en CUDA, Apple MPS o CPU mediante `device=auto`; decodificacion greedy con `temperature=0`.
- Admite fine-tuning posterior (el checkpoint no incluye estado del optimizador).

## Casos de uso

- Reproduccion de experimentos de leyes de escalado: el modelo forma parte de una escalera de runs con distintos presupuestos de tokens; sirve para replicar curvas de perdida BPB frente a TPP con un coste de GPU minimo.
- Estudio del efecto de mezclas de datos: la variante web-heavy (80% dominio web) permite comparar contra otras mezclas de la misma coleccion manteniendo arquitectura, semilla y presupuesto de tokens constantes.
- Docencia y formacion en preentrenamiento: el codigo `model.py`/`generate.py` es un ejemplo autocontenido de un transformer GPT entrenable y cargable en pocas lineas, util para cursos de LLM.
- Pruebas de infraestructura de inferencia: al ser un checkpoint PyTorch nativo de 0,1 GB, sirve para validar pipelines de carga, tokenizacion con `tiktoken` y ejecucion en CPU/MPS antes de escalar a modelos mayores.
- Generacion de texto de relleno y prototipado: continuaciones de texto cortas para pruebas de interfaz o de sistemas de streaming, sin expectativas de calidad.
- Fine-tuning de bajo coste como banco de pruebas: permite experimentar con SFT o LoRA sobre un modelo diminuto para validar recetas antes de aplicarlas a modelos grandes.
- Investigacion de tokenizers y vocabularios padded: el vocabulario de 50.304 entradas permite estudiar el impacto del padding del vocabulario en la matriz de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea en la informacion disponible. El autor indica explicitamente que las mediciones finales de BPB y perdida son evaluaciones de modelado de lenguaje, no precision en resolucion de tareas, y no se proporcionan sus valores numericos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (15,85M parametros ocupan unos 63 MB; el resto es overhead de activaciones y contexto). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera; funciona en CPU y en Apple MPS. Una RTX 4090 o A100 estan sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en cualquier GPU con mas de 1 GB de memoria, e incluso en CPU.
- Opciones de despliegue: cargador PyTorch propio incluido en el repositorio (`model.py` + `generate.py`); no hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no se publican pesos en GGUF ni un formato compatible con Transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 web-heavy 16M (este) | 15,85M | 1.024 | no disponible | PyTorch nativo | Modelo base de investigacion, sin benchmarks de tarea |
| nanoGPT (Karpathy, referencia) | ~10M-124M segun config | 1.024 | MIT (codigo) | PyTorch | Implementacion de referencia; pesos dependen del run |
| GPT-2 small | 124M | 1.024 | MIT | PyTorch/safetensors/GGUF | Modelo base con benchmarks publicos |
| Otros runs de NanoGPT Ladder v3 | ~16M | 1.024 | no disponible | PyTorch nativo | Misma arquitectura con distintas mezclas y presupuestos de tokens |

La comparacion con GPT-2 small es solo orientativa por diferencia de escala (8x menos parametros en este modelo). No se dispone de datos de rendimiento comparativo del autor.

## Limitaciones y advertencias

- Es un modelo base sin alineacion: no sigue instrucciones y produce continuaciones de texto, no respuestas.
- Riesgo alto de alucinacion y de texto incoherente a partir de pocos cientos de tokens; la calidad esperada es la de un modelo de 16M parametros.
- Ventana de contexto muy limitada (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno.
- Idiomas no declarados; el tokenizer GPT-2 y la mezcla de datos probablemente favorecen el ingles, con rendimiento muy pobre en castellano.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin soporte en ecosistemas estandar (Transformers, vLLM, llama.cpp): requiere el cargador propio del repositorio.
- Los pesos estan en float32 sin versiones cuantizadas publicadas.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datos web, es probable que herede sesgos del corpus Dolma3 Dolmino.
- No apto para produccion: su uso previsto es la investigacion y la experimentacion reproducible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-web-heavy-16m-10tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- nanoGPT (implementacion de referencia de Andrej Karpathy): https://github.com/karpathy/nanoGPT
