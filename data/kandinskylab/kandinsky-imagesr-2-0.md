# kandinskylab/Kandinsky-ImageSR-2.0

## Resumen

Kandinsky ImageSR 2.0 es un modelo de superresolución de imágenes desarrollado por KandinskyLab, distribuido como un bundle de Diffusers listo para inferencia con `from_pretrained`. El modelo reutiliza el transformer de Kandinsky 5 y un único conjunto de pesos sirve tanto para el factor de escala x2 como para x4, lo que simplifica el despliegue en producción al evitar mantener dos checkpoints distintos.

La innovación principal es la eliminación del codificador de texto: el release emplea condicionamiento de texto cero "pre-horneado" (pre-baked zero-text conditioning), sustituyendo la torre de texto y las 50 capas de cross-attention por pequeñas tablas Safetensors por paso temporal. Esto reduce el coste computacional y la complejidad del grafo, manteniendo la calidad de reconstrucción. El modelo opera con un único paso de difusión calibrado mediante el parámetro `one_step_t`, con rangos de "creatividad" predefinidos para cada factor de escala.

Con aproximadamente 4.530 millones de parámetros y un repositorio de 10,5 GB, el modelo procesa la imagen por teselas de 1024 píxeles de salida, mezclando solapamientos con ventanas Hanning conscientes de los bordes. Es relevante para pipelines de restauración y ampliación de imágenes donde se necesita un modelo de pesos abiertos con licencia permisiva (MIT) y tiempos de inferencia medidos y reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (Kandinsky 5) con condicionamiento de texto cero pre-horneado; sin torre de texto ni cross-attention |
| Parametros totales | 4.529.059.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); procesa teselas de 1024 px de salida |
| Tipos de cuantizacion | bfloat16 documentado; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (modelo de imagen, sin entrada de texto) |
| Licencia | MIT (transformer y pipeline); VAE incluido bajo Apache-2.0 de `black-forest-labs/FLUX.1-schnell` |
| Formato de pesos | safetensors (bundle Diffusers) |

## Arquitectura y entrenamiento

El modelo se construye sobre el transformer de Kandinsky 5, integrado en Diffusers 0.41 o superior. La modificación clave respecto a un modelo de difusión texto-a-imagen convencional es la eliminación completa de la torre de texto y de las 50 capas de cross-attention, que se reemplazan por tablas Safetensors por paso temporal que codifican el condicionamiento de texto cero. El resultado es un modelo image-to-image puro que no acepta prompts y que ejecuta una única evaluación del transformer (one-step) calibrada con el parámetro `one_step_t`.

La inferencia se realiza por teselas de 1024 píxeles de salida con mezcla de solapamientos mediante ventanas Hanning conscientes de los bordes; las entradas pequeñas se rellenan por replicación y se recortan a la resolución exacta solicitada. El factor de escala se selecciona con `upscale_factor` (x2 o x4), y el valor `one_step_t` por defecto es 0,15 para x2 y 0,244 para x4, con rangos de "creatividad" calibrados de 0,07–0,30 (x2) y 0,17–0,38 (x4). El modelo solo admite los valores por defecto y los 18 valores de creatividad listados en su configuración; otros valores crudos de `one_step_t` no están soportados. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Superresolución de imágenes con factores de escala x2 y x4 usando un único conjunto de pesos.
- Reconstrucción y ampliación de imágenes hasta 8K (8192 × 8192) mediante procesamiento por teselas.
- Control de "creatividad" o intensidad de reconstrucción mediante niveles calibrados 0–8 para cada factor de escala.
- Procesamiento de entradas de cualquier resolución: relleno por replicación y recorte a la resolución exacta solicitada.
- Mezcla de solapamientos con ventanas Hanning conscientes de los bordes para evitar costuras entre teselas.
- Inferencia en un solo paso de difusión (one-step), sin sampler multi-paso.
- No soporta prompts de texto ni condicionamiento textual; no es un modelo de generación texto-a-imagen.

## Casos de uso

- Restauración de fotografías de archivo: el modelo puede ampliar imágenes históricas de baja resolución a x2 o x4 en un solo paso, con tiempos de 2,78 s para pasar de 1K a 2K en una H100, lo que permite procesar lotes grandes de digitalizaciones en pipelines nocturnos.
- Ampliación de material gráfico para impresión: partiendo de assets de 1K o 2K, el modelo genera salidas de 4K u 8K con teselado automático, adecuado para preparar imágenes para impresión de gran formato sin depender de servicios externos.
- Mejora de miniaturas y previews en plataformas de contenido: con licencia MIT y pesos abiertos, se puede integrar en el backend para regenerar versiones de alta resolución bajo demanda a partir de las miniaturas almacenadas.
- Restauración de imágenes médicas o de satélite de baja resolución: el procesamiento por teselas y el recorte exacto a la resolución solicitada permiten ampliar recortes de tamaño arbitrario manteniendo las dimensiones originales del recorte.
- Preprocesado para pipelines de visión por computador: ampliar imágenes de entrada antes de pasarlas a detectores o segmentadores que rinden mejor a mayor resolución, usando el modo x2 con `one_step_t` bajo para minimizar artefactos inventados.
- Generación de versiones de alta resolución en herramientas de diseño: el control de creatividad 0–8 permite al usuario elegir entre una ampliación fiel (niveles bajos) y una reconstrucción más agresiva (niveles altos) según el tipo de imagen.
- Procesamiento batch en infraestructura propia: al no requerir torre de texto ni cross-attention, el grafo es más ligero y el modelo puede desplegarse con el pipeline oficial de `kandinsky_image_sr` sobre GPUs de datacenter con bfloat16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (PSNR, SSIM, LPIPS) en la información disponible. Los únicos datos de rendimiento publicados son tiempos de inferencia medidos en una NVIDIA H100 80GB (SXM) con bfloat16, torch 2.13.0 (CUDA 12.9) y `tile_batch_size=1`, mediana de 5 llamadas completas tras 2 de calentamiento:

