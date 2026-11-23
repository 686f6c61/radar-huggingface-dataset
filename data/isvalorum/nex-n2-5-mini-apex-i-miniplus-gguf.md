# IsValorum/Nex-N2.5-mini-APEX-I-MiniPlus-GGUF

## Resumen

Nex-N2.5-mini APEX-I-MiniPlus (edición V1) es una cuantización GGUF personalizada del modelo multimodal nex-agi/Nex-N2.5-mini, publicada por el usuario independiente IsValorum bajo licencia Apache 2.0. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con capacidades de visión y orientado a tareas agénticas y de uso de ordenador (computer-use), con 34.660.610.688 parámetros totales según los pesos en safetensors del modelo original. Esta edición concreta no es un modelo nuevo: es un empaquetado de cuantización tensor a tensor diseñado para maximizar la fidelidad de tokens dentro de un presupuesto de memoria muy ajustado (unos 13,56 GiB).

La relevancia de esta ficha reside en su enfoque de cuantización selectiva. En lugar de aplicar una receta plana de 3 bits, el autor preserva los router gates en F32 sin comprimir, protege la cabeza de salida (output head) en Q6_K, mantiene las puertas de atención en Q8_0 y deja los expertos centrales en IQ3_XXS. Este esquema busca evitar los picos de perplejidad y los errores sintácticos que, según el autor, aparecen en las cuantizaciones comunitarias genéricas que comprimen los expertos a 2 bits (IQ2_S). El resultado declarado es un modelo que cabe en configuraciones de VRAM de 24 GB con contexto completo y que también puede ejecutarse, total o parcialmente, en RAM de sistema.

El modelo soporta más de 30 idiomas declarados, pipeline image-text-to-text y está pensado para su uso con llama.cpp y con el ecosistema de Unsloth Studio. Esta edición V1 se mantiene como perfil "ligero y ágil"; el propio autor recomienda para la mayoría de despliegues su edición posterior V2.1, que reporta una perplejidad de 6,4725 ± 0,1635 y un peso de aproximadamente 14,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal con visión (etiqueta qwen35moe); detalles de capas y dimensión oculta no disponibles |
| Parametros totales | 34.660.610.688 (34,66 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 256K tokens según la model card (contexto completo ejecutable en VRAM de 24 GB según el autor) |
| Tipos de cuantizacion | GGUF híbrida por tensor: router gates en F32, output head en Q6_K, puertas de atención en Q8_0, expertos centrales en IQ3_XXS; proyector visual mmproj en Q8_0 |
| Idiomas soportados | en, es, fr, de, pt, it, ru, ja, ko, vi, th, ar, id, nl, tr, pl, sv, cs, hi, he, fa, ms, ro, hu, uk, el, tl, da, fi, no, zh (31 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con mmproj Q8_0 para visión); repo de 15,2 GB |

## Arquitectura y entrenamiento

El modelo base nex-agi/Nex-N2.5-mini emplea una arquitectura Mixture-of-Experts con capacidades multimodales (image-text-to-text). La etiqueta qwen35moe del repositorio sugiere una base derivada de la familia Qwen, aunque no se dispone de detalles oficiales sobre el número de expertos, la dimensión del modelo, el número de capas ni la proporción de parámetros activos por token. Tampoco se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica de esta publicación no está en el modelo base, sino en la estrategia de cuantización. El autor describe un esquema tensor a tensor que combina precisión alta en los componentes sensibles (routers en F32, output head en Q6_K, atención en Q8_0) con compresión agresiva pero calibrada en los expertos (IQ3_XXS). Además, se emplea vectorización lineal compatible con CPU para evitar bloqueos de búsqueda en tablas (lookup stalls) propios de AVX2, lo que facilita la inferencia con parte del modelo en RAM de sistema. El paquete incluye un proyector visual de alta precisión (Q8_0) que puede mantenerse cargado en VRAM de GPU mientras el resto del modelo reside en memoria del sistema.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 256K tokens).
- Razonamiento profundo y resolución de problemas multi-paso, con soporte declarado para modo agéntico.
- Comprensión de imágenes y texto (pipeline image-text-to-text): lectura de pantallas, OCR y análisis visual.
- Casos de uso de computer-use: interpretación de interfaces gráficas y ejecución de acciones guiadas por el modelo.
- Soporte multilingüe amplio: 31 idiomas declarados, incluidos español, inglés, chino, francés, alemán, portugués, árabe, japonés y coreano.
- Compatibilidad con llama.cpp y con endpoints compatibles (etiqueta endpoints_compatible).
- Capacidades de tool calling y function calling: no confirmadas explícitamente en la información disponible, aunque las etiquetas "agentic" y "computer-use" apuntan a soporte de interacción con herramientas.
- Verificado empíricamente en Unsloth Studio según la model card.
- Proyector visual Q8_0 incluido para análisis rápido de pantalla y OCR.

## Casos de uso

