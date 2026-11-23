# Disya/Inko-Duplicate

## Resumen

Inko es un modelo de texto a imagen de 532 millones de parámetros especializado en pintura e ilustración, tanto de tradición china como occidental. Lo desarrolla Disya y se distribuye bajo el identificador Disya/Inko-Duplicate en Hugging Face; el repositorio original de referencia es kaupane/Inko. Emplea una arquitectura transformer de flow matching (rectified flow) con codificador de texto congelado Qwen3-0.6B y VAE de Qwen-Image de 16 canales, lo que lo sitúa en la gama de modelos compactos de difusión aptos para hardware de consumo.

Su relevancia radica en dos factores. Por un lado, cubre un nicho poco atendido por los modelos generalistas: la generación de arte con control estilístico en dominios como la pintura a la tinta, el gongbi sobre seda, el paisaje azul-verdoso o el impresionismo, con prompts nativos en inglés y chino. Por otro, su tamaño reducido y su receta de entrenamiento documentada (currículo de resolución 256p → 640p → 896p, optimizador Muon y post-entrenamiento DiffusionART con recompensas por rúbrica) lo convierten en un caso de estudio reproducible para investigadores que trabajan con presupuestos de cómputo limitados.

El modelo se publica como EMA de una ejecución de post-entrenamiento especializada (60 rondas DiffusionART sobre una ejecución principal de 300 rondas), construida sobre la EMA preentrenada de 600k actualizaciones. La base preentrenada permanece accesible en la etiqueta pretrain-base del repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flow matching (rectified flow); 1 bloque de doble flujo + 24 bloques de flujo simple; anchura oculta 1152, 16 cabezas, FFN de 3072 |
| Parametros totales | 532.496.992 (537.104.992 según safetensors, incluyendo componentes auxiliares) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen; sin ventana de contexto de tokens declarada) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF, FP8 ni INT8) |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PyTorch) |
| Codificador de texto | Qwen3-0.6B congelado, codificación en línea con salida temprana tras la capa 20 |
| VAE | Qwen-Image VAE, 16 canales, factor 8, parches latentes 2×2 |
| Resolución de entrenamiento | variable, 256p → 640p → 896p (reparto 75:20:5 sobre 600.000 actualizaciones) |
| Resolución de inferencia | múltiplos de 16, hasta 1920 por eje; escalado Dy-YaRN automático por encima de 1184 px |
| Objetivo de entrenamiento | rectified flow con muestreo logit-normal de timesteps y desplazamiento temporal por resolución |
| Hardware de entrenamiento | Ascend, 16×910B2C |

## Arquitectura y entrenamiento

Inko es un transformer de difusión con formulación de rectified flow. La pila consta de un bloque de doble flujo seguido de 24 bloques de flujo simple, con anchura oculta de 1152, 16 cabezas de atención y FFN de 3072 dimensiones. El texto se procesa con un Qwen3-0.6B congelado que se ejecuta en línea y aplica una salida temprana tras la capa 20, lo que reduce el coste del codificador. Los latentes usan el VAE de Qwen-Image de 16 canales con factor de compresión 8 y parches latentes de 2×2.

El preentrenamiento se realizó sobre unos 1,7 millones de filas elegibles a 256p, organizadas en cuatro dominios (pintura china, arte occidental, personas y anatomía, y conocimiento del mundo) con leyendas bilingües en proporción 50:50. El currículo de resolución progresó de 256p a 640p y luego a 896p con un reparto 75:20:5 sobre 600.000 actualizaciones del optimizador, empleando Muon troceado en hardware Ascend (16×910B2C) y un trabajo medido de kernels CUDA/Ascend que reportó un incremento de throughput del 33,92 %. El post-entrenamiento consistió en 60 rondas de DiffusionART con LoRA de atención de rango 64, Muon a 1e-3 y EMA de 0,999, usando siete canales de recompensa dominados por cinco categorías de rúbrica y un pool de rollouts de 24.600 filas.

## Capacidades

- Generación de imágenes a partir de prompts en inglés y chino, con énfasis en estilos pictóricos: tinta china, gongbi, paisaje azul-verdoso, impresionismo, art nouveau, fauvismo, simbolismo y bodegón barroco.
- Composición de escenas con figuras humanas, vestuario histórico (por ejemplo, hanfu) y entornos arquitectónicos o naturales.
- Control de resolución y relación de aspecto: anchura y altura múltiplos de 16 hasta 1920 por eje, con escalado Dy-YaRN automático por encima de 1184 px.
- Alineación densa de prompts: según la model card, es su resultado general más fuerte en las benchmarks evaluadas.
- Diversidad relativamente alta en comparación con modelos de alineación similar.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión de entrada, audio ni modo de pensamiento; es exclusivamente un modelo de texto a imagen.

## Casos de uso

