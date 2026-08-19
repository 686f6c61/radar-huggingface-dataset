# chicagoypark/second-ckpts

## Resumen

El modelo `chicagoypark/second-ckpts` es un checkpoint de un autoencoder variacional (VAE) de tipo `AutoencoderKL` (arquitectura LDM/CompVis) diseñado específicamente para imágenes médicas multimodales. Desarrollado por el usuario chicagoypark, este checkpoint concreto, denominado `kl16_mm3ch_gan_balanced — 130k`, es una continuación de un entrenamiento previo (`kl16_mm3ch_gan_410k.ckpt`) que estaba dominado por la cohorte BraTS. El nuevo entrenamiento reequilibra el muestreo de las cuatro cohortes (BraTS 2023, SynthRAD 2023, CHAOS y AMOS 22) al 25% cada una, para evitar el sesgo hacia un único tipo de imagen.

El modelo comprime imágenes de 256×256×3 píxeles a un espacio latente de 16×16×16 canales (factor de downsampling f=16), con una arquitectura de 66,46 millones de parámetros. Está entrenado con una combinación de pérdidas L1, LPIPS (VGG16), KL y un discriminador patch-GAN, lo que permite reconstrucciones nítidas. Es relevante para la investigación en imagen médica porque proporciona un espacio latente compacto y multimodal que puede servir como base para modelos de difusión latente o generación condicionada, aunque el autor advierte que es de uso exclusivamente investigador y no está validado para uso clínico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AutoencoderKL (encoder-decoder convolucional con atención en encoder, sin atención en decoder) |
| Parametros totales | 66,46 M (312 tensores, fp32) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en fp32, sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint PyTorch (.ckpt) |

## Arquitectura y entrenamiento

La arquitectura es un `AutoencoderKL` de la familia LDM/CompVis, con `embed_dim=16`, `z_channels=16` (con `double_z=True`), canales base `ch=128` y multiplicadores `[1, 1, 2, 2, 4]`, dos bloques residuales por resolución y atención únicamente en la resolución 16 del encoder (el decoder no tiene atención). Esta asimetría se hereda del checkpoint MAR `kl16` del que deriva la línea, por lo que no es compatible con una instanciación estándar de `AutoencoderKL` que incluya atención en el decoder.

El entrenamiento se realizó sobre un total de 1.884 sujetos y 842.114 cortes (slices) entre las cuatro cohortes, con un muestreo balanceado multinomial que sobremuestrea CHAOS (~25× por época) y submuestrea BraTS (~0.14×). El preprocesado incluye normalización por percentiles (1, 99) para MRI, ventana HU fija [-1000, 1000] para CT, recorte de cuerpo, redimensionado a 256×256 y escalado a [-1, 1]. La pérdida combina L1, LPIPS (VGG16), KL con peso 1e-6 y un discriminador patch de 3 capas con peso adaptativo. El optimizador es Adam (β=0.5, 0.9) con LR constante de 2.88e-4, batch efectivo de 96 y se entrenó hasta el paso 130.000, partiendo de los pesos del checkpoint 410k (sin discriminador, que se reinicializó y se calentó durante 2.000 pasos con `disc_weight=0`).

## Capacidades

- Compresión de imágenes médicas multimodales: acepta entradas de 3 canales (MRI, CT o máscaras de segmentación replicadas a 3 canales) y produce un espacio latente de 16×16×16.
- Reconstrucción de alta fidelidad gracias a la combinación de pérdidas perceptuales (LPIPS) y adversarias (patch-GAN), con un equilibrio entre nitidez y fidelidad.
- Soporte para múltiples modalidades: las cohortes incluyen MRI (t1n, t1c, t2w, t2f), CT, y máscaras de segmentación (BraTS `seg`, CHAOS y AMOS con máscaras hepáticas).
- Factor de downsampling f=16, lo que permite una representación latente compacta adecuada para modelos de difusión latente o generación condicionada.
- Entrenamiento balanceado entre cohortes, lo que reduce el sesgo hacia BraTS presente en el checkpoint anterior.
- No incluye capacidades de texto, tool calling, agentes ni razonamiento; es exclusivamente un modelo de compresión visual.

## Casos de uso

