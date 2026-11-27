# kandinskylab/KVAE-2D-3.0

## Resumen

KVAE-2D-3.0 es un autoencoder variacional (VAE) de imagen desarrollado por Kandinsky Lab, disenado especificamente como tokenizer latente para modelos de difusion. Codifica imagenes RGB en una representacion continua compacta con un factor de submuestreo espacial de 8x y 32 canales latentes, que despues alimentan a un diffusion transformer para la generacion de imagenes. Su relevancia actual radica en que reduce el numero de parametros un 61% respecto a su predecesor (KVAE-2D-2.1) manteniendo e incluso mejorando las metricas de reconstruccion.

El modelo tiene 85,6 millones de parametros y una arquitectura convolucional con atencion en los cuellos de botella del encoder y del decoder. Incorpora una innovacion clave: durante el entrenamiento, una sonda de ocho bloques basada en SiT-XL/2 predice caracteristicas extraidas por un encoder DINOv2 ViT-B/14 congelado, alineando el espacio latente con caracteristicas semanticas utiles para la generacion posterior. Esto lo diferencia de VAEs puramente reconstructivos como los de FLUX.1 o FLUX.2.

En las evaluaciones publicadas, KVAE-2D-3.0 supera a FLUX.2 VAE en PSNR y SSIM en reconstruccion sobre COCO val2017, y logra el menor FD-CLIP tras 200K pasos de entrenamiento de un diffusion transformer de 2B parametros, lo que lo posiciona como un componente de referencia para pipelines de difusion de nueva generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE convolucional con atencion en cuellos de botella (encoder + decoder), sonda de alineacion SiT-XL/2 durante entrenamiento |
| Parametros totales | 85.568.323 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, inferencia en bfloat16 segun model card) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch, model_hub_mixin) |

## Arquitectura y entrenamiento

KVAE-2D-3.0 es un VAE de imagen que comprime altura y anchura por un factor de 8 y produce 32 canales latentes. Frente a KVAE-2D-2.1, reduce la etapa residual mas profunda de 1.024 a 512 canales y anade self-attention en los cuellos de botella tanto del encoder como del decoder. La arquitectura es puramente convolucional con atencion puntual en los bottlenecks, lo que la hace eficiente en comparacion con alternativas puramente transformer.

El entrenamiento se realiza en dos fases. En la primera, el tokenizer y una sonda de ocho bloques basada en SiT-XL/2 se entrenan conjuntamente durante 600.000 pasos sobre recortes de 256x256 de un dataset interno. La sonda recibe latentes ruidosos del VAE, condicionada por el nivel de ruido, y predice caracteristicas extraidas de imagenes limpias por un DINOv2 ViT-B/14 congelado; la perdida de alineacion entrena conjuntamente sonda y encoder. En la segunda fase, el encoder se congela y el decoder se refina sobre recortes aleatorios de 512x512 usando perdidas pixelwise, perceptuales y adversariales, preservando la representacion latente aprendida.

## Capacidades

- Codificacion de imagenes RGB a latentes continuos con submuestreo 8x y 32 canales.
- Decodificacion de latentes a imagenes reconstruidas en el rango [-1, 1].
- Alineacion semantica del espacio latente con caracteristicas DINOv2, pensada para mejorar la generacion con diffusion transformers.
- Reconstruccion de alta fidelidad medida en PSNR, SSIM y LPIPS.
- Integracion como modulo de un pipeline de difusion texto-a-imagen (entrenado junto a Kandinsky 5 DiT de 2B parametros).
- No soporta tool calling, agentes ni capacidades multilingues: es un componente de vision, no un modelo generativo de lenguaje.

## Casos de uso

- Tokenizer en pipelines de difusion texto-a-imagen: se usa como primer y ultimo modulo del pipeline (encoder de imagenes de entrenamiento y decoder de latentes generados), sustituyendo a VAEs de referencia como FLUX.2 VAE con menor coste de parametros y mejor reconstruccion.
- Compresion de imagenes para almacenamiento de datasets de entrenamiento: al reducir 8x en cada dimension espacial con 32 canales, permite almacenar representaciones latentes compactas en lugar de pixeles crudos, util para datasets de gran escala.
- Investigacion en espacios latentes para difusion: la alineacion con DINOv2 facilita estudiar como la estructura semantica del latente afecta a la calidad de generacion, con metricas FD-CLIP reproducibles.
- Preprocesado en entrenamiento de diffusion transformers: al ser ligero (85,6M parametros) y rapido de ejecutar en bfloat16, se puede usar como encoder congelado en pipelines de entrenamiento con muchas GPU.
- Reconstruccion y evaluacion de fidelidad visual: util como baseline en estudios de compresion de imagen perceptual, con resultados publicados sobre COCO val2017.
- Fine-tuning de decoders para dominios especificos: la separacion encoder/decoder y la licencia MIT permiten refinar solo el decoder sobre recortes de 512x512 para dominios concretos (medico, satelite, etc.) sin tocar el encoder.