- Agentes de automatización de escritorio: el modelo puede analizar capturas de pantalla mediante el proyector visual Q8_0 y generar acciones sobre la interfaz, gracias a su orientación computer-use y a la ventana de contexto de hasta 256K tokens que permite mantener el historial completo de la sesión.
- Asistencia al cliente multilingüe: con 31 idiomas declarados y contexto largo, puede gestionar conversaciones multi-turno con historial extenso sin perder el hilo, manteniendo respuestas coherentes en español, inglés, árabe o japonés dentro del mismo despliegue.
- Procesamiento de documentos con OCR y razonamiento: el proyector visual en Q8_0 permite extraer texto de imágenes y pantallas, y el modelo puede razonar sobre el contenido extraído para resumir, clasificar o responder preguntas sobre documentos escaneados.
- Despliegue en estaciones de trabajo con 24 GB de VRAM: según el autor, el contexto completo de 256K puede ejecutarse íntegramente en VRAM en GPUs de 24 GB, lo que habilita asistentes de código o análisis de repositorios largos en hardware de gama alta de consumo.
- Inferencia en portátiles con RAM de sistema: el diseño con vectorización compatible con CPU permite ejecutar el modelo total o parcialmente en DDR4/DDR5, con tasas declaradas de 20 a 45 tok/s, adecuado para prototipado y uso personal en equipos sin GPU dedicada potente.
- Investigación sobre cuantización: el repositorio sirve como referencia reproducible de cuantización selectiva por tensor (F32/Q6_K/Q8_0/IQ3_XXS) para estudiar el impacto de cada componente en la perplejidad y en la calidad de generación.
- Análisis de imágenes en pipelines de datos: la combinación de visión y contexto largo permite procesar lotes de imágenes con instrucciones complejas y mantener coherencia entre elementos de un mismo lote.

## Benchmarks y rendimiento

La model card incluye una comparativa de perplejidad entre ediciones de la familia APEX-I-MiniPlus. Los datos disponibles se refieren principalmente a la edición V2.1; para V1 no se publican cifras de perplejidad en la información proporcionada.

| Metrica | APEX-I-MiniPlus V2.1 | Baseline sin cuantizar (aprox.) | Delta |
|---|---|---|---|
| Perplejidad (PPL) | 6,4725 ± 0,1635 | ~6,40 | +0,07 aprox. |
| Tamano en disco | ~14,7 GB (13,74 GiB) | no disponible | no disponible |
| Perfil de calidad declarado | Equivalente a Q5_K / Q6_K | — | — |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repo es de 15,2 GB; la edición V1 ocupa aproximadamente 13,56 GiB según la model card, y la V2.1 unos 13,74 GiB.
- GPU recomendadas: el autor afirma que el contexto completo de 256K cabe en VRAM de 24 GB (por ejemplo, RTX 3090, RTX 4090, RTX 5090 o A10G de 24 GB). Para GPUs de menor VRAM se contempla offload parcial a RAM de sistema.
- Cabe en GPU de consumo: sí, en modelos con 24 GB de VRAM; en GPUs de 16 GB o menos requeriría offload parcial o cuantizaciones más agresivas no documentadas aquí.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Unsloth Studio (verificado empíricamente por el autor) y endpoints compatibles. No se documenta soporte explícito para vLLM o TGI en la información disponible.
- Latencia y throughput: 20 a 45 tok/s en inferencia total o parcial en RAM de sistema, según procesador y ancho de banda de DDR4/DDR5. La model card menciona proyecciones de throughput para RTX 30/40/50, pero no se detallan cifras concretas en la información proporcionada.
- El proyector visual mmproj en Q8_0 puede mantenerse cargado en VRAM de GPU de forma independiente al resto del modelo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nex-N2.5-mini APEX-I-MiniPlus V1 (esta ficha) | 34,66 mil millones | Hasta 256K | Apache 2.0 | GGUF | Cuantización selectiva por tensor; ~13,56 GiB |
| Nex-N2.5-mini APEX-I-MiniPlus V2.1 | 34,66 mil millones (mismo base) | Hasta 256K | Apache 2.0 | GGUF | PPL 6,4725 ± 0,1635; ~13,74 GiB; recomendada por el autor |
| Cuantizaciones comunitarias APEX-I-Mini genéricas | 34,66 mil millones (mismo base) | Hasta 256K | Apache 2.0 | GGUF | Expertos en IQ2_S, output head en Q3_K_M; el autor reporta picos de perplejidad y errores sintácticos |
| nex-agi/Nex-N2.5-mini (modelo base) | 34,66 mil millones | Hasta 256K | Apache 2.0 | safetensors | Pesos sin cuantizar; requiere hardware de mayor capacidad |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Esta es una cuantización de terceros (IsValorum), no una publicación oficial de nex-agi; la calidad final depende del proceso de cuantización y del motor de inferencia utilizado.
- La cuantización IQ3_XXS en los expertos centrales implica pérdida de precisión respecto al modelo base; el autor la sitúa por encima de las recetas comunitarias de 2 bits, pero por debajo de cuantizaciones de 5-6 bits.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- No se documentan evaluaciones de sesgo ni de seguridad para esta cuantización.
- El rendimiento en idiomas distintos del inglés y el chino puede ser inferior; los 31 idiomas declarados no implican calidad homogénea.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base nex-agi/Nex-N2.5-mini antes de desplegar en producción.
- El soporte de tool calling y function calling no está confirmado explícitamente en la documentación; conviene validarlo empíricamente antes de integrarlo en pipelines agénticos.
- Las cifras de throughput (20-45 tok/s) son estimaciones del autor dependientes del hardware y de la configuración de offload; no deben tomarse como garantías.
- El autor recomienda la edición V2.1 sobre esta V1 para la mayoría de despliegues, lo que sugiere que V1 es un perfil legacy mantenido por transparencia arquitectónica.

## Enlaces

- Repositorio Hugging Face (esta edición): https://huggingface.co/IsValorum/Nex-N2.5-mini-APEX-I-MiniPlus-GGUF
- Edición recomendada V2.1: https://huggingface.co/IsValorum/Nex-N2.5-mini-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
