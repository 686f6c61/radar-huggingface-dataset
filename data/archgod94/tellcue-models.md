# archgod94/tellcue-models

## Resumen

`archgod94/tellcue-models` no es un modelo de lenguaje, sino un repositorio contenedor de tres modelos ONNX que el editor de vídeo Tellcue descarga en el dispositivo cuando el usuario activa por primera vez una función concreta. Los tres artefactos cubren tareas de posproducción: interpolación de fotogramas (RIFE v4.17 lite), reducción de ruido de voz a 48 kHz (DeepFilterNet3) y borrado de objetos por inpainting en fotografías (MI-GAN). El autor del repositorio es `archgod94`; los pesos y arquitecturas originales pertenecen a terceros (hzwer, HolyWu, Hendrik Schroeter y Picsart AI Research) y aquí solo se redistribuyen en formato ONNX.

El interés técnico del repositorio está en el trabajo de conversión y empaquetado, no en el entrenamiento: los tres grafos se han unificado o reexportado para que funcionen con ONNX Runtime (opset 17, fp32) y acepten resoluciones arbitrarias, lo que permite ejecución local sin depender de Python ni de frameworks de deep learning completos. Es relevante para quien necesite integrar interpolación, denoising de voz o inpainting en aplicaciones de escritorio o móviles con requisitos de privacidad, ya que todo el procesado ocurre en el dispositivo.

El repositorio se creó el 22 de octubre de 2026 y se actualizó el mismo día; en el momento de redactar esta ficha registra 0 descargas, 0 likes y un tamaño declarado de 0.0 GB, por lo que conviene verificar que los ficheros de pesos estén realmente disponibles antes de integrarlo. La licencia del repositorio es MIT, con las licencias originales de cada componente recogidas en el fichero `LICENSE`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tres redes independientes en ONNX: RIFE v4.17 lite (interpolación de fotogramas basada en flujo óptico), DeepFilterNet3 (mejora de voz con ganancias ERB y filtros profundos) y MI-GAN (inpainting generativo tipo GAN) |
| Parámetros totales | No disponible (la model card no publica recuento de parámetros de ninguno de los tres grafos) |
| Parámetros activos | No aplica (ningún componente es MoE) |
| Longitud de contexto | No aplica. RIFE procesa pares de fotogramas; DeepFilterNet3 trabaja sobre ventanas de espectrograma `S`; MI-GAN procesa una imagen y una máscara |
| Tipos de cuantización | No disponible. Los tres grafos se distribuyen en fp32 (RIFE se declara explícitamente como opset 17, fp32); no se documentan variantes int8 o fp16 |
| Idiomas soportados | No disponible. Solo DeepFilterNet3 procesa voz humana; la model card no declara idiomas |
| Licencia | MIT para el repositorio; componentes originales MIT o Apache-2.0 (detallados en `LICENSE`) |
| Formato de pesos | ONNX (opset 17). No hay safetensors ni GGUF |

Interfaces de entrada y salida por componente:

| Componente | Entradas | Salidas |
|---|---|---|
| `rife-v4.17-lite.onnx` | `img0`, `img1` float32 [1, 3, H, W] RGB en 0..1 (H y W múltiplos de 32/scale); `timestep` float32 [1] en 0..1; `scale` float32 [1] con valores 1, 0.5 o 0.25 | `out` float32 [1, 3, H, W] |
| `deepfilternet3.onnx` | `feat_erb` float32 [1, 1, S, 32]; `feat_spec` float32 [1, 2, S, 96] (features libDF con 2 fotogramas de look-ahead) | `m` [1, 1, S, 32] ganancias ERB; `coefs` [1, S, 96, 10] coeficientes del filtro profundo; `lsnr` [1, S, 1] |
| `migan-pipeline-v2.onnx` | `image` uint8 [1, 3, H, W] RGB; `mask` uint8 [1, 1, H, W] con 0 = borrar y 255 = conservar; cualquier resolución | `result` uint8 [1, 3, H, W]; solo cambia la zona enmascarada |

Hashes SHA-256 publicados: RIFE `c0887c5a56dba4f18a766f2c826ae889d92edb719b40e0732817da1241125889`; DeepFilterNet3 `9223f1332c520e942b54a65a5e6e728ae56db7624b9da48c11f4585dc1afddce`; MI-GAN `6f1f3530a1a2324b19752018ce756088b07973cda8d7d890034ace5c8a48c40b`.

## Arquitectura y entrenamiento

Los tres modelos se entrenaron fuera de este repositorio y aquí solo se reconvierten. RIFE v4.17 lite procede de Practical-RIFE: estima flujo óptico bidireccional entre dos fotogramas y sintetiza el intermedio mediante warping, con un `timestep` como entrada continua que permite generar cualquier instante entre 0 y 1. La conversión a ONNX introduce tres cambios respecto al original: la rejilla de flujo se construye dentro del grafo (de ahí que acepte cualquier resolución), la escala de flujo pasa a ser una entrada y los warps de los bloques 1 a 3 se ejecutan al tamaño de bloque en lugar de a tamaño completo, lo que según el autor es aproximadamente el doble de rápido con el mismo resultado (dentro de 0.07 dB sobre fotogramas reales).

