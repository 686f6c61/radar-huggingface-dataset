# Logolabs/agate-preview-001

## Resumen

Agate Preview 001 es un modelo de generación de imágenes a partir de texto (text-to-image) desarrollado por LogoLabs (logolabs.org), empresa dedicada a la generación de logotipos con IA. Se trata de un modelo compacto de 260 millones de parámetros con decodificador TAESD (308,5 M si se usa el decodificador SD-VAE completo) que genera imágenes de 256 × 256 píxeles a partir de prompts en inglés, entrenado íntegramente desde cero. Su relevancia actual radica en que alcanza un GenEval de 0,550 con el scorer oficial, en línea con el 0,55 publicado de SDXL, pero con una fracción muy inferior de parámetros y en 1,9 segundos por imagen en una RTX 4060.

La arquitectura, denominada FCDM-T2, separa la generación en dos especialistas: un «thinker» (pensador), un transformer recurrente pequeño que lee el prompt y planifica un mapa de regiones de 16 × 16 en espacio latente, y un renderizador convolucional tipo U-Net que ejecuta ese plan sobre latentes de SD-VAE. La hipótesis de diseño es que la planificación con atención debe ocurrir en una rejilla gruesa y el pintado debe hacerse con convoluciones, más baratas y con mejores priors de imagen a resolución completa.

El modelo se publica como research preview bajo licencia MIT para código y pesos, acompañado de un informe técnico y una system card. El entrenamiento consumió 144,7 horas de GPU NVIDIA GH200 sobre las 5.654.461 imágenes del dataset FLUX-Reason-6M, con un gasto medido de 81,8 kWh y 2,45 kg de CO₂e para el modelo (176,7 kWh para el proyecto completo). Está orientado a generación de iconos, logotipos planos y experimentación con modelos pequeños que quepan en hardware de consumo o incluso en el navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FCDM-T2: modelo de flujo convolucional (flow matching / rectified flow) guiado por un «thinker» transformer recurrente; renderizador U-Net convolucional sobre latentes SD-VAE |
| Parametros totales | 260 M con decodificador TAESD (190,9 M generador + 68,1 M codificador de texto + 1,2 M TAESD); 308,5 M con decodificador SD-VAE completo |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens de texto (codificador Ettin-68M) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT (código y pesos) |
| Formato de pesos | safetensors; se incluyen pesos de archivo único para ComfyUI en el directorio `comfyui/` |
| Resolución de salida | 256 × 256 píxeles |
| Codificador de texto | Ettin-68M (jhu-clsp/ettin-encoder-68m), ajustado conjuntamente con el generador |
| Decodificador | SD-VAE-ft-MSE (por defecto) o TAESD (para mayor velocidad) |
| Pasos de muestreo | 50 por defecto en las mediciones publicadas |
| Tamaño del repositorio | 3,1 GB |
| Latentes | latentes estándar de SD 1.5 (compatibilidad con ComfyUI) |

## Arquitectura y entrenamiento

Agate implementa una variante de modelo de flujo convolucional (FCDM-T2) con dos componentes acoplados. El «thinker» es un transformer recurrente que ve el lienzo ruidoso completo, recibe información sobre el paso de denoising en curso, aplica cross-attention sobre hasta 512 tokens de texto y dispone de codificación de posiciones 2D, de modo que relaciones como «a la izquierda de» o «encima de» son relaciones espaciales reales. Tras cuatro bucles de razonamiento produce un plan de 16 × 16 regiones en espacio latente. El renderizador es una U-Net convolucional basada en FCDM, con convoluciones de 7 × 7, sin atención y sin acceso al texto: solo sigue el plan. Los planes son visibles ya en el paso 5 de 50. Según el autor, a igual tamaño y época, añadir el thinker elevó GenEval y Qwen-Image-Bench y redujo la pérdida; hacer el planificador recurrente y consciente de la 2D mejoró la posición y el binding de color; y el modelo final vincula colores a objetos mejor que un modelo de 1 B cuyo renderizador lee el texto directamente.

El entrenamiento se hizo desde cero durante 144,7 horas de GH200 (menos de 13 horas de reloj de pared), con 146,9 millones de imágenes vistas, aproximadamente 26 épocas sobre 5.654.461 de las 5.890.279 imágenes de FLUX-Reason-6M, cada una con hasta 8 campos de caption en inglés. El cómputo se realizó en Arrhenius (EuroHPC, NAISS, Suecia) con NVIDIA GH200. El codificador de texto Ettin-68M se ajustó de forma conjunta con el generador. La model card no detalla el uso de RLHF, DPO u otras fases de alineación; menciona que se acompaña de un informe técnico y una system card, y que el modelo aún no ha convergido.

