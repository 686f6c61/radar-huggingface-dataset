# flow-craft/wan-vae-minecraft-128-224

## Resumen

`wan-vae-minecraft-128-224` es un autoencoder variational (VAE) especializado para video, obtenido por ajuste fino (fine-tuning) del `AutoencoderKLWan` que acompaña al modelo `Wan-AI/Wan2.2-TI2V-5B-Diffusers`. Lo desarrolla el equipo de FlowCraft (Aidan Scannell y colaboradores) y forma parte de su proyecto de un modelo del mundo (world model) autorregresivo y en tiempo real para Minecraft. Su funcion no es generar video por si mismo, sino comprimir fotogramas de gameplay de Minecraft a un espacio latente de baja dimension y reconstruirlos, de modo que sirva como pieza de codificacion/decodificacion del pipeline mayor de FlowCraft.

El modelo resuelve un problema muy concreto: los VAE genericos de Wan estan entrenados sobre video natural a resoluciones altas, y su reconstruccion sobre el dominio estrecho y estilizado de Minecraft a 128x224 (alto x ancho) no es optima. Este ajuste adapta el decodificador del VAE a ese dominio y formato, y es el VAE con el que se codificaron los latentes del dataset `flow-craft/minecraft-latents-128-224-v2`. Es relevante ahora porque los world models de video dependen criticamente de la calidad del VAE: un decodificador mal ajustado degrada toda la generacion aguas abajo, y publicar el VAE de forma abierta (Apache-2.0) facilita la reproducibilidad de los latentes y del entrenamiento del modelo mayor.

Tecnicamente se trata de un VAE convolucional 3D (espacial y temporal) con unos 704,7 millones de parametros, contexto temporal de 17 fotogramas y solo el decodificador ajustado, entrenado con perdidas L1, LPIPS perceptual y una KL muy debil. No es un modelo de lenguaje ni un generador: es un componente de infraestructura para pipelines de difusion de video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE convolucional 3D (AutoencoderKLWan de diffusers), encoder/decoder espaciotemporal |
| Parametros totales | 704.688.668 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 17 fotogramas (ctx_len_fr) por clip |
| Tipos de cuantizacion | no disponible (pesos en float32; sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo de imagen/video, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria diffusers) |
| Modelo base | Wan-AI/Wan2.2-TI2V-5B-Diffusers (subcarpeta `vae`) |
| Resolucion de entrenamiento | 128x224 (alto x ancho) |
| Tamano del repo | 2.8 GB |
| Paso de entrenamiento | 42500 |
| Mejor val/loss | 0.6624489867687225 (min, step 42500) |

## Arquitectura y entrenamiento

El modelo reutiliza el `AutoencoderKLWan` de la familia Wan 2.2, un VAE 3D que comprime video en latentes con reduccion espacial y temporal. El ajuste fino se aplica unicamente al decodificador (`finetune: decoder`), manteniendo el encoder del modelo base. El entrenamiento se hizo en precision mixta bfloat16 sobre CUDA, con batch de 12, learning rate 1e-5, optimizador AdamW (betas 0.9/0.999, weight decay 0) y hasta 150000 pasos planificados; el mejor checkpoint se guardo en el paso 42500 segun la metrica de validacion `val/loss`.

La funcion de perdida combina L1 (peso 3.0), LPIPS perceptual con red VGG aplicada sobre fotogramas (peso 3.0) y un termino KL muy debil (peso 3e-6), sin perdida temporal (temporal_w = 0.0) y sin GAN (use_gan = false). Los datos son fotogramas RGB muestreados de los videos de gameplay de Minecraft publicados por OpenAI en su proyecto Video-Pre-Training (VPT), con contexto de 17 fotogramas y prediccion de 16; la evaluacion usa 60 fotogramas y 512 clips de validacion / 1024 de test. El VAE se entrena para reconstruir episodios independientemente de las acciones. La configuracion usa metricas PSNR, SSIM y LPIPS sobre 256 muestras.

## Capacidades

- Codificacion de fotogramas de Minecraft a latentes y decodificacion de vuelta a video RGB a 128x224.
- Reconstruccion de video de gameplay en el dominio especifico de Minecraft (entrenado sobre datos VPT).
- Compresion espaciotemporal util para pipelines de difusion de video y world models.
- Compatibilidad nativa con la libreria `diffusers` mediante `AutoencoderKLWan`.
- Generacion de latentes del dataset `minecraft-latents-128-224-v2` (codificados con este mismo VAE).
- No soporta tool calling, function calling, agentes, razonamiento ni capacidades multilingues: no es un modelo linguistico.
- No incorpora modo thinking, vision semantica, audio ni comprension de texto.

## Casos de uso

