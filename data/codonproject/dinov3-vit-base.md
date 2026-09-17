# CodonProject/DINOv3-ViT-Base

# DINOv3 ViT-Base, pesos convertidos a formato codon (CodonProject)

## Resumen

Este repositorio publica los pesos de `facebook/dinov3-vitb16-pretrain-lvd1689m` convertidos al formato de la implementación `codon` de DINOv3. No es un modelo nuevo: es un remapeo de claves más una conversión de precisión de fp32 a float16, verificado numéricamente contra la implementación de referencia de `transformers`. El modelo subyacente es un ViT-B/16 de 85.660.416 parámetros (85,7 M), con 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y parches de 16×16 píxeles.

Se trata de un encoder visual puro orientado a extracción de características (`image-feature-extraction`), no de un modelo generativo. Su salida son embeddings: un token CLS de 768 dimensiones, 4 tokens de registro y un token por parche, lo que permite usarlo como extractor congelado en tareas de clasificación, segmentación, correspondencia densa o indexado de imágenes.

La relevancia de esta conversión es práctica: elimina el trabajo de remapeo manual entre el layout de Meta/`transformers` y el layout de `codon` (`blocks`, `*_proj`, `gamma1`/`gamma2`, `storage_tokens`) y reduce a la mitad el tamaño del checkpoint (163,4 MB frente a los ~343 MB en fp32). Está pensada para cargarse con una sola llamada (`DINOv3ViT_Base.from_remote()`) y para ejecutar inferencia en fp16 en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT (transformer pre-norm, atención bidireccional, RoPE axial 2D) |
| Parametros totales | 85.660.416 (85,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de visión. La secuencia depende de la rejilla de parches; a 224×224 son 196 tokens de parche + 1 CLS + 4 de registro = 201 tokens |
| Tipos de cuantizacion | fp16 (dtype con el que se publican los pesos); upcast a fp32 en carga; no se documentan GGUF, INT8 ni INT4 |
| Idiomas soportados | no aplica (modelo de visión, no procesa texto) |
| Licencia | dinov3-license (campo `other`), https://ai.meta.com/resources/models-and-libraries/dinov3-license |
| Formato de pesos | safetensors (`model.safetensors`, 163,4 MB, 211 tensores, todos F16) + `config.json` + `preprocessor_config.json` |
| Tamano oculto | 768 |
| Capas / cabezas de atencion | 12 / 12 |
| Tamano oculto del MLP | 3072 (ratio 4, activacion GELU) |
| Tamano de parche / resolucion por defecto | 16 / 224×224 |
| Tokens de registro | 4 (`storage_tokens` en el layout codon) |
| RoPE theta | 100.0 |
| Layer-norm eps | 1e-5 |
| Inicializacion de layer scale | 1.0 |
| Sesgos de atencion | q, v y o sí; k no |
| Drop path | 0.0 (inferencia) |
| Dtype de los pesos | float16 |
| Modelo base | facebook/dinov3-vitb16-pretrain-lvd1689m |
| Libreria | codon (`codon.impl.DINOv3ViT`) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de DINOv3 ViT-B/16: un transformer con normalización previa (pre-norm), atención bidireccional y RoPE axial 2D sobre la rejilla de parches, sin embeddings posicionales aprendidos. Incluye 4 tokens de registro, usados para absorber información global y evitar artefactos en los mapas de atención de parches. La implementación `codon` reconstruye dinámicamente la tabla de frecuencias rotatorias a partir de `rope_theta` y de la resolución de entrada (buffer no persistente), lo que permite ejecutar los mismos pesos a cualquier tamaño de imagen sin interpolación posicional. Los pesos originales de `facebook/dinov3-vitb16-pretrain-lvd1689m` provienen del entrenamiento a gran escala de Meta (dataset LVD-1689M); este repositorio no aporta entrenamiento adicional, solo conversión de formato y de precisión.

La conversión aplica un remapeo de claves documentado: `embeddings.patch_embeddings.*` → `patch_embed.*`, `embeddings.cls_token` → `cls_token`, `embeddings.register_tokens` → `storage_tokens`, `layer.{i}.attention.{q,k,v,o}_proj` → `blocks.{i}.{q,k,v,o}_proj`, `layer.{i}.layer_scale1/2.lambda1` → `blocks.{i}.gamma1/gamma2`, y se descarta `rope_embeddings.inv_freq` porque se recalcula en tiempo de ejecución. Se añade además un `mask_token` inicializado a cero como marcador de posición de la arquitectura MAE de esta implementación, ausente del checkpoint original; `load_pretrained(strict=True)` no lo requiere. La verificación reportada indica que la carga con `strict=True` pasa y que los pesos remapeados en fp32 son bit-exactos frente a `DINOv3ViTModel` de `transformers` a 224×224 y a 196×252 (`max|diff| = 0.000e+00`), además de comparaciones por bloque. No se documenta en la información disponible ningún resultado de la versión fp16 frente a la referencia fp32 más allá de la afirmación de que la semántica numérica se mantiene "hasta la cuantización fp16".

## Capacidades

- Extracción de características visuales: devuelve `x_norm_clstoken` [N, 768], `x_storage_tokens` [N, 4, 768], `x_norm_patchtokens` [N, H·W, 768], `x_norm_alltokens` y `x_prenorm`.
- `forward(x)` devuelve directamente el token CLS con forma [N, 768] para clasificación o recuperación.
- Características densas a resolución arbitraria sin interpolación posicional: por ejemplo, a 256×192 produce una rejilla de 16×12 parches (192 tokens).
- Acceso a capas intermedias mediante `get_intermediate_layers(n=[...])`, con opción `reshape=True` para obtener mapas de características [N, C, H, W].
- Inferencia en fp16 nativa o con upcast a fp32 al cargar, sin cambiar el checkpoint.
- No genera texto: no dispone de decodificador, ni de tool calling, ni de function calling, ni de modo de razonamiento.
- No es un modelo de agentes ni soporta razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No incorpora capacidades generativas de imagen, audio o vídeo; es exclusivamente un encoder de imagen.

## Casos de uso

- Clasificación con pocas etiquetas (few-shot o kNN): congelar el encoder y entrenar una regresión logística o calcular vecinos más cercanos sobre `x_norm_clstoken`. Al ser un modelo de 85,7 M de parámetros, el bucle completo cabe en una GPU de gama media y el coste de extraer embeddings una sola vez es bajo.
- Segmentación semántica densa: usar `x_norm_patchtokens` y reensamblarlos en la rejilla de parches (14×14 a 224×224) para alimentar un cabezal decodificador ligero. La disponibilidad de mapas intermedios con `reshape=True` facilita la supervisión multi-escala.
- Recuperación de imágenes y detección de duplicados: indexar embeddings CLS en una base vectorial (FAISS, Qdrant) para búsqueda por similitud, deduplicación de datasets o clustering. El vector de 768 dimensiones en fp16 ocupa 1,5 KB por imagen.
- Preprocesado para pipelines multimodales: servir como torre visual congelada para un modelo de lenguaje, sustituyendo a codificadores más costosos. La salida de parches ya está normalizada (`x_norm_patchtokens`), lista para un proyector.
- Inspección visual industrial: la naturaleza densa de los descriptores permite detectar anomalías locales comparando parches entre imágenes de referencia y de producción, con umbrales sobre distancia coseno.
- Correspondencia densa y estimación de geometría: los descriptores por parche se han usado tradicionalmente como entrada para emparejamiento de puntos, flujo óptico o estimación de profundidad con cabezales ligeros.
- Etiquetado y curación de datasets: generar embeddings para agrupar, filtrar y muestrear subconjuntos equilibrados antes de un entrenamiento supervisado.
- Moderación y filtrado de contenido visual: clasificador binario sobre el token CLS entrenado con un conjunto propio de imágenes etiquetadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente documenta comprobaciones de reproducibilidad de la conversión, no métricas de tarea:

| Comprobacion | Resultado reportado |
|---|---|
| Remapeo de claves y carga con `strict=True` desde `model.safetensors` | pasa |
| Pesos remapeados en fp32 frente a `DINOv3ViTModel` de `transformers` (224×224 y 196×252) | `max|diff| = 0.000e+00` (bit-exacto) |
| Salidas por bloque frente a `transformers` | verificadas (detalle truncado en la información disponible) |
| Desviación de la version fp16 frente a fp32 | no disponible |

## Requisitos de hardware

- Pesos en fp16: 163,4 MB en disco y en memoria. Con upcast a fp32, aproximadamente 343 MB.
- VRAM estimada para inferencia: por debajo de 1 GB con lote 1 a 224×224 en fp16; del orden de 1 a 2 GB contando activaciones y lotes pequeños (estimación, no un dato publicado por el autor).
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, GTX 1660, T4 e incluso inferencia en CPU con un coste aceptable para lotes pequeños. Una RTX 4090, A100 o H100 está muy sobredimensionada para este tamaño, aunque útil para procesar grandes volúmenes de imágenes en paralelo.
- Opciones de despliegue documentadas: la librería `codon` (`DINOv3ViT_Base.from_remote()` o carga manual de `model.safetensors` con `load_pretrained`). No se documentan en esta información rutas de despliegue con vLLM, llama.cpp, Ollama, TGI o GGUF, que en cualquier caso no aplican a un encoder visual de este tipo.
- Como los pesos son un remapeo del modelo base, también es posible usar el checkpoint original con `transformers` y `DINOv3ViTModel`, invirtiendo el mapeo de claves.
- Latencia y throughput: no disponible. Dependerán del hardware, del tamaño del lote y de la resolución de entrada.

## Comparativa con modelos similares

Los datos de los modelos comparativos no proceden de la información proporcionada y se indican como referencia general aproximada.

| Modelo | Parametros | Parche / resolucion | Formato y dtype | Licencia | Notas |
|---|---|---|---|---|---|
| CodonProject/DINOv3-ViT-Base | 85,7 M | 16 / 224×224 | safetensors, fp16, layout codon | dinov3-license | Conversión verificada bit-exacta en fp32; 4 tokens de registro |
| facebook/dinov3-vitb16-pretrain-lvd1689m | 85,7 M | 16 / 224×224 | fp32, layout transformers/Meta | dinov3-license | Modelo base original; misma arquitectura y numerica |
| facebook/dinov2-base | ~86 M | 14 / 224×224 | safetensors | Apache-2.0 | Generación anterior; sin tokens de registro, sin RoPE axial 2D |
| openai/clip-vit-base-patch16 | ~86 M (torre visual) | 16 / 224×224 | safetensors | MIT | Entrenamiento contrastivo imagen-texto; permite zero-shot con texto |

La diferencia práctica entre este repositorio y el checkpoint original no es de capacidades, sino de ergonomía de carga, tamaño en disco y disponibilidad nativa en fp16. Frente a DINOv2 base, el cambio relevante es arquitectónico (RoPE axial 2D, tokens de registro, sin embeddings posicionales interpolados).

## Limitaciones y advertencias

- No es un modelo generativo ni de propósito general: solo produce embeddings de imagen. Cualquier tarea concreta requiere un cabezal o un clasificador entrenado aparte.
- La ventaja de tamaño de la versión fp16 tiene un coste: la model card no cuantifica la desviación numérica frente a fp32, solo afirma que el modelo es equivalente "hasta la cuantización fp16". Para pipelines sensibles a precisión, conviene cargar con `dtype=torch.float32`.
- El layout de claves es propio de `codon`. Cargar el archivo directamente en `transformers` falla sin invertir el mapeo de claves documentado en la model card.
- El repositorio incluye un `mask_token` inicializado a cero que no existe en el checkpoint original. Es un marcador de posición para la arquitectura MAE de `codon`; no debe interpretarse como un peso entrenado.
- La tabla de frecuencias rotatorias (`inv_freq`) no se almacena y se recalcula en tiempo de ejecución a partir de `rope_theta` y de la forma de entrada. Esto habilita cualquier resolución, pero implica que el comportamiento depende de la implementación que carga los pesos.
- Licencia `dinov3-license` (campo `other`), distinta de Apache-2.0. No se detallan en la información proporcionada las condiciones exactas para uso comercial; es imprescindible revisar el texto enlazado antes de un despliegue en producción o de redistribuir los pesos.
- No hay resultados de benchmarks publicados en la información disponible, por lo que no es posible comparar su calidad frente a alternativas con datos objetivos.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación por parte de la comunidad más allá de las comprobaciones del autor.
- Las fechas de creación y actualización del repositorio indican 2026-09-17, lo que resulta inconsistente con la fecha esperada; conviene tratar ese metadato con cautela.
- Los resultados de la búsqueda web realizada no guardan relación con el modelo (corresponden a una empresa de perforación francesa), por lo que no aportan información adicional sobre DINOv3, la librería `codon` ni su licencia.
- Como cualquier encoder entrenado con datos web a gran escala, los embeddings pueden arrastrar sesgos presentes en el corpus de entrenamiento y no deben usarse como única señal en decisiones que afecten a personas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CodonProject/DINOv3-ViT-Base
- Modelo base original: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license
- Repositorio de la librería `codon`, con la prueba de conversión en `test/test_dinov3_vit.py`: URL no disponible en la información proporcionada
- Resultados de búsqueda web: no se encontraron enlaces relevantes al modelo ni a la librería
