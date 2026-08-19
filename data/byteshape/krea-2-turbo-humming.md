# byteshape/Krea-2-Turbo-Humming

## Resumen

Krea-2-Turbo Humming es una versión cuantizada del modelo de generación de imágenes Krea-2-Turbo, desarrollado por ByteShape. Krea-2-Turbo es un modelo de difusión basado en transformador (DiT) de 12 800 millones de parámetros, creado por Krea AI, que ha sido destilado en pasos para generar imágenes en solo 8 pasos sin guía clasificadora. La versión Humming utiliza la técnica de cuantización ShapeLearn de ByteShape, que aprende el tipo de datos óptimo para cada tensor, y está optimizada para el backend vLLM-Omni con kernels Humming, logrando una generación de imagen 1024×1024 en aproximadamente 4 segundos en una RTX 5090.

Este repositorio ofrece cinco tamaños cuantizados, desde 8,92 bits por peso (14,30 GB de transformador) hasta 3,83 bits por peso (6,14 GB), todos incluidos en un único paquete que ya contiene el codificador de texto, VAE, scheduler y tokenizador. La motivación principal es reducir el consumo de VRAM manteniendo una calidad visual alta, lo que permite ejecutar el modelo en GPUs de consumo con menos memoria. Es una opción relevante para desarrolladores que necesitan desplegar generación de imágenes de alta calidad en entornos con recursos limitados, especialmente en servidores Linux con NVIDIA.

La cuantización no acelera la inferencia (la difusión no está limitada por ancho de banda de memoria), pero libera VRAM. El backend Humming sí ofrece una mejora de velocidad de aproximadamente 1,6× por paso frente a la ruta GGUF del mismo modelo. Se considera una versión experimental y requiere una pila de software muy específica (vLLM 0.26.0, vLLM-Omni 0.26.0 y el plugin vllm-omni-humming 0.3.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) destilado en pasos |
| Parametros totales | 12 800 millones (modelo base Krea-2-Turbo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusion, no autoregresivo) |
| Tipos de cuantizacion | 8,92 / 7,26 / 5,06 / 4,27 / 3,83 bits por peso (ShapeLearn) |
| Idiomas soportados | No disponible (el prompt se procesa mediante un codificador de texto, probablemente ingles, pero no se especifica) |
| Licencia | Krea-2 Community License (otra) |
| Formato de pesos | safetensors (tambien se publican versiones GGUF en otro repositorio) |

## Arquitectura y entrenamiento

Krea-2-Turbo es un modelo de difusión basado en transformador (DiT) de 12 800 millones de parámetros, entrenado desde cero por Krea AI para exploración creativa y estilística. El modelo ha sido destilado en pasos (step-distillation) para generar imágenes en solo 8 pasos de muestreo sin necesidad de clasificador-free guidance, lo que reduce drásticamente el coste computacional en inferencia. El repositorio oficial de Krea 2 indica que el modelo está diseñado para generación de imágenes de alta resolución (hasta 2K) y se centra en la diversidad estilística.

La versión Humming de ByteShape aplica una cuantización post-entrenamiento mediante la técnica ShapeLearn, que determina automáticamente el tipo de datos óptimo (por ejemplo, int8, int4, fp8) para cada tensor individual, minimizando la pérdida de calidad incluso a bit-lengths muy bajos. El paquete incluye el "shell" del pipeline (codificador de texto, VAE, scheduler y tokenizador) junto con cinco transformadores cuantizados de diferentes tamaños. No se han publicado detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso de destilación en la información disponible.

## Capacidades

- Generacion de imagenes fotorrealistas y artisticas a partir de prompts de texto, con resoluciones de 1024×1024 y superiores (hasta 2K).
- Generacion en 8 pasos sin clasificador-free guidance, lo que reduce el tiempo de inferencia.
- Cinco niveles de cuantizacion que permiten ajustar el equilibrio entre calidad y uso de VRAM.
- Compatible con el backend vLLM-Omni mediante kernels Humming optimizados para NVIDIA (SM75+).
- Publicacion adicional en formato GGUF para uso con ComfyUI y otras herramientas que soporten este formato.
- El paquete incluye todos los componentes (text encoder, VAE, scheduler, tokenizador), sin descargas adicionales.
- No soporta tool calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de texto a imagen.

## Casos de uso

- Generacion de imagenes para prototipado de diseno: un equipo de producto puede generar variaciones rapidas de conceptos visuales (interfaces, packaging, logotipos) en 4 segundos por imagen, acelerando la exploracion de ideas antes de pasar a herramientas profesionales.
- Ilustracion y arte conceptual: artistas pueden usar el modelo para crear bocetos iniciales o fondos de alta calidad, aprovechando la capacidad de generar imagenes de 2K en 8 pasos, y luego refinar el resultado en software de edicion.
- Produccion de contenido para marketing: generar imagenes personalizadas para campanas publicitarias o redes sociales, con la posibilidad de ajustar el nivel de cuantizacion para ejecutar en GPUs de consumo (por ejemplo, una RTX 4060 con 8 GB de VRAM usando el tamaño de 3,83 bpw).
- Entornos de desarrollo con recursos limitados: al poder elegir entre cinco tamaños, un desarrollador puede desplegar el modelo en una GPU de 16 GB (por ejemplo, RTX 4080) usando la variante de 5,06 bpw, manteniendo buena calidad sin necesidad de hardware profesional.
- Integracion en pipelines de generacion masiva: gracias a la compatibilidad con vLLM-Omni, el modelo puede servir como endpoint HTTP para generar imagenes bajo demanda, ideal para aplicaciones web o servicios de API interna.
- Comparacion y control de calidad visual: el explorador interactivo de ByteShape permite comparar cualquier par de variantes cuantizadas sobre 24 prompts curados, lo que resulta util para validar la degradacion visual antes de elegir un tamaño para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como FID, CLIP score o evaluaciones humanas) en la informacion disponible. La unica comparacion numerica proporcionada es la velocidad de inferencia entre el backend Humming y la ruta GGUF, medida en una RTX 5090 a 1024×1024 con 8 pasos:

