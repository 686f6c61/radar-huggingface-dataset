# ibyteohdear/MiniMax-H3-Pruned

## Resumen

MiniMax-H3-Pruned es una variante podada del modelo de generación de vídeo y audio MiniMax-H3 de MiniMaxAI, publicada por el usuario ibyteohdear en Hugging Face. Se distribuye en formato diffusers y su aportación principal es la reducción de las proyecciones de entrada AdaLN de los bloques DiT a su rango alcanzable, eliminando 13.030 millones de parámetros (el 39,3 % del checkpoint original) sin cambios visibles en la salida. El resultado son dos particiones DiT de 40,24 GB cada una frente a los 66,28 GB originales, es decir, 52 GB menos en total.

El modelo conserva la arquitectura multimodal original de MiniMax-H3: generación de vídeo a partir de texto, imagen o referencias, con audio sincronizado, y soporte de LoRAs. La poda se apoya en un argumento matemático: las 51 proyecciones AdaLN leen todas el mismo vector `silu(time_embedder(t))`, que depende solo del paso de tiempo escalar y por tanto vive en una curva unidimensional dentro de R^2688. Un subespacio afín de dimensión 8 cubre esa curva con un error RMS relativo de 1,45e-5, unas 250 veces por debajo de un paso de redondeo en bfloat16.

La relevancia de esta ficha es doble: por un lado, demuestra una técnica de compresión reproducible para modelos de difusión de gran tamaño; por otro, incluye una validación rigurosa con grupo de control que compara la divergencia introducida por la poda con la que produce cambiar el kernel de atención (FlashAttention-3 frente a backend nativo). Es un caso poco habitual de model card centrada en la fidelidad numérica más que en benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) multimodal con proyecciones AdaLN podadas a rango 8; condicionador Qwen3-VL truncado |
| Parametros totales | 20.111.462.920 (por partición DiT, según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; se menciona una variante cuantizada del condicionador como trabajo futuro) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (other) |
| Formato de pesos | safetensors (formato diffusers, carga vía `ModularPipeline`) |

## Arquitectura y entrenamiento

MiniMax-H3 es un modelo de difusión basado en transformer (DiT) para generación conjunta de vídeo y audio, con condicionamiento multimodal. Cada uno de los 50 bloques del DiT incorpora una proyección `adaln_proj.linear` de tipo `Linear(2688 → 96768)`, y `norm_out.linear` añade una más. En total, 51 proyecciones que suman 13.030 millones de parámetros, el 39,3 % del checkpoint. Todas ellas reciben el mismo vector `silu(time_embedder(t))`, función exclusiva del paso de tiempo escalar, de modo que su imagen es una curva unidimensional.

La poda sustituye esa entrada de 2688 dimensiones por una de 8: se calcula un subespacio afín que aproxima la curva (`x = mean + c @ basis`), se pliega cada proyección como `(W @ basis.T) @ c + (b + W @ mean)` y se reemplaza el MLP de tiempo por una tabla de 1025 entradas de coordenadas `c(t)` con interpolación lineal. El condicionador también se trunca: MiniMax-H3 condiciona sobre el estado oculto no normalizado tras la capa 50 del decodificador de Qwen3-VL, por lo que las capas 51-63 y la cabeza del modelo de lenguaje se eliminan; los embeddings resultan bit a bit idénticos a los del condicionador original. No se duplican los dos VAE, los dos schedulers, el tokenizer ni el processor: `modular_model_index.json` los referencia al repositorio base. No se aportan datos sobre el entrenamiento original (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video).
- Generación conjunta a partir de imagen y texto (image-text-to-video).
- Generación de vídeo con audio a partir de texto (text-to-audio-video).
- Generación de vídeo con audio a partir de imagen (image-to-audio-video).
- Generación de vídeo con audio a partir de referencias (reference-to-audio-video).
- Carga de LoRAs publicados para H3: los entrenados sobre el modelo podado cargan de forma nativa y los entrenados sobre el modelo original se proyectan.
- Condicionamiento multimodal mediante un codificador Qwen3-VL truncado (capas 0-50), con presentaciones solo-texto y con visión.
- No se documentan en la información disponible capacidades de tool calling, agentes ni modo de razonamiento explícito.

## Casos de uso

- Generación de clips publicitarios con audio: el modelo produce vídeo y pista de audio en una sola pasada, lo que permite iterar sobre un mismo prompt de texto sin encadenar modelos separados de vídeo y de sonido.
- Prototipado de vídeo a partir de storyboards: partiendo de una imagen fija (image-to-video) se generan secuencias animadas para validar una idea antes de producir el material definitivo.
- Doblaje y sonorización automática de material existente: la variante image-to-audio-video permite añadir audio coherente a una imagen o fotograma de referencia.
- Estilización con LoRAs: al mantener compatibilidad con los LoRAs publicados de H3, se puede adaptar el modelo a un estilo visual concreto (por ejemplo, animación o estética de producto) sin reentrenar el DiT completo.
- Despliegue en infraestructura con VRAM limitada: la reducción de 52 GB en las particiones DiT y de 14,23 GB en el condicionador facilita alojar el modelo en nodos con menos memoria que los necesarios para el checkpoint original, manteniéndose en bfloat16.
- Investigación sobre compresión de modelos de difusión: el repositorio sirve como referencia reproducible para estudiar el plegado de proyecciones AdaLN y la evaluación de fidelidad numérica con grupos de control.
- Generación de material audiovisual a partir de referencias (reference-to-audio-video): útil para mantener consistencia de personaje o producto entre tomas usando una referencia visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FVD, CLIP score, MMLU u otros) en la información disponible. La model card aporta métricas de fidelidad numérica frente al checkpoint original:

