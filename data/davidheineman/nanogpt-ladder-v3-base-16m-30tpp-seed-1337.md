# davidheineman/nanogpt-ladder-v3-base-16m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 base 16M es un modelo de lenguaje de tipo base (no instruido ni alineado) desarrollado por davidheineman dentro del proyecto NanoGPT Ladder v3, una serie de ejecuciones de preentrenamiento controladas que estudian el efecto del presupuesto de tokens sobre arquitecturas GPT de escala reducida. Este punto concreto de la escalera corresponde a un modelo de 15.851.520 parámetros entrenado sobre 475.529.216 tokens de predicción, es decir, 30 tokens por parámetro (TPP), con semilla 1337 y 14.512 pasos de optimizador.

El modelo emplea una arquitectura transformer decoder-only clásica de estilo GPT-2: 14 capas, dimensión de modelo 192, 6 cabezas de atención, embeddings atados, RoPE y tokenizador GPT-2 con vocabulario rellenado a 50.304 entradas. Su contexto es de 1.024 tokens. Los datos de preentrenamiento provienen de mezclas del pool Dolma3 Dolmino de AllenAI, con recetas que asignan hasta un 80% a un dominio concreto en las mezclas "heavy".

Su relevancia es fundamentalmente metodológica y de investigación: no es un modelo destinado a producción, sino un punto de referencia reproducible para estudiar leyes de escalado, dinámica de preentrenamiento y comparativas entre presupuestos de tokens. El checkpoint es anterior a cualquier fase de SFT o RL, por lo que solo admite continuación de texto con prompts en texto plano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 style, NanoGPT) |
| Parametros totales | 15.851.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible (tokenizador GPT-2, predominantemente ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), cargador propio; no compatible con `AutoModel` de Transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 14 capas con anchura 192, 6 cabezas de atención, embeddings de entrada y salida atados, RoPE para codificación posicional y tokenizador GPT-2 con vocabulario rellenado hasta 50.304. Se entrenó desde cero durante 14.512 pasos de optimizador con semilla 1337, procesando 475.529.216 tokens de predicción, lo que equivale a 30 tokens por parámetro. Los pesos se publican en float32 original y el checkpoint incluye `model`, `config`, `identity` y `run`, pero no el estado del optimizador.

Los datos proceden de mezclas del pool `allenai/dolma3_dolmino_pool` siguiendo la receta congelada de Dolma3 Dolmino; las mezclas "heavy" asignan un 80% de los tokens al dominio nombrado. El archivo `metadata.json` documenta revisiones exactas de las fuentes, pesos de mezcla y hashes SHA256, y `results.json` recoge el registro original de finalización y las evaluaciones finales. No se aplicó SFT, RLHF ni DPO: los pesos son estrictamente de preentrenamiento y el autor indica que deben usarse con prompts de texto plano.

## Capacidades

- Generación de texto por continuación de contexto (completion), sin formato de instrucciones ni diálogo.
- Modelado de lenguaje autorregresivo con decodificación greedy (`temperature=0`) o muestreo con temperatura.
- Evaluación de perplejidad y BPB (bits per byte) como métricas de calidad del modelo de lenguaje.
- Fine-tuning posterior: el checkpoint permite continuar el entrenamiento o ajustar la cabeza de salida.
- Ejecución en CPU, CUDA o Apple MPS mediante `device=auto` en el script incluido.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe no documentada; el tokenizador GPT-2 favorece el inglés.

## Casos de uso

- Estudio de leyes de escalado: comparar este punto de 30 TPP con los demás modelos de la escalera NanoGPT Ladder v3 para medir cómo evoluciona la pérdida y el BPB con el presupuesto de tokens.
- Reproducibilidad de experimentos de preentrenamiento: la semilla fija (1337), el registro de revisiones y los hashes SHA256 permiten replicar exactamente la ejecución en un entorno controlado.
- Baseline en investigación académica: servir como referencia de modelo pequeño (16M) para comparar técnicas de inicialización, optimizadores o recetas de mezcla de datos.
- Fine-tuning didáctico: ajustar el modelo en tareas concretas de clasificación o generación de dominio reducido para ilustrar el flujo completo de preentrenamiento y ajuste.
- Pruebas de infraestructura de inferencia: validar pipelines de carga de checkpoints PyTorch personalizados, scripts de generación y despliegue en CPU o MPS con un modelo de huella mínima (0,1 GB de repositorio).
- Análisis de mezclas de datos: entrenar variantes con mezclas "heavy" del pool Dolmino y comparar el efecto del 80% de dominio sobre el BPB final.
- Docencia sobre tokenizadores y arquitecturas GPT: inspeccionar atención, RoPE y embeddings atados en un modelo de tamaño manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que `results.json` contiene mediciones finales de BPB y pérdida, pero estas son evaluaciones de modelado de lenguaje, no precisión en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (15,85M parámetros × 4 bytes ≈ 63 MB de pesos, más activaciones y caché KV para 1.024 tokens).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo, en iGPU y en CPU; también en Apple Silicon vía MPS.
- Opciones de despliegue: scripts propios `model.py` y `generate.py` con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el cargador personalizado impide usar `AutoModel` de Transformers.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, la generación en CPU debería ser interactiva y en GPU prácticamente instantánea para secuencias de 128 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NanoGPT Ladder v3 base 16M (este) | 15,85M | 1.024 | no disponible | Hugging Face, PyTorch nativo |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT | Hugging Face, Transformers |
| Pythia-14M (EleutherAI) | 14M | 2.048 | Apache 2.0 | Hugging Face, Transformers |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | Hugging Face, Transformers |

La comparación con GPT-2 small y Pythia-14M es la más directa por escala; Pythia-14M ofrece contexto el doble de largo y licencia permisiva, mientras que este modelo destaca por su trazabilidad de mezcla de datos y su integración en una escalera de presupuestos de tokens. No se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones, no mantiene diálogo y puede producir continuaciones incoherentes o repetitivas.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto; no debe usarse en producción sin ajuste y validación.
- Contexto muy corto (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas no documentados; el tokenizador GPT-2 está sesgado hacia el inglés y penaliza otros idiomas.
- Sesgos de los datos de preentrenamiento (pool Dolma3 Dolmino) no evaluados ni mitigados en esta ficha.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Pesos en float32 y cargador propio: no hay variantes GGUF ni integración con ecosistemas estándar, lo que limita el despliegue en herramientas habituales.
- El checkpoint no incluye estado del optimizador, por lo que reanudar el entrenamiento exacto requiere reconstruirlo.
- Las métricas publicadas (BPB, pérdida) no miden capacidad de resolución de tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-base-16m-30tpp-seed-1337
- Colección NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de preentrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio NanoGPT (referencia de arquitectura): https://github.com/karpathy/nanoGPT
