# LibreYOLO/LibrePRX512-dc-ae

## Resumen

LibrePRX512-dc-ae es un espejo (mirror) del modelo de generación de imágenes texto-a-imagen PRX de Photoroom, en su variante de resolución nativa 512, con autoencoder DC-AE de factor 32 y codificador de texto T5Gemma de 2B. El repositorio lo publica LibreYOLO, autor del framework de visión por computador homónimo bajo licencia MIT, con el objetivo de ofrecer un punto de descarga estable y verificado dentro de su ecosistema de generación (`libreyolo generate`). No se ha reentrenado, convertido ni recodificado ningún peso: los ficheros son idénticos byte a byte a los del repositorio original de Photoroom.

El modelo subyacente es un transformer de difusión de 1.3B parámetros entrenado desde cero por Photoroom, con un codificador de texto T5Gemma de 2B y el autoencoder DC-AE de 32x de compresión. Se distribuye como modelo base pensado para fine-tuning, no como un modelo afinado para producción. La resolución nativa es 512x512 y el pipeline declarado es `text-to-image` sobre `diffusers`.

Su relevancia actual radica en dos factores: por un lado, la licencia Apache-2.0 de los pesos PRX permite uso comercial sin las restricciones típicas de otros modelos de imagen abiertos; por otro, el espejo incluye hashes SHA-256 de cada fichero, lo que facilita la verificación de integridad en pipelines de despliegue. Conviene tener en cuenta que el codificador de texto T5Gemma queda sujeto a los Términos de Uso de Gemma, lo que introduce una asimetría de licencias dentro del propio repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (text-to-image) con codificador de texto T5Gemma 2B y autoencoder DC-AE 32x |
| Parametros totales | 1.3B en el transformer de difusion (mas 2B del codificador de texto T5Gemma; total del pipeline no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precision original) |
| Idiomas soportados | no disponible (el codificador T5Gemma es multilingue, pero no se documenta cobertura por idioma) |
| Licencia | Apache-2.0 para los pesos PRX; T5Gemma bajo Gemma Terms of Use; DC-AE bajo MIT |
| Formato de pesos | safetensors (layout de pipeline `diffusers`: `text_encoder/`, `transformer/`, `vae/`) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión de 1.3B parámetros entrenado desde cero por Photoroom, según indica la model card. La arquitectura sigue el paradigma de difusión latente: un codificador de texto T5Gemma de 2B produce las representaciones condicionantes, un transformer de difusión opera en el espacio latente y el autoencoder DC-AE con factor de compresión 32x se encarga de la codificación y decodificación entre píxeles y latentes. La resolución nativa es 512, lo que reduce el coste computacional frente a modelos de 1024 o superiores.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF, DPO u otro tipo de ajuste por preferencias. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El repositorio de LibreYOLO no aporta detalles de entrenamiento: es un espejo que preserva el layout del pipeline de `diffusers` y los hashes SHA-256 de cada fichero, sin modificaciones.

## Capacidades