- Ilustración editorial y de libros: generación de láminas en estilos de pintura china o europea con prompts bilingües, aprovechando el corpus curado de cuatro dominios para obtener coherencia estilística en series de varias imágenes.
- Prototipado de arte conceptual para videojuegos y animación: creación rápida de variaciones de paisajes, vestuario y arquitectura a 896×896 o resoluciones superiores, con control de semilla para iterar sobre una misma composición.
- Generación de material para productos culturales y museísticos: reproducciones estilizadas de motivos tradicionales (tinta, gongbi, seda) para cartelería, merchandising o divulgación, con la ventaja de un modelo de 532M parámetros desplegable en una sola GPU.
- Investigación en modelos generativos compactos: reproducción de la receta completa (currículo de resolución, Muon, DiffusionART) sobre hardware Ascend o CUDA, útil para estudiar estabilidad de entrenamiento y picos de pérdida documentados.
- Fines educativos y docencia de historia del arte: generación de ejemplos visuales a partir de descripciones de corrientes pictóricas, con prompts en chino para materiales dirigidos a ese mercado.
- Integración en pipelines de aumento de datos: producción de imágenes sintéticas con estilos artísticos controlados para entrenar clasificadores o modelos de estética, dado el bajo coste de inferencia frente a modelos de mayor tamaño.
- Aplicaciones de ocio y personalización: generación de ilustraciones bajo demanda en aplicaciones web o de escritorio, con despliegue local gracias al reducido tamaño del repositorio (2,2 GB).

## Benchmarks y rendimiento

La model card menciona la evaluación sobre cinco benchmarks públicos (GenEval, DPG, OneIG English, TIIF testmini y Qwen-Image-Bench) con nueve modelos comparados, pero no incluye las cifras numéricas en el texto proporcionado; solo referencia una figura (benchmark_overview.png) y el capítulo de evaluación del repositorio de GitHub. Según la descripción cualitativa, Inko compite directamente con DreamLite, SANA-0.6B y PixArt-Σ, y se aproxima a SD3.5 Medium en DPG, alineación OneIG y Qwen-Image-Bench.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 532M parámetros en bfloat16, los pesos ocupan aproximadamente 1,1 GB; sumando el codificador Qwen3-0.6B y el VAE de Qwen-Image, la huella total previsible se sitúa en el rango de 3 a 6 GB, aunque esta cifra es una estimación y no un dato publicado.
- GPU recomendadas: el quickstart exige una GPU CUDA y Python 3.12; no se especifican modelos concretos. Por tamaño, cabría esperar funcionamiento en RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100, sin confirmación oficial.
- Cabe en GPU de consumo: sí, por el tamaño del modelo, aunque no se documentan requisitos mínimos verificados.
- Opciones de despliegue: el pipeline oficial es InkoPipeline del repositorio de GitHub (instalación con pip install -e .). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles. La model card solo indica la receta de inferencia por defecto: 20 pasos Euler y CFG 4.5.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inko | 532M | hasta 1920 px por eje; entrenado a 896p | Compite con DreamLite, SANA-0.6B y PixArt-Σ; cerca de SD3.5 Medium en DPG y OneIG | no disponible | Hugging Face (Disya/Inko-Duplicate; original kaupane/Inko) |
| DreamLite | no disponible | no disponible | Referencia de comparación en la evaluación de Inko | no disponible | no disponible |
| SANA-0.6B | ~0,6B | no disponible | Referencia de comparación en la evaluación de Inko | no disponible | no disponible |
| PixArt-Σ | no disponible | no disponible | Referencia de comparación en la evaluación de Inko | no disponible | no disponible |
| SD3.5 Medium | no disponible | no disponible | Inko se aproxima en DPG, OneIG y Qwen-Image-Bench | no disponible | no disponible |

Los datos de los modelos de comparación no se detallan en la información proporcionada; solo se confirma que forman parte del conjunto de referencias de la evaluación de Inko.

## Limitaciones y advertencias

- El texto renderizado con exactitud y las relaciones espaciales entre objetos siguen siendo débiles.
- La anatomía falla en ocasiones; el razonamiento, el conteo y el conocimiento del mundo son limitados.
- La negación en escenas densas no es fiable (la model card se interrumpe en este punto).
- Solo admite prompts en inglés y chino; no se documenta soporte de otros idiomas.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial; conviene contactar con el autor antes de desplegarlo en producción.
- El repositorio indicado (Disya/Inko-Duplicate) tiene 0 descargas y 0 likes, y el nombre sugiere una copia; el repositorio de referencia con documentación completa es kaupane/Inko.
- Riesgo de alucinación visual y de sesgos derivados del corpus: los datasets incluyen fuentes como wikiart, PD12M, CC12M y colecciones de pintura china, con posibles desequilibrios estilísticos y culturales.
- No se documentan requisitos mínimos de hardware verificados ni latencias en producción.

## Enlaces

- Hugging Face (copia): https://huggingface.co/Disya/Inko-Duplicate
- Hugging Face (original): https://huggingface.co/kaupane/Inko
- Base preentrenada: https://huggingface.co/kaupane/Inko/tree/pretrain-base
- Repositorio GitHub e informe técnico: https://github.com/Mtrya/inko
- Demo: https://huggingface.co/spaces/kaupane/Inko
- Documentación de datos: https://github.com/Mtrya/inko/blob/main/notes/data.md
- Documentación de preentrenamiento: https://github.com/Mtrya/inko/blob/main/notes/pretraining.md
- Documentación de post-entrenamiento: https://github.com/Mtrya/inko/blob/main/notes/posttraining.md
- Documentación de evaluación: https://github.com/Mtrya/inko/blob/main/notes/evaluation.md
- Dataset de rollouts: https://huggingface.co/datasets/kaupane/inko-rollout-25k
- Manifiesto de la galería hero1: https://github.com/Mtrya/inko/blob/main/notes/assets/gallery/hero1/manifest.jsonl
- Manifiesto de la galería hero2: https://github.com/Mtrya/inko/blob/main/notes/assets/gallery/hero2/manifest.jsonl
