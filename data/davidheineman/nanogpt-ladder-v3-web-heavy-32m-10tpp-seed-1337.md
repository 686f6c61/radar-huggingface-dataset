# davidheineman/nanogpt-ladder-v3-web-heavy-32m-10tpp-seed-1337

## Resumen
NanoGPT Ladder v3 web-heavy 32M 10TPP es un modelo de lenguaje base de pequeno tamano (32,1 millones de parametros) desarrollado por davidheineman como parte de la serie NanoGPT Ladder v3, un conjunto de experimentos de preentrenamiento controlados. El modelo sigue la arquitectura GPT clasica implementada en NanoGPT: transformer decoder-only de 13 capas, anchura 320, 5 cabezas de atencion, embeddings atados, RoPE y tokenizador GPT-2. Se entrena desde cero sobre un subconjunto del pool Dolma3 Dolmino con una mezcla "web-heavy" (80% del dominio nombrado).

La relevancia de este checkpoint es experimental y de investigacion: no es un modelo de produccion, sino un punto de referencia reproducible para estudiar el efecto de la mezcla de datos y del presupuesto de tokens en modelos pequenos. El nombre "10TPP" indica 10 tokens por parametro, es decir, aproximadamente 320,7 millones de tokens de prediccion en 9.787 pasos de optimizador.