## Benchmarks y rendimiento

Reconstruccion sobre las 5.000 imagenes de COCO val2017 (escala nativa, recorte central a multiplo de 32, media posterior decodificada en bfloat16):

| Tokenizer | Canales latentes | Parametros | PSNR (dB) | SSIM | LPIPS (AlexNet) |
|---|---:|---:|---:|---:|---:|
| FLUX.1-dev | 16 | 83,8M | 29,89 | 0,8662 | 0,0234 |
| FLUX.2-dev | 32 | 84,0M | 31,37 | 0,8924 | 0,0167 |
| KVAE-2D-2.1 | 32 | 218,4M | 32,15 | 0,9057 | 0,0264 |
| KVAE-2D-3.0 | 32 | 85,6M | 32,18 | 0,9070 | 0,0258 |

Generacion durante entrenamiento de difusion (FD-CLIP, menor es mejor; 3.000 prompts en ingles, 256x256, 50 pasos, guidance 5, shift 5):

| Tokenizer | FD-CLIP a 100K pasos DiT | FD-CLIP a 200K pasos DiT |
|---|---:|---:|
| KVAE-2D-3.0 | 13,66 | 12,72 |
| KVAE-2D-2.1 | no disponible | 13,30 |
| FLUX.2 VAE | 13,63 | 13,05 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 85,6M parametros, en bfloat16 ocupa aproximadamente 0,17 GB de pesos, por lo que cabe en cualquier GPU consumer con holgura.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA 12.8 (entorno de referencia: Python 3.11, PyTorch 2.8.0). Funciona en RTX 3060, RTX 4090, A100, H100, etc.
- Cabe en GPU consumer: si, sin restricciones practicas de memoria para el modelo en si; el limitante real es la resolucion de imagen y el tamano de lote.
- Opciones de despliegue: repositorio oficial kvae (PyTorch) con `KVAEImage.from_pretrained`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son para LLMs).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Canales latentes | Parametros | PSNR COCO | SSIM COCO | Licencia |
|---|---|---:|---:|---:|---:|---|
| KVAE-2D-3.0 | VAE imagen | 32 | 85,6M | 32,18 | 0,9070 | MIT |
| KVAE-2D-2.1 | VAE imagen | 32 | 218,4M | 32,15 | 0,9057 | no disponible |
| FLUX.2 VAE | VAE imagen | 32 | 84,0M | 31,37 | 0,8924 | no disponible |
| FLUX.1-dev VAE | VAE imagen | 16 | 83,8M | 29,89 | 0,8662 | no disponible |

Frente a FLUX.2 VAE, KVAE-2D-3.0 mejora PSNR (+0,81 dB) y SSIM (+0,0146) con practicamente el mismo numero de parametros, aunque FLUX.2 obtiene mejor LPIPS (0,0167 frente a 0,0258). Frente a KVAE-2D-2.1, reduce parametros un 61% manteniendo metricas de reconstruccion equivalentes o ligeramente superiores.

## Limitaciones y advertencias

- No es un modelo generativo autonomo: solo codifica y decodifica imagenes; la generacion requiere un diffusion transformer externo.
- No soporta texto, tool calling, agentes ni capacidades multilingues; no debe evaluarse como LLM.
- La alineacion semantica depende de DINOv2 ViT-B/14; cambios en ese encoder o su version pueden alterar el comportamiento del latente.
- El entrenamiento se realizo sobre un dataset interno no detallado, lo que limita la reproducibilidad y puede introducir sesgos de dominio no documentados.
- La licencia MIT permite uso comercial, pero el model card no detalla restricciones adicionales sobre el dataset de entrenamiento.
- Riesgo de artefactos en reconstruccion en imagenes con alta frecuencia espacial o contenido fuera de distribucion (no cuantificado en la informacion disponible).
- La altura y anchura de entrada deben ser divisibles por 8 (y por 32 en la evaluacion publicada).
- El technical report de la version 3.0 esta marcado como "coming soon"; solo hay reporte tecnico de la version anterior.

## Enlaces

- Hugging Face: https://huggingface.co/kandinskylab/KVAE-2D-3.0
- Project page: https://kandinskylab.ai/open-source-kvae-3-en.html
- GitHub: https://github.com/kandinskylab/kvae
- Paper anterior (arXiv:2608.05798): https://huggingface.co/papers/2608.05798
- KVAE-Video 3.0: https://huggingface.co/kandinskylab/KVAE-3D-3.0
- KVAE-Audio-Stereo: https://huggingface.co/kandinskylab/KVAE-Audio-Stereo
- KVAE-Image 2.0: https://huggingface.co/kandinskylab/KVAE-2D-2.0
- KVAE-Image 1.0: https://huggingface.co/kandinskylab/KVAE-2D-1.0
