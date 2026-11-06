# LibreYOLO/LibrePRXPixel7b

## Resumen

LibrePRXPixel7b es un espejo (mirror) del modelo de generación de imágenes a partir de texto PRXPixel de Photoroom, un modelo de 7B parámetros que opera directamente en espacio de píxeles RGB, sin autoencoder latente, y condicionado por un codificador de texto Qwen3-VL. Lo publica la organización LibreYOLO dentro de su ecosistema de herramientas open source, con el objetivo de ofrecer pesos de acceso libre bajo licencia Apache-2.0 empaquetados para su propio framework. Los pesos son byte a byte idénticos a los del repositorio original `Photoroom/prxpixel-t2i`, sin reentrenamiento ni conversión.

El modelo resuelve la tarea de text-to-image a resolución nativa de 1024 píxeles, y su interés técnico radica en la eliminación del VAE: el transformer de difusión denoisa directamente sobre el espacio RGB. Esto simplifica el pipeline y evita las pérdidas de reconstrucción típicas de los autoencoders latentes, a costa de un coste computacional mayor por paso de difusión.

El repositorio tiene un tamaño de 17,5 GB y se distribuye con el layout de pipeline de `diffusers`, por lo que puede cargarse tanto con `diffusers>=0.39` como con la librería propietaria `libreyolo` (extra `libreyolo[gen]`). Es relevante ahora porque amplía el conjunto de modelos de imagen de gran tamaño con licencia permisiva y porque el codificador de texto incluido, Qwen3-VL-Embedding-2B, es también Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión en espacio de píxeles (sin autoencoder), condicionado por codificador de texto Qwen3-VL-Embedding-2B |
| Parámetros totales | 7B (según denominación del modelo; desglose por componente no disponible) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout `diffusers`: `text_encoder/model.safetensors` y `transformer/diffusion_pytorch_model-0000X-of-00002.safetensors`) |

## Arquitectura y entrenamiento

