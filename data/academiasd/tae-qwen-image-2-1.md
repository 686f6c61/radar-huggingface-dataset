# AcademiaSD/TAE-Qwen-Image-2.1

## Resumen

TAE Qwen-Image 2.1 es un decodificador Tiny AutoEncoder (estilo TAESD) desarrollado por AcademiaSD para previsualizar en tiempo real las latentes del modelo de generación de imágenes Qwen-Image 2.1 dentro de ComfyUI. No es un modelo generativo ni un modelo de lenguaje: es un autoencoder diminuto de 1,63 millones de parámetros que convierte las latentes de 64 canales que maneja el sampler en una imagen RGB a 16× la resolución de la latente, con un coste de unos 15 ms por previsualización de 1024×1024 en una RTX 5080 en fp16.

El problema que resuelve es concreto: ComfyUI solo ofrece Latent2RGB como método de previsualización para Qwen-Image 2.1, una proyección lineal de 64 a 3 colores que produce imágenes borrosas y bloqueadas. Este decodificador se destila del VAE real de Qwen-Image 2.1 y alcanza 30,1 dB de PSNR frente a los 20,9 dB de Latent2RGB, sin necesidad de cargar el VAE completo durante el muestreo. El modelo docente, Qwen-Image 2.1, es el sistema unificado de generación y edición de imágenes de la familia Qwen, con 7.000 millones de parámetros en su componente visual (32 capas DiT single-stream), lo que da contexto a la relevancia de una previsualización barata durante la inferencia.

La ficha del repositorio es reciente y con métricas de adopción muy bajas (0 descargas, 11 me gusta en el momento de la consulta), el fichero pesa 3,3 MB en fp16 y se distribuye bajo licencia Apache 2.0. Su utilidad es puramente instrumental: acelera la iteración sobre prompts, semillas y LoRAs sin penalizar el tiempo de generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador TAESD plano: `Clamp → conv → 4 × (3 bloques + upsample 2× + conv) → bloque → conv`, anchura 64 |
| Parámetros totales | 1,63 M |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (decodificador de latentes, sin ventana de contexto textual) |
| Tipos de cuantización | no se documentan variantes; distribuido en fp16 |
| Idiomas soportados | no aplica (no procesa texto; la entrada son latentes) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16), fichero `TAEQwenImage21_AcademiaSD.safetensors` |
| Entrada | latentes de Qwen-Image 2.1, 64 canales, tal como los ve el sampler (`x0`) |
| Salida | RGB a 16× la resolución de la latente, rango [0, 1] |
| Tamaño del fichero | 3,3 MB (fp16) |

## Arquitectura y entrenamiento

La arquitectura es un decodificador TAESD plano con anchura 64, compuesto por una capa de recorte (clamp), una convolución inicial, cuatro etapas de tres bloques convolucionales con upsampling 2× y convolución, un bloque final y una convolución de salida. A diferencia de los TAESD convencionales, que decodifican a 8× la resolución de la latente, este decoder trabaja a 16×, que es el factor de compresión del VAE de Qwen-Image 2.1. Las latentes se normalizan con el formato `QwenImage21` de ComfyUI (media y desviación típica), el mismo espacio que maneja el sampler en su `x0`, por lo que no hace falta ningún reescalado adicional entre el sampler y el decodificador.

El entrenamiento se realizó por destilación del VAE docente de Qwen-Image 2.1 (`qwen_image_2.1_vae_bf16.safetensors`) sobre 4.072 imágenes variadas, recortadas a 512×512 y codificadas una sola vez con el VAE real. Se ejecutaron 30.000 pasos con batch 8 sobre teselas de 256×256, optimizador AdamW con LR 5e-4 y decaimiento coseno, pérdida L1 combinada con pérdida FFT y media móvil exponencial (EMA 0,999). Se aplicó aumento de ruido sobre las latentes para que las previsualizaciones sean estables también en los primeros pasos de muestreo, cuando el `x0` todavía es muy ruidoso.

## Capacidades

