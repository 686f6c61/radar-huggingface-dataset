# kaupane/Inko

## Resumen

Inko es un modelo de generación de imágenes a partir de texto (text-to-image) de 532 millones de parámetros, desarrollado por el usuario kaupane y publicado bajo licencia MIT. Está especializado en pintura e ilustración, tanto de tradición china como occidental, y se distribuye con soporte bilingüe inglés-chino. El modelo emplea una arquitectura transformer de flow-matching con 1152 de anchura oculta, 16 cabezas de atención y un total de 25 bloques (1 de doble flujo más 24 de flujo simple), lo que lo sitúa en la categoría de modelos compactos comparables a SANA-0.6B, PixArt-Σ o DreamLite.

El modelo utiliza un codificador de texto Qwen3-0.6B congelado, con salida temprana tras la capa 20, y el VAE de Qwen-Image de 16 canales con factor de compresión 8. La salida se genera mediante rectified flow con muestreo logit-normal de pasos temporales y desplazamiento temporal por resolución. El entrenamiento se realizó íntegramente en hardware Ascend (16 aceleradores 910B2C) y cubre 600.000 actualizaciones del optimizador con un currículo de resolución de 256p a 896p.

Su relevancia actual radica en dos factores: por un lado, demuestra que es posible entrenar un modelo de difusión competitivo con recursos modestos y sobre hardware no-NVIDIA; por otro, publica un registro de ingeniería completo (datos, preentrenamiento, post-entrenamiento y evaluación) que lo convierte en una referencia útil para investigadores que trabajan en modelos generativos de pequeño tamaño y dominios artísticos especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flow-matching (rectified flow); 1 bloque de doble flujo + 24 bloques de flujo simple, anchura oculta 1152, 16 cabezas, FFN 3072 |
| Parametros totales | 532.496.992 (537.104.992 segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo text-to-image); el codificador de texto es Qwen3-0.6B con salida temprana tras la capa 20 |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | Ingles y chino (caption bilingue 50:50) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |
| VAE | Qwen-Image VAE, 16 canales, factor 8, parches latentes 2x2 |
| Resolucion de entrenamiento | Variable, 256p → 640p → 896p (split 75:20:5 sobre 600.000 updates) |
| Resolucion de inferencia | Por defecto 896x896; multiplos de 16 hasta 1920 por eje; Dy-YaRN por encima de 1184 px |
| Pasos de muestreo por defecto | 20 pasos Euler, CFG 4.5 |
| Hardware de entrenamiento | Ascend 16x910B2C (preentrenamiento y post-entrenamiento) |

## Arquitectura y entrenamiento

Inko es un transformer de difusión con objetivo de rectified flow, muestreo de pasos temporales logit-normal y desplazamiento temporal dependiente de la resolución. La pila de bloques combina un bloque inicial de doble flujo (atención conjunta texto-imagen) con 24 bloques de flujo simple, con anchura oculta de 1152, 16 cabezas de atención y FFN de 3072. El texto se codifica con Qwen3-0.6B congelado, usando una salida temprana tras la capa 20 para reducir coste; los latentes provienen del VAE de Qwen-Image (16 canales, factor 8) y se dividen en parches 2x2.

El preentrenamiento cubre 600.000 actualizaciones del optimizador con un currículo de resolución en tres etapas (256p, 640p, 896p en proporción 75:20:5) sobre un corpus de cuatro dominios: pintura china, arte occidental, personas y anatomía, y conocimiento del mundo, con aproximadamente 1,7 millones de filas elegibles a 256p y captions bilingües 50:50. El post-entrenamiento emplea DiffusionART con LoRA de atención (rango 64), optimizador Muon a 1e-3 y EMA 0.999, con siete canales de recompensa dominados por cinco categorías de rúbrica; se realizaron 60 rondas sobre el EMA preentrenado de la ejecución principal de 300 rondas. El pool de rollouts (24.600 filas) se publica como `kaupane/inko-rollout-25k`. El entrenamiento se ejecutó en Ascend 910B2C, con trabajo de kernels documentado que reporta +33,92 % de throughput.

