# brandonmusic/Inkling2-mini-variable-looped-transformer-Flare

## Resumen

Inkling2-mini-variable-looped-transformer-Flare es un paquete de inferencia firmado publicado por brandonmusic que empaqueta los pesos del modelo de investigación TML-d24-varloop-research de Thinking Machines Lab, un transformer decoder-only con mezcla de expertos (MoE) y bucle variable de capas. El modelo base tiene 24 capas, 128 expertos enrutados (8 activos por token), anchura oculta de 2.304 y un vocabulario de 200.058 entradas, con un total de 26.4B parámetros y entre 3.4B y 7.4B activos según el número de pasadas del bucle. Es nativamente multimodal: incorpora una torre de visión de 23 capas y ventana de contexto de 1.048.576 tokens.

La particularidad del paquete es que no se distribuye como pesos cargables por Transformers, vLLM, SGLang o llama.cpp, sino como un runtime precompilado para una única tarjeta RTX PRO 6000 Blackwell (SM120, 96 GB), con kernels compilados, grafos de ejecución capturados y metadatos firmados. El paquete fija el modelo a tres pasadas del bucle y sirve una API compatible con OpenAI bajo el nombre `TML-d24-varloop-research`, con hasta 32 peticiones concurrentes.

Es relevante ahora porque ilustra una tendencia incipiente: empaquetar el modelo junto con su stack de inferencia optimizado para hardware concreto, sacrificando portabilidad a cambio de rendimiento y precisión nativa. El autor advierte que el modelo base es de investigación y no lo recomienda para producción, lo que conviene tener en cuenta antes de evaluarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) y bucle variable en capas 6-17 |
| Parametros totales | 26.4B |
| Parametros activos | 3.4B con 1 pasada, 5.4B con 3 pasadas, 7.4B con 5 pasadas |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, capas 0-19), MXFP8 (expertos enrutados, capas 20-23), BF16 (resto de pesos y torre de visión), caché KV en FP8 E4M3 |
| Idiomas soportados | no disponible |
| Licencia | Local Inference Lab License 1.0 (lil-license-1.0); modelo base Apache 2.0 con Acceptable Use Policy de Thinking Machines |
| Formato de pesos | Paquete propietario de Flare/Hyperflare (safetensors de metadatos + 25 ficheros en `weights/` + 4 en `deployments/gb202-tp1/rank-0/`) |
| Expertos enrutados | 128, de los cuales 8 activos por token |
| Capas | 24 (12 en bucle: capas 6-17) |
| Anchura oculta | 2.304 |
| Vocabulario | 200.058 entradas |
| Torre de visión | 23 capas, anchura 1.024, parches 20x20 px, fusión 2x2 |
| Cabecera de borrador (speculative decoding) | 3 capas, propone 7 tokens por ronda |
| Pasadas del bucle en el paquete | 3 (fijas al preparar el paquete) |
| Peticiones concurrentes | hasta 32 |
| Tamaño del repo | 24.8 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 24 capas, de las cuales las capas 6 a 17 se ejecutan un número variable de veces compartiendo pesos; las capas 0-5 y 18-23 se ejecutan una sola vez. En cada pasada del bucle, la entrada no es la salida de la pasada anterior: todas las pasadas parten de la salida de la capa 5 y del mismo estado de bloque, y el único estado que cruza el límite de pasada es el bloque medio de la pasada previa y su hidden final. Cada capa en bucle lee esos dos vectores mediante una query aprendida propia (para sus entradas de query, key, value y feed-forward) y mezcla el resultado en su hidden con una puerta de rango 64. Así, cada pasada aplica los mismos pesos a una entrada distinta. La profundidad efectiva por token es de 12 capas por pasada más las 12 capas fuera del bucle: 24, 48 o 72 visitas de capa con 1, 3 o 5 pasadas respectivamente.

El publisher entrenó el modelo con entre 1 y 5 pasadas y lo post-entrenó con 3. La multimodalidad es nativa: una torre de visión de 23 capas codifica imágenes en parches de 20x20 píxeles que se agrupan en celdas 2x2, de modo que cada celda de 40x40 píxeles corresponde a un token del decoder. El checkpoint usa precisión mixta nativa: expertos enrutados en NVFP4 en capas 0-19 y MXFP8 en capas 20-23, con el resto de pesos en BF16. Incluye una cabecera de borrador de 3 capas (`mtp.safetensors`) que propone 7 tokens por ronda para decodificación especulativa, leyendo el hidden del target en tres puntos del bucle y en la salida final, compartiendo embedding y cabeza de salida. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset.

## Capacidades