- Generación de imágenes a partir de descripciones textuales, en resolución nativa 512x512.
- Modelo base orientado a fine-tuning: sirve como punto de partida para ajustar estilos, dominios o conceptos concretos.
- Integración con `diffusers`: el layout del repositorio permite cargar la carpeta directamente como pipeline.
- Integración con la librería `libreyolo`: API `LibreGen("prx-512-dc-ae")` y comando `libreyolo generate prompt=... model=prx-512-dc-ae`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingües: no documentadas explícitamente; dependen del codificador T5Gemma, sin cobertura por idioma especificada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Fine-tuning de estilo visual: al ser un modelo base de 1.3B con resolución 512, se puede ajustar con LoRA o fine-tuning completo sobre un dataset propio de imágenes y captions para especializarlo en un dominio (ilustración, producto, arquitectura) con un coste de cómputo contenido frente a modelos de 1024.
- Generación de imágenes en pipelines de CI/CD: el espejo incluye hashes SHA-256 de cada fichero, lo que permite verificar la integridad de los pesos en cada despliegue y detectar descargas corruptas o manipuladas.
- Prototipado rápido de producto: la API de una línea de `libreyolo` (`LibreGen("prx-512-dc-ae")`) permite generar imágenes de prueba en scripts de exploración sin montar un pipeline de `diffusers` manualmente.
- Generación de assets para aplicaciones con requisitos de licencia permisiva: los pesos PRX son Apache-2.0, lo que facilita su incorporación en productos comerciales, siempre que se respeten las condiciones del codificador T5Gemma.
- Investigación en difusión latente: el uso de un DC-AE de 32x con un transformer de 1.3B lo convierte en una plataforma compacta para experimentar con autoencoders de alta compresión y estudiar el equilibrio entre calidad y coste latente.
- Evaluación comparativa de codificadores de texto: al combinar T5Gemma 2B con un transformer de difusión pequeño, permite aislar el impacto del codificador de texto en la calidad de generación frente a otros pipelines.
- Generación de imágenes en entornos con VRAM limitada: la resolución 512 y el tamaño de 1.3B del transformer reducen los requisitos frente a modelos de mayor tamaño, lo que facilita su ejecución en GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio ocupa 16.4 GB en safetensors (incluyendo transformer, text encoder T5Gemma 2B y VAE); la inferencia en fp16 requeriría del orden de 8-10 GB de VRAM para los pesos, más el overhead de activaciones, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar ejecución viable en GPUs consumer de gama alta (RTX 3090, RTX 4090) y en GPUs de datacenter (A100, H100), pero no hay datos oficiales.
- ¿Cabe en GPU consumer? Probablemente sí en GPUs con 12-24 GB de VRAM, aunque no se confirma en la información disponible.
- Opciones de despliegue: `diffusers` (carga directa del repositorio), librería `libreyolo` con extra `libreyolo[gen]` (API Python y CLI). No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de imagen en este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| LibrePRX512-dc-ae (PRX 512) | 1.3B (transformer) + 2B (T5Gemma) | 512x512 nativo | Apache-2.0 (pesos) + Gemma Terms (text encoder) | Hugging Face, `diffusers`, `libreyolo` |
| FLUX.1 (referencia citada en NOTICE) | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible en la informacion |
| DC-AE SANA 1.1 (origen del autoencoder) | no aplica (solo VAE) | factor 32x | MIT | Hugging Face (`mit-han-lab/dc-ae-f32c32-sana-1.1-diffusers`) |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoría (por ejemplo, Stable Diffusion 1.5/2.1, SDXL Turbo o modelos de 512 px de otros autores). La comparativa queda limitada a los elementos documentados.

## Limitaciones y advertencias

- Es un modelo base, no afinado: la calidad de generación out-of-the-box será inferior a la de modelos ajustados para producción; está pensado como punto de partida para fine-tuning.
- Licencia mixta: los pesos PRX son Apache-2.0, pero el codificador T5Gemma está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, que restringen ciertos usos. Es imprescindible revisar `LICENSE` y `NOTICE` antes de un despliegue comercial.
- El autoencoder DC-AE proviene de `mit-han-lab/dc-ae-f32c32-sana-1.1-diffusers` (MIT); el NOTICE upstream menciona el VAE de FLUX.1 para todos los checkpoints, lo que conviene verificar para evitar confusiones de atribución.
- Resolución nativa limitada a 512x512: no se documenta soporte para resoluciones superiores ni para aspect ratios distintos del cuadrado.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe más allá de lo que ofrezca T5Gemma.
- Sesgos conocidos: no documentados en la información disponible; como todo modelo entrenado con datos web a gran escala, es probable que herede sesgos de representación, pero no se aportan datos concretos.
- Riesgo de alucinación visual: no cuantificado; no hay estudios publicados sobre fidelidad prompt-imagen para este checkpoint.
- Repositorio espejo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación comunitaria del espejo.
- No se documentan requisitos de hardware ni latencias, lo que dificulta la planificación de capacidad en producción.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/LibreYOLO/LibrePRX512-dc-ae
- Repositorio upstream (Photoroom): https://huggingface.co/Photoroom/prx-512-t2i-dc-ae
- Anuncio de Photoroom: https://huggingface.co/blog/Photoroom/prx-open-source-t2i-model
- Autoencoder DC-AE (origen): https://huggingface.co/mit-han-lab/dc-ae-f32c32-sana-1.1-diffusers
- Repositorio GitHub de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Documentación de LibreYOLO: https://www.libreyolo.com/docs
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