Los pesos publicados son el punto final del preentrenamiento, previos a cualquier fase de SFT, RL o condicionamiento tiny-rl, por lo que deben usarse con prompts de texto plano y no como asistente conversacional. El repositorio incluye el codigo de carga nativo (`model.py`, `generate.py`) y metadatos con revisiones exactas de las fuentes, pesos de mezcla y hashes SHA256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (NanoGPT) |
| Parametros totales | 32.071.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`, float32) |
| Capas | 13 |
| Dimension del modelo (width) | 320 |
| Cabezas de atencion | 5 |
| Vocabulario | 50.304 (padded, tokenizador GPT-2) |
| Tokens de preentrenamiento | 320.700.416 (10 TPP) |
| Pasos de optimizador | 9.787 |
| Semilla | 1337 |
| Dataset | allenai/dolma3_dolmino_pool (mezcla web-heavy) |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only con 13 capas, anchura 320 y 5 cabezas de atencion, con embeddings de entrada y salida atados, RoPE para codificacion posicional y tokenizador GPT-2 con vocabulario rellenado hasta 50.304. Es una implementacion NanoGPT pura, sin atencion lineal, sin decodificacion especulativa ni mecanismos hibridos; su interes esta en el control experimental, no en innovaciones arquitectonicas.

El preentrenamiento se realizo sobre el pool Dolma3 Dolmino siguiendo una receta congelada de mezcla "web-heavy", donde el 80% de los datos se asigna al dominio web nombrado. Se consumieron 320.700.416 tokens de prediccion en 9.787 pasos de optimizador, equivalentes a 10 tokens por parametro. Cada presupuesto de tokens de la serie NanoGPT Ladder v3 corresponde a una ejecucion entrenada de forma independiente con semilla 1337. No se aplicaron fases posteriores de SFT, RLHF ni DPO; los pesos son el endpoint directo del preentrenamiento y no incluyen estado del optimizador.

## Capacidades
- Generacion de texto autoregresiva basica con prompts de texto plano.
- Modelado de lenguaje de dominio general condicionado por la mezcla web-heavy del dataset Dolmino.
- Capacidad limitada de continuacion de texto, completado de frases y patrones locales propios de un modelo de 32M de parametros.
- Soporte de inferencia en CPU, CUDA y Apple MPS mediante el script `generate.py` incluido.
- Decodificacion greedy (`temperature=0`) y muestreo con temperatura configurable.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma fiable.
- No incluye modo thinking, vision ni audio.
- Capacidades multilingues no documentadas; el tokenizador GPT-2 favorece el ingles.

## Casos de uso
- Investigacion sobre mezclas de datos: sirve como punto de comparacion reproducible dentro de la serie NanoGPT Ladder v3 para medir el efecto de la receta web-heavy frente a otras mezclas sobre el mismo presupuesto de tokens.
- Experimentos de scaling laws en modelos pequenos: al estar entrenado a exactamente 10 TPP, permite contrastar curvas de perdida (BPB/loss) con otros checkpoints de la misma escalera y distintas semillas.
- Baseline para fine-tuning academico: el checkpoint admite ajuste fino adicional (sin estado del optimizador) y puede usarse como inicializacion en estudios de SFT o RL a pequena escala.
- Pruebas de infraestructura de entrenamiento e inferencia: su tamano reducido (0,1 GB de repositorio) permite validar pipelines de carga, tokenizacion y generacion en entornos con recursos minimos.
- Docencia y demostraciones de arquitecturas GPT: el codigo `model.py` y `generate.py` expone de forma explicita la configuracion (capas, cabezas, RoPE, embeddings atados), util para cursos de NLP.
- Evaluacion de tokenizadores y vocabularios: con vocabulario GPT-2 rellenado a 50.304, sirve para estudiar efectos del padding de vocabulario en modelos pequenos.
- Generacion de texto de bajo coste en prototipos: continuaciones cortas de hasta 1.024 tokens de contexto en hardware de consumo, sin expectativas de calidad conversacional.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `results.json` contiene el registro original de finalizacion y las evaluaciones finales, y que las mediciones finales de BPB/loss son evaluaciones de modelado de lenguaje, no precision en resolucion de tareas.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en float32 (32M de parametros), holgadamente por debajo de 0,5 GB en la practica con overhead minimo.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo no requiere A100 ni H100. Funciona en RTX 4090, RTX 3090, RTX 3060 y GPUs de gama baja.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con al menos 1 GB de VRAM, y tambien en CPU.
- Opciones de despliegue: carga nativa con PyTorch mediante `model.py` y `generate.py`; no usa `Transformers AutoModel`. vLLM, llama.cpp, Ollama y TGI no estan soportados de forma nativa segun la informacion disponible.
- Latencia y throughput estimados: no disponibles. Dado el tamano, la inferencia en CPU es viable para generaciones cortas y en GPU es practicamente instantanea, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 web-heavy 32M 10TPP (este) | 32,1M | 1.024 | no disponible | PyTorch nativo | Base preentrenado, mezcla web-heavy, 10 TPP |
| Otros checkpoints NanoGPT Ladder v3 | no disponible | no disponible | no disponible | PyTorch nativo | Misma escalera, distintas mezclas y presupuestos de tokens; comparables por diseno experimental |
| GPT-2 small | 124M | 1.024 | MIT (segun el release original de OpenAI) | PyTorch, safetensors, GGUF (comunidad) | Referencia clasica de modelo pequeno; mayor tamano y ecosistema de despliegue amplio |
| Modelos tipo Pythia-70M | 70M | 2.048 | Apache 2.0 (segun el release original de EleutherAI) | safetensors | Suite de investigacion con checkpoints intermedios; mayor contexto |

La comparacion con alternativas de la misma categoria es limitada porque no se han publicado resultados de rendimiento para este checkpoint. La comparacion principal es interna a la coleccion NanoGPT Ladder v3, disenada para aislar el efecto de la mezcla de datos y del presupuesto de tokens.

## Limitaciones y advertencias
- Modelo base sin alineacion: no ha pasado por SFT, RLHF ni DPO, por lo que no debe usarse como asistente ni en atencion al cliente.
- Riesgo elevado de alucinacion y de generar texto incoherente o repetitivo, especialmente con prompts fuera de distribucion.
- Contexto muy corto (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; el tokenizador GPT-2 y la mezcla web-heavy probablemente favorecen el ingles, con rendimiento limitado en castellano.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Sin estado del optimizador en el checkpoint: el fine-tuning posterior parte de pesos sin momentos de Adam, lo que puede afectar la reproducibilidad del ajuste.
- Las evaluaciones publicadas son de modelado de lenguaje (BPB/loss), no de precision en tareas; no deben interpretarse como capacidad de resolver problemas.
- Arquitectura personalizada con loader propio: no es compatible directamente con `Transformers AutoModel`, lo que limita la integracion con ecosistemas estandar de despliegue.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-web-heavy-32m-10tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio NanoGPT (referencia de la arquitectura): https://github.com/karpathy/nanoGPT
