# briaai/Fibo-Edit

## Resumen

Fibo-Edit es un modelo de edición de imágenes desarrollado por Bria AI, presentado como una evolución de su línea Fibo orientada a tareas de image-to-image e inpainting. El modelo se distribuye a través de la librería `diffusers` con la pipeline específica `BriaFiboEditPipeline` y está diseñado para modificar imágenes existentes siguiendo instrucciones en lenguaje natural, manteniendo coherencia visual con la imagen de entrada. Cuenta con aproximadamente 8.280 millones de parámetros en formato safetensors y se publica bajo una licencia propia denominada `bria-fibo-edit`, con acceso restringido que requiere aceptar condiciones en Hugging Face.

El modelo aborda el problema de la edición controlada de imágenes en entornos profesionales, donde se necesita modificar regiones concretas o aplicar transformaciones globales sin regenerar la imagen completa. Su pipeline de image-to-image y las capacidades de inpainting lo sitúan en la categoría de modelos de difusión para edición, comparable a propuestas como InstructPix2Pix o las variantes de edición de FLUX y SDXL. La relevancia actual radica en la creciente demanda de herramientas de edición asistida por IA con licencias que permitan uso comercial bajo condiciones claras, algo que Bria AI ofrece mediante su esquema de licencia propia.

La información pública disponible es limitada: no se detallan la longitud de contexto (no aplica en el sentido de LLM, pero no se especifica la resolución máxima de imagen), los tipos de cuantización soportados ni los datos exactos de entrenamiento. El repositorio ocupa 57,3 GB y el modelo está etiquetado únicamente para inglés (`en`), lo que restringe las instrucciones de edición a ese idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para edición de imágenes (image-to-image / inpainting), pipeline `BriaFiboEditPipeline` en diffusers; detalles internos de la arquitectura no disponibles |
| Parametros totales | 8.285.836.848 (~8,28 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen; resolución máxima no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `bria-fibo-edit` (licencia propia de Bria AI, acceso restringido/gated) |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Por la categoría del modelo (edición de imágenes con pipeline `diffusers`) y el recuento de parámetros (~8,28 mil millones), se trata presumiblemente de un modelo de difusión, probablemente basado en un transformer de difusión (DiT) o en una arquitectura híbrida U-Net/transformer, aunque este extremo no se confirma en la información disponible. El modelo está etiquetado como `base_model:finetune:briaai/Fibo-Edit`, lo que sugiere que se trata de un ajuste fino sobre una versión base del mismo modelo, orientado específicamente a tareas de edición e inpainting.

No se han publicado en la información disponible el número de tokens o pasos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste por preferencias humanas. Tampoco se detallan innovaciones técnicas específicas como decodificación especulativa o mecanismos de atención lineal. El paper asociado (arXiv:2511.06876) es la referencia para obtener estos detalles, pero su contenido no está incluido en la información proporcionada.

## Capacidades

- Edición de imágenes guiada por instrucciones en lenguaje natural (image-to-image), modificando la imagen de entrada según una descripción textual.
- Inpainting: relleno o sustitución de regiones concretas de una imagen preservando el contexto circundante.
- Integración nativa con la librería `diffusers` mediante la pipeline `BriaFiboEditPipeline`, lo que facilita su uso en flujos de trabajo Python existentes.
- Soporte de instrucciones únicamente en inglés.
- No se especifican capacidades de tool calling, function calling, agentes o razonamiento multi-paso (no aplicables a un modelo de edición de imágenes).
- No se documentan capacidades de visión general, audio o modo "thinking"; el modelo está especializado en edición visual.

## Casos de uso

- Edición de producto en comercio electrónico: sustituir fondos, eliminar objetos no deseados o ajustar la iluminación de fotografías de catálogo mediante instrucciones en inglés, manteniendo la coherencia del producto original gracias al enfoque image-to-image.
- Retoque fotográfico profesional: aplicar inpainting para eliminar imperfecciones, objetos o personas en fotografías, integrándose en pipelines de `diffusers` para automatizar lotes de imágenes.
- Creación de variaciones de material gráfico: generar versiones editadas de ilustraciones o assets de marketing a partir de una imagen base y una instrucción textual, reduciendo el tiempo de producción frente a la regeneración completa.
- Previsualización de cambios en diseño: permitir a diseñadores probar modificaciones sobre una imagen existente (cambiar colores, añadir o quitar elementos) antes de comprometerse con una edición manual.
- Restauración y limpieza de imágenes: rellenar zonas dañadas o eliminar marcas de agua y artefactos mediante inpainting, siempre que se respeten las condiciones de la licencia `bria-fibo-edit`.
- Automatización de flujos de edición en producción: al estar disponible en `diffusers` con pesos safetensors, puede integrarse en servicios de edición por lotes desplegados en infraestructura con GPU, aplicando instrucciones estandarizadas en inglés.
- Investigación en edición de imágenes: servir como referencia o baseline para comparar métodos de edición guiada por texto, dado su tamaño (~8,28 B de parámetros) y su disponibilidad en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~8,28 mil millones de parámetros en precisión completa (fp32), el peso del modelo ronda los 33 GB; en fp16/bf16 se sitúa en torno a 16,5 GB, y en cuantizaciones de 8 bits podría reducirse a ~8-9 GB, aunque no se confirman tipos de cuantización soportados.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 24 GB de VRAM (RTX 4090, A10G, L4 con cuantización) sería el mínimo razonable en fp16; para fp32 se necesitarían GPUs de 40-80 GB (A100, H100).
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) en fp16, y posible en GPUs de 16 GB con cuantización, aunque no hay confirmación oficial.
- Opciones de despliegue: `diffusers` (pipeline `BriaFiboEditPipeline`) es la vía documentada. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLMs, no aplicables directamente a este modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Fibo-Edit (briaai) | ~8,28 B | Edición image-to-image / inpainting | Inglés | `bria-fibo-edit` (propia) | Restringido (gated) |
| InstructPix2Pix | No disponible en la información | Edición guiada por instrucciones | Inglés | No disponible en la información | Público |
| FLUX.1 Kontext (variantes de edición) | No disponible en la información | Edición image-to-image | No disponible en la información | No disponible en la información | No disponible en la información |
| SDXL Inpainting | No disponible en la información | Inpainting | No disponible en la información | No disponible en la información | Público |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar las condiciones de la licencia `bria-fibo-edit` en Hugging Face antes de descargarlo.
- Licencia propia: las restricciones de uso comercial dependen de los términos de `bria-fibo-edit`, que no se detallan en la información disponible; es imprescindible revisarlos antes de un uso en producción.
- Idioma: las instrucciones de edición solo están soportadas en inglés, lo que limita su uso en castellano u otros idiomas sin traducción previa.
- Sesgos: no se documentan sesgos conocidos, pero al ser un modelo de generación visual entrenado con datos no especificados, puede reproducir sesgos presentes en dichos datos (representación, estilos, etc.).
- Alucinación visual: como modelo generativo, puede introducir elementos no solicitados o alterar regiones no deseadas de la imagen; no se han publicado métricas de fidelidad en la información disponible.
- Limitaciones de resolución y contexto: no se especifica la resolución máxima de imagen soportada ni el tamaño de las regiones de inpainting.
- Falta de documentación técnica: no se detallan datos de entrenamiento, cuantizaciones soportadas ni benchmarks, lo que dificulta evaluar su rendimiento frente a alternativas.
- Requisitos de hardware: con ~8,28 B de parámetros, la inferencia en fp32 requiere GPUs de gama alta (40-80 GB); en fp16 es viable en GPUs de 24 GB, pero no hay confirmación oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/briaai/Fibo-Edit
- Paper: https://arxiv.org/abs/2511.06876
- Librería diffusers: https://github.com/huggingface/diffusers
- Documentación de la pipeline `BriaFiboEditPipeline`: no disponible en la información proporcionada
- Blog o demo oficial de Bria AI sobre Fibo-Edit: no disponible en la información proporcionada