## Capacidades

- Generación de imágenes a partir de texto en inglés a 256 × 256 píxeles, con 50 pasos de muestreo por defecto.
- Composición espacial explícita: colocación de objetos («a la izquierda de», «encima de») gracias a la codificación de posiciones 2D del thinker.
- Binding de color a objeto: asociación correcta entre atributos cromáticos y las entidades descritas.
- Manejo de prompts largos, hasta 512 tokens, con selección de lo relevante mediante cross-attention.
- Generación de rostros y de estilos diversos.
- Generación de logotipos planos e iconos, el caso de uso declarado por el autor.
- Compatibilidad con el ecosistema Diffusers y con ComfyUI mediante latentes estándar de SD 1.5.
- Ejecución en navegador vía WebGPU (demo en Hugging Face Spaces).
- No soporta tool calling, function calling ni razonamiento multi-paso de tipo agente: es un modelo de difusión text-to-image, no un modelo de lenguaje.
- No dispone de modo «thinking» explícito ni capacidades de visión, audio o vídeo.

## Casos de uso

- Generación de iconos y logotipos planos: es el propósito declarado por LogoLabs y una de las fortalezas medidas del modelo. Un estudio de diseño puede generar decenas de variantes en segundos en una GPU de consumo y filtrarlas antes de vectorizar.
- Prototipado rápido de interfaces: generar thumbnails e ilustraciones de relleno para maquetas de UI o presentaciones a 256 px, donde la resolución es suficiente y la latencia de 1,9 s por imagen permite iterar en bucle.
- Aumento de datos sintéticos: producir pares imagen-texto controlados para preentrenar o aumentar clasificadores y modelos de visión, aprovechando el binding de color y la colocación de objetos para etiquetas composicionales.
- Investigación en binding composicional: el plan de 16 × 16 es inspeccionable y ya está definido en el paso 5 de 50, lo que lo hace útil para estudiar cómo se resuelve la asignación de atributos y posiciones en modelos pequeños.
- Despliegue en el navegador o en el borde: el modelo cabe en el repositorio de 3,1 GB y se ejecuta vía WebGPU, lo que permite ofrecer generación de imágenes en cliente sin enviar prompts a un servidor.
- Previsualización rápida en aplicaciones móviles o portátiles sin GPU dedicada: al ser un modelo de 260 M de parámetros, permite bocetos inmediatos antes de lanzar una generación de mayor calidad en otro modelo.
- Integración en pipelines de arte con ComfyUI: los pesos de archivo único y los latentes estándar de SD 1.5 permiten insertar Agate como nodo de borrador o de generación final dentro de un flujo existente (1,7 s por imagen medidos).
- Generación por lotes de assets para videojuegos o apps: sprites, iconos de inventario y elementos de HUD a 256 px, con coste energético bajo (81,8 kWh para todo el entrenamiento, no por inferencia).

## Benchmarks y rendimiento

| Benchmark | Agate Preview 001 | SDXL | SD 2.1 | PixArt-α | SD 1.5 |
|---|---|---|---|---|---|
| GenEval (scorer oficial) | 0,550 | 0,55 | 0,50 | 0,48 | 0,43 |
| Qwen-Image-Bench (1.000 prompts) | 28,2 | no disponible | no disponible | no disponible | 29,1 |

| Métrica de entrenamiento y eficiencia | Valor |
|---|---|
| Cómputo de entrenamiento | 144,7 horas de GH200 (menos de 13 h de reloj de pared) |
| Imágenes vistas | 146,9 M (≈26 épocas) |
| Imágenes del dataset usadas | 5.654.461 de 5.890.279 |
| Energía del modelo | 81,8 kWh y 2,45 kg CO₂e |
| Energía del proyecto completo | 176,7 kWh |
| Latencia (RTX 4060, 50 pasos) | 1,9 s por imagen |
| Latencia (ComfyUI) | 1,7 s por imagen |

## Requisitos de hardware

