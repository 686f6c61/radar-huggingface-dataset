# ctate7163/mppp-mask

## Resumen
MPPP mask model v3 (`mppp_mask_v3`) es un modelo de segmentación binaria de imágenes desarrollado por Christian Tate (usuario `ctate7163`) como componente del Mars Photogrammetry Preprocessing Pipeline (MPPP). Su tarea es decidir, píxel a píxel, si cada punto de una imagen de la misión Mars 2020 Perseverance debe incluirse en una reconstrucción fotogramétrica (terreno) o excluirse (hardware del rover, cielo, dianas de calibración y artefactos de imagen).

Técnicamente es un modelo pequeño y especializado: un backbone ConvNeXt-tiny inicializado con ImageNet-22k, con cuello FPN, un módulo ASPP ligero y un decodificador con skip a stride 4 que produce un único logit por píxel. El fichero de pesos ocupa 124.826.276 bytes en formato safetensors y se distribuye bajo licencia Apache-2.0.

Su relevancia es práctica: la fotogrametría sobre imágenes marcianas exige enmascarar previamente rover y cielo para evitar nubes de puntos corruptas, y este modelo convierte ese paso en automático dentro de MPPP. Alcanza un IoU de validación de 0,979 (media por lote) y está pensado exclusivamente para las cámaras de ingeniería y Mastcam-Z de Perseverance, no como segmentador de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-tiny (inicializado con ImageNet-22k) + FPN + ASPP ligero + skip de decodificador a stride 4; una única salida logit |
| Parametros totales | No disponible en la model card. El fichero de pesos ocupa 124.826.276 bytes (estimación propia no confirmada: ~31 M de parámetros si los pesos estuvieran en fp32) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión). Entrada: RGB lineal equivalente a 8 bits, redimensionada a un lienzo de 1664 × 1248 (lado largo ≤ 1648) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; el entrenamiento se realizó en bf16 |
| Idiomas soportados | No aplica (modelo de imagen, sin componente de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`mppp_mask_convnext_tiny_s4_v3.safetensors`), con la model card embebida en los metadatos bajo la clave `mppp_card` |
| Tarea | Segmentación de imágenes (image-segmentation, binaria por píxel) |
| SHA-256 del fichero | `46830126e3103c144e251e9173529115aca6ebc1b07d6530b5670ab1c0612aa0` |
| Salida | Sigmoide > 0,5 = incluir; MPPP dilata la región "incluir" con un kernel de 3 × 3 |

## Arquitectura y entrenamiento
La arquitectura combina un backbone ConvNeXt-tiny preentrenado en ImageNet-22k con un cuello Feature Pyramid Network, un bloque ASPP (Atrous Spatial Pyramid Pooling) ligero y un decodificador que incorpora un skip connection a stride 4. La cabeza produce un solo logit por píxel, por lo que la formulación es de segmentación binaria con pérdida sigmoide, no de clasificación multiclase. La entrada se normaliza con las estadísticas de ImageNet y se procesa sobre un lienzo de 1664 × 1248 con el lado largo limitado a 1648 píxeles.

El entrenamiento usó 7.072 fotogramas de entrenamiento y 786 de validación, derivados de 3.931 máscaras editadas a mano sobre imágenes de las cámaras de ingeniería y Mastcam-Z de Mars 2020, más copias con variaciones de brillo. El split se hizo por máscara, de forma que las variantes de una misma máscara nunca cruzan entre entrenamiento y validación. Se planificaron 10 épocas y el mejor punto se alcanzó en la época 9, con AdamW (lr 5e-5 con decaimiento coseno y 5 % de warm-up), weight decay 5e-3, volteos horizontales, precisión bf16 y una pérdida combinada BCE + Tversky. El modelo se exportó desde el checkpoint `convnext_tiny_s4_seg_20260925b.pt` el 26 de septiembre de 2026. No se emplearon técnicas de alineamiento tipo RLHF o DPO, que no aplican a esta tarea.

