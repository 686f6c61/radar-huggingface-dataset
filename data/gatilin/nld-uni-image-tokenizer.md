# gatilin/nld-uni-image-tokenizer

## Resumen

`gatilin/nld-uni-image-tokenizer` es una extracción comunitaria de los tensores `encoder.vqvae.*` del modelo NVIDIA NLD-Uni, publicada en Hugging Face por el usuario gatilin. No es un modelo generativo completo, sino un componente aislado: contiene únicamente el codificador de imagen, el codebook de cuantización vectorial y el decodificador de imagen del checkpoint original. El puente de imagen empaquetado, el codificador de comprensión RADIO y el backbone de lenguaje de difusión del modelo original no están incluidos.

El artefacto resuelve un problema muy concreto: permitir reutilizar el tokenizador visual discreto de NLD-Uni de forma independiente, sin cargar el resto de la arquitectura. Esto resulta útil para experimentos de generación de imágenes basada en tokens, investigación en cuantización vectorial o pipelines que necesiten convertir imágenes a secuencias discretas y reconstruirlas. Con aproximadamente 455 millones de parámetros y un repositorio de 0,9 GB, es un componente manejable en términos de almacenamiento.

La relevancia es limitada pero específica: al estar extraído de un modelo de NVIDIA con licencia de investigación, su uso comercial está restringido por la sección 3.3 de dicha licencia. La fecha de creación indicada (noviembre de 2026) y el escaso número de descargas (13) sugieren un artefacto de nicho, orientado a investigadores que ya trabajan con NLD-Uni o que quieren experimentar con su tokenizador visual sin depender del checkpoint completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VQ-VAE (codificador de imagen, codebook de cuantización vectorial y decodificador de imagen) extraído de NLD-Uni |
| Parámetros totales | 455.336.963 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | nvidia-research-license (uso limitado a investigación o evaluación no comercial, sección 3.3) |
| Formato de pesos | safetensors, con código Python auxiliar (`vq.py`, `vq_model.py`) |

## Arquitectura y entrenamiento

El componente sigue el esquema de un VQ-VAE: un codificador convolucional transforma la imagen RGB de entrada (normalizada al rango [-1, 1]) en características espaciales, un codebook de cuantización vectorial discretiza esas características en identificadores de token, y un decodificador reconstruye píxeles a partir de las características cuantizadas. El método `model.encode(x)` devuelve tanto las características cuantizadas como los IDs de token, mientras que `model.decode(quantized_features)` produce la reconstrucción. Los nombres, formas, dtype y valores de los tensores se conservan respecto al checkpoint original, y el repositorio incluye `tensor_mapping.json` y `extraction.json` para trazabilidad.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino con RLHF o DPO, ya que la model card solo documenta el proceso de extracción. Los scripts `vq.py` y `vq_model.py` provienen del repositorio del checkpoint original de NVIDIA, y se documenta una prueba de humo en CPU en `validation.json`. La revisión del modelo base utilizada para la extracción es `5db755a2eb0ab84654e3dcf80c7d0245bfe36a50`.

## Capacidades

- Codificación de imágenes RGB a representaciones latentes cuantizadas y a IDs de token discretos.
- Decodificación de características cuantizadas de vuelta a píxeles reconstruidos.
- Cuantización vectorial mediante codebook, apta para pipelines de generación de imágenes basada en tokens.
- Preservación del orden espacial de los tokens, requisito indicado por el autor para su uso en generación de imágenes posterior.
- No incluye generación de texto, razonamiento, código, matemáticas ni visión de comprensión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo texto-a-imagen autónomo: carece del backbone de difusión y del codificador de comprensión.

## Casos de uso