| Backend | Tiempo por paso | Tiempo para 8 pasos | Fin a fin |
|---|---|---|---|
| vLLM-Omni (Humming) | ~0,41 s | ~3,3 s | ~4,0 s |
| GGUF (misma receta ByteShape) | ~0,67 s | ~5,4 s | ~5,9 s |

La velocidad es casi plana entre los distintos niveles de cuantizacion; la eleccion del tamaño debe basarse en la VRAM disponible, no en la velocidad. Se recomienda consultar el explorador de comparacion visual de ByteShape para evaluar la calidad de cada variante.

## Requisitos de hardware

- VRAM estimada para inferencia: el transformador mas pequeño (3,83 bpw) ocupa 6,14 GB en disco y el paquete completo (transformador + shell) 15,5 GB; el mas grande (8,92 bpw) ocupa 14,30 GB de transformador y 23,7 GB en total. La VRAM necesaria sera similar al tamaño del paquete mas un overhead de ejecucion, por lo que se recomienda una GPU con al menos 16 GB para el tamaño mas pequeño y 24 GB para el mas grande.
- GPUs recomendadas: NVIDIA de las series 30, 40 y 50 (SM75 o superior), incluidas las RTX Pro 6000. Se requiere Linux; no hay soporte para Windows o macOS.
- Si cabe en GPU de consumo: si, la variante de 3,83 bpw puede ejecutarse en una RTX 4060 Ti de 16 GB, y la de 5,06 bpw en una RTX 4080 de 16 GB. La variante de 8,92 bpw requiere una GPU de 24 GB como la RTX 4090.
- Opciones de despliegue: vLLM-Omni con el plugin vllm-omni-humming para servir como API; tambien se publican versiones GGUF para ComfyUI y otras herramientas compatibles con GGUF.
- Latencia y throughput: ~4 segundos por imagen 1024×1024 en RTX 5090 con el backend Humming; ~5,9 segundos con GGUF. El throughput depende del numero de peticiones concurrentes y de la GPU utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de inferencia | Velocidad (1024×1024, RTX 5090) | Formato | Licencia |
|---|---|---|---|---|---|
| Krea-2-Turbo (base, BF16) | 12,8B | 8 | No disponible | safetensors | Krea-2 Community |
| Krea-2-Turbo Humming (este repo) | 12,8B (cuantizado) | 8 | ~4,0 s | safetensors (Humming) | Krea-2 Community |
| Krea-2-Turbo GGUF (byteshape) | 12,8B (cuantizado) | 8 | ~5,9 s | GGUF | Krea-2 Community |

No se dispone de comparativas con otros modelos de difusion populares (SDXL, Flux, etc.) en la informacion proporcionada. La comparacion principal se establece entre el modelo base sin cuantizar y las dos rutas cuantizadas de ByteShape. La version Humming ofrece mayor velocidad que la GGUF al mismo nivel de cuantizacion, pero requiere la pila vLLM-Omni especifica.

## Limitaciones y advertencias

- Estado experimental: la integracion con vLLM-Omni y Humming se ha probado solo con versiones muy concretas (vLLM 0.26.0, vLLM-Omni 0.26.0, vllm-omni-humming 0.3.0) y en hardware NVIDIA con Linux. Cualquier cambio de version puede romper el flujo.
- Solo Linux y NVIDIA: no hay soporte para Windows, macOS ni GPUs AMD o Intel.
- La cuantizacion puede introducir degradacion visual, especialmente en las variantes de menor bit-length (3,83 y 4,27 bpw). Se recomienda evaluar visualmente cada tamaño antes de elegirlo para produccion.
- La licencia Krea-2 Community License puede imponer restricciones de uso comercial; es necesario revisar los terminos en el enlace proporcionado antes de desplegar el modelo en un producto.
- No se han publicado estudios de sesgos o alucinaciones visuales. Como cualquier modelo de generacion de imagenes, puede producir contenido inapropiado, inexacto o estereotipado, especialmente con prompts ambiguos.
- El repositorio no incluye informacion sobre los idiomas soportados para los prompts; el codificador de texto puede tener un rendimiento desigual en idiomas distintos del ingles.
- No se proporcionan benchmarks de calidad (FID, CLIP score, evaluacion humana), por lo que la afirmacion de "alta calidad" se basa en comparaciones visuales subjetivas publicadas por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/byteshape/Krea-2-Turbo-Humming
- Version GGUF del mismo modelo: https://huggingface.co/byteshape/Krea-2-Turbo-GGUF
- Blog de ByteShape sobre Krea-2-Turbo: https://byteshape.com/blogs/Krea-2-Turbo/
- Explorador de comparacion visual: https://byteshape.com/blogs/Krea-2-Turbo/comparison/
- Repositorio oficial de Krea 2 (inferencia): https://github.com/krea-ai/krea-2
- Proyecto vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Licencia Krea-2 Community: https://www.krea.ai/krea-2-licensing