DeepFilterNet3, de Hendrik Schroeter, es una red de mejora de voz que opera sobre features libDF: predice ganancias en banda ERB (`m`), coeficientes de un filtro profundo por banda de frecuencia (`coefs`, 10 taps sobre 96 bins) y una estimación de SNR local (`lsnr`). Los tres grafos originales (encoder, decodificador ERB y decodificador de filtro profundo) se han fusionado en uno solo sin alterar los números, y se aplica un look-ahead de 2 fotogramas sobre las features de entrada. MI-GAN, de Picsart AI Research, es una GAN condicionada por máscara para inpainting; se copia sin modificar el pipeline ONNX v2 preconstruido por los autores y publicado en `andraniksargsyan/migan`.

No se dispone de información sobre volumen de datos de entrenamiento, composición del dataset, ni uso de RLHF/DPO (no aplicable en estos dominios). Tampoco se documentan innovaciones de decodificación especulativa ni atención lineal, por no tratarse de modelos autoregresivos de texto.

## Capacidades

- Interpolación de fotogramas entre dos imágenes con control continuo del instante intermedio (`timestep` de 0 a 1) y de la escala de flujo (1, 0.5, 0.25).
- Generación de cámara lenta fluida a partir de metraje existente, y aumento de tasa de fotogramas (por ejemplo, de 24 a 60 fps insertando intermedios).
- Reducción de ruido de voz a 48 kHz con supresión de ruido estacionario y no estacionario, mediante ganancias ERB más filtrado profundo por banda.
- Borrado de objetos en imágenes: la máscara indica qué píxeles eliminar (0) y cuáles preservar (255), y la red rellena solo la zona enmascarada.
- Ejecución completamente local vía ONNX Runtime, sin llamadas a servicios externos.
- Resolución arbitraria en RIFE (con la restricción de múltiplos de 32/scale) y en MI-GAN (cualquier tamaño).
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, function calling, agentes, modo thinking, audio-a-texto ni visión general. No es un modelo multimodal ni un LLM.

## Casos de uso

- Cámara lenta en un editor de vídeo: el editor inserta N fotogramas intermedios entre cada par consecutivo llamando a `rife-v4.17-lite.onnx` con `timestep = k/(N+1)`; el control de `scale` permite degradar a 0.5 o 0.25 en equipos modestos manteniendo el mismo grafo.
- Conversión de metraje de archivo a 50/60 fps: material grabado a 24 o 25 fps se interpola para encajar en una línea de tiempo de emisión sin duplicar fotogramas.
- Limpieza de audio de voz en grabaciones de campo o entrevistas: DeepFilterNet3 elimina ruido de fondo antes de la mezcla final, con la ventaja de que el modelo es pequeño y no requiere GPU dedicada.
- Preprocesado para ASR: aplicar el denoiser antes de enviar el audio a un sistema de reconocimiento reduce inserciones erróneas en entornos ruidosos; al devolver `lsnr`, se puede además segmentar o marcar tramos de baja calidad.
- Eliminación de objetos en fotografía de producto: se pinta una máscara sobre el elemento no deseado y MI-GAN rellena el fondo, útil para catálogos y fichas de e-commerce sin depender de retoque manual.
- Retirada de logotipos, marcas de agua o personas en el fondo de imágenes de stock, con la garantía de que solo se modifica el área enmascarada (`mask` = 0).
- Procesado por lotes offline en una pipeline de escritorio: los tres modelos se pueden encadenar (por ejemplo, limpiar audio de un vídeo y luego interpolar fotogramas) sin salir del equipo, lo que simplifica el cumplimiento de RGPD al no transferir material del usuario.
- Integración en aplicaciones móviles o de escritorio empaquetadas con ONNX Runtime, donde no se quiere incluir PyTorch ni dependencias de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, HumanEval o GSM8K, que no aplicarían, ni métricas de PSNR/SSIM para interpolación, PESQ/STOI para denoising o FID para inpainting).

El único dato cuantitativo declarado por el autor es de eficiencia interna: ejecutar los warps de los bloques 1 a 3 de RIFE al tamaño de bloque en lugar de a tamaño completo es aproximadamente el doble de rápido, con una diferencia de 0.07 dB sobre fotogramas reales. No se especifica qué métrica en dB (presumiblemente PSNR) ni el conjunto de evaluación.

## Requisitos de hardware

