# Giniiki/FastWan2.2-TI2V-5B-mlx-q8

## Resumen

FastWan2.2-TI2V-5B-mlx-q8 es una conversión cuantizada a 8 bits del modelo de generación de vídeo a partir de imagen FastWan2.2-TI2V-5B-FullAttn-Diffusers, adaptada para ejecutarse de forma eficiente en hardware Apple Silicon mediante la librería MLX. El modelo original es una destilación DMD (Diffusion Model Distillation) de Wan 2.2 TI2V-5B, que reduce el proceso de denoising a solo tres pasos con sigmas fijos, lo que permite generar vídeos de alta calidad de forma muy rápida. Esta versión MLX cuantiza el transformer de difusión (DiT), el codificador de texto umT5-XXL y mantiene el VAE sin cuantizar, logrando un tamaño total de 14,6 GB en disco.

La relevancia de este modelo radica en que democratiza la generación de vídeo de alta resolución (1280×704 a 24 FPS) en equipos Mac con chips M-series, sin necesidad de GPUs NVIDIA de gama alta. El proceso de cuantización utiliza la herramienta mlx-video con mlx 0.32.2, y se han documentado detalles críticos como el mantenimiento de escalas float32 en el T5 para evitar degradación del rendimiento. La licencia Apache-2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para integraciones en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con atencion completa, destilado DMD; VAE de Wan 2.2; codificador de texto umT5-XXL |
| Parametros totales | 1.472.771.264 (solo DiT, segun safetensors; el modelo completo incluye T5 y VAE) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (q8, grupo 64) para DiT y T5; VAE sin cuantizar |
| Idiomas soportados | no disponible (el tokenizer es umT5, que soporta multiples idiomas, pero no se especifican) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es FastVideo/FastWan2.2-TI2V-5B-FullAttn-Diffusers, una destilacion DMD de Wan 2.2 TI2V-5B. La destilacion reduce el numero de pasos de denoising de los 50 habituales a solo 3, con sigmas fijos `[1.0, 0.757, 0.522, 0.0]` y una tecnica llamada renoise. El modelo esta entrenado para generar 121 frames a 24 FPS con resolucion 1280×704. La cuantizacion MLX aplica q8 (8 bits, grupo 64) a las capas lineales de atencion y FFN del DiT, y cuantiza el codificador umT5-XXL manteniendo las escalas en float32 (un detalle critico documentado en la model card: usar escalas bf16 degrada el encoder de 0.023 a 0.042 en error relativo). El VAE se mantiene sin cuantizar. El proceso de conversion se realizo a partir de una version bf16 previa en MLX (lBroth/FastWan2.2-TI2V-5B-MLX) y los archivos de tokenizador se copiaron de Wan-AI/Wan2.2-TI2V-5B.

## Capacidades

- Generacion de video a partir de imagen (image-to-video): acepta una imagen de entrada y genera un clip de video coherente con movimiento.
- Generacion de 121 frames a 24 FPS, lo que equivale a aproximadamente 5 segundos de video a resolucion 1280×704.
- Inferencia rapida gracias a la destilacion DMD: solo 3 pasos de denoising, sin necesidad de CFG (classifier-free guidance).
- Soporte de renoise, una tecnica que anade ruido controlado durante el muestreo para mejorar la calidad temporal.
- Ejecucion optimizada para Apple Silicon mediante MLX, aprovechando la memoria unificada de los chips M-series.
- Cuantizacion 8-bit que reduce el uso de memoria y acelera la inferencia en hardware limitado.

## Casos de uso