| Metrica | transformer | transformer_ref |
|---|---|---|
| Residuo del subespacio de rango 8 (sin redondeo de almacenamiento) | 1,51e-5 | 1,29e-5 |
| Podado frente a float64 exacto (peor de 51 modulos) | 1,715e-3 | 1,715e-3 |
| Original frente a float64 exacto (peor de 51 modulos) | 1,751e-3 | 1,758e-3 |
| Modulos en que el podado esta mas cerca del exacto | 51 / 51 | 51 / 51 |
| Podado frente a original (peor de 51 modulos) | 1,35e-3 | 1,41e-3 |

Comparación de latentes finales en una trayectoria t2va de 10 pasos (960x544, 124 fotogramas, semilla 42):

| Latentes de video | Coseno | L2 relativa | Max abs |
|---|---|---|---|
| Original (FA3) vs original (nativo), control con los mismos pesos | 0,99248 | 0,1227 | 7,66 |
| Original (FA3) vs podado (FA3) | 0,99128 | 0,1321 | 8,59 |
| Original (nativo) vs podado (FA3) | 0,99274 | 0,1205 | 7,71 |

| Latentes de audio | Coseno | L2 relativa | Max abs |
|---|---|---|---|
| Original (FA3) vs original (nativo), control | 0,99964 | 0,0292 | 0,255 |
| Original (FA3) vs podado (FA3) | 0,99911 | 0,0437 | 0,358 |
| Original (nativo) vs podado (FA3) | 0,99972 | 0,0236 | 0,157 |

La desviación típica de los latentes de vídeo es 2,146331 en el original y 2,146338 en el podado.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 133 GB en total; las dos particiones DiT suman 80,48 GB y el condicionador 52,48 GB, ambos en bfloat16. La inferencia requiere cargar al menos una partición DiT más el condicionador, los VAE y los schedulers, por lo que se necesita un nodo multi-GPU o GPU con memoria unificada de gran capacidad.
- GPU recomendadas: no se especifican en la información disponible. Por volumen de pesos, el modelo no cabe en una única GPU de consumo; encaja en configuraciones de varios aceleradores tipo A100/H100 con agregación de memoria o en pipelines con descarga por etapas.
- GPU de consumo: no cabe en RTX 4090 ni en tarjetas de 24 GB en bfloat16 sin cuantización adicional, que no se documenta para las particiones DiT.
- Opciones de despliegue: `diffusers` mediante `ModularPipeline` y `ComponentsManager`; la model card muestra un ejemplo con `ModularPipeline.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La validación se hizo con 10 pasos de muestreo a 960x544 y 124 fotogramas, sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros (por particion DiT) | Tamano de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Pruned (esta ficha) | 20,11 B | 40,24 GB por particion; 52,48 GB condicionador | no disponible | minimax-h3-community-license-agreement | Hugging Face, formato diffusers |
| MiniMaxAI/MiniMax-H3 (original) | 33,14 B | 66,28 GB por particion; 66,71 GB condicionador | no disponible | minimax-h3-community-license-agreement | Hugging Face |
| Otros modelos de video-audio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos alternativos de generación conjunta de vídeo y audio con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La poda no es bit a bit: redondear los pesos plegados a bfloat16 produce bits distintos de los del checkpoint original. La model card la describe como efectivamente sin pérdida en bfloat16, pero no como una recodificación exacta.
- La validación se limita a una única trayectoria t2va de 10 pasos con una semilla fija; no se aportan evaluaciones sobre otras resoluciones, duraciones, prompts ni pasos de muestreo.
- No se han publicado métricas de calidad perceptual (FVD, CLIP, sincronización audio-vídeo) ni evaluaciones humanas.
- Los LoRAs entrenados sobre el modelo original se cargan proyectados, no de forma nativa; no se documenta la magnitud del error introducido por esa proyección.
- El condicionador se mantiene en bfloat16 y su variante cuantizada está pendiente de medición de calidad, por lo que no hay una opción de menor precisión validada.
- La licencia es la MiniMax-H3 Community License Agreement, distinta de las licencias open source habituales; hay que revisar sus términos antes de cualquier uso comercial.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni cobertura de idiomas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no es el desarrollador original del modelo; conviene verificar la integridad de los pesos antes de usarlo en producción.
- El tamaño total del repositorio (133 GB) y la dependencia de componentes externos del repositorio base complican el despliegue y la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ibyteohdear/MiniMax-H3-Pruned
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
