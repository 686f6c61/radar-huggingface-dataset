# saymynameX1/Krea2_Turbo_FP8_Krea_2_TURBO_checkpoint

## Resumen

Krea2 Turbo_FP8 es un checkpoint comunitario que ofrece los pesos del modelo de difusión Krea 2 OSS (Turbo) de KREA.ai en una cuantización optimizada FP8 (float8_e4m3fn) exclusivamente para los pesos. El repositorio, publicado por el usuario saymynameX1, reduce el tamaño del modelo original de 24,76 GiB en BF16 a 12,01 GiB, lo que permite ejecutarlo en GPUs de consumo con 16 GB o 24 GB de VRAM sin una pérdida apreciable de calidad de salida. Se trata de un modelo de generación de imágenes texto-imagen, diseñado para tareas creativas, comerciales y de investigación, y su distribución se realiza a través de la librería diffusers.

La cuantización aplicada no es global ni agresiva, sino selectiva: solo las matrices de pesos 2D con más de 1024 elementos se convierten a FP8, mientras que los vectores 1D, los sesgos, las escalas de normalización y las capas de modulación sensibles (como `LastLayer.modulation.lin`) se mantienen en su precisión nativa (float32 o bfloat16). Esta estrategia evita errores de promoción numérica típicos de PyTorch y conserva la fidelidad de la salida original. El repositorio es una utilidad comunitaria que no reclama propiedad sobre el modelo original, y su uso está sujeto al acuerdo de licencia de KREA 2.

Aunque el modelo está etiquetado como "no apto para todos los públicos" (contiene contenido explícito en los ejemplos), su propósito declarado es ofrecer una alternativa accesible en hardware de consumo para la generación de imágenes de alta calidad. No se dispone de información pública sobre la arquitectura interna, los parámetros totales o los datos de entrenamiento del modelo original, más allá de que se trata de un transformer de difusión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | FP8 (float8_e4m3fn) weight-only selectiva |
| Idiomas soportados | no disponible (presumiblemente inglés, sin confirmar) |
| Licencia | KREA 2 License Agreement (no se detallan términos) |
| Formato de pesos | no disponible (repositorio diffusers, probablemente safetensors) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo Krea 2 OSS Turbo original. Se sabe que es un modelo de difusión para generación de imágenes a partir de texto, y que la versión aquí presentada es una cuantización FP8 de los pesos del transformer. La estrategia de cuantización es selectiva: se convierten a `torch.float8_e4m3fn` únicamente las matrices de pesos 2D con más de 1024 elementos (266 tensores), mientras que los vectores 1D, sesgos, escalas y capas de modulación se conservan en alta precisión (166 tensores). Esta aproximación busca minimizar la degradación de calidad y evitar errores de promoción numérica. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF, DPO, etc.) del modelo original.

## Capacidades

- Generación de imágenes fotorrealistas a partir de descripciones textuales en lenguaje natural.
- Soporte para estilos variados, incluyendo fotografía amateur, retratos, criaturas, animales estilizados, fantasía, surrealismo y mundos acuáticos, según los ejemplos mostrados en la comunidad.
- Integración con la librería diffusers, lo que permite su uso en pipelines estándar de generación de imágenes.
- Optimización para hardware de consumo: el tamaño reducido (12,01 GiB) permite su ejecución en GPUs con 16 GB y 24 GB de VRAM.
- No se han documentado capacidades adicionales como tool calling, agentes o razonamiento multi-paso, al tratarse de un modelo de difusión puro.

## Casos de uso

