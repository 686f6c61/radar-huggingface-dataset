# KaraKaraWitch/haruka-eva02-base-448-final

## Resumen

Haruka-EVA02-base-448-final es un backbone de visión (vision transformer) especializado en ilustración y anime, publicado por el usuario KaraKaraWitch en Hugging Face. No es un modelo generativo ni un clasificador de extremo a extremo con cabecera de clasificación: se distribuye como extractor de características (`num_classes=0`) sobre la arquitectura `eva02_base_patch14_448` de `timm`, afinada sobre 9,1 millones de ilustraciones deduplicadas de Danbooru con 98.726 etiquetas. El checkpoint procede de la versión final de `haruka-tagger`, del mismo autor, y se libera de forma independiente para su uso como encoder de embeddings, clustering no supervisado o base para clasificadores posteriores.

El modelo parte de `timm/eva02_base_patch14_448.mim_in22k_ft_in22k_in1k`, un ViT de 86,3 millones de parámetros con parches de 14x14, atención con RoPE 2D, activación SwiGLU y preentrenamiento MIM-CLIP sobre ImageNet. El ajuste fino sobre Danbooru fuerza al modelo a discriminar más de 40.000 estilos de artista y 32.000 personajes, incluidos tags de cola larga con tan solo 45 imágenes, lo que produce representaciones de 768 dimensiones que codifican línea, vestuario, accesorios y rasgos faciales en lugar de categorías genéricas de ImageNet.

Su relevancia actual es acotada pero concreta: cubre el hueco de encoders visuales de dominio anime con calidad de representación fina, un nicho donde los backbones estándar de ImageNet rinden peor. El autor reporta además que los embeddings separan correctamente personas, poses y objetos en fotografías reales, lo que amplía su utilidad potencial fuera del dominio de ilustración. El modelo no incluye cabecera de clasificación ni tokenizador de texto, y su licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EVA-02, vision transformer (ViT) con parches de 14x14, RoPE 2D y SwiGLU |
| Parametros totales | 86.348.544 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen fija de 448x448 px, 1.024 tokens espaciales de 32x32) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite las cuantizaciones estándar de PyTorch/timm, no documentadas por el autor) |
| Idiomas soportados | no disponible (modelo de visión, sin entrada de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con `timm`) |

## Arquitectura y entrenamiento

El modelo es un transformer de visión puro de tipo EVA-02 en configuración `base`, con parches de 14x14 sobre entradas de 448x448 píxeles, lo que genera una rejilla espacial de 32x32 (1.024 tokens) más el token de clase, con dimensión de embedding de 768. La arquitectura incorpora atención con codificación posicional rotatoria 2D (RoPE) y capas feed-forward con SwiGLU, y hereda el preentrenamiento MIM-CLIP de `timm` sobre ImageNet-22k y posterior ajuste fino supervisado en ImageNet-1k.

El ajuste fino propio se realizó sobre 9,1 millones de ilustraciones deduplicadas de Danbooru y 98.726 etiquetas: 32,8k personajes, 40,2k artistas, 7,3k copyrights y 22,3k tags generales. El autor emplea dos técnicas destacadas para manejar la distribución de cola larga: Two-Sided Instance Repeat Factor Sampling (IRFS), que replica instancias de clases raras en ambos extremos de la distribución, y Asymmetric Loss, que pondera de forma distinta los positivos y negativos en problemas multietiqueta muy desbalanceados. El entrenamiento se ejecutó durante 5 épocas en un nodo de 8x H100, con cómputo patrocinado por alpindale (dphn.ai).

El preprocesado es parte del contrato del modelo: composición alfa sobre lienzo blanco, redimensionado con preservación de aspecto mediante BICUBIC a 448x448, relleno blanco hasta el cuadrado y normalización con media y desviación estándar de ImageNet. El autor recomienda además agrupar los tokens espaciales con ventanas deslizantes 3x3 solapadas (subrejillas de 16x16 tokens) en lugar de un pooling global plano, para evitar que fondos o personajes secundarios diluyan el sujeto de interés.

## Capacidades

- Extracción de características visuales: devuelve secuencias de 1.025 tokens (token de clase más 1.024 tokens espaciales) de 768 dimensiones, o embeddings globales de 768 dimensiones tras pooling.
- Clustering no supervisado de ilustraciones: representaciones afinadas para separar personajes, estilos de artista, vestuario y accesorios.
- Clasificación multietiqueta de dominio anime: base entrenada sobre 98.726 tags de Danbooru (personajes, artistas, copyrights y tags generales).
- Recuperación visual por similitud: embeddings normalizados aptos para búsqueda por vecino más cercano.
- Pooling espacial por ventanas deslizantes: 9 vectores de 768 dimensiones procedentes de subrejillas solapadas de 16x16 tokens, útiles para localizar un sujeto concreto en escenas con varios elementos.
- Transferencia a fotografías reales: el autor reporta que los embeddings separan outfits, poses, objetos y personas en imágenes reales, aunque no aporta métricas.
- No soporta tool calling, agentes, generación de texto, razonamiento multi-step, visión-lenguaje ni audio: es exclusivamente un encoder de imagen.

## Casos de uso

