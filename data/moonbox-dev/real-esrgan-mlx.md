# moonbox-dev/Real-ESRGAN-MLX

## Resumen

Real-ESRGAN-MLX es una conversión a MLX del modelo Real-ESRGAN x4plus (`RealESRGAN_x4plus.pth`), el modelo de superresolución de imágenes generales desarrollado originalmente por Xintao Wang y colaboradores en el paper "Real-ESRGAN: Training Real-World Blind Super-Resolution with Pure Synthetic Data" (arXiv:2107.10833). La conversión la publica moonbox-dev para ejecutar el modelo de forma nativa en Macs con Apple Silicon mediante el framework MLX de Apple. No es un modelo de lenguaje: es una red convolucional de superresolución de imagen a imagen que escala una entrada 4x.

El repositorio contiene dos builds de precisión (fp16 y bf16), cada una como carpeta autocontenida con `model.safetensors` (33,5 MB), `config.json` y `mlx_model.py`, un port mínimo que solo requiere `mlx` y `numpy`. La red es enteramente convolucional, de ahí que no existan builds de 8, 6 o 4 bits: MLX no cuantiza convoluciones y, con 33 MB de pesos, la cuantización no aportaría ninguna ventaja práctica.

La relevancia actual es acotada pero clara: permite ejecutar superresolución de imágenes de calidad en hardware Apple Silicon sin depender de PyTorch ni de CUDA, con una fidelidad medida frente al original (54,3 dB de PSNR medio en fp16) y tiempos de inferencia del orden de 0,25 s para una entrada de ~130x130 px en un chip M5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional (RRDB, del linaje ESRGAN/Real-ESRGAN); no es un transformer ni un modelo de lenguaje |
| Parametros totales | no disponible (pesos de 33,5 MB por build) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen a imagen) |
| Tipos de cuantizacion | fp16 y bf16; sin builds de 8/6/4 bits (MLX no cuantiza convoluciones) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (MLX) + `config.json` + `mlx_model.py` |
| Factor de escala | 4x |
| Entrada / salida | imagen RGB a imagen RGB |
| Inferencia por teselas | sí, teselas de 256 px |
| Dependencias | `mlx`, `numpy` (y `Pillow` en el ejemplo) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Real-ESRGAN x4plus, una red generativa convolucional del linaje ESRGAN (bloques RRDB con atención, sin transformer). Está entrenada con datos sintéticos puros que simulan degradaciones del mundo real (ruido, desenfoque, compresión JPEG y reescalados sucesivos) para hacer superresolución ciega sobre imágenes reales. La model card de esta conversión no aporta detalles sobre el número de tokens, la composición exacta del dataset ni si hubo etapas de RL o DPO; esa información corresponde al paper original.

La innovación de esta publicación no está en el entrenamiento, sino en el port: los pesos originales se cargan en MLX y se almacenan como bf16 o fp16, y cada build se valida contra el modelo PyTorch original antes de subirse, con hashes sha256 documentados. El script `mlx_model.py` implementa la inferencia con teselado de 256 px para limitar el uso de memoria en imágenes grandes. No hay decodificación especulativa ni atención lineal: es una CNN de superresolución.

## Capacidades

- Superresolución de imagen 4x sobre fotografías generales (modelo x4plus).
- Procesamiento por teselas de 256 px, lo que permite entradas de gran tamaño con memoria acotada.
- Ejecución nativa en Apple Silicon vía MLX, sin CUDA ni PyTorch.
- Dos precisiones con compromisos distintos: fp16 maximiza fidelidad, bf16 prioriza velocidad y robustez numérica.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye visión semántica ni descripción de imágenes; solo reescalado.

## Casos de uso

- Restauración de fotografías antiguas o de baja resolución: el modelo aplica superresolución ciega entrenada con degradaciones realistas, adecuado para escaneos y fotos comprimidas.
- Mejora de miniaturas y assets web: escalar imágenes pequeñas a 4x antes de publicarlas, con inferencia de ~0,25 s por imagen de ~130x130 px en un M5.
- Preparación de datasets de visión: aumentar la resolución de imágenes de entrenamiento o de validación en pipelines de ML antes de pasarlas a otros modelos.
- Postprocesado en aplicaciones de escritorio para macOS: integrar `mlx_model.py` en apps nativas de Apple Silicon sin dependencias de CUDA.
- Procesamiento por lotes en local: al ocupar 33 MB de pesos y requerir solo `mlx` y `numpy`, cabe en cualquier Mac con Apple Silicon y permite lotes sin GPU dedicada.
- Prototipado e investigación en superresolución: servir como referencia MLX validada (PSNR/LPIPS documentados) para comparar implementaciones o experimentar con teselado.
- Mejora de frames en flujos de vídeo de baja resolución: el teselado de 256 px facilita procesar fotogramas grandes de forma estable.

