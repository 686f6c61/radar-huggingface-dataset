# local-inference-lab/kimi-k3.1-pro-flare

## Resumen

Kimi K3.1 Pro Flare es un empaquetado nativo para inferencia del modelo Kimi K3.1 Pro de Moonshot AI, publicado por el colectivo local-inference-lab bajo el runtime Flare. No se trata de un modelo nuevo, sino de una exportación optimizada del checkpoint original (`moonshotai/Kimi-K3.1-Pro`, revisión `d9e99b0`) junto con el módulo de decodificación especulativa DFlash2 (`RadixArk/Kimi-K3.1-Dflash2-Preview`). El repositorio incluye dos variantes de geometría de caché: DCP8 (dos grupos de ocho rangos como lectores de contexto) y DCP16 (los dieciséis rangos como lectores), ambas con topología TP16.

El objetivo es ofrecer un artefacto listo para servir en clústeres de 16 GPU con precisión mixta agresiva: pesos de expertos enrutados en MXFP4 con escalas de bloque sin pérdida (CSF), cuerpo DFlash2 y proyecciones del target en MXFP8 en línea, y una copia independiente de la cabeza de vocabulario del draft en NVFP4. Incorpora soporte de visión mediante MoonViT con capacidades de parche de 256 a 65.536, y decodificación especulativa con siete tokens draft y verificación adaptativa.

