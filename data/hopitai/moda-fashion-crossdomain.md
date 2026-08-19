# HopitAI/moda-fashion-crossdomain

## Resumen

MODA-Fashion-CrossDomain es un modelo de retrieval visual de moda desarrollado por Hopit AI, especializado en búsqueda imagen-a-imagen entre dominios distintos: fotos de estudio (shop) y fotos tomadas por consumidores en entornos reales (consumer). Se trata de un fine-tuning del encoder de visión de un ViT-B-16-SigLIP completo (visión + texto), con 203,2 millones de parámetros y una dimensión de embedding de 768. El modelo alcanza un 66,52 % de Fine Recall@1 en el benchmark LookBench, superando a FashionSigLIP en +2,68 puntos absolutos, y destaca especialmente en el subconjunto AIGen-StreetLook con una mejora de +9,37 puntos.

La relevancia de este modelo radica en que demuestra que el aprendizaje contrastivo cross-domain con un número reducido de triplets (13 557) y sin técnicas de destilación ni ensamblado es suficiente para mejorar significativamente la robustez del retrieval en moda. Su arquitectura idéntica a FashionSigLIP lo convierte en un reemplazo directo (drop-in) para sistemas existentes, y su licencia MIT permite uso comercial sin restricciones. Está disponible en formato safetensors y pytorch .bin, con un tamaño de pesos de aproximadamente 775 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B/16-SigLIP (CLIP completo: vision + texto) |
| Parametros totales | 203,2 M |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, no texto generativo) |
| Tipos de cuantizacion | no disponible (solo float32) |
| Idiomas soportados | ingles (texto); la vision es independiente del idioma |
| Licencia | MIT |
| Formato de pesos | safetensors, pytorch .bin |

## Arquitectura y entrenamiento

El modelo parte de Marqo-FashionSigLIP, un ViT-B-16-SigLIP preentrenado con WebLI, y se fine-tunea únicamente el encoder de visión (image tower). La arquitectura completa incluye tanto el encoder de visión como el de texto, pero el entrenamiento se centra exclusivamente en la torre de imagen. La resolución de entrada es de 224 × 224 píxeles y la salida es un vector L2-normalizado de 768 dimensiones en float32.

El entrenamiento utiliza aprendizaje contrastivo cross-domain: el corpus contiene pares del mismo producto fotografiado en condiciones muy diferentes (estudio limpio con fondo blanco frente a fotos espontáneas con fondos variados, ángulos y condiciones de luz cambiantes). Se emplean 13 557 triplets de entrenamiento y 714 de validación, con pérdida InfoNCE combinada con regularización L2 de deriva de pesos (weight drift). La temperatura se fija en 0,07, el peso de alineación en 0,3, y se usa el optimizador AdamW con una tasa de aprendizaje de 2e-6 y batch de 24. Se entrenan 4 épocas, siendo la época 3 la mejor con una precisión de triplets de validación del 99,6 %. Además, se aplica recorte por bounding boxes (BBox cropping) para obtener recortes a nivel de prenda. El entrenamiento se realizó en hardware Apple con aceleración MPS.

## Capacidades

- Retrieval imagen-a-imagen de moda: dado un producto fotografiado en condiciones reales, encuentra el mismo producto o similares en catálogos de tienda.
- Generación de embeddings L2-normalizados de 768 dimensiones para búsqueda por similitud coseno.
- Robustez cross-domain: entrenado específicamente para ignorar diferencias de fondo, iluminación y ángulo entre fotos de estudio y fotos de consumidor.
- Soporte de texto (CLIP completo): permite búsqueda multimodal texto-imagen, aunque el fine-tuning se centró en la torre de visión.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo de representación visual y no un modelo generativo.
- Capacidades multilingües limitadas al inglés para la parte textual; la representación visual es agnóstica al idioma.

## Casos de uso

- Búsqueda visual en tiendas online: un usuario sube una foto de una prenda vista en la calle y el sistema devuelve productos equivalentes del catálogo de la tienda. El modelo es adecuado porque fue entrenado precisamente para emparejar fotos de consumidor con fotos de estudio.
- Recomendación de prendas similares: a partir de una imagen de producto, generar sugerencias de artículos visualmente parecidos. La dimensión de embedding de 768 permite indexar grandes catálogos con FAISS o similares.
- Moderación de catálogo y detección de duplicados: comparar embeddings de productos para identificar entradas duplicadas o variantes del mismo artículo, reduciendo costes de mantenimiento de inventario.
- Estilismo virtual y asesor de moda: integrar el modelo en una aplicación que sugiera combinaciones de prendas basadas en similitud visual entre piezas del armario del usuario y productos disponibles.
- Análisis de tendencias de moda: agrupar imágenes de redes sociales o blogs por similitud visual para identificar patrones de estilo emergentes, usando los embeddings como características para clustering.
- Búsqueda inversa en marketplaces de segunda mano: permitir a vendedores encontrar precios de referencia subiendo una foto de su artículo y recuperando productos comparables de otros anuncios.

## Benchmarks y rendimiento