## Benchmarks y rendimiento

Los datos disponibles son de fidelidad frente al modelo PyTorch original y de latencia, no benchmarks estándar de superresolución (Set5, Set14, etc.).

| Build | PSNR vs PyTorch fp32 (media / peor) | LPIPS (peor) | Tiempo, ~130x130 -> 4x en M5 |
|---|---|---|---|
| fp16 | 54,3 / 46,9 dB | 0,0004 | 0,25 s |
| bf16 | 40,8 / 30,7 dB | 0,015 | 0,28 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM: no aplica en el sentido de GPU CUDA; el modelo usa memoria unificada de Apple Silicon. Con 33,5 MB de pesos, el consumo lo domina el teselado de 256 px y el tamaño de la imagen.
- GPU recomendadas: cualquier chip Apple Silicon (M1 en adelante); los tiempos de referencia son de un M5.
- Cabe en consumer GPU: sí, en cualquier Mac con Apple Silicon; no está pensado para GPUs NVIDIA (usa MLX, no CUDA).
- Despliegue: MLX con el script incluido `mlx_model.py`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplican a una CNN de imagen).
- Latencia: ~0,25 s (fp16) y ~0,28 s (bf16) para una entrada de ~130x130 px a 4x en un M5; el throughput escala con el número de teselas.

## Comparativa con modelos similares

| Modelo | Tipo | Escala | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Real-ESRGAN-MLX (esta ficha) | CNN superresolución, port MLX | 4x | imagen RGB, teselas 256 px | BSD-3-Clause | Hugging Face (MLX) |
| Real-ESRGAN original (xinntao) | CNN superresolución, PyTorch | 4x | imagen RGB | BSD-3-Clause | GitHub / PyPI |
| RealESRGAN_x4plus_anime_6B | CNN superresolución para anime | 4x | imagen RGB | BSD-3-Clause | GitHub (model zoo) |
| AnimeVideo-v3 | CNN superresolución para vídeo anime | 4x | frames de vídeo | BSD-3-Clause | GitHub (model zoo) |

## Limitaciones y advertencias

- Es un modelo de imagen, no de lenguaje: no genera texto, código ni razonamiento; cualquier expectativa de LLM es incorrecta.
- El build bf16 presenta deriva numérica en algunas imágenes (peor caso de 30,7 dB de PSNR frente al original); para máxima fidelidad debe usarse fp16.
- No hay builds cuantizados a 8/6/4 bits y no se pueden generar con las herramientas estándar de MLX por ser una red convolucional.
- Solo está convertido el modelo x4plus de fotografía general; las variantes para anime y vídeo no están incluidas en este repositorio.
- El pipeline completo (pre/postprocesado, detección de caras, etc.) proviene del repositorio original salvo lo indicado en la model card.
- Licencia BSD-3-Clause: permite uso comercial, pero obliga a conservar el aviso de copyright y la cláusula de no endorsement; los archivos son derivados del modelo original y heredan su licencia.
- Riesgo de artefactos y alucinación visual: como toda superresolución generativa, puede inventar texturas o detalles no presentes en la imagen original.
- Sin datos publicados sobre sesgos demográficos o de contenido; el modelo está entrenado con datos sintéticos, lo que limita pero no elimina sesgos de las imágenes de referencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados declarados.

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-dev/Real-ESRGAN-MLX
- Repositorio original Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Paper: https://arxiv.org/abs/2107.10833
- Model zoo original: https://github.com/xinntao/Real-ESRGAN/blob/master/docs/model_zoo.md
- Documentación de modelos anime: https://github.com/xinntao/Real-ESRGAN/blob/master/docs/anime_model.md
- Documentación de modelos de vídeo anime: https://github.com/xinntao/Real-ESRGAN/blob/master/docs/anime_video_model.md
- Demo en Replicate: https://replicate.com/xinntao/realesrgan
- Demo en Colab: https://colab.research.google.com/drive/1k2Zod6kSHEvraybHl50Lys0LerhyTMCo
- Paquete PyPI: https://pypi.org/project/realesrgan/