PRXPixel es un modelo de difusión text-to-image que denoisa directamente en espacio RGB, prescindiendo del autoencoder latente habitual en modelos como Stable Diffusion o FLUX. El condicionamiento textual lo aporta un codificador Qwen3-VL-Embedding-2B (Alibaba, Apache-2.0), incluido en el repositorio. La resolución nativa de generación es 1024 píxeles. El transformer se distribuye en dos shards de safetensors.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones adicionales (decodificación especulativa, atención lineal, etc.) en la documentación proporcionada. Este repositorio es un espejo: no se ha reentrenado, convertido ni recodificado ningún peso, y se conserva la revisión upstream `bcd5e63f072257a220c5d0ba039c97657398b1c2`.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline `text-to-image`).
- Generación en espacio de píxeles a resolución nativa de 1024, sin paso de decodificación VAE.
- Condicionamiento textual mediante Qwen3-VL-Embedding-2B, lo que implica capacidad de interpretar prompts con contenido textual y posiblemente visual en el encoder (no confirmado para el pipeline de generación).
- Integración con `diffusers` (carga directa del layout del repositorio).
- Integración con la CLI y API de `libreyolo` (`LibreGen("prxpixel-7b")` y `libreyolo generate`).
- Soporte de tool calling, agentes, modo thinking, audio o visión generativa: no disponible en la información proporcionada.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: el modelo produce imágenes a 1024 px directamente en RGB, lo que permite iterar sobre conceptos visuales sin depender de un VAE y con licencia Apache-2.0 para uso comercial.
- Creación de assets para videojuegos y material editorial: la licencia permisiva y la ausencia de restricciones de pesos permiten integrar el modelo en pipelines de producción internos y redistribuir las imágenes generadas.
- Automatización de contenido para marketing: mediante la CLI `libreyolo generate prompt=... model=prxpixel-7b` se pueden generar lotes de imágenes desde scripts, útil para campañas que requieren variaciones masivas de un concepto.
- Investigación en difusión en espacio de píxeles: al no usar autoencoder, el modelo sirve como referencia para estudiar la calidad y el coste de denoisar directamente en RGB frente a enfoques latentes.
- Fine-tuning sobre dominio propio: al estar en formato `diffusers` y con licencia Apache-2.0, es posible adaptar el transformer a estilos o productos concretos sin las restricciones de licencias no comerciales.
- Integración en aplicaciones de escritorio o servicios internos: el pipeline estándar de `diffusers` permite desplegarlo con las herramientas habituales del ecosistema (no se dispone de datos de latencia ni throughput).
- Generación condicionada por prompts con texto en la imagen: el uso de un encoder Qwen3-VL sugiere capacidad para interpretar instrucciones que incluyan referencias textuales, aunque no está confirmado en la documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 7B en precisión de 16 bits requiere del orden de 14 GB solo para pesos, a lo que hay que sumar el codificador de texto Qwen3-VL-Embedding-2B y las activaciones; en espacio de píxeles a 1024 las activaciones son considerablemente mayores que en modelos latentes, por lo que se recomienda planificar con margen amplio.
- GPU recomendadas: no especificadas por el autor. Por tamaño, se sitúa en el rango de GPUs de 24 GB o superiores (RTX 3090/4090, A100, H100) para ejecución en fp16; no confirmado.
- ¿Cabe en GPU de consumo? No confirmado. Con cuantización podría reducirse el requisito, pero no se documentan tipos de cuantización soportados.
- Opciones de despliegue: `diffusers>=0.39`, librería `libreyolo` con extra `libreyolo[gen]` (API `LibreGen` y CLI `libreyolo generate`). Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Espacio de difusión | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibrePRXPixel7b | 7B | Píxeles (sin VAE) | 1024 px nativo | Apache-2.0 | Hugging Face (espejo de Photoroom/prxpixel-t2i) |
| Photoroom/prxpixel-t2i | 7B | Píxeles (sin VAE) | 1024 px nativo | Apache-2.0 | Hugging Face (upstream) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada; la única comparación fiable es con el repositorio upstream, del que este es copia idéntica.

## Limitaciones y advertencias

- Es un espejo: no incorpora mejoras, correcciones ni conversiones respecto a `Photoroom/prxpixel-t2i`; cualquier bug o limitación del upstream se hereda tal cual.
- Sesgos conocidos: no documentados en la información disponible; como todo modelo text-to-image entrenado con datos web, es probable que reproduzca sesgos de representación, pero no hay confirmación oficial.
- Riesgo de alucinación visual: no cuantificado; no hay datos de fidelidad prompt-imagen ni de evaluación cualitativa publicada en la información disponible.
- Idiomas soportados: no disponibles; el comportamiento multilingüe de los prompts depende del codificador Qwen3-VL, pero no está documentado para esta pipeline.
- Restricciones de licencia: Apache-2.0 permite uso comercial y redistribución; el codificador de texto Qwen3-VL-Embedding-2B es también Apache-2.0, pero conviene revisar `LICENSE` y `NOTICE` del repositorio para obligaciones de atribución.
- Requisitos de versión: `diffusers>=0.39` es obligatorio para cargar el layout; versiones anteriores pueden fallar.
- Coste computacional: la difusión en espacio de píxeles a 1024 px es más costosa por paso que los enfoques latentes; no se han publicado cifras de latencia ni de VRAM real, por lo que la planificación de producción debe hacerse con pruebas propias.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, y fecha de creación futura (2026-11-06) en los metadatos; conviene verificar la integridad de los ficheros con los SHA-256 publicados antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LibreYOLO/LibrePRXPixel7b
- Repositorio upstream: https://huggingface.co/Photoroom/prxpixel-t2i
- Anuncio de Photoroom: https://huggingface.co/blog/Photoroom/prx-open-source-t2i-model
- GitHub de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Documentación de modelos de LibreYOLO: https://www.libreyolo.com/docs/models
