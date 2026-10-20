# mnmly/vjepa2.1-vit-giant-384

## Resumen

V-JEPA 2.1 ViT-g/16 (384 px) es el codificador de vídeo de la familia V-JEPA 2.1 publicado por Meta FAIR, empaquetado de nuevo en safetensors por el usuario `mnmly` para el port Swift/MLX `mlx-swift-vjepa2`. No es un modelo generativo de texto: es un encoder visual auto-supervisado que produce representaciones densas de fotogramas y clips, y que se acompaña del predictor JEPA original de Meta para predecir las features de parches ocultos a partir de los visibles.

El checkpoint contiene 1.013.267.968 parámetros en el encoder (ViT-g: anchura 1408, profundidad 40, 22 cabezas de 64 dimensiones, MLP 6144, parche 16, tubelet 2, RoPE de 3 ejes) y 55.400.704 parámetros en el predictor. La conversión es bit a bit para fp32 y añade una variante fp16; el autor documenta paridad numérica frente al código PyTorch oficial con similitud coseno de 1,000000 en la ruta exacta y ≥ 0,999985 de extremo a extremo en fp16.

Su relevancia es práctica: permite ejecutar un encoder de vídeo de escala 1B en Apple Silicon con MLX y en PyTorch sin dependencias exóticas, con los tensores cargables mediante `load_state_dict(..., strict=True)` en el `VisionTransformer` upstream. La licencia MIT de Meta se mantiene sin restricciones añadidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) para vídeo, auto-supervisado tipo JEPA; anchura 1408, profundidad 40, 22 cabezas de 64 dim, MLP 6144, parche 16, tubelet 2, RoPE de 3 ejes |
| Parametros totales | 1.013.267.968 (encoder); 55.400.704 adicionales en el predictor JEPA |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica (encoder de vídeo, sin contexto textual). El ejemplo de carga upstream usa `num_frames=64` con `tubelet_size=2` (32 tokens temporales); la paridad se verificó con clips de 16 y 4 fotogramas y con una sola imagen |
| Tipos de cuantizacion | float32 (bit a bit respecto al checkpoint original) y float16 (redondeo round-to-nearest desde fp32). No se distribuyen versiones int8, 4-bit ni GGUF |
| Idiomas soportados | No disponible / no aplica: el modelo no recibe texto ni genera lenguaje |
| Licencia | MIT (Copyright (c) Meta Platforms, Inc. and affiliates); el reempaquetado no añade restricciones |
| Formato de pesos | safetensors (`model.safetensors` 4,05 GB fp32; `model-fp16.safetensors` 2,03 GB; `predictor.safetensors` 222 MB; `predictor-fp16.safetensors` 111 MB) más `config.json`; compatible con MLX y con PyTorch upstream |
| Resolucion de entrada | 384×384, normalización ImageNet; 1 fotograma activa la ruta de imagen, 2 o más la ruta de vídeo |
| Salida | Features de parche `[N, 1408]` con N = T/2 · 24 · 24, más features jerárquicas de 4 niveles `[N, 5632]` |
| Parametros del predictor | 55.400.704; salida de 5632 dimensiones leyendo los cuatro niveles del encoder |
| Tamano del repositorio | 6,4 GB |
| Libreria declarada | `mlx` (con soporte `mlx-swift` y `apple-silicon`) |
| Pipeline | `feature-extraction` |

## Arquitectura y entrenamiento

El encoder es un Vision Transformer denso con atención espacial y temporal conjunta sobre parches de 16×16 píxeles y tubelets de 2 fotogramas, con RoPE aplicado en tres ejes (temporal y las dos dimensiones espaciales) e interpolación de RoPE habilitada. La implementación upstream referenciada es `vit_giant_xformers` con `use_sdpa=True`, `use_SiLU=False`, `wide_SiLU=True`, `uniform_power=False` e `img_temporal_dim_size=1`. La salida no es una etiqueta ni texto, sino un banco de features de parche más una jerarquía de cuatro niveles proyectada a 5632 dimensiones, pensada para tareas densas.

El entrenamiento es auto-supervisado en el marco JEPA: el encoder procesa únicamente los parches visibles y el predictor (55,4 M de parámetros) estima las features de los parches ocultos en el espacio latente, no en píxeles. La model card no detalla el volumen de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un encoder visual); esa información no está disponible en el material proporcionado. La innovación documentada de la versión 2.1 es la obtención de features densas en aprendizaje auto-supervisado de vídeo, según el artículo arXiv:2603.14482 citado por el autor.

## Capacidades

