# immanuelpeter/MoonViT-K3.1-Pro

## Resumen

MoonViT-K3.1-Pro es un extractor de características visuales (vision encoder) publicado por el usuario immanuelpeter en Hugging Face, derivado del modelo multimodal Kimi-K3.1-Pro de Moonshot AI. No se trata de un modelo lingüístico completo, sino de un bundle que contiene únicamente el Tower (el codificador de visión) y el Projector (la capa que adapta las características visuales al espacio del modelo principal). El repositorio incluye 165 tensores del Tower y 3 del Projector en su dtype original BF16, verificados tensor a tensor contra el checkpoint padre fijado en el commit `6d0a0202956796543364d666ab19c6ad1a494ee1`.

La arquitectura reproduce la de Kimi K3: un Tower de 27 bloques de anchura 1024, con un merger espacial que agrupa cada cuadrado de parches 2x2 en un token de 4096 dimensiones, y un Projector que produce tokens de 7168 dimensiones. El bundle tiene 401.214.464 parámetros totales y un tamaño de repositorio de 0,9 GB, lo que lo hace manejable para experimentación en una sola GPU. Su pipeline declarado es `image-feature-extraction` y la librería es Transformers con código de modelado personalizado (`moonvit_v2`).

Su relevancia es acotada pero específica: permite a investigadores extraer características visuales congeladas del encoder de Kimi K3.1 Pro de forma aislada, sin cargar el modelo completo, para estudiar comparativas de arquitectura de visión entre K3 y K3.1 Pro. El autor advierte explícitamente de que las mediciones con características congeladas no permiten establecer relaciones causales sobre las etapas de entrenamiento ni explicar las puntuaciones del modelo completo en tareas de código, finanzas, CAD o factualidad. No se han publicado resultados de benchmarks de calidad en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision transformer (MoonViT v2) con Tower de 27 bloques de anchura 1024, merger espacial 2x2 y Projector a 7168 |
| Parámetros totales | 401.214.464 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de extracción de características de imagen) |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3.1-Pro License (custom, `license: other`) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El bundle contiene exclusivamente el Tower y el Projector del modelo multimodal Kimi K3.1 Pro. El Tower consta de 27 bloques transformer de anchura 1024 y extrae características visuales que, tras pasar por una RMSNorm final, entran en un merger espacial que agrupa cada cuadrado de parches 2x2 en un token de 4096 dimensiones. El Projector transforma después esos tokens a 7168 dimensiones, el espacio de embedding del modelo principal. No se publican detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; el autor indica que los checkpoints liberados no permiten aislar qué etapa de entrenamiento causó los cambios de pesos entre K3 y K3.1 Pro.

La innovación técnica destacable no está en el modelo en sí, sino en el proceso de exportación y validación: el bundle incluye un `export_manifest.json` con la procedencia de checkpoint, código y ficheros, y verifica cada tensor contra el padre fijado. La paridad numérica se ha validado con el código oficial de vLLM para visión registrado para Pro, sustituyendo únicamente dependencias de motor por operaciones PyTorch de rango único. Con el kernel rotatorio empaquetado de Triton en CUDA (o el rotatorio nativo en CPU) y atención SDPA enmascarada, las salidas BF16 son bit-exactas para tres imágenes fijas de 448 px en cada profundidad del Tower, tanto merged como projected. Sin embargo, el wrapper oficial `TORCH_SDPA` de vLLM difiere en BF16 con una diferencia L2 relativa máxima por slice de aproximadamente 8,1 %, por lo que el bundle no debe interpretarse como bit-idéntico a la ejecución BF16 de vLLM en producción.

## Capacidades

- Extracción de características visuales (image feature extraction) a partir de imágenes de entrada.
- Producción de tokens visuales merged de 4096 dimensiones y proyectados de 7168 dimensiones.
- Extracción por profundidad: el Tower permite acceder a características en cada nivel de profundidad, no solo a la salida final.
- Inclusión de la RMSNorm final del Tower en la extracción.
- Código de modelado independiente (`moonvit_v2`) compatible con Transformers mediante `trust_remote_code`.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un componente visual, no un modelo de lenguaje.
- No dispone de modo thinking, visión generativa ni audio.

## Casos de uso

