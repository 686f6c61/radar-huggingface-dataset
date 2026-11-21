# black-forest-labs/FLUX.2-dev

## Resumen

FLUX.2-dev es un modelo de generación y edición de imágenes desarrollado por Black Forest Labs, la empresa detrás de la familia FLUX.1. Se publica como un modelo de difusión en formato diffusers, con pesos en safetensors y un total de 32.223.281.152 parámetros, lo que lo sitúa en la gama alta de los modelos de imagen open weights. Su pipeline principal es image-to-image, aunque los tags indican soporte tanto de generación desde texto como de edición de imagen existente.

El modelo llega como evolución de FLUX.1 con el objetivo de mejorar la fidelidad, el control sobre la imagen de entrada y la calidad de edición en escenarios de producción. Es relevante ahora porque combina un tamaño de parámetros considerable con una integración nativa en el ecosistema diffusers (clase `Flux2Pipeline`), lo que facilita su adopción en pipelines existentes de generación de imágenes.

La principal advertencia es la licencia: se distribuye bajo la flux-non-commercial-license, es decir, no permite uso comercial sin acuerdo adicional con Black Forest Labs. Además, el acceso está restringido (gated) y requiere aceptar las condiciones en Hugging Face. El repositorio ocupa 177,6 GB, lo que refleja la presencia de múltiples variantes de pesos y componentes auxiliares (VAE, text encoders, etc.).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusión (familia FLUX), pipeline `Flux2Pipeline` en diffusers |
| Parametros totales | 32.223.281.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repo incluye safetensors en precisión completa y variantes single-file |
| Idiomas soportados | no disponible; los tags indican `en` para prompts |
| Licencia | flux-non-commercial-license |
| Formato de pesos | safetensors (y variantes diffusion-single-file) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su naturaleza como modelo de difusión de la familia FLUX, integrado en diffusers mediante `Flux2Pipeline`. El recuento de 32.223.281.152 parámetros corresponde al conjunto de pesos publicados en safetensors e incluye los componentes habituales de un pipeline de difusión (denoiser, VAE y codificadores de texto), aunque el desglose por componente no se especifica en los datos proporcionados.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas (atención, decodificación especulativa, etc.) en la información facilitada. Tampoco se documentan aquí detalles sobre el proceso de destilación o ajuste fino que diferencien a FLUX.2-dev de FLUX.1. Cualquier afirmación adicional sobre el entrenamiento sería especulativa y no se incluye.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image), según los tags del modelo.
- Edición de imágenes existentes (image-to-image), que es el pipeline declarado principal.
- Soporte de variantes single-file para despliegue simplificado en flujos que no usan la estructura completa de diffusers.
- Integración nativa con la librería diffusers mediante `Flux2Pipeline`.
- Prompts en inglés (`en` en los tags); no se documenta soporte multilingüe.
- No se documenta en la información disponible soporte de tool calling, agentes, razonamiento multi-paso, visión de entrada para VQA, audio ni modo thinking.

## Casos de uso

- Edición de imágenes en estudio de diseño: el pipeline image-to-image permite partir de un boceto o fotografía y aplicar transformaciones guiadas por prompt, manteniendo la estructura de la imagen de entrada; adecuado por su condición de modelo de edición de gama alta con 32.200 millones de parámetros.
- Retoque y variaciones de producto en e-commerce: generar variantes de una fotografía de producto (fondos, iluminación, ángulos) a partir de una imagen base, reduciendo la necesidad de sesiones fotográficas adicionales.
- Creación de material gráfico para prototipos: generar imágenes de referencia para mockups de interfaces, ilustraciones conceptuales o moodboards en fases tempranas de diseño.
- Previsualización de conceptos en animación y videojuegos: producir concept art y variaciones visuales a partir de referencias existentes antes de pasar a producción 3D.
- Investigación en modelos generativos: servir como base para experimentos de edición, control de imagen y evaluación de técnicas de difusión, dado su tamaño y su disponibilidad en safetensors dentro de diffusers.
- Automatización de pipelines creativos internos: integrar `Flux2Pipeline` en herramientas propias de generación por lotes para equipos de marketing o contenido, siempre que el uso encaje en la licencia no comercial.
- Restauración y transformación estilística de imágenes: usar image-to-image para reestilizar fotografías o adaptar material visual a una guía de estilo concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial en la información proporcionada. Con 32.223.281.152 parámetros, la inferencia en precisión completa (fp16/bf16) requiere del orden de decenas de GB de VRAM solo para el denoiser, a lo que se suman VAE y codificadores de texto; se recomienda planificar con margen amplio y considerar cuantización u offloading.
- GPU recomendadas: no especificadas por el autor en la información disponible. Por tamaño, cabe esperar que requiera GPUs de centro de datos (A100, H100) o GPUs consumer de gama alta con suficiente VRAM; no hay confirmación oficial.
- ¿Cabe en GPU consumer?: no confirmado. El tamaño del modelo y el repositorio de 177,6 GB sugieren que la inferencia completa en consumer requiere cuantización u offloading de componentes.
- Opciones de despliegue: diffusers (pipeline oficial `Flux2Pipeline`), variantes single-file para otros runners; no se documentan aquí integraciones específicas con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a difusión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos comparables de la misma generación. A continuación se indica la comparación cualitativa posible según categoría y licencia:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FLUX.2-dev (este modelo) | 32.223.281.152 | no aplica (imagen) | flux-non-commercial-license | gated en Hugging Face |
| FLUX.1 (familia) | no disponible en esta ficha | no aplica | varía según variante (dev/schnell/pro) | Hugging Face / API |
| Alternativas open weights de generación de imagen | no disponible | no aplica | varía | varía |

No se dispone de datos de rendimiento comparado (FID, CLIP score, evaluaciones humanas) en la información facilitada, por lo que no se establece una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no comercial: la flux-non-commercial-license impide el uso comercial sin acuerdo con Black Forest Labs; verificar términos antes de cualquier despliegue en producto.
- Acceso restringido: requiere aceptar condiciones en Hugging Face; no es descarga anónima.
- Idioma: los tags indican únicamente `en`; el rendimiento con prompts en castellano u otros idiomas no está documentado.
- Tamaño: 32.223.281.152 parámetros y un repositorio de 177,6 GB implican requisitos de almacenamiento y VRAM elevados.
- Riesgo de sesgos y alucinaciones visuales: no documentado en la información disponible; como todo modelo generativo, puede producir contenido inexacto o no fiel al prompt.
- Sin datos públicos de benchmarks en la información proporcionada: no es posible validar cuantitativamente su calidad frente a alternativas.
- No se documentan limitaciones específicas de contexto, resolución máxima ni restricciones de contenido más allá de la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/black-forest-labs/FLUX.2-dev
- Black Forest Labs (sitio del desarrollador): no disponible en la información proporcionada
- Paper técnico: no disponible en la información proporcionada
- Blog oficial: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