- Huella de pesos: 260 M parámetros con TAESD o 308,5 M con SD-VAE. En FP16 esto supone del orden de 0,5-0,6 GB solo en pesos; no se publican cifras oficiales de VRAM pico durante la inferencia, por lo que cualquier estimación de VRAM total debe considerarse aproximada.
- Cabe sin problema en GPU de consumo: el autor reporta 1,9 s por imagen a 50 pasos en una RTX 4060, y 1,7 s por imagen en ComfyUI.
- Ejecutable en navegador mediante WebGPU (demo oficial en Hugging Face Spaces), sin GPU dedicada de gama alta.
- GPUs de datacenter (A100, H100, GH200) no son necesarias para inferencia; el GH200 se usó para el entrenamiento.
- Opciones de despliegue: Diffusers/Transformers, ComfyUI (repositorio logolabs/agate-comfyui con pesos de archivo único) y WebGPU en el navegador.
- vLLM, TGI, llama.cpp y Ollama no aplican directamente: no es un modelo de lenguaje y no se publican pesos GGUF.
- Throughput agregado, consumo de VRAM por lote y latencia en otras GPUs: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución nativa | GenEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agate Preview 001 | 260 M (TAESD) / 308,5 M (SD-VAE) | 256 × 256 | 0,550 | MIT | Hugging Face, ComfyUI, WebGPU |
| SDXL | aprox. 2,6 B (U-Net) más codificadores de texto | 1024 × 1024 | 0,55 (publicado) | CreativeML Open RAIL++-M | Hugging Face |
| SD 2.1 | aprox. 865 M (U-Net) | 512 × 512 (base) | 0,50 (publicado) | CreativeML Open RAIL++ | Hugging Face |
| PixArt-α | aprox. 0,6 B | 1024 × 1024 | 0,48 (publicado) | no disponible en esta ficha | Hugging Face |
| SD 1.5 | aprox. 860 M (U-Net) | 512 × 512 | 0,43 (publicado) | CreativeML Open RAIL-M | Hugging Face |

Los recuentos de parámetros de los modelos comparados son aproximaciones de conocimiento público y no proceden de la model card de Agate; las puntuaciones GenEval sí figuran en dicha model card como valores publicados por cada proyecto. En Qwen-Image-Bench, Agate obtiene 28,2 frente a los 29,1 de SD 1.5, y el autor lo sitúa en la frontera de Pareto entre los modelos abiertos de tamaño similar.

## Limitaciones y advertencias

- Texto exacto: el modelo no renderiza texto legible de forma fiable; es una debilidad declarada explícitamente.
- Recuento de objetos: falla con cantidades superiores a tres.
- Negación: no maneja bien instrucciones negativas del tipo «sin X» o «no Y».
- Resolución: no genera por encima de 256 × 256 píxeles de forma nativa.
- Convergencia: el autor indica que el modelo «aún no ha convergido»; es un research preview y no una versión estable.
- Idioma: solo se ha entrenado y validado con prompts en inglés.
- Sesgos: los datos de entrenamiento son FLUX-Reason-6M, con captions generados automáticamente; la model card menciona una sección de seguridad y una system card, pero no se detallan en la información disponible los sesgos específicos medidos ni el filtrado aplicado.
- Alucinación controlada por prompt: al ser un modelo de difusión puede ignorar, añadir o malinterpretar elementos de la descripción, especialmente en prompts largos o ambiguos.
- Licencia: MIT para código y pesos, lo que permite uso comercial, pero al tratarse de un research preview no se ofrecen garantías de calidad ni de idoneidad en producción.
- Requisito de paso del decodificador: las cifras de 260 M asumen TAESD; en el pipeline por defecto con SD-VAE el recuento sube a 308,5 M.
- Sin soporte de cuantización documentado: no se publican pesos GGUF ni recetas de cuantización, lo que limita el despliegue en entornos de muy bajos recursos fuera de los formatos soportados por Diffusers y ComfyUI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Logolabs/agate-preview-001
- Pesos para ComfyUI (directorio del repositorio): https://huggingface.co/Logolabs/agate-preview-001/tree/main/comfyui
- Repositorio ComfyUI: https://github.com/logolabs/agate-comfyui
- Demo WebGPU: https://huggingface.co/spaces/Logolabs/agate-webgpu
- LogoLabs: https://logolabs.org
- Codificador de texto Ettin-Encoder-68M: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Decodificador SD-VAE-ft-MSE: https://huggingface.co/stabilityai/sd-vae-ft-mse
- Decodificador TAESD: https://huggingface.co/madebyollin/taesd
- Dataset FLUX-Reason-6M: https://huggingface.co/datasets/LucasFang/FLUX-Reason-6M
- Referencias arXiv listadas en los tags del repositorio: incluyen, entre otros, arxiv:2603.09408 (informe técnico asociado a la release), arxiv:2210.02747 (flow matching), arxiv:2207.12598 (classifier-free guidance), arxiv:2112.10752 (latent diffusion), arxiv:2103.00020 (CLIP) y una treintena más de identificadores que no se han verificado individualmente en esta ficha.
