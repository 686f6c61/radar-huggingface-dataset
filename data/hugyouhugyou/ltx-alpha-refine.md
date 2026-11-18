# hugyouhugyou/ltx-alpha-refine

## Resumen

LTX Alpha Refine es un pipeline complementario, publicado como código ejecutable, para refinar los bordes de manos en movimiento en salidas de vídeo con fondo blanco generadas por LTX Alpha Gen. No se trata de un modelo entrenado ni de un checkpoint: el repositorio contiene únicamente código de refinamiento, procedencia de modelos, herramientas de reproducibilidad y documentación de investigación sobre tiempos de ejecución. El autor es el usuario de Hugging Face `hugyouhugyou`, y el desarrollo se aloja en un repositorio de GitHub independiente.

El problema que resuelve es concreto: el canal alfa grueso generado por LTX Alpha Gen puede quedarse retrasado respecto a dedos en movimiento, recortando el primer plano y dejando sangrado de blanco en los bordes. El pipeline utiliza el RGB de origen del fotograma actual y las posiciones de las manos detectadas para refinar únicamente las regiones afectadas, combinando un detector de manos de estilo anime con ViTMatte-S para el matting local, junto con descontaminación de color sobre fondo blanco y recuperación condicional de huecos en el primer plano.

La relevancia es acotada pero clara para quien produzca vídeo estilizado de personajes sobre fondo blanco con LTX: ofrece una vía reproducible para mejorar la calidad del alfa sin reentrenar nada. No incluye endpoint de inferencia alojado ni un `from_pretrained()` automático, y no redistribuye pesos de terceros; el usuario debe descargarlos por separado de sus repositorios originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de post-procesado (no es un modelo único); combina detección de manos y matting con ViTMatte-S sobre salidas de LTX Alpha Gen |
| Parametros totales | no disponible (no se publican pesos propios; depende de ViTMatte-S y del detector externos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesamiento por fotograma; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (el pipeline se ejecuta en CUDA/BF16 según la model card) |
| Idiomas soportados | en, zh (documentación y etiquetas del repositorio) |
| Licencia | Apache-2.0 (solo el código; los modelos externos conservan sus propias licencias) |
| Formato de pesos | no aplica (repo code-only); los modelos externos se descargan como safetensors (ViTMatte) y ONNX (detector de manos) |

## Arquitectura y entrenamiento

El repositorio no entrena ni publica ningún checkpoint. Es un pipeline de refinamiento que opera sobre fotogramas RGB de origen y fotogramas alfa de 8 bits de un solo canal, con nombres contiguos (`00000.png`, `00001.png`, ...) y dimensiones coincidentes. El flujo, según la model card, consta de cinco etapas: obtención de detecciones de manos (reteniendo detecciones débiles solo si la evidencia de fotogramas adyacentes respalda la geometría del fotograma actual), liberación de etiquetas de trimap gruesas contradichas por la imagen de origen, ejecución de ViTMatte local con control de contraste, escritura acotada y descontaminación de color sobre fondo blanco, recuperación condicional de huecos blancos en el primer plano mediante continuidad de material y confianza del modelo, y solapamiento del trabajo de CPU por fotograma mientras se serializa la inferencia compartida en GPU.

Los fotogramas adyacentes no deforman el alfa ni sustituyen cajas de manos interpoladas; las regiones sin manos dejan la entrada sin cambios. La salida es RGBA con alfa recto y PNG de alfa separados. El pipeline se probó en Linux con una RTX 5060 Ti de 16 GB en CUDA/BF16. La generación y decodificación de LTX son pasos separados: este repositorio solo refina fotogramas alfa ya existentes.

## Capacidades

- Refinamiento de bordes de manos en movimiento sobre vídeo con fondo blanco generado por LTX Alpha Gen.
- Detección de manos con evidencia entre fotogramas adyacentes para filtrar detecciones débiles.
- Matting local con ViTMatte-S, con control de contraste y escritura acotada.
- Descontaminación de color sobre fondo blanco para eliminar sangrado.
- Recuperación condicional de huecos blancos en el primer plano según continuidad de material y confianza del modelo.
- Interfaz CLI con detecciones externas opcionales (`--detections boxes.json`) para usar un detector alternativo.
- Salida en RGBA con alfa recto y PNG de alfa independientes.
- Soporte de `--raw-rgb-alpha` para fotogramas de matte RGB sin procesar de LTX y de `--allow-alpha-tail` solo para padding final explícito del modelo.
- Sin redimensionado implícito ni conversión de tasa de fotogramas.
- Verificación de integridad de modelos externos mediante `tools/verify_models.py`.

## Casos de uso

- Post-procesado de cortometrajes de personajes estilizados: refinar el alfa de secuencias generadas con LTX Alpha Gen sobre fondo blanco para composición posterior, usando el RGB de origen y las detecciones de manos para corregir solo las regiones afectadas.
- Composición en pipelines de VFX: generar PNG de alfa separados y RGBA con alfa recto que se integran directamente en herramientas de composición, evitando el sangrado blanco en bordes de dedos.
- Automatización de control de calidad de alfa: ejecutar el refinador sobre lotes de fotogramas y comparar la salida con el alfa aceptado de referencia para detectar regresiones, dado que el código reproduce píxeles de referencia en el conjunto de regresión declarado.
- Integración con detectores propios: sustituir el detector por defecto mediante el esquema `--detections boxes.json`, útil si el estudio ya dispone de un detector de manos entrenado con sus propios datos.
- Investigación en matting de vídeo: usar el pipeline como referencia reproducible para estudiar la contribución de cada etapa (detección, trimap, ViTMatte, descontaminación) mediante las ablaciones documentadas.
- Procesado local en estación de trabajo: ejecutar el refinador en una GPU de consumo de 16 GB (RTX 5060 Ti) para flujos de trabajo sin acceso a clúster, refinando secuencias de 124 fotogramas a 768×576 y 24 fps.
- Preparación de material para animación: recuperar huecos blancos en el primer plano de personajes con ropa o pelo claros cuando la continuidad de material y la confianza del modelo lo permiten.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Conjunto de regresión | 13 personajes anonimizados, 15 clips, 1.860 fotogramas | Datos que informaron el desarrollo; no es un benchmark de generalización sobre datos no vistos |
| Reproducción de referencia | Igualdad exacta de píxeles alfa y RGBA aceptados de referencia en todo el conjunto de regresión | Igualdad con una implementación de referencia no equivale a precisión de matting contra ground truth |
| CLI independiente | Reproducción exacta de una secuencia completa de 124 fotogramas | Verificado con la CLI separada |
| Pruebas sintéticas | 10 pruebas de contrato: alineación, localidad, geometría de detección y salida sin pérdida | Cubren contratos del pipeline |
| Tiempo de integración LTX completa | ~59,7 s en una muestra repetida de 124 fotogramas a 768×576 y 24 fps | Incluye carga de fases, detección, denoising, decodificación, refinamiento y escritura de PNG; excluye preparación de entrada, arranque, cola, codificación de vídeo y construcción de caché de pesos en primer uso. No es el tiempo del refinador autónomo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el pipeline se probó en una RTX 5060 Ti de 16 GB con CUDA/BF16, por lo que 16 GB es un entorno validado.
- GPU recomendadas: RTX 5060 Ti 16 GB (única configuración reportada como probada); no se documentan otras GPU.
- Cabe en GPU de consumo: sí, al menos en la RTX 5060 Ti 16 GB reportada; no se confirma para modelos con menos VRAM.
- Opciones de despliegue: ejecución local mediante el paquete instalable (`pip install -e '.[detect]'`) y la CLI `ltx-alpha-refine`; no hay endpoint alojado ni integración con vLLM, llama.cpp, Ollama o TGI, que no aplican a este pipeline.
- Latencia y throughput: el único dato publicado es el de la integración completa de LTX (~59,7 s para 124 fotogramas a 768×576 y 24 fps), que no corresponde al refinador autónomo; no se publica latencia ni throughput del refinador por separado.
- Dependencias externas: ViTMatte-S (`hustvl/vitmatte-small-composition-1k`) y detector de manos (`deepghs/anime_hand_detection`), descargados aparte y sujetos a sus propios términos.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX Alpha Refine | Pipeline de post-procesado de alfa (code-only) | no disponible (sin pesos propios) | no aplica | Apache-2.0 (código) | Hugging Face y GitHub |
| LTX Alpha Gen (Lightricks) | Modelo generador de alfa para vídeo | no disponible en la información proporcionada | no disponible | según Lightricks | Hugging Face |
| ViTMatte-S (hustvl) | Modelo de matting de imagen | no disponible en la información proporcionada | no disponible | según hustvl | Hugging Face |
| Detector de manos anime (DeepGHS) | Detector de objetos | no disponible en la información proporcionada | no disponible | según DeepGHS | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparativa se limita a rol en el pipeline, licencia y disponibilidad.

## Limitaciones y advertencias

- El alcance evaluado es vídeo estilizado de personajes sobre fondo casi blanco, predominantemente 768×576, 24 fps y 124 fotogramas; no se reclama generalización a otros fondos.
- Ropa o pelo blancos, materiales transparentes, bajo contraste y oclusiones rápidas siguen siendo casos difíciles.
- No se reclama perfección en los bordes, rendimiento en fondos arbitrarios, streaming causal en tiempo real, una arquitectura LTX más pequeña ni identidad numérica universal entre hardware.
- La igualdad exacta con la implementación de referencia no equivale a precisión de matting contra ground truth.
- El conjunto de regresión informó el desarrollo; no es un benchmark de generalización sobre datos no vistos.
- El pipeline requiere fotogramas RGB y alfa con dimensiones coincidentes y nombres contiguos; no hay redimensionado implícito ni conversión de tasa de fotogramas.
- La licencia Apache-2.0 cubre solo el código del repositorio; no relicencia los modelos externos (LTX, ViTMatte, detector de manos, adaptador de destilación), que el usuario debe obtener por separado y bajo sus propios términos.
- No es una versión oficial de Lightricks; es una implementación comunitaria.
- Los medios de personajes privados no se redistribuyen; se requiere permiso para cualquier material usado con el pipeline.
- El tiempo de ~59,7 s corresponde a la integración completa de LTX, no al refinador autónomo; no debe usarse como referencia de latencia del refinador.
- El repositorio no incluye endpoint de inferencia alojado ni `from_pretrained()` automático.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hugyouhugyou/ltx-alpha-refine
- Código fuente en GitHub: https://github.com/YjWilliam101010/ltx-alpha-refine
- Guía de uso completa: https://huggingface.co/hugyouhugyou/ltx-alpha-refine/blob/main/USAGE.md
- Documentación en chino: https://huggingface.co/hugyouhugyou/ltx-alpha-refine/blob/main/README.zh-CN.md
- Validación: https://huggingface.co/hugyouhugyou/ltx-alpha-refine/blob/main/docs/validation.json
- Benchmarks y ablaciones: https://huggingface.co/hugyouhugyou/ltx-alpha-refine/blob/main/docs/BENCHMARKS.md
- Propuesta de loader upstream: https://huggingface.co/hugyouhugyou/ltx-alpha-refine/blob/main/docs/UPSTREAM_PROPOSAL.md
- Referencia de caché experimental: https://huggingface.co/hugyouhugyou/ltx-alpha-refine/blob/main/research/README.md
- Lightricks LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Lightricks LTX-2.5 Alpha Gen: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Alpha-Gen
- Adaptador de destilación en dos pasos: https://huggingface.co/lvladikov/LTX-2.5-Stage1-Distill-2step-LoRA
- ViTMatte-S: https://huggingface.co/hustvl/vitmatte-small-composition-1k
- Detector de manos anime de DeepGHS: https://huggingface.co/deepghs/anime_hand_detection