- Indexación y búsqueda visual de una base de ilustraciones: extraer el vector global de 768 dimensiones de cada imagen y construir un índice aproximado (FAISS, hnswlib) para búsqueda por similitud; el ajuste sobre 40.000 estilos de artista permite recuperar imágenes por estilo con más precisión que un backbone de ImageNet.
- Etiquetado automático de Danbooru: usar el backbone como base congelada o ajustable y entrenar una cabecera lineal multietiqueta sobre los 98.726 tags; el autor ya lo empleó como etapa 1 de `haruka-tagger`.
- Deduplicación y agrupación de datasets de ilustración: aplicar clustering (k-means, HDBSCAN) sobre los embeddings globales para detectar near-duplicates y agrupar por personaje o artista antes de entrenar modelos generativos.
- Moderación y clasificación de contenido en plataformas de arte: clasificador posterior sobre los embeddings para detectar categorías de contenido, con la ventaja de que el backbone ya distingue tags generales de Danbooru.
- Localización de sujeto en escenas complejas: usar los 9 vectores de ventana solapada para identificar qué región contiene al personaje principal cuando hay fondos cargados o varios personajes, evitando la dilución del pooling global.
- Base para clasificadores de dominio fotográfico: el autor indica que las representaciones transfieren a fotos reales, de modo que puede servir como inicialización para tareas de visión general cuando no se dispone de un backbone específico.
- Extracción de características en pipelines de generación aumentada por recuperación (RAG visual): usar los embeddings como señal de recuperación para condicionar modelos de difusión con imágenes de referencia de estilo o personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (ni precisión, ni recall, ni mAP, ni comparación numérica con el backbone original de `timm`); solo afirmaciones cualitativas del autor sobre la calidad del clustering y la transferencia a fotografías.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los 86,3 millones de parámetros ocupan aproximadamente 0,35 GB, más activaciones; en FP16/BF16, unos 0,17 GB. En la práctica, con lote pequeño y 448x448, la inferencia cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: el modelo se entrenó en 8x H100, pero para inferencia no requiere hardware de datacenter. Una RTX 4090, RTX 3090, A100 o H100 ofrecen el mejor throughput; tarjetas consumer de gama media (RTX 3060 12 GB, RTX 4060 Ti) son suficientes para extracción por lotes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna con al menos 4 GB de VRAM, e incluso en CPU para volúmenes pequeños.
- Opciones de despliegue: `timm` con `torch` (vía `hf_hub:` o cargando `model.safetensors` sobre la definición de arquitectura), exportación a ONNX o TorchScript, y `torch.autocast` con bfloat16 en CUDA. No hay soporte documentado de llama.cpp, Ollama, vLLM ni TGI, que no aplican a un encoder de visión de este tipo.
- Latencia y throughput: no disponibles. El autor no publica cifras de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haruka-EVA02-base-448-final | 86,3 M | 448x448 | Anime/ilustración Danbooru (9,1 M imágenes, 98,7k tags) | no disponible | Hugging Face, vía `timm` |
| timm/eva02_base_patch14_448.mim_in22k_ft_in22k_in1k | 86,3 M | 448x448 | ImageNet (fotos, 1.000 clases) | no disponible en la información | Hugging Face, `timm` |
| CLIP ViT-B/32 o ViT-L/14 | 88 M / 428 M | 224 px | Imagen-texto general | no disponible en la información | Hugging Face, open_clip |
| DINOv2 ViT-B/14 | 86 M | 518 px | Fotos generales, autosupervisado | no disponible en la información | Hugging Face |

La comparación relevante es con el backbone original de `timm`, del cual este checkpoint es un ajuste fino: misma arquitectura y mismo número de parámetros, pero distribución de entrenamiento desplazada de ImageNet a Danbooru. Frente a CLIP o DINOv2, la diferencia es de dominio y de objetivo: Haruka no está alineado con texto y no está pensado para tareas de visión general, sino para representaciones finas de ilustración.

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre permisos de uso comercial, redistribución o modificación. Es un riesgo directo para producción; conviene contactar con el autor antes de integrarlo.
- Sesgo de dominio: el ajuste fino se hizo exclusivamente sobre Danbooru, con la distribución, estética y sesgos de esa fuente (predominio de ilustración japonesa, convenciones de personajes y estilos concretos).
- Riesgo de sobreajuste a etiquetas de Danbooru: las representaciones están optimizadas para discriminar tags de esa taxonomía; en dominios muy distintos (medicina, satélite, documentos) el rendimiento no está caracterizado.
- Sin benchmarks: no hay métricas publicadas de precisión, recall ni comparación cuantitativa con el backbone original, lo que impide estimar la ganancia real.
- Sin cabecera de clasificación: no es un clasificador listo para usar; requiere entrenar una cabecera o aplicar clustering.
- Preprocesado obligatorio: desviarse del pipeline documentado (composición alfa sobre blanco, BICUBIC, relleno blanco, normalización ImageNet) degrada las representaciones.
- Pooling global plano puede diluir el sujeto: el propio autor recomienda ventanas solapadas cuando hay varios elementos en la escena.
- Transferencia a fotos reales no cuantificada: la afirmación del autor sobre fotografías reales es cualitativa y sin métricas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación externa ni issues reportados.
- Idiomas: al ser un modelo de visión sin texto, la fila de idiomas no aplica; no hay soporte multilingüe que evaluar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KaraKaraWitch/haruka-eva02-base-448-final
- Variante referenciada en la model card: https://huggingface.co/KaraKaraWitch/haruka-eva02-base-448
- Perfil del autor: https://huggingface.co/KaraKaraWitch
- Modelo base en `timm`: https://huggingface.co/timm/eva02_base_patch14_448.mim_in22k_ft_in22k_in1k
- Patrocinador del cómputo (dphn.ai): https://dphn.ai/
- Perfil del patrocinador: https://huggingface.co/alpindale
- Ficha de Haruka.2 en SeaArt (contexto del ecosistema Haruka): https://www.seaart.ai/models/detail/df2841ec62f947f9888b724c2aa93482