Es relevante porque ejemplifica el patrón de distribución de modelos grandes como "cores" firmados y precompilados para un runtime concreto, con controles de precisión separados para target y draft, y publicación verificable mediante firma LIL. En el momento de redactar esta ficha los pesos aún se están subiendo: solo los ficheros no-peso están completos (`_NONWEIGHTS_READY.json`), y el directorio no es servible hasta que aparezca `_READY.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas target y capas densas DFlash2 para especulación; soporte de visión MoonViT |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (prefill en chunks de 4096; mediciones realizadas con prefills de 32K) |
| Tipos de cuantizacion | MXFP4 (expertos enrutados), MXFP8 en línea (target `kda-input`, cuerpo DFlash2, atención y MLP), NVFP4 (cabeza de vocabulario del draft), BF16 (cabeza de verificación del target), precisión de checkpoint para normalización, convolución, selector de candidatos y pesos key/value absorbidos |
| Idiomas soportados | no disponible |
| Licencia | other (no se detalla el texto de la licencia en la información disponible) |
| Formato de pesos | safetensors, empaquetado nativo Flare (cores firmados con firma LIL) |

## Arquitectura y entrenamiento

La información disponible describe el artefacto de inferencia, no el entrenamiento del modelo base. El core consta de 93 capas target y cinco capas densas DFlash2. La decodificación especulativa DFlash2 emplea siete tokens draft, verificación adaptativa y sin borradores de historial (`--no-history-drafts`), con una capacidad de tokens especulativos de 32 y un presupuesto de grafos de 16. El target aplica cuantización MXFP8 en línea limitada al ámbito `kda-input`, mientras que el cuerpo DFlash2 (contexto, atención latente/query/output y proyecciones MLP) se convierte a MXFP8; la cabeza de vocabulario del draft se mantiene en una copia NVFP4 independiente y la verificación del target usa BF16.

Los expertos enrutados usan pesos MXFP4 nativos con escalas de bloque CSF sin pérdida. La geometría de caché difiere entre variantes: DCP8 usa dos grupos de ocho rangos como lectores de contexto y DCP16 usa los dieciséis rangos, sin cambiar la precisión del target ni del draft. La visión se cubre con MoonViT y capacidades de parche de 256, 1024, 4096, 16384 y 65536. El serving se apoya en FlashInfer (commit `aa6c422`) y en el árbol Flare con los PR #286 (manejo de caché nativa) y #291 (selección independiente del cuerpo DFlash2, que habilita `--draft-body-quantization`). No se dispone de datos sobre volumen de tokens, composición del dataset ni fases de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento sobre el modelo base Kimi K3.1 Pro (capacidades específicas del base no detalladas en la información disponible).
- Procesamiento de imágenes mediante MoonViT, con concurrencia de imagen configurable (cuatro en la exportación de referencia).
- Decodificación especulativa nativa con DFlash2: siete tokens draft, verificación adaptativa y sin borradores de historial.
- Control independiente de precisión para target y draft (MXFP8 en el cuerpo, NVFP4 en la cabeza del draft, BF16 en la verificación).
- Serving multi-request con concurrencia máxima de cuatro y prefill en chunks de 4096.
- Firma y verificación de integridad del core mediante claves de publicador (`--publisher-keys`).
- Soporte de tool calling, function calling, uso agéntico o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de Kimi K3.1 Pro en clústeres de 16 GPU con topología TP16: el core DCP8 o DCP16 permite servir el modelo con una configuración de precisión mixta prevalidada, evitando al equipo de infraestructura tener que diseñar la cuantización desde cero.
- Inferencia multimodal con imágenes a gran escala: MoonViT con capacidad de parche de hasta 65.536 y concurrencia de imagen de cuatro encaja en pipelines de análisis documental o moderación visual donde se procesan lotes de imágenes junto a texto.
- Servicio de chat de baja latencia: la decodificación especulativa DFlash2 con siete tokens draft y verificación adaptativa reduce el coste por token generado en cargas interactivas, siempre que el tráfico se mantenga dentro de la concurrencia de cuatro configurada.
- Evaluación comparativa de geometrías de caché: disponer de DCP8 y DCP16 con idéntica precisión permite medir en el mismo hardware el impacto de la geometría de contexto en throughput y latencia sin sesgos de cuantización.
- Entornos con requisitos de cadena de suministro verificable: la firma LIL con `development: false` y la verificación por claves de publicador permiten desplegar un core cuya procedencia e integridad se comprueban en el arranque.
- Réplica de resultados de investigación: las mediciones publicadas usan pesos reales, serving nativo, concurrencia C1/C4 y tres prefills en frío de 32K, lo que facilita reproducir experimentos de decodificación especulativa sobre un modelo de gran escala.
- Integración en plataformas internas de inferencia basadas en Flare: el artefacto se sirve con `flare run` y expone una API en el puerto configurado (8171 en el ejemplo), lo que simplifica su incorporación a gateways existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona "verified results" obtenidos con pesos reales, serving nativo, concurrencia C1/C4 y tres prefills verificados en frío de 32K, pero el texto proporcionado se interrumpe antes de incluir las cifras concretas.

## Requisitos de hardware

- Exportación y serving diseñados para 16 GPU en paralelo (`--gpus 0-15`), con topología TP16.
- Tamaño del repositorio: 289,6 GB, lo que da una cota inferior del almacenamiento necesario para los pesos publicados.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible (las rutas de exportación usan el prefijo `gb202`, asociado a la generación Blackwell de NVIDIA, pero la información no confirma modelos concretos).
- ¿Cabe en GPU de consumo? No disponible; por el tamaño del repositorio y la topología de 16 rangos, el despliegue está pensado para nodos multi-GPU.
- Opciones de despliegue: runtime Flare (`flare run`), Ignition para exportación, FlashInfer como backend de atención. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en cifras; la configuración fija concurrencia máxima de cuatro, concurrencia de imagen de cuatro y prefill de 4096 tokens por chunk.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kimi K3.1 Pro Flare (este) | no disponible | no disponible | other | safetensors + core Flare firmado | Exportación optimizada para TP16 con DFlash2 y visión MoonViT |
| Kimi K3.1 Pro (original, `moonshotai`) | no disponible | no disponible | no disponible | no disponible | Checkpoint fuente del que deriva esta exportación |
| Kimi K3.1 Dflash2 Preview (`RadixArk`) | no disponible | no disponible | no disponible | no disponible | Módulo de decodificación especulativa usado como draft |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Pesos incompletos: en el momento de la ficha, solo están listos los ficheros no-peso; el core no es servible hasta que exista `_READY.json` en el directorio correspondiente.
- Licencia "other" sin texto detallado: no se puede confirmar si el uso comercial está permitido; es imprescindible revisar los términos del modelo base y del draft antes de producción.
- Idiomas soportados no documentados: no hay garantía sobre calidad multilingüe más allá de lo que ofrezca el modelo base.
- Dependencia estricta del runtime: requiere un entorno Flare/Ignition preparado, con `flare_heliopause` compilado desde el mismo árbol de fuentes y con los PR #286 y #291 aplicados; sin #291 no existe `--draft-body-quantization`.
- Concurrencia limitada a cuatro peticiones y cuatro imágenes simultáneas en la configuración de referencia, lo que restringe el throughput agregado en cargas de alta demanda.
- La reutilización de pesos (`--reuse-weights`) solo es válida entre layouts compatibles; no aplica a la transición inicial de solo-texto a visión y no evita la carga del checkpoint.
- Exposición de red: el ejemplo de serving enlaza `0.0.0.0`, lo que publica la API en todas las interfaces; requiere controles de acceso explícitos.
- Gestión de claves de firma: la clave privada y su passphrase nunca deben residir en el repositorio, scripts o logs.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse sobre el modelo base antes de desplegar en dominios sensibles.
- Sin benchmarks públicos verificables en la información proporcionada, no es posible avalar afirmaciones de rendimiento frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/local-inference-lab/kimi-k3.1-pro-flare
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro (revisión `d9e99b0792a5e93b78ea9bea62a68167e36ddd9e`)
- Draft DFlash2: https://huggingface.co/RadixArk/Kimi-K3.1-Dflash2-Preview (revisión `ea257b38a8ee755b65287bb8ccd0938b519ce26b`)
- PR de manejo de caché nativa en Flare: https://github.com/NVIDIA/hyperflare-inference/pull/286
- PR de selección independiente del cuerpo DFlash2: https://github.com/NVIDIA/hyperflare-inference/pull/291
- FlashInfer (commit `aa6c4221586f7607c2bca64abbcdc0699845cf3b`): no se proporciona URL directa en la información disponible.