## Capacidades

- Generación de imágenes a partir de prompts en inglés y chino, con énfasis en pintura china (tinta, gongbi, paisaje azul-verde), arte occidental (impresionismo, art nouveau, fauvismo, simbolismo, barroco) e ilustración.
- Resolución variable con relaciones de aspecto arbitrarias: múltiplos de 16 hasta 1920 px por eje, con escalado Dy-YaRN automático por encima de 1184 px.
- Alineación densa de prompts: según la model card, es su resultado general más fuerte en las benchmarks evaluadas.
- Diversidad alta en relación con modelos de alineación comparable (afirmación del autor, sin métrica numérica en la información disponible).
- Control de semilla para reproducibilidad y CFG configurable.
- No se documenta soporte de tool calling, agentes, visión de entrada, audio ni modo de razonamiento explícito; es un modelo puramente text-to-image.

## Casos de uso

- Ilustración editorial y de libro: generación de ilustraciones de estilo pictórico (tinta china, gongbi, impresionismo) para portadas y páginas interiores, aprovechando la resolución variable hasta 1920 px y la fidelidad a prompts densos.
- Creación de arte conceptual para videojuegos y animación: exploración rápida de paletas y composiciones en tradiciones china y occidental con una sola GPU, gracias a los 532 M de parámetros y los 20 pasos de muestreo.
- Localización bilingüe de material gráfico: el caption bilingüe 50:50 permite generar la misma escena desde prompts en inglés o chino, útil para catálogos y campañas en ambos mercados.
- Reproducción y restauración estilística: generación de variaciones sobre obras o estilos históricos (fotografía vintage, pintura de paisaje) para proyectos de divulgación y museística.
- Prototipado rápido en pipelines de diseño: al ser un modelo pequeño con licencia MIT, puede integrarse en herramientas internas de generación por lotes sin coste de licencia y con requisitos de VRAM moderados.
- Investigación en modelos generativos compactos: la publicación del registro completo de entrenamiento (datos, currículo, estabilidad, kernels Ascend) lo convierte en banco de pruebas reproducible para estudiar flow-matching a escala 0,5B.
- Generación de fondos y texturas para aplicaciones web o móviles: resolución configurable y coste de inferencia bajo permiten generar assets a demanda en servidores modestos.

## Benchmarks y rendimiento

La model card menciona evaluación sobre cinco benchmarks públicos (GenEval, DPG, OneIG English, TIIF testmini y Qwen-Image-Bench) con nueve modelos comparados, pero los resultados numéricos se presentan únicamente en una figura (`benchmark_overview.png`) y en el capítulo de evaluación del repositorio de GitHub, no como tabla de valores en la información disponible. Las afirmaciones cualitativas del autor son:

- Compite directamente con DreamLite, SANA-0.6B y PixArt-Σ (tamaños similares).
- Se aproxima a SD3.5 Medium (modelo de mayor tamaño) en DPG, OneIG alignment y Qwen-Image-Bench.
- Su punto más fuerte es la alineación densa de prompts; su diversidad es alta en relación con modelos de alineación comparable.

