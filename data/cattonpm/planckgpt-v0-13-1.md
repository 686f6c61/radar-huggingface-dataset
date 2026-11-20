# cattonpm/PlanckGPT-v0.13.1

## Resumen

PlanckGPT-v0.13.1 es un modelo de lenguaje de aproximadamente 540 millones de parámetros entrenado desde cero por Phu Minh Nguyen (usuario `cattonpm`) sobre una única GPU de portátil con 8 GB de VRAM (RTX 5070 Mobile). El objetivo del proyecto no es competir con modelos de gran escala, sino demostrar que es posible entrenar un transformer tipo GPT con calidad razonable en hardware de consumo doméstico, optimizando la calidad obtenida por unidad de tiempo de entrenamiento. El modelo se publica como checkpoint PyTorch crudo (`.pth`), no como pesos compatibles con `transformers`.

La arquitectura es un transformer decoder-only de 14 capas, 7 cabezas de atención y dimensión oculta de 896 (FFN de 3584), con una longitud de contexto de tan solo 1024 tokens y un tokenizador GPT-2 basado en tiktoken (vocabulario de 50.257 tokens). Se distribuyen dos variantes: una base preentrenada en aproximadamente 2.000 millones de tokens de FineWeb-Edu y una versión chat afinada con SFT sobre smol-smoltalk más un millar de ejemplos de identidad. El autor indica que la variante base rinde aproximadamente a la par que GPT-2 Medium.

Su relevancia actual es fundamentalmente educativa y de investigación: sirve como referencia reproducible de un pipeline completo de preentrenamiento y SFT (con el optimizador Muon) en 28 horas de preentrenamiento más 4 horas de SFT, y como caso de estudio de los límites de los modelos pequeños en tareas de generación de texto en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (14 capas, 7 cabezas, dim 896, FFN 3584) |
| Parametros totales | ~540M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo checkpoint `.pth` en fp32/fp16; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch crudo (`.pth`); no compatible con `transformers` |
| Tokenizador | GPT-2 via tiktoken (vocabulario 50.257) |
| Datos de preentrenamiento | ~2.000M tokens de FineWeb-Edu |
| Datos de SFT | smol-smoltalk + ~1.000 ejemplos de identidad |
| Computo de entrenamiento | ~28 h preentrenamiento + ~4 h SFT en una RTX 5070 Mobile de 8 GB |
| Optimizador | Muon |
| Tamano del repositorio | 2,9 GB |

## Arquitectura y entrenamiento

PlanckGPT es un transformer decoder-only denso con 14 capas, 7 cabezas de atención (dimensión de cabeza de 128, coherente con dim 896) y una FFN de 3584 unidades, lo que sitúa el ratio de expansión en 4x. No emplea mezcla de expertos ni mecanismos de atención lineal; es una arquitectura GPT clásica con atención causal estándar y embeddings posicionales aprendidos (no se detalla en la información disponible si usa RoPE o posicionales absolutos, por lo que se indica como no disponible). El tokenizador es el de GPT-2 vía tiktoken.

El preentrenamiento consumió aproximadamente 2.000 millones de tokens de FineWeb-Edu (subconjunto educativo filtrado de FineWeb) durante unas 28 horas en una RTX 5070 Mobile de 8 GB, empleando el optimizador Muon, una innovación destacable frente al habitual AdamW y que el autor presenta como clave para maximizar la calidad por tiempo de entrenamiento. Posteriormente se aplicó SFT durante aproximadamente 4 horas sobre smol-smoltalk más cerca de 1.000 ejemplos de identidad, sin que la información disponible mencione RLHF ni DPO. El formato de chat utilizado es `User: ...\n\nAssistant: ...<|endoftext|>`. No se documentan innovaciones como decodificación especulativa, atención linear o arquitecturas híbridas SSM.

## Capacidades