- No se publican requisitos de VRAM, latencia ni throughput. El repositorio declara un tamaño de 0.0 GB, insuficiente para estimar el peso real de los tres grafos.
- Diseño previsto: ejecución on-device mediante ONNX Runtime. Los tres modelos están pensados para correr en el equipo del usuario, no en un servidor con GPU.
- RIFE en fp32 con `scale = 1` es el componente más costoso: procesa tensores [1, 3, H, W] completos, por lo que el consumo de memoria crece con la resolución. Con `scale = 0.5` o `0.25` se reduce la resolución interna y, con ello, el coste (inferencia orientativa, no medida).
- MI-GAN procesa imágenes uint8 completas más la máscara; el pico de memoria depende de la resolución de la foto.
- DeepFilterNet3 es el candidato más ligero de los tres y el más apto para CPU en tiempo real, según el propósito del proyecto original (dato no verificable en la información proporcionada).
- GPU recomendadas: no disponibles. Al ser modelos ONNX pequeños, una RTX 4090, A100 o H100 no aportan ventaja clara frente a CPU y solo tendrían sentido para procesado por lotes con `onnxruntime-gpu`.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA/TensorRT), integrado en la aplicación de escritorio. No hay soporte nativo de vLLM, llama.cpp, Ollama ni TGI, que no aplican a estos formatos y tareas.
- No se dispone de cifras de latencia ni de fotogramas por segundo.

## Comparativa con modelos similares

| Componente | Alternativas de la misma categoría | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RIFE v4.17 lite | Practical-RIFE completo (v4.x), FILM, IFRNet | No disponible en esta ficha | Resolución arbitraria con múltiplos de 32/scale | MIT (RIFE) | ONNX en este repo; originales en PyTorch |
| DeepFilterNet3 | DeepFilterNet2, RNNoise, Demucs (voz) | No disponible en esta ficha | Audio a 48 kHz, ventanas de `S` fotogramas | MIT o Apache-2.0 | ONNX fusionado en este repo; original en PyTorch/libtorch |
| MI-GAN | LaMa, MAT, Stable Diffusion inpainting | No disponible en esta ficha | Cualquier resolución de imagen | MIT (MI-GAN) | Pipeline ONNX v2 copiado sin cambios desde `andraniksargsyan/migan` |

No se dispone de datos comparativos de calidad (PSNR, SSIM, PESQ, FID) ni de recuento de parámetros de las alternativas en la información proporcionada, por lo que la comparación se limita a licencia, formato y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier evaluación con benchmarks de LLM carece de sentido.
- El repositorio figura con 0.0 GB y 0 descargas; es posible que los pesos no estén subidos o que se sirvan por LFS. Verificar los SHA-256 publicados antes de confiar en los artefactos.
- Solo se distribuye fp32 en ONNX. No hay versiones cuantizadas, por lo que el ahorro de memoria en dispositivos limitados debe abordarse con `scale` en RIFE o recortando resolución en MI-GAN.
- RIFE impone que H y W sean múltiplos de 32/scale; con `scale = 0.25` la restricción efectiva es múltiplo de 128. Resoluciones no conformes requieren padding manual.
- DeepFilterNet3 trabaja exclusivamente sobre voz a 48 kHz y con features libDF concretas; no es un denoiser genérico de música ni de otras señales, y requiere implementar la extracción de features fuera del grafo (el ONNX no incluye el front-end).
- MI-GAN solo modifica la región enmascarada. Máscaras mal construidas (valores distintos de 0/255) o zonas muy grandes pueden producir resultados pobres; la model card no documenta límites de tamaño de máscara.
- Herencia de licencias: aunque el repositorio es MIT, RIFE y MI-GAN son MIT y DeepFilterNet3 se declara "MIT o Apache-2.0". Hay que revisar `LICENSE` para cumplir la atribución de cada autor original en uso comercial.
- No se declaran idiomas ni sesgos. En denoising de voz, el rendimiento puede degradarse con acentos, idiomas o tipos de ruido poco representados en el entrenamiento original de DeepFilterNet3, dato que no se publica aquí.
- Riesgo de artefactos: la interpolación de fotogramas puede producir halos en oclusiones y movimiento rápido, y el inpainting puede generar texturas incoherentes en fondos estructurados. No hay métricas publicadas que cuantifiquen estos fallos.
- Fecha de creación del repositorio (2026-10-22) posterior a la de esta ficha en algunos entornos; conviene comprobar la integridad y procedencia antes de usarlo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/archgod94/tellcue-models
- Practical-RIFE (hzwer, MIT): https://github.com/hzwer/Practical-RIFE
- vs-rife, release con `flownet_v4.17.lite.pkl` (HolyWu, MIT): https://github.com/HolyWu/vs-rife
- DeepFilterNet (Hendrik Schroeter): https://github.com/Rikorose/DeepFilterNet
- MI-GAN (Picsart AI Research, MIT): https://github.com/Picsart-AI-Research/MI-GAN
- Pipeline MI-GAN ONNX publicado por los autores: https://huggingface.co/andraniksargsyan/migan