- Generación de texto conversacional en un pipeline image-text-to-text.
- Procesamiento conjunto de texto e imágenes por el decoder, con la torre de visión integrada.
- Ventana de contexto de 1.048.576 tokens, adecuada para documentos o conversaciones muy largas.
- Decodificación especulativa mediante cabecera de borrador de 3 capas (7 tokens por ronda).
- Servicio concurrente de hasta 32 peticiones simultáneas.
- API compatible con OpenAI bajo el nombre de modelo `TML-d24-varloop-research`.
- Bucle variable de capas que permite ajustar la profundidad efectiva (24, 48 o 72 visitas de capa) según el número de pasadas, aunque el paquete fija tres.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos con imágenes: la ventana de 1.048.576 tokens permite procesar manuales, informes o expedientes completos con figuras y tablas en una sola petición, sin trocear el contenido.
- Asistentes conversacionales de larga duración: el contexto de un millón de tokens y el soporte de hasta 32 peticiones concurrentes permiten mantener sesiones extensas con historial completo en un único servidor.
- Procesamiento de imágenes en flujos documentales: la fusión de parches 2x2 en tokens de 40x40 píxeles hace viable la lectura de capturas, diagramas y páginas escaneadas dentro del mismo pipeline que el texto.
- Evaluación de investigación en transformers con bucle: el paquete sirve como banco de pruebas reproducible del modelo base de Thinking Machines en una sola tarjeta, útil para estudiar el efecto del número de pasadas y del bucle compartido.
- Despliegue en hardware Blackwell dedicado: al estar precompilado para RTX PRO 6000 (SM120, 96 GB), permite montar un endpoint compatible con OpenAI sin compilar kernels ni ajustar el stack en la máquina de destino.
- Pruebas de decodificación especulativa: la cabecera de borrador incluida permite medir el impacto de la propuesta de 7 tokens por ronda en latencia y throughput dentro del runtime Flare.
- Prototipado de aplicaciones multimodales con caché KV en FP8: la caché E4M3 con impacto medido de +0,07 % en perplejidad sirve para validar arquitecturas de memoria eficiente antes de pasar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento cualitativo es la variación de perplejidad por el uso de caché KV en FP8 E4M3: +0,07 % (2,8570 frente a 2,8541 con caché BF16) sobre un pasaje de prueba de 2.048 tokens con activaciones de expertos en BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: el paquete está preparado para una única GPU de 96 GB (RTX PRO 6000 Blackwell, SM120); no se documentan configuraciones para GPUs de menor memoria.
- GPU recomendadas: RTX PRO 6000 Blackwell (SM120, 96 GB). No se mencionan A100, H100 ni RTX 4090 como compatibles.
- Cabe en consumer GPU: no, según la información disponible; el paquete requiere una tarjeta profesional de 96 GB.
- Opciones de despliegue: exclusivamente el ejecutable Flare/Hyperflare incluido en el paquete. Transformers, vLLM, SGLang y llama.cpp no pueden cargar este formato.
- Latencia y throughput estimados: no disponibles. El paquete incluye kernels compilados para los gates del bucle, capas de expertos, mezclas residuales, router, atención y cabecera de borrador, con atención de decodificación y verificación leyendo la caché FP8 directamente a través del tensor memory accelerator de SM120, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Inkling2-mini-variable-looped-transformer-Flare | 26.4B totales, 5.4B activos a 3 pasadas | 1.048.576 | LIL 1.0 | Paquete Flare precompilado para RTX PRO 6000 |
| TML-d24-varloop-research (modelo base) | 26.4B totales, 3.4B-7.4B activos según pasadas | 1.048.576 | Apache 2.0 + Acceptable Use Policy | Pesos del publisher; cargable por sus implementaciones de referencia |
| Alternativas de tamaño y tarea comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El publisher del modelo base lo describe como modelo de investigación y no lo recomienda para producción.
- El paquete fija el número de pasadas a tres; no sirve configuraciones de una o cinco pasadas, que requerirían un paquete distinto.
- El formato es propietario: Transformers, vLLM, SGLang y llama.cpp no pueden cargarlo, lo que limita la portabilidad y la integración con stacks estándar.
- Dependencia de hardware muy específico (RTX PRO 6000 Blackwell, SM120, 96 GB); no hay soporte documentado para otras GPUs.
- La licencia LIL 1.0 es distinta de la Apache 2.0 del modelo base y añade la Acceptable Use Policy de Thinking Machines a cualquier uso; conviene revisar ambas antes de un uso comercial.
- Idiomas soportados no documentados; riesgo de comportamiento irregular fuera de los idiomas de entrenamiento, que no se especifican.
- No se publican datos sobre sesgos, tasas de alucinación ni evaluación de seguridad.
- El tamaño del repo (24.8 GB) y la ausencia de cuantizaciones alternativas dificultan pruebas en entornos con menos recursos.
- La decodificación especulativa y la caché KV en FP8 introducen aproximaciones; la variación de perplejidad medida es pequeña (+0,07 %) pero solo se ha verificado en un pasaje de 2.048 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brandonmusic/Inkling2-mini-variable-looped-transformer-Flare
- Modelo base: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Licencia del paquete: fichero `LICENSE` del repositorio
- Créditos: fichero `CREDITS.md` del repositorio
- Proyectos citados por el autor: Flare, Hyperflare, FlashInfer, Hugging Face Transformers, SGLang, NVIDIA, Local Inference Lab
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada
