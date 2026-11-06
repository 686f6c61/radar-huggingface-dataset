# LibreYOLO/LibrePRX512-sft-distilled

## Resumen

LibrePRX512-sft-distilled es un espejo (mirror) del modelo de generación de imágenes texto-a-imagen PRX de Photoroom, en su variante de 512 píxeles nativos con ajuste fino supervisado (SFT) destilado a 8 pasos de muestreo. No se trata de un modelo nuevo: los pesos son byte a byte idénticos a los del repositorio upstream `Photoroom/prx-512-t2i-sft-distilled`, y el repositorio lo publica la organización LibreYOLO para integrarlo en su librería `libreyolo`. El modelo base es un transformer de difusión de 1.3B parámetros entrenado desde cero por Photoroom, acompañado de un codificador de texto T5Gemma de 2B y el VAE de FLUX.1.

La relevancia de esta ficha reside en que PRX es uno de los pocos modelos texto-a-imagen entrenados desde cero y publicados con licencia Apache-2.0 por una empresa, lo que permite uso comercial amplio sin las restricciones habituales de otros modelos abiertos. La variante destilada a 8 pasos reduce el coste de inferencia de forma notable frente a los 50 pasos típicos de los modelos de difusión estándar, lo que la hace atractiva para despliegues en producción con requisitos de latencia ajustados.

El repositorio ocupa 15.5 GB en safetensors y mantiene el layout de pipeline de `diffusers`, por lo que se puede cargar directamente con esa librería además de con el wrapper `LibreGen` de LibreYOLO. Al cierre de esta ficha el repositorio no registra descargas ni likes, lo que refleja su carácter reciente y de espejo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (text-to-image) con codificador de texto T5Gemma 2B y VAE de FLUX.1 |
| Parámetros totales | 1.3B (transformer de difusión); el codificador de texto T5Gemma añade 2B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento por prompt de texto, sin ventana de contexto declarada) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos PRX y VAE FLUX.1); T5Gemma 2B bajo Gemma Terms of Use |
| Formato de pesos | safetensors (layout de pipeline `diffusers`) |

## Arquitectura y entrenamiento

PRX es un transformer de difusión para generación de imágenes condicionada por texto, entrenado desde cero por Photoroom, con resolución nativa de 512 píxeles. El pipeline combina tres componentes: el transformer de difusión de 1.3B parámetros, un codificador de texto T5Gemma de 2B que transforma el prompt en embeddings, y el VAE de FLUX.1 [schnell] (Apache-2.0) para codificar y decodificar entre espacio latente y píxeles. La variante aquí publicada es un ajuste fino supervisado (SFT) que ha sido destilado para funcionar con 8 pasos de muestreo, en lugar de los 50 o más habituales en modelos de difusión no destilados.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF/DPO) en la información proporcionada. La model card indica explícitamente que este repositorio es un espejo: no se ha reentrenado, convertido ni recodificado ningún peso, y todos los ficheros son idénticos a los del upstream, conservando su revisión `cb72bdc1f4c77126fb80d0c03fab156ee5f4df3a`. Los hashes SHA-256 de cada fichero se publican en la model card para verificación de integridad.

## Capacidades

- Generación de imágenes a partir de descripciones en lenguaje natural (text-to-image) con resolución nativa de 512 píxeles.
- Muestreo destilado a 8 pasos, lo que reduce el coste computacional de inferencia frente a pipelines de difusión estándar.
- Integración directa con `diffusers` gracias al layout de pipeline conservado.
- Integración con la librería `libreyolo` mediante el wrapper `LibreGen`, tanto en Python como en CLI.
- Condicionamiento por prompt de texto mediante el codificador T5Gemma 2B.
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo de razonamiento (thinking), al tratarse de un modelo de generación de imágenes.

## Casos de uso