- Creación de arte conceptual y exploración de diseño: el modelo puede generar imágenes de alta calidad a partir de prompts descriptivos, útil para diseñadores y artistas que necesitan iterar rápidamente sobre ideas visuales.
- Generación de imágenes para marketing y publicidad: su capacidad para producir resultados fotorrealistas con estilos específicos (por ejemplo, estética de cámara antigua) permite crear material visual para campañas sin necesidad de sesiones fotográficas.
- Prototipado visual en desarrollo de productos: los equipos pueden usar el modelo para visualizar conceptos de productos, envases o escenarios antes de invertir en producción.
- Investigación en generación de imágenes: al ser un checkpoint accesible en hardware de consumo, investigadores y estudiantes pueden experimentar con técnicas de difusión y cuantización sin requerir infraestructura de alto coste.
- Generación de contenido para entretenimiento y medios: ilustraciones para juegos, cómics o storyboards, aprovechando la versatilidad estilística del modelo.
- Automatización de flujos creativos en entornos de producción: al integrarse con diffusers, puede incorporarse en pipelines de generación masiva de imágenes para catálogos, bancos de imágenes o contenido generado por usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas comparativas como FID, CLIP score o evaluaciones de calidad frente a otros modelos de difusión.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 12,01 GiB en FP8, por lo que se recomienda al menos 16 GB de VRAM para inferencia con margen para el pipeline de diffusers.
- GPUs compatibles: tarjetas de consumo con 16 GB (por ejemplo, RTX 4080, RTX 4090) y 24 GB (RTX 3090, RTX 4090) son adecuadas. También puede ejecutarse en GPUs profesionales como A100 o H100, aunque no es necesario.
- Opciones de despliegue: al ser un checkpoint de diffusers, puede usarse con la librería `diffusers` de Hugging Face, así como con herramientas que la integren (por ejemplo, ComfyUI, Automatic1111 si se convierte a formato adecuado).
- Latencia y throughput: no se han proporcionado datos específicos. Se espera que la inferencia sea más rápida que con los pesos BF16 originales debido al menor tamaño y a la aceleración de operaciones FP8 en GPUs compatibles (Ampere o posteriores).

## Comparativa con modelos similares

| Modelo | Tamaño | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|
| Krea2 Turbo_FP8 (este repo) | 12,01 GiB | FP8 selectiva | KREA 2 License Agreement | Hugging Face |
| Krea 2 OSS (Turbo) original | 24,76 GiB | BF16 | KREA 2 License Agreement | Repos oficiales de KREA.ai |
| Krea-2-Turbo-FP8-NVFP4 (Abiray) | no disponible | NVFP4 | no disponible | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas versiones. La principal diferencia es el tamaño y la estrategia de cuantización, siendo la versión FP8 selectiva la que preserva más capas en alta precisión.

## Limitaciones y advertencias

- Contenido explícito: el modelo está etiquetado como "not-for-all-audiences" y los ejemplos mostrados incluyen desnudos explícitos. No es adecuado para entornos profesionales sin filtros de contenido.
- Licencia restrictiva: el uso está sujeto al KREA 2 License Agreement, cuyos términos completos no se detallan en el repositorio. Es necesario revisar la licencia oficial antes de cualquier uso comercial o de investigación.
- Sesgos y alucinaciones visuales: como todo modelo de difusión, puede generar artefactos, distorsiones o representaciones sesgadas de ciertos grupos o escenarios, especialmente con prompts ambiguos.
- Falta de documentación técnica: no se han publicado detalles sobre la arquitectura, el entrenamiento o los benchmarks, lo que dificulta la evaluación rigurosa de su rendimiento.
- Dependencia de la comunidad: al ser un checkpoint comunitario, no hay garantía de mantenimiento o soporte a largo plazo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/saymynameX1/Krea2_Turbo_FP8_Krea_2_TURBO_checkpoint
- Página en Civitai: https://civitai.com/models/2723583/krea2-turbofp8
- Checkpoint oficial de Comfy-Org (Krea 2 Turbo): https://civitai.com/models/2726029/krea-2-turbo-official-comfy-org-checkpoints-krea2
- Variante FP8 de szwagros: https://huggingface.co/szwagros/Krea-2-Turbo-fp8
- Variante NVFP4 de Abiray: https://huggingface.co/Abiray/Krea-2-Turbo-FP8-NVFP4
