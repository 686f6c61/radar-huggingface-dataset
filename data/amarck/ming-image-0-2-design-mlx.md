# amarck/Ming-Image-0.2-Design-MLX

## Resumen

Ming-Image-0.2-Design-MLX es un port no oficial del modelo de generacion de imagenes inclusionAI/Ming-Image-0.2-Design, reimplementado de forma nativa en MLX para Apple Silicon. Lo publica el usuario amarck en Hugging Face y su objetivo es permitir inferencia pura en MLX (sin PyTorch, transformers ni diffusers) sobre chips de Apple, manteniendo la fidelidad numerica respecto a la implementacion original en PyTorch.

El modelo subyacente es un sistema text-to-image orientado a diseno grafico y renderizado de texto, con un encoder de texto BailingMoeV2 (16B totales, 0,8B activos, arquitectura MoE con 256 expertos enrutados), un conector Qwen2 de 1,5B, un diffusion transformer de 6B y un decoder VAE Qwen-Image que produce salida RGBA. Este port cubre unicamente la ruta text-to-image y omite la torre de vision, el LM head y el encoder VAE, reduciendo la descarga a unos 30 GB (32,4 GB de repositorio).

Es relevante porque demuestra que un pipeline de difusion con un encoder MoE de gran tamano puede ejecutarse de forma eficiente en memoria unificada de Apple Silicon: reduce el pico de memoria de 65 GiB a unos 19 GiB a 1024x1024 y acelera la generacion entre un 30% y un 45% frente a la implementacion PyTorch sobre MPS. La licencia es MIT, la misma que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline text-to-image: encoder de texto MoE (BailingMoeV2) + conector Qwen2 + diffusion transformer + VAE decoder (Qwen-Image, RGBA) |
| Parametros totales | 16B (encoder de texto) + 1,5B (conector) + 6B (DiT); total no disponible de forma agregada |
| Parametros activos | 0,8B en el encoder de texto (MoE con 256 expertos enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine (group 64) en el encoder de texto; BF16 en conector, DiT y VAE; se probaron 8-bit/4-bit en el DiT y se descartaron |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX (pesos convertidos, repositorio de 32,4 GB) |

## Arquitectura y entrenamiento

El pipeline combina cuatro componentes. El encoder de texto es un BailingMoeV2 de 16B parametros totales con 0,8B activos, un transformer disperso con 256 expertos enrutados por capa; en este port sus atenciones, MLPs y todos los expertos estan cuantizados a 8 bits (affine, group 64), mientras que routers, normalizaciones y embeddings se mantienen en BF16. El conector es un Qwen2 de 1,5B en BF16 y el diffusion transformer (6B) tambien opera en BF16, ya que las variantes de 8 y 4 bits no aportaron velocidad y degradaron la calidad. El decoder VAE, basado en Qwen-Image con salida RGBA, colapsa exactamente las convoluciones causales 3D a 2D para frames individuales.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO, ya que la model card del port no los detalla. La innovacion tecnica principal de este repositorio es la implementacion MLX: un kernel Metal fusionado para RMSNorm por cabeza mas RoPE de 3 ejes, la eliminacion (no el enmascarado) del padding de alineacion con mascara cero, el uso de `mx.compile` y la liberacion del encoder de texto tras la codificacion de prompts. Los seeds siguen la semantica de `torch.manual_seed` y reproducen el ruido inicial de la implementacion CUDA.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) a resoluciones cuadradas de 1024x1024 o 2048x2048.
- Renderizado de texto dentro de la imagen con alta fidelidad: 94,4% de coincidencia exacta OCR a 1024x1024 y 100% a 2048x2048 sobre 18 cadenas objetivo en 3 prompts.
- Salida en formato RGBA (canal alfa incluido).
- Generacion con 12 pasos por defecto y CFG 1.0 (valor por defecto del modelo original).
- Procesamiento por lotes de prompts desde fichero, codificando primero todos los textos y liberando el encoder para mantener el pico de memoria constante.
- No soporta edicion de imagen, descomposicion en capas ni otras tareas distintas de text-to-image.
- No dispone de tool calling, agentes ni capacidades multimodales de entrada.

## Casos de uso

- Generacion de material grafico de marketing en macOS: creacion de carteles, banners y piezas con texto legible integrado, aprovechando el 100% de coincidencia OCR a 2048x2048 para rotulos y titulares.
- Prototipado de diseno en equipos con portatiles Apple: iteracion rapida de conceptos visuales en local sin GPU dedicada, con imagenes de 1024x1024 en 17-24 segundos en un M5 Max.
- Generacion de assets con transparencia: la salida RGBA permite integrar directamente los resultados en flujos de composicion sin postprocesado de mascara.
- Creacion de ilustraciones para documentacion tecnica o blogs: el modelo renderiza texto dentro de la imagen, util para diagramas rotulados o portadas con titulos.
- Procesamiento por lotes de prompts en pipelines editoriales: la opcion `--prompts-file` permite generar series completas manteniendo el consumo de memoria de una sola imagen.
- Investigacion y experimentacion con MLX: el repositorio incluye scripts de conversion y cuantizacion (`convert.py`, `quantize.py`) que permiten reproducir el checkpoint y estudiar el comportamiento de un encoder MoE de 16B en memoria unificada.
- Evaluacion comparativa de backends: util para medir fidelidad numerica entre CUDA, MPS y MLX con los mismos seeds e inputs.