Resultados en LookBench (conjunto de evaluación con 2345 consultas):

| Modelo | Parametros | Dim | Fine R@1 | Coarse R@1 | nDCG@5 |
|---|---:|---:|---:|---:|---:|
| FashionSigLIP | 203M | 768 | 63,84 | 83,67 | 49,63 |
| **MODA-Fashion-CrossDomain** | **203M** | **768** | **66,52** | **85,67** | **52,46** |

Desglose por subconjunto de Fine Recall@1:

| Subset | Consultas | FashionSigLIP | MODA-CrossDomain | Delta |
|---|---:|---:|---:|---:|
| RealStudioFlat | 1011 | 66,96 | 69,63 | +2,67 |
| AIGen-Studio | 193 | 76,68 | 77,20 | +0,52 |
| RealStreetLook | 981 | 56,37 | 58,41 | +2,04 |
| AIGen-StreetLook | 160 | 74,38 | 83,75 | +9,37 |
| **Overall** | **2345** | **63,84** | **66,52** | **+2,68** |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en float32 (203 M parametros × 4 bytes ≈ 812 MB de pesos, mas activaciones y overhead). Cabe en cualquier GPU consumer moderna.
- GPUs recomendadas: NVIDIA RTX 3060 o superior, o cualquier GPU con al menos 4 GB de VRAM. Tambien funciona en Apple Silicon via MPS.
- CPU: posible inferencia en CPU para lotes pequenos, aunque con latencia mayor (no se dispone de datos de rendimiento especificos).
- Opciones de despliegue: el modelo se usa con OpenCLIP (open_clip_torch>=2.20.0) y PyTorch. No es compatible con vLLM, llama.cpp u Ollama al ser un modelo de vision, no un LLM. Para produccion, se puede servir con TorchServe, FastAPI o un servicio de embeddings dedicado.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dim | Fine R@1 | Licencia | Notas |
|---|---:|---:|---:|---|---|
| FashionSigLIP | 203M | 768 | 63,84 | MIT | Modelo base, preentrenado en WebLI |
| **MODA-Fashion-CrossDomain** | **203M** | **768** | **66,52** | **MIT** | Fine-tuning cross-domain, sin destilacion |
| MODA-Fashion-Distilled | 203M | 768 | 67,63 | MIT | Destilado, mejor calidad global |
| MODA-Fashion-Matryoshka | 203M | 64-768 | 67,42 (256d) | MIT | Dimension flexible, indice 3x menor |
| MODA-Fashion-Vision-FP16 | 203M | 768 | 67,42 | MIT | Version FP16, 186 MB, para edge/movil |

El modelo se posiciona como la receta mas simple de la familia MODA: sin destilacion ni ensamblado, con un rendimiento ligeramente inferior al de los modelos destilados pero con un proceso de entrenamiento mas directo y reproducible.

## Limitaciones y advertencias

- Dominio limitado a moda: el modelo fue entrenado exclusivamente con datos de prendas de vestir. Su rendimiento en otros dominios visuales (muebles, vehiculos, etc.) no esta garantizado y probablemente sea inferior.
- Resolucion fija de 224 × 224: las imagenes de alta resolucion deben redimensionarse, lo que puede perder detalles finos de texturas o estampados.
- Solo float32: no se proporcionan versiones cuantizadas (int8, fp16) en este repositorio, aunque existen variantes FP16 en otros modelos de la familia MODA.
- Idioma del texto limitado a ingles: la parte textual del CLIP solo soporta ingles, lo que puede limitar busquedas multimodales en otros idiomas.
- Sesgos potenciales en datos de moda: el corpus de entrenamiento puede reflejar sesgos de estilo, talla o demografia presentes en las imagenes de origen, lo que podria afectar a la equidad en aplicaciones de recomendacion.
- Sin garantia de cobertura de todos los tipos de prenda: el rendimiento en categorias poco representadas en el entrenamiento puede ser significativamente peor.
- Para uso en produccion, se recomienda validar el modelo con datos propios antes de desplegarlo, especialmente en tareas de retrieval a gran escala donde los falsos positivos pueden afectar a la experiencia de usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HopitAI/moda-fashion-crossdomain
- Repositorio GitHub del proyecto MODA: https://github.com/hopit-ai/Moda
- Dataset LookBench: https://huggingface.co/datasets/srpone/look-bench
- Articulo de cierre de la serie MODA: https://hopitai.substack.com/p/moda-series-finale
- Modelos relacionados en HuggingFace:
  - MODA-Fashion-Distilled: https://huggingface.co/HopitAI/moda-fashion-distilled
  - MODA-Fashion-Matryoshka: https://huggingface.co/HopitAI/moda-fashion-matryoshka
  - MODA-Fashion-Vision-FP16: https://huggingface.co/HopitAI/moda-fashion-vision-fp16
  - MODA-Fashion-Distilled-512d: https://huggingface.co/HopitAI/moda-fashion-distilled-512d
  - MODA-Fashion-DeepFashion2: https://huggingface.co/HopitAI/moda-fashion-deepfashion2