| Resolución de entrada | Escala | Resolución de salida | Rejilla de teselas | Tiempo por imagen |
|---|---|---|---|---|
| 1K (1024 × 1024) | x2 | 2K (2048 × 2048) | 3 × 3 | 2,78 s |
| 1K (1024 × 1024) | x4 | 4K (4096 × 4096) | 5 × 5 | 7,80 s |
| 2K (2048 × 2048) | x2 | 4K (4096 × 4096) | 5 × 5 | 7,84 s |
| 2K (2048 × 2048) | x4 | 8K (8192 × 8192) | 11 × 11 | 37,5 s |
| 4K (4096 × 4096) | x2 | 8K (8192 × 8192) | 11 × 11 | 37,7 s |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.529 millones de parámetros en bfloat16 (aproximadamente 9 GB de pesos) más activaciones y buffers de teselado, se requiere una GPU con al menos 16–24 GB para operar con comodidad, aunque el dato no está confirmado por el autor.
- GPU recomendadas: NVIDIA H100 80GB (SXM) es la referencia medida por el autor; GPUs de datacenter como A100 80GB son adecuadas por capacidad de memoria.
- Cabe en GPU de consumo: no confirmado; por tamaño de pesos en bfloat16, tarjetas con 24 GB (RTX 3090, RTX 4090) podrían alojar el modelo, pero no hay mediciones publicadas.
- Opciones de despliegue: pipeline oficial `KandinskyImageSRPipeline` del paquete `kandinsky_image_sr` (GitHub) sobre Diffusers 0.41 o superior; requiere torch compilado para la CUDA del driver. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son para modelos de lenguaje).
- Latencia y throughput: en H100, 2,78 s para 1K→2K (x2) y 7,80 s para 1K→4K (x4); 37,5 s para 2K→8K (x4). El throughput escala con el número de teselas, que crece de forma aproximadamente cuadrática con la resolución de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Escalas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky ImageSR 2.0 | 4.529 M | Difusión one-step, sin texto | x2, x4 | MIT (VAE Apache-2.0) | Hugging Face, GitHub, demo HF |
| Alternativas de superresolución | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (superresolución con pesos abiertos), por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No acepta prompts de texto: el condicionamiento textual está eliminado por diseño, por lo que no se puede guiar la reconstrucción con instrucciones.
- Solo admite los valores por defecto y los 18 valores de creatividad listados en su configuración; otros valores crudos de `one_step_t` no están soportados y pueden producir resultados no calibrados.
- Riesgo de alucinación visual: al ser un modelo generativo de difusión, puede inventar texturas o detalles plausibles que no estaban en la imagen original, especialmente en niveles altos de creatividad.
- Sesgos: no se documentan sesgos específicos en la información disponible; al no procesar texto, los sesgos semánticos de prompt no aplican, pero los sesgos del dataset de entrenamiento de imágenes pueden reflejarse en la reconstrucción.
- Limitaciones de idioma: no aplica entrada de texto; no se documentan limitaciones por idioma.
- Restricciones de licencia: el transformer y el pipeline son MIT, permisivos para uso comercial; el VAE incluido proviene de `black-forest-labs/FLUX.1-schnell` bajo Apache-2.0, cuyos términos deben respetarse por separado.
- El repositorio tiene muy pocas descargas (4) y ningún "like" en el momento de la consulta, lo que sugiere poca validación comunitaria; conviene evaluar la calidad en el dominio propio antes de producción.
- No se han publicado métricas de calidad objetivas (PSNR, SSIM, LPIPS) ni comparativas con alternativas, lo que dificulta justificar su elección frente a otros modelos de superresolución.
- El procesamiento por teselas puede introducir diferencias de nitidez o color entre teselas si la mezcla Hanning no se ajusta bien a imágenes con gradientes suaves o contenido repetitivo.

## Enlaces

- Hugging Face: https://huggingface.co/kandinskylab/Kandinsky-ImageSR-2.0
- GitHub: https://github.com/kandinskylab/kandinsky-image-sr
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-ImageSR-2.0-Demo
- Sitio de KandinskyLab: https://kandinskylab.ai/
- Script de reproducción de tiempos: https://github.com/kandinskylab/kandinsky-image-sr/blob/main/scripts/test.py
- VAE de origen (FLUX.1-schnell): https://huggingface.co/black-forest-labs/FLUX.1-schnell