- Preprocesamiento para modelos de difusión latente en imagen médica: el VAE puede usarse para codificar imágenes 256×256 en latentes de 16×16×16, que luego alimentan un modelo generativo (p. ej., LDM) para síntesis de imágenes o segmentación.
- Aumento de datos en entornos con pocos datos: al comprimir y reconstruir imágenes de distintas modalidades, puede servir para generar variantes sintéticas de cortes médicos, especialmente en cohortes pequeñas como CHAOS.
- Transferencia entre modalidades: al estar entrenado con MRI, CT y máscaras, el espacio latente podría facilitar tareas de traducción de modalidad (p. ej., CT a MRI) si se combina con un decodificador condicionado.
- Extracción de características para clasificación o segmentación: el encoder puede usarse como extractor de características latentes para downstream tasks, aunque no se han publicado resultados de fine-tuning.
- Investigación en regularización de espacios latentes: el checkpoint balanceado permite estudiar el efecto del muestreo de cohortes en la calidad de reconstrucción y en la distribución del espacio latente.
- Base para experimentos de compresión con pérdida perceptual: al incluir LPIPS y GAN, es útil para comparar métricas de reconstrucción frente a VAE puramente L1 o MSE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la validación de reconstrucción (L1 + LPIPS puro, sin GAN) pasó de 0.0211 (paso 10k) a ~0.0222 y luego se estabilizó, pero no se proporcionan comparaciones con otros modelos ni métricas estandarizadas como PSNR o SSIM.

## Requisitos de hardware

- El modelo tiene 66,46 millones de parámetros en fp32, lo que equivale a aproximadamente 266 MB de pesos (66,46 M × 4 bytes). El checkpoint completo ocupa 45,1 GB en el repositorio, probablemente por incluir otros artefactos o versiones.
- Inferencia en GPU: cabe en cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060, etc.) para procesar una imagen de 256×256.
- Entrenamiento: el batch efectivo de 96 y el uso de discriminador sugieren que se requieren GPUs con al menos 16-24 GB de VRAM (p. ej., A100, RTX 3090/4090) para reproducir el entrenamiento completo.
- Opciones de despliegue: al ser un checkpoint de PyTorch, puede cargarse con `torch.load` y ejecutarse en cualquier framework que soporte PyTorch. No se mencionan integraciones con vLLM, Ollama o TGI (no aplicable a un VAE).
- Latencia y throughput: no disponibles; depende del hardware y de la implementación.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros VAE de imagen médica en la información proporcionada. Como referencia genérica, el `AutoencoderKL` de Stable Diffusion (también de CompVis) tiene una arquitectura similar pero entrenado con imágenes naturales y con un factor de downsampling f=8, mientras que este modelo usa f=16 y está especializado en datos médicos. Sin embargo, no hay métricas publicadas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El factor de escala latente (`0.685155`) del checkpoint anterior no es válido para este modelo; debe reestimarse antes de usarlo con cualquier modelo de espacio latente.
- La validación de reconstrucción pura (L1 + LPIPS) tiende a empeorar ligeramente bajo entrenamiento adversarial (de 0.0211 a ~0.0222), lo que refleja el equilibrio entre fidelidad y nitidez, no una divergencia. No debe juzgarse el modelo solo por ese escalar.
- Uso exclusivamente investigador: entrenado con datasets públicos de investigación (BraTS 2023, SynthRAD 2023, CHAOS, AMOS 22), no validado para uso clínico ni diagnóstico.
- La arquitectura asimétrica (atención solo en encoder) puede causar errores de carga si se instancia un `AutoencoderKL` estándar con atención en el decoder.
- Los datasets fuente tienen sus propias licencias y términos de acceso; el usuario debe verificar el cumplimiento de las condiciones de cada cohorte.
- No se proporcionan garantías de rendimiento en tareas downstream; el espacio latente puede requerir ajuste fino para aplicaciones específicas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/chicagoypark/second-ckpts
- Repositorio original de CompVis latent-diffusion: https://github.com/CompVis/latent-diffusion
- Datasets mencionados: BraTS 2023, SynthRAD 2023, CHAOS, AMOS 22 (acceso sujeto a sus respectivas licencias)