No se han publicado tablas numéricas de benchmarks en la información disponible; los valores concretos deben consultarse en `notes/evaluation.md` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 532 M de parámetros en bfloat16 (aproximadamente 1,1 GB de pesos) más el codificador de texto Qwen3-0.6B congelado y el VAE de Qwen-Image, la huella total es moderada; una GPU consumer con 8-12 GB debería ser suficiente para 896x896, aunque el dato no está confirmado en la documentación.
- GPU recomendadas: cualquier GPU CUDA compatible con bfloat16; el quickstart oficial indica "Use Python 3.12 and a CUDA GPU". No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del modelo, pero no se documenta una lista de GPUs verificadas.
- Opciones de despliegue: pipeline propio `InkoPipeline` del repositorio `Mtrya/inko` (instalación con `pip install -e .`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLM y no aplican a este modelo de difusión).
- Latencia y throughput: no disponibles. Se documenta un +33,92 % de throughput en kernels durante el entrenamiento en Ascend, pero no cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inko | 532 M | Hasta 1920 px por eje; 896x896 por defecto | Flow-matching, arte chino y occidental, bilingue en/zh | MIT | Hugging Face (`kaupane/Inko`) y GitHub |
| SANA-0.6B | ~0,6 B | No disponible en la informacion | Difusión eficiente para texto-imagen | No disponible en la informacion | Referenciado como comparador en la model card |
| PixArt-Σ | No disponible en la informacion | No disponible en la informacion | Difusión transformer | No disponible en la informacion | Referenciado como comparador en la model card |
| DreamLite | No disponible en la informacion | No disponible en la informacion | Difusión texto-imagen | No disponible en la informacion | Referenciado como comparador en la model card |
| SD3.5 Medium | Mayor que 0,5 B (tamano exacto no disponible) | No disponible en la informacion | Difusión texto-imagen | No disponible en la informacion | Referenciado como comparador en la model card |

Los datos de rendimiento comparado (GenEval, DPG, OneIG, TIIF, Qwen-Image-Bench) están en la figura y el capítulo de evaluación del repositorio, no en forma de tabla numérica en la información proporcionada.

## Limitaciones y advertencias

- Texto renderizado y relaciones espaciales: el autor reconoce que el texto exacto y las relaciones espaciales siguen siendo débiles.
- Anatomía: persisten fallos anatómicos ocasionales.
- Razonamiento, conteo y conocimiento del mundo: el autor los califica de débiles.
- Negación en escenas densas: poco fiable; la model card se interrumpe en ese punto, pero la advertencia queda explícita.
- Idiomas: solo inglés y chino; no se documenta soporte de castellano ni de otras lenguas.
- Licencia MIT: permite uso comercial sin restricciones adicionales documentadas, pero el autor no ofrece garantías sobre idoneidad para producción ni sobre los derechos de las imágenes generadas en jurisdicciones concretas.
- Sesgos: no se documenta una evaluación de sesgos; el corpus incluye datos de arte histórico y fotografías, lo que puede arrastrar sesgos de representación no medidos.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir contenido plausible pero incorrecto (por ejemplo, arquitecturas o motivos históricos inexactos).
- Madurez: 0 descargas y 9 likes en el momento de la consulta; es un modelo reciente (creado en octubre de 2026) sin validación externa amplia.
- Dependencia del ecosistema: el pipeline propio requiere clonar el repositorio y Python 3.12; no hay integración documentada con bibliotecas estándar como `diffusers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaupane/Inko
- Repositorio GitHub y technical report: https://github.com/Mtrya/inko
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/kaupane/Inko
- Pesos preentrenados (tag `pretrain-base`): https://huggingface.co/kaupane/Inko/tree/pretrain-base
- Dataset de rollouts: https://huggingface.co/datasets/kaupane/inko-rollout-25k
- Capitulo de datos: https://github.com/Mtrya/inko/blob/main/notes/data.md
- Capitulo de preentrenamiento: https://github.com/Mtrya/inko/blob/main/notes/pretraining.md
- Capitulo de post-entrenamiento: https://github.com/Mtrya/inko/blob/main/notes/posttraining.md
- Capitulo de evaluacion: https://github.com/Mtrya/inko/blob/main/notes/evaluation.md
- Manifiesto de la galeria hero1: https://github.com/Mtrya/inko/blob/main/notes/assets/gallery/hero1/manifest.jsonl
- Manifiesto de la galeria hero2: https://github.com/Mtrya/inko/blob/main/notes/assets/gallery/hero2/manifest.jsonl