- Decodificación de latentes de Qwen-Image 2.1 (64 canales) a imágenes RGB a 16× de resolución.
- Previsualización en vivo durante el bucle de denoising de ComfyUI, mostrando la evolución de la imagen paso a paso.
- Decodificación rápida: aproximadamente 15 ms por previsualización de 1024×1024 en RTX 5080 en fp16.
- Calidad de previsualización de 30,1 dB de PSNR frente a la decodificación del VAE real en la validación del autor, frente a 20,9 dB de Latent2RGB.
- Estabilidad sobre latentes ruidosas de los primeros pasos gracias al entrenamiento con aumento de ruido.
- Integración con ComfyUI mediante el nodo Model Preview Override de ComfyUI-KJNodes.
- No dispone de codificador: no puede convertir imágenes a latentes.
- No genera texto, no soporta tool calling ni razonamiento; no es un modelo de lenguaje.

## Casos de uso

- Previsualización en vivo en ComfyUI: colocado entre el modelo Qwen-Image 2.1 y el sampler, permite ver la imagen formándose paso a paso con una latencia de 15 ms, en lugar de esperar la decodificación completa del VAE al final del muestreo.
- Barrido rápido de prompts y semillas: al no tener que decodificar con el VAE real en cada iteración, se pueden comparar decenas de variantes de prompt, CFG o scheduler en una fracción del tiempo y descartar las malas antes de una decodificación final.
- Evaluación de LoRAs y ajustes finos de Qwen-Image 2.1: durante el entrenamiento o la selección de checkpoints, la previsualización continua permite detectar colapso, sobreajuste o pérdida de estilo sin coste apreciable de cómputo.
- Entornos con VRAM limitada: el decodificador ocupa 3,3 MB, por lo que se puede mantener cargado junto al modelo en GPUs donde cargar el VAE completo en paralelo resulta problemático.
- Depuración de pipelines de difusión: al operar exactamente en el espacio de latentes `x0` del sampler, sirve para inspeccionar visualmente qué está ocurriendo en cada paso y detectar problemas de normalización o de escala de latentes.
- Servidores de generación con varias peticiones concurrentes: el coste marginal de decodificación es despreciable frente al coste del DiT, de modo que se puede ofrecer previsualización en streaming a los clientes sin degradar el throughput del servicio.
- Investigación sobre destilación de autoencoders: el autor documenta la receta completa (docente, dataset, esquema de pérdidas, hiperparámetros), lo que lo convierte en una referencia reproducible para destilar decodificadores TAESD de otros VAEs de 16×.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son métricas de validación de la previsualización, no benchmarks de generación de imágenes:

| Métrica | TAE-Qwen-Image-2.1 | Latent2RGB (por defecto en ComfyUI) |
|---|---|---|
| PSNR de validación | 30,1 dB | 20,9 dB |
| Método | Decodificador TAESD destilado | Proyección lineal 64→3 |
| Tiempo de decodificación | ~15 ms (1024×1024, RTX 5080, fp16) | no disponible |
| Parámetros | 1,63 M | 0 (proyección fija) |

No se han publicado resultados de FID, LPIPS, CLIP score ni de calidad de generación final, ya que el modelo no interviene en la imagen definitiva. Tampoco hay comparativa numérica con el VAE real más allá de la referencia de PSNR.

## Requisitos de hardware