- Generación de ilustraciones para prototipado rápido: el modelo produce imágenes de 512 px en 8 pasos, lo que permite iterar sobre conceptos visuales en segundos y validar direcciones artísticas antes de encargar producción final.
- Creación de assets para videojuegos y aplicaciones: la licencia Apache-2.0 de los pesos PRX permite generar sprites, texturas o fondos para productos comerciales sin las restricciones de otros modelos abiertos.
- Generación de imágenes en pipelines de CI/CD: al cargarse con `diffusers` y con `libreyolo`, se puede integrar en scripts automatizados que generen imágenes de prueba o mockups en cada build.
- Herramientas de diseño asistido: un editor puede ofrecer generación de variaciones visuales a partir de un prompt, con la ventaja de que la inferencia en 8 pasos mantiene la latencia baja en GPUs de consumo.
- Investigación en modelos de difusión: al ser un modelo entrenado desde cero con pesos abiertos y hashes verificables, sirve como base reproducible para estudiar destilación de pasos, arquitecturas de difusión y codificadores de texto.
- Generación de contenido para marketing: banners, ilustraciones de blog o imágenes para redes sociales a 512 px, con la posibilidad de ampliar posteriormente mediante upscalers externos.
- Fine-tuning posterior: al estar en formato `diffusers` y con licencia Apache-2.0, se puede reentrenar o adaptar con LoRA sobre dominios específicos (estilo de marca, producto, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 15.5 GB en safetensors (transformer 1.3B + text encoder 2B + VAE). En fp16, el conjunto ronda los 7-8 GB de pesos; con overhead de activaciones y buffers de difusión, se estima un consumo de VRAM de aproximadamente 8-12 GB, aunque no se dispone de cifras oficiales publicadas.
- GPU recomendadas: no disponible de forma oficial. Por tamaño, cabría esperar funcionamiento en GPUs de consumo con 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090) y en GPUs de datacenter (A100, H100) para mayor throughput.
- ¿Cabe en consumer GPU? Probablemente sí en GPUs con 12 GB o más, aunque no hay confirmación oficial en la información proporcionada.
- Opciones de despliegue: `diffusers` (carga directa del pipeline), `libreyolo` con `LibreGen` (Python y CLI). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, que no están orientados a modelos de difusión.
- Latencia y throughput: no disponibles. La destilación a 8 pasos reduce el número de evaluaciones del transformer frente a pipelines de 50 pasos, pero no se publican tiempos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución nativa | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibrePRX512-sft-distilled | 1.3B (transformer) + 2B (text encoder) | 512 | 8 (destilado) | Apache-2.0 (PRX y VAE); Gemma Terms (text encoder) | Hugging Face, `diffusers`, `libreyolo` |
| FLUX.1 [schnell] | no disponible en la información | no disponible | no disponible | Apache-2.0 | Hugging Face, `diffusers` |
| Stable Diffusion (familia) | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face, `diffusers` |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a los datos declarados para PRX y a la licencia y disponibilidad conocidas de FLUX.1 [schnell] (cuyo VAE emplea PRX).

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: cualquier actualización o corrección debe provenir del repositorio upstream `Photoroom/prx-512-t2i-sft-distilled`.
- El codificador de texto T5Gemma 2B está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, que restringen ciertos usos aunque los pesos PRX sean Apache-2.0. Es necesario revisar ambas licencias antes de un uso comercial.
- Resolución nativa limitada a 512 píxeles: para aplicaciones que requieran mayor resolución será necesario un upscaler externo.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre tasas de alucinación visual (artefactos, incoherencias semánticas); se recomienda evaluación empírica en el dominio de uso.
- No se declaran idiomas soportados; el rendimiento multilingüe del codificador T5Gemma no está documentado en esta ficha.
- El repositorio no registra descargas ni likes, y la fecha de creación es muy reciente, por lo que la validación comunitaria es aún escasa.
- No se publican benchmarks ni métricas de calidad (FID, CLIP score, etc.) en la información disponible.
- La licencia Apache-2.0 aplica a los pesos PRX y al VAE; el uso del pipeline completo en producción debe cumplir simultáneamente las condiciones de Gemma para el text encoder.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LibreYOLO/LibrePRX512-sft-distilled
- Repositorio upstream: https://huggingface.co/Photoroom/prx-512-t2i-sft-distilled
- Anuncio de Photoroom: https://huggingface.co/blog/Photoroom/prx-open-source-t2i-model
- GitHub de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Documentación de LibreYOLO: https://www.libreyolo.com/docs
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