- Generación de texto en inglés con una ventana de contexto de 1024 tokens.
- Conversación multi-turno en la variante chat, con formato de plantilla fijo `User:`/`Assistant:`.
- Razonamiento básico y respuesta a instrucciones simples, limitado por el tamaño del modelo (~540M parámetros).
- Generación de código y matemáticas elementales: no se documentan resultados específicos ni garantías de calidad en estas tareas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés; no se documenta soporte de otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación educativa sobre entrenamiento desde cero: el repositorio y los scripts de GitHub permiten reproducir el pipeline completo (preentrenamiento con Muon + SFT) en una GPU de consumo, lo que lo convierte en material didáctico para comprender el ciclo de vida de un LLM.
- Experimentación con tokenizadores y arquitecturas GPT: al usar el tokenizador GPT-2 vía tiktoken y una arquitectura canónica, sirve como banco de pruebas para estudiar efectos de hiperparámetros, curvas de pérdida y BPB en modelos pequeños.
- Generación de texto creativo breve en inglés: con temperatura 0.6, top-k 50, top-p 0.9 y penalización de repetición 1.15, puede producir párrafos cortos y continuaciones de texto en dominios educativos, aunque con coherencia limitada más allá de unos cientos de tokens.
- Prototipado de chatbots de dominio cerrado: la variante chat puede integrarse en demos locales de conversación de un solo tema con contexto corto (1024 tokens), útil para validar interfaces antes de migrar a modelos mayores.
- Benchmarking de infraestructura de inferencia en hardware modesto: al pesar ~2,9 GB en el repositorio, permite medir latencia y throughput en GPUs de 8 GB y comparar frameworks de inferencia sin necesidad de clústeres.
- Filtrado y anotación ligera de texto educativo: dado su entrenamiento sobre FineWeb-Edu, puede emplearse para clasificar o reescribir fragmentos de contenido educativo en inglés en pipelines de bajo coste.
- Estudio de alineación y SFT con datasets pequeños: los ~1.000 ejemplos de identidad y smol-smoltalk permiten analizar cómo el SFT modifica el comportamiento de un modelo base pequeño con recursos mínimos.

## Benchmarks y rendimiento

| Modelo | Conjunto de evaluacion | Val loss | BPB |
|---|---|---|---|
| PlanckGPT Base | FineWeb-Edu | 2,9711 | 0,9203 |
| PlanckGPT Chat | smol-smoltalk | 1,1286 | 0,3556 |

El autor indica que la variante base rinde aproximadamente a la par que GPT-2 Medium. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,2 GB en fp16 para los ~540M parámetros, más overhead de activaciones y caché KV (pequeña dado el contexto de 1024 tokens); en la práctica cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 5070 Mobile, etc.); no requiere A100 ni H100.
- Cabe en GPU consumer: sí, el propio autor entrenó el modelo en una RTX 5070 Mobile de 8 GB.
- Opciones de despliegue: no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, ya que los pesos son un checkpoint PyTorch crudo no compatible con `transformers`. El despliegue se realiza mediante los scripts del repositorio de GitHub (`python -m scripts.sft_inference` o `python -m scripts.inference`).
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PlanckGPT-v0.13.1 | ~540M | 1024 | Apache 2.0 | `.pth` (PyTorch crudo) | Entrenado en 1 GPU de 8 GB; calidad ~GPT-2 Medium según el autor |
| GPT-2 Medium | 355M | 1024 | MIT | safetensors / PyTorch | Referencia histórica de OpenAI; comparable en calidad según el autor |
| SmolLM-135M / 360M (HuggingFaceTB) | 135M / 360M | 2048 | Apache 2.0 | safetensors, GGUF | Modelos pequeños con soporte `transformers` y ecosistema de inferencia amplio |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | safetensors, GGUF | Contexto mucho mayor y soporte multilingüe; ampliamente desplegable en vLLM/llama.cpp |

La comparación con GPT-2 Medium procede de la propia model card; el resto de alternativas se incluyen por categoría (modelos pequeños de ~0,5B) y sus datos no provienen de la información proporcionada, por lo que deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- Modelo muy pequeño (~540M parámetros): capacidad de razonamiento, conocimiento factual y coherencia limitadas; riesgo elevado de alucinación en preguntas abiertas.
- Ventana de contexto de solo 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Entrenado exclusivamente en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Solo disponible como checkpoint PyTorch crudo (`.pth`), no compatible con `transformers`, vLLM, llama.cpp u Ollama; requiere clonar el repositorio de GitHub y usar sus scripts.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad; el preentrenamiento sobre FineWeb-Edu puede arrastrar sesgos del corpus web filtrado.
- Sin datos de benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que no es posible comparar rigurosamente con alternativas más allá de la pérdida de validación y el BPB reportados.
- Licencia Apache 2.0: permite uso comercial, pero al no existir soporte de herramientas estándar, la integración en producción requiere trabajo de adaptación.
- Proyecto de investigación con 0 descargas y 1 like en el momento de la consulta; sin garantías de mantenimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/cattonpm/PlanckGPT-v0.13.1
- Repositorio GitHub (código y scripts de entrenamiento): https://github.com/nguyenphuminh/planckgpt
- Instrucciones de setup del repositorio: https://github.com/nguyenphuminh/planckgpt#setup
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de SFT: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