- Entrenamiento de world models de video: usar el VAE para codificar streams de gameplay de Minecraft a latentes compactos y entrenar sobre ellos un modelo autorregresivo, reduciendo la carga computacional frente a operar en pixeles.
- Reproduccion de latentes de FlowCraft: decodificar el dataset `flow-craft/minecraft-latents-128-224-v2` para inspeccionar visualmente la calidad de reconstruccion y validar el pipeline.
- Investigacion en modelos del mundo para entornos de agente: sirve como componente de compresion en entornos tipo Minecraft donde el agente necesita predecir estados futuros en espacio latente.
- Fine-tuning de difusion de video sobre Minecraft: integrar este VAE en un pipeline de difusion (por ejemplo, con `Wan2.2-TI2V-5B`) para que el modelo generativo trabaje en el espacio latente correcto del dominio.
- Benchmarking de VAEs de video: medir PSNR, SSIM y LPIPS de reconstruccion a 128x224 sobre clips de Minecraft como referencia frente a VAEs genericos.
- Prototipado de videojuegos y contenido sintetico: generar o reconstruir fotogramas estilizados de Minecraft para demos de investigacion en generacion de video.
- Base para experimentos de reduccion de latentes: estudiar el impacto del ajuste del decodificador en la fidelidad visual de un VAE heredado de un modelo de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la informacion disponible. La model card solo reporta la metrica interna de validacion:

| Metrica | Valor | Modo | Paso |
|---|---|---|---|
| val/loss | 0.6624489867687225 | min | 42500 |

Las metricas de evaluacion configuradas (PSNR, SSIM, LPIPS sobre 256 muestras) no incluyen valores numericos publicados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un VAE de ~704,7 M de parametros en float32, los pesos ocupan aproximadamente 2,8 GB; con activaciones para clips de video (17 fotogramas a 128x224) es razonable prever un consumo de VRAM de varios GB, aunque no se publica una cifra oficial.
- GPU recomendadas: no disponible de forma oficial. Por tamano, cabe en GPUs de consumo alto (por ejemplo, RTX 3090/4090 con 24 GB) y con holgura en A100/H100; no se confirma soporte en GPUs de gama baja.
- Cabe en consumer GPU: probablemente si en GPUs con 16 GB o mas, pero no hay dato oficial; ejecutar en CPU es posible pero lento para video.
- Opciones de despliegue: `diffusers` (carga directa con `AutoencoderKLWan.from_pretrained`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un VAE).
- Latencia y throughput: no disponibles. Se recomienda bfloat16/float32 segun la configuracion de entrenamiento; el modelo base usa float32.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Resolucion / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wan-vae-minecraft-128-224 (este) | ~704,7 M | VAE de video (decoder ajustado) | 128x224, 17 fotogramas | Apache-2.0 | Hugging Face, diffusers |
| AutoencoderKLWan (Wan2.2-TI2V-5B) | no disponible | VAE de video generico (base) | resolucion alta, video natural | Apache-2.0 | Hugging Face, diffusers |
| `flow-craft/minecraft-latents-128-224-v2` | no aplica (dataset) | Conjunto de latentes | 128x224 | no disponible | Hugging Face Datasets |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: entrenado solo con gameplay de Minecraft (OpenAI VPT); no se espera buen rendimiento fuera de ese dominio ni en video natural generico.
- Solo se ajusta el decodificador; el encoder permanece el del modelo base, por lo que la codificacion puede no estar tan adaptada al dominio como la decodificacion.
- Resolucion fija de 128x224; no se documenta comportamiento en otras resoluciones o relaciones de aspecto.
- No es un modelo generativo ni linguistico: no debe usarse para texto, razonamiento o tareas multimodales semanticas.
- Riesgo de artefactos de reconstruccion (perdida de detalle fino) inherente a la compresion latente; los valores PSNR/SSIM/LPIPS no se publican, por lo que la fidelidad real no esta cuantificada en la informacion disponible.
- Licencia Apache-2.0 heredada del modelo base: permite uso comercial, pero conviene revisar los terminos del modelo base Wan2.2 y de los datos de origen (OpenAI VPT).
- Sin datos de sesgo, ya que no procesa contenido semantico ni lenguaje; el sesgo potencial se limita al dominio visual de los datos de entrenamiento.
- Modelo de baja adopcion (21 descargas, 0 likes) y creado en 2026: ecosistema y soporte limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flow-craft/wan-vae-minecraft-128-224
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Dataset de latentes: https://huggingface.co/datasets/flow-craft/minecraft-latents-128-224-v2
- Organizacion FlowCraft: https://huggingface.co/flow-craft
- Pagina del proyecto FlowCraft: https://www.aidanscannell.com/flowcraft/
- Documentacion de AutoencoderKLWan (diffusers): https://huggingface.co/docs/diffusers/main/en/api/models/autoencoderkl_wan
- Repositorio OpenAI Video-Pre-Training: https://github.com/openai/Video-Pre-Training