- Investigación en tokenización visual discreta: cargar el componente y analizar cómo el codebook de NLD-Uni discretiza distintas imágenes, comparando la distribución de IDs de token entre dominios visuales.
- Reconstrucción y evaluación de calidad de codebooks: usar `encode` y `decode` para medir la fidelidad de reconstrucción de un VQ-VAE concreto y estudiar el impacto del tamaño del codebook en la pérdida de información.
- Preprocesamiento para pipelines de generación basada en tokens: convertir imágenes de un dataset a secuencias discretas que alimenten un modelo autorregresivo o de difusión discreta propio, aprovechando que el tokenizador ya está entrenado.
- Compresión de imágenes para experimentos de almacenamiento: evaluar la relación entre el número de tokens espaciales y la calidad de reconstrucción como alternativa a codecs tradicionales en entornos de investigación.
- Reproducción de experimentos con NLD-Uni: investigadores que necesiten aislar la parte visual del modelo original para estudiar su comportamiento sin cargar el backbone de lenguaje de difusión.
- Docencia y formación: ilustrar el funcionamiento interno de un VQ-VAE con pesos reales y código mínimo, gracias a que el repositorio incluye scripts de carga y una prueba de humo en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 455 millones de parámetros, los pesos en precisión completa (fp32) ocuparían aproximadamente 1,8 GB, y en fp16 alrededor de 0,9 GB, aunque estas cifras son estimaciones a partir del recuento de parámetros y no datos publicados.
- GPU recomendadas: no disponible; el autor documenta una prueba de humo en CPU, lo que indica que el componente puede ejecutarse sin GPU para validación básica.
- Cabe en GPU de consumo: previsiblemente sí en modelos con 8 GB o más de VRAM, dado el tamaño del repositorio (0,9 GB), aunque no hay confirmación oficial.
- Opciones de despliegue: carga mediante PyTorch con `component.load_model(root)`, requiriendo PyTorch, numpy, accelerate, Pillow y safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, lo cual es esperable al no ser un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/nld-uni-image-tokenizer | 455.336.963 | Tokenizador visual VQ-VAE extraído | no aplica | nvidia-research-license (no comercial) | Hugging Face |
| nvidia/NLD-Uni | no disponible en la información proporcionada | Modelo completo (tokenizador + puente + RADIO + backbone de difusión) | no disponible | nvidia-research-license | Hugging Face |
| Otros tokenizadores VQ-VAE de propósito general | no disponible | VQ-VAE | no aplica | variable | no disponible |

La comparativa se limita al modelo base del que se extrajo el componente, ya que no se dispone de datos verificables de alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo independiente de texto-a-imagen: faltan el puente de imagen empaquetado, el codificador de comprensión RADIO y el backbone de lenguaje de difusión.
- Licencia restrictiva: la sección 3.3 de la NVIDIA License limita el uso a investigación o evaluación no comercial, sujeta a las excepciones indicadas por NVIDIA. No apto para producción comercial sin autorización.
- Riesgo de sesgos y alucinaciones: no aplica en el sentido habitual de un modelo de lenguaje, pero el codebook puede reproducir sesgos presentes en los datos de entrenamiento originales de NLD-Uni, sobre los que no hay información.
- Limitaciones de idioma: no aplica, al no procesar texto.
- Dependencia de código auxiliar: requiere los scripts `vq.py` y `vq_model.py` incluidos, y la carga se realiza mediante una función propia (`component.load_model`), lo que puede complicar la integración con frameworks estándar.
- Escasa validación publicada: solo se documenta una prueba de humo en CPU; no hay métricas de calidad de reconstrucción ni comparativas frente a otros tokenizadores.
- Trazabilidad: los tensores se extrajeron de una revisión concreta del modelo base, por lo que cambios futuros en NLD-Uni no se reflejarán automáticamente.
- Advertencia sobre la fecha: la fecha de creación indicada (2026-11-06) es posterior a la fecha actual, lo que conviene verificar antes de citar el artefacto.

## Enlaces

- [Hugging Face: gatilin/nld-uni-image-tokenizer](https://huggingface.co/gatilin/nld-uni-image-tokenizer)
- [Modelo base: nvidia/NLD-Uni](https://huggingface.co/nvidia/NLD-Uni)
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la búsqueda web proporcionada.