- Extracción de features de vídeo: embeddings de parche de 1408 dimensiones para clips de T fotogramas, con rejilla de 24×24 parches espaciales por cada par temporal.
- Extracción de features de imagen: con un solo fotograma el modelo toma la ruta de imagen y devuelve igualmente features de parche.
- Features jerárquicas de cuatro niveles: salida agregada de 5632 dimensiones, útil para tareas densas que necesitan múltiples escalas.
- Predicción latente enmascarada (ruta JEPA): dado un token mask, el predictor estima las features de los parches ocultos a partir de los visibles.
- Aprendizaje auto-supervisado: no requiere etiquetas; las features se usan con cabezales lineales o se afinan para tareas downstream.
- Procesamiento previo reproducible: redimensionado bilineal exacto respecto a OpenCV, recorte central y normalización, verificado bit a bit contra upstream.
- Ejecución en Apple Silicon mediante MLX y `mlx-swift-vjepa2`, con API Swift (`VJEPA2Session`, `VJEPA2VideoReader`, `VJEPA2TokenMask`) y CLI (`vjepa2-cli embed`, `vjepa2-cli predict`).
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingües: no hay tokenizador de texto ni cabezal de lenguaje.

## Casos de uso

- Búsqueda e indexación de vídeo por similitud: extraer un vector por clip o por fotograma con `vjepa2-cli embed` y construir un índice vectorial; la ventana temporal la fija el número de fotogramas que se pasen al encoder, no un límite de contexto textual.
- Clasificación de vídeo con cabezal lineal: congelar el encoder y entrenar una regresión logística o MLP sobre las features de 1408 dimensiones, un procedimiento estándar en evaluación de representaciones auto-supervisadas.
- Detección y segmentación densa: usar las features jerárquicas de 5632 dimensiones, que conservan la rejilla espacial 24×24, para localizar regiones o acciones en el fotograma.
- Preentrenamiento de modelos de mundo y planificación: el predictor JEPA permite entrenar o evaluar dinámicas latentes sobre vídeo, el escenario original de la familia V-JEPA 2.
- Moderación y filtrado de contenido audiovisual: embeddings por clip para agrupar y recuperar material similar en pipelines de revisión, sin necesidad de etiquetas manuales.
- Prototipado on-device en macOS/iOS: con `mlx-swift-vjepa2` y el fichero fp16 de 2,03 GB se puede integrar el encoder en una app Swift y cachear el modelo localmente.
- Destilación y generación de pseudo-etiquetas: producir features o predicciones latentes sobre un corpus de vídeo no etiquetado para entrenar modelos más pequeños.
- Análisis de clips cortos en investigación: la verificación de paridad con clips de 16 y 4 fotogramas permite reproducir experimentos de upstream en entornos sin GPU NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas downstream (por ejemplo, clasificación en Kinetics-400 o Something-Something v2) en la información disponible. Lo que sí documenta el autor es una verificación de paridad numérica frente al código PyTorch oficial de Meta, ejecutada en fp32 sobre CPU con un clip real de 16 fotogramas, otro de 4 y una imagen suelta:

| Ruta de verificacion | Similitud coseno |
|---|---|
| Ruta exacta (stream CPU de MLX), todos los bloques guardados | 1,000000 |
| GPU fp32 por etapa (minimo) | 0,999996 |
| Extremo a extremo fp32, video | 0,999997 |
| Extremo a extremo fp32, features jerarquicas | 0,999998 |
| Extremo a extremo fp32, imagen | 0,999997 |
| Extremo a extremo fp16 | 0,999985 |
| Predictor, todos los bloques (ruta exacta) | ≥ 0,9999997 |
| Pixeles → encoder enmascarado → predictor, fp32 | ≥ 0,99998 |
| Pixeles → encoder enmascarado → predictor, fp16 | ≥ 0,99997 |

El preprocesado (redimensionado bilineal, recorte central y normalización) reproduce el tensor de upstream bit a bit. No hay datos de latencia ni de throughput publicados.

## Requisitos de hardware