- Investigación en comparativas de arquitectura de visión: cargar el Tower y el Projector de forma aislada para comparar características congeladas entre K3 y K3.1 Pro, sin necesidad de desplegar el modelo completo de Moonshot AI.
- Extracción de embeddings visuales para sistemas de recuperación de imágenes: usar las salidas proyectadas de 7168 dimensiones como representación vectorial en índices de búsqueda visual, aprovechando que el bundle cabe en una GPU consumer.
- Auditoría de procedencia de pesos: el `export_manifest.json` y la verificación tensor a tensor permiten validar que un despliegue concreto coincide con el checkpoint padre fijado, útil en pipelines de compliance de modelos.
- Validación de paridad numérica de backends: comparar la salida del bundle con la ejecución oficial de vLLM para detectar divergencias en BF16 (el autor documenta hasta un 8,1 % de diferencia L2 relativa con el wrapper `TORCH_SDPA`), lo que sirve para calibrar tolerancias en producción.
- Desarrollo de adaptadores multimodales: al disponer del Projector a 7168 dimensiones, se puede emparejar el encoder con cabezas o modelos que operen en ese espacio de embedding para prototipos de investigación.
- Docencia y experimentación con vision transformers: con 401 M de parámetros y 0,9 GB en BF16, es viable ejecutarlo en una RTX 4090 o incluso en GPUs con 8-12 GB de VRAM, lo que facilita prácticas sobre atención, mergers espaciales y proyecciones.
- Reproducción de experimentos con protocolo fijo: el bench usa redimensionado bicúbico de lado corto a 448 px y recorte central con batch size 1, lo que permite reproducir resultados de forma determinista en atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las mediciones completas de capacidad con características congeladas están pendientes y que no se reclama ninguna ventaja de calidad del modelo. Los únicos datos numéricos publicados son de validación de paridad: salidas BF16 bit-exactas con el kernel rotatorio oficial y SDPA enmascarada para tres imágenes fijas de 448 px, y una diferencia L2 relativa máxima por slice de aproximadamente 8,1 % frente al wrapper `TORCH_SDPA` oficial de vLLM.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en BF16 para los pesos; con activaciones y batch size 1 a 448 px, se estima un uso total en el rango de 2-4 GB, aunque no se dispone de medición oficial.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; una RTX 4090, A100 o H100 son sobredimensionadas para este bundle y permitirían lotes mayores o mayor resolución.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más (RTX 3060 8 GB, RTX 4060 Ti, RTX 4070, RTX 4090).
- Opciones de despliegue: Transformers con `trust_remote_code` (librería declarada); el autor referencia código oficial de vLLM para visión, por lo que vLLM es una vía de despliegue validada. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. El autor recomienda batch size 1 para atención reproducible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoonViT-K3.1-Pro (este) | 401.214.464 | no disponible | Vision encoder (Tower + Projector) | Kimi K3.1-Pro License (custom) | Hugging Face, 0 descargas |
| moonshotai/Kimi-K3.1-Pro (modelo base) | no disponible en la información | no disponible | Modelo multimodal completo | Kimi K3.1-Pro License | Hugging Face (referenciado como base) |
| AI4Industry/MoonViT-V2 (código fuente) | no disponible | no disponible | Código de modelado standalone | no disponible | Repositorio referenciado en la model card |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; su uso se limita a extracción de características visuales.
- El protocolo de evaluación del bench (redimensionado bicúbico a 448 px y recorte central cuadrado) difiere del preprocesado dinámico del modelo completo, por lo que los resultados no son directamente trasladables a producción.
- La ejecución no es bit-idéntica a vLLM en BF16: el wrapper `TORCH_SDPA` oficial presenta hasta un 8,1 % de diferencia L2 relativa por slice, lo que puede afectar a comparaciones numéricas estrictas.
- Las mediciones con características congeladas no permiten establecer relaciones causales sobre etapas de entrenamiento ni explicar las puntuaciones del modelo completo en código, finanzas, CAD o factualidad, según advierte el propio autor.
- La licencia es la Kimi K3.1-Pro License (custom, `license: other`), copiada byte a byte del padre; no está cubierta por la licencia MIT del bench. Es imprescindible revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial.
- El código vendorizado conserva sus avisos de copyright originales; su reutilización debe respetar dichos avisos.
- Riesgo de sesgos y alucinación: no disponible, al no ser un modelo generativo; los sesgos heredados del dataset de entrenamiento del encoder no se documentan.
- Idiomas soportados: no disponible; al ser un encoder visual, la dimensión lingüística no aplica directamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación comunitaria independiente.
- No se han publicado benchmarks de calidad; no se debe asumir ninguna ventaja de rendimiento frente a otros encoders visuales.

## Enlaces

- Hugging Face: https://huggingface.co/immanuelpeter/MoonViT-K3.1-Pro
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Código de modelado standalone (AI4Industry/MoonViT-V2): https://huggingface.co/AI4Industry/MoonViT-V2
- Commit del checkpoint padre: `6d0a0202956796543364d666ab19c6ad1a494ee1` (referenciado en la model card)
- Commit del código standalone: `c5acb88baf02a94e68ca8a225f7eebee152c1fc6` (referenciado en la model card)
- Commit del código oficial de vLLM para visión: `1ecc9cc4ce6626352df39e4364579ec376c10761` (referenciado en la model card)
- Ficheros de procedencia y validación: `export_manifest.json`, `LICENSE` y `NOTICE` dentro del repositorio de Hugging Face