- Creacion de contenido para redes sociales: generar clips cortos de 5 segundos a partir de imagenes fijas para publicaciones en Instagram, TikTok o YouTube Shorts. El modelo produce video de alta resolucion en pocos segundos, lo que permite iterar rapidamente en un flujo de trabajo creativo.
- Prototipado de animaciones para diseno y publicidad: los disenadores pueden convertir storyboards o imagenes conceptuales en animaciones preliminares sin necesidad de software de animacion complejo, acelerando la presentacion de ideas a clientes.
- Generacion de secuencias de video para testing de modelos de IA: investigadores pueden crear datasets sinteticos de video a partir de imagenes para entrenar o evaluar modelos de vision por computador, gracias a la licencia Apache-2.0 y la reproducibilidad del proceso.
- Produccion de material educativo: crear animaciones explicativas a partir de diagramas o ilustraciones para cursos online, presentaciones o documentacion tecnica, con un coste computacional reducido al ejecutarse en hardware Apple.
- Generacion de video en tiempo real para aplicaciones interactivas: aunque el modelo no esta disenado para streaming, su velocidad (3 pasos de denoising) permite generar clips bajo demanda en aplicaciones de escritorio o web con Mac.
- Investigacion en destilacion de modelos de difusion: al estar basado en DMD y documentar el proceso de cuantizacion, sirve como referencia para estudiar el impacto de la cuantizacion en modelos de video generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas comparativas de calidad de video ni tiempos de inferencia concretos. Se menciona que el muestreo debe realizarse con el perfil de 121 frames y renoise para evitar la degradacion del clip, pero no hay numeros de rendimiento medidos.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 14,6 GB en disco, pero la cuantizacion 8-bit reduce la memoria en uso. Con MLX, la memoria unificada del Apple Silicon se comparte entre CPU y GPU; se recomienda un Mac con al menos 16 GB de RAM unificada para cargar los tres componentes (DiT, T5 y VAE) de forma comoda.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4 o posteriores). El modelo esta optimizado para la memoria unificada de estos chips; no se soportan GPUs NVIDIA o AMD.
- Capacidad en consumer GPU: no aplica, ya que es especifico de Apple Silicon.
- Opciones de despliegue: la libreria MLX permite integracion con Python. Tambien se puede usar via mlx-video (la herramienta de conversion) o adaptar a otros frameworks que soporten MLX. No hay soporte para vLLM, llama.cpp u Ollama en este formato.
- Latencia y throughput: no disponibles. Se espera una generacion de 5 segundos de video en pocos segundos de computacion, pero no hay datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pasos de denoising | Resolucion | Licencia | Formato |
|---|---|---|---|---|---|---|
| FastWan2.2-TI2V-5B-mlx-q8 (este) | 1,47B (DiT) | no disponible | 3 (DMD) | 1280×704 | Apache-2.0 | MLX q8 |
| FastVideo/FastWan2.2-TI2V-5B-FullAttn-Diffusers | 5B (nominal) | no disponible | 3 (DMD) | 1280×704 | Apache-2.0 | Diffusers (bf16) |
| Wan-AI/Wan2.2-TI2V-5B | 5B | no disponible | ~50 | 1280×704 | Apache-2.0 | Diffusers (bf16) |
| Wan2.2-TI2V-5B-Turbo | 5B | no disponible | 4 | 1280×704 | Apache-2.0 | Diffusers |

La diferencia principal de este modelo es su formato MLX cuantizado, que lo hace especifico para Apple Silicon, mientras que los otros requieren GPUs CUDA. El rendimiento cualitativo deberia ser equivalente al modelo base, salvo por la degradacion inherente a la cuantizacion 8-bit.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al ser un modelo de generacion de video, puede reflejar sesgos presentes en los datos de entrenamiento de Wan 2.2, que no estan detallados.
- Riesgo de alucinacion: como todo modelo generativo, puede producir videos con inconsistencias visuales o movimientos fisicamente imposibles, especialmente en escenas complejas o con multiples objetos.
- Limitaciones de contexto o idioma: el modelo esta disenado para entrada de imagen, no acepta prompts de texto largos ni instrucciones complejas. El soporte de idiomas no esta especificado, aunque el tokenizador umT5 es multilingue.
- Restricciones de licencia para uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, pero se debe mantener la atribucion y los avisos de licencia. No hay restricciones adicionales documentadas.
- Caveat para produccion: la model card advierte que el muestreo debe realizarse exactamente con el perfil de 121 frames y renoise. Desviarse de este perfil (por ejemplo, generar menos frames) degrada la calidad del clip, provocando que la cola del video se disuelva. Ademas, las escalas del T5 deben permanecer en float32; si se re-cuantiza con bf16, el rendimiento del encoder empeora notablemente.
- Limitaciones de hardware: no funciona en GPUs NVIDIA; requiere Apple Silicon con suficiente memoria unificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Giniiki/FastWan2.2-TI2V-5B-mlx-q8
- Modelo base (Diffusers): https://huggingface.co/FastVideo/FastWan2.2-TI2V-5B-FullAttn-Diffusers
- Modelo original Wan 2.2 TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Repositorio FastVideo (incluye soporte MLX): https://github.com/hao-ai-lab/FastVideo
- Repositorio Wan2.2-TI2V-5B-Turbo (referencia de destilacion): https://github.com/quanhaol/Wan2.2-TI2V-5B-Turbo
- Version MLX bf16 previa: https://huggingface.co/lBroth/FastWan2.2-TI2V-5B-MLX