- VRAM para los pesos: 4,05 GB en fp32 y 2,03 GB en fp16 para el encoder; 222 MB y 111 MB respectivamente para el predictor.
- VRAM estimada en inferencia: del orden de 6-8 GB en fp32 y 3-4 GB en fp16 para clips de 16 fotogramas a 384×384 (estimación a partir del tamaño de pesos y de las activaciones de una rejilla de 24×24 parches; no confirmada por el autor).
- GPU profesionales: A100 o H100 para procesar lotes grandes en fp32 o fp16; el checkpoint se validó en GPU con fp32 por etapas.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080/3090 (16-24 GB) y RTX 3060 (12 GB) en fp16; en fp32 también entra en tarjetas de 8 GB si se procesan pocos fotogramas por pasada.
- Apple Silicon: es el objetivo principal del reempaquetado; con memoria unificada, el fichero fp16 de 2,03 GB es cargable en equipos de 8 GB o más, y el fp32 de 4,05 GB en configuraciones de 16 GB o más.
- Opciones de despliegue: `mlx-swift-vjepa2` (Swift, con CLI `vjepa2-cli` y app V-JEPA 2 Viewer), MLX para Python, y PyTorch con el código de `facebookresearch/vjepa2` (SDPA/xformers) cargando los safetensors con `strict=True`.
- No aplican servidores de inferencia de lenguaje como vLLM, TGI, llama.cpp u Ollama: el modelo no es autoregresivo ni acepta prompts de texto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Modalidad | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| V-JEPA 2.1 ViT-g/16 384 (este repo) | 1.013 M (encoder) + 55,4 M (predictor) | 384×384, T fotogramas, tubelet 2 | Video e imagen, auto-supervisado | MIT | safetensors fp32/fp16 para MLX y PyTorch | Conversion no oficial de un tercero; paridad verificada con upstream |
| V-JEPA 2 ViT-g/16 (upstream, `facebookresearch/vjepa2`) | Mismo checkpoint base (`vjepa2_1_vitg_384.pt`) | Igual | Video e imagen | MIT | `.pt` de PyTorch | Referencia oficial; requiere el repositorio y `torch.hub` |
| DINOv2 ViT-g/14 | Aproximadamente 1.100 M (referencia externa, no verificada en la informacion proporcionada) | Imagen | Vision, auto-supervisado | No disponible en la informacion proporcionada | safetensors/PyTorch | Alternativa de referencia para features densas en imagen, sin ruta de video |
| VideoMAE V2-g | No disponible en la informacion proporcionada | Video | Vision, auto-supervisado con enmascarado en pixeles | No disponible en la informacion proporcionada | PyTorch | Alternativa de referencia en video auto-supervisado |

Las dos últimas filas se incluyen como referencias de categoria; sus datos concretos no forman parte de la información proporcionada y deben consultarse en sus fichas oficiales.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no admite instrucciones, no hace tool calling ni razonamiento multi-paso. Cualquier caso de uso que requiera lenguaje necesita un modelo adicional.
- El repositorio es una conversión no oficial de un tercero, no una publicación de Meta; el mantenimiento, las futuras actualizaciones y la compatibilidad dependen del autor del reempaquetado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de estos ficheros más allá de las pruebas de paridad declaradas por el autor.
- La licencia MIT permite uso comercial, pero obliga a conservar el aviso de copyright de Meta Platforms, Inc. y el texto de la licencia al redistribuir los ficheros.
- La variante fp16 introduce una desviación medible (coseno 0,999985 de extremo a extremo frente a la ruta fp32); en pipelines sensibles a pequeñas diferencias numéricas conviene usar los ficheros fp32.
- El layout de los embeddings de parche Conv3d se mantiene en formato PyTorch `(O, I, kT, kH, kW)`; el cargador Swift transpone en tiempo de carga, de modo que usar los ficheros con un loader propio exige respetar esa convención.
- No se documentan en la información disponible la composición del dataset de entrenamiento ni un análisis de sesgos; al ser un encoder de vídeo, puede heredar sesgos de representación de las fuentes audiovisuales usadas por Meta.
- El riesgo de alucinación en el sentido generativo no aplica, pero el predictor JEPA puede producir features poco fiables en regiones con oclusión severa o fuera de la distribución de entrenamiento.
- No hay versiones cuantizadas a 8 o 4 bits ni formato GGUF, lo que limita el despliegue en hardware con menos de 2 GB de memoria disponible para pesos.
- La resolución está fijada a 384×384 con parche 16; entradas de otra resolución requieren interpolación y pueden degradar la paridad con upstream.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mnmly/vjepa2.1-vit-giant-384
- Repositorio upstream de Meta FAIR: https://github.com/facebookresearch/vjepa2
- Código upstream en el commit referenciado: https://github.com/facebookresearch/vjepa2/tree/204698b45b3712590f06245fbfba32d3be539812
- Checkpoint original: https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitg_384.pt
- Artículo V-JEPA 2.1 (arXiv:2603.14482): https://arxiv.org/abs/2603.14482
- Artículo V-JEPA 2 (arXiv:2506.09985): https://arxiv.org/abs/2506.09985
- Port Swift/MLX `mlx-swift-vjepa2`: no disponible como URL en la información proporcionada (se cita por nombre en la model card)
