# moonbox-ai/Real-ESRGAN-MLX

## Resumen

Real-ESRGAN MLX es una conversión a MLX del modelo Real-ESRGAN x4plus, el modelo de superresolución de imágenes de propósito general desarrollado originalmente por Xintao Wang y colaboradores (publicado en el paper arXiv:2107.10833). Esta versión la publica moonbox-ai como port nativo para Apple Silicon, de modo que puede ejecutarse sobre el framework MLX de Apple sin depender de PyTorch ni de CUDA. El modelo realiza upscaling 4x de imágenes RGB con un único paso de red convolucional y procesamiento por teselas de 256 píxeles.

El modelo original resuelve el problema de restaurar imágenes de baja calidad afectadas por degradaciones reales y complejas (ruido, desenfoque, compresión JPEG, artefactos de reescalado), un escenario más difícil que el superresolución clásico con degradaciones sintéticas simples. La relevancia de esta conversión concreta es la disponibilidad en Macs con chip Apple Silicon: el repositorio incluye dos builds (fp16 y bf16) con pesos safetensors de 33,5 MB cada uno, scripts de carga y métricas de fidelidad frente al modelo PyTorch original.

Arquitectónicamente es una red generativa adversarial con generador RRDB (Residual-in-Residual Dense Block) y un discriminador U-Net con espectro de alta frecuencia durante el entrenamiento; en inferencia solo se usa el generador. No es un modelo de lenguaje: no tiene parámetros en el sentido de un transformer, no procesa texto y no admite cuantización de 8, 6 o 4 bits porque todas sus capas son convolucionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN con generador RRDB (Residual-in-Residual Dense Block) y discriminador U-Net; solo se distribuye el generador |
| Parametros totales | no disponible (pesos de 33,5 MB en fp16/bf16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp16 y bf16 exclusivamente; no hay builds de 8, 6 o 4 bits porque MLX no cuantiza capas convolucionales |
| Idiomas soportados | no aplica (procesamiento de imágenes) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (MLX), acompañado de `config.json` y `mlx_model.py` |
| Factor de escala | 4x |
| Resolución de entrada | arbitraria, procesada por teselas de 256 px |
| Tamaño del repositorio | 0,1 GB |
| Librería | mlx (solo requiere `mlx` y `numpy`) |

## Arquitectura y entrenamiento

El generador es una red totalmente convolucional basada en bloques RRDB, la misma arquitectura que ESRGAN, con conexiones residuales densas anidadas que permiten un campo receptivo amplio y una reconstrucción de alta frecuencia detallada. El entrenamiento original de Real-ESRGAN emplea un esquema de degradación de alto orden que simula degradaciones reales encadenadas (desenfoque, ruido, compresión, reescalado) y combina pérdidas perceptuales, adversariales y de contenido para producir resultados nítidos sin los artefactos típicos de las pérdidas puramente pixel-wise. El discriminador U-Net con entrada de espectro de alta frecuencia se usa solo durante el entrenamiento.

Esta conversión concreta no reentrena nada: parte de los pesos originales de `RealESRGAN_x4plus.pth` en la revisión `a4abfb2979` del repositorio oficial, los carga en MLX y los almacena en bf16 o fp16. Cada build se validó contra el modelo PyTorch fp32 con las mismas entradas, midiendo PSNR y LPIPS. El build fp16 alcanza 54,3 dB de PSNR medio y 46,9 dB en el peor caso, con LPIPS máximo de 0,0004; el build bf16 baja a 40,8 dB de media y 30,7 dB en el peor caso, con LPIPS de 0,015. La inferencia usa teselado de 256 px para controlar el uso de memoria en imágenes grandes.

## Capacidades

- Superresolución de imágenes 4x sobre fotografías de propósito general (modelo x4plus).
- Restauración de imágenes con degradaciones reales: ruido, desenfoque, artefactos de compresión JPEG y reescalados previos.
- Procesamiento de imágenes RGB de resolución arbitraria mediante teselado interno de 256 px.
- Ejecución nativa en Apple Silicon a través de MLX, sin CUDA ni PyTorch en tiempo de inferencia.
- API mínima en Python: `mlx_model.load(precision)` y `mlx_model.upscale(model, array)`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni vídeo de forma nativa.
- No incluye los modelos específicos para anime (`RealESRGAN_x4plus_anime_6B`) ni el modelo de vídeo de anime.

## Casos de uso

- Restauración de fotografías antiguas o escaneadas: el modelo corrige ruido de escaneo, desenfoque y artefactos de compresión antes de un 4x, lo que lo hace adecuado para digitalización de archivos familiares o patrimoniales en un Mac.
- Mejora de miniaturas y material gráfico para web: se puede integrar en un script de preprocesado que reciba imágenes de baja resolución y genere versiones 4x antes de subirlas a un CDN, con latencia de 0,25-0,28 s por imagen de 130x130 en un M5.
- Preprocesado para pipelines de visión por computador: aumentar la resolución de imágenes de entrada antes de un detector o clasificador cuando el dataset original es de baja calidad, aprovechando que el modelo reduce artefactos reales en lugar de solo interpolar.
- Herramientas de escritorio para macOS: al ejecutarse sobre MLX y pesar 33,5 MB por build, puede empaquetarse en una app nativa de Apple Silicon para upscaling local sin conexión ni servicios en la nube.
- Restauración de capturas de pantalla y documentos: mejora de imágenes de interfaces, texto renderizado y capturas comprimidas antes de incluirlas en documentación técnica o presentaciones.
- Prototipado e investigación en superresolución: el código `mlx_model.py` (4,8 kB) y las métricas de fidelidad publicadas permiten comparar implementaciones MLX frente a PyTorch con una referencia clara de PSNR y LPIPS.
- Procesamiento por lotes en local: el teselado de 256 px permite procesar imágenes grandes en Macs con memoria unificada limitada, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

Métricas de fidelidad frente al modelo PyTorch fp32 original, publicadas por el autor en la model card:

| Precision | Tamaño | PSNR vs PyTorch fp32 (media / peor) | LPIPS (peor) | Tiempo, ~130x130 a 4x en M5 |
|---|---|---|---|---|
| fp16 | 33,5 MB | 54,3 / 46,9 dB | 0,0004 | 0,25 s |
| bf16 | 33,5 MB | 40,8 / 30,7 dB | 0,015 | 0,28 s |

No se han publicado resultados de benchmarks estándar (Set5, Set14, Urban100, DIV2K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; en Apple Silicon se usa memoria unificada. Con pesos de 33,5 MB y teselas de 256 px, el consumo es bajo y depende del tamaño de la imagen de salida.
- GPU recomendadas: cualquier Mac con Apple Silicon compatible con MLX (la model card cita un M5 para las mediciones de tiempo); no se soportan GPUs NVIDIA ni AMD en esta build.
- Cabe en cualquier Mac moderno con Apple Silicon; no requiere GPU dedicada.
- Despliegue: MLX en Python (`mlx` y `numpy`), con los archivos `model.safetensors`, `config.json` y `mlx_model.py` de cada carpeta de precisión. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 0,25 s (fp16) y 0,28 s (bf16) para una entrada de ~130x130 a 4x en un M5. No se han publicado cifras de throughput para imágenes mayores.

## Comparativa con modelos similares

| Modelo | Tipo | Factor | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Real-ESRGAN MLX (este) | GAN RRDB, port MLX | 4x | BSD-3-Clause | Hugging Face, pesos safetensors fp16/bf16 | Solo Apple Silicon; sin builds cuantizados |
| Real-ESRGAN x4plus original | GAN RRDB, PyTorch | 4x | BSD-3-Clause | GitHub oficial, pesos `.pth` | Referencia de calidad; requiere PyTorch |
| RealESRGAN_x4plus_anime_6B | GAN RRDB, PyTorch | 4x | BSD-3-Clause | GitHub oficial | Especializado en ilustración/anime, no incluido en este repo |
| SwinIR | Transformer (Swin) | 2x/4x/8x | Apache-2.0 | GitHub oficial | Alternativa basada en transformer; no disponible en MLX en la información consultada |

## Limitaciones y advertencias

- El build bf16 presenta una deriva notable en algunas imágenes (PSNR mínimo de 30,7 dB frente a 46,9 dB del fp16); para producción conviene usar fp16 salvo que se priorice velocidad o memoria.
- No existen builds de 8, 6 o 4 bits: MLX no cuantiza capas convolucionales y el modelo, con 33,5 MB, no obtiene beneficio de ello.
- Solo se incluye el modelo x4plus de propósito general; no se incluyen los modelos de anime ni el de vídeo del repositorio original.
- El pipeline completo del repositorio original no está portado: solo se convierten los pesos y el código de inferencia listados; el resto debe tomarse del repositorio de Xinntao si se necesita.
- Riesgo de alucinación visual: como toda GAN de superresolución, puede inventar texturas y detalles plausibles que no estaban en la imagen original, especialmente en caras y texto pequeño.
- El modelo está entrenado para fotografías de propósito general; su comportamiento en dominios muy específicos (médico, satelital, microscopía) no está validado en la información disponible.
- Licencia BSD-3-Clause: permite uso comercial, pero exige conservar el aviso de copyright y la cláusula de no aval; los archivos son derivados del modelo original y heredan su licencia.
- No hay datos publicados sobre sesgos demográficos ni sobre el rendimiento en distintos grupos de imágenes; la evaluación se limita a PSNR y LPIPS frente al modelo PyTorch.
- Dependencia exclusiva de Apple Silicon: no es desplegable en servidores Linux con GPU NVIDIA sin recurrir al modelo PyTorch original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-ai/Real-ESRGAN-MLX
- Repositorio original de Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Paper (arXiv:2107.10833): https://arxiv.org/abs/2107.10833
- Demo en Replicate: https://replicate.com/xinntao/realesrgan
- Demo en Colab: https://colab.research.google.com/drive/1k2Zod6kSHEvraybHl50Lys0LerhyTMCo?usp=sharing
- Documentación de modelos de anime: https://github.com/xinntao/Real-ESRGAN/blob/master/docs/anime_model.md
- Documentación de modelos de vídeo de anime: https://github.com/xinntao/Real-ESRGAN/blob/master/docs/anime_video_model.md
- Model zoo: https://github.com/xinntao/Real-ESRGAN/blob/master/docs/model_zoo.md
- Página de MLX: https://github.com/ml-explore/mlx
