# DanielClough/music-gen-ace-step-v15-vae-onnx

## Resumen

`DanielClough/music-gen-ace-step-v15-vae-onnx` es una conversión a ONNX Runtime del VAE de audio (AutoencoderOobleck) del modelo de generación musical ACE-Step 1.5, desarrollado por el equipo de ACE-Step. No es un modelo generativo completo, sino un componente de infraestructura: empaqueta el decodificador que transforma latentes en audio estéreo a 48 kHz, el codificador que convierte una grabación de referencia en latentes y el latente de silencio que ACE-Step usa como condicionamiento cuando no hay audio fuente.

El objetivo es permitir la ejecución local de ACE-Step 1.5 sobre ONNX Runtime y CUDA, sin depender de PyTorch en el pipeline de inferencia. El repositorio ocupa 0,7 GB e incluye los grafos exportados en FP32 (sin cuantizar), los ficheros de datos asociados y los scripts de exportación reproducibles.

Es relevante para desarrolladores que quieran integrar generación musical en aplicaciones locales con un stack ONNX, o que necesiten el VAE aislado para tareas de codificación y decodificación de audio en latentes. La conversión mantiene una precisión muy alta respecto al original en PyTorch (error RMS relativo del orden de 1e-6 en el decodificador), lo que la hace apta para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | AutoencoderOobleck (VAE de audio) exportado a ONNX; decodificador y codificador separados |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; el decodificador acepta T de 8 a 4096 frames latentes (hasta ~163 s por ventana), el codificador T de 8 a 15000 frames (hasta ~600 s) |
| Tipos de cuantización | ninguno (FP32); el autor indica que no se ha cuantizado nada |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx` + `.data`), más `silence_latent.bin` en float32 little-endian |

## Arquitectura y entrenamiento

El modelo es el VAE de ACE-Step 1.5 (AutoencoderOobleck), un autocodificador variacional de audio que opera a una tasa de 25 frames latentes por segundo, con 1920 muestras por frame a 48 kHz y 64 canales latentes. La exportación se realizó con diffusers 0.39.0 en FP32 usando `torch.onnx.export(dynamo=True)` con opset 18 y longitud dinámica, y se validó contra PyTorch en CUDA con TF32 desactivado antes de publicarse. El codificador devuelve la media y la desviación típica de la posterior (`std = softplus(scale) + 1e-4`), de modo que el muestreo se hace como `latent_dist.sample()`.

No se ha reentrenado ni cuantizado ningún peso: la única transformación es la conversión de safetensors a ONNX, la separación en decodificador y codificador, la exposición de la posterior como media y desviación típica y la transposición del latente de silencio a float32 crudo en orden temporal. El modelo base es `ACE-Step/Ace-Step1.5` en la revisión `19671f406d603126926c1b7e2adc169acbcade22`; el latente de silencio proviene de `acestep-v15-turbo/silence_latent.pt`, idéntico al de `ACE-Step/acestep-v15-xl-turbo`. No se dispone de información sobre los datos de entrenamiento del VAE original dentro de la información proporcionada.

## Capacidades

- Decodificación de latentes a audio: convierte tensores `[1, 64, T]` en forma de onda estéreo `[1, 2, 1920·T]` a 48 kHz.
- Codificación de audio a latentes: convierte una grabación estéreo a 48 kHz en la posterior latente (media y desviación típica).
- Decodificación por ventanas: admite piezas largas procesando bloques de hasta 512 frames con 64 frames de solapamiento, como hace la decodificación tileada de ACE-Step.
- Condicionamiento de silencio: incluye el latente de silencio que ACE-Step usa cuando no hay audio fuente ni de referencia.
- Integración con ONNX Runtime: grafos con longitud dinámica, ejecutables en CPU o GPU vía `onnxruntime-gpu`.
- Reproducibilidad: los scripts de exportación (`vae_decoder.py`, `vae_encoder.py`, `silence.py`) se incluyen en `export/`.
- No incluye generación de texto, razonamiento, código, tool calling ni capacidades multimodales de texto.

## Casos de uso

- Generación musical local con ACE-Step 1.5: el decodificador permite pasar de latentes generados por el modelo de difusión a audio estéreo a 48 kHz sin PyTorch, integrándose en el runner `music-gen` sobre ONNX Runtime y CUDA.
- Edición musical basada en referencia: el codificador convierte una grabación de 30 s en latentes que pueden reutilizarse como condicionamiento o para tareas de variación estilística, con una correlación espectral de 0,80-0,97 tras recodificar y decodificar.
- Procesamiento por lotes en servidores sin PyTorch: al ser ONNX puro, puede desplegarse en entornos donde solo se permite ONNX Runtime, reduciendo el tamaño de la imagen de contenedor frente a una instalación completa de diffusers y torch.
- Pipelines de audio en tiempo casi real: la tasa de 25 frames por segundo y el soporte de ventanas de 512 frames permiten decodificar fragmentos cortos con baja latencia en GPU consumer.
- Investigación sobre espacios latentes de audio: la exposición explícita de media y desviación típica facilita experimentos de interpolación, muestreo y análisis en el espacio latente del VAE.
- Preprocesado de datasets musicales: el codificador puede usarse para extraer latentes de un corpus de audio y entrenar o ajustar modelos posteriores sobre esa representación.
- Integración en aplicaciones de escritorio: el tamaño de 0,7 GB y el formato ONNX permiten empaquetar el VAE junto a un front-end de generación musical en Mac, AMD, Intel o CUDA, siguiendo el soporte multiplataforma de ACE-Step 1.5.

## Benchmarks y rendimiento

Precisión de la conversión frente a PyTorch FP32, en error RMS relativo, según la model card:

| Grafo | Resultado |
|---|---|
| `vae_decoder` | 7,2e-6 a 128 frames; 6,9e-6 a 512 frames; 6,7e-6 a 750 frames |
| `vae_encoder` (media) | 5,1-5,2e-6 a 250, 750 y 1501 frames |
| `vae_encoder` (desviación típica) | 1,2-1,3e-4 (diferencias absolutas ~7e-8, dado que `std` es ~1e-4) |

Prueba de ida y vuelta: codificar una grabación de 30 s y decodificarla devuelve cada tramo de 10 s a su nivel original, con correlación espectral de 0,80-0,97.

No se han publicado resultados de benchmarks de calidad musical (FAD, CLAP, etc.) en la información disponible para este repositorio; esos datos corresponderían al modelo ACE-Step 1.5 completo, no al VAE aislado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con grafos FP32 de 0,34 GB por componente, la inferencia cabe holgadamente en GPUs con 4-8 GB, dependiendo del tamaño de lote y de la longitud de ventana.
- GPU recomendadas: cualquier GPU compatible con `onnxruntime-gpu` 1.24.4 y CUDA; para decodificación por ventanas de 512 frames, una RTX 3060 o superior es suficiente; A100/H100 aportan mayor throughput en lotes grandes.
- GPU consumer: sí, cabe en RTX 4090, RTX 3090, RTX 4060 Ti y similares; también puede ejecutarse en CPU con `onnxruntime`, a mayor latencia.
- Despliegue: ONNX Runtime (CPU o GPU), integrable en el runner `music-gen`; no se distribuye en GGUF ni en formato para llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| `DanielClough/music-gen-ace-step-v15-vae-onnx` | VAE de audio ACE-Step 1.5 (decodificador + codificador + latente de silencio) | ONNX FP32 | MIT | Hugging Face, 0 descargas |
| `ACE-Step/Ace-Step1.5` (VAE original en `vae/`) | VAE de audio ACE-Step 1.5 | safetensors (diffusers) | MIT | Hugging Face |
| `ACE-Step/acestep-v15-base` | Modelo completo de generación musical texto-a-música | safetensors | no disponible en la información | Hugging Face |
| `ACE-Step/acestep-v15-xl-turbo` | Modelo completo de generación musical, variante turbo | safetensors | no disponible en la información | Hugging Face |

La comparación directa con otros VAE de audio (por ejemplo, los de Stable Audio o MusicGen) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: sin el modelo de difusión de ACE-Step 1.5 no produce música; solo codifica y decodifica audio.
- El decodificador está limitado a T de 8 a 4096 frames por llamada; para piezas más largas hay que aplicar decodificación por ventanas con solapamiento, como indica el autor.
- El codificador admite hasta 15000 frames (~600 s); grabaciones más largas deben trocearse.
- La desviación típica del codificador es muy pequeña (~1e-4), por lo que pequeñas diferencias absolutas en `std` pueden tener un impacto relativo mayor en el muestreo.
- No se han publicado evaluaciones de calidad perceptual del audio decodificado en este repositorio; la validación se limita a error numérico y correlación espectral.
- Licencia MIT, que permite uso comercial, pero se mantiene el copyright original (c) 2026 ACEStep; conviene conservar el aviso de licencia y citar el trabajo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- Al ser una conversión de terceros (DanielClough), no está mantenida oficialmente por el equipo de ACE-Step; posibles cambios en el modelo base no se reflejarán automáticamente.

## Enlaces

- Hugging Face: https://huggingface.co/DanielClough/music-gen-ace-step-v15-vae-onnx
- Modelo base: https://huggingface.co/ACE-Step/Ace-Step1.5
- Repositorio GitHub de ACE-Step 1.5: https://github.com/ace-step/ACE-Step-1.5
- Variante base: https://huggingface.co/ACE-Step/acestep-v15-base
- Variante turbo XL: https://huggingface.co/ACE-Step/acestep-v15-xl-turbo