## Benchmarks y rendimiento

Rendimiento medido en MacBook Pro M5 Max con 128 GB y 12 pasos:

| Metrica | PyTorch upstream en MPS (BF16) | Este repositorio (MLX) |
|---|---|---|
| s/paso a 1024² (prompt corto / largo / cabin) | 1,84 / 2,11 / 2,90 | 1,31 / 1,37 / 1,88 |
| Tiempo por imagen 1024² (incluye carga, codificacion y decodificacion) | 27-37 s | 17-24 s |
| s/paso a 2048² | 12,6 | 7,3 en frio; 9,8-12,6 sostenido (limitado termicamente) |
| Pico de memoria | 65 GiB (1024²), 121 GiB (2048²) | ~19 GiB (1024²), ~24 GiB (2048²) |

Fidelidad frente a la implementacion original:

| Componente | Resultado |
|---|---|
| Token ids, position ids de RoPE 3D, scheduler, ruido con seed | Exacto (diferencia < 5e-7 frente a CUDA) |
| Decoder VAE | 50-55 dB PSNR |
| Velocidad del DiT en el paso 0 | coseno >= 0,9996 frente a CUDA |
| Conector | coseno >= 0,99999 |
| DiT + VAE en FP32 | 38-51 dB frente a PyTorch FP32 en los 12 pasos |
| Encoder de texto BF16 | coseno de capa final 0,988 frente a FP32 (upstream: 0,897) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, al tratarse de un modelo generativo de imagenes.

## Requisitos de hardware

- Memoria unificada minima: 32 GB para 1024x1024; 48 GB recomendados para 2048x2048.
- Pico de memoria medido: ~19 GiB a 1024x1024 y ~24 GiB a 2048x2048.
- Hardware probado: MacBook Pro con M5 Max de 128 GB, macOS 26 y MLX 0.32.5. Otros chips Apple Silicon deberian funcionar pero no estan verificados.
- No requiere GPU dedicada; se ejecuta sobre Metal via MLX.
- Despliegue mediante el paquete `ming_mlx` incluido en el repositorio (no usa vLLM, llama.cpp, Ollama ni TGI, al ser un pipeline de difusion en MLX).
- Requiere Python >= 3.10 y las dependencias de `requirements.txt`.
- Latencia: 17-24 s por imagen a 1024x1024 y 7,3-12,6 s por paso a 2048x2048 en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ming-Image-0.2-Design-MLX (este) | 16B MoE (0,8B activos) + 1,5B + 6B DiT | 1024² o 2048², cuadradas | 17-24 s/imagen a 1024² en M5 Max; OCR 94,4-100% | MIT | Hugging Face (port no oficial) |
| inclusionAI/Ming-Image-0.2-Design | Misma arquitectura | 1024² o 2048² | 27-37 s/imagen a 1024² en MPS; referencia CUDA | MIT | Hugging Face (oficial) |
| Alternativas text-to-image con renderizado de texto | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros modelos de generacion de imagenes con renderizado de texto no esta disponible en la informacion proporcionada; la unica comparacion documentada es frente al modelo original en PyTorch sobre MPS y CUDA.

## Limitaciones y advertencias

- Solo text-to-image: no admite edicion de imagen ni descomposicion en capas.
- Solo resoluciones cuadradas de 1024x1024 o 2048x2048; no se soportan otras proporciones.
- Solo funciona con CFG 1.0, el valor por defecto del modelo original.
- Los pesos en 8 y 4 bits del DiT se descartaron por perdida de calidad y ausencia de mejora en velocidad; el DiT debe ejecutarse en BF16.
- Los tokens de consulta aprendidos del encoder de texto pueden enrutarse de forma distinta a PyTorch en caso de empates exactos de score en algunas capas MoE, aunque las caracteristicas que consume el DiT mantienen coseno >= 0,9997 frente a FP32.
- Las imagenes individuales difieren en detalle fino entre backends (CUDA, MPS, MLX) por la naturaleza caotica de la trayectoria de difusion; incluso una ejecucion exacta en FP32 queda a 22-25 dB de una imagen CUDA BF16.
- Port no oficial, no afiliado ni respaldado por inclusionAI; posibles sesgos del modelo original no documentados en esta ficha.
- Riesgo de alucinacion visual y de errores en el texto renderizado fuera de las condiciones evaluadas (resolucion, idioma y longitud de cadena no especificados).
- Idiomas soportados no disponibles; el rendimiento multilingue no esta verificado.
- Licencia MIT, que permite uso comercial, pero conviene revisar la licencia y condiciones del modelo base inclusionAI/Ming-Image-0.2-Design.
- Probado unicamente en macOS 26 con MLX 0.32.5 sobre M5 Max; otros chips Apple Silicon no estan verificados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amarck/Ming-Image-0.2-Design-MLX
- Modelo base: https://huggingface.co/inclusionAI/Ming-Image-0.2-Design
- MLX (framework): https://github.com/ml-explore/mlx