## Capacidades
- Segmentación binaria densa por píxel: predice para cada píxel si pertenece a terreno reconstruible o debe excluirse.
- Salida probabilística (sigmoide) además de la máscara umbralizada, lo que permite ajustar el umbral o aplicar post-procesos propios.
- Exclusión automática de hardware del rover, cielo, dianas de calibración y artefactos de imagen.
- Funciona tanto con imágenes de las cámaras de ingeniería de Perseverance como con Mastcam-Z, según la composición del conjunto de entrenamiento.
- Integración nativa con la librería MPPP: descarga automática del repositorio en el primer uso, verificación contra el SHA-256 y caché local.
- Selección de versión mediante el parámetro `"checkpoint"` (`mppp_mask_v1`, `mppp_mask_v2`, `mppp_mask_v3`), todas con la misma arquitectura y formato de entrada.
- Inferencia directa con `mppp.mask.infer_mask(rgb_uint8_image, "mppp_mask_v3")`, que devuelve máscara, probabilidad y model card.
- Lectura de la model card embebida sin necesidad de MPPP, vía `safetensors.safe_open(...).metadata()["mppp_card"]`.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, generación de texto, visión generalista ni soporte multilingüe: son capacidades fuera del alcance del modelo.

## Casos de uso
- Preprocesado fotogramétrico de Perseverance: el modelo se ejecuta como paso previo del pipeline MPPP sobre cada imagen de la misión, generando la máscara que decide qué píxeles entran en la reconstrucción. Es su caso de uso primario y para el que fue entrenado.
- Procesado por lotes de archivos públicos del PDS: al ser un modelo de ~125 MB y con inferencia por GPU modesta, permite enmascarar cientos o miles de fotogramas de Mars 2020 en una sola pasada sin intervención manual.
- Integración en pipelines de Structure-from-Motion: las máscaras se pueden suministrar a herramientas de fotogrametría (COLMAP, OpenMVG, Agisoft Metashape y similares) para evitar que el rover, el cielo o las dianas de calibración generen puntos espurios en la nube dispersa.
- Generación de modelos digitales de elevación (DEM) y mosaicos del terreno: al eliminar el hardware del rover, que se mueve entre tomas, se reduce el error de alineación y se estabilizan las reconstrucciones de superficies marcianas.
- Pre-anotación asistida para etiquetado humano: dado su IoU de validación de 0,979, sirve como primer paso para generar máscaras que un operador revisa y corrige, reduciendo el coste de crear nuevos conjuntos de etiquetas.
- Filtrado de imágenes sin valor fotogramétrico: la probabilidad por píxel permite descartar o marcar automáticamente encuadres dominados por cielo o por calibración antes de lanzar procesos costosos de reconstrucción.
- Despliegue en estaciones de trabajo modestas o en campo: el tamaño reducido del modelo hace viable ejecutarlo en portátiles con GPU de gama media o incluso en CPU para volúmenes pequeños de imágenes.
- Control de calidad de reconstrucciones: comparar la máscara generada con la nube de puntos resultante ayuda a detectar tomas problemáticas (polvo en la óptica, iluminación atípica) que el modelo marca de forma menos fiable.

## Benchmarks y rendimiento

| Version | Fecha | Epocas | IoU de validacion |
|---|---|---|---|
| `mppp_mask_v1` | 24 sep 2026 | 3 | 0,971 |
| `mppp_mask_v2` | 25 sep 2026 | 4 | 0,977 |
| `mppp_mask_v3` (por defecto) | 26 sep 2026 | 9 (de 10 planificadas) | 0,979 |

El IoU se calcula como media por lote, y en esa métrica los fotogramas sin terreno cuentan como 0; por tanto, el IoU restringido a fotogramas con terreno es superior. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje, ya que el modelo no realiza tareas de texto. No hay comparaciones head-to-head con otros modelos de segmentación en la información disponible.

