# davidheineman/nanogpt-ladder-v3-code-heavy-32m-100tpp-seed-1337

## Resumen

NanoGPT Ladder v3 code-heavy 32M es un punto de control de preentrenamiento completado dentro de la serie NanoGPT Ladder v3, publicada por el usuario davidheineman en Hugging Face. Se trata de un modelo base de tipo GPT decoder-only, con 32.071.680 parametros, entrenado sobre 3.207.168.000 tokens de prediccion (100 TPP, tokens por parametro) y con una semilla fija (1337) para garantizar reproducibilidad. No es un modelo instruct ni un asistente conversacional: los pesos preceden a cualquier fase de SFT o RL, por lo que debe usarse con prompts de texto plano.

El modelo emplea una mezcla de datos "code-heavy" basada en la receta congelada del pool Dolma3 Dolmino de AllenAI, donde el 80% del contenido se asigna al dominio nombrado (codigo). Con 13 capas, anchura 320, 5 cabezas de atencion, embeddings atados, RoPE y tokenizador GPT-2, el modelo esta pensado como pieza de un estudio escalonado ("ladder") que compara configuraciones de entrenamiento bajo condiciones controladas, mas que como un modelo de proposito general.

Su relevancia es fundamentalmente metodologica: permite a investigadores reproducir y auditar experimentos de preentrenamiento a pequena escala con metadatos detallados (revisiones exactas de fuentes, pesos de mezcla y hashes SHA256 en `metadata.json`). No obstante, sus capacidades practicas son muy limitadas: contexto de 1.024 tokens, ausencia de alineacion y un rendimiento que solo se reporta en terminos de BPB/loss, no en tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (NanoGPT), con RoPE y embeddings atados |
| Parametros totales | 32.071.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`, float32); no compatible con `AutoModel` de Transformers |
| Capas | 13 |
| Anchura (d_model) | 320 |
| Cabezas de atencion | 5 |
| Vocabulario | 50.304 (padded), tokenizador GPT-2 |
| Tokens de entrenamiento | 3.207.168.000 (100 TPP) |
| Pasos de optimizacion | 97.875 |
| Semilla | 1337 |
| Dataset | allenai/dolma3_dolmino_pool (receta code-heavy, 80% dominio) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico en la linea de NanoGPT: 13 bloques, dimension de modelo 320, 5 cabezas de atencion, embeddings de entrada y salida atados y codificacion posicional rotatoria (RoPE). El tokenizador es el de GPT-2 con vocabulario rellenado hasta 50.304 entradas. El checkpoint contiene las claves `model`, `config`, `identity` y `run`, e incluye `model.py` y `generate.py` para carga nativa en PyTorch; no se incluye el estado del optimizador, por lo que sirve para inferencia y fine-tuning posterior pero no para reanudar el entrenamiento.

El entrenamiento se realizo sobre 3.207.168.000 tokens de prediccion en 97.875 pasos, con la mezcla "code-heavy" derivada de la receta congelada del pool Dolma3 Dolmino, en la que el 80% de los datos se asigna al dominio de codigo. Cada presupuesto de tokens de la serie corresponde a una ejecucion entrenada de forma independiente con semilla 1337. El repositorio documenta las revisiones exactas de las fuentes, los pesos de mezcla y los hashes SHA256 en `metadata.json`, y las evaluaciones finales en `results.json`. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva basica a partir de prompts de texto plano (continuacion, no instrucciones).
- Modelado de lenguaje y calculo de perplejidad/BPB sobre texto, incluido codigo fuente, dada la mezcla de entrenamiento.
- Fine-tuning posterior: el checkpoint es compatible con entrenamiento adicional (sin estado del optimizador).
- Reproducibilidad experimental: semilla fija y metadatos completos de mezcla y revisiones.
- No dispone de tool calling ni function calling.
- No dispone de modo agente ni razonamiento multi-paso.
- No dispone de modo "thinking", vision ni audio.
- Capacidades multilingues: no documentadas; el tokenizador GPT-2 favorece el ingles.

## Casos de uso

- Investigacion sobre mezclas de datos: comparar el efecto de una proporcion del 80% de codigo frente a otras mezclas de la serie NanoGPT Ladder v3 bajo el mismo presupuesto de tokens y semilla.
- Reproduccion de experimentos de preentrenamiento a pequena escala: el modelo sirve como referencia auditables gracias a `metadata.json` (revisiones, pesos de mezcla, SHA256) y `results.json`.
- Estudio de escalado ("ladder"): usar este punto de 32M/100 TPP junto con los demas modelos completados de la coleccion para trazar curvas de loss frente a parametros y tokens.
- Baseline para fine-tuning en tareas de codigo: partir de estos pesos y aplicar SFT sobre un corpus especifico para medir la ganancia respecto a un modelo entrenado desde cero.
- Analisis de tokenizacion y vocabulario: estudiar el comportamiento del tokenizador GPT-2 con vocabulario rellenado a 50.304 en dominios tecnicos.
- Docencia y divulgacion: ilustrar el funcionamiento interno de un transformer GPT minimo con un checkpoint real y scripts de generacion incluidos.
- Pruebas de infraestructura de inferencia: validar pipelines de carga nativa en PyTorch (CPU, CUDA, MPS) con un modelo de 0,1 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones finales de BPB/loss son evaluaciones de modelado de lenguaje y no precision en resolucion de tareas; los valores concretos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (32M parametros, ~128 MB de pesos mas activaciones y cache KV para 1.024 tokens); en la practica cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; tambien funciona en CPU y en Apple MPS segun el script `generate.py` (`device=auto`).
- Cabe en GPU consumer: si, incluidas GTX 1050, RTX 3050, RTX 4090 y similares; tambien en Raspberry Pi y entornos sin GPU.
- Opciones de despliegue: carga nativa con PyTorch mediante `model.py`/`generate.py` incluidos; no es compatible con `AutoModel` de Transformers, por lo que vLLM, TGI u Ollama no lo soportan de forma directa sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, la generacion en GPU consumer deberia ser del orden de cientos a miles de tokens por segundo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 code-heavy 32M (este) | 32,07M | 1.024 | 3,21B tokens, mezcla code-heavy Dolma3 Dolmino | no disponible | PyTorch nativo |
| GPT-2 small (OpenAI) | 124M | 1.024 | WebText, ~40 GB | MIT (pesos) | PyTorch, safetensors, GGUF (comunidad) |
| SmolLM-135M (HuggingFace) | 135M | 2.048 | ~600B tokens (SmolLM-Corpus) | Apache 2.0 | Safetensors, GGUF |
| Pythia-70M (EleutherAI) | 70M | 2.048 | 300B tokens (The Pile) | Apache 2.0 | Safetensors |

La comparacion es orientativa: este checkpoint es aproximadamente 2-4 veces menor que los modelos citados y esta disenado para experimentacion controlada, no para uso general. No se dispone de datos de rendimiento comparables para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones, no mantiene formato conversacional y puede generar contenido incoherente o sesgado.
- Riesgo elevado de alucinacion y de repeticion: con 32M parametros y 3,2B tokens, la calidad del texto es muy limitada.
- Contexto corto de 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Idiomas no documentados; el tokenizador GPT-2 y la mezcla de datos probablemente favorecen el ingles y el codigo.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Pesos en float32 y arquitectura custom: requiere el codigo del repositorio, no funciona con `AutoModel` ni con servidores de inferencia estandar sin conversion.
- Sin estado del optimizador: no se puede reanudar el entrenamiento original, solo hacer fine-tuning desde los pesos.
- Los resultados publicados son de loss/BPB, no de precision en tareas; no deben interpretarse como capacidad funcional.
- No apto para produccion: pensado para investigacion y reproducibilidad experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-code-heavy-32m-100tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino Pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