- VRAM estimada: no se publica un desglose; el peso del modelo es de 3,3 MB en fp16, por lo que el consumo adicional es marginal y queda dominado por las activaciones del propio modelo de difusión.
- GPU recomendadas: cualquier GPU con soporte fp16, desde GTX 1050/1660 hasta RTX 4090, RTX 5080 o aceleradores de datacenter (A100, H100). El autor mide 15 ms en una RTX 5080.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer moderna, e incluso en iGPU o CPU, dado el tamaño de 1,63 M de parámetros.
- Opciones de despliegue: ComfyUI con la extensión ComfyUI-KJNodes y el nodo Model Preview Override, guardando el fichero en `ComfyUI/models/vae_approx/`. El método TAESD integrado en ComfyUI no lo detecta, porque el cargador del core solo admite decodificadores de 8×. No aplica a vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: ~15 ms por previsualización de 1024×1024 en RTX 5080 en fp16 (dato del autor). No se publican datos de throughput ni de latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución de salida | PSNR validación | Tiempo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TAE-Qwen-Image-2.1 (AcademiaSD) | Decodificador TAESD destilado | 16× la latente | 30,1 dB | ~15 ms (1024×1024, RTX 5080) | Apache 2.0 | HuggingFace |
| Latent2RGB (ComfyUI) | Proyección lineal 64→3 | 16× la latente | 20,9 dB | no disponible | no disponible | Integrado en ComfyUI |
| VAE real de Qwen-Image 2.1 | VAE completo (encoder + decoder + alfa) | 16× la latente | referencia (no aplica) | no disponible | no disponible | HuggingFace (Qwen) |
| TAESD genérico (madebyollin) | Decodificador TAESD | 8× la latente | no disponible para Qwen-Image 2.1 | no disponible | no disponible | GitHub |

La comparativa relevante es contra Latent2RGB, la única alternativa que ComfyUI ofrece de serie para este modelo, y contra el VAE real, que es el que debe usarse para la decodificación final. Los TAESD convencionales no son compatibles con el cargador del core de ComfyUI para Qwen-Image 2.1 por su factor de 8×.

## Limitaciones y advertencias

- Solo previsualización: la imagen final debe decodificarse siempre con el VAE real de Qwen-Image 2.1. Usar este decodificador como salida definitiva produce degradación de calidad.
- Solo decoder: no existe codificador, por lo que no sirve para invertir imágenes a latentes ni para tareas de edición que requieran codificación.
- Solo RGB: el VAE de Qwen-Image 2.1 también decodifica un canal alfa que este decodificador omite, de modo que las previsualizaciones con transparencia no son fieles.
- Incompatibilidad con el método TAESD nativo de ComfyUI: el core no tiene entrada para Qwen-Image 2.1 y su cargador solo admite decodificadores de 8×. Es obligatorio instalar ComfyUI-KJNodes.
- Diferencia perceptible respecto al VAE real, coherente con los 30,1 dB de PSNR: colores, texturas finas y detalles de alta frecuencia pueden desviarse. No es una herramienta válida para evaluar calidad final.
- Sesgos potenciales del dataset de destilación: 4.072 imágenes a 512×512, sin información publicada sobre su composición. Dominios poco representados (texto fino, rostros, ilustración concreta) pueden previsualizarse peor.
- Estabilidad limitada en los primeros pasos del muestreo: aunque se entrenó con aumento de ruido sobre las latentes, en los pasos iniciales la latente es muy ruidosa y la previsualización puede ser poco informativa.
- Licencia Apache 2.0 para este decodificador, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen-Image 2.1 y del VAE docente antes de distribuirlo en un producto.
- Métricas escasas: no hay FID, LPIPS ni evaluación humana publicada; la única cifra objetiva es el PSNR de validación aportado por el propio autor.
- Adopción muy baja en el momento de la consulta (0 descargas, 11 me gusta) y repositorio de 0,0 GB en los metadatos, lo que limita la validación independiente de los resultados.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/AcademiaSD/TAE-Qwen-Image-2.1
- Arquitectura TAESD original (madebyollin): https://github.com/madebyollin/taesd
- Nodo Model Preview Override (ComfyUI-KJNodes): https://github.com/kijai/ComfyUI-KJNodes
- Qwen-Image 2.1 en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio GitHub de Qwen-Image 2.1: https://github.com/QwenLM/Qwen-Image-2.1
- README de Qwen-Image 2.1 en GitHub: https://github.com/QwenLM/Qwen-Image-2.1/blob/main/README.md
- Qwen Image 2.1 en Civitai: https://civitai.com/models/2954443/qwen-image-21
- YouTube de AcademiaSD: https://www.youtube.com/@Academia_SD
- X / Twitter de AcademiaSD: https://twitter.com/Academia_S_D
- Discord de AcademiaSD: https://discord.gg/Syuaduy678
- Ko-fi de AcademiaSD: https://ko-fi.com/academiasd