## Requisitos de hardware
- Tamano de los pesos: 124,8 MB en el fichero publicado; aproximadamente 62 MB si se convierte a bf16/fp16.
- VRAM estimada para inferencia: orientativamente 2-4 GB en fp32 con lote 1 y la entrada completa de 1664 × 1248 (estimación propia; el autor no publica cifras). En bf16 bajaría por debajo de 2 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente. Una RTX 3060 o RTX 4060 ya cubre el caso de uso; RTX 4090, A100 o H100 quedan muy sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas modernas e incluso en iGPU recientes, así como en CPU (con mayor latencia).
- Opciones de despliegue: PyTorch con la librería MPPP (`mppp.process_images` o `mppp.mask.infer_mask`) o carga directa de los pesos con `safetensors.torch.load_file`. No se publican pesos en GGUF ni ONNX, por lo que llama.cpp y Ollama no aplican; vLLM y TGI tampoco, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de segmentacion | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MPPP mask v3 (este modelo) | No disponible (fichero de 124,8 MB) | Binaria por píxel, especializada en terreno marciano | Lienzo 1664 × 1248 | Apache-2.0 | HuggingFace, integrado en MPPP |
| Segment Anything (SAM, ViT-B) | ~91 M (cifra pública habitual) | Promptable, segmentación generalista | Resolución configurable, requiere prompt | Apache-2.0 | Pesos públicos |
| Segment Anything (SAM, ViT-H) | ~636 M (cifra pública habitual) | Promptable, segmentación generalista | Resolución configurable, requiere prompt | Apache-2.0 | Pesos públicos |
| Enmascarado asistido de Agisoft Metashape | No disponible (propietario) | Segmentación de primer plano por foto | Definida por la aplicación | Propietaria, comercial | Integrada en Metashape |

No existen cifras comparativas publicadas entre estos modelos y MPPP mask v3. La diferencia funcional es clara: SAM y similares son segmentadores generalistas que requieren prompts y no distinguen "terreno marciano" de "hardware del rover", mientras que MPPP mask v3 está entrenado específicamente para ese criterio binario en imágenes de Perseverance.

## Limitaciones y advertencias
- Las etiquetas de entrenamiento son polígonos dibujados a mano, por lo que los bordes son precisos solo a unos pocos píxeles y algunas partes del rover están trazadas de forma gruesa.
- Los fotogramas alejados del conjunto de entrenamiento (otras cámaras, iluminación inusual, polvo en la óptica) pueden enmascararse de forma menos fiable.
- Las máscaras están pensadas para eliminar rover y cielo de la fotogrametría, no para servir como segmentaciones precisas: no deben reutilizarse como ground truth geométrico.
- El modelo está especializado en imágenes de Mars 2020 Perseverance; no se ha validado en otras misiones, otros cuerpos del sistema solar ni imágenes aéreas o terrestres.
- El umbral de decisión por defecto es 0,5 sobre la sigmoide, y MPPP aplica después una dilatación de 3 × 3 sobre la región incluida, lo que altera ligeramente los bordes.
- Riesgo de alucinación en el sentido de falsos positivos de terreno (o falsos negativos) en encuadres atípicos; conviene revisar las máscaras cuando la reconstrucción resultante sea anómala.
- Sesgos conocidos: no se documentan análisis de sesgo por iluminación, tipo de cámara o estación del año marciano más allá de las variaciones de brillo sintéticas introducidas en el conjunto de entrenamiento.
- Licencia Apache-2.0, permisiva para uso comercial; liberada con la aprobación de Malin Space Science Systems. Las imágenes de entrenamiento son productos públicos de Mars 2020 del NASA Planetary Data System y las máscaras y el modelo son obra del autor.
- En producción, conviene fijar la versión del checkpoint de forma explícita, ya que las versiones v1, v2 y v3 comparten arquitectura pero difieren en pesos y en IoU.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/ctate7163/mppp-mask
- Perfil del autor en HuggingFace (Christian Tate): https://huggingface.co/ctate7163
- Repositorio de MPPP: https://github.com/ctate7163/MPPP
- NASA Planetary Data System (origen de las imágenes de entrenamiento): https://pds.nasa.gov/
- Malin Space Science Systems (MSSS), entidad que aprobó la publicación: https://www.msss.com/
- Manual de referencia sobre generación de máscaras asistida por IA en fotogrametría (contexto de uso): https://photogrammetrycommunity.github.io/metashape-expert-manual/workflow/alignment/ai-mask-generation/
